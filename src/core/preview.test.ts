import { worldCategory, buildPreviewState } from './preview';
import { describe, it, expect } from 'vitest';

describe('worldCategory', () => {
  it('returns arcane for arcane token', () => {
    expect(worldCategory('arcane_clay something')).toBe('arcane');
  });
  it('returns verse for spiderverse token', () => {
    expect(worldCategory('spiderverse_graphic')).toBe('verse');
  });
  it('returns real for documentary token', () => {
    expect(worldCategory('commercial documentary')).toBe('real');
  });
  it('returns edu as default', () => {
    expect(worldCategory('unknown_token')).toBe('edu');
  });
  it('returns edu for clay/pixar/paper tokens — edu check precedes anime check', () => {
    expect(worldCategory('clay_world')).toBe('edu');
    expect(worldCategory('pixar_3d_edu')).toBe('edu');
    expect(worldCategory('paper_craft_popup')).toBe('edu');
    // even a combined anime+clay token resolves to edu (clay wins)
    expect(worldCategory('jjk_mappa clay')).toBe('edu');
  });
  it('returns anime for jjk/mappa/toei tokens without clay/paper override', () => {
    expect(worldCategory('jjk_mappa')).toBe('anime');
    expect(worldCategory('one_piece_toei')).toBe('anime');
    expect(worldCategory('demon_slayer_ufotable')).toBe('anime');
  });
  it('returns real for _real suffix and commercial/photo tokens', () => {
    expect(worldCategory('architecture_real')).toBe('real');
    expect(worldCategory('cinematic_real')).toBe('real');
    expect(worldCategory('automotive_commercial')).toBe('real');
    expect(worldCategory('photo_studio')).toBe('real');
  });
});

describe('buildPreviewState', () => {
  it('extracts colors and icons correctly', () => {
    const state = buildPreviewState({ world: 'clay', teachingMaterial: 'paper', palette: 'vibrant_clean_education' });
    expect(state.category).toBe('edu');
    expect(state.icon).toBe('□');
    expect(state.matIcon).toBe('◻');
    expect(state.colors.length).toBe(4);
    // vibrant_clean_education palette exists in SURGERY_DATA
    expect(state.colors[0]).not.toBe('#2b2f3a'); // should have real color
  });

  it('falls back to #2b2f3a placeholder colors when palette is not found', () => {
    const state = buildPreviewState({ world: 'clay', teachingMaterial: 'clay', palette: '__nonexistent_palette_xyz__' });
    // unknown palette → all 4 slots filled with fallback color
    expect(state.colors.length).toBe(4);
    expect(state.colors.every((c: string) => c === '#2b2f3a')).toBe(true);
  });

  it('returns worldName from SURGERY_DATA world record', () => {
    const state = buildPreviewState({ world: 'pixar_3d_edu', teachingMaterial: 'clay', palette: 'native_world' });
    expect(typeof state.worldName).toBe('string');
    expect(state.worldName.length).toBeGreaterThan(0);
    // worldId as fallback when no world record found
    const unknown = buildPreviewState({ world: '__no_such_world__', teachingMaterial: 'clay', palette: 'native_world' });
    expect(unknown.worldName).toBe('__no_such_world__');
  });

  it('returns anime category for jjk_mappa (pure anime world, no clay material)', () => {
    // The wcat token is [worldId, visualWorld, teachingMaterial].join(' ')
    // jjk_mappa contains 'jjk' + 'mappa' → anime; no clay/paper in material or visualWorld
    const state = buildPreviewState({ world: 'jjk_mappa', teachingMaterial: '', palette: 'native_world' });
    expect(state.category).toBe('anime');
  });

  it('arcane_fortiche produces arcane category and star icon', () => {
    const state = buildPreviewState({ world: 'arcane_fortiche', teachingMaterial: '', palette: 'native_world' });
    expect(state.category).toBe('arcane');
    expect(state.icon).toBe('★');
  });

  it('spiderverse_sony produces verse category and star icon', () => {
    const state = buildPreviewState({ world: 'spiderverse_sony', teachingMaterial: '', palette: 'native_world' });
    expect(state.category).toBe('verse');
    expect(state.icon).toBe('★');
  });

  it('returns activePreset from presetName or fallback', () => {
    const withPreset = buildPreviewState({ world: 'clay', teachingMaterial: 'clay', palette: 'native_world', presetName: 'TestPreset' });
    expect(withPreset.activePreset).toBe('TestPreset');
    const noPreset = buildPreviewState({ world: 'clay', teachingMaterial: 'clay', palette: 'native_world' });
    expect(noPreset.activePreset).toBe('Özel Reçete');
  });
});
