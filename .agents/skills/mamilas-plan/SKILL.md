---
name: mamilas-plan
description: Bir video üretilmeden ÖNCE şeklini kilitler — VO'nun kaç klibe bölüneceği, kesim ritmi, nerede nefes, nerede duygu tepesi, toplam süre, riskli klipler. "plan / plan modu / şekil / kaç klip / ritim / kurgu tasarımı / bu videoyu nasıl kuralım / yeni video başlıyoruz" dendiğinde ve HER yeni video başlarken, prompt yazılmadan önce çalıştır. Enzim NE'yi kilitler (dünya, cast, omurga, ışık); bu skill ŞEKLİ kilitler.
---

# MAMILAS — PLAN MODU

> **Bu skill iki ölçülmüş kazadan doğdu.**
> **(1) Bileşke Kuvvet v1** — 69 VO cümlesi 52 klibe sıkıştırıldı, 11 klip 10 saniyeyi aştı,
> en uzunu 14.9s; Kling o boşluğu drift ve warp'la doldurdu. Mami'nin hükmü: *"iğrenç
> animasyonlar."* Kusur prompt'ta değildi, **o tablodaydı.**
> **(2) Mami, 2026-08-03:** *"kurgu da çok basic."* 53 klibin 53'ü 5 saniye, her kesim aynı
> yere düşüyor. Metronomla kurgu olmaz. Bu da prompt kusuru değil, **şekil kusuru.**
>
> İkisinin ortak dersi: **kurgu, kare yazılmadan önce tasarlanır.** Sonra tasarlanamaz —
> çünkü klipler zaten yanmıştır.

## 0. PLAN DÜNYA ÜZERİNE KURULUR — video üzerine değil (Mami, 2026-08-04)

Mami: *"planı dünya üzerine kur."* Bu bir düzen tercihi değil, **o gün ölçülen bir kusurun
cevabı.**

**KANIT — 2026-08-04, 233 kare tek günde revize edildi ve kusurların HİÇBİRİ karede değildi:**
- `@fensinif` referansının kendi metninde şu yazıyordu: *"the room is **deliberately cool and
  green** so that the lesson's single warm-amber concept light is the only warm event."*
  52 karenin 38'i o odadaydı. Müşteri *"neden ucuz gariban işi takılıyorsun"* dedi, Mami
  *"Fern'ün uyuşturucu baronu videolarına döndü, karanlıkta"* dedi. **İkisi de tek bir referans
  cümlesinden geliyordu.**
- `"reaches nothing else / stays in unlit deep indigo"` kalıbı dört projede **123 kez** vardı —
  kimse yazmaya karar vermedi, ilk kareden kopyalana kopyalana dünyanın kuralı oldu.
- Yoksulluk sözlüğü (`worn linoleum` · `murky water` · `paint-crusted pine`) STYLE'ın malzeme
  cümlesinde yaşıyordu, yani **her karede**.

🔴 **Ders: dünyanın kuralları hiçbir yerde tek parça yazılı değildi.** 233 karenin içine dağılmış
ve bir daha okunmayan bir referansın içine gömülmüştü. Kare kare bakan hiç kimse göremez.

**Bu yüzden plan modunun İLK çıktısı şekil değil, DÜNYA KARTIDIR.**

### Dünya kartı — `agents/worlds/<worldId>.md`, tek sayfa, videolar arası KALICI

```
# <worldId> — DÜNYA KARTI
son güncelleme: <tarih> · kullanan videolar: <liste>

IŞIK REJİMİ      kaynak nerede · kadrajda görünür mü · partikül var mı · genel pozlama
                 (§4c: kaynak görünür · ışık nesne gibi görünür · partikül zorunlu)
MALZEME REJİMİ   hangi malzemeler · hangi yasak (§4b: kullanım izi kalır, yoksulluk izi gider)
SOSYOEKONOMİK    kim bu okulun/evin sahibi — "parası olan ailenin çocuğu" mu, devlet mi
PALET            hangi renk nerede · neyin RENGİ değil neyin IŞIĞI
IŞIYAN vs IŞIK ALAN   kavram ışığı neyle ayrışıyor (yalnızlıkla mı, kendi ışığını yaymakla mı)
ATMOSFER         havada ne var: toz, buhar, polen, kar
DUYGUSAL REJİM   kaynağın tonu (§5ø) — çatışmalı mı, pozitif mi
NEGATİF          bu dünyada asla olmayan şey
```

**Kural: dünya kartı yoksa plan başlamaz.** Kart varsa ve video aynı dünyadaysa **yeniden
yazılmaz, okunur** — o kart aynı dünyadaki bütün videoların ortak sözleşmesidir.

⚠ **Kartla referans çelişirse KART kazanır** ve referans yeniden basılır. 2026-08-04'te tam
tersi oldu: referans sessizce kanun kesildi ve 233 kareyi karanlıkta bıraktı.

**Sınama, kare yazılmadan önce:** *"Bu dünyada güneşin nereden girdiğini gösterebilir miyim,
havada bir şey uçuşuyor mu, ve buradaki eşyanın sahibi kim?"* Üçüne de cevap yoksa kart eksik.

---

## SIRA — plan nereye oturur

```
konu / command JSON
      ↓
SESLENDİRME METNİ            (cümleler yazılır)
      ↓
🌍 DÜNYA KARTI  ←── ÖNCE     (ışık · malzeme · palet · atmosfer · rejim — VİDEOLAR ARASI KALICI)
      ↓
🔵 PLAN MODU                 (şekil kilitlenir · MAMİ ONAYLAR)
      ↓
ENZİM                        (cast · omurga · kavram ışığı — dünyaya özel olmayanlar)
      ↓
REFERANS ENVANTERİ           (§4a — tekrar eden her şey · KARTA UYGUNLUK DENETLENİR)
      ↓
dünya-kilidi.mjs → PROMPT'LAR → kareler → motion → kaba kurgu
```

**Enzim'le sınır nettir ve karıştırılmaz:** ENZİM **NE** olacağını kilitler (hangi dünya, kim,
hikâye omurgası, kavram ışığı). PLAN **ŞEKLİ** kilitler (kaç klip, hangi uzunluk, hangi ritim,
nerede nefes, nerede duygu tepesi). Aynı toplantıda yapılabilirler ama **ayrı kararlardır** ve
ayrı dosyaya yazılırlar.

---

## 1. VO → KLİP HARİTASI — "bir cümle bir klip" bir varsayılan, bir yasa değil

Kural şu an *bir cümle = bir klip*. Bu Bileşke v1'in sıkıştırma kazasından sonra **doğru bir
düzeltmeydi** ama tek başına metronom üretiyor. Plan modunda her cümle üç kovadan birine girer:

| kova | ne zaman | klip süresi |
|---|---|---|
| **TAŞIYICI** | dersin ana bilgisini veren cümle | 5s (varsayılan) |
| **VURUŞ** | fark ediş, dönüm, kapanış — izleyicinin durduğu an | 8-10s, ya da 5s + son kare donması |
| **GEÇİŞ** | mekân/ölçek değiştiren bağ cümlesi | 3-4s, hızlı kesilir |

🔴 **GEÇİŞ, ANLATI ROLÜNE GÖRE DEĞİL CÜMLE UZUNLUĞUNA GÖRE SEÇİLİR** (2026-08-03, Claude'un
kendi hatası, `edit-plan.mjs` yakaladı): beş kare "bağ cümlesi" diye 3 saniyeye indirildi, sonra
plan üretilince görüldü ki birinin VO'su **6.1 saniye** — 3 saniyelik pencereye sığmıyor.
**Kural: bir cümle ancak VO tahmini ≤3.5 saniyeyse GEÇİŞ olabilir.** Rol ikinci ölçüttür,
uzunluk birincidir. `edit-plan.mjs` bunu her koşuda `◄VO … > pencere …` diye basar.

🔴 **Bir cümle iki klibe BÖLÜNEBİLİR** — özellikle "önce şu oldu, sonra bu" yapısındaki cümleler.
Ve **iki kısa cümle tek klipte BİRLEŞEBİLİR.** Bunlar plan kararıdır, prompt yazarken
doğaçlanmaz. Birleşen sahneler EDIT-PLAN'a `(S40+41)` biçiminde yazılır.

**Süre tahmini kalibrelidir:** Türkçe sakin anlatım ≈ **4.35 hece/saniye + 0.35s cümle nefesi.**
⚠ Bu hatta plan tahmini tarihsel olarak **yüksek** çıkıyor: Kütle plan 3:33 → gerçek 3:00 ·
Bitkilerde plan 4:32 → gerçek 3:29. Yani tahmini pencere şişirmek için kullanma; gerçek VO
indiğinde `kaba-kurgu.mjs` kesimleri whisper ile **gerçek cümle sınırlarına** oturtuyor.

---

## 2. RİTİM TASARIMI — "kurgu basic" hastalığının ilacı

Bir kurgu ancak **beklenti kurup kırdığında** yaşar. Hepsi aynı uzunlukta kesilen klipler
beklenti kurar ve hiç kırmaz — izleyici üçüncü kesimde ritmi öğrenir, sonrası düz çizgidir.

Plan modunda sekans sekans **ritim eğrisi** yazılır. En az şu üçü kararlaştırılır:

- **HIZLANMA** — ardışık 2-3 kısa klip (3-4s). Nerede? Genellikle keşif ya da liste bölümünde.
- **TUTMA** — tek uzun klip (8-10s), kamera minimal, izleyicinin nefes aldığı yer. Genellikle
  vuruştan hemen sonra.
- **NEFES** — VO'suz beat. Bir klip ya da bir klibin kuyruğu **konuşmadan** durur; yalnız
  görüntü ve müzik. Bitkilerde'de ölçüldü: nefes boşluğunda **15 kesim sınırı kaydırıldı** ve
  kurgu oradan nefes aldı.

🔴 **Organel/liste kareleri özel risk taşır.** Ölçüldü (Hücre, 2026-08-03): boş çıkan beş klibin
dördü **organel ad kartıydı** — yazı kilidi kamerayı dondurunca geriye tanecik sürüklenmesinden
başka olay kalmıyor. Plan bunu önceden görür: **ad kartı karesine yazılabilir bir OLAY şart
koşulur**, yoksa o klip ambiyans olur.

---

## 3. DUYGU EĞRİSİ — tesadüfe bırakılmaz

Mami, 2026-08-03: *"bazı yerler motionda duygusal."* Duygu kazara geliyorsa tekrar edilemez.

Plan modunda videonun **en fazla üç duygu tepesi** önceden adlandırılır:
`K<n> — <ne oluyor> — <izleyici ne hissedecek>`

Bu üç kare sonra ayrıcalıklıdır: motion'da kameraya en çok cesaret orada verilir, kurguda
müzik orada açılır, showreel oradan kesilir. Geri kalan kareler o üçünü **taşır**, onlarla
yarışmaz.

Ayrıca **kapanış kafiyesi** burada kararlaştırılır: açılış karesiyle kapanış karesi arasında
tek farkla kurulan bir ayna varsa (Hücre'de duvardaki boşluk), plan onu **kare numarasıyla**
yazar. ⚠ Ölçüldü: ayna metinle kurulmuyor — kapanış karesi üretilirken **açılış karesinin
kendisi referans olarak beslenmeli**, yoksa ayna tutmuyor.

---

## 4. SÜRE VE RİSK BÜTÇESİ

- **Hedef süre** yazılır (3-4 dk bandı) ve klip sayısı ona göre çıkar.
- **Riskli klipler önceden işaretlenir** ve gerekçesi yazılır: uzun VO · hızlı takip · geniş
  kreyn · katı/mekanik nesne + hareketli kamera (warp riski) · ekranda yazı taşıyan kare
  (kamera kilitli kalacak). Bunlar **önce tek başına** üretilir, sekans basılmadan.
- **Kaç kare yeni referans istiyor** — envanter öncesi kaba sayım. Bileşke'de bu tablo çıkınca
  INTRO'nun hiç yeni referans istemediği görüldü ve 16 kare beklemeden basıldı.

---

## 5. ÇIKTI — `<Ad>_PLAN.md`, tek sayfa

```
# <Ad> — ŞEKİL PLANI
hedef süre: <m:ss>   ·   klip sayısı: <n>   ·   VO cümlesi: <n>

## KLİP HARİTASI
K01  TAŞIYICI  5s   "<VO cümlesi>"
K02  VURUŞ     8s   "<VO cümlesi>"        ◄ duygu tepesi 1
K03  GEÇİŞ     3s   "<VO cümlesi>"
...
(birleşenler: S12+S13 → K12 · bölünenler: S27 → K28+K29)

## RİTİM
S1  sakin, taşıyıcı ağırlıklı
S2  hızlanma: K09-K11 üç kısa klip
S3  tutma: K16 8 saniye, kamera minimal
S4  nefes: K22 kuyruğunda 1.5s VO'suz beat
...

## DUYGU TEPELERİ (en fazla 3)
K15 — <ne oluyor> — <ne hissettirir>
K21 — ...
K51 — ...

## KAPANIŞ KAFİYESİ
K01 ↔ K51 · tek fark: <ne> · K51 üretilirken K01'in TESLİM EDİLEN KARESİ referans beslenir

## RİSKLİ KLİPLER — sekans basılmadan tek tek test
K13 — mikroskop gövdesi + kamera hareketi → warp riski
K25 — ekranda yazı → kamera kilitli, olay yazısız katmanda olacak
...

## MAMİ ONAYI
- [ ] şekil onaylandı — prompt yazımı açılabilir
```

---

## 6. YÜRÜTME

- Plan **konuşarak** kurulur. Mami cümleleri okur, ajan kovaları önerir, **Mami onaylar.**
  Tek karar kuralı geçerli: menü değil, gerekçeli tek öneri.
- 🔴 **Onaysız prompt yazılmaz.** Plan modunun tek sert kuralı budur — sebebi ölçüldü:
  yarıda değişen bir şekil kararı, üretilmiş kareleri çöpe atar.
- Plan **kilittir ama kutsal değildir**: gerçek VO indiğinde süreler kayarsa `kaba-kurgu.mjs`
  kesimleri gerçek cümlelere oturtur. Kayan şey **süre**dir; ritim, duygu tepeleri ve kafiye
  kilitli kalır.
- Plan dosyası kapanış hasadına girer: **tahmin edilen şekil ile teslim edilen şekil**
  karşılaştırılır, sapma ders adayı üretir.

## Sınırlar

- Bu skill kare yazmaz, prompt yazmaz, motor çağırmaz. Yalnız **şekil** üretir.
- Dünya, cast, omurga ve kavram ışığı **enzimin** işidir — burada tekrar kilitlenmez.
- Süre tahmini bir iddiadır, ölçüm değil. Kanıt gerçek VO'dur.
