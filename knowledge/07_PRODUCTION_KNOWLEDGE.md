# PRODUCTION Knowledge

Craft reference for the MAMILAS **Production Agent** — the role that turns an
exported `project.json` plus start-frame images into a ready-to-shoot package.

This file complements `03_MOTION_KNOWLEDGE.md` (the i2v craft) and
`02_IMAGE_KNOWLEDGE.md` (frame craft). Read those for deep motion/image technique;
read this for the **bundle workflow, the frame-reading discipline, and the export
schema**.

## Mental Model

The MAMILAS site is the doctor writing a prescription. `project.json` is the
prescription. You are the pharmacist. Two truths follow:

1. **Prepare everything you can from the prescription alone** — folders, image
   prompts, the human brief, the music brief, the report skeleton.
2. **Write motion only by looking at the real frame.** Motion is reinterpretation-
   prone; the model plays what it *sees*, so you must write to what you see, not to
   what the JSON predicted. This is why the bundle separates "prepare now" from
   "write after the frame exists."

## The Export Schema — `mamilas.production.v2026`

The file is a canonical `mamilas.command.v2026` envelope with one extra top-level
key, `production`. The fields you use most:

| Path | Meaning |
|---|---|
| `mode.projectKind` | `video` or `design`. Design produces no motion/music. |
| `agentBrief` | Full human-readable production brief → `final_brief.md`. |
| `scenes[].prompts.image` | Approved start-frame prompt → `image_prompts/<id>.txt` **verbatim**. |
| `scenes[].prompts.suno` | Per-scene sound cue → folded into the single `suno.txt`. |
| `scenes[].architecture` | Subject, event, camera vantage — the motion dossier. |
| `scenes[].handoff.MOTION` | Continuity, world camera/motion grammar, negatives. |
| `scenes[].duration` | `{ sec, usable, shots, perShot, ok }` — split math, precomputed. |
| `production.sceneIndex` | Per-scene file paths + `engineWindowSec`, `shotsExpected`, `splitExpected`, `motionStatus`. |
| `production.matching` | The image↔scene law, missing/mismatch policy. |
| `production.scaffold` | The ordered first-run steps. |
| `production.music` | Single-track plan + per-scene cues. |
| `production.agentContract` | The hard rules, in structured form. |

When prose (the adapters / this file) and `project.json` disagree, **follow
`project.json`** — it is the live contract for this specific job.

## The Folder Contract

```
<bundle>.mamilas/
├─ project.json          single source of truth
├─ RUN_MOTION_AGENT.md   CLI runner
├─ final_brief.md        you write from agentBrief
├─ image_prompts/<id>.txt you write, verbatim from prompts.image
├─ images/<id>.png       the doctor drops start frames here
├─ motion/<id>.txt       you write AFTER seeing the frame
├─ suno.txt              you write: one track for the whole piece
└─ report.md             you write: status, missing, warnings
```

`<id>` is the scene id, in source order. The doctor only ever touches `images/`.

## Reading A Frame (the core craft)

When a frame is present, do not jump to writing. Read it in this order:

1. **Anchor** — name what must stay frozen: world/render, material, faces, logo,
   text, product geometry, location, main composition. This becomes the "everything
   not named" clause.
2. **The one mover** — find the single element the frame already implies wants to
   move (a hand, a tab, a light, a vapor, a mechanism). Only one.
3. **The one event** — the single cause → effect → settle that proves the scene's
   point. If you can describe two events, you have two shots, not one.
4. **The motivated camera** — a move that lives inside the space already shown, or a
   deliberate hold. Never a move that reveals new geometry.
5. **The final hold** — 1–1.5 s of stillness so the editor has a clean cut.

Then write `motion/<id>.txt` to exactly those five. The frame is the authority on
what is animatable; the dossier is the authority on intent. When they conflict,
animate only what is in the picture and log the mismatch.

## Frame ↔ Dossier Mismatch

If the delivered frame does not match its scene (wrong subject, missing element,
extra object):

- Animate only what the frame actually contains; never invent the missing element.
- Do **not** silently "fix" it by re-rendering — that breaks the anchor law.
- Record it in `report.md` under "Frame/dossier mismatch" so the doctor can decide
  to regenerate the frame or accept the variance.

## Missing & Extra Images

- **Missing frame** → `motionStatus: MISSING_IMAGE`, listed in `report.md`, batch
  continues. A partial, honest package beats a blocked one.
- **Extra/unmatched image** (no scene with that id) → "Unmatched images" in
  `report.md`, file untouched. Never force it onto a scene.
- **Re-runs are idempotent** — only (re)write motion for scenes whose frame is
  present, and only re-do a scene if its frame changed.

## Duration & Split (precomputed for you)

`production.sceneIndex[i]` gives `engineWindowSec`, `shotsExpected` and
`splitExpected`; `scenes[i].duration` gives the same math (`shots`, `perShot`). You
do not recompute — you obey:

- `splitExpected: false` → one shot, write the final hold.
- `splitExpected: true` → `shotsExpected` balanced shots, each `~perShot` seconds,
  **each with its own approved start frame note**. Never one stretched clip, never a
  tiny leftover tail.

Engine windows (the site supplies the active one; defaults if absent):
Kling 2.1/3 ~9s · Kling 4 ~10s · Runway ~14s · Seedance ~9s · Hailuo ~9s · Veo ~8s.

## Kling Scrub

Remove words that make i2v engines re-render instead of play: "ready to",
"reaction", "trigger", "appears", "transforms", "suddenly", "then", "next". State
the change as a present-tense physical fact instead ("the tab lifts", not "the tab
suddenly transforms").

## The Single Music Brief (`suno.txt`)

Video bundles get **one** track, not one song per scene. Compose `suno.txt` from:

- `creativeControls.musicVibe`, `leitmotif`, `tempoCurve` — the spine of the track.
- `production.music.perSceneCues` — texture/intensity bias *within* that one track
  (e.g. sparse intro → fuller climax), never separate compositions.

Keep it narration-safe: duck under VO, leave a vocal pocket, no trailer brass / EDM
drops / busy percussion clipping the voice. No vocals unless the brief asks.

## report.md Shape

```
# <bundle> — Production Report
Generated: <date>  ·  Scenes: <n>  ·  Done: <n>  ·  Missing: <n>

## Done
- [1] motion/1.txt — 1 shot, 6s, hold ok
- [2] motion/2.txt — 2 shots (2×7s), split frames noted

## Missing frames
- [3] images/3.png not found → MISSING_IMAGE

## Unmatched images
- images/9.png → no scene #9

## Warnings
- [2] frame/dossier mismatch: dossier subject = "gear", frame shows "lever"
```

## Failure Patterns (reject before shipping)

- Motion written without opening the frame.
- Two events in one shot; camera leaving the scene; a new object appearing.
- World/material re-render; logo/text/face morph; mouth movement without approval.
- No final hold; bad split math (stretched clip or tiny tail).
- Trigger words left in the prompt.
- A rewritten `prompts.image` (it must be copied verbatim).
- Any change to a `project.json` lock (order, ids, world, palette, refs, path, count).

## North Star

Preserve every lock without killing craft. With source, world and frame fixed, you
still owe the doctor the strongest possible motion — distinct per scene, source-
bound, and producible on the first try.
