import { describe, it, expect } from 'vitest';
import { PHASE0_VIDEO, PHASE0_DESIGN } from './presets';
import SURGERY_DATA from '../core/SURGERY_DATA.json';

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
});
