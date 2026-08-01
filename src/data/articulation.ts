// How the mouth actually LOOKS for each letter's phonics sound.
//
// src/data/shortvowels.ts has a MouthShape type, but all 5 of its shapes are
// open-mouth VOWEL ellipses — fine for A E I O U, useless for the 21 consonants,
// whose whole identity is something an ellipse can't show (lips shut for /b/,
// teeth on lip for /f/, tongue tip for /t/). Mapping a consonant onto a vowel
// ellipse would put a wide-open mouth on "buh" and teach the wrong articulation.
//
// So this is a superset, keyed to the sound each letter actually makes
// (LETTERS[].soundToken), not to the letter name.

export type Articulation =
  // vowels — jaw/lip opening
  | "openWide" // /a/  jaw down, wide
  | "openMid" // /e/  wide, medium height
  | "openSmall" // /i/  small slit
  | "roundTall" // /o/  tall round O
  | "openRelaxed" // /ʌ/  relaxed and open — NOT rounded
  // consonants — place of articulation
  | "lipsClosed" // b p m   lips pressed together, then released
  | "teethLip" // f v     top teeth resting on the bottom lip
  | "tongueTip" // t d n l tongue tip behind the top teeth
  | "teethNarrow" // s z x   teeth almost closed, thin gap
  | "tongueBack" // c k g   back of the tongue humps up
  | "lipsRound" // w q     tight forward pucker
  | "lipsForward" // j       lips pushed forward
  | "tongueCurl"; // r       tongue curled back

// Per LETTER, driven by its phonics sound:
//   A Aaa · B Buh · C Kuh · D Duh · E Eh · F Fff · G Guh · H Huh · I Ih · J Juh
//   K Kuh · L Luh · M Mmm · N Nuh · O Oh · P Puh · Q Kwuh · R Ruh · S Sss · T Tuh
//   U Uh · V Vuh · W Wuh · X Ks · Y Yuh · Z Zuh
export const LETTER_ARTICULATION: Record<string, Articulation> = {
  A: "openWide",
  B: "lipsClosed",
  C: "tongueBack",
  D: "tongueTip",
  E: "openMid",
  F: "teethLip",
  G: "tongueBack",
  H: "openMid", // /h/ is just breath — relaxed open mouth
  I: "openSmall",
  J: "lipsForward",
  K: "tongueBack",
  L: "tongueTip",
  M: "lipsClosed",
  N: "tongueTip",
  O: "roundTall",
  P: "lipsClosed",
  Q: "lipsRound", // /kw/ — the visible part is the w pucker
  R: "tongueCurl",
  S: "teethNarrow",
  T: "tongueTip",
  U: "openRelaxed", // /ʌ/ (umbrella) is unrounded — do not draw it as an "oo"
  V: "teethLip",
  W: "lipsRound",
  X: "teethNarrow", // /ks/ — ends on the s
  Y: "openSmall",
  Z: "teethNarrow",
};

// A child-facing cue for the shape — shown under the mouth so the instruction is
// explicit rather than "copy this picture".
export const ARTICULATION_HINT: Record<Articulation, string> = {
  openWide: "Open wide!",
  openMid: "Mouth half open",
  openSmall: "Just a little open",
  roundTall: "Make a round O",
  openRelaxed: "Relaxed and open",
  lipsClosed: "Lips together, then pop!",
  teethLip: "Teeth on your lip",
  tongueTip: "Tongue behind your teeth",
  teethNarrow: "Teeth close together",
  tongueBack: "Back of the tongue",
  lipsRound: "Push your lips out",
  lipsForward: "Lips forward",
  tongueCurl: "Curl your tongue back",
};
