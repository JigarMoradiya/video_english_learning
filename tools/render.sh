#!/usr/bin/env bash
# Render a composition into the video-wise out/ layout.
#
#   sh tools/render.sh c-k-ck-4x5      ->  out/c_k_ck/c_k_ck_4x5.mp4
#   sh tools/render.sh ai-ay           ->  out/ai_ay/ai_ay_9x16.mp4
#   sh tools/render.sh short-vowels    ->  out/short_vowels/short_vowels_16x9.mp4
#
# The folder is ONE per video and every aspect of that video lives in it:
#
#   out/<video>/<video>_16x9.mp4     YouTube
#   out/<video>/<video>_4x5.mp4      Facebook
#   out/<video>/<video>_9x16.mp4     Shorts / Reels / Instagram
#   out/<video>/yt_thumb_16x9.png    YouTube thumbnail
#   out/<video>/fb_thumb_9x16.png    Facebook thumbnail
#
# The aspect is read from the COMPOSITION's real size, never from the id, so an id that
# omits its aspect (ai-ay is 1080x1920) still lands in the right file. Deriving the path
# here instead of hard-coding ~30 package.json lines means the layout cannot drift.
set -eu
ID="${1:?usage: sh tools/render.sh <composition-id> [extra remotion args...]}"
shift || true

SIZE=$(npx remotion compositions 2>/dev/null | awk -v id="$ID" '$1 == id {print $3; exit}')
[ -n "$SIZE" ] || { echo "render.sh: no composition '$ID' (check src/reels/index.ts)" >&2; exit 1; }

case "$SIZE" in
  1920x1080) ASPECT=16x9 ;;
  1080x1350) ASPECT=4x5 ;;
  1080x1920) ASPECT=9x16 ;;
  1080x1080) ASPECT=1x1 ;;
  *) echo "render.sh: unmapped size $SIZE for '$ID' — add it to the case above" >&2; exit 1 ;;
esac

# video name = id with hyphens -> underscores, minus a trailing aspect suffix
BASE=$(printf '%s' "$ID" | sed -E 's/-(16x9|9x16|4x5|1x1)$//' | tr '-' '_')
DIR="out/$BASE"
OUT="$DIR/${BASE}_${ASPECT}.mp4"

mkdir -p "$DIR"
echo "→ $ID  ($SIZE)  ->  $OUT"
npx remotion render "$ID" "$OUT" "$@"
