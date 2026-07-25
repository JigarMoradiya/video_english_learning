import React from "react";

// Deterministic burst of confetti from `origin`, emitted at frame `burstFrame`.
// Particles fan out, fall under gravity, spin, and fade over ~1s. Deterministic
// (seeded) so Remotion renders identically every time.
const mulberry32 = (a: number) => () => {
  a |= 0; a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const Confetti: React.FC<{
  frame: number;
  fps: number;
  burstFrame: number;
  origin: { x: number; y: number };
  colors: string[];
  count?: number;
  seed?: number;
}> = ({ frame, fps, burstFrame, origin, colors, count = 26, seed = 1 }) => {
  const t = (frame - burstFrame) / fps; // seconds since burst
  if (t < 0 || t > 1.6) return null;
  const rnd = mulberry32(seed * 2654435761);
  const g = 1400; // px/s² gravity

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const ang = -Math.PI / 2 + (rnd() - 0.5) * Math.PI * 1.5; // mostly upward fan
        const speed = 500 + rnd() * 750;
        const vx = Math.cos(ang) * speed;
        const vy = Math.sin(ang) * speed;
        const x = origin.x + vx * t;
        const y = origin.y + vy * t + 0.5 * g * t * t;
        const op = t < 1 ? 1 : 1 - (t - 1) / 0.6;
        const size = 12 + rnd() * 16;
        const color = colors[i % colors.length];
        const round = rnd() > 0.5;
        const spin = (rnd() - 0.5) * 900;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: round ? size : size * 0.5,
              background: color,
              borderRadius: round ? "50%" : 3,
              opacity: Math.max(0, op),
              transform: `rotate(${spin * t}deg)`,
            }}
          />
        );
      })}
    </>
  );
};
