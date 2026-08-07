import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { font, shade } from "../data/tokens";

// ══ VEDAAVI brand intro — a 3.6s sting prepended to every video/reel ══════════
// Polished: glossy candy-gradient rainbow letters (own tilt/height, like the ref),
// mascot FACE with a clear head-tilt, dimensional scattered elements (stars,
// sparkles, hearts, notes), soft depth (vignette + bokeh + a shine sweep at the
// settle). FIXED mint background. Responsive (16:9 side-by-side / 9:16 stacked).
// Audio NON-TONAL only (landing thumps + shimmer) — a jingle would re-trigger
// Meta's music-rights flag on EVERY video. See music_copyright_meta.

const FPS = 30;
export const VEDAAVI_INTRO_DURATION = 112;

// ── tiny colour helpers ───────────────────────────────────────────────────────
const hx = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const toHex = (r: number, g: number, b: number) => "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
const lighten = (h: string, a: number) => { const [r, g, b] = hx(h); return toHex(r + (255 - r) * a, g + (255 - g) * a, b + (255 - b) * a); };

const NAME = "VEDAAVI".split("");
const COLORS = ["#FF5A5A", "#FF9A1F", "#F2B705", "#3FD168", "#1FBFD4", "#4D8DFF", "#A66BFF"];
const FROM = [
  { x: -680, y: -320, r: -40 }, { x: 40, y: -700, r: 24 }, { x: 680, y: -360, r: 40 },
  { x: -560, y: 620, r: -30 }, { x: 560, y: 640, r: 30 }, { x: -60, y: 760, r: -18 },
  { x: 700, y: 260, r: 46 },
];
const REST = [
  { dy: 8, rot: -8 }, { dy: -18, rot: 6 }, { dy: 6, rot: -4 }, { dy: -14, rot: 7 },
  { dy: 4, rot: -6 }, { dy: -16, rot: 5 }, { dy: 12, rot: -6 },
];

const STAR = "M50 4 L61 37 L96 37 L67 58 L79 92 L50 71 L21 92 L33 58 L4 37 L39 37 Z";
const HEART = "M50 84 C18 58 6 40 6 25 C6 12 17 5 28 5 C39 5 47 13 50 21 C53 13 61 5 72 5 C83 5 94 12 94 25 C94 40 82 58 50 84 Z";
const SPARK = "M50 3 C55 33 67 45 97 50 C67 55 55 67 50 97 C45 67 33 55 3 50 C33 45 45 33 50 3 Z";

type D = { t: "star" | "spark" | "heart" | "note"; fx: number; fy: number; s: number; c: string; d: number };
const DECOR: D[] = [
  { t: "note", fx: 0.27, fy: 0.09, s: 96, c: "#FF9A1F", d: 10 }, { t: "star", fx: 0.5, fy: 0.05, s: 64, c: "#4D8DFF", d: 5 },
  { t: "note", fx: 0.69, fy: 0.08, s: 104, c: "#3FD168", d: 12 }, { t: "heart", fx: 0.14, fy: 0.13, s: 68, c: "#FF5A8A", d: 7 },
  { t: "spark", fx: 0.4, fy: 0.17, s: 56, c: "#F2B705", d: 9 }, { t: "spark", fx: 0.6, fy: 0.18, s: 46, c: "#A66BFF", d: 14 },
  { t: "note", fx: 0.87, fy: 0.15, s: 72, c: "#1FBFD4", d: 16 }, { t: "star", fx: 0.09, fy: 0.35, s: 58, c: "#FF5A5A", d: 8 },
  { t: "heart", fx: 0.93, fy: 0.36, s: 60, c: "#A66BFF", d: 11 }, { t: "star", fx: 0.06, fy: 0.74, s: 66, c: "#3FD168", d: 13 },
  { t: "spark", fx: 0.95, fy: 0.72, s: 58, c: "#FF9A1F", d: 15 }, { t: "heart", fx: 0.16, fy: 0.88, s: 58, c: "#FF5A8A", d: 12 },
  { t: "star", fx: 0.85, fy: 0.9, s: 66, c: "#4D8DFF", d: 10 }, { t: "spark", fx: 0.5, fy: 0.93, s: 52, c: "#F2B705", d: 14 },
];

const Decor: React.FC<D & { W: number; H: number; idx: number }> = ({ t, fx, fy, s, c, d, W, H, idx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame: frame - d, fps, config: { damping: 12 } });
  const yb = Math.sin(frame * 0.09 + fx * 22) * 9;
  const rot = Math.sin(frame * 0.06 + fx * 10) * 8;
  const gid = `ve-g${idx}`;
  const style: React.CSSProperties = { position: "absolute", left: fx * W - s / 2, top: fy * H - s / 2, transform: `translateY(${(1 - inn) * -60 + yb}px) scale(${inn}) rotate(${rot}deg)`, filter: "drop-shadow(0 5px 7px rgba(60,90,40,0.22))" };
  const grad = (
    <radialGradient id={gid} cx="36%" cy="30%" r="75%">
      <stop offset="0%" stopColor={lighten(c, 0.5)} /><stop offset="55%" stopColor={c} /><stop offset="100%" stopColor={shade(c, 0.16)} />
    </radialGradient>
  );
  if (t === "note") {
    return (
      <svg width={s} height={s * 1.16} viewBox="0 0 64 78" style={style}>
        <defs>{grad}</defs>
        <rect x="34" y="8" width="7" height="46" rx="3" fill={`url(#${gid})`} />
        <path d="M34 8 C48 8 57 15 59 30 C53 21 44 20 41 25 L41 12 Z" fill={`url(#${gid})`} />
        <ellipse cx="20" cy="56" rx="16" ry="12" fill={`url(#${gid})`} transform="rotate(-18 20 56)" />
        <ellipse cx="15" cy="51" rx="5" ry="3.4" fill="#fff" opacity="0.5" transform="rotate(-18 15 51)" />
      </svg>
    );
  }
  const path = t === "star" ? STAR : t === "heart" ? HEART : SPARK;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={style}>
      <defs>{grad}</defs>
      <path d={path} fill={`url(#${gid})`} stroke={shade(c, 0.24)} strokeWidth={t === "spark" ? 0 : 3} strokeLinejoin="round" />
      <ellipse cx="38" cy="30" rx="14" ry="9" fill="#fff" opacity="0.42" transform="rotate(-20 38 30)" />
    </svg>
  );
};

// ── glossy candy letter (own tilt + height) ───────────────────────────────────
const Letter: React.FC<{ ch: string; color: string; size: number; i: number }> = ({ ch, color, size, i }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: frame - 14 - i * 4, fps, config: { damping: 13, stiffness: 120 } });
  const f = FROM[i], rest = REST[i];
  const dark = shade(color, 0.32);
  const e = size * 0.02;
  const idle = Math.sin(frame * 0.08 + i) * 3;
  const tx = (1 - sp) * f.x;
  const ty = (1 - sp) * f.y + sp * rest.dy + idle;
  const rot = (1 - sp) * f.r + sp * rest.rot;
  return (
    <span
      style={{
        fontSize: size, fontWeight: 800, color, lineHeight: 0.9, display: "inline-block",
        WebkitTextStroke: `${size * 0.05}px ${dark}`,
        paintOrder: "stroke fill" as unknown as undefined,
        textShadow: `0 ${e}px 0 ${dark}, 0 ${e * 2}px 0 ${dark}, 0 ${e * 3}px 0 ${dark}, 0 ${e * 4}px ${size * 0.08}px rgba(30,60,20,0.32)`,
        transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${sp})`,
      }}
    >{ch}</span>
  );
};

const MascotFace: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame: frame - 4, fps, config: { damping: 10, stiffness: 110 } });
  const bob = Math.sin(frame * 0.08) * 7;
  const sway = Math.sin(frame * 0.045) * 2.5;
  const rot = (1 - inn) * -16 + Math.min(1, inn) * (-6 + sway);   // lands at a clear ~-6° tilt
  return (
    <Img
      src={staticFile("intro/mascot_face.png")}
      style={{
        width: size, height: "auto",
        transform: `translateY(${bob}px) scale(${interpolate(inn, [0, 1], [0, 1])}) rotate(${rot}deg)`,
        opacity: interpolate(frame, [3, 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        filter: "drop-shadow(0 18px 24px rgba(60,90,40,0.3))",
      }}
    />
  );
};

const Name: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
    {NAME.map((ch, i) => <Letter key={i} ch={ch} color={COLORS[i]} size={size} i={i} />)}
  </div>
);

const Tagline: React.FC<{ size?: number }> = ({ size = 48 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sub = spring({ frame: frame - 56, fps, config: { damping: 13 } });
  return (
    <div style={{ opacity: sub, transform: `translateY(${(1 - sub) * 20}px) scale(${0.9 + 0.1 * sub})` }}>
      <div style={{ background: "linear-gradient(180deg,#67A2FF,#4D8DFF)", color: "#fff", fontSize: size, fontWeight: 800, letterSpacing: 2, padding: "11px 40px", borderRadius: 999, boxShadow: "0 8px 0 rgba(40,90,160,0.42), 0 18px 28px rgba(40,90,160,0.3), inset 0 2px 0 rgba(255,255,255,0.4)" }}>
        Kids&nbsp;English&nbsp;Learning
      </div>
    </div>
  );
};

const BOKEH = [{ x: 0.2, y: 0.28, r: 300 }, { x: 0.82, y: 0.24, r: 260 }, { x: 0.14, y: 0.78, r: 240 }, { x: 0.88, y: 0.8, r: 280 }];

export const VedaaviIntroReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const landscape = W > H;

  // gentle diagonal shine sweep across the logo once it settles
  const shineX = interpolate(frame, [58, 88], [-W * 0.5, W * 1.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shineOp = interpolate(frame, [58, 66, 80, 88], [0, 0.5, 0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: font.family, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "linear-gradient(170deg,#EAF8E0 0%,#DBF3D0 55%,#CDEEC4 100%)" }} />
      {BOKEH.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: b.x * W - b.r / 2, top: b.y * H - b.r / 2, width: b.r, height: b.r, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,255,255,0.5), transparent)" }} />
      ))}
      <AbsoluteFill style={{ background: "radial-gradient(920px 920px at 50% 34%, rgba(255,255,255,0.55), transparent 62%)" }} />

      {/* SMOOTH non-tonal reveal: a soft rising swell that builds as the logo forms,
          then a gentle shimmer at the settle. No melody → safe for Meta on every video. */}
      <Sequence from={6} durationInFrames={62}><Audio src={staticFile("sfx/riser.mp3")} volume={1} /></Sequence>
      <Sequence from={58} durationInFrames={30}><Audio src={staticFile("sfx/sparkle.mp3")} volume={0.45} /></Sequence>

      {DECOR.map((e, i) => <Decor key={i} {...e} W={W} H={H} idx={i} />)}

      {landscape ? (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 30 }}>
          <MascotFace size={430} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <Name size={168} />
            <Tagline size={50} />
          </div>
        </div>
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
          <MascotFace size={430} />
          <Name size={150} />
          <Tagline size={46} />
        </div>
      )}

      {/* shine sweep — a premium gloss pass */}
      <div style={{ position: "absolute", top: -H * 0.2, left: shineX, width: W * 0.16, height: H * 1.4, transform: "rotate(14deg)", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)", opacity: shineOp, mixBlendMode: "screen", pointerEvents: "none" }} />

      {/* soft vignette for depth */}
      <AbsoluteFill style={{ background: "radial-gradient(130% 120% at 50% 44%, transparent 62%, rgba(50,85,35,0.16) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
