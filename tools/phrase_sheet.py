#!/usr/bin/env python3
"""One frame per PHRASE, plus a stale-visual report.

Usage:
    python phrase_sheet.py <video.mp4> <timing.json> [outdir]

Why this exists
---------------
The 1fps "dead second" sweep compares consecutive SECONDS and passes if anything moved. That
is not the rule we actually hold ourselves to. The rule is that every narration LINE gets its
own visual change — so the comparison has to be phrase-to-phrase, and it has to ignore the
things that always move (mascot bob, drifting motes, the caption itself).

Sampling one frame per second also means a 5-minute video is checked at ~300 samples chosen
by the clock rather than by the script, and a 13-frame eyeball of a 112-phrase video misses
most of it. This samples exactly one frame per phrase, late enough in the phrase for that
line's visual to have settled.

What it reports
---------------
  STALE    the frame is ~identical to the previous phrase's frame → that line has no visual
  QUIET    it changed, but by less than a chip-sized amount → probably only a note swapped
Both are measured ABOVE the caption band, so a changing caption never counts as a change.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

SETTLE = 0.45      # sample this far into the phrase, so springs have landed
CAPTION_FRAC = 0.80  # ignore everything below this: captions are not a visual change
STALE = 0.55       # mean abs diff at or under this = nothing happened
QUIET = 1.60       # ...and under this = only something chip-sized moved


def frame_at(video: Path, t: float, out: Path, w: int = 480) -> None:
    subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", str(video),
         "-frames:v", "1", "-vf", f"scale={w}:-1", "-y", str(out)],
        check=True,
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("timing")
    ap.add_argument("outdir", nargs="?", default="/tmp/phrase_sheet")
    args = ap.parse_args()

    video, out = Path(args.video), Path(args.outdir)
    out.mkdir(parents=True, exist_ok=True)
    phrases = json.load(open(args.timing))

    grays: list[np.ndarray] = []
    for i, p in enumerate(phrases):
        # sample late in the phrase, but never past its end
        t = min(p["start"] + SETTLE, p["end"] - 0.05) if p["end"] - p["start"] > 0.2 else p["start"] + 0.05
        f = out / f"p{i:03d}.png"
        frame_at(video, t, f)
        im = Image.open(f).convert("L")
        grays.append(np.asarray(im)[: int(im.height * CAPTION_FRAC)].astype(int))

    print(f"{len(phrases)} phrases sampled from {video.name}\n")
    stale, quiet = [], []
    for i in range(1, len(grays)):
        d = float(np.abs(grays[i] - grays[i - 1]).mean())
        if d <= STALE:
            stale.append((i, d))
        elif d < QUIET:
            quiet.append((i, d))

    def show(label: str, rows: list[tuple[int, float]]) -> None:
        print(f"── {label}: {len(rows)} ──")
        for i, d in rows:
            print(f"   #{i:3d}  diff {d:5.2f}   {phrases[i]['text'][:66]}")
        if not rows:
            print("   none")
        print()

    show("STALE — no visual change from the previous line", stale)
    show("QUIET — changed, but only by a chip-sized amount", quiet)

    # a contact sheet, labelled by phrase index, for reading them all at once
    cols, thumb = 8, 300
    ims = [Image.open(out / f"p{i:03d}.png").resize((thumb, int(thumb * 9 / 16))) for i in range(len(phrases))]
    rows = (len(ims) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * thumb, rows * ims[0].height), "white")
    for i, im in enumerate(ims):
        sheet.paste(im, ((i % cols) * thumb, (i // cols) * im.height))
    sheet.save(out / "sheet.png")
    print(f"contact sheet (1 frame per phrase): {out / 'sheet.png'}")
    return 1 if stale else 0


if __name__ == "__main__":
    sys.exit(main())
