import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { LISTEN, VOWELS } from "../data/shortvowels";
import { Bird } from "../components/ChirpWire";
import { font, hex, palette, tint } from "../data/tokens";

// ── Short Vowels thumbnail, PORTRAIT ─────────────────────────────────────────
//   npx remotion still thumb-short-vowels-9x16 out/thumb_short_vowels_9x16.png
//
// Facebook centre-crops a 16:9 thumbnail to a taller frame in the mobile feed, which
// throws away exactly the edges the landscape version uses — the mascot on the left
// and the logo on the right — and leaves a strip of sky. So this is not a re-crop of
// the landscape thumbnail; it is composed for a tall frame: the headline stacks, the
// five cards stay in ONE row (five-in-a-row is the whole point), and the world's
// bottom band moves down into the space a portrait frame actually has.
//
// Bands are fractions of the height, tuned for 1080×1920. They were first tuned for a
// shorter 4:5 frame, which left ~300px of dead sky between the word row and the birds
// in 9:16; the whole content block now sits lower so that gap closes to ~120px.
const GOLD = "#FFC42A";

export const ThumbShortVowelsPortrait: React.FC = () => {
  const { width: W, height: H } = useVideoConfig();

  const headTop = H * 0.16;
  const headSize = H * 0.095;
  const subTop = headTop + headSize * 2.14;
  const cardsTop = H * 0.44;
  const cardW = W * 0.161;
  const cardH = cardW * 1.06;
  const cardGap = W * 0.026;
  const rowW = 5 * cardW + 4 * cardGap;
  const rowX = (W - rowW) / 2;
  const cardCx = (i: number) => rowX + i * (cardW + cardGap) + cardW / 2;

  const wireY = H * 0.715;
  const roofTop = wireY + H * 0.02;
  const treeY = wireY - H * 0.028;
  const sunX = W * 0.8;
  const sunY = H * 0.085;
  const sunR = W * 0.072;
  const birdScale = (W / 1080) * 1.24;

  // One example word per vowel, from the lesson's own listen set (cat·hen·pig·dog·sun).
  // A portrait frame has vertical room the landscape one does not, and the first version
  // spent it on 250px of empty sky between the cards and the wire. It should carry MORE
  // content there, not more gap — and it pairs each letter with a real word.
  const wordTop = cardsTop + cardH + H * 0.024;
  const wordH = W * 0.072;
  const birdTop = wireY - 80 * birdScale;
  const showWords = birdTop - (wordTop + wordH) > H * 0.03;

  // The mascot is sized from the space BELOW the wire, so it can never reach up into the
  // bird row — which is exactly what went wrong when it was sized from the width.
  const mascotH = Math.min(W * 0.34, (H - wireY) * 0.86);
  const mascotW = mascotH * (923 / 1063);
  // mascot.png has ~7px of bottom padding on 1063, so its feet are effectively the last
  // pixel row: anything <= 0 reads as cropped. Give it real clearance.
  const mascotBottom = H * 0.022;
  const footGap = birdTop - (wordTop + wordH);
  if (showWords && (footGap < H * 0.04 || footGap > H * 0.10)) {
    throw new Error(`portrait thumb: gap between the word row and the birds is ${Math.round(footGap)}px — retune cardsTop`);
  }
  if (H - mascotBottom - mascotH < wireY - 6) {
    throw new Error(`portrait thumb: mascot top ${H - mascotBottom - mascotH} rises above the wire ${wireY} and will sit on the birds`);
  }

  return (
    <AbsoluteFill style={{ fontFamily: font.family, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, #FFDDAC 0%, #FFEECB 26%, #F0F5FF 58%, #D8E8FF 100%)",
        }}
      />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="pvSunCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
            <stop offset="34%" stopColor="#FFF6D0" stopOpacity={0.98} />
            <stop offset="66%" stopColor="#FFDB8C" stopOpacity={0.88} />
            <stop offset="100%" stopColor="#FFC46B" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="pvHaze" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFDFA4" stopOpacity={0.6} />
            <stop offset="55%" stopColor="#FFE9C2" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#FFF3DC" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="pvRay" gradientUnits="userSpaceOnUse" cx={sunX} cy={sunY} r={sunR + W * 0.2}>
            <stop offset="0%" stopColor="#FFEFC0" stopOpacity={0.6} />
            <stop offset="45%" stopColor="#FFE6AC" stopOpacity={0.34} />
            <stop offset="100%" stopColor="#FFE6AC" stopOpacity={0} />
          </radialGradient>
        </defs>

        <circle cx={sunX} cy={sunY} r={sunR + W * 0.2} fill="url(#pvHaze)" />
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const len = (i % 4 === 0 ? sunR * 2.5 : i % 2 === 0 ? sunR * 1.8 : sunR * 1.3);
          const r0 = sunR - 4;
          const half = 0.13 - 0.055 * (i % 2);
          const pt = (rr: number, aa: number) => `${sunX + Math.cos(aa) * rr} ${sunY + Math.sin(aa) * rr}`;
          return (
            <path
              key={i}
              d={`M${pt(r0, a - half)} Q ${pt(r0 + len * 0.6, a)} ${pt(r0 + len, a)} Q ${pt(r0 + len * 0.6, a)} ${pt(r0, a + half)} Z`}
              fill="url(#pvRay)"
            />
          );
        })}
        <circle cx={sunX} cy={sunY} r={sunR} fill="url(#pvSunCore)" />

        {[[W * 0.2, H * 0.15, 0.8], [W * 0.62, H * 0.115, 0.62]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${(s as number) * (W / 1280)})`} opacity={0.85}>
            <ellipse cx={0} cy={10} rx={84} ry={32} fill="#CFE0F2" />
            <ellipse cx={0} cy={0} rx={80} ry={34} fill="#fff" />
            <ellipse cx={-54} cy={12} rx={48} ry={26} fill="#fff" />
            <ellipse cx={54} cy={13} rx={52} ry={24} fill="#fff" />
          </g>
        ))}

        {/* treeline, then rooftops — pushed back so the cards stay dominant */}
        <g opacity={0.55}>
          {Array.from({ length: 11 }, (_, i) => (
            <ellipse key={i} cx={i * (W / 9) + W * 0.02} cy={treeY + (i % 3) * (H * 0.01)} rx={W * 0.075} ry={H * 0.032} fill="#93C08E" />
          ))}
        </g>
        <g opacity={0.6}>
          {Array.from({ length: 7 }, (_, i) => {
            const bw = W * 0.17 + (i % 3) * W * 0.035;
            const x = i * W * 0.16 - W * 0.03;
            const top = roofTop + (i % 2 ? H * 0.022 : 0);
            return (
              <g key={i}>
                <path d={`M${x} ${top + H * 0.026} L${x + bw / 2} ${top} L${x + bw} ${top + H * 0.026} Z`} fill="#B4C6DC" />
                <rect x={x + bw * 0.05} y={top + H * 0.026} width={bw * 0.9} height={H - top} fill="#BACDE2" />
              </g>
            );
          })}
        </g>

        {[W * 0.028, W * 0.972].map((x) => (
          <g key={x}>
            <rect x={x - W * 0.009} y={wireY - H * 0.058} width={W * 0.018} height={H - wireY + H * 0.058} fill="#A8845F" />
            <rect x={x - W * 0.046} y={wireY - H * 0.05} width={W * 0.092} height={H * 0.011} rx={H * 0.0055} fill="#96744F" />
          </g>
        ))}
        <path d={`M0 ${wireY - H * 0.009} Q ${W / 2} ${wireY + H * 0.016} ${W} ${wireY - H * 0.009}`} fill="none" stroke="#5C6875" strokeWidth={W * 0.0055} opacity={0.85} />

        {VOWELS.map((v, i) => (
          <Bird key={v.letter} x={cardCx(i)} y={wireY} color={v.color} letter={v.letter} open={1} phase={i * 1.1} active still scale={birdScale} />
        ))}
      </svg>

      {/* hook badge */}
      <div
        style={{
          position: "absolute", left: W * 0.024, top: H * 0.016, transform: "rotate(-11deg)",
          background: GOLD, color: palette.ink, borderRadius: W * 0.019,
          padding: `${H * 0.008}px ${W * 0.021}px`,
          fontSize: H * 0.032, fontWeight: 800, lineHeight: 1.05, textAlign: "center",
          boxShadow: "0 10px 24px rgba(30,36,56,0.30)",
        }}
      >
        QUICK<br /><span style={{ fontSize: H * 0.023 }}>SOUND!</span>
      </div>

      {/* the headline STACKS in portrait — one line would have to shrink to fit */}
      <div
        style={{
          position: "absolute", left: 0, top: headTop, width: W, textAlign: "center",
          fontSize: headSize, fontWeight: 800, color: palette.ink, lineHeight: 1.04,
          textShadow: "0 6px 0 #FFFFFF, 0 10px 26px rgba(30,36,56,0.22)",
        }}
      >
        SHORT<br />VOWELS
      </div>
      <div
        style={{
          position: "absolute", left: 0, top: subTop, width: W, textAlign: "center",
          fontSize: H * 0.034, fontWeight: 800, color: "#6B5B86",
        }}
      >
        not the letter's NAME!
      </div>

      {VOWELS.map((v, i) => {
        const c = hex(v.color);
        return (
          <div
            key={v.letter}
            style={{
              position: "absolute", left: rowX + i * (cardW + cardGap), top: cardsTop,
              width: cardW, height: cardH, boxSizing: "border-box",
              background: "#fff", border: `${W * 0.0074}px solid ${c}`, borderRadius: W * 0.026,
              boxShadow: `0 14px 30px ${c}44, 0 6px 0 ${tint(v.color, 0.3)}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: cardW * 0.72, fontWeight: 800, color: c, lineHeight: 1,
            }}
          >
            {v.letter}
          </div>
        );
      })}

      {showWords && LISTEN.map((w, i) => {
        const v = VOWELS[i];
        const c = hex(v.color);
        return (
          <div
            key={w.word}
            style={{
              position: "absolute", left: rowX + i * (cardW + cardGap), top: wordTop,
              width: cardW, height: wordH, boxSizing: "border-box",
              background: "#fff", border: `${W * 0.005}px solid ${tint(v.color, 0.35)}`,
              borderRadius: wordH / 2, boxShadow: `0 8px 18px ${c}33`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: wordH * 0.56, fontWeight: 800, color: palette.ink, lineHeight: 1,
            }}
          >
            {w.word.split("").map((ch, k) => (
              <span key={k} style={{ color: ch === v.lower ? c : palette.ink }}>{ch}</span>
            ))}
          </div>
        );
      })}

      <Img
        src={staticFile("mascot.png")}
        style={{
          position: "absolute", left: W * 0.005, bottom: mascotBottom, width: mascotW, height: "auto",
          filter: "drop-shadow(0 14px 26px rgba(30,36,56,0.34))",
        }}
      />
      <Img src={staticFile("logo.png")} style={{ position: "absolute", right: W * 0.022, bottom: H * 0.018, width: W * 0.13, height: "auto" }} />
    </AbsoluteFill>
  );
};
