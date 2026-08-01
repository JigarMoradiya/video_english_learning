import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { RecLetter } from "../data/recognition";
import { cellCenterFor } from "./LetterGrid";
import { sec } from "../lib/timing";
import { hex, shade, lum, palette, font, letterColorFor } from "../data/tokens";
import { pulse } from "../lib/motion";
import { Confetti } from "./Confetti";
import { CardBadge, letterHasBadge } from "./BrandMarks";

// Right-hand detail panel for one letter. The big letter flies in from its grid cell,
// then letter → "says" → sound highlight PURPLE + scale (app parity) synced to the trio
// clip; the word image (its own-colour card) and word name sit below. Absolute-positioned
// on the right; grid owns the left.
// vertically centred group: letter (center) · "says <sound>" · image card · word
// BAND TABLE: the panel lives RIGHT of the board at 16:9 and BELOW it in a portrait
// frame, where the board owns the top. Values are y-stacked to fit 1350 with margins.
const panelFor = (width: number, height: number) =>
  height > width
    ? // letter 595..785 · says 800..895 · card 915..1225 · word 1250..1315 — 15px+ gaps,
      // measured from the 190px letter (Y is its CENTRE) and the 82px says line (Y is TOP)
      { letterX: width / 2, letterY: 690, saysY: 800, cardY: 915, cardSize: 310, wordY: 1250 }
    : { letterX: 1430, letterY: 219, saysY: 324, cardY: 434, cardSize: 420, wordY: 872 };
const PURPLE = "#8E24AA";
const MUTED = "rgba(30,36,56,0.4)";

export const RecognitionPanel: React.FC<{
  item: RecLetter;
  audioStart: number; // frames into this sequence when the trio begins
  cellIndex: number; // grid cell the letter flies from (resolved per-aspect)
}> = ({ item, audioStart, cellIndex }) => {
  const t = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const PANEL = panelFor(width, height);
  const flyFrom = cellCenterFor(cellIndex, width, height);
  const A = audioStart;
  const ic = lum(item.imageColor) > 0.62 ? shade(item.imageColor, 0.3) : hex(item.imageColor);

  const win = (a: number, b: number) => t >= a && t < b;
  const litLetter = win(A, A + sec(item.d0, fps));
  const litSays = win(A + sec(item.d0, fps), A + sec(item.d0 + item.d1, fps));
  const soundStart = A + sec(item.d0 + item.d1, fps);
  const soundEnd = A + sec(item.d0 + item.d1 + item.d2, fps);
  const litSound = win(soundStart, soundEnd);
  const litScale = (start: number, lit: boolean) => (lit ? interpolate(t, [start, start + 5], [1, 1.14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1);

  // letter flies from its grid cell into the panel slot
  const enter = spring({ frame: t, fps, config: { damping: 14 } });
  const dx = (flyFrom.x - PANEL.letterX) * (1 - enter);
  const dy = (flyFrom.y - PANEL.letterY) * (1 - enter);
  const flyScale = 0.5 + 0.5 * enter;
  const letterColor = enter < 0.85 ? "#FF9800" : litLetter ? PURPLE : palette.ink;
  const lowerIn = spring({ frame: t - 8, fps, config: { damping: 14 } }); // lowercase pops in beside the capital

  // supporting elements rise/fade in just after the letter lands
  const rise = (delay: number) => spring({ frame: t - delay, fps, config: { damping: 15 } });
  const cardIn = rise(10);
  const imgPulse = t >= soundStart ? pulse(t - soundStart, fps, 0.07, 0.7) : 1;
  const wordIn = rise(16);

  return (
    <>
      {/* big letter pair — uppercase flies in from the grid, lowercase pops beside it (teach both cases) */}
      <div style={{ position: "absolute", left: PANEL.letterX, top: PANEL.letterY, transform: "translate(-50%,-50%)", display: "flex", alignItems: "baseline", gap: 18, fontFamily: font.family, fontWeight: 800, lineHeight: 1 }}>
        <span style={{ fontSize: 190, color: letterColor, display: "inline-block", transform: `translate(${dx}px, ${dy}px) scale(${flyScale * litScale(A, litLetter)})` }}>{item.letter}</span>
        <span style={{ fontSize: 132, color: litLetter ? PURPLE : palette.ink, display: "inline-block", transform: `scale(${lowerIn * litScale(A, litLetter)})` }}>{item.letter.toLowerCase()}</span>
      </div>

      {/* "says <sound>" row */}
      <div style={{ position: "absolute", left: PANEL.letterX, top: PANEL.saysY, transform: "translateX(-50%)", display: "flex", gap: 26, alignItems: "baseline", fontFamily: font.family, opacity: cardIn }}>
        <span style={{ fontSize: 74, fontWeight: 800, color: litSays ? PURPLE : MUTED, transform: `scale(${litScale(A + sec(item.d0, fps), litSays)})`, display: "inline-block" }}>says</span>
        <span style={{ fontSize: 82, fontWeight: 800, color: litSound ? PURPLE : MUTED, transform: `scale(${litScale(soundStart, litSound)})`, display: "inline-block" }}>{item.sound}</span>
      </div>

      {/* word image card (own-colour border) */}
      <div
        style={{
          position: "absolute",
          left: PANEL.letterX,
          top: PANEL.cardY,
          transform: `translateX(-50%) scale(${cardIn * imgPulse})`,
          width: PANEL.cardSize,
          height: PANEL.cardSize,
          background: "#fff",
          borderRadius: 40,
          border: `10px solid ${ic}`,
          boxShadow: `0 22px 56px ${ic}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Img src={staticFile(`letters/${item.image}.png`)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        {/* brand badge on only a handful of the 26 letters (its own set, distinct from video #1) */}
        {letterHasBadge(item.letter, "recognition") && <CardBadge size={62} corner="br" />}
      </div>

      {/* word name */}
      <div style={{ position: "absolute", left: PANEL.letterX, top: PANEL.wordY, transform: `translateX(-50%) scale(${wordIn})`, fontFamily: font.family, fontSize: 64, fontWeight: 800, color: ic, opacity: wordIn }}>
        {item.word}
      </div>

      {/* celebration confetti on the sound */}
      <Confetti frame={t} fps={fps} burstFrame={soundEnd} origin={{ x: PANEL.letterX, y: PANEL.cardY + PANEL.cardSize / 2 }} colors={[letterColorFor(item.letter, item.imageColor), "#FF9800", "#8E24AA", "#4FC3F7", "#FFD54F"]} count={30} seed={item.letter.charCodeAt(0)} />
    </>
  );
};
