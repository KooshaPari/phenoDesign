#!/usr/bin/env bash
# phenoDesign Screencast Polisher
# Takes a screen recording or image sequence → polished demo MP4
# Trims, scales, adds branded lower-third/title card
#
# Usage: ./screencast_to_demo.sh <input_video|frame_pattern> <product_name> <output_prefix> [--trim-start=SEC] [--trim-end=SEC]
# Example: ./screencast_to_demo.sh recording.mov "Phenotype" demo
# Example: ./screencast_to_demo.sh frame_%04d.png "Tracera" demo --trim-start=2 --trim-end=120

set -e

if [[ $# -lt 3 ]]; then
    echo "Usage: $0 <input> <product_name> <output_prefix> [--trim-start=SEC] [--trim-end=SEC]"
    echo "Example: $0 recording.mov 'Phenotype' demo"
    echo "Example: $0 frame_%04d.png 'Tracera' demo --trim-start=2 --trim-end=120"
    exit 1
fi

INPUT="$1"
PRODUCT_NAME="$2"
OUTPUT_PREFIX="$3"
TRIM_START=${4:-0}
TRIM_END=${5:-}

# Brand colors
TEAL_HEX="#7ebab5"
MIDNIGHT_HEX="#090a0c"

# Parse optional trim arguments
for arg in "${@:4}"; do
    if [[ "$arg" =~ --trim-start=([0-9.]+) ]]; then
        TRIM_START="${BASH_REMATCH[1]}"
    elif [[ "$arg" =~ --trim-end=([0-9.]+) ]]; then
        TRIM_END="${BASH_REMATCH[1]}"
    fi
done

echo "[phenoDesign] Processing screencast: $PRODUCT_NAME"
echo "  Input: $INPUT"
echo "  Brand colors: teal=$TEAL_HEX, midnight=$MIDNIGHT_HEX"

# Detect if input is image sequence or video file
if [[ "$INPUT" =~ %[0-9]d ]]; then
    echo "  Mode: Image sequence"
    FRAMERATE=30
    # Build ffmpeg input from sequence
    INPUT_SPEC=(-framerate "$FRAMERATE" -i "$INPUT")
else
    echo "  Mode: Video file"
    # Get video info
    if ! ffprobe -v quiet -select_streams v:0 -show_entries stream=duration "$INPUT" >/dev/null 2>&1; then
        echo "Error: Cannot read input video: $INPUT"
        exit 1
    fi
    INPUT_SPEC=(-i "$INPUT")
fi

TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

# Step 1: Convert/scale input (1920x1080 if needed)
echo "Scaling input to 1920x1080..."
if [[ "$INPUT" =~ %[0-9]d ]]; then
    ffmpeg "${INPUT_SPEC[@]}" \
        -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=$MIDNIGHT_HEX" \
        -c:v libx264 -preset fast -crf 20 \
        "$TMPDIR/scaled.mp4" 2>&1 | grep -E "^ffmpeg|frame=|error" || true
else
    ffmpeg "${INPUT_SPEC[@]}" \
        -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=$MIDNIGHT_HEX" \
        -c:v libx264 -preset fast -crf 20 \
        "$TMPDIR/scaled.mp4" 2>&1 | grep -E "^ffmpeg|frame=|error" || true
fi

if [[ ! -f "$TMPDIR/scaled.mp4" ]]; then
    echo "Error: Scaling failed"
    exit 1
fi

# Step 2: Add lower-third / title overlay
# Create a 20% height band at bottom with product name + tagline
echo "Adding lower-third branding..."
TAGLINE="Beautiful asset automation"

ffmpeg -i "$TMPDIR/scaled.mp4" \
    -vf "
    drawbox=x=0:y=ih*0.8:w=iw:h=ih*0.2:color=$MIDNIGHT_HEX:thickness=fill,
    drawtext=text='$PRODUCT_NAME':fontfile=/Windows/Fonts/arial.ttf:fontsize=72:fontcolor=$TEAL_HEX:x=60:y=h-280:fontweight=bold,
    drawtext=text='$TAGLINE':fontfile=/Windows/Fonts/arial.ttf:fontsize=36:fontcolor=$TEAL_HEX:x=60:y=h-180
    " \
    -c:v libx264 -preset fast -crf 20 \
    -c:a aac -b:a 128k \
    "$TMPDIR/with_overlay.mp4" 2>&1 | grep -E "^ffmpeg|frame=|error" || true

if [[ ! -f "$TMPDIR/with_overlay.mp4" ]]; then
    echo "Warning: Overlay failed, using scaled version"
    cp "$TMPDIR/scaled.mp4" "$TMPDIR/with_overlay.mp4"
fi

# Step 3: Trim if requested
if [[ -n "$TRIM_START" || -n "$TRIM_END" ]]; then
    echo "Trimming video (start=$TRIM_START, end=$TRIM_END)..."
    TRIM_FILTER=""
    if [[ -n "$TRIM_START" ]]; then
        TRIM_FILTER="trim=start=$TRIM_START"
    fi
    if [[ -n "$TRIM_END" ]]; then
        if [[ -n "$TRIM_FILTER" ]]; then
            TRIM_FILTER="$TRIM_FILTER:end=$TRIM_END"
        else
            TRIM_FILTER="trim=end=$TRIM_END"
        fi
    fi

    ffmpeg -i "$TMPDIR/with_overlay.mp4" \
        -vf "$TRIM_FILTER" \
        -c:v libx264 -preset fast -crf 20 \
        -c:a aac -b:a 128k \
        "$TMPDIR/trimmed.mp4" 2>&1 | grep -E "^ffmpeg|frame=|error" || true

    if [[ -f "$TMPDIR/trimmed.mp4" ]]; then
        FINAL_INPUT="$TMPDIR/trimmed.mp4"
    else
        FINAL_INPUT="$TMPDIR/with_overlay.mp4"
    fi
else
    FINAL_INPUT="$TMPDIR/with_overlay.mp4"
fi

# Step 4: Final encode for web distribution
echo "Finalizing MP4 (web-optimized)..."
ffmpeg -i "$FINAL_INPUT" \
    -c:v libx264 -preset fast -crf 23 \
    -c:a aac -b:a 128k \
    -movflags +faststart \
    "${OUTPUT_PREFIX}.mp4" 2>&1 | grep -E "^ffmpeg|frame=|error" || true

if [[ ! -f "${OUTPUT_PREFIX}.mp4" ]]; then
    echo "Error: Final MP4 creation failed"
    exit 1
fi

MP4_SIZE=$(ls -lh "${OUTPUT_PREFIX}.mp4" | awk '{print $5}')
echo "✓ Created demo MP4: ${OUTPUT_PREFIX}.mp4 ($MP4_SIZE)"

echo ""
echo "[phenoDesign] Screencast processing complete!"
echo "  Output: ${OUTPUT_PREFIX}.mp4 ($MP4_SIZE)"
echo "  Resolution: 1920x1080"
echo "  Codec: H.264 @ 23 CRF (web-optimized)"
