import React from "react";
import { AiAyReel, AI_AY_DURATION } from "./ai_ay";
import { OiOyReel, OI_OY_DURATION } from "./oi_oy";
import { OaOwReel, OA_OW_DURATION } from "./oa_ow";
import { CkCkReel, C_K_CK_DURATION } from "./c_k_ck";
import { OoReel, OO_DURATION } from "./oo";
import { LettersReel, LETTERS_DURATION } from "./letters";
import { RecognitionReel, RECOGNITION_DURATION } from "./recognition";
import { ShortVowelsReel, SHORT_VOWELS_DURATION } from "./shortvowels";
import { ShortVowelsPortraitReel, SHORT_VOWELS_PORTRAIT_DURATION } from "./shortvowels_portrait";
import { LettersP1Reel, LETTERS_P1_DURATION } from "./letters_p1";
import { LettersP2Reel, LETTERS_P2_DURATION } from "./letters_p2";

// Registry of all reels. Add a new card here (one line) after creating its
// reel module in src/reels/<id>.tsx — each stays fully independent.
export interface ReelEntry {
  id: string; // composition id + output name + curriculum card id
  component: React.FC;
  durationInFrames: number;
  width?: number; // optional per-reel override (defaults to portrait tokens in Root)
  height?: number; // e.g. the c-k-ck YouTube video runs landscape 1920×1080
}

// NOTE: Remotion composition ids allow only a-z A-Z 0-9 and "-" (no underscore).
export const REELS: ReelEntry[] = [
  { id: "ai-ay", component: AiAyReel, durationInFrames: AI_AY_DURATION }, // L13 · Vowel Teams
  { id: "oi-oy", component: OiOyReel, durationInFrames: OI_OY_DURATION }, // L14 · Diphthongs
  { id: "oa-ow", component: OaOwReel, durationInFrames: OA_OW_DURATION }, // L13 · Vowel Teams
  // L5 · Short Vowel Rules "-ck Rule" — long-form YouTube teaching video (16:9).
  { id: "c-k-ck", component: CkCkReel, durationInFrames: C_K_CK_DURATION, width: 1920, height: 1080 },
  // L13 · "Which SOUND?" oo (moon/book) — long-form YouTube lesson (16:9).
  { id: "oo", component: OoReel, durationInFrames: OO_DURATION, width: 1920, height: 1080 },
  // A→Z Letter Phonics Sound — long-form 16:9 video ("A says a-a-a, A for Ant").
  { id: "letters-phonics", component: LettersReel, durationInFrames: LETTERS_DURATION, width: 1920, height: 1080 },
  // A→Z Letter Recognition — 16:9 "game-board" video ("A says a"), grid fills up.
  { id: "letter-recognition", component: RecognitionReel, durationInFrames: RECOGNITION_DURATION, width: 1920, height: 1080 },
  // L2 · Short Vowels — 16:9 lesson: learn (talking mouths) → practice → listen → download.
  { id: "short-vowels", component: ShortVowelsReel, durationInFrames: SHORT_VOWELS_DURATION, width: 1920, height: 1080 },
  // L2 · Short Vowels — 9:16 reel: SAME content, DISTINCT bold full-colour vertical theme.
  { id: "short-vowels-9x16", component: ShortVowelsPortraitReel, durationInFrames: SHORT_VOWELS_PORTRAIT_DURATION, width: 1080, height: 1920 },
  // A→Z Letter Sounds, split into two 9:16 parts (pink world, sibling of the purple Short Vowels).
  { id: "letters-p1-9x16", component: LettersP1Reel, durationInFrames: LETTERS_P1_DURATION, width: 1080, height: 1920 },
  { id: "letters-p2-9x16", component: LettersP2Reel, durationInFrames: LETTERS_P2_DURATION, width: 1080, height: 1920 },
];
