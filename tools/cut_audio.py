#!/usr/bin/env python3
"""Cut a long narration down to a subset of its phrases — speech-driven, not timestamp-driven.

    python tools/cut_audio.py <cut_spec.json>

Why this exists: the obvious approach (slice each kept phrase at its aligner
[start, end] ± a pad) shipped three broken audios in a row.

  * Fixed windows OVERLAP wherever the gap between two phrases is smaller than
    2x the pad, so the tail of one phrase is emitted twice -> "b-a-dge" said
    "buh buh".
  * The aligner's phrase `end` is not the end of the speech. On ge/dge the
    narrator paused inside "Listen to... large" and `end` (104.71) fell BEFORE
    the word (105.05-105.73), so "large" was silently deleted.

So: find the real speech regions by RMS, give every region to exactly one
phrase, and keep whole regions. Speech is then never orphaned (nothing can be
dropped) and never shared (nothing can be duplicated).

The spec file:

    {
      "src":   "public/audio/c_soft_hard_16x9/c_soft_hard_16x9.mp3",
      "phrases": "src/data/c_soft_hard_16x9.timing.json",
      "out":   "public/audio/c_soft_hard_9x16/c_soft_hard_9x16.mp3",
      "keep":  [[0, 45], [74, 111]],
      "pad":   0.30,    // silence kept either side of a speech region
      "cap":   1.0,     // longest pause kept between adjacent kept phrases
      "splice": 0.9     // pause inserted where phrases were removed
    }
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

SR = 44100          # analysis + output rate
HOP = 0.010         # 10 ms envelope hop
WIN = 0.025
MIN_REGION = 0.080  # ignore blips shorter than this (lip smacks, breaths)
BRIDGE = 0.120      # merge regions closer than this (stop closures, not pauses)
GUARD = 0.020       # a boundary must be silent for at least this long


def sh(*args):
    subprocess.run(args, check=True, capture_output=True)


def decode(path):
    """-> (float32 mono for analysis, int16 (n, ch) for output)"""
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-f", "s16le",
         "-acodec", "pcm_s16le", "-ar", str(SR), "-ac", "2", "-"],
        check=True, capture_output=True).stdout
    stereo = np.frombuffer(raw, dtype="<i2").reshape(-1, 2)
    mono = stereo.astype(np.float32).mean(axis=1) / 32768.0
    return mono, stereo


def envelope(mono):
    hop, win = int(SR * HOP), int(SR * WIN)
    n = max(0, (len(mono) - win) // hop + 1)
    idx = np.arange(n) * hop
    frames = np.lib.stride_tricks.as_strided(
        mono, shape=(n, win), strides=(mono.strides[0] * hop, mono.strides[0]))
    rms = np.sqrt((frames.astype(np.float64) ** 2).mean(axis=1) + 1e-12)
    return idx / SR, 20 * np.log10(rms)


def speech_regions(t, db):
    """Gate relative to the SPEECH level, not the noise floor.

    Gating off the floor fails on these recordings: they carry two kinds of
    pause -- true digital silence around -85 dB and room/breath around -60 dB --
    plus breath transients that spike to -24 dB. A floor-relative gate lands
    near -68 dB, so the room tone reads as speech and single regions bridge
    across whole pauses; kept regions then drag deleted phrases along with
    them. Speech here sits near -19 dB, so anchoring to p80 puts the gate at
    about -40 dB: far above the room tone, far below any real syllable.
    """
    ref = np.percentile(db, 80)
    hi = ref - 28
    lo = ref - 34
    floor = np.percentile(db, 10)
    on, regions, start = False, [], 0.0
    for ti, d in zip(t, db):
        if not on and d > hi:
            on, start = True, ti
        elif on and d < lo:
            on = False
            regions.append([start, ti])
    if on:
        regions.append([start, t[-1]])
    regions = [r for r in regions if r[1] - r[0] >= MIN_REGION]
    merged = []
    for r in regions:
        if merged and r[0] - merged[-1][1] < BRIDGE:
            merged[-1][1] = r[1]
        else:
            merged.append(r)
    return merged, floor, hi


def attribute(regions, phrases):
    """Every region -> exactly one phrase. Overlap wins; else nearest."""
    owner = []
    for a, b in regions:
        best, best_ov, best_dist = 0, 0.0, float("inf")
        for p in phrases:
            ov = min(b, p["end"]) - max(a, p["start"])
            if ov > best_ov:
                best, best_ov = p["index"], ov
            if best_ov == 0.0:
                dist = max(p["start"] - b, a - p["end"], 0.0)
                if dist < best_dist:
                    best, best_dist = p["index"], dist
        owner.append(best)
    return owner


def main(spec_path):
    spec = json.loads(Path(spec_path).read_text())
    root = Path(__file__).resolve().parent.parent
    src = root / spec["src"]
    out = root / spec["out"]
    phrases = json.loads((root / spec["phrases"]).read_text())
    pad = spec.get("pad", 0.30)
    cap = spec.get("cap", 1.0)
    splice = spec.get("splice", 0.9)

    keep_idx = []
    for a, b in spec["keep"]:
        keep_idx.extend(range(a, b + 1))
    keep_set = set(keep_idx)

    print(f"source     {src.name}")
    mono, stereo = decode(src)
    t, db = envelope(mono)
    regions, floor, thresh = speech_regions(t, db)
    owner = attribute(regions, phrases)
    print(f"speech     {len(regions)} regions, floor {floor:.1f} dB, gate {thresh:.1f} dB")

    orphan = [p["index"] for p in phrases if p["index"] not in set(owner)]
    if orphan:
        print(f"  note: {len(orphan)} phrase(s) own no speech region: {orphan[:12]}")

    kept = [(r, o) for r, o in zip(regions, owner) if o in keep_set]
    dropped_spans = [r for r, o in zip(regions, owner) if o not in keep_set]
    print(f"keep       {len(keep_idx)} phrases -> {len(kept)} regions "
          f"({len(regions) - len(kept)} dropped)")

    # Pad, but never let a pad reach into speech we are deleting: that is how a
    # dropped word gets smuggled back in and said twice.
    segs = []
    for (a, b), o in kept:
        lo, hi = a - pad, b + pad
        for da, dbb in dropped_spans:
            if dbb <= a:
                lo = max(lo, dbb + GUARD)
            if da >= b:
                hi = min(hi, da - GUARD)
        segs.append({"src": [max(0.0, lo), hi], "phrase": o})

    # Merge regions whose padded spans touch (same or adjacent phrases).
    merged = []
    for s in segs:
        if merged and s["src"][0] <= merged[-1]["src"][1]:
            merged[-1]["src"][1] = max(merged[-1]["src"][1], s["src"][1])
            merged[-1]["phrases"].append(s["phrase"])
        else:
            merged.append({"src": list(s["src"]), "phrases": [s["phrase"]]})

    # Lay out on the output timeline, choosing each inter-segment pause.
    pos, plan = 0.0, []
    for i, m in enumerate(merged):
        if i:
            prev_last = max(merged[i - 1]["phrases"])
            cur_first = min(m["phrases"])
            if cur_first == prev_last:
                gap = m["src"][0] - merged[i - 1]["src"][1]        # inside a phrase: keep it
            elif cur_first == prev_last + 1:
                gap = min(m["src"][0] - merged[i - 1]["src"][1], cap)
            else:
                gap = splice
            pos += max(0.0, gap)
        m["out"] = [pos, pos + (m["src"][1] - m["src"][0])]
        pos = m["out"][1]
        plan.append(m)
    total = pos
    if spec.get("dry_run"):
        print(f"dry run    {len(plan)} segments  ->  {int(total // 60)}:{total % 60:04.1f} "
              f"(pad {pad}, cap {cap})")
        return 0

    # ---- render ----
    pieces = []
    for i, m in enumerate(plan):
        if i:
            sil = int(round((m["out"][0] - plan[i - 1]["out"][1]) * SR))
            if sil > 0:
                pieces.append(np.zeros((sil, 2), dtype="<i2"))
        a, b = (int(round(x * SR)) for x in m["src"])
        pieces.append(stereo[max(0, a):min(len(stereo), b)])
    audio = np.concatenate(pieces)

    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = out.with_suffix(".tmp.wav")
    with wave.open(str(tmp), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(audio.tobytes())
    sh("ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-codec:a", "libmp3lame",
       "-b:a", "192k", str(out))
    tmp.unlink()
    print(f"wrote      {out.name}  {int(total // 60)}:{total % 60:04.1f}")

    # ---- remap the timings through the cut (exact; no re-alignment) ----
    def remap(x):
        """Map a source time onto the output timeline.

        A word whose aligner stamp lands in a gap is NOT missing from the audio
        -- whole speech regions are kept, so the sound is there and only the
        label is stale (the aligner routinely puts a stamp past the speech; that
        is how ge/dge "lost" the word large). So snap to the nearest segment
        instead of dropping the word, and report how far it had to move.
        """
        for m in plan:
            if m["src"][0] - 1e-6 <= x <= m["src"][1] + 1e-6:
                return round(m["out"][0] + (x - m["src"][0]), 3), 0.0
        best, dist = None, float("inf")
        for m in plan:
            d = max(m["src"][0] - x, x - m["src"][1])
            if d < dist:
                best, dist = m, d
        edge = best["out"][0] if x < best["src"][0] else best["out"][1]
        return round(edge, 3), dist

    new, lost, snapped = [], [], []
    for p in phrases:
        if p["index"] not in keep_set:
            continue
        ws = []
        for w in p["words"]:
            a, da = remap(w["start"])
            b, db_ = remap(w["end"])
            if max(da, db_) > 0.02:
                snapped.append((max(da, db_), f'{p["index"]}:{w["word"]}'))
            ws.append({"word": w["word"], "start": a, "end": max(b, a + 0.05)})
        if not ws:
            lost.append(f'{p["index"]}:<whole phrase>')
            continue
        new.append({
            "index": len(new), "text": p["text"], "line_index": len(new),
            "start": ws[0]["start"], "end": ws[-1]["end"],
            "duration": round(ws[-1]["end"] - ws[0]["start"], 3),
            "words": ws, "src_index": p["index"],
        })

    tj = root / spec["timing_out"]
    tj.write_text(json.dumps(new, indent=1) + "\n")
    print(f"wrote      {tj.name}  {len(new)} phrases")
    if lost:
        print(f"  WARNING  {len(lost)} phrase(s) had no mappable word: {lost[:10]}")
    far = sorted((s for s in snapped if s[0] > 0.35), reverse=True)
    if far:
        print(f"  {len(far)} caption stamp(s) snapped by >0.35s "
              f"(audio intact, label moved): "
              + ", ".join(f"{w} {d:.2f}s" for d, w in far[:6]))

    # ---- check 1: every splice boundary sits in silence ----
    cmono, _ = decode(out)
    ct, cdb = envelope(cmono)
    cregions, _, cgate = speech_regions(ct, cdb)
    print(f"\ncheck 1    regions in output: {len(cregions)}  (expected {len(kept)})")
    bad = []
    for i, m in enumerate(plan):
        for edge, label in ((m["out"][0], "in"), (m["out"][1], "out")):
            j = int(edge / HOP)
            probe = cdb[max(0, j - 2):j + 3]
            if len(probe) and probe.min() > cgate:
                bad.append(f'seg{i} {label} @{edge:.2f}s')
    print(f"check 2    boundaries landing in speech: {len(bad)}"
          + (f"  -> {bad[:8]}" if bad else "  (none — no word is clipped)"))

    Path(root / spec["out"]).with_suffix(".plan.json").write_text(
        json.dumps({"total": total, "segments": plan}, indent=1) + "\n")

    script = "\n".join(p["text"] for p in new) + "\n"
    (root / spec["script_out"]).write_text(script)
    print(f"wrote      {Path(spec['script_out']).name}")
    return 0 if not bad and not lost and len(cregions) == len(kept) else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
