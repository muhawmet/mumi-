import { describe, expect, it } from 'vitest';
import type { InnerVoiceVerdict } from '../innerVoices';
import { behaviorFor, isCalmState, mergeThoughts, openToastsFor, thoughtKey } from './thoughtQueue';

const v = (tone: InnerVoiceVerdict['tone'], title = 'Başlık'): InnerVoiceVerdict => ({
  voice: 'Logic', tone, title, text: 'metin', evidence: 'kanıt',
});

describe('behaviorFor', () => {
  it('fail otomatik açılır', () => expect(behaviorFor('fail')).toBe('auto-open'));
  it('warn ve spark rozette bekler', () => {
    expect(behaviorFor('warn')).toBe('badge');
    expect(behaviorFor('spark')).toBe('badge');
  });
  it('info ve pass sessizce geçmişe yazılır', () => {
    expect(behaviorFor('info')).toBe('silent');
    expect(behaviorFor('pass')).toBe('silent');
  });
});

describe('mergeThoughts', () => {
  it('yeni verdict düşünce olarak eklenir', () => {
    const merged = mergeThoughts([], [v('fail')], 1000);
    expect(merged).toHaveLength(1);
    expect(merged[0].behavior).toBe('auto-open');
    expect(merged[0].seenAt).toBe(1000);
    expect(merged[0].dismissed).toBe(false);
  });

  it('aynı key ikinci turda yeniden patlamaz (seenAt ve dismissed korunur)', () => {
    const first = mergeThoughts([], [v('fail')], 1000);
    const dismissed = first.map((t) => ({ ...t, dismissed: true }));
    const second = mergeThoughts(dismissed, [v('fail')], 2000);
    expect(second).toHaveLength(1);
    expect(second[0].seenAt).toBe(1000);
    expect(second[0].dismissed).toBe(true);
  });

  it('verdict listeden düşünce kaybolunca düşünce de düşer', () => {
    const first = mergeThoughts([], [v('fail', 'A'), v('warn', 'B')], 1000);
    const second = mergeThoughts(first, [v('warn', 'B')], 2000);
    expect(second).toHaveLength(1);
    expect(second[0].title).toBe('B');
  });

  it('key voice+title ikilisinden üretilir (evidence oynak, kimliğe girmez)', () => {
    expect(thoughtKey(v('fail', 'X'))).toBe('Logic|X');
  });

  it('boş verdict listesi dolu previous karşısında boş döner', () => {
    const previous = mergeThoughts([], [v('fail', 'A'), v('warn', 'B')], 1000);
    expect(mergeThoughts(previous, [], 2000)).toEqual([]);
  });

  it('evidence değişse de voice+title aynıysa kimlik korunur, evidence tazelenir', () => {
    const first = mergeThoughts([], [v('warn', 'A')], 1000);
    const dismissed = first.map((t) => ({ ...t, dismissed: true }));
    const updated: InnerVoiceVerdict = { ...v('warn', 'A'), evidence: 'yeni kanıt %42' };
    const second = mergeThoughts(dismissed, [updated], 2000);
    expect(second).toHaveLength(1);
    expect(second[0].key).toBe(first[0].key);
    expect(second[0].seenAt).toBe(1000);
    expect(second[0].dismissed).toBe(true);
    expect(second[0].evidence).toBe('yeni kanıt %42');
  });

  it('ton warn→fail yükselince behavior auto-open olur, dismissed sıfırlanır, seenAt korunur', () => {
    const first = mergeThoughts([], [v('warn', 'A')], 1000);
    const dismissed = first.map((t) => ({ ...t, dismissed: true }));
    const second = mergeThoughts(dismissed, [v('fail', 'A')], 2000);
    expect(second).toHaveLength(1);
    expect(second[0].behavior).toBe('auto-open');
    expect(second[0].dismissed).toBe(false);
    expect(second[0].seenAt).toBe(1000);
  });

  it('farklı seslerden 3+ düşünce round-trip: sıra verdict dizisini izler, kimlikler korunur', () => {
    const verdicts: InnerVoiceVerdict[] = [
      { voice: 'Logic', tone: 'fail', title: 'A', text: 'metin', evidence: 'k1' },
      { voice: 'Drama', tone: 'warn', title: 'B', text: 'metin', evidence: 'k2' },
      { voice: 'Empathy', tone: 'info', title: 'C', text: 'metin', evidence: 'k3' },
    ];
    const first = mergeThoughts([], verdicts, 1000);
    const reordered = [verdicts[2], verdicts[0], verdicts[1]];
    const second = mergeThoughts(first, reordered, 2000);
    expect(second.map((t) => t.key)).toEqual(['Empathy|C', 'Logic|A', 'Drama|B']);
    expect(second.every((t) => t.seenAt === 1000)).toBe(true);
    expect(second.map((t) => t.behavior)).toEqual(['silent', 'auto-open', 'badge']);
  });
});

describe('sakin mod (taze kullanıcı)', () => {
  const failVerdict: InnerVoiceVerdict = { voice: 'Director', tone: 'fail', title: 'World yok', text: 'x', evidence: '' };

  it('calm=true iken fail rozete düşer, toast açılmaz', () => {
    const merged = mergeThoughts([], [failVerdict], 1000, { calm: true });
    expect(merged[0].behavior).toBe('badge');
    expect(openToastsFor(merged, false)).toHaveLength(0);
  });

  it('calm=false olunca aynı fail auto-open olur (davranış yeniden hesaplanır)', () => {
    const calm = mergeThoughts([], [failVerdict], 1000, { calm: true });
    const active = mergeThoughts(calm, [failVerdict], 2000, { calm: false });
    expect(active[0].behavior).toBe('auto-open');
    expect(active[0].seenAt).toBe(1000); // kimlik korunur
  });

  it('dismissed fail, calm kalkınca yeniden açılmaz (ton değişmedi)', () => {
    const calm = mergeThoughts([], [failVerdict], 1000, { calm: true });
    const dismissed = calm.map((t) => ({ ...t, dismissed: true }));
    const active = mergeThoughts(dismissed, [failVerdict], 2000, { calm: false });
    expect(active[0].dismissed).toBe(true);
  });

  it('opts verilmezse eski davranış (fail → auto-open) korunur', () => {
    const merged = mergeThoughts([], [failVerdict], 1000);
    expect(merged[0].behavior).toBe('auto-open');
  });
});

describe('isCalmState (eylem sinyali)', () => {
  const fresh = { projectTopic: 'Su Döngüsü', rawSource: '', selectedWorldId: '', phase0PresetId: '' };

  it('taze açılış (default topic, her şey boş) → calm', () => {
    expect(isCalmState(fresh, 'Su Döngüsü')).toBe(true);
  });

  it('topic default\'tan farklıysa eylem sayılır → calm değil', () => {
    expect(isCalmState({ ...fresh, projectTopic: 'Fotosentez' }, 'Su Döngüsü')).toBe(false);
  });

  it('topic boşaltılmışsa hâlâ calm (eylem yazmaktır, silmek değil)', () => {
    expect(isCalmState({ ...fresh, projectTopic: '  ' }, 'Su Döngüsü')).toBe(true);
  });

  it('kaynak / world / preset herhangi biri dolunca calm biter', () => {
    expect(isCalmState({ ...fresh, rawSource: 'metin' }, 'Su Döngüsü')).toBe(false);
    expect(isCalmState({ ...fresh, selectedWorldId: 'pixar_3d_edu' }, 'Su Döngüsü')).toBe(false);
    expect(isCalmState({ ...fresh, phase0PresetId: 'egitim' }, 'Su Döngüsü')).toBe(false);
  });
});

describe('openToastsFor (akvaryum kanunu, V3 §6)', () => {
  it('hidden=true → hiç toast (ama düşünceler listede yaşar)', () => {
    const merged = mergeThoughts([], [v('fail', 'A'), v('fail', 'B')], 1000);
    expect(openToastsFor(merged, true)).toHaveLength(0);
    expect(merged).toHaveLength(2);
  });
  it('hidden=false → dismiss edilmemiş auto-open, en fazla 2', () => {
    const merged = mergeThoughts([], [v('fail', 'A'), v('fail', 'B'), v('fail', 'C'), v('warn', 'D')], 1000);
    const open = openToastsFor(merged, false);
    expect(open).toHaveLength(2);
    expect(open.every((t) => t.behavior === 'auto-open')).toBe(true);
  });
});
