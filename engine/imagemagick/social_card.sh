#!/usr/bin/env bash
# phenoDesign Social/OG Card Generator
# Creates a beautiful on-brand social card (1200×630): midnight gradient bg + teal accents + icon + text
#
# Usage: ./social_card.sh <icon_image> <product_name> <tagline> <output.png>
# Example: ./social_card.sh icon.png "Phenotype" "Beautiful asset automation" card.png

set -e

if [[ $# -lt 4 ]]; then
    echo "Usage: $0 <icon_image> <product_name> <tagline> <output.png>"
    echo "Example: $0 icon.png 'Phenotype' 'Beautiful asset automation' card.png"
    exit 1
fi

ICON_INPUT="$1"
PRODUCT_NAME="$2"
TAGLINE="$3"
OUTPUT="$4"

# Brand colors (Keycap Palette)
TEAL="#7ebab5"
MIDNIGHT="#090a0c"
FROST="#e8f4f2"

# Standard OG card dimensions
WIDTH=1200
HEIGHT=630

echo "[phenoDesign] Generating social card"
echo "  Dimensions: ${WIDTH}x${HEIGHT}"
echo "  Product: $PRODUCT_NAME"
echo "  Tagline: $TAGLINE"
echo "  Colors: teal=$TEAL, midnight=$MIDNIGHT"

# Validate input
if [[ ! -f "$ICON_INPUT" ]]; then
    echo "Error: Icon image not found: $ICON_INPUT"
    exit 1
fi

TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

# Step 1: Create gradient background (midnight left → darker midnight right)
# Use a subtle gradient for depth
echo "Creating gradient background..."
magick -size "${WIDTH}x${HEIGHT}" \
    gradient:"$MIDNIGHT"-"#050506" \
    "$TMPDIR/bg.png"

# Step 2: Add accent bar on left (teal stripe, 8px)
echo "Adding teal accent bar..."
magick "$TMPDIR/bg.png" \
    -fill "$TEAL" \
    -draw "rectangle 0,0 8,$HEIGHT" \
    "$TMPDIR/bg_accent.png"

# Step 3: Resize and prepare icon (300x300 in circle mask on right side)
echo "Preparing icon..."
magick "$ICON_INPUT" \
    -resize 300x300 \
    -background none \
    -gravity center \
    -extent 320x320 \
    "$TMPDIR/icon_sized.png"

# Create circular mask for icon
magick -size 320x320 xc:none \
    -fill white \
    -draw "circle 160,160 160,10" \
    "$TMPDIR/icon_mask.png"

# Apply mask to icon
magick "$TMPDIR/icon_sized.png" \
    "$TMPDIR/icon_mask.png" \
    -alpha off \
    -compose CopyOpacity -composite \
    -trim \
    +repage \
    "$TMPDIR/icon_masked.png"

# Step 4: Composite icon onto background (right side, centered vertically)
# Position icon at x=850 (1200-350), y=165 (centered vertically in 630)
echo "Compositing elements..."
magick "$TMPDIR/bg_accent.png" \
    "$TMPDIR/icon_masked.png" \
    -gravity center \
    -geometry +350+0 \
    -composite \
    "$TMPDIR/with_icon.png"

# Step 5: Add text layers
# Product name: left side, 72pt bold teal
# Tagline: left side below name, 36pt frost
echo "Adding text layers..."

magick "$TMPDIR/with_icon.png" \
    -font "Arial-Bold" \
    -pointsize 72 \
    -fill "$TEAL" \
    -gravity NorthWest \
    -annotate +40+80 "$PRODUCT_NAME" \
    -pointsize 36 \
    -fill "$FROST" \
    -annotate +40+180 "$TAGLINE" \
    "$OUTPUT"

if [[ ! -f "$OUTPUT" ]]; then
    echo "Error: Social card creation failed"
    exit 1
fi

OUTPUT_SIZE=$(ls -lh "$OUTPUT" | awk '{print $5}')
echo "✓ Created social card: $OUTPUT ($OUTPUT_SIZE)"
echo ""
echo "[phenoDesign] Social card complete!"
echo "  Dimensions: ${WIDTH}x${HEIGHT}"
echo "  File: $OUTPUT ($OUTPUT_SIZE)"
echo "  Ready for: Twitter, LinkedIn, Open Graph, Slack"
