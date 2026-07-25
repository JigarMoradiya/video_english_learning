#!/usr/bin/env python3
# Extract a representative (dominant, vivid) colour from each letter word image,
# ignoring the white/transparent background. Prints "word #RRGGBB" — paste the
# hexes into src/data/letters.ts as `imageColor` (used for the image-card stroke).
import os, glob
from PIL import Image

folder = os.path.join(os.path.dirname(__file__), "..", "public", "letters")
for f in sorted(glob.glob(os.path.join(folder, "*.png"))):
    im = Image.open(f).convert("RGBA").resize((72, 72))
    buckets = {}
    for r, g, b, a in im.getdata():
        if a < 128:
            continue
        mx, mn = max(r, g, b), min(r, g, b)
        val = mx / 255.0
        sat = 0.0 if mx == 0 else (mx - mn) / mx
        if val > 0.92 and sat < 0.12:   # white-ish background
            continue
        if val < 0.12:                    # near-black
            continue
        if sat < 0.16:                    # greys
            continue
        key = (r // 26, g // 26, b // 26)
        bk = buckets.setdefault(key, [0, 0, 0, 0])
        bk[0] += r; bk[1] += g; bk[2] += b; bk[3] += 1
    word = os.path.splitext(os.path.basename(f))[0]
    if not buckets:
        print(f"{word} #6D6D6D  (no vivid colour — fell back to grey)")
        continue
    best = max(buckets.values(), key=lambda v: v[3])   # most common vivid colour
    n = best[3]
    R, G, B = best[0] // n, best[1] // n, best[2] // n
    print(f"{word} #{R:02X}{G:02X}{B:02X}")
