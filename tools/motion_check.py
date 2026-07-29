#!/usr/bin/env python3
"""Is anything MOVING inside each phrase?

    python motion_check.py <video.mp4> <timing.json>

The phrase sheet compares one phrase to the NEXT one, so it proves each line brings a new
visual. It cannot see a card that appears and then sits perfectly still for three seconds —
that changed at the boundary and passes. This samples several frames INSIDE each phrase and
reports the ones whose content region barely moves.

The content region deliberately excludes the mascot column and the caption band, so the
mascot's bob and the karaoke highlight cannot mask a frozen teaching area.
"""
from __future__ import annotations
import argparse, json, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image

# content region of a 1920x1080 frame, as fractions: skips the mascot (left) and captions
X0, X1, Y0, Y1 = 0.17, 0.95, 0.13, 0.76
FROZEN = 0.30   # mean abs diff between interior samples, below this = nothing is moving


def frame(video: Path, t: float, tmp: Path) -> np.ndarray:
    subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", str(video),
                    "-frames:v", "1", "-vf", "scale=640:-1", "-y", str(tmp)], check=True)
    im = Image.open(tmp).convert("L")
    a = np.asarray(im).astype(int)
    h, w = a.shape
    return a[int(h * Y0):int(h * Y1), int(w * X0):int(w * X1)]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("video"); ap.add_argument("timing")
    ap.add_argument("--min", type=float, default=1.4, help="only check phrases longer than this")
    a = ap.parse_args()
    video, tmp = Path(a.video), Path("/tmp/_motion.png")
    phrases = json.load(open(a.timing))

    frozen = []
    checked = 0
    for i, p in enumerate(phrases):
        span = p["end"] - p["start"]
        if span < a.min:
            continue
        checked += 1
        # three samples across the phrase's interior
        ts = [p["start"] + span * f for f in (0.30, 0.60, 0.90)]
        gs = [frame(video, t, tmp) for t in ts]
        d = max(float(np.abs(gs[k + 1] - gs[k]).mean()) for k in range(len(gs) - 1))
        if d < FROZEN:
            frozen.append((i, d, span, p["text"]))

    print(f"{checked} phrases longer than {a.min}s checked for INTERNAL motion\n")
    print(f"── FROZEN — content region barely moves during the line: {len(frozen)} ──")
    for i, d, span, txt in frozen:
        print(f"   #{i:3d}  {span:4.1f}s  motion {d:4.2f}   {txt[:58]}")
    if not frozen:
        print("   none — something is moving on every long line")
    return 1 if frozen else 0


if __name__ == "__main__":
    sys.exit(main())
