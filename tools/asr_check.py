#!/usr/bin/env python3
"""Independently transcribe an audio file and diff it against the script.

    python tools/asr_check.py <audio> <script.txt>

This is the ONLY real check that an audio cut is intact. `align_audio.py` does
FORCED alignment -- it forces whatever script it is handed onto the audio, so
"the transcript matches the script" is true by construction and proves nothing.
A whole ch/tch build was made against the wrong script because of that.

Reports, in order of how much they matter:
  * words in the script that are NOT heard   -> the cut deleted speech
  * words heard that are NOT in the script   -> the cut smuggled speech back in
  * similarity ratio

Exit code is non-zero on any difference, so it can gate a build.
"""
import difflib
import re
import sys
import unicodedata
from pathlib import Path

# Spelled-out phonics fragments the recogniser cannot be expected to match.
# These are single letters or sound fragments, never real words.
FRAGMENTS = {
    "s", "k", "j", "g", "c", "ih", "uh", "ty", "a", "t", "e", "i", "y", "m",
    "u", "sh", "n", "d", "b", "p", "r", "l", "o",
}


def norm(text):
    text = unicodedata.normalize("NFKD", text).lower()
    text = text.replace("/", " ").replace("-", " ").replace("…", " ")
    return re.findall(r"[a-z]+", text)


def transcribe(path):
    import stable_whisper
    model = stable_whisper.load_model("small")
    result = model.transcribe(str(path), language="en")
    segs = result["segments"] if isinstance(result, dict) else result.segments
    out = []
    for s in segs:
        out.append((s["start"] if isinstance(s, dict) else s.start,
                    (s["text"] if isinstance(s, dict) else s.text).strip()))
    return out


def main(audio, script):
    segs = transcribe(audio)
    heard_text = " ".join(t for _, t in segs)
    heard = norm(heard_text)
    want = norm(Path(script).read_text())

    Path(str(audio) + ".asr.txt").write_text(
        "\n".join(f"{t:8.2f}  {x}" for t, x in segs) + "\n")

    sm = difflib.SequenceMatcher(None, want, heard)
    print(f"script {len(want)} words · heard {len(heard)} words · "
          f"similarity {sm.ratio():.3f}\n")

    missing, extra, real = [], [], 0
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            continue
        w, h = want[i1:i2], heard[j1:j2]
        # A fragment-only difference is the recogniser, not the audio.
        if all(x in FRAGMENTS for x in w) and all(x in FRAGMENTS for x in h):
            continue
        real += 1
        if w:
            missing.append(" ".join(w))
        if h:
            extra.append(" ".join(h))
        print(f"  {tag:8s} script={' '.join(w)[:60]!r}  heard={' '.join(h)[:60]!r}")

    print(f"\nDELETED from the cut (script words never heard): {len(missing)}")
    for m in missing[:20]:
        print(f"    - {m}")
    print(f"SMUGGLED IN (heard but not in the script): {len(extra)}")
    for e in extra[:20]:
        print(f"    + {e}")
    if not real:
        print("\nclean — every scripted word is present and nothing extra is.")
    return 0 if not real else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2]))
