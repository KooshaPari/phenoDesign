#!/usr/bin/env pwsh
<#
.SYNOPSIS
Headless Unreal Engine 5.7 cinematics render script for phenoDesign

.DESCRIPTION
Renders movie sequences via UnrealEditor-Cmd.exe with MovieRenderQueue.
Supports batch rendering, custom output paths, and resolution/codec options.

.PARAMETER ProjectPath
Path to .uproject file (e.g., E:/Dev/phenoDesign-UE5/phenoDesign.uproject)

.PARAMETER LevelName
Starting level/map name (e.g., "Level_Hero" or blank for default)

.PARAMETER OutputDir
Output directory for rendered frames/video (default: project Renders/)

.PARAMETER ResX
Output width (default: 1920)

.PARAMETER ResY
Output height (default: 1080)

.PARAMETER FrameRate
Frame rate numerator (default: 24)

.PARAMETER Codec
Video codec: h264, h265, prores (default: h264)

.PARAMETER Quality
Encoding quality 0-100 (default: 95)

.EXAMPLE
.\render_cinematic.ps1 -ProjectPath "E:/Dev/phenoDesign-UE5/phenoDesign.uproject" -OutputDir "E:/renders/hero_01"

.EXAMPLE
.\render_cinematic.ps1 -ProjectPath "E:/Dev/phenoDesign-UE5/phenoDesign.uproject" -ResX 3840 -ResY 2160 -Codec h265

#>

param(
	[Parameter(Mandatory=$true, HelpMessage="Path to .uproject file")]
	[string]$ProjectPath,

	[Parameter(Mandatory=$false, HelpMessage="Starting level name")]
	[string]$LevelName = "",

	[Parameter(Mandatory=$false, HelpMessage="Output directory")]
	[string]$OutputDir = "",

	[Parameter(Mandatory=$false, HelpMessage="Output width")]
	[int]$ResX = 1920,

	[Parameter(Mandatory=$false, HelpMessage="Output height")]
	[int]$ResY = 1080,

	[Parameter(Mandatory=$false, HelpMessage="Frame rate numerator")]
	[int]$FrameRate = 24,

	[Parameter(Mandatory=$false, HelpMessage="Video codec")]
	[string]$Codec = "h264",

	[Parameter(Mandatory=$false, HelpMessage="Encoding quality 0-100")]
	[int]$Quality = 95
)

$UE_BIN = "C:\Program Files\Epic Games\UE_5.7\Engine\Binaries\Win64\UnrealEditor-Cmd.exe"
$UE_EXE = $UE_BIN -replace '\.exe$', ''

# Validate project path
if (-not (Test-Path $ProjectPath)) {
	Write-Error "Project not found: $ProjectPath" -ErrorAction Stop
}

# Default output directory if not specified
if ([string]::IsNullOrWhiteSpace($OutputDir)) {
	$ProjectDir = Split-Path -Parent $ProjectPath
	$OutputDir = Join-Path $ProjectDir "Renders"
}

# Ensure output directory exists
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
Write-Host "Output directory: $OutputDir"

# Build command line
$args = @(
	"`"$ProjectPath`"",
	"-Unattended",
	"-NoGUI",
	"-NullRHI",  # Headless mode
	"-NoTextureStreaming",
	"-NoLoadingScreen",
	"-NoScreenMessages",
	"-ResX=$ResX",
	"-ResY=$ResY",
	"-MovieFolder=`"$OutputDir`"",
	"-MovieFrameRate=$FrameRate",
	"-MovieQuality=$Quality",
	"-MovieCodec=$Codec",
	"-Log=`"$OutputDir\render.log`""
)

if ([string]::IsNullOrWhiteSpace($LevelName) -eq $false) {
	$args += "-LevelToLoad=$LevelName"
}

# Log invocation
Write-Host "Rendering with UnrealEditor-Cmd.exe..."
Write-Host "Command: $UE_EXE $($args -join ' ')"
Write-Host ""

# Execute
try {
	& $UE_BIN @args

	# Check for output
	$outputFiles = Get-ChildItem -Path $OutputDir -Recurse -ErrorAction SilentlyContinue | Where-Object { -not $_.PSIsContainer }

	if ($outputFiles) {
		Write-Host "`n✓ Render completed. Output files:"
		foreach ($file in $outputFiles) {
			$size = (Get-Item $file.FullName).Length
			$sizeMB = [math]::Round($size / 1MB, 2)
			Write-Host "  - $($file.Name) ($sizeMB MB)"
		}
	} else {
		Write-Host "`n⚠ No output files found in $OutputDir"
		Write-Host "Check log: $OutputDir\render.log"
	}
}
catch {
	Write-Error "Render failed: $_" -ErrorAction Stop
}
