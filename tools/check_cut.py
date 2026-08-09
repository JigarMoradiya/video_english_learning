#!/usr/bin/env python3
"""Find frames where content is CUT — clipped by the frame edge, or spilling out of its box.

    .venv-align/bin/python tools/check_cut.py <video.mp4> <phrases.json> [--box L,T,R,B]

Why this exists
---------------
"Please make sure not any content is cut" is the note that came back most often on the 4:5
conversion of Part 1, and every time it was found by eye, one screenshot at a time. Eyes
scan a 6-minute video badly. This samples one frame per narration line and measures two
things that "cut" actually means:

  EDGE   content pixels within a few px of the frame border — something is running off
         the screen and has been clipped by the encoder.
  SPILL  content pixels outside the content box — the lesson has escaped the area it was
         given, which is how it ends up under the banner, over the mascot, or off-frame.

Content is separated from the world by a per-pixel MEDIAN plate across all sampled frames:
sky, hills, grass, tower and clock are near-identical in every frame and cancel out, while
cards, words and pictures do not. The mascot and the drifting clouds also move, so their
bands are excluded by name rather than by colour — a colour rule was what made the earlier
checks report the ground as content.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys

import numpy as np

SW, SH = 540, 540           # sample resolution; the long side is scaled to fit
EDGE_PX = 5                 # how close to the border counts as "clipped"
DIFF = 34                   # per-pixel difference that counts as content
MIN_BLOB = 40               # ignore specks (antialiasing, a bird, a blade of grass)


def frames(video: str, times: list[float], w: int, h: int) -> np.ndarray:
    out = []
    for t in times:
        raw = subprocess.run(
            ["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", video, "-frames:v", "1",
             "-vf", f"scale={w}:{h}", "-pix_fmt", "rgb24", "-f", "rawvideo", "-"],
            capture_output=True).stdout
        out.append(np.frombuffer(raw, dtype=np.uint8).reshape(h, w, 3).astype(np.int16))
    return np.stack(out)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("phrases")
    ap.add_argument("--box", help="content box as L,T,R,B in source pixels")
    ap.add_argument("--sides", type=int, default=0,
                    help="px of moving world furniture at each side to ignore "
                         "(e.g. the Magic Stage's curtain drapes, which breathe)")
    args = ap.parse_args()

    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height", "-of", "csv=p=0", args.video],
        capture_output=True, text=True).stdout.strip().split(",")
    VW, VH = int(probe[0]), int(probe[1])
    w = SW if VW >= VH else round(SW * VW / VH)
    h = round(w * VH / VW)

    P = json.load(open(args.phrases))
    times = []
    for i, p in enumerate(P):
        nxt = P[i + 1]["start"] if i + 1 < len(P) else p["end"]
        times.append(min(p["start"] + (nxt - p["start"]) * 0.65, nxt - 0.05))

    F = frames(args.video, times, w, h)
    plate = np.median(F, axis=0)

    # the mascot stands in the bottom-left and the tower in the bottom-right of portrait;
    # both move, and neither is lesson content. Exclude the ground band from the edge test.
    ground = int(h * (0.62 if VH > VW else 0.70))

    if args.box:
        L, T, R, B = (int(v) for v in args.box.split(","))
        bx = (round(L * w / VW), round(T * h / VH), round(R * w / VW), round(B * h / VH))
    else:
        bx = None

    edge_hits, spill_hits = [], []
    for i in range(len(P)):
        d = np.abs(F[i] - plate).sum(axis=2) > DIFF
        # Drifting clouds also differ from the plate, and they reach the frame edges — the
        # first run of this check reported 81 "cuts" that were all cloud. Content is INKY:
        # every card has a near-black border, every letter is dark, every picture is
        # saturated. Sky and cloud are neither, so require one of those two.
        rgb = F[i].astype(np.float32)
        mx, mn = rgb.max(axis=2), rgb.min(axis=2)
        sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
        inky = (mx < 150) | (sat > 0.34)
        mask = d & inky
        mask[ground:, :] = False                       # world actors live down there
        if args.sides:
            sw = round(args.sides * w / VW)
            mask[:, :sw] = False
            mask[:, -sw:] = False
        if mask.sum() < MIN_BLOB:
            continue

        e = EDGE_PX
        touching = (mask[:, :e].sum() + mask[:, -e:].sum()
                    + mask[:e, :].sum() + mask[ground - e:ground, :].sum() * 0)
        if mask[:, :e].sum() > MIN_BLOB or mask[:, -e:].sum() > MIN_BLOB or mask[:e, :].sum() > MIN_BLOB:
            side = []
            if mask[:, :e].sum() > MIN_BLOB: side.append("LEFT")
            if mask[:, -e:].sum() > MIN_BLOB: side.append("RIGHT")
            if mask[:e, :].sum() > MIN_BLOB: side.append("TOP")
            edge_hits.append((i, "+".join(side), int(touching)))

        if bx:
            l, t, r, b = bx
            out = mask.copy()
            out[:, l:r] = False          # sideways escape
            side = out.sum()

            # VERTICAL overflow. Testing the margins directly does not work: the banner
            # sits above the box and its TEXT changes every section, so it differs from the
            # median plate and reads as content. Instead ask whether the beat FILLS its box
            # top to bottom — a beat that reaches both edges has run out of room, which is
            # exactly the state that pushes a picture up into the title.
            inner = mask.copy()
            inner[:t, :] = False
            inner[b:, :] = False
            inner[:, :l] = False
            inner[:, r:] = False
            over = False
            if inner.sum() > MIN_BLOB:
                # a row only counts as OCCUPIED if a real element sits in it. Testing
                # `.any()` made every frame look full, because the stage's drifting
                # sparkles are gold, moving, and one pixel wide — they satisfied both the
                # plate test and the ink test while being pure scenery.
                need = max(6, round((r - l) * 0.04))
                occupied = np.nonzero(inner.sum(axis=1) >= need)[0]
                if occupied.size:
                    edge = max(2, round((b - t) * 0.012))
                    over = occupied.min() <= t + edge and occupied.max() >= b - edge - 1
            if out.sum() > MIN_BLOB:
                ys, xs = np.nonzero(out)
                spill_hits.append((i, int(out.sum()),
                                   f"SIDEWAYS x{xs.min() * VW // w}-{xs.max() * VW // w}"))
            elif over:
                spill_hits.append((i, 0, "TOO TALL — fills the box top to bottom"))

    print(f"{len(P)} lines sampled from {args.video}  ({VW}x{VH})")
    print(f"\n── CUT — content touching the frame edge: {len(edge_hits)} ──")
    for i, side, n in edge_hits or []:
        print(f"   #{i:3d} {side:12s} {n:5d}px   {P[i]['text'].strip()[:50]}")
    if not edge_hits:
        print("   none")
    if bx:
        print(f"\n── SPILL — content sideways out of the box, or too tall for it: {len(spill_hits)} ──")
        for i, n, where in spill_hits or []:
            print(f"   #{i:3d}  {where}   {P[i]['text'].strip()[:44]}")
        if not spill_hits:
            print("   none")
    return 1 if (edge_hits or spill_hits) else 0


if __name__ == "__main__":
    sys.exit(main())
