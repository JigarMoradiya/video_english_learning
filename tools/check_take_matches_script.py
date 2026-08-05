#!/usr/bin/env python3
"""Does the take actually SAY the script?

    .venv-align/bin/python tools/check_take_matches_script.py <audio> <script.txt>

Forced alignment is the right tool for timing and the wrong tool for proofreading: it
takes the script as gospel and finds the best place to put each of its words. If the
teacher said something else, alignment succeeds anyway and the caption shows the SCRIPT.
The "captions == script" check then passes too, because both sides came from the script.

Read Your First Sentences shipped a cut where the voice said "A word is missing." and the
caption read "A stone is missing." — plus "can't"/"cannot" and "That's"/"That is". Nothing
in the pipeline could see it.

So this transcribes the take with NO script and diffs, word for word. Run it once when a
take arrives, before building anything.

Exit code 1 if the two disagree.
"""
from __future__ import annotations

import difflib
import re
import sys
from pathlib import Path

import stable_whisper


def words(text: str) -> list[str]:
    return re.sub(r"[^a-z0-9 ]", " ", text.lower()).split()


def main() -> int:
    audio, script = Path(sys.argv[1]), Path(sys.argv[2])
    said = [l.strip() for l in script.read_text().splitlines() if l.strip() and not l.startswith("#")]
    scripted = words(" ".join(said))

    model = stable_whisper.load_model("small")
    heard = words(" ".join(s.text for s in model.transcribe(str(audio), language="en").segments))

    sm = difflib.SequenceMatcher(a=scripted, b=heard)
    diffs = [(t, scripted[i1:i2], heard[j1:j2]) for t, i1, i2, j1, j2 in sm.get_opcodes() if t != "equal"]

    print(f"script {len(scripted)} words · heard {len(heard)} words · match {sm.ratio()*100:.1f}%")
    if not diffs:
        print("the take says the script ✓")
        return 0

    print("\nDIFFERENCES — the script is what will appear on screen, so fix whichever is wrong:")
    for tag, a, b in diffs:
        print(f"   script: {' '.join(a) or '—':<44} heard: {' '.join(b) or '—'}")
    print("\nNote: the transcriber mishears too. Trust your ears over both, then edit the")
    print("script .txt to match the take and re-run align_audio.py.")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
