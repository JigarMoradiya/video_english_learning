#!/usr/bin/env python3
"""Word-level caption track for L4, built from the timeline.

    .venv-align/bin/python tools/build_cvc_captions.py

The 15 recorded runs are multi-sentence files with no internal timings, so each is
transcribed WITH WORD TIMESTAMPS and its sentences are split out, then offset by the
clip's own start in the timeline. Sound and word clips become their own short phrases so
the sound-out reads on screen exactly as it is heard.

Writes src/data/cvc.captions.json in the house TPhrase shape, so the standard
<Captions/> component renders it — the same karaoke every other video uses.
"""
from __future__ import annotations

import json
import re
import subprocess
import tempfile
from pathlib import Path

import whisper

TIMELINE = json.load(open("src/data/cvc.timeline.json"))
OUT = Path("src/data/cvc.captions.json")
AUDIO = Path("public")

# what each recorded run actually says, sentence by sentence — the script is the truth,
# the transcript only supplies the timings
RUN_TEXT: dict[str, list[str]] = {
    "01": ["Watch this."],
    "02": ["You just read a word.", "Three sounds. One word.", "Look at the colours.",
           "Blue. Red. Blue.", "Red is always the middle one.", "Red is a vowel.",
           "Blue ones are consonants.", "Consonant. Vowel. Consonant.",
           "Sound them out...", "...then blend them fast.", "Ready? Let's do fifteen.",
           "First vowel — aaa."],
    "03": ["Same middle sound. Watch."],
    "04": ["You're getting it."],
    "05": ["Three words. One vowel.", "New vowel. eh."],
    "06": ["Hen. Pen. Hear the middle?"],
    "07": ["Nice work.", "Next one — ih."],
    "08": ["Pig... big. Only the first sound changed."],
    "09": ["Your turn's coming. Keep watching.", "Next — oh."],
    "10": ["Pot. Hot. Hear that? Just the front sound.", "Last vowel. uh."],
    "11": ["This one's yours. Sound it out."],
    "12": ["Did you get it? I bet you did."],
    "13": ["Fifteen words. You read them all.", "One more. Something's missing."],
    "14": ["Which vowel goes in the middle?"],
    "15": ["You found it. That's real reading.",
           "Every word here is in the English Learning app — tap any word and watch it build itself. Free on both stores."],
}

SOUND_TOKEN = {"a": "aaa", "b": "buh", "c": "kuh", "d": "duh", "e": "eh", "g": "guh",
               "h": "huh", "i": "ih", "m": "mmm", "n": "nuh", "o": "oh", "p": "puh",
               "r": "ruh", "s": "sss", "t": "tuh", "u": "uh"}


def words_of(path: Path) -> list[tuple[str, float, float]]:
    model = words_of._m  # type: ignore[attr-defined]
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        fn = f.name
    subprocess.run(["ffmpeg", "-y", "-v", "quiet", "-i", str(path), "-ar", "16000",
                    "-ac", "1", fn], check=True)
    r = model.transcribe(fn, language="en", word_timestamps=True, fp16=False)
    Path(fn).unlink()
    out = []
    for seg in r["segments"]:
        for w in seg.get("words", []):
            out.append((re.sub(r"[^A-Za-z']", "", w["word"]).lower(), w["start"], w["end"]))
    return [w for w in out if w[0]]


def main() -> int:
    words_of._m = whisper.load_model("small.en")  # type: ignore[attr-defined]
    phrases: list[dict] = []

    def push(text: str, start: float, end: float, words: list[dict]) -> None:
        phrases.append({"index": len(phrases), "text": text, "line_index": len(phrases),
                        "start": round(start, 3), "end": round(end, 3),
                        "duration": round(end - start, 3), "words": words})

    pending: list[dict] = []   # sound clips waiting for their word, so they caption as one line

    def flush() -> None:
        """Emit buffered sounds as their own line. The quiz sounds the two consonants and
        LEAVES THE VOWEL OUT — that hole is the question, so the caption shows it as `?`
        rather than closing up. Without this the quiz's sounds waited for a word clip that
        only arrives after the narrator's question, and swallowed the question line."""
        nonlocal pending
        if not pending:
            return
        toks, expect = [], 0
        for pc in pending:
            while pc["idx"] > expect:
                toks.append("?")
                expect += 1
            toks.append(SOUND_TOKEN.get(pc["letter"], pc["letter"]))
            expect += 1
        ws = [{"word": SOUND_TOKEN.get(pc["letter"], pc["letter"]), "start": pc["start"],
               "end": round(pc["start"] + pc["dur"], 3)} for pc in pending]
        push(" ".join(f"{x}..." for x in toks),
             pending[0]["start"], round(pending[-1]["start"] + pending[-1]["dur"], 3), ws)
        pending = []

    for c in TIMELINE["clips"]:
        if c["kind"] == "run":
            flush()
            rid = c["id"]
            heard = words_of(AUDIO / c["src"])
            sents = RUN_TEXT[rid]
            # walk the script's sentences across the heard word stream in order
            wi = 0
            for s in sents:
                n = len([w for w in re.findall(r"[A-Za-z']+", s)])
                take = heard[wi:wi + n]
                wi += n
                if not take:
                    continue
                st, en = c["start"] + take[0][1], c["start"] + take[-1][2]
                ws = [{"word": w, "start": round(c["start"] + a, 3), "end": round(c["start"] + b, 3)}
                      for w, a, b in take]
                push(s, st, en, ws)
            print(f"  run {rid}: {len(sents)} sentences from {len(heard)} heard words")

        elif c["kind"] == "sound":
            pending.append(c)

        elif c["kind"] == "word":
            # "kuh... aaa... tuh... cat!" as ONE caption line, each token timed to its clip
            toks = [SOUND_TOKEN.get(p["letter"], p["letter"]) for p in pending]
            text = " ".join(f"{t}..." for t in toks) + f" {c['word']}!"
            ws = [{"word": t, "start": p["start"], "end": round(p["start"] + p["dur"], 3)}
                  for t, p in zip(toks, pending)]
            ws.append({"word": c["word"] + "!", "start": c["start"],
                       "end": round(c["start"] + c["dur"], 3)})
            st = pending[0]["start"] if pending else c["start"]
            push(text, st, c["start"] + c["dur"], ws)
            pending = []

    snap(phrases)
    OUT.write_text(json.dumps(phrases, indent=1) + "\n")
    print(f"{len(phrases)} caption phrases -> {OUT}")
    return 0


def snap(phrases: list[dict]) -> None:
    """Pull every caption onto the speech it names.

    Whisper's word timestamps are approximate — good to a tenth or so — and a caption that
    appears while the room is still silent reads as the video being out of sync. Each stamp
    is re-seated on the first burst inside its own window, bounded by the previous phrase so
    it can never steal a neighbour's line. Same fix that repaired L3's stamps.
    """
    import numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", "public/audio/cvc/_mix.wav",
                          "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                         capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(float)
    sr, w = 16000, 320
    db = 20 * np.log10(np.sqrt(np.convolve(x ** 2, np.ones(w) / w, "same") + 1) / 32768 + 1e-9)
    moved = 0
    for i, p in enumerate(phrases):
        lo = max(0.0, phrases[i - 1]["end"] + 0.02 if i else 0.0, p["start"] - 0.45)
        hi = min(p["start"] + 0.45, p["end"])
        a, b = int(lo * sr), int(hi * sr)
        if b - a < w:
            continue
        seg = db[a:b]
        on = seg > -52.0
        if not on.any():
            continue
        onset = lo + int(np.argmax(on)) / sr
        if abs(onset - p["start"]) > 0.05:
            shift = onset - p["start"]
            p["start"] = round(onset, 3)
            p["duration"] = round(p["end"] - p["start"], 3)
            for wd in p.get("words", []):
                wd["start"] = round(wd["start"] + shift, 3)
                wd["end"] = round(wd["end"] + shift, 3)
            moved += 1
    print(f"  snapped {moved} caption stamps onto real speech")


if __name__ == "__main__":
    raise SystemExit(main())
