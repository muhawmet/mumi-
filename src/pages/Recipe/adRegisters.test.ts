import { describe, it, expect } from 'vitest';
import { AD_WORLD_REGISTERS, registersFor } from './adRegisters';
import { DATA, LIGHT_OPTS } from '../../core/pure';

const AD_WORLDS = DATA.worlds.filter((w) => w.group === 'COMMERCIAL_REAL').map((w) => w.id);

describe('reklam register seçici verisi', () => {
  it('her register.timeLight geçerli bir LIGHT_OPTS anahtarı (prompt yoluna geçen ışık brief\'i var)', () => {
    const bad: string[] = [];
    for (const [worldId, regs] of Object.entries(AD_WORLD_REGISTERS)) {
      for (const r of regs) {
        if (!LIGHT_OPTS[r.timeLight]) bad.push(`${worldId}/${r.id}: ${r.timeLight}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('register anahtarlanan her dünya gerçek bir COMMERCIAL_REAL dünyası', () => {
    const keyed = Object.keys(AD_WORLD_REGISTERS);
    expect(keyed.filter((id) => !AD_WORLDS.includes(id))).toEqual([]);
  });

  it('her reklam dünyasının en az 2 register\'ı var + id\'ler dünya içinde tekil', () => {
    for (const worldId of AD_WORLDS) {
      const regs = registersFor(worldId);
      expect(regs.length, worldId).toBeGreaterThanOrEqual(2);
      expect(new Set(regs.map((r) => r.id)).size, worldId).toBe(regs.length);
    }
  });

  it('registersFor bilinmeyen dünyada boş dizi döner', () => {
    expect(registersFor('pixar_3d_edu')).toEqual([]);
  });
});
