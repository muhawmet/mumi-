# PHASE 1 — Decision Core & Creative Library

**Tarih:** 2026-07-15
**Kapsam:** Yalnız Decision Core & Creative Library
**Builder verdict:** **PASS — implementation complete**

## Sonuç

İlk builder geçişi kaynak niyeti yasağını yalnız ekran metni açısından okuyup PASS verdi. Fresh
bağımsız denetçi bunun daha geniş canlı kökünü yakaladı: `decodeBrief`, raw source keyword/kelime
sayısından path/world/ref/palette çıkarıyor ve store bu sonucu seçimlere yazıyordu (`C-01`). Builder
verdict'i geri çekildi; kritik kusur kökten söküldü ve kapılar yeniden çalıştırıldı.

Artık plain raw source yalnız içeriktir: `decodeBrief` keyword, regex bankası veya kelime sayımıyla
yaratıcı karar üretmez; `decodeRawSource` Mami'nin project/path/world/ref/palette/topic/subject
seçimlerini korur. Yalnız açıkça etiketli eski MAMILAS dossier metadata'sı kendi kararlarını geri
yükleyebilir. Generic starter kullanıcı tıklaması da topic/source metnini okumaz. Önceki baseline
auditindeki otomatik ekran metni kusuru da kapalı kalır: `AUTO` clean plate üretir; yalnız Mami'nin
açık `DENSE` seçimi site tarafında label üretebilir.

Bu receipt görsel kalite PASS'i vermez. Site hâlâ uyumluluk/önizleme için legacy prompt taslağı
üretebilir; validated command lifecycle içindeki final engine prompt Image Author artifact'idir.

## Gerçek çıktı kanıtı

### 46 WorldPacket

Doğrudan `toWorldPacket` üretimi ölçüldü:

- **46/46** paket üretildi.
- **46/46** paket byte-içerik olarak benzersizdi.
- Boş render/camera/light/motion/legacy alanı: **0**.
- Ham `#RGB/#RGBA/#RRGGBB/#RRGGBBAA` sızıntısı: **0**.
- Uyumlu ref directive'lerinde korumalı terim/eser adı sızıntısı: **0**.
- `legacyRenderLaw`, kaynak world `render_law` değerini koruyor; uyumsuz ref directive'i boş kalıyor.

### Gerçek `generateBatch`

`scripts/inspect-brief.ts` fixture olmayan üretim yolu ile iki temsilî vaka gözle okundu:

- Eğitim / `pixar_3d_edu`: `AUTO` kaynak başlığını baked text'e çevirmedi; sahneler clean plate.
- Premium reklam / `deakins_naturalist`: seçili `warm_autumn` paleti fiziksel ışık diliyle prompt'a
  ulaştı; uyumsuz ref `REFERENCE_DNA_SUPPRESSED` olarak işaretlendi; ham hex yoktu.

Ayrıca aynı kaynağın tüm world'lerdeki gerçek üretim matrisi doğrudan `generateBatch` ile çalıştırıldı:

- **46/46 GENERATED** (world grubuyla uyumlu production path kullanılarak).
- Her world için 3 sahne; toplam **138** gerçek sahne çıktısı.
- **46/46 benzersiz** image-prompt hash'i.
- Kaynak beat'i eksik sahne: **0**.
- Image prompt'ta ham 6-haneli hex sızıntısı: **0**.

Bu matris estetik frame hükmü değildir; yalnız çekirdeğin gerçek üretim yolunu ve veri taşımasını ölçer.

## Kod ve sözleşme karşı-okuması

- `source.ts`: raw source/beat sırası, boşluk ve hash kimliği korunuyor. `DECODER_RULES`,
  `WORLD_SIGNAL_RULES`, source keyword routing ve confidence kelime-sayımı söküldü. Kalan kelime
  sayımı yalnız VO süre/scene-budget hesabında; yaratıcı seçim veya ekran-metni niyeti üretmiyor.
- `pure.ts`: `AUTO` ekran metni üretmiyor; `DENSE` açık kullanıcı seçimi; `WorldPacket` doğrudan
  `SURGERY_DATA.json` ve palette/ref bağlamından türetiliyor.
- `brain.ts`: palette motor yoluna fiziksel ışık diliyle giriyor; clean plate lettering recipe
  taşımıyor; source beat promptta narration/source olarak kalıyor.
- `contract.ts`: canonical hash zamandan bağımsız; base decision raw source, sıra-semantik beat'ler ve
  açık kararları taşıyor; prompt/timestamp kimliğe girmiyor.
- `engine.ts`: engine window/dialect sabitleri tek kod kaynağında; bu fazda kopya literal eklenmedi.
- `SURGERY_DATA.json`: 46 world, refs, palettes ve legacy render verisi mevcut kod kapılarıyla uyumlu.

## Çalıştırılan kapılar

- İlk odaklı Vitest: **11 dosya · 486/486 PASS**.
- `C-01` düzeltmesi odaklı Vitest: **3 dosya · 92/92 PASS**.
- TypeScript: `npx tsc --noEmit` → **PASS (0 hata)**.
- Tam Vitest: **66 dosya · 1867/1867 PASS**.
- Production build: `npm run build` → **PASS**.

Build yalnız mevcut büyük-chunk uyarısını verdi; Phase 1 veri doğruluğunu kıran hata değildir ve
Studio/final convergence değerlendirmesine bırakıldı.

## Değişiklik kapsamı

Kritik denetçi bulgusu için yalnız şu kök-yol değişti:

- `src/core/source.ts` — raw-source yaratıcı karar decoder bankaları kaldırıldı; açık dossier parser
  korundu.
- `src/store/useStudioStore.ts` — plain source decode Mami seçimlerini artık değiştirmiyor.
- `src/core/advisor.ts` — topic/source okumayan nötr starter.
- `src/pages/Dashboard/DashboardStep.tsx` — UI artık inference iddiası taşımıyor; explicit dossier
  özeti ile kayıpsız ingest ayrıldı.
- İlgili source/advisor/store regresyon testleri yeni ürün yasasına çevrildi; test sayısı düşürülmedi.

Dirty worktree'nin geri kalanı korunmuştur; reset/checkout/stash/push yapılmamıştır.

## Açık durum

Phase 1 için bilinen kritik regresyon yok. Global görsel durum dürüstçe:
`implementation complete / visual validation pending` — gerçek frame estetik hükmü Mami'ye aittir.
