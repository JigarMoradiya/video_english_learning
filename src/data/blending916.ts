import phrases from "./cv_vc_short.timing.json";
import cuts from "./blendingCuts916.json";

// ── L3 · 2-Sound Blending — the 9:16 cut ─────────────────────────────────────
// Its own narration: tools/compact_narration.py drops 8 build examples and "Cat. Dog.
// Pig.", then tightens every gap to 0.55s EXCEPT the three answer pauses, which are the
// child's turn and keep their full recorded length. 239.5s -> 153.6s, so the reel lands
// under three minutes without dropping a single blend (the script says "Eight words" —
// removing one would make the video lie).
export const FPS = 30;

export interface Phrase {
  index: number; text: string; start: number; end: number;
  words?: { word: string; start: number; end: number }[];
}
export const NARR = phrases as unknown as Phrase[];
export const AUDIO_SEC = 186.0;

export const F = (s: number) => Math.round(s * FPS);
// Fail LOUDLY on a stale index. Cutting sentences renumbers every phrase after the cut, and a
// component still holding an old number produced "Cannot read properties of undefined" from
// deep inside the renderer, which says nothing about which cue is wrong.
const at = (i: number) => {
  const p = NARR[i];
  if (!p) throw new Error(`phrase ${i} does not exist — the narration has ${NARR.length} phrases (stale cue after a sentence cut?)`);
  return p;
};
export const P = (i: number) => F(at(i).start);
export const PE = (i: number) => F(at(i).end);

// Phrase indices after the drop. newIndex(i) = i - (dropped before i):
//   0…75 unchanged · 88…101 shift -12 · 114…140 shift -24 · 144…146 shift -27
export const SEC = {
  hook: [0, 2], intro: [3, 4], idea: [5, 11], vcIntro: [12, 12], vcSet: [13, 36],
  vcRecap: [37, 38], cvIntro: [39, 40], cvSet: [41, 64], cvRecap: [65, 66],
  secret: [67, 69], buildVC: [70, 81], flip: [82, 83], buildCV: [84, 92],
  payoff: [93, 97], practice: [98, 105], quiz: [106, 112], wrap: [113, 115],
} as const;
export type SecId = keyof typeof SEC;
export const ORDER = Object.keys(SEC) as SecId[];
export const secFrom = (id: SecId) => P(SEC[id][0]);

export interface Triple { a: string; b: string; word: string; p1: number; p2: number; p3: number; vowelFirst: boolean }
const triples = (first: number, list: [string, string, string][], vowelFirst: boolean): Triple[] =>
  list.map(([a, b, word], k) => ({
    a, b, word, vowelFirst,
    p1: P(first + k * 3), p2: P(first + k * 3 + 1), p3: P(first + k * 3 + 2),
  }));

export const VC_TRIPLES = triples(13, [
  ["a", "t", "at"], ["a", "n", "an"], ["a", "m", "am"], ["i", "n", "in"],
  ["i", "t", "it"], ["o", "x", "ox"], ["u", "p", "up"], ["u", "s", "us"],
], true);
export const CV_TRIPLES = triples(41, [
  ["b", "a", "ba"], ["m", "a", "ma"], ["m", "e", "me"], ["w", "e", "we"],
  ["g", "o", "go"], ["n", "o", "no"], ["s", "i", "si"], ["d", "o", "do"],
], false);

const CUTS: Record<string, number> = cuts as Record<string, number>;
export interface BuildT { chunk: string; add: string; word: string; front: boolean; p1: number; p2: number; p2e: number; p3: number; cut: number }
const builds = (first: number, list: [string, string, string][], front: boolean): BuildT[] =>
  list.map(([chunk, add, word], k) => ({
    chunk, add, word, front,
    p1: P(first + k * 3), p2: P(first + k * 3 + 1), p2e: PE(first + k * 3 + 1), p3: P(first + k * 3 + 2),
    cut: F(CUTS[word] ?? 0),
  }));

// six per side survive the cut — only sit/fox and got/not are dropped, which the
// narration never counts, so the video still says exactly what it shows
export const BUILD_VC = builds(70, [
  ["at", "b", "bat"], ["an", "f", "fan"], ["am", "j", "jam"], ["in", "p", "pin"],
], true);
export const BUILD_CV = builds(84, [
  ["ba", "g", "bag"], ["ma", "p", "map"], ["si", "x", "six"],
], false);

export const PIC: Record<string, string> = {
  bat: "blending_img/bat.png", fan: "blending_img/fan.png", jam: "blending_img/jam.png",
  pin: "📌", cup: "☕", bus: "blending_img/bus.png",
  bag: "blending_img/bag.png", map: "blending_img/map.png", met: "🤝",
  wet: "💧", six: "6️⃣", dog: "blending_img/dog.png",
};   // cup/wet stay listed: the QUIZ still reveals cup, and the map is shared with 16:9

// how full the fuel gauge is: one notch per blend made, 16 in all
export const BLEND_AT: number[] = [...VC_TRIPLES, ...CV_TRIPLES].map((t) => t.p3).sort((a, b) => a - b);

// With the subscribe line cut there is no beat between the quiz and the download, so the
// launch moves to the download section itself -- the world dims behind it either way.
export const WRAP_FROM = P(SEC.wrap[0]);
export const LIFT_FROM = WRAP_FROM;
export const BLENDING916_DURATION = Math.max(F(AUDIO_SEC) + 20, WRAP_FROM + 344);
