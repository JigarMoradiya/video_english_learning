import React from "react";
import { Sequence } from "remotion";
import { ReelBase } from "./ReelBase";
import { comparisons } from "../data/comparisons";
import { Beat, BeatSpec, makeTrack, planBeats, sec } from "../lib/timing";
import { Captions, keywordColorFor } from "../components/Captions";
import { StoreOutro, STORE_OUTRO_F } from "../components/StoreOutro";
import { CourtSky, Judge } from "../components/CourtRoom";
import { TilePart } from "../components/WordTiles";
import { WordArt } from "../components/WordArt";
import { PairCopy, PairQuiz, PairRecap, PairSeeIt } from "./pair_16x9_beats";
import { CaseCues, LetterBeforeCase, PlaceCard } from "./letter_before_beats";
import {
  FamilyCues, GeFamily, GeGoodNews, GeHook, GeHookCues, GeLookBefore, GeNoTricky, GeNotes,
  GePlaces, GeSeeItNote, GeSwapNote, GE_TONES, GoodNewsCues,
} from "./ge_dge_beats";
import phrases from "../data/ge_dge_16x9.timing.json";
import { FPS } from "../data/tokens";

// ── ge/dge — the long-form 16:9 lesson ───────────────────────────────────────
// Seventh card, seventh world: THE WORD COURT, and the first 3D-styled video. The card named
// its own set — `judge` and `badge` are two of its example words — and the rule really is a
// verdict: look at the letter before the sound, then rule ge or dge.
//
// It shares ch/tch's rule SHAPE, so the worked words reuse LetterBeforeCase:
//
//   b  · a  · dge    the a is lit → SHORT VOWEL   → dge
//   c  · a  · ge     the a says its name → LONG   → ge
//   la · r  · ge     the r is lit → CONSONANT     → ge
//
// What it has that ch/tch does not is the family beat — ck ⚡ tch ⚡ dge, the payoff of three
// videos at once — and the good news that dge has ZERO rule breakers where tch had nine.
//
// EVERY ONE of the 80 aligned phrases has its own cue below. That is the standing rule: a
// line whose only change is the caption is a dead line.
const data = comparisons.ge_dge;
const AUDIO_SEC = 264.0;
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
  { id: "family", from: 36, to: 44 },    // ck ⚡ tch ⚡ dge — duck, catch, badge
  { id: "goodNews", from: 45, to: 51 },  // nine rule breakers → none at all
  { id: "seeIt", from: 52, to: 67 },     // six dge words, then six ge words
  { id: "quiz", from: 68, to: 73 },      // your turn → huge → it is ge
  { id: "recap", from: 74, to: 77 },     // the rule, and no tricky words at all
  { id: "wrap", from: 78, to: 79 },
];
const beats = planBeats(track, SPECS);
const byId: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));
const OUTRO_PAD = Math.max(0, STORE_OUTRO_F - byId.wrap.durationInFrames);
export const GE_DGE_AUDIO_FRAMES = track.totalFrames;
export const GE_DGE_16X9_DURATION = track.totalFrames + OUTRO_PAD;

const { GE, DGE, SHORT, LONG, CONS } = GE_TONES;

// the see-it boards, in the order the narration reads them (phrases 53–58, then 61–66)
const WORDS_DGE = ["badge", "bridge", "judge", "fudge", "hedge", "edge"];
const WORDS_GE = ["cage", "page", "huge", "large", "change", "orange"];

const COPY: PairCopy = {
  soundLabel: "/j/ — “j!”",
  wrong: [{ bad: "bage", good: "badge" }, { bad: "cadge", good: "cage" }],
  // "it" inside the quiz beat: "Now IT is your turn" · "write IT with ge" · "IT is ge!" —
  // the reveal is the third, so nth = 2 (ZERO-indexed).
  reveal: { needle: "it", nth: 2 },
};

// beat-relative cue helpers — no frame in this file is typed by hand
const R = (b: string, i: number) => P(i) - byId[b].from;
// a word cue taken AFTER a point in time. nth counts across the whole track, so "ge" said in
// the phrase that introduces a beat would otherwise light a card before its beat begins.
const WA = (b: string, word: string, afterSec: number) => {
  const f = track.wordAbs(word, { afterSec });
  if (f < 0) throw new Error(`ge_dge_16x9: "${word}" after ${afterSec}s not found`);
  return f - byId[b].from;
};

const tile = (t: string, k: TilePart["kind"] = "plain"): TilePart => ({ text: t, kind: k });

// 0 · 1 · 2 · 3 · 4 · 5 · 6 · 7 — eight lines, eight changes
const HOOK_CUES: GeHookCues = {
  sound1: R("hook", 1), two: R("hook", 2),
  // each blank placard fills on its OWN spelling inside "We can write ge, or we can write dge"
  writeGe: WA("hook", "ge", PS(3)), writeDge: WA("hook", "dge", PS(3)),
  sayIt: R("hook", 4), sound2: R("hook", 5), hear: R("hook", 6),
  // same for the two picture words inside "You hear it in cage, and … in badge"
  hearCage: WA("hook", "cage", PS(6)), hearBadge: WA("hook", "badge", PS(6)),
  same: R("hook", 7),
};

// 10 → 20. The worked word REBUILDS on each named example; the lines that explain the same
// tiles ("Listen." · "Here are more.") get their own swap note underneath.
const DGE_CUES: CaseCues = {
  introAt: 0, ruleAt: R("ruleDge", 11),
  // the ending tile lands on the spoken "dge" inside "B - a - dge", not a phrase later —
  // the narrator was saying "dge" with no dge on screen
  build: R("ruleDge", 13), done: WA("ruleDge", "dge", PS(13)), label: R("ruleDge", 15),
  more: [R("ruleDge", 17), R("ruleDge", 18), R("ruleDge", 19)],
  allAt: R("ruleDge", 20),
};
// 23 → 29
const LONG_CUES: CaseCues = {
  introAt: 0,
  build: R("geLong", 24), done: R("geLong", 24), label: R("geLong", 25),
  more: [R("geLong", 27), R("geLong", 28), R("geLong", 29)], allAt: 1e9,
};
// 30 → 35
const CONS_CUES: CaseCues = {
  introAt: 0,
  build: R("geCons", 31), done: R("geCons", 31), label: R("geCons", 32),
  more: [R("geCons", 34), R("geCons", 35)], allAt: 1e9,
};
// 36 → 44
const FAMILY_CUES: FamilyCues = {
  podiums: R("family", 36), duckAt: R("family", 37), catchAt: R("family", 38),
  duckLit: R("family", 39), catchLit: R("family", 40), badgeAt: R("family", 41),
  sameJob: R("family", 42), helper: R("family", 43), everywhere: R("family", 44),
};
// 45 → 51
const NEWS_CUES: GoodNewsCues = {
  best: R("goodNews", 45), nine: R("goodNews", 46), zero: R("goodNews", 47),
  longWords: R("goodNews", 48),
  villageAt: WA("goodNews", "village", PS(48)), messageAt: WA("goodNews", "message", PS(48)),
  endings: R("goodNews", 49),
  quiet: R("goodNews", 50), trust: R("goodNews", 51),
};

const overlayFor = (b: Beat) => {
  switch (b.id) {
    case "hook": return <GeHook cues={HOOK_CUES} />;
    case "lookBefore": return <GeLookBefore ruleAt={R("lookBefore", 9)} />;
    case "ruleDge":
      return (
        <>
          <LetterBeforeCase
            headline={<>Right after a <span style={{ color: `#${SHORT}` }}>short vowel</span> → write <span style={{ color: `#${DGE}` }}>dge</span></>}
            base={[tile("b"), tile("a", "focus"), tile("dge", "ending")]}
            endingColor={DGE} focusLabel="SHORT VOWEL" focusColor={SHORT} cues={DGE_CUES}
            examples={[
              { parts: [tile("br"), tile("i", "focus"), tile("dge", "ending")], emoji: "🌉" },
              { parts: [tile("j"), tile("u", "focus"), tile("dge", "ending")], emoji: "⚖️" },
              { parts: [tile("f"), tile("u", "focus"), tile("dge", "ending")], emoji: "🍫" },
            ]}
            allWords={["badge", "bridge", "judge", "fudge"]}
            baseEmoji="🎖️"
            introNode={<PlaceCard n="rule" label="look at the letter before" emoji="🔍" tone={DGE} depth3d />}
            depth3d
          />
          {/* 12 "Listen." and 16 "Here are more." explain the same tiles, so each gets a chip */}
          <GeSwapNote
            notes={[
              { at: R("ruleDge", 12), node: GeNotes.listen },
              { at: R("ruleDge", 13), node: null },
              { at: R("ruleDge", 14), node: GeNotes.badgeDone },
              { at: R("ruleDge", 15), node: null },
              { at: R("ruleDge", 16), node: GeNotes.more },
              { at: R("ruleDge", 17), node: null },
            ]}
          />
        </>
      );
    case "geIntro": return <GePlaces introAt={R("geIntro", 22)} litAt={[1e9, 1e9]} />;
    case "geLong":
      return (
        <>
          <LetterBeforeCase
            headline={<>1 · after a <span style={{ color: `#${LONG}` }}>long vowel</span></>}
            base={[tile("c"), tile("a", "focus"), tile("ge", "ending")]}
            endingColor={GE} focusLabel="LONG VOWEL" focusColor={LONG} cues={LONG_CUES}
            examples={[
              { parts: [tile("p"), tile("a", "focus"), tile("ge", "ending")], emoji: "📄" },
              { parts: [tile("h"), tile("u", "focus"), tile("ge", "ending")], emoji: "🐘" },
              { parts: [tile("st"), tile("a", "focus"), tile("ge", "ending")], emoji: "🎤" },
            ]}
            baseEmoji={<WordArt word="cage" size={104} />}
            introNode={<PlaceCard n="1" label="after a long vowel" emoji="🎵" tone={LONG} depth3d />}
            depth3d
          />
          {/* 25 the vowel says its name · 26 so no d is needed */}
          <GeSwapNote
            notes={[
              { at: R("geLong", 25), node: GeNotes.saysName },
              { at: R("geLong", 26), node: GeNotes.noD },
            ]}
          />
        </>
      );
    case "geCons":
      return (
        <>
          <LetterBeforeCase
            headline={<>2 · after a <span style={{ color: `#${CONS}` }}>consonant</span></>}
            base={[tile("la"), tile("r", "focus"), tile("ge", "ending")]}
            endingColor={GE} focusLabel="CONSONANT" focusColor={CONS} cues={CONS_CUES}
            examples={[
              { parts: [tile("cha"), tile("n", "focus"), tile("ge", "ending")], emoji: "🔄" },
              { parts: [tile("ora"), tile("n", "focus"), tile("ge", "ending")], emoji: "🍊" },
            ]}
            baseEmoji="🐋"
            introNode={<PlaceCard n="2" label="after a consonant" emoji="🔤" tone={CONS} depth3d />}
            depth3d
          />
          {/* 33 "So we write ge again." */}
          <GeSwapNote notes={[{ at: R("geCons", 33), node: GeNotes.geAgain }]} />
        </>
      );
    case "family": return <GeFamily cues={FAMILY_CUES} />;
    case "goodNews": return <GeGoodNews cues={NEWS_CUES} />;
    case "seeIt":
      return (
        <>
          {/* the dge board is read first, so the teams are swapped */}
          <PairSeeIt data={data} beat={b} wordsMid={WORDS_DGE} wordsEnd={WORDS_GE} swap endHeadAt={R("seeIt", 60) - 20} />
          <GeSeeItNote
            vowelAt={R("seeIt", 59)}
            clearAt={R("seeIt", 60)}
            // 67 names the two ge places in turn, so each chip lights on its own word
            casesAt={[R("seeIt", 67), WA("seeIt", "consonant", PS(67))]}
          />
        </>
      );
    case "quiz": return <PairQuiz data={data} beat={b} copy={COPY} word="huge" blanked="hu__" answer={0} top={336} plate />;
    // the block is 4 rows plus a crest; scaled to clear the bench and leave room for the stamp
    case "recap":
      return (
        <>
          <PairRecap data={data} beat={b} top={215} scale={0.7} depth3d logoSize={200} logoGap={30} logoPulse />
          <GeNoTricky at={R("recap", 77)} />
        </>
      );
    case "wrap": return <StoreOutro silent total={b.durationInFrames + OUTRO_PAD} bg="rgba(43,27,61,0.72)" titleColor="#FFE9A8" />;
    default: return null;
  }
};

// the gavel bangs where a verdict actually lands — never as background rhythm
const GAVEL = [P(11), P(14), P(21), P(42), P(47), P(72), P(74)];

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
  { from: P(36), name: "boing", vol: 0.32 },
  { from: P(41), name: "correct", vol: 0.3 },
  { from: P(42), name: "sparkle", vol: 0.34 },
  { from: P(45), name: "twinkle", vol: 0.32 },
  { from: P(47), name: "correct", vol: 0.36 },
  { from: P(51), name: "chime_soft", vol: 0.32 },
  { from: P(52), name: "swoosh_soft", vol: 0.32 },
  { from: P(60), name: "swoosh_soft", vol: 0.3 },
  { from: P(68), name: "question", vol: 0.34 },
  { from: P(72) - sec(1.4, FPS), name: "drumroll", vol: 0.3 },
  { from: P(72), name: "correct", vol: 0.4 },
  { from: P(74), name: "sparkle", vol: 0.34 },
  { from: P(77), name: "twinkle", vol: 0.34 },
  { from: P(78), name: "twinkle", vol: 0.32 },
];

export const GeDge16x9Reel: React.FC = () => (
  <ReelBase
    audio="audio/ge_dge_16x9/ge_dge_16x9.mp3"
    hueShift={data.hueShift}
    sfx={SFX}
    total={GE_DGE_16X9_DURATION}
    background={<CourtSky />}
    logoUntil={byId.wrap.from}
    logoCorner="tr"
  >
    {/* the judge presides over the whole lesson, and bangs the gavel on each verdict */}
    <Sequence from={0} durationInFrames={byId.seeIt.from}>
      <Judge bangAt={GAVEL} />
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
      <Captions track={track} keywordColor={keywordColorFor(data)} maxWidth={1360} fontSize={40} bottom={70} />
    </Sequence>
  </ReelBase>
);
