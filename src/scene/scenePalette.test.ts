import { describe, expect, it } from 'vitest';
import { DATA } from '../core/pure';
import { DEFAULT_SCENE_PALETTE, deriveScenePalette, luma, satOf } from './scenePalette';

const worlds = DATA.worlds.filter((w) => w.palette_lock);

describe('deriveScenePalette — canlı dünya değişmezleri (39 gerçek palette_lock)', () => {
  it('en az 39 world palette_lock taşır (gerçek veri, fixture değil)', () => {
    expect(worlds.length).toBeGreaterThanOrEqual(39);
  });

  it('her world: L(fog) ∈ [.55,.80] — "pus ışıktır" (noir dahil)', () => {
    for (const w of worlds) {
      const L = luma(deriveScenePalette(w.palette_lock!).fog);
      expect(L, `${w.id} fog bandı dışı`).toBeGreaterThanOrEqual(0.55);
      expect(L, `${w.id} fog bandı dışı`).toBeLessThanOrEqual(0.80);
    }
  });

  it('her world: L(sunCore) ≥ .85 — hep bir güneş', () => {
    for (const w of worlds) {
      expect(luma(deriveScenePalette(w.palette_lock!).sunCore), w.id).toBeGreaterThanOrEqual(0.85);
    }
  });

  it('her world: L(seaDeep) ∈ [.06,.35] — ne void-siyah ne süt', () => {
    for (const w of worlds) {
      const L = luma(deriveScenePalette(w.palette_lock!).seaDeep);
      expect(L, `${w.id} seaDeep`).toBeGreaterThanOrEqual(0.06);
      expect(L, `${w.id} seaDeep`).toBeLessThanOrEqual(0.35);
    }
  });

  it('vividness: S(horizonGlow) ≥ min(.25, maxInputS)', () => {
    for (const w of worlds) {
      const p = w.palette_lock!;
      const maxS = Math.max(satOf(p.shadow), satOf(p.mid), satOf(p.accent), satOf(p.highlight));
      const floor = Math.min(0.25, maxS);
      expect(satOf(deriveScenePalette(p).horizonGlow), w.id).toBeGreaterThanOrEqual(floor - 1e-9);
    }
  });

  it('noir_high_contrast monochrome korunur (tüm çıktı S ≤ .02)', () => {
    const w = worlds.find((x) => x.id === 'noir_high_contrast');
    expect(w, 'noir_high_contrast bulunamadı').toBeTruthy();
    const p = deriveScenePalette(w!.palette_lock!);
    for (const [k, v] of Object.entries(p)) {
      expect(satOf(v), `noir ${k} renklendi`).toBeLessThanOrEqual(0.02);
    }
  });

  it('hue sadakati: one_piece skyTop mavi-baskın, ghibli fog sıcak', () => {
    const op = deriveScenePalette(worlds.find((w) => w.id === 'one_piece_toei')!.palette_lock!);
    const opR = parseInt(op.skyTop.slice(1, 3), 16), opB = parseInt(op.skyTop.slice(5, 7), 16);
    expect(opB, 'one_piece skyTop mavi değil').toBeGreaterThan(opR);
    const gh = deriveScenePalette(worlds.find((w) => w.id === 'ghibli_hayao')!.palette_lock!);
    const ghR = parseInt(gh.fog.slice(1, 3), 16), ghB = parseInt(gh.fog.slice(5, 7), 16);
    expect(ghR, 'ghibli fog sıcak değil').toBeGreaterThanOrEqual(ghB);
  });

  it('DEFAULT_SCENE_PALETTE aynı değişmezleri sağlar (world seçili değilken)', () => {
    const L = luma(DEFAULT_SCENE_PALETTE.fog);
    expect(L).toBeGreaterThanOrEqual(0.55);
    expect(L).toBeLessThanOrEqual(0.80);
    expect(luma(DEFAULT_SCENE_PALETTE.sunCore)).toBeGreaterThanOrEqual(0.85);
    const sd = luma(DEFAULT_SCENE_PALETTE.seaDeep);
    expect(sd).toBeGreaterThanOrEqual(0.06);
    expect(sd).toBeLessThanOrEqual(0.35);
  });
});
