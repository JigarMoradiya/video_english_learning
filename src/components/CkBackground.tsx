import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

// Landscape (1920×1080) brand background for the c/k/ck YouTube video.
// Same home-style look as KidsBackground (soft 3-stop gradient + floating blurred
// colour orbs + twinkling sparkles) but DIMENSION-AWARE via useVideoConfig — so the
// shared KidsBackground.tsx stays 100% untouched and the 3 vertical reels are
// unaffected. All positions are fractional, so this fills any composition size.

const ORBS = [
  { cx: 0.08, cy: 0.18, r: 240, color: "#A78BFA", speed: 0.1, phase: 0.0, drift: 30 },
  { cx: 0.86, cy: 0.14, r: 210, color: "#60A5FA", speed: 0.08, phase: 1.5, drift: 24 },
  { cx: 0.7, cy: 0.82, r: 230, color: "#F472B6", speed: 0.11, phase: 0.8, drift: 28 },
  { cx: 0.2, cy: 0.85, r: 185, color: "#FCD34D", speed: 0.07, phase: 2.2, drift: 20 },
  { cx: 0.94, cy: 0.62, r: 175, color: "#34D399", speed: 0.12, phase: 1.0, drift: 22 },
  { cx: 0.46, cy: 0.3, r: 195, color: "#C084FC", speed: 0.09, phase: 3.1, drift: 16 },
];

const SPARKLES = [
  { cx: 0.04, cy: 0.12, size: 0.02, speed: 0.4, phase: 0.0 },
  { cx: 0.95, cy: 0.1, size: 0.016, speed: 0.35, phase: 1.2 },
  { cx: 0.3, cy: 0.9, size: 0.022, speed: 0.45, phase: 0.5 },
  { cx: 0.66, cy: 0.14, size: 0.014, speed: 0.38, phase: 2.0 },
  { cx: 0.97, cy: 0.4, size: 0.018, speed: 0.42, phase: 1.7 },
  { cx: 0.06, cy: 0.55, size: 0.013, speed: 0.3, phase: 3.0 },
  { cx: 0.52, cy: 0.05, size: 0.02, speed: 0.5, phase: 0.3 },
  { cx: 0.8, cy: 0.5, size: 0.012, speed: 0.55, phase: 2.5 },
  { cx: 0.38, cy: 0.12, size: 0.015, speed: 0.36, phase: 1.1 },
];

const sparklePoints = (cx: number, cy: number, r: number): string => {
  const ir = r * 0.25;
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 4;
    const rad = i % 2 === 0 ? r : ir;
    pts.push(`${cx + Math.cos(a) * rad},${cy + Math.sin(a) * rad}`);
  }
  return pts.join(" ");
};

export const CkBackground: React.FC<{ hueShift?: number; rScale?: number }> = ({ hueShift = 0, rScale = 1.7 }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame / fps;
  const minDim = Math.min(width, height);
  const amp = height * 0.025;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{ background: "linear-gradient(to bottom right, #F7F2FF 0%, #FDFCFF 45%, #EFF6FF 100%)" }}
      />

      {/* floating colour orbs */}
      <svg width={width} height={height} style={{ position: "absolute", filter: `hue-rotate(${hueShift}deg)` }}>
        <defs>
          {ORBS.map((o, i) => (
            <radialGradient key={i} id={`ckorb${i}`}>
              <stop offset="0%" stopColor={o.color} stopOpacity={0.26} />
              <stop offset="60%" stopColor={o.color} stopOpacity={0.09} />
              <stop offset="100%" stopColor={o.color} stopOpacity={0} />
            </radialGradient>
          ))}
        </defs>
        {ORBS.map((o, i) => {
          const cx = o.cx * width + Math.sin(t * o.speed * Math.PI + o.phase) * o.drift;
          const cy = o.cy * height + Math.cos(t * o.speed * Math.PI + o.phase + 1) * o.drift * 0.6;
          return <circle key={i} cx={cx} cy={cy} r={o.r * rScale} fill={`url(#ckorb${i})`} />;
        })}
      </svg>

      {/* twinkling sparkles */}
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {SPARKLES.map((s, i) => {
          const r = s.size * minDim;
          const cx = s.cx * width;
          const cy = s.cy * height + Math.sin(t * s.speed * Math.PI + s.phase) * amp;
          return <polygon key={i} points={sparklePoints(cx, cy, r)} fill="#6D28D9" opacity={0.1} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
