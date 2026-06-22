import { describe, it, expect } from 'vitest';
import { planBeats, mergeScore } from './beats';

describe('beats.ts - Semantic Beat Planner', () => {
  const shortBeats = [
    { id: '1', text: 'Merhaba, ben anlatıcı.' },
    { id: '2', text: 'Bugün su döngüsünü anlatacağız.' }
  ];

  const longBeats = [
    { id: '1', text: 'Suyun buharlaşıp gökyüzüne yükselmesi ve orada soğuyarak tekrar yeryüzüne inmesi çok uzun ve karmaşık bir süreçtir, çünkü bu döngü binlerce yıldır devam ediyor ve yaşamın kaynağıdır.' }
  ];

  it('calculates mode bounds correctly for Ekonomik', () => {
    const analysis = planBeats(shortBeats, 'Ekonomik');
    expect(analysis.plan.mode).toBe('Ekonomik');
    expect(analysis.plan.min).toBe(3.5);
    expect(analysis.plan.target).toBe(7);
  });

  it('flags over-limit long beats for split', () => {
    const analysis = planBeats(longBeats, 'Hassas');
    // Hassas max is 7s. This text is long enough to exceed 7s.
    const hint = analysis.hints.find(h => h.type === 'split');
    expect(hint).toBeDefined();
    expect(hint?.reason).toContain('bölünmeli');
  });

  it('suggests merge hint on short adjacent beats', () => {
    const analysis = planBeats(shortBeats, 'Ekonomik');
    // 'Merhaba ben anlatıcı' is short and should trigger a merge hint
    const hint = analysis.hints.find(h => h.type === 'merge');
    expect(hint).toBeDefined();
    expect(hint?.reason).toContain('birleşebilir');
  });

  it('calculates savings math correctly', () => {
    // 2 mechanical atoms in shortBeats.
    // 2 mech clips = 2 * 5 = 10s mechGenSec
    const analysis = planBeats(shortBeats, 'Ekonomik', [5, 10]);
    expect(analysis.plan.mechClips).toBe(2);
    expect(analysis.plan.mechGenSec).toBe(10);
    // Actual clips will depend on visual length, for short beats it should be 5s each = 10s total genSec.
    expect(analysis.plan.genSec).toBe(10);
    expect(analysis.plan.savedSec).toBe(0); // If 10s generated, savings is 0.
  });

  it('mergeScore calculation with connector', () => {
    const score = mergeScore('Bu bir deneme.', 'Çünkü öyle gerekiyor.', { min: 3, target: 6, max: 9 });
    // 'Çünkü' is a connector -> +2
    expect(score).toBeGreaterThan(0);
  });
});
