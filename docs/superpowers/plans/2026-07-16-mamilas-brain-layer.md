# MAMILAS Beyin Katmanı — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Codex'in sağlam plumbing'i üstüne, Mami'nin müdahale kapısını hiç kapatmadan, madenlenmiş üretim
zekâsını ölçülebilir kontrat olarak taşıyan yaratıcı beyin katmanını kurmak.

**Architecture:** Tek canonical kaynak (`agents/PROTOCOL.md` + `agents/roles/*.md`) → generator ile iki yüzeye
(`.claude/agents`, `.codex/agents`) senkron. Site tarif eder; **ajan TAM paketi kesintisiz yazar, yorumunu
şeffaf receipt'le görünür bırakır** (onay kapısı YOK — Mami revizyonu); Mami ilk görselleri üretip doğal dille
müdahale eder (`MamiDirectives`); Image/Motion Author `promptQuality` kontratına karşı yazar; jüri RLAC
deseniyle ölçer; biten projelerin Mami-onaylı dersleri sonraki projelere akar (M7).

**Tech Stack:** Vite/React/TS, Vitest, Playwright, Node runner (`mamilas-command.mjs`), `sharp`, `zustand`.

## Global Constraints

Kaynak: `docs/superpowers/specs/2026-07-16-mamilas-brain-layer-design.md` §0. Her task'a implicit dahildir.

- **API YOK** — otomatik generation/batch/upscale yok; manuel World Studio; Mami prompt'u motora elle taşır.
- **Mami her zaman loop'ta** — otomatik türetilen HER alan override edilebilir ÖNERİ; müdahale kapısı kapanmaz.
- **Ajans-seviyesi kalite** — Mami AI Creative Director; sistem eli/gözü, hükmü değil.
- **Site final prompt YAZMAZ** — yalnız brief; final prompt'u ajan yazar.
- **Madenlenmiş ders ≠ evrensel kilit** — engine-aware default/red-line; Mami override → receipt'te `SUPPRESSED`.
- **PUSH YOK** · commit iş-parçası başına `git add` ile spesifik dosyalar (asla `-A`) · test silme yasak.
- **Kapı her task sonu:** `npx tsc --noEmit` → `rtk proxy npx vitest run` (sayı düşmez) → `npm run build`.
  ⚠️ Düz `npx vitest run` rtk özetiyle kırığı gizleyebilir — `rtk proxy` kullan.
- **Node 26 + tsx kırık:** script çalıştırmak için shim: `node --import <scratchpad>/sync-hooks.mjs <script.ts>`.

---

## ⭐ /CLEAR SONRASI YENİ OTURUMA YAPIŞTIRILACAK KICKOFF METNİ

```
MAMILAS beyin katmanı inşasındayız. Sen VSCode/Mac oturumusun. ÖNCE şunları OKU (sırayla):
1. artifacts/decision-pipeline-implementation/EXECUTION_STATE.md (durum — en üstteki güncel bölüm)
2. docs/superpowers/specs/2026-07-16-mamilas-brain-layer-design.md (tasarım + 5 değişmez ürün yasası)
3. docs/superpowers/plans/2026-07-16-mamilas-brain-layer.md (bu plan — hangi M task'tayız EXECUTION_STATE söyler)
4. Son receipt: artifacts/decision-pipeline-implementation/receipts/BRAIN-M<N>.md
5. Memory: MEMORY.md + [[mamilas-brain-intelligence-mined]] + [[mamilas-external-research-2026-07]]

DEĞİŞMEZ (spec §0): API YOK · Mami HER ZAMAN loop'ta ama ONAY BÜROKRASİSİ YOK (ajan tam paketi kesintisiz
üretir, yorumunu şeffaf receipt'le bırakır; Mami ilk görselleri üretip doğal dille müdahale eder) ·
ajans-seviyesi · site TARİF eder/ajan YAZAR · madenlenmiş ders evrensel kilit DEĞİL (Mami override eder).
Site plumbing (agentProtocol.ts, mamilas-command.mjs) SAĞLAM — yeniden icat etme.
Sıra: M0 baseline → M1 canonical → M2 prop/fizik → M3 şeffaf-yorum → M4 Image → M5 Motion → M6 QA → M7 ders bankası.

ÇALIŞMA BİÇİMİ: Bu plandaki tek bir M task'ı yürüt, aptal-olma, gerçek çıktıya bak (generateBatch değil,
lifecycle'ın gerçek image_author artifact'i). Her task sonu: Mami gözle okur → Sol 5.6 high bağımsız denetler
(codex exec -c model=gpt-5.6-sol -c model_reasoning_effort=high "...") → /mamilas-checkpoint → kapı (tsc/vitest/build).
PUSH YOK, test silme yok, iç tartışma gösterme. Şüphede DUR ve Mami'ye sor (FACT_REQUIRED). Halüsinasyon yasak —
her iddiaya file:line veya gerçek çıktı çıpası. Mami molada olabilir; onun sözü olmadan "onaylandı" yazma.
```

---

## Task Dosya Haritası

| Task | Ana dosyalar | Sorumluluk |
|---|---|---|
| M0 | `agents/*.bat`, package baseline | Yeşil baseline mühürle |
| M1 | `scripts/agents-sync.mjs` (yeni), `agents/roles/*`, `.claude/agents/*`, `.codex/agents/*`, parity test | Tek kaynak→iki yüzey generator + drift testi |
| M2 | `src/core/pure.ts` (`toWorldPacket`/`renderPhysics`), yeni test | render_law fizik/prop ayrımı |
| M3 | `src/core/contract.ts`, `src/core/pure.ts`, `src/core/agentProtocol.ts`, `agents/roles/image-author.md` | Şeffaf yorum receipt'i + dürüst adlandırma (onay kapısı YOK) |
| M4 | `agents/roles/image-author.md`, `image-jury.md`, `promptQuality` kontrat üreticisi (brain.ts/contract.ts), test | Image zekâsı + jüri ölçümü |
| M5 | `agents/roles/motion-author.md`, `motion-jury.md`, engine dialect, test | Motion zekâsı, frame-gated |
| M6 | jüri kontratları, regresyon matrisi, `pure.test.ts`/yeni | Cross-phase QA hardening |
| M7 | closeout/`projectPack.ts`, `agents/lessons/APPROVED.md` (yeni), `CONTEXT.json` üreticisi | Biten projelerden öğrenme — Mami-onaylı ders bankası |

---

## Task M0: Baseline mühür

**Files:**
- Modify: `agents/MOTION-CALISTIR.bat`, `agents/production/MOTION-CALISTIR.bat` (CRLF — çalışma ağacında hazır)
- Verify: `package.json` (sharp yüklü)

**Interfaces:**
- Produces: yeşil, commit'li baseline. Sonraki her task bunun üstüne çıkar.

- [ ] **Step 1: Baseline'ı ölç (kanıt)**

Run: `npx tsc --noEmit && rtk proxy npx vitest run 2>&1 | tail -5 && npm run build 2>&1 | tail -3`
Expected: tsc 0 hata · vitest ~1896/1896 (67 dosya) PASS · build OK. Sayıyı receipt'e yaz.

- [ ] **Step 2: İki .bat CRLF fix + sharp'ı Mami onayıyla commit'le**

Mami onayı gerekir (baseline commit kararı Mami'nin). Onay varsa:
```bash
git add agents/MOTION-CALISTIR.bat agents/production/MOTION-CALISTIR.bat
git commit -m "fix(launcher): restore CRLF on MOTION-CALISTIR .bat launchers

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```
Not: `sharp` package.json'da zaten var; ayrı commit gerekmez (yalnız `npm install` koşuldu).

- [ ] **Step 3: Receipt yaz + checkpoint**

`artifacts/decision-pipeline-implementation/receipts/BRAIN-M0.md` — baseline sayıları + commit hash.
Sonra `/mamilas-checkpoint`.

---

## Task M1: Canonical consolidation (tek kaynak → iki yüzey)

**Files:**
- Create: `scripts/agents-sync.mjs` (generator + `--check`)
- Create: `agents/manifest.json` (role → canonical card → provider wrapper eşlemesi)
- Modify: `.claude/agents/mamilas-*.md`, `.codex/agents/mamilas-*.toml` (GENERATED banner'lı hale gelir)
- Create: `src/core/agentsSync.test.ts` (parity testi)
- Modify: `package.json` (`"agents:sync": "node scripts/agents-sync.mjs"`)

**Interfaces:**
- Consumes: `agents/PROTOCOL.md`, `agents/roles/<role>.md`, `agents/adapters/{claude,codex}.md`.
- Produces: `syncAgents(): {written: string[]}` ve `checkAgents(): {drift: string[]}`. Parity testi
  `checkAgents().drift` boş olmalı der.

- [ ] **Step 1: Failing test yaz — generated dosyalar canonical'dan türemeli**

```js
// src/core/agentsSync.test.ts
import { describe, it, expect } from 'vitest';
import { checkAgents } from '../../scripts/agents-sync.mjs';

describe('canonical agent surface', () => {
  it('generated .claude/.codex files are byte-identical to a fresh sync', () => {
    const { drift } = checkAgents();
    expect(drift).toEqual([]); // drift varsa: agents:sync koşulmamış
  });
  it('every generated file carries the GENERATED banner + protocol hash', () => {
    const { drift } = checkAgents();
    expect(drift.filter(d => d.includes('missing-banner'))).toEqual([]);
  });
});
```

- [ ] **Step 2: Fail doğrula**

Run: `rtk proxy npx vitest run src/core/agentsSync.test.ts`
Expected: FAIL — `checkAgents` yok / drift dolu.

- [ ] **Step 3: `agents-sync.mjs` yaz — generator**

Manifest'ten her rol için: `PROTOCOL.md` hash + role card gövdesi + provider wrapper → `.claude/agents/<name>.md`
(GENERATED banner + `canonicalHash`) ve `.codex/agents/<name>.toml`. `checkAgents()` temp'te üretip mevcuta byte-compare.
Kod, mevcut `agentProtocol.ts` `canonicalHash`/`sha256Hex` yardımcılarını kullansın (yeni hash icat etme).
Her generated dosya başında: `<!-- GENERATED — DO NOT EDIT · source: agents/roles/<role>.md · protocolHash: <hash> -->`

- [ ] **Step 4: `npm run agents:sync` koş, sonra test PASS doğrula**

Run: `npm run agents:sync && rtk proxy npx vitest run src/core/agentsSync.test.ts`
Expected: dosyalar üretildi; test PASS.

- [ ] **Step 5: Kapı + gerçek doğrulama**

Run: `npx tsc --noEmit && rtk proxy npx vitest run 2>&1 | tail -5 && npm run build 2>&1 | tail -3`
Expected: tsc 0 · vitest sayısı ARTТИ (yeni test) veya sabit · build OK.
Elle drift testi: bir `.claude/agents/*.md`'yi elle boz → `agents:sync -- --check` → kırmızı vermeli.

- [ ] **Step 6: Sol denetimi + Mami göz + checkpoint**

```bash
codex exec -c model=gpt-5.6-sol -c model_reasoning_effort=high --skip-git-repo-check \
  "M1 canonical consolidation denetle: agents-sync.mjs generator drift'i gerçekten yakalıyor mu? \
   .claude/.codex artık authority olmaktan çıktı mı? launcher-parity yasasını çiğnedi mi? Adversarial oku."
```
Sol PASS + Mami göz → `receipts/BRAIN-M1.md` (drift testi çıktısı dahil) → commit (spesifik dosyalar) → `/mamilas-checkpoint`.

**⏹️ /CLEAR — M2 öncesi** (EXECUTION_STATE'i "M2 aktif" diye güncelle, kickoff metnini yapıştır).

---

## Task M2: render_law prop/fizik ayrımı

**Files:**
- Modify: `src/core/pure.ts` (`toWorldPacket` → `renderPhysics` derlemesi, ~:408-454)
- Create: `src/core/worldPacketPhysics.test.ts`

**Interfaces:**
- Consumes: `DATA.worlds[].render_law`, `line_grammar`, `light_law`.
- Produces: `toWorldPacket().renderPhysics` artık render_law'ın **fizik cümlelerini** taşır; somut-nesne
  (prop) cümleleri `renderPhysics` yerine ayrı `vocabularyExamples`'a düşer (prompt'a set-emri olarak girmez).

- [ ] **Step 1: Failing test — prop-laden dünyada renderPhysics prop taşımamalı**

```ts
// src/core/worldPacketPhysics.test.ts
import { describe, it, expect } from 'vitest';
import { toWorldPacket, DATA } from './pure';

describe('renderPhysics prop/physics separation', () => {
  it('one_piece_toei: renderPhysics carries physics, not standing props', () => {
    const w = DATA.worlds.find(x => x.id === 'one_piece_toei')!;
    const pk = toWorldPacket(w, {} as any);
    // Prop nesneleri renderPhysics'te set-emri olarak DURMAMALI:
    expect(pk.renderPhysics.toLowerCase()).not.toMatch(/wanted[- ]poster|caravel|pennant|hull/);
    // Fizik korunmalı (boşaltma yok):
    expect(pk.renderPhysics.length).toBeGreaterThan(120);
  });
  it('deakins_naturalist: physics-only world stays intact', () => {
    const w = DATA.worlds.find(x => x.id === 'deakins_naturalist')!;
    const pk = toWorldPacket(w, {} as any);
    expect(pk.renderPhysics.toLowerCase()).toMatch(/contrast|falloff|photon|grain|motivated/);
  });
});
```

- [ ] **Step 2: Fail doğrula** — `rtk proxy npx vitest run src/core/worldPacketPhysics.test.ts` → FAIL.

- [ ] **Step 3: `toWorldPacket` renderPhysics derleyicisini fizik/prop ayıracak şekilde yaz**

render_law'ı cümlelere böl; fizik-imzalı cümleler (ışık/kontrast/falloff/grain/lens/yüzey davranışı) →
`renderPhysics`; somut-nesne-envanteri cümleleri → `vocabularyExamples` (zaten "yaratıcı referans, prop emri
değil" diye etiketli — `commandExport.ts:460`). **render_law tümden silinmez; fizik verbatim korunur.**
Ayrım için basit fizik-lexicon (light, shadow, contrast, ratio, falloff, grain, lens, specular, diffuse,
subsurface, reflection, aperture) + prop-lexicon değil, **cümlede fiil/yüzey-davranışı var mı** heuristiği;
kararsızsa cümleyi `renderPhysics`'te bırak (güvenli taraf — boşaltma riski > sızıntı riski, spec KUSUR-C).

- [ ] **Step 4: Test PASS + kapı** — hedef testler + tam süit yeşil, sayı düşmez.

- [ ] **Step 5: GERÇEK A/B — prop-laden vs physics-only, gerçek image_author artifact'i**

Lifecycle'ı (veya shim'li workbench'i) aynı source/shot ile `one_piece_toei` (prop-laden) ve
`deakins_naturalist` (physics) üzerinde koştur; **gerçek image_author prompt'unu** üret. Prop sızıntısı
azaldı mı GÖZLE bak (yalnız test değil). Mami elle motora verip **kareye** bakabilir. Sonuç receipt'e.

- [ ] **Step 6: Sol denetimi + Mami göz + checkpoint** → `receipts/BRAIN-M2.md` → commit → `/mamilas-checkpoint`.

---

## Task M3: Şeffaf yorum receipt'i + dürüst adlandırma (KUSUR-A — Mami revizyonu)

> **⚠️ MAMI REVİZYONU (2026-07-16):** Sol'un önerdiği "ayrı proposal fazı + Mami APPROVE bekleme kapısı"
> **İPTAL.** Mami: *"öneri phase'ini beğenmedim, direkt image prompt'larına geçebiliriz, çok uzatıyor;
> sahne-sahne spesifikliğe şu an gerek yok."* Mami'nin gerçek ritmi: ajan TAM paketi verir → Mami ilk
> 2-3 görseli üretir → doğal dille müdahale eder ("renderı tam alamamışsın") → ajan sıkılaştırır.
> Müdahale kapısı = Mami'nin gözü + `MamiDirectives` + mevcut tek-revizyon hattı. Ekstra onay bürokrasisi YOK.
> KUSUR-A'nın çözümü küçülür: ajanın yorumu GÖRÜNMEZ olmaktan çıkar (şeffaf receipt), ama AKIŞI DURDURMAZ.

**Files:**
- Modify: `src/core/contract.ts` + `src/core/pure.ts` (architecture alanlarını dürüstleştir:
  `exactSourceBeat` + `semanticInterpretationStatus`)
- Modify: `agents/roles/image-author.md` (canonical: prompt yanına tek-satır yorum receipt'i zorunlu)
- Modify: `src/core/agentProtocol.ts` (yalnız `image_author` content şemasına `interpretation` alanı —
  yeni rol/faz/kapı YOK)
- Create: `src/core/interpretationReceipt.test.ts`

**Interfaces:**
- Consumes: site deterministik brief (`exactSourceBeat`), `MamiDirectives`.
- Produces: `image_author` artifact content'ine zorunlu `interpretation` bloğu:
  `{ dominantSubject, singleEvent, frozenInstant }` — tek satırlık, prompt'un YANINDA görünür.
  Akış durmaz; Mami isterse okur, istemezse direkt üretir. Mami düzeltmesi `MamiDirectives` olarak
  girer ve receipt'te KAYNAK görünür (mevcut mekanizma — yeni kapı kurulmaz).

- [ ] **Step 1: Dürüst adlandırma failing testi**

```ts
// site ham cümleyi 'dominantSubject' diye SUNMAZ; dürüst statü taşır
it('site brief exposes exactSourceBeat honestly, not a fake dominant copy', () => {
  const r = generateBatch(sampleInput);
  const s = r.scenes[0];
  expect(s.architecture.exactSourceBeat).toBeTruthy();
  expect(s.architecture.semanticInterpretationStatus).toBe('AGENT_AUTHORED'); // yorum ajanın işi
});
```

- [ ] **Step 2: Fail doğrula** → FAIL (alanlar yok).

- [ ] **Step 3: contract + architecture alanlarını dürüstleştir** (site YİNE semantic author olmaz —
  ham beat'i dürüst adla taşır; `dominantSubject`/`event` "kopya yalanı" kalkar; downstream tüketiciler
  güncellenir, testler silinmez).

- [ ] **Step 4: `interpretation` receipt'i failing testi — image_author artifact'i yorumunu görünür taşımalı**

```ts
it('image_author artifact carries a visible one-line interpretation receipt', () => {
  const artifact = sampleImageAuthorArtifact();
  expect(artifact.content.interpretation.dominantSubject).toBeTruthy();
  expect(artifact.content.interpretation.singleEvent).toBeTruthy();
  expect(artifact.content.interpretation.frozenInstant).toBeTruthy();
});
```

- [ ] **Step 5: `image_author` content şemasına `interpretation` ekle + role card'a yaz**

`agentProtocol.ts` `validateRoleContent` image_author dalına `interpretation` zorunluluğu;
`agents/roles/image-author.md`'ye: *"Prompt'tan ÖNCE tek satır yorum receipt'i yaz (dominant özne /
tek olay / donmuş an) — Mami'nin senin kafanı görmesi için. Bu bir onay kapısı DEĞİLDİR; yazıp devam et."*
Sonra `npm run agents:sync`.

- [ ] **Step 6: Test PASS + kapı** — tam süit yeşil, sayı düşmez, build OK.

- [ ] **Step 7: GERÇEK akış — kesintisiz tam paket + şeffaf yorum**

Lifecycle'ı gerçek Türkçe source ile sür: ajan TAM paketi (bütün sahnelerin prompt'ları + yorum
receipt'leri) DURMADAN üretsin. Mami ilk 2-3 prompt'u motora verip karelere baksın, doğal dille bir
düzeltme versin ("renderı tam alamamışsın") → düzeltme `MamiDirectives` olarak girsin → ajan revize etsin
→ receipt'te KAYNAK görünsün. **Akış hızlı mı + yorum şeffaf mı + müdahale işliyor mu GÖZLE doğrula.**

- [ ] **Step 8: Sol denetimi + Mami göz + checkpoint** → `receipts/BRAIN-M3.md` → commit → `/mamilas-checkpoint`.

**⏹️ /CLEAR — M4 öncesi.**

---

## Task M4: Image Author + Image Jury zekâsı (birlikte)

**Files:**
- Modify: `agents/roles/image-author.md`, `agents/roles/image-jury.md` (canonical — sonra agents:sync)
- Modify: `promptQuality` kontrat üreticisi (`src/core/contract.ts` veya `brain.ts` — `requiredEvidence`/`rejectIf`)
- Create: `src/core/promptQuality.test.ts`

**Interfaces:**
- Consumes: onaylı shot-plan (M3), WorldPacket physics (M2), `MamiDirectives`.
- Produces: `promptQuality` kontratı madenlenmiş yasaları `requiredEvidence[]`/`rejectIf[]` olarak taşır;
  image-jury bunları ölçer.

Madenlenmiş yasalar (kaynak `[[mamilas-brain-intelligence-mined]]`) — kontrat maddesi olarak, Mami override
edilebilir (receipt'te `SUPPRESSED`):
- **2D-plastik fix:** hangi yüzey flat-cel (figür) vs boyalı/foto-gerçek (arka plan); stil sıfatı değil fiziksel malzeme.
- **Palet = rejim, liste değil** (duotone çökmesini önle).
- **Detay üçlüsü:** çevresel-baskı + mikro-aksiyon + somut optik olay.
- **Self-contained:** her prompt tam continuity durumunu sıfırdan yazar.
- **"Half a second before X"** kapanışı (somut sonraki fiziksel olay).
- **Banned empties** → somut lens/grain/film-stock. Foto-gerçekte anti-sheen counter-terms.
- **Nano Banana 2 grameri:** kamera erken + sayısal lens+f-stop.

- [ ] **Step 1: `promptQuality` failing test** — kontrat 2D-plastik/palet-rejim/detay-üçlüsü maddelerini
  `rejectIf`/`requiredEvidence` olarak üretiyor mu; Mami override maddesi `SUPPRESSED` işaretleniyor mu.
- [ ] **Step 2: Fail doğrula.**
- [ ] **Step 3: Kontrat üreticisini + role kartlarını yaz** (madenlenmiş yasalar; agents:sync ile yayılır).
- [ ] **Step 4: Test PASS + kapı.**
- [ ] **Step 5: GERÇEK image_author artifact'i üret** (generateBatch değil — lifecycle) → Mami gözle
  ajans-seviyesi mi bak; 2D-plastik/prop/palet gerçekten düzeldi mi kareyle test et.
- [ ] **Step 6: Sol denetimi + Mami göz + checkpoint** → `receipts/BRAIN-M4.md` → commit → `/mamilas-checkpoint`.

---

## Task M5: Motion Author + Motion Jury zekâsı (birlikte)

**Files:**
- Modify: `agents/roles/motion-author.md`, `agents/roles/motion-jury.md` (canonical)
- Modify: engine dialect / scrub yolu (`src/core/engine.ts` / motion kontrat üreticisi)
- Create: `src/core/motionQuality.test.ts`

**Interfaces:**
- Consumes: Mami-APPROVE gerçek frame (frame gate), engine dialect/window.
- Produces: motion `promptQuality` — Physics-First Motion + scrub-quoted-source + no-dialogue-ever, frame-gated.

Madenlenmiş (Mami override edilebilir):
- **Physics-First Motion:** pan/zoom/dolly yerine kütle/kadans (organic handheld drift, macro lens breathing).
- **Scrub QUOTED source'a da uygulanır** (ham beat `Motion brief:` alıntısı klingScrub'ı baypaslıyor — ölçülmüş gap).
- **No-dialogue-ever:** Kling'e diyalog/dudak yazma; VO ayrı ElevenLabs katmanı (still-lips mutlak).
- Split penceresi + SFX omurgası (2-4 somut diegetik ses).

- [ ] **Step 1: Failing test** — scrub quoted-source metnine uygulanıyor mu; motion kontratı Physics-First
  ve no-dialogue maddelerini taşıyor mu.
- [ ] **Step 2: Fail doğrula.**
- [ ] **Step 3: Scrub yolunu + role kartlarını yaz** (`commandExport.test.ts` kilitleri güncellenir, silinmez).
- [ ] **Step 4: Test PASS + kapı.**
- [ ] **Step 5: GERÇEK motion artifact'i** (yalnız APPROVE frame'den) → Mami göz.
- [ ] **Step 6: Sol denetimi + Mami göz + checkpoint** → `receipts/BRAIN-M5.md` → commit → `/mamilas-checkpoint`.

---

## Task M6: Sistem QA hardening (cross-phase, RLAC/red-line/regresyon)

**Files:**
- Modify: jüri kontratları (`agents/roles/*-jury.md`), `src/core/pure.test.ts` veya yeni regresyon matrisi.
- Create: `src/core/juryRedlines.test.ts`

**Interfaces:**
- Consumes: tüm faz artifact'leri.
- Produces: cross-phase adversarial jüri (RLAC: falsifiable rubric + dış-validator) + ölçülmüş red-line'lar
  (world-lock-figürlü, render-lock-inceltme-yasağı, prop:fizik oranı, palet-liste-duotone) regresyon testli.

- [ ] **Step 1: Ölçülmüş red-line'lar için failing test** (kaynak `[[mamilas-brain-intelligence-mined]]` QA bölümü).
- [ ] **Step 2: Fail doğrula.**
- [ ] **Step 3: Jüri red-line kontrollerini + RLAC deseni yaz.**
- [ ] **Step 4: Test PASS + kapı.**
- [ ] **Step 5: GERÇEK uçtan uca** — image→frame→motion tam zincir, gerçek artifact'lerle → Mami göz.
- [ ] **Step 6: Sol final denetimi + Mami kabul + checkpoint** → `receipts/BRAIN-M6.md` → commit → `/mamilas-checkpoint`.

---

## Task M7: Biten projelerden öğrenme — ders bankası (Mami'nin "tanrı seviyesi" isteği)

> **Mami (2026-07-16):** *"Biten projelerden öğrenen bir yapı gibi kurdu diye hatırlıyorum — onu da
> mükemmelleştirelim. Eski işlerinden öğrenmesi sistemi tanrı seviyesine çıkarır."*
> Doğru hatırlıyor: `buildCloseout` VAR (`src/core/projectPack.ts` çevresi, MACRO-7 receipt'i) — karar→
> prompt→frame zinciri + OBSERVATION dersleri toplar, **otomatik promote yok** (doğru tasarım). AMA dersler
> şu an hiçbir beyne GERİ AKMIYOR — ölü arşiv. M7 o döngüyü kapatır: **closeout → Mami-onaylı ders →
> sonraki projede ajan context'i.**

**Files:**
- Modify: `buildCloseout` çıktı yolu (`src/core/projectPack.ts` / closeout üreticisi — OBSERVATION dersleri
  yapılandırılmış `lessonCandidates[]` olarak)
- Create: `agents/lessons/APPROVED.md` (Mami-onaylı ders bankası — curated, elle onaylı)
- Modify: `scripts/mamilas-command.mjs` + `CONTEXT.json` üreticisi (image/motion author context'ine
  `approvedLessons` slice'ı — kısa, curated; 300KB dump değil)
- Modify: `agents/roles/image-author.md`, `motion-author.md` (canonical: "approvedLessons'ı oku, çelişkide
  Mami direktifi kazanır")
- Create: `src/core/lessonBank.test.ts`

**Interfaces:**
- Consumes: `buildCloseout` OBSERVATION dersleri + Mami'nin canlı düzeltmeleri ("renderı tam alamamışsın"
  gibi MamiDirectives geçmişi).
- Produces: `lessonCandidates[]` (closeout'tan, ADAY etiketli) → **Mami APPROVE ederse** `agents/lessons/
  APPROVED.md`'ye girer → `CONTEXT.json.approvedLessons` olarak sonraki projelerin author'larına akar.
  **Otomatik yasalaşma YOK** — çöp ders sistemi zehirler; yalnız Mami'nin onayladığı ders kalıcı.
  Ders formatı: tek satır + kaynak proje + tarih (ör: `"one_piece tipi dünyalarda figür-cel/arka-plan-boya
  ayrımını promptta AÇIK yaz — 2026-07 X projesi, Mami onayı"`).

- [ ] **Step 1: Failing test — closeout lessonCandidates üretmeli, context approvedLessons taşımalı**

```ts
// src/core/lessonBank.test.ts
it('closeout emits structured lessonCandidates from OBSERVATIONs', () => {
  const closeout = buildCloseout(sampleFinishedProject);
  expect(Array.isArray(closeout.lessonCandidates)).toBe(true);
  expect(closeout.lessonCandidates[0]).toHaveProperty('lesson');
  expect(closeout.lessonCandidates[0]).toHaveProperty('sourceProject');
  expect(closeout.lessonCandidates[0].status).toBe('CANDIDATE'); // otomatik promote YOK
});
it('image_author context carries only APPROVED lessons, capped and curated', () => {
  const ctx = buildImageAuthorContext(sampleState);
  expect(ctx.approvedLessons.every(l => l.status === 'APPROVED')).toBe(true);
  expect(ctx.approvedLessons.length).toBeLessThanOrEqual(20); // context ekonomisi — dump değil
});
```

- [ ] **Step 2: Fail doğrula.**
- [ ] **Step 3: `lessonCandidates` üreticisi + `APPROVED.md` okuma/parse + context slice'ı yaz.**
- [ ] **Step 4: Test PASS + kapı** — tam süit yeşil, sayı düşmez, build OK.
- [ ] **Step 5: GERÇEK döngü** — bitmiş bir projeden (agents/done varsa oradan) closeout üret →
  lessonCandidates'ı Mami'ye göster → Mami 2-3 dersi onaylar → APPROVED.md'ye gir → YENİ bir üretimde
  ajanın context'inde dersin gerçekten göründüğünü ve prompt'a yansıdığını GÖZLE doğrula.
- [ ] **Step 6: Sol denetimi + Mami göz + checkpoint** → `receipts/BRAIN-M7.md` → commit → `/mamilas-checkpoint`.

---

## Self-Review notu

- **Spec kapsamı:** KUSUR-A→M3 · KUSUR-B→M1 · KUSUR-C→M2 · KUSUR-D→M4/M5 · sistem QA→M6 · baseline→M0. Boşluk yok.
- **Placeholder:** yok — her task gerçek dosya/test/komut taşıyor.
- **Tип tutarlılığı:** `approvedShotPlanHash`, `DirectorShotProposal`, `renderPhysics`, `promptQuality`,
  `checkAgents`/`syncAgents` — plan boyunca sabit adlar.
- **Ürün yasası uyumu:** hiçbir task API açmıyor, site'yi semantic author yapmıyor, Mami müdahale kapısını
  kapatmıyor, madenlenmiş dersi evrensel kilide çevirmiyor.
