#!/usr/bin/env bash
# One gate to run before showing anyone a render.
#   bash tools/check_video.sh <composition-id> <timing.json> [out.mp4]
#
# Combines the three checks that each caught a class of bug the eye missed:
#   1. every PHRASE changes visually from the one before it   (the per-line law)
#   2. every stacked card clears the slab extrusion below it  (the overlap class)
#   3. long lines with two clauses change on their pivot word (the sub-phrase law)
set -u
ID="$1"; TIMING="$2"; MP4="${3:-out/${1//-/_}.mp4}"
VENV=.venv-align/bin/python
OUT="/private/tmp/phrase_check_$ID"

echo "── 1 · per-phrase visual change ───────────────────────────────"
$VENV tools/phrase_sheet.py "$MP4" "$TIMING" "$OUT" | tail -n +2

echo "── 2 · slab clearance on stacked cards ────────────────────────"
$VENV - "$@" <<'PY'
import re, sys, pathlib
bad = 0
for f in pathlib.Path("src/reels").glob("*beats.tsx"):
    src = f.read_text()
    for m in re.finditer(r'flexDirection: "column"[^}]*?gap: (\d+)', src):
        gap = int(m.group(1))
        # the style object this column belongs to: from the preceding "{{" to the closing "}}"
        open_i = src.rfind("{{", 0, m.start())
        close_i = src.find("}}", m.end())
        own = src[open_i:close_i] if open_i >= 0 and close_i > 0 else ""
        # if THIS element carries the slab, the column lays out that card's own contents and
        # needs no clearance — the extrusion is below the card, not between its children
        if "slab(" in own or "boxShadow" in own:
            continue
        seg = src[m.end(): m.end() + 1400]
        depths = [int(d) for d in re.findall(r"slab\([^,]+,\s*(?:[\w.]+\s*\?\s*)?(\d+)", seg)]
        if not depths: continue
        need = max(depths) + 16
        if gap < need:
            print(f"   TIGHT  {f.name}:{src[:m.start()].count(chr(10))+1}  gap {gap} < {need}")
            bad += 1
print("   all stacked cards clear their extrusion" if not bad else f"   {bad} too tight")
PY

echo "── 3 · sub-phrase pivots ──────────────────────────────────────"
$VENV - "$TIMING" <<'PY'
import json, re, sys
p = json.load(open(sys.argv[1]))
PIVOT = re.compile(r"\b(but|and|so|because|or|then|like)\b", re.I)
rows = [(i, x) for i, x in enumerate(p) if x["duration"] > 2.4 and PIVOT.search(x["text"])]
print(f"   {len(rows)} long lines carry a pivot — each needs a second visual moment:")
for i, x in rows:
    print(f"     #{i:3d} {x['duration']:4.1f}s  {x['text'][:62]}")
PY
