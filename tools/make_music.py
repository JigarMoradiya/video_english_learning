#!/usr/bin/env python3
"""Generate a soft, kid-friendly ambient BED (pure stdlib). 13s seamless loop,
meant to sit FAR under the narration.

FINGERPRINT + FEEL HISTORY — read before changing anything:
  v1  C-Am-F-G sustained pad ......... matched by Facebook's fingerprinter, geo-muted.
  v2  quartal pad, 13s, detuned ...... matched too, eventually (Letter I).
  v3  filtered white noise, no pitch .. unmatchable, but it HISSED. Rejected: "noisy".
  v4  struck music box ............... musical, but each note was a PERCUSSIVE HIT.
      Rejected: "not smooth, it hits on ears."
  v5  THIS — the same notes, but they BLOOM instead of being struck.

WHY v5 IS SMOOTH
  A "hit" is an attack transient: v4 reached full volume in 6ms, which the ear reads as
  a strike. v5 fades each note IN over 400ms on a raised-cosine curve — zero slope at
  both ends, so there is no transient at all. The note swells out of the wash and sinks
  back into it. Three further changes remove every remaining sharp edge:

    · REGISTER DROPPED to C3–A4 (131–440 Hz). v4 ran up to 2 kHz, straight through the
      band the narration occupies, so it both pinged and competed with the voice.
      Down here it sits underneath speech instead of across it.
    · PARTIALS CUT to a whisper of 2nd and 3rd. v4's 4.2× partial is what made it
      metallic; there is no bell character left, just warm tone.
    · NO NOISE LAYER. v3's hiss is gone entirely — with 2.8s decays the note tails
      overlap enough to fill every gap on their own.

WHY IT STILL CANNOT BE FINGERPRINTED
  Unchanged from v4, and this is the part not to break: notes are drawn from a
  PENTATONIC scale in RANDOM order at RANDOM times (seeded, so builds reproduce). No
  melody, no chord progression, no bar structure. Do NOT add a sustained chord pad or a
  written tune — those are the two things that have been matched already.

SEAMLESS LOOP
  Notes that run past the end wrap around to the start (modulo n), so the loop point is
  mathematically continuous — no crossfade, no seam to hear.
"""

import math
import random
import struct
import subprocess
import wave

SR = 44100
DUR = 13.0
random.seed(11)       # deterministic output

n = int(DUR * SR)

# ── the scale: C major pentatonic, C3–A4 ────────────────────────────────────────
# Pentatonic has no semitone clashes, so notes landing on each other's decay always
# agree. Low register keeps the bed under the narration rather than across it.
C3 = 130.81
STEPS = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21]
NOTES = [C3 * (2 ** (s / 12.0)) for s in STEPS]

# ── one blooming note ───────────────────────────────────────────────────────────
# Near-pure tone. The 2nd and 3rd are barely present — just enough to stop it sounding
# like a test sine. Anything higher reintroduces the metallic ping v4 was rejected for.
PARTIALS = [(1.0, 1.00, 1.00), (2.0, 0.11, 1.5), (3.0, 0.035, 2.2)]
ATTACK = 0.40   # seconds — long enough that there is no transient to hear
TAU = 2.80      # decay, seconds


def bloom(buf, at, freq, gain):
    """Add one swelling note, wrapping past the loop end so the loop stays seamless."""
    length = int(3.4 * TAU * SR)
    ka = int(ATTACK * SR)
    for k in range(length):
        t = k / SR
        env = math.exp(-t / TAU)
        if k < ka:
            # raised cosine: starts and ends with zero slope, so no click and no attack
            env *= 0.5 - 0.5 * math.cos(math.pi * k / ka)
        s = 0.0
        for ratio, amp, decay in PARTIALS:
            s += amp * math.exp(-t * decay / TAU) * math.sin(2 * math.pi * freq * ratio * t)
        buf[(at + k) % n] += s * env * gain


buf = [0.0] * n

# ── scatter the notes ───────────────────────────────────────────────────────────
# Sparse, so the tails do the work and the ear never counts events.
t = 0.0
while t < DUR:
    freq = random.choice(NOTES)
    bloom(buf, int(t * SR), freq, random.uniform(0.72, 1.0))
    t += random.uniform(1.15, 1.95)

# ── final softening ─────────────────────────────────────────────────────────────
# A gentle one-pole low-pass over the whole mix, run circularly so the loop point is
# not disturbed. Removes any residual edge the partials leave.
lp = 0.0
for _ in range(2):                      # prime the filter state around the loop
    for i in range(n):
        lp += 0.35 * (buf[i] - lp)
        buf[i] = lp

# remove DC, then loudness-normalise by RMS to the same bed level as every earlier
# version, so no reel needs re-balancing when it picks this up
mean = sum(buf) / n
buf = [b - mean for b in buf]
rms = (sum(b * b for b in buf) / n) ** 0.5
buf = [b * (0.104 / max(1e-9, rms)) for b in buf]  # ≈ −19.7 dB

peak = max(1e-6, max(abs(v) for v in buf))
if peak > 0.95:
    buf = [v * (0.95 / peak) for v in buf]

frames = bytearray()
for v in buf:
    frames += struct.pack("<h", int(max(-1.0, min(1.0, v)) * 32767))

with wave.open("public/music_bed.wav", "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(bytes(frames))
print(f"wrote public/music_bed.wav ({DUR}s, blooming pentatonic — no attack)")

# reels load music_bed.MP3 — encode it here too, else re-running changes nothing.
subprocess.run(
    ["ffmpeg", "-y", "-i", "public/music_bed.wav", "-ac", "1", "-b:a", "48k", "public/music_bed.mp3"],
    capture_output=True, check=True)
print("wrote public/music_bed.mp3 — re-render any video you intend to re-upload")
