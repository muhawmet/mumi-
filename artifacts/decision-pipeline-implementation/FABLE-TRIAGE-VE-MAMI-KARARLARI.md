# FABLE TARAMASI — TRIAGE + MAMİ KARAR LİSTESİ (2026-07-16)

Tam rapor: `FABLE-TARAMA-2026-07-16.md` (235 satır, 5 rol bizzat oynandı, 4 gerçek senaryo,
endüstri kıyası kaynaklı). Bu dosya: ne fixlendi + ne SENİN kararını bekliyor.

## 🎬 SİNEMA TESTİ hükmü (ana sorun buydu)

> **"Sistem BASIC BULLSHIT üretmiyor; ama sinemayı da sistem üretmiyor — sinema beat'ten geliyor,
> sistem onu bozmadan geçiriyor ve kadraj kararını round-robin'e bırakıyor."**

Senaryo hükümleri: Pixar-3D **KARIŞIK** · One Piece **KARIŞIK** · JJK **SİNEMA** · Reklam **SİNEMA**
(slogan kaybı ticari değeri düşürüyor). Dünya fiziği (M2 ayrımı) ajan elinde GERÇEKTEN çalışıyor —
sistemin en güçlü yanı. Kontrat iskelet, tabut değil — üç çürük çubukla (aşağıda kararların).

## ✅ FİXLENDİ (net-bug, davranış kırıktan doğruya — commit'te)

1. **Runner tek-yön kilidi (Fable #1 kritik):** frame_jury sonrası `--export-image-bundle` ve yeni
   kare `--import-frame` kalıcı kırıktı ("kareyi asla değiştiremiyorsun"). Fix: iki komut gerçek
   frame'i yüklüyor + **stale frame-bağımlı artifact zinciri ÖLDÜRMÜYOR, ayıklanıyor** (yeni kare →
   frame_jury yeniden koşar; image katı korunur). Regresyon testi kilitli.
2. **frame_jury REJECT çıkmazı:** mesaj artık çıkış yolunu SÖYLÜYOR (yeni kareyi --import-frame ile
   getir → jüri yeniden koşar).
3. **failureModes ölü kanalı:** alan adı `avoid`→`negatives` — motor kaçınmaları (morphing/
   extra-fingers/identity-drift) artık gerçekten author'a ulaşıyor (M2 vakasının tekrarıydı).
4. **"0 aday" hata mesajı** aranan dosya kalıbını söylüyor.

## 🟡 SENİN KARARIN — tasarım soruları (sensiz mühürlemedim)

1. **REKLAM HATTI (en pahalı):** üç kanayan tek pakette —
   (a) `brandKitLock`'un UI'da giriş alanı YOK (store'da yaşıyor, siteden kurulamıyor);
   (b) slogan/ekran-yazısı beat'i NO_TEXT'e köreltiliyor (SOURCE "Ekranda yazı belirir: ARDIÇ…" →
   onScreenText=null — MEMORY'deki eski "onScreenText TERS" kusuru yeni yapıda da yaşıyor);
   (c) NB2'nin güçlü text-render yeteneği (tırnaklı metin, 3-5 öğe) kontratta hiç yok.
   → **Karar:** reklam hattını tek mini-faz olarak toparlayalım mı? (UI alanı + ekran-yazısı
   beyan akışının reklam yolu + kontrata NB2 text-render maddesi.)
2. **KADRAJ HUKUKU:** vantage round-robin dev-dalga sahnesine "85mm close" dayattı; ajan kartında
   "vantage bağlayıcı mı" tanımsız — kadraj bugün SAHİPSİZ. Seçenekler: (A) vantage ÖNERİ olsun,
   kart "beat'e tersse çiğne, risks'e yaz" desin (ajan-özgürlüğü — benim önerim); (B) beat-aware
   vantage motoru siteye yazılsın (daha deterministik ama site yorum yapmaya yaklaşır).
3. **PALET vs DÜNYA ÖNCELİĞİ:** seçili palet `world.paletteAsLight` kılığında dünya ışığıyla
   çelişebiliyor (JJK'ya "vibrant edu, NO menace" gitti) ve site dünya değişince paleti
   güncellemiyor/uyarmıyor. AUTHORITY_HIERARCHY kodda var ama AJANA verilmiyor. → Öncelik beyanını
   context'e yazalım + site dünya-palet uyumsuzluğunda uyarı çipi göstersin mi?
4. **2D-MEDIUM maddesi 3D dünyada:** kontrat maddesi pixar_3d'de karşılanamaz → gerçek jüri REJECT
   üretti (bir tam revizyon turu yedi). Fix yönü net (madde grubu 2D-cel dünyalarla sınırlansın +
   3D dünyalara kendi medium maddesi yazılsın) ama kontrat içeriği senin yaratıcı alanın —
   onayınla yapayım mı?
5. **frozenInstant → motion köprüsü:** image_author'ın "yarım saniye sonra ne olacak" yorumu
   motion_author'a GİTMİYOR (ölü kanal — ama karşı-sav: "frame is truth"). Bağlayalım mı,
   bilinçli mi kalsın?
6. **Kontrat kalıp-tekdüzeliği:** 4/4 prompt aynı iskelet cümleleri taşıyor ("Clean motion-ready
   still, frozen half a second before…" / "Palette regime:…" / "Detail: x; y; z"). Motor için
   işlevsel ama imza gibi. Kartlara "maddeleri sahnenin doğal diline erit, şablon cümle kurma"
   talimatı ekleyelim mi? (Ucuz, riski düşük — ama üslup senin alanın.)

## 🟢 İYİ HABERLER (Fable doğruladı)

- Dünya tarifleri korpusu TEMİZ — 46/46 boş-laf taramasından sıfırla çıktı; COMMERCIAL_REAL grubu
  en işlenmiş kısım ("reklam dünyaları zayıf mı" endişesi verilerle YANLIŞLANDI).
- Kapılar meşru ve açıklamalı (sidebar baypası yok, disabled'lar sebepli).
- 4 command'ın 4'ü validate'ten ilk seferde geçti; Türkçe+boşluklu path + SESSION.md seal komutu
  kusursuz; hash uyuşmazlığı hiç yaşanmadı; bozuk template alan-listeli net redle yakalanıyor.
- approvedLessons (M7) katmanı canlı doğrulandı.

## "Yapamazsın" kök nedeni (Fable hipotezi — ikna edici)

Sistem hayır demiyor; **yanlış sebeple hayır diyor veya sessiz kalıyor** (yanlış hata metinleri,
tepkisiz butonlar, geri-dönüşsüz aşamalar). En büyük iki örnek fixlendi (frame kilidi + hata
mesajları). Kalan sessizler (tepkisiz "Teslimi aç"/"SONRAKİ ADIM" butonları, 1-60/96 tavan
tutarsızlığı, locks.topic bayatlığı) UI dokunuşu — kararınla sıraya girer.
