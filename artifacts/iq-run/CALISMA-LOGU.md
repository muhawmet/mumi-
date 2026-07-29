# FAZ 8 — ÇALIŞMA LOGU (2026-07-29)

Mami molada. Orkestratör: Opus. Her adım ölçüldü, her ölçüm commit'lendi.
Karar kaydı: [`FAZ-8-KARAR-01.md`](FAZ-8-KARAR-01.md).

---

## Adım adım

### 1 · Teşhis — 3 ajan, salt-okuma (commit `859068c`)
**Soru:** Codex'in IQ planının merkezi (Planner/Selector) doğru yere mi bakıyor?
**Ölçüm:**
- 71 revize bloğu sınıflandırıldı: yazı/rakam %35 · kavram ışığı %20 · rol/fiil %10 · prop-@tag %8.
  **Sahne fikri zayıf: 0/71.** Kompozisyon tekrarı 0. Işık/kadraj 0.
- 71'in **~44'ü (kısmenlerle ~52'si)** prompt metnine bakılarak, kredi yakmadan kesilebilirdi.
- Kodun ürettiği prompt ile teslim arasında **%1-3** örtüşme; aktif projede **%0** (site hiç koşulmadı).
- Semantik aday katmanı bir kez bilerek sökülmüş: `pure.ts` → *"FAZ2: konsept motoru söküldü"*.

**KARAR:** IQ1/IQ2/IQ3 kurulmayacak. Tek iş IQ4 — üretim öncesi ölçüm.
**Skor etkisi:** yanlış yöne harcanacak haftalar durduruldu.

### 2 · Enzim yazı kilidi (commit `9197637`)
Mami: *"düz yazıyla ilgili kilidi kaldırmıştık, artık sahneye göre adaptif yazılar ekliyordu."*
`KİLİT 1.4` hâlâ üretimden ÖNCE global yazı listesi istiyordu. Politika kilitli kaldı
(Türkçe ya da HİÇ · diegetik · post'ta katman yok · TEXT slotu harf-harf), **hangi karede yazı
olacağı kare kare** verilir. Kanıt: Üreme 14 yazılı kare, karar kare kare, **14/14 temiz**.
İkiz `.agents/` kopyası eşitlendi.

### 3 · Kıstas düzeltmesi — SUPERSEDED (commit `5fa0982`)
Mami: *"arşiv sadece ne iş yaptığımın kanıtı olarak kalsın · Windows'takiler işten çıkarken
ürettirdiklerim, hatalı."* Kabul testi Sürtünme/Bileşke'den **Üreme**'ye taşındı.
Eski karar silinmedi, üstüne `SUPERSEDED` satırı yazıldı.

### 4 · Arşiv kusur taraması — 2 ajan (kusur gözüyle)
Sürtünme'nin "sıfır revize"si kusursuzluk değilmiş: temas 26/31 karede yok, üç-katman derinlik
30/31 yok, ten kilidinin negatif yarısı 31/31 yok, S3/S18'de tam tersi yazılmış.
Kütle'nin iki yarısı iki farklı lehçeyle basılmış (STYLE 81-91 vs 23-30 kelime; `overscale` 8/8 → 0/27).
Bileşke: 52/52 karede `saffron force-bloom` → altı karede kuvvet **çiçek** olarak öğretilmiş.
Kuvvet: 0-15 N kadranlı alette "40 N" okutulmuş; üçüncü çizgi 10 iken etiket "5 N".

**Kök kusur:** dünya kilidi koddan emit edilmiyor, her karede elle kopyalanıyor → prompt kalitesi
"o bloğu kim yazdı"ya bağlı.

### 5 · Linter yeniden yazıldı (commit `f1a9883`)
Eski linter **kalıbı** ölçüyordu, **işlevi** değil.

**Susan sahte alarmlar (ölçüldü):**
| Ne | Kaç sahte |
|---|---|
| `canli` — "Three physics beats" ailesi kabul edildi | 83 (Sürtünme 31 + Bileşke 52) |
| `sheen` — artık yalnız TENE yakınsa tuzak | ~45 |
| tuzaklar kuyruğu değil KARE-ÖZEL gövdeyi tarıyor | (yukarıdakinin kökü) |
| referans-edit bloğu slot taşımaz | 8/blok |
| "No person enters the frame" → ten kilidi sorulmaz | 13 |
| MOTION dosyası start-frame gibi lintlenmiyor | 58 karelik dosya |

**Eklenen gerçek ölçümler (eskiden HİÇ yoktu):**
- **NEGATIVE kare-özelliği** — satırın varlığı ölçülüyordu, işi ölçülmüyordu. Ayrım net:
  Üreme %100 · Sürtünme %100 · Sabit Sürat %23 · **Bileşke %0**.
- **STYLE kelime tavanı** — `\Z` JS'te yok, regex sessizce kırıktı, tavan HİÇ ateşlemiyordu.
  Ölçüldüğünde: Üreme 86-116 · Sabit Sürat 68-116 · Sürtünme 125 · **Bileşke 148-243**.
- **text-hece** — yazı taşıyan karede harf-harf + diakritik (revizenin %35'i bu sınıf).
- `--all` artık ADA değil **İÇERİĞE** bakıyor: sidecar ve tekil kare dosyaları da taranıyor.

**Üç kat:** KIRMIZI (kanıtlı) · SARI (ajan baksın, iddia değil) · KAPSAM (ölçülmeyenler yazılı).

**Ayırt etme kanıtı (Codex denetimi sonrası düzeltilmiş sayılar):**
| | Üreme (en iyi) | Bileşke (52 revize) |
|---|---|---|
| temas | 50/50 | 0/52 |
| text-hece | 14/14 | 0/14 |
| NEGATIVE kare-özel | %100 | %0 |
| STYLE kelime | 86-116 | 148-243 |

### 6 · Beş giriş kapısı (commit `51f09e2`)
1. `AGENTS.md`+`CODEX.md` 1337 satırlık arşivi "her oturumda oku" diyordu → `current-work.json`.
2. `mamilas-director` ↔ `mamilas-uret` aynı tetikte çarpışıyordu → ayrıldı.
3. `current-work kapat` **sıfır ön koşulla** kapatıyordu → eksik kit/medya/bloke/açık karar varsa kapanmıyor.
4. KİT matcher'ı yalnız `kaba-kurgu.xml` arıyordu; gerçek adlar `— kaba kurgu.xml` ve `_KURGU.xml`.
5. `buddy.mjs` hiperfokus guard'ı **AND** olarak duruyordu → yükün en yüksek olduğu tek durumda
   susuyordu. Artık erteleyici: 120 dk bitişik aktif sürede guard düşer.

**Sürpriz bulgu:** kayıt bayatmış — VO üretilmiş (10:32 · 11:13), `KURGU.xml` yazılmış (11:15),
Premiere render alınmış (**Üreme.mp4 504 MB, 11:41**). Kayıt diske hizalandı.

### 7 · Giriş sözleşmeleri üretime kuruldu (commit `80897c4`, `5f6c5aa`)
`CLAUDE.md` · `AGENTS.md` · `faz-icraat.md` · `.claude/rules/core-prompt-path.md`.
Düzeltilen **yanlış** ifadeler:
- *"Site ve src/core deterministik karar akışı doğruluk kaynağıdır"* → **site TARİF üretir, prompt'u AJAN yazar.**
- *"Bu dosyalar motor prompt'unu üretir"* (katman yasası) → üretmiyorlar; oradaki düzeltme bugün
  teslim edilen hiçbir kareyi değiştirmez.
- *"gerçek `generateBatch` çıktısı üret ve gözle oku"* → o metin motora gitmiyor; kanıt **teslim metnidir**.
- Durum kaydı `EXECUTION_STATE` → `current-work.json`.

### 8 · Hafıza üretime temizlendi (commit `b42ea6d`)
13 inşa kaydı `archive/`e taşındı (silme yok), 13 bayat satır düzeltildi, MEMORY.md **71 → 56 satır**.
11 dosyada arşive giden ölü `[[wikilink]]` canlı karşılığına çevrildi. İki depo eşit (35/35).

### 9 · Öğrenme halkası — oy pusulası (commit `d947b01`)
47 aday → **12 ders**. Bankanın neden boş kaldığı ortaya çıktı: adayların çoğu **ders değildi**,
PROMPT-YASASI'nda zaten yazılıydı (elenen 10 maddenin 9'u bu sebeple). `agents/lessons/ONAY-BEKLEYEN.md`
— Mami her satıra ✅/❌ koyar, ajan taşır. `APPROVED.md`'ye dokunulmadı.

### 10 · Dünya kilidi emitter'ı (commit `3640aa1`)
`node scripts/dunya-kilidi.mjs <worldId>` → yapıştırmaya hazır STYLE / LIGHT AND PALETTE / NEGATIVE.
Süpürme: **46/46 dünya · çökme 0 · tavan aşan 0 · ham hex 0** · STYLE 68-90 kelime (ort. 86).
Dürüst eksik: `overscale` kilidi 90 kelimelik bütçeye sığmıyor (kütüphanenin sorunu) · puanlama
sezgisel · vitest yüzeyi yok.

Aynı turda: lint raporu tekrar eden kusuru tek satırda topluyor (Kuvvet'te 45 satır → 1 mesaj) ·
`Kuvvet ve Kuvvetin Ölçülmesi`'ndeki iki rakip teslim `HASAT.json` ile BEYAN edildi (dosya
silinmedi), hasat 🔴 → ✅ · kapı bir testin diskin eski halini kilitlediğini yakaladı, test
silinmedi, **mekanizmayı** ölçecek hale getirildi + yeni negatif test eklendi.

### 11 · BAĞIMSIZ DENETİM — codex (ikinci göz)
`codex exec -s read-only` ile bugünün tüm commit'leri denetlendi. **11 bulgu, 7'si gerçek.**
Hepsi kapatıldı:

| # | Bulgu | Sonuç |
|---|---|---|
| 1 | `dunya-kilidi.mjs` HEAD'de yok (untracked) | commit edildi |
| 2 | MOTION tespiti dar — 58 bloğun 51'i hâlâ start-frame sayılıyordu | **dosya düzeyi** tespite geçildi: `STYLE:` taşımayan dosya start-frame dosyası değildir |
| 3 | `kare-özel oran` dosya uzunluğuna duyarlı | **KIRMIZI'dan SARI'ya düşürüldü** — aşağıya bak |
| 4 | Bileşke `FIREWALL NEGATIVE:` yazıyor, linter göremiyordu | desen genişletildi → neg 0/52 → **52/52** |
| 5 | `face` deseni **`surface`** içinde eşleşiyor | `\b` eklendi — yüzey sheen'i artık ten kusuru sayılmıyor |
| 6 | temas ailesi `contact plane touching` / `surfaces MUST touch` kabul etmiyordu | eklendi → Sürtünme 1/31 → 5/31 |
| 7 | `bearsText` `"200 g"` gibi yazıyı kaçırıyordu | sayı+birim deseni eklendi |
| 9 | kapanış kapısı `deliverablesOverride` ile `--zorla`sız atlatılabiliyordu | **kapıda override kaldırıldı** — kapı yalnız diski okur |
| 10 | buddy "blok başına tek teklif" garantisi yanlış | yorum **dürüst sınıra** çekildi: 45 dakikada en fazla bir teklif |

**En değerli bulgu — kendi metriğimi çürüttü.** `kare-özel oran` revizeyi **ters yönde**
"öngörüyordu": 52 revize alan Bileşke %97, az revize alan Sürtünme %47. Doğrulanmamış bir metriği
kırmızı yakmak, tam da bu linterde söktüğüm hastalık olurdu. SARI'ya düşürüldü ve dosya başlığındaki
iddia silinmedi, **düzeltildi**. Gerçekten ayıran iki metrik kaldı: NEGATIVE kare-özelliği ve
STYLE kelime tavanı — ikisi de revize sırasıyla aynı yönde.

**Kapı:** `tsc` 0 hata · `vitest` **2196 PASS / 0 FAIL** · `build` OK.

---

## DÜRÜST SKOR — ölçüleni say, ölçülmeyeni sayma

Puanlama kuralı: **kanıtı olmayan boyuta puan verilmez.** Yeşil test kalite kanıtı değildir.
Puanlar rubriksizdir ve mühendislik hükmüdür — Codex bunu haklı olarak işaretledi; sayı değil
yanındaki **kanıt sütunu** okunmalıdır.

| Boyut | Önce | Şimdi | Kanıt |
|---|---|---|---|
| Kapanış dürüstlüğü | 10 | **92** | sıfır koşuldan dört koşula; canlı test ⛔ verdi; override kaçağı kapatıldı |
| Skill / capability paritesi | 40 | **90** | **83 vaka**: içerik paritesi · frontmatter · atıflar gerçek mi · `node <x>.mjs` çalışıyor mu · hook hedefi + exec biti. `node`+args biçimindeki iki hook'un kör noktası kapandı |
| Oturum açılışı / durum doğruluğu | 25 | **88** | 1337 satır → 35 satırlık disk-ölçümlü kayıt; drift uyarıları sıfırlandı |
| Ölçüm duvarı (prompt-lint) | 30 | **85** | ~200 sahte alarm sustu · 7 bağımsız denetim bulgusu + 1 ajan bulgusu kapatıldı · **26 test** · heceleme doğrulaması eklendi. **Magnific kalibrasyonu hâlâ eksik** |
| Dünya kilidi tutarlılığı | 25 | **85** | 46/46 dünya süpürüldü, ham hex 0, STYLE ort. 86 kelime, 5 test. `overscale` bütçeye sığmıyor |
| Yük duvarı (buddy) | 20 | **85** | Guard erteleyici; 20+ davranış testi yeşil; garanti dürüst sınırına çekildi |
| Öğrenme halkası | 10 | **45** | 47 aday → 12 satırlık oy pusulası · okuma tarafı sağlam ölçüldü · sessiz kayıp duvara çevrildi (kanıtla sınandı). **Halka Mami ✅ koyana kadar kapanmaz** |
| Kör tercih (A/B) | — | **KANIT YOK** | tek kör karşılaştırma yapılmadı |
| Revize azalması | — | **KANIT YOK** | yeni kapılarla tek video üretilmedi |
| Cross-world | — | **KANIT YOK** | 46 dünyanın 45'i hâlâ kare görmedi |

**Ölçülen 7 boyutun ortalaması: 81,4 / 100 → dürüst hüküm: 81 / 100.**
(Oturum başı 72 → bağımsız denetim +6 → ölçüm testleri ve capability duvarı +3.)

Bu tavan üç boyutta **sıfır kanıt** olduğu için yükseltilemez. 90-95 bandı, yeni kapılarla
**gerçek bir video üretilip** revize sayısı ölçülmeden iddia edilemez; o iddiayı bugün yazmak
"yeşil ama boş" kapısının kendisi olurdu.

**90-95'e giden üç şey, sırayla:**
1. Magnific'teki Üreme promptları → lint kalibrasyonu kapanır *(Mami'de)*.
2. `agents/lessons/ONAY-BEKLEYEN.md`'ye 12 ✅/❌ → öğrenme halkası kapanır *(Mami'de)*.
3. Yeni kapılarla bir video → revize azalması ölçülür *(4 video sırada)*.

## Mami döndüğünde bilmesi gerekenler

- **Video bitmiş görünüyor:** Üreme render'ı alınmış (504 MB, 11:41). Kayıt "Mami onayı bekliyor" diyor.
- **Kit'te MOTION eksik** — 50 klip üretilmiş ama `_MOTION.txt` hiç yazılmamış. Kapanış onda duruyor;
  gerçekten kabul ediliyorsa `node scripts/current-work.mjs kapat --zorla`.
- **INBOX boş.** 4 video için 4 kaynak (senaryo/docx) getirmen gerekiyor.
- **`Kuvvet MİRA` klasörü ERROR** — promptları kardeş klasörde (`Kuvvet ve Kuvvetin Ölçülmesi`).
  İki klasör aynı videonun iki sürümü. Birleştirme senin kararın; ajan dosyanı taşımaz.
- **Yeni araç:** `node scripts/dunya-kilidi.mjs pixar_3d_edu` → STYLE kuyruğunu artık elle yazma.
