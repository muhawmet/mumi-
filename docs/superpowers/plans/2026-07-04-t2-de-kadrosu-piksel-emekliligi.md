# T2 — Gerçek DE Kadrosu + Piksel Emekliliği Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** QA Cabinet ve Çizim Ekranı'ndaki piksel-art motoru emekli olur (fallback hariç), painterly portre/plate diline geçilir; Mami gerçek Disco Elysium portrelerini kod değişmeden dosya atarak devreye alabilir.

**Architecture:** Portre ve plate seçimleri saf TS haritalarında yaşar (test edilebilir), UI komponentleri `<img>` + `onError`→prosedürel fallback deseniyle (AdvisorPortrait deseni) asset'e bağlanır. `scripts/check-assets3d.mjs` sözleşmeyi doğrular; `docs/superpowers/specs/CHARACTERS_GOAL_T2.md` Mami'nin teslim prosedürüdür.

**Tech Stack:** Vite + React + TS + Zustand, vitest (node env — komponent testi yok, görsel kanıt screenshot'la), mevcut asset slot deseni (`assetSlots.ts` / `AdvisorPortrait.tsx`).

**Üst plan bağlamı:** `~/.claude/plans/inherited-humming-petal.md` T2 (envanter 2, 15, 19). Kurallar: beyin dosyaları (`src/core/*` mantığı) dokunulmaz, 5180 canlı sitesi dokunulmaz, push yok, vitest taban 376 düşmez, QA cabinet'in övülen SKILL_COLORS ses paleti korunur (yalnız NOW SPEAKING eyebrow'u buz token'ına iner).

**Önemli mevcut gerçekler (keşifle doğrulandı):**
- `public/assets/characters/`: 9 png var (harry_du_bois, kim_kitsuragi, skill_{volition,perception,shivers,logic,visual_calculus,drama,case_ledger}) — hepsi 512×512.
- `core/qa.ts` SkillId = visual_calculus | conceptualization | drama | encyclopedia | inland_empire | prompt_surgeon | volition. QAStep bugün `CharacterStage spriteId={tip.skill}` kullanıyor (piksel).
- `CHARACTER_SPRITES` anahtarlarında `prompt_surgeon`, `perception`, `shivers`, `logic` YOK (default mascot'a düşer) — fallback id'leri mevcut anahtarlardan seçilmeli.
- `innerVoices.ts`'in fiilen kullandığı sesler: Logic, Case Ledger, Director, Shivers, Visual Calculus, Perception, Rhetoric, Electrochemistry, Drama, Volition. `VOICE_PORTRAIT`'te Rhetoric/Electrochemistry/Director eksik.
- SURGERY_DATA world grupları (7): ANIMATION_EDU, ANIMATION_PAINTERLY, ANIMATION_STYLIZED, ANIMATION_DARK, ANIMATION_BOLD_CEL, ANIMATION_CEL_3D_HYBRID, CINEMATIC_REAL. `PreviewStage.GROUP_COLOR` bayat anahtarlar taşıyor (IP_WORLD/ANIMATION/REAL/STYLIZED — hepsi ölü), `isIPWorld` hep false, ARC_MAP'te 3 bayat world id var (one_piece_grand_line→one_piece_toei, demon_slayer_taisho→demon_slayer_ufotable, jjk_cursed_domain→jjk_mappa olmalı).
- Buz token'ı: `--v3-ice: #8fa3c2` (design_v3.css :root, designLaws.test.ts korur).
- Plate asset'leri mevcut: `public/assets3d/card-{hero,detective,arcane,explorer}-archetype.webp` + `logo-card.webp` (1024×1448).
- `check-assets3d.mjs` default modda exit 0 (rapor), `--strict` yalnız asset kabulünde.

---

### Task 1: worldPlates.ts — grup→plate haritası (TDD)

**Files:**
- Create: `src/components/worldPlates.ts`
- Test: `src/components/worldPlates.test.ts`

- [ ] **Step 1: Failing test yaz**

```ts
// src/components/worldPlates.test.ts
import { describe, expect, it } from 'vitest';
import { DATA } from '../core/pure';
import { PLATE_BY_GROUP, plateSlotFor } from './worldPlates';

describe('worldPlates — painterly plate haritası', () => {
  it('SURGERY_DATA içindeki HER world grubu için açık plate tanımlı', () => {
    const groups = new Set(DATA.worlds.map((w) => w.group));
    expect(groups.size).toBeGreaterThanOrEqual(7);
    for (const group of groups) {
      expect(PLATE_BY_GROUP[group], `plate for group ${group}`).toBeTruthy();
    }
  });

  it('dünya seçilmemişken atölye amblemine (logo-card) düşer', () => {
    expect(plateSlotFor(undefined)).toBe('logo-card');
    expect(plateSlotFor('')).toBe('logo-card');
  });

  it('bilinmeyen grup hero arketipine düşer', () => {
    expect(plateSlotFor('YENI_GRUP')).toBe('card-hero-archetype');
  });

  it('grup eşlemeleri arketip yönelimlerine uyar', () => {
    expect(plateSlotFor('ANIMATION_EDU')).toBe('card-explorer-archetype');
    expect(plateSlotFor('CINEMATIC_REAL')).toBe('card-detective-archetype');
    expect(plateSlotFor('ANIMATION_DARK')).toBe('card-detective-archetype');
    expect(plateSlotFor('ANIMATION_PAINTERLY')).toBe('card-arcane-archetype');
    expect(plateSlotFor('ANIMATION_STYLIZED')).toBe('card-hero-archetype');
  });
});
```

- [ ] **Step 2: Testin FAIL ettiğini gör**

Run: `npx vitest run src/components/worldPlates.test.ts`
Expected: FAIL — `Cannot find module './worldPlates'`

- [ ] **Step 3: Minimal implementasyon**

```ts
// src/components/worldPlates.ts
/** Çizim Ekranı painterly plate sözleşmesi — dosyalar public/assets3d/<slot>.webp (M4 slot deseni). */
export type PlateSlot =
  | 'card-hero-archetype'
  | 'card-detective-archetype'
  | 'card-arcane-archetype'
  | 'card-explorer-archetype'
  | 'logo-card';

export const PLATE_BY_GROUP: Record<string, PlateSlot> = {
  ANIMATION_EDU: 'card-explorer-archetype',
  ANIMATION_PAINTERLY: 'card-arcane-archetype',
  ANIMATION_STYLIZED: 'card-hero-archetype',
  ANIMATION_DARK: 'card-detective-archetype',
  ANIMATION_BOLD_CEL: 'card-hero-archetype',
  ANIMATION_CEL_3D_HYBRID: 'card-hero-archetype',
  CINEMATIC_REAL: 'card-detective-archetype',
};

export function plateSlotFor(group?: string): PlateSlot {
  if (!group) return 'logo-card';
  return PLATE_BY_GROUP[group] ?? 'card-hero-archetype';
}

export function plateUrl(slot: PlateSlot): string {
  return `/assets3d/${slot}.webp`;
}
```

- [ ] **Step 4: Testin PASS ettiğini gör**

Run: `npx vitest run src/components/worldPlates.test.ts`
Expected: 4 test PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/worldPlates.ts src/components/worldPlates.test.ts
git commit -m "feat(t2): worldPlates — grup→painterly plate haritası (7 grup + logo fallback, testli)"
```

---

### Task 2: QA_PORTRAIT + VOICE_PORTRAIT tamamlama (TDD)

**Files:**
- Modify: `src/components/ThoughtBubble/voicePortraits.ts`
- Test: `src/components/ThoughtBubble/voicePortraits.test.ts` (yeni)

- [ ] **Step 1: Failing test yaz**

```ts
// src/components/ThoughtBubble/voicePortraits.test.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CHARACTER_SPRITES } from '../characterSprites';
import { FALLBACK_PORTRAIT, QA_PORTRAIT, VOICE_PORTRAIT } from './voicePortraits';

const QA_SKILLS = [
  'visual_calculus', 'conceptualization', 'drama', 'encyclopedia',
  'inland_empire', 'prompt_surgeon', 'volition',
] as const;

describe('voicePortraits — kadro kapsamı', () => {
  it('QA_PORTRAIT cabinet 7 sesin tamamını kapsar, id kanonik dosya adıdır', () => {
    for (const skill of QA_SKILLS) {
      const entry = QA_PORTRAIT[skill];
      expect(entry, `portrait for ${skill}`).toBeTruthy();
      expect(entry.id).toMatch(/^[a-z_]+$/);
    }
  });

  it('QA_PORTRAIT fallback sprite idleri CHARACTER_SPRITES içinde gerçekten var', () => {
    for (const skill of QA_SKILLS) {
      expect(CHARACTER_SPRITES[QA_PORTRAIT[skill].fallback],
        `sprite for ${QA_PORTRAIT[skill].fallback}`).toBeTruthy();
    }
  });

  it('innerVoices.ts içinde fiilen konuşan HER ses VOICE_PORTRAIT haritasında', () => {
    const src = readFileSync(resolve(__dirname, '../innerVoices.ts'), 'utf8');
    const used = new Set<string>();
    for (const line of src.matchAll(/voice:\s*([^\n]+)/g)) {
      for (const quoted of line[1].matchAll(/'([^']+)'/g)) used.add(quoted[1]);
    }
    expect(used.size).toBeGreaterThanOrEqual(10);
    for (const voice of used) {
      expect((VOICE_PORTRAIT as Record<string, unknown>)[voice], `portrait for voice ${voice}`).toBeTruthy();
    }
  });

  it('VOICE_PORTRAIT fallback sprite idleri de sprite kayıtlarında var', () => {
    for (const [voice, entry] of Object.entries(VOICE_PORTRAIT)) {
      expect(CHARACTER_SPRITES[entry!.fallback], `sprite for ${voice}→${entry!.fallback}`).toBeTruthy();
    }
    expect(CHARACTER_SPRITES[FALLBACK_PORTRAIT.fallback]).toBeTruthy();
  });
});
```

- [ ] **Step 2: Testin FAIL ettiğini gör**

Run: `npx vitest run src/components/ThoughtBubble/voicePortraits.test.ts`
Expected: FAIL — `QA_PORTRAIT` export yok + Rhetoric/Electrochemistry/Director eksik

- [ ] **Step 3: voicePortraits.ts'i genişlet**

`VOICE_PORTRAIT` objesine üç giriş ekle (mevcut girişlere dokunma):

```ts
  Rhetoric: { id: 'skill_rhetoric', fallback: 'drama' },
  Electrochemistry: { id: 'skill_electrochemistry', fallback: 'inland_empire' },
  Director: { id: 'kim_kitsuragi', fallback: 'case_ledger' },
```

Dosyanın başına import ve sonuna QA haritası ekle:

```ts
import type { SkillId } from '../../core/qa';

/** QA Cabinet kadrosu — id = public/assets/characters/<id>.png (kanonik ad).
 * Dosya henüz yoksa AdvisorPortrait sprite fallback'ine düşer; Mami gerçek DE
 * art'ını aynı adla attığı an kod değişmeden portre devreye girer. */
export const QA_PORTRAIT: Record<SkillId, { id: string; fallback: string }> = {
  visual_calculus: { id: 'skill_visual_calculus', fallback: 'visual_calculus' },
  conceptualization: { id: 'skill_conceptualization', fallback: 'conceptualization' },
  drama: { id: 'skill_drama', fallback: 'drama' },
  encyclopedia: { id: 'skill_encyclopedia', fallback: 'encyclopedia' },
  inland_empire: { id: 'skill_inland_empire', fallback: 'inland_empire' },
  prompt_surgeon: { id: 'skill_prompt_surgeon', fallback: 'visual_calculus' },
  volition: { id: 'skill_volition', fallback: 'volition' },
};
```

(Not: `prompt_surgeon` sprite'ı CHARACTER_SPRITES'ta yok; en yakın kimlik `visual_calculus` — hassasiyet/ölçüm ailesi.)

- [ ] **Step 4: Testin PASS ettiğini gör**

Run: `npx vitest run src/components/ThoughtBubble/voicePortraits.test.ts`
Expected: 4 test PASS

- [ ] **Step 5: Tam suite koş (firewall/QA testleri kırılmadı mı)**

Run: `npx vitest run`
Expected: 376 + yeni testler, 0 fail

- [ ] **Step 6: Commit**

```bash
git add src/components/ThoughtBubble/voicePortraits.ts src/components/ThoughtBubble/voicePortraits.test.ts
git commit -m "feat(t2): QA_PORTRAIT haritası + VOICE_PORTRAIT'e Rhetoric/Electrochemistry/Director — kadro kapsamı testli"
```

---

### Task 3: QAStep — sprite→AdvisorPortrait + NOW SPEAKING buz ailesi

**Files:**
- Modify: `src/pages/QA/QAStep.tsx` (satır 8 import, satır 170-183 portre hücresi, satır 237-239 NOW SPEAKING)

- [ ] **Step 1: Import değişimi**

Satır 8: `import { CharacterStage } from '../../components/CharacterStage';` SİL, yerine:

```ts
import { AdvisorPortrait } from '../../components/AdvisorPortrait';
import { QA_PORTRAIT } from '../../components/ThoughtBubble/voicePortraits';
```

- [ ] **Step 2: Portre hücresi (satır ~182)**

`<CharacterStage spriteId={tip.skill} width={100} height={140} />` yerine:

```tsx
<AdvisorPortrait
  id={QA_PORTRAIT[tip.skill].id}
  fallbackSpriteId={QA_PORTRAIT[tip.skill].fallback}
  width={100}
  height={140}
/>
```

(Kapsayıcı div'in radial altın zemini ve `SKILL_COLORS` çerçevesi AYNEN kalır — övülen palet.)

- [ ] **Step 3: NOW SPEAKING eyebrow'u buz token'ına**

Satır ~237: `color: SKILL_COLORS[currentTip.skill]` olan NOW SPEAKING başlık div'inde renk `'var(--v3-ice)'` olur. Kartın `border` rengi ve altındaki skill adı `SKILL_COLORS`'ta KALIR:

```tsx
<div style={{ color: 'var(--v3-ice)', fontSize: 10, letterSpacing: 1.5, fontWeight: 900 }}>
  NOW SPEAKING
</div>
```

- [ ] **Step 4: Gate**

Run: `npx tsc --noEmit && npx vitest run`
Expected: tsc 0, tüm testler PASS (CharacterStage başka yerlerde yaşamaya devam eder — fallback motoru, silme YOK)

- [ ] **Step 5: Commit**

```bash
git add src/pages/QA/QAStep.tsx
git commit -m "feat(t2): QA Cabinet piksel sprite→painterly AdvisorPortrait + NOW SPEAKING buz ailesine (envanter 2,15)"
```

---

### Task 4: Çizim Ekranı — WorldPlate painterly durum kartı

**Files:**
- Create: `src/components/WorldPlate.tsx`
- Modify: `src/components/PreviewStage.tsx` (satır 6 import, 9-52 ARC_MAP bayat id'ler, 63-68 GROUP_COLOR, 93-101 isIPWorld, 131-141 canvas bloğu, 316-321 status noktaları)

- [ ] **Step 1: WorldPlate komponenti**

```tsx
// src/components/WorldPlate.tsx
import React from 'react';
import { CanvasPreview } from './CanvasPreview';
import { plateSlotFor, plateUrl } from './worldPlates';

interface WorldPlateProps {
  worldGroup?: string;
  // Gerçek fallback sözleşmesi: plate decode edemezse piksel compositor döner (V3.1 piksel yasağının tek istisnası).
  colors: string[];
  category: string;
  previewType: string;
  worldId: string;
  refId?: string;
  evidenceLabel?: string;
}

export const WorldPlate: React.FC<WorldPlateProps> = ({
  worldGroup, colors, category, previewType, worldId, refId, evidenceLabel,
}) => {
  const slot = plateSlotFor(worldGroup);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => { setFailed(false); }, [slot]);

  if (failed) {
    return (
      <CanvasPreview
        colors={colors}
        category={category}
        previewType={previewType}
        worldId={worldId}
        refId={refId}
        variant="rail"
        evidenceLabel={evidenceLabel}
      />
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <img
        src={plateUrl(slot)}
        alt=""
        aria-hidden
        draggable={false}
        onError={() => setFailed(true)}
        style={{
          display: 'block', width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center 30%',
          userSelect: 'none', pointerEvents: 'none',
        }}
      />
      {/* Overlay okunurluğu için sıcak scrim */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,9,7,0.34) 0%, rgba(10,9,7,0.05) 40%, rgba(10,9,7,0.52) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};
```

- [ ] **Step 2: PreviewStage — bayat ARC_MAP id'leri düzelt**

`ARC_MAP` anahtarlarını gerçek world id'lerine taşı (içerik aynı kalır):
- `one_piece_grand_line` → `one_piece_toei`
- `demon_slayer_taisho` → `demon_slayer_ufotable`
- `jjk_cursed_domain` → `jjk_mappa`

(`naruto_shinobi_world`, `bleach_soul_world`, `aot_wall_world`, `solo_leveling_gate` zaten doğru.)

- [ ] **Step 3: GROUP_COLOR'ı 7 gerçek gruba taşı**

```ts
const GROUP_COLOR: Record<string, string> = {
  ANIMATION_EDU: '#8fa3c2',
  ANIMATION_PAINTERLY: '#b89ad6',
  ANIMATION_STYLIZED: '#f7c948',
  ANIMATION_DARK: '#d6a84f',
  ANIMATION_BOLD_CEL: '#f7c948',
  ANIMATION_CEL_3D_HYBRID: '#f7c948',
  CINEMATIC_REAL: '#93c9a8',
};
```

- [ ] **Step 4: Ölü isIPWorld'ü arc-tabanlı yap**

`const isIPWorld = selectedWorld?.group === 'IP_WORLD';` yerine:

```ts
const hasArcGrammar = Boolean(store.selectedWorldId && ARC_MAP[store.selectedWorldId]);
```

`arcHint` memo'sundaki `isIPWorld` → `hasArcGrammar`; WORLD hücresindeki `{isIPWorld && (...ARC-AWARE...)}` → `{hasArcGrammar && (...)}`; `{!isIPWorld && selectedWorld?.group && (...)}` → `{!hasArcGrammar && selectedWorld?.group && (...)}`.

- [ ] **Step 5: Canvas bloğunu WorldPlate'e çevir**

Satır 133-141'deki `<CanvasPreview ... variant="rail" />` yerine:

```tsx
<WorldPlate
  worldGroup={selectedWorld?.group}
  colors={colors}
  category={state.category}
  previewType={activeRef?.preview || 'default'}
  worldId={store.selectedWorldId}
  refId={activeRef?.id}
  evidenceLabel={activeRef ? `${activeRef.cat} · ${activeRef.anchor || activeRef.id}` : state.worldName}
/>
```

Import satırı: `import { CanvasPreview } from './CanvasPreview';` → `import { WorldPlate } from './WorldPlate';` (PreviewStage artık CanvasPreview'u doğrudan kullanmaz). Üstteki badge/ref/arc overlay'leri ve palet köprü barı AYNEN kalır.

- [ ] **Step 6: BRIEF STATUS neon noktaları sage'e (eski keşif borcu)**

Satır ~316-321: `'#4ade80'` → `'var(--green)'`, `boxShadow: '0 0 7px #4ade8066'` → `'0 0 7px rgba(147, 201, 168, 0.4)'`, value rengi `ok ? 'var(--green)' : ...`.

- [ ] **Step 7: Gate + gözle kanıt**

```bash
npx tsc --noEmit && npx vitest run
lsof -ti:5173 | xargs kill 2>/dev/null; npm run dev &
```
Tarayıcı/screenshot: sağ ray Çizim Ekranı'nda painterly plate + scrim + badge'ler; world seçili değilken logo-card; QA ekranında painterly portreler. `node scripts/final-shots.mjs` koş, `output/playwright/*.png` gözle incele.
Expected: piksel kare YOK (fallback tetiklenmedikçe), overlay'ler okunur.

- [ ] **Step 8: Commit**

```bash
git add src/components/WorldPlate.tsx src/components/PreviewStage.tsx
git commit -m "feat(t2): Çizim Ekranı piksel compositor emekli — painterly WorldPlate + bayat grup/arc idleri onarıldı (envanter 2)"
```

---

### Task 5: Asset sözleşmesi — check-assets3d genişletme + Mami prosedür dosyası

**Files:**
- Modify: `scripts/check-assets3d.mjs` (EXPECTED listesi)
- Create: `docs/superpowers/specs/CHARACTERS_GOAL_T2.md`

- [ ] **Step 1: EXPECTED'a kadro dosyalarını ekle**

Mevcut 7 skill png satırının altına:

```js
  ['public/assets/characters/harry_du_bois.png', 512, 512],
  ['public/assets/characters/kim_kitsuragi.png', 512, 512],
  ['public/assets/characters/skill_conceptualization.png', 512, 512],
  ['public/assets/characters/skill_encyclopedia.png', 512, 512],
  ['public/assets/characters/skill_inland_empire.png', 512, 512],
  ['public/assets/characters/skill_prompt_surgeon.png', 512, 512],
  ['public/assets/characters/skill_rhetoric.png', 512, 512],
  ['public/assets/characters/skill_electrochemistry.png', 512, 512],
```

- [ ] **Step 2: Script'i koş, rapor doğru mu bak**

Run: `node scripts/check-assets3d.mjs`
Expected: exit 0; mevcut 9 karakter png ✓, 6 yeni kanonik ad EKSİK raporlanır (bu NORMAL — Mami dolduracak), `--strict` KOŞMA.

- [ ] **Step 3: CHARACTERS_GOAL_T2.md yaz**

İçerik (aynen bu iskelet, dosya yolları birebir):

```markdown
# CHARACTERS GOAL — T2 Gerçek DE Kadrosu (Mami prosedürü)

## Ne yapıyorsun
Gerçek Disco Elysium portre art'ını aşağıdaki adlarla `public/assets/characters/`
üstüne atıyorsun (üzerine yaz). KOD DEĞİŞMEZ — dosya adı sözleşmedir; dosya
göründüğü an UI painterly portreyi kendisi alır, dosya yoksa sprite fallback çalışır.

## Format kanunu
- 512×512 PNG, transparan zemin, portre büst kadrajı (baş+omuz)
- Painterly DE dili; metin/harf YOK; neon renk YOK (amber kimlikle uyum)

## Dosya listesi (15)
| Dosya | Kim | Durum |
|---|---|---|
| harry_du_bois.png | Harry Du Bois | VAR — gerçek art ile değiştir |
| kim_kitsuragi.png | Kim Kitsuragi (Director sesi) | VAR — gerçek art ile değiştir |
| skill_volition.png | Volition | VAR — değiştir |
| skill_perception.png | Perception | VAR — değiştir |
| skill_shivers.png | Shivers | VAR — değiştir |
| skill_logic.png | Logic | VAR — değiştir |
| skill_visual_calculus.png | Visual Calculus | VAR — değiştir |
| skill_drama.png | Drama | VAR — değiştir |
| skill_case_ledger.png | Case Ledger | VAR — değiştir |
| skill_conceptualization.png | Conceptualization | YOK — yeni |
| skill_encyclopedia.png | Encyclopedia | YOK — yeni |
| skill_inland_empire.png | Inland Empire | YOK — yeni |
| skill_prompt_surgeon.png | Prompt Surgeon (özgün MAMILAS sesi — DE'de yok, DE üslubunda cerrah/terzi) | YOK — yeni |
| skill_rhetoric.png | Rhetoric | YOK — yeni |
| skill_electrochemistry.png | Electrochemistry | YOK — yeni |

## Doğrulama
Dosyaları attıktan sonra:
    node scripts/check-assets3d.mjs
15/15 karakter satırı ✓ olmalı. Kabul anında: node scripts/check-assets3d.mjs --strict
Sonra tarayıcıda hard refresh (dev server restart gerekmez; görünmezse restart).
```

- [ ] **Step 4: Commit**

```bash
git add scripts/check-assets3d.mjs docs/superpowers/specs/CHARACTERS_GOAL_T2.md
git commit -m "docs(t2): kadro asset sözleşmesi — check-assets3d 15 portre + Mami teslim prosedürü"
```

---

### Task 6: Kapanış — tam gate + görsel kanıt + checkpoint

**Files:**
- Read-only doğrulama + `reports/` kanıtları

- [ ] **Step 1: Tam kalite kapısı**

/mamilas-gate skill'i ile: `npx tsc --noEmit` (0 hata) + `npx vitest run` (376+yeni, 0 fail) + `npm run build` (OK) + .command syntax.

- [ ] **Step 2: Görsel kanıt seti**

```bash
lsof -ti:5173 | xargs kill 2>/dev/null
node scripts/final-shots.mjs
```
`output/playwright/*.png` GÖZLE incele: (a) QA Cabinet painterly portreler + NOW SPEAKING buz, (b) sağ ray plate kartı + sage noktalar, (c) diğer 4 ekranda regresyon yok. Kanıt karelerini `reports/t2-*` altına kopyala.

- [ ] **Step 3: e2e smoke**

Run: `npx playwright test tests/e2e/ 2>/dev/null || npm run test:e2e`
Expected: aquarium/scene-smoke 3/3 (T1 kapanışındaki gibi). Çift-playwright kırığı sürerse NOT AL, bu görevde çözme.

- [ ] **Step 4: Kanıt commit'i + memory checkpoint**

```bash
git add reports/
git commit -m "chore(t2): T2 kanıt kareleri — painterly QA + plate rail"
```
Sonra /mamilas-checkpoint: memory'ye T2 kapanışı + "Mami'ye sunulacak galeri" notu yaz.

---

## Self-Review Notları
- Envanter 2 (iki dil savaşı): Task 3 + 4 kapatır (QA sprite + rail piksel canvas emekli; fallback istisnası V3.1 kanunu).
- Envanter 15 (NOW SPEAKING cyan): Task 3 Step 3, `--v3-ice` token'ı (buz ailesi = V3'ün meşru soğuk karşı-ışığı).
- Envanter 19 (gerçek DE art): Task 2 (kanonik id'ler) + Task 5 (sözleşme + prosedür) — kod değişmeden kadro değişir.
- RecipeThumb / RecipeStep CanvasPreview kullanımı BİLEREK kalıyor (T4/T5 kapsamı); CharacterStage fallback motoru olarak yaşıyor (silme yok).
- Tip tutarlılığı: `plateSlotFor(group?: string)` ↔ `selectedWorld?.group` (string|undefined) ✓; `QA_PORTRAIT: Record<SkillId,...>` tsc tarafından tamlık-zorunlu ✓.
