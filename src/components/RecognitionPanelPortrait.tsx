import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { RecLetter } from "../data/recognition";
import { sec } from "../lib/timing";
import { hex, shade, lum, font } from "../data/tokens";
import { pulse } from "../lib/motion";
import { Confetti } from "./Confetti";
import { CardBadge, letterHasBadge } from "./BrandMarks";
import { PGRID } from "./LetterGridPortrait";

// Portrait letter panel — sits BELOW the grid. The letter flies out of its grid cell, then
// letter → "says" → sound light up in sync with the trio clip. Part 1's motion signature =
// SOUND-WAVE RINGS radiating from the letter while its phonics sound plays.
// The panel is CENTRED in the band between the grid's bottom edge and the n/26 counter, so
// the gap above the big letter matches the gap below the word (derived, not hand-placed —
// it stays balanced if the grid ever changes size).
const BAND_TOP = PGRID.bottom, BAND_BOTTOM = 1800;
const LETTER_H = 215, SAYS_H = 100, CARD = 372, WORD_H = 76;
const G1 = 30, G2 = 34, G3 = 46; // letter→says, says→card, card→word
const CONTENT_H = LETTER_H + G1 + SAYS_H + G2 + CARD + G3 + WORD_H;
const ORIGIN = BAND_TOP + (BAND_BOTTOM - BAND_TOP - CONTENT_H) / 2;
const P = {
  cx: 540,
  letterY: ORIGIN + LETTER_H / 2, // letterY is the letter's CENTRE
  saysY: ORIGIN + LETTER_H + G1,
  cardY: ORIGIN + LETTER_H + G1 + SAYS_H + G2,
  cardSize: CARD,
  wordY: ORIGIN + LETTER_H + G1 + SAYS_H + G2 + CARD + G3,
};
const GOLD = "#FFC24A";

export const RecognitionPanelPortrait: React.FC<{
  item: RecLetter;
  audioStart: number;
  flyFrom: { x: number; y: number };
}> = ({ item, audioStart, flyFrom }) => {
  const t = useCurrentFrame();
  const { fps } = useVideoConfig();
  const A = audioStart;
  const ic = lum(item.imageColor) > 0.62 ? shade(item.imageColor, 0.3) : hex(item.imageColor);

  const win = (a: number, b: number) => t >= a && t < b;
  const litLetter = win(A, A + sec(item.d0, fps));
  const litSays = win(A + sec(item.d0, fps), A + sec(item.d0 + item.d1, fps));
  const soundStart = A + sec(item.d0 + item.d1, fps);
  const soundEnd = A + sec(item.d0 + item.d1 + item.d2, fps);
  const litSound = win(soundStart, soundEnd);
  const litScale = (start: number, lit: boolean) => (lit ? interpolate(t, [start, start + 5], [1, 1.14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1);

  // letter flies from its grid cell down into the panel
  const enter = spring({ frame: t, fps, config: { damping: 14 } });
  const dx = (flyFrom.x - P.cx) * (1 - enter);
  const dy = (flyFrom.y - P.letterY) * (1 - enter);
  const flyScale = 0.5 + 0.5 * enter;
  const lowerIn = spring({ frame: t - 8, fps, config: { damping: 14 } });
  const rise = (delay: number) => spring({ frame: t - delay, fps, config: { damping: 15 } });
  const cardIn = rise(10);
  const imgPulse = t >= soundStart ? pulse(t - soundStart, fps, 0.07, 0.7) : 1;
  const wordIn = rise(16);

  return (
    <>
      {/* sound-wave rings while the phonics sound plays (part 1's signature motion) */}
      {litSound && (
        <svg width={720} height={720} style={{ position: "absolute", left: P.cx - 360, top: P.letterY - 360 }}>
          {[0, 1, 2, 3].map((k) => {
            const prog = (((t - soundStart) * 1.6 + k * 7) % 28) / 28;
            return <circle key={k} cx={360} cy={360} r={110 + prog * 240} fill="none" stroke="#fff" strokeWidth={6} opacity={(1 - prog) * 0.34} />;
          })}
        </svg>
      )}

      {/* big letter pair */}
      <div style={{ position: "absolute", left: P.cx, top: P.letterY, transform: "translate(-50%,-50%)", display: "flex", alignItems: "baseline", gap: 18, fontFamily: font.family, fontWeight: 800, lineHeight: 1 }}>
        <span style={{ fontSize: 210, color: litLetter ? GOLD : "#fff", display: "inline-block", transform: `translate(${dx}px, ${dy}px) scale(${flyScale * litScale(A, litLetter)})`, textShadow: "0 12px 30px rgba(0,0,0,0.28)" }}>{item.letter}</span>
        <span style={{ fontSize: 146, color: litLetter ? GOLD : "#fff", display: "inline-block", transform: `scale(${lowerIn * litScale(A, litLetter)})`, textShadow: "0 12px 30px rgba(0,0,0,0.28)" }}>{item.letter.toLowerCase()}</span>
      </div>

      {/* "says <sound>" */}
      <div style={{ position: "absolute", left: P.cx, top: P.saysY, transform: "translateX(-50%)", display: "flex", gap: 26, alignItems: "baseline", fontFamily: font.family, opacity: cardIn }}>
        <span style={{ fontSize: 76, fontWeight: 800, color: litSays ? GOLD : "rgba(255,255,255,0.6)", transform: `scale(${litScale(A + sec(item.d0, fps), litSays)})`, display: "inline-block" }}>says</span>
        <span style={{ fontSize: 84, fontWeight: 800, color: litSound ? GOLD : "rgba(255,255,255,0.6)", transform: `scale(${litScale(soundStart, litSound)})`, display: "inline-block" }}>{item.sound}</span>
      </div>

      {/* word image card */}
      <div
        style={{
          position: "absolute", left: P.cx, top: P.cardY, transform: `translateX(-50%) scale(${cardIn * imgPulse})`,
          width: P.cardSize, height: P.cardSize, background: "#fff", borderRadius: 40,
          border: `10px solid ${ic}`, boxShadow: "0 22px 56px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}
      >
        <Img src={staticFile(`letters/${item.image}.png`)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        {letterHasBadge(item.letter, "recognition") && <CardBadge size={64} corner="br" />}
      </div>

      {/* word name */}
      <div style={{ position: "absolute", left: P.cx, top: P.wordY, transform: `translateX(-50%) scale(${wordIn})`, fontFamily: font.family, fontSize: 68, fontWeight: 800, color: "#fff", opacity: wordIn }}>
        {item.word}
      </div>

      <Confetti frame={t} fps={fps} burstFrame={soundEnd} origin={{ x: P.cx, y: P.cardY + P.cardSize / 2 }} colors={[GOLD, "#FF8AB8", "#FFFFFF", "#4FC3F7", "#FFD54F"]} count={30} seed={item.letter.charCodeAt(0)} />
    </>
  );
};
