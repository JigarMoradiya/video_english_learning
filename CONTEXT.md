# Video / Reel pipeline — full context

Handoff doc. Everything needed to pick this up in a fresh session.
See also `REEL_PLAYBOOK.md` (per-beat reel structure) and `CREATING_A_REEL.md` (step-by-step
for the 9:16 comparison reels).
**Next series is planned and parked on assets — read `docs/vocab_series_plan.md`.**

---

## 1. What this is

Code-generated phonics teaching videos for **Kids English Learning** (company: *Vedaavi
Learning Apps*, mascot: a bear). Built with **Remotion** (React/TS) → mp4.

**Hard constraints, set by the user and non-negotiable:**

- Fully code-generated. **No human on camera. No TTS** — the user records all narration.
- Kids-friendly, playful, **constant motion** (something animates every second).
- **Every video must feel DIFFERENT** from the last, and better than the last.
- Reuse the app's own recorded audio and images wherever possible.
- **Script first.** Write the script → user confirms → *then* build. Never build first.

**Location:** `/Users/jigarmoradiya/Documents/newProject/eng/video-pipeline/`
This is a **separate git repo** from the iOS/Android apps.

---

## 2. Git

- Remote: `https://github.com/JigarMoradiya/video_english_learning` (branch `main`)
- `out/` is gitignored — mp4s regenerate from source. Source + `public/` assets are tracked.
- **Push gotcha:** the machine's stored git credential is a different GitHub account
  (`jigar-moradiya-medical-circle`) → plain `git push` returns **403**. Pushes have been done
  with a one-time token URL. `origin` is deliberately left **token-free**.
  A permanent fix (SSH key, or `gh auth login` as JigarMoradiya) has been offered but not
  yet done — worth doing.

---

## 3. What exists today

Run `npx remotion compositions` for the live list. Render with `npm run render:<name>`.

### Videos

| Composition | Size | Length | What it is |
|---|---|---|---|
| `ai-ay` | 1080×1920 | 1:13 | L13 Vowel Teams comparison reel |
| `oi-oy` | 1080×1920 | 1:19 | L14 Diphthongs |
| `oa-ow` | 1080×1920 | 1:17 | L13 Vowel Teams |
| `c-k-ck` | 1920×1080 | 2:19 | L5 "-ck Rule" — first long-form YouTube video |
| `oo` | 1920×1080 | 1:54 | L13 "Which SOUND?" moon/book |
| `letters-phonics` | 1920×1080 | 3:55 | **A→Z Letter Sounds** ("A says aaa, A for Ant") |
| `letter-recognition` | 1920×1080 | 2:46 | A→Z game-board ("A says a") + practice |
| `short-vowels` | 1920×1080 | 2:45 | L2 Short Vowels: learn → practice → listen |
| `short-vowels-9x16` | 1080×1920 | 2:45 | same content, **distinct purple theme** |
| `letters-p1-9x16` | 1080×1920 | 2:04 | Letter Sounds A→Z, **part 1** (pink) |
| `letters-p2-9x16` | 1080×1920 | 1:36 | Letter practice, **part 2** (pink) |
| `letter-a-short` … `letter-z-short` | 1080×1920 | ~30–42s | **A–Z Letter Shorts** — 26-episode daily series, one template. `npm run render:letter_shorts` |
| `mouth-chart` | 1500×1180 | still | review sheet for the 13 phonics mouth shapes |

### Stills (thumbnails / social)

| Composition | Size | What |
|---|---|---|
| `thumb-phonics-a/b/c` | 1280×720 | 3 thumbnail variants for `letters_phonics.mp4` (indigo) |
| `post-quiz-q` | 1080×1080 | square quiz card (sound in a speech bubble) |
| `poll-letter-a … -z` | 1080×1080 | A–Z image-poll option tiles — `npm run render:poll_letters` |

---

## 4. Architecture

- `src/reels/index.ts` — the **REELS registry**. Adding a video = one entry
  (`id`, `component`, `durationInFrames`, optional `width`/`height`).
  `Root.tsx` maps it to a `<Composition>`. Stills are entries with `durationInFrames: 1`.
- **Composition ids use hyphens** — Remotion forbids underscores.
- **Durations are computed at module-eval** so they're baked into the registry. Timing helpers
  live in `src/lib/timing.ts` (`sec(s, fps)`, `makeTrack`, `planBeats`).
- `src/lib/motion.ts` — `bob`, `pulse`, `wiggle` (idle motion; everything should move).
- `src/data/tokens.ts` — `font`, `palette`, `hex/tint/shade/lum`, `letterColorFor`,
  `cardStroke(imgHex, fallback)` (contrast-safe card borders from an image's dominant colour).

### The A–Z Letter Shorts series (26 episodes, one template)
`src/reels/letter_short.tsx` renders all 26 — an episode is a row in `src/data/letters.ts`,
not a module. Everything per-letter is DERIVED: accent colour and sky tint
(`letterColorFor` → `paperBgFor`), cloud silhouette, mouth articulation, confetti seed,
example phrase, praise take, next letter. Z branches to a store-download finale instead
of "Tomorrow".
Beats: cover → letter draws itself (`TraceGlyph`) with its mouth shape → "More \<letter\>
words" spoken one at a time with the card highlighted, then all cards reset and hold →
"Now it's your turn!" + a silent answer gap → "Tomorrow: \<next\>".

### Per-video isolation
Each video is its own module in `src/reels/<id>.tsx`. Editing one never touches another.
Shared pieces live in `src/components/`.

### Key shared components
`Mascot`, `Confetti` (seeded/deterministic), `StoreFlow` (the app-store phone mock),
`StoreOutro` / `StoreOutroPortrait`, `TraceGlyph` (self-drawing letters), `LetterGrid`,
`RecognitionPanel`, `Mouth`/`VowelFace` (talking mouths), `BrandMarks`, `Watermark`,
`LettersPinkFx` (incl. **`CollapseRow`** — see below),
**`PaperSky`** (the light "Paper Craft Daylight" world: `paperBgFor`, `PaperMotes`,
`PaperClouds`, `paperCard`, `ContactShadow`, `LetterRail`),
**`PhonicsMouth`** (13 real articulations — `Mouth.tsx` has only 5 open-vowel ellipses,
which would put a wide-open mouth on /b/; consonants need lips-shut, teeth-on-lip,
tongue-tip, etc. Kept separate so Short Vowels can't regress).

---

## 5. Rules learned the hard way — apply these from the start

These each cost multiple review rounds. Don't rediscover them.

### Layout
- **Use `CollapseRow` (in `LettersPinkFx.tsx`) for staged beats.** One centred/anchored flex
  column; each beat is a row whose height is `grid-template-rows: <p>fr` (its OWN natural
  height) *and* whose content is `scale(p)`. Result: no holes when a beat fades, overlap is
  impossible, and nothing is ever clipped mid-transition.
  Two earlier attempts failed: opacity-only left a 487px hole; fixed pixel heights +
  `overflow:hidden` sliced the mascot's feet.
- **NEVER overlap content.** This is the single most-repeated piece of feedback.
- **Reserve zones with named constants, don't eyeball them.** The 16:9 c/k/ck shipped with
  panels starting at y=205 while the beat overlays rendered from y=40 down — the /k/ badge,
  the c-k-ck chip row and the lightbulb all landed ON the middle zone's street sign. Fixed
  by declaring the bands (`BAND_H` / `PANEL_TOP` in `WordStreet.tsx`): headline 0–290,
  stage 300–860, caption 880–1080, and nothing crosses. Any new overlay must fit its band.
- **A held container must never be empty.** Panels/slots that stay on screen across beats
  need content in EVERY beat, including a resting state (dimmed word, ghost `?` slot). The
  c/k/ck panels were 630px tall with a 168px face and nothing else for most of the video.
- **Never clip content.** Check mid-transition frames, not just the resting state.
- **`CkWordChip` sizing rule.** Card width ≈ `size × 1.8`, and a SPOKEN card pulses to
  1.32× (grows `0.16 × width` into each neighbour). Max size for n cards in a container:
  `container / (1.8 × (n + (n−1) × 0.16))`, gap ≥ `0.16 × size × 1.8`. The chip renders in
  SIX places (WordStreet ×2, SeeIt ×2, OoWorld ×2) — when resizing, re-derive ALL of them;
  fixing one by eye is how the same overflow shipped four times.
- **`transform: scale()` does NOT reserve layout space.** Scaling a target grapheme inside
  a word card made "kick"'s enlarged `ck` render outside the card border while "duck"/"rock"
  (which had slack) looked fine. Pulse the whole CARD, not a child of it.
- **Bound `<Captions>` to the wrap beat** (`<Sequence from={0} durationInFrames={wrap.from}>`).
  Left unbounded it keeps rendering through the outro and sits behind the store phone mock.
- **A 9:16 cut must use the same background component as its 16:9 sibling.** `CkBackground`
  is fractional/dimension-aware and fills any size; the portrait c/k/ck shipped with a flat
  static gradient and read as a different video.
- **Verify at FULL RESOLUTION.** A 250px-wide contact sheet is for finding dead screens and
  nothing else — card overflow, caption collisions and safe-area breaches are all invisible
  at that scale. Crop the real frame at 1:1 before calling anything done.
- **Never paint an opaque background inside a scene** — the global background + ambient
  particles live behind every scene and must keep running. An opaque outro background made
  the download beat go flat.
- **The background must be ONE global layer** driven by the absolute frame. Per-scene
  backgrounds reset their animation at every cut (bubbles visibly jumped).
- Portrait: ~90px side safe margin; bottom band gets covered by platform UI, so put pagers
  and counters at the **top**. Intro/outro cards anchor at `top: 300`.
- **Frame 0 must be a complete cover** (it's the upload thumbnail). Don't start mid-spring.
- Sibling videos must be built from an **identical stack** or elements drift between them.

### Content
- **Long narration lines need staged visuals.** Transcribe with whisper for word-level times
  and land a new visual on every phrase. A static card over a 10–14s line is an instant reject.
- **A changing caption is NOT a changing screen.** Explicit user rule: no empty screen, no
  audio-only stretch, and "only the caption moved" counts as empty. Every spoken phrase must
  move something in the stage. Audit a finished render with
  `ffmpeg -i out/x.mp4 -vf "fps=1,scale=470:-1,tile=4x4" sheet_%02d.png` and LOOK at every
  second before shipping — the c/k/ck 16:9 had 6 dead stretches that a spot-check missed.
- **Mirror the app's real flow and word lists** — read the actual module first, never invent
  generic phonics content.
- **Every video needs a DIFFERENT closing CTA line.** The app is called "English Learning",
  never "games".
- Don't teach a partial pattern as a rule (see `feedback_no_false_rules` in memory).

### Branding (`BrandMarks.tsx`)
- **Exactly ONE logo on screen at a time.**
- One shared size: `LOGO_BADGE_SIZE = 200` (it was 132/172/176/178 in different places — the
  user noticed).
- Logo sits on the app's own gradient (iOS KidsGradient `.skyLavender`, #E0EEFF→#EDE0FF).
- `CardBadge` **straddles** an image card's corner (⅔ in, ⅓ out); per-word corner via
  `badgeCorner()` so it never covers the subject. Parent must not clip.
- `HeaderLogo` = plain logo inside a title pill (no plate).
- A→Z videos badge only **7 letters each, from different sets**:
  phonics `C F J M P T X`, recognition `E H K N R V Z`.
- **`WATERMARK_ENABLED`** flag renders a clean no-logo version of any video.
- **Do NOT watermark with ffmpeg** — the user rejected it (it re-encodes). `add_watermark.sh`
  exists in the iOS repo but is unused for these.

### Themes (keep videos visually distinct)
- Short Vowels 16:9 — light pastel
- Short Vowels 9:16 — **purple** `#2E1A5E → #4A2A8E → #6A3AB0`, bubbles, vertical rise
- Letters 9:16 pair — **pink**, hue-rotated from that purple at identical S/L:
  `#5E1A3A → #8E2A59 → #B03A71`. P1 ambient = music notes, P2 = rising stars.
- Thumbnails — **indigo** (matches `letters_phonics`' own #5B6CF0 title)
- Community poll tiles — golden-angle hues, all 26 distinct

---

## 6. Audio

- App clips are **`.opus`** — Remotion can't play them. `tools/prep_*.sh` converts to mp3
  into `public/audio/<topic>/`.
- **Never trim a clip** — many have a spoken closing line after the word.
- Durations are **measured with ffprobe and hardcoded** in the data files, so composition
  length is known at module-eval.
- Word-level timing: `faster-whisper` (installed at `~/Library/Python/3.9`), see
  `tools/transcribe.py`. Used to place beats on phrases. For a known script use
  `tools/align_audio.py <audio> <script.txt>` (forced alignment → phrases/words/srt).
- **Whisper cannot time REPEATED identical words** — it collapses them. C's "meow meow
  meow" came out 0.6s wrong. `tools/refine_phrase_onsets.py` re-times from the RMS
  envelope's syllable peaks (with a prominence test, because the gap between two meows
  only DIPS, never reaches silence). 13 of 26 letters were mistimed before this existed.
- **Every A–Z clip ends with a spoken EXAMPLE PHRASE** after "\<Letter\> for \<Word\>"
  ("A tiny ant walks fast", "Squawk squawk", "Rrrrr") — 2.5–4s of real narration, not
  trailing silence. Text + word times in `src/data/letterPhrases.json`, reviewed source
  text in `tools/scripts/tails.json`, built by `tools/build_letter_phrases.py`.
- **A wrong `staticFile` path renders SILENT, not an error.** After any audio path change,
  measure energy in each expected window — that check is the only thing standing between
  you and 26 mute videos.

### Audio layout
- `public/audio/common/` — **shared framing lines** (more, words, now_its_your_turn, 7
  praise takes, 4 Z-finale takes). All shared lines go here.
- `public/audio/words/` — 102 per-word clips for the vocabulary tiles, with durations in
  `src/data/extraWordAudio.json` (`tools/prep_extra_words.py`). A word with no clip still
  takes its turn silently, so episodes ship before every clip lands.
- `public/audio/letters/` — the app's 26 letter sentences · `letter_names/` — the 26 bare
  letter names (`tools/prep_letter_names.sh`; `prep_recognition.sh` only ever built these
  into a scratch dir).
- SFX in `public/sfx/`: pop, sparkle, twinkle, whoosh, correct, drumroll + the softer
  `chime_soft` / `swoosh_soft` (the user found the originals harsh).
- Shared assets in `public/`: `mascot.png`, `logo.png`, `app_icon.png`, `music_bed.mp3`,
  `playstore.png`, `appstore.png`, `store/11–15.png` (real screenshots).

---

## 7. Publishing

**App store links (real):**
- iOS `https://apps.apple.com/us/app/kids-english-learning/id6759282211`
- Android `https://play.google.com/store/apps/details?id=com.vedaavi.english.learning`

**Channel:** created 2026-07-24, so it's new. External links in descriptions were blocked
until **Advanced features** was verified in YouTube Studio (Settings → Channel → Feature
eligibility) — now unlocked.

**Published:** `letters_phonics.mp4` → https://www.youtube.com/watch?v=Zf9QRIorkoo

**YouTube chapter rule that matters:** every chapter must be **≥10 seconds** or YouTube
discards the *entire* chapter bar. The A–Z letters are 8–9s apart, so per-letter chapters are
impossible — use 5 section chapters in the description and put the 26-letter index in a
**pinned comment** (comment timestamps are clickable but don't feed the chapter parser).

**Community posts** — YouTube offers: image-only post · image poll (text question, image
options) · text poll · quiz (all text). There is **no** image-question-with-text-options.
So quizzes use an **image poll**: question text carries the sound, `poll-letter-*.png` tiles
are the options.

**Abacus app** (the other app, `/Users/jigarmoradiya/Documents/newProject/abacus`) uses
**OneSignal** for push — used for cross-promo to the English app.

---

## 8. Open / next

**Series #2 — Themed Vocabulary Shorts: PLANNED, parked on assets.**
Read `docs/vocab_series_plan.md`. Asset checklist `docs/vocab_assets_needed.md`
(125 words ready · 152 images + 130 audio clips needed to complete all 16 episodes;
10 episodes are buildable today with zero new assets). Regenerate the checklist after
adding files. Theme lists in `tools/vocab_themes.py`.

Owed from the A–Z series:
- ~~`cta.mp3`~~ **DONE** — `cta_1..4.mp3` are in `public/audio/common/` and rotate per
  letter via `CTA_POOL`/`ctaFor()`; 4 and 7 are coprime with `PRAISE_POOL` so no two
  episodes share a (praise, closing) pair.
- Optional: the 26 cover frames as uploadable thumbnails.

Older, still open:
- ~~9:16 cut of `oo`~~ **DONE** — `oo-9x16` is registered and renders (1:58).
  `c-k-ck-9x16` also exists and, per user instruction,
  is the SAME design as the 16:9 cut re-laid out for portrait — `WordStreetPortrait.tsx`
  mirrors `WordStreet.tsx`'s content state machine, and `c_k_ck_portrait_beats.tsx`
  mirrors `c_k_ck_beats.tsx`. Keep them in step: a change to one belongs in both.
- **11 comparison cards** remain of 16. Next agreed: **th (thin/that)** — script first.
- Answer-reveal images for the A–Z community quizzes (offered, not built).
- Thumbnails for the two 9:16 Letter parts and Short Vowels.
- Permanent git auth fix (SSH or `gh auth login`). **Two PATs have now been exposed in
  chat and should be revoked** — this keeps recurring because the machine's stored
  credential is a different account (`jigar-moradiya-medical-circle`), so plain
  `git push` 403s.

---

## 9. Working style the user expects

- Do **one module at a time**, wait for confirmation before moving on.
- **Read an existing working implementation before writing new code.** This has been a
  repeated failure point.
- **Never add business rules that weren't asked for.**
- Pitch teaching/UX ideas proactively (1–3 per module, menu-style) — don't only execute.
- Verify visually: render stills at key frames and *look* at them before a full render.
  Measuring pixels beats eyeballing (used to confirm mascot position, overlap, safe areas).
