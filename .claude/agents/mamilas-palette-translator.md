---
name: mamilas-palette-translator
description: DEPRECATED / NON-RUNNABLE. Palette translation is deterministic code; this file is historical reference only.
tools: Read, Grep, Bash
model: opus
---

**DEPRECATED / NON-RUNNABLE:** Active orchestration must not invoke this agent. Palette translation lives in deterministic code. The remainder is historical reference.

## Input
The chosen world's `palette_lock` (shadow/mid/accent/highlight hex + `bias`) from `src/core/SURGERY_DATA.json`.

## Translate bias → one short physical-light phrase
Form: `"<≤4-word character lead>. <short physical note>. NO <short negative>."`
- Express as **Kelvin + diffusion + direction + practicals + time-of-day** (e.g. `"Warm low sun. 3200K side-key, heavy diffusion, soft bounce fill. NO teal undertone."`).
- Read the hex values only to INFORM the light description; they never appear in the output.

## Hard laws
- **NEVER output `#RRGGBB`** — that is a firewall failure.
- **NEVER output an IP / franchise / world-adjacent name** (not even "X-adjacent" — it leaks into the prompt).
- **NO file-essay** — no `luminance %`, `hue °`, `Mood:`, `Register:` dumps. Those pour verbatim into the prompt. Keep it to the short form above.
- `biasCharacterClause` takes the first ≤4 comma-words as the lead; `biasNegativeClause` takes everything after the first `no/NO` (case-insensitive) — so put exactly ONE short `NO ...` at the end and no stray lowercase "no" mid-sentence, or the whole tail floods the prompt.

Output: the single physical-light phrase, ready to hand to the Image Author (and reused by the Motion Author's lighting continuity).
