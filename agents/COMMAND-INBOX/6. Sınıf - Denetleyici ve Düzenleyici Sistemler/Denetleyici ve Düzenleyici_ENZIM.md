# DENETLEYİCİ VE DÜZENLEYİCİ SİSTEMLER — KİLİTLER (2026-08-07, SIFIRDAN)

> Eski ENZIM arşivde (`_ESKI/`) ve **açılmaz** — kök neden oradaki KİLİT 1'di
> (*"bu ders metal ve cam dersidir"*): bir MALZEME tezi dünya kilidi yerine geçmişti.
> Bu dosya kısa tutuldu. Uzun kural yazmak bu projede ölçülmüş bir kusurdur.

---

## 1 — DÜNYA: MEKÂN KAVRAMI TAKİP EDER, TEK MEKÂN YOK

`pixar_3d_edu` · register **EDU** · Image: Nano Banana 2 (Magnific) · Motion: Kling 3.0.

🔴 **Tek bir mekân kilitlenmez.** Her sekansın mekânı **kaynak docx'ten** gelir:

| sekans | mekân | kaynağın kendi cümlesi |
|---|---|---|
| S1 K01-08 | **konser salonu** | *"dev bir orkestra, onlarca enstrüman, en önde Orkestra Şefi"* |
| S2 K09-16 | Mira + **bedenin içi** | *"vücudumuzu saran ışık hızıyla parlayan elektrik ağları"* |
| S3 K17-24 | **nöron dünyası** | *"milyonlarca sinir hücresinden (nöron) oluşur"* |
| S4 K25-33 | **maket masası** + denge anı | *"tek ayak üstünde durmaya çalışır"* · *"bisiklete binmek"* |
| S5 K34-44 | gerçek anlar | *"elini sıcak bir çaydanlığa dokundurup hemen çeker"* |
| S6 K45-60 | **kan dolaşımı** + **lunapark** | *"kan damarları içinde süzülerek"* · *"lunaparkta tren"* |
| S7 K61-66 | konser salonu (kapanış) | iki sistemin karşılaştırması |

**Sınama — yazmadan önce:** *bu mekân kaynakta geçiyor mu, yoksa güzel render olacağı
için mi seçildi?* İkincisiyse dünya değil, bir fotoğraf fikridir. At.
Süreklilik mekândan gelmez: **Mira'dan · ışık rejiminden · paletten** gelir.

## 2 — CAST VE HANDLE

| handle | kim | durum |
|---|---|---|
| `@mira` | kahraman, 6. sınıf | rafta var (`elements/mira.png`) |
| `@maket` | sinir sistemi maketi | **üretilecek** (S4-S5, ~12 kare) |
| `@salon` | konser salonu | **üretilecek** (S1+S7, ~10 kare) |
| `@noron` | nöron / beden içi | **üretilecek** (S2-S3, ~14 kare) |

🔴🔴 **`@handle` ÇAĞRILIR, TARİF EDİLMEZ.** Yaş, yüz, saç, ten tonu, göz, gardırop,
milliyet **yazılmaz** — hepsini referans taşır. Metinde yalnız `the girl` / `she`.
*(Bu tur tam buradan kırıldı: ajan brifingine "nötr tanıma çevir" yazdım, ajan
"a ten-year-old Turkish girl in a deep red hooded sweatshirt" yazdı ve referansı ezdi.)*
🔴 **Kadraj kilidi:** `@mira` geçen her kare kadrajın DIŞARIDA bıraktığını yazar
(*"framed from mid-chest up"*), yoksa referansın stüdyo tam-boy kadrajı ithal olur.
🔴 **Element kuralı** (Mami): bir öğe **2'den fazla** görünüyorsa element olur, **1:1**
üretilir ve `elements/` içinde yaşar. Her şeyin elementi üretilmez.

## 3 — REFERANS NASIL KULLANILIR (27 kare basılarak ölçüldü)

| tür | sonuç |
|---|---|
| **karakter** (beyaz fonda tek figür) | ✅ çalışıyor |
| **mekân / nesne plakası** | ❌ **kareyi eziyor** — motor geometriyi değil bütün kompozisyonu kopyalıyor |

🔴 `references` alanına **YALNIZ `@mira`** geçilir. Mekân ve nesne sürekliliği **yazıyla**
taşınır: plaka dosyası ajanın **gözü** içindir — açar, bakar, o karenin diliyle yazar.

## 4 — ANLATIM

Anlatıcı **dış ses**. Mira ekranda **görünür ama konuşmaz**, ağız hareketi yok
(Kling "ağız oynamasın" negatifini dinlemiyor — ölçüldü).
Ton kaynağın istediği gibi: **enerjik, meraklı, eğlenceli.** Hüzünlü değil.
🔴 Kaynağın "Sunucu"su ekrana **çıkmaz**; işlevini Mira taşır — merak eden, deneyen,
fark eden bir öğrenci. Mira **seyirci değil**: elleri kadrajda, bir şey tutuyor,
gözü işin üstünde. En az **30 karede** görünür, üst sınır yok; değişen **mesafe ve açı**.

## 5 — ÖZEL OKUL STANDARDI

Mami: *"zengin bir hayat, fakir değil. Özel okullara yapıyoruz, devlete değil."*
Müşteri şikâyeti: *"gariban gariban tema yüklüyorsunuz."*
Mira'nın hayatı **varlıklı, çağdaş, geniş**: gerçek konser salonunda ön sıra · iyi bir
evde kendi çalışma masası · sağlam yeni bisiklet · gerçek lunapark.
🔴 Yasak: mütevazı köy evi · yıpranmış/çentikli/solmuş eşya · dar loş oda · eskimiş kıyafet.
⚠ Zenginlik gösteriş değil **kalitedir** — marka, logo, altın varak yok.

## 6 — VIVID (mihenk taşı: `Hayvanlarda Üreme`)

Dört imza, her karede aranır:
1. **Güçlü YÖNLÜ key** — tek, sert, belli yönden; nesneler uzun ve net gölge çiziyor.
   *"yumuşak eşit dolgu"* tek başına YASAK: düz ve soluk kare üretiyor.
2. **Doygun palet** — gölgeler dolgun renkli indigo; pastel, kırık, soluk ton yok.
3. **Kadrajda çok canlı şey** — kare nefes alıyor, poz vermiyor.
4. **Gerçek üç düzlemli derinlik** — önde odak dışı somut kütle, ortada keskin özne,
   arkada okunur mekân.
**Sınama:** *"bu kareyi Hayvanlarda K01'in yanına koysam aynı filmden mi görünür?"*

## 7 — KAVRAM IŞIĞI: TEK IŞIK, İKİ DAVRANIŞ (dersin fikri)

Aynı **sıcak-altın** ışık, iki farklı davranış. Fark renkte değil **davranışta**:

- **SİNİR** — kenarı **sert**; tek bir nesnenin **tek kenarına** oturur, o kenar bitince
  **birden kesilir**; hâle yok, yansıma yok, komşu yüzeyler tamamen soğuk, **iz bırakmaz**.
- **HORMON** — kenarı **yok**; malzemenin **içindedir**, dışa doğru sınırsız zayıflar;
  **KALIR** — bir sonraki karede öncekinin hâlesi daha geniş ve daha soluk hâlâ oradadır.
  🔴 **Kanal çizilmez** — hormon kana verilir; boru, hat, ok, akış yolu YOK.

🔴 Işık **geometrik** yazılır (*"ışık yalnız maketin beyincik parçasının dış hattına değer,
tabana ulaşmaz"*), *"kontrast yüksek"* tutmaz. Işık **nesnenin** üstündedir, tenin asla.

## 8 — ÖĞRETİM DOĞRULUĞU (sınavda hatırlanacak şey)

- Denetleyici ve düzenleyici sistemler = **sinir sistemi + iç salgı bezleri**; ikisi
  birlikte **iç dengeyi** korur.
- Sinir: milyonlarca **nöron**, mesaj **elektrik sinyali**. **Merkezî** (beyin, beyincik,
  omurilik soğanı, omurilik) + **çevresel**.
- **Beyin:** öğrenme, hafıza, duyuların değerlendirilmesi, acıkma, susama, vücut sıcaklığı.
- **Beyincik:** kasların **uyumlu** çalışması ve **denge**.
- **Omurilik soğanı:** iç organların **istemsiz** çalışması — solunum, dolaşım, sindirim,
  boşaltım; ayrıca **hapşırma, öksürme, yutkunma**.
- **Omurilik:** **refleks** merkezi; beyin ile vücut arasında mesaj taşır.
- **İç salgı:** hormonu **doğrudan kana** verir, kanalı yoktur.
  **Hipofiz** lider, büyüme hormonu · **Tiroit** boyunda, tiroksin · **Pankreas** şeker
  dengesi (yükselince **insülin**, düşünce **glukagon**) · **Böbrek üstü** adrenalin ·
  **Eşeysel** testis/yumurtalık.
- **Kapanış farkı:** sinir → hızlı · kısa süreli · elektrik; iç salgı → yavaş · uzun
  süreli · hormon.

🔴 **Üç sık hata kareye kilitlenir:**
1. `omurilik soğanı` ≠ `omurilik`; maket üstünde ışık ikisine birden değmez.
2. **Refleksin merkezi omuriliktir**, beyin değil — refleks karesinde beyin ışıksız.
3. Hapşırma/öksürme/yutkunma **omurilik soğanının** işidir, refleks karesine karışmaz.

🔴 **ÇOCUK GÜVENLİĞİ:** beden içi yalnız **sinyal ölçeğinde** açılır (nöron, elektrik ağı) —
kan, damar kesiti, organ kesiti, doku katmanı **çizilmez**. Eşeysel bezler **organ olarak
gösterilmez**; VO isimlendirir, kadraj büyümenin izini gösterir. Mira'nın bedeni üstünde
hiçbir şey gösterilmez, hiçbir kavram ışığı tenine değmez.

🔴 **ŞEMA YASAĞI — olumlu ve ÖNDE yazılır.** Etiket, çağrı çizgisi, ok, inset panel,
büyüteç halkası, iki sütunlu tablo, karşılaştırma paneli **yok**. Gövdenin ilk cümlelerinde:
*"this is a lit scene of real things in a real place, not a diagram"* — sonra negatif.
*(Ölçüldü: yasak prompt'un SONUNDA olunca referans onu ezdi ve motor ders kitabı
diyagramı bastı — etiketli oklar + uydurma İngilizce.)*

## 9 — MOTION KISITI ŞİMDİDEN KAREYE

- **OLAY DEĞİL, DURUM.** Hiçbir kare dönüşüm anını göstermez: refleks karesinde el
  **çoktan çekilmiş**; hapşırığın **sonrası**; hız treni **inişin ortasında**, düşüş anı değil.
- Yazı taşıyan nesne **sabit kütledir**; ORIENTATION cümlesi zorunlu (taşıyıcı sensöre paralel).
- Klip süresi = ekran süresi **+2 sn** (Kling'in ilk ~0.5 ve son ~1.5 sn'si kullanılamıyor).
- 5 saniyede eğilip doğrulmak, koşmaya başlamak, bisiklete binmek **yasak** — kare bunları
  gerektirmeyecek şekilde tasarlanır.
- **Kimse konuşmaz, ağız oynamaz.**

## 10 — NEGATİF

Kare-özel, **en çok 3-5 madde**, tek soru: *"BU kare nasıl bozulur?"*
⚠ Magnific `kling-30`'da ayrı negatif alanı **yoktur** — negatif, sahneyi anlatacak
kelimelerle aynı bütçeden gider. Uzun ortak katalog **ölçülmüş zarardır**.
Kısıt mümkün olan her yerde **olumlu** yazılır (+%24 semantik uyum).

## 11 — ÜRETİM YETKİSİ (Mami, 2026-08-07 — pazarlık dışı)

> *"Üretim kısmını sadece sen yapacaksın, şef sensin. Onlar sadece prompt yazacak.
>  MCP sadece sende. Bıraksam sonsuz üretecektin."*

🔴 **KARE BASMA YETKİSİ YALNIZ ANA OTURUMDADIR.** Ajanlar `mcp__magnific__*` çağırmaz.
Ajanın işi **prompt yazmaktır**, basmak değil. Brifingine "bas" yazılmaz.

**Neden — ölçüldü:** 6 basım ajanı paralel koştu, her birinin kendi basım döngüsü vardı ve
**hiçbirinde bütçe yoktu**; toplamı gören kimse yoktu. Diskte 135 görsel birikti ve Mami
sorana kadar sayı ne bende ne ondaydı.

🔴 **BASMADAN ÖNCE RAKAM SÖYLENİR:** *"N kare × 75 kredi = X kredi"* — ve o rakam aşılmaz.
🔴 **HER BASIM ANINDA KAYDA GİRER:**
   `node scripts/is-emri.mjs kaydet "<proje>" --kare N --asama basim --motor nb2
    --cuzdan magnific --kredi 75 --sonuc kabul|red [--kusur <sınıf>]`
🔴 **KİLİT DEĞİŞİRSE ONAY DÜŞER.** Dünya, referans ya da kural değiştiği an yeniden sorulur;
   eski "devam et" yeni dünyada geçmez. Bugün üç kez değişti, üçünde de sorulmadı.
🔴 **CANARY DİSİPLİNİ:** 2 kare → Mami bakar → parti. Bugün iki kez atlandı ve yanlış dünyaya
   27 kare basıldı; canary koşsaydı bedel 2 kare olurdu.
