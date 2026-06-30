# FFmpeg Video Pipeline

Headless video encoding and frame operations for the phenoDesign engine. Handles transcoding screen recordings, converting frame sequences to MP4/GIF, and applying filters.

## Purpose

Post-process and distribute video assets:
- **Screen recording transcode** (MOV → MP4 H.264 with hardware acceleration)
- **Frame sequence → MP4/GIF** (PNG/JPG sequence → H.264 or GIF)
- **Audio sync** (video + audio track in single file)
- **Format conversion** (WebM VP8, HEVC H.265, ProRes for archive)
- **Filters** (crop, scale, slow-motion, subtitle burn-in)

## Dependencies

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg libx264-dev libvpx-dev libopus-dev

# Windows (choco or direct)
choco install ffmpeg
# OR https://ffmpeg.org/download.html
```

Verify:
```bash
ffmpeg -version
ffmpeg -encoders | grep -E "h264|vp8|hevc"
```

### Optional: Hardware Acceleration

For NVIDIA GPU encoding (RTX 3090 Ti recommended):

```bash
# Windows
ffmpeg -encoders | grep -E "h264_nvenc|hevc_nvenc"

# Linux (NVIDIA CUDA)
ffmpeg -encoders | grep -E "h264_nvenc|hevc_nvenc"
```

If available, use `-c:v h264_nvenc` instead of `-c:v libx264` for 5–10x speedup.

## Usage

### Screen Recording → MP4

**Input**: QuickTime MOV (e.g., from macOS ScreenFlow)
**Output**: H.264 MP4 (streaming-friendly, browsers)

```bash
ffmpeg -i input.mov -c:v libx264 -crf 18 -c:a aac -b:a 128k output.mp4
```

Flags:
- `-c:v libx264`: H.264 video codec
- `-crf 18`: Quality (0–51; 18 = visually lossless, 23 = default, 28 = typical)
- `-c:a aac`: Audio codec (AAC for MP4 compat)
- `-b:a 128k`: Audio bitrate

### PNG Sequence → MP4

**Input**: Frame sequence (frame_0001.png, frame_0002.png, ...)
**Output**: 30 fps MP4

```bash
ffmpeg -framerate 30 -i frame_%04d.png -c:v libx264 -crf 18 output.mp4
```

### PNG Sequence → GIF

**Input**: PNG sequence
**Output**: Animated GIF (web-friendly)

```bash
ffmpeg -i frame_%04d.png -vf "fps=10,scale=1200:-1" output.gif
```

Flags:
- `fps=10`: Reduce frame rate to 10 fps (smaller GIF)
- `scale=1200:-1`: Scale to 1200 px wide, maintain aspect

### Crop Video

**Input**: Full resolution recording
**Output**: Cropped to region-of-interest

```bash
ffmpeg -i input.mov -vf "crop=1920:1080:0:0" output.mp4
```

Crop format: `crop=width:height:x:y` (x,y = top-left corner)

### Slow Motion (50% speed)

```bash
ffmpeg -i input.mov -filter:v "setpts=2.0*PTS" -filter:a "atempo=0.5" output.mp4
```

### Burn-in Subtitles

```bash
ffmpeg -i input.mov \
  -vf "subtitles=subs.srt:force_style='FontName=Arial,FontSize=24,PrimaryColour=&H7EBAB5'" \
  output.mp4
```

(Requires SRT subtitle file; color in hex BGR format)

## Batch Processing

Transcode all .mov files to .mp4:

```bash
for file in *.mov; do
    output="${file%.mov}.mp4"
    echo "Encoding: $file → $output"
    ffmpeg -i "$file" -c:v libx264 -crf 18 -c:a aac -b:a 128k "$output"
done
```

Convert PNG sequence to MP4 with multiple speeds:

```bash
# 24 fps
ffmpeg -framerate 24 -i frame_%04d.png -c:v libx264 -crf 18 output_24fps.mp4

# 30 fps
ffmpeg -framerate 30 -i frame_%04d.png -c:v libx264 -crf 18 output_30fps.mp4
```

## Performance Notes

- **H.264 encoding** (libx264, CRF 18): ~2–4 sec per 1 min of 1080p video (CPU)
- **H.264 encoding** (NVIDIA NVENC): ~0.1–0.3 sec per 1 min of 1080p (GPU)
- **GIF encoding**: ~5–15 sec per 1 min (slow, consider MP4 instead)
- **Frame sequence → MP4**: ~100 frames/sec (CPU)

Use hardware acceleration if available for production workflows.

## Presets

### Web-optimized H.264 (streaming)
```bash
ffmpeg -i input.mov \
  -c:v libx264 \
  -preset fast \
  -crf 23 \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  output.mp4
```

Flag meanings:
- `-preset fast`: Trade quality for speed (default `medium`, slower `slow`)
- `-movflags +faststart`: MP4 header first (enables progressive download)

### Archive-quality (ProRes)
```bash
ffmpeg -i input.mov \
  -c:v prores_ks \
  -profile:v 3 \
  -c:a pcm_s16le \
  output.mov
```

### YouTube/social (H.264 + aac)
```bash
ffmpeg -i input.mov \
  -c:v libx264 -preset slow -crf 16 \
  -c:a aac -b:a 192k \
  -movflags +faststart \
  output.mp4
```

## Troubleshooting

**"Unknown encoder 'h264_nvenc'"**
- NVIDIA GPU support not available; fall back to `-c:v libx264`

**"Audio codec not found"**
- Use `-c:a aac` (built-in) instead of other codecs
- Or install `libfdk-aac`: `brew install fdk-aac`

**GIF too large**
- Reduce frame rate: `fps=5` instead of `fps=10`
- Scale smaller: `scale=800:-1` instead of full res
- Limit colors: `-vf "fps=10,scale=800:-1,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse"`

**Seeking not working in MP4**
- Add `-movflags +faststart` (moves metadata to start)

## See Also

- **Blender**: `../blender/` (render base frames)
- **ImageMagick**: `../imagemagick/` (frame annotation + multi-res)
- **Orchestrator**: `../orchestrator/` (manifest + dispatch)
