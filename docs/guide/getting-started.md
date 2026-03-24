# Getting Started

## Install

```bash
bun add @phenotype/design
# or
npm install @phenotype/design
```

## Quick Setup for VitePress

In your `.vitepress/theme/index.ts`:

```typescript
import DefaultTheme from 'vitepress/theme'
import '@phenotype/design/css/vitepress-theme.css'

export default {
  extends: DefaultTheme,
}
```

That's it. Your VitePress site now uses the Keycap palette with proper
dark and light mode support.

## Manual Setup (Copy CSS)

If you don't want a dependency, copy the CSS files directly:

```bash
cp node_modules/@phenotype/design/css/keycap-palette.css .vitepress/theme/
cp node_modules/@phenotype/design/css/components.css .vitepress/theme/
```

Then import in your custom CSS:

```css
@import './keycap-palette.css';
@import './components.css';
```

## What's Included

| File | What | When to Use |
|------|------|-------------|
| `css/keycap-palette.css` | Color tokens + fonts | Any project (not VitePress) |
| `css/components.css` | Badges, cards, pipeline | Any HTML |
| `css/vitepress-theme.css` | Full VitePress theme | VitePress projects |
| `tokens/keycap.json` | W3C DTCG format tokens | Build tools |
| `dist/tokens.js` | TypeScript token export | JS/TS projects |
