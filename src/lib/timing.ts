// Data-driven timing engine for the c/k/ck video.
// Instead of hand-counting BEATS frame tables (the old reels' approach), this reads
// the recorded word-level narration timings (src/data/c_k_ck.timing.json, produced by
// the transcription tool) and turns seconds → frames, so every beat boundary and every
// in-beat word-hit locks to the real voice automatically.

import { FPS } from "../data/tokens";
import phrasesJson from "../data/c_k_ck.timing.json";

export interface TWord {
  word: string;
  start: number; // seconds
  end: number; // seconds
}

export interface TPhrase {
  index: number;
  text: string;
  line_index: number;
  start: number; // seconds
  end: number; // seconds
  duration: number;
  words: TWord[];
}

// seconds → whole frame
export const sec = (s: number, fps: number = FPS): number => Math.round(s * fps);

// Normalize a spoken token to a bare word for matching: lowercase, drop the phonics
// hyphen and all punctuation. "c-at," → "cat"  ·  "du-ck." → "duck"  ·  "/k/," → "k".
const norm = (w: string): string => w.toLowerCase().replace(/[^a-z0-9]/g, "");

export interface Beat {
  id: string;
  from: number; // absolute start frame → <Sequence from>
  durationInFrames: number; // tiles to the next beat
  startSec: number;
  endSec: number;
  fAbs: (s: number) => number; // seconds → absolute frame
  fRel: (s: number) => number; // seconds → beat-relative frame (Sequence resets frame to 0)
  word: (needle: string, nth?: number) => number; // beat-relative hit frame of a spoken word (−1 if absent)
}

export interface BeatSpec {
  id: string;
  from: number; // inclusive phrase index
  to: number; // inclusive phrase index
}

export interface Track {
  fps: number;
  phrases: TPhrase[];
  totalFrames: number;
  wordAbs: (needle: string, opts?: { afterSec?: number; nth?: number }) => number; // absolute frame or −1
  activeAt: (frame: number) => { phrase: TPhrase; wordIdx: number } | null; // drives captions
}

export const makeTrack = (
  phrases: TPhrase[] = phrasesJson as unknown as TPhrase[],
  audioSec = 139.08,
  fps: number = FPS
): Track => {
  const totalFrames = sec(audioSec, fps);

  const wordAbs: Track["wordAbs"] = (needle, opts = {}) => {
    const target = norm(needle);
    const after = opts.afterSec ?? -1;
    const want = opts.nth ?? 0;
    let seen = 0;
    for (const p of phrases) {
      for (const w of p.words) {
        if (w.start <= after) continue;
        if (norm(w.word) === target) {
          if (seen === want) return sec(w.start, fps);
          seen++;
        }
      }
    }
    return -1;
  };

  // The transcriber sometimes gives a word a zero duration and the SAME start as the
  // next word (e.g. "Three"/"spellings" both start 7.52, "We"/"use" both 32.96). With a
  // naive "last word whose start ≤ frame" the karaoke skips the tied word entirely.
  // So spread any run of tied/degenerate starts evenly across the time until the next
  // distinct start (or the phrase end) — every word gets its own highlight slice.
  const wordStartFrames = (p: TPhrase): number[] => {
    const n = p.words.length;
    const raw = p.words.map((w) => sec(w.start, fps));
    const phraseEnd = sec(p.end, fps);
    const out = new Array<number>(n);
    let i = 0;
    while (i < n) {
      let j = i;
      while (j + 1 < n && raw[j + 1] <= raw[i]) j++; // run of tied starts [i..j]
      const runStart = raw[i];
      const next = j + 1 < n ? raw[j + 1] : phraseEnd;
      const span = Math.max(next - runStart, j - i + 1);
      const count = j - i + 1;
      for (let k = i; k <= j; k++) out[k] = runStart + Math.round((span * (k - i)) / count);
      i = j + 1;
    }
    return out;
  };

  const activeAt: Track["activeAt"] = (frame) => {
    let active: TPhrase | null = null;
    for (const p of phrases) {
      if (sec(p.start, fps) <= frame) active = p;
      else break; // phrases are in time order
    }
    if (!active) return null;
    const starts = wordStartFrames(active);
    let wordIdx = -1;
    starts.forEach((s, i) => {
      if (s <= frame) wordIdx = i;
    });
    return { phrase: active, wordIdx };
  };

  return { fps, phrases, totalFrames, wordAbs, activeAt };
};

// Turn phrase-index ranges into back-to-back beats that tile 0→totalFrames with no gaps.
export const planBeats = (track: Track, specs: BeatSpec[]): Beat[] => {
  const { phrases, totalFrames, fps } = track;
  // resolve each beat's absolute start frame from its first phrase (beat 0 clamped to 0)
  const starts = specs.map((s, i) => (i === 0 ? 0 : sec(phrases[s.from].start, fps)));

  return specs.map((spec, i) => {
    const from = starts[i];
    const durationInFrames = (i + 1 < starts.length ? starts[i + 1] : totalFrames) - from;
    const startSec = phrases[spec.from].start;
    const endSec = phrases[spec.to].end;
    const span = phrases.slice(spec.from, spec.to + 1);

    const fAbs = (s: number) => sec(s, fps);
    const fRel = (s: number) => sec(s, fps) - from;
    const word = (needle: string, nth = 0): number => {
      const target = norm(needle);
      let seen = 0;
      for (const p of span) {
        for (const w of p.words) {
          if (norm(w.word) === target) {
            if (seen === nth) return sec(w.start, fps) - from;
            seen++;
          }
        }
      }
      return -1;
    };

    return { id: spec.id, from, durationInFrames, startSec, endSec, fAbs, fRel, word };
  });
};

export const beatsSum = (beats: Beat[]): number => beats.reduce((a, b) => a + b.durationInFrames, 0);
