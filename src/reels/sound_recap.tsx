import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { LETTERS, LetterItem } from "../data/letters";
import { Mascot } from "../components/Mascot";
import { Confetti } from "../components/Confetti";
import { CardBadge, badgeCorner } from "../components/BrandMarks";
import { font, palette, letterColorFor, shade } from "../data/tokens";
import { bob, wiggle, pulse } from "../lib/motion";
import { sec } from "../lib/timing";

// ══ VARIETY SHORT · "Say the SOUND!" recap ═══════════════════════════════════
// Reviews the sounds posted so far, BETWEEN the daily letter shorts — so it wears
// its OWN world (The Sound Stage: vibrant gradient, floating music notes, sound-
// wave reveals, spotlight) instead of the paper letter world. SOUNDS, not names.
// RANGE grows as you post more letters.

const FPS = 30;
const RANGE: LetterItem[] = LETTERS.slice(0, 7); // A–G

const BAND_TOP = 300;
const BAND_H = 1300;
const SIDE = 80;

const LETTER_IN = 10;
const PAUSE = 15;   // "what sound?" gap
const REVEAL = 54;  // sound plays + holds
const BEAT = LETTER_IN + PAUSE + REVEAL; // 79f ≈ 2.6s per letter

// ── the world ────────────────────────────────────────────────────────────────
const NOTES = ["♪", "♫", "♩", "♬", "♪", "♫", "♩", "♬"];
const NOTE_POS = [
  { x: 90, y: 360, s: 78 }, { x: 940, y: 300, s: 92 }, { x: 150, y: 900, s: 64 },
  { x: 980, y: 980, s: 70 }, { x: 60, y: 640, s: 54 }, { x: 1010, y: 640, s: 60 },
  { x: 250, y: 1480, s: 66 }, { x: 860, y: 1520, s: 58 },
];
const BOKEH = [
  { x: 0.16, y: 0.2, r: 340 }, { x: 0.86, y: 0.16, r: 300 }, { x: 0.1, y: 0.72, r: 260 },
  { x: 0.9, y: 0.8, r: 320 }, { x: 0.5, y: 0.5, r: 420 },
];

export const SoundStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "linear-gradient(165deg,#7A5CF0 0%,#4F86F0 46%,#33C2D4 100%)" }} />
      {BOKEH.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: b.x * width - b.r / 2, top: b.y * height - b.r / 2, width: b.r, height: b.r, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,255,255,0.16), transparent)" }} />
      ))}
      <AbsoluteFill style={{ background: "radial-gradient(720px 720px at 50% 40%, rgba(255,255,255,0.26), transparent 62%)" }} />
      {NOTE_POS.map((n, i) => (
        <span key={i} style={{ position: "absolute", left: n.x, top: n.y, fontSize: n.s, color: "rgba(255,255,255,0.36)", transform: `translateY(${bob(frame, fps, 18, 3, i)}px) rotate(${wiggle(frame, fps, 10, 4, i)}deg)` }}>
          {NOTES[i]}
        </span>
      ))}
    </AbsoluteFill>
  );
};

const HEAD_SHADOW = "0 4px 0 rgba(20,10,60,0.35), 0 12px 28px rgba(20,10,60,0.35)";

// pill on the stage — bright, bold, reads on the vibrant ground
const Pill: React.FC<{ children: React.ReactNode; bg?: string; color?: string; size?: number; pad?: string }> = ({ children, bg = "#fff", color = palette.ink, size = 60, pad = "12px 40px" }) => (
  <div style={{ background: bg, color, fontSize: size, fontWeight: 800, padding: pad, borderRadius: 999, boxShadow: "0 10px 0 rgba(20,10,60,0.18), 0 18px 34px rgba(20,10,60,0.3)" }}>{children}</div>
);

// sound-wave arcs, appear on reveal
const Waves: React.FC<{ side: 1 | -1; on: number; color?: string }> = ({ side, on, color = "#fff" }) => (
  <svg width={150} height={220} viewBox="0 0 150 220" style={{ opacity: on }}>
    {[34, 66, 98].map((r, k) => (
      <path key={k} d={`M20 ${110 - r} A ${r} ${r} 0 0 ${side === 1 ? 1 : 0} 20 ${110 + r}`} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" opacity={(0.9 - k * 0.24) * on} transform={side === -1 ? "translate(150,0) scale(-1,1)" : undefined} />
    ))}
  </svg>
);

// ── one letter: show → pause → reveal the sound + word ───────────────────────
const LetterBeat: React.FC<{ it: LetterItem }> = ({ it }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = letterColorFor(it.letter, it.imageColor);
  const revealF = LETTER_IN + PAUSE;
  const asking = frame < revealF;
  const letterIn = spring({ frame, fps, config: { damping: 12 } });
  const revealPop = spring({ frame: frame - revealF, fps, config: { damping: 11 } });
  const revealOp = interpolate(frame, [revealF, revealF + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const askOp = interpolate(frame, [revealF - 6, revealF], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wavesOn = interpolate(frame, [revealF + 2, revealF + 10, revealF + 44, revealF + 52], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      {/* letter-change swoosh, then the real sound, then a soft ding.
          SFX are kept well UNDER the phonics sound so it reads clearly — the
          sparkle in particular fires on the same frame as sound_<L>, so it is
          quietest of all. */}
      <Sequence from={0} durationInFrames={16}><Audio src={staticFile("sfx/swoosh_soft.mp3")} volume={0.3} /></Sequence>
      <Sequence from={4} durationInFrames={PAUSE}><Audio src={staticFile("sfx/tick.mp3")} volume={0.16} /></Sequence>
      <Sequence from={revealF} durationInFrames={REVEAL}><Audio src={staticFile(`audio/shorts/sound_${it.letter}.mp3`)} volume={1} /></Sequence>
      <Sequence from={revealF} durationInFrames={26}><Audio src={staticFile("sfx/sparkle.mp3")} volume={0.12} /></Sequence>

      <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30, padding: `0 ${SIDE}px`, boxSizing: "border-box" }}>
        {/* the letter on a bright stage tile, sound waves burst on reveal */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${bob(frame, fps, 8, 2.8)}px)` }}>
          <div style={{ position: "absolute", left: -150 }}><Waves side={-1} on={wavesOn} color={"#fff"} /></div>
          <div style={{ position: "absolute", right: -150 }}><Waves side={1} on={wavesOn} color={"#fff"} /></div>
          <div style={{ width: 380, height: 380, borderRadius: 52, background: "#fff", boxShadow: `0 16px 0 ${shade(accent, 0.12)}, 0 30px 60px rgba(20,10,60,0.4)`, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", transform: `scale(${0.72 + 0.28 * letterIn})` }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
              <span style={{ fontSize: 236, fontWeight: 800, color: accent, lineHeight: 0.86 }}>{it.letter}</span>
              <span style={{ fontSize: 166, fontWeight: 800, color: shade(accent, 0.14), lineHeight: 0.86 }}>{it.letter.toLowerCase()}</span>
            </div>
          </div>
        </div>

        {asking && <div style={{ opacity: askOp, transform: `scale(${pulse(frame, fps, 0.05, 0.8)})` }}><Pill size={66}>What sound? 🤔</Pill></div>}

        {!asking && (
          <div style={{ opacity: revealOp, display: "flex", flexDirection: "column", alignItems: "center", gap: 26, transform: `scale(${0.9 + 0.1 * revealPop})` }}>
            <Pill bg={accent} color="#fff" size={82} pad="10px 50px">{it.soundToken.toLowerCase()} 🔊</Pill>
            <div style={{ position: "relative", width: 300, height: 300, borderRadius: 40, background: "#fff", boxShadow: "0 14px 34px rgba(20,10,60,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CardBadge size={62} corner={badgeCorner(it.word)} />
              <Img src={staticFile(`letters/${it.image}.png`)} style={{ width: 228, height: 228, objectFit: "contain" }} />
            </div>
            <div style={{ color: "#fff", fontSize: 62, fontWeight: 800, textShadow: HEAD_SHADOW }}>{it.letter} for {it.word}</div>
          </div>
        )}
      </div>

      <Confetti frame={frame} fps={fps} burstFrame={revealF + 3} origin={{ x: 540, y: 940 }} colors={["#FFC24A", "#FF8A5B", "#FFFFFF", "#8FD173", "#67E8F9"]} count={26} seed={it.letter.charCodeAt(0)} />
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
      <Sequence from={8} durationInFrames={80}><Audio src={staticFile("audio/shorts/vo_say_the_sound.mp3")} /></Sequence>
      <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30, padding: `0 ${SIDE}px`, boxSizing: "border-box" }}>
        <div style={{ fontSize: 118, fontWeight: 800, color: "#fff", textAlign: "center", transform: `scale(${inn})`, textShadow: HEAD_SHADOW }}>
          Say the <span style={{ color: "#FFE14D" }}>SOUND!</span> 🔊
        </div>
        <Pill size={48}>the sound — not "ay, bee, cee"</Pill>
        <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
          {RANGE.map((it, i) => {
            const c = letterColorFor(it.letter, it.imageColor);
            const s = spring({ frame: frame - 16 - i * 5, fps, config: { damping: 12 } });
            return (
              <div key={it.letter} style={{ width: 106, height: 106, borderRadius: 22, background: "#fff", boxShadow: `0 8px 0 ${shade(c, 0.12)}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${s}) translateY(${bob(frame, fps, 6, 2.3, i)}px)` }}>
                <span style={{ fontSize: 66, fontWeight: 800, color: c }}>{it.letter}</span>
              </div>
            );
          })}
        </div>
        <div style={{ transform: `translateY(${bob(frame, fps, 10, 2.1)}px)`, marginTop: 4 }}><Mascot size={200} /></div>
      </div>
    </AbsoluteFill>
  );
};

// ── end — big comment CTA ─────────────────────────────────────────────────────
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

      <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30, padding: `0 ${SIDE}px`, boxSizing: "border-box" }}>
        {/* icon above the title */}
        <div style={{ fontSize: 116, lineHeight: 1, transform: `scale(${inn}) translateY(${bob(frame, fps, 10, 2.4)}px)` }}>🏆</div>

        <div style={{ fontSize: 84, fontWeight: 800, color: "#fff", textAlign: "center", transform: `scale(${inn})`, textShadow: HEAD_SHADOW }}>
          How many did<br />they get?
        </div>

        {/* letters in balanced centered rows (A–D / E–G) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, transform: `scale(${rowIn})` }}>
          {[RANGE.slice(0, Math.ceil(RANGE.length / 2)), RANGE.slice(Math.ceil(RANGE.length / 2))].map((row, ri) => (
            <div key={ri} style={{ display: "flex", justifyContent: "center", gap: 14 }}>
              {row.map((it) => {
                const c = letterColorFor(it.letter, it.imageColor);
                return (
                  <div key={it.letter} style={{ width: 118, height: 118, borderRadius: 22, background: "#fff", boxShadow: `0 8px 0 ${shade(c, 0.12)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 72, fontWeight: 800, color: c }}>{it.letter}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {/* the comment ask — big, pulsing */}
        <div style={{ opacity: ctaIn, transform: `scale(${ctaIn * pulse(frame, fps, 0.03, 1.1)})`, marginTop: 6 }}>
          <Pill bg="#FFE14D" color={palette.ink} size={64} pad="16px 52px">💬 Comment their score! 👇</Pill>
        </div>
        <div style={{ color: "#fff", fontSize: 44, fontWeight: 700, opacity: ctaIn, textShadow: HEAD_SHADOW }}>A new letter every day 🎈</div>
      </div>

      <Confetti frame={frame} fps={fps} burstFrame={6} origin={{ x: 540, y: 700 }} colors={["#FFC24A", "#FF8A5B", "#FFFFFF", "#8FD173", "#67E8F9"]} count={36} seed={99} />
    </AbsoluteFill>
  );
};

// ── plan + reel ──────────────────────────────────────────────────────────────
const HOOK_F = 96;
const END_F = 180; // room for: woohoo → "how many?" → "comment below!"
let _c = HOOK_F;
const BEATS = RANGE.map((it) => { const from = _c; _c += BEAT; return { it, from }; });
const END_FROM = _c;
export const SOUND_RECAP_DURATION = END_FROM + END_F;

export const SoundRecapReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: font.family, background: "#4F86F0" }}>
      <SoundStage />

      <Audio src={staticFile("music_bed.mp3")} loop volume={(f) => interpolate(f, [0, 20, SOUND_RECAP_DURATION - 40, SOUND_RECAP_DURATION], [0, 0.055, 0.055, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <Sequence from={4} durationInFrames={40}><Audio src={staticFile("sfx/chime_soft.mp3")} volume={0.34} /></Sequence>

      {/* stage banner (its own look — not the paper title) */}
      <div style={{ position: "absolute", top: 70, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.16)", border: "3px solid rgba(255,255,255,0.5)", borderRadius: 999, padding: "12px 34px" }}>
          <Img src={staticFile("app_icon.png")} style={{ width: 60, height: 60, borderRadius: 14 }} />
          <span style={{ fontSize: 46, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>Sound Quiz · A–Z 🔊</span>
        </div>
      </div>

      <Sequence from={0} durationInFrames={HOOK_F}><Hook /></Sequence>
      {BEATS.map((b) => (
        <Sequence key={b.it.letter} from={b.from} durationInFrames={BEAT}><LetterBeat it={b.it} /></Sequence>
      ))}
      <Sequence from={END_FROM} durationInFrames={END_F}><End /></Sequence>
    </AbsoluteFill>
  );
};
