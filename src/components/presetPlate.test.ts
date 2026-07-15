import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PRESET_PLATE_FILES } from './PresetPlate';

// Mami'nin teslim sözleşmesi: dosya adı = sözleşme (CHARACTERS_GOAL_T2 deseni).
const CONTRACT = [
  'product_brand.webp',
  'edu_explainer.webp',
  'cinematic_story.webp',
  'social_short.webp',
  'doc_human.webp',
  'corp_public.webp',
  'event_campaign.webp',
  'stylized_game.webp',
  'food_beverage.webp',
  'edu_promo.webp',
];

describe('preset plate contract', () => {
  it('lists exactly one webp slot per video archetype', () => {
    expect(PRESET_PLATE_FILES).toEqual(CONTRACT);
  });

  it('check-assets3d script carries the same plate list', () => {
    const script = fs.readFileSync(path.join(__dirname, '../../scripts/check-assets3d.mjs'), 'utf8');
    for (const file of CONTRACT) {
      expect(script).toContain(file);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 0 IS THE FIRST SCREEN MAMI SEES, AND EVERY CARD ON IT WORE THE SAME
// SEA-SUNSET GRADIENT.
//
// That is the exact complaint that got the 46 world plates rebuilt — still alive
// one room over. The webp contract above is real and EMPTY (/assets3d/presets/ has
// no files), so every card fell through to one shared fallback: ten different
// archetypes, one identical picture.
//
// A preset's whole job is to LOCK a world. So the card now previews the world it
// locks, painted by the same procedural identity plate the recipe wall uses. That
// only works if every preset actually names a world — a preset that doesn't drops
// straight back to the shared gradient, silently, and nobody notices until Mami
// opens the app and sees the sea again.
describe('every Phase 0 preset can paint the world it locks', () => {
  it('no preset falls back to the shared gradient — each one names a world', async () => {
    const { PHASE0_VIDEO } = await import('../data/presets');
    const worldless = PHASE0_VIDEO.filter((p) => !p.sets?.selectedWorldId).map((p) => p.id);
    expect(
      worldless,
      `these presets name no world, so their card shows the shared sea-sunset instead of the world they lock: ${worldless.join(', ')}`,
    ).toEqual([]);
  });

  it('every preset world is a world the plate painter actually knows', async () => {
    const { PHASE0_VIDEO } = await import('../data/presets');
    const { DATA } = await import('../core/pure');
    const known = new Set(DATA.worlds.map((w) => w.id));
    const orphans = PHASE0_VIDEO
      .map((p) => p.sets?.selectedWorldId)
      .filter((id): id is string => typeof id === 'string' && !known.has(id));
    expect(
      orphans,
      `these presets lock a world that does not exist in SURGERY_DATA: ${orphans.join(', ')}`,
    ).toEqual([]);
  });
});
