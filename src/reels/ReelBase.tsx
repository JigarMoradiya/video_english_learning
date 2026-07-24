import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { font } from "../data/tokens";
import { KidsBackground } from "../components/KidsBackground";
import { Scene, SceneKind } from "../components/Scene";

export type SfxCue = { from: number; name: string; vol: number; dur?: number };

// Shared shell for every reel: home-style background, the card's narration, the
// soft music bed, and its SFX cues. The per-card <Sequence> beats go in children.
// Everything a reel needs that is NOT card-specific lives here.
export const ReelBase: React.FC<{
  audio: string; // e.g. "audio/ai_ay.mp3"
  hueShift: number;
  sfx: SfxCue[];
  total: number; // total frames (for the music fade-out)
  floater?: "sparkle" | "bubble" | "wave";
  scene?: SceneKind;
  background?: React.ReactNode; // opt-in override (e.g. landscape CkBackground); default = KidsBackground
  children: React.ReactNode;
}> = ({ audio, hueShift, sfx, total, floater = "sparkle", scene = "none", background, children }) => {
  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      {background ?? <KidsBackground hueShift={hueShift} floater={floater} />}
      <Scene kind={scene} />
      <Audio src={staticFile(audio)} />

      {/* soft ambient music bed, far under the narration */}
      <Audio
        src={staticFile("music_bed.mp3")}
        loop
        volume={(f) =>
          interpolate(f, [0, 20, total - 40, total], [0, 0.11, 0.11, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />

      {/* sound effects, timed to the narration + key visual hits */}
      {sfx.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.dur ?? 45}>
          <Audio src={staticFile(`sfx/${s.name}.mp3`)} volume={s.vol} />
        </Sequence>
      ))}

      {children}
    </AbsoluteFill>
  );
};

// Helper to lay out back-to-back beats. Returns {from,durationInFrames} per call.
export const beatTimeline = () => {
  let from = 0;
  return (len: number) => {
    const start = from;
    from += len;
    return { from: start, durationInFrames: len };
  };
};
