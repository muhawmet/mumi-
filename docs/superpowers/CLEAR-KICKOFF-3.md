# CLEAR SONRASI — Mami'nin yapıştıracağı metin

> Bu bloğu **olduğu gibi kopyala**, clear sonrası ilk mesaj olarak yapıştır.

---

Selam. **İLK KARELER ÜRETİLDİ.** Fabrika artık teori değil — çıktı motora çarptı. Bu tur **prompt kalitesi** turu.

## ÖNCE OKU (sırayla, atlama)
1. **`docs/superpowers/KARE-BULGULARI-2026-07-12.md`** ← **EN ÖNEMLİSİ.** 9 gerçek kareden çıkan yasalar.
2. `docs/superpowers/GECE-RAPORU.md` — gece boyunca kapananlar
3. `CLAUDE.md` — kanonik kurallar
4. Memory

**Durum:** dal `feat/3d-diorama-shell` · ağaç temiz · **PUSH YOK**
**Kapı:** tsc 0 · **vitest 1760/1760** · build OK · **e2e 15/15** · zsh OK

---

## MAMİ'NİN EKSENİ
> *"Otonom bir iş yapmıyorum. En önemlisi **command'ın yazdığı promptların kalitesi** ve **seçilen yolların final brief'e geçişi**. Hata kalmadıysa, command'daki üretenle ben konuşup çözerim."*

Mikro ışık/gece detayına dalma. Sistemi otonomlaştırma. **Mami döngüde.**
Bulguyu kapatmadan sor: *"Mami bunu prompt'a bakıp bir cümleyle çözer mi?"* → **EVETSE KAPATMA.**

**Reçete → final brief bacağı BİTTİ.** (konu/lokasyon/sahne notları brief'te · telif firewall'u dört yoldan kapalı · runner kapısız paketi reddediyor · eksik gerçek karşısında ajan uydurmuyor DURUYOR.)

---

## 🔥 BU TURUN İŞİ — KARELERDEN ÇIKAN İKİ YASA

### 1. FİZİK TAŞINIR, PROP SIZAR
One Piece karesine kimsenin istemediği **korsan gemisi + WANTED afişleri** girdi. Ajanın sahnesinde yoklardı — **dünyanın kendi `render_law`'ından** geldiler:
> `"Invented fictional signage — wanted-poster paper, pennants, caravel-hybrid timber hull with carved figurehead"`

O cümle dünyanın **kelime dağarcığını** tarif ediyor; **motor onu BU KARENİN İÇİNDEKİLER LİSTESİ sandı.**
Kurumsal render lock **fizikten** yapılmış (ışık/yansıma/lens) → güvenle taşındı, A/B'yi kazandı.
**Bu, kompozisyon kalıplarının mobilya taşıması kusurunun BAŞKA KATMANI** — o katmanı kapatmıştık, bu duruyor.

### 2. FİGÜR YASASI ARKA PLANA DAYATILIYOR (hipotez — ÖLÇ)
İsimli kontrol testi (`G3`, prompt'ta açıkça "One Piece" yazıyordu) **yine One Piece çıkarmadı** — mat, **plastik**, batı çizgi-romanı. **Yani eksik olan İSİM DEĞİL.** Prompt motoru aktif olarak uzaklaştırıyor.

**Hipotez:** `one_piece_toei.render_law` *"NO gradient, NO airbrush, NO soft shading"* diyor. Ama gerçek anime'de **arka planlar BOYALIDIR** (airbrush gökyüzü, dereceli bulut). Düz-cel + kalın kontur **yalnızca FİGÜRE** aittir. Tüm kareye dayatılınca motor **vektör-illüstrasyon** moduna giriyor → plastik.
**Kanıt:** `shinkai_photoreal_anime` tam da bu ayrımı yaptığı için **birebir tuttu** (*"sade cel karakter, foto-gerçek arka plan"*).

### YAPILACAK (sırayla)
1. **ÖLÇ:** 46 dünyanın `render_law`'ında hangi cümleler **PROP/NESNE**, hangileri **FİZİK**? Kaç dünya figür-kuralını arka plana dayatıyor? **Sayıyla söyle.**
2. Prop listeleri **"kelime dağarcığı, kadro emri DEĞİL"** diye işaretlensin — dünyanın örnek öznesi için (*"a veteran's salute"*) zaten yaptığımızın aynısı.
3. `one_piece_toei`: cel disiplini → **FİGÜR** · boyalı/dereceli disiplin → **ARKA PLAN**. Ayrımı yasaya yaz.
4. **Aynı sahneyi tekrar ürettir, Mami'ye ver, KAREYE BAK.** Kare olmadan kapatma.

⛔ **KÜTÜPHANEYİ (yeni dünya/ref) BUNDAN ÖNCE GENİŞLETME** — kusurlu şablonu 10 yeni dünyaya kopyalarsın. Yasa şekli düzelsin, sonra genişlesin.

---

## KARELERDEN ÖĞRENİLEN ÖLÇÜM KURALLARI (bunlara uy)
- **Dünya kilidini FİGÜRSÜZ kareyle test etme.** Makro yaprakla Pixar'ı foto-gerçekten ayırt edemezsin. **İnsan, üslubun turnusol kâğıdıdır.** (Bunu Mami düzeltti; ben yanlış rapor vermiştim.)
- **RENDER LOCK SÖKÜLMEYECEK.** A/B ölçüldü: 652 kelimelik yasa yığını sökülünce kare **stok fotoğrafa kaydı**. Fizikten yapılmış yasa iş görüyor.
- **Palet emri kısıtlayıcı LİSTE değil, doygunluk/kontrast REJİMİ olarak yazılır.** (Benim "marine-blue shadow, primary-yellow mid" satırım motorda **duotone** okundu.)

---

---

## 🪟 WINDOWS PARİTESİ — YENİ İŞ (Mami evde Windows PC, ofiste Mac; ikisinde de KAYIPSIZ çalışmalı)

### İYİ HABER: kırılan yer az
Node · Vite · Vitest · Playwright · git · `claude` CLI → **hepsi Windows'ta çalışıyor.** Site zaten açılır. `scripts/faz5-pilot.ts` `os.homedir()` kullanıyor — **taşınabilir, doğru.**

**Kırılan TEK şey: `.command` runner'ı** (zsh'e özgü) ve ona bağlı 2 gate satırı:
- `setopt nullglob` / `(Nom)` glob niteleyicileri / `read "?prompt"` / `<->` pattern → **zsh-only**
- `.command` uzantısı = macOS çift-tık sözleşmesi; Windows'ta karşılığı `.bat`/`.ps1`
- Gate: `zsh -n <runner>` → Windows'ta yok
- `lsof -ti:5173 | xargs kill` → Windows'ta yok (sadece dev konforu)

### ⚠️ TUZAK — BUNU OKUMADAN KOD YAZMA
**İkinci bir runner METNİ yazmak = yasanın drift edeceği BEŞİNCİ yer.**
Bütün gece tam da bunu düzelttik: `brand_refs` iki runner'da da **0 kez** geçiyordu · `firewall` production şeridinde **0 kez** · ledger sadece TR şeridindeydi. **Metni kopyalarsan, üç ay sonra Windows şeridi Mac şeridinin gerisinde kalır ve KİMSE FARK ETMEZ.**

### DOĞRU MİMARİ
> **Kick metni TEK KAYNAKTA. Launcher'lar İNCE KABUK.**

Launcher'ın işi sadece üç şey:
1. Klasördeki paketi bul (birden fazlaysa SOR, sessizce seçme)
2. **Kapıyı kontrol et** — `production` bloğu yoksa DUR (bu gecenin en kritik kapısı)
3. `claude`'u çağır

**Prompt/yasa metni launcher'da YAŞAMAZ** — paketin içinden (`project.json` / `agentBrief`) okunur ya da tek bir üretilmiş dosyadan gelir. İki launcher, tek yasa.

### KABUL KRİTERLERİ
- `docsContract.test.ts`'in `LANES`/`RUNNERS` listesine Windows launcher'ı **EKLENİR** — aynı testler onu da tarar (kapısız paket reddi · `brand_refs/` · `FACT REQUIRED` · firewall · ledger · motionDraft etiketi). **Şerit eklenip teste eklenmezse iş yapılmamıştır.**
- Gate cross-platform olur: `zsh -n` yerine platform-farkında bir syntax kontrolü (Windows'ta `powershell -NoProfile -Command "$null = [ScriptBlock]::Create((Get-Content -Raw <ps1>))"` ya da eşdeğeri). **Mac gate'i BOZULMAZ.**
- `scripts/faz5-pilot.ts` ve tüm script'ler `path.join` kullanır, `/` string birleştirme YOK.
- Satır sonu: `.gitattributes` ile shell script'ler `eol=lf` sabitlenir (CRLF zsh'i kırar).
- **KANIT:** Windows'ta gerçekten koşulur (Mami'nin PC'si) — paket bulundu, kapısız paket REDDEDİLDİ, Pass A prompt yazdı. Mac'te de hâlâ koşar.

### SIRA
Bu iş **prop/plastik turundan SONRA** — o tur veriyi düzeltiyor, bu tur dağıtımı. Ama Mami evdeyken Windows'ta çalışamıyorsa öncelik değişebilir; **Mami'ye sor.**

---

## DURUMU İYİ OLAN (dokunma, kanıtlı)
`kurumsal_brand_film` · `zanaatkar/cinematic real` · **`shinkai_photoreal_anime` (en zor dünya, birebir tuttu)** · **`pixar_3d_edu` (insanlı kare ile tartışmasız)**

## YARIM KALAN
**Fable son turu** — worktree `worktree-agent-ac0f3c90c62b2c0d8` (çalışıyordu). Phase 0 iki-kolon düzeni (1280–1499) · panellerin sahneyi %80 örtmesi · 3 zayıf plaka.

---

## DİSİPLİN
Gate her commit öncesi (tsc + vitest + build + `zsh -n` ×2) · **test sayısı DÜŞEMEZ (≥1760)** · `git add` spesifik dosya, asla `-A` · **PUSH YOK** · sayaçlar EKLERKEN yükselir · **her iş parçasından sonra bağımsız review-ajanı** (bu turda iki kez telif deliği/kirli kod yakaladı) · **her task sonrası temiz checkpoint**.

**PROMPT KALİTESİ = gerçek `generateBatch` çıktısını GÖZLE oku.** "vitest geçti ≠ doğrulandı."
**Ve artık: KARE olmadan 'kapandı' deme.**
