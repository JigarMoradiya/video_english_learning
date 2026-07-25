import React from "react";
import { MouthShape } from "../data/shortvowels";

// A cartoon mouth that forms the short-vowel shape and opens as the sound plays.
// `open` 0..1 drives the jaw (0 = nearly closed, 1 = full shape). Per-vowel target
// proportions mirror the app's mouth cues: A wide-open, E mid smile, I small, O round, U relaxed.
const SHAPE: Record<MouthShape, [number, number]> = {
  wide: [0.9, 0.98], // A — open wide
  mid: [0.98, 0.52], // E — wide, medium
  small: [0.82, 0.3], // I — small slit
  round: [0.56, 0.82], // O — tall round O
  relaxed: [0.7, 0.56], // U — relaxed oval
};

export const Mouth: React.FC<{ shape: MouthShape; open: number; size: number; color: string }> = ({ shape, open, size, color }) => {
  const [sw, sh] = SHAPE[shape];
  const cx = 100, cy = 100;
  const rx = 78 * sw;
  const ry = 78 * sh * Math.max(0.08, open);
  const lipRx = rx + 12, lipRy = ry + 12;
  const clip = `mo-${shape}`;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
      <defs>
        <clipPath id={clip}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
      </defs>
      {/* lips */}
      <ellipse cx={cx} cy={cy} rx={lipRx} ry={lipRy} fill="#EE7C8C" stroke={color} strokeWidth={6} />
      {/* dark opening */}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#5A1420" />
      {/* teeth + tongue, clipped inside the opening */}
      <g clipPath={`url(#${clip})`}>
        <rect x={cx - rx - 4} y={cy - ry - 2} width={rx * 2 + 8} height={ry * 0.52} rx={10} fill="#FFFFFF" />
        <ellipse cx={cx} cy={cy + ry * 0.62} rx={rx * 0.82} ry={ry * 0.62} fill="#F49BB0" />
      </g>
    </svg>
  );
};

// A friendly face that says the vowel: skin circle + eyes + the Mouth. Bobs gently; the
// vowel colour tints the outline + cheeks. `open` animates the mouth during the sound.
export const VowelFace: React.FC<{ shape: MouthShape; open: number; size: number; color: string; frame: number; fps: number }> = ({ shape, open, size, color, frame, fps }) => {
  const blink = Math.sin(frame / fps * 2.1) > 0.96 ? 0.15 : 1; // occasional blink
  const eyeR = size * 0.05;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* face */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 42% 38%, #FFE7C9, #FCD3A8)", border: `${size * 0.02}px solid ${color}`, boxShadow: `0 18px 46px ${color}33` }} />
      {/* cheeks */}
      <div style={{ position: "absolute", left: size * 0.18, top: size * 0.56, width: size * 0.16, height: size * 0.1, borderRadius: "50%", background: `${color}33` }} />
      <div style={{ position: "absolute", right: size * 0.18, top: size * 0.56, width: size * 0.16, height: size * 0.1, borderRadius: "50%", background: `${color}33` }} />
      {/* eyes */}
      {[0.36, 0.64].map((ex, i) => (
        <div key={i} style={{ position: "absolute", left: size * ex - eyeR, top: size * 0.36, width: eyeR * 2, height: eyeR * 2 * blink, borderRadius: "50%", background: "#3A2A22" }} />
      ))}
      {/* mouth */}
      <div style={{ position: "absolute", left: "50%", top: "62%", transform: "translate(-50%,-50%)" }}>
        <Mouth shape={shape} open={open} size={size * 0.6} color={color} />
      </div>
    </div>
  );
};
