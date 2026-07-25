#!/usr/bin/env bash
# Assemble a standalone Swift program from the app's REAL tracing geometry
# (LetterSkeletonEnum.swift) + a header/footer, then dump every letter's sampled
# stroke polylines (A–Z + a–z, normalized 0–1) to src/data/letterStrokes.json.
set -euo pipefail
cd "$(dirname "$0")/.."

GEO="/Users/jigarmoradiya/Documents/newProject/eng/iOS/Learn English/UI/Age Group 3-5/Letter Tracing/Other/LetterSkeletonEnum.swift"
BUILD="tools/dump_letter_strokes.swift"
OUT="src/data/letterStrokes.json"

{
  cat tools/_strokes_header.swift
  # the app geometry, minus its `import SwiftUI` (we run headless with Foundation)
  grep -v '^import SwiftUI' "$GEO"
  cat tools/_strokes_footer.swift
} > "$BUILD"

swift "$BUILD" > "$OUT"
echo "wrote $OUT ($(wc -c < "$OUT") bytes)"
echo "letters: $(python3 -c "import json;d=json.load(open('$OUT'));print(len(d))")"
echo "A strokes: $(python3 -c "import json;d=json.load(open('$OUT'));print([len(s) for s in d['A']])")  a strokes: $(python3 -c "import json;d=json.load(open('$OUT'));print([len(s) for s in d['a']])")"
