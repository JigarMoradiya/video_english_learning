import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Watermark } from "../components/Watermark";
import { EndCard } from "../components/EndCard";
import {
  Beat, Board, Dots, Line, Panel, Stamp, Tile, Word, pop,
  INK, ORANGE, BLUE, RED, GREEN, YELLOW,
} from "../components/Sticker";

// ── REEL · DOUBLE THE LAST LETTER · 9:16 ─────────────────────────────────────
//
// Silent: no narration, no music baked in. That changes the design from the lesson
// videos — text is not a caption repeating a voice, it IS the teaching.
//
// The first cut of this reel was a small centred column of type on white, and it read
// as empty: 6% of the pixels were doing anything. What fills a 1080x1920 frame is not
// more confetti, it is COMPOSITION —
//
//   · a colour band per beat, full width, so each section owns the frame
//   · one hero word at ~200px, filling the width instead of sitting in the middle of it
//   · a label above and progress dots below, so the eye has somewhere to go
//   · the background dropped to pale tints so it can never compete
//
// One idea per beat; <Beat> hard-cuts so two can never share the frame.

const FPS = 30;
const S = (sec: number) => Math.round(sec * FPS);
export const RULE_DOUBLE_DURATION = S(38);
const RECAP = S(29.6);
// the recap simply HOLDS until the download card takes over. An empty beat between them
// was not "a gap in timing" — it was a hole in the reel.
const END = S(33.2);
const RECAP_END = END;

const CUES: [number, string, number][] = [
  [S(1.5), "boing", 0.34],
  [S(3.7), "chime_soft", 0.26],
  [S(7.2), "tick", 0.26], [S(9.9), "tick", 0.26], [S(12.6), "tick", 0.26],
  [S(15.2), "pop", 0.30], [S(17.0), "pop", 0.30], [S(18.8), "pop", 0.30],
  [S(20.6), "pop", 0.30], [S(22.4), "pop", 0.30],
  [S(24.4), "whoosh", 0.32], [S(26.2), "whoosh", 0.32], [S(28.0), "whoosh", 0.32],
  [S(30.1), "sparkle", 0.34],
];

const DOUBLES = ["off", "miss", "buzz", "cliff", "dress"];
const SINGLES = ["leaf", "feel", "sail"];


const Label: React.FC<{ text: string; color: string; at: number; y: number }> = ({ text, color, at, y }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const p = pop(frame, fps, at, 13);
  return (
    <div style={{ position: "absolute", left: 0, top: y, width, display: "flex", justifyContent: "center" }}>
      <div style={{
        padding: "22px 46px", borderRadius: 22, background: color, color: "#FFFFFF",
        border: `7px solid ${INK}`, boxShadow: `0 10px 0 ${INK}`,
        fontFamily: "inherit", fontWeight: 800, fontSize: 62, letterSpacing: 1,
        transform: `scale(${p}) translateY(${Math.sin((frame + at) / 30) * 5}px)`,
        whiteSpace: "nowrap",
      }}>{text}</div>
    </div>
  );
};

/** the hero row, centred on the frame's own middle */
const Hero: React.FC<{ children: React.ReactNode; y?: number }> = ({ children, y = 0.42 }) => {
  const { width, height } = useVideoConfig();
  return (
    <div style={{
      position: "absolute", left: 0, top: height * y, width,
      display: "flex", justifyContent: "center", alignItems: "center", gap: 16,
    }}>
      {children}
    </div>
  );
};

export const RuleDoubleReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { height, fps } = useVideoConfig();
  const exIdx = Math.floor((frame - S(14.9)) / S(1.8));
  const sgIdx = Math.floor((frame - S(24.1)) / S(1.8));

  return (
    <AbsoluteFill>
      <Board />

      {CUES.map(([at, file, vol], i) => (
        <Sequence key={i} from={at} durationInFrames={40}>
          <Audio src={staticFile(`sfx/${file}.mp3`)} volume={vol} />
        </Sequence>
      ))}

      {/* the rule, always on screen, so the reel says what it is about from frame 1 */}
      {frame < END && (
        // centred in the space LEFT OF THE LOGO, not on the frame — centring on the frame
        // put a 600px pill under a logo that starts at x819 however small the type got
        <div style={{ position: "absolute", left: 0, top: height * 0.055, width: "76%", display: "flex", justifyContent: "center" }}>
          <div style={{
            // sized to CLEAR the corner logo: the first version was 38 characters at 50px,
            // which needs ~1144px in a 1080 frame — cut at both edges and under the logo
            padding: "13px 26px", borderRadius: 999, background: INK, color: "#FFFFFF",
            fontFamily: "inherit", fontWeight: 800, fontSize: 33, letterSpacing: 0.8,
            transform: `translateY(${Math.sin(frame / 34) * 4}px)`, whiteSpace: "nowrap",
          }}>
            DOUBLE THE LAST LETTER
          </div>
        </div>
      )}

      {/* ① HOOK — the rule happens before it is named */}
      <Beat from={0} to={S(3.5)}>
        <Panel color={YELLOW} at={S(0.1)} top={height * 0.34} height={height * 0.30} skew={-3} />
        <Hero y={0.375}>
          <Tile ch="b" size={190} at={S(0.3)} />
          <Tile ch="e" size={190} at={S(0.5)} tone="yellow" />
          <Tile ch="l" size={190} at={S(0.7)} />
          {frame >= S(1.5) && <Tile ch="l" size={190} at={S(1.5)} tone="orange" shake={frame < S(2.0)} />}
        </Hero>
        {frame >= S(2.1) && (
          <div style={{ position: "absolute", left: 0, top: height * 0.66, width: "100%", display: "flex", justifyContent: "center" }}>
            <Line text="bell" size={130} at={S(2.1)} tone={ORANGE} />
          </div>
        )}
      </Beat>

      {/* ② TITLE */}
      <Beat from={S(3.5)} to={S(6.3)}>
        <Panel color={ORANGE} at={S(3.6)} top={height * 0.30} height={height * 0.34} skew={-4} />
        <div style={{ position: "absolute", left: 0, top: height * 0.335, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <Line text="DOUBLE" size={168} at={S(3.6)} tone="#FFFFFF" />
          <Line text="THE LAST LETTER" size={74} at={S(4.0)} tone="#FFFFFF" />
        </div>
        <Hero y={0.66}>
          {["f", "l", "s", "z"].map((c, i) => (
            <Tile key={c} ch={c} size={150} tone="orange" at={S(4.5) + i * 4} seed={i} />
          ))}
        </Hero>
      </Beat>

      {/* ③ THE THREE CHECKS */}
      <Beat from={S(6.3)} to={S(14.7)}>
        <Label text="WHEN?" color={BLUE} at={S(6.4)} y={height * 0.16} />
        {[
          ["1  CLAP", S(7.0), 0.32],
          ["SHORT  VOWEL", S(9.7), 0.48],
          ["ENDS  f  l  s  z", S(12.4), 0.64],
        ].map(([label, at, y], i) => {
          const a = at as number;
          if (frame < a) return null;
          return (
            <div key={i} style={{
              position: "absolute", left: 0, top: height * (y as number), width: "100%",
              display: "flex", justifyContent: "center", alignItems: "center", gap: 24,
            }}>
              <div style={{
                width: 104, height: 104, borderRadius: 26, background: YELLOW, border: `7px solid ${INK}`,
                boxShadow: `0 8px 0 ${INK}`, display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "inherit", fontWeight: 800, fontSize: 60, color: INK,
                transform: `scale(${pop(frame, fps, a, 12)})`,
              }}>{i + 1}</div>
              <Line text={label as string} size={72} at={a} />
              {frame >= a + S(0.5) && <Stamp kind="yes" at={a + S(0.5)} size={96} />}
            </div>
          );
        })}
      </Beat>

      {/* ④ EXAMPLES — the doubled ending owns the frame */}
      <Beat from={S(14.7)} to={S(23.9)}>
        <Panel color={GREEN} at={S(14.8)} top={height * 0.355} height={height * 0.26} skew={-3} />
        <Label text="SO  DOUBLE  IT" color={ORANGE} at={S(14.8)} y={height * 0.17} />
        {exIdx >= 0 && exIdx < DOUBLES.length && (() => {
          const w = DOUBLES[exIdx];
          const at = S(14.9) + exIdx * S(1.8);
          const size = w.length >= 5 ? 168 : 200;
          return (
            <Hero key={w} y={0.40}>
              <Word text={w} size={size} at={at} stagger={2}
                    tones={{ [w.length - 2]: "orange", [w.length - 1]: "orange" }} />
            </Hero>
          );
        })()}
        <div style={{ position: "absolute", left: 0, top: height * 0.66, width: "100%", display: "flex", justifyContent: "center" }}>
          <Stamp kind="yes" at={S(15.3)} size={120} />
        </div>
        <Dots total={DOUBLES.length} on={Math.max(0, Math.min(DOUBLES.length - 1, exIdx))} y={height * 0.78} />
      </Beat>

      {/* ⑤ NOT DOUBLED — the contrast that gives the rule meaning */}
      <Beat from={S(23.9)} to={S(30.0)}>
        <Panel color={BLUE} at={S(24.0)} top={height * 0.355} height={height * 0.26} skew={3} />
        <Label text="LONG  VOWEL  →  NO  DOUBLE" color={RED} at={S(24.0)} y={height * 0.17} />
        {sgIdx >= 0 && sgIdx < SINGLES.length && (() => {
          const w = SINGLES[sgIdx];
          const at = S(24.1) + sgIdx * S(1.8);
          return (
            <Hero key={w} y={0.40}>
              <Word text={w} size={200} at={at} stagger={2} tones={{ 1: "yellow", 2: "yellow" }} />
            </Hero>
          );
        })()}
        <div style={{ position: "absolute", left: 0, top: height * 0.66, width: "100%", display: "flex", justifyContent: "center" }}>
          <Stamp kind="no" at={S(24.5)} size={120} />
        </div>
        <Dots total={SINGLES.length} on={Math.max(0, Math.min(SINGLES.length - 1, sgIdx))} y={height * 0.78} />
      </Beat>

      {/* ⑥ RECAP — the content box IS the panel box, so it is centred by construction
          rather than by a hand-tuned top offset */}
      <Beat from={RECAP} to={RECAP_END}>
        <Panel color={ORANGE} at={RECAP + 3} top={height * 0.30} height={height * 0.36} skew={-3} />
        <div style={{
          position: "absolute", left: 0, top: height * 0.30, width: "100%", height: height * 0.36,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18,
        }}>
          {/* the three conditions, one per line and numbered — they were run together on
              two lines and read as prose rather than as a checklist */}
          {[["1", "ONE CLAP"], ["2", "SHORT VOWEL"], ["3", "ENDS  f  l  s  z"]].map(([n, t], i) => (
            <div key={n} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
              <div style={{
                width: 66, height: 66, borderRadius: 18, background: "#FFFFFF", border: `6px solid ${INK}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "inherit", fontWeight: 800, fontSize: 40, color: INK,
              }}>{n}</div>
              <Line text={t} size={58} at={RECAP + 3 + i * 4} tone="#FFFFFF" />
            </div>
          ))}
          <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
            <Tile ch="l" size={124} at={RECAP + 22} />
            <Tile ch="l" size={124} at={RECAP + 26} seed={2} />
          </div>
          <Line text="DOUBLE IT!" size={112} at={RECAP + 30} tone="#FFFFFF" />
        </div>
      </Beat>

      {/* ⑦ DOWNLOAD — no separate strip behind it: the card's own padded background IS
          the strip, so the gap above and below its contents is equal by construction */}
      <Beat from={END} to={RULE_DOUBLE_DURATION}>
        <EndCard at={END + 3} sub="More spelling rules inside" bg={YELLOW} ink={INK} />
      </Beat>

      {/* the corner logo stands down while the download card is up — the icon is the
          subject there, and showing the brand twice on one frame reads as a mistake */}
      {frame < END && <Watermark corner="tr" widthFrac={0.19} pad={54} opacity={0.9} />}
    </AbsoluteFill>
  );
};
