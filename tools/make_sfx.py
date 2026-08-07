#!/usr/bin/env python3
"""Original, royalty-free kid-friendly sound effects (pure stdlib, no numpy).

FINGERPRINT NOTE (2026-08-05): sparkle/twinkle/correct/tick used to be little bell
ARPEGGIOS (e.g. sparkle = C6-E6-G6-C7). Those melodies are exactly what Facebook's
audio fingerprinter matched to its licensed-music catalog → "muted in certain
countries" on the reels. Silent + voice-only test renders were clean, isolating the
flag to these tonal SFX. They are now NON-TONAL: bright filtered-noise shimmer with a
glinting flutter — sounds sparkly/positive but has no notes/melody to fingerprint, and
is RMS-matched to the old levels so no reel needs re-balancing.

The remaining tonal SFX (question/brave/blend/pop/boing) are only used in the long-form
lesson videos, not the daily posts; leave them for now, and de-tonalise them the same way
if those ever get flagged. Do NOT add pitched note sequences to the posted-video SFX.
"""

import math
import os
import random
import struct
import subprocess
import wave

SR = 44100
random.seed(7)


def env_ad(i, n, attack=0.01, release=0.25):
    t = i / SR
    total = n / SR
    if t < attack:
        return t / attack
    x = (t - attack) / max(1e-6, (total - attack))
    return max(0.0, (1.0 - x)) ** 1.4


def write_wav(path, samples):
    peak = max(1e-6, max(abs(s) for s in samples))
    gain = 0.9 / peak
    frames = bytearray()
    for s in samples:
        frames += struct.pack("<h", int(max(-1.0, min(1.0, s * gain)) * 32767))
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(bytes(frames))


def write_wav_rms(path, samples, target_dbfs):
    """Normalise to a target RMS (dBFS), so a non-tonal replacement matches the loudness
    of the tonal original — no reel needs re-balancing."""
    rms = (sum(s * s for s in samples) / max(1, len(samples))) ** 0.5
    g = (10 ** (target_dbfs / 20.0)) / max(1e-9, rms)
    peak = max(1e-9, max(abs(s * g) for s in samples))
    if peak > 0.98:
        g *= 0.98 / peak
    frames = bytearray()
    for s in samples:
        frames += struct.pack("<h", int(max(-1.0, min(1.0, s * g)) * 32767))
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(bytes(frames))


def bright_noise(n, lp_a=0.16):
    """Bright (high-passed) noise: white minus a one-pole low-pass of itself."""
    out = [0.0] * n
    lp = 0.0
    for i in range(n):
        w = random.uniform(-1, 1)
        lp += lp_a * (w - lp)
        out[i] = w - lp
    return out


# ── NON-TONAL replacements (posted videos) ───────────────────────────────────
def make_sparkle():
    """Magical shimmer: bright noise with a glinting flutter, quick attack, shimmer decay."""
    dur = 0.85
    n = int(dur * SR)
    br = bright_noise(n, 0.14)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        x = t / dur
        fl = (0.5 + 0.5 * math.sin(2 * math.pi * 43 * t)) \
            * (0.5 + 0.5 * math.sin(2 * math.pi * 71 * t + 1.3)) \
            * (0.6 + 0.4 * math.sin(2 * math.pi * 113 * t + 0.6))
        env = min(1.0, x / 0.02) * ((1.0 - x) ** 1.5)
        out[i] = br[i] * (0.25 + 0.75 * fl) * env
    return out


def make_twinkle():
    """Cute quick twinkle: three tiny bright noise grains."""
    dur = 0.35
    n = int(dur * SR)
    br = bright_noise(n, 0.10)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        g = sum(math.exp(-((t - c) ** 2) / (2 * 0.020 ** 2)) for c in (0.03, 0.13, 0.23))
        fl = 0.5 + 0.5 * math.sin(2 * math.pi * 90 * t)
        out[i] = br[i] * g * (0.4 + 0.6 * fl)
    return out


def make_correct():
    """Positive 'success' shimmer: two bright grains (2nd a touch louder) + a soft tail."""
    dur = 0.5
    n = int(dur * SR)
    br = bright_noise(n, 0.12)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        x = t / dur
        g = sum((0.8 + 0.4 * k) * math.exp(-((t - c) ** 2) / (2 * 0.030 ** 2))
                for k, c in enumerate((0.02, 0.12)))
        tail = ((1.0 - x) ** 1.4) * (0.5 + 0.5 * math.sin(2 * math.pi * 61 * t)) * 0.25
        fl = 0.5 + 0.5 * math.sin(2 * math.pi * 80 * t)
        out[i] = br[i] * (g * (0.5 + 0.5 * fl) + tail)
    return out


def make_tick():
    """Soft short bright blip (non-tonal click)."""
    dur = 0.14
    n = int(dur * SR)
    br = bright_noise(n, 0.10)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        env = math.exp(-38 * t) * min(1.0, t / 0.002)
        out[i] = br[i] * env
    return out


def make_drop():
    """Soft NON-TONAL 'landing' thump — warm low-passed noise, fast decay. For the
    intro's letter drops (no pitch/melody → never fingerprint-matched)."""
    dur = 0.16
    n = int(dur * SR)
    out = [0.0] * n
    lp = 0.0
    for i in range(n):
        t = i / SR
        lp += 0.05 * (random.uniform(-1, 1) - lp)   # heavy low-pass = warm thump, no pitch
        env = math.exp(-40 * t) * min(1.0, t / 0.0015)
        out[i] = lp * env
    return out


def make_riser():
    """Smooth NON-TONAL riser/swell for a logo reveal — 2-pole low-passed noise whose
    brightness opens and amplitude swells on a raised cosine, then eases off. Feels
    cinematic + smooth, but has no pitch/melody (~1.8s) so it can't be fingerprinted."""
    dur = 1.8
    n = int(dur * SR)
    out = [0.0] * n
    l1 = l2 = 0.0
    for i in range(n):
        x = i / n
        a = 0.006 + 0.10 * (x ** 1.5)             # filter opens over time (dark → airy)
        w = random.uniform(-1, 1)
        l1 += a * (w - l1); l2 += a * (l1 - l2)   # 2-pole = smooth, never hissy
        env = 0.5 - 0.5 * math.cos(math.pi * min(1.0, x / 0.9))   # smooth swell up to 90%
        if x > 0.9:
            env *= 1.0 - (x - 0.9) / 0.1 * 0.55                   # gentle ease after the peak
        out[i] = (l1 - l2) * env * 3.0
    return out


# ── tonal SFX kept for the long-form lesson videos (not the daily posts) ──────
def make_question():
    dur = 0.5
    n = int(dur * SR)
    out = [0.0] * n
    f0, f1 = 340.0, 880.0
    for i in range(n):
        t = i / SR
        frac = t / dur
        f = f0 + (f1 - f0) * (frac ** 0.7)
        vib = 1 + 0.02 * math.sin(2 * math.pi * 6 * t)
        s = math.sin(2 * math.pi * f * vib * t) + 0.3 * math.sin(2 * math.pi * f * 2 * t)
        out[i] = s * env_ad(i, n, attack=0.015, release=0.3) * 0.8
    return out


def bell(freq, dur, amp):
    n = int(dur * SR)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        env = math.exp(-5.0 * t)
        if t < 0.004:
            env *= t / 0.004
        s = math.sin(2 * math.pi * freq * t) + 0.5 * math.sin(2 * math.pi * freq * 2.01 * t) + 0.25 * math.sin(2 * math.pi * freq * 3.0 * t)
        out[i] = amp * env * s
    return out


def saw_note(freq, dur, amp, decay=3.0):
    n = int(dur * SR)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        env = math.exp(-decay * t)
        if t < 0.006:
            env *= t / 0.006
        s = sum((1.0 / h) * math.sin(2 * math.pi * freq * h * t) for h in range(1, 7))
        out[i] = amp * env * s
    return out


def make_brave():
    total = int(0.65 * SR)
    out = [0.0] * total
    for f, start, dur in [(392.0, 0.0, 0.18), (523.25, 0.12, 0.55)]:
        part = saw_note(f, dur + 0.1, 0.5, decay=4.0)
        s0 = int(start * SR)
        for i, v in enumerate(part):
            if s0 + i < total:
                out[s0 + i] += v
    for i, v in enumerate(bell(1046.5, 0.4, 0.15)):
        j = int(0.12 * SR) + i
        if j < total:
            out[j] += v
    return out


def make_pop():
    dur = 0.13
    n = int(dur * SR)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        f = 950 * (1 - 0.55 * (t / dur))
        out[i] = math.sin(2 * math.pi * f * t) * math.exp(-30 * t) * 0.9
    return out


def make_boing():
    dur = 0.35
    n = int(dur * SR)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        f = 260 + 200 * math.sin(2 * math.pi * 7 * t) * math.exp(-4 * t)
        env = math.exp(-5 * t)
        if t < 0.005:
            env *= t / 0.005
        out[i] = math.sin(2 * math.pi * f * t) * env * 0.85
    return out


def make_drumroll():
    dur = 1.0
    n = int(dur * SR)
    out = [0.0] * n
    prev = 0.0
    for i in range(n):
        t = i / SR
        prev = prev * 0.6 + random.uniform(-1, 1) * 0.4
        rate = 12 + 34 * (t / dur)
        trem = 0.5 + 0.5 * math.sin(2 * math.pi * rate * t)
        out[i] = prev * trem * (0.18 + 0.6 * (t / dur))
    return out


def make_whoosh():
    dur = 0.4
    n = int(dur * SR)
    out = [0.0] * n
    prev = 0.0
    for i in range(n):
        prev = prev * 0.85 + random.uniform(-1, 1) * 0.15
        out[i] = prev * math.sin(math.pi * ((i / SR) / dur)) * 0.85
    return out


def make_blend():
    dur = 0.62
    n = int(SR * dur)
    out = [0.0] * n
    lp1 = lp2 = 0.0
    for i in range(n):
        x = i / n
        a = 0.03 + 0.22 * x
        lp1 += a * (random.uniform(-1, 1) - lp1)
        lp2 += a * (lp1 - lp2)
        env = 0.5 - 0.5 * math.cos(2 * math.pi * min(1.0, x * 1.05))
        out[i] += (lp1 - lp2) * env * 0.55
    start = int(n * 0.62)
    for freq, amp in ((659.25, 0.42), (830.61, 0.26), (1318.5, 0.12)):
        for i in range(n - start):
            k = i / SR
            e = math.exp(-k * 5.2) * min(1.0, i / (SR * 0.012))
            out[start + i] += math.sin(2 * math.pi * freq * k) * amp * e
    return out


os.makedirs("public/sfx", exist_ok=True)


def emit(name, samples, target_dbfs=None):
    wav = f"public/sfx/{name}.wav"
    mp3 = f"public/sfx/{name}.mp3"
    if target_dbfs is None:
        write_wav(wav, samples)
    else:
        write_wav_rms(wav, samples, target_dbfs)
    subprocess.run(["ffmpeg", "-y", "-i", wav, mp3], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    os.remove(wav)
    print(f"wrote {mp3}")


# Regenerate the NON-TONAL SFX used by the posted videos (RMS-matched to the old levels).
emit("sparkle", make_sparkle(), target_dbfs=-14.1)
emit("twinkle", make_twinkle(), target_dbfs=-12.3)
emit("correct", make_correct(), target_dbfs=-13.6)
emit("tick", make_tick(), target_dbfs=-8.8)
emit("drop", make_drop(), target_dbfs=-15.0)  # non-tonal landing thump for the intro
emit("riser", make_riser(), target_dbfs=-19.0)  # non-tonal smooth swell for the intro reveal
print("(tonal question/brave/blend/pop/boing/drumroll/whoosh left untouched — long-form only)")
