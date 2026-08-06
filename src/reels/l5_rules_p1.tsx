import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/l5_rules_p1.captions.json";
import { Captions } from "../components/Captions";
import { makeTrack, TPhrase } from "../lib/timing";
import { spokenIn } from "../lib/spoken";
import { Watermark } from "../components/Watermark";
import { Confetti } from "../components/Confetti";
import { StoreOutro, STORE_OUTRO_F } from "../components/StoreOutro";
import { font } from "../data/tokens";
import { bob, pulse, wiggle } from "../lib/motion";
import { WordPic, hasPicture } from "../data/l5_pictures";
import {
  Fixed, bands, Blueprints, Brick, BrickTone, ClapMeter, Cone, Content, Crane, Plank, SITE, Sign, SiteWorld, uiScale,
  Skip, Slab, Stage, StretchBand, VowelLamp, WarningTape, WordWall,
} from "../components/BuildSite";

// ── L5 · SPELLING RULES — PART 1 (Floss + ck) · 16:9 ─────────────────────────
//
// 10:33, 253 narration lines, one visual change EVERY line — a change every 2.5s.
//
// At this length the enemy is repetition, not drift. So the world exposes a dozen separate
// instruments and the sections rotate them; no two adjacent sections use the same one.
//
// The through-line is the WORD WALL down the right edge, split by RULE: every word that
// FOLLOWS the rule stacks into it, so ten minutes has a visible finish. Words that do not
// follow the rule go in the SKIP instead — filing a counter-example on the rule wall
// teaches the opposite of the lesson.
//
// Three laws this file is built to keep, each of which was broken once and cost a render:
//   1. Every line gets its own visual, and no line may show an empty stage.
//   2. Anything the narration NAMES lights when it is SAID — timings come from the
//      alignment (lib/spoken), never from hand-counted frames.
//   3. A text chip that restates the caption is not a visual. Show it, don't caption it.

const FPS = 30;
const P = phrasesJson as unknown as TPhrase[];
const TOTAL = P[P.length - 1].end;
const f = (s: number) => Math.round(s * FPS);

// captions clear 1.0s after a line, so a held beat is never captioned stale
const TRACK = makeTrack(P, TOTAL, FPS, 1.0);

/** first phrase index of each section, found by its opening line */
const SECTION_FIRSTS = [
  "Welcome back!", "Let's start with Floss.", "The rule has three parts",
  "Let's try some more together.", "Now here's something interesting.",
  "Now let's look at the other side.", "There are three little traps.",
  "Here's an easy way to remember it.", "Now for our second rule.", "First, the letter C.",
  "But there's one special rule.", "Now for the third part.", "Here's something really important.",
  "Now let's look at some common mistakes.", "Here's an easy trick to remember.",
  "Let's remember today's two rules.",
];
const STARTS = SECTION_FIRSTS.map((first) =>
  P.findIndex((p) => p.text.trim().startsWith(first.slice(0, 28)))
);

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

export const L5_P1_DURATION = f(TOTAL) + 40;

/**
 * The store card needs STORE_OUTRO_F to play out. The take ends 1.3s after the last word,
 * which cut the download card off 2.7s short — the voice finished but the card never did.
 * Portrait gets the full tail; the wide cut is left exactly as approved.
 */
export const L5_P1_DURATION_TAIL =
  Math.max(f(TOTAL) + 40, f(P[P.findIndex((p) => p.text.trim().startsWith("And practise these rules"))].start) + STORE_OUTRO_F);

// ── small parts used across sections ─────────────────────────────────────────

const HEAD: React.CSSProperties = {
  fontFamily: font.family, fontWeight: 800, color: SITE.ink, lineHeight: 1.05,
};

type Hot = (token: string) => boolean;

/** a word built from bricks; `tones` colours individual letters, `hot` lights the spoken one */
const Word: React.FC<{
  text: string; size?: number; tones?: Record<number, BrickTone>; joinLast2?: boolean;
  seed?: number; hot?: Hot;
}> = ({ text, size = 92, tones = {}, joinLast2 = false, seed = 0, hot }) => {
  const chars = text.split("");
  const out: React.ReactNode[] = [];
  for (let i = 0; i < chars.length; i++) {
    if (joinLast2 && i === chars.length - 2) {
      out.push(<Brick key={i} ch={chars[i] + chars[i + 1]} size={size} tone={tones[i] ?? "orange"} joined seed={seed + i} />);
      i++;
      continue;
    }
    out.push(<Brick key={i} ch={chars[i]} size={size} tone={tones[i] ?? "plain"} seed={seed + i} hot={hot ? hot(chars[i]) : false} />);
  }
  return <>{out}</>;
};

/** a word on its own plank, with its picture when an honest one exists */
const WordPlank: React.FC<{
  text: string; size?: number; tones?: Record<number, BrickTone>; joinLast2?: boolean;
  seed?: number; hot?: Hot; pic?: boolean; picSize?: number;
}> = ({ text, size = 92, tones, joinLast2, seed = 0, hot, pic = true, picSize }) => (
  <Plank pic={pic ? text : undefined} picSize={picSize ?? size * 1.95} seed={seed} gap={6}>
    <Word text={text} size={size} tones={tones} joinLast2={joinLast2} seed={seed} hot={hot} />
  </Plank>
);

/**
 * A site checklist card. Replaces the plain white oblong: a numbered disc, the condition,
 * and a stamped tick when it is met.
 */
const RuleCard: React.FC<{
  n?: number; text: string; on: boolean; tick?: boolean; w?: number; icon?: string;
  compact?: boolean; stack?: boolean;
}> = ({ n, text, on, tick = false, w: rawW = 470, icon, compact = false, stack = false }) => {
  const frame = useCurrentFrame();
  const { fps, width: vw, height: vh } = useVideoConfig();
  const S = uiScale(vw, vh);
  const w = rawW * S;
  if (stack) {
    return (
      <div
        style={{
          width: 380 * S, padding: `${14 * S}px ${16 * S}px`, borderRadius: 18,
          background: on ? "#FFFFFF" : "rgba(255,255,255,0.52)",
          border: `5px solid ${tick ? SITE.green : on ? SITE.teal : "rgba(0,0,0,0.14)"}`,
          boxShadow: on ? "0 10px 22px rgba(0,0,0,0.20)" : "none",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          transform: `scale(${on ? 1 + 0.02 * pulse(frame, fps, 1, 1.6) : 0.96})`,
          opacity: on ? 1 : 0.5,
          ...HEAD,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 46 * S, height: 46 * S, borderRadius: "50%", background: tick ? SITE.green : on ? SITE.teal : "rgba(0,0,0,0.12)", color: "#fff", fontSize: 28 * S, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {n}
          </div>
          {icon && <div style={{ fontSize: 38 * S }}>{icon}</div>}
          {tick && (
            <div style={{ width: 40 * S, height: 40 * S, borderRadius: 10, background: SITE.green, color: "#fff", fontSize: 27 * S, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(-8deg) scale(${1 + 0.10 * pulse(frame, fps, 1, 0.6)})` }}>✓</div>
          )}
        </div>
        <div style={{ fontSize: 30 * S, textAlign: "center" }}>{text}</div>
      </div>
    );
  }
  return (
    <div
      style={{
        width: w, padding: compact ? `${8 * S}px ${18 * S}px` : `${14 * S}px ${20 * S}px`, borderRadius: 16,
        background: on ? "#FFFFFF" : "rgba(255,255,255,0.50)",
        border: `4px solid ${tick ? SITE.green : on ? SITE.teal : "rgba(0,0,0,0.14)"}`,
        boxShadow: on ? "0 10px 22px rgba(0,0,0,0.18)" : "none",
        display: "flex", alignItems: "center", gap: 14,
        transform: `scale(${on ? 1 + 0.02 * pulse(frame, fps, 1, 1.6) : 0.97})`,
        opacity: on ? 1 : 0.55,
        ...HEAD, fontSize: (compact ? 28 : 32) * S,
      }}
    >
      {n !== undefined && (
        <div style={{ width: 42 * S, height: 42 * S, borderRadius: "50%", flexShrink: 0, background: tick ? SITE.green : on ? SITE.teal : "rgba(0,0,0,0.12)", color: "#fff", fontSize: 26 * S, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {n}
        </div>
      )}
      {icon && <div style={{ fontSize: 34 * S }}>{icon}</div>}
      <div style={{ flex: 1 }}>{text}</div>
      {tick && (
        <div style={{ width: 44 * S, height: 44 * S, borderRadius: 10, background: SITE.green, color: "#fff", fontSize: 30 * S, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(-8deg) scale(${1 + 0.10 * pulse(frame, fps, 1, 0.6)})` }}>
          ✓
        </div>
      )}
    </div>
  );
};

/** the /k/ sound as a wave — one hump or two */
const SoundWave: React.FC<{ humps: number; label?: string; tone?: string }> = ({ humps, label, tone = SITE.orange }) => {
  const frame = useCurrentFrame();
  const { fps, width: vw, height: vh } = useVideoConfig();
  const S = uiScale(vw, vh);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", gap: 22 }}>
        {Array.from({ length: humps }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 120 * S, height: 120 * S, borderRadius: "50% 50% 0 0",
              background: tone, opacity: 0.9,
              transform: `scaleY(${0.7 + 0.3 * pulse(frame, fps, 1, 0.7 + i * 0.1)})`,
              transformOrigin: "bottom center",
            }}
          />
        ))}
      </div>
      {label && <div style={{ ...HEAD, fontSize: 34 * S, color: tone }}>{label}</div>}
    </div>
  );
};

const Chip: React.FC<{ text: string; tone?: string; size?: number }> = ({ text, tone = SITE.teal, size = 34 }) => {
  const { width, height } = useVideoConfig();
  const S = uiScale(width, height);
  return <div style={{ padding: `${10 * S}px ${22 * S}px`, borderRadius: 999, background: tone, color: "#fff", ...HEAD, fontSize: size * S }}>{text}</div>;
};

/** a speech bubble — used where something on screen actually SAYS something */
const Bubble: React.FC<{ text: string; tone?: string; size?: number }> = ({ text, tone = SITE.blue, size = 38 }) => {
  const frame = useCurrentFrame();
  const { fps, width: vw, height: vh } = useVideoConfig();
  const S = uiScale(vw, vh);
  return (
    <div style={{ position: "relative", transform: `translateY(${bob(frame, fps, 5, 1.7)}px)` }}>
      <div style={{ padding: `${12 * S}px ${26 * S}px`, borderRadius: 18, background: "#FFFFFF", border: `${Math.max(2, 4 * S)}px solid ${tone}`, color: tone, ...HEAD, fontSize: size * S, whiteSpace: "nowrap" }}>
        {text}
      </div>
      <div style={{ position: "absolute", left: 34 * S, bottom: -18 * S, width: 0, height: 0, borderLeft: `${14 * S}px solid transparent`, borderRight: `${14 * S}px solid transparent`, borderTop: `${18 * S}px solid ${tone}` }} />
    </div>
  );
};

/** a magnifying glass that hovers over what the teacher is pointing at */
const Magnifier: React.FC<{ size?: number }> = ({ size: raw = 104 }) => {
  const frame = useCurrentFrame();
  const { fps, width: vw, height: vh } = useVideoConfig();
  const size = raw * uiScale(vw, vh);
  return (
    <div style={{ position: "relative", width: size, height: size, transform: `translateY(${bob(frame, fps, 8, 1.5)}px) rotate(${wiggle(frame, fps, 6, 2.2)}deg)` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `${size * 0.10}px solid #5D6B77`, background: "rgba(255,255,255,0.34)" }} />
      <div style={{ position: "absolute", left: size * 0.74, top: size * 0.74, width: size * 0.42, height: size * 0.14, borderRadius: 8, background: "#5D6B77", transform: "rotate(42deg)" }} />
    </div>
  );
};

/** a red cross stamped over something wrong */
const Cross: React.FC<{ size?: number }> = ({ size: raw = 78 }) => {
  const frame = useCurrentFrame();
  const { fps, width: vw, height: vh } = useVideoConfig();
  const size = raw * uiScale(vw, vh);
  return (
    <div style={{ width: size, height: size, position: "relative", transform: `rotate(-10deg) scale(${1 + 0.07 * pulse(frame, fps, 1, 0.8)})` }}>
      {[45, -45].map((r) => (
        <div key={r} style={{ position: "absolute", left: 0, top: size * 0.42, width: size, height: size * 0.16, borderRadius: 6, background: SITE.red, transform: `rotate(${r}deg)` }} />
      ))}
    </div>
  );
};

/** marks something wrong — the cross sits BELOW the card, never over the letter */
const Wrong: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 68 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
    {/* the children go in a ROW of their own: `Word` returns a fragment of bricks, and
        without this they inherit the column and spell the word vertically */}
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>{children}</div>
    <Cross size={size} />
  </div>
);

/** a stencilled site crate — what Part Two waits in */
const Crate: React.FC<{ text: string; size?: number }> = ({ text, size: raw = 190 }) => {
  const frame = useCurrentFrame();
  const { fps, width: vw, height: vh } = useVideoConfig();
  const size = raw * uiScale(vw, vh);
  return (
    <div style={{ width: size, height: size * 0.72, borderRadius: 10, background: "#C08A4E", border: "6px solid #8A5F30", display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${bob(frame, fps, 5, 2.6)}px) rotate(${wiggle(frame, fps, 1.6, 4)}deg)`, boxShadow: "0 10px 20px rgba(0,0,0,0.20)" }}>
      <div style={{ ...HEAD, fontSize: size * 0.16, color: "#FFF6E6", letterSpacing: 1 }}>{text}</div>
    </div>
  );
};

/** an empty slot waiting for a brick — so a "what goes here?" beat is never a bare frame */
const Socket: React.FC<{ size?: number; label?: string }> = ({ size: raw = 92, label }) => {
  const frame = useCurrentFrame();
  const { fps, width: vw, height: vh } = useVideoConfig();
  const size = raw * uiScale(vw, vh);
  return (
    <div
      style={{
        minWidth: size * 0.92, height: size, borderRadius: size * 0.16,
        border: `${Math.max(4, size * 0.06)}px dashed ${SITE.steel}`,
        background: "#FFFFFF",
        boxShadow: `0 ${size * 0.09}px 0 rgba(0,0,0,0.14)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        ...HEAD, fontSize: size * 0.5, color: SITE.steel,
        transform: `scale(${1 + 0.03 * pulse(frame, fps, 1, 1.1)})`,
      }}
    >
      {label ?? ""}
    </div>
  );
};

/** the hard-hat mascot — praise beats */
const Hat: React.FC<{ cheer?: boolean }> = ({ cheer = false }) => {
  const frame = useCurrentFrame();
  const { fps, width: vw, height: vh } = useVideoConfig();
  return (
    <div style={{ fontSize: 130 * uiScale(vw, vh), transform: `translateY(${bob(frame, fps, cheer ? 14 : 5, cheer ? 0.6 : 2.4)}px) rotate(${wiggle(frame, fps, cheer ? 12 : 3, 1.1)}deg)` }}>
      {"\u{1F477}"}
    </div>
  );
};

const Upper: React.FC<{ b: ReturnType<typeof bands>; children: React.ReactNode; gap?: number; top?: number }> = ({
  b, children, gap = 24, top,
}) => (
  <Stage b={b} top={top ?? b.upperY + 20} gap={gap}>{children}</Stage>
);

// ── the word wall: only words that FOLLOW the rule, grouped by rule ──────────
//
// leaf/feel/tool/pool/sail are deliberately absent — they are the long-vowel
// counter-examples, and they go in the skip in section 5.

const RULE1: [number, string][] = [
  [19, "off"], [20, "bell"], [21, "miss"], [22, "buzz"],
  [56, "cliff"], [57, "tall"], [58, "grass"], [59, "fizz"], [60, "shell"], [61, "dress"],
];
const RULE2: [number, string][] = [
  [157, "cat"], [159, "cup"], [162, "cod"], [163, "cot"], [164, "cab"], [165, "cut"],
  [174, "key"], [175, "kit"], [176, "king"],
  [186, "duck"], [187, "back"], [188, "kick"], [189, "rock"], [190, "luck"],
  [191, "pack"], [192, "sock"], [193, "block"], [194, "check"], [195, "thick"],
];
const upTo = (list: [number, string][], idx: number) => list.filter(([i]) => idx >= i).map(([, w]) => w);

// ── sound effects ────────────────────────────────────────────────────────────
//
// A cue is only ever placed in a SILENT GAP. The take is a continuous performance at
// full scale, so an effect laid on top of a spoken line both muddies the word and pushes
// the mix into clipping — which is exactly what happened on the first sentences reel.
// If a line has no gap either side, it simply gets no effect.

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

// a section opens
STARTS.forEach((i, n) => cue(i, ["chime_soft", "blend", "brand_chime"][n % 3], 0.13));
// a word is built and joins the wall
[...RULE1, ...RULE2].forEach(([i]) => cue(i, "pop", 0.085));
// a condition is ticked
[STARTS[2] + 8, STARTS[2] + 19, STARTS[2] + 21,
 STARTS[7] + 2, STARTS[7] + 3, STARTS[7] + 4,
 STARTS[15] + 2, STARTS[15] + 3, STARTS[15] + 4,
 STARTS[15] + 7, STARTS[15] + 8, STARTS[15] + 9].forEach((i) => cue(i, "correct", 0.10));
// praise
[STARTS[3] + 8, STARTS[3] + 9, STARTS[14] + 5, STARTS[15] + 10, STARTS[15] + 11]
  .forEach((i) => cue(i, "twinkle", 0.105));
// a trap is revealed
[STARTS[6] + 1, STARTS[6] + 7, STARTS[6] + 26].forEach((i) => cue(i, "boing", 0.09));
// a wrong spelling is thrown in the skip
[STARTS[13] + 4, STARTS[13] + 6, STARTS[13] + 8].forEach((i) => cue(i, "whoosh", 0.09));
// ── expression cues: the sound follows what the LINE is doing ───────────────
// a question asks, a build-up teases, a reveal pays off, a wrong answer buzzes.
P.forEach((ph, i) => {
  const t = ph.text.trim();
  // the rhetorical questions are the hooks of the lesson — they carry more level than
  // the structural cues so the beat actually lands
  if (t.endsWith("?")) cue(i, "question", /why does English|how do we know/i.test(t) ? 0.19 : 0.14);
  else if (/\bis wrong\b|not an English word/i.test(t)) cue(i, "boing", 0.10);
  else if (/^Listen\.?$/i.test(t)) cue(i, "tick", 0.09);
});
// a correction, a warning, a discovery — each gets its own sound, because one effect
// used everywhere stops carrying meaning
P.forEach((ph, i) => {
  const t = ph.text.trim();
  if (/not the Floss rule|Floss only works|only F, L, S and Z|Not C|Not K|Not P|Not T/i.test(t)) cue(i, "boing", 0.12);
  else if (/^Trap number/i.test(t)) cue(i, "drumroll", 0.13);
  else if (/never doubles|Don't swap|is not an English word/i.test(t)) cue(i, "boing", 0.12);
  else if (/Did you notice|Look at|Now look/i.test(t)) cue(i, "chime_soft", 0.12);
  else if (/You're picking this up|Well done|Nice|Pretty clever/i.test(t)) cue(i, "brave", 0.14);
  else if (/^That's two claps|One clap every time|^Two claps/i.test(t)) cue(i, "tick", 0.11);
  else if (/vowel team/i.test(t)) cue(i, "blend", 0.12);
  else if (/^Every one ends|^Every one starts|^Every one has/i.test(t)) cue(i, "sparkle", 0.12);
});

// the tease and its pay-off
[["There's a reason", "drumroll", 0.11], ["and it's a good one", "sparkle", 0.12],
 ["Here's the problem", "drumroll", 0.10], ["But there's one special rule", "drumroll", 0.10],
 ["Here's something really important", "drumroll", 0.10],
 ["That's two rules finished", "brave", 0.13], ["Quack!", "boing", 0.12]]
  .forEach(([txt, file, v]) => {
    const i = P.findIndex((ph) => ph.text.trim().startsWith(String(txt).slice(0, 18)));
    cue(i, String(file), Number(v));
  });

// the crane swings a brick across
[STARTS[2] + 22, STARTS[3] + 1, STARTS[3] + 2, STARTS[3] + 3, STARTS[3] + 4, STARTS[3] + 5, STARTS[3] + 6]
  .forEach((i) => cue(i, "swoosh_soft", 0.085));

const seenCue = new Set<number>();
const SFX = CUES
  .filter((c) => (seenCue.has(c.i) ? false : (seenCue.add(c.i), true)))
  .map((c) => ({ ...c, frame: gapFrame(c.i) }))
  .filter((c): c is { i: number; file: string; vol: number; frame: number } => c.frame !== null);

// ── the scene for any given line ─────────────────────────────────────────────

const Scene: React.FC<{ idx: number; k: number; s: number; b: ReturnType<typeof bands> }> = ({ idx, k, s, b }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (i: number) => f(P[i].start);
  // everything the narration names lights when it is SAID
  const said = spokenIn(P[idx], frame, fps);
  const hot: Hot = (t) => said.saying(t);

  switch (s) {
    // ── 1 · the six rules, as blueprints ────────────────────────────────────
    case 0: {
      const shown = k >= 1 ? 6 : 0;
      const lit =
        k === 3 || k === 4 ? [0] : k === 5 || k === 6 ? [1] : k === 7 || k === 8 ? [2, 3] :
        k === 9 ? [4] : k === 10 || k === 11 ? [5] : k === 12 || k === 13 ? [0, 1, 2, 3, 4, 5] :
        k >= 14 ? [0, 1] : [];
      return (
        <>
          {k >= 1 && <Sign b={b} text="LEVEL 5 · SPELLING RULES" tone={SITE.teal} />}
          {k === 0 && (
            <>
              <Sign b={b} text="WELCOME BACK!" tone={SITE.green} />
              <Slab b={b} gap={40}>
                <WordPic word="floss" size={130} />
                <Hat cheer />
                <WordPic word="key" size={130} seed={2} />
              </Slab>
              <Fixed b={b}><Confetti frame={frame} fps={fps} burstFrame={at(STARTS[0])} origin={{ x: b.width / 2, y: b.slabY - 120 }} colors={[SITE.amber, SITE.green, SITE.blue, SITE.teal]} /></Fixed>
            </>
          )}
          {shown > 0 && <Blueprints b={b} shown={6} lit={lit} />}
          {k === 4 && <Slab b={b}><WordPlank text="bell" tones={{ 2: "teal", 3: "teal" }} /></Slab>}
          {k === 6 && <Slab b={b} gap={20}><Brick ch="c" size={92} tone="orange" /><Brick ch="k" size={92} tone="orange" /><Brick ch="ck" size={92} tone="orange" joined /></Slab>}
          {k === 7 && (
            <Slab b={b} gap={54}>
              <Plank gap={6}><Brick ch="n" size={88} /><Brick ch="g" size={88} /></Plank>
              <Plank gap={6}><Brick ch="n" size={88} /><Brick ch="k" size={88} /></Plank>
            </Slab>
          )}
          {/* the line says N-G AND N-K, so both pairs team up */}
          {k === 8 && (
            <Slab b={b} gap={54}>
              <Plank gap={6}><Brick ch="ng" size={92} tone="teal" joined /></Plank>
              <Plank gap={6}><Brick ch="nk" size={92} tone="blue" joined /></Plank>
            </Slab>
          )}
          {k === 9 && <Slab b={b} gap={16}><Brick ch="x" size={100} tone="blue" /><div style={{ ...HEAD, fontSize: 54 }}>=</div><Brick ch="k" size={78} tone="ghost" /><Brick ch="s" size={78} tone="ghost" /></Slab>}
          {k === 10 && <Slab b={b} gap={16}><Brick ch="w" size={100} tone="blue" /><Brick ch="a" size={100} tone="amber" /></Slab>}
          {k === 11 && (
            <Slab b={b} gap={16}>
              <Brick ch="w" size={100} tone="blue" />
              <Brick ch="a" size={100} tone="blue" />
              <Bubble text="wo" tone={SITE.blue} />
            </Slab>
          )}
          {k === 12 && <Slab b={b} gap={18}>{[1, 2, 3, 4, 5, 6].map((n) => <Brick key={n} ch={String(n)} size={72} tone="teal" />)}</Slab>}
          {k === 13 && <VowelLamp b={b} vowel="a" long={false} y={b.bandA} />}
          {k === 15 && <Slab b={b} gap={44}><WordPic word="floss" size={130} /><WordPic word="key" size={130} seed={2} /></Slab>}
          {k === 16 && <Slab b={b}><Crate text="PART 2" /></Slab>}
        </>
      );
    }

    // ── 2 · Floss: spot the pattern ─────────────────────────────────────────
    case 1: {
      const words = ["off", "bell", "miss", "buzz"];
      const built = k <= 1 ? (k === 1 ? 4 : 0) : Math.min(4, k - 1);
      const endLit = k >= 6;
      const which = k >= 7 && k <= 10 ? k - 7 : -1;
      return (
        <>
          <Sign b={b} text="RULE 1 · FLOSS" tone={SITE.teal} />
          {/* the opener is no longer a bare stage: the spool arrives with four empty planks */}
          {k === 0 && (
            <Slab b={b} gap={40}>
              <WordPic word="floss" size={160} />
              {[0, 1, 2, 3].map((i) => <Socket key={i} size={78} />)}
            </Slab>
          )}
          {k > 0 && (
            <Slab b={b} gap={78}>
              {words.slice(0, built).map((w, i) => (
                <div key={w} style={{ opacity: which < 0 || which === i ? 1 : 0.32, transform: `scale(${which === i ? 1.08 : 1})` }}>
                  <WordPlank
                    text={w} size={72} picSize={176} seed={i * 3}
                    tones={endLit ? { [w.length - 2]: "teal", [w.length - 1]: "teal" } : {}}
                  />
                </div>
              ))}
            </Slab>
          )}
          {k === 6 && <Upper b={b} top={b.slabY - 210}><Magnifier size={120} /></Upper>}
          {which >= 0 && (
            <Stage b={b} top={b.bandA} dir="column" gap={14}>
              <Brick ch="2" size={88} tone="amber" />
              <div style={{ display: "flex", gap: 12 }}>
                <Brick ch={words[which].slice(-1)} size={88} tone="teal" />
                <Brick ch={words[which].slice(-1)} size={88} tone="teal" seed={2} />
              </div>
            </Stage>
          )}
          {k === 11 && <Upper b={b} gap={16}>{words.map((w, i) => <Brick key={w} ch={w.slice(-2)} size={76} tone="teal" joined seed={i} />)}</Upper>}
          {k >= 12 && k <= 13 && <Crane b={b} hookX={b.width * 0.12} hookY={b.upperY + 40} carrying="?" />}
          {k === 14 && <Upper b={b}><div style={{ fontSize: 130 }}>{"\u{1F4A1}"}</div></Upper>}
        </>
      );
    }

    // ── 3 · the three conditions ────────────────────────────────────────────
    case 2: {
      const words = ["off", "bell", "miss", "buzz"];
      const vowels = ["o", "e", "i", "u"];
      const clapWord = k >= 4 && k <= 7 ? k - 4 : -1;
      const vowelIdx = k >= 11 && k <= 18 ? Math.floor((k - 11) / 2) : -1;
      return (
        <>
          <Sign b={b} text="ALL THREE MUST BE TRUE" tone={SITE.teal} />
          <Stage b={b} top={b.bandA} gap={18}>
            <RuleCard n={1} text="one clap" on={k >= 1} tick={k >= 8} icon={"\u{1F44F}"} stack />
            <RuleCard n={2} text="short vowel" on={k >= 9} tick={k >= 19} icon={"\u{1F50A}"} stack />
            <RuleCard n={3} text="ends f · l · s · z" on={k >= 19} tick={k >= 21} icon={"\u{1F9F1}"} stack />
          </Stage>
          {k === 0 && <Slab b={b} gap={26}>{[1, 2, 3].map((n) => <Socket key={n} size={84} label={String(n)} />)}</Slab>}
          {(k === 2 || k === 3) && <Slab b={b}><ClapMeter b={b} claps={1} lit={1} inline /></Slab>}
          {clapWord >= 0 && (
            <Slab b={b} gap={40}>
              <WordPlank text={words[clapWord]} size={82} seed={clapWord} />
              <ClapMeter b={b} claps={1} lit={1} inline />
            </Slab>
          )}
          {k === 8 && (
            <Slab b={b} gap={72}>
              {words.map((w, i) => (
                <Plank key={w} gap={4}>
                  <Word text={w} size={62} seed={i} />
                </Plank>
              ))}
            </Slab>
          )}
          {k === 10 && <Slab b={b}><SoundWave humps={1} label="listen" tone={SITE.teal} /></Slab>}
          {vowelIdx >= 0 && (
            <Slab b={b} gap={44}>
              <WordPlank
                text={words[vowelIdx]} size={92} seed={vowelIdx}
                tones={{ [words[vowelIdx].indexOf(vowels[vowelIdx])]: "amber" }}
              />
              <VowelLamp b={b} vowel={vowels[vowelIdx]} long={false} inline size={140} />
            </Slab>
          )}
          {k >= 19 && k <= 20 && (
            <Slab b={b} gap={16}>
              {["f", "l", "s", "z"].map((c) => <Brick key={c} ch={c} size={96} tone="teal" hot={hot(c)} />)}
              {k === 20 && ["c", "k", "p", "t"].map((c) => (
                <Wrong key={c} size={58}><Brick ch={c} size={76} tone="ghost" /></Wrong>
              ))}
            </Slab>
          )}
          {k === 22 && (
            <>
              <Crane b={b} hookX={b.width * 0.12} hookY={b.slabY - 200} carrying="l" />
              <Slab b={b}><WordPlank text="bell" size={96} tones={{ 2: "teal", 3: "teal" }} /></Slab>
            </>
          )}
        </>
      );
    }

    // ── 4 · more words, by crane ────────────────────────────────────────────
    case 3: {
      const list: [string, string][] = [["cliff", "f"], ["tall", "l"], ["grass", "s"], ["fizz", "z"], ["shell", "l"], ["dress", "s"]];
      const i = k >= 1 && k <= 6 ? k - 1 : -1;
      const cheer = k >= 8;
      return (
        <>
          <Sign b={b} text="RULE 1 · FLOSS" tone={SITE.teal} />
          {k === 0 && (
            <>
              <Crane b={b} hookX={b.width * 0.12} hookY={b.slabY - 230} carrying="?" />
              <Slab b={b} gap={72}>
                {list.map(([w], i) => (
                  <div key={w} style={{ opacity: 0.8 }}><WordPlank text={w} size={56} seed={i} pic={false} /></div>
                ))}
              </Slab>
            </>
          )}
          {i >= 0 && (
            <>
              <Crane b={b} hookX={b.width * 0.12} hookY={b.slabY - 230} carrying={list[i][1]} />
              <Slab b={b}>
                <WordPlank
                  text={list[i][0]} size={96} seed={i} picSize={205}
                  tones={{ [list[i][0].length - 2]: "teal", [list[i][0].length - 1]: "teal" }}
                />
              </Slab>
            </>
          )}
          {/* two words, two planks — side by side on one baseline they read as one word */}
          {k === 7 && (
            <Slab b={b} gap={90}>
              <WordPlank text="shell" size={78} tones={{ 3: "teal", 4: "teal" }} />
              <WordPlank text="dress" size={78} tones={{ 3: "teal", 4: "teal" }} seed={9} />
            </Slab>
          )}
          {cheer && (
            <>
              <Upper b={b} top={b.upperY - 60}><Hat cheer /></Upper>
              <Slab b={b} gap={72}>
                {list.map(([w], i) => (
                  <WordPlank key={w} text={w} size={54} seed={i} tones={{ [w.length - 2]: "teal", [w.length - 1]: "teal" }} picSize={150} />
                ))}
              </Slab>
            </>
          )}
          <Fixed b={b}><Confetti frame={frame} fps={fps} burstFrame={at(STARTS[3] + 8)} origin={{ x: b.width / 2, y: b.upperY }} colors={[SITE.amber, SITE.green, SITE.blue, SITE.teal]} /></Fixed>
        </>
      );
    }

    // ── 5 · why: the stretchy sounds ────────────────────────────────────────
    case 4: {
      const letters = ["f", "l", "s", "z"];
      const li = k >= 2 && k <= 5 ? k - 2 : -1;
      return (
        <>
          <Sign b={b} text="WHY DOUBLE?" tone={SITE.teal} />
          {k === 0 && <Slab b={b} gap={20}>{letters.map((c, i) => <Brick key={c} ch={c} size={96} tone="teal" seed={i} />)}</Slab>}
          {k === 1 && <Upper b={b}><SoundWave humps={1} label="listen" tone={SITE.teal} /></Upper>}
          {li >= 0 && <StretchBand b={b} letter={letters[li]} amount={1} />}
          {li >= 0 && <Slab b={b} gap={20}>{letters.map((c, i) => <Brick key={c} ch={c} size={86} tone={i === li ? "teal" : "ghost"} seed={i} />)}</Slab>}
          {/* "Did you notice?" — the thing to notice must be ON SCREEN */}
          {k === 6 && (
            <Slab b={b} gap={26}>
              {letters.map((c, i) => <Brick key={c} ch={c.repeat(4)} size={80} tone="teal" seed={i} />)}
            </Slab>
          )}
          {k === 6 && <Upper b={b} top={b.slabY - 200}><Magnifier size={116} /></Upper>}
          {k === 7 && <Upper b={b} gap={16}>{letters.map((c, i) => <Brick key={c} ch={c.repeat(5)} size={72} tone="teal" seed={i} />)}</Upper>}
          {k === 8 && <Slab b={b}><WordPlank text="bell" size={96} tones={{ 2: "teal", 3: "teal" }} /></Slab>}
          {k === 9 && (
            <Slab b={b} gap={34}>
              <WordPlank text="bell" size={96} tones={{ 1: "amber", 2: "teal", 3: "teal" }} />
              <VowelLamp b={b} vowel="e" long={false} inline size={140} />
              <Bubble text="short!" tone={SITE.amber} />
            </Slab>
          )}
          {k === 10 && (
            <Slab b={b} gap={70}>
              <Wrong size={76}>
                <div style={{ opacity: 0.85 }}><Plank gap={6}><Word text="bel" size={84} tones={{ 1: "blue" }} /></Plank></div>
              </Wrong>
              <WordPlank text="bell" size={84} tones={{ 1: "amber", 2: "teal", 3: "teal" }} seed={4} />
            </Slab>
          )}
          {/* "So remember this." — was a bare frame; now the whole claim is shown at once */}
          {k === 11 && (
            <Slab b={b} gap={40}>
              <WordPlank text="bell" size={100} tones={{ 1: "amber", 2: "teal", 3: "teal" }} />
              <VowelLamp b={b} vowel="e" long={false} inline size={150} />
            </Slab>
          )}
          {k === 12 && <VowelLamp b={b} vowel="e" long={false} y={b.bandA} />}
          {k === 13 && <Slab b={b} gap={12}><Brick ch="l" size={104} tone="teal" /><Brick ch="l" size={104} tone="teal" seed={2} /></Slab>}
          {k === 14 && (
            <Slab b={b} gap={10}>
              <Brick ch="e" size={96} tone="amber" />
              <div style={{ width: 60, height: 22, borderRadius: 11, background: SITE.steel }} />
              <Brick ch="l" size={96} tone="teal" />
              <Brick ch="l" size={96} tone="teal" seed={2} />
            </Slab>
          )}
        </>
      );
    }

    // ── 6 · the long-vowel side ─────────────────────────────────────────────
    case 5: {
      const words = ["leaf", "feel", "tool", "pool", "sail"];
      const built = k >= 1 && k <= 5 ? k : k > 5 ? 5 : 0;
      const li = k >= 7 && k <= 9 ? k - 7 : -1;
      // the letter each word's long vowel actually NAMES — tool/pool are absent on purpose:
      // oo says /uː/, it does not say the name of a letter, and claiming it would be a lie
      const names: Record<string, string> = { leaf: "E", feel: "E", sail: "A" };
      // every one of these words has its long vowel in positions 1–2
      const teamTones = (w: string, endings: boolean): Record<number, BrickTone> => ({
        1: "blue", 2: "blue", ...(endings ? { [w.length - 1]: "teal" } : {}),
      });
      return (
        <>
          <Sign b={b} text="LONG VOWEL → NO DOUBLE" tone={SITE.blue} />
          {k === 0 && (
            <Slab b={b} gap={30}>
              <VowelLamp b={b} vowel="e" long inline size={140} />
              {[0, 1, 2, 3, 4].map((n) => <Socket key={n} size={72} />)}
            </Slab>
          )}
          {li >= 0 && <VowelLamp b={b} vowel={["ea", "ee", "oo"][li]} long y={b.bandA} />}
          {k === 10 && <VowelLamp b={b} vowel="ee" long y={b.bandA} />}
          {built > 0 && k <= 15 && (
            <Slab b={b} gap={78}>
              {words.slice(0, built).map((w, i) => (
                <div key={w} style={{ opacity: li < 0 || li === i ? 1 : 0.32 }}>
                  <WordPlank text={w} size={64} seed={i * 2} picSize={180} tones={teamTones(w, k >= 12)} />
                </div>
              ))}
            </Slab>
          )}
          {/* only the three words whose vowel really says a letter name make that claim */}
          {k === 11 && (
            <Upper b={b} gap={40}>
              {["leaf", "feel", "sail"].map((w, i) => (
                <div key={w} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <Bubble text={names[w]} tone={SITE.blue} size={34} />
                  <Word text={w} size={54} tones={{ 1: "blue", 2: "blue" }} seed={i} />
                </div>
              ))}
            </Upper>
          )}
          {k === 12 && <Upper b={b} top={b.slabY - 200}><Magnifier size={112} /></Upper>}
          {k === 13 && <Slab b={b} gap={22}><Brick ch="1" size={92} tone="blue" /><Brick ch="f" size={92} tone="blue" /></Slab>}
          {k === 14 && <Slab b={b} gap={22}><Brick ch="1" size={92} tone="blue" /><Brick ch="l" size={92} tone="blue" /></Slab>}
          {k === 15 && (
            <Slab b={b} gap={18}>
              <Wrong size={84}>
                <div style={{ display: "flex", gap: 10 }}>
                  <Brick ch="l" size={92} tone="ghost" /><Brick ch="l" size={92} tone="ghost" seed={2} />
                </div>
              </Wrong>
            </Slab>
          )}
          {k === 16 && (
            <Slab b={b} gap={30}>
              <VowelLamp b={b} vowel="e" long={false} y={b.upperY + 20} />
              <div style={{ ...HEAD, fontSize: 60 }}>?</div>
            </Slab>
          )}
          {k === 17 && <VowelLamp b={b} vowel="e" long={false} y={b.bandA} />}
          {k === 18 && <Slab b={b} gap={12}><Brick ch="l" size={100} tone="teal" /><Brick ch="l" size={100} tone="teal" seed={2} /></Slab>}
          {k === 19 && <VowelLamp b={b} vowel="e" long y={b.bandA} />}
          {k === 20 && (
            <Slab b={b} gap={18}>
              <Brick ch="l" size={100} tone="blue" />
              <Wrong size={78}><Brick ch="l" size={100} tone="ghost" seed={2} /></Wrong>
            </Slab>
          )}
          {k === 21 && (
            <Slab b={b} gap={20}>
              <Magnifier size={96} />
              <WordPlank text="leaf" size={84} tones={{ 1: "blue", 2: "blue" }} />
            </Slab>
          )}
          {/* the counter-examples are filed in the SKIP, never on the rule wall */}
          {k >= 1 && <Skip b={b} tossed={words.slice(0, built)} from={at(STARTS[5] + 1)} label="NO DOUBLE"  />}
        </>
      );
    }

    // ── 7 · the three traps ─────────────────────────────────────────────────
    case 6: {
      const active = k >= 26 ? 3 : k >= 7 ? 2 : k >= 1 ? 1 : 0;
      const claps = k === 12 ? 1 : k === 13 || k === 14 ? 2 : k === 18 ? 1 : k >= 19 && k <= 20 ? 2 : 0;
      const longWord = k >= 10 && k <= 16 ? "travel" : k >= 17 && k <= 21 ? "pencil" : null;
      return (
        <>
          <WarningTape b={b} />
          <Sign b={b} text={`TRAP ${Math.max(1, active)}`} tone={SITE.red} />
          <Stage b={b} top={b.bandA} gap={110}>
            {[1, 2, 3].map((n) => <Cone key={n} n={n} active={active === n} />)}
          </Stage>
          {k === 0 && <Slab b={b} gap={40}>{[1, 2, 3].map((n) => <Socket key={n} size={84} label={String(n)} />)}</Slab>}
          {k === 1 && (
            <Slab b={b} gap={16}>
              {["f", "l", "s", "z"].map((c, i) => <Brick key={c} ch={c} size={92} tone="teal" seed={i} />)}
            </Slab>
          )}
          {k === 26 && (
            <Slab b={b} gap={30}>
              <WordPlank text="bee" size={92} tones={{ 1: "blue", 2: "blue" }} picSize={180} />
            </Slab>
          )}
          {k >= 2 && k <= 6 && (
            <Slab b={b} gap={16}>
              {["f", "l", "s", "z"].map((c) => <Brick key={c} ch={c} size={92} tone="teal" hot={hot(c)} />)}
              {k >= 3 && ["c", "k", "p", "t"].slice(0, k - 2).map((c) => (
                <Wrong key={c} size={58}><Brick ch={c} size={78} tone="red" /></Wrong>
              ))}
            </Slab>
          )}
          {k === 7 && (
            <Slab b={b} gap={78}>
              <WordPlank text="travel" size={64} seed={1} />
              <WordPlank text="pencil" size={64} seed={2} />
            </Slab>
          )}
          {k === 8 && <Slab b={b} gap={70}><WordPic word="travel" size={190} /><WordPic word="pencil" size={170} seed={3} /></Slab>}
          {k === 9 && <Upper b={b}><SoundWave humps={2} label="listen" tone={SITE.red} /></Upper>}
          {longWord && (() => {
            // a two-clap word is SHOWN in two pieces. Printed solid, "travel" gives the
            // child nothing to count — split, the two claps and the two chunks match.
            const [a, z] = longWord === "travel" ? ["tra", "vel"] : ["pen", "cil"];
            const lit = k === 12 || k === 18 ? 0 : k === 13 || k === 14 || k === 19 || k === 20 ? 1 : -1;
            const keepOne = k === 16 || k === 21;
            const part = (txt: string, on: boolean, tones: Record<number, BrickTone>, seed: number) => (
              <div style={{ display: "flex", gap: 6, opacity: on ? 1 : 0.42, transform: `scale(${on && lit >= 0 ? 1.06 : 1})` }}>
                <Word text={txt} size={88} tones={tones} seed={seed} />
              </div>
            );
            return (
              <Slab b={b} gap={44}>
                <Plank pic={longWord} picSize={176} gap={0}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 30 }}>
                    {part(a, lit !== 1, {}, 0)}
                    <div style={{ ...HEAD, fontSize: 62, color: SITE.steel, paddingBottom: 14 }}>-</div>
                    {part(z, lit !== 0, keepOne ? { [z.length - 1]: "blue" } : {}, 7)}
                  </div>
                </Plank>
                {claps > 0 && <ClapMeter b={b} claps={2} lit={claps} inline />}
              </Slab>
            );
          })()}
          {claps > 0 && !longWord && <Slab b={b}><ClapMeter b={b} claps={2} lit={claps} inline /></Slab>}
          {k >= 22 && k <= 25 && (
            <Slab b={b} gap={90}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: k <= 23 ? 1 : 0.32 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ width: 78, height: 24, borderRadius: 12, background: SITE.amber, border: "3px solid #B26A00" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}><Brick ch="l" size={72} tone="teal" /><Brick ch="l" size={72} tone="teal" seed={2} /></div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: k >= 24 ? 1 : 0.32 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  {[0, 1].map((i) => <div key={i} style={{ width: 78, height: 24, borderRadius: 12, background: SITE.blue, border: "3px solid #0D3F7A" }} />)}
                </div>
                <Brick ch="l" size={72} tone="blue" seed={5} />
              </div>
            </Slab>
          )}
          {k >= 27 && (
            <Slab b={b} gap={26}>
              <WordPlank text="bee" size={92} tones={k >= 29 ? { 1: "blue", 2: "blue" } : {}} />
              {k >= 30 && (
                <Wrong size={70}><Brick ch="ee" size={88} tone="ghost" joined /></Wrong>
              )}
            </Slab>
          )}
          {k === 31 && <Upper b={b} gap={14} top={b.upperY + 130}>{["f", "l", "s", "z"].map((c) => <Brick key={c} ch={c} size={72} tone="teal" hot={hot(c)} />)}</Upper>}
        </>
      );
    }

    // ── 8 · FLOSS follows its own rule ──────────────────────────────────────
    case 7: {
      // "A short o" — the o is index 2 of f-l-o-s-s. It used to light the l.
      const tones: Record<number, BrickTone> =
        k >= 4 ? { 2: "amber", 3: "teal", 4: "teal" } : k >= 3 ? { 2: "amber" } : {};
      return (
        <>
          <Sign b={b} text="REMEMBER IT" tone={SITE.teal} />
          <Stage b={b} top={b.bandA} gap={18}>
            <RuleCard n={1} text="one clap" on={k >= 2} tick={k >= 2} icon={"\u{1F44F}"} stack />
            <RuleCard n={2} text="short o" on={k >= 3} tick={k >= 3} icon={"\u{1F50A}"} stack />
            <RuleCard n={3} text="double s" on={k >= 4} tick={k >= 4} icon={"\u{1F9F1}"} stack />
          </Stage>
          <Slab b={b}>
            <WordPlank text="floss" size={110} tones={tones} picSize={150} />
          </Slab>
          
        </>
      );
    }

    // ── 9 · the /k/ question ────────────────────────────────────────────────
    case 8: {
      return (
        <>
          <Sign b={b} text="RULE 2 · C · K · CK" tone={SITE.orange} />
          {k === 0 && (
            <>
              <Upper b={b} top={b.upperY + 20}><SoundWave humps={1} label="/k/" /></Upper>
              <Slab b={b} gap={20}>
                <Socket size={104} label="?" /><Socket size={104} label="?" /><Socket size={104} label="?" />
              </Slab>
            </>
          )}
          {k >= 1 && k <= 2 && <Upper b={b}><SoundWave humps={1} label="/k/" /></Upper>}
          {k === 2 && <Slab b={b} gap={26}><Brick ch="c" size={100} tone="ghost" /><Brick ch="k" size={100} tone="ghost" /><Brick ch="ck" size={100} tone="ghost" joined /></Slab>}
          {k >= 3 && k <= 6 && (
            <Slab b={b} gap={34}>
              <Brick ch="c" size={110} tone={k >= 4 ? "orange" : "plain"} hot={hot("c")} />
              <Brick ch="k" size={110} tone={k >= 5 ? "orange" : "plain"} hot={hot("k")} />
              <Brick ch="ck" size={110} tone={k >= 6 ? "orange" : "plain"} joined />
            </Slab>
          )}
          {k >= 7 && k <= 8 && (
            <>
              <Crane b={b} hookX={b.width * 0.12} hookY={b.upperY + 30} carrying="?" />
              <Slab b={b} gap={26}>
                <Brick ch="c" size={96} tone="orange" /><Brick ch="k" size={96} tone="orange" /><Brick ch="ck" size={96} tone="orange" joined />
              </Slab>
            </>
          )}
          {/* the two things the rule depends on — each shown, then both together */}
          {k === 9 && (
            <Slab b={b} gap={40}>
              <Socket size={96} label="1" /><Socket size={96} label="2" />
            </Slab>
          )}
          {k === 10 && (
            <Slab b={b} gap={12}>
              <Brick ch="c" size={92} tone="orange" /><Brick ch="a" size={80} tone="ghost" /><Brick ch="t" size={80} tone="ghost" />
              <div style={{ width: 40 }} />
              <Brick ch="d" size={80} tone="ghost" /><Brick ch="u" size={80} tone="ghost" /><Brick ch="ck" size={92} tone="orange" joined />
            </Slab>
          )}
          {k === 11 && (
            <Slab b={b} gap={12}>
              <Brick ch="c" size={92} tone="orange" />
              <Brick ch="a" size={92} tone="amber" />
              <Brick ch="t" size={80} tone="ghost" />
            </Slab>
          )}
          {k === 12 && (
            <>
              <Slab b={b} gap={40}>
                <Plank gap={6}><Word text="cat" size={72} tones={{ 0: "orange", 1: "amber" }} /></Plank>
                <Plank gap={6}><Word text="duck" size={72} joinLast2 tones={{ 1: "amber" }} seed={4} /></Plank>
              </Slab>
              <Stage b={b} gap={28}>
                <RuleCard n={1} text="where in the word" on w={470} icon={"\u{1F4CD}"} />
                <RuleCard n={2} text="what comes next" on w={430} icon={"\u{27A1}"} />
              </Stage>
            </>
          )}
        </>
      );
    }

    // ── 10 · use C ──────────────────────────────────────────────────────────
    case 9: {
      const words = ["cat", "cup", "cod", "cot", "cab", "cut"];
      const single = k === 3 || k === 4 ? 0 : k === 5 || k === 6 ? 1 : k >= 8 && k <= 11 ? k - 6 : -1;
      return (
        <>
          <Sign b={b} text="USE C — before a · o · u" tone={SITE.blue} />
          {k === 0 && <Slab b={b}><Brick ch="c" size={150} tone="blue" /></Slab>}
          {k >= 1 && k <= 2 && (
            <Upper b={b} gap={18} top={b.upperY + 40}>
              <Brick ch="c" size={124} tone="blue" />
              {["a", "o", "u"].map((c) => <Brick key={c} ch={c} size={96} tone="amber" hot={hot(c)} />)}
            </Upper>
          )}
          {k === 2 && <Slab b={b}><SoundWave humps={1} label="/k/" /></Slab>}
          {single >= 0 && (
            <Slab b={b}>
              <WordPlank
                text={words[single]} size={104} seed={single} picSize={205}
                tones={{ 0: "blue", 1: (k === 4 || k === 6) ? "amber" : "plain" }}
              />
            </Slab>
          )}
          {/* the opener of the second half used to be an empty stage */}
          {k === 7 && (
            <>
              <Crane b={b} hookX={b.width * 0.12} hookY={b.slabY - 230} carrying="c" />
              <Slab b={b} gap={78}>
                {["cod", "cot", "cab", "cut"].map((w, i) => (
                  <div key={w} style={{ opacity: 0.8 }}><WordPlank text={w} size={62} seed={i} /></div>
                ))}
              </Slab>
            </>
          )}
          {k === 12 && (
            <Slab b={b} gap={72}>
              {words.map((w, i) => (
                <Plank key={w} gap={4} pic={w} picSize={150} seed={i}>
                  <Word text={w} size={54} tones={{ 0: "blue", 1: "amber" }} seed={i} />
                </Plank>
              ))}
            </Slab>
          )}
        </>
      );
    }

    // ── 11 · before e and i ─────────────────────────────────────────────────
    case 10: {
      const kw = ["key", "kit", "king"];
      const ki = k >= 7 && k <= 9 ? k - 7 : -1;
      return (
        <>
          <WarningTape b={b} />
          <Sign b={b} text="SPECIAL RULE" tone={SITE.red} />
          {k === 0 && <Slab b={b} gap={22}><Brick ch="c" size={130} tone="orange" /><div style={{ ...HEAD, fontSize: 60 }}>+</div><Brick ch="e" size={104} tone="amber" /><Brick ch="i" size={104} tone="amber" /></Slab>}
          {/* C meeting E or I goes soft, and you SEE the hiss come out of it */}
          {k >= 1 && k <= 2 && (
            <>
              <Slab b={b} gap={22}>
                <Brick ch="c" size={130} tone="red" hot={hot("c")} />
                <Brick ch="e" size={104} tone="amber" hot={hot("e")} />
                <Brick ch="i" size={104} tone="amber" hot={hot("i")} />
              </Slab>
              <Upper b={b} top={b.upperY + 20}><SoundWave humps={1} label="/sss/" tone={SITE.red} /></Upper>
            </>
          )}
          {k >= 3 && k <= 4 && (
            <>
              <Slab b={b} gap={26}>
                <WordPlank text="city" size={100} tones={{ 0: k === 4 ? "red" : "plain" }} />
              </Slab>
              {k === 4 && (
                <Upper b={b} gap={40} top={b.upperY + 10}>
                  <SoundWave humps={1} label="/sss/" tone={SITE.red} />
                  <Wrong size={82}><SoundWave humps={1} label="/k/ /k/" tone={SITE.steel} /></Wrong>
                </Upper>
              )}
            </>
          )}
          {k >= 5 && k <= 6 && (
            <Slab b={b} gap={26}>
              {k === 5
                ? <Wrong size={76}><Brick ch="c" size={104} tone="ghost" /></Wrong>
                : <Brick ch="c" size={104} tone="ghost" />}
              <div style={{ ...HEAD, fontSize: 60 }}>→</div>
              {k === 5 ? <Socket size={104} label="?" /> : <Brick ch="k" size={104} tone="orange" />}
              <Brick ch="e" size={88} tone="amber" /><Brick ch="i" size={88} tone="amber" />
            </Slab>
          )}
          {ki >= 0 && <Slab b={b}><WordPlank text={kw[ki]} size={104} seed={ki} picSize={205} tones={{ 0: "orange", 1: "amber" }} /></Slab>}
          {k >= 10 && (
            <Slab b={b} gap={70}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: k >= 11 ? 1 : 0.62 }}>
                <Brick ch="c" size={88} tone="blue" />
                {["a", "o", "u"].map((c) => <Brick key={c} ch={c} size={72} tone="amber" hot={hot(c)} />)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: k >= 12 ? 1 : 0.62 }}>
                <Brick ch="k" size={88} tone="orange" />
                {["e", "i"].map((c) => <Brick key={c} ch={c} size={72} tone="amber" hot={hot(c)} />)}
              </div>
            </Slab>
          )}
        </>
      );
    }

    // ── 12 · use CK ─────────────────────────────────────────────────────────
    case 11: {
      const words = ["duck", "back", "kick", "rock", "luck", "pack", "sock", "block", "check", "thick"];
      const wi = k >= 6 && k <= 15 ? k - 6 : -1;
      return (
        <>
          <Sign b={b} text="USE CK — end, after a short vowel" tone={SITE.orange} />
          {k <= 1 && <Slab b={b}><Brick ch="ck" size={150} tone="orange" joined /></Slab>}
          {k === 2 && (
            <Slab b={b} gap={10}>
              <Brick ch="d" size={92} /><Brick ch="u" size={92} seed={1} />
              <Socket size={110} label="?" />
            </Slab>
          )}
          {k === 3 && (
            <Slab b={b} gap={34}>
              <div style={{ display: "flex", gap: 10 }}>
                <Brick ch="d" size={92} /><Brick ch="u" size={92} tone="amber" seed={1} />
                <Socket size={104} label="?" />
              </div>
              <VowelLamp b={b} vowel="u" long={false} inline size={132} />
            </Slab>
          )}
          {k >= 4 && k <= 5 && (
            <Slab b={b} gap={10}>
              <Brick ch="d" size={84} tone="ghost" /><Brick ch="u" size={92} tone="amber" />
              <Brick ch="ck" size={104} tone="orange" joined />
            </Slab>
          )}
          {wi >= 0 && (
            <Slab b={b}>
              <WordPlank text={words[wi]} size={104} joinLast2 seed={wi} picSize={205} tones={{ [words[wi].length - 3]: "amber" }} />
            </Slab>
          )}
          {k >= 16 && k <= 17 && (
            <Slab b={b} gap={72}>
              {words.map((w, i) => (
                <Plank key={w} gap={4} pic={w} picSize={130} seed={i}>
                  <Word text={w} size={50} joinLast2 tones={k >= 17 ? { [w.length - 3]: "amber" } : {}} seed={i} />
                </Plank>
              ))}
            </Slab>
          )}
          {k >= 18 && (
            <>
              <Slab b={b}><Brick ch="ck" size={130} tone="orange" joined /></Slab>
              <Stage b={b} gap={40} wrap>
                {words.map((w, i) => (
                  <Plank key={w} gap={4} seed={i}>
                    <Word text={w} size={46} joinLast2 seed={i} />
                  </Plank>
                ))}
              </Stage>
            </>
          )}
        </>
      );
    }

    // ── 13 · two letters, one sound ─────────────────────────────────────────
    case 12: {
      return (
        <>
          <Sign b={b} text="TWO LETTERS · ONE SOUND" tone={SITE.orange} />
          {k === 0 && <Slab b={b}><Brick ch="ck" size={150} tone="orange" joined /></Slab>}
          {k >= 1 && k <= 2 && (
            <Upper b={b} gap={40} top={b.upperY + 30}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", gap: 8 }}><Brick ch="c" size={92} tone="orange" /><Brick ch="k" size={92} tone="orange" seed={2} /></div>
                <div style={{ display: "flex", gap: 10 }}>{[0, 1].map((i) => <div key={i} style={{ width: 34, height: 34, borderRadius: "50%", background: SITE.orange }} />)}</div>
              </div>
              {k === 2 && <SoundWave humps={1} label="1 sound" />}
            </Upper>
          )}
          {k >= 3 && k <= 4 && (
            <Upper b={b} top={b.upperY + 30}>
              <Wrong size={88}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <div style={{ display: "flex", gap: 14 }}>
                    <Brick ch="/k/" size={78} tone="red" /><Brick ch="/k/" size={78} tone="red" seed={2} />
                  </div>
                  <SoundWave humps={2} tone={SITE.red} />
                </div>
              </Wrong>
            </Upper>
          )}
          {k === 5 && <Upper b={b} top={b.upperY + 30}><SoundWave humps={1} label="just /k/" /></Upper>}
          {k >= 6 && k <= 9 && (
            <>
              <Slab b={b}><WordPlank text="duck" size={110} joinLast2 tones={{ 1: k >= 8 ? "amber" : "plain" }} /></Slab>
              {k >= 9 && <Upper b={b} top={b.upperY + 20}><SoundWave humps={1} label="/k/" /></Upper>}
            </>
          )}
          {k >= 10 && (
            <Upper b={b} gap={30} top={b.upperY + 30}>
              <div style={{ display: "flex", gap: 8 }}><Brick ch="c" size={100} tone="orange" /><Brick ch="k" size={100} tone="orange" seed={2} /></div>
              {k >= 11 && <div style={{ ...HEAD, fontSize: 60 }}>→</div>}
              {k >= 11 && <SoundWave humps={1} />}
            </Upper>
          )}
        </>
      );
    }

    // ── 14 · the skip: wrong spellings ──────────────────────────────────────
    case 13: {
      const tossed = k >= 4 ? ["dukk"] : [];
      if (k >= 6) tossed.push("ducc");
      if (k >= 8) tossed.push("duk");
      // the card STAYS while the line says "is wrong" — it used to vanish, leaving the
      // stage empty exactly when the child is told what the mistake was
      const showing = k === 1 || k === 2 ? "duck"
        : k === 3 || k === 4 ? "dukk"
        : k === 5 || k === 6 ? "ducc"
        : k === 7 || k === 8 ? "duk" : null;
      return (
        <>
          <Sign b={b} text="COMMON MISTAKES" tone={SITE.red} />
          <Skip b={b} tossed={tossed} from={at(STARTS[13] + 4)}  />
          {k === 0 && <Slab b={b} gap={24}><WordPlank text="duck" size={100} joinLast2 /></Slab>}
          {showing && (
            <Slab b={b} gap={26}>
              {(k === 4 || k === 6 || k === 8) ? (
                <Wrong size={86}>
                  <Word text={showing} size={100} tones={{ 2: "red", 3: "red" }} />
                </Wrong>
              ) : (
                <Plank gap={6} pic={showing === "duck" ? "duck" : undefined} picSize={195}>
                  <Word text={showing} size={100} joinLast2={showing === "duck"} tones={showing === "duck" ? {} : { 2: "red", 3: "red" }} />
                </Plank>
              )}
              {k === 2 && <div style={{ width: 78, height: 78, borderRadius: 16, background: SITE.green, color: "#fff", ...HEAD, fontSize: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>}

            </Slab>
          )}
          {k >= 9 && k <= 10 && (
            <Upper b={b} gap={40} top={b.upperY + 40}>
              <div style={{ opacity: k === 9 ? 1 : 0.35 }}>
                <Wrong size={82}><Brick ch="cc" size={110} tone="red" joined /></Wrong>
              </div>
              <div style={{ opacity: k === 10 ? 1 : 0.35 }}>
                <Wrong size={82}><Brick ch="kk" size={110} tone="red" joined /></Wrong>
              </div>
            </Upper>
          )}
          {k >= 11 && (
            <Slab b={b} gap={80}>
              <div style={{ opacity: k === 11 || k === 12 ? 1 : 0.4 }}>
                <WordPlank text="cat" size={88} picSize={210} tones={{ 0: "green" }} />
              </div>
              {k >= 13 && (
                <Wrong size={82}>
                  <Plank gap={6}><Word text="kat" size={88} tones={{ 0: "red" }} seed={4} /></Plank>
                </Wrong>
              )}
            </Slab>
          )}
        </>
      );
    }

    // ── 15 · the duck ───────────────────────────────────────────────────────
    case 14: {
      return (
        <>
          <Sign b={b} text="REMEMBER IT" tone={SITE.orange} />
          {k === 0 && (
            <Slab b={b} gap={30}>
              <WordPic word="duck" size={150} />
              <Brick ch="ck" size={110} tone="orange" joined />
            </Slab>
          )}
          {k === 1 && (
            <Slab b={b} gap={34}>
              <div style={{ display: "flex", gap: 10 }}>
                <Brick ch="d" size={92} /><Brick ch="u" size={96} tone="amber" seed={1} /><Socket size={104} label="?" />
              </div>
              <VowelLamp b={b} vowel="u" long={false} inline size={132} />
            </Slab>
          )}
          {k === 2 && (
            <Slab b={b} gap={10}>
              <Brick ch="d" size={88} tone="ghost" /><Brick ch="u" size={96} tone="amber" /><Brick ch="ck" size={110} tone="orange" joined />
            </Slab>
          )}
          {k >= 3 && (
            <Slab b={b} gap={30}>
              <WordPic word="duck" size={190} />
              {k >= 4 && <Word text="duck" size={104} joinLast2 tones={{ 1: "amber" }} />}
              {k >= 5 && <Bubble text="Quack!" tone={SITE.orange} size={44} />}
            </Slab>
          )}
          <Fixed b={b}><Confetti frame={frame} fps={fps} burstFrame={at(STARTS[14] + 5)} origin={{ x: b.width / 2, y: b.slabY - 60 }} colors={[SITE.orange, SITE.amber, SITE.green]} /></Fixed>
        </>
      );
    }

    // ── 16 · recap and close ────────────────────────────────────────────────
    default: {
      const done = k >= 10 ? [0, 1] : [];
      const lit = k >= 12 ? [2, 3, 4, 5] : k >= 6 ? [1] : k >= 1 ? [0] : [0, 1];
      return (
        <>
          <Sign b={b} text={k >= 12 ? "PART 2 NEXT" : "TODAY'S TWO RULES"} tone={k >= 12 ? SITE.blue : SITE.green} />
          <Blueprints b={b} shown={6} lit={lit} done={done} compact />
          {k === 0 && <Slab b={b} gap={50}><WordPic word="floss" size={140} /><WordPic word="key" size={140} seed={2} /></Slab>}
          {k === 1 && <Slab b={b}><WordPic word="floss" size={170} /></Slab>}
          {k >= 2 && k <= 5 && (
            <Slab b={b} gap={18}>
              <RuleCard n={1} text="one clap" on tick={k >= 2} w={230} compact />
              <RuleCard n={2} text="short vowel" on={k >= 3} tick={k >= 3} w={265} compact />
              <RuleCard n={3} text="f · l · s · z" on={k >= 4} tick={k >= 4} w={265} compact />
            </Slab>
          )}
          {k >= 7 && k <= 9 && (
            <Slab b={b} gap={18}>
              <RuleCard text="c → a o u" on tick={k >= 7} w={240} compact />
              <RuleCard text="k → e i" on={k >= 8} tick={k >= 8} w={215} compact />
              <RuleCard text="ck → end" on={k >= 9} tick={k >= 9} w={240} compact />
            </Slab>
          )}
          {k >= 10 && k <= 11 && <Slab b={b} gap={26}><Hat cheer /><WordPic word="duck" size={130} /></Slab>}
          {k >= 12 && k <= 13 && <Slab b={b}><Crate text="PART 2" size={230} /></Slab>}
          {k === 14 && <Slab b={b} gap={26}><Chip text={"\u{1F44D} Like"} tone={SITE.blue} size={40} /><Chip text={"\u{1F514} Subscribe"} tone={SITE.red} size={40} /></Slab>}
          <Fixed b={b}><Confetti frame={frame} fps={fps} burstFrame={at(STARTS[15] + 10)} origin={{ x: b.width / 2, y: b.upperY + 80 }} colors={[SITE.green, SITE.amber, SITE.blue, SITE.orange]} /></Fixed>
        </>
      );
    }
  }
};

// ── the reel ─────────────────────────────────────────────────────────────────

export const L5RulesP1Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const b = bands(width, height);

  const idx = phraseAt(frame);
  const s = sectionOf(idx);
  const k = idx - STARTS[s];
  const storeFrom = f(P[STARTS[15] + 15].start);

  // Only the rule being taught is on the wall. A cumulative stack made Rule 1's words
  // look like examples of Rule 2, and grew tall enough to reach the logo.
  const g1 = { title: "RULE 1 · FLOSS", tone: SITE.teal, words: upTo(RULE1, idx) };
  const g2 = { title: "RULE 2 · C·K·CK", tone: SITE.orange, words: upTo(RULE2, idx) };
  const recap = s === 15;

  return (
    <AbsoluteFill>
      <SiteWorld />

      <Sequence from={0} durationInFrames={f(TOTAL) + 20}>
        <Audio src={staticFile("audio/l5_rules_p1_16x9/l5_rules_p1_16x9.mp3")} />
      </Sequence>

      {SFX.map((c, i) => (
        <Sequence key={`${c.file}-${c.i}-${i}`} from={c.frame} durationInFrames={45}>
          <Audio src={staticFile(`sfx/${c.file}.mp3`)} volume={c.vol} />
        </Sequence>
      ))}

      {recap && b.aspect === "16x9" ? (
        <>
          {/* the summary is the one place both belong — one rule down each side */}
          <WordWall b={b} groups={[g1]} side="left" />
          <WordWall b={b} groups={[g2]} side="right" />
        </>
      ) : (
        // PORTRAIT has one strip, not two columns, so the recap must pass BOTH groups to
        // it — rendering two walls put them at the same y, exactly on top of each other.
        <WordWall b={b} groups={recap ? [g1, g2] : [s >= 8 ? g2 : g1]} />
      )}
      <Content b={b}>
        <Scene idx={idx} k={k} s={s} b={b} />
      </Content>

      {frame < storeFrom && <Captions track={TRACK} />}
      <Watermark corner="tr" widthFrac={0.085} pad={62} />

      {/* the CTA is in the teacher's own take, so the card is silent */}
      <Sequence from={storeFrom}>
        <AbsoluteFill style={{ background: "rgba(20, 30, 40, 0.55)" }} />
        <StoreOutro silent total={L5_P1_DURATION - storeFrom} ctaBg={SITE.teal} titleColor="#FFFFFF" />
      </Sequence>
    </AbsoluteFill>
  );
};
