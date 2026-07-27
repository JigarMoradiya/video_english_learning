import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { font, palette } from "../data/tokens";
import { bob } from "../lib/motion";

// ── Landscape (16:9) beat kit ────────────────────────────────────────────────
// The zone law from WordStreet.tsx, in ONE place. c_k_ck_beats.tsx and oo_beats.tsx
// each redefine Band/Center locally with DIFFERENT values (Band top 100 vs 46), which
// is how overlays drifted onto the stage. New landscape lessons import from here.
//
//   y    0 … 290   HEADLINE BAND  — beat overlays only (pills, badges). Nothing else.
//   y  300 … 860   STAGE          — the set. No overlay may enter.
//   y  880 …1080   CAPTION        — Captions.tsx only.
export const BAND_H = 290;
export const STAGE_TOP = 300;
export const STAGE_H = 560;
export const CAPTION_TOP = 880;
export const safeX = (width: number) => Math.round(width * 0.05); // 96 on 1920

// Headline band. Top-anchored at 100: the 5% title-safe line on a 1080-tall frame is
// 54px, and pills at 36–54 sat inside the unsafe band.
export const Band: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 100 }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: top, pointerEvents: "none", fontFamily: font.family }}>
    {children}
  </AbsoluteFill>
);

// Centre stage, for beats that replace the set entirely (see-it boards, quiz).
// TOP-anchored, not centred: a bottom-padded centred box overflows equally at both
// ends and clipped headers off the top of frame.
export const Center: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = STAGE_TOP }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: top, pointerEvents: "none", fontFamily: font.family }}>
    {children}
  </AbsoluteFill>
);

// A rounded headline pill. `enterFrame` is beat-relative.
export const Pill: React.FC<{
  children: React.ReactNode;
  color?: string;
  bg?: string;
  enterFrame?: number;
  size?: number;
  // `still` = no entrance animation. Frame 0 is the upload thumbnail and must be a
  // COMPLETE cover, so the first beat's pill must not fade up from nothing.
  still?: boolean;
}> = ({ children, color = palette.ink, bg = "#FFFFFFEE", enterFrame = 0, size = 54, still = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = still ? 1 : spring({ frame: frame - enterFrame, fps, config: { damping: 12 } });
  return (
    <div
      style={{
        background: bg,
        borderRadius: 999,
        padding: "18px 46px",
        fontSize: size,
        fontWeight: 700,
        color,
        lineHeight: 1.15,
        textAlign: "center",
        boxShadow: "0 14px 34px rgba(30,36,56,0.16)",
        transform: `scale(${0.86 + 0.14 * s}) translateY(${bob(frame, fps, 4, 2.8)}px)`,
        opacity: still ? 1 : interpolate(frame, [enterFrame, enterFrame + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        maxWidth: 1600,
      }}
    >
      {children}
    </div>
  );
};
