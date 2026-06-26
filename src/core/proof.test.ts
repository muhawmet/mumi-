import { describe, it, expect } from 'vitest';
import { quantumScore, qaScore, proofDoctor } from './proof';
import SURGERY_DATA from './SURGERY_DATA.json';

describe('Proof & Quality', () => {
  describe('qaScore', () => {
    it('returns low score for contaminated prompt', () => {
      const score = qaScore('Make it look like Luffy on the Thousand Sunny, 4k cinematic');
      expect(score).toBeLessThan(50);
    });

    it('returns high score for clean prompt', () => {
      const score = qaScore('Ultra-real premium commercial studio frame, exact product geometry locked, macro 100mm lens, clean black negative space, controlled gold rim light across aramid fiber texture, crisp edge highlights.');
      expect(score).toBeGreaterThanOrEqual(90);
    });

    it('does not penalize exclusions in the negative-prompt clause', () => {
      const score = qaScore('Premium soft-clay educational diorama, clean cinematic composition. Negative: generic real corporate defaults, Pixar copy, stunning 4K.');
      expect(score).toBe(100);
    });
  });

  describe('quantumScore', () => {
    it('is monotonic with completeness', () => {
      const emptyState = quantumScore({
        rawSource: '',
        sourceBeats: [],
        scenes: [],
        projectTopic: '',
        selectedWorldId: '',
        selectedRefIds: [],
        selectedPaletteId: '',
      });

      const partialState = quantumScore({
        rawSource: 'Some text',
        sourceBeats: [{ id: 'b1', text: 'Some text', start: 0, end: 9, hash: 'x' }],
        scenes: [],
        projectTopic: 'Topic',
        selectedWorldId: 'world',
        selectedRefIds: [],
        selectedPaletteId: '',
      });

      const fullState = quantumScore({
        rawSource: 'Some text',
        sourceBeats: [{ id: 'b1', text: 'Some text', start: 0, end: 9, hash: 'x' }],
        scenes: [{ id: 1, durationSec: 3 }],
        projectTopic: 'Topic',
        selectedWorldId: 'world',
        selectedRefIds: ['ref'],
        selectedPaletteId: 'palette',
      });

      expect(emptyState).toBeLessThan(partialState);
      expect(partialState).toBeLessThan(fullState);
    });
  });

  describe('proofDoctor detailed regressions', () => {
    it('returns PASS for clean prompt', () => {
      const findings = proofDoctor({ type: 'scene', text: 'Ultra-real premium commercial studio frame, exact product geometry locked.' });
      expect(findings).toEqual(expect.arrayContaining([
        expect.objectContaining({ status: 'PASS' })
      ]));
    });

    // 1. reg_real_path_contamination tests
    it('reg_real_path_contamination: triggers FAIL when real path contains clay/Pixar/diorama without hybridMode', () => {
      const findings = proofDoctor({
        type: 'scene',
        text: 'Ultra-real commercial diorama, Pixar features',
        hybridMode: false,
      });
      const finding = findings.find(f => f.problem === 'Real Path Contamination');
      expect(finding).toBeDefined();
      expect(finding?.status).toBe('FAIL');
      expect(finding?.replaceWith).toBeUndefined();
    });

    it('reg_real_path_contamination: safe counterexample with hybridMode=true', () => {
      const findings = proofDoctor({
        type: 'scene',
        text: 'Ultra-real commercial diorama, Pixar features',
        hybridMode: true,
      });
      const finding = findings.find(f => f.problem === 'Real Path Contamination');
      expect(finding).toBeUndefined();
    });

    it('reg_real_path_contamination: negative-clause counterexample does not trigger', () => {
      const findings = proofDoctor({
        type: 'scene',
        text: 'Ultra-real commercial frame. Negative: clay, Pixar, diorama',
        hybridMode: false,
      });
      const finding = findings.find(f => f.problem === 'Real Path Contamination');
      expect(finding).toBeUndefined();
    });

    // 2. reg_source_loss tests
    it('reg_source_loss: triggers FAIL when sourceCoverage is 99', () => {
      const findings = proofDoctor({
        type: 'scene',
        text: 'Clean prompt text',
        sourceCoverage: 99,
      });
      const finding = findings.find(f => f.problem === 'Source Loss');
      expect(finding).toBeDefined();
      expect(finding?.status).toBe('FAIL');
      expect(finding?.replaceWith).toBeUndefined();
    });

    it('reg_source_loss: passes when sourceCoverage is 100', () => {
      const findings = proofDoctor({
        type: 'scene',
        text: 'Clean prompt text',
        sourceCoverage: 100,
      });
      const finding = findings.find(f => f.problem === 'Source Loss');
      expect(finding).toBeUndefined();
    });

    it('reg_source_loss: passes/skips when sourceCoverage is undefined', () => {
      const findings = proofDoctor({
        type: 'scene',
        text: 'Clean prompt text',
        sourceCoverage: undefined,
      });
      const finding = findings.find(f => f.problem === 'Source Loss');
      expect(finding).toBeUndefined();
    });

    // 3. reg_logo_morph tests
    it('reg_logo_morph: triggers FIX when logo locked and motion text contains warp without freeze/lock', () => {
      const findings = proofDoctor({
        type: 'scene',
        text: 'Clean prompt text',
        hasLockedTextOrLogo: true,
        motionText: 'aggressive warp of the surface',
      });
      const finding = findings.find(f => f.problem === 'Logo/Text Morph Risk');
      expect(finding).toBeDefined();
      expect(finding?.status).toBe('FIX');
      expect(finding?.replaceWith).toBe('freeze logo/text plane; only camera/light/reflection moves.');
    });

    it('reg_logo_morph: passes when hasLockedTextOrLogo=false', () => {
      const findings = proofDoctor({
        type: 'scene',
        text: 'Clean prompt text',
        hasLockedTextOrLogo: false,
        motionText: 'aggressive warp of the surface',
      });
      const finding = findings.find(f => f.problem === 'Logo/Text Morph Risk');
      expect(finding).toBeUndefined();
    });

    it('reg_logo_morph: passes when motion text has freeze/lock protection', () => {
      const findings = proofDoctor({
        type: 'scene',
        text: 'Clean prompt text',
        hasLockedTextOrLogo: true,
        motionText: 'warp but freeze the logo plane',
      });
      const finding = findings.find(f => f.problem === 'Logo/Text Morph Risk');
      expect(finding).toBeUndefined();
    });

    it('reg_logo_morph: passes when motion is camera/light only', () => {
      const findings = proofDoctor({
        type: 'scene',
        text: 'Clean prompt text',
        hasLockedTextOrLogo: true,
        motionText: 'Camera pans slowly, lighting shifts across the surface',
      });
      const finding = findings.find(f => f.problem === 'Logo/Text Morph Risk');
      expect(finding).toBeUndefined();
    });

    // 4. reg_lazy_motion tests
    it('reg_lazy_motion: triggers FIX when motion text has generic slow zoom and no concrete actions', () => {
      const findings = proofDoctor({
        type: 'scene',
        text: 'Clean prompt text',
        motionText: 'Camera slowly zooms in, lights glow, cinematic',
      });
      const finding = findings.find(f => f.problem === 'Lazy Motion');
      expect(finding).toBeDefined();
      expect(finding?.status).toBe('FIX');
      expect(finding?.replaceWith).toBe('add motivated camera arc, physical action, environment reaction, final tail hold.');
    });

    it('reg_lazy_motion: passes when motion text has concrete events or final holds', () => {
      const findings = proofDoctor({
        type: 'scene',
        text: 'Clean prompt text',
        motionText: 'Camera zooms in slowly, then a capsule cracks open and settles with a confident final hold.',
      });
      const finding = findings.find(f => f.problem === 'Lazy Motion');
      expect(finding).toBeUndefined();
    });

    it('reg_lazy_motion: passes for default/generated MAMILAS motion prompt', () => {
      const findings = proofDoctor({
        type: 'scene',
        text: 'Clean prompt text',
        motionText: 'Camera: inside-object vantage gliding along the active channel. Event: capsule cracks open. Rhythm: event completes early, confident final hold.',
      });
      const finding = findings.find(f => f.problem === 'Lazy Motion');
      expect(finding).toBeUndefined();
    });

    // 5. reg_ip_reference tests
    it('reg_ip_reference: triggers FAIL when positive text contains Luffy/Thousand Sunny', () => {
      const findings = proofDoctor({
        type: 'scene',
        text: 'Make it look like Luffy on the Thousand Sunny',
      });
      const finding = findings.find(f => f.problem === 'IP Reference Misuse');
      expect(finding).toBeDefined();
      expect(finding?.status).toBe('FAIL');
      expect(finding?.replaceWith).toBeUndefined();
    });

    it('reg_ip_reference: passes for safe anime descriptions without direct copy', () => {
      const findings = proofDoctor({
        type: 'scene',
        text: 'Bold primary colors, shonen adventure style, high contrast ink shadows',
      });
      const finding = findings.find(f => f.problem === 'IP Reference Misuse');
      expect(finding).toBeUndefined();
    });

    it('reg_ip_reference: passes when Luffy/Sunny are only in negative-clause', () => {
      const findings = proofDoctor({
        type: 'scene',
        text: 'Pirate ship on a beautiful ocean. Negative: no Luffy likeness, avoid Straw Hat logo, avoid Sunny ship copy'
      });
      const finding = findings.find(f => f.problem === 'IP Reference Misuse');
      expect(finding).toBeUndefined();
    });

    // 6. reg_concept_monotony tests (brief-level)
    it('reg_concept_monotony: FIX when a brief reuses one concept across many scenes', () => {
      const text = Array.from({ length: 10 }, () => 'CONCEPT: one civic decision table').join('\n');
      const finding = proofDoctor({ type: 'brief', text }).find((f) => f.problem === 'Concept Monotony');
      expect(finding).toBeDefined();
      expect(finding?.status).toBe('FIX');
    });

    it('reg_concept_monotony: does not fire on scene-level input', () => {
      const text = Array.from({ length: 10 }, () => 'CONCEPT: one civic decision table').join('\n');
      const finding = proofDoctor({ type: 'scene', text }).find((f) => f.problem === 'Concept Monotony');
      expect(finding).toBeUndefined();
    });

    it('reg_concept_monotony: passes when concepts are diverse', () => {
      const text = Array.from({ length: 8 }, (_, i) => `CONCEPT: distinct concept ${i}`).join('\n');
      const finding = proofDoctor({ type: 'brief', text }).find((f) => f.problem === 'Concept Monotony');
      expect(finding).toBeUndefined();
    });

    // 7. reg_fallback_leak tests (brief-level)
    it('reg_fallback_leak: FAIL when generic fallback templates repeat >2 times', () => {
      const text = Array.from({ length: 3 }, () => 'CONCEPT: one sealed capsule object').join('\n');
      const finding = proofDoctor({ type: 'brief', text }).find((f) => f.problem === 'Fallback Leak');
      expect(finding).toBeDefined();
      expect(finding?.status).toBe('FAIL');
    });

    it('reg_fallback_leak: does not fire on scene-level input', () => {
      const text = Array.from({ length: 3 }, () => 'one sealed capsule object').join('\n');
      const finding = proofDoctor({ type: 'scene', text }).find((f) => f.problem === 'Fallback Leak');
      expect(finding).toBeUndefined();
    });

    // Unknown ID test
    it('throws error for unknown regression ID', () => {
      const originalReg = [...SURGERY_DATA.regression];
      SURGERY_DATA.regression.push({
        id: 'reg_unknown_unhandled_id',
        name: 'Unknown Rule',
        input: 'something',
        expected: 'FAIL: unknown'
      });

      try {
        expect(() => {
          proofDoctor({ type: 'scene', text: 'Some text' });
        }).toThrow('Bilinmeyen regression ID: reg_unknown_unhandled_id');
      } finally {
        SURGERY_DATA.regression.length = 0;
        SURGERY_DATA.regression.push(...originalReg);
      }
    });
  });
});
