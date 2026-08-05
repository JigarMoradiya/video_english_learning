import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { LETTERS, LetterItem } from "../data/letters";
import { Mascot } from "../components/Mascot";
import { Confetti } from "../components/Confetti";
import { font, palette, letterColorFor, shade } from "../data/tokens";
import { bob, wiggle, pulse } from "../lib/motion";
import { SocialIcons } from "./abacus_crosspromo";

// ══ VARIETY SHORT · "Which Letter?" quiz ═════════════════════════════════════
// Same Sound Stage world as the "Say the SOUND!" recap, so the two read as ONE
// quiz series. Per round: show a picture → 3 letter options → 3·2·1 countdown →
// reveal the correct letter (green), play its sound + word. Play along, comment.

const FPS = 30;
const BAND_TOP = 300;
const BAND_H = 1300;
const SIDE = 80;

// clear, unmistakable pictures; `correct` is the index of the right option.
type Round = { letter: string; word: string; image: string; options: string[]; correct: number; logo?: boolean };
const ROUNDS: Round[] = [
  { letter: "C", word: "Cat", image: "cat", options: ["S", "C", "T"], correct: 1, logo: true },
  { letter: "F", word: "Fish", image: "fish", options: ["F", "H", "L"], correct: 0 },
  { letter: "G", word: "Goat", image: "goat", options: ["P", "D", "G"], correct: 2, logo: true },
  { letter: "D", word: "Drum", image: "drum", options: ["B", "D", "K"], correct: 1 },
];
const QUIZ_LETTERS = ROUNDS.map((r) => r.letter);

// round timeline (frames)
const OPT_IN = 22;   // options pop in
const CD_START = 48; // 3·2·1 begins
const CD_STEP = 20;  // per countdown number
const REVEAL = CD_START + 3 * CD_STEP; // 108
const ROUND = REVEAL + 62; // hold on the answer

const HEAD_SHADOW = "0 4px 0 rgba(20,10,60,0.35), 0 12px 28px rgba(20,10,60,0.35)";

const Pill: React.FC<{ children: React.ReactNode; bg?: string; color?: string; size?: number; pad?: string }> = ({ children, bg = "#fff", color = palette.ink, size = 60, pad = "12px 40px" }) => (
  <div style={{ background: bg, color, fontSize: size, fontWeight: 800, padding: pad, borderRadius: 999, boxShadow: "0 10px 0 rgba(20,10,60,0.18), 0 18px 34px rgba(20,10,60,0.3)" }}>{children}</div>
);

// ── the QUIZ world (its own look, NOT the Sound Stage): a warm game-show stage
//    with floating "?" marks + lightbulbs, so the two quiz shorts feel distinct.
const QPOS = [
  { x: 96, y: 360, s: 92 }, { x: 928, y: 300, s: 112 }, { x: 150, y: 900, s: 74 },
  { x: 978, y: 980, s: 84 }, { x: 58, y: 640, s: 60 }, { x: 1010, y: 640, s: 66 },
  { x: 250, y: 1470, s: 80 }, { x: 852, y: 1520, s: 66 },
];
const BULBS = [{ x: 1000, y: 440, s: 66 }, { x: 70, y: 1170, s: 60 }, { x: 520, y: 250, s: 52 }];
const BOKEH = [
  { x: 0.16, y: 0.2, r: 340 }, { x: 0.86, y: 0.16, r: 300 }, { x: 0.1, y: 0.72, r: 260 },
  { x: 0.9, y: 0.8, r: 320 }, { x: 0.5, y: 0.5, r: 420 },
];

const QuizStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "linear-gradient(160deg,#6D28D9 0%,#DB2777 48%,#F97316 100%)" }} />
      {BOKEH.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: b.x * width - b.r / 2, top: b.y * height - b.r / 2, width: b.r, height: b.r, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,255,255,0.16), transparent)" }} />
      ))}
      <AbsoluteFill style={{ background: "radial-gradient(760px 760px at 50% 34%, rgba(255,255,255,0.24), transparent 62%)" }} />
      {QPOS.map((q, i) => (
        <span key={i} style={{ position: "absolute", left: q.x, top: q.y, fontSize: q.s, fontWeight: 800, color: "rgba(255,255,255,0.3)", transform: `translateY(${bob(frame, fps, 18, 3, i)}px) rotate(${wiggle(frame, fps, 12, 4, i)}deg)` }}>?</span>
      ))}
      {BULBS.map((b, i) => (
        <span key={`b${i}`} style={{ position: "absolute", left: b.x, top: b.y, fontSize: b.s, opacity: 0.5, transform: `translateY(${bob(frame, fps, 14, 2.6, i + 3)}px) rotate(${wiggle(frame, fps, 8, 3, i)}deg)` }}>💡</span>
      ))}
    </AbsoluteFill>
  );
};

// ── one round ─────────────────────────────────────────────────────────────────
const QuizBeat: React.FC<{ r: Round }> = ({ r }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = LETTERS.find((x) => x.letter === r.letter);
  const accent = letterColorFor(r.letter, L ? L.imageColor : "#5B50D6");

  const picIn = spring({ frame, fps, config: { damping: 12 } });
  const revealed = frame >= REVEAL;
  const counting = frame >= CD_START && frame < REVEAL;
  const cdNum = 3 - Math.floor((frame - CD_START) / CD_STEP); // 3 → 2 → 1
  const cdT = ((frame - CD_START) % CD_STEP) / CD_STEP;       // 0..1 within a number
  const revealPop = spring({ frame: frame - REVEAL, fps, config: { damping: 11 } });

  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      {/* SFX: letter swoosh in, countdown ticks + drumroll, then correct + the sound */}
      <Sequence from={0} durationInFrames={16}><Audio src={staticFile("sfx/swoosh_soft.mp3")} volume={0.28} /></Sequence>
      {[0, 1, 2].map((i) => (
        <Sequence key={i} from={CD_START + i * CD_STEP} durationInFrames={9}><Audio src={staticFile("sfx/tick.mp3")} volume={0.4} /></Sequence>
      ))}
      <Sequence from={CD_START} durationInFrames={REVEAL - CD_START}><Audio src={staticFile("sfx/drumroll.mp3")} volume={0.22} /></Sequence>
      <Sequence from={REVEAL} durationInFrames={30}><Audio src={staticFile("sfx/correct.mp3")} volume={0.6} /></Sequence>
      <Sequence from={REVEAL + 6} durationInFrames={40}><Audio src={staticFile(`audio/shorts/sound_${r.letter}.mp3`)} volume={1} /></Sequence>

      <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 48, padding: `0 ${SIDE}px`, boxSizing: "border-box" }}>
        <Pill size={58}>🤔 Which letter?</Pill>

        {/* the picture (a couple of cards carry a small brand logo, not all) */}
        <div style={{ position: "relative", width: 320, height: 320, borderRadius: 44, background: "#fff", boxShadow: `0 16px 0 ${shade(accent, 0.12)}, 0 30px 56px rgba(20,10,60,0.4)`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.72 + 0.28 * picIn}) translateY(${bob(frame, fps, 8, 2.6)}px)` }}>
          <Img src={staticFile(`letters/${r.image}.png`)} style={{ width: 244, height: 244, objectFit: "contain" }} />
          {r.logo && <Img src={staticFile("app_icon.png")} style={{ position: "absolute", top: 14, right: 14, width: 58, height: 58, borderRadius: 15, boxShadow: "0 4px 10px rgba(20,10,60,0.28)" }} />}
        </div>

        {/* three options */}
        <div style={{ display: "flex", gap: 26 }}>
          {r.options.map((opt, i) => {
            const isRight = i === r.correct;
            const optIn = spring({ frame: frame - OPT_IN - i * 4, fps, config: { damping: 12 } });
            const dim = revealed && !isRight ? 0.32 : 1;
            const grow = revealed && isRight ? 1 + 0.12 * revealPop : 1;
            const bg = revealed && isRight ? "#3AD873" : "#fff";
            const col = revealed && isRight ? "#fff" : accent;
            return (
              <div key={i} style={{ position: "relative", width: 168, height: 168, borderRadius: 32, background: bg, boxShadow: revealed && isRight ? "0 12px 0 rgba(20,120,50,0.5), 0 22px 40px rgba(20,10,60,0.35)" : `0 10px 0 ${shade(accent, 0.14)}, 0 18px 30px rgba(20,10,60,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", opacity: dim * optIn, transform: `scale(${optIn * grow})` }}>
                <span style={{ fontSize: 104, fontWeight: 800, color: col, lineHeight: 1 }}>{opt}</span>
                {revealed && isRight && <span style={{ position: "absolute", top: -22, right: -18, fontSize: 64 }}>✅</span>}
              </div>
            );
          })}
        </div>

        {/* one slot below the options: 3·2·1 countdown circle → then the answer */}
        <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {revealed ? (
            <div style={{ color: "#fff", fontSize: 64, fontWeight: 800, textShadow: HEAD_SHADOW, transform: `scale(${0.9 + 0.1 * revealPop})` }}>
              {r.letter} for {r.word}!
            </div>
          ) : counting ? (
            <div style={{ width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.22)", border: "6px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 30px rgba(20,10,60,0.32)", transform: `scale(${1.18 - 0.18 * cdT})` }}>
              <span style={{ fontSize: 108, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{cdNum}</span>
            </div>
          ) : null}
        </div>
      </div>

      <Confetti frame={frame} fps={fps} burstFrame={REVEAL + 2} origin={{ x: 540, y: 940 }} colors={["#FFC24A", "#FF8A5B", "#FFFFFF", "#8FD173", "#67E8F9"]} count={28} seed={r.letter.charCodeAt(0)} />
    </AbsoluteFill>
  );
};

// ── hook ─────────────────────────────────────────────────────────────────────
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <Sequence from={8} durationInFrames={70}><Audio src={staticFile("audio/shorts/vo_which_letter.mp3")} /></Sequence>
      <Sequence from={70} durationInFrames={30}><Audio src={staticFile("audio/shorts/vo_ready.mp3")} /></Sequence>
      <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 42, padding: `0 ${SIDE}px`, boxSizing: "border-box" }}>
        {/* a thinking icon above the title */}
        <div style={{ fontSize: 132, lineHeight: 1, transform: `scale(${inn}) translateY(${bob(frame, fps, 10, 2.5)}px)` }}>🤔</div>
        <div style={{ fontSize: 122, fontWeight: 800, color: "#fff", textAlign: "center", transform: `scale(${inn})`, textShadow: HEAD_SHADOW }}>
          Which <span style={{ color: "#FFE14D" }}>letter?</span> 🔤
        </div>
        <Pill size={48}><div style={{ textAlign: "center", lineHeight: 1.2 }}>look at the picture<br />guess the first letter!</div></Pill>
        {/* the picture pieces they'll see */}
        <div style={{ display: "flex", gap: 18, marginTop: 8 }}>
          {ROUNDS.map((r, i) => {
            const s = spring({ frame: frame - 16 - i * 5, fps, config: { damping: 12 } });
            return (
              <div key={r.letter} style={{ width: 150, height: 150, borderRadius: 26, background: "#fff", boxShadow: "0 8px 0 rgba(20,10,60,0.16)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${s}) translateY(${bob(frame, fps, 6, 2.3, i)}px)` }}>
                <Img src={staticFile(`letters/${r.image}.png`)} style={{ width: 116, height: 116, objectFit: "contain" }} />
              </div>
            );
          })}
        </div>
        <div style={{ transform: `translateY(${bob(frame, fps, 10, 2.1)}px)`, marginTop: 6 }}><Mascot size={200} /></div>
      </div>
    </AbsoluteFill>
  );
};

// ── end — comment CTA ─────────────────────────────────────────────────────────
const End: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame, fps, config: { damping: 12 } });
  const rowIn = spring({ frame: frame - 12, fps, config: { damping: 12 } });
  const ctaIn = spring({ frame: frame - 34, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <Sequence from={6} durationInFrames={40}><Audio src={staticFile("audio/common/woohoo.mp3")} volume={0.9} /></Sequence>
      <Sequence from={26} durationInFrames={66}><Audio src={staticFile("audio/shorts/vo_how_many.mp3")} /></Sequence>
      <Sequence from={92} durationInFrames={70}><Audio src={staticFile("audio/shorts/vo_comment.mp3")} /></Sequence>

      <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 42, padding: `0 ${SIDE}px`, boxSizing: "border-box" }}>
        <div style={{ fontSize: 116, lineHeight: 1, transform: `scale(${inn}) translateY(${bob(frame, fps, 10, 2.4)}px)` }}>🏆</div>
        <div style={{ fontSize: 84, fontWeight: 800, color: "#fff", textAlign: "center", transform: `scale(${inn})`, textShadow: HEAD_SHADOW }}>
          How many did<br />they get?
        </div>
        {/* the four quiz letters */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, transform: `scale(${rowIn})` }}>
          {QUIZ_LETTERS.map((ch) => {
            const c = letterColorFor(ch, "#5B50D6");
            return (
              <div key={ch} style={{ width: 124, height: 124, borderRadius: 24, background: "#fff", boxShadow: `0 8px 0 ${shade(c, 0.12)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 76, fontWeight: 800, color: c }}>{ch}</span>
              </div>
            );
          })}
        </div>
        <div style={{ opacity: ctaIn, transform: `scale(${ctaIn * pulse(frame, fps, 0.03, 1.1)})`, marginTop: 6 }}>
          <Pill bg="#FFE14D" color={palette.ink} size={64} pad="16px 52px">💬 Comment their score! 👇</Pill>
        </div>
        <div style={{ color: "#fff", fontSize: 44, fontWeight: 700, opacity: ctaIn, textShadow: HEAD_SHADOW }}>Follow for a new quiz every week 🎈</div>
        <div style={{ opacity: ctaIn, transform: `scale(${ctaIn})` }}><SocialIcons size={82} /></div>
      </div>

      <Confetti frame={frame} fps={fps} burstFrame={6} origin={{ x: 540, y: 700 }} colors={["#FFC24A", "#FF8A5B", "#FFFFFF", "#8FD173", "#67E8F9"]} count={36} seed={71} />
    </AbsoluteFill>
  );
};

// ── plan + reel ──────────────────────────────────────────────────────────────
const HOOK_F = 104;
const END_F = 180;
let _c = HOOK_F;
const BEATS = ROUNDS.map((r) => { const from = _c; _c += ROUND; return { r, from }; });
const END_FROM = _c;
export const WHICH_LETTER_DURATION = END_FROM + END_F;

export const WhichLetterReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: font.family, background: "#B1258C" }}>
      <QuizStage />

      <Audio src={staticFile("music_bed.mp3")} loop volume={(f) => interpolate(f, [0, 20, WHICH_LETTER_DURATION - 40, WHICH_LETTER_DURATION], [0, 0.055, 0.055, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <Sequence from={4} durationInFrames={40}><Audio src={staticFile("sfx/chime_soft.mp3")} volume={0.3} /></Sequence>

      {/* stage banner — same series, different quiz */}
      <div style={{ position: "absolute", top: 70, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.16)", border: "3px solid rgba(255,255,255,0.5)", borderRadius: 999, padding: "12px 34px" }}>
          <Img src={staticFile("app_icon.png")} style={{ width: 60, height: 60, borderRadius: 14 }} />
          <span style={{ fontSize: 46, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>Which Letter? · Quiz 🔤</span>
        </div>
      </div>

      <Sequence from={0} durationInFrames={HOOK_F}><Hook /></Sequence>
      {BEATS.map((b) => (
        <Sequence key={b.r.letter} from={b.from} durationInFrames={ROUND}><QuizBeat r={b.r} /></Sequence>
      ))}
      <Sequence from={END_FROM} durationInFrames={END_F}><End /></Sequence>
    </AbsoluteFill>
  );
};
