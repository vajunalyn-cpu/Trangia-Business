#!/usr/bin/env python3
"""Turn a downloaded image (e.g. a FLORA export) into the responsive WebP files a media slot expects.

Usage:
    python3 scripts/optimize-media.py <source-image> <slot-base> [widths...]

Example:
    python3 scripts/optimize-media.py ~/Downloads/gen-...-0.png public/media/flora/peza-ecozone 960 1920

Writes <slot-base>-960.webp and <slot-base>-1920.webp. Then set `available: true` for the
slot in src/config/brand.ts. Requires Pillow (pip install pillow).
"""
import sys
from pathlib import Path

from PIL import Image


def main() -> None:
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    src, base = Path(sys.argv[1]), sys.argv[2]
    widths = [int(w) for w in sys.argv[3:]] or [960, 1920]
    im = Image.open(src).convert("RGB")
    Path(base).parent.mkdir(parents=True, exist_ok=True)
    for w in widths:
        out = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        path = f"{base}-{w}.webp"
        out.save(path, "WEBP", quality=80, method=6)
        print(f"wrote {path} ({out.width}x{out.height}, {Path(path).stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
