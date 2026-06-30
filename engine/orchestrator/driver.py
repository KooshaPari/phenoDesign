#!/usr/bin/env python3
"""
phenoDesign Orchestrator Driver

Simple dispatcher that routes asset rendering requests to the appropriate tool leg.
Reads manifest.json, merges tokens, and dispatches to Blender/ImageMagick/FFmpeg/etc.

Usage:
    python driver.py --manifest manifest.json --output-dir dist/assets
    python driver.py --manifest manifest.json --asset tracera --leg blender
"""

import json
import subprocess
import sys
import os
import shutil
from pathlib import Path
from typing import Dict, List, Optional
import argparse
import time

# Force UTF-8 output on Windows
if sys.platform == "win32":
    os.environ["PYTHONIOENCODING"] = "utf-8"


class phenoDesignOrchestrator:
    def __init__(self, manifest_path: str, tokens_path: str = "tokens.json"):
        """Initialize orchestrator with manifest and tokens."""
        with open(manifest_path) as f:
            self.manifest = json.load(f)

        with open(tokens_path) as f:
            self.tokens = json.load(f)

        self.script_dir = Path(__file__).parent
        self.engine_dir = self.script_dir.parent
        self.start_time = time.time()

        # Find bash executable
        self.bash_exe = shutil.which("bash")
        if not self.bash_exe:
            print("[warning] bash not found in PATH")
            self.bash_exe = "bash"

    def _to_bash_path(self, path: Path) -> str:
        """Convert Windows path to WSL/bash-compatible path."""
        posix = path.as_posix()
        # E:/lanes/... -> /e/lanes/...
        if len(posix) > 1 and posix[1] == ':':
            return "/" + posix[0].lower() + posix[2:]
        return posix

    def render_asset(self, asset: Dict, dry_run: bool = False) -> bool:
        """Render a single asset via appropriate tool leg."""
        asset_id = asset["id"]
        leg = asset["leg"]
        asset_type = asset["type"]
        output_path = asset["output"]["path"]

        print(f"\n[phenoDesign] Rendering: {asset_id} ({asset_type}) via {leg}")

        try:
            if leg == "blender":
                return self._render_blender(asset, dry_run)
            elif leg == "imagemagick":
                return self._render_imagemagick(asset, dry_run)
            elif leg == "ffmpeg":
                return self._render_ffmpeg(asset, dry_run)
            elif leg == "unreal":
                print(f"  [stub] Unreal leg not yet implemented")
                return False
            elif leg == "adobe":
                print(f"  [stub] Adobe leg not yet implemented (gated on display isolation)")
                return False
            else:
                print(f"  [error] Unknown leg: {leg}")
                return False
        except Exception as e:
            print(f"  [error] {e}")
            return False

    def _render_blender(self, asset: Dict, dry_run: bool = False) -> bool:
        """Dispatch to Blender leg."""
        asset_id = asset["id"]
        output_path = asset["output"]["path"]
        asset_type = asset["type"]

        # Determine which script to use
        if asset_type == "icon":
            script = "glass_icon.py"
        elif asset_type == "hero":
            script = "hero.py"
        else:
            print(f"  [error] Unknown Blender asset type: {asset_type}")
            return False

        script_path = self.engine_dir / "blender" / script
        if not script_path.exists():
            print(f"  [error] Script not found: {script_path}")
            return False

        # Build command
        cmd = [
            "blender", "-b", "-P", str(script_path),
            "--", asset_id, output_path
        ]

        print(f"  Command: {' '.join(cmd)}")
        if dry_run:
            return True

        # Execute
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"  [ok] Rendered: {output_path}")
            return True
        else:
            print(f"  [error] Blender failed:")
            print(result.stderr)
            return False

    def _render_imagemagick(self, asset: Dict, dry_run: bool = False) -> bool:
        """Dispatch to ImageMagick leg."""
        asset_id = asset["id"]
        output_path = asset["output"]["path"]
        asset_type = asset["type"]
        params = asset.get("params", {})

        # Map asset type to ImageMagick operation
        if asset_type == "favicon":
            # Multi-res favicon generation
            script = self.engine_dir / "imagemagick" / "favicon_multi.sh"
            cmd = [self.bash_exe, self._to_bash_path(script), asset["input"]["path"], asset_id]
        elif asset_type == "icon":
            # Text overlay on icon
            text = params.get("text", asset_id)
            script = self.engine_dir / "imagemagick" / "overlay_text.sh"
            cmd = [self.bash_exe, self._to_bash_path(script), asset["input"]["path"], text, output_path]
        elif asset_type == "social_card":
            # Social media card (1200×630)
            product_name = params.get("productName", "Phenotype")
            tagline = params.get("tagline", "Beautiful asset automation")
            script = self.engine_dir / "imagemagick" / "social_card.sh"
            cmd = [self.bash_exe, self._to_bash_path(script), asset["input"]["path"], product_name, tagline, output_path]
        elif asset_type == "feature_banner":
            # Feature banner (1920×600)
            headline = params.get("headline", "Feature")
            description = params.get("description", "")
            script = self.engine_dir / "imagemagick" / "feature_banner.sh"
            cmd = [self.bash_exe, self._to_bash_path(script), asset["input"]["path"], headline, description, output_path]
        else:
            print(f"  [error] Unknown ImageMagick asset type: {asset_type}")
            return False

        print(f"  Command: {' '.join(cmd)}")
        if dry_run:
            return True

        # Run command directly (no bash -c needed, script paths work directly)
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print(f"  [ok] Rendered: {output_path}")
            return True
        else:
            print(f"  [error] ImageMagick failed:")
            print(result.stderr)
            return False

    def _render_ffmpeg(self, asset: Dict, dry_run: bool = False) -> bool:
        """Dispatch to FFmpeg leg."""
        asset_id = asset["id"]
        input_path = asset["input"]["path"]
        output_path = asset["output"]["path"]
        asset_type = asset["type"]
        params = asset.get("params", {})
        ffmpeg_params = params.get("ffmpegParams", {})

        # Build FFmpeg command
        if asset_type == "video":
            crf = ffmpeg_params.get("crf", 18)
            fps = ffmpeg_params.get("fps", 30)
            cmd = [
                "ffmpeg", "-i", input_path,
                "-c:v", "libx264", "-crf", str(crf),
                "-c:a", "aac", "-b:a", "128k",
                output_path
            ]
        elif asset_type == "gif":
            fps = ffmpeg_params.get("fps", 10)
            cmd = [
                "ffmpeg", "-i", input_path,
                "-vf", f"fps={fps},scale=1200:-1",
                output_path
            ]
        elif asset_type == "brand_intro":
            # Brand intro animation (logo fade-scale-glow)
            product_name = params.get("productName", "Phenotype")
            script = self.engine_dir / "ffmpeg" / "brand_intro.sh"
            # Extract prefix from output path (remove .mp4)
            output_prefix = str(output_path).replace(".mp4", "").replace(".gif", "")
            cmd = [self.bash_exe, self._to_bash_path(script), input_path, product_name, output_prefix]
        elif asset_type == "screencast":
            # Screencast to demo conversion
            product_name = params.get("productName", "Demo")
            script = self.engine_dir / "ffmpeg" / "screencast_to_demo.sh"
            output_prefix = str(output_path).replace(".mp4", "")
            trim_args = []
            if "trimStart" in params:
                trim_args.append(f"--trim-start={params['trimStart']}")
            if "trimEnd" in params:
                trim_args.append(f"--trim-end={params['trimEnd']}")
            cmd = [self.bash_exe, self._to_bash_path(script), input_path, product_name, output_prefix] + trim_args
        else:
            print(f"  [error] Unknown FFmpeg asset type: {asset_type}")
            return False

        print(f"  Command: {' '.join(cmd)}")
        if dry_run:
            return True

        # Run command directly (no bash -c needed, script paths work directly)
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print(f"  [ok] Rendered: {output_path}")
            return True
        else:
            print(f"  [error] FFmpeg failed:")
            print(result.stderr)
            return False

    def render_all(self, dry_run: bool = False) -> tuple:
        """Render all assets in manifest."""
        print(f"[phenoDesign] Rendering {len(self.manifest['assets'])} assets...")

        success_count = 0
        fail_count = 0

        for asset in self.manifest["assets"]:
            if self.render_asset(asset, dry_run):
                success_count += 1
            else:
                fail_count += 1

        elapsed = time.time() - self.start_time
        print(f"\n[phenoDesign] Complete: {success_count} rendered, {fail_count} failed ({elapsed:.1f}s)")
        return success_count, fail_count

    def render_single(self, asset_id: str, dry_run: bool = False) -> bool:
        """Render a single asset by ID."""
        for asset in self.manifest["assets"]:
            if asset["id"] == asset_id:
                return self.render_asset(asset, dry_run)

        print(f"Asset not found: {asset_id}")
        return False


def main():
    parser = argparse.ArgumentParser(description="phenoDesign Asset Orchestrator")
    parser.add_argument("--manifest", default="manifest.json", help="Manifest JSON file")
    parser.add_argument("--tokens", default="tokens.json", help="Tokens JSON file")
    parser.add_argument("--asset", help="Render single asset by ID")
    parser.add_argument("--leg", help="Filter by leg (blender, imagemagick, ffmpeg, etc.)")
    parser.add_argument("--dry-run", action="store_true", help="Print commands without executing")
    parser.add_argument("--output-dir", help="Output directory (optional)")

    args = parser.parse_args()

    # Initialize orchestrator
    try:
        orch = phenoDesignOrchestrator(args.manifest, args.tokens)
    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)

    # Render
    if args.asset:
        success = orch.render_single(args.asset, args.dry_run)
        sys.exit(0 if success else 1)
    else:
        success, fail = orch.render_all(args.dry_run)
        sys.exit(0 if fail == 0 else 1)


if __name__ == "__main__":
    main()
