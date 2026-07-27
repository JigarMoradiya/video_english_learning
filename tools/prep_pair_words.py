#!/usr/bin/env python3
"""Per-word clips for the ai/ay · oi/oy · oa/ow 16:9 example boards.

Same job as prep_extra_words.py, but the word list comes from the digraph cards
rather than letters.ts. Converts whatever the app's 1859-clip phonics_word bank
has into

    public/audio/words/<key>.mp3

and re-probes the whole folder into src/data/extraWordAudio.json (shared with the
A-Z Shorts — one manifest, one folder).

The 36 words below were chosen because the bank already has every one of them, so
this should report zero missing. A word with no clip is simply absent from the
manifest: its card still highlights on cue, just silently.
"""
import json
import os
import re
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANK = "/Users/jigarmoradiya/Documents/newProject/eng/iOS/Learn English/Resources/Audio/Phonics/phonics_word"
OUT = os.path.join(ROOT, "public/audio/words")
MANIFEST = os.path.join(ROOT, "src/data/extraWordAudio.json")

PAIR_WORDS = {
    "ai_ay": ["rain", "snail", "train", "paint", "tail", "chain",
              "day", "play", "say", "stay", "tray", "hay"],
    "oi_oy": ["coin", "soil", "point", "oil", "join", "boil",
              "boy", "toy", "joy", "enjoy", "annoy", "coy"],
    "oa_ow": ["boat", "coat", "goat", "road", "toast", "soap",
              "snow", "grow", "blow", "slow", "show", "yellow"],
}

os.makedirs(OUT, exist_ok=True)
key = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())


def dur(p):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
        capture_output=True, text=True)
    return round(float(r.stdout.strip()), 3)


converted, already, missing = 0, 0, []
for card, words in PAIR_WORDS.items():
    for w in words:
        k = key(w)
        dst = os.path.join(OUT, f"{k}.mp3")
        if os.path.exists(dst):
            already += 1
            continue
        srcf = os.path.join(BANK, f"{k}.opus")
        if not os.path.exists(srcf):
            missing.append(f"{card}:{k}")
            continue
        subprocess.run(["ffmpeg", "-y", "-i", srcf, dst], capture_output=True)
        converted += 1

manifest = {}
for f in sorted(os.listdir(OUT)):
    if f.endswith(".mp3"):
        manifest[f[:-4]] = dur(os.path.join(OUT, f))

json.dump(manifest, open(MANIFEST, "w"), indent=0, sort_keys=True)

print(f"converted {converted}, already present {already}")
print(f"manifest: {len(manifest)} clips -> src/data/extraWordAudio.json")
if missing:
    print(f"\nNO CLIP for {len(missing)}: " + " ".join(sorted(missing)))
else:
    print("every pair word has a clip")
