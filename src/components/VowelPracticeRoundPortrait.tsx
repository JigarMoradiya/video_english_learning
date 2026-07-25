import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SVPractice } from "../data/shortvowels";
import { vpPlan, VPPlan, Clip } from "./VowelPracticeRound";
import { sec } from "../lib/timing";
import { hex, cardStroke, font } from "../data/tokens";
import { Confetti } from "./Confetti";

const GREEN = "#3BD07A";
const GOLD = "#FFD54F";

export { vpPlan };

// Portrait "find the missing vowel": deep-violet stage, picture on top, word puzzle + vowel
// tiles stacked below. Reuses vpPlan timing (vowel sound → word → praise) + Confetti.
export const VowelPracticeRoundPortrait: React.FC<{ q: SVPractice; plan: VPPlan; prompt: Clip; praise: Clip }> = ({ q, plan, prompt, praise }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(q.color);
  const picStroke = cardStroke(q.imageColor, "#B39DDB");
  const revealed = frame >= plan.revealAt;
  const asking = frame >= plan.promptAt && frame < plan.promptAt + sec(prompt.dur, fps);
  const enter = spring({ frame, fps, config: { damping: 14 } });

  const CX = 540;
  const WORDY = 940, TW = 150, GAP = 22;
  const rowW = q.word.length * TW + (q.word.length - 1) * GAP;
  const slotX = (i: number) => CX - rowW / 2 + i * (TW + GAP) + TW / 2;
  const OPTY = 1300, OW = 180, OGAP = 42;
  const orow = q.options.length * OW + (q.options.length - 1) * OGAP;
  const optX = (i: number) => CX - orow / 2 + i * (OW + OGAP) + OW / 2;
  const correctIdx = q.options.indexOf(q.correct);
  const fly = interpolate(frame, [plan.revealAt, plan.revealAt + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fx = optX(correctIdx) + (slotX(q.blank) - optX(correctIdx)) * fly;
  const fy = OPTY + (WORDY - OPTY) * fly;

  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>

      <Sequence from={plan.promptAt} durationInFrames={sec(prompt.dur, fps) + 6}><Audio src={staticFile(`audio/shortvowels/${prompt.audio}.mp3`)} /></Sequence>
      <Sequence from={plan.revealAt} durationInFrames={sec(q.soundDur, fps) + 6}><Audio src={staticFile(`audio/shortvowels/${q.correctSound}.mp3`)} /></Sequence>
      <Sequence from={plan.wordAt} durationInFrames={sec(q.dur, fps) + 6}><Audio src={staticFile(`audio/shortvowels/${q.word}.mp3`)} /></Sequence>
      <Sequence from={plan.praiseAt} durationInFrames={sec(praise.dur, fps) + 8}><Audio src={staticFile(`audio/recognition/${praise.audio}.mp3`)} /></Sequence>

      {/* prompt */}
      <div style={{ position: "absolute", top: 210, left: 0, width: 1080, textAlign: "center", fontSize: 60, fontWeight: 800, color: asking ? GOLD : "#fff", opacity: enter, padding: "0 60px" }}>{prompt.text}</div>

      {/* picture */}
      <div style={{ position: "absolute", top: 360, left: "50%", transform: `translateX(-50%) scale(${enter})`, width: 380, height: 380, background: "#fff", borderRadius: 40, border: `10px solid ${picStroke}`, boxShadow: "0 20px 50px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", padding: 28 }}>
        <Img src={staticFile(`shortvowels/${q.word}.png`)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
      </div>

      {/* word letters with blank */}
      {q.word.split("").map((ch, i) => {
        const isBlank = i === q.blank;
        const x = slotX(i);
        if (isBlank) {
          return (
            <div key={i} style={{ position: "absolute", left: x - TW / 2, top: WORDY - TW / 2, width: TW, height: TW, borderRadius: 24, border: `5px dashed ${revealed ? GREEN : "rgba(255,255,255,0.6)"}`, background: revealed ? GREEN : "rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 96, fontWeight: 800, color: "#fff", transform: `scale(${revealed ? interpolate(frame, [plan.revealAt + 8, plan.revealAt + 16], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1})` }}>
              {revealed && frame >= plan.revealAt + 8 ? q.correct : ""}
            </div>
          );
        }
        return (
          <div key={i} style={{ position: "absolute", left: x - TW / 2, top: WORDY - TW / 2, width: TW, height: TW, borderRadius: 24, background: "#fff", boxShadow: "0 10px 22px rgba(0,0,0,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 96, fontWeight: 800, color: "#3A3A38", opacity: enter }}>{ch}</div>
        );
      })}

      {/* vowel options */}
      {q.options.map((opt, i) => {
        const isCorrect = opt === q.correct;
        const inO = spring({ frame: frame - 6 - i * 3, fps, config: { damping: 13 } });
        const bg = revealed ? (isCorrect ? GREEN : "rgba(255,255,255,0.35)") : "#fff";
        const fg = revealed ? (isCorrect ? "#fff" : "rgba(255,255,255,0.6)") : c;
        const scl = (revealed ? (isCorrect ? 1.1 : 0.94) : 1) * inO;
        const op = (revealed && !isCorrect ? 0.6 : 1) * inO;
        return (
          <div key={i} style={{ position: "absolute", left: optX(i) - OW / 2, top: OPTY - OW / 2, width: OW, height: OW, borderRadius: 30, background: bg, boxShadow: revealed && isCorrect ? `0 14px 34px ${GREEN}88` : "0 10px 24px rgba(0,0,0,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 108, fontWeight: 800, color: fg, transform: `scale(${scl})`, opacity: op }}>{opt}</div>
        );
      })}

      {revealed && fly < 1 && (
        <div style={{ position: "absolute", left: fx - 46, top: fy - 56, fontSize: 108, fontWeight: 800, color: GREEN }}>{q.correct}</div>
      )}

      {frame >= plan.praiseAt && (
        <div style={{ position: "absolute", left: 0, top: 1560, width: 1080, textAlign: "center", transform: `scale(${spring({ frame: frame - plan.praiseAt, fps, config: { damping: 10 } })})`, fontSize: 64, fontWeight: 800, color: GOLD }}>{praise.text}</div>
      )}
      <Confetti frame={frame} fps={fps} burstFrame={plan.revealAt} origin={{ x: CX, y: WORDY }} colors={[c, GREEN, GOLD, "#4FC3F7", "#FF8A65"]} count={30} seed={q.word.charCodeAt(0)} />
    </AbsoluteFill>
  );
};
