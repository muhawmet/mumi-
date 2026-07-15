FINISHED — TASK 01B — 2026-07-15 — Claude Opus 4.8 — receipt: receipts/TASK-01B.md

# RECEIPT — TASK 1B: Baseline kanıtı (kare + prompt)

- Tarih: 2026-07-14/15
- Model: Claude Opus 4.8 (`claude-opus-4-8[1m]`)
- Mami verdict: **KABUL** (2026-07-15, *"her şeye kabulüm var devam et"*).
- Codex 5.6 Sol denetimi: **REJECT** (session `019f6271-9637-7651-9347-f13f8ce4d478`) →
  **düzeltmeler bu receipt'e işlendi**, aşağıdaki "Codex denetimi" başlığına bak.
- **Kapsam değişikliği (açık):** piksel kapısı **ertelendi.** Kareler sohbete geldi, diske düşmedi.
  Prompt+piksel manifesti **TASK 5 öncesi** çıkarılacak. TASK 1B'nin `FINISHED`'i **ölçüm** işi
  içindir; **A/B'nin referans ayağı henüz hash'le kilitli DEĞİL** ve bu bilerek böyle bırakıldı.
- Kip: `src/` dosyalarına **dokunulmadı**. Yalnız `artifacts/` altına yazıldı ve gerçek
  `generateBatch` **okundu** (fixture değil).

## Planın revize edilmesi — kaynak değişti

Skill'in TASK 1B'si "Mac'teki 9 kareyi kurtar" diyordu. **Mami başka bir yol seçti (2026-07-14):**
kendi çalışan üretiminden **prompt + kare çiftleri** verdi ve *"istediğim kadar üretebilirim"* dedi.
Bu, Mac'ten taşımaktan **daha güçlü** bir baseline: kareler bu repodaki dünya DNA'sıyla,
bilinen prompt'larla ve tutan bir kimlik kilidiyle üretilmiş.

## Ne değişti (dosya grupları)

Yeni — hepsi `artifacts/` altında, `src/` **dokunulmadı**:

- `artifacts/baseline-frames/prompts/GOLDEN-01-pixar_3d_edu-mira-mutfak.txt`
- `artifacts/baseline-frames/prompts/GOLDEN-02-pixar_3d_edu-efe-hilal.txt`
- `artifacts/baseline-frames/prompts/GOLDEN-03-pixar_3d_edu-efe-kask.txt`
- `artifacts/baseline-frames/site-output/SITE-01-pixar_3d_edu.image-prompt.txt` + `.scene1.json`
- `artifacts/baseline-frames/site-output/SITE-02-product_brand_real-REAL-SOURCE.image-prompt.txt` + `.scene1.json`
- `artifacts/baseline-frames/GOLDEN-vs-SITE.md` — bant-bant fark
- `artifacts/baseline-frames/FRAME-VERDICTS.md` — söz vs piksel
- `artifacts/baseline-frames/README.md`

## Hangi gerçek çıktı okundu (fixture değil)

**1. Gerçek `generateBatch`** — dokunulmamış worktree'den, `npx tsx` ile doğrudan `src/core/pure.ts`:

| Koşu | Dünya | Source | Sonuç |
|---|---|---|---|
| SITE-01 | `pixar_3d_edu` | placeholder (yapısal prob — **Mami metni değil**, öyle etiketlendi) | `status=GENERATED` · `contractGate=PASS` · 7635 karakter |
| SITE-02 | `product_brand_real` | **Mami'nin gerçek termos source'u** (buyer audit, `rawHash ba24888a`) | `status=GENERATED` · `contractGate=PASS` · 10034 karakter |

**2. Üç gerçek kare** — Mami'nin verdiği, ajan hattından üretilmiş, gözle incelendi.

## ⚡ P0 — GERÇEK ÇIKTIYLA KANITLANDI (mekanizma Codex denetiminde düzeltildi)

Mami'nin source'u: *"ürün üzerindeki **'MAMILAS THERMO'** yazısı **baked-in** görünsün"*

**Gerçek zincir (kodla izlendi, ilk sürümdeki "üç iptal" listesi YANLIŞTI):**

1. **Kök neden — istek hiç ISTEK olarak doğmuyor.** `deriveOnScreenText()` (`pure.ts:628-645`)
   ekran metnini kaynağın **isteğinden** değil **pedagoji sezgisinden** türetiyor:
   AUTO modda beat 3 kelimeden uzunsa `null`. Termos beat'i 9 kelime → **`onScreenText = null`**.
   *(Doğrulandı: gerçek export `onScreenText: null`.)*
2. `null` olduğu için prompt'a şu basılıyor:
   `Text/logo: **clean plate — this scene carries no on-screen text.**`
3. Kaynak cümlesi prompt'a girerken de damgalanıyor:
   `[SOURCE — **do not render as on-screen text**; narration only]`
4. **Negatif marka adını yasaklıyor** — ve `MAMILAS THERMO` bir **marka adı**:
   `NO real product-brand logo or identifiable branded design` ·
   `NO real product-brand logo or identity` · `no … logos, **brand names**`

`contractGate = PASS`, `qaScore = 100`. `qaScore` (`proof.ts:202`) **kaynak–çıktı tutarlılığını
hiç ölçmüyor.** Hiçbir kod bu ihlali görmüyor.

> **DÜZELTME (Codex):** `NO floating UI or overlay text` **iptal edici değildir** — prompt hemen
> ardından *"any text is real printed diegetic matter"* diyor. Onu "üçüncü iptal" saymak **hataydı**.
> Gerçek iptal edenler: (1) `onScreenText=null` heuristiği, (2) `clean plate` satırı,
> (3) `[SOURCE — do not render…]` damgası, (4) **marka-adı negatifleri**.

**Kare gözlemi (repo kanıtı DEĞİL — piksel diske düşmedi):** GOLDEN-01'de ahşap etiketlerde
**ÇOCUK / KARDEŞ** okunuyor, Ç/Ş glifleri doğru. Ajan hattının `== ON-SCREEN TEXT ==` bandı
metni **kilit** olarak veriyor. **Bu bir gözlemdir; hash'lenmiş repo kanıtı değildir** (Codex şartı).

→ `DeliveryPromise` **icat edilmiyor** — çalışan hatta zaten var. Ama **yalın iki mod yetmez**
(Codex): çoklu exact-string/surface · source span+hash · Unicode/glyph kilidi · client-brand
yetkisi · `bake` ↔ `clean_plate` karşılıklı dışlama kapısı. **`AUTO` heuristiği promise'i SEÇMEZ.**

## ⚡ İKİNCİ BULGU — NEGATİF GARANTİ DEĞİLDİR

GOLDEN-03 (kask) karesinde, prompt **iki ayrı bantta** *"no agency insignia / NOT a real-agency suit"*
ve *"real spacecraft/agency logos"* yasağı taşırken, motor sağ omuza **bayrak yaması** bastı
(ABD bayrağına benziyor). **Prompt kusursuz, kusur pikselde.** Prompt QA bu kareye 100 verirdi.

**Sonuçları:**
1. **Frame gate KOD olmalı** (TASK 6). Bugün `runner.mjs`'de `FRAME_PASS` → sıfır eşleşme.
2. **IP firewall prompt'a bakarak yetmiyor** — veri kapısı (`pure.ts:241-256`) sağlam ama motorun
   kareye koyduğu ajans amblemini hiçbir şey görmüyor. Kare müşteri reklamına gidiyor → **export riski**.
3. Yasak **ölçülmeli**, sadece yazılmamalı.

## Bant-bant fark (altın hat vs site)

**Sitede VAR:** `RENDER LOCK` (fizik metni · **verbatim DEĞİL** — bkz. düzeltme) · `CAMERA` ·
`PALETTE AS LIGHT` (ham hex yok) · `REFERENCE DNA (subordinate)`.

> **DÜZELTME (Codex):** *"RENDER LOCK verbatim aynı"* iddiam **yanlıştı.**
> GOLDEN-01 render lock = **2958** karakter, SITE-01 = **2798**. Site 160 karakterlik
> *"Squash-stretch physics govern all character and prop motion…"* cümlesini **düşürüyor**.
> (Still-frame için zaman-temelli cümleyi elemek makul olabilir — ama "verbatim" denemez.)
> Ayrıca A2 render-lock A/B'si **n=1, farklı seed** (KARE-BULGULARI:34) — güçlü ama tek gözlem.

**Sitede YOK:**

| Bant | Sitedeki karşılığı |
|---|---|
| `== DOMINANT ELEMENT ==` | **Yok.** Yerine motora `Scene brief (Claude yazar)` + `[DIRECTOR TASK — authored by Claude…]` gidiyor → **ajan görevi motor stringinde**. |
| `== ON-SCREEN TEXT ==` | **Yok.** Sabit `clean plate` — kaynak ne isterse istesin. |
| `== LANGUAGE LOCK ==` | **Yok.** Yalnız negatifte `NO English signage`; Ç/Ş/ğ/ı glif garantisi yok. |
| `== SHOW DIRECTIVE ==` | **Yok.** |
| Kimlik `@`-handle (Magnific) | **Yok.** `@[` ve `Magnific` → sıfır eşleşme. Kimlik kilidinin gerçek taşıyıcısı bu. |
| Frame-specific negatif | **Yok.** Yalnız baseline negatif. |

Ayrıca biçim: altın prompt `== BAŞLIK ==` bantlı; sitenin çıktısı **sıfır bant başlıklı**,
7 600–10 000 karakterlik tek paragraf.

## ⚡ ÜÇÜNCÜ BULGU — A/B'nin TANIMI (Codex ile birlikte kilitlendi)

Handoff "eski hat = sitenin bugünkü çıktısı" varsayıyordu. Bu **yanlış**: sitenin `prompts.image`'ı
kendi export'unun deyimiyle *"BRIEF'tir, bitmiş/onaylı prompt DEĞİL"* (`commandExport.ts:277`).
Bilinen 9 kare **ajan-yazımı Pass A** prompt'larından çıktı (KARE-BULGULARI:4).

> **DÜZELTME (Codex):** *"`buildImagePrompt` hiç kare üretmedi"* dedim — bu **kanıtlanmamış evrensel
> bir iddia**. Doğrusu: **bilinen kareler** ajan hattından çıktı; sitenin brief'inin geçmişte hiç
> kullanılmadığı **ispatlanmadı**.

### A/B'nin KİLİTLİ tanımı

> **Aynı canonical decision** → **eski FINAL prompt + karesi** vs **yeni FINAL prompt + karesi.**
> **Ham site BRIEF'i ne referanstır ne adaydır.** "Final" = motora giden metin
> (bugün: ajanın yazdığı; yarın: hangi tasarım seçilirse onun ürettiği).

> **DÜZELTME (Codex):** *"Altın prompt ŞARTNAMEDİR"* fazla geniş. `SHOW DIRECTIVE` GOLDEN-02/03'te
> var, **GOLDEN-01'de yok** → evrensel zorunlu bant **değil**. Ayrıca canonical sözleşme
> **Magnific'e bağlanmamalı**: `@`-handle **başarılı bir taşıyıcı örneğidir**, kimlik-kilidi
> kavramının kendisi değil. Sözleşme "kimlik referansı" soyutlamasını tanımlar; Magnific onun
> bir uygulamasıdır.

**TASK 4'ün hedefi bu yüzden "site altın bantları basmalı" DEĞİL** — bkz. aşağıdaki **TASK 4 ÇATALI**.
Karar Mami'nindir.

## ⚡ DÖRDÜNCÜ BULGU — altın prompt'ları HİÇBİR KOD üretmiyor (2026-07-15, ölçüldü)

Mami: *"En iyi prompt diye atmadım — **sitenin son ürettiği** prompt'lardan bunlar."*
Bu, ölçümle çelişiyordu. Arandı:

| Bant | `C:\Mamilas` `src/` | `dist/` (derlenmiş site) | `C:\Mamilas-Sol-Lab` |
|---|---|---|---|
| `SHOW DIRECTIVE` | **0** | **0** | **0** |
| `LANGUAGE LOCK` | **0** | **0** | **0** |
| `CAST KİLİDİ` / `TÜRKÇE METİN KİLİDİ` | **0** | **0** | **0** |
| `fena fillah` | **0** | **0** | **0** |

**Bu bantları bu makinedeki hiçbir kod üretemiyor.** Prompt'ları **bir ajan yazmış.**

Belgesel doğrulama — KARE-BULGULARI'nın 4. satırı:
> *"Prompt'lar: `~/Desktop/MAMILAS-PROMPTLAR/` · **Ajan-yazımı (`.command` Pass A), site-taslağı değil.**"*

**Gerçek akış:** site → **brief** → **ajan** → bitmiş prompt → motor.
Sitenin kendi export'u da bunu söylüyor: *"prompts.image bir BRIEF'tir, bitmiş prompt DEĞİL"*
(`commandExport.ts:277`). Mami "site üretti" derken akışı kastediyor — metni yazan ajan.

**"En iyi değil, sıradan çıktı" olması baseline'ı GÜÇLENDİRİR:** bunlar seçilmiş şaheserler değil,
hattın normal kalitesi.

### ⚠️ TASK 4'TE ÇATAL — Mami kararı gerekecek

| Seçenek | Lehine | Aleyhine |
|---|---|---|
| **A — Site prompt'u kendi yazsın** (handoff'un istediği) | Deterministik · hash'lenebilir · kapılanabilir · `DeliveryPromise` ölçülebilir | Bugün çalışan ajan kalitesini kodda yeniden üretmek zorundayız |
| **B — Ajan yazmaya devam etsin** (bugünkü hâl) | **Çalışıyor** — kanıtı elimizdeki kareler | Her koşuda LLM'e bağlı · prompt ölçülemiyor · aynı karar aynı prompt'u vermiyor · gate yazılamıyor |

**TASK 2 her iki tasarımda da aynıdır** (canonical karar + `DeliveryPromise` ikisinde de gerekir),
bu yüzden çatal TASK 2'yi bloke etmez. **TASK 4'te sorulacak.**

## Codex 5.6 Sol denetimi — REJECT → düzeltmeler işlendi

Session `019f6271-9637-7651-9347-f13f8ce4d478`.

**Codex'in bağımsız doğruladıkları:** `generateBatch`'i kendi çalıştırdı (tsx yoktu, Vite TS
runtime'ıyla aynı `pure.ts:1151` modülünü koştu) → `status=GENERATED` · `contractGate=PASS` ·
3 sahne · 10 034 karakter · `qaScore=100` · **iki ardışık üretim byte-identical** ·
kaydedilen SITE-02 ile **exact match** (SHA-256 `34c7dc31…6bfd7`) · scene1 JSON deep-exact.
Bant grep'i: `DOMINANT ELEMENT`/`ON-SCREEN TEXT`/`LANGUAGE LOCK`/`SHOW DIRECTIVE`/`@[`/`Magnific`/
`Frame-specific` → hepsi **0**. `commandExport.ts:277` ve `brain.ts:1977` doğrulandı.
KARE-BULGULARI:4 → ajan-yazımı Pass A doğrulandı.

**Düzelttiği hatalarım:**

| Codex bulgusu | Durum |
|---|---|
| "Üç kez iptal ediyor" listesi yanlış — `NO floating UI` diegetik metni iptal etmez; asıl iptal edenler **marka-adı negatifleri** | **DÜZELTİLDİ** (P0 bölümü yeniden yazıldı) |
| "RENDER LOCK verbatim aynı" yanlış — site squash-stretch cümlesini düşürüyor (2958 → 2798) | **DÜZELTİLDİ** |
| "`buildImagePrompt` hiç kare üretmedi" — kanıtlanmamış evrensel iddia | **DÜZELTİLDİ** |
| "Altın prompt şartnamedir" fazla geniş — `SHOW DIRECTIVE` GOLDEN-01'de yok; sözleşme Magnific'e bağlanmamalı | **DÜZELTİLDİ** |
| Receipt/state **kendi kendisiyle çelişiyor** (satır 1 `FINISHED`, satır 7 "verdict BEKLİYOR"; state'te bayat "IN PROGRESS / tek PNG" bölümü; README "rapor yok" diyor) | **DÜZELTİLDİ** — Mami kabulü işlendi, piksel kapısı **açık kapsam değişikliği** olarak yazıldı, bayat bölümler temizlendi |
| Piksel kanıtı repoda yok → Ç/Ş teslimi ve omuz yaması **denetlenebilir kanıt değil** | **KABUL EDİLDİ** — gözlem olarak etiketlendi; manifest **TASK 5 öncesi** çıkarılacak |
| A/B tanımı: aynı canonical decision → eski **FINAL** vs yeni **FINAL**; ham BRIEF ne referans ne aday | **KİLİTLENDİ** |
| `DeliveryPromise` yalın iki mod **yetersiz** | **TASARIM GÜNCELLENDİ** (`TASK-02-DESIGN.md`) |

## Çalıştırılan testler

Yok. TASK 1B ölçüm task'ıdır; tsc/vitest/build çalıştırılmadı. (Gerçek ölçüm TASK 12A.)
**Gerçek `generateBatch` çalıştırıldı** — bu bir test değil, kanıttır.
Codex bağımsız koştu ve **byte-identical** sonuç aldı → `generateBatch` gövdesi **deterministik**.
(Determinizmi kıran yer `commandExport.ts:164`'teki timestamp — TASK 2'nin işi.)

## Applied locks · suppressed conflicts · unresolved risks

- **Lock:** `render_law` fiziği **verbatim korunacak** (A2 kanıtı + site zaten doğru taşıyor).
- **Lock:** `DeliveryPromise` iki modlu: `bake(exact, surface)` | `clean_plate`.
- **Suppressed conflict:** yok.
- **Risk (açık):** Piksel dosyaları **henüz diskte değil** — kareler sohbete yapıştırıldı.
  Claude sohbetteki görseli diske yazamaz. Manifest çıkarılamadı.
- **Risk (açık):** Motor, açık yasağa rağmen ajans amblemi basıyor (GOLDEN-03). Export riski.

## Hangi karar hâlâ Mami'ye ait

1. **TASK 1 ve TASK 1B kabulü** — `FINISHED` ancak Mami "kabul" derse yazılır.
2. **Üç PNG'yi diske bırakmak** — `artifacts/baseline-frames/frames/` altına.
   Bunlar olmadan manifest yok, A/B'nin referans ayağı hash'le kilitlenemez.
3. **Yedeğin ikinci kopyası** — yedek ve repo aynı `C:` diskinde (Codex şartı).
4. **Magnific/upscale tek yasası** (TASK 6) — artık ölçülmüş bir boşluk: kimlik `@`-handle ile
   taşınıyor, site bunu hiç bilmiyor. Yine de **tek yasanın ne olacağı Mami'nin kararı.**
5. **GOLDEN-03'teki bayrak yaması** — Mami'nin verdict'i: bu kare geçti mi, kaldı mı?
   Claude gözlem verdi, **hüküm vermedi**.
