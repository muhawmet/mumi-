# KARE BULGULARI — 2026-07-12 · **İLK KARELER ÜRETİLDİ**

> Aylardır ilk kez fabrikanın çıktısı **motora çarptı.** Bu doküman, 9 gerçek kareden öğrendiklerimiz.
> Prompt'lar: `~/Desktop/MAMILAS-PROMPTLAR/` · Ajan-yazımı (`.command` Pass A), site-taslağı değil.

---

## 0. DÜNYA KİLİDİ TUTUYOR — kanıtlı

| kare | dünya | sonuç |
|---|---|---|
| **kurumsal** | corporate real | ✅ gece gece kaldı, marka yok, temiz plaka, amber beacon yerinde |
| **zanaatkâr** | cinematic real | ✅ çekiç faseti, aşınmış önlük, gerçek bakır, altın saat — malzeme doğruluğu |
| **hemzemin** | `shinkai_photoreal_anime` | ✅✅ **en zor dünya**: düz cel kız + foto-gerçek hemzemin geçit. *"Tek karede iki kayıt, aradaki uçurum üsluptur"* — birebir |
| **fotosentez + insan** | `pixar_3d_edu` | ✅ tartışmasız Pixar: subsurface kulak, appeal silüeti, sıcak bounce |
| **one piece (kadrosuz)** | `one_piece_toei` | ❌ figürsüz manzara → manga illüstrasyonu |
| **one piece (okul sınıfı)** | `one_piece_toei` | ❌ **PROP SIZINTISI** (aşağı bak) |

### ⚠️ ÖĞRENİLEN ÖLÇÜM DERSİ
**Fotosentez'i önce "dünya kilidi kaydı" diye raporladım — YANLIŞTI.** Makro yaprakla Pixar'ı foto-gerçekten ayırt edemezsin. **Mami düzeltti: "aynı promptu insanla ver, anlaşılır."** İnsanlı kare geldi → tartışmasız Pixar.
**KURAL: bir dünyanın kilidini FİGÜRSÜZ kareyle test etme.** İnsan, üslubun turnusol kâğıdıdır.

---

## 1. A/B DENEYİ — **RENDER LOCK KAZANDI, HİPOTEZİM YANLIŞTI**

Aynı sahne (gece vardiyası fabrika), tek fark 652 kelimelik render lock:

| | sonuç |
|---|---|
| **A1 — TAM (1250 kelime)** | ✅ derinlik (arkada ikinci hat sönüyor), eller parçanın üstünde, amber beacon duruyor, yüz konsantre, **prompt'un dediği anın ta kendisi** |
| **A2 — İNCE (598 kelime, render lock sökülmüş)** | ❌ daha aydınlık/geniş, adam parçayı *yerleştiriyor* (kaldırmadan yarım saniye önce DEĞİL), derinlik yassı, **stok fotoğrafa kayıyor** |

**Render lock sökülmeyecek.** (n=1, farklı seed — ama fark ince değil.)

---

## 2. ⚡ ASIL BULGU — **FİZİK TAŞINIR, PROP SIZAR**

One Piece karesine, **kimsenin istemediği** korsan gemisi ve "WANTED" afişleri girdi. Yanardağda jeoloji dersi verilirken.

**Ajanın kurduğu sahnede yoklar.** Sahne aslında İYİYDİ:
> *"Öğretmen merkez ekseni, tek kocaman eli sırta doğru açılıyor. Solda gözlüklü öğrenci, sağda defterli öğrenci, üçüncü öğrenci kayaya çömelmiş — **eli sert taşa dokunmadan yarım saniye önce**. Düz 2-değerli cel, 3-5px düzgün saf-siyah kontur."*

**Gemi ve afişler DÜNYANIN `render_law`'INDAN geldi:**
> `one_piece_toei.render_law`: *"Invented fictional signage — **wanted-poster paper, pennants, caravel-hybrid timber hull with carved figurehead**..."*

Bu cümle dünyanın **kelime dağarcığını** tarif ediyor ("bu dünyada ne tür nesne bulunur"). **Motor onu bu karenin içindekiler listesi sandı.**

### YASA
> **Render law FİZİKTEN yapılmışsa güvenle taşınır. PROP'tan yapılmışsa kareye sızar.**

- **Kurumsal render lock** = ışık kaynağı, yansıma açısı, lens davranışı, grade → **fizik** → kareye mobilya sokmaz → **A/B'yi kazandı**
- **One Piece render lock** = wanted afişi, flama, oymalı pruva → **prop** → motora sessizce "bunları koy" der → **kareyi mahvetti**

**Bu, daha önce kapattığımız kusurun BAŞKA KATMANI.** Kompozisyon kalıplarının kendi mobilyasını taşımasını (kapı eşiği · çatı kenarı · sis bandı) engellemiştik. **Dünyanın kendi `render_law`'ı hâlâ mobilya taşıyor.**

### AÇIK İŞ (sıradaki turun ilk işi)
1. **46 dünyanın `render_law`'ını tara**: hangi cümleler PROP/NESNE listesi, hangileri FİZİK?
2. Prop listeleri **kelime dağarcığı** olarak işaretlensin, **kadro emri değil** — dünyanın örnek öznesi için (*"a veteran's salute"*) zaten yaptığımız şeyin aynısı.
3. **ÖNCE ÖLÇ:** kaç dünya prop taşıyor? Uydurma fix yasak.
4. **KÜTÜPHANEYİ BUNDAN ÖNCE GENİŞLETME** — kusurlu şablonu 10 yeni dünyaya kopyalarsın.

---

## 3. G2 DENEYİ — **PROP FIX ÇALIŞTI, PALET EMRİ FAZLA KISITLAYICI ÇIKTI**

`G2-onepiece-USLUP-ONCE.txt`: üslup grameri ilk 120 kelimeye alındı, prop'lar render lock'tan söküldü, negatife açıkça yasaklandı.

**Sonuç:**
- ✅ Korsan gemisi **gitti**, wanted afişleri **gitti** → **prop teşhisi doğru, fix işe yarıyor**
- ✅ Düz 2-değerli cel **geldi**, sert basamak **geldi**, düzgün kalın siyah kontur **geldi**
- ❌ **YENİ KUSUR (benim yazdığım cümlenin suçu):** palet satırı (*"marine-blue shadow, primary-yellow mid, primary-red accent"*) motor tarafından **duotone** okundu — her şey sarı-mavi. One Piece'in gürültülü çok-renkli doygunluğu yok.

**Ders:** palet emri **kısıtlayıcı liste** değil, **doygunluk/kontrast rejimi** olarak yazılmalı.

---

## 4. AÇIK SORU — İSİM OLMADAN ÜSLUP TUTAR MI?

**Mami'nin itirazı (haklı):** *"telifli yazsaydın istediğimizi çıkarırdı — 'like One Piece' derdin."*
Doğru: marka adı, üslubun sıkıştırılmış hali. 916 kelimemiz o iki kelimenin yaptığını yapamadı.

**Ama kullanılamaz:** bu kareler müşteri reklamına gidiyor. **Firewall EXPORT'u korur** — Mami kendi elinde, kendi aracında ne yazarsa yazar, site o adı asla basmaz.

**Kontrol testi çıkarıldı:** `G3-KONTROL-isimli.txt` — **ölçü aleti, teslimat değil.** Amacı: aradaki farkın ne kadarı *isim*, ne kadarı *bizim gramerimiz*? Fark ölçülürse **gramere çevrilir** — isim gönderilmeden.

### ⚡⚡ G3 SONUCU — **İSİM KURTARMADI. EKSİK OLAN İSİM DEĞİL.**

`G3-KONTROL-isimli.txt` üretildi — prompt'ta açıkça *"Official One Piece TV anime production still, Toei Animation. Exact One Piece anime art style."* yazıyordu.
**Kare YİNE One Piece olmadı.** Batı çizgi-romanı, mat, **plastik**. (Mami: *"zorla 2D plastik yapıyor"*)

**Bu bir HEDİYE:** demek ki tavan yok, ve marka adı eksik parça DEĞİL. **Prompt'umuzun içinde motoru One Piece'ten AKTİF OLARAK UZAKLAŞTIRAN bir şey var.**

### HİPOTEZ (sıradaki turda ÖLÇÜLECEK — uydurma fix yasak)
**Dünyanın yasası KARAKTER cel kurallarını TÜM KAREYE uyguluyor.**

`one_piece_toei.render_law` → *"Flat 2-value cel... NO gradient. NO airbrush. NO soft shading."*

Ama gerçek One Piece anime'sinde **arka planlar BOYALIDIR** — gökyüzü airbrush, bulutlar dereceli, deniz gradyanlı. Düz-cel + kalın kontur **yalnızca FİGÜRE** aittir. Biz onu tüm kareye dayatınca motor **"vektör illüstrasyon"** moduna giriyor → **plastik.**

Kanıt: `shinkai_photoreal_anime` dünyası **tam da bu ayrımı yaptığı için** birebir tuttu (*"sade cel karakter, foto-gerçek arka plan — aradaki UÇURUM üsluptur"*). One Piece dünyasında o ayrım YOK.

**SIRADAKİ TURDA:**
1. Kaç dünyanın `render_law`'ı figür-kuralını arka plana da dayatıyor? **ÖLÇ.**
2. `one_piece_toei` için: cel disiplini → FİGÜR · boyalı/dereceli disiplin → ARKA PLAN. Ayrımı yasaya yaz.
3. Aynı sahneyi tekrar üret, ölç. **Kare olmadan kapatma.**

---

## 5. HÂLÂ AÇIK (Mami'nin gözünde)
- Işık monotonluğu: `ghibli_hayao` 14 beat'te **5 farklı ışık** (mod-3 döngü). Ölçüldü, kablolanmadı.
- Motor, "düz 2-değerli cel" emrini kısmen dinliyor — prop söküldükten SONRA daha iyi dinledi. Prop fix'i bittikten sonra tekrar ölç.

---

## 6. ÖLÇÜM (2026-07-12, salt-okur tarama · 46 dünya)

### PROP SIZINTISI — DOĞRULANDI, ama asıl sinyal **PROP:FİZİK ORANI**

**19/46 dünya** `render_law`'ında 3+ somut nesne adı taşıyor. Ama prop sayısı **tek başına zararsız** — fizik onu dengeliyorsa güvenle taşınıyor (kurumsal A/B'yi bu yüzden kazandı).

| dünya | prop | fizik | okuma |
|---|---|---|---|
| **`one_piece_toei`** | 5 | **2** | ⚠️ **en kötü oran** — yasa nesneden ibaret |
| **`synthwave_retro_80s`** | 3 | **0** | ⚠️ **sıfır fizik** — saf mobilya listesi |
| `automotive_hero_real` | 8 | 8 | Tesla dünyası — çok prop, ama fizik güçlü |
| `civic_promo_real` | 5 | 11 | fizik-baskın, güvenli |
| `deakins_naturalist` | 3 | 12 | fizik-baskın, güvenli |

> **YASA:** fizik yoksa motor prop listesini **alışveriş listesi** sanır.
> **Riskli iki dünya: `one_piece_toei` (5:2) ve `synthwave_retro_80s` (3:0).**

### FİGÜR-KURALI HİPOTEZİ — **DOĞRULANMADI (ve çürütülmedi de)**

Kaba keyword taraması: düz-cel emri olan **5 dünyanın hepsi** arka plan/gökyüzü kelimesini içeriyor — `one_piece_toei` zaten *"hand-brush-painted cumulus"* diyor. **Yani hipotez keyword sayımıyla kanıtlanmadı.**

**AMA ALET ÇOK KABA.** "Gökyüzü" kelimesinin geçmesi, *"NO gradient / NO airbrush"* emrinin gökyüzünü muaf tuttuğu anlamına gelmez.

⚠️ **Bu tam olarak bu turda ÜÇ KEZ düştüğüm tuzak: kendi ölçü aletimin körlüğünü gerçek kusur sanmak.** (evaluateDirectorCabinet'i dizi yerine nesne sandım · fotosentez'i figürsüz kareyle test ettim · şimdi bu.)

**DÜRÜST SONUÇ: plastik sorununun sebebi HÂLÂ BİLİNMİYOR.** Keyword sayımı bunu çözemez.
**Sıradaki tur:** `one_piece_toei` yasasını **GÖZLE oku**, hipotezi **KAREYLE** sına. Sayımla kapatma.
