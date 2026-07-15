# MOTION Knowledge

This file is the i2v craft reference for the MAMILAS MOTION agent.

## Core Job

The MOTION agent does not write new scenes. It animates the approved start frame
over time. Successful motion preserves the soul of the image prompt and carries
one clear event into an edit-ready final hold.

## Frame-Gated Authoring (FRAME-AWARE PROTOCOL)

Motion is **frame-gated**: a motion prompt is finalized only after its approved
start frame exists. The site's motion packet carries this as the mandatory
`FRAME-AWARE PROTOCOL` block. Per scene:

1. **WAIT** for the approved start frame. No frame → no motion prompt. Every
   other deliverable may proceed; motion may not.
2. **LOOK:** inventory what the frame physically contains — subjects, hands,
   text plates, props, light direction, background layers, empty space.
3. **AUTHOR for THAT frame:** pick the one moving element from what the frame
   actually shows. The dossier EVENT line is intent, the frame is truth —
   reconcile toward the frame.
4. **NEGATIVES are frame-specific:** name the exact fragile elements visible in
   THIS frame (the title plate top-left, the thin rigging lines, the face in
   mid-ground) — never paste one generic negative list into every scene.
5. **Mismatch → flag:** if the frame contradicts its CONCEPT/EVENT, do not
   animate around the contradiction — send the scene back to the IMAGE role
   with the exact mismatch.

Prompts written before the frame exists are drafts only (`prompts.motion` in the
JSON export is a draft reference for exactly this reason).

## I2V Thinking

I2V models may reinterpret the start frame. Therefore the prompt must clearly
separate the single thing that changes from everything that must not change.

May change:

- one moving object/person/light/mechanism
- one cause-effect event
- micro camera motion, or deliberate stillness

Must not change:

- world/render
- material
- face/identity
- logo/text/product geometry
- location and main composition

## Motion Prompt Anatomy (Site-Generated Format)

The site builds motion prompts with this structure:

```
[ID] MOTION (i2v · plays the approved start frame)
Camera: [camera directive, Kling-scrubbed].
Moving element: [concept subject] — already in frame, already grounded.
Event: [concept event].
Rhythm: [DNA motion]; everything settles naturally into a stable 1-1.5s final hold.
Everything not named stays exactly as the start frame shows: world, material,
light, faces, text, logo, geometry — never re-described, never re-rendered.
NEGATIVE: morphing, warping, re-render, style or material drift, new objects or
scenery, leaving the frame, face or identity change, mouth movement,
logo/text/geometry change, multiple actions, flicker.
SPLIT NOTE: [only when sec exceeds the engine's clean window]
```

Note: The site applies "Kling scrub" — removing trigger words like "ready to",
"reaction", "trigger", "appears", "transforms", "suddenly" from motion prompts.
These words can cause i2v models to reinterpret the frame.

## Rhythm

A strong shot feels like three parts:

1. anticipation or starting tension
2. one physical event
3. stable final hold (1-1.5 seconds)

Without a final hold, the editor has no clean cutting point.

## Duration And Split

The site tracks engine-specific clean windows:

| Engine | Clean window |
|--------|-------------|
| Kling 3.0 | ~10s |
| Kling O3 | ~12s |
| Runway Gen4 | ~14s |
| Seedance 2 | ~10s |
| Veo 3 | ~10s |

Split math: divide the total evenly into shots that fit inside the window.

- 10-12s: split into two short shots if it makes sense; otherwise write a risk
  note for a single shot
- 14s: 2x7s
- 18s: 2x9s
- 22s: 3x7.3s

Formula: `shots = ceil(sec / usable)`, `perShot = sec / shots`

Every split shot needs its own start frame. Do not assume it continues from the
same frame. The site adds a SPLIT NOTE automatically when duration exceeds the
clean window.

## World-Specific Motion

- Real: natural gesture, product contact, parallax, barely breathing camera,
  practical light.
- Product: reflection pass, turntable, hand interaction, liquid/surface behavior.
- Education tactile: mechanism opens, piece settles, light passes through a
  layer. Camera pools use child-eye vantage, slow dolly, macro creep.
- Arcane/painterly: weight, rim-light shift, painterly FX, brooding hold.
- Anime/comic: pose clarity, impact accent, graphic smear, crisp lock.
- Stop-motion: handmade stutter, puppet weight, tactile settle.
- kurzgesagt_edu: isometric diagram expands from center; one connector line draws
  across to insight node; amber glow lands and holds. Camera locked wide overhead.
  No camera move — the diagram is the event.
- whiteboard_explainer: one ink stroke draws forward across the board as the
  concept traces; color marker wash floods behind the key node; camera locked wide,
  pulls back slowly as diagram fills. Hand exits frame; hold on completed diagram.
- retro_anime_film: cel silhouette steps forward in deliberate limited-animation
  frames; film grain layers over the hold; static camera — the stillness and grain
  communicate period weight. 1.5s grain-flutter hold, no new geometry.
- motion_design_flat: bold geometric shape snaps to final grid position; secondary
  block slides into alignment; camera locked straight-on. No ambient drift, no
  bounce — crisp snap-and-hold. 1s hold on locked final state.
- ukiyo_e_print: wave pattern flows in one sinusoidal pulse across the frame;
  Prussian-blue plane darkens at crest; no camera move. The stillness after the
  wave settles is the closing state — woodblock composition must stay flat.

## World Motion Cadence — Precedence

The motion packet may include a `WORLD MOTION CADENCE` line carrying the world's
own `motion_cadence` physics (e.g. one_piece_toei: 12fps character animation on
2s with smear frames at peak action). This is the world's physical law and
**takes precedence over any Reference DNA rhythm**. Reference rhythm shapes
pacing inside the cadence; it never replaces it.

## DNA Motion Directives

The site derives motion rhythm from Reference DNA:

- kinetic/action refs → "one bolder committed camera travel — never two moves"
- documentary refs → "documentary handheld micro-drift at walking pace"
- jazz/restraint refs → "restrained rhythm: event completes early, long confident hold"
- organic/wind refs → "one organic environmental confirmation, on the moving element only"
- comedy refs → "snap-and-hold comic timing: event lands early, hold carries the joke"
- industrial/mecha refs → "industrial weight: mass leads, inertia visible, micro-settle"
- lyrical/poetic refs → "lyrical pacing: event unfolds as one unbroken legato phrase"
- organic ease refs → "motion breathes in and settles out, nothing mechanical"

## IP Çizim Stili Motion Grammar

When the active material is an IP Çizim Stili (group: ip_style), the motion
rhythm for that style must appear in the `Rhythm:` line. The world rendering must
not drift; only timing/weight/energy changes.

| Material | Rhythm Pattern | Key Rule |
|---|---|---|
| `one_piece` | rubber-elastic: squash → over-extended peak → snap-back settle, comic impact hold | Exaggerated physics — NOT realistic |
| `naruto` | chakra arc: circle traces foreground → spiral center peak → warm particle drift, 1.2s hold | Arc is the hero element |
| `demon_slayer` | elemental ribbon: ribbon traces curve → bloom peak → particle settle | ufotable depth preserved throughout |
| `solo_leveling` | power-ascent: atmosphere thickens (ground particle uplift) → rank-aura event → brooding low-hold | Cold energy, no warmth |
| `arcane_paint` | painterly weight: slow build → single decisive gesture → rim-light shift → heavy shadow-mass hold | No lightness, no bounce |
| `jjk_ink_style` | cursed burst: dark still → smear-frame peak → ink-dust settle → cinematic dark hold | ONE smear only, then stillness (`jjk_mappa` is the Render World, not this material) |
| `dragon_ball` | kinetic aura: charge build → hard-rim impact peak → aura dissipates to power silhouette hold | Aura is motivator, not new element |
| `attack_titan` | scale dread: near-stillness → single atmospheric shift → tension hold | Speed kills scale; stillness communicates size |

These patterns apply to timing and energy only. Frame, world, and material must
not drift — `attack_titan` pacing does not mean the scene becomes grey; the
rendering is already grey from the Render Lock.

## Failure Patterns

- two events at once
- camera leaves the scene
- new object appears
- world/material re-renders
- logo or text morphs
- mouth moves without approved lipsync
- no final hold
- bad split math (tiny leftover tail, stretched clip)
- trigger words left in prompt (suddenly, transforms, appears)
- IP style motion rhythm not applied when material is ip_style group
- motion finalized before the approved start frame exists (frame-gate violation)
- generic negative list pasted into every scene instead of frame-specific negatives
- WORLD MOTION CADENCE ignored in favor of a reference rhythm

## Repair

`PROBLEM:` two actions in one shot.
`REPLACE WITH:` Moving element: the paper tab only. Event: tab lifts, reveals the
hidden word, settles flat by 70%, frame holds 1.5s. Everything else remains still.
`VERIFY:` one moving element, one reveal, stable hold.
