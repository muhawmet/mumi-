# PROOF Knowledge

This file is the audit and repair craft reference for the MAMILAS PROOF agent.

## Core Job

The PROOF agent does not kill creativity. It protects locks, source, and
producibility. The goal is not to say "I found an error"; the goal is to keep
production moving.

## Start

If present, read `PROOF STATE & QUALITY STATUS` first. Then compare the actual
output against `FAIL CONDITIONS`. Do not fail creative decisions that do not
conflict with the site packet.

## Universal Check

- source coverage (100% required — every source beat present)
- scene IDs and order (must match source order exactly)
- path/register (no contamination across REAL/EDU/STY)
- Render Lock (verbatim in every image prompt, including material clause AND the
  world-law sentences `Line grammar:` / `Lens grammar:` / `Light law:` — stripped
  laws = FIX)
- Material subordination (Material rendered THROUGH World, never replaces it)
- Frame gate (motion finalized only after its approved start frame exists;
  negatives frame-specific, not one generic list pasted into every scene)
- Reference Contributions (perRef lines verbatim, subordinate to Render Lock;
  each ref's `Never:` clause respected)
- World Motion Cadence (when present, world physics outrank reference rhythm)
- Calibration example hygiene (WORLD CALIBRATION EXAMPLE's subject/cast/text
  never leaks into scenes — only its discipline and vocabulary)
- Director Mandate (preserved, not deleted or contradicted)
- DIRECTION / MOOD (applied as bias, not overriding locks)
- Reference DNA subordination (seasoning, not authority)
- Palette as light (light behavior, not flat color fills)
- brand/copy/face/logo/product geometry
- Turkish glyphs (ş, ç, ğ, ü, ö, ı, İ preserved exactly)
- IP safety (no protected character names, no copyrighted content)
- output contract (correct sections in the correct order)

## Regression Detectors

The site's `proofDoctor()` runs seven specific regression detectors. Know them:

### reg_real_path_contamination
**Trigger**: Text claims realism (ultra-real, photoreal, realistic) AND contains
stylized language (clay, pixar, diorama) in the same positive prompt.
**Verdict**: FAIL
**Exceptions**:
1. Hybrid mode explicitly enabled.
2. The Render World is Stylized (STY) rendering a Tactile/Educational (EDU) path. In
   this case the stylized visual descriptors come from the Render Lock and are
   permitted alongside the educational concept — see the Hybrid Path Resolution Law
   in `GLOBAL_BRAIN.md` §6b. Do not flag them as contamination.

### reg_source_loss
**Trigger**: Source coverage is below 100%.
**Verdict**: FAIL
**Why**: Every source beat must appear in the final output.

### reg_logo_morph
**Trigger**: Scene has locked text/logo AND motion prompt contains morph/warp/
deform/aggressive language WITHOUT freeze/lock protection.
**Verdict**: FIX
**Repair**: "freeze logo/text plane; only camera/light/reflection moves."

### reg_lazy_motion
**Trigger**: Motion prompt contains lazy triggers (slow zoom, slow pan, zoom in,
glow, cinematic) WITHOUT concrete physical action (hold, settle, event, reveal,
open, shatter, spin, rotate, flow, fall, rise, glide).
**Verdict**: FIX
**Repair**: "add motivated camera arc, physical action, environment reaction,
final tail hold."

### reg_ip_reference
**Trigger**: Positive text contains protected IP names (Luffy, One Piece, etc.).
**Verdict**: FAIL
**Why**: Cannot use copyrighted character names or properties.

### reg_concept_monotony
**Trigger**: A brief (`type: 'brief'`) has more than 5 `CONCEPT:` lines but fewer
than 30% unique concepts.
**Verdict**: FIX
**Repair**: Group the source into thematic beats (Beat Planner / auto-group) or
deepen the concept bank.

### reg_fallback_leak
**Trigger**: A brief (`type: 'brief'`) repeats generic fallback concept templates
(sealed capsule, working model of the core idea, "fallback concept — sharpen") more
than twice.
**Verdict**: FAIL
**Repair**: Expand `EDU_SOURCE_BANK` patterns or re-ingest the source into beats.

## QA Score Components

The site calculates a 0-100 QA score per prompt:

- -25: realism claim + stylized language (path contamination)
- -50: IP/anime character names
- -15: "4K" or "stunning" (empty quality claims)
- +10: "geometry locked" or "negative space" (golden elements)

## Image Check

FAIL/FIX:

- missing or paraphrased Render Lock
- source meaning loss
- real/stylized contamination
- text/logo/product warp
- start frame not ready for motion
- palette became flat fill
- empty adjectives (cinematic, dynamic, stunning, 4K)

## Motion Check

FAIL/FIX:

- new object
- re-render/style drift
- two moving elements
- no final hold
- start frame not preserved
- unbalanced split (check against engine window table)
- text/logo/face morph
- trigger words left in prompt (suddenly, transforms, appears)

## Suno Check

FAIL/FIX:

- no VO pocket
- artist/song clone
- protected lyrics/melody
- music changes scene decisions
- unclear edit arc

## Verdict

PASS: production can continue.
FIX: there is a problem, but production can continue with a paste-ready repair.
FAIL: source is missing, contradictory, unsafe, or requires a user decision.

## Repair Standard

Every FIX carries four parts:

`PROBLEM:` observed issue
`RULE:` broken MAMILAS law
`REPLACE WITH:` directly usable text/prompt/layout
`VERIFY:` observable pass condition

"Make it better" is not proof. Proof is concrete repair.
