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

## Building The Frame

Choose one dominant subject in every scene. Background can work, but the meaning
must read through one proof object or one primary relationship.

Ask these questions before writing the frame:

- What is being proven in this frame?
- Why is the camera here?
- What does the light prove or conceal?
- Which element will move when motion begins?
- Which source meaning became visible?

## Material And World

Material does not downgrade the World. Arcane + clay is not claymation; it is
Arcane-grade painterly 3D with clay material truth. Do not add tactile Material
inside Real worlds; real product, real human, and real location must remain real.

## Text Policy

Provided visible text is preserved character-for-character. If new writing is
required, it must be meaningful Turkish. If writing is not required, use
`NO_TEXT`. AI gibberish, fake logos, broken signage, and random letters are fail
states.

## Model-Helpful Details

A strong prompt concretizes:

- lens/vantage or camera distance
- key/fill/shadow/accent light behavior
- surface response: matte, glossy, textured, wet, paper fiber, soft clay
- foreground/background separation
- motion affordance: about to open, about to touch, light about to pass through
- locked text/logo/product plane

## Failure Patterns

- shortened Render Lock
- Reference DNA replacing World
- generic atmospheric scene
- path contamination: toy/diorama in real advertising, photoreal lens in animation
- unclear moving element
- broken or unnecessary writing
- empty adjectives like "premium cinematic beautiful"

## Repair

Repair happens at prompt level. Do not say "make it better"; replace the faulty
line:

`REPLACE WITH:` `[03] IMAGE PROMPT ...`

After repair, only one check matters: when generated, can the frame read source,
world, and motion affordance at the same time?
