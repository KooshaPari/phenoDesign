# Unreal Engine 5.7 Cinematics Leg (STUB)

Stub documentation for headless Unreal Engine 5.7 ray-traced cinematics rendering. This leg is **not yet implemented** but is documented here for future integration.

## Purpose

Render cinematic-quality 3D assets and sequences:
- **Product cinematics** (rotating 3D UI components, data flows)
- **Environment renders** (phenotype.space world, biome showcases, Civis voxel worlds)
- **Real-time ray-tracing** (DXR + DLSS upscaling on NVIDIA RTX)
- **MovieRenderQueue pipeline** (batch export with complex post-FX stacks)

## Status: STUB + TODO

| Component | Status | Notes |
|-----------|--------|-------|
| UE 5.7 engine | ✅ Installed | C:/Program Files/Epic Games/UE_5.7 |
| Headless CLI | 🔲 TODO | Need UnrealEditor-Cmd.exe config |
| MovieRenderQueue | 🔲 TODO | Project + render config files |
| Ray-tracing (DXR) | 🔲 TODO | GPU settings, material setup |
| DLSS upscaler | 🔲 TODO | NVIDIA plugin integration |
| Batch driver | 🔲 TODO | Python dispatcher + manifest |

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

### Project Setup (TODO)

The phenoDesign UE5.7 project does not yet exist. Future work:
1. Create blank project (C:/Users/koosh/Dev/phenoDesign-UE5 or similar)
2. Import blueprint libraries for:
   - Glass morphism materials (teal emission, transmission)
   - Procedural geometry (rounded tiles, node graphs, tubes)
   - Lighting setup (midnight world, volumetric glow, DXR)
3. Configure MovieRenderQueue settings (output paths, codecs, post-FX)
4. Build render batch configs for each asset type

## Headless Render Command (Reference)

Once project is set up, rendering will use:

```bash
UnrealEditor-Cmd.exe \
  "C:/Users/koosh/Dev/phenoDesign-UE5/phenoDesign.uproject" \
  -ExecuteConsoleCommand="MovieRender.RenderAll" \
  -MovieRenderConfig="Renders/BatchRender_Icons.json" \
  -NoEditor \
  -Unattended
```

Alternative using Render Automation Plugin (UE 5.3+):

```bash
UnrealEditor-Cmd.exe \
  "path/to/project.uproject" \
  -ExecuteConsoleCommand="RenderMovie /Game/Sequences/CinematicSequence /output/hero.mp4" \
  -Unattended \
  -NullRHI  # Headless (no display, no GPU = slow; use -ShaderCompileWorkers for GPU)
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

## Next Steps

- [ ] Create UE5 project at C:/Users/koosh/Dev/phenoDesign-UE5
- [ ] Import/create glass morphism material library
- [ ] Set up MovieRenderQueue + batch export configs
- [ ] Test headless render via CLI
- [ ] Integrate with orchestrator dispatcher
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
