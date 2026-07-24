---
name: mamilas-3d-shell-progress
description: "3D golden-hour \"F dili\" kabuğu BİTTİ (saf Turner deniz-manzarası, yüzen tablolar kaldırıldı); dokunulmaz sahne kuralları + karıncalanma dersi"
metadata: 
  node_type: memory
  type: project
  originSessionId: 660e0b9e-6cba-4d82-b4f5-ce9fe0fc7ee2
---

**3D SHELL DURUMU (2026-07-11): F golden-hour tableau BİTTİ.** Dal `feat/3d-diorama-shell`. Kabul edilen görsel dil = Turner golden-hour ("F" demosu): cerulean→altın gök, ufukta batan güneş + god-ray, teal deniz + glitter yolu, uzak sırtlar, martılar, altın polen. World-adaptif: seçili world'ün `palette_lock`'una göre sahne rengi döner (one_piece→mavi deniz, noir→monochrome).

**Çekirdek dosyalar:** `src/scene/DioramaStage.tsx` (sahne), `lookConfig.ts` (ışık grameri — tek otorite), `scenePalette.ts` (deterministik world→palet), `PostFX.tsx` (god-ray occluder `sunRef.ts` üzerinden + DOF), `CameraRig.tsx`, `SceneLayer.tsx` (WebGL guard + `?scene=force`/`?scene=off` + no-WebGL altın gradient fallback). Chrome gizle = "AKVARYUM MODU" (`.ml-aquarium-toggle`) → saf sahne.

**YÜZEN TABLOLAR KALDIRILDI** (`db1daf8`, Mami "ne işi var") — WorldHeroFrame + FRAME_SLOTS river + LogoFrame söküldü, saf deniz-manzarası kaldı. Slot altyapısı (`assetSlots.ts`/`useSlotTexture.ts`) kod olarak durur ama sahnede artık render edilmiyor.

**DOKUNULMAZ SAHNE KURALLARI:**
- Gök/deniz **PROSEDÜREL** ve world-adaptif. `backdrop-sky.webp`/`floor-disc.webp` asset'leri EZİLMEZ — SkyDome prosedürel (eski koyu atölye asset'i sky'ı eziyordu, prosedürel yapıldı).
- **KARINCALANMA DERSİ:** Mami sahnede "karıncalanma" gördü. Kök neden PostFX full-screen `Noise` efektiydi (pürüzsüz altın gökte dijital speckle) — SÖKÜLDÜ. Kurallar: (1) full-screen Noise YOK, (2) baked sky-grain YOK, (3) sky dokusu 2048×1024 (minification moiré), (4) yeni grain EKLEME. Painterly grain gerekirse gök DOKUSUNA göm, post-process değil.
- **Görsel kanıt PNG ile** (`scratchpad/scene-f.mjs` chrome-gizli sahne, `scripts/goldenhour-shots.mjs` PNG/5179/?scene=force, `scratchpad/recipe-now.mjs` reçete) — JPEG q82 düz gradyanda kendi karıncasını ekler, "gördüm" deme.

**SIRADA (3D tarafı):** düşük-değer opsiyonel cila (atlanmış: 2-dome sky crossfade — instant regen yeterli; sağ ufuk blok-sırt yumuşatma). Asıl iş 3D değil — [[mamilas-preset-director-bug]] + çekirdek pipeline (istişare MUST NOW).
