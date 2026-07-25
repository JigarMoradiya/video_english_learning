// Data for the "Listen & pick the letter" practice section appended to the Letter
// Recognition video (recreates the app's LetterSoundsPracticeView as a play-along quiz).
// 10 questions incl. Q, X, S; each = a phonics sound + 3 lowercase options (correct +
// two deliberately-confusable distractors, e.g. b/d/p). Prompts + praise CYCLE through
// recorded variations so it never feels repetitive. Reuses the app's sound_<x> clips.
import { sec } from "../lib/timing";

const FPS = 30;
export const PRACTICE_INTRO_DUR = 1.54; // "Now let's practice!" clip

export interface PracticeQ {
  letter: string; // correct answer (lowercase) — also the sound_<letter> clip
  options: string[]; // 3 lowercase choices incl. the correct one
  soundDur: number; // seconds of sound_<letter>.mp3
}

export const PRACTICE: PracticeQ[] = [
  { letter: "s", options: ["s", "f", "z"], soundDur: 0.47 },
  { letter: "b", options: ["d", "b", "p"], soundDur: 0.22 },
  { letter: "a", options: ["e", "a", "o"], soundDur: 0.53 },
  { letter: "m", options: ["n", "m", "w"], soundDur: 0.69 },
  { letter: "f", options: ["v", "f", "s"], soundDur: 0.15 },
  { letter: "g", options: ["g", "j", "k"], soundDur: 0.22 },
  { letter: "q", options: ["p", "q", "g"], soundDur: 0.42 },
  { letter: "d", options: ["d", "b", "t"], soundDur: 0.27 },
  { letter: "p", options: ["b", "p", "d"], soundDur: 0.22 },
  { letter: "x", options: ["k", "x", "z"], soundDur: 0.27 },
];

// Question prompt (audio + matching on-screen text) — cycled across rounds.
export interface Clip { audio: string; text: string; dur: number; }
export const PROMPTS: Clip[] = [
  { audio: "which_letter_says", text: "Which letter says…?", dur: 1.5 },
  { audio: "tap_the_letter_that_says", text: "Tap the letter that says…?", dur: 1.7 },
  { audio: "can_you_find", text: "Can you find…?", dur: 1.01 },
];

// Praise on the correct reveal — cycled across rounds.
export const PRAISES: Clip[] = [
  { audio: "yes_thats_right", text: "That's right!", dur: 1.8 },
  { audio: "great_job", text: "Great job!", dur: 1.25 },
  { audio: "perfect", text: "Perfect!", dur: 0.79 },
  { audio: "superstar", text: "Superstar! ⭐", dur: 1.24 },
  { audio: "well_done", text: "Well done!", dur: 1.05 },
  { audio: "woohoo", text: "Woohoo!", dur: 0.94 },
  { audio: "you_got_it", text: "You got it!", dur: 1.04 },
];

// Per-round key frames (round-relative). Shared by the reel (to lay out sequences) and
// PracticeRound (to drive visuals): ask → sound → think → reveal (replay sound + praise).
export interface RoundPlan {
  whichAt: number; // prompt audio
  soundAt: number; // sound plays
  soundEnd: number;
  revealAt: number; // correct highlighted + sound replays
  praiseAt: number; // praise
  dur: number; // total round frames
}

export const roundPlan = (q: PracticeQ, promptDur: number, praiseDur: number): RoundPlan => {
  const whichAt = 8;
  const soundAt = whichAt + sec(promptDur, FPS) + 5;
  const soundEnd = soundAt + sec(q.soundDur, FPS);
  const revealAt = soundEnd + 42; // ~1.4s think
  const praiseAt = revealAt + sec(q.soundDur, FPS) + 4; // replay sound, then praise
  const dur = praiseAt + sec(praiseDur, FPS) + 18;
  return { whichAt, soundAt, soundEnd, revealAt, praiseAt, dur };
};
