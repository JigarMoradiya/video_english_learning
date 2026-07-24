import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { bob } from "../lib/motion";
import { ComparisonTeam } from "../data/types";
import { hex, palette } from "../data/tokens";

// Writes a word on-screen left-to-right with a real writing HAND (✍️) whose pen
// nib rides the reveal edge, sitting on the letters — like real handwriting.
// `blanked` (e.g. "r__n") marks where the team letters go so they get tinted.
export const DrawWord: React.FC<{
  blanked: string;
  team: ComparisonTeam;
  size?: number;
  drawFrames?: number;
  startAt?: number;
}> = ({ blanked, team, size = 200, drawFrames = 64, startAt = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(team.colorHex);

  const match = blanked.match(/_+/);
  const gapStart = match ? match.index! : blanked.length;
  const before = blanked.slice(0, gapStart);
  const after = match ? blanked.slice(gapStart + match[0].length) : "";
  const full = before + team.marker + after;
  const teamStart = before.length;
  const teamEnd = before.length + team.marker.length;

  const p = interpolate(frame - startAt, [0, drawFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const writing = p > 0 && p < 1;

  // Karaoke highlight: the team letters give a little pulse right after the word
  // is finished (when the phoneme is spoken).
  const done = startAt + drawFrames;
  const hl = interpolate(frame, [done, done + 7, done + 22], [1, 1.28, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "relative",
        transform: `translateY(${bob(frame, fps, 6, 2.6)}px)`,
        fontSize: size,
        fontWeight: 600,
        letterSpacing: 4,
        lineHeight: 1.25, // room for descenders (y, p, g)
        paddingBottom: size * 0.28,
        display: "inline-flex",
      }}
    >
      {/* Reveal mask only WHILE writing; once written, no clip at all so the
          scaling/glowing ay (and the y descender) is never cut. */}
      <div style={{ display: "flex", clipPath: p < 1 ? `inset(-60% ${(1 - p) * 100}% -90% -12%)` : undefined }}>
        {full.split("").map((ch, i) => {
          const isTeam = i >= teamStart && i < teamEnd;
          return (
            <span
              key={i}
              style={{
                color: isTeam ? c : palette.ink,
                fontWeight: isTeam ? 700 : 600,
                display: "inline-block",
                transform: isTeam ? `scale(${hl})` : undefined,
                textShadow: isTeam && hl > 1.02 ? `0 0 ${(hl - 1) * 80}px ${c}` : undefined,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>

      {/* writing hand: pen nib (lower-left of the ✍️ glyph) rides the reveal edge */}
      {writing && (
        <div
          style={{
            position: "absolute",
            left: `${p * 100}%`,
            top: -size * 0.06,
            fontSize: size * 0.85,
            transformOrigin: "22% 82%", // pivot at the pen nib
            transform: "translate(-16%, 0) rotate(20deg)",
            pointerEvents: "none",
          }}
        >
          ✍️
        </div>
      )}
    </div>
  );
};
