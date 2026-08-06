#!/usr/bin/env python3
"""Smooth, ear-friendly SFX for the letter shorts (pure stdlib).
  - swoosh_soft : gentle airy woosh for the letter-move (low-passed noise + soft glide).
  - chime_soft  : soft POSITIVE SHIMMER for the start cue.

FINGERPRINT NOTE (2026-08-05): chime_soft used to be a C5-E5-G5-C6 bell arpeggio — a
literal little melody, which Facebook's fingerprinter matched to its licensed-music
catalog and geo-muted the reel (same false-positive family as the music bed). Silent +
voice-only test versions came back clean, isolating it to the tonal SFX. So chime_soft
is now NON-TONAL: bright filtered noise + a soft warm body, swelling in and shimmering
out — reads as a gentle positive cue but has no notes/melody to fingerprint.
Do NOT reintroduce pitched note sequences here.
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


def write_wav_rms(path, samples, target_dbfs):
    """Normalise to a target RMS (dBFS) so a non-tonal replacement matches the loudness
    of the tonal original it replaces — no reel needs re-balancing."""
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
        glide = 200 + 180 * x
        body = 0.35 * math.sin(2 * math.pi * glide * t)
        out[i] = (prev * 3.2 + body) * env * 0.5
    return out


def make_chime_soft():
    """Non-tonal positive shimmer (no notes): bright noise + a soft warm body, a gentle
    bloom in and a long soft shimmer out."""
    dur = 0.95
    n = int(dur * SR)
    br = bright_noise(n, 0.18)
    body = [0.0] * n
    lp = 0.0
    for i in range(n):
        w = random.uniform(-1, 1)
        lp += 0.02 * (w - lp)   # warm low body
        body[i] = lp
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        x = t / dur
        env = min(1.0, x / 0.18) * ((1.0 - x) ** 1.2)  # bloom in, shimmer out
        fl = 0.6 + 0.4 * math.sin(2 * math.pi * 17 * t)  # slow sparkle life (sub-audio flutter)
        out[i] = (br[i] * 0.8 * fl + body[i] * 1.6) * env
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


emit("swoosh_soft", make_swoosh_soft())
emit("chime_soft", make_chime_soft(), target_dbfs=-14.9)  # matches the old tonal level
