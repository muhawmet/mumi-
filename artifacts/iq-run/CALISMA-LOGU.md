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
- **kare-özel oran** — Bileşke %35 → 52 karenin 34'ü revize. Tek sayı, en güçlü sinyal.
- **NEGATIVE kare-özelliği** — Bileşke 52/52'de NEGATIVE VAR ama kare-özel **%0**.
- **text-hece** — yazı taşıyan karede harf-harf + diakritik (revizenin %35'i bu sınıf).
- **STYLE kelime tavanı** artık gerçekten ölçülüyor (`\Z` JS'te yok — regex sessizce kırıktı).
- `--all` artık ADA değil **İÇERİĞE** bakıyor: sidecar ve tekil kare dosyaları da taranıyor.

**Üç kat:** KIRMIZI (kanıtlı) · SARI (ajan baksın, iddia değil) · KAPSAM (ölçülmeyenler yazılı).

**Ayırt etme kanıtı:**
| | Üreme (en iyi) | Bileşke (52 revize) |
|---|---|---|
| temas | 50/50 | 0/52 |
| text-hece | 14/14 | 0/14 |
| NEGATIVE kare-özel | %100 | %0 |
| STYLE sürüm | 1 (20 kelime) | 7 (189-284 kelime) |

### 6 · Beş giriş kapısı (commit `51f09e2`)
1. `AGENTS.md`+`CODEX.md` 1337 satırlık arşivi "her oturumda oku" diyordu → `current-work.json`.
2. `mamilas-director` ↔ `mamilas-uret` aynı tetikte çarpışıyordu → ayrıldı (director = İCRAAT varsayılanı).
3. `current-work kapat` **sıfır ön koşulla** kapatıyordu → eksik kit/medya/bloke/açık karar varsa kapanmıyor (`--zorla` kaçışı).
4. KİT matcher'ı yalnız `kaba-kurgu.xml` arıyordu; gerçek adlar `— kaba kurgu.xml` ve `_KURGU.xml`.
5. `buddy.mjs` hiperfokus guard'ı **AND** olarak duruyordu: 3 saat kesintisiz çalışıp her 2-3 dk
   prompt atınca pencerede daima ≥3 prompt bulunur → teklif **HİÇ** doğmaz. Duvar, yükün en yüksek
   olduğu tek durumda susuyordu. Artık **erteleyici**: 120 dk bitişik aktif sürede guard düşer,
   ısrarsızlık (45 dk) ve doğal boşluk düşmez.

**Sürpriz bulgu:** kayıt bayatmış — VO üretilmiş (10:32 · 11:13), `KURGU.xml` yazılmış (11:15),
Premiere render alınmış (**Üreme.mp4 504 MB, 11:41**). Kayıt diske hizalandı.

### 7 · Giriş sözleşmeleri üretime kuruldu (commit `80897c4`)
`CLAUDE.md` · `AGENTS.md` · `faz-icraat.md`. Düzeltilen **yanlış** ifadeler:
- *"Site ve src/core deterministik karar akışı doğruluk kaynağıdır"* → **site TARİF üretir, prompt'u AJAN yazar.**
- *"gerçek `generateBatch` çıktısı üret ve gözle oku"* → o metin motora gitmiyor; kanıt **teslim metnidir**.
- Durum kaydı `EXECUTION_STATE` → `current-work.json`.

Eklenen yasalar: arşiv kıstas değil · üretimden önce ölç (`dunya-kilidi` → yaz → `prompt-lint` → bas) ·
yeşil ≠ temiz · kapanış ölçülür.

**Kapı:** `tsc` 0 hata · `vitest` **2195 PASS / 0 FAIL** · `build` OK.

---

## DÜRÜST SKOR — ölçüleni say, ölçülmeyeni sayma

Puanlama kuralı: **kanıtı olmayan boyuta puan verilmez.** Yeşil test kalite kanıtı değildir.

| Boyut | Önce | Şimdi | Kanıt |
|---|---|---|---|
| Oturum açılışı / durum doğruluğu | 25 | **88** | 1337 satır → 35 satırlık disk-ölçümlü kayıt; drift uyarıları sıfırlandı |
| Ölçüm duvarı (prompt-lint) | 30 | **72** | ~200 sahte alarm sustu; 4 yeni gerçek ölçüm; Üreme↔Bileşke ayrımı net. **Magnific kalibrasyonu eksik** |
| Kapanış dürüstlüğü | 10 | **90** | `kapat` sıfır koşuldan dört koşula; canlı test ⛔ verdi |
| Yük duvarı (buddy) | 20 | **85** | Guard erteleyici; 20+ davranış testi yeşil |
| Skill tetik netliği | 40 | **85** | director/uret çakışması ayrıldı, ikizler eşit |
| Dünya kilidi tutarlılığı | 25 | **ölçülmedi** | emitter yazılıyor, doğrulanmadı |
| Öğrenme halkası | 10 | **10** | `APPROVED.md` hâlâ **sıfır ders**; 6 hasat dosyası bekliyor. **Dokunulmadı** |
| Kör tercih (A/B) | — | **KANIT YOK** | tek kör karşılaştırma yapılmadı |
| Revize azalması | — | **KANIT YOK** | yeni gate'lerle tek video üretilmedi |
| Cross-world | — | **KANIT YOK** | 46 dünyanın 45'i hâlâ kare görmedi |

**Ölçülen 6 boyutun ortalaması: 71,7 / 100.**
**Dürüst toplam hüküm: 72 / 100** — ve bu tavan, üç boyutta **sıfır kanıt** olduğu için
yükseltilemez. 90-95 bandı, yeni kapılarla **gerçek bir video üretilip** revize sayısı ölçülmeden
iddia edilemez; o iddiayı bugün yazmak "yeşil ama boş" kapısının kendisi olurdu.

**90-95'e giden üç şey, sırayla:**
1. Magnific'teki Üreme promptları → lint kalibrasyonu kapanır (Mami'de).
2. `APPROVED.md`'ye ders taşınması → öğrenme halkası kapanır (Mami onaylar, ajan taşır).
3. Yeni kapılarla bir video → revize azalması ölçülür (4 video sırada).
