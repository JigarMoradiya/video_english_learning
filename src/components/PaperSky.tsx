import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { font, palette, shade, tint } from "../data/tokens";

// ── "Paper Craft Daylight" — the world of the A–Z Letter Shorts series ───────
// Deliberately LIGHT. The other two 9:16 families are dark (purple Short Vowels,
// pink Letters P1/P2), so a daylight paper-craft world reads instantly as a
// DIFFERENT show — which is exactly what a new series needs.
//
// Sky at the top, warm paper at the bottom, so the frame reads as "cut-outs
// lying on a sunlit table" rather than a flat gradient.
export const PAPER_BG =
  "linear-gradient(180deg, #CFE9FF 0%, #E9F4FF 28%, #FFF4E2 66%, #FFE7C6 100%)";

// Per-letter sky. The SHAPE of the world stays identical — same sky-to-paper
// ramp, same clouds, same confetti — but the sky band takes a wash of the
// letter's own accent.
//
// Why: with one fixed background, six covers side by side read as a single
// continuous image, which on a Shorts feed (where episodes arrive scattered,
// not in order) looks like a video the viewer has already seen. A pale wash is
// enough to tell them apart in a thumbnail grid while still reading as one show.
// The warm paper ground is deliberately left constant — that's the brand.
export const paperBgFor = (accent: string) =>
  `linear-gradient(180deg, ${tint(accent, 0.72)} 0%, ${tint(accent, 0.88)} 30%, #FFF4E2 68%, #FFE7C6 100%)`;

// Same seeded-hash idiom as MusicNotes/RisingStars in LettersPinkFx: a pure
// function of (index, seed), so any particle's state is recoverable at any
// frame with no PRNG sequence and no React state.
const rnd = (n: number, seed: number) => {
  const x = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const MOTE_COLORS = ["#FFC24A", "#FF8A5B", "#5FC8E0", "#8FD173", "#FF9EC4", "#B79BE8"];

// This series' ambient signature: PAPER CONFETTI — rounded squares tumbling
// upward, each flipping on its own axis (scaleX cycles through 0) so they read
// as thin pieces of paper catching the light, not as flat dots.
export const PaperMotes: React.FC<{ count?: number; seed?: number }> = ({ count = 18, seed = 3 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = rnd(i, seed) * width;
        const size = 16 + rnd(i + 40, seed) * 26;
        const speed = 0.35 + rnd(i + 80, seed) * 0.6;
        const phase = rnd(i + 120, seed) * (height + 260);
        const y = height + 120 - ((frame * speed + phase) % (height + 260));
        const sway = Math.sin(frame * 0.018 + i * 1.7) * 30;
        const rot = frame * (0.5 + rnd(i + 160, seed) * 0.9) + i * 40;
        // paper flip: scaleX through zero so the piece turns edge-on
        const flip = Math.cos(frame * 0.045 + i);
        const col = MOTE_COLORS[i % MOTE_COLORS.length];
        const op = 0.22 + rnd(i + 200, seed) * 0.2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + sway,
              top: y,
              width: size,
              height: size * 0.78,
              borderRadius: size * 0.22,
              background: col,
              opacity: op,
              transform: `rotate(${rot}deg) scaleX(${flip})`,
            }}
          />
        );
      })}
    </>
  );
};

// A few slow paper clouds in the upper sky band. Deliberately sparse and very
// soft — they give the top of the frame depth without competing with the rail.
// Both the POSITION and the SHAPE come from the seed. A single fixed cloud
// silhouette repeated across 26 episodes is recognisable as the same asset even
// when it sits somewhere new, so the puff count, their radii and their heights
// are all derived per cloud — every letter gets its own skyline.
export const PaperClouds: React.FC<{ count?: number; seed?: number }> = ({ count, seed = 9 }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const n = count ?? 2 + Math.floor(rnd(99, seed) * 3); // 2–4 clouds
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const w = 240 + rnd(i, seed) * 260;
        const speed = 0.1 + rnd(i + 20, seed) * 0.2;
        const y = 110 + rnd(i + 50, seed) * 460;
        const x = ((frame * speed + rnd(i + 70, seed) * (width + w * 2)) % (width + w * 2)) - w;
        const op = 0.38 + rnd(i + 110, seed) * 0.22;
        const flip = rnd(i + 130, seed) > 0.5 ? -1 : 1;

        // 3–5 puffs of their own size, sitting on a flat base
        const puffs = 3 + Math.floor(rnd(i + 150, seed) * 3);
        const parts: React.ReactNode[] = [];
        let cursor = 16;
        let maxTop = 46;
        for (let k = 0; k < puffs; k++) {
          const rx = 13 + rnd(i * 10 + k, seed + 3) * 13;
          const ry = rx * (0.62 + rnd(i * 10 + k + 40, seed + 3) * 0.42);
          const cy = 32 - ry * (0.15 + rnd(i * 10 + k + 80, seed + 3) * 0.5);
          parts.push(<ellipse key={k} cx={cursor + rx * 0.6} cy={cy} rx={rx} ry={ry} />);
          maxTop = Math.min(maxTop, cy - ry);
          cursor += rx * 1.05;
        }
        const vbW = cursor + 18;
        const vbTop = Math.min(0, maxTop - 3);
        const vbH = 40 - vbTop;
        parts.push(<rect key="base" x={14} y={26} width={cursor - 10} height={11} rx={5.5} />);

        return (
          <svg
            key={i}
            width={w}
            height={(w * vbH) / vbW}
            viewBox={`0 ${vbTop} ${vbW} ${vbH}`}
            style={{ position: "absolute", left: x, top: y, opacity: op, transform: `scaleX(${flip})` }}
          >
            <g fill="#FFFFFF">{parts}</g>
          </svg>
        );
      })}
    </>
  );
};

// ── Paper-cut card styling ───────────────────────────────────────────────────
// The look that makes this series feel tactile instead of flat: white stock, a
// hard 1-step "thickness" edge in the accent, then a real soft drop shadow —
// so a card reads as an object resting ON the background, with a contact
// shadow, rather than a rectangle painted into it.
export const paperCard = (accent: string, radius = 44): React.CSSProperties => ({
  background: "#FFFFFF",
  borderRadius: radius,
  boxShadow: `0 3px 0 ${shade(accent, 0.12)}, 0 10px 0 ${shade(accent, 0.3)}22, 0 26px 44px rgba(92, 64, 32, 0.22)`,
});

// Soft elliptical contact shadow, sat under a floating element so it looks
// placed on a surface. `lift` 0..1 = how far off the table it currently is.
export const ContactShadow: React.FC<{ width: number; lift?: number }> = ({ width, lift = 0 }) => (
  <div
    style={{
      width: width * (1 - lift * 0.22),
      height: width * 0.13,
      borderRadius: "50%",
      background: "radial-gradient(ellipse, rgba(92,64,32,0.3) 0%, rgba(92,64,32,0.12) 48%, rgba(92,64,32,0) 72%)",
      opacity: 0.9 - lift * 0.35,
    }}
  />
);

// ── A–Z progress rail ────────────────────────────────────────────────────────
// Two rows of 13 at the TOP (the bottom band is covered by the Shorts UI).
// Signals "episode 1 of 26" so the series reads as a series and viewers know
// there's a next one. Light-theme styling — AlphabetChips is built for the dark
// pink world and its unlit chips would be invisible here.
const AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const LetterRail: React.FC<{ active: string; accent: string; startFrame?: number; size?: number }> = ({
  active,
  accent,
  startFrame = 0,
  size = 58,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows = [AZ.slice(0, 13), AZ.slice(13)];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, fontFamily: font.family }}>
      {rows.map((row, r) => (
        <div key={r} style={{ display: "flex", gap: 9 }}>
          {row.map((ch, c) => {
            const i = r * 13 + c;
            const inn = spring({ frame: frame - startFrame - i * 1.5, fps, config: { damping: 13 } });
            const on = ch === active;
            const pop = on ? 1 + 0.14 * Math.sin((frame / fps) * 3.2) : 1;
            return (
              <div
                key={ch}
                style={{
                  width: size,
                  height: size,
                  borderRadius: 15,
                  background: on ? accent : "rgba(255,255,255,0.78)",
                  color: on ? "#fff" : "rgba(30,36,56,0.34)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: size * 0.5,
                  fontWeight: 800,
                  transform: `scale(${inn * pop})`,
                  opacity: inn,
                  boxShadow: on
                    ? `0 3px 0 ${shade(accent, 0.28)}, 0 10px 22px ${accent}66`
                    : "0 2px 0 rgba(92,64,32,0.10), 0 4px 10px rgba(92,64,32,0.10)",
                }}
              >
                {ch}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Title pill for the series. Carries the brand logo, so it is the ONE logo on
// screen for the whole teaching run (the CTA card's LogoBadge only appears
// after this has left).
export const PaperTitle: React.FC<{ title: string; accent: string; logo?: React.ReactNode }> = ({ title, accent, logo }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "rgba(255,255,255,0.86)",
        borderRadius: 44,
        padding: logo ? "8px 30px 8px 12px" : "10px 32px",
        boxShadow: "0 3px 0 rgba(92,64,32,0.10), 0 10px 26px rgba(92,64,32,0.16)",
        opacity: Math.min(1, frame / 10),
        fontFamily: font.family,
      }}
    >
      {logo}
      <span style={{ fontSize: 38, fontWeight: 800, color: palette.ink }}>{title}</span>
      <span style={{ fontSize: 34, fontWeight: 800, color: accent, letterSpacing: 2 }}>A–Z</span>
    </div>
  );
};
