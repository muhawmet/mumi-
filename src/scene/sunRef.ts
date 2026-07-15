import { create } from 'zustand';
import type { Mesh } from 'three';

/** Güneş mesh'i paylaşımlı store — DioramaStage (B2) set eder, PostFX GodRays (B3) okur.
 *  Zustand ile: güneş mesh mount olunca PostFX re-render olur ve GodRays'i geçerli
 *  occluder ile mount eder (null-sun crash'i olmaz; tek <Canvas> içinde köprü). */
interface SunState {
  sun: Mesh | null;
  setSun: (mesh: Mesh | null) => void;
}

export const useSunStore = create<SunState>((set) => ({
  sun: null,
  setSun: (sun) => set({ sun }),
}));
