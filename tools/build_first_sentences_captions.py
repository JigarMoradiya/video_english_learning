#!/usr/bin/env python3
"""Re-stamp the narration captions onto the REBUILT timeline.

    .venv-align/bin/python tools/build_first_sentences_captions.py

The aligner timed every word against the original continuous take. The timeline builder
then re-made all the gaps, so every line now starts somewhere else. Stamping captions from
the original timings would put the whole track minutes out of step — this maps each line's
words onto its new home.

THE TEXT NEVER CHANGES. Whisper's transcription is used only for TIMING; the words shown
come from the script, exactly as written. That is the rule the c/k/ck video established
after a mis-heard word reached the screen.

Must run AFTER build_first_sentences_timeline.py.
Writes src/data/first_sentences.captions.json
"""
from __future__ import annotations

import json
from pathlib import Path

TIMELINE = json.load(open("src/data/first_sentences.timeline.json"))
PHRASES = json.load(open("public/audio/first_sentences_16x9/first_sentences_16x9.phrases.json"))
OUT = Path("src/data/first_sentences.captions.json")

out = []
for clip in TIMELINE["clips"]:
    if clip["kind"] != "run":
        continue
    # a clip may carry SEVERAL phrases — lines spoken in one breath are never cut apart,
    # but they still get one caption each
    shift = clip["start"] + clip["lead"] - PHRASES[clip["line"]]["start"]
    for idx in clip.get("lines", [clip["line"]]):
        ph = PHRASES[idx]
        words = [{"word": w["word"],
                  "start": round(w["start"] + shift, 3),
                  "end": round(w["end"] + shift, 3)} for w in ph["words"]]
        out.append({
            "index": len(out),
            "text": ph["text"],
            "line_index": idx,
            "start": round(ph["start"] + shift, 3),
            "end": round(ph["end"] + shift, 3),
            "duration": round(ph["end"] - ph["start"], 3),
            "words": words,
        })

json.dump(out, open(OUT, "w"), indent=1)

# ── checks that have each caught a shipped bug before ────────────────────────
bad = []
for i, p in enumerate(out):
    if i and p["start"] < out[i - 1]["end"]:
        bad.append(f"overlap: {out[i-1]['text']!r} → {p['text']!r}")
    if p["words"] and (p["words"][0]["start"] < p["start"] - 0.01 or p["words"][-1]["end"] > p["end"] + 0.01):
        bad.append(f"word outside phrase: {p['text']!r}")
print(f"{len(out)} captions · {out[0]['start']:.2f}s → {out[-1]['end']:.2f}s")
print("checks:", "; ".join(bad) if bad else "clean")
