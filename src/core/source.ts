import SURGERY from './SURGERY_DATA.json';

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
  { path: 'ARCHITECTURE_REAL_ESTATE', project: 'architecture_venue', score: 11, reason: 'mimari / mekan sinyalleri', keywords: ['gayrimenkul', 'real estate', 'mimari film', 'architecture', 'villa', 'otel tanıtımı', 'dış cephe'] },
  { path: 'TECH_MEDICAL_PRECISION', project: 'tech_medical', score: 9, reason: 'teknoloji / medikal sinyalleri', keywords: ['medikal cihaz', 'medical device', 'saas', 'klinik teknoloji', 'hasta takip', 'uygulama tanıtımı'] },
  { path: 'HUMAN_TESTIMONIAL', project: 'human_testimonial', score: 9, reason: 'röportaj / testimonial sinyalleri', keywords: ['röportaj filmi', 'testimonial', 'müşteri yorumu', 'hasta deneyimi', 'kurucu konuşuyor'] },
  { path: 'LIVE_ACTION_CORPORATE', project: 'municipality_real', score: 8, reason: 'kurumsal / kamu sinyalleri', keywords: ['belediye', 'kamu filmi', 'vatandaş', 'kurum filmi', 'sosyal sorumluluk'] },
  { path: 'LIVE_ACTION_CORPORATE', project: 'event_real', score: 10, reason: 'kamusal etkinlik sinyalleri', keywords: ['23 nisan', 'bayram', 'kamusal etkinlik'] },
  { path: 'TOURISM_DESTINATION', project: 'tourism_destination', score: 8, reason: 'turizm / destinasyon sinyalleri', keywords: ['turizm', 'destinasyon', 'destination film', 'tatil filmi', 'şehir turu'] },
  { path: 'SOCIAL_REELS_REALISM', project: 'social_reels', score: 8, reason: 'dikey sosyal içerik sinyalleri', keywords: ['reels', 'tiktok', 'instagram', 'sosyal medya', 'vertical'] },
  { path: 'DOCUMENTARY_REALISM', project: 'documentary_realism', score: 7, reason: 'belgesel gerçekçilik sinyalleri', keywords: ['belgesel', 'documentary', 'gerçek mekan', 'doğal ışık', 'gözlemsel'] },
  { path: 'HEALTH_PUBLIC_SERVICE', project: 'health_public', score: 9, reason: 'sağlık kamu hizmeti sinyalleri', keywords: ['sağlık kamu', 'public health', 'hastane kamu', 'bakım hizmeti'] },
  { path: 'ANIMATION_EDU', project: 'education', score: 9, reason: 'eğitim / müfredat sinyalleri', keywords: ['aras', 'defne', 'sınıf', 'öğrenci', 'ders', 'eğitim', 'müfredat', 'su döngüsü', 'buharlaşma', 'yoğuşma', 'fotosentez', 'kesir', 'noktalama', 'toplama işlemi'] },
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
