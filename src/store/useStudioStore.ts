import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  generateBatch,
  resolveRecipeDefaults,
  type SceneArchitecture,
  type HandoffPacketSet,
} from '../core/pure';
import type { DurationVerdict } from '../core/brain';

export type Step = 'dashboard' | 'recipe' | 'timeline';
export type Cast = 'Aras' | 'Defne' | 'İkisi';
export type ProjectKind = 'video' | 'design';

export interface Scene {
  id: number;
  architecture: SceneArchitecture;
  imagePrompt: string;
  motionPrompt: string;
  voiceOver: string;
  sunoBrief: string;
  durationSec: number;
  duration: DurationVerdict;
  intensity: number;
  phaseName: 'Intro' | 'Build-up' | 'Climax' | 'Resolution';
  handoff: HandoffPacketSet;
  /** Optional user-edited override for the image prompt. Export uses this if set. */
  userImagePrompt?: string;
}

/** Returns the prompt that should be used downstream — override wins over generated. */
export const effectivePrompt = (s: Scene): string => s.userImagePrompt ?? s.imagePrompt;

export function applyPromptOverride(scene: Scene, override: string | null): Scene {
  const imagePrompt = override ?? scene.imagePrompt;
  const handoff = {
    ...scene.handoff,
    IMAGE: {
      ...scene.handoff.IMAGE,
      draft: { ...scene.handoff.IMAGE.draft, previewPrompt: imagePrompt },
    },
  };

  if (override === null) {
    const { userImagePrompt: _drop, ...rest } = scene;
    return { ...rest, handoff } as Scene;
  }
  return { ...scene, userImagePrompt: override, handoff };
}

/** Strict recipe gate — world, palette and reference DNA must all be chosen. */
export function recipeReadiness(s: Pick<StudioState, 'selectedWorldId' | 'selectedPaletteId' | 'selectedRefId'>): {
  ready: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  if (!s.selectedWorldId) missing.push('Dünya');
  if (!s.selectedPaletteId) missing.push('Palet');
  if (!s.selectedRefId) missing.push('Referans DNA');
  return { ready: missing.length === 0, missing };
}

export interface StudioState {
  projectKind: ProjectKind;
  projectTopic: string;
  projectClass: string;
  sceneCount: number;
  cast: Cast;

  selectedWorldId: string;
  selectedPropId: string;
  selectedRefId: string;
  selectedPaletteId: string;
  selectedMusicId: string;

  imageModel: string;
  videoModel: string;

  scenes: Scene[];
  agentBrief: string;
  selectedSceneId: number | null;
  isGenerating: boolean;
  lastError: string | null;

  currentStep: Step;

  setField: <K extends keyof StudioState>(field: K, value: StudioState[K]) => void;
  setScenes: (scenes: Scene[]) => void;
  setCurrentStep: (step: Step) => void;
  applyPreset: (preset: Partial<StudioState>) => void;
  generateScenes: () => void;
  advance: () => void;
  setSceneOverride: (sceneId: number, override: string | null) => void;
  reset: () => void;
}

const initial = {
  projectKind: 'video' as ProjectKind,
  projectTopic: 'Su Döngüsü',
  projectClass: 'EĞİTİM_01',
  sceneCount: 5,
  cast: 'İkisi' as Cast,

  selectedWorldId: '',
  selectedPropId: 'native_world',
  selectedRefId: '',
  selectedPaletteId: '',
  selectedMusicId: '',

  imageModel: 'midjourney_v7',
  videoModel: 'kling_2_1',

  scenes: [] as Scene[],
  agentBrief: '',
  selectedSceneId: null as number | null,
  isGenerating: false,
  lastError: null as string | null,

  currentStep: 'dashboard' as Step,
};

const serverStorage: Storage = {
  length: 0,
  clear: () => undefined,
  getItem: () => null,
  key: () => null,
  removeItem: () => undefined,
  setItem: () => undefined,
};

export function presetWithDefaults(
  current: Pick<StudioState, 'projectClass' | 'selectedWorldId'>,
  preset: Partial<StudioState>,
): Partial<StudioState> {
  const projectClass = preset.projectClass ?? current.projectClass;
  const selectedWorldId = preset.selectedWorldId ?? current.selectedWorldId;
  const defaults = resolveRecipeDefaults(projectClass, selectedWorldId);
  return {
    ...preset,
    selectedRefId: preset.selectedRefId || defaults.selectedRefId,
    selectedPaletteId: preset.selectedPaletteId || defaults.selectedPaletteId,
    scenes: [],
    agentBrief: '',
    selectedSceneId: null,
    lastError: null,
  };
}

function hasCurrentSceneShape(value: unknown): value is Scene {
  if (!value || typeof value !== 'object') return false;
  const scene = value as Partial<Scene>;
  return Boolean(
    typeof scene.motionPrompt === 'string' &&
      scene.duration &&
      typeof scene.duration.sec === 'number' &&
      scene.handoff?.IMAGE?.draft,
  );
}

export function migratePersistedState(value: unknown): Partial<StudioState> {
  if (!value || typeof value !== 'object') return {};
  const persisted = value as Partial<StudioState>;
  const scenes = Array.isArray(persisted.scenes) && persisted.scenes.every(hasCurrentSceneShape)
    ? persisted.scenes
    : [];
  return {
    ...persisted,
    scenes,
    agentBrief: scenes.length && typeof persisted.agentBrief === 'string' ? persisted.agentBrief : '',
    selectedSceneId: scenes.some((s) => s.id === persisted.selectedSceneId) ? persisted.selectedSceneId ?? null : null,
  };
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      ...initial,

      setField: (field, value) => {
        const s = get();
        const clearGeneration = { scenes: [], agentBrief: '', selectedSceneId: null, lastError: null };
        if (field === 'selectedWorldId') {
          const defaults = resolveRecipeDefaults(s.projectClass, String(value));
          set({ selectedWorldId: String(value), ...defaults, ...clearGeneration });
          return;
        }
        if (field === 'projectClass') {
          const defaults = resolveRecipeDefaults(String(value), s.selectedWorldId);
          set({ projectClass: String(value), ...defaults, ...clearGeneration });
          return;
        }
        const generationFields: Array<keyof StudioState> = [
          'projectKind', 'projectTopic', 'sceneCount', 'cast', 'selectedPropId',
          'selectedRefId', 'selectedPaletteId', 'selectedMusicId', 'imageModel', 'videoModel',
        ];
        set({
          ...({ [field]: value } as Partial<StudioState>),
          ...(generationFields.includes(field) ? clearGeneration : {}),
        });
      },
      setScenes: (scenes) => set({ scenes }),
      setCurrentStep: (currentStep) => set({ currentStep }),
      applyPreset: (preset) => set((s) => presetWithDefaults(s, preset)),

      generateScenes: () => {
        const s = get();
        if (s.isGenerating) return;
        set({ isGenerating: true, lastError: null });
        try {
          const result = generateBatch({
            projectKind: s.projectKind,
            projectTopic: s.projectTopic,
            projectClass: s.projectClass,
            sceneCount: s.sceneCount,
            cast: s.cast,
            selectedWorldId: s.selectedWorldId,
            selectedPropId: s.selectedPropId,
            selectedRefId: s.selectedRefId,
            selectedPaletteId: s.selectedPaletteId,
            selectedMusicId: s.selectedMusicId,
            imageModel: s.imageModel,
            videoModel: s.videoModel,
          });
          if (result.status === 'BLOCKED') {
            set({
              lastError: result.contractGate.findings.map((f) => `${f.code}: ${f.message}`).join(' · '),
              scenes: [],
              isGenerating: false,
            });
          } else {
            const adapted: Scene[] = result.scenes.map((sc) => ({
              id: sc.id,
              architecture: sc.architecture,
              imagePrompt: sc.imagePrompt,
              motionPrompt: sc.motionPrompt,
              voiceOver: sc.voiceOver,
              sunoBrief: sc.sunoBrief,
              durationSec: sc.durationSec,
              duration: sc.duration,
              intensity: sc.intensity,
              phaseName: sc.phaseName,
              handoff: sc.handoff,
            }));
            set({
              scenes: adapted,
              agentBrief: result.agentBrief ?? '',
              selectedSceneId: adapted[0]?.id ?? null,
              isGenerating: false,
            });
          }
        } catch (err) {
          set({
            lastError: err instanceof Error ? err.message : String(err),
            isGenerating: false,
          });
        }
      },

      setSceneOverride: (sceneId, override) =>
        set((s) => ({
          scenes: s.scenes.map((sc) => (sc.id === sceneId ? applyPromptOverride(sc, override) : sc)),
        })),

      advance: () => {
        const s = get();
        if (s.currentStep === 'dashboard') {
          if (s.projectTopic.trim()) set({ currentStep: 'recipe' });
        } else if (s.currentStep === 'recipe') {
          // Strict gate: world + palette + reference DNA must all be set (no blind batch).
          if (recipeReadiness(s).ready) set({ currentStep: 'timeline' });
        } else if (s.currentStep === 'timeline') {
          get().generateScenes();
        }
      },

      reset: () => set(initial),
    }),
    {
      name: 'mamilas-studio-v1',
      storage: createJSONStorage(() => (typeof window === 'undefined' ? serverStorage : window.localStorage)),
      partialize: (s) => ({
        projectKind: s.projectKind,
        projectTopic: s.projectTopic,
        projectClass: s.projectClass,
        sceneCount: s.sceneCount,
        cast: s.cast,
        selectedWorldId: s.selectedWorldId,
        selectedPropId: s.selectedPropId,
        selectedRefId: s.selectedRefId,
        selectedPaletteId: s.selectedPaletteId,
        selectedMusicId: s.selectedMusicId,
        imageModel: s.imageModel,
        videoModel: s.videoModel,
        scenes: s.scenes,
        agentBrief: s.agentBrief,
        selectedSceneId: s.selectedSceneId,
        currentStep: s.currentStep,
      }),
      version: 2,
      migrate: (persistedState) => migratePersistedState(persistedState),
    },
  ),
);

export type StudioStore = ReturnType<typeof useStudioStore.getState>;
