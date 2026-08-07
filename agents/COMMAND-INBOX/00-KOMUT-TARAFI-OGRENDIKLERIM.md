# KOMUT TARAFI — 2026-08-07'de öğrenilenler

> Bu dosya `COMMAND-INBOX/` kökündedir çünkü öğrenilenler **iş yönetimiyle** ilgilidir:
> işin nasıl açıldığı, nerede durduğu, ne zaman durdurulduğu ve nasıl devredildiği.
> Prompt ve motor ölçümleri burada değil — onlar `@agents/OLCULENLER.md`'de yaşar ve
> her yeni sohbete otomatik yüklenir.

---

## 1. KLASÖR YERLEŞİMİ — dört yer, tahmin edilmez

| Ne | Nerede |
|---|---|
| Bekleyen kaynak senaryolar | `COMMAND-INBOX/Bekleyen/*.docx` |
| Aktif iş | `COMMAND-INBOX/<Proje>/` |
| Biten iş (kaynak docx'i de içeri alınır) | `COMMAND-INBOX/Biten/<Proje>/` |
| Ortak element rafı | `COMMAND-INBOX/elements/` |
| **Video · ses · kurgu · render** | `~/Desktop/6. Sınıf Animasyonlar/<Proje>/` → `KLIPLER · SES · KURGU · RENDER` |

Kareler repoda kalır (`<Proje>/images/`), **medya repoda kalmaz.**

🔴 **Bir iş bitince kaynak docx'i `Bekleyen/`den ÇIKAR ve proje klasörüne al.** Bugün
`Kuvvetlerin Güç Birliği` hem `Biten/` altında hem `Bekleyen/` içindeydi; "bekleyen iş"
diye sayıldı ve yeni iş seçilirken yanlış listeye bakıldı.

---

## 2. ESKİ TURU ARŞİVLEME — silme, taşı, açma

Bir proje sıfırdan kurulacaksa eski set **silinmez**, `<Proje>/_ESKI/` altına taşınır:

```
_ESKI/PROMPTLAR/    _ESKI/images/    _ESKI/MOTION/    _ESKI/REVIZE/
```

🔴 **`_ESKI/` AÇILMAZ.** Oradan cümle taşımak yasaktır — kusurun kaynağı o metnin
kendisiydi. Arşiv "ne yapıldığının kaydıdır", kalite ölçütü değil.

⚠ Aynı ada ikinci kez taşıma yaparken **iç içe geçme tuzağı** var: `_ESKI/images` zaten
varken `mv images _ESKI/images` klasörü içine gömer. Ayrı ad ver (`images-tur1`) ya da
içeriği birleştir; her taşımadan sonra **dosya sayısını doğrula**.

🔴 **Canlı klasör kapıyı etkiler.** `gate.sh` `PROMPTLAR/` ve `MOTION/` klasörlerini
tarar; bir turun kırmızısı **başka bir oturumun commit'ini kilitler.** Bugün ölçüldü:
Denetleyici'nin `S4.txt`'indeki 8 kırmızı, tamamen ilgisiz dosyalara dokunan commit'leri
saatlerce bloke etti. Eski tur `_ESKI/` altına alınınca kapı açıldı.

---

## 3. PARALEL SOHBET — ne yapılır, ne yapılmaz

Birden çok sohbet aynı repoda çalışabilir ve bugün çalıştı. Kurallar:

- ✅ **Her sohbet kendi projesinde kalır.** Dosya adı ve klasör çakışması yoksa sorun yok.
- ❌ **Başka bir oturumun canlı dosyasına DOKUNULMAZ.** Bugün `S4.txt` 60 saniye önce
  yazılmıştı; düzeltmek çakışma üretirdi. Kırmızı Mami'ye bildirildi, onaran o oturum oldu.
- ⚠ **Bir oturum ötekinin öğrendiğini görmez.** Sohbet başladıktan sonra yazılan hiçbir
  kanon o oturuma ulaşmaz — `@agents/OLCULENLER.md` bile. Güncelleme gerekiyorsa
  **yeni sohbet** açılır; VSCode'u kapatmaya gerek yoktur.
- 🔴 **Ajanlar orkestratörün körlüğünü miras alır.** Altı mükemmel ajan, yanlış dünyada
  altı mükemmel yanlış üretir. Kalite kapısı **karede değil KİLİTTE** olmalı.

---

## 4. DEVİR — bir işi başka sohbete verirken

Üç dosya yeter ve üçü de proje klasöründe durur:

| Dosya | Ne yapar |
|---|---|
| `_DEVIR-<hedef>.md` | Proje durumu · eski setin denetimi · ölçümler · yapılmayacaklar |
| `_YENI-SOHBET-METNI.txt` | Yapıştırılacak açılış mesajı — kısa, tek dosyaya işaret eder |
| `00-DURUM.txt` | Tek ekranda aşama · sıradaki adım · açık kararlar |

🔴 `00-DURUM.txt` **bayatlıyor.** Bugün Bileşke'de "kare 0/52" yazıyordu, gerçek 71'di;
Denetleyici'de "KARE BASILACAK" yazıyordu, tur çoktan değişmişti. Her aşama değişiminde
elle güncellenir — kayıt bayatlarsa sonraki oturum sıfırdan başlar.

---

## 5. İŞ SEÇİMİ — ölçülen tuzaklar

- **`Bekleyen/` listesi tek başına yeterli değil.** `Biten/` ile karşılaştır: bugün
  `KUVVETLERİN GÜÇ BİRLİĞİ` bekleyen sanılıyordu, bitmişti.
- **Yarım proje "ucuz" görünür ama değildir.** Bileşke'nin 71 promptu hazırdı; ama
  bugünkü yasalardan önce yazılmıştı, yani eski kusurları miras alacaktı. Mami'nin hükmü:
  *"o docstan al komple, çok eski kafa."*
- **Blok işler tek tek işlerden verimlidir.** 5. Sosyal 2. Ünite dört konu ve dördü de
  "İlimiz" diyor — ortak dünya, ortak cast, referans envanteri bir kez.
- **Kaynak bir "sunucu" istiyorsa dur.** Bu hatta ekranda kimse konuşmaz (Kling ağız
  negatifini dinlemiyor). Sunucu **anlatıcıya** çevrilir. Hayvanlarda ve Bileşke'de
  ikisinde de çıktı.

---

## 6. BİR TURU NE ZAMAN DURDURURSUN

Ölçülen üç işaret — biri bile varsa üretim durur, kare tek tek onarılmaz:

1. **Dünya kaynakta yok.** Mekânın anahtar kelimelerini kaynak docx'te say; 0 çıkıyorsa
   ve 10+ karede kullanılıyorsa dünya yanlış seçilmiştir.
2. **Karenin kahramanı ders değil.** `PLAN` satırlarına bak: "kahraman = çaydanlığın
   kapağı" bir sinir sistemi dersinde durdurma sebebidir.
3. **Oturum kendi belirtisini gerekçelendiriyor.** *"Yazan ajan o çizgi okunsun diye odayı
   karartıyor"* gibi bir cümle yazılmışsa, sorun aydınlatmada değil dünyadadır.

Durdurmanın maliyeti her zaman daha ucuzdur: yanlış dünyaya 56 kare yazmak, 56 kareyi
tek tek düzeltmekten pahalıdır.
