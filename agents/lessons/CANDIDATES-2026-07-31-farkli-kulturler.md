# DERS ADAYLARI — 5.1.2 "Farklı Kültürler, Ortak Bir Yaşam"

**Kaynak:** 53 kare basıldı, 53'ü gözle denetlendi, 16 revize çıktı (%30).
**Tarih:** 2026-07-31. Ölçümün tamamı bu projede yapıldı; hiçbir madde tahmin değil.

🔴 **BU DOSYA ONAY BEKLİYOR.** Yasa: `APPROVED.md`'ye yalnız Mami taşır, otomatik promote yok.
Mami'ye soruldu — cevabı gelene kadar hiçbir satır bankaya girmez.

---

## A · Yazı kusuru İMLA değil YÖN — ve taşıyıcının boyutuna bağlı

**Ölçüm.** Yazı taşıyan 16 karede imla kusuru **sıfır**. Türkçe diakritik 16/16 doğru çıktı,
K51'in 32 harfi dahil (dört noktasız I, beş noktalı İ, breve'li Ğ). Buna karşılık **üç kare
ters basıldı** ve üçü de aynı sınıfta:

| Kare | Yazı | Kusur | Taşıyıcı |
|---|---|---|---|
| K03 | "5-B" | çeyrek tur dönük, harfler dikey | defter sırtındaki küçük kâğıt etiket |
| K08 | "NİNNİ" | 180° ters, noktalar altta | masaya serbest duran defter yaprağı |
| K32 | "YENİ" | tepetaklak | defter sayfası |

Doğru yönde çıkanların taşıyıcıları: vidalı emaye plaka · oyulmuş ahşap levha · gergin keten
şerit · duvara vidalı büyük pano · sert masa kartı · sahne afişi · flama.

**Ders adayı:** *Yazının taşıyıcısı ne kadar küçük ve serbestse yön o kadar kayıyor — imla
değil oryantasyon riski. Yazıyı bir yüzeye VİDALA: büyük, sabit, sensöre paralel ve sahnede
kendi başına duramayan bir nesne seç. Serbest duran defter/etiket/kâğıt yaprağına yazı konacaksa
TEXT slotuna yönün yanı sıra taşıyıcının neye SABİTLENDİĞİ de yazılır.*

---

## B · "Boş yüzeyi GİYDİR"in kendi sınırı var

**Ölçüm.** Uydurma İngilizce yazı üç karede çıktı — K13 `POWDERZD FLOX` · K24 `SAKAT TABARIM` ·
K29 `OKR BOYASI (ochre pigment)`. Üçü de **giydirme talimatının uygulandığı yerlerde** doğdu:
"rafı malla doldur", "kutuları istifle", "tezgâhı giydir".

Yani yasa doğru ama eksik: boş panel bırakmamak uydurma tabelayı kesiyor, **ama giydirme
malzemesi olarak KUTU/TENEKE/AMBALAJ seçilirse motor onların üstüne etiket basıyor.** Boşluğu
kapattık, yazı yüzeyini çoğalttık.

**Ders adayı:** *Yüzey giydirilirken malzeme YAZISIZ olandan seçilir — katlanmış kumaş, kraft
kâğıt rulosu, ters çevrilmiş kap, dolu ama etiketsiz sepet, ahşap, cam. Kutu, teneke, ambalaj
ve şişe giydirme malzemesi DEĞİLDİR: onlar yeni yazı yüzeyidir.*

---

## C · Kare-numara eşlemesi denetimin İLK adımı olmalı

**Ölçüm.** İki kare üretilmeyince (K02 ve K17) indirme sırası kaydı ve `18.png` aslında K19,
`48.png` aslında K49 oldu. **Prompt, lint, edit-plan ve motion yasası hiçbiri bunu görmüyor** —
hepsi dosya adına güveniyor. Kusur ancak dört kare gözle açılıp içeriğiyle karşılaştırılınca
bulundu. Bulunmasaydı 36 klip yanlış VO cümlesinin altına oturacaktı ve hata kurgu masasında
çıkacaktı.

**Ders adayı:** *Kareler indiği an, motion yazılmadan önce, kare-numara eşlemesi ÖRNEKLEMEYLE
doğrulanır: baştan, ortadan ve sondan birer kare açılıp kendi VO cümlesiyle karşılaştırılır.
Eksik kare varsa sayı kayması VARSAYILIR, önce eşleme onarılır. `N.png = KN` bir sözleşmedir,
bir gerçek değil.*

---

## D · @tag rolü tutmuyor — "kim yapmıyor" da yazılmalı

**Ölçüm.** K17'nin promptu doğruydu: `@dara blows across the bevelled end of @kaval` ve
`@mira2's shoulder turned toward the sound`. Motor **gardırobu takas etti** — kavalı yeşil
salopetli Mira çaldı, mor hırkalı Dara arkada oturdu. Aynı sınıf K36'da da çıktı (kartı asan
kız Mira değil Dara oldu). İki karede de handle'lar doğruydu.

**Ders adayı:** *İki tag'li karakter aynı karede ve biri eylemi yapıyorsa, tag yetmiyor.
Eylemi yapanın yanına ayırt edici tek bir gardırop çıpası konur ("the girl in the plum
cardigan") ve öteki için NE YAPMADIĞI yazılır ("her hands stay empty and never touch the
instrument"). NEGATIVE'e de girer: "the two girls never exchange costumes, hair or faces."*

---

## E · Düzeltme yalnız hafızaya yazılırsa, otomatik yüklenen dosya onu EZER

**Ölçüm.** Mami 2026-07-29'da *"İngilizcem C1"* diye kendi düzeltmesini yaptı ve düzeltme
`memory/mamilas-mami-kisisel.md`'ye işlendi. Ama `mamilas-buddy` skill'inin 24. satırı
**"Yazılı İngilizce zayıf — İngilizce teknik metni ona okutma"** demeye devam etti. Skill her
oturumda otomatik yükleniyor, hafıza yüklenmiyor. Sonuç: düzeltilmiş hüküm iki gün sonra
aynen geri doğdu ve bu oturumun açılışında da yeniden okundu.

**Ders adayı:** *Bir hüküm düzeltilince, o hükmün geçtiği HER otomatik yüklenen dosya
(skill, CLAUDE.md, hook metni) aynı geçişte aranır ve düzeltilir. Hafızaya yazmak bir
düzeltmeyi kalıcı yapmaz — otomatik yüklenen metin hafızayı ezer.*

---

## TUTAN TARAF — bunlar ders değil, kanıt

Aşağıdakiler bu turda **sınandı ve tuttu**; yasadan çıkarılmasınlar diye yazılı:

- **Kavram nesnesinin @tag'i.** K19'da iki kaval piksel piksel ölçüldü: aynı dört pirinç halka
  aynı yerlerde, aynı delik kümeleri, boy farkı %3'ün altında. K18'deki duvar kavalı ve
  K22'deki çift de aynı imalat. Filmin tek fikri buna bağlıydı ve ayakta kaldı.
- **Kumaş taşıyıcıda yazı** — K40 "HER KÜLTÜR DEĞERLİ" ketende doğru çıktı. Yasa "bezde harf
  erir" diyordu; gergin, düz ve masaya yapışık yazıldığında erimedi. Yasak mutlak değil,
  **gerginlik koşullu.**
- **32 harflik tek yazı** — K51 tuttu. NB2'nin "4+ kelimede kayar" sınırı KELİME değil
  YÜZEY sınırıymış: tek yüzey + büyük punto + sensöre paralel olunca 32 harf sorun değil.
- **El kareleri** — S4'ün yedi el karesinde gövdesiz kol sıfır, parmak anatomisi 7/7 temiz.
  "İnsan koy, kol koyma" kuralı promptta uygulandığında kusur doğmuyor.
- **Sekans ajanı** — S3'ün dokuz karesinin dokuzu tek geçişte temiz çıktı; sekans başına tek
  ajan süreklilik kusurunu (aynı kaval üç karede) yakalayabildi.
