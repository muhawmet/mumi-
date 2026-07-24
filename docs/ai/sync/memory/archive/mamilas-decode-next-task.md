---
name: mamilas-decode-next-task
description: MAMILAS — current repo state and the next task (model-aware decode / scene-budget engine)
metadata: 
  node_type: memory
  type: project
  originSessionId: 547a9321-886f-4d95-945e-ea586479a224
---

**Workspace:** code lives in `/Users/Muhammet/Desktop/mamilas-modern` on branch `chore/add-screenshots` (NOT `main`, which only has `screenshots/`; the `.claude/worktrees/...` worktree is empty of code — ignore it).

**Done (verified, uncommitted in working tree):** the approved brain/reliability + reference plan — Fix 1 Source Beat Grouper (`autoGroupBeats` in `src/core/source.ts`, `beatBounds` in `beats.ts`, store wiring), Fix 2 Scene Count Guard (advisor >20 warn, `generateBatch` >25 → BLOCKED `SCENE_OVERFLOW`), Fix 3 Preset↔Register (advisor `phase0PresetId`), Fix 4 Concept Diversity (`primeConcept allPrevious`), Fix 5 EDU civic concept bank, Fix 6 Palette↔World, Fix 7 Proof brief-detectors (`reg_concept_monotony`, `reg_fallback_leak` + SURGERY_DATA entries), + reference files (Hybrid Path Law §6b, Proof EDU×STY exception, Suno negatives = style-exclusion tags). Gate: `npx tsc --noEmit && npm run lint && npm run build && npm test` all PASS, **181/181** tests.

**Next task (NOT yet implemented — do in a fresh chat):** a **model-aware decode / scene-budget engine**. Replace the hardcoded `videoModelClips=[5,10]`, `AUTO_GROUP_THRESHOLD=12`, `Dengeli` defaults with values derived from a per-model capability table. Anchor model = Kling 3.0 (see [[mamilas-generation-routine]] for clip economics: `voPerScene≈5`, `headTrim≈0.5`, `tailTrim≈1.5`, `genClipSec≈6.5–8`, `maxClip=15`, `maxScenes=25`). Scene count = `ceil(totalVO ÷ voPerScene)` capped at 25; production cost planned on `genClipSec`, not `usableSec`. `beats.ts` already separates `voSec` from `clipSec`, so it fits cleanly. Default pipeline `nano_banana_2` (image) + `kling_3` (video); others `advisory:true`.

**HARD INVARIANT — never violate:** the decode input is pure **voice-over** text. The split/group must be **byte-for-byte lossless** — no paraphrase, no trimming, no reordering, zero data loss. `sourceIntegrity` must stay 100% (existing `ingestSource`/`autoGroupBeats` already guarantee this — preserve it). Head/tail trim is about VIDEO seconds only; it must NEVER cut the VO text.
