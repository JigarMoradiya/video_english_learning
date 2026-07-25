import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SVVowel, HINT_AUDIO_READY, HINT_DUR, HINT_REPEAT } from "../data/shortvowels";
import { sec } from "../lib/timing";
import { hex, tint, cardStroke, palette, font } from "../data/tokens";
import { bob, pulse } from "../lib/motion";
import { VowelFace } from "./Mouth";
import { CardBadge, badgeCorner } from "./BrandMarks";

const FPS = 30;
const ENTER = 16, SOUND_AT = 22, EX_GAP = 18;

// per-vowel Learn scene plan (self-contained audio + animation). Hint-aware: once the user
// records hint_<v>.mp3 (HINT_AUDIO_READY), the anchor waits for the spoken hint to finish.
export interface SVScenePlan { soundAt: number; hintAt: number; anchorAt: number; exStarts: number[]; dur: number }
export const svScenePlan = (v: SVVowel): SVScenePlan => {
  const soundAt = SOUND_AT;
  const hintAt = soundAt + sec(v.soundDur, FPS) + 10;
  const hintDur = HINT_AUDIO_READY ? sec(HINT_DUR[v.lower], FPS) : 0;
  const anchorAt = HINT_AUDIO_READY ? hintAt + hintDur + 12 : 74;
  const anchorEnd = anchorAt + sec(v.anchorDur, FPS);
  let cur = anchorEnd + 18;
  const exStarts = v.examples.map((e) => { const s = cur; cur += sec(e.dur, FPS) + EX_GAP; return s; });
  return { soundAt, hintAt, anchorAt, exStarts, dur: cur + 22 };
};
export const vowelSceneFrames = (v: SVVowel): number => svScenePlan(v).dur;

// word chip with the current vowel letter highlighted (colour + slightly bigger), app-style
const HiWord: React.FC<{ word: string; vowel: string; color: string; size: number }> = ({ word, vowel, color, size }) => (
  <span style={{ fontFamily: font.family, fontWeight: 800, lineHeight: 1 }}>
    {word.split("").map((ch, i) => (
      <span key={i} style={{ fontSize: ch.toLowerCase() === vowel ? size * 1.16 : size, color: ch.toLowerCase() === vowel ? color : "#42423f" }}>{ch}</span>
    ))}
  </span>
);

export const VowelScene: React.FC<{ item: SVVowel }> = ({ item }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(item.color);
  const anchorStroke = cardStroke(item.anchorColor, c);
  const p = svScenePlan(item);
  const e = interpolate(frame, [0, ENTER], [0, 1], { extrapolateRight: "clamp" });

  // audio windows (vowel sound + optional hint + anchor + examples) → the mouth "talks"
  const windows: [number, number][] = [
    [p.soundAt, 42], // hold the vowel mouth open longer than the clip
    ...(HINT_AUDIO_READY ? [[p.hintAt, sec(HINT_DUR[item.lower], fps) + 6] as [number, number]] : []),
    [p.anchorAt, sec(item.anchorDur, fps) + 6],
    ...p.exStarts.map((s, i) => [s, sec(item.examples[i].dur, fps) + 6] as [number, number]),
  ];
  const mouthOpen = Math.max(0, ...windows.map(([s, d]) => {
    const q = interpolate(frame, [s, s + 5, s + d - 6, s + d], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return q * (0.8 + 0.2 * Math.sin(frame * 1.6)); // talking wobble
  }));

  const soundLit = frame >= p.soundAt && frame < p.soundAt + 44;
  const letterPop = spring({ frame, fps, config: { damping: 12 } });
  // letter+face start CENTERED & large during the sound/hint beat, then slide to their left
  // home as the anchor + example chips cascade in on the right (fills the frame).
  const shift = interpolate(frame, [p.anchorAt - 22, p.anchorAt], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const leftShiftX = 540 * (1 - shift);
  const hintIn = interpolate(frame, [p.hintAt - 8, p.hintAt + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // the sound label BUZZES while the hint repeats the sound ("aaa, aaa, aaa")
  const [hrs, hre] = HINT_REPEAT[item.lower] ?? [0, 0];
  const buzzing = HINT_AUDIO_READY && frame >= p.hintAt + sec(hrs, fps) && frame < p.hintAt + sec(hre, fps);

  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <AbsoluteFill style={{ background: `linear-gradient(155deg, ${tint(item.color, 0.82)} 0%, #FFFFFF 66%)` }} />

      {/* audio */}
      <Sequence from={p.soundAt} durationInFrames={sec(item.soundDur, fps) + 6}><Audio src={staticFile(`audio/shortvowels/sound_${item.lower}.mp3`)} /></Sequence>
      {HINT_AUDIO_READY && <Sequence from={p.hintAt} durationInFrames={sec(HINT_DUR[item.lower], fps) + 6}><Audio src={staticFile(`audio/shortvowels/hint_${item.lower}.mp3`)} /></Sequence>}
      <Sequence from={p.anchorAt} durationInFrames={sec(item.anchorDur, fps) + 6}><Audio src={staticFile(`audio/shortvowels/${item.anchor}.mp3`)} /></Sequence>
      {item.examples.map((ex, i) => (
        <Sequence key={ex.word} from={p.exStarts[i]} durationInFrames={sec(ex.dur, fps) + 6}><Audio src={staticFile(`audio/shortvowels/${ex.word}.mp3`)} /></Sequence>
      ))}

      <AbsoluteFill style={{ opacity: e }}>
        {/* LEFT: big letter + talking face + sound label + hint (centred while alone, then slides) */}
        <div style={{ position: "absolute", left: 60, top: 0, width: 720, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, transform: `translateX(${leftShiftX}px) scale(${1 + 0.1 * (1 - shift)})` }}>
          <div style={{ fontSize: 172, fontWeight: 800, color: c, lineHeight: 1, transform: `scale(${letterPop}) translateY(${bob(frame, fps, 6, 2.6)}px)`, textShadow: `0 16px 36px ${c}44` }}>
            {item.letter}<span style={{ fontSize: 116 }}>{item.lower}</span>
          </div>
          <div style={{ transform: `translateY(${bob(frame, fps, 7, 2.4, 1)}px)` }}>
            <VowelFace shape={item.mouth} open={mouthOpen} size={286} color={c} frame={frame} fps={fps} />
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, color: soundLit || buzzing ? c : "#9a9a97", transform: `scale(${buzzing ? 1.14 + 0.06 * Math.sin(frame * 2.1) : soundLit ? 1.12 : 1}) rotate(${buzzing ? 3 * Math.sin(frame * 3.2) : 0}deg)`, textShadow: buzzing ? `0 10px 26px ${c}66` : "none" }}>“{item.sound}”</div>
          {/* mouth-shape hint (from the app) */}
          <div style={{ maxWidth: 620, textAlign: "center", fontSize: 34, fontWeight: 700, color: palette.inkSoft, background: "#FFFFFFcc", borderRadius: 22, padding: "12px 24px", boxShadow: `0 8px 22px ${c}22`, opacity: hintIn, transform: `translateY(${(1 - hintIn) * 10}px)` }}>{item.hint}</div>
        </div>

        {/* RIGHT: anchor (image + word) + 4 example word chips */}
        <div style={{ position: "absolute", left: 840, top: 0, width: 1020, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 48 }}>
          {/* anchor */}
          {(() => {
            const inA = spring({ frame: frame - p.anchorAt + 8, fps, config: { damping: 13 } });
            const pop = frame >= p.anchorAt ? pulse(frame - p.anchorAt, fps, 0.06, 0.7) : 1;
            return (
              <div style={{ display: "flex", alignItems: "center", gap: 34, transform: `scale(${inA * pop})`, opacity: inA }}>
                <div style={{ position: "relative", width: 236, height: 236, background: "#fff", borderRadius: 34, border: `9px solid ${anchorStroke}`, boxShadow: `0 18px 44px ${anchorStroke}44`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontSize: 128 }}>
                  {item.anchorImg ? <Img src={staticFile(`shortvowels/${item.anchor}.png`)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} /> : <span>{item.anchorEmoji}</span>}
                  {/* brand badge straddling the card corner (never over the picture) */}
                  <CardBadge size={58} corner={badgeCorner(item.anchor)} />
                </div>
                <HiWord word={item.anchor} vowel={item.lower} color={c} size={94} />
              </div>
            );
          })()}
          {/* 4 example word chips (like the app) */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 26, maxWidth: 940 }}>
            {item.examples.map((ex, i) => {
              const inE = spring({ frame: frame - p.exStarts[i] + 6, fps, config: { damping: 13 } });
              const lit = frame >= p.exStarts[i] && frame < p.exStarts[i] + sec(ex.dur, fps) + 12;
              return (
                <div key={ex.word} style={{ background: "#fff", borderRadius: 26, padding: "22px 40px", boxShadow: lit ? `0 14px 30px ${c}44` : "0 10px 24px rgba(30,36,56,0.12)", border: `4px solid ${lit ? c : tint(item.color, 0.55)}`, transform: `scale(${(0.7 + inE * 0.3) * (lit ? 1.06 : 1)})`, opacity: inE }}>
                  <HiWord word={ex.word} vowel={item.lower} color={c} size={62} />
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
