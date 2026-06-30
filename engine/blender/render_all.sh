#!/usr/bin/env bash
# Batch render script for phenoDesign Blender assets.
# Renders glassmorphic icons + hero images for all apps in a manifest.
# Usage: ./render_all.sh [output-dir]
# Example: ./render_all.sh ../../../dist/assets

set -e

OUTPUT_DIR="${1:-.}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== phenoDesign Blender Batch Render ==="
echo "Output: $OUTPUT_DIR"

# Create output structure
mkdir -p "$OUTPUT_DIR/icons"
mkdir -p "$OUTPUT_DIR/heroes"

# Array of apps (slug, display_name)
# Expand this with your actual app list from orchestrator/manifest.json
declare -a APPS=(
    "tracera|Tracera"
    "agileplus|AgilePlus"
    "phenotype|Phenotype"
    "civis|Civis"
)

for app_entry in "${APPS[@]}"; do
    IFS='|' read -r SLUG NAME <<< "$app_entry"
    echo "Rendering: $SLUG ($NAME)"

    # Render icon (512×512)
    blender -b -P "$SCRIPT_DIR/glass_icon.py" -- "$SLUG" "$OUTPUT_DIR/icons/${SLUG}_icon.png" 2>&1 | grep -E "^(Blender|Writing|PASS|FAIL)" || true

    # Render hero (1200×630)
    blender -b -P "$SCRIPT_DIR/hero.py" -- "$SLUG" "$OUTPUT_DIR/heroes/${SLUG}_hero.png" 2>&1 | grep -E "^(Blender|Writing|PASS|FAIL)" || true
done

echo "=== Render Complete ==="
echo "Icons: $OUTPUT_DIR/icons/"
echo "Heroes: $OUTPUT_DIR/heroes/"
