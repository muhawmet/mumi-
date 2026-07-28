# DERS ADAYLARI — 2026-07-28 · ekran yazısı yüzeyi ve tipografisi

> **Aday dosyasıdır.** `APPROVED.md`'ye yalnız Mami taşır. Otomatik promote yok.
> Kaynak: 6. Sınıf "Eşeyli ve Eşeysiz Üreme" prompt setinin ölçümü + Mami'nin aynı gün
> verdiği iki düzeltme.

## Nasıl bulundu

Mami: *"yazı konusunda çok cimrisin, biraz daha sahnede kullanabilirsin sahneyi vurgulamak
adına, o sahnenin direkt kendisiyle uyumlu olacak ama paso tahtaya çakıyorsun yazıyı."*

Ölçüm (50 kare, `PROMPTLAR/*.md`):

| durum | sayı |
|---|---|
| yazı hiç yok | **36 / 50** |
| yazı var | 14 / 50 |
| yazılı karelerde kullanılan **farklı çözüm sayısı** | **1** |

O tek çözüm birebir şuydu, on dört kez: *"blocky, raised, dimensional, warm-glowing
lettering standing on the desk/counter/table, never a flat overlay caption."* Kedilerin
yanındaki sehpaya pirinç harflerle ÇEŞİTLİLİK dikilmişti.

## Aday dersler

- **Cimrilik ve tekdüzelik aynı kusurdur.** Sistemin yazı için tek bir aleti varsa, o aleti
  hem nadir kullanır hem hep aynı şekilde. 36/50 boşluk ile 14/14 tekrar aynı kökten çıktı.
  Çözüm sayısını artırmadan kullanım sıklığını artırmak, gürültü üretir.

- **Kusur bir yasaktan değil, bir BOŞLUKTAN doğdu.** Yasa "ekran yazısı diegetik olsun"
  diyordu ama *hangi yüzeyde* ve *hangi harf karakteriyle* demiyordu. Tarif edilmeyen slot,
  ajan tarafından tek alışkanlıkla doldurulur. **Yasada tarif edilmeyen her slot, bir
  varsayılan üretir — ve o varsayılan görünmezdir.**

- **Lint yalnız "var mı" diye sorarsa tekdüzeliği göremez.** `TEXT:` satırı 14/14 mevcuttu,
  lint yeşildi, kusur kapının altından geçti. **Bir slotun VARLIĞINI ölçen kural, o slotun
  ÇEŞİTLİLİĞİNİ ölçmez.**

- **İki meşru yol vardır, üçüncüsü tembelliktir.** (a) sahnenin kendi nesnesinde yaşayan
  yazı — tohum paketi, fidan etiketi, defter sayfası, kavanoz bandı; (b) o ana yakışacak
  biçimde tasarlanmış ekran yazısı — nesneye basılı olmak zorunda değil. Mami'nin kendi
  düzeltmesi: *"illa nesneye olmak zorunda değil, ekrana yakışır olsun."* Yasak olan bu
  ikisi değil, her karede aynı jenerik hamle.

- **Harf karakteri de sahnenin malzemesidir.** Mürekkep kâğıda emer, damga plastikte parlar,
  kalem kâğıdın dokusunda atlar, tebeşir kenarı kırılır. Bunu yazmayan prompt, motor'a
  "yazı" değil "yazı fikri" verir.

- **Kavramın kendisi harf olabilir.** Revizede çıkan en güçlü kareler bunu yaptı:
  vejetatif üremede harflerin gövdesi odunsu sap olup yandan filiz verdi; rejenerasyonda
  on iki kum harften biri yeni sürmüş olarak daha soluk ve pürüzsüz duruyor; eşeysiz üremede
  buğulanmış cama parmakla açılan izler, arkadan gelen güneşle ışık olarak okunuyor.
  Bu üçü de tahtaya çakılmış bir kelimeden hem daha ucuz hem daha öğretici.

- **Kaba hedef: karelerin yaklaşık YARISI yazı taşır.** İki uç da hatadır — 36/50 boş da,
  50/50 dolu da. Yazısız kare meşrudur ama varsayılan değildir.

## Yasaya ne yazıldı

`agents/PROMPT-YASASI.md` §11a (taşıyıcı + iki meşru yol) · §11b (harf karakteri malzemedir)
· §11c (cimrilik de kusurdur, hedef ~yarı). Slot şablonu genişletildi.
`scripts/prompt-lint.mjs`: harf karakteri kuralı + `blocky…raised…dimensional` tuzağı.
