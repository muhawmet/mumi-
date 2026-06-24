import { describe, it, expect } from 'vitest';
import { PHASE0_VIDEO, PHASE0_DESIGN } from './presets';
import SURGERY_DATA from '../core/SURGERY_DATA.json';
import { CAM_OPTS, LEIT_OPTS, LIGHT_OPTS, MOOD_OPTS, MUS_OPTS, POV_OPTS, SIG_OPTS, TEMPO_OPTS, TRANS_OPTS } from '../core/pure';

describe('Presets to Surgery Data Mapping', () => {
  it('should have valid projectClass references in VIDEO presets', () => {
    const validPaths = SURGERY_DATA.paths.map((p: any) => p.id);
    const validProjects = SURGERY_DATA.projects.map((p: any) => p.path); // Use path mapped from project
    
    // Wait, the sets.projectClass actually points to either a path or a project.
    // In our presets, we used IDs like 'ULTRAREAL_COMMERCIAL', 'ANIMATION_EDU', etc.
    // These match SURGERY_DATA.paths.id
    PHASE0_VIDEO.forEach((preset) => {
      const pClass = preset.sets.projectClass;
      if (pClass) {
        expect(validPaths).toContain(pClass);
      }
    });
  });

  it('should have valid projectClass references in DESIGN presets', () => {
    const validPaths = SURGERY_DATA.paths.map((p: any) => p.id);
    PHASE0_DESIGN.forEach((preset) => {
      const pClass = preset.sets.projectClass;
      if (pClass) {
        expect(validPaths).toContain(pClass);
      }
    });
  });

  it('should not contain any overlapping IDs', () => {
    const ids = [...PHASE0_VIDEO, ...PHASE0_DESIGN].map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('ships an adaptive director panel for every Phase 0 preset', () => {
    [...PHASE0_VIDEO, ...PHASE0_DESIGN].forEach((preset) => {
      expect(preset.directorPanel.thesis.length, preset.id).toBeGreaterThan(20);
      expect(preset.directorPanel.groups.length, preset.id).toBeGreaterThan(0);
      preset.directorPanel.groups.forEach((group) => {
        expect(group.choices.length, `${preset.id}:${group.id}`).toBeGreaterThan(0);
        expect(group.choices.some((choice) => choice.id === group.defaultChoiceId), `${preset.id}:${group.id}`).toBe(true);
      });
    });
  });

  it('uses valid world, palette, reference and director option ids in presets and panel choices', () => {
    const validWorlds = new Set(SURGERY_DATA.worlds.map((item: any) => item.id));
    const validPalettes = new Set(SURGERY_DATA.palettes.map((item: any) => item.id));
    const validRefs = new Set(SURGERY_DATA.refs.map((item: any) => item.id));
    const optionSets = {
      mood: MOOD_OPTS,
      cameraEnergy: CAM_OPTS,
      timeLight: LIGHT_OPTS,
      transition: TRANS_OPTS,
      musicVibe: MUS_OPTS,
      pov: POV_OPTS,
      signature: SIG_OPTS,
      leitmotif: LEIT_OPTS,
      tempoCurve: TEMPO_OPTS,
    } as const;

    const assertSets = (label: string, sets: Record<string, any>) => {
      if (sets.selectedWorldId) expect(validWorlds.has(sets.selectedWorldId), `${label}:world:${sets.selectedWorldId}`).toBe(true);
      if (sets.selectedPaletteId) expect(validPalettes.has(sets.selectedPaletteId), `${label}:palette:${sets.selectedPaletteId}`).toBe(true);
      if (sets.selectedRefIds) {
        sets.selectedRefIds.forEach((id: string) => expect(validRefs.has(id), `${label}:ref:${id}`).toBe(true));
        expect(new Set(sets.selectedRefIds).size, `${label}:duplicate refs`).toBe(sets.selectedRefIds.length);
        expect(sets.selectedRefIds.length, `${label}:max refs`).toBeLessThanOrEqual(3);
      }
      Object.entries(optionSets).forEach(([field, options]) => {
        if (sets[field]) expect(Object.prototype.hasOwnProperty.call(options, sets[field]), `${label}:${field}:${sets[field]}`).toBe(true);
      });
    };

    [...PHASE0_VIDEO, ...PHASE0_DESIGN].forEach((preset) => {
      assertSets(preset.id, preset.sets);
      preset.directorPanel.groups.forEach((group) => {
        group.choices.forEach((choice) => assertSets(`${preset.id}:${group.id}:${choice.id}`, choice.sets));
      });
    });
  });
});
