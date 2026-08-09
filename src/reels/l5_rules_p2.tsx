import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/l5_rules_p2.captions.json";
import { Captions } from "../components/Captions";
import { makeTrack, TPhrase } from "../lib/timing";
import { spokenIn } from "../lib/spoken";
import { Watermark } from "../components/Watermark";
import { Confetti } from "../components/Confetti";
import { StoreOutro, STORE_OUTRO_F } from "../components/StoreOutro";
import {
  B, Banner, Beat, Bell, Card, Content, Doors, Ear, Fixed, Flow, Line, Mark, Mouth, Pic, Pip, PipMood,
  Link, Plate, Point, Row, Sentence, Tag, Thinking, TOWER, TowerWorld, Wave, Word, WordRow, bands,
} from "../components/BellTower";

// ── L5 · SPELLING RULES — PART 2 (‑ng and ‑nk) · 16:9 ────────────────────────
//
// 6:23, 161 narration lines, one visual change EVERY line.
//
// The world is The Bell Tower, and it was chosen because it MAKES THE LESSON VISIBLE:
// `ng` rings and the sound carries; `nk` rings and a wooden stopper cuts it dead. That
// stopper is the /k/. A child sees the difference in the first ten seconds, before the
// teacher has explained anything.
//
// Three laws carried over from Part 1, each of which cost a render when broken:
//   1. Every line gets its own visual, and no line may show an empty stage.
//   2. Anything the narration NAMES lights when it is SAID — timings come from the
//      alignment (lib/spoken), never from hand-counted frames.
//   3. Nothing but Content may enter the content box. The tower, Pip, the banner and the
//      captions each have their own band, and a ringing bell reserves its own rings.

const FPS = 30;
const P = phrasesJson as unknown as TPhrase[];
const TOTAL = P[P.length - 1].end;
const f = (s: number) => Math.round(s * FPS);
const at = (i: number) => f(P[i].start);

// captions clear 1.0s after a line, so a held beat is never captioned stale
const TRACK = makeTrack(P, TOTAL, FPS, 1.0);

/** first phrase index of each section, found by its opening line */
const SECTION_FIRSTS = [
  "Welcome back",                          // 0 · welcome
  "I want you to listen",                  // 1 · the sound /ng/
  "Now lets",                              // 2 · words that end in ng
  "Now were going to change one letter",   // 3 · the sound /ngk/
  "Now lets read some NK words",           // 4 · words that end in nk
  "Now heres the tricky part",             // 5 · ng or nk?
  "Heres an easy way to remember",         // 6 · an easy way to remember
  "Lets remember",                         // 7 · let's remember
  "Fantastic work today",                  // 8 · close
];
const norm = (s: string) => s.trim().replace(/['’]/g, "").toLowerCase();
const STARTS = SECTION_FIRSTS.map((first) => {
  const i = P.findIndex((p) => norm(p.text).startsWith(norm(first)));
  // a silent -1 here would put every later section one off and is invisible in a render
  if (i < 0) throw new Error(`l5_p2: section start not found — "${first}"`);
  return i;
});

const BANNERS = [
  "LEVEL 5 · SPELLING RULES",
  "THE SOUND  /ng/",
  "WORDS THAT END IN  ng",
  "THE SOUND  /ngk/",
  "WORDS THAT END IN  nk",
  "ng   OR   nk  ?",
  "AN EASY WAY TO REMEMBER",
  "LET'S REMEMBER",
  "",
];

const phraseAt = (frame: number): number => {
  let idx = 0;
  for (let i = 0; i < P.length; i++) {
    if (f(P[i].start) <= frame) idx = i;
    else break;
  }
  return idx;
};

/**
 * Which BEAT (visual) a phrase belongs to.
 *
 * Whisper splits one spoken sentence into two chunks whenever the teacher pauses for
 * breath — "Now" + "it's your turn." land 0.00s apart, "But when" + "they sit together…"
 * 0.20s apart. Giving each chunk its own visual makes the screen flash.
 *
 * So a beat must last at least MIN_BEAT. A chunk shorter than that is not a beat of its
 * own: the previous visual simply holds through it, which is what the ear hears anyway —
 * one sentence, one picture. Captions are unaffected and still follow every chunk.
 */
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
const sectionOf = (idx: number): number => {
  let s = 0;
  for (let i = 0; i < STARTS.length; i++) if (STARTS[i] <= idx) s = i;
  return s;
};

// which lines ring the bell, and which lines stop it dead
const RING_NG = new Set([11, 15, 17, 21, 31, 36, 40, 42, 44, 46, 48, 71, 101, 103, 109, 112, 118, 122, 142]);
const RING_NK = new Set([12, 63, 65, 69, 74, 78, 80, 82, 84, 86, 102, 104, 110, 113, 124, 127, 145]);

// Pip acts the lesson out rather than watching it
const PIP_LISTEN = new Set([14, 19, 62, 66, 100, 117, 119, 123, 135]);
const PIP_CHEER = new Set([0, 7, 37, 60, 94, 128, 148, 155, 156]);
const PIP_BUMP = new Set([68, 74, 76, 99, 125]);

const STORE_FROM_IDX = P.findIndex((p) => norm(p.text).startsWith("and practise"));

export const L5_P2_DURATION = Math.max(f(TOTAL) + 40, at(STORE_FROM_IDX) + STORE_OUTRO_F);

// ── sound ────────────────────────────────────────────────────────────────────
//
// An sfx is only allowed in a GAP. Laying one over a word makes the teacher hard to hear,
// which is the one thing a lesson cannot afford.
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
RING_NG.forEach((i) => cue(i, "twinkle", 0.10));   // the sound that carries
RING_NK.forEach((i) => cue(i, "drop", 0.11));      // the stopper landing
[37, 60, 94, 128, 148].forEach((i) => cue(i, "sparkle", 0.13));
[19, 32, 67, 119].forEach((i) => cue(i, "question", 0.10));
[107, 121, 125, 126, 137].forEach((i) => cue(i, "correct", 0.10));
[95, 114].forEach((i) => cue(i, "riser", 0.10));

const seen = new Set<number>();
const SFX = CUES
  .filter((c) => (seen.has(c.i) ? false : (seen.add(c.i), true)))
  .map((c) => ({ ...c, frame: gapFrame(c.i) }))
  .filter((c): c is { i: number; file: string; vol: number; frame: number } => c.frame !== null);

// ── the five ng words and the five nk words, as stacked lists ────────────────

const NG_WORDS = ["sing", "ring", "king", "long", "sung"];
const NK_WORDS = ["bank", "pink", "sink", "junk", "thank"];
const LIST_PICS: Record<string, string> = {
  sing: "sing", ring: "ring", king: "king", long: "snake", sung: "sung",
  bank: "bank", pink: "flower", sink: "sink", junk: "junk", thank: "thank",
};

const Stack: React.FC<{ words: string[]; end: string; from: number; vowel?: boolean; size?: number }> = ({
  words, end, from, vowel = false, size = 106,
}) => {
  // one slot per letter of the LONGEST head in this list — a fixed 3 reserved an empty
  // column on the left of every 2-letter word and pushed the stack off-centre
  const slots = Math.max(...words.map((w) => w.length - end.length));
  return (
  <div style={{ display: "flex", flexDirection: "column", gap: 15, alignItems: "center" }}>
    {words.map((w, i) => (
      <WordRow key={w} text={w} end={end} size={size} at={from + i * 4} vowel={vowel} headSlots={slots} pic={LIST_PICS[w]} />
    ))}
  </div>
  );
};

/** a picture and the word it names, grouped tightly so they read as one object rather
 *  than as two unrelated things separated by the full content gap */
const Named: React.FC<{ gap?: number; children: React.ReactNode }> = ({ gap = 4, children }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap }}>{children}</div>
);

/**
 * A word being read: its picture, the bell that rings (or is stopped) on it, and the word
 * itself with the ending picked out.
 *
 * WIDE  — bell beside the word, picture above. There is room for all three on two rows.
 * TALL  — the same three things STACKED. Side by side in a 1080-wide frame the row runs
 *         to ~1200px and gets cut, and shrinking it to fit is what made Part 1's portrait
 *         cut look like a miniature of the wide one. Stacked, the letters get BIGGER
 *         in portrait than they are in the wide cut, which is the right answer for a
 *         phone screen.
 */
const WordBeat: React.FC<{
  b: B; u: (n: number) => number; a: number;
  word: string; end: string; pic?: string; seed?: number;
  bellNode: React.ReactNode; at?: number;
}> = ({ b, u, a, word, end, pic, seed = 3, bellNode }) =>
  b.wide ? (
    <Named>
      {pic && <Pic word={pic} size={u(300)} seed={seed} />}
      <Row gap={u(40)}>
        {bellNode}
        <Row gap={u(22)}><Word text={word} end={end} size={u(200)} at={a} /></Row>
      </Row>
    </Named>
  ) : (
    <Named gap={14}>
      {pic && <Pic word={pic} size={u(220)} seed={seed} />}
      {bellNode}
      <Row gap={u(24)}><Word text={word} end={end} size={u(215)} at={a} /></Row>
    </Named>
  );

// ── the scene for any given line ─────────────────────────────────────────────

const Scene: React.FC<{ idx: number; k: number; s: number; b: B }> = ({ idx, k, s, b }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = at(idx);
  const said = spokenIn(P[idx], frame, fps);
  // 4:5 is not the wide cut shrunk — the box is a different shape, so every dimension
  // inside a scene is expressed against the aspect, and the word beats stack instead of
  // running side by side (see WordBeat).
  const u = (n: number) => Math.round(n * (b.wide ? 1 : 0.88));
  // a hero bell rings from the moment its line starts
  const ring = RING_NG.has(idx) ? a : null;
  const stop = RING_NK.has(idx) ? a : null;
  const bell = (size = 200) =>
    ring !== null ? <Bell b={b} inline ringAt={ring} size={u(size)} />
    : stop !== null ? <Bell b={b} inline ringAt={stop} stopped size={u(size)} />
    : null;

  switch (s) {
    // ── 1 · WELCOME ────────────────────────────────────────────────────────
    case 0:
      switch (k) {
        case 0: return <><Line text={"Welcome\nback!"} size={u(135)} at={a} /><Pic word="star" size={u(156)} /></>;
        case 1: return <><Tag text="LAST TIME · PART 1" at={a} /><Row gap={u(22)}>{["ff", "ll", "ss", "zz"].map((d, i) => <Card key={d} ch={d} size={u(150)} tone="ring" at={a + i * 4} seed={i} />)}</Row></>;
        case 2: return <><Row gap={u(60)}><Card ch="1" size={u(190)} tone="ring" at={a} /><Card ch="2" size={u(190)} tone="stop" at={a + 8} seed={1} /></Row><Row gap={u(60)}><Tag text="RULE 1" tone={TOWER.ring} at={a} size={u(54)} /><Tag text="RULE 2" tone={TOWER.stop} at={a + 8} size={u(54)} /></Row></>;
        case 3: return <><Tag text="THE FLOSS RULE" tone={TOWER.ring} at={a} /><Row><Card ch="b" size={u(156)} at={a} /><Card ch="u" size={u(156)} at={a + 2} seed={1} /><Card ch="z" size={u(156)} tone="ring" at={a + 4} seed={2} /><Card ch="z" size={u(156)} tone="ring" at={a + 6} seed={3} /></Row></>;
        case 4: return <><Row><Card ch="b" size={u(156)} tone="dim" /><Card ch="u" size={u(156)} tone="dim" seed={1} /><Card ch="z" size={u(156)} tone="ring" seed={2} hot /><Card ch="z" size={u(156)} tone="ring" seed={3} hot /></Row></>;
        case 5:
        case 6: {
          // one stage, held across both lines — the row never re-lays-out, the two empty
          // slots simply fill in. A fresh frame per caption is what read as "empty, empty".
          const a5 = at(STARTS[0] + 5), a6 = at(STARTS[0] + 6), two = k >= 6;
          const SLOT = 210;
          return (
            <><Tag text="THE C · K · CK RULE" tone={TOWER.stop} at={a5} />
              <Row gap={u(30)}>
                <Card ch="c" size={u(182)} w={SLOT} at={a5} hot={said.saying("C")} />
                <Card ch={two ? "k" : "?"} size={u(182)} w={SLOT} tone={two ? "plain" : "dim"}
                  at={two ? a6 : a5 + 5} seed={1} hot={said.saying("k")} from={two ? "right" : undefined} />
                <Card ch={two ? "ck" : "?"} size={u(182)} w={SLOT} tone={two ? "plain" : "dim"}
                  at={two ? a6 + 7 : a5 + 10} seed={2} hot={said.saying("c-k")} from={two ? "right" : undefined} />
              </Row>
              {two && <Line text="/k/" size={u(81)} at={a6 + 14} color={TOWER.stop} />}
            </>
          );
        }
        case 7: return <Row gap={u(56)}>{[0, 1, 2].map((i) => <Pic key={i} word="star" size={u(250)} seed={i * 3} at={a + i * 5} />)}</Row>;
        case 8: return <><Pic word="idea" size={u(210)} /><Tag text="TODAY" at={a} /><Line text={"something\nNEW"} size={u(112)} at={a + 4} color={TOWER.stop} /></>;
        case 9: return <Row gap={u(80)}><Row gap={u(14)}><Card ch="?" size={u(156)} tone="dim" at={a} /><Card ch="?" size={u(156)} tone="dim" at={a + 3} seed={1} /></Row><Row gap={u(14)}><Card ch="?" size={u(156)} tone="dim" at={a + 8} seed={2} /><Card ch="?" size={u(156)} tone="dim" at={a + 11} seed={3} /></Row></Row>;
        case 10: return <Named gap={u(10)}><Row gap={u(21)}><Card ch="—" size={u(130)} tone="dim" /><Card ch="—" size={u(130)} tone="dim" seed={1} /><Card ch="?" size={u(169)} tone="ring" at={a} seed={2} hot /></Row><Row gap={u(21)}><div style={{ width: u(130) }} /><div style={{ width: u(130) }} /><Point at={a + 4} /></Row></Named>;
        case 11:
        case 12: {
          const a11 = at(STARTS[0] + 11), a12 = at(STARTS[0] + 12), both = k >= 12;
          const SLOT = 280;
          return (
            <Row gap={u(50)}>{bell(200)}
              <Card ch="ng" size={u(240)} w={SLOT} tone="ring" at={a11} />
              <Card ch={both ? "nk" : "?"} size={u(240)} w={SLOT} tone={both ? "stop" : "dim"}
                at={both ? a12 : a11 + 8} seed={1} from={both ? "right" : undefined} />
            </Row>
          );
        }
        default: return <><Row gap={u(52)}><Card ch="ng" size={u(195)} tone="ring" /><Card ch="nk" size={u(195)} tone="stop" seed={2} /></Row><Tag text="LET'S BEGIN!" at={a} size={u(60)} /></>;
      }

    // ── 2 · THE SOUND /ng/ ─────────────────────────────────────────────────
    case 1:
      switch (k) {
        case 0: return <Row gap={u(44)}><Ear at={a} size={u(195)} /><Link at={a} size={u(62)} /><Card ch="?" size={u(195)} tone="dim" at={a + 6} /></Row>;
        case 1: return <Named><Pic word="sing" size={u(300)} seed={4} /><WordBeat b={b} u={u} a={a} word="sing" end="ng" bellNode={bell(200)} at={a} /></Named>;
        case 2: return <><Tag text="SAY IT WITH ME" at={a} /><Row><Word text="sing" end="ng" size={u(166)} /></Row></>;
        case 3: return <WordBeat b={b} u={u} a={a} word="sing" end="ng" bellNode={bell(200)} />;
        case 4: return <Named gap={u(10)}><Row gap={u(22)}><Word text="sing" end="ng" size={u(169)} dimHead /></Row><Row gap={u(22)}><div style={{ width: u(166) }} /><div style={{ width: u(166) }} /><Point at={a} /></Row></Named>;
        case 5: return <><Row><Word text="sing" end="ng" size={u(169)} dimHead /></Row><Line text="?" size={u(143)} at={a} color={TOWER.stop} /></>;
        case 6: return <Row gap={u(23)}><Card ch="s" size={u(130)} tone="dim" /><Card ch="i" size={u(130)} tone="dim" seed={1} /><Card ch="ng" size={u(208)} tone="ring" at={a} seed={2} hot /></Row>;
        case 7: return <Row gap={u(46)}>{bell(240)}<Card ch="ng" size={u(300)} tone="ring" /></Row>;
        case 8: return <><Pic word="idea" size={u(169)} /><Tag text="IMPORTANT" tone={TOWER.stop} at={a} /></>;
        case 9:
        case 10:
        case 11: {
          const a9 = at(STARTS[1] + 9), a10 = at(STARTS[1] + 10);
          const named = k >= 10;
          return (
            <><Row gap={k >= 11 ? 18 : 52}>
                <Card ch={named ? "n" : "?"} size={u(200)} w={u(230)} tone={named ? "plain" : "dim"}
                  at={named ? a10 : a9} hot={said.saying("N")} />
                <Card ch={named ? "g" : "?"} size={u(200)} w={u(230)} tone={named ? "plain" : "dim"}
                  at={named ? a10 + 7 : a9 + 5} seed={1} hot={said.saying("G")} />
              </Row>
              {!named && <Tag text="2 LETTERS" at={a9 + 12} size={u(52)} />}
            </>
          );
        }
        case 12: return <Row gap={u(18)}><Card ch="s" size={u(200)} w={u(230)} tone="dim" at={a} from="left" /><Card ch="i" size={u(200)} w={u(230)} tone="dim" at={a + 5} seed={1} from="left" /><Card ch="n" size={u(200)} w={u(230)} seed={2} /><Card ch="g" size={u(200)} w={u(230)} seed={3} /></Row>;
        case 13: return <><Row gap={u(60)}><Card ch="n" size={u(200)} w={u(230)} /><Mark kind="no" at={a} size={u(130)} /><Card ch="g" size={u(200)} w={u(230)} seed={1} /></Row><Line text="not  /n/  then  /g/" size={u(70)} at={a + 6} color={TOWER.bad} /></>;
        case 14: return <Row gap={u(0)}><Card ch="n" size={u(200)} w={u(230)} /><Card ch="g" size={u(200)} w={u(230)} seed={1} /></Row>;
        case 15: return <><Card ch="ng" size={u(247)} tone="ring" at={a} /><Tag text="ONE SOUND" at={a + 8} /></>;
        case 16: return <><Tag text="SAY IT WITH ME" at={a} /><Mouth lift={0} at={a} size={u(325)} /></>;
        case 17: return <Row gap={u(46)}>{bell(240)}<Card ch="ng" size={u(300)} tone="ring" /></Row>;
        case 18: return <Row gap={u(47)}><Mouth lift={1} size={u(325)} /></Row>;
        case 19: return <Row gap={u(47)}><Mouth lift={0.55} at={a} size={u(338)} /></Row>;
        case 20: return <Row gap={u(47)}><Mouth lift={1} size={u(338)} /></Row>;
        case 21: return <><Tag text="ONE MORE TIME" at={a} /><Mouth lift={0.9} size={u(325)} /></>;
        case 22: return <Row gap={u(46)}>{bell(240)}<Card ch="ng" size={u(300)} tone="ring" /></Row>;
        default: return <><Card ch="ng" size={u(195)} tone="ring" /><Line text="Great job!" size={u(122)} at={a} color={TOWER.good} /><Pic word="star" size={u(156)} /></>;
      }

    // ── 3 · WORDS THAT END IN ‑NG ──────────────────────────────────────────
    case 2: {
      const W = ["sing", "ring", "king", "long", "sung"];
      const PICS = ["sing", "ring", "king", "snake", "sung"];
      const SENT = [
        "The child can sing a song.", "The bell goes ring.", "The king wears a crown.",
        "That snake is very long.", "We have sung that song before.",
      ];
      const SPICS = ["child", "bell", "crown", "snake", "song"];
      if (k >= 2 && k <= 11) {
        const w = Math.floor((k - 2) / 2);
        const isWord = (k - 2) % 2 === 0;
        if (isWord) {
          return <WordBeat b={b} u={u} a={a} word={W[w]} end="ng" pic={PICS[w]} seed={w} bellNode={bell(200)} at={a} />;
        }
        return (
          <>
            <Row><Word text={W[w]} end="ng" size={u(135)} /></Row>
            <Sentence text={SENT[w]} target={W[w]} pic={SPICS[w]} at={a} size={u(60)} picSize={u(159)} />
          </>
        );
      }
      switch (k) {
        case 0: return <><Tag text="ng WORDS" tone={TOWER.ring} at={a} size={u(68)} /><Pic word="bell" size={u(182)} /></>;
        case 1: return <><Line text="five words" size={u(91)} at={a} /><Row gap={u(23)}>{[0, 1, 2, 3, 4].map((i) => <Card key={i} ch="ng" size={u(112)} tone="ring" at={a + i * 5} seed={i} />)}</Row></>;
        case 12: return <Stack size={u(106)} words={NG_WORDS} end="ng" from={a} />;
        case 13: return <Row gap={u(39)}><Stack size={u(106)} words={NG_WORDS} end="ng" from={0} /><Tag text="ALL  ng" tone={TOWER.ring} at={a} size={u(57)} /></Row>;
        case 14: return <Row gap={u(39)}><Stack size={u(106)} words={NG_WORDS} end="ng" from={0} vowel /><Tag text="THE VOWEL" tone={TOWER.vowel} at={a} size={u(57)} /></Row>;
        case 15: return <><Row><Word text="sing" end="ng" size={u(161)} vowel /></Row><Tag text="short  i" tone={TOWER.vowel} at={a} /></>;
        case 16: return <><Row><Word text="long" end="ng" size={u(161)} vowel /></Row><Tag text="short  o" tone={TOWER.vowel} at={a} /></>;
        case 17: return <><Row><Word text="sung" end="ng" size={u(161)} vowel /></Row><Tag text="short  u" tone={TOWER.vowel} at={a} /></>;
        case 18: return <><Row gap={u(39)}><Card ch="i" size={u(182)} tone="vowel" /><Card ch="o" size={u(182)} tone="vowel" seed={1} /><Card ch="u" size={u(182)} tone="vowel" seed={2} /></Row><Tag text="EVERY ONE IS SHORT" tone={TOWER.vowel} at={a} /></>;
        case 19: return <><Tag text="THE RULE" tone={TOWER.stop} at={a} size={u(56)} /><Row gap={u(20)}>{NG_WORDS.map((w, i) => <Card key={w} ch="ng" size={u(130)} tone="ring" at={a + i * 4} seed={i} />)}</Row><Line text="every one of them" size={u(58)} at={a + 14} /></>;
        case 20: return <Named gap={u(10)}><Plate at={a} pad={36}><Card ch="?" size={u(140)} tone="dim" /><Card ch="?" size={u(140)} tone="dim" seed={1} /><Card ch="ng" size={u(150)} tone="ring" at={a} /></Plate><Row gap={u(22)}><div style={{ width: u(300) }} /><Point at={a + 6} /></Row></Named>;
        case 21: return <><Plate pad={36}><Card ch="?" size={u(140)} tone="dim" /><Card ch="i" size={u(150)} tone="vowel" at={a} hot /><Card ch="ng" size={u(150)} tone="ring" /></Plate><Row gap={u(20)}>{["a", "o", "u"].map((v, i) => <Card key={v} ch={v} size={u(104)} tone="vowel" at={a + 10 + i * 4} seed={i} />)}</Row></>;
        default: return <Row gap={u(56)}>{[0, 1, 2].map((i) => <Pic key={i} word="star" size={u(250)} seed={i * 3} at={a + i * 5} />)}</Row>;
      }
    }

    // ── 4 · THE SOUND /ngk/ ────────────────────────────────────────────────
    case 3:
      switch (k) {
        case 0: return <><Tag text="CHANGE ONE LETTER" tone={TOWER.stop} at={a} /><Row gap={u(34)}><Card ch="g" size={u(182)} tone="ring" /><Line text="→" size={u(94)} /><Card ch="k" size={u(182)} tone="stop" at={a} seed={1} /></Row></>;
        case 1: return <><Row gap={u(34)}><Card ch="g" size={u(169)} tone="ring" /><Link at={a} size={u(64)} /><Card ch="k" size={u(169)} tone="stop" seed={1} /></Row><Row gap={u(34)}><Ear at={a} size={u(169)} /></Row></>;
        case 2: return <Named><Pic word="bank" size={u(300)} seed={3} /><WordBeat b={b} u={u} a={a} word="bank" end="nk" bellNode={bell(200)} at={a} /></Named>;
        case 3: return <><Tag text="SAY IT WITH ME" at={a} /><Row><Word text="bank" end="nk" size={u(166)} /></Row></>;
        case 4: return <WordBeat b={b} u={u} a={a} word="bank" end="nk" bellNode={bell(200)} />;
        case 5: return <Named gap={u(10)}><Row gap={u(22)}><Word text="bank" end="nk" size={u(169)} dimHead /></Row><Row gap={u(22)}><div style={{ width: u(166) }} /><div style={{ width: u(166) }} /><Point at={a} /></Row></Named>;
        case 6: return <><Row gap={u(22)}><Word text="bank" end="nk" size={u(143)} dimHead /></Row><Row gap={u(40)}><Ear at={a} size={u(156)} /><Link at={a} size={u(58)} /><Card ch="?" size={u(182)} tone="stop" at={a + 6} hot /></Row></>;
        case 7: return <><Row gap={u(22)}><Word text="bank" end="nk" size={u(130)} dimHead /></Row><Row gap={u(36)}><Card ch="n" size={u(221)} /><Card ch="k" size={u(260)} tone="stop" at={a} seed={1} hot /></Row></>;
        case 8: return <WordBeat b={b} u={u} a={a} word="bank" end="nk" pic="bank" bellNode={bell(200)} />;
        case 9: return <><Row gap={u(22)}><Word text="bank" end="nk" size={u(117)} dimHead /></Row><Row gap={u(40)}><Card ch="n" size={u(200)} w={u(230)} at={a} from="left" hot={said.saying("N")} /><Card ch="k" size={u(200)} w={u(230)} tone="stop" at={a + 7} seed={1} from="right" hot={said.saying("K")} /></Row></>;
        case 10: return <><Row gap={u(34)}><Card ch="ng" size={u(169)} tone="ring" /><Line text="=" size={u(83)} /><Card ch="nk" size={u(169)} tone="stop" seed={1} /></Row><Wave at={a} label="the same  /ng/  sound" /></>;
        case 11: return <><Row gap={u(26)}><Card ch="ng" size={u(156)} tone="ring" /><Link kind="plus" size={u(76)} /><Card ch="k" size={u(156)} tone="stop" at={a} seed={1} /><Link at={a + 8} size={u(60)} /><Card ch="nk" size={u(182)} tone="stop" at={a + 16} seed={2} /></Row></>;
        case 12: return <><Tag text="SAY IT WITH ME" at={a} /><Card ch="nk" size={u(221)} tone="stop" /></>;
        case 13: return <Row gap={u(46)}>{bell(240)}<Card ch="nk" size={u(300)} tone="stop" /></Row>;
        case 14: return <Row gap={u(64)}><Named gap={u(14)}><Card ch="ng" size={u(143)} tone="ring" /><Wave width={u(b.wide ? 520 : 430)} label="carries on" /></Named><Named gap={u(14)}><Card ch="nk" size={u(143)} tone="stop" /><Wave stopped width={u(b.wide ? 520 : 430)} at={a} label="stops dead" /></Named></Row>;
        default: return <Row gap={u(56)}><Card ch="k" size={u(230)} tone="stop" hot /><Wave stopped width={u(520)} height={u(168)} label="" /><Mark kind="yes" at={a} size={u(140)} /></Row>;
      }

    // ── 5 · WORDS THAT END IN ‑NK ──────────────────────────────────────────
    case 4: {
      const W = ["bank", "pink", "sink", "junk", "thank"];
      const PICS = ["bank", "flower", "sink", "junk", "thank"];
      const SENT = [
        "We keep our money in a bank.", "That flower is pink.", "We wash our hands in the sink.",
        "That box is full of junk.", "We say thank you when someone helps us.",
      ];
      const SPICS = ["money", "flower", "hands", "box", "thank"];
      if (k >= 1 && k <= 10) {
        const w = Math.floor((k - 1) / 2);
        const isWord = (k - 1) % 2 === 0;
        if (isWord) {
          return <WordBeat b={b} u={u} a={a} word={W[w]} end="nk" pic={PICS[w]} seed={w} bellNode={bell(200)} at={a} />;
        }
        return (
          <>
            <Row><Word text={W[w]} end="nk" size={u(130)} /></Row>
            <Sentence text={SENT[w]} target={W[w]} pic={SPICS[w]} at={a} size={u(57)} picSize={u(153)} />
          </>
        );
      }
      switch (k) {
        case 0: return <><Tag text="nk WORDS" tone={TOWER.stop} at={a} size={u(68)} /><Row gap={u(23)}>{[0, 1, 2, 3, 4].map((i) => <Card key={i} ch="nk" size={u(112)} tone="stop" at={a + i * 5} seed={i} />)}</Row><Pic word="bank" size={u(169)} /></>;
        case 11: return <Stack size={u(106)} words={NK_WORDS} end="nk" from={a} />;
        case 12: return <Row gap={u(39)}><Stack size={u(106)} words={NK_WORDS} end="nk" from={0} /><Tag text="ALL  nk" tone={TOWER.stop} at={a} size={u(57)} /></Row>;
        case 13: return <Row gap={u(39)}><Stack size={u(106)} words={NK_WORDS} end="nk" from={0} vowel /><Tag text="THE VOWEL" tone={TOWER.vowel} at={a} size={u(57)} /></Row>;
        case 14: return <><Row><Word text="bank" end="nk" size={u(161)} vowel /></Row><Tag text="short  a" tone={TOWER.vowel} at={a} /></>;
        case 15: return <><Row><Word text="pink" end="nk" size={u(161)} vowel /></Row><Tag text="short  i" tone={TOWER.vowel} at={a} /></>;
        case 16: return <><Row><Word text="junk" end="nk" size={u(161)} vowel /></Row><Tag text="short  u" tone={TOWER.vowel} at={a} /></>;
        default: return <><Row gap={u(39)}><Card ch="a" size={u(169)} tone="vowel" /><Card ch="i" size={u(169)} tone="vowel" seed={1} /><Card ch="u" size={u(169)} tone="vowel" seed={2} /></Row><Tag text="SHORT — JUST LIKE  ng" tone={TOWER.vowel} at={a} /></>;
      }
    }

    // ── 6 · IS IT ‑NG OR ‑NK? ──────────────────────────────────────────────
    case 5:
      switch (k) {
        case 0: return <><Tag text="THE TRICKY PART" tone={TOWER.bad} at={a} size={u(68)} /><Pic word="idea" size={u(169)} /></>;
        case 1: return <Row gap={u(57)}><Card ch="ng" size={u(221)} tone="ring" at={a} /><Card ch="nk" size={u(221)} tone="stop" at={a + 6} seed={1} /></Row>;
        case 2: return <><Row gap={u(39)}><Card ch="ng" size={u(195)} tone="ring" /><Line text="≈" size={u(112)} at={a} /><Card ch="nk" size={u(195)} tone="stop" seed={1} /></Row></>;
        case 3: return <><Tag text="ONE DIFFERENCE" tone={TOWER.stop} at={a} size={u(68)} /><Row gap={u(39)}><Card ch="g" size={u(156)} tone="ring" /><Card ch="k" size={u(156)} tone="stop" at={a} seed={1} hot /></Row></>;
        case 4: return <Card ch="k" size={u(247)} tone="stop" at={a} hot />;
        case 5: return <><Row gap={u(57)}><Card ch="ng" size={u(182)} tone="ring" /><Card ch="nk" size={u(182)} tone="stop" seed={1} /></Row><Row gap={u(34)}><Ear at={a} size={u(169)} /><Line text="listen carefully" size={u(75)} at={a} /></Row></>;
        case 6: return <Named><Pic word="ring" size={u(300)} seed={3} /><WordBeat b={b} u={u} a={a} word="ring" end="ng" bellNode={bell(200)} at={a} /></Named>;
        case 7: return <Named><Pic word="rink" size={u(300)} seed={3} /><WordBeat b={b} u={u} a={a} word="rink" end="nk" bellNode={bell(200)} at={a} /></Named>;
        case 8: return <><Row><Word text="ring" end="ng" size={u(135)} /></Row><Wave at={a} width={u(546)} height={u(130)} label="carries on" /></>;
        case 9: return <><Row><Word text="rink" end="nk" size={u(135)} /></Row><Wave stopped at={a} width={u(546)} height={u(130)} label="stops dead" /></>;
        case 10: return <><Row><Word text="ring" end="ng" size={u(130)} /></Row><Row><Word text="rink" end="nk" size={u(130)} /></Row></>;
        case 11: return <><Row><Word text="ring" end="ng" size={u(125)} dimHead /></Row><Row><Word text="rink" end="nk" size={u(143)} /></Row><Tag text="THE SECOND WORD" at={a} size={u(52)} /></>;
        case 12: return <><Row gap={u(72)}><Card ch="k" size={u(221)} tone="stop" hot /><Mark kind="yes" at={a} size={u(130)} /></Row></>;
        case 13: return <><Row gap={u(40)}><Word text="ring" end="ng" size={u(91)} dimHead /><Word text="rink" end="nk" size={u(91)} dimHead /></Row><Tag text="PAIR 2" at={a} size={u(68)} /><Row gap={u(39)}><Card ch="?" size={u(156)} tone="dim" at={a} /><Card ch="?" size={u(156)} tone="dim" at={a + 6} seed={1} /></Row></>;
        case 14: return <Named><Pic word="sing" size={u(300)} seed={3} /><WordBeat b={b} u={u} a={a} word="sing" end="ng" bellNode={bell(200)} at={a} /></Named>;
        case 15: return <Named><Pic word="sink" size={u(300)} seed={3} /><WordBeat b={b} u={u} a={a} word="sink" end="nk" bellNode={bell(200)} at={a} /></Named>;
        case 16: return <><Row gap={u(40)}><Word text="sing" end="ng" size={u(91)} dimHead /><Word text="sink" end="nk" size={u(91)} dimHead /></Row><Tag text="PAIR 3" at={a} size={u(68)} /><Row gap={u(39)}><Card ch="?" size={u(156)} tone="dim" at={a} /><Card ch="?" size={u(156)} tone="dim" at={a + 6} seed={1} /></Row></>;
        case 17: return <Named><Pic word="bang" size={u(300)} seed={3} /><WordBeat b={b} u={u} a={a} word="bang" end="ng" bellNode={bell(200)} at={a} /></Named>;
        case 18: return <Named><Pic word="bank" size={u(300)} seed={3} /><WordBeat b={b} u={u} a={a} word="bank" end="nk" bellNode={bell(200)} at={a} /></Named>;
        case 19: return <><Tag text="YOUR TURN" tone={TOWER.good} at={a} size={u(78)} /><Pic word="star" size={u(156)} /></>;
        case 20: return <><Line text="YOUR TURN!" size={u(122)} at={a} color={TOWER.good} /><Doors at={a + 6} /></>;
        case 21: return <Row gap={u(50)}><Ear at={a} size={u(250)} /><Link at={a} size={u(82)} /><Card ch="?" size={u(260)} tone="dim" at={a + 6} /></Row>;
        case 22: return <Row gap={u(50)}><Ear at={a} size={u(250)} /><Link at={a} size={u(82)} /><Card ch="k" size={u(260)} tone="stop" at={a + 6} hot /></Row>;
        case 23: return <><WordBeat b={b} u={u} a={a} word="thing" end="ng" bellNode={bell(200)} at={a} /><Thinking at={f(P[idx].end)} /></>;
        case 24: return <Doors at={a} />;
        case 25: return <><Row gap={u(22)}><Word text="thing" end="ng" size={u(104)} dimHead /></Row><Row gap={u(72)}><Card ch="k" size={u(182)} tone="dim" /><Mark kind="no" at={a} size={u(130)} /></Row><Line text="no  /k/  at the end" size={u(78)} at={a + 4} color={TOWER.bad} /></>;
        case 26: return <Doors open="ng" at={a} />;
        case 27: return <Row gap={u(34)}><Row><Word text="thing" end="ng" size={u(146)} /></Row><Pic word="thing" size={u(169)} /><Mark kind="yes" at={a} size={u(120)} /></Row>;
        case 28: return <><Row gap={u(22)}><Word text="thing" end="ng" size={u(91)} dimHead /></Row><Tag text="NEXT WORD" at={a} size={u(62)} /><Row gap={u(40)}><Ear at={a} size={u(156)} /><Link at={a + 6} size={u(58)} /><Card ch="?" size={u(169)} tone="dim" at={a + 10} /></Row></>;
        case 29: return <><WordBeat b={b} u={u} a={a} word="think" end="nk" bellNode={bell(200)} at={a} /><Thinking at={f(P[idx].end)} /></>;
        case 30: return <><Row gap={u(72)}><Card ch="k" size={u(195)} tone="stop" hot /><Mark kind="yes" at={a} size={u(130)} /></Row></>;
        case 31: return <Doors open="nk" at={a} />;
        case 32: return <Row gap={u(34)}><Row><Word text="think" end="nk" size={u(146)} /></Row><Pic word="think" size={u(169)} /><Mark kind="yes" at={a} size={u(120)} /></Row>;
        default: return <><Row gap={u(50)}><Word text="thing" end="ng" size={u(100)} /><Word text="think" end="nk" size={u(100)} /></Row><Line text="Great listening!" size={u(112)} at={a} color={TOWER.good} /></>;
      }

    // ── 7 · AN EASY WAY TO REMEMBER ────────────────────────────────────────
    case 6:
      switch (k) {
        case 0: return <><Pic word="idea" size={u(195)} /><Tag text="AN EASY WAY" at={a} size={u(68)} /></>;
        case 1: return <><Row><Word text="sing" end="ng" size={u(125)} vowel /></Row><Row><Word text="sink" end="nk" size={u(125)} vowel /></Row></>;
        case 2: return <><Row><Word text="sing" end="ng" size={u(125)} dimHead /></Row><Row><Word text="sink" end="nk" size={u(125)} dimHead /></Row></>;
        case 3: return <><Row><Word text="sing" end="ng" size={u(125)} dimHead /></Row><Row><Word text="sink" end="nk" size={u(125)} dimHead /></Row></>;
        case 4: return <Flow step={0} at={a} scale={b.wide ? 1 : 0.72} />;
        case 5: return <Flow step={1} at={0} scale={b.wide ? 1 : 0.72} />;
        case 6: return <Row gap={u(39)}><Ear at={a} size={u(156)} /><Flow step={1} at={0} scale={(b.wide ? 1 : 0.72) * 0.92} /></Row>;
        case 7: return <Flow step={2} at={0} scale={b.wide ? 1 : 0.72} />;
        case 8: return <><Flow step={3} at={0} scale={b.wide ? 1 : 0.72} /><Tag text="THAT'S THE WHOLE RULE" tone={TOWER.good} at={a} size={u(57)} /></>;
        default: return <><Flow step={3} at={0} scale={(b.wide ? 1 : 0.72) * 0.78} /><Row gap={u(40)}><Ear at={a} size={u(169)} /><Link at={a} size={u(62)} /><Pic word="write" size={u(169)} /></Row></>;
      }

    // ── 8 · LET'S REMEMBER ─────────────────────────────────────────────────
    case 7:
      switch (k) {
        case 0: return <><Tag text="TODAY WE LEARNED" at={a} size={u(70)} /><Pic word="star" size={u(156)} /></>;
        case 1: return <Row gap={u(52)}><Card ch="?" size={u(195)} tone="dim" at={a} /><Card ch="?" size={u(195)} tone="dim" at={a + 6} seed={1} /></Row>;
        case 2: return <Named gap={u(10)}><Row gap={u(22)}><Card ch="?" size={u(169)} tone="dim" /><Card ch="?" size={u(169)} tone="dim" seed={1} /><Card ch="ng" size={u(208)} tone="ring" at={a} seed={2} /></Row><Row gap={u(22)}><div style={{ width: u(165) }} /><div style={{ width: u(165) }} /><Point at={a + 6} /></Row></Named>;
        case 3: return <Row gap={u(46)}>{bell(240)}<Card ch="ng" size={u(300)} tone="ring" /></Row>;
        case 4: return <Row gap={u(52)}><Card ch="ng" size={u(195)} w={u(230)} tone="ring" /><Card ch="nk" size={u(195)} w={u(230)} tone="stop" at={a} seed={1} from="right" /></Row>;
        case 5: return <Row gap={u(26)}><Card ch="ng" size={u(156)} tone="ring" /><Link kind="plus" size={u(76)} /><Card ch="k" size={u(156)} tone="stop" at={a} seed={1} /><Link at={a + 8} size={u(60)} /><Card ch="nk" size={u(195)} tone="stop" at={a + 16} seed={2} /></Row>;
        case 6: return <Row gap={u(46)}>{bell(240)}<Card ch="nk" size={u(300)} tone="stop" /></Row>;
        case 7: return <><Row><Word text="sing" end="ng" size={u(120)} vowel /></Row><Row><Word text="sink" end="nk" size={u(120)} vowel /></Row></>;
        default: return <><Row gap={u(29)}>{["a", "e", "i", "o", "u"].map((v, i) => <Card key={v} ch={v} size={u(151)} tone="vowel" at={a + i * 4} seed={i} />)}</Row><Tag text="SHORT VOWEL" tone={TOWER.vowel} at={a + 10} /></>;
      }

    // ── 9 · CLOSE ──────────────────────────────────────────────────────────
    default:
      switch (k) {
        case 0: return <><Line text="Fantastic work!" size={u(130)} at={a} color={TOWER.good} /><Pic word="star" size={u(169)} /></>;
        case 1: return <><Pic word="star" size={u(200)} /><Tag text="NEXT TIME · PART 3" tone={TOWER.stop} at={a} size={u(64)} /></>;
        case 2: return <><Line text="the letter…" size={u(94)} at={a} /><Card ch="?" size={u(221)} tone="dim" /></>;
        case 3: return <Card ch="x" size={u(260)} tone="ring" at={a} hot />;
        case 4: return <Row gap={u(29)}><Card ch="x" size={u(195)} tone="ring" /><Line text="=" size={u(94)} /><Card ch="/k/" size={u(182)} at={a} seed={1} /><Card ch="/s/" size={u(182)} at={a + 8} seed={2} /></Row>;
        case 5: return <Row gap={u(52)}><Card ch="x" size={u(182)} tone="ring" /><Card ch="w" size={u(247)} tone="stop" at={a} hot /></Row>;
        case 6: return <><Row gap={u(52)}><Card ch="x" size={u(195)} tone="ring" /><Card ch="w" size={u(195)} tone="stop" seed={1} /></Row><Tag text="DON'T MISS IT!" at={a} size={u(65)} /></>;
        case 7: return <Line text={"\u{1F44D}"} size={u(b.wide ? 247 : 330)} at={a} />;
        default: return <Row gap={u(44)}><Tag text={"\u{1F44D}  LIKE"} tone={TOWER.stone} at={a} size={u(70)} /><Tag text={"\u{1F514}  SUBSCRIBE"} tone={TOWER.stop} at={a + 8} size={u(70)} /></Row>;
      }
  }
};

// ── the reel ─────────────────────────────────────────────────────────────────

export const L5RulesP2Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const b = bands(width, height);

  const idx = BEAT_OF[phraseAt(frame)];
  const s = sectionOf(idx);
  const k = idx - STARTS[s];
  const storeFrom = at(STORE_FROM_IDX);

  const mood: PipMood =
    PIP_CHEER.has(idx) ? "cheer" : PIP_LISTEN.has(idx) ? "listen"
    : PIP_BUMP.has(idx) ? "bump" : RING_NG.has(idx) || RING_NK.has(idx) ? "pull" : "idle";

  return (
    <AbsoluteFill>
      <TowerWorld />

      {frame < storeFrom && <Pip b={b} mood={mood} />}

      <Sequence from={0} durationInFrames={f(TOTAL) + 20}>
        <Audio src={staticFile("audio/l5_rules_p2_16x9/l5_rules_p2.mp3")} />
      </Sequence>

      {/* a soft bed, far under the teacher — a six-minute lesson needs air, not a track */}
      <Audio
        src={staticFile("music_bed.mp3")}
        loop
        volume={(fr) =>
          interpolate(fr, [0, 40, L5_P2_DURATION - 70, L5_P2_DURATION], [0, 0.055, 0.055, 0], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          })
        }
      />

      {SFX.map((c, i) => (
        <Sequence key={`${c.file}-${c.i}-${i}`} from={c.frame} durationInFrames={45}>
          <Audio src={staticFile(`sfx/${c.file}.mp3`)} volume={c.vol} />
        </Sequence>
      ))}

      {BANNERS[s] !== "" && frame < storeFrom && (
        <Banner b={b} text={BANNERS[s]} tone={s === 4 || s === 3 ? TOWER.stop : TOWER.stone} />
      )}

      {frame < storeFrom && (
        <Content b={b}>
          <Scene idx={idx} k={k} s={s} b={b} />
        </Content>
      )}

      {[37, 60, 128, 148].map((i) => (
        <Fixed key={i} b={b}>
          <Confetti
            frame={frame} fps={fps} burstFrame={at(i) + 6}
            origin={{ x: (b.contentL + b.contentR) / 2, y: b.contentTop + 60 }}
            colors={[TOWER.ring, TOWER.good, TOWER.stop, TOWER.vowel]}
          />
        </Fixed>
      ))}

      {frame < storeFrom && <Captions track={TRACK} maxWidth={b.wide ? 1180 : 900} fontSize={b.wide ? 40 : 36} />}
      {/* wide: the tower owns the top-right, so the logo goes bottom-right.
          portrait: the tower is bottom-right, so it goes top-right instead. */}
      <Watermark corner={b.wide ? "br" : "tr"} widthFrac={b.wide ? 0.085 : 0.115} pad={b.wide ? 54 : 40} />

      {/* the CTA is in the teacher's own take, so the card is silent */}
      <Sequence from={storeFrom}>
        <AbsoluteFill style={{ background: "rgba(20, 30, 40, 0.55)" }} />
        <StoreOutro silent total={L5_P2_DURATION - storeFrom} ctaBg={TOWER.stone} titleColor="#FFFFFF" />
      </Sequence>
    </AbsoluteFill>
  );
};
