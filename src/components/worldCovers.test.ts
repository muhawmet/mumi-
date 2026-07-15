import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DATA } from '../core/pure';
import { WORLD_COVER_FILES, worldCoverUrl } from './worldCovers';

describe('world cover sözleşmesi', () => {
  it('her world için tam olarak bir kapak dosyası tanımlar (39 world)', () => {
    expect(DATA.worlds.length).toBe(46);
    expect(WORLD_COVER_FILES).toEqual(DATA.worlds.map((w) => `${w.id}.webp`));
  });

  it('url public/assets3d/worlds/ altına işaret eder', () => {
    expect(worldCoverUrl('pixar_3d_edu')).toBe('/assets3d/worlds/pixar_3d_edu.webp');
  });

  it('check-assets3d worlds bölümü SURGERY_DATA kaynağından sayar (sözleşme çapraz kontrolü)', () => {
    const script = readFileSync(new URL('../../scripts/check-assets3d.mjs', import.meta.url), 'utf8');
    expect(script).toContain('SURGERY_DATA.json');
    expect(script).toContain('assets3d/worlds/');
    expect(script).toContain('[worlds] kapak:');
  });
});
