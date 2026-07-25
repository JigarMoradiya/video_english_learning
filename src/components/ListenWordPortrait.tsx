import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SVListen } from "../data/shortvowels";
import { lwPlan, LWPlan } from "./ListenWord";
import { sec } from "../lib/timing";
import { pulse } from "../lib/motion";
import { hex, cardStroke, font } from "../data/tokens";

export { lwPlan };

// Portrait sound-out: teal stage, big speaker, letters light per phoneme, then the whole
// word reads + picture pops. Reuses lwPlan timing + clips.
export const ListenWordPortrait: React.FC<{ w: SVListen; plan: LWPlan }> = ({ w, plan }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = hex(w.color);
  const picStroke = cardStroke(w.imageColor, "#4DD0E1");
  const enter = spring({ frame, fps, config: { damping: 14 } });
  const read = frame >= plan.wordAt;
  const anyAudio = plan.pStart.some((s, i) => frame >= s && frame < s + sec(w.phonemeDurs[i], fps) + 4) || (read && frame < plan.wordAt + sec(w.wordDur, fps) + 4);

  const CX = 540, TW = 190, GAP = 30;
  const rowW = w.letters.length * TW + (w.letters.length - 1) * GAP;
  const startX = CX - rowW / 2;

  return (
    <AbsoluteFill style={{ fontFamily: font.family }}>
      {w.letters.map((ch, i) => (
        <Sequence key={i} from={plan.pStart[i]} durationInFrames={sec(w.phonemeDurs[i], fps) + 4}><Audio src={staticFile(`audio/shortvowels/sound_${ch}.mp3`)} /></Sequence>
      ))}
      <Sequence from={plan.wordAt} durationInFrames={sec(w.wordDur, fps) + 6}><Audio src={staticFile(`audio/shortvowels/${w.word}.mp3`)} /></Sequence>

      {/* big animated speaker */}
      <svg width={340} height={340} viewBox="0 0 340 340" style={{ position: "absolute", left: CX - 170, top: 320 }}>
        {anyAudio && [0, 1, 2, 3].map((k) => { const t = (((frame * 1.4) + k * 9) % 36) / 36; return <circle key={k} cx={170} cy={170} r={102 + t * 66} fill="none" stroke="#fff" strokeWidth={6} opacity={(1 - t) * 0.4} />; })}
        <g transform={`translate(170 170) scale(${(anyAudio ? pulse(frame, fps, 0.07, 0.5) : 1) * enter})`}>
          <circle cx={0} cy={0} r={98} fill="#fff" />
          <path d="M-32 -16 h-16 a4 4 0 0 0 -4 4 v24 a4 4 0 0 0 4 4 h16 l26 22 v-76 z" fill={c} />
          <path d="M20 -19 a29 29 0 0 1 0 38" fill="none" stroke={c} strokeWidth={9} strokeLinecap="round" />
          <path d="M38 -32 a52 52 0 0 1 0 64" fill="none" stroke={c} strokeWidth={9} strokeLinecap="round" opacity={anyAudio ? 1 : 0.4} />
        </g>
      </svg>

      {/* letters */}
      {w.letters.map((ch, i) => {
        const s = plan.pStart[i];
        const active = frame >= s && frame < s + sec(w.phonemeDurs[i], fps) + 8;
        const done = frame >= s + sec(w.phonemeDurs[i], fps) + 8;
        const bg = read || active ? "#fff" : done ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.16)";
        const fg = read || active || done ? c : "rgba(255,255,255,0.7)";
        const pop = active ? interpolate(frame, [s, s + 4], [1, 1.18], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : read ? 1.06 : 1;
        return (
          <div key={i} style={{ position: "absolute", left: startX + i * (TW + GAP), top: 760, width: TW, height: TW, borderRadius: 32, background: bg, boxShadow: read || active ? "0 16px 34px rgba(0,0,0,0.28)" : "0 10px 22px rgba(0,0,0,0.16)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, fontWeight: 800, color: fg, transform: `scale(${pop * enter})` }}>{ch}</div>
        );
      })}

      {/* picture pops on read */}
      {read && (
        <div style={{ position: "absolute", left: "50%", top: 1120, transform: `translateX(-50%) scale(${spring({ frame: frame - plan.wordAt, fps, config: { damping: 12 } })})`, width: 320, height: 320, background: "#fff", borderRadius: 38, border: `9px solid ${picStroke}`, boxShadow: "0 20px 46px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Img src={staticFile(`shortvowels/${w.word}.png`)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        </div>
      )}
    </AbsoluteFill>
  );
};
