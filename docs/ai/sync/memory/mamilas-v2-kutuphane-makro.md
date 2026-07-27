---
name: mamilas-v2-kutuphane-makro
description: "V2'nin asıl darboğazı kelime kusuru değil doğrulama maliyeti; 46 dünyanın 45'i hiç kare görmedi — çözüm ortak 5-kare sınav seti."
metadata: 
  node_type: memory
  type: project
  originSessionId: 71fe7584-526c-45ce-9f37-417c622275b3
  modified: 2026-07-25T22:37:15.141Z
---

MAMILAS V2 (2026-07-26 itibarıyla): kütüphane **46 dünya · 130 ref · 12 palet**, ama yalnız
**1 dünya doğrulanmış** — `pixar_3d_edu` (+ `vibrant_edu` paleti + 3 ref). Teslim edilmiş
103 gerçek kare bu tek dilimden çıktı. Kâğıtta kütüphane TAM (46/46 dünya sekiz katmanı da
taşıyor, 120 ref 6+ cümlelik dna'ya sahip) — eksik olan kalite değil KANIT.

**Asıl darboğaz:** bir dünyayı doğrulamak bugün ~50 kare Mami'nin elinden geçiyor
(45 dünya = 2.250 kare = hiç olmayacak). Kelime tuzakları, negatif yığını, boş cast bu
sayının yanında gürültü.

**Makro çözüm (Mami'ye sunuldu, karar bekliyor):** doğrulamayı üretimden AYIR — her dünyada
AYNI 5 beat'lik **sınav seti** (yakın plan yüz · el-aksiyonu · yazılı yüzey · geniş mekân ·
iki karakter+prop). 5×45 = 225 kare, hafta sonu işi. Aynı beat olduğu için dünyalar
KIYASLANABİLİR hale gelir. İkinci şart: karenin kütüphaneye **geri yazılması** — bugün döngü
yarım, hata .txt'de ölüyor. Üçüncüsü: 46 dünya muhtemelen yanlış sayı; doğrulanmış 8 dünya
bilinmeyen 46'yı döver.

**Mami'nin uyarısı (2026-07-26):** "makro diyorum mikroya takılıyorsun, büyük düşün" — ve
"regex falan yok kral": kusur prompta yama ile değil KÜTÜPHANEDE düzeltilir; koruma testte
yaşar, kod katmanında değil. Bir kelimeyi çıkışta yakalayan katman kütüphaneyi yanlış
bırakıp semptomu gizler.

Durum kaydı: `docs/KUTUPHANE-KARNESI.md` (komutla üretilir: `scripts/kutuphane-karne.ts`).
Receipt: `artifacts/decision-pipeline-implementation/receipts/V2-FAZ-0.md`.
İlgili: [[mamilas-uretim-akisi]] · [[mamilas-nb2-hata-katalogu]] · [[mamilas-site-tarif-ajan-prompt]]
