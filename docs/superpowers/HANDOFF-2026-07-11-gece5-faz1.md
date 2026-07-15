# HANDOFF — 2026-07-11 (gece 5) · FAZ 1: reçete → final brief → command

**Durum:** HEAD `30a8481` · dal `feat/3d-diorama-shell` · **tek ağaç, worktree yok** · PUSH YOK
**Gate:** tsc 0 · **vitest 1635/1635** · build OK · zsh OK
**Tur başı:** 984 test → **1635**. Hiç test silinmedi.
**Veri:** 39 → **46 dünya** · 112 → **130 ref** · 25 → **32 proje** · 12 palet

---

## MAMİ'NİN EKSENİ (bu turun tamamı buna göre okunmalı)

> *"Çok basit şeyler istiyordum: deterministik kararlarla bir final brief çıksın, onu da Claude veya Codex çok iyi okuyup en iyi sahneyi kurup prompt yazsın. Twitter yapıyoruz sanki."*
> *"Site, command'daki beyne ne yapacağını söylemek olmuyor mu bu haliyle? Şu saçma regexler gibi."*
> *"Fabrika birincil."*
> *"Bundan sonra özgür falan değilsin — direkt direktif vermek gerekiyor."*

**Ve haklı çıktı, ölçüldü.**

---

## 1. AYNA ÖLÇÜMÜ — itiraz sayıyla doğrulandı

90 gerçek `generateBatch` senaryosu: `qa.ts`'in **13 check'inin 7'si AYNA.** Site'in kendi builder'ının yazdığı string'i, yine site'in regex'iyle tarıyorlar → yapısal olarak kırmızıya düşemezler. **CHECK 6/6b ÖLÜ KOD**: aradıkları `"Moving element:"` etiketi bugünkü `buildMotionPrompt`'ta hiç basılmıyor; `qa.test.ts` onları fixture'la yeşil tutuyor, `brain.test.ts` aynı anda TERSİNİ garanti ediyor.

**ÇIKAN KURAL:** *bir check ancak site'in KONTROL ETMEDİĞİ girdiye bakıyorsa KAPIDIR; kendi yazdığına bakıyorsa AYNADIR.*
Rapor: `docs/superpowers/QA-AYNA-OLCUM-2026-07-11.md`

## 2. ASIL YÖNTEM DEĞİŞİKLİĞİ (turun en değerli çıktısı)

**Fabrikayı fabrikaya sorarak denetlemek işe yaramıyor.** 13 denetim bulgusu çıkardık — hepsi gerçekti — ve **hiçbiri** aşağıdakileri bulamadı. Hepsini **brief'e itaat etmeye çalışan ajan** buldu:

| kusur | ajan ne dedi |
|---|---|
| Path 2D dünyada **3D** istiyordu | *"İkisi literal olarak aynı anda sağlanamaz"* |
| Kabul kapısı **metafor** isterken ledger metaforu yasaklıyordu | brief'in hangi yarısını kıracağına karar vermek zorunda kaldı |
| **Doğru Tesla karesi kendi koruma kapısında FAIL olacaktı** | markayı koruyan kapı markayı öldürüyordu |
| *"Birebir çiz, ezberden çizme"* — **referans yok** | *"Bu, yalnız metinle yapılabilecek bir kilit değil"* |
| **Negatifler ANLAM hatasını hiç kovalamıyordu** | iki ajan BAĞIMSIZ aynı cümleyi kurdu: *"malzeme hatasını kovalıyor, anlam hatasını değil"* |
| **Gece ikinci cümlede bitiyordu** | shot 1 sokak lambası, shot 2 öğle güneşi — aynı dizide |
| **Havuzlar dünyanın render lock'unu eziyordu** | whiteboard'a *"85mm macro creep"* ve *"sahnedeki pencere"* |
| **"Uygulanmış gibi görünen" fix** | havuz kapısı söküyordu, `applyWorldCameraLaw` geri veriyordu |

**METOT:** paket üret → ajana ver (Codex + Claude, iki bağımsız beyin) → *"itaat edebiliyor musun?"* diye sor → itiraz ettiği yeri kapat → tekrar sor.

## 3. KAPATILAN ÇELİŞKİLER (hepsi teste kilitli — `faz1_triple.test.ts`, 292 test)

- Path'in medyumu → **Render Lock belirler** (path 2D dünyada 3D emredemez)
- Kabul kapısı `tactile metaphor` → `tactile material truth`
- **Kilitli müşteri markası** üç yerden birden yasaklanıyordu (dünya negatifi + frameGate IP satırı + "NO English signage") → üçü de istisna tutuyor
- **`brand_refs/`** sözleşmede: marka referansı + kişi başına yüz referansı. Eksikse ajan `REFERENCE REQUIRED` yazıp **DURUR** (araba uydurmaz, yüz uydurmaz)
- **Anlam negatifi:** *"the named thing replaced by a symbol for it — no icon, chart, diagram, arrow standing in for the real object"* (39 dünyanın 39'unda)
- **`carryOver`** brief'te: her shot ne tuttuğunu bilir; **saati DONDURMAZ** (kaynak sabahı getirirse saat değişir)
- **Gece = sahne dizisinin özelliği** (`nightMap`) — bir cümle "gece" demeyi bıraktı diye bitmez. Palet gece karesine güneş emredemez, **ve frameGate de o paleti okur**
- **Dünyanın örnek öznesi** (*"a veteran's salute"*) kadro emri değil, **örnektir**
- **Havuzlar dünyaya sorar** (`gateByWorldLaw`): kilitli-kamera dünyasına dolly yok, 35-50mm dünyaya 85mm yok, mekânsız dünyaya "sahnedeki pencere" yok, düz-ışık dünyasına "ışık hareket eder" yok. **Ve havuz boşalırsa eskisine DÖNMEZ** — dünyaya yasal bir hamle verilir (`LOCKED_STILL_VANTAGE`)
- **EVENT BUDGET:** tek kare TEK olay tutar; bölme SÜREYE bakıyordu, olay sayısına değil

## 4. TELİF (üç kez kardeş alanda yeniden açıldı, sonunda KAPIDA kapandı)

anchor temizlendi → `refDna` "Soul"u 6 kez taşıyordu → o da temizlendi → `referenceDNA.refs[]` **34 kez** taşıyordu → o da → `handoff.refDNAs[]` hâlâ taşıyordu.
**Hepsi AYNI ref nesrinin FARKLI okuyucuları.** Artık scrub **tek yerde: verinin programa girdiği kapıda** (`pure.ts` DATA). Yeni bir okuyucu EKLEMEK deliği yeniden açamaz.

**SINIR:** **STÜDYO adı KALIR** (Pixar/Ufotable/MAPPA/Toei — bir pipeline'a işaret eder; dünyanın `negative_lock`'u zaten *"NO any named Pixar CHARACTER/LOCATION"* diyor). **ESER adı GİDER** (Soul/Arcane/Spider-Verse/Fury Road/Bebop).

## 5. ARAÇ PARKI — YÜZEY ≠ MOTOR (Mami düzeltti, araştırıldı)

**Magnific Spaces bir upscale aracı DEĞİL — node canvas.** İçinde Nano Banana da Kling de var (79 model). Higgsfield de öyle (16+ video, 15+ image). **İkisi de aynı motorları barındıran YÜZEY.**
- **ZORUNLU UPSCALE ADIMI SÖKÜLDÜ** — 1K üretilir, Kling 1080p verir. `raw_frames/`, `PENDING_UPSCALE`, upscale kanıtı, hepsi gitti.
- **Sora 2 kapanıyor** (API 2026-09-24) — üstüne bir şey kurma.
- Kaynak: magnific.com/spaces · higgsfield.ai/ai-video

## 6. VERİ ÇOĞALTMA

**18 REF** — 6 reklam dünyasının **SIFIR referansı vardı** (Tesla reklamı yaparken seçilecek tek ref yoktu). Artık **39/39 dünyanın referansı var, öksüz sıfır.**
**7 DÜNYA** — hepsi gerçek boşluk, kopya yok (dördü dört ayrı ışık yasası üretiyor, gerçek çıktıyla doğrulandı):

| dünya | yasası |
|---|---|
| `automotive_hero_real` | **GÖVDE BİR AYNADIR** — arabanın kendi rengi yoktur, gökyüzünü gösterir. Arabaya key vurursan ölü panel alırsın |
| `nature_doc_real` | **HİÇBİR ŞEY SAHNELENMEZ, HİÇBİR ŞEY AYDINLATILMAZ** — 300-600mm, fill yok, gölge siyaha gidiyorsa gider |
| `science_viz_real` | **DOĞRULUK ESTETİKTİR** — bilim bilmiyorsa kare de uydurmaz, gölgede kalır |
| `archival_newsreel` | **KAMERA ORADAYDI ve SADECE ORADA** — önemli şey kadraj dışındaysa kamera GEÇ döner |
| `technical_cutaway` | **KESİK FİZİKSELDİR** — her parça gerçek montaj ekseninde ayrılır |
| `shinkai_photoreal_anime` | **TEK KAREDE İKİ KAYIT** — sade cel karakter, foto-gerçek arka plan; aradaki UÇURUM üsluptur |
| `period_reconstruction` | **DÖNEM KENDİ KENDİNİ AYDINLATIR** — elektrik yoksa karede de yok; tek anakronizm kareyi geçersiz kılar |

**Tesla artık doğru dünyada** (`automotive_hero_real`) — `product_brand_real` bir masaüstü hero-nesne dünyasıydı.

---

## SIRADAKİ İŞ

1. **PİLOT VİDEO.** Paketler hazır: `~/Desktop/FAZ5-PILOT/` (8 paket, her register). Akış: `brand_refs/`'i doldur → `.command`'a çift tıkla (Pass A: ledger + prompt) → Nano Banana 2'de üret → `images/`'e koy → "resimler hazır" (Pass B: frame gate) → Higgsfield → Kling → Suno + ElevenLabs → Premiere.
2. **FAZ 2 = TASARIM** (Fable). Mami: *"faz 2 sitenin tasarımı"*. Fable'ın son turu merge'li (painterly plakalar · yaşayan sahne · deniz artık SU). Açık: 46 dünya plakası hâlâ **aynı deniz-günbatımı motifi** — `PRESET_PLATE_FILES` sözleşmesi hazır, içi boş.
3. **Ölü QA check'leri** (CHECK 6/6b) — ölü olduğu kanıtlı, fixture'la yeşil tutuluyor. Silmek yasak; ya gerçek etikete kablola ya dürüst adıyla emekli et.
4. **`scripts/brain-workbench.ts`** — `sourceReport: null` sabiti → Encyclopedia/Volition o araçta HEP sahte kırmızı.

---

## DERSLER (pahalı olanlar)

- **Fabrikayı fabrikaya sorma.** Çıktıyı üret, ajana ver, *"itaat edebiliyor musun?"* diye sor. Bugünkü 15 kusurun 15'i böyle çıktı.
- **"Uygulanmış gibi görünen" fix, hiç fix olmamasından BETERDİR** — yeşil test verir. Havuz kapısını taktım, `applyWorldCameraLaw` arkadan aynı emri geri veriyordu. **Aynı odaya açılan ikinci kapıyı ara.**
- **Bir kuralı SIKILAŞTIRMADAN ÖNCE "bu neyi çözüyor?" diye sor.** Magnific upscale kuralını üç yerden kilitledim; kural baştan yanlış anlamaydı.
- **Denetçinin iddiasını da doğrula.** "Prompt kendi kendisiyle çelişiyor, negatif no-Pixar-clean diyor" dedi; veriye bakınca çelişki YOKTU. Ona dayanıp Mami'ye yanlış gerekçe verdim.
- **Testin kendi körlüğünü ayır.** Bugün 4 kez "gerçek kusur" sandığım şey testimin hatasıydı (case-sensitive `Forbid`, ref-uyum süzgeci, `key-line` baskı terimi, prohibition cümleleri). **Gerçek çıktıyı GÖZLE oku, sonra fix yaz.**
- **Kilitleri say.** Dünya/ref/proje sayısı testlerde kilitli — EKLERKEN yükselt, ASLA düşürme.
