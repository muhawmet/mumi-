# DERS ADAYI — PLASTİK BİR SHADER KUSURU DEĞİL, BİR MESAFE KUSURU

**Kaynak:** 6. Sınıf — Bizi Bir Arada Tutan Değerler (6.1.2), 2026-07-29.
Mami 15 kareyi elle ayırdı: `İyi örnekler/` 6 kare · `Kötü örnekler/` 9 kare.
Bu dosya o ayrımın ölçümüdür. **APPROVED'a yalnız Mami taşır.**

---

## Bulgu — tek cümle

Kötü karelerde shader, dünya kilidi, palet ve negatif listesi **iyi karelerle birebir aynıydı.**
Değişen tek şey **kamera cümlesiydi.** Yani "plastik görünüyor" bir render sorunu değil, yazdığım
**kadraj kararının** sonucudur — ve prompt'un tek satırında düzeltilir.

## Ölçüm — 15/15 ayrım, istisnasız

| | İyi (6) | Kötü (9) |
|---|---|---|
| Lens | 50mm f/2 · 65mm f/2 · 85mm f/2 | **35mm f/4** ×3 + türevleri |
| Tam boy figür (ayak kadrajda) | **0/6** | **9/9** |
| Beyaz spor ayakkabı görünür | **0/6** | **6/9** |
| Kadrajdaki kişi ELİYLE iş yapıyor | 6/6 (kepçe, kirkit, kalem, haritaya eğilme) | 2/9 |
| Arka plan odak dışı | 6/6 | 0/9 |

Üç kötü kare (KOTU-2, KOTU-3, KOTU-8) **cepheden dizilmiş sıra** — "sınıf fotoğrafı" kompozisyonu.
İkisinde (KOTU-6, KOTU-8) Efe+Mira sahnede hiçbir şey yapmıyor, sadece **seyirci** olarak duruyor.

## Mekanizma

1. **Tam boy + ayak = oyuncak.** Bir CG gövdeyi tepeden tırnağa gösterdiğin anda beyin onu
   *vinil figür* olarak okur. Aynı asset beline kadar kadrajlandığında **karakter** olarak okunur.
   İyi karelerde tek bir tam boy figür yok; kötü karelerin dokuzunda var.
2. **Derin odak = diorama.** f/4-f/8'de tezgâh, kalabalık, fener ve yüz eşit keskinlikte gelir;
   göz "maket masası" der. f/2'de arka plan düşer, sahne **çekilmiş** görünür.
3. **Boşta duran gövde = manken.** Plastiklik yalnız yüzey değil **davranış** özelliğidir:
   eli işte olmayan figürün fizik yükü yoktur, motor onu poz vermiş oyuncak gibi shade eder.

## Kök neden — sistem nerede kopuyor

`agents/PROMPT-YASASI.md` start-frame template'i eski NB2 gramerini taşıyor:
*"Locked 40mm camera at seated eye level, f/8 deep focus"* — bu gramer **foto-gerçek** bir dünyadan
madenlendi ([[mamilas-brain-intelligence-mined]] IMAGE AUTHOR §1) ve `pixar_3d_edu` için tam olarak
plastik üretecidir. Yasa "her prompt'ta sayısal lens+f-stop olsun" diyor — **doğru**; ama sayının
**hangi aralıkta** olacağını hiçbir yerde sınırlamıyor.

`scripts/prompt-lint.mjs:71` bu yüzden yalnız `\b\d{2,3}\s*mm\b` arıyor: **bir sayı var mı.**
Uygun mu diye sormuyor. Sonuç: 34/34 kare KIRMIZI'sız geçti, dokuzu oyuncak çıktı.
Bu, "yeşil ≠ temiz" satırının kanıtlı örneğidir.

## Yasa teklifi — üç satır, ezberlenebilir

1. **Hero karakter kadrajdaysa lens ≥ 50mm ve diyafram f/1.4–f/2.8.**
   35mm ve f/4+ **yalnız insansız dünya karesinde** kullanılır.
2. **Hero karakterin ayağı kadraja girmez.** Kadraj beli, göğsü ya da omzu keser; tam boy figür
   yasak. Tam boy gerekiyorsa o kare hero'suz çekilir.
3. **Kadrajdaki karakterin eli işte olur.** Seyirci/boşta duran gövde yazılmaz — ya bir şey
   yapıyor ya kadrajda değil.

## Uygulanabilir kapı (Mami seçerse)

`prompt-lint.mjs`'e tek kural: prompt `@efe1|@mira1` içeriyorsa → lens < 50mm **KIRMIZI**,
`f/([3-9]|1[0-9])` **KIRMIZI**, `full body|head to toe|standing on|shoes visible` **KIRMIZI**.
Bu üç desen bu projedeki 9 kötü karenin **9'unu** üretimden önce yakalardı.
