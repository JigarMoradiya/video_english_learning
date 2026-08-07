import React from "react";
import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "../data/tokens";

// ── THE DOWNLOAD CARD ────────────────────────────────────────────────────────
//
// The last two seconds of a reel: app icon, app name, both store badges. The corner
// watermark is switched OFF while this is on screen — the logo is the subject here, and
// having it twice on one frame reads as a mistake.

const pop = (frame: number, fps: number, at: number, damping = 13) =>
  spring({ frame: frame - at, fps, config: { damping, mass: 0.8, stiffness: 130 } });

export const EndCard: React.FC<{
  at: number;
  ink?: string;
  sub?: string;
  bg?: string;
}> = ({ at, ink = "#2A2440", sub = "Free on both stores", bg = "rgba(255,255,255,0.86)" }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const icon = pop(frame, fps, at);
  const name = pop(frame, fps, at + 5);
  const badges = pop(frame, fps, at + 10);
  const float = Math.sin(frame / 30) * 7;

  return (
    <div
      style={{
        // vertically centred on the frame, with EQUAL padding above and below its
        // contents — the card is the strip, so the two can never disagree
        position: "absolute", left: width * 0.06, top: "50%",
        transform: `translateY(calc(-50% + ${float}px))`,
        width: width * 0.88, padding: `${height * 0.030}px 0`,
        borderRadius: 56, background: bg,
        display: "flex", flexDirection: "column", alignItems: "center", gap: height * 0.018,
        boxShadow: "0 22px 0 rgba(42,36,64,0.16)",
      }}
    >
      <Img
        src={staticFile("app_icon.png")}
        style={{
          width: width * 0.30, height: width * 0.30, borderRadius: width * 0.068,
          transform: `scale(${icon})`,
          boxShadow: "0 16px 34px rgba(30,36,56,0.28)",
        }}
      />
      <div
        style={{
          fontFamily: font.family, fontWeight: 800, fontSize: width * 0.088, color: ink,
          transform: `scale(${name})`, textAlign: "center", lineHeight: 1.1,
        }}
      >
        English Learning
      </div>
      <div
        style={{
          fontFamily: font.family, fontWeight: 700, fontSize: width * 0.046, color: ink,
          opacity: 0.75, transform: `scale(${name})`,
        }}
      >
        {sub}
      </div>
      <div style={{ display: "flex", gap: width * 0.03, marginTop: height * 0.012, transform: `scale(${badges})` }}>
        <Img src={staticFile("appstore.png")} style={{ width: width * 0.38, height: "auto" }} />
        <Img src={staticFile("playstore.png")} style={{ width: width * 0.38, height: "auto" }} />
      </div>
    </div>
  );
};
