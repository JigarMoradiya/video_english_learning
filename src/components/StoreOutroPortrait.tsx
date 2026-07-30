import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "../data/tokens";
import { bob } from "../lib/motion";
import { Confetti } from "./Confetti";
import { StoreFlow } from "./StoreFlow";

export const STORE_OUTRO_PORTRAIT_F = 344;

// Portrait download outro — SAME device mockup as the 16:9 (StoreFlow: detail page, tap GET →
// downloading → OPEN, real screenshots) fitted into the portrait frame, with the CTA + both
// store badges below. Reuses the shared store assets + a custom CTA voiceover.
// audioSrc empty => silent: the reel's own narration already covers the CTA line
// (the oo 9:16 cut does this), so mounting an <Audio src=""> would just error.
export const StoreOutroPortrait: React.FC<{ audioSrc?: string; audioDur?: number; bg?: string }> = ({ audioSrc, audioDur = 0, bg }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const cta = spring({ frame: frame - 26, fps, config: { damping: 12 } });
  const apple = spring({ frame: frame - 40, fps, config: { damping: 11 } });
  const play = spring({ frame: frame - 52, fps, config: { damping: 11 } });
  // Idle motion. Every spring above has settled by frame ~70, and this beat runs 344
  // frames — so the outro used to sit dead still for its last eight seconds, which
  // motion_check flags on every portrait video. The CTA breathes and the two badges
  // bob out of phase with each other, so nothing on screen is ever frozen.
  const t = frame / fps;
  // This is laid out for 1920 tall; its content occupies y110…1350 (measured, 1240 tall).
  // In a shorter frame — the 4:5 Facebook cut — that put the store badges flush against
  // the bottom edge with 110px empty above. Centre it. Clamped at 0 so a 1920-tall frame,
  // where the layout is already approved, is left exactly as it was.
  const dy = Math.min(0, (height - 1240) / 2 - 110);
  const breathe = 1 + 0.022 * Math.sin(t * 2.6);
  const badgeBob = (phase: number) => bob(frame, fps, 5, 3.1, phase);
  return (
    // bg defaults to TRANSPARENT so the reel's own background keeps running — passing a
    // different colour here made the download beat a jump cut to another world.
    <AbsoluteFill style={{ fontFamily: font.family, background: bg, transform: `translateY(${dy}px)` }}>
      {audioSrc ? (
        <Sequence from={10} durationInFrames={Math.round(audioDur * fps) + 10}><Audio src={staticFile(audioSrc)} /></Sequence>
      ) : null}

      {/* the full app-store phone (search "Kids English Learning" → our app → detail → GET →
          download → OPEN), same as the 16:9. transform makes the wrapper the containing block
          for StoreFlow's absolute coords → phone lands at 290,110. */}
      <div style={{ position: "absolute", inset: 0, transform: "translate(64px, 22px)" }}>
        <StoreFlow hideReviews />
      </div>

      <div style={{ position: "absolute", top: 1120, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        {/* a green BUTTON, not tinted text: the outro now sits on the video's own light
            background (a dark teal jump-cut was rejected), where #FFD54F is unreadable.
            The pill also reads correctly if a dark bg is ever passed again. */}
        <div style={{ opacity: cta, transform: `scale(${breathe})`, fontSize: 52, fontWeight: 800, color: "#FFFFFF", background: "#2E7D32", borderRadius: 999, padding: "18px 52px", textAlign: "center", boxShadow: "0 16px 36px rgba(46,125,50,0.40)" }}>
          Download the app — it's FREE!
        </div>
        <div style={{ display: "flex", gap: 30 }}>
          <Img src={staticFile("appstore.png")} style={{ width: 360, height: "auto", transform: `scale(${apple}) translateY(${badgeBob(0)}px)` }} />
          <Img src={staticFile("playstore.png")} style={{ width: 360, height: "auto", transform: `scale(${play}) translateY(${badgeBob(1.55)}px)` }} />
        </div>
      </div>

      <Confetti frame={frame} fps={fps} burstFrame={14} origin={{ x: 540, y: 300 }} colors={["#FFD54F", "#4FC3F7", "#FF8A65", "#81C784", "#F06292"]} count={30} seed={7} />
    </AbsoluteFill>
  );
};
