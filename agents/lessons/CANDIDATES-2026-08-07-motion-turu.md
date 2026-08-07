# DERS ADAYLARI — 2026-08-07 · Hayvanlarda Üreme motion + klip turu

> Bu oturumda 54 kare, 54 motion ve 54 klip üretildi; iki cüzdan paralel koştu.
> Aşağıdaki her madde **gerçek kare/klip üstünde ölçüldü**, tavsiye değil.
>
> 🔴 **NEDEN BU DOSYA ÖNEMLİ:** Mami aynı gün yandaki sohbetin çıktısına baktı ve
> *"hiç öğrenememiş gibi sahneler üretti"* dedi. Sebep ölçüldü: `APPROVED.md`'de
> **7 ders var, 7'si de aynı projeden ve 7'si de tek konudan — ekranda Türkçe yazı.**
> Yani yeni bir oturum bugüne kadar ölçülen hiçbir şeyi öğrenemiyor. Bankaya girmeyen
> ders üretime hiç dönmez: director, enzim ve yasa hepsi bankayı okur.
>
> Bankaya **yalnız Mami taşır.** Tavan bütçesi dar (~13 satır) — sıra önem taşır.

## Bankaya önerilen — üretimi doğrudan değiştirenler

- Klip üretim süresi ekran süresinin 2 saniye üstündedir: Kling'in ilk ~0.5 sn'si ve son ~1.5 sn'si kullanılamıyor, pay bırakılmazsa kurguda kesecek yer kalmaz — kaynak: 6. Sınıf - Hayvanlarda Üreme · 2026-08-07 · **41/54 klipte pay yoktu, K06 ve K20 eksideydi; ANIMATIC-0 tek klip basılmadan yakaladı**
- Kamera düşük genlikli kalır ama hareket TÜRÜ sekans içinde döner; aynı hareket arka arkaya ikiden fazla karede kullanılmaz ve kilitli kamera bir kusur değil, vuruş anının en güçlü hamlesidir — kaynak: 6. Sınıf - Hayvanlarda Üreme · 2026-08-07 · **basılan üç klibin üçü de aynı "slowly push in" çıktı; temiz-klip reçetesi kamera GÜVENLİĞİNİ anlatıyor, ÇEŞİTLİLİĞİNİ değil**
- Negatif sahneye özeldir ve en çok 3-5 maddedir; her kare için tek soru sorulur: "BU kare nasıl bozulur?" — kaynak: 6. Sınıf - Hayvanlarda Üreme · 2026-08-07 · **Magnific'in kling-30'unda ayrı negative_prompt alanı YOK, negatif sahne tarifiyle aynı 2500 karakteri paylaşıyor; Kling'in kendi belgesi "3-5 hedefli madde uzun listeyi yener" diyor, Seedance 2.0 negatifi hiç desteklemiyor**
- Kısıt mümkün olan her yerde OLUMLU cümleyle yazılır ("the count stays the same" ⟂ "no morphing") — kaynak: 6. Sınıf - Hayvanlarda Üreme · 2026-08-07 · **ölçülü +%24 semantik uyum; uzun negatif katalogları motora kaçınılan görüntüyü hatırlatıyor**
- Kling çok sayıda küçük ve benzer nesneyi (sürü, yumurta, tane) klip boyunca sayıca koruyamıyor; kalabalık kareler 4-5 sn kısa tutulur ve sayı sabitliği olumlu cümleyle yazılır — kaynak: 6. Sınıf - Hayvanlarda Üreme · 2026-08-07 · **K11'de sperm sürüsü klibin sonunda eridi, Mami "kullanılır ama gör" dedi**
- Kling "ağız oynamasın" negatifini DİNLEMİYOR; konuşmayacak karakter kare tasarımında profilden ya da uzaktan kadrajlanır, ağız kadrajın hâkim noktasında bırakılmaz — kaynak: 6. Sınıf - Hayvanlarda Üreme · 2026-08-07 · **K01'de negatif açıkça yazılıydı, ağız yine oynadı**
- Ekran yazısı kusuru genellikle KELİMEDE değil YERLEŞİMDEDİR: zemine derinlemesine dizilen uzun kelimenin uzak yarısı hem perspektifte ezilir hem netlik alanının dışında kalır; onarım kelimeyi kısaltmak değil açıyı değiştirmektir — kaynak: 6. Sınıf - Hayvanlarda Üreme · 2026-08-07 · **13 harfli YUMURTLAYARAK "YUMURTL"den sonra dağıldı; 9 harfli ve kameraya paralel DOĞURARAK aynı sette tuttu; tepeden f/8 ile 13/13 harf okundu**
- Sahnenin dünyasına ait olmayan nesne ithal edilmez: kavramı somutlaştırmak, o dünyada bulunamayacak bir şeyi kadraja koymak değildir — kaynak: 6. Sınıf - Hayvanlarda Üreme · 2026-08-07 · **image prompt'u mikroskobik dünyaya "yaprak damarı" koymuştu ("bilimi doğaya bağlamak" için); Mami: "hücrenin içinde yaprak ne arıyor?"**

## Kod dersi — prompt dersi değil, bankaya değil ledger'a

- 🔴 **Doğrulayıcı ölçtüğü şeyin YERLEŞİMİNİ varsayıyor ve ölçemediğini "ölçtüm" diye geçiriyor.**
  Bu repoda ölçülen **dokuzuncu** örnek; bugün **iki kez** çıktı:
  1. `edit-plan.mjs` kare-başına MOTION dosyası varsayıyordu (`/^\d+\.txt$/`) ve her dosyanın
     yalnız ilk satırını okuyordu; bu repo sekans başına yazıyor. 54 başlık taşıyan klasörde
     **"0 klip · 0:00" basıp SIFIRLA çıkıyordu.**
  2. `current-work.mjs` medya sayacı klasörün yalnız üst düzeyini okuyordu; medya yerleşimi
     aynı gün `KLIPLER/SES/KURGU/RENDER` olarak kurala bağlanmıştı. **54 klip diskteyken
     "klip eksik (0 < 54)" diyordu.**
  İkisi de onarıldı. **Sınıfı onarmanın yolu:** bir doğrulayıcı sıfır/boş sonuç üretiyorsa
  bu bir "temiz" değil, bir **kırmızıdır** — sessizce başarılı olmaz.

## Araç bulguları — `MUST-DO-KUYRUK.md`'ye yazıldı, banka satırı değil

- Higgsfield `generate_video_batch` 12 işin 8'ini **sessizce** iş göndermeden preset önerisine
  çevirdi; `declined_preset_id` ile aşılıyor.
- Higgsfield'a ucuz yükleme: Magnific'e yükle → `creations_get` → `media_import_url`.
- Fiyat (exact): Magnific kling-30 1080p **90 kredi/sn** · Higgsfield kling3_0 **~1.5 kredi/sn**.
- 🔴 Higgsfield **ortak hesap** ve MCP'de **silme aracı yok** → start frame oraya gitmez (Mami kuralı).
