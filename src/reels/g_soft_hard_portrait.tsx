import React from "react";
import { Sequence } from "remotion";
import { ReelBase } from "./ReelBase";
import { comparisons } from "../data/comparisons";
import { Beat, BeatSpec, makeTrack, planBeats, sec } from "../lib/timing";
import { Captions, keywordColorFor } from "../components/Captions";
import { StoreOutroPortrait, STORE_OUTRO_PORTRAIT_F } from "../components/StoreOutroPortrait";
import { Operator, TowerSky } from "../components/GumballWorld";
import { TilePart } from "../components/WordTiles";
import {
  Cued, PGBreakers, PGCase, PGHook, PGHookCues, PGLookAfter, PGQuiz, PGRecap, PGRule,
  PG_TONES, SoundBall, ruleLine,
} from "./g_soft_hard_9x16_beats";
import phrases from "../data/g_soft_hard_9x16.timing.json";
import { FPS } from "../data/tokens";

// ── hard/soft g, 9:16 — THE GUMBALL TOWER ────────────────────────────────────
// Cut from the 16:9 narration: 64 of its 103 lines, chosen speech-region by
// speech-region so no word is clipped (tools/cut_audio.py, verified against an
// independent transcript rather than by forced alignment).
//
// Dropped: the 12-word see-it review, the like/subscribe interstitial, the c-vs-g
// reliability bars, the cage/large/bridge callback, the ear trick, giant/gym/magic,
// goat/glad/flag, and "you say these every day".
//
// KEPT, non-negotiably: get · give · girl · gift · begin · tiger. Cut them and the
// video teaches that "get" is said "jet". That block is the reason g could not be
// squeezed as small as c.
//
// WORLD: a gumball machine. *Gum* is already this card's hard-g example word, and a
// gumball can come out a different colour than it looked — which is exactly what
// the tricky six do. The 16:9 g video is The Magic Garden; this shares nothing with it.
const data = comparisons.g_soft_hard;
const AUDIO_SEC = 174.01;
const track = makeTrack(phrases as never, AUDIO_SEC);

const P = (i: number) => sec((phrases as { start: number }[])[i].start, FPS);
const PS = (i: number) => (phrases as { start: number }[])[i].start;

const SPECS: BeatSpec[] = [
  { id: "hook", from: 0, to: 9 },         // g · two sounds like c · goat /g/ · gem /j/
  { id: "lookAfter", from: 10, to: 12 },  // the same secret as c → the letter after
  { id: "rule", from: 13, to: 18 },       // e · i · y → the g goes soft
  { id: "softG", from: 19, to: 25 },      // /j/ · g-e-m · Gem! · the e comes after
  { id: "hardG", from: 26, to: 35 },      // everywhere else · g-u-m · Gum! · u is not one
  { id: "breakers", from: 36, to: 46 },   // get give girl gift begin tiger — should be soft
  { id: "quiz", from: 47, to: 52 },       // green → hard, because r comes after
  { id: "recap", from: 53, to: 60 },      // soft · hard · and the tricky friends
  { id: "wrap", from: 61, to: 63 },
];
const beats = planBeats(track, SPECS);
const byId: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));
const OUTRO_PAD = Math.max(0, STORE_OUTRO_PORTRAIT_F - byId.wrap.durationInFrames);
export const G_SOFT_HARD_PORTRAIT_DURATION = track.totalFrames + OUTRO_PAD;

const { SOFT, HARD, DEC } = PG_TONES;

const R = (b: string, i: number) => P(i) - byId[b].from;

/**
 * A cue on a single WORD from a given phrase onwards. The epsilon matters:
 * `wordAbs` skips any word with `start <= after`, so a word that IS its phrase's
 * first word would be excluded. No silent fallback — a miss throws rather than
 * quietly landing at frame 0, before its beat begins.
 */
const W = (b: string, word: string, fromSec: number) => {
  const f = track.wordAbs(word, { afterSec: fromSec - 0.05 });
  if (f < 0) throw new Error(`g 9:16: "${word}" at/after ${fromSec}s not found`);
  return f - byId[b].from;
};

const tile = (t: string, k: TilePart["kind"] = "plain"): TilePart => ({ text: t, kind: k });

// ── hook · phrases 0-9 ───────────────────────────────────────────────────────
const HOOK: PGHookCues = {
  letter: 0,
  pop: R("hook", 1),
  two: R("hook", 2),
  // 3.3s line: "G has two different sounds, JUST LIKE C" is a second moment
  likeC: W("hook", "just", PS(2)),
  first: R("hook", 3),
  goatSlot: R("hook", 3),
  goat: R("hook", 4),
  goatSound: R("hook", 5),
  gemSlot: R("hook", 6),
  gem: R("hook", 7),
  gemSound: R("hook", 8),
  same: R("hook", 9),
  // 2.7s: "The same letter, MAKING two different sounds"
  makingTwo: W("hook", "making", PS(9)),
};

// ── softG · phrases 19-25 ────────────────────────────────────────────────────
const SOFT_HEADS: Cued[] = [
  { at: 0, node: ruleLine("A soft g says **/j/**", SOFT) },
  { at: R("softG", 24), node: ruleLine("**gem**", SOFT) },
  { at: R("softG", 25), node: ruleLine("the **e** comes right after the g", DEC) },
];
const SOFT_NOTES: Cued[] = [
  { at: 0, node: null },
  { at: R("softG", 24), node: ruleLine("a **soft** gumball drops", SOFT) },
  { at: R("softG", 25), node: ruleLine("**e** is one of the three letters", DEC) },
  { at: W("softG", "soft", PS(25)), node: ruleLine("so this g is **soft**", SOFT) },
];

// ── hardG · phrases 26-35 ────────────────────────────────────────────────────
const HARD_HEADS: Cued[] = [
  { at: 0, node: "So what happens everywhere else?" },
  { at: R("hardG", 27), node: ruleLine("Everywhere else the g stays **hard**", HARD) },
  { at: R("hardG", 28), node: ruleLine("A hard g says **/g/**", HARD) },
  { at: R("hardG", 33), node: ruleLine("**gum**", HARD) },
  { at: R("hardG", 34), node: ruleLine("**u** is not e, i or y", DEC) },
];
const HARD_NOTES: Cued[] = [
  { at: 0, node: null },
  { at: R("hardG", 27), node: ruleLine("a **hard** gumball", HARD) },
  { at: R("hardG", 29), node: null },
  { at: R("hardG", 33), node: ruleLine("a **hard** gumball drops", HARD) },
  { at: R("hardG", 34), node: ruleLine("**u** — not one of our three", DEC) },
  // 5.2s line: "…and u is NOT one of our three letters" gets its own moment
  { at: W("hardG", "not", PS(34)), node: ruleLine("**not** e, i or y", DEC) },
  { at: R("hardG", 35), node: ruleLine("so this g stays **hard**", HARD) },
];

const overlayFor = (b: Beat) => {
  switch (b.id) {
    case "hook":
      return <PGHook cues={HOOK} />;

    case "lookAfter":
      return (
        <PGLookAfter
          askAt={0}
          secretAt={R("lookAfter", 11)}
          afterAt={R("lookAfter", 12)}
          pivotAt={W("lookAfter", "after", PS(12))}
        />
      );

    case "rule":
      return (
        <PGRule
          headAt={0}
          threeAt={R("rule", 14)}
          letterAt={[R("rule", 15), R("rule", 16), R("rule", 17)]}
          ruleAt={R("rule", 18)}
          // the 7.5s rule line is the longest in either video — three moments
          nextAt={W("rule", "next", PS(18))}
          softAt={W("rule", "soft", PS(18))}
        />
      );

    case "softG":
      return (
        <PGCase
          soft
          parts={[tile("g"), tile("e", "focus"), tile("m")]}
          emoji="💎"
          focusLabel="e · i · y → SOFT"
          cues={{
            heads: SOFT_HEADS,
            notes: SOFT_NOTES,
            partsAt: [R("softG", 21), R("softG", 22), R("softG", 23)],
            wordAt: R("softG", 24),
            labelAt: R("softG", 25),
            preNode: <SoundBall tone={SOFT} sound="/j/" ringsFrom={R("softG", 20)} captions={[{ at: 0, node: ruleLine("a soft **/j/**", SOFT) }]} />,
            preUntil: R("softG", 21),
          }}
        />
      );

    case "hardG":
      return (
        <PGCase
          soft={false}
          parts={[tile("g"), tile("u", "focus"), tile("m")]}
          emoji="🍬"
          focusLabel="NOT e, i or y → HARD"
          activeLitAt={R("hardG", 27)}
          cues={{
            heads: HARD_HEADS,
            notes: HARD_NOTES,
            partsAt: [R("hardG", 30), R("hardG", 31), R("hardG", 32)],
            wordAt: R("hardG", 33),
            labelAt: R("hardG", 34),
            preNode: (
              <SoundBall
                tone={HARD}
                sound="/g/"
                ringsFrom={R("hardG", 29)}
                captions={[
                  { at: 0, node: ruleLine("so what happens **everywhere else**?", HARD) },
                  { at: R("hardG", 28), node: ruleLine("**/g/** — deep in your throat", HARD) },
                  { at: W("hardG", "throat", PS(28)), node: ruleLine("deep in your **throat**", HARD) },
                ]}
              />
            ),
            preUntil: R("hardG", 30),
          }}
        />
      );

    case "breakers":
      return (
        <PGBreakers
          cues={{
            warn: 0,
            some: R("breakers", 37),
            // the 6.5s breaker line carries three moments of its own
            anyway: W("breakers", "anyway", PS(37)),
            listen: R("breakers", 38),
            words: [
              R("breakers", 39), R("breakers", 40), R("breakers", 41),
              R("breakers", 42), R("breakers", 43), R("breakers", 44),
            ],
            shouldBe: R("breakers", 45),
            // every gumball flips from soft to hard on the word "not"
            flip: W("breakers", "not", PS(45)),
            sight: R("breakers", 46),
          }}
        />
      );

    case "quiz":
      return (
        <PGQuiz
          slotAt={R("quiz", 48)}
          wordAt={R("quiz", 49)}
          askAt={R("quiz", 50)}
          askAt2={W("quiz", "soft", PS(50))}
          revealAt={R("quiz", 51)}
          whyAt={R("quiz", 52)}
        />
      );

    case "recap":
      return (
        <PGRecap
          headAt={0}
          softAt={R("recap", 54)}
          softWordAt={W("recap", "soft", PS(54))}
          jAt={W("recap", "says", PS(54))}
          hardAt={R("recap", 55)}
          hardWordAt={W("recap", "hard", PS(55))}
          gAt={W("recap", "says", PS(55))}
          trickAt={R("recap", 56)}
          trickWords={[R("recap", 57), R("recap", 58), R("recap", 59), R("recap", 60)]}
        />
      );

    case "wrap":
      return <StoreOutroPortrait bg="rgba(24,48,28,0.78)" />;

    default:
      return null;
  }
};

// the operator cranks the machine wherever a gumball is decided
const PRESS = [P(5), P(8), P(18), P(25), P(27), P(35), P(45), P(51)];

type Cue = { from: number; name: string; vol: number };
const SFX: Cue[] = [
  { from: P(1), name: "pop", vol: 0.32 },
  { from: P(4), name: "pop", vol: 0.3 },
  { from: P(5), name: "chime_soft", vol: 0.32 },
  { from: P(7), name: "pop", vol: 0.3 },
  { from: P(8), name: "chime_soft", vol: 0.34 },
  { from: P(9), name: "sparkle", vol: 0.32 },
  { from: P(12), name: "swoosh_soft", vol: 0.3 },
  { from: P(15), name: "tick", vol: 0.26 },
  { from: P(16), name: "tick", vol: 0.26 },
  { from: P(17), name: "tick", vol: 0.26 },
  { from: P(18), name: "chime_soft", vol: 0.34 },
  { from: P(24), name: "correct", vol: 0.32 },
  { from: P(27), name: "boing", vol: 0.3 },
  { from: P(33), name: "correct", vol: 0.32 },
  { from: P(36), name: "boing", vol: 0.34 },
  { from: P(39), name: "pop", vol: 0.26 },
  { from: P(40), name: "pop", vol: 0.26 },
  { from: P(41), name: "pop", vol: 0.26 },
  { from: P(42), name: "pop", vol: 0.26 },
  { from: P(45), name: "twinkle", vol: 0.32 },
  { from: P(46), name: "chime_soft", vol: 0.3 },
  { from: P(47), name: "question", vol: 0.34 },
  { from: P(51) - sec(1.2, FPS), name: "drumroll", vol: 0.28 },
  { from: P(51), name: "correct", vol: 0.4 },
  { from: P(53), name: "sparkle", vol: 0.32 },
  { from: P(61), name: "twinkle", vol: 0.32 },
];

export const GSoftHardPortraitReel: React.FC = () => (
  <ReelBase
    audio="audio/g_soft_hard_9x16/g_soft_hard_9x16.mp3"
    hueShift={data.hueShift}
    sfx={SFX}
    total={G_SOFT_HARD_PORTRAIT_DURATION}
    background={<TowerSky />}
    logoUntil={byId.wrap.from}
    logoCorner="tl"
  >
    <Sequence from={0} durationInFrames={byId.wrap.from}>
      <Operator pressAt={PRESS} />
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
