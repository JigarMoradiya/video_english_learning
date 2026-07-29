import React from "react";
import { Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SVListen } from "../data/shortvowels";
import { sec } from "../lib/timing";
import { hex, palette, tint, cardStroke, font } from "../data/tokens";
import { CardBadge, badgeCorner, wordHasBadge } from "./BrandMarks";

export interface LWPlan { pStart: number[]; wordAt: number; dur: number }

export const lwPlan = (w: SVListen): LWPlan => {
  const pStart: number[] = [];
  let cur = 16;
  w.letters.forEach((_, i) => { pStart.push(cur); cur += sec(w.phonemeDurs[i], 30) + 12; });
  const wordAt = cur + 8;
  const dur = wordAt + sec(w.wordDur, 30) + 26;
  return { pStart, wordAt, dur };
};

// Sound-out: each letter lights up as its phoneme plays, then the whole word "reads"
// (all letters glow) + the picture pops. Self-contained audio (phonemes → word).
export const ListenWord: React.FC<{ w: SVListen; plan: LWPlan }> = ({ w, plan }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const c = hex(w.color);
  const picStroke = cardStroke(w.imageColor, c);
  const enter = spring({ frame, fps, config: { damping: 14 } });
  const read = frame >= plan.wordAt;
  const anyAudio = plan.pStart.some((s, i) => frame >= s && frame < s + sec(w.phonemeDurs[i], fps) + 4) || (read && frame < plan.wordAt + sec(w.wordDur, fps) + 4);

  const TW = 160, GAP = 26;
  const rowW = w.letters.length * TW + (w.letters.length - 1) * GAP;
  const startX = (width - rowW) / 2;

  return (
    <>
      {w.letters.map((ch, i) => (
        <Sequence key={i} from={plan.pStart[i]} durationInFrames={sec(w.phonemeDurs[i], fps) + 4}><Audio src={staticFile(`audio/shortvowels/sound_${ch}.mp3`)} /></Sequence>
      ))}
      <Sequence from={plan.wordAt} durationInFrames={sec(w.wordDur, fps) + 6}><Audio src={staticFile(`audio/shortvowels/${w.word}.mp3`)} /></Sequence>

      {/* speaker (pulses while audio plays) */}
      <svg width={200} height={200} viewBox="0 0 200 200" style={{ position: "absolute", left: width / 2 - 100, top: 150 }}>
        {anyAudio && [0, 1, 2].map((k) => { const t = (((frame * 1.3) + k * 10) % 30) / 30; return <circle key={k} cx={100} cy={100} r={62 + t * 44} fill="none" stroke={c} strokeWidth={4} opacity={(1 - t) * 0.3} />; })}
        <g transform={`translate(100 100) scale(${(anyAudio ? 1.08 : 1) * enter})`}>
          <circle cx={0} cy={0} r={58} fill={c} />
          <path d="M-20 -10 h-10 a3 3 0 0 0 -3 3 v14 a3 3 0 0 0 3 3 h10 l16 14 v-48 z" fill="#fff" />
          <path d="M12 -12 a18 18 0 0 1 0 24" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
        </g>
      </svg>

      {/* word letters — light up per phoneme, all glow on read */}
      {w.letters.map((ch, i) => {
        const s = plan.pStart[i];
        const active = frame >= s && frame < s + sec(w.phonemeDurs[i], fps) + 8;
        const done = frame >= s + sec(w.phonemeDurs[i], fps) + 8;
        const lit = read || active || done;
        const bg = read || active ? c : done ? tint(w.color, 0.55) : "#fff";
        const fg = read || active ? "#fff" : done ? c : "rgba(30,36,56,0.45)";
        const pop = active ? interpolate(frame, [s, s + 4], [1, 1.18], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : read ? 1.06 : 1;
        return (
          <div key={i} style={{ position: "absolute", left: startX + i * (TW + GAP), top: 470, width: TW, height: TW, borderRadius: 28, background: bg, boxShadow: lit ? `0 14px 34px ${c}55` : "0 10px 24px rgba(30,36,56,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.family, fontSize: 104, fontWeight: 800, color: fg, transform: `scale(${pop * enter})` }}>{ch}</div>
        );
      })}

      {/* picture pops when the word reads */}
      {read && (
        <div style={{ position: "absolute", left: "50%", top: 700, transform: `translateX(-50%) scale(${spring({ frame: frame - plan.wordAt, fps, config: { damping: 12 } })})`, width: 220, height: 220, background: "#fff", borderRadius: 30, border: `8px solid ${picStroke}`, boxShadow: `0 18px 44px ${picStroke}44`, display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
          <Img src={staticFile(`shortvowels/${w.word}.png`)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          {/* brand badge straddling the card corner (never over the picture) */}
          {wordHasBadge(w.word) && <CardBadge size={56} corner={badgeCorner(w.word)} />}
        </div>
      )}
    </>
  );
};
