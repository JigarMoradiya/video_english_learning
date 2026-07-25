import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { LetterItem } from "../data/letters";
import { sec } from "../lib/timing";
import { hex, palette, tint, shade, lum, letterColorFor, font } from "../data/tokens";
import { bob, pulse } from "../lib/motion";
import { TraceGlyph } from "./TraceGlyph";
import { Confetti } from "./Confetti";
import imageColors from "../data/imageColors.json";

const COLORS = imageColors as Record<string, string>;
const normKey = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
// each word tile's colour = its own image's dominant colour, darkened if too pale to read
const wordColor = (w: string) => {
  const raw = COLORS[normKey(w)] ?? "#6D6D6D";
  return lum(raw) > 0.62 ? shade(raw, 0.3) : hex(raw);
};

// One letter's scene (frame is scene-relative). Layout, top → bottom:
//   "A says" · "Aaa Aaa Aaa"          (spoken sound, above)
//   [ A a ]   [ Ant image ]           (self-drawing case pair + word card)
//   "A for Ant"                       (below the row)
//   [🍎 Apple] [🐊 Alligator]         (two more words, each a small image tile)
// Letter + captions use a colour that CONTRASTS the image; the card keeps the image's colour.
export const LetterScene: React.FC<{ item: LetterItem }> = ({ item }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const c = letterColorFor(item.letter, item.imageColor); // distinct per-letter colour (contrast-guarded)
  const ic = lum(item.imageColor) > 0.62 ? shade(item.imageColor, 0.3) : hex(item.imageColor); // image-card stroke
  const t = item.timings;
  const lower = item.letter.toLowerCase();

  // scene entrance (varied per letter)
  const e = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.3)) });
  const variant = item.letter.charCodeAt(0) % 4;
  const enterT =
    variant === 0 ? `translateX(${(1 - e) * -70}px)` : variant === 1 ? `translateX(${(1 - e) * 70}px)` : variant === 2 ? `translateY(${(1 - e) * 60}px)` : `scale(${0.9 + e * 0.1})`;

  // the letter draws itself while it's being said ("A says a-a-a") — timings[0]..[4]
  const drawStart = sec(t[0] + 0.05, fps);
  const drawEnd = sec(t[4] + 0.25, fps);
  const drawP = interpolate(frame, [drawStart, drawEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lowerP = interpolate(frame, [drawStart + 8, drawEnd + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // a spoken token: dim before its time, pops + fills accent at its time, stays lit after
  const Tok: React.FC<{ i: number; text: string; size?: number; col?: string }> = ({ i, text, size = 60, col = c }) => {
    const at = sec(t[i], fps);
    const on = frame >= at;
    const p = on ? interpolate(frame, [at, at + 7, at + 18], [1, 1.24, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
    return (
      <span style={{ display: "inline-block", fontSize: size, fontWeight: 800, lineHeight: 1, letterSpacing: 1, color: on ? col : palette.inkSoft, opacity: on ? 1 : 0.5, transform: `scale(${p})` }}>
        {text}
      </span>
    );
  };

  const imgIn = spring({ frame: frame - 6, fps, config: { damping: 13 } });
  const wordAt = sec(t[7], fps);
  const imgPulse = frame >= wordAt ? pulse(frame - wordAt, fps, 0.08, 0.7) : 1;

  // two extra example words (with small image tiles) fly in on the closing line
  const extrasAt = wordAt + sec(0.85, fps);
  const extra = (k: number) => interpolate(frame, [extrasAt + k * 8, extrasAt + 12 + k * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // per-letter themed floaters (shape kind varies so each scene feels distinct)
  const shapeKind = item.letter.charCodeAt(0) % 3; // 0 circle · 1 star · 2 rounded square
  const floaters = [[0.08, 0.16, 120], [0.92, 0.13, 95], [0.9, 0.82, 130], [0.07, 0.8, 105], [0.5, 0.06, 66]];

  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      {/* themed background (light tint of the contrast colour) */}
      <AbsoluteFill style={{ background: `linear-gradient(155deg, ${tint(c, 0.84)} 0%, #FFFFFF 66%)` }} />
      <svg width={width} height="100%" style={{ position: "absolute" }}>
        {floaters.map((o, k) => {
          const cx = o[0] * width + Math.sin(frame / fps + k) * 22;
          const cy = o[1] * 1080 + Math.cos(frame / fps + k) * 18;
          const r = o[2] as number;
          if (shapeKind === 0) return <circle key={k} cx={cx} cy={cy} r={r} fill={c} opacity={0.07} />;
          if (shapeKind === 2) return <rect key={k} x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r * 0.4} fill={c} opacity={0.06} transform={`rotate(${(frame / fps) * 6 + k * 30} ${cx} ${cy})`} />;
          const pts = Array.from({ length: 10 }).map((_, j) => {
            const ang = (Math.PI / 5) * j - Math.PI / 2;
            const rr = j % 2 === 0 ? r : r * 0.45;
            return `${cx + rr * Math.cos(ang)},${cy + rr * Math.sin(ang)}`;
          }).join(" ");
          return <polygon key={k} points={pts} fill={c} opacity={0.07} transform={`rotate(${(frame / fps) * 8 + k * 24} ${cx} ${cy})`} />;
        })}
      </svg>

      <AbsoluteFill style={{ transform: enterT, opacity: e }}>
        {/* SPOKEN SOUND (above) — clear of the persistent title pill */}
        <div style={{ position: "absolute", top: 118, left: 0, width, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 22, alignItems: "baseline" }}>
            <Tok i={0} text={item.letter} size={64} />
            <Tok i={1} text="says" size={56} />
          </div>
          <div style={{ display: "flex", gap: 26 }}>
            <Tok i={2} text={item.soundToken} size={78} />
            <Tok i={3} text={item.soundToken} size={78} />
            <Tok i={4} text={item.soundToken} size={78} />
          </div>
        </div>

        {/* MAIN ROW: self-drawing case pair + word image */}
        <div style={{ position: "absolute", top: 292, left: 0, width, height: 300, display: "flex", alignItems: "center", justifyContent: "center", gap: 90 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, transform: `translateY(${bob(frame, fps, 7, 2.8)}px)` }}>
            <TraceGlyph char={item.letter} color={c} box={278} progress={drawP} />
            <TraceGlyph char={lower} color={c} box={182} progress={lowerP} />
          </div>
          <div
            style={{
              width: 300,
              height: 300,
              transform: `scale(${imgIn * imgPulse}) translateY(${bob(frame, fps, 7, 2.4, 1)}px)`,
              background: "#fff",
              borderRadius: 38,
              border: `10px solid ${ic}`,
              boxShadow: `0 22px 56px ${ic}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 22,
            }}
          >
            <Img src={staticFile(`letters/${item.image}.png`)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          </div>
        </div>

        {/* "A for Ant" — below the row, in the WORD's own colour (distinct from the sound line) */}
        <div style={{ position: "absolute", top: 612, left: 0, width, display: "flex", justifyContent: "center", gap: 24, alignItems: "baseline" }}>
          <Tok i={5} text={item.letter} size={66} col={ic} />
          <Tok i={6} text="for" size={56} col={ic} />
          <Tok i={7} text={item.word} size={66} col={ic} />
        </div>

        {/* extra example words — small image tiles, each in its OWN image colour */}
        <div style={{ position: "absolute", top: 720, left: 0, width, display: "flex", justifyContent: "center", gap: 44 }}>
          {item.extras.map((w, k) => {
            const wc = wordColor(w);
            return (
              <div key={w} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: extra(k), transform: `scale(${0.72 + extra(k) * 0.28}) translateY(${(1 - extra(k)) * 16}px)` }}>
                <div style={{ width: 116, height: 116, background: "#fff", borderRadius: 24, border: `6px solid ${wc}`, boxShadow: `0 10px 24px ${wc}44`, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
                  <Img src={staticFile(`letters/${normKey(w)}.png`)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
                <div style={{ fontSize: 27, fontWeight: 800, color: wc }}>{w}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* confetti pops when the word is revealed */}
      <Confetti frame={frame} fps={fps} burstFrame={wordAt} origin={{ x: width / 2, y: 420 }} colors={[c, "#FF5252", "#FFD54F", "#4FC3F7", "#81C784"]} count={30} seed={item.letter.charCodeAt(0)} />
    </AbsoluteFill>
  );
};
