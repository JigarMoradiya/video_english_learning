import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { bob } from "../lib/motion";
import { hex, palette, tint } from "../data/tokens";
import { illustrationFor } from "../data/wordImages";

// A docked example word on the Word Street: emoji on top, the word below with the
// target grapheme tinted in the zone colour. Springs in at `enterFrame`; the target
// letters give a little "lit" pulse when the word is spoken.
export const CkWordChip: React.FC<{
  word: string;
  blanked: string; // e.g. "du__" — underscores mark the tinted target grapheme
  colorHex: string;
  enterFrame: number; // absolute frame the chip docks
  litFrame?: number; // absolute frame to pulse (defaults to enterFrame)
  size?: number;
  phase?: number;
  markVowel?: boolean; // underline the short vowel right before the target (e.g. the "u" in du-ck)
}> = ({ word, blanked, colorHex, enterFrame, litFrame, size = 92, phase = 0, markVowel = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(colorHex);

  const gapStart = blanked.indexOf("_");
  const gapLen = (blanked.match(/_+/)?.[0].length) ?? 0;
  const before = word.slice(0, gapStart < 0 ? word.length : gapStart);
  const target = gapStart < 0 ? "" : word.slice(gapStart, gapStart + gapLen);
  const after = gapStart < 0 ? "" : word.slice(gapStart + gapLen);
  // the short vowel = last letter of `before` (the vowel right before the ck/target)
  const showVowel = markVowel && before.length > 0 && target.length > 0;
  const beforeHead = showVowel ? before.slice(0, -1) : before;
  const vowel = showVowel ? before.slice(-1) : "";

  const s = spring({ frame: frame - enterFrame, fps, config: { damping: 12, mass: 0.7 } });
  const lit = litFrame ?? enterFrame;
  const hl = frame >= lit && frame < lit + 24 ? 1 + 0.32 * Math.sin(((frame - lit) / 24) * Math.PI) : 1;

  const illo = illustrationFor(word);
  const emoji = illo && illo.kind === "emoji" ? illo.char : "";
  // e.g. "🦵⚽" (kick) is two emojis — keep them SIDE BY SIDE (nowrap) and a bit
  // smaller so the pair fits the card instead of stacking / breaking the layout.
  const multiEmoji = [...emoji].length > 1;
  const emojiSize = multiEmoji ? size * 0.5 : size * 0.72;

  return (
    <div
      style={{
        // hl scales the WHOLE card. It used to scale only the target grapheme, and a
        // transform doesn't affect layout — so "kick"'s enlarged "ck" rendered outside
        // the card border (duck/rock had slack, kick didn't).
        transform: `scale(${s * hl}) translateY(${bob(frame, fps, 4, 2.4, phase)}px)`,
        opacity: Math.min(1, s + 0.001),
        // never let a flex parent squeeze the card below its word: "kick" is wider than
        // "duck"/"rock", so it was the one whose letters spilled past the border
        flexShrink: 0,
        background: palette.card,
        border: `${size * 0.05}px solid ${c}`,
        borderRadius: size * 0.28,
        padding: `${size * 0.12}px ${size * 0.19}px ${size * 0.1}px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: size * 0.04,
        boxShadow: `0 ${size * 0.12}px ${size * 0.28}px ${palette.cardShadow}`,
      }}
    >
      {/* fixed-height emoji area so single- and multi-emoji cards keep the SAME
          baseline: the emoji is always vertically centred, the word always aligned. */}
      <div style={{ height: size * 0.82, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {emoji && (
          <span style={{ fontSize: emojiSize, lineHeight: 1, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: size * 0.03 }}>
            {[...emoji].map((ch, k) => (
              <span key={k}>{ch}</span>
            ))}
          </span>
        )}
      </div>
      <span style={{ fontSize: size * 0.5, fontWeight: 700, lineHeight: 1, letterSpacing: 1, whiteSpace: "nowrap" }}>
        <span style={{ color: palette.ink }}>{beforeHead}</span>
        {vowel && (
          <span
            style={{
              color: palette.ink,
              textDecoration: "underline",
              textDecorationColor: "#00897B", // short-vowel underline
              textDecorationThickness: `${size * 0.07}px`,
              textUnderlineOffset: `${size * 0.06}px`,
            }}
          >
            {vowel}
          </span>
        )}
        <span
          style={{
            color: c,
            display: "inline-block",
            // colour + glow only — the scale lives on the card so nothing can overflow
            textShadow: hl > 1.02 ? `0 0 ${(hl - 1) * 70}px ${c}` : undefined,
          }}
        >
          {target}
        </span>
        <span style={{ color: palette.ink }}>{after}</span>
      </span>
    </div>
  );
};

// soft tinted zone background helper (re-exported for WordStreet)
export const zoneTint = (colorHex: string, t = 0.86) => tint(colorHex, t);
