// Data for the A–Z "Letter Recognition" video ("A says a"), recreating the app's
// MainLetterRecognitionView. Reuses word/image/colour/sound from letters.ts and adds the
// three recognition-clip durations (measured by tools/prep_recognition.sh).
//
// Audio per letter = ONE gapless trio mp3 (public/audio/recognition/<x>_trio.mp3) built from
// letter_<x> + shared says + sound_<x>. We only need each part's DURATION to time the
// letter → says → sound highlight; d1 (says) is the same clip for every letter.
import { LETTERS } from "./letters";

export const SAYS_DUR = 0.74; // seconds — the shared "says" clip

// lowercase letter -> [d0 letter-name, d2 phonics-sound] seconds (from prep_recognition.sh)
const CLIP: Record<string, [number, number]> = {
  a: [0.51, 0.53], b: [0.47, 0.22], c: [0.49, 0.2101], d: [0.45, 0.27], e: [0.47, 0.24],
  f: [0.53, 0.15], g: [0.59, 0.22], h: [0.6, 0.22], i: [0.5, 0.25], j: [0.47, 0.29],
  k: [0.6, 0.27], l: [0.4154, 0.36], m: [0.49, 0.69], n: [0.49, 0.28], o: [0.46, 0.31],
  p: [0.52, 0.22], q: [0.59, 0.42], r: [0.55, 0.33], s: [0.55, 0.47], t: [0.55, 0.2],
  u: [0.59, 0.24], v: [0.5, 0.29], w: [0.72, 0.26], x: [0.6, 0.27], y: [0.6, 0.31], z: [0.53, 0.36],
};

export interface RecLetter {
  letter: string;
  word: string;
  image: string; // public/letters/<image>.png
  imageColor: string; // hex — word-image card stroke
  sound: string; // on-screen sound token, lowercased (e.g. "aaa")
  d0: number; // letter-name clip seconds
  d1: number; // "says" clip seconds (= SAYS_DUR)
  d2: number; // phonics-sound clip seconds
  trio: string; // mp3 stem in public/audio/recognition/
}

export const REC_LETTERS: RecLetter[] = LETTERS.map((l) => {
  const key = l.letter.toLowerCase();
  const [d0, d2] = CLIP[key];
  return {
    letter: l.letter,
    word: l.word,
    image: l.image,
    imageColor: l.imageColor,
    sound: l.soundToken.toLowerCase(),
    d0,
    d1: SAYS_DUR,
    d2,
    trio: `${key}_trio`,
  };
});
