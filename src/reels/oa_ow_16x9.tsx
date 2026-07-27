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
// one swell runs through all of them, and the roll lifts each raft in turn — because the
// line the user recorded is "oa SAILS in the middle, ow ROLLS to the end".
//
//   boat → b  | oa | t     oa lands in the MIDDLE raft
//   snow →    | sn | ow    ow lands in the LAST raft, and nothing follows it
//
// EVERY CUE IS LOOKED UP, NOT TYPED. P(i) is the onset of aligned phrase i and W("word")
// the onset of a spoken word, so re-recording the narration needs only a re-run of
// tools/align_audio.py — no hand-edited seconds. (This file did carry ~30 literal
// timestamps, and replacing the take invalidated every one of them.)
const data = comparisons.oa_ow;
const AUDIO_SEC = 111.882;
const track = makeTrack(phrases as never, AUDIO_SEC);

const P = (i: number) => sec((phrases as { start: number }[])[i].start, FPS);
const W = (needle: string, nth = 0) => {
  const f = track.wordAbs(needle, { nth });
  // fail loudly at module eval rather than drifting silently mid-video
  if (f < 0) throw new Error(`oa_ow_16x9: "${needle}"#${nth} is not in the aligned narration`);
  return f;
};

// phrase-index ranges (inclusive). See tools/scripts/oa_ow_16x9.txt for the mapping.
const SPECS: BeatSpec[] = [
  { id: "hook", from: 0, to: 2 },      // Ohhh! Meet oa and ow. Two spellings…
  { id: "same", from: 3, to: 5 },      // boat … snow … same sound
  { id: "where", from: 6, to: 9 },     // which one? … WHERE … beginning, middle, end
  { id: "ruleMid", from: 10, to: 15 }, // MIDDLE → oa. B. Oa. T. Boat!
  { id: "ruleEnd", from: 16, to: 21 }, // END → ow. Sn. Ow. Snow! Nothing after
  { id: "notThis", from: 22, to: 25 }, // never bowt / never snoa
  { id: "seeIt", from: 26, to: 41 },   // six oa words, then six ow words
  { id: "quiz", from: 42, to: 47 },    // your turn → road → it's oa
  { id: "recap", from: 48, to: 49 },   // So remember…
  { id: "wrap", from: 50, to: 51 },    // CTA
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

// the three positions being named, one at a time
const POS = [W("beginning"), W("middle"), W("end")] as [number, number, number];

// ── the sea's content, per absolute frame ────────────────────────────────────
// Rafts load RIGHT-ALIGNED: a 2-part word uses the last two rafts, so the end-spelling
// always ends up in the final raft with nothing after it.
const marker = (t: string): Slot => ({ text: t, kind: "marker" });
const letter = (t: string): Slot => ({ text: t, kind: "letter" });
const ghost = (t: string): Slot => ({ text: t, kind: "ghost" });

const raftStateFor = (f: number): SlotState => {
  // notThis — each wrong spelling sits in the WRONG raft, crossed out
  if (f >= P(22)) {
    if (f < P(23)) return { cars: [letter("b"), { text: "ow", kind: "cross" }, letter("t")], litIdx: 1 };
    if (f < P(24)) return { cars: [null, letter("sn"), { text: "oa", kind: "cross" }], litIdx: 2 };
    if (f < P(25)) return { cars: [letter("b"), marker("oa"), letter("t")], litIdx: 1 };
    return { cars: [null, letter("sn"), marker("ow")], litIdx: 2 };
  }
  // ruleEnd — sn · ow build, right-aligned so ow is LAST
  if (f >= P(16)) {
    if (f < P(17)) return { cars: [null, ghost("?"), marker("ow")], litIdx: 2 };
    if (f < P(18)) return { cars: [null, letter("sn"), ghost("?")], litIdx: 1 };
    return { cars: [null, letter("sn"), marker("ow")], litIdx: 2 };
  }
  // ruleMid — b · oa · t build across all three. The recording spells it FAST, so these
  // land only a handful of frames apart by design.
  if (f >= P(10)) {
    if (f < P(11)) return { cars: [ghost("?"), marker("oa"), ghost("?")], litIdx: 1 };
    if (f < P(12)) return { cars: [letter("b"), ghost("?"), ghost("?")], litIdx: 0 };
    if (f < P(13)) return { cars: [letter("b"), marker("oa"), ghost("?")], litIdx: 1 };
    // "Letters on both sides of it." — name them on screen
    if (f >= P(15))
      return { cars: [{ ...letter("b"), tag: "⬅ before" }, marker("oa"), { ...letter("t"), tag: "after ➡" }], litIdx: 1 };
    return { cars: [letter("b"), marker("oa"), letter("t")], litIdx: 1 };
  }
  // where — "At the beginning, in the middle, or at the end?": the swell lifts each raft
  // exactly as its position is named
  if (f >= POS[0]) {
    const at = f >= POS[2] ? 2 : f >= POS[1] ? 1 : 0;
    return { cars: [ghost("?"), marker("oa"), marker("ow")], litIdx: at };
  }
  // where — "WHERE is the sound?": the roll travels the row, ~0.7s a raft
  if (f >= P(8)) {
    return { cars: [ghost("?"), marker("oa"), marker("ow")], litIdx: Math.floor((f - P(8)) / 21) % 3 };
  }
  // where — the opening question: the two spellings trade the swell, "which of us?"
  if (f >= P(6)) {
    return { cars: [ghost("?"), marker("oa"), marker("ow")], litIdx: Math.floor((f - P(6)) / 34) % 2 === 0 ? 1 : 2 };
  }
  // same — the two anchor words actually LOAD
  if (f >= P(4)) return { cars: [null, letter("sn"), marker("ow")], litIdx: 2 }; // snow
  if (f >= P(3)) return { cars: [letter("b"), marker("oa"), letter("t")], litIdx: 1 }; // boat
  // hook — each spelling lights as it is named
  if (f >= P(2)) return { cars: [ghost("?"), marker("oa"), marker("ow")], litIdx: Math.floor((f - P(2)) / 28) % 2 === 0 ? 1 : 2 };
  if (f >= P(1)) return { cars: [ghost("?"), marker("oa"), marker("ow")], litIdx: 1 };
  return { cars: [ghost("?"), marker("oa"), marker("ow")], litIdx: 1 }; // frame 0 = complete cover
};

type Cue = { from: number; name: string; vol: number };
const SFX: Cue[] = [
  { from: P(0), name: "whoosh", vol: 0.34 },
  { from: P(1), name: "pop", vol: 0.3 },
  { from: P(2), name: "pop", vol: 0.3 },
  { from: P(5), name: "sparkle", vol: 0.36 },
  { from: POS[0], name: "chime_soft", vol: 0.34 },
  { from: P(11), name: "tick", vol: 0.3 },
  { from: P(12), name: "tick", vol: 0.34 },
  { from: P(13), name: "tick", vol: 0.3 },
  { from: P(14), name: "correct", vol: 0.34 }, // Boat!
  { from: P(17), name: "tick", vol: 0.3 },
  { from: P(18), name: "tick", vol: 0.34 },
  { from: P(19), name: "correct", vol: 0.34 }, // Snow!
  { from: P(22), name: "boing", vol: 0.3 },
  { from: P(23), name: "boing", vol: 0.3 },
  { from: P(26), name: "swoosh_soft", vol: 0.32 },
  { from: P(34), name: "swoosh_soft", vol: 0.3 },
  { from: P(42), name: "question", vol: 0.34 },
  { from: P(46) - sec(1.4, FPS), name: "drumroll", vol: 0.3 },
  { from: P(46), name: "correct", vol: 0.4 }, // It's oa!
  { from: P(48), name: "sparkle", vol: 0.36 },
  { from: P(50), name: "twinkle", vol: 0.34 },
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
      showLabelsFrom={P(8)}
      labelLitAt={POS}
      sweep={{ from: P(8), to: POS[0] }}
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
