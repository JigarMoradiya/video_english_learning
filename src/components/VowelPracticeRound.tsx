import React from "react";
import { Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SVPractice } from "../data/shortvowels";
import { sec } from "../lib/timing";
import { hex, palette, tint, cardStroke, font } from "../data/tokens";
import { Confetti } from "./Confetti";
import { CardBadge, badgeCorner, wordHasBadge } from "./BrandMarks";

const GREEN = "#43A047";
const PURPLE = "#8E24AA";

export interface Clip { audio: string; text: string; dur: number }
export interface VPPlan { promptAt: number; revealAt: number; wordAt: number; praiseAt: number; dur: number }

// On reveal we hear the missing vowel's SOUND first (e.g. "aaa"), then after a minor gap the
// whole WORD ("cat"), then after another gap the praise ("great job!").
export const vpPlan = (q: SVPractice, promptDur: number, praiseDur: number): VPPlan => {
  const promptAt = 6;
  const revealAt = promptAt + sec(promptDur, 30) + 40; // visuals fill the gap + vowel SOUND
  const wordAt = revealAt + sec(q.soundDur, 30) + 16; // minor gap → whole word
  const praiseAt = wordAt + sec(q.dur, 30) + 12; // gap → praise
  const dur = praiseAt + sec(praiseDur, 30) + 18;
  return { promptAt, revealAt, wordAt, praiseAt, dur };
};

// "Find the missing vowel": picture (left) + word with the vowel blanked + 3 vowel tiles.
// On reveal the correct vowel drops into the gap (green); then sound → word → praise + confetti.
export const VowelPracticeRound: React.FC<{ q: SVPractice; plan: VPPlan; prompt: Clip; praise: Clip }> = ({ q, plan, prompt, praise }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const c = hex(q.color);
  const picStroke = cardStroke(q.imageColor, c);
  const revealed = frame >= plan.revealAt;
  const asking = frame >= plan.promptAt && frame < plan.promptAt + sec(prompt.dur, fps);
  const enter = spring({ frame, fps, config: { damping: 14 } });

  // word letters row (right area), blank at q.blank
  const WORDCX = 1200, WORDY = 388, TW = 128, GAP = 20;
  const rowW = q.word.length * TW + (q.word.length - 1) * GAP;
  const slotX = (i: number) => WORDCX - rowW / 2 + i * (TW + GAP) + TW / 2;
  // options row
  const OPTY = 636, OW = 150, OGAP = 34;
  const orow = q.options.length * OW + (q.options.length - 1) * OGAP;
  const optX = (i: number) => WORDCX - orow / 2 + i * (OW + OGAP) + OW / 2;
  const correctIdx = q.options.indexOf(q.correct);
  // flying vowel: from correct option → blank slot on reveal
  const fly = interpolate(frame, [plan.revealAt, plan.revealAt + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fx = optX(correctIdx) + (slotX(q.blank) - optX(correctIdx)) * fly;
  const fy = OPTY + (WORDY - OPTY) * fly;

  return (
    <>
      <Sequence from={plan.promptAt} durationInFrames={sec(prompt.dur, fps) + 6}><Audio src={staticFile(`audio/shortvowels/${prompt.audio}.mp3`)} /></Sequence>
      <Sequence from={plan.revealAt} durationInFrames={sec(q.soundDur, fps) + 6}><Audio src={staticFile(`audio/shortvowels/${q.correctSound}.mp3`)} /></Sequence>
      <Sequence from={plan.wordAt} durationInFrames={sec(q.dur, fps) + 6}><Audio src={staticFile(`audio/shortvowels/${q.word}.mp3`)} /></Sequence>
      <Sequence from={plan.praiseAt} durationInFrames={sec(praise.dur, fps) + 8}><Audio src={staticFile(`audio/recognition/${praise.audio}.mp3`)} /></Sequence>

      {/* prompt */}
      <div style={{ position: "absolute", top: 140, left: 0, width, textAlign: "center", fontFamily: font.family, fontSize: 62, fontWeight: 800, color: asking ? PURPLE : palette.ink, opacity: enter }}>{prompt.text}</div>

      {/* word picture (left) */}
      <div style={{ position: "absolute", left: 640, top: "50%", transform: `translate(-50%,-50%) scale(${enter})`, width: 340, height: 340, background: "#fff", borderRadius: 40, border: `10px solid ${picStroke}`, boxShadow: `0 20px 50px ${picStroke}44`, display: "flex", alignItems: "center", justifyContent: "center", padding: 26 }}>
        <Img src={staticFile(`shortvowels/${q.word}.png`)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        {/* brand badge straddling the card corner (never over the picture) */}
        {wordHasBadge(q.word) && <CardBadge size={66} corner={badgeCorner(q.word)} />}
      </div>

      {/* word letters with blank */}
      {q.word.split("").map((ch, i) => {
        const isBlank = i === q.blank;
        const x = slotX(i);
        if (isBlank) {
          return (
            <div key={i} style={{ position: "absolute", left: x - TW / 2, top: WORDY - TW / 2, width: TW, height: TW, borderRadius: 20, border: `4px dashed ${revealed ? GREEN : "#C7CEDB"}`, background: revealed ? GREEN : "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.family, fontSize: 84, fontWeight: 800, color: "#fff", transform: `scale(${revealed ? interpolate(frame, [plan.revealAt + 8, plan.revealAt + 16], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1})` }}>
              {revealed && frame >= plan.revealAt + 8 ? q.correct : ""}
            </div>
          );
        }
        return (
          <div key={i} style={{ position: "absolute", left: x - TW / 2, top: WORDY - TW / 2, width: TW, height: TW, borderRadius: 20, background: "#fff", boxShadow: "0 8px 20px rgba(30,36,56,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.family, fontSize: 84, fontWeight: 800, color: palette.ink, opacity: enter }}>{ch}</div>
        );
      })}

      {/* vowel options */}
      {q.options.map((opt, i) => {
        const isCorrect = opt === q.correct;
        const inO = spring({ frame: frame - 6 - i * 3, fps, config: { damping: 13 } });
        const bg = revealed ? (isCorrect ? GREEN : "#EDEFF4") : "#fff";
        const fg = revealed ? (isCorrect ? "#fff" : "rgba(30,36,56,0.4)") : c;
        const sc = (revealed ? (isCorrect ? 1.1 : 0.94) : 1) * inO;
        const op = (revealed && !isCorrect ? 0.5 : 1) * inO;
        return (
          <div key={i} style={{ position: "absolute", left: optX(i) - OW / 2, top: OPTY - OW / 2, width: OW, height: OW, borderRadius: 26, background: bg, boxShadow: revealed && isCorrect ? `0 14px 34px ${GREEN}66` : "0 10px 24px rgba(30,36,56,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.family, fontSize: 92, fontWeight: 800, color: fg, transform: `scale(${sc})`, opacity: op }}>{opt}</div>
        );
      })}

      {/* flying vowel into the gap */}
      {revealed && fly < 1 && (
        <div style={{ position: "absolute", left: fx - 40, top: fy - 50, fontFamily: font.family, fontSize: 92, fontWeight: 800, color: GREEN }}>{q.correct}</div>
      )}

      {frame >= plan.praiseAt && (
        <div style={{ position: "absolute", left: WORDCX, top: 250, transform: `translateX(-50%) scale(${spring({ frame: frame - plan.praiseAt, fps, config: { damping: 10 } })})`, whiteSpace: "nowrap", fontFamily: font.family, fontSize: 46, fontWeight: 800, color: GREEN }}>{praise.text}</div>
      )}
      <Confetti frame={frame} fps={fps} burstFrame={plan.revealAt} origin={{ x: WORDCX, y: WORDY }} colors={[c, GREEN, "#FF9F43", "#4FC3F7", "#FFD54F"]} count={26} seed={q.word.charCodeAt(0)} />
    </>
  );
};
