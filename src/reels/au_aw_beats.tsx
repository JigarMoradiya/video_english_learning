import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhonicsComparison } from "../data/types";
import { Beat } from "../lib/timing";
import { Band, Center, Pill } from "../components/LandscapeBeatKit";
import { hex, palette, font } from "../data/tokens";
import { bob } from "../lib/motion";

// ── "aw only ever says one sound" — the beat that pays off the ou/ow video ───
// ou/ow spent 85 seconds on ow having TWO sounds and no rule to pick between them. This
// card's good news is the opposite, so the beat is built as the same diagram inverted:
// ow forks into two, aw doesn't fork at all. A child who watched both gets a payoff; a
// child who didn't still reads it, because the fork is drawn, not just described.
//
// Staged across its six narration lines so nothing is held: the ow fork draws itself, the
// aw card arrives beside it, its single arrow lands, then "trust it" stamps.

export type OneSoundCues = {
  fork: number;     // "Remember ow, with its two different sounds?"
  notLike: number;  // "Aw is not like that."
  oneSound: number; // "Aw only ever says one sound."
  always: number;   // "Always aw."
  trust: number;    // "You can trust it every single time."
};

const OW = "F57F17"; // ou/ow's own ow colour — the callback has to look like that video

const Branch: React.FC<{ label: string; color: string; at: number; up: boolean }> = ({ label, color, at, up }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 13 } });
  const c = hex(color);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: s, transform: `translateX(${(1 - s) * -26}px)` }}>
      <svg width={70} height={54} style={{ overflow: "visible" }}>
        <path d={`M0 27 q 34 0 62 ${up ? -20 : 20}`} fill="none" stroke="#9E8FA8" strokeWidth={6} strokeLinecap="round" strokeDasharray="1 0" />
      </svg>
      <div style={{ background: "#fff", border: `5px solid ${c}`, color: c, borderRadius: 999, padding: "6px 24px", fontSize: 34, fontWeight: 700, whiteSpace: "nowrap" }}>
        {label}
      </div>
    </div>
  );
};

export const AwOneSound: React.FC<{ data: PhonicsComparison; beat: Beat; cues: OneSoundCues }> = ({ data, cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const awC = hex(data.teams[1].colorHex);
  const showAw = frame >= cues.notLike;
  const shiftS = spring({ frame: frame - cues.notLike, fps, config: { damping: 14 } });
  // before the aw card exists the ow diagram sits centred, then slides left to make room
  const shift = (1 - (showAw ? shiftS : 0)) * 300;
  const awIn = spring({ frame: frame - cues.notLike, fps, config: { damping: 12 } });
  const trustS = spring({ frame: frame - cues.trust, fps, config: { damping: 9 } });
  const beatPulse = frame >= cues.always ? 1 + 0.06 * Math.sin((frame / fps) * 7) : 1;

  const card = (text: string, c: string, dim: boolean, scale = 1) => (
    <div
      style={{
        background: "#fff", border: `9px solid ${c}`, borderRadius: 38, padding: "18px 46px",
        fontSize: 108, fontWeight: 700, color: c, fontFamily: font.family, lineHeight: 1,
        opacity: dim ? 0.55 : 1, transform: `scale(${scale}) translateY(${bob(frame, fps, 6, 2.4)}px)`,
        boxShadow: dim ? "0 12px 30px rgba(12,10,30,0.3)" : `0 20px 46px ${c}55`,
      }}
    >
      {text}
    </div>
  );

  return (
    <>
      <Band top={92}>
        <Pill size={48} color={palette.ink}>
          {frame >= cues.oneSound ? (
            <>
              <span style={{ color: awC }}>aw</span> always says ONE sound 🌅
            </>
          ) : (
            <>Good news! 🌅</>
          )}
        </Pill>
      </Band>

      <Center top={392}>
        <div style={{ display: "flex", alignItems: "center", gap: 78, transform: `translateX(${shift}px)`, fontFamily: font.family }}>
          {/* ow — forks into two, the way the last video showed */}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              {card("ow", hex(OW), showAw)}
              <div style={{ background: "#FFFFFFE8", border: `3px solid ${hex(OW)}`, color: hex(OW), borderRadius: 999, padding: "2px 16px", fontSize: 20, fontWeight: 700, whiteSpace: "nowrap" }}>
                as seen in ou ⚡ ow
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Branch label="long O" color="00897B" at={cues.fork} up />
              <Branch label="ow!" color={OW} at={cues.fork + 10} up={false} />
            </div>
          </div>

          {/* aw — one card, one arrow, no fork */}
          {showAw && (
            <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: awIn, transform: `translateX(${(1 - awIn) * 40}px)` }}>
              <div style={{ width: 5, height: 210, borderRadius: 3, background: "#9E8FA8", opacity: 0.5 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                {card("aw", awC, false, beatPulse)}
                {frame >= cues.oneSound && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, transform: `scale(${spring({ frame: frame - cues.oneSound, fps, config: { damping: 12 } })})` }}>
                    <svg width={70} height={30}><path d="M0 15 h 56" fill="none" stroke="#9E8FA8" strokeWidth={6} strokeLinecap="round" /><path d="M50 6 l 14 9 l -14 9" fill="none" stroke="#9E8FA8" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <div style={{ background: "#fff", border: `5px solid ${awC}`, color: awC, borderRadius: 999, padding: "6px 26px", fontSize: 38, fontWeight: 700, whiteSpace: "nowrap" }}>
                      aw &mdash; that's it
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Center>

      {/* "you can trust it every single time" */}
      {frame >= cues.trust && (
        <Center top={706}>
          <div style={{ background: "#2E7D32", color: "#fff", borderRadius: 999, padding: "12px 46px", fontSize: 44, fontWeight: 700, fontFamily: font.family, whiteSpace: "nowrap", transform: `scale(${0.6 + 0.4 * trustS}) translateY(${bob(frame, fps, 7, 3)}px)`, boxShadow: "0 16px 40px rgba(46,125,50,0.5)" }}>
            ✅ You can trust it every time
          </div>
        </Center>
      )}
    </>
  );
};
