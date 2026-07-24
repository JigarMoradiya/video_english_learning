import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { LetterBuddy } from "../components/LetterBuddy";
import { DrawWord } from "../components/DrawWord";
import { WordIllustration } from "../components/WordIllustration";
import { Stage } from "../components/Stage";
import { bob, pulse, wiggle } from "../lib/motion";
import { hex, tint } from "../data/tokens";

// ④ Beat starts 16s. Word timings (from audio):
//   17.0–17.8 "Here's the secret," → 🤫 secret reveal
//   18.6–20.4 "little i is very shy" → the shy i appears
//   21.2 "she never sits at the end" → i walks to the end & scurries back
//   ~24 "so ai stays in the middle" → rule + rain + writing
export const ShyI: React.FC<{ data: PhonicsComparison }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ai = data.teams[0];
  const c = hex(ai.colorHex);

  // "Here's the secret," — a shushing 🤫 pops in (~30f), fades as the i arrives.
  const secretPop = spring({ frame: frame - 30, fps, config: { damping: 10 } });
  const secretVis = interpolate(frame, [30, 44, 72, 82], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "little i" (~18.6s = 79f) — the shy i springs in.
  const iIn = spring({ frame: frame - 79, fps, config: { damping: 12 } });

  // "she never sits at the end" (~155f): i drifts right then scurries back.
  const walkX =
    frame < 155
      ? 0
      : frame < 200
      ? interpolate(frame, [155, 200], [0, 230])
      : frame < 245
      ? interpolate(frame, [200, 245], [230, 0])
      : 0;
  const scurry = frame >= 200 && frame < 245;

  // "so ai stays in the middle" (~24s = 240f): rule + rain + word.
  const zoneIn = spring({ frame: frame - 240, fps, config: { damping: 12 } });

  // Before the rule/rain fill in below, drop the secret/i slot toward center
  // (otherwise it sits high with empty space beneath). Eases back up at ~245f.
  const dropY = interpolate(frame, [210, 245], [230, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Stage gap={40}>
      {/* shared top slot: secret 🤫 hands off to the shy i (no layout shift) */}
      <div style={{ position: "relative", width: 460, height: 330, transform: `translateY(${dropY}px)` }}>
        {/* Here's the secret 🤫 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: secretVis,
            transform: `scale(${0.6 + secretPop * 0.4}) translateY(${bob(frame, fps, 10, 2)}px)`,
          }}
        >
          <div style={{ fontSize: 260, position: "relative" }}>
            🤫
            <div style={{ position: "absolute", top: 0, right: -50, fontSize: 110, transform: `scale(${pulse(frame, fps, 0.15, 0.8)})` }}>✨</div>
          </div>
        </div>

        {/* the shy little i */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: iIn,
            transform: `translateX(${walkX}px)`,
          }}
        >
          <div
            style={{
              position: "relative",
              transform: `scale(${iIn}) rotate(${scurry ? wiggle(frame, fps, 7, 0.5) : 0}deg)`,
            }}
          >
            <LetterBuddy text="i" colorHex={ai.colorHex} size={200} />
            <div
              style={{
                position: "absolute",
                top: -66,
                left: "50%",
                transform: `translateX(-50%) translateY(${bob(frame, fps, 8, 2)}px)`,
                fontSize: 104,
              }}
            >
              🙈
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          opacity: zoneIn,
          transform: `scale(${zoneIn})`,
          background: tint(ai.colorHex, 0.86),
          border: `8px solid ${c}`,
          borderRadius: 999,
          padding: "16px 44px",
          fontSize: 58,
          fontWeight: 600,
          color: c,
        }}
      >
        🏠 hides in the MIDDLE
      </div>

      <div style={{ opacity: zoneIn }}>
        <WordIllustration word="rain" size={260} delay={240} />
      </div>

      <div style={{ opacity: zoneIn }}>
        <DrawWord blanked="r__n" team={ai} size={165} startAt={256} drawFrames={56} />
      </div>
    </Stage>
  );
};
