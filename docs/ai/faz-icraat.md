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
| Yeni video başlarken | `node scripts/current-work.mjs baslat "<proje>"` + `/mamilas-enzim` — 4 kilit kapanmadan prompt yazılmaz |
| **Kilitler kapanınca** | **Referans envanteri** (`PROMPT-YASASI` §4a) — tekrar eden her şey `_REFERANSLAR.txt`'e; tek kare yazılmadan önce |
| **Prompt yazmadan ÖNCE** | `node scripts/dunya-kilidi.mjs <worldId>` — STYLE/LIGHT/NEGATIVE kuyruğunu **bas ve yapıştır**. Elle yazma: ölçüldü, aynı dünyada dört lehçe doğdu (Kütle'nin ilk 8 karesi 81-91 kelime, kalan 27'si 23-30; `overscale` 8/8 → 0/27) |
| Prompt yazarken | `/mamilas-director` — yasa + engine lehçesi + command JSON |
| **Prompt yazıldıktan sonra, BASMADAN ÖNCE** | `node scripts/prompt-lint.mjs <dosya> --register=real\|edu\|sty` — 71 revizenin ~44-52'si burada, kredi yakmadan kesiliyor. KIRMIZI = kanıtlı eksik · SARI = ajan baksın · KAPSAM = yeşilin kapsamadığı |
| Mami kareleri atınca | `/mamilas-denetim` — sekans başına bir ajan, tek geçiş |
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
  çoğu iş çıkışında aceleyle üretildi ve hatalı. "Sıfır revize" kusursuz demek değildir. Altın
  standart **Eşeyli ve Eşeysiz Üreme**. Eski işe *"bunlar hatalı, ne bozuk?"* gözüyle bakılır —
  iyi olan zaten göze çarpar.
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
