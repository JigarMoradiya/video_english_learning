import React from "react";
import { Sequence, useCurrentFrame } from "remotion";
import { ReelBase } from "./ReelBase";
import { comparisons } from "../data/comparisons";
import { Beat, BeatSpec, makeTrack, planBeats, sec } from "../lib/timing";
import { Captions, keywordColorFor } from "../components/Captions";
import { StoreOutro } from "../components/StoreOutro";
import { RailwaySky, WordTrain, TrainState, Car } from "../components/WordTrain";
import { PairCopy, PairHook, PairNotThis, PairQuiz, PairRecap, PairRule, PairSame, PairSeeIt, PairWhere } from "./pair_16x9_beats";
import aiayPhrases from "../data/ai_ay_16x9.timing.json";
import { FPS } from "../data/tokens";

// ── ai/ay — the long-form 16:9 lesson ────────────────────────────────────────
// A different show from the 9:16 reel, not a re-crop: the set is THE WORD TRAIN, whose
// three carriages ARE the three positions in a word (beginning · middle · end). "rain"
// loads as r|ai|n so ai lands in the MIDDLE carriage; "day" loads right-aligned as
// _|d|ay so ay lands in the LAST one and nothing follows it. The rule is the picture.
//
// Beats + word hits are DATA-DRIVEN from src/data/ai_ay_16x9.timing.json (forced-aligned
// from the recorded narration) — no frame is hand-counted.
const data = comparisons.ai_ay;
const AUDIO_SEC = 132.362;
const track = makeTrack(aiayPhrases as never, AUDIO_SEC);

// phrase-index ranges (inclusive). See the aligned transcript for the mapping.
const SPECS: BeatSpec[] = [
  { id: "hook", from: 0, to: 3 },      // 0.36  Meet ai and ay … Ayyy!
  { id: "same", from: 4, to: 7 },      // 9.72  Listen. Rain. Play. Same sound…
  { id: "where", from: 8, to: 11 },    // 17.20 …it's all about WHERE … beginning, middle, end
  { id: "ruleMid", from: 12, to: 19 }, // 30.90 MIDDLE → ai. R. Ai. N. Rain!
  { id: "ruleEnd", from: 20, to: 25 }, // 48.80 END → ay. D. Ay. Day! Nothing comes after
  { id: "notThis", from: 26, to: 29 }, // 63.02 never rayn / never dai
  { id: "seeIt", from: 30, to: 45 },   // 73.50 six ai words, then six ay words
  { id: "quiz", from: 46, to: 51 },    // 107.94 your turn → paint → it's ai
  { id: "recap", from: 52, to: 53 },   // 121.08 So remember…
  { id: "wrap", from: 54, to: 56 },    // 127.42 CTA
];
const beats = planBeats(track, SPECS);
const byId: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));
export const AI_AY_16X9_DURATION = track.totalFrames;

const WORDS_MID = ["rain", "snail", "train", "paint", "tail", "chain"];
const WORDS_END = ["day", "play", "say", "stay", "tray", "hay"];

const COPY: PairCopy = {
  soundLabel: "/ā/ — “ayyy”",
  // the narration says "rayn" first, then "dai"
  wrong: [{ bad: "rayn", good: "rain" }, { bad: "dai", good: "day" }],
  // "Now IT'S your turn!" opens this beat, so the SECOND "it's" is the answer (0-based)
  reveal: { needle: "it's", nth: 1 },
};

// ── the train's content, per absolute frame ──────────────────────────────────
// Cars load RIGHT-ALIGNED: a 2-part word uses the last two carriages, so the
// end-spelling always ends up in the final carriage.
const A = (s: number) => sec(s, FPS); // absolute frame from the aligned transcript
const marker = (t: string): Car => ({ text: t, kind: "marker" });
const letter = (t: string): Car => ({ text: t, kind: "letter" });
const ghost = (t: string): Car => ({ text: t, kind: "ghost" });

const trainStateFor = (f: number): TrainState => {
  // notThis — the wrong spellings sit in the WRONG carriage, crossed out
  if (f >= A(63.02)) {
    if (f < A(65.84)) return { cars: [letter("r"), { text: "ay", kind: "cross" }, letter("n")], litIdx: 1 };
    if (f < A(69.2)) return { cars: [null, letter("d"), { text: "ai", kind: "cross" }], litIdx: 2 };
    if (f < A(71.32)) return { cars: [letter("r"), marker("ai"), letter("n")], litIdx: 1 };
    return { cars: [null, letter("d"), marker("ay")], litIdx: 2 };
  }
  // ruleEnd — d · ay build, right-aligned so ay is LAST
  if (f >= A(48.8)) {
    if (f < A(54.22)) return { cars: [null, ghost("?"), marker("ay")], litIdx: 2 };
    if (f < A(55.66)) return { cars: [null, letter("d"), ghost("?")], litIdx: 1 };
    return { cars: [null, letter("d"), marker("ay")], litIdx: 2 };
  }
  // ruleMid — r · ai · n build across all three
  if (f >= A(30.9)) {
    if (f < A(36.24)) return { cars: [ghost("?"), marker("ai"), ghost("?")], litIdx: 1 };
    if (f < A(37.58)) return { cars: [letter("r"), ghost("?"), ghost("?")], litIdx: 0 };
    if (f < A(38.68)) return { cars: [letter("r"), marker("ai"), ghost("?")], litIdx: 1 };
    // "There are letters BEFORE it, and letters AFTER it" (41.90) — tag them
    if (f >= A(41.9))
      return { cars: [{ ...letter("r"), tag: "⬅ before" }, marker("ai"), { ...letter("n"), tag: "after ➡" }], litIdx: 1 };
    return { cars: [letter("r"), marker("ai"), letter("n")], litIdx: 1 };
  }
  // where — "beginning, a middle, and an end" (26.70): each carriage is NAMED in turn,
  // so the spotlight walks with the narration
  if (f >= A(26.7)) {
    const at = f >= A(29.1) ? 2 : f >= A(28.2) ? 1 : 0;
    return { cars: [ghost("?"), marker("ai"), marker("ay")], litIdx: at };
  }
  // where — "it's all about WHERE the sound sits" (21.88): a spotlight SWEEPS the three
  // positions, ~1s each. Without this the screen held still for 12s while only the
  // caption moved, which is the dead-screen failure.
  if (f >= A(21.88)) {
    return { cars: [ghost("?"), marker("ai"), marker("ay")], litIdx: Math.floor((f - A(21.88)) / 26) % 3 };
  }
  // where — the opening question: the two spellings trade the spotlight, "which of us?"
  if (f >= A(17.2)) {
    return { cars: [ghost("?"), marker("ai"), marker("ay")], litIdx: Math.floor((f - A(17.2)) / 34) % 2 === 0 ? 1 : 2 };
  }
  // same — the two anchor words actually LOAD, rather than the markers just sitting there
  if (f >= A(13.14)) return { cars: [null, letter("pl"), marker("ay")], litIdx: 2 }; // Play
  if (f >= A(10.56)) return { cars: [letter("r"), marker("ai"), letter("n")], litIdx: 1 }; // Rain
  // hook — each spelling lights as it is named
  if (f >= A(6.04)) return { cars: [ghost("?"), marker("ai"), marker("ay")], litIdx: Math.floor((f - A(6.04)) / 28) % 2 === 0 ? 1 : 2 };
  if (f >= A(1.9)) return { cars: [ghost("?"), marker("ai"), marker("ay")], litIdx: 2 };
  if (f >= A(1.2)) return { cars: [ghost("?"), marker("ai"), marker("ay")], litIdx: 1 };
  return { cars: [ghost("?"), marker("ai"), marker("ay")] }; // frame 0 = complete cover
};

type Cue = { from: number; name: string; vol: number };
const SFX: Cue[] = [
  { from: A(0.3), name: "whoosh", vol: 0.34 },
  { from: A(1.2), name: "pop", vol: 0.3 },
  { from: A(1.9), name: "pop", vol: 0.3 },
  { from: A(8.26), name: "sparkle", vol: 0.36 },
  { from: A(26.7), name: "chime_soft", vol: 0.34 },
  { from: A(36.24), name: "tick", vol: 0.3 },
  { from: A(37.58), name: "tick", vol: 0.34 },
  { from: A(38.68), name: "tick", vol: 0.3 },
  { from: A(40.28), name: "correct", vol: 0.34 },
  { from: A(54.22), name: "tick", vol: 0.3 },
  { from: A(55.66), name: "tick", vol: 0.34 },
  { from: A(57.14), name: "correct", vol: 0.34 },
  { from: A(63.02), name: "boing", vol: 0.3 },
  { from: A(65.84), name: "boing", vol: 0.3 },
  { from: A(73.5), name: "swoosh_soft", vol: 0.32 },
  { from: A(90.46), name: "swoosh_soft", vol: 0.3 },
  { from: A(107.94), name: "question", vol: 0.34 },
  { from: A(114.9), name: "drumroll", vol: 0.3 },
  { from: A(116.7), name: "correct", vol: 0.4 },
  { from: A(121.08), name: "sparkle", vol: 0.36 },
  { from: A(127.42), name: "twinkle", vol: 0.34 },
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
    case "quiz": return <PairQuiz data={data} beat={b} copy={COPY} word="paint" blanked="p__nt" answer={0} />;
    case "recap": return <PairRecap data={data} beat={b} />;
    case "wrap": return <StoreOutro silent compact total={b.durationInFrames} />;
    default: return null;
  }
};

export const AiAy16x9Reel: React.FC = () => (
  <ReelBase
    audio="audio/ai_ay_16x9/ai_ay_16x9.mp3"
    hueShift={data.hueShift}
    sfx={SFX}
    total={AI_AY_16X9_DURATION}
    background={<RailwaySky />}
    logoUntil={byId.wrap.from}
    logoCorner="tr"
  >
    {/* the set — top-level so it reads the ABSOLUTE frame; leaves at the see-it beat */}
    <WordTrain
      data={data}
      beats={beats}
      stateFor={trainStateFor}
      showLabelsFrom={A(21.88)}
      labelLitAt={[A(27.3), A(28.2), A(29.1)]}
      sweep={{ from: A(21.88), to: A(26.7) }}
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
