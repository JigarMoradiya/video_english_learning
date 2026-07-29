import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { VOWELS } from "../data/shortvowels";
import { Bird } from "../components/ChirpWire";
import { font, hex, palette, tint } from "../data/tokens";

// ── Short Vowels thumbnail (1280×720) ────────────────────────────────────────
//   npx remotion still thumb-short-vowels out/thumb_short_vowels.png
//
// Wears the video's world (The Chirp Wire) but composed for a thumbnail, not for a
// frame of the lesson. The constraint that drives everything: this is read at about
// 120px wide on a phone, so it carries FIVE elements and no more — headline, the five
// letters, the five birds, mascot, logo.
//
// It deliberately goes DARK-INK-ON-BRIGHT rather than the channel's usual white text
// on a dark ground: the Chirp Wire sky is pale, white text would need a heavy outline
// to survive on it, and a bright thumbnail also stands out in a row of dark ones.
//
// The birds sit directly beneath their own letter, in the same colour, so the pairing
// needs no label to explain it.
const W = 1280;
const H = 720;
const GOLD = "#FFC42A";
const SUN_X = 1128;
const SUN_Y = 104;
const SUN_R = 66;

const CARD_W = 156;
const CARD_H = 172;
const CARD_GAP = 26;
const ROW_W = 5 * CARD_W + 4 * CARD_GAP;   // 884
const ROW_X = Math.round((W - ROW_W) / 2); // 198
const CARD_TOP = 232;
// Lifted from 556. It cannot go higher than this: the assertion below shows the
// letter cards would then crowd the birds, and the subtitle blocks moving the cards up.
const WIRE_Y = 538;
const cardX = (i: number) => ROW_X + i * (CARD_W + CARD_GAP);
const cardCx = (i: number) => cardX(i) + CARD_W / 2;

const BIRD_SCALE = 1.18;
const MASCOT_X = 6;
const MASCOT_W = 184;
// The bird's tail reaches 63 units left of its centre, so at BIRD_SCALE the leftmost
// bird's tail tip is here. The mascot must end before it — at 208 wide it did not, and
// the bear sat on top of the "a" bird.
const FIRST_TAIL_X = cardCx(0) - 63 * BIRD_SCALE;
if (MASCOT_X + MASCOT_W > FIRST_TAIL_X) {
  throw new Error(`thumb: mascot ends ${MASCOT_X + MASCOT_W}, the a-bird's tail starts ${FIRST_TAIL_X}`);
}
if (CARD_TOP + CARD_H + 30 > WIRE_Y - 80 * BIRD_SCALE) {
  throw new Error(`thumb: letter cards end ${CARD_TOP + CARD_H}, birds start ${WIRE_Y - 80 * BIRD_SCALE}`);
}

const Sky: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <radialGradient id="tvSunCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
        <stop offset="34%" stopColor="#FFF6D0" stopOpacity={0.98} />
        <stop offset="66%" stopColor="#FFDB8C" stopOpacity={0.88} />
        <stop offset="100%" stopColor="#FFC46B" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="tvHaze" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFDFA4" stopOpacity={0.62} />
        <stop offset="55%" stopColor="#FFE9C2" stopOpacity={0.26} />
        <stop offset="100%" stopColor="#FFF3DC" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="tvRay" gradientUnits="userSpaceOnUse" cx={SUN_X} cy={SUN_Y} r={SUN_R + 190}>
        <stop offset="0%" stopColor="#FFEFC0" stopOpacity={0.62} />
        <stop offset="45%" stopColor="#FFE6AC" stopOpacity={0.36} />
        <stop offset="100%" stopColor="#FFE6AC" stopOpacity={0} />
      </radialGradient>
    </defs>

    {/* the sky, a shade richer than the lesson's — a thumbnail wants saturation */}
    <rect x={0} y={0} width={W} height={H} fill="url(#tvSkyGrad)" />
    <defs>
      <linearGradient id="tvSkyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFDDAC" />
        <stop offset="30%" stopColor="#FFEECB" />
        <stop offset="66%" stopColor="#E4F0FF" />
        <stop offset="100%" stopColor="#CFE4FF" />
      </linearGradient>
    </defs>

    <circle cx={SUN_X} cy={SUN_Y} r={SUN_R + 190} fill="url(#tvHaze)" />
    {Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      const len = i % 4 === 0 ? 176 : i % 2 === 0 ? 126 : 90;
      const r0 = SUN_R - 4;
      const half = 0.13 - 0.055 * (i % 2);
      const pt = (rr: number, aa: number) => `${SUN_X + Math.cos(aa) * rr} ${SUN_Y + Math.sin(aa) * rr}`;
      return (
        <path
          key={i}
          d={`M${pt(r0, a - half)} Q ${pt(r0 + len * 0.6, a)} ${pt(r0 + len, a)} Q ${pt(r0 + len * 0.6, a)} ${pt(r0, a + half)} Z`}
          fill="url(#tvRay)"
        />
      );
    })}
    <circle cx={SUN_X} cy={SUN_Y} r={SUN_R} fill="url(#tvSunCore)" />

    {/* clouds */}
    {[[190, 150, 0.8], [520, 108, 0.6], [880, 186, 0.7]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={0.85}>
        <ellipse cx={0} cy={10} rx={84} ry={32} fill="#CFE0F2" />
        <ellipse cx={0} cy={0} rx={80} ry={34} fill="#fff" />
        <ellipse cx={-54} cy={12} rx={48} ry={26} fill="#fff" />
        <ellipse cx={54} cy={13} rx={52} ry={24} fill="#fff" />
      </g>
    ))}

    {/* treeline, then rooftops — both pushed back so the cards stay dominant */}
    <g opacity={0.6}>
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse key={i} cx={i * 116 + 24} cy={WIRE_Y - 20 + (i % 3) * 12} rx={68} ry={40} fill="#93C08E" />
      ))}
    </g>
    <g opacity={0.6}>
      {Array.from({ length: 8 }, (_, i) => {
        const w = 176 + (i % 3) * 44;
        const x = i * 178 - 30;
        const top = WIRE_Y + 16 + (i % 2 ? 20 : 0);
        return (
          <g key={i}>
            <path d={`M${x} ${top + 28} L${x + w / 2} ${top} L${x + w} ${top + 28} Z`} fill="#B4C6DC" />
            <rect x={x + 8} y={top + 28} width={w - 16} height={H - top - 28} fill="#BACDE2" />
          </g>
        );
      })}
    </g>

    {/* poles + the wire the birds sit on */}
    {[34, W - 34].map((x) => (
      <g key={x}>
        <rect x={x - 10} y={WIRE_Y - 72} width={20} height={H - WIRE_Y + 72} fill="#A8845F" />
        <rect x={x - 56} y={WIRE_Y - 62} width={112} height={13} rx={6.5} fill="#96744F" />
      </g>
    ))}
    <path d={`M0 ${WIRE_Y - 12} Q ${W / 2} ${WIRE_Y + 20} ${W} ${WIRE_Y - 12}`} fill="none" stroke="#5C6875" strokeWidth={6} opacity={0.85} />

    {/* the five birds, each under its own letter and in its colour, all chirping */}
    {VOWELS.map((v, i) => (
      <Bird key={v.letter} x={cardCx(i)} y={WIRE_Y} color={v.color} letter={v.letter} open={1} phase={i * 1.1} active scale={BIRD_SCALE} still />
    ))}
  </svg>
);

export const ThumbShortVowels: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family, overflow: "hidden" }}>
    <Sky />

    {/* the hook, in the channel's rotated gold corner badge */}
    <div
      style={{
        position: "absolute", left: 22, top: 20, transform: "rotate(-11deg)",
        background: GOLD, color: palette.ink, borderRadius: 20, padding: "8px 20px",
        fontSize: 34, fontWeight: 800, lineHeight: 1.05, textAlign: "center",
        boxShadow: "0 10px 24px rgba(30,36,56,0.30)",
      }}
    >
      QUICK<br /><span style={{ fontSize: 24 }}>SOUND!</span>
    </div>

    {/* headline — dark ink, because the sky is pale */}
    <div
      style={{
        position: "absolute", left: 0, top: 60, width: W, textAlign: "center",
        fontSize: 104, fontWeight: 800, color: palette.ink, letterSpacing: 1,
        textShadow: "0 6px 0 #FFFFFF, 0 10px 26px rgba(30,36,56,0.22)",
      }}
    >
      SHORT VOWELS
    </div>
    <div
      style={{
        position: "absolute", left: 0, top: 172, width: W, textAlign: "center",
        fontSize: 38, fontWeight: 800, color: "#6B5B86",
      }}
    >
      not the letter's NAME!
    </div>

    {/* the five letters, on the video's own card language */}
    {VOWELS.map((v, i) => {
      const c = hex(v.color);
      return (
        <div
          key={v.letter}
          style={{
            position: "absolute", left: cardX(i), top: CARD_TOP, width: CARD_W, height: CARD_H,
            boxSizing: "border-box", background: "#fff", border: `8px solid ${c}`, borderRadius: 30,
            boxShadow: `0 14px 30px ${c}44, 0 6px 0 ${tint(v.color, 0.3)}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 118, fontWeight: 800, color: c, lineHeight: 1,
          }}
        >
          {v.letter}
        </div>
      );
    })}

    <Img
      src={staticFile("mascot.png")}
      // mascot.png has NO bottom padding — the feet are the last pixel row — so any
      // negative bottom slices them off, and 0 leaves them flush with the edge, which
      // still reads as sliced. 26 gives real clearance so it stands in front of the
      // rooftops instead of being cropped by the frame.
      style={{ position: "absolute", left: MASCOT_X, bottom: 26, width: MASCOT_W, height: "auto", filter: "drop-shadow(0 14px 26px rgba(30,36,56,0.34))" }}
    />
    <Img src={staticFile("logo.png")} style={{ position: "absolute", right: 20, bottom: 16, width: 104, height: "auto" }} />
  </AbsoluteFill>
);
