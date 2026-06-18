// Adapter: Tokens Studio plugin exports -> the schema app.mjs already understands.
//
// The original pipeline (fromFigma.mjs) targets Figma's Variables REST API shape.
// When scripts/tokens.json / scripts/styles.json are produced by the Tokens Studio
// ("Figma Tokens") plugin instead, they have a different shape. These helpers
// normalize that export so app.mjs's CSS generation can run unchanged.
//
//  - variables file: keys are "Collection/Mode" (+ $themes/$metadata); leaves use
//    value/type/description; aliases are bare "{Group.Name}" (no collection prefix).
//  - styles file: a single token set (usually under a "" key) holding typography
//    styles, box-shadow effects, and helper scales (fontSize/lineHeights/...).
//
// We re-emit variables in the legacy "@collection" shape (modes folded into each
// token via $extensions[namespace].modes, aliases re-qualified) and emit the
// styles CSS directly (Tokens Studio styles don't carry the figmaId bindings the
// REST styles processor relies on).

const NAMESPACE_DEFAULT = "com.figma.sds";

/** Collection / mode name -> lower_snake (matches fromFigma.mjs sanitizeName). */
function sanitizeName(name) {
  return String(name)
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .replace(/ +/g, "_")
    .toLowerCase();
}

/** Token path segment -> lower-hyphen (matches fromFigma.mjs tree key building). */
function sanitizeSegment(name) {
  return String(name)
    .split(/[^\dA-Za-z]+/)
    .filter(Boolean)
    .join("-")
    .toLowerCase();
}

/** A node is a token leaf when it carries a primitive `value` and a string `type`. */
function isLeaf(node) {
  return (
    node &&
    typeof node === "object" &&
    !Array.isArray(node) &&
    "value" in node &&
    "type" in node &&
    typeof node.type === "string"
  );
}

/** Walk a Tokens Studio token tree, calling cb(segments, leaf) for each leaf. */
function walkLeaves(node, segments, cb) {
  if (!node || typeof node !== "object") return;
  if (isLeaf(node)) {
    cb(segments, node);
    return;
  }
  for (const key of Object.keys(node)) {
    if (key.startsWith("$")) continue;
    walkLeaves(node[key], [...segments, key], cb);
  }
}

/** True when a parsed variables file is in Tokens Studio shape (not the @-prefixed legacy shape). */
export function isTokensStudioVariables(data) {
  if (!data || typeof data !== "object") return false;
  return Object.keys(data).some(
    (k) => k === "$themes" || k === "$metadata" || k.includes("/"),
  );
}

/** True when a parsed styles file is in Tokens Studio shape (legacy styles are an array). */
export function isTokensStudioStyles(data) {
  return !Array.isArray(data) && data && typeof data === "object";
}

/**
 * Convert a Tokens Studio variables export into the legacy "@collection" schema
 * that app.mjs's processTokenJSON consumes.
 * @param {Object} data - parsed scripts/tokens.json (Tokens Studio shape)
 * @param {string} namespace - extensions namespace app.mjs reads (NAMESPACE in app.mjs)
 */
export function tokensStudioToVariablesJSON(data, namespace = NAMESPACE_DEFAULT) {
  // 1. Group "Collection/Mode" sets by collection, preserving file order (first = default mode).
  const collections = {}; // collectionName -> [{ modeName, tree }]
  for (const key of Object.keys(data)) {
    if (key.startsWith("$")) continue;
    const slash = key.indexOf("/");
    const collectionName = slash === -1 ? key : key.slice(0, slash);
    const modeName = slash === -1 ? "default" : key.slice(slash + 1);
    (collections[collectionName] = collections[collectionName] || []).push({
      modeName,
      tree: data[key],
    });
  }

  // 2. Index every leaf's dotted path (original case) -> collection, for alias re-qualification.
  const pathToCollection = {};
  for (const collectionName of Object.keys(collections)) {
    for (const { tree } of collections[collectionName]) {
      walkLeaves(tree, [], (segs) => {
        pathToCollection[segs.join(".")] = collectionName;
      });
    }
  }

  // Re-qualify a bare "{Group.Name}" alias as "{@collection.Group.Name}" (app.mjs
  // lowercases/hyphenates the inner path itself, so we keep it original-case here).
  const qualify = (value) => {
    if (
      typeof value !== "string" ||
      !value.startsWith("{") ||
      !value.endsWith("}")
    )
      return value;
    const inner = value.slice(1, -1);
    const collectionName = pathToCollection[inner];
    if (!collectionName) return value; // leave dangling refs visible rather than guess
    return `{@${sanitizeName(collectionName)}.${inner}}`;
  };

  // 3. Build one legacy node per collection, folding modes into each leaf.
  const out = {};
  for (const collectionName of Object.keys(collections)) {
    const collectionKey = `@${sanitizeName(collectionName)}`;
    const node = {};
    collections[collectionName].forEach(({ modeName, tree }, modeIndex) => {
      const modeKey = sanitizeName(modeName);
      walkLeaves(tree, [], (segs, leaf) => {
        const sanSegs = segs.map(sanitizeSegment);
        let cur = node;
        for (let i = 0; i < sanSegs.length - 1; i++) {
          cur[sanSegs[i]] = cur[sanSegs[i]] || {};
          cur = cur[sanSegs[i]];
        }
        const last = sanSegs[sanSegs.length - 1];
        const leafNode = (cur[last] = cur[last] || {});
        const value = qualify(leaf.value);
        leafNode.$type = leaf.type;
        if (leaf.description != null && leaf.description !== "")
          leafNode.$description = leaf.description;
        leafNode.$extensions = leafNode.$extensions || {
          [namespace]: {
            figmaId: `${collectionKey}.${segs.join(".")}`,
            modes: {},
          },
        };
        leafNode.$extensions[namespace].modes[modeKey] = value;
        if (modeIndex === 0) leafNode.$value = value; // default mode
      });
    });
    out[collectionKey] = node;
  }
  return out;
}

// ----- Styles ------------------------------------------------------------

const WEIGHT_NAME_TO_NUMBER = {
  thin: 100,
  "extra light": 200,
  extralight: 200,
  light: 300,
  regular: 400,
  normal: 400,
  medium: 500,
  "semi bold": 600,
  semibold: 600,
  bold: 700,
  "extra bold": 800,
  extrabold: 800,
  black: 900,
};

function familyWithFallback(family) {
  const f = String(family);
  if (/mono/i.test(f)) return `"${f}", monospace`;
  if (/serif/i.test(f) && !/sans/i.test(f)) return `"${f}", serif`;
  return `"${f}", sans-serif`;
}

/**
 * Emit the `/* styles *\/` CSS block (font shorthands + box-shadow effects) from a
 * Tokens Studio styles export. Mirrors the output contract of app.mjs's processStyleJSON.
 * @param {Object} data - parsed scripts/styles.json (Tokens Studio shape)
 * @param {string} prefix - CSS custom property prefix (TOKEN_PREFIX in app.mjs, e.g. "mon-")
 * @param {boolean} convertToRem - convert px font sizes to rem
 * @returns {string[]} CSS lines
 */
export function tokensStudioStylesToCSS(data, prefix = "mon-", convertToRem = true) {
  // Styles may sit at the top level or be wrapped in a token set (conventionally
  // keyed ""). References are set-relative, so resolve against both the root and
  // any "" set; walk the whole object (empty set-name segments are dropped later).
  const bases = [data];
  if (data && typeof data[""] === "object" && data[""] !== null) bases.push(data[""]);

  // Resolve a "{a.b.c}" reference (or literal) against the styles set, recursively.
  const resolveRef = (value, seen = new Set()) => {
    if (typeof value !== "string" || !value.startsWith("{") || !value.endsWith("}"))
      return value;
    const inner = value.slice(1, -1);
    if (seen.has(inner)) return value;
    seen.add(inner);
    for (const base of bases) {
      let cur = base;
      let ok = true;
      for (const seg of inner.split(".")) {
        if (cur && typeof cur === "object" && seg in cur) cur = cur[seg];
        else {
          ok = false;
          break;
        }
      }
      if (ok && isLeaf(cur)) return resolveRef(cur.value, seen);
    }
    return undefined; // unresolved
  };

  const toWeightAndStyle = (rawWeight) => {
    const resolved = resolveRef(rawWeight);
    if (resolved == null) return { weight: "400", style: "normal" };
    if (typeof resolved === "number") return { weight: String(resolved), style: "normal" };
    const name = String(resolved).trim();
    if (/italic/i.test(name)) {
      const base = name.replace(/italic/i, "").trim().toLowerCase();
      return { weight: String(WEIGHT_NAME_TO_NUMBER[base] || 400), style: "italic" };
    }
    return {
      weight: String(WEIGHT_NAME_TO_NUMBER[name.toLowerCase()] || name),
      style: "normal",
    };
  };

  const toFontSize = (rawSize) => {
    const resolved = resolveRef(rawSize);
    if (resolved == null) return "1rem";
    if (typeof resolved === "number")
      return convertToRem ? `${resolved / 16}rem` : `${resolved}px`;
    return String(resolved);
  };

  const sanitizeStyleName = (segments) =>
    segments
      .filter(Boolean)
      .map((s) => sanitizeSegment(s))
      .filter(Boolean)
      .join("-");

  const formatShadow = (shadow) => {
    const inset = shadow.type === "innerShadow" ? "inset " : "";
    return `${inset}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
  };

  const text = [];
  const effects = [];

  const visit = (node, segments) => {
    if (!node || typeof node !== "object") return;
    if (isLeaf(node)) {
      const name = sanitizeStyleName(segments);
      if (!name) return;
      if (node.type === "typography" && node.value && typeof node.value === "object") {
        const v = node.value;
        const family = resolveRef(v.fontFamily);
        const { weight, style } = toWeightAndStyle(v.fontWeight);
        const size = toFontSize(v.fontSize);
        const lineHeight = resolveRef(v.lineHeight);
        const sizePart = lineHeight != null ? `${size}/${lineHeight}` : size;
        const familyPart = family != null ? familyWithFallback(family) : `sans-serif`;
        text.push(`--${prefix}font-${name}: ${style} ${weight} ${sizePart} ${familyPart};`);
      } else if (node.type === "boxShadow") {
        const value = node.value;
        const shadows = (Array.isArray(value) ? value : [value]).filter(Boolean);
        if (shadows.length)
          effects.push(
            `--${prefix}effects-shadows-${name}: ${shadows.map(formatShadow).join(", ")};`,
          );
      }
      // other leaf types (fontSize/lineHeights/weights/etc.) are helper scales — skip.
      return;
    }
    for (const key of Object.keys(node)) {
      if (key.startsWith("$")) continue;
      visit(node[key], [...segments, key]);
    }
  };

  visit(data, []);

  return ["/* styles */", ":root {", "  " + [...text, ...effects].join("\n  "), "}"];
}
