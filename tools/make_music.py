#!/usr/bin/env python3
"""Generate a soft, barely-there ambient music pad (pure stdlib). Sustained warm
chords with slow swells — meant to sit FAR under the narration. ~16s loop."""

import math
import struct
import wave

SR = 44100
DUR = 16.0


def freq(semitones_from_a4):
    return 440.0 * (2 ** (semitones_from_a4 / 12.0))


# Gentle chord progression (C - Am - F - G), 4s each, low octaves.
CHORDS = [
    [-9, -5, -2],   # C major (C E G) low
    [0, 3, 7],      # Am-ish
    [-4, -1, 3],    # F
    [-2, 2, 5],     # G
]

n = int(DUR * SR)
buf = [0.0] * n
chord_len = DUR / len(CHORDS)

for ci, chord in enumerate(CHORDS):
    start = ci * chord_len
    for i in range(n):
        t = i / SR
        # crossfade window for this chord (with wraparound smoothing)
        local = (t - start)
        if local < -0.5 or local > chord_len + 0.5:
            continue
        # slow swell envelope across the chord
        env = 0.5 - 0.5 * math.cos(2 * math.pi * (local / chord_len))
        env = max(0.0, env)
        s = 0.0
        for st in chord:
            f = freq(st - 12)  # an octave down = warm pad
            s += math.sin(2 * math.pi * f * t)
            s += 0.3 * math.sin(2 * math.pi * f * 2 * t)  # soft harmonic
        buf[i] += (s / len(chord)) * env

# gentle global tremolo for life
for i in range(n):
    t = i / SR
    buf[i] *= 0.9 + 0.1 * math.sin(2 * math.pi * 0.15 * t)

peak = max(1e-6, max(abs(v) for v in buf))
gain = 0.5 / peak  # low — it's a bed
frames = bytearray()
for v in buf:
    frames += struct.pack("<h", int(max(-1.0, min(1.0, v * gain)) * 32767))

with wave.open("public/music_bed.wav", "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(bytes(frames))
print(f"wrote public/music_bed.wav ({DUR}s)")
