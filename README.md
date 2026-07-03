<!-- AI-DD-META:START -->
<!-- This repository is planned, maintained, and managed by AI Agents only. -->
<!-- Slop issues are expected and intentionally present as part of an HITL-less -->
<!-- /minimized AI-DD metaproject of learning, refining, and building brute-force -->
<!-- training for both agents and the human operator. -->
![Downloads](https://img.shields.io/github/downloads/KooshaPari/phenoDesign/total?style=flat-square&label=downloads&color=blue)
![GitHub release](https://img.shields.io/github/v/release/KooshaPari/phenoDesign?style=flat-square&label=release)
![License](https://img.shields.io/github/license/KooshaPari/phenoDesign?style=flat-square)
![AI-Slop](https://img.shields.io/badge/AI--DD-Slop%20Expected-orange?style=flat-square)
![AI-Only-Maintained](https://img.shields.io/badge/Planned%20%26%20Maintained%20by-AI%20Agents%20Only-red?style=flat-square)
![HITL-less](https://img.shields.io/badge/HITL--less%20AI--DD-metaproject-yellow?style=flat-square)

> ⚠️ **AI-Agent-Only Repository**
>
> This repo is **planned, maintained, and managed exclusively by AI Agents**.
> Slop issues, rough edges, and AI artifacts are **expected and intentionally
> present** as part of an **HITL-less / minimized AI-DD** metaproject focused
> on learning, refining, and brute-force training both the agents and the
> human operator. Bug reports and contributions are still welcome, but please
> expect AI-generated code, comments, and documentation throughout.
<!-- AI-DD-META:END -->
# @kooshapari/design

> **Active.** Previously archived; un-archived 2026-06-08. See [ARCHIVED.md](ARCHIVED.md) for history.

## Status

- Archived on 2026-03-25

## Install

```bash
bun add @kooshapari/design
```

## Quick Start (VitePress)

```typescript
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import '@kooshapari/design/css/vitepress-theme.css'

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
