#!/usr/bin/env python3
"""Render the L4 timeline down to one wav, for caption snapping and for checking.

    .venv-align/bin/python tools/build_cvc_mix.py

The reel itself plays the 125 clips separately — Remotion places each <Audio/> at its own
start — so this file is never shipped. It exists because build_cvc_captions.py has to snap
every caption stamp onto REAL speech, and "real speech" means the audio as the viewer will
hear it: all clips together, at their timeline positions.

It must run AFTER build_cvc_timeline.py and BEFORE build_cvc_captions.py. Changing a gap in
the timeline moves every later clip; a stale mix silently seats captions against the old
positions, which is exactly the drift class this pipeline exists to prevent.
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

import numpy as np

SR = 16000
TIMELINE = json.load(open("src/data/cvc.timeline.json"))
OUT = Path("public/audio/cvc/_mix.wav")


def pcm(path: Path) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "quiet", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
        capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32)


def main() -> int:
    total = TIMELINE["total"] + 2.0
    buf = np.zeros(int(total * SR), dtype=np.float32)
    for c in TIMELINE["clips"]:
        x = pcm(Path("public") / c["src"])
        a = int(c["start"] * SR)
        n = min(len(x), len(buf) - a)
        buf[a:a + n] += x[:n]          # clips never overlap, so a sum is a placement
    peak = np.abs(buf).max()
    if peak > 32767:
        buf *= 32767 / peak
    OUT.write_bytes(b"")
    p = subprocess.Popen(
        ["ffmpeg", "-y", "-v", "error", "-f", "s16le", "-ar", str(SR), "-ac", "1",
         "-i", "-", str(OUT)], stdin=subprocess.PIPE)
    p.communicate(buf.astype(np.int16).tobytes())
    print(f"{len(TIMELINE['clips'])} clips -> {OUT}  ({total:.1f}s)")
    return p.returncode


if __name__ == "__main__":
    raise SystemExit(main())
