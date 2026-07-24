import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "../data/tokens";
import wordTimings from "../data/word_timings.json";

const TIMINGS = wordTimings as { word: string; start: number; end: number }[];

// Full-sentence subtitles synced to the narration, with a karaoke word-highlight
// that advances with audio progress. [start,end] in seconds.
// (No caption on the closing app-promo line — per request.)
const LINES: { start: number; end: number; text: string }[] = [
  { start: 1, end: 7, text: "Meet ai and ay — two best friends who make the same sound!" },
  { start: 7, end: 11, text: "They both say… ayyy! Like in rain… and play!" },
  { start: 11, end: 16, text: "But if they sound the same… how do you know which one to use?" },
  { start: 16, end: 21, text: "Here's the secret — little i is very shy." },
  { start: 21, end: 27, text: "She never sits at the end of a word, so ai stays in the middle." },
  { start: 27, end: 35, text: "But y is brave — y loves being last! So ay goes at the end." },
  { start: 35, end: 38, text: "Let's try some more words!" },
  { start: 38, end: 43, text: "Snail… train… ai is in the middle." },
  { start: 43, end: 48, text: "Play… stay… ay is at the end!" },
  { start: 48, end: 56, text: "Now it's your turn! The word… ai or ay?" },
  { start: 56, end: 60, text: "It's ai — because it's in the middle!" },
  { start: 60, end: 67, text: "Remember: ai in the middle, ay at the end. Easy, right?" },
];

export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const line = LINES.find((l) => t >= l.start && t < l.end);
  if (!line) return null;

  const words = line.text.split(" ");
  // Drive the highlight from REAL spoken word timings (faster-whisper).
  // Map each displayed word to a transcribed word in this line's window.
  const win = TIMINGS.filter((w) => w.start >= line.start - 0.25 && w.start < line.end);
  const startForWord = (i: number): number => {
    if (win.length === 0) return line.start + (i / words.length) * (line.end - line.start);
    return win[Math.min(win.length - 1, Math.round((i * win.length) / words.length))].start;
  };
  let activeIdx = -1;
  for (let i = 0; i < words.length; i++) if (t >= startForWord(i)) activeIdx = i;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 600,
        left: 90,
        right: 90,
        display: "flex",
        justifyContent: "center",
        fontFamily: font.family,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          textAlign: "center",
          background: "rgba(20,24,38,0.82)",
          fontSize: 46,
          fontWeight: 500,
          lineHeight: 1.3,
          padding: "20px 34px",
          borderRadius: 28,
        }}
      >
        {words.map((w, i) => {
          const spoken = i < activeIdx;
          const active = i === activeIdx;
          return (
            <span
              key={i}
              style={{
                color: active ? "#FFD54F" : spoken ? "#FFFFFF" : "rgba(255,255,255,0.45)",
                fontWeight: active ? 700 : 500,
              }}
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};
