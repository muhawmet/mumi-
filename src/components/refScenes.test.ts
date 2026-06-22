import { describe, expect, it } from 'vitest';
import { hasWorldScene, WORLD_SCENES } from './refScenes';

describe('WORLD_SCENES', () => {
  it('covers every premium animation world with a dedicated scene', () => {
    expect(Object.keys(WORLD_SCENES).sort()).toEqual([
      'anime_cel',
      'arcane',
      'ghibli',
      'pixar3d',
      'spiderverse',
      'stopmotion',
    ]);
  });

  it('reports only registered world scenes', () => {
    expect(hasWorldScene('arcane')).toBe(true);
    expect(hasWorldScene('cinematic_real')).toBe(false);
    expect(hasWorldScene(undefined)).toBe(false);
  });
});
