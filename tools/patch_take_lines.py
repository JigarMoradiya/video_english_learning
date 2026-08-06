#!/usr/bin/env python3
"""Replace individual LINES inside a finished take, leaving everything else untouched.

    .venv-align/bin/python tools/patch_take_lines.py <take.mp3> <phrases.json> <out.mp3> \
        "One sound.=patch_a.mp3" "English never doubles C.=patch_b.mp3"

Why this exists rather than re-cutting the take:

A long lesson take is a PERFORMANCE. L4 and Read Your First Sentences were assembled by
slicing every line out and re-making all the gaps from a table, which is right when the
gaps have to change — the L5 take is already paced at ~2.5s a line with the teacher's own
pauses, and re-gapping 253 of them would flatten it.

So the take is kept whole and only the named lines are swapped. Each splice lands in the
MIDDLE of the silence either side of the line, never inside speech — the same rule that
keeps cut_sentences.py safe.

The replacement is usually a different length from what it replaces, so everything after
it shifts. That is expected: re-run align_audio.py on the OUTPUT, and captions come from
the patched file rather than the original.
"""
from __future__ import annotations

import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

SR = 44100


def pcm(p: str | Path) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(p), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
        capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def main() -> int:
    take_path, phrases_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
    patches = dict(a.split("=", 1) for a in sys.argv[4:])

    take = pcm(take_path)
    phrases = json.load(open(phrases_path))

    # resolve each named line to a cut window in the middle of its surrounding silence
    jobs = []
    for text, repl in patches.items():
        hit = next((i for i, p in enumerate(phrases) if p["text"].strip() == text.strip()), None)
        if hit is None:
            raise SystemExit(f"line not found in the take: {text!r}")
        prev_end = phrases[hit - 1]["end"] if hit else 0.0
        next_start = phrases[hit + 1]["start"] if hit + 1 < len(phrases) else phrases[hit]["end"] + 0.5
        a = (prev_end + phrases[hit]["start"]) / 2
        b = (phrases[hit]["end"] + next_start) / 2
        jobs.append((a, b, repl, text, phrases[hit]["end"] - phrases[hit]["start"]))

    jobs.sort()
    out: list[np.ndarray] = []
    cursor = 0
    ramp = int(0.010 * SR)  # 10ms, so a splice can never click

    for a, b, repl, text, old_dur in jobs:
        ai, bi = int(a * SR), int(b * SR)
        out.append(take[cursor:ai])
        new = pcm(repl)
        # keep the same amount of air around it as the take had, so the rhythm survives
        lead = np.zeros(int(min(0.22, (phrase_gap := a)) * 0 + 0.14 * SR), dtype=np.float32)
        tail = np.zeros(int(0.16 * SR), dtype=np.float32)
        seg = np.concatenate([lead, new, tail])
        if len(seg) > 2 * ramp:
            seg[:ramp] *= np.linspace(0, 1, ramp)
            seg[-ramp:] *= np.linspace(1, 0, ramp)
        out.append(seg)
        cursor = bi
        print(f"  {text!r}: {old_dur:.2f}s → {len(new)/SR:.2f}s  (window {a:.2f}–{b:.2f}s)")

    out.append(take[cursor:])
    joined = np.concatenate(out)

    tmp = Path(out_path).with_suffix(".wav")
    with wave.open(str(tmp), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(joined, -1, 1) * 32767).astype("<i2").tobytes())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-c:a", "libmp3lame",
                    "-q:a", "2", out_path], check=True)
    tmp.unlink()
    print(f"\n{len(take)/SR:.2f}s → {len(joined)/SR:.2f}s   wrote {out_path}")
    print("RE-ALIGN THE OUTPUT — every timing after the first patch has moved.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
