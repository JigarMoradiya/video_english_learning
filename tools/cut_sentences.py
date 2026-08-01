#!/usr/bin/env python3
"""Build the 9:16 narration by removing WHOLE SENTENCES from the original take. Nothing else.

    .venv-align/bin/python tools/cut_sentences.py [--drop 82,85,108,111,...] [--dry]

This replaces compact_narration.py, which tried to be clever: it re-cut EVERY phrase boundary
and squeezed every pause to 0.55s. 32 of those boundaries had under 0.12s of recorded gap --
they were inside continuous speech -- so it put a fade-out against a fade-in in the middle of a
word. That is what damaged "in./up./us.", "ba+g", "dog" and "Eight words./Vowel first".

The rule here is the one that cannot go wrong: audio between two kept sentences is copied
BYTE-FOR-BYTE from the original, including the pause the speaker actually left. The only edits
are whole-sentence removals, and each splice lands in the MIDDLE of the silence around the
removed run, so there is nothing to de-click and no pause to re-time.

Writes public/audio/cv_vc/cv_vc_short.mp3 + src/data/cv_vc_short.timing.json
"""
from __future__ import annotations
import json, subprocess, sys
from pathlib import Path
import numpy as np

SRC = "public/audio/cv_vc/cv_vc_new.mp3"
SRC_TIMING = "src/data/cv_vc_new.timing.json"
OUT_AUDIO = Path("public/audio/cv_vc/cv_vc_short.mp3")
OUT_TIMING = Path("src/data/cv_vc_short.timing.json")
SR = 44100

# whole sentences to remove, by index in cv_vc_new.timing.json
# It/Sit · Ox/Fox · Up/Cup   |   We/Wet · Go/Got · No/Not   |   the subscribe line   |   Cat/Dog/Pig
DEFAULT_DROP = ("82,83,84,85,86,87,88,89,90,91,92,93,"      # It/Sit Ox/Fox Up/Cup Us/Bus
                "102,103,104,105,106,107,108,109,110,111,112,113,"  # Me/Met We/Wet Go/Got No/Not
                "117,118,119,"                               # Do/Dog
                "140,141,142,143")                           # subscribe, Cat/Dog/Pig


def load() -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", SRC, "-ac", "1", "-ar", str(SR),
                          "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.int16)


def main() -> int:
    drop = {int(v) for v in (next((a.split("=", 1)[1] for a in sys.argv if a.startswith("--drop=")),
                                  DEFAULT_DROP)).split(",") if v.strip()}
    dry = "--dry" in sys.argv
    ph = json.load(open(SRC_TIMING))
    x = load()
    total = len(x) / SR

    # consecutive dropped indices form one removal; the splice sits at the midpoint of the
    # silence on each side, so what remains reads as a single natural pause
    runs: list[list[int]] = []
    for i in sorted(drop):
        if runs and i == runs[-1][-1] + 1:
            runs[-1].append(i)
        else:
            runs.append([i])
    cuts: list[tuple[float, float]] = []
    for run in runs:
        a, b = run[0], run[-1]
        prev_end = ph[a - 1]["end"] if a else 0.0
        next_start = ph[b + 1]["start"] if b + 1 < len(ph) else total
        cuts.append(((prev_end + ph[a]["start"]) / 2, (ph[b]["end"] + next_start) / 2))

    removed = sum(t1 - t0 for t0, t1 in cuts)
    print(f"removing {len(drop)} sentences in {len(cuts)} runs = {removed:.1f}s")
    print(f"  {total:.1f}s -> {total - removed:.1f}s  ({int((total-removed)//60)}m {(total-removed)%60:.0f}s)")
    for (t0, t1), run in zip(cuts, runs):
        print(f"    {t0:7.2f}-{t1:7.2f}  {' / '.join(ph[i]['text'][:16] for i in run)}")
    if dry:
        return 0

    # copy everything that is not inside a cut, in order
    keep: list[np.ndarray] = []
    shifts: list[tuple[float, float]] = []      # (source time, cumulative shift) breakpoints
    cursor = 0.0
    pos = 0.0
    for t0, t1 in cuts:
        keep.append(x[int(pos * SR):int(t0 * SR)])
        cursor += t0 - pos
        shifts.append((t1, cursor - t1))
        pos = t1
    keep.append(x[int(pos * SR):])
    y = np.concatenate(keep)

    def remap(t: float) -> float:
        s = 0.0
        for src_t, sh in shifts:
            if t >= src_t:
                s = sh
        return t + s

    out_ph = []
    for p in ph:
        if p["index"] in drop:
            continue
        ns, ne = remap(p["start"]), remap(p["end"])
        out_ph.append({"index": len(out_ph), "text": p["text"], "line_index": p.get("line_index", 0),
                       "start": round(ns, 3), "end": round(ne, 3), "duration": round(ne - ns, 3),
                       "words": [{"word": w["word"], "start": round(remap(w["start"]), 3),
                                  "end": round(remap(w.get("end", w["start"])), 3)}
                                 for w in p.get("words", [])]})
    OUT_AUDIO.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "s16le", "-ar", str(SR), "-ac", "1",
                    "-i", "-", "-c:a", "libmp3lame", "-q:a", "2", str(OUT_AUDIO)],
                   input=y.tobytes(), check=True)
    OUT_TIMING.write_text(json.dumps(out_ph, indent=1) + "\n")
    print(f"  {len(y)/SR:.1f}s audio · {len(out_ph)} sentences -> {OUT_AUDIO} · {OUT_TIMING}")
    return 0


def reseat_stamps(path: str = str(OUT_TIMING), audio: str = str(OUT_AUDIO)) -> int:
    """Move stamps the aligner put on a breath instead of the word. AUDIO IS NEVER TOUCHED.

    The forced alignment in the source take mis-seats a few lines: "Bus." and "Six." were each
    stamped on a ~-38dB breath while the real word sat ~0.7s later, unclaimed, at -6dB. Whisper
    on the stamp returns '' and on the burst returns the word. A relative test finds them --
    a normal answer word in this take peaks at -6..-12dB, so a stamp below QUIET with a much
    louder unclaimed burst in its dead air is simply pointing at the wrong place.
    """
    sr, w = 16000, 320
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", audio, "-ac", "1", "-ar", str(sr),
                          "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(float)
    db = 20 * np.log10(np.sqrt(np.convolve(x ** 2, np.ones(w) / w, "same") + 1) / 32768 + 1e-9)
    ph = json.load(open(path))
    QUIET, LOUDER_BY = -18.0, 10.0
    moved = 0
    for i, q in enumerate(ph):
        own = db[int(q["start"] * sr):int(q["end"] * sr)].max()
        if own >= QUIET:
            continue
        lo = ph[i - 1]["end"] if i else 0.0
        hi = ph[i + 1]["start"] if i + 1 < len(ph) else len(x) / sr
        d = db[int(lo * sr):int(hi * sr)]
        on = d > -52.0
        runs, s = [], None
        for k, v in enumerate(on):
            if v and s is None:
                s = k
            if not v and s is not None:
                if k - s > int(0.04 * sr):
                    runs.append([lo + s / sr, lo + k / sr])
                s = None
        if s is not None:
            runs.append([lo + s / sr, hi])
        merged: list[list[float]] = []
        for a0, b0 in runs:
            if merged and a0 - merged[-1][1] < 0.06:
                merged[-1][1] = b0
            else:
                merged.append([a0, b0])
        cands = [c for c in merged if c[1] - c[0] > 0.10
                 and db[int(c[0] * sr):int(c[1] * sr)].max() >= own + LOUDER_BY]
        if not cands:
            continue
        # EARLIEST, not loudest. Picking the loudest sent "Six." past its own word onto the
        # next line's "Do" (-4.6dB) instead of the "six" right after its sound-out (-6.1dB).
        # An answer word follows its sound-out promptly; it is never the later burst.
        a0, b0 = cands[0]
        shift = a0 - q["start"]
        print(f"    re-seated {q['text']!r}: {q['start']:.2f}-{q['end']:.2f} -> {a0:.2f}-{b0:.2f} "
              f"({own:.0f}dB -> {db[int(a0*sr):int(b0*sr)].max():.0f}dB)")
        q["start"], q["end"] = round(a0, 3), round(b0, 3)
        q["duration"] = round(b0 - a0, 3)
        for wd in q.get("words", []):
            wd["start"] = round(wd["start"] + shift, 3)
            wd["end"] = round(wd["end"] + shift, 3)
        moved += 1
    json.dump(ph, open(path, "w"), indent=1)
    print(f"  re-seated {moved} stamps (audio untouched)")
    return moved


def redistribute_runs(path: str = str(OUT_TIMING), audio: str = str(OUT_AUDIO)) -> int:
    """Split a run of continuous speech evenly across its phrases. AUDIO IS NEVER TOUCHED.

    reseat_stamps() searches the DEAD AIR around a stamp, so it cannot help when the word is
    swallowed by its NEIGHBOUR's stamp. "Aaa... nuh... an." is three bursts, but the aligner
    gave bursts 2+3 both to "nuh..." and left "an." on the silence after -- at -56dB there is
    nothing in the dead air to find. Where a run of N phrases sits over exactly N bursts the
    assignment is unambiguous; any other count is left alone rather than guessed at.
    """
    sr, w = 16000, 320
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", audio, "-ac", "1", "-ar", str(sr),
                          "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(float)
    db = 20 * np.log10(np.sqrt(np.convolve(x ** 2, np.ones(w) / w, "same") + 1) / 32768 + 1e-9)
    ph = json.load(open(path))
    JOIN = 0.12
    runs: list[list[dict]] = [[ph[0]]]
    for a, b in zip(ph, ph[1:]):
        (runs[-1] if b["start"] - a["end"] < JOIN else runs.append([]) or runs[-1]).append(b)
    fixed = 0
    for run in runs:
        if len(run) < 2 or not any(db[int(q["start"] * sr):int(q["end"] * sr)].max() < -28.0 for q in run):
            continue
        lo, hi = max(0.0, run[0]["start"] - 0.10), min(len(x) / sr, run[-1]["end"] + 0.10)
        d = db[int(lo * sr):int(hi * sr)]
        on = d > -52.0
        bs, s = [], None
        for i, v in enumerate(on):
            if v and s is None:
                s = i
            if not v and s is not None:
                if i - s > int(0.04 * sr):
                    bs.append([lo + s / sr, lo + i / sr])
                s = None
        if s is not None:
            bs.append([lo + s / sr, hi])
        merged: list[list[float]] = []
        for a0, b0 in bs:
            if merged and a0 - merged[-1][1] < 0.06:
                merged[-1][1] = b0
            else:
                merged.append([a0, b0])
        if len(merged) != len(run):
            continue
        for q, (a0, b0) in zip(run, merged):
            shift = a0 - q["start"]
            print(f"    split {q['text']!r}: {q['start']:.2f}-{q['end']:.2f} -> {a0:.2f}-{b0:.2f}")
            q["start"], q["end"] = round(a0, 3), round(b0, 3)
            q["duration"] = round(b0 - a0, 3)
            for wd in q.get("words", []):
                wd["start"] = round(wd["start"] + shift, 3)
                wd["end"] = round(wd["end"] + shift, 3)
        fixed += 1
    json.dump(ph, open(path, "w"), indent=1)
    print(f"  redistributed {fixed} runs")
    return fixed


if __name__ == "__main__":
    rc = main()
    reseat_stamps()
    redistribute_runs()
    raise SystemExit(rc)
