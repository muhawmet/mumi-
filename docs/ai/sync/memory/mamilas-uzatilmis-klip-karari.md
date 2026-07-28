---
name: mamilas-uzatilmis-klip-karari
description: "Klip VO'dan kısaysa YAVAŞLATILMAZ — uzun üretilir. Mami'nin kalite kararı, 2026-07-28"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 22381bee-fca3-453f-a7ce-d1d385abc524
  modified: 2026-07-28T13:49:35.841Z
---

**Klip VO cümlesinden kısa kaldığında çare yavaşlatmak DEĞİL, klibi uzun üretmektir.**

Mami (2026-07-28): *"Bölme olayı çok bozdu, mesela şaheser olabilirdi bu video. İstersen
extended üreteyim o sahneleri, hiç yavaşlatmakla uğraşmayalım."*

**Why:** Kütle'de 11 klip VO'dan kısaydı; en ağırı K08 (cümle 10.2s, klip 5s → %49 hız).
Yavaşlatma tırtığı (kararan ekran) kapatıyor ama hareketi sakatlıyor. Portfolyo kıstası
*"bunu bir müşteriye gösterir miyim"* — %49 hızda sürünen bir klip o testi geçmez. Kling 3.0
zaten 3-15s destekliyor; uzun üretmek bedava, yalnız süre alanı değişir, **motion promptu aynı kalır**.

**How to apply:**
- Kaba kurgu "yavaşlatıldı" satırı bastığında bunu bir **üretim işi** say, kurgu çözümü değil.
  Hedef süreler zaten ölçülü çıkıyor (whisper); o listeyle Kling'e dön.
- **Üretimden ÖNCE:** 10 saniyelik VO beat'ine 5 saniyelik klip planlanmaz. İki yol, ikisi de
  enzim aşamasında kararlaştırılır: (a) beat'i iki kareye böl — merge etme, (b) o kareyi baştan
  uzun üret. Kütle'de 4 birleşik beat (K08/K23/K32/K35) bu yüzden sorun oldu.
- Yavaşlatma yalnız **acil durum** tamiri; varsayılan değil.

İlgili: [[mamilas-kaba-kurgu-hatti]] · [[mamilas-enzim-hiz-yonergesi]] · [[mamilas-upwork-portfolyo-hedefi]]
