# MAMİ — Z RAPORU · Denetleyici ve Düzenleyici Sistemler

> Sen uyurken koştu. Soru yok. Karar bekleyen tek şey en altta.

## TEK SATIR

**58 kare + 58 KLİP bitti.** Film ham hâlde diskte. Kalan tek adım kurgu.

| ne | nerede |
|---|---|
| **58 klip** | `~/Desktop/6. Sınıf Animasyonlar/Denetleyici ve Düzenleyici/klipler/K01.mp4 … K58.mp4` · 256 MB |
| **58 start frame** | repo · `images/1.png … 58.png` |
| **58 motion + edit-plan + referanslar + senaryo + VO** | repo · teslim seti tam |

**Ham klip toplamı 5:31.** Kırpıldıktan sonra (her klibin başından 0.5 sn, sonundan 1.5 sn)
**ekran süresi ≈ 3:35.** Senaryo 4:05 diyor — fark ANIMATIC'te kapanır, VO gelince görülür.

## PARA — ve burada bir şey buldum

| kalem | kredi | cüzdan |
|---|---|---|
| 58 start frame + 6 revize + plaka | **5400** | Magnific |
| **58 klip** | **~580** | Higgsfield |

🔴 **Klipler kareden 10 KAT UCUZA çıktı.** Magnific'te `kling-30` 1080p 5 sn = **450 kredi**;
Higgsfield'da aynı Kling 3.0 5 sn = **10 kredi**. 45 kat fark. 58 klibi Magnific'te bassaydım
**~26.000 kredi** yakacaktım; Higgsfield'da **580** yaktı.
Higgsfield bakiyesi hâlâ **4446** — yani bu filmin klip maliyeti bütçenin yanında yuvarlama hatası.
**Bu bilgi 3000 videoluk planın en değerli parçası ve kanona yazıldı.**
⚠ Karşılığı çözünürlük: klipler **1284×716, 24 fps**. 1080p değil. Portfolyo için upscale gerekebilir.

## AGY NE GÖRDÜ — senin sorduğun soru

Klip basmadan önce iki canary bastım ve AGY'ye izlettim (en yüksek riskli iki kare:
elli/yüzlü bir kare ve çok sayıda küçük nesne taşıyan bir kare).

**MORPHING YOK.** AGY'nin altı maddesi: şekil değiştiren/eriyen/birleşen nesne **yok** ·
tekrar eden küçük nesnelerin sayısı **değişmiyor** · yüz veya uzuv deformasyonu **yok** ·
okunabilir yazı **yok**. Bunun üstüne 56 klibin hepsini bastım.

**Bulduğum tek sapma morphing değil:** K37'de motor elini kadraj dışına indirdi (metin
"hiçbir yere gitmiyor" diyordu) ve **ağzını açtı**. Ağız kuralı zaten kanonda ölçülü —
Kling "ağız oynamasın" negatifini dinlemiyor. Bir nefes nefese şaşkınlık, konuşma değil;
anlatıcı dış ses olduğu için kabul ettim.

## GECE İÇİNDE ONARILAN İKİ KARE

- **K29 bir PLANETARYUMDU** — duvarda nebula, teleskop, denge yok; VO ise "tek ayak üstünde
  durdu ve sallanmadı" diyordu. **Bunu motion ajanı yakaladı**, kareyi açıp plana uymadığını
  gördü ve bana getirdi. Yeniden basıldı: tek ayak, kalkık diz, duvarda tek parça keskin
  siluet — ders artık gölgede duruyor.
- **K37 plaka ithal etmişti** (mutfak yok, boş fonda portre). Kadraja mutfağı özne yapıp
  yeniden bastım.

## SIRADAKİ ADIM — tek şey kaldı

1. **VO'yu ElevenLabs'tan al** (`_SESLENDIRME-TEK-BLOK.txt` hazır, 58 cümle).
2. `node scripts/kaba-kurgu.mjs "<proje>" --klipler <klipler dizini> --vo <vo.mp3>`
   → Premiere timeline kurulu gelir: klipler sırada, VO A1'de, kesimler cümlelere oturmuş.
3. Müzik (Suno brief hazır) ve SFX (Envato) Premiere'de.

## SENİN İÇİN AÇIK OLAN TEK ŞEY

**K53'te fidanın dibindeki bitki etiketinde okunmayan bir yazı var.** Ekranda-yazı kilidine
takılıyor ama parkta gerçekçi ve bulanık; "bariz hata yoksa geçme" dediğin için basmadım.
75 kredi, tek basım, senin sözün. Kalan 57 karede harf yok.

## BUGÜN KANONA GİREN ÖLÇÜMLER

1. **Bariz hata yoksa reddetme, Mami'ye sor** — senin emrin, kodlandı.
2. **İki redden sonra üçüncüyü basma.** Bugün tek kare 6 kez basıldı (450 kredi) ve doğru
   cevap teknik değil yönetmenlikti.
3. **Referans kimliği diskteki dosyayı değil motordaki kaydı gösterir.**
4. **Referans karesinde yüz görünür ve ışıkta olmalı**, yoksa motor plakayı ithal ediyor.
5. **Karakter + aydınlık iç mekân = motor vintage moduna kaçıyor.**
6. **Anıtsallık ışığın tepeden inmesiyle taşınır.**
7. **Negatifte adlandırmak çağırıyor** — bunu bu gece ben yaptım, motor İngilizce etiketli
   anatomi diyagramı bastı.
8. 🔴 **KLİP HİGGSFIELD'DA BASILIR** — aynı Kling 3.0, 45 kat ucuz. Start frame Magnific'te
   kalır (kanun), klip Higgsfield'a gider.
