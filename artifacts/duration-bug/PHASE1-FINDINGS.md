# Süre hesabı bug — Phase 1 bulguları (2026-07-24)

**Belirti (Mami):** "Seslendirme 5 saniye sürecekken bana 12 saniye üret diyor videoyu."
Site ingest sonrası bir sahnenin üretim süresi, gerçek VO'ya (~5s) değil bir yere şişiyor.

## Kanıt (ölçüldü, tahmin değil)

- **VO süre formülü DOĞRU:** `brain.ts:1059 estimateSec = max(3, kelime/2.35 + 1.5)`.
  Kuvvet JSON: 9 kelime→5.3s, 24 kelime→11.7s — kelime sayısıyla tutarlı, VO-eşleşen.
- **`durationSec` her yerde doğru** taşınıyor: `TimelineStep.tsx` (308/359), `productionExport.durationSec`,
  `agentProtocol.ts:345/423/483 shot.durationSec`. Hepsi ~5.3s (12 değil).
- **12 = kling motorunun penceresi** (`engineUsableSec(kling_3)=12`), ayrı kavram. Doğru hesaplanıyor.
  Şu üç yerde "pencere" etiketiyle geçiyor:
  - `brain.ts:1082` duration mesajı: `~5.3s · kling_3 temiz penceresinde (12s)`
  - `agentProtocol.ts:494` motion author context: `usableSeconds: 12`
  - `productionExport.ts:69` `engineWindowSec: usable(12)` · `:192` "final hold'u engine window'dan yaz"
  - agentBrief: `motion → kling_3 (12s clean window)`

## Kodda "5s VO için 12s üret" diyen NET yer BULUNAMADI

12 her yerde "motorun tavanı" olarak geçiyor, üretim hedefi olarak değil. Belirtinin doğduğu
**tek yüzey** Mami tarafından pinpoint edilmeli (screenshot / hangi ekran-metin).

## Leading hipotez

Motion/üretim tarafı klip uzunluğunu **VO `sec` (5.3s) yerine engine window (12s)** üzerinden
kuruyor olabilir (motion context'te `usableSeconds:12` + "rest is held" ritmi → 5.3s VO'yu 12s'e
padler). Doğrulanırsa fix: klip hedefi = `sec` (VO), window yalnız TAVAN/split-eşiği kalır.

## Sıradaki adım (Phase 1 bitmedi)

Mami "12 saniye üret" ifadesini NEREDE gördüğünü göstersin (site ekranı mı, Kling'e yapıştırınca mı,
duration mesajındaki "(12s)" mi). O tek yer bulununca kök neden kesinleşir → Phase 2/3/4.
**Kör fix YOK** ([[mamilas-bul-sec-onar]]).
