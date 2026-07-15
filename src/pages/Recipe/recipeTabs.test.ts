import { describe, it, expect } from 'vitest';
import { WORLD_TABS } from './recipeTabs';
import { DATA } from '../../core/pure';

describe('Recipe world tabs coverage', () => {
  it('her SURGERY_DATA world group en az bir sekmede görünür (galeride orphan world grubu olmaz)', () => {
    const tabbedGroups = new Set(WORLD_TABS.flatMap((tab) => tab.groups as readonly string[]));
    const dataGroups = [...new Set(DATA.worlds.map((world) => world.group))];
    const orphaned = dataGroups.filter((group) => !tabbedGroups.has(group));
    expect(orphaned).toEqual([]);
  });

  it('sekme id ve group listeleri boş değil', () => {
    for (const tab of WORLD_TABS) {
      expect(tab.id.length).toBeGreaterThan(0);
      expect(tab.groups.length).toBeGreaterThan(0);
    }
  });
});
