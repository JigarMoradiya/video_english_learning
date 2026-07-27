import React from "react";
import { Sequence } from "remotion";
import { ReelBase } from "./ReelBase";
import { comparisons } from "../data/comparisons";
import { Beat, BeatSpec, makeTrack, planBeats, sec } from "../lib/timing";
import { Captions, keywordColorFor } from "../components/Captions";
import { StoreOutro } from "../components/StoreOutro";
import { LawnSky, WordLawn } from "../components/WordLawn";
import { Slot, SlotState } from "../components/PositionSlot";
import { PairBonus, PairCopy, PairHook, PairNotThis, PairQuiz, PairRecap, PairRule, PairSame, PairSeeIt, PairWhere } from "./pair_16x9_beats";
import { AwOneSound, OneSoundCues } from "./au_aw_beats";
import phrases from "../data/au_aw_16x9.timing.json";
import { FPS } from "../data/tokens";

// ── au/aw — the long-form 16:9 lesson ────────────────────────────────────────
// Fifth show, fifth world: THE SLEEPY LAWN, and the only one whose background travels —
// the sky runs from night to dawn across the whole video. The card chose it: the /aw/
// sound IS a yawn, and its words are the world (yawn, dawn, lawn, paw, claw, crawl).
//
//   autumn → au | tumn |        au can open the word
//   sauce  → s  | au   | ce     au tucked inside
//   saw    →    | s    | aw     aw last, nothing after it
//   yawn   → y  | aw   | n      aw guarding a single final letter
//
// Three garden signs are the three positions and a sleepy cat PADS between them — a walk
// and a stretch, not the frog's hop or the clown's bounce.
//
// EVERY CUE IS LOOKED UP, NOT TYPED: P(i) is aligned phrase i, W("word") a spoken word.
const data = comparisons.au_aw;
const AUDIO_SEC = 162.9;
const track = makeTrack(phrases as never, AUDIO_SEC);

const P = (i: number) => sec((phrases as { start: number }[])[i].start, FPS);
const W = (needle: string, nth = 0) => {
  const f = track.wordAbs(needle, { nth });
  if (f < 0) throw new Error(`au_aw_16x9: "${needle}"#${nth} is not in the aligned narration`);
  return f;
};

// phrase-index ranges (inclusive). See tools/scripts/au_aw_16x9.txt.
const SPECS: BeatSpec[] = [
  { id: "hook", from: 0, to: 6 },       // Yaaawn… Au, and aw. Say it with me.
  { id: "same", from: 7, to: 9 },       // author … saw … same sound
  { id: "where", from: 10, to: 12 },    // which one? … WHERE is the sound
  { id: "ruleMid", from: 13, to: 19 },  // au: beginning + middle. Au-tumn. S-au-ce. P-au-se.
  { id: "ruleEnd", from: 20, to: 24 },  // aw: the END. S-aw. P-aw. Dr-aw.
  { id: "bonus", from: 25, to: 31 },    // …and right before a final letter. Y-aw-n. Cr-aw-l.
  { id: "notThis", from: 32, to: 35 },  // never sau / never awtumn
  { id: "oneSound", from: 36, to: 42 }, // the ou/ow payoff: aw has only ONE sound
  { id: "seeIt", from: 43, to: 58 },    // six au words, then six aw words
  { id: "quiz", from: 59, to: 64 },     // your turn → yawn → it's aw
  { id: "recap", from: 65, to: 67 },    // So remember…
  { id: "wrap", from: 68, to: 70 },     // CTA
];
const beats = planBeats(track, SPECS);
const byId: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));
export const AU_AW_16X9_DURATION = track.totalFrames;

const WORDS_MID = ["author", "autumn", "sauce", "launch", "pause", "because"];
const WORDS_END = ["saw", "paw", "draw", "yawn", "dawn", "crawl"];

const COPY: PairCopy = {
  soundLabel: "/aw/ — “yaaawn”",
  // the narration says "sau" first, then "awtumn"
  wrong: [{ bad: "sau", good: "saw" }, { bad: "awtumn", good: "autumn" }],
  // plain "Your turn!" opens the beat, so the FIRST "it's" is the answer (nth is 0-based)
  reveal: { needle: "it's", nth: 0 },
};

const R = (i: number) => P(i) - P(36);
const ONE_SOUND_CUES: OneSoundCues = {
  fork: R(37),      // "Remember ow, with its two different sounds?"
  notLike: R(38),   // "Aw is not like that."
  oneSound: R(39),  // "Aw only ever says one sound."
  always: R(41),    // "Always aw."
  trust: R(42),     // "You can trust it every single time."
};

// ── the lawn's content, per absolute frame ───────────────────────────────────
const marker = (t: string): Slot => ({ text: t, kind: "marker" });
const letter = (t: string): Slot => ({ text: t, kind: "letter" });
const ghost = (t: string): Slot => ({ text: t, kind: "ghost" });

const signStateFor = (f: number): SlotState => {
  // notThis — each wrong spelling sits where it does NOT belong, crossed out
  if (f >= P(32)) {
    if (f < P(33)) return { cars: [null, letter("s"), { text: "au", kind: "cross" }], litIdx: 2 };
    if (f < P(34)) return { cars: [{ text: "aw", kind: "cross" }, letter("tumn"), null], litIdx: 0 };
    if (f < P(35)) return { cars: [marker("au"), letter("tumn"), null], litIdx: 0 };
    return { cars: [null, letter("s"), marker("aw")], litIdx: 2 };
  }
  // bonus — aw with exactly one letter after it
  if (f >= P(25)) {
    if (f < P(27)) return { cars: [null, ghost("?"), marker("aw")], litIdx: 2 };
    if (f < P(28)) return { cars: [letter("y"), marker("aw"), { ...letter("n"), tag: "just one!" }], litIdx: 1 };
    if (f < P(29)) return { cars: [letter("d"), marker("aw"), { ...letter("n"), tag: "just one!" }], litIdx: 1 };
    return { cars: [letter("cr"), marker("aw"), { ...letter("l"), tag: "just one!" }], litIdx: 1 };
  }
  // ruleEnd — aw last, nothing after it
  if (f >= P(20)) {
    if (f < P(21)) return { cars: [null, ghost("?"), marker("aw")], litIdx: 2 };
    if (f < P(22)) return { cars: [null, letter("s"), marker("aw")], litIdx: 2 };
    if (f < P(23)) return { cars: [null, letter("p"), marker("aw")], litIdx: 2 };
    return { cars: [null, letter("dr"), marker("aw")], litIdx: 2 };
  }
  // ruleMid — au at the BEGINNING and inside
  if (f >= P(13)) {
    if (f < P(16)) {
      const at = f >= W("middle") ? 1 : 0;
      return { cars: [marker("au"), marker("au"), ghost("?")], litIdx: at };
    }
    if (f < P(17)) return { cars: [marker("au"), letter("tumn"), null], litIdx: 0 }; // Autumn
    if (f < P(18)) return { cars: [letter("s"), marker("au"), letter("ce")], litIdx: 1 }; // Sauce
    if (f < P(19)) return { cars: [letter("p"), marker("au"), letter("se")], litIdx: 1 }; // Pause
    return { cars: [{ ...letter("p"), tag: "⬅ before" }, marker("au"), { ...letter("se"), tag: "after ➡" }], litIdx: 1 };
  }
  // where — "WHERE is the sound in the word?": the cat pads the row
  if (f >= P(12)) {
    return { cars: [marker("au"), marker("au"), marker("aw")], litIdx: Math.floor((f - P(12)) / 24) % 3 };
  }
  if (f >= P(10)) {
    return { cars: [ghost("?"), marker("au"), marker("aw")], litIdx: Math.floor((f - P(10)) / 34) % 2 === 0 ? 1 : 2 };
  }
  // same — the two anchor words load
  if (f >= P(8)) return { cars: [null, letter("s"), marker("aw")], litIdx: 2 }; // saw
  if (f >= P(7)) return { cars: [marker("au"), letter("thor"), null], litIdx: 0 }; // author
  // hook
  if (f >= P(4)) return { cars: [ghost("?"), marker("au"), marker("aw")], litIdx: Math.floor((f - P(4)) / 28) % 2 === 0 ? 1 : 2 };
  if (f >= P(2)) return { cars: [ghost("?"), marker("au"), marker("aw")], litIdx: 2 };
  return { cars: [ghost("?"), marker("au"), marker("aw")], litIdx: 1 }; // frame 0 = complete cover
};

// au owns the BEGINNING sign as well as the middle one ("autumn", "author")
const lawnColorFor = (i: number) => (i === 2 ? data.teams[1].colorHex : data.teams[0].colorHex);

type Cue = { from: number; name: string; vol: number };
const SFX: Cue[] = [
  { from: P(0), name: "swoosh_soft", vol: 0.3 }, // the yawn
  { from: P(2), name: "pop", vol: 0.3 },
  { from: P(4), name: "pop", vol: 0.3 },
  { from: P(9), name: "sparkle", vol: 0.34 },
  { from: P(12), name: "chime_soft", vol: 0.34 },
  { from: P(16), name: "tick", vol: 0.3 },
  { from: P(17), name: "tick", vol: 0.3 },
  { from: P(18), name: "correct", vol: 0.3 },
  { from: P(21), name: "tick", vol: 0.3 },
  { from: P(22), name: "tick", vol: 0.3 },
  { from: P(23), name: "correct", vol: 0.32 },
  { from: P(25), name: "twinkle", vol: 0.32 },
  { from: P(27), name: "tick", vol: 0.3 },
  { from: P(29), name: "correct", vol: 0.32 },
  { from: P(32), name: "boing", vol: 0.3 },
  { from: P(33), name: "boing", vol: 0.3 },
  { from: P(36), name: "chime_soft", vol: 0.34 },
  { from: P(39), name: "sparkle", vol: 0.34 },
  { from: P(42), name: "correct", vol: 0.34 },
  { from: P(43), name: "swoosh_soft", vol: 0.32 },
  { from: P(51), name: "swoosh_soft", vol: 0.3 },
  { from: P(59), name: "question", vol: 0.34 },
  { from: P(63) - sec(1.4, FPS), name: "drumroll", vol: 0.3 },
  { from: P(63), name: "correct", vol: 0.4 },
  { from: P(65), name: "sparkle", vol: 0.36 },
  { from: P(68), name: "twinkle", vol: 0.34 },
];

const overlayFor = (b: Beat) => {
  switch (b.id) {
    case "hook": return <PairHook data={data} beat={b} />;
    case "same": return <PairSame data={data} beat={b} copy={COPY} />;
    case "where": return <PairWhere data={data} beat={b} />;
    case "ruleMid": return <PairRule data={data} beat={b} teamIdx={0} />;
    case "ruleEnd": return <PairRule data={data} beat={b} teamIdx={1} />;
    case "bonus": return <PairBonus data={data} beat={b} ruleAt={P(26) - b.from} guards="a final letter" examples={["yawn", "crawl"]} />;
    case "notThis": return <PairNotThis data={data} beat={b} copy={COPY} />;
    case "oneSound": return <AwOneSound data={data} beat={b} cues={ONE_SOUND_CUES} />;
    case "seeIt": return <PairSeeIt data={data} beat={b} wordsMid={WORDS_MID} wordsEnd={WORDS_END} />;
    case "quiz": return <PairQuiz data={data} beat={b} copy={COPY} word="yawn" blanked="y__n" answer={1} />;
    case "recap": return <PairRecap data={data} beat={b} />;
    // the sky is at full dawn by now and reads fine behind the store card, but a light wash
    // keeps it calm without cutting away from the world
    case "wrap": return <StoreOutro silent compact total={b.durationInFrames} bg="rgba(255,252,246,0.72)" />;
    default: return null;
  }
};

export const AuAw16x9Reel: React.FC = () => (
  <ReelBase
    audio="audio/au_aw_16x9/au_aw_16x9.mp3"
    hueShift={data.hueShift}
    sfx={SFX}
    total={AU_AW_16X9_DURATION}
    background={<LawnSky />}
    logoUntil={byId.wrap.from}
    logoCorner="tr"
  >
    <WordLawn
      data={data}
      stateFor={signStateFor}
      colorFor={lawnColorFor}
      showLabelsFrom={P(12)}
      // as on ou/ow the narration names the beginning and the middle together, then the end
      // much later ("Aw takes the END of the word")
      labelLitAt={[W("beginning"), W("middle"), P(20)]}
      sweep={{ from: P(12), to: P(13) }}
      hideAt={byId.oneSound.from}
    />

    {beats.map((b) => {
      const node = overlayFor(b);
      return node ? (
        <Sequence key={b.id} from={b.from} durationInFrames={b.durationInFrames}>
          {node}
        </Sequence>
      ) : null;
    })}

    <Sequence from={0} durationInFrames={byId.wrap.from}>
      <Captions track={track} keywordColor={keywordColorFor(data)} maxWidth={1360} fontSize={40} bottom={70} />
    </Sequence>
  </ReelBase>
);
