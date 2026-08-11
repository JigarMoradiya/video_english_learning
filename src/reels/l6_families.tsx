import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/l6_families.captions.json";
import { Captions } from "../components/Captions";
import { makeTrack, TPhrase } from "../lib/timing";
import { Watermark } from "../components/Watermark";
import { StoreOutro, STORE_OUTRO_F } from "../components/StoreOutro";
import { MUSIC_BED, MUSIC_FADE_IN, MUSIC_FADE_OUT } from "../data/mix";
import { picFor } from "../data/word_pics";
import { Confetti } from "../components/Confetti";
import {
  B, Banner, Content, Ear, Fixed, LANE, Lane, LevelSix, Line, Mo, Row, Tile, VowelStrip,
  WashingLine, WordLit, Zip, bands, pop,
} from "../components/WordLane";

// ── L6 · WORD FAMILIES — the HAND-AUTHORED cut ──────────────────────────────
//
// Two auto-classified cuts were rejected. This one is built the way L5 Part 1 was: every
// line's visual chosen BY READING THE LINE, recorded in an explicit table. The nine rules
// from the rejected rounds govern everything here:
//   banner follows the script's own timeline · LEVEL above the 6 · every spoken family
//   word shows that word built · analysis lines show the WHOLE word with its ending lit ·
//   pictures are the app's own wherever the app has one · the family switches on its
//   announcement line · the rail lists letters left-to-right · reading order is always
//   left-to-right · matching is by hand, so "happening" can never read as "app".

const FPS = 30;
const P = phrasesJson as unknown as TPhrase[];
const AUDIO_SEC = 542.67;
const f = (s: number) => Math.round(s * FPS);
const TRACK = makeTrack(P, P[P.length - 1].end, FPS, 1.0);
const at = (i: number) => f(P[i].start);

const FAMILIES: Record<string, string[]> = {
  at: ["cat", "bat", "hat", "rat", "mat", "sat", "pat", "fat"],
  an: ["can", "man", "fan", "ran", "pan", "tan", "van", "ban"],
  ap: ["cap", "map", "nap", "tap", "lap", "gap"],
  en: ["hen", "ten", "pen", "men", "den"],
  ig: ["big", "pig", "dig", "wig", "jig", "fig"],
  it: ["sit", "bit", "hit", "fit", "kit", "pit", "wit"],
  in: ["pin", "win", "fin", "tin", "bin"],
  og: ["dog", "log", "fog", "hog", "jog"],
  ot: ["hot", "pot", "dot", "lot", "cot", "rot", "got"],
  op: ["top", "hop", "mop", "pop", "cop"],
  un: ["sun", "run", "fun", "bun", "gun", "pun"],
  ug: ["bug", "rug", "hug", "mug", "dug", "jug"],
  all: ["ball", "tall", "wall", "fall", "call", "hall", "mall"],
};

/** which family's HOUSE is on screen, by hand from the line dump — each entry is the
 *  line where that family's setting arrives (its lead-in/announcement), rule 6 */
const HOUSE_FROM: [number, string][] = [
  [22, "at"], [42, "an"], [58, "ap"], [70, "en"], [81, "ig"], [90, "it"], [98, "in"],
  [110, "og"], [118, "ot"], [126, "op"], [134, "un"], [142, "ug"], [150, "all"],
];
const houseFor = (idx: number): string | null => {
  let h: string | null = null;
  for (const [from, r] of HOUSE_FROM) if (idx >= from) h = r;
  return h;
};

/** every line that SPEAKS a family word, hand-written from the dump — including the
 *  intro demo (8, 11), the ‑all repeat run (170-172) and the quiz answers (187, 194) */
const WORD: Record<number, { rime: string; word: string; k: number }> = {};
const W = (idx: number, rime: string, word: string) =>
  (WORD[idx] = { rime, word, k: FAMILIES[rime].indexOf(word) });
W(8, "at", "cat"); W(11, "at", "cat");
[28, 29, 30, 31, 32, 33, 34, 35].forEach((i, k) => W(i, "at", FAMILIES.at[k]));
[48, 49, 50, 51, 52, 53, 54, 55].forEach((i, k) => W(i, "an", FAMILIES.an[k]));
[60, 61, 62, 63, 64, 65].forEach((i, k) => W(i, "ap", FAMILIES.ap[k]));
[73, 74, 75, 76, 77].forEach((i, k) => W(i, "en", FAMILIES.en[k]));
[84, 85, 86, 87, 88, 89].forEach((i, k) => W(i, "ig", FAMILIES.ig[k]));
[91, 92, 93, 94, 95, 96, 97].forEach((i, k) => W(i, "it", FAMILIES.it[k]));
[99, 100, 101, 102, 103].forEach((i, k) => W(i, "in", FAMILIES.in[k]));
[113, 114, 115, 116, 117].forEach((i, k) => W(i, "og", FAMILIES.og[k]));
[119, 120, 121, 122, 123, 124, 125].forEach((i, k) => W(i, "ot", FAMILIES.ot[k]));
[127, 128, 129, 130, 131].forEach((i, k) => W(i, "op", FAMILIES.op[k]));
[136, 137, 138, 139, 140, 141].forEach((i, k) => W(i, "un", FAMILIES.un[k]));
[143, 144, 145, 146, 147, 148].forEach((i, k) => W(i, "ug", FAMILIES.ug[k]));
[153, 154, 155, 156, 157, 158, 159].forEach((i, k) => W(i, "all", FAMILIES.all[k]));
W(163, "all", "ball"); W(170, "all", "ball"); W(171, "all", "tall"); W(172, "all", "wall");
W(187, "en", "hen"); W(194, "ug", "bug");   // 184/191 are picture-ONLY: spelling them would answer the quiz

/** the sound pass (item 7): pop per word, chime per family arrival, sparkle+confetti on
 *  praise, question/correct around the quiz */
const PRAISE = [41, 69, 109, 149, 195, 206];
const SFX: { at: number; file: string; vol: number }[] = [
  ...Object.keys(WORD).map((i) => ({ at: at(Number(i)), file: "pop", vol: 0.30 })),
  ...[22, 44, 59, 72, 79, 83, 90, 98, 112, 118, 126, 135, 142, 152, 174, 182, 190].map((i) => ({ at: at(i), file: "chime_soft", vol: 0.26 })),
  ...PRAISE.map((i) => ({ at: at(i), file: "sparkle", vol: 0.34 })),
  { at: at(185), file: "question", vol: 0.28 }, { at: at(192), file: "question", vol: 0.28 },
  { at: at(188), file: "correct", vol: 0.32 }, { at: at(40), file: "correct", vol: 0.30 },
];

const STORE_FROM_IDX = 211;   // "And practise every one of these families…"
export const L6_DURATION = Math.max(f(AUDIO_SEC) + 40, at(STORE_FROM_IDX) + STORE_OUTRO_F);

const phraseAt = (frame: number) => {
  let idx = 0;
  for (let i = 0; i < P.length; i++) { if (f(P[i].start) <= frame) idx = i; else break; }
  return idx;
};
const BEAT_OF: number[] = (() => {
  const out: number[] = []; let cur = 0;
  for (let i = 0; i < P.length; i++) {
    const until = i + 1 < P.length ? P[i + 1].start : P[i].end;
    if (i === 0 || until - P[i].start >= 0.75) cur = i;
    out.push(cur);
  }
  return out;
})();

/** the banner follows the script's own timeline (rule 1), by hand */
const bannerFor = (idx: number): string => {
  if (idx <= 2) return "LEVEL 5 · WELL DONE!";
  if (idx <= 21) return "LEVEL 6 · WORD FAMILIES";
  if (idx >= 198) return "LEVEL 6 · WORD FAMILIES";
  if (idx >= 179) return "YOUR TURN!";
  const h = houseFor(idx);
  return h ? `THE  ${h}  FAMILY` : "LEVEL 6 · WORD FAMILIES";
};

// ── small scene helpers, all reading left → right ───────────────────────────

const Pic: React.FC<{ word: string; size: number }> = ({ word, size }) => {
  const frame = useCurrentFrame();
  const src = picFor(word);
  if (!src) return null;
  return (
    <div style={{ width: size, height: size, flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center",
      transform: `translateY(${Math.sin(frame / 30) * 6}px)` }}>
      {src.startsWith("img/")
        ? <img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        : <div style={{ fontSize: size * 0.84, lineHeight: 1 }}>{src}</div>}
    </div>
  );
};

/** the doorstep build: picture above, then front letter(s) + ending, left to right */
const Build: React.FC<{ b: B; rime: string; word: string; a: number; u: (n: number) => number }> = ({ b, rime, word, a, u }) => {
  const front = word.slice(0, word.length - rime.length);
  return (
    <>
      <Pic word={word} size={u(210)} />
      <Row gap={u(14)}>
        {front.split("").map((c, i) => <Tile key={i} ch={c} size={u(150)} at={a + i * 3} seed={i} hot />)}
        <Tile ch={rime} size={u(150)} tone="ending" w={u(150) * (rime.length > 2 ? 1.5 : 1.2)} />
      </Row>
    </>
  );
};

/** the front letter swaps while the ending holds — "only the front changed" */
const Swap: React.FC<{ rime: string; pair: [string, string]; a: number; frameNow: number; u: (n: number) => number }> = ({ rime, pair, a, frameNow, u }) => {
  // ONE-SHOT (round 2, item 2): pair[0] shows briefly, then pair[1] lands and HOLDS —
  // the looping version showed "c" while the caption said "bat".
  const k = frameNow - a < 22 ? 0 : 1;
  return (
    <Row gap={u(16)}>
      <Tile ch={pair[k]} size={u(175)} at={a} hot seed={k} />
      <Tile ch={rime} size={u(235)} tone="ending" w={u(235) * (rime.length > 2 ? 1.4 : 1.25)} />
    </Row>
  );
};

/** one letter bolted still while the letters AFTER it change — "the a stays put" */
const HoldVowel: React.FC<{ vowel: string; tails: string[]; a: number; frameNow: number; u: (n: number) => number }> = ({ vowel, tails, a, frameNow, u }) => {
  const k = Math.floor(Math.max(0, frameNow - a) / 22) % tails.length;
  return (
    <Row gap={u(16)}>
      <Tile ch={vowel} size={u(220)} tone="ending" hot />
      <Tile ch={tails[k]} size={u(160)} at={a} seed={k} />
    </Row>
  );
};

const Icon: React.FC<{ glyph: string; size: number }> = ({ glyph, size }) => {
  const frame = useCurrentFrame();
  return <div style={{ fontSize: size, lineHeight: 1, transform: `translateY(${Math.sin(frame / 26) * 6}px) rotate(${Math.sin(frame / 38) * 4}deg)` }}>{glyph}</div>;
};

const Num: React.FC<{ n: string; a: number; u: (x: number) => number }> = ({ n, a, u }) => (
  <Tile ch={n} size={u(230)} tone="ending" at={a} />
);

/** the whole family on screen — every word with its picture, wrapped (item 6) */
const FamilyAll: React.FC<{ rime: string; a: number; sp: (n: number) => number; u: (n: number) => number }> = ({ rime, a, sp, u }) => {
  const words = FAMILIES[rime];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: u(14), alignItems: "center", justifyContent: "center", maxWidth: "100%" }}>
      {words.map((wd, i) => (
        <div key={wd} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: u(6) }}>
          <Pic word={wd} size={u(112)} />
          <Tile ch={wd} size={u(54)} at={a + i * sp(words.length)} seed={i} w={u(54) * 2.2} />
        </div>
      ))}
    </div>
  );
};

const L5_RULES = ["ff", "ck", "ng", "nk", "x", "w"];

// ── THE SCENE TABLE — every line, by hand ───────────────────────────────────

const Scene: React.FC<{ idx: number; b: B }> = ({ idx, b }) => {
  const frameNow = useCurrentFrame();
  const a = at(idx);
  // stagger n arrivals across the whole spoken line, so a long sentence BUILDS instead of
  // freezing after its first frame (review round 1, item 4)
  const dur = f(P[idx].end - P[idx].start);
  const sp = (n: number) => Math.max(4, Math.floor(dur / Math.max(2, n + 1)));
  const u = (n: number) => Math.round(n * (b.wide ? 1 : 0.84));
  const w = WORD[idx];

  // any line that SPEAKS a family word shows that word (rule 3) — presentation by family
  // ONE presentation for every family — the ‑at build (round 2, item 4)
  if (w) return <Build b={b} rime={w.rime} word={w.word} a={a} u={u} />;

  switch (idx) {
    // ── welcome (banner: LEVEL 5 · WELL DONE!) ──
    case 0: return <Icon glyph={"\u{1F44B}"} size={u(200)} />;                                  // Welcome back!
    case 1: return <Row gap={u(18)}><Tile ch="5" size={u(200)} tone="ending" at={a} /><Icon glyph={"⭐"} size={u(120)} /></Row>; // finished Level Five
    case 2: return (                                                                            // six spelling rules, ticked
      <Row gap={u(12)}>{L5_RULES.map((r, i) => (
        <div key={r} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: u(8) }}>
          <Tile ch={r} size={u(150)} at={a + i * sp(6)} seed={i} />
          <Icon glyph={"✅"} size={u(66)} />
        </div>))}
      </Row>);
    case 3: return <LevelSix b={b} at={a} />;                                                   // starting Level Six
    case 4: return <Row gap={u(20)}><Tile ch="rule" size={u(130)} tone="dim" /><Icon glyph={"❌"} size={u(110)} /></Row>; // NOT a rule
    case 5: return <Row gap={u(20)}><Icon glyph={"\u{1FA84}"} size={u(150)} />{[0, 1, 2].map((i) => <Tile key={i} ch="" size={u(90)} at={a + 6 + i * 4} seed={i} />)}</Row>; // a trick → a pile of cards
    case 6: return <Icon glyph={"\u{1F440}"} size={u(190)} />;                                  // let me show you
    case 7: return <Tile ch="?" size={u(190)} tone="dim" at={a} />;                             // here is a word
    case 9: return <Swap rime="at" pair={["c", "c"]} a={a} frameNow={frameNow} u={u} />;        // watch — one letter
    case 10: return <Row gap={u(14)}><Tile ch="c" size={u(190)} at={a} hot /><Tile ch="at" size={u(150)} tone="dim" w={u(150) * 1.2} /></Row>; // the FIRST one
    case 12: return <Build b={b} rime="at" word="bat" a={a} u={u} />;                          // "bat." — b-at immediately, the c→b demo lives on 14/15
    case 13: return <Row gap={u(30)}><Build b={b} rime="at" word="cat" a={a} u={(n) => Math.round(u(n) * 0.62)} /><Build b={b} rime="at" word="bat" a={a + 6} u={(n) => Math.round(u(n) * 0.62)} /></Row>; // did you see that?
    case 14: return <Swap rime="at" pair={["c", "b"]} a={a} frameNow={frameNow} u={u} />;       // everything else stayed the same
    case 15: return <Swap rime="at" pair={["c", "b"]} a={a} frameNow={frameNow} u={u} />;       // only the front changed
    case 16: return <Row gap={u(20)}><Icon glyph={"\u{1FA84}"} size={u(140)} /><Swap rime="at" pair={["c", "b"]} a={a} frameNow={frameNow} u={(n) => Math.round(u(n) * 0.7)} /></Row>; // that is the trick
    case 17: return <Row gap={u(10)}>{[0, 1, 2, 3, 4, 5].map((i) => <Tile key={i} ch="" size={u(84)} at={a + i * sp(6)} seed={i} />)}</Row>; // hundreds of words
    case 18: return <WordLit word="cat" rime="at" size={u(160)} at={a} />;                      // look at the END
    case 19: return <Row gap={u(14)}>{["c", "a", "t"].map((c, i) => <Tile key={i} ch={c} size={u(170)} at={a + i * sp(3)} seed={i} />)}</Row>; // C-A-T
    case 20: return <WordLit word="cat" rime="at" size={u(170)} at={a} />;                      // last two letters are a and t
    case 21: return <Row gap={u(20)}><Icon glyph={"\u{1F5E3}"} size={u(140)} /><Tile ch="at" size={u(180)} tone="ending" at={a} w={u(180) * 1.2} /></Row>; // say it with me
    case 22: return <Tile ch="at" size={u(250)} tone="ending" at={a} hot w={u(250) * 1.2} />;   // At. (house arrives)
    case 23: return <Row gap={u(20)}><Icon glyph={"\u{1F4A1}"} size={u(140)} /><Tile ch="at" size={u(170)} tone="ending" w={u(170) * 1.2} /></Row>; // the important part
    case 24: return <FamilyAll rime="at" a={a} sp={sp} u={u} />; // every word ending at says At
    case 25: return <Row gap={u(16)}><Tile ch="?" size={u(170)} tone="dim" at={a} hot /><Tile ch="at" size={u(170)} tone="ending" w={u(170) * 1.2} /></Row>; // a different letter in front
    case 26: return <Icon glyph={"\u{1F440}"} size={u(190)} />;                                 // watch
    case 27: return <Swap rime="at" pair={["c", "b"]} a={a} frameNow={frameNow} u={u} />;       // keep At, change the front
    case 36: return <Row gap={u(12)}><Num n="8" a={a} u={u} />{FAMILIES.at.map((wd, i) => <Tile key={wd} ch={wd[0]} size={u(80)} at={a + i * sp(8)} seed={i} />)}</Row>; // eight words
    case 37: return <Tile ch="at" size={u(230)} tone="ending" at={a} hot w={u(230) * 1.2} />;   // one ending
    case 38: return <FamilyAll rime="at" a={a} sp={sp} u={u} />; // a word FAMILY
    case 39: return <FamilyAll rime="at" a={a} sp={sp} u={u} />; // all end the same way
    case 40: return <Row gap={u(16)}><Num n="8" a={a} u={u} /><Icon glyph={"\u{1F4D6}"} size={u(140)} /></Row>; // you read eight words
    case 41: return <Row gap={u(24)}>{[0, 1, 2].map((i) => <Icon key={i} glyph={"⭐"} size={u(130)} />)}</Row>; // well done!
    // ── ‑an (house from 42) ──
    case 42: return <Row gap={u(16)}><Tile ch="at" size={u(150)} tone="dim" w={u(150) * 1.2} /><Line text={"→"} size={u(90)} at={a} /><Tile ch="an" size={u(180)} tone="ending" at={a + 6} w={u(180) * 1.2} /></Row>; // same vowel, new ending
    case 43: return <Tile ch="?" size={u(200)} tone="dim" at={a} hot />;                        // here is our next family
    case 44: return <Tile ch="an" size={u(250)} tone="ending" at={a} hot w={u(250) * 1.2} />;   // An.
    case 45: return <Row gap={u(20)}><Ear at={a} size={u(170)} /><Tile ch="a" size={u(190)} tone="ending" at={a} hot /></Row>; // listen to the vowel
    case 46: return <Row gap={u(20)}><WordLit word="at" rime="a" size={u(140)} at={a} dimFront={false} /><WordLit word="an" rime="a" size={u(140)} at={a + 6} dimFront={false} /></Row>; // still a short a
    case 47: return <HoldVowel vowel="a" tails={["t", "n"]} a={a} frameNow={frameNow} u={u} />; // only the LAST letter changed
    case 56: return <Num n="8" a={a} u={u} />;                                                  // eight more
    case 57: return <Num n="16" a={a} u={u} />;                                                 // sixteen already
    // ── ‑ap (house from 58) ──
    case 58: return <Row gap={u(16)}><Tile ch="a" size={u(170)} tone="ending" hot /><Tile ch="?" size={u(150)} tone="dim" at={a} /></Row>; // one more a family
    case 59: return <Tile ch="ap" size={u(250)} tone="ending" at={a} hot w={u(250) * 1.2} />;   // Ap.
    case 66: return <Icon glyph={"\u{1F440}"} size={u(190)} />;                                 // look what is happening
    case 67: return <HoldVowel vowel="a" tails={["t", "n", "p"]} a={a} frameNow={frameNow} u={u} />; // the a stays put
    case 68: return <HoldVowel vowel="a" tails={["t", "n", "p"]} a={a} frameNow={frameNow} u={u} />; // letters around it move
    case 69: return <Row gap={u(24)}>{[0, 1, 2].map((i) => <Icon key={i} glyph={"⭐"} size={u(130)} />)}</Row>; // doing really well
    // ── ‑en (house from 70) ──
    case 70: return <Row gap={u(16)}><Tile ch="a" size={u(140)} tone="dim" /><Line text={"→"} size={u(84)} at={a} /><Tile ch="e" size={u(190)} tone="ending" at={a + 5} hot /></Row>; // change the vowel
    case 71: return <Tile ch="e" size={u(230)} tone="ending" at={a} hot />;                     // a short e
    case 72: return <Tile ch="en" size={u(250)} tone="ending" at={a} hot w={u(250) * 1.2} />;   // our family is En
    case 78: return <Row gap={u(20)}><Icon glyph={"\u{1F5E3}"} size={u(140)} /><Tile ch="en" size={u(180)} tone="ending" at={a} w={u(180) * 1.2} /></Row>; // say the ending
    case 79: return <Tile ch="en" size={u(250)} tone="ending" at={a} hot w={u(250) * 1.2} />;   // En.
    case 80: return <Row gap={u(14)}><Num n="5" a={a} u={u} /><Icon glyph={"\u{1FA84}"} size={u(130)} /></Row>; // five words, trick again
    // ── the i families (ig 81 · it 90 · in 98) ──
    case 81: return <Tile ch="i" size={u(230)} tone="ending" at={a} hot />;                     // now a short i
    case 82: return <Row gap={u(16)}><Ear at={a} size={u(150)} />{[0, 1, 2].map((i) => <Tile key={i} ch="?" size={u(120)} tone="dim" at={a + i * sp(3)} seed={i} />)}</Row>; // three families
    case 83: return <Tile ch="ig" size={u(250)} tone="ending" at={a} hot w={u(250) * 1.2} />;   // First, Ig
    case 90: return <Tile ch="it" size={u(250)} tone="ending" at={a} hot w={u(250) * 1.2} />;   // Next, It
    case 98: return <Tile ch="in" size={u(250)} tone="ending" at={a} hot w={u(250) * 1.2} />;   // And In
    case 104: return <Icon glyph={"\u{1F914}"} size={u(190)} />;                                // did you notice?
    case 105: return <Row gap={u(18)}>{["ig", "it", "in"].map((r, i) => <WordLit key={r} word={r} rime="i" size={u(120)} at={a + i * sp(3)} dimFront={false} />)}</Row>; // same vowel in all three
    case 106: return <Tile ch="i" size={u(240)} tone="ending" at={a} hot />;                    // i never changed
    case 107: return <HoldVowel vowel="i" tails={["g", "t", "n"]} a={a} frameNow={frameNow} u={u} />; // only the END letter did
    case 108: return <Num n="18" a={a} u={u} />;                                                // eighteen more
    case 109: return <Row gap={u(24)}>{[0, 1, 2].map((i) => <Icon key={i} glyph={"⭐"} size={u(130)} />)}</Row>; // reading beautifully
    // ── the o families (og 110 · ot 118 · op 126) ──
    case 110: return <Tile ch="o" size={u(230)} tone="ending" at={a} hot />;                    // now a short o
    case 111: return <Row gap={u(16)}>{[0, 1, 2].map((i) => <Tile key={i} ch="?" size={u(130)} tone="dim" at={a + i * sp(3)} seed={i} />)}</Row>; // three families again
    case 112: return <Tile ch="og" size={u(250)} tone="ending" at={a} hot w={u(250) * 1.2} />;  // Og.
    case 118: return <Tile ch="ot" size={u(250)} tone="ending" at={a} hot w={u(250) * 1.2} />;  // Ot.
    case 126: return <Tile ch="op" size={u(250)} tone="ending" at={a} hot w={u(250) * 1.2} />;  // Op.
    case 132: return <Row gap={u(14)}><Ear at={a} size={u(150)} /><Tile ch="t" size={u(140)} tone="dim" /><Tile ch="o" size={u(180)} tone="ending" hot at={a} /><Tile ch="p" size={u(140)} tone="dim" seed={1} /></Row>; // listen to the MIDDLE
    case 133: return <Tile ch="o" size={u(240)} tone="ending" at={a} hot />;                    // same o every time
    // ── the u families (un 134 · ug 142) ──
    case 134: return <Tile ch="u" size={u(230)} tone="ending" at={a} hot />;                    // last short vowel: u
    case 135: return <Tile ch="un" size={u(250)} tone="ending" at={a} hot w={u(250) * 1.2} />;  // Un.
    case 142: return <Tile ch="ug" size={u(250)} tone="ending" at={a} hot w={u(250) * 1.2} />;  // Ug.
    case 149: return <Row gap={u(14)}><Num n="12" a={a} u={u} /><Tile ch="un" size={u(120)} tone="ending" w={u(120) * 1.2} /><Tile ch="ug" size={u(120)} tone="ending" seed={1} w={u(120) * 1.2} /></Row>; // twelve from two
    // ── ‑all, the honest one (house from 150) ──
    case 150: return <Row gap={u(18)}><Tile ch="all" size={u(170)} tone="dim" at={a} w={u(170) * 1.5} /><Icon glyph={"❗"} size={u(130)} /></Row>; // I have to be honest
    case 151: return <Tile ch="?" size={u(200)} tone="dim" at={a} hot />;                       // here it is
    case 152: return <Tile ch="all" size={u(250)} tone="ending" at={a} hot w={u(250) * 1.5} />; // All.
    case 160: return <Swap rime="all" pair={["b", "t"]} a={a} frameNow={frameNow} u={u} />;     // the trick still works
    case 161: return <Swap rime="all" pair={["b", "t"]} a={a} frameNow={frameNow} u={u} />;     // change the front
    case 162: return <Row gap={u(14)}><Ear at={a} size={u(150)} /><Tile ch="b" size={u(140)} tone="dim" /><Tile ch="a" size={u(180)} tone="ending" hot at={a} /><Tile ch="ll" size={u(140)} tone="dim" seed={1} w={u(140) * 1.2} /></Row>; // listen to the middle
    case 164: return <Row gap={u(20)}><Tile ch="a" size={u(180)} at={a} /><Icon glyph={"❌"} size={u(120)} /></Row>; // NOT a short a
    case 165: return <Row gap={u(20)}><WordLit word="cat" rime="a" size={u(120)} at={a} dimFront={false} /><Icon glyph={"❌"} size={u(110)} /></Row>; // not like cat
    case 166: return <Row gap={u(16)}><Tile ch="a" size={u(150)} tone="dim" /><Line text={"→"} size={u(84)} at={a} /><Icon glyph={"✨"} size={u(130)} /></Row>; // changed into something else
    case 167: return <Row gap={u(14)}>{["a", "l", "l"].map((c, i) => <Tile key={i} ch={c} size={u(140)} tone="dim" seed={i} />)}<Icon glyph={"❌"} size={u(110)} /></Row>; // don't sound it out
    case 168: return <Tile ch="all" size={u(240)} tone="ending" at={a} hot w={u(240) * 1.5} />; // ONE piece
    case 169: return <Row gap={u(14)}>{["a", "l", "l"].map((c, i) => <Tile key={i} ch={c} size={u(130)} at={a + i * sp(3)} seed={i} />)}<Line text={"→"} size={u(80)} at={a + 14} /><Tile ch="all" size={u(170)} tone="ending" at={a + 18} w={u(170) * 1.5} /></Row>; // a,l,l → All
    case 173: return <Row gap={u(20)}><Icon glyph={"\u{1F5E3}"} size={u(140)} /><Tile ch="all" size={u(180)} tone="ending" at={a} w={u(180) * 1.5} /></Row>; // say it with me
    case 174: return <Tile ch="all" size={u(250)} tone="ending" at={a} hot w={u(250) * 1.5} />; // All.
    case 175: return <WordLit word="ball" rime="all" size={u(150)} at={a} />;                   // look at the ending
    case 176: return <Row gap={u(16)}><Tile ch="l" size={u(180)} at={a} hot /><Tile ch="l" size={u(180)} at={a + 5} seed={1} hot /></Row>; // two l's
    case 177: return <Icon glyph={"\u{1F914}"} size={u(190)} />;                                // remember why?
    case 178: return <Row gap={u(16)}><Tile ch="ff" size={u(130)} /><Tile ch="ll" size={u(150)} at={a} hot seed={1} /><Icon glyph={"✅"} size={u(100)} /></Row>; // the Floss rule
    // ── your turn (banner: YOUR TURN!) ──
    case 179: return <Icon glyph={"\u{1F3AF}"} size={u(190)} />;                                // now it is your turn
    case 180: return <Row gap={u(16)}><Tile ch="?" size={u(160)} tone="dim" at={a} hot /><Tile ch="en" size={u(160)} tone="ending" w={u(160) * 1.2} /></Row>; // you tell me the front
    case 181: return <Tile ch="?" size={u(180)} tone="dim" at={a} />;                           // here is the ending
    case 182: return <Tile ch="en" size={u(250)} tone="ending" at={a} hot w={u(250) * 1.2} />;  // En.
    case 183: return <Icon glyph={"\u{1F5BC}"} size={u(180)} />;
    case 184: return <Pic word="hen" size={u(300)} />;                                     // A hen. — picture ONLY, no spelling
    case 191: return <Pic word="bug" size={u(300)} />;                                     // …is a bug. — picture ONLY                                // here is the picture
    case 185: return <Row gap={u(16)}><Pic word="hen" size={u(180)} /><Tile ch="?" size={u(150)} tone="dim" at={a} hot /><Tile ch="en" size={u(150)} tone="ending" w={u(150) * 1.2} /></Row>; // which letter starts it?
    case 186: return <Tile ch="h" size={u(230)} at={a} hot />;                                  // H.
    case 188: return <Row gap={u(20)}><Icon glyph={"✅"} size={u(140)} /><Icon glyph={"⭐"} size={u(120)} /></Row>; // that is right!
    case 189: return <Icon glyph={"\u{1F449}"} size={u(180)} />;                                // one more
    case 190: return <Tile ch="ug" size={u(250)} tone="ending" at={a} hot w={u(250) * 1.2} />;  // the ending is Ug
    case 192: return <Row gap={u(16)}><Pic word="bug" size={u(180)} /><Tile ch="?" size={u(150)} tone="dim" at={a} hot /><Tile ch="ug" size={u(150)} tone="ending" w={u(150) * 1.2} /></Row>; // which letter?
    case 193: return <Tile ch="b" size={u(230)} at={a} hot />;                                  // B.
    case 195: return <Row gap={u(24)}>{[0, 1, 2].map((i) => <Icon key={i} glyph={"⭐"} size={u(130)} />)}</Row>; // excellent!
    case 196: return <Icon glyph={"\u{1F4A1}"} size={u(190)} />;                                // the whole skill
    case 197: return <Row gap={u(16)}><Tile ch="at" size={u(170)} tone="ending" hot w={u(170) * 1.2} /><Line text={"→"} size={u(84)} at={a} /><Tile ch="?" size={u(150)} tone="dim" at={a + 5} /></Row>; // ending first, then the front
    // ── remember + close ──
    case 198: return <Icon glyph={"\u{1F9E0}"} size={u(190)} />;                                // what we learned
    case 199: return <FamilyAll rime="at" a={a} sp={sp} u={u} />; // end the same way
    case 200: return <Row gap={u(16)}><Tile ch="at" size={u(160)} tone="ending" hot w={u(160) * 1.2} /><Line text={"→"} size={u(80)} at={a} />{["c", "b", "h"].map((c, i) => <Tile key={c} ch={c} size={u(110)} at={a + 6 + i * 3} seed={i} />)}</Row>; // read the ending → read them all
    case 201: return <Swap rime="at" pair={["c", "b"]} a={a} frameNow={frameNow} u={u} />;      // only change the front
    case 202: return <Row gap={u(20)}><Num n="13" a={a} u={u} /><Line text={"→"} size={u(84)} at={a + 6} /><Num n="81" a={a + 10} u={u} /></Row>; // 13 families, 81 words
    case 203: return <Num n="81" a={a} u={u} />;                                                // eighty-one
    case 204: return <Row gap={u(10)}>{["at", "an", "ap", "en", "ig", "it"].map((r, i) => <Tile key={r} ch={r} size={u(96)} tone="ending" at={a + i * sp(6)} seed={i} w={u(96) * 1.2} />)}</Row>; // from thirteen endings
    case 205: return <Icon glyph={"\u{1FA84}"} size={u(190)} />;                                // so useful
    case 206: return <Row gap={u(24)}>{[0, 1, 2].map((i) => <Icon key={i} glyph={"⭐"} size={u(130)} />)}</Row>; // proud of you
    case 207: return <Icon glyph={"\u{1F4D6}"} size={u(190)} />;                                // turns sounding out into reading
    case 208: return <LevelSix b={b} at={a} />;                                                 // next time, Level Six continues
    case 209: return <Icon glyph={"❗"} size={u(190)} />;                                   // don't miss it
    case 210: return <Row gap={u(24)}><Icon glyph={"\u{1F44D}"} size={u(150)} /><Icon glyph={"\u{1F514}"} size={u(150)} /></Row>; // like + subscribe
    default: return <Tile ch={houseFor(idx) ?? "at"} size={u(200)} tone="ending" w={u(200) * 1.3} />;
  }
};

export const L6FamiliesReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const b = bands(width, height);
  const idx = BEAT_OF[phraseAt(frame)];
  const storeFrom = at(STORE_FROM_IDX);
  const house = houseFor(idx);
  const words = house ? FAMILIES[house] : [];
  const shown = words.filter((wd) =>
    Object.entries(WORD).some(([i, c]) => c.rime === house && c.word === wd && Number(i) <= idx && Number(i) >= 28)
  ).length;
  const zipLetter = WORD[idx]
    ? WORD[idx].word.slice(0, WORD[idx].word.length - WORD[idx].rime.length) || WORD[idx].word[0]
    : house
      ? house[0]
      : undefined;   // the intro: just the smiley, no card (round 2, item 1)

  return (
    <AbsoluteFill>
      <Lane b={b} rime={house ?? "at"} dusk={idx >= 206} noHouse={!house} />
      <Sequence from={0} durationInFrames={f(AUDIO_SEC) + 8}>
        <Audio src={staticFile("audio/l6_families/l6.mp3")} />
      </Sequence>
      {SFX.map((c, i) => (
        <Sequence key={i} from={c.at} durationInFrames={45}>
          <Audio src={staticFile(`sfx/${c.file}.mp3`)} volume={c.vol} />
        </Sequence>
      ))}
      <Audio src={staticFile("music_bed.mp3")} loop
        volume={(fr) => interpolate(fr, [0, MUSIC_FADE_IN, L6_DURATION - MUSIC_FADE_OUT, L6_DURATION],
          [0, MUSIC_BED, MUSIC_BED, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />

      {frame < storeFrom && (
        <>
          <Banner b={b} text={bannerFor(idx)} />
          {house && <WashingLine b={b} words={words} shown={shown} rime={house} />}
          {house && <VowelStrip b={b} lit={house === "all" ? undefined : house[0]} />}
          <Content b={house ? b : { ...b, contentR: b.contentRFull }}><Scene idx={idx} b={b} /></Content>
          <Fixed b={b}>
            {PRAISE.map((i) => <Confetti key={i} frame={frame} fps={FPS} burstFrame={at(i)} origin={{ x: b.width / 2, y: b.height * 0.34 }} colors={[LANE.door, LANE.rose, LANE.sage, "#8FD3E8"]} count={26} seed={i} />)}
            <Mo b={b} />
            <Zip b={b} letter={zipLetter} at={WORD[idx] ? at(idx) : 0} />
          </Fixed>
          <Captions track={TRACK} maxWidth={b.wide ? 1180 : 900} />
          <Watermark corner="tr" widthFrac={b.wide ? 0.085 : 0.11} pad={b.wide ? 54 : 46} />
        </>
      )}

      <Sequence from={storeFrom}>
        <AbsoluteFill style={{ background: "rgba(20, 34, 26, 0.55)" }} />
        <StoreOutro silent total={L6_DURATION - storeFrom} ctaBg={LANE.door} titleColor="#FFFFFF" />
      </Sequence>
    </AbsoluteFill>
  );
};
