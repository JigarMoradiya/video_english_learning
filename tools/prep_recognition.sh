#!/usr/bin/env bash
# Prepares audio for the A-Z "Letter Recognition" video ("A says a"):
#   1. converts the app's 26 letter-name clips + shared "says" + 26 sound clips (.opus -> mp3)
#   2. concatenates each letter's trio (letter_x + says + sound_x) GAPLESSLY into <x>_trio.mp3
#   3. prints per-letter d0 (letter name) / d2 (sound) durations + the single d1 (says)
# Reuses the app's existing recordings — no new recording. Word images already in public/letters/.
set -u
IOS="/Users/jigarmoradiya/Documents/newProject/eng/iOS/Learn English"
ABCD="$IOS/Resources/Audio/Phonics/abcd"              # letter_<x>.opus + says.opus
SND="$IOS/Resources/Audio/Phonics/phonics abcd"       # sound_<x>.opus
PIPE="/Users/jigarmoradiya/Documents/newProject/eng/video-pipeline"
OUT="$PIPE/public/audio/recognition"
TMP="$OUT/_tmp"
mkdir -p "$OUT" "$TMP"

LETTERS=(a b c d e f g h i j k l m n o p q r s t u v w x y z)

dur() { ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "$1"; }

echo "=== converting says.opus ==="
ffmpeg -y -i "$ABCD/says.opus" "$TMP/says.mp3" >/dev/null 2>&1 || echo "  MISSING says.opus"

echo "=== converting + concatenating trios ==="
for x in "${LETTERS[@]}"; do
  ls="$ABCD/letter_$x.opus"; sd="$SND/sound_$x.opus"
  [ -f "$ls" ] || { echo "  MISSING letter_$x.opus"; continue; }
  [ -f "$sd" ] || { echo "  MISSING sound_$x.opus"; continue; }
  ffmpeg -y -i "$ls" "$TMP/letter_$x.mp3" >/dev/null 2>&1
  ffmpeg -y -i "$sd" "$TMP/sound_$x.mp3" >/dev/null 2>&1
  ffmpeg -y -i "$TMP/letter_$x.mp3" -i "$TMP/says.mp3" -i "$TMP/sound_$x.mp3" \
    -filter_complex '[0:a][1:a][2:a]concat=n=3:v=0:a=1' "$OUT/${x}_trio.mp3" >/dev/null 2>&1
done

echo "=== SAYS_DUR ==="
printf "says %s\n" "$(dur "$TMP/says.mp3")"

echo "=== per-letter: x d0(letter) d2(sound) trio(total) ==="
for x in "${LETTERS[@]}"; do
  [ -f "$OUT/${x}_trio.mp3" ] || continue
  printf "%s %s %s %s\n" "$x" "$(dur "$TMP/letter_$x.mp3")" "$(dur "$TMP/sound_$x.mp3")" "$(dur "$OUT/${x}_trio.mp3")"
done

rm -rf "$TMP"
echo "=== done: $(ls "$OUT"/*_trio.mp3 2>/dev/null | wc -l | tr -d ' ') trio mp3 ==="
