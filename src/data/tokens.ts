// Design tokens — kept close to the app's kid-facing phonics look so reels read on-brand.

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const APP_NAME = "English Learning";

import { KID_FONT } from "../lib/fonts";

export const font = {
  // Rounded, kid-friendly (Fredoka), loaded via @remotion/google-fonts.
  family: `${KID_FONT}, system-ui, sans-serif`,
};

// Safe layout: platforms (IG/FB/YT) overlay caption + buttons on the bottom.
// Keep all content in the upper-middle by reserving this much bottom space.
export const SAFE_BOTTOM = 470;

export const palette = {
  ink: "#1E2438",
  inkSoft: "#5A6178",
  card: "#FFFFFF",
  cardShadow: "rgba(30, 36, 56, 0.18)",
  blank: "#C7CEDB",
};

// Turn a bare hex ("1565C0") into a CSS color ("#1565C0").
export const hex = (h: string): string => (h.startsWith("#") ? h : `#${h}`);

// Lighten a hex toward white by t (0..1) — for soft tinted chip backgrounds.
export const tint = (h: string, t: number): string => {
  const c = hex(h).slice(1);
  const n = parseInt(c, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mix = (v: number) => Math.round(v + (255 - v) * t);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
};
