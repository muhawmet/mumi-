# DERS ADAYI — PLASTİK, REFERANS SAYFASININ KADRAJINDAN SIZIYOR

**Kaynak:** 6. Sınıf — Bizi Bir Arada Tutan Değerler (6.1.2), 2026-07-29.
Mami 15 dosyayı elle ayırdı. Hükmü aynen: kötüler **"hepsi plastik, bozuk oyun hamuru gibi"**,
iyiler **"sanki biri eliyle özenle çizmiş gibi"**. **APPROVED'a yalnız Mami taşır.**

**Eşleme kanıtı:** her PNG `Resimler/*.png` ile **md5 eşitliğiyle** kare numarasına bağlandı
(dosya adına değil), 13 tekil görselin hepsi gözle açıldı.

---

## Bulgu — tek cümle

Plastikliği shader üretmiyor: **STYLE ve LIGHT satırları 34 karede kelime kelime aynı.**
Üreten şey **figürün kadrajdaki bütünlüğü** — ayak kadraja giren tam boy gövde motoru duran bir
figürine çeviriyor. Ve bunu prompt'ta tetikleyen şey lens değil, **referans sayfasının kendi
kadrajı**.

## Ölçüm — ne AYIRIYOR, ne AYIRMIYOR

| değişken | iyi | kötü | ayırıyor mu |
|---|---|---|---|
| **Ayak/ayakkabı teslim edilen karede görünür** | **0/4** | **7/7** | ✅ istisnasız |
| **Kadraj kilidi cümlesi** (neyin DIŞARIDA kaldığı yazılı) | 3/4 | **0/7** | ✅ |
| **Temas gölgesi örneği AYAKKABIYA yazılmış** | 0/4 | 5/7 | ✅ |
| @efe1/@mira1 kadrajda | 1/4 | 6/7 | ✅ (kilitle birlikte) |
| Lens (mm) | 50–85 | **50, 75, 85** ve 3× 35 | ❌ **ÇÜRÜTÜLDÜ** |
| Diyafram | 4/4 f/2.8 | 4/7 f/2.8 | ❌ **ÇÜRÜTÜLDÜ** |
| "Eli işte" | 4/6 | 2/7 | ❌ eğilim, desen değil |
| Kişi sayısı · kelime sayısı | — | — | ❌ sinyal yok |

**İlk hipotezim yanlıştı.** "İyi = uzun lens + f/2" demiştim; ölçüm çürüttü: kötü setin
**K17'si 85mm, K16'sı 75mm** — iyi setin tam aynı lensleri. `f/2` 34 promptun yalnız 1'inde var.
Dosya adlarındaki lens korelasyonu gerçek değil, tesadüftü.

## Mekanizma — asıl bulgu

**REF-1 ve REF-2'nin metni şu:** *"85mm lens at f/4.0 … **full figure centred and standing at
rest**, soft studio-style … seamless gradient backdrop"*. Bu bir **karakter sayfası** kadrajıdır.

Yani `@efe1` çağırdığın her karede motora **stüdyo ışığında ayakta duran tam boy bir figürin**
yüklüyorsun. Sahnenin lensi ne olursa olsun bu ithalat geliyor.

**Ölçülmüş kural: @tag var + kadraj kilidi cümlesi yok → 6/6 KÖTÜ.**
Tek istisna K34: @tag'li ama İYİ — çünkü *"framed from mid-chest up … and nothing below the chest
is visible"* cümlesi ithalatı **eziyor**.

İkinci tetik: dünyanın *"her nesne yüzeyine değer"* temas gölgesi yasası. İyi karelerde bu kepçeye,
kirkite, kaleme örneklenmiş; kötü karelerde **ayakkabıya**: *"both children's shoes press flat on
the paving stone"* (5/7). O cümleyi yazmak ayağı kadraja **mecbur** eder.

## Yasa teklifi — iki satır, ezberlenebilir

1. **`@tag` çağıran her kare, kadrajın neyi DIŞARIDA bıraktığını yazar.**
   *"nothing below the chest is visible"* · *"no floor and no street visible"* gibi. Referans
   sayfası tam boy figürin taşıyor; kilit cümlesi yoksa o figürin kareye gelir.
2. **Temas gölgesi örneği ASLA ayakkabıya yazılmaz.** Kepçeye, kirkite, kâseye, kaleme yazılır —
   ayağa değil. Ayakkabı-zemin teması yazmak tam boyu mecbur eder.

## Uygulanabilir kapı (Mami seçerse)

`prompt-lint.mjs`'e tek KIRMIZI: prompt `@efe1|@mira1` içeriyor **ve** kadrajın dışarıda
bıraktığını söyleyen cümle (`nothing below|not visible|no floor|out of frame|fills the frame`)
**yok** → KIRMIZI. Ayrıca `shoes?.{0,40}(press|rest|flat|on the (paving|ground|stone))` → KIRMIZI.
Bu iki desen bu videodaki 7 kötü karenin **6'sını** kredi yakmadan yakalıyordu.

## Dürüstlük kaydı

İyi setin 3/4'ü (K12, K21, K34) **ikinci taslaktır** — kötü setin 0/7'si. Kadraj kilidi cümleleri
tam o yeniden yazımda doğdu. Yani "iyi" kısmen "yeniden yazılmış" demek: asıl ders, **ilk taslakta
kadraj kilidi yazılmıyor** olmasıdır.

İki dosya (`_5x5A3bvKxe`=K04, `_ubu69joQLD`=K05) **iki klasörde de** duruyor — Mami'nin ayrımında
sınır kare. Atama yapılmadı; K04 kurala uyar, K05 uymaz.
