---
name: mamilas-enzim
description: MAMILAS üretimini hızlandıran kilit disiplini. Yönetmen prompt yazmadan ÖNCE kararları kilitler, üretim sırasında geri sarmayı önler. "enzim / enzimle / hızlandıralım / bu videoyu hızlı bitirelim / kilitleri sıkalım" dendiğinde ve HER yeni video başlarken mamilas-director ile birlikte çalıştır.
---

# MAMILAS — ENZİM

Yönetmen prompt **yazar**. Enzim, yazmadan önce kararları **kilitler**.

Sebep: kalite düşük olduğu için değil, aynı işi iki kez yaptığımız için yavaşlıyoruz.
5. sınıf "Kuvvet ve Kuvvetin Ölçülmesi" üretiminde 48 karenin **21'i** en az bir kez
yeniden yazıldı ya da yeniden basıldı. Hiçbiri yeni bir fikirden doğmadı — hepsi
başta kilitlenmemiş bir karardan doğdu. Aşağıdaki kilitler o 21 karenin listesidir.

**Kayıt önce.** `node scripts/current-work.mjs baslat "<proje>"` — kilitleri kapatmadan önce
işi kayda geçir; bitince `... ilerle --bitti "..." --sirada "..."`. Kayıt bayatlarsa sonraki
oturum sıfırdan başlar (ölçüldü: kayıt "VO hiç üretilmedi" derken diskte render duruyordu).

**Kural: bir kilit açık kaldıysa prompt yazmaya BAŞLAMA.** Mami'ye sor, cevabı yaz, sonra üret.

**Ön okuma:** `agents/PROMPT-YASASI.md` — Mami'nin daimi direktifleri + ölçülmüş start-frame,
motion ve referans template'leri. Kilitler o yasanın slotlarını doldurur; yasa okunmadan
kilit sorulmaz.

**Ders bankası — yalnız KİLİT seviyesi.** `agents/lessons/APPROVED.md`'yi (Mami-onaylı ders
bankası) de aç, ama içinden sadece **üretim başlamadan karara bağlanan** dersleri al:
tag'lenecek prop, gardırop/renk sahipliği, ekranda yazı politikası, teslim biçimi. Bunlar
aşağıdaki kilitlerin **cevabına** girer, prompt cümlesine değil — kare-başına uygulanan
dersler `mamilas-director`'ın işidir; aynı dersi iki yerde uygulama. Çelişki kuralı bankanın
kendi başlığında yazılı, oradan oku. **Banka boşsa hiçbir şey olmaz** (boş banka normal
durumdur; `APPROVED.md`'ye yalnız Mami yazar — sen aday taşımazsın).

---

## KİLİT 0 — JSON ön kontrolü (ilk prompt'tan önce, tek geçiş)

Command JSON'u okur okumaz şunu koştur; gözle tarama yapma:

```bash
node -e "
const j=require('./<command>.json'); const raw=JSON.stringify(j);
const c=j.creativeControls;
console.log('PRESET:', [c.mood,c.cameraEnergy,c.timeLight,c.pov,c.signature,c.tempoCurve].join(' | '));
console.log('directorBrief:', (c.directorBrief||'(bos)').slice(0,120));
console.log('topic:', JSON.stringify(j.locks.topic), '| cast:', JSON.stringify(j.locks.cast));
['saffron','sheen','bloom','negative-space','witness','documentar','Deakins']
  .forEach(w=>{const n=(raw.match(new RegExp(w,'gi'))||[]).length; if(n) console.log('TUZAK', w, n)});
console.log('sahne:', j.scenes.length);
"
```

**ÇALIŞAN PRESET (Sürtünme + Bileşke + Kuvvet Ölçümleri):**
`joy_curiosity · explore_pov · morning · hidden_mech · scale_hero · educational_arc` ve
**boş directorBrief**. Bundan sapma varsa Mami'ye **hemen** söyle: siteden yeniden indirsin
ya da sen sökeceksin. Sonradan fark edilirse 58 sahnelik cerrahi olur.

Sinematik/belgesel preset'i (`witness POV`, `negative-space led`, `documentary_arc`,
`Deakins/Lubezki`) çocuk ders videosunun **zıddıdır** — void arka plan ve ölü tempo doğurur.

`locks.topic` eski proje adını taşıyabilir (bir kez "Su Döngüsü" çıktı); prompt'a sızmıyorsa
üretimi bozmaz, yine de Mami'ye bildir. `cast` ve `location` daima boştur — sen doldurursun.

---

## KİLİT 1 — Kesim masasında tek oturumda karara bağlanacak dört şey

Beat listesini okuduktan sonra, **tek mesajda** hepsini Mami'ye sun ve onayla:

**1. Kare sayısı.** Birleşen beat'leri say. VO cümlesi asla atılmaz.

**2. Karakter oranı.** Kaç karede yüzüyle görünecek? Sayıyı **yazarak** ver ("19/48, %40").
Yazdıktan sonra `grep -c '@karakter'` ile doğrula. Sonradan seyreltmek 8 kare yeniden yazmak demek.

**3. Hero-prop + tag listesi.** **2+ karede görünen her belirgin nesne** tag'lenir — sadece
karakterler değil. Kaçırılırsa sürüklenir: bir üretimde kitap 6 karede 6 renk oldu, bir
diğerinde çanta ile top kare ortasında değişti. Listeyi kesimle birlikte ver, üretimden önce bastır.

**4. Ekranda yazı POLİTİKASI** — kare listesi değil. *(Mami 2026-07-29: global yazı planı
kilidi kaldırıldı; yazı artık sahneye göre adaptif yazılıyor.)*

Burada kilitlenen tek şey politikadır: **Türkçe ya da HİÇ** · yazı **diegetik** doğar
(kabartma harf, plaket, tabela — karede madde olarak) · **post-prodüksiyonda yazı katmanı YOK**
(Mami AE bilmiyor) · yazı taşıyan her karede TEXT slotu **harf harf + diakritik + konum** yazılır
(`PROMPT-YASASI.md` §2 TEXT satırı).

**Hangi karede yazı olacağı kare kare, sahnenin kendisinden kararlaştırılır** — başlık satırında
`yazı: <"KELİME" | YOK>` olarak beyan edilir. Önceden liste çıkarma; sahne yazıyı hak ediyorsa
yazı vardır.

**Kanıt:** Üreme'de 50 karenin 14'ü yazı taşıdı, karar kare kare verildi, **14/14 temiz** çıktı
(`ENZIM-KILITLERI.json → kurguKilitleri.ekranYazisi`). Eski global-plan kilidi bu sonucu
üretmedi; onu üreten TEXT slotunun kendisiydi.

---

## KİLİT 2 — Prompt yazım yasaları (Magnific Spaces gerçeği)

**Spaces önceki kareyi BİLMEZ.** Her sahne ilk kez tarif edilir; referans verirsen o
referans "ilk tarif"in yerine geçer. Bu yüzden:

- **Önceki kareye atıf YASAK.** "açılıştaki odayla aynı", "az önceki halinden farklı",
  "eskisi gibi" — hiçbiri bir şey ifade etmez. Süreklilik **@tag** ve **her karede yeniden
  yazılan tam dekor** ile sağlanır.
- **Negatif = firewall + karede gerçekten olan.** Sahnede olmayan nesneyi negatifte anmak
  NB2'de onu **çağırıyor**. Kalacaklar: photoreal/2D cel/clay, franchise/gerçek kişi/logo,
  ve karedeki kırılgan öğe (glow çiçeğe dönmesin, yay kopmasın, cilt yeşillenmesin, cast Türk kalsın).
  Gidecekler: `no empty void`, `no lens flare` — kare zaten pozitif olarak dolu tarif edildiyse
  bunlar gereksiz. **İstisna — kavram izi taşıyan kare:** Mami'nin direktifi izin ÇİZİLMESİ,
  ama ışık objesi olarak. O karede negatif kalır ve kare-özel yazılır: *"the line is light,
  never a drawn arrowhead, no flat diagram"* (yoksa NB2 ok ucu çiziyor).
- **Sayı + birim:** basamaklar bitişik, birimden önce tek boşluk. *"the two-digit number twelve
  with its digits touching, then one clear space, then the capital letter N"*. Sadece
  "rakam, boşluk, N" dersen NB2 basamakları da ayırıyor ("1 2 N").
- **Yazı bastırma reçetesi:** tek kelime · büyük ve net orta planda · **harf sayısıyla tarif
  edilmiş** (*"eleven letters, the second one a dotted capital İ"*) · tırnak içinde. Üçü birden
  olduğunda NB2 hata yapmıyor; biri eksikse garbled çıkıyor.

Bilinen NB2 hata kalıpları: `memory/mamilas-nb2-hata-katalogu.md`.

---

## KİLİT 3 — Teslim ve numaralandırma

- **Dosya adı = kare numarası.** `1.png` = K01. Sıralı numaralandırma yapılırsa eksik bir
  kare sonrasını kaydırır ve revize listesi okunamaz hale gelir.
- **Referans-edit kareleri üretimde atlanıyor** — sıfırdan promptu olmadığı için gözden
  kaçıyorlar. Teslim dosyasında `◄ REFERANS-EDIT` diye işaretle, numarasını **rezerve et**,
  ve üretim sırası listesine ayrı satır olarak yaz.
- **revize.txt daima kare numarasına göre sıralanır** (K01→K48), sekansa göre değil.
  Her blokta hem kare hem güncel dosya adı yazsın.
- Teslim seti: `_PROMPTLAR.txt` · `_REFERANSLAR.txt` · `_MOTION.txt` · `_SESLENDIRME.txt` ·
  `_EDIT-PLAN.txt` + klasörde `revize.txt`. Hepsi `.txt`, prompt blokları `-----` ayraçlı.

---

## KİLİT 4 — Denetim (tek geçiş, sabit kıstas)

Kareye **bir kez** bak. O geçişte hem motion hem varsa revize yazılır.

**Kıstas sırası:** `agents/PROMPT-YASASI.md` **§1a** — on madde, sıra bağlayıcı, tek kaynak.
Buradaki eski yedi maddelik kopya kaldırıldı (2026-08-02): bayatlamıştı ve yasanın en pahalı
iki maddesini — **0 FİKİR** (§2ø) ile **9 ÇEKİMİN KENDİSİ** (§2a) — hiç taşımıyordu.
Kilit fazında senin işin listeyi saymak değil, kilitlerin o listeyi **karşılayabilir**
kıldığından emin olmak (tag listesi 6. maddeyi, yazı politikası 2. ve 4. maddeyi besler).

**Karar:** sahne bozuksa (mekân/kompozisyon yanlış, beat tutmuyor) → **baştan üret**.
Küçük şey değişecekse (yazı, sayı, renk, tek nesne) → **referans-edit**.
Mekân yanlışsa referans-edit işe yaramaz, baştan üretilir.

Motion'da kamera: **push-in yalnız bir şeyin anlaşıldığı anda.** Klişe "slow push in"
sıkıcılığın kaynağı. Kamera ya olayla gider, ya kilitli durup dünyayı yaşatır, ya bırakır
özne çerçeveyi terk etsin. Katı/mekanik nesnede kamera ölçülü + `rigid solid` kilidi (warp).

---

## Sınırlar

Bu skill karar **kilitler**, prompt yazmaz — yazma işi `mamilas-director`'ın.
Otomatik generation, ikinci runner, jüri spawn yok. Mami her kilidi onaylar.
