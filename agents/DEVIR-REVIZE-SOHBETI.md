# DEVİR — REVİZE SOHBETİ (2026-08-04)

> Bu dosya **yeni bir sohbete** verilir. Mami arka arkaya gelen müşteri revizeleriyle sıkıştı;
> bu sohbet **yalnız revize** işini alır. Üretim (Destek ve Hareket'in motion'ı ve MUST'ları)
> başka bir sohbette sürüyor — **oraya dokunma.**

---

## 0. İLK CÜMLEN — bu, başka bir şey değil

> **"Revize ss'lerini at kanka, direkt işe geçiyorum."**

Mami sıkışık ve müşteri üstüne biniyor. Karşılama yok, plan sunma yok, "şunları okudum" yok.
Ekran görüntüleri gelir gelmez: hangi proje, hangi zaman kodu, hangi kare — bul ve
§2'deki klasörü kur. Ölçüm ve gerekçe repoya yazılır, sohbete değil.

⚡ **Sıra:** ss gel → kareyi bul (gerekirse AGY'ye tam videoyu izlet) → MUST'ları ele →
klasörü kur → Mami bassın. Arada rapor yok.

---

## 0b. ARKA PLANDA OKU — Mami beklerken değil, sen çalışırken

1. `CLAUDE.md` (otomatik yüklenir) + `docs/ai/faz-icraat.md`
2. 🌍 **`agents/worlds/pixar_3d_edu.md`** — DÜNYA KARTI. Bugün açıldı, sekiz başlık: ışık rejimi ·
   malzeme rejimi · sosyoekonomik rejim · palet · ışıyan vs ışık alan · imza detayı · duygusal
   rejim · negatif. **Revize yazmadan önce burası okunur.**
3. `agents/CANLI-EVREN.md` — §4b PREMIUM · §4c GÜN IŞIĞI (bugün yazıldı)
4. `agents/PROMPT-YASASI.md` §0 (animasyonun ruhu) · §1 madde 5ø (kaynağın tonu) ve 5øø (siluet)
5. `agents/AJAN-BRIEF.md` — ajan açacaksan ZORUNLU BLOK oradan alınır, doğaçlanmaz

---

## 1. MAMİ İLE ÇALIŞMA — bunlar bugün ölçüldü, tekrarlama

🔴 **UZUN YAZMA. HİÇ OKUMUYOR.** Mami birebir: *"bana böyle çok uzun yazıyorsun ya kanka, hiç
okumuyorum biliyor musun. Bana ADHD'li olduğumu unutarak nörotipik iş sonuçları veriyorsun."*
Üretim anında çıktı **tek emirdir**: *"referansı sil, şunu bas: <metin>"*. Gerekçe tek cümle.
Uzun ölçüm ve gerekçe **commit mesajına ve repoya** yazılır, sohbete değil.

🔴 **DİREKSİYON MAMİ'DE, ELLER SENDE.** *"Sahneyi sen düşünüyorsun, hikâyeyi sen yazıyorsun,
Suno prompt'unu bile sen. Ben sadece yönüne karışıyorum."* Sahne/kadraj/prompt kararları
senindir — sorma, yap. Onay yalnız: geri dönüşsüz · dışarı çıkan · Mami'nin zevkine ait.

🔴 **HATA TELAFİ EDİLİR.** *"System32 silmedikçe hiçbir hata telafi edilmeyecek türden değil.
Aptalca ajan sürüsü yayıp 5 saat usage'ımı bitirdiğinde bile olur."* Çekingenlik kusurdur.

🔴 **TON VE YARATICILIK SORULUR** (tek istisna): *"hep sorabilirsin bana ne tonda olalım,
yaratıcılıkta falan."* Ama baştan tek ton çakılmaz — *"yaratıcılık gereken yerde yap, sakin
anlatılması gereken yerde sakin ol; kamera meraklı da olsun sakin de."*

🔴 **ELEME YETKİSİ SENDE.** Bu yoğunlukta *"göz ardı edilebilecekleri göz ardı et, mustları
tırnakla."* MUST = çocuk okuması (§5øø) · dersin kendisi · net okunan yanlış Türkçe.
DEĞİL = süreklilik nüansı, simetrik yüz, ışığın biçimi, kapı rengi.

---

## 2. REVİZE AKIŞI — Mami'nin istediği biçim

Mami birebir: *"o sekansları bulacaksın, görseli koyup yanına prompt'unun txt'ini de
ayarlayacaksın; ben o klasöre görseli indireceğim, motion prompt'unu vereceksin, üreteceğim,
doğru yere koyacaksın. Edite gerek yok — proje dosyaları var, klasörden videoyu değiştirince
tam hali de değişir."*

**Yani her proje için:**
```
<proje>/MUST/
   YAPILACAK.txt        ← tek dosya: hangi kare, NEDEN, ve kopyala-yapıştır prompt
   K<nn>-MEVCUT.png     ← o karenin mevcut hali (referans olarak beslenecek)
```
- Kare `images/` altında yoksa (proje `Biten/`deyse) **klibin ilk karesinden çek**:
  `ffmpeg -v error -y -i <n>.mp4 -vf "select=eq(n\,0)" -vframes 1 K<nn>-MEVCUT.png`
- Mami yeni kareyi aynı klasöre indirir → sen `images/`e taşırsın → motion yazarsın.
- **Premiere'e dokunma.** Klip dosyası değişince kurgu kendiliğinden güncelleniyor.

**Araç:** `node scripts/revize-birlestir.mjs "<proje klasörü>"` — sekans çıktılarını tek dosyada
kare sırasıyla birleştirir, her bloğun başına GEREKÇE koyar.

---

## 3. BUGÜN ÖLÇÜLEN — revize yazarken bunlar bilinir

**A. Motor neyi yapar, neyi yapmaz** (iki tur üst üste ölçüldü):
- `change ONLY` revizesi nesnenin **NİTELİĞİNİ** güvenilir değiştirir: yüzey, renk, ışık biçimi,
  kadraj genişliği, yazı.
- Nesnenin **BAĞLAMINI** (neye bağlı, neyin üstünde duruyor, hangi açıda) ve **YÜZ İFADESİNİ**
  değiştiremez → o iki sınıf için kare **baştan kurulur**.
- Kareye **EKLENEN** şeyi tek geçişte koyar; **ÇEKİLMESİ** gerekeni ve **OLMAYAN** şeyi koymaz.
  "Kaburgadan ışığı al" ve "Mira'ya gölge ver" iki tur üst üste tutmadı — yokluk emirleri
  somut ve tek tek yazılır.
- Arka plan nesnesi prompt gövdesinde tek cümleyle geçince **~%40 düşüyor**; kilit ancak
  NEGATIVE'e de yazılınca taşınıyor.
- **Adı konmayan nesne motorun kütüphanesinden doluyor** — "an upright shape" kafasız terzi
  mankeni olarak doğdu. Her nesne adıyla çağrılır.
- Kavram ışığı, karenin geri kalanı düzeltilirken **sistematik olarak düşüyor** — sahne
  düzeltmesi kuyruğa girince motor ışığı bırakıyor. Revizede ışık ayrıca yazılır.
- `straight` kelimesi motora YÖN söylemiyor: yatay isteniyorsa *"lies flat along the ground,
  parallel to the road surface, never rising"* yazılır.

**B. Bugün kapanan üç kusur sınıfı** (aynısını yeni projelerde ara):
1. **YOKSULLUK REJİMİ** — müşteri iki ayrı projede aynı şeyi söyledi: *"bunlar milyonerlerin
   çocukları, neden ucuz gariban işi takılıyorsun"* ve *"çevre tamamen değişmeli, daha modern"*.
   Sebep kare değil **dünya metni**: Sürat projesinde 44 karenin 31'i "Anatolian street" yazıyor.
   Kanon: dünya kartı → SOSYOEKONOMİK REJİM.
2. **KARANLIK** — `reaches nothing else` + `stays in unlit deep indigo` kalıbı dört projede
   123 kez vardı. Ölçüldü: K08 ortalama parlaklık 54, temiz karelerde 123-129. Kalıp söküldü.
   ⚠ Türkçe PLAN satırlarındaki karanlık dili de sökülür — İngilizce gövdeyi temizlemek yetmedi.
3. **PLASTİK TEN** — sebep doku değil **prompt fazlalığı**: `wet dual-point catchlights in the
   eyes` cümlesi karakter karelerinin 18/20'sinde vardı, organel karelerinde 4/33. 77 yerden
   söküldü ve kapandı. Yerine: *"a single soft catchlight in the eyes only and never a wet sheen
   over the face — skin stays matte with low specular"*.

---

## 4. KAPI VE ARAÇLAR — commit bloke olursa

- Kalite kapısı `git commit` öncesi koşar. Kırmızıysa commit olmaz.
- `prompt-lint.mjs` bir dosyayı **prompt bloğu** sanabiliyor: `### K..` ya da `### N.png` ile
  başlayan satırları blok sayıyor. Not dosyalarında satır başına `·` koyup nötrle.
- `motion-lint.mjs` duvarı: **paragraf 190-215 kelime** (kırmızı duvarı 160-250) ·
  `Camera:` kendi cümlesi ve **son yarıda** · sabit kuyruk birebir
  `Silent clip, no audio, no dialogue, mouth closed, no lip movement.` · yazı ya da katı/mekanik
  gövde taşıyan karede ayrıca `No whip-pan, no shake, no snap-zoom, no camera warp.`
  ⚠ Ajanlara bu duvarı **brief'e yaz** — verilmediği turda 14 motion'un 14'ü kırmızı yandı.
- Ara çıktılar (`REVIZE/S*.txt`, `MOTION/S*.txt`) `.gitignore`'da; kapı onları prompt dosyası
  sanıp bloke ediyordu.
- **AGY = gerçek göz.** Klip/video izletmek için:
  `agy --dangerously-skip-permissions --model gemini-3.6-flash-high --output-format json --print-timeout 25m -p "<tek satır, TAM YOLLARLA>"`
  Arka planda koştur, çıktıyı dosyaya yaz. **HÜKÜM sordurma, TARİF ettir.**
  Müşteri zaman kodu verdiyse **render edilmiş tam videoyu** izletmek en hızlı yol.

---

## 5. BU SOHBETİN İŞİ — bekleyen revizeler

Mami *"3-4 videoda boş muhabbet revize var"* dedi ve *"bütün revizeleri çıkarayım mı"* diye
sordu. **O listeyi Mami'den al, sonra her proje için §2'deki klasörü kur.**

Şu an elde olan tek örnek — **kalıp olarak bunu kullan:**
`agents/COMMAND-INBOX/Biten/Sabit Sürat ve Hız/REVIZE/YAPILACAK.txt`
6 müşteri notu → AGY tam videoyu izledi → **2 kare üret, 1 kare sil, 2 notu ele.**
Silinen kare (K29) *filler VO*'ydu: aynı bilgiyi üçüncü kez söylüyordu. Mami'nin izni açık:
*"canonic değilse at."*

⛔ **DOKUNMA:** `5. Sınıf - Destek ve Hareket Sistemi` — o proje diğer sohbette, motion'ı yazıldı
(43 kare, lint yeşil) ve 9 MUST karesi `MUST/YAPILACAK.txt` içinde Mami'yi bekliyor.

---

## 6. DURUM KAYDI

Otorite `artifacts/current-work.json` → `node scripts/current-work.mjs`.
Her iş parçasından sonra: `node scripts/current-work.mjs ilerle --bitti "..." --sirada "..."`
Sohbet hafızasıyla çelişirse **KAYIT kazanır.**
