import { describe, it, expect } from 'vitest';
import { quantumScore, qaScore, proofDoctor } from './proof';

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
  });

  describe('quantumScore', () => {
    it('is monotonic with completeness', () => {
      const emptyState = quantumScore({
        rawSource: '',
        sourceBeats: [],
        scenes: [],
        projectTopic: '',
        selectedWorldId: '',
        selectedRefId: '',
        selectedPaletteId: '',
      });

      const partialState = quantumScore({
        rawSource: 'Some text',
        sourceBeats: [{ id: 'b1', text: 'Some text', start: 0, end: 9, hash: 'x' }],
        scenes: [],
        projectTopic: 'Topic',
        selectedWorldId: 'world',
        selectedRefId: '',
        selectedPaletteId: '',
      });

      const fullState = quantumScore({
        rawSource: 'Some text',
        sourceBeats: [{ id: 'b1', text: 'Some text', start: 0, end: 9, hash: 'x' }],
        scenes: [{ id: 1, durationSec: 3 }],
        projectTopic: 'Topic',
        selectedWorldId: 'world',
        selectedRefId: 'ref',
        selectedPaletteId: 'palette',
      });

      expect(emptyState).toBeLessThan(partialState);
      expect(partialState).toBeLessThan(fullState);
    });
  });

  describe('proofDoctor', () => {
    it('returns PASS for clean prompt', () => {
      const findings = proofDoctor({ type: 'scene', text: 'Ultra-real premium commercial studio frame, exact product geometry locked.' });
      expect(findings).toEqual(expect.arrayContaining([
        expect.objectContaining({ status: 'PASS' })
      ]));
    });

    it('returns FAIL with replacement for contaminated prompt', () => {
      const findings = proofDoctor({ type: 'scene', text: 'Make it look like Luffy on the Thousand Sunny' });
      const failure = findings.find(f => f.status === 'FAIL' || f.status === 'FIX');
      expect(failure).toBeDefined();
      expect(failure?.problem).toContain('IP Reference Misuse');
      expect(failure?.replaceWith).toBeDefined();
    });
  });
});
