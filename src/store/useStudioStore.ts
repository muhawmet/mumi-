import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SceneArchitecture, HandoffPacketSet } from '../core/pure';

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
}

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
    (set) => ({
      ...initial,

      setField: (field, value) => set({ [field]: value } as Partial<StudioState>),
      setScenes: (scenes) => set({ scenes }),
      setCurrentStep: (currentStep) => set({ currentStep }),
      applyPreset: (preset) => set(preset as Partial<StudioState>),
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
