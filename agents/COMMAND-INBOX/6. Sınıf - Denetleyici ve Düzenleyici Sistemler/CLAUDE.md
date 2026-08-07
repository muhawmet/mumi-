---
proje: 6. Sınıf - Denetleyici ve Düzenleyici Sistemler
kaynak: agents/COMMAND-INBOX/Bekleyen/6.sınıf denetleyici ve düzenleyici sistemler video senaryosu.docx
# Ölçüldü 2026-08-07 (607 kelimelik kaynakta):
#   sinir 12 · orkestra 7 · hormon 5 · elektrik 3 · nöron 1 · maket 1 · bisiklet 1 · damar 1 · lunapark 1
# Aynı kaynakta: mutfak 0 · soba 0 — önceki turun 56 karelik dünyası buydu ve çöktü.
dunya: [orkestra, sinir, hormon, elektrik, nöron, maket, bisiklet, damar, lunapark]
canary: GECTI          # 4 demo karesi Mami onayı aldı (commit 3a3d539a)
butce: { onayli: 4200, birim: 75 }
uretim_yetkisi: ana-oturum
---

# Denetleyici ve Düzenleyici Sistemler — VİDEO BEYNİ

Kilitlerin tam metni burada çoğaltılmaz, çağrılır:

@Denetleyici ve Düzenleyici_ENZIM.md

## ÜRETİM ZİNCİRİ — Mami'nin kuralı, üç adım, atlanamaz

**Ajan YAZAR → sen KONTROL EDERSİN → sen BASARSIN.**

🔴 **BASAN SENSİN. Ajan değil, MAMİ DE DEĞİL.** (Mami, 2026-08-07: *"sen basacaksın, ajan
değil sen, ben de değil."*) Mami'nin işi **hüküm**: canary onayı, kare kalitesinin son sözü,
zevk ve ton kararı. Ona "şunu basar mısın" denmez, "şuna bakar mısın" denir. Ortadaki adım bir formalite değil,
zincirin sebebidir: ajan orkestratörün körlüğünü miras alır ve altı mükemmel ajan yanlış
dünyada altı mükemmel yanlış üretir. Ajanın getirdiği hiçbir prompt **okunmadan** motora
gitmez — kaynak dünyası, `@handle` çağrısı (tarif değil), kadraj kütlesi, negatifin sahneye
özel olması ve yazı yokluğu tek tek görülür.

Üçüncü adım kodla zorlanıyor: `harcama-kapisi.mjs` girdide `agent_id` görünce üretim
çağrısını reddeder. Canlı ölçüldü 2026-08-07: ajanın `images_generate` çağrısı `[AJAN]`
koduyla bloke edildi, ana oturumunki açık geçti, kredi değişmedi.

## KİLİT BAŞLIKLARI — yeni oturumun yanlış yapamayacağı üç şey

- **Tek mekân YOK; mekân kavramı takip eder ve her sekansın mekânı kaynaktan gelir.**
  S1/S7 konser salonu · S2 bedenin içi · S3 nöron dünyası · S4 maket masası + denge anı ·
  S5 gerçek anlar (çaydanlık) · S6 kan dolaşımı + lunapark.
  Süreklilik mekândan değil **Mira'dan, ışık rejiminden ve paletten** gelir.
- **`references` alanına YALNIZ `@mira` geçer.** Mekân/nesne plakası kareyi eziyor —
  27 kare basılarak ölçüldü; motor geometriyi değil bütün kompozisyonu kopyalıyor.
  Mekân sürekliliği **yazıyla** taşınır; plaka ajanın gözü içindir.
- **`@handle` çağrılır, tarif edilmez.** Yaş, yüz, saç, ten, göz, gardırop, milliyet
  yazılmaz — metinde yalnız `the girl` / `she`. Bu tur tam buradan kırılmıştı.

## DURUM — 2026-08-07 akşamı, Mami'nin hükmü: BAŞTAN KURULUYOR

🔴 **Mami: *"Baştan kur ama orkestra kalsın. Mahvet o videoyu, orkestra güzel, show yap."***

**KALAN — dokunulmaz, yeniden yazılmaz:**
- `images/1.png` … `images/8.png` = **K01-K08, SEKANS 1 (konser salonu).** Sekizi de gözle
  denetlendi ve onaylandı. Üçü şaheser: **K05** (şefin yakın planı — nota lambası pratiği,
  sert yan key, ten dokusu, ön düzlemde odak dışı tuba), **K04** (şef arkadan, ışık huzmesi,
  ön düzlemde odak dışı yay), **K08** (tepeden, ön düzlemde sahne feneri, eşmerkezli yaylar,
  uzun paralel gölgeler).
- **S1'in dünyası ve ışık rejimi** yeni setin TABANIDIR: bal rengi ahşap sahne, koyu kırmızı
  perde, yaldızlı localar, indigo seyirci karanlığı, sahne solundan tek sert beyaz-altın key.
  S7 (kapanış) aynı salondur.

**ORTAK YAN — bu sekiz karenin neden tuttuğu (yeni set bunu taşır):**
1. Dünya kaynaktan geldi (`orkestra` kaynakta 7 kez).
2. **Referans YOK** — motor karakteri sahnenin kendi ışığında icat etti.
3. Ön düzlemde odak dışı somut kütle (piyano kapağı · yay · tuba · fener · kontrbas).
4. Tek yönlü sert key + modelleme gölgesi; düz dolgu yok.
5. Kadrajda çok sayıda canlı şey; kimse poz vermiyor, herkes iş yapıyor.
6. Ekranda yazı yok, etiket yok, ok yok.

**YENİDEN KURULACAK:** K09-K66 (S2-S7). Eski prompt'lar (`PROMPTLAR/S2..S7.txt`) ve
`images/9.png`+ **kıstas değildir** — reddedilenlerin kanıtı `images/mami-bak/` altında
(plaka klonu · İngilizce etiketli beyin · gövdesiz karakter · karakter künye sayfası).

**ÖNCE ONARILACAK — tek kare üretimden önce:**

1. ✅ **YAPILDI 2026-08-07 — `@mira` plakası sahne rejiminde yeniden basıldı.** 2 varyant,
   150 kredi, `imagen-nano-banana-2-flash`, referans eski plaka (`1lLXJFpr4r`), 1:1.
   Kurulan: `elements/mira.png` = **varyant B** (kimlik korundu · çilli ten + subsurface ·
   fleece nap ve denim twill okunuyor · soldan yönlü key · ışıklı fon, beyaz boşluk yok ·
   bel üstü 3/4, tam-boy poz plakası DEĞİL). Eski düz plaka `mira-DUZ-ISIK-ARSIV.png`.
   Varyant A reddedildi: ışığı daha sert ama **çenedeki gölge sakal okuyor** —
   `images/mami-bak/PLAKA-A-cenede-golge-sakal-okuyor.png`.
   ⏳ Mami'nin son hükmü bekleniyor.

2. 🔴 **ÖLÇÜLDÜ 2026-08-07 — "17/56 cümlenin karesi yok" YANLIŞ SORU.**
   Sayaç aritmetikte haklı, **dosyada yanlış**: `_SESLENDIRME.txt` ve
   `_SESLENDIRME-TEK-BLOK.txt` hâlâ **MUTFAK VO'su** (56 cümle). Canlı metin
   `_SENARYO.txt` (66 cümle, orkestra dünyası, kaynaktan türetilmiş, commit `f3f79d87`).
   O commit iki VO dosyasında **yalnız 2 satır** değiştirdi — gövde taşınmadı.
   **Kanıt:** VO cümle 1 = *"Mira kış sabahı mutfağın kapısında durdu."*
   Onaylı K01 ise konser salonu. Yani 17 kare eksik değil — **teslim setindeki VO,
   silinmiş bir dünyayı anlatıyor.** ElevenLabs'a bu dosya giderse film orkestra
   karelerinin üstüne mutfak anlatır.
   ⚠ İkinci kusur: `_SENARYO.txt` başlığı *"Kare: 54 · ~4:20"* diyor, gövdesi **66 cümle**
   sayıyor, dipnotu *"66 cümle ~4:40"* diyor. Kare sayısı kilitlenmeden iş emri kurulamaz
   (`is-emri` hâlâ 56'lık eski planda).
   **Bloke:** `_SENARYO.txt` dipnotu *"MAMİ ONAYINA SUNULDU — onaysız tek kare yazılmaz"*
   diyor ve üç soru açık. Onay gelmeden K09+ yazılmaz.

## MAMİ KARARLARI

- 2026-08-07 — "üretim kısmını sadece sen yapacaksın, şef sensin, onlar sadece prompt
  yazacak; MCP sadece sende. Bıraksam sonsuz üretecektin."
- 2026-08-07 — "zengin bir hayat, fakir değil, özel okullara yapıyoruz devlete değil."
- 2026-08-07 — kahraman `@efe` değil **`@mira`**; önceki turun 56 karesi bu yüzden geçersiz.
- 2026-08-07 — "usage çok hızlı eridi, paralel işte dayanmadı; birer videolar yapmak lazım."
- 2026-08-07 — "Baştan kur ama orkestra kalsın. Mahvet o videoyu, orkestra güzel, show yap."
- 2026-08-07 — K05 için: "bi adam vardı direkt pixar" · K07 için: "sağdaki plastik değil mi,
  Mira'yı yanlış tasarladık." Tavan artık K05'tir.

## BU VİDEODA ÖĞRENİLENLER

- 2026-08-07 🔴 **REFERANS KİMLİĞİ DİSKTEKİ DOSYAYI DEĞİL, MOTORDAKİ CREATION'I GÖSTERİR.**
  Plaka sahne rejiminde yeniden basıldı ve `elements/mira.png` olarak kuruldu — ama
  prompt'lardaki `references` hâlâ **eski düz plakanın** creation kimliğini taşıyordu.
  Yani 150 kredilik onarım motora **hiç gitmedi**; K09/K25'in güzelliği yeni plakadan
  değil **sahne yazımından** geliyordu. Doğru kimlik artık `UPOqovywny` (yeni ışıklı
  bel-üstü plaka); `1lLXJFpr4r` ölü. **Kural: plakayı yeniden basmak yetmez, kimliği de
  değiştir — yoksa onarım sessizce hiç olmamış sayılır.**

- 2026-08-07 🔴 **`@mira` + AYDINLIK İÇ MEKÂN = motor "sıcak, düz ışıklı, antika" moduna
  kaçıyor.** K09 tuttu çünkü mekân KARANLIKTI (salon). K22/K25 ilk turda düştü çünkü
  "geç öğleden sonra çalışma odası" yazılmıştı: motor pirinç mikroskop, botanik gravür,
  cam balon, küre getirdi ve **açık kitaplara ders kitabı diyagramı bastı.**
  Onarım: mekân **çoğunlukla karanlık** yazılır, TEK sert huzme bir bant çizer, bandın
  dışı doygun indigodur, masa **boştur**. İkisi de o cümleyle ilk denemede döndü.

- 2026-08-07 🔴 **NEGATİFTE ADLANDIRMAK ÇAĞIRIYOR — ve bunu BEN yaptım.** K22 tur2'de
  negatife *"no open book, printed page or illustrated plate · no antique brass
  instruments or framed botanical prints"* yazdım. Motor **İngilizce etiketli anatomi
  diyagramı** bastı (CEREBRUM · MEDULLA · THORACIC NERVES, çağrı çizgileriyle) —
  yani tur2'yi öldüren kusurun birebir aynısı, negatif tarafından çağrılmış.
  Kısıt **olumlu** yazılır: *"the walls stay completely bare; the desk surface stays bare."*

- 2026-08-07 🔴 **REFERANS KARESİNDE ÖZNENİN YÜZÜ KADRAJ DIŞI/ODAK DIŞIYSA MOTOR SAHNEYİ
  ATLAYIP PLAKAYI İTHAL EDİYOR.** K22 tur3'te "omuz ön düzlemde, yüz kadraj dışı" yazıldı;
  çıkan kare beyaz fonda **tam boy stüdyo pozuydu** — sahne yok. Referans karesinde yüz
  görünür ve ışıkta olmalı; kadraj kilidi ancak o zaman tutuyor.

- 2026-08-07 ✅ **"Çocuk maketi sunuyor" kadrajı motorun eğitim-posteri önyargısını
  tetikliyor.** Çözüm negatif değil **kadraj**: maket sunulmaz, kız ona BAKAR — üç çeyrek
  arkadan, elleri kaidede, yüzü ışığın kenarında. K22 tur4 böyle geçti.

- 2026-08-07 🔴 **KARAKTER PLAKASI KİMLİĞİ TAŞIYOR AMA IŞIK REJİMİNİ DE TAŞIYOR.**
  Mami: *"sağdaki plastik değil mi, soldaki direkt filmden."* Ölçüldü: K05 (şef, **referanssız**)
  sahnenin kendi ışığında doğdu — nota lambası pratiği, sert yan key, modelleme gölgesi, ten
  dokusu, ön düzlemde odak dışı tuba. K07 (Mira, **`@mira` referanslı**) plastik.
  Sebep `elements/mira.png`: beyaz fonda **düz aydınlatılmış stüdyo plakası** — yön veren key
  yok, gölge yok, ten tek tonda, kumaş mat. Motor bunu kareye taşıyor.
  **Onarım plakada, prompt'ta değil:** plaka sahne rejiminde yeniden basılır (tek yönlü sert
  key + modelleme gölgesi + ten dokusu + ışıklı nötr fon). Tek kare (~75 kredi) 11 Mira
  karesini birden düzeltir.

- 2026-08-07 ❌ Kaynakta 0 kez geçen mekâna (mutfak) 56 kare yazıldı; motor sonunda pes edip
  ders kitabı diyagramı bastı — etiketli oklar, İngilizce yazı, çocuk yok. 27 kare çöpe.
- 2026-08-07 ✅ Dünya kaynaktan türetilince (orkestra / nöron) ilk 3 kare onay aldı.
  Değişen tek şey dünyanın nereden geldiğiydi.
- 2026-08-07 ❌ Negatifte bir nesneyi adlandırmak o nesneyi ÇAĞIRIYOR ("no phone" → eline
  broşür verdi). Kelime metinden tamamen çıkarılıp olumlu cümle konunca ilk denemede temiz.
- 2026-08-07 ❌ Kadraj kilidi cümleyle tutmuyor; ön düzlemde odak dışı somut bir kütleyle
  tutuyor. Aksi hâlde referansın stüdyo tam-boy plakası birebir ithal oluyor.

## AÇIK KARARLAR — Mami'ye soruldu, körleme yapılmadı

1. `prompt-lint`'in iki kuralı hiç yeşil yanamıyor (üç ajan bağımsız ölçtü): `AYRICALIK`/
   `YÜKÜM` `\S{12,}` istiyor — doğal Türkçe cümle geçmiyor; insan dedektörü Türkçe gövdeye
   karşı korumasız ("adlandırmanın" içindeki "man"). Onarım tek satır ama kod donmuş fazda.
2. K56'da duvar saati bilerek odak dışında — okunur ikinci bir saat ya aynayı ya demlenmiş
   çayı yalanlar.
3. `_REFERANSLAR.txt` `@mira`'yı 13 karede listeliyor, kota 11 — envanter yeniden numaralanmalı.
