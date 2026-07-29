import React from "react";
import { Sequence } from "remotion";
import { ReelBase } from "./ReelBase";
import { comparisons } from "../data/comparisons";
import { Beat, BeatSpec, makeTrack, planBeats, sec } from "../lib/timing";
import { Captions, keywordColorFor } from "../components/Captions";
import { StoreOutro, STORE_OUTRO_F } from "../components/StoreOutro";
import { Baker, BakerySky, SubscribeBump } from "../components/BakeryWorld";
import { TilePart } from "../components/WordTiles";
import { BakeChip } from "../components/BakeryWorld";
import { Signpost } from "../components/Connector";
import {
  CAlwaysSoft, CCase, CHook, CLookAfter, CQuiz, CRecap, CSeeIt, CShFamily, CThreeLetters,
  CaseCues, EmptySlots, HookCues, Notes, ShCues, SoundCard, C_TONES,
} from "./c_soft_hard_beats";
import phrases from "../data/c_soft_hard_16x9.timing.json";
import { FPS } from "../data/tokens";

// ── hard c / soft c — the long-form 16:9 lesson ─────────────────────────────
// Ninth card, and two firsts.
//
// FIRST BRIGHT WORLD. The last three were dark grounds, and white cards on a dark field read
// as holes punched in the frame rather than objects in front of it. The Bakery is light, the
// background is pushed back to low contrast, and a light wash sits behind the teaching area
// so the eye lands there first. Soft versus hard is also literal in a bakery.
//
// FIRST "WHICH SOUND?" CARD. Every card so far asked which SPELLING to write; this one asks
// which SOUND one letter makes. That changes two components — the see-it boards and the quiz
// are built for this card rather than reused, because the shared ones look up
// `word.indexOf(marker)` and "/s/" is not a substring of "city".
//
// It is also the first card where the deciding letter comes AFTER, not before, and the script
// makes that reversal its hook — so the arrow physically turns around on the line that says
// "this time, we look the other way".
//
// All 112 aligned phrases are cued below.
const data = comparisons.c_soft_hard;
const AUDIO_SEC = 321.07;
const track = makeTrack(phrases as never, AUDIO_SEC);

const P = (i: number) => sec((phrases as { start: number }[])[i].start, FPS);

const SPECS: BeatSpec[] = [
  { id: "hook", from: 0, to: 9 },          // one letter, two sounds — cat /k/, city /s/
  { id: "lookAfter", from: 10, to: 13 },   // last time we looked before; now we look after
  { id: "rule", from: 14, to: 19 },        // three special letters: e, i, y
  { id: "softC", from: 20, to: 31 },       // /s/ ih ty → City! → cent, circle, cycle
  { id: "hardC", from: 32, to: 48 },       // /k/ a t → Cat! → cup, cold, clap
  { id: "three", from: 49, to: 54 },       // e, i, y one more time
  { id: "seeIt", from: 55, to: 70 },       // six soft words, then six hard words
  { id: "subscribe", from: 71, to: 73 },   // the like + subscribe beat
  { id: "shFamily", from: 74, to: 93 },    // special, precious, musician, ancient, ocean
  { id: "alwaysSoft", from: 94, to: 97 },  // before e, i, y the c is ALWAYS soft
  { id: "quiz", from: 98, to: 104 },       // your turn → cycle → soft
  { id: "recap", from: 105, to: 108 },
  { id: "wrap", from: 109, to: 111 },
];
const beats = planBeats(track, SPECS);
const byId: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));
const OUTRO_PAD = Math.max(0, STORE_OUTRO_F - byId.wrap.durationInFrames);
export const C_SOFT_HARD_DURATION = track.totalFrames + OUTRO_PAD;

const { HARD, SOFT, DEC } = C_TONES;
const R = (b: string, i: number) => P(i) - byId[b].from;
// A cue on a WORD inside a phrase. Several lines carry two ideas — "It is the same letter,
// BUT it makes two different sounds" — and a line like that needs two visual moments, not one.
const W = (b: string, phrase: number, word: string) => {
  const hit = (phrases as { words: { word: string; start: number }[] }[])[phrase].words
    .find((w) => w.word.replace(/[.,!?]/g, "").toLowerCase() === word.toLowerCase());
  if (!hit) throw new Error(`c_soft_hard: "${word}" is not in phrase ${phrase}`);
  return sec(hit.start, FPS) - byId[b].from;
};
const tile = (t: string, k: TilePart["kind"] = "plain"): TilePart => ({ text: t, kind: k });

// 0 · 1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 — ten lines, ten changes
const HOOK: HookCues = {
  cee: R("hook", 1), two: R("hook", 2), hear1: R("hook", 3), cat: R("hook", 4), k: R("hook", 5),
  hear2: R("hook", 6), city: R("hook", 7), s: R("hook", 8),
  same: R("hook", 9), two2: W("hook", 9, "but"),
};

// 20 → 31. The word is spelled out sound by sound, so each tile has its OWN cue.
const SOFT_CUES: CaseCues = {
  // 20 "A soft c says /s/, like a quiet little snake." and 21 "Listen." both land before the
  // word is built, so each gets its own picture rather than a chip over an empty stage
  pre: [
    { at: 0, node: <SoundCard sound="/s/" tone={SOFT} emoji="🐍" word="soft c" label="says" drawAt={W("softC", 20, "says")} rightAt={W("softC", 20, "says") + 22} emojiAt={W("softC", 20, "like")} caption={<>a soft c hisses, like a quiet little snake</>} /> },
    { at: R("softC", 21), node: <EmptySlots tone={SOFT} /> },
  ],
  partsAt: [R("softC", 22), R("softC", 23), R("softC", 24)],
  build: R("softC", 22), label: R("softC", 26),
  verdictAt: W("softC", 26, "so"),
  verdict: <BakeChip tone={`#${SOFT}`}>…so this c is <span style={{ color: `#${SOFT}` }}>soft</span> 🐍</BakeChip>,
  more: [R("softC", 28), R("softC", 29), R("softC", 30)],
  allAt: R("softC", 31), allStagger: 26,
};
// 32 → 48
const HARD_CUES: CaseCues = {
  // 32 "So what happens everywhere else?" · 33 "Everywhere else, the c stays hard." ·
  // 34 "A hard c says /k/…" · 35 "Listen." — all four played over nothing at all
  pre: [
    { at: 0, node: <Signpost leftLabel="e, i or y" rightLabel="any other letter" leftTone={SOFT} rightTone={HARD} /> },
    // "Everywhere else, the c stays hard." — the c card is drawn ACROSS to /k/ and both
    // stay on screen; the cookie then arrives on the right, on "strong and short"
    { at: R("hardC", 33), node: (
      <SoundCard
        sound="/k/" tone={HARD} emoji="🍪" word="hard c" label="stays hard"
        drawAt={R("hardC", 34)} rightAt={R("hardC", 34) + 22}
        emojiAt={W("hardC", 34, "strong")}
        caption={<>a hard c is strong and short</>}
      />
    ) },
    { at: R("hardC", 35), node: <EmptySlots tone={HARD} /> },
  ],
  partsAt: [R("hardC", 36), R("hardC", 37), R("hardC", 38)],
  build: R("hardC", 36), label: R("hardC", 40),
  verdictAt: W("hardC", 40, "and"),
  verdict: <BakeChip tone={`#${HARD}`}>a is <b>not</b> e, i or y → the c stays <span style={{ color: `#${HARD}` }}>hard</span></BakeChip>,
  more: [R("hardC", 43), R("hardC", 44), R("hardC", 45)],
};
// 74 → 93
const SH: ShCues = {
  intro: R("shFamily", 74), look: R("shFamily", 75),
  words: [R("shFamily", 76), R("shFamily", 77), R("shFamily", 78), R("shFamily", 79), R("shFamily", 80)],
  softToo: R("shFamily", 81), careful: R("shFamily", 82), notS: R("shFamily", 83),
  sh: R("shFamily", 84), ask: R("shFamily", 85),
  ends: R("shFamily", 86),
  endsAt: [R("shFamily", 87), R("shFamily", 88), R("shFamily", 89), R("shFamily", 90), R("shFamily", 91)],
  rule: R("shFamily", 92), saysAt: W("shFamily", 92, "says"), own: R("shFamily", 93),
};

const overlayFor = (b: Beat) => {
  switch (b.id) {
    case "hook": return <CHook cues={HOOK} />;
    case "lookAfter":
      return (
        <CLookAfter
          beforeAt={R("lookAfter", 11)} flipAt={R("lookAfter", 12)} afterAt={R("lookAfter", 13)}
          cAt={W("lookAfter", 13, "after")}
        />
      );
    case "rule":
      return (
        <CThreeLetters
          at={[R("rule", 16), R("rule", 17), R("rule", 18)]}
          ruleAt={R("rule", 19)}
        />
      );
    case "softC":
      return (
        <CCase
          head={<>Before <span style={{ color: `#${DEC}` }}>e, i or y</span> → the c is <span style={{ color: `#${SOFT}` }}>soft</span></>}
          base={[tile("c", "ending"), tile("i", "focus"), tile("ty")]}
          baseWord="city" cTone={SOFT} focusLabel="E, I OR Y → SOFT" cues={SOFT_CUES}
          examples={[
            { parts: [tile("c", "ending"), tile("e", "focus"), tile("nt")], word: "cent" },
            { parts: [tile("c", "ending"), tile("i", "focus"), tile("rcle")], word: "circle" },
            { parts: [tile("c", "ending"), tile("y", "focus"), tile("cle")], word: "cycle" },
          ]}
          notes={[
            { at: 0, node: null },
            { at: R("softC", 27), node: Notes.more },
            { at: R("softC", 28), node: null },
          ]}
          allWords={["city", "cent", "circle", "cycle"]}
        />
      );
    case "hardC":
      return (
        <CCase
          head={<>Everywhere else → the c stays <span style={{ color: `#${HARD}` }}>hard</span></>}
          base={[tile("c", "ending"), tile("a", "focus"), tile("t")]}
          baseWord="cat" cTone={HARD} focusLabel="NOT E, I OR Y → HARD" cues={HARD_CUES}
          examples={[
            { parts: [tile("c", "ending"), tile("u", "focus"), tile("p")], word: "cup" },
            { parts: [tile("c", "ending"), tile("o", "focus"), tile("ld")], word: "cold" },
            { parts: [tile("c", "ending"), tile("l", "focus"), tile("ap")], word: "clap" },
          ]}
          notes={[
            { at: 0, node: null },
            { at: R("hardC", 42), node: Notes.more },
            { at: R("hardC", 43), node: null },
            // "In clap, the letter l comes after the c. That is fine. The c is still hard."
            { at: R("hardC", 46), node: Notes.stillHard },
          ]}
        />
      );
    case "three":
      return (
        <CThreeLetters
          heading={<>Our three <span style={{ color: `#${DEC}` }}>special letters</span> again ✨</>}
          at={[R("three", 50), R("three", 51), R("three", 52)]}
          ruleAt={R("three", 53)}
          elseAt={R("three", 54)}
        />
      );
    case "seeIt":
      return (
        <CSeeIt
          soft={["city", "cent", "circle", "cycle", "ice", "race"]}
          hard={["cat", "cup", "cold", "clap", "cream", "picnic"]}
          softAt={[R("seeIt", 56), R("seeIt", 57), R("seeIt", 58), R("seeIt", 59), R("seeIt", 60), R("seeIt", 61)]}
          hardAt={[R("seeIt", 64), R("seeIt", 65), R("seeIt", 66), R("seeIt", 67), R("seeIt", 68), R("seeIt", 69)]}
          hardHeadAt={R("seeIt", 63)}
          sweepSoftAt={R("seeIt", 62)}
          sweepHardAt={R("seeIt", 70)}
          sweepStep={14}
        />
      );
    case "subscribe":
      return (
        <SubscribeBump
          wellAt={0}
          askAt={W("subscribe", 72, "like")}
          subAt={W("subscribe", 72, "subscribe")}
          moreAt={R("subscribe", 73)}
          until={b.durationInFrames}
        />
      );
    case "shFamily": return <CShFamily cues={SH} />;
    case "alwaysSoft":
      return <CAlwaysSoft at={R("alwaysSoft", 96)} alwaysAt={W("alwaysSoft", 96, "always")} neverAt={R("alwaysSoft", 97)} />;
    case "quiz":
      return <CQuiz wordAt={R("quiz", 100)} askAt={R("quiz", 101)} revealAt={R("quiz", 103)} whyAt={R("quiz", 104)} />;
    case "recap":
      return <CRecap softAt={R("recap", 106)} sAt={R("recap", 107)} hardAt={R("recap", 108)} kAt={W("recap", 108, "says")} />;
    case "wrap": return <StoreOutro silent total={b.durationInFrames + OUTRO_PAD} bg="rgba(255,247,232,0.80)" />;
    default: return null;
  }
};

// the baker cheers where something lands
const CHEER = [P(9), P(25), P(39), P(53), P(71), P(97), P(103)];

type Cue = { from: number; name: string; vol: number };
const SFX: Cue[] = [
  { from: P(1), name: "pop", vol: 0.32 },
  { from: P(5), name: "tick", vol: 0.3 },
  { from: P(8), name: "tick", vol: 0.3 },
  { from: P(9), name: "sparkle", vol: 0.34 },
  { from: P(12), name: "swoosh_soft", vol: 0.32 },
  { from: P(14), name: "chime_soft", vol: 0.34 },
  { from: P(16), name: "pop", vol: 0.26 },
  { from: P(17), name: "pop", vol: 0.26 },
  { from: P(18), name: "pop", vol: 0.26 },
  { from: P(25), name: "correct", vol: 0.34 },
  { from: P(33), name: "swoosh_soft", vol: 0.3 },
  { from: P(39), name: "correct", vol: 0.34 },
  { from: P(49), name: "chime_soft", vol: 0.3 },
  { from: P(55), name: "swoosh_soft", vol: 0.32 },
  { from: P(63), name: "swoosh_soft", vol: 0.3 },
  { from: P(71), name: "twinkle", vol: 0.36 },
  { from: P(74), name: "chime_soft", vol: 0.3 },
  { from: P(84), name: "boing", vol: 0.3 },
  { from: P(96), name: "sparkle", vol: 0.32 },
  { from: P(98), name: "question", vol: 0.34 },
  { from: P(103) - sec(1.4, FPS), name: "drumroll", vol: 0.3 },
  { from: P(103), name: "correct", vol: 0.4 },
  { from: P(105), name: "sparkle", vol: 0.34 },
  { from: P(109), name: "twinkle", vol: 0.34 },
];

export const CSoftHard16x9Reel: React.FC = () => (
  <ReelBase
    audio="audio/c_soft_hard_16x9/c_soft_hard_16x9.mp3"
    hueShift={data.hueShift}
    sfx={SFX}
    total={C_SOFT_HARD_DURATION}
    background={<BakerySky />}
    logoUntil={byId.wrap.from}
    logoCorner="tr"
  >
    {/* the baker works the counter for the whole lesson */}
    <Sequence from={0} durationInFrames={byId.seeIt.from}>
      <Baker cheerAt={CHEER} />
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
