import { describe, it, expect } from 'vitest';
import { chromaOf, mixHex, plateComposition } from './plateArt';
import { plateRecipe } from './ArchetypeSlate';
import { PHASE0_VIDEO } from '../data/presets';

describe('plateArt — boyanmış plaka iskeleti', () => {
  it('kompozisyon deterministik: aynı seed aynı plakayı üretir', () => {
    const a = plateComposition(123456, 40);
    const b = plateComposition(123456, 40);
    expect(a).toEqual(b);
  });

  it('silüet burun güneşi asla kesmez (güneşin tersine oturur)', () => {
    expect(plateComposition(1, 70).ridgeSide).toBe(-1); // güneş sağda → burun solda
    expect(plateComposition(1, 20).ridgeSide).toBe(1);  // güneş solda → burun sağda
  });

  it('chromaOf cırtlak ile nötrü ayırır (vibrant_edu pusa erime kapısı)', () => {
    expect(chromaOf('#F4C430')).toBeGreaterThan(0.6); // saffron — poster riski
    expect(chromaOf('#8a8a8a')).toBe(0);              // nötr gri
  });

  it('mixHex uçları korur', () => {
    expect(mixHex('#000000', '#ffffff', 0)).toBe('#000000');
    expect(mixHex('#000000', '#ffffff', 1)).toBe('#ffffff');
  });
});

describe('plaka kimliği — 10 preset, öksüz yok', () => {
  const recipes = PHASE0_VIDEO.map((p) => ({ id: p.id, r: plateRecipe(p, PHASE0_VIDEO) }));

  it('her preset kendi kompozisyon tohumunu taşır (seed/sunX benzersiz)', () => {
    const seeds = new Set(recipes.map(({ r }) => r.seed));
    expect(seeds.size).toBe(PHASE0_VIDEO.length);
    const comps = new Set(recipes.map(({ r }) => `${r.sunX}:${r.horizon}`));
    expect(comps.size).toBe(PHASE0_VIDEO.length);
  });

  it('her preset ayırt edici imza etiketi taşır (yeni preset öksüz kalamaz)', () => {
    const sigs = new Set(recipes.map(({ r }) => r.signature));
    expect(sigs.size).toBe(PHASE0_VIDEO.length);
  });

  it('yeni arketipler (food_beverage, edu_promo) plaka reçetesinde world+renk taşır', () => {
    for (const id of ['food_beverage', 'edu_promo']) {
      const rec = recipes.find((x) => x.id === id);
      expect(rec, `${id} preset kayıp`).toBeTruthy();
      expect(rec!.r.world, `${id} world çözülmedi`).toBeTruthy();
      expect(rec!.r.colors).toHaveLength(4);
    }
  });
});

/* Denetim şartı kilidi (perf): repaint fırtınası bir daha AÇILAMAZ.
   Komponent-render testi yok (DOM'suz vitest) — repo geleneğiyle kaynak-kilidi:
   designLaws/docsContract gibi, sapan kod = kırmızı test. */
describe('PaintedPlate repaint fırtınası kilidi (kaynak-kilit)', () => {
  const { readFileSync } = require('node:fs') as typeof import('node:fs');
  const { join } = require('node:path') as typeof import('node:path');
  const src = (p: string) => readFileSync(join(__dirname, p), 'utf8');

  it('PaintedPlate effect COLORS REFERANSINI değil içerik anahtarını izler', () => {
    const plate = src('./PaintedPlate.tsx');
    expect(plate).toMatch(/const colorKey = colors\.join\('\|'\)/);
    expect(plate).toMatch(/\[colorKey, seed, sx, hz, height\]/);
    // referans-bazlı dep geri gelemez
    expect(plate).not.toMatch(/\[colors, seed/);
  });

  it('RecipeStep dünya listesi renkleri map İÇİNDE kurmaz — worldPlateColors memo şart', () => {
    const step = src('../pages/Recipe/RecipeStep.tsx');
    expect(step).toMatch(/const worldPlateColors = useMemo\(/);
    // worlds.map gövdesinde paletteColors çağrısı yasak (taze tuple = repaint kaynağı)
    const mapBody = step.slice(step.indexOf('recipe-world-list'), step.indexOf('recipe-world-detail'));
    expect(mapBody).not.toMatch(/paletteColors\(/);
    expect(mapBody).toMatch(/worldPlateColors\.get\(/);
  });
});
