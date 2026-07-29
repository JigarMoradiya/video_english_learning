import React from "react";
import { Sequence } from "remotion";
import { ReelBase } from "./ReelBase";
import { comparisons } from "../data/comparisons";
import { Beat, BeatSpec, makeTrack, planBeats, sec } from "../lib/timing";
import { Captions, keywordColorFor } from "../components/Captions";
import { StoreOutroPortrait, STORE_OUTRO_PORTRAIT_F } from "../components/StoreOutroPortrait";
import { LobbySky, Operator } from "../components/LiftWorld";
import { TilePart } from "../components/WordTiles";
import {
  Cued, PCCase, PCHook, PCHookCues, PCLookAfter, PCMoreWords, PCQuiz, PCRecap, PCRule,
  PCShFamily, PC_TONES, SoundCreature, ruleLine,
} from "./c_soft_hard_9x16_beats";
import phrases from "../data/c_soft_hard_9x16.timing.json";
import { FPS } from "../data/tokens";

// ── hard/soft c, 9:16 — THE LIFT ─────────────────────────────────────────────
// Cut from the 3:11 landscape narration, not re-recorded: 73 of its 112 lines,
// chosen speech-region by speech-region so no word is clipped (tools/cut_audio.py,
// verified by an independent transcript rather than by forced alignment).
//
// What was dropped and why: the E-I-Y repeat beat, the 12-word see-it review, the
// like/subscribe interstitial, "in clap the l comes after", and cent/circle/cycle.
// The /sh/ family stayed — special, precious, musician, ancient, ocean — because
// without it the rule misteaches "ocean", and it is worth the 47 seconds it costs.
//
// WORLD: a lift. A lift only moves when a button is pressed, and the button here is
// the letter after the c: /s/ is upstairs, /k/ is downstairs, so "which sound?"
// becomes "which floor?". The 16:9 c video is The Bakery, so this shares nothing
// with it beyond the palette family.
const data = comparisons.c_soft_hard;
const AUDIO_SEC = 187.67;
const track = makeTrack(phrases as never, AUDIO_SEC);

const P = (i: number) => sec((phrases as { start: number }[])[i].start, FPS);
const PS = (i: number) => (phrases as { start: number }[])[i].start;

const SPECS: BeatSpec[] = [
  { id: "hook", from: 0, to: 9 },        // c · two sounds · cat /k/ · city /s/ · same letter
  { id: "lookAfter", from: 10, to: 13 }, // before → after: the reversal
  { id: "rule", from: 14, to: 19 },      // e · i · y → the c goes soft
  { id: "softC", from: 20, to: 26 },     // snake · s-i-ty · City! · the i comes after
  { id: "hardC", from: 27, to: 36 },     // everywhere else · drum · k-a-t · Cat! · a is not one
  { id: "hardMore", from: 37, to: 40 },  // cup · cold · clap
  { id: "shFamily", from: 41, to: 58 },  // special…ocean · not /s/ but /sh/ · -cial…-cean
  { id: "quiz", from: 59, to: 65 },      // cycle → soft, because y comes after
  { id: "recap", from: 66, to: 69 },     // before e/i/y soft · everywhere else hard
  { id: "wrap", from: 70, to: 72 },
];
const beats = planBeats(track, SPECS);
const byId: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));
const OUTRO_PAD = Math.max(0, STORE_OUTRO_PORTRAIT_F - byId.wrap.durationInFrames);
export const C_SOFT_HARD_PORTRAIT_DURATION = track.totalFrames + OUTRO_PAD;

const { SOFT, HARD, DEC } = PC_TONES;

/** Beat-relative frame for a phrase onset. */
const R = (b: string, i: number) => P(i) - byId[b].from;

/**
 * A cue on a single WORD, taken from a given phrase onwards.
 *
 * The epsilon is load-bearing: `wordAbs` skips any word with `start <= after`, so a
 * word that IS its phrase's first word would be excluded. Reading from just before
 * the phrase means "at or after this line begins". No silent fallback — a missing
 * word throws, because a cue that quietly lands at frame 0 fires before its beat.
 */
const W = (b: string, word: string, fromSec: number) => {
  const f = track.wordAbs(word, { afterSec: fromSec - 0.05 });
  if (f < 0) throw new Error(`c 9:16: "${word}" at/after ${fromSec}s not found`);
  return f - byId[b].from;
};

const tile = (t: string, k: TilePart["kind"] = "plain"): TilePart => ({ text: t, kind: k });

// ── hook · phrases 0-9 ───────────────────────────────────────────────────────
const HOOK: PCHookCues = {
  letter: 0,                     // frame 0 is the thumbnail: drawn still, not mid-spring
  pop: R("hook", 1),             // "C."
  two: R("hook", 2),
  first: R("hook", 3),
  catSlot: R("hook", 3),
  cat: R("hook", 4),
  catSound: R("hook", 5),
  citySlot: R("hook", 6),
  city: R("hook", 7),
  citySound: R("hook", 8),
  same: R("hook", 9),
  // 3.9s line, two clauses: "It is the same letter, BUT it makes two different sounds"
  butTwo: W("hook", "but", PS(9)),
};

// ── softC · phrases 20-26 ────────────────────────────────────────────────────
const SOFT_HEADS: Cued[] = [
  { at: 0, node: ruleLine("A soft c says **/s/**", SOFT) },
  { at: W("softC", "snake", PS(20)), node: ruleLine("like a quiet little **snake**", SOFT) },
  { at: R("softC", 25), node: ruleLine("**city**", SOFT) },
  { at: R("softC", 26), node: ruleLine("the **i** comes right after the c", DEC) },
];
const SOFT_NOTES: Cued[] = [
  { at: 0, node: null },
  { at: R("softC", 25), node: ruleLine("it rides to the **soft floor**", SOFT) },
  { at: R("softC", 26), node: ruleLine("**i** is one of the three letters", DEC) },
  { at: W("softC", "soft", PS(26)), node: ruleLine("so this c is **soft**", SOFT) },
];

// ── hardC · phrases 27-36 ────────────────────────────────────────────────────
const HARD_HEADS: Cued[] = [
  { at: 0, node: "So what happens everywhere else?" },
  { at: R("hardC", 28), node: ruleLine("Everywhere else the c stays **hard**", HARD) },
  { at: R("hardC", 29), node: ruleLine("A hard c says **/k/**", HARD) },
  { at: R("hardC", 34), node: ruleLine("**cat**", HARD) },
  { at: R("hardC", 35), node: ruleLine("**a** is not e, i or y", DEC) },
];
const HARD_NOTES: Cued[] = [
  { at: 0, node: null },
  { at: R("hardC", 28), node: ruleLine("this is the **hard floor**", HARD) },
  { at: R("hardC", 30), node: null },
  { at: R("hardC", 34), node: ruleLine("it rides to the **hard floor**", HARD) },
  { at: R("hardC", 35), node: ruleLine("**a** — not one of our three", DEC) },
  // 5.2s line: "…and a is NOT one of our three letters" is its own moment
  { at: W("hardC", "not", PS(35)), node: ruleLine("**not** e, i or y", DEC) },
  { at: R("hardC", 36), node: ruleLine("so this c stays **hard**", HARD) },
];

const overlayFor = (b: Beat) => {
  switch (b.id) {
    case "hook":
      return <PCHook cues={HOOK} />;

    case "lookAfter":
      return (
        <PCLookAfter
          askAt={0}
          beforeAt={R("lookAfter", 11)}
          flipAt={R("lookAfter", 12)}
          afterAt={R("lookAfter", 13)}
          pivotAt={W("lookAfter", "after", PS(13))}
        />
      );

    case "rule":
      return (
        <PCRule
          headAt={0}
          threeAt={R("rule", 15)}
          letterAt={[R("rule", 16), R("rule", 17), R("rule", 18)]}
          ruleAt={R("rule", 19)}
          // the 6.2s rule line carries three moments of its own
          nextAt={W("rule", "next", PS(19))}
          softAt={W("rule", "soft", PS(19))}
        />
      );

    case "softC":
      return (
        <PCCase
          soft
          parts={[tile("c"), tile("i", "focus"), tile("ty")]}
          emoji="🏙️"
          focusLabel="e · i · y → SOFT"
          cues={{
            heads: SOFT_HEADS,
            notes: SOFT_NOTES,
            listen: R("softC", 21),
            partsAt: [R("softC", 22), R("softC", 23), R("softC", 24)],
            wordAt: R("softC", 25),
            labelAt: R("softC", 26),
            preNode: <SoundCreature emoji="🐍" tone={SOFT} ringsFrom={R("softC", 21)} captions={[{ at: 0, node: ruleLine("a quiet **ssss**", SOFT) }]} />,
            preUntil: R("softC", 22),
          }}
        />
      );

    case "hardC":
      return (
        <PCCase
          soft={false}
          parts={[tile("c"), tile("a", "focus"), tile("t")]}
          emoji="🐱"
          focusLabel="NOT e, i or y → HARD"
          activeLitAt={R("hardC", 28)}
          cues={{
            heads: HARD_HEADS,
            notes: HARD_NOTES,
            listen: R("hardC", 30),
            partsAt: [R("hardC", 31), R("hardC", 32), R("hardC", 33)],
            wordAt: R("hardC", 34),
            labelAt: R("hardC", 35),
            preNode: (
              <SoundCreature
                emoji="🥁"
                tone={HARD}
                ringsFrom={R("hardC", 30)}
                captions={[
                  { at: 0, node: ruleLine("so what happens **everywhere else**?", HARD) },
                  { at: R("hardC", 29), node: ruleLine("**/k/** — strong and short", HARD) },
                  { at: W("hardC", "short", PS(29)), node: ruleLine("strong and **short**", HARD) },
                ]}
              />
            ),
            preUntil: R("hardC", 31),
          }}
        />
      );

    case "hardMore":
      return (
        <PCMoreWords
          headAt={0}
          head={ruleLine("More **hard c** words", HARD)}
          tone={HARD}
          sound="/k/"
          at={[R("hardMore", 38), R("hardMore", 39), R("hardMore", 40)]}
          words={[{ w: "cup", emoji: "☕" }, { w: "cold", emoji: "❄️" }, { w: "clap", emoji: "👏" }]}
        />
      );

    case "shFamily":
      return (
        <PCShFamily
          cues={{
            intro: 0,
            look: R("shFamily", 42),
            words: [R("shFamily", 43), R("shFamily", 44), R("shFamily", 45), R("shFamily", 46), R("shFamily", 47)],
            allSoft: R("shFamily", 48),
            notS: R("shFamily", 49),
            saysSh: R("shFamily", 50),
            ends: R("shFamily", 51),
            endsAt: [R("shFamily", 52), R("shFamily", 53), R("shFamily", 54), R("shFamily", 55), R("shFamily", 56)],
            rule: R("shFamily", 57),
            // 4.5s line: the tint moves onto the two vowels as they are named
            twoVowels: W("shFamily", "vowels", PS(57)),
            own: R("shFamily", 58),
            ownVideo: W("shFamily", "video", PS(58)),
          }}
        />
      );

    case "quiz":
      return (
        <PCQuiz
          slotAt={R("quiz", 60)}
          wordAt={R("quiz", 61)}
          askAt={R("quiz", 62)}
          askAt2={R("quiz", 63)}
          revealAt={R("quiz", 64)}
          whyAt={R("quiz", 65)}
        />
      );

    case "recap":
      return (
        <PCRecap
          headAt={0}
          softAt={R("recap", 67)}
          softWordAt={W("recap", "soft", PS(67))}
          sAt={R("recap", 68)}
          hardAt={R("recap", 69)}
          hardWordAt={W("recap", "hard", PS(69))}
          kAt={W("recap", "says", PS(69))}
        />
      );

    case "wrap":
      return <StoreOutroPortrait bg="rgba(58,32,74,0.80)" />;

    default:
      return null;
  }
};

// The operator presses a button wherever a floor is decided.
const PRESS = [P(5), P(8), P(19), P(26), P(28), P(36), P(50), P(64)];

type Cue = { from: number; name: string; vol: number };
const SFX: Cue[] = [
  { from: P(1), name: "pop", vol: 0.32 },
  { from: P(4), name: "pop", vol: 0.3 },
  { from: P(5), name: "chime_soft", vol: 0.32 },
  { from: P(7), name: "pop", vol: 0.3 },
  { from: P(8), name: "chime_soft", vol: 0.34 },
  { from: P(9), name: "sparkle", vol: 0.32 },
  { from: P(13), name: "swoosh_soft", vol: 0.3 },
  { from: P(16), name: "tick", vol: 0.26 },
  { from: P(17), name: "tick", vol: 0.26 },
  { from: P(18), name: "tick", vol: 0.26 },
  { from: P(19), name: "chime_soft", vol: 0.34 },
  { from: P(25), name: "correct", vol: 0.32 },
  { from: P(28), name: "boing", vol: 0.3 },
  { from: P(34), name: "correct", vol: 0.32 },
  { from: P(38), name: "pop", vol: 0.28 },
  { from: P(39), name: "pop", vol: 0.28 },
  { from: P(40), name: "pop", vol: 0.28 },
  { from: P(41), name: "twinkle", vol: 0.3 },
  { from: P(50), name: "sparkle", vol: 0.34 },
  { from: P(57), name: "chime_soft", vol: 0.32 },
  { from: P(59), name: "question", vol: 0.34 },
  { from: P(64) - sec(1.2, FPS), name: "drumroll", vol: 0.28 },
  { from: P(64), name: "correct", vol: 0.4 },
  { from: P(66), name: "sparkle", vol: 0.32 },
  { from: P(70), name: "twinkle", vol: 0.32 },
];

export const CSoftHardPortraitReel: React.FC = () => (
  <ReelBase
    audio="audio/c_soft_hard_9x16/c_soft_hard_9x16.mp3"
    hueShift={data.hueShift}
    sfx={SFX}
    total={C_SOFT_HARD_PORTRAIT_DURATION}
    background={<LobbySky />}
    logoUntil={byId.wrap.from}
    logoCorner="tl"
  >
    {/* the operator works the panel until the outro takes the frame */}
    <Sequence from={0} durationInFrames={byId.wrap.from}>
      <Operator pressAt={PRESS} softLitAt={P(8)} hardLitAt={P(5)} />
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
