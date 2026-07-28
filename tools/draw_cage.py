"""Draws public/words/cage.png.

`cage` is the flagship ge word — it appears in the hook, the long-vowel case and the see-it
board — and there is no cage emoji. A bare bird glyph taught the word "bird", so the cage is
drawn here instead. Run: .venv-align/bin/python tools/draw_cage.py
"""
from PIL import Image, ImageDraw

S = 4            # supersample, then downscale, for smooth edges
W = H = 320
OUT = (74, 48, 32, 255)
BAR = (150, 104, 70, 255)
BRASS = (205, 160, 62, 255)
DOME = (193, 135, 92, 255)

im = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
d = ImageDraw.Draw(im)
sc = lambda *v: [x * S for x in v]

d.ellipse(sc(143, 8, 177, 42), outline=OUT, width=7 * S)                        # hanging ring
d.line(sc(160, 42, 160, 58), fill=OUT, width=7 * S)
d.pieslice(sc(52, 30, 268, 216), 180, 360, fill=DOME, outline=OUT, width=7 * S)  # dome
for x in range(80, 250, 24):                                                    # bars
    d.line(sc(x, 122, x, 252), fill=BAR, width=6 * S)
d.line(sc(60, 120, 60, 258), fill=OUT, width=8 * S)
d.line(sc(260, 120, 260, 258), fill=OUT, width=8 * S)
d.line(sc(60, 190, 260, 190), fill=BRASS, width=8 * S)                          # brass band
d.line(sc(96, 226, 224, 226), fill=BRASS, width=7 * S)                          # perch
d.ellipse(sc(132, 168, 198, 228), fill=(94, 196, 232, 255), outline=OUT, width=6 * S)
d.ellipse(sc(120, 150, 170, 198), fill=(126, 214, 244, 255), outline=OUT, width=6 * S)
d.polygon(sc(120, 174, 96, 182, 120, 190), fill=(245, 166, 60, 255))
d.ellipse(sc(137, 165, 150, 178), fill=OUT)
d.line(sc(152, 228, 152, 242), fill=(245, 166, 60, 255), width=6 * S)
d.rounded_rectangle(sc(42, 250, 278, 288), radius=15 * S, fill=DOME, outline=OUT, width=7 * S)
d.rounded_rectangle(sc(56, 288, 264, 308), radius=10 * S, fill=(169, 112, 74, 255), outline=OUT, width=7 * S)

im.resize((W, H), Image.LANCZOS).save("public/words/cage.png")
print("wrote public/words/cage.png")
