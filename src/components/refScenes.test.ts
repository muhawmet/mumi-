import { describe, expect, it } from 'vitest';
import { DATA } from '../core/pure';
import { hasRefScene, hasWorldScene, REF_SCENES, WORLD_SCENES } from './refScenes';

describe('WORLD_SCENES', () => {
  it('covers the current v2 render worlds with data-backed scene ids', () => {
    const ids = Object.keys(WORLD_SCENES);
    DATA.worlds.forEach((world) => {
      expect(ids, world.id).toContain(world.id);
    });
  });

  it('reports only registered world scenes', () => {
    expect(hasWorldScene('arcane_fortiche')).toBe(true);
    expect(hasWorldScene('cinematic_real')).toBe(false);
    expect(hasWorldScene(undefined)).toBe(false);
  });
});

describe('REF_SCENES', () => {
  it('keeps gallery helpers compatible with the active reference DNA library', () => {
        // 112 → 130: eighteen commercial refs added (2026-07-11). The six COMMERCIAL_REAL worlds —
    // product, corporate, civic, food, sport, edu-promo — had ZERO refs between them, which is
    // to say Mami could not pick a single reference for the work he is actually paid to do.
    // The count is locked so a ref cannot vanish unnoticed; raise it when you add, never lower it.
    expect(DATA.refs.length).toBe(130);
    expect(DATA.refs.some((ref) => ref.id === 'arcane_texture')).toBe(true);
    expect(DATA.refs.some((ref) => ref.id === 'onepiece_grandline_scale')).toBe(true);
    expect(Object.keys(REF_SCENES).length).toBeGreaterThan(0);
    expect(Object.values(REF_SCENES).every((scene) => typeof scene === 'function')).toBe(true);
  });

  it('keeps legacy reference renderers callable for compatibility only', () => {
    expect(hasRefScene('one_piece_sunny_adventure')).toBe(true);
    expect(hasRefScene('setup_highkey')).toBe(false);
  });

  it('cinema/prestige-TV batch scenes exist and run crash-free on a mock 2D context', () => {
    const batch = [
      'satoshi_kon_match_cut', 'kyoani_light_intimacy', 'urasawa_dread_stillness',
      'evangelion_tension_hold', 'wong_karwai_step_print', 'kubrick_one_point',
      'tarkovsky_slow_nature', 'villeneuve_scale_dread', 'bong_verticality_staging',
      'mad_max_chaos_cam', 'breaking_bad_desert_pov', 'severance_corporate_dread',
      'chernobyl_muted_dread',
    ];
    const gradient = { addColorStop: () => {} };
    const ctx = new Proxy({}, {
      get: (target, prop) => {
        if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return () => gradient;
        if (typeof prop === 'string' && ['fillStyle', 'strokeStyle', 'lineWidth', 'globalAlpha'].includes(prop)) return undefined;
        return () => {};
      },
      set: () => true,
    }) as unknown as CanvasRenderingContext2D;

    batch.forEach((id) => {
      expect(hasRefScene(id), id).toBe(true);
      expect(DATA.refs.some((ref) => ref.id === id), `${id} in DATA.refs`).toBe(true);
      // several timestamps to exercise time-branched paths (drop cycle, crash flash)
      [0, 1500, 3100, 4200].forEach((t) => {
        expect(() => REF_SCENES[id](ctx, 320, 180, t, ['#334455', '#AA6633', '#111820', '#F2E8D0'])).not.toThrow();
      });
    });
  });
});
