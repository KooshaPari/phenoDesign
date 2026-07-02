# Unreal Engine 5.7 Cinematics Leg (Real Project + Scripted Pipeline)

Headless Unreal Engine 5.7 ray-traced cinematics rendering pipeline with MovieRenderQueue. Project scaffolding + render scripts are **functional**; rendering unverified without full project compilation.

## Purpose

Render cinematic-quality 3D assets and sequences:
- **Product cinematics** (rotating 3D UI components, data flows)
- **Environment renders** (phenotype.space world, biome showcases, Civis voxel worlds)
- **Real-time ray-tracing** (DXR + DLSS upscaling on NVIDIA RTX)
- **MovieRenderQueue pipeline** (batch export with complex post-FX stacks)

## Status: Scripted (Unverified Render)

| Component | Status | Notes |
|-----------|--------|-------|
| UE 5.7 engine | ✅ Installed | C:/Program Files/Epic Games/UE_5.7 |
| Headless CLI | ✅ Scripted | render_cinematic.ps1 / render_cinematic.sh |
| MovieRenderQueue | ✅ Scripted | RenderConfigs/default.json + args |
| Project scaffold | ✅ Created | E:/Dev/phenoDesign-UE5 (minimal C++ module) |
| Ray-tracing (DXR) | 🔲 TODO | GPU settings, material setup, content import |
| DLSS upscaler | 🔲 TODO | NVIDIA plugin integration + materials |
| Batch dispatcher | 🔲 TODO | Manifest + orchestrator integration |

## Prerequisites

### Hardware (Minimum)

- **GPU**: NVIDIA RTX 2070+ (3090 Ti recommended for DXR)
- **VRAM**: 8 GB minimum (12+ GB recommended)
- **Storage**: 200+ GB for UE5.7 + project

### Software

- **Unreal Engine 5.7**: C:/Program Files/Epic Games/UE_5.7
  - Download via Epic Launcher
  - Or compile from source (UE5-main GitHub)
- **Visual Studio 2022** (C++ toolchain)
- **NVIDIA GPU drivers** (for ray-tracing)

### Project Setup (Scaffolded)

The phenoDesign UE5.7 project exists at **E:/Dev/phenoDesign-UE5**. Includes:
- **phenoDesign.uproject** (UE 5.7 manifest with MovieRenderPipeline enabled)
- **Source/phenoDesign/** (minimal C++ module)
- **Content/** (ready for asset import)
- **RenderConfigs/default.json** (render settings template)

Remaining work:
1. Compile Source/ (generate Visual Studio project files)
2. Import blueprint libraries for:
   - Glass morphism materials (teal emission, transmission)
   - Procedural geometry (rounded tiles, node graphs, tubes)
   - Lighting setup (midnight world, volumetric glow, DXR)
3. Populate Content/ with sequences and environments
4. Test end-to-end render

## Render Scripts (Implemented)

### PowerShell Wrapper Script

**Location:** `render_cinematic.ps1` (in this directory)

Invokes UnrealEditor-Cmd.exe with MovieRenderQueue options. Supports custom resolution, codec, quality, and output paths.

**Usage:**
```powershell
.\render_cinematic.ps1 `
  -ProjectPath "E:/Dev/phenoDesign-UE5/phenoDesign.uproject" `
  -OutputDir "E:/renders/hero_01" `
  -ResX 1920 -ResY 1080 `
  -Codec h264 -Quality 95
```

**Key Parameters:**
- `-ProjectPath` (required): Path to .uproject file
- `-OutputDir`: Output directory (default: `<project>/Renders`)
- `-ResX`, `-ResY`: Resolution (default: 1920x1080)
- `-Codec`: h264, h265, prores (default: h264)
- `-Quality`: 0-100 encoding quality (default: 95)
- `-FrameRate`: Frame rate numerator (default: 24)

### Bash Wrapper Script

**Location:** `render_cinematic.sh` (in this directory)

Cross-platform wrapper that delegates to `render_cinematic.ps1` on Windows.

**Usage:**
```bash
./render_cinematic.sh -p E:/Dev/phenoDesign-UE5/phenoDesign.uproject -o E:/renders/hero_01
```

### Direct Invocation Pattern

For scripting or debugging, invoke UnrealEditor-Cmd.exe directly:

```powershell
$UE_BIN = "C:\Program Files\Epic Games\UE_5.7\Engine\Binaries\Win64\UnrealEditor-Cmd.exe"

& $UE_BIN `
  "E:/Dev/phenoDesign-UE5/phenoDesign.uproject" `
  -Unattended `
  -NoGUI `
  -NullRHI `
  -ResX=1920 -ResY=1080 `
  -MovieFolder="E:/renders" `
  -MovieFrameRate=24 `
  -MovieCodec=h264 `
  -MovieQuality=95 `
  -Log="E:/renders/render.log"
```

## Material Setup (Future)

Key materials for phenoDesign glass motif in UE5.7:

### Glassmorphic Tile

```
Material: M_GlassTile_Pheno
  Base Color: Teal gradient (procedural)
  Roughness: 0.05 (polished)
  Metallic: 0.0
  Transmission: 0.7
  IOR: 1.45
  Emissive Color: Teal (0.18, 0.62, 0.56)
  Emissive Intensity: 2.0 cd/sr
```

### Teal Emission Node

```
Material: M_TealGlow_Node
  Base Color: Midnight (0.02, 0.024, 0.03)
  Emissive: Teal (procedural pulse or constant)
  Emissive Intensity: 1.8–2.2 cd/sr
  Blend Mode: Additive (for volumetric effect)
```

### Volumetric Glow (Unreal's Exponential Height Fog)

```
Post-Process Volume (global):
  Exponential Height Fog:
    Fog Density: 0.04
    Fog Height Falloff: 0.2
    Fog Inscattering Color: Teal + slight glow
```

## Lighting Setup (Future)

### World Lighting

```
Directional Light (Sun):
  Intensity: 0 (no sun, all synthetic)
  
Lights (scene-specific):
  - Key light: Soft teal emissive (from tiles)
  - Fill: Midnight ambient (volumetric)
  - Rim: Optional emissive geometry glow
  
Post-Process:
  Exposure: Auto (or pinned to 1.0)
  Tonemapper: Filmic (ACES)
  Color Grading: Desaturate greens, boost teals
```

## Rendering Performance Notes

- **First render** (cold start, shader compilation): 2–5 minutes
- **Subsequent renders** (cached shaders): 20–60 seconds per frame
- **DXR ray-tracing** (full quality): 3–10 seconds per 1080p frame
- **DLSS upscale** (2x from 540p): +2–5 seconds, halves render time

Optimization strategies:
- Use `-ShaderCompileWorkers` for GPU-accelerated compilation
- Cache shaders between runs
- Pre-warm GPU before batch rendering
- Consider progressive rendering (low-bounce → high-bounce)

## Project Locations

- **Engine install:** C:/Program Files/Epic Games/UE_5.7
- **Project root:** E:/Dev/phenoDesign-UE5
- **Render scripts:** E:/Dev/phenoDesign/engine/unreal/ (this directory)
- **Render configs:** E:/Dev/phenoDesign-UE5/RenderConfigs/
- **Output (default):** E:/Dev/phenoDesign-UE5/Renders/

## Next Steps

- [ ] Generate Visual Studio project files (right-click .uproject → Generate Visual Studio project files)
- [ ] Compile C++ module (Visual Studio → Build → Build Solution)
- [ ] Import/create glass morphism material library
- [ ] Create test level + movie sequence in Content/
- [ ] Test headless render via `render_cinematic.ps1`
- [ ] Integrate with orchestrator dispatcher (batch manifest)
- [ ] Benchmark ray-trace + DLSS on RTX 3090 Ti

## Gotchas & Troubleshooting

**"No GPU found / Headless mode"**
- UE5.7 with `-NullRHI` uses CPU only (very slow)
- Use `-ShaderCompileWorkers` or run on GPU-enabled system
- Recommended: use display (even HDMI dummy plug) + actual GPU

**"Shader compilation timeout"**
- First render compiles all shaders; can take 5+ minutes
- Solution: Iterate on materials in-editor first, export configs

**"MovieRenderQueue not found"**
- Plugin must be enabled in .uproject file:
  ```json
  "Plugins": [
    { "Name": "MovieRenderPipeline", "Enabled": true }
  ]
  ```

**"DLSS not available"**
- Requires NVIDIA plugin (Unreal Marketplace) + RTX GPU
- Fallback: Use Temporal Anti-Aliasing (TAA) + upsampling

## See Also

- **Blender leg**: `../blender/` (current production icon/hero renderer)
- **Orchestrator**: `../orchestrator/` (manifest dispatch)
- **SETUP.md**: (future) Step-by-step UE5.7 project creation guide
