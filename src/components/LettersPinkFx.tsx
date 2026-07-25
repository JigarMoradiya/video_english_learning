import React from "react";
import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "../data/tokens";
import { WATERMARK_ENABLED } from "./Watermark";

// ── Pink world, shared by the two 9:16 Letter videos ─────────────────────────
// Same depth as the Short Vowels purple (hue-rotated to rose, identical S/L) so the two
// families read as siblings: #2E1A5E→#5E1A3A, #4A2A8E→#8E2A59, #6A3AB0→#B03A71.
export const PINK_BG = "linear-gradient(180deg, #5E1A3A 0%, #8E2A59 58%, #B03A71 100%)";

const rnd = (n: number, seed: number) => { const x = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return x - Math.floor(x); };

// Part 1's ambient signature: drifting MUSIC NOTES (it's the "sounds" video).
export const MusicNotes: React.FC<{ count?: number; seed?: number }> = ({ count = 12, seed = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = rnd(i, seed) * width;
        const size = 26 + rnd(i + 40, seed) * 40;
        const speed = 0.4 + rnd(i + 80, seed) * 0.7;
        const phase = rnd(i + 120, seed) * (height + 240);
        const y = height + 100 - ((frame * speed + phase) % (height + 240));
        const sway = Math.sin(frame * 0.022 + i) * 26;
        const rot = Math.sin(frame * 0.03 + i) * 16;
        const op = 0.1 + rnd(i + 160, seed) * 0.1;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" style={{ position: "absolute", left: x + sway, top: y, opacity: op, transform: `rotate(${rot}deg)` }}>
            <path d="M9 18V5l10-2v13" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
            <ellipse cx={6.5} cy={18} rx={3.2} ry={2.4} fill="#fff" />
            <ellipse cx={16.5} cy={16} rx={3.2} ry={2.4} fill="#fff" />
          </svg>
        );
      })}
    </>
  );
};

// Part 2's ambient signature: RISING STARS (different motion from part 1's notes).
export const RisingStars: React.FC<{ count?: number; seed?: number }> = ({ count = 16, seed = 5 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = rnd(i, seed) * width;
        const r = 9 + rnd(i + 30, seed) * 17;
        const speed = 0.5 + rnd(i + 60, seed) * 0.9;
        const phase = rnd(i + 90, seed) * (height + 200);
        const y = height + 80 - ((frame * speed + phase) % (height + 200));
        const spin = (frame * (0.6 + rnd(i + 200, seed))) % 360;
        const op = 0.12 + rnd(i + 140, seed) * 0.12;
        const pts = Array.from({ length: 10 }).map((_, j) => {
          const a = (Math.PI / 5) * j - Math.PI / 2;
          const rr = j % 2 === 0 ? r : r * 0.44;
          return `${r + rr * Math.cos(a)},${r + rr * Math.sin(a)}`;
        }).join(" ");
        return (
          <svg key={i} width={r * 2} height={r * 2} style={{ position: "absolute", left: x, top: y, opacity: op, transform: `rotate(${spin}deg)` }}>
            <polygon points={pts} fill="#fff" />
          </svg>
        );
      })}
    </>
  );
};

// ── CollapseRow ──────────────────────────────────────────────────────────────
// A staged-beat row whose HEIGHT follows its own progress, so a beat that hasn't
// arrived (or has handed over) takes no space — no holes, and no overlap.
// Height comes from `grid-template-rows: <p>fr`, i.e. the row's OWN natural content
// height — so nothing is ever clipped and there are no hardcoded row heights to
// get wrong (an earlier version used fixed pixel heights and cut the mascot off).
export const CollapseRow: React.FC<{ p: number; gap?: number; children: React.ReactNode }> = ({ p, gap = 26, children }) => {
  const q = Math.max(0, Math.min(1, p));
  return (
    // The row's height is `q` × its own natural height, and the content is SCALED by the
    // same `q` — so the content always fits the row exactly and is never sliced. (Height
    // alone would shrink the box while the artwork stayed full-size, which cut the mascot's
    // feet off mid-transition.)
    <div style={{ display: "grid", gridTemplateRows: `${q}fr`, opacity: q, marginTop: -gap * (1 - q), width: "100%" }}>
      <div style={{ minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", gap, transform: `scale(${q})`, transformOrigin: "top center" }}>{children}</div>
    </div>
  );
};

const AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// 26 mini letter chips that cascade in — the visual for "all the way from A to Z" and for
// the "you know all your sounds" recap. `lit` = how many are highlighted (26 = all).
export const AlphabetChips: React.FC<{ startFrame?: number; lit?: number; size?: number }> = ({ startFrame = 0, lit = 26, size = 62 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, maxWidth: 856, fontFamily: font.family }}>
      {AZ.map((ch, i) => {
        const inn = spring({ frame: frame - startFrame - i * 2, fps, config: { damping: 12 } });
        const on = i < lit;
        const isVowel = "AEIOU".includes(ch);
        const wob = Math.sin((frame / fps) * 2 + i) * 2;
        return (
          <div key={ch} style={{
            width: size, height: size, borderRadius: 16,
            background: on ? (isVowel ? "#FF8A2B" : "rgba(255,255,255,0.82)") : "rgba(255,255,255,0.14)",
            color: on ? (isVowel ? "#fff" : "#7A2A4C") : "rgba(255,255,255,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: size * 0.5, fontWeight: 800,
            transform: `scale(${inn}) translateY(${wob}px)`, opacity: inn,
            boxShadow: on && isVowel ? "0 6px 16px rgba(255,138,43,0.5)" : "none",
          }}>{ch}</div>
        );
      })}
    </div>
  );
};

// Rich "listen" badge — filled ear on a white plate, with sound arcs travelling INTO it
// and a gold sparkle. (Replaces the thin single-stroke ear that read as too plain.)
export const ListenBadge: React.FC<{ size?: number; active?: boolean }> = ({ size = 230, active = true }) => {
  const frame = useCurrentFrame();
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <circle cx={112} cy={100} r={78} fill="#fff" />
      {/* ear (filled) */}
      <path d="M126 56 a30 30 0 0 0 -56 16 c0 12 6 17 6 26 c0 8 -4 11 -4 20 a17 17 0 0 0 34 2 c2 -12 10 -16 16 -26 c6 -10 10 -22 4 -38 z" fill="#B03A71" />
      <path d="M96 78 a13 13 0 0 1 22 8 c0 8 -8 9 -10 17" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" />
      {/* incoming sound arcs (travel toward the ear) */}
      {active && [0, 1, 2].map((k) => {
        const t = (((frame * 1.5) + k * 10) % 30) / 30;
        return <path key={k} d={`M${36 - t * 14} ${100 - 26 - t * 8} a${30 + t * 16} ${30 + t * 16} 0 0 1 0 ${(30 + t * 16) * 1.75}`} fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={(1 - t) * 0.85} />;
      })}
      {/* gold sparkle */}
      <g transform={`translate(168 42) scale(${1 + 0.16 * Math.sin(frame * 0.2)})`}>
        <path d="M0 -16 L4 -4 L16 0 L4 4 L0 16 L-4 4 L-16 0 L-4 -4 Z" fill="#FFC24A" />
      </g>
    </svg>
  );
};

// Rich speaker glyph for the practice rounds — cone + body + 3 arcs + a music note.
export const SpeakerGlyph: React.FC<{ size?: number; active?: boolean }> = ({ size = 200, active = true }) => {
  const frame = useCurrentFrame();
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <defs>
        <linearGradient id="spk" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D4548F" /><stop offset="100%" stopColor="#8E2A59" />
        </linearGradient>
      </defs>
      {/* body + cone */}
      <rect x={38} y={82} width={30} height={38} rx={10} fill="url(#spk)" />
      <path d="M68 84 L104 54 a6 6 0 0 1 10 4 v86 a6 6 0 0 1 -10 4 L68 118 z" fill="url(#spk)" />
      {/* arcs */}
      {[0, 1, 2].map((k) => {
        const r = 22 + k * 17;
        const on = !active || frame % 30 > k * 7;
        return <path key={k} d={`M126 ${100 - r} a${r} ${r} 0 0 1 0 ${r * 2}`} fill="none" stroke="url(#spk)" strokeWidth={9} strokeLinecap="round" opacity={on ? 1 - k * 0.16 : 0.2} />;
      })}
      {/* music note riding out on the sound */}
      {active && (() => {
        const t = ((frame * 1.4) % 34) / 34;
        return (
          <g transform={`translate(${150 + t * 26} ${58 - t * 26}) scale(${0.9 - t * 0.2})`} opacity={(1 - t) * 0.9}>
            <path d="M4 20V4l14-3v14" fill="none" stroke="#FFC24A" strokeWidth={3.4} strokeLinecap="round" />
            <ellipse cx={1.5} cy={20} rx={4.4} ry={3.3} fill="#FFC24A" />
            <ellipse cx={15.5} cy={17} rx={4.4} ry={3.3} fill="#FFC24A" />
          </g>
        );
      })()}
    </svg>
  );
};

// Frosted title chip with the brand logo inside (no plate behind the logo).
export const PinkTitle: React.FC<{ title: string; sub?: string; part?: string }> = ({ title, sub, part }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 62, left: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: Math.min(1, frame / 12), fontFamily: font.family }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.16)", backdropFilter: "blur(4px)", borderRadius: 44, padding: "8px 30px 8px 12px" }}>
        {WATERMARK_ENABLED && <Img src={staticFile("logo.png")} style={{ height: 58, width: "auto" }} />}
        <span style={{ fontSize: 38, fontWeight: 800, color: "#fff" }}>{title}</span>
        {sub && <span style={{ fontSize: 32, fontWeight: 800, color: "rgba(255,255,255,0.72)", letterSpacing: 2 }}>{sub}</span>}
      </div>
      {part && <div style={{ fontSize: 30, fontWeight: 800, color: "#FFD9EC", letterSpacing: 3 }}>{part}</div>}
    </div>
  );
};
