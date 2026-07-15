# RECEIPT — TASK 0: Bağımsız ön değerlendirme

- Tarih: 2026-07-14
- Model: Claude Opus 4.8 (`claude-opus-4-8[1m]`)
- Kip: **salt-okunur.** Repoya tek bayt yazılmadı. Test/build/tsc/vitest/export/image
  çalıştırılmadı. Kanıt 4 paralel salt-okunur ajanla toplandı.
- Mami verdict: **KABUL** (2026-07-14).

## Puanlar

| Alan | Ağırlık | V2026 | Surgical Handoff | Decision Pipeline |
|---|---:|---:|---:|---:|
| Source ve Mami kararlarının korunması | 15 | 7 | 10 | 14 |
| Site/ajan görev ayrımı | 15 | 4 | 12 | 14 |
| Image prompt ve gerçek frame kalitesi | 20 | 6 | 12 | 16 |
| Motion frame gate | 10 | 6 | 6 | 9 |
| Claude/Codex eşitliği | 10 | 5 | 8 | 9 |
| Windows/macOS taşınabilirliği | 10 | 6 | 6 | 9 |
| FACT REQUIRED ve güvenlik | 10 | 5 | 5 | 9 |
| Closeout ve gerçek öğrenme | 10 | 3 | 7 | 9 |
| **Toplam** | **100** | **42** | **66** | **89** |

## Kanıt — dosya:satır

**Site/ajan ayrımı çatallı.** `brain.ts:1935-2158` `buildImagePrompt` 18 bantlı ~10.000
karakterlik final-benzeri string üretiyor. Ajan görev metni **motor stringinin içinde**:
`brain.ts:1977-1978` → `Scene brief (Claude yazar): … [DIRECTOR TASK — authored by Claude…]`.
Bu testle **kilitli**: `commandExport.test.ts:347`. Aynı export ajana "*prompts.image bir
BRIEF'tir, bitmiş prompt DEĞİL*" diyor (`commandExport.ts:277`), Recipe ekranı "*Site prompt
üretmez*" yazıyor (`RecipeStep.tsx:153`). Motion'da çözülmüş (`motion: null` + `motionDraft`),
image'da çözülmemiş.

**Otorite bir liste sabiti, çözücü değil.** `brain.ts:2288` tanım; tek kullanımı
`brain.ts:2407` — `buildAgentBrief` markdown metnine basılıyor. Gerçek çatışma çözümü
ad-hoc ikili kapılarda (`brain.ts:288-302`, `616-634`, `1898-1918`, `2056-2059`) ve
**kaybeden directive sessizce eziliyor** — tek makbuz ref susturmada (`pure.ts:1020, 1117`).

**Determinizm kırık.** `commandExport.ts:164` `new Date().toISOString()` →
`:173` `commandId: mamilas-${sourceHash(topic|generatedAt)}` — **içerik hash'i değil,
timestamp türevi**. Rastgelelik yok (`Math.random`/`uuid` sıfır eşleşme), gövde deterministik.
Karar setini hash'leyen fonksiyon **yok**.

**FACT REQUIRED typed değil.** TypeScript'te **sıfır** uygulama noktası; yalnız `kick/*.md`
nesrinde. Testler sadece "string dosyada var mı" bakıyor (`docsContract.test.ts:431`).
`PERIOD REQUIRED` bir kapı değil — prompt'un **içine yazılan cümle** (`brain.ts:2045-2047`),
`buildImagePrompt` string'i yine de return ediyor (`:2158`).
**Gerçek çalışan typed kapı VAR:** `validateBriefCompatibility` → `BLOCKED` → `generateBatch`
sıfır sahne (`pure.ts:1188`). Kodlar: `CAST_IP_LEAK`, `RECIPE_IP_LEAK`, `RECIPE_RAW_HEX`,
`MATERIAL_WORLD_MISMATCH`.

**Motion gate hash'siz.** `buildMotionPrompt` (`brain.ts:2733`) kare/hash almıyor;
`pure.ts:1326` körlemesine çağırıyor. `runner.mjs` içinde `frame_checks`/`FRAME_PASS` →
**sıfır eşleşme**. Kapı veri-şekli kapısı (`motion: null`), hash kapısı değil.

**Tek canonical readiness yok.** 8+ rakip hesap. `qaScore` (`proof.ts:202`) yalnız
imagePrompt'a bakıyor, motionPrompt'a **hiç bakmıyor** → hex sızıntısı olan prompt
`qaScore 100` alırken PROMPT SURGEON `FIX (blocking)` veriyor.

**Gate fiilen tavsiye.** Sidebar `setCurrentStep`'i çağırıp `advance()`'ın tüm kapılarını
atlıyor (`AppLayout.tsx:122`). Kaynak boşken kapı **açık** (`useStudioStore.ts:126`).
Timeline'daki "Üretim Paketi" düğmesi QA'nınkiyle **aynı dosyayı** QA kapısı olmadan üretiyor.

**Preview sahte.** 46 dünya → 4 statik archetype görseli (`worldPlates.ts:6-15`).

**Gerçek kare kanıtı — REPODA YOK.** 11 PNG = arayüz ekran görüntüsü. KARE-BULGULARI'nın
9 karesi Mac masaüstünde. Sistemin kendi yasası (`production.frameGate.law`):
*"A frame that exists is not a frame that passed… A prompt that passed QA proves nothing
about the frame: QA read a string, the engine drew a picture."* — buna rağmen aynı export'ta
3 sahnenin de `qa.imageScore: 100`.

## Beş en tehlikeli uygulama riski

1. **TASK 11'in A/B'siz geçişi.** Tek gerçek kare kanıtı (4 geçen kare) mevcut prompt
   şeklinden geldi. `render_law` sökmek zaten denendi: **A2 → "stok fotoğrafa kayıyor"**.
2. **46 dünyanın fizik tiplemesi, kare bütçesi olmadan.** KARE-BULGULARI'nın kendi yasağı:
   *"KÜTÜPHANEYİ BUNDAN ÖNCE GENİŞLETME."* `plastik`'in kök nedeni hâlâ bilinmiyor.
3. **Typed FACT REQUIRED üretimi kilitleyebilir.** Dokuma paketi 3 kelime bekliyor;
   `brand_refs/` boş. Mami-only kaçış yolu (`approved_fallback`) şart.
4. **Local Node bridge = altıncı drift yeri.** Repo drift'in gerçekliğini zaten kanıtlıyor.
5. **Yazan da Claude, kanıtı üreten de Claude.** Belgelenmiş vaka: *"ajan bu turda üç kez
   kendi ölçü aletinin körlüğünü gerçek kusur sanmış."*

## KEEP / CHANGE / REJECT

**KEEP:** `source.ts` kayıpsız ingest + `rawHash`/`reconHash` · `hexToLightWords` /
`paletteLightPrompt` (gerçek export'ta ham hex yok) · `validateBriefCompatibility` → BLOCKED
(tek çalışan typed kapı) · veri kapısındaki IP firewall (`pure.ts:241-256`) · `runner.mjs`
alan-bazlı production kapısı + byte-identical Win/Mac runner · `motion: null`/`motionDraft`
ayrımı · **`docsContract.test.ts`** (yeni her yasa buraya bağlanmalı).

**CHANGE:** `[DIRECTOR TASK]`/"Claude yazar" motor stringinden çıkar — ama `render_law`
toptan silme, **fizik/prop** olarak ayır, fizik verbatim kalsın (A2 kanıtı) ·
`AUTHORITY_HIERARCHY` → alan-bazlı otorite + **her ezilen directive makbuz bıraksın** ·
`commandId` → content hash, timestamp ayrı audit manifestine · 8+ readiness → tek canonical ·
kaynağın istediği baked-text **kilide** dönsün, negasyona değil · sidebar bypass ve
"kaynak boşsa kapı açık" varsayılanı kapansın.

**REJECT:** TASK 11'in A/B'siz geçişi · TASK 8'in "46 dünyayı şimdi tiple" genişliği ·
Magnific zorunluluğunun mevcut çelişkili hâliyle taşınması. Disco QA'nın *kişilikleri*
gitsin ama `PROMPT SURGEON`'ın hex/triad/motion-klon denetimleri **nötr validator** olarak kalsın.

## Neden 100 verilemez

Sistemin kendi `frameGate.law`'ı prompt QA'sının kare hakkında hiçbir şey kanıtlamadığını
söylüyor. Deneysel kanıt: prompt'a birebir `Official One Piece TV anime production still,
Toei Animation` yazıldı, kare One Piece **olmadı**. Prompt kalitesi piksel sonucunu tahmin
etmiyor. Repoda üretilmiş kare yok → 20 puanlık image/frame satırı ve 3 pilot **doğrulanamaz**.
89 üstü her puan öz-sertifikasyon olurdu; handoff bunu yasaklıyor.

## Sonuç

Uygulama **önerilir** — üç değişiklikle (kare öne çekilir · 46 yerine 3 dünya fizik pilotu ·
typed FACT REQUIRED Mami-only kaçış yoluyla gönderilir). Mami üçünü de onayladı.
