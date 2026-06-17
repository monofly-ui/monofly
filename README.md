Commit 1
chore: initialize monofly workspace
Goal:
Create the skeleton that every future package will live in.
Contents:
monofly/
├── apps/
│   ├── docs/
│   └── playground/
│
├── packages/
│   ├── tokens/
│   ├── core/
│   ├── ui/
│   ├── blocks/
│   └── react/
│
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
Root package.json:
{
  "private": true,
  "packageManager": "pnpm@10"
}
Workspace:
packages:
  - apps/*
  - packages/*
No code.
No components.
No Tailwind.
No Shadcn.
Just architecture.
When you look back years later, this commit should still make sense.
Commit 2
feat(tokens): establish token pipeline
Goal:
Create the single source of truth for design decisions.
Structure:
packages/tokens/
├── src/
│   ├── color.ts
│   ├── spacing.ts
│   ├── typography.ts
│   └── index.ts
│
├── generated/
├── dist/
└── package.json
Package name:
{
  "name": "@monofly/tokens"
}
Add:
tokens.css
Example:
:root {
  --mf-color-primary: #033c5a;
  --mf-color-secondary: #aa9868;

  --mf-space-100: 0.25rem;
  --mf-space-200: 0.5rem;
}
Even if SDS isn't connected yet.
The important thing is proving:
Figma
 ↓
SDS
 ↓
tokens
 ↓
npm package
can exist.
Commit 3 (honorable mention)
This is actually where I'd bring in Tailwind.
feat(ui): integrate tailwind v4 theme from tokens
Prove:
tokens
 ↓
tailwind
 ↓
consumer app
works.
Still no Shadcn.
Commit 4
feat(ui): initialize shadcn component system
Install Shadcn into:
packages/ui
Generate:
Button
Input
Card
only.
Nothing else.
Why This Order Matters
You want to validate these layers independently:
First
workspace
Then
tokens
Then
tokens → tailwind
Then
tailwind → shadcn
Then
shadcn → monofly components
Then
components → blocks
If I were you, the first two commit messages would literally be:
git commit -m "chore: initialize monofly workspace"
git commit -m "feat(tokens): establish design token package"
Those two commits establish the foundation for everything you're planning to publish under @monofly/*. The Button, Card, LinkList, and Link-in-Bio features can all come later without forcing you to reorganize the repo.For Monofly, I would set up the monorepo so that **the repository structure mirrors the package dependency graph**. That makes publishing almost automatic.

# Target Result

A consumer can do:

```bash
npm install @monofly/react
```

or

```bash
npm install @monofly/ui
```

and get only what they need.

---

# Monorepo Structure

```text
monofly/
├── apps/
│   ├── docs/
│   ├── playground/
│   └── website/
│
├── packages/
│   ├── tokens/
│   ├── core/
│   ├── ui/
│   ├── blocks/
│   └── react/
│
├── .changeset/
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.base.json
```

---

# Package Dependency Graph

```text
@monofly/tokens
       │
       ▼
@monofly/core
       │
       ▼
@monofly/ui
      ╱ ╲
     ▼   ▼
@monofly/blocks
     │
     ▼
@monofly/react
```

Or even simpler:

```text
tokens
  ↓
core
  ↓
ui
 ↙  ↘
blocks react
```

I would actually keep `react` beside `blocks`, not above it.

React is an integration layer.

Blocks are compositions.

They solve different problems.

---

# Package Names

Inside each package:

```json
{
  "name": "@monofly/ui"
}
```

```json
{
  "name": "@monofly/tokens"
}
```

etc.

The npm organization (`@monofly`) owns them all.

---

# Workspace Configuration

`pnpm-workspace.yaml`

```yaml
packages:
  - apps/*
  - packages/*
```

---

# Root package.json

```json
{
  "private": true,
  "packageManager": "pnpm@10",
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "release": "changeset publish"
  }
}
```

---

# Turbo Pipeline

`turbo.json`

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

The magic:

```text
ui build
  ↳ waits for core
       ↳ waits for tokens
```

Turbo figures it out from package dependencies.

---

# Internal Dependencies

Example:

`packages/ui/package.json`

```json
{
  "name": "@monofly/ui",
  "dependencies": {
    "@monofly/core": "workspace:*",
    "@monofly/tokens": "workspace:*"
  }
}
```

---

# Publishing

Use [Changesets](https://github.com/changesets/changesets?utm_source=chatgpt.com).

Install:

```bash
pnpm add -Dw @changesets/cli
pnpm changeset init
```

When a package changes:

```bash
pnpm changeset
```

Select:

```text
@monofly/ui
minor
```

Changesets updates versions automatically.

Example:

```text
@monofly/tokens 1.2.0
@monofly/core   1.2.0
@monofly/ui     1.3.0
```

and updates dependents.

---

# Build Output

Every package should publish:

```text
dist/
├── index.js
├── index.cjs
├── index.d.ts
└── style.css
```

I would use:

[tsup](https://tsup.egoist.dev/?utm_source=chatgpt.com)

for every package.

Simple:

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true
});
```

---

# Tokens Package

This one is special.

```text
packages/tokens
├── src
├── generated
├── dist
└── scripts
```

Outputs:

```text
tokens.css
tokens.json
tokens.js
```

This is where your Figma SDS pipeline lands.

Given your earlier questions about the Figma SDS repo, I'd make that repo's generation scripts feed directly into `packages/tokens/generated/`.

---

# What Consumers Install

Most users:

```bash
npm install @monofly/react
```

Power users:

```bash
npm install @monofly/ui
```

Design-tooling users:

```bash
npm install @monofly/tokens
```

---

# What I'd Build First

Order matters:

### Phase 1

```text
@monofly/tokens
@monofly/ui
```

Publish these first.

---

### Phase 2

```text
@monofly/core
```

Extract shared utilities from UI.

---

### Phase 3

```text
@monofly/blocks
```

Landing-page sections, app shells, marketing layouts.

---

### Phase 4

```text
@monofly/react
```

Provider, theme management, hooks, app bootstrap.

---

For your specific goal (a Monofly ecosystem for React, Vite, Next.js, Tailwind v4, and Figma-generated tokens), I'd actually start by shipping only:

```text
@monofly/tokens
@monofly/ui
```

Get those published and consumable from npm first. Everything else becomes much easier once the token generation and component publishing pipeline is proven end-to-end.


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

For Monofly, I would set up the monorepo so that **the repository structure mirrors the package dependency graph**. That makes publishing almost automatic.

# Target Result

A consumer can do:

```bash
npm install @monofly/react
```

or

```bash
npm install @monofly/ui
```

and get only what they need.

---

# Monorepo Structure

```text
monofly/
├── apps/
│   ├── docs/
│   ├── playground/
│   └── website/
│
├── packages/
│   ├── tokens/
│   ├── core/
│   ├── ui/
│   ├── blocks/
│   └── react/
│
├── .changeset/
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.base.json
```

---

# Package Dependency Graph

```text
@monofly/tokens
       │
       ▼
@monofly/core
       │
       ▼
@monofly/ui
      ╱ ╲
     ▼   ▼
@monofly/blocks
     │
     ▼
@monofly/react
```

Or even simpler:

```text
tokens
  ↓
core
  ↓
ui
 ↙  ↘
blocks react
```

I would actually keep `react` beside `blocks`, not above it.

React is an integration layer.

Blocks are compositions.

They solve different problems.

---

# Package Names

Inside each package:

```json
{
  "name": "@monofly/ui"
}
```

```json
{
  "name": "@monofly/tokens"
}
```

etc.

The npm organization (`@monofly`) owns them all.

---

# Workspace Configuration

`pnpm-workspace.yaml`

```yaml
packages:
  - apps/*
  - packages/*
```

---

# Root package.json

```json
{
  "private": true,
  "packageManager": "pnpm@10",
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "release": "changeset publish"
  }
}
```

---

# Turbo Pipeline

`turbo.json`

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

The magic:

```text
ui build
  ↳ waits for core
       ↳ waits for tokens
```

Turbo figures it out from package dependencies.

---

# Internal Dependencies

Example:

`packages/ui/package.json`

```json
{
  "name": "@monofly/ui",
  "dependencies": {
    "@monofly/core": "workspace:*",
    "@monofly/tokens": "workspace:*"
  }
}
```

---

# Publishing

Use [Changesets](https://github.com/changesets/changesets?utm_source=chatgpt.com).

Install:

```bash
pnpm add -Dw @changesets/cli
pnpm changeset init
```

When a package changes:

```bash
pnpm changeset
```

Select:

```text
@monofly/ui
minor
```

Changesets updates versions automatically.

Example:

```text
@monofly/tokens 1.2.0
@monofly/core   1.2.0
@monofly/ui     1.3.0
```

and updates dependents.

---

# Build Output

Every package should publish:

```text
dist/
├── index.js
├── index.cjs
├── index.d.ts
└── style.css
```

I would use:

[tsup](https://tsup.egoist.dev/?utm_source=chatgpt.com)

for every package.

Simple:

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true
});
```

---

# Tokens Package

This one is special.

```text
packages/tokens
├── src
├── generated
├── dist
└── scripts
```

Outputs:

```text
tokens.css
tokens.json
tokens.js
```

This is where your Figma SDS pipeline lands.

Given your earlier questions about the Figma SDS repo, I'd make that repo's generation scripts feed directly into `packages/tokens/generated/`.

---

# What Consumers Install

Most users:

```bash
npm install @monofly/react
```

Power users:

```bash
npm install @monofly/ui
```

Design-tooling users:

```bash
npm install @monofly/tokens
```

---

# What I'd Build First

Order matters:

### Phase 1

```text
@monofly/tokens
@monofly/ui
```

Publish these first.

---

### Phase 2

```text
@monofly/core
```

Extract shared utilities from UI.

---

### Phase 3

```text
@monofly/blocks
```

Landing-page sections, app shells, marketing layouts.

---

### Phase 4

```text
@monofly/react
```

Provider, theme management, hooks, app bootstrap.

---

For your specific goal (a Monofly ecosystem for React, Vite, Next.js, Tailwind v4, and Figma-generated tokens), I'd actually start by shipping only:

```text
@monofly/tokens
@monofly/ui
```

Get those published and consumable from npm first. Everything else becomes much easier once the token generation and component publishing pipeline is proven end-to-end.
