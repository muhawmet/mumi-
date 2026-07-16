# BRAIN-M2 — render_law prop/fizik ayrımı (KUSUR-C)

**Tarih:** 2026-07-16 · **Uygulayıcı:** Claude Opus 4.8 (1M) · **Denetçi:** Codex `gpt-5.6-sol` high
**Plan:** `docs/superpowers/plans/2026-07-16-mamilas-brain-layer.md` Task M2
**Spec:** `docs/superpowers/specs/2026-07-16-mamilas-brain-layer-design.md` §1 KUSUR-C

## Ne yapıldı

- `src/core/pure.ts`: `splitRenderLawPhysics(law)` — render_law cümlelere bölünür; **envanter
  imzalı** cümleler (≥3 benzersiz somut nesne VE fizik-DAVRANIŞ kalıbı yok) `props`'a,
  kalan her şey `physics`'e. Kararsız cümle fizikte kalır (boşaltma riski > sızıntı riski —
  A2 pilotu toptan silmeyi denedi, kare stok fotoğrafa kaydı).
- `toWorldPacket`: `renderPhysics` = fizik cümleleri (orijinal sıra, cümle-verbatim) +
  line_grammar; envanter cümleleri `vocabularyExamples`'a EKLENİR (mevcut example_injection
  korunur). `legacyRenderLaw` birebir (trim'li) korunur. render_law boşsa eski fallback zinciri.
- **Sol #1 fix (kritik, aynı task'ta kapatıldı):** `vocabularyExamples` gerçek image_author
  role context'ine hiç girmiyordu (görünmez kanal = dolaylı silme). `agentProtocol.ts`
  `buildImageAuthorContext` + `scripts/mamilas-command.mjs` `imageContext` world slice'ına
  alan eklendi; test kilitledi.
- Yeni test: `src/core/worldPacketPhysics.test.ts` (7 test — TDD, önce kırmızı görüldü).

## Ölçülen etki (gerçek veri, 46 dünya)

Yalnız **5/46** dünya değişti — hepsi gerçek nesne-envanteri cümlesi, hiçbirinde boşaltma yok:

| Dünya | Ayrılan | Kalan fizik |
|---|---|---|
| one_piece_toei | wanted-poster/pennant/caravel/figurehead cümlesi (219 kar.) | 1670 kar. |
| naruto_shinobi_world | village facades/bridges/seals envanteri (229 kar.) | 1309 kar. |
| bleach_soul_world | fortress-city üç-register envanteri (456 kar.) | 1031 kar. |
| cyberpunk_neon_noir | cable/CRT/vending envanteri (131 kar.) | 1505 kar. |
| claymation_aardman | miniature set envanteri (129 kar.) | 1198 kar. |

Kontrol kolu: `deakins_naturalist` (fizik-saf) **byte-değişmedi** — motivated-source cümlesi
window/desk/lamp saymasına rağmen fizik-davranış imzasıyla korundu.

## GERÇEK A/B (generateBatch değil — command lifecycle world slice'ı)

`M2-AB-image-author.md`: aynı source/sahne ("genç denizci güvertede, fırtına yaklaşır") →
iki gerçek `buildCommandJSON` (commandId `mamilas-40a9…` / `mamilas-87dd…`) → image_author
world slice → role kartıyla iki final prompt yazıldı. Prop-laden kolda prompt artık
wanted-poster/caravel taşımıyor (M2 öncesi renderPhysics bunu render-yasası konumunda
dayatıyordu); fizik açılışı tam. **Kare hükmü Mami'nin** — promptlar motora elle verilebilir.

Koşum aracı: Node 26 + resolver shim (`sync-hooks.mjs`, tsx kırık olduğu için) + scratchpad
`m2-ab.ts` / `m2-impact.ts`. Scratchpad kalıcı değildir; çıktılar bu receipt + A/B dosyasında.

## Sol denetimi — karşılıklar

1. **vocabularyExamples görünmez kanal (KRİTİK)** → ✅ kapatıldı (yukarıda), test kilitli.
2. **Naruto/Bleach mekân-KİMLİĞİ cümleleri vocab'a düşünce zayıflar mı** → ürün hükmü:
   cümleler artık ajan context'inde GÖRÜNÜR (fix #1) ama emir değil referans. Kimlik
   zayıflaması iddiası ancak KARE ile ölçülür → **AÇIK RİSK, Mami göz** (ledger'a).
   Synthwave "false-negative" iddiasına katılmadım: o cümleler nesnelerin ışık/silüet
   DAVRANIŞINI tarif ediyor ("backlit cutouts", "light OUTLINES form") — fizik, envanter değil;
   sızıntı ölçümü de yok. Spekülatif genişletme yapılmadı.
3. **environmentPhysics fallback** → mevcut 46 dünyada light_law hiç boş değil; davranış
   değişmedi. Sentetik boş-fizik vakası teorik — P2 ledger'a.
4. **legacyRenderLaw** → korunmuş (test + Sol doğruladı); "trim-normalize, byte değil" notu
   M2-öncesi davranıştır, değiştirilmedi.
5. **46-benzersizlik/uzunluk kilitleri liveness-only** → doğru; semantik kimlik kilidi M4/M6
   jüri red-line işi (plan zaten orada).

### P2 ledger (post'ta fix — Mami kuralı: "kritik değilse post'ta")

- Splitter cümle-join tek boşlukla — özgün whitespace byte düzeni korunmuyor (kozmetik).
- `\w*` morfolojik şişme olasılığı (wall/walls ayrı sayılabilir) — mevcut 46 veride yanlış
  tetikleme ölçülmedi.
- environmentPhysics sentetik boş-fizik vakasında eski law'ı fallback'ten geri sokabilir
  (46 gerçek dünyada erişilemez yol).
- Naruto/Bleach mekân-kimliği vs prop ayrımı: kare A/B'siyle Mami hükmü; gerekirse
  "environment-identity" üçüncü kanal M4'te düşünülür.

## Kapı (gerçek çıktı)

- `npx tsc --noEmit` → **0 hata**
- `rtk proxy npx vitest run` → **1908/1908 · 69 dosya** (M1: 1901/68 — sayı arttı, düşme yok)
- `npm run build` → **OK** (bilinen bundle-boyut uyarısı, kabul edilmiş debt)

## Dosyalar

- `src/core/pure.ts` — splitRenderLawPhysics + toWorldPacket ayrımı
- `src/core/agentProtocol.ts` — buildImageAuthorContext world.vocabularyExamples
- `scripts/mamilas-command.mjs` — imageContext world.vocabularyExamples
- `src/core/worldPacketPhysics.test.ts` — yeni (7 test)
- `artifacts/decision-pipeline-implementation/M2-AB-image-author.md` — gerçek A/B kanıtı
