import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { font } from "../data/tokens";

// ── Thumbnails for letters_phonics.mp4 (A→Z Letter Sounds, 16:9) — 1280×720 ───
// Three variants of the SAME thumbnail; pick one:
//   npx remotion still thumb-phonics-a out/thumb_phonics_a.png
//
// Ground is deep INDIGO because that video's own on-screen title is #5B6CF0 — it keeps the
// thumbnail inside that video's identity and clearly apart from the PINK 9:16 Letter parts.
// Dark and saturated so it still pops against YouTube's white feed (the video itself is
// light pastel, which would vanish there).
// Layout rules: fill the frame edge to edge (a letter band or a full row of word cards along
// the bottom) so there are no dead corners; ≤3 words at a very large size, because the feed
// renders this about 320px wide; the mascot always sits fully inside the frame.
const GOLD = "#FFC24A";
const INK = "#141C4A";
const AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const BG = "linear-gradient(145deg, #141C4A 0%, #2B3A9E 52%, #4657D6 100%)";

const Ground: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = BG }) => (
  <AbsoluteFill style={{ background: bg, fontFamily: font.family, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: -160, top: -240, width: 1020, height: 1020, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,194,74,0.20) 0%, rgba(255,194,74,0) 70%)" }} />
    {children}
  </AbsoluteFill>
);

const Sparkles: React.FC<{ seed?: number; n?: number }> = ({ seed = 1, n = 14 }) => {
  const rnd = (k: number) => { const x = Math.sin(k * 91.7 + seed * 47.3) * 43758.5453; return x - Math.floor(x); };
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const r = 6 + rnd(i) * 11;
        const pts = Array.from({ length: 10 }).map((_, j) => {
          const a = (Math.PI / 5) * j - Math.PI / 2;
          const rr = j % 2 === 0 ? r : r * 0.44;
          return `${r + rr * Math.cos(a)},${r + rr * Math.sin(a)}`;
        }).join(" ");
        return <svg key={i} width={r * 2} height={r * 2} style={{ position: "absolute", left: rnd(i + 30) * 1240, top: rnd(i + 60) * 540, opacity: 0.14 + rnd(i + 90) * 0.14 }}><polygon points={pts} fill="#fff" /></svg>;
      })}
    </>
  );
};

const Badge: React.FC<{ top?: number; left?: number }> = ({ top = 24, left = 24 }) => (
  <div style={{ position: "absolute", top, left, transform: "rotate(-11deg)", background: GOLD, color: INK, borderRadius: 22, padding: "9px 22px", fontSize: 38, fontWeight: 800, boxShadow: "0 10px 26px rgba(0,0,0,0.34)", lineHeight: 1.1, textAlign: "center" }}>
    ALL 26<br /><span style={{ fontSize: 26 }}>SOUNDS</span>
  </div>
);

const Logo: React.FC<{ right?: number; top?: number }> = ({ right = 24, top = 20 }) => (
  <Img src={staticFile("logo.png")} style={{ position: "absolute", right, top, width: 100, height: "auto" }} />
);

// full-width band of all 26 letters — anchors the bottom edge so no corner is left empty
const LetterBand: React.FC = () => {
  const pad = 150, gap = 4; // narrower + smaller: a quiet strip, not a second headline
  const cell = (1280 - pad * 2 - gap * 25) / 26; // ≈ 34
  return (
    <div style={{ position: "absolute", left: pad, bottom: 16, display: "flex", gap }}>
      {AZ.map((ch) => {
        const v = "AEIOU".includes(ch);
        return <span key={ch} style={{ width: cell, height: 40, borderRadius: 9, background: v ? "#FF8A2B" : "rgba(255,255,255,0.94)", color: v ? "#fff" : INK, fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: v ? "0 5px 14px rgba(255,138,43,0.55)" : "0 4px 10px rgba(0,0,0,0.2)" }}>{ch}</span>;
      })}
    </div>
  );
};

const WordCard: React.FC<{ w: string; size?: number }> = ({ w, size = 122 }) => (
  <div style={{ width: size, height: size, background: "#fff", borderRadius: 24, boxShadow: "0 10px 24px rgba(0,0,0,0.28)", display: "flex", alignItems: "center", justifyContent: "center", padding: 10 }}>
    <Img src={staticFile(`letters/${w}.png`)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
  </div>
);

// picture + its word, first letter in gold — names the image AND ties it to that letter's sound
const WordCardNamed: React.FC<{ w: string; size?: number; label?: number }> = ({ w, size = 150, label = 38 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
    <WordCard w={w} size={size} />
    <span style={{ fontSize: label, fontWeight: 800, lineHeight: 1, textShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
      <span style={{ color: GOLD }}>{w[0].toUpperCase()}</span>
      <span style={{ color: "#fff" }}>{w.slice(1)}</span>
    </span>
  </div>
);

// ── A · giant Aa + word cards, with the full letter band along the bottom ─────
export const ThumbPhonicsA: React.FC = () => (
  <Ground>
    <Sparkles seed={3} />
    <Img src={staticFile("mascot.png")} style={{ position: "absolute", left: 10, bottom: 84, width: 400, height: "auto", filter: "drop-shadow(0 16px 30px rgba(0,0,0,0.44))" }} />
    {/* right column is CENTRED in the space beside the mascot, so no edge is left empty */}
    <div style={{ position: "absolute", left: 412, top: 74, width: 844, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ fontSize: 76, fontWeight: 800, color: "#fff", lineHeight: 1, textShadow: "0 8px 22px rgba(0,0,0,0.44)" }}>LETTER SOUNDS</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 24 }}>
        <span style={{ fontSize: 200, fontWeight: 800, color: GOLD, lineHeight: 0.95, textShadow: "0 14px 30px rgba(0,0,0,0.44)" }}>Aa</span>
        <span style={{ fontSize: 100, fontWeight: 800, color: "#fff", letterSpacing: 6, paddingBottom: 22, textShadow: "0 10px 24px rgba(0,0,0,0.42)" }}>A–Z</span>
      </div>
      {/* five picture words span the column, filling what used to be dead space */}
      <div style={{ display: "flex", gap: 22, marginTop: 2 }}>
        {["ant", "ball", "cat", "drum"].map((w) => <WordCardNamed key={w} w={w} size={140} label={38} />)}
      </div>
    </div>
    <Badge />
    <Logo />
    <LetterBand />
  </Ground>
);

// ── B · mascot says the sound; a full row of picture words fills the bottom ───
export const ThumbPhonicsB: React.FC = () => (
  <Ground bg="linear-gradient(145deg, #10214F 0%, #1E4FA8 52%, #2F86D6 100%)">
    <Sparkles seed={8} />
    <Img src={staticFile("mascot.png")} style={{ position: "absolute", left: 2, bottom: 176, width: 372, height: "auto", filter: "drop-shadow(0 16px 30px rgba(0,0,0,0.46))" }} />
    {/* the sound itself — this is what the video actually teaches */}
    <div style={{ position: "absolute", left: 286, top: 34, background: "#fff", borderRadius: 40, padding: "12px 42px", boxShadow: "0 14px 32px rgba(0,0,0,0.36)" }}>
      <span style={{ fontSize: 88, fontWeight: 800, color: "#2B3A9E", lineHeight: 1.05 }}>“aaa!”</span>
    </div>
    <svg width={68} height={56} style={{ position: "absolute", left: 304, top: 152 }}><polygon points="60,0 0,54 56,22" fill="#fff" /></svg>
    {/* headline sits in what used to be the empty centre-right */}
    {/* one solid block: the gold bar is exactly as wide as PHONICS, so there is no
        left/right gap between the two lines */}
    <div style={{ position: "absolute", left: 430, top: 176, display: "inline-flex", flexDirection: "column", alignItems: "stretch" }}>
      <div style={{ fontSize: 112, fontWeight: 800, color: "#fff", lineHeight: 1.02, letterSpacing: 4, textAlign: "center", textShadow: "0 8px 22px rgba(0,0,0,0.44)" }}>PHONICS</div>
      <div style={{ marginTop: 12, background: GOLD, color: INK, borderRadius: 26, padding: "10px 0", fontSize: 92, fontWeight: 800, letterSpacing: 10, textAlign: "center", boxShadow: "0 12px 26px rgba(0,0,0,0.32)" }}>A – Z</div>
    </div>
    {/* seven picture words span the FULL width — both bottom corners are filled */}
    <div style={{ position: "absolute", left: 24, bottom: 18, width: 1232, display: "flex", justifyContent: "space-between" }}>
      {["ant", "ball", "cat", "drum", "elephant", "fish"].map((w) => <WordCardNamed key={w} w={w} size={144} label={34} />)}
    </div>
    <Badge />
    <Logo />
  </Ground>
);

// ── C · alphabet wall filling the whole frame, headline on a solid panel ──────
export const ThumbPhonicsC: React.FC = () => {
  const cols = 7, rows = 4, gap = 10, pad = 8;
  // size from the SHORTER axis so 4 rows fit inside 720 — sizing by width overflowed and
  // cut the bottom row off
  const cell = (720 - pad * 2 - (rows - 1) * gap) / rows; // = 168
  return (
    <Ground bg="linear-gradient(145deg, #141C4A 0%, #2B3A9E 100%)">
      {/* the wall runs edge to edge, so the frame is never empty */}
      <div style={{ position: "absolute", inset: 0, padding: pad, display: "flex", flexWrap: "wrap", gap, alignContent: "center", justifyContent: "center", opacity: 0.42 }}>
        {/* 26 letters + 2 star tiles = a complete 7×4 grid, so no corner is left dark */}
        {[...AZ, "★", "★"].map((ch, i) => {
          const v = "AEIOU".includes(ch);
          const star = ch === "★";
          return <span key={i} style={{ width: cell, height: cell, borderRadius: 26, background: star ? GOLD : v ? "#FF8A2B" : "rgba(255,255,255,0.9)", color: star ? "#fff" : v ? "#fff" : INK, fontSize: star ? 78 : 94, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{ch}</span>;
        })}
      </div>
      {/* light scrim keeps the wall bright; the solid panel below carries legibility */}
      <AbsoluteFill style={{ background: "linear-gradient(115deg, rgba(20,28,74,0.18) 0%, rgba(20,28,74,0.10) 52%, rgba(20,28,74,0.16) 100%)" }} />
      <Sparkles seed={12} n={9} />
      <Img src={staticFile("mascot.png")} style={{ position: "absolute", left: 16, bottom: 10, width: 386, height: "auto", filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.52))" }} />
      {/* solid panel → the headline is readable whatever tile happens to be behind it */}
      <div style={{ position: "absolute", right: 40, top: 138, background: "rgba(20,28,74,0.93)", borderRadius: 40, padding: "28px 44px", boxShadow: "0 18px 40px rgba(0,0,0,0.46)", textAlign: "center" }}>
        <div style={{ fontSize: 90, fontWeight: 800, color: "#fff", lineHeight: 1.02 }}>LETTER<br />SOUNDS</div>
        <div style={{ display: "inline-block", marginTop: 16, background: GOLD, color: INK, borderRadius: 24, padding: "8px 36px", fontSize: 76, fontWeight: 800, letterSpacing: 6 }}>A – Z</div>
        {/* logo lives inside the panel — on the tile wall it was unreadable */}
        <Img src={staticFile("logo.png")} style={{ display: "block", margin: "18px auto 0", width: 118, height: "auto" }} />
      </div>
      <Badge />
    </Ground>
  );
};
