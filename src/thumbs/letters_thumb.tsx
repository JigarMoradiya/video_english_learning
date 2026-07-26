import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { font } from "../data/tokens";

// ── Thumbnails for letters_phonics.mp4 (A→Z Letter Sounds, 16:9) — 1280×720 ───
// Three variants of the SAME thumbnail; pick one:
//   npx remotion still thumb-phonics-a out/thumb_phonics_a.png
//
// Ground is deep INDIGO because that video's own on-screen title is #5B6CF0 — it keeps the
// thumbnail inside that video's identity and clearly apart from the PINK 9:16 Letter parts.
// Dark and saturated so it pops against YouTube's white feed (the video is light pastel,
// which would vanish there).
// Layout rules: nothing overlaps, nothing is clipped, no dead corners, and ≤3 words of
// headline at a very large size — the feed renders this about 320px wide.
const GOLD = "#FFC24A";
const INK = "#141C4A";
const AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const BG = "linear-gradient(145deg, #141C4A 0%, #2B3A9E 52%, #4657D6 100%)";

// the video's own phonics sound tokens (from src/data/letters.ts), so the thumbnail teaches
// exactly what the video says
const SOUND: Record<string, string> = { a: "aaa", b: "buh", c: "kuh", d: "duh", e: "eh", f: "fuh", g: "guh" };

const Ground: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = BG }) => (
  <AbsoluteFill style={{ background: bg, fontFamily: font.family, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: -160, top: -240, width: 1020, height: 1020, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,194,74,0.20) 0%, rgba(255,194,74,0) 70%)" }} />
    {children}
  </AbsoluteFill>
);

const Sparkles: React.FC<{ seed?: number; n?: number }> = ({ seed = 1, n = 12 }) => {
  const rnd = (k: number) => { const x = Math.sin(k * 91.7 + seed * 47.3) * 43758.5453; return x - Math.floor(x); };
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const r = 6 + rnd(i) * 10;
        const pts = Array.from({ length: 10 }).map((_, j) => {
          const a = (Math.PI / 5) * j - Math.PI / 2;
          const rr = j % 2 === 0 ? r : r * 0.44;
          return `${r + rr * Math.cos(a)},${r + rr * Math.sin(a)}`;
        }).join(" ");
        return <svg key={i} width={r * 2} height={r * 2} style={{ position: "absolute", left: rnd(i + 30) * 1240, top: rnd(i + 60) * 520, opacity: 0.13 + rnd(i + 90) * 0.12 }}><polygon points={pts} fill="#fff" /></svg>;
      })}
    </>
  );
};

const Badge: React.FC = () => (
  <div style={{ position: "absolute", top: 24, left: 24, transform: "rotate(-11deg)", background: GOLD, color: INK, borderRadius: 22, padding: "9px 22px", fontSize: 38, fontWeight: 800, boxShadow: "0 10px 26px rgba(0,0,0,0.34)", lineHeight: 1.1, textAlign: "center" }}>
    ALL 26<br /><span style={{ fontSize: 26 }}>SOUNDS</span>
  </div>
);

const Logo: React.FC = () => (
  <Img src={staticFile("logo.png")} style={{ position: "absolute", right: 24, top: 20, width: 100, height: "auto" }} />
);

// picture + word + that letter's phonics SOUND — the pairing the video teaches
const WordCardNamed: React.FC<{ w: string; size?: number; nameSize?: number }> = ({ w, size = 132, nameSize = 32 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
    <div style={{ width: size, height: size, background: "#fff", borderRadius: 24, boxShadow: "0 10px 24px rgba(0,0,0,0.28)", display: "flex", alignItems: "center", justifyContent: "center", padding: 10 }}>
      <Img src={staticFile(`letters/${w}.png`)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
    </div>
    <span style={{ fontSize: nameSize, fontWeight: 800, color: "#fff", lineHeight: 1, textShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>{w[0].toUpperCase() + w.slice(1)}</span>
    <span style={{ fontSize: nameSize - 2, fontWeight: 800, color: GOLD, lineHeight: 1, textShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>“{SOUND[w[0]]}”</span>
  </div>
);

// two compact rows of all 26 letters (13 + 13)
const LetterRows: React.FC<{ cell?: number }> = ({ cell = 32 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {[AZ.slice(0, 13), AZ.slice(13)].map((row, r) => (
      <div key={r} style={{ display: "flex", gap: 5 }}>
        {row.map((ch) => {
          const v = "AEIOU".includes(ch);
          return <span key={ch} style={{ width: cell, height: cell + 4, borderRadius: 8, background: v ? "#FF8A2B" : "rgba(255,255,255,0.94)", color: v ? "#fff" : INK, fontSize: cell * 0.62, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{ch}</span>;
        })}
      </div>
    ))}
  </div>
);

// ── A · giant Aa, named+sounded word cards, the 26 letters in two rows below ───
export const ThumbPhonicsA: React.FC = () => (
  <Ground>
    <Sparkles seed={3} />
    <Img src={staticFile("mascot.png")} style={{ position: "absolute", left: 8, bottom: 14, width: 394, height: "auto", filter: "drop-shadow(0 16px 30px rgba(0,0,0,0.44))" }} />
    {/* the column distributes its own rows, so there is no gap left to patch by hand */}
    <div style={{ position: "absolute", left: 410, top: 40, width: 848, height: 650, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ fontSize: 72, fontWeight: 800, color: "#fff", lineHeight: 1, textShadow: "0 8px 22px rgba(0,0,0,0.44)" }}>LETTER SOUNDS</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 22 }}>
        <span style={{ fontSize: 168, fontWeight: 800, color: GOLD, lineHeight: 0.95, textShadow: "0 14px 30px rgba(0,0,0,0.44)" }}>Aa</span>
        <span style={{ fontSize: 88, fontWeight: 800, color: "#fff", letterSpacing: 6, paddingBottom: 18, textShadow: "0 10px 24px rgba(0,0,0,0.42)" }}>A–Z</span>
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        {["ant", "ball", "cat", "drum"].map((w) => <WordCardNamed key={w} w={w} size={124} nameSize={30} />)}
      </div>
      {/* the 26 letters sit here, under the images — not pinned along the frame edge */}
      <LetterRows cell={32} />
    </div>
    <Badge />
    <Logo />
  </Ground>
);

// ── B · mascot says the sound; a tight row of named+sounded cards below ────────
export const ThumbPhonicsB: React.FC = () => (
  <Ground bg="linear-gradient(145deg, #10214F 0%, #1E4FA8 52%, #2F86D6 100%)">
    <Sparkles seed={8} />
    {/* the whole group sits to the RIGHT of the ALL-26 badge — the mascot's ear used to run
        underneath it — and high enough to clear the card row below */}
    <Img src={staticFile("mascot.png")} style={{ position: "absolute", left: 238, bottom: 252, width: 318, height: "auto", filter: "drop-shadow(0 16px 30px rgba(0,0,0,0.46))" }} />
    <div style={{ position: "absolute", left: 566, top: 22, background: "#fff", borderRadius: 38, padding: "10px 38px", boxShadow: "0 14px 32px rgba(0,0,0,0.36)" }}>
      <span style={{ fontSize: 78, fontWeight: 800, color: "#2B3A9E", lineHeight: 1.05 }}>“aaa!”</span>
    </div>
    <svg width={72} height={58} style={{ position: "absolute", left: 502, top: 118 }}><polygon points="70,0 0,56 66,24" fill="#fff" /></svg>
    {/* PHONICS + the gold bar are one block — the bar matches the headline width exactly */}
    <div style={{ position: "absolute", left: 636, top: 186, display: "inline-flex", flexDirection: "column", alignItems: "stretch" }}>
      <div style={{ fontSize: 88, fontWeight: 800, color: "#fff", lineHeight: 1.02, letterSpacing: 4, textAlign: "center", textShadow: "0 8px 22px rgba(0,0,0,0.44)" }}>PHONICS</div>
      <div style={{ marginTop: 10, background: GOLD, color: INK, borderRadius: 24, padding: "8px 0", fontSize: 74, fontWeight: 800, letterSpacing: 10, textAlign: "center", boxShadow: "0 12px 26px rgba(0,0,0,0.32)" }}>A – Z</div>
    </div>
    {/* seven cards, evenly and TIGHTLY spaced (space-between left huge holes between them) */}
    <div style={{ position: "absolute", left: 0, bottom: 14, width: 1280, display: "flex", justifyContent: "center", gap: 13 }}>
      {["ant", "ball", "cat", "drum", "elephant", "fish", "goat"].map((w) => <WordCardNamed key={w} w={w} size={138} nameSize={28} />)}
    </div>
    <Badge />
    <Logo />
  </Ground>
);

// ── C · three letter→sound cards (rebuilt — the alphabet wall never read cleanly) ──
export const ThumbPhonicsC: React.FC = () => (
  <Ground bg="linear-gradient(145deg, #1A1250 0%, #3A2AA0 52%, #5B49D6 100%)">
    <Sparkles seed={12} />
    <div style={{ position: "absolute", left: 0, top: 32, width: 1280, textAlign: "center" }}>
      <div style={{ fontSize: 80, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: 2, textShadow: "0 8px 22px rgba(0,0,0,0.46)" }}>LETTER SOUNDS</div>
    </div>
    {/* letter → sound stated three times: the clearest possible read of what's inside */}
    <div style={{ position: "absolute", left: 0, top: 164, width: 1280, display: "flex", justifyContent: "center", gap: 30 }}>
      {[["Aa", "aaa"], ["Bb", "buh"], ["Cc", "kuh"]].map(([pair, snd]) => (
        <div key={pair} style={{ width: 264, background: "#fff", borderRadius: 34, padding: "16px 0 20px", boxShadow: "0 16px 34px rgba(0,0,0,0.34)", textAlign: "center" }}>
          <div style={{ fontSize: 126, fontWeight: 800, color: INK, lineHeight: 1 }}>{pair}</div>
          <div style={{ marginTop: 10, display: "inline-block", background: GOLD, color: INK, borderRadius: 18, padding: "6px 26px", fontSize: 46, fontWeight: 800 }}>“{snd}”</div>
        </div>
      ))}
    </div>
    <Img src={staticFile("mascot.png")} style={{ position: "absolute", left: 26, bottom: 8, width: 274, height: "auto", filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.46))" }} />
    {/* the next few letters, carrying the eye from the mascot across to "+ 23 MORE" */}
    <div style={{ position: "absolute", left: 316, bottom: 92, display: "flex", alignItems: "center", gap: 14 }}>
      {["Dd", "Ee", "Ff", "Gg"].map((pair) => (
        <span key={pair} style={{ width: 96, height: 96, borderRadius: 22, background: "rgba(255,255,255,0.9)", color: INK, fontSize: 46, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 18px rgba(0,0,0,0.26)" }}>{pair}</span>
      ))}
      <span style={{ fontSize: 58, fontWeight: 800, color: "rgba(255,255,255,0.85)", letterSpacing: 4 }}>…</span>
    </div>
    <div style={{ position: "absolute", right: 44, bottom: 88, textAlign: "right" }}>
      <div style={{ fontSize: 76, fontWeight: 800, color: GOLD, lineHeight: 1, textShadow: "0 10px 26px rgba(0,0,0,0.44)" }}>+ 23 MORE</div>
      <div style={{ fontSize: 46, fontWeight: 800, color: "#fff", letterSpacing: 6, marginTop: 4 }}>A – Z</div>
    </div>
    <Badge />
    <Logo />
  </Ground>
);
