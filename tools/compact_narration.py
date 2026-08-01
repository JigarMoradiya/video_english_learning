#!/usr/bin/env python3
"""Compact a narration take: drop chosen phrases and tighten dead air, keeping timings true.

    .venv-align/bin/python tools/compact_narration.py

Built for the L3 9:16 cut, which must come in under 3 minutes while the 16:9 runs 4:03.

TWO EDITS, and the order matters:
  1. DROP whole phrases (build examples the narration never counts, and "Cat. Dog. Pig.").
     The blend triples can NEVER be dropped — the script says "Eight words", so removing one
     would make the video lie.
  2. TIGHTEN every remaining gap to GAP_CAP. This is where most of the time comes from
     (58s of the 62s needed) and it costs no teaching at all.

PROTECTED GAPS are left exactly as recorded: the pauses after "Aaa... nuh...?",
"Duh... oh...?" and "Kuh... uh... puh..." are the child's turn to answer. Tightening those
would break the lesson, which is why they are named rather than left to the cap.

Every boundary gets a 3ms ramp so no cut can click.

Writes:
    public/audio/cv_vc/cv_vc_short.mp3
    src/data/cv_vc_short.timing.json
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

import numpy as np

SRC = "public/audio/cv_vc/cv_vc_new.mp3"
SRC_TIMING = "src/data/cv_vc_new.timing.json"
OUT_AUDIO = Path("public/audio/cv_vc/cv_vc_short.mp3")
OUT_TIMING = Path("src/data/cv_vc_short.timing.json")

SR = 44100
GAP_CAP = 0.55          # seconds of dead air allowed between phrases
LEAD, TRAIL = 0.06, 0.10  # kept either side of a phrase so consonants survive
RAMP = int(0.003 * SR)
# A gap this small is NOT a pause -- it is the inside of continuous speech. Cutting there and
# re-joining puts a 3ms fade-out against a 3ms fade-in in the middle of a word, which is
# audible as a dip: "us.", "up.", "in.", "Eight words./Vowel first", "ba+g" and "dog" were all
# damaged this way. 32 of 131 boundaries were like this. Phrases separated by less than JOIN
# are therefore lifted as ONE continuous segment and never cut apart.
JOIN = 0.12

# build triples to drop (first phrase index of each) — 4 kept per side:
#   VC keeps bat · fan · cup · bus     CV keeps bag · map · six · dog
# Only 4 dropped, not 8: the first cut came in at 2:34 and the target is under 3:00, so
# jam · pin · met · wet are restored to use the room.
DROP_TRIPLES = [82, 85,                # sit fox
                108, 111]              # got not
DROP_SINGLES = [141, 142, 143]         # "Cat." "Dog." "Pig."
# gaps AFTER these phrases are the child's turn — never tightened
PROTECT_AFTER = {128, 131, 137}


def load() -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", SRC, "-ac", "1", "-ar", str(SR),
                          "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32)



def _bursts(db, sr, lo, hi, thr=-52.0, minlen=0.03, closure=0.06):
    d = db[int(lo * sr):int(hi * sr)]
    on = d > thr
    out, s = [], None
    for i, v in enumerate(on):
        if v and s is None:
            s = i
        if not v and s is not None:
            if i - s > int(minlen * sr):
                out.append([lo + s / sr, lo + i / sr])
            s = None
    if s is not None:
        out.append([lo + s / sr, hi])
    merged = []
    for a, b in out:
        if merged and a - merged[-1][1] < closure:
            merged[-1][1] = b
        else:
            merged.append([a, b])
    return merged


def repair_source(ph: list[dict], x: np.ndarray) -> int:
    """Re-seat SOURCE phrases the aligner stamped on silence, before anything is cut.

    This has to happen first. "Bus." was aligned onto a -38.8dB blip while every other answer
    word in the take is -6..-11dB, and the REAL "Bus." sat unclaimed 0.6s later at -6.3dB. The
    cut then kept the blip and threw the word away as dead air -- the audio was gone before any
    stamp could be snapped onto it. Only phrases that currently sit on silence are moved, and
    only onto a loud burst no other phrase claims.
    """
    sr, w = SR, int(0.02 * SR)
    db = 20 * np.log10(np.sqrt(np.convolve(x ** 2, np.ones(w) / w, "same") + 1) / 32768 + 1e-9)
    # A RELATIVE test, not an absolute floor. "Bus." was stamped on a -23.2dB breath, which an
    # absolute -28dB gate waved through; a normal spoken answer word in this take peaks at -5 to
    # -12dB. So: a stamp quieter than QUIET, with an unclaimed burst at least LOUDER_BY dB above
    # it sitting in the dead air, is a mis-seated phrase. Whisper confirms it -- the stamp
    # transcribes to '' and the burst transcribes to 'bus'.
    QUIET, LOUDER_BY = -18.0, 10.0
    moved = 0
    for i, p in enumerate(ph):
        own = db[int(p["start"] * sr):int(p["end"] * sr)].max()
        if own >= QUIET:
            continue
        prev_end = ph[i - 1]["end"] if i else 0.0
        next_start = ph[i + 1]["start"] if i + 1 < len(ph) else len(x) / sr
        cands = [b for b in _bursts(db, sr, prev_end, next_start)
                 if b[1] - b[0] > 0.10
                 and b[0] >= prev_end - 0.01 and b[1] <= next_start + 0.01
                 and db[int(b[0] * sr):int(b[1] * sr)].max() >= own + LOUDER_BY]
        if not cands:
            continue
        a, b = max(cands, key=lambda c: db[int(c[0] * sr):int(c[1] * sr)].max())
        shift = a - p["start"]
        print(f"    repaired {p['text']!r}: {p['start']:.2f}-{p['end']:.2f} -> {a:.2f}-{b:.2f} "
              f"({db[int(p['start']*sr):int(p['end']*sr)].max():.0f}dB -> {db[int(a*sr):int(b*sr)].max():.0f}dB)")
        p["start"], p["end"] = round(a, 3), round(b, 3)
        p["duration"] = round(b - a, 3)
        for wd in p.get("words", []):
            wd["start"] = round(wd["start"] + shift, 3)
            wd["end"] = round(wd.get("end", wd["start"]) + shift, 3)
        moved += 1
    print(f"  repaired {moved} source phrases stamped on silence")
    return moved


def main() -> int:
    ph = json.load(open(SRC_TIMING))
    repair_source(ph, load())          # BEFORE the drop/cut, or the audio is gone
    drop = set(DROP_SINGLES)
    for t in DROP_TRIPLES:
        drop.update({t, t + 1, t + 2})
    kept = [p for p in ph if p["index"] not in drop]
    print(f"phrases {len(ph)} -> {len(kept)} (dropped {len(drop)})")

    # group the kept phrases into RUNS of continuous speech; only the gaps BETWEEN runs are
    # real pauses, and only those get cut and tightened
    runs: list[list[dict]] = [[kept[0]]]
    for a, b in zip(kept, kept[1:]):
        (runs[-1] if b["start"] - a["end"] < JOIN else runs.append([]) or runs[-1]).append(b)
    print(f"  {len(runs)} continuous runs -> {len(kept) - len(runs)} internal cuts avoided")

    x = load()
    pieces: list[np.ndarray] = []
    out_ph: list[dict] = []
    cursor = 0.0

    for ri, run in enumerate(runs):
        prev_end = runs[ri - 1][-1]["end"] if ri else None
        next_start = runs[ri + 1][0]["start"] if ri + 1 < len(runs) else None
        prev_gap = run[0]["start"] - prev_end if prev_end is not None else 1.0
        next_gap = next_start - run[-1]["end"] if next_start is not None else 1.0
        # lead/trail must never reach into a neighbouring RUN: where the pause is shorter than
        # LEAD+TRAIL the two segments would overlap and that audio be written TWICE, which was
        # the original "plays two times" bug. Each side gets at most half the real pause.
        lead = max(0.0, min(LEAD, prev_gap / 2 - 0.005))
        trail = max(0.0, min(TRAIL, next_gap / 2 - 0.005))
        a = max(0.0, run[0]["start"] - lead)
        b = min(len(x) / SR, run[-1]["end"] + trail)
        seg = x[int(a * SR):int(b * SR)].copy()
        if len(seg) > 2 * RAMP:                       # de-click the run's OUTER edges only
            seg[:RAMP] *= np.linspace(0, 1, RAMP)
            seg[-RAMP:] *= np.linspace(1, 0, RAMP)

        base = cursor + (run[0]["start"] - a)         # where this run's first phrase lands
        for q in run:
            new_start = base + (q["start"] - run[0]["start"])
            new_end = base + (q["end"] - run[0]["start"])
            words = [
                {"word": w["word"],
                 "start": round(w["start"] - q["start"] + new_start, 3),
                 "end": round(w.get("end", w["start"]) - q["start"] + new_start, 3)}
                for w in q.get("words", [])
            ]
            out_ph.append({"index": len(out_ph), "text": q["text"], "line_index": q.get("line_index", 0),
                           "start": round(new_start, 3), "end": round(new_end, 3),
                           "duration": round(new_end - new_start, 3), "words": words})
        pieces.append(seg)
        cursor += len(seg) / SR

        if next_start is not None:
            protected = run[-1]["index"] in PROTECT_AFTER
            gap = next_gap if protected else min(next_gap, GAP_CAP)
            if not protected:
                # the lead/trail already kept are themselves part of the pause; a protected
                # pause keeps its FULL recorded length or the child's turn shrinks
                nxt_lead = max(0.0, min(LEAD, next_gap / 2 - 0.005))
                gap = max(0.0, gap - (b - run[-1]["end"]) - nxt_lead)
            if gap > 0:
                pieces.append(np.zeros(int(gap * SR), dtype=np.float32))
                cursor += gap

    y = np.clip(np.concatenate(pieces), -32768, 32767).astype(np.int16)
    OUT_AUDIO.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "s16le", "-ar", str(SR), "-ac", "1",
                    "-i", "-", "-c:a", "libmp3lame", "-q:a", "2", str(OUT_AUDIO)],
                   input=y.tobytes(), check=True)
    OUT_TIMING.write_text(json.dumps(out_ph, indent=1) + "\n")

    dur = len(y) / SR
    print(f"  {dur:.1f}s  ({int(dur // 60)}m {dur % 60:.0f}s)  was 239.5s")
    print(f"  -> {OUT_AUDIO}  ·  {OUT_TIMING}")
    # the protected pauses must have survived
    for i in sorted(PROTECT_AFTER):
        src_gap = ph[i + 1]["start"] - ph[i]["end"]
        j = next((n for n, q in enumerate(out_ph) if q["text"] == ph[i]["text"]), None)
        if j is not None and j + 1 < len(out_ph):
            print(f"  pause after {ph[i]['text']!r}: {src_gap:.2f}s -> {out_ph[j+1]['start'] - out_ph[j]['end']:.2f}s")
    return 0




def snap_onsets(path: str = str(OUT_TIMING), audio: str = str(OUT_AUDIO)) -> int:
    """Pull every phrase stamp onto the speech it names.

    Forced alignment routinely places an onset a beat before the sound actually starts, and
    once the dead air between phrases is tightened that slack is gone — so a card lights
    while the audio is still silent. This re-seats every stamp on the first burst inside
    its own window, which is bounded by the previous phrase so it can never steal a
    neighbour's word.
    """
    import numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", audio, "-ac", "1", "-ar", "16000",
                          "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(float)
    sr, w = 16000, int(0.02 * 16000)
    db = 20 * np.log10(np.sqrt(np.convolve(x ** 2, np.ones(w) / w, "same") + 1) / 32768 + 1e-9)
    ph = json.load(open(path))
    moved = 0
    for i, p in enumerate(ph):
        lo = ph[i - 1]["end"] + 0.02 if i else 0.0
        hi = p["end"]
        a, b = int(lo * sr), int(hi * sr)
        if b - a < w:
            continue
        d = db[a:b]
        thr = max(d.max() - 22, -45.0)
        idx = np.argmax(d > thr)
        if not (d > thr).any():
            continue
        onset = lo + idx / sr
        # if the stamp is ALREADY inside a burst, the word started earlier than the stamp
        # says -- walk back to the burst's real start. `bus` was stamped 0.06s late this
        # way, so its card lit after the word had begun.
        if db[int(p["start"] * sr)] > -52.0:
            j = int(p["start"] * sr)
            while j > int(lo * sr) and db[j - 1] > -52.0:
                j -= 1
            onset = min(onset, j / sr)
        if abs(onset - p["start"]) > 0.05:
            shift = onset - p["start"]
            p["start"] = round(onset, 3)
            for wd in p.get("words", []):
                wd["start"] = round(wd["start"] + shift, 3)
            p["duration"] = round(p["end"] - p["start"], 3)
            moved += 1
    json.dump(ph, open(path, "w"), indent=1)
    print(f"  snapped {moved} phrase onsets onto real speech")
    return moved


def snap_ends(path: str = str(OUT_TIMING), audio: str = str(OUT_AUDIO)) -> int:
    """Extend every phrase stamp to cover the whole word it names.

    Forced alignment habitually ends a word EARLY. `bus` was stamped 0.11s against 0.26s
    of real speech and `dog` 0.26s against 0.32s, so the card went dark while the word was
    still being said -- which reads as the audio being cut off. This walks each stamp's end
    out to the end of the burst it is sitting in, bounded by the next phrase so it can
    never swallow a neighbour.

    Onsets were snapped from the first commit; ends were not, and that one-sided fix is
    what shipped the bus/dog bug. Both directions now.
    """
    import numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", audio, "-ac", "1", "-ar", "16000",
                          "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(float)
    sr, w = 16000, int(0.02 * 16000)
    db = 20 * np.log10(np.sqrt(np.convolve(x ** 2, np.ones(w) / w, "same") + 1) / 32768 + 1e-9)
    ph = json.load(open(path))
    moved = 0
    for i, p in enumerate(ph):
        nxt = ph[i + 1]["start"] if i + 1 < len(ph) else len(x) / sr
        # ONLY extend a phrase that genuinely ends in silence. Inside a continuous run the
        # next word starts immediately, so "walk forward through speech" walks into the NEXT
        # phrase and steals it: "nuh..." grew to 1.12s and swallowed "an.", "buh-uh-s..." grew
        # to 1.28s and swallowed "Bus.", leaving those stamps on trailing silence at -56dB.
        # Where there is no pause, the aligned boundary is the best split available.
        if nxt - p["end"] < JOIN:
            continue
        lo = p["end"]
        hi = min(nxt - 0.02, p["end"] + 0.30)
        if hi <= lo:
            continue
        d = db[int(lo * sr):int(hi * sr)]
        on = d > -52.0
        if not on.size:
            continue
        # A word can DIP below the floor inside itself -- the stop closure in "wet" before
        # the t reads as silence, and testing only the instant of the cut skipped it. So
        # walk the speech runs and keep absorbing any that resume within CLOSURE seconds.
        CLOSURE = 0.10
        runs, s = [], None
        for j, v in enumerate(on):
            if v and s is None:
                s = j
            if not v and s is not None:
                runs.append((s, j)); s = None
        if s is not None:
            runs.append((s, len(on)))
        if not runs or runs[0][0] / sr > CLOSURE:
            continue                       # ended in silence: the stamp is fine
        end_i = runs[0][1]
        for a, b in runs[1:]:
            if (a - end_i) / sr > CLOSURE:
                break
            end_i = b
        if end_i >= len(on) - 1:
            continue      # speech runs right to the bound: this is mid-run, the word's real
                          # end is unknowable here, so leave the aligned stamp alone rather
                          # than stretching the caption over the NEXT phrase
        end = lo + end_i / sr
        if end - p["end"] > 0.02:
            p["end"] = round(end, 3)
            p["duration"] = round(p["end"] - p["start"], 3)
            moved += 1
    json.dump(ph, open(path, "w"), indent=1)
    print(f"  snapped {moved} phrase ends onto the end of their word")
    return moved


def redistribute_runs(path: str = str(OUT_TIMING), audio: str = str(OUT_AUDIO)) -> int:
    """Re-seat phrases whose stamp landed on silence, using the bursts of their own run.

    The forced alignment in the SOURCE take drifts inside continuous speech. "Aaa... nuh...
    an." is three bursts, but the aligner gave burst 2+3 both to "nuh..." and left "an." on the
    1.5s of silence that follows -- peak -56dB, i.e. the card lit over nothing. Snapping onsets
    cannot repair it, because the search is bounded by the previous phrase's (also wrong) end.

    Where a run of N phrases sits over exactly N bursts the assignment is unambiguous, so each
    phrase takes one burst. Any other count is left alone rather than guessed at.
    """
    import numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", audio, "-ac", "1", "-ar", "16000",
                          "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(float)
    sr, w = 16000, int(0.02 * 16000)
    db = 20 * np.log10(np.sqrt(np.convolve(x ** 2, np.ones(w) / w, "same") + 1) / 32768 + 1e-9)
    ph = json.load(open(path))

    runs: list[list[dict]] = [[ph[0]]]
    for a, b in zip(ph, ph[1:]):
        (runs[-1] if b["start"] - a["end"] < JOIN else runs.append([]) or runs[-1]).append(b)

    fixed = 0
    for run in runs:
        lo = max(0.0, run[0]["start"] - 0.10)
        hi = min(len(x) / sr, run[-1]["end"] + 0.10)
        d = db[int(lo * sr):int(hi * sr)]
        on = d > -52.0
        bursts, s = [], None
        for i, v in enumerate(on):
            if v and s is None:
                s = i
            if not v and s is not None:
                if i - s > int(0.04 * sr):
                    bursts.append((lo + s / sr, lo + i / sr))
                s = None
        if s is not None:
            bursts.append((lo + s / sr, hi))
        # merge bursts separated by less than a stop closure
        merged: list[list[float]] = []
        for a0, b0 in bursts:
            if merged and a0 - merged[-1][1] < 0.06:
                merged[-1][1] = b0
            else:
                merged.append([a0, b0])
        if len(merged) != len(run) or len(run) < 2:
            continue
        silent = [q for q in run if db[int(q["start"] * sr):int(q["end"] * sr)].max() < -28.0]
        if not silent:
            continue
        for q, (a0, b0) in zip(run, merged):
            shift = a0 - q["start"]
            q["start"], q["end"] = round(a0, 3), round(b0, 3)
            q["duration"] = round(b0 - a0, 3)
            for wd in q.get("words", []):
                wd["start"] = round(wd["start"] + shift, 3)
                wd["end"] = round(wd["end"] + shift, 3)
        fixed += len(silent)
    json.dump(ph, open(path, "w"), indent=1)
    print(f"  re-seated {fixed} phrases that had been stamped on silence")
    return fixed


if __name__ == "__main__":
    rc = main()
    snap_onsets()
    snap_ends()
    redistribute_runs()
    raise SystemExit(rc)
