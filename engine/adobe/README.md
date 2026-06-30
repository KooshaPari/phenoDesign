# Adobe Creative Suite Automation (STUB + GATED)

Stub documentation for Adobe CC headless automation. This leg is **not yet implemented** and is **gated on display-isolation infrastructure**.

## Purpose

Extend phenoDesign with Adobe design workflows:
- **Photoshop batch** (smart objects, layer comps, export variants)
- **Illustrator export** (SVG → PDF, multi-page exports)
- **After Effects** (motion graphics, animated icons, titles)
- **Premiere Pro** (video assembly, color grading, export)

## Status: STUB (GATED)

| Component | Status | Notes |
|-----------|--------|-------|
| UXP plugins | 🔲 TODO | Photoshop UXP for PS batch |
| ExtendScript | 🔲 TODO | .jsx for AE/Premiere automation |
| Display isolation | 🔲 TODO | **BLOCKER**: VDD or 2nd user session |
| CLI dispatcher | 🔲 TODO | Python to route requests |
| Batch driver | 🔲 TODO | Manifest + render config |

## The Display Isolation Blocker

**Critical issue**: Adobe CC applications (Photoshop, After Effects, Premiere) are heavily interactive and **steal the user's cursor** when running headless scripts. This makes them incompatible with simultaneous use of the agent harness.

### Solution: Display Isolation Layer

Two options exist, both NOT YET IMPLEMENTED:

#### Option 1: Virtual Display Driver (VDD)

Use Windows Virtual Display Driver to present a fake display to Adobe CC:

```powershell
# Install VDD (e.g., IddSampleDriver from Windows-driver-samples)
# OR use commercial solution (eGPU passthrough, etc.)

# Run Adobe in isolated virtual display
$env:DISPLAY = ":99"  # Linux-style (Windows needs different approach)
aerender -comp "..." -o output.mov
```

**Status**: Research only; not integrated into phenoDesign yet.

#### Option 2: Dedicated 2nd Windows User Session

Launch a separate Windows user session (hidden/detached) where Adobe runs:

```powershell
# Create hidden user "adobe-batch" (one-time setup)
# Then dispatch jobs to it via RDP or psexec

psexec -u adobe-batch -p password \
  "C:\Program Files\Adobe\AfterEffects\Support Files\aerender.exe" \
  -comp "Template Comp" -o output.mov
```

**Status**: Concept only; not automated yet.

## Prerequisites (If Display Isolation Exists)

### Adobe CC Installed

- **Photoshop 2024+** (for UXP plugin support)
- **After Effects 2024+** (for improved ExtendScript + expressions)
- **Premiere Pro 2024+** (for shared audio/video codecs)

### Scripting Tools

- **Adobe UXP Plugin SDK**: https://developer.adobe.com/photoshop/uxp
  - JS-based plugins, modern async API
  - Recommended for Photoshop batch workflows
- **ExtendScript Toolkit (retired)** or VSCode ExtendScript extension
  - Legacy .jsx syntax for AE/Premiere
  - Still works but no modern IDE support

### Helper Tools

- **Adobe CEP (Common Extensibility Platform)**: Enables plug-in communication
- **FFMPEG** (for codec glue between Premier + upstream)
- **ImageMagick** (for Photoshop batch export fallback)

## Proposed Workflows (NOT IMPLEMENTED)

### Photoshop Batch Export

```javascript
// batch_export.jsx (ExtendScript for Photoshop)
// Execute: psexec -u adobe-batch photoshop -s batch_export.jsx
var doc = app.open("template.psd");
var layers = doc.artLayers;

// Export each layer comp as PNG
for (var i = 0; i < doc.layerComps.length; i++) {
  doc.layerComps[i].apply();
  doc.exportDocument(new File("export_" + i + ".png"), ExportType.PNG, true);
}
```

### After Effects Render via aerender

```bash
# Command-line aerender (AE's headless renderer)
aerender -project "phenoDesign_AE.aep" \
  -comp "Hero_1200x630" \
  -OMformat quicktimeDV -output "output.mov"
```

### Premiere Pro Batch Export

```javascript
// batch_export_premiere.jsx (ExtendScript for Premiere)
var proj = app.project;
var seqs = proj.sequences;

for (var i = 0; i < seqs.length; i++) {
  // Export each sequence
  app.project.activeSequence = seqs[i];
  app.project.exportAsMediaDirect(
    new File("export_" + seqs[i].name + ".mp4"),
    app.project.activeSequence,
    {
      videoCodec: "libx264",
      videoQuality: 100,
      audioCodec: "aac"
    }
  );
}
```

## Headless Execution (Hypothetical)

Once display isolation is in place:

```powershell
# Python dispatcher that routes to Adobe leg
python orchestrator/driver.py \
  --manifest orchestrator/manifest.json \
  --asset "design/logo_animation" \
  --leg adobe \
  --output dist/logo.mp4

# Under the hood:
# 1. Reads manifest → matches asset to Adobe Premiere template
# 2. Spawns isolated 2nd user session or VDD
# 3. Runs aerender in that session
# 4. Polls output file until done
# 5. Cleans up session
```

## Known Limitations

- **No true headless mode** (Adobe CC always tries to interact with display)
- **Slow startup** (AE cold-start = 10–20 sec, Premiere = 15–30 sec)
- **Licensing**: CC subscription required; batch execution may trigger license warnings
- **File paths**: Must be absolute; UNC paths (network shares) not always supported
- **ExtendScript debugging**: No modern IDE; use VSCode + ESTK extension (unpolished)

## Gotchas

**"aerender not in PATH"**
```powershell
# After Effects doesn't add itself to PATH
# Use full path:
"C:\Program Files\Adobe\After Effects 2024\Support Files\aerender.exe"
```

**"Project is locked"**
- Multiple AE instances can't access same .aep simultaneously
- Solution: Use display isolation to ensure only one instance runs

**"Codec not found"**
- Adobe uses its own codecs; H.264 import/export requires Adobe Media Encoder
- Fallback: Export to ProRes, then transcode via FFmpeg

**"Slow 2nd user session login"**
- Windows user session creation = 30–60 sec overhead
- Recommendation: Keep session alive between batch jobs (session pooling)

## Future Work

- [ ] Evaluate display isolation options (VDD vs. 2nd user)
- [ ] Prototype UXP plugin for Photoshop batch export
- [ ] Create After Effects template library (glass morphism comps)
- [ ] Integrate with orchestrator dispatcher
- [ ] Benchmark end-to-end workflow (job dispatch → render → output)

## See Also

- **DISPLAY_ISOLATION.md**: (future) Step-by-step VDD or 2nd user setup
- **Orchestrator**: `../orchestrator/` (manifest + dispatcher)
- **Blender leg**: `../blender/` (current icon/hero renderer; Adobe is fallback)
