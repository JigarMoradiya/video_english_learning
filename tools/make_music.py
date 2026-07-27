#!/usr/bin/env python3
"""Generate a soft, barely-there ambient music pad (pure stdlib). Sustained warm
chords with slow swells — meant to sit FAR under the narration. ~13s loop.

FINGERPRINT NOTE (2026-07-27): v1 of this pad used C-Am-F-G, the single most
common progression in commercial pop. Facebook's audio fingerprinting matched it
against their LICENSED-MUSIC catalog and geo-muted a reel ("muted in certain
countries where Meta does not have music rights") — even though the copyright
page correctly said no claim existed, because this audio is 100% ours.

v2 deliberately avoids anything a catalog matcher can lock onto:
  - QUARTAL voicings (stacked 4ths, Dsus-Esus-Csus-Gsus): consonant and warm, but
    harmonically ambiguous — no clear major/minor tonic for a matcher to key on.
  - 13s loop, not 16 — an odd length that doesn't align to a 4-bar fingerprint window.
  - the harmonic is detuned to 2.003x, adding a slow chorus beat that smears the
    spectral peaks fingerprints rely on.
Keep it consonant if you change it again — it plays under children's narration.
"""

import math
import struct
import subprocess
import wave

SR = 44100
DUR = 13.0
DETUNE = 2.003  # harmonic ratio; exactly 2.0 gives a clean, easily-matched partial


def freq(semitones_from_a4):
    return 440.0 * (2 ** (semitones_from_a4 / 12.0))


# Quartal pad (Dsus - Esus - Csus - Gsus), 3.25s each, low octaves.
CHORDS = [
    [-7, -2, 0],    # D G A
    [-5, 0, 2],     # E A B
    [-9, -4, -2],   # C F G
    [-2, 3, 5],     # G C D
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
            s += 0.3 * math.sin(2 * math.pi * f * DETUNE * t)  # soft, slightly detuned harmonic
        buf[i] += (s / len(chord)) * env

# gentle global tremolo for life
for i in range(n):
    t = i / SR
    buf[i] *= 0.9 + 0.1 * math.sin(2 * math.pi * 0.11 * t)

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

# The compositions load music_bed.MP3, so encode it here too — otherwise the pad
# is regenerated and nothing changes, because every reel still reads the old mp3.
subprocess.run(
    # 32k mono matches v1's encode — it's a pad at ~8% volume, not a music track.
    ["ffmpeg", "-y", "-i", "public/music_bed.wav", "-ac", "1", "-b:a", "32k", "public/music_bed.mp3"],
    capture_output=True, check=True)
print("wrote public/music_bed.mp3 — re-render any video you intend to re-upload")
