# Functional Requirements -- @kooshapari/design

**Last Updated:** 2026-03-26

---

## FR-TOK: Design Tokens

### FR-TOK-001: CSS Custom Property Palette
`css/keycap-palette.css` SHALL declare all 29 color tokens and 2 font-family tokens as
CSS custom properties (`--kc-*`) under `:root`.
**File:** `css/keycap-palette.css`
**Traces to:** E1.1

### FR-TOK-002: Light-Mode Defaults
The `:root` block in `keycap-palette.css` SHALL define light-mode values for all surface,
text, and structural tokens as the default (no class required).
**Tokens:** `--kc-bg: #f8f9fa`, `--kc-text-1: #1a1c1e`, `--kc-divider: #d4d7dc`, etc.
**File:** `css/keycap-palette.css`
**Traces to:** E1.1

### FR-TOK-003: Dark-Mode Class Override
A `.dark, [data-theme="dark"]` selector block SHALL override all surface and text tokens
to the midnight palette (`--kc-bg: #090a0c`, `--kc-text-1: #f6f5f5`).
**File:** `css/keycap-palette.css`
**Traces to:** E1.1

### FR-TOK-004: Dark-Mode Media Query
A `@media (prefers-color-scheme: dark)` block SHALL activate dark-mode tokens automatically
when neither `.light` nor `[data-theme="light"]` is present on `:root`.
**File:** `css/keycap-palette.css`
**Traces to:** E1.1

### FR-TOK-005: WCAG AA Contrast
All foreground/background combinations used for text in the palette SHALL meet WCAG AA
(4.5:1 minimum). Verified pairs: `--kc-text-1` on `--kc-bg` (both modes),
`--kc-accent-contrast` (#4a9c97) on `--kc-bg-elv` (#ffffff) in light mode.
**Traces to:** E1.1

### FR-TOK-006: W3C DTCG Token Format
`tokens/keycap.json` SHALL conform to the W3C Design Token Community Group specification.
Every token entry SHALL have `$value` and `$type`; `$description` is required where the
token purpose is not obvious from the key name.
**File:** `tokens/keycap.json`
**Traces to:** E1.2

### FR-TOK-007: DTCG Token Groups
`tokens/keycap.json` SHALL contain the following groups under the root `keycap` key:
`color` (accent x5, slate), `dark` (10 tokens), `light` (10 tokens), `font` (2 families).
**File:** `tokens/keycap.json`
**Traces to:** E1.2

### FR-TOK-008: TypeScript Const Export
`src/tokens.ts` SHALL export a `keycap` const object containing: accent group (5 values +
slate), `dark` palette object (10 properties), `light` palette object (10 properties),
`font` object (base + mono stacks).
**File:** `src/tokens.ts`
**Traces to:** E1.3

### FR-TOK-009: KeycapTokens Type Export
`src/tokens.ts` SHALL export `KeycapTokens` as `typeof keycap` so callers get
structural typing without a separate interface declaration.
**File:** `src/tokens.ts`
**Traces to:** E1.3

### FR-TOK-010: Index Re-export
`src/index.ts` SHALL re-export `{ keycap }` and `type { KeycapTokens }` from `./tokens`
so the root package import (`@kooshapari/design`) exposes both symbols.
**File:** `src/index.ts`
**Traces to:** E1.3

---

## FR-CMP: Component Styles

### FR-CMP-001: Layer Badge Base Class
`.layer-badge` SHALL set `display: inline-block`, `padding: 2px 8px`, `border-radius: 4px`,
`font-size: 12px`, `font-weight: 600`.
**File:** `css/components.css`
**Traces to:** E2.1

### FR-CMP-002: Layer Badge Dark-Mode Modifiers
`.dark .layer-{0..4}` and `[data-theme="dark"] .layer-{0..4}` SHALL apply 15%-opacity
color fills with bright foreground text. Color map: 0=red, 1=orange, 2=yellow, 3=green, 4=blue.
**File:** `css/components.css`
**Traces to:** E2.1

### FR-CMP-003: Layer Badge Light-Mode Modifiers
`:root .layer-{0..4}` SHALL apply pastel solid-color backgrounds with dark foreground text.
All light-mode layer badge combinations SHALL meet WCAG AA contrast.
**File:** `css/components.css`
**Traces to:** E2.1

### FR-CMP-004: Status Badge Base Class
`.status-badge` SHALL set `text-transform: uppercase`, `letter-spacing: 0.04em`,
`font-weight: 600`, `font-size: 11px`, `display: inline-block`, `padding: 2px 8px`,
`border-radius: 4px`.
**File:** `css/components.css`
**Traces to:** E2.2

### FR-CMP-005: Status Badge Modifiers
`.status-{draft|active|published|archived}` SHALL define background and foreground for both
light and dark modes. Active uses Keycap accent teal; archived uses red; draft uses gray.
**File:** `css/components.css`
**Traces to:** E2.2

### FR-CMP-006: Doc-Type Grid
`.doc-type-grid` SHALL use `display: grid`, `grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))`,
`gap: 12px`, `margin: 24px 0`.
**File:** `css/components.css`
**Traces to:** E2.3

### FR-CMP-007: Doc-Type Card
`.doc-type-card` SHALL use `var(--kc-bg-soft)` background, `var(--kc-divider)` border,
`border-radius: 8px`, and on hover SHALL apply `border-color: var(--kc-accent)` with
`transform: translateY(-1px)` transition.
**File:** `css/components.css`
**Traces to:** E2.3

### FR-CMP-008: Pipeline Container
`.pipeline` SHALL use `display: flex`, `flex-wrap: wrap`, `gap: 8px`, `align-items: center`,
`font-family: var(--kc-font-mono)`, `font-size: 13px`.
**File:** `css/components.css`
**Traces to:** E2.4

### FR-CMP-009: Pipeline Stage and Arrow
`.pipeline .stage` SHALL use `var(--kc-bg-soft)` background and `var(--kc-divider)` border,
transitioning to accent on hover. `.pipeline .arrow` SHALL use `var(--kc-text-3)` color.
**File:** `css/components.css`
**Traces to:** E2.4

### FR-CMP-010: No JavaScript Runtime
All rules in `css/components.css` SHALL be pure CSS. No framework code, runtime JavaScript,
or import of JS modules is permitted in this file.
**Traces to:** E2.1, E2.2, E2.3, E2.4

---

## FR-VPR: VitePress Integration

### FR-VPR-001: Theme Composition via @import
`css/vitepress-theme.css` SHALL use `@import './keycap-palette.css'` and
`@import './components.css'` so consumers need only one import for the full theme.
**File:** `css/vitepress-theme.css`
**Traces to:** E3.1

### FR-VPR-002: Brand Variable Mapping
`css/vitepress-theme.css` `:root` SHALL map:
`--vp-c-brand-1: #7ebab5`, `--vp-c-brand-2: #6aa8a3`, `--vp-c-brand-3: #569691`.
**File:** `css/vitepress-theme.css`
**Traces to:** E3.1

### FR-VPR-003: Surface and Text Variable Mapping
`css/vitepress-theme.css` SHALL map all `--vp-c-bg-*`, `--vp-c-text-*`, `--vp-c-divider`,
`--vp-c-gutter`, and `--vp-code-block-bg` to their `var(--kc-*)` equivalents.
**File:** `css/vitepress-theme.css`
**Traces to:** E3.1

### FR-VPR-004: Component Zone Overrides
`css/vitepress-theme.css` SHALL include overrides for: `.VPNav` (blur backdrop via
`backdrop-filter: blur(12px)`), `.VPSidebar`, `div[class*='language-']` (code blocks),
`.VPHero` (font sizes, gradient name), `.VPFeature` (hover lift + accent border), `.vp-doc`
(tables, links, typography), `.quick-start`, `.VPFooter`.
**File:** `css/vitepress-theme.css`
**Traces to:** E3.1

### FR-VPR-005: Dark-Mode Button Contrast
In the `.dark` block of `css/vitepress-theme.css`, `--vp-button-brand-text` SHALL be
`#090a0c` (dark text on teal) and `--vp-button-brand-bg` SHALL be `#7ebab5`.
**File:** `css/vitepress-theme.css` `.dark`
**Traces to:** E3.1

### FR-VPR-006: VitePress Config Object
`src/vitepress.ts` SHALL export `vitepressConfig` as a const with:
`appearance: 'dark' as const`, `markdown: { lineNumbers: true, theme: vitepressMarkdownTheme }`.
**File:** `src/vitepress.ts`
**Traces to:** E3.2

### FR-VPR-007: Markdown Theme Constant
`src/vitepress.ts` SHALL export `vitepressMarkdownTheme` as
`{ light: 'github-light', dark: 'vitesse-dark' } as const`.
**File:** `src/vitepress.ts`
**Traces to:** E3.2
