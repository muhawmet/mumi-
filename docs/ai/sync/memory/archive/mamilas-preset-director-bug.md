---
name: mamilas-preset-director-bug
description: "Main'de mevcut ürün bug'ı — Phase-0 preset tıklaması world/DNA'yı store'a yazmıyor, Director step FAIL kalıyor, 5 e2e spec bloke"
metadata: 
  node_type: memory
  type: project
  originSessionId: 0dbec149-7cce-4bb7-ac95-0e1e4f2321be
---

**Bug (2026-07-03 tespit, main'de de var — 3D dalından BAĞIMSIZ):** Dashboard'da Phase-0 preset kartına tıklayınca (`DashboardStep.tsx:36-48 onPreset` → `applyPreset`) `selectedWorldId`/`selectedRefIds` store'a yazılmıyor; Director step "World yok / Eksik: dünya · DNA" ile bloke kalıyor. Probe kanıtı: preset sonrası `{world:"", refs:0, step:"director"}` hem main (5180) hem feat/3d-diorama-shell (5173) üzerinde birebir aynı.

**Why:** Muhtemelen Director step'in preset-only eklendiği redesign sırasında `applyPreset`/`directorDefaultSets` kablolaması koptu. 5 e2e spec bunu bekleyip 30s timeout'a düşüyor (Phase 0 full flow, per-scene override, design preset, beat-planner, screenshots).

**How to apply:** Ayrı fix seansı: `applyDirectorSets`/`onPreset` zincirini debug et (`DirectorStep.tsx:36-51`). Ardından e2e'deki stale selector borcu da var: `SLOT 1 · PRIMARY DNA` → `SEÇİLİ DNA`/`x/3 kilit`; "Ekle"/"Detay"/arama kutusu artık yok → kart-tıklama UI'sine göre 4 test yeniden yazılacak. İkisi bitmeden `npm run test:e2e` gate'e giremez. Bkz [[mamilas-3d-shell-progress]].
