```
monofly/
├── apps/
│   ├── docs
│   └── playground
│
├── packages/
│   ├── tokens
│   ├── core
│   ├── ui
│   ├── blocks
│   └── react
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

```
pnpm init
pnpm add -Dw turbo typescript
```

``` yaml
# pnpm-workspace.yaml
packages:
  - apps/*
  - packages/*
```

```
packages/tokens/
├── src
├── generated
├── scripts
└── dist
```

```
Figma
  ↓
SDS export
  ↓
generated JSON
  ↓
tokens package
  ↓
CSS variables
  ↓
everything else
```

```
dist/
├── tokens.css
├── tokens.json
├── index.js
└── index.d.ts
```

```
:root {
  --mf-color-primary: #033c5a;
  --mf-color-secondary: #aa9868;

  --mf-space-100: 0.25rem;
  --mf-space-200: 0.5rem;
}
```

``` css
@import "@monofly/tokens/tokens.css";
```

```
@theme {
  --color-primary: var(--mf-color-primary);
  --color-secondary: var(--mf-color-secondary);

  --spacing-100: var(--mf-space-100);
}
```