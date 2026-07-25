import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SVVowel, HINT_AUDIO_READY, HINT_DUR, HINT_REPEAT } from "../data/shortvowels";
import { svScenePlan } from "./VowelScene";
import { sec } from "../lib/timing";
import { hex, font } from "../data/tokens";
import { bob, pulse } from "../lib/motion";
import { VowelFace } from "./Mouth";
import { ProgressDots } from "./PortraitFx";

const ENTER = 16;

// word chip content — vowel letter highlighted in the vowel colour (on the white card)
const HiWord: React.FC<{ word: string; vowel: string; color: string; size: number }> = ({ word, vowel, color, size }) => (
  <span style={{ fontFamily: font.family, fontWeight: 800, lineHeight: 1 }}>
    {word.split("").map((ch, i) => (
      <span key={i} style={{ fontSize: ch.toLowerCase() === vowel ? size * 1.16 : size, color: ch.toLowerCase() === vowel ? color : "#3A3A38" }}>{ch}</span>
    ))}
  </span>
);

// Portrait Learn scene: ONE purple theme; the vowel colour is an accent (letter glow, face
// ring, sound pill, chip highlight, top pager). The face sits on a WHITE disc so the mouth
// colours read exactly like the 16:9. Content rises as the anchor + word chips appear.
export const VowelScenePortrait: React.FC<{ item: SVVowel; idx: number }> = ({ item, idx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(item.color);
  const p = svScenePlan(item);
  const e = interpolate(frame, [0, ENTER], [0, 1], { extrapolateRight: "clamp" });

  const windows: [number, number][] = [
    [p.soundAt, 42],
    ...(HINT_AUDIO_READY ? [[p.hintAt, sec(HINT_DUR[item.lower], fps) + 6] as [number, number]] : []),
    [p.anchorAt, sec(item.anchorDur, fps) + 6],
    ...p.exStarts.map((s, i) => [s, sec(item.examples[i].dur, fps) + 6] as [number, number]),
  ];
  const mouthOpen = Math.max(0, ...windows.map(([s, d]) => {
    const q = interpolate(frame, [s, s + 5, s + d - 6, s + d], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return q * (0.8 + 0.2 * Math.sin(frame * 1.6));
  }));

  const soundLit = frame >= p.soundAt && frame < p.soundAt + 44;
  const letterPop = spring({ frame, fps, config: { damping: 12 } });
  const rise = interpolate(frame, [p.anchorAt - 22, p.anchorAt], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hintIn = interpolate(frame, [p.hintAt - 8, p.hintAt + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // the sound card BUZZES while the hint repeats the sound ("aaa, aaa, aaa")
  const [hrs, hre] = HINT_REPEAT[item.lower] ?? [0, 0];
  const buzzing = HINT_AUDIO_READY && frame >= p.hintAt + sec(hrs, fps) && frame < p.hintAt + sec(hre, fps);
  const buzzScale = buzzing ? 1.12 + 0.06 * Math.sin(frame * 2.1) : soundLit ? 1.1 : 1;
  const buzzRot = buzzing ? 3 * Math.sin(frame * 3.2) : 0;

  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      <ProgressDots idx={idx} />

      {/* audio (reused clips) */}
      <Sequence from={p.soundAt} durationInFrames={sec(item.soundDur, fps) + 6}><Audio src={staticFile(`audio/shortvowels/sound_${item.lower}.mp3`)} /></Sequence>
      {HINT_AUDIO_READY && <Sequence from={p.hintAt} durationInFrames={sec(HINT_DUR[item.lower], fps) + 6}><Audio src={staticFile(`audio/shortvowels/hint_${item.lower}.mp3`)} /></Sequence>}
      <Sequence from={p.anchorAt} durationInFrames={sec(item.anchorDur, fps) + 6}><Audio src={staticFile(`audio/shortvowels/${item.anchor}.mp3`)} /></Sequence>
      {item.examples.map((ex, i) => (
        <Sequence key={ex.word} from={p.exStarts[i]} durationInFrames={sec(ex.dur, fps) + 6}><Audio src={staticFile(`audio/shortvowels/${ex.word}.mp3`)} /></Sequence>
      ))}

      <AbsoluteFill style={{ opacity: e }}>
        {/* top block: letter + face(on white disc) + sound + hint. Spacious while centred,
            gap SHRINKS as it rises to the top (46 → 10). */}
        <div style={{ position: "absolute", top: 262, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 46 - rise * 36, transform: `translateY(${(1 - rise) * 250}px)` }}>
          <div style={{ fontSize: 150, fontWeight: 800, color: "#fff", lineHeight: 1, transform: `scale(${letterPop}) translateY(${bob(frame, fps, 6, 2.6)}px)`, textShadow: `0 10px 30px ${c}aa, 0 0 46px ${c}66` }}>
            {item.letter}<span style={{ fontSize: 100 }}>{item.lower}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 320, height: 320, borderRadius: "50%", background: "#fff", border: `9px solid ${c}`, boxShadow: `0 16px 40px rgba(0,0,0,0.28)`, transform: `translateY(${bob(frame, fps, 7, 2.4, 1)}px)` }}>
            <VowelFace shape={item.mouth} open={mouthOpen} size={276} color={c} frame={frame} fps={fps} />
          </div>
          <div style={{ background: "#fff", borderRadius: 24, padding: "8px 40px", fontSize: 66, fontWeight: 800, color: c, transform: `scale(${buzzScale}) rotate(${buzzRot}deg)`, boxShadow: buzzing ? `0 12px 32px ${c}99` : "0 10px 26px rgba(0,0,0,0.18)" }}>“{item.sound}”</div>
          <div style={{ maxWidth: 860, textAlign: "center", fontSize: 40, fontWeight: 700, color: "#43414f", background: "#fff", borderRadius: 22, padding: "14px 34px", boxShadow: "0 10px 26px rgba(0,0,0,0.16)", opacity: hintIn, transform: `translateY(${(1 - hintIn) * 10}px)` }}>{item.hint}</div>
        </div>

        {/* anchor flashcard */}
        {(() => {
          const inA = spring({ frame: frame - p.anchorAt + 8, fps, config: { damping: 13 } });
          const pop = frame >= p.anchorAt ? pulse(frame - p.anchorAt, fps, 0.05, 0.7) : 1;
          return (
            <div style={{ position: "absolute", top: 1040, left: 0, width: 1080, display: "flex", justifyContent: "center", transform: `scale(${inA * pop})`, opacity: inA }}>
              <div style={{ display: "flex", alignItems: "center", gap: 30, background: "#fff", borderRadius: 36, padding: "22px 44px 22px 22px", boxShadow: "0 18px 40px rgba(0,0,0,0.28)" }}>
                <div style={{ width: 200, height: 200, background: "#fff", borderRadius: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 118 }}>
                  {item.anchorImg ? <Img src={staticFile(`shortvowels/${item.anchor}.png`)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} /> : <span>{item.anchorEmoji}</span>}
                </div>
                <HiWord word={item.anchor} vowel={item.lower} color={c} size={92} />
              </div>
            </div>
          );
        })()}

        {/* 4 example word chips (2×2) */}
        <div style={{ position: "absolute", top: 1330, left: 0, width: 1080, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24, padding: "0 120px" }}>
          {item.examples.map((ex, i) => {
            const inE = spring({ frame: frame - p.exStarts[i] + 6, fps, config: { damping: 13 } });
            const lit = frame >= p.exStarts[i] && frame < p.exStarts[i] + sec(ex.dur, fps) + 12;
            return (
              <div key={ex.word} style={{ width: 360, textAlign: "center", background: "#fff", borderRadius: 26, padding: "22px 0", boxShadow: lit ? `0 14px 30px ${c}88` : "0 10px 22px rgba(0,0,0,0.22)", transform: `scale(${(0.7 + inE * 0.3) * (lit ? 1.06 : 1)})`, opacity: inE }}>
                <HiWord word={ex.word} vowel={item.lower} color={c} size={64} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
