import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { bob, pulse, wiggle } from "../lib/motion";
import { hex, palette } from "../data/tokens";

// A letter that is a CHARACTER: the rounded LetterBuddy card + a simple face
// (two googly eyes whose pupils "look", an arc mouth). Used for the /k/ Crew.
// `morph` (0→1) drives the soft-c snake transform: c goes green, stretches, its
// eyes narrow, a forked tongue flicks and an "sss" bubble pops.

export type Mood = "happy" | "wonder" | "snake";

// linear blend between two bare-hex colours
const mix = (a: string, b: string, t: number): string => {
  const pa = parseInt(hex(a).slice(1), 16);
  const pb = parseInt(hex(b).slice(1), 16);
  const ch = (sh: number) => {
    const va = (pa >> sh) & 255;
    const vb = (pb >> sh) & 255;
    return Math.round(va + (vb - va) * t);
  };
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
};

const SNAKE_GREEN = "2E7D32";

export const LetterFace: React.FC<{
  text: string;
  colorHex: string;
  size?: number;
  phase?: number;
  mood?: Mood;
  morph?: number; // 0..1 soft-c snake transform
  look?: "l" | "c" | "r"; // pupil gaze direction
  extraStyle?: React.CSSProperties;
}> = ({ text, colorHex, size = 260, phase = 0, mood = "happy", morph = 0, look = "c", extraStyle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = Math.max(0, Math.min(1, morph));
  const c = m > 0 ? mix(colorHex, SNAKE_GREEN, m) : hex(colorHex);

  // geometry (SVG space 0..size)
  const eyeR = size * 0.12;
  const eyeY = size * 0.28;
  const eyeDX = size * 0.19;
  const pupilR = eyeR * 0.52;
  const gaze = look === "l" ? -1 : look === "r" ? 1 : 0;
  const pupilDX = gaze * eyeR * 0.34 + wiggle(frame, fps, eyeR * 0.08, 3, phase);
  const pupilDY = eyeR * 0.18;
  const cx = size / 2;

  // snake extras
  const tongue = m > 0.45 ? 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 6) : 0; // 0..1 flick
  const mouthY = size * 0.7;

  // mouth path by mood
  const mw = size * 0.22;
  const smile = `M ${cx - mw} ${mouthY} Q ${cx} ${mouthY + size * 0.11} ${cx + mw} ${mouthY}`;
  const flat = `M ${cx - mw} ${mouthY + size * 0.02} L ${cx + mw} ${mouthY + size * 0.02}`;
  const mouthPath = m > 0.2 ? flat : mood === "wonder" ? flat : smile;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        transform: `translateY(${bob(frame, fps, 9, 2.2, phase)}px) rotate(${wiggle(frame, fps, 2, 1.9, phase)}deg) scale(${pulse(
          frame,
          fps,
          0.02,
          1.7,
          phase
        )}) scaleY(${1 + m * 0.16}) skewX(${m * Math.sin((frame / fps) * Math.PI * 3) * 5}deg)`,
        ...extraStyle,
      }}
    >
      {/* card body */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: m > 0 ? mix("FFFFFF", "E8F5E9", m) : palette.card,
          border: `${Math.max(8, size * 0.04)}px solid ${c}`,
          borderRadius: size * 0.22,
          boxShadow: `0 20px 46px ${palette.cardShadow}`,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: size * 0.06,
        }}
      >
        <span style={{ fontSize: size * 0.4, fontWeight: 600, color: c, lineHeight: 1 }}>{text}</span>
      </div>

      {/* face overlay */}
      <svg width={size} height={size} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {[-1, 1].map((s) => {
          const ecx = cx + s * eyeDX;
          return (
            <g key={s}>
              <circle cx={ecx} cy={eyeY} r={eyeR} fill="#fff" stroke={c} strokeWidth={size * 0.012} />
              <circle cx={ecx + pupilDX} cy={eyeY + pupilDY} r={pupilR} fill={palette.ink} />
              <circle cx={ecx + pupilDX - pupilR * 0.3} cy={eyeY + pupilDY - pupilR * 0.3} r={pupilR * 0.32} fill="#fff" />
              {/* snake eyelid: a lid slides down to narrow the eye */}
              {m > 0 && (
                <path
                  d={`M ${ecx - eyeR - 1} ${eyeY - eyeR - 1} L ${ecx + eyeR + 1} ${eyeY - eyeR - 1} L ${ecx + eyeR + 1} ${
                    eyeY - eyeR + eyeR * 1.15 * m
                  } Q ${ecx} ${eyeY - eyeR + eyeR * 1.5 * m} ${ecx - eyeR - 1} ${eyeY - eyeR + eyeR * 1.15 * m} Z`}
                  fill={c}
                />
              )}
            </g>
          );
        })}

        {/* mouth */}
        <path d={mouthPath} fill="none" stroke={palette.ink} strokeWidth={size * 0.03} strokeLinecap="round" />

        {/* forked tongue (snake) */}
        {tongue > 0 && (
          <g transform={`translate(${cx}, ${mouthY + size * 0.02})`} opacity={tongue}>
            <path
              d={`M 0 0 L 0 ${size * (0.1 + tongue * 0.08)}`}
              stroke="#E53935"
              strokeWidth={size * 0.022}
              strokeLinecap="round"
            />
            <path
              d={`M 0 ${size * (0.1 + tongue * 0.08)} l ${-size * 0.03} ${size * 0.04} M 0 ${
                size * (0.1 + tongue * 0.08)
              } l ${size * 0.03} ${size * 0.04}`}
              stroke="#E53935"
              strokeWidth={size * 0.02}
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>

      {/* "sss" bubble */}
      {m > 0.35 && (
        <div
          style={{
            position: "absolute",
            top: -size * 0.16,
            right: -size * 0.14,
            background: "#fff",
            color: SNAKE_GREEN.startsWith("#") ? SNAKE_GREEN : `#${SNAKE_GREEN}`,
            border: `${size * 0.014}px solid #2E7D32`,
            borderRadius: size * 0.16,
            padding: `${size * 0.04}px ${size * 0.09}px`,
            fontSize: size * 0.17,
            fontWeight: 700,
            opacity: Math.min(1, (m - 0.35) * 3),
            transform: `rotate(-8deg) scale(${0.9 + 0.1 * Math.sin((frame / fps) * Math.PI * 5)})`,
          }}
        >
          sss
        </div>
      )}
    </div>
  );
};
