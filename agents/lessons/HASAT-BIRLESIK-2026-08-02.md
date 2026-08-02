# Birleşik ders hasadı — 20 dosya, 2524 satır (2026-08-02)

> ADAY listesidir. APPROVED.md'ye yalnız Mami taşır. Otomatik promote YOK.
> Kaynak dosyalar okundu ve tekilleştirildi; her aday kanıtıyla birlikte.

**Okunanlar:** 10 `HASAT-*.md` + 10 `CANDIDATES-*.md` + `APPROVED.md` (7 ders) +
`ONAY-BEKLEYEN.md` (damıtılmış 12 satır, bugüne kadar taşınmadı) + `archive/HASAT-kuvvet-mi-ra.md`.

🔴 **TAVAN UYARISI — sırayı Mami'nin okuması gerekiyor.** `src/core/lessonBank.ts` bankadan
`slice(-20)` alır ve bu **konumsaldır, tarihe bakmaz**. APPROVED bugün 7 satır taşıyor; yani bu
listeden **en fazla 13 satır** kimseyi düşürmeden yer bulur. Ondan sonrası dosyanın üstündeki
satırları — yani mevcut 7 dersin en eskilerini — sessizce düşürür. Sıralama bu yüzden tavsiye
değil, **bütçe**: A bölümü tek başına 7 satır.

---

## A — revizeye sebep olmuş (en pahalı)

### A1
**Ders:** `- VO'nun fiilini yapan kişi karede GÖVDE olarak durur — omuz, gövde, yüz açıkça yazılır; "eller", "bir çift el" ya da yalnız fiille anılan insan yazıldığında motor kadraj kenarından gövdesiz kol sokuyor, kalabalığı azaltmak için figür KESİLMEZ figür SAYISI azaltılır — kaynak: 5. Sınıf - Birlikte Daha Güçlüyüz · 2026-07-31 · Mami onayı`
**Kanıt:** `HASAT-5-sinif-birlikte-daha-gucluyuz.md` — K07, K08, K12, K18 dördü de **BAŞTAN** hükmü aldı ("dört kol, sıfır omuz, sıfır gövde, sıfır yüz"); `HASAT-6-sinif-eseyli-ve-eseysiz-ureme.md` 3.png "kimseye ait olmayan iki gri bacak"; `CANDIDATES-2026-07-31-sorunlari-birlikte-cozuyoruz.md` A6 K05 "havada uçan bacak ve çanta". Karşı-kanıt aynı korpusta: Farklı Kültürler S4'ün yedi el karesinde gövdesiz kol **0/7**, çünkü "insan koy, kol koyma" promptta yazılıydı.
**Kaç yerde görüldü:** 4 kaynak · 3 proje · 6 kare, **4'ü baştan-üretim** (korpusun en pahalı sınıfı)

### A2
**Ders:** `- @tag çağıran her kare kadrajın neyi DIŞARIDA bıraktığını yazar ("göğüs altı görünmez", "zemin ve sokak kadrajda yok") — referans sayfası stüdyo ışığında tam boy figürin taşıyor ve kilit cümlesi yoksa o figürin sahnenin lensi ne olursa olsun kareye geliyor — kaynak: 6. Sınıf - Bizi Bir Arada Tutan Değerler · 2026-07-29 · Mami onayı`
**Kanıt:** `CANDIDATES-plastik-mesafe-yasasi.md` — Mami 15 dosyayı elle ayırdı ("hepsi plastik, bozuk oyun hamuru gibi"); md5 ile kare eşlemesi yapıldı: **ayak kadrajda 7/7 kötü, 0/4 iyi**, kadraj kilidi cümlesi **0/7 kötü, 3/4 iyi**. Lens ve diyafram hipotezi aynı ölçümde **çürütüldü** (kötü set 85mm ve 75mm de içeriyor). Tek istisna K34: @tag'li ama iyi, çünkü "nothing below the chest is visible" ithalatı eziyor.
**Kaç yerde görüldü:** 2 kaynak (`plastik-mesafe` + `HASAT-6-sinif-bizi-bir-arada` L.2 #1, tekrar 7) · Mami videoyu reddetti

### A3
**Ders:** `- Karede iki kereden fazla görünen her ikincil insan (öğretmen, komşu, görevli) tag'lenir; "the teacher" gibi tarife bırakılan figürde cast kilidi kaçıyor ve etnisite çıpası kişinin ilk anıldığı cümlede durur, STYLE kuyruğunda değil — kaynak: 6. Sınıf - Kuvvetlerin Güç Birliği · 2026-07-30 · Mami onayı`
**Kanıt:** `CANDIDATES-cast-kilidi-tutmuyor.md` — Mami: *"Bileşke iyi değildi çok ürettim zenciler falan çıktı"*, 16/71 karede iş masadan kalktı. Ölçüm ilk hipotezi çürüttü: `Cast is Turkish/Anatolian only` cümlesi **16/16 karede vardı**. Kaçıran şey `@mira` dışındaki **14 insan anmasının 13'ünün çıpasız** olması (6 kez "the teacher"). Eşeyli'de `@anne` yalnız 7 karede görünüyor ve **tag'li** — aynı sıklık, ters karar, sıfır kaçış.
**Kaç yerde görüldü:** 2 proje karşılaştırmalı · en pahalı sonuç: proje iptali

### A4
**Ders:** `- Yazıyı serbest duran küçük taşıyıcıya (defter yaprağı, kâğıt etiket, koli kapağı) koyma — yazı 180° ters ya da çeyrek tur dönük basılıyor; büyük, bir şeye SABİTLENMİŞ ve sensöre paralel yüzey seç (vidalı plaka, oyulmuş levha, gergin bez, duvara vidalı pano) ve TEXT slotuna taşıyıcının neye sabitlendiğini de yaz — kaynak: 5.1.2 Farklı Kültürler + 5. Sınıf - Birlikte Daha Güçlüyüz · 2026-07-31 · Mami onayı`
**Kanıt:** `CANDIDATES-2026-07-31-farkli-kulturler.md` A — yazı taşıyan 16 karede **imla kusuru sıfır** (32 harflik K51 dahil), ama K03/K08/K32 üçü de ters ve üçünün de taşıyıcısı serbest duran küçük kâğıt. Doğru çıkanların taşıyıcısı: vidalı emaye plaka, oyulmuş ahşap, gergin keten, duvar panosu. Aynı sınıf `HASAT-5-sinif-birlikte-daha-gucluyuz.md`'de K19 (koli üstündeki "GID" baş aşağı) ve K40 (hero yazı "SOSYAL BİLGİLER" 180° ters) ile, `HASAT-6-sinif-kuvvetlerin-guc-birligi.md` 36.png'de aynalanmış kitap kapağıyla tekrar etti.
**Kaç yerde görüldü:** 3 kaynak · 3 proje · 6 kare

### A5
**Ders:** `- Her revize maddesi aynı karenin NEGATIVE satırına da yazılır; yalnız "change ONLY …" ile verilen düzeltme motorda tutmuyor ve kare ikinci tura dönüyor — kaynak: 6. Sınıf - Kuvvetlerin Güç Birliği · 2026-07-29 · Mami onayı`
**Kanıt:** `HASAT-6-sinif-kuvvetlerin-guc-birligi.md` metadata — TUR1 19 kare, TUR2 27 kare, **12 kare ikisinde de** (2, 8, 9, 12, 14, 15, 18, 19, 21, 25, 34, 35) → `carryOverRate: 0.63`. Aynı düzeltme iki kez yazıldı: TUR1 35.png *"correct 'R = ON' to 'R = 0 N'"* → TUR2 35.png *"'R = ON' is wrong — make it 'R = 0 N'"*.
**Kaç yerde görüldü:** 2 kaynak (`HASAT` metadata + `CANDIDATES-2026-07-29` ADAY 2) · 12 kare ikinci kez basıldı

### A6
**Ders:** `- İki tag'li karakter aynı karedeyse tag rolü taşımıyor: eylemi yapanın yanına ayırt edici gardırop çıpası konur ("mor hırkalı kız"), ötekine NE YAPMADIĞI yazılır ("elleri boş kalır, alete hiç değmez") ve NEGATIVE'e "iki karakter kıyafet, saç ya da yüz takas etmez" girer — kaynak: 6. Sınıf - Kuvvetlerin Güç Birliği + 5.1.2 Farklı Kültürler · 2026-07-31 · Mami onayı`
**Kanıt:** Bileşke 16, 23, 30, 52 + K25 (iki turda da) — `@mira` üç kez halatı çekerken çıktı, oysa izlemesi gerekiyordu. `CANDIDATES-2026-07-31-farkli-kulturler.md` D: K17'de prompt doğruydu (`@dara blows across @kaval`, `@mira2's shoulder turned toward the sound`) ama motor **gardırobu takas etti**; K36'da kartı asan kız değişti. İki projede de handle'lar doğruydu.
**Kaç yerde görüldü:** 3 kaynak · 2 proje · 7 kare

### A7
**Ders:** `- Prompt gövdesine yalnız kameranın O AN gördüğünü yaz: VO'daki hatıra, flashback ya da "aklından geçirdi" yan cümlesi kareye girmez — anılan yer ya tamamen sahnelenir ya kareden tamamen çıkar — kaynak: 5. Sınıf - Kütle ve Ağırlık · 2026-07-29 · Mami onayı`
**Kanıt:** `HASAT-5-sinif-kutle-ve-agirlik.md` 4.png (K04) + `CANDIDATES-2026-07-29.md` ADAY 5: VO *"O gün fen dersinde tam da bunun üzerine konuşmuşlardı"* → motor "fen dersinde"yi **mekân** sandı, mutfak yerine sınıf flashback'i geldi; iki ileri reveal (K08 terazi, K13+ aletler) harcandı, K03→K05 mutfak sürekliliği koptu. 71 revize bloğunun **62'si** referans-edit; bu **tek "baştan üret"tir**.
**Kaç yerde görüldü:** 2 kaynak · **1 kare** — ama 71 bloğun tek baştan-üretimi ve üç ayrı zarar (kare + iki reveal + süreklilik). Tekrar şartını sağlamıyor; buraya **maliyeti** için kondu, Mami'nin hükmü gerekir.

---

## B — birden fazla projede tekrar eden

### B1
**Ders:** `- @tag kimliği taşır, DURUMU taşımaz: referansta yazılı olmayan her değişim (bitki bardaktan saksıya geçti, kitap açıldı, çanta boşaldı) o karede yeniden yazılır — yazılmazsa nesne referans durumuna geri dönüyor — kaynak: 6. Sınıf - Eşeyli ve Eşeysiz Üreme · 2026-07-31 · Mami onayı`
**Kanıt:** `HASAT-6-sinif-eseyli-ve-eseysiz-ureme.md` — K32'de gül saksıya dikiliyor (dersin dönüm noktası) ama K34–K38 **beş karede** bardağa geri dönmüş, K38'de kökler suda; ayrıca 44.png `@anne` gardırop kilidi kırık. `HASAT-6-sinif-kuvvetlerin-guc-birligi.md` aynı sınıf: 32/34/36/37.png dördü de `@kitap` süreklilik edit'i. `HASAT-sabit-surat-ve-hiz.md` 3.png `renk-süreklilik` — aynı çanta kareden kareye renk değiştirdi.
**Kaç yerde görüldü:** 3 kaynak · 3 proje · 10 kare

### B2
**Ders:** `- Kavram ışığı bir SÜREKLİLİK KARAKTERİDİR: her kare bir öncekinin ışığını değişmiş durumuyla devralır ("aynı ışık, taşınmış hâli"), sıfırdan doğan kavram ışığını motor taç yapraklı çiçeğe ya da ok ucuna çeviriyor — kaynak: Sabit Sürat ve Hız ↔ 6. Sınıf - Kuvvetlerin Güç Birliği · 2026-07-29 · Mami onayı`
**Kanıt:** Bileşke'de **8 blok / 7 kare** tek düzeltmeyle (TUR1 15, 18 · TUR2 5, 6, 15, 31, 33, 47) — *"drawn as saffron-crocus FLOWERS with petals"*; artı 38.png ok versiyonu, 19.png ışık cilde yapışmış. Sabit Sürat 44 karede 8 revize aldı ve **hiçbiri kavram ışığı değil**. Fark prompt'ta: Sabit Sürat ışığı beat'ten beat'e devrediyor. Kelime düzeltmesi (`saffron`→`warm golden`) zaten `wordTraps`'te ve **yetmedi**.
**Kaç yerde görüldü:** 2 kaynak · 2 proje karşılaştırmalı · 9 kare

### B3
**Ders:** `- Bakış yönünü ve yüz ifadesini fiile açıkça bağla ("gözleri yazdığı harflerin üstünde", "kaşlar sakin, ağız kapalı") — yazılmazsa motor bakışı boşluğa çeviriyor ya da VO'nun duygusuyla çelişen bir ifade basıyor — kaynak: 5. Sınıf - Birlikte Daha Güçlüyüz · 2026-07-31 · Mami onayı`
**Kanıt:** `HASAT-5-sinif-birlikte-daha-gucluyuz.md` — 5.png "iki komşu hasara BAKMIYOR, birbirlerine bakıyor, adam neredeyse gülümsüyor"; 15.png "tebeşirle yazarken gözleri yazıya değil kimsenin olmadığı bir yöne, kaşlar endişeli"; 36.png "kızın yüzü ŞOK okuyor, VO sakin ve ısıtıcı". `HASAT-6-sinif-eseyli-ve-eseysiz-ureme.md` 25.png: "Efe defterine değil sağ üste bakıyor".
**Kaç yerde görüldü:** 2 kaynak · 2 proje · 4 kare

### B4
**Ders:** `- Kareler indiği an, motion yazılmadan önce kare↔dosya eşlemesi ÖRNEKLEMEYLE doğrulanır (baştan, ortadan ve sondan birer kare açılıp kendi VO cümlesiyle karşılaştırılır); üretilmeyen kare varsa sayı kayması VARSAYILIR — "N.png = KN" bir sözleşmedir, bir gerçek değil — kaynak: 5.1.2 Farklı Kültürler · 2026-07-31 · Mami onayı`
**Kanıt:** `CANDIDATES-2026-07-31-farkli-kulturler.md` C — K02 ve K17 üretilmeyince `18.png` aslında K19, `48.png` aslında K49 oldu; prompt, lint, edit-plan ve motion yasası **hiçbiri görmüyor**, hepsi dosya adına güveniyor; bulunmasaydı 36 klip yanlış VO cümlesinin altına oturacaktı. `CANDIDATES-2026-07-31-sorunlari-birlikte-cozuyoruz.md` C3: dosyalar 10-55 → 12-57 kaydırıldı, brief'teki tarif sessizce yanlış oldu. `CANDIDATES-transkript-enzimi-6-1-2.md`: *"k20 k6 diye indirdim"*, 7 kare.
**Kaç yerde görüldü:** 3 kaynak · 3 proje

### B5
**Ders:** `- Teslim dosyasını `<Ad>_<PARÇA>.txt` adıyla TEK ve nihai bırak; ikinci aday dosya ya da .md ikizi bırakma — ikiz dosya kapanış hasadını tamamen durduruyor ve o projeden hiç ders çıkmıyor — kaynak: 6. Sınıf - Eşeyli ve Eşeysiz Üreme · 2026-07-31 · Mami onayı`
**Kanıt:** `HASAT-6-sinif-eseyli-ve-eseysiz-ureme.md` status **ERROR** / `PROMPT_AMBIGUOUS` — `.md` ve `.txt` ikizi yüzünden **ders adayı üretilmedi**, altın standart sayılan projeden sıfır ders çıktı. `HASAT-kuvvet-mira.md` `PROMPT_MISSING`. Okunan 10 HASAT dosyasının **kit tablosunda ad sapması ~50 satır**; `CANDIDATES-2026-07-31-sorunlari-birlikte-cozuyoruz.md` D2: hasat `_PROMPTLAR-V2.txt` yerine eski dosyayı okudu.
**Kaç yerde görüldü:** 10 HASAT dosyasının 9'u · 2 proje ölçülemedi

### B6
**Ders:** `- Yeşil lint "temiz" demektir, "iyi" demez ve kırmızısı da kanıt değil: lint etiketin BİÇİMİNİ ölçüyor, sahnenin yeteneğini değil — kırmızı satırı düzeltmeden önce promptun gerçek satırı gözle okunur — kaynak: 5. Sürtünme ↔ 6. Sınıf - Kuvvetlerin Güç Birliği · 2026-07-29 · Mami onayı`
**Kanıt:** `CANDIDATES-2026-07-29.md` soru 3 — linter 0-revize alan Sürtünme'ye **31/31 kırmızı**, %65 revize alan Bileşke'ye **52/52 kırmızı** veriyor; Sürtünme "Three physics beats:" yazıyor, linter "canlı üçlü" arıyor. `CANDIDATES-dunya-turu-2026-07-30.md` C1 (Türkçe "tam boy" içindeki `boy`) ve C2 (betimlemedeki "one letter" harf sayacına takıldı) iki ayrı yanlış alarm. `CANDIDATES-2026-07-28-yazi-yuzeyi.md`: `TEXT:` 14/14 mevcuttu, lint yeşildi, tekdüzelik kapının altından geçti.
**Kaç yerde görüldü:** 3 kaynak · 4 proje

### B7
**Ders:** `- Ajanın denetim doktrini Mami'nin kıstası değildir: bir kare/klip yalnız üç sebeple reddedilir — sahneyle uymuyor, bozuk yazı, yanlış şey; başka gerekçeyle işaretlenen iş Mami'ye "reddedildi" diye çıkmaz, "bak" diye çıkar — kaynak: 6. Sınıf - Sorunları Birlikte Çözüyoruz · 2026-07-31 · Mami onayı`
**Kanıt:** `CANDIDATES-2026-07-31-sorunlari-birlikte-cozuyoruz.md` C2 — klip raporu **32 klibi** *"arka planda biri donuk"* diye çöpe atmak istedi; Mami beşine baktı ve beşini de beğendi. Aynı dosyada C1: AGY beş kez yanlış alarm verdi (tag'siz arka plan figürünü tag'li karakter sandı, yasağı fiil saydı).
**Kaç yerde görüldü:** 1 proje, ama 32 klip — yanlış kabul edilseydi tek kalemde en büyük gereksiz yeniden-üretim

### B8
**Ders:** `- Soyut ya da sayısal VO'yu formülle değil kalıpla sahnele: bir yüzeyde yan yana iki fiziksel nesne, arada el — kaynak: Kütle + Sabit Sürat + Bileşke · 2026-07-29 · Mami onayı`
**Kanıt:** `ONAY-BEKLEYEN.md` 11 — üç projede 4 soyut/sayısal VO cümlesi bu kalıpla sahnelendi, **4'ü de sıfır revize** aldı.
**Kaç yerde görüldü:** 1 kaynak · 3 proje · n=4 (küçük örneklem, ama tek yönlü)

---

## C — motor davranışı

### C1
**Ders:** `- Yokluk pozitif cümleyle istenmez ve kaldırılacak kelime adıyla anılmaz — "şu yazıyı sil" dediğinde motor onu ÇAĞIRIYOR; ne yazacağını harf harf yaz, boş kalacak yüzeyi açıkça bildir ve yasağı NEGATIVE satırına koy — kaynak: 6. Sınıf - Sorunları Birlikte Çözüyoruz · 2026-07-31 · Mami onayı`
**Kanıt:** `CANDIDATES-2026-07-31-sorunlari-birlikte-cozuyoruz.md` A4 — K49'da `plastic` kaldırılmak istendi; yeni basımda kaldı ve **üstüne `Mayan` + `Hard` doğdu** (Mami'nin kendi düzeltmesi). `ONAY-BEKLEYEN.md` 7'nin ölçümü aynı sınıf: **2 pozitif "kimse yok" cümlesinin 2'si sızdı, 23 negatif maddenin 0'ı sızmadı.** Aynı dosya NB2'nin Türkçe diakritiği basabildiğini kanıtlıyor (K57 `RAMPA·ÇÖP·LAMBA`, K55'te 42 harf kusursuz) — sorun yazma yeteneği değil, silme emri.
**Kaç yerde görüldü:** 2 kaynak · 2 proje

### C2
**Ders:** `- Yazı sınırı KELİME değil YÜZEY sayısıdır: tek yüzeyde büyük punto ve sensöre paralel olmak koşuluyla 30+ harf tutuyor, ayrı yüzeylere dağıtılan kısa kelimeler kırılıyor — kareye yazı koyacaksan tek yüzeyde topla — kaynak: 5.1.2 Farklı Kültürler ↔ 6. Sınıf - Sorunları Birlikte Çözüyoruz · 2026-07-31 · Mami onayı`
**Kanıt:** `CANDIDATES-2026-07-31-farkli-kulturler.md` TUTAN TARAF — K51'in **32 harfi** tek yüzeyde kusursuz çıktı, "NB2 4+ kelimede kayar" sınırı çürüdü. `CANDIDATES-2026-07-31-sorunlari-birlikte-cozuyoruz.md` A7: defter sayfası üç kelimeyi tuttu, **üç kapaklı `@kutu` iki karede de kırıldı.** Aynı dosya A8 maliyet ölçümü: altı yazı yüzeyli blok **3 dokunma / 4 revize / 3 baştan**, düşük yazı yüklü blok **9 / 2 / 0** — aynı gün, aynı motor, aynı yazar.
**Kaç yerde görüldü:** 2 kaynak · 2 proje · iki yönlü kanıt

### C3
**Ders:** `- Rakamı kelimeden ayrı kilitle (basamak + birim tek tek hecelenir, "R = 0 N" asla "R = ON") ve her sayıyı, her kahraman nesneyi karede TEK bırak — NB2 rakamı bozuyor ve etiketi kopyalıyor — kaynak: 6. Sınıf - Kuvvetlerin Güç Birliği + 5. Sınıf - Kütle ve Ağırlık · 2026-07-29 · Mami onayı`
**Kanıt:** Bileşke 12, 17, 18, 24, 35, 50.png `sayısal-etiket` sınıfı (10 blok); Kütle 23.png *"'60 kg' with clean digits (not '60 66')"* ve 33.png *"remove the faint ghost/extra segment digits to the left of '200 g'"*. `ONAY-BEKLEYEN.md` 6: **4 rakam hatası / 0 kelime hatası** — hata dilde değil, sayıda.
**Kaç yerde görüldü:** 3 kaynak · 2 proje · 9 kare

### C4
**Ders:** `- Tarif edilmeyen parça boş kalmaz, motorun ortalamasına düşer: nesne tarif ediliyorsa üstündeki beden parçası da, formun malzemesi de, tomurcuğun dokusu da yazılır — kaynak: 6. Sınıf - Sorunları Birlikte Çözüyoruz · 2026-07-31 · Mami onayı`
**Kanıt:** `CANDIDATES-2026-07-31-sorunlari-birlikte-cozuyoruz.md` A5 — `@derin`'in sandalyesi "scuffed footplate"e kadar yazılmıştı, **ayakları hiç yazılmamıştı** → üç karede ayaklık boş çıktı. `HASAT-6-sinif-eseyli-ve-eseysiz-ureme.md` 17.png: hidranın tomurcuğu ebeveynin yeşim dokusunda değil sert kehribar cam küre çıktı. `CANDIDATES-dunya-turu-2026-07-30.md` §2b: *"form yazılmazsa motor en tanıdık formu getiriyor."*
**Kaç yerde görüldü:** 3 kaynak · 3 proje

### C5
**Ders:** `- Motion'a "kıpırdama / dondur" yazma: donuk gövde emredilen klipte motor yüzü, gözü ve eli eritiyor — hareket riski kadrajdaki insan sayısı ve temas noktası azaltılarak düşürülür, çünkü morphing özneye değil TEMAS NOKTASINA ve arka plandaki ikincil figüre çöküyor — kaynak: 6. Sınıf - Sorunları Birlikte Çözüyoruz + 6. Sınıf - Bizi Bir Arada Tutan Değerler · 2026-07-31 · Mami onayı`
**Kanıt:** `CANDIDATES-2026-07-31-sorunlari-birlikte-cozuyoruz.md` A1 — 34 klibin **26'sında (%76)** gövde heykel, yüz sıvı (`artifacts/denetim-2026-07-31/agy-20-en-kotu-proje-klipleri.txt`). `HASAT-6-sinif-bizi-bir-arada-tutan-degerler.md` L.2 #12: 12 bozuk klibin **7'sinde kusur el-ele nesne devri anında, 8'inde arka plandaki ikincil figürde**; temiz 22 klibin 12'sinde sahnede ya hiç insan yok ya tek eylem sahibi var.
**Kaç yerde görüldü:** 2 kaynak · 2 proje · 46 klip

### C6
**Ders:** `- El kavradığını klipte BIRAKMAZ: devir, tokalaşma, omuza el koyma ve parmak kilitleme KAREDE bitmiş başlar, motion yalnız yerleşmeyi taşır — kaynak: 6. Sınıf - Bizi Bir Arada Tutan Değerler · 2026-07-29 · Mami onayı`
**Kanıt:** `HASAT-6-sinif-bizi-bir-arada-tutan-degerler.md` L.2 #3 — kavrama devri emredilen **7 klibin 7'sinde** el/uzuv füzyona girdi; kavrayışı sabit **6 klipte 0**. Temiz kontrol grubu var.
**Kaç yerde görüldü:** 1 proje · 13 klip · iki yönlü

### C7
**Ders:** `- Klip 6 saniye üretilir: 5s'lik klipten baş 0.5s kırpılınca 4.54s kalıyor, uzun VO cümlesi sığmıyor ve tek çare yavaşlatma oluyor — gerilmiş klip kekeliyor, süre KAYNAKTA belirlenir teslimde değil — kaynak: 6. Sınıf - Sorunları Birlikte Çözüyoruz · 2026-07-31 · Mami onayı`
**Kanıt:** `CANDIDATES-2026-07-31-sorunlari-birlikte-cozuyoruz.md` A9 — K08, K09, K10, K44 tam bu yüzden gerildi. `HASAT-6-sinif-bizi-bir-arada-tutan-degerler.md` L.2 #11: MOTION 10s klip + son 1.5s atılır varsayıyor ama teslim edilen klipler **4.04–10.04s**; 5 saniyelik üretimde bozuk kuyruk ekranın %30'u oluyor.
**Kaç yerde görüldü:** 2 kaynak · 2 proje

### C8
**Ders:** `- NB2 nesne üretir, DARLIK üretmez: "bir beden genişliğinde yarık" cümlesi işe yaramıyor, motor karakteri çizip etrafına bol boşluk bırakıyor — sıkışıklık kadrajla zorlanır, kamera olayın hizasına iner ve aralığın iki yanındaki kütleler kadrajı keser — kaynak: 6. Sınıf - Sorunları Birlikte Çözüyoruz · 2026-07-31 · Mami onayı`
**Kanıt:** `CANDIDATES-2026-07-31-sorunlari-birlikte-cozuyoruz.md` A3 — K28, K29, K30 **üçü de aynı sebeple BAŞTAN**.
**Kaç yerde görüldü:** 1 proje · 3 kare, üçü de baştan-üretim

### C9
**Ders:** `- Start frame bir sonraki fazın kısıtını taşır: kare, motion'ın onu bozamayacağı şekilde tasarlanır (kalem görünse bile kimse okunabilir yazı yazmaz, yazı doğası gereği hareketli taşıyıcıya konmaz) — kaynak: 6. Sınıf - Sorunları Birlikte Çözüyoruz · 2026-07-31 · Mami onayı`
**Kanıt:** `CANDIDATES-2026-07-31-sorunlari-birlikte-cozuyoruz.md` B5 (Codex'in fikri) — ve aynı dosya A2 bunu ölçüyor: **kilit yazılmış olmasına rağmen** doğası gereği hareketli taşıyıcıda (çuval, poşet, sırt, sallanan levha) yazı yine gitti (KÖMÜR, EKMEK, PARK ETMEYİN). C6'daki 7/7 el füzyonu da aynı mekanizmanın örneği: motion'ın taşıyamayacağı iş kareye yüklenmiş.
**Kaç yerde görüldü:** 3 kanıt hattı · 1 proje — en genelleşebilir madde

### C10
**Ders:** `- Motion'da slow/eased varsayılan olamaz: her sekans en az bir shot'ta kararlı bir vuruş taşır ve kesimden kesime tempo değişir, o vuruş arka planı kalabalık olmayan kadrajda yapılır — kaynak: 6. Sınıf - Bizi Bir Arada Tutan Değerler · 2026-07-29 · Mami onayı`
**Kanıt:** `CANDIDATES-motion-tempo-tekduzeligi.md` — 34 kamera cümlesinin **34'ü** `slow`/`eased`/`locked`, kararlı vuruş sözcüğü **2/34**; repertuar üç hareket (yavaş içeri, yavaş boom, yavaş yana). Mami'nin hükmü: *"sahneler çok dull."* Mekanizma ölçüldü: motion yazarı morphing riskini düşürmek için hareketi kıstı — bu bir **takas**, ve Mami'ye söylenmedi.
**Kaç yerde görüldü:** 2 kaynak (`CANDIDATES-motion-tempo` + `HASAT-6-sinif-bizi-bir-arada` L.2 #13/#14) · 1 proje · 34 shot

### C11
**Ders:** `- Kamera büyüklüğü sözle tutulmuyor: push gerekiyorsa "dolly in" değil "boom" yazılır — dolly-in yazılan 6 klibin 5'i emredilen ölçüyü aştı, boom yazılan 2/2 ölçüsünde kaldı — kaynak: 6. Sınıf - Bizi Bir Arada Tutan Değerler · 2026-07-29 · Mami onayı`
**Kanıt:** `HASAT-6-sinif-bizi-bir-arada-tutan-degerler.md` L.2 #5 — "birkaç santim" denilen yerde yakın plana gidildi.
**Kaç yerde görüldü:** 1 proje · 8 klip · iki yönlü

### C12
**Ders:** `- Simetri motorun varsayılanıdır: ön planda kadrajı kesen bir çapa yoksa NB2 tek nokta perspektifine düşüyor (özne ortada, yol ortada, iki figür yan yana eşit) — kalabalık hissi gövdeyle değil eşyayla kurulur — kaynak: 20 karelik dünya turu · 2026-07-30 · Mami onayı`
**Kanıt:** `CANDIDATES-dunya-turu-2026-07-30.md` D1–D2 — aynı sahne kalabalıklı ve kalabalıksız basıldı, **ikisinde de simetri kaldı**: suçlu kalabalık değil çapasızlıktı; ekranda ~30-40 piksellik yüzde kimlik tarifle taşınamıyor. `CANDIDATES-2026-07-31-sorunlari-birlikte-cozuyoruz.md` B3 aynı hükmü tersinden veriyor: "üç katmanlı derinlik + ön plan örtmesi — dekor hissini öldüren tek şey."
**Kaç yerde görüldü:** 2 kaynak · 2 proje · 4 dünya

---

## D — dünya / palet / referans

### D1
**Ders:** `- Boş yüzey giydirilirken malzeme YAZISIZ olandan seçilir (katlanmış kumaş, kraft rulosu, ters çevrilmiş kap, etiketsiz sepet, ahşap, cam); kutu, teneke, ambalaj ve şişe giydirme malzemesi DEĞİLDİR — onlar yeni yazı yüzeyidir — kaynak: 5.1.2 Farklı Kültürler · 2026-07-31 · Mami onayı`
**Kanıt:** `CANDIDATES-2026-07-31-farkli-kulturler.md` B — uydurma İngilizce üç karede çıktı (K13 `POWDERZD FLOX`, K24 `SAKAT TABARIM`, K29 `OKR BOYASI`) ve **üçü de giydirme talimatının uygulandığı yerde** doğdu ("rafı malla doldur", "kutuları istifle", "tezgâhı giydir"). Boşluğu kapattık, yazı yüzeyini çoğalttık. Aynı sınıf `HASAT-5-sinif-birlikte-daha-gucluyuz.md` 47.png'de çimento torbalarında tekrar etti.
**Kaç yerde görüldü:** 2 kaynak · 2 proje · 4 kare — **APPROVED #1'in ölçülmüş SINIRI**

### D2
**Ders:** `- REAL register'da dünya metni diyaframı yazıyor ama KARANLIĞI yazmıyor: negative fill, siyah nokta, kontrast oranı ve ışığın nerede bittiği prompt'a ELLE eklenir, yoksa kare düz aydınlatılmış plastik çıkıyor — kaynak: 20 karelik dünya turu · 2026-07-30 · Mami onayı`
**Kanıt:** `CANDIDATES-dunya-turu-2026-07-30.md` B3 — dört gerçek/reklam dünyasının **hiçbirinde** bu cümleler yok; ajan dördüne de elle eklemek zorunda kaldı ve o satırlar olmasa dördü de düz plastik çıkardı. §2R'nin adını koyduğu "REAL boşluğu"nun kütüphane kaynağı bu.
**Kaç yerde görüldü:** 1 kaynak · 4 dünya · 4/4 elle müdahale

### D3
**Ders:** `- Dünya STYLE metnini olduğu gibi yapıştırma: üç dünyada gerçek kişi/stüdyo adı sızıyor (ghibli_hayao → "Hayao Miyazaki", arcane_fortiche → "Fortiche Production", spiderverse_sony → "Sony Pictures Animation") ve bu dünyanın KENDİ negatifiyle çelişiyor — kilit çıktısındaki marka adı prompt'a girmeden silinir — kaynak: 20 karelik dünya turu · 2026-07-30 · Mami onayı`
**Kanıt:** `CANDIDATES-dunya-turu-2026-07-30.md` B1 — marka sökücü üç dünyada çalışmamış; global negatif *"no recognizable franchise, logos, brand names"* derken STYLE stüdyo adı gönderiyor. B2: `laika_stopmotion`'da sökme sonrası sakat cümle kalmış (*"in the Studios theatrical lineage"*).
**Kaç yerde görüldü:** 1 kaynak · 4 dünya metni · motora şu an gerçek kişi adı gidiyor

### D4
**Ders:** `- Kumaş taşıyıcıda yazı yasağı MUTLAK değil, GERGİNLİK KOŞULLUDUR: gergin, düz ve bir yüzeye yapışık keten/bez üstünde harf erimiyor — gevşek ya da sallanan bezde eriyor — kaynak: 5.1.2 Farklı Kültürler · 2026-07-31 · Mami onayı`
**Kanıt:** `CANDIDATES-2026-07-31-farkli-kulturler.md` TUTAN TARAF — K40 "HER KÜLTÜR DEĞERLİ" gergin ketende doğru çıktı; yasa "bezde harf erir" diyordu. Ters yön aynı korpusta ölçülü: `sorunlari-birlikte-cozuyoruz` A2'de sallanan/hareketli bez taşıyıcıda yazı gitti.
**Kaç yerde görüldü:** 2 kaynak · 2 proje — yasağı **genişleten** tek aday (yeni yüzey kazandırıyor)

---

## MEVCUDU KESKİNLEŞTİRİR

**APPROVED #6** — *"Her nesne yüzeyine yaslanır ve yumuşak temas gölgesi bırakır; slot düşünce nesne havada yüzüyor"*
→ eklenecek keskin hâli: `- Temas gölgesi örneği ASLA ayakkabıya yazılmaz — kepçeye, kirkite, kâseye, kaleme yazılır; ayakkabı-zemin teması yazmak tam boy figürü kadraja mecbur ediyor — kaynak: 6. Sınıf - Bizi Bir Arada Tutan Değerler · 2026-07-29 · Mami onayı`
Kanıt: `CANDIDATES-plastik-mesafe-yasasi.md` — temas gölgesi ayakkabıya yazılmış **5/7 kötü karede, 0/4 iyi karede**. Mevcut ders doğru ama kendi uygulanışı A2'nin kusurunu üretiyor: iki satır yan yana durmalı.

**APPROVED #1 ve #3** — *"boş bırakılan her yüzeye motor İngilizce uyduruyor"*
→ D1 bu dersin **sınırıdır** (giydirme malzemesi ambalaj olmaz) ve A4 onun **görmediği sınıftır** (yazı doğru yazıldı, ters basıldı). Üçü yan yana durmadan kural yarım kalıyor: mevcut hâli okuyan ajan boşluğu kutuyla dolduruyor ve doğru Türkçeyi ters basıyor.

**APPROVED #7** — *"Dünya malzeme/palet yasası bu kareyi taşımadı — kusur dünyada, kodda değil"*
→ Bu satır prompt yazarken **hiçbir karara dönüşmüyor**: hangi dünya, hangi eksik, ne yazılacak belli değil. Uygulanabilir hâli D2 ve D3'tür. Mami isterse #7 emekliye ayrılıp yerine ikisi geçer — banka tavanı (20) düşünülürse bu bir satır kazandırır.

---

## ELENDİ — ve neden

**Zaten yasada (`PROMPT-YASASI` §2 / §11) — banka kilit seviyesindedir, cümle seviyesi değil:**
- Kavram ışığı yuvarlak sıcak-altın, çiçek/sap/ok değil · kuvvet ışığı nesnede, cildin üstünde değil (§2 slot 6). **Yalnız SÜREKLİLİK kısmı ayrıldı → B2.**
- Karedeki yazı Türkçe ya da hiç · arka plan tabelası bulanık ve kısa · bayrak/arma/rozet TEXT kuyruğunda · ten sıcak mat, gardırop @referansta (§2 kalıcı kilitler). Zaten APPROVED #1–#5.
- Nesne yüzeye yaslanır, temas gölgesi bırakır (§2 slot [9 TEMAS]) — APPROVED #6.
- Tekrar eden prop üretimden önce referans + @tag; referans envanteri ilk iştir (§4a).
- Yazı cimriliği ve tekdüzeliği, hedef ~yarı kare (§11a-c, `prompt-lint` `tekduzelik-yazi` tuzağı zaten koşuyor).
- "Yazı ebeveyn yüzeyden doğar" · "kavram yazısının konumu yazılır" · "STYLE ≤110 kelime" — slot metni, yasanın işi.

**Zaten kodda — ajanın hatırlamasına gerek yok:**
- `saffron` → `warm golden` ve `SSS` → `subsurface-style translucency` (`src/core/wordTraps.test.ts`).

**Kanıtsız — Mami hatırlarsa kurtarılır:**
- **"Canlı üçlü dersin görünür kanıtı olsun"** — en güçlü dayanağı Sürtünme'nin 31/31 temiz geçmesi, ama o projenin **revize dosyası hiç yok**: "tur yapılmadı" ile "kusursuz geçti" ayrılamıyor (`HASAT-5-surtunme.md` `REVIZE_NONE`). Mami "evet, temizdi" derse ders kanıtlı olur.
- **Reverse-güvenli klip fiziği** (buhar/duman/düşen yaprak yasak) — iki oturumda tekrarlandı ama **tek kare/klip kanıtı yok**.
- **Anime dünyalarında telif kilidi elle yazılır** (`dunya-kilidi.mjs` isim listesini sıkıştırıyor) — hiçbir karede sızma ölçülmedi, araç eksiği olarak duruyor.
- **Kuvvet ve Kuvvetin Ölçülmesi** (48 kare) ve **Kuvvet MİRA** — revize dosyası yok, bu iki projeden hiç ders çıkmadı; "temiz" değil **ölçülmemiş**.

**Çelişkili kanıt — korpus kendi kendini çürüttü:**
- **"Prompt bütçesi sinematografiye harcanmaz; 71 revizenin 0'ı ışık/lens/kadraj değiştirdi."** `CANDIDATES-transkript-enzimi-6-1-2.md` bunu doğrudan reddediyor: 6.1.2'de Mami'nin **birincil** şikâyeti kadrajdı (*"hepsi plastik, bozuk oyun hamuru"* → ölçüm: ayak kadrajda 7/7 kötü, 0/4 iyi). Ders bu hâliyle bankaya girerse sonraki ajan aynı sınıfı yine görmezden gelir. **Doğru hâli A2'dir:** revize edilmeyen şey ışığın *kalitesi*, revize edilen şey kadrajın *kilidi*. `agents/MAMI-ZEVKI.md:16` da bu yüzden düzeltilmeli — ayrı iş.

**Araç onarımı, ders değil:**
- `kapanis-hasadi.mjs` revize ayrıştırıcısı bizim `K19 · REVİZE / kusur: / düzeltme:` biçimini tanımıyor → 29 revizeli projeye **%0 revize** yazdı · `_PROMPTLAR-V2.txt` yerine eskisini okudu · `_ENZIM.md` hiç okunmuyor · `PROJECT-LOOT.json` üretilmedi.
- `prompt-lint.mjs` yanlış alarmları (Türkçe "tam boy" içindeki `boy`, betimlemedeki "one letter"). **Yeteneği** B6'ya taşındı, onarımı ayrı tur.
- Enzim tavsiyeden **kapıya** çevrilmeli (`ENZIM-KILITLERI.json` üretmeden `ilerle` reddedilsin) — sistem işi.
- Karakter oranı, yazı oranı, yüzey tekrarı, kare↔dosya eşlemesi için lint sayaçları yok. **Ölçüm eksiği**, ders değil.

**Süreç / buddy katmanı — banka satırı olmaz:**
- "Bir hüküm düzeltilince otomatik yüklenen HER dosyada aranır; hafızaya yazmak kalıcı yapmaz" (skill hafızayı ezdi, C1 düzeltmesi iki gün sonra geri doğdu). Gerçek ve önemli — ama `mamilas-buddy` işi.
- "Ajan raporuna kör güvenilmez, her iddia grep ile doğrulanır" (AGY 5 yanlış alarm) · "Rapor üretip okumamak ölçüm değil ölçüm biriktirmektir" (28 AGY raporunun 6'sı hiç açılmadı) · Mami'nin yük sinyalleri · VO nefes politikası · müzik yerleşimi yetkisi. Hepsi kayıtlı, hiçbiri prompt kısıtı değil.

**Kelime avı — MAKRO kuralı gereği alınmadı:**
- `bloom` kelimesi (prompt yolunda ×0, kaynağı `mamilas-director` skill'inin kendi çelişkisi) · `sheen` / `negative space` tuzak sayımları · round-robin kadraj (kararın sahibi tanımsız, ders yazmak kanal kusurunu gizler) · tek tek kare düzeltmeleri (takvimde "SUN MON TUE", pembe kedi kürkü, kavanoz bandı) — hepsi zaten sınıflandırılmış bir dersin örneği.

**Tutan taraf — kanıt, ders değil:**
- Kavram nesnesinin @tag'i tuttu (K19'da iki kaval piksel piksel aynı) · el kareleri 7/7 temiz · sekans başına tek ajan 9/9 temiz · NB2 Türkçe diakritiği 42 harfe kadar basıyor. Bunlar **yasadan çıkarılmasın** diye yazılı; bankaya girmez.

---

## KAPSAM — bu hasadın görmediği

- **Hiçbir kare görülmedi.** Bütün kanıt yazılı rapor alıntısıdır; `Resimler/*.png` ve klipler açılmadı. Bir kusurun gerçekten iddia edildiği gibi olup olmadığı bu turda doğrulanamadı.
- **Ham revize dosyaları açılmadı** (`agents/COMMAND-INBOX/Biten/**/*revize*.txt`). HASAT dosyalarındaki alıntılara ve elle yazılan CANDIDATES dosyalarına güvenildi. Özellikle **Sorunları Birlikte Çözüyoruz**'da parser 9 dosyanın 9'undan da 0 blok okudu — o projenin bütün kanıtı elle yazılmış `CANDIDATES` dosyasına dayanıyor, bağımsız doğrulaması yok.
- **Üç proje ölçülmemiş durumda:** `5. Sürtünme` (revize dosyası yok), `Kuvvet ve Kuvvetin Ölçülmesi` (revize yok, ayrıca .txt 48 kare / .md 58 kare çatalı çözülmedi), `Kuvvet MİRA` (ne prompt ne revize). Bu üçünden ders çıkarılamadı ve **"temiz geçti" denemez.**
- **Eşeyli ve Eşeysiz Üreme** — altın standart sayılan proje — `PROMPT_AMBIGUOUS` yüzünden makine hasadı hiç ders üretmedi; buradaki maddeler yalnız 25 elle-okunan revize bloğundan çıktı, kare evreni ve revize oranı bilinmiyor.
- **A7 tekrar şartını sağlamıyor** (tek kare). Maliyeti için listeye kondu; kırmızı çizgi 2'ye göre Mami reddedebilir.
- **B7 ve C6–C12 tek projeden** geliyor. Hepsinin iç kontrolü var (iki yönlü ölçüm) ama ikinci proje doğrulaması yok.
- **`ONAY-BEKLEYEN.md`'nin akıbeti bilinmiyor:** dosya *"APPROVED bugün 0 ders taşıyor"* diyerek 12 satır sunmuş; APPROVED bugün 7 satır taşıyor ve **hiçbiri o 12'den değil**. Mami'nin o pusulaya ❌ mı dediği, yoksa hiç dönmediği mi — kayıtta yok. Bu listedeki A5, A7, B8, C3 o 12'nin hayatta kalanlarıdır; Mami zaten reddettiyse elenmelidirler.
