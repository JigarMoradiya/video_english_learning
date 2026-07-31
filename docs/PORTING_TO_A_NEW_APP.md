# Porting this pipeline to a new app

The **method** behind the videos in this repo — not a list of what shipped, but the constraints,
architecture and hard-won rules that make the next video fast instead of painful.

Written to be lifted onto a different product. The immediate target is **Abacus** (math learning),
and section 9 maps every teaching device across. The method itself is subject-agnostic; only the
devices change.

Companion docs: `CONTEXT.md` (full handoff state) · `REEL_PLAYBOOK.md` (beat structure) ·
`CREATING_A_REEL.md` (step-by-step production).

Also published as a browsable page: https://claude.ai/code/artifact/f902ede8-8382-4abe-bf30-6f9f73653821

---

## 1. The five constraints

Everything downstream is a consequence of these. Decide the equivalents for a new app **before
writing code** — each one rules out a whole category of shortcut.

1. **Fully code-generated. No camera, no TTS.**
   Every frame is React. Every voice is a real human recording. This is what makes a 26-episode
   series possible from one template — and it's why narration timing drives the build rather than
   the reverse.

2. **Script first. Confirm. Then build.**
   Never build before the script is approved. Beat structure, visuals and audio length all derive
   from the script, so a script change after the build is a rebuild.

3. **Constant motion — something animates every second.**
   A static card over a spoken line is an automatic reject. Idle bob, float and pulse live on
   everything by default (`src/lib/motion.ts`).

4. **Every video feels different from the last.**
   Brand identical, story new. A viewer bingeing five should feel five episodes, not one reskinned
   five times.

5. **Reuse the app's own audio and art.**
   The app already holds thousands of recorded words and hundreds of illustrations. Sourcing from it
   means a new video needs zero new assets in the common case — the difference between a series and
   a one-off.

---

## 2. Making one video

The one genuinely sequential part of the method — each step consumes the previous step's output.
Skipping step 1 is how you end up teaching content the app doesn't contain.

1. **Read the real app module first.** Open the actual screen you're recreating and copy its *real
   flow and real word lists*. Never invent generic content. The video is a trailer for a feature
   that exists — if they diverge, the app looks broken.

2. **Write the script — get it approved.** Playful, minimal, one idea on screen at a time. The voice
   teaches; on-screen text is labels only. Give the video a **fresh metaphor and one signature gag**
   at this stage, not later. The closing CTA line must differ from every previous video.

3. **Record one narration track.** A single human take for the whole video. No TTS. Measure it:
   `ffprobe -v error -show_entries format=duration -of csv=p=0 <audio>`.

4. **Force-align to get word times.**
   `tools/align_audio.py <audio> <script.txt>` emits `.phrases.json`, `.words.json`, `.srt`.
   This replaced hand-counting frames and is the highest-leverage tool in the pipeline.
   **Measured times, never an even stagger** — an even stagger drifts audibly against real speech.

5. **Plan beats from the data, not by counting.** `src/lib/timing.ts` — `makeTrack()` turns phrases
   into a track; beats are *phrase-index ranges* that auto-tile to the audio length with no gaps.
   `beat.word("cat")` gives the exact frame a word is spoken. Durations compute at module-eval so
   composition length is known without rendering.

6. **Build the video as its own module.** One file per video in `src/reels/`. Shared pieces come
   from `src/components/`. Editing one video must never touch another.

7. **Verify with a contact sheet, then at full resolution.**
   `ffmpeg -i out/x.mp4 -vf "fps=1,scale=470:-1,tile=4x4" sheet_%02d.png` and **look at every
   second** before shipping. Then crop real frames at 1:1 — overflow, caption collisions and
   safe-area breaches are all invisible on a contact sheet.

---

## 3. Why 42 videos stayed maintainable

Three structural decisions carried the whole series. Copy these on day one; retrofitting them later
is expensive.

### A registry, not a folder of scripts
`src/reels/index.ts` holds one entry per video — `{ id, component, durationInFrames, width?,
height? }` — and `Root.tsx` maps each to a composition. Adding a video is one line. Per-video
`width`/`height` means landscape and portrait cuts coexist without a second project. Stills are
entries with `durationInFrames: 1`. Composition ids use **hyphens** (Remotion forbids underscores).

### Per-video isolation, shared components
Each video owns its beats, cue list, audio path and colour mood. Nothing is shared except
*components*. This let 16 long videos ship without any regressing — and why a mid-refactor of one
video didn't threaten the 26 letter shorts.

### One template, N episodes — the biggest win
The 26 letter shorts are **not 26 modules**. They're one template plus 26 rows of data. Everything
per-episode is *derived*: accent colour, background tint, cloud shape, mouth articulation, confetti
seed, example phrase, praise take, next letter. Adding a word to an episode is a data edit plus
three generator scripts.

> **This is the pattern to reach for with Abacus.** Numbers 1–10, then complement pairs, then place
> value — each set is one template and a data table, not a folder of near-identical files. Budget
> the effort into the template and the data model; the episodes then cost almost nothing.

---

## 4. Aspect ratio & format

Decided by narration length, not preference.

- **Under ~90s → 9:16 first.** It posts as a Short/Reel on all three platforms, and that's where
  reach is.
- **Over ~90s → 16:9 YouTube video first**, content-rich and filling the frame with captions on.
  Cut the vertical version later.
- **4:5 for Facebook feed** — taller than 16:9, occupies more of the scroll without being a Reel.
- **A vertical cut is not a crop.** It shares the narration and beat map (imported, never
  copy-pasted) but gets a genuinely different theme and world. Re-cropping a landscape video reads
  as a lazy repost.
- **Frame 0 is the upload thumbnail.** It must be a finished, complete image. Nothing may start
  mid-spring — only idle motion, which has a defined value at frame 0.
- **Reserve the bottom band in portrait** (`SAFE_BOTTOM ≈ 470px`). Platform UI covers it. Counters
  and progress rails go at the *top*.

---

## 5. The layout law

Each of these cost multiple rounds of rejection. The most valuable section here — apply from the
first frame rather than rediscovering them.

- **Every spoken LINE gets its own visual change.** Not every beat — every *line*. And a changing
  caption does not count as a changing screen: if only the subtitle moved, the screen is empty.
  No audio-only stretch anywhere.
  *(Cost of learning it: ~10 review rounds on one video.)*

- **Declare bands as named constants. Never eyeball position.** One video shipped with panels
  starting at y=205 while overlays rendered from y=40 down — three elements landed on a street sign.
  Fixed by declaring `headline 0–290 · stage 300–860 · caption 880–1080` and letting nothing cross.
  Any new overlay must fit inside a band.

- **Use a collapsing row for staged beats** (`CollapseRow` in `LettersPinkFx.tsx`). One anchored
  flex column where each beat is a row whose height is its own natural height scaled by progress,
  and whose content scales too. No holes when a beat leaves, overlap impossible by construction,
  nothing clipped. Two earlier approaches failed: opacity-only left a 487px hole; fixed pixel
  heights with `overflow:hidden` sliced the mascot's feet mid-transition.

- **`transform: scale()` does not reserve layout space.** Scaling a letter inside a word card pushed
  it outside the card border — but only for words with no slack, so it looked fine in testing.
  Pulse the whole card, never a child of it.

- **A container that stays on screen must never be empty.** Panels persisting across beats need
  content in *every* beat, including a resting state — a dimmed word, a ghost `?`. One video had
  630px-tall panels holding a 168px face and nothing else for most of its runtime.

- **The background is ONE global layer on the absolute frame.** Per-scene backgrounds restart their
  animation at every cut (drifting particles visibly jump). Never paint an opaque background inside
  a scene either; the global ambient layer must keep running behind everything.

- **Never overlap. Never clip.** Check mid-transition frames, not just resting states.

### On pictures
- **A picture must show the word, not its contents.** A cage is not a bird. Sounds obvious; was got
  wrong repeatedly.
- **Composite emoji break.** Anything joined with a zero-width joiner splits into its parts and
  renders as garbage. Test every emoji in an actual frame.

---

## 6. Same brand, new story

### Locked across every video
- One rounded display font, words always bold
- Exactly **one logo on screen at a time**, at one shared size
- Content anchored upper-middle; safe areas respected
- Mascot hosts; store badges close
- Self-synthesized music bed and SFX kit

### Must change every video
- **The world.** Each video gets a place: a word train, a lily pond, an open sea, a two-ring circus,
  a match-day pitch. Not a background — a location.
- **The metaphor.** Characters that embody the rule — "shy i, brave y", a soft-c snake, a loud oy
  versus a calm oi.
- **One signature gag** the viewer remembers.
- **Colour mood, pacing, which SFX leads, quiz reveal style.**
- **The closing CTA line** — never reuse wording.

### The sibling trick
When two videos should feel related but distinct, **hue-rotate one palette at identical saturation
and lightness**:

| Video | Palette |
|---|---|
| Short Vowels 9:16 | `#2E1A5E → #4A2A8E → #6A3AB0` (purple, bubbles, vertical rise) |
| Letters 9:16 pair | `#5E1A3A → #8E2A59 → #B03A71` (pink — same S/L, rotated hue) |
| Brand ground | `#E0EEFF → #EDE0FF` (the app's own gradient) |

They read as siblings, never as duplicates.

---

## 7. Audio

> **A wrong asset path renders SILENT, not an error.** After any audio path change, measure energy
> in each expected window. That check is the only thing standing between you and 26 mute videos.

- **Convert `.opus` to mp3 first** — the renderer can't decode opus.
- **Never trim a clip.** Many app recordings have a spoken line *after* the word. Play the whole
  thing and stage a visual over the tail.
- **Measure every duration with ffprobe and hardcode it** in the data file, so composition length is
  known at module-eval.
- **Never echo.** Don't play a word's recording while the narration says that same word. Place
  recorded clips only in narration gaps.
- **Alignment can't time repeated identical words** — it collapses them. "Meow meow meow" came out
  0.6s wrong; 13 of 26 episodes were mistimed before a second pass re-timed them from the audio
  envelope's syllable peaks (`tools/refine_phrase_onsets.py`).
- **Missing audio should degrade, not block.** A tile with no clip still takes its turn silently, so
  episodes ship before every recording lands.

### Music — synthesize your own. Not optional.
The bed is generated by `tools/make_music.py` — pure Python sine synthesis, no samples. Facebook
still geo-muted a reel because the original progression was C–Am–F–G, the most common progression in
pop, and their fingerprinter matched it against a licensed catalogue. Rewriting it as a **quartal
pad on a 13-second loop** fixed it, confirmed across two uploads.

**Avoid common progressions and 4-bar-aligned loop lengths.** Trending audio only earns distribution
when attached *in-app at upload*; baked into the mp4 it gets none of the lift and all of the risk.

---

## 8. Publishing

One platform, one job. The same text pasted three times underperforms on all three.

| Platform | What the copy is for | Leads with |
|---|---|---|
| YouTube | Search — keywords, chapters, word lists all get indexed | Front-loaded keywords in the title and first 150 characters |
| Facebook | Comments, which drive reach | Emotion, then a question. Link in first comment, not the caption. |
| Instagram | The stop-scroll — only line one is visible | A curiosity hook specific to that episode |

> **YouTube chapters need ≥10 seconds between every entry.** One violation silently disables
> chapters for the entire video, with no warning. A 6-chapter list with a single 5-second gap showed
> no chapters at all. Check every gap before pasting.

- **Only the first 3 hashtags display** above a YouTube title. Spend them well.
- **`#viral` and `#trending` do nothing** — ignored by ranking, attract no relevant audience.
- **Weave keywords into sentences**, never a labelled keyword list — a visible "also searched as"
  block reads as gaming the system and costs trust.
- **Cross-link every video to its neighbours in the sequence.** A curriculum compounds; isolated
  clips don't.

---

## 9. Porting to Abacus

### The mapping

| Phonics device | What it does | Abacus equivalent |
|---|---|---|
| Letter draws itself (`TraceGlyph`) | Shows how the shape is formed, stroke by stroke | **Bead slides itself** — the bead travels its rod in real time, with the finger shown |
| "A says aaa… A for Ant" | Symbol → sound → anchor image | **"3 is three beads"** — numeral → bead pattern → countable objects |
| Mouth shape hint | Lets the *parent* see how the sound is physically made, and correct it | **Finger technique** — which finger moves which bead, thumb up / index down. Same role, same value, arguably stronger. |
| "More A words" — 6 tiles | One pattern, many instances | **"More ways to make 7"** — 5+2, 4+3, 6+1, tiles lighting as each is spoken |
| "Your turn!" + silent gap | Active recall — the child produces, not just receives | **Show a problem, hold the gap, then reveal** with the bead move |
| "Tomorrow: E" | Turns episodes into a habit | **"Tomorrow: number 4"** — identical daily loop |
| Comparison card (ai vs ay) | Two options, one rule for choosing | **Which complement?** Adding 4 as −1+5, and when you'd use each |
| Short vowels = the first rule | First real rule after the alphabet | **Little Friends** (complements of 5) — the first real rule after bead values |

### The emotional hook transfers too

The phonics series is carried by one line: *"Your child can sing the whole alphabet… but still can't
read the word cat."* It works because it names a gap the parent has already noticed but can't
explain. The arithmetic equivalent:

> **"Your child can count to 100… but still counts on their fingers to do 7 + 8."**

Same shape: visible skill, invisible missing step, concrete promise for what the video fixes. Find
this line **before** writing any script — it becomes the title, the thumbnail, the first caption line
and the push notification.

### What gets easier
- **A much smaller recording set.** Phonics needed 1,859 word clips. Abacus needs number names, a
  few operation words and framing lines — recordable in a couple of sessions.
- **Bead geometry is code, not art.** Rods and beads are shapes with positions, so a bead frame is
  cheaper to draw than 460 illustrated words — and it animates for free.
- **The answer is unambiguous.** Arithmetic has one correct answer, so quiz and practice beats need
  no editorial judgement.

### What needs new thinking
- **The hand.** Finger technique is the differentiator and needs a real drawn or code-animated hand
  over the abacus. Budget for this properly — it's the equivalent of the mouth-shape work and carries
  the same weight.
- **Sequencing is stricter.** Letters can be taught in any order; you cannot teach complements of 5
  before bead values. The series order *is* the curriculum.
- **The false-rule trap still applies.** Abacus has shortcuts that only hold in some cases. Never
  teach a partial pattern as a rule — say "try it and check" and teach exceptions by sight, exactly
  as the ambiguous-vowel videos do.

### The order to build in
Copy the registry and per-video isolation on day one. Build **one** complete episode end to end —
script, recording, alignment, template, render, contact sheet — before building a second. That first
episode is where every layout rule above earns its keep, and it becomes the template the rest of the
series costs almost nothing to produce.

---

Distilled from `CONTEXT.md`, `REEL_PLAYBOOK.md` and `CREATING_A_REEL.md`, plus the rules that were
only ever learned through rejected renders. Every cost noted above was paid once already — the point
of writing them down is not paying them twice.
