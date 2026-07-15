import { describe, expect, it } from 'vitest';
import { CAMERA_POSES, LOOK, cameraPoseFor } from './lookConfig';

// Config'ten türetilir ki store'a yeni step eklendiğinde bu test sessizce eksik kalmasın.
const ALL_STEPS = Object.keys(CAMERA_POSES) as Array<keyof typeof CAMERA_POSES>;

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

  it('efekt şiddetleri DE bandında (V4: canlı serbest, palyaço-grade yasak)', () => {
    expect(LOOK.bloom.intensity).toBeLessThanOrEqual(0.9);
    expect(LOOK.grain.opacity).toBeLessThanOrEqual(0.25);
    expect(LOOK.chromaticAberration.offset).toBeLessThanOrEqual(0.003);
    // V4 color grading bandı: canlılık var ama abartı yok
    expect(LOOK.grade.saturation).toBeLessThanOrEqual(0.25);
    expect(LOOK.grade.contrast).toBeLessThanOrEqual(0.15);
    expect(LOOK.grade.exposure).toBeGreaterThanOrEqual(1.0);
    expect(LOOK.grade.exposure).toBeLessThanOrEqual(1.3);
  });

  it('FOV bandı 30–36 (V3 §5 kamera kanunu)', () => {
    for (const step of ALL_STEPS) {
      expect(CAMERA_POSES[step].fov).toBeGreaterThanOrEqual(30);
      expect(CAMERA_POSES[step].fov).toBeLessThanOrEqual(36);
    }
  });

  it('ardışık stage pozları hissedilir farklı — koreografi gerçekten oynar', () => {
    const dist = (a: readonly number[], b: readonly number[]) =>
      Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    for (let i = 1; i < ALL_STEPS.length; i++) {
      const prev = CAMERA_POSES[ALL_STEPS[i - 1]].position;
      const next = CAMERA_POSES[ALL_STEPS[i]].position;
      expect(dist(prev, next), `${ALL_STEPS[i - 1]}→${ALL_STEPS[i]} kamera neredeyse durdu`).toBeGreaterThan(2);
    }
  });

  it('kamera daima ufkun önünde (ön-yarımküre kanunu)', () => {
    for (const step of ALL_STEPS) {
      expect(CAMERA_POSES[step].position[2], `${step} ufuk arkasına düştü`).toBeGreaterThan(0);
    }
  });
});

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function relLuma(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

describe('LOOK V4 — Canlı Altın-Saat bandı', () => {
  it('fog aerial-perspective derinliği taşır (near[8,16] / far[40,60] / far-near≥30)', () => {
    expect(LOOK.fog.near).toBeGreaterThanOrEqual(8);
    expect(LOOK.fog.near).toBeLessThanOrEqual(16);
    expect(LOOK.fog.far).toBeGreaterThanOrEqual(40);
    expect(LOOK.fog.far).toBeLessThanOrEqual(60);
    expect(LOOK.fog.far - LOOK.fog.near).toBeGreaterThanOrEqual(30);
  });

  it('"pus ışıktır": clearColor & fog aydınlık (rel-luma ≥ .45) ve BİRBİRİNE EŞİT', () => {
    // V4: serin dünyalar artık meşru (r≥g≥b kalktı); yasak olan KARANLIK haze.
    expect(relLuma(LOOK.clearColor), 'clearColor karanlık').toBeGreaterThanOrEqual(0.45);
    expect(relLuma(LOOK.fog.color), 'fog karanlık').toBeGreaterThanOrEqual(0.45);
    expect(LOOK.clearColor.toLowerCase()).toBe(LOOK.fog.color.toLowerCase());
  });

  it('ışık kanunu: ambient gündüz enerjisi [.45,.85], ana ışık ikincilin ≥2 katı, ≤2 dolgu', () => {
    expect(LOOK.light.ambient).toBeGreaterThanOrEqual(0.45);
    expect(LOOK.light.ambient).toBeLessThanOrEqual(0.85);
    expect(LOOK.light.lamp).toBeGreaterThanOrEqual(LOOK.light.sconce * 2);
    expect(LOOK.light.sconcePositions.length).toBeLessThanOrEqual(2);
  });

  it('vignette hâlâ çerçeveler ama mahzen değil (darkness [.25,.55], offset ≥ .25)', () => {
    expect(LOOK.vignette.darkness).toBeGreaterThanOrEqual(0.25);
    expect(LOOK.vignette.darkness).toBeLessThanOrEqual(0.55);
    expect(LOOK.vignette.offset).toBeGreaterThanOrEqual(0.25);
  });
});
