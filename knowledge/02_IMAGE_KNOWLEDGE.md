# IMAGE Knowledge

This file is the start-frame craft reference for the MAMILAS IMAGE agent.

## Core Job

The IMAGE agent does more than translate the final brief into attractive prose.
For every scene, it builds a start frame strong enough to survive motion.

A good start frame:

- carries source meaning at a glance
- applies `RENDER LOCK` verbatim
- feels half a second before motion begins
- preserves text, logo, product, and face locks
- turns palette into light behavior
- uses Reference DNA as seasoning, not authority

## RENDER LOCK

`RENDER LOCK` enters the beginning or spine of every image prompt verbatim. It is
the hard guarantee that preserves the selected world. Saying "Arcane-like" or
"Pixar mood" is not enough; the site already provides a long render-lock
description.

The lock may include a material clause:
`Material: [name] The style above renders this material — do not flatten the
render world.`

This material clause is part of the lock and must be included verbatim.

## Prompt Anatomy (Site-Generated Format)

The site builds prompts with this exact structure. Your output should follow the
same anatomy:

```
[ID] IMAGE (motion start frame)
[Render Lock verbatim]
Dominant element: [concept subject].
Staging: [DNA staging directive].
Camera/vantage: [register-appropriate camera from the pool].
Light: [DNA light]. [Optional variant]. Palette physics: [palette as light].
Texture rule: [DNA texture directive].
Motion seed: the frame is the exact half-second before this event — [concept event] — everything required already present and primed.
Director mandate: [if present].
Text/logo: no new text unless the source asks; any visible Turkish text or logo is frozen geometry — only light and camera may cross it.
Character lock: [if present] Keep exactly as described — observer scale, no invented identity.
Negative: [path forbidden]; [DNA avoid]; empty adjectives (cinematic, dynamic, stunning, 4K); flat slide; warped text.
Clean motion-ready start frame.
```

For static design mode, the anatomy changes:
- "Motion seed" becomes "Static composition proof"
- Final line becomes "Final production-ready static design frame"

## Camera Pools

The site assigns cameras from register-specific pools. When writing your own
prompts, stay inside the correct pool:

**EDU cameras**: 35mm child-eye push, 50mm lateral dolly, 85mm tactile macro
creep, static front-on lock, gentle crane-down, low side dolly, slow arc around
object, inside-object vantage.

**STY cameras**: locked low-pressure angle, slow push along silhouette edge,
lateral slide across graphic layers, static wide hold, measured rise from low
vantage, tight creep onto texture grain, slow arc re-carving silhouette.

**REAL cameras**: 35mm human-scale handheld micro-drift, 50mm slow dolly, 85mm
rack focus, 100mm macro slide, static locked tripod, low tracking move, gentle
push-in at working distance.

## Material And World

Material does not downgrade the World. Arcane + clay is not claymation; it is
Arcane-grade painterly 3D with clay material truth. Do not add tactile Material
inside Real worlds; real product, real human, and real location must remain real.

## Palette As Light

The site provides palette as: `key [color], fill [color], shadow [color], accent
[color]`. Read these as light behavior, never flat fills:

- Key color motivates the main light source
- Fill color sets ambient/fill tonality
- Shadow color determines shadow mass character
- Accent color edges or rims the dominant subject

## DNA Directives

Reference DNA translates into five subordinate directives:

- CAMERA: derived from the reference's motion/camera DNA
- LIGHT: derived from light/mood DNA
- STAGING: derived from composition DNA
- TEXTURE RULE: exactly ONE texture clause per prompt when DNA triggers it
- AVOID: specific avoid notes from the reference

DNA never touches: identity, faces, logo, product geometry, source text, path,
or render lock.

## Text Policy

Provided visible text is preserved character-for-character. If new writing is
required, it must be meaningful Turkish. If writing is not required, use
`NO_TEXT`. AI gibberish, fake logos, broken signage, and random letters are fail
states.

## Light Variants

The site may generate light variants for batch variety:

- Variant 0: default lighting as described
- Variant 1: trade the key one stop softer, let the accent color carry the
  subject edge
- Variant 2: motivate the key from the opposite side, let the shadow mass lead
  the composition

## Failure Patterns

- shortened or paraphrased Render Lock
- Reference DNA replacing World
- generic atmospheric scene with no source meaning
- path contamination: toy/diorama in real advertising, photoreal lens in animation
- unclear moving element (what will motion animate?)
- broken or unnecessary writing
- empty adjectives like "premium cinematic beautiful"
- ignoring the material clause of the render lock
- palette used as flat color fills instead of light behavior

## Repair

Repair happens at prompt level. Do not say "make it better"; replace the faulty
line:

`REPLACE WITH:` `[03] IMAGE PROMPT ...`

After repair, only one check matters: when generated, can the frame read source,
world, and motion affordance at the same time?
