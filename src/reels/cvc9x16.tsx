import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  AUDIO_SEC, CAPS, CLIPS, CVC15_DURATION, DOWNLOAD_FROM, GROUP_WORDS, MARKS, run,
} from "../data/cvc15";
import { Clip, PIC } from "../data/cvc";
import { GROUPS, WordPicture } from "../components/SandwichShop";
/** the app's own group badge: each emoji starts with its vowel */
const BADGE: Record<string, string> = Object.fromEntries(GROUPS.map((g) => [g.key, g.emoji]));
import { bands9, BlendedDrink, CONSONANT, LetterCup, SmoothieWorld, VOWEL } from "../components/SmoothieBar";
import { Captions } from "../components/Captions";
import { makeTrack, TPhrase } from "../lib/timing";
import { StoreOutro } from "../components/StoreOutro";
import { Watermark } from "../components/Watermark";
import { font, palette } from "../data/tokens";
import { bob, pulse } from "../lib/motion";
import { Confetti } from "../components/Confetti";

// ── L4 · CVC Words — 9:16, THE SMOOTHIE BAR ─────────────────────────────────
// A different world, because every video wears its own — and this one is chosen for the
// word it teaches. Three fruits go into the jar and come out as ONE drink; that is what
// c-a-t does. The jar is tall, so the vertical frame is the machine rather than a crop.
//
// Same cue discipline as the 16:9: every visual change is pinned to the caption line that
// speaks it, and the timeline's absolute clip starts mean a cue is never a guess.
const FPS = 30;
const CAPTIONS = makeTrack(CAPS as unknown as TPhrase[], AUDIO_SEC);
const f = (s: number) => Math.round(s * FPS);
const P = (i: number) => f(CAPS[i].start);
const HOLD_IN = 26;
const DL_FROM = DOWNLOAD_FROM;
// "Ready? Let's do." then "First vowel — aaa." — the idea section must hand the stage to
// <VowelCard/> on the SAME frame the card appears, not 20 frames earlier. That gap was
// the misalignment: the grid left, and nothing arrived until the card sprang in.
const IDEA_END = f(CAPS[13].start) - 6;

interface Build { word: string; sounds: Clip[]; wordClip: Clip; from: number; to: number }
const BUILDS: Build[] = (() => {
  const out: Build[] = [];
  let pending: Clip[] = [];
  let prevEnd = 0;
  let prevRunStart = 0;
  for (const c of CLIPS) {
    if (c.kind === "sound") pending.push(c);
    else if (c.kind === "word") {
      const firstSound = pending[0]?.start ?? c.start;
      // the child's turn — and only that — pulls the cups onto the rail before the
      // silence, so they are waiting while the child is told to sound them out. The
      // threshold must sit above the after-word gap or EVERY build takes this branch.
      const runway = firstSound - prevEnd;
      out.push({
        word: c.word!, sounds: pending, wordClip: c,
        from: out.length === 0 ? 0 : runway > 2.3 ? f(prevRunStart) + 20 : f(firstSound) - 12,
        to: f(c.start + c.dur),
      });
      pending = [];
      prevEnd = c.start + c.dur;
    } else if (c.kind === "run") {
      if (pending.length) {
        const last = pending[pending.length - 1];
        out.push({ word: pending[0].word!, sounds: pending, wordClip: null as unknown as Clip,
                   from: f(pending[0].start) - HOLD_IN, to: f(last.start + last.dur) });
        pending = [];
      }
      prevEnd = c.start + c.dur;
      prevRunStart = c.start;
    }
  }
  return out;
})();

const buildAt = (frame: number): Build | null => {
  let cur: Build | null = null;
  for (const b of BUILDS) if (frame >= b.from) cur = b;
  return cur;
};

const inGroups = (frame: number) => frame >= f(MARKS.shortA) && frame < f(MARKS.wall);
const inQuiz = (frame: number) => frame >= f(MARKS.quiz);
const groupIndexAt = (frame: number): number => {
  let idx = -1;
  GROUPS.forEach((g, i) => { if (frame >= f(MARKS[g.key] ?? 1e9)) idx = i; });
  return idx;
};

const CUP = 232;
const OPT = 150, OPT_GAP = 26;

/** how hard the blender is running at this frame — 0 idle, 1 full swirl */
const spinAt = (frame: number): number => {
  const b = buildAt(frame);
  if (!b || !b.wordClip || inQuiz(frame)) return 0;
  const at = f(b.wordClip.start);
  return interpolate(frame, [at - 18, at - 2, at + 26, at + 46], [0, 1, 1, 0],
                     { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

/** the cups' rail, and where the finished drink lands */
const railY = (height: number, width: number) => {
  const B = bands9(width, height);
  return B.stageTop + (B.stageBot - B.stageTop) / 2;
};

// ── the vowel announcement: five lines that name a vowel before its words ────
const VOWEL_LINES: { say: string; letter: string; key: string }[] = [
  { say: "First vowel", letter: "a", key: "shortA" },
  { say: "New vowel", letter: "e", key: "shortE" },
  { say: "Next one", letter: "i", key: "shortI" },
  { say: "Next —", letter: "o", key: "shortO" },
  { say: "Last vowel", letter: "u", key: "shortU" },
];

const vowelCardAt = (frame: number) => {
  for (const v of VOWEL_LINES) {
    const idx = CAPS.findIndex((c) => c.text.startsWith(v.say));
    if (idx < 0) continue;
    const from = f(CAPS[idx].start) - 6;
    const next = BUILDS.find((b) => b.from > from);
    const to = next ? next.from : f(CAPS[idx].end) + 24;
    if (frame >= from && frame < to) return { v, from };
  }
  return null;
};

const VowelCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const B = bands9(width, height);
  const hit = vowelCardAt(frame);
  if (!hit) return null;
  const s = spring({ frame: frame - hit.from, fps, config: { damping: 11 } });
  return (
    <div style={{ position: "absolute", left: 0, top: B.stageTop, width,
                  height: B.stageBot - B.stageTop, display: "flex", alignItems: "center",
                  justifyContent: "center" }}>
      <div style={{ position: "relative",
                    transform: `scale(${(0.7 + 0.3 * s) * (1 + 0.035 * Math.sin((frame - hit.from) / 11))}) `
                               + `translateY(${bob(frame, fps, 3.2, 10)}px) `
                               + `rotate(${(1 - s) * -8 + Math.sin((frame - hit.from) / 17) * 2.2}deg)` }}>
        <LetterCup letter={hit.v.letter} vowel size={300} lit />
        <div style={{ position: "absolute", left: "50%", top: -74, fontSize: 78,
                      transform: `translateX(-50%) scale(${s}) translateY(${bob(frame, fps, 3.6, 7)}px) `
                                 + `rotate(${Math.sin((frame - hit.from) / 13) * 9}deg)` }}>
          {BADGE[hit.v.key]}
        </div>
      </div>
    </div>
  );
};

// ── the three cups on the rail, and the drink they become ───────────────────
const Cups: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const B = bands9(width, height);
  const b = buildAt(frame);
  if (!b) return null;
  if (frame >= P(2) - 10 && frame < IDEA_END) return null;   // the idea owns the frame
  if (frame >= f(MARKS.wall) - 4 && frame < f(MARKS.quiz)) return null;
  if (vowelCardAt(frame)) return null;

  const isQuiz = !b.wordClip;
  const isAnswer = b === BUILDS[BUILDS.length - 1];
  const vowelSoundAt = isAnswer ? f(b.sounds.find((s) => s.idx === 1)?.start ?? 0) : 0;
  const letters = b.word.split("");

  let liveIdx = -1;
  b.sounds.forEach((s, i) => {
    const next = b.sounds[i + 1];
    const until = next ? f(next.start) : f(s.start + s.dur) + 8;
    if (frame >= f(s.start) && frame < until) liveIdx = s.idx!;
  });
  const allSounded = b.sounds.length > 0
    && frame >= f(b.sounds[b.sounds.length - 1].start + b.sounds[b.sounds.length - 1].dur);

  const hasWord = Boolean(b.wordClip);
  const wordAt = hasWord ? f(b.wordClip.start) : 0;
  const quiz = inQuiz(frame);
  // the cups DROP INTO THE JAR — that is the merge in this world
  const drop = hasWord && !quiz
    ? interpolate(frame, [wordAt - 20, wordAt], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const blended = hasWord && !quiz && frame >= wordAt;

  const enterAt = (i: number) => spring({ frame: frame - (b.from + i * 4), fps, config: { damping: 13 } });
  const entrance = (i: number) => 0.72 + 0.28 * enterAt(i);
  const waiting = liveIdx < 0 && b.sounds.length > 0
    && frame < f(b.sounds[0].start) - 20 && f(b.sounds[0].start) - b.from > 45;

  const size = quiz ? 214 : CUP;
  const lift = quiz ? 86 : 0;

  return (
    <>
      {waiting && (
        <div style={{ position: "absolute", left: 0, top: B.stageTop, width,
                      height: B.stageBot - B.stageTop, display: "flex", alignItems: "flex-end",
                      justifyContent: "center", gap: 26, paddingBottom: 10 }}>
          {[0, 1, 2].map((k) => {
            const a = 0.5 + 0.5 * Math.sin(frame / 6 - k * 1.1);
            return <div key={k} style={{ width: 30, height: 30, borderRadius: 15, background: VOWEL,
                                         opacity: 0.25 + 0.75 * a, transform: `scale(${0.75 + 0.45 * a})` }} />;
          })}
        </div>
      )}

      <div
        style={{
          position: "absolute", left: 0, top: B.stageTop, width, height: B.stageBot - B.stageTop,
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: interpolate(drop, [0, 1], [26, 6]),
          transform: `translateY(${-lift}px)`,
          opacity: blended ? 0 : 1,
        }}
      >
        {letters.map((ch, i) => {
          const vowel = "aeiou".includes(ch);
          const blank = (isQuiz && i === 1) || (isAnswer && i === 1 && frame < vowelSoundAt);
          // each cup tips and falls toward the jar mouth, the outer two leaning inward
          const fall = drop * (B.jarTop - railY(height, width) + 120);
          return (
            <div key={i} style={{ transform: `scale(${entrance(i) * (1 + (waiting ? 0.045 : 0) * Math.sin(frame / 8 - i * 0.9))}) `
                                             + `translateY(${bob(frame, fps, 4, waiting ? 9 : 2.4, i) + fall}px) `
                                             + `rotate(${drop * (i === 0 ? 22 : i === 2 ? -22 : 0)}deg)`,
                                  opacity: 1 - drop * 0.15 }}>
              <div style={{ transform: blank && frame >= f(run("14").start)
                  ? `scale(${pulse(frame - f(run("14").start), fps, 0.1, 0.9)})`
                  : isAnswer && i === 1 && frame < vowelSoundAt + 21
                    ? flyIn(frame, vowelSoundAt, width, height, size)
                    : undefined }}>
                <LetterCup letter={ch} vowel={vowel} size={size} blank={blank}
                           lit={!blank && (liveIdx === i || (allSounded && !blended))}
                           dim={liveIdx >= 0 && liveIdx !== i} />
              </div>
            </div>
          );
        })}
      </div>

      {/* the drink the three became, with its picture */}
      {blended && (
        <div style={{ position: "absolute", left: 0, top: B.stageTop, width,
                      height: B.stageBot - B.stageTop, display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 26 }}>
          <div style={{ transform: `scale(${interpolate(spring({ frame: frame - wordAt, fps, config: { damping: 11 } }), [0, 1], [1.3, 1])}) `
                                   + `translateY(${bob(frame, fps, 3.2, 11)}px) rotate(${Math.sin((frame / fps) * 1.6) * 1.4}deg)` }}>
            <BlendedDrink word={b.word} size={186} lit={frame < wordAt + 26} />
          </div>
          <Picture build={b} />
        </div>
      )}
    </>
  );
};

/** the chosen vowel flies out of its option cup and into the blank */
const flyIn = (frame: number, at: number, width: number, height: number, size: number) => {
  const B = bands9(width, height);
  const p = interpolate(frame, [at, at + 19], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const e = 1 - Math.pow(1 - p, 3);
  const fromX = (width - (3 * OPT + 2 * OPT_GAP)) / 2 + OPT / 2 - width / 2;
  const fromY = optTop(width, height) + OPT / 2 - (railY(height, width) - 86);
  const arc = Math.sin(p * Math.PI) * -80;
  return `translate(${(1 - e) * fromX}px, ${(1 - e) * fromY + arc}px) `
    + `scale(${interpolate(e, [0, 1], [OPT / size, 1])}) rotate(${(1 - e) * -14}deg)`;
};

/** the option row hangs under the lifted cups — and above the jar lid, which the
 *  cups' own shadows were reaching down to */
const optTop = (width: number, height: number) =>
  railY(height, width) + 72;

const Picture: React.FC<{ build: Build }> = ({ build }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = f(build.wordClip.start) + 2;
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 10 } });
  if (build.word === "big") {
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 20, transform: `scale(${s})` }}>
        <div style={{ transform: `scale(${pulse(frame - at, fps, 0.07, 0.9)})`, filter: "drop-shadow(0 0 18px rgba(255,212,102,0.9))" }}>
          <WordPicture pic="🐘" size={196} />
        </div>
        <div style={{ opacity: 0.55 }}><WordPicture pic="🐘" size={70} /></div>
      </div>
    );
  }
  return (
    <div style={{ transform: `scale(${s * pulse(frame - at, fps, 0.07, 0.7)}) translateY(${bob(frame, fps, 3.6, 13, 1)}px) rotate(${Math.sin((frame / fps) * 2.4) * 6}deg)` }}>
      <WordPicture pic={PIC[build.word]} size={196} />
    </div>
  );
};

// ── THE IDEA — the twelve lines of run 02, twelve visual changes ─────────────
const IdeaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const B = bands9(width, height);
  if (frame < P(2) - 10 || frame >= IDEA_END) return null;

  const at = (i: number) => frame >= P(i);
  const since = (i: number) => frame - P(i);
  const split = at(3) && !at(4);
  const showCups = at(3) && !at(12);
  const pip = at(5) && !at(6) ? Math.min(2, Math.floor(since(5) / 26)) : -1;
  const midLift = at(6) && !at(9);
  const vowelOnly = at(7) && !at(8);
  const consOnly = at(8) && !at(9);
  const labels = at(9);
  const p9 = CAPS[9];
  const spokenIdx = labels && !at(10)
    ? p9.words.findIndex((w, k) => frame >= f(w.start) && (k === p9.words.length - 1 || frame < f(p9.words[k + 1].start)))
    : -1;
  const apart = at(10) && !at(11);
  const snap = at(11) && !at(12);
  const grid = at(12);
  const gap = apart ? 84 : snap ? 8 : 26;

  return (
    <div style={{ position: "absolute", left: 0, top: B.stageTop, width,
                  height: B.stageBot - B.stageTop, display: "flex", alignItems: "center",
                  justifyContent: "center" }}>
      {/* 2 · the drink they just read */}
      {!at(3) && (
        <div style={{ transform: `scale(${pulse(since(2), fps, 0.06, 1.1)}) translateY(${bob(frame, fps, 4.4, 3)}px)` }}>
          <BlendedDrink word="cat" size={200} lit />
        </div>
      )}

      {/* 3–11 · the three cups, taking a new state on every line */}
      {showCups && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap,
                      transition: "none" }}>
          {"cat".split("").map((ch, i) => {
            const vowel = i === 1;
            const lit = (pip === i)
              || (midLift && vowel && !vowelOnly && !consOnly)
              || (vowelOnly && vowel) || (consOnly && !vowel)
              || (spokenIdx === 0 && !vowel) || (spokenIdx === 1 && vowel) || (spokenIdx === 2 && !vowel);
            const dim = (vowelOnly && !vowel) || (consOnly && vowel);
            const e = spring({ frame: since(3) - i * 5, fps, config: { damping: 12 } });
            // NAMED, not merely lit: on "Blue. Red. Blue." and "Consonant. Vowel.
            // Consonant." each cup is called out in turn, and a 1.08 lit-scale does not
            // read as being pointed at. It steps well clear of its neighbours.
            const named = pip === i || spokenIdx === i;
            const grow = named ? 1.3 : 1;
            return (
              <div key={i} style={{ position: "relative", zIndex: named ? 2 : 1,
                                    transform: `scale(${(0.74 + 0.26 * e) * grow}) `
                                               + `translateY(${bob(frame, fps, 4, 4, i) + (midLift && vowel ? -26 : 0) + (split ? (i === 1 ? 0 : 0) : 0)}px)` }}>
                <LetterCup letter={ch} vowel={vowel} size={CUP} lit={lit} dim={dim} />
                {labels && (
                  <div style={{ position: "absolute", left: 0, top: -60, width: "100%", textAlign: "center",
                                fontSize: 44, fontWeight: 800, color: vowel ? VOWEL : CONSONANT,
                                opacity: interpolate(since(9) - i * 6, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                                transform: `scale(${spokenIdx === i ? 1.22 : 1})` }}>
                    {vowel ? "V" : "C"}
                  </div>
                )}
                {vowelOnly && vowel && (
                  <div style={{ position: "absolute", left: 0, bottom: -54, width: "100%", textAlign: "center",
                                fontSize: 34, fontWeight: 800, color: VOWEL }}>vowel</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 12 · fifteen empty cups waiting to be filled */}
      {grid && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {GROUPS.map((g, r) => (
            <div key={g.key} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 44, width: 56, textAlign: "center",
                             opacity: interpolate(since(12) - r * 5, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
                {BADGE[g.key]}
              </span>
              {Array.from({ length: 3 }, (_, c) => {
                const k = r * 3 + c;
                const e = spring({ frame: since(12) - k * 1.8, fps, config: { damping: 13 } });
                return (
                  <div key={c} style={{ width: 180, height: 66, borderRadius: 30,
                                        background: "linear-gradient(180deg,#FFE0A8 0%,#F3B96E 100%)",
                                        boxShadow: "0 7px 0 #C98A47",
                                        transform: `scale(${0.72 + 0.28 * e}) translateY(${bob(frame, fps, 3.6, 5, k)}px)`,
                                        opacity: 0.2 + 0.8 * e }} />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── the group tracker, under the title ──────────────────────────────────────
const GroupStrip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const B = bands9(width, height);
  const gi = groupIndexAt(frame);
  const done = frame >= f(MARKS.wall) ? 5 : Math.max(0, gi);
  return (
    <div style={{ position: "absolute", left: 0, top: B.stripTop, width,
                  display: "flex", justifyContent: "center", gap: 12 }}>
      {GROUPS.map((g, i) => {
        const live = i === gi && frame < f(MARKS.wall);
        const ok = i < done;
        const s = spring({ frame: frame - f(MARKS[g.key] ?? 1e9), fps, config: { damping: 12 } });
        return (
          <div key={g.key}
               style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 17px",
                        borderRadius: 22,
                        background: live ? "#FFD466" : ok ? "#FFF3D6" : "rgba(255,255,255,0.78)",
                        border: `3px solid ${live ? "#E0A400" : ok ? "#E8CFA0" : "#EADFC8"}`,
                        boxShadow: live ? "0 8px 18px rgba(224,164,0,0.32)" : "0 4px 10px rgba(60,40,20,0.1)",
                        transform: `scale(${live ? 1 + 0.04 * s * Math.sin(frame / 9) : 1}) translateY(${bob(frame, fps, 4.2, 3, i)}px)`,
                        fontSize: 25, fontWeight: 800, color: palette.ink }}>
            <span style={{ fontSize: 27 }}>{BADGE[g.key]}</span>{g.label}
            <span style={{ fontSize: 19, opacity: ok ? 1 : 0 }}>✓</span>
          </div>
        );
      })}
    </div>
  );
};

// ── the word list — a row above the jar ─────────────────────────────────────
const COMPARE = [
  { say: "Hen. Pen.", words: ["hen", "pen"] },
  { say: "Pig...", words: ["pig", "big"] },
  { say: "Pot. Hot.", words: ["pot", "hot"] },
];

const WordList: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const B = bands9(width, height);
  if (!inGroups(frame)) return null;
  const gi = groupIndexAt(frame);
  if (gi < 0) return null;
  const g = GROUPS[gi];
  const words = GROUP_WORDS[g.key];
  const live = buildAt(frame);
  const announcing = Boolean(vowelCardAt(frame));

  return (
    <div style={{ position: "absolute", left: B.contentL, top: B.listTop,
                  width: width - 2 * B.contentL, height: B.listBot - B.listTop,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 10, padding: "12px 20px",
                  boxSizing: "border-box", background: "#FFFDF7", borderRadius: 26,
                  border: "8px solid #C98A47", boxShadow: "0 14px 30px rgba(60,40,20,0.22)" }}>
      {/* the group is the HEADING of this row, so it is read first — it was smaller than
          the words it labels. The cards give up the width for it; three CVC words never
          needed a third of the frame each. */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                    fontSize: 36, fontWeight: 800, color: palette.ink, lineHeight: 1.1,
                    flexShrink: 0, width: 150 }}>
        <span style={{ fontSize: 52 }}>{BADGE[g.key]}</span>{g.label}
      </div>
      {words.map((w, i) => {
        const isLive = !announcing && live?.word === w && Boolean(live?.wordClip);
        const pair = COMPARE.find((c) => c.words.includes(w));
        const pc = pair ? CAPS.find((c) => c.text.startsWith(pair.say)) : undefined;
        const nxt = pc ? CAPS[CAPS.indexOf(pc) + 1] : undefined;
        const asking = pc ? frame >= f(pc.start) && frame < (nxt ? f(nxt.start) : f(pc.end) + 24) : false;
        const namedPulse = Boolean(!announcing && asking && pc
          && Math.floor((frame - f(pc.start)) / 14) % 2 === pair!.words.indexOf(w));
        const done = BUILDS.some((b) => b.word === w && b.wordClip && frame >= b.to && b.from >= f(MARKS[g.key]));
        const s = spring({ frame: frame - f(MARKS[g.key]) - i * 4, fps, config: { damping: 13 } });
        const on = isLive || namedPulse;
        return (
          <div key={w}
               style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                        padding: "12px 4px", borderRadius: 20, width: 196, flexShrink: 0,
                        background: on ? "#FFD466" : done ? "#FFF3D6" : "rgba(255,255,255,0.7)",
                        border: `4px solid ${on ? "#E0A400" : done ? "#E8CFA0" : "#EADFC8"}`,
                        boxShadow: on ? "0 10px 22px rgba(224,164,0,0.35)" : "0 6px 14px rgba(60,40,20,0.08)",
                        transform: `scale(${s * (on ? 1.06 : 1)})` }}>
            {w.split("").map((ch, k) => (
              <span key={k} style={{ fontSize: 40, fontWeight: 800, lineHeight: 1,
                                     color: "aeiou".includes(ch) ? VOWEL : CONSONANT }}>{ch}</span>
            ))}
            <span style={{ marginLeft: 6, fontSize: 24, opacity: done ? 1 : 0 }}>✓</span>
          </div>
        );
      })}
    </div>
  );
};

// ── the fifteen finished drinks ─────────────────────────────────────────────
const Wall: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const B = bands9(width, height);
  const from = f(MARKS.wall);
  if (frame < from || frame >= f(MARKS.quiz)) return null;
  return (
    <div style={{ position: "absolute", left: B.contentL, top: B.stageTop,
                  width: B.contentR - B.contentL, height: B.stageBot - B.stageTop,
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", gap: 18 }}>
      {/* the logo belongs on the finished wall: this is the frame the child sees when the
          teacher says "you read them all", and it is the one worth remembering */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6,
                    transform: `scale(${spring({ frame: frame - from - 12, fps, config: { damping: 12 } })}) `
                               + `translateY(${bob(frame, fps, 4.2, 5)}px)` }}>
        <Img src={staticFile("app_icon.png")}
             style={{ width: 88, height: 88, borderRadius: 22,
                      boxShadow: "0 10px 22px rgba(60,40,20,0.28)" }} />
        <span style={{ fontSize: 40, fontWeight: 800, color: palette.ink }}>
          Kids English Learning
        </span>
      </div>

      {Object.entries(GROUP_WORDS).map(([key, words], row) => (
        <div key={key} style={{ display: "grid", gridTemplateColumns: "58px repeat(3, 264px)",
                                alignItems: "center", justifyItems: "center", columnGap: 10 }}>
          <span style={{ fontSize: 40, textAlign: "center" }}>{BADGE[key]}</span>
          {words.map((w, i) => {
            const k = row * 3 + i;
            const s = 0.7 + 0.3 * spring({ frame: frame - from - k * 2, fps, config: { damping: 13 } });
            const wave = Math.sin((frame - from) / 9 - k * 0.5);
            return (
              <div key={w} style={{ transform: `scale(${s * (1 + 0.05 * wave)}) translateY(${bob(frame, fps, 3.4, 7, k) + 9 * wave}px)` }}>
                <BlendedDrink word={w} size={72} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const QuizOptions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const from = f(MARKS.quiz);
  const vowelAt = f(CLIPS.filter((c) => c.kind === "sound").slice(-1)[0].start);
  const answerAt = f(CLIPS.filter((c) => c.kind === "word").slice(-1)[0].start);
  if (frame < from + 20 || frame >= answerAt) return null;
  const revealed = frame >= vowelAt;
  return (
    <div style={{ position: "absolute", left: 0, top: optTop(width, height), width,
                  display: "flex", justifyContent: "center", gap: OPT_GAP }}>
      {["o", "a", "u"].map((ch, i) => {
        const right = ch === "o";
        const s = spring({ frame: frame - from - 20 - i * 4, fps, config: { damping: 12 } });
        return (
          <div key={ch} style={{ transform: `scale(${s * (revealed && right ? pulse(frame - vowelAt, fps, 0.09, 1) : 1)})`,
                                 opacity: revealed ? (right ? 0 : 0.35) : 1 }}>
            <LetterCup letter={ch} vowel size={OPT} lit={revealed && right} />
          </div>
        );
      })}
    </div>
  );
};

const FoundConfetti: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  // "You found it." — paper pieces, thrown from the jar
  const foundAt = f(CAPS[CAPS.length - 2].start);
  if (frame < foundAt || frame > foundAt + 90) return null;
  return (
    <>
      {[0, 12, 26].map((d, k) => (
        <Confetti key={k} frame={frame - foundAt} fps={fps} burstFrame={d}
                  origin={{ x: width / 2 + (k - 1) * 240, y: railY(height, width) }}
                  colors={["#E64A4A", "#2979FF", "#FFD466", "#7FB069", "#8E7CC3"]}
                  count={30} seed={k + 3} />
      ))}
    </>
  );
};

// ── the reel ────────────────────────────────────────────────────────────────
export const Cvc9x16Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const B = bands9(width, height);
  const dim = interpolate(frame, [DL_FROM, DL_FROM + 20], [1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: font.family, background: "#FFF3E2" }}>
      <SmoothieWorld
        dim={dim}
        spin={frame < DL_FROM ? spinAt(frame) : 0}
        mascot={frame >= DL_FROM ? "off" : inGroups(frame) ? "floor" : "bar"}
      />

      {CLIPS.map((c, i) => (
        <Sequence key={i} from={f(c.start)} durationInFrames={f(c.dur) + 2}>
          <Audio src={staticFile(c.src)} />
        </Sequence>
      ))}

      <Sequence from={0} durationInFrames={DL_FROM}>
        <div style={{ position: "absolute", left: 0, top: B.bannerTop, width, textAlign: "center",
                      fontSize: 56, fontWeight: 800, color: palette.ink, letterSpacing: 1 }}>
          <span style={{ color: CONSONANT }}>C</span>onsonant ·{" "}
          <span style={{ color: VOWEL }}>V</span>owel ·{" "}
          <span style={{ color: CONSONANT }}>C</span>onsonant
        </div>

        <GroupStrip />
        <Cups />
        <IdeaScene />
        <WordList />
        <VowelCard />
        <Wall />
        <QuizOptions />
        <FoundConfetti />
        <Captions track={CAPTIONS} fontSize={48} bottom={64} />
        <Watermark corner="br" widthFrac={0.13} opacity={0.5} pad={30} />
      </Sequence>

      <Sequence from={DL_FROM}>
        <StoreOutro silent total={CVC15_DURATION - DL_FROM} />
      </Sequence>
    </AbsoluteFill>
  );
};
