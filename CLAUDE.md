# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`monofly` is a pnpm + Turborepo monorepo for the `@monofly/*` design-system ecosystem. The central idea is a one-directional pipeline:

```
Figma (SDS variables/styles) → @monofly/tokens (CSS custom props) → @monofly/ui (Tailwind v4 @theme) → consumer app
```

Each layer is meant to be validated independently before the next is built. Only `@monofly/tokens`, `@monofly/ui`, and `apps/playground` have real content today; `packages/blocks` and `apps/docs` are intentional empty placeholders for planned packages (`core`, `blocks`, `react`). See `.box/NOTES.md` for the original commit-by-commit build plan and target dependency graph.

## Commands

Run from the repo root (Turbo orchestrates per-package tasks and respects the dependency graph via `dependsOn: ["^build"]`):

```bash
pnpm build      # turbo run build — builds tokens before ui/playground
pnpm test       # turbo run test
pnpm dev        # turbo run dev — persistent watchers (vite, tsup --watch)
```

Per-package work uses pnpm filters:

```bash
pnpm --filter @monofly/tokens build       # tsup → dist (esm + cjs + d.ts)
pnpm --filter @monofly/tokens test        # vitest run
pnpm --filter @monofly/tokens exec vitest run src/color.test.ts   # single test file
pnpm --filter @monofly/tokens exec vitest -t "exposes brand tokens"  # single test by name
pnpm --filter @monofly/playground dev     # vite dev server
```

There is no lint task wired up yet despite `.box/NOTES.md` mentioning one.

## Regenerating tokens from Figma

The large generated stylesheet is produced by `packages/tokens/scripts/app.mjs`, run via the package scripts (they `cd scripts` and load `../../../.env`):

```bash
pnpm --filter @monofly/tokens script:tokens:rest   # fetch variables + styles via Figma REST API, then generate
pnpm --filter @monofly/tokens script:tokens        # regenerate from committed scripts/tokens.json + styles.json (no API call)
```

Both require `.env` at the repo root with `FIGMA_ACCESS_TOKEN` and `FIGMA_FILE_KEY` (gitignored). The `:rest` variant overwrites `scripts/tokens.json` and `scripts/styles.json` from Figma; the non-`:rest` variant reuses those files, so you can author them by hand or via the example Figma plugins in `scripts/figma-plugin-*/` when you lack Variables REST API access. See `packages/tokens/scripts/README.md`.

`app.mjs` writes generated output to `packages/tokens/theme.css` and also emits `scripts/tokenVariableSyntaxAndDescriptionSnippet.js` — a snippet you paste into the Figma JS console to push CSS-matching `codeSyntax`/descriptions back onto the variables.

## Architecture notes / gotchas

**Two parallel token representations that are NOT auto-synced:**

1. **TypeScript source** — `packages/tokens/src/{color,spacing,typography}.ts`, hand-authored, re-exported from `index.ts`, built by tsup into `dist/`. This is the JS-importable API (`import { spacing } from "@monofly/tokens"`).
2. **CSS custom properties** — two separate files:
   - `tokens.css` — a tiny (6-line) hand-maintained file with the proven `--mon-color-primary`, `--mon-color-secondary`, `--mon-space-*` tokens. **This is what `@monofly/ui` actually imports.**
   - `theme.css` — the large (~525-line) full export auto-generated from Figma by `app.mjs`. It is the complete token set but is **not yet wired into `@monofly/ui`**.

   Editing a value in `src/color.ts` does not change `tokens.css`/`theme.css` or vice versa. Keep them in sync manually when it matters.

**CSS variable prefix is `--mon-`** (set by `TOKEN_PREFIX = "mon-"` in `app.mjs`). Note that `.box/NOTES.md` and the comment block in `packages/ui/styles/theme.css` still reference the older `--mf-` prefix — those are stale; the live prefix is `--mon-`.

**The token → Tailwind bridge** lives in `packages/ui/styles/theme.css`. It `@import`s Tailwind v4 and `@monofly/tokens/tokens.css`, then maps `--mon-*` tokens into Tailwind's `@theme` namespaces (e.g. `--color-primary: var(--mon-color-primary)`), which is what lets a consumer write `bg-primary` / `p-md` and have it resolve back to the token source. `@monofly/ui` ships only `styles/` (no JS); Shadcn components are planned but not yet added.

**The playground is a pure-CSS smoke test.** `apps/playground/src/main.ts` only imports `index.css`, which imports `@monofly/ui/styles/theme.css`. It exists to prove the tokens→tailwind→consumer chain works end to end with no framework. Tailwind runs via `@tailwindcss/vite`.

## Conventions

- **Package manager is pnpm** (`packageManager: pnpm@11.7.0`); internal deps use `workspace:*`.
- **Shared dependency versions** are centralized in the `catalog:` block of `pnpm-workspace.yaml` — packages reference `"catalog:"` instead of pinning versions. Add/bump shared versions there.
- **TypeScript** configs extend `tsconfig.base.json` (ES2022, ESNext modules, Bundler resolution, `strict`).
- **Build tool for libraries is tsup**; apps use Vite.
