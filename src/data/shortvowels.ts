// Data for the Short Vowels lesson video (recreates the app's ShortVowelsLearnView +
// practice + listen). Per-vowel colours, mouth-shape hints, and the 4 example words per
// vowel are taken verbatim from the app (ShortVowelsLearnViewModel). Example words show as
// TEXT CHIPS with the vowel highlighted (exactly like the app), so imageless words work.
// Sound/word clips are reused (public/audio/shortvowels/); real image cards (anchor +
// practice + listen pictures) use the image's dominant colour for a contrast stroke.
// A's sound label is "aaa" (matches the letter video), not the app's "aah".

export type MouthShape = "wide" | "mid" | "small" | "round" | "relaxed";

export interface SVExample { word: string; dur: number } // rendered as a highlighted word chip
export interface SVVowel {
  letter: string; // "A"
  lower: string; // "a"
  color: string; // hex (app palette)
  sound: string; // "aaa"
  soundDur: number; // sound_<v>.mp3 seconds
  anchor: string; // "ant"
  anchorEmoji: string;
  anchorImg: boolean;
  anchorDur: number;
  anchorColor: string; // dominant image colour → contrast card stroke ("" = use vowel colour)
  mouth: MouthShape;
  hint: string; // mouth-shape tip (from the app) — user records hint_<v>.mp3 later
  examples: SVExample[]; // 4, shown as word chips
}

export const VOWELS: SVVowel[] = [
  { letter: "A", lower: "a", color: "#E53935", sound: "aaa", soundDur: 0.53, anchor: "ant", anchorEmoji: "🐜", anchorImg: true, anchorDur: 0.5, anchorColor: "#84422C", mouth: "wide",
    hint: "Open your mouth wide — like at the doctor! aaa",
    examples: [{ word: "cat", dur: 0.46 }, { word: "bat", dur: 0.43 }, { word: "hat", dur: 0.53 }, { word: "man", dur: 0.5 }] },
  { letter: "E", lower: "e", color: "#F57C00", sound: "eh", soundDur: 0.24, anchor: "egg", anchorEmoji: "🥚", anchorImg: true, anchorDur: 0.42, anchorColor: "#DCDCC6", mouth: "mid",
    hint: "Stretch your lips into a little smile — eh",
    examples: [{ word: "hen", dur: 0.5 }, { word: "ten", dur: 0.54 }, { word: "pen", dur: 0.45 }, { word: "red", dur: 0.42 }] },
  { letter: "I", lower: "i", color: "#7B1FA2", sound: "ih", soundDur: 0.25, anchor: "ink", anchorEmoji: "🖊️", anchorImg: false, anchorDur: 0.48, anchorColor: "", mouth: "small",
    hint: "A tiny, quick smile — ih",
    examples: [{ word: "pig", dur: 0.5 }, { word: "sit", dur: 0.46 }, { word: "big", dur: 0.42 }, { word: "win", dur: 0.64 }] },
  { letter: "O", lower: "o", color: "#2E7D32", sound: "oh", soundDur: 0.31, anchor: "ox", anchorEmoji: "🐂", anchorImg: true, anchorDur: 0.63, anchorColor: "#421616", mouth: "round",
    hint: "Make a round O with your mouth — oh",
    examples: [{ word: "hot", dur: 0.49 }, { word: "dog", dur: 0.44 }, { word: "log", dur: 0.55 }, { word: "pot", dur: 0.47 }] },
  { letter: "U", lower: "u", color: "#1565C0", sound: "uh", soundDur: 0.24, anchor: "up", anchorEmoji: "⬆️", anchorImg: false, anchorDur: 0.4, anchorColor: "", mouth: "relaxed",
    hint: "Relax your mouth and say — uh",
    examples: [{ word: "bug", dur: 0.48 }, { word: "sun", dur: 0.56 }, { word: "cup", dur: 0.42 }, { word: "run", dur: 0.52 }] },
];

// Practice — "Find the missing vowel". On reveal we play the VOWEL SOUND first, then (after
// a minor gap) the whole WORD, then praise. blank index = 1 (CVC middle). Options + colours
// from the app; imageColor = picture's dominant colour → contrast card stroke.
export interface SVPractice { word: string; blank: number; correct: string; correctSound: string; soundDur: number; options: string[]; color: string; imageColor: string; dur: number }
export const PRACTICE: SVPractice[] = [
  { word: "cat", blank: 1, correct: "a", correctSound: "sound_a", soundDur: 0.53, options: ["e", "a", "o"], color: "#E53935", imageColor: "#C66E2C", dur: 0.46 },
  { word: "hen", blank: 1, correct: "e", correctSound: "sound_e", soundDur: 0.24, options: ["e", "o", "u"], color: "#F57C00", imageColor: "#581600", dur: 0.5 },
  { word: "pig", blank: 1, correct: "i", correctSound: "sound_i", soundDur: 0.25, options: ["a", "i", "e"], color: "#7B1FA2", imageColor: "#F2C6B0", dur: 0.5 },
  { word: "dog", blank: 1, correct: "o", correctSound: "sound_o", soundDur: 0.31, options: ["o", "a", "u"], color: "#2E7D32", imageColor: "#DC9A42", dur: 0.44 },
  { word: "sun", blank: 1, correct: "u", correctSound: "sound_u", soundDur: 0.24, options: ["o", "u", "a"], color: "#1565C0", imageColor: "#F2C642", dur: 0.56 },
  { word: "fox", blank: 1, correct: "o", correctSound: "sound_o", soundDur: 0.31, options: ["u", "a", "o"], color: "#2E7D32", imageColor: "#B0582C", dur: 0.61 },
];

// Listen — sound-out (each letter's phoneme, then the whole word). One per vowel.
export interface SVListen { word: string; letters: string[]; phonemeDurs: number[]; wordDur: number; color: string; imageColor: string }
export const LISTEN: SVListen[] = [
  { word: "cat", letters: ["c", "a", "t"], phonemeDurs: [0.21, 0.53, 0.2], wordDur: 0.46, color: "#E53935", imageColor: "#C66E2C" },
  { word: "hen", letters: ["h", "e", "n"], phonemeDurs: [0.22, 0.24, 0.28], wordDur: 0.5, color: "#F57C00", imageColor: "#581600" },
  { word: "pig", letters: ["p", "i", "g"], phonemeDurs: [0.22, 0.25, 0.22], wordDur: 0.5, color: "#7B1FA2", imageColor: "#F2C6B0" },
  { word: "dog", letters: ["d", "o", "g"], phonemeDurs: [0.27, 0.31, 0.22], wordDur: 0.44, color: "#2E7D32", imageColor: "#DC9A42" },
  { word: "sun", letters: ["s", "u", "n"], phonemeDurs: [0.47, 0.24, 0.28], wordDur: 0.56, color: "#1565C0", imageColor: "#F2C642" },
];

// Recorded framing-line durations (seconds), measured.
export const LINE = {
  intro: 5.34,
  rule: 3.74,
  practiceIntro: 3.15,
  whichVowel: [1.48, 1.92, 1.9, 1.9], // which_vowel_1..4
  listenIntro: 3.29,
  outroCta: 8.71,
};

export const SV_RULE = "Short vowels make a QUICK sound — not the letter's NAME!";

// Per-vowel mouth-shape hint audio (user records hint_a..u.mp3, drop into
// public/audio/shortvowels/). Until then the hint shows as text only. Flip READY to true
// and set HINT_DUR from the measured clips to give each hint its own spoken beat.
export const HINT_AUDIO_READY = true;
export const HINT_DUR: Record<string, number> = { a: 6.84, e: 5.27, i: 4.39, o: 5.73, u: 4.49 };
// When the hint clip REPEATS the sound at the end ("aaa, aaa, aaa") — [start, end] seconds
// within hint_<v>.mp3. Start = the sound's ONSET after the sentence (ffmpeg silencedetect),
// so the card buzzes exactly when the repetition begins — not during the pause before it.
export const HINT_REPEAT: Record<string, [number, number]> = { a: [3.98, 6.84], e: [3.2, 5.27], i: [2.43, 4.39], o: [3.24, 5.73], u: [2.47, 4.49] };

// Seconds within intro.mp3 when each vowel is NAMED ("…A, E, I, O, and U") — from whisper.
// The intro highlights each letter in sync as the narrator says it (before the sounds play).
export const INTRO_NAME_T = [2.34, 2.88, 3.56, 4.26, 4.82];

// Practice prompts (recorded, in public/audio/shortvowels/) — cycled across rounds.
export const VOWEL_PROMPTS = [
  { audio: "which_vowel_1", text: "Which vowel is missing?", dur: 1.48 },
  { audio: "which_vowel_2", text: "What vowel goes in the gap?", dur: 1.92 },
  { audio: "which_vowel_3", text: "Can you find the missing vowel?", dur: 1.9 },
  { audio: "which_vowel_4", text: "Which vowel completes the word?", dur: 1.9 },
];
