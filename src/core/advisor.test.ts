import { describe, expect, it } from 'vitest';
import { directorNotes, suggestRecipe, starterPackFor } from './advisor';
import { DATA } from './pure';

describe('suggestRecipe', () => {
  it.each([
    'Su döngüsü dersi: buharlaşma ve yoğuşma',
    'ürün reklamı, packshot, makro yüzey',
    'One Piece Elbaf tarzı dev ada macerası',
  ])('returns the same valid neutral starter without reading source/topic words: %s', (topic) => {
    const suggestion = suggestRecipe(topic);
    expect(suggestion).toEqual(suggestRecipe(''));
    expect(DATA.worlds.some((world) => world.id === suggestion.worldId)).toBe(true);
    expect(DATA.palettes.some((palette) => palette.id === suggestion.paletteId)).toBe(true);
    expect(suggestion.refIds.length).toBeGreaterThan(0);
    expect(suggestion.refIds.every((id) => DATA.refs.some((ref) => ref.id === id))).toBe(true);
  });
});

describe('directorNotes', () => {
  const full = {
    projectClass: 'ANIMATION_EDU',
    selectedWorldId: 'pixar_3d_edu',
    selectedPaletteId: 'vibrant_edu',
    selectedRefIds: [],
  };

  it('praises a coherent v2 recipe even when reference DNA is optional', () => {
    const notes = directorNotes(full);
    expect(notes[0].level).toBe('good');
    expect(notes.some((note) => note.title === 'Referans DNA seçilmedi')).toBe(true);
  });

  it('flags missing world and palette as warnings', () => {
    const notes = directorNotes({ projectClass: 'ANIMATION_EDU', selectedWorldId: '', selectedPaletteId: '', selectedRefIds: [] });
    expect(notes.filter((note) => note.level === 'warn').length).toBeGreaterThanOrEqual(2);
    expect(notes.some((note) => /Dünya/.test(note.title))).toBe(true);
  });

  it('warns when a real path wears an animation world', () => {
    const notes = directorNotes({ ...full, projectClass: 'ULTRAREAL_COMMERCIAL' });
    expect(notes.some((note) => /Register \/ dünya/.test(note.title))).toBe(true);
  });

  it('warns when the preset register does not match the path register', () => {
    const notes = directorNotes({ ...full, phase0PresetId: 'product_brand' });
    expect(notes.some((note) => note.level === 'warn' && /Preset \/ register/.test(note.title))).toBe(true);
  });

  it('flags long-form scene plans only as info', () => {
    const normal = directorNotes({ ...full, sceneCount: 24 });
    expect(normal.some((note) => /Uzun format|Sahne sayısı/.test(note.title))).toBe(false);
    const longForm = directorNotes({ ...full, sceneCount: 48 });
    expect(longForm.some((note) => note.level === 'info' && /Uzun format/.test(note.title))).toBe(true);
  });
});

describe('reference intelligence v2', () => {
  it('provides valid starter packs for each current render world', () => {
    for (const world of DATA.worlds) {
      const starterPack = starterPackFor(world.id);
      expect(starterPack.length, world.id).toBeGreaterThan(0);
      expect(starterPack.length, world.id).toBeLessThanOrEqual(3);
      expect(starterPack.every((ref) => DATA.refs.some((item) => item.id === ref.id)), world.id).toBe(true);
    }
  });
});

describe('preset ↔ world tension (Faz 1 — 2026-07-02)', () => {
  const base = {
    projectClass: 'ANIMATION_EDU',
    selectedPaletteId: 'vibrant_edu',
    selectedRefIds: [],
  };

  it('warns (info, non-blocking) when the mandate preset never sets the selected world', () => {
    const notes = directorNotes({ ...base, selectedWorldId: 'kurzgesagt_edu', phase0PresetId: 'edu_explainer' });
    const note = notes.find((n) => /Preset \/ dünya/.test(n.title));
    expect(note?.level).toBe('info');
    expect(note?.detail).toMatch(/Render Lock kazanır/);
  });

  it('stays silent when the selected world is inside the preset scope', () => {
    const notes = directorNotes({ ...base, selectedWorldId: 'clay', phase0PresetId: 'edu_explainer' });
    expect(notes.some((n) => /Preset \/ dünya/.test(n.title))).toBe(false);
  });

  it('PRESET_WORLD_SCOPE stays in sync with src/data/presets.ts', async () => {
    const { PHASE0_VIDEO } = await import('../data/presets');
    const { normalizeWorldId } = await import('./pure');
    const { PRESET_WORLD_SCOPE } = await import('./advisor');
    for (const preset of PHASE0_VIDEO) {
      const worlds = new Set<string>();
      if (preset.sets.selectedWorldId) worlds.add(normalizeWorldId(preset.sets.selectedWorldId));
      for (const group of preset.directorPanel.groups) {
        for (const choice of group.choices) {
          if (choice.sets.selectedWorldId) worlds.add(normalizeWorldId(choice.sets.selectedWorldId));
        }
      }
      const scopeList = PRESET_WORLD_SCOPE[preset.id];
      expect(scopeList, `advisor PRESET_WORLD_SCOPE missing preset ${preset.id}`).toBeTruthy();
      const scoped = new Set(scopeList.map(normalizeWorldId));
      for (const w of worlds) {
        expect(scoped.has(w), `preset ${preset.id}: world ${w} missing from advisor scope`).toBe(true);
      }
    }
  });
});

describe('dnaStrength — world gate (KÖK 7c)', () => {
  it('a ref pinned to a different world contributes nothing and lands in zeroRefIds', async () => {
    const { dnaStrength } = await import('./advisor');
    const arcaneRef = DATA.refs.find((r) => r.id === 'arcane_texture')!; // worldId: arcane_fortiche
    // Against a different world: production (pure.ts compatibleRefs) drops it,
    // so the advisor must report zero contribution — UI must not lie.
    const gated = dnaStrength([arcaneRef], 'STY', 'pixar_3d_edu');
    expect(gated.filled).toBe(0);
    expect(gated.zeroRefIds).toContain('arcane_texture');
    // Against its own world it contributes normally.
    const native = dnaStrength([arcaneRef], 'STY', 'arcane_fortiche');
    expect(native.filled).toBeGreaterThan(0);
    expect(native.zeroRefIds).not.toContain('arcane_texture');
  });
});

describe('dnaStrength — pinli ref yalnız kendi dünyasında (B1+B2 kök, 2026-07-17)', () => {
  it('kubrick ref (home: fincher_precision) deakins_naturalist\'te ZEROED (yabancı dünya)', async () => {
    const { dnaStrength } = await import('./advisor');
    const { DATA } = await import('./pure');
    const kubrick = DATA.refs.find((r) => r.id === 'kubrick_one_point')!;
    const s = dnaStrength([kubrick], 'REAL', 'deakins_naturalist');
    expect(s.zeroRefIds).toContain('kubrick_one_point');
  });
  it('kubrick ref KENDİ dünyasında (fincher_precision) ZEROED DEĞİL', async () => {
    const { dnaStrength } = await import('./advisor');
    const { DATA } = await import('./pure');
    const kubrick = DATA.refs.find((r) => r.id === 'kubrick_one_point')!;
    const s = dnaStrength([kubrick], 'REAL', 'fincher_precision');
    expect(s.zeroRefIds).not.toContain('kubrick_one_point');
    expect(s.filled).toBeGreaterThan(0);
  });
  it('IP anime ref stays gated across sibling BOLD_CEL worlds', async () => {
    const { dnaStrength } = await import('./advisor');
    const { DATA } = await import('./pure');
    const naruto = DATA.refs.find((r) => r.id === 'naruto_chakra_motion')!;
    const s = dnaStrength([naruto], 'STY', 'one_piece_toei');
    expect(s.zeroRefIds).toContain('naruto_chakra_motion');
  });
});
