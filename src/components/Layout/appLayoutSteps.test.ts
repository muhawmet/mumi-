import { describe, expect, it } from 'vitest';
import { visibleSteps, stageNumber, BASE_STEPS, QA_STEP } from './AppLayout';

describe('visibleSteps', () => {
  it('yönetmen gizliyken numaralar kompakt akar (1,2,3,4)', () => {
    const steps = visibleSteps(BASE_STEPS, QA_STEP, { phase0PresetId: null, currentStep: 'dashboard' });
    expect(steps.map((s) => s.displayIndex)).toEqual([1, 2, 3, 4]);
    expect(steps.find((s) => s.id === 'director')).toBeUndefined();
  });

  it('preset seçiliyken yönetmen görünür, sıra 1..5 ve 2. sıra yönetmen', () => {
    const steps = visibleSteps(BASE_STEPS, QA_STEP, { phase0PresetId: 'egitim', currentStep: 'dashboard' });
    expect(steps.map((s) => s.displayIndex)).toEqual([1, 2, 3, 4, 5]);
    expect(steps[1].id).toBe('director');
  });

  it('currentStep=director iken preset olmasa da yönetmen görünür', () => {
    const steps = visibleSteps(BASE_STEPS, QA_STEP, { phase0PresetId: null, currentStep: 'director' });
    expect(steps.find((s) => s.id === 'director')).toBeDefined();
  });

  it('qa adımındayken QA sona eklenir ve numara zinciri kırılmaz', () => {
    const steps = visibleSteps(BASE_STEPS, QA_STEP, { phase0PresetId: null, currentStep: 'qa' });
    expect(steps[steps.length - 1].id).toBe('qa');
    expect(steps.map((s) => s.displayIndex)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('stageNumber — sayfa başlığı sidebar ile birebir aynı numarayı gösterir', () => {
  it('yönetmen gizliyken reçete=2, sahneler=3, timeline=4', () => {
    expect(stageNumber('dashboard', { phase0PresetId: null, currentStep: 'recipe' })).toBe(1);
    expect(stageNumber('recipe', { phase0PresetId: null, currentStep: 'recipe' })).toBe(2);
    expect(stageNumber('scenes', { phase0PresetId: null, currentStep: 'scenes' })).toBe(3);
    expect(stageNumber('timeline', { phase0PresetId: null, currentStep: 'timeline' })).toBe(4);
  });

  it('preset seçiliyken yönetmen araya girer: yönetmen=2, reçete=3, sahneler=4, timeline=5', () => {
    expect(stageNumber('director', { phase0PresetId: 'egitim', currentStep: 'director' })).toBe(2);
    expect(stageNumber('recipe', { phase0PresetId: 'egitim', currentStep: 'recipe' })).toBe(3);
    expect(stageNumber('scenes', { phase0PresetId: 'egitim', currentStep: 'scenes' })).toBe(4);
    expect(stageNumber('timeline', { phase0PresetId: 'egitim', currentStep: 'timeline' })).toBe(5);
  });

  it('iki farklı STAGE 2 çakışması olmaz: preset açıkken yönetmen 2, reçete 3', () => {
    const opts = { phase0PresetId: 'egitim', currentStep: 'recipe' as const };
    expect(stageNumber('director', opts)).toBe(2);
    expect(stageNumber('recipe', opts)).toBe(3);
    expect(stageNumber('director', opts)).not.toBe(stageNumber('recipe', opts));
  });
});
