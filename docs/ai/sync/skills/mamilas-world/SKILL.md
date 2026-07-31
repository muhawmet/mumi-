---
name: mamilas-world
description: MAMILAS'a gold-standard world/referans tarifi yazma disiplini — render_law şablonu, negative_lock kuralları, example_injection formatı. Yeni dünya/ref eklerken veya zayıf tarifi yeniden yazarken kullan.
---

# MAMILAS World/Ref Yazım Disiplini (arcane şablonu)

Veri: `src/core/SURGERY_DATA.json`. Bu TAT işidir — işçi ajana verilmez, bizzat yazılır.

## World alanları
- `render_law`: stüdyo/lineage adıyla açılır; çizgi/dolgu/arka plan/post fiziği somut (px, değer basamağı, doku); sonunda `IMPERATIVE:` + `Forbid ...` cümleleri. Hibrit dünyalarda emir KATMAN-BAZLI yazılır (ders: demon_slayer'a yanlış yapıştırılan "STRICT PURE 2D" kendi light_law'uyla çelişiyordu). **FIREWALL (pure.test.ts): render_law prose'u kendi `negative_lock`'unun yasakladığı özel ismi İÇEREMEZ** — render_law verbatim prompt'a girer, banned isim orada pozitif bağlamda telif firewall'unu deler. Film/karakter adı örneği verme (ör. ghibli render_law'da "Tonari no Totoro" YASAK çünkü negative_lock "NO Totoro"); lineage'i genel dille aç.
- `line_grammar` / `lens_grammar` / `light_law`: tek paragraf, ölçülebilir terimler (2px, 40-85mm, volumetric).
- `palette_lock`: shadow/mid/accent/highlight hex + `bias`. **bias PROMPT'A GİRER** (paletteLightPrompt): KISA fiziksel-ışık formu — `"<4 karakter-kelime lead>. <kısa fiziksel not, küçük 'no' YOK>. NO <kısa negatif>."`. Uzun dosya-essey YASAK (luminance%/hue°/Mood:/Register: prompt'a döküler). `biasCharacterClause` baştaki virgül-listeden 4 kelime çeker; `biasNegativeClause` ilk `no/NO`'dan (case-insensitive!) sonrasını alır → prose ortasında küçük "no undertone" varsa TÜM kalanı prompt'a boşaltır. bias'ta ham hex + IP adı ASLA (world-adjacent bile: "One Piece-adjacent" prompt'a sızar).
- `motion_cadence`: fps + smear/hold kuralları.
- `negative_lock`: IP karakter/mekân/kostüm adları tek tek (world-seviyesi IP-blok BURADA yaşar); "Turkish label only"; teknik yasaklar KATMANA scope'lu ("NO fully 3D CG character", blanket "NO 3D" değil).
- `example_injection`: film-ready örnek prompt — Mamilas karakteri + Türkçe label + somut İstanbul/yerel mekân + motion seed + AVOID + "Clean motion-ready start frame." Örnek sahne konusu dikte etmez.

## Ref (DNA sesi) alanları
`id, name, cat, use, avoid, dna, preview, anchor, worldId`. Gold format = 7-katman prose (Medium/Era · Named anchor · Signature light · Color/grade · Lens/optics · Texture/render · Composition+motion), `anchor`=tek-satır distilasyon, `use`="grammar only, original subjects only".
**⚠️ REF FIREWALL (pure.test.ts 'keeps user-facing reference DNA language free of protected franchise terms'): `name/use/avoid/dna/anchor` 20 korumalı franchise teriminden ARINIK olmalı** (one piece, naruto, dragon ball, solo leveling, attack on titan, demon slayer, jujutsu kaisen, bleach, spider-man, miles morales, gwen stacy, pixar, ghibli, totoro, spirited away, coraline, kubo, jinx, zaun, piltover). Yani:
- **`avoid` = GENERIC** (eski notun "IP adlarını sayar" YANLIŞTI): "NO named franchise characters, NO iconic costumes or emblems, NO named powers/techniques, NO recognizable franchise locations; original subjects only." IP-adı-blok işi ref'in DEĞİL, world negative_lock'un. Ref = grammar katmanı.
- **`dna` stüdyo adını KULLANABİLİR** (Toei/MAPPA/ufotable/Fortiche/Sony/Studio Pierrot/WIT/Bones korumalı DEĞİL) ama franchise adını KULLANAMAZ (One Piece→"open-sea shonen", Naruto→"hidden-village shinobi"). Pixar/Ghibli korumalı STÜDYO → "premium-CG feature-animation" / "Miyazaki-lineage" (Miyazaki korumalı değil, güçlü latent çapa).
`preview`=id. `worldId` mevcut bir world.

## Kontroller
- Prompt'a girecek hiçbir alanda ham hex bırakma (Palette Translation Law).
- Test sayaçları: `pure.test.ts` / `refScenes.test.ts` / `useStudioStore.test.ts` — veri SAYISI değişince güncelle (içerik değişince değil).
- **ÖNCE entegre+gate, SONRA devam** — içeriği yazıp SONA saklama; her batch'ten sonra SURGERY_DATA'ya merge + gate koş ki firewall'lar erken çıksın (ders: Wave1 hiç entegre edilmediği için 3 firewall merge'de patladı).
- **mamilas-audit ZORUNLU:** "vitest geçti" ≠ doğrulandı — gerçek generateBatch prompt'unu GÖZLE oku (498/498 gate palette prose+IP sızıntısını gizlemişti).
- Gate koş (mamilas-gate), sonra checkpoint (mamilas-checkpoint).
