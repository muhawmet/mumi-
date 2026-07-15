<!-- DURUM: AKTİF — M4 asset slot sistemi koşusu (2026-07-03). M3 bitti (6f7283f, main'de).
     Kaynak: M4 plan ajanı (Fable). Asset adları otoritesi: ASSET_BRIEF_DRAFT.md §2-3.
     Kontrolör kararları kilitli: V3 §8 formatları, portre yolu /assets/characters, logo metni DOM, 4 kart. -->

# 3D Diorama Kabuğu — M4 Implementation Plan: ASSET SLOT SYSTEM

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `ASSET_BRIEF_DRAFT.md` Bölüm 3'ün vaadi koda dökülür: Muhammet bir dosyayı `public/assets3d/` altına attığında ilgili slot **kod değişmeden** dokuya kavuşur; dosya yoksa bugünkü placeholder aynen yaşar + `console.warn` (V3 §7.11 — sessiz düşüş yasak). Sekiz slot bağlanır: 4 kart yüzü, masa üstü, zemin diski, backdrop gökyüzü, logo kartı. Portre hattı (7 PNG) **koda dokunmadan** çalışmaya devam eder — yalnız gate raporuna girer.

**Architecture:** Slot→dosya sözleşmesi tek saf modülde yaşar (`src/scene/assetSlots.ts` — manifest, URL üretimi, V3 §7.11 uyarı metni; vitest'le mühürlenir). Doku yükleme **manual `TextureLoader` + state**'tir, Suspense/`useTexture` DEĞİL (gerekçe: "Kilitli kararlar" #2). Yükleme denemesinin kendisi probe'dur: `onError` → uyar + null → placeholder malzeme mount'ta kalır; başarı → tek re-render ile materyal swap. Doku ayar şiddetleri (repeat, anisotropy, dome yarıçapı) `lookConfig.LOOK`'a eklenir — tek görsel otorite zinciri korunur. Backdrop, sahnenin dönen grubunun DIŞINDA sabit bir kısmi küredir (diorama içinde döner → parallax derinlik satar). DOM `.ml-v3-floor` grid'i, sahne açık VE gerçek zemin dokusu canlıyken emekliye ayrılır (V3 §8 tek zemin otoritesi); fallback'te daima kalır. Gate raporu için `scripts/check-assets3d.mjs` 15 dosyayı (8 WebP + 7 PNG) varlık+boyut düzeyinde tablolar — **varsayılan rapor modu exit 0** (mamilas-gate yeşil kalır), `--strict` yalnız asset kabulünde koşulur.

**Tech Stack:** Mevcut — three 0.185, R3F 9, drei 10, vitest, Playwright. **Yeni bağımlılık yok.**

**Spec:** `docs/superpowers/specs/2026-07-03-3d-diorama-shell-design.md` (M4). **Kanun:** `DESIGN_LANGUAGE_V3.md` §7.11 + §8. **Dosya adları otoritesi:** `docs/superpowers/specs/ASSET_BRIEF_DRAFT.md` §2–3 — plan bu adlarla birebir çalışır.

## Kilitli kararlar

Denetleyiciden devralınanlar (yeniden açılmaz): format otoritesi V3 §8; portre yolu `/assets/characters` kalır ve portre kodu DEĞİŞMEZ (Muhammet aynı id'lerle yeni PNG basar, `AdvisorPortrait`+`voicePortraits.ts` hattı olduğu gibi okur); logo metni DOM'da (asset yalnız soyut amblem); 4 kart arketipi yeter.

Bu planın verdiği kararlar:

1. **Backdrop geometrisi — kısmi küre (dome), plane DEĞİL.** `CAMERA_POSES` altı poz origin'in dört bir yanından bakar (+z, −z, +x, −x azimutları; scenes/qa arkadan). Düz plane bir pozda arkada, diğerinde kenardan görünürdü. 2048×1024 (2:1) panorama, `sphereGeometry`'nin yerleşik UV'siyle doğal sarılır: yarıçap **30** (kamera max yarıçapı ~11'in çok dışında, `far: 60` içinde), `thetaLength ≈ 0.62π` (ufkun hafif altına inen kubbe — sphereGeometry v-koordinatı verilen theta bandına gerildiği için panoramanın tüm dikey içeriği kubbeyi doldurur). Malzeme `meshBasicMaterial` (gökyüzü önceden boyanmış/ışıklanmış — sahne ışığına tepki vermemeli), `side: BackSide`, **`fog={false}`** (yarıçap 30 > `LOOK.fog.far` 26 — aksi halde sis kubbeyi tamamen yutar), **`toneMapped={false}`** (asset palet bandına göre boyanmış; tonemapping near-black sıcak değerleri kaydırır). Eksik dosyada placeholder = bugünkü durum: mesh render edilmez, `clearColor #080705` fon görevini sürdürür + `console.warn`.
2. **Texture yükleme — manual `TextureLoader` + state; drei `useTexture`/Suspense DEĞİL.** Gerekçeler: (a) `useTexture` eksik dosyada suspend edip **throw** eder → slot başına ErrorBoundary gerekir; oysa V3 §7.11'de "asset yok" normal ve kalıcı bir durumdur (brief teslim edilene dek), istisna değil. (b) Vite dev'de eksik `/assets3d/*.webp` SPA fallback'iyle **200 + index.html** dönebilir — ayrı bir fetch-probe "var" diye yalan söyler; image decode hatası ise `onError`'da tek tip yakalanır. Yükleme denemesi = probe, slot başına tek istek. (c) Modül-seviyesi cache ile uyarı **seans başına bir kez** basılır (HMR/remount'ta warn spam'i yok). (d) Placeholder→doku geçişi Suspense fallback flash'ı olmadan tek re-render'dır. Doku ayarları: `colorSpace = SRGBColorSpace`, `anisotropy = min(8, caps)` (V3 §8), mipmap default açık; yalnız `floor-disc` `RepeatWrapping` + `repeat 3×3` alır (2048² seamless, 18 birimlik diskte ~6 birimlik tile).
3. **Manifest — runtime, `import.meta.glob` DEĞİL.** `public/` içeriği Vite'ta modül değildir (URL ile referans sözleşmesi); glob ayrıca varlığı build anında dondurur — briefin "dosyayı at, yenile, bağlanır" vaadi dev'de rebuild'siz çalışmalıdır. Diskteki varlık/boyut denetimi node script'inin işidir (gate raporu), runtime'ın değil.
4. **Yeni mesh'lerde (backdrop, logo) placeholder = yokluk.** Mevcut slotlarda (zemin, masa, 4 kart) placeholder bugünkü malzemedir. Backdrop/logo bugün sahnede YOK — eksik asset'te uydurma bir placeholder mesh basmak M3'te onaylanan kadrajları değiştirirdi. §7.11 yükümlülüğü `console.warn` + "bugünkü görünüm" ile karşılanır; bu yorum burada kilitlenir.
5. **Gate yeşilliği:** kod kapısı (tsc+vitest+build, taban 344 test) asset'ler gelmeden de yeşildir. Brief'teki "eksik slot raporlanır, brief tamamlanana kadar yeşile geçmez" cümlesi **asset kabul kapısına** aittir: `check-assets3d.mjs` varsayılan modda raporlar (exit 0), `--strict` yalnız V3 §8 üç-kriter kabulünde koşulur.

**Parallel lanes:** Task 1 → Task 2 sıralı (2, 1'e bağımlı). Sonra Lane A (Task 3→4, sahne bağlama), Lane B (Task 5, DOM zemin), Lane C (Task 6, gate script) paralel. Task 7 kapanış.

---

## Dosya yapısı (exact paths)

```
public/assets3d/.gitkeep                       ← YENİ (klasör sözleşmesi; asset'ler Muhammet'ten)
src/scene/assetSlots.ts                        ← YENİ: saf manifest + URL + uyarı metni + tuneSlotTexture + loadSlotTexture
src/scene/assetSlots.test.ts                   ← YENİ: manifest/uyarı/tune/cache pinleri
src/scene/useSlotTexture.ts                    ← YENİ: R3F hook (ince — mantık assetSlots'ta)
src/scene/assetPresence.ts                     ← YENİ: DOM tarafı zemin-grid kararı (saf) + probe hook
src/scene/assetPresence.test.ts                ← YENİ: domFloorGridVisible pinleri
src/scene/lookConfig.ts                        ← DEĞİŞİR: LOOK.assets3d şiddet bloğu
src/scene/DioramaStage.tsx                     ← DEĞİŞİR: 6 mevcut slot bağlama + BackdropSky + LogoCard
src/components/Layout/AppLayout.tsx            ← DEĞİŞİR: .ml-v3-floor koşullu render (satır 52)
scripts/check-assets3d.mjs                     ← YENİ: 15 dosya varlık+boyut raporu (rapor/strict)
scripts/make-proof-textures.mjs                ← YENİ: geçici kanıt dokuları (üretir, COMMIT EDİLMEZ)
```

---

### Task 1: Slot manifesti — saf sözleşme + V3 §7.11 uyarı metni (TDD)

**Files:** Create `src/scene/assetSlots.ts`, `src/scene/assetSlots.test.ts`; Modify `src/scene/lookConfig.ts`

- [ ] **Step 1: Failing test yaz** — `src/scene/assetSlots.test.ts`:

```ts
import { Texture } from 'three';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ASSET_SLOTS, CARD_SLOTS, loadSlotTexture, missingAssetWarning,
  resetSlotTextureCache, slotUrl, tuneSlotTexture,
} from './assetSlots';
import { LOOK } from './lookConfig';

describe('assetSlots manifesti (ASSET_BRIEF §2–3 birebir)', () => {
  it('sekiz slot, brief adlarıyla birebir — sözleşme değişirse burası kırılır', () => {
    expect([...ASSET_SLOTS]).toEqual([
      'card-hero-archetype', 'card-detective-archetype',
      'card-arcane-archetype', 'card-explorer-archetype',
      'table-top', 'floor-disc', 'backdrop-sky', 'logo-card',
    ]);
  });

  it('kart slotları FloatingCard sırasıyla dörtlü', () => {
    expect(CARD_SLOTS).toHaveLength(4);
    for (const s of CARD_SLOTS) expect(s.startsWith('card-')).toBe(true);
  });

  it('URL sözleşmesi: /assets3d/<slot>.webp, kebab-case', () => {
    for (const slot of ASSET_SLOTS) {
      expect(slotUrl(slot)).toBe(`/assets3d/${slot}.webp`);
      expect(slot).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('uyarı metni V3 §7.11 / brief §3 formatında', () => {
    expect(missingAssetWarning('table-top')).toBe('[assets3d] missing/failed: /assets3d/table-top.webp');
  });
});

describe('tuneSlotTexture (V3 §8 format kanunu)', () => {
  it('her doku sRGB + anisotropy ≤ 8', () => {
    const t = tuneSlotTexture(new Texture(), 'table-top', 16);
    expect(t.colorSpace).toBe('srgb');
    expect(t.anisotropy).toBe(LOOK.assets3d.maxAnisotropy); // 8
  });
  it('anisotropy donanım tavanını aşamaz', () => {
    expect(tuneSlotTexture(new Texture(), 'table-top', 4).anisotropy).toBe(4);
  });
  it('yalnız floor-disc tile eder (seamless 2048² → repeat)', () => {
    const floor = tuneSlotTexture(new Texture(), 'floor-disc', 16);
    expect(floor.repeat.x).toBe(LOOK.assets3d.floorRepeat);
    const table = tuneSlotTexture(new Texture(), 'table-top', 16);
    expect(table.repeat.x).toBe(1);
  });
});

describe('loadSlotTexture (V3 §7.11: sessiz düşüş yasak, warn tek sefer)', () => {
  beforeEach(() => resetSlotTextureCache());

  it('başarı: doku tune edilip döner, loader slot başına 1 kez çağrılır (cache)', async () => {
    const load = vi.fn(async () => new Texture());
    const a = await loadSlotTexture('floor-disc', 16, load);
    const b = await loadSlotTexture('floor-disc', 16, load);
    expect(a).toBe(b);
    expect(a?.colorSpace).toBe('srgb');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('eksik dosya: null döner + tam V3 mesajıyla TEK console.warn', async () => {
    const warn = vi.fn();
    const load = vi.fn(async () => { throw new Error('404'); });
    expect(await loadSlotTexture('backdrop-sky', 16, load, warn)).toBeNull();
    expect(await loadSlotTexture('backdrop-sky', 16, load, warn)).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith('[assets3d] missing/failed: /assets3d/backdrop-sky.webp');
  });
});
```

- [ ] **Step 2: FAIL gör** — `npx vitest run src/scene/assetSlots.test.ts`

- [ ] **Step 3: `lookConfig.ts`'e şiddet bloğu ekle** — `LOOK` içine, `palette`'ten önce (şiddetler TEK otoriteden döner, komponentlerden değil):

```ts
  /* M4 asset slot şiddetleri — V3 §8: sRGB, anisotropy ≤ 8, mipmap açık */
  assets3d: {
    maxAnisotropy: 8,      // donanım tavanıyla min'lenir
    floorRepeat: 3,        // 2048² seamless doku, 18 birim diskte ~6 birimlik tile
    backdropRadius: 30,    // fog.far(26) dışı → malzeme fog:false şart
    backdropTheta: 0.62,   // ufkun hafif altına inen kubbe payı (π çarpanı)
  },
```

- [ ] **Step 4: `src/scene/assetSlots.ts` yaz**:

```ts
import { RepeatWrapping, SRGBColorSpace, TextureLoader, type Texture } from 'three';
import { LOOK } from './lookConfig';

/**
 * M4 slot sözleşmesi — TEK doğruluk kaynağı.
 * Adlar ASSET_BRIEF_DRAFT.md §2–3 ile BİREBİRDİR; slot adı = dosya adı.
 * Muhammet dosyayı public/assets3d/ altına atar, kod değişmez, slot bağlanır.
 */
export const CARD_SLOTS = [
  'card-hero-archetype',      // anime/aksiyon arketipi
  'card-detective-archetype', // sinematik-real/noir
  'card-arcane-archetype',    // arcane/büyü
  'card-explorer-archetype',  // edu/keşif
] as const;

export const ASSET_SLOTS = [
  ...CARD_SLOTS,
  'table-top',     // masa üstü, 1024² WebP
  'floor-disc',    // zemin, 2048² seamless WebP
  'backdrop-sky',  // gökyüzü, 2048×1024 WebP
  'logo-card',     // amblem kartı, 1024×1448 WebP (harf YOK — logotype DOM'da)
] as const;

export type CardSlot = (typeof CARD_SLOTS)[number];
export type AssetSlot = (typeof ASSET_SLOTS)[number];

export function slotUrl(slot: AssetSlot): string {
  return `/assets3d/${slot}.webp`;
}

/** V3 §7.11 uyarı metni — check-assets3d.mjs ve kanıt script'leri bu kalıbı grep'ler. */
export function missingAssetWarning(slot: AssetSlot): string {
  return `[assets3d] missing/failed: ${slotUrl(slot)}`;
}

/** V3 §8 format kanunu: hepsi sRGB, anisotropy ≤ 8; yalnız zemin tile eder. */
export function tuneSlotTexture(texture: Texture, slot: AssetSlot, hwMaxAnisotropy: number): Texture {
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = Math.min(LOOK.assets3d.maxAnisotropy, hwMaxAnisotropy);
  if (slot === 'floor-disc') {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(LOOK.assets3d.floorRepeat, LOOK.assets3d.floorRepeat);
  }
  texture.needsUpdate = true;
  return texture;
}

/* Seans-ömürlü cache: slot başına TEK yükleme denemesi ve TEK uyarı.
 * Yükleme denemesinin kendisi probe'dur — ayrı fetch-HEAD yok (Vite dev'de
 * eksik dosya SPA fallback'iyle 200 dönebilir; decode hatası tek doğru sinyaldir). */
const cache = new Map<AssetSlot, Promise<Texture | null>>();

export function loadSlotTexture(
  slot: AssetSlot,
  hwMaxAnisotropy: number,
  load: (url: string) => Promise<Texture> = (url) => new TextureLoader().loadAsync(url),
  warn: (msg: string) => void = console.warn,
): Promise<Texture | null> {
  let entry = cache.get(slot);
  if (!entry) {
    entry = load(slotUrl(slot))
      .then((t) => tuneSlotTexture(t, slot, hwMaxAnisotropy))
      .catch(() => {
        warn(missingAssetWarning(slot)); // V3 §7.11: sessiz düşüş YASAK
        return null;                      // placeholder malzeme mount'ta kalır
      });
    cache.set(slot, entry);
  }
  return entry;
}

/** Test izolasyonu için. */
export function resetSlotTextureCache(): void {
  cache.clear();
}
```

- [ ] **Step 5: PASS gör + commit** — `npx tsc --noEmit && npx vitest run` → `git commit -m "feat(scene): asset slot manifesti — brief adları, V3 format/uyarı kanunları vitest'te"`

---

### Task 2: `useSlotTexture` hook + mevcut altı slotun bağlanması

**Files:** Create `src/scene/useSlotTexture.ts`; Modify `src/scene/DioramaStage.tsx`

- [ ] **Step 1: Hook'u yaz** — `src/scene/useSlotTexture.ts` (ince kabuk; tüm mantık Task 1'de test edildi):

```ts
import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import type { Texture } from 'three';
import { loadSlotTexture, type AssetSlot } from './assetSlots';

/**
 * Slot dokusunu dener: varsa Texture, yoksa null (uyarı loadSlotTexture'da basıldı).
 * Suspense YOK — eksik asset istisna değil, brief teslimine kadar NORMAL durumdur;
 * placeholder malzeme null döndükçe mount'ta kalır (V3 §7.11).
 */
export function useSlotTexture(slot: AssetSlot): Texture | null {
  const gl = useThree((s) => s.gl);
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    let alive = true;
    loadSlotTexture(slot, gl.capabilities.getMaxAnisotropy()).then((t) => {
      if (alive && t) setTexture(t);
    });
    return () => { alive = false; };
  }, [slot, gl]);

  return texture;
}
```

- [ ] **Step 2: `DioramaStage.tsx` — FloatingCard'a yüz, masa/zemine doku.** Zemin ve masa üstü kendi bileşenine çıkar (hook kullanacaklar). Kritik desen — **materyal `key`'i doku varlığına bağlanır**: three'de `map`'in null→texture geçişi shader derlemesi ister; `key` remount'u bunu deterministik yapar. `map` bağlıyken `color` beyaza çekilir (map × color çarpımı dokuyu karartmasın; doku zaten palete boyanmış gelir):

```tsx
import { useSlotTexture } from './useSlotTexture';
import type { CardSlot } from './assetSlots';

/** Yüzen kart: face slotu doluysa painterly plate, boşsa altın-kağıt placeholder. */
function FloatingCard({ position, rotationY, phase, face }: {
  position: [number, number, number];
  rotationY: number;
  phase: number;
  face: CardSlot;
}) {
  const faceTexture = useSlotTexture(face);
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => { /* mevcut yüzme/salınım aynen */ });
  return (
    <group ref={ref} position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.1, 1.55, 0.03]} />
        <meshStandardMaterial color={LOOK.palette.paper} roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[0.94, 1.38]} />
        <meshStandardMaterial
          key={faceTexture ? 'painted' : 'placeholder'} /* map null→doku: shader tazelensin */
          map={faceTexture ?? undefined}
          color={faceTexture ? '#ffffff' : LOOK.palette.ink}
          roughness={1}
        />
      </mesh>
    </group>
  );
}

/** Zemin diski: doku gelene dek düz LOOK.palette.floor (bugünkü hali). */
function FloorDisc() {
  const texture = useSlotTexture('floor-disc');
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[9, 64]} />
      <meshStandardMaterial
        key={texture ? 'painted' : 'placeholder'}
        map={texture ?? undefined}
        color={texture ? '#ffffff' : LOOK.palette.floor}
        roughness={0.95}
      />
    </mesh>
  );
}

/** Masa üstü: doku tabla malzemesine gelir; bacaklar placeholder kalır (brief'te bacak asset'i yok). */
function TableTop() {
  const texture = useSlotTexture('table-top');
  return (
    <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.4, 0.09, 1.3]} />
      <meshStandardMaterial
        key={texture ? 'painted' : 'placeholder'}
        map={texture ?? undefined}
        color={texture ? '#ffffff' : '#2a241c'}
        roughness={0.7}
      />
    </mesh>
  );
}
```

`DioramaStage` gövdesinde: zemin mesh'i → `<FloorDisc />`; masa grubundaki tabla mesh'i → `<TableTop />` (bacak map'i aynen kalır); dört karta `face` eklenir — mevcut poz/faz/rotasyon değerlerine DOKUNMADAN (M3 kamera koreografisi bu kadrajlara ayarlı):

```tsx
<FloatingCard face="card-hero-archetype"      position={[-2.6, 1.9, -0.8]} rotationY={0.5}   phase={0} />
<FloatingCard face="card-detective-archetype" position={[-1.4, 2.3, -1.8]} rotationY={0.2}   phase={2.1} />
<FloatingCard face="card-arcane-archetype"    position={[0.2, 2.0, -2.4]}  rotationY={-0.15} phase={4.2} />
<FloatingCard face="card-explorer-archetype"  position={[1.8, 2.4, -2.0]}  rotationY={-0.45} phase={1.3} />
```

- [ ] **Step 3: Doğrula** — `npx tsc --noEmit && npx vitest run`. Dev server + `?scene=force`: sahne bugünkünün pikseli-pikseline aynısı (asset yok → placeholder), konsolda **6 slot için** `[assets3d] missing/failed: ...` (backdrop/logo Task 3'te). Bu görüntü M1–M3 kanıtlarıyla karşılaştırılır — regresyon sıfır.

- [ ] **Step 4: Commit** — `git commit -m "feat(scene): altı diorama slotu manifest'e bağlandı — doku yoksa placeholder + V3 uyarısı"`

---

### Task 3: Yeni mesh'ler — BackdropSky kubbesi + LogoCard

**Files:** Modify `src/scene/DioramaStage.tsx`

- [ ] **Step 1: BackdropSky** — dönen grubun DIŞINA (sabit gök, diorama içinde döner → parallax):

```tsx
import { BackSide } from 'three';

/** Gökyüzü kubbesi: 2048×1024 panorama, kısmi küre iç yüzeyi (Kilitli karar #1).
 *  fog=false ŞART (r=30 > fog.far 26); toneMapped=false (asset palete boyalı gelir);
 *  meshBasicMaterial — gök önceden ışıklanmıştır, sahne lambasına tepki vermez.
 *  Doku yoksa mesh YOK: clearColor (#080705) bugünkü fon görevini sürdürür. */
function BackdropSky() {
  const texture = useSlotTexture('backdrop-sky');
  if (!texture) return null;
  const r = LOOK.assets3d.backdropRadius;
  return (
    <mesh rotation={[0, Math.PI * 0.85, 0]} /* ufuktaki altın parıltı dashboard kadrajına; kanıt turunda ayarlanır */>
      <sphereGeometry args={[r, 48, 24, 0, Math.PI * 2, 0, Math.PI * LOOK.assets3d.backdropTheta]} />
      <meshBasicMaterial map={texture} side={BackSide} fog={false} toneMapped={false} />
    </mesh>
  );
}
```

- [ ] **Step 2: LogoCard** — dönen grubun İÇİNE; kart fanının üstünde-arkasında asılı amblem. Doku yoksa render edilmez (Kilitli karar #4; "MAMILAS" metni DOM sidebar'da yaşar, sahneye yazı girmez):

```tsx
/** Amblem kartı: FloatingCard geometrisiyle bire bir; yalnız doku geldiğinde doğar. */
function LogoCard() {
  const texture = useSlotTexture('logo-card');
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = 3.4 + Math.sin(clock.elapsedTime * 0.4) * 0.08; // kartlardan yavaş, ağırbaşlı
  });
  if (!texture) return null;
  return (
    <group ref={ref} position={[0.4, 3.4, -3.0]} rotation={[0, 0.05, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.1, 1.55, 0.03]} />
        <meshStandardMaterial color={LOOK.palette.paper} roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[0.94, 1.38]} />
        <meshStandardMaterial map={texture} color="#ffffff" roughness={1} />
      </mesh>
    </group>
  );
}
```

`DioramaStage` return'ü fragment olur:

```tsx
return (
  <>
    <BackdropSky />
    <group ref={stage}>
      {/* ... mevcut her şey + <LogoCard /> ... */}
    </group>
  </>
);
```

- [ ] **Step 3: Doğrula + commit** — tsc + vitest + `?scene=force` gözle: asset'siz görüntü hâlâ M3 ile aynı; konsolda artık **8 slot uyarısı**. `git commit -m "feat(scene): backdrop kubbesi + logo kartı slotları — doku gelince doğar, yoksa iz bırakmaz"`

---

### Task 4: Kanıt dokularıyla uçtan uca bağlanma ispatı

**Files:** Create `scripts/make-proof-textures.mjs`

Gerçek asset'ler henüz yokken slot sisteminin ÇALIŞTIĞI ispatlanmalı — yoksa "bağlanır" vaadi test edilmemiş kod olur.

- [ ] **Step 1: Kanıt dokusu üretici** — `scripts/make-proof-textures.mjs` (node webp encode edemez; Chromium canvas eder — playwright zaten bağımlılık). Her slota palet-içi koyu gradyan + slot adı yazılır (gerçek asset'le ASLA karışmasın; parlaklık düşük — bloom patlatmaz):

```js
// KANIT DOKUSU ÜRETİCİ — yalnız yerel doğrulama için. ÇIKTILARI COMMIT ETME.
// Kullanım: node scripts/make-proof-textures.mjs  → sonra: rm public/assets3d/*.webp
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const SLOTS = [
  ['card-hero-archetype', 1024, 1448], ['card-detective-archetype', 1024, 1448],
  ['card-arcane-archetype', 1024, 1448], ['card-explorer-archetype', 1024, 1448],
  ['table-top', 1024, 1024], ['floor-disc', 2048, 2048],
  ['backdrop-sky', 2048, 1024], ['logo-card', 1024, 1448],
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [name, w, h] of SLOTS) {
  const dataUrl = await page.evaluate(([name, w, h]) => {
    const c = Object.assign(document.createElement('canvas'), { width: w, height: h });
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#3a2f1a'); grad.addColorStop(1, '#141210'); // palet-içi, düşük value
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(214,168,79,0.7)'; g.font = `${Math.round(w / 14)}px monospace`;
    g.textAlign = 'center'; g.fillText(name, w / 2, h / 2); // slot adı = "bu bir proof"
    return c.toDataURL('image/webp', 0.9);
  }, [name, w, h]);
  writeFileSync(`public/assets3d/${name}.webp`, Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log(`✓ proof: ${name}.webp (${w}×${h})`);
}
await browser.close();
```

- [ ] **Step 2: İspat turu** — `node scripts/make-proof-textures.mjs` → dev server + M3'ün kanıt snippet'i (`?scene=force`, 6 stage screenshot, `reports/m4-slots-<stage>.png`) + `page.on('console')` yakalama. **Read ile aç, gözle:** (a) 4 kartta 4 FARKLI slot adı okunuyor (eşleşme doğru), (b) zeminde 3×3 tile, (c) masada doku, (d) gökte kubbe (clearColor değil), (e) logo kartı doğdu, (f) konsolda SIFIR `[assets3d]` uyarısı. Sonra `rm public/assets3d/*.webp` → yenile → placeholder'lar geri, konsolda 8 uyarı — **çift yönlü ispat**.

- [ ] **Step 3: Commit** — yalnız script + screenshot'lar: `git add scripts/make-proof-textures.mjs reports/m4-slots-*.png && git commit -m "feat(scene): slot sistemi çift yönlü ispat — proof dokular bağlanıyor, silinince placeholder+uyarı dönüyor"`. `git status`'ta `public/assets3d/` TEMİZ olmalı.

---

### Task 5: `.ml-v3-floor` grid emekliliği — DOM tarafı (TDD)

V3 §8 tek zemin otoritesi: gerçek zemin dokusu sahnede canlıyken DOM grid'i çekilir; grid yalnız fallback'te (sahne kapalı) yaşar. M3 planı bu işi açıkça M4'e bıraktı. Kanun uyumu: DOM sahneden OKUMAZ — iki taraf aynı statik kaynağı (manifest URL + public dosyası) bağımsız probe'lar; store→sahne tek yönü bozulmaz.

**Files:** Create `src/scene/assetPresence.ts`, `src/scene/assetPresence.test.ts`; Modify `src/components/Layout/AppLayout.tsx:52`

- [ ] **Step 1: Failing test** — `src/scene/assetPresence.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { domFloorGridVisible } from './assetPresence';

describe('domFloorGridVisible (V3 §8 tek zemin otoritesi)', () => {
  it('sahne kapalıyken grid DAİMA yaşar (fallback kanunu) — doku olsa bile', () => {
    expect(domFloorGridVisible('off', true)).toBe(true);
    expect(domFloorGridVisible('off', false)).toBe(true);
  });
  it('sahne açık + doku canlı → grid emekli (iki zemin aynı anda yaşamaz)', () => {
    expect(domFloorGridVisible('on', true)).toBe(false);
  });
  it('sahne açık ama doku yok → grid kalır (placeholder dönemi)', () => {
    expect(domFloorGridVisible('on', false)).toBe(true);
  });
});
```

- [ ] **Step 2: Modülü yaz** — `src/scene/assetPresence.ts`:

```ts
import { useEffect, useState } from 'react';
import { slotUrl } from './assetSlots';
import { resolveSceneMode, type SceneMode } from './webglSupport';

/** Saf karar: grid yalnız (sahne kapalı) VEYA (zemin dokusu yok) iken görünür. */
export function domFloorGridVisible(mode: SceneMode, floorTextureLive: boolean): boolean {
  return mode === 'off' || !floorTextureLive;
}

/**
 * DOM tarafı zemin probe'u. Sahneden OKUMAZ (V3 §2: tek yön store→sahne) —
 * aynı public dosyayı Image() ile bağımsız dener. onerror'da grid kalır;
 * uyarıyı sahne tarafı (loadSlotTexture) zaten basar, burada çift warn yok.
 */
export function useFloorGridVisible(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const mode = resolveSceneMode(window.location.search);
    if (mode === 'off') return; // fallback: grid dokunulmaz
    const img = new Image();
    img.onload = () => setVisible(domFloorGridVisible(mode, true));
    img.src = slotUrl('floor-disc');
  }, []);
  return visible;
}
```

- [ ] **Step 3: AppLayout'a bağla** — satır 52: `<div className="ml-v3-floor" aria-hidden />` → `{floorGridVisible && <div className="ml-v3-floor" aria-hidden />}` (`const floorGridVisible = useFloorGridVisible();` komponent başına). CSS'e dokunulmaz.

- [ ] **Step 4: Doğrula + commit** — vitest + üç manuel senaryo: `?scene=off` grid var; `?scene=force` + proof zemin dokusu (Task 4 script) grid YOK; `?scene=force` + doku silinmiş grid var. `git commit -m "feat(shell): DOM zemin grid'i tek zemin otoritesine bağlandı — sahne+doku canlıyken emekli"`

---

### Task 6: Gate raporu — `scripts/check-assets3d.mjs` + manifest senkron testi

**Files:** Create `scripts/check-assets3d.mjs`, `public/assets3d/.gitkeep`; Modify `src/scene/assetSlots.test.ts` (senkron pini)

- [ ] **Step 1: Script'i yaz** — 15 dosya (8 WebP + 7 portre PNG) varlık + gerçek boyut (header parse, bağımlılıksız). Varsayılan **rapor modu exit 0** (mamilas-gate yeşil kalır); `--strict` asset kabulünde koşulur (V3 §8 kriter 1):

```js
// M4 asset teslim raporu — ASSET_BRIEF_DRAFT.md §2–3 sözleşmesi.
// Varsayılan: raporlar, exit 0 (kod kapısı asset beklemez).
// --strict: eksik/yanlış boyutta exit 1 (yalnız asset KABULÜNDE koşulur).
import { existsSync, readFileSync } from 'fs';

const EXPECTED = [
  ['public/assets3d/card-hero-archetype.webp', 1024, 1448],
  ['public/assets3d/card-detective-archetype.webp', 1024, 1448],
  ['public/assets3d/card-arcane-archetype.webp', 1024, 1448],
  ['public/assets3d/card-explorer-archetype.webp', 1024, 1448],
  ['public/assets3d/table-top.webp', 1024, 1024],
  ['public/assets3d/floor-disc.webp', 2048, 2048],
  ['public/assets3d/backdrop-sky.webp', 2048, 1024],
  ['public/assets3d/logo-card.webp', 1024, 1448],
  ['public/assets/characters/skill_volition.png', 512, 512],
  ['public/assets/characters/skill_perception.png', 512, 512],
  ['public/assets/characters/skill_shivers.png', 512, 512],
  ['public/assets/characters/skill_logic.png', 512, 512],
  ['public/assets/characters/skill_visual_calculus.png', 512, 512],
  ['public/assets/characters/skill_drama.png', 512, 512],
  ['public/assets/characters/skill_case_ledger.png', 512, 512],
];

function pngSize(buf) {
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
function webpSize(buf) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null;
  const fourcc = buf.toString('ascii', 12, 16);
  if (fourcc === 'VP8X') return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
  if (fourcc === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
  if (fourcc === 'VP8L') {
    const bits = buf.readUInt32LE(21);
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

let missing = 0, wrong = 0;
for (const [path, w, h] of EXPECTED) {
  if (!existsSync(path)) { missing++; console.log(`  EKSİK   ${path} (beklenen ${w}×${h})`); continue; }
  const buf = readFileSync(path);
  const size = path.endsWith('.png') ? pngSize(buf) : webpSize(buf);
  if (!size) { wrong++; console.log(`  BOZUK   ${path} (header okunamadı)`); continue; }
  if (size.w !== w || size.h !== h) { wrong++; console.log(`  BOYUT   ${path} ${size.w}×${size.h} ≠ ${w}×${h}`); continue; }
  console.log(`  ✓       ${path} ${size.w}×${size.h}`);
}
console.log(`\n[assets3d] ${EXPECTED.length - missing - wrong}/${EXPECTED.length} hazır · ${missing} eksik · ${wrong} format sorunu`);
if (process.argv.includes('--strict') && (missing || wrong)) process.exit(1);
```

- [ ] **Step 2: Manifest↔script senkron pini** — `assetSlots.test.ts`'e ekle (script .mjs olduğundan TS manifest'i import edemez; kopukluk gate'te yakalanır):

```ts
it('check-assets3d.mjs her slotu tanır (manifest↔script senkronu)', () => {
  const script = readFileSync('scripts/check-assets3d.mjs', 'utf8');
  for (const slot of ASSET_SLOTS) expect(script).toContain(`${slot}.webp`);
});
```

- [ ] **Step 3: `.gitkeep` + doğrula + commit** — `touch public/assets3d/.gitkeep`; `node scripts/check-assets3d.mjs` → 8 EKSİK + 7 portre satırı raporlanır, exit 0. `git commit -m "feat(gate): assets3d teslim raporu — 15 dosya varlık+boyut, strict yalnız kabulde"`

---

### Task 7: M4 kapanışı — tam kapı + çift kanıt + teslim sonrası kabul prosedürü

- [ ] **Step 1: Tam kapı** — `mamilas-gate` skill'i: tsc + vitest (344 taban + ~19 yeni) + build + syntax yeşil.
- [ ] **Step 2: Fallback kanıtı** — `?scene=force` OLMADAN headless: `scene-layer` yok, `.ml-v3-floor` grid'i DURUYOR, 2D akış tam (V3 §7.10 — WebGL fallback M4'ten etkilenmedi).
- [ ] **Step 3: `node scripts/final-shots.mjs`** hatasız + `node scripts/check-assets3d.mjs` raporu kanıt çıktısına eklenir.
- [ ] **Step 4: Commit + `mamilas-checkpoint`** (memory güncellemesi dahil).
- [ ] **Step 5 (asset teslimi SONRASI — ayrı oturum olabilir):** Muhammet 15 dosyayı bıraktığında kabul prosedürü: `node scripts/check-assets3d.mjs --strict` exit 0 → `?scene=force` stage turu screenshot'ları → V3 §8 üç kriter gözle (tek altın ışık okunuyor, bloom patlaması yok — özellikle backdrop ufuk parıltısı ve luminance>0.72 ≤ %4, fark "boyanmış dünya") → gerekirse YALNIZ şu düğmeler ayarlanır: `LOOK.assets3d.floorRepeat`, backdrop `rotation`/`backdropTheta`, LogoCard pozu, `LOOK.grain/Sparkles` ince ayarı (§7 tavanları altında) → commit.

---

## Riskler

1. **Vite SPA fallback maskeleme:** eksik `.webp` isteği 200+HTML dönebilir; `TextureLoader` decode hatasıyla `onError`'a düşer — tasarım buna dayanır. Ancak `useFloorGridVisible` probe'u da `Image.onerror`'a dayanır; bir tarayıcı HTML'i sessizce "yüklenemedi" saymazsa (bilinen tümü sayar) grid yanlış kalkabilir — kanıt turundaki üçlü senaryo bunu yakalar.
2. **map null→texture shader tazelenmesi:** R3F sürümüne göre otomatik olmayabilir; plan `key` remount ile deterministikleştirir. Remount tek materyal objesi — maliyet ihmal edilir.
3. **Kart oran farkı:** plane 0.94×1.38 (0.681) vs doku 1024×1448 (0.707) — ~%4 yatay gerilme; painterly plate'te görünmez. Geometri DEĞİŞTİRİLMEZ (M3 kamera pozları bu kadraja ayarlı); rahatsız ederse kabul adımında doku kırpılır, kod değil.
4. **Masa yan yüzleri:** boxGeometry tek materyal — 1024² doku ince yanlarda ezik görünür (koyu ahşap çizgisi gibi okunur). Kabulde göze batarsa 6-materyal dizisine geçilir; şimdiden karmaşıklaştırılmaz.
5. **Context-loss ara durumu:** sahne çalışırken context düşerse SceneLayer kapanır ama AppLayout probe'u tekrar koşmaz → o seans DOM grid'i geri gelmez (yalnız kozmetik; spotlight/AntigravityBackground yaşıyor, reload düzeltir). Bilinçli kabul — sahne→DOM kanalı açmaya değmez.
6. **GPU bellek:** 8 doku ≈ 65MB (mipmap dahil) — bütçe içi; DPR≤2 kanunu değişmez.
7. **Proof dokularının kazara commit'i:** Task 4/7'de `git status` temizlik adımı var + NE YAPILMAYACAK maddesi; `check-assets3d` proof'ları gerçek sanamaz ama insan gözü slot-adı yazısını anında ayırt eder.

## NE YAPILMAYACAK

- **Portre koduna dokunulmaz:** `voicePortraits.ts`, `AdvisorPortrait`, `/assets/characters` yolu, `FALLBACK_PORTRAIT`, TONE_COLOR — hiçbiri. Muhammet aynı id'lerle PNG'leri üstüne yazar; M4'ün tek portre işi check-assets3d raporudur.
- **Beyin/çekirdek dokunuşu yok:** `src/core/`, `src/store/`, kabinet, Final Brief/export.
- **`LOOK` şiddetlerine (bloom/grain/vignette/CA/fog/kamera) bu planda dokunulmaz** — grain/partikül "son ayar" cilası gerçek asset'lerle anlamlıdır ve Task 7 Step 5'in §7-tavanlı dar kapısından geçer. `CAMERA_POSES` ve `CameraRig` tamamen dokunulmaz.
- **Suspense/useTexture'a geçiş, ErrorBoundary ekleme, preload/manifest.json fetch'i yok** — Kilitli karar #2/#3 yeniden açılmaz.
- **Sahne→DOM/store geri-kanalı yok** (V3 §2/§7.9): grid emekliliği bağımsız probe'dur, sahneden state okumaz.
- **Yeni bağımlılık yok** (sharp/image-size dahil — boyut okuma elle header parse).
- **Kart/masa/zemin geometrileri ve pozları değişmez;** placeholder malzemeler silinmez (V3 §7.11 onlara muhtaç).
- **Proof dokuları ve gerçek asset'ler bu dalda commit edilmez** — asset teslimi Muhammet'in ayrı commit'idir; `public/assets3d/`te repoya yalnız `.gitkeep` girer.
- **`?scene=off`/fallback davranışına dokunulmaz;** `.ml-v3-floor` CSS'i silinmez (fallback'in zeminidir).
- **mamilas-gate'e asset zorunluluğu eklenmez** — strict mod yalnız elle, kabul anında.

---

**Uygulayıcıya not (repo bulguları):** `DioramaStage.tsx` bugün 99 satır; kart pozları satır 84–87, zemin 63–67, masa tablası 71–74. `SceneLayer` `?scene=force/off` mantığı `webglSupport.resolveSceneMode`'da hazır — M4 sahne-mount koduna dokunmaz. `.ml-v3-floor` tek mount noktası `AppLayout.tsx:52`. Kanıt snippet kalıbı M3 planı Task 6 Step 3'tedir (`?scene=force` + `window.__mamilas.setState`); `reports/` klasörü M3'ten beri kullanımda. Test tabanı 344; `assetSlots.test.ts` `readFileSync` deseni için emsal `src/styles/designLaws.test.ts`.

---

**Özet — verilen kararlar ve gerekçeleri:** (1) Backdrop = BackSide kısmi küre r=30, `meshBasicMaterial fog:false toneMapped:false` — altı kamera pozu her azimuttan baktığı için plane elenir; fog.far=26 nedeniyle `fog:false` zorunlu; dönen grubun dışında durur (parallax). (2) Doku yükleme = manuel `TextureLoader` + modül cache + state; Suspense değil — eksik asset istisna değil normal durum, Vite SPA fallback'i fetch-probe'u yalancı çıkarır, cache warn-once garantisi verir. (3) Manifest = runtime saf TS modülü; `import.meta.glob` public/ üstünde çalışmaz ve "at-yenile-bağlansın" vaadini build'e rehin ederdi. (4) Gate: kod kapısı asset'siz yeşil; `check-assets3d.mjs` rapor modu + `--strict` kabul modu ikiliği brief'in "raporlar" ve görevin "gate yeşil kalmalı" şartlarını aynı anda karşılar.