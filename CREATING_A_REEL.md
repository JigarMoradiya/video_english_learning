# Creating a Reel — Step-by-Step Guide

Hands-on production steps for building a new phonics reel. For the *design/creative*
rules see **REEL_PLAYBOOK.md** (PART A = keep consistent, PART B = make each reel different).

---

## 0. Prerequisites (one-time)
- Node installed. From `eng/video-pipeline/`: `npm install` (already done).
- Extras used by the pipeline: `@remotion/google-fonts` (font), `ffmpeg` (audio convert),
  and — only if you need word-level caption timing — `faster-whisper` (Python).
- **Always run commands from the project dir:** `cd eng/video-pipeline` first
  (npx from the wrong folder gives "could not determine executable to run").

## Per-card architecture (IMPORTANT)
Each reel is **fully independent** — editing one never affects another.
- `src/reels/<id>.tsx` — one module per card: its BEATS (frame durations), SFX cue list,
  audio path, hueShift, and beat sequence. (`ai_ay.tsx` is the reference.)
- `src/reels/ReelBase.tsx` — shared shell (background + narration + music bed + SFX). Don't edit per card.
- `src/reels/index.ts` — the **REELS registry**; add a new card here (one line).
- `Root.tsx` — auto-registers one Composition per registry entry.
- Composition id uses **hyphens** (`ai-ay`, `oi-oy`) — Remotion forbids underscores.
- Each card's narration: `public/audio/<id>.mp3`. Output: `out/<id>.mp4`.
- **Render one card:** `npm run render:ai_ay` (or `npx remotion render ai-ay out/ai_ay.mp4`).

## Project map
```
eng/video-pipeline/
  src/
    reels/
      index.ts             # REELS registry (add a card here)
      ReelBase.tsx         # shared shell (bg + audio + music + sfx)
      ai_ay.tsx            # ai/ay reel module (BEATS, SFX, audio, sequences)
    Root.tsx               # registers one composition per reel (1080×1920, 30fps)
    data/
      comparisons.ts       # card data (rule, teams, example words, hueShift)
      tokens.ts            # font, colors, SAFE_BOTTOM, APP_NAME
      wordImages.ts        # word → app cutout / emoji lookup
    beats/                 # beat components (Hook, SameSound, ShyI, … ai/ay's set)
    components/            # Stage, LetterBuddy, Mascot, DrawWord, WordIllustration, KidsBackground …
  public/
    audio/<id>.mp3         # per-card narration (audio/ai_ay.mp3, audio/oi_oy.mp3, …)
    music_bed.mp3, mascot.png, logo.png, playstore.png, appstore.png
    words/                 # word illustration PNGs (train, snail, play, …)
    sfx/                   # SFX + phoneme .opus→mp3 (pop, sparkle, say_rain, …)
  tools/                   # make_sfx.py, make_music.py, transcribe.py
  out/                     # rendered <id>.mp4
```

### To add a new card (per-card, safe)
1. Copy `src/reels/ai_ay.tsx` → `src/reels/<id>.tsx`; give it its own BEATS, SFX, `audio/<id>.mp3`, hueShift, and beats (new creative treatment per the Playbook PART B).
2. Add it to the `REELS` array in `src/reels/index.ts` (id must use `-`, not `_`).
3. `npm run render:<id>`.

---

## Steps to build a new card (e.g. oi/oy)

### 1. Write the script
- 8 beats (see spine in the Playbook), playful + minimal, with a **fresh creative angle** (PART B).
- Keep the closing app-promo line **different** from other reels.

### 2. Record narration
- Record ONE English track from the script → save as `out/audio.mp3`, then
  `cp out/audio.mp3 public/audio.mp3`.
- Get its duration: `ffprobe -v error -show_entries format=duration -of csv=p=0 out/audio.mp3`.
- Note the **timestamp of each sentence** (and key words) — you did this for ai/ay.

### 3. Port the card data
- Add the card to `src/data/comparisons.ts`: `id`, `cardTitle`, `rule`, `teams`
  (marker + colorHex + zoneHint), example/quiz words, and a `hueShift` for its own color mood.
  Source of truth: `Learn English/UI/Phonics/Compare/ComparisonData.swift`.

### 4. Set beat timings
- In `ComparisonReel.tsx`, set `BEATS` frames from your timestamps (`seconds × 30`).
  **They must sum to the audio length in frames** (`round(duration × 30)`).
- Retime the in-beat moments to the words (reveals, illustration pops, quiz reveal, recap highlight).

### 5. Illustrations
- For each example word, add to `wordImages.ts`: an app cutout PNG in `public/words/`
  (copy from `Learn English/Resources/Assets.xcassets/Images/…`), else an emoji, else a
  small code-animated component (like rain/day) in `WordIllustration.tsx`.

### 6. Sound
- Phoneme/word audio: convert the app `.opus` you need →
  `ffmpeg -y -i "<...>/<word>.opus" -codec:a libmp3lame -q:a 5 public/sfx/say_<word>.mp3`.
  Place them **only in narration gaps** (avoid echo with the spoken word).
- Add SFX cues to the `SFX` array in `ComparisonReel.tsx` (`{from: <frame>, name, vol}`).
  Regenerate the kit with `python3 tools/make_sfx.py` if you want new sounds.

### 7. Render & verify
```
cd eng/video-pipeline
npm run render:oi_oy         # or: npx remotion render oi-oy out/oi_oy.mp4
```
- Spot-check frames without a full re-watch:
  `npx remotion still oi-oy out/f.png --frame=<n>` (then open the PNG).
- `npm run studio` to scrub interactively.
- Verify: audio has both streams + right length:
  `ffprobe -v error -show_entries format=duration:stream=codec_type -of default=noprint_wrappers=1 out/oi_oy.mp4`

---

## Gotchas learned on ai/ay
- **cwd**: always `cd eng/video-pipeline` before `npx remotion …`.
- **`.opus` won't play directly** in the render — convert to mp3 with ffmpeg first.
- **Echo**: don't play a word's recorded audio while the narration says that same word.
- **Descenders** (y/p/g): the word-reveal mask must release once the word is written (see `DrawWord`) or the tail gets clipped.
- **Output path**: run renders from the project root so files land in `out/` (not a subfolder).
- **Karaoke captions** (data-driven, 2026-07-24): copy the reel's `public/audio/<id>/<id>.phrases.json`
  → `src/data/<id>.timing.json`, `const track = makeTrack(phrases, audioSec)`, and add
  `<Captions track={track} keywordColor={keywordColorFor(data)} bottom={490} maxWidth={940} fontSize={40} />`
  as a top-level child of `<ReelBase>` (the 16:9 video uses `bottom:70 maxWidth:1360`). The band sits in the
  free zone (y≈1150–1450) above `SAFE_BOTTOM`. The old proportion-guessing `Subtitles.tsx` is dead — do not use it.
- Beat durations **must sum to the audio frame count**, or video/audio drift.
