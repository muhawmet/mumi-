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

---

## 2. START-FRAME TEMPLATE — Nano Banana 2

Slot sırası bağlayıcı. Başlık satırı yönetmen içindir, prompta girmez.

```
### K<n> | VO<n> "<Türkçe cümle>" · yazı: <"KELİME" | YOK> · <KAVRAM | KARAKTER>
-----
[1 LENS]      <24-85>mm lens at f/<x>, <göz hizası|yüksek|alçak> <yakın|orta|geniş> <üç-çeyrek> view
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
TEXT: <kahraman yazı HARF HARF + konumu> · <arka plan: soft-focus, Türkçe ya da boş>
NEGATIVE: <KARE-ÖZEL 1-2 madde ÖNCE> ; <global kuyruk>
-----
```

### Slot kanıtları

| Slot | Kanıt |
|---|---|
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
- **Türkçe metin ya da HİÇ.** İngilizce tabela/poster/rozet yok; okunmayacaksa yüzey boş kalsın.
- **Pozitif çerçevele.** NB2 negatif yığınını zayıf okur: "boş sıcak duvar" yaz, "dağınıklık yok" değil.

### @tag disiplini

- **2+ karede görünen belirgin nesne = üretimden ÖNCE referans + `@tag`.** Tag'siz tekrar eden
  prop her karede başka çıkar: Bileşke'de kitap 6 ardışık karede 6 farklı kitaptı ve 6 kare
  toptan revize oldu. **Korpusun en pahalı tek hatası** — üstelik `@kitap` referansı yazılmıştı
  ama promptlarda hiç kullanılmadı. Referans üretip handle'ı çağırmamak, referansı hiç
  üretmemekten kötüdür.
- Karakteri **asla tarif etme**, handle yeter — görünüş yalnız referans promptunda tanımlanır.
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
69 klipte donmuş aynı kuyruk. İyi set: klip başına 114 kelime, düz metin, tam cümle ve
**her klipte kare-özel kilit.**

```
### K<n> | <süre>s · ekranda ~<x>s | VO<n> "<cümle>"
KAMERA NİYETİ: <tek Türkçe cümle — yönetmen için, prompta girmez>
-----
[1 DEVAM]   Karedeki öznenin BİR SONRAKİ yarım saniyesi — tek fiil, tek yay (sebep-etki-yerleşme).
[2 ORTAM]   Karede zaten duran 2-3 öğenin küçük canlanması (yaprak iner, toz döner, gölge kayar).
[3 KAMERA]  Camera: <tek hareket + gerekçesi>
[4 KİLİT]   Kare-özel yasak: kim çerçeveden çıkmaz, ne yerinden oynamaz, ışık ne OLMAZ, yazı sabit kalır.
[5 SESSİZ]  Silent clip, no audio, no dialogue, mouth closed, no lip movement.   ← [EDU] bkz. §3R
[6 OPTİK]   No whip-pan, no shake, no snap-zoom, no camera warp.
-----
```

- **Motion yeni öğe doğurmaz.** "Sonra bir çocuk gelir", "yazı belirir" YOK.
- **Kamera sahnenin fizik hükmünden çıkar.** Push-in yalnız bir şeyin ANLAŞILDIĞI reveal anında.
  Onun dışında kamera ya olayla gider, ya kilitli durup dünyayı yaşatır. Her yerde oynak/efektli
  kamera yok — şık, sakin, öğretici.
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
