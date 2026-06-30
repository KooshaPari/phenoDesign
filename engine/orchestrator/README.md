# Orchestrator: Manifest-Driven Asset Dispatch

Central routing logic for phenoDesign engine. Reads asset manifests, dispatches to optimal tool legs (Blender, ImageMagick, FFmpeg, Unreal, Adobe), and manages vision-critique iteration loops.

## Purpose

- **Declarative asset specs**: Define all rendering work in JSON manifest
- **Intelligent routing**: Match asset type + quality requirements to the right tool
- **Brand consistency**: Enforce design tokens (teal, midnight) across all renders
- **Vision feedback loop**: Integration point for Claude vision → score → iterate
- **Batch orchestration**: Render 100+ assets with parallel job pooling

## Components

### manifest.schema.json

JSON Schema defining the asset manifest format. Validates:
- Asset IDs, types (icon, hero, video, cinematic)
- Input/output specs (format, resolution, paths)
- Tool-specific params (Blender emission strength, FFmpeg CRF, etc.)
- Critique settings (max iterations, scoring rubrics)
- Metadata (collections, tags, dependencies)

### tokens.json

Brand token definitions (single source of truth):
- **Colors**: teal (#7ebab5), midnight (#090a0c), frost accent
- **Typography**: Arial Bold, Courier fallback, font sizes
- **Spacing**: 8 px unit grid
- **Blender materials**: Glass, teal emission, midnight background
- **ImageMagick**: Text overlays, font, sizes
- **FFmpeg profiles**: Web (H.264/CRF 23), Archive (H.265/CRF 16), Preview

Used by all tool legs to maintain consistency.

### driver.py

Simple Python dispatcher (stub; extensible):

```python
#!/usr/bin/env python3
import json, subprocess, sys
from pathlib import Path

# Load manifest
with open("manifest.json") as f:
    manifest = json.load(f)

# Dispatch each asset to appropriate leg
for asset in manifest["assets"]:
    leg = asset["leg"]
    asset_id = asset["id"]
    
    if leg == "blender":
        subprocess.run([
            "blender", "-b", "-P", f"../blender/glass_icon.py",
            "--", asset_id, asset["output"]["path"]
        ])
    elif leg == "imagemagick":
        # ... ImageMagick commands
        pass
    # ... other legs
```

## Example: Minimal Manifest

```json
{
  "version": "1.0.0",
  "assets": [
    {
      "id": "tracera",
      "type": "icon",
      "leg": "blender",
      "displayName": "Tracera",
      "output": {
        "format": "png",
        "path": "dist/icons/tracera_icon.png",
        "resolution": "512x512"
      },
      "params": {
        "quality": "high"
      }
    },
    {
      "id": "agileplus",
      "type": "hero",
      "leg": "blender",
      "displayName": "AgilePlus",
      "output": {
        "format": "png",
        "path": "dist/heroes/agileplus_hero.png",
        "resolution": "1200x630"
      },
      "params": {
        "text": "AgilePlus",
        "textPosition": "NorthEast",
        "blenderParams": {
          "emissionStrength": 1.8
        }
      }
    }
  ],
  "tokens": {
    "colors": {
      "primary": "#7ebab5",
      "secondary": "#090a0c"
    }
  }
}
```

## Vision-Critique Loop

Agents can iterate on renders using Claude's vision capability:

1. **Render**: Asset manifest entry → tool leg → PNG output
2. **Critique**: Claude reads PNG, scores against tokens
   ```
   Analyzing: tracera_icon.png
   - Teal saturation: 0.85 (target 0.90) → BELOW THRESHOLD
   - Glass clarity: 0.92 (target 0.90) → OK
   - Overall score: 0.85 (target 0.90) → NEEDS ITERATION
   ```
3. **Adjust**: Agent tweaks params (e.g., `emissionStrength: 1.8 → 2.1`)
4. **Re-render**: Loop back to step 1
5. **Accept**: When score ≥ threshold, finalize

Manifest schema includes:
```json
"critique": {
  "enabled": true,
  "maxIterations": 3,
  "scoreThreshold": 0.90,
  "scoringRubric": [
    { "criterion": "teal_saturation", "weight": 0.3 },
    { "criterion": "glass_clarity", "weight": 0.3 },
    { "criterion": "midnight_depth", "weight": 0.2 },
    { "criterion": "overall_composition", "weight": 0.2 }
  ]
}
```

## Batch Rendering

Example: Render all assets in manifest

```bash
python driver.py --manifest manifest.json --output-dir dist/assets
```

Pseudo-algorithm:
```
1. Load manifest.json + tokens.json
2. Validate manifest against schema
3. Build dependency graph (assets with dependencies = render order)
4. Dispatch to job pool:
   - For each asset in dependency order:
     - Match leg + asset type → tool script
     - Merge tokens + params
     - Run tool (blender/magick/ffmpeg/etc.)
     - Store output path
5. Poll for completion (timeout = 30s per Blender frame, 5s per ImageMagick)
6. Report: N rendered, M failed, avg time per asset
```

## Token Inheritance & Override

Tokens cascade:

```
Global tokens (orchestrator/tokens.json)
  ↓ merged with
Asset-level overrides (manifest.json → params)
  ↓ produces
Effective config for tool leg
```

Example:
```json
{
  "id": "custom_icon",
  "params": {
    "blenderParams": {
      "emissionStrength": 2.2    // override global 1.8
    }
  }
}
```

Result: Custom icon renders with teal emission 2.2x stronger.

## Integration with Claude Agents

The orchestrator is designed for agent consumption:

```python
# Agent pseudo-code
from phenodesign import Orchestrator

orch = Orchestrator("orchestrator/manifest.json")

# Render and critique an asset
result = orch.render_with_critique(
    asset_id="tracera",
    max_iterations=3,
    score_threshold=0.90,
    vision_model="claude-opus"  # Claude reads PNG, scores
)

if result.success:
    print(f"✓ {asset_id} rendered after {result.iterations} iterations")
else:
    print(f"✗ {asset_id} failed: {result.error}")
```

## Extensibility

Add new tool legs by extending dispatcher:

1. Create `engine/<newleg>/README.md` + scripts
2. Add schema entries to `manifest.schema.json` (new params, output formats)
3. Add token section to `tokens.json` (leg-specific settings)
4. Add handler to `driver.py`:
   ```python
   elif leg == "newleg":
       subprocess.run([
           "path/to/newleg/script.sh",
           asset["id"],
           asset["output"]["path"],
           json.dumps(asset["params"])
       ])
   ```

## Manifest Validation

```bash
# Validate manifest against schema (requires ajv-cli or similar)
npx ajv validate -s manifest.schema.json -d manifest.json

# Or in Python:
from jsonschema import validate
with open("manifest.json") as f:
    manifest = json.load(f)
with open("manifest.schema.json") as f:
    schema = json.load(f)
validate(instance=manifest, schema=schema)
```

## Known Limitations

- **No persistent job queue** (in-memory only; no crash recovery)
- **No parallel render pooling** (sequential dispatch; can be multi-threaded)
- **No caching** (always re-renders; could cache on content-hash)
- **Driver stub only** (driver.py is 50-line proof-of-concept; expand as needed)

## Roadmap

- [ ] Implement full Python dispatcher with job pool + async
- [ ] Add manifest validation + linting
- [ ] Integrate with Claude vision loop (feedback iteration)
- [ ] Build web dashboard (render queue, job status, output gallery)
- [ ] Cache + incremental rendering (hash-based invalidation)

## See Also

- **Blender leg**: `../blender/` (icon + hero renderer)
- **ImageMagick leg**: `../imagemagick/` (raster post-op)
- **FFmpeg leg**: `../ffmpeg/` (video transcode)
- **Unreal leg**: `../unreal/` (cinematics, stub)
- **Adobe leg**: `../adobe/` (design automation, stub + gated)
