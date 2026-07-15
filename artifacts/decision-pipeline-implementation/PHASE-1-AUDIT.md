# PHASE 1 — Independent Audit

**Tarih:** 2026-07-15
**Kapsam:** Decision Core & Creative Library
**Verdict:** **PASS — C-01 kapatıldı**

## Critical

### C-01 — Raw source'tan gizli karar türetme hâlâ canlı üretim yolunda

`PHASE-1-CORE.md`, “source-intent inference yok” sonucunu yalnız `AUTO` on-screen-text davranışıyla
kanıtlıyor. Oysa `src/core/source.ts:126` içindeki `DECODER_RULES` raw source kelimelerini path/project
seçimine; `WORLD_SIGNAL_RULES` world seçimine çeviriyor. `decodeBrief` (`source.ts:225`) bu keyword
bankasını çalıştırıyor ve ayrıca kısa metni kelime sayısıyla confidence kararına sokuyor.

Bu salt yardımcı kod değil: `src/store/useStudioStore.ts:851` içindeki canlı `decodeRawSource`, sonucu
`projectClass`, `selectedWorldId`, `selectedRefIds` ve `selectedPaletteId` alanlarına doğrudan yazıyor;
Dashboard da raw source değiştikçe `decodeBrief` çalıştırıyor (`src/pages/Dashboard/DashboardStep.tsx:40`).
Dolayısıyla ilk audit anında site Mami'nin açık seçimini kaydetmekle kalmıyor, source kelimelerinden
prodüksiyon intent'i ve yaratıcı seçim uyduruyordu. Bu, completion map'in “site does not infer intent
from source words” ve Phase 1 “no source-intent regex/NLP/word-count inference in the production
path” kapısını doğrudan ihlal ediyordu.

## Resolution / re-audit

**C-01 CLOSED.** İlgili düzeltme karşı-okundu:

- `src/core/source.ts`: `DECODER_RULES`, `WORLD_SIGNAL_RULES`, topic keyword routing'i ve creative
  confidence kelime sayımı kaldırıldı. Plain source artık her içerikte aynı neutral fallback'i verir;
  yalnız açık etiketli MAMILAS dossier metadata'sı path/world/palette restore eder.
- `src/store/useStudioStore.ts:851`: plain source'ta mevcut `projectClass`, world, ref ve palette
  seçimleri korunur; `decodeRawSource` yalnız explicit dossier + `confidence: high` olduğunda restore
  alanlarını yazar.
- `src/core/advisor.ts:26`: `suggestRecipe` topic'i okumaz; açık kullanıcı eylemiyle neutral starter
  verir. `DashboardStep.tsx` inference vaadi taşımıyor ve decode özetini yalnız explicit dossier için
  gösteriyor.
- Mevcut kapı kanıtı: hedefli source/advisor/store testleri **3 dosya · 92/92 PASS**; tam Vitest
  **66 dosya · 1867/1867 PASS**; TypeScript ve production build **PASS**.

Yasak creative inference çağrı zinciri kalktığı ve yeni kırık raporlanmadığı için Phase 1 final verdict
**PASS**. Görsel durum değişmez: `implementation complete / visual validation pending`.

## Bağımsız doğrulanan kanıt

- Doğrudan `toWorldPacket` ölçümü: **46/46** paket, **46** benzersiz paket hash'i; render/figure/
  environment/camera/light/material/motion/palette/legacy boşluğu **0**; ham hex **0**;
  `legacyRenderLaw` uyuşmazlığı **0**.
- Tüm 46 world × 130 ref taraması: **2656** compatible directive'te korumalı terim/eser adı **0**;
  **3324** incompatible eşleşmede non-empty directive **0**.
- Temsilî gerçek `generateBatch` koşularında raw source byte sırası korundu, `AUTO` için tüm
  `onScreenText` alanları `null` ve image prompt ham hex içermedi. Bu sonuç C-01'i kapatmaz; yalnız
  ekran-yazısı alt probleminin düzeldiğini kanıtlar.

## Secondary / final convergence önerileri

- Receipt'in `scripts/inspect-brief.ts` için tarif ettiği `pixar_3d_edu` / `deakins_naturalist` ve
  `warm_autumn` vakaları mevcut script girdileriyle eşleşmiyor; kanıt komutu/çıktısı receipt'e
  sabitlenmeli.
- Receipt'teki TypeScript, 66 dosya / 1867 Vitest ve build sayıları bu bağımsız turda yeniden
  üretilmedi; kritik C-01 statik ve canlı çağrı-zinciri kanıtına dayandığından yeşil testler verdict'i
  değiştirmez.
