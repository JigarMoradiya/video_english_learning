import React from "react";
import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { bob } from "../lib/motion";
import { illustrationFor } from "../data/wordImages";

// Animated "rain": a cloud with looping falling raindrops.
const RainAnim: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cloudW = size * 0.82;
  const cloudTop = size * 0.05;
  const cloudBottom = cloudTop + size * 0.34;
  const fallEnd = size * 0.98;
  const drops = Array.from({ length: 10 }, (_, i) => {
    const x = size * (0.16 + (i % 5) * 0.16) + (i >= 5 ? size * 0.06 : 0);
    const period = 20 + (i % 4) * 4;
    const offset = (i * 7) % period;
    const prog = ((frame + offset) % period) / period;
    const y = cloudBottom + prog * (fallEnd - cloudBottom);
    const opacity = prog < 0.15 ? prog / 0.15 : prog > 0.85 ? (1 - prog) / 0.15 : 1;
    return { x, y, opacity };
  });
  return (
    <div style={{ width: size, height: size, position: "relative", transform: `translateY(${bob(frame, fps, 8, 2.6)}px)` }}>
      {drops.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: d.x,
            top: d.y,
            width: 10,
            height: 26,
            background: "linear-gradient(#6Fc9FF,#2E9BE6)",
            borderRadius: "60% 60% 60% 60% / 80% 80% 40% 40%",
            opacity: d.opacity,
          }}
        />
      ))}
      {/* cloud */}
      <div style={{ position: "absolute", top: cloudTop, left: (size - cloudW) / 2, width: cloudW, height: size * 0.34 }}>
        <div style={{ position: "absolute", bottom: 0, width: "100%", height: "62%", background: "#EDF2F7", borderRadius: 999, boxShadow: "0 10px 24px rgba(30,36,56,0.15)" }} />
        <div style={{ position: "absolute", left: "8%", top: "6%", width: "46%", height: "78%", background: "#FBFDFF", borderRadius: "50%" }} />
        <div style={{ position: "absolute", right: "6%", top: "0%", width: "56%", height: "92%", background: "#F4F8FC", borderRadius: "50%" }} />
      </div>
    </div>
  );
};

// Animated "day": a smiley sun (app art) with rotating rays + pulsing glow.
const SunAnim: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spin = (frame / fps) * 18; // slow degrees
  const glow = 0.85 + 0.15 * Math.sin((frame / fps) * Math.PI * 1.6);
  return (
    <div style={{ width: size, height: size, position: "relative", transform: `translateY(${bob(frame, fps, 8, 2.4)}px)` }}>
      <div
        style={{
          position: "absolute",
          inset: "12%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,213,79,0.55), rgba(255,213,79,0) 70%)",
          transform: `scale(${glow * 1.15})`,
        }}
      />
      <Img
        src={staticFile("words/day.png")}
        style={{ width: "100%", height: "100%", objectFit: "contain", transform: `rotate(${spin}deg)` }}
      />
    </div>
  );
};

// Animated "paint": a brush that paints a rainbow stroke left-to-right (loops).
const PaintAnim: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const period = 84;
  const p = (frame % period) / period;
  const progress = Math.min(1, p / 0.72); // paint, then hold
  const trackW = size * 0.78;
  const strokeW = progress * trackW;
  const left = size * 0.11;
  const midY = size * 0.5;
  return (
    <div style={{ width: size, height: size, position: "relative", transform: `translateY(${bob(frame, fps, 8, 2.6)}px)` }}>
      {/* rainbow stroke */}
      <div
        style={{
          position: "absolute",
          left,
          top: midY - size * 0.11,
          width: strokeW,
          height: size * 0.22,
          borderRadius: 999,
          background: "linear-gradient(90deg,#FF5252,#FFB300,#4CAF50,#29B6F6,#AB47BC)",
          boxShadow: "0 8px 18px rgba(30,36,56,0.18)",
        }}
      />
      {/* brush riding the tip */}
      <div
        style={{
          position: "absolute",
          left: left + strokeW - size * 0.04,
          top: midY - size * 0.42,
          fontSize: size * 0.42,
          transform: "rotate(35deg)",
        }}
      >
        🖌️
      </div>
    </div>
  );
};

// Animated "stay": a cozy little house with a pulsing heart (stay home!).
const StayAnim: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = size;
  const beat = 1 + 0.08 * Math.sin((frame / fps) * Math.PI * 2);
  return (
    <div style={{ width: s, height: s, position: "relative", transform: `translateY(${bob(frame, fps, 8, 2.4)}px)` }}>
      {/* heart */}
      <div style={{ position: "absolute", top: s * 0.02, left: "50%", transform: `translateX(-50%) scale(${beat})`, fontSize: s * 0.22 }}>💛</div>
      {/* roof */}
      <div style={{ position: "absolute", top: s * 0.28, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: `${s * 0.34}px solid transparent`, borderRight: `${s * 0.34}px solid transparent`, borderBottom: `${s * 0.26}px solid #E5544B` }} />
      {/* body */}
      <div style={{ position: "absolute", top: s * 0.52, left: "50%", transform: "translateX(-50%)", width: s * 0.5, height: s * 0.36, background: "#FFD08A", borderRadius: 10, boxShadow: "0 10px 22px rgba(30,36,56,0.16)" }} />
      {/* door */}
      <div style={{ position: "absolute", top: s * 0.66, left: "50%", transform: "translateX(-50%)", width: s * 0.16, height: s * 0.22, background: "#B5651D", borderRadius: "8px 8px 0 0" }} />
    </div>
  );
};

// Shows a word's picture: animated (rain/day/paint/stay) → app cutout → emoji.
export const WordIllustration: React.FC<{ word: string; size?: number; delay?: number }> = ({
  word,
  size = 320,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 11 } });
  const enter = { transform: `scale(${s})`, opacity: Math.min(1, s + 0.001) };

  if (word === "rain") return <div style={enter}><RainAnim size={size} /></div>;
  if (word === "day") return <div style={enter}><SunAnim size={size} /></div>;
  if (word === "paint") return <div style={enter}><PaintAnim size={size} /></div>;
  if (word === "stay") return <div style={enter}><StayAnim size={size} /></div>;

  const ill = illustrationFor(word);
  if (!ill) return null;

  const common: React.CSSProperties = {
    transform: `scale(${s}) translateY(${bob(frame, fps, 10, 2.4)}px)`,
  };
  if (ill.kind === "image") {
    return (
      <Img
        src={staticFile(ill.src)}
        style={{ ...common, width: size, height: size, objectFit: "contain", filter: "drop-shadow(0 14px 26px rgba(30,36,56,0.18))" }}
      />
    );
  }
  return <div style={{ ...common, fontSize: size * 0.8, lineHeight: 1 }}>{ill.char}</div>;
};
