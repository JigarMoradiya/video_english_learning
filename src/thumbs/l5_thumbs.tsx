import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { font, palette } from "../data/tokens";
import { cover } from "./cover";
import { SiteWorld } from "../components/BuildSite";
import { TowerWorld, Tower, bands as towerBands } from "../components/BellTower";
import { StageWorld } from "../components/MagicStage";

// ── L5 Spelling Rules · Parts 1–3 · covers (1280×720 and 1080×1920) ─────────
//   npx remotion still thumb-l5-p1 out/thumb_l5/l5_p1.png       (…p2 …p3)
//   npx remotion still thumb-l5-p1-916 out/thumb_l5/l5_p1_916.png
//
// Each cover is built ON ITS OWN VIDEO'S WORLD — the real components, not a flat gradient
// approximating them: the Word Building Site, the Bell Tower, the Magic Stage. A cover
// promises what the video shows, and none of the three worlds carries its own character,
// so the bear can be added without putting two mascots on screen.
//
// INK FOLLOWS THE WORLD, NOT THE HOUSE RULE. cover.ts says "do not put white text on these
// worlds; they are pale" — true of the Site and the Tower, and false of the Stage, which is
// a plum curtain at night. So p1/p2 take dark ink and p3 takes white. Applying the pale
// rule to a dark world would have meant repainting the world, which is the thing the
// cover rules forbid.
//
// HEADLINE SIZE. cover().headSize reserves W-344 because a headline centred across the
// full width would otherwise slide under the badge. That reservation does not apply here:
// the badge ends at y118 and the headline starts at y122, so they never share a row. The
// headline is therefore free to use the full width, which is why it is larger than the
// channel's usual 104. Measured, not assumed — see the ×2 note in PART 1.

const GOLD_T = "#E09A0C";
const BLUE = "#2D7FE0";
const RED = "#D9452F";
const TEAL = "#12A896";
const VOWEL = "#3F86D0";

type Geo = ReturnType<typeof geo>;
const geo = (portrait: boolean, extraTop = 0) => {
  const W = portrait ? 1080 : 1280;
  const H = portrait ? 1920 : 720;
  const c = cover(W, H);
  const tile = portrait ? 150 : 116;
  return {
    W, H, c, portrait, tile,
    gap: portrait ? 14 : 12,
    wide: portrait ? 196 : 150,          // the `ck` tile — two glyphs
    arrow: portrait ? 58 : 44,
    label: portrait ? 38 : 28,
    headSize: c.headSize(portrait ? "SPELLING".length : "SPELLING RULES".length),
    headTop: c.head.top,
    headLines: portrait ? 2 : 1,
    // the band a key visual may occupy: clear of the mascot on the left, the logo right
    left: (portrait ? c.mascot.left + c.mascot.width * 0.42 : c.mascot.left + c.mascot.width) + 34,
    right: W - (c.logo.right + c.logo.width) - 34,
    top: (portrait ? 730 : 250) + extraTop,
  };
};

/** A cover cannot get away with an overlap the way a moving frame can, so the headline's
 *  bottom is asserted above the first thing under it. Both are computed, so this cannot
 *  drift: change a size and the render fails rather than shipping the collision that the
 *  ×2 mark shipped with the first cut. */
const assertHeadClear = (g: Geo) => {
  const bottom = g.headTop + g.headSize * 1.04 * g.headLines;
  if (bottom > g.top - 6) {
    throw new Error(`l5 cover: headline ends ${Math.round(bottom)}, content starts ${g.top}`);
  }
};
const cx = (g: Geo) => (g.left + g.right) / 2;
const check = (g: Geo, label: string, l: number, r: number) => {
  if (l < g.left || r > g.right) {
    throw new Error(`l5 cover: ${label} spans ${Math.round(l)}–${Math.round(r)}, band is ${Math.round(g.left)}–${Math.round(g.right)}`);
  }
};

/**
 * A row of four tiles, each with a soft blurred drop shadow, merges into one continuous
 * grey band under the row — which on a PALE world reads as a grey rule ruled across the
 * cover, and is invisible on a dark one. That is the whole reason p3 looked right and
 * p1/p2 did not. On pale worlds the shadow is therefore a tight, tinted offset with no
 * blur, so neighbouring tiles cannot pool into a line.
 */
const Tile: React.FC<{ g: Geo; ch: string; colour: string; x: number; y: number; w?: number; fill?: boolean; pale?: boolean }> =
  ({ g, ch, colour, x, y, w, fill = false, pale = false }) => (
    <div style={{
      position: "absolute", left: x, top: y, width: w ?? g.tile, height: g.tile, boxSizing: "border-box",
      background: fill ? colour : "#FFFFFF", border: `${g.portrait ? 11 : 9}px solid ${colour}`,
      borderRadius: g.tile * 0.21,
      boxShadow: pale ? "none" : `0 ${g.tile * 0.1}px ${g.tile * 0.22}px rgba(20,26,40,0.34)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: g.tile * (ch.length > 1 ? 0.56 : 0.72), fontWeight: 800,
      color: fill ? "#FFFFFF" : colour, lineHeight: 1,
    }}>{ch}</div>
  );

const RuleName: React.FC<{ g: Geo; x: number; w: number; y: number; text: string; ink: string }> =
  ({ g, x, w, y, text, ink }) => (
    <div style={{
      position: "absolute", left: x, top: y, width: w, textAlign: "center",
      fontSize: g.label, fontWeight: 800, color: ink, letterSpacing: 0.6,
      textShadow: ink === "#FFFFFF" ? "0 3px 12px rgba(0,0,0,0.6)" : "0 2px 0 rgba(255,255,255,0.7)",
    }}>{text}</div>
  );

const Arrow: React.FC<{ g: Geo; x: number; y: number; ink: string }> = ({ g, x, y, ink }) => (
  <div style={{
    position: "absolute", left: x, top: y, width: g.arrow, textAlign: "center",
    fontSize: g.tile * 0.46, fontWeight: 800, color: ink,
    textShadow: ink === "#FFFFFF" ? "0 3px 10px rgba(0,0,0,0.55)" : "0 2px 0 rgba(255,255,255,0.7)",
  }}>→</div>
);

const Shell: React.FC<{
  g: Geo; part: number; ink: string; world: React.ReactNode;
  logoTop?: boolean; children: React.ReactNode;
}> = ({ g, part, ink, world, logoTop = false, children }) => {
  const { c, W } = g;
  const white = ink === "#FFFFFF";
  return (
    <AbsoluteFill style={{ fontFamily: font.family, overflow: "hidden" }}>
      {world}
      {/* a soft lift, not a solid card: p3 reads perfectly with only this, and the three
          covers have to look like one series */}
      <div style={{
        position: "absolute", left: 0, top: g.top - g.tile * 0.6, width: W, height: g.H - g.top + g.tile * 0.3,
        background: white
          ? "radial-gradient(closest-side, rgba(255,255,255,0.14), rgba(255,255,255,0))"
          : "radial-gradient(closest-side, rgba(255,255,255,0.62), rgba(255,255,255,0))",
      }} />

      <div style={{ position: "absolute", ...c.badge, color: palette.ink }}>
        LEVEL 5<br /><span style={c.badgeSub}>PART {part}</span>
      </div>

      <div style={{
        position: "absolute", left: 0, top: g.headTop, width: W, textAlign: "center",
        fontSize: g.headSize, whiteSpace: "pre-line", fontWeight: c.head.fontWeight, lineHeight: c.head.lineHeight,
        letterSpacing: c.head.letterSpacing, color: ink,
        // the channel's own lift, from cover(). White ink needs a dark one instead.
        textShadow: white
          ? "0 6px 0 rgba(0,0,0,0.42), 0 12px 30px rgba(0,0,0,0.5)"
          : c.head.textShadow,
      }}>{g.headLines === 2 ? "SPELLING\nRULES" : "SPELLING RULES"}</div>

      {children}

      <Img src={staticFile("mascot.png")} style={{
        position: "absolute", left: c.mascot.left, bottom: c.mascot.bottom, width: c.mascot.width, height: "auto",
        filter: "drop-shadow(0 14px 26px rgba(0,0,0,0.45))",
      }} />
      <Img src={staticFile("logo.png")} style={logoTop
        ? { position: "absolute", right: c.logo.right, top: c.logo.bottom, width: c.logo.width, height: "auto" }
        : { position: "absolute", right: c.logo.right, bottom: c.logo.bottom, width: c.logo.width, height: "auto" }} />
    </AbsoluteFill>
  );
};

// ── PART 1 · double it, and c / k / ck ──────────────────────────────────────
//
// The ×2 mark sits ABOVE the first row, which is where it collided with the headline in
// the first cut — the mark's top was y192 and the headline's bottom y193. Both are now
// derived from `top` rather than hand-placed, so the gap cannot silently close again.
const P1: React.FC<{ g: Geo; ink: string; world: React.ReactNode }> = ({ g, ink, world }) => {
  assertHeadClear(g);
  const r1w = g.tile * 4 + g.gap * 3;
  const r2w = g.tile * 2 + g.gap * 2 + g.wide;
  const r1x = cx(g) - r1w / 2;
  const r2x = cx(g) - r2w / 2;
  const markH = g.tile * 0.42;
  const r1y = g.top + markH + g.tile * 0.32;
  const r2y = r1y + g.tile + g.label + (g.portrait ? 60 : 36);
  check(g, "buzz", r1x, r1x + r1w);
  check(g, "c k ck", r2x, r2x + r2w);
  const bx = r1x + (g.tile + g.gap) * 2 - 9;
  const bw = g.tile * 2 + g.gap + 18;
  return (
    <Shell g={g} part={1} ink={ink} world={world}>
      <div style={{
        position: "absolute", left: bx, top: g.top + markH, width: bw, height: g.tile * 0.19,
        borderTop: `8px solid ${GOLD_T}`, borderLeft: `8px solid ${GOLD_T}`, borderRight: `8px solid ${GOLD_T}`,
        borderRadius: "14px 14px 0 0",
      }} />
      <div style={{
        position: "absolute", left: bx, top: g.top, width: bw, textAlign: "center",
        fontSize: markH, fontWeight: 800, color: GOLD_T,
        textShadow: ink === "#FFFFFF" ? "0 3px 10px rgba(0,0,0,0.55)" : "0 2px 0 rgba(255,255,255,0.8)",
      }}>×2</div>

      {[{ ch: "b", c: BLUE }, { ch: "u", c: BLUE }, { ch: "z", c: GOLD_T }, { ch: "z", c: GOLD_T }].map((t, i) => (
        <Tile key={i} g={g} ch={t.ch} colour={t.c} x={r1x + i * (g.tile + g.gap)} y={r1y}  pale />
      ))}
      <RuleName g={g} x={r1x} w={r1w} y={r1y + g.tile + 8} text="DOUBLE IT" ink={ink} />

      <Tile g={g} ch="c" colour={BLUE} x={r2x} y={r2y}  pale />
      <Tile g={g} ch="k" colour={BLUE} x={r2x + g.tile + g.gap} y={r2y}  pale />
      <Tile g={g} ch="ck" colour={GOLD_T} x={r2x + (g.tile + g.gap) * 2} y={r2y} w={g.wide}  pale />
      <RuleName g={g} x={r2x} w={r2w} y={r2y + g.tile + 8} text="c · k · ck" ink={ink} />
    </Shell>
  );
};

// ── PART 2 · ng or nk ───────────────────────────────────────────────────────
const P2: React.FC<{ g: Geo; ink: string; world: React.ReactNode }> = ({ g, ink, world }) => {
  assertHeadClear(g);
  const w = g.tile * 4 + g.gap * 3;
  const x = cx(g) - w / 2;
  const y = g.top;
  const rgap = g.portrait ? 26 : 20;
  check(g, "ring / rink", x, x + w);
  // the world's own tower runs the full height at x980–1246 in landscape, straight through
  // the lesson. The cover uses a bare world and plants its own small one on the bottom edge.
  const tw = g.portrait ? 176 : 116;
  const th = g.portrait ? 520 : 290;
  const smallTower = {
    ...towerBands(g.W, g.H),
    towerL: g.W - tw - (g.portrait ? 26 : 22),
    towerW: tw, towerTop: g.H - th, towerH: th,
  };
  return (
    <Shell g={g} part={2} ink={ink} world={world} logoTop>
      <Tower b={smallTower} />
      {[{ word: "ring", end: GOLD_T }, { word: "rink", end: RED }].map((row, r) =>
        row.word.split("").map((ch, i) => (
          <Tile key={`${r}${i}`} g={g} ch={ch} colour={i === 3 ? row.end : palette.ink}
            x={x + i * (g.tile + g.gap)} y={y + r * (g.tile + rgap)} fill={i === 3} pale />
        ))
      )}
      <div style={{
        position: "absolute", left: x + 3 * (g.tile + g.gap) - 8, top: y - 8,
        width: g.tile + 16, height: g.tile * 2 + rgap + 16,
        border: `6px dashed ${ink === "#FFFFFF" ? "rgba(255,255,255,0.85)" : palette.inkSoft}`,
        borderRadius: g.tile * 0.26,
      }} />
      <div style={{
        position: "absolute", left: x, top: y + g.tile * 2 + rgap + 16, width: w, textAlign: "center",
        fontSize: g.label * (g.portrait ? 2.0 : 1.7), fontWeight: 800, color: ink, letterSpacing: 0.6,
        textShadow: ink === "#FFFFFF" ? "0 3px 12px rgba(0,0,0,0.6)" : "0 6px 18px rgba(30,36,56,0.30)",
      }}>ng or nk ?</div>
    </Shell>
  );
};

// ── PART 3 · x makes two sounds, and w changes the a ────────────────────────
const P3: React.FC<{ g: Geo; ink: string; world: React.ReactNode }> = ({ g, ink, world }) => {
  assertHeadClear(g);
  const r1w = g.tile + g.arrow + g.tile * 2 + g.gap;
  const r2w = g.tile * 2 + g.gap + g.arrow + g.tile;
  const r1x = cx(g) - r1w / 2;
  const r2x = cx(g) - r2w / 2;
  const r1y = g.top;
  const r2y = r1y + g.tile + g.label + (g.portrait ? 60 : 36);
  check(g, "x = two sounds", r1x, r1x + r1w);
  check(g, "w a -> o", r2x, r2x + r2w);
  const ay = (y: number) => y + g.tile / 2 - g.tile * 0.26;
  return (
    <Shell g={g} part={3} ink={ink} world={world}>
      <Tile g={g} ch="x" colour={GOLD_T} x={r1x} y={r1y} fill />
      <Arrow g={g} x={r1x + g.tile} y={ay(r1y)} ink={ink} />
      <Tile g={g} ch="/k/" colour={GOLD_T} x={r1x + g.tile + g.arrow} y={r1y} />
      <Tile g={g} ch="/s/" colour={GOLD_T} x={r1x + g.tile + g.arrow + g.tile + g.gap} y={r1y} />
      <RuleName g={g} x={r1x} w={r1w} y={r1y + g.tile + 8} text="x = 2 SOUNDS" ink={ink} />

      <Tile g={g} ch="w" colour={TEAL} x={r2x} y={r2y} fill />
      <Tile g={g} ch="a" colour={VOWEL} x={r2x + g.tile + g.gap} y={r2y} fill />
      <Arrow g={g} x={r2x + g.tile * 2 + g.gap} y={ay(r2y)} ink={ink} />
      <Tile g={g} ch="o" colour={TEAL} x={r2x + g.tile * 2 + g.gap + g.arrow} y={r2y} fill />
      <RuleName g={g} x={r2x} w={r2w} y={r2y + g.tile + 8} text="w CHANGES a" ink={ink} />
    </Shell>
  );
};

const DARK = palette.ink;
const WHITE = "#FFFFFF";

export const ThumbL5P1: React.FC = () => <P1 g={geo(false)} ink={DARK} world={<SiteWorld bare />} />;
export const ThumbL5P2: React.FC = () => <P2 g={geo(false, 42)} ink={DARK} world={<TowerWorld bare />} />;
export const ThumbL5P3: React.FC = () => <P3 g={geo(false)} ink={WHITE} world={<StageWorld />} />;
export const ThumbL5P1Portrait: React.FC = () => <P1 g={geo(true)} ink={DARK} world={<SiteWorld bare horizonFrac={0.72} />} />;
export const ThumbL5P2Portrait: React.FC = () => <P2 g={geo(true, 56)} ink={DARK} world={<TowerWorld bare />} />;
export const ThumbL5P3Portrait: React.FC = () => <P3 g={geo(true)} ink={WHITE} world={<StageWorld />} />;
