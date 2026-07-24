#!/usr/bin/env python3
"""Align an audio file to a known script (or transcribe it) and emit per-line timings.

Usage:
    python align_audio.py <audio> [script.txt] [--model base] [--lang en]

With a script file  -> forced alignment to the known text (accurate line timings).
Without a script    -> plain transcription with word-level timestamps.

Outputs next to the audio file:
    <name>.lines.json   [{index, line, start, end, duration, words:[{word,start,end}]}]
    <name>.srt          subtitles, one cue per script line
    <name>.words.json   flat word-level timings
Also prints a readable table to stdout.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

import stable_whisper


def norm(text: str) -> str:
    """Lowercase, letters+digits only — used to match aligned words back to script lines."""
    return re.sub(r"[^a-z0-9]", "", text.lower())


def read_lines(path: Path) -> list[str]:
    lines = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if line:
            lines.append(line)
    return lines


def split_phrases(line: str) -> list[str]:
    """Break a line at sentence/pause punctuation (! ? . ... …), keeping the mark.
    Runs of dots (...) count as one boundary; commas are NOT breaks."""
    parts = re.split(r"(?<=[.!?…])\s+", line)
    return [p.strip() for p in parts if p.strip()]


def fmt_ts(seconds: float) -> str:
    ms = int(round(seconds * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def flatten_words(result) -> list[dict]:
    words = []
    for seg in result.segments:
        for w in seg.words:
            words.append({"word": w.word.strip(), "start": w.start, "end": w.end})
    return words


def map_words_to_lines(lines: list[str], words: list[dict],
                       parents: list[int] | None = None) -> list[dict]:
    """Greedily consume aligned words to reconstruct each segment, capturing its span.
    `parents[i]` is the source-line number for segment i (used in phrase mode)."""
    out = []
    wi = 0
    n = len(words)
    for idx, line in enumerate(lines):
        entry = {"index": idx, "text": line}
        if parents is not None:
            entry["line_index"] = parents[idx]
        target = norm(line)
        if not target:  # nothing pronounceable (e.g. an emoji-only line)
            out.append({**entry, "start": None, "end": None,
                        "duration": None, "words": []})
            continue
        buf = ""
        start_i = wi
        while wi < n and len(buf) < len(target):
            buf += norm(words[wi]["word"])
            wi += 1
        used = words[start_i:wi]
        if used:
            start = used[0]["start"]
            end = used[-1]["end"]
        else:
            start = end = None
        out.append({
            **entry,
            "start": start,
            "end": end,
            "duration": None if start is None else round(end - start, 3),
            "words": used,
        })
    if wi < n:
        print(f"  note: {n - wi} aligned words left unmatched "
              f"(script may not fully cover the audio)", file=sys.stderr)
    return out


def write_srt(lines: list[dict], path: Path) -> None:
    cues = []
    for i, ln in enumerate((l for l in lines if l["start"] is not None), start=1):
        cues.append(f"{i}\n{fmt_ts(ln['start'])} --> {fmt_ts(ln['end'])}\n{ln['text']}\n")
    path.write_text("\n".join(cues), encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("audio", type=Path)
    ap.add_argument("script", type=Path, nargs="?")
    ap.add_argument("--model", default="base", help="whisper model (tiny/base/small/medium)")
    ap.add_argument("--lang", default="en")
    ap.add_argument("--unit", choices=["phrase", "line"], default="phrase",
                    help="segment by 'phrase' (split at ! ? . ...) or whole 'line'")
    args = ap.parse_args()

    if not args.audio.exists():
        print(f"audio not found: {args.audio}", file=sys.stderr)
        return 1

    print(f"loading model '{args.model}'...", file=sys.stderr)
    model = stable_whisper.load_model(args.model)

    if args.script:
        lines = read_lines(args.script)
        if args.unit == "phrase":
            segments, parents = [], []
            for li, line in enumerate(lines):
                for phrase in split_phrases(line):
                    segments.append(phrase)
                    parents.append(li)
        else:
            segments, parents = lines, None
        text = " ".join(lines)
        print(f"aligning {len(segments)} {args.unit}(s) to {args.audio.name}...",
              file=sys.stderr)
        result = model.align(str(args.audio), text, language=args.lang)
        mapped = map_words_to_lines(segments, flatten_words(result), parents)
    else:
        print(f"transcribing {args.audio.name}...", file=sys.stderr)
        result = model.transcribe(str(args.audio), language=args.lang)
        mapped = [{
            "index": i,
            "text": seg.text.strip(),
            "start": seg.start,
            "end": seg.end,
            "duration": round(seg.end - seg.start, 3),
            "words": [{"word": w.word.strip(), "start": w.start, "end": w.end}
                      for w in seg.words],
        } for i, seg in enumerate(result.segments)]

    stem = args.audio.with_suffix("")
    unit_label = "phrases" if (args.script and args.unit == "phrase") else "lines"
    lines_path = Path(f"{stem}.{unit_label}.json")
    words_path = Path(f"{stem}.words.json")
    srt_path = Path(f"{stem}.srt")

    lines_path.write_text(json.dumps(mapped, indent=2, ensure_ascii=False), encoding="utf-8")
    all_words = [w for ln in mapped for w in ln["words"]]
    words_path.write_text(json.dumps(all_words, indent=2, ensure_ascii=False), encoding="utf-8")
    write_srt(mapped, srt_path)

    print(f"\n{'#':>2}  {'start':>8}  {'end':>8}  {'dur':>6}  line")
    print("-" * 72)
    for ln in mapped:
        if ln["start"] is None:
            print(f"{ln['index']:>2}  {'--':>8}  {'--':>8}  {'--':>6}  {ln['text']}")
        else:
            snippet = ln["text"] if len(ln["text"]) <= 46 else ln["text"][:43] + "..."
            print(f"{ln['index']:>2}  {ln['start']:>8.2f}  {ln['end']:>8.2f}  "
                  f"{ln['duration']:>6.2f}  {snippet}")

    print(f"\nwrote:\n  {lines_path}\n  {words_path}\n  {srt_path}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
