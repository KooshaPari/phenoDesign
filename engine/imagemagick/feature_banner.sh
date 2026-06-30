#!/usr/bin/env bash
# phenoDesign Feature Banner Generator
# Creates a wide hero/banner with brand treatment (1920×600)
# Midnight gradient + teal accents + icon + headline + description
#
# Usage: ./feature_banner.sh <icon_image> <headline> <description> <output.png>
# Example: ./feature_banner.sh icon.png "Asset Automation" "Create beautiful branded assets instantly" banner.png

set -e

if [[ $# -lt 4 ]]; then
    echo "Usage: $0 <icon_image> <headline> <description> <output.png>"
    echo "Example: $0 icon.png 'Asset Automation' 'Create branded assets instantly' banner.png"
    exit 1
fi

ICON_INPUT="$1"
HEADLINE="$2"
DESCRIPTION="$3"
OUTPUT="$4"

# Brand colors (Keycap Palette)
TEAL="#7ebab5"
MIDNIGHT="#090a0c"
FROST="#e8f4f2"

# Wide banner dimensions
WIDTH=1920
HEIGHT=600

echo "[phenoDesign] Generating feature banner"
echo "  Dimensions: ${WIDTH}x${HEIGHT}"
echo "  Headline: $HEADLINE"
echo "  Colors: teal=$TEAL, midnight=$MIDNIGHT"

# Validate input
if [[ ! -f "$ICON_INPUT" ]]; then
    echo "Error: Icon image not found: $ICON_INPUT"
    exit 1
fi

TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

# Step 1: Create rich gradient background
# Midnight → darker with teal glow on left
echo "Creating gradient background..."
magick -size "${WIDTH}x${HEIGHT}" \
    gradient:"$MIDNIGHT"-"#0a0b0d" \
    "$TMPDIR/bg.png"

# Step 2: Add top accent bar (teal, 6px) and left vertical stripe (teal, 4px)
echo "Adding teal accent elements..."
magick "$TMPDIR/bg.png" \
    -fill "$TEAL" \
    -draw "rectangle 0,0 $WIDTH,6" \
    -draw "rectangle 0,0 4,$HEIGHT" \
    "$TMPDIR/bg_accents.png"

# Step 3: Add semi-transparent glow effect on right side (teal gradient overlay)
# This creates visual depth and draws eye toward content
echo "Adding depth glow..."
magick "$TMPDIR/bg_accents.png" \
    \( -size "${WIDTH}x${HEIGHT}" gradient:"$TEAL"-none \
       -alpha off -negate -alpha off \) \
    -compose blend -define compose:args=15 -composite \
    "$TMPDIR/bg_with_glow.png"

# Step 4: Prepare icon (400x400, transparent background)
echo "Preparing icon..."
magick "$ICON_INPUT" \
    -resize 400x400 \
    -background none \
    -gravity center \
    -extent 400x400 \
    "$TMPDIR/icon_sized.png"

# Step 5: Composite icon onto background (right side, centered vertically)
# x = 1400 (1920 - 520), y = 100 (centered in 600)
echo "Compositing icon..."
magick "$TMPDIR/bg_with_glow.png" \
    "$TMPDIR/icon_sized.png" \
    -gravity center \
    -geometry +650+0 \
    -composite \
    "$TMPDIR/with_icon.png"

# Step 6: Add text layers
# Headline: 80pt bold teal, left side, upper
# Description: 48pt frost, left side, below headline
echo "Adding text layers..."

magick "$TMPDIR/with_icon.png" \
    -font "Arial-Bold" \
    -pointsize 80 \
    -fill "$TEAL" \
    -gravity West \
    -annotate +60+-100 "$HEADLINE" \
    -font "Arial" \
    -pointsize 48 \
    -fill "$FROST" \
    -annotate +60+40 "$DESCRIPTION" \
    "$OUTPUT"

if [[ ! -f "$OUTPUT" ]]; then
    echo "Error: Feature banner creation failed"
    exit 1
fi

OUTPUT_SIZE=$(ls -lh "$OUTPUT" | awk '{print $5}')
echo "✓ Created feature banner: $OUTPUT ($OUTPUT_SIZE)"
echo ""
echo "[phenoDesign] Feature banner complete!"
echo "  Dimensions: ${WIDTH}x${HEIGHT}"
echo "  File: $OUTPUT ($OUTPUT_SIZE)"
echo "  Ready for: Landing pages, hero sections, marketing materials"
