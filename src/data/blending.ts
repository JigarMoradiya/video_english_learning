import phrases from "./cv_vc_new.timing.json";
import soundoutCuts from "./blendingCuts.json";

// ── L3 · 2-Sound Blending — v2 data ──────────────────────────────────────────
// The user re-recorded the WHOLE video as one continuous take (cv_vc_new.mp3, 4:00),
// including every phonetic line — so v1's two-source assembly (app clips + re-timed
// narration) is gone. One Audio, zero cuts, and every visual cue is a phrase timestamp
// from the forced alignment (snap_word_phrases + manual RMS repair on 13/59/112).
export const FPS = 30;

export interface Phrase {
  index: number; text: string; start: number; end: number;
  words?: { word: string; start: number; end: number }[];
}
export const NARR = phrases as unknown as Phrase[];
export const AUDIO_SEC = 239.82;

export const F = (s: number) => Math.round(s * FPS);
export const P = (i: number) => F(NARR[i].start);       // phrase onset, frames
export const PE = (i: number) => F(NARR[i].end);        // phrase end, frames

// ── sections: [first phrase, last phrase] ────────────────────────────────────
// Each section is ONE component on screen for its whole span; lines inside it animate
// via these phrase cues. v1 mounted a fresh Sequence per line, and every boundary
// re-ran the entrance spring — the "jerk" on "Blue box is a consonant."
export const SEC = {
  hook: [0, 2], intro: [3, 4], idea: [5, 11], vcIntro: [12, 12], vcSet: [13, 36],
  vcRecap: [37, 38], cvIntro: [39, 40], cvSet: [41, 64], cvRecap: [65, 66],
  secret: [67, 69], buildVC: [70, 93], flip: [94, 95], buildCV: [96, 119],
  payoff: [120, 124], practice: [125, 132], quiz: [133, 139],
  subscribe: [140, 143], wrap: [144, 146],
} as const;
export type SecId = keyof typeof SEC;
export const ORDER = Object.keys(SEC) as SecId[];

export const secFrom = (id: SecId) => P(SEC[id][0]);
export const secEnd = (id: SecId) => {
  const k = ORDER.indexOf(id);
  return k + 1 < ORDER.length ? P(SEC[ORDER[k + 1]][0]) : BLENDING_DURATION;
};

// ── the blend triples ────────────────────────────────────────────────────────
// A triple = three consecutive phrases: sound one, sound two, the blend.
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

// ── the Listen builds: chunk + one sound = a real word ──────────────────────
// From the recording: an→fan, ox→fox, up→cup, ba→bag, me→met (the user speaks every
// word now, so v1's app-bank restriction no longer constrains the list).
// `cut` = the MEASURED frame the sound-out hands over from one card to the other
// (tools/measure_soundout_cuts.py). A percentage of the phrase could not express it: the
// bursts are unevenly spaced and some words have only two.
const CUTS: Record<string, number> = soundoutCuts as Record<string, number>;
export interface BuildT { chunk: string; add: string; word: string; front: boolean; p1: number; p2: number; p2e: number; p3: number; cut: number }
const builds = (first: number, list: [string, string, string][], front: boolean): BuildT[] =>
  list.map(([chunk, add, word], k) => ({
    chunk, add, word, front,
    p1: P(first + k * 3), p2: P(first + k * 3 + 1), p2e: PE(first + k * 3 + 1), p3: P(first + k * 3 + 2),
    cut: F(CUTS[word] ?? 0),
  }));

export const BUILD_VC = builds(70, [
  ["at", "b", "bat"], ["an", "f", "fan"], ["am", "j", "jam"], ["in", "p", "pin"],
  ["it", "s", "sit"], ["ox", "f", "fox"], ["up", "c", "cup"], ["us", "b", "bus"],
], true);
export const BUILD_CV = builds(96, [
  ["ba", "g", "bag"], ["ma", "p", "map"], ["me", "t", "met"], ["we", "t", "wet"],
  ["go", "t", "got"], ["no", "t", "not"], ["si", "x", "six"], ["do", "g", "dog"],
], false);

// single-codepoint only — ZWJ sequences do not render
export const PIC: Record<string, string> = {
  bat: "blending_img/bat.png", fan: "blending_img/fan.png", jam: "blending_img/jam.png", pin: "📌", sit: "🪑", fox: "blending_img/fox.png", cup: "☕", bus: "blending_img/bus.png",
  bag: "blending_img/bag.png", map: "blending_img/map.png", met: "🤝", wet: "💧", got: "✋", not: "❌", six: "6️⃣", dog: "blending_img/dog.png",
  cat: "blending_img/cat.png", pig: "blending_img/pig.png",
};

// ── the bench tally: every word made so far, in the order it was stamped ─────
export interface TallyItem { word: string; at: number; vowelFirst: boolean }
// `at` = when the chip LANDS on the bench — the moment the big plank leaves the stage
// (the next triple's first sound, or the section's end), never while it is still up.
// Landing it at p3 put a small `at` on the bench UNDER the big `at` plank: two cards.
export const TALLY: TallyItem[] = [
  { word: "at", at: P(5), vowelFirst: true }, // the hook's plank leaves when the idea section resets
  ...VC_TRIPLES.map((t, i) => ({ word: t.word, at: VC_TRIPLES[i + 1]?.p1 ?? P(37), vowelFirst: true })),
  ...CV_TRIPLES.map((t, i) => ({ word: t.word, at: CV_TRIPLES[i + 1]?.p1 ?? P(65), vowelFirst: false })),
]
  // the hook already made `at`; the VC sweep's `at` must not add a second chip
  .filter((x, i, arr) => arr.findIndex((y) => y.word === x.word) === i)
  .sort((a, b) => a.at - b.at);

// Captions: the aligner split "At... buh-aaa-t... Bat!" into three phrases, so the band
// showed fragments. Merge each triple into ONE caption phrase; word timings survive, so
// karaoke progress sweeps the full sentence.
const mergeRanges: [number, number][] = [[13, 36], [41, 64], [70, 93], [96, 119]];
export const CAPTION_PHRASES: Phrase[] = (() => {
  const out: Phrase[] = [];
  for (let i = 0; i < NARR.length; i++) {
    const r = mergeRanges.find(([a, b]) => i >= a && i <= b);
    if (!r) { out.push(NARR[i]); continue; }
    const trip = [NARR[i], NARR[i + 1], NARR[i + 2]];
    out.push({
      index: NARR[i].index, start: trip[0].start, end: trip[2].end,
      text: trip.map((p) => p.text).join(" "),
      words: trip.flatMap((p) => p.words ?? [{ word: p.text, start: p.start, end: p.end }]),
    });
    i += 2;
  }
  return out;
})();

export const WRAP_FROM = P(SEC.wrap[0]);
export const BLENDING_DURATION = Math.max(F(AUDIO_SEC) + 24, WRAP_FROM + 344);
