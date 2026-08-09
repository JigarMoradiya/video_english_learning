import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { MUSIC_BED, MUSIC_FADE_IN, MUSIC_FADE_OUT } from "../data/mix";
import phrasesJson from "../data/l5_rules_p3.captions.json";
import { Captions } from "../components/Captions";
import { makeTrack, TPhrase } from "../lib/timing";
import { spokenIn } from "../lib/spoken";
import { Watermark } from "../components/Watermark";
import { Confetti } from "../components/Confetti";
import { StoreOutro, STORE_OUTRO_F } from "../components/StoreOutro";
import {
  B, Banner, Card, Content, Ear, Fixed, Hat, Line, Link, Mark, Named, Pic, Plate, Point,
  NumCard, Row, Sentence, STAGE, StageWorld, Tag, Thinking, Tone, TryLoop, Tux, TuxMood, Wand,
  Wiggle, Word, WordList, bands,
} from "../components/MagicStage";

// ── L5 · SPELLING RULES — PART 3 (the letter x, and the tricky w) ────────────
//
// 6:29, 117 narration lines, one visual change EVERY line. The last part of Level Five.
//
// The world is The Magic Stage, and the teacher's own words chose it: "the letter w likes
// to play tricks", "that's the trick w likes to play", and one of the six w-words is
// literally `wand`.
//
//   · THE HAT is x. One letter in, two doves out (/k/ and /s/) — and then they fly back
//     TOGETHER into one /ks/. The merge is the lesson: x is one sound made of two, not two
//     sounds you say apart.
//   · FEED IT `xx` and it JAMS in a puff of smoke. That is "never double the x", shown.
//   · THE WAND is w. It zaps the `a` and the card flips to `o`. On `wag` it FIZZLES and
//     nothing changes — the honest half of the w lesson, and the half a video is most
//     tempted to leave out.
//
// Every law Part 2 cost thirty rounds to learn is applied here from the first render:
//   1. Every line gets its own visual, and no line may show an empty stage.
//   2. The screen NEVER restates the caption. If the teacher says it, the screen shows it.
//   3. Consecutive lines ADD to one held stage; they do not each build a new frame.
//   4. Nothing but Content may enter the content box; 16:9 and 4:5 do not share a layout.

const FPS = 30;
const P = phrasesJson as unknown as TPhrase[];
const TOTAL = P[P.length - 1].end;
const AUDIO_SEC = 389.88;   // the real mp3 length; the transcript ends 1.06s short
const f = (s: number) => Math.round(s * FPS);
const at = (i: number) => f(P[i].start);

const TRACK = makeTrack(P, TOTAL, FPS, 1.0);

const STARTS = [0, 12, 32, 46, 56, 80, 96, 103];
const BANNERS = [
  "LEVEL 5 · SPELLING RULES",
  "THE LETTER  x",
  "WORDS WITH  x",
  "NEVER DOUBLE THE  x",
  "THE TRICKY LETTER  w",
  "…BUT NOT EVERY TIME",
  "LEVEL 5 · ALL SIX RULES",
  "LEVEL 5 · SPELLING RULES",
];

const norm = (s: string) => s.trim().replace(/['’]/g, "").toLowerCase();
const STORE_FROM_IDX = P.findIndex((p) => norm(p.text).startsWith("and practise"));
if (STORE_FROM_IDX < 0) throw new Error("l5_p3: could not find the download line");

export const L5_P3_DURATION = Math.max(f(AUDIO_SEC) + 40, at(STORE_FROM_IDX) + STORE_OUTRO_F);

const phraseAt = (frame: number): number => {
  let idx = 0;
  for (let i = 0; i < P.length; i++) {
    if (f(P[i].start) <= frame) idx = i;
    else break;
  }
  return idx;
};
const sectionOf = (idx: number): number => {
  let s = 0;
  for (let i = 0; i < STARTS.length; i++) if (STARTS[i] <= idx) s = i;
  return s;
};

/** a chunk Whisper split mid-sentence is not a beat of its own — the previous visual holds */
const MIN_BEAT = 0.75;
const BEAT_OF: number[] = (() => {
  const out: number[] = [];
  let cur = 0;
  for (let i = 0; i < P.length; i++) {
    const until = i + 1 < P.length ? P[i + 1].start : P[i].end;
    if (i === 0 || until - P[i].start >= MIN_BEAT) cur = i;
    out.push(cur);
  }
  return out;
})();

// which lines run the hat's trick, and which line jams it
const HAT_AT = new Set([17, 18, 20, 22, 29, 33, 42, 43, 44]);
const HAT_JAM = new Set([50, 51, 55]);
// which lines wave the wand, and which line it fizzles on
const WAND_AT = new Set([58, 63, 64, 65, 69, 76, 79]);
const WAND_FIZZLE = new Set([81, 82, 83, 84]);

const TUX_BOW = new Set([0, 5, 45, 92, 95, 103, 105, 106]);
const TUX_PRESENT = new Set([12, 32, 56, 59, 87, 96]);
const TUX_DUCK = new Set([50, 51, 55]);
const TUX_SHRUG = new Set([81, 82, 84]);
const TUX_WAVE = new Set([58, 64, 69, 79]);

// ── sound ────────────────────────────────────────────────────────────────────
// an sfx is only ever allowed in a GAP; over a word it makes the teacher hard to hear
const gapFrame = (i: number): number | null => {
  const prevEnd = i > 0 ? P[i - 1].end : 0;
  const start = P[i].start;
  if (start - prevEnd >= 0.30) return f(Math.max(prevEnd + 0.06, start - 0.24));
  const nextStart = i + 1 < P.length ? P[i + 1].start : P[i].end + 1;
  if (nextStart - P[i].end >= 0.30) return f(P[i].end + 0.08);
  return null;
};
const CUES: { i: number; file: string; vol: number }[] = [];
const cue = (i: number, file: string, vol: number) => {
  if (i >= 0 && i < P.length) CUES.push({ i, file, vol });
};
STARTS.forEach((i, n) => cue(i, ["chime_soft", "blend", "brand_chime"][n % 3], 0.13));
HAT_AT.forEach((i) => cue(i, "sparkle", 0.11));       // the trick works
HAT_JAM.forEach((i) => cue(i, "boing", 0.12));        // the trick jams
WAND_AT.forEach((i) => cue(i, "twinkle", 0.11));      // the wand zaps
WAND_FIZZLE.forEach((i) => cue(i, "drop", 0.11));     // the wand fizzles
[45, 92, 103, 105].forEach((i) => cue(i, "sparkle", 0.13));
[16, 21, 66, 91].forEach((i) => cue(i, "question", 0.10));
[52, 54, 68, 83].forEach((i) => cue(i, "correct", 0.10));
[14, 80].forEach((i) => cue(i, "riser", 0.10));

const seen = new Set<number>();
const SFX = CUES
  .filter((c) => (seen.has(c.i) ? false : (seen.add(c.i), true)))
  .map((c) => ({ ...c, frame: gapFrame(c.i) }))
  .filter((c): c is { i: number; file: string; vol: number; frame: number } => c.frame !== null);

// ── the words ────────────────────────────────────────────────────────────────

const RULE_WORDS: [number, string][] = [
  [1, "floss"], [2, "c k ck"], [3, "ng"], [4, "nk"], [5, "x"], [6, "w"],
];
const X_WORDS = ["fox", "box", "six", "mix", "fix", "wax"];
const X_SENT: Record<string, [string, string]> = {
  fox: ["The fox has a bushy tail.", "fox"],
  box: ["We put the toys in the box.", "toys"],
  six: ["I can count to six.", "six"],
  mix: ["We mix the flour and the eggs.", "flour"],
  fix: ["Dad will fix my bike.", "bike"],
  wax: ["The candle is made of wax.", "wax"],
};
const W_WORDS = ["want", "wash", "watch", "swan", "wand"];
const W_SENT: Record<string, [string, string]> = {
  wash: ["We wash our hands.", "hands"],
  watch: ["I watch the birds.", "bird"],
  swan: ["The swan swims on the lake.", "swan"],
  wand: ["The fairy waves her wand.", "wand"],
};

/**
 * A word being read, with the machine that acts on it.
 * WIDE — machine beside the word, picture above.
 * TALL — the same three things STACKED. Side by side they overrun a 1080-wide frame, and
 *        shrinking to fit is what makes a portrait cut look like a miniature.
 */
const WordBeat: React.FC<{
  b: B; u: (n: number) => number; a: number;
  word: string; hi: string; tone?: Tone; pic?: string; seed?: number;
  machine?: React.ReactNode; flipTo?: string; flipAt?: number;
}> = ({ b, u, a, word, hi, tone = "x", pic, seed = 3, machine, flipTo, flipAt }) =>
  b.wide ? (
    <Named>
      {pic && <Pic word={pic} size={u(280)} seed={seed} />}
      <Row gap={u(40)}>
        {machine}
        <Row gap={u(22)}>
          <Word text={word} hi={hi} tone={tone} size={u(200)} at={a} flipTo={flipTo} flipAt={flipAt} />
        </Row>
      </Row>
    </Named>
  ) : (
    <Named gap={12}>
      {pic && <Pic word={pic} size={u(185)} seed={seed} />}
      {machine}
      <Row gap={u(24)}>
        <Word text={word} hi={hi} tone={tone} size={u(195)} at={a} flipTo={flipTo} flipAt={flipAt} />
      </Row>
    </Named>
  );

/** one of the six rules, as a formula built from cards — never as a sentence */
const RuleCard: React.FC<{ n: number; on: boolean; at: number; u: (n: number) => number; children?: React.ReactNode }> = ({
  n, on, at, u, children,
}) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center", gap: u(12),
    padding: `${u(16)}px ${u(22)}px`, borderRadius: u(24),
    background: on ? "rgba(255,246,232,0.10)" : "rgba(255,246,232,0.03)",
    border: `${u(4)}px solid ${on ? STAGE.gold : "rgba(245,197,66,0.25)"}`,
    opacity: on ? 1 : 0.4,
  }}>
    <Tag text={`RULE ${n}`} tone={on ? STAGE.bad : "#4A2C52"} at={at} size={u(30)} />
    <Row gap={u(10)}>{children}</Row>
  </div>
);

// ── the scene for any given line ─────────────────────────────────────────────

const Scene: React.FC<{ idx: number; k: number; s: number; b: B }> = ({ idx, k, s, b }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = at(idx);
  const said = spokenIn(P[idx], frame, fps);
  const u = (n: number) => Math.round(n * (b.wide ? 1.28 : 1.10));

  const m = (size: number) => u(Math.round(size * (b.wide ? 1 : 0.82)));
  const hat = (size = 200) =>
    HAT_AT.has(idx) ? <Hat b={b} at={a} size={m(size)} />
    : HAT_JAM.has(idx) ? <Hat b={b} at={a} jam size={m(size)} />
    : <Hat b={b} at={null} size={m(size)} />;
  const wand = (size = 190) =>
    WAND_AT.has(idx) ? <Wand at={a} size={m(size)} />
    : WAND_FIZZLE.has(idx) ? <Wand at={a} fizzle size={m(size)} />
    : <Wand at={null} size={m(size)} />;

  const REVEAL: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 3, 5: 4, 6: 5 };
  const RULE = (n: number, on: boolean, cards: React.ReactNode) => (
    <RuleCard n={n} on={on} at={at(STARTS[6] + REVEAL[n])} u={u}>{cards}</RuleCard>
  );
  const mini = (ch: string, tone: Tone = "plain") => <Card ch={ch} size={u(66)} tone={tone} />;

  switch (s) {
    // ── 1 · WELCOME ────────────────────────────────────────────────────────
    case 0:
      switch (k) {
        case 0: return <Row gap={u(56)}>{[0, 1, 2].map((i) => <Pic key={i} word="star" size={u(230)} seed={i * 3} at={a + i * 5} />)}</Row>;
        case 1: return <Row gap={u(60)}><Card ch="ng" size={u(200)} at={a} /><Card ch="nk" size={u(200)} at={a + 8} seed={1} /></Row>;
        case 2: return <Named gap={u(10)}><Row gap={u(22)}><Card ch="?" size={u(170)} tone="dim" /><Card ch="?" size={u(170)} tone="dim" seed={1} /><Card ch="ng" size={u(200)} at={a} seed={2} /></Row><Row gap={u(22)}><div style={{ width: u(166) }} /><div style={{ width: u(166) }} /><Point at={a + 5} /></Row></Named>;
        case 3: return <Row gap={u(40)}><Card ch="ng" size={u(240)} at={a} /><Link at={a + 6} size={u(66)} /><Card ch="/ng/" size={u(210)} at={a + 12} seed={1} /></Row>;
        case 4: return <Row gap={u(26)}><Card ch="ng" size={u(170)} /><Link kind="plus" size={u(76)} /><Card ch="/k/" size={u(170)} at={a} seed={1} /><Link at={a + 8} size={u(60)} /><Card ch="nk" size={u(200)} at={a + 16} seed={2} /></Row>;
        case 5: return <Row gap={u(56)}>{[0, 1, 2].map((i) => <Pic key={i} word="star" size={u(230)} seed={i * 3} at={a + i * 5} />)}</Row>;
        case 6: return <Row gap={u(26)}>{RULE_WORDS.map(([n, w]) => <NumCard key={n} n={n as number} label={w as string} size={u(140)} tone={(n as number) <= 4 ? "good" : "dim"} at={a + (n as number) * 3} seed={n as number} />)}</Row>;
        case 7:
        case 8:
        case 9:
        case 10: {
          const a7 = at(STARTS[0] + 7), a9 = at(STARTS[0] + 9), a10 = at(STARTS[0] + 10);
          const one = k >= 9, two = k >= 10;
          const SLOT = u(250);
          return (
            <><Row gap={u(70)}>
              <Card ch={one ? "x" : "?"} size={u(220)} w={SLOT} tone={one ? "x" : "dim"} at={one ? a9 : a7} from={one ? "up" : undefined} />
              <Card ch={two ? "w" : "?"} size={u(220)} w={SLOT} tone={two ? "w" : "dim"} at={two ? a10 : a7 + 6} seed={1} from={two ? "up" : undefined} />
            </Row>
              {k === 8 && <Row gap={u(70)}><Point at={a} /><div style={{ width: SLOT }} /></Row>}
              {two && wand(150)}
            </>
          );
        }
        default: return <><Row gap={u(70)}><Card ch="x" size={u(240)} tone="x" /><Card ch="w" size={u(240)} tone="w" seed={1} /></Row><Row gap={u(40)}>{hat(150)}{wand(150)}</Row></>;
      }

    // ── 2 · THE LETTER X ───────────────────────────────────────────────────
    case 1:
      switch (k) {
        case 0: return <Row gap={u(50)}>{hat(330)}<Pic word="magic" size={u(240)} at={a} /></Row>;
        case 1: {
          // "every OTHER letter makes one sound" — one example proves nothing, so here are
          // four, each with its single sound, in aligned columns. It is what makes the next
          // line ("but the letter x is different") land.
          const ONE = [["b", "/b/"], ["m", "/m/"], ["s", "/s/"], ["t", "/t/"]];
          const SLOT = u(200);
          return (
            <Named gap={u(8)}>
              <Row gap={u(26)}>{ONE.map(([c], i) => <Card key={c} ch={c} size={u(165)} w={SLOT} at={a + i * 4} seed={i} />)}</Row>
              <Row gap={u(26)}>{ONE.map(([c], i) => (
                <div key={c} style={{ width: SLOT, display: "flex", justifyContent: "center" }}>
                  <Point at={a + 6 + i * 4} size={u(52)} />
                </div>
              ))}</Row>
              <Row gap={u(26)}>{ONE.map(([, snd], i) => <Card key={snd} ch={snd} size={u(155)} w={SLOT} at={a + 10 + i * 4} seed={i + 4} />)}</Row>
            </Named>
          );
        }
        case 2: return <Card ch="x" size={u(300)} tone="x" at={a} hot />;
        case 3: return <Row gap={u(30)}><Card ch="x" size={u(200)} tone="x" /><Link at={a} size={u(64)} /><Card ch="/k/" size={u(180)} at={a + 6} seed={1} /><Card ch="/s/" size={u(180)} at={a + 12} seed={2} /></Row>;
        case 4: return <Ear at={a} size={u(320)} />;
        case 5: return <WordBeat b={b} u={u} a={a} word="fox" hi="x" pic="fox" machine={hat()} />;
        case 6: return <WordBeat b={b} u={u} a={a} word="fox" hi="x" pic="fox" machine={hat()} />;
        case 7: return <Named gap={u(10)}><Row gap={u(22)}><Word text="fox" hi="x" size={u(210)} dim /></Row><Row gap={u(22)}><div style={{ width: u(206) }} /><div style={{ width: u(206) }} /><Point at={a} /></Row></Named>;
        case 8: return <WordBeat b={b} u={u} a={a} word="fox" hi="x" pic="fox" machine={hat()} />;
        case 9: return <Row gap={u(46)}><Ear at={a} size={u(230)} /><Card ch="?" size={u(200)} tone="dim" at={a + 6} /></Row>;
        case 10: return <Row gap={u(50)}>{hat(340)}<Card ch="?" size={u(200)} tone="dim" at={a} /><Card ch="?" size={u(200)} tone="dim" at={a + 6} seed={1} /></Row>;
        case 11: return <Row gap={u(60)}><Point at={a} /><Card ch="?" size={u(200)} tone="dim" /><Card ch="?" size={u(200)} tone="dim" seed={1} /></Row>;
        case 12:
        case 13:
        case 14:
        case 15: {
          const a12 = at(STARTS[1] + 12), a13 = at(STARTS[1] + 13);
          const two = k >= 13;
          const SLOT = u(230);
          return (
            <Row gap={k >= 15 ? u(10) : u(56)}>
              <Card ch="/k/" size={u(210)} w={SLOT} tone="x" at={a12} hot={k === 15 && said.saying("/k/")} />
              <Card ch={two ? "/s/" : "?"} size={u(210)} w={SLOT} tone={two ? "x" : "dim"} at={two ? a13 : a12 + 8} seed={1} from={two ? "right" : undefined} />
            </Row>
          );
        }
        case 16: return <Row gap={u(6)}><Card ch="/k/" size={u(210)} tone="x" /><Card ch="/s/" size={u(210)} tone="x" seed={1} /></Row>;
        case 17: return <Row gap={u(50)}><Card ch="/ks/" size={u(280)} tone="x" at={a} hot />{hat(200)}</Row>;
        case 18: return <Row gap={u(40)}><Card ch="x" size={u(230)} tone="x" /><Link at={a} size={u(66)} /><Card ch="/ks/" size={u(250)} tone="x" at={a + 6} seed={1} /></Row>;
        default: return <Plate at={a} pad={u(34)}><Card ch="x" size={u(170)} tone="x" /><Link kind="equals" size={u(76)} tone={STAGE.ink} /><Card ch="/k/" size={u(150)} /><Link kind="plus" size={u(70)} tone={STAGE.ink} /><Card ch="/s/" size={u(150)} seed={1} /></Plate>;
      }

    // ── 3 · WORDS WITH X ───────────────────────────────────────────────────
    case 2: {
      if (k >= 1 && k <= 6) {
        const w = X_WORDS[k - 1];
        const [sent, spic] = X_SENT[w];
        return (
          <>
            <Row gap={u(22)}><Word text={w} hi="x" size={u(170)} at={a} /></Row>
            <Sentence text={sent} target={w} pic={spic} at={a + 8} size={u(56)} picSize={u(150)} />
          </>
        );
      }
      switch (k) {
        case 0: return <><Row gap={u(23)}>{X_WORDS.map((w, i) => <Card key={w} ch="x" size={u(120)} tone="x" at={a + i * 5} seed={i} />)}</Row>{hat(180)}</>;
        case 7: return <div style={{ display: "flex", flexDirection: "column", gap: u(10), alignItems: "center" }}>{X_WORDS.map((w, i) => <Row key={w} gap={u(10)}><Word text={w} hi="x" size={u(70)} at={a + i * 4} /></Row>)}</div>;
        case 8: return <div style={{ display: "flex", flexDirection: "column", gap: u(10), alignItems: "center" }}>{X_WORDS.map((w, i) => <Row key={w} gap={u(10)}><Word text={w} hi="x" size={u(70)} dim /></Row>)}</div>;
        case 9: return <><Row gap={u(26)}><Card ch="x" size={u(180)} tone="x" hot /><Link kind="equals" size={u(70)} tone={STAGE.gold} /><Card ch="/k/" size={u(160)} at={a} seed={1} /><Link kind="plus" size={u(64)} tone={STAGE.gold} /><Card ch="/s/" size={u(160)} at={a + 6} seed={2} /></Row><WordList words={X_WORDS.slice(0, 3)} hi="x" size={u(92)} dim /></>;
        case 10: return <WordBeat b={b} u={u} a={a} word="fox" hi="x" pic="fox" machine={hat(170)} />;
        case 11: return <WordBeat b={b} u={u} a={a} word="box" hi="x" pic="box" machine={hat(170)} />;
        case 12: return <WordBeat b={b} u={u} a={a} word="six" hi="x" pic="six" machine={hat(170)} />;
        default: return <Row gap={u(56)}>{[0, 1, 2].map((i) => <Pic key={i} word="star" size={u(230)} seed={i * 3} at={a + i * 5} />)}</Row>;
      }
    }

    // ── 4 · NEVER DOUBLE THE X ─────────────────────────────────────────────
    case 3:
      switch (k) {
        case 0: return <Pic word="idea" size={u(260)} at={a} />;
        case 1: return <Row gap={u(24)}>{["ff", "ll", "ss", "zz"].map((d, i) => <Card key={d} ch={d} size={u(160)} tone="x" at={a + i * 4} seed={i} />)}</Row>;
        case 2: return <Row gap={u(24)}>{["ff", "ll", "ss", "zz"].map((d, i) => <Card key={d} ch={d} size={u(160)} tone={i < 2 ? "x" : "dim"} hot={i < 2} seed={i} />)}</Row>;
        case 3: return <Row gap={u(24)}>{["ff", "ll", "ss", "zz"].map((d, i) => <Card key={d} ch={d} size={u(160)} tone={i >= 2 ? "x" : "dim"} hot={i >= 2} seed={i} />)}</Row>;
        case 4: return <Row gap={u(60)}><Row gap={u(6)}><Card ch="x" size={u(210)} tone="x" /><Card ch="x" size={u(210)} tone="x" seed={1} /></Row><Mark kind="no" at={a} size={u(140)} /></Row>;
        case 5: return b.wide
          ? <><Row gap={u(40)}>{hat(200)}<Row gap={u(16)}><Word text="foxx" hi="x" size={u(160)} /></Row></Row><Mark kind="no" at={a + 10} size={u(140)} /></>
          : <Named gap={u(12)}>{hat(200)}<Row gap={u(14)}><Word text="foxx" hi="x" size={u(150)} /></Row><Mark kind="no" at={a + 10} size={u(130)} /></Named>;
        case 6: return <><Row gap={u(60)}><Row gap={u(16)}><Word text="fox" hi="x" size={u(190)} /></Row><Mark kind="yes" at={a} size={u(140)} /></Row><Pic word="fox" size={u(180)} /></>;
        case 7: return <Row gap={u(46)}><Ear at={a} size={u(230)} /><Card ch="/ks/" size={u(230)} tone="x" at={a + 6} /></Row>;
        case 8: return <Row gap={u(60)}><Card ch="x" size={u(240)} tone="x" at={a} /><Mark kind="yes" at={a + 6} size={u(140)} /></Row>;
        default: return <Row gap={u(60)}><Row gap={u(6)}><Card ch="x" size={u(200)} tone="dim" /><Card ch="x" size={u(200)} tone="dim" seed={1} /></Row><Mark kind="no" at={a} size={u(140)} /></Row>;
      }

    // ── 5 · THE TRICKY LETTER W ────────────────────────────────────────────
    case 4: {
      if (k >= 15 && k <= 18) {
        const w = W_WORDS[k - 14];           // wash, watch, swan, wand
        const [sent, spic] = W_SENT[w];
        return (
          <>
            <Row gap={u(22)}><Word text={w} hi="a" tone="vowel" size={u(160)} at={a} flipTo="o" flipAt={a + 10} /></Row>
            <Sentence text={sent} target={w} pic={spic} at={a + 14} size={u(54)} picSize={u(145)} />
          </>
        );
      }
      switch (k) {
        case 0: return <Row gap={u(50)}>{wand(300)}<Card ch="w" size={u(250)} tone="w" at={a} /><Pic word="magic" size={u(220)} at={a + 8} /></Row>;
        case 1: return <Card ch="w" size={u(300)} tone="w" at={a} hot />;
        case 2: return <Row gap={u(50)}>{wand(290)}<Card ch="w" size={u(280)} tone="w" /></Row>;
        case 3: return <Row gap={u(50)}>{wand(290)}<Card ch="?" size={u(280)} tone="dim" at={a} /></Row>;
        case 4: return <Row gap={u(40)}><Card ch="a" size={u(230)} tone="vowel" at={a} /><Link at={a + 6} size={u(66)} /><Card ch="/a/" size={u(210)} at={a + 12} seed={1} /></Row>;
        case 5: return <WordBeat b={b} u={u} a={a} word="cat" hi="a" tone="vowel" pic="cat" />;
        case 6: return <Row gap={u(46)}><Ear at={a} size={u(220)} /><Row gap={u(22)}><Word text="cat" hi="a" tone="vowel" size={u(180)} /></Row></Row>;
        case 7: return <Row gap={u(22)}><Card ch="w" size={u(210)} tone="w" at={a} from="left" /><Card ch="a" size={u(210)} tone="vowel" /><Card ch="?" size={u(210)} tone="dim" seed={1} /></Row>;
        case 8: return <WordBeat b={b} u={u} a={a} word="want" hi="a" tone="vowel" pic="want" machine={wand(180)} flipTo="o" flipAt={a + 16} />;
        case 9: return <WordBeat b={b} u={u} a={a} word="want" hi="a" tone="vowel" pic="want" machine={wand(180)} flipTo="o" flipAt={a} />;
        case 10: return <Ear at={a} size={u(320)} />;
        case 11: return <Row gap={u(60)}><Card ch="a" size={u(220)} tone="vowel" /><Link at={a} size={u(60)} /><Card ch="/a/" size={u(200)} tone="dim" seed={1} /><Mark kind="no" at={a + 6} size={u(130)} /></Row>;
        case 12: return <Row gap={u(60)}><Card ch="a" size={u(220)} tone="vowel" /><Link at={a} size={u(60)} /><Card ch="/o/" size={u(220)} tone="w" at={a + 4} seed={1} /><Mark kind="yes" at={a + 10} size={u(130)} /></Row>;
        case 13: return <Row gap={u(26)}><Card ch="w" size={u(190)} tone="w" /><Card ch="a" size={u(190)} tone="vowel" /><Link at={a} size={u(62)} /><Card ch="o" size={u(210)} tone="w" at={a + 6} seed={1} /></Row>;
        case 14: return <><Ear at={a} size={u(210)} /><Row gap={u(20)}>{W_WORDS.map((w, i) => <Card key={w} ch="a" size={u(110)} tone="vowel" at={a + i * 4} seed={i} />)}</Row></>;
        case 19: return <Row gap={u(46)}><Ear at={a} size={u(220)} /><Row gap={u(20)}>{["a", "a", "a", "a"].map((c, i) => <Card key={i} ch={c} size={u(140)} tone="vowel" at={a + i * 4} seed={i} />)}</Row></Row>;
        case 20: return <WordBeat b={b} u={u} a={a} word="want" hi="a" tone="vowel" pic="want" machine={wand(180)} flipTo="o" flipAt={a} />;
        case 21: return <div style={{ display: "flex", flexDirection: "column", gap: u(14), alignItems: "center" }}>{["wash", "watch", "swan"].map((w, i) => <Row key={w} gap={u(10)}><Word text={w} hi="a" tone="w" size={u(110)} at={a + i * 5} flipTo="o" flipAt={a + 6 + i * 5} /></Row>)}</div>;
        case 22: return <Row gap={u(50)}><Card ch="a" size={u(220)} tone="vowel" /><Point at={a} /><Card ch="/o/" size={u(240)} tone="w" at={a} seed={1} hot /></Row>;
        default: return <Row gap={u(50)}>{wand(230)}<Card ch="w" size={u(250)} tone="w" /><Pic word="magic" size={u(180)} at={a} /></Row>;
      }
    }

    // ── 6 · …BUT NOT EVERY TIME ────────────────────────────────────────────
    case 5:
      switch (k) {
        case 0: return <Pic word="idea" size={u(260)} at={a} />;
        case 1: return <Row gap={u(60)}><Card ch="w" size={u(230)} tone="w" /><Mark kind="no" at={a} size={u(150)} /></Row>;
        case 2: return <><Row gap={u(40)}>{wand(190)}<Row gap={u(22)}><Word text="wag" hi="a" tone="vowel" size={u(180)} at={a} /></Row></Row><Sentence text="The dog can wag his tail." target="wag" pic="wag" at={a + 16} size={u(52)} picSize={u(140)} /></>;
        case 3: return <Row gap={u(60)}><Row gap={u(22)}><Word text="wag" hi="a" tone="vowel" size={u(190)} /></Row><Card ch="/a/" size={u(200)} at={a} seed={1} /><Mark kind="yes" at={a + 6} size={u(130)} /></Row>;
        case 4: return <><Row gap={u(50)}><Row gap={u(16)}>{["want", "wash", "swan"].map((w, i) => <Card key={w} ch={w} size={u(110)} tone="w" seed={i} />)}</Row><Mark kind="yes" at={a} size={u(120)} /></Row><Row gap={u(50)}><Card ch="wag" size={u(130)} tone="vowel" at={a + 6} /><Mark kind="no" at={a + 10} size={u(120)} /></Row></>;
        case 5:
        case 6: {
          const a5 = at(STARTS[5] + 5);
          return (
            <><Tag text="A SMALL FAMILY" tone={STAGE.w} at={a5} size={u(48)} />
              <Row gap={u(18)}>{W_WORDS.map((w, i) => <Card key={w} ch={w} size={u(120)} tone="w" at={a5 + 6 + i * 5} seed={i} />)}</Row>
            </>
          );
        }
        case 7: return <Row gap={u(50)}>{wand(280)}<Pic word="idea" size={u(260)} at={a} /></Row>;
        case 8: return <Row gap={u(26)}><Card ch="w" size={u(230)} tone="w" at={a} /><Card ch="a" size={u(230)} tone="vowel" at={a + 6} seed={1} /></Row>;
        case 9: return <TryLoop step={0} at={a} scale={b.wide ? 1 : 0.66} />;
        case 10: return <TryLoop step={1} at={0} scale={b.wide ? 1 : 0.66} />;
        case 11: return <><TryLoop step={1} at={0} scale={b.wide ? 1 : 0.66} /><Thinking at={a} size={u(34)} /></>;
        case 12: return <TryLoop step={2} at={0} scale={b.wide ? 1 : 0.66} />;
        case 13: return <TryLoop step={3} at={0} scale={b.wide ? 1 : 0.66} />;
        case 14: return <TryLoop step={3} at={0} scale={b.wide ? 1 : 0.66} />;
        default: return <><TryLoop step={3} at={0} scale={b.wide ? 1 : 0.66} /><Row gap={u(40)}>{[0, 1, 2].map((i) => <Pic key={i} word="star" size={u(150)} seed={i * 3} at={a + i * 4} />)}</Row></>;
      }

    // ── 7 · ALL SIX RULES ──────────────────────────────────────────────────
    case 6: {
      const on = (n: number) => (n === 1 ? k >= 1 : n === 2 ? k >= 2 : n <= 4 ? k >= 3 : n === 5 ? k >= 4 : k >= 5);
      const CARDS = [
        RULE(1, on(1), <>{mini("i", "vowel")}{mini("ff", "x")}</>),
        RULE(2, on(2), <>{mini("c")}{mini("k")}{mini("ck", "x")}</>),
        RULE(3, on(3), <>{mini("?", "dim")}{mini("ng", "x")}</>),
        RULE(4, on(4), <>{mini("ng")}{mini("+")}{mini("k", "x")}</>),
        RULE(5, on(5), <>{mini("x", "x")}{mini("=")}{mini("/k/")}{mini("/s/")}</>),
        RULE(6, on(6), <>{mini("w", "w")}{mini("a", "vowel")}{mini("→")}{mini("/o/", "w")}</>),
      ];
      // three across fits 1516px of wide-cut stage; a 1080 frame takes two
      const per = b.wide ? 3 : 2;
      const rows = Array.from({ length: Math.ceil(6 / per) }, (_, r) => CARDS.slice(r * per, r * per + per));
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: u(16), alignItems: "center" }}>
          {rows.map((row, r) => <Row key={r} gap={u(18)}>{row.map((c, i) => <React.Fragment key={i}>{c}</React.Fragment>)}</Row>)}
        </div>
      );
    }

    // ── 8 · CLOSE ──────────────────────────────────────────────────────────
    default:
      switch (k) {
        case 0: return <Row gap={u(56)}>{[0, 1, 2].map((i) => <Pic key={i} word="star" size={u(230)} seed={i * 3} at={a + i * 5} />)}</Row>;
        case 1: return <Row gap={u(26)}>{RULE_WORDS.map(([n, w]) => <NumCard key={n} n={n as number} label={w as string} size={u(140)} at={a + (n as number) * 3} seed={n as number} />)}</Row>;
        case 2: return <Row gap={u(56)}>{[0, 1, 2].map((i) => <Pic key={i} word="star" size={u(230)} seed={i * 3} at={a + i * 5} />)}</Row>;
        case 3: return <><Row gap={u(24)}>{RULE_WORDS.map(([n, w]) => <NumCard key={n} n={n as number} label={w as string} size={u(120)} seed={n as number} />)}</Row><Mark kind="yes" at={a} size={u(150)} /></>;
        case 4: return <Tag text="NEXT · LEVEL 6" tone={STAGE.bad} at={a} size={u(66)} />;
        case 5: return <Row gap={u(50)}><Named gap={u(10)}><Tag text="LEVEL" tone={STAGE.curtainLite} at={a} size={u(52)} /><Card ch="6" size={u(280)} tone="x" at={a + 4} hot /></Named><Pic word="magic" size={u(210)} at={a + 10} /></Row>;
        case 6: return <Row gap={u(50)}><Named gap={u(10)}><Tag text="LEVEL" tone={STAGE.curtainLite} size={u(52)} /><Card ch="6" size={u(250)} tone="x" /></Named><Pic word="magic" size={u(200)} at={a} /><Pic word="star" size={u(190)} at={a + 6} seed={2} /></Row>;
        case 7:
        case 8: return <Line text={"\u{1F44D}"} size={u(b.wide ? 260 : 330)} at={at(STARTS[7] + 7)} />;
        default: return <Row gap={u(56)}><Named gap={u(12)}><Wiggle amp={11} speed={8}><Line text={"\u{1F44D}"} size={u(140)} at={a} /></Wiggle><Tag text="LIKE" tone={STAGE.curtainLite} at={a} size={u(60)} /></Named><Named gap={u(12)}><Wiggle amp={14} speed={5} phase={1.4}><Line text={"\u{1F514}"} size={u(140)} at={a + 8} /></Wiggle><Tag text="SUBSCRIBE" tone={STAGE.bad} at={a + 8} size={u(60)} /></Named></Row>;
      }
  }
};

// ── the reel ─────────────────────────────────────────────────────────────────

export const L5RulesP3Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const b = bands(width, height);

  const idx = BEAT_OF[phraseAt(frame)];
  const s = sectionOf(idx);
  const k = idx - STARTS[s];
  const storeFrom = at(STORE_FROM_IDX);

  const mood: TuxMood =
    TUX_BOW.has(idx) ? "bow" : TUX_DUCK.has(idx) ? "duck" : TUX_SHRUG.has(idx) ? "shrug"
    : TUX_WAVE.has(idx) ? "wave" : TUX_PRESENT.has(idx) ? "present" : "idle";

  return (
    <AbsoluteFill>
      <StageWorld />
      {frame < storeFrom && <Tux b={b} mood={mood} />}

      <Sequence from={0} durationInFrames={f(AUDIO_SEC) + 8}>
        <Audio src={staticFile("audio/l5_rules_p3_16x9/l5_rules_p3.mp3")} />
      </Sequence>

      {/* a soft bed, far under the teacher */}
      <Audio
        src={staticFile("music_bed.mp3")}
        loop
        volume={(fr) =>
          interpolate(fr, [0, MUSIC_FADE_IN, L5_P3_DURATION - MUSIC_FADE_OUT, L5_P3_DURATION], [0, MUSIC_BED, MUSIC_BED, 0], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          })
        }
      />

      {SFX.map((c, i) => (
        <Sequence key={`${c.file}-${c.i}-${i}`} from={c.frame} durationInFrames={45}>
          <Audio src={staticFile(`sfx/${c.file}.mp3`)} volume={c.vol} />
        </Sequence>
      ))}

      {BANNERS[s] !== "" && frame < storeFrom && <Banner b={b} text={BANNERS[s]} />}

      {frame < storeFrom && (
        <Content b={b}>
          <Scene idx={idx} k={k} s={s} b={b} />
        </Content>
      )}

      {[45, 92, 103, 105].map((i) => (
        <Fixed key={i} b={b}>
          <Confetti
            frame={frame} fps={fps} burstFrame={at(i) + 6}
            origin={{ x: (b.contentL + b.contentR) / 2, y: b.contentTop + 60 }}
            colors={[STAGE.gold, STAGE.good, STAGE.bad, STAGE.w]}
          />
        </Fixed>
      ))}

      {frame < storeFrom && <Captions track={TRACK} maxWidth={b.wide ? 1180 : 900} fontSize={b.wide ? 40 : 36} />}
      {frame < storeFrom && <Watermark corner="tr" widthFrac={b.wide ? 0.085 : 0.110} pad={b.wide ? 54 : 78} />}

      {/* the CTA is in the teacher's own take, so the card is silent */}
      <Sequence from={storeFrom}>
        <AbsoluteFill style={{ background: "rgba(15, 5, 18, 0.62)" }} />
        <StoreOutro silent total={L5_P3_DURATION - storeFrom} ctaBg={STAGE.curtainLite} titleColor="#FFFFFF" />
      </Sequence>
    </AbsoluteFill>
  );
};
