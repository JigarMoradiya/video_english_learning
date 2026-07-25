import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { VOWELS } from "../data/shortvowels";
import { font, palette } from "../data/tokens";
import { WATERMARK_ENABLED } from "./Watermark";

// the one purple theme used across the WHOLE portrait video (no per-section colour changes)
export const PORTRAIT_BG = "linear-gradient(180deg, #2E1A5E 0%, #4A2A8E 58%, #6A3AB0 100%)";

const rnd = (n: number, seed: number) => { const x = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return x - Math.floor(x); };

// drifting bubbles — the portrait theme's constant-motion signature (distinct from 16:9 sparkles)
export const Bubbles: React.FC<{ count?: number; color?: string; seed?: number; maxOpacity?: number }> = ({ count = 15, color = "#FFFFFF", seed = 1, maxOpacity = 0.16 }) => {
  const frame = useCurrentFrame();
  const { height, width } = useVideoConfig();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const bx = rnd(i, seed) * width;
        const size = 24 + rnd(i + 50, seed) * 90;
        const speed = 0.35 + rnd(i + 100, seed) * 0.7;
        const phase = rnd(i + 150, seed) * (height + 200);
        const y = height + 80 - ((frame * speed + phase) % (height + 200));
        const sway = Math.sin(frame * 0.02 + i) * 22;
        const op = (0.08 + rnd(i + 200, seed) * 0.1) * (maxOpacity / 0.16);
        // soft glowing bokeh (bright centre → transparent edge) so they always read as LIGHT
        return <div key={i} style={{ position: "absolute", left: bx + sway, top: y, width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle, ${color} 0%, ${color} 45%, transparent 72%)`, opacity: op }} />;
      })}
    </>
  );
};

// frosted topic chip — the brand logo lives INSIDE it (native branding, not a corner
// watermark). Falls back to the AEIOU colour dots when the watermark is toggled off.
export const PortraitTitle: React.FC<{ dark?: boolean }> = ({ dark = false }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 64, left: 0, width: "100%", display: "flex", justifyContent: "center", fontFamily: font.family, opacity: Math.min(1, frame / 12) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: dark ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.82)", backdropFilter: "blur(4px)", borderRadius: 44, padding: WATERMARK_ENABLED ? "7px 30px 7px 12px" : "12px 30px" }}>
        {WATERMARK_ENABLED
          ? <Img src={staticFile("logo.png")} style={{ height: 60, width: "auto" }} />
          : <div style={{ display: "flex", gap: 8 }}>{VOWELS.map((v) => <span key={v.letter} style={{ width: 15, height: 15, borderRadius: 8, background: v.color }} />)}</div>}
        <span style={{ fontSize: 34, fontWeight: 800, color: dark ? "#fff" : palette.ink }}>Short Vowels</span>
      </div>
    </div>
  );
};

// 5-vowel progress track — TOP of frame (bottom gets covered by platform UI on upload).
// Current vowel is filled white + larger; each dot shows the vowel colour.
export const ProgressDots: React.FC<{ idx: number }> = ({ idx }) => (
  <div style={{ position: "absolute", top: 158, left: 0, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 22 }}>
    {VOWELS.map((v, i) => (
      <div key={v.letter} style={{ width: i === idx ? 62 : 46, height: i === idx ? 62 : 46, borderRadius: 32, background: i === idx ? "#fff" : "rgba(255,255,255,0.24)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.family, fontSize: i === idx ? 34 : 26, fontWeight: 800, color: i === idx ? v.color : "rgba(255,255,255,0.9)", boxShadow: i === idx ? "0 6px 16px rgba(0,0,0,0.22)" : "none" }}>{v.letter}</div>
    ))}
  </div>
);
