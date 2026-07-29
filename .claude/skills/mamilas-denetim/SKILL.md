---
name: mamilas-denetim
description: MAMILAS kare denetimi — Mami üretilmiş start frame'leri klasöre attığında kullan. "kareleri attım / denetle / revize / tarayacaksın / bunlara bak / 44 resmi indirdim" dendiğinde çalıştır. Sekans başına bir ajanla tek geçişte VO-eşliği denetler, revize ve motion'ı birlikte yazar. Kare görmeden motion yazmaz.
---

# MAMILAS — KARE DENETİMİ

Mami kareleri üretip klasöre atar. Bu skill onları **tek geçişte** denetler: her kare kendi VO
cümlesiyle karşılaştırılır, sorunluya revize yazılır, sorunsuza motion yazılır.

Yasa kaynağı: `agents/PROMPT-YASASI.md` (§1 daimi direktifler · §3 motion · §5 teslim seti).
Ezberden denetleme — kıstas sırası oradan okunur.

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
karenin VO cümlesi · dünya/palet/negatif kilitleri · `PROMPT-YASASI` §1 kıstas sırası ·
`memory/mamilas-nb2-hata-katalogu` bilinen hata kalıpları. Her ajan kareleri **Read ile açıp
GÖRÜR** — dosya adına ya da prompta bakarak hüküm vermek yasak.

**3. Kıstas sırası (sabit, yasa §1'den).**
0. **FİKİR (yasa §2ø)** — kareyi VO olmadan gösterip "burada ne oluyor" diye sorsan cevap
   verilebilir mi? Görünür bir gerilim ya da değişim var mı? Yoksa kare teknik olarak kusursuz
   ama ölüdür ve teslim edilmez. Bu madde diğer sekizinin ÜSTÜNDEDİR: onlar kusuru ölçer,
   bu bakılmaya değer olup olmadığını ölçer.
1. **VO ↔ sahne uyumu (EN ÖNEMLİ)** — kare o cümlenin dediğini gösteriyor mu?
2. Bozuk/garbled yazı · 3. Yanlış cast (Türk/Anadolu) · 4. Fazla/İngilizce yazı ·
5. World/firewall ihlali · 6. Süreklilik (karakter, hero-prop, mekân) · 7. Void arka plan
8. **Geometri kaynaşması** — figür/nesne başka bir katı yüzeyin içine geçmiş mi (Mami buldu,
   ajan kaçırdı: K16 ahşaba kaynaşmış figür). Yazı/cast/ten/süreklilik kalemleri bunu yakalamıyor.
9. **ÇEKİMİN KENDİSİ** — yasa §2a. Bu madde olmadan çirkin kare TEMİZ geçiyor (ölçüldü:
   Değerler'in kemer karesi denetimden dokunulmadan çıktı, Mami rezil dedi). Dört soru:
   · kahraman kim, kadrajın neyi kaplıyor?
   · kaç NET insan var? (isimsiz her yüz ~30-40 pikselde lekeye dönüyor)
   · ışık nereden geliyor ve NEREDE BİTİYOR? (hiçbir yer kararmıyorsa yüz modellenmiyor)
   · özne zeminden değer/renkle ayrılıyor mu, yoksa aynı tonda mı eriyor?

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
