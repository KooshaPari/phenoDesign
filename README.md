# @phenotype/design

**Phenotype Design System** — A comprehensive, framework-agnostic design token library and component library for building unified, accessible interfaces across all Phenotype ecosystem projects.

> **Status**: Archived as of 2026-03-25. Design system functionality migrated to per-project implementations and impeccable global design system. See [ARCHIVED.md](ARCHIVED.md) for migration details and successor projects.

## Overview

@phenotype/design provides a centralized source of truth for design tokens, CSS components, and theming utilities used across the Phenotype ecosystem. Designed for maximum portability, it works with vanilla CSS, Vue, React, Svelte, and VitePress documentation sites with zero framework dependencies.

**Core Mission**: Enable consistent, accessible design across all Phenotype projects through centralized, maintainable design tokens and reusable component styles.

## Technology Stack

- **Format**: CSS custom properties (CSS variables), W3C DTCG design tokens
- **Framework Support**: Framework-agnostic (CSS + TypeScript constants)
- **VitePress Integration**: Drop-in theme for documentation sites
- **Package Manager**: bun, npm, pnpm compatible
- **Tooling**: PostCSS, design token build pipeline

## Key Features

- **W3C DTCG Format Tokens**: Future-proof design token system with semantic naming
- **Dual-Mode Palette**: Automatic light/dark mode switching with WCAG AA compliance
- **Framework-Agnostic CSS**: Pure CSS custom properties — zero JavaScript required
- **Component Library**: Pre-built CSS for badges, cards, pipelines, code blocks
- **VitePress Theme**: Complete, production-ready theme for Phenotype docsites
- **TypeScript Exports**: Typed token constants for programmatic access
- **Accessible by Default**: All color combinations meet WCAG AA (4.5:1) contrast

## Installation

```bash
bun add @phenotype/design
# OR
npm install @phenotype/design
```

## Quick Start (VitePress)

```typescript
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import '@phenotype/design/css/vitepress-theme.css'

export default { extends: DefaultTheme }
```

## Design Token Exports

| Export | Type | Description |
|--------|------|-------------|
| `css/keycap-palette.css` | CSS | Color tokens, typography scales, spacing units |
| `css/components.css` | CSS | Component styles: badges, cards, code blocks |
| `css/vitepress-theme.css` | CSS | Full VitePress theme (imports palette + components) |
| `tokens/keycap.json` | JSON | W3C DTCG format tokens (machine-readable) |
| `dist/tokens.js` | TypeScript | Token constants for JS/TS applications |
| `dist/vitepress.js` | TypeScript | VitePress config helpers |

## Color Palette

### Semantic Roles

| Role | Dark Mode | Light Mode | Contrast |
|------|-----------|-----------|----------|
| Background | #090a0c | #f8f9fa | Pass (WCAG AA) |
| Text Primary | #f6f5f5 | #1a1c1e | 14.8:1 (AAA) |
| Accent | #7ebab5 | #4a9c97 | 7.2:1 (AAA) |
| Slate (Neutral) | #353a40 | #e8eaed | 8.5:1 (AAA) |

All combinations verified for minimum WCAG AA contrast (4.5:1). Accent and slate achieve AAA (7:1+).

## Project Structure

```
.
├── css/                       # CSS exports
│   ├── keycap-palette.css    # Design tokens
│   ├── components.css        # Component styles
│   └── vitepress-theme.css   # Full VitePress theme
├── tokens/                    # W3C DTCG tokens
│   └── keycap.json           # Machine-readable format
├── dist/                      # Built exports
│   ├── tokens.js             # TypeScript constants
│   └── vitepress.js          # Config helpers
└── package.json
```

## Related Phenotype Projects

- **PhenoSpecs** — Specification library and documentation
- **Tracera** — Documentation site examples
- **AgilePlus** — Primary consumer of design system

## Migration Path (Post-Archive)

For projects still using @phenotype/design:
1. Extract tokens to project-local `design/tokens.css`
2. Update imports: `@phenotype/design` → `./design/tokens.css`
3. Review [ARCHIVED.md](./ARCHIVED.md) for component migration guide

## License

MIT — Open source, part of Phenotype organization
