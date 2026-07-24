import React from "react";
import { Img, spring, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { PhonicsComparison } from "../data/types";
import { Stage } from "../components/Stage";
import { bob, wiggle } from "../lib/motion";
import { hex, palette } from "../data/tokens";

// ⑧ Recap punchline + logo + Play Store / App Store badges.
// hi0/hi1 = beat-relative frames when team0 / team1 highlight in the recap;
// logoAt = when the app promo appears. Defaults are ai/ay's timing.
export const Wrap: React.FC<{
  data: PhonicsComparison;
  hi0?: number;
  hi1?: number;
  hiLen?: number;
  logoAt?: number;
}> = ({ data, hi0 = 30, hi1 = 90, hiLen = 60, logoAt = 210 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [ai, ay] = data.teams;

  const recap = spring({ frame, fps, config: { damping: 12 } });
  const logoIn = spring({ frame: frame - logoAt, fps, config: { damping: 12 } });
  const play = spring({ frame: frame - (logoAt + 40), fps, config: { damping: 10 } });
  const apple = spring({ frame: frame - (logoAt + 52), fps, config: { damping: 10 } });

  const stateFor = (start: number, other: number): "normal" | "active" | "dim" =>
    frame >= start && frame < start + hiLen ? "active" : frame >= other && frame < other + hiLen ? "dim" : "normal";

  return (
    <Stage gap={50}>
      <div style={{ display: "flex", gap: 40, transform: `scale(${recap})` }}>
        <RecapChip
          text={`${ai.marker} · ${ai.zoneHint} ${ai.zoneEmoji}`}
          color={hex(ai.colorHex)}
          phase={0}
          state={stateFor(hi0, hi1)}
        />
        <RecapChip
          text={`${ay.marker} · ${ay.zoneHint} ${ay.zoneEmoji}`}
          color={hex(ay.colorHex)}
          phase={1.5}
          state={stateFor(hi1, hi0)}
        />
      </div>

      <Img
        src={staticFile("logo.png")}
        style={{
          width: 560,
          height: "auto",
          transform: `scale(${logoIn}) translateY(${bob(frame, fps, 10, 2.6)}px) rotate(${wiggle(
            frame,
            fps,
            1.5,
            2.4
          )}deg)`,
          filter: "drop-shadow(0 16px 30px rgba(30,36,56,0.2))",
        }}
      />

      <div
        style={{
          opacity: logoIn,
          fontSize: 52,
          fontWeight: 600,
          color: palette.ink,
        }}
      >
        Download free 👇
      </div>

      <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
        <Img
          src={staticFile("playstore.png")}
          style={{
            width: 330,
            height: "auto",
            transform: `scale(${play}) translateY(${bob(frame, fps, 5, 2.2)}px)`,
          }}
        />
        <Img
          src={staticFile("appstore.png")}
          style={{
            width: 330,
            height: "auto",
            transform: `scale(${apple}) translateY(${bob(frame, fps, 5, 2.2, 1.5)}px)`,
          }}
        />
      </div>
    </Stage>
  );
};

const RecapChip: React.FC<{
  text: string;
  color: string;
  phase: number;
  state: "normal" | "active" | "dim";
}> = ({ text, color, phase, state }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = state === "active" ? 1.12 : 1;
  const opacity = state === "dim" ? 0.32 : 1;
  return (
    <div
      style={{
        transform: `translateY(${bob(frame, fps, 8, 2.2, phase)}px) scale(${scale})`,
        opacity,
        background: state === "dim" ? "#9AA3B2" : color,
        color: "#fff",
        fontSize: 54,
        fontWeight: 600,
        padding: "18px 40px",
        borderRadius: 999,
        boxShadow: state === "active" ? `0 12px 30px ${color}66` : "none",
      }}
    >
      {text}
    </div>
  );
};
