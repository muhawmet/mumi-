# 🚀 SENARYO PAKETİ — "Uzaya Giden Muhammet'in Hayatı"

**Mami için hazır paket (2026-07-16).** Aşağıdaki SOURCE bloğunu siteye aynen yapıştır (Kayıpsız
Ingest), önerilen ayarları seç, command JSON'unu indir — Faz 2 demo koşusunu o dosyayla süreriz.
VO-kalitesinde yazıldı: her beat sesli okunabilir tek cümle-grubu, tek olay, Detay Yasası'na uygun
(çevresel baskı + mikro-aksiyon + somut çıpa beat'lerin içine gömülü — ajan bunlardan kare kurar).

---

## SOURCE (siteye aynen yapıştır)

```
SOURCE:
Muhammet küçük bir sahil kasabasında, çatı penceresinden gökyüzüne bakan bir çocuktu; cam buğusuna parmağıyla roket çizerdi.
Okulun eski teleskobunu tamir ettiği gece, Satürn'ün halkasını ilk kez kendi gözüyle gördü ve nefesini tuttu.
Yıllar sonra mühendislik sınavının sonuç ekranı açıldığında, elleri klavyenin üstünde titriyordu.
Astronot seçmelerinde santrifüj testine girdi; yanaklarına binen yük artarken gözlerini hedef ışığından ayırmadı.
Fırlatma sabahı annesinin ördüğü mavi atkıyı görev çantasının iç cebine yerleştirdi.
Roket ateşlendiğinde koltuğa gömüldü; titreşim göğüs kafesinde davul gibi atıyordu.
Yörüngeye oturduklarında kemerini çözdü ve ilk kez ağırlıksız kaldı; kalem yanından süzülüp geçti.
Kubbe penceresinden Dünya'ya baktı: sahil kasabası, bulutların altında minicik bir kıvrımdı.
Uzay yürüyüşünde eldiveninin ucuyla istasyonun gövdesine dokundu; güneş, vizöründe beyaz bir çizgi çizdi.
Dönüş kapsülü atmosfere girerken pencere turuncuya kesti; Muhammet gözlerini kapatıp atkıyı avucunda sıktı.
Paraşüt açıldığında sessizlik geldi; ardından denizin kokusu, çocukluğunun kokusuydu.
Kasabaya döndüğünde aynı çatı penceresinin altında bir çocuk teleskop kuruyordu; Muhammet ona Satürn'ü gösterdi.
```

12 beat · ~75-85 sn hedef (beat başına ~6-7 sn) · duygusal ark: merak → emek → eşik → yolculuk → dönüş → devir.

## Önerilen ayarlar (sitede)

| Alan | Öneri | Neden |
|---|---|---|
| Proje sınıfı | ANIMATION_STYLIZED | Biyografik-duygusal ton; foto-gerçek değil, stilize sinema |
| Dünya | `shinkai_photoreal_anime` (varsa) — yoksa Mami seçsin | Gökyüzü/ışık hikâyesi; "sade cel karakter + foto-gerçek arka plan" bu hikâyenin dokusu. **Alternatif:** pixar_3d ailesi (daha sıcak/çocuk-dostu) |
| Cast | `Muhammet — 8 yaşından 30'lu yaşlara aynı yüz hattı; belirgin kaş yapısı, kısa koyu saç; her sahnede yaşına uygun ama TANINIR` | Çocuk→yetişkin sürekliliği bu hikâyenin bel kemiği — identity-lock çalışsın diye açık yazıldı |
| Palet | world default | Dünya ışığı hikâyeyi taşısın |
| Image / Video | nano_banana_2 / kling_3 | Standart hat |
| directorBrief (Mami direktifi) | `Mavi atkı üç sahnede görünür (fırlatma sabahı, atmosfer girişi, final) — duygusal bağ objesi, asla kaybolmaz. Final sahnesindeki çocuk Muhammet'in çocukluğuyla AYNI kadraj dilinde çekilsin (ayna etkisi).` | Ajanın yaratıcılığını kısıtlamadan iki duygusal çıpayı kilitler |

## Ekran yazısı (show) beklentileri — Mami beyanı için

On-screen text yasası: diegetik/baked veya hiç. Bu hikâyede önerim **yalnız 2 nokta**:

1. **Beat 3 (sınav sonucu):** ekrandaki sonuç YAZISI diegetik — monitörün kendisinde "KAZANDI"
   benzeri Türkçe ifade (ekran zaten sahnenin objesi; doğal yüzey).
2. **Beat 12 (final):** İSTEĞE BAĞLI — teleskop kutusunun üstünde el yazısı etiket ("Muhammet'ten")
   gibi mikro-diegetik dokunuş. Zorlama değilse ajan atlar.

Geri kalan 10 beat: **NO_TEXT** — görüntü taşısın (mute testi: sesi kıs, yazıyı gizle — hikâye yine okunuyor).

## Demo koşu planı (JSON'u indirince)

1. Mami: SOURCE yapıştır → ingest → ayarlar → storyboard'a göz at → **command JSON indir** → bana ver.
2. Ben: proje klasörü kur → `mamilas-command.mjs` zinciri: validate → storyboard approve →
   image_author oturumu (gerçek prompt'lar) → jüri → **prompt paketi Mami'ye**.
3. Mami: ilk 2-3 prompt'u motora elle ver → karelere bak → doğal dille düzeltme
   ("atkı rengi soluk çıkmış" gibi) → LIVE_CHAT directive → revizyon hattı gerçek testte.
4. Onaylı kare gelince: frame import → frame jury → motion prompt'ları → Kling.

Bu koşu aynı zamanda M7 için ilk gerçek ders adaylarını üretir (closeout → lessonCandidates →
Mami APPROVED.md'ye yazar → döngü canlanır).
