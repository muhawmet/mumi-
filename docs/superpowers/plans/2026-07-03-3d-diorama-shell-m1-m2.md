# 3D Diorama Kabuğu — M1+M2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** MAMILAS'a kalıcı bir R3F 3D diorama katmanı (M1) ve Disco Elysium tarzı ünlem/thought-bubble sistemi (M2) eklemek; beyin koduna sıfır dokunuş.

**Architecture:** Uygulama kökünde `pointer-events: none` bir fixed katmanda tek `<Canvas>` yaşar (WebGL yoksa hiç mount olmaz, mevcut 2D `AntigravityBackground` fallback kalır). `CameraRig` store'daki `currentStep`'i dinleyip kamerayı `lookConfig`'teki poza damp'ler. M2'de sabit `InnerVoicePanel` render'ları kaldırılır; `ThoughtDock` mevcut `evaluateInnerVoices()`'i step-context ile kendisi çağırır, tonlara göre otomatik açılan toast / bekleyen ünlem rozeti / geçmiş çekmecesi üretir.

**Tech Stack:** React 19, Vite 8, zustand 5, three + @react-three/fiber 9 + drei + postprocessing, vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-07-03-3d-diorama-shell-design.md` (bu plan M1+M2'yi kapsar; M3/M4 ve M5 ayrı plan dosyaları alacak).

**Parallel lanes:** Task 1 herkesten önce. Sonra Lane A (Task 2→3→4→5→6, sahne) ile Lane B (Task 7→8, thought mantığı+UI) paralel koşabilir. Task 9-10 iki lane'i birleştirir.

---

### Task 1: Bağımlılıklar + lookConfig (tek görsel otorite)

**Files:**
- Modify: `package.json` (npm install ile)
- Create: `src/scene/lookConfig.ts`
- Test: `src/scene/lookConfig.test.ts`

- [ ] **Step 1: Paketleri kur**

```bash
cd /Users/Muhammet/Desktop/mamilas-modern
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing
```

Expected: package.json dependencies'e 4 paket eklenir, `npm install` hatasız biter. (three kendi TS tiplerini taşır, @types/three gerekmez.)

- [ ] **Step 2: Failing test yaz**

`src/scene/lookConfig.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { CAMERA_POSES, LOOK, cameraPoseFor } from './lookConfig';

const ALL_STEPS = ['dashboard', 'director', 'recipe', 'scenes', 'timeline', 'qa'] as const;

describe('lookConfig', () => {
  it('her step için tanımlı bir kamera pozu var', () => {
    for (const step of ALL_STEPS) {
      const pose = CAMERA_POSES[step];
      expect(pose, `${step} pozu eksik`).toBeDefined();
      expect(pose.position).toHaveLength(3);
      expect(pose.target).toHaveLength(3);
      expect(pose.fov).toBeGreaterThan(10);
      expect(pose.fov).toBeLessThan(90);
    }
  });

  it('cameraPoseFor bilinmeyen step için dashboard pozuna düşer', () => {
    expect(cameraPoseFor('yok-boyle-step' as never)).toEqual(CAMERA_POSES.dashboard);
  });

  it('efekt şiddetleri DE bandında (abartı yok)', () => {
    expect(LOOK.bloom.intensity).toBeLessThanOrEqual(0.6);
    expect(LOOK.grain.opacity).toBeLessThanOrEqual(0.25);
    expect(LOOK.chromaticAberration.offset).toBeLessThanOrEqual(0.003);
  });
});
```

- [ ] **Step 3: Testin FAIL ettiğini gör**

Run: `npx vitest run src/scene/lookConfig.test.ts`
Expected: FAIL — "Cannot find module './lookConfig'"

- [ ] **Step 4: lookConfig.ts yaz**

`src/scene/lookConfig.ts`:

```ts
import type { Step } from '../store/useStudioStore';

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

/** Tek kamera otoritesi: her stage'in dioramaya bakış açısı. */
export const CAMERA_POSES: Record<Step, CameraPose> = {
  dashboard: { position: [6.5, 4.2, 8.5], target: [0, 1.1, 0], fov: 34 },
  director:  { position: [3.6, 2.6, 7.2], target: [0.6, 1.2, 0], fov: 32 },
  recipe:    { position: [-5.4, 3.2, 6.4], target: [-0.4, 1.0, 0], fov: 34 },
  scenes:    { position: [5.2, 2.2, -6.6], target: [0, 1.2, 0.4], fov: 36 },
  timeline:  { position: [0.4, 5.6, 9.4], target: [0, 0.8, 0], fov: 30 },
  qa:        { position: [-6.2, 4.4, -5.2], target: [0, 1.4, 0], fov: 33 },
};

/** DE "yağlıboya karanlığı" ayarları — şiddet buradan döner, komponentlerden değil. */
export const LOOK = {
  fog: { color: '#0b0a08', near: 9, far: 26 },
  clearColor: '#080705',
  bloom: { intensity: 0.35, luminanceThreshold: 0.72, luminanceSmoothing: 0.2 },
  vignette: { offset: 0.28, darkness: 0.82 },
  grain: { opacity: 0.16 },
  chromaticAberration: { offset: 0.0012 },
  cameraDamp: 2.2, // saniyedeki yaklaşma katsayısı (THREE.MathUtils.damp lambda)
  palette: {
    gold: '#f7c948',
    amber: '#d6a84f',
    paper: '#e8ddc8',
    ink: '#0a0c14',
    floor: '#141210',
  },
} as const;

export function cameraPoseFor(step: Step): CameraPose {
  return CAMERA_POSES[step] ?? CAMERA_POSES.dashboard;
}
```

- [ ] **Step 5: Testin PASS ettiğini gör**

Run: `npx vitest run src/scene/lookConfig.test.ts`
Expected: 3 test PASS

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/scene/lookConfig.ts src/scene/lookConfig.test.ts
git commit -m "feat(scene): R3F bağımlılıkları + lookConfig tek görsel otorite"
```

---

### Task 2: SceneLayer — WebGL korumalı kalıcı canvas katmanı

**Files:**
- Create: `src/scene/SceneLayer.tsx`
- Create: `src/scene/SceneCanvas.tsx`
- Test: `src/scene/webglSupport.test.ts`
- Create: `src/scene/webglSupport.ts`

- [ ] **Step 1: Failing test yaz (WebGL guard saf mantığı)**

`src/scene/webglSupport.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { detectWebGL } from './webglSupport';

describe('detectWebGL', () => {
  it('getContext webgl2 dönerse true', () => {
    const fake = { getContext: (kind: string) => (kind === 'webgl2' ? {} : null) };
    expect(detectWebGL(() => fake as unknown as HTMLCanvasElement)).toBe(true);
  });

  it('hiçbir context yoksa false', () => {
    const fake = { getContext: () => null };
    expect(detectWebGL(() => fake as unknown as HTMLCanvasElement)).toBe(false);
  });

  it('getContext fırlatırsa false (crash yok)', () => {
    const fake = { getContext: () => { throw new Error('boom'); } };
    expect(detectWebGL(() => fake as unknown as HTMLCanvasElement)).toBe(false);
  });
});
```

- [ ] **Step 2: FAIL gör**

Run: `npx vitest run src/scene/webglSupport.test.ts`
Expected: FAIL — module bulunamaz

- [ ] **Step 3: webglSupport.ts yaz**

`src/scene/webglSupport.ts`:

```ts
export function detectWebGL(
  createCanvas: () => HTMLCanvasElement = () => document.createElement('canvas'),
): boolean {
  try {
    const canvas = createCanvas();
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: PASS gör**

Run: `npx vitest run src/scene/webglSupport.test.ts`
Expected: 3 test PASS

- [ ] **Step 5: SceneCanvas.tsx yaz (Canvas içi dünya — lazy chunk'ın gövdesi)**

`src/scene/SceneCanvas.tsx`:

```tsx
import { Canvas } from '@react-three/fiber';
import { LOOK } from './lookConfig';
import { DioramaStage } from './DioramaStage';
import { CameraRig } from './CameraRig';
import { PostFX } from './PostFX';

interface SceneCanvasProps {
  onContextLost: () => void;
}

export default function SceneCanvas({ onContextLost }: SceneCanvasProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [6.5, 4.2, 8.5], fov: 34, near: 0.1, far: 60 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.setClearColor(LOOK.clearColor);
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          console.warn('[scene] WebGL context kaybedildi — 2D fallback aktif.');
          onContextLost();
        });
      }}
    >
      <fog attach="fog" args={[LOOK.fog.color, LOOK.fog.near, LOOK.fog.far]} />
      <CameraRig />
      <DioramaStage />
      <PostFX />
    </Canvas>
  );
}
```

Not: Bu dosya Task 3-5 bitmeden derlenmez (DioramaStage/CameraRig/PostFX importları). Task 2-5 aynı dalda ardışık ilerler; ara commit yalnız Step 4'e kadar olan kısımla yapılır.

- [ ] **Step 6: SceneLayer.tsx yaz (mount kapısı)**

`src/scene/SceneLayer.tsx`:

```tsx
import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { detectWebGL } from './webglSupport';

const SceneCanvas = lazy(() => import('./SceneCanvas'));

/**
 * Kalıcı 3D katman. WebGL yoksa hiç mount olmaz — uygulama bugünkü
 * 2D haliyle tam işlevsel kalır (spec: Final Brief asla 3D'ye rehin olmaz).
 */
export const SceneLayer: React.FC = () => {
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    setWebgl(detectWebGL());
  }, []);

  const handleContextLost = useCallback(() => setWebgl(false), []);

  if (!webgl) return null;

  return (
    <div
      data-testid="scene-layer"
      aria-hidden
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    >
      <Suspense fallback={null}>
        <SceneCanvas onContextLost={handleContextLost} />
      </Suspense>
    </div>
  );
};
```

- [ ] **Step 7: Commit (guard + katman iskeleti)**

```bash
git add src/scene/webglSupport.ts src/scene/webglSupport.test.ts src/scene/SceneLayer.tsx src/scene/SceneCanvas.tsx
git commit -m "feat(scene): SceneLayer — WebGL korumalı kalıcı canvas katmanı"
```

---

### Task 3: DioramaStage — prosedürel placeholder diorama

**Files:**
- Create: `src/scene/DioramaStage.tsx`

- [ ] **Step 1: DioramaStage.tsx yaz**

`src/scene/DioramaStage.tsx`:

```tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import type { Group } from 'three';
import { LOOK } from './lookConfig';

/** Yüzen kart: painterly doku slotu M4'te dolacak; şimdilik altın-kağıt malzeme. */
function FloatingCard({ position, rotationY, phase }: {
  position: [number, number, number];
  rotationY: number;
  phase: number;
}) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.6 + phase) * 0.12;
    ref.current.rotation.y = rotationY + Math.sin(clock.elapsedTime * 0.25 + phase) * 0.06;
  });
  return (
    <group ref={ref} position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.1, 1.55, 0.03]} />
        <meshStandardMaterial color={LOOK.palette.paper} roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[0.94, 1.38]} />
        <meshStandardMaterial color={LOOK.palette.ink} roughness={1} />
      </mesh>
    </group>
  );
}

/** Işık direği: DE sahne lambası hissi — tek sıcak nokta ışığı. */
function LampPost() {
  return (
    <group position={[2.2, 0, -1.4]}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 3.2, 8]} />
        <meshStandardMaterial color="#1c1915" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, 3.3, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial
          color={LOOK.palette.gold}
          emissive={LOOK.palette.gold}
          emissiveIntensity={2.2}
        />
      </mesh>
      <pointLight position={[0, 3.3, 0]} color={LOOK.palette.gold} intensity={14} distance={12} decay={2} castShadow />
    </group>
  );
}

export function DioramaStage() {
  const stage = useRef<Group>(null);
  // Diorama çok yavaş döner — "vitrin" hissi. Kamera otoritesi CameraRig'te kalır.
  useFrame((_, delta) => {
    if (stage.current) stage.current.rotation.y += delta * 0.02;
  });

  return (
    <group ref={stage}>
      {/* Zemin diski */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color={LOOK.palette.floor} roughness={0.95} />
      </mesh>

      {/* Stüdyo masası */}
      <group position={[-0.6, 0, 0.4]}>
        <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.09, 1.3]} />
          <meshStandardMaterial color="#2a241c" roughness={0.7} />
        </mesh>
        {([[-1.05, -0.5], [1.05, -0.5], [-1.05, 0.5], [1.05, 0.5]] as const).map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x, 0.37, z]} castShadow>
            <boxGeometry args={[0.08, 0.74, 0.08]} />
            <meshStandardMaterial color="#1c1915" roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Yüzen referans kartları — Phase-0 card fan'ın 3D karşılığı */}
      <FloatingCard position={[-2.6, 1.9, -0.8]} rotationY={0.5} phase={0} />
      <FloatingCard position={[-1.4, 2.3, -1.8]} rotationY={0.2} phase={2.1} />
      <FloatingCard position={[0.2, 2.0, -2.4]} rotationY={-0.15} phase={4.2} />
      <FloatingCard position={[1.8, 2.4, -2.0]} rotationY={-0.45} phase={1.3} />

      <LampPost />

      {/* Toz partikülleri */}
      <Sparkles count={90} scale={[10, 5, 10]} position={[0, 2.2, 0]} size={1.6} speed={0.25} opacity={0.35} color={LOOK.palette.amber} />

      {/* Taban ışıklar */}
      <ambientLight intensity={0.22} color={LOOK.palette.paper} />
      <directionalLight position={[-6, 8, 4]} intensity={0.5} color="#8fa3c2" castShadow />
    </group>
  );
}
```

- [ ] **Step 2: Derleme kontrolü**

Run: `npx tsc --noEmit`
Expected: DioramaStage kaynaklı hata yok. (SceneCanvas henüz CameraRig/PostFX bulamadığı için hata verirse normaldir — o hatalar Task 4-5'te kapanacak; bu adımda yalnız DioramaStage.tsx'e ait hata olmamasına bak.)

- [ ] **Step 3: Commit**

```bash
git add src/scene/DioramaStage.tsx
git commit -m "feat(scene): prosedürel placeholder diorama — masa, kart fan, lamba, toz"
```

---

### Task 4: CameraRig — stage'e bağlı kamera koreografisi

**Files:**
- Create: `src/scene/CameraRig.tsx`

- [ ] **Step 1: CameraRig.tsx yaz**

`src/scene/CameraRig.tsx`:

```tsx
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import { useStudioStore } from '../store/useStudioStore';
import { LOOK, cameraPoseFor } from './lookConfig';

/**
 * Tek kamera otoritesi. Store'daki currentStep'i izler, kamerayı
 * lookConfig'teki poza yumuşakça damp'ler. Başka hiçbir birim kamerayı oynatmaz.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const currentStep = useStudioStore((s) => s.currentStep);
  const targetRef = useRef(new Vector3(0, 1.1, 0));

  useFrame((_, delta) => {
    const pose = cameraPoseFor(currentStep);
    const lambda = LOOK.cameraDamp;

    camera.position.x = MathUtils.damp(camera.position.x, pose.position[0], lambda, delta);
    camera.position.y = MathUtils.damp(camera.position.y, pose.position[1], lambda, delta);
    camera.position.z = MathUtils.damp(camera.position.z, pose.position[2], lambda, delta);

    const t = targetRef.current;
    t.x = MathUtils.damp(t.x, pose.target[0], lambda, delta);
    t.y = MathUtils.damp(t.y, pose.target[1], lambda, delta);
    t.z = MathUtils.damp(t.z, pose.target[2], lambda, delta);
    camera.lookAt(t);

    camera.fov = MathUtils.damp(camera.fov, pose.fov, lambda, delta);
    camera.updateProjectionMatrix();
  });

  return null;
}
```

- [ ] **Step 2: Derleme kontrolü**

Run: `npx tsc --noEmit`
Expected: CameraRig kaynaklı hata yok.

- [ ] **Step 3: Commit**

```bash
git add src/scene/CameraRig.tsx
git commit -m "feat(scene): CameraRig — currentStep'e damp'li kamera koreografisi"
```

---

### Task 5: PostFX + AppLayout entegrasyonu (M1 kapanışı)

**Files:**
- Create: `src/scene/PostFX.tsx`
- Modify: `src/components/Layout/AppLayout.tsx:46-50` (SceneLayer mount)

- [ ] **Step 1: PostFX.tsx yaz**

`src/scene/PostFX.tsx`:

```tsx
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { LOOK } from './lookConfig';

/** DE yağlıboya karanlığı: hafif altın bloom + vignette + grain + çok hafif CA. */
export function PostFX() {
  return (
    <EffectComposer>
      <Bloom
        intensity={LOOK.bloom.intensity}
        luminanceThreshold={LOOK.bloom.luminanceThreshold}
        luminanceSmoothing={LOOK.bloom.luminanceSmoothing}
        mipmapBlur
      />
      <ChromaticAberration offset={[LOOK.chromaticAberration.offset, LOOK.chromaticAberration.offset]} />
      <Noise opacity={LOOK.grain.opacity} />
      <Vignette offset={LOOK.vignette.offset} darkness={LOOK.vignette.darkness} />
    </EffectComposer>
  );
}
```

- [ ] **Step 2: AppLayout'a SceneLayer'ı tak**

`src/components/Layout/AppLayout.tsx` — import bloğuna ekle:

```tsx
import { SceneLayer } from '../../scene/SceneLayer';
```

ve render'da `<AntigravityBackground />` satırının hemen ALTINA ekle (AntigravityBackground 2D fallback olarak kalır; WebGL varken SceneLayer onu görsel olarak örter):

```tsx
      <AntigravityBackground />
      <SceneLayer />
```

- [ ] **Step 3: Tam derleme + test + build**

Run: `npx tsc --noEmit && npx vitest run && npm run build`
Expected: hepsi PASS/success. (SceneCanvas'ın tüm importları artık mevcut.)

- [ ] **Step 4: Gözle doğrula**

Run: `npm run dev` (arka planda) sonra Playwright ile screenshot al:

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:5173/?scene=force', { waitUntil: 'networkidle' }); // headless'ta yazılımsal-GL fallback'i aşmak için force
  await p.waitForTimeout(2500);
  const hasScene = await p.getByTestId('scene-layer').count();
  console.log('scene-layer mounted:', hasScene === 1);
  await p.screenshot({ path: 'reports/m1-scene-proof.png' });
  await b.close();
})();
"
```

Expected: `scene-layer mounted: true`; screenshot'ta arka planda diorama (masa, kartlar, altın lamba, toz) görünür, UI panelleri üstte okunur durumda. **Screenshot'ı Read ile aç ve gözle bak** — boş/siyah sahne başarısızlıktır.

- [ ] **Step 5: Commit (M1 tamam)**

```bash
git add src/scene/PostFX.tsx src/components/Layout/AppLayout.tsx reports/m1-scene-proof.png
git commit -m "feat(scene): PostFX zinciri + AppLayout mount — M1 sahne iskeleti tamam"
```

---

### Task 6: M1 e2e smoke

**Files:**
- Create: `e2e/scene-smoke.spec.ts`

- [ ] **Step 1: Smoke testi yaz**

`e2e/scene-smoke.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('3D katman mount olur ve uygulama kullanılabilir kalır', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('scene-layer')).toHaveCount(1);
  // 3D katman tıklamaları yutmamalı: sidebar'dan Reçete'ye geçilebilmeli
  await page.getByRole('button', { name: /Reçete/ }).click();
  await expect(page.getByText('CABINET READ')).toBeVisible();
});
```

Not: Bu test Task 9'dan sonra 'CABINET READ' metni kalkacağı için orada güncellenecek (Task 9 Step 4'te bu satır `thought-badge` beklentisine dönüşür). Bilinçli sıralama.

- [ ] **Step 2: Çalıştır**

Run: `npx playwright test e2e/scene-smoke.spec.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add e2e/scene-smoke.spec.ts
git commit -m "test(e2e): 3D katman smoke — mount + tıklama geçirgenliği"
```

---

### Task 7: thoughtQueue — ünlem sisteminin saf beyni (TDD)

**Files:**
- Create: `src/components/ThoughtBubble/thoughtQueue.ts`
- Test: `src/components/ThoughtBubble/thoughtQueue.test.ts`

Davranış sözleşmesi (spec'ten): `fail` → toast kendiliğinden açılır; `warn`/`spark` → ünlem rozetinde bekler; `info`/`pass` → yalnız geçmişe yazılır. Aynı düşünce (voice+title+evidence) tekrar tetiklenirse yeniden patlamaz.

- [ ] **Step 1: Failing testleri yaz**

`src/components/ThoughtBubble/thoughtQueue.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { InnerVoiceVerdict } from '../innerVoices';
import { behaviorFor, mergeThoughts, thoughtKey } from './thoughtQueue';

const v = (tone: InnerVoiceVerdict['tone'], title = 'Başlık'): InnerVoiceVerdict => ({
  voice: 'Logic', tone, title, text: 'metin', evidence: 'kanıt',
});

describe('behaviorFor', () => {
  it('fail otomatik açılır', () => expect(behaviorFor('fail')).toBe('auto-open'));
  it('warn ve spark rozette bekler', () => {
    expect(behaviorFor('warn')).toBe('badge');
    expect(behaviorFor('spark')).toBe('badge');
  });
  it('info ve pass sessizce geçmişe yazılır', () => {
    expect(behaviorFor('info')).toBe('silent');
    expect(behaviorFor('pass')).toBe('silent');
  });
});

describe('mergeThoughts', () => {
  it('yeni verdict düşünce olarak eklenir', () => {
    const merged = mergeThoughts([], [v('fail')], 1000);
    expect(merged).toHaveLength(1);
    expect(merged[0].behavior).toBe('auto-open');
    expect(merged[0].seenAt).toBe(1000);
    expect(merged[0].dismissed).toBe(false);
  });

  it('aynı key ikinci turda yeniden patlamaz (seenAt ve dismissed korunur)', () => {
    const first = mergeThoughts([], [v('fail')], 1000);
    const dismissed = first.map((t) => ({ ...t, dismissed: true }));
    const second = mergeThoughts(dismissed, [v('fail')], 2000);
    expect(second).toHaveLength(1);
    expect(second[0].seenAt).toBe(1000);
    expect(second[0].dismissed).toBe(true);
  });

  it('verdict listeden düşünce kaybolunca düşünce de düşer', () => {
    const first = mergeThoughts([], [v('fail', 'A'), v('warn', 'B')], 1000);
    const second = mergeThoughts(first, [v('warn', 'B')], 2000);
    expect(second).toHaveLength(1);
    expect(second[0].title).toBe('B');
  });

  it('key voice+title+evidence üçlüsünden üretilir', () => {
    expect(thoughtKey(v('fail', 'X'))).toBe('Logic|X|kanıt');
  });
});
```

- [ ] **Step 2: FAIL gör**

Run: `npx vitest run src/components/ThoughtBubble/thoughtQueue.test.ts`
Expected: FAIL — module bulunamaz

- [ ] **Step 3: thoughtQueue.ts yaz**

`src/components/ThoughtBubble/thoughtQueue.ts`:

```ts
import type { InnerVoiceTone, InnerVoiceVerdict } from '../innerVoices';

export type ThoughtBehavior = 'auto-open' | 'badge' | 'silent';

export interface Thought extends InnerVoiceVerdict {
  key: string;
  behavior: ThoughtBehavior;
  seenAt: number;
  dismissed: boolean;
}

export function behaviorFor(tone: InnerVoiceTone): ThoughtBehavior {
  if (tone === 'fail') return 'auto-open';
  if (tone === 'warn' || tone === 'spark') return 'badge';
  return 'silent';
}

export function thoughtKey(verdict: InnerVoiceVerdict): string {
  return `${verdict.voice}|${verdict.title}|${verdict.evidence}`;
}

/**
 * Mevcut düşünce listesiyle yeni verdict'leri birleştirir.
 * Bilinen key'ler kimliklerini (seenAt, dismissed) korur — yeniden patlama olmaz.
 * Verdict listesinden düşenler listeden çıkar (durum düzeldi demektir).
 */
export function mergeThoughts(
  previous: Thought[],
  verdicts: InnerVoiceVerdict[],
  now: number,
): Thought[] {
  const known = new Map(previous.map((t) => [t.key, t]));
  return verdicts.map((verdict) => {
    const key = thoughtKey(verdict);
    const existing = known.get(key);
    if (existing) return { ...existing, ...verdict, key };
    return { ...verdict, key, behavior: behaviorFor(verdict.tone), seenAt: now, dismissed: false };
  });
}
```

- [ ] **Step 4: PASS gör**

Run: `npx vitest run src/components/ThoughtBubble/thoughtQueue.test.ts`
Expected: tüm testler PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ThoughtBubble/thoughtQueue.ts src/components/ThoughtBubble/thoughtQueue.test.ts
git commit -m "feat(thoughts): thoughtQueue saf mantık — ton→davranış, dedup, merge"
```

---

### Task 8: ThoughtDock UI — rozet, toast (daktilo), geçmiş çekmecesi

**Files:**
- Create: `src/components/ThoughtBubble/voicePortraits.ts` (InnerVoicePanel'den çıkarılan ortak eşleme)
- Create: `src/components/ThoughtBubble/useTypewriter.ts`
- Create: `src/components/ThoughtBubble/ThoughtDock.tsx`
- Modify: `src/components/InnerVoicePanel.tsx:28-37` (VOICE_PORTRAIT'i ortak dosyadan import et)
- Modify: `src/styles/design_v3.css` (dosya sonuna .thought-* blokları)

- [ ] **Step 1: voicePortraits.ts — ortak portre eşlemesi (DRY)**

`src/components/ThoughtBubble/voicePortraits.ts`:

```ts
import type { InnerVoiceVerdict } from '../innerVoices';

export const VOICE_PORTRAIT: Partial<Record<InnerVoiceVerdict['voice'], { id: string; fallback: string }>> = {
  Volition: { id: 'skill_volition', fallback: 'volition' },
  Perception: { id: 'skill_perception', fallback: 'visual_calculus' },
  Shivers: { id: 'skill_shivers', fallback: 'inland_empire' },
  Logic: { id: 'skill_logic', fallback: 'encyclopedia' },
  'Visual Calculus': { id: 'skill_visual_calculus', fallback: 'visual_calculus' },
  Drama: { id: 'skill_drama', fallback: 'drama' },
  'Case Ledger': { id: 'skill_case_ledger', fallback: 'case_ledger' },
};

export const FALLBACK_PORTRAIT = { id: 'skill_case_ledger', fallback: 'case_ledger' };

export const TONE_COLOR: Record<InnerVoiceVerdict['tone'], string> = {
  pass: '#93c9a8',
  warn: '#d6a84f',
  fail: '#f26d6d',
  info: '#9c9588',
  spark: '#8fa3c2',
};

export const TONE_LABEL: Record<InnerVoiceVerdict['tone'], string> = {
  pass: 'PASS',
  warn: 'FIX',
  fail: 'FAIL',
  info: 'READ',
  spark: 'WILD',
};
```

`src/components/InnerVoicePanel.tsx` içindeki yerel `TONE_COLOR`, `TONE_LABEL`, `VOICE_PORTRAIT` tanımlarını sil, yerine:

```tsx
import { FALLBACK_PORTRAIT, TONE_COLOR, TONE_LABEL, VOICE_PORTRAIT } from './ThoughtBubble/voicePortraits';
```

ve gövdedeki `|| { id: 'skill_case_ledger', fallback: 'case_ledger' }` ifadesini `|| FALLBACK_PORTRAIT` yap.

- [ ] **Step 2: useTypewriter hook**

`src/components/ThoughtBubble/useTypewriter.ts`:

```ts
import { useEffect, useState } from 'react';

/** Metni karakter karakter açar. cps = saniyedeki karakter. */
export function useTypewriter(text: string, cps = 45): string {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    if (!text) return;
    const interval = window.setInterval(() => {
      setCount((current) => {
        if (current >= text.length) {
          window.clearInterval(interval);
          return current;
        }
        return current + 1;
      });
    }, 1000 / cps);
    return () => window.clearInterval(interval);
  }, [text, cps]);

  return text.slice(0, count);
}
```

- [ ] **Step 3: ThoughtDock.tsx**

`src/components/ThoughtBubble/ThoughtDock.tsx`:

```tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useStudioStore, type Step } from '../../store/useStudioStore';
import { evaluateInnerVoices } from '../innerVoices';
import { AdvisorPortrait } from '../AdvisorPortrait';
import { InnerVoicePanel } from '../InnerVoicePanel';
import { FALLBACK_PORTRAIT, TONE_COLOR, TONE_LABEL, VOICE_PORTRAIT } from './voicePortraits';
import { mergeThoughts, type Thought } from './thoughtQueue';
import { useTypewriter } from './useTypewriter';

const CONTEXT_FOR_STEP: Record<Step, Parameters<typeof evaluateInnerVoices>[1]> = {
  dashboard: 'dashboard',
  director: 'director',
  recipe: 'recipe',
  scenes: 'scenes',
  timeline: 'timeline',
  qa: 'qa',
};

const AUTO_DISMISS_MS = 9000;

function ThoughtToast({ thought, onDismiss }: { thought: Thought; onDismiss: (key: string) => void }) {
  const typed = useTypewriter(thought.text);
  const color = TONE_COLOR[thought.tone];
  const portrait = VOICE_PORTRAIT[thought.voice] || FALLBACK_PORTRAIT;

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(thought.key), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [thought.key, onDismiss]);

  return (
    <motion.article
      data-testid="thought-toast"
      className="thought-toast"
      style={{ borderColor: `${color}66` }}
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    >
      <div className="thought-toast-portrait">
        <AdvisorPortrait id={portrait.id} fallbackSpriteId={portrait.fallback} width={52} height={52} />
      </div>
      <div className="thought-toast-copy">
        <div className="thought-toast-row">
          <span className="thought-toast-voice" style={{ color }}>{thought.voice}</span>
          <span className="thought-toast-tone" style={{ color, background: `${color}18` }}>
            {TONE_LABEL[thought.tone]}
          </span>
        </div>
        <strong>{thought.title}</strong>
        <p>{typed}<span className="thought-caret" aria-hidden>▎</span></p>
      </div>
      <button type="button" className="thought-toast-close" aria-label="Kapat" onClick={() => onDismiss(thought.key)}>×</button>
    </motion.article>
  );
}

export const ThoughtDock: React.FC = () => {
  const state = useStudioStore(
    useShallow((s) => ({
      projectTopic: s.projectTopic, subject: s.subject, rawSource: s.rawSource,
      sourceReport: s.sourceReport, selectedWorldId: s.selectedWorldId,
      selectedPaletteId: s.selectedPaletteId, selectedRefIds: s.selectedRefIds,
      activePreviewRefId: s.activePreviewRefId, selectedPropId: s.selectedPropId,
      projectClass: s.projectClass, sceneCount: s.sceneCount,
      recipeScenes: s.recipeScenes, scenes: s.scenes,
      agentBrief: s.agentBrief, agentPackets: s.agentPackets,
    })),
  );
  const currentStep = useStudioStore((s) => s.currentStep);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const thoughtsRef = useRef(thoughts);
  thoughtsRef.current = thoughts;

  const verdicts = useMemo(
    () => evaluateInnerVoices(state, CONTEXT_FOR_STEP[currentStep]),
    [state, currentStep],
  );

  useEffect(() => {
    setThoughts(mergeThoughts(thoughtsRef.current, verdicts, Date.now()));
  }, [verdicts]);

  const dismiss = React.useCallback((key: string) => {
    setThoughts((current) => current.map((t) => (t.key === key ? { ...t, dismissed: true } : t)));
  }, []);

  const openToasts = thoughts.filter((t) => t.behavior === 'auto-open' && !t.dismissed).slice(0, 2);
  const badgeCount = thoughts.filter((t) => t.behavior === 'badge' && !t.dismissed).length;

  return (
    <>
      <div className="thought-dock" data-testid="thought-dock">
        <AnimatePresence>
          {openToasts.map((t) => <ThoughtToast key={t.key} thought={t} onDismiss={dismiss} />)}
        </AnimatePresence>

        {badgeCount > 0 && (
          <motion.button
            type="button"
            data-testid="thought-badge"
            className="thought-badge"
            onClick={() => setDrawerOpen(true)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
          >
            <span className="thought-badge-mark">!</span>
            <span className="thought-badge-count">{badgeCount}</span>
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <motion.aside
            className="thought-drawer"
            data-testid="thought-drawer"
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <header className="thought-drawer-head">
              <span>DÜŞÜNCE GEÇMİŞİ</span>
              <button type="button" aria-label="Çekmeceyi kapat" onClick={() => setDrawerOpen(false)}>×</button>
            </header>
            <InnerVoicePanel title="THOUGHT CABINET" subtitle="tüm okumalar" voices={thoughts} compact />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
```

- [ ] **Step 4: CSS ekle**

`src/styles/design_v3.css` dosyasının SONUNA ekle:

```css
/* ── Thought dock: DE ünlem sistemi ─────────────────────── */
.thought-dock {
  position: fixed;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: none;
}
.thought-dock > * { pointer-events: auto; }
.thought-toast {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  width: min(520px, calc(100vw - 48px));
  padding: 14px 16px;
  border: 1px solid;
  border-radius: 12px;
  background: color-mix(in srgb, var(--m2-ink, #0a0c14) 88%, transparent);
  backdrop-filter: blur(14px);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.5);
}
.thought-toast-copy { flex: 1; min-width: 0; }
.thought-toast-copy p { margin: 4px 0 0; font-size: 12.5px; line-height: 1.55; color: var(--m2-muted); }
.thought-toast-copy strong { font-size: 13px; color: var(--m2-paper); }
.thought-toast-row { display: flex; gap: 8px; align-items: center; margin-bottom: 2px; }
.thought-toast-voice { font-family: var(--m2-font-mono); font-size: 10px; font-weight: 800; letter-spacing: 1.6px; text-transform: uppercase; }
.thought-toast-tone { font-family: var(--m2-font-mono); font-size: 9px; font-weight: 800; letter-spacing: 1.2px; padding: 2px 7px; border-radius: 4px; }
.thought-toast-close { background: none; border: none; color: var(--m2-muted); font-size: 16px; cursor: pointer; line-height: 1; padding: 2px 4px; }
.thought-caret { animation: thought-blink 0.9s steps(2) infinite; color: var(--m2-gold, #f7c948); }
@keyframes thought-blink { 50% { opacity: 0; } }
.thought-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(247, 201, 72, 0.45);
  background: rgba(247, 201, 72, 0.1);
  color: var(--m2-gold, #f7c948);
  font-family: var(--m2-font-mono);
  font-weight: 800;
  cursor: pointer;
}
.thought-badge-mark { font-size: 15px; }
.thought-badge-count { font-size: 11px; letter-spacing: 1px; }
.thought-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 360px;
  z-index: 50;
  padding: 20px 16px;
  overflow-y: auto;
  background: color-mix(in srgb, var(--m2-ink, #0a0c14) 94%, transparent);
  border-left: 1px solid rgba(247, 201, 72, 0.18);
  backdrop-filter: blur(18px);
}
.thought-drawer-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  font-family: var(--m2-font-mono);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.8px;
  color: var(--m2-muted);
}
.thought-drawer-head button { background: none; border: none; color: var(--m2-muted); font-size: 18px; cursor: pointer; }
```

Not: `--m2-ink`, `--m2-gold` değişkenleri design_v3.css'te farklı adlarla tanımlıysa (dosyanın başındaki :root bloğuna bak) mevcut adları kullan; fallback değerler zaten inline.

- [ ] **Step 5: Derleme + test**

Run: `npx tsc --noEmit && npx vitest run`
Expected: PASS. (ThoughtDock henüz hiçbir yerde render edilmiyor — bilerek; Task 9'da bağlanacak.)

- [ ] **Step 6: Commit**

```bash
git add src/components/ThoughtBubble/ src/components/InnerVoicePanel.tsx src/styles/design_v3.css
git commit -m "feat(thoughts): ThoughtDock — rozet, daktilo toast, geçmiş çekmecesi"
```

---

### Task 9: Sabit panelleri sök, ThoughtDock'u bağla

**Files:**
- Modify: `src/components/Layout/AppLayout.tsx` (ThoughtDock mount)
- Modify: `src/components/RecipeRail.tsx:6,63` (InnerVoicePanel kaldır)
- Modify: `src/pages/Dashboard/DashboardStep.tsx:10,74`
- Modify: `src/pages/Director/DirectorStep.tsx:15,521`
- Modify: `src/pages/Recipe/RecipeStep.tsx:12,240`
- Modify: `src/pages/Scenes/ScenesStep.tsx:6,71,96`
- Modify: `src/pages/Timeline/TimelineStep.tsx:14,177`
- Modify: `src/pages/QA/QAStep.tsx:9,279`
- Modify: `e2e/scene-smoke.spec.ts` (CABINET READ beklentisi güncelle)

- [ ] **Step 1: ThoughtDock'u AppLayout'a mount et**

`src/components/Layout/AppLayout.tsx` import bloğuna:

```tsx
import { ThoughtDock } from '../ThoughtBubble/ThoughtDock';
```

Render'da kapanış `</div>`'den hemen önce (aside'dan sonra):

```tsx
      <ThoughtDock />
    </div>
```

- [ ] **Step 2: 7 kullanım noktasından InnerVoicePanel'i sök**

Her dosyada iki değişiklik: (a) `import { InnerVoicePanel } ...` satırını sil, (b) `<InnerVoicePanel ... />` render satırını sil. Dosya:satır listesi yukarıda **Files** bölümünde. Her birinde render satırının etrafındaki sarmalayıcı div/section yalnız paneli sarıyorsa onu da kaldır (ölü sarmalayıcı bırakma). Panelin beslediği `voices` hesaplaması (`evaluateInnerVoices(...)` çağrısı) başka yerde kullanılmıyorsa o `useMemo`'yu ve artık kullanılmayan importları da temizle — `npx tsc --noEmit` + `npm run lint` kullanılmayan değişkenleri yakalar.

`InnerVoicePanel.tsx` dosyası SİLİNMEZ — geçmiş çekmecesi (ThoughtDock) onu kullanıyor.

- [ ] **Step 3: Derleme + lint + test**

Run: `npx tsc --noEmit && npm run lint && npx vitest run`
Expected: hepsi temiz. Lint "unused import" verirse ilgili sayfadaki artık hesaplamaları temizle.

- [ ] **Step 4: e2e smoke'u yeni dünyaya uyarla**

`e2e/scene-smoke.spec.ts` içindeki:

```ts
  await expect(page.getByText('CABINET READ')).toBeVisible();
```

satırını şununla değiştir (boş projede Logic FAIL üretir → toast otomatik açılır):

```ts
  await expect(page.getByTestId('thought-dock')).toHaveCount(1);
  await expect(page.getByTestId('thought-toast').first()).toBeVisible();
```

- [ ] **Step 5: e2e koş**

Run: `npx playwright test e2e/scene-smoke.spec.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/Layout/AppLayout.tsx src/components/RecipeRail.tsx src/pages e2e/scene-smoke.spec.ts
git commit -m "feat(thoughts): sabit paneller söküldü — kabinet artık DE ünlemiyle konuşuyor"
```

---

### Task 10: M2 kapanışı — tam kapı + görsel kanıt + checkpoint

**Files:**
- Create: `reports/m2-thoughts-proof.png` (screenshot çıktısı)

- [ ] **Step 1: Tam kalite kapısı**

`mamilas-gate` skill'ini koş (tsc + vitest + build + .command syntax tek seferde).
Expected: tümü yeşil.

- [ ] **Step 2: Görsel kanıt**

Dev server açıkken:

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:5173/?scene=force', { waitUntil: 'networkidle' }); // headless'ta yazılımsal-GL fallback'i aşmak için force
  await p.waitForTimeout(3000);
  await p.screenshot({ path: 'reports/m2-thoughts-proof.png' });
  await b.close();
})();
"
```

**Screenshot'ı Read ile aç, gözle doğrula:** (1) arkada diorama, (2) altta thought toast (Logic FAIL, daktilo metni), (3) sabit kabinet paneli YOK.

- [ ] **Step 3: final-shots kanıt seti**

Run: `node scripts/final-shots.mjs`
Expected: script mevcut akışıyla ekran kanıtlarını üretir, hata yok.

- [ ] **Step 4: Commit + checkpoint**

```bash
git add reports/m2-thoughts-proof.png
git commit -m "feat(ui-3d): M1+M2 tamam — diorama kabuğu + DE ünlem sistemi, gate yeşil"
```

Sonra `mamilas-checkpoint` skill'ini koş (memory güncellemesi dahil).

---

## Plan sonrası

M3 (panel giydirme + stage kamera cilası), M4 (ASSET_BRIEF + gerçek asset entegrasyonu) ve M5 (CanvasPreview'in drei `<View>` ile 3D'leşmesi) bu plan bittikten ve M1+M2 gözle onaylandıktan sonra kendi plan dosyalarını alır: `docs/superpowers/plans/2026-07-XX-3d-diorama-shell-m3-m4.md` ve `...-m5-preview-3d.md`.
