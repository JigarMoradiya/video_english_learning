import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { bob, wiggle, pulse } from "../lib/motion";
import { font, palette, slab } from "../data/tokens";

// ─────────────────────────────────────────────────────────────────────────────
// Brand logo intro sting — "Blocks + Peek-a-Boo".
//   Beat 1  blocks A & V clack in       (0.00–0.47s)
//   Beat 2  bear peeks up behind them   (0.47–1.10s)
//   Beat 3  BOO! pop + sparkle + FLASH  (1.10–1.50s)   ← flash hides the swap to logo.png
//   Beat 4  real logo.png lockup springs(1.50–2.40s)
//   Beat 5  "by Vedaavi Learning" tag   (2.40–3.00s)
// The pre-reveal uses the separate bear (mascot.png) + CSS toy-blocks; the reveal
// flashes into the finished logo.png so the lockup is pixel-perfect on brand.
// Chime + SFX only (no voice), all reused from public/sfx/*.mp3.
// ─────────────────────────────────────────────────────────────────────────────

export const LOGO_INTRO_DURATION = 90; // 3.0s @ 30fps

const BLUE = "#3E9BEE"; // A block (matches logo)
const PURPLE = "#9A6CF0"; // V block (matches logo)

// A single 3D toy block with a white letter.
const Block: React.FC<{
  letter: string;
  color: string;
  cx: number; // center x on the 1080-wide stage
  top: number;
  tx: number; // fly-in offset (px)
  phase: number;
}> = ({ letter, color, cx, top, tx, phase }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const size = 232;
  return (
    <div
      style={{
        position: "absolute",
        left: cx - size / 2,
        top,
        transform: `translateX(${tx}px) translateY(${bob(frame, fps, 7, 2.4, phase)}px) rotate(${wiggle(
          frame,
          fps,
          3,
          2.2,
          phase
        )}deg)`,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 46,
          background: color,
          boxShadow: slab(color, 16),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#fff",
            fontSize: 150,
            fontWeight: 700,
            lineHeight: 1,
            textShadow: "0 5px 0 rgba(0,0,0,0.16)",
          }}
        >
          {letter}
        </span>
      </div>
    </div>
  );
};

// Bright, playful rainbow background: candy gradient + slow rotating sunburst +
// a soft center glow to seat the mascot + drifting confetti.
const RainbowBG: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const confetti = [
    { x: 0.12, y: 0.14, c: "#FF6B6B", s: 34 },
    { x: 0.86, y: 0.1, c: "#FFD93D", s: 40 },
    { x: 0.22, y: 0.32, c: "#6BCB77", s: 26 },
    { x: 0.8, y: 0.34, c: "#4D96FF", s: 30 },
    { x: 0.1, y: 0.6, c: "#B15DFF", s: 30 },
    { x: 0.9, y: 0.62, c: "#FF6B6B", s: 26 },
    { x: 0.3, y: 0.8, c: "#FFD93D", s: 34 },
    { x: 0.72, y: 0.82, c: "#6BCB77", s: 30 },
    { x: 0.5, y: 0.08, c: "#4D96FF", s: 24 },
    { x: 0.16, y: 0.88, c: "#B15DFF", s: 28 },
  ];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* candy rainbow base */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(135deg,#FF9AA2 0%,#FFDA77 22%,#B5EAD7 44%,#8FD3FF 66%,#C3A6FF 88%,#FFA6E0 100%)",
        }}
      />
      {/* slow rotating sunburst rays */}
      <AbsoluteFill
        style={{
          transform: `rotate(${(frame / fps) * 8}deg)`,
          background:
            "repeating-conic-gradient(from 0deg at 50% 46%, rgba(255,255,255,0.16) 0deg 9deg, rgba(255,255,255,0) 9deg 18deg)",
          mixBlendMode: "soft-light",
        }}
      />
      {/* soft center glow so the mascot/logo pop */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(closest-side at 50% 46%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.35) 40%, rgba(255,255,255,0) 66%)",
        }}
      />
      {/* drifting confetti */}
      {confetti.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x * width,
            top: p.y * height,
            width: p.s,
            height: p.s,
            borderRadius: i % 2 === 0 ? "50%" : 10,
            background: p.c,
            opacity: 0.75,
            transform: `translateY(${bob(frame, fps, 16, 2.6, i)}px) rotate(${wiggle(frame, fps, 18, 3, i)}deg) scale(${pulse(
              frame,
              fps,
              0.08,
              1.8,
              i
            )})`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// A radial ring of stars bursting out at the reveal moment.
const SparkleBurst: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [36, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const op = interpolate(frame, [36, 43, 54], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < 34 || frame > 56) return null;
  const N = 11;
  const colors = ["#FFD93D", "#FF6B6B", "#4D96FF", "#6BCB77", "#B15DFF"];
  return (
    <>
      {Array.from({ length: N }).map((_, i) => {
        const ang = (i / N) * Math.PI * 2;
        const r = t * 300;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx + Math.cos(ang) * r,
              top: cy + Math.sin(ang) * r,
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: colors[i % colors.length],
              opacity: op,
              transform: `translate(-50%,-50%) scale(${1 - t * 0.4})`,
              boxShadow: `0 0 18px ${colors[i % colors.length]}`,
            }}
          />
        );
      })}
    </>
  );
};

export const LogoIntroReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const cx = width / 2;

  // Beat 1 — blocks clack in (staggered springs from off-screen).
  const springA = spring({ frame, fps, config: { damping: 9, stiffness: 120, mass: 0.8 } });
  const springV = spring({ frame: frame - 2, fps, config: { damping: 9, stiffness: 120, mass: 0.8 } });
  const aTx = interpolate(springA, [0, 1], [-780, 0]);
  const vTx = interpolate(springV, [0, 1], [780, 0]);

  // Beat 2/3 — bear rises from hidden → peek → duck → pop (overshoot) → settle.
  const bearOffsetY = interpolate(
    frame,
    [0, 14, 30, 34, 40, 46, 90],
    [560, 560, 300, 320, -40, 0, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Beat 3 — flash + pre-group fade.
  const flash = interpolate(frame, [34, 39, 46], [0, 0.92, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const preOpacity = interpolate(frame, [36, 41], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Beat 4 — logo lockup springs in (flash covers the swap).
  const logoSpring = spring({ frame: frame - 40, fps, config: { damping: 11, stiffness: 130 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0.45, 1]);
  const logoOpacity = interpolate(frame, [40, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Beat 5 — brand tag.
  const tagIn = spring({ frame: frame - 70, fps, config: { damping: 13 } });
  const tagY = interpolate(tagIn, [0, 1], [30, 0]);

  const blocksTop = 940;
  const bearWidth = 500;
  const bearTop = 470;
  const revealCx = cx;
  const revealCy = 900;

  return (
    <AbsoluteFill style={{ fontFamily: font.family, overflow: "hidden" }}>
      <RainbowBG />

      {/* ── Pre-reveal stage: bear behind, blocks in front ─────────────────── */}
      <AbsoluteFill style={{ opacity: preOpacity }}>
        <Img
          src={staticFile("mascot.png")}
          style={{
            position: "absolute",
            width: bearWidth,
            height: "auto",
            left: cx - bearWidth / 2,
            top: bearTop,
            transform: `translateY(${bearOffsetY + bob(frame, fps, 6, 2.5)}px) rotate(${wiggle(frame, fps, 2, 2.4)}deg)`,
            filter: "drop-shadow(0 18px 26px rgba(30,36,56,0.22))",
          }}
        />
        <Block letter="A" color={BLUE} cx={cx - 118} top={blocksTop} tx={aTx} phase={0} />
        <Block letter="V" color={PURPLE} cx={cx + 118} top={blocksTop} tx={vTx} phase={1.4} />
      </AbsoluteFill>

      {/* ── Sparkle burst at the reveal ─────────────────────────────────────── */}
      <AbsoluteFill>
        <SparkleBurst cx={revealCx} cy={revealCy} />
      </AbsoluteFill>

      {/* ── White flash (ta-da!) ────────────────────────────────────────────── */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle at 50% 46%, #ffffff 0%, rgba(255,255,255,0.9) 45%, rgba(255,255,255,0) 78%)",
          opacity: flash,
        }}
      />

      {/* ── Logo lockup + brand tag ─────────────────────────────────────────── */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: logoOpacity }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, transform: "translateY(-60px)" }}>
          <Img
            src={staticFile("logo.png")}
            style={{
              width: 780,
              height: "auto",
              transform: `scale(${logoScale}) translateY(${bob(frame, fps, 8, 2.6)}px) rotate(${wiggle(frame, fps, 1.2, 2.4)}deg)`,
              filter: "drop-shadow(0 20px 34px rgba(30,36,56,0.28))",
            }}
          />
          <div
            style={{
              opacity: tagIn,
              transform: `translateY(${tagY}px)`,
              fontSize: 46,
              fontWeight: 500,
              color: palette.inkSoft,
              letterSpacing: 0.5,
            }}
          >
            by <span style={{ fontWeight: 700, color: palette.ink }}>Vedaavi Learning</span>
          </div>
        </div>
      </AbsoluteFill>

      {/* ── Audio (chime + SFX only, reused from public/sfx) ────────────────── */}
      <Sequence from={10} durationInFrames={20}>
        <Audio src={staticFile("sfx/boing.mp3")} volume={0.6} />
      </Sequence>
      <Sequence from={14} durationInFrames={20}>
        <Audio src={staticFile("sfx/swoosh_soft.mp3")} volume={0.5} />
      </Sequence>
      <Sequence from={36} durationInFrames={16}>
        <Audio src={staticFile("sfx/pop.mp3")} volume={0.7} />
      </Sequence>
      <Sequence from={37} durationInFrames={34}>
        <Audio src={staticFile("sfx/sparkle.mp3")} volume={0.55} />
      </Sequence>
      <Sequence from={41} durationInFrames={49}>
        <Audio src={staticFile("sfx/chime_soft.mp3")} volume={0.85} />
      </Sequence>
      <Sequence from={72} durationInFrames={18}>
        <Audio src={staticFile("sfx/twinkle.mp3")} volume={0.5} />
      </Sequence>
    </AbsoluteFill>
  );
};
