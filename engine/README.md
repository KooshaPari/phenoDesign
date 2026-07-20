# phenoDesign Engine

> **Canonical home moved:** development continues in [`KooshaPari/asset-engine`](https://github.com/KooshaPari/asset-engine). This tree remains as a compatibility pointer until consumers repoint (2026-07-20 extraction).

Multi-tool asset creation engine for agent-driven design automation. Produces branded UI graphics, icons, heroes, 3D renders, and cinematics at scale using Blender, ImageMagick, FFmpeg, Adobe Creative Suite, and Unreal Engine 5.7.

## Purpose & Architecture

The phenoDesign engine is a **headless, composable asset pipeline** that:
- Transforms design specifications into pixel-perfect deliverables
- Enforces brand consistency via design tokens (teal `#7ebab5`, midnight `#090a0c`)
- Routes render requests to optimal tool legs (Blender for 3D → ImageMagick for raster ops → FFmpeg for video)
- Integrates with Claude agents for vision-critique iteration (render → codex vision → score → iterate)

### Tiers

**Tier 1: BASE** (production-ready)
- App icons (512×512 px glassmorphic + flat variants) via Blender
- Hero/OG social images (1200×630 px) via Blender + ImageMagick text overlay
- Favicon/ICO multi-res (16, 32, 64, 128 px) via ImageMagick
- Branding assets (logos, badges, UI glyphs) via Blender glass motif

**Tier 2: EXTENDED** (documented, single-tool tested)
- PNG/WEBP raster baking (ImageMagick multi-res, color-space conversion)
- Video frames → MP4/GIF transcode (FFmpeg H.264 + audio sync)
- Screen recording post-process (crop, subtitle, slow-motion)

**Tier 3: PREMIUM** (stub + prerequisites documented)
- Unreal Engine 5.7 cinematics (MovieRenderQueue headless, DXR ray-traced, DLSS upscale) — **TODO: UE project + render scripts**
- Adobe CC automation (Photoshop batch, Premiere edit+export) — **GATED: requires display-isolation layer (VDD/2nd user)**

## Tool Legs

| Leg | Purpose | Status | Entry Point |
|-----|---------|--------|-------------|
| **Blender** | 3D asset + hero render | ✅ Real | `blender -b -P engine/blender/{glass_icon.py \| hero.py} -- <slug> <out.png>` |
| **ImageMagick** | Raster ops, text, multi-res | ✅ Real | `magick input.png -define icon:auto-resize=... output.ico` |
| **FFmpeg** | Video transcode, frame ops | ✅ Real | `ffmpeg -i input.mov -c:v libx264 -crf 18 output.mp4` |
| **Unreal** | Cinematics render | 🔲 Stub | `UnrealEditor-Cmd.exe ... -MovieRenderPipeline ...` |
| **Adobe** | Design automation | 🔲 Stub (gated) | `aerender -comp "..." -o output.mov` |

## Directory Structure

```
engine/
├── README.md                    # This file
├── blender/                     # Headless Blender scripts
│   ├── glass_icon.py           # 512×512 glassmorphic icon (REAL)
│   ├── hero.py                 # 1200×630 hero + OG social (REAL)
│   └── render_all.sh           # Batch render script
├── imagemagick/                # Raster pipeline
│   ├── README.md               # ImageMagick leg guide
│   ├── favicon_multi.sh        # Multi-res favicon generation
│   └── overlay_text.sh         # Add text to rendered assets
├── ffmpeg/                      # Video pipeline
│   ├── README.md               # FFmpeg leg guide
│   ├── video_transcode.sh      # MP4/GIF encoding
│   └── example.ffmpeg          # Preset commands
├── unreal/                      # Unreal Engine 5.7 cinematics
│   ├── README.md               # UE5.7 leg (stub)
│   └── SETUP.md                # Prerequisites + gotchas
├── adobe/                       # Adobe CC automation
│   ├── README.md               # Adobe leg (stub, gated)
│   └── DISPLAY_ISOLATION.md    # VDD/2nd user setup guide
└── orchestrator/               # Manifest + dispatch logic
    ├── README.md               # Orchestrator pattern
    ├── manifest.schema.json    # Asset request schema
    ├── driver.py               # Simple Python dispatcher
    └── tokens.json             # Brand token definitions
```

## Quick Start

### Render a Glassmorphic Icon

```bash
cd engine/blender
blender -b -P glass_icon.py -- tracera ./tracera_icon.png
```

Outputs: `tracera_icon.png` (512×512 px, teal glass + midnight background, no branding text)

### Render a Hero Image

```bash
cd engine/blender
blender -b -P hero.py -- agileplus ./agileplus_hero.png
```

Then add app name via ImageMagick:

```bash
cd engine/imagemagick
magick agileplus_hero.png \
  -pointsize 72 -fill '#7ebab5' -font Arial-Bold \
  -gravity NorthEast -annotate +30+30 "AgilePlus" \
  agileplus_hero_titled.png
```

### Generate Multi-Res Favicons

```bash
cd engine/imagemagick
./favicon_multi.sh agileplus_hero_titled.png agileplus
# Outputs: agileplus_{16,32,64,128}.png + agileplus.ico
```

## Vision-Critique Loop

Agents integrate Claude's vision capability for quality assurance:

1. **Render**: Agent calls Blender leg → PNG
2. **Vision**: Claude reads PNG, scores against design tokens (color fidelity, glass clarity, teal saturation)
3. **Critique**: Returns diff (e.g., "teal is too desaturated; increase emis_str from 1.8 → 2.2")
4. **Iterate**: Agent re-renders with adjusted params, loops until score > 0.9

Tokens used in rendering (Blender):
- **Teal**: `#7ebab5` (RGB 0.18, 0.62, 0.56) — app identifiers, emission channels
- **Midnight**: `#090a0c` (RGB 0.020, 0.024, 0.030) — world background, base geometry

## Dependencies

### Required (Always)
- **Blender 4.0+** (headless; no display needed)
- **ImageMagick 7.1+** (`magick` CLI, libjpeg + libpng)
- **FFmpeg 6.0+** (libx264 + libvpx for H.264/VP8)

### Optional (Premium Tiers)
- **Unreal Engine 5.7** (C:/Program Files/Epic Games/UE_5.7; headless via `-MovieRenderPipeline`)
  - Windows only; 200+ GB install
  - Requires NVIDIA GPU (RTX 3090 Ti recommended)
- **Adobe Creative Cloud** (Photoshop, Premiere, After Effects)
  - Display isolation (VDD or 2nd Windows user session) required to prevent cursor theft
  - UXP/ExtendScript automation

## Known Limitations

- **Blender fonts**: Text (app names) is not rendered in Blender; use ImageMagick post-op for consistency
- **Adobe headless**: Full automation requires either VDD display drivers or a dedicated 2nd user session (not yet implemented)
- **Unreal render speeds**: First frame = cold-start (2–5 min); subsequent frames benefit from cache
- **FFmpeg presets**: H.264 CRF 18 = transparent at full bandwidth; production may need CRF 16–20 trade-off

## Development Roadmap

- [ ] UE5.7 cinematics leg: integrate MovieRenderQueue, test headless ray-tracing
- [ ] Adobe CC UXP + ExtendScript with VDD isolation wrapper
- [ ] Orchestrator: full Python dispatcher + manifest validation
- [ ] Agent integration: Claude vision loop + iterative refinement
- [ ] Performance: Blender caching, FFmpeg hardware encode (NVIDIA NVENC)

## See Also

- **Design Tokens**: `../tokens/` (Keycap Palette, typography, shadows, spacing)
- **VitePress Theme**: `../src/` (@kooshapari/design VitePress integration)
- **phenotype-journeys**: Parent reference (asset playbooks, example workflows)
