import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  generateBatch,
  resolveRecipeDefaults,
  DATA,
  type SceneArchitecture,
  type HandoffPacketSet,
} from '../core/pure';
import type { DurationVerdict } from '../core/brain';
import {
  decodeBrief,
  ingestSource,
  autoGroupBeats,
  sourceIntegrity,
  type SourceBeat,
  type SourceIntegrityReport,
} from '../core/source';
import { planBeats, type BeatMode, type BeatAnalysis } from '../core/beats';

export type Step = 'dashboard' | 'director' | 'recipe' | 'scenes' | 'timeline';
/** Free-text optional character/cast description. Empty = object-only, no character anchor. */
export type Cast = string;
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
export function recipeReadiness(s: Pick<StudioState, 'selectedWorldId' | 'selectedPaletteId' | 'selectedRefIds'>): {
  ready: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  if (!s.selectedWorldId) missing.push('Dünya');
  if (!s.selectedPaletteId) missing.push('Palet');

  const validRefs = (s.selectedRefIds || []).map((id) => DATA.refs.find((r) => r.id === id)).filter(Boolean);
  const compatibleRefs = validRefs.filter((r: any) => !r.worldId || r.worldId === s.selectedWorldId);
  if (compatibleRefs.length === 0) {
    missing.push('Referans DNA');
  }
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
  selectedRefIds: string[];
  activePreviewRefId: string;
  selectedPaletteId: string;
  selectedMusicId: string;

  imageModel: string;
  videoModel: string;
  brandKitLock: string;

  mood: string;
  cameraEnergy: string;
  timeLight: string;
  transition: string;
  musicVibe: string;
  pov: string;
  signature: string;
  leitmotif: string;
  tempoCurve: string;
  phase0PresetId: string;
  directorChoices: Record<string, string>;
  directorBrief: string;

  rawSource: string;
  sourceBeats: SourceBeat[];
  sourceReport: SourceIntegrityReport | null;

  scenes: Scene[];
  agentBrief: string;
  agentPackets: { image: string; motion: string; suno: string; idea: string; proof: string; } | null;
  selectedSceneId: number | null;
  isGenerating: boolean;
  lastError: string | null;

  beatMode: BeatMode;
  workingMode: WorkingMode;
  beatKeeps: Record<string, boolean>;
  beatAnalysis: BeatAnalysis | null;

  currentStep: Step;

  setField: <K extends keyof StudioState>(field: K, value: StudioState[K]) => void;
  setActivePreviewRefId: (id: string) => void;
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

  vault: VaultEntry[];
  saveToVault: (name: string) => void;
  loadFromVault: (id: string) => void;
  deleteFromVault: (id: string) => void;
}

/** A named, restorable snapshot of a full project (legacy "Proje Kasası"). */
export interface VaultEntry {
  id: string;
  name: string;
  savedAt: number;
  snapshot: Partial<StudioState>;
}

const initial = {
  projectKind: 'video' as ProjectKind,
  selectedProjectId: 'education',
  projectTopic: 'Su Döngüsü',
  projectClass: 'ANIMATION_EDU',
  sceneCount: 5,
  cast: '' as Cast,

  selectedWorldId: '',
  selectedPropId: 'native_world',
  selectedRefIds: [] as string[],
  activePreviewRefId: '',
  selectedPaletteId: '',
  selectedMusicId: '',

  imageModel: 'nano_banana_2',
  videoModel: 'kling_3',
  brandKitLock: '',

  mood: '',
  cameraEnergy: '',
  timeLight: '',
  transition: '',
  musicVibe: '',
  pov: '',
  signature: '',
  leitmotif: '',
  tempoCurve: '',
  phase0PresetId: '',
  directorChoices: {} as Record<string, string>,
  directorBrief: '',

  rawSource: '',
  sourceBeats: [] as SourceBeat[],
  sourceReport: null as SourceIntegrityReport | null,

  scenes: [] as Scene[],
  agentBrief: '',
  agentPackets: null as { image: string; motion: string; suno: string; idea: string; proof: string; } | null,
  selectedSceneId: null as number | null,
  isGenerating: false,
  lastError: null as string | null,

  beatMode: 'Dengeli' as BeatMode,
  workingMode: 'Standart' as WorkingMode,
  beatKeeps: {} as Record<string, boolean>,
  beatAnalysis: null as BeatAnalysis | null,

  currentStep: 'dashboard' as Step,

  vault: [] as VaultEntry[],
};

function previewFallbackRefId(refIds: unknown): string {
  if (!Array.isArray(refIds)) return '';
  const validIds = new Set((DATA.refs || []).map((r) => r.id));
  const validRefIds = refIds.filter((id): id is string => typeof id === 'string' && validIds.has(id));
  return validRefIds[validRefIds.length - 1] || '';
}

/** Cleared whenever the recipe or beat plan changes, so generated output never goes stale. */
const STALE_GENERATION: Pick<StudioState, 'scenes' | 'agentBrief' | 'agentPackets' | 'selectedSceneId'> = {
  scenes: [],
  agentBrief: '',
  agentPackets: null,
  selectedSceneId: null,
};

// Above this many sentence atoms, ingest auto-groups into thematic beats
// (keeps short briefs sentence-level so manual beat control is unaffected).
const AUTO_GROUP_THRESHOLD = 12;

/** Single source of truth for the persisted/snapshotted project fields (no vault, no transient flags). */
export function pickProjectState(s: StudioState): Partial<StudioState> {
  return {
    projectKind: s.projectKind,
    selectedProjectId: s.selectedProjectId,
    projectTopic: s.projectTopic,
    projectClass: s.projectClass,
    sceneCount: s.sceneCount,
    cast: s.cast,
    selectedWorldId: s.selectedWorldId,
    selectedPropId: s.selectedPropId,
    selectedRefIds: s.selectedRefIds,
    activePreviewRefId: s.activePreviewRefId,
    selectedPaletteId: s.selectedPaletteId,
    selectedMusicId: s.selectedMusicId,
    imageModel: s.imageModel,
    videoModel: s.videoModel,
    brandKitLock: s.brandKitLock,
    mood: s.mood,
    cameraEnergy: s.cameraEnergy,
    timeLight: s.timeLight,
    transition: s.transition,
    musicVibe: s.musicVibe,
    pov: s.pov,
    signature: s.signature,
    leitmotif: s.leitmotif,
    tempoCurve: s.tempoCurve,
    phase0PresetId: s.phase0PresetId,
    directorChoices: s.directorChoices,
    directorBrief: s.directorBrief,
    rawSource: s.rawSource,
    sourceBeats: s.sourceBeats,
    sourceReport: s.sourceReport,
    scenes: s.scenes,
    agentBrief: s.agentBrief,
    agentPackets: s.agentPackets,
    selectedSceneId: s.selectedSceneId,
    beatMode: s.beatMode,
    workingMode: s.workingMode,
    beatKeeps: s.beatKeeps,
    beatAnalysis: s.beatAnalysis,
    currentStep: s.currentStep,
  };
}

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
    selectedRefIds: preset.selectedRefIds?.length ? preset.selectedRefIds : defaults.selectedRefIds,
    activePreviewRefId: (preset.selectedRefIds?.length ? preset.selectedRefIds[0] : defaults.selectedRefIds[0]) || '',
    selectedPaletteId: preset.selectedPaletteId || defaults.selectedPaletteId,
    ...STALE_GENERATION,
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

function migrateStateV5ToV6(state: any): any {
  if (!state || typeof state !== 'object') return state;

  // 1. Ref DNA Migration
  let refIds: string[] = [];
  const oldRefId = state.selectedRefId;
  if (Array.isArray(state.selectedRefIds)) {
    refIds = [...state.selectedRefIds];
  } else if (typeof oldRefId === 'string' && oldRefId) {
    refIds = [oldRefId];
  }

  // Validate against DATA.refs IDs
  const validIds = new Set((DATA.refs || []).map((r) => r.id));
  refIds = refIds.filter((id) => id && typeof id === 'string' && validIds.has(id));

  // Dedupe
  refIds = Array.from(new Set(refIds));

  // Keep first 3
  refIds = refIds.slice(0, 3);

  // Remove old key
  delete state.selectedRefId;

  // Fallback if empty
  if (refIds.length === 0) {
    const projectClass = state.projectClass || 'ANIMATION_EDU';
    const worldId = state.selectedWorldId || '';
    const defaults = resolveRecipeDefaults(projectClass, worldId);
    refIds = defaults.selectedRefIds || [];
  }

  state.selectedRefIds = refIds;
  state.activePreviewRefId = typeof state.activePreviewRefId === 'string' && validIds.has(state.activePreviewRefId)
    ? state.activePreviewRefId
    : previewFallbackRefId(refIds);

  // 2. Clear old scenes & generation outputs since they contain v5 refDNA
  state.scenes = [];
  state.agentBrief = '';
  state.agentPackets = null;
  state.selectedSceneId = null;

  return state;
}

export function migratePersistedState(value: unknown): Partial<StudioState> {
  if (!value || typeof value !== 'object') return {};
  const persisted = value as any;
  const hasInvalidOrTooManyRefs = Array.isArray(persisted.selectedRefIds) && (
    persisted.selectedRefIds.length > 3 ||
    new Set(persisted.selectedRefIds).size !== persisted.selectedRefIds.length ||
    persisted.selectedRefIds.some((id: any) => !id || typeof id !== 'string' || !DATA.refs.some(r => r.id === id))
  );
  const needsV6Migration = ('selectedRefId' in persisted) || hasInvalidOrTooManyRefs;
  if (needsV6Migration) {
    migrateStateV5ToV6(persisted);
  }

  // Keep only scenes that satisfy the current runtime shape — one malformed scene
  // no longer nukes the whole batch (D3).
  const scenes = Array.isArray(persisted.scenes) ? persisted.scenes.filter(hasCurrentSceneShape) : [];
  const intact = scenes.length === (Array.isArray(persisted.scenes) ? persisted.scenes.length : 0) && scenes.length > 0;

  const vault = Array.isArray(persisted.vault)
    ? persisted.vault.flatMap((entry: any) => {
        if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string') return [];
        return [{ ...entry, snapshot: migratePersistedState(entry.snapshot) }];
      })
    : persisted.vault;

  return {
    ...persisted,
    selectedRefIds: persisted.selectedRefIds || [],
    activePreviewRefId: typeof persisted.activePreviewRefId === 'string' && DATA.refs.some((ref) => ref.id === persisted.activePreviewRefId)
      ? persisted.activePreviewRefId
      : previewFallbackRefId(persisted.selectedRefIds),
    ...(vault ? { vault } : {}),
    scenes,
    // Brief + packets are only trustworthy when the full scene batch survived migration.
    agentBrief: intact && typeof persisted.agentBrief === 'string' ? persisted.agentBrief : '',
    agentPackets: intact ? persisted.agentPackets || null : null,
    selectedSceneId: scenes.some((s: any) => s.id === persisted.selectedSceneId) ? persisted.selectedSceneId ?? null : null,
  };
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      ...initial,

      setField: (field, value) => {
        const s = get();
        const clearGeneration = { scenes: [], agentBrief: '', agentPackets: null, selectedSceneId: null, lastError: null };
        if (field === 'selectedWorldId') {
          const defaults = resolveRecipeDefaults(s.projectClass, String(value));
          set({ selectedWorldId: String(value), ...defaults, activePreviewRefId: defaults.selectedRefIds[0] || '', ...clearGeneration });
          return;
        }
        if (field === 'projectClass') {
          const defaults = resolveRecipeDefaults(String(value), s.selectedWorldId);
          set({ projectClass: String(value), ...defaults, activePreviewRefId: defaults.selectedRefIds[0] || '', ...clearGeneration });
          return;
        }
        if (field === 'selectedRefIds') {
          const refIds = Array.isArray(value) ? value as string[] : [];
          set({
            selectedRefIds: refIds,
            activePreviewRefId: s.activePreviewRefId || previewFallbackRefId(refIds),
            ...clearGeneration,
          });
          return;
        }
        const generationFields: Array<keyof StudioState> = [
          'projectKind', 'projectTopic', 'sceneCount', 'cast', 'selectedPropId',
          'selectedRefIds', 'selectedPaletteId', 'selectedMusicId', 'imageModel', 'videoModel',
          'brandKitLock', 'mood', 'cameraEnergy', 'timeLight', 'transition', 'musicVibe',
          'pov', 'signature', 'leitmotif', 'tempoCurve', 'phase0PresetId', 'directorChoices', 'directorBrief'
        ];
        set({
          ...({ [field]: value } as Partial<StudioState>),
          ...(generationFields.includes(field) ? clearGeneration : {}),
        });
      },
      setActivePreviewRefId: (activePreviewRefId) => set({ activePreviewRefId }),
      setScenes: (scenes) => set({ scenes }),
      setCurrentStep: (currentStep) => set({ currentStep }),
      setRawSource: (rawSource) => set({
        rawSource,
        sourceBeats: [],
        sourceReport: null,
        beatAnalysis: null,
        scenes: [],
        agentBrief: '',
        agentPackets: null,
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
          selectedRefIds: decoded.project.ref ? [decoded.project.ref] : [],
          activePreviewRefId: decoded.project.ref || '',
          selectedPaletteId: decoded.project.palette,
          projectTopic: rawSource.trim().split(/\n+/u)[0]?.slice(0, 160) || get().projectTopic,
          scenes: [],
          agentBrief: '',
          agentPackets: null,
          selectedSceneId: null,
          lastError: null,
        });
      },
      ingestRawSource: () => {
        const s = get();
        const rawSource = s.rawSource;
        const atoms = ingestSource(rawSource);
        // Auto-group granular ingests into thematic beats so a 3-minute script
        // doesn't explode into 50+ scenes. Tiny inputs and Manuel mode stay
        // sentence-level (user keeps full manual control via merge/split).
        const sourceBeats = s.beatMode !== 'Manuel' && atoms.length > AUTO_GROUP_THRESHOLD
          ? autoGroupBeats(rawSource, s.beatMode)
          : atoms;
        const sourceReport = sourceIntegrity(rawSource, sourceBeats);
        const beatAnalysis = planBeats(sourceBeats.map(b => ({ id: b.sourceId, text: b.exactText })), s.beatMode, [5, 10]);
        set({ sourceBeats, sourceReport, sceneCount: Math.max(1, sourceBeats.length || 1), beatAnalysis });
      },
      setBeatMode: (mode) => {
        const s = get();
        // Changing the beat mode re-derives granularity from the original vault
        // when grouping applies; otherwise keep the existing (possibly hand-edited) beats.
        const regroup = !!s.rawSource && mode !== 'Manuel' && ingestSource(s.rawSource).length > AUTO_GROUP_THRESHOLD;
        const sourceBeats = regroup ? autoGroupBeats(s.rawSource, mode) : s.sourceBeats;
        const beatAnalysis = planBeats(sourceBeats.map(b => ({ id: b.sourceId, text: b.exactText })), mode, [5, 10]);
        const regroupPatch = regroup
          ? { sourceBeats, sourceReport: sourceIntegrity(s.rawSource, sourceBeats), sceneCount: Math.max(1, sourceBeats.length || 1) }
          : {};
        set({ beatMode: mode, beatAnalysis, ...regroupPatch, ...STALE_GENERATION });
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
        const exactText = s.rawSource ? s.rawSource.slice(b1.start, b2.end) : b1.exactText + b2.exactText;
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
        set({
          sourceBeats: newBeats,
          sourceReport: s.rawSource ? sourceIntegrity(s.rawSource, newBeats) : s.sourceReport,
          beatAnalysis,
          sceneCount: newBeats.length,
          ...STALE_GENERATION,
        });
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
        set({ sourceBeats: newBeats, beatAnalysis, sceneCount: newBeats.length, ...STALE_GENERATION });
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
            selectedRefIds: s.selectedRefIds,
            selectedPaletteId: s.selectedPaletteId,
            selectedMusicId: s.selectedMusicId,
            imageModel: s.imageModel,
            videoModel: s.videoModel,
            brandKitLock: s.brandKitLock,
            mood: s.mood,
            cameraEnergy: s.cameraEnergy,
            timeLight: s.timeLight,
            transition: s.transition,
            musicVibe: s.musicVibe,
            pov: s.pov,
            signature: s.signature,
            leitmotif: s.leitmotif,
            tempoCurve: s.tempoCurve,
            phase0PresetId: s.phase0PresetId,
            directorChoices: s.directorChoices,
            directorBrief: s.directorBrief,
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
              agentPackets: result.agentPackets ?? null,
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
          if (s.projectTopic.trim() && sourceReadiness(s).ready) set({ currentStep: s.phase0PresetId ? 'director' : 'recipe' });
        } else if (s.currentStep === 'director') {
          set({ currentStep: 'recipe' });
        } else if (s.currentStep === 'recipe') {
          if (recipeReadiness(s).ready) set({ currentStep: 'scenes' });
        } else if (s.currentStep === 'scenes') {
          set({ currentStep: 'timeline' });
        }
      },

      reset: () => set((s) => ({ ...initial, vault: s.vault })),

      saveToVault: (name) => set((s) => {
        const entry: VaultEntry = {
          id: `vault_${Date.now().toString(36)}_${s.vault.length}`,
          name: name.trim() || s.projectTopic.trim() || 'Adsız proje',
          savedAt: Date.now(),
          snapshot: pickProjectState(s),
        };
        return { vault: [entry, ...s.vault] };
      }),
      loadFromVault: (id) => set((s) => {
        const entry = s.vault.find((e) => e.id === id);
        if (!entry) return {};
        return {
          ...initial,
          ...migratePersistedState(entry.snapshot),
          vault: s.vault,
          isGenerating: false,
          lastError: null,
        };
      }),
      deleteFromVault: (id) => set((s) => ({ vault: s.vault.filter((e) => e.id !== id) })),
    }),
    {
      name: 'mamilas-studio-v1',
      storage: createJSONStorage(() => (typeof window === 'undefined' ? serverStorage : window.localStorage)),
      partialize: (s) => ({ ...pickProjectState(s), vault: s.vault }),
      version: 7,
      migrate: (persistedState, version) => {
        if (version < 7) {
          return migratePersistedState(persistedState) as any;
        }
        return persistedState as any;
      },
    },
  ),
);

export type StudioStore = ReturnType<typeof useStudioStore.getState>;
