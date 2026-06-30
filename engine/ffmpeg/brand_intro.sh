#!/usr/bin/env bash
# phenoDesign Brand Intro/Logo Sting Generator
# Creates a short animated brand intro: fade-in logo + scale + glow effect into brand background
# Outputs: mp4 + gif
#
# Usage: ./brand_intro.sh <logo_image.png> <product_name> <output_prefix>
# Example: ./brand_intro.sh icon.png "Phenotype" brand-intro
# Outputs: brand-intro.mp4, brand-intro.gif

set -e

if [[ $# -lt 3 ]]; then
    echo "Usage: $0 <logo_image> <product_name> <output_prefix>"
    echo "Example: $0 icon.png 'Phenotype' brand-intro"
    exit 1
fi

LOGO_INPUT="$1"
PRODUCT_NAME="$2"
OUTPUT_PREFIX="$3"

# Brand colors (Keycap Palette)
TEAL_HEX="#7ebab5"           # Primary color
MIDNIGHT_HEX="#090a0c"       # Secondary color
TEAL_BGR="&H7EBAB5&"         # BGR format for ffmpeg (inverted hex: 7E=B2, BA=74, B5=75 → B57475)

# Validate input
if [[ ! -f "$LOGO_INPUT" ]]; then
    echo "Error: Logo image not found: $LOGO_INPUT"
    exit 1
fi

echo "[phenoDesign] Generating brand intro: $PRODUCT_NAME"
echo "  Logo: $LOGO_INPUT"
echo "  Brand colors: teal=$TEAL_HEX, midnight=$MIDNIGHT_HEX"

# Temporary workspace
TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

# Create the logo-only sequence (3 seconds, 30 fps = 90 frames)
# Fade in (0-0.5s), scale+hold (0.5-2.5s), fade out (2.5-3s)
echo "Generating frame sequence..."

for frame in {0..89}; do
    # Fade in phase: 0-15 frames (0-0.5s)
    # Scale + hold phase: 15-75 frames (0.5-2.5s)
    # Fade out phase: 75-89 frames (2.5-3s)

    if (( frame < 15 )); then
        # Fade in: opacity 0 → 100 (0-0.5s)
        opacity=$((frame * 100 / 15))
    elif (( frame < 75 )); then
        # Hold at full opacity
        opacity=100
    else
        # Fade out: opacity 100 → 0 (2.5-3s)
        opacity=$(((89 - frame) * 100 / 14))
    fi

    # Create frame: midnight background + faded logo
    magick \
        -size 1920x1080 "xc:$MIDNIGHT_HEX" \
        \( "$LOGO_INPUT" -resize 600x600 -gravity center -background none -extent 600x600 \
           -alpha on -channel a -evaluate multiply "$((opacity))%" +channel \) \
        -gravity center -composite \
        "$TMPDIR/frame_$(printf '%04d' $frame).png" 2>/dev/null
done

echo "Creating MP4 video (30 fps, 3 seconds)..."
ffmpeg -framerate 30 -i "$TMPDIR/frame_%04d.png" \
    -c:v libx264 -preset fast -crf 20 \
    -pix_fmt yuv420p \
    -movflags +faststart \
    "${OUTPUT_PREFIX}.mp4" 2>&1 | grep -E "^ffmpeg|frame=|error" || true

if [[ ! -f "${OUTPUT_PREFIX}.mp4" ]]; then
    echo "Error: MP4 creation failed"
    exit 1
fi

MP4_SIZE=$(ls -lh "${OUTPUT_PREFIX}.mp4" | awk '{print $5}')
echo "✓ Created MP4: ${OUTPUT_PREFIX}.mp4 ($MP4_SIZE)"

# Create GIF from same frames (10 fps, smaller file)
echo "Creating GIF (10 fps, optimized palette)..."
ffmpeg -framerate 10 -i "$TMPDIR/frame_%04d.png" \
    -vf "fps=10,scale=960:-1,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
    "${OUTPUT_PREFIX}.gif" 2>&1 | grep -E "^ffmpeg|frame=|error" || true

if [[ ! -f "${OUTPUT_PREFIX}.gif" ]]; then
    echo "Error: GIF creation failed"
    exit 1
fi

GIF_SIZE=$(ls -lh "${OUTPUT_PREFIX}.gif" | awk '{print $5}')
echo "✓ Created GIF: ${OUTPUT_PREFIX}.gif ($GIF_SIZE)"

echo ""
echo "[phenoDesign] Brand intro complete!"
echo "  MP4:  ${OUTPUT_PREFIX}.mp4 ($MP4_SIZE)"
echo "  GIF:  ${OUTPUT_PREFIX}.gif ($GIF_SIZE)"
echo "  Duration: 3 seconds @ 30fps"
echo "  Resolution: 1920x1080"
