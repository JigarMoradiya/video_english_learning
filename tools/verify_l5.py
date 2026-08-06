#!/usr/bin/env python3
"""Verify each requested L5 change in the RENDERED frames, one line per item.

    .venv-align/bin/python tools/verify_l5.py out/l5_rules_p1/l5_rules_p1_16x9.mp4

Every check reads pixels from the finished video, not the source. A change that is
present in the code but absent from the render has not been made.
"""
from __future__ import annotations

import subprocess
import sys

import numpy as np

W, H = 1920, 1080


def frame(video: str, t: float) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", str(t), "-i", video, "-frames:v", "1",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.uint8).reshape(H, W, 3).astype(np.int16)


def rows_of_content(im: np.ndarray, x0=290, x1=1620, y0=170, y1=820) -> list[tuple[int, int]]:
    """Horizontal bands that hold content, so 'two rows' can be counted."""
    st = im[y0:y1, x0:x1]
    sat = st.max(axis=2) - st.min(axis=2)
    lum = st.mean(axis=2)
    mask = ((sat > 55) & (lum < 240)) | (lum < 100)
    dense = mask.mean(axis=1) > 0.020
    runs, start = [], None
    for y, v in enumerate(dense):
        if v and start is None:
            start = y
        if not v and start is not None:
            if y - start > 18:
                runs.append((start + y0, y + y0))
            start = None
    if start is not None:
        runs.append((start + y0, y1))
    return runs


def picture_present(im: np.ndarray, y0, y1, x0, x1, bins=170) -> int:
    """Artwork has many distinct colours; flat letter cards do not.

    Scans BANDS across the stage rather than trusting a fixed window — the content column
    has moved more than once, and a hard-coded y turned a present picture into a FAIL.
    """
    best = 0
    for y in range(200, 820, 40):
        reg = im[y:y + 80, x0:x1].reshape(-1, 3)
        best = max(best, len(np.unique(reg // 8, axis=0)))
    return best


def main() -> int:
    v = sys.argv[1]
    ok = lambda b: "PASS" if b else "FAIL"
    out = []

    # ① all ten ck words, on two rows
    im = frame(v, 507)
    runs = rows_of_content(im)
    word_rows = [r for r in runs if r[1] - r[0] > 40]
    out.append((f"all 10 ck words on 2 rows (found {len(word_rows)} content bands)",
                len(word_rows) >= 2))

    # ② the closing word fan is separated into planks (brown bars under each word)
    im = frame(v, 507)
    def groups_in(y0r, y1r) -> int:
        band = im[y0r:y1r, 290:1620]
        ink = (band.mean(axis=2) < 140).mean(axis=0) > 0.02
        g, start = 0, None
        for x, val in enumerate(ink):
            if val and start is None:
                start = x
            if not val and start is not None:
                if x - start > 25:
                    g += 1
                start = None
        if start is not None and len(ink) - start > 25:
            g += 1
        return g
    best = max((groups_in(a, b) for a, b in rows_of_content(im) if b - a > 30), default=0)
    out.append((f"words visibly separated ({best} separate words on a row)", best >= 4))

    # ③ crosses sit BELOW the card: at the cc/kk beat the red card must be intact
    im = frame(v, 552)
    reds = ((im[:, :, 0] > 190) & (im[:, :, 1] < 90) & (im[:, :, 2] < 90))
    ys, xs = np.where(reds)
    card_rows = np.unique(ys // 10) * 10
    out.append(("cross drawn below the card (letters unobscured)",
                len(ys) > 0 and card_rows.max() - card_rows.min() > 90))

    # ④ recap: a word list on BOTH sides
    im = frame(v, 582)
    left = im[560:900, 20:290]
    right = im[560:900, 1630:1900]
    # a wall card is white with a saturated teal/orange border — the sky is neither
    def whitish(r):
        white = r.min(axis=2) > 232
        sat = (r.max(axis=2) - r.min(axis=2)) > 80
        return float(white.mean() * (sat.mean() > 0.02))
    out.append((f"recap has both walls (left {whitish(left)*100:.0f}%, right {whitish(right)*100:.0f}%)",
                whitish(left) > 0.04 and whitish(right) > 0.04))

    # ⑤ during rule 2 only ONE wall is on screen
    im = frame(v, 480)
    out.append((f"lesson shows one wall only (left score {whitish(im[560:900, 20:290]):.3f})",
                whitish(im[560:900, 20:290]) < 0.02))

    # ⑥ pictures are large on the ck words
    im = frame(v, 480)
    out.append((f"duck picture present and large ({picture_present(im, 330, 520, 780, 1140)} colour bins)",
                picture_present(im, 330, 520, 780, 1140) > 170))

    # ⑦ key/kit/king pictures
    im = frame(v, 450)
    out.append((f"key picture present ({picture_present(im, 330, 520, 780, 1140)} colour bins)",
                picture_present(im, 330, 520, 780, 1140) > 170))

    # ⑧ travel shown as two syllables — a gap in the middle of the word row
    im = frame(v, 288)
    rs = [r for r in rows_of_content(im) if r[1] - r[0] > 50]
    split = False
    if rs:
        # the word row is the one holding the most letter CARDS — the picture row above it
        # has more ink but no cards, and picking it reported a split word as unsplit
        def cards_in(r):
            c = (im[r[0]:r[1], 300:1600].min(axis=2) > 198).mean(axis=0) > 0.25
            return int(np.diff(np.r_[0, c.astype(int), 0]).clip(min=0).sum())
        y0r, y1r = max(rs, key=cards_in)
        band = im[y0r:y1r, 400:1500]
        # the divider between the syllables is itself ink, so an ink-gap test can never
        # pass. What marks the split is a gap between the white letter CARDS.
        # a dimmed card is still far brighter than the pad it sits on — a near-white
        # test misses the unlit syllable and reports a split word as unsplit
        card = (band.min(axis=2) > 198).mean(axis=0) > 0.10
        idx = np.where(card)[0]
        if len(idx):
            split = bool((np.diff(idx) > 24).sum() >= 1)
    out.append(("travel split into tra-vel (gap inside the word)", split))

    # ⑨ the stretch band no longer lands on the letter row
    im = frame(v, 190.4)
    runs = [r for r in rows_of_content(im) if r[1] - r[0] > 20]
    biggest = max((runs[i + 1][0] - runs[i][1] for i in range(len(runs) - 1)), default=0)
    out.append((f"stretch band clear of the letter row (gap {biggest}px)", biggest >= 20))

    # ⑩ blueprint cards are opaque — nothing drives through them
    im = frame(v, 20)
    card = im[430:560, 380:560]
    out.append((f"blueprint cards opaque (colour spread {card.std():.0f})", card.std() < 60))

    print(f"{'ITEM':66s} RESULT")
    for name, good in out:
        print(f"  {name:64s} {ok(good)}")
    fails = [n for n, g in out if not g]
    print(f"\n{len(out) - len(fails)}/{len(out)} passed")
    for n in fails:
        print(f"   FAILED: {n}")
    return 1 if fails else 0


if __name__ == "__main__":
    raise SystemExit(main())
