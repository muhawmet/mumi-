# GECE RAPORU — 2026-07-12 · orkestratör turu

**Dal:** `feat/3d-diorama-shell` · tek ağaç · **PUSH YOK**
**Kapı:** tsc 0 · **vitest 1691 → 1757** · build OK · zsh OK · **e2e 7/15 → 15/15**
**Veri:** 46 dünya · 130 ref · 32 proje · 12 palet (sayaçlar düşmedi)

---

## 0. ÖNCE DÜRÜST OLAN

**HÂLÂ TEK BİR KARE ÜRETMEDİK.** Bu turun sonunda da üretmedik — bende görsel motor yok.

Ama bu gece bir şey değişti: **fabrika ilk kez uçtan uca koştu.** `.command`'a gerçek Claude CLI ile girildi, gerçek bir üretim ajanı Pass A'yı yürüttü, `ledger/`'ı yazdı, `image_prompts/1.txt`'i yazdı, ve **motion yazmayı doğru şekilde reddetti** ("frame-gated"). Yani artık teori değil: **Nano Banana 2'ye yapıştırılmaya hazır, denetlenmiş bir prompt var.** Kare senden bir kopyala-yapıştır uzakta.

Gerçek ajanın yazdığı prompttan (kurumsal fabrika, sahne 1, GECE beat):

> *"Light (NIGHT BEAT — the source sets the clock, the world sets the light): there is NO daylight here. The key is a motivated practical that exists at night on this floor — the cool linear LED work-light banked over the production line... A single restrained amber accent carries the subject's edge: a warm orange machine indicator."*
> *"Palette as light: shadows read as near-black cool blue... NO teal-orange grade, NO neon, NO plastic gloss — render as light behaviour, never flat fills."*

Gece gece kaldı. Palet ham hex değil ışık davranışı olarak geçti. Anti-sembol negatifi çalıştı. Marka yok, temiz plaka. **Gece-5'te kurulan yasaların hepsi gerçek çıktıda görünüyor.**

---

## 1. GECENİN EN BÜYÜK BULGUSU — DOKTORUN REÇETESİ ECZACIYA ULAŞMIYORDU

Sen reçetede **konu**, **lokasyon** ve **sahne notları** yazıyorsun — sahne sahne: VO, olay, yönetmen notu, motion seed, Türkçe etiketler, kaçınılacaklar.

**Hiçbiri brief'e ulaşmıyordu.** Gerçek `generateBatch` ile ölçüldü: notu doldur ya da boş bırak — **çıktı bayt bayt aynı.**

Bu tam olarak `brandKitLock` sınıfıydı: alan var, UI'da doldurulabiliyor, hazırlık kontrolü "Konu"yu **zorunlu** bile tutuyor — ama `generateBatch → agentBrief → final_brief.md → project.json` zincirinin hiçbir halkası görmüyor. Sadece indirilen `recipe.md`'de yaşıyorlardı.

**Kesik bir hataydı, tasarım değil — kanıt:** store'un kendi `generationFields` listesi bu üçünü *zaten* "değişirse üretimi geçersiz kıl" diye işaretliyordu. Store onların üretimi etkilediğine **inanıyordu**; `generateScenes` onları geçirmiyordu.

Kablolandı: `subject` konuyu çözüyor, `location` koşullu bir satır basıyor, notlar **Doctor's Recipe Notes** bölümü olarak (yönetmen mandatosu seviyesinde — kaynağın ve render lock'un ALTINDA, ref DNA'nın ÜSTÜNDE) brief'e giriyor. Not boşsa hiç basılmıyor → notsuz brief eskisiyle **bayt-eşit** (doğrulandı).

---

## 2. TELİF — DÖRDÜNCÜ AÇILIŞ, VE BENİM KENDİ KODUMDA

Yukarıdaki kabloyu çektim. Sonra bağımsız denetçi ajanı (senin standing kuralın) arkamı denetledi ve **beni yakaladı.**

Yeni metin yolu **hiçbir firewall'dan geçmiyordu.** Gerçek çıktıyla ölçüldü:

| yazdığın | nereye gidiyordu |
|---|---|
| `subject: "Spider-Verse tarzında olsun"` | `final_brief.md`'ye **HAM** |
| `director_note: "Attack on Titan gibi çiz"` | `final_brief.md`'ye **HAM** |
| `location: "Apple Store, İstanbul"` | `project.json`'a **canlı ticari marka** |
| `vo: "Renk #FF00AA olsun"` | prompt yoluna **HAM HEX** (Palet Translation Law ihlali) |

Telif kapısının **dördüncü açılışı** (anchor → refDna → referenceDNA.refs[] → handoff.refDNAs[] → **şimdi senin kendi elin**). Öncekiler referans nesriydi ve veri kapısında kapandı. Bu farklı ve daha kötü: **bu senin kendi cümlen.**

**Kök sebep:** İKİ firewall var ve yeni yol **ikisinden de** geçmiyordu — `protectedTermsIn` korumalı KARAKTERİ yakalar (Luffy, Eren, Gojo), `workTitlesIn` ESERİ (Spider-Verse, Arcane, Fury Road). Kural: **STÜDYO kalır, ESER gider.**

**Kapı `cast`'in felsefesini izliyor: senin yazdığını ASLA sessizce yeniden yazmaz.** "Spider-Verse tarzında olsun"dan adı kesmek geriye "tarzında olsun" bırakır — hem sakat hem hâlâ yanlış. Kapı **DURUR ve terimi sana söyler:**

> *"Konu alanında korumalı eser adı var: Spider-Verse. Bu ad export'a giremez — ne DEMEK istediğinizi dünyanın kendi diliyle yazın (ör. 'Spider-Verse gibi' değil, 'kalın kontur, ofset baskı kayması, yarım-ton nokta dokusu')."*

Sen döngüdesin; bir cümleyle düzeltirsin, export sızıntıyı hiç taşımaz. Dürüst zanaat nesri ("ofset baskı kayması") ve stüdyo adı (Pixar) **geçiyor** — kapı geçemeyeceğin bir duvar değil.

> **Ders:** "Anti-halüsinasyon: kendi işini kendin onaylama" kuralı bu gece **ikinci kez** bedelini ödedi (diğeri: T5 ajanı kendi fix'ine iki hata gömmüştü, denetçi yakaladı). Bu kural pahalı ve haklı.

---

## 3. ECZACININ ELİNDEKİ METİN — "KAPANDI" SANILAN KAPILAR ORAYA HİÇ ULAŞMAMIŞ

Gece-5 birçok kapıyı kapattı. **Ama kapılar `project.json`'da ve insan README'sinde yaşıyordu — ajanın fiilen itaat ettiği emir listesinde değil.**

### 3.1 KAPISIZ PAKET (en ağırı)
Timeline ekranında gerçek bir indirme butonu var: `<ad>_mamilas_command.json`. Runner'ın glob'u onu **kabul ediyordu.** Ama o şemada **`production` bloğu YOK** — `frameGate` (kare kontrol listesi), `sceneIndex` (bölünen sahnenin dosya adları), `folderContract` (ledger, brand_refs), `scaffold` (REFERENCE REQUIRED) — **hiçbiri.**

O paketle koşan ajan kapıların **hiçbirini görmez ve durmaz.** Gece-5'te kapatılan her şey bu yoldan buhar oluyordu.

**Fix:** runner artık **dosya adına değil KAPIYA** bakıyor — `production` bloğu yoksa durur. Yeniden adlandırmak da kaçamıyor (denetçi `project.json` adıyla kaydedip sınadı: yine reddedildi). Gerçek koşumla doğrulandı, test yeşilliğiyle değil.

### 3.2 FACT REQUIRED — metnin taşıyamadığı üç gerçek
`brand_refs` kelimesi **iki runner'da da SIFIR kez** geçiyordu. Gece-5 "referans kapısını kurdum" demişti; ajan o kelimeyi hiç görmüyordu.

Codex üçüncü sınıfı buldu — **dönem**: `period_reconstruction` dünyası *"tek anakronizm kareyi geçersiz kılar"* diyor **ve** ajanın dönem seçmesini yasaklıyor; kaynak yüzyılı/bölgeyi söylemiyor. Dikkatli ajan durur; dikkatsiz ajan **"generic old workshop" uydurur** ve her yanlış kandil kareyi çöpe atar.

**Tek kural üçünü de kapsıyor:** gerçek ne kaynakta ne `brand_refs/`'te varsa → `FACT REQUIRED: <ne eksik>` yaz ve **DUR**. (a) marka geometrisi, (b) belirli bir yüz, (c) dönem.

**VE KAPI SINANDI — DÖNGÜ KAPANDI.** Kapıyı taktıktan sonra dokuma paketini **taze, hiçbir şey bilmeyen bir ajana** gerçek `.command` ile verdim. Uydurmadı — **DURDU:**

> *"FACT REQUIRED: dönem çıpası. Kaynak ne yüzyıl, ne bölge, ne dokuma geleneği söylüyor. Bu dünya render_law §4 gereği TEK anakronizmle kareyi geçersiz kılar... dönemi ben seçemem (uydurulan yüzyıl uydurulan girdidir). **GEREKEN: yüzyıl · bölge · dokuma geleneği.**"*

İkinci sahnede daha da ileri gitti:
> *"tezgâhın türü (çukur tezgâh / yatay yer tezgâhı / dikey halı-kilim tezgâhı) doğrudan döneme ve bölgeye bağlıdır — yanlış tip tek başına anakronizm olup kareyi geçersiz kılar. **Mami bu üçünü verince gerçek image prompt yazılır. STOP.**"*

Kapı sana **tam olarak hangi üç kelimeyi yazman gerektiğini** söylüyor. Bir cümleyle açılıyor. Bu, "ajanın raporuna güvendim" değil — **fix'ten sonra gerçek koşumla alınmış kanıt.**

### 3.3 FIREWALL ŞERİTTE YOKTU — gece-4 yarasının üçüncü tekrarı
`firewall` kelimesi **production şeridinde 0 kez** geçiyordu. Senin fiilen çift tıkladığın şerit o. O yoldan giden ajan telif duvarını **hiç görmüyordu.** Antigravity şeridinde de image prompt'un girdi listesi (sceneBrief + refDna + paletteLight + Render Lock) **budanmıştı**. Dört şerit de artık aynı yasayı taşıyor, **şerit-başına teste kilitli.**

### 3.4 SİTENİN KENDİ CLI ÖRNEĞİ AJANI KÖRLEŞTİRİYORDU
Paketin içine basılan `cliExamples`, `jq` ile paketi dilimleyip ajana boruluyordu — ve o dilim `sceneBrief`, `refDna`, `paletteLight`'ı **düşürüyordu**: ajanın neyi yazacağını söyleyen HER alan. Geriye bitmiş gibi duran bir `motionDraft` kalıyordu. **Pakete basılan örnek, örnek değil TALİMATTIR.** Söküldü: tek desteklenen yol runner, çünkü kapılar orada yaşıyor.

*(Bunu içeride tutan eski bir test vardı — `--input-format json` bekliyordu. Testi silmedim; iddiasını yeni gerçeğe çevirdim. Yeni test **builder'ın kaynağına değil ÜRETİLEN PAKETE** bakıyor: ayna değil kapı.)*

### 3.5 Daha küçük ama sessiz
- **Hayalet teslim sözleşmesi:** roller `outputs.frames` diye teslim ediyordu — hiçbir yerde tanımlı olmayan anahtar — ama `folderContract` diske gerçek dosya bekliyordu. Teslim artık bir DOSYA (`image_prompts/<id>.txt`, `report.md`...).
- **Gevşek metin yasası:** `agentPackets.image` eski politikayı taşıyordu ("Use NO_TEXT..."), eksik olanlar: yazı karedeki NESNEDİR · ekran koordinatı YASAK · Letterform grameri.
- **Etiketsiz taslak:** üç şerit `motionDraft`'ın taslak olduğunu söylüyordu; **senin şeridin tek kelime etmiyordu.**
- **Bölünen sahne:** Codex/Antigravity şeritleri sana *"report.md hangi kareleri istediğini listeliyor"* derken ajana o listeyi **yazdırmıyordu** — 3b.png'yi borçlu olduğunu hiç öğrenmiyordun.

---

## 4. E2E — VE ALTINDA GERÇEK BİR UI BUG'I

15 testin 7'si kırıktı (Fable arayüzü değiştirmiş, testler eskisini arıyordu). **15/15 yeşil.**

Ama selector'ların altında gerçek bir bug vardı: `.phase0-slate` grid'i sol rayın **sıfıra kadar ezilmesine** izin veriyordu. Tarayıcıda ölçüldü:

| viewport | ray genişliği | preset etiketi |
|---|---|---|
| **1280** (13" laptop) | 72px | **0px → tıklanamaz** |
| 1440 (MacBook Pro) | 232px | 90px (kırpılmış) |

**1280'de Phase 0 preset kartlarını ne okuyabiliyor ne tıklayabiliyordun.** Birim testleri 1691/1691 yeşildi — çünkü kimse tarayıcıdaki gerçek yola bakmamıştı. Bu, DAY-ZERO listesinin tam olarak işaret ettiği şeydi.

E2E ajanı ayrıca **iki sahte geçen testi** sıkılaştırdı: biri hiç var olmayan bir store handle'ı arayıp fallback'te **kendi yazdığını okuyordu** (ayna); diğeri adı *"preset dünyayı store'a yazar"* diyordu ama bunu **hiç ölçmüyordu**. Artık ölçüyor — **ve bu dalda `preset-director-bug` YOK: preset store'a yazıyor.**

---

## 5. SİMÜLASYON DÖNGÜSÜ — İKİ BAĞIMSIZ AJAN, "İTAAT EDEBİLİYOR MUSUN?"

Metot senin: paket üret → iki bağımsız beyne ver → *"itaat edebiliyor musun?"* diye sor.

**Codex (`gpt-5.6-sol`, dıştan denetçi):** 3 paketten 2'sine itaat edebildi. Dokumada durdu — dönem boşluğu (§3.2). Uydurma bulgu üretmedi.

**Claude (ikinci göz), 4 paket:** kurumsal ✅ · hemzemin ✅ (ama iki efendiden birini seçmek zorunda kaldı) · dokuma ❌ (dönem) · **Tesla ❌ (`brand_refs/` boş — REFERENCE REQUIRED doğru çalıştı)**.

**İkisi de bağımsız olarak dönem boşluğunu buldu.** Kapatıldı.

**TEMİZ olduğu iki ajanca doğrulanan:** gece fix'i fiilen çalışıyor · `carryOver` saati dondurmuyor, kaynağa itaat ediyor · **Palet Translation Law tutuyor (4 pakette prompt yolunda tek ham hex yok)** · telif firewall'u (ref tarafında) temiz · `REFERENCE/FACT REQUIRED` kapıları sistemin en iyi parçası.

---

## 6. IŞIK YASASI İKİ KEZ KONUŞUYORDU — **KAPANDI, ÇIKTIYLA DOĞRULANDI**

**Tesla, TEK prompt string'inin içinde:**
> `"There is never a key aimed AT the paint"` ← dünyanın yasası (gövde bir aynadır)
> `"Light variant: trade the key one stop softer and let the accent colour carry the subject edge"` ← ışık varyantı havuzu

Havuz, dünyada **var olmayan** bir key'i yumuşatıyor ve rim emrediyor. Dünyanın kendi tanımıyla sonuç: *"a hot spot and a dead panel"* — **müşterinin arabası çirkin çıkar.**

**Dokuma, aynı dosyada:** `NO rim light` · `NO fill, NO bounce card, NO rim` **ve** aynı rim'i emreden varyant satırı.

**Işık varyantı havuzu dünyaya sormuyor.** `304a3ca` commit'i *"ışık varyantı dünyaya soruyor"* diyor — **çıktı bunu yalanlıyor.** Bu tam olarak gece-5'in uyardığı sınıf: *"uygulanmış gibi görünen fix, hiç fix olmamasından beterdir."*

**Neden kapatıldı (senin süzgecinden geçti):** bunu bir cümleyle düzeltemezsin — 600 kelimelik render lock'un ortasına gömülü bir clause. Kareye bakınca "çirkin" dersin ama **nedenini göremezsin.** Üretimden önce, sessizce oluyor → **KAPAT.**

### FIX SONRASI GERÇEK ÇIKTI (test yeşilliği değil — üretilen paket)

**Tesla, aynı sahne:**
> `Light variant: HOLD — this world's light law already fixes the source, so add nothing, soften nothing, re-aim nothing.`

*"key'i bir stop yumuşat"* emri **yok oldu.** Ve havuz boşalınca **kapısız havuza dönmedi** — dünyaya *yasal bir hamle* verildi (`LOCKED_STILL_VANTAGE` emsalinin ışık karşılığı). Gövde bir ayna kaldı; key gökyüzünden geliyor.

**Dokuma:** `NO rim light` yasağı tek başına duruyor; rim emreden varyant satırı **gitti.**

Ajan ayrıca **kendi fix'ini denetlerken iki dünya daha buldu** (`fix(ışık-2)`): *"key'i yumuşat" emri, key'i OLMAYAN iki dünyaya daha gidiyormuş.* **"Aynı odaya açılan ikinci kapı" bu sefer arandı ve bulundu.**

---

## 7. SENİN GÖZÜNE BIRAKILANLAR (bilerek KAPATMADIM)

Süzgeç: *"Mami bunu prompt'a bakarak bir cümleyle düzeltir mi?"* → **EVETSE KAPATMA.**

1. **Işık monotonluğu.** Ölçüldü, Codex haklı: `ghibli_hayao`'da **14 beat'te 5 farklı ışık** (mod-3 döngü). Kamera havuzu sağlıklı; ışık havuzu tekrar ediyor. **Ölçtüm, kablolamadım** — CLAUDE.md'nin "uydurma fix yapma" uyarısı burada geçerli, ve sen prompt'a bakıp bir cümleyle çeşitlendirirsin.
2. **Not → sahne id eşlemesi.** Reçete notun `id:3` ile üretilen sahne `id:3` aynı şey olmayabilir (notlar reçete editöründen, sahneler kaynak beat'lerinden numaralanıyor). Notları shot'lara **zorla yapıştırmadım** — etiketli blok olarak basılıyor, ajan okuyup eşliyor. Zorlamak uydurma özellik olurdu; "not 3 shot 3'e gitsin" dersen bir cümlelik iş.
3. **Kurgu sınırı** (sadece kesme/sıralama + ses) hiçbir kick'te yok, sadece `MAMI-README.md`'de. Ajan bunu ancak `report.md`'de bir cümleyle ihlal edebilir ve sen report.md'yi okuyorsun.
4. **Tesla'nın saati:** kaynak *"Şehir uyanmamıştı"* diyor (şafak öncesi), site `day → dusk` diyor. Bir cümlelik düzeltme.
5. **Phase 0 breakpoint (1499) bir tasarım kararı.** Kırığı onardı ama 1440'ta dosya kolonu artık rayın altında. Alternatif (kolonu daraltıp iki kolonu korumak) Fable'a 2. turda soruldu — **senin onayına gelecek.**
6. **`brain-workbench`'in Encyclopedia'sı artık 65/65 PASS** — gerçek, ama denetçi haklı olarak "bu yeni bir ayna olabilir" dedi: round-trip senaryosunda matematiksel olarak hep geçer. Elle beat düzenleme senaryosu workbench'te hiç egzersiz edilmiyor. **Sahte kırmızı gitti; sahte yeşil riski var.**

---

## 7b. KLON MOTION — ÖLÇÜLDÜ, KAPI ATEŞLİYOR

`rawSource` boşken — yani senin **"sadece konu, senaryo yok"** modunda, ki store'un varsayılanı bu — **30 dünyanın 27'sinde** iki sahne **birebir aynı** motion talimatını alıyordu. Ve `prompt_surgeon` o batch'e **`success: true`** diyordu: *"Neşter steril… Moving element sahneden sahneye farklı."* **Cerrah 8 klon sahneye temiz rapor veriyordu.** Fixture yalanının bedeli buydu.

CHECK 6/6b artık gerçek motion yüzeyine kablolu. Kendi ölçümümle doğruladım: 6 sahnelik kaynaksız bir batch → **5 benzersiz gövde / 6 sahne (klon var)** → **`prompt_surgeon` FAIL.** Kapı ateşliyor, export bloklanıyor.

*(İlk ölçümümde "kapı sessiz" çıkmıştı — **kendi aletim kördü**: `evaluateDirectorCabinet` bir dizi döndürüyor, ben nesne sanmıştım. Bu gece ikinci kez kendi aletim beni yanılttı. Gece-5'in dersi aynen geçerli: *testin kendi körlüğünü gerçek kusurdan ayır.*)*

---

## 8. YÖNTEM — BU GECE NE İŞE YARADI

- **`.command`'ı sahte bir `claude` ile koşturmaya çalıştım; stub devreye girmedi ve GERÇEK ajan koştu.** Kaza, ama gecenin en değerli kanıtı: fabrika çalışıyor.
- **Denetçinin iddiasını da doğrula.** Her ajan iddiasını (D1, D2, ışık çelişkisi, Apple sızıntısı) kendi elimle gerçek çıktıda kontrol ettim. "Apple sızıyor" iddiası **YANLIŞ çıktı** — `apple_object_worship` ref'i seçilse bile "Apple" prompt yoluna hiç ulaşmıyor (veri kapısındaki scrub tutuyor). O bulguyu sana taşımadım.
- **Testi kaynağa değil ÇIKTIYA bağla.** Bir check ancak site'in KONTROL ETMEDİĞİ girdiye bakıyorsa KAPIDIR. Bu gece yazdığım her yeni test üretilen paketi okuyor.

---

## 9. TESLİM DURUMU

**Kapı:** tsc 0 · **vitest 1760/1760** · build OK · **e2e 15/15** · zsh OK · ağaç temiz · **PUSH YOK**
**Test sayısı hiç düşmedi** (1691 → 1760). Dünya/ref/proje sayaçları sabit (46/130/32).

### Bitti (hepsi teste kilitli, gerçek çıktıyla doğrulandı)
| iş | sonuç |
|---|---|
| T1 e2e | 7/15 → **15/15** + gerçek UI bug'ı (1280px'te preset kartları tıklanamıyordu) |
| T2 reçete kabloları | `subject` · `location` · **sahne notların** brief'e ulaşıyor |
| **Telif — 4. açılış** | senin serbest metnin artık İKİ firewall'dan geçiyor, kapı DURUP terimi söylüyor |
| T3/T4 drift | 8 drift bulundu, **8'i de kapandı** (kapısız paket · FACT REQUIRED · şerit firewall'u · kör jq borusu · hayalet teslim · gevşek metin yasası · etiketsiz taslak · kare listesi) |
| T5 ölü QA | fixture yalanı bitti; klon motion kapısı **ateşliyor** (ölçümle) |
| T6 workbench | sahte kırmızı 65/65 → 0/65; altındaki **22 gerçek pacing sinyali** görünür oldu |
| **Işık yasası** | tek ağızdan konuşuyor; Tesla/dokuma çelişkisi **çıktıda gitti** |
| Fable 1. tur | 46 dünya plakası merge'li — deniz-günbatımı tekdüzeliği bitti |
| `.command` | **uçtan uca koştu** (DAY-ZERO) · **FACT REQUIRED gerçek ajanla sınandı: uydurmadı, durdu** |

### Yarım kalan (session limiti — 03:30 sıfırlaması)
- **Fable 2. tur** — hiç commit atmadan kesildi. Görev duruyor: 3 zayıf plaka (`retro_anime_film` · `arcane_fortiche` · `laika`↔`claymation` ayrımı) + Phase 0 iki-kolon düzen kararı (1280–1499 arası) + panellerin sahneyi örtmesi.

### Sıradaki (öncelik sırasıyla)
1. **BİR KARE ÜRET.** `~/Desktop/FAZ5-PILOT-R4/kurumsal_tan_t_m_fabrika.mamilas/` — `.command`'a çift tıkla, `image_prompts/1.txt`'i Nano Banana 2'ye yapıştır. **Bir kare yüz denetim turundan fazla şey söyler.**
2. Dokuma paketini açmak için üç kelime: **yüzyıl · bölge · dokuma geleneği** (ajan bunu senden istiyor).
3. Tesla için `brand_refs/` doldur (logo + gerçek araç geometrisi) — kapı seni orada bekliyor.
4. Işık monotonluğu (§7.1) — ölçüldü, senin gözüne bırakıldı.
5. Fable 2. tur.

---

## 10. SİTEYE DÜRÜST PUAN — **6.5 / 10**

**Neden 6.5 değil de daha yüksek değil:** bir video üretim sistemi **tek kare üretmeden** 7 alamaz. Bu gece fabrikanın *sözleşmesi* ciddileşti — ama sözleşme film değildir.

**Neden 5 değil de bu kadar:** bu gece fabrika ilk kez gerçekten koştu, kapılar ilk kez gerçek ajanı **durdurdu** (uydurmadı), doktorun reçetesi ilk kez eczacıya ulaştı, ve telif deliği ilk kez **açılmadan önce** kapandı.

**Kırdığım puanlar:**
- **−2.0** hâlâ tek kare yok. Her şey hâlâ metin.
- **−0.7** ışık monotonluğu ölçüldü, kablolanmadı (14 beat'te 5 ışık).
- **−0.4** `brain-workbench`'in sahte kırmızısı gitti ama **sahte yeşil riski** doğdu (round-trip her zaman geçer).
- **−0.3** not→sahne id eşlemesi hâlâ ajanın yorumuna bırakılmış.
- **−0.1** Fable 2. tur yarım.
