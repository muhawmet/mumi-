# CODEX Vision-Gate Audit — 2026-07-11

**Branch:** `feat/3d-diorama-shell`
**Scope:** output-level production defects only; no code edits.
**Verdict:** The literal “OPEN the image” regression is **not present at current HEAD**: both `.command` files and the generated production JSON tell the agent to open/read the PNG. The live defect is narrower and more consequential: nothing produces a blocking verdict that the opened frame actually fulfills the authored image promise. The package also does not make the full Nano Banana → Magnific → Higgsfield → Kling → Suno/ElevenLabs day artifact-complete.

## Method and real output read

- Read `CLAUDE.md` and `docs/superpowers/HANDOFF-2026-07-11-gece3-beyin-recete.md` first.
- Ran the mandated `npx tsx scripts/prompt-bak.ts`. It emitted no prompt because this checkout has no local `tsx` dependency (`npm ls tsx --depth=0` is empty) and restricted `npx` could not obtain it.
- Therefore ran the real `generateBatch` + `buildProductionExport` path through the repository's installed Vite/Vitest TS transformer using a throwaway test, printed all three real image prompts, all three real blind motion drafts, and the real exported command/production text, read them, then deleted the throwaway file. The run passed: 1 test, real `generateBatch`, no fixture.
- Real source used: `Bir yanardağın derinliklerinde magma basıncı yükselir. Basınç kayaları çatlatır ve kızgın magma yüzeye fışkırır. Kül bulutu gökyüzüne yükselirken lav yamaçtan aşağı akar.`

The promise is demonstrably already present without a Semantic Scene Ledger. Real scene 1 output contains:

> `Scene brief (Claude yazar): "Bir yanardağın derinliklerinde magma basıncı yükselir." [SOURCE — do not render as on-screen text; narration only].`

The same real export stores:

> `sceneBrief: "Bir yanardağın derinliklerinde magma basıncı yükselir."`

> `prompts.motion: null`

> `prompts.motionDraft: "[1] MOTION ... source beat \"Bir yanardağın derinliklerinde magma basıncı yükselir.\" ... authored by Claude against the approved start frame ..."`

So the killed ledger remains correctly killed: the source promise is already in `scenes[].sceneBrief`, the full framework in `scenes[].prompts.image`, and—after Pass A authors the final engine prompt—the definitive promise is `image_prompts/<id>.txt`.

## Focus 1 — current vision text: CLEAN as a file-open gate, incomplete as a promise gate

The premise that the refactor replaced/dropped “open and look” is stale at current HEAD. Nothing replaced it; current text is:

- `agents/MOTION-CALISTIR.command`: `images/<id>.png AÇ ve GÖR → göremiyorsan MISSING_IMAGE, devam et. Kare yok → motion yok.`
- `agents/production/MOTION-CALISTIR.command`: `images/<id>.png AÇ ve GÖR → göremiyorsan MISSING_IMAGE, devam et. Kare yok → motion yok.`
- Real generated production JSON: `The final motion prompt ... is written ONLY after images/<id>.png exists, has been opened and visually read ... project.json ... can never substitute for looking at the actual frame.`

`git blame` dates the two `.command` open/look lines to commit `8c22e406`; the structured `production.motionGate` wording is present from `6469a00`. `src/core/qa.ts` still only receives `StudioState` and scans `imagePrompt`/`motionPrompt` strings. That is not the right layer for filesystem vision unless the UI is redesigned to ingest pixels.

**Correct home:** the actual pixel-opening/checking procedure belongs in the executable production skill/`.command`; its required inputs, blocking status, and evidence record belong in `src/core/productionExport.ts`. `qa.ts` should remain the pre-frame prompt lint, not pretend it saw pixels.

## Findings

### 1. OPEN is enforced in prose, but PASS against the authored image promise is not enforced

**Defect:** Pass B opens/inventories the frame, then only says to flag a contradiction with `CONCEPT/EVENT`; it never requires a checklist comparison against the definitive `image_prompts/<id>.txt` plus world/path/text locks before motion can be written.

**Real proof:** The real exported promise contains all of these simultaneously:

> `Scene brief ... "Bir yanardağın derinliklerinde magma basıncı yükselir."`

> `Camera/vantage: low side dolly ...`

> `Composition pattern: rising diagonal ...`

> `Text/logo: clean plate ... No floating text ...`

> `Path contract ... MUST deliver tactile 3D world material, dominant lesson-object, motion hook ...`

But the current replacement check is only:

> `Kare CONCEPT/EVENT ile çelişiyorsa ... IMAGE_MISMATCH yaz.`

And `productionExport.scaffold` says:

> `open each present image and read it against its scene dossier and handoff.MOTION`

There is no mandatory `FRAME_PASS`, no per-lock evidence, and no instruction to open the authored `image_prompts/<id>.txt` during the comparison. The exported `qa.imageScore`/`qa.proof` were computed from the prompt string before any PNG existed.

**Bad frame/clip:** A generic 3D volcano can depict rising magma and therefore satisfy the broad event while violating premium-CG world, rising-diagonal composition, child-eye camera, clean-plate text, palette/light, or dominant lesson-object. Pass B can animate that wrong frame and produce a polished but visually off-contract clip.

**Smallest fix / layer:** In both `.command` Pass B blocks (or a single production skill they both embed), require: open `image_prompts/<shot>.txt` + open `images/<shot>.png`; issue `FRAME_PASS` only after source subject/event, path requireds, world/render, camera/composition, palette/light, character/product identity, baked-text exactness/clean plate, and forbidden/IP checks. Any fail becomes `IMAGE_MISMATCH` and forbids `motion/<shot>.txt`. Add the structured statuses/evidence fields in `src/core/productionExport.ts`. Do not add a derived ledger.

### 2. The named Nano Banana 2 → mandatory Magnific sequence is absent from Pass A

**Defect:** The package jumps from authoring an image prompt to “drop images”; it never gives Mami an ordered, named mandatory action sequence inside the production-day instructions.

**Real proof:** Real exported scaffold says:

> `Write image_prompts/<id>.txt ... then generates the image.`

The actual `.command` Pass A ends with:

> `Görselleri images/ içine at ... bitince 'resimler hazır' yaz.`

The file header advertises only:

> `PASS A: scaffold (image prompts + suno + brief) → DUR`

Neither Pass A names `Nano Banana 2 (inside Magnific canvas) → Magnific fidelity upscale → save the upscaled result as images/<id>.png`.

**Bad frame/clip:** Mami or a replacement operator can generate in another image surface, export the raw Nano result, or assume Magnific is optional; the first time the omission becomes visible may be I2V softness, texture crawl, damaged type, or identity drift.

**Smallest fix / layer:** Put the human production checklist in both `.command` Pass A blocks (or the shared production skill): for every shot, author prompt → generate with package-locked `imageModel` (`nano_banana_2`) inside Magnific canvas → inspect raw → mandatory fidelity upscale → inspect fidelity → only then write the contract filename. Mirror the ordered stages in `productionExport.scaffold`.

### 3. Magnific completion is self-attested, not evidenced; a raw frame can pass unnoticed

**Defect:** Raw generation and upscaled frame share the single path `images/<id>.png`; the gate asks a question only when provenance is “unclear” and has no dimensions/provenance/fidelity evidence.

**Real proof:** Real folder contract has only:

> `images/<id>.png: YOU drop the generated start frame here.`

The real gate says:

> `if the frame's provenance is unclear, set motionStatus PENDING_UPSCALE and ask`

The `.command` similarly asks:

> `Bu kare Magnific'ten geçti mi?`

No manifest records raw/upscaled filenames, Magnific completion, dimensions, or a fidelity comparison. `motionStatus` begins as `PENDING_IMAGE`, but the JSON is declared `never edit by hand`; only free-text `report.md` can change.

**Bad frame/clip:** A raw Nano PNG renamed to `1.png`, or a “yes” answer attached to the wrong revision, is accepted as the I2V anchor. Kling then amplifies low-detail edges, unstable lettering, face/product drift, and upscale-needed texture shimmer.

**Smallest fix / layer:** In `productionExport.ts`, separate `raw_frames/<id>.*` and `images/<id>.png` (approved Magnific output), or add an agent-written per-shot manifest with source filename/hash, output dimensions, `magnificFidelityConfirmed`, and a raw-vs-upscaled fidelity verdict. `.command` must refuse FRAME_PASS/MOTION unless that evidence exists. Pixels still get judged by the agent; code supplies the unskippable artifact contract.

### 4. Higgsfield variation and paid Kling final are policy sentences, not production artifacts

**Defect:** The package writes a final motion prompt but declares no Higgsfield variation files, Kling final file, selected winner, or final-clip status. Thus the agent cannot prove the required free variation happened before the paid final, nor inspect the final clip.

**Real proof:** Current `.command` says:

> `Kling final çekiminden önce en az 1 Higgsfield varyasyonu ZORUNLU ... PENDING_HIGGS`

But the real folder contract ends its video side at:

> `motion/<id>.txt: FINAL i2v motion prompt per scene`

And the final step is:

> `report.md güncelle: DONE / MISSING_IMAGE / IMAGE_MISMATCH / PENDING_UPSCALE / PENDING_HIGGS`

There is no `higgsfield/`, `kling_final/`, take ID/URL/file, `HIGGS_VARIATION_DONE`, `KLING_FINAL_DONE`, or clip vision-QA stage. The `.command` itself does not drive either service; “DONE” can mean merely “prompt written.”

**Bad frame/clip:** The operator can spend Kling credit on the first untested motion, select a weak variation, or finish with a clip that morphs the exact frame despite a correct prompt. The package can still look complete because every `motion/*.txt` exists.

**Smallest fix / layer:** Extend `productionExport.ts` folder/status contract and `.command` production stages: `motion prompt ready → Higgsfield variation artifact/evidence → variation vision review → chosen take → Kling final artifact/evidence → final clip vision review`. Gate `KLING_FINAL_READY` on at least one reviewed Higgsfield take; reserve `DONE` for an accepted final clip, not prompt creation.

### 5. Suno is only a text brief and ElevenLabs is absent, so audio production can be skipped while the run looks done

**Defect:** The production bundle names a Suno prompt file but no rendered music asset/status; it carries VO text only as scene data and contains no ElevenLabs step or narration artifact contract.

**Real proof:** Real folder contract contains:

> `suno.txt: Single music/sound brief for the whole piece (agent writes).`

The real scene carries:

> `voiceOver: "Bir yanardağın derinliklerinde magma basıncı yükselir."`

Across `productionExport.ts` and both `.command` files there is no `ElevenLabs` instruction and no required music/VO audio filename. The scaffold says only:

> `Write final_brief.md ... and suno.txt ...`

**Bad frame/clip:** Production can be reported complete with silent clips, missing narration, wrong narrator take, or only a Suno prompt instead of a usable music file. There is no artifact absence for the agent to catch.

**Smallest fix / layer:** Add explicit `audio/music.*` (Suno render), `audio/vo/<scene-or-master>.*` (ElevenLabs, one narrator), and an audio status/evidence checklist to `productionExport.ts`; add the ordered Suno + ElevenLabs production steps and missing-audio blockers to both `.command` files. Keep VO text verbatim from `prompts.voiceOver`.

### 6. Multiple production JSONs can silently select the wrong project

**Defect:** Both runners choose the first glob match without requiring exactly one package or asking Mami to confirm the chosen project.

**Quoted proof:** Root runner:

> `JSON_LIST=(*_production.json *_command.json project.json)`
> `JSON="${JSON_LIST[1]}"`

Production runner:

> `JSON_LIST=(*_production.json(Nom) *_command.json(Nom) project.json(Nom))`
> `JSON="${JSON_LIST[1]}"`

The second prefers a newest match within the combined patterns, but neither rejects ambiguity. The root runner is explicitly intended to remain in `Masaüstü/Prompt/`, where stale exports can accumulate.

**Bad frame/clip:** The agent authors prompts and motion for yesterday's JSON while Mami drops today's frames. Broad IDs (`1.png`, `2.png`) still match, so the mismatch is reported only if the agent notices semantic conflict; otherwise the entire production is for the wrong brief.

**Smallest fix / layer:** In both `.command` shell wrappers, require exactly one matching JSON; if more exist, print the filenames/topic/commandId and stop for explicit selection. This belongs in the shell wrapper before any agent invocation.

## Production-flow answer

| Stage | Present today? | Ordered and unskippable? |
|---|---|---|
| Nano Banana 2 in Magnific canvas | Only `locks.imageModel` exists in JSON; Pass A does not name the human action | **No** |
| Magnific fidelity upscale | Mentioned in motion law/gate | **No** — conditional question, no artifact proof |
| Frame opened before motion | Present in both `.command` files and generated `motionGate` | **Yes as an agent instruction; no machine proof** |
| Frame checked against full promise | Only broad `CONCEPT/EVENT` mismatch wording | **No** |
| Higgsfield variation | Required in prose | **No artifact/evidence stage** |
| Kling 3.0 paid final | Named in prose | **No artifact/evidence/final clip QA stage** |
| Suno | `suno.txt` brief | **Prompt only; rendered music not required** |
| ElevenLabs VO | VO text exists | **Absent as a production step/artifact** |

Bottom line: a motion prompt without any frame is now difficult to produce accidentally because `prompts.motion` is `null` and the commands say OPEN. A motion prompt from the wrong/bad/raw frame is still possible because the current gate verifies presence/provenance by instruction, not fulfillment of the actual authored promise with recorded evidence. Skipping Magnific is not reliably caught; skipping downstream Higgsfield/Kling/Suno/ElevenLabs artifacts is not represented as an incomplete run.
