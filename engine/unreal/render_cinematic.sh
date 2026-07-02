#!/bin/bash
# Headless Unreal Engine 5.7 cinematics render script for phenoDesign
# Cross-platform wrapper (calls .ps1 on Windows, native on Unix)

set -e

usage() {
	cat <<EOF
Usage: $0 -p PROJECT_PATH [options]

Options:
  -p, --project PROJECT_PATH     Path to .uproject file (required)
  -l, --level LEVEL_NAME         Starting level name (optional)
  -o, --output OUTPUT_DIR        Output directory (optional)
  -x, --res-x WIDTH              Output width (default: 1920)
  -y, --res-y HEIGHT             Output height (default: 1080)
  -r, --framerate RATE           Frame rate (default: 24)
  -c, --codec CODEC              Video codec: h264, h265, prores (default: h264)
  -q, --quality QUALITY          Encoding quality 0-100 (default: 95)
  -h, --help                     Show this help message

Example:
  $0 -p E:/Dev/phenoDesign-UE5/phenoDesign.uproject -o E:/renders/hero_01
EOF
	exit ${1:-0}
}

# Defaults
PROJECT_PATH=""
LEVEL_NAME=""
OUTPUT_DIR=""
RESX=1920
RESY=1080
FRAMERATE=24
CODEC="h264"
QUALITY=95

# Parse arguments
while [[ $# -gt 0 ]]; do
	case $1 in
		-p|--project) PROJECT_PATH="$2"; shift 2 ;;
		-l|--level) LEVEL_NAME="$2"; shift 2 ;;
		-o|--output) OUTPUT_DIR="$2"; shift 2 ;;
		-x|--res-x) RESX="$2"; shift 2 ;;
		-y|--res-y) RESY="$2"; shift 2 ;;
		-r|--framerate) FRAMERATE="$2"; shift 2 ;;
		-c|--codec) CODEC="$2"; shift 2 ;;
		-q|--quality) QUALITY="$2"; shift 2 ;;
		-h|--help) usage 0 ;;
		*) echo "Unknown option: $1"; usage 1 ;;
	esac
done

# Validate
if [ -z "$PROJECT_PATH" ]; then
	echo "Error: Project path required (-p)"
	usage 1
fi

if [ ! -f "$PROJECT_PATH" ]; then
	echo "Error: Project not found: $PROJECT_PATH"
	exit 1
fi

# Windows: delegate to PowerShell
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
	SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
	PS_SCRIPT="$SCRIPT_DIR/render_cinematic.ps1"

	if [ ! -f "$PS_SCRIPT" ]; then
		echo "Error: PowerShell script not found: $PS_SCRIPT"
		exit 1
	fi

	# Build PowerShell invocation
	PS_ARGS="-ProjectPath \"$PROJECT_PATH\""
	[ -n "$LEVEL_NAME" ] && PS_ARGS="$PS_ARGS -LevelName \"$LEVEL_NAME\""
	[ -n "$OUTPUT_DIR" ] && PS_ARGS="$PS_ARGS -OutputDir \"$OUTPUT_DIR\""
	PS_ARGS="$PS_ARGS -ResX $RESX -ResY $RESY -FrameRate $FRAMERATE -Codec $CODEC -Quality $QUALITY"

	# Execute via PowerShell
	pwsh -NoProfile -ExecutionPolicy Bypass -Command "&\"$PS_SCRIPT\" $PS_ARGS"
	exit $?
fi

# Unix/Linux: direct invocation (stub for future)
echo "Unix/Linux rendering not yet implemented"
echo "On Windows, use: powershell -NoProfile -ExecutionPolicy Bypass -File render_cinematic.ps1 ..."
exit 1
