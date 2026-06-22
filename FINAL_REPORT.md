# MAMILAS Modern — Final Parity Report

Tek session, cerrah hassasiyeti. Legacy referans: `mamilas_work_current/mamilas.html`
(11.940 satır, READ-ONLY). Modern: `mamilas-modern` (Vite + React 19 + TS + Zustand).

## GATE (gerçek çıktı, bu session)

```
npm test        → 88 passed (8 files)
npm run test:e2e→ 10 passed (real Chromium)
npm run lint    → 0 error
npx tsc --noEmit→ 0 error
npm run build   → 325 kB JS (104 kB gzip), ~150 ms
```

## Legacy ↔ Modern özellik paritesi

| Legacy yetenek | Modern karşılığı | Durum |
|---|---|---|
| Brief decode (path/project + curriculum guard) | `core/source.ts` `decodeBrief` + Dashboard decode paneli | ✅ |
| Kayıpsız source ingest (atom split, 100% coverage) | `source.ts` `ingestSource`/`sourceIntegrity` + integrity grid | ✅ |
| Semantic concept engine (su döngüsü vb.) | `core/brain.ts` `conceptRanked` + `brain-data.ts` bankları | ✅ |
| Reference DNA → directives | `dnaDirectives` (camera/light/staging/texture) | ✅ |
| Render Lock (dünya reçetesi verbatim) | `renderLock` + brief'te `RENDER LOCK` | ✅ |
| Kamera anti-monotony | `primeCamera` (hash) | ✅ |
| BÖLEMEZSİN süre kapısı | `durationGuard` (Kling/Runway limit) | ✅ |
| Suno path-BPM brief | `primeSuno` | ✅ |
| Semantic Beat Planner (modlar, tasarruf %) | `core/beats.ts` `planBeats` + Sahneler step | ✅ |
| Storyboard + Çalışma Modu | Sahneler step + `workingMode` | ✅ |
| Kanıt Doktoru / Quantum / QA | `core/proof.ts` `proofDoctor`/`quantumScore`/`qaScore` | ✅ |
| Batch QA + Üretim Defteri | Timeline proof rail + ledger | ✅ |
| Golden viewer | `components/GoldenViewer.tsx` | ✅ |
| Adaptif önizleme | `components/PreviewStage.tsx` | ✅ |
| Phase 0 presetleri (8 video + 7 design) | `data/presets.ts` + Dashboard | ✅ |
| Marka Kiti Kilidi | Recipe brand-kit alanı + brief `BRAND KIT: LOCKED` token | ✅ |
| Kreatif Varyant Testi A/B/C | `buildVariantBriefs` + `CREATIVE VARIANT TEST` token | ✅ |
| Akıllı Öneri ("neden bu ref") | `recommendReason` | ✅ |
| Per-director paketler (image/motion/suno/idea/proof) | `primePacket` + Timeline "Ajan Paketleri" menüsü | ✅ |
| CSV / Markdown / JSON / Handoff export | `core/exporters.ts` + Timeline | ✅ |
| Per-scene prompt override | `applyPromptOverride` + Timeline DÜZENLE | ✅ |
| **Proje Kasası (çoklu isimli kayıt)** | `vault` + `saveToVault/loadFromVault/deleteFromVault` + Dashboard panel | ✅ (bu session eklendi) |
| Tek-proje otomatik kayıt (persist) | Zustand persist v5 | ✅ |
| Ajan + Knowledge dosyaları (Claude Projects / Custom GPT) | repoda `agents/` + `knowledge/` (port + hizalama) | ✅ (bu session taşındı) |

**Sonuç:** Legacy'nin yaptığı, modernin yapamadığı işlevsel bir özellik kalmadı.

## Bu session yapılan cerrahi düzeltmeler

1. **Final brief temizliği (Phase F):** Her brief/pakete zorla basılan uydurma
   "CREATIVE VARIANTS / amber or custom palette / next compatible style"
   narrasyonu kaldırıldı (HARD RULE 1 — no invention ihlali). Varsayılan brief artık
   tertemiz; varyant bloğu yalnızca aktif A/B/C testinde, GLOBAL_BRAIN sözleşmesine
   uygun şekilde çıkıyor.
2. **Reçete ↔ eczacı token sözleşmesi:** site marka kiti kilidinde artık ajanların
   kapısını tetikleyen `BRAND KIT: LOCKED` token'ını birebir yazıyor.
3. **Ajan/knowledge dosyaları:** `agents/` (GLOBAL_BRAIN + claude×6 + gpt×6 + README)
   ve `knowledge/×6` repoya kanonik deliverable olarak alındı; GLOBAL_BRAIN ve
   README'ye site→paket→ajan eşlemesi + garanti edilen token listesi eklendi.
4. **Proje Kasası:** son işlevsel parity boşluğu kapatıldı (store + UI + unit + e2e).

## Bilinçli yapılmayanlar (uydurulmadı, dürüstçe işaretlendi)

- **`PHASE0_PRESET:` token'ı emit edilmiyor:** Modern app'te preset uygulandıktan
  sonra kullanıcı world/ref/palette'i serbestçe değiştirebiliyor — gerçek bir kilit
  yok. Var olmayan kilidi beyan etmek dürüstlük ihlali olur. Gerçek Phase-0 kilit
  semantiği eklenince açılmalı.
- **Phase G (high-end UI design-system katmanı):** App halihazırda dark/gold temalı,
  PanelKit + framer-motion + responsive (≤720px) bir tasarım sistemi üzerinde çalışıyor
  ve tüm akış gerçek tarayıcıda yeşil. MASTER_BUILD Phase G'nin öngördüğü ayrı
  `src/ui/**` primitif kütüphanesi + `tokens.css` kapsamlı kozmetik tur YAPILMADI —
  işlev tamam, saf görsel cila ayrı bir tur olarak bırakıldı. "Bitti" denmedi.
