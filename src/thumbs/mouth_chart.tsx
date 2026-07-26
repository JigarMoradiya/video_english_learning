import React from "react";
import { AbsoluteFill } from "remotion";
import { Articulation, ARTICULATION_HINT, LETTER_ARTICULATION } from "../data/articulation";
import { PhonicsMouth } from "../components/PhonicsMouth";
import { font, palette } from "../data/tokens";

// Review sheet for the mouth shapes — every articulation at full open, with the
// letters that use it. Not part of any video; it exists so the shapes can be
// checked at a glance instead of re-rendering a Short per letter.
//   npx remotion still mouth-chart out/mouth_chart.png
const ORDER: Articulation[] = [
  "openWide", "openMid", "openSmall", "roundTall", "openRelaxed",
  "lipsClosed", "teethLip", "tongueTip", "teethNarrow", "tongueBack",
  "lipsRound", "lipsForward", "tongueCurl",
];

const lettersFor = (a: Articulation) =>
  Object.entries(LETTER_ARTICULATION).filter(([, v]) => v === a).map(([k]) => k).join(" ");

export const MouthChart: React.FC = () => (
  <AbsoluteFill style={{ background: "#FFF6E6", fontFamily: font.family, padding: 40 }}>
    <div style={{ fontSize: 44, fontWeight: 800, color: palette.ink, marginBottom: 18 }}>
      Phonics mouth shapes — all 26 letters
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18 }}>
      {ORDER.map((a) => (
        <div key={a} style={{ background: "#fff", borderRadius: 24, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 6px 18px rgba(92,64,32,0.14)" }}>
          <PhonicsMouth articulation={a} open={0.95} size={190} color="#2EB8B8" />
          <div style={{ fontSize: 26, fontWeight: 800, color: palette.ink, marginTop: 2 }}>{lettersFor(a)}</div>
          <div style={{ fontSize: 19, fontWeight: 700, color: palette.inkSoft, textAlign: "center" }}>{ARTICULATION_HINT[a]}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
