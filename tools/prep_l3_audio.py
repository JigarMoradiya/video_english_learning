#!/usr/bin/env python3
"""Copy the L3 blending clips out of the APP's audio bank and probe their durations.

    .venv-align/bin/python tools/prep_l3_audio.py

Every SOUND in the L3 video comes from the app, never a fresh recording, so the video can
never drift from what the child hears in the app. Only the connective narration
(public/audio/cv_vc/cv_vc.mp3) was recorded.

Writes:
    public/audio/blending/<name>.opus      the clips
    src/data/blendingAudio.json            { name: durationSeconds }

Chrome decodes opus, so Remotion plays these directly — no transcode.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

APP = Path("/Users/jigarmoradiya/Documents/newProject/eng/iOS/Learn English/Resources/Audio/Phonics")
PHONEMES_DIR = APP / "phonics abcd"
WORDS_DIR = APP / "phonics_word"
OUT = Path("public/audio/blending")
MANIFEST = Path("src/data/blendingAudio.json")

# the two segment sounds of every chunk, plus the chunk itself
PHONEMES = ["sound_a", "sound_e", "sound_i", "sound_o", "sound_u",
            "sound_b", "sound_d", "sound_g", "sound_k", "sound_m",
            "sound_n", "sound_p", "sound_s", "sound_t", "sound_w", "sound_x"]
CHUNKS = ["at", "an", "am", "in", "it", "ox", "up", "us",
          "ba", "ma", "me", "we", "go", "no", "si", "do"]
# Listen section + quiz. Every one verified present in the bank — `ham`, `pup`, `met` and
# `web` are NOT there, which is why am/up/me/we use jam+ram / cup / men / wet instead.
WORDS = ["bat", "cat", "man", "fan", "jam", "ram", "pin", "win", "sit", "hit",
         "box", "fox", "cup", "bus", "bag", "map", "men", "wet", "got", "not",
         "nod", "six", "dog", "dot", "cap", "cop"]


def dur(p: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(p)],
        capture_output=True, text=True, check=True).stdout.strip()
    return round(float(out), 3)


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    manifest: dict[str, float] = {}
    missing: list[str] = []

    for name, src_dir in [(n, PHONEMES_DIR) for n in PHONEMES] + \
                         [(n, WORDS_DIR) for n in CHUNKS + WORDS]:
        src = src_dir / f"{name}.opus"
        if not src.exists():
            missing.append(name)
            continue
        dst = OUT / f"{name}.opus"
        shutil.copy2(src, dst)
        manifest[name] = dur(dst)

    if missing:
        # Hard failure. The user's instruction is explicit: audio that is not in the app
        # must not be used, so a silent gap here would be worse than stopping.
        print(f"MISSING from the app bank ({len(missing)}): {', '.join(missing)}", file=sys.stderr)
        return 1

    MANIFEST.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n")
    total = sum(manifest.values())
    print(f"copied {len(manifest)} clips -> {OUT}")
    print(f"  {len(PHONEMES)} phonemes · {len(CHUNKS)} chunks · {len(WORDS)} words")
    print(f"  total {total:.1f}s · manifest -> {MANIFEST}")
    longest = max(manifest.items(), key=lambda kv: kv[1])
    print(f"  longest clip: {longest[0]} {longest[1]}s")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
