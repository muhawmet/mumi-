# HASAT — 5. Sınıf Destek ve Hareket Sistemi (2026-08-05)

> **Bunlar ADAYDIR.** `APPROVED.md`'ye yalnız Mami taşır.
> Kaynak: bitmiş 3:15'lik filmin AGY tarifi + 52 teslim dosyasının ölçümü + git tarihi.
> Mami'nin ham hükmü: *"son ürettiğimin motion promptları çok kötüydü… sahneleri
> düşünmeden düz yazdı, o kadar güzel yazıyorduk sonra bunu yapması korkunç."*

---

## L1 · YAZIM KALİTESİ, SETİN KAÇ KEZ TOPLUCA YENİDEN YAZILDIĞINI İZLİYOR

**Ölçüm (git tarihi):**

| set | tam yeniden yazım | açılış tekdüzeliği | sonuç |
|---|---|---|---|
| Eşeyli (altın standart) | **1** | 24/50 = %48 | tuttu |
| Sorunları Birlikte (Efe) | **1** | 46/57 = %81 | tuttu |
| **Destek ve Hareket** | **4 (tek günde)** | **52/52 = %100** | Mami reddetti |

Destek'in 52 motion bloğu bir günde dört kez baştan yazıldı: ilk set → `_LEHCE` turu →
`ENERJI` turu → `KANON` turu. Her tur **52 bloğun tamamını birden** üretti.

**Yetenek hükmü:** toplu yeniden yazım **şablon** üretir, kare kare yazım **sahne** üretir.
Ajan 52 bloğu tek oturumda üretirken tek tek sahne düşünemez; bir iskelet kurar ve doldurur.
Kanıtı, kusurun yerinde: **kamera cümleleri 52/52 benzersizdi** (yani biçime dikkat edilmiş)
ama açılışların 52/52'si aynıydı. Dikkat vardı, **sahne düşüncesi yoktu.**

**Kontrole dönüşü:** bir teslim setinin tamamı tek geçişte yeniden yazılacaksa, o geçiş
**bir tur değil bir alarmdır**. Sebebi kareyse kareler onarılır; sebebi yasa değişikliğiyse
önce 6-8 kliplik canary basılır. `motion-lint` artık SET kapsamında açılış tekdüzeliğini
ölçüyor (eşik %90 — kanıtlı iyi Efe seti %81'de, o yüzden altı boş bırakıldı).

---

## L2 · NEGATİF KİLİT ÖLÇÜLEBİLİR ETKİ ÜRETMİYOR — film ölçeğinde kanıtlandı

**Ölçüm:** teslim edilen 52 dosyanın
- **52/52**'sinde `Silent clip, no audio, no dialogue, mouth closed, no lip movement` **VAR**
- **52/52**'sinde `No whip-pan, no shake, no snap-zoom, no camera warp` **VAR**

**AGY'nin bitmiş filmde gördüğü:** ağız **filmin çoğunda aktif** (0:04-0:26 · 0:29-1:03 ·
1:12-2:20 · 2:23-2:47 · 2:53-3:15) ve **22 morph anı** var.

**Yetenek hükmü:** iki zorunlu kuyruk da her klipte yazılıydı ve **ikisi de adını taşıdığı
şeyi engellemedi.** `mamilas-disclaimer-does-not-work` bunu iddia ediyordu; artık film
ölçeğinde kanıtı var. Kuyruk, özenli yazımın **izi** olabilir — ama **dizgin değil.**

⚠ Bu, `motion-lint`'in KIRMIZI `kuyruk` kuralını doğrudan vuruyor: kural, etkisi çürütülmüş
bir dizginin **varlığını** ölçüyor. Kararı Mami verir — kırmızıdan düşsün mü, yoksa yerine
`_LEHCE §9`'un **fiil biçimi** mi konsun: *"Her lips stay closed and soft; only her
shoulders move as she lets a breath go."*

---

## L3 · MORPH'UN BİRİNCİ SINIFI EKRANDAKİ TÜRKÇE YAZI

**AGY, 22 morph anı · zaman damgalı:**

| sınıf | adet | örnek |
|---|---|---|
| **ekrandaki yazı** | **8+** | 2:40 `İSTEMSİZ`→`TEMSIZ/ZISIE/MENSIZ` · 0:43 `İLK YARDIM`→`ROIM` · 0:46 `KAFATASI`→`KAFATASK` · 2:10 `ATÖLYE`→`ATÖLYER` · 3:11 `RES Y ATOLYES` |
| el / anatomi | 4 | 1:04 parmaklar birleşip **6 doku** · 2:06 el **4 parmak** · 1:16 çene boyna eriyor |
| model / nesne | ~6 | 0:38 kemik silindire dönüyor · 2:44 mide büzülüp kayıyor |
| tabela / doku | ~4 | 0:03 tabela kenarı dalgalanıyor |

**Yetenek hükmü:** bu dünyada kareye **gömülü** Türkçe yazı, kamera ya da özne hareket
ettiği an bozuluyor — ve negatif kilit bunu durdurmuyor (L2). `mamilas-kling3-text-trick`
bunu zaten söylüyordu; film ölçeğinde doğrulandı.
**Açık karar (Mami'nin):** yazı kareye gömülmeye devam mı etsin, yoksa **kurguda üstüne
bindirilsin** mi? İkincisi bu kusur sınıfını tamamen kapatır ve Premiere'de zaten yapılıyor.

---

## L4 · 🔴 ÖĞRENME DÖNGÜSÜ 5 GÜNDÜR DURDU — asıl sebep bu

Mami'nin sorusu: *"hani beyin kurmuştuk, hafıza, enzim, öğrenme?"*

**Ölçüm (`ders-bankasi-durumu.mjs`):**
```
onaylı 7/114 · bekleyen aday 107 (11 dosya) · son onay 2026-07-31
⚠️ bankadaki 7 dersin HEPSİ TEK projeden — sistem 1 videodan öğrenmiş durumda
```
Ve o 7 dersin **6'sı zaten çözülmüş tek problemden** (yüzeydeki Türkçe yazı; Hücre'de 21/21
temiz geçti). Çözülmemiş **11 kusur sınıfının bankada SIFIR dersi var.**

**Yetenek hükmü:** beyin, hafıza ve enzim **kuruldu**; geri besleme **hiç akmadı.**
`director`, `enzim` ve yasa üçü de bankayı okuyor — bankaya girmeyen ders üretime hiç
dönmüyor. Yani Destek, kendinden önceki 10 videonun öğrendiğini **görmeden** yazıldı.

Bu, "eskiden canavar gibi yazıyordu şimdi yazmıyor" hissinin yapısal karşılığıdır: sistem
kötüleşmedi — **öğrendiğini taşıyamadı.** Aday havuzu 5 gündür büyüyor, banka 5 gündür sabit.

**Kontrole dönüşü:** kapanış hasadı bir dosya üretmekle bitmiyor; **taşınmadıkça hasat
yapılmamış sayılır.** Tavan 20, dolu 7, boş 13 — ve 107 aday bekliyor.

---

## L5 · TEKDÜZELİK PROMPTTA DEĞİL KADRAJDA

AGY: *"52 klibin neredeyse tamamı, karakterin ekranın ortasında/hafif solunda, kameraya
doğrudan bakan nötr gövde pozisyonuyla başlıyor. Kamera açısı sürekli göz hizası
orta-yakın plan. **Alt açı, üst açı veya genel plan değişkenliği bulunmamaktadır.**"*
Kesim ritmi de sabit: ortalama 3.7 sn, çoğunluk 3.5-4.5 sn bandında.

**Yetenek hükmü:** Mami'nin iki ayrı gün söylediği *"kurgu çok basic"* ile *"düz yazdı"*
**aynı kusurun iki yüzü.** Kusur motion metninde değil, **kadraj ve ritim çeşitliliğinin
hiç kararlaştırılmamış olmasında.** Bu, Shot Card'ın `KAHRAMAN` + `KAMERA` satırlarının ve
Enzim **KİLİT 5**'in (ritim · duygu tepeleri) varlık sebebidir — ikisi de bu set yazılırken
henüz yoktu.

---

## SONRAKİ VİDEOYA TAŞINACAK TEK CÜMLE

**Bir teslim setinin tamamını tek geçişte yazma; ve yazdığın kilidin işe yaradığını
gerçek klipte görmeden onu kanıt sayma.**
