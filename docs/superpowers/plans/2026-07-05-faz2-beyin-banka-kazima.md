# FAZ 2 — Beyin Banka-Kazıma + Claude'a Özne Devri Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site'nin sahne öznesi uyduran "konsept bankası" ailesini tamamen sök; sahne öznesi üretimini gerçek düşünen Claude'a (.command/eczacı) devret; ref DNA'yı Claude'a zengin ör (nöron-sync).

**Architecture:** Site yalnız "sinema dili çerçevesi" (world/palet/ref/kamera/negatif + verbatim kaynak beat) üretir; `buildImagePrompt` özne satırlarına somut içerik değil **Claude'a açık talimat** basar; `.command`/production sözleşmesi Claude'dan dominant-element + frame-aware motion ister. Banka çıktısını assert eden ~30+ test, yeni çerçeve-sözleşmesini doğrulayan testlere dönüştürülür (test silme yasak).

**Tech Stack:** Vite + React + TS + Zustand + Vitest + Playwright. Core: `src/core/{pure,brain,brain-data,commandExport,productionExport,engine}.ts`.

**Kaynak spec:** `docs/superpowers/specs/2026-07-05-beyin-banka-kazima-design.md` (ÖNCE OKU). Proje beyni: `CLAUDE.md`.

## Global Constraints

- **Model:** Beyin/core = Opus 4.8 (Fable dönerse Fable 5). İşçi alt-ajan Sonnet 5 SADECE mekanik/net-tarifli iş — **mimari/kök-fix ASLA** (bu planın çekirdeği mimari, ana loop yapar).
- **Test silme YASAK; sayı düşerse ALARM.** Banka testleri silinmez, dönüştürülür.
- **Gate (her commit öncesi):** `npx tsc --noEmit` 0 · `npx vitest run` yeşil · `npm run build` · `zsh -n agents/MOTION-CALISTIR.command && zsh -n agents/production/MOTION-CALISTIR.command`. `/mamilas-gate` skill'i koşar.
- **Checkpoint:** her task sonrası `/mamilas-checkpoint` (Termius crash-safe: commit + memory).
- **git:** iş-parçası başına ayrı commit, `git add` ile SPESİFİK dosyalar (asla `-A`). Push YOK.
- **Palet Translation Law:** ham hex prompt yoluna ASLA sızmaz. **On-screen text:** temiz plaka + VO (Mami 2026-07-05 kuralı, `deriveOnScreenText` korunur). **Mami AE bilmiyor:** post-prod varsayan çıktı yok.
- **Denetim dersi:** "yeşil gate ≠ doğrulandı"; gerçek `generateBatch` çıktısı GÖZLE okunur (`/mamilas-audit`), fixture değil.
- **Karar (spec'ten):** Özne devri = **(A) RADİKAL** — site özne UYDURMAZ, Claude sıfırdan yazar. `extractTurkishKeyterm` dar on-screen-text kapsamında KALIR. Nöron-sync + .command sözleşmesi tek adımda.
- **YÜRÜTME: HEP MULTİ-AJAN WORKFLOW (ultracode) — Mami emri "hep multiajan workflow açık halde!!"** Her task, `Workflow` tool ile fix ajanı + adversarial verify ajanı olarak yürütülür (FAZ 1'deki disjoint-grup + adversarial-verify deseni). Bu core-kritik iş olduğu için: ana loop = orkestratör (işi workflow'a böler, sonuçları sentezler, gate + commit'i TEK elden yapar); işçi ajanlar mekanik/net-tarifli parçaları yapar, mimari kararı ana loop verir. Solo elle fix yok.
- **"Final brief" tanımı (bu planın merkezî çıktısı):** `buildAgentBrief` (brain.ts) çıktısı = Claude'a (eczacı) giden **nihai birleşik brief/dossier**. Kalitesi + içine referansların (ref DNA/anchor) ve paletlerin (fiziksel ışık dili) nasıl işlendiği FAZ 2'nin ana kalite ekseni. Task 4 bunu örer, Task 5 kalitesini denetler.

---

## Dosya Haritası (neyin nerede değişeceği)

| Dosya | Sorumluluk / değişiklik |
|-------|-------------------------|
| `src/core/brain-data.ts` | Bankaları sil: `EDU_BANK, WATER_STAGES, EDU_FB, STY_BANK, STY_FB, REAL_BANKS, REAL_FB`. `DNA_MAP`, `SHOT_PATTERNS` verisi KALIR. |
| `src/core/brain.ts` | Sil: `EDU_SOURCE_BANK, REAL_SOURCE_BANKS, bankRank, conceptRanked, primeConcept, realConceptFamily, applyWorldTaboo`(banka-bağımlı kısım). `buildImagePrompt` özne satırlarını Claude-talimatına çevir. `dnaDirectives`/nöron-sync zenginleştir. `buildAgentBrief` ref verbatim DNA'yı Claude-özne bölümüne taşı. |
| `src/core/pure.ts` | `architectureFallbackConcept`'in özne-üretme rolünü sök (kaynak beat taşıma kalabilir). `generateBatch` özne akışını yeni çerçeveye bağla. `extractTurkishKeyterm`/`deriveOnScreenText` KALIR. |
| `src/core/commandExport.ts` | `commands.contract` → Claude "dominant element'i SEN yaz" + verbatim kaynak beat + ref DNA. |
| `src/core/productionExport.ts` | `agentContract`/`scaffold` → aynı sözleşme; "image_prompts already approved, copy verbatim" ifadesi "image brief — Claude özneyi yazar"a döner. |
| `agents/MOTION-CALISTIR.command`, `agents/production/MOTION-CALISTIR.command` | Kick metinleri yeni sözleşmeye hizalanır (Claude özne + frame-aware motion). |
| `src/core/brain.test.ts`, `pure.test.ts`, `qa.test.ts`, `probe_coverage.test.ts`, `motion_quality.test.ts` | Banka-çıktısı testleri → çerçeve-sözleşmesi testlerine dönüştürülür. |

---

## Task 0: Baseline kilidi + banka-izi haritası

**Files:** Test: (yeni) `src/core/faz2_baseline.test.ts` (geçici, Task 5 sonunda silinir DEĞİL — kalıcı regresyona dönüştürülür).

**Interfaces:**
- Produces: `hasBankResidue(prompt: string): boolean` — bir prompt'ta bilinen banka özne izleri (`leaf model`, `balance scale`, vb. örnek imzalar) var mı; Task 2 sonrası FALSE olmalı.

- [ ] **Step 1:** Baseline'ı yakala — mevcut gate'i koş, sayıları kaydet: `/mamilas-gate` (beklenen: tsc 0, vitest 507/507, build ✓). Bu sayı FAZ 2 boyunca **düşmez**, sadece testler dönüşür.
- [ ] **Step 2:** Gerçek çıktı örneği al (banka izini görmek için). `npm run workbench` veya `scripts/faz5-pilot.ts` koş; bir EDU + bir STY + bir REAL reçetesinin `generateBatch` çıktısındaki `Dominant element:` / `Motion seed:` satırlarını kaydet (bunlar Task 2 sonrası Claude-talimatına dönüşecek).
- [ ] **Step 3:** `hasBankResidue` yardımcısını yaz + failing test: şu an banka izi VAR (leaf model vb.), test `expect(hasBankResidue(realOutput)).toBe(true)` ile mevcut durumu belgeler.
- [ ] **Step 4:** Commit: `docs(faz2): baseline kilidi + banka-izi tespiti`.

---

## Task 1: `buildImagePrompt` özne satırlarını Claude-talimatına çevir (TDD)

**Amaç:** Site somut özne basmayı bıraksın; `Dominant element:` ve `Motion seed:` yerine Claude'a açık talimat + verbatim kaynak beat gelsin. Bankalar HÂLÂ yerinde (bu task izole edilebilsin) ama `buildImagePrompt` artık `concept.subject`'i somut basmaz.

**Files:**
- Modify: `src/core/brain.ts:838-869` (`buildImagePrompt`)
- Test: `src/core/brain.test.ts` (yeni describe: `buildImagePrompt — Claude özne devri`)

**Interfaces:**
- Consumes: `concept: { subject, event }` (şimdilik banka/fallback'ten), `ctx.sourceBeat: string` (verbatim kaynak — generateBatch'ten geçirilecek, Task 2'de bağlanır; bu task'ta parametreyi ekle).
- Produces: `buildImagePrompt` çıktısında `Scene brief (Claude yazar):` satırı = verbatim kaynak beat + "bu dünyada tek-kare somut sahneye çevir" talimatı; somut `concept.subject` prompt'a BASILMAZ.

- [ ] **Step 1: Failing test** — `brain.test.ts`:
```ts
it('image prompt somut banka öznesini basmaz, Claude talimatı taşır', () => {
  const p = buildImagePrompt(0, { subject: 'one oversized translucent leaf model', event: 'the leaf draws a water drop' }, camera, { ...ctx, sourceBeat: 'Işık yaprağa çarpınca fabrika çalışır.' });
  expect(p).not.toContain('one oversized translucent leaf model'); // site özne UYDURMAZ
  expect(p).toContain('Işık yaprağa çarpınca fabrika çalışır.');   // kaynak verbatim
  expect(p).toMatch(/Scene brief|Claude/i);                        // Claude talimatı
});
```
- [ ] **Step 2:** Koş, FAIL doğrula (şu an `Dominant element: one oversized...` basıyor).
- [ ] **Step 3:** `buildImagePrompt`'ta `Dominant element:`/`Motion seed:` üretimini değiştir: `sourceBeat` parametresi al; özne satırlarını `Scene brief (Claude yazar): "<sourceBeat>" — bu dünyanın diline sadık tek-kare somut sahneyi SEN yaz; dominant element ve motion seed'i buradan üret.` ile değiştir. `concept.subject`/`concept.event`'i prompt gövdesine BASMA.
- [ ] **Step 4:** Koş, PASS. Sonra `npx vitest run src/core/brain.test.ts` — banka-çıktısı assert eden ESKİ testler şimdi KIRILIR; bu beklenen (Task 3'te dönüşecek). Kırılanları not al, SİLME.
- [ ] **Step 5:** tsc 0 doğrula (yeni param). Commit: `feat(faz2): buildImagePrompt özne satırı → Claude talimatı + verbatim kaynak`.

---

## Task 2: Bankaları ve konsept motorunu sök; generateBatch'i yeni akışa bağla

**Amaç:** Tüm banka verisi + konsept fonksiyonları silinir; `generateBatch` özne için artık banka çağırmaz, `buildImagePrompt`'a verbatim kaynak beat geçirir.

**Files:**
- Modify: `src/core/brain-data.ts` (bankaları sil), `src/core/brain.ts` (`bankRank/conceptRanked/primeConcept/realConceptFamily/EDU_SOURCE_BANK/REAL_SOURCE_BANKS/applyWorldTaboo` sil/sadeleştir), `src/core/pure.ts` (`architectureFallbackConcept` özne rolü sök, `generateBatch:1159-1202` yeni akış)
- Test: `src/core/faz2_baseline.test.ts` (`hasBankResidue` artık FALSE)

**Interfaces:**
- Consumes: `generateBatch` içinde `arch.source.exactText` (verbatim kaynak beat).
- Produces: `generateBatch` her sahne için `buildImagePrompt(i, {subject:'', event:''}, camera, { ...ctx, sourceBeat: arch.source.exactText })` çağırır; `concept` nesnesi artık özne taşımaz (boş/placeholder).

- [ ] **Step 1: Failing test** — `hasBankResidue(realOutput)` artık FALSE beklenir:
```ts
it('banka söküm sonrası hiçbir sahne prompt\'unda banka özne izi kalmaz', () => {
  const batch = generateBatch(realEduRecipe); // Task 0'daki gerçek reçete
  for (const s of batch.scenes) expect(hasBankResidue(s.imagePrompt)).toBe(false);
  // kaynak beat verbatim taşınıyor:
  expect(batch.scenes[0].imagePrompt).toContain(realEduRecipe.rawSource.split('.')[0]);
});
```
- [ ] **Step 2:** Koş, FAIL (banka hâlâ izli).
- [ ] **Step 3:** Sil: `brain-data.ts`'ten `EDU_BANK/WATER_STAGES/EDU_FB/STY_BANK/STY_FB/REAL_BANKS/REAL_FB`. `brain.ts`'ten `EDU_SOURCE_BANK/REAL_SOURCE_BANKS/bankRank/conceptRanked/primeConcept/realConceptFamily`. Import zincirini temizle (brain.ts:8 import satırı).
- [ ] **Step 4:** `pure.ts`: `generateBatch`'te `primeConcept`/`architectureFallbackConcept` özne çağrısını kaldır; `buildImagePrompt`'a `sourceBeat: arch.source.exactText` geç. `semanticArch.dominantSubject` artık kaynak-beat referansı (özne değil). `applyWorldTaboo` banka subject/event'e bağlıydı — özne gidince world-taboo'yu **negatif firewall** katmanında koru (world negative_lock zaten var; taboo'nun özneye uyguladığı swap'lar düşer, negatif korunur).
- [ ] **Step 5:** Koş `hasBankResidue` PASS. `npx tsc --noEmit` 0 (ölü import/ref temizle).
- [ ] **Step 6:** `npx vitest run` — çok sayıda banka testi KIRIK (beklenen, Task 3). Build ✓ doğrula. Commit: `feat(faz2): konsept bankaları + motoru söküldü, generateBatch verbatim kaynağa bağlandı`.

---

## Task 3: Banka testlerini çerçeve-sözleşmesi testlerine dönüştür (TDD, test silme yok)

**Amaç:** Task 2'de kırılan ~30+ test, YENİ doğru davranışı (site özne uydurmaz, kaynak verbatim, Claude talimatı) doğrulayan testlere dönüşür. Toplam test sayısı DÜŞMEZ.

**Files:**
- Modify: `src/core/brain.test.ts` (conceptRanked/primeConcept/*_BANK describe'ları), `pure.test.ts`, `qa.test.ts`, `probe_coverage.test.ts`, `motion_quality.test.ts`

**Interfaces:**
- Consumes: `generateBatch`, `buildImagePrompt` (yeni davranış), `hasBankResidue`.

- [ ] **Step 1:** Kırık test envanteri çıkar: `npx vitest run 2>&1 | grep -E "✗|FAIL"`. Her kırık `it`'i listele.
- [ ] **Step 2:** Her kırık banka-testini dönüştür (SİLME):
  - `describe('conceptRanked ...')` → `describe('generateBatch — kaynak verbatim + Claude özne devri')`: eski "su döngüsü → banka öznesi" assertion'ı → "su döngüsü kaynağı verbatim prompt'ta + banka izi yok + Claude talimatı var".
  - `primeConcept determinizm/rotasyon` → "aynı reçete deterministik prompt üretir; kaynak beat sırası korunur".
  - `*_BANK false-positive guard` (run/gizli/power-surge) → "artık banka olmadığı için bu false-positive'ler yapısal olarak imkânsız; hasBankResidue false" (regresyon güvencesi).
  - `applyWorldTaboo temperature taboo` → "world negative_lock prompt'a akıyor" (özne-swap yerine negatif firewall).
  - `generateBatch REAL fallback` (brain.test.ts:1214+) → yeni akışta kaynak-verbatim doğrulaması.
- [ ] **Step 3:** Yeni pozitif testler ekle (sayıyı koru/artır): (a) 3 register (EDU/STY/REAL) için `hasBankResidue`=false; (b) kaynak beat verbatim; (c) `buildImagePrompt` Claude talimatı içerir; (d) ham hex prompt'a sızmıyor (Palet Law regresyonu).
- [ ] **Step 4:** `npx vitest run` YEŞİL + sayı ≥ baseline (507). tsc 0, build ✓.
- [ ] **Step 5:** Commit: `test(faz2): banka testleri → çerçeve-sözleşmesi testlerine dönüştürüldü (sayı korundu)`.

---

## Task 4: `.command` sözleşmesi + FINAL BRIEF nöron-sync (referans + palet → final brief)

**Amaç:** İki iş bir arada. (a) `.command`/production, Claude'dan dominant-element'i yazmasını ister (bugün "verbatim kopyala" diyordu). (b) **Final brief (`buildAgentBrief`) kalitesi:** referansların (ref DNA/anchor **verbatim**) ve paletlerin (fiziksel ışık dili, ham hex DEĞİL) final brief'e **dikkatle, tam ve Claude'un özne yazarken kullanacağı biçimde** işlenmesi. Bu, planın kalite ekseni — Mami'nin özel vurgusu.

**Files:**
- Modify: `src/core/brain.ts` (`buildAgentBrief` — referans DNA + palet işleyişi), `src/core/commandExport.ts:195-204` (`commands.contract`), `src/core/productionExport.ts:96-141` (`agentContract`/`scaffold`), `agents/MOTION-CALISTIR.command`, `agents/production/MOTION-CALISTIR.command`
- Test: `src/core/brain.test.ts` (final brief işleyişi), `commandExport.test.ts`, `productionExport.test.ts`, `exporters.test.ts`

**Interfaces:**
- Produces: `.command` JSON `commands.contract` = ["IMAGE: her sahnenin dominant element'ini scenes[].sceneBrief + world dili + ref DNA + palet ışık diline sadık SEN yaz", "MOTION: frame-gated ...", on-screen text, PROOF]. `scenes[].refDna` = ref verbatim 7-katman + anchor; `scenes[].paletteLight` = palet fiziksel ışık dili.

**Önce keşif (workflow ajanı):** `buildAgentBrief`'in şu an referansları (`dna.perRef`, brain.ts:1002-1008/1126-1131) ve paleti final brief'e NASIL işlediğini tam çıkar; palet final brief'e yeterince/doğru akıyor mu, ref DNA verbatim mi yoksa özet mi. Bulguya göre Step 3 netleşir.

- [ ] **Step 1: Failing test** — referans + palet final brief'e işleniyor mu:
```ts
it('final brief referansların verbatim DNA/anchor\'ını ve paletin ışık dilini taşır', () => {
  const brief = buildAgentBrief(realState);           // ref: pixar_dimensional, palet: vibrant_edu
  expect(brief).toContain(ref.anchor);                // ref anchor verbatim
  expect(brief).toMatch(/deep cool blue|amber|near-white/); // palet FİZİKSEL ışık dili
  expect(brief).not.toMatch(/#[0-9a-fA-F]{6}/);        // ham hex YOK (Palet Translation Law)
});
it('.command sözleşmesi Claude\'dan dominant element yazmasını ister + ref/palet taşır', () => {
  const cmd = buildCommandJSON(realState);
  const contract = JSON.stringify(cmd.commands.contract);
  expect(contract).toMatch(/dominant element.*(yaz|write)/i);      // Claude özne yazar
  expect(contract).not.toMatch(/copy.*verbatim.*image prompt/i);   // eski "verbatim kopyala" gitti
  expect(cmd.scenes[0]).toHaveProperty('sceneBrief');              // verbatim kaynak
  expect(JSON.stringify(cmd.scenes[0])).toMatch(/ref.*dna/i);       // nöron-sync ref
  expect(JSON.stringify(cmd.scenes[0])).toMatch(/palette|ışık/i);   // palet işleyişi
});
```
- [ ] **Step 2:** Koş, FAIL.
- [ ] **Step 3:** İki katman:
  - **Final brief işleyişi (`buildAgentBrief`):** ref DNA'yı **verbatim 7-katman + anchor** olarak sahne/ref bazlı ör; paleti **fiziksel ışık dili** (`paletteLightPrompt`) olarak ör — ham hex ASLA. Çatışmada authority hiyerarşisi korunur (World/Render Lock > Ref DNA > Palette).
  - **Sözleşme:** `commandExport.ts` + `productionExport.ts` IMAGE talimatı "onaylı, verbatim kopyala" → "sceneBrief + world dili + ref DNA + palet ışık diline sadık dominant element'i SEN yaz". MOTION frame-gate KORUNUR. `scenes[].refDna` + `scenes[].paletteLight` alanları eklenir.
- [ ] **Step 4:** `agents/*.command` kick metinlerini hizala (zsh -n). Export firewall testleri (qa.test.ts IP/persona) hâlâ geçer.
- [ ] **Step 5:** Gate yeşil. Commit: `feat(faz2): .command sözleşmesi + final brief nöron-sync (ref DNA + palet ışık dili)`.

---

## Task 5: Denetim — gerçek çıktı (mamilas-audit) + mihenk-taşı turu

**Amaç:** Yeşil gate yeterli değil (FAZ5 dersi). Gerçek `generateBatch` + `.command` çıktısı gözle okunur; pipeline film-grade video ürettirebiliyor mu ölçülür.

**Files:** (kod değişikliği çıkarsa ilgili core/test; asıl çıktı denetim raporu)

- [ ] **Step 1: FINAL BRIEF KALİTE DENETİMİ (multi-ajan workflow, Mami özel vurgusu).** `/mamilas-audit` + adversarial ajanlar — gerçek reçetelerle (EDU: fotosentez/su döngüsü, STY: One Piece homage, REAL: ürün) `generateBatch` + `buildAgentBrief` (**final brief**) + `buildCommandJSON` çıktısı üret, GÖZLE oku:
  - (a) banka izi 0 (`hasBankResidue`=false);
  - (b) kaynak verbatim taşınıyor;
  - (c) Claude özne-talimatı net + uygulanabilir (Claude bununla gerçekten sahne yazabilir mi);
  - (d) **REFERANS işleyişi:** ref DNA/anchor final brief'e **verbatim + zengin** akıyor, özet/kırpık değil;
  - (e) **PALET işleyişi:** palet final brief'e **fiziksel ışık dili** olarak akıyor, ham hex YOK, monokrom aile doğru;
  - (f) world dili/kamera/negatif firewall korunmuş; motor lehçesi (Kling≠Seedance) ayrışıyor;
  - (g) Türkçe overlay temiz plaka+VO; IP/persona firewall sağlam.
- [ ] **Step 2:** Bulgular varsa kök-fix (TDD, workflow), gate yeşil tut.
- [ ] **Step 3: Mihenk-taşı turu (multi-ajan jüri ön-provası).** Alıcı-gözü ajan(lar)ı: "Bu **final brief** + .command, Claude'a verilince gerçekten film-grade tek-kare sahne + frame-aware motion ürettirir mi? Referans DNA'sı ve palet sahneyi doğru yönlendiriyor mu? Yönetmen gözüyle 9+/10 mu?" Çıktı/karne al.
- [ ] **Step 4:** `hasBankResidue` + final-brief ref/palet işleyiş testlerini kalıcı regresyona sabitle (FAZ2 kazanımı geri gelmesin). Gate yeşil.
- [ ] **Step 5:** Commit: `feat(faz2): final brief kalite denetimi + mihenk-taşı — ref/palet işleyişi doğrulandı`. `/mamilas-checkpoint` (memory: FAZ 2 bitti).

---

## FAZ 2 sonrası: Jüri Session (ayrı, bu planın dışında)
FAZ 1 (vücut) + FAZ 2 (beyin) bitince ayrı "jüri session" açılır: orkestratör tamamlanmış pipeline çıktısını katı ajan jürisine sunar, jüri "mihenk taşı olmuş mu" karnesi verir. Kendi tasarımı o session'da yapılır.

---

## Self-Review (yazım sonrası — spec kapsama kontrolü)
- **Banka söküm** (spec §4) → Task 2 ✓
- **Özne devri A radikal** (spec §4 karar) → Task 1 + Task 2 ✓
- **Kalanlar korunur** (spec §5: render_law/palet/dialect/shot/deriveOnScreenText/extractTurkishKeyterm) → Task 2 Step 4 + Global Constraints ✓
- **Nöron-sync** (spec §6) → Task 4 ✓
- **.command sözleşmesi** (spec §7) → Task 4 ✓
- **Test stratejisi** (spec §8) → Task 3 ✓
- **Denetim + mihenk-taşı** (spec §9) → Task 5 ✓
- **Final brief kalitesi + referans/palet işleyişi** (Mami özel vurgusu) → Task 4 (örme) + Task 5 Step 1 d/e (denetim) ✓
- **Hep multi-ajan workflow** (Mami emri) → Global Constraints "YÜRÜTME" + her task workflow ✓
- **Riskler** (spec §10: test dönüşümü, applyWorldTaboo) → Task 3 + Task 2 Step 4 ✓
- **Jüri** (spec §12) → plan dışı, kayıtlı ✓
