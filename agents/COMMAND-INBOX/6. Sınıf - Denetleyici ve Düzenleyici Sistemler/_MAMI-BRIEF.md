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

🔴 **DÜZELTME (2026-08-08, Mami yakaladı).** Gece "klip 45 kat ucuz" yazmıştım — **YANLIŞ.**
İki cüzdanın ham kredi sayısını yan yana koydum; oysa ölçekleri farklı: Higgsfield ~6k,
Magnific ~600k, yani bir Higgsfield kredisi ~100 kat değerli. Kanonun kendi kuralı bunu
zaten yasaklıyormuş (`rota.mjs:148`: *"Krediler KIYASLANAMAZ. Kıyaslanan birim FİLM."*).
**Doğru tablo — cüzdan yüzdesi:** 58 kare Magnific'in **%6,4'ünü**, 58 klip Higgsfield'ın
**%11,5'ini** yaktı. Klip kareden ucuz değil, **daha pahalıydı.**
Kalan: Magnific ~79.000 · Higgsfield 4.446.
⚠ Ayrıca klipler **1284×716 / 24 fps** — 1080p değil, portfolyoda upscale ister.

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
8. 🔴 **İKİ CÜZDANIN HAM KREDİ SAYISI YAN YANA KONMAZ** — bunu 2026-08-08'de ben yaptım,
   Mami yakaladı. Ölçekler farklı (Higgsfield ~6k, Magnific ~600k). Kıyaslanan birim
   **FİLM** ya da **cüzdan yüzdesi**; kaynak `node scripts/rota.mjs durum`.

## ⚠ HENÜZ YAPILMAMIŞ — dürüst olayım

**58 klibin 56'sını GÖRMEDİM.** Canary olarak iki klip AGY'ye izletildi ve temiz çıktı;
kalan 56'yı o kanıta dayanarak bastım ama hiçbiri izlenmedi. "10/10" diyemem, ölçmedim.
Kalite hükmü için sıradaki adım: `node scripts/dis-goz.mjs gor` ile AGY'ye toplu izletmek
(istek başına 10 klibe kadar) ya da kaba kurgu kurulduktan sonra **tam filmi** izletmek —
kanon zaten ikincisini istiyor: *"hüküm klip klip değil, TAM VİDEO izlenerek verilir."*
