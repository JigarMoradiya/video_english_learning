import timeline from "./cvc.timeline.json";
import { STORE_OUTRO_F } from "../components/StoreOutro";

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
  shortA: ["cat", "hat", "map"],
  shortE: ["hen", "pen", "red"],
  shortI: ["pig", "big", "sit"],
  shortO: ["dog", "pot", "hot"],
  shortU: ["sun", "run", "cup"],
};
export const ALL_WORDS = Object.values(GROUP_WORDS).flat();

/** word → the picture the video shows. 13 come from the app's own artwork. */
export const PIC: Record<string, string> = {
  cat: "letters/cat.png", hat: "letters/hat.png", map: "letters/map.png",
  hen: "letters/hen.png", pen: "letters/pen.png", red: "🔴",
  pig: "letters/pig.png", big: "🐘", sit: "🪑",
  dog: "letters/dog.png", pot: "letters/pot.png", hot: "🌶️",
  sun: "letters/sun.png", run: "🏃", cup: "☕",
};

export const OUTRO_FROM = F(AUDIO_SEC) + 24;
export const CVC_DURATION = OUTRO_FROM + STORE_OUTRO_F;
