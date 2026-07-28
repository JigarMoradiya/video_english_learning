import React from "react";
import { Sequence } from "remotion";
import { ReelBase } from "./ReelBase";
import { comparisons } from "../data/comparisons";
import { Beat, BeatSpec, makeTrack, planBeats, sec } from "../lib/timing";
import { Captions, keywordColorFor } from "../components/Captions";
import { StoreOutroPortrait, STORE_OUTRO_PORTRAIT_F } from "../components/StoreOutroPortrait";
import { Performer, StageSky } from "../components/TheatreWorld";
import { TilePart } from "../components/WordTiles";
import { WordArt } from "../components/WordArt";
import { PairCopy } from "./pair_16x9_beats";
import { PPairQuiz, PPairRecap } from "./pair_9x16_beats";
import {
  PCaseCues, PGeCase, PGeHook, PGeLookBefore, PGePlaces, PHookCues, PNoTricky, PNotes,
  PPlaceCard, P_TONES,
} from "./ge_dge_9x16_beats";
import phrases from "../data/ge_dge_9x16.timing.json";
import { FPS } from "../data/tokens";

// ── ge/dge, 9:16 — THE BIG STAGE ────────────────────────────────────────────
// Not a re-crop of the landscape cut, and not the same narration either.
//
// AUDIO: cut from the 16:9 recording rather than re-recorded. Three whole beats came out at
// silent boundaries — the ck/tch/dge family, the no-rule-breakers news, and the twelve extra
// see-it words. 4:24 → 2:40.
//
// THE CUT POINTS COME FROM THE AUDIO, NOT FROM THE TIMESTAMPS. Two earlier versions failed
// because they trusted the aligner's phrase boundaries:
//   · fixed ±0.3s windows overlapped wherever a gap was under 0.6s, so the b of "b-a-dge"
//     was written twice, and tight clamps ate the tails of cage, stage and "just ge";
//   · midpoint-tiled windows still lost the word "large", because the narrator pauses inside
//     "Listen to… large" and the aligner's `end` for that line falls BEFORE the word is
//     spoken. No timestamp-derived margin can recover a word the timestamps exclude.
// So the cut now detects speech regions by RMS, attributes each to its phrase, keeps the ones
// belonging to kept lines, and pads every region by 0.30s — nothing is ever cut within 0.30s
// of real speech. Verified after the fact: 73 speech regions in, 73 out, same durations.
//
// WORLD: its own, the way au/aw's night launch is nothing like its landscape sleepy lawn.
// `stage` is one of this card's own example words, so the portrait cut plays a theatre — and
// the switch pays for itself in teaching, because landscape's sideways MAGNIFIER becomes a
// SPOTLIGHT from above, which is the one direction a 1080×1920 frame has to spare.
//
// Every one of the 48 phrases has its own cue below.
const data = comparisons.ge_dge;
const AUDIO_SEC = 160.37;
const track = makeTrack(phrases as never, AUDIO_SEC);

const P = (i: number) => sec((phrases as { start: number }[])[i].start, FPS);
const PS = (i: number) => (phrases as { start: number }[])[i].start;

const SPECS: BeatSpec[] = [
  { id: "hook", from: 0, to: 7 },        // the /j/ sound, two spellings, cage and badge
  { id: "lookBefore", from: 8, to: 9 },  // the same question as ch ⚡ tch
  { id: "ruleDge", from: 10, to: 20 },   // short vowel → dge. B-a-dge. Bridge. Judge. Fudge.
  { id: "geIntro", from: 21, to: 22 },   // everywhere else → ge. Two places.
  { id: "geLong", from: 23, to: 29 },    // after a long vowel: cage, page, huge, stage
  { id: "geCons", from: 30, to: 35 },    // after a consonant: large, change, orange
  { id: "quiz", from: 36, to: 41 },      // your turn → huge → it is ge
  { id: "recap", from: 42, to: 45 },     // the rule, and no tricky words at all
  { id: "wrap", from: 46, to: 47 },
];
const beats = planBeats(track, SPECS);
const byId: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));
const OUTRO_PAD = Math.max(0, STORE_OUTRO_PORTRAIT_F - byId.wrap.durationInFrames);
export const GE_DGE_PORTRAIT_DURATION = track.totalFrames + OUTRO_PAD;

const { GE, DGE, SHORT, LONG, CONS } = P_TONES;

const COPY: PairCopy = {
  soundLabel: "/j/ — “j!”",
  wrong: [{ bad: "bage", good: "badge" }, { bad: "cadge", good: "cage" }],
  // "it" inside the quiz beat: "Now IT is your turn" · "write IT with ge" · "IT is ge!" —
  // the reveal is the third, so nth = 2 (ZERO-indexed).
  reveal: { needle: "it", nth: 2 },
};

const R = (b: string, i: number) => P(i) - byId[b].from;
const WA = (b: string, word: string, afterSec: number) => {
  const f = track.wordAbs(word, { afterSec });
  if (f < 0) throw new Error(`ge_dge_9x16: "${word}" after ${afterSec}s not found`);
  return f - byId[b].from;
};

const tile = (t: string, k: TilePart["kind"] = "plain"): TilePart => ({ text: t, kind: k });
const art = (w: string) => <WordArt word={w} size={150} />;

const HOOK_CUES: PHookCues = {
  sound1: R("hook", 1), two: R("hook", 2),
  writeGe: WA("hook", "ge", PS(3)), writeDge: WA("hook", "dge", PS(3)),
  sayIt: R("hook", 4), sound2: R("hook", 5), hear: R("hook", 6),
  hearCage: WA("hook", "cage", PS(6)), hearBadge: WA("hook", "badge", PS(6)),
  same: R("hook", 7),
};

const DGE_CUES: PCaseCues = {
  intro: 0, rule: R("ruleDge", 11),
  build: R("ruleDge", 13), done: WA("ruleDge", "dge", PS(13)), label: R("ruleDge", 15),
  more: [R("ruleDge", 17), R("ruleDge", 18), R("ruleDge", 19)],
  allAt: R("ruleDge", 20),
};
const LONG_CUES: PCaseCues = {
  intro: 0,
  build: R("geLong", 24), done: R("geLong", 24), label: R("geLong", 25),
  more: [R("geLong", 27), R("geLong", 28), R("geLong", 29)], allAt: 1e9,
};
const CONS_CUES: PCaseCues = {
  intro: 0,
  build: R("geCons", 31), done: R("geCons", 31), label: R("geCons", 32),
  more: [R("geCons", 34), R("geCons", 35)], allAt: 1e9,
};

const overlayFor = (b: Beat) => {
  switch (b.id) {
    case "hook": return <PGeHook cues={HOOK_CUES} />;
    case "lookBefore": return <PGeLookBefore ruleAt={R("lookBefore", 9)} />;
    case "ruleDge":
      return (
        <PGeCase
          head={<>Right after a <span style={{ color: `#${SHORT}` }}>short vowel</span> → <span style={{ color: `#${DGE}` }}>dge</span></>}
          base={[tile("b"), tile("a", "focus"), tile("dge", "ending")]}
          endingColor={DGE} focusLabel="SHORT VOWEL" focusColor={SHORT} cues={DGE_CUES}
          examples={[
            { parts: [tile("br"), tile("i", "focus"), tile("dge", "ending")], art: art("bridge") },
            { parts: [tile("j"), tile("u", "focus"), tile("dge", "ending")], art: art("judge") },
            { parts: [tile("f"), tile("u", "focus"), tile("dge", "ending")], art: art("fudge") },
          ]}
          baseArt={art("badge")}
          allWords={["badge", "bridge", "judge", "fudge"]}
          introNode={<PPlaceCard n="the rule" label="look at the letter before" emoji="🔎" tone={DGE} />}
          notes={[
            { at: R("ruleDge", 12), node: PNotes.listen },
            { at: R("ruleDge", 13), node: null },
            { at: R("ruleDge", 14), node: PNotes.badgeDone },
            { at: R("ruleDge", 15), node: null },
            { at: R("ruleDge", 16), node: PNotes.more },
            { at: R("ruleDge", 17), node: null },
          ]}
        />
      );
    case "geIntro": return <PGePlaces introAt={R("geIntro", 22)} />;
    case "geLong":
      return (
        <PGeCase
          head={<>1 · after a <span style={{ color: `#${LONG}` }}>long vowel</span></>}
          base={[tile("c"), tile("a", "focus"), tile("ge", "ending")]}
          endingColor={GE} focusLabel="LONG VOWEL" focusColor={LONG} cues={LONG_CUES}
          examples={[
            { parts: [tile("p"), tile("a", "focus"), tile("ge", "ending")], art: art("page") },
            { parts: [tile("h"), tile("u", "focus"), tile("ge", "ending")], art: art("huge") },
            { parts: [tile("st"), tile("a", "focus"), tile("ge", "ending")], art: art("stage") },
          ]}
          baseArt={art("cage")}
          introNode={<PPlaceCard n="1" label="after a long vowel" emoji="🎵" tone={LONG} />}
          notes={[
            { at: R("geLong", 25), node: PNotes.saysName },
            { at: R("geLong", 26), node: PNotes.noD },
          ]}
        />
      );
    case "geCons":
      return (
        <PGeCase
          head={<>2 · after a <span style={{ color: `#${CONS}` }}>consonant</span></>}
          base={[tile("la"), tile("r", "focus"), tile("ge", "ending")]}
          endingColor={GE} focusLabel="CONSONANT" focusColor={CONS} cues={CONS_CUES}
          examples={[
            { parts: [tile("cha"), tile("n", "focus"), tile("ge", "ending")], art: art("change") },
            { parts: [tile("ora"), tile("n", "focus"), tile("ge", "ending")], art: art("orange") },
          ]}
          baseArt={art("large")}
          introNode={<PPlaceCard n="2" label="after a consonant" emoji="🔤" tone={CONS} />}
          notes={[{ at: R("geCons", 33), node: PNotes.geAgain }]}
        />
      );
    case "quiz": return <PPairQuiz data={data} beat={b} copy={COPY} word="huge" blanked="hu__" answer={0} />;
    case "recap":
      return (
        <>
          <PPairRecap data={data} beat={b} top={400} opaque depth3d logoSize={190} logoGap={34} logoPulse />
          <PNoTricky at={R("recap", 45)} />
        </>
      );
    case "wrap": return <StoreOutroPortrait bg="rgba(42,16,36,0.78)" />;
    default: return null;
  }
};

// the performer bows where a verdict lands — the portrait answer to the landscape gavel
const BOWS = [P(11), P(14), P(21), P(40), P(42)];

type Cue = { from: number; name: string; vol: number };
const SFX: Cue[] = [
  { from: P(1), name: "pop", vol: 0.32 },
  { from: P(3), name: "tick", vol: 0.28 },
  { from: P(5), name: "pop", vol: 0.3 },
  { from: P(7), name: "sparkle", vol: 0.34 },
  { from: P(11), name: "chime_soft", vol: 0.34 },
  { from: P(13), name: "tick", vol: 0.3 },
  { from: P(14), name: "correct", vol: 0.34 },
  { from: P(21), name: "chime_soft", vol: 0.32 },
  { from: P(23), name: "swoosh_soft", vol: 0.3 },
  { from: P(30), name: "swoosh_soft", vol: 0.3 },
  { from: P(36), name: "question", vol: 0.34 },
  { from: P(40) - sec(1.4, FPS), name: "drumroll", vol: 0.3 },
  { from: P(40), name: "correct", vol: 0.4 },
  { from: P(42), name: "sparkle", vol: 0.34 },
  { from: P(45), name: "twinkle", vol: 0.34 },
  { from: P(46), name: "twinkle", vol: 0.32 },
];

export const GeDgePortraitReel: React.FC = () => (
  <ReelBase
    audio="audio/ge_dge_9x16/ge_dge_9x16.mp3"
    hueShift={data.hueShift}
    sfx={SFX}
    total={GE_DGE_PORTRAIT_DURATION}
    background={<StageSky />}
    logoUntil={byId.wrap.from}
    logoCorner="tl"
  >
    {/* the performer holds the stage until the quiz takes the whole frame */}
    <Sequence from={0} durationInFrames={byId.quiz.from}>
      <Performer bowAt={BOWS} />
    </Sequence>

    {beats.map((b) => {
      const node = overlayFor(b);
      return node ? (
        <Sequence key={b.id} from={b.from} durationInFrames={b.durationInFrames + (b.id === "wrap" ? OUTRO_PAD : 0)}>
          {node}
        </Sequence>
      ) : null;
    })}

    <Sequence from={0} durationInFrames={byId.wrap.from}>
      <Captions track={track} keywordColor={keywordColorFor(data)} maxWidth={900} fontSize={44} bottom={230} />
    </Sequence>
  </ReelBase>
);
