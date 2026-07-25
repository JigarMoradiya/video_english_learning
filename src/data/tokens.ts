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

const rgbOf = (h: string): [number, number, number] => {
  const n = parseInt(hex(h).slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

// Lighten a hex toward white by t (0..1) — for soft tinted chip backgrounds.
export const tint = (h: string, t: number): string => {
  const [r, g, b] = rgbOf(h);
  const mix = (v: number) => Math.round(v + (255 - v) * t);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
};

// Darken a hex toward black by t (0..1) — returns hex so an 8-digit alpha can be appended.
export const shade = (h: string, t: number): string => {
  const [r, g, b] = rgbOf(h);
  const mix = (v: number) => Math.round(v * (1 - t));
  const hx = (v: number) => mix(v).toString(16).padStart(2, "0");
  return `#${hx(r)}${hx(g)}${hx(b)}`;
};

// Perceived luminance 0..1 (Rec. 601) — to decide when a colour is too light for a stroke.
export const lum = (h: string): number => {
  const [r, g, b] = rgbOf(h);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

const hslToHex = (h: number, s: number, l: number): string => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  const hx = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${hx(r)}${hx(g)}${hx(b)}`;
};

const hueOf = (h: string): { hue: number; sat: number } => {
  const [r, g, b] = rgbOf(h).map((v) => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  const l = (mx + mn) / 2;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let hue = 0;
  if (d !== 0) {
    if (mx === r) hue = ((g - b) / d) % 6;
    else if (mx === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue = (hue * 60 + 360) % 360;
  }
  return { hue, sat };
};

// A vivid, DISTINCT colour per letter. Hues are spread around the wheel by the golden
// angle (137.5° × index) so every letter differs and neighbours contrast strongly — then
// nudged away only if the hue happens to clash with the word image (so it never blends).
// This replaces the old complement-of-image approach, which made most letters blue because
// most word images are warm-coloured.
export const letterColorFor = (letter: string, imageColorHex: string): string => {
  const idx = letter.toUpperCase().charCodeAt(0) - 65;
  let h = (idx * 137.508) % 360;
  const img = hueOf(imageColorHex);
  if (img.sat > 0.16) {
    const dist = Math.min(Math.abs(h - img.hue), 360 - Math.abs(h - img.hue));
    if (dist < 42) h = (h + 180) % 360; // too close to the image → jump to the opposite side
  }
  return hslToHex(h, 0.6, 0.45);
};
