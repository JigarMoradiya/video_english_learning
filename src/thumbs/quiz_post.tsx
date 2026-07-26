import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { font } from "../data/tokens";

// ── YouTube Community poll image — "which letter says …?" (1080×1080) ─────────
//   npx remotion still post-quiz-q out/post_quiz_q.png
//
// The IMAGE carries the SOUND (a big speech bubble), and the poll's own options carry the
// LETTERS — so the answer isn't given away on the picture. Square because community posts
// crop to roughly 1:1 in the feed.
// Bright aqua so it stands apart from the video thumbnails (indigo) and the reels (pink).
const GOLD = "#FFC24A";
const DEEP = "#0B4A57";
const AQUA = "linear-gradient(150deg, #0B6E7F 0%, #1AA0B8 52%, #3ECAD8 100%)";

const Stars: React.FC<{ seed?: number; n?: number }> = ({ seed = 1, n = 16 }) => {
  const rnd = (k: number) => { const x = Math.sin(k * 91.7 + seed * 47.3) * 43758.5453; return x - Math.floor(x); };
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const r = 7 + rnd(i) * 14;
        const pts = Array.from({ length: 10 }).map((_, j) => {
          const a = (Math.PI / 5) * j - Math.PI / 2;
          const rr = j % 2 === 0 ? r : r * 0.44;
          return `${r + rr * Math.cos(a)},${r + rr * Math.sin(a)}`;
        }).join(" ");
        return <svg key={i} width={r * 2} height={r * 2} style={{ position: "absolute", left: rnd(i + 30) * 1040, top: rnd(i + 60) * 1040, opacity: 0.14 + rnd(i + 90) * 0.14 }}><polygon points={pts} fill="#fff" /></svg>;
      })}
    </>
  );
};

// the sound to identify, in a big speech bubble with sound waves coming out of it
const SoundBubble: React.FC<{ sound: string }> = ({ sound }) => (
  <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ background: "#fff", borderRadius: 60, padding: "26px 84px", boxShadow: "0 20px 44px rgba(0,0,0,0.28)" }}>
      <span style={{ fontSize: 200, fontWeight: 800, color: "#0E7490", lineHeight: 1.05 }}>“{sound}”</span>
    </div>
    <svg width={96} height={72} style={{ marginTop: -6 }}><polygon points="14,0 96,0 40,70" fill="#fff" /></svg>
  </div>
);

export const PostQuizQ: React.FC = () => (
  <AbsoluteFill style={{ background: AQUA, fontFamily: font.family, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: -180, top: -220, width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,194,74,0.20) 0%, rgba(255,194,74,0) 70%)" }} />
    <Stars seed={5} />

    {/* quiz badge */}
    <div style={{ position: "absolute", top: 30, left: 30, transform: "rotate(-9deg)", background: GOLD, color: DEEP, borderRadius: 24, padding: "12px 30px", fontSize: 46, fontWeight: 800, boxShadow: "0 10px 26px rgba(0,0,0,0.28)" }}>
      QUIZ TIME!
    </div>
    {/* small brand logo, corner */}
    <Img src={staticFile("logo.png")} style={{ position: "absolute", top: 26, right: 26, width: 108, height: "auto" }} />

    {/* the question — the ANSWER letters live in the poll options, not here */}
    <div style={{ position: "absolute", top: 186, left: 0, width: 1080, textAlign: "center" }}>
      <div style={{ fontSize: 62, fontWeight: 800, color: "#fff", letterSpacing: 1, textShadow: "0 8px 20px rgba(0,0,0,0.34)" }}>WHICH LETTER SAYS…</div>
    </div>

    {/* the sound */}
    <div style={{ position: "absolute", top: 300, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
      <SoundBubble sound="kwuh" />
    </div>

    {/* bottom row: mascot · listening ear · prompt — three separated blocks, no collisions */}
    <Img src={staticFile("mascot.png")} style={{ position: "absolute", left: 26, bottom: 14, width: 336, height: "auto", filter: "drop-shadow(0 16px 30px rgba(0,0,0,0.4))" }} />

    {/* wider viewBox so the incoming sound waves aren't clipped */}
    <svg width={186} height={155} viewBox="0 0 120 100" style={{ position: "absolute", left: 384, bottom: 296 }}>
      <circle cx={76} cy={50} r={40} fill="#fff" />
      <path d="M84 26 a16 16 0 0 0 -30 9 c0 7 3 9 3 14 c0 5 -2 6 -2 11 a9 9 0 0 0 18 1 c1 -6 6 -8 9 -14 c3 -6 5 -12 2 -21 z" fill="#0E7490" />
      <path d="M68 40 a7 7 0 0 1 12 4 c0 4 -4 5 -5 9" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
      {[0, 1, 2].map((k) => <path key={k} d={`M${34 - k * 9} ${34 - k * 4} a${17 + k * 8} ${17 + k * 8} 0 0 1 0 ${(17 + k * 8) * 1.7}`} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.92 - k * 0.24} />)}
    </svg>

    <div style={{ position: "absolute", right: 48, bottom: 210, textAlign: "right" }}>
      <div style={{ fontSize: 74, fontWeight: 800, color: "#fff", lineHeight: 1.08, textShadow: "0 8px 22px rgba(0,0,0,0.36)" }}>Listen &amp; tap<br />your answer 👇</div>
    </div>
    <div style={{ position: "absolute", right: 48, bottom: 122, display: "inline-block", background: "rgba(255,255,255,0.24)", borderRadius: 26, padding: "10px 28px", fontSize: 38, fontWeight: 800, color: "#fff" }}>
      Ages 3–8 · Phonics
    </div>
  </AbsoluteFill>
);
