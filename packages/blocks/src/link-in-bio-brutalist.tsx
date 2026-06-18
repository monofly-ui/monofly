/**
 * Brutalist link-in-bio — a self-contained @monofly/blocks demo.
 *
 * Like `layout-components.html`, this renders faithfully on its own: the design
 * tokens are inlined as CSS custom properties so the block can be dropped into
 * any React 19 app without the @monofly/ui → Tailwind bridge wired up yet.
 *
 * Aesthetic: neo-brutalism. Thick ink borders, hard (blur-free) offset shadows,
 * one loud accent, oversized uppercase type, and buttons that physically
 * "press" — the shadow collapses as the element shifts into it.
 */

type LinkItem = {
  label: string;
  href: string;
  /** Short kicker shown above the label, e.g. "NEW" or "↗ EXTERNAL". */
  tag?: string;
};

type SocialItem = {
  /** 2–3 char brutalist glyph/initials, e.g. "TW", "GH". */
  short: string;
  label: string;
  href: string;
};

export type LinkInBioBrutalistProps = {
  name?: string;
  handle?: string;
  bio?: string;
  avatarUrl?: string;
  available?: boolean;
  links?: LinkItem[];
  socials?: SocialItem[];
};

const DEFAULT_LINKS: LinkItem[] = [
  { tag: "NEW", label: "Read the manifesto", href: "#" },
  { tag: "↗ EXTERNAL", label: "Latest project — monofly", href: "#" },
  { label: "Newsletter / no spam, ever", href: "#" },
  { label: "Book a 30-min call", href: "#" },
  { tag: "SHOP", label: "Buy the poster set", href: "#" },
];

const DEFAULT_SOCIALS: SocialItem[] = [
  { short: "TW", label: "Twitter", href: "#" },
  { short: "IG", label: "Instagram", href: "#" },
  { short: "GH", label: "GitHub", href: "#" },
  { short: "YT", label: "YouTube", href: "#" },
];

const CSS = `
.bib {
  /* tokens, inlined for standalone fidelity */
  --bib-ink: #0a0a0a;
  --bib-paper: #f4f1e9;
  --bib-accent: #ffd400;
  --bib-accent-2: #ff4d2e;
  --bib-border: 3px;
  --bib-shadow: 6px 6px 0 var(--bib-ink);
  --bib-shadow-press: 0px 0px 0 var(--bib-ink);

  box-sizing: border-box;
  min-height: 100%;
  display: flex;
  justify-content: center;
  padding: clamp(1rem, 4vw, 4rem) 1rem;
  background-color: var(--bib-paper);
  /* faint engineering grid — a brutalist staple */
  background-image:
    linear-gradient(to right, rgba(10,10,10,0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(10,10,10,0.06) 1px, transparent 1px);
  background-size: 24px 24px;
  color: var(--bib-ink);
  font-family: "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.bib *,
.bib *::before,
.bib *::after { box-sizing: inherit; }

.bib-card {
  width: 100%;
  max-width: 30rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border: var(--bib-border) solid var(--bib-ink);
  background: var(--bib-paper);
  box-shadow: var(--bib-shadow);
  padding: clamp(1.25rem, 5vw, 2rem);
}

.bib-header {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: center;
}
.bib-avatar {
  width: 84px;
  height: 84px;
  border: var(--bib-border) solid var(--bib-ink);
  background: var(--bib-accent);
  box-shadow: var(--bib-shadow);
  object-fit: cover;
  display: block;
  transform: rotate(-3deg);
}
.bib-id { min-width: 0; }
.bib-name {
  margin: 0;
  font-size: clamp(1.75rem, 8vw, 2.75rem);
  font-weight: 900;
  line-height: 0.92;
  letter-spacing: -0.04em;
  text-transform: uppercase;
}
.bib-handle {
  display: inline-block;
  margin-top: 0.4rem;
  padding: 0.1rem 0.4rem;
  background: var(--bib-ink);
  color: var(--bib-paper);
  font-family: "Courier New", monospace;
  font-size: 0.8rem;
  letter-spacing: 0.02em;
}

.bib-badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.6rem;
  border: var(--bib-border) solid var(--bib-ink);
  background: var(--bib-accent-2);
  color: var(--bib-paper);
  font-family: "Courier New", monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transform: rotate(2deg);
}
.bib-badge[data-on="false"] { background: var(--bib-ink); }
.bib-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--bib-paper);
  box-shadow: 0 0 0 2px var(--bib-ink);
}

.bib-bio {
  margin: 0;
  font-size: 1rem;
  line-height: 1.35;
  font-weight: 500;
}
.bib-rule {
  height: var(--bib-border);
  background: var(--bib-ink);
  border: 0;
  margin: 0;
}

.bib-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.bib-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.95rem 1rem;
  border: var(--bib-border) solid var(--bib-ink);
  background: var(--bib-paper);
  box-shadow: var(--bib-shadow);
  color: var(--bib-ink);
  font-weight: 800;
  font-size: 1.05rem;
  text-decoration: none;
  letter-spacing: -0.01em;
  transition: transform 80ms steps(2, end), box-shadow 80ms steps(2, end),
    background-color 80ms;
}
.bib-link:hover { background: var(--bib-accent); transform: translate(3px, 3px); box-shadow: 3px 3px 0 var(--bib-ink); }
.bib-link:active { transform: translate(6px, 6px); box-shadow: var(--bib-shadow-press); }
.bib-link:focus-visible { outline: var(--bib-border) solid var(--bib-accent-2); outline-offset: 3px; }
.bib-link-main { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
.bib-link-tag {
  font-family: "Courier New", monospace;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.bib-link-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bib-arrow { font-size: 1.3rem; line-height: 1; flex: none; }

.bib-socials {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.6rem;
}
.bib-social {
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border: var(--bib-border) solid var(--bib-ink);
  background: var(--bib-paper);
  box-shadow: 4px 4px 0 var(--bib-ink);
  color: var(--bib-ink);
  font-family: "Courier New", monospace;
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  transition: transform 80ms steps(2, end), box-shadow 80ms steps(2, end),
    background-color 80ms;
}
.bib-social:hover { background: var(--bib-ink); color: var(--bib-paper); transform: translate(2px, 2px); box-shadow: 2px 2px 0 var(--bib-ink); }
.bib-social:active { transform: translate(4px, 4px); box-shadow: 0 0 0 var(--bib-ink); }
.bib-social:focus-visible { outline: var(--bib-border) solid var(--bib-accent-2); outline-offset: 3px; }

.bib-footer {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: "Courier New", monospace;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.bib-footer b { font-weight: 700; }

@media (prefers-reduced-motion: reduce) {
  .bib-link, .bib-social { transition: background-color 80ms; }
}
`;

export default function LinkInBioBrutalist({
  name = "JANE DOE",
  handle = "@jane.builds",
  bio = "Designer-engineer making loud interfaces. Currently shipping a design system in public.",
  avatarUrl,
  available = true,
  links = DEFAULT_LINKS,
  socials = DEFAULT_SOCIALS,
}: LinkInBioBrutalistProps) {
  return (
    <div className="bib">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <main className="bib-card">
        <span className="bib-badge" data-on={String(available)}>
          <span className="bib-dot" aria-hidden="true" />
          {available ? "Available for work" : "Booked out"}
        </span>

        <header className="bib-header">
          {avatarUrl ? (
            <img className="bib-avatar" src={avatarUrl} alt={`${name} avatar`} />
          ) : (
            <div
              className="bib-avatar"
              role="img"
              aria-label={`${name} avatar`}
            />
          )}
          <div className="bib-id">
            <h1 className="bib-name">{name}</h1>
            <span className="bib-handle">{handle}</span>
          </div>
        </header>

        <p className="bib-bio">{bio}</p>
        <hr className="bib-rule" />

        <nav aria-label="Links">
          <ul className="bib-links">
            {links.map((link, i) => (
              <li key={`${link.href}-${i}`}>
                <a className="bib-link" href={link.href}>
                  <span className="bib-link-main">
                    {link.tag ? (
                      <span className="bib-link-tag">{link.tag}</span>
                    ) : null}
                    <span className="bib-link-label">{link.label}</span>
                  </span>
                  <span className="bib-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="bib-socials">
          {socials.map((social) => (
            <li key={social.href + social.short} style={{ display: "contents" }}>
              <a
                className="bib-social"
                href={social.href}
                aria-label={social.label}
                title={social.label}
              >
                {social.short}
              </a>
            </li>
          ))}
        </ul>

        <footer className="bib-footer">
          <span>
            © {new Date().getFullYear()} <b>{name}</b>
          </span>
          <span>BUILT WITH MONOFLY</span>
        </footer>
      </main>
    </div>
  );
}
