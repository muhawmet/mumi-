import SURGERY from './SURGERY_DATA.json';
import { mergeScore, beatBounds, type BeatMode } from './beats';

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

function includesAny(text: string, phrases: string[]): boolean {
  return phrases.some((phrase) => text.includes(normalize(phrase)));
}

function validProject(projectId: string): SourceProject | null {
  const project = DATA.projects.find((candidate) => candidate.id === projectId);
  if (!project) return null;
  const valid = DATA.paths.some((item) => item.id === project.path)
    && DATA.worlds.some((item) => item.id === project.world)
    && DATA.refs.some((item) => item.id === project.ref)
    && DATA.palettes.some((item) => item.id === project.palette);
  return valid ? project : null;
}

interface DecoderRule {
  path: string;
  project: string;
  score: number;
  reason: string;
  keywords: string[];
}

const DECODER_RULES: DecoderRule[] = [
  { path: 'PRODUCT_HERO', project: 'product_hero', score: 12, reason: 'ürün / ambalaj / packshot sinyalleri', keywords: ['ürün filmi', 'ürün reklamı', 'product hero', 'packshot', 'telefon kılıfı', 'ambalaj', 'logo stabil', 'makro yüzey'] },
  { path: 'FOOD_MACRO', project: 'food_macro', score: 12, reason: 'food / macro sinyalleri', keywords: ['food macro', 'kahve reklamı', 'espresso', 'restoran filmi', 'menü filmi', 'burger', 'tatlı', 'içecek'] },
  { path: 'AUTOMOTIVE_MOBILITY', project: 'automotive_mobility', score: 11, reason: 'otomotiv / mobilite sinyalleri', keywords: ['otomobil reklamı', 'elektrikli otomobil', 'automotive', 'mobility', 'far çizgisi', 'araç filmi'] },
  { path: 'FASHION_EDITORIAL', project: 'fashion_editorial', score: 11, reason: 'moda / editorial sinyalleri', keywords: ['moda koleksiyonu', 'fashion film', 'fashion editorial', 'tekstil', 'kumaş dokusu', 'siluet'] },
  { path: 'ARCHITECTURE_REAL_ESTATE', project: 'architecture_venue', score: 11, reason: 'mimari / mekan sinyalleri', keywords: ['gayrimenkul', 'real estate', 'mimari film', 'architecture', 'villa', 'otel tanıtımı', 'dış cephe', 'salon kapısı', 'iç mekan', 'mermer', 'konut', 'tavan yükseklik', 'pencere ışık', 'mimari aydınlatma'] },
  { path: 'TECH_MEDICAL_PRECISION', project: 'tech_medical', score: 9, reason: 'teknoloji / medikal sinyalleri', keywords: ['medikal cihaz', 'medical device', 'saas', 'klinik teknoloji', 'hasta takip', 'uygulama tanıtımı'] },
  { path: 'HUMAN_TESTIMONIAL', project: 'human_testimonial', score: 9, reason: 'röportaj / testimonial sinyalleri', keywords: ['röportaj filmi', 'testimonial', 'müşteri yorumu', 'hasta deneyimi', 'kurucu konuşuyor'] },
  { path: 'LIVE_ACTION_CORPORATE', project: 'municipality_real', score: 8, reason: 'kurumsal / kamu sinyalleri', keywords: ['belediye', 'kamu filmi', 'vatandaş', 'kurum filmi', 'sosyal sorumluluk'] },
  { path: 'LIVE_ACTION_CORPORATE', project: 'event_real', score: 10, reason: 'kamusal etkinlik sinyalleri', keywords: ['23 nisan', 'bayram', 'kamusal etkinlik'] },
  { path: 'TOURISM_DESTINATION', project: 'tourism_destination', score: 8, reason: 'turizm / destinasyon sinyalleri', keywords: ['turizm', 'destinasyon', 'destination film', 'tatil filmi', 'şehir turu'] },
  { path: 'SOCIAL_REELS_REALISM', project: 'social_reels', score: 8, reason: 'dikey sosyal içerik sinyalleri', keywords: ['reels', 'tiktok', 'instagram', 'sosyal medya', 'vertical'] },
  { path: 'DOCUMENTARY_REALISM', project: 'documentary_realism', score: 7, reason: 'belgesel gerçekçilik sinyalleri', keywords: ['belgesel', 'documentary', 'gerçek mekan', 'doğal ışık', 'gözlemsel'] },
  { path: 'HEALTH_PUBLIC_SERVICE', project: 'health_public', score: 9, reason: 'sağlık kamu hizmeti sinyalleri', keywords: ['sağlık kamu', 'public health', 'hastane kamu', 'bakım hizmeti'] },
  { path: 'ANIMATION_EDU', project: 'education', score: 9, reason: 'eğitim / müfredat sinyalleri', keywords: ['sınıf', 'öğrenci', 'ders', 'eğitim', 'müfredat', 'su döngüsü', 'buharlaşma', 'yoğuşma', 'fotosentez', 'kesir', 'noktalama', 'toplama işlemi', 'elektrik devresi', 'devre', 'pil', 'ampul', 'akım', 'volt', 'anahtar', 'karbondioksit', 'klorofil', 'yaprakta', 'payda', 'bütünün parçası', 'geometri', 'üçgenin', 'madde ve özellikleri', 'atom', 'hücre', 'sindirim sistemi', 'bitki büyür', 'tohum'] },
  { path: 'STYLIZED_PREMIUM', project: 'anime_action', score: 10, reason: 'anime / shonen macera sinyalleri', keywords: ['one piece', 'elbaf', 'grand line', 'shonen', 'naruto', 'demon slayer', 'attack on titan', 'solo leveling', 'jujutsu kaisen', 'bleach', 'dragon ball', 'anime macera', 'animasyon macera', 'shonen adventure', 'deniz macerası', 'ada macerası', 'yüksek deniz', 'kaptan', 'yelkenli macera'] },
  { path: 'STYLIZED_PREMIUM', project: 'anime_action', score: 9, reason: 'uzay / kozmik sinyalleri', keywords: ['uzay istasyonu', 'astronot', 'yıldız gezegeni', 'yıldız ve gezegen', 'nebula', 'galaktik', 'orbital istasyon', 'kara delik', 'evren keşfi', 'uzay keşfi', 'uzay yolculuğu', 'interstellar', 'kozmik'] },
  { path: 'STYLIZED_PREMIUM', project: 'anime_action', score: 9, reason: 'retro anime / cel sinyalleri', keywords: ['retro anime', 'retro animasyon', 'cel animasyon', '70s anime', '80s anime', 'retro nasa', 'vintage anime', 'koridorda ışık', 'titreyen ışık', 'anime film', 'cel film'] },
  { path: 'STYLIZED_PREMIUM', project: 'stylized_premium', score: 8, reason: 'stilize premium sinyalleri', keywords: ['arcane', 'spider-verse', 'spiderverse', 'anime', 'manga', 'stylized', 'stilize', 'painterly'] },
  { path: 'ULTRAREAL_COMMERCIAL', project: 'ultra_real_commercial', score: 6, reason: 'genel reklam / marka sinyalleri', keywords: ['reklam', 'kampanya', 'marka filmi', 'müşteri', 'satış', 'e-ticaret'] },
];

export function decodeBrief(raw: string): DecodeResult {
  const text = normalize(raw);
  const matches = DECODER_RULES
    .filter((rule) => includesAny(text, rule.keywords))
    .map((rule, index) => ({ rule, index }));

  const curriculum = DECODER_RULES.find((rule) => rule.path === 'ANIMATION_EDU')!;
  const curriculumHit = includesAny(text, curriculum.keywords);
  const commerceHit = includesAny(text, ['reklam', 'kampanya', 'marka filmi', 'müşteri', 'satış', 'e-ticaret', 'packshot']);
  const winner = curriculumHit && !commerceHit
    ? { rule: curriculum, index: -1 }
    : matches.sort((a, b) => b.rule.score - a.rule.score || a.index - b.index)[0];

  const fallback = validProject(DEFAULT_PROJECT_ID);
  if (!fallback) throw new Error(`SURGERY_DATA project contract is invalid: ${DEFAULT_PROJECT_ID}`);
  if (!winner) {
    return {
      path: fallback.path,
      project: fallback,
      reason: 'Belirleyici sinyal bulunamadı; genel commercial başlangıç kullanıldı.',
      confidence: 'fallback',
    };
  }

  const project = validProject(winner.rule.project);
  if (!project || project.path !== winner.rule.path) {
    throw new Error(`SURGERY_DATA decoder contract is invalid: ${winner.rule.project}`);
  }
  const weak = raw.trim().split(/\s+/u).filter(Boolean).length < 12;
  const guarded = curriculumHit && !commerceHit && winner.rule.path === 'ANIMATION_EDU';
  return {
    path: project.path,
    project,
    reason: `${guarded ? 'Müfredat koruması: ' : ''}${winner.rule.reason}${weak ? ' · brief kısa, kurulum tahminidir' : ''}`,
    confidence: weak ? 'medium' : 'high',
  };
}

/** Split on sentence endings while retaining every original character in an exact slice. */
export function ingestSource(raw: string): SourceBeat[] {
  if (!raw.length) return [];
  const sentencePattern = /[^.!?。！？]+(?:[.!?。！？]+|$)/gu;
  const matches = [...raw.matchAll(sentencePattern)];
  if (!matches.length) {
    return [{ sourceId: 'source-001', exactText: raw, start: 0, end: raw.length, hash: sourceHash(raw) }];
  }

  const beats: SourceBeat[] = [];
  let cursor = 0;
  for (const match of matches) {
    const matchEnd = (match.index ?? cursor) + match[0].length;
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

export function sourceSceneBudget(
  value: string | SourceBeat[],
  mode: BeatMode = 'Dengeli',
  maxScenes = MAX_DURATION_BUDGETED_SCENES
): SourceSceneBudget {
  const estimatedVoSeconds = estimateTurkishVoSeconds(value);
  const usableVoSecondsPerScene = MODE_USABLE_SECONDS[mode] || KLING_SAFE_VO_SECONDS_PER_SCENE;
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
  return /^(bu|buna|bunu|bunun|şu|şuna|şunu|şunun|o|onu|onun|böyle|boyle)\b/iu.test(cleanText(value));
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
  sourceBeats: SourceBeat[] = ingestSource(raw)
): SourceBeat[] {
  if (sourceBeats.length <= 1) return renumberBeats(sourceBeats);
  const budget = sourceSceneBudget(raw, mode);
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
    const conceptBoundary = i < sourceBeats.length - 1 && protectedConceptBoundary(sourceBeats[i], sourceBeats[i + 1]);
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
export function autoGroupBeats(raw: string, mode: BeatMode = 'Dengeli'): SourceBeat[] {
  const atoms = ingestSource(raw);
  if (atoms.length <= 1) return atoms;
  const budgeted = durationBudgetSourceBeats(raw, mode, atoms);
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
