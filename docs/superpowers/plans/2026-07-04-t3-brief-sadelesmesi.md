# T3 — Brief Sadeleşmesi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** DESIGN yolu üründen tamamen sökülür (data + core + UI + test + doc), Brief ekranı tek bakışta ≤3 bölgeye iner (görselli arketip kartları, tek CTA), boş/eksik durum FAIL yerine davetkâr onboarding diline döner.

**Architecture:** `projectKind: 'video' | 'design'` toggle'ı KÖKTEN kaldırılır (alan dahil — video tek gerçek olur, koşullu dallar ölür). Phase 0 kartları `AdvisorPortrait` desenindeki img-slot + fallback ile görselleşir (`/assets3d/presets/<id>.webp`, Mami doldurur, eksikse bugünkü ikon kartı). Dashboard 3 bölgeye yerleşir: BAŞLANGIÇ (arketip ızgarası) / KAYNAK (tek CTA + onboarding durumu) / AYRINTILAR (konu+karakter+kasa).

**Tech Stack:** Vite + React + TS + Zustand, vitest, Playwright e2e.

**Değişmez kontratlar (e2e bunlara basıyor — KORU):** `raw-source-input`, `vault-name`, `vault-save`, `vault-list`, `cast-input`, `decode-summary`, `source-integrity-report`, `source-beat` testid'leri; `getByLabel('Proje konusu')`; `'Decode + Kayıpsız Ingest'` buton adı; sağ ray `source-right-rail` PASS metni.

**Bilinçli e2e evrimleri:** `smoke.spec.ts:114-129` design testi SİLİNİR; `smoke.spec.ts:82` `FAIL` beklentisi `INGEST BEKLİYOR`ya döner (kaynak düzenlenince rapor düşer → dürüst sıradaki-adım dili).

---

### Task 1: DESIGN verisi + tipler ölür (presets, store)

**Files:**
- Modify: `src/data/presets.ts` (interface `kind` alanı ~L47; `kind: 'video'` satırları; `PHASE0_DESIGN` bloğu L484–674)
- Modify: `src/store/useStudioStore.ts` (L33 `ProjectKind`, L124 alan, L221 default, L305 + L772 snapshot, L533 persist anahtarı)
- Test: `src/data/presets.test.ts`, `src/core/advisor.test.ts`

- [x] **Step 1: Testleri video-only gerçeğe çevir**

`src/data/presets.test.ts`: `PHASE0_DESIGN` import'unu ve "DESIGN presets" testini (L22–28) sil; L33–36 ve L39, L49–57'deki `[...PHASE0_VIDEO, ...PHASE0_DESIGN]` birleşik dizilerini `PHASE0_VIDEO` ile değiştir. Şu invariant testini EKLE:

```ts
it('contains only video archetypes — DESIGN path is retired', () => {
  expect(PHASE0_VIDEO.length).toBeGreaterThanOrEqual(8);
  const src = fs.readFileSync(path.join(__dirname, 'presets.ts'), 'utf8');
  expect(src).not.toMatch(/PHASE0_DESIGN/);
});
```

(dosyada `fs`/`path` importu yoksa `import fs from 'node:fs'; import path from 'node:path';` ekle — voicePortraits testindeki desen.)

`src/core/advisor.test.ts` L100–103: `PHASE0_DESIGN` import'unu sil, iterasyonu sadece `PHASE0_VIDEO` üzerinden yap.

- [x] **Step 2: Testin kırıldığını gör**

Run: `npx vitest run src/data/presets.test.ts`
Expected: FAIL (`PHASE0_DESIGN` hâlâ kaynakta).

- [x] **Step 3: presets.ts'ten DESIGN'ı sök**

- `Phase0Preset` interface'inden `kind: 'video' | 'design';` satırını sil.
- Tüm `kind: 'video',` satırlarını sil (8 adet).
- `export const PHASE0_DESIGN ...` bloğunu (L484'ten dosyadaki kapanışına, 7 preset) tamamen sil.
- Artık kullanılmayan lucide ikon import'larını temizle (tsc `noUnusedLocals` söyler; ör. `ImageIcon` sadece design'daysa gider).

- [x] **Step 4: store'dan projectKind'ı sök**

`src/store/useStudioStore.ts`:
- L33 `export type ProjectKind = 'video' | 'design';` sil.
- L124 `projectKind: ProjectKind;` sil.
- L221 `projectKind: 'video' as ProjectKind,` sil.
- L305 ve L772 snapshot objelerinden `projectKind: s.projectKind,` satırlarını sil.
- L533 persist listesinden `'projectKind',` anahtarını sil.
- NOT: localStorage'daki eski snapshot'larda kalan `projectKind` anahtarı zararsızdır (kimse okumaz) — migration YAZMA.

- [x] **Step 5: tsc'nin gösterdiği kırıkları not al, düzeltme sırasını boz**

Run: `npx tsc --noEmit 2>&1 | head -40`
Expected: FAIL — pure/brain/commandExport/productionExport/exporters + Dashboard/Director/Timeline hataları. Bunlar Task 2–3'ün işi; bu task'ta SADECE presets+store+iki test dosyası değişir. Commit'i Task 2 sonuna bırakma — tsc kırıkken commit atma kuralı yüzünden Task 1+2 tek commit olabilir; tercihen Task 2 ile birlikte commit'le (aşağıda).

### Task 2: Core'dan design dalları sökülür

**Files:**
- Modify: `src/core/pure.ts` (L221, L959, L1001–1006, L1111, L1120, L1169, L1178, L1210, L1223)
- Modify: `src/core/brain.ts` (L543, L633, L641, L643, L654, L734–735, L812–827)
- Modify: `src/core/commandExport.ts` (L11, L72–73, L91, L114, L178–191)
- Modify: `src/core/productionExport.ts` (L36, L46, L52, L75–76, L93, L110)
- Modify: `src/core/exporters.ts` (L4, L55, L117)
- Modify: `src/core/audit_full.ts` (L485)
- Test: `src/core/pure.test.ts` (L361–368), `src/core/commandExport.test.ts` (L93–94), `src/core/productionExport.test.ts` (L136–137)

- [x] **Step 1: Core testlerinden design vakalarını çıkar + video invariantı ekle**

- `pure.test.ts` L361–368: `projectKind: 'design'` testini tamamen sil (`NOT_APPLICABLE_STATIC_DESIGN` assert'leri dahil).
- `commandExport.test.ts` L93–94 design vakasını sil. Yerine invariant ekle:

```ts
it('activeRoles always ships the full video pipeline', () => {
  expect(activeRoles()).toEqual(['idea', 'image', 'motion', 'suno', 'proof']);
});
```

- `productionExport.test.ts` L136–137 design vakasını sil; mevcut bir video testine `motionStatus: 'PENDING_IMAGE'` assert'i yoksa ekle.

- [x] **Step 2: pure.ts**

- L221 input tipinden `projectKind?: 'video' | 'design';` sil.
- L959 SceneHandoff arg'ından `projectKind` parametresini sil.
- L1001–1006: design koşulunu sil — MOTION ve SUNO her zaman üretilir; `NOT_APPLICABLE_STATIC_DESIGN` warning kodu tip tanımından ve üretiminden tamamen gider.
- L1111 `projectKind || 'video'` fallback'i sil.
- L1120 ve L1178'deki design-null dallarını sil (sunoBrief/motionPrompt her zaman dolu).
- L1169, L1210, L1223: downstream'e `projectKind` geçişlerini sil.

- [x] **Step 3: brain.ts**

- L543 ve L654 ctx tiplerinden `projectKind?: ...` sil.
- L633/L641/L643: image final-state her zaman video dili — `'Clean motion-ready start frame.'` ve `'motion start frame'` kalır, ternary'ler düzleşir.
- L734–735 deliverable markdown ternary'si video koluna düşer.
- L812–827: `'## 6. I2V Anchor Law'` her zaman; `'## 6. Static Design Law'` dalı ve içeriği silinir; `'## 8. Sound'` bloğu koşulsuz üretilir.

- [x] **Step 4: commandExport.ts + productionExport.ts + exporters.ts + audit_full.ts**

- `commandExport.ts`: L11 spec alanından `projectKind` sil; L72–73 `activeRoles(kind)` → argsız `activeRoles()` sabit `['idea','image','motion','suno','proof']`; L91/L114/L178/L181/L183/L191 design null-check'leri düzleşir (motion/suno her zaman yazılır). Çağıran her yer argsız forma güncellenir.
- `productionExport.ts`: L36 `isDesign` sil; L46 `motionFile` her zaman dolu; L52 `motionStatus: 'PENDING_IMAGE'` sabit; L75–76 açıklamalar koşulsuz; L93 motionGate ve L110 music video koluna düşer.
- `exporters.ts`: L4 tip alanı + L55/L117 `design` const'ları ve dalları silinir.
- `audit_full.ts` L485: `'STATIC DESIGN LAW'` sinyal kontrolü silinir.

- [x] **Step 5: Kalıntı taraması + gate**

Run: `grep -rn "projectKind\|PHASE0_DESIGN\|NOT_APPLICABLE_STATIC_DESIGN\|Static Design Law\|STATIC DESIGN" src/ --include="*.ts" --include="*.tsx" | grep -v ".test."`
Expected: SADECE Task 3'ün UI dosyaları (Dashboard/Director/Timeline) listelenir. Core'da sıfır.
Run: `npx vitest run src/core src/data`
Expected: PASS (UI dosyaları tsc'de hâlâ kırık olabilir — vitest core/data yeşil yeter).

### Task 3: UI'dan design sökülür + e2e evrimi

**Files:**
- Modify: `src/pages/Dashboard/DashboardStep.tsx` (L5 import, L16/L22 kind state, L37 presets, L45 applyPreset, L74–101 toggle bloğu)
- Modify: `src/pages/Director/DirectorStep.tsx` (L115, L129 `projectKind: preset.kind`, L163 'STATİK TASARIM' ternary)
- Modify: `src/pages/Timeline/TimelineStep.tsx` (L72, L106, L110–117, L190–194, L210, L248, L251, L281, L298, L302, L326 ternary'leri video koluna düşer)
- Modify: `e2e/smoke.spec.ts` (L114–129 design testi silinir)

- [x] **Step 1: DashboardStep**

- L5: `PHASE0_DESIGN` import'unu sil.
- L22 `const [kind, setKind] = ...` state'ini ve L74–101 VIDEO/DESIGN toggle butonlarını tamamen sil.
- L37 → `const presets = PHASE0_VIDEO;`
- L45 `applyPreset({...})` çağrısından `projectKind: p.kind,` sil.
- L16 destructure'dan `projectKind` sil.

- [x] **Step 2: DirectorStep + TimelineStep**

- DirectorStep L115/L129: `projectKind: preset.kind` geçişlerini sil; L163 etiket sabit `'VİDEO ÜRETİM'`.
- TimelineStep: tüm `state.projectKind === 'design'` ternary'leri video koluna düşer (L72 `packets: s.handoff`, L106 `'TIMELINE'`, L111 sahne sayacı, L190 `'Sahne yok — motoru çalıştır'`, L210 `'Sahneler'`, L248/251/298/302/326 sahne dili). `'TASARIM ÜRET'` gibi design-only buton metni varsa video karşılığına düşer.

- [x] **Step 3: e2e design testi sil**

`e2e/smoke.spec.ts` L114–129 (`design preset produces an honest static IMAGE-only delivery`) testini tamamen sil.

- [x] **Step 4: Tam kalıntı + gate**

Run: `grep -rn "projectKind\|PHASE0_DESIGN\|DESIGN · \|STATİK TASARIM\|DESIGN TESLİMİ" src/ e2e/ --include="*.ts" --include="*.tsx"`
Expected: 0 satır.
Run: `npx tsc --noEmit && npx vitest run`
Expected: tsc 0, tüm suite PASS.

- [x] **Step 5: Commit (Task 1+2+3 birlikte)**

```bash
git add -A src/ e2e/
git commit -m "feat(t3): DESIGN yolu emekli — projectKind kökten söküldü, video tek gerçek (data+core+UI+test)"
```

### Task 4: Görselli arketip kartları (slot + fallback)

**Files:**
- Create: `src/components/PresetPlate.tsx`
- Modify: `src/pages/Dashboard/DashboardStep.tsx` (preset kart gövdesi L109–157)
- Modify: `scripts/check-assets3d.mjs` (preset plate listesi — non-strict bilgi satırı)
- Test: `src/components/presetPlate.test.ts` (dosya-adı sözleşmesi)

- [x] **Step 1: Sözleşme testi yaz**

`src/components/presetPlate.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { PRESET_PLATE_FILES } from './PresetPlate';
import { PHASE0_VIDEO } from '../data/presets';

describe('preset plate contract', () => {
  it('lists exactly one webp slot per video archetype', () => {
    expect(PRESET_PLATE_FILES).toEqual(PHASE0_VIDEO.map((p) => `${p.id}.webp`));
  });
});
```

Run: `npx vitest run src/components/presetPlate.test.ts` → FAIL (modül yok).

- [x] **Step 2: PresetPlate bileşeni**

`src/components/PresetPlate.tsx` — `AdvisorPortrait` deseni (img + onError fallback):

```tsx
import React from 'react';
import { PHASE0_VIDEO } from '../data/presets';

export const PRESET_PLATE_FILES = PHASE0_VIDEO.map((p) => `${p.id}.webp`);

interface PresetPlateProps {
  presetId: string;
  fallback: React.ReactNode;
  height?: number;
}

export const PresetPlate: React.FC<PresetPlateProps> = ({ presetId, fallback, height = 96 }) => {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => { setFailed(false); }, [presetId]);
  if (failed) return <>{fallback}</>;
  return (
    <img
      src={`/assets3d/presets/${presetId}.webp`}
      alt=""
      aria-hidden
      draggable={false}
      onError={() => setFailed(true)}
      style={{ display: 'block', width: '100%', height, objectFit: 'cover', borderRadius: 6, pointerEvents: 'none', userSelect: 'none' }}
    />
  );
};
```

Run: `npx vitest run src/components/presetPlate.test.ts` → PASS.

- [x] **Step 3: Kartlara bağla**

DashboardStep preset kartında (mevcut motion.button gövdesi) ikon kutusunun yerine:

```tsx
<PresetPlate
  presetId={p.id}
  fallback={
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '100%', height: 96, borderRadius: 6,
      background: active ? 'var(--m2-amber-soft)' : 'var(--m2-surface-2)',
      color: active ? 'var(--m2-amber)' : 'var(--m2-muted)',
      border: `1px solid ${active ? 'var(--m2-amber)' : 'var(--m2-line)'}`,
    }}>
      <p.icon size={26} strokeWidth={1.75} />
    </div>
  }
/>
```

Izgara ferahlar: `gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))'`, `gap: 16`. Kart padding `16px 14px` kalır, label 13→14px.

- [x] **Step 4: check-assets3d kaydı**

`scripts/check-assets3d.mjs` içine `public/assets3d/presets/` altında 8 dosyayı sayan NON-STRICT bir bölüm ekle (eksikse uyarı satırı, exit code'u ETKİLEMEZ — `--strict`'te de fail etmez; plate'ler kademeli dolacak). Dosya listesi: `product_brand.webp, edu_explainer.webp, cinematic_story.webp, social_short.webp, doc_human.webp, corp_public.webp, event_campaign.webp, stylized_game.webp`.

- [x] **Step 5: Gate + commit**

Run: `npx tsc --noEmit && npx vitest run && node scripts/check-assets3d.mjs`
Expected: hepsi geçer (plate uyarıları bilgi amaçlı).

```bash
git add src/components/PresetPlate.tsx src/components/presetPlate.test.ts src/pages/Dashboard/DashboardStep.tsx scripts/check-assets3d.mjs
git commit -m "feat(t3): Phase 0 arketip kartlarına görsel plate slotu — /assets3d/presets/<id>.webp, ikon fallback"
```

### Task 5: Dashboard ≤3 bölge + tek CTA + boş durum onboarding

**Files:**
- Modify: `src/pages/Dashboard/DashboardStep.tsx` (yerleşim; L63–71 decision band; L189–196 çift CTA; L232–238 PASS/FAIL satırı; panel birleşmeleri)
- Modify: `src/components/Layout/AppLayout.tsx` (L139–156 SOURCE GATE kartı copy/durumları)
- Modify: `e2e/smoke.spec.ts` (L82 `FAIL` → `INGEST BEKLİYOR`)

- [x] **Step 1: Yerleşim — 3 bölge**

DashboardStep gövdesi şu sıraya iner (testid/label kontratları AYNEN korunur):
1. **BAŞLANGIÇ** — header (mevcut) + Phase 0 arketip ızgarası. `dashboard-decision-band` (L63–71 "CABINET READ" bandı) SİLİNİR — mesajı header `<p>`'sine tek cümle olarak katılır: `'Hazır bir arketiple başla ya da kaynağı yapıştır. Cabinet kilit kararları sonradan tartar.'`
2. **KAYNAK** — "Brief decode & kayıpsız ingest" paneli olduğu gibi (textarea + decode-summary + metrics + beats).
3. **AYRINTILAR** — TEK `Panel` (`title="Ayrıntılar"`): içinde mevcut Konu&Sınıf form grid'i (Reçeteyi kur aside'ı dahil), altında Karakter `Field`'ı (`cast-input`), altında Proje Kasası bloğu (`vault-*` testid'leri aynen). Üç ayrı Panel tek panele iner; iç başlıklar `ml-v3-eyebrow` satırlarıyla ayrılır (`KONU & SINIF`, `KARAKTER (OPSİYONEL)`, `PROJE KASASI`). Alttaki "Yönetmene geç / Reçeteye geç" butonu kalır.

- [x] **Step 2: Çift CTA teke iner**

L189–196: `'Decode reçetesini uygula'` ghost butonu SİLİNİR. Tek buton kalır: `'Decode + Kayıpsız Ingest'` (aynı `onClick={() => { decodeRawSource(); ingestRawSource(); }}`). e2e zaten bu adı kullanıyor — isim değişmez.

- [x] **Step 3: Boş durum onboarding — Dashboard satırı**

L232–238 PASS/FAIL satırı şu üç-durumlu dile döner:

```tsx
{rawSource.length > 0 && (
  <div style={{ marginTop: 14, fontSize: 12, color: sourceGate.ready ? 'var(--green)' : sourceReport && !sourceReport.ok ? 'var(--red)' : 'var(--m2-amber)' }}>
    {sourceGate.ready
      ? `PASS · ${selectedProjectId} · kaynak üretim için kilitli.`
      : sourceReport && !sourceReport.ok
        ? `Kaynak bütünlüğü ${sourceReport.coverage}% — %100 için metni değiştirmeden yeniden ingest et.`
        : 'Sıradaki adım: "Decode + Kayıpsız Ingest" — kaynak beat\'lere kilitlensin.'}
  </div>
)}
```

- [x] **Step 4: SOURCE GATE kartı onboarding — AppLayout**

L139–156 kartı SOURCE GATE odaklı kalır, durum dili değişir:

```tsx
<div className="ml-v3-eyebrow">SOURCE GATE</div>
<div className="ml-v3-status" style={{ color: sourceGate.ready && rawSource ? 'var(--m2-paper)' : rawSource ? (sourceReport && !sourceReport.ok ? 'var(--m2-danger)' : 'var(--m2-amber)') : 'var(--m2-muted)' }}>
  {!rawSource ? 'BEKLİYOR' : sourceGate.ready ? 'PASS' : sourceReport && !sourceReport.ok ? 'FAIL' : 'INGEST BEKLİYOR'}
</div>
<p className="ml-v3-copy">
  {!rawSource
    ? 'İlk adım: müşteri metnini Brief\'e yapıştır. Konu bazlı üretim de açık — kanonik kilit istersen kaynak gir.'
    : sourceGate.ready
      ? 'Ham kaynak beat zinciriyle birebir eşleşiyor. Üretim kapısı açık.'
      : sourceReport && !sourceReport.ok
        ? sourceGate.reason
        : 'Metin hazır. "Decode + Kayıpsız Ingest" ile beat\'lere kilitle.'}
</p>
```

(AppLayout'ta `sourceReport` zaten scope'ta — L152'de kullanılıyor.)

- [x] **Step 5: e2e beklentisini evrilt**

`e2e/smoke.spec.ts` L82: `toContainText('FAIL')` → `toContainText('INGEST BEKLİYOR')` (kaynak düzenlenince rapor düşer; dürüst sıradaki-adım). `beat-planner.spec.ts` L20 `PASS` beklentisi değişmez.

- [x] **Step 6: Gate + görsel kanıt + commit**

Run: `npx tsc --noEmit && npx vitest run && npm run build`
Run: `lsof -ti:5173 | xargs kill 2>/dev/null; npx playwright test e2e/smoke.spec.ts e2e/beat-planner.spec.ts`
Expected: hepsi PASS.
Run: `node scripts/design-tour-shots.mjs` (varsa) ya da mevcut screenshot script'i — Brief karesi `reports/t3-brief-*.png` olarak kaydedilir; boş durum + dolu durum iki kare.

```bash
git add -A src/ e2e/ reports/
git commit -m "feat(t3): Brief tek bakışta 3 bölge — görselli arketipler, tek CTA, FAIL yerine onboarding dili"
```

### Task 6: Docs hizası + Mami asset hedef dosyası

**Files:**
- Delete: `agents/claude/05_DESIGN_CLAUDE.md`, `agents/gpt/05_DESIGN_GPT.md`, `knowledge/05_DESIGN_KNOWLEDGE.md`
- Modify: `agents/README.md` (DESIGN role packet referansları), `agents/GLOBAL_BRAIN.md` (L81 `STATIC DESIGN LAW` satırı), `agents/gpt/02_IMAGE_GPT.md` (L47–50 mode ayrımı), `agents/claude/02_IMAGE_CLAUDE.md` (varsa aynı ayrım)
- Create: `docs/superpowers/specs/PRESET_PLATES_GOAL_T3.md`

- [x] **Step 1: DESIGN doc'larını sil + referansları temizle**

Üç 05_DESIGN dosyasını sil (06/07 numaraları YENİDEN NUMARALANMAZ). README'de DESIGN role/packet geçen satırları çıkar; GLOBAL_BRAIN L81'den `STATIC DESIGN LAW` maddesini sil; 02_IMAGE adapterlarındaki video/design mode ayrımı video-tek dile iner.

Run: `grep -rn "DESIGN" agents/ knowledge/ | grep -v "motion_design_flat" | grep -vi "redesign"`
Expected: 0 anlamlı satır.

- [x] **Step 2: PRESET_PLATES_GOAL_T3.md**

CHARACTERS_GOAL_T2.md desenінde: hedef klasör `public/assets3d/presets/`, 8 dosya adı (Task 4 listesi), format 16:10 webp ≥ 736×460, üslup: painterly, dünya-plate ailesiyle akraba, metin/logo yok; teslim sonrası `node scripts/check-assets3d.mjs` ile görünürlük; eksik dosya = ikon fallback (site kırılmaz).

- [x] **Step 3: Commit**

```bash
git add -A agents/ knowledge/ docs/
git commit -m "docs(t3): DESIGN adapterleri emekli + preset plate teslim sözleşmesi (PRESET_PLATES_GOAL_T3)"
```

### Task 7: Kapanış gate'i + kanıt

- [x] **Step 1: Tam gate**

Run: `npx tsc --noEmit && npx vitest run && npm run build && zsh -n start-mamilas.command agents/MOTION-CALISTIR.command agents/production/MOTION-CALISTIR.command && npm run test:e2e`
Expected: tsc 0 · vitest tümü PASS (design testleri düştüğü için sayı 384'ten farklı olabilir — düşüş SADECE silinen design vakaları kadar, yeni invariant testleri eklenmiş olmalı) · build OK.
e2e GERÇEĞİ (baseline ölçümüyle düzeltildi): smoke:28/93/138/163 T2 HEAD'inde (c4625b2, temiz worktree) de KIRIK — bilinen preset/director bug'ı (plan "Kapsam dışı" bölümünde "5 e2e" diye kayıtlı; 5.si sildiğimiz design testiydi). T3 kabul ölçütü: YENİ e2e kırığı yok (aquarium/beat-planner/scene-smoke/screenshots + smoke'un geçen 6'sı yeşil kalır); bu 4 bilinen kırık ayrı seansın işi.

- [x] **Step 2: Kalıntı final taraması**

Run: `grep -rn "projectKind\|PHASE0_DESIGN\|NOT_APPLICABLE_STATIC_DESIGN\|Static Design\|STATİK TASARIM\|DESIGN TESLİMİ" src/ e2e/ agents/ knowledge/ | grep -v "motion_design_flat"`
Expected: 0 satır.

- [x] **Step 3: Görsel kanıt galerisi**

`reports/t3-*` kareleri: Brief boş durum (onboarding), Brief dolu durum (PASS), Phase 0 ızgara (fallback ikonlarıyla). Mami'ye sunulur.

- [x] **Step 4: Final commit (plan doc işaretli)**

```bash
git add docs/superpowers/plans/2026-07-04-t3-brief-sadelesmesi.md reports/
git commit -m "docs(t3): plan tamamlandı + kanıt kareleri"
```

---

## KAPANIŞ KAYDI (2026-07-04, Task 7)

- Gate: tsc 0 · vitest 384/384 · build OK · 3 `.command` syntax OK.
- Kalıntı taraması: tek eşleşme `src/data/presets.test.ts:12` — kalıntı değil, kalıntıyı yasaklayan invariant testinin kendisi. Temiz.
- e2e: 9 passed / 6 failed. **Baseline düzeltmesi:** Step 1'deki "beat-planner + screenshots yeşil kalır" kaydı YANLIŞTI — ikisi de T2 HEAD'inde (c4625b2, temiz worktree, bu kapanışta yeniden ölçüldü) aynen kırık. 6 kırığın 6'sı da baseline'da mevcut (4 smoke + beat-planner + screenshots = hepsi bilinen preset/director bug ailesi; hepsi Phase 0 preset akışından geçiyor). T3 kabul ölçütü sağlandı: YENİ e2e kırığı yok.
- Kanıt: reports/t3-brief-empty.png (onboarding) · t3-brief-pass.png (PASS rail) · t3-phase0-grid.png (8 arketip, fallback ikonlar). Üretici: scripts/t3-brief-shots.mjs (bu commit'te eklendi; Panel başlığı DOM'da toUpperCase'li — locator subtitle üzerinden).
- Bütün-tur final review (bağımsız ajan): 0 blocker. 3 bulgu doğrulama sonrası REDDEDİLDİ: (1) pure.ts:672 TASARIM|DESIGN regex'i T3 öncesi (2026-06-21) serbest-metin heuristiği, yaşayan STYLIZED_PREMIUM path'ine döner — kalıntı değil; (2) presetPlate CONTRACT literal listesi a64376c'nin bilinçli kararı — 9. preset'te kırılması teslim sözleşmesini güncellemeye zorlar, istenen davranış; (3) AppLayout:144 FAIL durumu gerçek başarısız rapor sinyali, onboarding dili sadece boş durum içindi.
