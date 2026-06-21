import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateBatch, type SceneArchitecture, type HandoffPacketSet } from '../core/pure';

export type Step = 'dashboard' | 'recipe' | 'timeline';
export type Cast = 'Aras' | 'Defne' | 'İkisi';

export interface Scene {
  id: number;
  architecture: SceneArchitecture;
  imagePrompt: string;
  voiceOver: string;
  sunoBrief: string;
  durationSec: number;
  intensity: number;
  phaseName: 'Intro' | 'Build-up' | 'Climax' | 'Resolution';
  handoff: HandoffPacketSet;
  /** Optional user-edited override for the image prompt. Export uses this if set. */
  userImagePrompt?: string;
}

/** Returns the prompt that should be used downstream — override wins over generated. */
export const effectivePrompt = (s: Scene): string => s.userImagePrompt ?? s.imagePrompt;

export interface StudioState {
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
  selectedSceneId: null as number | null,
  isGenerating: false,
  lastError: null as string | null,

  currentStep: 'dashboard' as Step,
};

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      ...initial,

      setField: (field, value) => set({ [field]: value } as Partial<StudioState>),
      setScenes: (scenes) => set({ scenes }),
      setCurrentStep: (currentStep) => set({ currentStep }),
      applyPreset: (preset) => set(preset as Partial<StudioState>),

      generateScenes: () => {
        const s = get();
        if (s.isGenerating) return;
        set({ isGenerating: true, lastError: null });
        try {
          const result = generateBatch({
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
              voiceOver: sc.voiceOver,
              sunoBrief: sc.sunoBrief,
              durationSec: sc.durationSec,
              intensity: sc.intensity,
              phaseName: sc.phaseName,
              handoff: sc.handoff,
            }));
            set({
              scenes: adapted,
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
          scenes: s.scenes.map((sc) =>
            sc.id === sceneId
              ? override === null
                ? (() => {
                    const { userImagePrompt: _drop, ...rest } = sc;
                    return rest as Scene;
                  })()
                : { ...sc, userImagePrompt: override }
              : sc,
          ),
        })),

      advance: () => {
        const s = get();
        if (s.currentStep === 'dashboard') {
          set({ currentStep: 'recipe' });
        } else if (s.currentStep === 'recipe') {
          if (s.selectedWorldId) set({ currentStep: 'timeline' });
        } else if (s.currentStep === 'timeline') {
          get().generateScenes();
        }
      },

      reset: () => set(initial),
    }),
    {
      name: 'mamilas-studio-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
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
        selectedSceneId: s.selectedSceneId,
        currentStep: s.currentStep,
      }),
      version: 1,
    },
  ),
);

export type StudioStore = ReturnType<typeof useStudioStore.getState>;
