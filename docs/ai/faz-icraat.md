# AKTİF FAZ — İCRAAT (uykuda)

> **Bu profil şu an YÜKLENMİYOR.** İnşa bitince `CLAUDE.md`'deki import satırı
> `@docs/ai/faz-insa.md` → `@docs/ai/faz-icraat.md` olur. İki dosya da repoda kalır.

İcraat fazında iş **video üretmektir**, sistem inşa etmek değil. Mami konuyu getirir, ajan
prompt yazar, Mami basar, ajan denetler, kurgu kiti teslim edilir.

## Oturum açılışı — bu sırayla

1. `agents/PROMPT-YASASI.md` — **birinci sırada.** Prompt yazmadan önce okunur; ezberden yazılmaz.
2. `artifacts/decision-pipeline-implementation/EXECUTION_STATE.md` — hangi video nerede kaldı.
3. `agents/COMMAND-INBOX/` — hangi command JSON'lar bekliyor. **Mami'ye hangisi diye sor**,
   sessiz seçme.

## Bu fazın yürütmesi

| Ne zaman | Ne çalışır |
|---|---|
| Yeni video başlarken | `/mamilas-enzim` — 4 kilit kapanmadan prompt yazılmaz |
| Prompt yazarken | `/mamilas-director` — yasa + engine lehçesi + command JSON |
| Prompt yazıldıktan sonra | `node scripts/prompt-lint.mjs <_PROMPTLAR.txt>` — eksik slot kalmasın |
| Mami kareleri atınca | `/mamilas-denetim` — sekans başına bir ajan, tek geçiş |
| Klip geldiğinde | `node scripts/motion-qc.mjs <klip>` — videonun kendisi denetlenir |
| Yeni referans eklerken | `/mamilas-ref` |
| Video bitince | Kapanış hasadı: ders adayları + dünya kusurları + yapısal karne |

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
`_REFERANSLAR` → `_PROMPTLAR` → `revize.txt` → `_MOTION` → `_EDIT-PLAN` + `_SESLENDIRME` + `_SUNO`.
Biten ders `Biten/<Ad>/` altına taşınır. Kaynak command JSON'a dokunulmaz.

Tam biçim ve slot şablonları: `agents/PROMPT-YASASI.md` §2-§5.

## Faz kapanışı

Her biten video **kapanış hasadı** bırakır: `prompt-lint` yapısal karnesi · `revize.txt`'ten ders
adayları · dünyaya yazılan kusurlar. Aday `agents/lessons/CANDIDATES-*.md`'ye düşer; `APPROVED.md`'ye
**yalnız Mami taşır** — otomatik promote yok, çöp ders sistemi zehirler.
