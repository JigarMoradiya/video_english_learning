#!/usr/bin/env bash
# Prep assets for the Short Vowels video: convert the reused app audio (vowel sounds,
# phonemes, word clips) opus->mp3 into public/audio/shortvowels/, extract the word images
# into public/shortvowels/, and print all durations (framing lines + reused clips).
set -u
IOS="/Users/jigarmoradiya/Documents/newProject/eng/iOS/Learn English"
SND="$IOS/Resources/Audio/Phonics/phonics abcd"     # sound_<letter>.opus
WORDS_SRC="$IOS/Resources/Audio/Phonics/phonics_word" # <word>.opus
IMG_ROOT="$IOS/Resources/Assets.xcassets/Images"
OUT_AUDIO="public/audio/shortvowels"
OUT_IMG="public/shortvowels"
mkdir -p "$OUT_AUDIO" "$OUT_IMG"
dur(){ ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "$1"; }

# vowel sounds + phonemes needed (listen words: cat hen pig dog sun -> c a t h e n p i g d o g s u n)
SOUNDS="a e i o u c t h n p g d s"
# words: learn examples + anchors + practice + listen (dedup)
WORDS="ant egg ink ox up cat hat bat hen pen net pig zip big dog pot fox sun bus jug rat"

echo "=== vowel/phoneme sounds (opus -> mp3) ==="
for s in $SOUNDS; do
  src="$SND/sound_$s.opus"
  [ -f "$src" ] && ffmpeg -y -i "$src" "$OUT_AUDIO/sound_$s.mp3" >/dev/null 2>&1 || echo "  MISSING sound_$s"
done

echo "=== word clips (opus -> mp3) ==="
for w in $WORDS; do
  src="$WORDS_SRC/$w.opus"
  [ -f "$src" ] && ffmpeg -y -i "$src" "$OUT_AUDIO/$w.mp3" >/dev/null 2>&1 || echo "  MISSING word $w"
done

echo "=== word images ==="
for w in $WORDS; do
  iset=$(find "$IMG_ROOT" -type d -iname "$w.imageset" 2>/dev/null | head -1)
  png=$(ls -S "$iset"/*.png 2>/dev/null | head -1)
  if [ -n "$png" ]; then cp "$png" "$OUT_IMG/$w.png"; else echo "  no image: $w"; fi
done

echo "=== FRAMING LINE durations (recorded) ==="
for f in intro rule practice_intro which_vowel_1 which_vowel_2 which_vowel_3 which_vowel_4 listen_intro outro_cta; do
  [ -f "$OUT_AUDIO/$f.mp3" ] && printf "%-16s %s\n" "$f" "$(dur "$OUT_AUDIO/$f.mp3")" || echo "  MISSING recording $f"
done

echo "=== reused clip durations (paste into shortvowels.ts) ==="
echo "-- vowel sounds --"; for s in a e i o u; do printf "sound_%s %s\n" "$s" "$(dur "$OUT_AUDIO/sound_$s.mp3" 2>/dev/null)"; done
echo "-- words --"; for w in $WORDS; do [ -f "$OUT_AUDIO/$w.mp3" ] && printf "%-6s %s\n" "$w" "$(dur "$OUT_AUDIO/$w.mp3")"; done

echo "=== done: $(ls "$OUT_AUDIO"/*.mp3 | wc -l | tr -d ' ') mp3, $(ls "$OUT_IMG"/*.png 2>/dev/null | wc -l | tr -d ' ') png ==="