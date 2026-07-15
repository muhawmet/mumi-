# MACRO 4 — Manuel Storyboard Studio + shot approval + tek readiness

**Tarih:** 2026-07-15 · **Uygulayıcı:** Claude Opus 4.8 · **Plan:** MACRO 4

## Kullanıcı açısından çalışan akış

Mami storyboard'daki her shot'ı Timeline'da onaylar/reddeder; ajanın yazdığı final prompt'u o
shot'a geri yükler. Onay o karara (commandId = brief hash) bağlanır; karar değişince onay bozulur.
Üretim paketi TEK gate'li yoldan (QA) çıkar ve Mami tüm shot'ları onaylamadan açılmaz. Eski
gate'siz export yolu ve sidebar kapı-atlaması kapatıldı. Konuşan Disco karakterleri ekrandan
kaldırıldı; Mami tek Yönetmen deneyimi görür.

## Değişen dosya grupları

- `src/store/useStudioStore.ts` — `ShotApproval` tipi + `shotApprovals` state + `approveShot`/
  `rejectShot`/`clearShotApproval`/`importAgentPrompt`/`currentCommandId` aksiyonları.
  **TEK canonical readiness** `productionReadiness()` (source→recipe→storyboard→blocker→shot
  approval, tek gerçek). Karar değişince (`clearGeneration`/`STALE_GENERATION`) onaylar temizlenir;
  persist'e `shotApprovals` eklendi. `applyAgentPrompt` (MACRO 3) UI'ya bağlandı.
- `src/pages/Timeline/TimelineStep.tsx` — gate'siz "⬇ Üretim Paketi" düğmesi KALDIRILDI (duplicate
  export kapatıldı). Sahne detayına `ShotAuthoringPanel`: ajan-prompt geri-alım (yapıştır) + Mami
  onay/ret + stale rozeti. Ölü `setSceneOverride`/`proofDoctor`/`buildProductionExport` importları
  temizlendi.
- `src/pages/QA/QAStep.tsx` — export gate'i **tek canonical `productionReadiness`'e** bağlandı
  (birincil kapı); Disco `exportGateStatus` teknik lint İKİNCİL nötr validator olarak korundu.
  Footer readiness-birincil: shot onayı eksikken üretim düğmesi yerine "Mami onayını bekliyor".
- `src/components/ProductionPulse.tsx` — ayrı `productionPulse` skoru + 26-ses Disco persona
  (`evaluateInnerVoices`) KALDIRILDI; tek canonical readiness'in düz durum satırı + gate'li
  "sonraki adım" (`advance()`).
- `src/components/Layout/AppLayout.tsx` — sidebar kapı-atlaması kapatıldı: geri/ziyaret serbest,
  ileri atlama her ara adımın `advance()` kapısından sırayla geçer. `ThoughtDock` (konuşan-karakter
  toast'ları) mount'u kaldırıldı.
- `src/components/PreviewStage.tsx` — sahte `agentBrief.includes('Status: PASS')` string sniff'i
  KALDIRILDI; "Onay" satırı tek canonical readiness'ten (N/N onaylı).
- `src/components/WorldPlate.tsx` — archetype görseline "STİL ARKETİPİ · gerçek kare değil"
  dürüstlük rozeti (46 world → az sayıda statik görsel; sahte "bu senin karen" izlenimi kalktı).
- `src/components/RecipeRail.tsx` — ödünç IP portresi (`kim_kitsuragi` / "CASE LEDGER" persona
  alıntısı) KALDIRILDI; faydalı SEMANTIC DIFF nötr "KARAR DEFTERİ" başlığıyla korundu.
- `src/store/shotApproval.test.ts` — yeni: shot approval + tek readiness + stale davranışı (8 test).
- `e2e/smoke.spec.ts` — MACRO 4 assertion'ları: shot authoring paneli + ProductionPulse readiness
  gerçek tarayıcıda görünür.

## Korunan invariant'lar

- Faydalı teknik lint (Disco PROMPT SURGEON hex/triad/motion-klon) nötr validator olarak KALDI.
- Mevcut source/world/ref/palette davranışı, beat planner, undo, vault — dokunulmadı.
- Site prompt yazmaz: ShotAuthoringPanel ajanın metnini geri ALIR, üretmez.

## Gerçek çıktı (gerçek tarayıcı — E2E smoke)

- **smoke 10/10 PASS.** Timeline'da sahne üretiliyor; "Sahne 1 seç" → ShotAuthoringPanel
  ("AJAN FINAL PROMPT · SHOT ONAYI" + "ONAY BEKLİYOR") görünür; ProductionPulse "shot onay
  bekliyor" + "READY" (tek canonical readiness). Screenshot: Preview'de "STİL ARKETİPİ · gerçek
  kare değil", "BRIEF STATUS · Onay 0/5 onaylı" (sahte PASS gitti), sol altta "85% READY".
- E2E beat-planner/scene-smoke/aquarium **4/4 PASS**.

## Test sonucu

`npx tsc --noEmit` → 0 · `rtk proxy npx vitest run` → **1906 geçti / 0 kaldı (62 dosya)** ·
`npm run build` → OK · E2E → smoke 10/10 + diğer 4/4.

## Açık risk / dış bağımlılık

- QA footer'ın export düğmesi mevcut typewriter akışının SONUNDA görünür (readiness gate mantığı
  doğru; görünüm zamanlaması QAStep'in eski persona akışından miras). ProductionPulse'ta readiness
  her an görünür, bu yüzden Mami hiçbir zaman kör kalmıyor.
- Görsel kare kalitesi Macro 8'de Mami'ye ait; bu macro UI davranışını (onay/gate/readiness)
  kanıtlar, kare hükmü vermez.
