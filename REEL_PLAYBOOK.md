# Phonics Reel Playbook

Built from the finished **ai/ay** reel (`out/ai_ay.mp4`, 72.9s). Use this to make every
next comparison reel (oi/oy, oa/ow, c/k/ck, …) fast and on-brand.

Two layers:
- **PART A — MUST FOLLOW** (the brand system: keeps every reel recognizably "ours").
- **PART B — MUST VARY** (creative treatment: every reel should feel *different*, not same tone).

---

## PART A — MUST FOLLOW (brand system, keep consistent)

### Tech / format
- **Remotion** (React/TS) → mp4, **1080×1920 (9:16)**, **30 fps**.
- Project: `eng/video-pipeline/`. Preview: `npm run studio`. Render: `npx remotion render ComparisonReel out/<id>.mp4`.
- One composition `ComparisonReel`, driven by card data + a beat timeline.

### Layout & motion
- Content lives in the **UPPER-MIDDLE**; reserve **~470px at the bottom** (`SAFE_BOTTOM`) for the platform's caption/buttons.
- **Constant motion** — everything bobs / pulses / wiggles; background never static.
- **Minimal on-screen text**; the **voice teaches**.
- **Karaoke captions ARE now on** (data-driven, 2026-07-24). Each reel imports its recorded word
  timings (`src/data/<id>.timing.json`, copied from `public/audio/<id>/<id>.phrases.json`), builds a
  `makeTrack(phrases, audioSec)`, and renders `<Captions track keywordColor bottom maxWidth fontSize>`
  as a **top-level child of ReelBase** (absolute frame). Portrait reels place the band at `bottom:490`
  (the free zone y≈1150–1450, above `SAFE_BOTTOM`); the 16:9 video uses `bottom:70`. `keywordColorFor(data)`
  auto-tints each team's marker + quiz words. (The OLD `Subtitles.tsx` was removed for guessing word
  positions by proportion — the new per-word timing fixes that; do NOT resurrect `Subtitles.tsx`.)
- **Audio + timing files live per video** under `public/audio/<id>/` (`<id>.mp3` + `.phrases/.words.json` + `.srt`).
- Each beat **fades/slides in** (in `Stage`), keeping exact sequence boundaries so audio stays synced.

### Look
- **Font: Fredoka** (rounded), via `@remotion/google-fonts`. Words are **bold**.
- **Background = app HomePageBackground port** (`KidsBackground`): soft 3-stop gradient + floating colored orbs + small sparkles. Give each card its own **`hueShift`** for a distinct color mood.
- **App mascot** (bear) hosts moments; **logo + Google Play + App Store badges** close every reel.
- **Word writing** = bold Fredoka **wiped on by the pen ✍️** (`DrawWord`) — pen leans right, descenders not clipped, team letters (the spelling pair) tint + pulse (karaoke letter-highlight) when the word completes.
- **Illustrations** per word: real app cutouts if they exist (train/snail/play) → code-animated (rain cloud+drops, day sun, paint brush, stay house) → emoji fallback. Lookup in `WordIllustration` / `wordImages.ts`.

### Audio (the sync model)
- **User records ONE English narration** from the script → `out/audio.mp3` → copy to `public/audio.mp3`.
- Beat lengths come from the **script timestamps** (sentence-level); set them in `BEATS` (must sum to audio length in frames).
- **Soft music bed** under the voice (`make_music.py` → `public/music_bed.mp3`, ~11% vol, fades).
- **Real phoneme `.opus`** from the app spliced in **only where narration has a gap** (no echo). Convert with ffmpeg → `public/sfx/say_*.mp3`.
- **SFX kit** (`tools/make_sfx.py` → `public/sfx/*.mp3`): pop, boing, question, sparkle, twinkle, brave, correct, drumroll, whoosh, tick. Placed via the `SFX` cue list (frame → file → volume) in `ComparisonReel`.
- Word-level timing helper available if needed: `faster-whisper` + `tools/transcribe.py`.

### The 8-beat spine (reference structure from ai/ay)
1. **Hook** – the two spellings arrive + a friendly hook (mascot).
2. **Same sound** – show they share the sound (big sound + mouth + example chips).
3. **Puzzle** – "so how do you choose?" (❓).
4. **Rule part 1** – the memorable rule for spelling #1 (personified) + example word written.
5. **Rule part 2** – the rule for spelling #2 (personified) + example word written.
6. **See it** – quick extra examples with illustrations.
7. **Quiz** – blanked word → choices → suspense → reveal + confetti.
8. **Wrap** – recap + logo + store badges (vary the CTA line every reel).

### Per-reel checklist
1. Port the card into `comparisons.ts` (rule, teams, example words, `hueShift`).
2. Write the script (playful, minimal, personified) → user records `audio.mp3`.
3. Get sentence + key-word timestamps → set `BEATS`.
4. Wire illustrations (app cutout / animate / emoji) for each example word.
5. Place SFX cues + phoneme `.opus` at the right frames.
6. Render, verify key frames, iterate.

---

## PART B — MUST VARY (make every reel feel different)

**Do NOT clone ai/ay's exact treatment.** Keep PART A consistent, but give each reel a **fresh creative angle** so the series doesn't feel repetitive. Vary at least a few of these per reel:

- **The personification / metaphor.** ai/ay used "shy i / brave y". oi/oy could be a totally different character idea (e.g. noisy toys, a royal "oy!" shout, twins) — invent a new hook each time.
- **The hook opening.** Don't always do "two best friends". Try a question, a mistake/❌ wrong-spelling gag, a race, a story cold-open.
- **The signature visual gimmick.** ai/ay had the 🤫 secret + the i walking to the end. Each reel gets its own one memorable bit.
- **Pacing & energy / tone.** Some calm and sing-song, some fast and punchy.
- **Color mood** via `hueShift` (+ the card's own gradient).
- **SFX character** — swap which sounds lead, try a new signature sound.
- **Quiz / interaction style** — different reveal, different celebration.
- **Closing CTA line** — always a *different* app-promo line (never reuse wording).

Rule of thumb: **brand = same, story = new.** A viewer bingeing 5 reels should feel each one is its own little episode, not a reskin.
