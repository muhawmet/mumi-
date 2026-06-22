# MAMILAS — MASTER BUILD (single source of truth, autonomous)

This ONE file supersedes CODEX_MIGRATION_ORDER.md, ANTIGRAVITY_LEASH.md and ANTIGRAVITY_UI_ORDER.md. Read only this. Architect: Claude. Builder: you (Antigravity, Gemini 3.1 Pro, AI Pro — heavy usage is fine; spawn parallel sub-agents where allowed). You run ALL phases autonomously, gating yourself between each, without waiting for a human. The TEST GATE is your master, not your own judgment. There is no room for error: a phase does not exist until its gate is green.

Working dir: `/Users/Muhammet/Desktop/mamilas-modern`. Legacy `/Users/Muhammet/Desktop/mamilas_work_current/mamilas.html` (11940 lines) is READ-ONLY reference — NEVER edit it.

---

## ALREADY DONE — do NOT redo, do NOT revert
The "brain" is ported and verified. These exist and pass tests:
- `src/core/brain.ts` + `src/core/brain-data.ts` — concept engine (conceptRanked/primeConcept), dnaDirectives, renderLock, primeCamera, primeSuno, durationGuard (BÖLEMEZSİN), buildImagePrompt, buildMotionPrompt, buildAgentBrief.
- `src/core/pure.ts` — generateBatch drives the brain; resolveRecipeDefaults; deriveTeachingRecipe; handoff packets.
- `src/store/useStudioStore.ts` — auto-wiring (world→ref+palette), recipeReadiness strict gate, persist version:2 + migratePersistedState, applyPromptOverride (override → handoff IMAGE draft), generateScenes/advance.
- `src/core/exporters.ts` — CSV/MD export. `src/pages/*` — Dashboard/Recipe/Timeline 3-step. e2e smoke suite.
Before starting, run `git log --oneline -5` and read `MIGRATION_STATUS.md` if it exists — RESUME from the last green commit, never restart from scratch.

---

## THE GATE (every phase ends here; never claim done on red)
Run all five, with your own eyes on the output, plus zero browser console errors on localhost (desktop AND ≤720px):
```
npm test && npm run lint && npx tsc --noEmit && npm run build && npm run test:e2e
```
Paste the real output into your phase report. If any is red: fix it. If still red after honest attempts: STOP, write `MIGRATION_STATUS.md`, do not proceed.

## THE 8 HARD RULES
1. **No invention.** Every world/ref/palette/path/project ID must exist in `src/core/SURGERY_DATA.json`. Every ported function must come from a NAMED legacy function (line refs given per phase). Unspecified → STOP and write the question in `MIGRATION_STATUS.md`. Never guess.
2. **No files outside spec.** Only create the files named in the current phase. NO helper/manager/orchestrator/agent/generator/util grab-bag files. No speculative abstractions.
3. **Test-first.** For each pure function: write the test (3–6 concrete deterministic cases) FIRST, run it red, then implement until green. Logic in `src/core/*.ts`; React only renders.
4. **Pure core / dumb UI.** No business logic inside components. Components call `src/core` + store. This is what keeps future UID changes safe — never break it.
5. **One phase, one commit.** Local commit at each phase end (`Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`). NEVER push. After committing, update `MIGRATION_STATUS.md` (phase done, commit hash, what's next), then continue to the next phase automatically.
6. **Don't touch package.json/lock** unless a phase explicitly needs a dep. If so: install it, run the gate, commit the lock in that phase's commit, note it in status. (You are the only agent now, so lockfile is yours — but stay minimal.)
7. **Parallelize only independent work.** You MAY spawn sub-agents for modules that don't share files (e.g. `source.ts` and `proof.ts`). NEVER let two agents edit the same file/`src/store`/the same page at once. One integrator agent runs the gate and commits per phase.
8. **Report only what the gate proves.** No "perfect/complete/production-ready" without pasted green output. State what you did NOT do. Flag every guess.

## ANTI-DRIFT self-check (include answers in every phase report)
- Created any file not named in the phase? (must be: no)
- Invented any ID/behavior not in SURGERY_DATA/legacy? (must be: no)
- Every claim backed by pasted gate output? (must be: yes)
- Logic in core, UI dumb? (must be: yes)

---

## TARGET IA (legacy 5-phase → modern flow)
Brief (Dashboard) → Reçete (Recipe) → **Sahneler (NEW)** → Timeline/Export. Right rail on all steps: Adaptif önizleme + Proof/readiness.

---

## PHASE A — Source intelligence
Legacy: `decodeBrief` (base + curriculum guard ~line 8620), `sourceIntegrity` (line 1022), `hash32`, `estimateSec` (line 897, already in brain.ts — reuse), lossless atom split (sentence regex in `beatEconomy` ~3423).
Create `src/core/source.ts` (pure):
- `decodeBrief(raw: string): { path: string; project: string; reason: string }` — keyword→path/project; curriculum keywords (aras/defne/sınıf/ders/su döngüsü/fotosentez…) outrank single commerce keywords (reklam/kampanya/marka). IDs from SURGERY_DATA.paths/projects only.
- `ingestSource(raw: string): { beats: {id:string; text:string}[] }` — split into sentence atoms, stable ids `source-001`…, LOSSLESS (rejoin === raw modulo whitespace).
- `sourceIntegrity(rawVault: string, beats: {text:string}[]): { rawChars:number; sceneChars:number; coverage:number; ok:boolean; rawHash:string; reconHash:string }`.
Create `src/core/source.test.ts`: decode picks education on curriculum keywords; ingest lossless; integrity 100% round-trip, <100% when a beat dropped.
UI (`src/pages/Dashboard/DashboardStep.tsx`): "Brief decode" textarea → shows detected path/project + reason; ingest panel → beats list + coverage %. Coverage <100% blocks generation, shown in right rail.
e2e: add a spec — pasting raw client text decodes + shows coverage. THEN run THE GATE → commit → update status → Phase B.

## PHASE B — Semantic Beat Planner + Storyboard + Çalışma Modu
Legacy: `beatEconomy` (3421), `beatMode/beatMinSec/beatTargetSec/beatMaxSec` (3306–3309), `ENGINE_CLIPS=[5,10]` (3309), `beatHintsCompute` (3435), `mergeScore` (3354), `isRevealBeat`.
Create `src/core/beats.ts` (pure): `planBeats(beats, mode, videoModel)` → per-beat VO sec (estimateSec), clip sec, total gen sec, usable edit sec, savings %, merge/keep hints; modes Ekonomik/Dengeli/Hassas/Manuel → min/target/max. `src/core/beats.test.ts`: mode bounds, over-limit flag, merge hint on short adjacent beats, savings math.
UI: NEW **Sahneler** step (add `'scenes'` to Step type + nav + route). Beat Planner panel (4 modes, live numbers, applyable merge/keep hints), Storyboard (per-scene card: world look + concept beat + duration + BÖLEMEZSİN flag), Çalışma Modu (Hızlı/Standart/Sıkı Teslim) gating export strictness. e2e: beat planner renders + mode switch changes numbers. THE GATE → commit → status → Phase C.

## PHASE C — Proof & Quality (Kanıt Doktoru, Batch QA, Üretim Defteri, Quantum)
Legacy: `quantumScore` (~8702), `qaScore`, `proofFailLines`, `goldenFor/goldenText` (8559), `DATA.golden`, `DATA.regression`.
Create `src/core/proof.ts` (pure): `quantumScore(state)`, `qaScore(prompt)`, `proofDoctor(scene|brief)` → findings PASS/FIX/FAIL each with exact paste-ready replacement (PROBLEM/WHY/REPLACE WITH/VERIFY). Use `DATA.golden` as bar, `DATA.regression` as fail seeds. `src/core/proof.test.ts`: contaminated prompt → FAIL with concrete replacement; clean → PASS; quantum monotonic with completeness.
UI: Kanıt Doktoru rail (per-scene PASS/FIX/FAIL + one-click apply FIX → userImagePrompt override via existing applyPromptOverride), Batch QA (first/mid/last sampling), Üretim Defteri (per-scene ready/block/revision ledger), Quantum chip. THE GATE → commit → status → Phase D.

## PHASE D — Recipe richness (Brand Kit Lock, Variant A/B/C, Smart Suggestion)
Legacy rules in `brain/GLOBAL_BRAIN.md` (Marka Kiti Kilidi, Kreatif Varyant Testi); `applyRefBundle` auto-wire.
Add to `src/core/brain.ts` (extend, don't break): brand-kit block injector into agent brief when LOCKED (freezes palette, verbatim brand name/colors/font); `buildVariantBriefs(ctx, variable: 'world'|'palette')` → exactly 3 briefs (A current, B one step, C stronger) differing ONLY in the named variable; `recommendReason(world, ref)` from ref.use/dna.
Store/UI: Brand Kit Lock panel (Recipe), Variant A/B/C generator (3 outputs), Akıllı Öneri ("why this reference"). Tests: locked kit appears verbatim in brief; variant test yields exactly 3 differing only in chosen variable. THE GATE → commit → status → Phase E.

## PHASE E — Adaptive preview + Golden viewer
Legacy: `sideAdaptivePreview` (8671), `buildPreviewState`, `worldCategory` (8662).
Create `src/components/PreviewStage.tsx` (pure-CSS/SVG, no WebGL): live render of world colors + light direction + material icon + active preset + recipe summary; updates with recipe. Mount in a right rail across steps. Golden viewer: browse `DATA.golden` per agent. Tests where logic exists (worldCategory mapping). THE GATE → commit → status → Phase F.

## PHASE F — Export completeness
Split `buildAgentBrief` into per-director packets (image/motion/suno/idea/proof) — legacy `primePacket(id)` (8563). Separate copy buttons in Timeline. Ensure brand-kit + variant + proof state included in final brief. Tests: each packet contains its director header + render lock. THE GATE → commit → status → Phase G.

## PHASE G — High-end UI (do LAST, after logic is complete)
Now make it beautiful. Build a real design system and apply it across the migrated pages.
- `src/styles/tokens.css` — color scale, spacing, radius, shadow, blur, motion tokens (dark near-black + single gold accent, glass/blur surfaces, 1px hairline borders, generous spacing).
- `src/ui/**` — typed reusable primitives (Button, Card, Panel, Chip, Stat, Field, Select, Tabs, Toast, Tooltip, ProgressRail, SwatchStrip, SceneCard, PreviewStage) with framer-motion micro-interactions, full a11y (focus/keyboard/aria/AA), responsive desktop + ≤720px.
- Adopt these primitives across Dashboard/Recipe/Sahneler/Timeline — replace ad-hoc inline styles with the design system. Keep all logic untouched (UI is dumb).
- Premium and calm — NOT neon, NOT busy. Purposeful motion only.
**Phase G gate (its own checks, stricter):** THE GATE (all five green) PLUS: zero console errors on localhost desktop AND mobile, every primitive used renders in all states, no logic moved into components, no SURGERY/core file behavior changed (diff `src/core` shows no logic edits). Commit → status.

---

## FINAL REPORT (after Phase G)
Write an honest feature-by-feature legacy↔modern parity table, total test counts, pasted final gate output, and any deliberately-skipped legacy feature with the reason. "Perfect" only if the gate proves it.

## EXECUTION
Read this file → check git log + MIGRATION_STATUS.md → resume or start at PHASE A → run each phase A→G: test-first, THE GATE, commit, update status, continue to next phase automatically. Stop only on an unfixable red gate or a genuine ambiguity (write it in MIGRATION_STATUS.md). Begin now.
