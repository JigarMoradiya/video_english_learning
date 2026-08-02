#!/usr/bin/env python3
"""Lay out L4's audio timeline: 15 recorded runs + the app's own sound/word clips.

    .venv-align/bin/python tools/build_cvc_timeline.py

NOTHING IS EVER CUT. Every clip — the teacher's runs and the app's sounds and words — is
placed whole at a computed start time. That removes the entire bug class that damaged
`in.` `up.` `us.` `ba+g` and `dog` on L3, all of which came from slicing one long take.

The cost lands here instead: EVERY GAP IS A DECISION. L3 v1 was assembled this same way
and was rejected for pacing — "too fast going why?" — because the gaps were 0.11s between
events and 0.23s between sounds. These are the L4 numbers, and they are the whole reason
this file exists rather than the values being scattered through the reel.

Writes src/data/cvc.timeline.json — every clip with its start, plus section marks the
reel drives its visuals from.
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

AUDIO = Path("public/audio/cvc")
OUT = Path("src/data/cvc.timeline.json")

# ── THE GAP TABLE ────────────────────────────────────────────────────────────
G_SOUND = 0.35    # between two sounds inside one sound-out: kuh → aaa
G_WORD = 0.45     # last sound → the whole word: tuh → cat!
G_AFTER_WORD = 1.55   # a word landing → whatever comes next. 0.55 was why every
                      # mid-group picture was SKIPPED: the next build took the
                      # screen before the image had a single frame — and why the
                      # whole video felt rushed.
G_LINE = 0.60     # between two teacher runs
G_SECTION = 0.90  # across a section change
PAUSE_HEAR = 1.0  # "Hear the middle?"      — child answers
PAUSE_TRY = 2.0   # "Sound it out."         — child blends alone
PAUSE_QUIZ = 2.5  # "Which vowel...?"       — child picks


def dur(p: Path) -> float:
    return float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nk=1:nw=1", str(p)],
        capture_output=True, text=True).stdout.strip())


# word → its three letters, in the app's own spelling
WORDS = {w: w for w in
         "cat hat map fan bat hen pen bed net ten pig big six lip win "
         "dog pot hot box fox sun bug run cup jug".split()}
VOWELS = set("aeiou")

# The video, in order. Each entry is one of:
#   ("run", "07")        a recorded teacher file
#   ("build", "cat")     three sounds then the whole word
#   ("word", "dog")      the whole word alone
#   ("gap", 1.4)         deliberate silence
#   ("mark", "shortA")   a section marker, zero length
SCRIPT: list[tuple] = [
    ("mark", "hook"),
    ("run", "01"),                       # Watch this.
    ("gap", 0.5),
    ("build", "cat"),                    # kuh aaa tuh → cat!
    ("mark", "idea"),
    ("run", "02"),                       # the opener — now ends "Let's do. First vowel — aaa."
    ("mark", "shortA"),
    ("build", "cat"),
    ("run", "03"),                       # Same middle sound. Watch.
    ("build", "hat"),
    ("run", "04"),                       # You're getting it.
    ("build", "map"),
    ("run", "05a"),                      # Three words. One vowel.  ← true HERE, at three
    ("build", "fan"),
    ("build", "bat"),
    ("run", "05b"),                      # New vowel. eh.
    ("mark", "shortE"),
    ("build", "hen"),
    ("build", "pen"),
    ("run", "06"),                       # Hen. Pen. Hear the middle?
    ("gap", PAUSE_HEAR),
    ("build", "bed"),
    ("build", "net"),
    ("build", "ten"),
    ("run", "07"),                       # Nice work. / Next one — ih.
    ("mark", "shortI"),
    ("build", "pig"),
    ("build", "big"),
    ("run", "08"),                       # Pig... big. Only the first sound changed.
    ("build", "six"),
    ("build", "lip"),
    ("build", "win"),
    ("run", "09"),                       # Your turn's coming. / Next — oh.
    ("mark", "shortO"),
    ("build", "dog"),
    ("build", "pot"),
    ("build", "hot"),
    ("build", "box"),
    ("build", "fox"),
    ("run", "10"),                       # Pot. Hot. Hear that? / Last vowel. uh.
    ("mark", "shortU"),
    ("build", "sun"),
    ("build", "bug"),
    ("run", "11"),                       # This one's yours. Sound it out.
    ("gap", PAUSE_TRY),
    ("build", "run"),
    ("run", "12"),                       # Did you get it? I bet you did.
    ("build", "cup"),
    ("build", "jug"),
    ("mark", "wall"),
    ("run", "13a"),                      # Twenty five words.  (the new recording)
    ("run", "13b"),                      # You read them all. / One more. Something's missing.
    ("mark", "quiz"),
    ("quizsounds", "dog"),
    ("run", "14"),                       # Which vowel goes in the middle?
    ("gap", PAUSE_QUIZ),
    ("qword", "dog"),
    ("mark", "wrap"),
    ("run", "15"),
]


def main() -> int:
    clips: list[dict] = []
    marks: dict[str, float] = {}
    t = 0.0
    prev = None

    def add(src: str, d: float, kind: str, **extra) -> None:
        nonlocal t
        clips.append({"src": src, "start": round(t, 3), "dur": round(d, 3), "kind": kind, **extra})
        t += d

    for kind, val in SCRIPT:
        if kind == "mark":
            marks[val] = round(t, 3)
            prev = "mark"
            continue

        # the gap BEFORE this item
        if prev is not None and kind != "gap":
            if prev == "mark":
                t += G_SECTION
            elif prev in ("build", "word", "qword"):
                t += G_AFTER_WORD
            else:
                t += G_LINE

        if kind == "gap":
            t += val
            prev = "gap"

        elif kind == "run":
            add(f"audio/cvc/{val}.mp3", dur(AUDIO / f"{val}.mp3"), "run", id=val)
            prev = "run"

        elif kind == "build":
            letters = WORDS[val]
            for i, ch in enumerate(letters):
                if i:
                    t += G_SOUND
                add(f"audio/cvc/snd/{ch}.mp3", dur(AUDIO / "snd" / f"{ch}.mp3"), "sound",
                    word=val, letter=ch, idx=i, vowel=ch in VOWELS)
            t += G_WORD
            add(f"audio/cvc/word/{val}.mp3", dur(AUDIO / "word" / f"{val}.mp3"), "word", word=val)
            prev = "build"

        elif kind == "quizsounds":
            # the two consonants sound; the vowel's slot is SILENT — that silence is the
            # question, so it gets a real beat rather than being skipped
            letters = WORDS[val]
            add(f"audio/cvc/snd/{letters[0]}.mp3", dur(AUDIO / "snd" / f"{letters[0]}.mp3"),
                "sound", word=val, letter=letters[0], idx=0, vowel=False)
            t += G_SOUND + 0.55                      # the missing middle
            add(f"audio/cvc/snd/{letters[2]}.mp3", dur(AUDIO / "snd" / f"{letters[2]}.mp3"),
                "sound", word=val, letter=letters[2], idx=2, vowel=False)
            prev = "build"

        elif kind == "qword":
            letters = WORDS[val]
            add(f"audio/cvc/snd/{letters[1]}.mp3", dur(AUDIO / "snd" / f"{letters[1]}.mp3"),
                "sound", word=val, letter=letters[1], idx=1, vowel=True)
            t += G_WORD
            add(f"audio/cvc/word/{val}.mp3", dur(AUDIO / "word" / f"{val}.mp3"), "word", word=val)
            prev = "qword"

    total = round(t, 3)
    OUT.write_text(json.dumps({"total": total, "marks": marks, "clips": clips}, indent=1) + "\n")

    speech = sum(c["dur"] for c in clips)
    print(f"{len(clips)} clips · {total:.1f}s  ({int(total // 60)}m {total % 60:04.1f}s)")
    print(f"  speech {speech:.1f}s · silence {total - speech:.1f}s ({(total - speech) / total * 100:.0f}%)")
    print("  sections: " + " · ".join(f"{k}@{v:.0f}s" for k, v in marks.items()))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
