import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font, palette } from "../data/tokens";
import { bob } from "../lib/motion";

// ── THE SMOOTHIE BAR — L4's 9:16 world ──────────────────────────────────────
// Every video wears its own world, and this one is chosen for the WORD it teaches:
// blending. Three fruits go into the jar and come out as one drink, which is exactly what
// c-a-t does. The jar is tall, so the vertical frame IS the machine — nothing had to be
// squeezed sideways to fit a portrait crop.
//
// It shares the app's letter colours with the Sandwich Shop because those are the APP's,
// not the world's: blue consonant, red vowel. Everything else here is its own.
export const VOWEL = "#FF5252";
export const VOWEL_D = "#C62828";
export const CONSONANT = "#2979FF";
export const CONSONANT_D = "#1565C0";

const WALL = "#FFF3E2";
const WALL_D = "#FBE3C6";
const BAR = "#7C4A2D";
const BAR_L = "#A9673D";
const GLASS = "rgba(226,246,255,0.55)";
const CHROME = "#C9D2DA";
const CHROME_D = "#7C8791";

/** 1080×1920.
 *  The vertical order is the whole point: title · groups · word list · THE CUPS · THE JAR.
 *  The list has to sit ABOVE the cups, not between them and the jar — with it in between,
 *  the cups appear to fall into a list rather than into the blender, and the one metaphor
 *  this world exists for stops reading.
 *  The jar's foot is pinned to the bar (jarTop + body 330 + base 90 = barY) so it stands
 *  on the counter instead of floating over it. */
export const bands9 = (width: number, height: number) => {
  const barY = 1612;
  const jarTop = barY - 90 - 330;
  return {
    // the bunting's deepest flag reaches y142 at the centre, so the title clears it
    bannerTop: 190,
    stripTop: 302,
    listTop: 384,
    listBot: 536,
    stageTop: 566,
    stageBot: jarTop - 62,
    jarTop,
    barY,
    contentL: 56,
    contentR: width - 56,
    floorY: height,
  };
};

// The group badges are the APP's — 🍎pple 🥚gg 🍦ce-cream 🐙ctopus ☂️mbrella — because
// each one STARTS WITH ITS VOWEL. A fruit set (strawberry, banana, kiwi...) matched the
// bar but taught nothing: no child gets "a" from a strawberry. The fruit stays where it
// belongs, as the crates on the counter.

// ── one letter, as a fruit cup on the rail above the jar ────────────────────
export const LetterCup: React.FC<{
  letter: string; vowel: boolean; size: number;
  lit?: boolean; dim?: boolean; blank?: boolean;
}> = ({ letter, vowel, size, lit = false, dim = false, blank = false }) => {
  const a = vowel ? VOWEL : CONSONANT;
  const b = vowel ? VOWEL_D : CONSONANT_D;
  return (
    <div
      style={{
        width: size, height: size * 1.12, position: "relative",
        filter: dim ? "saturate(0.75) brightness(1.06)" : "none",
        opacity: dim ? 0.5 : 1,
        transform: `scale(${lit ? 1.08 : 1})`,
      }}
    >
      {/* the cup */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: blank
            ? "repeating-linear-gradient(135deg,#F3E7D4 0 12px,#EADCC2 12px 24px)"
            : `linear-gradient(180deg, ${a} 0%, ${b} 100%)`,
          border: blank ? "6px dashed #C9AE84" : "none",
          // a tapered cup, not a square: narrower at the foot
          clipPath: "polygon(4% 0%, 96% 0%, 84% 100%, 16% 100%)",
          borderRadius: 18,
          boxShadow: lit
            ? `0 0 0 7px rgba(255,255,255,0.9), 0 16px 34px ${vowel ? "rgba(198,40,40,0.45)" : "rgba(21,101,192,0.45)"}`
            : "0 12px 22px rgba(70,40,20,0.22)",
        }}
      />
      {/* the letter */}
      {!blank && (
        <div
          style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: size * 0.62, fontWeight: 800, color: "#fff",
            textShadow: "0 4px 0 rgba(0,0,0,0.16)", paddingBottom: size * 0.06,
          }}
        >
          {letter}
        </div>
      )}
      {blank && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: size * 0.5, fontWeight: 800,
                      color: "#B99A6B", paddingBottom: size * 0.06 }}>?</div>
      )}
      {/* the straw — it is what makes it a drink and not a box */}
      {!blank && (
        <div
          style={{
            position: "absolute", left: "62%", top: -size * 0.24, width: size * 0.075,
            height: size * 0.32, borderRadius: size * 0.04,
            background: "repeating-linear-gradient(180deg,#FFFFFF 0 8px,#FF7BA8 8px 16px)",
            transform: "rotate(11deg)", boxShadow: "0 3px 6px rgba(70,40,20,0.2)",
          }}
        />
      )}
    </div>
  );
};

// ── the finished drink — the three, blended ─────────────────────────────────
export const BlendedDrink: React.FC<{ word: string; size: number; lit?: boolean }> = ({
  word, size, lit = false,
}) => (
  <div style={{ position: "relative", width: size * 1.9, height: size * 1.12 }}>
    <div
      style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg,#FFD98A 0%,#F6B45C 46%,#E88F3C 100%)",
        clipPath: "polygon(3% 0%, 97% 0%, 89% 100%, 11% 100%)",
        borderRadius: 22,
        boxShadow: lit
          ? "0 0 0 8px rgba(255,255,255,0.92), 0 18px 40px rgba(200,120,40,0.45)"
          : "0 14px 26px rgba(70,40,20,0.25)",
      }}
    />
    {/* a creamy top, so it reads as a drink rather than a slab */}
    <div style={{ position: "absolute", left: "8%", top: -size * 0.055, width: "84%",
                  height: size * 0.12, borderRadius: "50%",
                  background: "linear-gradient(180deg,#FFF7E4 0%,#FFE6B8 100%)",
                  boxShadow: "0 3px 0 rgba(200,150,80,0.35)" }} />
    <div
      style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center",
        justifyContent: "center", gap: size * 0.03, paddingBottom: size * 0.05,
      }}
    >
      {word.split("").map((ch, i) => (
        <span key={i} style={{ fontSize: size * 0.56, fontWeight: 800, lineHeight: 1,
                               color: "aeiou".includes(ch) ? VOWEL_D : CONSONANT_D,
                               textShadow: "0 3px 0 rgba(255,255,255,0.6)" }}>
          {ch}
        </span>
      ))}
    </div>
    <div style={{ position: "absolute", left: "72%", top: -size * 0.3, width: size * 0.085,
                  height: size * 0.38, borderRadius: size * 0.05,
                  background: "repeating-linear-gradient(180deg,#FFFFFF 0 9px,#4FC3F7 9px 18px)",
                  transform: "rotate(13deg)", boxShadow: "0 3px 6px rgba(70,40,20,0.2)" }} />
  </div>
);

// ── the world ───────────────────────────────────────────────────────────────
export const SmoothieWorld: React.FC<{
  dim?: number;
  /** 0..1 — how hard the blender is running, drives the swirl and the shake */
  spin?: number;
  /** the shopkeeper: "bar" on the counter, "floor" below it, "off" while downloading */
  mascot?: "bar" | "floor" | "off";
}> = ({ dim = 1, spin = 0, mascot = "off" }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const B = bands9(width, height);
  const t = frame / fps;
  const shake = spin > 0 ? Math.sin(frame * 1.9) * 3.5 * spin : 0;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(176deg, ${WALL} 0%, ${WALL_D} 74%, #F6D6AE 100%)`, fontFamily: font.family }}>
      <AbsoluteFill style={{ opacity: dim }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="sbBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BAR_L} />
              <stop offset="100%" stopColor={BAR} />
            </linearGradient>
            <linearGradient id="sbChrome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHROME} />
              <stop offset="100%" stopColor={CHROME_D} />
            </linearGradient>
            <linearGradient id="sbJuice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFD98A" />
              <stop offset="100%" stopColor="#EE9B45" />
            </linearGradient>
          </defs>

          {/* tiled wall */}
          {Array.from({ length: 26 }, (_, r) => (
            <line key={`h${r}`} x1={0} y1={r * 74} x2={width} y2={r * 74} stroke="#EFD9B6" strokeWidth={2} opacity={0.5} />
          ))}
          {Array.from({ length: 16 }, (_, c) => (
            <line key={`v${c}`} x1={c * 74} y1={0} x2={c * 74} y2={B.barY} stroke="#EFD9B6" strokeWidth={2} opacity={0.5} />
          ))}

          {/* pennant bunting along the top */}
          <path d={`M0 96 Q ${width / 2} 150 ${width} 96`} stroke="#D98B5B" strokeWidth={5} fill="none" />
          {Array.from({ length: 11 }, (_, k) => {
            const x = 46 + k * (width - 92) / 10;
            const y = 96 + Math.sin((k / 10) * Math.PI) * 50;
            const c = ["#F2705B", "#F7B733", "#67C7A0", "#5BA9F2", "#C98BE0"][k % 5];
            return <path key={k} d={`M${x - 26} ${y} L${x + 26} ${y} L${x} ${y + 46} Z`} fill={c} opacity={0.92} />;
          })}

          {/* ── THE BLENDER ── the jar, its lid, and the chrome base */}
          <g transform={`translate(${width / 2} 0) rotate(${shake} 0 ${B.jarTop + 200})`}>
            {/* jar body — tapered, glassy */}
            <path
              d={`M-208 ${B.jarTop} L208 ${B.jarTop} L166 ${B.jarTop + 330} L-166 ${B.jarTop + 330} Z`}
              fill={GLASS} stroke="#BFE3F2" strokeWidth={7} strokeLinejoin="round"
            />
            {/* juice inside, rising with the spin */}
            <path
              d={`M${-208 + 42 * (1 - spin * 0.5)} ${B.jarTop + 120 - spin * 54}
                  L${208 - 42 * (1 - spin * 0.5)} ${B.jarTop + 120 - spin * 54}
                  L166 ${B.jarTop + 326} L-166 ${B.jarTop + 326} Z`}
              fill="url(#sbJuice)" opacity={0.55 + 0.4 * spin}
            />
            {/* swirl lines — only while it runs */}
            {spin > 0.05 && Array.from({ length: 3 }, (_, k) => (
              <ellipse
                key={k}
                cx={Math.sin(t * 7 + k * 2) * 42}
                cy={B.jarTop + 190 + k * 52}
                rx={110 - k * 16} ry={15}
                fill="none" stroke="#FFFFFF" strokeWidth={5} opacity={0.5 * spin}
              />
            ))}
            {/* highlight */}
            <path d={`M-170 ${B.jarTop + 22} L-142 ${B.jarTop + 22} L-118 ${B.jarTop + 300} L-146 ${B.jarTop + 300} Z`} fill="#FFFFFF" opacity={0.4} />
            {/* lid */}
            <rect x={-224} y={B.jarTop - 40} width={448} height={44} rx={20} fill="url(#sbChrome)" />
            <rect x={-58} y={B.jarTop - 66} width={116} height={30} rx={14} fill={CHROME_D} />
            {/* base */}
            <path d={`M-152 ${B.jarTop + 330} L152 ${B.jarTop + 330} L188 ${B.barY} L-188 ${B.barY} Z`} fill="url(#sbChrome)" />
            <rect x={-96} y={B.jarTop + 344} width={192} height={22} rx={11} fill="#4E585F" />
            {/* the dial, turning while it blends */}
            <g transform={`translate(0 ${B.jarTop + 392})`}>
              <circle r={31} fill="#4E585F" />
              <circle r={24} fill="#8E979F" />
              <rect x={-4} y={-22} width={8} height={21} rx={4} fill="#2C3338"
                    transform={`rotate(${spin * 300 + t * 40 * spin})`} />
            </g>
          </g>

          {/* the bar counter */}
          <rect x={0} y={B.barY} width={width} height={height - B.barY} fill="url(#sbBar)" />
          <rect x={0} y={B.barY} width={width} height={12} fill="#C08A5A" />
          {Array.from({ length: 7 }, (_, k) => (
            <rect key={k} x={k * (width / 7) + 10} y={B.barY + 30} width={width / 7 - 20} height={5} rx={3} fill="#8B5636" opacity={0.5} />
          ))}
        </svg>

        {/* fruit crates and a straw jar, standing ON the bar */}
        {/* the fruit stands to the RIGHT: the blender's foot owns the middle and the
            shopkeeper owns the left corner */}
        <div style={{ position: "absolute", left: 0, top: B.barY - 60, width, display: "flex",
                      justifyContent: "flex-end", gap: 30, paddingRight: 54,
                      fontSize: 50, pointerEvents: "none" }}>
          <span style={{ transform: `translateY(${bob(frame, fps, 4.2, 5, 0)}px)` }}>🍓</span>
          <span style={{ transform: `translateY(${bob(frame, fps, 4.6, 5, 1)}px)` }}>🍌</span>
          <span style={{ transform: `translateY(${bob(frame, fps, 4.0, 5, 2)}px)` }}>🥝</span>
          <span style={{ transform: `translateY(${bob(frame, fps, 4.4, 5, 3)}px)` }}>🫐</span>
          <span style={{ transform: `translateY(${bob(frame, fps, 4.8, 5, 4)}px)` }}>🍊</span>
        </div>

        {/* the shopkeeper — always down the LEFT, moving rather than vanishing */}
        {mascot !== "off" && (() => {
          const onFloor = mascot === "floor";
          const w = onFloor ? 176 : 210;
          const h = w * (1063 / 923);   // 923×1063, ~7px of padding under his feet
          return (
            <div style={{ position: "absolute", left: width * 0.028,
                          top: onFloor ? B.barY + 26 : B.barY - h + 8, width: w,
                          transform: `translateY(${bob(frame, fps, 3.8, 6)}px)` }}>
              {onFloor && (
                <div style={{ position: "absolute", left: -14, top: h - 28, width: w + 28, height: 38,
                              borderRadius: "50%",
                              background: "radial-gradient(ellipse at 50% 40%, #C08A5A 0%, #9A6538 62%, #7C4A2D 100%)",
                              boxShadow: "0 6px 0 rgba(60,34,18,0.5), 0 12px 22px rgba(40,22,10,0.3)" }} />
              )}
              <Img src={staticFile("mascot.png")}
                   style={{ position: "relative", width: w, display: "block",
                            transform: `rotate(${Math.sin(t * 1.1) * 2.2}deg)`,
                            filter: "drop-shadow(0 10px 14px rgba(60,40,20,0.25))" }} />
            </div>
          );
        })()}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const SB_INK = palette.ink;
