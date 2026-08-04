# Onay kuyruğu — 13 satırlık bütçe (2026-08-03)

> Banka bugün 7 satır, tavan 20 → **13 yer var**. Bu liste 9 dosyadaki 75 adayın
> tekilleştirilmiş ve sıralanmış hali. Mami satır başındaki kutuyu işaretler; onaylananlar
> APPROVED.md'nin SONUNA eklenir (tavan konumsaldır, yeni satır sona gider).

**Bu turda ne değişti.** 20 kaynak dosya baştan okundu ve her aday `agents/PROMPT-YASASI.md`
karşısında **grep'le** denendi. Sonuç sıralamayı bozdu: birleşik hasadın **en pahalı diye
işaretlediği aday (A1 — gövdesiz kol) yasada zaten kelimesi kelimesine yazılı**, aynısı A3, B6,
B7, C10, C12, D2 için de geçerli. Yedisi birden elendi ve yerlerine hiçbir listede üst sırada
olmayan dört mekanizma girdi (edit triyajı, üçüncü yazı sınıfı, temas örneği, NB2 darlık).

**Sıralama ölçütü:** A kaç kare BAŞTAN üretilmiş · B kaç ayrı projede tekrarlamış ·
C motorun somut davranışını açıklıyor mu · D yasada karşılığı var mı (varsa girmez).

---

## SEÇİLEN 13 — sıralı, en pahalıdan

### 1. Referans-edit yarı ömürlüdür — düzeltme NEGATIVE'e de yazılır

- [ ] `- Her revize maddesi aynı karenin NEGATIVE satırına da yazılır; yalnız "change ONLY …" ile verilen düzeltme motorda tutmuyor ve kare ikinci tura dönüyor — kaynak: 6. Sınıf - Kuvvetlerin Güç Birliği · 2026-07-29 · Mami onayı`
  **Neden bu sırada:** korpusun en büyük tek kredi kalemi — **12 kare ikinci kez basıldı**, TUR1'in %63'ü tutmadı. Tek mekanizma, iki proje turu.
  **Kanıt:** `HASAT-6-sinif-kuvvetlerin-guc-birligi.md` metadata `carryOverRate: 0.63` — TUR1 19 kare, TUR2 27 kare, 12'si ikisinde de (2, 8, 9, 12, 14, 15, 18, 19, 21, 25, 34, 35). Aynı düzeltme iki kez yazıldı: TUR1 `35.png` *"correct 'R = ON' to 'R = 0 N'"* → TUR2 `35.png` *"'R = ON' is wrong"*. İkinci kaynak: `CANDIDATES-2026-07-29.md` ADAY 2.
  **Yasada yok:** `grep -n "change ONLY\|Revize = referans-edit" agents/PROMPT-YASASI.md` → §1.19 yalnız revize **biçimini** verir ("Use this referenced image, change ONLY…"); düzeltmenin NEGATIVE'e de yazılacağını hiçbir satır söylemiyor.

### 2. @tag çağıran kare, kadrajın neyi DIŞARIDA bıraktığını yazar

- [ ] `- @tag çağıran her kare kadrajın neyi DIŞARIDA bıraktığını yazar ("göğüs altı görünmez", "zemin ve ayaklar kadrajda yok") — referans sayfası stüdyo ışığında tam boy figürin taşıyor ve bu kilit cümlesi yoksa o figürin sahnenin lensi ne olursa olsun kareye geliyor — kaynak: 6. Sınıf - Bizi Bir Arada Tutan Değerler · 2026-07-29 · Mami onayı`
  **Neden bu sırada:** tek kare değil **bütün video** reddedildi (*"hepsi plastik, bozuk oyun hamuru gibi"*). Ölçüm istisnasız: ayak kadrajda **7/7 kötü, 0/4 iyi**; kadraj kilidi cümlesi **0/7 kötü, 3/4 iyi**.
  **Kanıt:** `CANDIDATES-plastik-mesafe-yasasi.md` — Mami 15 dosyayı elle ayırdı, PNG'ler **md5 ile** kare numarasına bağlandı (dosya adına değil), 13 görsel gözle açıldı. Mekanizma referans metninde yazılı: REF-1/REF-2 = *"85mm at f/4.0 … full figure centred and standing at rest, soft studio-style … seamless gradient backdrop"*. Tek istisna K34: @tag'li ama İYİ, çünkü *"nothing below the chest is visible"* ithalatı eziyor. Lens ve diyafram hipotezi **aynı ölçümde çürütüldü** (kötü set 85mm ve 75mm de içeriyor, `f/2` 34 promptun 1'inde). İkinci kaynak: `HASAT-6-sinif-bizi-bir-arada-tutan-degerler.md` LOOT #1, before/after ✓, tekrar 7.
  **Yasada yok:** `grep -in "göğüs\|chest\|figürin\|tam boy" agents/PROMPT-YASASI.md` → tek hit satır 828, referans **şablonunun** kendi "Full-body character reference" satırı. Yasanın @tag disiplini *"tag'liyi tarif etme"* der, kadraj kilidini hiç anmaz.
  ⚠ **Confound kaynağın kendisinde yazılı:** iyi setin 3/4'ü (K12, K21, K34) ikinci taslak, kötü setin 0/7'si — kadraj kilidi cümleleri tam o yeniden yazımda doğdu. K05 kurala uymuyor. Mekanizma bağımsız kanıtla ayakta (referans metni + K34), ama n=11.

### 3. Yokluk NEGATIVE'e yazılır; kaldırılacak şey adıyla anılmaz

- [ ] `- Yokluk pozitif cümleyle istenmez ve kaldırılacak şey adıyla anılmaz — "şu yazıyı sil" dediğinde motor onu ÇAĞIRIYOR; ne yazacağını harf harf yaz, boş kalacak yüzeyi giydir, yasağı NEGATIVE satırına koy; özelliği (donuk, tozlu) pozitif yaz ama yokluğu (kimse yok, yazı yok) negatif yaz — kaynak: 6. Sınıf - Sorunları Birlikte Çözüyoruz · 2026-07-31 · Mami onayı`
  **Neden bu sırada:** düzeltmenin kendisi **yeni kusur doğuruyor** — K49'da `plastic` kaldırılmak istendi, kaldı ve üstüne `Mayan` + `Hard` doğdu. Ölçüm: **2 pozitif "kimse yok" cümlesinin 2'si sızdı, 23 negatif maddenin 0'ı sızmadı.**
  **Kanıt:** `CANDIDATES-2026-07-31-sorunlari-birlikte-cozuyoruz.md` A4 (düzeltme Mami'den geldi, ajanın ilk teşhisi eksikti) · `ONAY-BEKLEYEN.md` 7 (2/2 ↔ 0/23) · `HASAT-5-sinif-kutle-ve-agirlik.md` K12/K24 (brief "kişi YOK" der, arka planda bulanık figür). Aynı dosya NB2'nin Türkçe diakritiği basabildiğini kanıtlıyor (K57 `RAMPA·ÇÖP·LAMBA`, K55'te 42 harf kusursuz) — sorun yazma yeteneği değil, **silme emri**.
  **Yasada yok — YASAYLA ÇELİŞİYOR:** `grep -n "Pozitif çerçevele" agents/PROMPT-YASASI.md` → satır 495: *"'boş sıcak duvar' yaz, 'dağınıklık yok' değil"*, satır 496-499 ise *"kimliği, güvenliği ve **varlığı** negatif kuramaz"* diyor. Satır 300-302 (§2b.2) aynı yöne bakıyor. Ölçüm **yokluk** ekseninde ikisini de çürütüyor. 🔴 Bu satır yasa metnini geçersiz kılar — Mami'nin açık hükmü gerekir.

### 4. Edit triyajı — hangi kusur referans-edit ile KAPANMAZ

- [ ] `- Bir karede iki ya da daha çok bağımsız kusur varsa ya kusur geometrikse (nesne havada, kadraj yanlış, figür yüzeye kaynaşmış) referans-edit YAZILMAZ, kare baştan üretilir — "change ONLY" tek eksene çalışıyor ve altındaki yüzey kaldırılmadan havadaki nesne oturmuyor — kaynak: 6. Sınıf - Bizi Bir Arada Tutan Değerler + 5. Sınıf - Birlikte Daha Güçlüyüz · 2026-07-31 · Mami onayı`
  **Neden bu sırada:** aynı kare **üç kere ödendi** (2 başarısız edit + 1 baştan). Üç ayrı karede daha "edit toplamaz" hükmü çıktı. 2 proje, doğrudan kredi.
  **Kanıt:** `HASAT-6-sinif-bizi-bir-arada-tutan-degerler.md` LOOT #9 — *"K12'de iki referans-edit denemesi başarısız oldu, kompozisyon çözdü"* (before/after ✓, tekrar 2); aynı dosya `12.png ⚠ MAMİ BULDU — **BAŞTAN ÜRET (tek satır edit toplamaz)**`. `HASAT-5-sinif-birlikte-daha-gucluyuz.md` K18 (*"dört ayrı kırık, hepsi tek karede"* → BAŞTAN) ve K51 (üç kırık → BAŞTAN). `HASAT-5-sinif-kutle-ve-agirlik.md` K15 havada asılı poz.
  **Yasada yok:** `grep -n "baştan üret" agents/PROMPT-YASASI.md` → §1.19 yalnız *"Sahne bozuksa (kompozisyon/beat yanlış) baştan üret"* der. **Kusur SAYISI** eşiği ve "geometrik kusur editle kapanmaz" hükmü hiçbir yerde yok.

### 5. Giydirme malzemesi ambalaj olamaz — yasanın kendi kuralının sınırı

- [ ] `- Boş yüzey giydirilirken malzeme YAZISIZ olandan seçilir (katlanmış kumaş, kraft rulosu, ters çevrilmiş kap, etiketsiz sepet, ahşap, cam); kutu, teneke, çuval, ambalaj ve şişe giydirme malzemesi DEĞİLDİR — onlar yeni yazı yüzeyidir — kaynak: 5.1.2 Farklı Kültürler · 2026-07-31 · Mami onayı`
  **Neden bu sırada:** kusur **yasanın kendi talimatının uygulandığı yerde** doğuyor, yani her uygulamada ölçekleniyor. 3 proje, 6+ kare.
  **Kanıt:** `CANDIDATES-2026-07-31-farkli-kulturler.md` B — uydurma İngilizce üç karede (K13 `POWDERZD FLOX`, K24 `SAKAT TABARIM`, K29 `OKR BOYASI`) ve **üçü de** *"rafı malla doldur / kutuları istifle / tezgâhı giydir"* denen yerde doğdu. `HASAT-5-sinif-birlikte-daha-gucluyuz.md` K47 çimento torbaları · `HASAT-6-sinif-bizi-bir-arada-tutan-degerler.md` 30.png *"erase the stencil marking from the crate"* · `HASAT-6-sinif-eseyli-ve-eseysiz-ureme.md` 3.png toprak torbası baskısı.
  **Yasada yok:** `grep -n "giydiril\|DOLDURMAK" agents/PROMPT-YASASI.md` → §2d.3 (satır 403-408) ve §2a (satır 379-383) *"yasaklamak değil DOLDURMAK"* der ve örnek verir (kepenk, tente, pano, çuval) — **çuvalın kendisinin yazı yüzeyi olduğunu hiçbir satır söylemiyor.** Bu, APPROVED #1 ve #3'ün ölçülmüş SINIRIDIR.

### 6. Yazı sınırı KELİME değil YÜZEY sayısıdır — ve yazı yükü bir maliyet kalemidir

- [ ] `- Yazı sınırı KELİME değil YÜZEY sayısıdır: tek yüzeyde büyük punto ve sensöre paralel olmak koşuluyla 30+ harf tutuyor, ayrı yüzeylere dağıtılan kısa kelimeler kırılıyor — kareye yazı koyacaksan tek yüzeyde topla, çünkü yazı yüzeyi sayısı doğrudan revize sayısıdır — kaynak: 5.1.2 Farklı Kültürler + 6. Sınıf - Sorunları Birlikte Çözüyoruz · 2026-07-31 · Mami onayı`
  **Neden bu sırada:** iki yönlü ve sayısal — altı yazı yüzeyli blok **3 dokunma / 4 revize / 3 BAŞTAN**, düşük yüklü blok **9 / 2 / 0**; aynı gün, aynı motor, aynı yazar. 2 proje.
  **Kanıt:** `CANDIDATES-2026-07-31-farkli-kulturler.md` TUTAN TARAF — K51'in **32 harfi** tek yüzeyde kusursuz (4 noktasız I, 5 noktalı İ, breve'li Ğ); *"NB2 4+ kelimede kayar"* sınırı çürüdü. `CANDIDATES-2026-07-31-sorunlari-birlikte-cozuyoruz.md` A7 (defter sayfası üç kelimeyi tuttu, **üç kapaklı `@kutu` iki karede de kırıldı**) + A8 (maliyet ölçümü). `HASAT-6-sinif-eseyli-ve-eseysiz-ureme.md` 47.png: taşıyıcı sayılmayınca motor **ikinci defter doğurdu**.
  **Yasada yok:** `grep -in "tek yüzey\|one surface" agents/PROMPT-YASASI.md` → sıfır hit. §2b.5 (satır 314-316) yalnız *"harf harf heceleme + taşıyıcının malzemesi + sensöre paralel"* üçlüsünü verir; yüzey SAYISI hiç geçmiyor.

### 7. @tag kimliği taşır, DURUMU taşımaz

- [ ] `- @tag kimliği taşır, DURUMU taşımaz: referansta yazılı olmayan her değişim (bitki bardaktan saksıya geçti, kitap açıldı, çanta boşaldı) o karede yeniden yazılır — yazılmazsa motor nesneyi referans durumuna geri sarıyor — kaynak: 6. Sınıf - Eşeyli ve Eşeysiz Üreme · 2026-07-31 · Mami onayı`
  **Neden bu sırada:** korpusta **en çok tekrarlayan** mekanizma — 10 kare, 3 proje. Dersin dönüm noktasını çürütüyor: bitki kendi kendini söküyor.
  **Kanıt:** `HASAT-6-sinif-eseyli-ve-eseysiz-ureme.md` `34/35/36/37/38.png — @gul DURUM KİLİDİ`: K32'de gül saksıya dikiliyor, **beş karede bardağa geri dönmüş**, K38'de kökler suda; ayrıca 44.png `@anne` gardırop kilidi kırık ve yüzü K43'ten genç. `HASAT-6-sinif-kuvvetlerin-guc-birligi.md` 32/34/36/37.png `@kitap` süreklilik edit'i. `HASAT-sabit-surat-ve-hiz.md` 3.png `renk-süreklilik`.
  **Yasada yok:** `grep -n "@tag disiplini" -A 20 agents/PROMPT-YASASI.md` (satır 502-520) → kimlik, tarif etmeme, tagsız insan ve kesik figür var; **nesnenin DURUMU yok.** §2d.7 (satır 428-431) sahnenin fiziksel durumunu kapsar (su seviyesi, hasar) ama mekanizma başka: orada zaman geri sarıyor, burada **referans çekiyor**.

### 8. Üçüncü yazı sınıfı — orta plandaki diegetik yüzey

- [ ] `- TEXT slotu üç sınıfı birden kapsar: kahraman yazı, arka plan tabelası ve ORTA PLANDAKİ küçük diegetik yüzey (defter sayfası, kitap kapağı, LCD, kadran, plaka, rozet, panel etiketi, takvim) — üçüncüsü adlandırılmadığı için motor oraya İngilizce ya da uydurma harf basıyor, üstelik odak net olduğu için bulanıklaştırma da kurtarmıyor — kaynak: 5. Sınıf - Kütle ve Ağırlık + Sabit Sürat ve Hız + 6. Sınıf - Kuvvetlerin Güç Birliği · 2026-07-29 · Mami onayı`
  **Neden bu sırada:** 11 blok / 9 benzersiz kare / **3 video**; revize yükünün yarısı adlandırılmamış bu sınıfta.
  **Kanıt:** `CANDIDATES-2026-07-29.md` ADAY 3 · `ONAY-BEKLEYEN.md` 3 — Kütle 23.png (`"60 kg"` → `"60 66"`), Kütle 33.png LCD hayalet hane, Sabit Sürat 27.png pusula W/E/S, Bileşke 8.png *"Personal notes"* / 2.png `BAKERI` / 36.png aynalanmış kitap kapağı / 45.png `"ETKİSİ ETKİSİ"`. `HASAT-6-sinif-eseyli-ve-eseysiz-ureme.md` 40.png duvar takvimi `SUN MON TUE WED`.
  **Yasada yok:** `grep -n "TEXT:" agents/PROMPT-YASASI.md` → satır 233-235, slot yalnız *"TAŞIYICI NESNE"* + *"arka plan: soft-focus, Türkçe ya da boş"* tanıyor. İki sınıf var, üçüncüsü yok. (APPROVED #4 bu sınıfın **tek bir üyesini** — ölçü aleti kadranını — kapsıyor; bu satır sınıfın tamamıdır.)

### 9. Yazı yüzeye SABİTLENİR — yön cümlesi tek başına yetmiyor

- [ ] `- Yazıyı serbest duran küçük taşıyıcıya (defter yaprağı, kâğıt etiket, koli kapağı, sırt etiketi) koyma — yazı 180° ters ya da çeyrek tur dönük basılıyor; büyük, bir şeye SABİTLENMİŞ ve sensöre paralel yüzey seç (vidalı plaka, oyulmuş levha, gergin bez, duvara vidalı pano) ve TEXT slotuna taşıyıcının neye sabitlendiğini de yaz — kaynak: 5.1.2 Farklı Kültürler + 5. Sınıf - Birlikte Daha Güçlüyüz · 2026-07-31 · Mami onayı`
  **Neden bu sırada:** 6 kare, 3 proje — ve yasadaki ORIENTATION cümlesi **yazılıyken de** kusur tekrar etti; ayıran değişken taşıyıcının kendisi.
  **Kanıt:** `CANDIDATES-2026-07-31-farkli-kulturler.md` A — yazı taşıyan 16 karede **imla kusuru sıfır**, ama K03 (defter sırtı küçük etiket, çeyrek tur), K08 (serbest defter yaprağı, 180°), K32 (defter sayfası, tepetaklak). Doğru çıkanların taşıyıcısı istisnasız sabit: vidalı emaye plaka, oyulmuş ahşap, gergin keten, duvara vidalı pano, sert masa kartı. `HASAT-5-sinif-birlikte-daha-gucluyuz.md` K19 (koli üstü baş aşağı) ve K40 (hero yazı `SOSYAL BİLGİLER` 180° ters — *"seyirci beş saniye ters yazıya bakıyor"*) · `HASAT-6-sinif-kuvvetlerin-guc-birligi.md` 36.png aynalanmış kapak.
  **Yasada yok:** `grep -n "ORIENTATION" agents/PROMPT-YASASI.md` → satır 184 ve 414. Yasa **yön cümlesini** zorunlu kılar; taşıyıcının seçimi hakkında tek kelime yok. Bu satır o kuralın eksik yarısıdır.

### 10. Kavram ışığı bir SÜREKLİLİK KARAKTERİDİR

- [ ] `- Kavram ışığı bir SÜREKLİLİK KARAKTERİDİR: her kare bir öncekinin ışığını değişmiş durumuyla devralır ("aynı ışık, taşınmış hâli"), sıfırdan doğan kavram ışığını motor taç yapraklı çiçeğe ya da ok ucuna çeviriyor ve kelime düzeltmesi bunu kesmiyor — kaynak: Sabit Sürat ve Hız + 6. Sınıf - Kuvvetlerin Güç Birliği · 2026-07-29 · Mami onayı`
  **Neden bu sırada:** 9 kare, 2 proje, **iki yönlü**: Sabit Sürat 9 devir cümlesi → 0 ışık revizesi; Bileşke 0 devir → 8 blok.
  **Kanıt:** `HASAT-6-sinif-kuvvetlerin-guc-birligi.md` TUR1 15, 18 · TUR2 5, 6, 15, 31, 33, 47 — *"drawn as saffron-crocus FLOWERS with petals"*, 31.png *"halatın ortasında BİTMİŞ turuncu çiçek"*; artı 38.png ok ucu. `HASAT-sabit-surat-ve-hiz.md` 44 karede 8 revize, **hiçbiri kavram ışığı değil**. `CANDIDATES-2026-07-29.md` ADAY 4.
  **Yasada yok:** `grep -in "devral\|carried forward\|devir" agents/PROMPT-YASASI.md` → sıfır ilgili hit. Yasa slot 6'da (satır 452) ışığın **biçimini** kilitler (*"soft round warm-golden glow"*) ve `saffron`/`bloom` tuzağını adlandırır; süreklilik hiç geçmiyor. ⚠ Kelime düzeltmesi zaten kodda (`src/core/wordTraps.test.ts`) ve **yetmedi** — 7 kare yine çiçek. Bu bir kelime değil, süreklilik kuralı.

### 11. İki tag'li karakter aynı karedeyse tag rolü taşımaz

- [ ] `- İki tag'li karakter aynı karedeyse tag rolü taşımıyor: eylemi yapanın yanına ayırt edici gardırop çıpası konur ("mor hırkalı kız"), ötekine NE YAPMADIĞI yazılır ("elleri boş kalır, alete hiç değmez") ve NEGATIVE'e "iki karakter kıyafet, saç ya da yüz takas etmez" girer — kaynak: 6. Sınıf - Kuvvetlerin Güç Birliği + 5.1.2 Farklı Kültürler · 2026-07-31 · Mami onayı`
  **Neden bu sırada:** 7 kare, 2 proje — ve **iki projede de handle'lar doğruydu**, yani kusur yazarda değil motorda.
  **Kanıt:** `HASAT-6-sinif-kuvvetlerin-guc-birligi.md` 16, 23, 30, 52 + K25 (iki turda da) — `@mira` üç kez halatı çekerken çıktı, oysa izlemesi gerekiyordu (*"@mira must NOT pull the rope — she stands watching, hands free"*). `CANDIDATES-2026-07-31-farkli-kulturler.md` D — K17'de prompt doğruydu (`@dara blows across @kaval`, `@mira2's shoulder turned toward the sound`), motor **gardırobu takas etti**; K36'da kartı asan kız değişti. `CANDIDATES-2026-07-26.md` 9: *kimliği tag taşır, ROL beat'ten gelir.*
  **Yasada yok — YASAYLA GERİLİMDE:** `grep -n "TAG'Lİ karakteri asla tarif etme" agents/PROMPT-YASASI.md` → satır 509: *"handle yeter — `@efe1` yazdıktan sonra saçını, kıyafetini yazmak referansla yarışır."* Bu satır **ölçülmüş istisnadır**: tek tag'li karede kural doğru, iki tag'li karede gardırop çıpası zorunlu. Mami'nin hükmü gerekir.

### 12. Temas gölgesi örneği ASLA ayakkabıya yazılmaz

- [ ] `- Temas gölgesi örneği ASLA ayakkabıya yazılmaz — kepçeye, kirkite, kâseye, kaleme yazılır; ayakkabı-zemin teması yazmak tam boy figürü kadraja mecbur ediyor ve karenin plastikleşmesini kendi elimizle emrediyoruz — kaynak: 6. Sınıf - Bizi Bir Arada Tutan Değerler · 2026-07-29 · Mami onayı`
  **Neden bu sırada:** APPROVED #6'nın **kendi uygulanışı** 2. sıradaki kusuru üretiyor: 5/7 kötü karede temas gölgesi ayakkabıya yazılmış, **0/4 iyi karede** yazılmamış. Bu iki satır yan yana durmazsa banka kendi kendini sabote ediyor.
  **Kanıt:** `CANDIDATES-plastik-mesafe-yasasi.md` değişken tablosu (temas gölgesi ayakkabıya: iyi 0/4, kötü 5/7) · `HASAT-6-sinif-bizi-bir-arada-tutan-degerler.md` LOOT #2, kare 13, before/after ✓, tekrar 5.
  **Yasada yok:** `grep -n "TEMAS" agents/PROMPT-YASASI.md` → satır 230 slot [9 TEMAS] jenerik cümleyi verir (*"Every object rests in contact with its surface"*), satır 455 kanıtı verir. **Örneğin hangi nesneye yazılacağı** — yani slot örneğinin kadrajı belirlemesi — hiçbir yerde yok.

### 13. NB2 nesne üretir, DARLIK üretmez

- [ ] `- NB2 nesne üretir, DARLIK üretmez: "bir beden genişliğinde yarık" cümlesi işe yaramıyor, motor karakteri çizip etrafına bol boşluk bırakıyor — sıkışıklık kadrajla zorlanır, kamera olayın hizasına iner ve aralığın iki yanındaki kütleler kadrajı keser — kaynak: 6. Sınıf - Sorunları Birlikte Çözüyoruz · 2026-07-31 · Mami onayı`
  **Neden bu sırada:** **3 karenin 3'ü de BAŞTAN** — kare başına en pahalı sınıf. Tek proje, ama motor davranışı saf ve prompt anında kesilebilir.
  **Kanıt:** `CANDIDATES-2026-07-31-sorunlari-birlikte-cozuyoruz.md` A3 — K28, K29, K30 üçü de baştan üretildi. Aynı projenin karnesi: 54 denetlenen karede 8 BAŞTAN, bunların 3'ü tek bu sebep.
  **Yasada yok:** `grep -in "darlık\|yarık\|sıkışık" agents/PROMPT-YASASI.md` → sıfır hit. Yasa §2b'de motorun ne dinlediğini sayar (geometri evet, ton hayır) ama **mekânsal darlığın** üretilemediğini hiç yazmıyor.

---

## SIRADAKİ 10 — bütçe açılırsa (14-23)

14. **Start frame bir sonraki fazın kısıtını taşır** — `- Start frame, motion'ın onu bozamayacağı şekilde tasarlanır: kalem görünse bile kimse okunabilir yazı yazmaz, yazı doğası gereği hareketli taşıyıcıya (çuval, poşet, sırt, sallanan levha) konmaz, el devri kare içinde bitmiş başlar — kaynak: 6. Sınıf - Sorunları Birlikte Çözüyoruz · 2026-07-31 · Mami onayı`
    Kanıt: `sorunlari-birlikte-cozuyoruz` B5 (Codex) + A2 (kilit yazılıyken KÖMÜR/EKMEK/PARK ETMEYİN gitti). **13'e girmedi çünkü** iki kanıt hattı da yasada motion tarafında yazılı (§3ø satır 667-672, §3a satır 718-722) — yeni olan yalnızca hükmün kare fazına taşınması.
15. **Kare↔dosya eşlemesi örneklemeyle doğrulanır** — 3 proje (`farkli-kulturler` C: `18.png`=K19, `48.png`=K49, 36 klip yanlış VO'ya oturacaktı · `sorunlari` C3: 10-55 → 12-57 · `transkript-enzimi`: *"k20 k6 diye indirdim"*, 7 kare). Prompt kısıtı değil denetim kapısı olduğu için 13'ün dışında.
16. **Anlatısal yan cümle sahneye çevriliyor** (flashback/hatıra) — Kütle K04, 71 bloğun **TEK baştan-üretimi** + 2 reveal + süreklilik kaybı. Yasada hiç yok (`grep -i flashback` → 0). **Tekrar şartını sağlamıyor: 1 kare.** Maliyeti için burada.
17. **Bakış yönü ve yüz ifadesi fiile bağlanır** — 5 kare, 2 proje (`birlikte-daha-gucluyuz` K05/K15/K36, `eseyli` 25.png). Yasada `gaze`/`bakış` yok.
18. **Klip 6 saniye üretilir ve asla yavaşlatılmaz** — `sorunlari` A9 (K08/09/10/44 gerildi) ↔ `degerler` LOOT #11 (teslim 4.04–10.04s). İki kaynak **farklı süre** söylüyor; Mami'nin kararı gerekiyor.
19. **Kararlı vuruş, derinliği kalabalık olmayan kadrajda yapılır** — `motion-tempo` + LOOT #4: yana kayan **5 klibin 5'inde** figür doğdu, eksende kalanlarda **1/8**. C10'un (yasada olan) uygulanabilir koşulu.
20. **Push için "dolly in" değil "boom"** — LOOT #5: dolly-in 6 klibin 5'i ölçüyü aştı, boom **2/2** tuttu. Tek proje.
21. **Soyut/sayısal VO'yu kalıpla sahnele: bir yüzeyde yan yana iki fiziksel nesne, arada el** — 3 proje, n=4, **4'ü de sıfır revize**. Bankadaki tek POZİTİF reçete; küçük örneklem.
22. **Kumaşta yazı yasağı gerginlik koşulludur** — K40 `HER KÜLTÜR DEĞERLİ` gergin ketende doğru; sallanan bezde gitti. Yasağı **genişleten** tek aday (yeni yüzey kazandırıyor).
23. **NB2 çoğaltıyor: her sayı ve kahraman nesne karede TEK** — 5-6 kare, 2 proje (çift kuvvet etiketi, kopya gösterge, `"200 g"` solunda hayalet segment, `"ETKİSİ ETKİSİ"`, Eşeyli 2.png ikinci bardak / 47.png ikinci defter). Rakamın YAZIMI yasada (satır 456), **kopyalanması değil**.

---

## ELENDİ — ve neden

**Yasada zaten yazılı (grep'le doğrulandı — bu turun en büyük değişikliği):**
- **A1 · gövdesiz kol/el** — §2d.1 satır 391 (*"İNSAN KOY, KOL KOYMA — 7 kare"*) **ve** @tag disiplini satır 515-519, son cümlesi birebir aynı: *"Kalabalığı azaltmak için figür KESİLMEZ, figür SAYISI azaltılır."* Birleşik hasadın 1 numaralı adayıydı.
- **A3 · tag'siz ikincil insan / etnisite çıpası** — §2d.8 satır 433-436 (*"2+ karede görünen her insan @taglenir"*) + satır 511-514 (*"TAGSIZ insan MUTLAKA tarif edilir: yaş + Türk/Anadolu + giysi malzemesi + ifade **tek cümlede**"*). Yakınlık kuralı da o "tek cümlede"nin içinde.
- **B6 · yeşil lint iyi demez** — §2ø satır 246, kelimesi kelimesine.
- **B7 · ajanın doktrini Mami'nin kıstası değil** — §1a satır 204-207 **ve** §2d satır 439-441, üç kalem birebir.
- **C10 · motion tempo tekdüzeliği** — §3b satır 760-763 (*"Varsayılan sakin DEĞİL"* · *"'Slow push in' refleks olarak YASAK"*).
- **C12 · simetri varsayılandır** — §2a satır 369-372 + slot [1 LENS] satır 222.
- **D2 · REAL karanlığı yazmıyor** — §2R satır 549-554, `negative fill` + siyah nokta + kontrast oranı dahil.
- **C3 rakam kilidi (yazım yarısı)** — satır 456: *"Sayı ile birim AYRI ve aralıklı yazılır"* + `R = 0 N` örneği. Kopyalama yarısı 23. sırada ayrıldı.
- **C5 dondurma yarısı** — §3a satır 710-716, 34 klip / 26 / %76 ölçümü birebir yasada. Temas noktası yarısı da §3a satır 720-722'de (*"nesnenin el değiştirmesi"*).
- **C6 · el kavramayı klipte bırakmaz** — §3a satır 720-722: *"El değiştirme gerekiyorsa tek klipte yapılmaz — başlangıç+bitiş karesi kullanılır."*
- **C4 · tarif edilmeyen parça ortalamaya düşer** — §2b.3 satır 304-308: *"Form yazılmayan yer, motorun en tanıdık formuyla dolar."*
- **Kavram yazısının konumu / oklüzyon** — satır 458, verilecek cümlesiyle birlikte.
- **Bayrak-arma-rozet → Amerikan bayrağı** — APPROVED #5'te zaten var.
- **Tuzak kelime (`saffron`, `bloom`, `sheen`, `silhouette`)** — §2d.6 satır 423-426 sınıfı adlandırıyor, `src/core/wordTraps.test.ts` iki kelimeyi kilitliyor.
- **Tarif etmek @referansı eziyor** — satır 509-510, birebir.

**Ölçümle çürütülmüş:**
- **"Prompt bütçesi sinematografiye harcanmaz"** (`ONAY-BEKLEYEN` 1, `MAMI-ZEVKI.md:16`) — `CANDIDATES-transkript-enzimi-6-1-2.md` reddediyor: 6.1.2'de Mami'nin **birincil** şikâyeti kadrajdı. Doğru hâli 2. sıradaki satırdır. 🔴 `agents/MAMI-ZEVKI.md:16` düzeltilmeli — ayrı iş.
- **"İyi kare = uzun lens + geniş diyafram"** — `plastik-mesafe` ölçümü reddetti (kötü set 85mm ve 75mm içeriyor).
- **"NB2 4+ kelimede kayar"** ve **"bezde harf erir"** — ikisi de karşı kareyle çürüdü (6. ve 22. sıraya dönüştü).
- **`bloom` kelimesi** — gerçek `generateBatch` ölçümünde prompt yolunda ×0; kaynağı `mamilas-director` skill'inin kendi iç çelişkisi. Skill kusuru, ders değil.

**Kanıtsız — Mami hatırlarsa kurtarılır:**
- **"Canlı üçlünün en az biri isimli yerel madde / dersin görünür kanıtı olsun"** — dayanağı Sürtünme'nin 31/31 temiz geçmesi, ama o projenin **revize dosyası hiç yok** (`HASAT-5-surtunme.md` `REVIZE_NONE`): *"tur yapılmadı"* ile *"kusursuz geçti"* ayrılamıyor. Üstelik Sürtünme'nin lint'i `canli 0/31` diyor — yani ölçüm karşı yönde. Mami *"evet, temizdi"* derse kanıtlı olur.
- **Reverse-güvenli klip fiziği** (buhar/duman/düşen yaprak yasak, yalnız kamera reverse edilir) — iki oturumda tekrarlandı, **tek klip kanıtı yok**.
- **Pencere/manzara dışı dünya kilidine dahil değil** — Eşeyli'de dünya **üç ülke** oldu (Anadolu kiremit → gökdelen → Paris mansart → Fransız arduvaz), 6 kare. Tek proje, tek gözlemci; ikinci proje doğrulaması yok.
- **Türeyen parça ebeveynin malzemesini devralır** — Eşeyli 17.png (hidra tomurcuğu yeşim yerine sert kehribar cam) ve 33.png. 2 kare, 1 proje; ama "aynısı" anlatan derste **pedagojiyi** çürüttüğü için Mami'nin gözü gerekir.
- **Kareyi düzeltmek yerine VO'yu değiştirmek** — Kütle 11.png, Mami'nin kendi kararı (*"Ay'da" → "Dünya'nın öbür ucunda"*), **sıfır kredi**. Korpusun en ucuz düzeltme sınıfı ve hiçbir yerde yazılı değil — ama n=1 ve hüküm zaten Mami'nin.

**Araç / ölçüm kusuru, ders değil:**
- `kapanis-hasadi.mjs` revize ayrıştırıcısı `K19 · REVİZE / kusur: / düzeltme:` biçimini tanımıyor → **29 revizeli projeye %0 revize** yazdı; `_PROMPTLAR-V2.txt` yerine eskisini okudu; `_ENZIM.md` hiç okunmuyor.
- **İkiz teslim dosyası** (`.md` + `.txt`) hasadı `PROMPT_AMBIGUOUS` ile durduruyor — altın standart Eşeyli'den **sıfır ders** çıktı. Gerçek ve pahalı, ama teslim hijyeni; §1.16 zaten `.txt` diyor. Araç turuna.
- `prompt-lint.mjs` yanlış alarmları (Türkçe *"tam boy"* içindeki `boy`, betimlemedeki *"one letter"*).
- **Ad↔sınıf uyuşmazlığı** (proje adı "Ultra Real Commercial", sınıf `ANIMATION_EDU`) — 2 projede, *"hiçbir kapı söylemiyor"*. Kapı işi.
- **A/B kare çiftinde B karesi lint paydasına hiç girmiyor** (48 beyan / 45 ölçüm).
- Karakter oranı, yazı oranı, yüzey tekrarı için lint sayacı yok — **ölçüm eksiği**.

**Süreç / buddy katmanı — banka satırı olmaz:**
- *"Yasa var, KAPI yok"* — enzim skill'i 6.1.2 oturumunda **hiç yüklenmedi**; Mami'nin en çok tekrarladığı üç şeyin üçü de KİLİT 1-3'te zaten yazılıydı. Kusur yasada değil ateşlemede.
- Otomatik yüklenen skill hafızayı ezer · ajan raporuna kör güvenilmez (AGY 5 yanlış alarm) · 28 raporun 6'sı hiç açılmadı · teknik güvenlik takasının Mami'ye söylenmemesi · VO nefes politikası · KESER/GEÇER şiddet kapısı · müzik yerleşimi yetkisi.

**Kelime avı — MAKRO gereği alınmadı:** `sheen`/`negative space` tuzak sayımları · round-robin kadraj (kararın sahibi tanımsız) · tek tek kare düzeltmeleri (takvimde `SUN MON TUE`, pembe kedi kürkü, kavanoz bandı).

**Tutan taraf — kanıt, ders değil:** kavram nesnesinin @tag'i tuttu (K19'da iki kaval piksel piksel aynı) · Farklı Kültürler S4'ün yedi el karesinde gövdesiz kol **0/7** · sekans başına tek ajan 9/9 temiz · NB2 Türkçe diakritiği 42 harfe kadar basıyor · kırılma/kostik/ince-film girişimi çalışıyor.

---

## MEVCUT 7'DEN DEĞİŞMESİ ÖNERİLEN

**① APPROVED #7 EMEKLİ EDİLSİN — bir satır kazandırır (bütçe 13 → 14).**
Eski: `- Dünya malzeme/palet yasası bu kareyi taşımadı — kusur dünyada, kodda değil — kaynak: 5. Sınıf - Birlikte Daha Güçlüyüz · 2026-07-31 · Mami onayı`
Gerekçe: bu satır prompt yazarken **hiçbir karara dönüşmüyor** — hangi dünya, hangi eksik, ne yazılacak belli değil. Uygulanabilir hâli (REAL'de karanlık elle yazılır) **zaten yasada**, §2R satır 549-554. Emekli edilirse hiçbir bilgi kaybolmaz.

**② APPROVED #4 · 8. SIRAYA DEVREDİLSİN — bir satır daha kazandırır (bütçe 14 → 15).**
Eski: `- Ölçü aletinin kadranı da Türkçedir (pusula K/D/G/B, gösterge birimi Türkçe); TEXT slotu yalnız kahraman yazıyı kapsayınca alet üstündeki harfler İngilizce çıkıyor — …`
Gerekçe: kadran, 8. sıradaki "orta plan diegetik yüzey" sınıfının **tek bir üyesidir**. Yeni satır aynı mekanizmayı 7 üyeyle birden kapatıyor (defter, kapak, LCD, kadran, plaka, rozet, takvim) ve kadranı da içeriyor. İki satır yan yana durursa banka kendini tekrar ediyor.

**③ APPROVED #6 YERİNDE KALSIN, ama 12. SIRA YANINA GİRMELİ.**
Mevcut: *"Her nesne yüzeyine yaslanır ve yumuşak temas gölgesi bırakır…"*
Ders doğru, **uygulanışı kusurlu**: temas gölgesi ayakkabıya örneklenince tam boy figür kadraja mecbur oluyor ve 2. sıradaki plastikleşmeyi doğuruyor (5/7 kötü kare, 0/4 iyi kare). Tek başına duran #6 bugün kusur üretiyor.

**④ APPROVED #1 ve #3'ün SINIRI ile GÖRMEDİĞİ SINIF eksik.**
*"Boş bırakılan her yüzeye motor İngilizce uyduruyor"* doğru, ama 5. sıra onun **sınırıdır** (giydirme malzemesi ambalaj olmaz — boşluğu kutuyla doldurmak yazı yüzeyi çoğaltıyor) ve 9. sıra onun **görmediği sınıftır** (yazı doğru yazıldı, ters basıldı). Üçü yan yana durmadan kural yarım: bugünkü hâlini okuyan ajan boşluğu kutuyla dolduruyor ve doğru Türkçeyi ters basıyor.

---

## İKİNCİ GEÇİŞ — kendi seçimimi çürütme

Liste kurulduktan sonra ikinci bir geçiş yapıldı. **Dört şey değişti:**

**① A1 (gövdesiz kol) listeden tamamen çıkarıldı.** Birleşik hasadın **1 numaralı, en pahalı** adayıydı (4 kare BAŞTAN, 3 proje) ve ilk taslağımda da 1. sıradaydı. `PROMPT-YASASI.md` okununca §2d.1 (satır 391) ve @tag disiplini (satır 515-519) **aynı dersi, aynı son cümleyle** taşıyor. Kırmızı çizgi 4 mutlak: bankaya girseydi 13 yerin en pahalısını yasanın kopyası işgal edecekti. Aynı gerekçeyle A3, B6, B7, C10, C12, D2 de düştü — **yedi yer boşaldı** ve liste yeniden kuruldu.

**② C9 (start frame motion kısıtını taşır) 13'ten 14'e indi, yerine C8 (NB2 darlık üretmez) girdi.** İlk sıralamada C9 daha yukarıdaydı çünkü "en genelleşebilir" görünüyordu. İkinci geçişte kanıtları tek tek denendi: iki dayanağı da (hareketli taşıyıcıda yazı erimesi, el devri füzyonu) yasada motion tarafında **zaten yazılı** (§3ø satır 667-672 ve §3a satır 718-722). Geriye kalan katkı hükmün faz değiştirmesi — gerçek ama ikinci dereceden. C8 ise 3 karenin 3'ünü de baştan ürettirdi ve yasada **sıfır** karşılığı var (`grep -i "darlık\|yarık"` → 0 hit). Kırmızı çizgi'nin A ölçütü C8'i öne alıyor.

**③ Sıra 1 ile 2 arasında tartışıldı ve A5 önde bırakıldı.** A2 daha büyük bir sonuç üretti (Mami videoyu reddetti) ama kanıtı n=11 ve **kaynağın kendisi bir confound kaydediyor**: iyi setin 3/4'ü ikinci taslak, K05 kurala uymuyor. A5'in kanıtı bir metadata sayacıdır (`carryOverRate: 0.63`, 12 kare adıyla listeli), yoruma açık değil. **En pahalı ≠ en gürültülü**: ölçütü A ise sayılabilir olan öne geçer.

**④ Üç aday hiçbir listede olmadığı hâlde 13'e girdi.** "Edit triyajı" (4), "üçüncü yazı sınıfı" (8) ve "temas gölgesi örneği" (12) birleşik hasadın 31 maddesinde **yoktu** — ilki hiçbir yerde adlandırılmamıştı, ikincisi `ONAY-BEKLEYEN.md`'de ve `MAMI-ZEVKI.md` 1.3'te *"yasanın bilmediği üçüncü yazı sınıfı"* diye duruyordu ama 31'lik listeye alınmamıştı, üçüncüsü yalnız "mevcudu keskinleştirir" notu olarak vardı. Üçü de kaynak dosyalar tekrar okunduğunda çıktı ve üçü de ölçülü.

**Değişmeyen:** 3. sıra (yokluk/negatif) yasa metniyle **çeliştiği** hâlde listede bırakıldı. Kırmızı çizgi 4 *"yasada olanı ekleme"* der; bu satır yasada olanı **çürütüyor**. Banka tam olarak bunun için var (*"yasanın henüz yakalamadığı derslerin yeri"*) — ama hüküm Mami'nin, çünkü onaylanırsa `PROMPT-YASASI.md` satır 495-499 da düzeltilmelidir.

---

## KAPSAM — bu listenin görmediği

- **Hiçbir kare ya da klip açılmadı.** Bütün kanıt yazılı rapor alıntısıdır; `Resimler/*.png` ve klipler görülmedi. Bir kusurun gerçekten iddia edildiği gibi olup olmadığı bu turda doğrulanmadı. 2. sıra (kadraj kilidi) özellikle görsel doğrulama istiyor.
- **Ham revize dosyaları açılmadı** (`agents/COMMAND-INBOX/Biten/**/*revize*.txt`). HASAT dosyalarındaki alıntılara ve elle yazılan CANDIDATES dosyalarına güvenildi.
- 🔴 **Seçilen 13'ün 4'ü tek bir doğrulanmamış kaynağa dayanıyor.** 3, 6, 13 (ve 14. sıra) **Sorunları Birlikte Çözüyoruz**'dan geliyor; o projede `kapanis-hasadi.mjs` 9 revize dosyasının 9'undan da **0 blok** okudu ve `%0 revize` yazdı (gerçek: 29 revize). Bütün kanıt elle yazılmış `CANDIDATES` dosyasındadır, bağımsız doğrulaması yok.
- 🔴 **`ONAY-BEKLEYEN.md`'nin akıbeti hâlâ bilinmiyor.** Dosya *"APPROVED bugün 0 ders taşıyor"* diyerek 12 satır sunmuş; APPROVED bugün 7 satır taşıyor ve **hiçbiri o 12'den değil**, hiçbir satırda onay işareti yok. Seçilen 13'ün **4'ü** (1, 3, 8, 10) o 12'nin hayatta kalanlarıdır. **Mami o pusulaya ❌ dediyse dördü de elenmelidir** — kayıtta yok.
- **Üç proje ölçülmemiş durumda:** `5. Sürtünme` (revize dosyası yok, lint 31/31 eksikli), `Kuvvet ve Kuvvetin Ölçülmesi` (revize yok, ayrıca .txt 48 kare / .md 58 kare çatalı çözülmedi), `Kuvvet MİRA` (`PROMPT_MISSING`). Bu üçünden ders çıkarılamadı ve **"temiz geçti" denemez.**
- **Eşeyli ve Eşeysiz Üreme** — altın standart — `PROMPT_AMBIGUOUS` yüzünden makine hasadı hiç ders üretmedi; buradaki maddeleri yalnız 25 elle-okunan revize bloğundan çıktı.
- **16. sıra (flashback) tekrar şartını sağlamıyor** — 1 kare. Maliyeti için listede.
- **13. sıra tek projeden** geliyor; iç kontrolü var ama ikinci proje doğrulaması yok.
- 🔴 **Çözülmemiş çelişki — bankaya girmeden önce Mami'nin kararı gerekiyor.** Yazı yükü hakkında üç hüküm aynı anda doğru olamaz: yasa §11c *"karelerin ~yarısı yazı taşır, 36/50 boş da hatadır"* · Mami (6.1.2 transkripti) *"4 dakikalık videoda 2 kere de yazı istemiyorum"* · ölçüm (`sorunlari` A8) *"altı yazı yüzeyli blok 3 baştan, düşük yüklü blok 0 baştan"*. 6. sıra bu çelişkinin **yüzey** eksenini çözüyor, **sıklık** eksenini çözmüyor.
- **18. sıradaki klip süresi de çelişkili:** bir kaynak 6 saniye diyor, diğeri teslim edilen kliplerin 4.04–10.04s olduğunu ölçüyor. Karar verilmeden banka satırı yazılmamalı.

---
---

# GÜNCELLEME — 2026-08-03 akşam (Hücre ve Organelleri turu)

> Yukarıdaki 13 dün seçildi. Bugün Hücre ve Organelleri'nde **16 gerçek kusur** ölçüldü ve
> 91 aday bu kusurlara karşı tarandı. Sonuç sıralamayı yine bozdu — aşağısı gerekçesi.

## A. BUGÜN BAĞIMSIZ İKİNCİ KANITINI ALANLAR (yukarıdaki listeden — öncelikleri arttı)

| # | ders | bugünkü ikinci kanıt |
|---|---|---|
| **1** | referans-edit yarı ömürlü, düzeltme NEGATIVE'e de yazılır | bugün yazılan **12 "change ONLY" edit'inin 12'sinde de NEGATIVE satırı yok**; Bileşke'nin `carryOverRate 0.63`'üne göre ~8'i geri dönecekti. Ajan bunu bağımsız olarak yeniden türetti. |
| **2** | @tag çağıran kare kadrajın neyi dışarıda bıraktığını yazar | Hücre ENZİM'i bu cümleyi yazdı → **53 karede plastikleşme kusuru sıfır.** Artık iki yönlü kanıt (ihlal edilince kötü, uygulanınca temiz). |
| **7** | @tag kimliği taşır, DURUMU taşımaz | dördüncü proje: K26'da mitokondriler K19'da kurulan "sıvıda asılı" rejimini bozup düz yüzeye oturdu. |
| **10** | kavram ışığı bir süreklilik karakteridir | aynı projede iki yönlü: kavram ışığı devrettirildi → 30+ hücre-içi karede sıfır ışık kusuru; **ortam ışığı devrettirilmedi → K04'te K01'in altın saati gri kapalı gökyüzüne kaydı.** Ders bu yüzden "ortam ışığı da dahil" diye genişletilmeli. |
| **12** | temas gölgesi örneği asla ayakkabıya yazılmaz | ENZİM istisnayı yazdı, kusur çıkmadı — ikinci yönlü kanıt. |

## B. YENİ — bugün doğdu, yukarıdaki 13'te ve 91 adayın hiçbirinde YOK

🔴 **B1 · ÇOCUK GÜVENLİĞİ** — 91 adayda ve `PROMPT-YASASI.md`'de karşılığı **sıfır**.
- [ ] `- Çocuk kadrajdaysa kesici alet, açık ateş, kaynar sıvı ve ağza giren nesne YAZILMAZ; iş bitmiş gösterilir (soğan çoktan ikiye ayrılmış, eller tahtada düz duruyor) — ders okula gidiyor, bu bir kalite maddesi değil yayın engelidir — kaynak: 5. Sınıf - Hücre ve Organelleri · 2026-08-03 · Mami onayı`
  kanıt: K10 prompt'u birebir *"the right still holding the knife"* yazıyordu; K09, K40 aynı sınıf. Üçü de birinci denetim geçişinden "temiz" çıktı çünkü hiçbir kıstas onları sormuyordu.

🔴 **B2 · RENDER DİLİ KAYMASI BİR DÜNYA İHLALİDİR**
- [ ] `- Render dili farkı bir süreklilik kusuru değil DÜNYA İHLALİDİR ve tek başına revize sebebidir: EDU karesinde foto-gerçekçi ten, gözenek, sakal kılı ya da oyun-motoru dokusu görülürse kare komşularının diliyle yeniden render edilir — kaynak: 5. Sınıf - Hücre ve Organelleri · 2026-08-03 · Mami onayı`
  kanıt: K02, K04, K40 foto-gerçekçiye kaydı, üçü de "temiz" geçti.
  ⚠ **Bu satır onaylanırsa `PROMPT-YASASI.md` 204-207 ve 438-441 düzeltilmeli** — orada
  *"üslup farkı tek başına revize sebebi DEĞİLDİR"* yazıyor ve bugünkü körlüğü doğrudan o üretti.

🔴 **B3 · VO'NUN NİCELİK VE KONUM SIFATLARI KOMPOZİSYON EMRİDİR**
- [ ] `- VO cümlesindeki her nicelik ve konum sıfatı bir KOMPOZİSYON emridir ve sayıyla yazılır: "hepsi içinde yüzer" → kaç adet ve hangi derinlikte, "ortada duruyordu" → kadrajın merkezinde ve en büyük, "içi sıvı dolu" → sıvının görünür seviyesi; yazılmazsa motor tek örnek koyup gerisini boş bırakıyor — kaynak: 5. Sınıf - Hücre ve Organelleri · 2026-08-03 · Mami onayı`
  kanıt: K19 (VO "bütün organeller" → prompt "three"), K20 (VO "ortada" → prompt "well off centre in the right third"), K35.

🔴 **B4 · KARŞILAŞTIRMA CÜMLESİ İKİ TARAF İSTER**
- [ ] `- "X'te vardı, Y'de yoktu" kalıbındaki her VO cümlesi kadrajda İKİ TARAFI birden ister (bölünmüş kare ya da yan yana iki örnek); tek taraflı kare verilirse cümle ekranda yalnız yarısını buluyor — kaynak: 5. Sınıf - Hücre ve Organelleri · 2026-08-03 · Mami onayı`
  kanıt: K45 ve K48 — üstelik o karelerin NEGATIVE'i çözümü **açıkça yasaklıyordu**
  (*"no split screen and no side-by-side comparison panel"*). Prompt kendi cevabını kapatmış.

🔴 **B5 · VO'NUN UZUV-ÖLÇEĞİ PROMPT'A GEÇER**
- [ ] `- VO bir uzva göre ölçü veriyorsa (tırnağının ucuyla, avucunda, parmak kadar) nesnenin boyu prompt'ta o uzva göre yazılır — yazılmazsa motor nesneyi hikâye önemine göre büyütüyor ve ölçek on kat kayıyor — kaynak: 5. Sınıf - Hücre ve Organelleri · 2026-08-03 · Mami onayı`
  kanıt: K11 — VO "tırnağının ucuyla kaldırdı", gelen kare A4 boyunda sert bir levha.
  Doğru yazım korpusta zaten kanıtlı: K40 *"a soft dome the width of a coin"* → tam o ölçüde geldi.

## C. YER AÇMAK İÇİN DÜŞMESİ ÖNERİLENLER — tavan 13, yukarıya 5 yeni giriyor

Banka bugün **7 ders taşıyor ve 6'sı "kareye yazı nasıl konur"un dersi.** Bugün 21 yazılı karenin
21'i kusursuz çıktı — yani o katman **çözülmüş** durumda. Buna karşılık bugünkü 16 kusurun
**hiçbiri yazı değildi.** Öneri: yazı ailesinden üç satır ve iki dar satır düşsün.

- **#8 üçüncü yazı sınıfı** — bugün 21 karede uygulandı, 0 kusur; artık proje ENZİM'i taşıyor.
- **#6 yazı sınırı yüzey sayısıdır** — aynı aile, bankada zaten 6 yazı dersi var.
- **#9 yazı yüzeye sabitlenir** — aynı aile.
- **#13 NB2 darlık üretmez** — tek projeye özel, dar.
- **#11 iki tag'li karakterde gardırop çıpası** — bugünkü teslimde tek tag'li karakter vardı, sınanmadı.

**Önerilen son 13:** 1 · 2 · 3 · 4 · 5 · 7 · 10 · 12 · B1 · B2 · B3 · B4 · B5

Hüküm Mami'nin: kutucukları o işaretler, otomatik promote yok.

---

# EK — TAM VİDEO İZLENDİ (Bitkilerde, 3:27) · 2026-08-03 gece

> Mami: *"tam videoları izlesene teker teker izleteceğine, hem kurgu da çok basic onu da
> anlarsın."* İzlendi ve **kurgunun neden basic olduğu sayıyla çıktı.** Aşağıdakiler
> tahmin değil, dosyadan ölçüm.

## 🔴 B6 · SABİT KUYRUK FİLMİ 54 KEZ DURDURUYOR — en pahalı tek bulgu

- [ ] `- "No whip-pan, no shake, no snap-zoom, no camera warp" kuyruğu YALNIZ ekranda yazı taşıyan karelere yazılır; her klibe yazılınca her klip DURARAK biter ve film klip sayısı kadar kez durur — kurgunun "basic" hissettirmesinin kök nedeni budur, kesim değil — kaynak: 6. Sınıf - Bitkilerde Üreme · 2026-08-03 · Mami onayı`

kanıt: 53 `KAMERA NİYETİ` satırının **45'i** durma/sabitlik/yaklaşmama emri içeriyor ve
53 klibin **53'ünde** sabit kuyruk var. Bedeli: her klip durarak bitiyor, film 54 kez duruyor.
Kilit yazıyı korumak için var ve **~12 klipte gerçekten gerekli**; kalan 42'de bedava değil,
filmin akışına mal oluyor.

## 🔴 B7 · METRONOM SAYIYLA KANITLANDI

- [ ] `- Bir sekansta plan süreleri BİLEREK farklılaştırılır: tanım/isim planları 1.5-2 saniyeye iner, ödeme planı 8-9 saniye tutulur; bütün planlar aynı bantta kalırsa ritim değil metronom doğar — kaynak: 6. Sınıf - Bitkilerde Üreme · 2026-08-03 · Mami onayı`

kanıt: 54 plan · ortalama **3.84s** · medyan 3.83s · standart sapma **0.68s** · 48'i 3-5 saniye
arasında · **2.09s'den kısa ve 5.00s'den uzun tek bir plan yok.**

## 🔴 B8 · "UZUN ÜRET" BAYRAĞI PLANDA KALIYOR, ÜRETİME GEÇMİYOR

- [ ] `- EDIT-PLAN'da "UZUN ÜRET" işaretli klip, üretim anında motor tarafında da uzun üretilir; plan dosyasında kalan bayrak hiçbir şey değiştirmiyor ve kurgu kırpılmamış klip boyuna mahkûm oluyor — kaynak: 6. Sınıf - Bitkilerde Üreme · 2026-08-03 · Mami onayı`

kanıt: 54 kaynak klibin **51'i tam 5.04 saniye**. EDIT-PLAN 15 klibi `🔴 UZUN ÜRET` diye
işaretlemiş; o 15'ten **yalnız 1'i** gerçekten uzun üretilmiş. Filmde **13 plan tam 4.54 saniye**
— yani kırpılmamış klip boyu.

## 🔴 B9 · PLASTİKLİĞİN SEBEBİ MODEL DEĞİL, IŞIK VE AÇI — Mami'nin sorusunun cevabı

- [ ] `- Karakter kadraja DİK bakıp iki gözü birden aydınlıkken ve yüzünü kesen hiçbir gölge yokken plastik okunuyor; profil ya da dörtte üç durup sert yan/arka ışıkla yüzünün bir yanı karanlığa düştüğünde doğal okunuyor — kare prompt'unda insan yüzü için ışık YÖNÜ ve kadraj AÇISI yazılır — kaynak: 6. Sınıf - Bitkilerde Üreme · 2026-08-03 · Mami onayı`

kanıt: plastik okuyanlar 1:02.2 · 2:42.7 · 2:56.1 · 3:13.9 · 0:10.7 (hepsi cepheden, düz dolgu);
doğal okuyanlar 0:27.5 · 0:30.9 · 2:29.5 · 3:05.3 · **3:08.4 (filmin en iyi karesi — kapı
arkasından, yüzün yarısı karanlıkta)**. Aynı karakter, 30 saniye ara: 0:30.9 gerçek, 1:02.2 oyuncak.
**Mami'nin "bazı sahneler plastik ve AI gibi" sorusunun ölçülmüş cevabı budur.**

## 🔴 B10 · KAHRAMAN KADRAJDAN 80 SANİYE ÇIKAMAZ

- [ ] `- Kahraman kadrajdan 20 saniyeden uzun süre çıkmaz; bilgi anlatılırken KİME anlatıldığı ekranda kalır, yoksa video anlatıya eşlik eden bir slayt gösterisine düşer — kaynak: 6. Sınıf - Bitkilerde Üreme · 2026-08-03 · Mami onayı`

kanıt: 0:32.5 → 1:52.2 arası **80 saniye**, filmin **%38'i**, 21 ardışık makro plan, kahraman yok.
Buna karşılık filmin en iyi 40 saniyesi (2:44-3:27) karakterin neredeyse her planda olduğu bölüm.

## Ek gözlemler — ders adayı değil, doğrudan onarım

- **Kapanış planı anlatıyı yalanlıyor:** VO *"Efe fideyi dikti; arı yeniden geldi"* diyor,
  kadrajda **ne Efe var ne arı** (3:22.9-3:27.4, boş saksı natürmortu). Tek klip yeniden
  üretilecekse bu.
- **Filmin nefesi yok:** anlatı sürenin **%77'sini** kaplıyor, en uzun sessizlik **1.13 saniye**,
  film 0.3. saniyede anlatıyla başlayıp son karede anlatıyla bitiyor.
- **Müzik ters kurgulanmış:** 0:44-2:07 arası en yüksek (−13.7 LUFS), ödeme anında **düşüyor**
  (son bölüm −23.7). Build'in tersi.
- **Tek bir L/J kesim yok** — 53 kesimin 47'si cümle sınırına oturuyor.
- **Süreklilik:** Efe 0:30.9'da düz gri tişört, 1:02.2'de ekose gömlek — aynı sabah, aynı balkon.
- **Showreel kesiti hazır (56 sn):** `0:00-0:13` + `2:44-3:27`. İki parça arka arkaya
  kesildiğinde filmin kendisinden belirgin biçimde daha iyi — çünkü tam da eksik olan iki şeyi
  içeriyor: **kahraman ve olay.**

---

# EK 2 — ESKİ ALTIN STANDART İZLENDİ (Eşeyli, 4:32) · 2026-08-03 gece

> İki bitmiş film baştan sona ölçüldü ve **aynı yere çıktılar.** Mami'nin *"Eşeyli eskidi"*
> hükmünün ölçülmüş karşılığı: **fark kare değil, ZAMAN.**

## 🔴 B11 · YAZILAN KAMERA NİYETİ MOTORA GEÇMİYOR

- [ ] `- Motion metnindeki cesur kamera hareketi (kreyn, orbit, takip) teslimde push-in'e düşüyorsa kusur metinde değil motordadır; kamera niyeti yazıldıktan sonra klip izlenip TESLİM EDİLEN hareket doğrulanır, yoksa yasa yazdığını sandığı şeyi hiç almamış olur — kaynak: 6. Sınıf - Eşeyli ve Eşeysiz Üreme · 2026-08-03 · Mami onayı`

kanıt: 50 planın **34'ü yavaş push-in** · 10 sabit · 3 tilt · 2 geri çekiliş · **tüm filmde
tek bir pan**, sıfır kreyn, sıfır orbit, sıfır takip. `MOTION/30.txt` *"kamera tezgâh tahtasının
altından kreynle yükselip ön plandaki kavanozu sıyırarak"* diyor; 2:36'da teslim edilen şey
nazik bir push-in.

## 🔴 B12 · PLASTİKLİĞİN İKİNCİ YASASI — çocuk BAKARKEN plastik, YAPARKEN doğal

- [ ] `- İnsan karesinde karaktere daima bir EYLEM verilir (uzanmak, çevirmek, yaslanmak, yazmak); yalnız bakan/izleyen karakter plastik okunuyor, elinde ya da gövdesinde iş olan karakter canlı okunuyor — kaynak: 6. Sınıf - Eşeyli ve Eşeysiz Üreme · 2026-08-03 · Mami onayı`

kanıt: doğal okunan **11 anın 11'inde** elde/gövdede bir eylem var (öne eğilme, küreye uzanma,
vidayı çevirme, kalemle yazma, çeneyi kollara yaslama); plastik okunan **12 anın 12'sinde**
karakter yalnızca izliyor. **B9 (ışık ve açı) ile birlikte okunur — ikisi aynı kusurun iki yüzü:
doğal kare = eylem + sert yönlü ışık + eksen dışı açı.**

## 🔴 B13 · REVİZE TESLİME TAŞINMIYOR — denetim değil, TAŞIMA kusuru

- [ ] `- Onaylanan her revize maddesinin teslim edilmiş kareye GERÇEKTEN girdiği tek tek doğrulanır; revize dosyasında yazılı olması uygulandığı anlamına gelmiyor — kaynak: 6. Sınıf - Eşeyli ve Eşeysiz Üreme · 2026-08-03 · Mami onayı`

kanıt: `revize.txt` kostüm kilidi kusurunu **zaten yakalamış** (K8·K18·K29·K40·K46). Aynı
listedeki takvim düzeltmesi (PZT SAL ÇAR…) teslime **girmiş**, kostüm düzeltmesi **girmemiş**:
teslimde çocuk 2:30'da lacivert, 3:24'te haki, geri kalanda turuncu kapüşonlu. Dahası 2:32'deki
yüz **başka bir çocuk** — uzun çene, yetişkin burun, 8 değil 13 yaş.

## 🔴 B14 · MÜZİK FİLMDEN KISA — sessizlik kaza eseri doğuyor

- [ ] `- Müzik dosyasının toplam süresi filmin süresinden kısaysa kurgu ortada sessizliğe düşüyor; kaba kurgu teslim edilmeden önce müzik süresi ile film süresi karşılaştırılır — kaynak: 6. Sınıf - Eşeyli ve Eşeysiz Üreme · 2026-08-03 · Mami onayı`

kanıt: `ses1.wav` (130.5s) + `ses2.wav` (88.6s) = **219 saniye müzik**, film **272 saniye**.
Sonuç: **1:27-2:26 arası 59 saniye müzik YOK** ve o aralık zaten filmin görsel olarak en düz
yeri (73 saniyede sıfır sert kesim). Görüntü ve ses aynı anda düşüyor.

## Ölçülen ama ders adayı olmayan — iki filmin ORTAK deseni

| ölçüm | Eşeyli (4:32) | Bitkilerde (3:27) |
|---|---|---|
| plan sayısı / ortalama | 50 / 5.4s | 54 / 3.84s |
| plan boyu dağılımı | 35'i 4-5s | 48'i 3-5s, sapma 0.68s |
| baskın kamera | 34/50 push-in | 45/53 niyette durma emri |
| en uzun VO nefesi | **0.509 s** | **1.13 s** |
| ışık rejimi | 272s'nin 256'sı (%94) kehribar | tek altın saat |
| kesim-cümle ilişkisi | 50/50 birebir | 47/53 cümle sınırında |
| L/J kesim | 0 | 0 |
| müzik | 59 saniye boşluk | ödeme anında düşüyor |

**HÜKÜM — günün sonucu:** İki film de **fikir katmanında güçlü** (kavramı görüntüye çevirme,
Türkçe yazı, sanat yönetimi) ve **zaman katmanında zayıf**: tek kamera hareketi, tek plan boyu,
tek ışık rejimi, yarım saniyelik tek nefes, hiç L/J kesim. Mami *"daha iyisini yaptık"* derken
kastettiği fark **ritim**, kare değil. Ve ritim kurguda düzeltilemez — **kare yazılmadan önce
tasarlanır.** Bu yüzden bu oturumda doğan `mamilas-plan` skill'i bir süs değil, iki filmde
ölçülmüş bir boşluğun karşılığıdır.

**Showreel aralıkları hazır (ikisi de ölçümle seçildi):**
· Eşeyli — `0:00-0:34` + `4:12-4:32` (54 sn)
· Bitkilerde — `0:00-0:13` + `2:44-3:27` (56 sn)

---

# EK 3 — MÜŞTERİ REVİZESİ · 2026-08-04

> Bu, **müşteriden gelen ilk doğrudan revize** ve bugüne kadarki en pahalı sınıf: ders içeriği
> doğruydu, prompt'lar temizdi, lint yeşildi — ve iş yine reddedildi. Kusur kalitede değil
> **SADAKATTE**.

## 🔴 B15 · KAYNAĞIN DUYGUSAL REJİMİ KİLİTTİR

- [ ] `- Kaynak senaryonun duygusal rejimi dünya kilidi kadar bağlayıcıdır: kaynak olumlu ve çatışmasızsa teslim de olumlu ve çatışmasız olur; yalnızlık, dışlanma, ön yargı ve uzlaşma yayı kaynakta yoksa EKLENMEZ, ve bir karaktere kaynakta olmayan kusur yüklenmez — nesnesi kimliği belirli bir grupsa (göçmen, yabancı, azınlık) asla — kaynak: 5. Sınıf - Farklı Kültürler · 2026-08-04 · Mami onayı`

**Müşterinin cümlesi:** *"senaryoyu dümdüz açtılar, sen neden duygusal video yönüne döndün?
Materyalde hüzün, zenofobi falan yok."*

**Kanıt — kaynak ile teslim yan yana:**

| kaynak senaryo (`Bekleyen/5.sosyal 1.ünite 2.konu video senaryo.docx`) | teslim (`Farklı Kültürler_SESLENDIRME.txt`) |
|---|---|
| Sahne 1: *"Öğrenciler birbirlerini **gülümseyerek karşılar**."* | K02-K04: *"Bahçenin ucundaki bankta, sınıfa yeni gelen bir kız **tek başına** oturuyor… Mira ona bakıyor ama **yanına gitmiyor**; nedenini kendisi de bilmiyor."* |
| Sahne 5: *"İlk anda etkinliğe **uzaktan bakan bir öğrenci** gösterilir. Öğrenci daha sonra arkadaşlarının yanına gider."* — utangaçlık → katılım | K31-K32: *"Mira dün neden uzakta durduğunu şimdi anlıyordu. **Tanımadan karar vermişti; o karar ona ait bile değildi.**"* — miras alınmış ön yargıyla yüzleşme |
| Türk–Bulgar kültürü bir **karşılaştırma örneği** (kaval · zurna · kalaycılık) | **Bulgaristan'dan geçen ay taşınmış, adı Dara olan bir göçmen çocuk** ve onun dışlanması |

Kaynakta **hiçbir çatışma yok.** Ders içeriğinin 20 küsur cümlesi doğru aktarılmış; etrafına
kurulan dramın tamamı ajan icadı.

## 🔴 B16 · GERİLİM ÇATIŞMADAN DEĞİL, MERAKTAN DA DOĞAR

- [ ] `- Çatışmasız bir kaynakta FİKİR kıstası beş kaynaktan biriyle karşılanır — merak (görülmemişe ilk bakış), fark ediş (tanıdığın başka türlü görünmesi), ölçek, dönüşüm (malzemenin hâl değiştirmesi), yankı (iki ayrı şeyin aynı çıkması); hiçbiri kimseyi yalnız bırakmaz, yargılamaz ya da kusurlu göstermez — kaynak: 5. Sınıf - Farklı Kültürler · 2026-08-04 · Mami onayı`

**Kök neden yasanın kendisiydi ve bu maddenin varlık sebebi budur.** §2ø *"görünür bir gerilim
var mı, yoksa kare ölüdür"* ve §3a *"klibin sonu başından farklı olmalı"* diyor. Kaynakta
gerilim yoksa ajan onu **imal ediyor**, ve imal edilen gerilimin en ucuz biçimi **çatışma**:
biri dışlanır, biri yargılar, sonra barışır. Kural yanlış değil, **yarımdı** — ikinci yarısı
şimdi yazıldı.

⚠ İronik kanıt: aynı yasanın uygulandığı `Hücre ve Organelleri` **çatışmasız** ve Mami onu
*"şaheser"* ilan etti. Orada gerilim **meraktan** geliyordu (soğanın içinde duvarı görmek).
Yani doğru yol zaten korpusta vardı, adı konmamıştı.

## Denetime giren yeni soru

Her kare ve her VO cümlesi için: **"Bu kaynakta var mı, yoksa ben mi ekledim? Eklediysem
duygusal rejimi değiştiriyor mu?"** Değiştiriyorsa **çıkarılır — güzel olsa bile.**
Teslim kaynağın filmidir, ajanın filmi değil.
