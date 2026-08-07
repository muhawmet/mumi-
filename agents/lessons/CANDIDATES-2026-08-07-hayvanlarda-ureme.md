# DERS ADAYLARI — 2026-08-07 · Hayvanlarda Üreme turu

> Mami (aynı gün): *"sen ürettin, karışmadım bile, çok derslik bir şey de olmadı."* Doğru.
> İlk hasat 13 maddeydi ve yarısı **benim yazım hatalarım ve alet kusurlarımdı** — onların yeri
> ders bankası değil, kodun içi; hepsi oraya girdi (`sahne-metni.mjs`, `kare-cek.mjs`,
> `prompt-lint` notu, `MUST-DO-KUYRUK`). Bankaya yalnız **sistemin yeteneğini değiştiren** şey girer.
> Geriye bunlar kaldı.

---

### 1 — 🔴 AHŞAP LEVHA YOK. Ekrandaki yazı, o sahnenin KENDİ malzemesinden doğar
Mami: *"ahşap yok, sahnede ne varsa uyumlu — kemik yazıyorsa kemikten yaptığın gibi yaratıcı ol,
her sahnede yaratıcı ol."* Teslim edilen sette 11 TEXT satırının hepsi ahşap levha/plaka/tebeşir
diyordu. Çevrildi ve hiçbiri diğerine benzemiyor: su altında çakıl · yuvada buğday · ahır
zemininde saman · güğümün tozuna parmakla · taş basamakta tüyler · ıslak taşta kelebek pulu ·
ıslak silt. Asılı levha aramak, kavramı taşımak için *gerçek kamerayla çekilebilecek bir nesne*
aramaktır — `PROMPT-YASASI §0`'daki gerçek-video refleksi.
⬜ onayla · ⬜ reddet

### 2 — 🔴 MEKÂN SÜREKLİLİĞİ ÜRETİMDE KURULUR, REVİZEDE DEĞİL
Mami: *"araba bir yere park ettiyse, hikâye diğer sahnede de oradaysa aynı yere koymaya
çalışıyorsundur zaten ilk başta üretirken."* Yani süreklilik bir denetim maddesi değil, **yazım
anındaki bir sorumluluk**: bir nesne bir kareye konduğu an, o dünyada nerede durduğu kilitlenir
ve sonraki karelerde aynı yerde yazılır. Yanlış çıkarsa revize odur — ama revize fazı bunu
*aramak* için açılmaz.
⬜ onayla · ⬜ reddet

### 3 — SÜREKLİLİK BİR EŞİKTİR, İSİM LİSTESİ DEĞİL
Mami: *"her şeyde de 2-3'ten fazla görünüyorsa devamlılık olur — kediyse `@kedi` diye üretiriz;
sonra bir videoda kedi lazımsa onu kullanırsın."* Karakter, hayvan, nesne, mekân fark etmez:
**3+ tekrar eden her öğe element olur.** Element **1:1**, sahne **16:9**. Raf projelerden birike
birike büyür ve **cüzdan üstüdür** (aynı `@ad` iki hatta birden yaşayabilir).
⬜ onayla · ⬜ reddet

### 4 — "props 10-15% overscale" ÖLÇEK HİYERARŞİSİNİ YIKIYOR
Karede çocuk + hayvan + bina varken bu cümle her şeyi çocuğun boyuna şişiriyor: tavuk gövdesi
kadar, sepet göğsü kadar, beş adım ötedeki kedi kafası kadar → "her şeyi eşit anlatan oyuncak
şehir". Cümle silinip **göreli ölçek** yazılınca (tavuğun sırtı dizine gelir · sepet baldırından
yüksek değil) maket hissi tek denemede gitti.
**Kural adayı:** overscale yalnız karakter/hayvan bulunmayan prop karelerinde geçerli.
⬜ onayla · ⬜ reddet

### 5 — MİKRO SAHNEDE İHTİŞAM MİMARİ ÖLÇEKTEN GELİR
Mami: *"dull, hiç ihtişamlı değil."* Altın standarda bakıldı (`Hücre` K45, kloroplast): orada
hücre bir nesne değil, ufka giden bir **şehir**. Mikro kare üç şeyle kurtuldu: kahraman form
**arazi/gezegen** gibi girer, yüzeyi ufka kıvrılır · arkada **aynı türden bir dizi** uzağa gider ·
**tek renk rejimi + tek vurgu**. Nesneyi büyütmek değil, dünyayı derinleştirmek.
⬜ onayla · ⬜ reddet

### 6 — 🔴 KAMERA HAREKETİ TÜRÜ SEKANS İÇİNDE DÖNER
Mami: *"kamera hep slowly push in vibeında, haberin olsun."* Üç klibin üçü aynı hareketle
basılmıştı. Sebep: temiz-klip reçetesi kamera **güvenliğini** anlatıyor, **çeşitliliğini** değil.
Havuz: yavaş push in · yavaş pull out (sekans kapanışı) · birkaç santim yanal · **kilitli**
(vuruş anı) · hafif yerleşme. Aynı hareket arka arkaya ikiden fazla karede kullanılmaz.
Kilitli kamera kusur değil, ritmin nefesi — L/J kesim yasasının motion'daki karşılığı.
⬜ onayla · ⬜ reddet

### 7 — İKİ ÖLÇÜLMÜŞ KLING SINIRI
· **Ağız negatifini dinlemiyor.** `talking, mouth opening, lip movement` negatifte açıkça yazılıydı,
  ağız yine oynadı. Çözüm negatifte değil **kare tasarımında**: konuşmayacak karakter profilden
  ya da uzaktan kadrajlanır, ağız kadrajın hâkim noktasında bırakılmaz.
· **Kalabalık sürüyü klip sonuna kadar koruyamıyor.** K11'de sperm sürüsü sonda eridi. Çok sayıda
  küçük ve benzer nesne içeren kareler **4-5 sn kısa** tutulur ya da sürü uzakta bırakılır.
⬜ onayla · ⬜ reddet

### 8 — TEMİZ KLİP REÇETESİ DOĞRULANDI (üç klipte üç kez)
Karmaşık uzuv hareketi YOK · mikro jest VAR (toz, tüy, tek nefes, pençe gerinmesi) · düşük
genlikli kamera. `kare-cek` cetveli üçünde de donma bulamadı (komşu kare farkı 13.6–16.9,
eşik 0.6). Artık tahmin değil, ölçüm.
⬜ onayla · ⬜ reddet
