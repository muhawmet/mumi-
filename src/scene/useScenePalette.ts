import { useMemo } from 'react';
import { useStudioStore } from '../store/useStudioStore';
import { DATA } from '../core/pure';
import { DEFAULT_SCENE_PALETTE, deriveScenePalette, type ScenePalette } from './scenePalette';

/** World-adaptif sahne paleti: seçili world'ün palette_lock'undan türetilir; yoksa canlı
 *  default altın-saat. selectedWorldId değişince yeni palet (sahne o dünyanın ışığına döner). */
export function useScenePalette(): ScenePalette {
  const selectedWorldId = useStudioStore((s) => s.selectedWorldId);
  return useMemo(() => {
    const world = DATA.worlds.find((w) => w.id === selectedWorldId);
    return world?.palette_lock ? deriveScenePalette(world.palette_lock) : DEFAULT_SCENE_PALETTE;
  }, [selectedWorldId]);
}
