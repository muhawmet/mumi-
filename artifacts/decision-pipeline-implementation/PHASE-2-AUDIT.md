# PHASE 2 — Independent Audit

**Tarih:** 2026-07-15
**Kapsam:** Yalnız Studio Application, UX & Evidence State
**Verdict:** **PASS — C-01 ve S-01 kapatıldı**

## Resolution re-audit

### C-01 CLOSED — Prompt receipt artık authoring kararına gerçekten bağlı

İlk audit'te eski ajan prompt receipt'inin karar değişikliğinden sonra yeniden current evidence gibi
kullanılabildiği doğrulandı. Düzeltme semptomu değil kimlik kökünü kapattı:

- `promptSourceCommandId`, Image Author'a sunulan karar/storyboard kimliğini üretirken authored
  prompt, prompt receipt ve frame receipt alanlarını çıkarıyor; böylece prompt import'u kendi kaynak
  kimliğini değiştirmiyor, gerçek karar/storyboard değişikliği ise değiştiriyor
  (`src/store/useStudioStore.ts:216-224`).
- `hasCurrentAgentPrompt` artık metin eşitliği + prompt SHA-256 yanında
  `receipt.fromCommandId === promptSourceCommandId` şartını da zorunlu tutuyor
  (`src/store/useStudioStore.ts:204-213`). Canonical readiness aynı helper'ı current prompt-source
  kimliğiyle çağırıyor (`src/store/useStudioStore.ts:336-369`).
- Prompt import receipt'i doğrudan `currentPromptSourceCommandId()` ile yazılıyor; `approveShot`,
  `importFrame` ve `setFrameVerdict(APPROVE)` eski receipt'i store seviyesinde reddediyor
  (`src/store/useStudioStore.ts:1277-1305`, `1320-1335`, `1362-1381`).
- `motionGate` prompt-source kimliğini ayrı girdi olarak alıp frame/approval karar bağından önce
  current prompt'u doğruluyor (`src/store/useStudioStore.ts:297-319`). Timeline, QA,
  ProductionPulse ve PreviewStage call-site'ları aynı current kimliği geçiriyor.
- Closeout `promptCurrent` hesabı receipt'in `fromCommandId` alanını current prompt-source kimliğiyle
  karşılaştırıyor; stale prompt artık current frame/approval olsa bile `APPROVED_FRAME` olamıyor
  (`src/core/projectPack.ts:394-419`).

Hedefli unit regresyonu karar A'dan B'ye geçince readiness'in `prompt` aşamasına döndüğünü, eski
receipt ile `approveShot`'ın reddedildiğini ve yalnız B için yeniden prompt import edildikten sonra
onayın açıldığını ölçüyor (`src/store/shotApproval.test.ts:87-114`). Browser regresyonu da gerçek
Timeline akışında karar değişimi sonrası motion'u kapalı, eski prompt için `Onayla`yı disabled buluyor;
aynı metin yeni prompt-source kimliğine yeniden import edilince onay açılıyor
(`e2e/smoke.spec.ts:416-437`). İlk audit'teki yeniden bağlama yolu artık üretilemiyor.

### S-01 CLOSED — Görünür navigation CTA'ları canonical kapıya döndü

- Brief alt CTA'sı doğrudan `setCurrentStep` yerine `advance()` çağırıyor
  (`src/pages/Dashboard/DashboardStep.tsx:348`); boş topic/source gate davranışı store ile aynı.
- RecipeRail'in “SONRAKİ EN İYİ HAMLE” düğmesi de `state.advance()` kullanıyor
  (`src/components/RecipeRail.tsx:73`); recipe/scenes ara adımlarını doğrudan Timeline'a atlamıyor.
- Sidebar'ın ileri yönü zaten her ara adımda `advance()` çalıştırıp kapı tutulduğunda duruyor
  (`src/components/Layout/AppLayout.tsx:124-139`).

## Bağımsız kanıt

- Targeted resolution Vitest: **4 dosya · 45/45 PASS**
  (`shotApproval`, `frameGate`, `projectPack`, `appLayoutSteps`).
- Targeted real Chromium: `Reference DNA complete E2E workflow` **1/1 PASS**; bu senaryo gerçek
  prompt import → shot approval → PNG frame upload/hash/dimensions → Mami APPROVE → Project Pack
  round-trip → karar değişimi/stale reject → re-import akışını kapsıyor.
- Builder'ın güncel geniş kapıları karşı-okundu: TypeScript **PASS**; full Vitest
  **66 dosya · 1875/1875 PASS**; production build **PASS** (bilinen büyük bundle uyarısı dışında);
  full Playwright **15/15 PASS**. Bu tur geniş kapıları gereksiz yere yeniden çalıştırmadı; kritik
  düzeltmenin hedefli unit ve browser kanıtı bağımsız olarak yeniden üretildi.

## Secondary

Phase 2'yi tutan yeni critical veya secondary bulgu yok. Yaklaşık 1.96 MB ana bundle uyarısı önceki
`P1-S01` convergence ledger maddesidir; bu düzeltmenin yeni regresyonu değildir.

## Sonuç

Former C-01'in prompt-source command identity zinciri readiness, shot approval, frame/motion ve
closeout boyunca current kimliğe bağlandı; former navigation bypass'ları canonical `advance()` yoluna
döndü. Phase 2 **PASS**. Görsel hüküm değişmez:
`implementation complete / visual validation pending`.
