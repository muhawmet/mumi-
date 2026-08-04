# DEVİR — MOTION KUSURU (2026-08-04, oturum sonu)

> Bu dosya `/clear` öncesi yazıldı. Sonraki oturum **buradan devam eder.**
> Aktif iş: **5. Sınıf - Destek ve Hareket Sistemi** · 52 kare hazır, **motion ÇÖP, yeniden yazılacak.**

---

## 1. MAMİ'NİN HÜKMÜ — birebir

> *"Desteğin motionları niye bu kadar cansız ve rezil kanka, morphingde var. Biz motionı
> çözmemiş miydik?"*
> *"Oğlum kamera hareket etmiyor neredeyse, kasıtlı mı yaptın?"*
> *"Mira neredeyse hiç hareket etmiyor, bir de sadece kukla hareket ediyor."*

**Haklı. Kusur ajanlarda değil, benim verdiğim tarifte.**

---

## 2. ÖLÇÜM — kusur sayıyla

| | tam **DURARAK** biten | *"already"* ile açılan | kelime |
|---|---|---|---|
| **Destek (çöp)** | **44/52 · %84** | **39/52 · %75** | 207-248 |
| **Sabit Sürat (çalışan)** | **0/14 · %0** | **0/14 · %0** | 121-228, ort **143** |

Yani 52 klibin 44'ü `easing to a complete stop` / `comes to a full stop` /
`locked off, the frame does not move at all` ile bitiyor.

---

## 3. KÖK NEDEN — üç ayrı hata, üçü de bende

1. **Motion'ı KARENİN DEVAMI gibi yazdım.** Bloklar *"The clip opens with X already under
   way"* diye açılıyor — yani eylem GEÇMİŞTE, klipte kalan şey yatışma. Klip kendi eylemini
   taşımalı, karenin artığını değil.
2. **"Yazı taşıyan karede kamera kilitli" kuralını neredeyse HER kareye uyguladım.** O kural
   `mamilas-kling3-text-trick` ölçümünden geliyor ve DOĞRU — ama yalnız harf ya da katı
   mekanik gövde taşıyan karede. Ben genelledim.
3. **"Üç şey canlı" ambiyansını OLAY yerine koydum.** Toz, yaprak, su kıpırdaması klibin
   nefesidir, olayı değildir. Sonuç: kıpırdayan tek şey prop, insan çakılı.

Kling beş saniyelik pencerede gerçek hareket bulamayınca **kendi hareketini uyduruyor** —
Mami'nin gördüğü morphing tam olarak bu.

---

## 4. DOĞRU TARİF — Sabit Sürat korpusundan çıkarıldı

Çalışan iki örnek, birebir:

> *"She **completes her step down** off the stone threshold onto the patterned pavement and
> **settles into the beginning of a walk**, her weight rolling forward onto the leading foot;
> behind her the pale-blue door drifts a few degrees on its hinge... **Camera: almost locked,
> only the faintest slow push toward her as she steps out** — the frame invites her into the
> morning rather than chasing her. She stays within the frame and does not walk fully out; the
> door drifts but does not slam or detach; ... her face and body never distort."*

> *"Ali **pushes gently off the low stone wall and straightens** as he catches sight of her,
> **lifting one hand in a small warm wave**, his weight rocking from the wall onto his front
> foot..."*

**Kural olarak:**
- 🔴 **Karede insan varsa OLAY İNSANIN BEDENİNDE.** Adım, dönme, uzanma, eğilme, ağırlık
  aktarma, el kaldırma. Işık olayı ve prop hareketi **ikinci plandır**, asla tek olay değil.
- 🔴 **"already under way" YASAK.** Klip eylemin ORTASINDA değil, eylemin KENDİSİYLE açılır:
  *completes · pushes off · lifts · straightens · reaches · turns.*
- 🔴 **Klip TAM DURARAK bitmez.** Kamera "almost locked, faintest slow push" olabilir ama
  `comes to a complete stop` bir kalıp değil, istisnadır. Hedef: 52'de en fazla 8-10.
- 🔴 **Kamera kilidi KOŞULLUDUR:** yalnız ekranda okunur HARF ya da katı/mekanik gövde
  taşıyan karede. Organik karede kamera kesimin içinden akıp geçebilir, klip hareket
  hâlinde bitebilir.
- **Kelime bandı:** Sürat 121-228, ortalama **143**. `motion-lint` şu an 190-215 istiyor —
  ⚠ o bant başka korpustan geldi ve bu kusurla ilişkili olabilir; **Mami'ye sorulacak ya da
  ölçülecek.** Uzun paragraf ambiyansı şişiriyor.
- **Kuyruk aynen kalır:** `Silent clip, no audio, no dialogue, mouth closed, no lip movement.`
  + yazı/katı gövde varsa `No whip-pan, no shake, no snap-zoom, no camera warp.`
- **LOCK listesi kalır** ve Sürat'taki gibi kısa yazılır: kim kadrajdan çıkmaz, ne
  kopmaz/çarpılmaz, hangi nesne yerinde kalır, yüz asla deforme olmaz.

---

## 5. SONRAKİ OTURUMUN İLK İŞİ

1. `motion-lint.mjs` kelime bandını ölç: 190-215 mi doğru, Sürat'ın 121-228'i mi? Kanıt
   iki korpusun karşılaştırması. **Ölçmeden değiştirme.**
2. **52 motion'ı yeniden yaz** — dört ajan, 13'er kare, brief §4'teki tarifle.
   Yedek: `MOTION/ESKI-cansiz-yedek.txt` (silme, kıyas için dursun).
3. Kareler `images/` altında **52/52 hazır ve onaylı** — yeniden üretim YOK, yalnız motion.

---

## 6. DURUM

- **Kareler:** 52/52 onaylı. Mami K36'daki çapraz kolu bilerek bıraktı (*"sıkıntı yok"*).
- **prompt-lint:** KIRMIZI 0/52. Bugün beş anlam tuzağı eklendi (gövde-ışık çelişkisi ·
  siluet alt gövde · adsız nesne KIRMIZI; ıslak göz · yönsüz ışın SARI).
- **Dünya kartı:** `agents/worlds/pixar_3d_edu.md` — bugün açıldı, sekiz başlık.
- **Revize sohbeti:** `agents/DEVIR-REVIZE-SOHBETI.md` — diğer projelerin revizeleri orada.
- **Codex'in görevi var** (Mami söyledi) — sonraki oturumda sorulacak.
- Kapı yeşil: tsc temiz · vitest 2533 PASS.

🔴 **Bu dosyadaki kusur bu repoda ölçülen sınıfın aynısı:** doğrulayıcı ölçtüğü şeyin
yerleşimini varsaydı. `motion-lint` yapıyı ölçüyordu (kelime sayısı, kamera cümlesi var mı)
ve **52 klibin 44'ünde aynı ölüm kalıbını yeşil geçirdi.** Lint'e eklenecek kural:
*"comes to a complete stop" oranı bir dosyada %40'ı geçiyorsa KIRMIZI.*
