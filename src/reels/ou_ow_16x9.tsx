import React from "react";
import { Sequence } from "remotion";
import { ReelBase } from "./ReelBase";
import { comparisons } from "../data/comparisons";
import { Beat, BeatSpec, makeTrack, planBeats, sec } from "../lib/timing";
import { Captions, keywordColorFor } from "../components/Captions";
import { StoreOutro } from "../components/StoreOutro";
import { CircusSky, WordCircus } from "../components/WordCircus";
import { Slot, SlotState } from "../components/PositionSlot";
import { PairBonus, PairCopy, PairHook, PairQuiz, PairRecap, PairRule, PairSame, PairSeeIt, PairWhere } from "./pair_16x9_beats";
import { OuTwoSounds, TwoSoundCues } from "./ou_ow_beats";
import phrases from "../data/ou_ow_16x9.timing.json";
import { FPS } from "../data/tokens";

// ── ou/ow — the long-form 16:9 lesson ────────────────────────────────────────
// Fourth show, fourth world: THE TWO-RING CIRCUS. Three podiums are the three positions
// and a clown bounces onto whichever the narration names.
//
//   out   → ou |    |       ou can open the word — the FIRST slot is finally used
//   cloud → cl | ou | d     ou tucked inside
//   cow   →    | c  | ow    ow last, nothing after it
//   brown → br | ow | n     ow guarding a single final letter
//
// This card carries two beats the others don't:
//   · bonus     — the corrected rule ("ow guards a final n or l"), because plain
//                 "ow finishes the word" is false and this card's own words disprove it
//   · twoSounds — 85 seconds on ow's two sounds, the reason for a TWO-ring circus
//
// EVERY CUE IS LOOKED UP, NOT TYPED: P(i) is aligned phrase i, W("word") a spoken word.
const data = comparisons.ou_ow;
const AUDIO_SEC = 213.8;
const track = makeTrack(phrases as never, AUDIO_SEC);

const P = (i: number) => sec((phrases as { start: number }[])[i].start, FPS);
const W = (needle: string, nth = 0) => {
  const f = track.wordAbs(needle, { nth });
  if (f < 0) throw new Error(`ou_ow_16x9: "${needle}"#${nth} is not in the aligned narration`);
  return f;
};

// phrase-index ranges (inclusive). See tools/scripts/ou_ow_16x9.txt.
const SPECS: BeatSpec[] = [
  { id: "hook", from: 0, to: 6 },        // Ouch! … Ou, and ow. … Say it with me.
  { id: "same", from: 7, to: 9 },        // cloud … cow … same sound
  { id: "where", from: 10, to: 12 },     // which one? … WHERE the sound sits
  { id: "ruleMid", from: 13, to: 19 },   // ou: beginning + middle. Out. Cl-ou-d. H-ou-se.
  { id: "ruleEnd", from: 20, to: 24 },   // ow: the END. C-ow. N-ow. H-ow.
  { id: "bonus", from: 25, to: 29 },     // …or right before a final n or l. Br-ow-n. Ow-l.
  { id: "twoSounds", from: 30, to: 66 }, // ow's two sounds — 85s, the centrepiece
  { id: "seeIt", from: 67, to: 82 },     // six ou words, then six ow words
  { id: "quiz", from: 83, to: 88 },      // your turn → brown → it's ow
  { id: "recap", from: 89, to: 92 },     // So remember…
  { id: "wrap", from: 93, to: 95 },      // CTA
];
export const ouOwBeats = planBeats(track, SPECS);
const beats = ouOwBeats;
const byId: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));
export const OU_OW_16X9_DURATION = track.totalFrames;
export const ouOwTrack = track;
export const ouOwP = P;
export const ouOwW = W;

export const OU_OW_WORDS_MID = ["out", "cloud", "house", "mouth", "round", "shout"];
export const OU_OW_WORDS_END = ["cow", "now", "how", "wow", "brown", "owl"];

export const OU_OW_COPY: PairCopy = {
  soundLabel: "/ow/ — “ouch!”",
  // this card has no "we never write…" beat; the bonus beat took that slot
  wrong: [{ bad: "cowd", good: "cloud" }, { bad: "cou", good: "cow" }],
  // plain "Your turn!" opens the beat, so the FIRST "it's" is the answer (nth is 0-based)
  reveal: { needle: "it's", nth: 0 },
};

// the two-sound beat's sub-cues, BEAT-RELATIVE (it renders inside its own Sequence)
const R = (i: number) => P(i) - P(30);
export const OU_OW_TWO_SOUND_CUES: TwoSoundCues = {
  longO: R(32),                              // "ow was saying the long O"
  callback: R(31),                           // "Do you remember our oa and ow video?"
  longLabel: R(32),                          // the "· long O" label lands here
  longWords: [R(33), R(34), R(35)],          // Snow. Grow. Show.
  owSound: R(36),                            // "But here, ow is saying ow!"
  owWords: [R(37), R(38), R(39)],            // Cow. Brown. Owl.
  sameLetters: R(40),                        // "Same two letters."
  noRule: R(42),                             // "So how do you know which sound to say?"
  letters: R(44),                            // "The letters don't tell you."
  noRuleStamp: R(45),                        // "There is no rule for this one."
  testIt: R(46),                             // "You have to test it."
  test1: R(47),                              // "Watch me."
  test1Word: R(48),                          // "Sn-ow."
  test1Ok: R(50),                            // "Snow is a real word!"
  test2: R(52),                              // "Now this one."
  test2Word: R(53),                          // "C-ow."
  test2Bad: R(55),                           // "Coe is not a word."
  test2Ok: R(58),                            // "Cow!"
  trick: R(60),                              // "That's the trick."
  writeRead: R(63),                          // "And don't worry."
  writeStamp: R(64),                         // "Our spelling rule still works perfectly."
  writeRule: R(65),                          // "When you WRITE, ou goes inside…"
  readFocus: R(66),                          // "It is only the SOUND you have to test."
};

// ── the circus's content, per absolute frame ─────────────────────────────────
const marker = (t: string): Slot => ({ text: t, kind: "marker" });
const letter = (t: string): Slot => ({ text: t, kind: "letter" });
const ghost = (t: string): Slot => ({ text: t, kind: "ghost" });

export const ouOwStateFor = (f: number): SlotState => {
  // bonus — ow with exactly one letter after it, so "almost last" is visible
  if (f >= P(25)) {
    if (f < P(27)) return { cars: [ghost("?"), marker("ow"), ghost("?")], litIdx: 1 };
    if (f < P(28)) return { cars: [letter("br"), marker("ow"), { ...letter("n"), tag: "just one!" }], litIdx: 1 };
    if (f < P(29)) return { cars: [letter("t"), marker("ow"), { ...letter("n"), tag: "just one!" }], litIdx: 1 };
    return { cars: [null, marker("ow"), { ...letter("l"), tag: "just one!" }], litIdx: 1 };
  }
  // ruleEnd — ow last, nothing after it
  if (f >= P(20)) {
    if (f < P(21)) return { cars: [null, ghost("?"), marker("ow")], litIdx: 2 };
    if (f < P(22)) return { cars: [null, letter("c"), marker("ow")], litIdx: 2 };
    if (f < P(23)) return { cars: [null, letter("n"), marker("ow")], litIdx: 2 };
    return { cars: [null, letter("h"), marker("ow")], litIdx: 2 };
  }
  // ruleMid — ou at the BEGINNING and in the MIDDLE. "Out" is why slot 0 exists on this card.
  if (f >= P(13)) {
    if (f < P(16)) {
      // "Ou likes the beginning and the middle" — the clown visits both as they are named
      const at = f >= W("middle") ? 1 : 0;
      return { cars: [marker("ou"), marker("ou"), ghost("?")], litIdx: at };
    }
    if (f < P(17)) return { cars: [marker("ou"), letter("t"), null], litIdx: 0 }; // Out
    if (f < P(18)) return { cars: [letter("cl"), marker("ou"), letter("d")], litIdx: 1 }; // Cloud
    if (f < P(19)) return { cars: [letter("h"), marker("ou"), letter("se")], litIdx: 1 }; // House
    // "Ou stays tucked inside the word" — name what is on each side of it
    return { cars: [{ ...letter("h"), tag: "⬅ before" }, marker("ou"), { ...letter("se"), tag: "after ➡" }], litIdx: 1 };
  }
  // where — "WHERE the sound sits": the clown bounces the row, ~0.7s a podium
  if (f >= P(12)) {
    return { cars: [marker("ou"), marker("ou"), marker("ow")], litIdx: Math.floor((f - P(12)) / 21) % 3 };
  }
  // where — the opening question: the two spellings trade the spotlight
  if (f >= P(10)) {
    return { cars: [ghost("?"), marker("ou"), marker("ow")], litIdx: Math.floor((f - P(10)) / 34) % 2 === 0 ? 1 : 2 };
  }
  // same — the two anchor words actually LOAD
  if (f >= P(8)) return { cars: [null, letter("c"), marker("ow")], litIdx: 2 }; // cow
  if (f >= P(7)) return { cars: [letter("cl"), marker("ou"), letter("d")], litIdx: 1 }; // cloud
  // hook — each spelling lights as it is named
  if (f >= P(4)) return { cars: [ghost("?"), marker("ou"), marker("ow")], litIdx: Math.floor((f - P(4)) / 28) % 2 === 0 ? 1 : 2 };
  if (f >= P(2)) return { cars: [ghost("?"), marker("ou"), marker("ow")], litIdx: 2 };
  return { cars: [ghost("?"), marker("ou"), marker("ow")], litIdx: 1 }; // frame 0 = complete cover
};

// ou owns the BEGINNING podium as well as the middle one, so slot 0 is not neutral here
export const ouOwColorFor = (i: number) => (i === 2 ? data.teams[1].colorHex : data.teams[0].colorHex);

type Cue = { from: number; name: string; vol: number };
export const OU_OW_SFX: Cue[] = [
  { from: P(0), name: "boing", vol: 0.36 }, // "Ouch!"
  { from: P(2), name: "pop", vol: 0.3 },
  { from: P(4), name: "pop", vol: 0.3 },
  { from: P(9), name: "sparkle", vol: 0.36 },
  { from: P(12), name: "chime_soft", vol: 0.34 },
  { from: P(16), name: "tick", vol: 0.32 },
  { from: P(17), name: "tick", vol: 0.32 },
  { from: P(18), name: "tick", vol: 0.32 },
  { from: P(21), name: "tick", vol: 0.32 },
  { from: P(22), name: "tick", vol: 0.32 },
  { from: P(23), name: "correct", vol: 0.32 },
  { from: P(25), name: "twinkle", vol: 0.34 }, // "here's a bonus"
  { from: P(27), name: "tick", vol: 0.3 },
  { from: P(29), name: "correct", vol: 0.32 },
  { from: P(30), name: "swoosh_soft", vol: 0.32 }, // into the two-ring beat
  { from: P(36), name: "boing", vol: 0.3 },
  { from: P(40), name: "chime_soft", vol: 0.34 },
  { from: P(50), name: "correct", vol: 0.34 }, // snow ✓
  { from: P(55), name: "boing", vol: 0.34 },   // coe ✗ — no "wrong" sfx exists; a missing
                                              // staticFile renders SILENT, not an error
  { from: P(58), name: "correct", vol: 0.36 }, // cow ✓
  { from: P(67), name: "swoosh_soft", vol: 0.32 },
  { from: P(75), name: "swoosh_soft", vol: 0.3 },
  { from: P(83), name: "question", vol: 0.34 },
  { from: P(87) - sec(1.4, FPS), name: "drumroll", vol: 0.3 },
  { from: P(87), name: "correct", vol: 0.4 },
  { from: P(89), name: "sparkle", vol: 0.36 },
  { from: P(93), name: "twinkle", vol: 0.34 },
];

const overlayFor = (b: Beat) => {
  switch (b.id) {
    case "hook": return <PairHook data={data} beat={b} />;
    case "same": return <PairSame data={data} beat={b} copy={OU_OW_COPY} />;
    case "where": return <PairWhere data={data} beat={b} />;
    case "ruleMid": return <PairRule data={data} beat={b} teamIdx={0} />;
    case "ruleEnd": return <PairRule data={data} beat={b} teamIdx={1} />;
    case "bonus": return <PairBonus data={data} beat={b} ruleAt={P(26) - b.from} guards="a final n or l" examples={["brown", "owl"]} />;
    case "twoSounds": return <OuTwoSounds data={data} beat={b} cues={OU_OW_TWO_SOUND_CUES} />;
    case "seeIt": return <PairSeeIt data={data} beat={b} wordsMid={OU_OW_WORDS_MID} wordsEnd={OU_OW_WORDS_END} />;
    case "quiz": return <PairQuiz data={data} beat={b} copy={OU_OW_COPY} word="brown" blanked="br__n" answer={1} />;
    case "recap": return <PairRecap data={data} beat={b} />;
    // the big top competes with the store card, but cutting away from it made the world
    // jump — so the tent stays and is washed back behind the card instead
    case "wrap": return <StoreOutro silent compact total={b.durationInFrames} bg="rgba(255,252,248,0.76)" />;
    default: return null;
  }
};

export const OuOw16x9Reel: React.FC = () => (
  <ReelBase
    audio="audio/ou_ow_16x9/ou_ow_16x9.mp3"
    hueShift={data.hueShift}
    sfx={OU_OW_SFX}
    total={OU_OW_16X9_DURATION}
    background={<CircusSky />}
    logoUntil={byId.wrap.from}
    logoCorner="tr"
  >
    {/* the set — top-level so it reads the ABSOLUTE frame; the two-ring beat takes over */}
    <WordCircus
      data={data}
      stateFor={ouOwStateFor}
      colorFor={ouOwColorFor}
      showLabelsFrom={P(12)}
      // the narration never lists the three positions in a row on this card: it names the
      // beginning and the middle together ("Ou likes the beginning and the middle"), then
      // the end much later ("Ow takes the END of the word").
      labelLitAt={[W("beginning"), W("middle"), P(20)]}
      sweep={{ from: P(12), to: P(13) }}
      hideAt={byId.twoSounds.from}
    />

    {beats.map((b) => {
      const node = overlayFor(b);
      return node ? (
        <Sequence key={b.id} from={b.from} durationInFrames={b.durationInFrames}>
          {node}
        </Sequence>
      ) : null;
    })}

    {/* captions stop before the download beat, or they render behind the phone mock */}
    <Sequence from={0} durationInFrames={byId.wrap.from}>
      <Captions track={track} keywordColor={keywordColorFor(data)} maxWidth={1360} fontSize={40} bottom={70} />
    </Sequence>
  </ReelBase>
);
