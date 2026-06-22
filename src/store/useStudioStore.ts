import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  generateBatch,
  resolveRecipeDefaults,
  type SceneArchitecture,
  type HandoffPacketSet,
} from '../core/pure';
import type { DurationVerdict } from '../core/brain';
import {
  decodeBrief,
  ingestSource,
  sourceIntegrity,
  type SourceBeat,
  type SourceIntegrityReport,
} from '../core/source';
import { planBeats, type BeatMode, type BeatAnalysis } from '../core/beats';

export type Step = 'dashboard' | 'recipe' | 'scenes' | 'timeline';
export type Cast = 'Aras' | 'Defne' | 'İkisi';
export type ProjectKind = 'video' | 'design';
export type WorkingMode = 'Hızlı' | 'Standart' | 'Sıkı Teslim';

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
  if (s.selectedPaletteId === null || s.selectedPaletteId === undefined) missing.push('Palet');
  if (!s.selectedRefId) missing.push('Referans DNA');
  return { ready: missing.length === 0, missing };
}

export function sourceReadiness(s: Pick<StudioState, 'rawSource' | 'sourceReport'>): {
  ready: boolean;
  reason: string | null;
} {
  if (!s.rawSource.length) return { ready: true, reason: null };
  if (!s.sourceReport) return { ready: false, reason: 'Kaynak henüz ingest edilmedi.' };
  if (!s.sourceReport.ok) return { ready: false, reason: `Kaynak bütünlüğü ${s.sourceReport.coverage}%; %100 gerekli.` };
  return { ready: true, reason: null };
}

export interface StudioState {
  projectKind: ProjectKind;
  selectedProjectId: string;
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

  rawSource: string;
  sourceBeats: SourceBeat[];
  sourceReport: SourceIntegrityReport | null;

  scenes: Scene[];
  agentBrief: string;
  selectedSceneId: number | null;
  isGenerating: boolean;
  lastError: string | null;

  beatMode: BeatMode;
  workingMode: WorkingMode;
  beatKeeps: Record<string, boolean>;
  beatAnalysis: BeatAnalysis | null;

  currentStep: Step;

  setField: <K extends keyof StudioState>(field: K, value: StudioState[K]) => void;
  setScenes: (scenes: Scene[]) => void;
  setCurrentStep: (step: Step) => void;
  setRawSource: (raw: string) => void;
  decodeRawSource: () => void;
  ingestRawSource: () => void;
  setBeatMode: (mode: BeatMode) => void;
  toggleBeatKeep: (beatId: string) => void;
  mergeBeats: (index: number) => void;
  splitBeat: (index: number) => void;
  applyPreset: (preset: Partial<StudioState>) => void;
  generateScenes: () => void;
  advance: () => void;
  setSceneOverride: (sceneId: number, override: string | null) => void;
  reset: () => void;
}

const initial = {
  projectKind: 'video' as ProjectKind,
  selectedProjectId: 'education',
  projectTopic: 'Su Döngüsü',
  projectClass: 'ANIMATION_EDU',
  sceneCount: 5,
  cast: 'İkisi' as Cast,

  selectedWorldId: '',
  selectedPropId: 'native_world',
  selectedRefId: '',
  selectedPaletteId: '',
  selectedMusicId: '',

  imageModel: 'midjourney_v7',
  videoModel: 'kling_2_1',

  rawSource: '',
  sourceBeats: [] as SourceBeat[],
  sourceReport: null as SourceIntegrityReport | null,

  scenes: [] as Scene[],
  agentBrief: '',
  selectedSceneId: null as number | null,
  isGenerating: false,
  lastError: null as string | null,

  beatMode: 'Dengeli' as BeatMode,
  workingMode: 'Standart' as WorkingMode,
  beatKeeps: {} as Record<string, boolean>,
  beatAnalysis: null as BeatAnalysis | null,

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
      setRawSource: (rawSource) => set({
        rawSource,
        sourceBeats: [],
        sourceReport: null,
        scenes: [],
        agentBrief: '',
        selectedSceneId: null,
        lastError: null,
      }),
      decodeRawSource: () => {
        const rawSource = get().rawSource;
        const decoded = decodeBrief(rawSource);
        set({
          selectedProjectId: decoded.project.id,
          projectClass: decoded.path,
          selectedWorldId: decoded.project.world,
          selectedRefId: decoded.project.ref,
          selectedPaletteId: decoded.project.palette,
          projectTopic: rawSource.trim().split(/\n+/u)[0]?.slice(0, 160) || get().projectTopic,
          scenes: [],
          agentBrief: '',
          selectedSceneId: null,
          lastError: null,
        });
      },
      ingestRawSource: () => {
        const s = get();
        const rawSource = s.rawSource;
        const sourceBeats = ingestSource(rawSource);
        const sourceReport = sourceIntegrity(rawSource, sourceBeats);
        const beatAnalysis = planBeats(sourceBeats.map(b => ({ id: b.sourceId, text: b.exactText })), s.beatMode, [5, 10]);
        set({ sourceBeats, sourceReport, sceneCount: Math.max(1, sourceBeats.length || 1), beatAnalysis });
      },
      setBeatMode: (mode) => {
        const s = get();
        const beatAnalysis = planBeats(s.sourceBeats.map(b => ({ id: b.sourceId, text: b.exactText })), mode, [5, 10]);
        set({ beatMode: mode, beatAnalysis });
      },
      toggleBeatKeep: (beatId) => {
        const s = get();
        const beatKeeps = { ...s.beatKeeps, [beatId]: !s.beatKeeps[beatId] };
        set({ beatKeeps });
      },
      mergeBeats: (index) => {
        const s = get();
        const b1 = s.sourceBeats[index];
        const b2 = s.sourceBeats[index + 1];
        if (!b1 || !b2) return;
        const exactText = b1.exactText + ' ' + b2.exactText;
        const merged: SourceBeat = {
          sourceId: b1.sourceId,
          exactText,
          start: b1.start,
          end: b2.end,
          hash: b1.hash + '-' + b2.hash, // rough proxy
        };
        const newBeats = [...s.sourceBeats];
        newBeats.splice(index, 2, merged);
        const beatAnalysis = planBeats(newBeats.map(b => ({ id: b.sourceId, text: b.exactText })), s.beatMode, [5, 10]);
        set({ sourceBeats: newBeats, beatAnalysis, sceneCount: newBeats.length });
      },
      splitBeat: (index) => {
        const s = get();
        const beat = s.sourceBeats[index];
        if (!beat) return;
        const words = beat.exactText.split(' ');
        const mid = Math.floor(words.length / 2);
        const b1Text = words.slice(0, mid).join(' ');
        const b2Text = words.slice(mid).join(' ');
        
        const b1: SourceBeat = { sourceId: beat.sourceId + '-A', exactText: b1Text, start: beat.start, end: beat.start + b1Text.length, hash: beat.hash + '-A' };
        const b2: SourceBeat = { sourceId: beat.sourceId + '-B', exactText: b2Text, start: beat.start + b1Text.length + 1, end: beat.end, hash: beat.hash + '-B' };
        const newBeats = [...s.sourceBeats];
        newBeats.splice(index, 1, b1, b2);
        const beatAnalysis = planBeats(newBeats.map(b => ({ id: b.sourceId, text: b.exactText })), s.beatMode, [5, 10]);
        set({ sourceBeats: newBeats, beatAnalysis, sceneCount: newBeats.length });
      },
      applyPreset: (preset) => set((s) => presetWithDefaults(s, preset)),

      generateScenes: () => {
        const s = get();
        if (s.isGenerating) return;
        set({ isGenerating: true, lastError: null });
        try {
          const result = generateBatch({
            projectKind: s.projectKind,
            rawSource: s.rawSource,
            sourceBeats: s.sourceBeats,
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
          if (s.projectTopic.trim() && sourceReadiness(s).ready) set({ currentStep: 'recipe' });
        } else if (s.currentStep === 'recipe') {
          if (recipeReadiness(s).ready) set({ currentStep: 'scenes' });
        } else if (s.currentStep === 'scenes') {
          set({ currentStep: 'timeline' });
        }
      },

      reset: () => set(initial),
    }),
    {
      name: 'mamilas-studio-v1',
      storage: createJSONStorage(() => (typeof window === 'undefined' ? serverStorage : window.localStorage)),
      partialize: (s) => ({
        projectKind: s.projectKind,
        selectedProjectId: s.selectedProjectId,
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
        rawSource: s.rawSource,
        sourceBeats: s.sourceBeats,
        sourceReport: s.sourceReport,
        scenes: s.scenes,
        agentBrief: s.agentBrief,
        selectedSceneId: s.selectedSceneId,
        beatMode: s.beatMode,
        workingMode: s.workingMode,
        beatKeeps: s.beatKeeps,
        beatAnalysis: s.beatAnalysis,
        currentStep: s.currentStep,
      }),
      version: 4,
      migrate: (persistedState) => migratePersistedState(persistedState),
    },
  ),
);

export type StudioStore = ReturnType<typeof useStudioStore.getState>;
