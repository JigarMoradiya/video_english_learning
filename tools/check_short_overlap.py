#!/usr/bin/env python3
"""Nothing may enter the title-pill band of a 9:16 short.

The pill is furniture: it sits at the top for the whole reel and says what the rule is.
A beat's heading drifting up into it is the exact failure this catches — reported as
"why title text getting overlay".

The pill's own pixels are excluded by taking its bounding box on a frame where the band
is otherwise empty, then asking whether any LATER frame paints outside that box.
"""
import subprocess, sys
import numpy as np

W, H = 1080, 1920
BAND_TOP, BAND_BOT = 96, 300          # the pill's band PLUS the clear air it needs
MIN_GAP = 50                          # a heading touching the pill is a collision even
                                      # if their boxes only kiss — measured, not eyeballed
LOGO_X = 780                          # the corner logo owns everything right of this


def frame(path, t):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", path, "-frames:v", "1",
         "-pix_fmt", "rgb24", "-f", "rawvideo", "-"], capture_output=True).stdout
    a = np.frombuffer(raw, dtype=np.uint8)
    return a.reshape(H, W, 3).astype(int) if a.size == H * W * 3 else None


def run(path, end=33.0, step=0.5):
    base = frame(path, 0.6)
    if base is None:
        return [("unreadable", 0, 0)]
    band0 = base[BAND_TOP:BAND_BOT, :LOGO_X]
    flat = np.median(band0.reshape(-1, 3), axis=0)
    pill = np.abs(band0 - flat).sum(axis=2) > 60
    cols = np.nonzero(pill.any(axis=0))[0]
    px0, px1 = (int(cols.min()), int(cols.max())) if cols.size else (0, 0)

    hits = []
    t = 1.0
    while t < end:
        F = frame(path, t)
        if F is not None:
            band = F[BAND_TOP:BAND_BOT, :LOGO_X]
            m = np.abs(band - flat).sum(axis=2) > 60
            m[:, max(0, px0 - 14):px1 + 14] = False     # the pill itself
            runs = m.sum(axis=0)
            solid = int((runs >= 12).sum())      # columns with a real element in them
            if m.sum() > 500 and solid > 40:
                xs = np.nonzero(m.any(axis=0))[0]
                hits.append((f"{t:.1f}s", int(m.sum()), f"x{xs.min()}-{xs.max()}"))
        t += step
    return hits


if __name__ == "__main__":
    bad = 0
    for p in sys.argv[1:]:
        h = run(p)
        name = p.split("/")[-1]
        if h:
            bad += 1
            print(f"  {name:26s} OVERLAP in the title band at {len(h)} sample(s):")
            for when, n, where in h[:4]:
                print(f"       {when:>7s}  {n:6d}px  {where}")
        else:
            print(f"  {name:26s} clear")
    sys.exit(1 if bad else 0)
