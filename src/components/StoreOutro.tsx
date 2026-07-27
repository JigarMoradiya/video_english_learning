import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { StoreFlow } from "./StoreFlow";
import { font, palette } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";
import { sec } from "../lib/timing";

// Shared "download our app" outro (16:9): the animated store-search-&-download phone flow
// (left) + real app icon, name, CTA and both store badges (right), timed to the CTA
// voiceover. Drop `<StoreOutro/>` into any 1920×1080 reel's outro Sequence of length
// STORE_OUTRO_F. Reuses public/audio/recognition/ assets (shared across videos).
export const STORE_OUTRO_F = 344; // ~11.5s (CTA voiceover 9.64s + tail)
const CTA_DUR = 9.64;

// silent   = no CTA voiceover (the video already narrates the CTA — e.g. lesson wraps)
// compact  = detail-page-only store flow (fits short beats)
// total    = the outro/beat length in frames (used to time the store-badge reveal)
// audioSrc = custom CTA voiceover (each video keeps a UNIQUE closing line); dur = its seconds
export const StoreOutro: React.FC<{ silent?: boolean; compact?: boolean; total?: number; audioSrc?: string; audioDur?: number }> = ({ silent = false, compact = false, total = STORE_OUTRO_F, audioSrc = "audio/recognition/practice_letter_rules_download_app.mp3", audioDur = CTA_DUR }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoIn = spring({ frame: frame - 10, fps, config: { damping: 12 } });
  const line = spring({ frame: frame - (compact ? 16 : 26), fps, config: { damping: 12 } });
  const badgeAt = compact ? Math.round(total * 0.42) : 200; // reveal badges around download time
  const play = spring({ frame: frame - badgeAt, fps, config: { damping: 10 } });
  const apple = spring({ frame: frame - (badgeAt + 14), fps, config: { damping: 10 } });
  return (
    // NO background here. The video's global background (+ its ambient particles) must
    // keep running underneath, otherwise the download beat is a hard jump cut to a
    // different world — see the "never paint an opaque background inside a scene" rule.
    <AbsoluteFill style={{ fontFamily: font.family }}>
      {!silent && (
        <Sequence from={10} durationInFrames={sec(audioDur, fps) + 10}>
          <Audio src={staticFile(audioSrc)} />
        </Sequence>
      )}

      {/* hideReviews: a review panel has no place in a kids' download outro, and it
          sits at the foot of the detail page so it shows even unscrolled */}
      <StoreFlow compact={compact} hideReviews />

      <div style={{ position: "absolute", left: 770, top: 0, width: 1120, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }}>
        <Img src={staticFile("app_icon.png")} style={{ width: 224, height: 224, borderRadius: 50, transform: `scale(${logoIn}) translateY(${bob(frame, fps, 8, 2.6)}px) rotate(${wiggle(frame, fps, 1.2, 2.4)}deg)`, boxShadow: "0 18px 40px rgba(30,36,56,0.25)" }} />
        <div style={{ opacity: line, fontSize: 58, fontWeight: 800, color: palette.ink, textAlign: "center" }}>Kids English Learning</div>
        {/* CTA reads as a BUTTON, not a line of purple text. #8E24AA on the pale
            lavender gradient had weak contrast and fought the dark title above it. */}
        <div
          style={{
            opacity: line,
            fontSize: 42,
            fontWeight: 800,
            color: "#FFFFFF",
            background: "#2E7D32",
            borderRadius: 999,
            padding: "16px 44px",
            textAlign: "center",
            boxShadow: "0 14px 32px rgba(46,125,50,0.38)",
          }}
        >
          Download the app — it's FREE!
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          <Img src={staticFile("appstore.png")} style={{ width: 300, height: "auto", transform: `scale(${apple})` }} />
          <Img src={staticFile("playstore.png")} style={{ width: 300, height: "auto", transform: `scale(${play})` }} />
        </div>
      </div>

      {/* subtle fade in at the start */}
      {/* a short soft veil on entry only — a transition, not a new background */}
      <AbsoluteFill style={{ background: "#FFFFFF", opacity: interpolate(frame, [0, 12], [0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
