#!/usr/bin/env bash
# Prepares assets for the A-Z "Letter Phonics Sound" video:
#   1. converts the app's 26 combined letter clips (.opus) -> mp3
#   2. extracts the 26 mainWord PNGs from the app's asset catalog
#   3. prints each clip's duration (paste into src/data/letters.ts)
# Reuses the app's existing audio + images — no new recording.
set -u
IOS="/Users/jigarmoradiya/Documents/newProject/eng/iOS/Learn English"
AUDIO_SRC="$IOS/Resources/Audio/Phonics/abcd_full"
IMG_ROOT="$IOS/Resources/Assets.xcassets/Images"
PIPE="/Users/jigarmoradiya/Documents/newProject/eng/video-pipeline"
OUT_AUDIO="$PIPE/public/audio/letters"
OUT_IMG="$PIPE/public/letters"
mkdir -p "$OUT_AUDIO" "$OUT_IMG"

# letter:word:stem   (stem = the abcd_full opus basename)
PAIRS=(
  a:ant:a_ant_sound b:bat:b_bat_sound c:cat:c_cat_sound d:drum:d_drum_sound
  e:elephant:e_elephant_sound f:fish:f_fish_sound g:goat:g_goat_sound h:hat:h_hat_sound
  i:icecream:i_icecream_sound j:joker:j_joker_sound k:kiwi:k_kiwi_sound l:lion:l_lion_sound
  m:monkey:m_monkey_sound n:nest:n_nest_sound o:orange:o_orange_sound p:parrot:p_parrot_sound
  q:queen:q_queen_sound r:rose:r_rose_sound s:sun:s_sun_sound t:tiger:t_tiger_sound
  u:umbrella:u_umbrella_sound v:van:v_van_sound w:watermelon:w_watermelon_sound
  x:xylophone:x_xylophone_sound y:yoga:y_yoga_sound z:zebra:z_zebra_sound
)

echo "=== converting audio (opus -> mp3) ==="
for p in "${PAIRS[@]}"; do
  IFS=: read -r letter word stem <<< "$p"
  src="$AUDIO_SRC/$stem.opus"
  [ -f "$src" ] && ffmpeg -y -i "$src" "$OUT_AUDIO/$stem.mp3" >/dev/null 2>&1 || echo "  MISSING audio: $src"
done

echo "=== extracting images ==="
for p in "${PAIRS[@]}"; do
  IFS=: read -r letter word stem <<< "$p"
  iset=$(find "$IMG_ROOT" -type d -name "$word.imageset" 2>/dev/null | head -1)
  png=$(find "$iset" -maxdepth 1 -name "*.png" 2>/dev/null | head -1)
  if [ -n "$png" ]; then cp "$png" "$OUT_IMG/$word.png"; else echo "  MISSING image: $word.imageset"; fi
done

echo "=== durations (stem seconds) ==="
for p in "${PAIRS[@]}"; do
  IFS=: read -r letter word stem <<< "$p"
  f="$OUT_AUDIO/$stem.mp3"
  [ -f "$f" ] && printf "%s %s\n" "$stem" "$(ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "$f")"
done

echo "=== done: $(ls "$OUT_AUDIO"/*.mp3 2>/dev/null | wc -l | tr -d ' ') mp3, $(ls "$OUT_IMG"/*.png 2>/dev/null | wc -l | tr -d ' ') png ==="
