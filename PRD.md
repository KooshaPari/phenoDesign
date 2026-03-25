# Product Requirements Document -- @phenotype/design

## Product Vision

@phenotype/design is the shared design token and theme library for the Phenotype ecosystem. It provides the Keycap color palette, CSS components, VitePress theme integration, and W3C DTCG design tokens that all Phenotype projects consume for visual consistency.

## E1: Design Tokens

### E1.1: Keycap Palette

As a developer, I can import the Keycap color palette as CSS custom properties for consistent theming.

**Acceptance Criteria:**
- `css/keycap-palette.css` exports all color tokens as CSS custom properties
- Dark and light mode tokens with WCAG AA contrast (4.5:1 minimum)
- Framework-agnostic (works with any CSS-consuming tool)

### E1.2: W3C DTCG Token Format

As a design tool consumer, I can import tokens in W3C Design Token Community Group format.

**Acceptance Criteria:**
- `tokens/keycap.json` follows W3C DTCG specification
- Tokens include: colors, typography, spacing, borders
- Parseable by Style Dictionary and similar tools

### E1.3: TypeScript Token Constants

As a TypeScript developer, I can import token values as typed constants.

**Acceptance Criteria:**
- `dist/tokens.js` exports all token values with TypeScript types
- Tree-shakeable ES module exports

## E2: Component Styles

### E2.1: CSS Components

As a developer, I can use pre-built CSS component classes (badges, cards, pipeline indicators).

**Acceptance Criteria:**
- `css/components.css` provides utility classes
- Components use design tokens for theming
- No JavaScript runtime dependency

## E3: VitePress Integration

### E3.1: VitePress Theme

As a documentation author, I can apply the Phenotype theme to any VitePress site with a single import.

**Acceptance Criteria:**
- `css/vitepress-theme.css` provides complete VitePress theming
- Includes keycap palette + component styles
- `dist/vitepress.js` exports VitePress config helper for sidebar/nav theming
