import React from "react";
import { Sequence } from "remotion";
import { ReelBase } from "./ReelBase";
import { comparisons } from "../data/comparisons";
import { Beat, BeatSpec, makeTrack, planBeats, sec } from "../lib/timing";
import { Captions, keywordColorFor } from "../components/Captions";
import { StoreOutro } from "../components/StoreOutro";
import { PondSky, WordHop } from "../components/WordHop";
import { Slot, SlotState } from "../components/PositionSlot";
import { PairCopy, PairHook, PairNotThis, PairQuiz, PairRecap, PairRule, PairSame, PairSeeIt, PairWhere } from "./pair_16x9_beats";
import phrases from "../data/oi_oy_16x9.timing.json";
import { FPS } from "../data/tokens";

// ── oi/oy — the long-form 16:9 lesson ────────────────────────────────────────
// Same rule as ai/ay, deliberately NOT the same show: the set is THE LILY POND, and a frog
// HOPS to whichever position the narration names — because the line the user recorded is
// "oi sits in the middle, oy JUMPS to the end". Three pads = three positions:
//
//   coin → c | oi | n     oi lands in the MIDDLE pad
//   toy  →   | t  | oy    oy lands in the LAST pad, and nothing follows it
//
// Beats + word hits are DATA-DRIVEN from src/data/oi_oy_16x9.timing.json (forced-aligned
// from the recorded narration) — no frame is hand-counted.
const data = comparisons.oi_oy;
const AUDIO_SEC = 121.887;
const track = makeTrack(phrases as never, AUDIO_SEC);

// phrase-index ranges (inclusive). See tools/scripts/oi_oy_16x9.txt for the mapping.
const SPECS: BeatSpec[] = [
  { id: "hook", from: 0, to: 4 },      //  0.22  Oy! … Oi, and oy.
  { id: "same", from: 5, to: 7 },      // 10.20  coin … toy … same sound
  { id: "where", from: 8, to: 11 },    // 17.78  which one? … WHERE … beginning, middle, end
  { id: "ruleMid", from: 12, to: 17 }, // 29.14  MIDDLE → oi. C. Oi. N. Coin!
  { id: "ruleEnd", from: 18, to: 23 }, // 42.30  END → oy. T. Oy. Toy! Nothing follows
  { id: "notThis", from: 24, to: 27 }, // 53.96  never toi / never coyn
  { id: "seeIt", from: 28, to: 43 },   // 64.14  six oi words, then six oy words
  { id: "quiz", from: 44, to: 49 },    // 97.66  your turn → enjoy → it's oy
  { id: "recap", from: 50, to: 51 },   // 110.64 So remember…
  { id: "wrap", from: 52, to: 53 },    // 116.68 CTA
];
const beats = planBeats(track, SPECS);
const byId: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));
export const OI_OY_16X9_DURATION = track.totalFrames;

const WORDS_MID = ["coin", "soil", "point", "oil", "join", "boil"];
const WORDS_END = ["boy", "toy", "joy", "enjoy", "annoy", "coy"];

const COPY: PairCopy = {
  soundLabel: "/oi/ — “oy!”",
  // the narration says "toi" first, then "coyn"
  wrong: [{ bad: "toi", good: "toy" }, { bad: "coyn", good: "coin" }],
  // plain "Your turn!" opens this beat, so the FIRST "it's" is the answer (nth is 0-based)
  reveal: { needle: "it's", nth: 0 },
};

// ── the pond's content, per absolute frame ───────────────────────────────────
// Pads load RIGHT-ALIGNED: a 2-part word uses the last two pads, so the end-spelling
// always ends up in the final pad with nothing after it.
const A = (s: number) => sec(s, FPS);
const marker = (t: string): Slot => ({ text: t, kind: "marker" });
const letter = (t: string): Slot => ({ text: t, kind: "letter" });
const ghost = (t: string): Slot => ({ text: t, kind: "ghost" });

const padStateFor = (f: number): SlotState => {
  // notThis — each wrong spelling sits in the WRONG pad, crossed out
  if (f >= A(53.96)) {
    if (f < A(56.76)) return { cars: [null, letter("t"), { text: "oi", kind: "cross" }], litIdx: 2 };
    if (f < A(60.56)) return { cars: [letter("c"), { text: "oy", kind: "cross" }, letter("n")], litIdx: 1 };
    if (f < A(61.96)) return { cars: [letter("c"), marker("oi"), letter("n")], litIdx: 1 };
    return { cars: [null, letter("t"), marker("oy")], litIdx: 2 };
  }
  // ruleEnd — t · oy build, right-aligned so oy is LAST
  if (f >= A(42.3)) {
    if (f < A(46.18)) return { cars: [null, ghost("?"), marker("oy")], litIdx: 2 };
    if (f < A(47.0)) return { cars: [null, letter("t"), ghost("?")], litIdx: 1 };
    return { cars: [null, letter("t"), marker("oy")], litIdx: 2 };
  }
  // ruleMid — c · oi · n build across all three
  if (f >= A(29.14)) {
    if (f < A(33.04)) return { cars: [ghost("?"), marker("oi"), ghost("?")], litIdx: 1 };
    if (f < A(34.16)) return { cars: [letter("c"), ghost("?"), ghost("?")], litIdx: 0 };
    if (f < A(35.1)) return { cars: [letter("c"), marker("oi"), ghost("?")], litIdx: 1 };
    // "Letters before it, letters after it." (38.22) — name them on screen
    if (f >= A(38.22))
      return { cars: [{ ...letter("c"), tag: "⬅ before" }, marker("oi"), { ...letter("n"), tag: "after ➡" }], litIdx: 1 };
    return { cars: [letter("c"), marker("oi"), letter("n")], litIdx: 1 };
  }
  // where — "Beginning, middle, or end." (25.54): each pad is NAMED in turn, and the frog
  // hops onto it as the word is said
  if (f >= A(25.54)) {
    const at = f >= A(27.14) ? 2 : f >= A(26.44) ? 1 : 0;
    return { cars: [ghost("?"), marker("oi"), marker("oy")], litIdx: at };
  }
  // where — "WHERE the sound sits." (23.44): the frog hunts pad to pad, ~0.7s each
  if (f >= A(23.44)) {
    return { cars: [ghost("?"), marker("oi"), marker("oy")], litIdx: Math.floor((f - A(23.44)) / 21) % 3 };
  }
  // where — the opening question: the two spellings trade the frog, "which of us?"
  if (f >= A(17.78)) {
    return { cars: [ghost("?"), marker("oi"), marker("oy")], litIdx: Math.floor((f - A(17.78)) / 34) % 2 === 0 ? 1 : 2 };
  }
  // same — the two anchor words actually LOAD
  if (f >= A(12.9)) return { cars: [null, letter("t"), marker("oy")], litIdx: 2 }; // toy
  if (f >= A(10.2)) return { cars: [letter("c"), marker("oi"), letter("n")], litIdx: 1 }; // coin
  // hook — each spelling lights as it is named
  if (f >= A(7.06)) return { cars: [ghost("?"), marker("oi"), marker("oy")], litIdx: Math.floor((f - A(7.06)) / 28) % 2 === 0 ? 1 : 2 };
  if (f >= A(3.78)) return { cars: [ghost("?"), marker("oi"), marker("oy")], litIdx: 1 };
  return { cars: [ghost("?"), marker("oi"), marker("oy")], litIdx: 2 }; // frame 0 = complete cover
};

type Cue = { from: number; name: string; vol: number };
const SFX: Cue[] = [
  { from: A(0.22), name: "whoosh", vol: 0.34 },
  { from: A(3.78), name: "pop", vol: 0.3 },
  { from: A(7.06), name: "pop", vol: 0.3 },
  { from: A(15.24), name: "sparkle", vol: 0.36 },
  { from: A(25.54), name: "chime_soft", vol: 0.34 },
  { from: A(33.04), name: "tick", vol: 0.3 },
  { from: A(34.16), name: "tick", vol: 0.34 },
  { from: A(35.1), name: "tick", vol: 0.3 },
  { from: A(36.48), name: "correct", vol: 0.34 },
  { from: A(46.18), name: "tick", vol: 0.3 },
  { from: A(47.0), name: "tick", vol: 0.34 },
  { from: A(48.64), name: "correct", vol: 0.34 },
  { from: A(53.96), name: "boing", vol: 0.3 },
  { from: A(56.76), name: "boing", vol: 0.3 },
  { from: A(64.14), name: "swoosh_soft", vol: 0.32 },
  { from: A(80.36), name: "swoosh_soft", vol: 0.3 },
  { from: A(97.66), name: "question", vol: 0.34 },
  { from: A(104.4), name: "drumroll", vol: 0.3 },
  { from: A(106.0), name: "correct", vol: 0.4 },
  { from: A(110.64), name: "sparkle", vol: 0.36 },
  { from: A(116.68), name: "twinkle", vol: 0.34 },
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
    case "quiz": return <PairQuiz data={data} beat={b} copy={COPY} word="enjoy" blanked="enj__" answer={1} />;
    case "recap": return <PairRecap data={data} beat={b} />;
    case "wrap": return <StoreOutro silent compact total={b.durationInFrames} />;
    default: return null;
  }
};

export const OiOy16x9Reel: React.FC = () => (
  <ReelBase
    audio="audio/oi_oy_16x9/oi_oy_16x9.mp3"
    hueShift={data.hueShift}
    sfx={SFX}
    total={OI_OY_16X9_DURATION}
    background={<PondSky />}
    logoUntil={byId.wrap.from}
    logoCorner="tr"
  >
    {/* the set — top-level so it reads the ABSOLUTE frame; leaves at the see-it beat */}
    <WordHop
      data={data}
      stateFor={padStateFor}
      showLabelsFrom={A(23.44)}
      labelLitAt={[A(25.54), A(26.44), A(27.14)]}
      sweep={{ from: A(23.44), to: A(25.54) }}
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
