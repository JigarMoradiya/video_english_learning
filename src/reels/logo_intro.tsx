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
import { font, palette } from "../data/tokens";

// ─────────────────────────────────────────────────────────────────────────────
// Brand logo intro — the REAL logo sliced into clean, hole-free pieces that
// assemble into the exact original logo (cut from logo.png → reconstruct it
// pixel-for-pixel):
//   character (bear + A/V blocks + paws, one solid cutout) → ENGLISH → FOR KIDS → sparkles
// Keeping bear+blocks together avoids any interlocking-seam artifacts.
// Chime + SFX only. Responsive (9:16 + 16:9). `speed` gives the fast reel-flash cut.
// ─────────────────────────────────────────────────────────────────────────────

export const LOGO_INTRO_DURATION = 96; // 3.2s @ 30fps
export const LOGO_INTRO_FLASH_DURATION = 38; // ~1.25s reel/shorts cut

// audio cue table (base frames @ speed 1)
const CUES: { f: number; s: string; v: number; d: number }[] = [
  { f: 10, s: "boing", v: 0.6, d: 20 },
  { f: 19, s: "tick", v: 0.6, d: 16 },
  { f: 33, s: "tick", v: 0.5, d: 16 },
  { f: 44, s: "sparkle", v: 0.6, d: 34 },
  { f: 46, s: "brand_chime", v: 0.95, d: 46 },
  { f: 62, s: "twinkle", v: 0.5, d: 18 },
];

const appear = (frame: number, start: number) =>
  interpolate(frame, [start, start + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const RainbowBG: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const confetti = [
    { x: 0.12, y: 0.14, c: "#FF6B6B", s: 34 },
    { x: 0.86, y: 0.1, c: "#FFD93D", s: 40 },
    { x: 0.22, y: 0.3, c: "#6BCB77", s: 26 },
    { x: 0.82, y: 0.32, c: "#4D96FF", s: 30 },
    { x: 0.1, y: 0.62, c: "#B15DFF", s: 30 },
    { x: 0.9, y: 0.64, c: "#FF6B6B", s: 26 },
    { x: 0.3, y: 0.82, c: "#FFD93D", s: 34 },
    { x: 0.72, y: 0.84, c: "#6BCB77", s: 30 },
    { x: 0.5, y: 0.07, c: "#4D96FF", s: 24 },
    { x: 0.16, y: 0.9, c: "#B15DFF", s: 28 },
  ];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{ background: "linear-gradient(135deg,#FF9AA2 0%,#FFDA77 22%,#B5EAD7 44%,#8FD3FF 66%,#C3A6FF 88%,#FFA6E0 100%)" }}
      />
      <AbsoluteFill
        style={{
          transform: `rotate(${(frame / fps) * 8}deg)`,
          background: "repeating-conic-gradient(from 0deg at 50% 45%, rgba(255,255,255,0.16) 0deg 9deg, rgba(255,255,255,0) 9deg 18deg)",
          mixBlendMode: "soft-light",
        }}
      />
      <AbsoluteFill
        style={{ background: "radial-gradient(closest-side at 50% 45%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.3) 42%, rgba(255,255,255,0) 68%)" }}
      />
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
            opacity: 0.72,
            transform: `translateY(${bob(frame, fps, 16, 2.6, i)}px) rotate(${wiggle(frame, fps, 18, 3, i)}deg) scale(${pulse(frame, fps, 0.08, 1.8, i)})`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const Piece: React.FC<{ name: string; transform: string; origin: string; opacity?: number; z: number }> = ({
  name,
  transform,
  origin,
  opacity = 1,
  z,
}) => (
  <Img
    src={staticFile(`intro/${name}.png`)}
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "contain",
      opacity,
      transform,
      transformOrigin: origin,
      zIndex: z,
      filter: "drop-shadow(0 14px 22px rgba(30,36,56,0.20))",
    }}
  />
);

const LogoIntroCore: React.FC<{ speed?: number }> = ({ speed = 1 }) => {
  const rf = useCurrentFrame();
  const frame = rf * speed; // scaled time drives the animation (fast for the flash cut)
  const { fps, width, height } = useVideoConfig();
  const portrait = height > width;

  const sChar = spring({ frame, fps, config: { damping: 11, stiffness: 120 } });
  const sEng = spring({ frame: frame - 18, fps, config: { damping: 13, stiffness: 120 } });
  const sFor = spring({ frame: frame - 32, fps, config: { damping: 13, stiffness: 120 } });
  const sSpk = spring({ frame: frame - 44, fps, config: { damping: 10, stiffness: 150 } });
  const sTag = spring({ frame: frame - 62, fps, config: { damping: 13 } });

  const charT = `translateY(${interpolate(sChar, [0, 1], [300, 0])}px) scale(${interpolate(sChar, [0, 1], [0.6, 1])})`;
  const engT = `translateY(${interpolate(sEng, [0, 1], [240, 0])}px) scale(${interpolate(sEng, [0, 1], [0.85, 1])})`;
  const forT = `translateY(${interpolate(sFor, [0, 1], [180, 0])}px)`;
  const spkT = `scale(${interpolate(sSpk, [0, 1], [0.3, 1])}) rotate(${interpolate(sSpk, [0, 1], [-18, 0])}deg)`;

  // responsive stage (square logo canvas centred, upper-middle in portrait)
  const stageW = portrait ? 1000 : 740;
  const stageLeft = (width - stageW) / 2;
  const stageTop = portrait ? 400 : (height - stageW) / 2 - 24;
  const tagTop = stageTop + stageW * 0.9 + (portrait ? 30 : 12);
  const tagSize = portrait ? 46 : 34;

  const groupBob = bob(frame, fps, 6, 2.9);
  const pop = 1 + interpolate(frame, [44, 49, 56], [0, 0.05, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagY = interpolate(sTag, [0, 1], [30, 0]);

  return (
    <AbsoluteFill style={{ fontFamily: font.family, overflow: "hidden" }}>
      <RainbowBG />

      <div
        style={{
          position: "absolute",
          left: stageLeft,
          top: stageTop,
          width: stageW,
          height: stageW,
          transform: `translateY(${groupBob}px) scale(${pop})`,
          transformOrigin: "center center",
        }}
      >
        <Piece name="sparkles" transform={spkT} origin="50% 34%" opacity={appear(frame, 44)} z={1} />
        <Piece name="character" transform={charT} origin="50% 42%" z={2} />
        <Piece name="english" transform={engT} origin="50% 70%" opacity={appear(frame, 18)} z={3} />
        <Piece name="forkids" transform={forT} origin="51% 84%" opacity={appear(frame, 32)} z={4} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: tagTop,
          display: "flex",
          justifyContent: "center",
          opacity: sTag,
          transform: `translateY(${tagY}px)`,
          fontSize: tagSize,
          fontWeight: 500,
          color: palette.inkSoft,
        }}
      >
        by&nbsp;<span style={{ fontWeight: 700, color: palette.ink }}>Vedaavi Learning</span>
      </div>

      {CUES.map((c, i) => (
        <Sequence key={i} from={Math.round(c.f / speed)} durationInFrames={Math.max(6, Math.round(c.d / speed))}>
          <Audio src={staticFile(`sfx/${c.s}.mp3`)} volume={c.v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const LogoIntroReel: React.FC = () => <LogoIntroCore speed={1} />;
export const LogoIntroFlashReel: React.FC = () => <LogoIntroCore speed={2.5} />;
