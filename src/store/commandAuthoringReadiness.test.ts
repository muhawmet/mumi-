import { beforeEach, describe, expect, test } from 'vitest';
import { commandAuthoringReadiness, productionReadiness, useStudioStore, type Scene } from './useStudioStore';

function unauthoredScene(id: number): Scene {
  return {
    id,
    architecture: {} as never,
    imagePrompt: `scene ${id} brief`,
    motionPrompt: '',
    voiceOver: '',
    sunoBrief: '',
    durationSec: 5,
    duration: {} as never,
    intensity: 50,
    phaseName: 'Intro',
    handoff: { IMAGE: { draft: {} }, MOTION: {}, SUNO: {} } as never,
    onScreenText: null,
  };
}

beforeEach(() => {
  useStudioStore.getState().reset();
});

describe('command authoring readiness', () => {
  test('keeps source, recipe, storyboard, and blocker prerequisites closed in order', () => {
    useStudioStore.setState({ rawSource: 'source', sourceReport: null });
    expect(commandAuthoringReadiness(useStudioStore.getState()).stage).toBe('source');

    useStudioStore.setState({ rawSource: '' });
    expect(commandAuthoringReadiness(useStudioStore.getState()).stage).toBe('recipe');

    const store = useStudioStore.getState();
    store.setField('selectedWorldId', 'deakins_naturalist');
    store.setField('selectedPaletteId', 'native_world');
    store.setField('subject', 'Termos');
    store.setField('recipeScenes', [{ id: 1 } as never]);
    expect(commandAuthoringReadiness(useStudioStore.getState()).stage).toBe('storyboard');

    store.setScenes([unauthoredScene(1)]);
    useStudioStore.setState({
      blockers: [{
        scope: 'shot',
        code: 'IDENTITY_UNRESOLVED',
        field: 'cast',
        reason: 'Missing identity evidence',
        requiredEvidence: 'Mami decision',
        allowedResolutions: [],
        blocks: [1],
      }] as never,
    });
    expect(commandAuthoringReadiness(useStudioStore.getState()).stage).toBe('blockers');
  });

  test('opens canonical command export before Image Author prompt while production stays at prompt', () => {
    const store = useStudioStore.getState();
    store.setField('selectedWorldId', 'deakins_naturalist');
    store.setField('selectedPaletteId', 'native_world');
    store.setField('subject', 'Termos');
    store.setField('recipeScenes', [{ id: 1 } as never]);
    store.setScenes([unauthoredScene(1)]);

    const state = useStudioStore.getState();
    expect(commandAuthoringReadiness(state)).toEqual({
      ready: true,
      reason: 'Image Author command girdisi hazır.',
      stage: 'ready',
    });

    const production = productionReadiness(
      state,
      state.currentCommandId(),
      state.currentPromptSourceCommandId(),
    );
    expect(production.ready).toBe(false);
    expect(production.stage).toBe('prompt');
    expect(production.promptMissingShotIds).toEqual([1]);
  });
});
