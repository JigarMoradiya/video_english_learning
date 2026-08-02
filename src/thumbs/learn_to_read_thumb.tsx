import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { font, palette, shade } from "../data/tokens";
import { cover } from "./cover";

// ── "Learn to Read — Step by Step" curriculum-spine playlist cover (1280×720) ─
//   npx remotion still thumb-learn-to-read out/thumb_learn_to_read.png
//
// A READING JOURNEY: five numbered stops on a dashed path climbing left→right to
// an open book. The path (not a bare staircase) says "follow it in order", and a
// decorated sky (clouds, sun, confetti) keeps it from reading as a plain slide.
// Stops match the real curriculum: Sounds → Recognise → Vowels → Blend → CVC.
const W = 1280;
const H = 720;
const C = cover(W, H);

const STOPS = [
  { label: "Sounds", c: "#2EB8B8" },
  { label: "Recognise", c: "#3B82F6" },
  { label: "Vowels", c: "#8B5CF6" },
  { label: "Blend", c: "#EC4899" },
  { label: "CVC Words", c: "#F5A017" },
];

const R = 60;
const CX0 = 296;
const CDX = 164;
const CY0 = 508;
const CDY = 54;
const cx = (i: number) => CX0 + i * CDX;
const cy = (i: number) => CY0 - i * CDY;
const BOOK_X = cx(4) + 150;
const BOOK_Y = cy(4) - 132;

const Cloud: React.FC<{ x: number; y: number; s: number; o?: number }> = ({ x, y, s, o = 0.9 }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: o }}>
    {[[0, 26, 46], [40, 8, 60], [92, 20, 50], [46, 34, 70]].map(([dx, dy, r], i) => (
      <div key={i} style={{ position: "absolute", left: dx * s, top: dy * s, width: r * s, height: r * s, borderRadius: "50%", background: "#FFFFFF" }} />
    ))}
  </div>
);

const CONFETTI = [
  { x: 150, y: 250, c: "#FF6B6B", s: 22 },
  { x: 1120, y: 300, c: "#4D96FF", s: 26 },
  { x: 250, y: 420, c: "#FFD93D", s: 18 },
  { x: 1180, y: 470, c: "#6BCB77", s: 22 },
  { x: 70, y: 360, c: "#B15DFF", s: 18 },
  { x: 640, y: 250, c: "#FF9F45", s: 16 },
  { x: 1050, y: 170, c: "#FF6BC1", s: 20 },
];

export const ThumbLearnToRead: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family, overflow: "hidden" }}>
    {/* sky → warm ground, with a soft sun and clouds so it isn't a flat slide */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#CDEBFF 0%,#EAF4FF 34%,#FFF3DE 66%,#FFE6C2 100%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(460px 460px at 88% 2%, #FFF3B0 0%, rgba(255,243,176,0.35) 34%, transparent 62%)" }} />
    {/* soft rolling ground */}
    <div style={{ position: "absolute", left: -60, right: -60, bottom: -160, height: 360, borderRadius: "50% 50% 0 0 / 100% 100% 0 0", background: "linear-gradient(180deg,#DFF3C8,#CDEBB0)", opacity: 0.9 }} />
    <Cloud x={120} y={150} s={1.2} o={0.95} />
    <Cloud x={880} y={120} s={1.5} o={0.9} />
    <Cloud x={560} y={92} s={0.9} o={0.75} />
    {CONFETTI.map((p, i) => (
      <div key={i} style={{ position: "absolute", left: p.x, top: p.y, width: p.s, height: p.s, borderRadius: i % 2 ? 5 : "50%", background: p.c, opacity: 0.7, transform: `rotate(${i * 25}deg)` }} />
    ))}

    {/* the dashed path connecting the stops */}
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <polyline
        points={STOPS.map((_, i) => `${cx(i)},${cy(i)}`).join(" ") + ` ${BOOK_X + 10},${BOOK_Y + 90}`}
        fill="none" stroke="#B98A55" strokeWidth={9} strokeLinecap="round" strokeDasharray="2 26" opacity={0.55}
      />
    </svg>

    {/* badge + logo */}
    <div style={{ position: "absolute", ...C.badge, color: palette.ink }}>
      AGES<br />
      <span style={C.badgeSub}>3–6</span>
    </div>
    <Img src={staticFile("logo.png")} style={{ position: "absolute", ...C.logo, height: "auto" }} />

    {/* headline + subtitle pill */}
    <div
      style={{
        position: "absolute", left: 0, top: 44, width: W, textAlign: "center",
        fontSize: C.head.fontSize, fontWeight: C.head.fontWeight, color: palette.ink,
        letterSpacing: C.head.letterSpacing, lineHeight: C.head.lineHeight, textShadow: C.head.textShadow,
      }}
    >
      LEARN TO READ
    </div>
    <div style={{ position: "absolute", left: 0, top: 172, width: W, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "#5B50D6", color: "#fff", fontSize: 32, fontWeight: 800, letterSpacing: 6, padding: "8px 26px", borderRadius: 999, boxShadow: "0 8px 18px rgba(91,80,214,0.35)" }}>
        STEP&nbsp;BY&nbsp;STEP
      </div>
    </div>

    {/* the call to action — begin the journey right here */}
    <div
      style={{
        position: "absolute", left: cx(0) - 128, top: cy(0) - R - 96, transform: "rotate(-7deg)",
        background: "linear-gradient(180deg,#3AD873,#1FAE55)", color: "#fff",
        fontSize: 33, fontWeight: 800, letterSpacing: 1, padding: "12px 26px", borderRadius: 20,
        boxShadow: "0 10px 22px rgba(20,120,50,0.4)", display: "flex", alignItems: "center", gap: 10,
      }}
    >
      START HERE <span style={{ fontSize: 36, lineHeight: 1 }}>↓</span>
    </div>

    {/* the five stops */}
    {STOPS.map((s, i) => (
      <div key={i} style={{ position: "absolute", left: cx(i) - R, top: cy(i) - R, width: R * 2, height: R * 2 }}>
        <div
          style={{
            width: R * 2, height: R * 2, borderRadius: "50%", background: s.c,
            border: "6px solid #fff", boxShadow: `0 10px 0 ${shade(s.c, 0.26)}, 0 20px 26px rgba(60,50,30,0.28)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 62, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{i + 1}</span>
        </div>
        <div style={{ position: "absolute", left: -30, top: R * 2 + 10, width: R * 2 + 60, textAlign: "center", fontSize: 26, fontWeight: 800, color: shade(s.c, 0.2) }}>
          {s.label}
        </div>
      </div>
    ))}

    {/* the payoff — an open book + spark at the top of the path */}
    <span style={{ position: "absolute", left: BOOK_X, top: BOOK_Y, fontSize: 138 }}>📖</span>
    <span style={{ position: "absolute", left: BOOK_X + 128, top: BOOK_Y - 24, fontSize: 56 }}>✨</span>

    {/* mascot at the start of the path */}
    <Img
      src={staticFile("mascot.png")}
      style={{ position: "absolute", left: 4, bottom: 20, width: C.mascot.width, height: "auto", filter: "drop-shadow(0 14px 26px rgba(30,36,56,0.34))" }}
    />
  </AbsoluteFill>
);
