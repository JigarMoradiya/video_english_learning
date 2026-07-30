#!/usr/bin/env python3
# make_brand_chime.py — synthesize the Kids English Learning "sound logo":
# a bright 3-note rising bell chime + a soft sparkle tail. 100% self-synthesized
# (no samples) so it's royalty-free, like the rest of the pipeline's audio.
# Output: public/sfx/brand_chime.mp3  (via ffmpeg from a temp wav).
import numpy as np, wave, struct, subprocess, os

SR = 44100
def bell(freq, dur, t0, amp=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = np.exp(-t * 5.5)                     # quick bell decay
    # fundamental + shimmering harmonics
    y = (np.sin(2*np.pi*freq*t) * 1.0
         + 0.5 * np.sin(2*np.pi*freq*2*t)
         + 0.25 * np.sin(2*np.pi*freq*3*t)
         + 0.12 * np.sin(2*np.pi*freq*4.2*t))
    y *= env * amp
    return int(t0 * SR), y

total = int(1.5 * SR)
buf = np.zeros(total)
def add(seg):
    s, y = seg
    e = min(total, s + len(y)); buf[s:e] += y[:e-s]

# rising major triad: G5 → B5 → D6, then a bright octave sparkle
add(bell(784.0,  0.55, 0.00, 0.9))   # G5
add(bell(987.8,  0.55, 0.13, 0.9))   # B5
add(bell(1174.7, 0.85, 0.26, 1.0))   # D6 (lands, rings longer)
add(bell(2349.3, 0.6,  0.30, 0.35))  # +octave shimmer

# sparkle tail: soft high twinkles
rng = np.random.default_rng(7)
for tt in [0.34, 0.42, 0.5, 0.6]:
    f = rng.uniform(2600, 4200)
    add(bell(f, 0.25, tt, 0.10))

# gentle fade out + normalize
fade = int(0.15*SR)
buf[-fade:] *= np.linspace(1, 0, fade)
buf /= max(1e-9, np.max(np.abs(buf))); buf *= 0.82

wav = os.path.join(os.path.dirname(__file__), "..", "public", "sfx", "brand_chime.wav")
mp3 = wav[:-4] + ".mp3"
with wave.open(wav, "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b"".join(struct.pack("<h", int(max(-1,min(1,s))*32767)) for s in buf))
subprocess.run(["ffmpeg","-y","-i",wav,"-codec:a","libmp3lame","-qscale:a","4",mp3],
               check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
os.remove(wav)
print("wrote", os.path.relpath(mp3))
