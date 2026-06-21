import { describe, it, expect } from 'vitest';
import { PHASE0_VIDEO, PHASE0_DESIGN } from './presets';
import { DATA } from '../core/pure';

const worldIds = new Set(DATA.worlds.map((w) => w.id));

describe('Phase 0 presets', () => {
  it('every video preset points at a real world id', () => {
    for (const p of PHASE0_VIDEO) {
      if (p.sets.selectedWorldId) {
        expect(worldIds.has(p.sets.selectedWorldId), `${p.id} → unknown world "${p.sets.selectedWorldId}"`).toBe(true);
      }
    }
  });

  it('every design preset points at a real world id', () => {
    for (const p of PHASE0_DESIGN) {
      if (p.sets.selectedWorldId) {
        expect(worldIds.has(p.sets.selectedWorldId), `${p.id} → unknown world "${p.sets.selectedWorldId}"`).toBe(true);
      }
    }
  });

  it('palette overrides (if any) point at real palettes', () => {
    const paletteIds = new Set(DATA.palettes.map((p) => p.id));
    for (const p of [...PHASE0_VIDEO, ...PHASE0_DESIGN]) {
      if (p.sets.selectedPaletteId) {
        expect(paletteIds.has(p.sets.selectedPaletteId), `${p.id} → unknown palette "${p.sets.selectedPaletteId}"`).toBe(true);
      }
    }
  });
});
