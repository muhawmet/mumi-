---
name: mamilas-production-export
description: Final Brief sonrası tek-dosya üretim paketi (project.json) + motion-from-frames agent beyni
metadata: 
  node_type: memory
  type: project
  originSessionId: 686d7546-b373-4767-8e21-a8372e517acd
---

MAMILAS "Üretim Paketi" sistemi (kuruldu 2026-06-26). Doktor (kullanıcı) sitede
reçeteyi yazar → Final Brief → **⬇ Üretim Paketi** butonu tek dosya emit eder
(`<slug>_production.json`, schema `mamilas.production.v2026`). Eczacı = Production
Agent: paketi + görselleri okuyup motionu **kareye bakarak** yazar.

**Tek yasa:** No image, no motion. Motion sadece `images/<id>.png` var olunca ve
görüldükten sonra yazılır. Görsel↔sahne eşleşmesi index-bazlı (`<id>.png` ↔ scene
id, source order). Eksik görsel → `MISSING_IMAGE` + report.md, batch bloklanmaz.
Zip kütüphanesi yok → agent ilk çalıştırmada klasörleri/txt'leri kendi kurar
(Pass A scaffold, Pass B motion). Sıfır bağımlılık, sıfır ekran görüntüsü.

Kod:
- `src/core/productionExport.ts` — `buildProductionExport(state)` (buildCommandJSON'u
  sarar, `production` bloğu ekler) + `bundleSlug()`. `engineUsableSec` (brain.ts)
  yeniden kullanılır. Test: `src/core/productionExport.test.ts` (9 assert).
- `src/pages/Timeline/TimelineStep.tsx` — `onExportProduction` + "⬇ Üretim Paketi"
  butonu (Komut JSON ile Handoff arası).

Agent beyni (3 yüzey, tek kontrat): `agents/production/RUN_MOTION_AGENT.md` (CLI
runner, Claude Code/Codex), `agents/claude/07_PRODUCTION_CLAUDE.md`,
`agents/gpt/07_PRODUCTION_GPT.md`, `knowledge/07_PRODUCTION_KNOWLEDGE.md`.
`agents/README.md`'ye PRODUCTION rolü + bundle akışı eklendi.

**Sahne limiti kaldırıldı (4 dk+ uzun format):** `pure.ts` SCENE_OVERFLOW (>25)
bloğu silindi; `source.ts` MAX_DURATION_BUDGETED_SCENES 25→600 (pratikte limitsiz)
→ beat moduna basınca (Dengeli/Ekonomik/Hassas) `autoGroupBeats` otomatik doğru
sayıda böler, elle "böl böl böl" gerekmez. `advisor.ts` uyarı >40'ta info notu.

İlişkili: [[mamilas-generation-routine]] [[mamilas-decode-next-task]]. Commit
40a52fa, suite 202/202, tsc + build temiz.
