#!/usr/bin/env python3
"""Extract the EXAMPLE PHRASE at the end of every A-Z letter clip, with word times.

Each public/audio/letters/<x>_<word>_sound.mp3 is
    "<Letter> says <sound>x3.  <Letter> for <Word>.  <example phrase>."
The phrase is real narration (2.5-4s) that the Shorts stage as its own beat, so
each one needs its text and per-word start times.

Pass 1 (no scripts/):  transcribe everything, print the tails for review.
Pass 2 (scripts/ present): force-align against the reviewed text -> letterPhrases.json

Whisper mishears these short phrases often enough that pass 1 output must be read
and corrected by hand before pass 2 — e.g. A came back as "Hee, timey ant walks
fast" for "Tiny ant walks fast".

    cd tools && ./.venv/bin/python align_letter_tails.py [--write]
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUD = os.path.join(ROOT, "public/audio/letters")
SCRIPTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scripts")
OUT = os.path.join(ROOT, "src/data/letterPhrases.json")

src = open(os.path.join(ROOT, "src/data/letters.ts")).read()
ROWS = re.findall(r'letter: "(\w)".*?word: "([\w]+)".*?audio: "([\w]+)".*?timings: \[([^\]]+)\]', src)

import stable_whisper  # noqa: E402

model = stable_whisper.load_model("base.en")

write = "--write" in sys.argv
out = {}

for letter, word, audio, timings in ROWS:
    t = [float(x) for x in timings.split(",")]
    word_at = t[7]
    path = os.path.join(AUD, f"{audio}.mp3")
    script = os.path.join(SCRIPTS, f"{audio}.tail.txt")

    if os.path.exists(script):
        text = open(script).read().strip()
        r = model.align(path, text, language="en")
        words = [w for seg in r.segments for w in seg.words]
    else:
        r = model.transcribe(path, language="en", verbose=None)
        words = [w for seg in r.segments for w in seg.words]
        # the phrase is whatever is spoken AFTER "<Letter> for <Word>"
        words = [w for w in words if w.start > word_at + 0.35]

    clean = [
        {"w": w.word.strip().strip(",."), "at": round(w.start, 2)}
        for w in words
        if w.word.strip().strip(",.")
    ]
    if clean:
        out[letter] = {"words": clean}
    print(f"{letter}  {' '.join(c['w'] for c in clean)}")
    print(f"   {[c['at'] for c in clean]}")

if write:
    json.dump(out, open(OUT, "w"), indent=0, sort_keys=True)
    print(f"\nwrote {len(out)} phrases -> src/data/letterPhrases.json")
else:
    print("\n(review the text above, put corrections in tools/scripts/<audio>.tail.txt, then re-run with --write)")
