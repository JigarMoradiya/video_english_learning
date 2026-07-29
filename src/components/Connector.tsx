import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { font, hex, palette } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";

// ── Drawn connectors, puzzled faces and signposts ───────────────────────────
// Everything in these videos had become "a card with text on it". A card can SHOW a thing,
// but it cannot show a RELATIONSHIP — and almost every phonics rule is a relationship:
// this letter causes that sound; these three letters change what the c does. A line that
// draws itself from one card to another says that in a way a caption cannot.
//
// Kept in its own file because every remaining card (g, th, ea, ow, ed, tion) teaches a
// relationship and will want the same device.

// A path that draws itself, with an arrowhead that arrives at the end of the stroke.
export const Connector: React.FC<{
  at: number;
  x1: number; y1: number; x2: number; y2: number;
  color: string;
  dur?: number;
  dip?: number;        // how far the curve bows; negative arcs upward
  label?: React.ReactNode;
  dashed?: boolean;
}> = ({ at, x1, y1, x2, y2, color, dur = 22, dip = 54, label, dashed = false }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  if (frame < at) return null;
  const c = hex(color);
  const t = interpolate(frame - at, [0, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + dip;
  const d = `M${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  // rough tangent at the end, so the arrowhead points along the curve
  const ang = (Math.atan2(y2 - my, x2 - mx) * 180) / Math.PI;
  const len = Math.hypot(x2 - x1, y2 - y1) * 1.25;
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <path
        d={d} fill="none" stroke={c} strokeWidth={10} strokeLinecap="round"
        strokeDasharray={dashed ? "16 14" : len}
        strokeDashoffset={dashed ? -frame * 1.4 : len * (1 - t)}
        opacity={dashed ? 0.9 : 1}
      />
      {t > 0.92 && (
        <g transform={`translate(${x2} ${y2}) rotate(${ang})`}>
          <path d="M-22 -13 L0 0 L-22 13" fill="none" stroke={c} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {label && t > 0.7 && (
        <foreignObject x={mx - 150} y={my - 46} width={300} height={80}>
          <div style={{ display: "flex", justifyContent: "center", fontFamily: font.family }}>
            <div style={{ background: "#FFFFFF", border: `5px solid ${c}`, borderRadius: 999, padding: "4px 20px", fontSize: 30, fontWeight: 700, color: palette.ink, whiteSpace: "nowrap" }}>
              {label}
            </div>
          </div>
        </foreignObject>
      )}
    </svg>
  );
};

// "So how do we know which sound to say?" — a puzzled child, not a bare emoji.
export const Puzzled: React.FC<{ size?: number }> = ({ size = 170 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "relative", width: size * 2.4, height: size * 1.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* question marks orbiting the head, each on its own phase */}
      {[0, 1, 2].map((i) => {
        const a = (frame / 34) + (i / 3) * Math.PI * 2;
        const r = size * 0.78 + Math.sin(frame / 15 + i) * 8;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: size * 1.2 + Math.cos(a) * r - 22,
              top: size * 0.72 + Math.sin(a) * r * 0.5 - 26,
              fontSize: 46 + i * 8, opacity: 0.55 + 0.45 * Math.abs(Math.sin(frame / 20 + i)),
              transform: `rotate(${Math.sin(frame / 18 + i) * 16}deg)`,
              color: "#8E24AA", fontWeight: 700, fontFamily: font.family,
            }}
          >
            ?
          </span>
        );
      })}
      {/* ONE figure. Two emoji side by side read as two separate people rather than as a
          single puzzled child. */}
      <span
        style={{
          fontSize: size * 1.15,
          transform: `rotate(${wiggle(frame, fps, 1.4, 7)}deg) translateY(${bob(frame, fps, 9, 2)}px) scale(${1 + 0.05 * Math.sin((frame / fps) * 3)})`,
        }}
      >
        🤷
      </span>
    </div>
  );
};

// "So what happens everywhere else?" — a signpost, so the two questions do not share a picture
export const Signpost: React.FC<{ leftLabel: string; rightLabel: string; leftTone: string; rightTone: string }> = ({ leftLabel, rightLabel, leftTone, rightTone }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 30) * 2.4;
  // The board is sized FROM the label, and the text is centred in the FLAT part only — the
  // arrow point is not usable space, which is why "any other letter" ran into the tip.
  const FS = 38;
  const CH = FS * 0.55;                 // rough advance width for this face
  const POINT = 36;
  const board = (label: string) => Math.max(230, Math.ceil(label.length * CH) + 72);
  const lw = board(leftLabel);
  const rw = board(rightLabel);
  const POST_X = 380;
  const W = POST_X + rw + POINT + 40;
  return (
    <div style={{ position: "relative", width: W, height: 330, fontFamily: font.family }}>
      <svg width={W} height={330} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`rotate(${sway} ${POST_X + 14} 310)`}>
          <rect x={POST_X} y={40} width={28} height={264} rx={12} fill="#A9713F" />

          {/* left board: the point is on its left, so the flat part starts after it */}
          <g transform={`translate(${POST_X + 14 - (lw + POINT)} 70)`}>
            <path d={`M0 38 L${POINT} 0 L${lw + POINT} 0 L${lw + POINT} 76 L${POINT} 76 Z`} fill="#FFFFFF" stroke={hex(leftTone)} strokeWidth={8} />
            <text x={POINT + lw / 2} y={52} textAnchor="middle" fontSize={FS} fontWeight="700" fill={hex(leftTone)} fontFamily={font.family}>
              {leftLabel}
            </text>
          </g>

          {/* right board: flat part first, point on its right */}
          <g transform={`translate(${POST_X + 14} 158)`}>
            <path d={`M0 0 L${rw} 0 L${rw + POINT} 38 L${rw} 76 L0 76 Z`} fill="#FFFFFF" stroke={hex(rightTone)} strokeWidth={8} />
            <text x={rw / 2} y={52} textAnchor="middle" fontSize={FS} fontWeight="700" fill={hex(rightTone)} fontFamily={font.family}>
              {rightLabel}
            </text>
          </g>
        </g>
      </svg>

      {/* a swinging lantern on the post, rather than a second question mark */}
      <svg width={110} height={120} style={{ position: "absolute", left: POST_X - 41, top: -58, overflow: "visible" }}>
        <g transform={`rotate(${Math.sin(frame / 22) * 9} 55 6)`}>
          <line x1={55} y1={0} x2={55} y2={26} stroke="#A9713F" strokeWidth={6} />
          <path d="M32 30 q 23 -12 46 0 l -6 44 l -34 0 Z" fill="#E8B84B" stroke="#A9713F" strokeWidth={5} />
          <ellipse cx={55} cy={54} rx={13} ry={16} fill="#FFF3D0" opacity={0.7 + 0.3 * Math.abs(Math.sin(frame / 14))} />
        </g>
      </svg>
    </div>
  );
};

// [ card ] —drawn arrow→ [ sound ]   with the picture on the RIGHT
export const RuleArrow: React.FC<{
  left: React.ReactNode; right: React.ReactNode; picture?: React.ReactNode;
  drawAt: number; rightAt: number; pictureAt?: number; color: string; label?: React.ReactNode;
}> = ({ left, right, picture, drawAt, rightAt, pictureAt, color, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(color);
  const t = interpolate(frame - drawAt, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26, fontFamily: font.family }}>
      {left}
      {/* the arrow draws itself between the two cards rather than simply appearing */}
      <svg width={150} height={90} style={{ overflow: "visible" }}>
        <path
          d="M6 45 L108 45" fill="none" stroke={c} strokeWidth={11} strokeLinecap="round"
          strokeDasharray={110} strokeDashoffset={110 * (1 - t)}
        />
        {t > 0.9 && <path d="M92 28 L112 45 L92 62" fill="none" stroke={c} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />}
        {label && t > 0.6 && (
          <foreignObject x={-30} y={-46} width={210} height={54}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ background: "#FFFFFF", border: `5px solid ${c}`, borderRadius: 999, padding: "2px 16px", fontSize: 26, fontWeight: 700, color: palette.ink, whiteSpace: "nowrap", fontFamily: font.family }}>
                {label}
              </div>
            </div>
          </foreignObject>
        )}
      </svg>
      <div style={{ opacity: frame >= rightAt ? 1 : 0, transform: `scale(${0.7 + 0.3 * spring({ frame: frame - rightAt, fps, config: { damping: 11 } })})` }}>
        {right}
      </div>
      {picture && (
        <div
          style={{
            marginLeft: 18,
            opacity: pictureAt === undefined || frame >= pictureAt ? 1 : 0,
            transform: `scale(${0.6 + 0.4 * spring({ frame: frame - (pictureAt ?? rightAt), fps, config: { damping: 10 } })}) translateY(${bob(frame, fps, 8, 2.4)}px) rotate(${wiggle(frame, fps, 2, 5)}deg)`,
          }}
        >
          {picture}
        </div>
      )}
    </div>
  );
};
