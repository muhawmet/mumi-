# HASAT — MORPHING'İN KÖKÜ · 2026-08-05

**Kaynak: ölçüm, tahmin değil.** Mami 5. Sınıf Destek ve Hareket'ten 6 klip bastı ve altısını
da reddetti ("iğrenç morphing", "anlamsız hareketler", "plastik", "ağız oynuyor ilk AI videoları
gibi"). Altı klibin karesi `ffmpeg` ile çekildi ve **gözle okundu** — tarif ettirilmedi, bakıldı.

---

## DERS 1 · Morphing bir motion-yazım kusuru değil, BOŞLUK kusurudur

> **Kliplerin yapacak bir işi yoksa motor boşluğu kendi uydurur. Morphing o uydurmadır.**

Kanıt — dördü aynı boşluğun dört farklı doldurması:

| kare | VO | karede olan | motorun uydurduğu |
|---|---|---|---|
| K4 | "Kukla olduğu yerde **yığıldı**" | kukla **zaten yığılmış** | el titredi, kamera süründü |
| K8 | "Mira kuklayı alıp fen sınıfına **geçti**" | Mira **zaten sınıfta** | 5 sn hareketsizlik → "plastik" okuması |
| K1 | dolapta asılı kukla | asılı kukla | **kukla yürüdü**, eklem büküldü, boy değişti |
| — | masada 8 kemik | 8 kemik | kemikler **20'ye çoğaldı**, ışık belirdi |
| — | masada uzun kemik | kemik | kemik **ışığa dönüştü** |

**Sınıf:** motorun 5 saniyesi var, adlandırılmış bir olayı yok. Fiziksel hedefi olmayan hareket
maddeyi eğip bükerek doğar.

**Kontrole çevrilmiş hâli:** her klip **tek** bir fiziksel olay taşır — başlar, ilerler, biter,
hepsi süre içinde; öznesi karede **görünen** bir nesne/kişidir.

---

## DERS 2 · Kusur MOTION katmanında değil, START FRAME'de doğuyor

K4 ve K8'de kare, VO cümlesinin **sonucunu** çizmiş, **ortasını** değil. Olmuş bir olay
canlandırılamaz — hiçbir motion metni bunu kurtaramaz.

**Kontrole çevrilmiş hâli — kare basılmadan ÖNCE koşan tek soru:**
> *"Bu VO cümlesinin anlattığı olay, bu karede **bitmiş mi**, hâlâ **önde mi**?"*
> Bitmişse kare yeniden kurulur. Bu bir motion sorusu değil, bir **start-frame kapısıdır.**

---

## DERS 3 · `already` kusur değil BELİRTİdir — kelime avlamak kökü ıskalar

Destek setinin 47 bloğunun 41'i `already` taşıyordu ve bu "kusur" sanıldı. Yanlıştı: motion'ı
yazan ajan **kareye dürüstçe bakıp** "bu iş zaten olmuş" demişti. Kelime düzeltilseydi aynı
klipler yeniden basılırdı — **belirti silinir, hastalık kalırdı.**

**Genel hâli (bu depoda 9. kez):** bir kelime sıklığı ölçülüp kusur ilan edilmeden önce,
o kelimenin **neyi doğru tarif ettiği** sorulur.

---

## DERS 4 · Katı nesne YASAKLA korunmuyor, FİİLLE korunuyor

K1'in motion metninde birebir şu vardı:
`Lock: @kukla stays a rigid solid that never folds, sags or bends at a joint.`
**Kukla yürüdü.** Yasak tutmadı.

**Kontrole çevrilmiş hâli:** katı gövde, ne yapmayacağıyla değil **ne yaptığıyla** yazılır —
`swings from the hook as one piece, shoulder hip and knee holding their exact angles`.
Bu, `mamilas-disclaimer-does-not-work` dersinin motion katmanındaki karşılığıdır.

---

## DERS 5 · Adlandırılmamış kalabalık çoğalır

8 kemik 20 oldu. Sayılabilir nesne taşıyan karede **hareket eden tek nesne adlandırılır**,
geri kalanlar konuma bağlanır: `only the nearest bone rocks once and settles; the other seven
keep their exact places`.

---

## DERS 6 · Geniş planda hareketsiz karakter = "plastik"

Mami'nin "plastik" dediği K8'de ten kusuru **yoktu** — geniş planda 5 saniye kıpırdamayan bir
çocuk vardı. Plastik okuması bazen bir **yüzey** kusuru değil bir **hareketsizlik** kusurudur.

**Kontrole çevrilmiş hâli:** karakter kıpırdamayacaksa ya kadraj yakındır, ya da olay başka
bir nesnededir.

---

## DERS 7 · Klipten kare çekip GÖZLE bakmak rutin olmalı (Mami'nin emri, 2026-08-05)

Mami: *"videolara bak, morphing ne olduğunu net görürsün, öğrenmiş olursun."* Haklıydı —
6 klibin tarifi değil **karesi** teşhisi verdi. AGY tarif eder; kusurun geçtiği saniyeden
kare çekilip Claude'un kendi gözüyle okunması ayrı ve daha keskin bir kanıttır.

Komut: `ffmpeg -i <klip> -vf "fps=2,scale=480:-1,tile=5x4" -frames:v 1 <sayfa.jpg>` →
tek görselde 10-20 kare, tek Read ile okunur.

---

**Uygulanmış hâli:** `agents/COMMAND-INBOX/5. Sınıf - Destek ve Hareket Sistemi/_LEHCE-YASASI-2026-08-05.md`
(10 maddelik yazım yasası — 52 motion bu yasayla yeniden yazıldı).

**Bu dosya ADAYDIR.** `APPROVED.md`'ye yalnız Mami taşır.
