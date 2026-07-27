#!/usr/bin/env python3
"""Snap one-word phrases onto the audio's real onsets.

Usage:
    python snap_word_phrases.py <audio.mp3> <timing.json> <from>-<to> [<from>-<to> ...] [--write]

Why this exists
---------------
Forced alignment is text-driven, so a run of short, similar, evenly-spaced utterances —
exactly what the "let's see it" beat is ("Boat. Coat. Goat. Road. Toast. Soap.") — is where
it fails. On the second oa/ow take whisper DROPPED one utterance and squeezed the rest up
against each other:

    aligned   Boat 58.20  Coat 61.32  Goat 63.30  Road 63.74  Toast 64.88  Soap 66.90
    spoken    Boat 58.03  Coat 59.72  Goat 61.31  Road 63.12  Toast 64.97  Soap 66.89
                          ^^^^^ 1.6s late  ^^^^^ 2.0s late

Cards then light, and word clips then play, up to two seconds after the narrator says the
word. The transcript is still the authority on WHAT was said and in WHAT ORDER — only the
timestamps are suspect — so this finds the speech segments in the range, checks the count
matches, and re-times the phrases in order.

Prints a table and changes nothing unless --write is passed.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

HOP = 0.01  # 10ms envelope


def envelope(path: Path) -> tuple[np.ndarray, int]:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
        capture_output=True,
    ).stdout
    a = np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768.0
    sr = 16000
    hop = int(sr * HOP)
    env = np.array([np.sqrt((a[i : i + hop * 3] ** 2).mean()) for i in range(0, len(a) - hop * 3, hop)])
    return env, sr


def segments(env, t0, t1, thr_frac=0.06, min_dur=0.10, merge_gap=0.16):
    """Speech runs in [t0,t1]. merge_gap is under a syllable, so a word stays one segment."""
    i0, i1 = int(t0 / HOP), int(t1 / HOP)
    seg = env[i0:i1]
    if not len(seg):
        return []
    on = seg > seg.max() * thr_frac
    runs, s = [], None
    for k, v in enumerate(on):
        if v and s is None:
            s = k
        elif not v and s is not None:
            runs.append([s, k])
            s = None
    if s is not None:
        runs.append([s, len(on)])
    merged: list[list[int]] = []
    for r in runs:
        if merged and (r[0] - merged[-1][1]) * HOP < merge_gap:
            merged[-1][1] = r[1]
        else:
            merged.append(r)
    return [((i0 + x) * HOP, (i0 + y) * HOP) for x, y in merged if (y - x) * HOP >= min_dur]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("timing")
    ap.add_argument("ranges", nargs="+", help="inclusive phrase ranges of ONE-WORD phrases, e.g. 27-32")
    ap.add_argument("--write", action="store_true")
    a = ap.parse_args()

    env, _ = envelope(Path(a.audio))
    phrases = json.loads(Path(a.timing).read_text())

    changed = 0
    for spec in a.ranges:
        lo, hi = (int(x) for x in spec.split("-"))
        idx = list(range(lo, hi + 1))
        want = len(idx)
        # search from the end of the phrase before to the start of the phrase after, so a
        # neighbouring utterance can't be mistaken for one of ours
        t0 = phrases[lo - 1]["end"] + 0.05 if lo > 0 else max(0.0, phrases[lo]["start"] - 0.4)
        t1 = phrases[hi + 1]["start"] - 0.05 if hi + 1 < len(phrases) else phrases[hi]["end"] + 0.4
        segs = segments(env, t0, t1)
        print(f"\n── phrases {lo}-{hi} in {t0:.2f}–{t1:.2f}: expected {want}, found {len(segs)} ──")
        if len(segs) != want:
            print("   count mismatch — NOT snapping this range (inspect manually):")
            for s, e in segs:
                print(f"      {s:7.2f} – {e:7.2f}")
            continue
        print(f"   {'text':<14}{'aligned':>9}{'spoken':>9}{'drift':>8}")
        for i, (s, e) in zip(idx, segs):
            p = phrases[i]
            d = s - p["start"]
            mark = "  <-- snap" if abs(d) > 0.12 else ""
            print(f"   {p.get('text','')[:12]:<14}{p['start']:9.2f}{s:9.2f}{d:+8.2f}{mark}")
            if abs(d) <= 0.12:
                continue
            p["start"], p["end"] = round(s, 3), round(max(e, s + 0.2), 3)
            p["duration"] = round(p["end"] - p["start"], 3)
            for w in p.get("words", []):  # a one-word phrase: the token IS the phrase
                w["start"], w["end"] = p["start"], p["end"]
            changed += 1

    if not changed:
        print("\nnothing to snap.")
        return 0
    if a.write:
        Path(a.timing).write_text(json.dumps(phrases, indent=2) + "\n")
        print(f"\nwrote {a.timing} ({changed} phrase(s) re-timed)")
    else:
        print(f"\n{changed} phrase(s) would be re-timed — dry run, pass --write to apply")
    return 0


if __name__ == "__main__":
    sys.exit(main())
