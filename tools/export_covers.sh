#!/usr/bin/env bash
# Export a cover still for every 9:16 reel composition.
#
#   bash tools/export_covers.sh              # all reels
#   bash tools/export_covers.sh letter-      # only ids containing "letter-"
#   FORCE=1 bash tools/export_covers.sh      # re-export even if the png exists
#
# Instagram shows the cover in the grid and YouTube Shorts uses it as the poster, so
# every reel needs one. Frame 0 of every reel is already REQUIRED to be a finished
# cover (repo rule: no element mid-spring at frame 0, or the cover is incomplete), so
# this is an export, not a design job — which is why it can be a loop and not 42
# hand-made stills.
#
# Reads the composition list from Remotion itself rather than parsing src/reels/index.ts,
# so a reel added to the registry is picked up here with no change to this script.
set -euo pipefail
cd "$(dirname "$0")/.."

FILTER="${1:-}"
OUT=out/covers
mkdir -p "$OUT"

# `remotion compositions` prints:  <id>  <fps>  <WxH>  <frames> (<sec>)
# stills print "Still" in place of the frame count and must be skipped — a cover of a
# thumbnail is meaningless.
ids=$(npx remotion compositions 2>/dev/null \
  | awk '$0 ~ /1080x1920/ && $0 !~ /Still/ {print $1}' \
  | { [ -n "$FILTER" ] && grep -- "$FILTER" || cat; })

if [ -z "$ids" ]; then
  echo "no 9:16 video compositions matched${FILTER:+ filter '$FILTER'}"
  exit 1
fi

total=$(echo "$ids" | wc -l | tr -d ' ')
n=0; made=0; skipped=0
echo "── $total reel(s) ──"

for id in $ids; do
  n=$((n + 1))
  png="$OUT/${id}.png"
  if [ -f "$png" ] && [ -z "${FORCE:-}" ]; then
    skipped=$((skipped + 1))
    printf "  [%2d/%d] %-26s skip (exists)\n" "$n" "$total" "$id"
    continue
  fi
  # --frame=0 is the point: the cover IS the first frame, not a chosen moment
  npx remotion still "$id" "$png" --frame=0 >/dev/null 2>&1
  sz=$(ffprobe -v error -show_entries stream=width,height -of csv=p=0 "$png" 2>/dev/null || echo "?")
  made=$((made + 1))
  printf "  [%2d/%d] %-26s %s\n" "$n" "$total" "$id" "$sz"
done

echo "── $made exported, $skipped skipped -> $OUT ──"

# A cover that is a flat colour means frame 0 is empty or mid-fade — the reel opens on
# nothing, which the repo rule exists to prevent. Cheap to detect, so always check.
echo "checking for blank covers…"
blank=0
for png in "$OUT"/*.png; do
  [ -f "$png" ] || continue
  # count distinct colours in a downscaled copy; a real cover has many
  colours=$(ffmpeg -v error -i "$png" -vf "scale=60:-1,format=rgb24" -f rawvideo - 2>/dev/null \
    | od -An -tx1 -v | tr -s ' ' '\n' | sort -u | wc -l | tr -d ' ')
  if [ "${colours:-0}" -lt 12 ]; then
    echo "  BLANK-ish: $(basename "$png") ($colours distinct byte values) — check frame 0"
    blank=$((blank + 1))
  fi
done
[ "$blank" -eq 0 ] && echo "  all covers have real content" || echo "  $blank suspicious cover(s)"
