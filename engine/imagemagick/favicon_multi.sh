#!/usr/bin/env bash
# Generate multi-resolution favicons from a single PNG.
# Usage: ./favicon_multi.sh <input.png> <output_prefix>
# Example: ./favicon_multi.sh icon.png tracera
# Outputs: tracera_16.png, tracera_32.png, tracera_64.png, tracera_128.png, tracera.ico

set -e

if [[ $# -lt 2 ]]; then
    echo "Usage: $0 <input.png> <output_prefix>"
    echo "Example: $0 tracera_icon.png tracera"
    exit 1
fi

INPUT="$1"
PREFIX="$2"

if [[ ! -f "$INPUT" ]]; then
    echo "Error: Input file not found: $INPUT"
    exit 1
fi

echo "Generating favicons for: $INPUT"

# Generate each size with center gravity and padding
magick "$INPUT" -resize 16x16 -gravity center -extent 16x16 "${PREFIX}_16.png"
echo "✓ ${PREFIX}_16.png"

magick "$INPUT" -resize 32x32 -gravity center -extent 32x32 "${PREFIX}_32.png"
echo "✓ ${PREFIX}_32.png"

magick "$INPUT" -resize 64x64 -gravity center -extent 64x64 "${PREFIX}_64.png"
echo "✓ ${PREFIX}_64.png"

magick "$INPUT" -resize 128x128 -gravity center -extent 128x128 "${PREFIX}_128.png"
echo "✓ ${PREFIX}_128.png"

# Combine into .ico (Windows + browser favicon)
magick "${PREFIX}_16.png" "${PREFIX}_32.png" "${PREFIX}_64.png" "${PREFIX}_128.png" "${PREFIX}.ico"
echo "✓ ${PREFIX}.ico"

echo "Complete: ${PREFIX}_{16,32,64,128}.png + ${PREFIX}.ico"
