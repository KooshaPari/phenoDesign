# ImageMagick Raster Pipeline

Headless raster operations for the phenoDesign engine. Handles multi-resolution favicon generation, text overlays, color-space conversion, and PNG/WEBP optimization.

## Purpose

Post-process Blender renders into production assets:
- **Multi-res favicons** (16, 32, 64, 128 px → .ico bundle)
- **Text overlays** (app names on hero/OG images, maintaining teal/midnight brand colors)
- **Format conversion** (PNG → WEBP, color-space sRGB/P3)
- **Annotation** (watermarks, captions, OCR-overlaid text)

## Dependencies

```bash
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install imagemagick

# Windows (choco or direct)
choco install imagemagick
# OR download from https://imagemagick.org/script/download.php
```

Verify:
```bash
magick -version
```

## Brand Tokens

Used in all text operations to maintain visual consistency:
- **Teal**: `#7ebab5` (headings, callouts, borders)
- **Midnight**: `#090a0c` (backgrounds, text outlines)
- **Font**: Arial Bold (fallback: system monospace)
- **Size**: 48–72 pt for hero text

## Usage

### Multi-Res Favicon Generation

**Input**: 512×512 PNG (Blender output)
**Output**: 16, 32, 64, 128 px PNG files + combined .ico

```bash
./favicon_multi.sh tracera_icon.png tracera

# Creates:
# tracera_16.png
# tracera_32.png
# tracera_64.png
# tracera_128.png
# tracera.ico (Windows + browser favicon)
```

### Add Text Overlay to Hero

**Input**: 1200×630 PNG (Blender hero render)
**Output**: Titled hero with brand-colored text

```bash
./overlay_text.sh agileplus_hero.png "AgilePlus" agileplus_titled.png

# NorthEast placement, 72pt, teal color
```

### Manual ImageMagick Commands (Reference)

#### Resize to favicon resolution
```bash
magick input.png -resize 16x16 -gravity center -extent 16x16 favicon_16.png
magick input.png -resize 32x32 -gravity center -extent 32x32 favicon_32.png
```

#### Combine into .ico
```bash
magick favicon_16.png favicon_32.png favicon_64.png favicon_128.png favicon.ico
```

#### Overlay text (NorthEast corner, teal)
```bash
magick hero.png \
  -pointsize 72 \
  -fill '#7ebab5' \
  -font /System/Library/Fonts/Arial.ttf \
  -gravity NorthEast \
  -annotate +30+30 "AppName" \
  hero_titled.png
```

#### Convert to WEBP with transparency
```bash
magick input.png \
  -quality 90 \
  -alpha on \
  output.webp
```

#### Overlay watermark
```bash
magick hero.png \
  -gravity SouthEast \
  -fill '#090a0c' \
  -pointsize 24 \
  -annotate +10+10 "© 2025" \
  watermarked.png
```

## Batch Processing

Use in combination with Blender's `render_all.sh`:

```bash
# Step 1: Render all icons + heroes via Blender
../blender/render_all.sh ../../dist/assets

# Step 2: Post-process with ImageMagick
for icon in ../../dist/assets/icons/*.png; do
  slug=$(basename "$icon" _icon.png)
  ./favicon_multi.sh "$icon" "$slug"
done

# Step 3: Overlay titles on heroes
for hero in ../../dist/assets/heroes/*.png; do
  slug=$(basename "$hero" _hero.png)
  app_name="${slug^}"  # Capitalize slug
  ./overlay_text.sh "$hero" "$app_name" "${hero%.png}_titled.png"
done
```

## Performance Notes

- **Resize ops**: ~50–200 ms per image (CPU-bound on single core)
- **Text overlay**: ~150–300 ms (font rasterization)
- **ICO generation**: ~80 ms (4 sizes → .ico bundle)
- **Batch 10 icons**: ~2–3 sec total

For high-volume rendering, consider:
- GNU parallel: `find . -name "*.png" | parallel ./favicon_multi.sh {} {.}`
- Make-based orchestration: Batch rules for icon + hero + favicon pipeline

## Troubleshooting

**"convert: not authorized"** (macOS)
```bash
xattr -d com.apple.quarantine /usr/local/bin/magick
```

**Text not rendering (font not found)**
- Verify font path: `magick -list font | grep Arial`
- Fallback: Use system fonts or specify full path: `-font /Library/Fonts/Arial.ttf`

**ICO not created**
- Ensure all input PNGs are valid: `magick identify *.png`
- ImageMagick policy.xml may restrict .ico; check `/etc/ImageMagick-6/policy.xml`

## See Also

- **Blender scripts**: `../blender/` (icon + hero renders)
- **FFmpeg**: `../ffmpeg/` (video transcode)
- **Orchestrator**: `../orchestrator/` (manifest + dispatch)
