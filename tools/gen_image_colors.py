#!/usr/bin/env python3
# Dominant vivid colour of EVERY image in public/letters → src/data/imageColors.json
# ({ "apple": "#RRGGBB", ... }). Used for each word tile's stroke + label colour.
import os, glob, json
from PIL import Image

root = os.path.join(os.path.dirname(__file__), "..")
folder = os.path.join(root, "public", "letters")
out = {}
for f in sorted(glob.glob(os.path.join(folder, "*.png"))):
    im = Image.open(f).convert("RGBA").resize((72, 72))
    buckets = {}
    for r, g, b, a in im.getdata():
        if a < 128:
            continue
        mx, mn = max(r, g, b), min(r, g, b)
        val = mx / 255.0
        sat = 0.0 if mx == 0 else (mx - mn) / mx
        if val > 0.92 and sat < 0.12:   # white-ish bg
            continue
        if val < 0.12:                    # near-black
            continue
        if sat < 0.16:                    # greys
            continue
        key = (r // 26, g // 26, b // 26)
        bk = buckets.setdefault(key, [0, 0, 0, 0])
        bk[0] += r; bk[1] += g; bk[2] += b; bk[3] += 1
    name = os.path.splitext(os.path.basename(f))[0]
    if not buckets:
        out[name] = "#6D6D6D"
        continue
    best = max(buckets.values(), key=lambda v: v[3])
    n = best[3]
    out[name] = "#%02X%02X%02X" % (best[0] // n, best[1] // n, best[2] // n)

dest = os.path.join(root, "src", "data", "imageColors.json")
json.dump(out, open(dest, "w"), indent=0, sort_keys=True)
print(f"wrote {dest} ({len(out)} colours)")
