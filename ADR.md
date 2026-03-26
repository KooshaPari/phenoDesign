# Architecture Decision Records -- @kooshapari/design

**Last Updated:** 2026-03-26

---

## ADR-001: CSS-First, Framework-Agnostic Token Delivery

**Status:** Accepted
**Date:** 2026-03-26

**Context:**
Phenotype projects span multiple UI frameworks and toolchains (VitePress, React, plain HTML,
charting libraries). Design tokens must be consumable in all of them. The lowest-common-denominator
interop layer for styles is CSS custom properties, not a specific JS framework's theming API.

**Decision:**
Ship all palette tokens as CSS custom properties in `css/keycap-palette.css` (the primary
delivery vehicle). Provide a TypeScript/ES module mirror (`src/tokens.ts`) as a secondary
convenience layer for programmatic access. No JavaScript is required to apply the palette.

**Alternatives Considered:**
- Tailwind CSS config: ties consumers to Tailwind; breaks for non-Tailwind projects.
- JS-only tokens (no CSS): requires a runtime and CSS-in-JS or manual var injection.
- CSS Modules: scopes would conflict with third-party theming (VitePress, etc.).

**Consequences:**
Any project can apply the Keycap palette with a single `@import` or `<link>` tag. No
build-tool pipeline required for basic usage. TypeScript exports remain available for
advanced use cases (charts, canvas, dynamic theming).

---

## ADR-002: W3C DTCG JSON as Source of Truth

**Status:** Accepted
**Date:** 2026-03-26

**Context:**
Design tokens need a standardized, tool-interoperable format so that Figma plugins, Style
Dictionary pipelines, automated contrast checkers, and future tooling can all parse the
same source file without bespoke adapters.

**Decision:**
`tokens/keycap.json` uses the W3C Design Token Community Group (DTCG) specification as the
single authoritative token source. Every token entry uses `$value`, `$type`, and
`$description` fields. The CSS and TypeScript files are derived representations.

**Alternatives Considered:**
- Style Dictionary native format: proprietary; not recognized by Figma natively.
- Figma tokens JSON (plugin format): Figma vendor lock-in; less interoperable.
- Hand-maintained CSS without a source JSON: no single source of truth; drift risk.

**Consequences:**
Tokens are parseable by Style Dictionary, Figma Token Studio plugin, and any W3C DTCG-
compliant tool. Adding new downstream output formats (Sass vars, Android XML, iOS Swift)
requires only a new Style Dictionary transform, not re-authoring tokens.

---

## ADR-003: WCAG AA as Minimum Contrast Standard

**Status:** Accepted
**Date:** 2026-03-26

**Context:**
The Phenotype ecosystem serves developer tooling and documentation. Color choices must be
accessible to users with low-contrast sensitivity. Two standards exist: WCAG AA (4.5:1
for normal text) and WCAG AAA (7:1 for normal text).

**Decision:**
Every foreground/background combination used for readable text in the Keycap palette SHALL
meet WCAG AA (4.5:1 minimum). WCAG AAA is not mandated because it would over-constrain
brand color choices (e.g., the teal accent `#7ebab5` cannot meet AAA against white while
remaining recognizable as teal).

Key verified pairs:
- Dark mode: `--kc-text-1` (#f6f5f5) on `--kc-bg` (#090a0c) -- ratio ~18:1
- Dark mode: `--kc-text-2` (#a8adb5) on `--kc-bg` (#090a0c) -- ratio ~8.5:1
- Light mode: `--kc-text-1` (#1a1c1e) on `--kc-bg` (#f8f9fa) -- ratio ~17:1
- Light mode: `--kc-accent-contrast` (#4a9c97) on `--kc-bg-elv` (#ffffff) -- ratio ~4.6:1

**Alternatives Considered:**
- WCAG AAA: too restrictive; rules out the teal accent family entirely on white backgrounds.
- No formal standard: unacceptable -- introduces unverifiable accessibility regressions.

**Consequences:**
Color additions or modifications to the palette require contrast verification before merge.
The `--kc-accent-contrast` token exists specifically as the WCAG-AA-compliant variant of
the teal accent for use on light elevated surfaces.

---

## ADR-004: VitePress as Primary Downstream Consumer

**Status:** Accepted
**Date:** 2026-03-26

**Context:**
The majority of Phenotype documentation projects use VitePress. VitePress has its own CSS
variable system (`--vp-c-*`) that must be remapped for custom theming. Consumers should
not need to understand VitePress internals to apply the Keycap theme.

**Decision:**
Provide `css/vitepress-theme.css` as a dedicated first-class export that:
1. Composes `keycap-palette.css` and `components.css` via `@import`
2. Remaps all relevant `--vp-*` variables to `--kc-*` equivalents
3. Applies targeted component-zone overrides (nav, sidebar, hero, code blocks, feature cards)

Also provide `dist/vitepress.js` with typed `vitepressConfig` and `vitepressMarkdownTheme`
exports for the `defineConfig()` entry point in `.vitepress/config.ts`.

**Alternatives Considered:**
- Generic theme only (no VitePress mapping): VitePress users would need 20+ manual
  variable overrides to achieve consistent theming.
- VitePress Vue component overrides: more powerful but requires Vue runtime; breaks non-
  Vue consumers; increases bundle size.

**Consequences:**
VitePress documentation sites get one-import theming. Other frameworks use the generic
`css/keycap-palette.css` and `css/components.css` exports and map to their own variable
systems.

---

## ADR-005: bun as Package Manager; TypeScript + oxlint as Toolchain

**Status:** Accepted
**Date:** 2026-03-26

**Context:**
The repository needs a fast, consistent build and lint toolchain. The Phenotype ecosystem
prefers bleeding-edge, OSS-first tooling.

**Decision:**
- Package manager: `bun` (detected via `bun.lock` lockfile, declared in `package.json` `packageManager`)
- Build: `tsc` (TypeScript compiler) + `cp -r css dist/css` shell step
- Linter: `oxlint` (Rust-based, fast, drop-in ESLint alternative)
- Formatter: `oxfmt`
- Devdeps only: `oxlint`, `typescript`, `vitepress`, `vue` -- zero runtime dependencies

**Alternatives Considered:**
- npm/pnpm: slower; less aligned with ecosystem bleeding-edge preference.
- ESLint + Prettier: heavier, slower than oxlint + oxfmt.
- Rollup/esbuild bundler: overkill for a token library with two tiny TS source files.

**Consequences:**
The build output is bare TypeScript-compiled JS + copied CSS files. No bundler-specific
artifacts. Distribution via `files` array in `package.json` (css/, dist/, tokens/).
