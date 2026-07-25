import React from "react";
import { Img, staticFile, useVideoConfig } from "remotion";

// ── Brand watermark ──────────────────────────────────────────────────────────
// Flip this to false to render a CLEAN (no-logo) version of ANY video, then back
// to true for the branded version. That's the whole on/off switch.
export const WATERMARK_ENABLED = true;

// The logo, top-left, semi-transparent. Sized to 16% of the video width so it works on any
// aspect (16:9 or 9:16). Baked into the Remotion render — no ffmpeg re-encode, full quality.
// Render it inside <Sequence from={0} durationInFrames={outroFrom}> so it hides on the
// download/store outro.
export const Watermark: React.FC<{ opacity?: number }> = ({ opacity = 0.82 }) => {
  const { width } = useVideoConfig();
  if (!WATERMARK_ENABLED) return null;
  const w = Math.round(width * 0.16);
  const pad = Math.round(width * 0.036);
  return (
    <Img src={staticFile("logo.png")} style={{ position: "absolute", top: pad, left: pad, width: w, height: "auto", opacity }} />
  );
};
