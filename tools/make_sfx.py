#!/usr/bin/env python3
"""Generate original, royalty-free kid-friendly sound effects (pure stdlib, no numpy).
  - question.wav : a playful curious rising whoosh (for "how do you know?")
  - sparkle.wav  : a magical ascending twinkle/reveal (for "Here's the secret")
"""

import math
import os
import random
import struct
import wave

SR = 44100
random.seed(7)


def env_ad(i, n, attack=0.01, release=0.25):
    """Attack-decay envelope in [0,1]."""
    t = i / SR
    total = n / SR
    if t < attack:
        return t / attack
    # exponential-ish decay over the remainder
    x = (t - attack) / max(1e-6, (total - attack))
    return max(0.0, (1.0 - x)) ** 1.4


def write_wav(path, samples):
    peak = max(1e-6, max(abs(s) for s in samples))
    gain = 0.9 / peak
    frames = bytearray()
    for s in samples:
        v = int(max(-1.0, min(1.0, s * gain)) * 32767)
        frames += struct.pack("<h", v)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(frames))
    print(f"wrote {path} ({len(samples)/SR:.2f}s)")


def make_question():
    """~0.5s rising sine sweep with a little vibrato + a soft tail — 'wheee?'."""
    dur = 0.5
    n = int(dur * SR)
    out = [0.0] * n
    f0, f1 = 340.0, 880.0
    for i in range(n):
        t = i / SR
        frac = t / dur
        # ease-out rising frequency + gentle vibrato
        f = f0 + (f1 - f0) * (frac ** 0.7)
        vib = 1 + 0.02 * math.sin(2 * math.pi * 6 * t)
        s = math.sin(2 * math.pi * f * vib * t)
        s += 0.3 * math.sin(2 * math.pi * f * 2 * t)  # a little sparkle harmonic
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
        s = math.sin(2 * math.pi * freq * t)
        s += 0.5 * math.sin(2 * math.pi * freq * 2.01 * t)
        s += 0.25 * math.sin(2 * math.pi * freq * 3.0 * t)
        out[i] = amp * env * s
    return out


def make_sparkle():
    """Ascending magic arpeggio (C6 E6 G6 C7) + a shimmery high tail."""
    notes = [1046.5, 1318.5, 1568.0, 2093.0]
    step = 0.075  # seconds between notes
    total = int((step * len(notes) + 0.6) * SR)
    out = [0.0] * total
    for k, f in enumerate(notes):
        part = bell(f, 0.55, 0.5)
        start = int(k * step * SR)
        for i, v in enumerate(part):
            j = start + i
            if j < total:
                out[j] += v
    # shimmer tail: soft high twinkles
    for k in range(6):
        f = 2200 + k * 260
        part = bell(f, 0.25, 0.10)
        start = int((0.25 + k * 0.05) * SR)
        for i, v in enumerate(part):
            j = start + i
            if j < total:
                out[j] += v
    return out


def saw_note(freq, dur, amp, decay=3.0):
    """Brassy note (sum of harmonics) with a punchy decay."""
    n = int(dur * SR)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        env = math.exp(-decay * t)
        if t < 0.006:
            env *= t / 0.006
        s = 0.0
        for h in range(1, 7):
            s += (1.0 / h) * math.sin(2 * math.pi * freq * h * t)
        out[i] = amp * env * s
    return out


def make_brave():
    """Heroic little fanfare: quick G→C rise, brassy + confident (~0.6s)."""
    total = int(0.65 * SR)
    out = [0.0] * total
    seq = [(392.0, 0.0, 0.18), (523.25, 0.12, 0.55)]  # G4 grace → C5 punch
    for f, start, dur in seq:
        part = saw_note(f, dur + 0.1, 0.5, decay=4.0)
        s0 = int(start * SR)
        for i, v in enumerate(part):
            if s0 + i < total:
                out[s0 + i] += v
    # sparkle cap on the last note
    for i, v in enumerate(bell(1046.5, 0.4, 0.15)):
        j = int(0.12 * SR) + i
        if j < total:
            out[j] += v
    return out


def make_correct():
    """Bright cheerful two-note 'ding-ding' success (E6→A6) (~0.5s)."""
    total = int(0.55 * SR)
    out = [0.0] * total
    for k, f in enumerate([1318.5, 1760.0]):
        part = bell(f, 0.45, 0.5)
        s0 = int(k * 0.09 * SR)
        for i, v in enumerate(part):
            if s0 + i < total:
                out[s0 + i] += v
    return out


def make_pop():
    """Short tactile 'plink' with a downward pitch chirp (~0.13s)."""
    dur = 0.13
    n = int(dur * SR)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        f = 950 * (1 - 0.55 * (t / dur))
        env = math.exp(-30 * t)
        out[i] = math.sin(2 * math.pi * f * t) * env * 0.9
    return out


def make_boing():
    """Springy cartoon boing (~0.35s) — wobbling pitch."""
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
    """Accelerating suspense roll that rises in volume (~1.0s)."""
    dur = 1.0
    n = int(dur * SR)
    out = [0.0] * n
    prev = 0.0
    for i in range(n):
        t = i / SR
        white = random.uniform(-1, 1)
        prev = prev * 0.6 + white * 0.4  # soft lowpass
        rate = 12 + 34 * (t / dur)  # accelerating tremolo
        trem = 0.5 + 0.5 * math.sin(2 * math.pi * rate * t)
        vol = 0.18 + 0.6 * (t / dur)
        out[i] = prev * trem * vol
    return out


def make_whoosh():
    """Airy positive whoosh (~0.4s) — noise with a peak-in-the-middle envelope."""
    dur = 0.4
    n = int(dur * SR)
    out = [0.0] * n
    prev = 0.0
    for i in range(n):
        t = i / SR
        white = random.uniform(-1, 1)
        prev = prev * 0.85 + white * 0.15
        env = math.sin(math.pi * (t / dur))
        out[i] = prev * env * 0.85
    return out


def make_twinkle():
    """Cute quick high twinkle (~0.35s)."""
    total = int(0.35 * SR)
    out = [0.0] * total
    for k, f in enumerate([1568.0, 2093.0, 2637.0]):
        part = bell(f, 0.25, 0.4)
        s0 = int(k * 0.05 * SR)
        for i, v in enumerate(part):
            if s0 + i < total:
                out[s0 + i] += v
    return out


def make_tick():
    """Soft short bright blip for the recap chips (~0.18s)."""
    return bell(1318.5, 0.18, 0.5)


def make_blend():
    """~0.62s — three become one. A soft filtered-noise glide that RISES and closes into a
    warm two-note bell. Used where a word's letters merge, so it has to duck under the
    teacher rather than announce itself: gentle attack, no click, no transient snap.
    Self-synthesised like everything else here — no sampled audio anywhere in this project.
    """
    dur = 0.62
    n = int(SR * dur)
    out = [0.0] * n
    # the glide: band-passed noise whose centre sweeps up, fading as the bell arrives
    lp1 = lp2 = 0.0
    for i in range(n):
        x = i / n
        prev = random.uniform(-1, 1)
        # one-pole low-pass, cutoff rising with x — a smooth "shhhwoo", never a hiss
        a = 0.03 + 0.22 * x
        lp1 += a * (prev - lp1)
        lp2 += a * (lp1 - lp2)
        # in and out on a raised cosine, so neither end has an edge
        env = 0.5 - 0.5 * math.cos(2 * math.pi * min(1.0, x * 1.05))
        out[i] += (lp1 - lp2) * env * 0.55

    # the landing: a major third, struck softly at 62% and left to ring out
    start = int(n * 0.62)
    for freq, amp in ((659.25, 0.42), (830.61, 0.26), (1318.5, 0.12)):
        for i in range(n - start):
            k = i / SR
            e = math.exp(-k * 5.2) * min(1.0, i / (SR * 0.012))   # 12ms attack = no click
            out[start + i] += math.sin(2 * math.pi * freq * k) * amp * e
    return out


os.makedirs("public/sfx", exist_ok=True)
write_wav("public/sfx/blend.wav", make_blend())
write_wav("public/sfx/question.wav", make_question())
write_wav("public/sfx/sparkle.wav", make_sparkle())
write_wav("public/sfx/brave.wav", make_brave())
write_wav("public/sfx/correct.wav", make_correct())
write_wav("public/sfx/pop.wav", make_pop())
write_wav("public/sfx/boing.wav", make_boing())
write_wav("public/sfx/drumroll.wav", make_drumroll())
write_wav("public/sfx/whoosh.wav", make_whoosh())
write_wav("public/sfx/twinkle.wav", make_twinkle())
write_wav("public/sfx/tick.wav", make_tick())
