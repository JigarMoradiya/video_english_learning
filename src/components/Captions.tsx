import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Track, sec } from "../lib/timing";
import { palette, hex } from "../data/tokens";
import { PhonicsComparison } from "../data/types";

const HILITE = "rgba(255, 205, 66, 0.55)"; // karaoke marker behind the active word

// Build a keyword→colour function from a comparison card: each team's marker + all its
// quiz words (for that answerTeam) get that team's colour. Auto-derived per reel — no
// hand-typed vocabulary. (The 16:9 c/k/ck video passes its own richer keywordColor.)
export const keywordColorFor = (data: PhonicsComparison): ((raw: string) => string | null) => {
  const map: Record<string, string> = {};
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  data.teams.forEach((t, ti) => {
    const c = hex(t.colorHex);
    map[norm(t.marker)] = c;
    data.quiz.filter((q) => q.answerTeam === ti).forEach((q) => (map[norm(q.word)] = c));
  });
  return (raw: string) => map[norm(raw)] ?? null;
};

// Generic burned-in karaoke captions. Reads the ABSOLUTE frame, so it MUST be a top-level
// child of ReelBase (not inside a <Sequence>). Words already spoken are bright; the active
// word gets a colour-neutral marker highlight + a tiny scale (box-shadow, so it never
// reflows neighbours); upcoming words are dimmed. Important words keep their own colour via
// `keywordColor`. `bottom`/`maxWidth`/`fontSize` place the band per orientation (portrait
// reels sit above SAFE_BOTTOM; the 16:9 video sits at the very bottom).
export const Captions: React.FC<{
  track: Track;
  keywordColor?: (raw: string) => string | null;
  maxWidth?: number;
  fontSize?: number;
  bottom?: number;
}> = ({ track, keywordColor, maxWidth = 1360, fontSize = 40, bottom = 70 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const active = track.activeAt(frame);
  if (!active) return null;
  const { phrase, wordIdx } = active;

  const appear = interpolate(frame, [sec(phrase.start, fps), sec(phrase.start, fps) + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: bottom, pointerEvents: "none" }}>
      <div
        style={{
          maxWidth,
          fontFamily: '"Helvetica Neue", Arial, sans-serif', // plain subtitle font, not the display font
          background: "#ffffffdd",
          borderRadius: 26,
          padding: "14px 36px",
          boxShadow: `0 14px 40px ${palette.cardShadow}`,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "4px 14px",
          opacity: appear,
          transform: `translateY(${(1 - appear) * 16}px)`,
        }}
      >
        {phrase.words.map((w, i) => {
          const spoken = i <= wordIdx;
          const isActive = i === wordIdx;
          const kw = keywordColor ? keywordColor(w.word) : null;
          const color = spoken ? kw ?? palette.ink : palette.inkSoft;
          return (
            <span
              key={i}
              style={{
                fontSize,
                fontWeight: kw ? 600 : 400, // keyword emphasis is constant (no reflow); base is regular
                lineHeight: 1.1,
                color,
                opacity: spoken ? 1 : 0.55,
                display: "inline-block",
                transform: isActive ? "scale(1.05)" : "scale(1)",
                transformOrigin: "center bottom",
                borderRadius: 7,
                background: isActive ? HILITE : "transparent",
                boxShadow: isActive ? `0 0 0 4px ${HILITE}` : "none",
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
