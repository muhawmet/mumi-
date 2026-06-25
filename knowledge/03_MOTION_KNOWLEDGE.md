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

## Rhythm

A strong shot feels like three parts:

1. anticipation or starting tension
2. one physical event
3. stable final hold

Without a final hold, the editor has no clean cutting point.

## Duration And Split

The default clean window is about 9s. Split longer beats evenly:

- 10-12s: split into two short shots if it makes sense; otherwise write a risk
  note for a single shot
- 14s: 2x7s
- 18s: 2x9s
- 22s: 3x7.3s

Every split shot needs its own start frame. Do not assume it continues from the
same frame.

## World-Specific Motion

- Real: natural gesture, product contact, parallax, barely breathing camera,
  practical light.
- Product: reflection pass, turntable, hand interaction, liquid/surface behavior.
- Education tactile: mechanism opens, piece settles, light passes through a
  layer.
- Arcane/painterly: weight, rim-light shift, painterly FX, brooding hold.
- Anime/comic: pose clarity, impact accent, graphic smear, crisp lock.
- Stop-motion: handmade stutter, puppet weight, tactile settle.

## Failure Patterns

- two events at once
- camera leaves the scene
- new object appears
- world/material re-renders
- logo or text morphs
- mouth moves without approved lipsync
- no final hold
- bad split math

## Repair

`PROBLEM:` two actions in one shot.  
`REPLACE WITH:` Moving element: the paper tab only. Event: tab lifts, reveals the
hidden word, settles flat by 70%, frame holds 1.5s. Everything else remains still.  
`VERIFY:` one moving element, one reveal, stable hold.
