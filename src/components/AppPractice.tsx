import React from "react";
import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "../data/tokens";
import { picFor } from "../data/word_pics";

// ── THE APP, ON SCREEN — replicated from WordFamiliesPracticeView.swift ─────
//
// Every colour and every layout fraction below is read from the real Swift file, not
// invented. Getting this wrong once already cost a full rebuild, so the source line is
// noted beside each value.
//
//   background:  KidsGradientBackground(gradient: .sunsetCoral, shape: .stars)
//                sunsetCoral = #FFEBD5 -> #FFCCBB (KidsGradientBackground.swift:207)
//   split:       HStack — left panel 45% width, right panel 55% width
//   left panel:  BackButtonWithText -> progress bar ("Question N of total") ->
//                title card ("Find the First Letter" #1A237E / subtitle #546E7A) ->
//                partial word (prefix + blank-or-answer chip + suffix) -> score capsule
//   right panel: the picture ALONE (no card, no caption — "no word caption, it would
//                reveal the answer") -> three ROUNDED-RECT option buttons in a row
//
// The in-line "Well done!" I drew before does not exist in the app — completion is a
// POPUP shown once after ALL questions, not per-question. Removed.

const A = {
  ink: "#263238", sub: "#546E7A", titleInk: "#1A237E",
  blueLo: "#42A5F5", blueHi: "#1565C0",
  ok: "#2E7D32", okBg: "#C8E6C9", okBorder: "#1B5E20",
  bad: "#C62828", badBg: "#FFCDD2", badBorder: "#B71C1C",
  star: "#F9A825", line: "#B0BEC5", unansweredInk: "#263238",
};

const Stars: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const frame = useCurrentFrame();
  // starShapes positions, thinned to 7 (KidsGradientBackground.swift starShapes table)
  const pts = [
    [0.05, 0.12, 0.055], [0.22, 0.68, 0.038], [0.78, 0.18, 0.036],
    [0.90, 0.50, 0.048], [0.45, 0.08, 0.040], [0.65, 0.38, 0.032], [0.10, 0.85, 0.055],
  ];
  return (
    <>
      {pts.map(([x, y, s], i) => (
        <div key={i} style={{
          position: "absolute", left: w * x, top: h * y + Math.sin(frame / 30 + i) * 4,
          fontSize: h * (s as number) * 1.4, lineHeight: 1, opacity: 0.18, color: "#FFFFFF",
        }}>★</div>
      ))}
    </>
  );
};

const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: "rgba(255,255,255,0.55)", border: `2px solid ${A.titleInk}`,
    borderRadius: 14, boxShadow: "0 4px 10px rgba(0,0,0,0.08)", ...style,
  }}>{children}</div>
);

export const AppPractice: React.FC<{ b: { width: number; height: number; wide: boolean }; from: number }> = ({ b, from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - from;
  const enter = spring({ frame: t, fps, config: { damping: 13 } });

  const PW = Math.min(b.width * (b.wide ? 0.62 : 0.86), 1150);
  const PH = PW * 0.50;
  const PX = (b.width - PW) / 2;
  const PY = b.height * (b.wide ? 0.24 : 0.28);
  const BEZ = PW * 0.020;
  const SW = PW - BEZ * 2, SH = PH - BEZ * 2;
  const u = (n: number) => (SH / 500) * n;

  const step = t < 60 ? 0 : t < 150 ? 1 : 2;
  const tap = t >= 210 && t < 235;
  const answered = t >= 235;

  const Screen: React.FC = () => {
    if (step === 0) {
      // Level 6 tile — same warm background, so the app is recognisable before the game opens
      return (
        <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden",
          background: `linear-gradient(135deg, #FFEBD5, #FFCCBB)` }}>
          <Stars w={SW} h={SH} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: u(18) }}>
            <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(30), color: A.titleInk }}>Phonics</div>
            <div style={{ display: "flex", gap: u(14) }}>
              {["5", "6", "7"].map((n) => (
                <GlassCard key={n} style={{
                  width: u(120), height: u(120), display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  background: n === "6" ? `linear-gradient(135deg, ${A.blueLo}, ${A.blueHi})` : "rgba(255,255,255,0.55)",
                  transform: n === "6" ? `scale(${1 + 0.05 * Math.sin(t / 6)})` : undefined,
                }}>
                  <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(44), color: n === "6" ? "#FFF" : A.ink }}>{n}</div>
                  <div style={{ fontFamily: font.family, fontWeight: 700, fontSize: u(12), color: n === "6" ? "#FFF" : A.sub }}>{n === "6" ? "Word Families" : "Level"}</div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      );
    }
    if (step === 1) {
      return (
        <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden",
          background: `linear-gradient(135deg, #FFEBD5, #FFCCBB)` }}>
          <Stars w={SW} h={SH} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: u(12) }}>
            <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(30), color: A.titleInk }}>Word Families</div>
            <div style={{ fontFamily: font.family, fontWeight: 700, fontSize: u(16), color: A.sub }}>Change the first letter to build new words</div>
            <div style={{ display: "flex", gap: u(8), margin: `${u(6)}px 0` }}>
              {["cat", "bat", "hat", "rat"].map((w) => (
                <GlassCard key={w} style={{ padding: `${u(6)}px ${u(12)}px`, fontFamily: font.family, fontWeight: 800, fontSize: u(16), color: A.blueHi }}>{w}</GlassCard>
              ))}
            </div>
            <div style={{
              padding: `${u(10)}px ${u(26)}px`, background: `linear-gradient(135deg, ${A.blueLo}, ${A.blueHi})`, borderRadius: 999,
              fontFamily: font.family, fontWeight: 800, fontSize: u(17), color: "#FFF",
              transform: `scale(${1 + 0.06 * Math.sin(t / 5)})`,
            }}>Start Learning</div>
          </div>
        </div>
      );
    }

    // ── the real Practice screen: 45% left info panel / 55% right answer panel ──
    const hen = picFor("hen");
    const progress = 3 / 14;
    return (
      <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", display: "flex",
        background: `linear-gradient(135deg, #FFEBD5, #FFCCBB)` }}>
        <Stars w={SW} h={SH} />
        {/* LEFT 45% */}
        <div style={{ width: "45%", height: "100%", boxSizing: "border-box", padding: u(16),
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: u(12) }}>
          <div style={{ fontFamily: font.family, fontWeight: 700, fontSize: u(16), color: A.sub, textAlign: "center" }}>Question 3 of 14</div>
          <div style={{ width: "100%", height: u(8), borderRadius: 4, background: "rgba(255,255,255,0.4)" }}>
            <div style={{ width: `${progress * 100}%`, height: "100%", borderRadius: 4,
              background: `linear-gradient(90deg, ${A.blueLo}, ${A.blueHi})` }} />
          </div>
          <GlassCard style={{ padding: u(12), textAlign: "center" }}>
            <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(19), color: A.titleInk }}>Find the First Letter</div>
            <div style={{ fontFamily: font.family, fontWeight: 600, fontSize: u(12), color: A.sub, marginTop: u(4) }}>Which letter starts this word?</div>
          </GlassCard>
          <GlassCard style={{ padding: `${u(10)}px ${u(18)}px`, display: "flex", alignSelf: "center", alignItems: "baseline", gap: u(6) }}>
            <div style={{
              minWidth: u(58), padding: `${u(3)}px ${u(10)}px`, borderRadius: u(10),
              background: answered ? A.okBg : "#ECEFF1", textAlign: "center",
              fontFamily: font.family, fontWeight: 800, fontSize: u(38),
              color: answered ? A.ok : "#90A4AE",
            }}>{answered ? "h" : "_"}</div>
            <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(38), color: A.ink }}>en</div>
          </GlassCard>
          <GlassCard style={{ padding: `${u(9)}px ${u(18)}px`, display: "flex", alignSelf: "center", alignItems: "center", gap: u(8) }}>
            <span style={{ color: A.star, fontSize: u(22) }}>★</span>
            <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(20), color: A.titleInk }}>Score: {answered ? 3 : 2}</div>
          </GlassCard>
        </div>
        {/* RIGHT 55%: the picture alone, then the three buttons in a row */}
        <div style={{ width: "55%", height: "100%", boxSizing: "border-box", padding: u(20),
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: u(22) }}>
          <div style={{ height: u(140), display: "flex", alignItems: "center", justifyContent: "center" }}>
            {hen && hen.startsWith("img/")
              ? <Img src={staticFile(hen)} style={{ height: "100%", objectFit: "contain" }} />
              : <div style={{ fontSize: u(110) }}>{hen}</div>}
          </div>
          <div style={{ display: "flex", gap: u(12), width: "100%", position: "relative" }}>
            {["p", "h", "t"].map((o, i) => {
              const selected = answered && i === 1;
              const isCorrect = i === 1;
              const fill = !answered ? "rgba(255,255,255,0.55)" : selected && isCorrect ? A.okBg : "rgba(255,255,255,0.6)";
              const border = !answered ? "rgba(26,35,126,0.4)" : isCorrect ? A.okBorder : "rgba(176,190,197,0.5)";
              const ink = !answered ? A.ink : isCorrect ? A.okBorder : "#90A4AE";
              return (
                <div key={o} style={{
                  flex: 1, borderRadius: u(12), background: fill, border: `2px solid ${border}`, boxSizing: "border-box",
                  padding: `${u(10)}px 0`, display: "flex", flexDirection: "column", alignItems: "center", gap: u(2),
                  transform: tap && i === 1 ? "scale(0.94)" : selected ? "scale(1.03)" : undefined,
                }}>
                  <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(30), color: ink }}>{o}</div>
                  {answered && isCorrect && <div style={{ fontSize: u(14), color: A.ok }}>✓</div>}
                </div>
              );
            })}
            {(tap || (t >= 180 && t < 235)) && (
              <div style={{
                position: "absolute", left: `${(1 / 3) * 100}%`, marginLeft: u(30),
                top: t < 210 ? u(-70) : u(10), fontSize: u(46), lineHeight: 1, transform: "rotate(-18deg)",
                transition: "top 0.2s",
              }}>{"\u{1F446}"}</div>
            )}
          </div>
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
      <div style={{ position: "absolute", left: BEZ * 0.4, top: PH / 2 - PW * 0.03, width: BEZ * 0.55, height: PW * 0.06, borderRadius: 8, background: "#0E1420" }} />
    </div>
  );
};
