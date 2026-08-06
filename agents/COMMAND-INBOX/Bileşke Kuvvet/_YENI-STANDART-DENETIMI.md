# BİLEŞKE KUVVET — YENİ STANDART DENETİMİ

Denetim kapsamı: 71 start-frame promptu, EDIT-PLAN, VO, referanslar ve bitmiş v1'in iki revize turu. Kare yoktur; bu nedenle bulgular metin/plan kanıtıdır, görsel PASS değildir.

| # | Başlık | Durum | Sayı / kanıt | Onarım |
|---|---|---|---|---|
| 1 | Sekans omurgası | **KUSURLU** | 7 sekans var; yalnız S7 **26 sn** ile 15–30 sn aralığında. S1 **68**, S2 **65**, S3 **40**, S4 **31**, S5 **58** sn; S6 **8 sn**. Soru → gözlemsel kanıt → dönüşüm → köprü dörtlemesi hiçbir sekans için açık kart olarak yazılmamış. | S1–S6'yı 15–30 sn'lik doğal alt-sekanslara böl ve her biri için dört parçalı omurga kartı yaz. |
| 2 | Motion açılış tekdüzeliği | **UYGULANAMAZ** | Projede **0** motion prompt bloğu var; `00-DURUM.txt` de `motion ✗` diyor. EDIT-PLAN'daki `DEĞİŞİM` sütunu motion prompt değildir. | Onaylı start-frame'lerden sonra motion setini yaz ve ilk cümlelerini sekans bazında sayıp çeşitlilik hedefini o dosyada kilitle. |
| 3 | Kesim cümle sınırı / L-J | **KUSURLU** | 71 klipte **70** ara kesim var: **66/70** VO cümle sonunda; C59 ve C62 üçer klibe bölündüğü için **4/70** cümle içi kesim. Plan ayrıca **8** hareket-ortası kesim sayıyor (K22, K27, K32, K51, K57–59, K63). Etiketlenmiş L/J kesim **0**. | EDIT-PLAN'a her sekans için gerçek VO zamanına bağlı en az bir gerekçeli L veya J kesimi ve sesin hangi planda taşındığını ekle. |
| 4 | Ses haritası | **KUSURLU** | 7 sekans için ortam, foley, reveal, geçiş ve bilinçli sessizlik alanı **0/7**. Yalnız Suno müzik eğrisi var; SFX/foley track yok. | Her sekansa beş alanlı kısa ses haritası ekle; yalnız anlam taşıyan tek foley ve bilinçli sessizlik anını seç. |
| 5 | K01–K08 açılış kuşağı | **KUSURLU** | **8/8** karede ayrı yönetmen notu var; fakat K01–K08 için özel bir açılış süreklilik kartı, ENTRY/EXIT zinciri veya canary önceliği yok. Bu sekiz kare S1'in **68 sn**lik geniş bloğunda kayboluyor. | K01–K08'i ayrı açılış şeridi yap; dünya, Mira'nın fiziksel durumu, ışık yönü ve K08 çıkışını tek süreklilik kartında kilitle. |
| 6 | Ardışık zincir kilidi | **KUSURLU** | Durumlar prompt notlarında kısmen var: K21–K27 çamur/tekerlek ilerlemesi, K31–K38 kurdelenin batı konumu ve K62–K64 aynı kadraj karşılaştırması yazılı. Ancak formel `EXIT STATE` / sonraki `ENTRY STATE` satırı **0/71**. | Yalnız 3–5 karelik değişim koşuları için iki satırlı EXIT/ENTRY sözleşmesi çıkar; devralınan ve bilerek kırılan durumu belirt. |
| 7 | Sabit dünya kuyruğu | **TEMİZ** | 71 promptta `STYLE` **63**, `LIGHT AND PALETTE` **68**, `NEGATIVE` **71** tam metin sürümü var; tek yapıştırılmış dünya kuyruğu yok. K62–K64'teki ortak sürüm, karşılaştırma kadrajı için bilinçli. | Bu çeşitliliği koru; yeni genel kuyruk ekleme, yalnız kare-özel ve kanıtlı kilit bırak. |
| 8 | Kaynağın tonu | **TEMİZ** | VO'nun olumlu-meraklı öğretici tonu korunuyor; dışlanma, ön yargı, kayıtsızlık veya karakter kusuru eklenmemiş. K22'deki başarısız itme fizik kanıtı, K33'teki itiraz kavramsal fark ediş; kişiler arası çatışma değil. | Yeni duygusal yay ekleme; gerilimi mevcut merak, neden-sonuç ve fiziksel dönüşümden üret. |
| 9 | Olumsuz yazım | **KUSURLU** | `NEGATIVE` blokları toplam **52.946 karakter**, kare başına ortalama **746 karakter** ve toplam **849** `no` sözcüğü (**12/kare**). Kare-özel riskler yararlı olsa da katalog hâlâ uzun. | Kimlik, dünya ve istenen fiziksel durumu olumlu cümleye taşı; NEGATIVE'de yalnız o karenin kanıtlı tek bozulma yolunu bırak. |

## Bitmiş v1 kusurlarının yeni metindeki izi

| Eski kusur | Yeni prompt metni | Hüküm |
|---|---|---|
| Temas 0/52; K33/34/35/50 havada | **71/71** promptta temas ve temas gölgesi var; kitap/masa (K42, K44) ve kutu/zemin (K67) ayrıca fiziksel olarak tanımlı. | Metinsel onarım var; kare olmadığından görsel olarak **kanıtsız**. |
| K38 ok ucu | K38'in NEGATIVE'i ışığın `drawn arrowhead` olmamasını açıkça kilitliyor; aynı koruma 14/71 ışıklı kavram karesinde var. | Metinsel onarım var; görsel kanıt yok. |
| K19/K21 yüze düşen force-glow | K19 insansız; K21 `no light is glowing anywhere` diyor. K05/K12 gibi temas ışıklı kareler de ışığı nesnede, deriden/yüzden uzak tutuyor. | Metinsel onarım var; görsel kanıt yok. |

## Bu proje yeni standartla üretime hazır mı?

**HAYIR.** Promptlar basılmadığı için motion ve ANIMATIC-0 zaten henüz yapılamaz; ondan önce plan katmanının yeni standarda getirilmesi gerekir.

1. 15–30 sn'lik alt-sekans omurgalarını, K01–K08 açılış şeridini ve yalnız gerekli ardışık zincirlerin ENTRY/EXIT durumlarını yaz.
2. Ses haritasını ve gerçek VO zamanına bağlı L/J kesimlerini EDIT-PLAN'a ekle.
3. `00-DURUM.txt` içindeki eski **0/52** sayımını 71-plan gerçekliğiyle uyumlu hale getir; sonra önce K01–K08'i bas ve denetle.
4. Onaylı kare + gerçek VO ile ANIMATIC-0 yap; ardından canary karelerinden motion yaz, açılış çeşitliliğini gerçek motion dosyasında ölç.
