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
           "Sound them out...", "...then blend them fast.", "Ready? Let's do.",
           "First vowel — aaa."],
    "03": ["Same middle sound. Watch."],
    "04": ["You're getting it."],
    "05a": ["Three words. One vowel."],
    "05b": ["New vowel. eh."],
    "06": ["Hen. Pen. Hear the middle?"],
    "07": ["Nice work.", "Next one — ih."],
    "08": ["Pig... big. Only the first sound changed."],
    "09": ["Your turn's coming. Keep watching.", "Next — oh."],
    "10": ["Pot. Hot. Hear that? Just the front sound.", "Last vowel. uh."],
    "11": ["This one's yours. Sound it out."],
    "12": ["Did you get it? I bet you did."],
    "13a": ["Twenty five words."],
    "13b": ["You read them all.", "One more. Something's missing."],
    "14": ["Which vowel goes in the middle?"],
    "15": ["You found it. That's real reading.",
           "Every word here is in the English Learning app — tap any word and watch it build itself. Free on both stores."],
}

# the app's OWN tokens (letters.ts soundToken, post-fff). f/l/w/x/j were missing, so the
# caption printed the bare letter — "f" for fff, "x" for ks — in every word that used them.
SOUND_TOKEN = {"a": "aaa", "b": "buh", "c": "kuh", "d": "duh", "e": "eh", "f": "fff",
               "g": "guh", "h": "huh", "i": "ih", "j": "juh", "l": "luh", "m": "mmm",
               "n": "nuh", "o": "oh", "p": "puh", "r": "ruh", "s": "sss", "t": "tuh",
               "u": "uh", "w": "wuh", "x": "ks"}


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
            out.append((re.sub(r"[^A-Za-z0-9']", "", w["word"]).lower(), w["start"], w["end"]))
    return [w for w in out if w[0]]


def split_points(heard: list[tuple[str, float, float]], sents: list[str]) -> list[int]:
    """Where one script sentence ends and the next begins in the heard word stream.

    Word COUNT alone is not enough. Whisper heard run 09's "Your turn's coming." as four
    words, not three — it split the contraction — so every later sentence in that run was
    handed one word too few, and "Next — oh." was stamped 2.2s early, ON the word
    "watching". The count is only a hint now; the boundary is snapped to the real PAUSE
    nearest it, because a teacher always breathes between sentences and never mid-sentence.
    """
    n = [len(re.findall(r"[A-Za-z0-9']+", s)) for s in sents]
    # When the two counts agree, the count split is EXACT and must be left alone. Snapping
    # it anyway is how "First vowel — aaa." picked up two of whisper's own words: run 02's
    # counts matched perfectly, but "do first" was said without a pause while "Ready?" had
    # one, so the largest-gap rule stole a boundary that was already right.
    if sum(n) == len(heard):
        cuts, acc = [0], 0
        for k in n:
            acc += k
            cuts.append(acc)
        return cuts
    cuts, acc = [0], 0
    for k in n[:-1]:
        acc += k
        lo, hi = max(cuts[-1] + 1, acc - 2), min(len(heard) - 1, acc + 2)
        best, bestgap = acc, -1.0
        for i in range(lo, hi + 1):
            gap = heard[i][1] - heard[i - 1][2]          # silence before word i
            if gap > bestgap:
                best, bestgap = i, gap
        cuts.append(best)
    cuts.append(len(heard))                              # the last sentence takes the rest
    return cuts


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
                toks.append("___")          # the missing middle: a blank, not a question mark
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
            cuts = split_points(heard, sents)
            for si, s in enumerate(sents):
                script_words = re.findall(r"[A-Za-z0-9'\u2014\u2019.,!?…-]+", s)
                take = heard[cuts[si]:cuts[si + 1]]
                if not take:
                    continue
                st, en = c["start"] + take[0][1], c["start"] + take[-1][2]
                # SCRIPT words, WHISPER times. Whisper hears "uh" as "er" and "ih" as "E";
                # its text must never reach the screen.
                spoken = [w for w in script_words if re.search(r"[A-Za-z0-9]", w)]
                # THE SCRIPT SUPPLIES EVERY WORD ON SCREEN. Whisper's own text must never
                # leak in: it heard "turn's" as two words and "aaa" as "aah", and falling
                # back to it printed "Keep watching. watching" and "First vowel aaa. aah".
                # A surplus heard word folds into the previous word's TIMING instead;
                # a shortfall splits the last heard word's span across what is left.
                ws = []
                for k, wd in enumerate(spoken):
                    if k < len(take):
                        ws.append({"word": wd, "start": round(c["start"] + take[k][1], 3),
                                   "end": round(c["start"] + take[k][2], 3)})
                    else:
                        last = ws[-1]
                        span = (en - last["start"]) / (len(spoken) - k + 1)
                        ws.append({"word": wd, "start": round(last["end"], 3),
                                   "end": round(min(en, last["end"] + span), 3)})
                if ws and len(take) > len(spoken):
                    ws[-1]["end"] = round(c["start"] + take[-1][2], 3)
                push(s, st, en, ws)
            print(f"  run {rid}: {len(sents)} sentences from {len(heard)} heard words")

        elif c["kind"] == "sound":
            pending.append(c)

        elif c["kind"] == "word":
            # "kuh... aaa... tuh... cat!" as ONE caption line, each token timed to its clip
            toks = [SOUND_TOKEN.get(p["letter"], p["letter"]) for p in pending]
            text = " ".join(f"{t}..." for t in toks) + f" - {c['word']}!"
            ws = [{"word": t, "start": p["start"], "end": round(p["start"] + p["dur"], 3)}
                  for t, p in zip(toks, pending)]
            ws.append({"word": "- " + c["word"] + "!", "start": c["start"],
                       "end": round(c["start"] + c["dur"], 3)})
            st = pending[0]["start"] if pending else c["start"]
            push(text, st, c["start"] + c["dur"], ws)
            pending = []

    snap(phrases)
    OUT.write_text(json.dumps(phrases, indent=1) + "\n")
    print(f"{len(phrases)} caption phrases -> {OUT}")
    return 0


def bursts_of(path: str, floor: float = -46.0, join: float = 0.18) -> list[tuple[float, float]]:
    """Every stretch of real speech in a wav, as (start, end) seconds."""
    import numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", path, "-ac", "1", "-ar", "16000",
                          "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(float)
    sr, w = 16000, 320
    db = 20 * np.log10(np.sqrt(np.convolve(x ** 2, np.ones(w) / w, "same") + 1) / 32768 + 1e-9)
    on = db > floor
    edges = np.diff(on.astype(np.int8))
    starts = (np.flatnonzero(edges == 1) + 1) / sr
    ends = (np.flatnonzero(edges == -1) + 1) / sr
    if on[0]:
        starts = np.r_[0.0, starts]
    if on[-1]:
        ends = np.r_[ends, len(x) / sr]
    out: list[list[float]] = []
    for a, b in zip(starts, ends):
        if out and a - out[-1][1] < join:      # a breath inside a phrase is not a boundary
            out[-1][1] = b
        else:
            out.append([a, b])
    return [(a, b) for a, b in out if b - a >= 0.06]


def snap(phrases: list[dict]) -> None:
    """Pull every caption onto the speech it names.

    Whisper's word timestamps are good to a tenth or so, which is enough to put a caption
    on the WRONG SIDE of a sentence boundary. The first version of this took the earliest
    loud sample in a window — and that sample was sometimes the tail of the previous
    sentence, which is how "Blue ones are consonants." came up 0.5s early, over the end of
    "Red is a vowel." A stamp is now seated on a real speech BURST — a run of sound with
    silence before it — so it can only ever land where someone starts speaking.
    """
    bursts = bursts_of("public/audio/cvc/_mix.wav")
    moved = 0
    floor = 0.0
    for p in phrases:
        cand = [b for b in bursts if b[0] >= floor - 0.01 and b[0] <= p["start"] + 0.8]
        if not cand:
            floor = max(floor, p["end"])
            continue
        onset = min(cand, key=lambda b: abs(b[0] - p["start"]))[0]
        if abs(onset - p["start"]) > 0.05:
            shift = onset - p["start"]
            p["start"] = round(onset, 3)
            for wd in p.get("words", []):
                wd["start"] = round(wd["start"] + shift, 3)
                wd["end"] = round(wd["end"] + shift, 3)
            moved += 1
        p["duration"] = round(p["end"] - p["start"], 3)
        # the next line may not reach back inside this one. Build phrases end on an exact
        # clip boundary, so this floor is hard; that is what stopped "New vowel. eh." from
        # being seated on a burst that was really the word "bat".
        floor = max(floor, p["end"] - 0.02)

    # a line must not vanish while its own last word is still being said: stretch each end
    # to the end of the last burst that belongs to it
    for i, p in enumerate(phrases):
        nxt = phrases[i + 1]["start"] if i + 1 < len(phrases) else 1e9
        mine = [b for b in bursts if b[0] >= p["start"] - 0.01 and b[0] < nxt - 0.02]
        if mine:
            p["end"] = max(p["end"], min(mine[-1][1], nxt - 0.02))
        p["end"] = round(min(p["end"], nxt - 0.02), 3)   # never outlive the next line
        p["duration"] = round(p["end"] - p["start"], 3)
    print(f"  snapped {moved} caption stamps onto real speech")


if __name__ == "__main__":
    raise SystemExit(main())
