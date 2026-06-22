import SURGERY_DATA from './SURGERY_DATA.json';

export interface ProofFinding {
  status: 'PASS' | 'FIX' | 'FAIL';
  problem?: string;
  why?: string;
  replaceWith?: string;
  verify?: string;
}

export function qaScore(prompt: string): number {
  if (!prompt) return 0;
  
  let score = 100;
  const lower = prompt.toLowerCase();
  
  // Deductions based on regressions
  if (lower.includes('real') && (lower.includes('clay') || lower.includes('pixar') || lower.includes('diorama'))) {
    score -= 25;
  }
  
  // IP / Anime / specific word deductions
  if (lower.includes('luffy') || lower.includes('sunny') || lower.includes('anime')) {
    score -= 50;
  }
  
  if (lower.includes('4k') || lower.includes('cinematic') || lower.includes('stunning')) {
    score -= 15;
  }
  
  // Additions for golden elements
  if (lower.includes('geometry locked') || lower.includes('negative space')) {
    score += 10;
  }
  
  return Math.max(0, Math.min(100, score));
}

export function quantumScore(state: any): number {
  let score = 0;
  if (state.projectTopic && state.projectTopic.length > 0) score += 10;
  if (state.rawSource && state.rawSource.length > 0) score += 20;
  if (state.sourceBeats && state.sourceBeats.length > 0) score += 20;
  if (state.selectedWorldId) score += 10;
  if (state.selectedRefId) score += 10;
  if (state.selectedPaletteId) score += 10;
  if (state.scenes && state.scenes.length > 0) score += 20;
  return score;
}

export function proofDoctor(input: { type: 'scene' | 'brief'; text: string }): ProofFinding[] {
  const findings: ProofFinding[] = [];
  const lower = input.text.toLowerCase();
  
  for (const reg of SURGERY_DATA.regression) {
    let triggered = false;
    
    if (reg.id === 'reg_real_path_contamination' && lower.includes('real') && (lower.includes('clay') || lower.includes('pixar') || lower.includes('diorama'))) {
      triggered = true;
    }
    if (reg.id === 'reg_ip_reference' && (lower.includes('luffy') || lower.includes('sunny'))) {
      triggered = true;
    }
    if (reg.id === 'reg_lazy_motion' && lower.includes('camera slowly zooms in')) {
      triggered = true;
    }
    
    if (triggered) {
      findings.push({
        status: reg.expected.startsWith('FAIL') ? 'FAIL' : 'FIX',
        problem: reg.name,
        why: reg.expected,
        replaceWith: reg.expected.split(': ')[1] || 'Apply exact constraint.',
        verify: 'Ensure no copy of IP or regression remains.'
      });
    }
  }
  
  if (findings.length === 0) {
    findings.push({ status: 'PASS' });
  }
  
  return findings;
}
