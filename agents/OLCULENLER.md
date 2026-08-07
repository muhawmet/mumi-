# ÖLÇÜLENLER — her oturumun ilk mesajda BİLDİĞİ şeyler

> **Bu dosya `CLAUDE.md`'den `@` ile çekilir, yani HER yeni sohbette otomatik yüklenir.**
> Sebebi ölçüldü (2026-08-07): Mami yandaki sohbetin çıktısına bakıp *"hiç öğrenememiş
> gibi sahneler üretti"* dedi ve *"her yeni sohbette sıfırdan anlatıyorum"* diye ekledi.
> Mekanizma şuydu: yeni oturum yalnız `CLAUDE.md` + faz profili + `MEMORY.md` yüklüyor.
> Ölçümler başka dosyalardaydı ve kimse açmıyordu. Yani oturum **prosedürü** biliyordu,
> **ölçümü** bilmiyordu.

## Bu dosyaya ne girer

**Yalnız modelin DAVRANIŞINI değiştiren ölçüm.** Üç süzgeç:
1. Gerçek kare/klip üstünde mi ölçüldü? (yeşil test, plan ya da sezgi değil)
2. Bunu bilmeyen bir oturum **yanlış** iş üretir mi?
3. Opus 5 buna ihtiyaç duyar mı? Duymuyorsa **yazılmaz** — bu dosya da bir çit olabilir.

**Tavan ~40 satır.** Aşınca en eski düşer. Araç kullanımı, tarihçe ve gerekçe buraya
yazılmaz — onlar `docs/ai/MUST-DO-KUYRUK.md` ve `agents/PROMPT-YASASI.md`'de yaşar.
Buraya **hüküm** yazılır, anlatı değil.

---

## MOTION VE KLİP

1. **Klip üretim süresi = ekran süresi + 2 saniye.** Kling'in ilk ~0.5 sn'si ve son ~1.5 sn'si
   kullanılamıyor. *(2026-08-07: 54 klibin 41'inde pay yoktu, ikisi eksideydi — ANIMATIC-0
   tek klip basılmadan yakaladı, yoksa 41 yeniden basım.)*
2. **Kamera düşük genlikli kalır ama hareket TÜRÜ sekans içinde döner.** Aynı hareket arka
   arkaya ikiden fazla karede kullanılmaz. **Kilitli kamera kusur değil**, vuruş anının en
   güçlü hamlesidir. *(2026-08-07: basılan üç klibin üçü de aynı "slowly push in" çıktı.)*
3. **Sabit kuyruğun kamera yarısı KOŞULLU.** `Silent clip, no audio, no dialogue, mouth closed,
   no lip movement.` her karede kalır. `No whip-pan, no shake, no snap-zoom, no camera warp.`
   **yalnız** ekranda yazı ya da katı/mekanik gövde taşıyan karelerde. *(Her karede olduğunda
   film 54 kez duruyor; Mami onayı 2026-08-07.)*
4. **Kling çok sayıda küçük benzer nesneyi (sürü, yumurta, tane) klip sonuna kadar sayıca
   koruyamıyor.** O kareler 4-5 sn kısa tutulur, sayı sabitliği olumlu cümleyle yazılır.
5. **Kling "ağız oynamasın" negatifini DİNLEMİYOR.** Konuşmayacak karakter kare tasarımında
   profilden ya da uzaktan kadrajlanır; negatif tek başına yetmiyor.

## PROMPT YAZIMI

6. **Negatif sahneye özeldir, en çok 3-5 madde.** Her kare için tek soru: *"BU kare nasıl
   bozulur?"* Template negatif ölçülebilir zarardır: Magnific'in `kling-30` modelinde **ayrı
   `negative_prompt` alanı YOKTUR**, negatif sahne tarifiyle aynı 2500 karakteri paylaşır.
   *(Kling'in kendi belgesi: "3-5 hedefli madde uzun listeyi yener." Seedance 2.0 negatifi
   hiç desteklemiyor.)* Tam metin: `PROMPT-YASASI §3n`.
7. **Kısıt mümkün olan her yerde OLUMLU yazılır** — `the count stays the same` ⟂ `no morphing`.
   *(Ölçülü +%24 semantik uyum; uzun negatif katalogları motora kaçınılan görüntüyü hatırlatıyor.)*
8. **Ekran yazısı kusuru genellikle KELİMEDE değil YERLEŞİMDEDİR.** Zemine derinlemesine
   dizilen uzun kelimenin uzak yarısı hem perspektifte ezilir hem netlik alanının dışında kalır.
   Onarım kelimeyi kısaltmak değil **açıyı değiştirmektir**: tepeden, kapalı diyafram, kelime
   kadrajın alt kenarına paralel, bütün harfler tek düzlemde. *(13 harfli YUMURTLAYARAK dağıldı,
   9 harfli ve kameraya paralel DOĞURARAK tuttu; tepeden f/8 ile 13/13 harf okundu.)*
9. **Sahnenin dünyasına ait olmayan nesne ithal edilmez.** Kavramı somutlaştırmak, o dünyada
   bulunamayacak bir şeyi kadraja koymak değildir. *(Mikroskobik dünyaya "yaprak damarı"
   konmuştu — Mami: "hücrenin içinde yaprak ne arıyor?")*

## CÜZDAN

10. 🔴 **START FRAME YALNIZ MAGNIFIC'te basılır.** İstisnası yoktur. Higgsfield **ortak hesap**
    ve MCP'sinde **silme aracı yok** — oraya giden prompt görünür kalır. Mami'nin ölçüsü:
    *"start frame motion prompt'undan daha değerli."* Bu kural fiyat kuralını **ezer**.
11. **Klipte iki cüzdan aynı anda dolu koşar.** Ekranda yazı taşıyan ve kilit/epik sahne
    Magnific'te; sıradan sahne canlanması Higgsfield'da. Magnific eşzamanlı tavan **8 video**.
    Fiyat (exact): Magnific `kling-30` 1080p **90 kredi/sn** · Higgsfield `kling3_0` **~1.5 kredi/sn**.

## KOD VE DOĞRULAYICI

12. 🔴 **Bir doğrulayıcının SIFIR/BOŞ sonucu "temiz" değil, KIRMIZIDIR.** Bu repoda dokuz kez
    ölçülen kusur sınıfı: doğrulayıcı ölçtüğü şeyin **yerleşimini varsayıyor** ve ölçemediğini
    "ölçtüm" diye geçiriyor. *(2026-08-07'de iki kez: `edit-plan.mjs` 54 motion başlığı olan
    klasörde "0 klip" deyip sıfırla çıktı; `current-work.mjs` 54 klip diskteyken "klip eksik
    (0 < 54)" dedi — ikisi de alt klasörü okumuyordu.)*

## DÜNYA SEÇİMİ

13. 🔴 **DÜNYA DERSTEN SEÇİLİR, MALZEMEDEN DEĞİL.** "Bu ders metal ve cam dersidir" gibi bir
    *malzeme* tezi dünya kilidi yerine geçemez: malzeme bir RENDER kararı, dünya bir PEDAGOJİ
    kararıdır. Kaynak neyi anlatıyorsa dünya onun geçtiği yerdir.
    *(2026-08-07 · Denetleyici ve Düzenleyici Sistemler: kaynak docx'te `mutfak 0 · soba 0 ·
    ocak 0` geçiyordu; oturum KİLİT 1'de "metal ve cam dersi" deyip kış sabahı MUTFAĞI kurdu ve
    `@mutfak`'ı 56 karenin çoğuna kilitledi. Ölçüm: `oak 258 · stove 179 · flour 175` ⟂
    `classroom 0 · student 0 · smartboard 0`. Sonuç: her kare biyolojiyi mutfağa kaçırmak zorunda
    kaldı ve motor sonunda pes edip ders kitabı diyagramı bastı — etiketli oklar, İngilizce ve
    bozuk yazı, çocuk yok. Mami: "hiç bizim standart değil.")*
    **Sınama:** dünyayı yazmadan önce sor — *bu mekân kaynakta geçiyor mu, yoksa güzel render
    olacağı için mi seçildi?* İkincisiyse dünya değil, bir fotoğraf fikridir.
14. **Bir oturum kendi belirtisini gerekçelendiriyorsa dünya yanlıştır.** Aynı dosya kendi
    içinde *"yazan ajan o çizgi okunsun diye odayı karartıyor"* diye yazmıştı — belirti
    görülmüş, dünya sorgulanmamıştı. Kareyi kurtarmak için dünyayı bükmek gerekiyorsa, bükülmesi
    gereken dünyadır.
