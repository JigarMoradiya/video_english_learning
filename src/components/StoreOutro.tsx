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

// silent  = no CTA voiceover (the video already narrates the CTA — e.g. lesson wraps)
// compact = detail-page-only store flow (fits short beats)
// total   = the outro/beat length in frames (used to time the store-badge reveal)
export const StoreOutro: React.FC<{ silent?: boolean; compact?: boolean; total?: number }> = ({ silent = false, compact = false, total = STORE_OUTRO_F }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoIn = spring({ frame: frame - 10, fps, config: { damping: 12 } });
  const line = spring({ frame: frame - (compact ? 16 : 26), fps, config: { damping: 12 } });
  const badgeAt = compact ? Math.round(total * 0.42) : 200; // reveal badges around download time
  const play = spring({ frame: frame - badgeAt, fps, config: { damping: 10 } });
  const apple = spring({ frame: frame - (badgeAt + 14), fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(155deg, #EDE9FF 0%, #FFF6EC 75%)", fontFamily: font.family }}>
      {!silent && (
        <Sequence from={10} durationInFrames={sec(CTA_DUR, fps) + 10}>
          <Audio src={staticFile("audio/recognition/practice_letter_rules_download_app.mp3")} />
        </Sequence>
      )}

      <StoreFlow compact={compact} />

      <div style={{ position: "absolute", left: 770, top: 0, width: 1120, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }}>
        <Img src={staticFile("app_icon.png")} style={{ width: 224, height: 224, borderRadius: 50, transform: `scale(${logoIn}) translateY(${bob(frame, fps, 8, 2.6)}px) rotate(${wiggle(frame, fps, 1.2, 2.4)}deg)`, boxShadow: "0 18px 40px rgba(30,36,56,0.25)" }} />
        <div style={{ opacity: line, fontSize: 58, fontWeight: 800, color: palette.ink, textAlign: "center" }}>Kids English Learning</div>
        <div style={{ opacity: line, fontSize: 42, fontWeight: 700, color: "#8E24AA", textAlign: "center" }}>Download the app — it's FREE!</div>
        <div style={{ display: "flex", gap: 28 }}>
          <Img src={staticFile("appstore.png")} style={{ width: 300, height: "auto", transform: `scale(${apple})` }} />
          <Img src={staticFile("playstore.png")} style={{ width: 300, height: "auto", transform: `scale(${play})` }} />
        </div>
      </div>

      {/* subtle fade in at the start */}
      <AbsoluteFill style={{ background: "#FFF6EC", opacity: interpolate(frame, [0, 8, total - 8, total], [1, 0, 0, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
