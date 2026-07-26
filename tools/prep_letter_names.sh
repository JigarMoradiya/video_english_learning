#!/usr/bin/env bash
# Standalone LETTER-NAME clips ("A", "B", …) for the A–Z Letter Shorts.
#
# prep_recognition.sh already converts these, but only into its _tmp/ scratch dir on
# the way to building the trios — so nothing committed has the bare letter name. The
# Shorts need it on its own to speak "More · A · words" from
#   public/audio/more.mp3 + letter_<x>.mp3 + public/audio/words.mp3
# (more/words recorded once and shared by all 26 episodes).
#
# Prints each duration to hardcode into src/data/letterShorts.ts.
set -u
IOS="/Users/jigarmoradiya/Documents/newProject/eng/iOS/Learn English"
ABCD="$IOS/Resources/Audio/Phonics/abcd"
PIPE="/Users/jigarmoradiya/Documents/newProject/eng/video-pipeline"
OUT="$PIPE/public/audio/letter_names"
mkdir -p "$OUT"

LETTERS=(a b c d e f g h i j k l m n o p q r s t u v w x y z)
dur() { ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "$1"; }

echo "=== letter names -> $OUT ==="
for x in "${LETTERS[@]}"; do
  src="$ABCD/letter_$x.opus"
  [ -f "$src" ] || { echo "  MISSING letter_$x.opus"; continue; }
  ffmpeg -y -i "$src" "$OUT/letter_$x.mp3" >/dev/null 2>&1
  printf '  %s: %s\n' "$x" "$(dur "$OUT/letter_$x.mp3")"
done

echo "=== shared framing words ==="
for f in more words; do
  [ -f "$PIPE/public/audio/$f.mp3" ] && printf '  %s: %s\n' "$f" "$(dur "$PIPE/public/audio/$f.mp3")"
done
