#!/usr/bin/env python3
"""Extract word-level timestamps from the narration for exact karaoke captions."""
import json
from faster_whisper import WhisperModel

model = WhisperModel("base.en", device="cpu", compute_type="int8")
segments, _ = model.transcribe("out/audio.mp3", word_timestamps=True)

words = []
for seg in segments:
    for w in seg.words:
        words.append({"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})

json.dump(words, open("src/data/word_timings.json", "w"), indent=0)
print(f"wrote {len(words)} words → src/data/word_timings.json")
print("first few:", words[:8])
