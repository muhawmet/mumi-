import { describe, it, expect } from 'vitest';
import { suggestRecipe, directorNotes } from './advisor';
import { DATA } from './pure';

describe('suggestRecipe', () => {
  it('turns an education topic into a complete, valid recipe', () => {
    const s = suggestRecipe('Su döngüsü dersi: buharlaşma ve yoğuşma');
    expect(s.path).toBe('ANIMATION_EDU');
    expect(DATA.worlds.some((w) => w.id === s.worldId)).toBe(true);
    expect(DATA.palettes.some((p) => p.id === s.paletteId)).toBe(true);
    expect(s.refIds.length).toBeGreaterThan(0);
    expect(DATA.refs.some((r) => r.id === s.refIds[0])).toBe(true);
  });

  it('routes a product-ad topic to a commercial path', () => {
    const s = suggestRecipe('ürün reklamı, packshot, makro yüzey');
    expect(['PRODUCT_HERO', 'ULTRAREAL_COMMERCIAL']).toContain(s.path);
  });
});

describe('directorNotes', () => {
  const full = {
    projectClass: 'ANIMATION_EDU',
    selectedWorldId: 'clay',
    selectedPaletteId: DATA.palettes[0].id,
    selectedRefIds: ['pixar_dimensional'],
  };

  it('praises a coherent recipe', () => {
    const notes = directorNotes(full);
    expect(notes[0].level).toBe('good');
  });

  it('flags missing world/palette/ref as warnings', () => {
    const notes = directorNotes({ projectClass: 'ANIMATION_EDU', selectedWorldId: '', selectedPaletteId: '', selectedRefIds: [] });
    expect(notes.filter((n) => n.level === 'warn').length).toBeGreaterThanOrEqual(3);
    expect(notes.some((n) => /Dünya/.test(n.title))).toBe(true);
  });

  it('warns when a real path wears an animation world (register clash)', () => {
    const notes = directorNotes({ ...full, projectClass: 'ULTRAREAL_COMMERCIAL' });
    expect(notes.some((n) => /gerilim|çakış/i.test(n.title + n.detail))).toBe(true);
  });

  it('notes the single-topic repeat caveat', () => {
    const notes = directorNotes({ ...full, sceneCount: 5 });
    expect(notes.some((n) => /Tek konu/.test(n.title))).toBe(true);
  });
});
