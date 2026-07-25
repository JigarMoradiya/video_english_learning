import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font, palette } from "../data/tokens";

// Animated "how to get the app" phone mock for the outro: search "Kids English Learning"
// → our app highlighted → tap → detail page (real screenshots scroll) → tap GET →
// downloading → OPEN. Frame is outro-relative. Uses the real app icon + store screenshots.
const PURPLE = "#5B6CF0";
const GREEN = "#34C759";

const APP_NAME = "Kids English Learning";
const DEVELOPER = "Vedaavi Learning Apps";
const SHOTS = ["11", "12", "13", "14", "15"]; // real store screenshots (public/store/)

// phone geometry (frame coords)
const PX = 226, PY = 88, PW = 500, PH = 912, BEZ = 16;
const SX = PX + BEZ, SY = PY + BEZ, SW = PW - 2 * BEZ; // screen = 468 wide

const DETAIL_AT = 156;

const AppIcon: React.FC<{ size: number; radius?: number }> = ({ size, radius }) => (
  <Img src={staticFile("app_icon.png")} style={{ width: size, height: size, borderRadius: radius ?? size * 0.23, boxShadow: "0 6px 16px rgba(30,36,56,0.2)" }} />
);

// compact = skip the search phase and open straight on the detail page (for short beats
// that already narrate the CTA, e.g. the c/k/ck & oo lesson wraps).
export const StoreFlow: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slide = spring({ frame, fps, config: { damping: 14 } });
  const inDetail = compact || frame >= DETAIL_AT;
  const d = compact ? frame : frame - DETAIL_AT;

  const typed = APP_NAME.slice(0, Math.round(interpolate(frame, [16, 66], [0, APP_NAME.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

  // pointer: search → tap our row (~124), then detail → tap GET (~226)
  let px = 0, py = 0, tap = 0;
  const rowTop = SY + 188;
  if (!inDetail) {
    px = interpolate(frame, [86, 118], [SX + SW - 70, SX + 130], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    py = interpolate(frame, [86, 118], [SY + 780, rowTop + 54], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    tap = interpolate(frame, [122, 128, 138], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  } else {
    px = interpolate(d, [30, 62], [SX + SW - 60, SX + 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    py = interpolate(d, [30, 62], [SY + 700, SY + 210], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    tap = interpolate(d, [66, 72, 82], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  }

  // GET → downloading → OPEN
  const dl = interpolate(d, [84, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const getLabel = d < 74 ? "GET" : dl < 1 ? `${Math.round(dl * 100)}%` : "OPEN";
  const getBg = d < 74 ? PURPLE : dl < 1 ? "#C7CEDB" : GREEN;

  // screenshots horizontal scroll
  const ssH = 300, ssW = Math.round(ssH * 0.462);
  const stripW = SHOTS.length * ssW + (SHOTS.length - 1) * 14;
  const visW = SW - 40;
  const scrollX = interpolate(d, [22, 150], [0, -Math.max(0, stripW - visW)], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const aboutIn = interpolate(d, [18, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ transform: `translateY(${(1 - slide) * 60}px)`, opacity: slide, fontFamily: font.family }}>
      {/* phone */}
      <div style={{ position: "absolute", left: PX, top: PY, width: PW, height: PH, borderRadius: 56, background: "#1E2438", boxShadow: "0 30px 70px rgba(30,36,56,0.3)" }} />
      <div style={{ position: "absolute", left: SX, top: SY, width: SW, height: PH - 2 * BEZ, borderRadius: 42, background: "#F5F6FA", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 24, left: 24, fontSize: 34, fontWeight: 800, color: palette.ink }}>{inDetail ? "" : "Search"}</div>

        {!inDetail ? (
          <>
            {/* search bar */}
            <div style={{ position: "absolute", top: 84, left: 22, width: SW - 44, height: 60, borderRadius: 16, background: "#E7E9F0", display: "flex", alignItems: "center", paddingLeft: 20, gap: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, border: "3px solid #9AA1B2" }} />
              <span style={{ fontSize: 26, fontWeight: 700, color: palette.ink, whiteSpace: "nowrap" }}>{typed}<span style={{ opacity: frame % 20 < 10 && typed.length < APP_NAME.length ? 1 : 0 }}>|</span></span>
            </div>
            {/* result rows */}
            {[0, 1, 2].map((r) => {
              const top = 188 + r * 128;
              const ours = r === 0;
              const glow = ours ? interpolate(frame, [66, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
              const press = ours ? tap : 0;
              return (
                <div key={r} style={{ position: "absolute", left: 16, top, width: SW - 32, height: 104, borderRadius: 20, background: "#fff", border: ours ? `3px solid ${PURPLE}` : "1px solid #E7E9F0", boxShadow: ours ? `0 10px 26px rgba(91,108,240,${0.3 * glow})` : "none", transform: `scale(${1 - press * 0.03})`, display: "flex", alignItems: "center", gap: 14, padding: "0 16px" }}>
                  {ours ? <AppIcon size={68} /> : <div style={{ width: 68, height: 68, borderRadius: 16, background: "#E7E9F0" }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {ours ? (
                      <>
                        <div style={{ fontSize: 24, fontWeight: 800, color: palette.ink, whiteSpace: "nowrap" }}>{APP_NAME}</div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: palette.inkSoft, whiteSpace: "nowrap" }}>{DEVELOPER} · <span style={{ color: "#FF9F0A" }}>★</span> 5.0</div>
                      </>
                    ) : (
                      <>
                        <div style={{ width: "60%", height: 15, borderRadius: 8, background: "#E7E9F0", marginBottom: 10 }} />
                        <div style={{ width: "40%", height: 12, borderRadius: 6, background: "#EEF0F5" }} />
                      </>
                    )}
                  </div>
                  <div style={{ width: 58, height: 40, borderRadius: 20, background: ours ? PURPLE : "#E7E9F0", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, flexShrink: 0, marginLeft: 6 }}>{ours ? "GET" : ""}</div>
                </div>
              );
            })}
          </>
        ) : (
          <>
            {/* detail header */}
            <div style={{ position: "absolute", top: 40, left: 24, right: 24, display: "flex", gap: 20, alignItems: "center" }}>
              <AppIcon size={112} radius={26} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: palette.ink, whiteSpace: "nowrap" }}>{APP_NAME}</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: palette.inkSoft, marginBottom: 6, whiteSpace: "nowrap" }}>{DEVELOPER}</div>
                <div style={{ color: "#FF9F0A", fontSize: 22 }}>★★★★★ <span style={{ color: palette.inkSoft, fontSize: 18 }}>5.0</span></div>
              </div>
            </div>
            <div style={{ position: "absolute", top: 178, left: 24, width: 160, height: 56, borderRadius: 28, background: getBg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, letterSpacing: 1, transform: `scale(${1 - (d >= 66 && d < 82 ? tap : 0) * 0.08})` }}>{getLabel}</div>
            {/* screenshots — scroll horizontally */}
            <div style={{ position: "absolute", top: 262, left: 20, width: visW, height: ssH + 8, overflow: "hidden" }}>
              <div style={{ display: "flex", gap: 14, transform: `translateX(${scrollX}px)` }}>
                {SHOTS.map((s) => (
                  <Img key={s} src={staticFile(`store/${s}.png`)} style={{ width: ssW, height: ssH, borderRadius: 16, border: "1px solid #E7E9F0", objectFit: "cover", flexShrink: 0 }} />
                ))}
              </div>
            </div>

            {/* about this app */}
            <div style={{ position: "absolute", top: 596, left: 24, right: 24, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: aboutIn }}>
              <span style={{ fontSize: 25, fontWeight: 800, color: palette.ink }}>About this app</span>
              <svg width={15} height={26} viewBox="0 0 15 26"><path d="M2 2 L12 13 L2 24" fill="none" stroke="#9AA1B2" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div style={{ position: "absolute", top: 638, left: 24, width: SW - 48, fontSize: 19, fontWeight: 500, color: palette.inkSoft, lineHeight: 1.36, opacity: aboutIn }}>
              Learn ABC, phonics &amp; English —<br />safe, ad-free kids learning app for ages 3-8.
            </div>
            {/* category card */}
            <div style={{ position: "absolute", top: 724, left: 24, width: 232, height: 76, borderRadius: 18, background: "#fff", border: "1px solid #E7E9F0", boxShadow: "0 6px 16px rgba(30,36,56,0.06)", display: "flex", alignItems: "center", gap: 12, padding: "0 14px", opacity: aboutIn }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: "linear-gradient(150deg,#6E8BFF,#5B6CF0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={28} height={28} viewBox="0 0 24 24"><path d="M12 3 L23 8 L12 13 L1 8 Z" fill="#fff" /><path d="M5 10.5 v4.5 c0 1.8 14 1.8 14 0 v-4.5" fill="none" stroke="#fff" strokeWidth={1.8} /><path d="M23 8 v6" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: palette.inkSoft, letterSpacing: 1 }}>CATEGORY</div>
                <div style={{ fontSize: 23, fontWeight: 800, color: palette.ink }}>Education</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* tap pointer */}
      <div style={{ position: "absolute", left: px - 26, top: py - 26, width: 52, height: 52 }}>
        {tap > 0 && <div style={{ position: "absolute", left: 26 - (26 + tap * 22), top: 26 - (26 + tap * 22), width: (26 + tap * 22) * 2, height: (26 + tap * 22) * 2, borderRadius: "50%", border: `3px solid ${PURPLE}`, opacity: 1 - tap }} />}
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(30,36,56,0.28)", border: "3px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.25)", transform: `scale(${1 - tap * 0.2})` }} />
      </div>
    </div>
  );
};
