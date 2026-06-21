import { create } from 'zustand';

export interface Topic {
  id: string;
  name: string;
}

export interface Class {
  id: string;
  name: string;
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  duration?: number;
}

export interface World {
  id: string;
  name: string;
}

export type Step = 'dashboard' | 'recipe' | 'timeline';

interface StudioState {
  topic: Topic | null;
  classData: Class | null;
  sceneCount: number;
  scenes: Scene[];
  selectedWorld: World | null;
  currentStep: Step;

  setTopic: (topic: Topic | null) => void;
  setClassData: (classData: Class | null) => void;
  setSceneCount: (count: number) => void;
  setScenes: (scenes: Scene[]) => void;
  setSelectedWorld: (world: World | null) => void;
  setCurrentStep: (step: Step) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  topic: null,
  classData: null,
  sceneCount: 0,
  scenes: [],
  selectedWorld: null,
  currentStep: 'dashboard',

  setTopic: (topic) => set({ topic }),
  setClassData: (classData) => set({ classData }),
  setSceneCount: (sceneCount) => set({ sceneCount }),
  setScenes: (scenes) => set({ scenes }),
  setSelectedWorld: (selectedWorld) => set({ selectedWorld }),
  setCurrentStep: (currentStep) => set({ currentStep }),
}));
