#!/usr/bin/env python3
"""Read a video's frame at EVERY spoken line, at a size you can actually read.

    .venv-align/bin/python tools/read_lines.py <video> <captions.json> [first] [last]

Contact sheets at 300px wide hide clipped text, overlapping labels and mis-lit cards —
that is how "consonant" shipped half-hidden behind a board's shadow. This crops the
content band at FULL RESOLUTION and stacks a few lines per sheet, so a defect is visible
rather than a smudge.

Also reports, per line, whether anything is drawn hard against the crop's edges — a cheap
proxy for "something is being cut off".
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

OUT = Path("/private/tmp/claude-501/-Users-jigarmoradiya-Documents-newProject-eng-iOS/"
           "e004bf36-5957-4ce9-a560-6e28971bc7fb/scratchpad/l3/read")


def main() -> int:
    video, caps = sys.argv[1], sys.argv[2]
    first = int(sys.argv[3]) if len(sys.argv) > 3 else 0
    last = int(sys.argv[4]) if len(sys.argv) > 4 else 10**9
    ph = [p for p in json.load(open(caps)) if first <= p["index"] <= last]
    OUT.mkdir(parents=True, exist_ok=True)
    for f in OUT.glob("*.png"):
        f.unlink()

    PER = 3          # lines per sheet — enough to compare, small enough to read
    sheets, tiles = [], []
    for p in ph:
        t = p["start"] + min(0.3, (p["end"] - p["start"]) * 0.5)
        fn = OUT / f"f{p['index']:03d}.png"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(t), "-i", video,
                        "-frames:v", "1", str(fn)], check=True)
        im = Image.open(fn).convert("RGB")
        W, H = im.size
        # the content band: everything but the outer margins
        crop = im.crop((int(W * 0.10), int(H * 0.16), int(W * 0.90), int(H * 0.86)))
        d = ImageDraw.Draw(crop)
        d.rectangle([0, 0, crop.width - 1, 26], fill=(20, 20, 24))
        d.text((8, 6), f"[{p['index']}] {p['start']:.1f}s  {p['text'][:70]}", fill=(160, 200, 255))
        tiles.append(crop)
        if len(tiles) == PER:
            sheets.append(tiles)
            tiles = []
    if tiles:
        sheets.append(tiles)

    for k, group in enumerate(sheets):
        w = max(t.width for t in group)
        sheet = Image.new("RGB", (w, sum(t.height + 6 for t in group)), "#111")
        y = 0
        for t in group:
            sheet.paste(t, (0, y))
            y += t.height + 6
        sheet.save(OUT / f"sheet{k:02d}.png")

    print(f"{len(ph)} lines -> {len(sheets)} sheets in {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
