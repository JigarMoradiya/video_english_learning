import timeline from "./cvc15.timeline.json";
import captions from "./cvc15.captions.json";
import { Clip } from "./cvc";

// ── L4 · CVC Words — the FIFTEEN-word cut, for the 9:16 ──────────────────────
// Not an arbitrary trim to hit a runtime. The narration was written for three words per
// group — "Three words. One vowel." is only true at three — and 13.mp3 is the ORIGINAL
// take that says "Fifteen words. You read them all." So the short cut is the script as it
// was first recorded, and it needs no new audio. Every word the teacher names out loud
// (cat, hen, pen, pig, big, pot, hot, run, dog) survives.
export const FPS = 30;
export const F = (s: number) => Math.round(s * FPS);

export const CLIPS = timeline.clips as Clip[];
export const MARKS = timeline.marks as Record<string, number>;
export const AUDIO_SEC = timeline.total;
export const CAPS = captions as { index: number; text: string; start: number; end: number;
                                  duration: number; words: { word: string; start: number; end: number }[] }[];

export const run = (id: string): Clip => {
  const c = CLIPS.find((x) => x.kind === "run" && x.id === id);
  if (!c) throw new Error(`cvc15: no recorded run "${id}"`);
  return c;
};

export const GROUP_WORDS: Record<string, string[]> = {
  shortA: ["cat", "hat", "map"],
  shortE: ["hen", "pen", "bed"],
  shortI: ["pig", "big", "six"],
  shortO: ["dog", "pot", "hot"],
  shortU: ["sun", "bug", "run"],
};

/** the store card rises ON the CTA line, and the video's length is measured from there */
export const DOWNLOAD_FROM = Math.round(CAPS[CAPS.length - 1].start * FPS) - 6;
/** two seconds after the last word — the store flow completes inside that */
export const CVC15_DURATION = F(AUDIO_SEC) + 60;
