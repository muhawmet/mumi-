# Işıklı Atölye T1 — Diorama Seti + Sıcak LOOK + Cross-fade

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Diorama "karanlık boşlukta masa-lamba dekoru" olmaktan çıkıp gece yarısı çalışan sıcak bir yapım atölyesine dönüşür (envanter 1, 5, 17): arka duvar + çerçeve rayı, merkez masa + masa lambası, 2 duvar apliği, sıcak LOOK bandı (V3.1), yeni kamera koreografisi, stage geçişinde cross-fade (1sn boş cam biter), Slenderman testi kanıtı + Mami'ye asset GOAL dosyası.

**Architecture:** Görsel otorite zinciri korunur: tüm şiddet/renk/poz `lookConfig.LOOK` + `CAMERA_POSES`'ta, sahne geometrisi `DioramaStage.tsx`'te, kamera `CameraRig`'te (dokunulmaz). Işık kanunu (altın ana + ≤2 sıcak ikincil + ambient ~0.35) `LOOK.light` olarak configte yaşar ki designLaws testi mühürleyebilsin. Yüzen kartlar emekli → duvar çerçeveleri (aynı 4 card slotu yüz dokusu olarak yaşar, asset sözleşmesi bozulmaz). Geçiş fixi yalnız `App.tsx`: `AnimatePresence mode="wait"` → `mode="popLayout"` + Suspense her adımın İÇİNE iner (eski içerik, yenisi gelene dek ekranda kalır).

**Tech Stack:** Mevcut — three 0.185, R3F 9, drei 10, framer-motion, vitest, Playwright. **Yeni bağımlılık yok.**

**Kurallar:** Beyin dosyaları (src/core) dokunulmaz · 5180 dokunulmaz · push yok · TDD (taban 370 düşmez) · UI 2D ekranlarının içi kapsam dışı (o T3-T6).

**Bağlam:** Üst plan `~/.claude/plans/inherited-humming-petal.md` T1. Mevcut sahne: `src/scene/` (DioramaStage, lookConfig, CameraRig, SceneCanvas, PostFX, assetSlots). Geçiş kökü: `src/App.tsx:52` `AnimatePresence mode="wait"` + dıştaki Suspense — exit(0.3s)+chunk load+enter boyunca cam boş.

---

### Task 1: LOOK V3.1 kanunu (TDD)

Sıcak band kanuna işlenir; designLaws gate'i (lookConfig.test.ts) önce kırmızı yazılır.

**Files:**
- Modify: `src/scene/lookConfig.test.ts`
- Modify: `src/scene/lookConfig.ts`

- [ ] **Step 1: Failing testler** — `lookConfig.test.ts`'e V3.1 describe'ı ekle:

```ts
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

describe('LOOK V3.1 — Işıklı Atölye bandı', () => {
  it('fog bandı 12-16 / 30-38 (karanlık boşluk yasağı)', () => {
    expect(LOOK.fog.near).toBeGreaterThanOrEqual(12);
    expect(LOOK.fog.near).toBeLessThanOrEqual(16);
    expect(LOOK.fog.far).toBeGreaterThanOrEqual(30);
    expect(LOOK.fog.far).toBeLessThanOrEqual(38);
  });

  it('clearColor ve fog rengi sıcak ailede (r ≥ g ≥ b)', () => {
    for (const hex of [LOOK.clearColor, LOOK.fog.color]) {
      const [r, g, b] = hexToRgb(hex);
      expect(r, `${hex} soğuk`).toBeGreaterThanOrEqual(g);
      expect(g, `${hex} maviye kaçmış`).toBeGreaterThanOrEqual(b);
    }
  });

  it('ışık kanunu: ambient ~0.35, ana lamba ikincillerin ≥2 katı, ≤2 aplik', () => {
    expect(LOOK.light.ambient).toBeGreaterThanOrEqual(0.3);
    expect(LOOK.light.ambient).toBeLessThanOrEqual(0.45);
    expect(LOOK.light.lamp).toBeGreaterThanOrEqual(LOOK.light.sconce * 2);
    expect(LOOK.light.sconcePositions.length).toBeLessThanOrEqual(2);
  });

  it('vignette gevşedi (mesai gecesi, mahzen değil)', () => {
    expect(LOOK.vignette.darkness).toBeLessThanOrEqual(0.75);
    expect(LOOK.vignette.offset).toBeGreaterThanOrEqual(0.3);
  });
});
```

- [ ] **Step 2: FAIL gör** — `npx vitest run src/scene/lookConfig.test.ts` → 4 test kırmızı (fog 9-26, renk soğuk, LOOK.light yok, vignette 0.82).

- [ ] **Step 3: LOOK'u V3.1'e çevir** — `lookConfig.ts`:

```ts
export const LOOK = {
  /* V3.1 Işıklı Atölye: sis geri çekilir, fon sıcak kahve — karanlık "tehdit" değil "mesai gecesi" */
  fog: { color: '#161009', near: 14, far: 34 },
  clearColor: '#14100b',
  bloom: { intensity: 0.35, luminanceThreshold: 0.72, luminanceSmoothing: 0.2 },
  vignette: { offset: 0.32, darkness: 0.68 },
  grain: { opacity: 0.16 },
  chromaticAberration: { offset: 0.0012 },
  cameraDamp: 2.2,
  /* V3.1 ışık kanunu: altın ana (masa lambası) + ≤2 sıcak ikincil (aplik) + ambient ~0.35 */
  light: {
    ambient: 0.35,
    lamp: 9,
    sconce: 4,
    sconceColor: '#e8b563',
    sconcePositions: [[-4.6, 3.4, -4.0], [4.6, 3.4, -4.0]] as ReadonlyArray<readonly [number, number, number]>,
  },
  assets3d: {
    maxAnisotropy: 8,
    floorRepeat: 3,
    wallRepeat: [4, 1.6] as readonly [number, number], // 18×7 duvar, 2048² seamless
    backdropRadius: 30,
    backdropTheta: 0.62,
  },
  palette: {
    gold: '#f7c948',
    amber: '#d6a84f',
    paper: '#e8ddc8',
    ink: '#0a0c14',
    floor: '#1a1410',      // sıcak ahşap-toprak (eski #141210 gri-soğuktu)
    wall: '#2a211a',       // sıcak sıva
    woodDark: '#241a10',   // masa/çerçeve ahşabı
    brass: '#8a6a3a',      // ray/aplik metali
  },
} as const;
```

(`assets3d.backdropRadius` 30 artık fog.far 34'ün İÇİNDE — `BackdropSky` zaten `fog={false}`, davranış değişmez; DioramaStage'deki yorum Task 2'de güncellenir.)

- [ ] **Step 4: PASS + tam suite** — `npx vitest run` (370 taban + 4 yeni).
- [ ] **Step 5: Commit** — `git add src/scene/lookConfig.ts src/scene/lookConfig.test.ts && git commit -m "feat(t1): LOOK V3.1 sıcak bandı kanunlaştı — fog geri çekildi, kahve fon, ışık kanunu LOOK.light'ta (TDD)"`

---

### Task 2: Yeni set — atölye odası (duvar + çerçeveler + merkez masa + lamba + aplikler)

**Files:**
- Modify: `src/scene/DioramaStage.tsx` (büyük yeniden yazım)
- Modify: `src/scene/assetSlots.ts` (+`wall-plaster` slotu)
- Modify: `src/scene/assetSlots.test.ts`

- [ ] **Step 1: assetSlots TDD** — `assetSlots.test.ts`'e ekle (mevcut describe kalıbına uy):

```ts
it('wall-plaster slotu sözleşmede ve duvar tile ayarı alır', () => {
  expect(ASSET_SLOTS).toContain('wall-plaster');
  const t = makeFakeTexture(); // dosyadaki mevcut fake-texture helper'ı kullan
  tuneSlotTexture(t, 'wall-plaster', 16);
  expect(t.wrapS).toBe(RepeatWrapping);
  expect(t.repeat.x).toBe(LOOK.assets3d.wallRepeat[0]);
  expect(t.repeat.y).toBe(LOOK.assets3d.wallRepeat[1]);
});
```

FAIL gör → `assetSlots.ts`: `ASSET_SLOTS`'a `'wall-plaster', // atölye arka duvarı, 2048² seamless WebP` ekle; `tuneSlotTexture`'a:

```ts
if (slot === 'wall-plaster') {
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(LOOK.assets3d.wallRepeat[0], LOOK.assets3d.wallRepeat[1]);
}
```

PASS gör.

- [ ] **Step 2: DioramaStage yeniden yazımı** — `FloatingCard`/`CardBacking`/`LampPost` emekli; yerine oda seti. Tam içerik:

```tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { BackSide, type Group } from 'three';
import { LOOK } from './lookConfig';
import { useSlotTexture } from './useSlotTexture';
import type { CardSlot } from './assetSlots';

/** Duvar çerçevesi: ahşap kasa + yüz (card slotu doluysa painterly plate, boşsa sıcak parşömen). */
function FramedPlate({ position, tilt = 0, face }: {
  position: [number, number, number];
  tilt?: number;
  face: CardSlot;
}) {
  const texture = useSlotTexture(face);
  return (
    <group position={position} rotation={[0, 0, tilt]}>
      <mesh castShadow>
        <boxGeometry args={[1.3, 1.75, 0.07]} />
        <meshStandardMaterial color={LOOK.palette.woodDark} roughness={0.6} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[1.06, 1.5]} />
        <meshStandardMaterial
          key={texture ? 'painted' : 'placeholder'}
          map={texture ?? undefined}
          color={texture ? '#ffffff' : '#cfc2a6'}
          roughness={0.9}
        />
      </mesh>
    </group>
  );
}

/** Amblem çerçevesi: duvarın tepe merkezinde, yalnız doku geldiğinde doğar. */
function LogoFrame() {
  const texture = useSlotTexture('logo-card');
  if (!texture) return null;
  return (
    <group position={[0, 4.6, -4.05]}>
      <mesh castShadow>
        <boxGeometry args={[1.5, 2.0, 0.07]} />
        <meshStandardMaterial color={LOOK.palette.brass} roughness={0.45} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[1.24, 1.74]} />
        <meshStandardMaterial map={texture} color="#ffffff" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Arka duvar: sıva dokusu (wall-plaster) ya da sıcak düz sıva + süpürgelik. */
function BackWall() {
  const texture = useSlotTexture('wall-plaster');
  return (
    <group position={[0, 0, -4.2]}>
      <mesh position={[0, 3.5, 0]} receiveShadow>
        <planeGeometry args={[18, 7]} />
        <meshStandardMaterial
          key={texture ? 'painted' : 'placeholder'}
          map={texture ?? undefined}
          color={texture ? '#ffffff' : LOOK.palette.wall}
          roughness={0.95}
        />
      </mesh>
      <mesh position={[0, 0.12, 0.05]} receiveShadow>
        <boxGeometry args={[18, 0.24, 0.08]} />
        <meshStandardMaterial color={LOOK.palette.woodDark} roughness={0.8} />
      </mesh>
      {/* Çerçeve rayı: pirinç çubuk, çerçeveler bunun altında asılı okunur */}
      <mesh position={[0, 4.0, 0.06]}>
        <cylinderGeometry args={[0.025, 0.025, 17.4, 8]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color={LOOK.palette.brass} roughness={0.35} metalness={0.7} />
      </mesh>
    </group>
  );
}

/** Zemin diski: doku gelene dek sıcak ahşap-toprak. */
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

/** Çalışma masası: merkezde, atölyenin kalbi. */
function WorkTable() {
  const texture = useSlotTexture('table-top');
  return (
    <group position={[0, 0, 0.4]}>
      <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.09, 1.5]} />
        <meshStandardMaterial
          key={texture ? 'painted' : 'placeholder'}
          map={texture ?? undefined}
          color={texture ? '#ffffff' : LOOK.palette.woodDark}
          roughness={0.7}
        />
      </mesh>
      {([[-1.25, -0.6], [1.25, -0.6], [-1.25, 0.6], [1.25, 0.6]] as const).map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.37, z]} castShadow>
          <boxGeometry args={[0.09, 0.74, 0.09]} />
          <meshStandardMaterial color={LOOK.palette.woodDark} roughness={0.8} />
        </mesh>
      ))}
      {/* Masa üstü zanaat: kart destesi + mürekkep şişesi (Slenderman testi nesneleri) */}
      <mesh position={[-0.7, 0.86, 0.15]} rotation={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.5, 0.07, 0.36]} />
        <meshStandardMaterial color={LOOK.palette.paper} roughness={0.9} />
      </mesh>
      <mesh position={[0.35, 0.9, -0.35]} castShadow>
        <cylinderGeometry args={[0.06, 0.075, 0.16, 12]} />
        <meshStandardMaterial color="#1e2a38" roughness={0.3} metalness={0.1} />
      </mesh>
    </group>
  );
}

/** Masa lambası: altın ana ışık — sokak direği emekli, ışık masaya indi. */
function TableLamp() {
  return (
    <group position={[0.9, 0.83, 0.15]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.06, 16]} />
        <meshStandardMaterial color={LOOK.palette.brass} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[-0.12, 0.34, 0]} rotation={[0, 0, 0.5]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.75, 8]} />
        <meshStandardMaterial color={LOOK.palette.brass} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[-0.34, 0.66, 0]} rotation={[0, 0, 0.35]}>
        <coneGeometry args={[0.22, 0.26, 20, 1, true]} />
        <meshStandardMaterial color="#3a2c18" roughness={0.5} metalness={0.3} side={2} />
      </mesh>
      <mesh position={[-0.34, 0.58, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color={LOOK.palette.gold} emissive={LOOK.palette.gold} emissiveIntensity={2.4} />
      </mesh>
      <pointLight
        position={[-0.34, 0.52, 0]}
        color={LOOK.palette.gold}
        intensity={LOOK.light.lamp}
        distance={11}
        decay={1.8}
        castShadow
      />
    </group>
  );
}

/** Duvar apliği: sıcak ikincil ışık (kanun: ≤2, pozisyonlar LOOK.light'tan). */
function Sconce({ position }: { position: readonly [number, number, number] }) {
  return (
    <group position={[position[0], position[1], position[2]]}>
      <mesh castShadow>
        <boxGeometry args={[0.14, 0.34, 0.1]} />
        <meshStandardMaterial color={LOOK.palette.brass} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.14, 0.09]}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshStandardMaterial
          color={LOOK.light.sconceColor}
          emissive={LOOK.light.sconceColor}
          emissiveIntensity={1.8}
        />
      </mesh>
      <pointLight
        position={[0, 0.16, 0.3]}
        color={LOOK.light.sconceColor}
        intensity={LOOK.light.sconce}
        distance={8}
        decay={1.9}
      />
    </group>
  );
}

/** Gökyüzü kubbesi: duvarın üstünden/yanlarından görünür. fog=false ŞART (kubbeyi sis yutmasın);
 *  toneMapped=false (asset palete boyalı gelir). Doku yoksa mesh YOK: clearColor fon görevini sürdürür. */
function BackdropSky() {
  const texture = useSlotTexture('backdrop-sky');
  if (!texture) return null;
  const r = LOOK.assets3d.backdropRadius;
  return (
    <mesh rotation={[0, Math.PI * 0.85, 0]}>
      <sphereGeometry args={[r, 48, 24, 0, Math.PI * 2, 0, Math.PI * LOOK.assets3d.backdropTheta]} />
      <meshBasicMaterial map={texture} side={BackSide} fog={false} toneMapped={false} />
    </mesh>
  );
}

const FRAME_SLOTS: ReadonlyArray<{ face: CardSlot; x: number; tilt: number }> = [
  { face: 'card-hero-archetype', x: -3.9, tilt: 0.015 },
  { face: 'card-detective-archetype', x: -1.3, tilt: -0.01 },
  { face: 'card-arcane-archetype', x: 1.3, tilt: 0.012 },
  { face: 'card-explorer-archetype', x: 3.9, tilt: -0.018 },
];

export function DioramaStage() {
  const stage = useRef<Group>(null);
  // Oda dönmez — vitrin değil atölye. Çok hafif nefes salınımı hayat verir,
  // duvar asla yan/arka yüzünü göstermez.
  useFrame(({ clock }) => {
    if (stage.current) stage.current.rotation.y = Math.sin(clock.elapsedTime * 0.08) * 0.03;
  });

  return (
    <>
      <BackdropSky />
      <group ref={stage}>
        <FloorDisc />
        <BackWall />
        {FRAME_SLOTS.map((f) => (
          <FramedPlate key={f.face} face={f.face} position={[f.x, 2.9, -4.05]} tilt={f.tilt} />
        ))}
        <LogoFrame />
        <WorkTable />
        <TableLamp />
        {LOOK.light.sconcePositions.map((p) => (
          <Sconce key={`${p[0]}`} position={p} />
        ))}

        {/* Toz partikülleri: lamba konisinde yaşar */}
        <Sparkles count={70} scale={[7, 4, 6]} position={[0, 2.0, -0.6]} size={1.5} speed={0.2} opacity={0.3} color={LOOK.palette.amber} />

        {/* Taban ışık: V3.1 kanunu — sıcak ambient, soğuk directional EMEKLİ */}
        <ambientLight intensity={LOOK.light.ambient} color={LOOK.palette.paper} />
      </group>
    </>
  );
}
```

NOT: `cylinderGeometry ... rotation` prop'u geometry'de değil mesh'te olmalı — ray mesh'ine `rotation={[0, 0, Math.PI / 2]}` ver, geometry args sade kalsın. (Implementer: yukarıdaki BackWall ray bloğunu böyle düzelt.)

- [ ] **Step 3: tsc + vitest** — `npx tsc --noEmit && npx vitest run` → 0 hata, taban düşmez.
- [ ] **Step 4: Görsel ilk bakış** — `npm run dev -- --port 5178 --strictPort` + `http://localhost:5178/?scene=force`, akvaryum moduna geç, seti gözle: duvar/çerçeveler/masa/lamba/aplikler okunuyor mu, renk sıcak mı. Ekran görüntüsü al (kesin kanıt Task 5'te).
- [ ] **Step 5: Commit** — `git add src/scene/DioramaStage.tsx src/scene/assetSlots.ts src/scene/assetSlots.test.ts && git commit -m "feat(t1): atölye seti — duvar+çerçeve rayı+merkez masa+masa lambası+2 aplik; yüzen kartlar ve sokak direği emekli"`

---

### Task 3: CAMERA_POSES yeni sete (+ ön-yarımküre kanunu)

Duvar -z'de: kamera artık arkadan dolaşamaz. Akvaryum kadraj şikâyeti (sol kart kesik, masa cılız) establish pozunun yeniden tasarımıyla çözülür.

**Files:**
- Modify: `src/scene/lookConfig.test.ts`
- Modify: `src/scene/lookConfig.ts` (CAMERA_POSES)

- [ ] **Step 1: Failing test** — lookConfig.test.ts'e:

```ts
it('kamera daima duvarın önünde (ön-yarımküre kanunu, duvar z=-4.2)', () => {
  for (const step of ALL_STEPS) {
    expect(CAMERA_POSES[step].position[2], `${step} duvar arkasına düştü`).toBeGreaterThan(0);
  }
});
```

FAIL gör (scenes z=-6.4, qa z=-5.6).

- [ ] **Step 2: Yeni pozlar** — CAMERA_POSES'u değiştir:

```ts
export const CAMERA_POSES: Record<Step, CameraPose> = {
  /* establish: zemin+duvar+masa+lamba+çerçeveler tek karede (Slenderman testi kadrajı) */
  dashboard: { position: [6.8, 3.4, 7.2], target: [0, 1.7, -1.4], fov: 34 },
  /* çerçeve duvarına yakın karar açısı: yönetmen yol seçer */
  director:  { position: [2.3, 2.5, 4.4], target: [-0.5, 2.7, -3.4], fov: 32 },
  /* masaya sol omuz: reçete = zanaat tezgâhı */
  recipe:    { position: [-5.2, 2.3, 4.6], target: [0.1, 0.95, 0.2], fov: 34 },
  /* çerçeve rayına cepheden: storyboard duvarı */
  scenes:    { position: [4.6, 2.8, 3.2], target: [0.6, 2.6, -3.9], fov: 36 },
  /* tepeden vinç: masa kuşbakışı zaman çizgisi */
  timeline:  { position: [0.3, 6.4, 7.0], target: [-0.2, 0.7, -0.2], fov: 30 },
  /* alçak sorgu açısı: lamba kadraja girer */
  qa:        { position: [-4.4, 1.9, 2.8], target: [0.9, 1.3, -0.4], fov: 33 },
};
```

- [ ] **Step 3: Tüm poz yasaları yeşil** — `npx vitest run src/scene/lookConfig.test.ts`: FOV 30-36 ✓, ardışık mesafe >2 ✓ (dashboard→director ~5.7, director→recipe ~7.5, recipe→scenes ~9.9, scenes→timeline ~5.6, timeline→qa ~6.5), ön-yarımküre ✓.
- [ ] **Step 4: Commit** — `git add src/scene/lookConfig.ts src/scene/lookConfig.test.ts && git commit -m "feat(t1): kamera koreografisi atölye setine — ön-yarımküre kanunu, akvaryum establish kadrajı yeniden"`

---

### Task 4: Stage geçiş cross-fade (1sn boş cam biter)

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: popLayout + iç Suspense** — `App.tsx`'te:

(a) `stepVariants`'ı kaydırmasız yumuşaklığa çevir (popped eski içerik sola uçmasın, yeni içerik hafif yükselsin):

```ts
const stepVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
};
```

(b) `<AnimatePresence mode="wait">` → `<AnimatePresence mode="popLayout">`.

(c) Dıştaki `<Suspense fallback={...}>`'i kaldır; her `motion.div`'in İÇİNE `<Suspense fallback={null}>` koy (yalnız gelen adım suspend eder, çıkan adım ekranda fade'lenirken yaşar). Örnek kalıp — 6 adımın hepsine aynısı:

```tsx
{currentStep === 'dashboard' && (
  <motion.div key="dashboard" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.28 }}>
    <Suspense fallback={null}><DashboardStep /></Suspense>
  </motion.div>
)}
```

- [ ] **Step 2: e2e koruma** — `npx playwright test e2e/aquarium.spec.ts e2e/scene-smoke.spec.ts` → 3/3 yeşil (navigasyon davranışı değişmedi).
- [ ] **Step 3: Canlı doğrulama** — dev server'da stage'ler arasında hızlı gez: boş bulanık cam anı YOK, eski içerik yenisi gelene dek görünür. (Kanıt karesi Task 5 proof script'inde: tıklamadan 120ms sonra ara-kare.)
- [ ] **Step 4: Commit** — `git add src/App.tsx && git commit -m "fix(t1): stage geçişi cross-fade — mode=popLayout + adım-içi Suspense, 1sn boş cam bitti"`

---

### Task 5: Slenderman testi + T1 kanıt seti (proof script)

**Files:**
- Create: `scripts/scene-proof.mjs`
- Create: `reports/t1-*.jpg` kanıtları

- [ ] **Step 1: Script** — `scripts/scene-proof.mjs`:

```js
// T1 kanıtı: ?scene=force 6 stage + akvaryum + geçiş ara-karesi + Slenderman luminance bandı.
// Çalıştır: node scripts/scene-proof.mjs   (port 5179 boş olmalı)
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const OUT = process.env.PROOF_OUT || 'output/scene-proof';
const PORT = 5179;
const URL = `http://localhost:${PORT}/?scene=force`;
const STEPS = ['dashboard', 'director', 'recipe', 'scenes', 'timeline', 'qa'];

async function luminanceOf(page, path) {
  const b64 = readFileSync(path).toString('base64');
  return page.evaluate(async (data) => {
    const img = new Image();
    img.src = `data:image/jpeg;base64,${data}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = 320; c.height = 200; // örnekleme yeter
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, 320, 200);
    const d = ctx.getImageData(0, 0, 320, 200).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    return sum / (d.length / 4) / 255;
  }, b64);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const server = spawn('npm', ['run', 'dev', '--', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  for (let i = 0; i < 30; i++) {
    try { await page.goto(URL, { timeout: 2000 }); break; } catch { await page.waitForTimeout(1000); }
  }
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(3000);

  // Akvaryum establish: Slenderman testi karesi (chrome kapalı, saf sahne)
  await page.locator('.ml-aquarium-toggle').click();
  await page.waitForTimeout(3500); // kamera otursun, doku/gölge yerleşsin
  const establishPath = `${OUT}/t1-establish-aquarium.jpg`;
  await page.screenshot({ path: establishPath, type: 'jpeg', quality: 88 });
  const lum = await luminanceOf(page, establishPath);
  console.log(`establish luminance: ${(lum * 100).toFixed(1)}%`);
  if (lum < 0.04 || lum > 0.12) {
    console.error(`✗ SLENDERMAN TESTİ: luminance %4-%12 bandı dışında (${(lum * 100).toFixed(1)}%)`);
    process.exitCode = 1;
  } else {
    console.log('✓ luminance bandı OK — görsel muayene (zemin+duvar+3 nesne) insan gözüyle yapılır');
  }
  await page.locator('.ml-aquarium-toggle').click();
  await page.waitForTimeout(800);

  // 6 stage turu
  for (const step of STEPS) {
    await page.evaluate((s) => { window.__mamilas.setState({ currentStep: s }); }, step);
    await page.waitForTimeout(2600);
    await page.screenshot({ path: `${OUT}/t1-${step}.jpg`, type: 'jpeg', quality: 82 });
    console.log(`✓ t1-${step}`);
  }

  // Geçiş ara-karesi: recipe→scenes tıklamasından 120ms sonra — boş cam OLMAMALI
  await page.evaluate(() => { window.__mamilas.setState({ currentStep: 'recipe' }); });
  await page.waitForTimeout(2200);
  await page.evaluate(() => { window.__mamilas.setState({ currentStep: 'scenes' }); });
  await page.waitForTimeout(120);
  await page.screenshot({ path: `${OUT}/t1-transition-midframe.jpg`, type: 'jpeg', quality: 82 });
  console.log('✓ t1-transition-midframe');

  await browser.close();
  server.kill();
  console.log('DONE');
}

main().catch((err) => { console.error(err); process.exit(1); });
```

- [ ] **Step 2: Koş + gözle incele** — `node scripts/scene-proof.mjs` → luminance bandı PASS + 8 kare. Fable kareleri TEK TEK açar: establish'te zemin+duvar+≥3 nesne (masa, lamba, çerçeveler) ışıkta seçiliyor mu; ara-karede eski içerik görünüyor mu; kadrajlarda kesik öğe var mı. Kusur varsa poz/ışık ince ayarı yapıp yeniden koş.
- [ ] **Step 3: Kanıtları reports'a al** — `cp output/scene-proof/t1-establish-aquarium.jpg output/scene-proof/t1-dashboard.jpg output/scene-proof/t1-transition-midframe.jpg reports/`
- [ ] **Step 4: Commit** — `git add scripts/scene-proof.mjs reports/t1-establish-aquarium.jpg reports/t1-dashboard.jpg reports/t1-transition-midframe.jpg && git commit -m "feat(t1): scene-proof script'i — Slenderman luminance bandı + geçiş ara-karesi kanıtı"`

---

### Task 6: Asset GOAL dosyası + kanun dokümanı + kapanış

**Files:**
- Create: `docs/superpowers/specs/ASSET_GOAL_T1_ATOLYE.md`
- Modify: `DESIGN_LANGUAGE_V3.md` (varsa — yoksa `docs/` altında ara: `grep -rn "V3 §8" docs/ | head`; bulunamazsa bu adımı GOAL dosyasındaki kanun özetiyle karşıla)

- [ ] **Step 1: GOAL dosyası** — M4 slot deseninde (slot adı = dosya adı, `public/assets3d/`):

```markdown
# ASSET GOAL — T1 Işıklı Atölye (Mami'ye)

Slot sistemi M4'tekiyle aynı: dosyayı `public/assets3d/<slot>.webp` olarak at, kod değişmeden bağlanır.
Eksik dosyada sahne bugünkü sıcak placeholder'ıyla yaşar (console.warn basılır, kırılmaz).

| Slot (dosya adı) | Boyut | İçerik brief'i |
|---|---|---|
| `wall-plaster.webp` | 2048², seamless | Gece atölyesi sıva/ahşap panel dokusu — sıcak kahve-bej bandı (#2a211a ailesi), hafif yaşanmışlık; keskin desen YOK (çerçeveler önde okunmalı) |
| `floor-disc.webp` | 2048², seamless | Eskimiş geniş ahşap döşeme tahtası, sıcak koyu (#1a1410 ailesi); 3×3 tile edilir |
| `table-top.webp` | 1024² | Zanaat masası üstü: çizik ahşap + hafif mürekkep lekesi; ortası nispeten sade (üstünde 3D prop var) |
| `card-*.webp` (4) | 1024×1448 | (M4'ten yaşıyor) Artık duvar çerçevelerinin yüzü — painterly arketip plate'leri |
| `logo-card.webp` | 1024×1448 | (M4'ten yaşıyor) Duvar tepe merkezindeki pirinç çerçevede amblem |
| `backdrop-sky.webp` | 2048×1024 | Duvar üstünden görünen gece göğü — çok koyu, ufukta altın-amber sızıntı |

Aplik/çerçeve kasası/ray/lamba prosedürel (pirinç + ahşap malzeme) — asset İSTEMEZ.

## V3.1 kanun özeti (bu T1 ile yürürlükte)
- Işık: altın ana (masa lambası, LOOK.light.lamp) + ≤2 sıcak aplik + ambient 0.35 sıcak. Soğuk mavi directional EMEKLİ.
- Fog 14→34 sıcak kahve; clearColor #14100b; vignette 0.32/0.68.
- Slenderman testi: establish kadrajında zemin+duvar+≥3 nesne ışıkta seçilir; luminance %4-%12 bandı (scripts/scene-proof.mjs ölçer).
- Kamera ön-yarımküre: pozlar duvar arkasına düşemez (designLaws testli).
```

- [ ] **Step 2: Kanun dokümanı** — `DESIGN_LANGUAGE_V3.md` bulunursa sonuna "## V3.1 Tadili — Işıklı Atölye (T1)" bölümü olarak aynı kanun özetini işle.
- [ ] **Step 3: Tam gate** — mamilas-gate skill: tsc 0 + vitest (taban 370 + yeni testler) + build + .command syntax + tree.
- [ ] **Step 4: Commit** — `git add docs/superpowers/specs/ASSET_GOAL_T1_ATOLYE.md <kanun dosyası> && git commit -m "docs(t1): atölye asset GOAL dosyası + V3.1 kanun tadili"`
- [ ] **Step 5: Galeri sunumu + checkpoint** — kareleri Mami'ye sun (sözlü onay olmadan T2'ye geçilmez); mamilas-checkpoint ile memory güncelle.

## Self-Review Notları
- Üst plan T1 kapsaması: yeni set (Task 2) ✓, LOOK V3.1 + designLaws (Task 1) ✓, CAMERA_POSES + akvaryum kadrajı (Task 3) ✓, cross-fade (Task 4) ✓, Slenderman kanıtı (Task 5) ✓, asset GOAL (Task 6) ✓.
- Tip tutarlılığı: `LOOK.light.{ambient,lamp,sconce,sconceColor,sconcePositions}` Task 1'de tanımlı, Task 2 aynı adları kullanır; `wallRepeat` Task 1'de tanımlı, Task 2 assetSlots'ta kullanır. `FRAME_SLOTS` yalnız Task 2'de. ✓
- Placeholder taraması: her code step gerçek kod; tek koşullu adım Task 6 Step 2 (dosya varlığı belirsiz — arama komutu verildi, yoksa karşılama tanımlı). ✓
- Riskler: popLayout + Suspense etkileşimi (Task 4 Step 2-3 e2e+canlı doğrular); gölge bütçesi (lamba tek castShadow point — eski kurulumla aynı sınıf); luminance bandı ilk koşuda tutmayabilir → Task 5 Step 2 ince ayar döngüsü açık bırakıldı.
