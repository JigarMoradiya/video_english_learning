import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "../data/tokens";
import { picFor } from "../data/word_pics";

// ── THE APP, ON SCREEN — landscape device, the real Practice flow ───────────
//
// Plays during "Play Find the First Letter in the English Learning app…". A landscape
// phone (the download section's bezel treatment) walking the app's OWN flow:
//
//   Level 6 tile  →  Word Families intro  →  Find the First Letter, PLAYED:
//   a finger taps `p`, the button goes the app's green, the score ticks up.
//
// Copy and colours are the app's, read from WordFamiliesPracticeView.swift — "Find the
// First Letter", "Which letter starts this word?", "Question 3 of 14", "Score:", blue
// #1565C0, success #2E7D32 on #C8E6C9, star #F9A825, ground #ECEFF1.

const A = {
  blue: "#1565C0", ink: "#263238", sub: "#546E7A", ground: "#ECEFF1",
  ok: "#2E7D32", okBg: "#C8E6C9", star: "#F9A825", card: "#FFFFFF", line: "#B0BEC5",
};

export const AppPractice: React.FC<{ b: { width: number; height: number; wide: boolean }; from: number }> = ({ b, from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - from;
  const enter = spring({ frame: t, fps, config: { damping: 13 } });

  // the phone: landscape, as the app is used
  const PW = Math.min(b.width * (b.wide ? 0.62 : 0.86), 1150);
  const PH = PW * 0.50;
  const PX = (b.width - PW) / 2;
  const PY = b.height * (b.wide ? 0.24 : 0.28);
  const BEZ = PW * 0.020;
  const SW = PW - BEZ * 2, SH = PH - BEZ * 2;

  // the flow: L6 tile (0-60) → intro (60-150) → practice plays (150+)
  const step = t < 60 ? 0 : t < 150 ? 1 : 2;
  const tap = t >= 210 && t < 235;          // the finger presses p
  const answered = t >= 235;
  const u = (n: number) => (SH / 500) * n;

  const Screen: React.FC = () => {
    if (step === 0) {
      return (
        <div style={{ width: "100%", height: "100%", background: A.ground, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: u(18) }}>
          <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(30), color: A.ink }}>Phonics</div>
          <div style={{ display: "flex", gap: u(14) }}>
            {["5", "6", "7"].map((n) => (
              <div key={n} style={{
                width: u(120), height: u(120), borderRadius: u(18),
                background: n === "6" ? A.blue : A.card, border: `3px solid ${n === "6" ? A.blue : A.line}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                boxShadow: n === "6" ? `0 0 0 ${u(6)}px rgba(21,101,192,0.25)` : undefined,
                transform: n === "6" ? `scale(${1 + 0.05 * Math.sin(t / 6)})` : undefined,
              }}>
                <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(44), color: n === "6" ? "#FFF" : A.ink }}>{n}</div>
                <div style={{ fontFamily: font.family, fontWeight: 700, fontSize: u(12), color: n === "6" ? "#FFF" : A.sub }}>{n === "6" ? "Word Families" : "Level"}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (step === 1) {
      return (
        <div style={{ width: "100%", height: "100%", background: A.ground, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: u(12) }}>
          <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(30), color: A.ink }}>Word Families</div>
          <div style={{ fontFamily: font.family, fontWeight: 700, fontSize: u(16), color: A.sub }}>Change the first letter to build new words</div>
          <div style={{ display: "flex", gap: u(8), margin: `${u(6)}px 0` }}>
            {["cat", "bat", "hat", "rat"].map((w) => (
              <div key={w} style={{ padding: `${u(6)}px ${u(12)}px`, background: A.card, border: `2px solid ${A.line}`, borderRadius: u(10), fontFamily: font.family, fontWeight: 800, fontSize: u(16), color: A.blue }}>{w}</div>
            ))}
          </div>
          <div style={{
            padding: `${u(10)}px ${u(26)}px`, background: A.blue, borderRadius: 999,
            fontFamily: font.family, fontWeight: 800, fontSize: u(17), color: "#FFF",
            transform: `scale(${1 + 0.06 * Math.sin(t / 5)})`,
          }}>Start Learning</div>
        </div>
      );
    }
    const hen = picFor("hen");
    return (
      <div style={{ width: "100%", height: "100%", background: A.ground, display: "flex", padding: u(14), boxSizing: "border-box", gap: u(16) }}>
        {/* left: header + picture, as the landscape app lays it out */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: u(8) }}>
          <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(22), color: A.ink }}>Find the First Letter</div>
          <div style={{ fontFamily: font.family, fontWeight: 700, fontSize: u(14), color: A.sub }}>Which letter starts this word?</div>
          <div style={{ width: "72%", height: u(6), background: A.line, borderRadius: 4 }}>
            <div style={{ width: "21%", height: "100%", background: A.blue, borderRadius: 4 }} />
          </div>
          <div style={{ fontFamily: font.family, fontWeight: 700, fontSize: u(12), color: A.sub }}>Question 3 of 14</div>
          <div style={{ width: u(120), height: u(120), background: A.card, borderRadius: u(14), border: `2px solid ${A.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {hen && hen.startsWith("img/")
              ? <Img src={staticFile(hen)} style={{ width: "82%", height: "82%", objectFit: "contain" }} />
              : <div style={{ fontSize: u(84) }}>{hen}</div>}
          </div>
        </div>
        {/* right: the word slot + the three buttons + score */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: u(12) }}>
          <div style={{ display: "flex", alignItems: "center", gap: u(6) }}>
            <div style={{
              width: u(52), height: u(52), borderRadius: u(10),
              background: answered ? A.okBg : A.card, border: `3px solid ${answered ? A.ok : A.line}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: font.family, fontWeight: 800, fontSize: u(30), color: answered ? A.ok : A.sub,
            }}>{answered ? "p" : "_"}</div>
            <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(38), color: A.ink }}>en</div>
          </div>
          <div style={{ display: "flex", gap: u(12), position: "relative" }}>
            {["d", "p", "h"].map((o, i) => (
              <div key={o} style={{
                width: u(58), height: u(58), borderRadius: u(12),
                background: answered && i === 1 ? A.ok : A.card,
                border: `3px solid ${answered && i === 1 ? A.ok : A.blue}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: font.family, fontWeight: 800, fontSize: u(30),
                color: answered && i === 1 ? "#FFF" : A.blue,
                transform: tap && i === 1 ? "scale(0.88)" : undefined,
              }}>{o}</div>
            ))}
            {/* the finger */}
            {(tap || (t >= 180 && t < 235)) && (
              <div style={{
                position: "absolute", left: u(58) + u(12) + u(14),
                top: interpolate(Math.min(t, 234), [180, 210], [u(96), u(30)], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                fontSize: u(52), lineHeight: 1, transform: "rotate(-18deg)",
              }}>{"\u{1F446}"}</div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: u(6), fontFamily: font.family, fontWeight: 800, fontSize: u(18), color: A.ink }}>
            <span style={{ color: A.star }}>★</span> Score: {answered ? 3 : 2}
          </div>
          {answered && (
            <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(18), color: A.ok }}>
              Well done! 🎉
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: "absolute", left: PX, top: PY, width: PW, height: PH, transform: `scale(${enter})` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: PW * 0.045, background: "#1E2438", boxShadow: "0 30px 70px rgba(0,0,0,0.45)" }} />
      <div style={{ position: "absolute", left: BEZ, top: BEZ, width: SW, height: SH, borderRadius: PW * 0.032, overflow: "hidden" }}>
        <Screen />
      </div>
      {/* landscape notch */}
      <div style={{ position: "absolute", left: BEZ * 0.4, top: PH / 2 - PW * 0.03, width: BEZ * 0.55, height: PW * 0.06, borderRadius: 8, background: "#0E1420" }} />
    </div>
  );
};
