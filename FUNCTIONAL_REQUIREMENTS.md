# Functional Requirements -- @phenotype/design

## FR-TOK: Design Tokens

### FR-TOK-001: CSS Custom Properties
`css/keycap-palette.css` SHALL export all color, typography, and spacing tokens as CSS custom properties.
**Traces to:** E1.1

### FR-TOK-002: WCAG AA Contrast
All foreground/background color combinations in the palette SHALL meet WCAG AA contrast ratio (4.5:1 minimum).
**Traces to:** E1.1

### FR-TOK-003: W3C DTCG Format
`tokens/keycap.json` SHALL conform to the W3C Design Token Community Group specification.
**Traces to:** E1.2

### FR-TOK-004: TypeScript Exports
`dist/tokens.js` SHALL export all token values as typed ES module constants.
**Traces to:** E1.3

## FR-CMP: Component Styles

### FR-CMP-001: CSS Components
`css/components.css` SHALL provide utility classes for badges, cards, and pipeline indicators using design tokens.
**Traces to:** E2.1

### FR-CMP-002: No JS Runtime
Component styles SHALL be pure CSS with no JavaScript runtime dependency.
**Traces to:** E2.1

## FR-VPR: VitePress Integration

### FR-VPR-001: Theme CSS
`css/vitepress-theme.css` SHALL provide complete VitePress theming including palette and component styles.
**Traces to:** E3.1

### FR-VPR-002: Config Helper
`dist/vitepress.js` SHALL export a VitePress config helper for sidebar and navigation theming.
**Traces to:** E3.1
