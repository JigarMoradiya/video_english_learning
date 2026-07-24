import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { bob, wiggle } from "../lib/motion";

// The app's bear mascot, always gently alive (bob + wiggle).
export const Mascot: React.FC<{
  size?: number;
  phase?: number;
  flip?: boolean;
  style?: React.CSSProperties;
}> = ({ size = 360, phase = 0, flip = false, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Img
      src={staticFile("mascot.png")}
      style={{
        width: size,
        height: "auto",
        transform: `translateY(${bob(frame, fps, 12, 2.4, phase)}px) rotate(${wiggle(
          frame,
          fps,
          2.5,
          2,
          phase
        )}deg) scaleX(${flip ? -1 : 1})`,
        filter: "drop-shadow(0 18px 30px rgba(30,36,56,0.22))",
        ...style,
      }}
    />
  );
};
