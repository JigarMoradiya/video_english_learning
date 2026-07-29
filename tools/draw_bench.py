"""Draws public/words/bench.png.

`chair` and `bench` both appear in the ch/tch video and both fell back to the same 🪑 emoji,
which teaches the child that the picture means "chair" in one place and "bench" in another.
There is no bench emoji, so it is drawn here. Run: .venv-align/bin/python tools/draw_bench.py
"""
from PIL import Image, ImageDraw

S = 4
W = H = 320
OUT = (74, 48, 32, 255)
WOOD = (196, 138, 92, 255)
WOOD2 = (168, 112, 70, 255)
IRON = (88, 96, 104, 255)

im = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
d = ImageDraw.Draw(im)
sc = lambda *v: [x * S for x in v]

# back slats
for y in (74, 116):
    d.rounded_rectangle(sc(58, y, 262, y + 30), radius=12 * S, fill=WOOD, outline=OUT, width=6 * S)
# back uprights
d.rounded_rectangle(sc(70, 60, 88, 176), radius=7 * S, fill=IRON, outline=OUT, width=5 * S)
d.rounded_rectangle(sc(232, 60, 250, 176), radius=7 * S, fill=IRON, outline=OUT, width=5 * S)
# seat
d.rounded_rectangle(sc(44, 166, 276, 200), radius=13 * S, fill=WOOD2, outline=OUT, width=6 * S)
d.line(sc(44, 183, 276, 183), fill=OUT, width=3 * S)
# armrests
d.rounded_rectangle(sc(36, 140, 62, 156), radius=8 * S, fill=IRON, outline=OUT, width=5 * S)
d.rounded_rectangle(sc(258, 140, 284, 156), radius=8 * S, fill=IRON, outline=OUT, width=5 * S)
# legs
for x in (62, 234):
    d.rounded_rectangle(sc(x, 196, x + 22, 268), radius=8 * S, fill=IRON, outline=OUT, width=5 * S)
# ground shadow
d.ellipse(sc(52, 258, 268, 292), fill=(120, 96, 72, 60))
im.resize((W, H), Image.LANCZOS).save("public/words/bench.png")
print("wrote public/words/bench.png")
