#!/usr/bin/env python3
"""Measure, per Listen build, the exact instant the sound-out hands over.

    .venv-align/bin/python tools/measure_soundout_cuts.py

A sound-out is spoken as 2-3 bursts: "buh · aaa · g". Which burst belongs to the added
letter depends on the DIRECTION:
    VC  "buh-aaa-t"  add = burst 1        -> hand over at the END of burst 1
    CV  "buh-aaa-g"  add = the LAST burst -> hand over at its START
A fixed percentage of the phrase cannot express that: the bursts are unevenly spaced, and
some words have only two (the final plosive releases inside burst 2). So it is measured.

Writes src/data/blendingCuts.json  { word: cutSeconds }
"""
from __future__ import annotations
import json, subprocess
from pathlib import Path
import numpy as np

import sys
SHORT = "--short" in sys.argv
AUDIO = "public/audio/cv_vc/cv_vc_short.mp3" if SHORT else "public/audio/cv_vc/cv_vc_new.mp3"
SR = 16000
OUT = "src/data/blendingCuts916.json" if SHORT else "src/data/blendingCuts.json"
VC_FIRST, CV_FIRST = (70, 84) if SHORT else (70, 96)
VC_WORDS = ["bat", "fan", "jam", "pin"] if SHORT else ["bat", "fan", "jam", "pin", "sit", "fox", "cup", "bus"]
CV_WORDS = ["bag", "map", "six"] if SHORT else ["bag", "map", "met", "wet", "got", "not", "six", "dog"]


def envelope() -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", AUDIO, "-ac", "1", "-ar", str(SR),
                          "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(float)
    w = int(0.010 * SR)
    return 20 * np.log10(np.sqrt(np.convolve(x ** 2, np.ones(w) / w, "same") + 1) / 32768 + 1e-9)


def bursts(db: np.ndarray, t0: float, t1: float) -> list[list[float]]:
    a, b = int(t0 * SR), int(t1 * SR)
    d = db[a:b]
    on = d > np.percentile(d, 92) - 14
    out: list[list[float]] = []
    s = None
    for i, v in enumerate(on):
        if v and s is None:
            s = i
        if not v and s is not None:
            if i - s > 0.045 * SR:
                out.append([t0 + s / SR, t0 + i / SR])
            s = None
    if s is not None:
        out.append([t0 + s / SR, t0 + len(on) / SR])
    merged: list[list[float]] = []
    for sg in out:
        if merged and sg[0] - merged[-1][1] < 0.045:
            merged[-1][1] = sg[1]
        else:
            merged.append(sg)
    return merged


def main() -> int:
    db = envelope()
    ph = json.load(open("src/data/cv_vc_short.timing.json" if SHORT else "src/data/cv_vc_new.timing.json"))
    cuts: dict[str, float] = {}
    for first, words, front in [(VC_FIRST, VC_WORDS, True), (CV_FIRST, CV_WORDS, False)]:
        for k, word in enumerate(words):
            p = ph[first + k * 3 + 1]           # the sound-out phrase
            bs = bursts(db, p["start"], p["end"])
            dur = p["end"] - p["start"]
            # A handover has to be VISIBLE on both sides: whichever card lights second needs
            # more than a blink. "bag" and "wet" each ended with a short tail burst (a breath
            # or the plosive release), and taking it as the consonant left the added letter
            # 0.05-0.07s -- two frames. Any candidate closer than MARGIN to either edge is
            # rejected and the next one back is tried.
            MARGIN = 0.15
            # head margin always: whichever card lights FIRST needs to be readable.
            # tail margin only for `front`, where the second card's lit window ends at the
            # sound-out. A CV build's added letter stays lit into the word reveal, so a late
            # cut costs it nothing -- and the late burst is the truth about when it is said.
            lo = p["start"] + MARGIN
            hi = p["end"] - MARGIN if front else p["end"]
            if front:
                # add = burst 1. When the three sounds run together as ONE burst there is
                # no boundary to find, so fall back to a third — add is 1 of 3 sounds.
                cands = [b[1] for b in bs[:-1]]
                cut = next((c for c in cands if lo <= c <= hi), p["start"] + dur * 0.33)
            else:
                # add = the FINAL consonant, so the handover is always near the end.
                #
                # Said smoothly, "mmm-aaa-p" gives only two bursts: the opening consonant and
                # then the vowel AND the final consonant together. Taking the last burst's
                # START therefore lit "p" at the beginning of "aaa" — the reported bug. Only
                # when that last burst is SHORT is it the consonant on its own (bag 0.07s,
                # wet 0.05s); when it is long the consonant is buried at its end.
                last = bs[-1] if bs else [p["start"], p["end"]]
                if last[1] - last[0] < 0.25:
                    cut = last[0]                       # the burst IS the consonant
                else:
                    cut = max(last[0] + 0.10, last[1] - 0.16)   # it is the tail of the burst
                cut = min(max(cut, lo), hi)
            cuts[word] = round(float(cut), 3)
            print(f"  {word:4s} {'VC' if front else 'CV'}  {len(bs)} bursts  cut {cuts[word]:.2f}"
                  f"  (phrase {p['start']:.2f}-{p['end']:.2f})")
    Path("src/data/blendingCuts916.json" if SHORT else "src/data/blendingCuts.json").write_text(json.dumps(cuts, indent=2, sort_keys=True) + "\n")
    print(f"wrote {OUT} ({len(cuts)} cuts)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
