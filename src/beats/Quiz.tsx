import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { Stage } from "../components/Stage";
import { WordIllustration } from "../components/WordIllustration";
import { bob, pulse, wiggle } from "../lib/motion";
import { hex, palette } from "../data/tokens";

// A burst of paper-confetti particles that shoot up/out and fall with gravity.
const CONFETTI_COLORS = ["#FF5252", "#FFD54F", "#4FC3F7", "#81C784", "#BA68C8", "#FF8A65", "#4DD0E1"];
const PIECES = Array.from({ length: 46 }, (_, i) => {
  // deterministic pseudo-random so the render is stable
  const r = (s: number) => (Math.sin(i * 12.9898 + s * 78.233) * 43758.5453) % 1;
  const rand = (s: number) => Math.abs(r(s));
  return {
    angle: -Math.PI / 2 + (rand(1) - 0.5) * Math.PI * 1.1, // mostly upward
    speed: 620 + rand(2) * 520,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 14 + rand(3) * 18,
    spin: (rand(4) - 0.5) * 1400,
    wobble: rand(5) * Math.PI * 2,
    long: rand(6) > 0.5,
  };
});

const Confetti: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start) return null;
  const t = (frame - start) / fps; // seconds since burst
  const gravity = 1500;
  const life = 1.6;
  return (
    <div style={{ position: "absolute", top: "36%", left: "50%", width: 0, height: 0 }}>
      {PIECES.map((p, i) => {
        const x = Math.cos(p.angle) * p.speed * t + Math.sin(t * 6 + p.wobble) * 18;
        const y = Math.sin(p.angle) * p.speed * t + 0.5 * gravity * t * t;
        const opacity = interpolate(t, [0, life * 0.7, life], [1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              transform: `translate(${x}px, ${y}px) rotate(${p.spin * t}deg)`,
              width: p.long ? p.size * 0.5 : p.size,
              height: p.long ? p.size * 1.6 : p.size,
              background: p.color,
              borderRadius: 3,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};

// ⑦ "Your turn! ai or ay?" … "It's ai — it's in the middle!"
export const Quiz: React.FC<{
  data: PhonicsComparison;
  word: string;
  blanked: string;
  answer: number;
  revealAt?: number; // frames into the beat when the answer lights up
  focusA?: number; // frame to spotlight team 0 (as its letters are spoken)
  focusB?: number; // frame to spotlight team 1
  focusLen?: number;
  illoSize?: number; // size of the word illustration
}> = ({ data, word, blanked, answer, revealAt: revealAtProp, focusA, focusB, focusLen = 34, illoSize = 230 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const revealAt = revealAtProp ?? fps * 8;
  const revealed = frame >= revealAt;
  const focus0 = focusA != null && frame >= focusA && frame < focusA + focusLen;
  const focus1 = focusB != null && frame >= focusB && frame < focusB + focusLen;
  const anyFocus = focus0 || focus1;
  const wordIn = spring({ frame, fps, config: { damping: 12 } });
  const answerColor = hex(data.teams[answer].colorHex);
  // Suspense: cards wobble harder in the ~2s pause just before the reveal.
  const suspense = interpolate(frame, [revealAt - 60, revealAt], [1, 3.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Stage
      caption={revealed ? "it's in the middle! 🏠" : "ai or ay? 👀"}
      captionColor={answerColor}
      gap={60}
    >
      <div
        style={{
          fontSize: 74,
          fontWeight: 700,
          color: palette.ink,
          transform: `translateY(${bob(frame, fps, 8, 2)}px)`,
        }}
      >
        Your turn! 🤔
      </div>

      <WordIllustration word={word} size={illoSize} />


      <div
        style={{
          transform: `scale(${wordIn * (revealed ? pulse(frame - revealAt, fps, 0.05, 0.8) : 1)})`,
          fontSize: 200,
          fontWeight: 700,
          color: revealed ? answerColor : palette.ink,
          letterSpacing: 8,
        }}
      >
        {revealed ? word : blanked}
      </div>

      <div style={{ display: "flex", gap: 50 }}>
        {data.teams.map((team, i) => {
          const correct = i === answer;
          const lit = revealed && correct;
          const dim = revealed && !correct;
          const spot = !revealed && ((i === 0 && focus0) || (i === 1 && focus1)); // spoken now
          const faded = (dim ? true : anyFocus && !spot); // dim the other card
          const pop = lit ? spring({ frame: frame - revealAt, fps, config: { damping: 8 } }) : 1;
          const scale = lit ? 1 + pop * 0.14 : spot ? 1.18 : 1;
          const active = lit || spot; // filled + glowing
          return (
            <div
              key={team.marker}
              style={{
                transform: `scale(${scale}) rotate(${
                  lit || spot ? 0 : wiggle(frame, fps, 2 * suspense, 1.6 / suspense, i)
                }deg) translateY(${bob(frame, fps, 6, 2.2, i)}px)`,
                opacity: faded ? 0.32 : 1,
                background: active ? hex(team.colorHex) : palette.card,
                color: active ? "#fff" : hex(team.colorHex),
                border: `8px solid ${hex(team.colorHex)}`,
                borderRadius: 36,
                padding: "26px 64px",
                fontSize: 92,
                fontWeight: 700,
                boxShadow: active ? `0 16px 48px ${hex(team.colorHex)}88` : `0 16px 40px ${palette.cardShadow}`,
              }}
            >
              {team.marker} {lit ? "🎉" : ""}
            </div>
          );
        })}
      </div>

      <Confetti start={revealAt} />
    </Stage>
  );
};
