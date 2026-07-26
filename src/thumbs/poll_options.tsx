import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { font } from "../data/tokens";

// ── Image-poll OPTION tiles (1080×1080) ──────────────────────────────────────
//   npx remotion still poll-opt-q out/poll_opt_q.png
//
// For a YouTube Community "image poll": the QUESTION is text (it carries the sound) and the
// OPTIONS are images — these tiles. They render small in the feed, so each is just one huge
// letter pair on its own colour: readable at a glance, nothing else to decode.
const AZ_COLORS: Record<string, [string, string]> = {
  Q: ["#6D28D9", "#A855F7"], // purple
  K: ["#0E7490", "#22B8CF"], // teal
  G: ["#B45309", "#F59E0B"], // amber
  P: ["#9D174D", "#EC4899"], // pink
};

const Stars: React.FC<{ seed: number }> = ({ seed }) => {
  const rnd = (k: number) => { const x = Math.sin(k * 91.7 + seed * 47.3) * 43758.5453; return x - Math.floor(x); };
  return (
    <>
      {Array.from({ length: 11 }).map((_, i) => {
        const r = 12 + rnd(i) * 22;
        const pts = Array.from({ length: 10 }).map((_, j) => {
          const a = (Math.PI / 5) * j - Math.PI / 2;
          const rr = j % 2 === 0 ? r : r * 0.44;
          return `${r + rr * Math.cos(a)},${r + rr * Math.sin(a)}`;
        }).join(" ");
        return <svg key={i} width={r * 2} height={r * 2} style={{ position: "absolute", left: rnd(i + 30) * 1000, top: rnd(i + 60) * 1000, opacity: 0.13 + rnd(i + 90) * 0.12 }}><polygon points={pts} fill="#fff" /></svg>;
      })}
    </>
  );
};

const OptionTile: React.FC<{ letter: string }> = ({ letter }) => {
  const [a, b] = AZ_COLORS[letter] ?? ["#334155", "#64748B"];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(150deg, ${a} 0%, ${b} 100%)`, fontFamily: font.family, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <Stars seed={letter.charCodeAt(0)} />
      {/* one huge letter pair — poll options render small, so nothing competes with it */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 20, transform: "translateY(-24px)" }}>
        <span style={{ fontSize: 520, fontWeight: 800, color: "#fff", lineHeight: 0.9, textShadow: "0 20px 44px rgba(0,0,0,0.32)" }}>{letter}</span>
        <span style={{ fontSize: 360, fontWeight: 800, color: "rgba(255,255,255,0.82)", lineHeight: 0.9, textShadow: "0 20px 44px rgba(0,0,0,0.3)" }}>{letter.toLowerCase()}</span>
      </div>
      <Img src={staticFile("logo.png")} style={{ position: "absolute", right: 28, bottom: 26, width: 128, height: "auto", opacity: 0.95 }} />
    </AbsoluteFill>
  );
};

export const PollOptQ: React.FC = () => <OptionTile letter="Q" />;
export const PollOptK: React.FC = () => <OptionTile letter="K" />;
export const PollOptG: React.FC = () => <OptionTile letter="G" />;
export const PollOptP: React.FC = () => <OptionTile letter="P" />;
