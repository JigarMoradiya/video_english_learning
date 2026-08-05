#!/usr/bin/env python3
"""Lay out the audio timeline for MILESTONE · Read Your First Sentences (16:9).

    .venv-align/bin/python tools/build_first_sentences_timeline.py

The narration arrived as ONE continuous take, so unlike L4 (which had one file per line)
the teacher's lines have to be sliced out of it first. The slice rule is the one that
cannot damage a word: every cut lands in the MIDDLE of the silence around the line, never
inside speech — the same rule cut_sentences.py follows, and the reason compact_narration.py
was retired.

Everything else is L4's method: NOTHING IS RESAMPLED OR SQUEEZED. Each clip — a teacher
line, an app word, an app sentence — is placed WHOLE at a computed start, so every gap in
the finished video is a decision recorded in the gap table below rather than an accident of
whatever pause happened to be in the take.

Why the take alone will not do: the recording leaves 1.4s after "Learn these eight..." and
the eight helper words need about five seconds to speak. The gaps have to be re-made.

Writes  src/data/first_sentences.timeline.json   every clip with an absolute start
        public/audio/first_sentences_16x9/_lines/*.wav   the sliced teacher lines
"""
from __future__ import annotations

import json
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 44100
TAKE = Path("public/audio/first_sentences_16x9/first_sentences_16x9.mp3")
PHRASES = Path("public/audio/first_sentences_16x9/first_sentences_16x9.phrases.json")
LINES_DIR = Path("public/audio/first_sentences_16x9/_lines")
WORDS = Path("public/audio/words")
OUT = Path("src/data/first_sentences.timeline.json")

# ── THE GAP TABLE ────────────────────────────────────────────────────────────
# Every number here is a pacing decision. L3 v1 was rejected for pacing because its gaps
# were ~0.11s; these are deliberately generous — this is a milestone, not a drill.
G_WORD = 0.34      # between two spoken words in the helper-word row
G_BUILD = 0.42     # between two words landing in the sentence being built
G_LINE = 0.45      # between two teacher lines inside one thought
G_BEAT = 0.60      # teacher line → an app clip, and back
G_SECTION = 0.85   # across a section change
G_PICTURE = 0.80   # after a line reads, so its picture has time to land and be read
PAUSE_CHILD = 3.0  # the child reads / chooses, alone. Real silence.


def dur(p: Path) -> float:
    return float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nk=1:nw=1", str(p)],
        capture_output=True, text=True).stdout.strip())


def pcm(p: Path) -> np.ndarray:
    """Decode anything to mono float32 at SR."""
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(p), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
        capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


# ── 1 · slice the teacher's lines out of the single take ─────────────────────
#
# Cut in the MIDDLE of the silence on each side, but never more than 0.25s of air, so the
# line keeps its natural attack and release.
#
# AND NEVER CUT WHERE THERE IS NO SILENCE. "Nice work. Let's build one." was spoken as one
# breath — 0.16s between them — and slicing at that midpoint put a fade-out against a
# fade-in inside live speech, which is audible. Lines closer together than MIN_SPLIT are
# kept as ONE clip and played together; the scripted gap between them is dropped.
MIN_SPLIT = 0.25


def group_phrases(phrases: list[dict]) -> list[list[int]]:
    groups: list[list[int]] = [[0]]
    for i in range(1, len(phrases)):
        if phrases[i]["start"] - phrases[i - 1]["end"] < MIN_SPLIT:
            groups[-1].append(i)
        else:
            groups.append([i])
    return groups


def slice_lines() -> list[dict]:
    phrases = json.load(open(PHRASES))
    take = pcm(TAKE)
    LINES_DIR.mkdir(parents=True, exist_ok=True)
    out = []
    for grp in group_phrases(phrases):
        i, j = grp[0], grp[-1]
        ph = {"text": " ".join(phrases[k]["text"] for k in grp),
              "start": phrases[i]["start"], "end": phrases[j]["end"]}
        prev_end = phrases[i - 1]["end"] if i else 0.0
        next_start = phrases[j + 1]["start"] if j + 1 < len(phrases) else ph["end"] + 0.5
        lead = min(0.25, max(0.05, (ph["start"] - prev_end) / 2))
        tail = min(0.25, max(0.05, (next_start - ph["end"]) / 2))
        a = max(0, int((ph["start"] - lead) * SR))
        b = min(len(take), int((ph["end"] + tail) * SR))
        seg = take[a:b].copy()
        # 8ms ramps so a splice can never click
        r = int(0.008 * SR)
        seg[:r] *= np.linspace(0, 1, r)
        seg[-r:] *= np.linspace(1, 0, r)
        path = LINES_DIR / f"{i:02d}.wav"
        with wave.open(str(path), "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes((np.clip(seg, -1, 1) * 32767).astype("<i2").tobytes())
        # `lead` is the air kept before the first syllable. Captions are stamped from the
        # clip start, so without it every caption would fire early by that much.
        out.append({"index": i, "lines": grp, "text": ph["text"], "path": path,
                    "dur": len(seg) / SR, "lead": lead})
    return out


GROUPS = slice_lines()
# phrase index → the group clip that carries it
LINE_OF = {k: g for g in GROUPS for k in g["lines"]}
LEADER = {g["index"] for g in GROUPS}

# ── 2 · the video, in order ──────────────────────────────────────────────────
# ("run", n)     teacher line n, sliced above
# ("word", w)    one app word file
# ("line", k)    one app whole-sentence file
# ("gap", s)     deliberate silence
# ("mark", id)   a zero-length section marker the reel drives its visuals from
HELPERS = ["the", "a", "is", "on", "in", "has", "can", "and"]
BUILD_WORDS = ["the", "map", "is", "in", "the", "bag"]

SCRIPT: list[tuple] = [
    ("mark", "little"),
    ("run", 0),                       # Some words are tiny.
    ("gap", G_LINE),
    ("run", 1),                       # They turn up in almost every sentence.
    ("gap", G_BEAT),
    ("run", 2),                       # Some you can sound out.
    ("gap", 0.35),
    ("word", "on"),                   # ...and one that genuinely splits
    ("gap", G_BEAT),
    ("run", 3),                       # Some you cannot.
    ("gap", 0.30),
    ("run", 4),                       # You just learn them.
    ("gap", 0.40),
    ("word", "the"),                  # ...and one that refuses to
    ("gap", G_BEAT),
    ("run", 5),                       # Learn these eight and you can read a lot.
    ("gap", G_BEAT),
    ("mark", "eight"),
]
for i, w in enumerate(HELPERS):       # the eight, each speaking in turn
    SCRIPT.append(("word", w))
    if i < len(HELPERS) - 1:
        SCRIPT.append(("gap", G_WORD))
SCRIPT += [
    ("gap", G_SECTION),
    ("run", 6),                       # Nice work.
    ("gap", 0.25),
    ("run", 7),                       # Let's build one.

    ("mark", "build"),
    ("gap", G_SECTION),
    ("run", 8),                       # Watch the words arrive.
    ("gap", G_BEAT),
    ("mark", "arrive"),
]
for i, w in enumerate(BUILD_WORDS):   # the words land one at a time
    SCRIPT.append(("word", w))
    if i < len(BUILD_WORDS) - 1:
        SCRIPT.append(("gap", G_BUILD))
SCRIPT += [
    ("gap", G_BEAT),
    ("run", 9),                       # Now read them together.
    ("gap", G_LINE),
    ("mark", "readline"),
    ("line", "the_map_is_in_the_bag"),
    ("gap", G_PICTURE),               # the bag lands here
    ("mark", "picture"),
    ("run", 10),                      # The words made a picture in your head.
    ("gap", 0.35),
    ("run", 11),                      # That is reading.

    ("mark", "turn"),
    ("gap", G_SECTION),
    ("run", 12),                      # This one is yours.
    ("gap", PAUSE_CHILD),             # ── the child reads it alone ──
    ("mark", "turnread"),
    ("line", "the_sun_is_hot"),
    ("gap", G_PICTURE),
    ("run", 13),                      # Did you read it?
    ("gap", 0.30),
    ("run", 14),                      # I knew you could.

    ("mark", "meaning"),
    ("gap", G_SECTION),
    ("run", 15),                      # Now show me what it means.
    ("gap", G_LINE),
    ("mark", "meanline"),
    ("line", "the_pin_is_in_the_tin"),
    ("gap", G_BEAT),
    ("run", 16),                      # Which picture is this?
    ("gap", PAUSE_CHILD),             # ── the child chooses ──
    ("mark", "meanpick"),
    ("run", 17),                      # This one.
    ("gap", G_PICTURE),
    ("run", 18),                      # You read it AND you understood it.

    ("mark", "missing"),
    ("gap", G_SECTION),
    ("run", 19),                      # One more.
    ("gap", 0.30),
    ("run", 20),                      # A stone is missing.
    ("gap", G_BEAT),
    ("run", 21),                      # Which word fits?
    ("gap", PAUSE_CHILD),             # ── the child chooses ──
    ("mark", "missingpick"),
    ("word", "sat"),
    ("gap", 0.35),
    ("line", "the_cat_sat_on_a_mat"),
    ("gap", G_PICTURE),
    ("run", 22),                      # You found it.

    ("mark", "close"),
    ("gap", G_SECTION),
    ("run", 23),                      # You just read your first sentences.
    ("gap", 0.90),
    ("mark", "download"),
    ("run", 24),                      # Thirty-five sentences ... English Learning app.
    ("gap", 0.40),
    ("run", 25),                      # Tap any word and it says itself.
    ("gap", 0.35),
    ("run", 26),                      # Free on both stores.
]

# ── 3 · drop runs that were merged into an earlier clip ──────────────────────
pruned: list[tuple] = []
for item in SCRIPT:
    if item[0] == "run" and item[1] not in LEADER:
        if pruned and pruned[-1][0] == "gap":
            pruned.pop()
        continue
    pruned.append(item)
SCRIPT = pruned

# ── 4 · place every clip ─────────────────────────────────────────────────────
clips: list[dict] = []
marks: dict[str, float] = {}
t = 0.0
for kind, val in SCRIPT:
    if kind == "gap":
        t += val
    elif kind == "mark":
        marks[val] = round(t, 3)
    else:
        if kind == "run":
            ln = LINE_OF[val]
            clips.append({"kind": kind, "src": f"audio/first_sentences_16x9/_lines/{ln['index']:02d}.wav",
                          "start": round(t, 3), "dur": round(ln["dur"], 3), "label": ln["text"],
                          "line": ln["index"], "lines": ln["lines"], "lead": round(ln["lead"], 3)})
            t += ln["dur"]
            continue
        else:
            p = WORDS / f"{val}.mp3"
            if not p.exists():
                raise SystemExit(f"missing app audio: {p}")
            src, d, label = f"audio/words/{val}.mp3", dur(p), val
        clips.append({"kind": kind, "src": src, "start": round(t, 3),
                      "dur": round(d, 3), "label": label})
        t += d

total = round(t, 3)
OUT.parent.mkdir(parents=True, exist_ok=True)
json.dump({"clips": clips, "marks": marks, "total": total}, open(OUT, "w"), indent=1)

print(f"{len(clips)} clips · {total:.2f}s narration+audio")
for k, v in marks.items():
    print(f"   mark {k:<12} {v:7.2f}s")
