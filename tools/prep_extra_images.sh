#!/usr/bin/env bash
# Extract the extra example-word images into public/letters/<key>.png (largest PNG
# in each imageset). <key> = imageset name with punctuation stripped (x-ray→xray).
set -euo pipefail
cd "$(dirname "$0")/.."
IOS="/Users/jigarmoradiya/Documents/newProject/eng/iOS"
OUT="public/letters"

WORDS="apple alligator ambulance axe ball bear banana bus car cake cow corn dog duck deer door \
egg envelope eagle ear frog fan fox flower girl gift grapes guitar house hand hammer hen \
igloo insect iron ice jam jug jacket jeep kite key king koala leaf lamp lemon lock moon mouse \
mango map nose net neck nurse octopus ostrich owl onion pig pen panda pear quilt quail quill \
qtip rabbit rainbow robot rocket snake star spoon snail train tomato tree turtle unicorn ufo \
uniform utensil violin vase volcano vulture wolf watch wand wheel x-ray taxi yak yarn yacht \
yo-yo zip zoo zero zucchini elbow nail notebook \
umpire unicycle vacuum vest volleyball yogurt yolk zinnia"

missing=""
for name in $WORDS; do
  key=$(echo "$name" | tr -d '[:punct:]' | tr '[:upper:]' '[:lower:]')
  dir=$(find "$IOS" -type d -iname "${name}.imageset" 2>/dev/null | head -1)
  if [ -z "$dir" ]; then missing="$missing $name"; continue; fi
  png=$(ls -S "$dir"/*.png 2>/dev/null | head -1)
  if [ -z "$png" ]; then missing="$missing $name"; continue; fi
  cp "$png" "$OUT/${key}.png"
done
echo "extra images now in $OUT — total pngs: $(ls "$OUT"/*.png | wc -l)"
[ -n "$missing" ] && echo "MISSING:$missing" || echo "all extra images found"
