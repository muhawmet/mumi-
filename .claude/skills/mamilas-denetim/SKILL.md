---
name: mamilas-denetim
description: MAMILAS kare denetimi — Mami üretilmiş start frame'leri klasöre attığında kullan. "kareleri attım / denetle / revize / tarayacaksın / bunlara bak / 44 resmi indirdim" dendiğinde çalıştır. Sekans başına bir ajanla tek geçişte VO-eşliği denetler, revize ve motion'ı birlikte yazar. Kare görmeden motion yazmaz.
---

# MAMILAS — KARE DENETİMİ

Mami kareleri üretip klasöre atar. Bu skill onları **tek geçişte** denetler: her kare kendi VO
cümlesiyle karşılaştırılır, sorunluya revize yazılır, sorunsuza motion yazılır.

Yasa kaynağı: `agents/PROMPT-YASASI.md` (§1 daimi direktifler · **§1a kıstas sırası** ·
§3 motion · §5 teslim seti). Ezberden denetleme — kıstas sırası oradan okunur.

🔴 **AJAN BRIEF'İ DOĞAÇLANMAZ: `agents/AJAN-BRIEF.md`.** Ölçüldü (2026-08-03): bir günde
kaçırılan 16 kusurun üç sınıfı — çocuk güvenliği, render dili kopması, VO nicelik/ölçek —
doğrudan brief'in elle yazılmasından doğdu. Ajanlar verilen brief'i doğru uyguladı, **brief
eksikti.** O dosyanın **ZORUNLU BLOK**'u (kaynak yolları · yazı haritasının kaynağı · on kusur
sınıfı · eşik daraltma kuralı · kanon yapıştırma · ajanın göremeyeceği) her brief'e birebir
girer; üstüne yalnız işe özel olan eklenir. Brief gönderilmeden önce oradaki **üç soru** sorulur.

## Ajan mimarisi — Mami'nin kuralı

**Ajan başına KARE değil, ajan başına SEKANS.** 44 kare için 44 ajan usage yakar ve süreklilik
bozar: ayrı ajanlar birbirinin kadrajını görmez, aynı prop'un iki karede değiştiğini fark edemez.

- Sekanslar `_PROMPTLAR.txt` içindeki `##### SEKANS` başlıklarından (yoksa `phaseName`'den) çıkar.
- **Sekans başına bir ajan**, kendi 8-12 karesini birlikte açar. Eşzamanlı tavan **6**.
- Sekans içi süreklilik (karakter kıyafeti, hero-prop, mekân) tek kafada kalır — asıl kazanç bu.
- Sekanslar arası süreklilik ajanların değil, **bu skill'in** işi: raporlar birleşince sınır
  kareleri (bir sekansın sonu + sonrakinin başı) burada karşılaştırılır.

## Akış

**1. Hazırlık (ajan açmadan önce).**
- Kare klasörünü bul; dosya adı = kare numarası (`1.png` = K01).
- `_PROMPTLAR.txt` ve `_SESLENDIRME.txt`'i oku; her kareye VO cümlesini eşle.
- **Eksik kare varsa Mami'ye SÖYLE, tahmin etme.** Numara kayması revize listesini okunamaz yapar.
- `node scripts/prompt-lint.mjs <_PROMPTLAR.txt>` koş — yapısal eksikler ajanlara girdi olsun.

**2. Sekans ajanları (paralel).** Her ajana verilecekler: kendi karelerinin dosya yolları · her
karenin VO cümlesi · dünya/palet/negatif kilitleri · `PROMPT-YASASI` §1a kıstas sırası ·
`docs/ai/sync/memory/mamilas-nb2-hata-katalogu.md` bilinen 10 NB2 hata kalıbı — 🔴 **yolu
brief'e BİREBİR yaz, "hafızandaki katalog" deme: alt-ajan üst ajanın hafızasını ALMAZ.**
Ölçüldü (2026-08-03): bu yol `memory/...` diye yazılıydı, o dizin repo'da yok, ve katalog
bugüne kadar hiçbir denetim ajanının eline geçmedi. Her ajan kareleri **Read ile açıp
GÖRÜR** — dosya adına ya da prompta bakarak hüküm vermek yasak.

**3. Kıstas sırası — `agents/PROMPT-YASASI.md` §1a.** On madde (0 FİKİR … 9 ÇEKİMİN KENDİSİ),
sıra bağlayıcı, üstteki alttakini iptal eder. **Liste buraya kopyalanmıyor:** eskiden burada
tam, `mamilas-director` ve `mamilas-enzim`'de eksik yaşıyordu — aynı kareye iki yüzey iki farklı
kıstasla bakıyordu. Ajana verilen brief'te §1a'ya atıf yapılır, madde metni ezberden yazılmaz.

İki madde denetimin varlık sebebidir, sekans ajanına **ayrıca** hatırlatılır: **0 FİKİR**
(§2ø — teknik olarak kusursuz ama ölü kare teslim edilmez) ve **9 ÇEKİMİN KENDİSİ**
(§2a — bu madde olmadan çirkin kare TEMİZ geçiyor; ölçüldü: Değerler'in kemer karesi
denetimden dokunulmadan çıktı, Mami rezil dedi).

**4. Karar — basit.**
*Sahne bozuksa* (kompozisyon/içerik yanlış, beat tutmuyor) → **baştan üret.**
*Küçük şey değişecekse* (sayı, yazı, renk, tek öğe) → **referans-edit:**
`Use this referenced image, change ONLY: <fix>. Keep everything else identical.`
Sahneyi baştan tarif ETME — görsel zaten referans olarak bağlı.

**5. TEK GEÇİŞ.** Kareye bir kez bakılır; aynı geçişte hem motion hem (varsa) revize yazılır.
Aynı kareleri tekrar tekrar açmak context israfıdır ve Mami'yi bekletir.

## Değişmezler

- **Sorunsuz kareye revize YOK** — tek satır "temiz" listesi yeter.
- **Görülmemiş kareye motion YOK.** Revize edilmiş kare de dahil: yeni kare gelmeden onun
  motion'ı yazılmaz.
- **Bulanık arka plan yazısına takılma** — sadece net okunan yanlış düzeltilir. Arka plan
  revizesi **bulanık istenir** (`keep same soft-focus, do not sharpen`), yoksa NB2 netleştirip
  odağı çalıyor.
- `revize.txt` biçimi: her blok `### dosya.png` ile başlar (node parse eder), kare numarasına
  göre sıralı, blok = dosya adı + tek fix cümlesi.

## Rapor — RSD kuralı geçerli

Özet **ne TUTTU ile başlar**, kusur listesiyle değil: *"44'ün 36'sı temiz"* önce gelir.
Kusur mekanizmaya yazılır, kişiye değil. Tespit ve düzeltme aynı cümlede gelir — çıplak
eleştiri bırakılmaz. Gerekçesi: `mamilas-buddy` skill'i, RSD bölümü.

## Sınırlar

- Ajanlar yalnız **artifact** üretir: hüküm, revize metni, motion metni. Kare üretmez, dosya
  silmez, kaynak JSON'a dokunmaz.
- Kare kalitesinin son hükmü **Mami'nin**. Bu skill hazırlar, karar vermez.
- 6'dan fazla eşzamanlı ajan açma.
