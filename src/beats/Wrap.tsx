import React from "react";
import { Img, spring, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { PhonicsComparison } from "../data/types";
import { Stage } from "../components/Stage";
import { bob, wiggle } from "../lib/motion";
import { hex, palette } from "../data/tokens";

// ⑧ Recap punchline + logo + Play Store / App Store badges.
// hi0/hi1 = beat-relative frames when team0 / team1 highlight in the recap;
// logoAt = when the app promo appears. Defaults are ai/ay's timing.
export const Wrap: React.FC<{
  data: PhonicsComparison;
  hi0?: number;
  hi1?: number;
  hiLen?: number;
  logoAt?: number;
  // false = this reel ends on StoreOutroPortrait instead, so the beat shows the recap
  // and the logo only. Defaults TRUE: oa_ow still ends on this block.
  store?: boolean;
  // Optional worked example under the chips: [word, target] per team, e.g.
  // ["coin","oi"] / ["boy","oy"]. The chips alone left the centre of the frame empty
  // while the line "oi goes in the middle, oy goes at the end" was being spoken — this
  // SHOWS the rule instead of only naming it. Omit and nothing changes.
  demo?: [string, string][];
}> = ({ data, hi0 = 30, hi1 = 90, hiLen = 60, logoAt = 210, store = true, demo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [ai, ay] = data.teams;

  const recap = spring({ frame, fps, config: { damping: 12 } });
  const logoIn = spring({ frame: frame - logoAt, fps, config: { damping: 12 } });
  const play = spring({ frame: frame - (logoAt + 40), fps, config: { damping: 10 } });
  const apple = spring({ frame: frame - (logoAt + 52), fps, config: { damping: 10 } });

  const stateFor = (start: number, other: number): "normal" | "active" | "dim" =>
    frame >= start && frame < start + hiLen ? "active" : frame >= other && frame < other + hiLen ? "dim" : "normal";

  return (
    <Stage gap={50}>
      <div style={{ display: "flex", gap: 40, transform: `scale(${recap})` }}>
        <RecapChip
          text={`${ai.marker} · ${ai.zoneHint} ${ai.zoneEmoji}`}
          color={hex(ai.colorHex)}
          phase={0}
          state={stateFor(hi0, hi1)}
        />
        <RecapChip
          text={`${ay.marker} · ${ay.zoneHint} ${ay.zoneEmoji}`}
          color={hex(ay.colorHex)}
          phase={1.5}
          state={stateFor(hi1, hi0)}
        />
      </div>

      {demo && (
        <div style={{ display: "flex", gap: 56 }}>
          {demo.map(([word, target], i) => {
            const team = data.teams[i];
            const st = stateFor(i === 0 ? hi0 : hi1, i === 0 ? hi1 : hi0);
            const k = word.toLowerCase().indexOf(target.toLowerCase());
            const lit = st === "active";
            const inn = spring({ frame: frame - (i === 0 ? hi0 : hi1) + 16, fps, config: { damping: 13 } });
            return (
              <div
                key={word}
                style={{
                  background: "#FFFFFF", borderRadius: 34,
                  border: `8px solid ${lit ? hex(team.colorHex) : "#D9DEE8"}`,
                  padding: "22px 34px 16px", opacity: st === "dim" ? 0.5 : 1,
                  transform: `scale(${(0.86 + 0.14 * inn) * (lit ? 1.06 : 1)}) translateY(${bob(frame, fps, 6, 2.5, i)}px)`,
                  boxShadow: lit ? `0 18px 40px ${hex(team.colorHex)}55` : "0 12px 28px rgba(30,36,56,0.14)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                }}
              >
                <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1.05, letterSpacing: 1 }}>
                  {word.split("").map((ch, ci) => {
                    const isTarget = ci >= k && ci < k + target.length;
                    return (
                      <span key={ci} style={{ color: isTarget ? hex(team.colorHex) : palette.ink, textDecoration: isTarget ? "underline" : "none", textDecorationThickness: 8, textUnderlineOffset: 10 }}>
                        {ch}
                      </span>
                    );
                  })}
                </div>
                <span style={{ fontSize: 30, fontWeight: 700, color: lit ? hex(team.colorHex) : "#8B98A5", letterSpacing: 1.4, textTransform: "uppercase" }}>
                  {team.zoneHint}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Mounted only when it is DUE. `scale(logoIn)` makes it invisible before logoAt but
          it still occupies 560px of flex layout, which pushed the whole column upward and
          left a gap under the demo cards on reels whose wrap ends before logoAt. */}
      {/* The logo belongs to the bespoke store block. On reels that pass store={false} the
          StoreOutroPortrait card carries the brand, and this one only flashed for a few
          frames before the card replaced it. */}
      {store && frame >= logoAt - 20 && (
      <Img
        src={staticFile("logo.png")}
        style={{
          width: 560,
          height: "auto",
          transform: `scale(${logoIn}) translateY(${bob(frame, fps, 10, 2.6)}px) rotate(${wiggle(
            frame,
            fps,
            1.5,
            2.4
          )}deg)`,
          filter: "drop-shadow(0 16px 30px rgba(30,36,56,0.2))",
        }}
      />)}

      {/* Reels that pass store={false} end on the shared StoreOutroPortrait instead — a
          bare logo + two badges was not the brand payoff the other videos end on. */}
      {store && (
        <>
          <div style={{ opacity: logoIn, fontSize: 52, fontWeight: 600, color: palette.ink }}>
            Download free 👇
          </div>
          <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
            <Img src={staticFile("playstore.png")} style={{ width: 330, height: "auto", transform: `scale(${play}) translateY(${bob(frame, fps, 5, 2.2)}px)` }} />
            <Img src={staticFile("appstore.png")} style={{ width: 330, height: "auto", transform: `scale(${apple}) translateY(${bob(frame, fps, 5, 2.2, 1.5)}px)` }} />
          </div>
        </>
      )}

    </Stage>
  );
};

const RecapChip: React.FC<{
  text: string;
  color: string;
  phase: number;
  state: "normal" | "active" | "dim";
}> = ({ text, color, phase, state }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = state === "active" ? 1.12 : 1;
  const opacity = state === "dim" ? 0.32 : 1;
  return (
    <div
      style={{
        transform: `translateY(${bob(frame, fps, 8, 2.2, phase)}px) scale(${scale})`,
        opacity,
        background: state === "dim" ? "#9AA3B2" : color,
        color: "#fff",
        fontSize: 54,
        fontWeight: 600,
        padding: "18px 40px",
        borderRadius: 999,
        boxShadow: state === "active" ? `0 12px 30px ${color}66` : "none",
      }}
    >
      {text}
    </div>
  );
};
