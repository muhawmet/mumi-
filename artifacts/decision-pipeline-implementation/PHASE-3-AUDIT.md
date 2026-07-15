# PHASE 3 — Fresh Independent Audit

**Tarih:** 2026-07-15
**Kapsam:** Command & Manual Production Runtime
**Denetçi rolü:** Salt-okunur; ürün kodu değiştirilmedi
**Nihai verdict:** **PASS**
**Görsel durum:** **implementation complete / visual validation pending**

## Sonuç

İlk fresh audit dört kritik evidence/lifecycle kırığı buldu ve builder PASS'i geri çekti. Builder
düzeltmelerinden sonra aynı exploitler bağımsız olarak yeniden çalıştırıldı. Ayrı storyboard receipt,
full-pixel frame decode, exact `LIVE_CHAT` canonical identity ve runtime artifact → Studio → Project
Pack dönüş zincirleri artık fail-closed çalışıyor. Yeni kritik kırık veya yeni test kırığı bulunmadı.

Phase 3 şu lifecycle'ı gerçek canonical command ve hash-valid artifact'lerle taşıyor:

`pre-author command → ayrı storyboard approval → Image Author → Image Jury → gerçek frame + Mami verdict → Frame Jury → Motion Author → Motion Jury`

Legacy `mamilas.production.v2026` non-runnable kalıyor. Harici generation API, batch, upscale pipeline,
provider API veya ajan loop'u eklenmedi.

## İlk kritik bulguların resolution re-audit'i

### C-01 — Storyboard approval bypass: **CLOSED**

İlk exploit, Studio final shot approval veya command JSON'a sonradan eklenen unhashed
`lifecycle.shotApprovals` ile `AWAIT_STORYBOARD_APPROVAL` kapısını geçebiliyordu.

Resolution:

- `scripts/mamilas-command.mjs:301` yalnız `.mamilas/approvals/<scene>.json` workspace receipt'ini
  kabul ediyor.
- Receipt commandId, storyboardHash, sceneContextHash ve kendi contentHash'ine bağlı.
- Final Studio shot approval artık runtime storyboard approval yerine kullanılmıyor.

Bağımsız negatif probe:

```text
shotApprovals: {}                         → AWAIT_STORYBOARD_APPROVAL
yalnız lifecycle.shotApprovals[1] eklendi → yine AWAIT_STORYBOARD_APPROVAL
hash-valid workspace approval             → image_author@0
```

### C-02 — Header/metadata tabanlı sahte frame: **CLOSED**

İlk runtime 24-byte PNG header'ından width/height okuyup frame receipt yazabiliyordu. İlk kısmi PNG
parser düzeltmesi de zorunlu `PLTE` chunk'ı olmayan 67-byte indexed PNG'yi kabul etmişti.

Resolution:

- `scripts/mamilas-command.mjs:266-280` Sharp `metadata()` ile formatı sınırlar ve ardından
  `raw().toBuffer()` ile tam pixel decode'u zorunlu kılar.
- Yalnız full-decode edilebilir PNG/JPEG/WebP kabul edilir; 100M pixel input limiti vardır.
- Runtime import ve her sonraki dry-run stored frame byte'ını yeniden decode eder; SHA-256,
  byteSize, width/height/aspect ve prompt artifact bağı tekrar ölçülür.

Bağımsız negatif probe:

```text
24-byte signature/IHDR header             → REJECT
CRC-valid fakat PLTE'siz 67-byte indexed PNG → REJECT: corrupt header
stored frame byte mutation                → REJECT / motion kapalı
```

Targeted gerçek decode testi Sharp ile 2×1 JPEG ve WebP'yi, ayrıca gerçek PNG'yi import edip doğru
dimensions/verdict receipt'i üretti. PASS Frame Jury öncesi motion açılmadı; current frame bağı
bozulduğunda tekrar kapandı.

### C-03 — Exact `LIVE_CHAT` / scene directive ingest yokluğu: **CLOSED**

Resolution:

- `--add-directive-file <utf8> --scope PROJECT|SCENE [--scene <id>]` exact dosya text'ini
  değiştirmeden alır.
- Directive id exact source/scope/sceneId/text canonical hash'inden türetilir.
- Yeni directive source command'i yerinde bozmaz; yeni baseDecision, commandId ve per-scene context
  hash'leri olan yeni canonical command üretir, eski approval/artifact zincirini stale bırakır.
- Runtime validator SITE projection'ı ve deterministik LIVE_CHAT id/shape/scope/scene bağını ayrı
  doğrular; text veya id mutation fail-closed olur.

Bağımsız probe:

```text
exact leading/trailing whitespace/newline preserved → true
new commandId != source commandId                    → true
new command dry-run                                  → AWAIT_STORYBOARD_APPROVAL
directive text mutation + re-hash attempt            → REJECT: id stale/tampered
```

### C-04 — Runtime artifact → Studio/QA hash zinciri düşmesi: **CLOSED**

Resolution:

- `--export-image-bundle --scene <id>` yalnız PASS Image Author→Jury zincirinden
  `mamilas.image-artifact-bundle.v1` üretir (`scripts/mamilas-command.mjs:409,585`).
- Bundle canonical command ile bütün image author/jury artifact'lerini taşır.
- Studio `src/store/useStudioStore.ts:260-366` command'i current Studio kararından yeniden üretir;
  protocol/decision/storyboard/context/input/content hashes, role/revision zinciri, final jury PASS
  ve exact directive receipts'i doğrular.
- Düz prompt paste evidence sayılmaz. Duplicate/tampered/stale artifact reddedilir.
- LIVE_CHAT-derived bundle exact directives'i Studio `liveMamiDirectives` state'ine alır;
  yeniden üretilen commandId runtime commandId ile aynıdır. Shot approvals directive değişiminde
  temizlenir.
- `src/core/projectPack.ts` live directives'i manifest-bound decision state'inde taşır; export→import
  sonrası aynı directive, command identity ve motion gate sonucu korunur. Manifest yeniden
  hesaplanmış olsa bile stale/tampered directive id reddedilir.

Bağımsız gerçek bundle incelemesi:

```text
schema                         mamilas.image-artifact-bundle.v1
bundle.command.commandId       source commandId ile aynı
commandId/baseDecision hash    valid
artifact roles                 image_author@0, image_jury@0
iki artifact contentHash       yeniden hesaplandı / valid
jury input[1]                  author.contentHash ile aynı
```

Focused Studio ve Project Pack testleri runtime-derived LIVE_CHAT command + author/jury bundle
importunda `liveMamiDirectives`, regenerated commandId, prompt receipt ve Project Pack round-trip'ını
korudu; düz/tampered bundle ve stale directive id'yi reddetti.

## Diğer doğrulanan Phase 3 kanıtları

- Timeline command exportu prompt receipt/final shot evidence'dan önce
  `commandAuthoringReadiness` ile açılıyor; QA aynı `buildCommandJSON` canonical schema/identity yolunu
  kullanıyor.
- Receipt-bound Image Author prompt importu commandId ve sceneContextHashes kimliğini sabit tutuyor;
  stale `fromCommandId` ve gerçek Mami manual override kimliği değiştiriyor.
- Image Author minimum context site scaffold promptunu taşımıyor; WorldPacket physics, compatible ref,
  palette-as-light, exact directive, shot, on-screen lock, engine ve continuity girdileri context
  hash'ine bağlı.
- Artifact role/phase/provider/decision/storyboard/input/content hash zinciri tamper ve stale evidence'ı
  reddediyor. Jury vocabulary yalnız `PASS | REJECT | FACT_REQUIRED`.
- İlk REJECT yalnız revision 1 açıyor; ikinci REJECT `FACT_REQUIRED` ile loop'u durduruyor.
- Frame receipt current command/storyboard/PASS image prompt artifact hash'ine ve gerçek stored byte'a
  bağlı. Motion yalnız current real frame + Mami `APPROVE` + PASS Frame Jury sonrası açılıyor.
- İki sahneli scheduler COMPLETE ilk sahneyi atlayıp source sırasındaki ikinci tamamlanmamış sahneyi
  seçiyor.
- Claude ve Codex exactly-one interactive stub oturumları aynı protocol/context/template/validator
  yüzeyinde doğru role/revision/provider artifact'i üretiyor; provider non-zero exit başarısız.
- Legacy `mamilas.production.v2026`, corrupt JSON ve ambiguous multiple command fail-closed.
- `agents/runner.mjs` ile `agents/production/runner.mjs` byte-identical; Windows/macOS launchers ince
  kabuk ve runner yeni directive/frame/bundle argümanlarını taşıyor.

## Çalıştırılan fresh kapılar

```text
npx vitest run
  src/core/commandRuntime.test.ts
  src/core/agentProtocol.test.ts
  src/core/commandExport.test.ts
  src/core/canonicalDecision.test.ts
  src/core/runnerGate.test.ts
  src/core/docsContract.test.ts
  src/store/commandAuthoringReadiness.test.ts
  src/store/shotApproval.test.ts
  src/core/projectPack.test.ts
→ 9 dosya, 117/117 PASS

npx tsc --noEmit                                      → PASS
node --check scripts/mamilas-command.mjs              → PASS
node --check agents/runner.mjs                        → PASS
runner mirror git diff --no-index --exit-code         → PASS
npm run build                                          → PASS
```

Build'in yaklaşık 1.97 MB ana chunk uyarısı Phase 3 resolution kırığı değildir; mevcut convergence
ledger maddesi olarak kalır.

## Secondary bulgular ve resolution

Bu denetçi `FINAL-CONVERGENCE-LEDGER.md` dosyasını değiştirmedi.

- **S-01 — RESOLVED / Role-minimum context:** `scripts/mamilas-command.mjs:484-521` içindeki
  `roleDecision` projection'ı Image/Frame/Motion rollerinden raw source içeren tüm `baseDecision`'ı
  çıkardı; yalnız commandId, locks, engine, mode, creativeControls ve deliveryPromise taşıyor.
  Motion Author ve Motion Jury artık explicit continuity özeti alıyor. Bağımsız gerçek
  `CONTEXT.json` probunda `rawSource`/source slice yoktu; continuity, current frame path ve engine
  vardı. Post-PASS focused recheck: commandRuntime + docs **46/46 PASS**, TypeScript ve runtime syntax
  PASS. Nihai verdict değişmedi.
- **S-02 — RESOLVED / Builder receipt test sayıları:** `PHASE-3-COMMAND.md:83-85` resolution
  kanıtıyla hizalandı: focused suite **9 dosya · 117/117 PASS**, full Vitest
  **67 dosya · 1888/1888 PASS**. Audit ile builder receipt arasında açık sayı drift'i kalmadı.

## Nihai hüküm

Phase 3 kapsamında bilinen kritik kırık veya yeni test kırığı kalmadı: **PASS**.

Gerçek yaratıcı karenin estetik hükmü test veya agent artifact'iyle verilemez. Bu nedenle dürüst ürün
durumu: **implementation complete / visual validation pending**; son görsel verdict Mami'nindir.
