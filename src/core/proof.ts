import SURGERY_DATA from './SURGERY_DATA.json';

export interface ProofFinding {
  status: 'PASS' | 'FIX' | 'FAIL';
  problem?: string;
  why?: string;
  replaceWith?: string;
  verify?: string;
}

export interface ProofInput {
  type: 'scene' | 'brief';
  text: string;
  motionText?: string;
  sourceCoverage?: number;
  productionPath?: string;
  hybridMode?: boolean;
  hasLockedTextOrLogo?: boolean;
}

/** Ignore explicit negative-prompt clauses when looking for positive contamination. */
function auditableText(text: string): string {
  if (!text) return '';
  const lower = text.toLowerCase();
  const negativeStart = lower.search(/\bnegative(?:[ -]?prompt)?(?:[ -]?fields?)?\s*:/u);
  return negativeStart >= 0 ? lower.slice(0, negativeStart) : lower;
}

export function qaScore(prompt: string, opts?: { personalMode?: boolean }): number {
  if (!prompt) return 0;

  let score = 100;
  const lower = auditableText(prompt);

  // Deductions based on regressions
  const claimsRealism = /\b(?:ultra[ -]?real|photoreal|realistic|real world|documentary)\b/u.test(lower);
  if (claimsRealism && (lower.includes('clay') || lower.includes('pixar') || lower.includes('diorama'))) {
    score -= 25;
  }

  // Specific IP character references — skipped in personal mode (user owns intent)
  if (!opts?.personalMode) {
    const hasSpecificIP = /\b(?:luffy|one piece|straw hat|thousand sunny|roronoa zoro|nami|usopp|sanji|chopper|robin|franky|brook|shanks|blackbeard|whitebeard|naruto|sasuke|kakashi|sakura|itachi|jiraiya|orochimaru|hinata uzumaki|goku|vegeta|gohan|piccolo|frieza|cell|majin buu|dragon ball|attack on titan|eren yeager|mikasa ackerman|levi ackerman|armin arlert|demon slayer|tanjiro|nezuko|zenitsu|inosuke|giyu|kokushibo|muzan|jujutsu kaisen|satoru gojo|yuji itadori|megumi fushiguro|nobara kugisaki|ryomen sukuna|bleach|ichigo kurosaki|rukia kuchiki|byakuya|sosuke aizen|fairy tail|natsu dragneel|erza scarlet|gray fullbuster|lucy heartfilia|pikachu|charizard|mewtwo|bulbasaur|squirtle|eevee|pokemon|totoro|no face|calcifer|spirited away|howl|howls moving castle|sailor moon|evangelion|asuka langley|rei ayanami|shinji ikari|fullmetal alchemist|edward elric|alphonse elric|roy mustang|death note|light yagami|l lawliet|my hero academia|izuku midoriya|katsuki bakugo|all might|endeavor|sword art online|kirito|asuna)\b/u.test(lower);
    if (hasSpecificIP) {
      score -= 50;
    }
  }
  
  // "cinematic" can be valid when backed by concrete staging; 4K/stunning are empty quality claims.
  if (lower.includes('4k') || lower.includes('stunning')) {
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
  if (state.selectedRefIds && state.selectedRefIds.length > 0) score += 10;
  if (state.selectedPaletteId) score += 10;
  if (state.scenes && state.scenes.length > 0) score += 20;
  return score;
}

type DetectorFunc = (input: ProofInput, reg: any) => ProofFinding | null;

const DETECTORS: Record<string, DetectorFunc> = {
  reg_real_path_contamination: (input, reg) => {
    const positiveText = auditableText(input.text);
    const claimsRealism = /\b(ultra[ -]?real|photoreal|realistic|real world|documentary)\b/i.test(positiveText);
    const hasStylized = /\b(clay|pixar|diorama)\b/i.test(positiveText);
    if (claimsRealism && hasStylized && input.hybridMode !== true) {
      return {
        status: 'FAIL',
        problem: reg.name,
        why: reg.expected,
      };
    }
    return null;
  },
  reg_source_loss: (input, reg) => {
    if (input.sourceCoverage !== undefined && input.sourceCoverage < 100) {
      return {
        status: 'FAIL',
        problem: reg.name,
        why: reg.expected,
      };
    }
    return null;
  },
  reg_logo_morph: (input, reg) => {
    if (input.hasLockedTextOrLogo === true && input.motionText) {
      const motionLower = input.motionText.toLowerCase();
      const hasMorphRisk = /\b(morph|warp|deform|change|aggressive surface|agresif yüzey|agresif hareket|aggressive movement)\b/i.test(motionLower);
      const hasLockProtection = /\b(freeze|lock|frozen|locked)\b/i.test(motionLower);
      if (hasMorphRisk && !hasLockProtection) {
        return {
          status: 'FIX',
          problem: reg.name,
          why: reg.expected,
          replaceWith: 'freeze logo/text plane; only camera/light/reflection moves.',
          verify: 'Ensure logo plane is frozen/locked.'
        };
      }
    }
    return null;
  },
  reg_lazy_motion: (input, reg) => {
    if (input.motionText) {
      const motionLower = input.motionText.toLowerCase();
      const hasLazyTriggers = /\b(slow zoom|slow pan|zoom in|zoom out|lights glow)\b/i.test(motionLower);
      const hasConcreteAction = /\b(hold|settle|event|reaction|motivated camera|physical action|reveal|open|shatter|spin|rotate|flow|fall|rise|glide)\b/i.test(motionLower);
      if (hasLazyTriggers && !hasConcreteAction) {
        return {
          status: 'FIX',
          problem: reg.name,
          why: reg.expected,
          replaceWith: 'add motivated camera arc, physical action, environment reaction, final tail hold.',
          verify: 'Ensure motivated camera arc and physical action are present.'
        };
      }
    }
    return null;
  },
  reg_ip_reference: (input, reg) => {
    const positiveText = auditableText(input.text);
    const hasIP = /\b(?:luffy|one piece|straw hat|thousand sunny|roronoa zoro|nami|usopp|sanji|chopper|robin|franky|brook|shanks|blackbeard|whitebeard|naruto|sasuke|kakashi|sakura|itachi|jiraiya|orochimaru|hinata uzumaki|goku|vegeta|gohan|piccolo|frieza|cell|majin buu|dragon ball|attack on titan|eren yeager|mikasa ackerman|levi ackerman|armin arlert|demon slayer|tanjiro|nezuko|zenitsu|inosuke|giyu|kokushibo|muzan|jujutsu kaisen|satoru gojo|yuji itadori|megumi fushiguro|nobara kugisaki|ryomen sukuna|bleach|ichigo kurosaki|rukia kuchiki|byakuya|sosuke aizen|fairy tail|natsu dragneel|erza scarlet|gray fullbuster|lucy heartfilia|pikachu|charizard|mewtwo|bulbasaur|squirtle|eevee|pokemon|totoro|no face|calcifer|spirited away|howl|howls moving castle|sailor moon|evangelion|asuka langley|rei ayanami|shinji ikari|fullmetal alchemist|edward elric|alphonse elric|roy mustang|death note|light yagami|l lawliet|my hero academia|izuku midoriya|katsuki bakugo|all might|endeavor|sword art online|kirito|asuna)\b/i.test(positiveText);
    if (hasIP) {
      return {
        status: 'FAIL',
        problem: reg.name,
        why: reg.expected,
      };
    }
    return null;
  },
  // Brief-level: many CONCEPT lines but few unique subjects = monotonous brief.
  reg_concept_monotony: (input, reg) => {
    if (input.type !== 'brief') return null;
    const concepts = input.text.match(/CONCEPT:\s*(.+)/gi) || [];
    if (concepts.length <= 5) return null;
    const unique = new Set(concepts.map((c) => c.trim().toLowerCase()));
    if (unique.size / concepts.length < 0.3) {
      return {
        status: 'FIX',
        problem: reg.name,
        why: reg.expected,
        replaceWith: 'kaynak metni daha fazla satıra böl veya konuyu daha spesifik yaz.',
        verify: `${concepts.length} concepts, only ${unique.size} unique.`,
      };
    }
    return null;
  },
  // Brief-level: generic fallback concept templates repeated across scenes.
  reg_fallback_leak: (input, reg) => {
    if (input.type !== 'brief') return null;
    const lower = input.text.toLowerCase();
    const fallbackCount = (lower.match(/sealed capsule object|working model of the core idea|fallback concept — sharpen/g) || []).length;
    if (fallbackCount > 2) {
      return {
        status: 'FAIL',
        problem: reg.name,
        why: reg.expected,
        replaceWith: 'kaynak metnini daha spesifik yeniden yaz veya daha fazla satıra böl.',
        verify: `${fallbackCount} generic fallback concepts detected.`,
      };
    }
    return null;
  }
};

export function proofDoctor(input: ProofInput): ProofFinding[] {
  const findings: ProofFinding[] = [];

  for (const reg of SURGERY_DATA.regression) {
    const detector = DETECTORS[reg.id];
    if (!detector) {
      throw new Error(`Bilinmeyen regression ID: ${reg.id}`);
    }
    const finding = detector(input, reg);
    if (finding) {
      findings.push(finding);
    }
  }
  
  if (findings.length === 0) {
    findings.push({ status: 'PASS' });
  }
  
  return findings;
}
