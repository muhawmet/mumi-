# RECEIPT — TASK 2: Canonical veri sözleşmesi

- Tarih: 2026-07-15
- Model: Claude Opus 4.8 (`claude-opus-4-8[1m]`)
- Kanonik plan: handoff §5 — hash doğrulandı (`2d572148…9851`)
- Kip: **TDD** boyunca. Her kusur ve her Codex bulgusu önce KIRMIZI teste çevrildi.
- Codex 5.6 Sol: **altı denetim turu** (`019f6293 · 019f62af · 019f62e7 · 019f6309 · 019f6322 ·
  019f63…`). Her tur gerçek çıktıyla kusur üretti; kod-kusurlarının hepsi kapatıldı ya da
  Mami-kararı olarak belgelendi. İkinci turun açığa çıkardığı **mimari sorun Mami'ye taşındı**
  ("Şüphede SOR ve DUR"); sonraki turlar dedektörün geri-çağırım/isabet dengesini deldi ve
  dedektör **A/B/C mod modeline** oturtuldu.
- **Mami kararı (2026-07-15): "Şüphede SOR ve DUR."** Söz artık düzyazıdan TÜRETİLMEZ.
- Mami verdict: **BEKLİYOR** — `FINISHED` yalnız Mami kabul edince yazılır.

## Mami'nin mimari kararı — neden pivot ettik

Codex iki turda dedektörü **iki yönde birden** deldi (9 boşluk): `yazsın`→`yazılsın`→`basılı`→
`ibaresi`… Türkçe morfolojisi sınırsız; regex sözlüğünü büyütmek üçüncü turda da delinirdi.
Kök neden yama değil, **mimariydi**: düzyazıdan söz çıkarmak tanımı gereği tahmindir, ve bir
kararın kaderi tahmine bağlanamaz.

Mami'ye üç seçenek sunuldu; **"Şüphede SOR ve DUR"** seçildi:

> Kaynak metin talebine BENZEYEN bir şey taşıyorsa ve Mami açık beyan vermediyse sistem **karar
> vermez** — durur ve sorar (`ON_SCREEN_TEXT_INTENT`). Söz yalnız Mami'nin **beyanından** ya da
> **kilidinden** doğar ve çıktıya karşı **ölçülür**.

Sonuç: dedektörün isabeti artık **doğruluğu belirlemez**, yalnız kaç kez sorulacağını. Yanlış
pozitif bir soruya iner (kabul edilir bedel); yanlış negatif geniş **kök-eşleme + aday-metin**
kuralıyla kapanır.

## Ne değişti (dosya grupları)

**Yeni:**
- `src/core/contract.ts` — `DeliveryDeclaration` (söz kaynağı) · `DeliveryPromise`
  (clean_plate · pedagogy_auto · **intent_pending** · baked_text) · `detectOnScreenTextIntent`
  (yüksek geri-çağırım niyet sinyali) · `deriveDeliveryPromise` (beyandan) · `lockDeliveryPromise`
  (çelişki + DUR-SOR) · `validateDeliveryPromise` (ölçüm) · senkron SHA-256 · `canonicalize`/`canonicalHash`
- `deliveryPromise.test.ts` (9) · `canonicalDecision.test.ts` (13) · `deliveryPromiseDefects.test.ts` (36)
- `contract.ts` şemaları: altı kanonik şema (`SCHEMA_IDS` + tipler + `isSchema`) — handoff §5
- **Codex 4. tur (`019f6309…`) REJECT'i kapatıldı:** `"...yazısı olsun"` metin talebi artık
  yakalanıyor (TEXT_NOUN kök-eşleme + `olsun/bulunsun` yolu); boş baked beyan artık
  `baked_text[]` İHRAÇ ETMİYOR (`intent_pending`). Kanıt dosyası iddiaları birebir taşıyor.

**Değişti:**
- `src/core/pure.ts` — `BriefInput.deliveryDeclaration` + `generateBatch` içinde söz kapısı
  (beyan/niyet/ölçüm; ihlalde **sıfır sahne**, `validateBriefCompatibility` deseni)
- `src/core/commandExport.ts` — `baseDecision` (`mamilas.base-decision.v1`) · `commandId` içerik
  hash'i · kimliğe giren tüm kararlar

**Dokunulmadı:** `brain.ts` prompt üretimi (TASK 4) · 46 dünya (TASK 7) · `render_law` fiziği ·
`deriveOnScreenText` (Mami'nin kilidi) · kirli worktree'deki ilgisiz kullanıcı değişiklikleri.

## Codex REJECT'lerinde kapatılan kusurlar (hepsi gerçek çıktıyla doğrulandı)

| Kusur | Durum |
|---|---|
| **Yanlış negatif** (küçük harf/sıradan fiil/`var`/`dursun`/`göster`/`ad`/`fiyat`/`numara`) | **A/B/C mod modeli** — Codex'in 6 turda ölçtüğü TÜM kaçırmalar kapandı (gerçek probe'da 19/19 wanted BLOCKED). **Dürüst uyarı:** dedektör bir düzyazı sınıflandırıcısıdır; artık-kalıntı her zaman mümkündür. Mami "Şüphede SOR ve DUR" seçti → geri-çağırıma yaslanılır, kaçan bir vaka silent clean plate'e döner (bilinen sınır). |
| **Yanlış pozitif** (`-siz`/`yok`/`görünmeden`/`yazlık`/`yazar`/`yazıcı`/`isimlendirme`/diyalog/anlatı) | Codex'in ölçtüğü tüm yanlış-pozitifler kapandı (gerçek probe'da anlatı+diyalog+exclusion güvenli). Ask-and-stop altında yanlış-pozitif bir SORUYA iner — kabul edilir bedel. |
| **Boş/kör baked beyan** ölçüm atlıyordu (`{items:[]}`) | Kapandı — boş liste / boş metin / yüzeysiz beyan → **BROKEN** |
| **Authoritative storyboard** (çift yönlü) | Kapandı — talep beat'te→BLOCKED, beat'ten silinmiş→GENERATED |
| **Söz ölçülmüyordu** ("iptal yok" ≠ "tutuldu") | Kapandı — beyan verilince prompt metni taşımıyorsa **BROKEN** |
| **NFC anahtar hatası** (sırala-sonra-normalize) | Kapandı — normalize-sonra-sırala + çakışmada hata; scene-note anahtarları da sanitize edildi |
| **Kimlik çakışmaları** (voSyncMode, ref sırası, ham kaynak, topic, userImagePrompt, projectId, musicId, mood/pov/beyan) | Kapandı — her biri FARKLI `commandId` |
| **`commandId` SHA-256'yı 16 hex'e kesiyordu** | Kapandı — **tam 64 hex SHA-256** |
| **Kimlik yüzeyi tam mı?** (kendi denetimim) | **26 `BriefInput` alanının 26'sı kimliğe giriyor.** İki alan bilerek "aynı": `videoModel kling_2_1` legacy-normalize ile `kling_3`'e iyileşiyor (aynı prodüksiyon); kaynak-bağlı `sceneCount` gerçek `scenes.length`'ten gelir. Gerçekten farklı model (`veo_3`) kimliği DEĞİŞTİRİYOR. |
| **6 şemadan 5'i yoktu** (handoff §5) | Kapandı — altı şema (`SCHEMA_IDS` + tipler + `isSchema`) `contract.ts`'te kuruldu |

### Dedektör mimarisi — emir kipi + metin hedefi (3. turun cevabı)

Sinyal artık **iki şeyi birden** ister: bir **metin hedefi** (tırnaklı literal · BÜYÜK HARF token ·
metin-ismi) VE bir **render emri** (Türkçe emir kipi `görünsün/basılsın/yazsın/yer alsın`, ya da
`basılı/yazılı` sıfatı, ya da `print/emboss`). Bu, ANLATIYI (aorist/geçmiş: `durur`, `görünür`,
`oldu`) talepten (emir kipi) ayırır. Olumsuzlama `-me-/-ma-` infix'i ve `-siz/-suz`, `yok`,
`görünmeden` ile genişletildi. Cümlecik ayırıcı `ve/ama/fakat/ancak`'ı da böler (tırnak içi hariç).

## Hangi gerçek çıktı okundu (fixture değil)

`TASK-02-REAL-OUTPUT.txt` — gerçek `generateBatch` + `detectOnScreenTextIntent` + SHA-256, her vaka listeli.

- **19/19 wanted → signal=true (BLOCKED)** (round-6 doğrudan vakalar `Şirket adı görünsün` /
  `Logo göster` / `Fiyat görünsün` / `Show the logo` dâhil) · **15/15 legit/anlatı/diyalog →
  signal=false (GENERATED).**
- **Boş beyan:** boş liste / boş metin / yüzeysiz → **BROKEN** (üretim atlatılamaz).
- **Mami kilidi (Su Döngüsü):** `["Su buharlaşır", null, "Yağmur yağar"]` — **değişmedi**.
- **P0 (termos + baked beyan):** bugünkü prompt sözü iptal ediyor → `DELIVERY_PROMISE_BROKEN`,
  0 sahne. Beyansız termos → `ON_SCREEN_TEXT_INTENT` (DUR ve SOR).
- **SHA-256:** kendi senkron uygulamam `node:crypto` ile **9/9 vektörde birebir** (Codex bağımsız
  bir turda 535/535, bir turda 519/519 ölçtü). `commandId` tam 64 hex.

## Çalıştırılan testler ve GERÇEK sonuçları

**Doğru okuma için `rtk proxy npx vitest run` (filtresiz) kullanıldı** — bkz. aşağıdaki hata.

| Komut | GERÇEK sonuç (`rtk proxy`, filtresiz) |
|---|---|
| `npx tsc --noEmit` | **0 hata** |
| `rtk proxy npx vitest run` | **1920 geçti · 0 KALDI** (59 dosya, hepsi geçti — TASK 2+3 birlikte) |
| `npm run build` | **OK** |

### docsContract kırığı — Mami'nin sildiği dosya, temizlendi

Codex `docsContract.test.ts`'in `fable5_orchestrator_pack/SITE_BRAIN_CAPSULE.md`'yi okuyup
`ENOENT` verdiğini yakaladı. Ben "TASK 2 öncesi kırıktı" demiştim — **bunu kanıtlayamazdım**
(dosya untracked'ti, git kronoloji veremiyor); Codex haklı olarak itiraz etti. **Gerçek: Mami
klasörü kendisi silmiş** ("ben sildim, çöpleri temizle" — 2026-07-15). `AUTHORITY_ALLOWLIST`'teki
**ölü referans satırı** Mami'nin açık isteğiyle kaldırıldı (test silinmedi, var olmayan dosyaya
işaret eden tek satır çıkarıldı). Suite artık tam yeşil.

### ⚠️ Kendi ölçüm hatam (Codex yakaladı, düzelttim)

İlk receipt `1861/0` yazmıştı. `rtk`'nın filtrelenmiş özetine (`PASS (N) FAIL (0)`) güvenmiştim;
`vitest`'in kendi çıktısını okumadım — bu yüzden gerçek `1 KALDI` durumu gizlenmişti. Artık her
ölçüm **`rtk proxy npx vitest run`** ile filtresiz yapılıyor. Projenin yasası buydu:
*"gerçek çıktıyı okumadan hüküm verme."*

## Kabul şartları (tasarım §5)

| # | Şart | Durum |
|---|---|---|
| 1 | Determinizm: aynı karar → aynı byte + hash | ✅ gerçek çıktı |
| 2 | Timestamp exclusion | ✅ gerçek çıktı |
| 3 | Yetki sınırları (karar prompt/timestamp/ajan görevi taşımaz) | ✅ test |
| 4 | Exact text korunumu (scrub yok) | ✅ test |
| 5 | **P0: metin niyeti sessizce düşemez** | ✅ gerçek çıktı (beyansız→SOR, beyanlı+iptal→BROKEN) |

## Applied locks · suppressed conflicts · unresolved risks

- **Lock:** söz yalnız Mami'nin **beyanından** ya da **kilidinden** doğar. Düzyazı yalnız
  **niyet sinyali** üretir; sinyal + beyan-yok → **DUR ve SOR**.
- **Lock:** sinyal iki şeyi birden ister — **aday metin** (tırnaklı ya da BÜYÜK HARF) + metin
  kökü/ismi. Böylece düzyazıda geçen "logo"/"yazan" (anlatı) durmaz.
- **Lock:** `clean_plate` ile metin niyeti aynı sahnede yaşayamaz → `DELIVERY_PROMISE_CONFLICT`.
- **Lock:** kimliğe giren şey = prompt'u değiştiren her karar.
- **⚠️ CANLI DAVRANIŞ DEĞİŞİKLİĞİ:** kaynağı ekran-metni niyeti taşıyan projeler artık **beyan
  verilene kadar üretim yapmıyor** (`ON_SCREEN_TEXT_INTENT`). Önce sessizce yanlış üretiyordu.
- **Risk (dürüstçe, açık):** dedektör düzyazı okuyor — hiçbir düzyazı dedektörü tam değildir.
  A/B/C mod modeli Codex'in 6 turda ölçtüğü tüm vakalarda doğru davranıyor (kanıt dosyasında 19 wanted + 15 legit),
  ama Türkçe morfolojisi sonsuz — **her tur yeni bir kalıntı çıktı, çıkmaya da devam edebilir**
  (ilk sürümlerde "çok dolaylı" dediğim `Şirket adı görünsün` aslında DOĞRUDANDI; Codex haklıydı,
  şimdi yakalanıyor). Tercih **bilinçli ve Mami onaylı**: yanlış pozitif bir SORUYA iner
  (kabul edilir), yanlış negatif silent clean plate'e döner (P0 sınıfı — gerçek risk). Bu yüzden
  model **geri-çağırıma** yaslanır ve Mami her zaman **açık beyan** verebilir (`deliveryDeclaration`) —
  beyan verildiğinde dedektör devre dışıdır ve bu kesin yoldur.
- **Risk (kapsam dışı):** etkileşimli beyan cevap kanalı ve `approved_fallback` **TASK 3**'ün işi.
  Bugün beyan yapısal giriş olarak var (`deliveryDeclaration`); UI TASK 3/9.
- **Risk (taşındı):** `deriveOnScreenText` hâlâ pedagoji sezgisiyle çalışıyor — sözle çelişmiyor
  (kapı üstte), TASK 4'te sözün altına alınacak.

## Hangi karar hâlâ Mami'ye ait

1. **TASK 2 kabulü** (pivot dâhil).
2. **Canlı davranış:** metin niyeti taşıyan kaynaklar beyan gelene kadar duracak — kabul mü?
3. Magnific/upscale tek yasası (TASK 6) — açık.
4. TASK 4 çatalı (prompt'u site mi yazsın, ajan mı) — TASK 4'te.
5. 3 PNG'nin diske bırakılması — A/B referans ayağı hâlâ hash'siz.
