#!/usr/bin/env python3
"""VEDAAVI intro sting — a warm, SMOOTH, kids-friendly reveal chime (pure stdlib).

WHY THIS FILE EXISTS
  The intro used to play `sfx/riser.mp3` + `sfx/sparkle.mp3` — both NON-TONAL
  filtered noise. The user's feedback: "sound is not smooth, not kids friendly,
  it hits on ear — we need smooth like cocomelon." Filtered noise hisses and the
  bright-noise sparkle fizzes; neither is warm.

THE FIX — same "bloom, don't strike" trick that fixed the music bed (make_music.py
v4 -> v5). A "hit" is an attack transient; if a note reaches full volume in a few
ms the ear reads a strike. Every note here fades IN over ~0.32s on a raised-cosine
curve (zero slope at both ends) so there is NO transient — the note blooms out of
the wash and sinks back. Warm register + near-pure partials = no metallic ping, no
fizz. The result is soft and round, like a gentle xylophone/synth reveal.

WHY IT STAYS META-SAFE (this plays before EVERY video — do not break this)
  Notes are drawn from a MAJOR PENTATONIC scale (no semitone clashes, always happy)
  with a loose upward drift for the "reveal" lift, but there is NO fixed melody, NO
  chord progression, NO beat, and it is only ~3.7s. That is the same reason the v5
  bed cannot be fingerprinted. Do NOT turn this into a written tune or a sustained
  chord pad — those are the two things Meta has matched before (see
  music_copyright_meta / the Letter I saga).

SHAPE (matches the animation: fly-in -> settle ~frame 58 -> land)
  0.0-1.6s  gentle rising blooms under the fly-in (soft, growing)
  1.7-2.0s  warm bloom cluster at the reveal (the emotional peak)
  2.3-3.9s  settle onto a warm low root that blooms and decays (the "landed" feel)
"""

import math
import random
import struct
import subprocess
import wave

# The intro video is 112 frames @ 30fps = 3.73s and the sting starts at frame 4
# (0.13s), so there are only ~3.6s of playable audio. The sting MUST fully resolve
# and fade to silence inside that window — otherwise the home note is still ringing
# loud when the video cuts, which reads as "not finished at the end".
SR = 44100
DUR = 3.45                          # ends ~3.58s into the 3.73s video → a clean breath, no cut
random.seed(7)                      # deterministic build

n = int(DUR * SR)
buf = [0.0] * n

# ── major pentatonic, C4-centred: bright and happy, no clashing intervals ────────
C4 = 261.63
STEP = {0: 0, 2: 2, 4: 4, 7: 7, 9: 9}  # C D E G A (semitones)
def note(semi):
    return C4 * (2 ** (semi / 12.0))

# near-pure WARM tone. faint 2nd/3rd only — anything higher reintroduces the ping.
PARTIALS = [(1.0, 1.00, 1.00), (2.0, 0.085, 1.6), (3.0, 0.028, 2.4)]
ATTACK = 0.32   # s — long enough that there is no transient (no "hit")
TAU = 2.05      # s — decay; tails overlap into a natural warm wash (no noise layer)


def bloom(at_s, semi, gain):
    """Add one swelling note; raised-cosine attack => no click, no strike."""
    at = int(at_s * SR)
    freq = note(semi)
    length = int(3.2 * TAU * SR)
    ka = int(ATTACK * SR)
    for k in range(length):
        idx = at + k
        if idx >= n:
            break
        t = k / SR
        env = math.exp(-t / TAU)
        if k < ka:
            env *= 0.5 - 0.5 * math.cos(math.pi * k / ka)
        s = 0.0
        for ratio, amp, decay in PARTIALS:
            s += amp * math.exp(-t * decay / TAU) * math.sin(2 * math.pi * freq * ratio * t)
        buf[idx] += s * env * gain


# ── the events: rise -> peak bloom -> warm settle ───────────────────────────────
# (time, semitone, gain). Upward drift for lift, but no fixed interval pattern.
EVENTS = [
    (0.08, 0,  0.48),   # C4  — first soft note, on the first letter
    (0.38, 4,  0.58),   # E4
    (0.66, 7,  0.66),   # G4
    (0.94, 9,  0.74),   # A4
    (1.22, 12, 0.84),   # C5  — building
    # reveal / settle — a warm bloom cluster, the peak
    (1.58, 16, 1.00),   # E5
    (1.70, 19, 0.86),   # G5  — blooms with E5: warm, happy, not a struck chord
    (1.84, 12, 0.80),   # C5
    # land — settle down then resolve onto the home note, with room to ring out
    (2.10, 7,  0.66),   # G4  — stepping down
    (2.40, 0,  1.00),   # C4  — the "landed" home note; the resolve fade below rings it out
]

for t, semi, g in EVENTS:
    jitter = random.uniform(-0.02, 0.02)          # organic micro-timing
    bloom(max(0.0, t + jitter), semi, g * random.uniform(0.94, 1.0))

# ── warm-up low-pass (one-pole), DC removal, RMS normalise, peak limit ──────────
lp = 0.0
for i in range(n):
    lp += 0.40 * (buf[i] - lp)     # gentle warmth; removes any residual edge
    buf[i] = lp

mean = sum(buf) / n
buf = [b - mean for b in buf]
rms = (sum(b * b for b in buf) / n) ** 0.5
buf = [b * (0.13 / max(1e-9, rms)) for b in buf]   # ≈ -17.7 dBFS, present but soft

peak = max(1e-6, max(abs(v) for v in buf))
if peak > 0.92:
    buf = [v * (0.92 / peak) for v in buf]

# resolve fade — a long, smooth raised-cosine fade to silence over the last 0.70s.
# The home note (C4 at 2.40s) blooms to its peak ~2.72s, then this fade rings it
# gently down to nothing by the end, so the sting FINISHES rather than being cut.
fade = int(0.70 * SR)
for k in range(fade):
    idx = n - fade + k
    m = 0.5 + 0.5 * math.cos(math.pi * k / fade)   # 1 -> 0, gentle at both ends
    buf[idx] *= m

frames = bytearray()
for v in buf:
    frames += struct.pack("<h", int(max(-1.0, min(1.0, v)) * 32767))

with wave.open("public/sfx/intro_sting.wav", "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(bytes(frames))

subprocess.run(
    ["ffmpeg", "-y", "-loglevel", "error", "-i", "public/sfx/intro_sting.wav",
     "-ac", "1", "-b:a", "96k", "public/sfx/intro_sting.mp3"],
    check=True)
subprocess.run(["rm", "-f", "public/sfx/intro_sting.wav"], check=True)
print(f"wrote public/sfx/intro_sting.mp3 ({DUR}s, warm blooming pentatonic — no strike, non-tonal-safe)")
