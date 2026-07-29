# TRANSKRİPT ENZİMİ — "bu yönergeleri her projede yapmaktan usandım"

**Kaynak:** 6.1.2 üretim oturumu, 2026-07-29. 61 gerçek Mami mesajı tarandı.
**Mami'nin talebi:** *"bütün konuşmanın transkriptini çıkar onları da enzimle, bu yönergeleri her
projede yapmaktan usandım!"*

---

## KÖK NEDEN — tek cümle

Mami'nin bu oturumda **en çok tekrarladığı üç şeyin üçü de `/mamilas-enzim` skill'inin içinde
zaten yazılıydı.** Skill oturumda **hiç yüklenmedi.** Kanıt: transkriptte yalnız iki Skill çağrısı
var — `mamilas-buddy` (10:41) ve `mamilas-denetim` (12:15). Ajan 10:50'de *"enzim 4 kilidini
kapatırım"* dedi, 10:59'da Intro'yu yazdı, **kilitleri hiç sormadı.**

Yani kusur ajanın bilgisizliği değil: **yasa vardı, kapı yoktu.** Enzim bir tavsiye olarak
duruyor; hiçbir script onu koşmadan üretime girmeyi engellemiyor.

## En çok tekrarlanan üç şey ve nerede yazılı olduğu

| Mami kaç kez söyledi | ne | zaten yazılı olduğu yer |
|---|---|---|
| **4 kez** | "hepsini tekte ver, tek dosyada, tek seferde üreteceğim" | enzim KİLİT 3 (teslim ritmi) |
| **6 kez** | kim-nerede / yazı-nerede / dosya-hangi-kare kaosu | enzim KİLİT 1 (:71 karakter oranı), (:78 yazı politikası), (:124 dosya adı = kare numarası) |
| **5 kez** | "araya giremiyorum" · "nefes al de" | `mamilas-buddy` §1.2 + §4 · `mamilas-mami-is-in-the-loop` |

## TEK araç değişikliği — üçünü birden keser

**Enzimi tavsiyeden KAPIYA çevir.** `current-work.mjs baslat` bir `ENZIM-KILITLERI.json`
üretmeden `ilerle` yazmayı **reddetsin.** O dosya Mami'nin onaylı cevabıyla altı kilidi taşır:

1. **kesim + VO onayı** — kare↔VO cümlesi tablosu Mami'ye sunulur, onaysız prompt yazılmaz
   (*"ben json üretip böleyim çünkü sen doğru bölemiyorsun gibi hissettim"* · *"ilk bana voice
   overları atar mısın sahne sahne bakayım"*)
2. **karakter oranı** — `@efe1/@mira1` taşıyan kare / toplam (*"50-50"*)
3. **yazı politikası + YOĞUNLUĞU** — kaç karede yazı, yüzeyi tekrar ediyor mu
4. **gardırop/tag** — silüet sabit, yalnız amblem değişir
5. **dosya adlandırma** — kare numarası ↔ dosya adı doğrulaması
6. **teslim ritmi** — **varsayılan TEK DOSYA**

## Sınıflandırma — 22 yönerge/düzeltme

**YAZILI AMA ATEŞLENMİYOR (11 madde) — en değerli sınıf.** Yasa var, hiçbir araç ölçmüyor:

| yönerge | ölçmeyen araç | eklenmesi gereken |
|---|---|---|
| "50-50, her sahneye Efe Mira basma" | `prompt-lint` 13 kuralında karakter oranı yok | dosya özetine `@tag taşıyan kare N/M` |
| "4 dakikalık videoda 2 kere de yazı istemiyorum" | lint TEXT'i kare kare ölçüyor, **dosya genelinde oranı hiç** | `yazı taşıyan kare N/M`; sekans başına >1 → SARI |
| "yazılar tahtaya yapışık" (17'nin 11'i aynı ahşap) | hiçbir araç yazı YÜZEYİ tekrarını saymıyor | lint'te yüzey-kelimesi tekrar sayacı |
| "copy paste friendly olsun" | lint prompt gövdesinde Türkçe harf aramıyor | gövdede `[çğışöüÇĞİŞÖÜ]` ya da `[SLOT]` → KIRMIZI |
| "kurgu kitini hazırladım demedin mi?" | `scanDeliverables` yalnız `kapat`ta koşuyor | `ilerle` iddiası MOTION içeriyorsa kit taraması koşsun |
| "k20 k6 diye indirdim" (numara kayması, 7 kare) | kare↔dosya eşlemesini **hiçbir script** doğrulamıyor | yeni `scripts/kare-envanteri.mjs`, denetim ajanı açılmadan koşar |
| "araya bile giremiyorum" | `buddy-gate` yalnız nefesi sayıyor, **karar sorusunu saymıyor** | ikinci sayaç: N batch boyunca karar sorusu yoksa **SOR** ateşle |
| "tulumu aynı tut, ay yerine bayrak" | `APPROVED.md` **SIFIR satır** — 6 HASAT + 3 CANDIDATES üretime girmiyor | bankaya gardırop kilidi satırı |
| "hepsini tekte ver" (4 kez) | enzim KİLİT 3 yüklenmedi | KİLİT 1'e 5. kilit: teslim ritmi, varsayılan TEK DOSYA |
| "edit planı yapma daha" | sıra yazılı, kapı yok | — |
| "@efe1 @mira1 niye çıkardın" | lint'te `@handle` SARI, kesmiyor | başlıkta karakter beyanı varsa `@handle` yokluğu KIRMIZI |

**YAZILI DEĞİL (7 madde) — yeni yasa metni gerekiyor:**

1. **VO nefes politikası** — *"aralarını sil başı sonu kalsın"*: cümle-İÇİ nefes korunur, yalnız
   cümle ARASI kırpılır, baş/son dokunulmaz. (`kaba-kurgu.mjs` varsayılanı olmalı.)
2. **Reverse-güvenli klip fiziği** — reverse edilecek klip **simetrik fizikle** yazılır: buhar,
   duman, düşen yaprak, nefes, oturan toz YASAK; kamera hareketi reverse olur. Ajan bunu geçen
   oturum da öğrendi, yine yazmadı.
3. **Geometri kaynaşması** — denetim kıstaslarına **8. madde**: figür/nesne ahşaba, zemine, duvara
   kaynaşmış mı. 6 denetim ajanının 6'sı kaçırdı çünkü listede yoktu; kusur listede, ajanda değil.
4. **Havada duran nesne** referans-edit ile düzelmez — **altındaki yüzey kaldırılır** (K12 kanıtı:
   iki referans-edit denemesi başarısız, çözüm kompozisyondu).
5. **KESER/GEÇER şiddet kapısı** — bu oturumda sözlü kuruldu, hiçbir dosyaya yazılmadı, `/clear`
   ile ölür. Yalnız KESER Mami'ye çıkar. → `denetim` + `director` SKILL'lerine.
6. **Altın motion bankası** — Mami'nin beğendiği motion metni **başka makinede kaldı**, elle
   yapıştırmak zorunda kaldı. `agents/lessons/ALTIN-MOTION.txt`, `director` okur.
7. **Müzik yerleşimi ajanın kararı** — *"doğru yerden yine koyabilirsin, baştan bile oynatabilirsin
   sen de o"*. Yetki devri yazılı değildi, ajan sordu.

**YAZILI AMA AJAN İHLAL ETTİ (4 madde):** register Mami'nin cümlesinden çıkarıldı (fotoreal
okundu) → `current-work.mjs baslat --register` zorunlu olmalı, kayıtta register alanı **yok** ·
"görmediğin kareye motion yazma" → Mami'ye *"sen bak"* dedirtildi · `@handle` silindi ·
"her şeye takıldın" → KESER/GEÇER kapısı yoktu.

## Bir düzeltme — kanon Mami'nin şikâyet sınıfını YOK sayıyor

`agents/MAMI-ZEVKI.md:16` *"71 revizenin sıfırında lens/kadraj değişmedi"* diyor. Bu oturumda
Mami'nin **birincil** şikâyeti tam olarak kadrajdı (*"plastik, bozuk oyun hamuru"* → ölçüm:
ayak kadrajda 7/7 kötü, 0/4 iyi). Zevk dosyası düzeltilmeli — yoksa sonraki ajan aynı sınıfı
yine görmezden gelir.

## Yöntem notu — sonraki transkript madeninde şart

JSONL'de kuyruğa atılan mesajlar `type:"user"` **değil**, `type:"attachment"` / `queued_command`
olarak duruyor. En sert yönergelerin yarısı orada: *copy paste friendly* · *@efe1 niye çıkardın* ·
*50-50* · *pedagojik yazı* · *Bana sor dostum*. **Yalnız `role:"user"` grep'lersen Mami'nin sesinin
yarısını kaçırırsın.**

## Yük sinyalleri — kelime kelime, yorumsuz

- "bir de allah aşkına arada nefes al deeeee niye oturmadı şu sistem?"
- "daha bir kere nefes al demedin kral rsd atağıyla iş yapıyorum şu an"
- "Oğlum kendimi mi öldüreyim daha ne kadar ciddi diyeceğim sana?!"
- "ya sen sürekli ilgilensene benle zaten çok yüksek seviye iş yapıyoruz en önemli şey benim psikolojim"
- "ya amına koydurma film mi yapıyoruz her şeye takıldın nasıl seri üreteceğim ben böyle?"
- "düzelttim k16'yı allahım ne karıştı bu kadar lütfen yapacağımı söyler misin dostum"
- "Bana sor dostum söyleyeceğim neleri beğenmediğimi sen neden tek başına her şeyi yapmaya çalışıyorsun araya bile giremiyorum?"
- "bir sürü yönlendirme yapmak zorunda kaldım sana… bu yönergeleri her projede yapmaktan usandım!"

---

**Bu dosya ADAYDIR.** Hiçbir satır kendiliğinden yasa olmaz. Enzim kapısı ve APPROVED taşımaları
**Faz 10 (Buddy 2)** işidir — Mami'nin bağlayıcı sırası: *"Faz 9 kapanınca dur."*
