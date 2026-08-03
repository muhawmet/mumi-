# AJAN BRIEF — duran şablon

> **Bu dosya neden var.** 2026-08-03'te ölçüldü: bir günde kaçırılan 16 kusurun **üç sınıfı**
> (çocuk güvenliği · render dili kopması · VO nicelik/ölçek) doğrudan **brief'in elle
> yazılmasından** doğdu. Claude her seferinde brief'i sıfırdan kuruyor, ve her seferinde bir şey
> düşüyor: bir kez güvenlik maddesi, bir kez yazı haritası yanlış kaynaktan alındı (ENZİM
> tablosu okundu, gerçek kaynak PROMPTLAR beyanıydı — 21 kareden 7'si sayıldı), bir kez
> *"minimale takılma"* cümlesi **raporlamayı değil bakmayı** kıstı.
>
> Kusur ajanlarda değil. Ajanlar verilen brief'i doğru uyguladı — **brief eksikti.**
> Bu, bu repoda 11 kez ölçülen *"doğrulayıcı ölçtüğü şeyin yerleşimini varsayıyor"* sınıfının
> brief katmanındaki hâli. Çözüm noktasal değil kanaldan: **brief artık doğaçlanmaz, buradan
> türetilir.**

Kullanan yüzeyler: `mamilas-denetim` · `mamilas-director` · `mamilas-plan` · kapanış hasadı.
Bir ajan açılırken bu dosyadaki **ZORUNLU BLOK** olduğu gibi brief'e girer; üstüne yalnız
**o işe özel** olan eklenir.

---

## A · ZORUNLU BLOK — her ajan brief'ine BİREBİR girer

### A1 · Kaynak yolları — tahmin edilmez, buradan alınır

🔴 **Alt-ajan üst ajanın hafızasını ALMAZ.** "Hafızandaki katalog" demek, o katalogun ajana hiç
ulaşmaması demektir. Yol **birebir** yazılır:

| ne | yol |
|---|---|
| Üretim yasası | `agents/PROMPT-YASASI.md` — §1a kıstas sırası (satır 165-235) · §2 start-frame · §3 motion (582-820) |
| NB2 bilinen hata kalıpları | `docs/ai/sync/memory/mamilas-nb2-hata-katalogu.md` ⚠ repo kökünde `memory/` dizini **YOKTUR** |
| Onaylı ders bankası | `agents/lessons/APPROVED.md` |
| Projenin kilitleri | `<proje>/_ENZIM.md` ya da `<proje>/*_ENZIM.md` |
| Projenin referansları | `<proje>/*_REFERANSLAR.txt` |
| Dünya kuyruğu | `<proje>/_DUNYA-KUYRUGU.txt` — yoksa `node scripts/dunya-kilidi.mjs <worldId> --register=<reg>` ile basılır |
| Biçim örneği | `agents/COMMAND-INBOX/5. Sınıf - Hücre ve Organelleri/PROMPTLAR/` — bu repodaki en iyi ölçülen korpus |

### A2 · Yazı haritası — kare numarasından değil, BEYANDAN

🔴 **"Bu karede harf var mı" sorusunun kaynağı, her PROMPTLAR bloğunun kendi `YAZI` beyanıdır.**
ENZİM'in organel/kavram tablosu **kaynak değildir** — o yalnız tasarlanmış ekran yazısını sayar,
nesnenin kendi yazısını (çimento torbası, süt kartonu, objektif bileziği) saymaz.
Ölçüldü: brief 7 kare saydı, gerçek **21**'di.

### A3 · Kusur sınıfları — brief'ten hiçbiri düşmez

Bir denetim ya da yazım ajanı **en az** şu sınıfları taşır. Eşik daraltılacaksa
**kapsam dışı kalanlar tek tek sayılır** (bkz. A4):

1. 🔴 **ÇOCUK GÜVENLİĞİ** — kadrajda çocuk varsa kesici alet, açık ateş, kaynar sıvı, kimyasal,
   **ağza giren nesne**, çocuğun yüzüne makro yakınlık. İş **bitmiş** gösterilir.
   *Kalite kalemi değil, yayın engeli.*
2. **VO ↔ ekran uyumu**, ve içinde: nicelik · konum · **ölçek** (uzva/nesneye kıyasla) ·
   **karşıtlık** ("X'te vardı Y'de yoktu" → kare iki tarafı birden gösterir).
3. **Bozuk yazı** — net okunan yanlış/ters/eksik diakritik. Bulanık arka plana takılma.
4. **Render dili kopması** — EDU karesinde foto-gerçekçi ten, gözenek, sakal kılı, oyun-motoru
   dokusu. Süreklilik denetimi kıyafet/prop bakar, **üsluba da bakar.**
5. **Dünyaya yabancı cisim** — kapalı dünyaya ait olmayan alet/metal/yapay nesne.
6. **Öğretim doğruluğu** — bilgi yanlışı güzellikten önce gelir.
7. **Plastiklik** — (a) kadraja dik + iki göz aydınlık + gölgesiz = plastik; profil/dörtte üç +
   sert yan-arka ışık = doğal. (b) yalnız **bakan** karakter plastik, **yapan** karakter canlı.
8. **Geometri kaynaşması** — figür/nesne başka bir katı yüzeyin içine geçmiş mi.
9. **FİKİR** (§2ø) — VO olmadan bakınca "ne oluyor" cevaplanabiliyor mu.
10. **ÇEKİMİN KENDİSİ** (§2a) — kahraman kim · kaç net insan · ışık nereden gelip nerede bitiyor ·
    özne zeminden nasıl ayrılıyor.

### A4 · Eşik daraltma kuralı

🔴 Mami *"minimale takılma / ciddi olmayanı geç"* dediğinde bu **raporlamayı** kısar,
**bakmayı** kısmaz. Brief'e şu iki cümle birlikte yazılır:
> *"Her şeyi gör; filtreyi rapora uygula, bakışa değil."*
> *"Eşiğin dışında kalan sınıflar şunlardır: <tek tek say>. Bunlardan çocuk güvenliği ve render
> dili kopması eşiğin ÜSTÜNDEDİR ve daraltmaya tabi değildir."*

Ölçüldü: bu iki cümle olmadan verilen bir eşik, aynı ajanların aynı karelerde **16 kusurun
16'sını** kaçırmasına yol açtı; dar mercek verilince aynı ajanlar hepsini buldu.

### A5 · Kanon yazılmaz, YAPIŞTIRILIR

Dünya kuyruğu (STYLE / LIGHT / NEGATIVE), kimlik cümlesi ve tarif kilitleri **birebir** geçer.
Ölçüldü (Hücre): elle yazılınca 53 karede **53 farklı sürüm** doğdu, negatif iskeleti bloktan
bloğa **151→295 kelimeye** şişti, kimlik cümlesi 12 dosyada **dört ayrı** biçimde yazıldı ve
üç kare foto-gerçekçiye kaydı.
⚠ **Kuyruk dosyası projenin gerçek lehçesini taşımıyorsa** (Bileşke'de böyle çıktı: onaylı
K01-K16 kuyruk dosyasından farklı bir lehçe taşıyor) ajan **onaylı komşu kareye uyar** ve
durumu raporlar — iki lehçeli bir film, bayat bir kuyruk dosyasından kötüdür.

### A6 · Ajanın göremeyeceği şey — brief bunu söyler

Ajan **klip izleyemez** (o AGY'nin işi) ve **Mami'nin zevkini bilemez**. Brief her zaman
şunu yazar: *"Hüküm Mami'nindir. Sen artifact üretirsin: bulgu, revize metni, motion metni.
Kare üretmez, dosya silmez, kaynak JSON'a dokunmazsın."*

---

## B · İŞE ÖZEL BLOK — brief'in geri kalanı

Bunlar her seferinde yeniden yazılır ama **başlıkları sabittir**, atlanmaz:

1. **BLOĞUN SINIRI** — hangi kareler, hangi dosyalar, kaç adet.
2. **NEDEN BU İŞ VAR** — ölçülmüş gerekçe, tek paragraf. Ajan neden yaptığını bilmezse
   kuralı uygular ama ruhunu uygulamaz.
3. **KAREYİ GÖR** — `Read` ile aç. Dosya adına, prompt metnine ya da VO'ya bakarak hüküm yasak.
4. **BU BLOĞUN ÖZEL RİSKİ** — bu sekansta ne bozulur? (mikroskop = warp · organel adı = ölü klip ·
   kış mutfağı = güvenlik · bez/organ adı = ders kitabı kesiti)
5. **ÇIKTI BİÇİMİ** — dosya yolları, biçim, hangi satırlar korunur.
6. **RAPOR BİÇİMİ** — *"önce ne tuttu"* ile başlar (RSD kuralı), sonra bulgu, sonra tek cümlelik
   yetenek hükmü. **Kelime tablosu yasak** (MAKRO kuralı).

---

## C · BRIEF YAZILDIKTAN SONRA — üç soru

Göndermeden önce:
1. **A3'ün on sınıfından hangisi brief'te YOK?** Bilerek çıkarıldıysa A4'e göre yazıldı mı?
2. **Verdiğim her dosya yolu diskte var mı?** (11 kez ölçülen kusur sınıfı tam burada yaşıyor.)
3. **Ajan bu brief'le benim bilmediğim bir şey bulabilir mi?** Bulamıyorsa brief bir kontrol
   listesidir, bir görev değil — ve kontrol listesi yeni bilgi üretmez.
