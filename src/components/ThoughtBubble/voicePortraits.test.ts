import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CHARACTER_SPRITES } from '../characterSprites';
import { FALLBACK_PORTRAIT, QA_PORTRAIT, VOICE_PORTRAIT } from './voicePortraits';

const QA_SKILLS = [
  'visual_calculus', 'conceptualization', 'drama', 'encyclopedia',
  'inland_empire', 'prompt_surgeon', 'volition',
] as const;

describe('voicePortraits — kadro kapsamı', () => {
  it('QA_PORTRAIT cabinet 7 sesin tamamını kapsar, id kanonik dosya adıdır', () => {
    for (const skill of QA_SKILLS) {
      const entry = QA_PORTRAIT[skill];
      expect(entry, `portrait for ${skill}`).toBeTruthy();
      expect(entry.id).toMatch(/^[a-z_]+$/);
    }
  });

  it('QA_PORTRAIT fallback sprite idleri CHARACTER_SPRITES içinde gerçekten var', () => {
    for (const skill of QA_SKILLS) {
      expect(CHARACTER_SPRITES[QA_PORTRAIT[skill].fallback],
        `sprite for ${QA_PORTRAIT[skill].fallback}`).toBeTruthy();
    }
  });

  it('innerVoices.ts içinde fiilen konuşan HER ses VOICE_PORTRAIT haritasında', () => {
    const src = readFileSync(resolve(__dirname, '../innerVoices.ts'), 'utf8');
    const used = new Set<string>();
    for (const line of src.matchAll(/voice:\s*([^\n]+)/g)) {
      for (const quoted of line[1].matchAll(/'([^']+)'/g)) used.add(quoted[1]);
    }
    expect(used.size).toBeGreaterThanOrEqual(10);
    for (const voice of used) {
      expect((VOICE_PORTRAIT as Record<string, unknown>)[voice], `portrait for voice ${voice}`).toBeTruthy();
    }
  });

  it('VOICE_PORTRAIT fallback sprite idleri de sprite kayıtlarında var', () => {
    for (const [voice, entry] of Object.entries(VOICE_PORTRAIT)) {
      expect(CHARACTER_SPRITES[entry!.fallback], `sprite for ${voice}→${entry!.fallback}`).toBeTruthy();
    }
    expect(CHARACTER_SPRITES[FALLBACK_PORTRAIT.fallback]).toBeTruthy();
  });
});
