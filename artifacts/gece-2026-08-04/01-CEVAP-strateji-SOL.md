## 1) TEZİME SALDIRI

Tezinin sonucu doğru, kök-neden cümlesi eksik: **tüketim ciddi darboğazdır; fakat sistem “mükemmel ölçüyor” değildir. Ölçüm, hipotez, yasa, zevk ve sonuç birbirinden ayrılmadığı için tüketemiyor.**

### Haklı olduğun yer

- `APPROVED.md` gerçekten beslenmiyor: 7 dersin tamamı aynı proje ve tarihten; son 20 satır yalnız konumuna göre seçiliyor. Konu, register, motor, kanıt kuvveti veya uygulanabilirlik yok. [APPROVED.md](/Users/Muhammet/Desktop/mamilas-modern/agents/lessons/APPROVED.md:12)
- Onay kuyruğunu küçültme çözümü de denenmiş ve Mami’ye yine rapor üretilmiş: “13 satırlık bütçe” dosyası **461 satır**. Üstelik kendi kapsam bölümünde hiçbir kare/klip açılmadığını ve bazı adayların yanlış hasat verisine dayandığını kabul ediyor. Bu, “107’yi 13’e indirirsek Mami okur” varsayımını fiilen çürütüyor. [ONAY-KUYRUGU-2026-08-03.md](/Users/Muhammet/Desktop/mamilas-modern/agents/lessons/ONAY-KUYRUGU-2026-08-03.md:1), [aynı dosya](/Users/Muhammet/Desktop/mamilas-modern/agents/lessons/ONAY-KUYRUGU-2026-08-03.md:215)
- Dolayısıyla Mami’ye daha iyi hazırlanmış bir okuma listesi sunmak çözüm değil. **Okuma kuyruğunun kendisi emekli olmalı; ders yalnız ilgili karar anında görünmelidir.**
- `slice(-20)` yerine “konusal tavan” ilerleme olur, ama yeterli olmaz. Asıl filtre konu değil **uygulanabilirliktir**: register, dünya, artifact türü, motor, insan yüzü/yazı/motion gibi koşullar. Arşiv sınırsız olabilir; yalnız aktif prompta enjekte edilen paket dar olmalıdır.

### Yanıldığın yer: “sistem mükemmel ölçüyor”

Bugünkü checkout bu iddiayı üç yerden çürütüyor.

Birincisi, “plastik teşhisi hiç tüketilmedi” artık tam doğru değil. Teşhis `prompt-lint`e `islak-goz` adlı SARI kontrol olarak girmiş. Ancak yalnız `wet/dual-point catchlight` ifadesini yakalıyor; teşhisin ikinci yarısını — yüzün motive ışıktan dışlanıp gradyansız ambiyansa bırakılmasını — ölçmüyor. Yani tüketim **sıfır değil, eksik ve indirgemeci**. [prompt-lint.mjs](/Users/Muhammet/Desktop/mamilas-modern/scripts/prompt-lint.mjs:395)

İkincisi, Hücre hasadı “24 kare açıldı” diyor ama aynı satırda 23 kare kimliği var; 16 disk karesinin revize öncesi olduğunu ayrıca kabul ediyor; sonunda güvenilir mihenk kümesini 18 organel karesiyle sınırlıyor. Buna rağmen girişte 33/33 üzerinden sistem hükmü kuruluyor. Prompt sayımı, açılmış piksel ve temiz son sürüm aynı kanıt sınıfı değil. [HASAT-HUCRE-MIHENK-2026-08-04.md](/Users/Muhammet/Desktop/mamilas-modern/agents/lessons/HASAT-HUCRE-MIHENK-2026-08-04.md:3), [aynı dosya](/Users/Muhammet/Desktop/mamilas-modern/agents/lessons/HASAT-HUCRE-MIHENK-2026-08-04.md:302)

Üçüncüsü, linter bazı eşikleri “Üreme 0 revize aldı, altın standarttır” vekil gerçeğine göre kalibre ediyor. Fakat canlı kanon açıkça “sıfır revize kusursuzluk kanıtı değildir” diyor ve kalite tavanını Hücre’ye taşıyor. Ölçüm organı hâlâ eski, prosedürel etiketi görsel kalite etiketi gibi kullanıyor. [prompt-lint.mjs](/Users/Muhammet/Desktop/mamilas-modern/scripts/prompt-lint.mjs:397), [CLAUDE.md](/Users/Muhammet/Desktop/mamilas-modern/CLAUDE.md:116)

Bu nedenle daha doğru cümle şudur:

> MAMILAS çok veri topluyor; fakat kanıtın türünü, kapsamını ve nihai başarıyla ilişkisini güvenilir biçimde etiketlemiyor.

### “Ölçülmüş ders otomatik girsin” otoriteyi aşındırır mı?

**Nereye girdiğine bağlıdır.**

- Kanıt siciline otomatik girmesi otoriteyi aşındırmaz.
- Yazara görünür bir SARI uyarı olarak gelmesi otoriteyi aşındırmaz.
- `APPROVED.md`ye girip “Mami onayı” taşıması sahte onay üretir.
- Promptu sessizce değiştirmesi veya harcamayı hard-block etmesi gizli yönetmenliktir.
- Mami’nin canlı direktifini görmeyen lint kuralı, mevcut “Mami direktifi kazanır” sözleşmesini bozar. Banka bunu default kabul ediyor; `lintFile(path, register)` ise Mami direktifini almıyor. [APPROVED.md](/Users/Muhammet/Desktop/mamilas-modern/agents/lessons/APPROVED.md:16), [prompt-lint.mjs](/Users/Muhammet/Desktop/mamilas-modern/scripts/prompt-lint.mjs:897)

İki sınıf değil, dört epistemik sınıf gerekiyor:

| Sınıf | Otomatik girer mi? | Ne yapabilir? |
|---|---:|---|
| **GÖZLEM** | Evet | Proje/K/hash ve sayımı kaydeder; karar vermez. |
| **HİPOTEZ** | Evet | Scope’lu SARI uyarı olur; karşı-örnek ve süre sonu taşır. |
| **SÖZLEŞME** | Kanıtlanınca | Yerel ve deterministikse KIRMIZI kapı olabilir. |
| **ZEVK / YARATICI DEFAULT** | Hayır | Mami’nin açık carry-forward hükmünü ister. |

Senin “ÖLÇÜLMÜŞ” sınıfın bugün GÖZLEM, HİPOTEZ ve SÖZLEŞME’yi tek torbaya koyuyor. Tehlike orada.

### Kötü bir ders kendini nasıl “ölçülmüş” gösterir?

Somut senaryo: “wet dual-point catchlight plastik ten üretir.”

- Hücre karakter karelerinde 18/20, organel karelerinde 4/33 bulunmuş. Güçlü korelasyon.
- Fakat iki grup aynı sahne sınıfı değil: biri insan yüzü, diğeri organel.
- Önerilen yeni ışık reçetesinin yeniden üretilmiş before/after karesi henüz yok.
- Aynı ifade başka bir korpusta 1/50 bulunuyor.
- Teşhisin kendisi plastiklikte catchlight kadar yüz gradyanı ve terminatör eksikliğini de gösteriyor.

Otomatik sistem yalnız oranı okuyup “bu ifadeyi her yerde yasakla” derse, **bir proje korelasyonunu dünya-geneli sebep yapar**. Daha kötü senaryo, “kavram ışığı her yüze değmelidir” hükmünün arka plan yüzüne, bilinçli siluete veya REAL register’a taşınmasıdır. Ders ölçülmüş görünür; aslında kapsamı ölçülmemiştir.

Başka örnek hazır bankada duruyor: “her okunur şey Türkçe olmalı” Türkiye’deki EDU işi için doğru olabilir; yabancı mekânlı REAL işte hard lint yapılırsa kaynak gerçeğini bozar. Konusal tavan bunu çözmez; register scope’u çözer.

### Tüketim kök neden mi?

Hayır. **Tüketim, tiplenmemiş kanıtın ve eksik kontrol düzleminin semptomudur.**

Bugünkü yapı:

1. HASAT serbest düzyazıyla gözlem üretiyor.
2. APPROVED bütün dersleri global tek satıra indiriyor.
3. Lint aynı dersi yeniden regex olarak kodluyor.
4. Üçü arasında ortak `scope/evidence/counterexample/action/outcome` nesnesi yok.
5. Sonraki gerçek karede kuralın işe yarayıp yaramadığı kayda dönmüyor.

Bu yüzden manuel Mami onayı bugün yalnız otorite koruması değil, aynı zamanda **şemasız sistemin emniyet supabı**. Supabı kaldırıp otomatik promote açarsan debi artar ama zehir de artar.

### Ders → lint nerede yapılamaz?

KIRMIZI lint ancak şu beş şart birlikteyse meşrudur:

1. Özellik girdi metninden yerel olarak karar verilebilir.
2. Kapsam makinece seçilebilir.
3. İhlal ile kusur arasında yalnız korelasyon değil, tekrarlanmış mekanizma vardır.
4. Temiz karşı-örnekler kuralı geçer.
5. Mami’nin canlı istisnası varsa görünür suppression receipt’i taşınır.

Şunlar hard lint olamaz:

- Yazının gerçekten doğru render edilmesi, yüzün doğal görünmesi, kimliğin korunması: **piksel kanıtı** gerekir.
- VO–kare anlamı, kaynak tonu, pedagojik doğruluk, siluetin zararlı ikinci okuması: **ajan/insan semantik gözü** gerekir.
- Sekans sürekliliği, prop kimliği, iki karenin aynılaşması: **çapraz-kare denetimi** gerekir.
- Motion’ın duygusal yayı, klibin gerçekten durarak bitmesi: **gerçek klip** gerekir.
- Kurgu ritmi ve ses dengesi: **tam film + AGY tarifi + Mami hükmü** gerekir.
- “Animasyonun ruhu”, bakmaya değerlik, cesaret, high-end zevk: **pozitif yönetmenlik ve Mami** gerekir.

Lint kusuru önleyebilir; güzelliği kanıtlayamaz. Kendi kapsam listesi de yazı render’ı, fizik gerçeği, VO eşliği ve çapraz-kare aynılığını ölçemediğini kabul ediyor. [prompt-lint.mjs](/Users/Muhammet/Desktop/mamilas-modern/scripts/prompt-lint.mjs:886)

---

## 2) MERDİVEN

### 40 → 60: ÖLÇÜMÜ MÜDAHALEYE ÇEVİR

**(a) Kazanılan yetenek:** Sistem, geçmişte ölçülen ilgili kusuru Mami’ye dosya okutmayıp bir sonraki harcamadan hemen önce doğru promptta görünür müdahaleye çevirebilir.

**(b) En ucuz şey:** `APPROVED.md` yerine değil, onun yanında tek tipli bir ölçüm sicili:

```text
id · sınıf · scope · kötü kanıt · temiz karşı-örnek · müdahale
severity · geçerlilik süresi · son gerçek sonuç
```

Yeni gözlem otomatik olarak `HİPOTEZ/SARI` girer. Yalnız yerel predicate’i ve kötü/temiz fixture’ı olan kural KIRMIZI’ya çıkar. Director bütün bankayı okumaz; aktif prompta uyan en fazla birkaç kayıt preflight sırasında birer satır görünür. Mami hiçbir hasat dosyası açmaz.

**(c) Gerçek kanıt:** Sonraki gerçek projede daha önce bilinen kusurların kaçı render öncesi yüzeye çıktı, kaçı buna rağmen karede tekrarlandı ve kaç kredi kurtuldu sayılır. Basamak ancak:

- bilinen her ilgili kusur render öncesinde görünmüşse,
- temiz karşı-örnekler susmuşsa,
- Mami sıfır ders/hasat raporu okumuşsa,
- eski deterministik kusurlardan kaynaklanan gerçek revize tekrarı sıfıra yaklaşmışsa

geçilmiştir.

**(d) Çöpe atılan:** `HASAT-*`, `CANDIDATES-*` ve 461 satırlık `ONAY-KUYRUGU`nun çalışma kuyruğu olması; `APPROVED.md`nin son 20 global satırla bütün üretim zekâsını taşıması. Dosyalar tarihsel kanıt olarak kalabilir, çalışma yüzeyi olmaktan çıkar.

### 60 → 80: NOT DEFTERİNDEN KANITLI DURUM MAKİNESİNE GEÇ

**(a) Kazanılan yetenek:** Sistem `/clear` ve cihaz değişiminden sonra son kanıtlı kapıyı bulabilir ve dosya varlığını kalite PASS’i sanmadan yalnız meşru sonraki adıma geçebilir.

**(b) En ucuz şey:** İkinci runner değil; mevcut `current-work.mjs` içine tek tipli `gecit/receipt` kavramı. Her receipt:

- beklenen/bulunan sahne kimliklerini,
- dosya hash’ini,
- kullanılan denetleyiciyi,
- `PASS/REJECT`,
- hüküm sahibini,
- önceki kapıyı

taşır.

`phase` elle yazılmaz; en yüksek geçilmiş receipt’ten türetilir. `status` yalnız aktif/bloke/Mami-bekliyor anlamında kalır.

Bugünkü kayıt bunun gereğini doğrudan kanıtlıyor: `phase:"enzim"` iken aynı dosyada 52/52 onaylı kare, motion kusuru ve `MOTION:true` var. [current-work.json](/Users/Muhammet/Desktop/mamilas-modern/artifacts/current-work.json:5) `ilerle --faz` ise hiçbir geçiş önkoşulu olmadan enum’u elle değiştiriyor. [current-work.mjs](/Users/Muhammet/Desktop/mamilas-modern/scripts/current-work.mjs:527)

Doğru mevcut durum şuna benzemeliydi:

```text
phase: motion
motionText: REJECT
frames: 52/52 PASS
motionInventory: 52/52 PRESENT
nextGate: 6-clip canary
```

**(c) Gerçek kanıt:** Bir gerçek proje üç kez `/clear` ve bir Mac↔Windows geçişi yaşar; her açılışta Mami tekrar anlatmadan aynı K’dan devam eder. `52/52 metin + lint PASS + Mami REJECT`, üretime geçemez. Tek imzalı motion dosyası 52 motion sayılmaz. Eski hash’li receipt reddedilir. Basamağın ölçüsü test yeşili değil: **yanlış fazda başlayan oturum sıfır, yeniden yapılan bitmiş iş sıfır, Mami’nin sistemi yeniden brieflendiği an sıfır.**

**(d) Çöpe atılan:** Serbest `phase`, `ilerle --faz`, `MOTION:true` gibi boolean’ların teslim kanıtı sayılması ve `lastCompleted` düzyazısının makine gerçeği olması.

### 80 → 100: ARA ÇIKTIDAN BİTMİŞ FİLM AMAÇ FONKSİYONUNA GEÇ

**(a) Kazanılan yetenek:** Sistem, hangi üretim kararını sonraki projeye taşıyacağını prompt temizliğine değil bitmiş filmin gerçek sonucuna göre seçebilir.

**(b) En ucuz şey:** Her kapanışta yeni rapor değil, tek tam-film receipt’i:

1. AGY filmi baştan sona salt-okur tarif eder.
2. Mami filmi izlerken zaten söylediği doğal cümle son hüküm olarak kaydedilir; beş soruluk röportaj yapılmaz.
3. Sistem yalnız anomalileri K/prompt/motion/kurgu kararına bağlar.
4. Sonraki projeye tek, scope’lu müdahale taşır.
5. Müdahalenin sonraki gerçek filmde tuttuğu veya çürüdüğü işaretlenir.

Bugünkü Project Loot Mami’ye start frame, motion, ses, kurgu ve genel için beş ayrı soru tanımlıyor. Okumayan ve zaten son hükmü veren kişiye yeni form üretmek aynı vergiyi başka adla taşır. [project-loot.mjs](/Users/Muhammet/Desktop/mamilas-modern/scripts/project-loot.mjs:40)

**(c) Gerçek kanıt:** Arka arkaya iki tamamlanmış filmde:

- teslim öncesi tam film gerçekten görülmüş,
- AGY çıktısı açılmadan kalmamış,
- Mami’nin final verdict’i receipt’e bağlanmış,
- müşteri/Mami revizesi kaynak K ve karara izlenebilmiş,
- ilk filmden taşınan müdahalenin ikinci filmdeki gerçek etkisi ölçülmüş

olmalıdır. Nihai ölçü “kaç lint yeşil” değil; **bilinen kusurun filmde tekrar oranı, baştan basılan kare/klip sayısı, müşteri revizesi ve teslim süresi**dir.

**(d) Çöpe atılan:** Prompt dosyası + 52 motion + XML varlığını “iş tamam” saymak; açılmayan AGY raporları; sonuç receipt’i olmayan kalıcı dersler; beş soruluk kapanış röportajı; “sıfır revize = altın standart” vekil gerçeği.

---

## 3) EN CESUR TEŞHİS

**MAMILAS’ın asıl sorunu öğrenme belleği değil; pozitif amaç fonksiyonunun olmaması. Sistem “iyi film” üretmek için değil, ölçülmüş hatalara yakalanmamak için optimize olmuş.**

Bu yüzden ajan şunu öğreniyor:

- dönüşüm risklidir,
- hareket risklidir,
- yeni biçim risklidir,
- gölge risklidir,
- kadraj cesareti risklidir,
- en güvenli çözüm literal nesne + kontrollü ışık + duran kamera + kapalı kuyruktur.

Sonuç, Mami’nin tarif ettiği “çitin içindeki animasyon”dur. Çit fazla olduğu için değil; **çit yönetmenin yerine geçtiği için.**

`PROMPT-YASASI.md` mevcut checkout’ta 83.775 byte, 1.186 satır ve 44 başlık. Sorun uzunluk tek başına değil; fizik sınırı, yaratıcı niyet, geçici deney, bekleyen karar, template ve teslim prosedürü aynı normatif düzlemde. İçeride “geçerli tek rakam 190–215” denirken 13 satır sonra template 210–260 istiyor. [PROMPT-YASASI.md](/Users/Muhammet/Desktop/mamilas-modern/agents/PROMPT-YASASI.md:791), [aynı dosya](/Users/Muhammet/Desktop/mamilas-modern/agents/PROMPT-YASASI.md:805) Aynı yasa kamera kuyruğu değişikliğine “Mami kararı bekleniyor” derken motion-lint değişikliği çoktan kırmızı kurala çevirmiş. [PROMPT-YASASI.md](/Users/Muhammet/Desktop/mamilas-modern/agents/PROMPT-YASASI.md:834), [motion-lint.mjs](/Users/Muhammet/Desktop/mamilas-modern/scripts/motion-lint.mjs:188)

Yani tek kanon görüntüsünün altında en az üç elle senkronlanan kanon var: yasa, skill ve lint. Tüketim açılırsa bu çelişkiler daha hızlı yayılır.

100’e çıkışın özü şudur:

> Çit yalnız son güvenlik kapısı olacak; üretimin ilk sorusu “neyi yasaklıyoruz?” değil, “bu cümleyi yalnız animasyonun yapabileceği hangi olayla görünür kılıyoruz?” olacak.

Fikir/dönüşüm/ölçek/madde pozitif tasarım aşamasında doğar. Lint seçilmiş fikri fizik, kimlik, yazı ve güvenlik kusurlarından korur. Tam film sonucu da hangi pozitif kararın gerçekten çalıştığını öğretir.

---

## 4) 100/100 BİR GÜN

Aşağıdaki gün 50–52 karelik bir EDU videosunun hedef fotoğrafıdır; her Nano Banana ve Kling basımı yine Mami’nin elindedir.

| Saat | Mami ne yapar? | Sistem ne yapar? | Bugünden fark |
|---|---|---|---|
| **08:30** | Masaya oturur; yeniden brief anlatmaz. | `current-work` yalnız şunu söyler: proje, kanıtlı son kapı, tek sonraki harcama, açık risk. | `phase: enzim` gibi bayat etiket yok; serbest metni yorumlama yok. |
| **08:40** | Kaynak/VO için yalnız gerçek yaratıcı kilidi düzeltir veya “devam” der. | Enzim + plan bir ekranlık readback verir: dünya, cast, duygusal rejim, klip ritmi, pozitif animasyon olayı. | Mami beş form doldurmaz; tek gerçek karar görür. |
| **09:00** | İlk altı promptu görür. | Yönetmen önce altı karenin “yalnız animasyonla mümkün” olayını kurar; sonra aktif scope’a uyan ölçülmüş müdahaleleri uygular; lint en sonda korur. | Yasa fikir üretmez; fikri öldürmeden korur. |
| **09:30** | Altı kareyi Nano Banana 2’de **tek tek eliyle basar** ve klasöre atar. | Her basımdan önce bir satırlık preflight vardır. Claude kareleri açar; “4 temiz, K03 ışık düz, K05 siluet çift okunuyor” der ve iki minimal revize hazırlar. | 107 ders okutulmaz; yalnız tetiklenen iki müdahale görünür. |
| **10:15** | İki revizeyi yine eliyle basar; pilot dünyaya ve kaliteye Mami hükmünü verir. | Altı karelik canary receipt’i oluşur. Hipotezler tutuldu/çürüdü diye işaretlenir; hiçbir şey gizlice global yasaya çıkmaz. | 52 kareyi yanlış varsayımla basma riski kesilir. |
| **10:30–13:00** | Kalan sekansları sırayla basar. | Ajanlar sekans bazında yazar; her sekans preflight → Mami basımı → Claude kare denetimi → minimal revize akışından geçer. | Toplu 52 prompt raporu ve sonradan 41 revize yok. |
| **13:00** | Karelere son hükmünü verir. | Receipt `frames 52/52 · Mami PASS · hash …` olur; faz kendiliğinden motion’a geçer. | PNG varlığı ile onay aynı şey sayılmaz. |
| **13:15–16:30** | Onaylı karelerden motion’ları Kling’de **tek tek eliyle basar**. | Motion prompt yalnız görülen kareden yazılır. İlk altı klip canary’dir. Motion-lint metni ölçer; AGY 8–10 klibi sekans halinde salt-okur tarif eder; Mami’ye yalnız gerçek anomaliler gelir. | Lint PASS klip PASS sayılmaz; 52 yanlış motion topluca üretilmez. |
| **16:30** | Bozuk gördüğü birkaç klibi yeniden basar ve final clip verdict’i verir. | Frame + motion text + gerçek klip + Mami hükmü aynı K receipt’inde birleşir. | `MOTION:true` yerine hangi klibin neden geçtiği bilinir. |
| **17:00** | VO’yu alır ve Premiere’i açar. | Sistem gerçek VO sürelerinden XML’i kurar; klipler, VO ve müzik timeline’da hazır gelir. | Kurgu “dosya üretildi” değil, gerçek medyayla kuruludur. |
| **18:00** | İlk tam filmi baştan sona izler. | AGY aynı tam filmi tarif eder; süreklilik, ritim ve ses anomalilerini söyler, hüküm vermez. Sistem yalnız uyuşan somut iki-üç noktayı çıkarır. | 28 rapor birikmez; film ilk kez sistemin öğrenme birimidir. |
| **18:30** | Gerekli rötuşları yapar, son filmi izler ve “teslim” hükmünü verir. | Final receipt kapanır; yalnız gerçekten bitmiş film kanıtı işi `kapandı` yapar. | XML, prompt veya dosya sayısı teslim kanıtı değildir. |
| **19:00** | Müşteriye filmi gönderir. | Kapanış sessizce gözlem çıkarır. Objektif olanlar `GÖZLEM/HİPOTEZ` girer; zevk otomatik taşınmaz. Sonraki projede yalnız ilgili olan müdahale görünür. | Mami akşam ders bankası okumaz; sistem yine de beslenir. |

100/100 burada “hiç hata olmayacak” demek değildir. **Bilinen hata ikinci kez kredi yakmayacak; yeni hata ölçüm, müdahale ve gerçek sonuç arasında kaybolmayacak; Mami’ye yalnız yaratıcı otoritesi ve fiziksel basım kalacak** demektir.

---

## 5) BU GECE YAPILACAK TEK ŞEY

**52 motion’ı yeniden yazma; önce mevcut motion kusuruyla altı kliplik gerçek tüketim canary’si yap.**

Aktif kayıttaki en güçlü fırsat bu: 52 klibin 44’ü durarak bitmiş, 39’u `already` ile açılmış ve çalışan Sürat korpusunda ikisi de 0/14. Bu, plastik-ten dersinden daha hızlı sınanabilir; çünkü sıradaki gerçek iş zaten motion yeniden yazımı. [current-work.json](/Users/Muhammet/Desktop/mamilas-modern/artifacts/current-work.json:7)

Tek gece hamlesi:

1. Bu ölçümü global `APPROVED` ders yapma; `PROVISIONAL · EDU motion · scope: yazısız/organik kareler` olarak görünür müdahale yap.
2. Temsilî yalnız altı motion’ı yeni tarifle yaz.
3. Mami altı klibi Kling’de elle bassın.
4. AGY altısını sekans olarak tarif etsin; Mami PASS/REJECT versin.
5. Altı klip gerçekten akıyorsa kalan 46’ya geç; akmıyorsa 52’yi yakmadan hipotezi düzelt.

Bunun değeri altı motion kurtarmak değil. İlk kez şu zinciri tek gecede kapatır:

> **ölçüm → scope’lu müdahale → harcama öncesi kapı → Mami’nin manuel basımı → gerçek klip → Mami hükmü → sonraki karar**

Bu zincir çalışmadan 107 dersi otomatikleştirmek yalnız daha hızlı kural biriktirir. Bu zincir çalışırsa plastik ten, kaynak tonu, siluet ve sonraki bütün dersler aynı kanaldan güvenle geçebilir.

