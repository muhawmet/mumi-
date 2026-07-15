import { describe, expect, it } from 'vitest';
import { DATA } from '../core/pure';
import { PLATE_BY_GROUP, plateSlotFor } from './worldPlates';

describe('worldPlates — painterly plate haritası', () => {
  it('SURGERY_DATA içindeki HER world grubu için açık plate tanımlı', () => {
    const groups = new Set(DATA.worlds.map((w) => w.group));
    expect(groups.size).toBeGreaterThanOrEqual(7);
    for (const group of groups) {
      expect(PLATE_BY_GROUP[group], `plate for group ${group}`).toBeTruthy();
    }
  });

  it('dünya seçilmemişken atölye amblemine (logo-card) düşer', () => {
    expect(plateSlotFor(undefined)).toBe('logo-card');
    expect(plateSlotFor('')).toBe('logo-card');
  });

  it('bilinmeyen grup hero arketipine düşer', () => {
    expect(plateSlotFor('YENI_GRUP')).toBe('card-hero-archetype');
  });

  it('grup eşlemeleri arketip yönelimlerine uyar', () => {
    expect(plateSlotFor('ANIMATION_EDU')).toBe('card-explorer-archetype');
    expect(plateSlotFor('CINEMATIC_REAL')).toBe('card-detective-archetype');
    expect(plateSlotFor('ANIMATION_DARK')).toBe('card-detective-archetype');
    expect(plateSlotFor('ANIMATION_PAINTERLY')).toBe('card-arcane-archetype');
    expect(plateSlotFor('ANIMATION_STYLIZED')).toBe('card-hero-archetype');
  });
});
