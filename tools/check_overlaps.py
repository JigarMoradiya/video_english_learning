#!/usr/bin/env python3
"""Find frames where two pieces of content OVERLAP.

    .venv-align/bin/python tools/check_overlaps.py <video.mp4> <phrases.json>

Why this exists
---------------
Overlap kept shipping because I positioned components absolutely and checked them by eye.
Eyes miss it; a box test does not. This samples the middle frame of every narration line,
segments the content away from the world, groups it into connected boxes, and reports any
two boxes that intersect in BOTH axes — which is exactly what "content on top of content"
means. Stacked items (a picture above its own word) do not intersect and are not reported.

The world is removed with a per-pixel MEDIAN plate rather than a colour rule, because the
site's ground and hoarding are as saturated as the cards are.
"""
from __future__ import annotations

import json
import subprocess
import sys
from collections import deque

import numpy as np

W, H = 640, 360          # 16:9 default; set from the file for portrait cuts
CELL = 5                       # coarse grid: one cell ≈ 8px of the real frame
TOUCH = 2                      # boxes must clear each other by at least this many cells


def probe(path: str) -> tuple[int, int]:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height", "-of", "csv=p=0", path], capture_output=True, text=True).stdout
    nums = [int(v) for v in out.replace("\n", ",").split(",") if v.strip().isdigit()]
    return nums[0], nums[1]


def frames(path: str) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps=2,scale={W}:{H}",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.uint8).reshape(-1, H, W, 3)


def boxes(mask: np.ndarray) -> list[tuple[int, int, int, int]]:
    """Connected components of a coarse boolean grid, as (y0, x0, y1, x1)."""
    h, w = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    out = []
    for sy in range(h):
        for sx in range(w):
            if not mask[sy, sx] or seen[sy, sx]:
                continue
            q = deque([(sy, sx)])
            seen[sy, sx] = True
            y0 = y1 = sy
            x0 = x1 = sx
            n = 0
            while q:
                y, x = q.popleft()
                n += 1
                y0, y1 = min(y0, y), max(y1, y)
                x0, x1 = min(x0, x), max(x1, x)
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((ny, nx))
            if n >= 3:
                out.append((y0, x0, y1, x1))
    return out


def main() -> int:
    global W, H
    video, phrases_path = sys.argv[1], sys.argv[2]
    vw, vh = probe(video)
    # a portrait cut needs its own sampling grid, and its own furniture fractions
    H = 360 if vh <= vw else 600
    W = int(round(H * vw / vh / 2) * 2)
    fr = frames(video)
    plate = np.median(fr[::3], axis=0).astype(np.int16)
    P = json.load(open(phrases_path))

    # only the stage: the word wall and the caption bar are furniture, not content
    # the sign and the sky are furniture; the wall and caption bar are furniture too
    tall = vh > vw
    x0, x1 = int(W * (0.185 if tall else 0.150)), int(W * (0.795 if tall else 0.840))
    y0, y1 = int(H * (0.150 if tall else 0.190)), int(H * (0.780 if tall else 0.800))

    hits = []
    for p in P:
        i = min(len(fr) - 1, int(round(((p["start"] + p["end"]) / 2) * 2)))
        d = np.abs(fr[i].astype(np.int16) - plate).max(axis=2)[y0:y1, x0:x1] > 45
        h, w = (d.shape[0] // CELL) * CELL, (d.shape[1] // CELL) * CELL
        grid = d[:h, :w].reshape(h // CELL, CELL, w // CELL, CELL).mean(axis=(1, 3)) > 0.30
        bs = boxes(grid)
        for a in range(len(bs)):
            for b in range(a + 1, len(bs)):
                ay0, ax0, ay1, ax1 = bs[a]
                by0, bx0, by1, bx1 = bs[b]
                oy = min(ay1, by1) - max(ay0, by0)
                ox = min(ax1, bx1) - max(ax0, bx0)
                # containment is NESTING, not overlay: the gap between two cards is its own
                # component and sits inside their bounding box. Only report real crossings.
                inside = (ay0 >= by0 and ay1 <= by1 and ax0 >= bx0 and ax1 <= bx1) or \
                         (by0 >= ay0 and by1 <= ay1 and bx0 >= ax0 and bx1 <= ax1)
                if not inside and oy >= TOUCH and ox >= TOUCH:   # intersect in BOTH axes
                    ry = lambda v: v * CELL * 3 + y0 * 3
                    rx = lambda v: v * CELL * 3 + x0 * 3
                    hits.append((p["start"], p["text"].strip(), oy * CELL * 3, ox * CELL * 3,
                                 f"[y{ry(ay0)}-{ry(ay1)} x{rx(ax0)}-{rx(ax1)}] vs "
                                 f"[y{ry(by0)}-{ry(by1)} x{rx(bx0)}-{rx(bx1)}]"))
                    break
            else:
                continue
            break

    mm = lambda s: f"{int(s)//60}:{int(s)%60:02d}"
    print(f"lines checked: {len(P)}    OVERLAPPING: {len(hits)}")
    for s, t, oy, ox, where in hits:
        print(f"   {mm(s)}  ~{ox}x{oy}px  {t[:40]}\n        {where}")
    return 1 if hits else 0


if __name__ == "__main__":
    raise SystemExit(main())
