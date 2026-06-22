import { describe, expect, it } from 'vitest';
import { DATA, generateBatch } from '../core/pure';
import {
  applyPromptOverride,
  migratePersistedState,
  presetWithDefaults,
  recipeReadiness,
  type Scene,
  useStudioStore,
} from './useStudioStore';

function generatedScene(): Scene {
  const result = generateBatch({
    projectTopic: 'SOURCE:\nkısa kaynak',
    projectClass: 'EĞİTİM_01',
    sceneCount: 1,
    cast: 'İkisi',
    selectedWorldId: 'clay',
    selectedPropId: 'clay',
    selectedRefId: 'pixar_dimensional',
    selectedPaletteId: 'vibrant_clean_education',
    selectedMusicId: '',
    imageModel: 'midjourney_v7',
    videoModel: 'kling_2_1',
  });
  const scene = result.scenes[0];
  return {
    id: scene.id,
    architecture: scene.architecture,
    imagePrompt: scene.imagePrompt,
    motionPrompt: scene.motionPrompt,
    voiceOver: scene.voiceOver,
    sunoBrief: scene.sunoBrief,
    durationSec: scene.durationSec,
    duration: scene.duration,
    intensity: scene.intensity,
    phaseName: scene.phaseName,
    handoff: scene.handoff,
  };
}

describe('studio store helpers', () => {
  it('auto-wires preset defaults and clears stale generation output', () => {
    const preset = presetWithDefaults(
      { projectClass: 'EĞİTİM_01', selectedWorldId: '' },
      { projectClass: 'EĞİTİM_01', selectedWorldId: 'clay', sceneCount: 5 },
    );
    expect(DATA.refs.some((r) => r.id === preset.selectedRefId)).toBe(true);
    expect(DATA.palettes.some((p) => p.id === preset.selectedPaletteId)).toBe(true);
    expect(recipeReadiness(preset as never).ready).toBe(true);
    expect(preset.scenes).toEqual([]);
  });

  it('auto-wires the live store when the world changes', () => {
    useStudioStore.getState().reset();
    useStudioStore.getState().setField('selectedWorldId', 'clay');
    const state = useStudioStore.getState();
    expect(state.selectedWorldId).toBe('clay');
    expect(DATA.refs.some((r) => r.id === state.selectedRefId)).toBe(true);
    expect(DATA.palettes.some((p) => p.id === state.selectedPaletteId)).toBe(true);
    expect(recipeReadiness(state).ready).toBe(true);
    useStudioStore.getState().reset();
  });

  it('keeps edited image prompts in the IMAGE handoff and restores generated prompt on reset', () => {
    const scene = generatedScene();
    const edited = applyPromptOverride(scene, 'USER LOCKED PROMPT');
    expect(edited.userImagePrompt).toBe('USER LOCKED PROMPT');
    expect(edited.handoff.IMAGE.draft.previewPrompt).toBe('USER LOCKED PROMPT');

    const reset = applyPromptOverride(edited, null);
    expect(reset.userImagePrompt).toBeUndefined();
    expect(reset.handoff.IMAGE.draft.previewPrompt).toBe(scene.imagePrompt);
  });

  it('drops stale v1 scenes that cannot satisfy the current runtime schema', () => {
    const migrated = migratePersistedState({
      projectTopic: 'koru',
      scenes: [{ id: 1, imagePrompt: 'legacy' }],
      agentBrief: 'legacy brief',
      selectedSceneId: 1,
    });
    expect(migrated.projectTopic).toBe('koru');
    expect(migrated.scenes).toEqual([]);
    expect(migrated.agentBrief).toBe('');
    expect(migrated.selectedSceneId).toBeNull();
  });
});
