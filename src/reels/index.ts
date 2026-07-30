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
import { AiAy16x9Reel, AI_AY_16X9_DURATION } from "./ai_ay_16x9";
import { OiOy16x9Reel, OI_OY_16X9_DURATION } from "./oi_oy_16x9";
import { OaOw16x9Reel, OA_OW_16X9_DURATION } from "./oa_ow_16x9";
import { OuOw16x9Reel, OU_OW_16X9_DURATION } from "./ou_ow_16x9";
import { AuAw16x9Reel, AU_AW_16X9_DURATION } from "./au_aw_16x9";
import { OuOwPortraitReel, OU_OW_PORTRAIT_DURATION } from "./ou_ow_portrait";
import { AuAwPortraitReel, AU_AW_PORTRAIT_DURATION } from "./au_aw_portrait";
import { CSoftHard16x9Reel, C_SOFT_HARD_DURATION } from "./c_soft_hard_16x9";
import { GSoftHard16x9Reel, G_SOFT_HARD_DURATION } from "./g_soft_hard_16x9";
import { GeDge16x9Reel, GE_DGE_16X9_DURATION } from "./ge_dge_16x9";
import { GeDgePortraitReel, GE_DGE_PORTRAIT_DURATION } from "./ge_dge_portrait";
import { ChTchPortraitReel, CH_TCH_PORTRAIT_DURATION } from "./ch_tch_portrait";
import { CSoftHardPortraitReel, C_SOFT_HARD_PORTRAIT_DURATION } from "./c_soft_hard_portrait";
import { GSoftHardPortraitReel, G_SOFT_HARD_PORTRAIT_DURATION } from "./g_soft_hard_portrait";
import { ChTch16x9Reel, CH_TCH_16X9_DURATION } from "./ch_tch_16x9";
import { OoPortraitReel, OO_PORTRAIT_DURATION } from "./oo_portrait";
import { CkCkPortraitReel, CK_PORTRAIT_DURATION } from "./c_k_ck_portrait";
import { LogoIntroReel, LogoIntroFlashReel, LOGO_INTRO_DURATION, LOGO_INTRO_FLASH_DURATION } from "./logo_intro";
import { letterShortEntry } from "./letter_short";
import { LETTERS } from "../data/letters";
import { ThumbPhonicsA, ThumbPhonicsB, ThumbPhonicsC } from "../thumbs/letters_thumb";
import { ThumbShortVowels } from "../thumbs/shortvowels_thumb";
import { ThumbLettersPhonics } from "../thumbs/letters_phonics_thumb";
import { ThumbShortVowelsPortrait } from "../thumbs/shortvowels_thumb_portrait";
import { ThumbLettersPhonicsPortrait } from "../thumbs/letters_phonics_thumb_portrait";
import { PostQuizQ } from "../thumbs/quiz_post";
import { LETTER_TILE_ENTRIES } from "../thumbs/poll_options";
import { MouthChart } from "../thumbs/mouth_chart";

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
  // Brand logo intro — real logo pieces assemble into the logo. Prepend to any video.
  { id: "logo-intro-9x16", component: LogoIntroReel, durationInFrames: LOGO_INTRO_DURATION, width: 1080, height: 1920 },
  { id: "logo-intro-16x9", component: LogoIntroReel, durationInFrames: LOGO_INTRO_DURATION, width: 1920, height: 1080 },
  { id: "logo-intro-flash-9x16", component: LogoIntroFlashReel, durationInFrames: LOGO_INTRO_FLASH_DURATION, width: 1080, height: 1920 },
  { id: "ai-ay", component: AiAyReel, durationInFrames: AI_AY_DURATION }, // L13 · Vowel Teams
  { id: "oi-oy", component: OiOyReel, durationInFrames: OI_OY_DURATION }, // L14 · Diphthongs
  { id: "oa-ow", component: OaOwReel, durationInFrames: OA_OW_DURATION }, // L13 · Vowel Teams
  // L5 · Short Vowel Rules "-ck Rule" — long-form YouTube teaching video (16:9).
  { id: "c-k-ck", component: CkCkReel, durationInFrames: C_K_CK_DURATION, width: 1920, height: 1080 },
  // 4:5 for Facebook — same reel, stage fitted to the width, world fills the extra height
  { id: "c-k-ck-4x5", component: CkCkReel, durationInFrames: C_K_CK_DURATION, width: 1080, height: 1350 },
  // L13 · "Which SOUND?" oo (moon/book) — long-form YouTube lesson (16:9).
  { id: "oo", component: OoReel, durationInFrames: OO_DURATION, width: 1920, height: 1080 },
  // 4:5 for Facebook — its OWN world: 16:9 and 9:16 already share OoWorld, so the
  // Facebook cut gets a third look rather than a third copy of the same one.
  { id: "oo-4x5", component: OoReel, durationInFrames: OO_DURATION, width: 1080, height: 1350 },
  // A→Z Letter Phonics Sound — long-form 16:9 video ("A says a-a-a, A for Ant").
  { id: "letters-phonics", component: LettersReel, durationInFrames: LETTERS_DURATION, width: 1920, height: 1080 },
  // 4:5 for Facebook — the SAME reel (identical timing, audio and SFX) laid out for a tall
  // frame and wearing The Paint Studio. Not a crop of the 16:9.
  { id: "letters-phonics-4x5", component: LettersReel, durationInFrames: LETTERS_DURATION, width: 1080, height: 1350 },
  // A→Z Letter Recognition — 16:9 "game-board" video ("A says a"), grid fills up.
  { id: "letter-recognition", component: RecognitionReel, durationInFrames: RECOGNITION_DURATION, width: 1920, height: 1080 },
  // L2 · Short Vowels — 16:9 lesson: learn (talking mouths) → practice → listen → download.
  { id: "short-vowels", component: ShortVowelsReel, durationInFrames: SHORT_VOWELS_DURATION, width: 1920, height: 1080 },
  // 4:5 for Facebook — the SAME reel (identical timing, audio, SFX) laid out for a tall
  // frame, wearing The Chirp Wire. Not a crop of the 16:9.
  { id: "short-vowels-4x5", component: ShortVowelsReel, durationInFrames: SHORT_VOWELS_DURATION, width: 1080, height: 1350 },
  // L2 · Short Vowels — 9:16 reel: SAME content, DISTINCT bold full-colour vertical theme.
  { id: "short-vowels-9x16", component: ShortVowelsPortraitReel, durationInFrames: SHORT_VOWELS_PORTRAIT_DURATION, width: 1080, height: 1920 },
  // A→Z Letter Sounds, split into two 9:16 parts (pink world, sibling of the purple Short Vowels).
  { id: "letters-p1-9x16", component: LettersP1Reel, durationInFrames: LETTERS_P1_DURATION, width: 1080, height: 1920 },
  { id: "letters-p2-9x16", component: LettersP2Reel, durationInFrames: LETTERS_P2_DURATION, width: 1080, height: 1920 },
  // L13 · "Which SOUND?" oo — 9:16 cut: SAME narration, TOP/BOTTOM split world.
  { id: "oo-9x16", component: OoPortraitReel, durationInFrames: OO_PORTRAIT_DURATION, width: 1080, height: 1920 },
  // L5 · "-ck Rule" c/k/ck — 9:16 cut: SAME narration, stacked team tower, deep-teal world.
  { id: "c-k-ck-9x16", component: CkCkPortraitReel, durationInFrames: CK_PORTRAIT_DURATION, width: 1080, height: 1920 },
  // ── A–Z Letter Shorts (series) — one 9:16 Short per letter, ~25s each ───────
  // "Paper Craft Daylight" world. Fully data-driven: all 26 come from one
  // template, so an episode is a LETTERS row, not a build.
  //   npm run render:letter_shorts   -> out/letter_shorts/A.mp4 … Z.mp4
  ...LETTERS.map(letterShortEntry),
  // Review sheet for the phonics mouth shapes (not part of any video).
  { id: "mouth-chart", component: MouthChart, durationInFrames: 1, width: 1500, height: 1180 },
  // L13 · ai/ay — long-form 16:9 lesson. The Word Train: carriages ARE word positions.
  { id: "ai-ay-16x9", component: AiAy16x9Reel, durationInFrames: AI_AY_16X9_DURATION, width: 1920, height: 1080 },
  // 4:5 for Facebook — the SAME lesson wearing The Word Train, restaged for a tall frame.
  { id: "ai-ay-4x5", component: AiAy16x9Reel, durationInFrames: AI_AY_16X9_DURATION, width: 1080, height: 1350 },
  // L14 · oi/oy — long-form 16:9 lesson. The Lily Pond: a frog HOPS to the position.
  { id: "oi-oy-16x9", component: OiOy16x9Reel, durationInFrames: OI_OY_16X9_DURATION, width: 1920, height: 1080 },
  // 4:5 for Facebook — the SAME lesson wearing The Lily Pond, restaged for a tall frame.
  { id: "oi-oy-4x5", component: OiOy16x9Reel, durationInFrames: OI_OY_16X9_DURATION, width: 1080, height: 1350 },
  // L13 · oa/ow — long-form 16:9 lesson. The Open Sea: the swell ROLLS through the rafts.
  { id: "oa-ow-16x9", component: OaOw16x9Reel, durationInFrames: OA_OW_16X9_DURATION, width: 1920, height: 1080 },
  // 4:5 for Facebook — the SAME lesson wearing The Open Sea, restaged for a tall frame.
  { id: "oa-ow-4x5", component: OaOw16x9Reel, durationInFrames: OA_OW_16X9_DURATION, width: 1080, height: 1350 },
  // L14 · ou/ow — long-form 16:9 lesson. The Two-Ring Circus: one ow, two sounds.
  { id: "ou-ow-16x9", component: OuOw16x9Reel, durationInFrames: OU_OW_16X9_DURATION, width: 1920, height: 1080 },
  // L14 · au/aw — long-form 16:9 lesson. The Sleepy Lawn: the sky runs night → dawn.
  { id: "au-aw-16x9", component: AuAw16x9Reel, durationInFrames: AU_AW_16X9_DURATION, width: 1920, height: 1080 },
  // 9:16 cuts — SAME narration and beat map, different worlds: a dusk treehouse, a night launch.
  { id: "ou-ow-9x16", component: OuOwPortraitReel, durationInFrames: OU_OW_PORTRAIT_DURATION, width: 1080, height: 1920 },
  { id: "au-aw-9x16", component: AuAwPortraitReel, durationInFrames: AU_AW_PORTRAIT_DURATION, width: 1080, height: 1920 },
  // L10 · ch/tch — long-form 16:9 lesson. Match Day: the rule is the letter BEFORE the sound.
  { id: "g-soft-hard-16x9", component: GSoftHard16x9Reel, durationInFrames: G_SOFT_HARD_DURATION, width: 1920, height: 1080 },
  { id: "c-soft-hard-16x9", component: CSoftHard16x9Reel, durationInFrames: C_SOFT_HARD_DURATION, width: 1920, height: 1080 },
  { id: "ge-dge-9x16", component: GeDgePortraitReel, durationInFrames: GE_DGE_PORTRAIT_DURATION, width: 1080, height: 1920 },
  { id: "ge-dge-16x9", component: GeDge16x9Reel, durationInFrames: GE_DGE_16X9_DURATION, width: 1920, height: 1080 },
  { id: "ch-tch-9x16", component: ChTchPortraitReel, durationInFrames: CH_TCH_PORTRAIT_DURATION, width: 1080, height: 1920 },
  { id: "ch-tch-16x9", component: ChTch16x9Reel, durationInFrames: CH_TCH_16X9_DURATION, width: 1920, height: 1080 },
  { id: "c-soft-hard-9x16", component: CSoftHardPortraitReel, durationInFrames: C_SOFT_HARD_PORTRAIT_DURATION, width: 1080, height: 1920 },
  { id: "g-soft-hard-9x16", component: GSoftHardPortraitReel, durationInFrames: G_SOFT_HARD_PORTRAIT_DURATION, width: 1080, height: 1920 },
  // ── Thumbnails (1280×720 stills, not videos) ────────────────────────────────
  //   npx remotion still thumb-phonics-a out/thumb_phonics_a.png
  // (for letters_phonics.mp4 — the A→Z Letter Sounds 16:9 video)
  { id: "thumb-short-vowels", component: ThumbShortVowels, durationInFrames: 1, width: 1280, height: 720 },
  { id: "thumb-letters-phonics", component: ThumbLettersPhonics, durationInFrames: 1, width: 1280, height: 720 },
  // Facebook shows a portrait crop even for a landscape video, so the 16:9 thumbnail
  // loses the mascot and the logo at the edges. This is the tall version.
  { id: "thumb-short-vowels-9x16", component: ThumbShortVowelsPortrait, durationInFrames: 1, width: 1080, height: 1920 },
  { id: "thumb-short-vowels-4x5", component: ThumbShortVowelsPortrait, durationInFrames: 1, width: 1080, height: 1350 },
  { id: "thumb-letters-phonics-4x5", component: ThumbLettersPhonicsPortrait, durationInFrames: 1, width: 1080, height: 1350 },
  { id: "thumb-letters-phonics-9x16", component: ThumbLettersPhonicsPortrait, durationInFrames: 1, width: 1080, height: 1920 },
  { id: "thumb-phonics-a", component: ThumbPhonicsA, durationInFrames: 1, width: 1280, height: 720 },
  { id: "thumb-phonics-b", component: ThumbPhonicsB, durationInFrames: 1, width: 1280, height: 720 },
  { id: "thumb-phonics-c", component: ThumbPhonicsC, durationInFrames: 1, width: 1280, height: 720 },
  // Community poll image (square) — the sound is on the image, the letters are the poll options
  { id: "post-quiz-q", component: PostQuizQ, durationInFrames: 1, width: 1080, height: 1080 },
  // Image-poll option tiles, A→Z — the poll's QUESTION text carries the sound, these are the
  // letters. `npm run render:poll_letters` writes all 26 to out/poll_letters/.
  ...LETTER_TILE_ENTRIES.map((e) => ({ ...e, durationInFrames: 1, width: 1080, height: 1080 })),
];
