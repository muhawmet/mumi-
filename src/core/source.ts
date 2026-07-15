import SURGERY from './SURGERY_DATA.json';
import { mergeScore, beatBounds, type BeatMode } from './beats';
import { engineUsableSec } from './engine';

export interface SourceProject {
  id: string;
  name: string;
  path: string;
  world: string;
  ref: string;
  palette: string;
  chars?: string;
}

export interface DecodeResult {
  path: string;
  project: SourceProject;
  reason: string;
  confidence: 'high' | 'medium' | 'fallback';
}

export interface SourceBeat {
  sourceId: string;
  exactText: string;
  start: number;
  end: number;
  hash: string;
}

export interface SourceIntegrityReport {
  rawChars: number;
  sceneChars: number;
  rawHash: string;
  reconHash: string;
  coverage: number;
  ok: boolean;
  segments: number;
}

export interface SourceSceneBudget {
  estimatedVoSeconds: number;
  usableVoSecondsPerScene: number;
  targetSceneCount: number;
  rawTargetSceneCount: number;
}

type SourceLike =
  | string
  | SourceBeat
  | { source?: string; exactText?: string; architecture?: { source?: { exactText?: string } } };

const DATA = SURGERY as unknown as {
  paths: Array<{ id: string }>;
  projects: SourceProject[];
  worlds: Array<{ id: string }>;
  refs: Array<{ id: string }>;
  palettes: Array<{ id: string }>;
};

const DEFAULT_PROJECT_ID = 'ultra_real_commercial';
export const ELEVENLABS_V3_TURKISH_WORDS_PER_SECOND = 2.35;
export const KLING_SAFE_VO_SECONDS_PER_SCENE = 5;
// No creative ceiling on auto-budgeted scenes: long-form (4+ min) videos need
// 40–60+ beats and the user's beat plan is authoritative. This stays only as an
// extreme runaway guard, far above any real video length — not a limit to design
// around. Pressing a beat mode (Dengeli/Ekonomik/Hassas) auto-sizes to the real
// count, so the user never has to split beats by hand.
export const MAX_DURATION_BUDGETED_SCENES = 600;

const MODE_USABLE_SECONDS: Record<BeatMode, number> = {
  Ekonomik: 5.5,
  Dengeli: KLING_SAFE_VO_SECONDS_PER_SCENE,
  Hassas: 4.5,
  Manuel: KLING_SAFE_VO_SECONDS_PER_SCENE,
};

const PROTECTED_EDU_CONCEPTS = [
  'siyasi parti',
  'sivil toplum kurulusu',
  'kamuoyu',
  'hukuk',
  'medya',
  'stk',
];

export function sourceHash(value: string): string {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıöşüâîû]/g, (char) => ({
      ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u',
    })[char] ?? char);
}

function validProject(projectId: string): SourceProject | null {
  const project = DATA.projects.find((candidate) => candidate.id === projectId);
  if (!project) return null;
  const validRef = !project.ref || DATA.refs.some((item) => item.id === project.ref);
  const valid = DATA.paths.some((item) => item.id === project.path)
    && DATA.worlds.some((item) => item.id === project.world)
    && validRef
    && DATA.palettes.some((item) => item.id === project.palette);
  return valid ? project : null;
}

const DOSSIER_WORLD_RULES: Array<{ world: string; pattern: RegExp }> = [
  { world: 'one_piece_toei', pattern: /one\s*piece|toei\s*bold[-\s]?cel/i },
  { world: 'naruto_shinobi_world', pattern: /naruto|shinobi/i },
  { world: 'demon_slayer_ufotable', pattern: /demon\s*slayer|ufotable/i },
  { world: 'solo_leveling_gate', pattern: /solo\s*leveling/i },
  { world: 'aot_wall_world', pattern: /attack\s*on\s*titan|scale\s*dread/i },
  { world: 'jjk_mappa', pattern: /jujutsu\s*kaisen|cursed\s*ink/i },
  { world: 'bleach_soul_world', pattern: /bleach|soul\s*world/i },
  { world: 'spiderverse_sony', pattern: /spider[-\s]?verse/i },
  { world: 'arcane_fortiche', pattern: /arcane|fortiche/i },
  { world: 'ghibli_hayao', pattern: /ghibli|miyazaki/i },
];

function dossierLine(raw: string, label: string): string {
  return raw.match(new RegExp(`^\\s*-\\s*\\*\\*${label}:\\*\\*\\s*(.+)$`, 'imu'))?.[1]?.trim() || '';
}

function pathFromDossier(raw: string): string | null {
  const path = dossierLine(raw, 'Path').toUpperCase();
  return DATA.paths.some((item) => item.id === path) ? path : null;
}

function worldFromDossier(raw: string): string | null {
  const value = dossierLine(raw, 'World');
  const direct = DATA.worlds.find((world) => world.id === value || normalize(world.id) === normalize(value));
  if (direct) return direct.id;
  const byName = DATA.worlds.find((world: any) => normalize(world.name || '').includes(normalize(value)));
  if (byName) return byName.id;
  const rule = DOSSIER_WORLD_RULES.find((candidate) => candidate.pattern.test(value));
  return rule?.world && DATA.worlds.some((world) => world.id === rule.world) ? rule.world : null;
}

function paletteFromDossier(raw: string): string | null {
  const paletteName = raw.match(/^### Palette as Light\s*\n(.+?)\s+—/imu)?.[1]?.trim() || '';
  if (!paletteName) return null;
  const palette = DATA.palettes.find((item: any) => normalize(item.name || item.id) === normalize(paletteName));
  return palette?.id || null;
}

function decodedDossierProject(raw: string): DecodeResult | null {
  if (!/MAMILAS PRODUCTION DOSSIER|SOURCE \(exact, untouchable\):/iu.test(raw)) return null;
  const path = pathFromDossier(raw);
  if (!path) return null;
  const project = DATA.projects.find((item) => item.path === path) || validProject(DEFAULT_PROJECT_ID);
  if (!project) return null;
  const world = worldFromDossier(raw) || project.world;
  const palette = paletteFromDossier(raw) || project.palette;
  return {
    path,
    project: { ...project, world, palette },
    reason: 'MAMILAS dossier metadata okundu; path/world/palette eski final brief başlığından korundu.',
    confidence: 'high',
  };
}

export function decodeBrief(raw: string): DecodeResult {
  const dossier = decodedDossierProject(raw);
  if (dossier) return dossier;

  const fallback = validProject(DEFAULT_PROJECT_ID);
  if (!fallback) throw new Error(`SURGERY_DATA project contract is invalid: ${DEFAULT_PROJECT_ID}`);
  return {
    path: fallback.path,
    project: fallback,
    reason: 'Raw source yalnız içerik olarak taşınır; site kaynak kelimelerinden path, world, ref veya palette seçmez.',
    confidence: 'fallback',
  };
}

export function extractProductionDossierSource(raw: string): { rawSource: string; beats: SourceBeat[] } | null {
  if (!/SOURCE \(exact, untouchable\):/u.test(raw)) return null;
  const lines = raw.split(/\r?\n/u);
  const extracted: string[] = [];
  for (const line of lines) {
    const marker = 'SOURCE (exact, untouchable):';
    const index = line.indexOf(marker);
    if (index < 0) continue;
    let exactText = line.slice(index + marker.length);
    if (exactText.startsWith(' ')) exactText = exactText.slice(1);
    extracted.push(exactText);
  }
  if (!extracted.length) return null;
  const rawSource = extracted.join('');
  let cursor = 0;
  const beats = extracted.map((exactText, index) => {
    const start = cursor;
    const end = start + exactText.length;
    cursor = end;
    return {
      sourceId: `source-${String(index + 1).padStart(3, '0')}`,
      exactText,
      start,
      end,
      hash: sourceHash(exactText),
    };
  });
  return { rawSource, beats };
}

/** Split on sentence endings while retaining every original character in an exact slice. */
export function ingestSource(raw: string): SourceBeat[] {
  const dossier = extractProductionDossierSource(raw);
  if (dossier) return dossier.beats;

  if (!raw.length) return [];
  // A sentence runs up to its terminator, then greedily absorbs any trailing
  // closing punctuation (quotes, brackets, ellipsis) so a lone `"` after `!"`
  // never spills into its own single-character beat.
  const sentencePattern = /[^.!?。！？]+(?:[.!?。！？]+["'”’»)\]…]*|$)/gu;
  const matches = [...raw.matchAll(sentencePattern)];
  if (!matches.length) {
    return [{ sourceId: 'source-001', exactText: raw, start: 0, end: raw.length, hash: sourceHash(raw) }];
  }

  const beats: SourceBeat[] = [];
  let cursor = 0;
  // A NUMBER'S PERIOD IS NOT A SENTENCE'S PERIOD.
  //
  // "17. yüzyıl Osmanlı Bursa'sında kandil yanar." split into TWO beats — "17." and "yüzyıl
  // Osmanlı…" — and the first became a whole SCENE whose entire source was "17.". Turkish
  // ordinals ("3. sınıf", "20. yüzyıl", "1. Dünya Savaşı") and decimals ("3.14") end in a period
  // that terminates nothing. A fragment that is only digits and a dot is glued to what follows.
  const isOrdinalFragment = (t: string) => /^\s*\d+[.,]\s*$/u.test(t);
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    let matchEnd = (match.index ?? cursor) + match[0].length;
    // Absorb the next match while this one is only a number and a dot.
    while (isOrdinalFragment(raw.slice(cursor, matchEnd)) && i + 1 < matches.length) {
      i += 1;
      matchEnd = (matches[i].index ?? matchEnd) + matches[i][0].length;
    }
    if (matchEnd <= cursor) continue;
    const exactText = raw.slice(cursor, matchEnd);
    beats.push({
      sourceId: `source-${String(beats.length + 1).padStart(3, '0')}`,
      exactText,
      start: cursor,
      end: matchEnd,
      hash: sourceHash(exactText),
    });
    cursor = matchEnd;
  }
  if (cursor < raw.length) {
    const exactText = raw.slice(cursor);
    beats.push({
      sourceId: `source-${String(beats.length + 1).padStart(3, '0')}`,
      exactText,
      start: cursor,
      end: raw.length,
      hash: sourceHash(exactText),
    });
  }
  return beats;
}

function sourceText(value: string | SourceBeat[]): string {
  return Array.isArray(value) ? value.map((beat) => beat.exactText).join('') : value;
}

function wordCount(value: string): number {
  return (value.match(/\S+/gu) || []).length;
}

function roundTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

export function estimateTurkishVoSeconds(value: string | SourceBeat[]): number {
  const text = sourceText(value);
  const words = wordCount(text);
  if (!words) return 0;
  const sentencePauses = (text.match(/[.!?。！？]+/gu) || []).length * 0.05;
  const clausePauses = (text.match(/[,;:]+/gu) || []).length * 0.08;
  return roundTenth((words / ELEVENLABS_V3_TURKISH_WORDS_PER_SECOND) + sentencePauses + clausePauses);
}

// MODE_USABLE_SECONDS was calibrated against the Kling-class 9s clean window
// (5s VO / 9s window). Model-aware budgeting keeps that ratio: a longer engine
// window proportionally raises the per-scene VO budget, so fewer/longer scenes
// on Runway-class engines and the exact legacy numbers when no model is given.
const BUDGET_BASELINE_WINDOW = 9;

export function sourceSceneBudget(
  value: string | SourceBeat[],
  mode: BeatMode = 'Dengeli',
  maxScenes = MAX_DURATION_BUDGETED_SCENES,
  videoModel?: string
): SourceSceneBudget {
  const estimatedVoSeconds = estimateTurkishVoSeconds(value);
  const modeUsable = MODE_USABLE_SECONDS[mode] || KLING_SAFE_VO_SECONDS_PER_SCENE;
  const usableVoSecondsPerScene = videoModel
    ? roundTenth(modeUsable * engineUsableSec(videoModel) / BUDGET_BASELINE_WINDOW)
    : modeUsable;
  const rawTargetSceneCount = Math.max(1, Math.ceil(estimatedVoSeconds / usableVoSecondsPerScene) || 1);
  return {
    estimatedVoSeconds,
    usableVoSecondsPerScene,
    rawTargetSceneCount,
    targetSceneCount: Math.max(1, Math.min(maxScenes, rawTargetSceneCount)),
  };
}

function cleanText(value: string): string {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function startsWithStrandedConnector(value: string): boolean {
  return /^(ve|ama|çünkü|cunku|fakat|sonra|ardından|ardindan|yani|böylece|boylece|bu yüzden|bu yuzden|işte|iste)\b/iu.test(cleanText(value));
}

function endsWithStrandedConnector(value: string): boolean {
  return /\b(ve|ama|çünkü|cunku|fakat|sonra|ardından|ardindan|yani|fakat)$/iu.test(cleanText(value));
}

function startsWithContextFragment(value: string): boolean {
  const text = cleanText(value);
  // "Bu beş unsur", "Bu iki madde", "Bu üç kural" etc. are SUMMARY CLOSURES — they close the
  // previous group and belong with what follows (the overview scene). Allow a split before them.
  if (/^(bu|buna|bunu|bunun)\s+\S*\s*(iki|üç|dört|beş|altı|yedi|sekiz|dokuz|on|\d+)\s+/iu.test(text)) return false;
  return /^(bu|buna|bunu|bunun|şu|şuna|şunu|şunun|o|onu|onun|böyle|boyle)\b/iu.test(text);
}

/** Sentence starts with an ordinal sequence marker: "Beşinci unsur", "İkinci adım", "3. Madde" etc. */
function startsWithOrdinalSequenceIntro(value: string): boolean {
  const t = normalize(cleanText(value));
  return /^(birinci|ikinci|ucuncu|dorduncu|besinci|altinci|yedinci|sekizinci|dokuzuncu|onuncu)(si|su)?\s/.test(t)
    || /^\d+[.)]\s+\S/.test(cleanText(value));
}

function conceptText(value: string): string {
  return normalize(cleanText(value))
    .replace(/[“”"'’():;,.!?]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function protectedConceptLead(value: string): string | null {
  const text = conceptText(value);
  return PROTECTED_EDU_CONCEPTS.find((concept) => (
    text === concept
    || text.startsWith(`${concept} `)
    || text.startsWith(`${concept}lar `)
    || text.startsWith(`${concept}ler `)
  )) ?? null;
}

function protectedConceptCount(value: string): number {
  const text = ` ${conceptText(value)} `;
  return PROTECTED_EDU_CONCEPTS.filter((concept) => text.includes(` ${concept} `)).length;
}

function isOverviewConceptAtom(value: string): boolean {
  return protectedConceptCount(value) >= 2;
}

function protectedConceptBoundary(left: SourceBeat, right: SourceBeat): boolean {
  const nextConcept = protectedConceptLead(right.exactText);
  if (!nextConcept || isOverviewConceptAtom(right.exactText)) return false;
  const currentConcept = protectedConceptLead(left.exactText);
  return !currentConcept || currentConcept !== nextConcept || isOverviewConceptAtom(left.exactText);
}

function badSceneBoundary(left: SourceBeat, right: SourceBeat): boolean {
  const l = cleanText(left.exactText);
  const r = cleanText(right.exactText);
  return startsWithStrandedConnector(r)
    || endsWithStrandedConnector(l)
    || l.endsWith(':')
    || startsWithContextFragment(r);
}

function beatFromRange(beats: SourceBeat[], startIndex: number, endIndex: number, outputIndex: number): SourceBeat {
  const first = beats[startIndex];
  const last = beats[endIndex];
  const exactText = beats.slice(startIndex, endIndex + 1).map((beat) => beat.exactText).join('');
  return {
    sourceId: `source-${String(outputIndex + 1).padStart(3, '0')}`,
    exactText,
    start: first.start,
    end: last.end,
    hash: sourceHash(exactText),
  };
}

function renumberBeats(beats: SourceBeat[]): SourceBeat[] {
  return beats.map((beat, index) => ({
    sourceId: `source-${String(index + 1).padStart(3, '0')}`,
    exactText: beat.exactText,
    start: beat.start,
    end: beat.end,
    hash: sourceHash(beat.exactText),
  }));
}

export function durationBudgetSourceBeats(
  raw: string,
  mode: BeatMode = 'Dengeli',
  sourceBeats: SourceBeat[] = ingestSource(raw),
  videoModel?: string
): SourceBeat[] {
  if (sourceBeats.length <= 1) return renumberBeats(sourceBeats);
  const budget = sourceSceneBudget(raw, mode, MAX_DURATION_BUDGETED_SCENES, videoModel);
  const targetCount = Math.min(sourceBeats.length, budget.targetSceneCount);
  if (targetCount >= sourceBeats.length) return renumberBeats(sourceBeats);

  const durations = sourceBeats.map((beat) => Math.max(0.1, estimateTurkishVoSeconds(beat.exactText)));
  const totalSec = durations.reduce((sum, duration) => sum + duration, 0);
  const targetSec = totalSec / targetCount;
  const groups: SourceBeat[] = [];
  let groupStart = 0;
  let groupSec = 0;

  for (let i = 0; i < sourceBeats.length; i += 1) {
    groupSec += durations[i];
    const conceptBoundary = i < sourceBeats.length - 1 && (
      protectedConceptBoundary(sourceBeats[i], sourceBeats[i + 1])
      || startsWithOrdinalSequenceIntro(sourceBeats[i + 1].exactText)
    );
    if (conceptBoundary) {
      groups.push(beatFromRange(sourceBeats, groupStart, i, groups.length));
      groupStart = i + 1;
      groupSec = 0;
      continue;
    }

    const groupsLeftAfterClose = targetCount - groups.length - 1;
    if (groupsLeftAfterClose <= 0) continue;

    const atomsLeft = sourceBeats.length - i - 1;
    if (atomsLeft < groupsLeftAfterClose) continue;

    const nextDuration = durations[i + 1] || 0;
    const boundaryBad = i < sourceBeats.length - 1 && badSceneBoundary(sourceBeats[i], sourceBeats[i + 1]);
    const mustClose = atomsLeft === groupsLeftAfterClose;
    const closeByTarget = groupSec >= targetSec && !boundaryBad;
    const closeByBalance = groupSec >= targetSec * 0.7
      && Math.abs(groupSec - targetSec) <= Math.abs((groupSec + nextDuration) - targetSec)
      && !boundaryBad;

    if (mustClose || closeByTarget || closeByBalance) {
      groups.push(beatFromRange(sourceBeats, groupStart, i, groups.length));
      groupStart = i + 1;
      groupSec = 0;
    }
  }

  if (groupStart < sourceBeats.length) {
    groups.push(beatFromRange(sourceBeats, groupStart, sourceBeats.length - 1, groups.length));
  }

  return renumberBeats(groups);
}

/**
 * Group sentence-level atoms into duration-budgeted scene beats. Reconstruction
 * stays lossless: merged `exactText` is only the concatenation of original atoms,
 * so `sourceIntegrity` still reports 100%. `ingestSource` itself is untouched.
 */
const AUTO_GROUP_MERGE_THRESHOLD = 3;
export function autoGroupBeats(raw: string, mode: BeatMode = 'Dengeli', videoModel?: string): SourceBeat[] {
  const atoms = ingestSource(raw);
  if (atoms.length <= 1) return atoms;
  const budgeted = durationBudgetSourceBeats(raw, mode, atoms, videoModel);
  if (budgeted.length < atoms.length) return budgeted;

  const bounds = beatBounds(mode);
  const grouped: SourceBeat[] = [];
  let current = atoms[0];
  for (let i = 1; i < atoms.length; i += 1) {
    const next = atoms[i];
    if (mergeScore(current.exactText, next.exactText, bounds) >= AUTO_GROUP_MERGE_THRESHOLD) {
      current = {
        sourceId: current.sourceId,
        exactText: current.exactText + next.exactText,
        start: current.start,
        end: next.end,
        hash: '',
      };
    } else {
      grouped.push(current);
      current = next;
    }
  }
  grouped.push(current);

  return grouped.map((beat, index) => ({
    sourceId: `source-${String(index + 1).padStart(3, '0')}`,
    exactText: beat.exactText,
    start: beat.start,
    end: beat.end,
    hash: sourceHash(beat.exactText),
  }));
}

function exactSource(scene: SourceLike): string {
  if (typeof scene === 'string') return scene;
  if ('exactText' in scene && typeof scene.exactText === 'string') return scene.exactText;
  if ('source' in scene && typeof scene.source === 'string') return scene.source;
  if ('architecture' in scene) return scene.architecture?.source?.exactText ?? '';
  return '';
}

export function sourceIntegrity(rawVault: string, scenes: SourceLike[]): SourceIntegrityReport {
  const reconstructed = scenes.map(exactSource).join('');
  const ok = rawVault === reconstructed;
  const coverage = ok
    ? 100
    : Math.min(100, Math.round((reconstructed.length / Math.max(1, rawVault.length)) * 100));
  return {
    rawChars: rawVault.length,
    sceneChars: reconstructed.length,
    rawHash: sourceHash(rawVault),
    reconHash: sourceHash(reconstructed),
    coverage,
    ok,
    segments: scenes.length,
  };
}
