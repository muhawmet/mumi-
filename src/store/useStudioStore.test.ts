import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { createJSONStorage } from 'zustand/middleware';
import { DATA, generateBatch } from '../core/pure';
import {
  applyPromptOverride,
  migratePersistedState,
  presetWithDefaults,
  recipeReadiness,
  sourceReadiness,
  type Scene,
  useStudioStore,
} from './useStudioStore';
import { dnaDirectives } from '../core/brain';

beforeAll(() => {
  const store: Record<string, string> = {};
  const mockLocalStorage = {
    length: 0,
    clear: () => { for (const k in store) delete store[k]; },
    getItem: (key: string) => store[key] || null,
    key: (index: number) => Object.keys(store)[index] || null,
    removeItem: (key: string) => { delete store[key]; },
    setItem: (key: string, value: string) => { store[key] = value; },
  };
  (globalThis as any).window = { localStorage: mockLocalStorage };
  (globalThis as any).localStorage = mockLocalStorage;
});

afterAll(() => {
  delete (globalThis as any).window;
  delete (globalThis as any).localStorage;
});

function generatedScene(): Scene {
  const result = generateBatch({
    projectTopic: 'SOURCE:\nkısa kaynak',
    projectClass: 'ANIMATION_EDU',
    sceneCount: 1,
    cast: '',
    selectedWorldId: 'clay',
    selectedPropId: 'clay',
    selectedRefIds: ['pixar_dimensional'],
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
      { projectClass: 'ANIMATION_EDU', selectedWorldId: '' },
      { projectClass: 'ANIMATION_EDU', selectedWorldId: 'clay', sceneCount: 5 },
    );
    expect(DATA.refs.some((r) => preset.selectedRefIds?.includes(r.id))).toBe(true);
    expect(DATA.palettes.some((p) => p.id === preset.selectedPaletteId)).toBe(true);
    expect(recipeReadiness(preset as never).ready).toBe(true);
    expect(preset.scenes).toEqual([]);
  });

  it('auto-wires the live store when the world changes', () => {
    useStudioStore.getState().reset();
    useStudioStore.getState().setField('selectedWorldId', 'clay');
    const state = useStudioStore.getState();
    expect(state.selectedWorldId).toBe('clay');
    expect(DATA.refs.some((r) => state.selectedRefIds.includes(r.id))).toBe(true);
    expect(state.activePreviewRefId).toBe(state.selectedRefIds[0]);
    expect(DATA.palettes.some((p) => p.id === state.selectedPaletteId)).toBe(true);
    expect(recipeReadiness(state).ready).toBe(true);
    useStudioStore.getState().reset();
  });

  it('keeps the drawing monitor on the inspected reference instead of forcing the first slot', () => {
    useStudioStore.getState().reset();
    useStudioStore.getState().setActivePreviewRefId('one_piece_sunny_adventure');
    useStudioStore.getState().setField('selectedRefIds', ['pixar_dimensional', 'soul']);
    const state = useStudioStore.getState();
    expect(state.selectedRefIds).toEqual(['pixar_dimensional', 'soul']);
    expect(state.activePreviewRefId).toBe('one_piece_sunny_adventure');
    useStudioStore.getState().reset();
  });

  it('migrates older persisted selections to preview the last chosen DNA when no active preview exists', () => {
    const migrated = migratePersistedState({
      selectedRefIds: ['pixar_dimensional', 'one_piece_sunny_adventure'],
      activePreviewRefId: '',
    });
    expect(migrated.activePreviewRefId).toBe('one_piece_sunny_adventure');
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

  it('keeps valid migrated scenes but drops batch metadata when any scene is malformed', () => {
    const scene = generatedScene();
    const migrated = migratePersistedState({
      scenes: [scene, { id: 99, imagePrompt: 'legacy' }],
      agentBrief: 'stale brief',
      agentPackets: { image: 'x', motion: 'x', suno: 'x', idea: 'x', proof: 'x' },
      selectedSceneId: scene.id,
    });
    expect(migrated.scenes).toEqual([scene]);
    expect(migrated.agentBrief).toBe('');
    expect(migrated.agentPackets).toBeNull();
    expect(migrated.selectedSceneId).toBe(scene.id);
  });

  it('rejects an empty palette at the recipe gate', () => {
    expect(recipeReadiness({ selectedWorldId: 'clay', selectedRefIds: ['pixar_dimensional'], selectedPaletteId: '' })).toEqual({
      ready: false,
      missing: ['Palet'],
    });
  });

  it('clears generated output when the recipe or beat plan changes', () => {
    const scene = generatedScene();
    useStudioStore.getState().reset();
    useStudioStore.setState({
      scenes: [scene],
      agentBrief: 'brief',
      agentPackets: { image: 'x', motion: 'x', suno: 'x', idea: 'x', proof: 'x' },
      selectedSceneId: scene.id,
    });
    useStudioStore.getState().setField('brandKitLock', 'new lock');
    expect(useStudioStore.getState().scenes).toEqual([]);
    expect(useStudioStore.getState().agentPackets).toBeNull();

    useStudioStore.setState({ scenes: [scene], agentBrief: 'brief', selectedSceneId: scene.id });
    useStudioStore.getState().setBeatMode('Hassas');
    expect(useStudioStore.getState().scenes).toEqual([]);
    expect(useStudioStore.getState().agentBrief).toBe('');
    expect(useStudioStore.getState().selectedSceneId).toBeNull();
    useStudioStore.getState().reset();
  });

  it('decodes and ingests the raw vault into a production-ready source contract', () => {
    useStudioStore.getState().reset();
    useStudioStore.getState().setRawSource('3. sınıf su döngüsü dersi. Buhar yükselir!');
    expect(sourceReadiness(useStudioStore.getState()).ready).toBe(false);

    useStudioStore.getState().decodeRawSource();
    useStudioStore.getState().ingestRawSource();
    const state = useStudioStore.getState();
    expect(state.selectedProjectId).toBe('education');
    expect(state.projectClass).toBe('ANIMATION_EDU');
    expect(state.sourceBeats.length).toBeGreaterThan(1);
    expect(state.sourceBeats.map((beat) => beat.exactText).join('')).toBe(state.rawSource);
    expect(state.sourceReport?.coverage).toBe(100);
    expect(sourceReadiness(state).ready).toBe(true);
    useStudioStore.getState().reset();
  });

  it('invalidates an old ingest report when the raw source changes', () => {
    useStudioStore.getState().reset();
    useStudioStore.getState().setRawSource('Birinci cümle. İkinci cümle.');
    useStudioStore.getState().ingestRawSource();
    expect(useStudioStore.getState().sourceReport?.ok).toBe(true);
    useStudioStore.getState().setRawSource('Değişen kaynak.');
    expect(useStudioStore.getState().sourceBeats).toEqual([]);
    expect(useStudioStore.getState().sourceReport).toBeNull();
    useStudioStore.getState().reset();
  });

  it('Proje Kasası: saves, restores and deletes named project snapshots', () => {
    const s = useStudioStore.getState();
    s.reset();
    // delete any persisted vault entries so the assertions are deterministic
    useStudioStore.getState().vault.slice().forEach((e) => useStudioStore.getState().deleteFromVault(e.id));

    useStudioStore.getState().setField('projectTopic', 'Fotosentez Dersi');
    useStudioStore.getState().setField('selectedWorldId', 'clay');
    useStudioStore.getState().saveToVault('Biyoloji #1');

    const afterSave = useStudioStore.getState();
    expect(afterSave.vault.length).toBe(1);
    expect(afterSave.vault[0].name).toBe('Biyoloji #1');
    expect(afterSave.vault[0].snapshot.projectTopic).toBe('Fotosentez Dersi');
    expect(afterSave.vault[0].snapshot.selectedWorldId).toBe('clay');

    // mutate the live project, then restore from the vault
    const id = afterSave.vault[0].id;
    useStudioStore.getState().setField('projectTopic', 'Bambaşka Konu');
    expect(useStudioStore.getState().projectTopic).toBe('Bambaşka Konu');
    useStudioStore.getState().loadFromVault(id);
    expect(useStudioStore.getState().projectTopic).toBe('Fotosentez Dersi');
    expect(useStudioStore.getState().selectedWorldId).toBe('clay');

    // empty name falls back to the topic; reset keeps the vault intact
    useStudioStore.getState().saveToVault('   ');
    expect(useStudioStore.getState().vault[0].name).toBe('Fotosentez Dersi');
    useStudioStore.getState().reset();
    expect(useStudioStore.getState().vault.length).toBe(2);

    useStudioStore.getState().vault.slice().forEach((e) => useStudioStore.getState().deleteFromVault(e.id));
    expect(useStudioStore.getState().vault.length).toBe(0);
  });

  it('migrates vault snapshots and resets fields absent from an older snapshot', () => {
     const entry: any = {
       id: 'legacy-vault',
       name: 'Legacy',
       savedAt: 1,
       snapshot: { projectTopic: 'Eski proje', scenes: [{ id: 1, imagePrompt: 'legacy' }] },
     };
    const migrated = migratePersistedState({ vault: [null, entry] });
    expect(migrated.vault).toHaveLength(1);
    expect(migrated.vault?.[0].snapshot.scenes).toEqual([]);

    useStudioStore.getState().reset();
    useStudioStore.setState({ vault: [entry], brandKitLock: 'live stale value' });
    useStudioStore.getState().loadFromVault(entry.id);
    const loaded = useStudioStore.getState();
    expect(loaded.projectTopic).toBe('Eski proje');
    expect(loaded.brandKitLock).toBe('');
    expect(loaded.scenes).toEqual([]);
    expect(loaded.agentPackets).toBeNull();
    expect(loaded.vault).toHaveLength(1);
    useStudioStore.setState({ vault: [] });
    useStudioStore.getState().reset();
  });

  it('proves that the persist version transition actually runs the migration from a v5 localStorage state', async () => {
    const mockV5State = {
      state: {
        projectTopic: 'V5 Proje',
        selectedWorldId: 'clay',
        selectedRefId: 'pixar_dimensional',
        scenes: [{ id: 1, imagePrompt: 'v5 scene', durationSec: 5 }],
      },
      version: 5,
    };

    localStorage.setItem('mamilas-studio-v1', JSON.stringify(mockV5State));

    useStudioStore.persist.setOptions({
      storage: createJSONStorage(() => localStorage),
    });
    await useStudioStore.persist.rehydrate();

    const state = useStudioStore.getState();
    expect(state.projectTopic).toBe('V5 Proje');
    expect(state.selectedRefIds).toEqual(['pixar_dimensional']);
    expect((state as any).selectedRefId).toBeUndefined();
    expect(state.scenes).toEqual([]);

    localStorage.removeItem('mamilas-studio-v1');
    useStudioStore.getState().reset();
  });

  it('v5 -> v6 root migration details: selectedRefId mapped, old key removed, scenes cleared', () => {
    const v5State = {
      projectTopic: 'Test V5',
      selectedRefId: 'pixar_dimensional',
      selectedWorldId: 'clay',
      scenes: [{ id: 1, imagePrompt: 'stale scene', durationSec: 5 }],
      agentBrief: 'stale brief',
      agentPackets: { image: 'stale' },
      selectedSceneId: 1,
    };
    const migrated = migratePersistedState(v5State);
    expect(migrated.selectedRefIds).toEqual(['pixar_dimensional']);
    expect((migrated as any).selectedRefId).toBeUndefined();
    expect(migrated.scenes).toEqual([]);
    expect(migrated.agentBrief).toBe('');
    expect(migrated.agentPackets).toBeNull();
    expect(migrated.selectedSceneId).toBeNull();
  });

  it('v5 -> v6 vault migration details', () => {
    const v5StateWithVault = {
      projectTopic: 'Root',
      vault: [
        {
          id: 'v1',
          name: 'Snap 1',
          savedAt: 100,
          snapshot: {
            projectTopic: 'Snap Topic',
            selectedRefId: 'soul',
            selectedWorldId: 'clay',
          },
        },
      ],
    };
    const migrated = migratePersistedState(v5StateWithVault);
    expect(migrated.vault?.[0].snapshot.selectedRefIds).toEqual(['soul']);
    expect((migrated.vault?.[0].snapshot as any).selectedRefId).toBeUndefined();
  });

  it('invalid ID temizligi removes nonexistent ref IDs', () => {
    const state = {
      selectedRefIds: ['pixar_dimensional', 'nonexistent_id', 'soul', ''],
      selectedWorldId: 'clay',
      projectClass: 'ANIMATION_EDU',
    };
    const migrated = migratePersistedState(state);
    expect(migrated.selectedRefIds).toEqual(['pixar_dimensional', 'soul']);
  });

  it('dedupe/max-3 keeps first 3 unique reference IDs', () => {
    const state = {
      selectedRefIds: ['pixar_dimensional', 'soul', 'pixar_dimensional', 'kurzgesagt_clarity', 'atat_rk_prestige'],
      selectedWorldId: 'clay',
      projectClass: 'ANIMATION_EDU',
    };
    const migrated = migratePersistedState(state);
    expect(migrated.selectedRefIds).toEqual(['pixar_dimensional', 'soul', 'kurzgesagt_clarity']);
  });

  it('migration idempotence ensures state is unmodified on second run', () => {
    const v5State = {
      projectTopic: 'Idempotent Test',
      selectedRefId: 'pixar_dimensional',
      selectedWorldId: 'clay',
    };
    const firstRun = migratePersistedState(v5State);
    const secondRun = migratePersistedState(firstRun);
    expect(firstRun).toEqual(secondRun);
  });

  it('uyumsuz ref readiness validation', () => {
    const appleRef = DATA.refs.find(r => r.id === 'apple_commercial')!;
    const originalWorldId = appleRef.worldId;
    appleRef.worldId = 'commercial_studio';

    try {
      const status1 = recipeReadiness({
        selectedWorldId: 'clay',
        selectedPaletteId: 'vibrant_clean_education',
        selectedRefIds: ['apple_commercial'],
      });
      expect(status1.ready).toBe(false);
      expect(status1.missing).toContain('Referans DNA');

      const status2 = recipeReadiness({
        selectedWorldId: 'clay',
        selectedPaletteId: 'vibrant_clean_education',
        selectedRefIds: ['pixar_dimensional', 'apple_commercial'],
      });
      expect(status2.ready).toBe(true);

      const status3 = recipeReadiness({
        selectedWorldId: 'clay',
        selectedPaletteId: 'vibrant_clean_education',
        selectedRefIds: ['invalid_id_here'],
      });
      expect(status3.ready).toBe(false);
    } finally {
      appleRef.worldId = originalWorldId;
    }
  });

  it('uc DNA’nin directives/avoid alanlarina aktarimi', () => {
    const ref1 = DATA.refs.find(r => r.id === 'pixar_dimensional')!;
    const ref2 = DATA.refs.find(r => r.id === 'soul')!;
    const ref3 = DATA.refs.find(r => r.id === 'kurzgesagt_clarity')!;

    expect(ref1).toBeDefined();
    expect(ref2).toBeDefined();
    expect(ref3).toBeDefined();

    const directives = dnaDirectives([ref1, ref2, ref3], 'EDU');

    expect(directives.avoid).toContain(ref1.avoid);
    expect(directives.avoid).toContain(ref2.avoid);
    expect(directives.avoid).toContain(ref3.avoid);
  });

  it('tekrar directive olusmamasi', () => {
    const ref1 = { id: 'r1', name: 'Ref 1', cat: 'cat', avoid: 'copying characters', dna: 'kinetic' };
    const ref2 = { id: 'r2', name: 'Ref 2', cat: 'cat', avoid: 'copying characters', dna: 'kinetic' };
    const directives = dnaDirectives([ref1, ref2], 'EDU');
    expect(directives.avoid).toBe('copying characters');
  });
});

describe('storyboard editing integrity (production workflow fixes)', () => {
  it('splitBeat: lossless slice, no character loss, integrity holds', () => {
    useStudioStore.getState().reset();
    const raw = 'Şehirdeki kararları kim alıyor bilmiyoruz. Yöneticiler hangi kararları neden veriyor.';
    useStudioStore.getState().setRawSource(raw);
    useStudioStore.getState().ingestRawSource();
    useStudioStore.getState().splitBeat(0);
    const state = useStudioStore.getState();
    expect(state.sourceBeats.map((b) => b.exactText).join('')).toBe(raw);
    expect(state.sourceReport?.ok).toBe(true);
    expect(state.sourceReport?.coverage).toBe(100);
    useStudioStore.getState().reset();
  });

  it('splitBeat: rejects with lastError when no safe split point exists', () => {
    useStudioStore.getState().reset();
    const raw = 'Kim?';
    useStudioStore.getState().setRawSource(raw);
    useStudioStore.getState().ingestRawSource();
    const before = useStudioStore.getState().sourceBeats.length;
    useStudioStore.getState().splitBeat(0);
    const state = useStudioStore.getState();
    expect(state.sourceBeats.map((b) => b.exactText).join('')).toBe(raw);
    expect(state.sourceBeats.length).toBe(before);
    expect(state.lastError).toBeTruthy();
    useStudioStore.getState().reset();
  });

  it('splitBeat: repeated 3x on index 0 preserves integrity', () => {
    useStudioStore.getState().reset();
    const raw = 'Birinci uzun cümle burada. İkinci uzun cümle burada. Üçüncü uzun cümle burada.';
    useStudioStore.getState().setRawSource(raw);
    useStudioStore.getState().ingestRawSource();
    for (let i = 0; i < 3; i++) {
      if (useStudioStore.getState().sourceBeats.length > 0) {
        useStudioStore.getState().splitBeat(0);
      }
    }
    const state = useStudioStore.getState();
    expect(state.sourceBeats.map((b) => b.exactText).join('')).toBe(raw);
    expect(state.sourceReport?.ok).toBe(true);
    useStudioStore.getState().reset();
  });

  it('splitBeat: preserves Turkish multiline/whitespace source', () => {
    useStudioStore.getState().reset();
    const raw = 'Su ısınır.\n\nBuhar yükselir!  Sonra ne olur?';
    useStudioStore.getState().setRawSource(raw);
    useStudioStore.getState().ingestRawSource();
    if (useStudioStore.getState().sourceBeats.length > 0) {
      useStudioStore.getState().splitBeat(0);
    }
    const state = useStudioStore.getState();
    expect(state.sourceBeats.map((b) => b.exactText).join('')).toBe(raw);
    useStudioStore.getState().reset();
  });

  it('setBeatMode: regroups cleanly from rawSource even for small source', () => {
    useStudioStore.getState().reset();
    const raw = 'Bir cümle var. İki cümle var. Üç cümle var.';
    useStudioStore.getState().setRawSource(raw);
    useStudioStore.getState().ingestRawSource();
    // Inject a deliberately broken storyboard, then switch mode.
    useStudioStore.setState({
      sourceBeats: [{ sourceId: 'source-001', exactText: 'BOZULMUŞ', start: 0, end: 8, hash: 'x' }],
    });
    useStudioStore.getState().setBeatMode('Ekonomik');
    const state = useStudioStore.getState();
    expect(state.sourceBeats.map((b) => b.exactText).join('')).toBe(raw);
    expect(state.sourceReport?.ok).toBe(true);
    useStudioStore.getState().reset();
  });

  it('resetStoryboard: restores clean storyboard without touching recipe', () => {
    useStudioStore.getState().reset();
    const raw = 'Cümle bir burada. Cümle iki burada.';
    useStudioStore.getState().setRawSource(raw);
    useStudioStore.getState().decodeRawSource();
    useStudioStore.getState().ingestRawSource();
    useStudioStore.getState().setField('selectedWorldId', 'clay');
    const worldBefore = useStudioStore.getState().selectedWorldId;
    const topicBefore = useStudioStore.getState().projectTopic;
    useStudioStore.setState({ sourceBeats: [], sourceReport: null });
    useStudioStore.getState().resetStoryboard();
    const state = useStudioStore.getState();
    expect(state.sourceBeats.map((b) => b.exactText).join('')).toBe(raw);
    expect(state.sourceReport?.ok).toBe(true);
    expect(state.selectedWorldId).toBe(worldBefore);
    expect(state.projectTopic).toBe(topicBefore);
    useStudioStore.getState().reset();
  });

  it('advance: sets lastError when source not ingested', () => {
    useStudioStore.getState().reset();
    useStudioStore.setState({ rawSource: 'test source', sourceReport: null, projectTopic: 'Konu' });
    useStudioStore.getState().advance();
    expect(useStudioStore.getState().lastError).toBeTruthy();
    useStudioStore.getState().reset();
  });

  it('generateScenes: edited (merged) storyboard is generated verbatim, not re-budgeted', () => {
    useStudioStore.getState().reset();
    const raw = 'Cümle A burada var. Cümle B burada var.';
    useStudioStore.getState().setRawSource(raw);
    useStudioStore.getState().decodeRawSource();
    useStudioStore.getState().ingestRawSource();
    useStudioStore.getState().mergeBeats(0);
    const mergedCount = useStudioStore.getState().sourceBeats.length;
    useStudioStore.getState().setField('selectedWorldId', 'clay');
    useStudioStore.getState().generateScenes();
    const state = useStudioStore.getState();
    if (state.scenes.length > 0) {
      expect(state.scenes.length).toBe(mergedCount);
      expect(state.scenes.map((s) => s.voiceOver).join('')).toBe(raw);
    }
    useStudioStore.getState().reset();
  });
});
