import { describe, expect, it } from 'vitest';
import { productionPulse, type ProductionPulseInput } from './productionPulse';

const base: ProductionPulseInput = {
  projectTopic: '',
  rawSource: '',
  sourceReport: null,
  selectedWorldId: '',
  selectedPaletteId: '',
  selectedRefIds: [],
  sceneCount: 5,
  scenes: [],
  agentBrief: '',
  agentPackets: null,
};

describe('productionPulse', () => {
  it('routes an empty project to the brief gate', () => {
    const pulse = productionPulse(base);
    expect(pulse.score).toBe(0);
    expect(pulse.status).toBe('BLOCKED');
    expect(pulse.next.step).toBe('dashboard');
  });

  it('surfaces a partial source ingest before recipe work', () => {
    const pulse = productionPulse({
      ...base,
      projectTopic: 'Su döngüsü',
      rawSource: 'Kanonik metin',
      sourceReport: { ok: false, coverage: 62 },
    });
    expect(pulse.gates[0].score).toBe(62);
    expect(pulse.next.label).toBe('Kaynak kilidini kapat');
  });

  it('shows the exact missing recipe locks', () => {
    const pulse = productionPulse({ ...base, projectTopic: 'Su döngüsü', selectedWorldId: 'clay' });
    expect(pulse.gates[1].score).toBe(33);
    expect(pulse.gates[2].score).toBe(0);
    expect(pulse.next).toEqual({
      step: 'recipe',
      label: 'Reçeteyi tamamla',
      detail: 'Eksik: palet · DNA',
    });
  });

  it('reaches ready only with generated scenes, brief and packets', () => {
    const pulse = productionPulse({
      ...base,
      projectTopic: 'Su döngüsü',
      selectedWorldId: 'clay',
      selectedPaletteId: 'vibrant_clean_education',
      selectedRefIds: ['pixar_dimensional'],
      scenes: [{}, {}, {}, {}, {}],
      agentBrief: 'RENDER LOCK',
      agentPackets: {},
    });
    expect(pulse.score).toBe(100);
    expect(pulse.status).toBe('READY');
    expect(pulse.next.label).toBe('Teslimi aç');
  });
});
