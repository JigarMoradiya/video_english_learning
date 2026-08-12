import React from "react";
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "../data/tokens";
import { picFor } from "../data/word_pics";

// ── THE QUIZ FAIR ───────────────────────────────────────────────────────────
//
// The world for L6 Part 2 (practice). The lesson was a WALK down Word Family Lane; the
// practice is a GAME, so it happens at a fairground quiz booth at dusk — deep indigo sky,
// a string of warm bulbs, a cherry booth with a striped awning. Nothing in the library is
// indigo-fairground, so this reads as a new episode at a glance, and Mo & Zip return so it
// still reads as the same show.
//
//   · THE ANSWER BOARD mirrors the app's practice screen: picture, `?` + ending, and the
//     app's own three letter choices as carnival PADDLES.
//   · A right answer rings the bell and PRINTS A TICKET; tickets string across the booth
//     like bunting, so the score is a growing prize line, never a bar of empty boxes.

export const FAIR = {
  skyTop: "#1D2150",
  skyMid: "#33306E",
  skyBot: "#6D4A86",
  booth: "#C6403C",
  boothDark: "#93292B",
  counter: "#8A5A32",
  awningA: "#E9564E",
  awningB: "#FFF3DC",
  bulb: "#FFD98A",
  cream: "#FFF6E4",
  ink: "#241A2E",
  gold: "#F4C33F",
  good: "#3FBF7F",
  bad: "#E2564A",
  paddle: "#F8EBD2",
};

export const bands = (width: number, height: number) => {
  const wide = width > height;
  return {
    width, height, wide,
    bannerTop: Math.round(height * (wide ? 0.024 : 0.020)),
    bulbY: Math.round(height * (wide ? 0.095 : 0.075)),
    ticketY: Math.round(height * (wide ? 0.128 : 0.100)),
    contentTop: Math.round(height * (wide ? 0.295 : 0.205)),
    contentH: Math.round(height * (wide ? 0.410 : 0.420)),
    contentL: Math.round(width * 0.035),
    contentR: Math.round(width * (wide ? 0.680 : 0.965)),
    contentRFull: Math.round(width * 0.965),
    counterY: Math.round(height * (wide ? 0.760 : 0.680)),
    moX: Math.round(width * (wide ? 0.760 : 0.100)),
    zipX: Math.round(width * (wide ? 0.880 : 0.780)),
    charY: Math.round(height * (wide ? 0.590 : 0.740)),
    charH: Math.round(height * (wide ? 0.170 : 0.130)),
  };
};
export type B = ReturnType<typeof bands>;

export const pop = (frame: number, fps: number, at: number, damping = 13) =>
  spring({ frame: frame - at, fps, config: { damping, mass: 0.8, stiffness: 150 } });

export const Fixed: React.FC<{ b: B; children: React.ReactNode }> = ({ b, children }) => (
  <div style={{ position: "fixed", left: 0, top: 0, width: b.width, height: b.height }}>{children}</div>
);

export const FairWorld: React.FC<{ b: B; fireworks?: boolean }> = ({ b, fireworks = false }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = { width: b.width, height: b.height };
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${FAIR.skyTop} 0%, ${FAIR.skyMid} 52%, ${FAIR.skyBot} 100%)` }}>
      {/* stars */}
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={`s${i}`} style={{
          position: "absolute", left: `${(i * 149) % 100}%`, top: `${(i * 83) % 42}%`,
          width: 3 + (i % 3), height: 3 + (i % 3), borderRadius: "50%", background: "#FFF6D8",
          opacity: 0.25 + 0.5 * Math.abs(Math.sin((frame + i * 21) / 32)),
        }} />
      ))}
      {/* the bulb string */}
      <svg width={W} height={H * 0.10} style={{ position: "absolute", left: 0, top: b.bulbY - H * 0.045 }}>
        <path d={`M 0 6 Q ${W * 0.25} ${H * 0.055}, ${W * 0.5} ${H * 0.028} T ${W} 10`} stroke="rgba(255,246,216,0.5)" strokeWidth={4} fill="none" />
      </svg>
      {Array.from({ length: 11 }).map((_, i) => {
        const t = (i + 0.5) / 11;
        const y = b.bulbY + Math.sin(t * Math.PI) * -H * 0.012 + H * 0.012;
        const on = (Math.floor(frame / 14) + i) % 3 !== 0;
        return (
          <div key={`b${i}`} style={{
            position: "absolute", left: t * W - 9, top: y, width: 18, height: 24, borderRadius: "50% 50% 46% 46%",
            background: on ? FAIR.bulb : "#8A7A56",
            boxShadow: on ? `0 0 22px 7px rgba(255,217,138,0.45)` : "none",
          }} />
        );
      })}
      {/* fairground silhouettes: a big wheel far left */}
      <div style={{ position: "absolute", left: -W * 0.05, top: H * 0.16, width: W * 0.22, height: W * 0.22, borderRadius: "50%",
        border: "8px solid rgba(255,246,216,0.20)", transform: `rotate(${frame / 8}deg)` }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: "50%", top: "50%", width: "50%", height: 4, background: "rgba(255,246,216,0.16)",
            transformOrigin: "0 50%", transform: `rotate(${i * 60}deg)` }} />
        ))}
      </div>
      {/* a moon, high right */}
      <div style={{ position: "absolute", left: W * 0.845, top: H * 0.105, width: H * 0.062, height: H * 0.062,
        borderRadius: "50%", background: "#FFF6D8", boxShadow: "0 0 44px 14px rgba(255,246,216,0.35)" }} />
      <div style={{ position: "absolute", left: W * 0.856, top: H * 0.108, width: H * 0.050, height: H * 0.050,
        borderRadius: "50%", background: FAIR.skyMid }} />
      {/* a striped circus tent, far right silhouette */}
      <div style={{ position: "absolute", left: W * 0.78, top: b.counterY - H * 0.22, width: W * 0.20, height: H * 0.20, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "10%", bottom: 0, width: "80%", height: "72%",
          background: `repeating-linear-gradient(90deg, rgba(233,86,78,0.5) 0 22px, rgba(255,243,220,0.35) 22px 44px)`,
          borderRadius: "10px 10px 0 0" }} />
        <div style={{ position: "absolute", left: 0, bottom: "68%", width: 0, height: 0,
          borderLeft: `${W * 0.10}px solid transparent`, borderRight: `${W * 0.10}px solid transparent`,
          borderBottom: `${H * 0.075}px solid rgba(233,86,78,0.55)` }} />
        <div style={{ position: "absolute", left: "48%", bottom: "92%", width: 4, height: H * 0.02, background: "rgba(255,243,220,0.5)" }} />
      </div>
      {/* drifting balloons, behind everything, fading out below the banner */}
      {[0, 1, 2, 3].map((i) => {
        const speed = 1.1 + (i % 3) * 0.4;
        const span = H + 300;
        const y = H + 120 - ((frame * speed + i * 260) % span);
        const clear = Math.max(0, Math.min(1, (y - H * 0.16) / 160));
        const x = ((i * 263) % 92 + 4) / 100 * W + Math.sin((frame + i * 55) / 52) * 24;
        return (
          <div key={`bl${i}`} style={{ position: "absolute", left: x, top: y, opacity: clear * 0.7 }}>
            <div style={{ width: 42, height: 52, borderRadius: "50% 50% 46% 46%",
              background: ["#E9808A", "#8FD3E8", "#F4C33F", "#9FDE9A"][i], border: `3px solid ${FAIR.ink}` }} />
            <div style={{ width: 2, height: 34, background: "rgba(255,246,216,0.5)", marginLeft: 20 }} />
          </div>
        );
      })}
      {/* ground + the booth counter */}
      <div style={{ position: "absolute", left: 0, top: b.counterY, width: W, height: H - b.counterY,
        background: `linear-gradient(#3A2B4E, #241A2E)` }} />
      <div style={{ position: "absolute", left: 0, top: b.counterY - H * 0.028, width: W, height: H * 0.06,
        background: `linear-gradient(${FAIR.counter}, #6B4222)`, borderTop: `6px solid ${FAIR.ink}`, borderBottom: `6px solid ${FAIR.ink}` }} />
      {/* awning under the banner */}
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: b.bulbY - H * 0.030, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, bottom: 0, width: W, height: "58%",
          background: `repeating-linear-gradient(90deg, ${FAIR.awningA} 0 ${W * 0.06}px, ${FAIR.awningB} ${W * 0.06}px ${W * 0.12}px)`,
          borderBottom: `6px solid ${FAIR.ink}`, opacity: 0.9 }} />
      </div>
      {fireworks && [0, 1, 2].map((k) => {
        const t = ((frame + k * 26) % 70) / 70;
        const cx = W * (0.25 + k * 0.25), cy = H * 0.20;
        return (
          <div key={`f${k}`}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{
                position: "absolute", left: cx + Math.cos((i / 10) * Math.PI * 2) * t * W * 0.09,
                top: cy + Math.sin((i / 10) * Math.PI * 2) * t * W * 0.09,
                width: 9, height: 9, borderRadius: "50%",
                background: [FAIR.gold, FAIR.awningA, "#8FD3E8"][k], opacity: Math.max(0, 1 - t),
              }} />
            ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** THE BOOTH — posts, beam and a small awning built AROUND the content column, so the
 *  board hangs in a real structure instead of floating in the sky. */
export const Booth: React.FC<{ b: B }> = ({ b }) => {
  const frame = useCurrentFrame();
  const L = b.contentL - b.width * 0.014, R = b.contentR + b.width * 0.014;
  const beamY = b.contentTop - b.height * 0.052;
  const postW = b.width * 0.016;
  return (
    <>
      {[L, R - postW].map((x, i) => (
        <div key={i} style={{ position: "absolute", left: x, top: beamY, width: postW, height: b.counterY - beamY,
          background: `repeating-linear-gradient(180deg, ${FAIR.booth} 0 44px, ${FAIR.boothDark} 44px 88px)`,
          border: `4px solid ${FAIR.ink}`, boxSizing: "border-box" }} />
      ))}
      <div style={{ position: "absolute", left: L - 10, top: beamY, width: R - L + 20, height: b.height * 0.030,
        background: FAIR.booth, border: `5px solid ${FAIR.ink}`, boxSizing: "border-box", borderRadius: 8 }} />
      {/* scalloped awning off the beam */}
      <div style={{ position: "absolute", left: L - 10, top: beamY + b.height * 0.028, width: R - L + 20, display: "flex" }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: b.height * 0.024,
            background: i % 2 ? FAIR.awningB : FAIR.awningA,
            borderRadius: "0 0 50% 50%", border: `3px solid ${FAIR.ink}`, borderTop: "none", boxSizing: "border-box" }} />
        ))}
      </div>
      {/* the booth sign, swinging gently from the beam */}
      <div style={{ position: "absolute", left: (L + R) / 2 - b.width * 0.065, top: beamY - b.height * 0.012,
        transform: `rotate(${Math.sin(frame / 38) * 2}deg)`, transformOrigin: "50% 0%" }}>
        <div style={{ padding: `${b.height * 0.006}px ${b.width * 0.014}px`, background: FAIR.gold,
          border: `4px solid ${FAIR.ink}`, borderRadius: 10, fontFamily: font.family, fontWeight: 800,
          fontSize: b.height * 0.024, color: FAIR.ink, whiteSpace: "nowrap" }}>WORD FAMILY QUIZ</div>
      </div>
    </>
  );
};

// ── the ticket line: every answered word, strung like bunting ───────────────
export const Tickets: React.FC<{ b: B; words: string[]; final?: boolean }> = ({ b, words, final = false }) => {
  const frame = useCurrentFrame();
  if (!b.wide) {
    // portrait has no room for a running shelf beside the board — it only appears for
    // the final recap ("Look at your score" → "I am so proud of you"), all 14 at once,
    // across the top of the frame, with everything else pushed below it.
    if (!final) return null;
    const perRow = 5, rows = 3;
    const gridW = b.width * 0.92;
    const pitch = gridW / perRow;
    const slot = pitch * 0.82;
    const gridLeft = (b.width - gridW) / 2 + (pitch - slot) / 2;
    const gridTop = b.height * 0.150;
    const rowPitch = slot * 1.18 + b.height * 0.020;
    return (
      <>
        <div style={{
          position: "absolute", left: 0, top: gridTop - b.height * 0.050, width: b.width, textAlign: "center",
          fontFamily: font.family, fontWeight: 800, fontSize: b.height * 0.030, color: FAIR.gold,
          textShadow: "0 3px 0 rgba(0,0,0,0.45)",
        }}>⭐ {words.length} / 14</div>
        {Array.from({ length: 14 }).map((_, i) => {
          const r = Math.floor(i / perRow), c = i % perRow;
          const x = gridLeft + c * pitch, y = gridTop + r * rowPitch;
          const w = words[i];
          const src = w ? picFor(w) : null;
          return (
            <div key={i} style={{ position: "absolute", left: x, top: y, width: slot, height: slot * 1.18 }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: 10,
                border: `3px dashed rgba(255,246,216,${w ? 0 : 0.5})`,
                background: w ? "transparent" : "rgba(255,246,216,0.07)",
              }} />
              {!w && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: slot * 0.36, opacity: 0.45 }}>⭐</div>}
              {w && (
                <div style={{
                  position: "absolute", inset: 0, background: FAIR.cream,
                  border: `4px solid ${FAIR.ink}`, borderRadius: 10, boxSizing: "border-box",
                  boxShadow: `0 4px 0 ${FAIR.ink}`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
                  padding: slot * 0.06,
                  transform: `rotate(${Math.sin((frame + i * 30) / 46) * 2}deg)`,
                }}>
                  <div style={{ width: slot * 0.66, height: slot * 0.60, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {src && src.startsWith("img/")
                      ? <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      : <div style={{ fontSize: slot * 0.52, lineHeight: 1 }}>{src}</div>}
                  </div>
                  <div style={{ width: "100%", background: FAIR.gold, borderRadius: 5, textAlign: "center",
                    fontFamily: font.family, fontWeight: 800, fontSize: slot * 0.26, color: FAIR.ink }}>{w}</div>
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  }
  const X = b.width * 0.715, W2 = b.width * 0.250;
  const perRow = 5, rows = 3;
  const pitch = W2 / perRow;
  const slot = pitch * 0.82;
  const rowYs = [0.245, 0.360, 0.475].map((f) => b.height * f);
  return (
    <>
      {Array.from({ length: 14 }).map((_, i) => {
        const r = Math.floor(i / perRow), c = i % perRow;
        const x = X + c * pitch, y = rowYs[r];
        const w = words[i];
        const src = w ? picFor(w) : null;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: slot, height: slot * 1.18 }}>
            {/* the preset slot — visibly waiting */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: 10,
              border: `3px dashed rgba(255,246,216,${w ? 0 : 0.5})`,
              background: w ? "transparent" : "rgba(255,246,216,0.07)",
            }} />
            {!w && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: slot * 0.36, opacity: 0.45 }}>⭐</div>}
            {w && (
              <div style={{
                position: "absolute", inset: 0, background: FAIR.cream,
                border: `4px solid ${FAIR.ink}`, borderRadius: 10, boxSizing: "border-box",
                boxShadow: `0 4px 0 ${FAIR.ink}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
                padding: slot * 0.06,
                transform: `rotate(${Math.sin((frame + i * 30) / 46) * 2}deg)`,
              }}>
                <div style={{ width: slot * 0.66, height: slot * 0.60, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {src && src.startsWith("img/")
                    ? <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    : <div style={{ fontSize: slot * 0.52, lineHeight: 1 }}>{src}</div>}
                </div>
                <div style={{ width: "100%", background: FAIR.gold, borderRadius: 5, textAlign: "center",
                  fontFamily: font.family, fontWeight: 800, fontSize: slot * 0.26, color: FAIR.ink }}>{w}</div>
              </div>
            )}
          </div>
        );
      })}
      {/* the shelves under each row */}
      {rowYs.map((y, r) => (
        <div key={r} style={{ position: "absolute", left: X - 8, top: y + slot * 1.18 + 4, width: W2 + 16, height: b.height * 0.014,
          background: FAIR.counter, border: `4px solid ${FAIR.ink}`, boxSizing: "border-box", borderRadius: 6 }} />
      ))}
      <div style={{
        position: "absolute", right: b.width * 0.012, top: b.height * 0.128,
        fontFamily: font.family, fontWeight: 800, fontSize: b.height * 0.035, color: FAIR.gold,
        textShadow: "0 3px 0 rgba(0,0,0,0.45)",
      }}>⭐ {words.length} / 14</div>
    </>
  );
};

// ── THE ANSWER BOARD — the app's practice screen as a fairground machine ────
export const Board: React.FC<{
  b: B;
  pic?: string;
  rime: string;
  opts?: string[];
  optAt?: number;
  optTimes?: number[];              // absolute frames each option LETTER is spoken
  lit?: number;
  wrong?: number;
  filled?: string;
  at?: number;
  showSlot?: boolean;               // the ?+ending slot has its own arrival line
  endingHot?: boolean;              // pulses while the ending is being sounded out
  lookPic?: boolean;                // "look at the picture" — it bounces
  celebrate?: boolean;              // praise: stars over the board, paddles hop
}> = ({ b, pic, rime, opts, optAt = 0, optTimes, lit, wrong, filled, at = 0,
        showSlot = true, endingHot = false, lookPic = false, celebrate = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 15);
  const W = b.contentR - b.contentL, H = b.contentH;
  const u = (n: number) => Math.round(n * (b.wide ? 1 : 0.84));
  const src = pic ? picFor(pic) : null;
  // when the paddles arrive the pic+slot column slides LEFT (sprung), and the paddles
  // stand in a horizontal row beside it — stacked, they overflowed the clipped column
  const shift = opts ? pop(frame, fps, optAt, 14) : 0;
  return (
    <div style={{
      position: "relative", width: Math.min(W, u(900)), height: H,
      display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center",
      gap: u(40), transform: `scale(${0.94 + 0.06 * p})`,
    }}>
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: u(16),
      transform: `translateX(${-shift * u(60)}px)`,
    }}>
      {/* the picture, hung on the booth */}
      {src && (
        <div style={{
          width: u(205), height: u(205), background: FAIR.cream, borderRadius: u(22),
          border: `6px solid ${FAIR.ink}`, boxSizing: "border-box", boxShadow: `0 ${u(8)}px 0 ${FAIR.ink}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: lookPic
            ? `translateY(${-Math.abs(Math.sin(frame / 6)) * u(14)}px) rotate(${Math.sin(frame / 8) * 4}deg)`
            : `scale(${1 + 0.035 * Math.sin(frame / 16)})`,
        }}>
          {src.startsWith("img/")
            ? <Img src={staticFile(src)} style={{ width: "84%", height: "84%", objectFit: "contain" }} />
            : <div style={{ fontSize: u(150), lineHeight: 1 }}>{src}</div>}
        </div>
      )}
      {/* the word slot: ? + ending — never the spelled answer before its time */}
      {showSlot && <div style={{ display: "flex", gap: u(12), alignItems: "center" }}>
        <div style={{
          width: u(140), height: u(140), borderRadius: u(22),
          background: filled ? FAIR.cream : "rgba(255,246,228,0.25)",
          border: `${u(6)}px ${filled ? "solid" : "dashed"} ${filled ? FAIR.ink : "rgba(255,246,228,0.8)"}`,
          boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: font.family, fontWeight: 800, fontSize: u(82), color: FAIR.ink,
          transform: filled ? `scale(${1 + 0.1 * Math.sin(frame / 9)})` : undefined,
        }}>{filled ?? "?"}</div>
        <div style={{
          minWidth: u(175), height: u(140), padding: `0 ${u(18)}px`, borderRadius: u(20),
          background: FAIR.gold, border: `${u(6)}px solid ${FAIR.ink}`, boxSizing: "border-box",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: font.family, fontWeight: 800, fontSize: u(78), color: FAIR.ink,
          boxShadow: endingHot ? `0 ${u(6)}px 0 ${FAIR.ink}, 0 0 0 ${u(7)}px rgba(244,195,63,0.5)` : `0 ${u(6)}px 0 ${FAIR.ink}`,
          transform: endingHot ? `scale(${1.06 + 0.05 * Math.sin(frame / 7)})` : undefined,
        }}>{rime}</div>
      </div>}
    </div>
      {/* the three paddles — beside the column, never under it */}
      {opts && (
        <div style={{ display: "flex", gap: u(24), transform: `translateX(${(1 - shift) * u(80)}px)`, opacity: shift }}>
          {opts.map((o, i) => {
            const say = optTimes?.[i] ?? optAt + i * 5;
            const pp = pop(frame, fps, say, 12);
            const speaking = frame >= say && frame < say + 16;
            const isLit = lit === i, isWrong = wrong === i;
            return (
              <div key={o} style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${pp})` }}>
                <div style={{
                  width: u(118), height: u(118), borderRadius: "50%",
                  background: isLit ? FAIR.good : isWrong ? FAIR.bad : FAIR.paddle,
                  border: `${u(6)}px solid ${FAIR.ink}`, boxSizing: "border-box",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: font.family, fontWeight: 800, fontSize: u(64),
                  color: isLit || isWrong ? "#FFFFFF" : FAIR.ink,
                  boxShadow: isLit ? `0 0 0 ${u(7)}px rgba(63,191,127,0.45)` : `0 ${u(5)}px 0 ${FAIR.ink}`,
                  transform: isLit ? `translateY(${-u(8)}px)` : celebrate ? `translateY(${-Math.abs(Math.sin((frame + i * 8) / 7)) * u(10)}px)` : undefined,
                }}>{o}</div>
                <div style={{ width: u(10), height: u(30), background: FAIR.counter, border: `3px solid ${FAIR.ink}`, boxSizing: "border-box" }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Mo & Zip, at the fair ───────────────────────────────────────────────────
export const Mo: React.FC<{ b: B }> = ({ b }) => {
  const frame = useCurrentFrame();
  const s = b.charH;
  return (
    <div style={{ position: "absolute", left: b.moX, top: b.charY, width: s * 0.8, height: s,
      transform: `scale(${1 + Math.sin(frame / 46) * 0.012})`, transformOrigin: "50% 100%" }}>
      <div style={{ position: "absolute", left: s * 0.06, top: s * 0.30, width: s * 0.68, height: s * 0.66,
        borderRadius: "46% 46% 40% 40%", background: "#F0C56A", border: `6px solid ${FAIR.ink}`, boxSizing: "border-box" }} />
      <div style={{ position: "absolute", left: s * 0.20, top: s * 0.44, width: s * 0.40, height: s * 0.34, borderRadius: "50%", background: "#FFF0C8" }} />
      {[0.26, 0.48].map((fx, i) => (
        <div key={i} style={{ position: "absolute", left: s * fx, top: s * 0.44, width: s * 0.07, height: s * 0.09, borderRadius: "50%", background: FAIR.ink }} />
      ))}
      <div style={{ position: "absolute", left: s * 0.34, top: s * 0.56, width: s * 0.12, height: s * 0.07, borderRadius: "0 0 50% 50%", background: "#E08A4A" }} />
      {[0.02, 0.62].map((fx, i) => (
        <div key={`e${i}`} style={{ position: "absolute", left: s * fx, top: s * 0.24, width: s * 0.19, height: s * 0.26,
          borderRadius: "50% 50% 40% 40%", background: "#E0AE52", border: `5px solid ${FAIR.ink}`, boxSizing: "border-box" }} />
      ))}
    </div>
  );
};

export const Zip: React.FC<{ b: B; cheer?: boolean }> = ({ b, cheer = false }) => {
  const frame = useCurrentFrame();
  const s = b.charH * 0.92;
  const hop = cheer ? Math.abs(Math.sin(frame / 6)) * s * 0.16 : Math.abs(Math.sin(frame / 9)) * s * 0.04;
  return (
    <div style={{ position: "absolute", left: b.zipX, top: b.charY + b.charH - s - hop, width: s * 0.8, height: s }}>
      <div style={{ position: "absolute", left: s * 0.06, top: s * 0.28, width: s * 0.66, height: s * 0.68,
        borderRadius: "48% 48% 42% 42%", background: "#8FD3E8", border: `6px solid ${FAIR.ink}`, boxSizing: "border-box" }} />
      {[0.24, 0.46].map((fx, i) => (
        <div key={i} style={{ position: "absolute", left: s * fx, top: s * 0.42, width: s * 0.07, height: cheer ? s * 0.03 : s * 0.09, borderRadius: "50%", background: FAIR.ink }} />
      ))}
      <div style={{ position: "absolute", left: s * 0.30, top: s * 0.56, width: s * 0.16, height: s * 0.08, borderRadius: "0 0 50% 50%", background: "#3E7C8C" }} />
    </div>
  );
};

/** praise stars — in the FRAME layer, above the characters on the right, so they can
 *  never be clipped by the content column (they were) */
export const PraiseStars: React.FC<{ b: B }> = ({ b }) => {
  const frame = useCurrentFrame();
  const x0 = b.wide ? b.width * 0.745 : b.width * 0.60;
  const y0 = b.charY - b.height * 0.115;
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          position: "absolute", left: x0 + i * b.width * 0.055, top: y0,
          fontSize: b.height * 0.062, lineHeight: 1,
          transform: `translateY(${-Math.abs(Math.sin((frame + i * 9) / 7)) * b.height * 0.020}px) rotate(${Math.sin((frame + i * 14) / 10) * 10}deg)`,
        }}>⭐</div>
      ))}
    </>
  );
};

export const Content: React.FC<{ b: B; children: React.ReactNode; gap?: number }> = ({ b, children, gap }) => (
  <div style={{
    position: "absolute", left: b.contentL, top: b.contentTop,
    width: b.contentR - b.contentL, height: b.contentH, overflow: "hidden",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: gap ?? Math.round(b.height * 0.024),
  }}>{children}</div>
);

export const Row: React.FC<{ gap?: number; children: React.ReactNode }> = ({ gap = 14, children }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap, flexWrap: "wrap", rowGap: gap }}>{children}</div>
);

export const Line: React.FC<{ text: string; size?: number; at?: number; color?: string }> = ({
  text, size = 64, at = 0, color = FAIR.cream,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 15);
  return (
    <div style={{
      fontFamily: font.family, fontWeight: 800, fontSize: size, color, textAlign: "center",
      lineHeight: 1.12, whiteSpace: "pre-line", maxWidth: "100%",
      textShadow: "0 4px 0 rgba(0,0,0,0.35)",
      transform: `scale(${p}) translateY(${Math.sin((frame + at) / 32) * 3}px)`,
    }}>{text}</div>
  );
};

export const Banner: React.FC<{ b: B; text: string }> = ({ b, text }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, top: b.bannerTop, width: b.width, display: "flex", justifyContent: "center" }}>
      <div style={{
        padding: `${b.height * 0.011}px ${b.width * 0.020}px`, borderRadius: 999,
        background: FAIR.booth, color: FAIR.cream,
        border: `6px solid ${FAIR.ink}`, boxShadow: `0 8px 0 ${FAIR.ink}`,
        fontFamily: font.family, fontWeight: 800, fontSize: Math.round(b.height * 0.034), letterSpacing: 1,
        transform: `translateY(${Math.sin(frame / 34) * 4}px)`, whiteSpace: "nowrap",
      }}>{text}</div>
    </div>
  );
};
