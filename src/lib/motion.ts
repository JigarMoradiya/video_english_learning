// Continuous idle-motion helpers so nothing on screen is ever frozen.
// Rule: something must be moving every second (feedback_reel_constant_motion).

// Smooth sine bob in px. phase lets sibling elements move out of sync.
export const bob = (frame: number, fps: number, amp = 14, periodSec = 2, phase = 0): number =>
  Math.sin((frame / fps) * (Math.PI * 2) / periodSec + phase) * amp;

// Gentle rotation wiggle in degrees.
export const wiggle = (frame: number, fps: number, amp = 3, periodSec = 1.6, phase = 0): number =>
  Math.sin((frame / fps) * (Math.PI * 2) / periodSec + phase) * amp;

// Breathing scale around 1.0 (e.g. 0.03 → 0.97..1.03).
export const pulse = (frame: number, fps: number, amp = 0.03, periodSec = 1.4, phase = 0): number =>
  1 + Math.sin((frame / fps) * (Math.PI * 2) / periodSec + phase) * amp;

// Slow hue-independent drift 0..1..0 for background shimmer.
export const drift = (frame: number, fps: number, periodSec = 6): number =>
  (Math.sin((frame / fps) * (Math.PI * 2) / periodSec) + 1) / 2;
