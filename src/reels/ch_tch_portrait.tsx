import React from "react";
import { Sequence } from "remotion";
import { ReelBase } from "./ReelBase";
import { comparisons } from "../data/comparisons";
import { Beat, BeatSpec, makeTrack, planBeats, sec } from "../lib/timing";
import { Captions, keywordColorFor } from "../components/Captions";
import { StoreOutroPortrait, STORE_OUTRO_PORTRAIT_F } from "../components/StoreOutroPortrait";
import { CabinetSky, Player } from "../components/ClawMachine";
import { TilePart } from "../components/WordTiles";
import { PairCopy } from "./pair_16x9_beats";
import { PPairQuiz, PPairRecap } from "./pair_9x16_beats";
import {
  CBreakCues, CBreakers, CCase, CCaseCues, CChIntro, CHook, CHookCues, CLookBefore,
  CNotes, CPlaceCard, CPocket, CSwapNote, C_TONES,
} from "./ch_tch_9x16_beats";
import phrases from "../data/ch_tch_9x16.timing.json";
import { FPS } from "../data/tokens";

// ── ch/tch, 9:16 — THE CLAW MACHINE ─────────────────────────────────────────
// Its own narration, not a cut of the 16:9 one. ch/tch cannot reach three minutes by editing:
// its rule-breaker story alone is 2:22 of the 6:33 landscape lesson, so every single-video cut
// either ran over or dropped something real. This is a purpose-written 235-word script, read
// in 2:26.
//
// WORLD: `catch` is this card's own word and is literally what a claw does. It also gives the
// portrait cut a pointing device of its own — ge/dge's portrait uses a spotlight, and these two
// are siblings teaching the same shape of rule, so sharing a device would make them read as
// re-crops. The claw descends and its pincers close on the letter before the sound, and it is
// mounted INSIDE the focus tile so it cannot drift onto a neighbour.
//
// Every one of the 46 phrases has its own cue below. Three lines run long — 5.4s, 5.8s and
// 7.1s — and each is broken up by cues on its own words rather than held.
const data = comparisons.ch_tch;
const AUDIO_SEC = 146.76;
const track = makeTrack(phrases as never, AUDIO_SEC);

const P = (i: number) => sec((phrases as { start: number }[])[i].start, FPS);
const PS = (i: number) => (phrases as { start: number }[])[i].start;

const SPECS: BeatSpec[] = [
  { id: "hook", from: 0, to: 7 },        // fun sound · Ch! ×3 · two spellings · chair and catch
  { id: "lookBefore", from: 8, to: 9 },  // the claw grabs the vowel before
  { id: "ruleTch", from: 10, to: 19 },   // short vowel → tch. C-a-tch. Match. Watch. Fetch.
  { id: "chIntro", from: 20, to: 20 },   // most of the time → ch
  { id: "chStart", from: 21, to: 23 },   // at the start: chair, chin
  { id: "chCons", from: 24, to: 25 },    // after a consonant: lunch, bench
  { id: "chLong", from: 26, to: 29 },    // after a long vowel: beach, coach
  { id: "breakers", from: 30, to: 37 },  // much/such/rich/which + ostrich, attach
  { id: "quiz", from: 38, to: 43 },      // your turn → coach → it is ch
  { id: "recap", from: 44, to: 47 },     // the rule, and don't forget the special words
  { id: "wrap", from: 48, to: 50 },
];
const beats = planBeats(track, SPECS);
const byId: Record<string, Beat> = Object.fromEntries(beats.map((b) => [b.id, b]));
const OUTRO_PAD = Math.max(0, STORE_OUTRO_PORTRAIT_F - byId.wrap.durationInFrames);
export const CH_TCH_PORTRAIT_DURATION = track.totalFrames + OUTRO_PAD;

const { CH, TCH, SHORT, CONS, LONG } = C_TONES;

const COPY: PairCopy = {
  soundLabel: "/ch/ — “ch!”",
  wrong: [{ bad: "cach", good: "catch" }, { bad: "coatch", good: "coach" }],
  // "it" inside the quiz beat: "Now, IT is your turn" · "write IT with ch" · "IT is ch!"
  // — the reveal is the third, so nth = 2 (ZERO-indexed). Verified against the alignment.
  reveal: { needle: "it", nth: 2 },
};

const R = (b: string, i: number) => P(i) - byId[b].from;
// A word cue taken from a given phrase onwards — nth counts across the whole track, so a word
// that also appears earlier would otherwise fire before its beat begins.
//
// The epsilon matters: wordAbs skips anything with `w.start <= after`, so a word that IS its
// phrase's first word (identical start time) is excluded. "Much," opens phrase 30, which is
// exactly that case — it threw rather than mis-firing, because this helper has no silent
// fallback. Reading from just before the phrase means "at or after this line begins".
const WA = (b: string, word: string, fromSec: number) => {
  const f = track.wordAbs(word, { afterSec: fromSec - 0.05 });
  if (f < 0) throw new Error(`ch_tch_9x16: "${word}" at/after ${fromSec}s not found`);
  return f - byId[b].from;
};

const tile = (t: string, k: TilePart["kind"] = "plain"): TilePart => ({ text: t, kind: k });

// 0 · 1 · 2 · 3 · 4 · 5
const HOOK_CUES: CHookCues = {
  sounds: [R("hook", 1), R("hook", 2), R("hook", 3)],
  two: R("hook", 4),
  // each blank card fills on its OWN spelling inside "We can write ch, or we can write tch"
  writeCh: WA("hook", "ch", PS(5)), writeTch: WA("hook", "tch", PS(5)),
  hear: R("hook", 6),
  // and each picture lights on its own word inside "You hear it in chair … in catch"
  hearChair: WA("hook", "chair", PS(6)), hearCatch: WA("hook", "catch", PS(6)),
  same: R("hook", 7),
};

// 8 → 17
const TCH_CUES: CCaseCues = {
  intro: 0, rule: R("ruleTch", 11),
  build: R("ruleTch", 13), done: WA("ruleTch", "tch", PS(13)), label: R("ruleTch", 15),
  more: [R("ruleTch", 17), R("ruleTch", 18), R("ruleTch", 19)],
};
// 19 → 21
const START_CUES: CCaseCues = {
  intro: 0,
  build: R("chStart", 22), done: R("chStart", 22), label: R("chStart", 22) + 6,
  more: [R("chStart", 23)],
};
// 22 → 23. One 5.4s line carries four teaching moments, so it gets four cues.
const CONS_CUES: CCaseCues = {
  intro: 0,
  build: WA("chCons", "lunch", PS(24)), done: WA("chCons", "lunch", PS(24)),
  label: WA("chCons", "n", PS(24)),
  more: [R("chCons", 25)],
};
// 24 → 27
const LONG_CUES: CCaseCues = {
  intro: 0,
  build: R("chLong", 27), done: R("chLong", 27), label: R("chLong", 27) + 6,
  more: [R("chLong", 28)],
};
// 28 → 33
const BREAK_CUES: CBreakCues = {
  warn: R("breakers", 30), few: R("breakers", 31),
  // the four are one 6.0s phrase, so each card lights on its OWN spoken word
  words: [
    WA("breakers", "much", PS(32)), WA("breakers", "such", PS(32)),
    WA("breakers", "rich", PS(32)), WA("breakers", "which", PS(32)),
  ],
  shortToo: R("breakers", 33), byHeart: R("breakers", 34),
  // the recording gives ostrich and attach their own utterances, so they get their own cues
  longer: R("breakers", 35),
  ostrich: R("breakers", 36), attach: R("breakers", 37),
};

const overlayFor = (b: Beat) => {
  switch (b.id) {
    case "hook": return <CHook cues={HOOK_CUES} />;
    case "lookBefore": return <CLookBefore ruleAt={R("lookBefore", 9)} />;
    case "ruleTch":
      return (
        <CCase
          head={<>Right after a <span style={{ color: `#${SHORT}` }}>short vowel</span> → <span style={{ color: `#${TCH}` }}>tch</span></>}
          base={[tile("c"), tile("a", "focus"), tile("tch", "ending")]}
          endingColor={TCH} focusLabel="SHORT VOWEL" focusColor={SHORT} cues={TCH_CUES}
          examples={[
            { parts: [tile("m"), tile("a", "focus"), tile("tch", "ending")], word: "match" },
            { parts: [tile("w"), tile("a", "focus"), tile("tch", "ending")], word: "watch" },
            { parts: [tile("f"), tile("e", "focus"), tile("tch", "ending")], word: "fetch" },
          ]}
          baseWord="catch"
          introNode={<CPlaceCard n="the rule" label="look at the letter before" emoji="🔎" tone={TCH} />}
          clawAt={R("ruleTch", 15)}
          notes={[
            { at: R("ruleTch", 12), node: CNotes.listen },
            { at: R("ruleTch", 13), node: null },
            { at: R("ruleTch", 14), node: CNotes.caught },
            { at: R("ruleTch", 15), node: null },
            { at: R("ruleTch", 16), node: CNotes.more },
            { at: R("ruleTch", 17), node: null },
          ]}
        />
      );
    case "chIntro": return <CChIntro />;
    case "chStart":
      return (
        <CCase
          head={<>1 · at the <span style={{ color: `#${CH}` }}>start</span> of a word</>}
          base={[tile(" ", "focus"), tile("ch", "ending"), tile("air")]}
          endingColor={CH} focusLabel="NOTHING BEFORE IT" focusColor="6A7B8C" cues={START_CUES}
          examples={[{ parts: [tile(" ", "focus"), tile("ch", "ending"), tile("in")], word: "chin" }]}
          baseWord="chair"
          introNode={<CPlaceCard n="1" label="at the start" emoji="🚩" tone={CH} />}
          notes={[{ at: R("chStart", 21), node: CNotes.nothingBefore }, { at: R("chStart", 22), node: null }]}
        />
      );
    case "chCons":
      return (
        <CCase
          head={<>2 · after a <span style={{ color: `#${CONS}` }}>consonant</span></>}
          base={[tile("lu"), tile("n", "focus"), tile("ch", "ending")]}
          endingColor={CH} focusLabel="CONSONANT" focusColor={CONS} cues={CONS_CUES}
          examples={[{ parts: [tile("be"), tile("n", "focus"), tile("ch", "ending")], word: "bench" }]}
          baseWord="lunch"
          introNode={<CPlaceCard n="2" label="after a consonant" emoji="🔤" tone={CONS} />}
          clawAt={WA("chCons", "n", PS(24))}
        />
      );
    case "chLong":
      return (
        <CCase
          head={<>3 · after a <span style={{ color: `#${LONG}` }}>long vowel</span></>}
          base={[tile("b"), tile("ea", "focus"), tile("ch", "ending")]}
          endingColor={CH} focusLabel="LONG VOWEL" focusColor={LONG} cues={LONG_CUES}
          examples={[{ parts: [tile("c"), tile("oa", "focus"), tile("ch", "ending")], word: "coach" }]}
          baseWord="beach"
          introNode={<CPlaceCard n="3" label="after a long vowel" emoji="🎵" tone={LONG} />}
          clawAt={R("chLong", 27) + 6}
          notes={[
            { at: WA("chLong", "name", PS(26)), node: CNotes.saysName },
            { at: R("chLong", 27), node: null },
            { at: R("chLong", 29), node: CNotes.allThree },
          ]}
        />
      );
    case "breakers": return <CBreakers cues={BREAK_CUES} />;
    case "quiz": return <PPairQuiz data={data} beat={b} copy={COPY} word="coach" blanked="coa__" answer={0} />;
    case "recap":
      return (
        <>
          <PPairRecap data={data} beat={b} top={400} opaque depth3d logoSize={190} logoGap={34} logoPulse />
          <CPocket at={R("recap", 47)} />
        </>
      );
    case "wrap": return <StoreOutroPortrait bg="rgba(12,36,64,0.80)" />;
    default: return null;
  }
};

// the player thumps the joystick where a verdict lands
const PRESS = [P(11), P(14), P(20), P(30), P(42), P(44)];

type Cue = { from: number; name: string; vol: number };
const SFX: Cue[] = [
  { from: P(1), name: "pop", vol: 0.32 },
  { from: P(3), name: "pop", vol: 0.3 },
  { from: P(5), name: "tick", vol: 0.28 },
  { from: P(7), name: "sparkle", vol: 0.34 },
  { from: P(11), name: "chime_soft", vol: 0.34 },
  { from: P(13), name: "tick", vol: 0.3 },
  { from: P(14), name: "correct", vol: 0.34 },
  { from: P(20), name: "chime_soft", vol: 0.32 },
  { from: P(21), name: "swoosh_soft", vol: 0.3 },
  { from: P(24), name: "swoosh_soft", vol: 0.3 },
  { from: P(26), name: "swoosh_soft", vol: 0.3 },
  { from: P(30), name: "boing", vol: 0.34 },
  { from: P(34), name: "twinkle", vol: 0.32 },
  { from: P(38), name: "question", vol: 0.34 },
  { from: P(42) - sec(1.4, FPS), name: "drumroll", vol: 0.3 },
  { from: P(42), name: "correct", vol: 0.4 },
  { from: P(44), name: "sparkle", vol: 0.34 },
  { from: P(47), name: "twinkle", vol: 0.34 },
  { from: P(48), name: "twinkle", vol: 0.32 },
];

export const ChTchPortraitReel: React.FC = () => (
  <ReelBase
    audio="audio/ch_tch_9x16/ch_tch_9x16.mp3"
    hueShift={data.hueShift}
    sfx={SFX}
    total={CH_TCH_PORTRAIT_DURATION}
    background={<CabinetSky />}
    logoUntil={byId.wrap.from}
    logoCorner="tl"
  >
    {/* the player works the machine until the quiz takes the whole frame */}
    <Sequence from={0} durationInFrames={byId.quiz.from}>
      <Player pressAt={PRESS} />
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
