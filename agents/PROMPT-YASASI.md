# MAMILAS — ÜRETİM YASASI

**Bu dosya prompt yazımının tek kanonudur.** Yönetmen (`.claude/skills/mamilas-director`),
enzim ve command hattındaki ajanlar üretime başlamadan ÖNCE bunu okur.

Neden var: kazanan biçim daha önce yalnız sohbet hafızasında yaşadı ve **ölçülerek çürüdüğü
görüldü** — Sabit Sürat'ta 44/44 karede duran temas cümlesi, bir sonraki videonun ilk 8
karesinde 2/8'e düştü. Yazılmayan yasa bir `/clear` ömrü kadar yaşar.

Kaynak sayılar/motor listeleri burada YAŞAMAZ: dünya/ref/palet `src/core/SURGERY_DATA.json`,
motor gerçeği `src/core/engine.ts`, makine-okur kalite sözleşmesi `agents/promptQuality.mined.json`.

---

## 0. Ölçülen yasa — neden bu biçim

181 gerçek kare ve 3 revize turu sayıldı. İsabeti belirleyen prompt uzunluğu **değil**;
belirleyen tek şey **kelimelerin kaçının o kareye ait olduğu.**

| Video | kare-özel negatif | temas cümlesi | ayrı `TEXT:` | ten kilidi | STYLE | **revize** |
|---|---|---|---|---|---|---|
| Sürtünme (31) | 31/31 inline | 0 | 0 | 0 | 188 kel. | **%0** |
| Sabit Sürat (44) | 44/44 | 44/44 | 44/44 | 43/44 | 88 kel. | **%14** |
| Bileşke Kuvvet (52) | **0/52** | **0/52** | **0/52** | **0/52** | **269 kel.** | **%65** |

Bileşke'nin promptları en uzunlarıydı (~411 kelime) ve en çok bozulan oldu: uzunluğun üçte
ikisi 52 karede birebir aynı STYLE bloğuydu. Hatalar tam da eksik slotların yerine düştü —
`TEXT:` yok → 11 karede bozuk/İngilizce tabela; temas yok → 4 karede havada yüzen nesne;
ten kilidi yok → 2 karede yeşil cilt; kavram-ışığı isimlendirmesi yok (`saffron` 114 kez) →
7 karede glow safran çiçeği oldu.

**Yasa:** STYLE'ı 90 kelimenin altında tut, kazandığın yeri kareye ait bilgiyle doldur.

---

## 0.5 REGISTER — bu yasa üç dilde konuşur

**Dürüst durum:** yukarıdaki 181 karenin **181'i `pixar_3d_edu`**. Yani §1 ve §2'nin bir kısmı
evrensel bir prompt yasası değil, **bir EDU yasası**. Reklam filmine geçerken bu ayrım yazılmazsa
sistem sessizce okul videosu üretir — nitekim üretti (bkz. §0.6).

Yeni kavram icat edilmiyor: **kod zaten üç kelimeyi söylüyor.** `src/core/brain.ts` →
`type Register = 'REAL' | 'EDU' | 'STY'`, türetim `registerOf(productionPath)`. Yasa o kapıyla
aynı dili konuşur.

| Register | Ne | Dünya grubu |
|---|---|---|
| **EDU** | eğitim/anlatım — bugünkü içerik | `ANIMATION_EDU` |
| **REAL** | reklam filmi, kurumsal, ürün, belgesel | `COMMERCIAL_REAL` · `CINEMATIC_REAL` (16 dünya) |
| **STY** | stilize premium — anlatım değil, gösteri | kalan `ANIMATION_*` grupları |

**Ortak olan ne:** §2'nin **9 slotluk iskeleti** (lens → özne → kimlik → mekân → ışık → kavram →
canlı üçlü → derinlik → temas), `TEXT`/`NEGATIVE` ayrı slot disiplini, kare-özel negatifin
global kuyruktan önce gelmesi, STYLE ≤90 kelime, @tag disiplini, "her kare VO cümlesiyle eş".
Bunlar medium yasası değil, **kelimelerin kaça ait olduğu** yasası — ölçüm §0'da.

**Register'a bağlı olan ne:** aşağıdaki maddeler `[EDU]` ya da `[REAL]` etiketiyle işaretli.
Etiketsiz her madde üç register'da da geçerlidir.

⚠️ **Kod tarafında register gerçekten davranış değiştiriyor** (kamera havuzu, malzeme cümlesi,
ref cross-contamination kilidi, QA tempo eşiği) — ama jüri kartları, negatif bant ve palet
çevirisi register'ı **hiç görmüyor**. Yani yasa metnini register'a ayırmak burada kozmetik
değil: kodun göremediği yeri yasa tutuyor.

## 0.6 Kanıt — yasa neden ikiye ayrılmak zorunda

Ölçüldü (2026-07-27, gerçek command JSON + gerçek `generateBatch`):

- **`locks.projectName = "Ultra Real Commercial"`, `locks.projectClass = ANIMATION_EDU`.**
  Reklam projesi açılmış, sistem sessizce eğitim üretmiş. Sebep kod: sınıflandırılamayan her
  proje `pure.ts` fallback'inde `ANIMATION_EDU` oluyor — `UNKNOWN` yok, blocker yok.
- **REAL register'ın tek bir `rejectIf` maddesi yok** (`promptQuality.mined.json`): jüri REAL'de
  plastik-ticari kareyi *reddedemez*, yalnız "kanıt bulamadım" diyebilir. Animasyonun karşı-kilidi
  var, REAL'in yok.
- **Motion sözleşmesinde register kavramı hiç yok** — `buildMotionPromptQualityContract` dünya
  parametresi bile almıyor. REAL dünyada motion yazarı sıfır photoreal yasası alıyor.
- **Gerçek `product_brand_real` çıktısında müşterinin kendi logosu üç kez yasaklanmış**
  (`NO real product-brand logo…` ×3) — çünkü `brandKitLock` boştu ve **sitede o alanın giriş
  yüzeyi yok.**

---

## 1. DAİMİ DİREKTİFLER — Mami (2026-07-27, 34 maddelik transkriptten damıtıldı)

Verbatim kaynak: `docs/ai/mami-direktif-transkript-2026-07-27.md`. Aşağıdakiler kuraldır;
Mami'nin canlı direktifi çelişkide her zaman kazanır.

### Yapı ve kesim
1. **JSON sadece DÜNYA'dır** (render yasası). Konuyu ve kareyi yönetmen kurar.
2. **Kesim = ÖNER, Mami SEÇER.** Kendi başına aşırı merge yapma. Senaryo bilerek granüler
   yazıldı; sen mantıklı grupları çıkar ve *sor*. Varsayılan 1 sahne = 1 kare.
3. **Her kare kendi şeyini anlatır.** Bir kareye iki kavram sıkıştırma.
4. **VO cümlesi ATILMAZ.** Görüntü birleşir, cümle birleşmez.
5. **Sekans sekans teslim:** önce Intro; Mami basar, beğenirse devam. Tek geçişte 50 kare basma.

### Kare içeriği
6. **START FRAME HER ŞEYİ TAŞIR.** Kling yeniden üretimde kötü — motion yeni karakter, nesne
   veya yazı doğurmaz. Sahnede ne olacaksa karede zaten vardır.
7. **Her kare VO cümlesiyle birebir eş.** Bu birinci kıstas; teslimden önce sen denetle.
8. **[EDU] Sinematik güzel, öğreticilikte sıfır hata.** Premium show okula satılıyor — ama önce
   doğru. **[REAL] karşılığı:** sinematik güzel, **ürün gerçeğinde** sıfır hata — yüzey, oran ve
   marka geometrisi uydurulmaz.
9. **[EDU] Eğitim-önce oran:** anlatıcı karakter *gerekli* karelerde (~%50); kavram karesinde OLGU
   yıldızdır. **[REAL] karşılığı:** hero-object önce — üründe/mekânda yıldız nesnedir, insan onu
   *kullandığı* karede girer (el bir fiildir, dekor değil).
10. **[EDU] Formül/denklem sembolü ve grafik YOK** — kavram GÖSTERİLEREK öğretilir (gösterge,
    kronometre, akıllı tahta, ışık objesi). **[REAL]'de bu madde geçersiz:** reklamda anlatılacak
    kavram yok; yerine **fayda gösterilir** (dökülüş, temas, kullanım anı).
11. **Ekran yazısı özgün ve diegetik**: olgudan doğar, VO'nun tekrarı olan caption değildir.
    Yazı karede doğar, karede biter — post-prodüksiyonda yazı katmanı YOK (Mami AE bilmiyor).

    **11a. Yazı, sahnenin ZATEN İÇİNDE OLAN bir nesnede yaşar.** (2026-07-28 ölçümü: Üreme'nin
    50 karesinin 36'sında yazı hiç yoktu, kalan 14'ünde **aynı hamle on dört kez** tekrarlanmıştı
    — *"kabartma, boyutlu, parlayan harfler masanın üstünde duruyor."* Kedilerin yanındaki sehpaya
    pirinç harflerle ÇEŞİTLİLİK dikilmişti. Bu tahta değil ama tahtadan farkı yok: **sahneye ait
    olmayan bir etiket, sahnenin içine çakılmış.**) Kusur bir yasaktan değil, bu maddenin
    yokluğundan doğdu: yasa "diegetik" diyordu ama *hangi nesnede* demiyordu, ajanlar boşluğu tek
    alışkanlıkla doldurdu. **Yazının taşıyıcısı önce seçilir, sonra yazılır.**

    **İki meşru yol vardır, ikisi de serbest** (Mami, aynı gün: *"illa nesneye olmak zorunda
    değil, ekrana yakışır olsun"*):
    - **(a) Sahnenin kendi nesnesinde yaşayan yazı** — tohum paketi · saksıya saplı fidan
      etiketi · market etiketi · kavanoz kapağı · çocuğun defter sayfası · takvim · tabela ·
      ambalaj · duvara tebeşirle yazılmış iz.
    - **(b) O ana yakışacak biçimde TASARLANMIŞ ekran yazısı** — nesneye basılı olmak zorunda
      değil; kareye ait, kompozisyona oturan, anın duygusunu taşıyan bir tipografi. Bölünme
      sahnesinde ikiye ayrılan harf, tomurcuklanmada yandan filiz veren harf, çeşitlilikte her
      harfi başka dokuda olan kelime. Karenin ışığını ve malzemesini alır, üstüne yapıştırılmış
      durmaz.

    Yasak olan bu ikisi değil, **tembel varsayılan**: her seferinde aynı jenerik hamle. Kusur
    "nesnede değildi" değil, **on dört karede tek bir çözümün tekrarlanmasıydı.** Yazı
    post-prodüksiyonda eklenmez — kareye basılır (Mami AE bilmiyor), ama kareye basılan yazı da
    tasarlanabilir.

    **11b. Harf karakteri o nesneye ve o ana ait olmalı.** Tek bir "kahraman yazı tipi" yoktur.
    Tohum paketinde ofset basılmış eski moda serif, fidan etiketinde plastiğe damgalanmış ince
    sans, market etiketinde termal yazıcı puntosu, defterde kurşun kalemle çocuk el yazısı,
    tebeşirde kırık kenarlı iz. **Yazı tipi de sahnenin malzemesidir** — mürekkep kâğıda emer,
    damga plastikte parlar, kalem kâğıdın dokusunda atlar. Bunu yaz.

    **11c. Cimrilik de kusurdur.** Yazısız kare meşrudur ama **varsayılan değildir**. Kaba
    hedef: bir derste karelerin **yaklaşık yarısı** sahnenin kendi yazısını taşır. Kalan yarı
    bilerek temiz kalır — yoksa yazı gürültüye döner. İki uç da hatadır: 36/50 boş da,
    50/50 dolu da.
12. **Yeni karakter → önce ayrı REFERANS promptu**, sonra `@handle` ile sahnelerde kullan.

### Teslim
13. **MOTION = İngilizce, zengin, kaliteli.** Kısa/Türkçe/baştan-savma prompt kabul edilmez.
14. **KURGU KİTİ motion fazıyla BİRLİKTE gelir:** MOTION + EDIT-PLAN + SESLENDIRME + SUNO.
    Motion tek başına teslim değildir.
15. **SUNO = Suno "Simple" kutusuna yapıştırılacak TEK temiz prompt** (structure/tag bloğu yok).
16. **Teslim dosyaları `.txt`** — Windows'ta `.md` uğraştırıyor. Prompt blokları ``` fence
    yerine düz `-----` ayracıyla, kopyalaması kolay olsun.
17. **Motion süreleriyle birlikte** verilir (klip süresi + ekranda hedef süre).

### Denetim
18. **TEK GEÇİŞ:** kareye bir kez bak; aynı geçişte hem motion'ı hem (varsa) revizeyi yaz.
19. **Revize = referans-edit:** *"Use this referenced image, change ONLY: <fix>. Keep everything
    else identical."* Sahneyi baştan tarif etme. Sahne bozuksa (kompozisyon/beat yanlış) baştan üret.
20. **Bulanık arka planın revizesi BULANIK istenir** — NB2 netleştirip odağı çalıyor:
    *"keep same soft-focus, do not sharpen."* İstisna: ön plandaki kavram yazısı net olmalı.
21. **Sorunsuz kareye revize YOK** — tek satır "temiz" listesi yeter.

### §1a — KISTAS SIRASI (tek kaynak)

Bu bölüm **yeni hüküm getirmez**; §18-21'in hangi sırayla uygulandığını tek yere toplar.
Neden toplandı (2026-08-02 ölçümü): aynı liste üç skill'de üç ayrı kopya halinde yaşıyordu —
`mamilas-director` 7 madde, `mamilas-enzim` aynı eski 7, `mamilas-denetim` 10. Yeni iki madde
(FİKİR ve ÇEKİM) yalnız denetim kopyasına girmişti, yani **yasanın en pahalı iki maddesi yazma
yüzeyinde yoktu, sadece denetim yüzeyinde vardı** — kusur ancak kredi yandıktan sonra
yakalanıyordu. Maddelerin kendisi zaten yasadaydı: 0 → §2ø, 9 → §2a, 2/3/4/6 → §2d.

**Sıra bağlayıcıdır: üstteki madde alttakini iptal eder.** Liste hem KARE YAZILIRKEN
(`mamilas-director`, yazmadan önce) hem KARE DENETLENİRKEN (`mamilas-denetim`) aynen geçerlidir.

0. **FİKİR** (§2ø) — kareyi VO olmadan gösterip *"burada ne oluyor"* diye sorsan cevap
   verilebilir mi? Görünür bir **gerilim ya da değişim** var mı? Yoksa kare teknik olarak
   kusursuz ama ölüdür ve teslim edilmez. Bu madde diğer dokuzunun ÜSTÜNDEDİR: onlar kusuru
   ölçer, bu **bakılmaya değer olup olmadığını** ölçer.
1. **VO ↔ sahne uyumu** (§1.7) — kare o cümlenin dediğini gösteriyor mu? EŞLİK ≠ TAŞIMA
   (§2ø): cümlenin tekrarı olan kare bedavaya gelmiştir.
2. **Bozuk/garbled yazı** — okunmayan/yanlış/ters harf. Yazım değil **yerleştirme** bozuluyor
   (§2d.4): TEXT slotunda ORIENTATION cümlesi zorunlu.
3. **Yanlış cast** — [EDU] Türk/Anadolu, ana ve arka plan dahil, sınıf yaşı açık.
4. **Fazla ya da İngilizce yazı** — boş yüzey uydurma İngilizce doğurur (§2d.3); çözüm
   yasaklamak değil **giydirmek**.
5. **World / firewall ihlali** — kara tahta→akıllı tahta, ok/ikon/düz diyagram, photoreal,
   franchise, gerçek marka.
6. **Süreklilik** — karakter, hero-prop, mekân ve ardışık fiziksel durum (§2d.7). Çıpa
   kimliğe konur, prop'a değil (§2d.8).
7. **Void / boş arka plan** — premium-show ihlali.
8. **Geometri kaynaşması** — figür ya da nesne başka bir katı yüzeyin içine geçmiş mi.
   (Mami buldu, ajan kaçırdı: ahşaba kaynaşmış figür. Yazı/cast/ten/süreklilik kalemlerinin
   hiçbiri bunu yakalamıyor.)
9. **ÇEKİMİN KENDİSİ** (§2a) — dört soru, kare yazılmadan önce de denetimde de aynı:
   · **kahraman kim**, kadrajın neyini kaplıyor?
   · **kaç NET insan** var? (isimsiz her yüz ~30-40 pikselde lekeye dönüyor)
   · **ışık nereden geliyor ve NEREDE BİTİYOR?** (hiçbir yer kararmıyorsa yüz modellenmiyor)
   · **özne zeminden nasıl ayrılıyor** — değer/renk farkı mı, yoksa aynı tonda mı eriyor?
   Bu madde olmadan çirkin kare TEMİZ geçiyor (ölçüldü: Değerler'in kemer karesi denetimden
   dokunulmadan çıktı, Mami rezil dedi).

⚠ **Kıstas ihlali otomatik revize DEĞİLDİR.** Mami'nin revize kıstası üç kalemdir (§2d):
*"sahneyle uymuyor · bozuk yazı · yanlış şey"* — **süreklilik, palet ve üslup farkı tek başına
revize sebebi değildir**, Mami gerektiğinde kendisi söyler. 6. madde bu yüzden *bildirilir*,
kendiliğinden revizeye çevrilmez.

---

## 2. START-FRAME TEMPLATE — Nano Banana 2

Slot sırası bağlayıcı. Başlık satırı yönetmen içindir, prompta girmez.

```
### K<n> | VO<n> "<Türkçe cümle>" · yazı: <"KELİME" | YOK> · <KAVRAM | KARAKTER>
FİKİR: <bu kareye neden bakılır — VO'suz okunan tek gerilim ya da tek değişim>
PLAN:  <kahraman> · <kaç net insan> · <ışık NEYE DEĞİYOR, neye değmiyor — ton yazma, §2b> ·
       <özne zeminden nasıl ayrılıyor> · <FEDA: bu karede ne okunmuyor, §2c>
-----
[1 LENS]      <24-85>mm lens at f/<x>, <göz hizası|yüksek|alçak> <yakın|orta|geniş> <üç-çeyrek> view
              ⚠ eksenden ÇIK: ön planda kesilen bir çapa yoksa motor simetriye düşüyor (§2a)
[2 ÖZNE]      — @handle <TEK fiil: VO cümlesinin birebir görsel karşılığı>
[3 KİMLİK]    Warm matte tan skin, low specular, never tinted green or grey. <gardırop çıpası>
[4 MEKÂN]     The setting is <spesifik, tam giydirilmiş mekân>: <3-5 isimli obje>
[5 IŞIK]      <motive edilmiş key> ... <bounce> ... <rim>
[6 KAVRAM]    a soft round warm-golden glow of light   ← kavram ışığı varsa
[7 CANLI ÜÇLÜ] Three things are alive in the frame: <a>, <b>, <c>.
[8 DERİNLİK]  Depth in three layers — <ön bulanık>, <keskin özne>, <arka bokeh>.
[9 TEMAS]     Every object rests in contact with its surface and casts a soft contact shadow.
STYLE: <≤90 kelime dünya kilidi — malzeme spesifik, marka adı YOK>
LIGHT AND PALETTE: <palet ışık DAVRANIŞI olarak, ham hex asla>
TEXT: <TAŞIYICI NESNE — sahnede zaten var olan> · <HARF KARAKTERİ — o nesnenin malzemesi:
      basılı/damgalı/el yazısı/tebeşir + nasıl davrandığı> · <yazının kendisi HARF HARF>
      · <konumu> · <arka plan: soft-focus, Türkçe ya da boş>
NEGATIVE: <KARE-ÖZEL 1-2 madde ÖNCE> ; <global kuyruk>
-----
```

### §2ø — FİKİR: yasanın geri kalanı TABANDIR, TAVAN DEĞİL (Mami, 2026-07-29)

> *"En önemlisi fikir. Her sahne bir fikir diye boşuna mı şartladık her şeyi?"*

Bu madde yasanın en başına yazılmalıydı; yazılmadığı için bir gün boyunca lint yeşil yanarken
ölü kare üretildi. **Slotlar, lint, dünya kilidi ve register kusuru engeller — bakmaya değer
bir sebep üretmez.** Yeşil lint "temiz" demektir, "iyi" demez.

Yasada bu maddeye en yakın iki cümle ikisi de KISITTIR ve ikisi de sağlanırken kare ölü olabilir:
§1.3 *"bir kareye iki kavram sıkıştırma"* (fazlasını koyma) ve §1.7 *"VO cümlesiyle birebir eş"*
(cümleden sapma). Hiçbiri **"bu karenin fikri ne"** diye sormaz.

**EŞLİK ≠ TAŞIMA (Mami, aynı gün).** §1.7 *"her kare VO cümlesiyle birebir eş"* der ve bu
yanlış anlaşılmaya açıktır: **eşlik eden kare cümlenin TEKRARIDIR** — izleyici duyduğu şeyi
bir de görür, kare bedavaya gelmiş olur. **Taşıyan kare cümlenin SÖYLEYEMEDİĞİNİ verir.**
"Millî kültür bir milleti bir arada tutar" cümlesinin eşliği bir festival kapısıdır; taşıması,
aynı tezgâhta yaşlı bir elin ve bir çocuk elinin dokuduğu tek kilimde eski ipin solmuş,
yeni ipin parlak olmasıdır. Cümle kavramı söyler, kare **kanıtı** gösterir.

Bu ticari bir zorunluluktur, estetik tercih değil: bu videolar özel okullara satılıyor.
Cümlenin altına konmuş dolgu kare, parası ödenmiş bir saniyenin boşa gitmesidir.

**FİKİR SINAVI — kare yazılmadan, tek soru:**
> Bu kareyi VO olmadan birine göstersen, *"burada ne oluyor"* diye sorduğunda cevap verebilir mi?

Cevap için karede **bir gerilim ya da bir değişim** görünür olmalı. Ölçülmüş örnekler:

| Fikri OLAN | Fikri OLMAYAN |
|---|---|
| Yaşlı bir el ile çocuk elinin aynı saz sapında bir karış kala durması | İki çocuk kemerin altında yan yana durup yukarı bakıyor |
| Suyun içinde ilk kez görünen beyaz kökler, çocuk bardağa iyice yaklaşmış | Bina büyüklüğünde bir yaratık halatlarda asılı duruyor |
| Kavanoz camında üç kez görünen aynı yüz | Tezgâhların arasında yürüyen iki figür |

Sağ sütunun hepsi **teknik olarak kusursuzdu** — slot tam, lint yeşil, temas yazılı. Hiçbirinde
gerilim yok, o yüzden hiçbiri bakılmaya değmiyor.

⚠ **Tuzak — türün konfor alanı.** Fikir yazılmazsa ajan dünyanın kendi klişesine düşer:
sci_fi'da paslı mavi hangar, EDU'da gülümseyen iki çocuk, REAL'de parlak stüdyo ürünü.
Dünya kilidi bunu engellemez, çünkü kilit **doğru** olanı tarif eder, **ilginç** olanı değil.
Uzaylılık yaratıktan gelmek zorunda değil — sıradan bir şeyin yanlış olması daha güçlüdür.

### §2b — MOTORUN ÖLÇÜLEN DAVRANIŞI (2026-07-29/30, 20 kare basıldı)

Bir gün boyunca dört ayrı dünyada 20 kare basıldı ve motorun neyi dinlediği neyi dinlemediği
ayrıştı. Bunlar tahmin değil; her satırın karşısında basılmış bir kare var.

**1. Motor GEOMETRİYİ dinler, TONU dinlemez.** En pahalı bulgu.

| Yazılan | Sonuç |
|---|---|
| *"şaft yalnız kasanın üstüne düşer, başka hiçbir şeye ulaşmaz"* | **TUTTU** — ışık gerçekten sadece kasada, iki yüz gölgede |
| *"kasa boş ve açık, eller boş"* | **TUTTU** — hatta kapak katlandığı için yazı ters okundu, birebir |
| *"aydınlık yarı, karanlık yarı mutlak siyah, çizgi burnundan iner"* | **OLMADI** — yüz baştan sona yumuşak ve eşit |
| *"tepe güneşi, göz çukurları kapkara, dolgu yok"* | **OLMADI** — kapalı havada çekilmiş gibi |

Motorun varsayılanı **"hoş ve dengeli pozlanmış fotoğraf"** ve tonla ilgili her cümle o
varsayılana yeniliyor. Işık dışlaması **coğrafi** yazılır, fotometrik değil: *"ışık şuna,
şuna ve şuna değer; başka hiçbir şeye değmez."* "Siyah kalır", "kontrast 6:1", "dolgu yok"
cümleleri **ölçüldü ve çalışmıyor.**

**2. Negatif korumaz — üçüncü kez ölçüldü.** Fideye *"asla parlamaz, ışık kaynağı olmaz"*
yazıldı; fide parladı. Yasaklamak yerine **ne olduğunu** yaz: *"yaprakları donuk ve tozlu,
ışığı geri vermiyor."*

**3. İcat edilen canlı/nesnenin MALZEMESİ değil önce FORMU yazılır.** Yaratığa "plakalı kitin,
büyüme bantları, mikro çukurlar" yazıldı — siluet, oran, plakaların nasıl eklemlendiği
yazılmadı. Motor boşluğu doldurdu ve ortaya bir kurtçuk çıktı; ikinci karede de tanınmış bir
film yaratığına yakınsadı. **Form yazılmayan yer, motorun en tanıdık formuyla dolar** — bu
aynı zamanda telif riskidir. Yazılacaklar: siluet, oran, eklemlenme, neye benzemediği.

**4. Motor gerçek insan tenini BİLİYOR.** REAL register'da gözenek, ter, güneş yanığı, göz
kenarı çizgisi, kirli sakal — hepsi tuttu, plastik surat hiçbirinde çıkmadı. Bu artık sorulmaz;
`ten-real` slotu doldurulduğu sürece ten sorun değil.

**5. Türkçe yazı ve diakritik güvenilir.** `BASINÇ` · `TAHLİYE` · `İNİŞ 4` · `KÜLTÜR YOLU` ·
`TOHUM` — beşi de doğru çıktı, Ç/Ş/İ/Ü yerinde. Koşul: harf harf heceleme + taşıyıcının
malzemesi + yüzeyin sensöre paralel olması. Üçü birden yazılınca yazı **risk kalemi değil.**

### §2c — FEDA: her şeyin okunduğu kare, AI karesidir (Mami, 2026-07-30)

> *"Yani çok AI değil mi? Odyssey filmini izlesen böyle midir sahneler?"*

Değildir, ve sebebi render kalitesi değil. Slotların hepsi doldurulduğunda ortaya çıkan şey bir
film karesi değil, **reklam fotoğrafı**: özne üçte birde, ön planda çapa, arkada bokeh, her
yüzey okunur, her doku görünür. Beş fark ölçüldü:

1. **Her kare "en iyi an" olmuş.** Film karesi çoğu zaman tamamlanmamıştır — özne kadraja
   giriyor ya da çıkıyor, sırtı dönük, yarısı kesik, ışığın dışında.
2. **Her şey yerinde.** Odyssey'in kadrajları acımasızca geometrik **ve çoğu boş**: kocaman
   hiçlik, minicik figür, bilerek kullanılmış simetri. "İyi kompoze" stok fotoğraf dilidir.
3. **Işık kibar.** Gerçek işte ışık endüstriyel ve yüze yakışmaz: düz paneller, aşağıdan
   aydınlanan yüz, patlamış pencere, tamamen siluete düşen kafa.
4. **Hiçbir şeyden vazgeçilmemiş.** Prompt ten dokusunun, yazının, temas gölgesinin ve üç
   katmanın **hepsinin okunmasını garanti ediyor.** Garanti, AI görüntüsünün ta kendisi.
5. **Renk grade'den geliyor, eşyadan gelmiyor.** Palet satırı tutarlı bir grade üretiyor;
   gerçek işte renk dekordan gelir — kırmızı koltuk, beyaz plastik, turuncu tulum.

**YASA: her karede bir şey FEDA EDİLİR** ve neyin feda edildiği PLAN satırında yazılır.
Bir yüz ışığın dışında kalır · bir yazının bir harfi elin altında kalır · bir kol kadraj
tarafından kesilir · bir alan patlar · bir yüzey odağı kaybeder. Feda yoksa kare fotoğraf
gibi durur; feda varsa **an** gibi durur.

⚠ Lens bir SAYI olarak değil, bir CAM olarak yazılır: kenar bozulması, sıcak noktada halation,
grain yapısı. "35mm film grain" yazmak bir etikettir, bir davranış değil.

### §2a — PLAN KARARI: slotlar dolu ama kare çirkin olabilir (2026-07-29, kareyle kanıtlı)

Mami Değerler'in karelerine baktı ve *"bazı sahneler GPT'den çıkmış plastik düz imaj gibi"*
dedi. Ölçüldü: o karelerde **lint sıfır kırmızı**, 34/34 temas cümlesi, 34/34 TEXT, 34/34
NEGATIVE, STYLE 88-109. Yani **iskelet kusursuz, kare çirkin.** Eksik olan slot değil,
slotların içine ne konacağını belirleyen karardı — ve o karar hiçbir yerde yazılı değildi.

Aynı sahne (festival kemeri) dört karar değiştirilerek yeniden yazıldı ve Mami'nin hükmü
tek kelimeyle döndü: *"inanılmaz"*. Değişen dört şey — **PLAN satırı bunları sorar:**

| Karar | Çirkin kare | Onarılmış kare |
|---|---|---|
| **Kahraman kim** | iki çocuk, kadrajın ortasında, eşit boyda | oymalı direk kadrajın 1/3'ü; çocuk ölçek referansı |
| **Kaç net insan** | iki çocuk + dansçılar + tezgâhçılar + "arka plandaki her çocuk ve yetişkin" | **bir**; gerisi çözünmez siluet, yüz/el tarif edilmez |
| **Işık nerede BİTİYOR** | "geç öğleden sonra güneşi" — gökyüzü, her şeyi eşit yıkıyor | yatay raking key; sol direk ve tezgâh içleri *"güneşin hiç ulaşmadığı"* indigo gölge |
| **Özne zeminden nasıl ayrılıyor** | krem tulum, krem tente, krem taş — aynı değer | sıcak rim + arkasında karanlık oyma |

**Neden yasaya giriyor:** bunların hiçbiri lint'in ölçebileceği şey değil ve **denetim
kıstasında da yoktu** — kemer karesi denetimden "TEMİZ, dokunma" diye geçmişti. Kıstas
listesi yazı · cast · ten · süreklilik · dünya · geometri sorar; *"bu iyi bir plan mı"*
diye sormaz. Bu yüzden PLAN satırı **başlıkta**, prompt yazılmadan önce doldurulur.

Ölçülen iki mekanizma, ikisi de tekrar sınanabilir:

1. **Simetri varsayılandır.** Kadrajda kesilen bir ön plan çapası yoksa motor tek nokta
   perspektifine düşüyor: özne ortada, yol ortada, iki figür yan yana eşit. Aynı sahne iki
   kez basıldı (kalabalıklı ve kalabalıksız), ikisinde de simetri aynen kaldı — yani sebep
   kalabalık değil, **çapasızlık**. Çapa konunca kırıldı.
2. **İsimsiz insan pahalıdır ve piksel sınırı tarifle aşılmaz.** Ekranda ~30-40 piksellik bir
   yüzde kimlik taşınamaz; ne yazarsan yaz leke çıkar. Doğrusu tarif etmemek: *"unresolved
   silhouettes in heavy defocus, no face, no hand, no costume detail"* — motor bunu dinliyor
   (kanıtlandı). Kalabalık hissi **gövdeyle değil eşyayla** kurulur: asılı mal, istif çanak,
   sarılı kilim, boş tabure.

⚠ Ve bir uyarı: **yasak battaniyesi dünyayı öldürür.** Değerler'in 34/34 karesinde
*"arka plandaki her tabela, afiş, pankart, tente ve levha yüzeyi tamamen boştur"* yazıyordu —
korku haklıydı (motor uydurma İngilizce basıyor) ama sonuç yazısı kazınmış bir festival
dekoruydu. Doğrusu yasaklamak değil **doldurmak**: yüzeyler malla giydirilir, uydurma
tabelaya yer kalmaz.

### §2d — REVİZE MADENİ: 54 karenin 30'u geri geldi (2026-07-30, Birlikte Daha Güçlüyüz)

Mami'nin hükmü: *"54 prompt verdin, 30'u revize. Aynı hatalara düşme."* 54 kare basıldı ve
tek tek gözle denetlendi. Kusurlar dağınık değil, **sekiz sınıfta toplandı** — ve sekizi de
prompt yazılırken kesilebilirdi. Sıradaki her derste bunlar kare yazılmadan uygulanır.

**1. İNSAN KOY, KOL KOYMA — 7 kare.** "Kahraman ellerdir" diye yazılan her yakın kare
gövdesiz kolla döndü: K07 iki kol, K08 dört kol, K11 dört kol, K12/K13/K18 aynı. Motor
"hands" yazınca **gövdeyi ve yüzü hiç üretmiyor.** Kural: her karede **en az bir insan
yüzüyle** — yaş, giysi malzemesi, ifade yazılır. El yakın planı isteniyorsa bile o elin
sahibi karede vardır.

**2. GENİŞ PLAN DÜNYAYI KAYBEDİYOR — 5 kare.** K16/K17/K18/K20 (salon geniş planları) ve
K01 (sokak) `pixar_3d_edu`'dan çıkıp **fotoğrafik mimari görselleştirmeye** düştü: düz
ambient ışık, doygunluğu düşük gri-mavi palet. Aynı dünyanın yakın karesi (K19) tam yerinde.
**STYLE kuyruğu yakın planda tutuyor, geniş planda tek başına yetmiyor.** Kural: her geniş
karede **yakın planda modellenmiş bir yüz** bulunur — dünyayı tutan şey karakterdir.

**3. BOŞ YÜZEY = UYDURMA İNGİLİZCE — 6 kare.** `SCHOOLBOOK` · `TURKISH` · `TURKİŞH` ·
`TURKISH IME YED` · çimento torbasında `CEMEN…` · pantolon cebinde `AVNS`. **Altısının da
promptunda "No text anywhere in this frame" yazıyordu.** §2a'nın kendi cümlesi: yasak
battaniyesi dünyayı öldürür, doğrusu **DOLDURMAK**. Kural: yazı istemediğin her yüzey
**giydirilir** — kepenk indirilir, tente toplanır, pano üst üste kâğıtla kaplanır, çuval
duvara döndürülür. Kadrajda tabelanın doğabileceği boş panel bırakılmaz.

**4. YAZIM DEĞİL YERLEŞTİRME — 3 kare.** Motor Türkçeyi **doğru yazıyor**: KIRTASİYE, ÇINAR,
GÖREV, KİTAP, SOSYAL BİLGİLER, MUHTARLIK, AFAD, BELEDİYE, TÜRK KIZILAY, ÇÖP, AÇIĞIZ ve
K52'nin iki uzun satırı — hepsi harf harf tuttu, sedil/breve/nokta yerinde. Bozulan üç kare
**180 derece ters** doğdu (K19, K40, K42) ve biri yanlış nesneye sıçradı. Kural: TEXT slotuna
**ORIENTATION** cümlesi zorunlu — *"reads left-to-right, never mirrored, reversed or rotated;
appears on this one named object and on no other surface."*

**5. NESNEYİ TUTAN EL ÜRETİLMİYOR — 4 kare.** K14 kova havada ve iki el boş, K46 perde
kornişi havada, K49 tepsi hiçbir yüzeye değmiyor ve kol elsiz bitiyor, K52 fırça tutan el
yumru. Genel temas cümlesi bunu tutmuyor. Kural: taşınan/tutulan her nesne için **kavrama
yazılır** — hangi parmak nerede, avuç mu parmak ucu mu, ağırlık hangi eklemde, nesne ele
nereden bastırıyor.

**6. `silhouette` KELİME TUZAĞIDIR.** Motor onu tarif değil **çizilecek nesne** olarak
okuyor ve düz 2D kesme-kâğıt figür basıyor (K04'te lacivert bir insan ikonu çıktı).
`saffron`→çiçek, `bloom`→çiçek ile aynı sınıf. Arka plandaki insan **sırtı dönük ama tam
render** yazılır; "unresolved silhouette in heavy defocus" bir daha yazılmaz.

**7. ARDIŞIK FİZİKSEL DURUM KARE KARE KİLİTLENİR.** K23-K26 suyu çekilmiş sokak gösterirken
K27 sokağı yeniden sele boğdu — kesimde zaman geri sardı. Kural: bir sekans boyunca değişen
fiziksel durum (su seviyesi, gün ışığı, hasar derecesi, kalabalık) **her karenin NEGATIVE
satırında ayrı ayrı** yazılır: *"the water never rises above the kerb line anywhere in frame."*

**8. TEKRAR EDEN İNSAN PROP'LA DEĞİL TAG'LE TUTULUR.** K40/K43/K44'ün çocuğu aynı kazak ve
aynı çene sıyrığıyla yazılmıştı; kazak ve sıyrık tuttu ama **yüz tutmadı** — saç rengi, yüz
biçimi ve ten değişti. Çıpa **kimliğe** konmalı, prop'a değil: 2+ karede görünen her insan
`@tag`lenir (§4a). Tarif çıpası tekrar eden insanı taşımaz.

⚠ Bu sekizin hiçbiri estetik tercih değil, **hepsi ölçülmüş üretim kaybıdır**: 54 karenin
30'u geri geldi ve 13'ü baştan üretildi. Kıstas da Mami'nin: *"sahneyle uymuyor · bozuk yazı ·
yanlış şey"* — **süreklilik, palet ve üslup farkı revize sebebi DEĞİLDİR**, Mami gerektiğinde
kendisi söyler.

### Slot kanıtları

| Slot | Kanıt |
|---|---|
| 0 · PLAN satırı | §2a. Slotların hepsi doluyken kare çirkin çıkabiliyor; dört karar yazılmazsa motor güvenli olanı seçiyor ve güvenli olan hep geniş, simetrik, düz ışıklıdır. |
| 1 · Lens en başta | 181/181 promptun tamamı lensle açıyor. NB2 sayısal lensi okur; "cinematic lens" okumaz. |
| 2 · Tek fiil = VO | Sürtünme'nin başlığı "her kare VO cümlesiyle birebir" der; 31/31 kare sıfır revize aldı. |
| 3 · Ten + gardırop | **Yokluk:** Bileşke K14/K39 yeşil-gri cilt, K17 yakın planda kapüşon rengi uyduruldu. **Varlık:** Sabit Sürat 43/44 + Kütle 8/8 → sıfır şikâyet. |
| 4 · Giydirilmiş mekân | Bileşke K11 boş beyaz void. "negative space / clean table" yazmak void doğuruyor; "clean plate" YALNIZ metin içindir, arka plan için değil. |
| 6 · Kavram ışığı | `saffron` ve `bloom` kelimelerini NB2 **çiçek** çiziyor; Bileşke'de 7 kare böyle gitti. Doğrusu: *soft round warm-golden glow of light* — taç yaprağı, sap ya da çiçek değil. Işık **nesnenin** üstündedir, cildin/yüzün üstünde değil. |
| 7 · Canlı üçlü | Sabit Sürat 44/44. Motion fazının canlandıracağı hareketi önceden kilitler — motion'ın yeni öğe doğurma ihtiyacını sıfırlar. |
| 8 · Üç katman | Bileşke'de yalnız STYLE boilerplate'indeydi → yutuldu (K8 kopuk öğretmen kolu, K11 void). Kare-özel isimlendirilince sıfır. |
| 9 · Temas | **En net kanıt:** Bileşke 0/52 → K33/34/35/50 havada yüzdü. Sabit Sürat 44/44 → sıfır yüzme. |
| TEXT · harf harf | Yazıyı harf sayısı + diakritikle hecele: *"YER DEĞİŞTİRME" (two words, thirteen letters, the fourth a dotted capital İ)*. Sabit Sürat'ta yazı taşıyan 13 karenin 12'si ilk seferde doğru çıktı; Bileşke'de bu slot yoktu → 11 bozuk yazı + `R = 0 N` → `R = ON`. Sayı ile birim AYRI ve aralıklı yazılır. |
| TEXT · arka plan kuyruğu | *"any background sign soft-focus, Turkish or blank"* — Sabit Sürat K01/K02'de VAR (temiz), K03'te YOK (GROCER tabelası çıktı), K16'da YOK (bozuk tabela). Bayrak/sembol de bu kuyruğa girer: Amerikan bayrağı K31/K32'yi bozdu çünkü hiçbir slot sembolü kapsamıyordu. |
| TEXT · konum | Kavram yazısı bir figürün arkasında kalabiliyor. Konumu söyle: *"floating clearly in the mid-ground, position it so the figure does not stand in front of any letter."* |
| NEGATIVE · kare-özel önce | Sürtünme 31/31 inline `FRAME NEGATIVE`, Kütle 8/8 kare-özel baş madde — ikisi de sıfır revize. Global kuyruk tek başına yetmiyor. |
| STYLE ≤90 kelime | 269 kelimelik blok %65 revize getirdi. **Ölçülmüş dağılım (2026-07-29):** altın standart Üreme 86-116 · Sabit Sürat 68-116 · Sürtünme 125 · **Bileşke 148-243** (52 karenin 34'ü revize). 90 hedeftir; `prompt-lint` duvarı 110'da yanar — Üreme'nin çalışan işini kırmızıya boğmamak için. `scripts/dunya-kilidi.mjs` kuyruğu zaten ≤90 basıyor, elle yazma. |

### Kavram izi çizilir — ama ışık olarak

Mami'nin direktifi açık: **kavramın oku/izi KESİNLİKLE çizilir.** Bu, "ok/ikon/diyagram yok"
kuralının istisnası değil, o kuralın doğru okunuşudur: iz **sahne içi ışık objesi** olarak
çizilir, çizgi film oku ya da düz diyagram olarak değil.

> *"a luminous cool-blue straight beam of light spears from the home across to the school —
> a clean directional streak with **no cartoon arrowhead and no flat diagram**"* (Sabit Sürat K13)

`NEGATIVE` kuyruğuna kare-özel karşılığını yaz: *"the blue line is light, never a drawn
arrowhead."* Bileşke K34/K38'de bu cümle yoktu ve NB2 ok ucu çizdi.

### Kalıcı kilitler (her karede)

- **[EDU] Cast:** her çocuk — ana ve **arka plan dahil** — Türk/Anadolu; sınıf yaşı açık yazılır
  (*"6th-grade, around eleven or twelve, pre-teen"*). Bu bilgi command JSON'da **yok**, yönetmen yazar.
  ⚠️ Bu, `agents/PROTOCOL.md`'nin "kaynakta yoksa cast uydurma" kuralının bilinçli istisnasıdır:
  cast Mami'nin duran direktifidir, uydurma değildir. Yeni bir cast **icat edilmez**, duran direktif uygulanır.
- **[EDU/STY] Ten:** sıcak mat ten, düşük specular; yeşil/gri cilt karenin reddi demektir. Palet
  "cool-green highlight" diyorsa yeşil **yüzeylerde** kalır, tende asla.
  🔴 **[REAL]'de bu slot TERSİNE çevrilir** — bkz. §2R. `pixar_3d_edu` negatifi *"NO photoreal or
  real-human photographic skin"* der; `product_brand_real` negatifi *"NO plastic AI-smooth skin —
  real pore and knuckle"* der. **Her birinin pozitifi ötekinin açık negatifidir.** "Sıcak mat ten"i
  bir REAL karesine yazmak, o dünyanın kendi yasasını ihlal etmektir.
- **Marka/telif:** stili çağır, stüdyoyu değil — *"premium-CG feature-animation 3D CGI,
  RenderMan-successor lineage"*. Franchise adı, gerçek kişi, logo yok.
- **Türkçe metin ya da HİÇ.** İngilizce tabela/poster/rozet yok.
  🔴 **AMA "yüzey boş kalsın" YANLIŞTIR ve buradan kaldırıldı.** Ölçüldü: **boş yüzey =
  uydurma İngilizce** (42 revize İngilizce tabela, 38 revize bozuk harf). Motor boş panel
  görünce oraya yazı uyduruyor — yasak onu durdurmuyor. Doğrusu: **yazı istemediğin her
  yüzey GİYDİRİLİR** — kapalı kepenk, sarılı tente, doku, malzeme, gökyüzüne eğik cam,
  ters çevrilmiş kâğıt, duvara dönük dosya sırtı. Kadrajda tabelanın doğabileceği boş
  panel bırakılmaz. (§2d ile aynı hüküm — iki yerde çelişiyordu, burası düzeltildi.)
- **Pozitif çerçevele.** NB2 negatif yığınını zayıf okur: "boş sıcak duvar" yaz, "dağınıklık yok" değil.
  ⚠ **Bu, NEGATIVE slotunun gereksiz olduğu anlamına GELMEZ** — iki madde birbiriyle
  çelişiyor sanılıyordu, ayrımı burada duruyor: **kimliği, güvenliği ve varlığı negatif
  kuramaz** (onlar pozitif yazılır), ama **o karenin bilinen tek bozulma yolunu negatif
  kapatır.** Zararlı olan hazır banka listesidir; kare-özel negatif değildir. Ölçüm:
  kare-özel negatifle yazılan sette NEGATIVE oranı %100 ve lint kırmızısı 0.

### @tag disiplini

- **2+ karede görünen belirgin nesne = üretimden ÖNCE referans + `@tag`.** Tag'siz tekrar eden
  prop her karede başka çıkar: Bileşke'de kitap 6 ardışık karede 6 farklı kitaptı ve 6 kare
  toptan revize oldu. **Korpusun en pahalı tek hatası** — üstelik `@kitap` referansı yazılmıştı
  ama promptlarda hiç kullanılmadı. Referans üretip handle'ı çağırmamak, referansı hiç
  üretmemekten kötüdür.
- **TAG'Lİ karakteri asla tarif etme**, handle yeter — görünüş yalnız referans promptunda
  tanımlanır. `@efe1` yazdıktan sonra saçını, kıyafetini, boyunu yazmak referansla yarışır.
- 🔴 **TAGSIZ insan ise MUTLAKA tarif edilir** — ve bu çelişki değil, aynı kuralın öteki yüzü:
  tag'li kimliği referans taşır, tagsızı taşıyan hiçbir şey yoktur. Tagsız bırakılan her
  figürde motor kendi kastını kuruyor (ölçüldü: cast ihlali 28 revize). Tagsız insan için
  **yaş + Türk/Anadolu + giysi malzemesi + ifade** tek cümlede yazılır.
- 🔴 **KADRAJDAN KESİK FİGÜR YAZILMAZ** (2026-07-31, K05 ile kanıtlandı). *"a pair of school
  shoes crosses at the far right, cut by the frame"* yazıldı, NB2 **havada uçan bir çift
  ayakkabı, bacak ve çanta** çizdi — gövde yok. Aynı sınıf daha önce 7 karede ölçülmüştü.
  Her insan en az diz ya da bel hizasından itibaren **bütün** tarif edilir, ayağı zemine basar,
  temas gölgesi taşır. **Kalabalığı azaltmak için figür KESİLMEZ, figür SAYISI azaltılır.**
- Her ufak nesneye tag açma; yargıyla.

---

## 2R. REAL REGISTER — start-frame farkları

**İskelet aynı, dolgu farklı.** Aşağıdakiler §2'nin slotlarını REAL'de değiştirir; değişmeyen
slot §2'deki gibi kalır. Kaynak uydurma değil: `product_brand_real` ve `kurumsal_brand_film`'in
`render_law`/`light_law` metinleri (`src/core/SURGERY_DATA.json`) ve `promptQuality.mined.json`
`photoreal` maddesi.

| Slot | EDU | **REAL** |
|---|---|---|
| [1 LENS] | 24-85mm, çocuk/göz hizası | **50mm bağlam · 85-100mm hero · 100mm macro** · f/4-f/8 ürün keskinliği, f/2.8 yumuşak bağlam, f/8 mimari derin |
| [2 ÖZNE] | anlatıcı karakter + kavram | **hero-object**; insan onu kullandığı karede girer |
| [3 KİMLİK] | sıcak mat ten, düşük specular | **gözenek seviyesi mikro-doku**; el yıpranması kredibilitedir. *NO plastic AI-smooth skin* |
| [4 MEKÂN] | giydirilmiş sınıf/ev | **seamless sweep** (temiz izolasyon) · **dark field** (tek yontulmuş highlight) · **gerçek pencere ışığında Türk evi/masası** (lifestyle) |
| [5 IŞIK] | motive key + bounce + rim | **stop cinsinden ölçülü**: softbox/gradyan key formu biçimler, fill key'in **1-2 stop altında**, rim/kicker nesneyi zeminden ayırır |
| [6 KAVRAM] | kavram ışığı | **yok** — reklamda kavram ışığı yoktur; yerine **gerçek specular olay** (cam kırılması, metal anizotropi, sıvı viskozitesi) |
| [9 TEMAS] | temas gölgesi | aynı — ama REAL'de temas **fizik**: yansımalar geometrik tutarlı olmak zorunda |
| STYLE | dünya kilidi | aynı ≤90 kelime — ama **stil sıfatı malzemenin yerine geçemez**: "premium commercial look" / "Deakins lighting" yasak, fiziksel malzeme gerçeği yazılır |

### REAL'in kendi zorunlu üçlüsü — motorun varsayılanını kıran karşı-terimler

`promptQuality.mined.json` → `photoreal`, VERBATIM: *"negative fill, motivated light, subtle 35mm
film grain, raw skin micro-texture"*. Bu madde **image yolunda canlı** ve `product_brand_real`
seçilince prompta gerçekten giriyor — ama 181 karenin 181'i EDU olduğu için **bir kez bile
ateşlemedi**. Motorun varsayılanı "parlak ticari plastik"tir; bu üçlü onu kıran tek şeydir.

🔴 **Dünya yasasındaki gerçek boşluk:** REAL dünyalar **diyaframı ve stop farkını yazıyor ama
karanlığı yazmıyor.** `negative fill`, kontrast oranı (4:1–6:1) ve **siyah noktası** dünya
metninde yok; yalnız referanslarda yaşıyor (`corp_architectural_daylight` → *"negative fill from
the room's own dark surfaces"*, `product_glass_refraction` → *"black flags stood close on both
sides… deep true black in the flagged edges, never a lifted grey"*). **Ref seçilmezse REAL dünya
gölgesini kaybeder.** Yazarın işi: bu üçünü kareye elle yazmak — ya da ref'i seçtiğinden emin olmak.

### REAL'de TEXT slotu

- Yazı **gerçek diegetik madde**: ambalajın üstüne basılmış, cama kazınmış, ekranda yanan.
  Havada duran overlay/UI **yok** (her iki dünyanın negatif kilidinde açık madde).
- **Türkçe etiket** — "NO English signage" iki dünyanın da 2. negatifi.
- **Marka:** `brandKitLock` doluysa logo **onaylı referanstaki gibi tam oranla** basılır, asla
  uydurulmaz; boşsa ürün ve ambalajı **özgün ve markasızdır**.

### REAL'in kamera zarfı

Kilitli ve hassas: tabletop + göz hizası hero açıları · birkaç santimlik slider ya da birkaç
derecelik turntable, **tam durarak** · satan detaya inen macro push-in · gerçek el girip çıkabilir.
Kurumsal: yavaş gimbal glide (yürüme temposu), mimari için kilitli simetri, karar anında yüze
inip **tam duran** push-in. **Asla** handheld weave, whip pan, top-down flat-lay, drone-epik
silüet.

### 🔴 Kütüphane kusuru — kodda değil, dünyada düzeltilecek

`kurumsal_brand_film`'in 1. negatifi koşulsuz: *"NO named real companies, banks, holdings, brands
or logos"*. `product_brand_real`'inki ise muafiyetli: *"…OTHER than the client brand locked in the
Brand Kit"*. **Bir kurumsal reklam filminde müşterinin kendi logosu kendi dünyasının 1. maddesiyle
çakışıyor.** Düzeltme yeri kütüphanedir (`SURGERY_DATA.json`), kod değil — faz yasası: kod yasası
genel, dünya kusuru yereldir.

---

## 3. MOTION TEMPLATE — Kling 3.0 (i2v)

**Mutlak yasa: görmediğin kareye motion yazma.** Onaylı kare Read ile açılır ve görülür.
Revize edilmiş kare de dahil.

Kötü set ölçüsü (Mami: *"bok gibi duruyor"*): klip başına 61 kelime, kod bloğu, virgül listesi,
69 klipte donmuş aynı kuyruk. İyi set: düz metin, tam cümle ve **her klipte kare-özel kilit.**
⚠ Buraya bir zamanlar *"iyi set 114 kelime"* yazılıydı ve aşağıdaki 190-215 hedefiyle
çelişiyordu. Sayı ölçümle güncellendi — geçerli tek rakam §3'teki **190-215**'tir
(altın standart Eşeyli 202; Kling'in resmi kılavuzu 60 altını öneriyor, aradaki fark
sınanmadı). 114 rakamı eski ve farklı bir setin ölçüsüydü, kaldırıldı.

🔴 **BİÇİM: TEK PARAGRAF. SLOT YOK, KÖŞELİ PARANTEZ YOK.** (Mami, 2026-07-30:
*"salak gibi image formatıyla yazmışsın, direkt morph."*) Bu maddenin eski hâli motion'ı
image prompt'un slot iskeletiyle tarif ediyordu ve **altın standartla çelişiyordu** —
Eşeyli'nin 50 motion dosyasının 50'si tek akıcı paragraf. Slot'a bölünen motion prompt'unda
motor cümleler arası sürekliliği kaybediyor ve morph üretiyor. Ölçüm: slot formatıyla yazılan
sette Mami hükmü *"hiç beğenmedim"*, paragraf formatıyla yazılan Eşeyli altın standart.

```
### K<n> | <süre>s · ekranda ~<x>s | VO "<Türkçe cümle>"
KAMERA NİYETİ: <tek Türkçe cümle — yönetmen için, prompta GİRMEZ>
-----
<TEK PARAGRAF, akıcı İngilizce, tam cümlelerle, 210-260 kelime. Zorunlu iç sırası:>
  1 ZATEN OLAN İŞ   klip devam eden bir işin ORTASINDA açılır:
                    "The clip opens with @efe still hunting: his fingertips keep making
                    tiny turns on the focus knob…" — durgun kare + tek olay DEĞİL.
  2 SEBEPLİ TEK VURUŞ  bir şey o işi bitirir ("Then the image finds him — at that instant…")
                    ve o an insanın yüzü değişir. Sebep yazılır; vuruş sebebe bağlanır.
  3 ADI KONULMUŞ YAY  klip DUYGUSUNU cümle olarak söyler:
                    "he begins comparing and ends having decided" · "the row begins alert
                    and ends with one of them asleep under her" · "he works it out".
                    Bu cümle yoksa klip mekaniktir — ruh tam olarak buradadır.
  4 AMBİYANS        tek cümlede, karede ZATEN duran 2-3 öğe.
  5 Camera:         KENDİ CÜMLESİ, "Camera:" ile açılır, paragrafın SONUNA yakın durur.
                    Nereden başlar · neyi sıyırır · nerede tam durur.
  6 KİLİT           **TEK cümle, en çok ~45 kelime.** O karenin gerçek bozulma yolu.
  7 SABİT KUYRUK    Silent clip, no audio, no dialogue, mouth closed, no lip movement.
                    No whip-pan, no shake, no snap-zoom, no camera warp.
-----
DURUM: temiz
REVİZE:
```

Yukarıdaki yedi numara **paragrafın içinde bulunması gereken şeylerin listesidir**, prompta
yazılacak etiket DEĞİLDİR. Numara, köşeli parantez ya da satır başı madde motora gitmez —
tek istisna `Camera:` sözcüğü, o altın standartta 28/50 dosyada aynen böyle geçiyor.

🔴 **ÖLÇÜLEN ÜÇ KUSUR — Mami hükmü: *"hareketler çok ai, hiç duygu yok, ruh yok, aptalca ani
hareketler"* (2026-07-30, Mira K01-K21 basıldı).** Altın standart 50 dosya ile kusurlu 54
dosya sayıldı; fark şans değil, üç yapısal madde:

| | Eşeyli (altın) | Mira (Mami reddetti) | hüküm |
|---|---|---|---|
| `Camera:` ayrı cümle, sonda | 28/50 | **0/54** | kamera paragrafın başına kaynatılınca gövde donuyor |
| `@tag` ile kimlik | 24/50 | **6/54** | tagsız insan = motorun uydurduğu yüz = plastik |
| `"half a second later"` | 1/50 | **16/54** | **ANİ HAREKETİN SEBEBİ BU** |
| `"At first…"` iskeleti | 18/50 | **52/54** | aynı metronom 54 kez = tarif değil takvim |

1. **`half a second later` YASAK.** Motor bunu takvim sanıyor ve o anda **snap** yapıyor.
   Yerine sebep bağlacı: `Then… — at that instant…` · `when he arrives there` · `Finally`.
   Hiçbir yere saniye yazılmaz; sıra sebeple kurulur.
2. **Kilit bütçesi ~45 kelime.** Mira dosyalarında yasak cümleleri paragrafın ~%35'iydi.
   Motora izin verilen alan kalmayınca **kendi hareketini uyduruyor.** Kısa kilit = sakin klip.
3. **Tagsız insana motion yazılmaz.** Karede tekrar eden insan varsa `@tag`, yoksa **kimlik
   olumlu ve tek cümlede sabitlenir** ("the same broad-faced man in the petrol-blue coat").
   "the woman", "the front man" yazan klipte motor her frame'de yeni yüz çiziyor.

**Teslim şekli:** klip başına ayrı dosya — `<Ad>/MOTION/01.txt … 54.txt`. Tek büyük dosya
Mami'nin akışını bozuyor; o klip klip kopyalıyor.

### 3ø. KLING 3.0'IN YAPAMADIĞI ÜÇ ŞEY (Mami, 2026-07-30 — kredi ölçümüyle)

> *"Hiçbir kalemle yazı işini beceremiyor Kling 3.0, o yüzden yazmasın, karakterler
> konuşmasın, yazı da sıçıp batırıyor hep."*

- **KİMSE YAZMAZ.** Kalem, kurşun kalem, tebeşir, fırça — hiçbir el harf ÜRETMEZ. Karede
  yazan bir el varsa motion'da o el **durur**: kalem kâğıda değmiş hâlde kalır ya da elden
  bırakılmıştır. `writes`, `traces`, `signs`, `the tip moves along` → hepsi yasak fiil.
- **KİMSE KONUŞMAZ.** Sabit kuyruk zaten yazıyor ama sebebi burası: ağzı oynayan Kling
  klibi yüz morph'u üretiyor. Gülümseme serbest, **çene açılması yasak.**
- **KAMERA YAZIYA YAKLAŞMAZ.** Yazı taşıyan kareye push-in, dolly-in ya da yazıya rack
  focus YOK. Mesafe klip boyunca sabit kalır; kilit hem yaklaşmayı hem okunur hâle gelmeyi
  ayrı ayrı yasaklar. Karedeki yazı bozuksa bu kilit onu **kurtarır** (Mira K22 böyle
  kullanıldı: "TANAN" yazıyor, kamera hiç yaklaşmadı, kare kabul edildi).
- 🔴 **YAZIYI TAŞIYAN NESNE DE KIPIRDAMAZ** (2026-07-31, klip karşılaştırmasıyla ölçüldü).
  Kamerayı uzak tutmak yetmiyor: **taşıyıcı hareket ettiği an harf eriyor.** Kanıt — kolideki
  `KİTAP` kutu çökerken eriyor (`3.6s`), `GİDA` harfleri titreyip bozuluyor (`1.0s`). Buna
  karşılık altın standartta `REJENERASYON` ve `HİDRA` klip boyunca formunu ve font netliğini
  koruyor, çünkü taşıyıcıları hiç oynamıyor. **Kural: yazı taşıyan nesne motion'da sabit
  kütledir** — devrilmez, çökmez, açılmaz, elden ele geçmez, rüzgârda kıpırdamaz.

**Sıçramanın zamanı da ölçüldü:** kötü kliplerde eklem sıçramaları `1.6s`-`3.5s` arasında
kümeleniyor, yani klibin ortasında. İyi kümenin yedi klibinde sıçrama **sıfır**. Sıçrama
rastgele değil, **prompt'un o ana bir şey sıkıştırmasından** doğuyor.

### 3a. KLİPTE BİR ŞEY DEĞİŞMELİ — motion'ın §11'i

> **2026-07-28 ölçümü.** Bileşke Kuvvet'in 52 klibinde **333 yasak** ("no X" / "never X") var,
> buna karşılık zaman omurgası olan **3 klip**. Mami'nin hükmü: *"iğrenç animasyonlar."*
> Örnek klip: *"yürüyor, çantası sallanıyor, ışık süzülüyor, otobüs uzakta duruyor, koşmuyor,
> tökezlemiyor, yeni kimse gelmiyor, yüzü kaymıyor, ses yok, whip-pan yok, warp yok."*
> Kusur bozukluk değil **ölülük**: klibin sonu başından farklı değil. Bu klipler **yönetmiyor,
> savunuyor.**

Kök sebep [1 DEVAM] slotunun yumuşaklığıydı: "tek fiil" diyor, *"yürüyor"* da tek fiildir ve
hiçbir yay taşımaz. Bağlayıcı hale getirildi:

1. **Klibin SONU BAŞINDAN FARKLI OLMALI ve fark YAZILMALI.** "Yürüyor" değişim değil,
   **"varıyor"** değişimdir. "Bakıyor" değil, **"gördüğü an yüzü değişiyor"**. Klip bir
   durumdan başlar, başka bir durumda biter; prompt ikisini de adlandırır.

   🔴 **GÖVDE: TEK SÜREKLİ DOĞAL JEST — ne donar, ne yeniden eklemlenir.**
   > Bu madde iki kez yanlış yazıldı, ikisi de kliple ölçüldü. Önce *"değişim gövdede olmaz,
   > insanda yalnız kaş ve bakış oynar"* yazıldı; sonra *"iki dönüşüm aynı karede olmaz,
   > gövde oynarsa kamera durur"* eklendi. **İkisi de yanlıştı ve 54 klibi ölü yaptı.**
   > Altın standart ikisini de çiğniyor: `35.txt` Efe başını çevirirken kamera masanın
   > çevresinde ark çiziyor · `41.txt` yavru dönüp annesinin böğrüne gömülürken kamera tüy
   > hizasında kayıyor · `12.txt` parmaklar düğmeyi çevirirken dolly masa boyunca hızlanıyor.
   > **Kamera ve gövde aynı anda oynar.**

   Gövde **tek sürekli doğal jest** yapar: baş çevirme, çeneyi indirme, esneyip başını gömme,
   çeken kolun gerilip gevşemesi, oturduğu yerde öne yaslanma, elin bir yüzeye yerleşmesi.

   **İki uçtan biri kadar öteki de kusurdur:**
   · **Dondurmak** — 5 saniye boyunca yalnız kaş oynatan klipte motor boşluğu kendi uyduruyor.
   · **Yeniden eklemlendirmek** — motorun gövdeyi baştan kurmak zorunda kalması.

   🔴 **KLİPLE ÖLÇÜLDÜ (2026-07-31, 34 klip izlendi).** Dondurmanın bedeli tahmin değil:
   **34 klibin 26'sında (%76) aynı kusur — "donuk iskelet üzerinde eriyen yüz ve eller."**
   Gövde heykel gibi kıpırdamıyor, buna karşılık göz, çene, dudak ve eller sıvı gibi akıyor.
   Klip 6: yüz `0.0s`'de pürüzsüz, `1.25s`'de burun ve çene yok. Klip 5: parmaklar `0.0s`'de
   kusursuz, `1.46s`'de altı kemiksiz yapı. **Başlangıç karelerinin %90'ından fazlası temizdi**
   — hasar karede değil, hareket isteğinde. *"Ruh yok"* ile *"aptalca ani hareket"* aynı
   kusurun iki yüzüdür: motora bir şey yapması yasaklanınca yapabildiği tek şeyi yapıyor.

   **YASAK — 5 saniyede istenmez:** oturmaktan doğrulmak · ayağa kalkmak · giysi giymek ·
   el-ayak temaslı ince motor iş (çorap çekmek, bağcık bağlamak) · yürüyüşe başlamak ·
   bir nesneyi alıp başka yere koymak · **nesnenin el değiştirmesi.** Bunlar beat değil
   **animasyondur.** El değiştirme gerekiyorsa tek klipte yapılmaz — başlangıç+bitiş karesi
   kullanılır.

   **TEMİZ ÇIKAN KLİPLERİN ORTAK YANI** (34 klipten 3'ü, ölçüldü): karmaşık uzuv hareketi
   denenmemiş · hareket mikro jestle sınırlı (yaprak süzülmesi, ışık kayması, nefes) ·
   kamera ya sabit ya çok düşük genlikli. Reçete budur.

   **Negatif bunu kurtarmaz.** Kusur pozitif taraftadır: motora yapamayacağı bir şey
   söylenmiştir. Sahneye özel negatif doğru yazılmış olsa da klip ölür.
2. **Zaman omurgası zorunlu.** Tek yay üç parçalıdır ve sırası yazılır: *başlangıç durumu →
   dönüm (tek olay) → yerleşme*. "Önce/sonra/o anda" kelimeleri kullanılır. Aynı anda olan
   dört ambiyans hareketi bir yay değildir.
3. **[4 KİLİT] kare-özel ve ZORUNLUDUR — asla atılmaz.** Kaldırılan şey genel-geçer korku
   listesidir ("koşmasın, tökezlemesin, yeni kimse gelmesin"), o karede gerçekten olabilecek
   bozulma değil: kavram ışığı çiçek olur, harf yeniden hecelenir, cam erir, özne kadrajdan
   çıkar. Bunlar YAZILIR. [5]/[6] sabit kuyruktur, kare-özel sayılmaz.

   **Kilidi tercihen OLUMLU yaz.** *"Nobody leaves and nothing new arrives: exactly one bird,
   one cat and one seedling from first frame to last"* — bu, "no new animals" listesinden hem
   daha nettir hem motorun anladığı dildedir; sayı, konum ve süre verir. Aynı sebeple kimlik
   de olumlu tutulur (bkz. feragatname yasası). ⚠ Denetim notu: **yasak SAYMAK yanıltır** —
   olumlu yazılmış bir kilit hiçbir "no" içermez ve sayaçta sıfır görünür. Kilit var mı diye
   bakarken kelimeyi değil, **o karenin bozulma yolunun kapatılıp kapatılmadığını** ara.
4. **Kimlik negatifle korunmaz** — *"yüzü kaymasın"* çalışmaz (bkz. feragatname yasası).
   Kimlik olumlu tutulur: o yarım saniyede yüzün **ne yaptığı** yazılır.

Kıstas tek cümle: **klibi okuyan biri "ne oldu?" sorusuna cevap verebiliyor mu.** Veremiyorsa
o klip ambiyanstır, motion değil.

- **Motion yeni öğe doğurmaz.** "Sonra bir çocuk gelir", "yazı belirir" YOK.
### 3b. KAMERA — "sıkıcı slowly push in" yasak

> **Mami, 2026-07-28:** *"Sahneler yaşasın, canavar gibi start frame'lerin var, limit testing yap.
> Öyle sıkıcı slowly push in istemiyorum — Disney filmi edasında kamera."*
> Bu madde, aynı satırda duran eski **"şık, sakin, öğretici"** hükmünü **kaldırır.** O cümle iki
> ayrı şeyi birbirine karıştırıyordu: motorun gerçek sınırı (hızlı kamera + katı nesne = warp)
> ile bir zevk varsayılanı (sakin olsun). Birincisi fizik, kalır. İkincisi kimsenin istemediği
> bir çekingenlikti, gider.

- **Varsayılan sakin DEĞİL, gerekçeli ve canlıdır.** Kamera da bir oyuncudur: bir yerden başlar,
  bir sebeple hareket eder, bir yere iner. Kameranın da yayı olur.
- **"Slow push in" refleks olarak YASAK.** Yalnız push-in'in *kendisi* o anın olayı olduğunda
  (anlama, fark etme, itiraf) meşrudur — ve o zaman bile hızlanıp yerleşir, sabit sürünmez.
- **Uzun-metraj animasyon dili serbest ve teşvik edilir:** ön plan paralaksıyla dolly · özneyi
  saran yavaş ark/orbit · kreyn ile inip göz hizasına oturma · aksiyonu takip edip bırakma ·
  alçak açıdan kahraman kadrajı · rack focus'un *beat* olarak kullanılması · bir hareketin
  içinde hızlanma-yavaşlama (ease) — düz sabit hız değil.
- **Limit testing serbest.** Start frame güçlüyse kamera cesur olabilir; bozulan klip bilgidir,
  kusur değil. Bozulursa o karede minimale in ve **nerede bozulduğunu ledger'a yaz.**
- **Duran tek sınır fiziktir:** katı/mekanik nesne (dişli, pusula, kronometre, harf) + hızlı
  kamera = warp. Böyle karelerde kamera minimal + `rigid solid, no deform/melt/morph/merge,
  no pass-through`. Yazı taşıyan karede de kamera yazıyı **düzlemde** tutar.
- Kamera **sahnenin fizik hükmünden** çıkar: neyi göstermek istiyorsan oradan başla, oraya git.
- **Katı/mekanik nesne (dişli, pusula, kronometre) + hızlı kamera = WARP.** Böyle karelerde kamera
  minimal + *"rigid solid, no deform/melt/morph/merge, no pass-through"*. Uzun klip drift riski;
  bozulan karede 5s kullan.
- **Kavram ışıkları IŞIK kalır** — çiçek, ok ucu, gerçek ateş olmaz. Kare-özel kilide yaz:
  *"the glow stays a soft round golden light and never becomes a flower, petal or flame."*
- **Yazı dondurulur:** *"do NOT morph, re-spell, wobble or add ANY text."*
- **Bozuk motion'da önce KAREYİ düzelt.** i2v'de kompozisyon/yörünge kareden gelir; motion'a
  negatif yığma. (İstisna: kamera-kaynaklı warp — orada kamera minimale çekilir.)
- **Riskli klipleri önceden işaretle** (uzun VO, hızlı takip, geniş crane) — kredi yakmadan test edilsin.
- Kling native ses: sesin **fiziğini** yaz, adını değil. VO ayrı ElevenLabs katmanı; ekranda kimse konuşmaz.

### 3R. REAL register — motion farkları

**Motion sözleşmesi kodda register görmüyor** (`buildMotionPromptQualityContract` dünya parametresi
bile almıyor). Yani REAL'de motion yasasını taşıyan tek şey bu metindir.

- **Kamera REAL'de daha kısıtlı:** slider birkaç santim, turntable birkaç derece, ikisi de **tam
  durarak**. Push-in yalnız "satan detay"a ya da karar anındaki yüze. Handheld weave / whip pan /
  drone-epik yok — bu bir üslup tercihi değil, iki REAL dünyanın `camera_grammar`'ında yazılı yasak.
- **Yeni öğe doğurmama yasası aynen geçerli** ve REAL'de daha sert: yansımalar geometrik tutarlı
  kalmak zorunda, motion bir yansımayı uyduramaz.
- **Ürün karesi = katı nesne riski.** Cam, krom, metal + hızlı kamera = warp. §3'teki katı-nesne
  kilidi REAL'de varsayılan: *"rigid solid, no deform/melt/morph/merge."*

### Konuşan klip — çatal kapandı (Mami, 2026-07-27)

`[5 SESSİZ]` (still-lips, no-dialogue) bir **medium yasası değil, EDU iş akışı yasasıdır**: VO ayrı
ElevenLabs katmanında okunduğu için ekranda kimse konuşmuyor. Reklam filminde konuşan
sunucu/testimonial standarttır — REAL bu maddeyi olduğu gibi devralırsa bir yeteneği keseriz.

**Hüküm — üç kademe:**

1. **Varsayılan REAL'de de sessizdir.** Sebep iş akışı: VO tek seferde ElevenLabs'te okunuyor,
   Premiere'de altına seriliyor. Konuşan klip bu akışı bozar — dudak senkronu tutmazsa kesim
   masasında düzeltilemez (Mami AE bilmiyor; §1'in start-frame yasasıyla aynı gerekçe).
2. **Konuşan klip REAL'de YASAK DEĞİL, ölçülmemiştir.** Kling 3.0'ın Türkçe dudak senkronu bu
   makinede **hiç sınanmadı**, ve faz yasası açık: *ölçülmemiş motora yasa yazılmaz.* Bu yüzden
   ne "yapılamaz" denir ne de seri üretime sokulur.
3. **Açılış yolu bir tek klip testidir.** Konuşan sunucu gerekiyorsa: tek klip, kısa cümle,
   `[5 SESSİZ]` kilidi o klipte **açıkça kaldırılır** ve klip §3'ün *riskli klip* işaretiyle
   önce tek başına üretilir. Tutarsa yazılır ve yasa büyür; tutmazsa VO katmanına dönülür ve
   kare **konuşmayan** bir beat'e çevrilir.

Yani REAL'de fark şu: EDU'da sessizlik bir **kural**, REAL'de bir **varsayılan**. Kuralı kırmak
kanıt ister; varsayılanı değiştirmek bir test klibi.

---

## 4. REFERANS TEMPLATE

Referans promptu start-frame'den dört noktada ayrılır: **mekân yok stüdyo var · lens sabit ·
aksiyon yok poz var · yazı yönetilmez, yasaklanır.**

```
[1] Full-body character reference of @<handle>:   |   Full object reference of @<handle>:
[2] KİMLİK: köken + yaş + ten (subsurface) + saç + göz + ifade + çocuk-güvenli siluet
[3] GARDIROP/MALZEME + RENK GEREKÇESİ
[4] POZ: relaxed hero pose, weight on one foot — thumbnail boyutunda okunur
[5] 85mm lens at f/4.0, full body centered, soft studio key + cool bounce,
    warm-grey seamless gradient backdrop with a soft floor contact shadow
    — "not a story location and not an empty white void"
[6] Materials: <2-4 kalem>
[7] Dünya kuyruğu (premium-CG feature-animation, RenderMan-successor lineage)
[8] NEGATİF: no logo, no photoreal, no flat 2D or cel, no franchise, no text
```

- **Renk gerekçeli seçilir:** *"a forest-green backpack (deliberately green — not red, not blue,
  so he never clashes with the lesson's red/blue concept lights)"*. Palet çakışması referans
  seviyesinde çözülür, sahnede değil.
- Referans dosyasının başına şu not düşülür: *"Sahne promptlarında @handle'ı asla tarif etme."*
- **Küçük prop istisnası:** referans basmaya değmeyen küçük obje için **tarif kilidi** kullan —
  sabit kelime öbeği her karede aynen tekrar edilir. Ucuz ve tutuyor.

### §4a — REFERANS ENVANTERİ İLK İŞTİR (Mami, 2026-07-29)

> *"Projelere başlarken tekrar eden şeylerin referanslarını oluştur, kural olsun bu sana."*

**Tek kare yazılmadan önce** VO metni ve edit planı taranır; **iki ya da daha fazla klipte
tekrar eden her şey** envantere girer: karakter, hero-prop, tekrar eden mekân.

Envanter üç kovaya ayrılır ve `<Ad>_REFERANSLAR.txt` promptlardan **ÖNCE** yazılır:

| Kova | Ne yapılır |
|---|---|
| **Zaten tag'li** | Basılmaz. Yalnız kullanım kuralı yazılır (kimlik handle'dan, hâl karede). |
| **Basılacak** | Referans promptu yazılır + **ilk geçtiği kare** ve **aralığı** tabloya girer. |
| **Tarif kilidi** | Referans basmaya değmeyen küçük obje — sabit kelime öbeği, her karede aynen. |

Envanter tablosu **hangi sekans hangi referansı istiyor** bilgisini taşır. Kazancı somut:
Bileşke'de bu tablo çıkınca INTRO'nun hiç yeni referans istemediği görüldü — Mami 16 kareyi
referans beklemeden basabildi.

**Neden ilk iş:** referans yolda kararlaştırılırsa aynı nesne her karede yeniden tarif edilir
ve tarifler birbirini tutmaz — süreklilik kusurlarının kaynağı budur. Ölçüldü: 50 karelik bir
derste imla 50/50 temiz çıkarken **kusurun tamamı süreklilikteydi.**

⚠ **Referans dosyası klip numarası taşır — plan değişirse dosya da değişir.** Bileşke v1'in
referansı `@kitap → K32-K37` diyordu; edit planı v2'de 52 klip 71 olunca o numaralar bambaşka
kareleri gösterir hale geldi ve dosya sessizce yalan söylemeye başladı. Klip sayısına dokunan
her düzenlemede referans dosyası yeniden numaralanır.

---

## 5. TESLİM SETİ — kurgu kiti

Bir ders şu dosyalarla kapanır (hepsi `.txt`, hepsi `agents/COMMAND-INBOX/<Ad>/`):

| Dosya | Ne zaman |
|---|---|
| `<Ad>_REFERANSLAR.txt` | prompt yazımından ÖNCE |
| `<Ad>_PROMPTLAR.txt` | sekans sekans |
| `<Ad>_revize.txt` | denetim geçişinde (`### dosya.png` blokları — node parse eder) |
| `<Ad>_MOTION.txt` | kareler görüldükten sonra, süreleriyle |
| `<Ad>_EDIT-PLAN.txt` | **motion ile birlikte** |
| `<Ad>_SESLENDIRME.txt` | **motion ile birlikte** |
| `<Ad>_SUNO.txt` | **motion ile birlikte**, tek temiz Simple prompt |

Biten ders `agents/COMMAND-INBOX/Biten/<Ad>/` altına taşınır. Kaynak command JSON'a dokunulmaz.

**Kurgu kiti motion fazıyla BİRLİKTE gelir** (Mami direktifi 14). Motion tek başına teslim
değildir. Aşağıdaki üç şablon, teslim edilmiş kitlerden madenlendi — en olgunu Sabit Sürat.

### EDIT-PLAN — Premiere haritası

Satır biçimi (sekans başlıkları arasında, kare numarasına göre sıralı):

```
<dosya>.png  K<nn>   <klip>s   <VO>s   [d:dd–d:dd]   <VO cümlesi>   (S<x>+<y>)   ◄<uyarı>
```

- **`(S40+41)`** — birleşen sahneler açıkça yazılır; Mami hangi iki cümlenin tek klipte
  aktığını görmeden kesemez.
- **`◄VO>10s`** — VO süresi klip penceresini aşıyorsa satırda **uyarı olarak durur** ve ne
  yapılacağı yazılır: *"son kareyi ~1-2s dondur ya da VO'yu bir tık hızlı oku."* Bu, Premiere'de
  fark edilecek bir sorunu kurgu masasına ÖNCE taşır — kitin en değerli tek satırı.
- Sonda: **TOPLAM süre + klip sayısı**, sonra `MÜZİK` (SUNO dosyasına atıf + VO altında ~-18 dB
  + sekans enerjisi + hangi reveal karelerinde müzik nefes alacak), `SES MİKS` (VO önde, klipler
  sessiz üretildi, SFX minimal) ve varsa `NOT`.

### SESLENDIRME — ElevenLabs okuma metni

Kare numarası ↔ cümle eşlemesi kesintisiz. Mami VO'yu **tek seferde okutuyor**, o yüzden metin
okunacak sırayla ve kesintisiz akar; kare numarası satır başında referans olarak durur.
Telaffuz notu gerekiyorsa (sayı, birim, kısaltma) cümlenin yanında parantezle verilir.

🔴 **İKİ DOSYA ZORUNLU — numaralı sürüm ÇALIŞMA dosyası, tek blok TESLİM dosyasıdır.**
(Mami, 2026-07-31: *"tek metin olarak ver ve bunu kural yap, parça parça nasıl üreteyim,
tekte üreteceğim."*) ElevenLabs'e numaralı metin yapıştırılamaz — numarayı da başlığı da
**okur.** Teslimde `<Ad>_SESLENDIRME-TEK-BLOK.txt` bulunur: numara yok, başlık yok, yönerge
yok; bölüm başlıkları boş satıra (nefes) dönüşür.

**Elle çıkarma YASAK, araç var:** `node scripts/seslendirme-tek-blok.mjs "<proje klasörü>"`.
Sebep ölçüldü: elle yapılan ilk çıkarımda `AŞAĞISI KOPYALANMAZ` bölümündeki bir okuma
yönergesi metnin sonuna sızdı — o satır da `NN.` deseniyle başlıyordu ve göz onu ayırmadı.
Araç o sınırı tanır, ayrıca karakter sayısını basar ve **5000'i aşarsa uyarır** (ElevenLabs
tek seferde o kadar alıyor).

### SUNO — Simple kutusuna tek temiz prompt

Mami direktifi 15: **tek paragraf, yapıştırılacak.** Biçim:

```
>>> SUNO "SIMPLE" KUTUSUNA — SADECE ŞUNU YAPIŞTIR <<<

<tek paragraf İngilizce: tür + duygu + görsel çağrışım + enstrüman listesi + ton/tempo +
"plenty of room for a narrator" + "instrumental only, no vocals, no lyrics">
```

Sonra ayrı bir blokta **(opsiyonel — Custom mod)**: negatif satırı · sekans enerjisi ·
miks notu. Simple kutusuna yalnız üstteki paragraf gider; structure/tag bloğu **yazılmaz**.

**Neden tek paragraf:** structure/tag'li brief Suno Simple kutusunda çalışmıyor ve Mami'nin
akışını bozuyor. Site `brain-data.ts` içindeki `SUNO_MAP` yapılandırılmış brief üretir — o
**bu kuralın zıddıdır** ve kullanılmaz.

---

## 6. Bu yasa nasıl büyür

Her biten videonun revize dosyası **ders adayı** üretir. Aday `agents/lessons/CANDIDATES-*.md`'ye
yazılır; Mami onayladığı satırı `agents/lessons/APPROVED.md`'ye taşır. **Otomatik promote yok** —
çöp ders sistemi zehirler.

Yeni bir kelime tuzağı görürsen prompta yama yapma: **kelimeyi kütüphanede düzelt, testi büyüt**
(`src/core/wordTraps.test.ts`). `saffron` ve `SSS→sheen` böyle kapandı ve bir daha prompt yoluna
giremiyor.

Bir yasa buradan çıkarılacaksa gerekçesi yazılır. "Çağrılmıyor" tek başına kanıt değildir.
