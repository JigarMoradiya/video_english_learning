# Video checklist

Everything learned across nine cards. **Read this before building, not after.** Most items
below cost a full review round the first time they were missed.

---

## 1 · Before writing any code

- [ ] **Transcribe the audio independently** (`stable_whisper`, model `small`) and diff against
      the script. `align_audio.py` does FORCED alignment — it forces whatever script it is
      given onto the audio, so "the transcript matches" is true by construction and proves
      nothing. This is how a whole ch/tch build was made against the wrong script.
- [ ] Align, then **snap every one-word run** (`snap_word_phrases.py`). Drifts of 0.3–1.0s are
      routine and light a card after the child has heard the word.
- [ ] Scan for **crushed lines** (`duration < 0.2s`) and for phrases whose words all share one
      timestamp — the aligner collapses a line occasionally, and karaoke then flashes past.
- [ ] Write the **cue map for every phrase** before any component exists, and mark the long
      lines (> 2.4s) that carry two clauses. Those need a **second cue on the pivot word**
      ("It is the same letter, BUT it makes two different sounds").
- [ ] Check every example word has a picture, and that the picture shows **the word, not its
      contents** (a bird is not a cage). No **ZWJ emoji** — they split into parts and never
      render (👨‍⚖️, 🧑‍🏫, 👨‍👩‍👧).

## 2 · Layout

- [ ] Take the vertical bands from a **preset**, and derive each row from the one above it.
      Never type a y-coordinate by feel.
- [ ] `slab(colour, depth)` draws the extruded face **`depth + 16`px BELOW** the element.
      Anything stacked under it — including an absolutely positioned chip — must clear that.
      This bug shipped in three different worlds.
- [ ] An `<img>` inside a text span is **baseline-aligned**: set `lineHeight: 0` and flex, or
      the picture lands ~40% of the font size lower than its coordinate.
- [ ] A pointing device (magnifier, claw, spotlight, ring) is **mounted inside the target
      element**, never positioned by arithmetic. It has drifted onto the wrong letter three
      times when computed.
- [ ] Dark ground → opaque cards and a light plate behind any ink-coloured text.
      Bright ground → the background is pushed back (low contrast) with a light wash behind
      the teaching area, so cards read as objects in front of it.

## 3 · Teaching

- [ ] **Never teach a partial pattern as a rule.** If exceptions exist, name them (ch/tch's
      nine; g's get/give/girl/gift). If the pattern is stress-dependent and unteachable at this
      level, say it has its own video rather than implying completeness.
- [ ] Cue each element to **the line that names it** — never to a neighbouring phrase plus a
      frame offset. Got this wrong twice in one video.
- [ ] Show **relationships**, not just things: a drawn connector from cause to effect beats
      two cards sitting side by side. `Connector` / `RuleArrow` exist for this.
- [ ] A summary line ("every one of them has…") must change the **board**, not just add a chip.
- [ ] Different closing CTA line for every video. The app is "English Learning", never "games".

## 4 · Before showing anything

- [ ] `bash tools/check_video.sh <id> <timing.json>` — must report **0 stale phrases**.
- [ ] **Read the whole phrase sheet.** The automated part catches pixel staleness, not meaning:
      a wrong letter highlighted, or a card that changes while saying nothing new, both pass.
- [ ] Verify the **sub-phrase pivots** actually change either side of the pivot word.
- [ ] Unit-check any per-word logic against expected output. `"eiy".includes("")` is `true`,
      which classed `picnic` as soft — a wrong answer, not a wrong colour.

## 5 · Working habits

- Build **beat by beat**, rendering only that beat's frame range. Do not render five minutes to
  find one bad beat.
- Do **not** patch large TSX files by string replacement. It has silently dropped a fixed block
  and once truncated a file to zero bytes (a `unicode_escape` round-trip on emoji).
- Compose from the device library — `Connector`, `RuleArrow`, `SoundCard`, `Signpost`,
  `Puzzled`, `EmptySlots`, `SwapNote`, `SubscribeBump` — rather than inventing another
  card-with-text.
