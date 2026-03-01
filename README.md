# @phenotype/design

Keycap palette — shared design tokens, VitePress theme, and component styles for the Phenotype ecosystem.

## Install

```bash
bun add @phenotype/design
```

## Quick Start (VitePress)

```typescript
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import '@phenotype/design/css/vitepress-theme.css'

export default { extends: DefaultTheme }
```

## What's Included

| Export | Description |
|--------|-------------|
| `css/keycap-palette.css` | Color tokens + fonts (framework-agnostic) |
| `css/components.css` | Badges, cards, pipeline (framework-agnostic) |
| `css/vitepress-theme.css` | Full VitePress theme (imports both above) |
| `tokens/keycap.json` | W3C DTCG format design tokens |
| `dist/tokens.js` | TypeScript token constants |
| `dist/vitepress.js` | VitePress config helper |

## Palette

| Role | Dark | Light |
|------|------|-------|
| Background | `#090a0c` | `#f8f9fa` |
| Text | `#f6f5f5` | `#1a1c1e` |
| Accent | `#7ebab5` | `#4a9c97` |
| Slate | `#353a40` | `#e8eaed` |

All combinations meet WCAG AA contrast (4.5:1 minimum).

## License

MIT
