# CANARY ÖNERİSİ — 8 klip · Destek ve Hareket

> **Bu bir öneridir, karar değil.** Hükmü Mami verir. 44 klip bu 8'in sonucuna bağlı
> (`current-work.mjs` kodla zorluyor: canary kilidi yoksa `uretim` fazı açılmıyor).

---

## ÖLÇÜM — nasıl seçildi

İlk deneme **başarısız oldu ve kayda geçiyor**: prompt metinlerinde `yazı / anatomi /
katı nesne` regex'i **52/52 karede** ateşledi. Sebep, dünya kilidinin standart metni ve
dersin konusu — bu videoda kukla ve iskelet her karede var. **Yoğunluk ayırt etmiyorsa
risk değildir.** İkinci ölçüm ayırt eden sinyallere indi:

| sinyal | kareler | neden ayırt ediyor |
|---|---|---|
| **AGY-bozuk** | K1 · K4 · K7 · K8 | basılmış, izlenmiş, kusuru **saniye saniye tarif edilmiş** |
| **TR-yazı** (ekranda görünen Türkçe) | K11 · K25 · K33 · K37 · K41 | harf eriyor mu — Kling'in ölçülmüş en pahalı kusuru |
| **gerçek kamera hareketi** | K24 · K28 · K31 | kamera + katı gövde = warp riski |
| ~~eklem~~ | 38 kare | **ayırt etmiyor** — dersin konusu bu, sinyal değil |

---

## SEÇİLEN 8 KLİP

| # | kare | neden bu kare |
|---|---|---|
| 1 | **K1** | Intro **ve** AGY-bozuk. AGY tarifi: *"kukla yürüdü, eklemleri büküldü, boyu değişti."* Aynı kare yeniden basılınca **doğrudan öncesi/sonrası** çıkar. |
| 2 | **K4** | AGY-bozuk. *"kukla zaten yığılmış, 5 sn boyunca el titredi, kamera süründü."* Olay-eşiği hipotezinin en saf sınaması. |
| 3 | **K7** | AGY-bozuk. *"kol uzadı, el eridi, son karede yüz değişti."* Anatomi + morph. |
| 4 | **K8** | AGY-bozuk **ve Mami'nin "plastik" hükmünün kaynağı.** AGY: kız duruyor, **kukla bacaklarını büküyor** — hareket yanlış öznede. Shot Card'ın `KAHRAMAN↔DEĞİŞİM` kuralı tam bunu sınıyor. |
| 5 | **K11** | Ekranda Türkçe yazı. Harf erimesi burada görünür. |
| 6 | **K31** | Gerçek kamera hareketi + katı gövde. Warp riski. |
| 7 | **K37** | İkinci Türkçe yazı karesi — tek kare bir sınıfı kanıtlamaz. |
| 8 | **K41** | Türkçe yazı **artı** bilinen teslim deliği: `teslim-denetim` *"VO ÖRTÜLMEMİŞ — 1/54 cümlenin karesi yok: K41"* diyor. Canary bunu da yüzeye çıkarır. |

**Dört klip (K1·K4·K7·K8) bilerek eski bozuklardan seçildi.** Canary'nin işi "güzel klip
üretmek" değil, **hipotezi sınamak**; sınama ancak karşılaştırma varsa sınamadır. Kalan
dördü projenin pahalı risklerini kapsar.

---

## SINANAN TEK DEĞİŞKEN

Codex Sol'un yaması: *"her sonuçta hangi değişkenin test edildiği açık olacak."*

**Bu turda sınanan: `BAŞLANGIÇ` eşiği — start-frame olayın ÖNCESİNDE mi duruyor?**

Diğer üç değişken bu turda **sabit tutulur**:
- **silent tail** — var (kanıtlı korpusta 107/107; T2 kırmızı duvarı)
- **motion uzunluğu** — KANON'un mevcut bandı (216-297), değiştirilmez
- **klip sonu** — mevcut hâli korunur; `_LEHCE:53` ↔ `CANARY-MOTION:22` çelişkisi
  **bu turda çözülmez**, bir sonraki tura bırakılır

> Aynı anda dört değişkeni oynatmak, bu sabah tam olarak yapılan hataydı: bir ölçüm →
> üç değişiklik → hangisinin işe yaradığı bilinmiyor.

---

## AGY'NİN NE ARAYACAĞI — taban çizgisi hazır

`~/Desktop/mamiş/02-AGY-REVIEW.md` dört klibin **saniye saniye tarifini** taşıyor.
Yeni klipler geldiğinde aynı altı soru sorulur ve yan yana konur:

| ölçülecek | bugünkü taban |
|---|---|
| morph başlangıç saniyesi | K1/K8'de **1-2. saniye**, uzuv ve eklemde |
| ağız hareketi | **2/3 klipte var** (kuyruk yazılıyken bile) |
| nesne sayısı sabit mi | 3/3 sabit ✅ |
| olay eşiği | 3/3 *"klip boyunca gerçekleşiyor"* |
| kavram ışığı | **2/3 klipte istenmeden ateşledi** |

---

## SIRA — kilit doğana kadar

1. Bu seçki Mami'ye **onaylanır** (ya da değiştirilir)
2. 8 kare için **Shot Card** yazılır → `SHOTS/` → `shot-card-lint` kırmızı 0
3. Kareler basılır, **Read ile açılır**, temiz olanlara frame-aware motion yazılır
   (bozuk olan `🔴 MOTION INTENT` kalır)
4. `frame-imza.mjs --yaz` ile 8 blok imzalanır
5. Codex Sol karşı-denetimi (`high`) — `CLEAR / RESHAPE / NARROW / UNPROVEN`
6. 8 klip basılır → **AGY tarif eder** → Sol çürütür → **Mami hüküm verir**
7. `_CANARY-LOCK.md` doğar → `ilerle --faz uretim` açılır → 8-12'lik paketler

**44 klip 6. adıma kadar yasak.**
