import React from "react";
import { Img, staticFile, useVideoConfig } from "remotion";

// ── Brand watermark ──────────────────────────────────────────────────────────
// Flip this to false to render a CLEAN (no-logo) version of ANY video, then back
// to true for the branded version. That's the whole on/off switch.
export const WATERMARK_ENABLED = true;

// The logo, in a corner, semi-transparent. Sized as a FRACTION of video width so it
// works on any aspect (16:9 or 9:16). Baked into the Remotion render — no ffmpeg
// re-encode, full quality.
//
// Defaults are deliberately restrained. This thing is on screen for minutes, so the
// original 16%-wide / 82%-opaque version read as an ad slapped on the corner. At 10%
// and 55% it registers as branding without competing with the teaching content — the
// brand PAYOFF is the store outro, which shows the app icon full size.
//
// Render inside <Sequence from={0} durationInFrames={outroFrom}> so it hides on that
// outro — otherwise there are two logos on screen, which the repo forbids.
export const Watermark: React.FC<{
  opacity?: number;
  widthFrac?: number;
  corner?: "tl" | "tr" | "bl" | "br";
  pad?: number; // override the safe inset; the default is already correct for both aspects
}> = ({ opacity = 0.55, widthFrac = 0.1, corner = "tl", pad: padProp }) => {
  const { width } = useVideoConfig();
  if (!WATERMARK_ENABLED) return null;
  const w = Math.round(width * widthFrac);
  // SAFE INSET: 5% title-safe on 16:9 (96px), floored at 90px so a 1080-wide portrait
  // clears the social safe margin too. The old 2.8% gave only 30px on 9:16.
  const pad = padProp ?? Math.max(Math.round(width * 0.05), 90);
  return (
    <Img
      src={staticFile("logo.png")}
      style={{
        position: "absolute",
        ...(corner[0] === "t" ? { top: pad } : { bottom: pad }),
        ...(corner[1] === "l" ? { left: pad } : { right: pad }),
        width: w,
        height: "auto",
        opacity,
      }}
    />
  );
};
