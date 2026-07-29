import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font, palette, slab } from "../data/tokens";
import { bob, wiggle } from "../lib/motion";
import { safeX } from "./LandscapeBeatKit";

// ── The Bakery — the hard c / soft c world, and the first BRIGHT one ─────────
// The last three worlds were all dark grounds (Word Court purple, Big Stage plum, Claw
// Machine navy). Dark backgrounds fight the content: white cards on a dark field read as
// holes punched in the frame rather than as objects sitting in front of it. So this world is
// light, and light is now the variety.
//
// THE STANDING RULE this world sets, for every world after it:
//   1. the background is ATMOSPHERE and is pushed BACK — low contrast, desaturated, and
//      never more than ~12% away from the wall tone;
//   2. a soft light WASH sits behind the content zone, so the teaching area is the brightest
//      part of the frame and the eye lands there first;
//   3. foreground cards stay fully opaque with a strong coloured border and slab extrusion,
//      so they read as lit objects standing on the counter.
//
// The set is a bakery because this card's whole idea is SOFT versus HARD, and a bakery is
// where those two words already live — a pillowy roll and a crunchy biscuit.
//
// LAYOUT LAW (LandscapeBeatKit): the STAGE band y 300…860 only.
//   300 … 430   the word's picture  · 450 … 650   the word tiles
//   682 … 740   the ↑ label         · 762 … 820   the note row
//   828 …        the counter

export const COUNTER_Y = 856;

export const BakerySky: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #FFF7E8 0%, #FFEFD6 46%, #FBE3BE 78%, #F3D6A8 100%)" }}>
      {/* the light wash behind the teaching area — the brightest part of the frame */}
      <div
        style={{
          position: "absolute", left: 0, top: 210, width, height: 620,
          background: "radial-gradient(ellipse 62% 78% at 50% 45%, rgba(255,255,255,0.95), rgba(255,255,255,0))",
        }}
      />

      {/* BACKGROUND, kept deliberately low-contrast: shelves of loaves behind the counter */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: 0.34 }}>
        {[168, 330].map((sy, r) => (
          <g key={r}>
            <rect x={0} y={sy + 74} width={width} height={13} rx={6} fill="#C98F5B" />
            {Array.from({ length: 9 }).map((_, i) => {
              const cx = 120 + i * ((width - 240) / 8);
              const w = 92 + ((i * 37) % 26);
              return (
                <g key={i}>
                  <ellipse cx={cx} cy={sy + 50} rx={w / 2} ry={30} fill={i % 2 ? "#E2B583" : "#D8A56F"} />
                  {[0, 1, 2].map((k) => (
                    <line key={k} x1={cx - 22 + k * 22} y1={sy + 30} x2={cx - 14 + k * 22} y2={sy + 44} stroke="#C08A55" strokeWidth={4} />
                  ))}
                </g>
              );
            })}
          </g>
        ))}
      </svg>

      {/* a sunny window on the left, well clear of the brand mark at top-right */}
      <svg width={420} height={330} style={{ position: "absolute", left: 40, top: 26, opacity: 0.5 }}>
        <rect x={10} y={10} width={400} height={300} rx={18} fill="#EAF6FF" stroke="#C98F5B" strokeWidth={12} />
        <line x1={210} y1={10} x2={210} y2={310} stroke="#C98F5B" strokeWidth={10} />
        <line x1={10} y1={160} x2={410} y2={160} stroke="#C98F5B" strokeWidth={10} />
        <circle cx={318} cy={82} r={38} fill="#FFE9A8" />
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={90 + i * 54} cy={104 + (i % 2) * 26} rx={44} ry={20} fill="#FFFFFF" opacity={0.9} />
        ))}
      </svg>

      {/* flour motes drifting in the window light — the frame is never still */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 22 }).map((_, i) => {
          const seed = i * 73.3;
          const y = COUNTER_Y - ((frame * (0.3 + (i % 4) * 0.14) + seed * 11) % 700);
          const x = 120 + ((seed * 6.7) % (width - 240)) + Math.sin(frame / 44 + i) * 18;
          return <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 5 : 3} fill="#FFFFFF" opacity={0.7} />;
        })}
      </svg>

      {/* the counter */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <rect x={0} y={COUNTER_Y} width={width} height={height - COUNTER_Y} fill="#C98F5B" />
        <rect x={0} y={COUNTER_Y} width={width} height={22} rx={11} fill="#E0AC79" />
        <rect x={0} y={COUNTER_Y + 22} width={width} height={7} fill="#A9713F" opacity={0.5} />
        {Array.from({ length: 14 }).map((_, i) => (
          <rect key={i} x={i * (width / 14)} y={COUNTER_Y + 34} width={4} height={height - COUNTER_Y - 34} fill="#A9713F" opacity={0.25} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// ── the baker, at the left end of the counter ───────────────────────────────
// No chef's hat: drawn over the mascot art it read as a white blob balanced on its head
// rather than as a hat, so it is gone. The apron colour and the counter carry the setting.
export const Baker: React.FC<{ cheerAt?: number[] }> = ({ cheerAt = [] }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  let last = -1;
  for (const c of cheerAt) if (frame >= c) last = c;
  const t = last >= 0 ? frame - last : 999;
  const hop = t < 20 ? Math.abs(Math.sin((t / 20) * Math.PI)) * -22 : 0;
  const W = 196;
  const H = Math.round(W * (1063 / 923)); // mascot.png is 923×1063 with no bottom padding
  return (
    <div style={{ position: "absolute", left: safeX(width) - 12, top: COUNTER_Y - H + 16, width: W + 40 }}>
      <Img
        src={staticFile("mascot.png")}
        style={{ width: W, transform: `translateY(${hop + bob(frame, fps, 3.4, 3)}px) rotate(${wiggle(frame, fps, 2.4, 2.2)}deg)` }}
      />

    </div>
  );
};

// this world's chip — dark ink on cream, which needs no plate on a light ground
export const BakeChip: React.FC<{ tone: string; children: React.ReactNode; size?: number }> = ({ tone, children, size = 36 }) => (
  <div
    style={{
      background: "#FFFFFF", border: `6px solid ${tone}`, borderRadius: 999,
      padding: "10px 32px", fontSize: size, fontWeight: 700, color: palette.ink,
      fontFamily: font.family, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 12,
      boxShadow: slab(tone.replace("#", ""), 10),
    }}
  >
    {children}
  </div>
);

// ── the like + subscribe bump ───────────────────────────────────────────────
// Silent by default, so it can be dropped into the eight already-recorded videos without a
// re-record; this card also speaks it, so `spokenAt` just syncs the animation to the line.
// Three lines, three changes. The first pass slid one card in and then held it for the whole
// twelve-second beat, which is exactly the stalled-screen failure the per-line law exists to
// prevent — the dead-second sweep caught it as a 12s flat stretch.
export const SubscribeBump: React.FC<{ wellAt: number; askAt: number; subAt: number; moreAt: number; until: number; top?: number }> = ({ wellAt, askAt, subAt, moreAt, until, top = 216 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < wellAt || frame > until) return null;
  const out = frame > until - 14 ? interpolate(frame, [until - 14, until], [1, 0], { extrapolateRight: "clamp" }) : 1;
  const asked = frame >= askAt;
  const more = frame >= moreAt;
  const ring = Math.sin((frame - askAt) / 5) * 10;
  const pop = (t: number) => spring({ frame: frame - t, fps, config: { damping: 12 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center", gap: 40, pointerEvents: "none", opacity: out, fontFamily: font.family }}>
      {/* 1 · "You're doing really well!" */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transform: `scale(${asked ? 0.66 : 0.86 + 0.14 * pop(wellAt)}) translateY(${bob(frame, fps, 6, 2.6)}px)` }}>
        {/* a trophy and a ring of stars, so the praise line is a moment and not a caption */}
        {(
          <div style={{ position: "relative", width: asked ? 210 : 280, height: asked ? 180 : 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* kept while the buttons are up, just smaller, and always scaling */}
            <span style={{ fontSize: asked ? 150 : 200, transform: `rotate(${wiggle(frame, fps, 2, 5)}deg) scale(${1 + 0.09 * Math.sin(((frame - wellAt) / fps) * 3.2)})`, display: "inline-block" }}>🏆</span>
            {Array.from({ length: 7 }).map((_, i) => {
              const a = (i / 7) * Math.PI * 2 + (frame - wellAt) / 26;
              const r = (asked ? 116 : 150) + Math.sin((frame - wellAt) / 9 + i) * 10;
              return (
                <span key={i} style={{ position: "absolute", left: (asked ? 105 : 140) + Math.cos(a) * r - 18, top: (asked ? 90 : 120) + Math.sin(a) * r * 0.62 - 18, fontSize: asked ? 34 : 44 }}>
                  {i % 2 ? "⭐" : "✨"}
                </span>
              );
            })}
          </div>
        )}
        <span style={{ fontSize: asked ? 56 : 68, fontWeight: 700, color: palette.ink }}>You&rsquo;re doing really well!</span>
      </div>

      {/* 2 · the two buttons, arriving one at a time */}
      {asked && (
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 30 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#FFFFFF", border: "8px solid #1565C0", borderRadius: 30, padding: "18px 40px", fontSize: 60, fontWeight: 700, color: "#1565C0", boxShadow: slab("1565C0", 16), transform: `scale(${0.7 + 0.3 * pop(askAt)})` }}>
            <span style={{ fontSize: 66, transform: `scale(${1 + 0.12 * Math.max(0, Math.sin((frame - askAt) / 7))})`, display: "inline-block" }}>👍</span>
            Like
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#C62828", border: "8px solid #8E1B36", borderRadius: 30, padding: "18px 44px", fontSize: 60, fontWeight: 700, color: "#FFFFFF", boxShadow: slab("8E1B36", 16), transform: `scale(${0.7 + 0.3 * pop(subAt)})`, opacity: frame >= subAt ? 1 : 0 }}>
            <span style={{ fontSize: 62, display: "inline-block", transform: `rotate(${ring}deg)` }}>🔔</span>
            Subscribe
          </div>
          {/* a hand tapping each button in turn, so the ask is a gesture and not a caption */}
          {(() => {
            // only tap a button that is actually on screen — before Subscribe arrives the
            // hand was alternating onto an empty slot and pointing at nothing
            const canAlternate = frame >= subAt;
            const beat = canAlternate ? Math.floor(((frame - subAt) / fps) * 1.1) % 2 : 0;
            const t = ((frame - askAt) % Math.round(fps / 1.1)) / (fps / 1.1);
            const press = Math.max(0, Math.sin(t * Math.PI));
            return (
              <span
                style={{
                  position: "absolute", left: beat === 0 ? "26%" : "62%", top: 86,
                  fontSize: 78, pointerEvents: "none",
                  transform: `translateY(${-press * 22}px) rotate(${-12 + press * 6}deg)`,
                }}
              >
                👆
              </span>
            );
          })()}
        </div>
      )}

      {/* 3 · "…then we can keep making more videos for you" */}
      {more && (
        <div style={{ display: "flex", alignItems: "center", gap: 18, transform: `scale(${0.8 + 0.2 * pop(moreAt)})` }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 118, height: 76, borderRadius: 14, background: "#FFFFFF",
                border: `6px solid ${i === 2 ? "#C9B79E" : "#2E7D32"}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38,
                boxShadow: slab(i === 2 ? "C9B79E" : "2E7D32", 9),
                transform: `translateY(${bob(frame, fps, 6, 2.4, i)}px) scale(${0.7 + 0.3 * pop(moreAt + i * 8)})`,
              }}
            >
              {i === 2 ? "➕" : "▶️"}
            </div>
          ))}
          <span style={{ fontSize: 44, fontWeight: 700, color: palette.ink }}>more videos for you!</span>
        </div>
      )}
    </div>
  );
};
