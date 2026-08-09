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
#   sh tools/render.sh vedaavi-intro-16x9     out/vedaavi_intro_16x9.mp4
#   sh tools/render.sh vedaavi-intro-4x5      out/vedaavi_intro_4x5.mp4
#   sh tools/render.sh vedaavi-intro-9x16     out/vedaavi_intro_9x16.mp4
#
# The aspect is matched EXACTLY, not just by orientation: 4:5 and 9:16 are both portrait
# and a 9:16 sting letterboxed into a 4:5 frame would open the video with two grey bars.
set -euo pipefail
PIPE="/Users/jigarmoradiya/Documents/newProject/eng/video-pipeline/out"
MINT="#DBF3D0"   # the intro's own background, so any pad blends instead of flashing white

VIDEO="${1:-}"
[ -z "$VIDEO" ] && { echo "Usage: bash add_intro.sh <video.mp4> [output.mp4]"; exit 1; }
[ -f "$VIDEO" ] || { echo "Video not found: $VIDEO"; exit 1; }
if [ "${2:-}" != "" ]; then OUT="$2"; else DIR=$(dirname "$VIDEO"); B=$(basename "$VIDEO"); OUT="$DIR/${B%.*}_intro.mp4"; fi

W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width  -of csv=p=0 "$VIDEO" | tr -dc '0-9')
H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$VIDEO" | tr -dc '0-9')
# ffprobe can emit a trailing comma on this query, and `fps=30/1,` makes an EMPTY
# filter at the end of the chain ("No such filter: ''"). Keep digits and the slash only.
FPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$VIDEO" | head -1 | tr -dc '0-9/')
HASA=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$VIDEO" | head -1)

# pick the sting whose aspect ratio is closest to the target's, so nothing is ever padded
RATIO=$(awk -v w="$W" -v h="$H" 'BEGIN{printf "%.4f", w/h}')
BEST=""; BESTD=""
for CAND in 16x9:1.7778 4x5:0.8000 9x16:0.5625; do
  NAME="${CAND%%:*}"; R="${CAND##*:}"
  [ -f "$PIPE/vedaavi_intro_${NAME}.mp4" ] || continue
  D=$(awk -v a="$RATIO" -v b="$R" 'BEGIN{d=a-b; if(d<0)d=-d; printf "%.4f", d}')
  if [ -z "$BESTD" ] || [ "$(awk -v x="$D" -v y="$BESTD" 'BEGIN{print (x<y)?1:0}')" = "1" ]; then
    BEST="$NAME"; BESTD="$D"
  fi
done
[ -n "$BEST" ] || { echo "No vedaavi_intro_*.mp4 in $PIPE — render one first (see header)."; exit 1; }
INTRO="$PIPE/vedaavi_intro_${BEST}.mp4"
[ -n "${INTRO_OVERRIDE:-}" ] && INTRO="$INTRO_OVERRIDE"
[ -f "$INTRO" ] || { echo "Intro not found: $INTRO — render it first (see header)."; exit 1; }

echo "Target ${W}x${H} @ ${FPS} | intro: $(basename "$INTRO") | out: $OUT"
VF_FIT="scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=${MINT},setsar=1,fps=${FPS}"
VF_FILL="scale=${W}:${H},setsar=1,fps=${FPS}"
ENC=(-c:v libx264 -preset veryfast -crf 16 -pix_fmt yuv420p -g 60 -c:a aac -ar 44100 -ac 2 -movflags +faststart)

# SINGLE-PASS concat (intro first, then video). One re-encode regenerates continuous
# timestamps from PTS 0, so the first VIDEO frame is at 0 and lines up with the audio.
# (The old two-step "normalise each → concat -c copy" kept the intro's B-frame offset,
#  which put the first frame at ~0.023s while audio started at 0 → a BLACK FLASH on
#  open in many players. Never go back to -c copy here.)
if [ -n "$HASA" ]; then
  ffmpeg -hide_banner -loglevel error -y -i "$INTRO" -i "$VIDEO" -filter_complex \
    "[0:v]${VF_FIT}[v0];[1:v]${VF_FILL}[v1];[0:a]aresample=44100[a0];[1:a]aresample=44100[a1];[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]" \
    -map "[v]" -map "[a]" "${ENC[@]}" "$OUT"
else
  VDUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VIDEO")
  ffmpeg -hide_banner -loglevel error -y -i "$INTRO" -i "$VIDEO" -f lavfi -t "$VDUR" -i anullsrc=r=44100:cl=stereo -filter_complex \
    "[0:v]${VF_FIT}[v0];[1:v]${VF_FILL}[v1];[0:a]aresample=44100[a0];[2:a]aresample=44100[a1];[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]" \
    -map "[v]" -map "[a]" "${ENC[@]}" "$OUT"
fi
V0=$(ffprobe -v error -select_streams v:0 -show_entries frame=pts_time -of csv=p=0 -read_intervals '%+#1' "$OUT")
echo "✅ Done → $OUT  (first video frame pts=${V0}; must be 0.000000 = no black on open)"
