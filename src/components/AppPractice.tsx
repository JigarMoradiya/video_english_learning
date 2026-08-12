import React from "react";
import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "../data/tokens";
import { picFor } from "../data/word_pics";

// ── THE APP, ON SCREEN — replicated from the real Swift source ──────────────
//
// Three real screens, read line-by-line from source:
//   1. PhonicsReadingLevelsView.swift — the JOURNEY MAP. mintLime/musicNotes background.
//      Left: teddy + progress ring + "Continue Journey". Right: a winding road of circular
//      level badges linked to billboard cards. Level 6 sits in "Word Patterns" (pink).
//      Video-composition choice: show it as a real multi-stop road — levels 4·5 above,
//      6 centred and highlighted, 7·8 below, the rest dim and card-less.
//   2. WordFamiliesIntroView.swift — meadowGreen/leaves. Left: 13 coloured rime tiles +
//      4 bullets + a c+-at=cat equation card. Right: PhonicsIntroRightPanel — mascot,
//      "Ready to explore?", Start Learning / Practice / Listen buttons in a glass card.
//   3. WordFamiliesPracticeView.swift — sunsetCoral/stars, 45/55 split, BackButtonWithText
//      header ("Word Families").
//
// kidsGlassCard (ViewExtensions.swift): white 85%-opacity fill, a soft shadow tinted by
// the stroke colour, and a thin (1.2pt) stroke at 30% of that colour — not an opaque card.

const A = {
  ink: "#263238", sub: "#546E7A", titleInk: "#1A237E",
  blueLo: "#42A5F5", blueHi: "#1565C0",
  ok: "#2E7D32", okBg: "#C8E6C9", okBorder: "#1B5E20",
  star: "#F9A825",
};
const CORAL = ["#FFEBD5", "#FFCCBB"];
const MINT = ["#D5F5E0", "#E8FAD0"];
const MEADOW = ["#E8F5E9", "#C8E6C9"];

const rgba = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16), g = parseInt(h.substring(2, 4), 16), bl = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${bl},${a})`;
};

const BackHeader: React.FC<{ title: string; u: (n: number) => number }> = ({ title, u }) => (
  <div style={{ position: "absolute", left: u(14), top: u(14), display: "flex", alignItems: "center", zIndex: 5 }}>
    <div style={{
      height: u(36), paddingLeft: u(46), paddingRight: u(22), borderRadius: 999,
      background: `linear-gradient(135deg, ${A.blueLo}, ${A.blueHi})`, boxShadow: "0 4px 8px rgba(0,0,0,0.25)",
      display: "flex", alignItems: "center",
      fontFamily: font.family, fontWeight: 800, fontSize: u(16), color: "#FFFFFF", whiteSpace: "nowrap",
    }}>{title}</div>
    <div style={{
      position: "absolute", left: 0, width: u(40), height: u(40), borderRadius: "50%",
      background: A.blueHi, boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: u(17), color: "#FFFFFF", fontWeight: 900,
    }}>{"←"}</div>
  </div>
);

const Stars: React.FC<{ w: number; h: number; opacity?: number; glyph?: string }> = ({ w, h, opacity = 0.18, glyph = "★" }) => {
  const frame = useCurrentFrame();
  const pts = [[0.05,0.12,0.055],[0.22,0.68,0.038],[0.78,0.18,0.036],[0.90,0.50,0.048],[0.45,0.08,0.040],[0.65,0.38,0.032],[0.10,0.85,0.055]];
  return <>{pts.map(([x,y,s],i) => (
    <div key={i} style={{ position: "absolute", left: w*x, top: h*y + Math.sin(frame/30+i)*4, fontSize: h*(s as number)*1.4, lineHeight: 1, opacity, color: "#FFFFFF" }}>{glyph}</div>
  ))}</>;
};

/** kidsGlassCard, replicated: white85 fill, colour-tinted soft shadow, thin colour-tinted stroke */
const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; stroke?: string; u: (n: number) => number }> = ({ children, style, stroke = "#2E7D32", u }) => (
  <div style={{
    background: "rgba(255,255,255,0.85)",
    border: `1.2px solid ${rgba(stroke, 0.32)}`,
    borderRadius: u(20),
    boxShadow: `0 4px 12px ${rgba(stroke, 0.18)}`,
    ...style,
  }}>{children}</div>
);

/** KidsActionButton, replicated: pill, icon + text, coloured gradient by ButtonType */
const AppBtn: React.FC<{ text: string; icon: string; colors: [string, string]; u: (n: number) => number; full?: boolean }> = ({ text, icon, colors, u, full }) => (
  <div style={{
    flex: full ? undefined : 1, width: full ? "100%" : undefined, boxSizing: "border-box",
    display: "flex", alignItems: "center", justifyContent: "center", gap: u(7),
    padding: `${u(11)}px ${u(12)}px`, borderRadius: 999,
    background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`, boxShadow: "0 3px 7px rgba(0,0,0,0.25)",
    fontFamily: font.family, fontWeight: 800, fontSize: u(16), color: "#FFF", whiteSpace: "nowrap",
  }}><span style={{ fontSize: u(16) }}>{icon}</span><span>{text}</span></div>
);

/** one stop on the road: a badge, centred on (x,y). The hero (active) level gets full colour + size. */
const RoadNode: React.FC<{
  x: number; y: number; emoji: string; level: number; color: string; u: (n: number) => number;
  size: number; state: "done" | "active" | "locked";
}> = ({ x, y, emoji, level, color, u, size, state }) => {
  const hero = state === "active";
  return (
    <div style={{ position: "absolute", left: x - u(size / 2), top: y - u(size / 2), width: u(size), height: u(size), opacity: state === "locked" ? 0.42 : state === "done" ? 0.62 : 1 }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: state === "locked" ? "#B0BEC5" : color, border: `${hero ? 3 : 2}px solid #FFF`,
        boxShadow: `0 3px 8px ${rgba(color, 0.5)}`, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: u(size * 0.44),
      }}>{state === "locked" ? "🔒" : emoji}</div>
      <div style={{
        position: "absolute", left: -u(4), top: -u(4), width: u(size * 0.34), height: u(size * 0.34), borderRadius: "50%",
        background: "#37474F", border: "1px solid #FFF", display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: font.family, fontWeight: 800, fontSize: u(size * 0.19), color: "#FFF",
      }}>{level}</div>
      {state === "done" && (
        <div style={{
          position: "absolute", right: -u(4), bottom: -u(4), width: u(size * 0.28), height: u(size * 0.28), borderRadius: "50%",
          background: "#1B5E20", border: "1px solid #FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: u(size * 0.16), color: "#FFF",
        }}>✓</div>
      )}
    </div>
  );
};

/** the 13-family grid, coloured exactly as WordFamiliesIntroView's tiles array */
const RIME_TILES: [string, string][] = [
  ["-at","#E53935"],["-an","#F57C00"],["-og","#388E3C"],["-en","#0097A7"],
  ["-ig","#7B1FA2"],["-it","#1565C0"],["-ot","#E64A19"],["-un","#F9A825"],
  ["-ap","#5E35B1"],["-in","#00897B"],["-op","#D81B60"],["-ug","#6D4C41"],["-all","#0277BD"],
];

export const AppPractice: React.FC<{ b: { width: number; height: number; wide: boolean }; from: number }> = ({ b, from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - from;
  const enter = spring({ frame: t, fps, config: { damping: 13 } });

  const PW = Math.min(b.width * (b.wide ? 0.76 : 0.95), 1450);
  const PH = PW * 0.47;
  const PX = (b.width - PW) / 2;
  const PY = b.height * (b.wide ? 0.17 : 0.19);
  const BEZ = PW * 0.020;
  const SW = PW - BEZ * 2, SH = PH - BEZ * 2;
  const u = (n: number) => (SH / 500) * n;

  const step = t < 70 ? 0 : t < 170 ? 1 : 2;
  const tap = t >= 235 && t < 260;
  const answered = t >= 260;

  const Screen: React.FC = () => {
    // ── STEP 0 · the JOURNEY MAP (PhonicsReadingLevelsView.swift) ──────────
    if (step === 0) {
      const colFrac = 0.64;
      const roadW = SW * colFrac, roadH = SH;
      const nodeDefs: { level: number; xf: number; yf: number; color: string; emoji: string; state: "done" | "active" | "locked" }[] = [
        { level: 4, xf: 0.18, yf: 0.09, color: "#1565C0", emoji: "🧩", state: "done" },
        { level: 5, xf: 0.80, yf: 0.28, color: "#1565C0", emoji: "🧩", state: "done" },
        { level: 6, xf: 0.32, yf: 0.52, color: "#E91E63", emoji: "🏠", state: "active" },
        { level: 7, xf: 0.80, yf: 0.75, color: "#4527A0", emoji: "🎨", state: "locked" },
        { level: 8, xf: 0.18, yf: 0.93, color: "#4527A0", emoji: "🎨", state: "locked" },
      ];
      const pts = nodeDefs.map((n) => ({ x: n.xf * roadW, y: n.yf * roadH }));
      let path = `M ${pts[0].x} ${pts[0].y} `;
      for (let i = 1; i < pts.length; i++) {
        const p0 = pts[i - 1], p1 = pts[i];
        const dy = (p1.y - p0.y) * 0.5;
        path += `C ${p0.x} ${p0.y + dy}, ${p1.x} ${p1.y - dy}, ${p1.x} ${p1.y} `;
      }
      const hero = pts[2];
      const tapProg = t >= 48 ? Math.min(1, (t - 48) / 14) : 0;

      return (
        <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", display: "flex",
          background: `linear-gradient(135deg, ${MINT[0]}, ${MINT[1]})` }}>
          <BackHeader title="Phonics Reading" u={u} />
          {/* left: progress hub, matching progressHub — bigger throughout, centred */}
          <div style={{ width: `${(1 - colFrac) * 100}%`, height: "100%", boxSizing: "border-box", padding: u(18), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: u(14) }}>
            <div style={{ display: "flex", alignItems: "center", gap: u(14) }}>
              <Img src={staticFile("mascot.png")} style={{ height: u(96), transform: `translateY(${Math.sin(t / 12) * u(3)}px)` }} />
              <div style={{ width: u(100), height: u(100), borderRadius: "50%", border: `${u(9)}px solid rgba(46,125,50,0.15)`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ position: "absolute", inset: -u(9), borderRadius: "50%", border: `${u(9)}px solid transparent`, borderTopColor: A.ok, borderRightColor: A.ok, transform: "rotate(-30deg)" }} />
                <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(27), color: A.ok, textAlign: "center", lineHeight: 1.1 }}>6<div style={{ fontSize: u(13), color: "#888", fontWeight: 600 }}>of 28</div></div>
              </div>
            </div>
            <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(26), color: A.titleInk }}>Phonics Journey</div>
            <div style={{ fontFamily: font.family, fontWeight: 600, fontSize: u(15), color: "#888", textAlign: "center" }}>Great start!{"\n"}Keep following the road!</div>
            <div style={{ display: "flex", alignItems: "center", gap: u(5) }}>
              <span style={{ color: "#FFC107", fontSize: u(19) }}>★</span>
              <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(20), color: "#E65100" }}>14 / 84</div>
            </div>
            <div style={{ padding: `${u(11)}px ${u(24)}px`, borderRadius: 999, background: A.ok, boxShadow: "0 3px 8px rgba(27,94,32,0.4)",
              fontFamily: font.family, fontWeight: 800, fontSize: u(18), color: "#FFF", transform: `scale(${1+0.05*Math.sin(t/6)})` }}>▶ Continue Journey</div>
          </div>
          {/* right: the winding road — 4/5 above (dim), 6 centred + highlighted, 7/8 below (dim) */}
          <div style={{ width: `${colFrac * 100}%`, height: "100%", position: "relative", boxSizing: "border-box" }}>
            <svg width={roadW} height={roadH} style={{ position: "absolute", left: 0, top: 0 }}>
              <path d={path} stroke="rgba(255,255,255,0.85)" strokeWidth={u(12)} fill="none" strokeLinecap="round" />
              <path d={path} stroke="#FFB74D" strokeWidth={u(3.4)} strokeDasharray={`${u(7)} ${u(9)}`} fill="none" strokeLinecap="round" />
            </svg>
            <RoadNode x={pts[0].x} y={pts[0].y} emoji="🧩" level={4} color="#1565C0" u={u} size={34} state="done" />
            <RoadNode x={pts[1].x} y={pts[1].y} emoji="🧩" level={5} color="#1565C0" u={u} size={34} state="done" />
            <div style={{ position: "absolute", left: hero.x - u(72), top: hero.y - u(114), padding: `${u(7)}px ${u(16)}px`, borderRadius: 999,
              background: "linear-gradient(90deg, #E91E63, rgba(233,30,99,0.75))", boxShadow: "0 2px 6px rgba(233,30,99,0.4)",
              display: "flex", alignItems: "center", gap: u(7), whiteSpace: "nowrap" }}>
              <span style={{ fontSize: u(16) }}>🏠</span>
              <span style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(15), color: "#FFF" }}>Word Patterns</span>
              <span style={{ fontFamily: font.family, fontWeight: 600, fontSize: u(11), color: "rgba(255,255,255,0.9)", background: "rgba(255,255,255,0.22)", borderRadius: 999, padding: `1px ${u(7)}px` }}>Age 5-6</span>
            </div>
            <RoadNode x={hero.x} y={hero.y} emoji="🏠" level={6} color="#E91E63" u={u} size={80} state="active" />
            {/* the billboard card, exactly the fields billboardCard() draws */}
            <GlassCard u={u} stroke="#E91E63" style={{ position: "absolute", left: hero.x + u(50), top: hero.y - u(58), width: roadW * 0.46, padding: u(15) }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(19), color: "#E91E63" }}>Word Families</div>
                <div style={{ fontFamily: font.family, fontWeight: 600, fontSize: u(12), color: "#E91E63", background: "rgba(233,30,99,0.12)", borderRadius: 999, padding: `1px ${u(7)}px` }}>Age 5-6</div>
              </div>
              <div style={{ fontFamily: font.family, fontWeight: 600, fontSize: u(13), color: "rgba(0,0,0,0.55)", marginTop: u(4) }}>-at bat, cat · -en hen, ten · -ig big, pig</div>
              <div style={{ display: "flex", alignItems: "center", gap: u(7), marginTop: u(7) }}>
                {[0,1,2].map((i) => <span key={i} style={{ color: i<2 ? "#FFC107" : "rgba(189,189,189,0.6)", fontSize: u(15) }}>★</span>)}
                <div style={{ fontFamily: font.family, fontWeight: 700, fontSize: u(12), color: "#EF6C00", background: "rgba(239,108,0,0.12)", borderRadius: 999, padding: `1px ${u(7)}px` }}>Keep going ▶</div>
              </div>
            </GlassCard>
            <RoadNode x={pts[3].x} y={pts[3].y} emoji="🎨" level={7} color="#4527A0" u={u} size={34} state="locked" />
            <RoadNode x={pts[4].x} y={pts[4].y} emoji="🎨" level={8} color="#4527A0" u={u} size={34} state="locked" />
            {/* click Level 6 → the intro page opens */}
            {tapProg > 0 && (
              <div style={{ position: "absolute", left: hero.x + u(16), top: hero.y - u(96) + tapProg * u(80), fontSize: u(58), lineHeight: 1,
                transform: `rotate(-14deg) scale(${1 - 0.12 * Math.max(0, tapProg - 0.75) * 4})` }}>👆</div>
            )}
          </div>
        </div>
      );
    }
    // ── STEP 1 · the INTRO (WordFamiliesIntroView.swift) ────────────────────
    if (step === 1) {
      const tapProg2 = t >= 148 ? Math.min(1, (t - 148) / 14) : 0;
      return (
        <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", display: "flex",
          background: `linear-gradient(135deg, ${MEADOW[0]}, ${MEADOW[1]})` }}>
          <BackHeader title="Level 6" u={u} />
          <div style={{ width: "54%", height: "100%", boxSizing: "border-box", padding: `${u(20)}px ${u(22)}px`, display: "flex", flexDirection: "column", justifyContent: "center", gap: u(13) }}>
            <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(28), color: "#1B5E20" }}>Word Families</div>
            {[RIME_TILES.slice(0,4), RIME_TILES.slice(4,8), RIME_TILES.slice(8,13)].map((row, ri) => (
              <div key={ri} style={{ display: "flex", gap: u(10) }}>
                {row.map(([rime, color]) => (
                  <div key={rime} style={{
                    padding: `${u(6)}px ${u(13)}px`, borderRadius: u(11), background: `${color}26`,
                    border: `2px solid ${color}59`, fontFamily: font.family, fontWeight: 800, fontSize: u(18), color,
                  }}>{rime}</div>
                ))}
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: u(8), marginTop: u(6) }}>
              {[["📚","13 word families to explore"],["🔤","Change the first letter to build new words"],
                ["🔊","Hear each sound: onset + rime = word"],["💡","Once you know -at, you can read cat, bat, hat, rat!"]].map(([icon,text],i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: u(10) }}>
                  <div style={{ fontSize: u(16), width: u(22) }}>{icon}</div>
                  <div style={{ fontFamily: font.family, fontWeight: 600, fontSize: u(15), color: "#1B5E20" }}>{text}</div>
                </div>
              ))}
            </div>
            <GlassCard u={u} stroke="#388E3C" style={{ marginTop: u(6), padding: `${u(10)}px ${u(15)}px`, display: "flex", alignItems: "center", gap: u(10), alignSelf: "flex-start" }}>
              <div style={{ padding: `${u(5)}px ${u(11)}px`, borderRadius: u(7), background: "#1E88E5", fontFamily: font.family, fontWeight: 800, fontSize: u(19), color: "#FFF" }}>c</div>
              <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(21), color: "#999" }}>+</div>
              <div style={{ padding: `${u(5)}px ${u(11)}px`, borderRadius: u(7), background: "#E53935", fontFamily: font.family, fontWeight: 800, fontSize: u(19), color: "#FFF" }}>-at</div>
              <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(21), color: "#999" }}>=</div>
              <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(25), color: "#E53935" }}>cat</div>
            </GlassCard>
          </div>
          {/* right: PhonicsIntroRightPanel — mascot, title, subtitle, Start Learning + Practice/Listen */}
          <div style={{ width: "46%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", padding: `0 ${u(22)}px 0 0` }}>
            <GlassCard u={u} stroke="#2E7D32" style={{ padding: `${u(26)}px ${u(20)}px`, display: "flex", flexDirection: "column", alignItems: "center", gap: u(16) }}>
              <Img src={staticFile("mascot.png")} style={{ height: u(118), transform: `translateY(${Math.sin(t / 12) * u(3)}px)` }} />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: u(5) }}>
                <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(26), color: "#1B5E20", textAlign: "center" }}>Ready to explore?</div>
                <div style={{ fontFamily: font.family, fontWeight: 600, fontSize: u(15), color: "#888", textAlign: "center", lineHeight: 1.3 }}>Tap a family, then pick{"\n"}a letter to build words!</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: u(11), width: "100%" }}>
                <AppBtn text="Start Learning" icon="➔" colors={["#66BB6A", "#2E7D32"]} u={u} full />
                <div style={{ display: "flex", gap: u(11), position: "relative" }}>
                  <div style={{ flex: 1, transform: tapProg2 > 0 && tapProg2 < 1 ? "scale(0.94)" : undefined }}>
                    <AppBtn text="Practice" icon="✓" colors={[A.blueLo, A.blueHi]} u={u} />
                  </div>
                  <AppBtn text="Listen" icon="👂" colors={["#26C6DA", "#00838F"]} u={u} />
                  {/* click Practice → the practice page opens */}
                  {tapProg2 > 0 && (
                    <div style={{ position: "absolute", left: "16%", top: -u(74) + tapProg2 * u(68), fontSize: u(52), lineHeight: 1, transform: "rotate(-14deg)" }}>👆</div>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      );
    }

    // ── STEP 2 · PRACTICE (WordFamiliesPracticeView.swift) — score now top-right ──
    const hen = picFor("hen");
    const progress = 3 / 14;
    return (
      <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", display: "flex",
        background: `linear-gradient(135deg, ${CORAL[0]}, ${CORAL[1]})` }}>
        <Stars w={SW} h={SH} />
        <BackHeader title="Word Families" u={u} />
        <div style={{ position: "absolute", right: u(14), top: u(14), zIndex: 5, display: "flex", alignItems: "center", gap: u(8),
          padding: `${u(8)}px ${u(18)}px`, borderRadius: 999, background: "rgba(255,255,255,0.85)",
          border: `1.2px solid ${rgba(A.star, 0.35)}`, boxShadow: `0 4px 10px ${rgba(A.star, 0.28)}` }}>
          <span style={{ color: A.star, fontSize: u(24) }}>★</span>
          <span style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(21), color: A.titleInk }}>Score: {answered ? 3 : 2}</span>
        </div>
        <div style={{ width: "45%", height: "100%", boxSizing: "border-box", padding: u(20), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: u(16) }}>
          <div style={{ fontFamily: font.family, fontWeight: 700, fontSize: u(19), color: A.sub, textAlign: "center" }}>Question 3 of 14</div>
          <div style={{ width: "100%", height: u(10), borderRadius: 5, background: "rgba(255,255,255,0.4)" }}>
            <div style={{ width: `${progress * 100}%`, height: "100%", borderRadius: 5, background: `linear-gradient(90deg, ${A.blueLo}, ${A.blueHi})` }} />
          </div>
          <GlassCard u={u} stroke={A.titleInk} style={{ padding: u(16), textAlign: "center" }}>
            <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(23), color: A.titleInk }}>Find the First Letter</div>
            <div style={{ fontFamily: font.family, fontWeight: 600, fontSize: u(14), color: A.sub, marginTop: u(5) }}>Which letter starts this word?</div>
          </GlassCard>
          <GlassCard u={u} stroke={A.titleInk} style={{ padding: `${u(12)}px ${u(22)}px`, display: "flex", alignSelf: "center", alignItems: "baseline", gap: u(7) }}>
            <div style={{ minWidth: u(68), padding: `${u(4)}px ${u(12)}px`, borderRadius: u(12), background: answered ? A.okBg : "#ECEFF1", textAlign: "center",
              fontFamily: font.family, fontWeight: 800, fontSize: u(46), color: answered ? A.ok : "#90A4AE" }}>{answered ? "h" : "_"}</div>
            <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(46), color: A.ink }}>en</div>
          </GlassCard>
        </div>
        <div style={{ width: "55%", height: "100%", boxSizing: "border-box", padding: u(24), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: u(28) }}>
          <div style={{ height: u(180), display: "flex", alignItems: "center", justifyContent: "center" }}>
            {hen && hen.startsWith("img/") ? <Img src={staticFile(hen)} style={{ height: "100%", objectFit: "contain" }} /> : <div style={{ fontSize: u(140) }}>{hen}</div>}
          </div>
          <div style={{ display: "flex", gap: u(16), width: "100%", position: "relative" }}>
            {["p", "h", "t"].map((o, i) => {
              const selected = answered && i === 1;
              const isCorrect = i === 1;
              const fill = !answered ? "rgba(255,255,255,0.55)" : selected && isCorrect ? A.okBg : "rgba(255,255,255,0.6)";
              const border = !answered ? "rgba(26,35,126,0.4)" : isCorrect ? A.okBorder : "rgba(176,190,197,0.5)";
              const ink = !answered ? A.ink : isCorrect ? A.okBorder : "#90A4AE";
              return (
                <div key={o} style={{ flex: 1, borderRadius: u(15), background: fill, border: `2.5px solid ${border}`, boxSizing: "border-box",
                  padding: `${u(13)}px 0`, display: "flex", flexDirection: "column", alignItems: "center", gap: u(3),
                  transform: tap && i === 1 ? "scale(0.94)" : selected ? "scale(1.03)" : undefined }}>
                  <div style={{ fontFamily: font.family, fontWeight: 800, fontSize: u(38), color: ink }}>{o}</div>
                  {answered && isCorrect && <div style={{ fontSize: u(17), color: A.ok }}>✓</div>}
                </div>
              );
            })}
            {(tap || (t >= 205 && t < 260)) && (
              <div style={{ position: "absolute", left: `${(1/3)*100}%`, marginLeft: u(38), top: t < 235 ? u(-84) : u(12), fontSize: u(56), lineHeight: 1, transform: "rotate(-18deg)" }}>👆</div>
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
