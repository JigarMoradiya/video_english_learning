# align_audio.py — audio → timed text

Aligns an audio file to a known script (or transcribes it) and emits **per-line start/end
timings**, for syncing captions in the reel pipeline.

## Setup (one time)
```bash
python3 -m venv .venv
./.venv/bin/pip install stable-ts
```

## Use
```bash
# Accurate: align to the exact known script (one spoken line per text line)
./.venv/bin/python align_audio.py /path/to/audio.mp3 /path/to/script.txt

# Fallback: no script -> transcribe with word timestamps
./.venv/bin/python align_audio.py /path/to/audio.mp3
```

Optional: `--model small` (more accurate, slower), `--lang en`.

## Outputs (written next to the audio)
- `<name>.lines.json` — `[{index, line, start, end, duration, words:[…]}]`
- `<name>.srt` — subtitles, one cue per line
- `<name>.words.json` — flat word-level timings
- a table printed to the terminal

## Script file notes
- One spoken line per text line; blank lines ignored.
- Strip anything **not spoken** (stage directions like `(pause)`, stray numbers,
  emoji) before aligning — non-speech tokens corrupt timing.
