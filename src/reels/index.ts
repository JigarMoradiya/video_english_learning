import React from "react";
import { AiAyReel, AI_AY_DURATION } from "./ai_ay";
import { OiOyReel, OI_OY_DURATION } from "./oi_oy";
import { OaOwReel, OA_OW_DURATION } from "./oa_ow";
import { CkCkReel, C_K_CK_DURATION } from "./c_k_ck";
import { OoReel, OO_DURATION } from "./oo";

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
];
