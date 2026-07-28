import React from "react";
import { Sequence } from "remotion";
import { ReelBase } from "./ReelBase";
import { comparisons } from "../data/comparisons";
import { Beat, BeatSpec, makeTrack, planBeats, sec } from "../lib/timing";
import { Captions, keywordColorFor } from "../components/Captions";
import { StoreOutro, STORE_OUTRO_F } from "../components/StoreOutro";
import { Coach, PitchSky, TilePart } from "../components/WordTiles";
import { PairCopy, PairQuiz, PairRecap, PairSeeIt } from "./pair_16x9_beats";
import { CaseCues, ChAllNine, ChBreakIntro, ChCase, ChFive, ChFour, ChHook, ChLookBefore, ChPlaces, ChSeeItNote, ChVowelChart, FiveCues, FourCues, HookCues, PlaceCard } from "./ch_tch_beats";
import phrases from "../data/ch_tch_16x9.timing.json";
import { FPS } from "../data/tokens";

// ── ch/tch — the long-form 16:9 lesson ───────────────────────────────────────
// Sixth card, sixth world: MATCH DAY at the sports ground, because this card's own words
// already are sports words — match, catch, fetch, coach, bench, pitch.
//
// It is also the first card whose rule is NOT about position, so it has no three-slot row.
// ch/tch asks what letter sits right BEFORE the sound, so every teaching beat is a word
// built from tiles with that one letter spotlighted and named:
//
//   c · a · tch     the a is lit → SHORT VOWEL → tch
//   ch · air        nothing before it          → ch
//   lun · ch        the n is lit → CONSONANT   → ch
//   bea · ch        the ea is lit → LONG VOWEL → ch
//
// The nine rule breakers take 128 seconds — the longest single idea in the series — so they
// run as three staged beats rather than one held screen.
const data = comparisons.ch_tch;
const AUDIO_SEC = 393.26; // after cutting the 18.3s re-list of the nine
const track = makeTrack(phrases as never, AUDIO_SEC);

const P = (i: number) => sec((phrases as { start: number }[])[i].start, FPS);
const W = (needle: string, nth = 0) => {
  const f = track.wordAbs(needle, { nth });
  if (f < 0) throw new Error(`ch_tch_16x9: "${needle}"#${nth} is not in the aligned narration`);
  return f;
};

const SPECS: BeatSpec[] = [
  { id: "hook", from: 0, to: 7 },        // the sound, two spellings, chair and catch
  { id: "lookBefore", from: 8, to: 9 },  // we look at the letter just before
  { id: "ruleTch", from: 10, to: 20 },   // short vowel → tch. C-a-tch. Match. Watch. Fetch.
  { id: "chIntro", from: 21, to: 22 },   // everywhere else → ch. Three places.
  { id: "chStart", from: 23, to: 27 },   // at the start: chair, chin, chip
  { id: "chCons", from: 28, to: 31 },    // after a consonant: lunch, bench
  { id: "chLong", from: 32, to: 35 },    // after a long vowel: beach, coach, peach
  { id: "breakIntro", from: 36, to: 39 },// the rule breakers — nine of them
  { id: "four", from: 40, to: 58 },      // much, such, rich, which + why + rhyming pairs
  { id: "five", from: 59, to: 69 },      // sandwich…detach, and their journey
  { id: "allNine", from: 70, to: 73 },   // all nine said together
  { id: "seeIt", from: 74, to: 89 },     // six tch words, then six ch words
  { id: "quiz", from: 90, to: 95 },      // your turn → beach → it is ch
  { id: "recap", from: 96, to: 99 },     // the rule, and "don't forget the nine"
  // the three lines that re-listed the nine a third time are CUT FROM THE AUDIO, so the
  // recap now runs straight into the download
  { id: "wrap", from: 100, to: 101 },
];
const beats = planBeats(track, SPECS);
const byId: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));
const OUTRO_PAD = Math.max(0, STORE_OUTRO_F - byId.wrap.durationInFrames);
export const CH_TCH_AUDIO_FRAMES = track.totalFrames;
export const CH_TCH_16X9_DURATION = track.totalFrames + OUTRO_PAD;

const WORDS_TCH = ["catch", "match", "watch", "fetch", "itch", "ditch"];
const WORDS_CH = ["chair", "chin", "chip", "lunch", "beach", "coach"];

const COPY: PairCopy = {
  soundLabel: "/ch/ — “ch!”",
  wrong: [{ bad: "cach", good: "catch" }, { bad: "beatch", good: "beach" }],
  // this script says "It is ch!", not "It's" — and "it" also appears in "Now it is your
  // turn!" and "Do we write it with…", so the answer is the third one
  reveal: { needle: "it", nth: 2 },
};

const R = (b: string, i: number) => P(i) - byId[b].from;
const WR = (b: string, word: string) => W(word) - byId[b].from;
// a word cue taken AFTER a point in time. "which" is said in "which one to write?" at 28.7s,
// so an nth-based cue for the nine landed before the beat even started and the card rendered
// lit from frame 0.
const WA = (b: string, word: string, afterSec: number) => {
  const f = track.wordAbs(word, { afterSec });
  if (f < 0) throw new Error(`ch_tch_16x9: "${word}" after ${afterSec}s not found`);
  return f - byId[b].from;
};

const FOUR_CUES: FourCues = {
  words: [R("four", 41), R("four", 42), R("four", 43), R("four", 44)],
  shouldTake: R("four", 45),
  butNot: R("four", 46),
  why: R("four", 48),
  older: R("four", 50),
  longAgo: R("four", 51),
  ruleCame: R("four", 52),
  trick: R("four", 54),
  pairs: R("four", 55),
  pairA: R("four", 56),
  pairB: R("four", 57),
  stick: R("four", 58),
};

const FIVE_CUES: FiveCues = {
  words: [R("five", 60), R("five", 61), R("five", 62), R("five", 63), R("five", 64)],
  shortToo: R("five", 65),
  travelled: R("five", 66),
  packed: R("five", 67),
  kept: R("five", 68),
};

// the nine are said as two long phrases, so these come from the WORD timings
const NINE_AT = ["much", "such", "rich", "which", "sandwich", "spinach", "ostrich", "attach", "detach"].map((w) =>
  WA("allNine", w, (phrases as { start: number }[])[70].start)
);

const tile = (t: string, k: TilePart["kind"] = "plain"): TilePart => ({ text: t, kind: k });

const HOOK_CUES: HookCues = {
  sound1: R("hook", 1), two: R("hook", 2), write: R("hook", 3),
  // the ch and tch cards light on their OWN spoken word inside "We can write ch, or tch"
  writeCh: WA("hook", "ch", (phrases as { start: number }[])[3].start),
  writeTch: WA("hook", "tch", (phrases as { start: number }[])[3].start),
  sayIt: R("hook", 4), sound2: R("hook", 5), hear: R("hook", 6),
  // same for the two picture words inside "You hear it in chair … in catch"
  hearChair: WA("hook", "chair", (phrases as { start: number }[])[6].start),
  hearCatch: WA("hook", "catch", (phrases as { start: number }[])[6].start),
  same: R("hook", 7),
};

// each worked word CHANGES as its example is named — the first cut held one row of tiles
// while the narration listed three more words, which is the stalled-screen failure
const TCH_CUES: CaseCues = {
  introAt: 0, ruleAt: R("ruleTch", 11),   // "Here is the rule" → the rule diagram
  build: R("ruleTch", 13), done: R("ruleTch", 14), label: R("ruleTch", 15),
  more: [R("ruleTch", 17), R("ruleTch", 18), R("ruleTch", 19)],
  allAt: R("ruleTch", 20),
};
const START_CUES: CaseCues = {
  introAt: 0,
  build: R("chStart", 24), done: R("chStart", 24), label: R("chStart", 24) + 6,
  more: [R("chStart", 25), R("chStart", 26)], allAt: 1e9,
};
const CONS_CUES: CaseCues = {
  introAt: 0,
  build: WR("chCons", "lunch"), done: WR("chCons", "lunch"), label: WR("chCons", "lunch") + 6,
  more: [WR("chCons", "bench")], allAt: 1e9,
};
const LONG_CUES: CaseCues = {
  introAt: 0,
  build: WR("chLong", "beach"), done: WR("chLong", "beach"), label: WR("chLong", "beach") + 6,
  more: [WR("chLong", "coach"), WR("chLong", "peach")], allAt: 1e9,
};

const overlayFor = (b: Beat) => {
  switch (b.id) {
    case "hook": return <ChHook data={data} cues={HOOK_CUES} />;
    case "lookBefore": return <ChLookBefore beat={b} ruleAt={R("lookBefore", 9)} />;
    case "ruleTch":
      return (
        <ChCase
          headline={<>Right after a <span style={{ color: "#D81B60" }}>short vowel</span> → write <span style={{ color: "#D84315" }}>tch</span></>}
          base={[tile("c"), tile("a", "focus"), tile("tch", "ending")]}
          endingColor="D84315" focusLabel="SHORT VOWEL" cues={TCH_CUES}
          examples={[
            { parts: [tile("m"), tile("a", "focus"), tile("tch", "ending")], emoji: "⚽" },
            { parts: [tile("w"), tile("a", "focus"), tile("tch", "ending")], emoji: "⌚" },
            { parts: [tile("f"), tile("e", "focus"), tile("tch", "ending")], emoji: "🐕" },
          ]}
          allWords={["catch", "match", "watch", "fetch"]}
          baseEmoji="🧤"
          introNode={<PlaceCard n="rule" label="look at the letter before" emoji="🔍" />}
        />
      );
    case "chIntro": return <ChPlaces introAt={R("chIntro", 22)} bigAt={0} litAt={[1e9, 1e9, 1e9]} />;
    case "chStart":
      return (
        <ChCase
          headline={<>1 · at the <span style={{ color: "#1565C0" }}>start</span> of a word</>}
          base={[tile("∅", "focus"), tile("ch", "ending"), tile("air")]}
          endingColor="1565C0" focusLabel="NOTHING BEFORE IT" focusColor="6A7B8C" cues={START_CUES}
          baseEmoji="🪑" introNode={<PlaceCard n="1" label="at the start" emoji="🚩" />}
          examples={[
            { parts: [tile("∅", "focus"), tile("ch", "ending"), tile("in")], emoji: "😊" },
            { parts: [tile("∅", "focus"), tile("ch", "ending"), tile("ip")], emoji: "🍟" },
          ]}
        />
      );
    case "chCons":
      return (
        <>
          <ChCase
            headline={<>2 · after a <span style={{ color: "#6A1B9A" }}>consonant</span></>}
            base={[tile("lu"), tile("n", "focus"), tile("ch", "ending")]}
            endingColor="1565C0" focusLabel="CONSONANT" focusColor="6A1B9A" cues={CONS_CUES}
            baseEmoji="🍱" introNode={<PlaceCard n="2" label="after a consonant" emoji="🔤" />}
            examples={[{ parts: [tile("be"), tile("n", "focus"), tile("ch", "ending")], emoji: "🪑" }]}
          />
          {/* the line that DEFINES a consonant gets the vowel chart under it */}
          <ChVowelChart at={R("chCons", 29)} />
        </>
      );
    case "chLong":
      return (
        <ChCase
          headline={<>3 · after a <span style={{ color: "#00897B" }}>long vowel</span></>}
          base={[tile("b"), tile("ea", "focus"), tile("ch", "ending")]}
          endingColor="1565C0" focusLabel="LONG VOWEL" focusColor="00897B" cues={LONG_CUES}
          baseEmoji="🏖️" introNode={<PlaceCard n="3" label="after a long vowel" emoji="🎵" />}
          examples={[
            { parts: [tile("c"), tile("oa", "focus"), tile("ch", "ending")], emoji: "🧑‍🏫" },
            { parts: [tile("p"), tile("ea", "focus"), tile("ch", "ending")], emoji: "🍑" },
          ]}
        />
      );
    case "breakIntro":
      return <ChBreakIntro breakAt={R("breakIntro", 37)} nameAt={R("breakIntro", 38)} nineAt={R("breakIntro", 39)} />;
    case "four": return <ChFour beat={b} cues={FOUR_CUES} />;
    case "five": return <ChFive beat={b} cues={FIVE_CUES} />;
    case "allNine": return <ChAllNine beat={b} wordAt={NINE_AT} finaleAt={R("allNine", 73)} />;
    case "seeIt":
      return (
        <>
          <PairSeeIt data={data} beat={b} wordsMid={WORDS_TCH} wordsEnd={WORDS_CH} swap endHeadAt={R("seeIt", 82) - 20} />
          <ChSeeItNote
            vowelAt={R("seeIt", 81)}
            clearAt={R("seeIt", 82)}
            casesAt={[R("seeIt", 89), WA("seeIt", "consonant", (phrases as { start: number }[])[89].start), WA("seeIt", "long", (phrases as { start: number }[])[89].start)]}
          />
        </>
      );
    // lifted off the pitch band at the foot of the frame
    case "quiz": return <PairQuiz data={data} beat={b} copy={COPY} word="beach" blanked="bea__" answer={0} top={336} />;
    // high in the frame — the block starts inside the top fifth and runs to ~630
    case "recap": return <PairRecap data={data} beat={b} top={170} crest="🏆" scale={0.72} />;
    case "wrap": return <StoreOutro silent total={b.durationInFrames + OUTRO_PAD} bg="rgba(255,253,246,0.72)" />;
    default: return null;
  }
};

type Cue = { from: number; name: string; vol: number };
const SFX: Cue[] = [
  { from: P(1), name: "pop", vol: 0.32 },
  { from: P(5), name: "pop", vol: 0.3 },
  { from: P(7), name: "sparkle", vol: 0.34 },
  { from: P(11), name: "chime_soft", vol: 0.34 },
  { from: P(13), name: "tick", vol: 0.3 },
  { from: P(14), name: "correct", vol: 0.34 },
  { from: P(23), name: "swoosh_soft", vol: 0.3 },
  { from: P(28), name: "swoosh_soft", vol: 0.3 },
  { from: P(32), name: "swoosh_soft", vol: 0.3 },
  { from: P(36), name: "boing", vol: 0.34 },
  { from: P(46), name: "boing", vol: 0.3 },
  { from: P(50), name: "twinkle", vol: 0.32 },
  { from: P(55), name: "chime_soft", vol: 0.32 },
  { from: P(66), name: "whoosh", vol: 0.32 },
  { from: P(68), name: "correct", vol: 0.3 },
  { from: P(73), name: "sparkle", vol: 0.36 },
  { from: P(74), name: "swoosh_soft", vol: 0.32 },
  { from: P(82), name: "swoosh_soft", vol: 0.3 },
  { from: P(90), name: "question", vol: 0.34 },
  { from: P(94) - sec(1.4, FPS), name: "drumroll", vol: 0.3 },
  { from: P(94), name: "correct", vol: 0.4 },
  { from: P(96), name: "sparkle", vol: 0.34 },
  { from: P(100), name: "twinkle", vol: 0.34 },  // the CTA, now right after the recap
];

export const ChTch16x9Reel: React.FC = () => (
  <ReelBase
    audio="audio/ch_tch_16x9/ch_tch_16x9.mp3"
    hueShift={data.hueShift}
    sfx={SFX}
    total={CH_TCH_16X9_DURATION}
    background={<PitchSky />}
    logoUntil={byId.wrap.from}
    logoCorner="tr"
  >
    {/* the coach watches the whole lesson from the touchline */}
    <Sequence from={0} durationInFrames={byId.seeIt.from}>
      <Coach />
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
