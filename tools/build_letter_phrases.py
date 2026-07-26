#!/usr/bin/env python3
"""Force-align every A-Z letter clip and emit src/data/letterPhrases.json.

Builds the FULL script for each clip from data we already have —
    "<Letter> says <Sound> <Sound> <Sound>."
    "<Letter> for <Word>."
    [optional giggle]
    "<reviewed tail phrase>"
— aligns it, then keeps only the LAST line's words. Aligning the tail alone
against the whole 8s clip would stretch it across the entire file; the full
script is what makes the timings honest. The giggle line exists so the aligner
accounts for it without it landing on screen.

Tail text comes from tools/scripts/tails.json (hand-reviewed; see that file).

    cd tools && ./.venv/bin/python build_letter_phrases.py
"""
import json
import os
import re
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
AUD = os.path.join(ROOT, "public/audio/letters")
SCRIPTS = os.path.join(HERE, "scripts")
OUT = os.path.join(ROOT, "src/data/letterPhrases.json")
PY = os.path.join(HERE, ".venv/bin/python")

tails = json.load(open(os.path.join(SCRIPTS, "tails.json")))
src = open(os.path.join(ROOT, "src/data/letters.ts")).read()
rows = re.findall(
    r'letter: "(\w)".*?word: "([\w]+)".*?soundToken: "([\w]+)".*?audio: "([\w]+)"', src)
# soundToken appears before audio in the file; re-parse defensively
rows = re.findall(
    r'\{ letter: "(\w)", word: "([\w]+)", soundToken: "([\w]+)", audio: "([\w]+)"', src)

out, failed = {}, []
for letter, word, sound, audio in rows:
    spec = tails.get(letter)
    if not spec:
        failed.append(f"{letter}: no tail in tails.json")
        continue
    s = sound.lower()
    lines = [f"{letter} says {s} {s} {s}.", f"{letter} for {word}."]
    if spec.get("lead"):
        lines.append(spec["lead"])
    lines.append(spec["tail"])

    txt = os.path.join(SCRIPTS, f"{audio}.txt")
    open(txt, "w").write("\n".join(lines) + "\n")

    subprocess.run([PY, os.path.join(HERE, "align_audio.py"),
                    os.path.join(AUD, f"{audio}.mp3"), txt],
                   capture_output=True, text=True)

    pj = os.path.join(AUD, f"{audio}.phrases.json")
    if not os.path.exists(pj):
        failed.append(f"{letter}: aligner produced no phrases.json")
        continue
    phrases = json.load(open(pj))
    last = phrases[-1]
    words = [{"w": w["word"].strip().strip(",."), "at": round(w["start"], 2)}
             for w in last["words"] if w["word"].strip().strip(",.")]
    if not words:
        failed.append(f"{letter}: empty tail")
        continue
    out[letter] = {"words": words}
    print(f"{letter}  {last['start']:5.2f}s  " + " ".join(w["w"] for w in words))

json.dump(out, open(OUT, "w"), indent=0, sort_keys=True)
print(f"\nwrote {len(out)}/26 -> src/data/letterPhrases.json")
if failed:
    print("PROBLEMS:")
    for f in failed:
        print("  " + f)
