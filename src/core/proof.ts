import SURGERY_DATA from './SURGERY_DATA.json';
import IP_FIREWALL from '../../agents/ipFirewall.json';

/**
 * The canonical protected-franchise term list. Single source of truth — HARD-FIX
 * 2026-07-16 (rapor madde 16/17): it now lives in `agents/ipFirewall.json` so the agent
 * runtime (scripts/mamilas-command.mjs) screens the FINAL agent-authored prompt against
 * the exact same canon. This module keeps the behaviourally identical exports; the
 * parity lock is ipFirewall.test.ts (both surfaces, same inputs, same verdicts).
 *
 * Use `containsProtectedTerm` / `protectedTermsIn` rather than building the regex inline.
 */
export const PROTECTED_IP_SOURCE: string = IP_FIREWALL.protectedIpSource;

export function containsProtectedTerm(text: string): boolean {
  return new RegExp(`\\b(?:${PROTECTED_IP_SOURCE})\\b`, 'iu').test(text || '');
}

/**
 * WORK TITLES — the third IP class, and the one that shipped.
 *
 * The line here is NOT "anything from a real film". These worlds exist to teach a
 * studio's RENDERING LANGUAGE, and the data says so deliberately: pixar_3d_edu's
 * negative_lock reads "NO any named Pixar or Disney animated character · NO Pixar City ·
 * NO any named Pixar/Disney location" while its positive law asks for exactly that
 * pipeline ("skin MUST be Pixar SSS-shaded"). Render in the language, never draw their
 * cast. That is the project's two-way IP rule, and it is coherent — so a STUDIO name in
 * a craft-lineage clause stays. Strip it and the world goes generic, which the same rule
 * forbids from the other side.
 *
 * What must die is the name of the WORK, and any place or thing inside it. The live
 * prompt for pixar_3d_edu read "premium-CG feature-animation Soul dual-register ...
 * ethereal Great-Before" — the Great Before is a LOCATION IN THAT FILM, i.e. the precise
 * thing the same world's negative_lock forbids. The positive half was ordering what the
 * negative half banned. Naming the film hands the engine its characters and its shots;
 * naming the studio hands it a pipeline.
 *
 * Scrubbed like a brand, NOT like a character: strip the name, keep the craft. The clause
 * exists to teach "dual-register: warm tactile earthly versus soft-abstract luminous
 * ethereal" — that survives the title, and it is the whole point of the ref.
 *
 * Case-SENSITIVE on purpose: proper nouns are capitalised in this data, so "Soul" dies
 * while a legitimate "soulful warmth" lives. Director surnames are NOT here — a lineage
 * is not a work, and no engine has ever drawn "Pete Docter".
 */
export const WORK_TITLE_SOURCE: string = IP_FIREWALL.workTitleSource;

const WORK_TITLE_RE = () => new RegExp(`\\b(?:${WORK_TITLE_SOURCE})\\b`, 'gu');

export function containsWorkTitle(text: string): boolean {
  return WORK_TITLE_RE().test(text || '');
}

/**
 * The work titles a text actually carries. `scrubWorkTitles` is the right answer for
 * REFERENCE prose (data the site owns — silently cleaning it costs nothing). It is the
 * WRONG answer for Mami's own sentence: cutting "Spider-Verse" out of "Spider-Verse
 * tarzında olsun" leaves "tarzında olsun", which is both mutilated and still not what he
 * meant. A gate that stops and NAMES the term lets him re-author it in one sentence.
 */
export function workTitlesIn(text: string): string[] {
  return [...new Set(text?.match(WORK_TITLE_RE()) ?? [])];
}

/** Removes work/studio names and heals the punctuation the removal leaves behind. */
export function scrubWorkTitles(text: string): string {
  if (!text) return '';
  return text
    .replace(WORK_TITLE_RE(), '')
    // Heal only what the removal broke: "ethereal , motivated" → "ethereal, motivated";
    // "premium-CG  dual-register" → one space. A legitimate "Pete Docter / Dana Murray"
    // keeps its slash — an earlier draft ate it and quietly degraded the DNA prose.
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Terms from PROTECTED_IP_SOURCE that are also ordinary words a Turkish brief may
 * legitimately use. They belong in the SCORING list (a false positive there only costs
 * points) but never in a BLOCKING gate, where one would stop Mami's real work:
 *
 *   "Robin yeleği giymiş esnaf" · "powder mavisi gömlek" · "Brook marka ayakkabı"
 *   "Sakura ağacı altında" · "Bleach ile temizlik yapan" · "cell telefonu tutan"
 *
 * Their multi-word franchise forms (`nico robin`, `sakura haruno`) stay in the gate.
 *
 * Every entry earns its place with a concrete brief it would wrongly block. Anything
 * without one (`chopper`, `woody`, `jinx`, `merida`…) stays in the gate — a name that
 * never appears in an ordinary Turkish cast description costs nothing to keep.
 */
// Örnek gerekçeler kanonda: agents/ipFirewall.json (robin=kişi adı/kuş, powder=toz mavi,
// brook=marka, sakura=kiraz çiçeği, bleach=çamaşır suyu, cell=telefon, howl/endeavor=fiil).
const GATE_EXEMPT_GENERICS = new Set<string>(IP_FIREWALL.gateExemptGenerics);

/**
 * Franchise names the scoring list never carried. It was assembled around the anime /
 * A24 / Pixar corpus the worlds are built from; a cast field is free text and reaches
 * for whatever a person knows. Western tentpoles were simply absent.
 *
 * EVERY entry here is either multi-word or a name with no ordinary Turkish reading.
 * The first draft of this list repeated the very bug it was written to fix — a bare
 * `batman` blocks "Batmanlı esnaf" (Batman is a Turkish city), a bare `elsa` / `anna`
 * / `mario` / `fiona` / `olaf` block ordinary given names, and `joker` (the playing
 * card), `link` (a link), `hulk`, `frozen`, `nemo`, `simba` all read as plain words.
 * A single-word entry earns its place only when no Turkish brief would ever type it.
 */
// Liste kanonu agents/ipFirewall.json — tek-kelime giriş yasası (Türkçe okuma çifti olan
// ad kapıya giremez: batman=şehir, elsa/anna/mario=ad, joker=iskambil…) orada korunur.
const GATE_EXTRA_FRANCHISE: string[] = IP_FIREWALL.gateExtraFranchise;

/**
 * The BLOCKING gate's term list — narrower and stricter than the scoring list.
 *
 * Two lists, because they answer different questions. `PROTECTED_IP_SOURCE` asks "does
 * this prompt smell of IP?" and docks points; a false positive is cheap. The gate asks
 * "must this batch stop?" and a false positive costs Mami a job. So the gate drops the
 * words that live double lives in ordinary Turkish, and adds the Western franchises the
 * scoring corpus never covered.
 */
const GATE_IP_TERMS: string[] = [
  ...PROTECTED_IP_SOURCE.split('|').filter((t) => !GATE_EXEMPT_GENERICS.has(t)),
  ...GATE_EXTRA_FRANCHISE,
].sort((a, b) => b.length - a.length); // longest-first so "iron man" beats a bare "man"-like prefix

/**
 * Turkish agglutinates onto proper nouns, with or without the apostrophe convention:
 * "Naruto'nun", "Narutonun", "Gokuya", "Totoro'ya". A plain `\b` boundary catches only
 * the apostrophised forms — "Gokunun" walked straight through. Allow the canonical Turkish
 * case/possessive suffix forms, optionally after an apostrophe, before requiring the boundary.
 * Arbitrary trailing letters are forbidden: they made English "naming" look like Nami + "ng".
 */
const TR_SUFFIX: string = IP_FIREWALL.turkishSuffix;

/** Every gate-protected franchise term present in the text, lowercased and deduped. */
export function protectedTermsIn(text: string): string[] {
  if (!text) return [];
  const hits: string[] = [];
  for (const term of GATE_IP_TERMS) {
    const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${TR_SUFFIX}\\b`, 'iu');
    if (re.test(text)) hits.push(term);
  }
  return [...new Set(hits)];
}

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
    const hasSpecificIP = containsProtectedTerm(lower);
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
    const hasIP = containsProtectedTerm(positiveText);
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
  // Scene or brief: primary subject is a vague bridge phrase, not a concrete visual object.
  reg_generic_bridge: (input, reg) => {
    const lower = input.text.toLowerCase();
    const bridgePhrases = [
      'concept model', 'teaching mechanism', 'final readable summary model',
      'earned emblem', 'opening visual statement', 'tension frame',
      'human-scale detail', 'two original figures in a quiet emotionally charged space',
      // STY/REAL fallbacks now graft film-grade FB staging onto the source noun;
      // this marker is their detectable signature (replaces the retired meta strings).
      'physically embodies',
    ];
    const hits = bridgePhrases.filter((p) => lower.includes(p));
    if (hits.length >= 2) {
      return {
        status: 'FIX',
        problem: reg.name,
        why: reg.expected,
        replaceWith: 'replace generic bridge subject with a concrete visible object directly from the source beat.',
        verify: `Generic bridge phrases found: ${hits.join(', ')}`,
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
