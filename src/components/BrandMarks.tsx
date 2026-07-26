import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { WATERMARK_ENABLED } from "./Watermark";

// ── Brand badge ──────────────────────────────────────────────────────────────
// RULE: only ONE logo on screen at any moment. It moves between places instead of
// stacking, so no single crop can strip the brand but it never feels like clutter:
//   · on the picture/anchor image cards (bottom-right — inside the content, uncroppable)
//   · above the mouth row on the "Remember!" card
//   · bottom-left on the section cards (which have no image card)
// The logo always sits on the app's own gradient (iOS KidsGradient .skyLavender), so it
// reads as part of the design rather than a pasted-on watermark.
// Everything obeys WATERMARK_ENABLED for a clean no-logo render.

export const LOGO_GRADIENT = "linear-gradient(135deg, #E0EEFF 0%, #EDE0FF 100%)"; // iOS .skyLavender

// the badge itself: logo on the app gradient, rounded, soft shadow
// One size for every standalone badge, so the brand never changes scale between cards.
export const LOGO_BADGE_SIZE = 200;

export const LogoBadge: React.FC<{ size?: number; opacity?: number; style?: React.CSSProperties }> = ({ size = LOGO_BADGE_SIZE, opacity = 1, style }) => {
  if (!WATERMARK_ENABLED) return null;
  const pad = Math.round(size * 0.13);
  return (
    <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.27), background: LOGO_GRADIENT, boxShadow: "0 4px 12px rgba(30,36,56,0.18)", display: "flex", alignItems: "center", justifyContent: "center", padding: pad, opacity, ...style }}>
      <Img src={staticFile("logo.png")} style={{ width: "100%", height: "auto" }} />
    </div>
  );
};

// Plain logo for a title/header pill — NO gradient plate behind it, so it sits inside the
// pill as part of the title rather than looking like a stuck-on badge.
export const HeaderLogo: React.FC<{ height?: number }> = ({ height = 56 }) => {
  if (!WATERMARK_ENABLED) return null;
  return <Img src={staticFile("logo.png")} style={{ height, width: "auto" }} />;
};

// The A→Z videos run all 26 letters, so badging every word card would be far too busy.
// Only 7 per video carry a card badge — spread evenly across the alphabet, and a DIFFERENT
// set per video so the two don't badge the same letters.
const BADGED: Record<BadgeSet, Set<string>> = {
  phonics: new Set(["C", "F", "J", "M", "P", "T", "X"]),
  recognition: new Set(["E", "H", "K", "N", "R", "V", "Z"]),
};
export type BadgeSet = "phonics" | "recognition";
export const letterHasBadge = (letter: string, set: BadgeSet = "phonics"): boolean => BADGED[set].has(letter.toUpperCase());

export type BadgeCorner = "tl" | "tr" | "bl" | "br";

// Which corner each picture's badge sits on, chosen per image so the badge never covers the
// subject (ant/egg/ox/fox sit low-left in frame → badge top-right; dog faces right → top-left).
const BADGE_CORNER: Record<string, BadgeCorner> = {
  ant: "tr", egg: "tr", ox: "tr",
  fox: "tr", dog: "tl",
};
// Case-insensitive: the word lists store "Ant"/"Dog" capitalised, and an exact-case
// lookup silently fell through to "br" and put the badge on top of the subject.
export const badgeCorner = (word: string): BadgeCorner => BADGE_CORNER[word.toLowerCase()] ?? "br";

// Badge STRADDLING an image card's corner — part inside, part outside (like a count badge),
// so it reads as a deliberate badge and never overlays the picture. The parent must be
// positioned (relative/absolute) and must NOT clip (no overflow:hidden).
export const CardBadge: React.FC<{ size?: number; corner?: BadgeCorner }> = ({ size = 58, corner = "br" }) => {
  if (!WATERMARK_ENABLED) return null;
  const out = -Math.round(size * 0.36); // ~1/3 of the badge hangs outside the card
  const side: React.CSSProperties =
    corner === "br" ? { right: out, bottom: out } :
    corner === "bl" ? { left: out, bottom: out } :
    corner === "tr" ? { right: out, top: out } : { left: out, top: out };
  return <LogoBadge size={size} style={{ position: "absolute", ...side }} />;
};

// bottom-left of the frame — for section cards that have no image card
export const FrameBadge: React.FC<{ size?: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  if (!WATERMARK_ENABLED) return null;
  const s = spring({ frame: frame - 6, fps, config: { damping: 13 } });
  const sz = size ?? Math.round(width * 0.062);
  const inset = Math.round(width * 0.03);
  return <LogoBadge size={sz} opacity={interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} style={{ position: "absolute", left: inset, bottom: inset, transform: `scale(${0.9 + s * 0.1})` }} />;
};
