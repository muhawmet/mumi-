---
name: mamilas-motor-gercekleri
description: "Kling 3.0 ve NB2'nin kliple/kareyle ölçülmüş gerçekleri — 2026-07-31, iki video ve 90 klip üstünde"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 3a570c66-5bb4-4fd7-95e0-2754582958c2
  modified: 2026-07-31T12:56:21.367Z
---

**Hepsi ölçüldü, hiçbiri tahmin.** Kaynak: `artifacts/denetim-2026-07-31/BULGULAR.md`,
`agents/PROMPT-YASASI.md` §3 · §3ø · §3a. Ölçenler: `scripts/prompt-lint.mjs` (kapıda),
`scripts/motion-lint.mjs`, `scripts/vo-nefes-kirp.mjs`, `scripts/seslendirme-tek-blok.mjs`.

## KLING 3.0 — hikâye ister, kural listesi değil
Mami'nin cümlesi: *"Kling'i neden düşman gibi gördük ki, onunla ahenkle üretmek gerekiyor."*
Resmi kılavuz: **60 kelime altı, tercihen 25-45**, ve *"görselde zaten görünen şeyleri yeniden
tarif etme."* Altın standardımız 202 kelime; reddedilen set 260. Bizim bandımız **190-215**
(iki kanıtlı-iyi korpusla kalibre) — **45 ile 202 arası SINANMADI**, bir sonraki videoda iki
klip denenecek.

- 🔴 **Donuk gövde = eriyen yüz.** 34 klibin **26'sında (%76)** aynı kusur: gövde heykel gibi
  durur, buna karşılık göz-çene-el sıvı gibi akar. Motora "kıpırdama" dendiğinde bir şey
  üretmek zorunda kalıp yüzü eritiyor. **Kilit klibin ilacı değil hastalığı.**
- 🔴 `half a second later` ve her saat cümlesi **SNAP** üretiyor. Sıçramalar `1.6s`-`3.5s`
  arasında kümeleniyor. Sebep bağlacı kullanılır: `Then… — at that instant…`
- 🔴 **Yazı, taşıyıcısı hareket ettiği an eriyor.** Kamerayı uzak tutmak YETMİYOR. Ve ölçüldü
  (2026-07-31, 56 klip): çuval, poşet, sırt, sallanan levha gibi **doğası gereği hareketli**
  taşıyıcıda yazı kilide rağmen gitti (KÖMÜR, EKMEK, PARK ETMEYİN). Yazı **duran** yüzeye
  konur: emaye plaka, duvar, düz kart, gergin bez.
- 🔴 Kimse yazmaz (`writes`/`traces` yasak fiil), kimse konuşmaz, nesne el değiştirmez.
- **Temiz çıkan kliplerin reçetesi** (34'ten 3'ü): karmaşık uzuv hareketi yok · mikro jest
  (yaprak, ışık, nefes) · kamera sabit ya da çok düşük genlikli.
- Klip **5s değil 6s** üretilir: 5s'lik klipten baş 0.5s kırpılınca 4.54s kalıyor ve uzun
  cümleler sığmıyor, yavaşlatma gerekiyor. **Yavaşlatma yasak** — gerilmiş klip kekeliyor.

## NB2 (Nano Banana 2) — kareyi o kurar, motion'ı Kling bozar
- 🔴 **Referansta tarif edilmeyen şey karede DOĞMAZ.** `@derin`'in sandalyesi "scuffed
  footplate"e kadar yazılmıştı, ayakları hiç yazılmamıştı → üç karede ayaklık boş çıktı.
  Kural: nesne tarif ediliyorsa üstündeki beden parçası da yazılır.
- 🔴 **"Şu yazıyı KALDIR" fix'i çalışmıyor**, üstelik kelimeyi adıyla anmak onu ÇAĞIRIYOR.
  Doğrusu: **ne yazacağını harf harf söyle.** NB2 Türkçe diakritikleri basabiliyor —
  `RAMPA · ÇÖP · LAMBA` ve 42 harflik `SORUNLARI FARK EDER, ÇÖZÜMLERİ BİRLİKTE ÜRETİRİZ`
  kusursuz çıktı. Boş kalması gereken satır da açıkça yazılır.
- 🔴 **NB2 nesne üretir, DARLIK üretmez.** "Bir beden genişliğinde yarık" cümlesi işe
  yaramıyor; motor karakteri çizip etrafına bol boşluk bırakıyor. Sıkışıklık **kadrajla**
  zorlanır: kamera olayın hizasına iner, aralığın iki yanındaki kütleler kadrajı keser.
- 🔴 **Kadrajdan kesik figür yazılmaz** — `cut by the frame`, `a pair of shoes` → havada uçan
  bacak ve çanta. Kalabalığı azaltmak için figür KESİLMEZ, figür SAYISI azaltılır.
- **Boş yüzey = uydurma İngilizce.** Yasak durdurmuyor; yüzey **giydirilir** (kapalı kepenk,
  sarılı tente, ters çevrilmiş kâğıt, göğe eğik cam).
- **Yazı yükü = maliyet.** Ölçüldü: altı yazı yüzeyli blok 3 dokunma/4 revize/3 baştan;
  yazı yükü düşük blok **9/2/0**. Aynı gün, aynı motor.
- **Tek yüzeyde** birden çok kısa kelime olur (defter sayfası üçünü tuttu); **ayrı
  yüzeylerde** olmaz (üç kapaklı kutu iki karede de kırıldı).
- Türetilen kare ancak fark **piksel kaplıyorsa** çalışır; mikro poz farkı için türetme yapılmaz.

## KARENİN ÇITASI — "oyuncak şehir"i öldüren dört karar
Codex'in pilot teşhisi: *"her şeyi eşit anlatan oyuncak şehir."*
1. Karede **tek dramatik fikir** + adı konulmuş **baskın geometri**
2. Generic `LIGHT AND PALETTE` bloğu YOK — renk sahnenin kendi malzemesinden doğar
3. **Üç katmanlı derinlik + ön plan örtmesi** (dekor hissini öldüren tek şey)
4. Karakter **kameraya poz vermez** — iki adım arasında, işine dalmış

🔴 **Ve Codex'in en iyi fikri:** start frame aşamasında **bir sonraki fazın kısıtı** yazılır
(*"kalem görünse bile kimse okunabilir yazı yazmaz"*). Kare, motion'ın onu bozamayacağı
şekilde tasarlanır.

## MAMİ'NİN KISTASI — üç şey, başkası değil
**sahneyle uymuyor · bozuk yazı · yanlış şey.** Süreklilik, palet, üslup revize sebebi
DEĞİL. "Arka planda biri donuk" da değil — ajan raporu 32 klibi bu yüzden çöpe atmak
istedi, Mami beşini de beğendi. **Ajanın doktrini Mami'nin kıstası değildir.**

En büyük tek red sebebi (139 revizenin 53'ü): **VO'nun fiilini yapan gövde karede yok.**

Bkz. [[mamilas-uc-katman-hukmu]] · [[mamilas-zevk-madeni]] · [[mamilas-nb2-hata-katalogu]]
