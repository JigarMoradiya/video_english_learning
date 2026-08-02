import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  ALL_WORDS, AUDIO_SEC, Clip, CLIPS, CVC_DURATION, F, GROUP_WORDS, MARKS, OUTRO_FROM, PIC, run,
} from "../data/cvc";
import captionsJson from "../data/cvc.captions.json";
import { bands, CONSONANT, GROUPS, LetterBoard, MergedSandwich, ShopWorld, VOWEL, WordPicture } from "../components/SandwichShop";
import { Captions } from "../components/Captions";
import { makeTrack, TPhrase } from "../lib/timing";
import { StoreOutro } from "../components/StoreOutro";
import { Watermark } from "../components/Watermark";
import { font, palette } from "../data/tokens";
import { bob, pulse } from "../lib/motion";

// ── L4 · CVC Words — 16:9 ────────────────────────────────────────────────────
// Driven entirely by src/data/cvc.timeline.json: every clip has an absolute start, so a
// visual cue is never a guess — it is the frame the sound actually plays. Nothing was cut
// to build that timeline, so a cue can never drift into a neighbouring word.
//
// THE FRAME IS ONE CONTINUOUS SCENE, not a sequence of sections. The three boards live on
// the counter the whole video; only their letters, their lighting and the merge change.
// That is what the app does, and it is why this needs no per-section components.
const FPS = 30;
const CAPTIONS = makeTrack(captionsJson as unknown as TPhrase[], AUDIO_SEC);

const f = (s: number) => Math.round(s * FPS);

/** boards arrive this long before their first sound, so the child sees them WAITING */
const HOLD_IN = 26;

// THE LAW: every narration LINE gets its own visual change. These are the caption lines,
// so a cue is a line — never a section, never a guess.
const P = (i: number) => f((captionsJson as unknown as TPhrase[])[i].start);
const PE = (i: number) => f((captionsJson as unknown as TPhrase[])[i].end);

/** every word-build in the timeline, resolved once at module load */
interface Build { word: string; sounds: Clip[]; wordClip: Clip; from: number; to: number }
const BUILDS: Build[] = (() => {
  const out: Build[] = [];
  let pending: Clip[] = [];
  for (const c of CLIPS) {
    if (c.kind === "sound") pending.push(c);
    else if (c.kind === "word") {
      out.push({
        word: c.word!, sounds: pending, wordClip: c,
        from: out.length === 0 ? 0 : f((pending[0]?.start ?? c.start)) - HOLD_IN,
        to: f(c.start + c.dur),
      });
      pending = [];
    } else if (c.kind === "run" && pending.length) {
      // the quiz's two consonants, whose vowel never sounds
      out.push({ word: pending[0].word!, sounds: pending, wordClip: null as unknown as Clip,
                 from: f(pending[0].start - 0.5), to: f(pending[pending.length - 1].start + pending[pending.length - 1].dur) });
      pending = [];
    }
  }
  return out;
})();

/** which build is on screen at a frame — the LAST one that has started */
const buildAt = (frame: number): Build | null => {
  let cur: Build | null = null;
  for (const b of BUILDS) if (frame >= b.from) cur = b;
  return cur;
};

/** the quiz needs a second row, so the boards ride higher through it */
const QUIZ_LIFT = 120;
const inQuiz = (frame: number) => frame >= f(MARKS.quiz);

const groupIndexAt = (frame: number): number => {
  let idx = -1;
  GROUPS.forEach((g, i) => { if (frame >= f(MARKS[g.key] ?? 1e9)) idx = i; });
  return idx;
};

// ── the three boards on the counter ─────────────────────────────────────────
const Boards: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const B = bands(width, height);
  const b = buildAt(frame);
  if (!b) return null;
  // the idea section owns the frame between the hook's cat and the first Short-A build
  if (frame >= P(2) - 10 && frame < P(14) - HOLD_IN) return null;

  const SIZE = 300;
  const isQuiz = !b.wordClip;
  const letters = b.word.split("");

  // which sound is speaking right now — the app's own "one lit, two dim"
  let liveIdx = -1;
  b.sounds.forEach((s, i) => {
    const next = b.sounds[i + 1];
    const until = next ? f(next.start) : f(s.start + s.dur) + 8;
    if (frame >= f(s.start) && frame < until) liveIdx = s.idx!;
  });
  const allSounded = b.sounds.length > 0 && frame >= f(b.sounds[b.sounds.length - 1].start + b.sounds[b.sounds.length - 1].dur);

  // the press comes down and the three become one — the app's merge, as a sandwich press
  // the quiz build has NO word clip — its vowel never sounds — so it never presses
  const hasWord = Boolean(b.wordClip);
  const wordAt = hasWord ? f(b.wordClip.start) : 0;
  const quiz = inQuiz(frame);
  const press = hasWord && !quiz
    ? interpolate(frame, [wordAt - 16, wordAt], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const merged = hasWord && !quiz && frame >= wordAt;

  const entrance = (i: number) => spring({ frame: frame - (b.from + 6 + i * 6), fps, config: { damping: 13 } });

  return (
    <>
      {/* the boards — they slide together as the press descends, then hand over */}
      <div
        style={{
          position: "absolute", left: 0, top: B.stageTop, width, height: B.stageBot - B.stageTop,
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: interpolate(press, [0, 1], [26, 2]),
          transform: `translateY(${inQuiz(frame) ? -QUIZ_LIFT : 0}px)`,
          opacity: merged ? 0 : 1,
        }}
      >
        {letters.map((ch, i) => {
          const vowel = "aeiou".includes(ch);
          const blank = isQuiz && i === 1;
          return (
            <div key={i} style={{ transform: `scale(${entrance(i)}) translateY(${bob(frame, fps, 4, 2.4, i)}px)` }}>
              <LetterBoard
                letter={ch}
                vowel={vowel}
                size={SIZE}
                blank={blank}
                lit={!blank && (liveIdx === i || (allSounded && !merged))}
                dim={liveIdx >= 0 && liveIdx !== i}
              />
            </div>
          );
        })}
      </div>

      {/* THE PRESS — the top plate of a sandwich press, coming down on the boards */}
      {press > 0 && !merged && (
        <div
          style={{
            position: "absolute", left: width / 2 - 260, width: 520, height: 44,
            top: B.stageTop + (B.stageBot - B.stageTop) / 2 - SIZE / 2 - 96 + press * 60,
            background: "linear-gradient(180deg,#C6CCD4 0%,#8E979F 100%)",
            borderRadius: 12, boxShadow: "0 10px 0 #6E767D, 0 16px 30px rgba(40,40,50,0.3)",
          }}
        />
      )}

      {/* the sandwich the three became, WITH its picture — one centred pair, so neither
          has to be squeezed into a margin */}
      {merged && (
        <div
          style={{
            position: "absolute", left: 0, top: B.stageTop, width, height: B.stageBot - B.stageTop,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 64,
          }}
        >
          <div style={{ transform: `scale(${interpolate(spring({ frame: frame - wordAt, fps, config: { damping: 11 } }), [0, 1], [1.35, 1])}) translateY(${bob(frame, fps, 4.4, 3)}px)` }}>
            <MergedSandwich word={b.word} size={SIZE} lit={frame < wordAt + 26} />
          </div>
          <Picture build={b} />
        </div>
      )}
    </>
  );
};

// ── the word's picture — bounces in beside the sandwich once the word is said ──
const Picture: React.FC<{ build: Build }> = ({ build }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = f(build.wordClip.start + build.wordClip.dur) - 6;
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 10 } });
  return (
    <div style={{ transform: `scale(${s * pulse(frame - at, fps, 0.06, 0.8)}) rotate(${Math.sin((frame / fps) * 3) * 3}deg)` }}>
      <WordPicture pic={PIC[build.word]} size={250} />
    </div>
  );
};

// ── THE IDEA — twelve lines, twelve visual changes ─────────────────────────
// This is the section that shipped frozen: 30 seconds of narration over a still frame.
// Each line below owns a state, cued on the caption that speaks it.
const IdeaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const B = bands(width, height);
  if (frame < P(2) - 10 || frame >= P(14) - HOLD_IN) return null;

  const SIZE = 300;
  const at = (i: number) => frame >= P(i);
  const since = (i: number) => frame - P(i);

  // 2 you just read a word   3 three sounds one word   4 look at the colours
  // 5 blue red blue          6 red is the middle       7 red is a vowel
  // 8 blue are consonants    9 C V C                  10 sound them out
  // 11 blend them fast      12 ready, fifteen         13 first vowel aaa
  const split = at(3) && !at(4);                    // the sandwich comes apart again
  const showBoards = at(3);
  const pip = at(5) && !at(6) ? Math.min(2, Math.floor(since(5) / 26)) : -1;
  const midLift = at(6) && !at(9);
  const vowelOnly = at(7) && !at(8);
  const consOnly = at(8) && !at(9);
  const labels = at(9);
  const apart = at(10) && !at(11);
  const snap = at(11) && !at(12);
  const grid = at(12) && !at(13);
  const badge = at(13);

  const gap = apart ? 200 : snap ? 6 : 26;

  return (
    <div style={{ position: "absolute", left: 0, top: B.stageTop, width, height: B.stageBot - B.stageTop,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* 2 · the sandwich they just read, pulsing */}
      {!showBoards && (
        <div style={{ transform: `scale(${pulse(since(2), fps, 0.06, 1.1)}) translateY(${bob(frame, fps, 4.4, 3)}px)` }}>
          <MergedSandwich word="cat" size={SIZE} lit />
        </div>
      )}

      {/* 3-13 · the three boards, each line changing what they do */}
      {showBoards && (
        <div style={{ display: "flex", alignItems: "center", gap, transition: "none" }}>
          {"cat".split("").map((ch, i) => {
            const vowel = i === 1;
            const s = split ? spring({ frame: since(3) - i * 3, fps, config: { damping: 12 } }) : 1;
            const lit = pip === i || (midLift && vowel) || (vowelOnly && vowel) || (consOnly && !vowel);
            const dim = (vowelOnly && !vowel) || (consOnly && vowel);
            return (
              <div key={i} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 50,
                transform: `scale(${s}) translateY(${(midLift && vowel ? -22 : 0) + bob(frame, fps, 4, 2.4, i)}px)`,
              }}>
                <div style={{ height: 52, fontSize: 46, fontWeight: 800, lineHeight: 1,
                              color: vowel ? VOWEL : CONSONANT,
                              opacity: labels ? interpolate(since(9) - i * 8, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0 }}>
                  {vowel ? "V" : "C"}
                </div>
                <LetterBoard letter={ch} vowel={vowel} size={SIZE} lit={lit} dim={dim} />
                <div style={{ height: 40, fontSize: 34, fontWeight: 800, lineHeight: 1,
                              color: vowel ? VOWEL : CONSONANT,
                              opacity: (vowelOnly && vowel) || (consOnly && !vowel) ? 1 : 0 }}>
                  {vowel ? "vowel" : "consonant"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 12 · fifteen empty slots flick past — the promise of the lesson */}
      {grid && (
        <div style={{ position: "absolute", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
          {Array.from({ length: 15 }, (_, k) => (
            <div key={k} style={{ transform: `scale(${spring({ frame: since(12) - k * 2, fps, config: { damping: 13 } })})` }}>
              <LetterBoard letter="" vowel={false} size={96} blank />
            </div>
          ))}
        </div>
      )}

      {/* 13 · the first vowel badge lands */}
      {badge && (
        <div style={{ position: "absolute", top: -10,
                      transform: `scale(${spring({ frame: since(13), fps, config: { damping: 10 } })})`,
                      fontSize: 90 }}>
          🍎
        </div>
      )}
    </div>
  );
};

// ── the wall of finished words ──────────────────────────────────────────────
const Wall: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const B = bands(width, height);
  const from = f(MARKS.wall);
  const to = f(MARKS.quiz);
  if (frame < from || frame >= to) return null;
  return (
    <div
      style={{
        position: "absolute", left: B.contentL, top: B.stageTop, width: B.contentR - B.contentL,
        height: B.stageBot - B.stageTop, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 12,
      }}
    >
      {Object.entries(GROUP_WORDS).map(([key, words], row) => (
        <div key={key} style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ fontSize: 46, width: 60, textAlign: "center" }}>{GROUPS[row].emoji}</span>
          {words.map((w, i) => {
            const k = row * 3 + i;
            const s = spring({ frame: frame - from - k * 3, fps, config: { damping: 13 } });
            return (
              <div key={w} style={{ transform: `scale(${s}) translateY(${bob(frame, fps, 4, 2, k)}px)` }}>
                <MergedSandwich word={w} size={104} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ── the quiz's three answer tiles ───────────────────────────────────────────
const QuizOptions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const B = bands(width, height);
  const from = f(MARKS.quiz);
  // the answer's vowel sounds first, THEN the whole word — the tiles bow out as the
  // boards fill in, or the two stack on top of each other
  const vowelAt = f(CLIPS.filter((c) => c.kind === "sound").slice(-1)[0].start);
  const answerAt = f(CLIPS.filter((c) => c.kind === "word").slice(-1)[0].start);
  if (frame < from + 20 || frame >= answerAt) return null;
  const revealed = frame >= vowelAt;
  return (
    <div
      style={{
        position: "absolute", left: 0, top: B.counterY - 172, width,
        display: "flex", justifyContent: "center", gap: 26,
      }}
    >
      {["o", "a", "u"].map((ch, i) => {
        const right = ch === "o";
        const s = spring({ frame: frame - from - 20 - i * 4, fps, config: { damping: 12 } });
        return (
          <div
            key={ch}
            style={{
              transform: `scale(${s * (revealed && right ? pulse(frame - vowelAt, fps, 0.09, 1) : 1)})`,
              opacity: revealed && !right ? 0.35 : 1,
            }}
          >
            <LetterBoard letter={ch} vowel size={148} lit={revealed && right} />
          </div>
        );
      })}
    </div>
  );
};

export const CvcReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const B = bands(width, height);
  const gi = groupIndexAt(frame);
  const dim = interpolate(frame, [OUTRO_FROM, OUTRO_FROM + 20], [1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: font.family, background: "#FFF6E6" }}>
      <ShopWorld dim={dim} activeGroup={frame < f(MARKS.wall) ? gi : -1} doneGroups={frame >= f(MARKS.wall) ? 5 : Math.max(0, gi)} />

      {/* every clip plays whole, at the frame the timeline put it */}
      {CLIPS.map((c, i) => (
        <Sequence key={i} from={f(c.start)} durationInFrames={f(c.dur) + 2}>
          <Audio src={staticFile(c.src)} />
        </Sequence>
      ))}

      <Sequence from={0} durationInFrames={OUTRO_FROM}>
        <div
          style={{
            position: "absolute", left: 0, top: B.bannerTop, width, textAlign: "center",
            fontSize: 54, fontWeight: 800, color: palette.ink, letterSpacing: 1,
          }}
        >
          <span style={{ color: CONSONANT }}>C</span>onsonant ·{" "}
          <span style={{ color: VOWEL }}>V</span>owel ·{" "}
          <span style={{ color: CONSONANT }}>C</span>onsonant
        </div>

        <Boards />
        <IdeaScene />
        <Wall />
        <QuizOptions />
        <Captions track={CAPTIONS} fontSize={50} bottom={44} />
        <Watermark corner="tl" widthFrac={0.09} opacity={0.45} />
      </Sequence>

      <Sequence from={OUTRO_FROM}>
        <StoreOutro silent compact total={CVC_DURATION - OUTRO_FROM} />
      </Sequence>
    </AbsoluteFill>
  );
};
