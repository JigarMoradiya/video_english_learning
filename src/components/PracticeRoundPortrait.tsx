import React from "react";
import { Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PracticeQ, RoundPlan, Clip } from "../data/practice";
import { sec } from "../lib/timing";
import { font } from "../data/tokens";
import { Confetti } from "./Confetti";
import { pulse } from "../lib/motion";
import { SpeakerGlyph } from "./LettersPinkFx";

// Portrait "listen & pick the letter" round. Part 2's motion signature: the option tiles
// FLIP in (rotateY) and the correct one bounces on reveal — distinct from part 1's
// grid-spotlight + sound-wave rings.
const GREEN = "#3BD07A";
const GOLD = "#FFC24A";
const CX = 540;

export const PracticeRoundPortrait: React.FC<{ q: PracticeQ; plan: RoundPlan; prompt: Clip; praise: Clip; index: number; total: number }> = ({ q, plan, prompt, praise, index, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const revealed = frame >= plan.revealAt;
  const playing = frame >= plan.soundAt && frame < plan.soundEnd + 6;
  const enter = spring({ frame, fps, config: { damping: 14 } });

  const OW = 240, GAP = 46, OY = 1180;
  const rowW = q.options.length * OW + (q.options.length - 1) * GAP;
  const optX = (i: number) => CX - rowW / 2 + i * (OW + GAP) + OW / 2;

  return (
    <>
      <Sequence from={plan.whichAt} durationInFrames={sec(prompt.dur, fps) + 6}><Audio src={staticFile(`audio/recognition/${prompt.audio}.mp3`)} /></Sequence>
      <Sequence from={plan.soundAt} durationInFrames={sec(q.soundDur, fps) + 6}><Audio src={staticFile(`audio/recognition/sound_${q.letter}.mp3`)} /></Sequence>
      <Sequence from={plan.revealAt} durationInFrames={sec(q.soundDur, fps) + 6}><Audio src={staticFile(`audio/recognition/sound_${q.letter}.mp3`)} /></Sequence>
      <Sequence from={plan.praiseAt} durationInFrames={sec(praise.dur, fps) + 8}><Audio src={staticFile(`audio/recognition/${praise.audio}.mp3`)} /></Sequence>

      {/* round counter */}
      <div style={{ position: "absolute", top: 300, left: 0, width: 1080, display: "flex", justifyContent: "center", fontFamily: font.family, opacity: enter }}>
        <div style={{ background: "rgba(255,255,255,0.18)", color: "#fff", borderRadius: 999, padding: "10px 34px", fontSize: 38, fontWeight: 800 }}>{index + 1} / {total}</div>
      </div>

      {/* prompt */}
      <div style={{ position: "absolute", top: 410, left: 0, width: 1080, textAlign: "center", fontFamily: font.family, fontSize: 64, fontWeight: 800, color: "#fff", padding: "0 100px", opacity: enter }}>{prompt.text}</div>

      {/* big speaker — the sound to identify (rich glyph: gradient cone + arcs + note) */}
      <div style={{ position: "absolute", left: CX - 180, top: 620, width: 360, height: 360 }}>
        <svg width={360} height={360} style={{ position: "absolute" }}>
          {playing && [0, 1, 2, 3].map((k) => { const t = (((frame - plan.soundAt) * 1.5 + k * 9) % 34) / 34; return <circle key={k} cx={180} cy={180} r={112 + t * 62} fill="none" stroke="#fff" strokeWidth={6} opacity={(1 - t) * 0.38} />; })}
        </svg>
        <div style={{ position: "absolute", left: 68, top: 68, width: 224, height: 224, borderRadius: "50%", background: "#fff", boxShadow: "0 14px 34px rgba(0,0,0,0.26)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${(playing ? pulse(frame, fps, 0.07, 0.5) : 1) * enter})` }}>
          <SpeakerGlyph size={196} active={playing} />
        </div>
      </div>

      {/* option tiles — FLIP in, correct one bounces on reveal */}
      {q.options.map((opt, i) => {
        const isCorrect = opt === q.letter;
        const flip = spring({ frame: frame - 8 - i * 5, fps, config: { damping: 13 } });
        const rot = (1 - flip) * -90; // rotateY flip-in
        const bounce = revealed && isCorrect ? pulse(frame - plan.revealAt, fps, 0.08, 0.6) : 1;
        const bg = revealed ? (isCorrect ? GREEN : "rgba(255,255,255,0.28)") : "#fff";
        const fg = revealed ? (isCorrect ? "#fff" : "rgba(255,255,255,0.65)") : "#8E2A59";
        const scl = (revealed ? (isCorrect ? 1.1 : 0.94) : 1) * flip * bounce;
        return (
          <div key={i} style={{ position: "absolute", left: optX(i) - OW / 2, top: OY, width: OW, height: OW, borderRadius: 40, background: bg, boxShadow: revealed && isCorrect ? `0 16px 40px ${GREEN}99` : "0 12px 30px rgba(0,0,0,0.24)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.family, fontSize: 148, fontWeight: 800, color: fg, transform: `perspective(900px) rotateY(${rot}deg) scale(${scl})`, opacity: revealed && !isCorrect ? 0.6 : 1 }}>{opt}</div>
        );
      })}

      {frame >= plan.praiseAt && (
        <div style={{ position: "absolute", left: 0, top: 1500, width: 1080, textAlign: "center", fontFamily: font.family, fontSize: 68, fontWeight: 800, color: GOLD, transform: `scale(${spring({ frame: frame - plan.praiseAt, fps, config: { damping: 10 } })})` }}>{praise.text}</div>
      )}

      <Confetti frame={frame} fps={fps} burstFrame={plan.revealAt} origin={{ x: CX, y: OY + OW / 2 }} colors={[GOLD, GREEN, "#FF8AB8", "#FFFFFF", "#4FC3F7"]} count={30} seed={q.letter.charCodeAt(0)} />
    </>
  );
};
