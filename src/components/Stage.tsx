import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { SAFE_BOTTOM } from "../data/tokens";
import { Caption } from "./Caption";

const SHOW_PILLS = false; // full-sentence Subtitles replace the short caption pills

// Centers content in the UPPER-MIDDLE of the frame (reserving SAFE_BOTTOM at the
// bottom for the platform's caption + action buttons), and drops an optional
// short caption pill directly beneath the content.
export type StageEnter = "slideR" | "slideL" | "slideUp" | "zoom" | "pop";

export const Stage: React.FC<{
  caption?: string;
  captionColor?: string;
  captionDelay?: number;
  gap?: number;
  enter?: StageEnter;
  children: React.ReactNode;
}> = ({ caption, captionColor, captionDelay = 0, gap = 60, enter = "slideR", children }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const e = interpolate(frame, [0, 14], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.4)), // overshoot = punchier
  });
  const transform =
    enter === "slideL"
      ? `translateX(${(1 - e) * -90}px)`
      : enter === "slideUp"
      ? `translateY(${(1 - e) * 90}px)`
      : enter === "zoom"
      ? `scale(${0.7 + e * 0.3})`
      : enter === "pop"
      ? `scale(${0.4 + e * 0.6})`
      : `translateX(${(1 - e) * 90}px)`; // slideR (default)
  return (
    <AbsoluteFill
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: SAFE_BOTTOM,
        gap,
        opacity: fadeIn,
        transform,
      }}
    >
      {children}
      {/* Short caption pills disabled — the full-sentence Subtitles now carry the
          on-screen text. Flip SHOW_PILLS to re-enable if you want both. */}
      {SHOW_PILLS && caption && <Caption text={caption} color={captionColor} delay={captionDelay} />}
    </AbsoluteFill>
  );
};
