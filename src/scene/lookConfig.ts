import type { Step } from '../store/useStudioStore';

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

/** Tek kamera otoritesi: her stage'in altın-saat tableau'ya bakışı — hepsi güneşe/ufka
 *  dönük, kamera hep önde (position[2]>0), FOV 30-36, ardışık poz mesafesi >2 (kilit bandlar). */
export const CAMERA_POSES: Record<Step, CameraPose> = {
  /* establish: tableau geniş — ufuk, güneş, çerçeve nehri tek karede */
  dashboard: { position: [0, 3.2, 16], target: [2.5, 2.8, -12], fov: 34 },
  /* yönetmen: sola kayıp güneşe dönük karar açısı */
  director:  { position: [-3.2, 2.8, 14], target: [3, 3, -12], fov: 32 },
  /* reçete: sağa yaklaşır — merkez şeref çerçevesi öne çıkar */
  recipe:    { position: [3.5, 2.6, 13], target: [2, 2.6, -12], fov: 34 },
  /* sahneler: güneşe uzanan çerçeve nehrine cepheden bakış */
  scenes:    { position: [-2, 3.4, 15.5], target: [3.5, 3, -14], fov: 36 },
  /* timeline: yükselen vinç — deniz/ufuk boydan zaman çizgisi gibi */
  timeline:  { position: [0.5, 5.5, 15], target: [1, 1.5, -10], fov: 30 },
  /* qa: alçak yakın açı — güneş kadrajın sıcağında */
  qa:        { position: [-3.8, 2.4, 12.5], target: [2.5, 2.6, -11], fov: 33 },
};

/** V3.2 "Altın-Saat Tableau" ayarları — şiddet buradan döner, komponentlerden değil.
 *  Karanlık değil batan-güneş: sis sıcak altın haze, fon alacakaranlık kehribar.
 *  Semantik güncellendi (B1): "masa lambası" → GÜNEŞ anahtarı, "aplik" → ufuk/gök dolgu.
 *  Kilit bandlar AYNEN korunur (lookConfig.test.ts): fog 14/34, ambient≤0.45,
 *  lamp≥2×sconce, ≤2 sconce, vignette/bloom/grain/CA bandları. */
export const LOOK = {
  /* V4 "pus ışıktır": luminous altın haze (default; world seçilince scenePalette.fog devralır).
   * clearColor === fog HEP; near/far aerial-perspective için geniş (uzak deniz/çerçeve pusa erir). */
  fog: { color: '#eec488', near: 10, far: 52 },
  clearColor: '#eec488',
  bloom: { intensity: 0.62, luminanceThreshold: 0.58, luminanceSmoothing: 0.3 }, // güneş/glitter/ufuk bloom (≤0.9)
  vignette: { offset: 0.3, darkness: 0.42 },  // hâlâ çerçevelenir ama mahzen değil (band [.25,.55])
  grain: { opacity: 0.06 },   // config-only (full-screen Noise SÖKÜLDÜ; painterly grain sky dokusuna baked)
  grade: { saturation: 0.14, contrast: 0.05, exposure: 1.12 }, // V4 canlılık push (ACESFilmic desature'ını dengeler)
  chromaticAberration: { offset: 0.0012 },
  cameraDamp: 2.2, // saniyedeki yaklaşma katsayısı (THREE.MathUtils.damp lambda)
  /* V4 ışık kanunu: GÜNEŞ anahtarı + ≤2 ufuk/gök dolgu + ambient ~0.6 (gündüz enerjisi).
   * Renkler world seçilince scenePalette'ten (ambient/key/frameHalo) gelir; şiddet LOOK'ta.
   * (lamp/sconce isimleri geriye-uyum; anlamı güneş/gök-dolgu.) */
  light: {
    ambient: 0.6,
    lamp: 9,            // = GÜNEŞ anahtarı (directional)
    sconce: 4,          // = ufuk/gök dolgu (≤ lamp/2)
    sconceColor: '#e8b563',
    sconcePositions: [[-4.6, 3.4, -4.0], [4.6, 3.4, -4.0]] as ReadonlyArray<readonly [number, number, number]>,
  },
  /* M4 asset slot şiddetleri — V3 §8: sRGB, anisotropy ≤ 8, mipmap açık */
  assets3d: {
    maxAnisotropy: 8,      // donanım tavanıyla min'lenir
    floorRepeat: 3,        // 2048² seamless doku, 18 birim diskte ~6 birimlik tile
    wallRepeat: [4, 1.6] as readonly [number, number], // 18×7 duvar, 2048² seamless
    backdropRadius: 30,    // BackdropSky fog={false} taşır — sis kubbeyi yutamaz
    backdropTheta: 0.62,   // ufkun hafif altına inen kubbe payı (π çarpanı)
  },
  palette: {
    gold: '#f7c948',
    amber: '#d6a84f',
    paper: '#e8ddc8',      // == tokens --parch (designLaws senkron — DEĞİŞTİRME)
    parchment: '#cfc2a6',  // yüzen çerçeve placeholder yüzü (doku gelene dek sıcak parşömen)
    floor: '#2a2013',      // B1: güneşte parlayan deniz/kum düzlemi (eski koyu atölye zemini)
    wall: '#3a2b1c',       // B1: ufuk sıcak sis-katmanı tabanı (BackdropSky B2'de luminous kısmı taşır)
    woodDark: '#241a10',   // yüzen çerçeve/silüet sıcak ahşabı
    brass: '#8a6a3a',      // çerçeve altın-kenarı (gold-rim)
    inkBottle: '#1e2a38',  // (B2'de furniture ile sökülecek — şimdilik referans bozulmasın diye duruyor)
    lampshade: '#3a2c18',  // (B2'de furniture ile sökülecek)
  },
} as const;

export function cameraPoseFor(step: Step): CameraPose {
  // Fallback tip sisteminde imkânsız görünür ama persist/rehydrate bozuk bir
  // step değeri getirebilir; kamera asla tanımsız poza düşmemeli.
  return CAMERA_POSES[step] ?? CAMERA_POSES.dashboard;
}
