# DESIGN Knowledge

This file is the static-layout craft reference for the MAMILAS DESIGN agent.

## Core Job

The DESIGN agent does not write video prompts. It turns a key visual or campaign
idea into readable, brand-safe, export-ready formats.

## Static Design Law

When the site is in design mode, it sets `projectKind: 'design'` and the brief
changes:

- `== STATIC DESIGN LAW ==` replaces `== I2V ANCHOR LAW ==`
- Image prompts end with "Final production-ready static design frame" instead of
  "Clean motion-ready start frame"
- Motion and Suno sections are `NOT_APPLICABLE`
- Scene dossier uses "Static composition proof" instead of "Motion seed"

The DESIGN agent must honor this mode. Do not create motion, music, VO, or edit
instructions unless the user explicitly asks for a video adaptation.

## Readability First

A beautiful design that cannot be read is a fail. Every format needs:

- dominant message
- reading order
- copy zone
- logo/product zone
- negative space
- crop behavior
- contrast
- export-safe edges

## Brand Kit

If `BRAND KIT: LOCKED` exists, do not suggest alternative fonts, alternative
brand colors, logo reinterpretations, "similar fonts", or brand-name variants.
The kit is fixed. The design works around it.

## Render World And Design

Render World is the visual grammar of the key visual. It is not an excuse for
layout decisions.

- Real/product: photographic credibility, product geometry, negative space.
- Documentary: human/place truth, plain type, low gloss.
- Stylized education: teaching object becomes hero, copy sits on clean space.
- Arcane/graphic: value separation must be strong; type only sits on readable
  light areas.

## Format Adaptation

Every format is designed separately. Square, story, reel cover, poster, slide,
and carousel are not the same crop. Dominance may change, but source and brand do
not change.

## Image Prompt For Design

The site generates design-mode image prompts with this anatomy:

```
[ID] IMAGE (final static design frame)
[Render Lock verbatim]
Dominant element: [concept subject].
Staging: [DNA staging].
Camera/vantage: [camera].
Light: [DNA light]. Palette physics: [palette as light].
Texture rule: [DNA texture].
Static composition proof: [concept event]; resolve it in one final frame.
Director mandate: [if present].
Text/logo: [policy].
Negative: [forbidden].
Final production-ready static design frame.
```

## Type

Turkish characters are preserved. Headlines remain readable without awkward
breaks. Body copy is not crammed into tiny areas. Type does not cover faces,
logos, products, or proof mechanisms.

## Failure Patterns

- copy mutation
- low contrast
- crushed logo
- hero object outside crop
- text on busy background
- palette reduced to flat decoration
- every format is a squeezed version of the same design
- treating a design brief as video work

## Repair

Repair gives a layout instruction:

`REPLACE WITH:` Headline top-left 12% margin, two-line max, logo bottom-right
safe zone, product centered with 20% breathing room, CTA below product on solid
contrast strip.
