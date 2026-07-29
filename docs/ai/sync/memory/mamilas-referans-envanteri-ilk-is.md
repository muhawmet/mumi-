---
name: mamilas-referans-envanteri-ilk-is
description: "Mami'nin duran kuralı — projeye başlarken tekrar eden her şeyin referansı ÖNCE çıkarılır, tek kare yazılmadan. Kanon: PROMPT-YASASI §4a."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: fbff88be-4a01-42c5-8144-26fb9e4d6996
  modified: 2026-07-28T21:34:06.027Z
---

Mami, 2026-07-29: *"Projelere başlarken tekrar eden şeylerin referanslarını oluştur,
kural olsun bu sana."*

Duran talimat. Tek kare yazılmadan önce VO + edit planı taranır; **iki ya da daha fazla
klipte geçen her şey** (karakter, hero-prop, tekrar eden mekân) envantere girer ve
`<Ad>_REFERANSLAR.txt` promptlardan ÖNCE yazılır. Üç kova: zaten tag'li (basılmaz, yalnız
kullanım kuralı) · basılacak (prompt + ilk geçtiği kare + aralık) · tarif kilidi (küçük prop).

**Why:** referans yolda kararlaştırılırsa aynı nesne her karede yeniden tarif edilir, tarifler
tutmaz. Ölçüldü — 50 karelik bir derste imla 50/50 temizken **kusurun tamamı süreklilikteydi.**
Ayrıca envanter tablosu hangi sekansın hangi referansı beklediğini gösterir: Bileşke'de bu tablo
çıkınca INTRO'nun hiç yeni referans istemediği görüldü, Mami 16 kareyi beklemeden bastı.

**How to apply:** enzim kilitleri kapanır kapanmaz envanteri çıkar, Mami'ye "şunlar basılacak,
şunlar zaten var" diye tek tabloyla göster. Referans dosyası klip numarası taşır — **edit planı
klip sayısına dokunduysa referans dosyası yeniden numaralanır**, yoksa sessizce yalan söyler
(Bileşke v1'de `@kitap → K32-K37` yazıyordu, v2'de o numaralar başka kareler oldu).

Kanon: `agents/PROMPT-YASASI.md` §4a · akış satırı `docs/ai/faz-icraat.md`.
İlgili: [[mamilas-magnific-char-refs]] · [[mamilas-uretim-dersleri-2026-07-28]] · [[mamilas-uretim-akisi]]
