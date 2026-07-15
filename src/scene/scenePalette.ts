/* ============================================================
   V4 world-adaptive scene palette (Fable spec 2026-07-11).
   Tek yasa: "Pus ışıktır, asla karanlık değil" — noir dünyada
   da Ghibli'de de. Bir world'ün palette_lock'undan (shadow/mid/
   accent/highlight) sahne renklerini DETERMİNİSTİK türetir.
   SALT GÖRÜNÜM: hex asla prompt yoluna girmez (Palette
   Translation Law dokunulmaz); bias string PARSE EDİLMEZ.
   ============================================================ */

export interface ScenePalette {
  skyTop: string; skyMid: string; horizonGlow: string;
  sunCore: string; sunHalo: string;
  fog: string;            // == clearColor (aerial haze)
  ambient: string; key: string;
  seaDeep: string; seaGlitter: string;
  frameHalo: string; sparkle: string;
  ridgeNear: string; ridgeFar: string;
}

export interface PaletteLock { shadow: string; mid: string; accent: string; highlight: string }

/* — renk yardımcıları (hepsi saf) — */
type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function clamp255(n: number): number { return Math.max(0, Math.min(255, Math.round(n))); }
function rgbToHex([r, g, b]: RGB): string {
  return '#' + [r, g, b].map((n) => clamp255(n).toString(16).padStart(2, '0')).join('');
}
/** Rec.709 bağıl parlaklık 0-1 (lookConfig.test.ts "pus ışıktır" ölçütüyle aynı). */
export function luma(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
function rgbToHsl([r, g, b]: RGB): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h / 6, s, l];
}
function hslToRgb([h, s, l]: [number, number, number]): RGB {
  if (s === 0) { const v = l * 255; return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const t2 = (t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [t2(h + 1 / 3) * 255, t2(h) * 255, t2(h - 1 / 3) * 255];
}
export function satOf(hex: string): number { return rgbToHsl(hexToRgb(hex))[1]; }

/** RGB-uzayı lerp (mix). */
function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a), [br, bg, bb] = hexToRgb(b);
  return rgbToHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]);
}
/** Bağıl-parlaklığı [lo,hi] bandına oturt: beyaza/siyaha lerp. rgbToHex 8-bit
 *  yuvarlaması sınırı ~.004 aşabildiği için içe küçük margin (test-kesin sonuç). */
function clampLuma(hex: string, lo: number, hi: number): string {
  const EPS = 0.006;
  const L = luma(hex);
  if (L < lo) { const t = lo + EPS; const a = L >= 1 ? 0 : (t - L) / (1 - L); return mix(hex, '#ffffff', Math.max(0, Math.min(1, a))); }
  if (L > hi) { const t = hi - EPS; const a = L <= 0 ? 0 : 1 - t / L; return mix(hex, '#000000', Math.max(0, Math.min(1, a))); }
  return hex;
}
/** Doygunluğu HSL'de sınırla/ölçekle (h,l korunur). */
function withSat(hex: string, fn: (s: number) => number): string {
  const [h, s, l] = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb([h, Math.max(0, Math.min(1, fn(s))), l]));
}
const satMax = (hex: string, hi: number) => withSat(hex, (s) => Math.min(s, hi));
const satMin = (hex: string, lo: number) => withSat(hex, (s) => Math.max(s, lo));
const satScale = (hex: string, k: number, cap: number) => withSat(hex, (s) => Math.min(s * k, cap));

/** §1 el-ayarlı canlı altın-saat default (world seçili değilken). */
export const DEFAULT_SCENE_PALETTE: ScenePalette = {
  skyTop: '#2e5f7a', skyMid: '#8fae9e', horizonGlow: '#ffe7ad',
  sunCore: '#fff4dc', sunHalo: '#ffc476',
  fog: '#eec488', ambient: '#f6e6c6', key: '#ffe9c4',
  seaDeep: '#26505c', seaGlitter: '#ffe7ad',
  frameHalo: '#ffcf8c', sparkle: '#ffe2a0',
  ridgeNear: '#4a6152', ridgeFar: '#a8a98e',
};

/**
 * Bir world'ün palette_lock'undan sahne paletini türet.
 * Değişmezler (lookConfig testleriyle bağlı, 39 gerçek world üstünde):
 * L(fog)∈[.55,.80] · L(sunCore)≥.85 · L(seaDeep)∈[.06,.35] · pus ışıktır.
 * Monochrome (noir) istisnası: tüm girdi S<.05 ise doygunluk taban/ölçeklemeleri atlanır.
 */
export function deriveScenePalette(lock: PaletteLock): ScenePalette {
  const { shadow, mid, accent, highlight } = lock;
  const maxInputS = Math.max(satOf(shadow), satOf(mid), satOf(accent), satOf(highlight));
  const mono = maxInputS < 0.05;

  const sunCore = clampLuma(mix(highlight, '#ffffff', 0.35), 0.88, 1);
  const sunHalo = clampLuma(mix(highlight, accent, 0.45), 0.55, 0.78);
  let horizonGlow = mix(highlight, accent, 0.35);
  horizonGlow = mono ? horizonGlow : satScale(horizonGlow, 1.15, 0.9);
  horizonGlow = clampLuma(horizonGlow, 0.60, 0.80);

  // zenit shadow'un hue'sunu taşısın (serin dünyada mavi kalsın) → mid ağırlığı hafif
  let skyTop = mix(shadow, mid, 0.32);
  if (!mono) skyTop = satMin(satMax(skyTop, 0.60), 0.10);
  skyTop = clampLuma(skyTop, 0.24, 0.46);
  const skyMid = mix(mid, horizonGlow, 0.45);

  let fog = mix(mid, highlight, 0.50);
  if (!mono) fog = satMax(fog, 0.55);
  fog = clampLuma(fog, 0.55, 0.80);

  const ambient = mix(fog, '#ffffff', 0.25);
  const key = mix(sunCore, accent, 0.25);

  let seaDeep = shadow;
  if (!mono) seaDeep = satMin(seaDeep, 0.12);
  seaDeep = clampLuma(seaDeep, 0.10, 0.30);
  const seaGlitter = horizonGlow;

  const frameHalo = mix(accent, highlight, 0.50);
  const sparkle = mix(highlight, accent, 0.30);
  const ridgeNear = mix(shadow, mid, 0.25);
  const ridgeFar = mix(ridgeNear, fog, 0.65);

  return {
    skyTop, skyMid, horizonGlow, sunCore, sunHalo, fog, ambient, key,
    seaDeep, seaGlitter, frameHalo, sparkle, ridgeNear, ridgeFar,
  };
}
