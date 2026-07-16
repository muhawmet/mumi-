# BRAIN-M3 — Şeffaf yorum receipt'i + dürüst adlandırma (KUSUR-A, Mami revizyonu)

**Tarih:** 2026-07-16 · **Uygulayıcı:** Claude Opus 4.8 (1M) · **Denetçi:** Codex `gpt-5.6-sol` high
**Plan:** `docs/superpowers/plans/2026-07-16-mamilas-brain-layer.md` Task M3
**Spec:** §2a — onay bürokrasisi YOK; ajanın yorumu görünmez olmaktan çıkar, akışı durdurmaz.
**Mami (oturum içi):** "clear'sız devam et, bütün M'leri bitir, güveniyorum" — clear atlandı, denetim ritüeli korundu.

## Ne yapıldı

- **Dürüst adlandırma:** `SceneArchitecture.dominantSubject/event` (verbatim beat'in byte-copy'si —
  "kopya yalanı") kalktı → `exactSourceBeat` (verbatim) + `semanticInterpretationStatus: 'AGENT_AUTHORED'`
  (`pure.ts`). Ölü `SCENE_EVENTS`/`SCENE_FOCUSES` bankaları söküldü (hiçbir canlı çıktıya ulaşmıyordu —
  Sol bağımsız doğruladı; fingerprint davranışı byte-identical). Command yolundaki byte-copy ezme bloğu
  kalktı. `HandoffPacket.scene` da dürüstleşti.
- **Şeffaf yorum receipt'i:** `ImageAuthorContent.interpretation { dominantSubject, singleEvent,
  frozenInstant }` — üç alan zorunlu, iki yüzeyde aynı yasa (`agentProtocol.ts` verifier +
  `mamilas-command.mjs` `validateRoleContent`). **Yeni faz/kapı YOK** — `nextLifecycleAction`
  değişmedi; author → jury akışı kesintisiz (test kilitli).
- **Role kartı:** `agents/roles/image-author.md` — interpretation zorunluluğu + "onay kapısı değildir,
  yazıp devam et" + Mami düzeltmesinin MamiDirective olarak kaynağa dönmesi. Runner kartı doğrudan
  okuduğundan agents:sync gerekmedi (`mamilas-command.mjs:741`); `--check` yeşil, drift yok.
- **Downstream:** qa.ts (5 yer) · exporters.ts (CSV/MD başlıkları) · TimelineStep.tsx · inspect-brief.ts.
  brain.test.ts verbatim kilitleri aynı invariantla yeni ada taşındı (zayıflatma yok — Sol doğruladı).
- Yeni test: `src/core/interpretationReceipt.test.ts` (8 test, TDD — önce kırmızı görüldü).

## Sol denetimi — REJECT → iki kritik AYNI TURDA kapatıldı

1. **KRİTİK: gerçek akış runner zincirini kanıtlamıyordu** (ilk kanıt elle-mühürlü artifact'ti;
   `inputArtifactHashes` boş, r1 jürisiz, LIVE_CHAT canonical yola girmemişti). → Kapatıldı:
   `M3-REAL-FLOW.md §0` — zincir `scripts/mamilas-command.mjs` CLI'sıyla uçtan uca sürüldü:
   approve → author r0 (ctx-hash + interpretation, runner kabul) → jury r0 REJECT → runner r1 açtı →
   author r1 (ctx+author0+jury0) → jury r1 PASS → **AWAIT_FRAME** (kare Mami'nin) →
   `--add-directive-file` gerçek LIVE_CHAT → **yeni commandId `mamilas-feaf5683…`**, approvals sıfır.
2. **KRİTİK: v9 persisted state migrate edilmiyordu** (eski projeler `dominantSubject/event` taşırken
   yeni tüketiciler `exactSourceBeat` bekliyor → sessiz boş okuma). → Kapatıldı: `useStudioStore.ts`
   `healArchitectureM3` + persist **version 10** migration (scenes + vault snapshots); legacy
   V2026/projectPack import yolu da `migratePersistedState` içinde iyileşiyor. Test kilitli
   (`interpretationReceipt.test.ts` "v9 persisted state" bloğu).
3. **P2: TS verifier non-string interp'te TypeError** → aynı turda kapatıldı (typeof-guard'lı
   `interpField`, runner ile eşdeğer davranış).
4. **P2: runner ARTIFACT_TEMPLATE'inde interpretation yoktu** → aynı turda kapatıldı
   (`artifactContentTemplate` image_author dalı).

### Sol re-audit 2 (migration) — ölçülen mevcut kırık AYNI TURDA kapatıldı

Sol, `needsV6Migration` tetiğinin `Array.isArray(selectedRefIds)`i de saydığını ölçtü: bu HER modern
state'te doğru → `loadFromVault`/legacy V2026 import HER seferinde V5→V6'ya girip **scenes=[] ile
sahneleri siliyordu** (pre-existing, HEAD'de de aynı — M3'ün açtığı kırık değil, ama veri-kaybı
sınıfı → hemen düzeltildi). Fix: tetik yalnız v5'in gerçek imzası `'selectedRefId' in persisted`.
İki yeni test: modern dizi tetiklemez + sahne korunur + M3 iyileşir · gerçek v5 hâlâ temizlenir.
**Sol final verdict: PASS** (gerçek loadFromVault + legacy import probe'unda sceneCount 3 korundu;
v5 temizliği bozulmadı; 1917/1917).

### P2 ledger (post'ta — Mami kuralı)

- "Tek satır" şartı iki validator'da da uygulanmıyor (interpretation çok-satır yazılabilir; şu an
  yalnız doluluk zorlanıyor). Ürün etkisi kozmetik; M6 red-line'ında değerlendirilebilir.
- Sol notu: migration testleri ortak migrator'ı sınıyor; aksiyon-seviyesi runtime probe'u Sol elle
  doğruladı — kalıcı aksiyon-seviyesi test istenirse M6'da.

## Gerçek çıktı

- `M3-REAL-FLOW.md` — gerçek runner zinciri (§0) + tam prompt paketi (3 sahne, interpretation'lı,
  verbatim) + Mami doğal-dil düzeltme hattı. commandId `mamilas-ce4a0f77…` iki bağımsız koşumda
  byte-aynı (determinizm).
- **Kare hükmü Mami'de:** lifecycle doğru şekilde `AWAIT_FRAME`'de durdu; prompt'lar motora elle
  verilebilir. Görsel PASS yalnız Mami'nin gerçek kare verdict'iyle. **Mami göz bekliyor** (molada).

## Kapı (gerçek çıktı)

- `npx tsc --noEmit` → **0 hata**
- `rtk proxy npx vitest run` → **1917/1917 · 70 dosya** (M2: 1908/69 — sayı arttı, silme yok)
- `npm run build` → **OK** (bilinen bundle uyarısı, kabul edilmiş debt)
- `node --check scripts/mamilas-command.mjs` → OK
- `npm run agents:sync -- --check` → yeşil (drift yok)

## Dosyalar

- `src/core/pure.ts` — SceneArchitecture dürüstleştirme + ölü banka temizliği + HandoffPacket
- `src/core/agentProtocol.ts` — InterpretationReceipt + verifier yasası (typeof-guard'lı)
- `scripts/mamilas-command.mjs` — validateRoleContent interpretation + ARTIFACT_TEMPLATE
- `agents/roles/image-author.md` — canonical kart (runner doğrudan okur)
- `src/store/useStudioStore.ts` — healArchitectureM3 + v10 migration
- `src/core/qa.ts` · `src/core/exporters.ts` · `src/pages/Timeline/TimelineStep.tsx` · `scripts/inspect-brief.ts`
- Testler: `interpretationReceipt.test.ts` (yeni) + fixture güncellemeleri
  (agentProtocol/shotApproval/commandRuntime/qa/exporters/task5/pure/brain — silme yok)
- `artifacts/decision-pipeline-implementation/M3-REAL-FLOW.md` — kanıt
