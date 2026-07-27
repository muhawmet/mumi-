# AKTİF FAZ — İCRAAT

> **Bu profil AKTİF (2026-07-28).** İnşa bitti ve `CLAUDE.md`'deki import bu dosyaya çevrildi.
> İnşa profili silinmedi, uykuya geçti: `docs/ai/faz-insa.md`. Yeni bir duvar gerekirse oraya
> dönülür — ama icraat fazında duvar kurmak **işi ertelemenin kılık değiştirmiş halidir.**

İcraat fazında iş **video üretmektir**, sistem inşa etmek değil. Mami konuyu getirir, ajan
prompt yazar, Mami basar, ajan denetler, kurgu kiti teslim edilir.

**Nihai hedef: Upwork portfolyosu.** Üretilen her iş bir portfolyo parçasıdır, deneme değil —
*"bunu bir müşteriye gösterir miyim"* her kararın kıstasıdır.

## Oturum açılışı — bu sırayla

1. `agents/PROMPT-YASASI.md` — **birinci sırada.** Prompt yazmadan önce okunur; ezberden yazılmaz.
   **§0.5 register** (REAL/EDU/STY) · **§2R** REAL start-frame · **§3R** REAL motion.
   Hangi register'da çalıştığını bilmeden kare yazma — EDU'nun "sıcak mat ten"i REAL'de o
   dünyanın kendi negatifini ihlal eder.
2. `artifacts/decision-pipeline-implementation/EXECUTION_STATE.md` — hangi video nerede kaldı.
3. `agents/lessons/APPROVED.md` — Mami-onaylı ders bankası. Boşsa hiçbir şey olmaz.
4. `agents/COMMAND-INBOX/` — hangi command JSON'lar bekliyor. **Mami'ye hangisi diye sor**,
   sessiz seçme.

## Bu fazın yürütmesi

| Ne zaman | Ne çalışır |
|---|---|
| Yeni video başlarken | `/mamilas-enzim` — 4 kilit kapanmadan prompt yazılmaz |
| Prompt yazarken | `/mamilas-director` — yasa + engine lehçesi + command JSON |
| Prompt yazıldıktan sonra | `node scripts/prompt-lint.mjs <dosya> --register=real|edu|sty` — eksik slot kalmasın |
| Mami kareleri atınca | `/mamilas-denetim` — sekans başına bir ajan, tek geçiş |
| Klip geldiğinde | `node scripts/motion-qc.mjs <klip>` — videonun kendisi denetlenir |
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
- **Kare kalitesinin son hükmü Mami'nindir.** Ajan hazırlar, karar vermez.

## Teslim seti

`agents/COMMAND-INBOX/<Ad>/` altında, hepsi `.txt`, prompt blokları `-----` ayraçlı:
`_REFERANSLAR` → `_PROMPTLAR` → `_revize` → `_MOTION` → `_EDIT-PLAN` + `_SESLENDIRME` + `_SUNO`.
Biten ders `Biten/<Ad>/` altına taşınır. Kaynak command JSON'a dokunulmaz.

Tam biçim ve slot şablonları: `agents/PROMPT-YASASI.md` §2-§5.

## Faz kapanışı

Her biten video **kapanış hasadı** bırakır: `prompt-lint` yapısal karnesi · `revize.txt`'ten ders
adayları · dünyaya yazılan kusurlar. Aday `agents/lessons/HASAT-*.md`'ye düşer (makine çıktısı; elle yazılan aday dosyaları `CANDIDATES-*`); `APPROVED.md`'ye
**yalnız Mami taşır** — otomatik promote yok, çöp ders sistemi zehirler.
