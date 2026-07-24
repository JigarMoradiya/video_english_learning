import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

// Hand-built vector graphics (richer + on-brand vs flat emoji).

// A bold megaphone blasting animated sound arcs — the loud-oy signature.
export const Megaphone: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <svg width={size} height={size} viewBox="0 0 150 120" style={{ overflow: "visible" }}>
      {/* sound arcs */}
      {[0, 1, 2].map((k) => {
        const p = ((t * 2 + k * 0.33) % 1);
        return (
          <path
            key={k}
            d={`M ${96 + p * 12} 40 Q ${118 + p * 20} 60 ${96 + p * 12} 80`}
            fill="none"
            stroke={color}
            strokeWidth={7}
            strokeLinecap="round"
            opacity={(1 - p) * 0.8}
          />
        );
      })}
      {/* horn */}
      <path d="M18,44 L18,76 L70,96 Q86,100 86,84 L86,36 Q86,20 70,24 Z" fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth={3} />
      {/* mouth rim */}
      <ellipse cx="84" cy="60" rx="8" ry="30" fill="#fff" opacity={0.35} />
      {/* neck + handle */}
      <rect x="10" y="52" width="14" height="16" rx="3" fill={color} />
      <rect x="34" y="74" width="12" height="26" rx="5" fill="rgba(0,0,0,0.35)" />
    </svg>
  );
};

// A cute sailboat bobbing on a little wave — the oa "middle" character.
export const Boat: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tilt = Math.sin((frame / fps) * Math.PI * 1.4) * 5;
  return (
    <svg width={size} height={size} viewBox="0 0 140 130" style={{ overflow: "visible" }}>
      <g transform={`rotate(${tilt} 70 70)`}>
        {/* mast + sail */}
        <line x1="70" y1="14" x2="70" y2="78" stroke="#8D6E63" strokeWidth={6} strokeLinecap="round" />
        <path d="M70,18 L70,72 L116,72 Z" fill="#fff" stroke="rgba(0,0,0,0.1)" strokeWidth={2} />
        <path d="M66,20 L24,72 L66,72 Z" fill={color} opacity={0.9} />
        {/* hull */}
        <path d="M18,80 L122,80 Q116,104 96,104 L44,104 Q24,104 18,80 Z" fill={color} stroke="rgba(0,0,0,0.12)" strokeWidth={3} />
        <rect x="18" y="78" width="104" height="8" rx="4" fill="#fff" opacity={0.5} />
      </g>
      {/* little water crest */}
      <path d="M6,116 q18,-14 36,0 t36,0 t36,0 t20,0" fill="none" stroke="#4FC3F7" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
    </svg>
  );
};

// A rolling wave with a curling crest — the ow "end" character.
export const Wave: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const roll = Math.sin((frame / fps) * Math.PI * 2) * 5;
  const lighter = "rgba(255,255,255,0.35)";
  return (
    <svg width={size} height={size} viewBox="0 0 150 130" style={{ overflow: "visible" }}>
      <g transform={`translate(${roll} 0)`}>
        {/* back swell (lighter) */}
        <path d="M6,110 C6,72 44,54 78,66 C104,75 122,64 146,58 L146,116 Q76,126 6,116 Z" fill={color} opacity={0.5} />
        {/* main wave with tucking curl */}
        <path
          d="M18,112 C16,74 50,52 86,66 C104,73 116,64 128,68 C118,54 126,38 140,36 C132,56 134,82 110,90 C92,96 78,86 78,72 C62,66 54,82 60,94 C46,108 34,110 18,112 Z"
          fill={color}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth={3}
        />
        <path d="M78,72 C62,66 54,82 60,94" fill="none" stroke={lighter} strokeWidth={10} strokeLinecap="round" />
        {/* foam */}
        <circle cx="112" cy="52" r="8" fill="#fff" opacity={0.9} />
        <circle cx="126" cy="44" r="5" fill="#fff" opacity={0.8} />
        <circle cx="70" cy="70" r="5" fill="#fff" opacity={0.75} />
        <circle cx="34" cy="100" r="6" fill="#fff" opacity={0.6} />
      </g>
    </svg>
  );
};

// A friendly lightbulb with a soft pulsing glow + rays — the "trick!" idea.
export const Lightbulb: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glow = 0.6 + 0.4 * Math.abs(Math.sin((frame / fps) * Math.PI * 1.5));
  return (
    <svg width={size} height={size} viewBox="0 0 120 140" style={{ overflow: "visible" }}>
      {/* glow */}
      <circle cx="60" cy="52" r="52" fill="#FFE082" opacity={0.35 * glow} />
      {/* rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={60 + Math.cos(r) * 56}
            y1={52 + Math.sin(r) * 56}
            x2={60 + Math.cos(r) * (66 + glow * 8)}
            y2={52 + Math.sin(r) * (66 + glow * 8)}
            stroke="#FFC107"
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.8 * glow}
          />
        );
      })}
      {/* bulb */}
      <circle cx="60" cy="50" r="38" fill="#FFEB3B" stroke="#FBC02D" strokeWidth={3} />
      <path d="M46,72 h28 v6 a4 4 0 0 1 -4 4 h-20 a4 4 0 0 1 -4 -4 Z" fill="#FFF59D" />
      {/* base */}
      <rect x="48" y="82" width="24" height="10" rx="2" fill="#B0BEC5" />
      <rect x="50" y="92" width="20" height="8" rx="2" fill="#90A4AE" />
      <rect x="52" y="100" width="16" height="7" rx="3" fill="#78909C" />
      {/* filament smile */}
      <path d="M50,46 Q60,58 70,46" fill="none" stroke="#FB8C00" strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
};
