# Product Requirements Document -- @kooshapari/design

**Package:** `@kooshapari/design`
**Version:** 1.0.1
**Repository:** https://github.com/KooshaPari/phenotype-design
**Last Updated:** 2026-03-26

## Product Vision

`@kooshapari/design` is the shared design-token and theme library for the Phenotype ecosystem.
It provides the Keycap color palette (teal-dark aesthetic), CSS custom properties, framework-
agnostic component styles, a full VitePress theme integration, and a W3C DTCG JSON token source
so every Phenotype project achieves visual consistency without coupling to a UI framework.

## Token Architecture

```
tokens/keycap.json              W3C DTCG source of truth
  |                             29 color tokens + 2 font families
  +-- src/tokens.ts             TypeScript const mirror (keycap + KeycapTokens type)
  |
  +-- css/keycap-palette.css    CSS custom properties (--kc-* vars, light/dark/media-query)
       |
       +-- css/vitepress-theme.css   VitePress --vp-* remapping + nav/sidebar/hero overrides
       +-- css/components.css        Layer badges, status badges, doc-type cards, pipeline
```

## Package Exports

| Export Path | Artifact | Purpose |
|---|---|---|
| `.` | `dist/index.js` | Re-exports `keycap` and `KeycapTokens` |
| `./tokens` | `dist/tokens.js` | Programmatic token access |
| `./vitepress` | `dist/vitepress.js` | `vitepressConfig` and `vitepressMarkdownTheme` config helpers |
| `./css/keycap-palette.css` | CSS | Color tokens only, light + dark |
| `./css/vitepress-theme.css` | CSS | Full VitePress theme (palette + components) |
| `./css/components.css` | CSS | Layer/status badges, doc-type cards, pipeline stages |

---

## E1: Design Tokens

### E1.1: Keycap Color Palette

As a developer, I can import CSS custom properties for the Keycap palette so that all
surfaces use consistent, accessible colors without any build-tool dependency.

**Acceptance Criteria:**
- `css/keycap-palette.css` declares `--kc-*` tokens under `:root` (light mode default)
- Accent group: `--kc-accent` (#7ebab5 teal), `--kc-accent-hover`, `--kc-accent-active`,
  `--kc-accent-dim`, `--kc-accent-contrast`, `--kc-slate`
- Surface group: `--kc-bg`, `--kc-bg-alt`, `--kc-bg-soft`, `--kc-bg-elv`
- Text group: `--kc-text-1`, `--kc-text-2`, `--kc-text-3`
- Structural: `--kc-divider`, `--kc-gutter`, `--kc-code-bg`
- Font: `--kc-font-base` (Inter stack), `--kc-font-mono` (JetBrains Mono stack)
- A `.dark, [data-theme="dark"]` block switches surface + text tokens to midnight palette
- A `@media (prefers-color-scheme: dark)` block activates dark mode automatically when
  no explicit `.light` / `[data-theme="light"]` class is present
- All foreground / background combinations for text-on-background meet WCAG AA (4.5:1 minimum)

### E1.2: W3C DTCG Token Source

As a design-tool consumer or build pipeline, I can parse `tokens/keycap.json` in W3C DTCG
format so that Figma plugins, Style Dictionary, and custom tooling all share one source of truth.

**Acceptance Criteria:**
- `tokens/keycap.json` uses `$value`, `$type`, `$description` fields per the W3C DTCG spec
- Token groups: `keycap.color` (accent × 5 + slate), `keycap.dark` (10 tokens),
  `keycap.light` (10 tokens), `keycap.font` (family-base + family-mono)
- Valid `$type` values: `color` and `fontFamily` only
- File is parseable without custom tooling (plain JSON, no comments)

### E1.3: TypeScript Token Constants

As a TypeScript application (charting library, canvas renderer, CSS-in-JS), I can import
typed token constants at runtime without loading CSS files.

**Acceptance Criteria:**
- `src/tokens.ts` exports a `keycap` const object containing: accent group, dark palette
  object, light palette object, font object
- `KeycapTokens` type is inferred from `typeof keycap` (using `as const`)
- `dist/index.js` re-exports `keycap` and `KeycapTokens` as named ES module exports
- No runtime dependencies; `dist/tokens.js` is tree-shakeable

---

## E2: Component Styles

### E2.1: Layer Badges (PhenoDocs 5-Layer Taxonomy)

As a documentation author, I can mark content with layer-taxonomy badges (layers 0-4) so
readers immediately understand an artifact's architectural tier.

**Acceptance Criteria:**
- `.layer-badge` base class: `display: inline-block`, padding 2px 8px, border-radius 4px,
  font-size 12px, font-weight 600
- `.layer-{0..4}` modifier classes apply distinct background + foreground per layer:
  layer-0 = red, layer-1 = orange, layer-2 = yellow, layer-3 = green, layer-4 = blue
- Both light (`:root .layer-N`) and dark (`.dark .layer-N`, `[data-theme="dark"] .layer-N`)
  variants are defined
- No JavaScript runtime required

### E2.2: Status Badges

As a documentation author, I can apply document-lifecycle status labels (draft, active,
published, archived) using CSS modifier classes.

**Acceptance Criteria:**
- `.status-badge` base: uppercase text, 0.04em letter-spacing, font-weight 600, font-size 11px
- `.status-{draft|active|published|archived}` supply colors for both light and dark modes
- Active state uses Keycap accent teal (`#7ebab5` dark / `#2d7a75` light)
- Archived state uses red palette to signal end-of-life

### E2.3: Doc-Type Card Grid

As a documentation author, I can render a responsive card grid of documentation types
using CSS utility classes, consuming design tokens for all theming.

**Acceptance Criteria:**
- `.doc-type-grid`: CSS grid, `auto-fill` columns, `minmax(260px, 1fr)`, gap 12px
- `.doc-type-card`: `--kc-bg-soft` background, `--kc-divider` border, 8px radius,
  hover lifts (`translateY(-1px)`) and highlights border with `--kc-accent`
- `.card-title` and `.card-desc` sub-classes define consistent font-size / color hierarchy
- No JavaScript dependency

### E2.4: Pipeline Visualization

As a developer documenting a data or build pipeline, I can render pipeline stages with
connecting arrows using pure CSS flexbox.

**Acceptance Criteria:**
- `.pipeline` container: flex, wrap, `--kc-font-mono` font, font-size 13px
- `.stage` elements: `--kc-bg-soft` background, `--kc-divider` border, hover accent
- `.arrow` elements: `--kc-text-3` color connectors
- Wraps responsively at narrow viewports

---

## E3: VitePress Integration

### E3.1: VitePress Theme CSS

As a VitePress documentation site author, I can apply the complete Keycap theme with a
single import, overriding all VitePress brand and surface variables.

**Acceptance Criteria:**
- `css/vitepress-theme.css` uses `@import` to compose `keycap-palette.css` and `components.css`
- All `--vp-c-brand-{1,2,3}` variables map to the teal accent family
- All `--vp-c-bg-*` / `--vp-c-text-*` / `--vp-c-divider` / `--vp-c-gutter` variables map
  to `--kc-*` equivalents
- Component overrides included: `.VPNav` (blur backdrop), `.VPSidebar`,
  `div[class*='language-']` (code blocks), `.VPHero`, `.VPFeature` (hover lift),
  `.vp-doc` (tables, links, typography), `.quick-start` block, `.VPFooter`
- `.dark` block overrides button colors so brand buttons remain legible (dark-text-on-teal
  in dark mode, white-text-on-dim-teal in light mode)
- Hero name uses a CSS gradient (text-1 to accent-contrast in light; teal range in dark)

### E3.2: VitePress Config Helper

As a VitePress config author, I can import a typed config fragment to set standard Keycap
markdown theme settings without manual lookup.

**Acceptance Criteria:**
- `src/vitepress.ts` exports `vitepressConfig` with `appearance: 'dark'` and
  `markdown: { lineNumbers: true, theme: vitepressMarkdownTheme }`
- `vitepressMarkdownTheme` is `{ light: 'github-light', dark: 'vitesse-dark' } as const`
- Both are re-exported from `dist/vitepress.js` as named ES module exports
- TypeScript types inferred from `as const` (no manual interface needed)
