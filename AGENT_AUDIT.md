# MAMILAS Agent + Knowledge Audit

Date: 2026-06-23  
Scope: `agents/GLOBAL_BRAIN.md`, `agents/README.md`, Claude x6, GPT x6, Knowledge x6  
Mode: **report only**. `agents/` and `knowledge/` were read and hashed, not edited.

## Executive Verdict

**FIX REQUIRED before the next agent bundle release.** The shared brain is current and strong, but the deployable role/knowledge files still encode the retired one-axis `Visual World + Teaching Recipe / TACTILE_3D` ontology. They name world IDs that do not exist in current `SURGERY_DATA`, omit the site's real ~9s balanced-split contract, and depend on `PHASE0_PRESET:` even though the modern site never emits that token.

The highest-risk gap is deployment: `agents/README.md` tells operators to install the provider adapter plus its knowledge file, but does **not** tell them to include `GLOBAL_BRAIN.md`. Therefore “the role inherits the global brain” is not operationally guaranteed, and exact site-token behavior can disappear in a correctly followed installation.

## Priority Findings

### P0 — Global contract is not included by the documented install flow

- Evidence: `agents/README.md:17-22` installs only provider adapter + matching knowledge.
- Contradiction: `agents/GLOBAL_BRAIN.md` says all directors inherit it, while the deploy instructions never attach it.
- Impact: exact handling for `RENDER LOCK`, `MODEL ERA`, `I2V ANCHOR LAW`, `PROOF STATE & QUALITY STATUS`, 2-axis authority, and ~9s balanced splitting becomes accidental.
- Exact fix for Claude: install `GLOBAL_BRAIN.md` first, then `claude/0X_*`, then matching knowledge.
- Exact fix for GPT: concatenate/global-instruction order must be `GLOBAL_BRAIN → gpt/0X_* → knowledge/0X_*`.
- Verify: a clean install, using README only, can answer where each exact token is defined without hidden project context.

### P0 — Motion adapters do not carry the ~9s balanced-split law

- Evidence: only `agents/GLOBAL_BRAIN.md:63-69` specifies ~9s and `14s → 2×7s`.
- `agents/gpt/03_MOTION_GPT.md:68,74` and `knowledge/03_MOTION_KNOWLEDGE.md:107,110` only describe fixed `4–6s + 2s hold`; Claude Motion contains no split rule.
- Impact: long beats can be stretched, clipped, or split with a short tail instead of balanced shots with separately approved start frames.
- Exact fix: all Motion instructions must consume `I2V ANCHOR LAW` verbatim, preserve the engine-specific usable window supplied by the brief, and state “overflow → N balanced shots; each shot has its own approved start frame; never stretch and never leave a tiny tail.”
- Verify: a 14s beat produces exactly `2 × ~7s`, not `9s + 5s`, and both blocks include their own start-frame anchor.

### P1 — Retired ontology conflicts with the current 2-axis model

- Current authority: `source > route/path > Render World > Material > ≤20% scene override > approved image/architecture > Reference DNA > palette accent`.
- Child authority repeated across every adapter: `Visual World > primary Teaching Recipe`.
- Current code IDs exist in `SURGERY_DATA.worlds` (`pixar3d`, `arcane`, `clay`, `paper`, `cinematic_real`, etc.).
- Referenced legacy IDs are missing: `pixar_feature`, `arcane_painterly`, `cinematic_real_commercial`, `documentary_real`, `macro_product_real`, `clay_diorama`, `futuristic_glass_ui`.
- Impact: IDEA can recommend nonexistent IDs; IMAGE/MOTION/SUNO/DESIGN can ignore the exact `RENDER LOCK`; PROOF can fail a valid `Render World × Material` combination as if material were a separate world.
- Exact fix: replace `Visual World` with `Render World`; replace `Teaching Recipe` with `Material` and retain the rule “Render World renders Material; REAL ignores Material.” Remove all world tables not generated from current `SURGERY_DATA`.
- Verify: Arcane + paper is accepted as `Render World=arcane`, `Material=paper`; `paper` never replaces the Arcane render lock.

### P1 — Agents gate on a token the modern site does not emit

- Adapters/knowledge key Phase 0 behavior on `PHASE0_PRESET:`.
- Site search shows no emitted `PHASE0_PRESET:` token.
- Site does emit the operative locks in `src/core/brain.ts:328-384`: `MODEL ERA`, `RENDER LOCK`, `AUTHORITY`, `REFERENCE DNA → DIRECTIVES`, `PALETTE AS LIGHT`, `I2V ANCHOR LAW`, `SCENE DOSSIER`, `SOUND`, `FAIL CONDITIONS`, `PROOF STATE & QUALITY STATUS`.
- Impact: a valid modern packet can be treated as unlocked while an impossible legacy token controls FAIL decisions.
- Exact fix: either make the site guarantee `PHASE0_PRESET:` or, preferably, make agents treat the actual `RENDER LOCK + AUTHORITY` blocks as the operative world/path lock. Do not document a trigger token the site cannot produce.
- Verify: a current Timeline packet, unchanged, activates every intended lock.

### P1 — Role files do not explicitly consume their exact site tokens

- IMAGE must copy `RENDER LOCK` verbatim and consume `PALETTE AS LIGHT` + `SCENE DOSSIER`.
- MOTION must consume `I2V ANCHOR LAW` + motion dossier and preserve balanced shot boundaries.
- SUNO must consume `SOUND` and scene/edit arc without inventing visual decisions.
- PROOF must start from `PROOF STATE & QUALITY STATUS` and validate `FAIL CONDITIONS` rather than silently rebuilding a different gate.
- All roles must honor `MODEL ERA` without hardcoded model versions.
- Impact: correct site packets can be weakened by role-local paraphrase or stale knowledge tables.
- Exact fix: add a short “TOKEN CONSUMPTION” section to each adapter; the token text wins over knowledge examples.
- Verify: a probe packet shows the exact render lock unchanged in every IMAGE output and the supplied proof state quoted before new findings.

### P2 — Duplication is causing drift

- GPT adapters embed long world/recipe tables already repeated in knowledge files.
- The duplicated tables are the stale portion; shared behavior and output contracts are otherwise concise and coherent.
- Exact fix: keep behavior/output schema in adapters, craft knowledge in knowledge files, and current world data in one generated/canonical reference. Do not maintain the same world matrix in three places.
- Verify: every world ID has one canonical definition and repository search finds no retired alias.

### P2 — Provider labels and Design package routing need cleanup

- Claude files are titled `Claude 4.x Adapter`, a fixed-era label inconsistent with the frontier/no-version policy used elsewhere.
- README and GLOBAL_BRAIN describe `IDEA → DESIGN → PROOF` but the site-package table has no explicit DESIGN package row.
- Exact fix: use provider-only adapter titles (`Claude Adapter`, `GPT Adapter`) unless a runtime dependency truly requires a model family; document how DESIGN receives its input package.

## Exact Token Matrix

| Site token | Site emits | Current global rule | Role-local coverage | Verdict |
|---|---:|---|---|---|
| `MODEL ERA` | Yes | 2026 frontier, no fixed versions | Mostly absent | FIX |
| `RENDER LOCK` | Yes | Copy verbatim | IMAGE adapters say world rule, not exact verbatim token | FIX |
| `Material:` | Conditional | Render World processes Material; REAL ignores it | Called Teaching Recipe / TACTILE world | FIX |
| `AUTHORITY` | Yes | Exact 2-axis hierarchy | Child hierarchy is old | FIX |
| `REFERENCE DNA → DIRECTIVES` | Yes | Subordinate | Broadly respected | PASS |
| `PALETTE AS LIGHT` | Yes | Light behavior, not flat fill | Design mentions it; IMAGE not token-explicit | FIX |
| `I2V ANCHOR LAW` | Video | ~9s + balanced split | Missing locally | FAIL |
| `SCENE DOSSIER` | Yes | Source + concept + camera + duration | IMAGE headings present; token handling implicit | WARN |
| `SOUND` | Video | Site-provided sonic brief | SUNO craft strong; token handling implicit | WARN |
| `FAIL CONDITIONS` | Yes | Proof gate input | Proof rebuilds legacy gates | FIX |
| `PROOF STATE & QUALITY STATUS` | Yes | Preflight evidence | Not explicitly consumed | FIX |
| `BRAND KIT: LOCKED` | Conditional | Exact freeze | Strong in GPT/Design/Proof; Claude wording equivalent | PASS |
| `CREATIVE VARIANT TEST — variable:` | Conditional | Exactly A/B/C, one variable | IDEA/Proof coverage strong | PASS |
| `PHASE0_PRESET:` | **No** | Not guaranteed | Many files depend on it | REMOVE OR EMIT |

## File-by-File Findings

| File | Verdict | Finding and exact recommendation |
|---|---|---|
| `agents/GLOBAL_BRAIN.md` | PASS | Current 2-axis, frontier, ~9s split and site-token contract are authoritative. Keep as root; make installation mandatory. |
| `agents/README.md` | P0 FIX | Install flow omits GLOBAL_BRAIN. Add mandatory three-layer order. Add explicit DESIGN input/package routing. |
| `agents/claude/01_IDEA_CLAUDE.md` | P1 FIX | Recommends missing legacy IDs and TACTILE worlds. Replace selection guide with current world IDs and separate Material selection. |
| `agents/claude/02_IMAGE_CLAUDE.md` | P1 FIX | Old Visual World/Teaching Recipe model; no exact `RENDER LOCK` copy instruction. Consume real tokens verbatim. |
| `agents/claude/03_MOTION_CLAUDE.md` | P0 FIX | Old TACTILE ontology and no ~9s balanced split. Make `I2V ANCHOR LAW` mandatory. |
| `agents/claude/04_SUNO_CLAUDE.md` | P1 FIX | Maps missing IDs such as `pixar_feature`/`futuristic_glass_ui`; consume `SOUND` and current world/material names. |
| `agents/claude/05_DESIGN_CLAUDE.md` | P1 FIX | Brand/copy rules are strong; ontology remains old. Use Render World × Material and consume `PALETTE AS LIGHT`. |
| `agents/claude/06_PROOF_CLAUDE.md` | P1 FIX | Strong repair contract, but Phase0/TACTILE gates target nonexistent tokens/IDs. Start with site `PROOF STATE` + actual locks. |
| `agents/gpt/01_IDEA_GPT.md` | P1 FIX | Largest stale embedded world/recipe table. Remove duplication; use current DATA-derived IDs and 2-axis authority. |
| `agents/gpt/02_IMAGE_GPT.md` | P1 FIX | Embedded legacy render matrix can override current render lock. Require verbatim site lock; move examples to one current canonical source. |
| `agents/gpt/03_MOTION_GPT.md` | P0 FIX | No balanced split and stale per-world matrix. Add ~9s law and carry site-provided window/shot boundaries exactly. |
| `agents/gpt/04_SUNO_GPT.md` | P1 FIX | Craft/VO pocket is strong; world mapping is legacy and duplicated. Key mapping by current world IDs plus Material bias. |
| `agents/gpt/05_DESIGN_GPT.md` | P1 FIX | Strong format physics and brand lock; stale world families. Replace with current Render World categories and exact palette token. |
| `agents/gpt/06_PROOF_GPT.md` | P1 FIX | Exact repair shape is strong; legacy Phase0/TACTILE gates can false-FAIL valid 2-axis briefs. Gate on actual packet tokens. |
| `knowledge/01_IDEA_KNOWLEDGE.md` | P1 FIX | Extensive retired ID list and hybrid worlds that should now be Render World × Material. Rebuild selection guide from current DATA. |
| `knowledge/02_IMAGE_KNOWLEDGE.md` | P1 FIX | High craft quality but obsolete render matrix. Keep craft principles; replace ID-specific appendix with current render locks. |
| `knowledge/03_MOTION_KNOWLEDGE.md` | P0 FIX | Strong motion craft, missing balanced splitting and based on legacy worlds. Add shot-boundary law and current worlds. |
| `knowledge/04_SUNO_KNOWLEDGE.md` | P1 FIX | Narration and mix rules pass; world/music table names missing IDs. Re-key to current worlds, use Material only as secondary sonic bias. |
| `knowledge/05_DESIGN_KNOWLEDGE.md` | P1 FIX | Format and Turkish typography rules pass; world-format section uses retired ontology. Update only that section plus token language. |
| `knowledge/06_PROOF_KNOWLEDGE.md` | P1 FIX | Repair discipline passes; Phase0/TACTILE/Teaching Recipe gates can contradict current contracts. Rewrite gates around actual tokens and 2-axis rules. |

## What Already Passes

- No `Aras` / `Defne` occurrence.
- No 2025 wording or hardcoded generator-version instruction.
- Source/copy-as-data prompt-injection defense is consistent.
- Reference DNA is consistently subordinate to source/path/world/identity/logo/copy.
- Brand lock, Turkish glyph integrity, IP safety, batch-decay prevention, exact repairs, and “usable output first” are strong.
- Claude/GPT output headings are aligned per role.

## Recommended Migration Order for Claude

1. Fix README installation so GLOBAL_BRAIN is always loaded.
2. Replace authority wording everywhere with current 2-axis hierarchy.
3. Remove or map every retired world ID against `SURGERY_DATA` current IDs.
4. Make exact token consumption explicit per role.
5. Add ~9s balanced splitting to Motion adapter + knowledge + Proof verification.
6. Resolve `PHASE0_PRESET:` by either guaranteed site emission or agent removal.
7. Deduplicate GPT embedded tables against knowledge.
8. Run packet probes for VIDEO and DESIGN, then re-audit hashes and exact output tokens.

## Protected-Path Proof

Before audit, SHA-1 hashes for all `agents/**/*.md` and `knowledge/*.md` were recorded in `/tmp/phase4-protected-before.sha`. Completion must compare a fresh sorted hash list byte-for-byte; any difference invalidates this report-only phase.
