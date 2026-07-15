# PHASE 3 — Command & Manual Production Runtime

**Tarih:** 2026-07-15
**Kapsam:** Canonical command export, protocol/artifact lifecycle, Claude/Codex adapters, gerçek-frame runtime ve cross-platform runner
**Builder verdict:** **PASS — fresh bağımsız audit PASS**

## Sonuç

Phase 3 artık Studio'nun canonical `mamilas.command.v2026` çıktısından gerçekten başlayabilen,
tek-rol/tek-artifact ilerleyen ve metadata iddiası yerine gerçek frame baytını doğrulayan manuel
runtime'dır:

`pre-author command → ayrı storyboard approval → Image Author → Image Jury → gerçek frame import + Mami verdict → Frame Jury → Motion Author → Motion Jury`

Legacy `mamilas.production.v2026` runner tarafından non-runnable kalır. Harici generation API,
batch, upscale pipeline, provider API veya kendini sürdüren ajan loop'u eklenmedi.

## Kapatılan kritik kusurlar

- **Lifecycle chicken-and-egg kapandı.** Timeline command export'u artık prompt/final-shot
  evidence'ından önce `commandAuthoringReadiness` ile açılır. Production readiness prompt receipt +
  final shot approval şartlarını korur. Runtime storyboard onayını bunlarla karıştırmaz; ayrı
  `mamilas.storyboard-approval.v1` workspace receipt'i yazar.
- **Executable context tamper kapandı.** Her scene için minimum Image Author context'i + motion
  engine dialect/window `sceneContextHashes` ile mühürlenir. Runtime exact `MamiDirectives`,
  WorldPacket physics, on-screen-text lock, shot projection, continuity ve engine context'i yeniden
  hash'ler. Image Author'ın ilk `inputArtifactHashes` girdisi bu context hash'idir.
- **Runtime→Studio command kimliği sabitlendi.** Matching prompt receipt taşıyan Image Author
  çıktısı decision override sayılmaz; pre-author commandId prompt import, final shot approval ve QA
  re-export boyunca aynı kalır. Gerçek Mami el override'ı veya stale/mismatched receipt ise hâlâ
  commandId'yi değiştirip eski evidence'ı kapatır.
- **Gerçek-frame kapısı gerçek oldu.** `--import-frame` PNG/JPEG/WebP baytını Sharp ile tam pixel
  decode eder; SHA-256, width/height/aspect ve byte size'ı kendisi hesaplar. Header-only, kesik ve
  zorunlu palette chunk'ı eksik sahte PNG evidence üretemez. Receipt current command,
  storyboard ve PASS Image Author artifact hash'ine bağlıdır. Her dry-run dosyayı yeniden okuyup
  byte/hash/dimension bağını doğrular; sonradan değişen frame motion'u kapatır.
- **Boş hash'li artifact yolu kapandı.** Image Author prompt + promptHash + exact directive
  receipts + locks/suppression/risks; Motion Author current frameHash + inventory + prompt/hash;
  her jury PASS dahil evidence taşımak zorundadır. Role/phase/provider/revision/content şeması ve
  content/input hash zinciri post-session yeniden doğrulanır.
- **Çok sahneli scheduler düzeldi.** `--scene` yokken source sırasındaki ilk tamamlanmamış scene
  seçilir; COMPLETE ilk sahne runtime'ı artık orada kilitlemez.
- **Gerçek role context tamamlandı.** Frame/Motion juries approved shot'u; Motion Author/Motion
  Jury current local frame path'ini ve canonical engine dialect/usable-window verisini alır. Audit
  secondary polish'i de kapatıldı: jury/motion rollerine raw source'lu full baseDecision yerine
  minimum roleDecision slice'ı, Motion'a ayrı continuity özeti verilir.
- **Provider parity kuruldu.** Claude ve Codex aynı protocol, role, context, artifact template ve
  post-session validator yüzeyini kullanır. Provider non-zero exit başarısızdır; custom workspace
  SESSION path'i absolute verilir.
- **Exact LIVE_CHAT round-trip kapandı.** Runtime exact UTF-8 directive dosyasından source command'i
  mutasyona uğratmadan yeni canonical commandId/context hash'leri türetir. PASS Image Author→Jury
  zinciri `mamilas.image-artifact-bundle.v1` olarak command ile birlikte Studio'ya döner; Studio aynı
  command'i yeniden üretmeden prompt receipt yazmaz. Exact directive Project Pack round-trip'ında
  korunur; text/id/command/artifact tamper fail-closed olur.
- **Role-minimum context hizalandı.** Jury/Motion rollerine raw source içeren tüm baseDecision yerine
  commandId/locks/engine/mode/creative controls/delivery promise projection'ı verilir; Motion Author
  current frame, engine ve continuity taşır.
- **Legacy bypass görünürlüğü kapandı.** Timeline'daki doğrudan `Copy Final Brief` üretim yolu
  kaldırıldı; `agents/README.md` eski packet/GPT/Claude dokümanlarını açıkça non-runnable ilan eder.
- **Role manifest tek lifecycle'a döndü.** Command role listesi legacy
  `idea/image/motion/suno/proof` yerine runtime'ın gerçek
  `image_author/image_jury/frame_jury/motion_author/motion_jury` rollerini taşır.

## Gerçek runtime kanıtı

`src/core/commandRuntime.test.ts` Node child-process ile gerçek `scripts/mamilas-command.mjs`
çalıştırarak şunları kanıtladı:

1. Prompt öncesi command dry-run `AWAIT_STORYBOARD_APPROVAL` döndürdü.
2. Hash'li storyboard approval sonrası sıradaki tek rol `image_author@0` oldu.
3. Claude ve Codex interactive stub oturumlarının her biri exactly-one doğru role/provider artifact
   yazdı; runtime çıkışta artifact'i yeniden doğruladı.
4. Directive, WorldPacket ve on-screen-text mutasyonları provider açılmadan reddedildi.
5. Hash'li `content:{}` Image Author artifact'i structural validation'dan geçemedi.
6. Gerçek PNG/JPEG/WebP import'u full decode + byte SHA-256 + dimensions + APPROVE receipt üretti;
   PASS Frame Jury sonrası Motion Author açıldı ve engine/continuity context'i taşıdı.
7. Workspace'teki PNG baytı değiştirildiğinde runtime frame'i stale/tampered sayıp motion'u kapattı.
8. İki sahneli command'de tam COMPLETE scene 1 atlandı; scene 2 `image_author@0` seçildi.
9. Header-only ve PLTE'siz indexed PNG reddedildi; gerçek PNG, JPEG ve WebP tam decode edildi.
10. LIVE_CHAT-derived command + Author/Jury bundle Studio ve Project Pack'e aynı command kimliğiyle
    döndü; düz prompt, duplicate/tampered artifact ve stale directive id reddedildi.

## Çalıştırılan kapılar

- Focused protocol/runtime/docs/launcher/Studio/Project Pack suite: **9 dosya · 117/117 PASS**.
- TypeScript: `npx tsc --noEmit` → **PASS**.
- Full Vitest: **67 dosya · 1888/1888 PASS**.
- Production build: `npm run build` → **PASS**.
- Full Playwright: **15/15 PASS**; gerçek Studio browser akışında pre-author `Komut JSON` prompt
  receipt'inden önce enabled, production prompt/frame/motion gate'leri korunmuş durumda.
- Runtime syntax: `node --check scripts/mamilas-command.mjs` ve runner → **PASS**.
- Runner mirrors: `git diff --no-index --exit-code agents/runner.mjs agents/production/runner.mjs`
  → **byte-identical PASS**.
- Windows/macOS launcher'lar değişmedi ve ince kabuk olarak `runner.mjs` çalıştırmaya devam ediyor.

Build'in yaklaşık 1.96 MB ana chunk uyarısı yeni Phase 3 kırığı değildir; convergence ledger'daki
mevcut `P1-S01` maddesidir.

## Dürüst görsel durum

**implementation complete / visual validation pending** — bu faz gerçek frame byte/evidence
kapısını kanıtladı; üretilecek yaratıcı karenin estetik hükmü yalnız Mami'nin gerçek frame
verdict'idir.
