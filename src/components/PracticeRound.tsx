import React from "react";
import { Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PracticeQ, RoundPlan, Clip } from "../data/practice";
import { sec } from "../lib/timing";
import { palette, font } from "../data/tokens";
import { Confetti } from "./Confetti";

// One play-along quiz round: prompt ("Which letter says…?" / "Can you find…?" / …) → sound
// plays → 3 lowercase options → think → the correct one lights GREEN, sound replays + a
// praise line. Prompt + praise vary per round. Self-contained (renders its own audio).
const PURPLE = "#8E24AA";
const GREEN = "#43A047";

export const PracticeRound: React.FC<{ q: PracticeQ; plan: RoundPlan; prompt: Clip; praise: Clip }> = ({ q, plan, prompt, praise }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const win = (a: number, b: number) => frame >= a && frame < b;

  const revealed = frame >= plan.revealAt;
  const soundDurF = sec(q.soundDur, fps);
  const playing = win(plan.soundAt, plan.soundEnd) || win(plan.revealAt, plan.revealAt + soundDurF);
  const asking = win(plan.whichAt, plan.whichAt + sec(prompt.dur, fps));

  const enter = spring({ frame, fps, config: { damping: 14 } });
  const btnScale = (playing ? 1 + 0.08 * Math.sin(frame * 0.9) : 1) * enter;

  // 3 option tiles, centred
  const TW = 200, GAP = 74;
  const rowW = q.options.length * TW + (q.options.length - 1) * GAP;
  const startX = (width - rowW) / 2;
  const correctCX = startX + q.options.indexOf(q.letter) * (TW + GAP) + TW / 2;

  return (
    <>
      {/* audio (prompt + sound + replay + praise all vary per round) */}
      <Sequence from={plan.whichAt} durationInFrames={sec(prompt.dur, fps) + 6}><Audio src={staticFile(`audio/recognition/${prompt.audio}.mp3`)} /></Sequence>
      <Sequence from={plan.soundAt} durationInFrames={soundDurF + 4}><Audio src={staticFile(`audio/recognition/sound_${q.letter}.mp3`)} /></Sequence>
      <Sequence from={plan.revealAt} durationInFrames={soundDurF + 4}><Audio src={staticFile(`audio/recognition/sound_${q.letter}.mp3`)} /></Sequence>
      <Sequence from={plan.praiseAt} durationInFrames={sec(praise.dur, fps) + 8}><Audio src={staticFile(`audio/recognition/${praise.audio}.mp3`)} /></Sequence>

      {/* prompt (matches the spoken line) */}
      <div style={{ position: "absolute", top: 150, left: 0, width, textAlign: "center", fontFamily: font.family, fontSize: 66, fontWeight: 800, color: asking ? PURPLE : palette.ink, opacity: enter, transform: `scale(${asking ? 1.04 : 1})` }}>
        {prompt.text}
      </div>

      {/* listen button (ripples while the sound plays) */}
      <svg width={520} height={300} viewBox="0 0 520 300" style={{ position: "absolute", left: width / 2 - 260, top: 300 }}>
        {playing && [0, 1, 2].map((i) => {
          const t = (((frame * 1.3) + i * 10) % 30) / 30;
          return <circle key={i} cx={260} cy={150} r={92 + t * 66} fill="none" stroke={PURPLE} strokeWidth={5} opacity={(1 - t) * 0.35} />;
        })}
        <g transform={`translate(260 150) scale(${btnScale})`}>
          <circle cx={0} cy={0} r={88} fill={PURPLE} />
          <path d="M-30 -14 h-14 a4 4 0 0 0 -4 4 v20 a4 4 0 0 0 4 4 h14 l22 20 v-68 z" fill="#fff" />
          <path d="M18 -18 a26 26 0 0 1 0 36" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" />
          <path d="M30 -30 a44 44 0 0 1 0 60" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={playing ? 1 : 0.5} />
        </g>
      </svg>

      {/* option tiles */}
      {q.options.map((opt, i) => {
        const cx = startX + i * (TW + GAP) + TW / 2;
        const isCorrect = opt === q.letter;
        const appear = spring({ frame: frame - plan.soundAt - i * 3, fps, config: { damping: 13 } });
        const think = !revealed && frame >= plan.soundEnd ? 1 + 0.04 * Math.sin(frame * 0.5 + i) : 1;
        const bg = revealed ? (isCorrect ? GREEN : "#EDEFF4") : "#FFFFFF";
        const fg = revealed ? (isCorrect ? "#fff" : "rgba(30,36,56,0.4)") : palette.ink;
        const scale = (revealed ? (isCorrect ? interpolate(frame, [plan.revealAt, plan.revealAt + 8], [1, 1.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0.94) : think) * appear;
        const op = revealed && !isCorrect ? 0.5 : 1;
        return (
          <div key={i} style={{ position: "absolute", left: cx - TW / 2, top: 620, width: TW, height: TW, borderRadius: 28, background: bg, boxShadow: revealed && isCorrect ? `0 16px 40px ${GREEN}66` : "0 10px 26px rgba(30,36,56,0.12)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${scale})`, opacity: op * appear, fontFamily: font.family }}>
            <span style={{ fontSize: 120, fontWeight: 800, color: fg, lineHeight: 1 }}>{opt}</span>
          </div>
        );
      })}

      {/* praise badge on the correct tile (varies per round) */}
      {frame >= plan.praiseAt && (
        <div style={{ position: "absolute", left: correctCX, top: 542, transform: `translateX(-50%) scale(${spring({ frame: frame - plan.praiseAt, fps, config: { damping: 10 } })})`, whiteSpace: "nowrap", fontFamily: font.family, fontSize: 46, fontWeight: 800, color: GREEN }}>{praise.text}</div>
      )}

      <Confetti frame={frame} fps={fps} burstFrame={plan.revealAt} origin={{ x: correctCX, y: 720 }} colors={[GREEN, "#FF9F43", "#8E24AA", "#4FC3F7", "#FFD54F"]} count={26} seed={q.letter.charCodeAt(0)} />
    </>
  );
};
