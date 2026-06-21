import { create } from 'zustand';

export type Step = 'dashboard' | 'recipe' | 'timeline';
export type Cast = 'Aras' | 'Defne' | 'İkisi';

import type { SceneArchitecture } from '../core/pure';

export interface Scene {
  id: number;
  architecture: SceneArchitecture;
  imagePrompt: string;
  voiceOver: string;
  sunoBrief: string;
  durationSec: number;
  intensity: number;
  phaseName: 'Intro' | 'Build-up' | 'Climax' | 'Resolution';
}

export interface StudioState {
  // Stage 1: Brief
  projectTopic: string;
  projectClass: string;
  sceneCount: number;
  cast: Cast;

  // Stage 2: Recipe
  selectedWorldId: string;
  selectedPropId: string;
  selectedRefId: string;
  selectedPaletteId: string;
  selectedMusicId: string;

  // Stage 2b: Models
  imageModel: string;
  videoModel: string;

  // Stage 3: Production
  scenes: Scene[];
  selectedSceneId: number | null;
  isGenerating: boolean;
  lastError: string | null;

  // Navigation
  currentStep: Step;

  // Generic + specific actions
  setField: <K extends keyof StudioState>(field: K, value: StudioState[K]) => void;
  setScenes: (scenes: Scene[]) => void;
  setCurrentStep: (step: Step) => void;
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

export const useStudioStore = create<StudioState>((set) => ({
  ...initial,

  setField: (field, value) => set({ [field]: value } as Partial<StudioState>),
  setScenes: (scenes) => set({ scenes }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  reset: () => set(initial),
}));

export type StudioStore = ReturnType<typeof useStudioStore.getState>;
