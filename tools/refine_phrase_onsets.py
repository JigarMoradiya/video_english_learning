#!/usr/bin/env python3
"""Re-time phrase words from the audio's own energy peaks, not from whisper.

Whisper cannot reliably time REPEATED identical words — it collapses them. C's
"Meow meow meow" came out 4.84 / 5.06 / 5.90 when the real onsets are
4.74 / 5.72 / 6.30, so the 2nd highlight fired while the 1st meow was still
playing. Same exposure on G (meh x2), P (squawk x2), X (ting x3).

silencedetect alone is not enough either: between C's 2nd and 3rd meow the level
only DIPS (RMS ~1475 against a 10159 peak), it never reaches silence.

So: build a 20ms RMS envelope over the phrase, find the syllable peaks, and take
each peak's onset as the local minimum before it. If the peak count matches the
word count the timings are replaced; otherwise the whisper times are kept and the
letter is reported for a hand check — a wrong automatic guess is worse than the
status quo.

    python3 tools/refine_phrase_onsets.py [--write]
"""
import array
import json
import math
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PH = os.path.join(ROOT, "src/data/letterPhrases.json")
SR = 8000
FRAME = int(0.02 * SR)  # 20ms


def envelope(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
        capture_output=True).stdout
    a = array.array("h")
    a.frombytes(raw)
    out = []
    for i in range(0, len(a) - FRAME, FRAME):
        s = sum(x * x for x in a[i:i + FRAME]) / FRAME
        out.append((i / SR, math.sqrt(s)))
    return out


def onsets(env, t0, want):
    """Peak-pick `want` syllables at/after t0; return their onset times."""
    seg = [(t, r) for t, r in env if t >= t0]
    if len(seg) < 5:
        return []
    # SMOOTH first. A sustained vowel plateaus with small wobble, and raw local
    # maxima on that plateau read as several separate syllables.
    k = 5  # ~100ms
    sm = []
    for i in range(len(seg)):
        lo, hi = max(0, i - k // 2), min(len(seg), i + k // 2 + 1)
        sm.append((seg[i][0], sum(r for _, r in seg[lo:hi]) / (hi - lo)))
    seg = sm
    mx = max(r for _, r in seg)
    if mx <= 0:
        return []

    peaks = [i for i in range(1, len(seg) - 1)
             if seg[i][1] >= 0.28 * mx
             and seg[i][1] >= seg[i - 1][1] and seg[i][1] >= seg[i + 1][1]]
    if not peaks:
        return []

    # PROMINENCE: two peaks are separate syllables only if the valley between
    # them drops well below both. Without this, one long "meow" splits in two.
    merged = [peaks[0]]
    for i in peaks[1:]:
        j = merged[-1]
        valley = min(r for _, r in seg[j:i + 1]) if i > j else seg[i][1]
        if valley > 0.55 * min(seg[i][1], seg[j][1]) or seg[i][0] - seg[j][0] < 0.25:
            if seg[i][1] > seg[j][1]:
                merged[-1] = i
        else:
            merged.append(i)
    peaks = merged
    if len(peaks) != want:
        return []
    # onset = walk back from each peak to its local minimum
    res = []
    for pi in peaks:
        j = pi
        while j > 0 and seg[j - 1][1] < seg[j][1]:
            j -= 1
        res.append(round(seg[j][0], 2))
    return res


data = json.load(open(PH))
src = open(os.path.join(ROOT, "src/data/letters.ts")).read()
audio_of = dict(re.findall(r'letter: "(\w)".*?audio: "([\w]+)"', src))

changed, kept = [], []
for L in sorted(data):
    words = data[L]["words"]
    path = os.path.join(ROOT, "public/audio/letters", audio_of[L] + ".mp3")
    env = envelope(path)
    t0 = max(0.0, words[0]["at"] - 0.30)
    got = onsets(env, t0, len(words))
    old = [w["at"] for w in words]
    if not got:
        kept.append((L, " ".join(w["w"] for w in words), old))
        continue
    drift = max(abs(a - b) for a, b in zip(old, got))
    if drift >= 0.08:
        changed.append((L, " ".join(w["w"] for w in words), old, got, drift))
        for w, t in zip(words, got):
            w["at"] = t

print("RE-TIMED (whisper was off by >=0.08s):")
for L, txt, old, new, d in sorted(changed, key=lambda x: -x[4]):
    print(f"  {L}  {txt}")
    print(f"       was {old}\n       now {new}   (max drift {d:.2f}s)")
print(f"\nkept whisper timings for {len(kept)} letters (peak count != word count):")
for L, txt, old in kept:
    print(f"  {L}  {txt}  {old}")

if "--write" in sys.argv:
    json.dump(data, open(PH, "w"), indent=0, sort_keys=True)
    print(f"\nwrote {len(changed)} corrections -> src/data/letterPhrases.json")
else:
    print("\n(dry run — pass --write to apply)")
