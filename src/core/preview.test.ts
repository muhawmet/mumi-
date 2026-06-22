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
});
