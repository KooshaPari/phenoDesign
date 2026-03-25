# Comparison Matrix

## Feature Comparison

This document compares **@phenotype/design** with similar tools in the design tokens, theming, and component styles space.

| Repository | Purpose | Key Features | Language/Framework | Maturity | Comparison |
|------------|---------|--------------|-------------------|----------|------------|
| **@phenotype/design (this repo)** | Design tokens & theme | Keycap palette, VitePress theme, Design tokens | CSS/TypeScript | Stable | Phenotype ecosystem |
| [Tailwind CSS](https://github.com/tailwindcss/tailwind) | Utility CSS | Utilities, Config, JIT | PostCSS | Stable | Industry standard |
| [Radix UI](https://github.com/radix-ui/primitives) | Headless components | Accessible, Unstyled, Composable | React | Stable | Headless components |
| [Chakra UI](https://github.com/chakra-ui/chakra-ui) | Styled components | Accessible, Themeable, Components | React | Stable | Component library |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | Copy-paste components | Tailwind, Radix-based, Copy-paste | React | Stable | Copy-paste approach |
| [Stitches](https://github.com/modulz/stitches) | CSS-in-JS | Near-zero runtime, SSR | CSS-in-JS | Stable | CSS-in-JS |
| [Vanilla Extract](https://github.com/vanilla-extract/vanilla-extract) | CSS-in-JS | Type-safe, Build-time | TypeScript | Stable | Type-safe CSS |

## Detailed Feature Comparison

### Design Tokens

| Feature | @phenotype/design | Tailwind | Chakra | shadcn/ui |
|---------|-------------------|----------|--------|-----------|
| W3C DTCG Format | ✅ | ❌ | ❌ | ❌ |
| Color Tokens | ✅ | ✅ | ✅ | ✅ |
| Font Tokens | ✅ | ✅ | ✅ | ✅ |
| JSON Export | ✅ | ❌ | ❌ | ❌ |
| TypeScript Constants | ✅ | ❌ | ✅ | ✅ |
| CSS Variables | ✅ | ✅ | ✅ | ✅ |

### Theming

| Feature | @phenotype/design | Tailwind | Chakra | Radix |
|---------|-------------------|----------|--------|-------|
| Dark Mode | ✅ | ✅ | ✅ | ✅ |
| Light Mode | ✅ | ✅ | ✅ | ✅ |
| Themeable | ✅ | ✅ | ✅ | ❌ |
| WCAG Compliance | ✅ | ❌ | ✅ | ✅ |
| Contrast Ratios | ✅ | ❌ | ✅ | ✅ |

### VitePress Integration

| Feature | @phenotype/design | Tailwind | Chakra |
|---------|-------------------|----------|--------|
| VitePress Theme | ✅ | ❌ | ❌ |
| Full Theme CSS | ✅ | ❌ | ❌ |
| Config Helper | ✅ | ❌ | ❌ |

## Design Token Format

phenotype/design exports W3C DTCG format tokens:

```json
{
  "color": {
    "background": {
      "dark": "#090a0c",
      "light": "#f8f9fa"
    },
    "text": {
      "dark": "#f6f5f5",
      "light": "#1a1c1e"
    },
    "accent": {
      "dark": "#7ebab5",
      "light": "#4a9c97"
    }
  }
}
```

## Palette

| Role | Dark | Light |
|------|------|-------|
| Background | `#090a0c` | `#f8f9fa` |
| Text | `#f6f5f5` | `#1a1c1e` |
| Accent | `#7ebab5` | `#4a9c97` |
| Slate | `#353a40` | `#e8eaed` |

All combinations meet WCAG AA contrast (4.5:1 minimum).

## Exports

| Export | Description |
|--------|-------------|
| `css/keycap-palette.css` | Color tokens + fonts (framework-agnostic) |
| `css/components.css` | Badges, cards, pipeline styles |
| `css/vitepress-theme.css` | Full VitePress theme |
| `tokens/keycap.json` | W3C DTCG format tokens |
| `dist/tokens.js` | TypeScript token constants |
| `dist/vitepress.js` | VitePress config helper |

## When to Use What

| Use Case | Recommended Tool |
|----------|-----------------|
| Phenotype ecosystem | @phenotype/design |
| General UI development | Tailwind CSS |
| Headless components | Radix UI |
| Copy-paste components | shadcn/ui |
| Full component library | Chakra UI |

## References

- Tailwind CSS: [tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss)
- Radix UI: [radix-ui/primitives](https://github.com/radix-ui/primitives)
- Chakra UI: [chakra-ui/chakra-ui](https://github.com/chakra-ui/chakra-ui)
- shadcn/ui: [shadcn-ui/ui](https://github.com/shadcn-ui/ui)
