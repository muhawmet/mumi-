# MOTION LEHÇESİ — 2026-08-05 · Destek ve Hareket

> Bu dosya **ölçümden doğdu**, tercihten değil. 6 klip basıldı, altısı da kusurluydu;
> altı klibin kareleri çekilip gözle okundu. Aşağıdaki her madde o klipte görülen bir
> kusurun karşılığıdır. Ezberden yazılmış tek satır yoktur.

## ÖLÇÜM — ne görüldü

| klip | VO | karede olan | motorun yaptığı |
|---|---|---|---|
| K4 | "Kukla olduğu yerde **yığıldı**" | kukla **zaten yığılmış** | 5 sn boyunca el titredi, kamera süründü |
| K8 | "Mira kuklayı alıp fen sınıfına **geçti**" | Mira **zaten fen sınıfında** dikiliyor | kız hiç kıpırdamadı → "plastik" okuması |
| K1 | kukla dolapta asılı | asılı kukla | **kukla yürüdü**, eklemleri büküldü, boyu değişti |
| kemik yığını | — | 8 kemik | kemikler **20'ye çoğaldı**, aralarında ışık belirdi |
| uzun kemik | — | masada kemik | kemik **ışığa dönüştü** |
| K7 | "cevap üç kahramanda" | Mira uzanıyor | **kol uzadı**, el eridi, son karede yüz değişti |

**Tek cümle: kliplerin yapacak bir işi yoktu, motor boşluğu kendi uydurdu.
Morphing o uydurmanın kendisidir.**

`already` kelimesi kusur DEĞİLDİR — belirtidir. Motion'ı yazan, kareye dürüstçe bakıp
"bu iş zaten olmuş" demişti. Kelimeyi düzeltmek aynı klibi yeniden bastırır.

---

## YAZIM YASASI

### 1. TEK OLAY — pazarlıksız
Her klip **bir** fiziksel olay taşır: başlar, ilerler, biter; hepsi 5 saniyenin içinde.
Olayın **öznesi karede görünen bir nesne ya da kişidir**. İki olay yazma; ikinci olay
motorun dikkatini böler ve bölünen dikkat morph üretir.

### 2. OLAYIN YERİ — kareyi açmadan yazma
Kareyi Read ile aç. VO cümlesinin anlattığı olay karede **bitmiş mi, önde mi?**

- **ÖNDE** → motion o olayı yapar. Normal hâl.
- **BİTMİŞ** → o olay o kareye yazılamaz. Olmuş bir olay canlandırılamaz. İki çıkış:
  - **(a)** kareden hâlâ yapılabilecek **küçük ama gerçek** bir olay bul — bir nesne
    devrilir ve durur · bir parça sallanıp yerine oturur · bir el bir şeyi bırakır ·
    toz bir ışık çubuğunu geçer ve çıkar. Onu yaz.
  - **(b)** gerçek hiçbir olay kalmadıysa **`🔴 YENİDEN-BASIM`** diye işaretle,
    gerekçeyi tek cümlede yaz, motion'ı yine de (a) mantığıyla yaz ki kare basılana
    kadar elde bir şey olsun.
- **Uydurma olay yazma.** Karede olmayan nesneyi hareket ettirme.

### 3. AÇILIŞ — durağan kareden doğ
`already` · `continues` · `still ...ing` · `mid-swing` · `in progress` ile **açma**.
Klip **duran bir fotoğraftan** başlar, olay ilk yarım saniyede **doğar**.

> Mekanizma: motor "bu hâl sürüyor" diye okuduğunda o hâle **geçmeye** çalışır.
> Geçişin başlangıcı yoktur, o yüzden maddeyi eğip bükerek uydurur. Morph budur.

### 4. KAPANIŞ — olay biter, sahne durur
Son yarım saniyede olay **tamamlanır** ve sahne **durur**. Kuyrukta yeni hareket
başlatma; kesime giden klip hareket hâlinde bitmez.

### 5. KATI NESNE — fiille korunur, yasakla değil
`never bends`, `stays rigid`, `no folding` **yazma**. Ölçüldü: K1'de bu kilit vardı ve
kukla yürüdü. Yasak bir emir değildir; motor **fiil** dinler.

> ✗ `Lock: @kukla stays a rigid solid that never folds or bends at a joint.`
> ✓ `The whole puppet swings from the hook as one piece, shoulder hip and knee holding
>    their exact angles, the shadow behind it sliding with the same shape.`

### 6. MADDE SABİTİ — hareketi tek nesneye kilitle
Sayılabilir nesne varsa **hareket eden tek olanı adlandır**, gerisini yerine bağla:

> ✓ `Only the nearest bone rocks once and settles; the other seven keep their exact
>    places on the cloth.`

Adlandırılmayan kalabalık **çoğalır** — ölçüldü, 8 kemik 20 oldu.

### 7. NESNE IŞIĞA DÖNÜŞMEZ
Bir kemik, kukla ya da eşya parlayarak ışığa dönüşemez. Kavram ışığı yalnız **ayrı bir
öğe** olarak ve açıkça istendiğinde gelir. Ölçüldü: istenmeden ateşledi.

### 8. GENİŞ PLANDA DURAN KARAKTER = PLASTİK
Karakter 5 saniye kıpırdamayacaksa ya kadraj yakındır ya da **olay başka bir nesnededir**.
Geniş planda hareketsiz duran çocuk oyuncak gibi okunur — ölçüldü (K8).

### 9. AĞIZ VE NEFES — fiille
`mouth closed, no lip movement` yasağı tek başına tutmuyor. Yerine:

> ✓ `Her lips stay closed and soft; only her shoulders move as she lets a breath go.`

### 10. BİÇİM
- **Tek paragraf. 90–130 kelime.** Eski set 190–215 kelimeydi; uzunluk motoru dağıtıyor.
- `Camera:` cümlesi **sonda**, tek cümle.
- İngilizce. `@handle`'lar korunur.
- Blok başlığı: `### K<n> | <süre> · VO "<cümle>"` · bloklar `-----` ile ayrılır.
- Olay-bitmiş kareler başlığın altına: `🔴 YENİDEN-BASIM — <tek cümle gerekçe>`

---

## ÇIKTI

Her ajan kendi aralığı için tek `.txt` üretir: `MOTION/S<n>-2026-08-05.txt`
ve dosyanın başına **iki satırlık karne** yazar:
`olay-önde: <n> · olay-bitmiş: <n> · yeniden-basım önerilen: K<..>`

---

# §11 · ENERJİ — cansızlığın panzehiri
> Mami, 2026-08-05, klipleri gördükten sonra: *"Hareketler cılız gibi biraz, biri hiç beğenmedim.
> Biz heyecanlı, çocukların seveceği, kamerası interaktif videolar hedefliyoruz."*

**Kusur bu yasanın §1-§10'undaydı.** Morphing'i kesmek için **en küçük güvenli olay** yazıldı,
üstüne "her şey yerinde kalsın" ve "kamera kilitli" kondu. Morph gitti — **hayat da gitti.**
Çocuk izleyici için bu ölümdür. §11 o çiti söker; fizik çiti yerinde kalır.

## 11.0 AYRIM — bunu karıştırmak iki kusurdan birini doğurur

| DEĞİŞMEZ (fizik — ölçüldü) | TEPKİ VERİR (hayat — zorunlu) |
|---|---|
| nesne **sayısı**, biçimi, kimliği, uzunluğu, malzemesi | saç · kumaş · toz · sıvı · sarkan uçlar · kâğıt |
| kemik çoğalmaz · el uzamaz · kukla erimez · yazı bozulmaz | çarpılan komşu nesne **bir kez sarsılır** · gölge kayar |

🔴 **`keeps its exact place` YAZMAK ARTIK YASAK.** O cümle çoğalmayı durdurdu ama dünyayı
dondurdu. Yerine: nesne **aynı nesne kalır** (`stays the same eight bones`) **ve en az bir
komşu olaya cevap verir.**

## 11.1 OLAY BÜYÜK OLACAK
Ölçüt "en güvenli olay" değil. Soru şu: **"Bu karede fiziksel olarak olabilecek EN BÜYÜK şey ne?"**
Onu yaz. Küçük olay morphing'i önlemez — sadece klibi ölü yapar.

## 11.2 ANİMASYON ZAMANLAMASI — dört zaman, hepsi aynı cümlede
1. **HAZIRLIK** — olayın tersine küçük bir çekiliş/yüklenme
2. **HIZLANMA** — asıl hareket, hızlı
3. **AŞMA** — hedefi bir miktar geçme
4. **OTURMA** — bir-iki sönümlü salınımla yerine gelme

> ✗ `the bone tips over and comes to rest`
> ✓ `the bone leans back a hair, then goes over fast, overshoots past its resting angle,
>    rocks twice shorter and shorter, and settles`

**Cılızlığın tek sebebi budur: doğrudan A'dan B'ye gitmek.** Gerçek kamerada dört zaman yoktur,
animasyonda vardır — ve çocuğun sevdiği şey tam olarak odur.

## 11.3 KAMERA OLAYA KATILIR
Kamera kilidi **ölçülmüş bir kısıt değildir**, ihtiyattı. Ölçülen tek kamera kısıtı:
**karede BÜYÜK baked-in yazı varsa kamera kilitlenir** (Kling yazıyı döndürünce bozuyor).
Onun dışında iten · takip eden · olayla sarsılan · kayan kamera **serbest ve İSTENİR.**
Kamera hareketi morph üretmez — **boşluk üretir.**

## 11.4 ÇARPMA ETKİ BIRAKIR
Bir şey düşer, çarpar, kapanırsa: toz kalkar · komşu nesne bir kez zıplar · gölge sıçrar ·
sıvı bir kez çalkalanır. Bu satır yoksa olay ekranda **olmamış** gibi durur.

⚠ §11, §1-§10'u geçersiz kılmaz. Tek olay · durağan açılış · biten kapanış · katı gövdenin
fiille korunması · madde sabiti **aynen geçerlidir.** §11 onların **içini doldurur.**
Kelime aralığı §11 ile birlikte **110-150**'ye çıkar.

---

# §12 · NEGATİF ÇALIŞIR — kalıp çalışmaz (Mami düzeltmesi, 2026-08-05)

> Mami: *"negatifleri özenle yazdığın senaryoda verdiğin hareketler kolay kolay bozulmuyor."*

**§5'i bu madde düzeltir.** §5 ölçüme dayanıyordu ama ölçümü yanlış okudum: K1'de tutmayan şey
**negatifin kendisi değil**, sahneden kopuk **kalıp `Lock:` satırıydı** — her bloğa aynen
yapıştırılan ezber yasak listesi. Motor o listeyi sahneyle ilişkilendiremiyor.

| ✗ kalıp | ✓ sahneye özel |
|---|---|
| `Lock: @kukla stays a rigid solid that never folds, sags or bends at a joint.` | `the whole puppet swings as one piece, shoulder hip and knee holding their carved angles` **+** `no joint straightens as it swings` |

**Kural:** önce **FİİL** (nesne ne yapıyor), sonra gerekiyorsa **o karede gerçekten olabilecek
tek bozulmaya** yazılmış, somut, sahneye ait **bir** negatif. Liste değil, cümle.

# §13 · KAMERA ANLATICIDIR
> Mami: *"kaliteli kamera anlatıcı, öyle dull sahneler yapma, aptal showa da kaçma."*

Kamera hareket etmek için hareket etmez — **neyi ne zaman gösterdiğine karar verir.**
Amaçsız drift yasak; olayla gelen, bakışı yönlendiren, kadrajı olayın ihtiyacına göre değiştiren
kamera istenir. İki uç da kusurdur: **cansız** (kilitli ve olaysız) ve **aptal show** (sebepsiz
whip, sarsıntı, abartı). Enerji sahnenin **kendi fiziğinden** gelir.

# §14 · HER SAHNEYE GEREKEN PROMPT
Kalıp uygulanmaz. Sakin bir an sakin yazılır, çarpma taşıyan kare sert yazılır. §11.2'nin dört
zamanı her karede **aynı şiddette olmaz** — biçim aynı, dozu sahne belirler.
