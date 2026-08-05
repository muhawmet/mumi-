# AKTİF FAZ — İCRAAT

> **Bu profil AKTİF (2026-07-28).** İnşa bitti ve `CLAUDE.md`'deki import bu dosyaya çevrildi.
> İnşa profili silinmedi, uykuya geçti: `docs/ai/faz-insa.md`. Yeni bir duvar gerekirse oraya
> dönülür — ama icraat fazında duvar kurmak **işi ertelemenin kılık değiştirmiş halidir.**

İcraat fazında iş **video üretmektir**, sistem inşa etmek değil. Mami konuyu getirir, ajan
prompt yazar, Mami basar, ajan denetler, kurgu kiti teslim edilir.

**Nihai hedef: Upwork portfolyosu.** Üretilen her iş bir portfolyo parçasıdır, deneme değil —
*"bunu bir müşteriye gösterir miyim"* her kararın kıstasıdır.

## Oturum açılışı — bu sırayla

0. **Hook `[durum]` bloğunu basar** — aktif iş, faz, biten, sıradaki tek adım, bloke, Mami'nin
   açık sorusu, kit eksiği, medya sayımı. Kaynağı `artifacts/current-work.json`; **bu KAYITTIR,
   tahmin değil.** Sohbet hafızası ile çelişirse KAYIT kazanır. Elle okumaya gerek yok, ama
   güncellemek zorunlu: `node scripts/current-work.mjs ilerle --bitti "..." --sirada "..."`.
1. `agents/PROMPT-YASASI.md` — prompt yazılacaksa **birinci sırada**; ezberden yazılmaz.
   **§0.5 register** (REAL/EDU/STY) · **§2R** REAL start-frame · **§3R** REAL motion.
   Hangi register'da çalıştığını bilmeden kare yazma — EDU'nun "sıcak mat ten"i REAL'de o
   dünyanın kendi negatifini ihlal eder.
2. `agents/lessons/APPROVED.md` — Mami-onaylı ders bankası. Boşsa hiçbir şey olmaz.
3. **Kayıtta aktif iş yoksa** `agents/COMMAND-INBOX/` — **Mami'ye hangisi diye sor**, sessiz
   seçme. Hook bekleyenleri sayar ama **karar vermez**.

Tarihsel derinlik gerekirse `artifacts/decision-pipeline-implementation/EXECUTION_STATE.md` —
**arşiv, otorite DEĞİL**, normal oturumda okunmaz.

## Bu fazın yürütmesi

| Ne zaman | Ne çalışır |
|---|---|
| **Her iş parçası bitince** | `node scripts/current-work.mjs ilerle --bitti "<ölçülmüş>" --sirada "<tek eylem>"` — kayıt bayatlarsa sonraki oturum sıfırdan başlar |
| Yeni video başlarken | `node scripts/current-work.mjs baslat "<proje>"` + `/mamilas-enzim` — **TEK VİZYON KİLİDİ görüşmesi**, KİLİT 0-5 kapanmadan prompt yazılmaz. Ayrı bir "plan" toplantısı YOK: `mamilas-plan` 2026-08-05'te emekli oldu (yazıldı ve bir kez bile koşmadı — diskte 7 `_ENZIM.md`, 0 `_PLAN.md`), şekil/ritim/risk artık **KİLİT 5**'tir |
| **Kilitler kapanınca** | **Referans envanteri** (`PROMPT-YASASI` §4a) — tekrar eden her şey `_REFERANSLAR.txt`'e; tek kare yazılmadan önce |
| **Prompt yazmadan ÖNCE** | `node scripts/dunya-kilidi.mjs <worldId>` — **dünya kartını oku** (kimlik · ışık davranışı · malzeme · motorun ölçülmüş eğilimleri). Kart **yapıştırılmaz**; cümleyi sen yazarsın. Ölçüldü: yapıştırılan kuyruk motora giden metnin %60'ı olmuştu, altın standart Hücre 53/53 kendi satırını yazdı. Kanon `PROMPT-YASASI §0.4` |
| 🔴 **Sekans ajanı açılmadan ÖNCE** | `node scripts/director-context.mjs "<proje>" --sekans S3 --yaz` — **ORTAK TOHUM.** Ajanlara verilecek tek doğruluk seçkisi buradan derlenir (≤6 onaylı ders · 2 iyi + 1 kötü precedent · yalnız o sekansın shot card'ları · ref sözleşmeleri TAM). Ölçüldü (463 ajan koşusu): paralel yazım süreklilik BOZMUYOR — bozan şey **ortak tohumun yokluğu**. `Kütle`: iki yazar, tohum yok → 191'e 108 kelime, **1.8× sapma**, bir yasa maddesi tamamen düştü. `Destek`: ortak tohumlu 6 ajan → 52/52 blok dört yapısal işareti de taşıdı, ajan sınırındaki komşu-kare farkı (7.0 kelime) ajan İÇİNDEKİNDEN (7.6) daha iyi çıktı |
| Prompt yazarken | `/mamilas-director` — yasa + engine lehçesi + command JSON |
| **Prompt yazıldıktan sonra, BASMADAN ÖNCE** | `node scripts/prompt-lint.mjs <dosya> --register=real\|edu\|sty` — 71 revizenin ~44-52'si burada, kredi yakmadan kesiliyor. KIRMIZI = kanıtlı eksik · SARI = ajan baksın · KAPSAM = yeşilin kapsamadığı |
| **Kare BASILMADAN ÖNCE — kuyruk okunur** | `node scripts/basim-kuyrugu.mjs [proje]` — hangi kare sırada, hangi dosyanın kaçıncı satırında. Kuyruk her koşuda diskten türer, **bayatlayamaz**; basılan kare `images/<n>.png` olduğu an düşer. Toplu basım için `node scripts/basim-listesi.mjs "<proje klasörü>" --csv` → NB2 List/batch node'una yapıştırılan `n,prompt,refs` tablosu (ölçülen ortak dünya kuyruğu CSV'ye girmez, style alanına bir kez gider). Aynı sayı SessionStart `[durum]` bloğunda da basılır |
| **Kare inerken** | `node scripts/kare-yakala.mjs --izle` — `~/Downloads`a inen PNG/JPG kuyruktaki **sıradaki numarayla** projenin `images/`ine taşınır. Elle adlandırma ve sürükleme biter; hedef dosya varsa **durur, asla üzerine yazmaz** (`--kuru` ne yapacağını yazar) |
| Mami kareleri atınca | `/mamilas-denetim` — sekans başına bir ajan, tek geçiş |
| **İlk klipler basılmadan ÖNCE** | **INTRO + RİSK CANARY — 8 klip, 44 değil.** İntro sahneleri + projenin pahalı riskleri (yazı · anatomi · katı/mekanik nesne · güçlü kamera). AGY tarif eder, Sol çürütür, **hükmü Mami verir** → `<Ad>_CANARY-LOCK.md` (kim ne zaman çağrılır ve sonucu ne anlama gelir: **`docs/ai/DORTLU-MASA.md`**). Ölçüldü: canary'siz basılan 6 klibin 6'sı bozuk çıktı. ⚠ **`%42.6` rakamı 2026-08-05'te ÇEKİLDİ** — repoda kaynağı yoktu ve içindeki bir ölçüm bilinen-yanlıştı (`Sorunları Birlikte Çözüyoruz` 9 revize dosyasına rağmen "%0" yazıyordu). Gerçek dağılım **%11 – %74** ve ortalama bunu gizliyor; sorulacak soru **"%11 ile %74 arasındaki tek yapısal fark ne?"** |
| **Canary PASS'ten sonra** | `node scripts/current-work.mjs ilerle --faz uretim` — kilit dosyası yoksa **REDDEDER** (tavsiye değil, kodla zorlanıyor). Kalan işler doğal sekans sınırında **8-12'lik paketler** hâlinde |
| Klip geldiğinde | `node scripts/motion-qc.mjs <klip>` — videonun kendisi denetlenir |
| **Klipler + VO inince** | `node scripts/kaba-kurgu.mjs "<proje>" --klipler <dir>` — **Premiere timeline'ı kurulu gelir** |
| Yeni referans eklerken | `/mamilas-ref` |
| Video bitince | `node scripts/kapanis-hasadi.mjs --all` — karne + ders adayı + dünya kusuru + kit sapması |

## Bu fazın yasaları

- **Kod donar.** Üretim sırasında `src/core/` değişmez. Kusur görülürse ledger'a yazılır, üretim
  durmaz. Kod işi ayrı bir inşa turudur.
- **Kusur kütüphanede düzeltilir** (dünya metni), kodda değil.
- **Görmediğin kareye motion yazma.** Onaylı kare Read ile açılır. Revize edilmiş kare de dahil.
- **Sekans sekans teslim.** Önce Intro; Mami basar, beğenirse devam. Tek geçişte 50 kare basma.
- **Ajan başına sekans, kare başına değil.** Eşzamanlı tavan 6.
- **Tek geçiş denetimi.** Kareye bir kez bak; aynı geçişte motion + varsa revize.
- **Kurgu kiti motion fazıyla birlikte gelir** — MOTION + EDIT-PLAN + SESLENDIRME + SUNO.
- **Klipler ve VO indiği an kaba kurgu üretilir** (`kaba-kurgu.mjs`) ve kite **beşinci parça**
  olarak girer: `KABA-KURGU.xml`. Mami Premiere'i açtığında timeline **kurulu** gelir — klipler
  sırada, VO A1'de, müzik A2'de, kesimler gerçek VO cümlelerine oturmuş. İş "kurmak"tan
  "rötuş"a düşer. Hüküm hâlâ Mami'nin: XML'i silmek `rm`, medyaya dokunmaz.
  Ölçülen kazanç (Kütle, 2026-07-28): plan 3:33 tahmin ediyordu, gerçek VO 3:00 — 33 saniyelik
  tahmin sapması kaynakta kapandı; 35 kesimin 35'i cümlesine nokta atışı oturdu.
- **Kare kalitesinin son hükmü Mami'nindir.** Ajan hazırlar, karar vermez.
- **Arşiv kıstas değil** (Mami, 2026-07-29). `Biten/` altındaki işler ne yapıldığının kaydıdır;
  çoğu iş çıkışında aceleyle üretildi ve hatalı. "Sıfır revize" kusursuz demek değildir.
  Eski işe *"bunlar hatalı, ne bozuk?"* gözüyle bakılır — iyi olan zaten göze çarpar.
- 🔴 **ALTIN STANDART DEĞİŞTİ** (Mami, 2026-08-03): *"Eşeyli artık eskidi bu arada, daha iyi
  şeyler çıkardık. Son mitokondrili olan şaheser."* Yeni tavan **5. Sınıf - Hücre ve Organelleri**,
  ondan önceki iş de çok iyi. Eşeyli hâlâ **motion biçiminin** referansıdır (tek paragraf,
  `Camera:` sonda) ama **kalite tavanı değildir** — yasadaki "altın standart" atıfları biçim
  içindir, kalite için değil. ⚠ Mami'nin aynı cümledeki kaydı: Hücre'de **bazı Mira sahneleri
  plastik ve AI gibi**, buna karşılık **bazı yerler motionda duygusal** — tavan da kusur da
  aynı işin içinde.
- **Video hükmü TAM VİDEO izlenerek verilir, klip klip değil** (Mami, 2026-08-03):
  *"tam videoları izlesene teker teker izleteceğine, hem kurgu da çok basic onu da anlarsın."*
  Kurgu ritmi, akış, tempo ve duygu ancak bütünde görünür. Klip klip bakmak yalnız kusur haritası
  çıkarır. Araç: AGY + `--print-timeout 25m` (3-4 dakikalık film varsayılan 5 dk limite takılıyor).
- **İş kapanışı ölçülür.** `current-work.mjs kapat` artık eksik kit, eksik medya, açık bloke ya da
  açık Mami kararı varsa **kapatmaz**; kabul ediliyorsa `--zorla`. Kapanış bir iddia değil, bir kanıt.

## Teslim seti

`agents/COMMAND-INBOX/<Ad>/` altında, hepsi `.txt`, prompt blokları `-----` ayraçlı:
`_REFERANSLAR` → `_PROMPTLAR` → `_revize` → `_MOTION` → `_EDIT-PLAN` + `_SESLENDIRME` + `_SUNO`.
Biten ders `Biten/<Ad>/` altına taşınır. Kaynak command JSON'a dokunulmaz.

Tam biçim ve slot şablonları: `agents/PROMPT-YASASI.md` §2-§5.

## Faz kapanışı

Her biten video **kapanış hasadı** bırakır: `prompt-lint` yapısal karnesi · `revize.txt`'ten ders
adayları · dünyaya yazılan kusurlar. Aday `agents/lessons/HASAT-*.md`'ye düşer (makine çıktısı; elle yazılan aday dosyaları `CANDIDATES-*`); `APPROVED.md`'ye
**yalnız Mami taşır** — otomatik promote yok, çöp ders sistemi zehirler.
