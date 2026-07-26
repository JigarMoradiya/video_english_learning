import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { font } from "../data/tokens";

// ── YouTube / Facebook thumbnails for the A→Z Letter Sounds video (1280×720) ──
// Rendered from the same assets as the video, so the branding matches exactly:
//   npx remotion still thumb-letters-a out/thumb_letters_a.png
// Design rules that drive click-through on kids content, and why:
//  · dark saturated ground → pops against YouTube's white feed (a light frame disappears)
//  · the mascot big and cheerful → a face/character is the strongest hook for parents
//  · ≤3 words, enormous → the feed renders this ~320px wide, so anything small is mush
//  · "A–Z" + "26" stated explicitly → shows the video covers the whole alphabet, not one letter
const GOLD = "#FFC24A";
const AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const Ground: React.FC<{ children: React.ReactNode; bg: string }> = ({ children, bg }) => (
  <AbsoluteFill style={{ background: bg, fontFamily: font.family, overflow: "hidden" }}>
    {/* soft warm glow so the centre feels lit, not flat */}
    <div style={{ position: "absolute", left: -180, top: -220, width: 1000, height: 1000, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,194,74,0.20) 0%, rgba(255,194,74,0) 70%)" }} />
    {children}
  </AbsoluteFill>
);

// little confetti-ish sparkles (deterministic, decorative only)
const Sparkles: React.FC<{ seed?: number }> = ({ seed = 1 }) => {
  const rnd = (n: number) => { const x = Math.sin(n * 91.7 + seed * 47.3) * 43758.5453; return x - Math.floor(x); };
  return (
    <>
      {Array.from({ length: 16 }).map((_, i) => {
        const r = 6 + rnd(i) * 12;
        const pts = Array.from({ length: 10 }).map((_, j) => {
          const a = (Math.PI / 5) * j - Math.PI / 2;
          const rr = j % 2 === 0 ? r : r * 0.44;
          return `${r + rr * Math.cos(a)},${r + rr * Math.sin(a)}`;
        }).join(" ");
        return (
          <svg key={i} width={r * 2} height={r * 2} style={{ position: "absolute", left: rnd(i + 30) * 1280, top: rnd(i + 60) * 720, opacity: 0.16 + rnd(i + 90) * 0.16 }}>
            <polygon points={pts} fill="#fff" />
          </svg>
        );
      })}
    </>
  );
};

const Badge: React.FC<{ top: number; left: number }> = ({ top, left }) => (
  <div style={{ position: "absolute", top, left, transform: "rotate(-11deg)", background: GOLD, color: "#6E2038", borderRadius: 22, padding: "10px 24px", fontSize: 40, fontWeight: 800, boxShadow: "0 10px 26px rgba(0,0,0,0.3)", lineHeight: 1.1, textAlign: "center" }}>
    ALL 26<br /><span style={{ fontSize: 28 }}>SOUNDS</span>
  </div>
);

const Logo: React.FC<{ size?: number }> = ({ size = 104 }) => (
  <Img src={staticFile("logo.png")} style={{ position: "absolute", right: 26, bottom: 22, width: size, height: "auto", opacity: 0.96 }} />
);

// ── A · mascot + giant Aa + alphabet strip ───────────────────────────────────
export const ThumbLettersA: React.FC = () => (
  <Ground bg="linear-gradient(145deg, #4A1430 0%, #8E2A59 55%, #B03A71 100%)">
    <Sparkles seed={3} />
    {/* mascot, left, big */}
    <Img src={staticFile("mascot.png")} style={{ position: "absolute", left: 22, bottom: 10, width: 440, height: "auto", filter: "drop-shadow(0 18px 34px rgba(0,0,0,0.4))" }} />
    {/* headline + giant letter pair, right */}
    <div style={{ position: "absolute", left: 470, top: 74, width: 780 }}>
      <div style={{ fontSize: 74, fontWeight: 800, color: "#fff", letterSpacing: 1, lineHeight: 1, textShadow: "0 8px 22px rgba(0,0,0,0.42)" }}>LETTER SOUNDS</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 26, marginTop: 4 }}>
        <span style={{ fontSize: 250, fontWeight: 800, color: GOLD, lineHeight: 0.95, textShadow: "0 14px 32px rgba(0,0,0,0.42)" }}>Aa</span>
        <span style={{ fontSize: 116, fontWeight: 800, color: "#fff", letterSpacing: 6, paddingBottom: 30, textShadow: "0 10px 26px rgba(0,0,0,0.4)" }}>A–Z</span>
      </div>
    </div>
    {/* alphabet strip (two rows of 13) — makes "the whole alphabet" unmistakable, and
        stops well clear of the logo so no letter is ever covered */}
    <div style={{ position: "absolute", left: 492, bottom: 38, display: "flex", flexDirection: "column", gap: 7 }}>
      {[AZ.slice(0, 13), AZ.slice(13)].map((row, r) => (
        <div key={r} style={{ display: "flex", gap: 7 }}>
          {row.map((ch) => {
            const v = "AEIOU".includes(ch);
            return <span key={ch} style={{ width: 36, height: 42, borderRadius: 9, background: v ? "#FF8A2B" : "rgba(255,255,255,0.9)", color: v ? "#fff" : "#7A2A4C", fontSize: 24, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: v ? "0 4px 12px rgba(255,138,43,0.5)" : "none" }}>{ch}</span>;
          })}
        </div>
      ))}
    </div>
    <Badge top={30} left={34} />
    <Logo />
  </Ground>
);

// ── B · mascot speaking the sound, with picture words ────────────────────────
export const ThumbLettersB: React.FC = () => (
  <Ground bg="linear-gradient(145deg, #2E1A5E 0%, #6A3AB0 58%, #9B54C8 100%)">
    <Sparkles seed={8} />
    <Img src={staticFile("mascot.png")} style={{ position: "absolute", left: 8, bottom: 10, width: 420, height: "auto", filter: "drop-shadow(0 18px 34px rgba(0,0,0,0.42))" }} />
    {/* speech bubble — the sound, which is what the video actually teaches */}
    <div style={{ position: "absolute", left: 320, top: 44, background: "#fff", borderRadius: 40, padding: "16px 44px", boxShadow: "0 14px 34px rgba(0,0,0,0.34)" }}>
      <span style={{ fontSize: 96, fontWeight: 800, color: "#B03A71", lineHeight: 1.05 }}>“aaa!”</span>
    </div>
    <svg width={70} height={60} style={{ position: "absolute", left: 340, top: 178 }}><polygon points="60,0 0,58 56,26" fill="#fff" /></svg>
    <div style={{ position: "absolute", right: 44, top: 60, textAlign: "right" }}>
      <div style={{ fontSize: 66, fontWeight: 800, color: "#fff", lineHeight: 1, textShadow: "0 8px 22px rgba(0,0,0,0.42)" }}>PHONICS</div>
      <div style={{ fontSize: 128, fontWeight: 800, color: GOLD, letterSpacing: 4, lineHeight: 1.05, textShadow: "0 12px 30px rgba(0,0,0,0.42)" }}>A – Z</div>
    </div>
    {/* three picture words = concrete proof of what's inside */}
    <div style={{ position: "absolute", right: 156, bottom: 40, display: "flex", gap: 18 }}>
      {["ant", "ball", "cat"].map((w) => (
        <div key={w} style={{ width: 132, height: 132, background: "#fff", borderRadius: 26, boxShadow: "0 12px 28px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
          <Img src={staticFile(`letters/${w}.png`)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        </div>
      ))}
    </div>
    <Badge top={26} left={26} />
    <Logo />
  </Ground>
);

// ── C · alphabet wall behind the mascot ──────────────────────────────────────
export const ThumbLettersC: React.FC = () => (
  <Ground bg="linear-gradient(145deg, #123A5E 0%, #1E6E8E 55%, #2FA0AE 100%)">
    {/* the full A–Z as a backdrop, vowels warm */}
    <div style={{ position: "absolute", inset: 0, display: "flex", flexWrap: "wrap", alignContent: "center", justifyContent: "center", gap: 14, padding: "0 40px", opacity: 0.44 }}>
      {AZ.map((ch) => {
        const v = "AEIOU".includes(ch);
        return <span key={ch} style={{ width: 128, height: 128, borderRadius: 26, background: v ? "#FF8A2B" : "rgba(255,255,255,0.9)", color: v ? "#fff" : "#124A64", fontSize: 74, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{ch}</span>;
      })}
    </div>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,40,60,0.18) 0%, rgba(10,40,60,0.5) 100%)" }} />
    <Sparkles seed={12} />
    <Img src={staticFile("mascot.png")} style={{ position: "absolute", left: 40, bottom: 10, width: 410, height: "auto", filter: "drop-shadow(0 18px 34px rgba(0,0,0,0.46))" }} />
    <div style={{ position: "absolute", left: 440, top: 118, width: 800 }}>
      <div style={{ fontSize: 96, fontWeight: 800, color: "#fff", lineHeight: 1.02, textShadow: "0 10px 26px rgba(0,0,0,0.5)" }}>LETTER<br />SOUNDS</div>
      <div style={{ display: "inline-block", marginTop: 18, background: GOLD, color: "#123A5E", borderRadius: 26, padding: "10px 34px", fontSize: 82, fontWeight: 800, letterSpacing: 4, boxShadow: "0 12px 28px rgba(0,0,0,0.34)" }}>A – Z</div>
    </div>
    <Badge top={28} left={30} />
    <Logo />
  </Ground>
);
