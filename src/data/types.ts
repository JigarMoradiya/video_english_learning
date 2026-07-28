// Video-side mirror of the app's comparison-card data.
// Source of truth: Learn English/UI/Phonics/Compare/ComparisonData.swift (phonicsComparisons).
// Keep field names aligned so the port stays mechanical.

export interface ComparisonTeam {
  marker: string; // "ai" / "ay"
  colorHex: string; // "1565C0"
  zoneEmoji: string; // 🏠 / 🏁
  zoneHint: string; // "middle" / "end"
  // Optional long form for the rule pill and recap card. ou/ow needs it: the sound sits at
  // the BEGINNING as well as the middle ("out", "ouch"), so "in the middle" would be wrong.
  zonePhrase?: string;
  // Second line on the recap card. The end spelling's rule has a clause the short phrase
  // can't carry ("…or guards the last letter"), and the narration says it out loud.
  zoneNote?: string;
  markerAudio?: string; // blend sound file stem ("ai")
}

export interface ComparisonQuizItem {
  word: string; // "rain" (also the <word>.opus stem)
  blanked: string; // "r__n"
  answerTeam: number; // index into teams
}

export type ComparisonGroup = "spelling" | "sound";

export interface PhonicsComparison {
  id: string; // "ai_ay"
  cardTitle: string; // "ai ⚡ ay"
  shortTitle: string; // "ai vs ay"
  rule: string; // detective one-liner
  explanation: string; // deeper "why"; **words** are bold+tinted
  example: string; // "rain · day"
  group: ComparisonGroup;
  hueShift: number; // rotates the home-style orb colours so each reel differs (deg)
  teams: ComparisonTeam[];
  quiz: ComparisonQuizItem[];
}
