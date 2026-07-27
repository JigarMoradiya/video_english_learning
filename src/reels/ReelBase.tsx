import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { font } from "../data/tokens";
import { KidsBackground } from "../components/KidsBackground";
import { Scene, SceneKind } from "../components/Scene";
import { Watermark } from "../components/Watermark";

export type SfxCue = { from: number; name: string; vol: number; dur?: number };

// One watermark look per aspect, so every video matches its siblings:
// portrait = oo_9x16's 13% / 0.6 · landscape = the restrained 10% / 0.55.
const BrandMark: React.FC<{ corner: "tl" | "tr" | "bl" | "br" }> = ({ corner }) => {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  return <Watermark corner={corner} widthFrac={portrait ? 0.13 : 0.1} opacity={portrait ? 0.6 : 0.55} />;
};

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
  // Frame at which the store/download outro begins. The brand watermark runs from 0 up
  // to here and then gets out of the way, because that outro shows the app icon full
  // size and two logos on screen at once is forbidden. Omit for no watermark.
  logoUntil?: number;
  logoCorner?: "tl" | "tr" | "bl" | "br";
  children: React.ReactNode;
}> = ({ audio, hueShift, sfx, total, floater = "sparkle", scene = "none", background, logoUntil, logoCorner = "tl", children }) => {
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

      {/* LAST, so the scene content can't paint over it — OoWorld/WordStreet are
          full-frame layers and buried an earlier attempt completely. */}
      {logoUntil !== undefined && logoUntil > 0 && (
        <Sequence from={0} durationInFrames={logoUntil}>
          <BrandMark corner={logoCorner} />
        </Sequence>
      )}
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
