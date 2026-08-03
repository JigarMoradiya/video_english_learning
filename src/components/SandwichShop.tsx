import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font, palette } from "../data/tokens";
import { bob } from "../lib/motion";

// ── THE SANDWICH SHOP — L4 CVC Words' own world ──────────────────────────────
// Every video wears its own world. CVC's one idea is that the VOWEL IS ALWAYS IN THE
// MIDDLE, and a sandwich is the only everyday object whose whole point is that the good
// bit lives in the middle — bread, filling, bread. So the world is a bright deli: striped
// awning, a wooden counter the letter boards sit on, jars on the left, and a CHALKBOARD
// MENU on the right whose five lines are the five vowel groups. The menu ticks off as the
// video goes, which makes the decor the progress bar.
//
// Inventory-checked as distinct: Paint Studio (letters), Chirp Wire (short_vowels),
// Aquarium (recognition), Toy Workshop (L3 16:9), Rocket Tower (L3 9:16), Big Stage,
// Claw Machine, Metro, Dig Site, Snow Slope, Moonlit House. BakeryWorld exists but is a
// bakery — ovens and loaves; this is a counter, jars and a menu board.
//
// LIGHT, deliberately: the letter boards carry dark navy ink and a dim room would kill it.
export const VOWEL = "#E64A4A";      // the app's own vowel red  #FF5252 → #C62828
export const CONSONANT = "#2979FF";  // the app's own consonant blue

const CREAM = "#FFF6E6";
const CREAM_D = "#FBE9CC";
const WOOD = "#C98A47";
const WOOD_D = "#A96C33";
const AWN_R = "#E2574C";
const BOARD = "#2F4F4A";

/** "16x9" | "4x5" | "9x16" — 4:5 must NEVER inherit 9:16's numbers. They are both
 *  `height > width`, and a table tuned for a 1920-tall frame puts the counter a third of
 *  the way up a 1350-tall one. */
export const aspectOf = (width: number, height: number) =>
  height <= width ? "16x9" : height / width > 1.5 ? "9x16" : "4x5";

export const bands = (width: number, height: number) => {
  const a = aspectOf(width, height);
  if (a === "9x16") {
    return { stageTop: 300, stageBot: 900, counterY: 900, floorY: 1180,
             menuX: 0, menuW: 0, jarX: 0, contentL: 90, contentR: width - 90,
             bannerTop: 150, listTop: 950, listBot: 1090, stripTop: 214 };
  }
  if (a === "4x5") {
    // 1080×1350. There is no room for the menu board beside the stage, so the group
    // tracker becomes a strip under the title and the word list a row under the stage.
    // listBot is explicit, not derived: the counter's plates, cones and jars stand up to
    // ~54px ABOVE counterY, so a list sized off counterY alone runs straight into them.
    return { stageTop: 296, stageBot: 884, counterY: 1075, floorY: height,
             menuX: width, menuW: 0, jarX: 0, contentL: 56, contentR: width - 56,
             bannerTop: 148, listTop: 892, listBot: 1008, stripTop: 214 };
  }
  return { stageTop: 250, stageBot: 760, counterY: 760, floorY: 1000,
           menuX: width - 350, menuW: 292, jarX: 44, contentL: 320, contentR: width - 380,
           bannerTop: 150, listTop: 0, listBot: 0, stripTop: 0 };
};

/** the five vowel groups, in the app's own order — also the menu board's five lines */
export const GROUPS = [
  { key: "shortA", label: "Short A", emoji: "🍎", letter: "a" },
  { key: "shortE", label: "Short E", emoji: "🥚", letter: "e" },
  { key: "shortI", label: "Short I", emoji: "🍦", letter: "i" },
  { key: "shortO", label: "Short O", emoji: "🐙", letter: "o" },
  { key: "shortU", label: "Short U", emoji: "☂️", letter: "u" },
] as const;

export const ShopWorld: React.FC<{
  dim?: number; activeGroup?: number; doneGroups?: number; leftFree?: boolean;
  // The shopkeeper, always down the LEFT.
  //   "counter" — standing on the counter top, at the cones' and jars' level
  //   "floor"   — down on the counter's wood face on a rounded base, for when the word
  //               list holds the top-left corner
  //   "off"     — gone (the download beat)
  // He moves rather than disappearing, so the shop always has its keeper.
  mascot?: "counter" | "floor" | "off";
}> = ({ dim = 1, activeGroup = -1, doneGroups = 0, leftFree = false, mascot = "off" }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const t2 = t;
  const B = bands(width, height);
  const portrait = height > width;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(172deg, ${CREAM} 0%, ${CREAM_D} 68%, #F6DFBE 100%)`, fontFamily: font.family }}>
      <AbsoluteFill style={{ opacity: dim }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="swCounter" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D9A05B" />
              <stop offset="100%" stopColor={WOOD_D} />
            </linearGradient>
            <linearGradient id="swSteam" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* wall tiles — barely there, so it reads as texture and never as pattern */}
          {Array.from({ length: Math.ceil(B.counterY / 62) }, (_, i) => (
            <rect key={`h${i}`} x={0} y={i * 62} width={width} height={1.5} fill="#E4C79B" opacity={0.35} />
          ))}
          {Array.from({ length: Math.ceil(width / 62) }, (_, i) => (
            <rect key={`v${i}`} x={i * 62} y={0} width={1.5} height={B.counterY} fill="#E4C79B" opacity={0.28} />
          ))}

          {/* striped awning across the top, scalloped edge */}
          <g>
            <rect x={0} y={0} width={width} height={74} fill="#F6F1E6" />
            {Array.from({ length: Math.ceil(width / 92) }, (_, i) => (
              <rect key={i} x={i * 92} y={0} width={46} height={74} fill={AWN_R} opacity={0.9} />
            ))}
            {Array.from({ length: Math.ceil(width / 46) + 1 }, (_, i) => (
              <path key={`s${i}`} d={`M${i * 46} 74 a 23 23 0 0 0 46 0 z`} fill={i % 2 ? AWN_R : "#F6F1E6"} opacity={0.9} />
            ))}
            <rect x={0} y={96} width={width} height={5} fill="#C9BFA8" opacity={0.5} />
          </g>

          {/* the counter, with a front panel and a thin bright edge */}
          <rect x={0} y={B.counterY} width={width} height={B.floorY - B.counterY} fill="url(#swCounter)" />
          <rect x={0} y={B.counterY} width={width} height={9} fill="#EFC489" />
          {Array.from({ length: Math.ceil(width / 150) }, (_, i) => (
            <rect key={i} x={i * 150 + 8} y={B.counterY + 26} width={134} height={4} rx={2} fill={WOOD_D} opacity={0.4} />
          ))}
          <rect x={0} y={B.floorY} width={width} height={height - B.floorY} fill="#E8D6BA" />

          {/* The left wall — a PRICES board and a cone hanging sign. Only drawn when the
              word list is not occupying that column, so the two never stack. */}
          {!portrait && leftFree && (
            <g>
              <rect x={92} y={236} width={214} height={150} rx={14} fill="#FFFDF7" stroke="#C98A47" strokeWidth={7} />
              <rect x={112} y={262} width={174} height={9} rx={4} fill="#E2574C" opacity={0.85} />
              {[0, 1, 2].map((k) => (
                <g key={k}>
                  <rect x={112} y={294 + k * 28} width={104} height={11} rx={5} fill="#D9C7A6" />
                  <rect x={236} y={294 + k * 28} width={50} height={11} rx={5} fill="#E8B96B" />
                </g>
              ))}
              <rect x={188} y={110} width={9} height={62} fill="#B08A5A" />
              <g transform="translate(192 214)">
                <path d="M-24 -44 l 24 44 l 24 -44 z" fill="#E3B778" stroke="#C79A5C" strokeWidth={3} />
                <circle cx={0} cy={-52} r={24} fill="#F7C6D9" />
                <circle cx={-9} cy={-60} r={14} fill="#FBD9E6" />
                <circle cx={7} cy={-68} r={7} fill="#E2574C" />
              </g>
            </g>
          )}

          {/* Counter dressing. These used to be WALL furniture in the left margin — a jar
              shelf and a basket at x40..240 — which is exactly the column the word list
              occupies, so they poked out from behind its board. They sit ON the counter
              now, below the list and clear of the caption. */}
          {(
            <g>
              {[
                { x: width * 0.755, h: 54, c: "#7FB069", cap: "#4E7A3F" },
                { x: width * 0.785, h: 44, c: "#E2574C", cap: "#B23A31" },
                { x: width * 0.811, h: 50, c: "#8E7CC3", cap: "#5E4E8C" },
              ].map((j, i) => (
                <g key={i}>
                  <rect x={j.x} y={B.counterY + 6 - j.h} width={30} height={j.h} rx={7} fill={j.c} opacity={0.9} />
                  <rect x={j.x} y={B.counterY + 6 - j.h} width={30} height={j.h} rx={7} fill="none" stroke="#FFFFFF" strokeWidth={2.5} opacity={0.55} />
                  <rect x={j.x - 2} y={B.counterY - 6 - j.h} width={34} height={12} rx={4} fill={j.cap} />
                </g>
              ))}
              {/* a made sandwich on a board — the old basket was a blob with three
                  ellipses on it and read as a smudge at any size */}
              {/* ice-cream side of the shop: a cone rack, a sundae glass and a scoop tub.
                  🍦 is already the Short-I badge, so the counter should sell it. */}
              <g transform={`translate(${width * 0.60} ${B.counterY + 6})`}>
                {[0, 1, 2].map((k) => (
                  <g key={k} transform={`translate(${k * 30 - 30} 0)`}>
                    <path d="M-11 -26 l 11 26 l 11 -26 z" fill="#E3B778" stroke="#C79A5C" strokeWidth={2} />
                    <circle cx={0} cy={-32} r={12} fill={["#F7C6D9", "#FFF1C4", "#C6E7D4"][k]} />
                    <circle cx={-4} cy={-36} r={7} fill={["#FBD9E6", "#FFF8DC", "#DAF0E4"][k]} />
                    <circle cx={3} cy={-42} r={3.5} fill="#E2574C" />
                  </g>
                ))}
              </g>
              <g transform={`translate(${width * 0.665} ${B.counterY + 6})`}>
                <path d="M-14 -30 l 28 0 l -6 30 l -16 0 z" fill="#DCEBF5" stroke="#B9D3E4" strokeWidth={2} />
                <circle cx={-5} cy={-32} r={9} fill="#F7C6D9" />
                <circle cx={6} cy={-35} r={8} fill="#FFF1C4" />
                <circle cx={0} cy={-42} r={4} fill="#E2574C" />
              </g>
              <g transform={`translate(${width * 0.40} ${B.counterY + 6})`}>
                <rect x={-62} y={-10} width={124} height={12} rx={6} fill="#A9762F" />
                <rect x={-58} y={-14} width={116} height={6} rx={3} fill="#C89B57" />
                {[0, 1].map((k) => (
                  <g key={k} transform={`translate(${k ? 26 : -30} ${-18 - k * 2}) rotate(${k ? 6 : -5})`}>
                    <path d="M-26 0 l 26 -34 l 26 34 z" fill="#F0C87E" stroke="#D9A85B" strokeWidth={2.5} strokeLinejoin="round" />
                    <path d="M-19 -4 l 19 -25 l 19 25 z" fill="#F7E4B4" />
                    <path d="M-17 -6 q 17 8 34 0" stroke="#7FB069" strokeWidth={4} fill="none" strokeLinecap="round" />
                    <path d="M-14 -12 q 14 7 28 0" stroke="#E2574C" strokeWidth={4} fill="none" strokeLinecap="round" />
                  </g>
                ))}
              </g>
            </g>
          )}
        </svg>

        {/* THE MENU BOARD — the five vowel groups, ticking off as the video goes.
            The decor IS the progress bar, so the frame never needs a separate one. */}
        {mascot !== "off" && (() => {
          const onFloor = mascot === "floor";
          // the floor spot in 4:5 shares its band with the caption, and the longest line
          // ("Pot. Hot. Hear that? Just the front sound.") reaches x176 — so he is sized
          // and inset to clear it with room, not to touch it
          const w = portrait ? (onFloor ? 128 : 168) : (onFloor ? 172 : 178);
          const h = w * (1063 / 923);       // 923×1063, ~7px of padding under his feet
          const left = width * (portrait ? (onFloor ? 0.022 : 0.035) : 0.045);
          // counter: feet ON the counter line. floor: standing on the wood below it, high
          // enough that the caption box never reaches him.
          const top = onFloor ? B.counterY + (portrait ? 16 : 34) : B.counterY - h + 8;
          return (
            <div style={{ position: "absolute", left, top, width: w, opacity: dim,
                          transform: `translateY(${bob(frame, fps, 3.8, 6)}px)` }}>
              {onFloor && (
                <div style={{ position: "absolute", left: -12, top: h - 26, width: w + 24, height: 34,
                              borderRadius: "50%",
                              background: "radial-gradient(ellipse at 50% 40%, #F0C87E 0%, #D9A85B 62%, #C08F45 100%)",
                              boxShadow: "0 6px 0 rgba(140,95,40,0.45), 0 10px 20px rgba(60,40,20,0.28)" }} />
              )}
              <Img
                src={staticFile("mascot.png")}
                style={{ position: "relative", width: w, display: "block",
                         transform: `rotate(${Math.sin(t2 * 1.1) * 2.2}deg)`,
                         filter: "drop-shadow(0 10px 14px rgba(60,40,20,0.22))" }}
              />
            </div>
          );
        })()}

        {!portrait && (
          <div
            style={{
              position: "absolute", left: B.menuX, top: 150, width: B.menuW, padding: "24px 20px 28px",
              background: BOARD, borderRadius: 18, border: "9px solid #8B5E34",
              boxShadow: "0 16px 34px rgba(60,40,20,0.3)",
              transform: `rotate(${-1.2 + Math.sin(t * 0.7) * 0.35}deg)`,
            }}
          >
            <div style={{ textAlign: "center", color: "#FFF3D6", fontSize: 40, fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>
              TODAY
            </div>
            <div style={{ height: 3, background: "#FFF3D6", opacity: 0.35, marginBottom: 14 }} />
            {GROUPS.map((g, i) => {
              const done = i < doneGroups;
              const live = i === activeGroup;
              return (
                <div
                  key={g.key}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, marginBottom: 15,
                    fontSize: 35, fontWeight: 800,
                    color: live ? "#FFD466" : done ? "#9FBFA8" : "#FFF3D6",
                    opacity: done ? 0.72 : 1,
                    transform: `scale(${live ? 1.08 : 1})`, transformOrigin: "left center",
                  }}
                >
                  <span style={{ fontSize: 35 }}>{g.emoji}</span>
                  <span style={{ textDecoration: done ? "line-through" : "none" }}>{g.label}</span>
                  {done && <span style={{ marginLeft: "auto", fontSize: 26 }}>✓</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* steam drifting up from behind the counter — the room's constant motion */}
        <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {[0.16, 0.83].map((fx, k) => (
            <g key={k}>
              {[0, 1, 2].map((i) => {
                const p = ((t * 0.11 + i * 0.33 + k * 0.5) % 1);
                return (
                  <ellipse
                    key={i}
                    cx={width * fx + Math.sin(t * 0.9 + i + k) * 16}
                    cy={B.counterY - 30 - p * 190}
                    rx={20 + p * 20} ry={26 + p * 22}
                    fill="url(#swSteam)" opacity={0.5 * (1 - p)}
                  />
                );
              })}
            </g>
          ))}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── A LETTER BOARD — one CVC letter, the app's own colour code ───────────────
// Blue consonant / red vowel, exactly as CVCLearnView draws them. `lit` is the app's
// "this one is speaking" state: it scales to 1.15 and glows while the other two dim.
export const LetterBoard: React.FC<{
  letter: string; vowel: boolean; size?: number;
  lit?: boolean; dim?: boolean; blank?: boolean;
}> = ({ letter, vowel, size = 200, lit = false, dim = false, blank = false }) => {
  const c = vowel ? VOWEL : CONSONANT;
  const dark = vowel ? "#B71C1C" : "#0D47A1";
  return (
    <div
      style={{
        width: size, height: size, borderRadius: size * 0.17, flexShrink: 0,
        background: blank
          ? "linear-gradient(180deg,#F7F2E8 0%,#EDE5D6 100%)"
          : `linear-gradient(180deg,${c} 0%,${dark} 100%)`,
        border: blank ? "5px dashed #B9A88E" : "none",
        boxShadow: blank
          ? "none"
          : lit
            ? `0 12px 0 ${dark}, 0 18px 34px ${c}66, 0 0 0 7px ${c}44`
            : `0 10px 0 ${dark}, 0 14px 26px rgba(60,40,20,0.22)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${lit ? 1.15 : 1})`,
        opacity: dim ? 0.45 : 1,
        fontFamily: font.family,
      }}
    >
      <span
        style={{
          fontSize: size * 0.56, fontWeight: 800, lineHeight: 1,
          color: blank ? "#B9A88E" : "#FFFFFF",
          textShadow: blank ? "none" : "0 3px 0 rgba(0,0,0,0.22)",
        }}
      >
        {blank ? "?" : letter}
      </span>
    </div>
  );
};

// ── THE MERGED SANDWICH — three boards pressed into one ─────────────────────
// The app fuses its three tiles into a single purple tile. Here the press comes DOWN and
// the three become a sandwich: the letters keep their colours inside, so the vowel is
// visibly still the filling in the middle.
export const MergedSandwich: React.FC<{ word: string; size?: number; lit?: boolean }> = ({
  word, size = 200, lit = false,
}) => (
  <div
    style={{
      position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
      gap: size * 0.06, padding: `${size * 0.16}px ${size * 0.3}px`,
      background: "linear-gradient(180deg,#F3C97E 0%,#DFA45A 100%)",
      borderRadius: size * 0.3,
      boxShadow: `0 14px 0 #B9803C, 0 22px 40px rgba(60,40,20,0.3)${lit ? ", 0 0 0 8px #FFD46655" : ""}`,
      fontFamily: font.family,
    }}
  >
    {word.split("").map((ch, i) => (
      <span
        key={i}
        style={{
          fontSize: size * 0.52, fontWeight: 800, lineHeight: 1,
          color: "aeiou".includes(ch) ? "#C62828" : "#1565C0",
          textShadow: "0 3px 0 rgba(255,255,255,0.6)",
        }}
      >
        {ch}
      </span>
    ))}
  </div>
);

/** a word's picture — an app PNG or an emoji, the house rule from ToyWorkshop */
export const WordPicture: React.FC<{ pic?: string; size?: number }> = ({ pic, size = 180 }) =>
  !pic ? null : pic.includes(".png")
    ? <Img src={staticFile(pic)} style={{ height: size, width: "auto" }} />
    : <span style={{ fontSize: size * 0.86, lineHeight: 1 }}>{pic}</span>;
