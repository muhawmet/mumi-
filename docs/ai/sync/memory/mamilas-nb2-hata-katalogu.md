---
name: mamilas-nb2-hata-katalogu
description: "Nano Banana 2'nin gerçek MAMILAS render'larında tekrar eden hataları ve bunları prompt anında kesen yazım — revize turunu siler."
metadata: 
  node_type: memory
  type: project
  originSessionId: 402573ea-0b6f-4610-bce6-43cd054564ff
  modified: 2026-07-25T12:01:46.211Z
---

Sürtünme (31 kare) + Bileşke Kuvvet (52 kare) **gerçek çıktılarından** damıtıldı (revize TUR-1 + TUR-2,
2026-07-25). Hepsi üretimden SONRA yakalandı; aşağıdaki yazımla **start-frame promptunda** kesilir.

**1. GÖMME/KABARTMA YAZI AYNALANIYOR.** Kitap kapağına embossed metin yazınca NB2 ters-yazdı
(okunmaz). → Prop'un ÜSTÜNE metin yazdırma; "clean dimensional raised Turkish label floating in the
air beside the object" de.

**2. `0` + `N` birleşiyor → "ON".** "R = 0 N" istedik, "R = ON" çıktı. → Sayı-birim arasını yazıyla
ayır: *"a zero, then a space, then the letter N"*. Newton değerlerinde hep boşluğu şart koş.

**3. NESNELER HAVADA YÜZÜYOR.** Kitap, tahta kutu masanın üstünde asılı kaldı. → Her duran nesneye
temas cümlesi: *"resting flat ON the table, in contact, casting a contact shadow."*

**4. GLOW YÜZE/CİLDE YAPIŞIYOR.** Kuvvet glow'u çocuğun suratında parladı. → *"the glow sits on the
object, never on skin or faces."* (Kuvvet = nesneye etki eder, ten değil.)

**5. SOĞUK PALET CİLDİ YEŞİLLİYOR.** `vibrant_edu`'nun cool-green highlight'ı @mira'nın cildine sızdı
(sistemik, birçok kare). → Soğuk highlight'lı paletlerde her karakter cümlesine
*"warm matte tan skin, never tinted green or grey"* ekle.

**6. ETİKET İKİZLENİYOR.** İki tane "20 N" çıktı. → *"exactly ONE label reading …"* yaz, sayıyı kilitle.

**7. KARAKTER ROL KAYMASI (character bleed).** Anlatıcı sahnede yalnız izleyecekken halatı çekti;
iten çocuk yanlış karaktere döndü. → Kimin ne yaptığını VE ne yapmadığını yaz:
*"@mira stands at the side watching, hands free; the two pullers are the boys."*

**8. TEKRAR EDEN PROP TAG'SİZSE SÜRÜKLENİR.** Kütüphane sekansında (6 ardışık kare) kitap her karede
başka renk (krem/bordo/lacivert). → **2+ karede görünen belirgin nesne = üretimden ÖNCE @tag.**
Bu maliyetli hata: 6 kare toptan revize oldu. `agents/PROMPT-YASASI.md` §2 (@tag disiplini)

**9. ARKA PLAN YAZILARI GARBLED + İNGİLİZCE.** "TÜRKİSH LE OR ALUR", "BHIN AGINLLAHI", "SCHOOL
LIBRAYLI", "BAKERI", "VILLAGE SCHOOL", "Solar System", anlamsız "BİLİM AÇIKLIĞI". → Dekorlu arka planda
poster/tabela **soft-focus + gövde metni YOK**; en fazla tek kısa doğru Türkçe kelime. Referans-edit'te
düzeltirken *"same soft blur, do not sharpen"* — yoksa NB2 bulanığı netleştiriyor.
`agents/PROMPT-YASASI.md` §2 (show/premium yasası)

**10. KELİME TUZAKLARI (JSON'dan sızar).** `saffron`→safran ÇİÇEĞİ, `bloom`→çiçek, `sheen`→plastik cilt.
Bileşke'de 6 karede glow yerine lotus/krokus çiçeği çizildi. → Hep *"soft round warm-golden GLOW of
light (luminous energy aura, no petals, no stem, no flower, no arrow)"*.
[[mamilas-command-json-blokajlari]] · [[mamilas-force-bloom-viz]]

Denetim sırası ve revize.txt biçimi: [[mamilas-uretim-akisi]] · Mami'nin kıstasları:
[[mamilas-mami-yonergeleri]]
