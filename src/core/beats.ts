import { estimateSec } from './brain';

export type BeatMode = 'Ekonomik' | 'Dengeli' | 'Hassas' | 'Manuel';

export interface BeatPlan {
  mode: BeatMode;
  min: number;
  target: number;
  max: number;
  clips: number;
  genSec: number;
  voSec: number;
  usableSec: number;
  mechClips: number;
  mechGenSec: number;
  savedSec: number;
  savedPct: number;
}

export interface BeatHint {
  i: number;
  type: 'merge' | 'split' | 'keep';
  reason: string;
  effect: string;
}

export interface BeatAnalysis {
  plan: BeatPlan;
  hints: BeatHint[];
  enhancedBeats: Array<{
    id: string;
    text: string;
    voSec: number;
    visualSec: number;
    clipSec: number;
  }>;
}

const BEAT_MODES: Record<BeatMode, { min: number; target: number; max: number }> = {
  Ekonomik: { min: 3.5, target: 7, max: 11 },
  Dengeli: { min: 3, target: 6, max: 9 },
  Hassas: { min: 2.5, target: 5, max: 7 },
  Manuel: { min: 0, target: 0, max: 99 },
};

function clean(v: string) {
  return String(v || '').replace(/\s+/g, ' ').trim();
}

function wordCount(v: string) {
  return (clean(v).match(/\S+/g) || []).length;
}

function estimateRaw(v: string) {
  const w = wordCount(v);
  return Math.round((w / 2.35 + 1.5) * 10) / 10;
}

function clauseCount(t: string) {
  const x = clean(String(t || '').replace(/(^|[.!?]\s*)[\p{L}\s]{2,20}:\s/gu, '$1'));
  if (!x) return 1;
  const n = (x.match(/[,;]\s|\s(ve|ama|fakat|sonra|ardından|ardindan|derken)\s/gi) || []).length;
  return 1 + n;
}

function beatVisualSec(text: string) {
  const ev = clauseCount(text);
  return Math.min(8, Math.max(2.5, Math.round((2.5 + 1.2 * (ev - 1)) * 10) / 10));
}

function beatClipSec(text: string, voRaw: number, videoModelClips: number[]) {
  const vis = beatVisualSec(text);
  const needLong = vis > 6.2 || (voRaw > 8 && clauseCount(text) >= 3);
  return needLong ? videoModelClips[1] : videoModelClips[0];
}

function norm(v: string) {
  return String(v || '').toLowerCase().replace(/[çğıöşüâîû]/g, (m) => {
    return ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' } as Record<string, string>)[m] || m;
  });
}

function isRevealBeat(t: string) {
  const x = norm(t || '');
  return /(^|\s)(iste|işte|karsinizda|karşınızda|sonuc olarak|sonuç olarak|ta ?da|sürpriz|surpriz|buna .{0,24}(diyoruz|denir))/.test(x) || /işte buna|iste buna/.test(x);
}

function isGreeting(t: string) {
  const x = norm(t || '');
  return wordCount(t) <= 8 && /^(merhaba|selam|hos geldin|hoş geldin|gunaydin|günaydın|ben \w+|hey)\b/.test(x.trim());
}

function contentWords(t: string) {
  return (norm(t || '').replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/) || []).filter((w) => w.length > 3 && !/^(bugün|bugun|şimdi|simdi|sonra|çünkü|cunku|için|icin|gibi|daha|bile|ancak|fakat|veya|biraz|bütün|butun)$/.test(w));
}

function semanticOverlap(a: string, b: string) {
  const A = contentWords(a);
  const B = new Set(contentWords(b));
  let hit = 0;
  A.forEach((w) => {
    if (B.has(w) || Array.from(B).some((x) => x.slice(0, 5) === w.slice(0, 5) && w.length > 4)) hit++;
  });
  return hit;
}

function startsWithConnector(t: string) {
  return /^(ve|çünkü|cunku|yani|ama|fakat|sonra|ardından|ardindan|böylece|boylece|bu yüzden|bu yuzden|işte|iste|o zaman)\b/i.test(clean(t || ''));
}

export function mergeScore(a: string, b: string, bounds: { min: number; target: number; max: number }) {
  const va = estimateRaw(a);
  const vb = estimateRaw(b);
  if (va + vb > bounds.max) return -99;
  
  let sc = 0;
  if (semanticOverlap(a, b) >= 1) sc += 2;
  if (startsWithConnector(b)) sc += 2;
  if (isGreeting(a)) sc += 4;
  if (va < bounds.min || vb < bounds.min) sc += 3;
  if (wordCount(a) <= 4 && wordCount(b) <= 4) sc += 2;
  
  const spLbl = /^\s*[\p{L}]{2,15}\s*:\s/u;
  if (spLbl.test(a) && spLbl.test(b) && va + vb <= bounds.target + 2) sc += 2;
  
  if (clauseCount(a + ' ' + b) >= 4) sc -= 2;
  if (isRevealBeat(b) && vb >= 2) sc -= 3;
  if (va + vb > bounds.target + 2) sc -= 1;
  return sc;
}

function eventBoundary(src: string) {
  const s = String(src || '');
  let best = -1;
  let bestScore = -1;
  const re = /\s(?=[A-ZÇĞİÖŞÜ][a-zçğıöşü]{2,})|\s(?=ve\s)|;\s*/g;
  let m;
  while ((m = re.exec(s))) {
    const i = m.index + (m[0] === ';' ? 1 : 0);
    const left = s.slice(0, i);
    const right = s.slice(i);
    if (wordCount(left) < 4 || wordCount(right) < 4) continue;
    const balance = 1 - Math.abs(left.length - right.length) / s.length;
    const subj = /^\s*[A-ZÇĞİÖŞÜ][a-zçğıöşü]{2,}/.test(right) ? 0.5 : 0;
    const sc = balance + subj;
    if (sc > bestScore) {
      bestScore = sc;
      best = i;
    }
  }
  return best;
}

export function planBeats(
  beats: { id: string; text: string }[],
  mode: BeatMode,
  videoModelClips: number[] = [5, 10]
): BeatAnalysis {
  const bounds = BEAT_MODES[mode] || BEAT_MODES['Dengeli'];
  
  const enhancedBeats = beats.map((b) => {
    const voRaw = estimateRaw(b.text);
    return {
      ...b,
      voSec: Math.max(3, voRaw), // estimateSec base logic
      visualSec: beatVisualSec(b.text),
      clipSec: beatClipSec(b.text, voRaw, videoModelClips),
      voSecRaw: voRaw,
    };
  });

  const raw = beats.map((b) => b.text).join(' ');
  const atoms = (raw.match(/[^.!?。！？]+[.!?。！？]+(?:\s+|$)|[^.!?。！？]+$/g) || []).filter((x) => clean(x));
  const mechClips = Math.max(atoms.length, 1);
  const mechGen = mechClips * videoModelClips[0];
  
  const genSec = enhancedBeats.reduce((a, b) => a + b.clipSec, 0);
  const voSec = Math.round(enhancedBeats.reduce((a, b) => a + b.voSec, 0) * 10) / 10;
  const usableSec = Math.round(enhancedBeats.reduce((a, b) => a + Math.min(b.voSec, b.clipSec), 0) * 10) / 10;
  const savedSec = Math.max(0, mechGen - genSec);
  const savedPct = mechGen ? Math.round((1 - genSec / mechGen) * 100) : 0;

  const plan: BeatPlan = {
    mode,
    min: bounds.min,
    target: bounds.target,
    max: bounds.max,
    clips: enhancedBeats.length,
    genSec,
    voSec,
    usableSec,
    mechClips,
    mechGenSec: mechGen,
    savedSec,
    savedPct,
  };

  const hints: BeatHint[] = [];
  enhancedBeats.forEach((s, i) => {
    const vo = s.voSecRaw;
    if (vo < bounds.min && enhancedBeats.length > 1) {
      if (isRevealBeat(s.text)) {
        hints.push({ i, type: 'keep', reason: `[${s.id}] Bu sahne kısa (${vo}s) fakat reveal görevi taşıdığı için ayrı kalabilir.`, effect: `Birleştirirsen ~${videoModelClips[0]}s üretim tasarrufu, ama reveal vuruşu zayıflar.` });
      } else if (i < enhancedBeats.length - 1 || i > 0) {
        hints.push({ i, type: 'merge', reason: `[${s.id}] Bu sahne yalnız ${vo}s VO taşıyor; ${i < enhancedBeats.length - 1 ? 'sonraki' : 'önceki'} sahneyle güvenle birleşebilir.`, effect: `Birleştirmek ~${videoModelClips[0]}s üretim tasarrufu sağlar.` });
      }
    }
    if (i < enhancedBeats.length - 1) {
      const b = enhancedBeats[i + 1];
      const sc = mergeScore(s.text, b.text, bounds);
      // Removed the manual guard so hints are generated based on semantic closeness anyway
      if (sc >= 3) {
        hints.push({ i, type: 'merge', reason: `[${s.id}] Bu iki kaynak parçası aynı görsel olayı sürdürüyor (skor ${sc}).`, effect: `Birleştirmek ~${videoModelClips[0]}s üretim tasarrufu sağlar.` });
      }
    }
    if (vo > bounds.max || (vo > bounds.target && eventBoundary(s.text) > 0 && clauseCount(s.text) >= 3)) {
      hints.push({ i, type: 'split', reason: `[${s.id}] ${vo > bounds.max ? `Bu sahne ${vo}s ile beat üst sınırını aşıyor` : 'Bu sahne iki bağımsız fiziksel olay içeriyor'}; bölünmeli.`, effect: `Bölmek hareket güvenliğini artırır; +${videoModelClips[0]}s üretim maliyeti ekler.` });
    }
  });

  return {
    plan,
    hints: hints.slice(0, 8),
    enhancedBeats: enhancedBeats.map(({ voSecRaw, ...rest }) => rest), // exclude raw
  };
}
