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
17. MEKÂN ve NESNE PLAKASI sahne karesine REFERANS olarak verilmez: motor geometriyi değil BÜTÜN kompozisyonu kopyalar. Yalnız KARAKTER referansı çalışır
    *(27 kare basıldı: @mutfak referanslı K45/K47/K48 plaka klonu çıktı, @maket referanslı K31 stüdyo fonuna ders kitabı diyagramı bastı, K09'da maket geometrisi kayboldu. @mira referanslı K01/K09'da çocuk doğru geldi)*
18. @handle ÇAĞRILIR, TARİF EDİLMEZ — ve bu kural AJAN BRİFİNGİNE de yazılır, yalnız kilide değil
    *(Basım brifingimde 'etiketi nötr tanıma çevir' yazdım, ajan da 'a ten-year-old Turkish girl in a deep red hooded sweatshirt' yazdı: yaş yanlış (6. sınıf 11-12), gardırop tarif edildi, referans ezildi. Kilit doğruydu, benim ara belgem onu geçersiz kıldı)*
20. KURAL YAZMADAN ÖNCE ALTIN KAREYE BAK: bu oturumda üç kusurun üçü de kuralı kanıttan değil kendi çıkarımımdan yazmaktan doğdu
    *(Mira kotası (Mami'nin 'hep uzaktan olmasın' sözünü 'çıkar' diye okudum, 45 kare insansız), hücre dünyası ('oda aydınlık' tabanını hücreye uygulattım, mor sis), tarif edilen kız. Üçünü de düzelten şey aynıydı: Hücre K14/K28/K48 ve Hayvanlarda K01/K20'yi Read ile AÇIP BAKMAK)*

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
21. gate.sh'in BELGELEDİĞİ acil çıkış çalışmıyor: 'MAMILAS_LINT_SKIP=1 git commit' satır-içi ön eki kapıya ULAŞMIYOR; yalnız 'export MAMILAS_LINT_SKIP=1; git commit' geçiyor
    *(gate.sh:142 değişkeni kendi ortamından okuyor ama kapı PreToolUse hook'u olarak AYRI süreçte koşuyor; komut satırındaki ön ek o sürece geçmiyor. Satır 274 ve 344 kullanıcıya çalışmayan biçimi öneriyor. Bugün üç kez bloke oldu, export ile ilk denemede geçti)*

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
15. DÜNYA KAYNAKTAN TÜRETİLİR: kare yazmadan önce mekânın anahtar kelimeleri kaynak belgede SAYILIR; sıfır çıkan bir mekâna 10+ kare yazılacaksa DURULUR ve Mami'ye sorulur
    *(Denetleyici: kaynak 617 kelime, mutfak/soba/ocak/tezgâh/masa/defter 0; oturum 56 karelik mutfak kurdu, motor sonunda pes edip ders kitabı diyagramı bastı)*
16. MÜŞTERİ DOCX'i ÖNCE SENARYOYA ÇEVRİLİR: docx'in kendi görsel talimatları (metafor, örnek, ikon) filmin mekân listesidir; onları silip yerine dünya uydurmak bu repoda ölçülmüş en pahalı kusurdur
    *(Kaynak orkestra+şef, beden içi elektrik ağı, tek ayak/bisiklet, sıcak çaydanlık, kan dolaşımında haberciler ve LUNAPARK hız trenini kendisi yazmıştı; önceki oturum üçünü de silip mutfak kurdu. Altın standart Hücre bunu doğru yapıyor: docx→hikâye (duvar→tuğla→hücre))*
19. ÖZEL OKUL STANDARDI: müşteri öğrencileri varlıklı; mütevazı/yıpranmış/köy teması müşteri revizesi sebebidir
    *(Mami 2026-08-07: 'zengin bir hayat, fakir değil, özel okullara yapıyoruz devlete değil' ve 'gariban gariban tema yüklüyorsunuz diyor'. Kurulan dünya sobalı köy mutfağı, çentikli emaye, ökçesi çökmüş ayakkabıydı)*
