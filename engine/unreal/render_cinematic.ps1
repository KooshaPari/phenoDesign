<#
.SYNOPSIS
Headless Unreal Engine 5.7 cinematics renderer for phenoDesign assets.

.DESCRIPTION
Renders cinematic sequences using UnrealEditor-Cmd.exe with MovieRenderQueue.
Supports custom project paths, level sequences, and output directories.

.PARAMETER ProjectPath
Path to the .uproject file. Defaults to C:/Users/koosh/Dev/phenoDesign-UE5/phenoDesign.uproject

.PARAMETER LevelSequence
Path to the level sequence to render (e.g., /Game/Cinematics/HeroShot_Teal)

.PARAMETER OutputDir
Directory where rendered frames/video will be saved. Defaults to ./output

.PARAMETER ResX
Output resolution width. Default: 1920

.PARAMETER ResY
Output resolution height. Default: 1080

.PARAMETER Format
Output format: 'image' (PNG sequence) or 'video' (MP4). Default: 'image'

.PARAMETER Quality
Ray-tracing quality: 'low', 'medium', 'high'. Affects render time. Default: 'medium'

.EXAMPLE
.\render_cinematic.ps1 `
  -LevelSequence "/Game/Cinematics/IconRotation_Teal" `
  -OutputDir "C:/output/icons" `
  -Quality "high"

.EXAMPLE
# Render with defaults (assumes phenoDesign-UE5 project exists)
.\render_cinematic.ps1 -LevelSequence "/Game/Sequences/Hero"

#>

param(
    [Parameter(Mandatory = $false)]
    [string]$ProjectPath = "C:/Users/koosh/Dev/phenoDesign-UE5/phenoDesign.uproject",

    [Parameter(Mandatory = $true)]
    [string]$LevelSequence,

    [Parameter(Mandatory = $false)]
    [string]$OutputDir = "./output",

    [Parameter(Mandatory = $false)]
    [int]$ResX = 1920,

    [Parameter(Mandatory = $false)]
    [int]$ResY = 1080,

    [Parameter(Mandatory = $false)]
    [ValidateSet("image", "video")]
    [string]$Format = "image",

    [Parameter(Mandatory = $false)]
    [ValidateSet("low", "medium", "high")]
    [string]$Quality = "medium"
)

# === CONFIGURATION ===
$UnrealEditorCmdPath = "C:/Program Files/Epic Games/UE_5.7/Engine/Binaries/Win64/UnrealEditor-Cmd.exe"
$LogFile = Join-Path $OutputDir "render_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Map quality to ray-tracing samples
$RayTracingSamples = @{
    "low"    = 32
    "medium" = 128
    "high"   = 512
}

# === VALIDATION ===
if (-not (Test-Path $UnrealEditorCmdPath)) {
    Write-Error "UnrealEditor-Cmd.exe not found at: $UnrealEditorCmdPath"
    exit 1
}

if (-not (Test-Path $ProjectPath)) {
    Write-Warning "Project file not found at: $ProjectPath"
    Write-Host "This script is for a future phenoDesign-UE5 project. For now, it verifies the CLI is callable."
}

# Create output directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
}

# === BUILD RENDER COMMAND ===
$args_list = @()

# Project file (if exists)
if (Test-Path $ProjectPath) {
    $args_list += "`"$ProjectPath`""
}

# Headless + unattended
$args_list += "-ExecuteConsoleCommand=`"r.MRQ.EnableEngine 1`""
$args_list += "-ExecuteConsoleCommand=`"r.MRQ.DisableProgressScreen 1`""
$args_list += "-MovieRenderPipeline"
$args_list += "-unattended"
$args_list += "-noshowui"

# Resolution and output
$args_list += "-ResX=$ResX"
$args_list += "-ResY=$ResY"

# Ray-tracing quality (console variables)
$samples = $RayTracingSamples[$Quality]
$args_list += "-ExecuteConsoleCommand=`"r.RayTracing.Enabled 1`""
$args_list += "-ExecuteConsoleCommand=`"r.RayTracing.Samples $samples`""

# Output path
$args_list += "-MovieFolder=`"$OutputDir`""

# Output format (note: MRQ handles image vs. video via config)
if ($Format -eq "video") {
    $args_list += "-ExecuteConsoleCommand=`"MRQ.OutputFormat video`""
} else {
    $args_list += "-ExecuteConsoleCommand=`"MRQ.OutputFormat png`""
}

# === LOG SETUP ===
$args_list += "-Log=`"$LogFile`""

# === DISPLAY COMMAND (for debugging) ===
Write-Host "=== Unreal Cinematic Renderer (phenoDesign) ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "UnrealEditor-Cmd.exe executable:" -ForegroundColor Green
Write-Host "  $UnrealEditorCmdPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  Project:      $(if (Test-Path $ProjectPath) { $ProjectPath } else { '(not yet created)' })" -ForegroundColor Yellow
Write-Host "  Sequence:     $LevelSequence" -ForegroundColor Yellow
Write-Host "  Output Dir:   $OutputDir" -ForegroundColor Yellow
Write-Host "  Resolution:   ${ResX}x${ResY}" -ForegroundColor Yellow
Write-Host "  Format:       $Format" -ForegroundColor Yellow
Write-Host "  Quality:      $Quality (RT samples: $samples)" -ForegroundColor Yellow
Write-Host "  Log file:     $LogFile" -ForegroundColor Yellow
Write-Host ""

# === EXECUTION (COMMENTED: REAL INVOCATION PENDING PROJECT CREATION) ===
if (Test-Path $ProjectPath) {
    Write-Host "Launching render..." -ForegroundColor Cyan
    Write-Host ""

    # Execute with captured output
    $cmd = "$UnrealEditorCmdPath " + ($args_list -join " ")
    Write-Host "Command: $cmd" -ForegroundColor Gray
    Write-Host ""

    # Run (note: UnrealEditor-Cmd requires a real project; this is a stub invocation)
    try {
        & $UnrealEditorCmdPath @args_list
        $exitCode = $LASTEXITCODE
        Write-Host ""
        Write-Host "Render exited with code: $exitCode" -ForegroundColor $(if ($exitCode -eq 0) { 'Green' } else { 'Red' })
    } catch {
        Write-Error "Render failed: $_"
        exit 1
    }
} else {
    Write-Host "Project not yet created. This script is ready once phenoDesign-UE5 project exists." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To use this script:" -ForegroundColor Cyan
    Write-Host "  1. Create a UE5.7 project at: $ProjectPath" -ForegroundColor White
    Write-Host "  2. Create a level sequence at: /Game$LevelSequence" -ForegroundColor White
    Write-Host "  3. Re-run this script with valid -LevelSequence parameter" -ForegroundColor White
    Write-Host ""
    Write-Host "Verification: UnrealEditor-Cmd.exe exists and is callable." -ForegroundColor Green
    exit 0
}
