# T4 — Reçete Galeri Duvarı Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reçete ekranındaki world seçimi kapak-görselli kart galerisine dönüşür (`public/assets3d/worlds/<id>.webp`, kademeli dolar, eksik olan bugünkü karta düşer); materyal chip çorbası doku kartlarına, palet şeritleri adlı+hover-büyüyen şeritlere döner; detay paneli görsel-önce olur ve render_law "TEKNİK KANIT" parşömenine katlanır; seçili world dioramada duvar çerçevesine asılır.

**Architecture:** PresetPlate'in kanıtlanmış slot deseni (webp `onError` fallback + literal sözleşme testi + check-assets3d çapraz kontrol + Mami GOAL dosyası) world kapaklarına kopyalanır. Kapak dosya listesi `DATA.worlds`'ten türetilir (30 world). Diorama tarafında url-keyed texture cache (`loadSlotTexture` aynası) + `useStudioStore(selectedWorldId)` aboneliğiyle merkezde bir "hero frame" doğar; kapak yoksa grup plate'ine, o da yoksa parşömen placeholder'a düşer (V3 §7.11: sessiz düşüş yasak, uyarı bir kez).

**Tech Stack:** Vite + React + TS + Zustand + R3F/three; vitest (fs-sözleşme + pure logic testleri, repo deseni); Playwright screenshot kanıtı.

**Değişmezler:** UI Türkçe etiket disiplini · sage #93c9a8, neon yasak · hit-target oynatan animasyon yasak (Playwright stability dersi) · test sayısı 384'ten DÜŞMEZ · 5180'e dokunma · push yok · `cinedna_*` ref'lerine ve beyin dosyalarına (pure/brain/source/qa) DOKUNMA — bu plan yalnız UI+scene+script katmanı.

---

## File Structure

- **Create** `src/components/worldCovers.ts` — kapak sözleşmesi (dosya listesi + url helper), tek doğruluk kaynağı.
- **Create** `src/components/worldCovers.test.ts` — sözleşme testi (DATA.worlds ↔ dosya listesi birebir).
- **Create** `src/components/WorldCover.tsx` — webp + onError fallback bileşeni (PresetPlate aynası).
- **Create** `src/components/worldCover.test.ts` — kaynak-sözleşme testi (presetPlate.test.ts deseni).
- **Create** `src/scene/worldCoverTexture.ts` + `src/scene/worldCoverTexture.test.ts` — url-keyed texture cache (loadSlotTexture aynası, injected-loader ile testli).
- **Modify** `src/pages/Recipe/RecipeStep.tsx` — world listesi kapaklı kart, detay paneli görsel-önce + TEKNİK KANIT, materyal doku kartları, palet ad+hover.
- **Modify** `src/styles/design_v2.css` — `.recipe-world-button` kapak uyumu, `.recipe-palette-strip` hover büyümesi, `.recipe-material-card` kuralları (158-190 civarı mevcut recipe bloklarının yanına).
- **Modify** `src/scene/DioramaStage.tsx` — `WorldHeroFrame` (merkez çerçeve, store'a abone).
- **Modify** `scripts/check-assets3d.mjs` — `worlds/` bölümü (bilgilendirici sayaç; --strict'te bile FATAL DEĞİL — kademeli dolum sözleşmesi).
- **Create** `docs/superpowers/specs/WORLD_COVERS_GOAL_T4.md` — Mami teslim sözleşmesi (30 dosya adı).
- **Create** `scripts/t4-recipe-shots.mjs` — kanıt kareleri (t3-brief-shots deseni).

---

### Task 1: worldCovers sözleşmesi

**Files:**
- Create: `src/components/worldCovers.ts`
- Test: `src/components/worldCovers.test.ts`

- [x] **Step 1: Failing test yaz**

```ts
// src/components/worldCovers.test.ts
import { describe, expect, it } from 'vitest';
import { DATA } from '../core/pure';
import { WORLD_COVER_FILES, worldCoverUrl } from './worldCovers';

describe('world cover sözleşmesi', () => {
  it('her world için tam olarak bir kapak dosyası tanımlar (30 world)', () => {
    expect(DATA.worlds.length).toBe(30);
    expect(WORLD_COVER_FILES).toEqual(DATA.worlds.map((w) => `${w.id}.webp`));
  });

  it('url public/assets3d/worlds/ altına işaret eder', () => {
    expect(worldCoverUrl('pixar_3d_edu')).toBe('/assets3d/worlds/pixar_3d_edu.webp');
  });
});
```

- [x] **Step 2: Koş, FAIL gör**

Run: `npx vitest run src/components/worldCovers.test.ts`
Expected: FAIL — "Cannot find module './worldCovers'"

- [x] **Step 3: Minimal implementasyon**

```ts
// src/components/worldCovers.ts
import { DATA } from '../core/pure';

/** Reçete galeri duvarı kapak sözleşmesi — dosyalar public/assets3d/worlds/<worldId>.webp.
 *  Liste DATA.worlds'ten türetilir: yeni world eklenince sözleşme kendiliğinden büyür,
 *  teslim durumu scripts/check-assets3d.mjs 'worlds' bölümünde sayılır (kademeli dolum). */
export const WORLD_COVER_FILES: readonly string[] = DATA.worlds.map((w) => `${w.id}.webp`);

export function worldCoverUrl(worldId: string): string {
  return `/assets3d/worlds/${worldId}.webp`;
}
```

- [x] **Step 4: Koş, PASS gör**

Run: `npx vitest run src/components/worldCovers.test.ts`
Expected: 2 passed

- [x] **Step 5: Commit**

```bash
git add src/components/worldCovers.ts src/components/worldCovers.test.ts
git commit -m "feat(t4): world kapak sözleşmesi — 30 dosya DATA.worlds'ten türetilir, kademeli dolum"
```

---

### Task 2: WorldCover bileşeni (webp + fallback)

**Files:**
- Create: `src/components/WorldCover.tsx`
- Test: `src/components/worldCover.test.ts`
- Referans desen: `src/components/PresetPlate.tsx` (birebir ayna) ve `src/components/presetPlate.test.ts` (test stili — önce OKU, aynı stili uygula)

- [x] **Step 1: Failing test yaz** (presetPlate.test.ts'in kaynak-sözleşme stili)

```ts
// src/components/worldCover.test.ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const src = readFileSync(new URL('./WorldCover.tsx', import.meta.url), 'utf8');

describe('WorldCover kaynak sözleşmesi', () => {
  it('kapağı worlds klasöründen okur ve onError fallback taşır', () => {
    expect(src).toContain("worldCoverUrl(");
    expect(src).toContain('onError');
    expect(src).toMatch(/objectFit:\s*'cover'/);
  });
  it('worldId değişince failed state sıfırlanır (bayat fallback yasağı)', () => {
    expect(src).toMatch(/useEffect\(\(\) => \{ setFailed\(false\); \}, \[worldId\]\)/);
  });
});
```

- [x] **Step 2: Koş, FAIL gör**

Run: `npx vitest run src/components/worldCover.test.ts`
Expected: FAIL — dosya yok

- [x] **Step 3: Implementasyon (PresetPlate aynası)**

```tsx
// src/components/WorldCover.tsx
import React from 'react';
import { worldCoverUrl } from './worldCovers';

interface WorldCoverProps {
  worldId: string;
  fallback: React.ReactNode;
  height?: number;
}

/** Kapak webp'i varsa gösterir, yoksa fallback'e düşer — PresetPlate deseni (kademeli dolum). */
export const WorldCover: React.FC<WorldCoverProps> = ({ worldId, fallback, height = 64 }) => {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => { setFailed(false); }, [worldId]);
  if (failed) return <>{fallback}</>;
  return (
    <img
      src={worldCoverUrl(worldId)}
      alt=""
      aria-hidden
      draggable={false}
      onError={() => setFailed(true)}
      style={{ display: 'block', width: '100%', height, objectFit: 'cover', borderRadius: 4, pointerEvents: 'none', userSelect: 'none' }}
    />
  );
};
```

- [x] **Step 4: Koş, PASS gör** — `npx vitest run src/components/worldCover.test.ts` → 2 passed

- [x] **Step 5: Commit**

```bash
git add src/components/WorldCover.tsx src/components/worldCover.test.ts
git commit -m "feat(t4): WorldCover — webp kapak + fallback, PresetPlate deseninin world aynası"
```

---

### Task 3: World galerisi — liste kartları kapaklı

**Files:**
- Modify: `src/pages/Recipe/RecipeStep.tsx:181-201` (world list butonları)
- Modify: `src/styles/design_v2.css` (`.recipe-world-button` bloklarının yanına, ~158)

- [x] **Step 1: RecipeStep import + kart görseli**

`import { WorldCover } from '../../components/WorldCover';` ekle (satır 11 civarı). Sonra world butonundaki renk şeridi span'ını KAPAK + fallback'e çevir — MEVCUT şerit fallback OLUR (spec: "eksik olan bugünkü karta düşer"):

```tsx
<button
  key={world.id}
  type="button"
  onClick={() => setField('selectedWorldId', world.id)}
  className={`recipe-world-button ${active ? 'active' : ''} ${candidate ? 'candidate' : ''}`}
>
  <WorldCover
    worldId={world.id}
    height={64}
    fallback={<span style={{ display: 'block', height: 64, borderRadius: 4, background: `linear-gradient(135deg, ${colors[2] || 'var(--m2-amber)'}, ${colors[0] || 'var(--m2-surface-2)'})` }} />}
  />
  <span>
    <strong style={{ display: 'block', fontSize: 13 }}>{world.name}</strong>
    <span style={{ color: 'var(--m2-muted)', fontSize: 11 }}>{world.id}</span>
  </span>
</button>
```

- [x] **Step 2: CSS uyumu** — design_v2.css'te `.recipe-world-button`'ın padding/gap'i 64px görsele uygunsa DOKUNMA; taşma varsa yalnız gap/padding düzelt (hit-target boyu oynamaz).

- [x] **Step 3: Doğrula** — `npx tsc --noEmit && npx vitest run` → 0 hata, tümü PASS. Dev server'da Reçete ekranı: kapak yok → gradyan fallback şeridi her kartta görünür, isim/id okunur.

- [x] **Step 4: Commit**

```bash
git add src/pages/Recipe/RecipeStep.tsx src/styles/design_v2.css
git commit -m "feat(t4): world listesi kapak-görselli kart galerisi — kapak yoksa palet gradyanına düşer"
```

---

### Task 4: Detay paneli görsel-önce + TEKNİK KANIT parşömeni

**Files:**
- Modify: `src/pages/Recipe/RecipeStep.tsx:204-234` (recipe-world-detail)

- [x] **Step 1: Büyük kapak + kısa künye**

Detay panelinde 180px CanvasPreview bloğu AYNEN kalır ama WorldCover'ın fallback'i olur (kapak gelince kapak, gelmeyince bugünkü canlı preview):

```tsx
<div style={{ height: 220, position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
  {previewWorld ? (
    <WorldCover
      worldId={previewWorld.id}
      height={220}
      fallback={
        <CanvasPreview
          colors={selectedColors}
          category={activeTab === 'REAL' ? 'real' : activeTab === 'STYLIZED' ? 'anime' : 'edu'}
          previewType={activeRef?.preview || selectedWorld?.group?.toLowerCase() || 'default'}
          worldId={previewWorld?.id}
          refId={activeRef?.id}
          variant="hero"
          evidenceLabel={activeRef ? `${activeRef.cat} · ${activeRef.anchor || activeRef.id}` : previewWorld?.group}
        />
      }
    />
  ) : (
    <CanvasPreview colors={selectedColors} category="edu" previewType="default" variant="hero" />
  )}
</div>
```

- [x] **Step 2: Uzun metin → kısa künye**

`recipe-world-render-text` paragrafı artık `worldRenderText(previewWorld)` DEĞİL, kısa künye gösterir (uzun render_law zaten drawer'daki WorldLawPanel'de duruyor — çift gösterim ölür):

```tsx
<p className="recipe-world-render-text" style={{ margin: 0, color: 'var(--m2-muted)', lineHeight: 1.55, fontSize: 13 }}>
  {previewWorld ? (previewWorld.one_liner || worldRenderText(previewWorld).slice(0, 160)) : 'Bir world seç.'}
</p>
```

- [x] **Step 3: Drawer parşömenleşir**

```tsx
<details className="recipe-world-law-drawer ml-v3-parchment">
  <summary>TEKNİK KANIT — render law · grammar · negative lock</summary>
  <WorldLawPanel world={previewWorld} />
</details>
```

(`<details>` collapse deseni KORUNUR — spec şartı.)

- [x] **Step 4: Doğrula** — `npx tsc --noEmit && npx vitest run` yeşil; dev server'da detay paneli: canlı preview (fallback) + one_liner + parşömen drawer açılıp kapanıyor.

- [x] **Step 5: Commit**

```bash
git add src/pages/Recipe/RecipeStep.tsx
git commit -m "feat(t4): detay paneli görsel-önce — büyük kapak/preview + one_liner künye + TEKNİK KANIT parşömeni"
```

---

### Task 5: Materyal doku kartları

**Files:**
- Modify: `src/pages/Recipe/RecipeStep.tsx:241-266` (materyal grid)
- Modify: `src/styles/design_v2.css` (yeni `.recipe-material-card` kuralları)

- [x] **Step 1: Deterministik sıcak swatch helper'ı** (RecipeStep.tsx içinde, bileşen DIŞINDA):

```tsx
const MAT_TONES = ['#2a2418', '#332b1d', '#3b3223', '#2e2a20'] as const; // sıcak nötr aile — neon yasak
function matSwatchBackground(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  h = h ^ (h >>> 15); // FNV dersi: alt bitler kısa inputta bias'lı, mod'dan önce katla
  const a = MAT_TONES[h % 4];
  const b = MAT_TONES[(h >>> 2) % 4 === h % 4 ? (h % 4 + 1) % 4 : (h >>> 2) % 4];
  const angle = 30 + (h % 120);
  return `repeating-linear-gradient(${angle}deg, ${a}, ${a} 7px, ${b} 7px, ${b} 14px)`;
}
```

- [x] **Step 2: Chip → doku kartı** (mevcut buton grid'inin İÇERİĞİ değişir, `disabled`/`isMaterialCompatibleWithWorld` mantığı AYNEN kalır):

```tsx
{DATA.materials.map((material) => {
  const compatible = isMaterialCompatibleWithWorld(selectedWorld, material.id);
  const active = selectedPropId === material.id;
  return (
    <button
      key={material.id}
      type="button"
      disabled={!compatible}
      onClick={() => setField('selectedPropId', material.id)}
      title={compatible ? material.name : `${selectedWorld?.name ?? 'Bu world'} bu dokuyu taşımıyor — world-native malzemeye çözülür.`}
      className={`recipe-material-card ${active ? 'active' : ''}`}
    >
      <span aria-hidden style={{ display: 'block', height: 34, borderRadius: 4, background: matSwatchBackground(material.id), opacity: compatible ? 1 : 0.35, filter: compatible ? 'none' : 'grayscale(0.8)' }} />
      <span style={{ display: 'block', fontSize: 11, fontWeight: 600, marginTop: 6, color: compatible ? 'var(--m2-paper)' : 'var(--m2-muted)' }}>{material.name}</span>
      {!compatible && (
        <span style={{ display: 'block', fontSize: 9, letterSpacing: 0.6, color: 'var(--m2-muted)', marginTop: 2 }}>UYUMSUZ · WORLD TAŞIMIYOR</span>
      )}
    </button>
  );
})}
```

NOT: Mevcut grid class'ı `recipe-material-grid` konteynırda KALIR; buton class'ı `recipe-material-card` olur. Mevcut buton stillerinden (opacity 0.38 vs.) inline olanlar bu yeni yapıya taşındıysa eskisini sil — çift stil bırakma.

- [x] **Step 3: CSS** (design_v2.css, recipe bloklarının yanına):

```css
.recipe-step-v2 .recipe-material-card {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid var(--m2-line);
  background: var(--m2-surface);
  cursor: pointer;
  text-align: left;
  transition: border-color var(--m2-hover) var(--m2-ease), background var(--m2-hover) var(--m2-ease);
}
.recipe-step-v2 .recipe-material-card:hover:not(:disabled) { border-color: var(--m2-amber); background: var(--m2-surface-2); }
.recipe-step-v2 .recipe-material-card.active { border-color: var(--m2-amber); background: var(--m2-amber-soft); }
.recipe-step-v2 .recipe-material-card:disabled { cursor: not-allowed; }
```

- [x] **Step 4: Doğrula** — gate kısa: `npx tsc --noEmit && npx vitest run` yeşil. Dev server: One Piece world seçince uyumsuz materyaller gri + "UYUMSUZ" etiketi; tooltip nedeni söylüyor; uyumlu kart hover'da amber çerçeve.

- [x] **Step 5: Commit**

```bash
git add src/pages/Recipe/RecipeStep.tsx src/styles/design_v2.css
git commit -m "feat(t4): materyal chip çorbası doku kartlarına — swatch + ad + görünür UYUMSUZ nedeni"
```

---

### Task 6: Palet şeritleri — ad + hover büyüme

**Files:**
- Modify: `src/pages/Recipe/RecipeStep.tsx:268-290` (palet grid)
- Modify: `src/styles/design_v2.css`

- [x] **Step 1: Şerit satırına class + görünür ad**

Palet butonunda renk şeridi satırını saran div'e `className="recipe-palette-strip"` ver; butonun altına palet adı ekle (tooltip'ten görünür metne terfi):

```tsx
<span className="recipe-palette-strip" style={{ display: 'flex', gap: 2, height: 22, borderRadius: 4, overflow: 'hidden' }}>
  {stripColors.map((c, i) => (<span key={i} style={{ flex: 1, background: c }} />))}
</span>
<span style={{ display: 'block', fontSize: 10.5, color: 'var(--m2-muted)', marginTop: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{palette.name}</span>
```

(Mevcut buton yapısındaki renk span'ları neyse `stripColors` onların kaynağıdır — `paletteColors(palette)` mevcut çağrı korunur; `title=` kalabilir.)

- [x] **Step 2: Hover büyümesi — hit-target OYNAMAZ** (buton boyu sabit, şerit içeride büyür):

```css
.recipe-step-v2 .recipe-palette-strip { transition: transform var(--m2-hover) var(--m2-ease); transform-origin: center bottom; }
.recipe-step-v2 .recipe-palette-grid button:hover .recipe-palette-strip { transform: scaleY(1.2); }
```

- [x] **Step 3: Doğrula** — tsc + vitest yeşil; dev'de palet adları okunur, hover'da şerit nefes alır, buton zıplamaz.

- [x] **Step 4: Commit**

```bash
git add src/pages/Recipe/RecipeStep.tsx src/styles/design_v2.css
git commit -m "feat(t4): palet şeritlerine görünür ad + hit-target'ı oynatmayan hover büyümesi"
```

---

### Task 7: worldCoverTexture — url-keyed cache (loadSlotTexture aynası)

**Files:**
- Create: `src/scene/worldCoverTexture.ts`
- Test: `src/scene/worldCoverTexture.test.ts`
- Referans: `src/scene/assetSlots.ts:55-83` (cache deseni) — assetSlots'a DOKUNMA (slot sözleşmesi ayrı doğruluk kaynağı)

- [x] **Step 1: Failing test**

```ts
// src/scene/worldCoverTexture.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadWorldCoverTexture, resetWorldCoverCache } from './worldCoverTexture';

const fakeTexture = { anisotropy: 0, colorSpace: '' } as never;

describe('loadWorldCoverTexture', () => {
  beforeEach(() => resetWorldCoverCache());

  it('başarılı yüklemede texture döner ve ikinci çağrı cache’ten gelir', async () => {
    const load = vi.fn().mockResolvedValue(fakeTexture);
    const t1 = await loadWorldCoverTexture('pixar_3d_edu', 8, load, vi.fn());
    const t2 = await loadWorldCoverTexture('pixar_3d_edu', 8, load, vi.fn());
    expect(t1).toBe(fakeTexture);
    expect(t2).toBe(fakeTexture);
    expect(load).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith('/assets3d/worlds/pixar_3d_edu.webp');
  });

  it('yükleme düşerse null döner, uyarı BİR kez basılır, yeniden denenmez', async () => {
    const load = vi.fn().mockRejectedValue(new Error('404'));
    const warn = vi.fn();
    expect(await loadWorldCoverTexture('ghibli', 8, load, warn)).toBeNull();
    expect(await loadWorldCoverTexture('ghibli', 8, load, warn)).toBeNull();
    expect(load).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('/assets3d/worlds/ghibli.webp');
  });
});
```

- [x] **Step 2: Koş, FAIL gör** — `npx vitest run src/scene/worldCoverTexture.test.ts`

- [x] **Step 3: Implementasyon**

```ts
// src/scene/worldCoverTexture.ts
import { SRGBColorSpace, TextureLoader, type Texture } from 'three';
import { worldCoverUrl } from '../components/worldCovers';
import { LOOK } from './lookConfig';

/* Seans-ömürlü cache — loadSlotTexture aynası ama worldId-keyed (kapaklar kademeli dolar,
 * eksik kapak istisna değil NORMAL durumdur; V3 §7.11 sessiz düşüş yasak, uyarı bir kez). */
const cache = new Map<string, Promise<Texture | null>>();

export function loadWorldCoverTexture(
  worldId: string,
  hwMaxAnisotropy: number,
  load: (url: string) => Promise<Texture> = (url) => new TextureLoader().loadAsync(url),
  warn: (msg: string) => void = console.warn,
): Promise<Texture | null> {
  let entry = cache.get(worldId);
  if (!entry) {
    const url = worldCoverUrl(worldId);
    entry = load(url)
      .then((t) => {
        t.colorSpace = SRGBColorSpace;
        t.anisotropy = Math.min(LOOK.assets3d.maxAnisotropy, hwMaxAnisotropy);
        return t;
      })
      .catch(() => {
        warn(`[assets3d] missing/failed: ${url}`);
        return null;
      });
    cache.set(worldId, entry);
  }
  return entry;
}

/** Test izolasyonu için. */
export function resetWorldCoverCache(): void {
  cache.clear();
}
```

- [x] **Step 4: Koş, PASS gör** — 2 passed

- [x] **Step 5: Commit**

```bash
git add src/scene/worldCoverTexture.ts src/scene/worldCoverTexture.test.ts
git commit -m "feat(t4): world kapak texture cache — loadSlotTexture aynası, tek deneme + tek uyarı, testli"
```

---

### Task 8: WorldHeroFrame — seçili world duvara asılır

**Files:**
- Modify: `src/scene/DioramaStage.tsx` (FramedPlate ~10-33, FRAME_SLOTS ~203, sahne ağacı ~224)

- [x] **Step 1: Hook + bileşen**

DioramaStage.tsx'e import'lar: `useStudioStore` (`../store/useStudioStore`), `DATA` (`../core/pure`), `plateSlotFor` (`../components/worldPlates`), `loadWorldCoverTexture` (`./worldCoverTexture`), React `useEffect/useState` (dosyada zaten `useRef` var — aynı import satırı genişler).

```tsx
/** Kapak dokusu: worldId-keyed, eksikse null (grup plate'i devralır). */
function useWorldCoverTexture(worldId: string | null): Texture | null {
  const gl = useThree((s) => s.gl);
  const [texture, setTexture] = useState<Texture | null>(null);
  useEffect(() => {
    setTexture(null);
    if (!worldId) return;
    let alive = true;
    loadWorldCoverTexture(worldId, gl.capabilities.getMaxAnisotropy()).then((t) => {
      if (alive && t) setTexture(t);
    });
    return () => { alive = false; };
  }, [worldId, gl]);
  return texture;
}

/** Merkez şeref çerçevesi: seçili world'ün kapağı, yoksa grup plate'i, o da yoksa parşömen.
 *  Diğer çerçevelerden hafif önde ve büyük — "şu an bu dünyadayız" sinyali. */
function WorldHeroFrame() {
  const selectedWorldId = useStudioStore((s) => s.selectedWorldId);
  const world = DATA.worlds.find((w) => w.id === selectedWorldId);
  const cover = useWorldCoverTexture(world ? world.id : null);
  const groupTexture = useSlotTexture(plateSlotFor(world?.group));
  const texture = cover ?? groupTexture;
  return (
    <group position={[0, 2.78, -3.95]} scale={1.12}>
      <mesh castShadow>
        <boxGeometry args={[1.3, 1.75, 0.07]} />
        <meshStandardMaterial color={LOOK.palette.woodDark} roughness={0.6} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[1.06, 1.5]} />
        <meshStandardMaterial
          key={texture ? (cover ? 'cover' : 'group') : 'placeholder'} /* map null→doku: shader tazelensin */
          map={texture ?? undefined}
          color={texture ? '#ffffff' : '#cfc2a6'}
          roughness={0.9}
        />
      </mesh>
    </group>
  );
}
```

(`useThree` importu dosyada yoksa `@react-three/fiber`'dan, `Texture` tipi `three`'den eklenir.)

- [x] **Step 2: Sahne ağacına tak** — `{FRAME_SLOTS.map(...)}` satırının hemen ALTINA `<WorldHeroFrame />` ekle. FRAME_SLOTS/x konumlarına DOKUNMA (hero x=0 boşluğuna asılır, komşularla çakışmaz: yarım genişlik 1.12·0.65=0.73 < komşu iç kenar 1.3−0.65=0.65 değil — ÖLÇ: komşu merkez 1.3, komşu yarım 0.65 → iç kenar 0.65; hero yarım 0.73 > 0.65 hafif bindirir AMA hero z=-3.95 ÖNDE, derinlik ayrımı bilinçli — screenshot'ta kötü okunursa scale 1.0'a düşür).

- [x] **Step 3: Doğrula** — `npx tsc --noEmit && npx vitest run && npm run build` yeşil. Sonra görsel kanıt: `lsof -ti:5173 | xargs kill; npm run dev &` + mevcut scene screenshot script'i (`node scripts/final-shots.mjs` ya da `scripts/design-tour-shots.mjs` hangisi varsa) — merkez çerçevede grup plate'i (kapak henüz yok) görünmeli, ?scene=force karesinde SwiftShader gecikmesi dersi: 3000ms bekle.

- [x] **Step 4: Commit**

```bash
git add src/scene/DioramaStage.tsx
git commit -m "feat(t4): WorldHeroFrame — seçili world diorama duvarında; kapak→grup plate→parşömen düşüş zinciri"
```

---

### Task 9: check-assets3d worlds bölümü + Mami GOAL dosyası

**Files:**
- Modify: `scripts/check-assets3d.mjs` (presets bölümünün deseni, ~60-83)
- Create: `docs/superpowers/specs/WORLD_COVERS_GOAL_T4.md`

- [x] **Step 1: Script'e worlds sayacı** — presets bölümünün aynası ama HİÇBİR modda fatal değil (kademeli dolum sözleşmesi; --strict yalnız teslim edilmiş sözleşmeleri zorlar). SURGERY_DATA.json'dan world id'leri okunur:

```js
// — World kapakları (T4, kademeli dolum: eksik = bilgi, hata DEĞİL — hiçbir modda fatal olmaz) —
const surgery = JSON.parse(readFileSync(new URL('../src/core/SURGERY_DATA.json', import.meta.url), 'utf8'));
const worldCoverDir = new URL('../public/assets3d/worlds/', import.meta.url);
let coverPresent = 0;
const coverMissing = [];
for (const w of surgery.worlds) {
  if (existsSync(new URL(`${w.id}.webp`, worldCoverDir))) coverPresent += 1;
  else coverMissing.push(`${w.id}.webp`);
}
console.log(`\n[worlds] kapak: ${coverPresent}/${surgery.worlds.length} teslim edildi`);
if (coverMissing.length) console.log(`[worlds] bekleyen: ${coverMissing.slice(0, 6).join(', ')}${coverMissing.length > 6 ? ` … (+${coverMissing.length - 6})` : ''}`);
```

(Script'in mevcut import'larında `readFileSync/existsSync` yoksa `node:fs`'ten ekle. Mevcut exit-code mantığına worlds sayacı KARIŞMAZ.)

- [x] **Step 2: GOAL dosyası** — `docs/superpowers/specs/WORLD_COVERS_GOAL_T4.md`, PRESET_PLATES_GOAL_T3.md kardeşi:

```markdown
# WORLD KAPAKLARI — T4 Teslim Sözleşmesi (Mami)

**Hedef klasör:** `public/assets3d/worlds/` — dosya adı = sözleşme, kod değişmez.
**Format:** WebP, 1024×1448 (kart oranı — Çizim Ekranı plate'leri ve diorama çerçevesiyle aynı aile), sRGB.
**Üslup:** Painterly kapak; her dünyanın render_law ruhunu TEK karede anlatır. IP-homage dünyalarda
tanınabilir karakter/logo YOK — dünyanın ışığı, çizgi dili ve sahne grameri anlatılır (mamilas-world disiplini).
**Kademeli dolum:** İstediğin sırayla at; eksik kapak palet-gradyan karta düşer, site kırılmaz.
Kontrol: `node scripts/check-assets3d.mjs` → `[worlds] kapak: N/30`.

## 30 dosya
(buraya `python3 -c "import json; print('\n'.join('- '+w['id']+'.webp' for w in json.load(open('src/core/SURGERY_DATA.json'))['worlds']))"` çıktısı birebir yapıştırılır)
```

- [x] **Step 3: Doğrula** — `node scripts/check-assets3d.mjs` → `[worlds] kapak: 0/30` satırı; exit code değişmedi. `node scripts/check-assets3d.mjs --strict` davranışı ESKİSİYLE AYNI (worlds fatal değil).

- [x] **Step 4: Commit**

```bash
git add scripts/check-assets3d.mjs docs/superpowers/specs/WORLD_COVERS_GOAL_T4.md
git commit -m "docs(t4): world kapak teslim sözleşmesi + check-assets3d kademeli dolum sayacı"
```

---

### Task 10: Kapanış — kanıt kareleri + tam gate

**Files:**
- Create: `scripts/t4-recipe-shots.mjs` (t3-brief-shots.mjs deseni)
- Kanıt: `reports/t4-recipe-*.png`

- [x] **Step 1: Kanıt script'i** — Reçete'ye SIDEBAR'dan gidilir (preset akışı DEĞİL — bilinen preset/director e2e bug'ı preset yolunu kirletiyor):

```js
// scripts/t4-recipe-shots.mjs — T4 Reçete galeri kanıtları (vite 5173 açık olmalı)
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const URL = 'http://localhost:5173';
const OUT = 'reports';

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  await page.goto(URL, { timeout: 30000, waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.removeItem('mamilas-studio-v1'); } catch {} });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  await page.getByRole('button', { name: /Reçete/ }).first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/t4-recipe-gallery.png`, fullPage: false });
  console.log('✓ t4-recipe-gallery.png');

  // Materyal + palet panelleri (sayfa aşağısı)
  const matPanel = page.locator('section').filter({ hasText: 'UYUMSUZ' }).first()
    .or(page.locator('section').filter({ hasText: 'Materyal' }).first());
  await matPanel.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/t4-recipe-materials.png`, fullPage: false });
  console.log('✓ t4-recipe-materials.png');

  // TEKNİK KANIT parşömeni açık hâli
  const drawer = page.locator('summary').filter({ hasText: 'TEKNİK KANIT' }).first();
  if (await drawer.count()) {
    await drawer.scrollIntoViewIfNeeded();
    await drawer.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/t4-recipe-teknik-kanit.png`, fullPage: false });
    console.log('✓ t4-recipe-teknik-kanit.png');
  }

  await browser.close();
  console.log('DONE');
}
main().catch((err) => { console.error(err); process.exit(1); });
```

(Panel başlıkları DOM'da toUpperCase'li — locator'da Türkçe İ tuzağına düşme, `TEKNİK KANIT` zaten büyük yazıldı. Selector tutmazsa ekran metnine göre düzelt, kanıt karesi esas.)

- [x] **Step 2: Koş** — `lsof -ti:5173 | xargs kill; (npm run dev &) ; sleep 4; node scripts/t4-recipe-shots.mjs; lsof -ti:5173 | xargs kill` → 3 PNG. GÖZLE incele (Read): galeri kartları fallback gradyanlı ve okunur, UYUMSUZ etiketleri görünür, parşömen açılıyor.

- [x] **Step 3: Tam gate** — `npx tsc --noEmit && npx vitest run && npm run build && zsh -n start-mamilas.command agents/MOTION-CALISTIR.command agents/production/MOTION-CALISTIR.command && npm run test:e2e`
Expected: tsc 0 · vitest ≥388 PASS (384 + bu planın yeni testleri; SAYI DÜŞMEZ) · build OK · e2e: bilinen 6 kırık DIŞINDA yeni kırık YOK (baseline: smoke:28/93/138/163 + beat-planner:15 + screenshots:4).

- [x] **Step 4: Commit**

```bash
git add scripts/t4-recipe-shots.mjs reports/t4-recipe-gallery.png reports/t4-recipe-materials.png reports/t4-recipe-teknik-kanit.png docs/superpowers/plans/2026-07-04-t4-recete-galeri-duvari.md
git commit -m "docs(t4): plan tamamlandı — kanıt kareleri + tam gate kaydı"
```

---

## Doğrulama (milestone kapanışı, plan dışı süreç)
Bütün-tur bağımsız review + alıcı-gözü tasarım yargıcı (T3 deseni: şartlı onay → doğrula → düzelt → yeniden yargıla, hedef ONAYLA). Yargıç kanıtı: t4-recipe-*.png + diorama karesi.

---

## KAPANIŞ KAYDI (2026-07-04, Task 10)

- Gate: tsc 0 · vitest 391/391 (384→391, +7) · build OK · 3 `.command` syntax OK · e2e 9 passed / 6 failed — 6'sı da bilinen baseline (smoke:28/93/138/163 + beat-planner:15 + screenshots:4), YENİ kırık yok.
- Commit zinciri: 5c306b1 (kapak sözleşmesi) → 0a85686 (WorldCover) → 00dbd48 (regex review fix) → 4b1a283 (galeri+detay) → 04fb2f0 (props review fix) → 2269551 (painterly fallback — frontend-design denetimi, piksel hero emekli) → e0de9b9 (materyal doku kartları) → 07082b8 (palet ad+hover) → 4eb9b1c (kapak texture cache) → 99788e4 (WorldHeroFrame) → 04a0d57 (hero world'süz doğmaz — çifte logo fix) → 262437f (script sayacı+GOAL+çapraz test) → 765c56e (strict exit sona).
- Review kararları: palet hover "overflow kırpar" iddiası AMPİRİK reddedildi (strip 22→26.4px ölçüldü, buton kutusu sabit); goldglow bulgusu diff-dışı + tokens.css'te tanımlı; useSlotTexture reset eksiği diff-öncesi, kapsam dışı not edildi.
- Mami girdisi: 30 world kapağı bekleniyor — sözleşme docs/superpowers/specs/WORLD_COVERS_GOAL_T4.md.
