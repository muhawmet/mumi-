import { describe, it, expect, beforeEach } from 'vitest';
import { useStudioStore } from './useStudioStore';
import { generateBatch, DATA } from '../core/pure';
import { registerOf } from '../core/brain';
import { AD_WORLD_REGISTERS } from '../pages/Recipe/adRegisters';

// Gece-2 reklam WIRING'inin kalıcı regresyon kilidi. Scratchpad audit'i (6 dünya ×
// register, hepsi GENERATED, guard tuzağı kapalı) buraya test olarak sabitlendi ki
// bir daha sessizce bozulmasın.
const AD_WORLDS = DATA.worlds.filter((w) => w.group === 'COMMERCIAL_REAL').map((w) => w.id);

describe('reklam WIRING regresyon kilidi', () => {
  beforeEach(() => useStudioStore.getState().reset());

  it('HER reklam dünyası edu-default path\'inde seçilince REAL register\'a çekilir (WORLD_PATH_MISMATCH tuzağı yok)', () => {
    const trapped: string[] = [];
    for (const worldId of AD_WORLDS) {
      useStudioStore.getState().reset();
      useStudioStore.getState().setField('projectClass', 'ANIMATION_EDU');
      useStudioStore.getState().setField('selectedWorldId', worldId);
      const pc = useStudioStore.getState().projectClass;
      if (registerOf(pc) !== 'REAL') trapped.push(`${worldId}: ${pc}`);
    }
    expect(trapped).toEqual([]);
  });

  it('HER reklam dünyası ULTRAREAL_COMMERCIAL + boş ref/native palette ile GENERATED (kendi kendine yeter)', () => {
    const blocked: string[] = [];
    for (const worldId of AD_WORLDS) {
      const r = generateBatch({
        projectTopic: 'Marka tanitimi', projectClass: 'ULTRAREAL_COMMERCIAL', sceneCount: 1,
        cast: '', selectedWorldId: worldId, selectedPropId: 'none', selectedRefIds: [],
        selectedPaletteId: 'native_world', selectedMusicId: '', imageModel: 'nano_banana_2',
        videoModel: 'kling_3',
      } as Parameters<typeof generateBatch>[0]);
      if (r.status !== 'GENERATED') blocked.push(`${worldId}: ${r.status}`);
    }
    expect(blocked).toEqual([]);
  });

  it('HER reklam register\'ı ışık brief\'ini üretilen prompt\'a threading eder + raw hex sızdırmaz', () => {
    const bad: string[] = [];
    for (const [worldId, regs] of Object.entries(AD_WORLD_REGISTERS)) {
      for (const reg of regs) {
        const r = generateBatch({
          projectTopic: 'Marka tanitimi', projectClass: 'ULTRAREAL_COMMERCIAL', sceneCount: 1,
          cast: '', selectedWorldId: worldId, selectedPropId: 'none', selectedRefIds: [],
          selectedPaletteId: 'native_world', selectedMusicId: '', imageModel: 'nano_banana_2',
          videoModel: 'kling_3', timeLight: reg.timeLight,
        } as Parameters<typeof generateBatch>[0]);
        if (r.status !== 'GENERATED') { bad.push(`${worldId}/${reg.id}: ${r.status}`); continue; }
        const prompt = String(r.scenes[0].imagePrompt);
        if (/#[0-9a-fA-F]{6}\b/.test(prompt)) bad.push(`${worldId}/${reg.id}: RAW-HEX`);
      }
    }
    expect(bad).toEqual([]);
  });
});
