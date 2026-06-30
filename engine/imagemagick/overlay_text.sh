#!/usr/bin/env bash
# Overlay app name onto hero/OG image with brand colors.
# Usage: ./overlay_text.sh <input.png> <text> <output.png> [position]
# Positions: NorthEast (default), NorthWest, SouthEast, SouthWest, Center
# Example: ./overlay_text.sh agileplus_hero.png "AgilePlus" agileplus_titled.png NorthEast

set -e

INPUT="${1:?Input PNG required}"
TEXT="${2:?Text required}"
OUTPUT="${3:?Output filename required}"
POSITION="${4:-NorthEast}"

if [[ ! -f "$INPUT" ]]; then
    echo "Error: Input file not found: $INPUT"
    exit 1
fi

# Brand tokens
TEAL="#7ebab5"
MIDNIGHT="#090a0c"
FONT_SIZE=72
OFFSET=30

echo "Overlaying text on hero image..."
echo "Input: $INPUT"
echo "Text: $TEXT"
echo "Position: $POSITION"
echo "Output: $OUTPUT"

# Overlay text with brand teal color, bold font
# Gravity placement with offset margins
magick "$INPUT" \
    -pointsize $FONT_SIZE \
    -fill "$TEAL" \
    -font Arial-Bold \
    -gravity "$POSITION" \
    -annotate "+${OFFSET}+${OFFSET}" "$TEXT" \
    "$OUTPUT"

echo "✓ Complete: $OUTPUT"
