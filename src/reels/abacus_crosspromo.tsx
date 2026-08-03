import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Confetti } from "../components/Confetti";
import { TraceGlyph } from "../components/TraceGlyph";
import { font, palette, shade, letterColorFor } from "../data/tokens";
import { bob, wiggle, pulse } from "../lib/motion";

// ══ CROSS-PROMO · post on the ABACUS pages to introduce Kids English Learning ═
// Abacus (math, same team + same bear) already has the audience → hook with that
// trust, reveal the new English app with real teaching demos (tracing + phonics),
// then a free CTA with socials. Narrated (vo_promo_1..5, ElevenLabs).

const FPS = 30;
const W = 1080;
const BAND = { top: 300, h: 1320, side: 80 };

// beat lengths sized to each VO line (+lead/tail)
const B1 = 116, B2 = 110, B3 = 206, B4 = 200, B5 = 208;
export const ABACUS_PROMO_DURATION = B1 + B2 + B3 + B4 + B5;

const HEAD_SHADOW = "0 6px 0 #FFFFFF, 0 12px 26px rgba(40,30,80,0.22)";
const Head: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({ children, size = 96, color = palette.ink }) => (
  <div style={{ fontSize: size, fontWeight: 800, color, textAlign: "center", lineHeight: 1.05, textShadow: HEAD_SHADOW }}>{children}</div>
);
const Chip: React.FC<{ children: React.ReactNode; bg?: string; color?: string; size?: number }> = ({ children, bg = "#fff", color = palette.ink, size = 52 }) => (
  <div style={{ background: bg, color, fontSize: size, fontWeight: 800, padding: "12px 40px", borderRadius: 999, boxShadow: "0 10px 0 rgba(40,30,80,0.14), 0 18px 30px rgba(40,30,80,0.22)" }}>{children}</div>
);
const Band: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 30 }) => (
  <div style={{ position: "absolute", top: BAND.top, left: 0, width: W, height: BAND.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap, padding: `0 ${BAND.side}px`, boxSizing: "border-box" }}>{children}</div>
);
const VO: React.FC<{ n: number; from?: number }> = ({ n, from = 8 }) => (
  <Sequence from={from} durationInFrames={220}><Audio src={staticFile(`audio/shorts/vo_promo_${n}.mp3`)} /></Sequence>
);

// IG · YouTube · Facebook, drawn
const SocialIcons: React.FC<{ size?: number }> = ({ size = 84 }) => {
  const r = size * 0.26;
  const box = { width: size, height: size, borderRadius: r, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(40,30,80,0.3)" } as React.CSSProperties;
  return (
    <div style={{ display: "flex", gap: 22 }}>
      <div style={{ ...box, background: "linear-gradient(45deg,#F58529,#DD2A7B 52%,#8134AF)" }}>
        <div style={{ width: size * 0.5, height: size * 0.5, borderRadius: size * 0.17, border: `${size * 0.08}px solid #fff`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: size * 0.2, height: size * 0.2, borderRadius: "50%", border: `${size * 0.07}px solid #fff` }} />
          <div style={{ position: "absolute", top: size * 0.06, right: size * 0.06, width: size * 0.055, height: size * 0.055, borderRadius: "50%", background: "#fff" }} />
        </div>
      </div>
      <div style={{ ...box, background: "#FF0000" }}>
        <div style={{ width: 0, height: 0, borderLeft: `${size * 0.28}px solid #fff`, borderTop: `${size * 0.17}px solid transparent`, borderBottom: `${size * 0.17}px solid transparent`, marginLeft: size * 0.07 }} />
      </div>
      <div style={{ ...box, background: "#1877F2" }}>
        <span style={{ fontSize: size * 0.72, fontWeight: 900, color: "#fff", fontFamily: "Georgia, 'Times New Roman', serif", lineHeight: 1, marginTop: -size * 0.05 }}>f</span>
      </div>
    </div>
  );
};

const MorphCard: React.FC<{ txt: string; color: string; scale: number }> = ({ txt, color, scale }) => (
  <div style={{ width: 116, height: 116, borderRadius: 24, background: "#fff", boxShadow: `0 8px 0 ${shade(color, 0.14)}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${scale})` }}>
    <span style={{ fontSize: 74, fontWeight: 800, color }}>{txt}</span>
  </div>
);

// sound-wave arcs
const Waves: React.FC<{ side: 1 | -1; on: number; color: string }> = ({ side, on, color }) => (
  <svg width={150} height={230} viewBox="0 0 150 230" style={{ opacity: on }}>
    {[32, 62, 92].map((rr, k) => (
      <path key={k} d={`M20 ${115 - rr} A ${rr} ${rr} 0 0 ${side === 1 ? 1 : 0} 20 ${115 + rr}`} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" opacity={(0.9 - k * 0.24) * on} transform={side === -1 ? "translate(150,0) scale(-1,1)" : undefined} />
    ))}
  </svg>
);

const Floaters: React.FC<{ glyphs: string[]; color: string; opacity?: number }> = ({ glyphs, color, opacity = 0.5 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const pos = [
    { x: 0.1, y: 0.14, s: 92 }, { x: 0.86, y: 0.1, s: 108 }, { x: 0.14, y: 0.82, s: 84 },
    { x: 0.88, y: 0.8, s: 96 }, { x: 0.06, y: 0.48, s: 70 }, { x: 0.92, y: 0.5, s: 78 },
    { x: 0.3, y: 0.06, s: 66 }, { x: 0.72, y: 0.9, s: 72 },
  ];
  return (
    <>
      {pos.map((p, i) => (
        <span key={i} style={{ position: "absolute", left: p.x * width, top: p.y * height, fontSize: p.s, fontWeight: 800, color, opacity, transform: `translateY(${bob(frame, fps, 16, 3, i)}px) rotate(${wiggle(frame, fps, 8, 4, i)}deg)` }}>
          {glyphs[i % glyphs.length]}
        </span>
      ))}
    </>
  );
};

// ── beat 1 · Abacus (math) ───────────────────────────────────────────────────
const B1Abacus: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <VO n={1} />
      <Floaters glyphs={["1", "+", "2", "×", "3", "−", "7", "÷"]} color="#2E77E6" opacity={0.45} />
      <Band>
        <Head size={70}>Your little one loves</Head>
        <Img src={staticFile("kids_abacus.png")} style={{ width: 500, height: "auto", filter: "drop-shadow(0 22px 34px rgba(40,30,80,0.28))", transform: `scale(${0.82 + 0.18 * inn}) translateY(${bob(frame, fps, 10, 2.4)}px) rotate(${wiggle(frame, fps, 1.2, 3)}deg)` }} />
        <Chip bg="#2E77E6" color="#fff" size={62}>Abacus · Math 🧮</Chip>
      </Band>
    </AbsoluteFill>
  );
};

// ── beat 2 · same team → math becomes letters ────────────────────────────────
const B2Bridge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame, fps, config: { damping: 12 } });
  const card = spring({ frame: frame - 4, fps, config: { damping: 13 } });
  const arrow = interpolate(frame, [24, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <VO n={2} />
      <Band gap={40}>
        {/* the real people behind it — illustrated, warm; framed like a photo with the Abacus tag */}
        <div style={{ position: "relative", transform: `scale(${card}) translateY(${bob(frame, fps, 7, 2.2)}px)` }}>
          <div style={{ width: 440, height: 400, borderRadius: 40, overflow: "hidden", background: "#fff", padding: 12, boxSizing: "border-box", boxShadow: "0 18px 36px rgba(40,30,80,0.3)" }}>
            <Img src={staticFile("makers_people.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 22%", borderRadius: 30 }} />
          </div>
          <div style={{ position: "absolute", left: -12, bottom: -16, background: "#2E77E6", color: "#fff", fontSize: 34, fontWeight: 800, padding: "10px 24px", borderRadius: 999, boxShadow: "0 8px 18px rgba(40,30,80,0.32)", transform: `rotate(${wiggle(frame, fps, 2, 3)}deg)` }}>🧮 The Abacus team</div>
        </div>
        <div style={{ transform: `scale(${inn})` }}><Head size={78}>From the same makers 🎉</Head></div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {["1", "2", "3"].map((n, i) => <MorphCard key={n} txt={n} color="#2E77E6" scale={spring({ frame: frame - i * 4, fps, config: { damping: 12 } })} />)}
          <span style={{ fontSize: 66, opacity: arrow, transform: `scale(${arrow})` }}>➡️</span>
          {["A", "B", "C"].map((n, i) => <MorphCard key={n} txt={n} color="#E8368F" scale={spring({ frame: frame - 30 - i * 5, fps, config: { damping: 12 } })} />)}
        </div>
        <div style={{ opacity: arrow }}><Head size={54} color={palette.inkSoft}>Same fun — now in English!</Head></div>
      </Band>
      <Confetti frame={frame} fps={fps} burstFrame={34} origin={{ x: 720, y: 1100 }} colors={["#E8368F", "#FFC24A", "#5B50D6", "#67E8F9"]} count={22} seed={5} />
    </AbsoluteFill>
  );
};

// ── beat 3 · English reveal ──────────────────────────────────────────────────
const B3English: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 6, fps, config: { damping: 11, stiffness: 120 } });
  const name = spring({ frame: frame - 44, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <VO n={3} from={10} />
      <Floaters glyphs={["A", "a", "B", "b", "C", "c", "D", "e"]} color="#E8368F" opacity={0.4} />
      <Band gap={26}>
        <Img src={staticFile("logo.png")} style={{ width: 640, height: "auto", transform: `scale(${interpolate(logo, [0, 1], [0.4, 1])}) translateY(${bob(frame, fps, 8, 2.8)}px)`, filter: "drop-shadow(0 20px 36px rgba(40,30,80,0.3))" }} />
        <div style={{ opacity: name, transform: `translateY(${(1 - name) * 16}px)` }}>
          <Head size={68}>Now learn <span style={{ color: "#E8368F" }}>ENGLISH!</span> 📚</Head>
        </div>
        {/* phonics · letters · reading — appear as the VO names them */}
        <div style={{ display: "flex", gap: 18 }}>
          {([["🔊", "Phonics"], ["🔤", "Letters"], ["📖", "Reading"]] as const).map(([e, t], i) => {
            const cs = spring({ frame: frame - 66 - i * 24, fps, config: { damping: 12 } });
            return (
              <div key={t} style={{ background: "#fff", borderRadius: 26, padding: "20px 30px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, boxShadow: "0 10px 0 rgba(40,30,80,0.12), 0 18px 28px rgba(40,30,80,0.2)", transform: `scale(${cs}) translateY(${bob(frame, fps, 6, 2.4, i)}px)` }}>
                <span style={{ fontSize: 66 }}>{e}</span>
                <span style={{ fontSize: 38, fontWeight: 800, color: palette.ink }}>{t}</span>
              </div>
            );
          })}
        </div>
      </Band>
      <Confetti frame={frame} fps={fps} burstFrame={8} origin={{ x: 540, y: 760 }} colors={["#FFC24A", "#FF8A5B", "#E8368F", "#5B50D6", "#67E8F9"]} count={40} seed={3} />
    </AbsoluteFill>
  );
};

// ── beat 4 · REAL teaching demos: tracing (with a hand) + phonics sounds ──────
const TracingDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = "#2E77E6";
  const prog = interpolate(frame, [10, 74], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const inn = spring({ frame, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ fontFamily: font.family, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
      <Chip bg={accent} color="#fff" size={50}>✏️ Trace every letter</Chip>
      <div style={{ position: "relative", transform: `scale(${0.85 + 0.15 * inn})` }}>
        <div style={{ width: 400, height: 400, borderRadius: 48, background: "#fff", boxShadow: "0 18px 40px rgba(40,30,80,0.3)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          {/* the stroke draws itself with a fingertip touch riding the tip (aligned) */}
          <TraceGlyph char="A" color={accent} box={330} progress={prog} touch />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PhonicsDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = "#E8368F";
  const inn = spring({ frame, fps, config: { damping: 11 } });
  const waves = interpolate(frame, [14, 24, 78, 88], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ fontFamily: font.family, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }}>
      <Sequence from={16} durationInFrames={40}><Audio src={staticFile("audio/shorts/sound_B.mp3")} volume={0.7} /></Sequence>
      <Chip bg={accent} color="#fff" size={50}>🔊 Hear every sound</Chip>
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.85 + 0.15 * inn})` }}>
        <div style={{ position: "absolute", left: -160 }}><Waves side={-1} on={waves} color={accent} /></div>
        <div style={{ position: "absolute", right: -160 }}><Waves side={1} on={waves} color={accent} /></div>
        <div style={{ width: 340, height: 340, borderRadius: 48, background: "#fff", boxShadow: "0 18px 40px rgba(40,30,80,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxSizing: "border-box" }}>
          <span style={{ fontSize: 220, fontWeight: 800, color: accent, lineHeight: 0.86 }}>B</span>
          <span style={{ fontSize: 154, fontWeight: 800, color: shade(accent, 0.14), lineHeight: 0.86 }}>b</span>
        </div>
      </div>
      <Chip bg={accent} color="#fff" size={70}>buh 🔊</Chip>
    </AbsoluteFill>
  );
};

const FEATURES: [string, string][] = [
  ["✏️", "Tracing"], ["🔊", "Phonics"], ["📖", "Reading"],
  ["🎨", "Coloring"], ["🔤", "Words"], ["🎮", "Games"],
];

const B4Features: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ fontFamily: font.family, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "140px 56px 118px", boxSizing: "border-box" }}>
      <VO n={4} />
      <Floaters glyphs={["✏️", "🔊", "📖", "🎨", "A", "a", "★", "🔤"]} color="#5B50D6" opacity={0.2} />
      <Head size={62}>Everything to start reading!</Head>
      {/* live demo swaps: tracing → phonics, held in a fixed slot so nothing floats */}
      <div style={{ position: "relative", width: "100%", height: 560 }}>
        <Sequence from={0} durationInFrames={102}><TracingDemo /></Sequence>
        <Sequence from={102} durationInFrames={98}><PhonicsDemo /></Sequence>
      </div>
      {/* everything the app includes — fills the frame + backs up the promise */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, maxWidth: 900 }}>
        {FEATURES.map(([e, t], i) => {
          const s = spring({ frame: frame - 16 - i * 5, fps, config: { damping: 12 } });
          return (
            <div key={t} style={{ width: 282, boxSizing: "border-box", background: "#fff", borderRadius: 26, padding: "16px 22px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 8px 0 rgba(40,30,80,0.1), 0 16px 24px rgba(40,30,80,0.16)", transform: `scale(${s}) translateY(${bob(frame, fps, 6, 2, i)}px)` }}>
              <span style={{ fontSize: 46 }}>{e}</span>
              <span style={{ fontSize: 38, fontWeight: 800, color: palette.ink }}>{t}</span>
            </div>
          );
        })}
      </div>
      <Chip bg="#5B50D6" color="#fff" size={48}>Safe &amp; 100% ad-free 💜</Chip>
    </AbsoluteFill>
  );
};

// ── beat 5 · free CTA + socials ──────────────────────────────────────────────
const B5Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame, fps, config: { damping: 12 } });
  const badge = spring({ frame: frame - 18, fps, config: { damping: 11 } });
  const apple = spring({ frame: frame - 30, fps, config: { damping: 11 } });
  const social = spring({ frame: frame - 44, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <VO n={5} from={12} />
      <Band gap={22}>
        <Img src={staticFile("app_icon.png")} style={{ width: 240, borderRadius: 52, boxShadow: "0 22px 44px rgba(40,30,80,0.3)", transform: `scale(${0.8 + 0.2 * inn}) translateY(${bob(frame, fps, 8, 2.6)}px)` }} />
        <Head size={90}>Get it <span style={{ color: "#E8368F" }}>FREE!</span></Head>
        <div style={{ display: "flex", gap: 24 }}>
          <Img src={staticFile("appstore.png")} style={{ width: 320, height: "auto", transform: `scale(${apple})` }} />
          <Img src={staticFile("playstore.png")} style={{ width: 320, height: "auto", transform: `scale(${badge})` }} />
        </div>
        <div style={{ opacity: social, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginTop: 6 }}>
          <SocialIcons size={82} />
          <div style={{ transform: `scale(${pulse(frame, fps, 0.03, 1.2)})` }}>
            <Chip bg="#FFE14D" color={palette.ink} size={42}>Follow @kidsenglishlearning.vedaavi</Chip>
          </div>
        </div>
      </Band>
      <Confetti frame={frame} fps={fps} burstFrame={6} origin={{ x: 540, y: 700 }} colors={["#FFC24A", "#FF8A5B", "#E8368F", "#5B50D6", "#67E8F9"]} count={36} seed={9} />
    </AbsoluteFill>
  );
};

// ── reel ─────────────────────────────────────────────────────────────────────
export const AbacusPromoReel: React.FC = () => {
  const c2 = B1, c3 = B1 + B2, c4 = B1 + B2 + B3, c5 = B1 + B2 + B3 + B4;
  return (
    <AbsoluteFill style={{ fontFamily: font.family, background: "#8FD3FF" }}>
      <AbsoluteFill style={{ background: "linear-gradient(162deg,#9AD6FF 0%,#C3A6FF 48%,#FFCDE3 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(760px 520px at 50% 12%, rgba(255,255,255,0.7), transparent 60%)" }} />

      <Audio src={staticFile("music_bed.mp3")} loop volume={(f) => interpolate(f, [0, 20, ABACUS_PROMO_DURATION - 40, ABACUS_PROMO_DURATION], [0, 0.06, 0.06, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <Sequence from={c2 - 4} durationInFrames={30}><Audio src={staticFile("sfx/swoosh_soft.mp3")} volume={0.35} /></Sequence>
      <Sequence from={c3 + 2} durationInFrames={40}><Audio src={staticFile("sfx/sparkle.mp3")} volume={0.4} /></Sequence>
      <Sequence from={c5 + 2} durationInFrames={40}><Audio src={staticFile("sfx/chime_soft.mp3")} volume={0.34} /></Sequence>

      <Sequence from={0} durationInFrames={B1}><B1Abacus /></Sequence>
      <Sequence from={c2} durationInFrames={B2}><B2Bridge /></Sequence>
      <Sequence from={c3} durationInFrames={B3}><B3English /></Sequence>
      <Sequence from={c4} durationInFrames={B4}><B4Features /></Sequence>
      <Sequence from={c5} durationInFrames={B5}><B5Cta /></Sequence>
    </AbsoluteFill>
  );
};
