import React from "react";
import { Sequence } from "remotion";
import { ReelBase } from "./ReelBase";
import { comparisons } from "../data/comparisons";
import { Beat, BeatSpec, makeTrack, planBeats, sec } from "../lib/timing";
import { Captions, keywordColorFor } from "../components/Captions";
import { StoreOutro } from "../components/StoreOutro";
import { OceanSky, WordWaves } from "../components/WordWaves";
import { Slot, SlotState } from "../components/PositionSlot";
import { PairCopy, PairHook, PairNotThis, PairQuiz, PairRecap, PairRule, PairSame, PairSeeIt, PairWhere } from "./pair_16x9_beats";
import phrases from "../data/oa_ow_16x9.timing.json";
import { FPS } from "../data/tokens";

// ── oa/ow — the long-form 16:9 lesson ────────────────────────────────────────
// Third show, third world. The set is THE OPEN SEA: three rafts are the three positions,
// one swell runs through all of them, and a foam crest ROLLS along the row — because the
// line the user recorded is "oa SAILS in the middle, ow ROLLS to the end".
//
//   boat → b  | oa | t     oa lands in the MIDDLE raft
//   snow →    | sn | ow    ow lands in the LAST raft, and nothing follows it
//
// Beats + word hits are DATA-DRIVEN from src/data/oa_ow_16x9.timing.json (forced-aligned
// from the recorded narration) — no frame is hand-counted.
const data = comparisons.oa_ow;
const AUDIO_SEC = 110.035;
const track = makeTrack(phrases as never, AUDIO_SEC);

// phrase-index ranges (inclusive). See tools/scripts/oa_ow_16x9.txt for the mapping.
const SPECS: BeatSpec[] = [
  { id: "hook", from: 0, to: 2 },      //  1.17  Ohhh! Meet oa and ow. Two spellings…
  { id: "same", from: 3, to: 5 },      //  8.28  boat … snow … same sound
  { id: "where", from: 6, to: 9 },     // 15.04  which one? … WHERE … beginning, middle, end
  { id: "ruleMid", from: 10, to: 15 }, // 26.64  MIDDLE → oa. B. Oa. T. Boat!
  { id: "ruleEnd", from: 16, to: 21 }, // 37.14  END → ow. Sn. Ow. Snow! Nothing after
  { id: "notThis", from: 22, to: 25 }, // 48.34  never bowt / never snoa
  { id: "seeIt", from: 26, to: 41 },   // 58.50  six oa words, then six ow words
  { id: "quiz", from: 42, to: 47 },    // 88.14  your turn → road → it's oa
  { id: "recap", from: 48, to: 49 },   // 98.00  So remember…
  { id: "wrap", from: 50, to: 51 },    // 104.90 CTA
];
const beats = planBeats(track, SPECS);
const byId: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));
export const OA_OW_16X9_DURATION = track.totalFrames;

const WORDS_MID = ["boat", "coat", "goat", "road", "toast", "soap"];
const WORDS_END = ["snow", "grow", "blow", "slow", "show", "yellow"];

const COPY: PairCopy = {
  soundLabel: "/ō/ — “ohhh”",
  // the narration says "bowt" first, then "snoa"
  wrong: [{ bad: "bowt", good: "boat" }, { bad: "snoa", good: "snow" }],
  // plain "Your turn!" opens this beat, so the FIRST "it's" is the answer (nth is 0-based)
  reveal: { needle: "it's", nth: 0 },
};

// ── the sea's content, per absolute frame ────────────────────────────────────
// Rafts load RIGHT-ALIGNED: a 2-part word uses the last two rafts, so the end-spelling
// always ends up in the final raft with nothing after it.
const A = (s: number) => sec(s, FPS);
const marker = (t: string): Slot => ({ text: t, kind: "marker" });
const letter = (t: string): Slot => ({ text: t, kind: "letter" });
const ghost = (t: string): Slot => ({ text: t, kind: "ghost" });

const raftStateFor = (f: number): SlotState => {
  // notThis — each wrong spelling sits in the WRONG raft, crossed out
  if (f >= A(48.34)) {
    if (f < A(51.3)) return { cars: [letter("b"), { text: "ow", kind: "cross" }, letter("t")], litIdx: 1 };
    if (f < A(54.74)) return { cars: [null, letter("sn"), { text: "oa", kind: "cross" }], litIdx: 2 };
    if (f < A(56.42)) return { cars: [letter("b"), marker("oa"), letter("t")], litIdx: 1 };
    return { cars: [null, letter("sn"), marker("ow")], litIdx: 2 };
  }
  // ruleEnd — sn · ow build, right-aligned so ow is LAST
  if (f >= A(37.14)) {
    if (f < A(40.34)) return { cars: [null, ghost("?"), marker("ow")], litIdx: 2 };
    if (f < A(41.4)) return { cars: [null, letter("sn"), ghost("?")], litIdx: 1 };
    return { cars: [null, letter("sn"), marker("ow")], litIdx: 2 };
  }
  // ruleMid — b · oa · t build across all three. The recording spells it FAST
  // (B 29.66 · Oa 29.92 · T 30.28), so these land ~8 frames apart by design.
  if (f >= A(26.64)) {
    if (f < A(29.66)) return { cars: [ghost("?"), marker("oa"), ghost("?")], litIdx: 1 };
    if (f < A(29.92)) return { cars: [letter("b"), ghost("?"), ghost("?")], litIdx: 0 };
    if (f < A(30.28)) return { cars: [letter("b"), marker("oa"), ghost("?")], litIdx: 1 };
    // "Letters on both sides of it." (34.48) — name them on screen
    if (f >= A(34.48))
      return { cars: [{ ...letter("b"), tag: "⬅ before" }, marker("oa"), { ...letter("t"), tag: "after ➡" }], litIdx: 1 };
    return { cars: [letter("b"), marker("oa"), letter("t")], litIdx: 1 };
  }
  // where — "At the beginning, in the middle, or at the end?" (22.08 / 23.42 / 24.84):
  // the swell lifts each raft as its position is named
  if (f >= A(22.08)) {
    const at = f >= A(24.84) ? 2 : f >= A(23.42) ? 1 : 0;
    return { cars: [ghost("?"), marker("oa"), marker("ow")], litIdx: at };
  }
  // where — "WHERE is the sound?" (19.66): the crest rolls the row, ~0.7s a raft
  if (f >= A(19.66)) {
    return { cars: [ghost("?"), marker("oa"), marker("ow")], litIdx: Math.floor((f - A(19.66)) / 21) % 3 };
  }
  // where — the opening question: the two spellings trade the swell, "which of us?"
  if (f >= A(15.04)) {
    return { cars: [ghost("?"), marker("oa"), marker("ow")], litIdx: Math.floor((f - A(15.04)) / 34) % 2 === 0 ? 1 : 2 };
  }
  // same — the two anchor words actually LOAD
  if (f >= A(10.26)) return { cars: [null, letter("sn"), marker("ow")], litIdx: 2 }; // snow
  if (f >= A(8.28)) return { cars: [letter("b"), marker("oa"), letter("t")], litIdx: 1 }; // boat
  // hook — each spelling lights as it is named
  if (f >= A(5.02)) return { cars: [ghost("?"), marker("oa"), marker("ow")], litIdx: Math.floor((f - A(5.02)) / 28) % 2 === 0 ? 1 : 2 };
  if (f >= A(2.54)) return { cars: [ghost("?"), marker("oa"), marker("ow")], litIdx: 1 };
  return { cars: [ghost("?"), marker("oa"), marker("ow")], litIdx: 1 }; // frame 0 = complete cover
};

type Cue = { from: number; name: string; vol: number };
const SFX: Cue[] = [
  { from: A(1.17), name: "whoosh", vol: 0.34 },
  { from: A(2.54), name: "pop", vol: 0.3 },
  { from: A(5.02), name: "pop", vol: 0.3 },
  { from: A(12.4), name: "sparkle", vol: 0.36 },
  { from: A(22.08), name: "chime_soft", vol: 0.34 },
  { from: A(29.66), name: "tick", vol: 0.3 },
  { from: A(29.92), name: "tick", vol: 0.34 },
  { from: A(30.28), name: "tick", vol: 0.3 },
  { from: A(32.92), name: "correct", vol: 0.34 },
  { from: A(40.34), name: "tick", vol: 0.3 },
  { from: A(41.4), name: "tick", vol: 0.34 },
  { from: A(43.16), name: "correct", vol: 0.34 },
  { from: A(48.34), name: "boing", vol: 0.3 },
  { from: A(51.3), name: "boing", vol: 0.3 },
  { from: A(58.5), name: "swoosh_soft", vol: 0.32 },
  { from: A(72.58), name: "swoosh_soft", vol: 0.3 },
  { from: A(88.14), name: "question", vol: 0.34 },
  { from: A(93.0), name: "drumroll", vol: 0.3 },
  { from: A(94.3), name: "correct", vol: 0.4 },
  { from: A(98.0), name: "sparkle", vol: 0.36 },
  { from: A(104.9), name: "twinkle", vol: 0.34 },
];

const overlayFor = (b: Beat) => {
  switch (b.id) {
    case "hook": return <PairHook data={data} beat={b} />;
    case "same": return <PairSame data={data} beat={b} copy={COPY} />;
    case "where": return <PairWhere data={data} beat={b} />;
    case "ruleMid": return <PairRule data={data} beat={b} teamIdx={0} />;
    case "ruleEnd": return <PairRule data={data} beat={b} teamIdx={1} />;
    case "notThis": return <PairNotThis data={data} beat={b} copy={COPY} />;
    case "seeIt": return <PairSeeIt data={data} beat={b} wordsMid={WORDS_MID} wordsEnd={WORDS_END} />;
    case "quiz": return <PairQuiz data={data} beat={b} copy={COPY} word="road" blanked="r__d" answer={0} />;
    case "recap": return <PairRecap data={data} beat={b} />;
    case "wrap": return <StoreOutro silent compact total={b.durationInFrames} />;
    default: return null;
  }
};

export const OaOw16x9Reel: React.FC = () => (
  <ReelBase
    audio="audio/oa_ow_16x9/oa_ow_16x9.mp3"
    hueShift={data.hueShift}
    sfx={SFX}
    total={OA_OW_16X9_DURATION}
    background={<OceanSky />}
    logoUntil={byId.wrap.from}
    logoCorner="tr"
  >
    {/* the set — top-level so it reads the ABSOLUTE frame; leaves at the see-it beat */}
    <WordWaves
      data={data}
      stateFor={raftStateFor}
      showLabelsFrom={A(19.66)}
      labelLitAt={[A(22.08), A(23.42), A(24.84)]}
      sweep={{ from: A(19.66), to: A(22.08) }}
      hideAt={byId.seeIt.from}
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
