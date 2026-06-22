import { describe, it, expect } from 'vitest';
import {
  registerOf, realFamilyOf, conceptRanked, dnaDirectives, durationGuard,
  primeSuno, estimateSec, renderLock, primeCamera, buildAgentBrief,
  buildVariantBriefs, recommendReason
} from './brain';
import { DATA } from './pure';

const clayWorld = DATA.worlds.find((w) => w.id === 'clay')!;
const pixarRef = DATA.refs.find((r) => r.id === 'pixar_dimensional')!;

describe('registerOf', () => {
  it('maps paths to the three registers', () => {
    expect(registerOf('ANIMATION_EDU')).toBe('EDU');
    expect(registerOf('STYLIZED_PREMIUM')).toBe('STY');
    expect(registerOf('ULTRAREAL_COMMERCIAL')).toBe('REAL');
  });
});

describe('conceptRanked (semantic brain)', () => {
  it('detects the water cycle and picks the matching stage, not a generic fallback', () => {
    const c = conceptRanked('Güneş suyu ısıtır ve su buharlaşıp yükselir', 'EDU', 'clay', 'Build-up');
    expect(c[0].matched).toBe(true);
    expect(c[0].subject.toLowerCase()).toContain('sea');
  });

  it('detects math equation source → balance scale concept', () => {
    const c = conceptRanked('iki sayının toplamı eşittir', 'EDU', 'clay', 'Build-up');
    expect(c.some((x) => /balance|tile|grid|scale/i.test(x.subject))).toBe(true);
  });

  it('always returns at least a fallback concept', () => {
    const c = conceptRanked('tamamen alakasız metin', 'EDU', 'clay', 'Intro');
    expect(c.length).toBeGreaterThan(0);
    expect(c[c.length - 1].matched).toBe(false);
  });

  it('real register routes through the world→family bank', () => {
    expect(realFamilyOf('food_macro_real')).toBe('FOOD');
    const c = conceptRanked('espresso fincana dökülüyor', 'REAL', 'food_macro_real', 'Build-up');
    expect(c[0].subject.toLowerCase()).toMatch(/cup|crema|pour/);
  });
});

describe('dnaDirectives', () => {
  it('translates reference DNA into camera/light/staging directives', () => {
    const d = dnaDirectives([pixarRef], 'EDU');
    expect(d.names).toContain('Pixar');
    expect(d.staging).toBeTruthy();
    expect(d.light).toBeTruthy();
  });

  it('falls back to path-native when no refs given', () => {
    const d = dnaDirectives([], 'STY');
    expect(d.names).toBe('path-native');
  });
});

describe('durationGuard (BÖLEMEZSİN)', () => {
  it('passes short narration within the Kling limit', () => {
    const v = durationGuard('Kısa bir cümle.', 'kling_3');
    expect(v.ok).toBe(true);
    expect(v.level).toBe('OK');
  });

  it('flags over-long narration as SPLIT', () => {
    const long = 'kelime '.repeat(40);
    const v = durationGuard(long, 'kling_3');
    expect(v.ok).toBe(false);
    expect(v.message).toContain('BÖLEMEZSİN');
  });

  it('respects the engine usable limit (runway > kling)', () => {
    expect(estimateSec('kelime '.repeat(25))).toBeGreaterThan(8.5);
    const k = durationGuard('kelime '.repeat(25), 'kling_3');
    const r = durationGuard('kelime '.repeat(25), 'runway');
    expect(k.ok).toBe(false);
    expect(r.ok).toBe(true);
  });
});

describe('primeSuno', () => {
  it('returns path-specific musical brief with BPM, not boilerplate', () => {
    const s = primeSuno('ANIMATION_EDU');
    expect(s).toMatch(/BPM/);
    expect(s).toMatch(/no vocals unless requested/);
  });
});

describe('renderLock + primeCamera', () => {
  it('render lock uses the world render recipe verbatim', () => {
    expect(renderLock(clayWorld, 'EDU')).toBe(clayWorld.render);
  });

  it('camera avoids repeating the previous scene index', () => {
    const a = primeCamera(1, 'kaynak bir', 0, 'EDU');
    const b = primeCamera(2, 'kaynak bir', 1, 'EDU', 'kaynak bir', 1);
    expect(a).not.toBe(b);
  });
});

describe('Brand Kit Lock', () => {
  it('injects verbatim brand guidelines into agent brief when locked', () => {
    const brief = buildAgentBrief({
      projectTopic: 'test', productionPath: 'test', register: 'EDU',
      world: clayWorld, dna: { names: 'n', camera: 'c', light: 'l', staging: 's', motion: 'm', texture: 't', avoid: 'a' },
      cast: '', brandKitLock: 'Verbatim Brand Name: Acme. Colors: #ff0000.'
    }, []);
    expect(brief).toContain('== BRAND KIT LOCK ==');
    expect(brief).toContain('Verbatim Brand Name: Acme. Colors: #ff0000.');
  });
});

describe('buildVariantBriefs', () => {
  it('yields exactly 3 briefs differing only in chosen variable', () => {
    const ctx = {
      projectTopic: 'test', productionPath: 'test', register: 'EDU' as const,
      world: clayWorld, dna: { names: 'n', camera: 'c', light: 'l', staging: 's', motion: 'm', texture: 't', avoid: 'a' },
      cast: ''
    };
    const scenes: any[] = [];
    const variants = buildVariantBriefs(ctx, scenes, 'world', [
      clayWorld,
      { ...clayWorld, name: 'B One Step' },
      { ...clayWorld, name: 'C Stronger' }
    ]);
    expect(variants.length).toBe(3);
    expect(variants[0]).toContain(clayWorld.name);
    expect(variants[1]).toContain('B One Step');
    expect(variants[2]).toContain('C Stronger');
  });
});

describe('recommendReason', () => {
  it('generates a smart suggestion based on reference DNA', () => {
    const reason = recommendReason(clayWorld, pixarRef);
    expect(reason).toContain(pixarRef.name);
  });
});
