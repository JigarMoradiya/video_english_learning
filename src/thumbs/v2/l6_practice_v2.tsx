import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { font } from "../../data/tokens";
import { FAIR } from "../../components/QuizFair";
import { MASCOT, assertInStage, badge, badgeSub, head, headSize, logo, stageCx } from "./coverV2";

// ── L6 · Word Families · Practice · cover v2 (1280×720) ─────────────────────
//   npx remotion still thumb-v2-l6-practice out/thumb_v2/l6_practice.png
//
// Deep booth-red ground (the fair's own colour, saturated) — distinct from the Lesson's
// sage green and from CVC's orange. ONE giant key visual: the picture and the three
// letter choices, "c" glowing gold exactly as the app marks it correct.

const GROUND_L6_PRACTICE = "linear-gradient(105deg, #3D0F0F 0%, #7A1F1F 46%, #C6403C 100%)";
const OPTS = ["b", "c", "h"];
const CORRECT = 1;

const OptionTile: React.FC<{ ch: string; s: number; correct: boolean }> = ({ ch, s, correct }) => (
  <div style={{
    width: s, height: s * 0.86, borderRadius: s * 0.18,
    background: correct ? "#F4C33F" : "#FFF8E9",
    border: `${Math.max(5, s * 0.05)}px solid #142A18`, boxSizing: "border-box",
    boxShadow: "0 14px 30px rgba(0,0,0,0.4)",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    fontFamily: font.family, fontWeight: 800, fontSize: s * 0.42, color: "#142A18",
  }}>
    {ch}
    {correct && <div style={{ fontSize: s * 0.22, marginTop: s * 0.02 }}>✓</div>}
  </div>
);

const PIC = 230, OPT_S = 150, OPT_GAP = 16;
const ROW_W = PIC + 50 + 3 * OPT_S + 2 * OPT_GAP;
const ROW_X = stageCx - ROW_W / 2;
const ROW_Y = 340;
const OPT_X0 = ROW_X + PIC + 50;
const OPT_Y = ROW_Y + (PIC - OPT_S * 0.86) / 2;
assertInStage("picture", ROW_X, ROW_X + PIC);
assertInStage("options", OPT_X0, OPT_X0 + 3 * OPT_S + 2 * OPT_GAP);
if (OPT_Y + OPT_S * 0.86 > 720 - 34) throw new Error("v2 l6 practice: options too low");

export const ThumbV2L6Practice: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: font.family, background: GROUND_L6_PRACTICE, overflow: "hidden" }}>
    <div style={{
      position: "absolute", left: ROW_X - 90, top: ROW_Y - 70, width: ROW_W + 180, height: PIC + 140,
      background: "radial-gradient(closest-side, rgba(255,255,255,0.16), rgba(255,255,255,0))",
    }} />
    <div style={badge}>LEVEL 6<br /><span style={badgeSub}>PRACTICE</span></div>
    <div style={{ ...head, top: 60, fontSize: headSize(12), whiteSpace: "pre-line" }}>{"FIND THE\nFIRST LETTER"}</div>

    <div style={{
      position: "absolute", left: ROW_X, top: ROW_Y, width: PIC, height: PIC,
      background: "#FFF8E9", borderRadius: PIC * 0.16, border: `${PIC * 0.05}px solid #142A18`,
      boxSizing: "border-box", boxShadow: "0 16px 32px rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Img src={staticFile("img/l6/cat.png")} style={{ width: "82%", height: "82%", objectFit: "contain" }} />
    </div>

    <div style={{ position: "absolute", left: OPT_X0, top: OPT_Y, display: "flex", gap: OPT_GAP }}>
      {OPTS.map((ch, i) => <OptionTile key={ch} ch={ch} s={OPT_S} correct={i === CORRECT} />)}
    </div>

    <Img src={staticFile("mascot.png")} style={{
      position: "absolute", left: MASCOT.left, bottom: MASCOT.bottom, width: MASCOT.width, height: "auto",
      filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.5))",
    }} />
    <Img src={staticFile("logo.png")} style={{ ...logo, height: "auto" }} />
  </AbsoluteFill>
);
