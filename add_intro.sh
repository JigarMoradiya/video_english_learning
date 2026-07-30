#!/bin/bash
# add_intro.sh — prepend the Kids English Learning brand logo intro onto any video.
# Auto-picks the 9:16 or 16:9 intro to match the target's orientation, scales it to
# the target's exact resolution/fps, and concatenates (intro first, then your video).
#
# Usage:
#   bash add_intro.sh /path/to/video.mp4                 # -> video_intro.mp4 next to it
#   bash add_intro.sh /path/to/video.mp4 out.mp4         # custom output
#   INTRO_FLASH=1 bash add_intro.sh video.mp4            # use the short 1.2s flash cut (reels)
#
# The intros are rendered by the pipeline into out/ (render them first if missing):
#   npx remotion render logo-intro-9x16       out/logo_intro_9x16.mp4
#   npx remotion render logo-intro-16x9       out/logo_intro_16x9.mp4
#   npx remotion render logo-intro-flash-9x16 out/logo_intro_flash_9x16.mp4
set -euo pipefail
PIPE="/Users/jigarmoradiya/Documents/newProject/eng/video-pipeline/out"

VIDEO="${1:-}"
[ -z "$VIDEO" ] && { echo "Usage: bash add_intro.sh <video.mp4> [output.mp4]"; exit 1; }
[ -f "$VIDEO" ] || { echo "Video not found: $VIDEO"; exit 1; }
if [ "${2:-}" != "" ]; then OUT="$2"; else DIR=$(dirname "$VIDEO"); B=$(basename "$VIDEO"); OUT="$DIR/${B%.*}_intro.mp4"; fi

W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width  -of csv=p=0 "$VIDEO" | tr -dc '0-9')
H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$VIDEO" | tr -dc '0-9')
FPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$VIDEO" | head -1)
HASA=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$VIDEO" | head -1)

if [ "$H" -gt "$W" ]; then
  INTRO="$PIPE/logo_intro_9x16.mp4"; [ "${INTRO_FLASH:-}" = "1" ] && INTRO="$PIPE/logo_intro_flash_9x16.mp4"
else
  INTRO="$PIPE/logo_intro_16x9.mp4"
fi
[ -f "$INTRO" ] || { echo "Intro not found: $INTRO — render it first (see header)."; exit 1; }

echo "Target ${W}x${H} @ ${FPS} | intro: $(basename "$INTRO") | out: $OUT"
TMP=$(mktemp -d)
VF_FIT="scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=white,setsar=1,fps=${FPS}"
VF_FILL="scale=${W}:${H},setsar=1,fps=${FPS}"
ENC=(-c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -c:a aac -ar 44100 -ac 2)

# normalise the intro (always has audio)
ffmpeg -y -i "$INTRO" -vf "$VF_FIT" "${ENC[@]}" "$TMP/a.mp4" 2>/dev/null
# normalise the target (add a silent track if it has no audio, so concat stays aligned)
if [ -n "$HASA" ]; then
  ffmpeg -y -i "$VIDEO" -vf "$VF_FILL" "${ENC[@]}" "$TMP/b.mp4" 2>/dev/null
else
  ffmpeg -y -i "$VIDEO" -f lavfi -i anullsrc=r=44100:cl=stereo -map 0:v -map 1:a -shortest -vf "$VF_FILL" "${ENC[@]}" "$TMP/b.mp4" 2>/dev/null
fi

printf "file '%s'\nfile '%s'\n" "$TMP/a.mp4" "$TMP/b.mp4" > "$TMP/list.txt"
ffmpeg -y -f concat -safe 0 -i "$TMP/list.txt" -c copy -movflags +faststart "$OUT" 2>/dev/null
rm -rf "$TMP"
echo "✅ Done → $OUT"
