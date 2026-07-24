---
name: mamilas-fable-scan2-2026-07-16
description: "İkinci Fable taraması (07-16 öğleden sonra) — genel puan 72/100, katman kırılımı + yeni bulgular (gate.sh yok, skill drift, stale rules, ölü UI)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 012e9e37-40db-4dd9-b3fa-bda269d4549a
---

**2026-07-16 ikinci tam tarama (3 paralel okuma ajanı + kalite kapısı bizzat).** Kapı yeşil:
tsc 0 · vitest **1964/1964 (74 dosya)** · build OK (2MB bundle borcu duruyor). Genel puan: **72/100**.

Katman kırılımı: runner/orkestra 85 (en sağlam — gerçek SHA-256 zinciri, piksel-decode'lu frame
kapısı) · core 78 (determinizm FİXLİ, ama brain.ts 2924-satır god-file, qaScore sahte sinyal,
render_law verbatim prop sızıntısı buildImagePrompt yolunda canlı) · testler 75 (~%70-75 gerçek
çıktı ölçüyor; "promptQuality" adlı testler kalite değil jüri-çeklist speci ölçüyor) · UI 58
(iki CSS sistemi aynı anda yükleniyor v2+v3, Timeline'da 104 inline style, ~1200 satır ölü UI:
AntigravityBackground/ThoughtDock/InnerVoicePanel, store'a toptan abonelik, QA Kabine export'u
animasyon rehinesi) · görsel kanıt 0 (implementation complete / visual validation pending).

**Önceki taramada OLMAYAN yeni bulgular:**
1. `.claude/settings.json` → `gate.sh` PreToolUse hook'u işaret ediyor ama **dosya diskte yok**.
2. `.claude/skills/mamilas-ref` ↔ `.agents/skills/mamilas-ref` drift (AGENTS.md vs CLAUDE.md
   satırı) — skill aynalarında generator/`--check` yok, el bakımı.
3. `.claude/rules/core-prompt-path.md` **BAYAT**: "commandId timestamp-derived / determinizm
   kırık" diyor ama kodda fixli (`commandExport.ts:327` content-hash). Tarihçe olarak oku.
4. İki byte-identical runner.mjs (agents/ + agents/production/) el ile senkron — fork riski.
5. `.codex/config.toml` `image_generation = true` — protokol yasağı yalnız davranışsal.

İlgili: [[mamilas-test-suite-is-hollow]] (artık kısmen eskidi — süit %70+ dürüst),
[[mamilas-brain-intelligence-mined]]. Sıradaki: Mami derin tarama isteyecek, sonra UI konuşması
(Mami UI'dan memnun değil — "SVG kuşlar" serzenişi; 3D/animasyon plugin'leri kurulu).
