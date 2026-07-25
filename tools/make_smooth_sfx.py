#!/usr/bin/env python3
"""Smooth, ear-friendly SFX for the Letter Recognition video (pure stdlib).
  - swoosh_soft : gentle airy woosh for the letter-move (heavily low-passed noise +
                  a soft low sine glide, smooth raised-sine envelope) — no harsh 'shh'.
  - chime_soft  : warm mellow ascending chime for the start — soft bells, long decay,
                  gentle attack (replaces the tense drumroll).
Writes .wav then converts to .mp3 via ffmpeg into public/sfx/.
"""
import math, os, random, struct, wave, subprocess

SR = 44100
random.seed(11)


def write_wav(path, samples):
    peak = max(1e-6, max(abs(s) for s in samples))
    gain = 0.85 / peak
    frames = bytearray()
    for s in samples:
        v = int(max(-1.0, min(1.0, s * gain)) * 32767)
        frames += struct.pack("<h", v)
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(bytes(frames))


def make_swoosh_soft():
    dur = 0.5
    n = int(dur * SR)
    out = [0.0] * n
    prev = 0.0
    for i in range(n):
        t = i / SR
        x = t / dur
        white = random.uniform(-1, 1)
        prev = prev * 0.965 + white * 0.035  # heavy low-pass → airy, not hissy
        env = math.sin(math.pi * x) ** 1.6   # smooth in AND out, no transient
        # warm low sine glide under the air
        glide = 200 + 180 * x
        body = 0.35 * math.sin(2 * math.pi * glide * t)
        out[i] = (prev * 3.2 + body) * env * 0.5
    return out


def soft_bell(freq, dur, amp):
    n = int(dur * SR)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        env = math.exp(-3.0 * t)          # long, gentle decay
        if t < 0.02:
            env *= t / 0.02               # soft attack (no click)
        s = math.sin(2 * math.pi * freq * t)
        s += 0.28 * math.sin(2 * math.pi * freq * 2.0 * t)  # mild, warm overtone
        out[i] = amp * env * s
    return out


def make_chime_soft():
    notes = [523.25, 659.25, 783.99, 1046.5]  # C5 E5 G5 C6 — warm major
    step = 0.11
    total = int((step * len(notes) + 0.9) * SR)
    out = [0.0] * total
    for k, f in enumerate(notes):
        part = soft_bell(f, 0.9, 0.5)
        s0 = int(k * step * SR)
        for i, v in enumerate(part):
            if s0 + i < total:
                out[s0 + i] += v
    return out


os.makedirs("public/sfx", exist_ok=True)
for name, fn in [("swoosh_soft", make_swoosh_soft), ("chime_soft", make_chime_soft)]:
    wav = f"public/sfx/{name}.wav"
    mp3 = f"public/sfx/{name}.mp3"
    write_wav(wav, fn())
    subprocess.run(["ffmpeg", "-y", "-i", wav, mp3], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    os.remove(wav)
    print(f"wrote {mp3}")
