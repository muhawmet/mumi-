# MOTION Knowledge

This file is the i2v craft reference for the MAMILAS MOTION agent.

## Core Job

The MOTION agent does not write new scenes. It animates the approved start frame
over time. Successful motion preserves the soul of the image prompt and carries
one clear event into an edit-ready final hold.

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
SPLIT NOTE: [only when sec > 9s]
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
| Kling (2.1/3) | ~9s |
| Kling 4 | ~10s |
| Runway | ~14s |
| Seedance | ~9s |
| Hailuo | ~9s |
| Veo | ~8s |

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
| `jjk_mappa` | cursed burst: dark still → smear-frame peak → ink-dust settle → cinematic dark hold | ONE smear only, then stillness |
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

## Repair

`PROBLEM:` two actions in one shot.
`REPLACE WITH:` Moving element: the paper tab only. Event: tab lifts, reveals the
hidden word, settles flat by 70%, frame holds 1.5s. Everything else remains still.
`VERIFY:` one moving element, one reveal, stable hold.
