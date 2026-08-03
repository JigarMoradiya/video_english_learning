import timeline from "./cvc.timeline.json";
import captions from "./cvc.captions.json";
// STORE_OUTRO_F is deliberately NOT imported: this video times its own ending — see
// CVC_DURATION below.

// ── L4 · CVC Words — the timeline ────────────────────────────────────────────
// Built by tools/build_cvc_timeline.py. NOTHING IS CUT: every clip, the teacher's 15
// recorded runs and the app's own sound and word clips, is placed whole at a computed
// start. The gaps between them are the pacing, and they live in that script — not here
// and not scattered through the reel.
export const FPS = 30;
export const F = (s: number) => Math.round(s * FPS);

export interface Clip {
  src: string;
  start: number;
  dur: number;
  kind: "run" | "sound" | "word";
  id?: string;
  word?: string;
  letter?: string;
  idx?: number;
  vowel?: boolean;
}

export const CLIPS = timeline.clips as Clip[];
export const MARKS = timeline.marks as Record<string, number>;
export const AUDIO_SEC = timeline.total;

/** every clip belonging to one word's build, in order: three sounds then the word */
export const buildOf = (word: string, nth = 0): Clip[] => {
  const all = CLIPS.filter((c) => c.word === word);
  const size = all.length / Math.max(1, countBuilds(word));
  return all.slice(nth * size, (nth + 1) * size);
};
const countBuilds = (word: string) =>
  CLIPS.filter((c) => c.word === word && c.kind === "word").length;

/** the run clip with this id */
export const run = (id: string): Clip => {
  const c = CLIPS.find((x) => x.kind === "run" && x.id === id);
  if (!c) throw new Error(`cvc: no recorded run "${id}" — check public/audio/cvc/${id}.mp3`);
  return c;
};

/** the 15 words in teaching order, grouped as the app groups them */
export const GROUP_WORDS: Record<string, string[]> = {
  shortA: ["cat", "hat", "map", "fan", "bat"],
  shortE: ["hen", "pen", "bed", "net", "ten"],
  shortI: ["pig", "big", "six", "lip", "win"],
  shortO: ["dog", "pot", "hot", "box", "fox"],
  shortU: ["sun", "bug", "run", "cup", "jug"],
};
export const ALL_WORDS = Object.values(GROUP_WORDS).flat();

/** word → the picture the video shows. 13 come from the app's own artwork. */
export const PIC: Record<string, string> = {
  cat: "letters/cat.png", hat: "letters/hat.png", map: "letters/map.png",
  fan: "letters/fan.png", bat: "letters/bat.png",
  hen: "letters/hen.png", pen: "letters/pen.png", bed: "🛏️",
  net: "letters/net.png", ten: "🔟",
  pig: "letters/pig.png", big: "🐘", six: "6️⃣", lip: "👄", win: "🏆",
  dog: "letters/dog.png", pot: "letters/pot.png", hot: "🌶️",
  box: "📦", fox: "letters/fox.png",
  sun: "letters/sun.png", bug: "🐛", run: "🏃",
  cup: "☕", jug: "letters/jug.png",
};

export const OUTRO_FROM = F(AUDIO_SEC) + 24;

// The store card rises ON the CTA line, not after all the audio — see DL_FROM in the reel.
// The length has to be measured from THAT start. Adding STORE_OUTRO_F to OUTRO_FROM instead
// counted the beat twice and left 12.4s of finished video running after the last word.
export const DOWNLOAD_FROM = Math.round(
  (captions as { start: number }[])[(captions as unknown[]).length - 1].start * FPS
) - 6;
// Two seconds after the last word — long enough for the store badges to hold, short
// enough that the video does not keep running over a finished frame. STORE_OUTRO_F is the
// shared card's own length and is NOT the answer here: this beat starts on the CTA line,
// well before the audio ends, so adding it lands 12s past the end.
export const CVC_DURATION = F(AUDIO_SEC) + 60;
