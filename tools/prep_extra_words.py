#!/usr/bin/env python3
"""Per-word clips for the "More <letter> words" tiles.

The app's phonics_word bank has 1816 single-word recordings, but it only covers
60 of the 103 extra words the Shorts use (A has just 1 of 4; U, V and Y have
none). So this converts everything the bank DOES have into

    public/audio/words/<key>.mp3

and writes src/data/extraWordAudio.json with the measured durations, which the
composition reads at module-eval to lay out the beat.

Anything missing is simply absent from the JSON: that tile still highlights on
cue, just silently. To fill a gap, drop <key>.mp3 into the words/ folder and
re-run this — it re-probes whatever is there, app-sourced or not.
"""
import json
import os
import re
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANK = "/Users/jigarmoradiya/Documents/newProject/eng/iOS/Learn English/Resources/Audio/Phonics/phonics_word"
OUT = os.path.join(ROOT, "public/audio/words")
MANIFEST = os.path.join(ROOT, "src/data/extraWordAudio.json")

os.makedirs(OUT, exist_ok=True)

key = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())

# The tile key strips punctuation (Xmas-tree -> xmastree) but a few bank clips keep a
# separator (xmas_tree.opus). Map tile key -> the bank's own stem for those.
ALIASES = {"xmastree": "xmas_tree"}


def dur(p):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
        capture_output=True, text=True)
    return round(float(r.stdout.strip()), 3)


src = open(os.path.join(ROOT, "src/data/letters.ts")).read()
rows = re.findall(r'letter: "(\w)".*?word: "(\w+)".*?extras: \[(.*?)\]', src)

wanted = []
for letter, word, ex in rows:
    for w in [x.strip().strip('"') for x in ex.split(",")]:
        wanted.append(key(w))

converted, already, missing = 0, 0, []
for k in wanted:
    dst = os.path.join(OUT, f"{k}.mp3")
    if os.path.exists(dst):
        already += 1
        continue
    srcf = os.path.join(BANK, f"{ALIASES.get(k, k)}.opus")
    if not os.path.exists(srcf):
        missing.append(k)
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
    print(f"\nNO CLIP for {len(missing)} words (tiles stay silent until you add them):")
    print("  " + " ".join(sorted(set(missing))))
