import type { SkillId } from '../../core/qa';
import type { InnerVoiceVerdict } from '../innerVoices';

export const VOICE_PORTRAIT: Partial<Record<InnerVoiceVerdict['voice'], { id: string; fallback: string }>> = {
  Volition: { id: 'skill_volition', fallback: 'volition' },
  Perception: { id: 'skill_perception', fallback: 'visual_calculus' },
  Shivers: { id: 'skill_shivers', fallback: 'inland_empire' },
  Logic: { id: 'skill_logic', fallback: 'encyclopedia' },
  'Visual Calculus': { id: 'skill_visual_calculus', fallback: 'visual_calculus' },
  Drama: { id: 'skill_drama', fallback: 'drama' },
  'Case Ledger': { id: 'skill_case_ledger', fallback: 'case_ledger' },
  Rhetoric: { id: 'skill_rhetoric', fallback: 'drama' },
  Electrochemistry: { id: 'skill_electrochemistry', fallback: 'inland_empire' },
  Director: { id: 'kim_kitsuragi', fallback: 'case_ledger' },
};

/** QA Cabinet kadrosu — id = public/assets/characters/<id>.png (kanonik ad).
 * Dosya henüz yoksa AdvisorPortrait sprite fallback'ine düşer; Mami gerçek
 * art'ını aynı adla attığı an kod değişmeden portre devreye girer. */
export const QA_PORTRAIT: Record<SkillId, { id: string; fallback: string }> = {
  visual_calculus: { id: 'skill_visual_calculus', fallback: 'visual_calculus' },
  conceptualization: { id: 'skill_conceptualization', fallback: 'conceptualization' },
  drama: { id: 'skill_drama', fallback: 'drama' },
  encyclopedia: { id: 'skill_encyclopedia', fallback: 'encyclopedia' },
  inland_empire: { id: 'skill_inland_empire', fallback: 'inland_empire' },
  prompt_surgeon: { id: 'skill_prompt_surgeon', fallback: 'visual_calculus' },
  volition: { id: 'skill_volition', fallback: 'volition' },
};

export const FALLBACK_PORTRAIT = { id: 'skill_case_ledger', fallback: 'case_ledger' };

export const TONE_COLOR: Record<InnerVoiceVerdict['tone'], string> = {
  pass: '#93c9a8',
  warn: '#d6a84f',
  fail: '#f26d6d',
  info: '#9c9588',
  spark: '#8fa3c2',
};

export const TONE_LABEL: Record<InnerVoiceVerdict['tone'], string> = {
  pass: 'PASS',
  warn: 'FIX',
  fail: 'FAIL',
  info: 'READ',
  spark: 'WILD',
};
