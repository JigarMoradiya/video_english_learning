import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "../data/tokens";
import { Confetti } from "./Confetti";
import { StoreFlow } from "./StoreFlow";

export const STORE_OUTRO_PORTRAIT_F = 344;

// Portrait download outro — SAME device mockup as the 16:9 (StoreFlow: detail page, tap GET →
// downloading → OPEN, real screenshots) fitted into the portrait frame, with the CTA + both
// store badges below. Reuses the shared store assets + a custom CTA voiceover.
export const StoreOutroPortrait: React.FC<{ audioSrc: string; audioDur: number; bg?: string }> = ({ audioSrc, audioDur, bg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cta = spring({ frame: frame - 26, fps, config: { damping: 12 } });
  const apple = spring({ frame: frame - 40, fps, config: { damping: 11 } });
  const play = spring({ frame: frame - 52, fps, config: { damping: 11 } });
  return (
    <AbsoluteFill style={{ fontFamily: font.family, background: bg }}>
      <Sequence from={10} durationInFrames={Math.round(audioDur * fps) + 10}><Audio src={staticFile(audioSrc)} /></Sequence>

      {/* the full app-store phone (search "Kids English Learning" → our app → detail → GET →
          download → OPEN), same as the 16:9. transform makes the wrapper the containing block
          for StoreFlow's absolute coords → phone lands at 290,110. */}
      <div style={{ position: "absolute", inset: 0, transform: "translate(64px, 22px)" }}>
        <StoreFlow />
      </div>

      <div style={{ position: "absolute", top: 1120, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <div style={{ opacity: cta, fontSize: 56, fontWeight: 800, color: "#FFD54F", textAlign: "center" }}>Download the app — it's FREE!</div>
        <div style={{ display: "flex", gap: 30 }}>
          <Img src={staticFile("appstore.png")} style={{ width: 360, height: "auto", transform: `scale(${apple})` }} />
          <Img src={staticFile("playstore.png")} style={{ width: 360, height: "auto", transform: `scale(${play})` }} />
        </div>
      </div>

      <Confetti frame={frame} fps={fps} burstFrame={14} origin={{ x: 540, y: 300 }} colors={["#FFD54F", "#4FC3F7", "#FF8A65", "#81C784", "#F06292"]} count={30} seed={7} />
    </AbsoluteFill>
  );
};
