import { describe, it, expect } from 'vitest';
import { suggestRecipe, directorNotes, dnaStrength, refContribution, refFit, starterPackFor } from './advisor';
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

  it('warns when a selected reference fights the render world', () => {
    const notes = directorNotes({ ...full, selectedWorldId: 'arcane', selectedRefIds: ['setup_highkey'] });
    expect(notes.some((n) => /DNA \/ dünya uyumsuzluğu/.test(n.title))).toBe(true);
  });
});

describe('reference intelligence', () => {
  it('scores exact locks, preferred categories, and conflicts in descending order', () => {
    const arcane = DATA.worlds.find((world) => world.id === 'arcane')!;
    const preferred = DATA.refs.find((ref) => ref.id === 'arcane_texture')!;
    const conflict = DATA.refs.find((ref) => ref.id === 'setup_highkey')!;
    expect(refFit(arcane, preferred)).toBeGreaterThanOrEqual(90);
    expect(refFit(arcane, conflict)).toBeLessThan(45);
    expect(refFit(undefined, preferred)).toBe(0);
  });

  it('provides a valid curated 2–3 reference pack for every render world', () => {
    for (const world of DATA.worlds) {
      const pack = starterPackFor(world.id);
      expect(pack.length, world.id).toBeGreaterThanOrEqual(2);
      expect(pack.length, world.id).toBeLessThanOrEqual(3);
      expect(new Set(pack.map((ref) => ref.id)).size, world.id).toBe(pack.length);
      expect(pack.every((ref) => DATA.refs.some((candidate) => candidate.id === ref.id)), world.id).toBe(true);
      expect(pack.every((ref) => refFit(world, ref) >= 90), world.id).toBe(true);
    }
  });

  it('derives UI roles and combined strength from the same DNA directives as the brief', () => {
    const refs = ['arcane_texture', 'roger_deakins_naturalism']
      .map((id) => DATA.refs.find((ref) => ref.id === id)!);
    const contribution = refContribution(refs[0]);
    const strength = dnaStrength(refs);
    expect(contribution.count).toBeGreaterThan(0);
    expect(strength.filled).toBeGreaterThanOrEqual(contribution.count);
    expect(strength.total).toBe(5);
    expect(strength.percent).toBe(strength.filled * 20);
  });

  it('marks references that add no mapped directive as unnecessary', () => {
    const empty = { id: 'empty', name: 'Empty', cat: 'Other', use: '', avoid: '', dna: '' };
    expect(refContribution(empty).count).toBe(0);
    expect(dnaStrength([empty]).zeroRefIds).toEqual(['empty']);
  });
});
