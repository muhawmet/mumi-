# MAMILAS PRO OS: THE LEGACY RESTORATION REPORT
**To Claude:** If you are reading this, do NOT ask for the old `mamilas.html` file. This document contains the absolute truth of what the old Vanilla JS site did perfectly, and what your new React/Zustand migration (`mamilas-modern`) completely destroyed. 

Your sole focus for today's session is to **restore the "Brain"** of this application. The UI is currently beautiful, but the engine is a lobotomized dummy. Read this carefully.

---

## 1. THE CORE BRAIN: Adaptive LLM vs Procedural Dummy
**What the Old Site Had:**
The legacy site functioned as an advanced **Prompt Engineering UI**. It did not try to procedurally guess what an image prompt should look like. Instead, it gathered all the user's variables (World, Ref DNA, Palette) and generated a massive **Meta-Prompt (System Prompt)**. This meta-prompt was then fed into a Master LLM (Claude/GPT), which acted as the "Adaptive Creative Director". The AI creatively generated cohesive visual descriptions, semantic camera angles, and musical cues based on the *meaning* of the text.

**What the New Site Does (THE PROBLEM):**
In `src/core/pure.ts`, you stripped out the LLM entirely. You tried to replace a Creative Director with JavaScript string concatenation (`buildImagePrompt`). 
* The output is now robotic metadata: `"Project topic: Math. Scene intent: orient the audience..."`
* **Why it's a disaster:** Image generators (Midjourney, Flux, Kling) do not understand abstract metadata. They need concrete visual descriptions. The new system will generate literal garbage or hallucinations.

**Your Goal:** Re-integrate the LLM layer. The UI must compile the variables into a strict System Prompt, send it to the AI, and parse the resulting JSON back into the `scenes` array.

---

## 2. STRICT STATE VALIDATION & AUTO-WIRING (The Smart UX)
**What the Old Site Had:**
* **Smart Defaults (Auto-Wiring):** When a user selected a Project/Topic via `applyProject()`, the system didn't just save an ID. It automatically pre-filled the most appropriate `defaultReferenceCategory` and `recommendedPalette`. The UI guided the user.
* **Strict Gating (`readiness()` and `done()`):** You could not click "Generate" if you missed a step. The system strictly validated that World, Reference, Palette, and Scenes were completely configured.
* **DNA Overrides:** Selecting a Reference DNA dynamically changed the AI engines. `applyRef()` would automatically map `imageEngine`, `videoEngine`, and inject `cameraGrammar` and `motionGrammar` into the state.

**What the New Site Does (THE PROBLEM):**
* The Zustand `advance()` function in `useStudioStore.ts` is blind. It only checks `if (selectedWorldId)`. A user can skip the Palette and Reference DNA entirely and still generate a broken batch.
* `imageModel` and `videoModel` are hardcoded to `midjourney_v7` and `kling_2_1` in the initial state and never change, completely ignoring the Reference DNA's preferred engines.

**Your Goal:** Restore the State Machine's intelligence in Zustand. Re-implement strict progression blocking and auto-wiring based on `SURGERY_DATA`.

---

## 3. RAW SCRIPT PARSING & DURATION LIMITS ("BÖLEMEZSİN")
**What the Old Site Had:**
The legacy system accepted raw Turkish narration text, split it into scenes, and ran an `estimateVO(text)` function based on a specific Words-Per-Minute (`getWPM()`) logic. 
* It strictly validated the estimated duration against `ENGINE_USABLE` limits (e.g., Kling has an 8.5s usable limit, Runway 14.5s).
* If a scene's text was too long for the engine to render in one shot, the UI actively threw a critical warning: **"BÖLEMEZSİN"** (You Can't Split) or **"BÖL ÖNER"** (Suggest Split), forcing the user to shorten the narration before generating.

**What the New Site Does (THE PROBLEM):**
* `buildVoiceOver` in `pure.ts` uses fake dummy text (`[Taslak: Merhaba!...]`). It completely ignores real user scripts. 
* All duration tracking and engine limit warnings are gone. The user will confidently generate a 15-second narration scene, pass it to Kling (which can only do 8.5s reliably), and the final video will cut off mid-sentence.

**Your Goal:** Bring back `estimateVO`. Re-link the text inputs to duration calculations, and implement the Engine Usable limits directly into the React UI warnings.

---

## 4. SEMANTIC CAMERA vs ROUND-ROBIN CAMERA
**What the Old Site Had:**
The Shot Director logic chose lenses based on semantic context. If the scene was about revealing a world, it chose a 35mm Wide. If it was about a micro-mechanism, it chose an 85mm Macro.

**What the New Site Does (THE PROBLEM):**
`buildImageVantage` uses a primitive round-robin array: `pool[i % pool.length]`. Scene 1 gets 35mm, Scene 2 gets 50mm, Scene 3 gets 85mm, regardless of what is happening in the scene. It is completely blind contextually.

---

## 5. THE SUNO BRIEFS (Music Generation)
**What the Old Site Had:**
The LLM wrote specific, musically literate Suno prompts (e.g., genre tags, BPM, instrumentation, energy arcs).

**What the New Site Does (THE PROBLEM):**
It spits out a hardcoded boilerplate string for every scene: `[MUSIC TARGET: world-id] World-grounded mood...`. Suno cannot generate good music from this.

---

## SUMMARY OF TOMORROW'S ARCHITECTURE DIRECTIVE
1. **Keep the React/Zustand UI.** It is fast and clean.
2. **Delete the procedural prompt generation in `pure.ts`.** It is a failed experiment.
3. **Restore the "Meta-Prompt Generator".** The app must output a massive instructions payload that the user can copy/paste into an LLM (or send via API) to generate the *actual* `scenes` JSON.
4. **Restore the Guardrails.** Put the duration math (`estimateVO`) and strict state blocking back into `useStudioStore.ts`.

*Do not rebuild the old vanilla DOM spaghetti. Rebuild its BRAIN inside the new React body.*
