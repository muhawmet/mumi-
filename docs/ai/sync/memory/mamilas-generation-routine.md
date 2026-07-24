---
name: mamilas-generation-routine
description: "Muhammet's real production routine and clip economics for MAMILAS (image/video models, Kling timing)"
metadata: 
  node_type: memory
  type: user
  originSessionId: 547a9321-886f-4d95-945e-ea586479a224
---

Muhammet's actual generation routine (as of 2026-06-26):

- **Images:** `nano_banana_2`. **Video:** `Kling 3.0` (primary). Other models (Veo 3.1, Runway Gen-4.5, Seedance 2.0) are **advisory only** — surface as "this project might do better with X", never as default. Sora 2 is deprecating (do not bake in).
- **Tool access:** full. Works in **Magnific Spaces** (formerly Freepik Spaces; Freepik→Magnific rebrand 2026-04-28). Node-based canvas with a List/batch node, so generating ~25 scenes in one batch is realistic. Do NOT artificially limit the system to 3-4 tools.
- **Clip economics (critical):** a generated Kling clip has a degraded **head** (~0.5s warm-up) and **tail** (~1.5s drift), so the generated length ≠ usable length. A clean ~5s voice-over pocket needs a **6.5–8s generated clip** (vo + head + tail trim). "5 saniye üretmek 5 saniye temiz video vermez." Budget must track `genClipSec` (6.5–8s) separately from `usableSec`/`voPerScene` (~5s).
- Practical scene ceiling for a clean Kling run is **25** (not 12). See [[mamilas-decode-next-task]].
