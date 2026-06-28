import { describe, expect, it } from 'vitest';
import { DATA } from '../core/pure';
import { hasRefScene, hasWorldScene, REF_SCENES, WORLD_SCENES } from './refScenes';

describe('WORLD_SCENES', () => {
  it('covers every premium animation world + IP_WORLD entries with a dedicated scene', () => {
    expect(Object.keys(WORLD_SCENES).sort()).toEqual([
      'anime_cel',
      'aot_wall_world',
      'arcane',
      'bleach_soul_world',
      'bones_action',
      'demon_slayer_taisho',
      'ghibli',
      'jjk_cursed_domain',
      'kurzgesagt_edu',
      'mappa_cinematic',
      'motion_design_flat',
      'naruto_shinobi_world',
      'one_piece_grand_line',
      'pixar3d',
      'retro_anime_film',
      'solo_leveling_gate',
      'spiderverse',
      'stopmotion',
      'toei_adventure',
      'ukiyo_e_print',
      'whiteboard_explainer',
    ]);
  });

  it('reports only registered world scenes', () => {
    expect(hasWorldScene('arcane')).toBe(true);
    expect(hasWorldScene('cinematic_real')).toBe(false);
    expect(hasWorldScene(undefined)).toBe(false);
  });
});

describe('REF_SCENES', () => {
  it('keeps the 60-scene gallery fully dedicated with no missing data ids', () => {
    const ids = Object.keys(REF_SCENES);
    expect(ids).toHaveLength(60);
    expect(ids.every((id) => DATA.refs.some((ref) => ref.id === id))).toBe(true);
    expect(Object.values(REF_SCENES).every((scene) => typeof scene === 'function')).toBe(true);
  });

  it('reports dedicated scenes without falling through to the generic renderer', () => {
    expect(hasRefScene('one_piece_sunny_adventure')).toBe(true);
    expect(hasRefScene('naruto_chakra_motion')).toBe(true);
    expect(hasRefScene('setup_highkey')).toBe(false);
  });
});
