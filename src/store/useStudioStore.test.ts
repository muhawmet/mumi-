import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { createJSONStorage } from 'zustand/middleware';
import { DATA, generateBatch } from '../core/pure';
import {
  applyPromptOverride,
  migratePersistedState,
  presetWithDefaults,
  recipeReadiness,
  scenesWithEffectivePrompts,
  sourceReadiness,
  type Scene,
  useStudioStore,
} from './useStudioStore';
import { dnaDirectives } from '../core/brain';
import { evaluateDirectorCabinet } from '../core/qa';

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
    imageModel: 'nano_banana_2',
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
    onScreenText: scene.onScreenText,
  };
}

describe('studio store helpers', () => {
  it('auto-wires preset defaults and clears stale generation output', () => {
    const preset = presetWithDefaults(
      { projectClass: 'ANIMATION_EDU', selectedWorldId: '' },
      { projectClass: 'ANIMATION_EDU', selectedWorldId: 'pixar_3d_edu', sceneCount: 5 },
    );
    expect(preset.selectedRefIds).toEqual(['pixar_dimensional', 'pixar_emotional_staging', 'soul']);
    expect(DATA.palettes.some((p) => p.id === preset.selectedPaletteId)).toBe(true);
    expect(recipeReadiness({ ...useStudioStore.getState(), ...preset }).ready).toBe(true);
    expect(preset.scenes).toEqual([]);
  });

  it('auto-wires the live store when the world changes', () => {
    useStudioStore.getState().reset();
    useStudioStore.getState().setField('selectedWorldId', 'pixar_3d_edu');
    const state = useStudioStore.getState();
    expect(state.selectedWorldId).toBe('pixar_3d_edu');
    expect(state.selectedRefIds).toEqual(['pixar_dimensional', 'pixar_emotional_staging', 'soul']);
    expect(state.activePreviewRefId).toBe('pixar_dimensional');
    expect(DATA.palettes.some((p) => p.id === state.selectedPaletteId)).toBe(true);
    expect(recipeReadiness(state).ready).toBe(true);
    useStudioStore.getState().reset();
  });

  it('keeps valid DNA selections and updates the active preview', () => {
    useStudioStore.getState().reset();
    useStudioStore.getState().setActivePreviewRefId('one_piece_sunny_adventure');
    useStudioStore.getState().setField('selectedRefIds', ['pixar_dimensional', 'soul']);
    const state = useStudioStore.getState();
    expect(state.selectedRefIds).toEqual(['pixar_dimensional', 'soul']);
    expect(state.activePreviewRefId).toBe('pixar_dimensional');
    useStudioStore.getState().reset();
  });

  it('keeps older persisted DNA selections when their IDs still resolve', () => {
    const migrated = migratePersistedState({
      selectedRefIds: ['pixar_dimensional', 'one_piece_sunny_adventure'],
      activePreviewRefId: '',
    });
    expect(migrated.selectedRefIds).toEqual(['pixar_dimensional', 'one_piece_sunny_adventure']);
    expect(migrated.activePreviewRefId).toBe('pixar_dimensional');
  });

  it('carries a v5 singular selectedRefId into selectedRefIds instead of dropping it', () => {
    const migrated = migratePersistedState({
      selectedRefId: 'pixar_dimensional',
    });
    expect(migrated.selectedRefIds).toEqual(['pixar_dimensional']);
    expect(migrated.activePreviewRefId).toBe('pixar_dimensional');
  });

  it('prefers an existing selectedRefIds array over the v5 singular field', () => {
    const migrated = migratePersistedState({
      selectedRefId: 'soul',
      selectedRefIds: ['pixar_dimensional'],
    });
    expect(migrated.selectedRefIds).toEqual(['pixar_dimensional']);
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

  it('upgrades legacy Kling video models to the current one on load', () => {
    expect(migratePersistedState({ videoModel: 'kling_2_1' }).videoModel).toBe('kling_3');
    expect(migratePersistedState({ videoModel: 'kling_2' }).videoModel).toBe('kling_3');
    expect(migratePersistedState({ videoModel: 'kling' }).videoModel).toBe('kling_3');
    // current and other engines are left untouched
    expect(migratePersistedState({ videoModel: 'kling_3' }).videoModel).toBe('kling_3');
    expect(migratePersistedState({ videoModel: 'kling_4' }).videoModel).toBe('kling_4');
    expect(migratePersistedState({ videoModel: 'runway' }).videoModel).toBe('runway');
    expect(migratePersistedState({}).videoModel).toBe('kling_3');
  });

  it('rejects an empty palette at the recipe gate', () => {
    expect(recipeReadiness({ selectedWorldId: 'pixar_3d_edu', selectedPaletteId: '', subject: 'Konu', recipeScenes: [{} as any] })).toEqual({
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

  it('ingests the raw vault without changing Mami\'s explicit creative selections', () => {
    useStudioStore.getState().reset();
    useStudioStore.setState({
      selectedProjectId: 'product_hero',
      projectClass: 'PRODUCT_HERO',
      selectedWorldId: 'product_brand_real',
      selectedRefIds: ['product_macro'],
      selectedPaletteId: 'native_world',
      projectTopic: 'Mami konusu',
      subject: 'Mami öznesi',
    });
    useStudioStore.getState().setRawSource('3. sınıf su döngüsü dersi. Buhar yükselir!');
    expect(sourceReadiness(useStudioStore.getState()).ready).toBe(false);

    useStudioStore.getState().decodeRawSource();
    useStudioStore.getState().ingestRawSource();
    const state = useStudioStore.getState();
    expect(state.selectedProjectId).toBe('product_hero');
    expect(state.projectClass).toBe('PRODUCT_HERO');
    expect(state.selectedWorldId).toBe('product_brand_real');
    expect(state.selectedRefIds).toEqual(['product_macro']);
    expect(state.selectedPaletteId).toBe('native_world');
    expect(state.projectTopic).toBe('Mami konusu');
    expect(state.subject).toBe('Mami öznesi');
    expect(state.sourceBeats.length).toBeGreaterThan(1);
    expect(state.sourceBeats.map((beat) => beat.exactText).join('')).toBe(state.rawSource);
    expect(state.sourceReport?.coverage).toBe(100);
    expect(sourceReadiness(state).ready).toBe(true);
    useStudioStore.getState().reset();
  });

  it('preserves pasted production dossier SOURCE beats instead of regrouping them', () => {
    useStudioStore.getState().reset();
    const dossier = [
      '# MAMILAS PRODUCTION DOSSIER',
      '- **Path:** ANIMATION_EDU',
      '- **World:** One Piece — Toei Bold-Cel',
      '### Palette as Light',
      'Vibrant Education — shadow #1D3557, mid #F4C430.',
      '[1] ~3s',
      'SOURCE (exact, untouchable): Grup nedir?',
      '[2] ~3s',
      'SOURCE (exact, untouchable):  Rol zamanla değişir.',
      '[3] ~3s',
      'SOURCE (exact, untouchable):  Tebrikler!',
    ].join('\n');

    useStudioStore.getState().setRawSource(dossier);
    useStudioStore.getState().decodeRawSource();
    useStudioStore.getState().ingestRawSource();
    const state = useStudioStore.getState();
    expect(state.projectClass).toBe('ANIMATION_EDU');
    expect(state.selectedWorldId).toBe('one_piece_toei');
    expect(state.selectedPaletteId).toBe('vibrant_edu');
    expect(state.sourceBeats).toHaveLength(3);
    expect(state.sceneCount).toBe(3);
    expect(state.rawSource).toBe('Grup nedir? Rol zamanla değişir. Tebrikler!');
    expect(state.sourceReport?.coverage).toBe(100);
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

  it('G6: kaynak girişte NFC normalize edilir — Windows/Mac (NFD) farkı sessizce bozmaz', () => {
    useStudioStore.getState().reset();
    // NFD form: "ş" = s + combining-cedilla, "ü" = u + combining-diaeresis (Mac kopyala)
    const nfd = 'Sümerá şehri.'.normalize('NFD'); // bilerek NFD
    useStudioStore.getState().setRawSource(nfd);
    const stored = useStudioStore.getState().rawSource;
    expect(stored).toBe(stored.normalize('NFC')); // depoda NFC
    expect(stored.normalize('NFC') === stored).toBe(true);
    // ingest sonrası integrity bozulmaz (raw NFC, beats NFC):
    useStudioStore.getState().ingestRawSource();
    expect(useStudioStore.getState().sourceReport?.ok).toBe(true);
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
    expect(afterSave.vault[0].snapshot.selectedWorldId).toBe('pixar_3d_edu');

    // mutate the live project, then restore from the vault
    const id = afterSave.vault[0].id;
    useStudioStore.getState().setField('projectTopic', 'Bambaşka Konu');
    expect(useStudioStore.getState().projectTopic).toBe('Bambaşka Konu');
    useStudioStore.getState().loadFromVault(id);
    expect(useStudioStore.getState().projectTopic).toBe('Fotosentez Dersi');
    expect(useStudioStore.getState().selectedWorldId).toBe('pixar_3d_edu');

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

  it('recipe readiness no longer depends on Reference DNA', () => {
    expect(recipeReadiness({
      selectedWorldId: 'pixar_3d_edu',
      selectedPaletteId: 'native_world',
      subject: 'Konu',
      recipeScenes: [{ id: 1 } as any],
    })).toEqual({ ready: true, missing: [] });
  });

  it('SURGERY refs carry the active Reference DNA library', () => {
        // 112 → 130: eighteen commercial refs added (2026-07-11). The six COMMERCIAL_REAL worlds —
    // product, corporate, civic, food, sport, edu-promo — had ZERO refs between them, which is
    // to say Mami could not pick a single reference for the work he is actually paid to do.
    // The count is locked so a ref cannot vanish unnoticed; raise it when you add, never lower it.
    expect(DATA.refs.length).toBe(130);
    expect(DATA.refs.some((ref) => ref.id === 'arcane_texture')).toBe(true);
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

  it('manualSplitBeat: allows a byte-safe split even when a PRIOR manual edit already broke integrity (does not blame the split)', () => {
    useStudioStore.getState().reset();
    const raw = 'AAAA BBBB';
    useStudioStore.setState({
      rawSource: raw,
      sourceBeats: [
        { sourceId: 'source-001', exactText: 'AAAA ', start: 0, end: 5, hash: 'a' },
        { sourceId: 'source-002', exactText: 'BBBB', start: 5, end: 9, hash: 'b' },
      ],
    });
    // A prior manual edit on ANOTHER beat breaks integrity without changing length
    // → coverage rounds to %100 while ok=false (exactly what the user saw).
    useStudioStore.getState().updateBeatText(1, 'CCCC');
    expect(useStudioStore.getState().sourceReport?.ok).toBe(false);
    expect(useStudioStore.getState().sourceReport?.coverage).toBe(100);
    const beforeCount = useStudioStore.getState().sourceBeats.length;
    // Splitting beat 0 slices straight from rawSource → byte-safe, must NOT be rejected.
    useStudioStore.getState().manualSplitBeat(0, 2);
    const state = useStudioStore.getState();
    expect(state.sourceBeats.length).toBe(beforeCount + 1);
    expect(state.lastError).not.toBe('Manuel bölme bütünlüğü bozdu (%100).');
    expect(state.sourceBeats[0].exactText + state.sourceBeats[1].exactText).toBe('AAAA ');
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

  /**
   * T2 — REÇETE KABLOSU, MAMI'NİN GERÇEK YOLUNDAN.
   * Kesik tam BURADAydı: `generateScenes` reçetenin subject/location/recipeScenes
   * alanlarını `generateBatch`'e HİÇ geçirmiyordu. `src/core/recipeWiring.test.ts`
   * generateBatch'in kendisini kilitler; bu test RecipeStep'in `setField` çağrısından
   * `agentBrief`'e kadar olan yolu kilitler — brandKitLock sınıfı bir kesik bir daha
   * sessizce açılmasın.
   */
  it('generateScenes: reçetenin subject/location/sahne notları agentBrief\'e ulaşır', () => {
    useStudioStore.getState().reset();
    useStudioStore.getState().setRawSource('Su buharlaşır. Bulut olur.');
    useStudioStore.getState().ingestRawSource();
    useStudioStore.getState().setField('selectedWorldId', 'clay');
    useStudioStore.getState().setField('projectTopic', 'Dashboard Konusu');
    useStudioStore.getState().setField('subject', 'Reçete Konusu');
    useStudioStore.getState().setField('location', 'İstanbul, bir ilkokul sınıfı');
    useStudioStore.getState().setField('recipeScenes', [
      { id: 1, vo: 'Su ısınır.', event: 'buharlaşma', director_note: 'tencere merkezde', motion_seed: 'buhar sarmalı', turkish_labels: ['BUHARLAŞMA'], avoid: ['insan yüzü'] },
    ]);
    useStudioStore.getState().generateScenes();
    const brief = useStudioStore.getState().agentBrief;
    expect(brief).toContain('- **Project:** Reçete Konusu');
    expect(brief).toContain('- **Location:** İstanbul, bir ilkokul sınıfı');
    expect(brief).toContain('tencere merkezde');
    expect(brief).toContain('insan yüzü');
    useStudioStore.getState().reset();
  });
});

describe('beat editörü — el emeği asla sessizce kaybolmaz (kök-fix)', () => {
  const seed = () => {
    useStudioStore.getState().reset();
    useStudioStore.getState().setRawSource('Birinci cümle burada. İkinci cümle burada. Üçüncü cümle burada.');
    useStudioStore.getState().ingestRawSource();
    return useStudioStore.getState();
  };

  it('el ile düzenlenen beat, komşusuyla merge edilince düzenleme korunur', () => {
    const s0 = seed();
    expect(s0.sourceBeats.length).toBeGreaterThanOrEqual(2);
    useStudioStore.getState().updateBeatText(0, 'DÜZENLENMİŞ birinci cümle burada.');
    useStudioStore.getState().mergeBeats(0);
    const merged = useStudioStore.getState().sourceBeats[0];
    expect(merged.exactText).toContain('DÜZENLENMİŞ');
    expect(merged.exactText).toContain('İkinci cümle');
    useStudioStore.getState().reset();
  });

  it('el ile düzenlenen beat, manuel bölmede DÜZENLENMİŞ metinden ve tam cutIndex noktasından bölünür', () => {
    seed();
    const edited = 'Kırmızı balon uçtu. Mavi balon patladı.';
    useStudioStore.getState().updateBeatText(1, edited);
    const cut = edited.indexOf('Mavi');
    useStudioStore.getState().manualSplitBeat(1, cut);
    const st = useStudioStore.getState();
    expect(st.sourceBeats[1].exactText).toBe(edited.slice(0, cut));
    expect(st.sourceBeats[2].exactText).toBe(edited.slice(cut));
    useStudioStore.getState().reset();
  });

  it('SON beat için merge çalışır (önceki ile birleşir, no-op değil)', () => {
    const s0 = seed();
    const n = s0.sourceBeats.length;
    const lastText = s0.sourceBeats[n - 1].exactText;
    useStudioStore.getState().mergeBeats(n - 1);
    const st = useStudioStore.getState();
    expect(st.sourceBeats.length).toBe(n - 1);
    expect(st.sourceBeats[st.sourceBeats.length - 1].exactText).toContain(lastText.trim());
    useStudioStore.getState().reset();
  });

  it('BÖLEMEZSİN (keep) bayrağı split/merge sonrası yeni id\'lere taşınır', () => {
    const s0 = seed();
    const firstId = s0.sourceBeats[0].sourceId;
    useStudioStore.getState().toggleBeatKeep(firstId);
    // merge 0+1: merged beat keep'i taşımalı
    useStudioStore.getState().mergeBeats(0);
    const afterMerge = useStudioStore.getState();
    const mergedId = afterMerge.sourceBeats[0].sourceId;
    expect(afterMerge.beatKeeps[mergedId]).toBe(true);
    // manuel böl: her iki çocuk da keep taşımalı
    const seg = afterMerge.sourceBeats[0].exactText;
    const cut = seg.indexOf('İkinci');
    useStudioStore.getState().manualSplitBeat(0, cut);
    const afterSplit = useStudioStore.getState();
    expect(afterSplit.beatKeeps[afterSplit.sourceBeats[0].sourceId]).toBe(true);
    expect(afterSplit.beatKeeps[afterSplit.sourceBeats[1].sourceId]).toBe(true);
    useStudioStore.getState().reset();
  });
});

describe('regroup yolları (setBeatMode / videoModel) — el emeği ve undo geçmişi korunur', () => {
  const seed = () => {
    useStudioStore.getState().reset();
    useStudioStore.getState().setRawSource('Birinci cümle burada. İkinci cümle burada. Üçüncü cümle burada.');
    useStudioStore.getState().ingestRawSource();
    return useStudioStore.getState();
  };

  it('setBeatMode regroup öncesi snapshot alır — undo el emeğini geri getirir', () => {
    seed();
    useStudioStore.getState().mergeBeats(0);
    const beatsAfterMerge = [...useStudioStore.getState().sourceBeats];
    useStudioStore.getState().setBeatMode('Ekonomik');
    expect(useStudioStore.getState().sourceBeats).not.toEqual(beatsAfterMerge);
    useStudioStore.getState().undoBeatAction();
    const st = useStudioStore.getState();
    expect(st.sourceBeats).toEqual(beatsAfterMerge);
    expect(st.sceneCount).toBe(beatsAfterMerge.length);
    useStudioStore.getState().reset();
  });

  it('videoModel değişimi history\'yi SİLMEZ, snapshot ekler — undo son düzenlemeyi getirir', () => {
    seed();
    useStudioStore.getState().updateBeatText(0, 'DÜZENLENMİŞ birinci cümle burada.');
    useStudioStore.getState().setField('videoModel', 'seedance_2');
    expect(useStudioStore.getState().beatHistory.length).toBeGreaterThan(0);
    useStudioStore.getState().undoBeatAction();
    expect(useStudioStore.getState().sourceBeats[0].exactText).toContain('DÜZENLENMİŞ');
    useStudioStore.getState().reset();
  });

  it('setBeatMode regroup stale beatKeeps\'i temizler (pozisyonel id çakışması sızmaz)', () => {
    const s0 = seed();
    useStudioStore.getState().toggleBeatKeep(s0.sourceBeats[1].sourceId);
    useStudioStore.getState().setBeatMode('Ekonomik');
    expect(useStudioStore.getState().beatKeeps).toEqual({});
    useStudioStore.getState().reset();
  });

  it('undo BÖLEMEZSİN bayrağını da geri getirir (beats + keeps birlikte restore)', () => {
    const s0 = seed();
    const firstId = s0.sourceBeats[0].sourceId;
    useStudioStore.getState().toggleBeatKeep(firstId);
    const seg = useStudioStore.getState().sourceBeats[0].exactText;
    const cut = seg.indexOf('cümle');
    useStudioStore.getState().manualSplitBeat(0, cut);
    // Split parent keep'i siler, çocuklara taşır — undo sonrası parent keep geri gelmeli.
    expect(useStudioStore.getState().beatKeeps[firstId]).toBeUndefined();
    useStudioStore.getState().undoBeatAction();
    expect(useStudioStore.getState().beatKeeps[firstId]).toBe(true);
    useStudioStore.getState().reset();
  });

  it('Manuel modda videoModel değişimi beat/keeps\'e dokunmaz', () => {
    seed();
    useStudioStore.getState().setBeatMode('Manuel');
    useStudioStore.getState().mergeBeats(0);
    const st0 = useStudioStore.getState();
    useStudioStore.getState().toggleBeatKeep(st0.sourceBeats[0].sourceId);
    const beatsBefore = [...useStudioStore.getState().sourceBeats];
    const keepsBefore = { ...useStudioStore.getState().beatKeeps };
    useStudioStore.getState().setField('videoModel', 'seedance_2');
    const st = useStudioStore.getState();
    expect(st.sourceBeats).toEqual(beatsBefore);
    expect(st.beatKeeps).toEqual(keepsBefore);
    useStudioStore.getState().reset();
  });
});

describe('QA/export firewall — el-düzeltilmiş prompt (userImagePrompt) kapıdan KAÇAMAZ', () => {
  it('scenesWithEffectivePrompts userImagePrompt\'u imagePrompt\'a indirger', () => {
    const scene = { ...generatedScene(), userImagePrompt: 'EL İLE YAZILMIŞ #ff0000 prompt' };
    const collapsed = scenesWithEffectivePrompts({ ...useStudioStore.getState(), scenes: [scene] });
    expect(collapsed.scenes[0].imagePrompt).toBe('EL İLE YAZILMIŞ #ff0000 prompt');
  });

  it('ham hex içeren el-prompt, collapse edilmiş state ile Director Cabinet\'te surgeon\'dan FAIL alır', () => {
    const scene = { ...generatedScene(), userImagePrompt: 'A red balloon lit by #ff0000 key light, masterpiece 8k' };
    const raw = { ...useStudioStore.getState(), scenes: [scene], sceneCount: 1 };
    const tips = evaluateDirectorCabinet(scenesWithEffectivePrompts(raw));
    const surgeon = tips.find(t => t.skill === 'prompt_surgeon');
    expect(surgeon).toBeDefined();
    expect(surgeon!.success).toBe(false);
  });
});

describe('typed blockers store köprüsü — site/runner aynı blocker\'ı görür (Codex 5.tur)', () => {
  it('BLOCKED üretimde typed blockers state\'e yazılır, string\'e indirgenmez', () => {
    useStudioStore.getState().reset();
    // Telif sızıntısı → validateBriefCompatibility kesin bloklar (deterministik).
    useStudioStore.getState().setField('selectedWorldId', 'clay');
    useStudioStore.getState().setField('projectClass', 'ANIMATION_EDU');
    useStudioStore.getState().setField('projectTopic', 'Su döngüsü');
    useStudioStore.getState().setField('cast', 'Naruto Uzumaki gibi giyinmiş bir çocuk');
    useStudioStore.getState().generateScenes();
    const state = useStudioStore.getState();
    expect(state.scenes.length).toBe(0);
    expect(state.blockers.length).toBeGreaterThan(0);
    expect(state.blockers[0]).toHaveProperty('requiredEvidence');
    expect(state.blockers[0]).toHaveProperty('allowedResolutions');
    expect(state.blockers.every((b) => b.allowedResolutions.every((r) => !r.preApproved))).toBe(true);
    // İnsan-okur özet de var ama typed veri KAYBOLMADI.
    expect(state.lastError).toBeTruthy();
    useStudioStore.getState().reset();
  });
});
