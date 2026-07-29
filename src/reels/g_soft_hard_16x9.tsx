import React from "react";
import { Sequence } from "remotion";
import { ReelBase } from "./ReelBase";
import { comparisons } from "../data/comparisons";
import { Beat, BeatSpec, makeTrack, planBeats, sec } from "../lib/timing";
import { Captions, keywordColorFor } from "../components/Captions";
import { StoreOutro, STORE_OUTRO_F } from "../components/StoreOutro";
import { GardenChip, GardenSky, Gardener } from "../components/GardenWorld";
import { SubscribeBump } from "../components/BakeryWorld";
import { Signpost } from "../components/Connector";
import { TilePart } from "../components/WordTiles";
import { CCase, CSeeIt, CaseCues, EmptySlots, SoundCard, CThreeLetters } from "./c_soft_hard_beats";
import {
  BreakCues, GBreakers, GHook, GHookCues, GLookAfter, GQuiz, GRecap, GSwapNote,
  G_TONES, LABEL_TOP, NOTE_TOP, PIC_H, PIC_TOP, TILE_TOP,
} from "./g_soft_hard_beats";
import phrases from "../data/g_soft_hard_16x9.timing.json";
import { FPS } from "../data/tokens";

// ── hard g / soft g — the long-form 16:9 lesson ─────────────────────────────
// Tenth card, and the first built entirely from the device library rather than invented:
// the tile case, the see-it boards, the sound card, the drawn connector and the subscribe
// bump all come from the c build. What is new is the world and the ending.
//
// THE ENDING IS THE POINT. c's rule is airtight; g's is not — before e/i/y the g is soft only
// about two thirds of the time, and the words that break it (get, give, girl, gift, begin,
// tiger) are among the most common a child knows. Left out, this video would teach that "get"
// is said "jet". So the breakers get their own beat, with the reliability of the two rules
// shown as bars rather than asserted in a caption.
//
// The script was built from an INDEPENDENT TRANSCRIPTION of the recording, not from the draft:
// the hard worked example is GUM (not goat), and the quiz word is GREEN with the answer HARD.
// Forced alignment would have accepted the draft silently.
const data = comparisons.g_soft_hard;
const AUDIO_SEC = 308.61;
const track = makeTrack(phrases as never, AUDIO_SEC);

const P = (i: number) => sec((phrases as { start: number }[])[i].start, FPS);

const SPECS: BeatSpec[] = [
  { id: "hook", from: 0, to: 9 },         // one letter, two sounds — goat /g/, gem /j/
  { id: "lookAfter", from: 10, to: 12 },  // the same secret we used for c
  { id: "rule", from: 13, to: 18 },       // three special letters: e, i, y
  { id: "softG", from: 19, to: 34 },      // /j/ e m → Gem! → giant, gym, magic · cage, large, bridge
  { id: "hardG", from: 35, to: 48 },      // /g/ u m → Gum! → goat, glad, flag
  { id: "subscribe", from: 49, to: 51 },
  { id: "breakers", from: 52, to: 69 },   // get, give, girl, gift, begin, tiger
  { id: "seeIt", from: 70, to: 85 },      // six soft, then six hard
  { id: "quiz", from: 86, to: 91 },       // your turn → green → HARD
  { id: "recap", from: 92, to: 99 },
  { id: "wrap", from: 100, to: 102 },
];
const beats = planBeats(track, SPECS);
const byId: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));
const OUTRO_PAD = Math.max(0, STORE_OUTRO_F - byId.wrap.durationInFrames);
export const G_SOFT_HARD_DURATION = track.totalFrames + OUTRO_PAD;

const { HARD, SOFT, DEC } = G_TONES;
const R = (b: string, i: number) => P(i) - byId[b].from;
// a cue on a WORD inside a phrase — long lines carry two ideas and need two moments
const W = (b: string, phrase: number, word: string) => {
  const hit = (phrases as { words: { word: string; start: number }[] }[])[phrase].words
    .find((w) => w.word.replace(/[.,!?]/g, "").toLowerCase() === word.toLowerCase());
  if (!hit) throw new Error(`g_soft_hard: "${word}" is not in phrase ${phrase}`);
  return sec(hit.start, FPS) - byId[b].from;
};
const tile = (t: string, k: TilePart["kind"] = "plain"): TilePart => ({ text: t, kind: k });

const HOOK: GHookCues = {
  gee: R("hook", 1), two: R("hook", 2), hear1: R("hook", 3), goat: R("hook", 4), g: R("hook", 5),
  hear2: R("hook", 6), gem: R("hook", 7), j: R("hook", 8),
  same: R("hook", 9), two2: W("hook", 9, "making"),
};

// 19 → 34. "/j/… e… m…" is spelled out, so each tile has its own cue.
const SOFT_CUES: CaseCues = {
  pre: [
    { at: 0, node: <SoundCard sound="/j/" tone={SOFT} emoji="💎" word="soft g" label="says" drawAt={12} rightAt={32} emojiAt={26} caption={<>a soft g says /j/, like the g in gem</>} /> },
    { at: R("softG", 20), node: <EmptySlots tone={SOFT} /> },
  ],
  partsAt: [R("softG", 21), R("softG", 22), R("softG", 23)],
  build: R("softG", 21), label: R("softG", 25),
  verdictAt: W("softG", 25, "so"),
  verdict: <GardenChip tone={`#${SOFT}`}>…so this g is <span style={{ color: `#${SOFT}` }}>soft</span> 💎</GardenChip>,
  more: [R("softG", 27), R("softG", 28), R("softG", 29)],
  // 30 "You have met soft g before, at the end of words." introduces a DIFFERENT group —
  // cage/large/bridge, where the g is final. They ghost in on 30 and each lands on its word.
  allAt: R("softG", 30),
  allAtEach: [R("softG", 31), R("softG", 32), R("softG", 33)],
  allNote: <GardenChip tone={`#${SOFT}`} size={38}>here the <span style={{ color: `#${SOFT}` }}>g</span> is at the <b>end</b> of the word 👉</GardenChip>,
};
// 35 → 48
const HARD_CUES: CaseCues = {
  pre: [
    { at: 0, node: <Signpost leftLabel="e, i or y" rightLabel="any other letter" leftTone={SOFT} rightTone={HARD} /> },
    { at: R("hardG", 36), node: (
      <SoundCard
        sound="/g/" tone={HARD} emoji="🐐" word="hard g" label="stays hard"
        drawAt={R("hardG", 37)} rightAt={R("hardG", 37) + 22}
        emojiAt={W("hardG", 37, "deep")}
        caption={<>a hard g is deep in your throat</>}
      />
    ) },
    { at: R("hardG", 38), node: <EmptySlots tone={HARD} /> },
  ],
  partsAt: [R("hardG", 39), R("hardG", 40), R("hardG", 41)],
  build: R("hardG", 39), label: R("hardG", 43),
  verdictAt: W("hardG", 43, "and"),
  verdict: <GardenChip tone={`#${HARD}`}>u is <b>not</b> e, i or y → the g stays <span style={{ color: `#${HARD}` }}>hard</span></GardenChip>,
  more: [R("hardG", 46), R("hardG", 47), R("hardG", 48)],
};
// 52 → 69
const BREAK: BreakCues = {
  important: R("breakers", 52), tidy: R("breakers", 53), withC: R("breakers", 54), withG: R("breakers", 55),
  some: R("breakers", 56), listen: R("breakers", 57),
  words: [R("breakers", 58), R("breakers", 59), R("breakers", 60), R("breakers", 61), R("breakers", 62), R("breakers", 63)],
  shouldBe: R("breakers", 64), everyday: R("breakers", 65), bySight: R("breakers", 66),
  trick: R("breakers", 67), tryHard: W("breakers", 68, "try"), ears: R("breakers", 69),
};

const overlayFor = (b: Beat) => {
  switch (b.id) {
    case "hook": return <GHook cues={HOOK} />;
    case "lookAfter":
      return <GLookAfter secretAt={R("lookAfter", 11)} afterAt={R("lookAfter", 12)} gAt={W("lookAfter", 12, "after")} />;
    case "rule":
      return (
        <CThreeLetters
          heading={<>Our three <span style={{ color: `#${DEC}` }}>special letters</span> again ✨</>}
          at={[R("rule", 15), R("rule", 16), R("rule", 17)]}
          ruleAt={W("rule", 18, "soft")}
          relightAt={[W("rule", 18, "e"), W("rule", 18, "i"), W("rule", 18, "y")]}
        />
      );
    case "softG":
      return (
        <CCase
          head={<>Before <span style={{ color: `#${DEC}` }}>e, i or y</span> → the g is <span style={{ color: `#${SOFT}` }}>soft</span></>}
          base={[tile("g", "ending"), tile("e", "focus"), tile("m")]}
          baseWord="gem" cTone={SOFT} focusLabel="E, I OR Y → SOFT" cues={SOFT_CUES}
          examples={[
            { parts: [tile("g", "ending"), tile("i", "focus"), tile("ant")], word: "giant" },
            { parts: [tile("g", "ending"), tile("y", "focus"), tile("m")], word: "gym" },
            { parts: [tile("ma"), tile("g", "ending"), tile("i", "focus"), tile("c")], word: "magic" },
          ]}
          allWords={["cage", "large", "bridge"]}
          letter="g"
        />
      );
    case "hardG":
      return (
        <CCase
          head={<>Everywhere else → the g stays <span style={{ color: `#${HARD}` }}>hard</span></>}
          base={[tile("g", "ending"), tile("u", "focus"), tile("m")]}
          baseWord="gum" cTone={HARD} focusLabel="NOT E, I OR Y → HARD" cues={HARD_CUES} letter="g"
          examples={[
            { parts: [tile("g", "ending"), tile("o", "focus"), tile("at")], word: "goat" },
            { parts: [tile("g", "ending"), tile("l", "focus"), tile("ad")], word: "glad" },
            // flag ends in g — nothing follows it, which is exactly why it is hard
            { parts: [tile("fla"), tile("g", "ending")], word: "flag" },
          ]}
        />
      );
    case "subscribe":
      return (
        <SubscribeBump
          wellAt={0}
          askAt={W("subscribe", 50, "like")}
          subAt={W("subscribe", 50, "subscribe")}
          moreAt={R("subscribe", 51)}
          until={b.durationInFrames}
          top={170}
        />
      );
    case "breakers": return <GBreakers cues={BREAK} />;
    case "seeIt":
      return (
        <CSeeIt
          letter="g"
          soft={["gem", "giant", "gym", "magic", "cage", "large"]}
          hard={["goat", "gum", "glad", "flag", "green", "wagon"]}
          softAt={[R("seeIt", 71), R("seeIt", 72), R("seeIt", 73), R("seeIt", 74), R("seeIt", 75), R("seeIt", 76)]}
          hardAt={[R("seeIt", 79), R("seeIt", 80), R("seeIt", 81), R("seeIt", 82), R("seeIt", 83), R("seeIt", 84)]}
          hardHeadAt={R("seeIt", 78)}
          sweepSoftAt={R("seeIt", 77)}
          sweepHardAt={R("seeIt", 85)}
          sweepStep={14}
        />
      );
    case "quiz":
      return <GQuiz wordAt={R("quiz", 88)} askAt={R("quiz", 89)} revealAt={R("quiz", 90)} whyAt={R("quiz", 91)} />;
    case "recap":
      return (
        <GRecap
          softAt={R("recap", 93)} hardAt={R("recap", 94)} kAt={W("recap", 94, "says")}
          trickyAt={R("recap", 95)}
          wordAt={[R("recap", 96), R("recap", 97), R("recap", 98), R("recap", 99)]}
        />
      );
    case "wrap": return <StoreOutro silent total={b.durationInFrames + OUTRO_PAD} bg="rgba(243,251,239,0.82)" titleColor="#123A63" ctaBg="#1565C0" />;
    default: return null;
  }
};

const CHEER = [P(9), P(24), P(42), P(49), P(90), P(92)];

type Cue = { from: number; name: string; vol: number };
const SFX: Cue[] = [
  { from: P(1), name: "pop", vol: 0.32 },
  { from: P(5), name: "tick", vol: 0.3 },
  { from: P(8), name: "tick", vol: 0.3 },
  { from: P(9), name: "sparkle", vol: 0.34 },
  { from: P(13), name: "chime_soft", vol: 0.34 },
  { from: P(15), name: "pop", vol: 0.26 },
  { from: P(16), name: "pop", vol: 0.26 },
  { from: P(17), name: "pop", vol: 0.26 },
  { from: P(24), name: "correct", vol: 0.34 },
  { from: P(35), name: "swoosh_soft", vol: 0.3 },
  { from: P(42), name: "correct", vol: 0.34 },
  { from: P(49), name: "twinkle", vol: 0.36 },
  { from: P(52), name: "boing", vol: 0.32 },
  { from: P(58), name: "tick", vol: 0.26 },
  { from: P(67), name: "chime_soft", vol: 0.3 },
  { from: P(70), name: "swoosh_soft", vol: 0.32 },
  { from: P(78), name: "swoosh_soft", vol: 0.3 },
  { from: P(86), name: "question", vol: 0.34 },
  { from: P(90) - sec(1.4, FPS), name: "drumroll", vol: 0.3 },
  { from: P(90), name: "correct", vol: 0.4 },
  { from: P(92), name: "sparkle", vol: 0.34 },
  { from: P(95), name: "twinkle", vol: 0.32 },
  { from: P(100), name: "twinkle", vol: 0.34 },
];

export const GSoftHard16x9Reel: React.FC = () => (
  <ReelBase
    audio="audio/g_soft_hard_16x9/g_soft_hard_16x9.mp3"
    hueShift={data.hueShift}
    sfx={SFX}
    total={G_SOFT_HARD_DURATION}
    background={<GardenSky />}
    logoUntil={byId.wrap.from}
    logoCorner="tr"
  >
    <Sequence from={0} durationInFrames={byId.seeIt.from}>
      <Gardener cheerAt={CHEER} />
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
