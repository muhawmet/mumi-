import React from 'react';
import { mixHex, paintPlate } from './plateArt';

/* =============================================================
   PaintedPlate — boyanmış ışık plakasının paylaşılan gövdesi.
   ArchetypeSlate (Phase-0 dossier) ve Reçete dünya listesi aynı
   fırçayı kullanır: CSS gradyan swatch değil, palet ışığıyla
   BOYANMIŞ kare. Canvas yoksa (jsdom/test) sıcak gradyan fallback.
   ============================================================= */

/** FNV-1a — deterministik kompozisyon tohumu (id → plaka kimliği). */
export function plateSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** paletteColors ham dizisini plaka dörtlüsüne bağlar (eksikse sıcak default). */
export function toPlateColors(raw: readonly string[]): [string, string, string, string] {
  return raw.length >= 4
    ? [raw[0], raw[1], raw[2], raw[3]]
    : ['#241a10', '#45311d', '#d6a84f', '#ffe6a3'];
}

export interface PaintedPlateProps {
  colors: readonly [string, string, string, string];
  seed: number;
  /** Güneş konumu %. Verilmezse seed'den türetilir (her kimliğin güneşi kendi yerinde). */
  sunX?: number;
  /** Ufuk yüksekliği %. Verilmezse seed'den türetilir. */
  horizon?: number;
  height: number;
  tag?: string;
  radius?: number;
}

export const PaintedPlate: React.FC<PaintedPlateProps> = ({
  colors, seed, sunX, horizon, height, tag, radius = 7,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const sx = sunX ?? 18 + (seed % 63);
  const hz = horizon ?? 52 + ((seed >>> 5) % 15);
  const [shadow, mid] = colors;
  // Değer-bazlı bağımlılık: çağıran colors dizisini her render'da yeniden kurabilir
  // (RecipeStep map içinde paletteColors çağırır) — referans değil İÇERİK değişince boya.
  const colorKey = colors.join('|');
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const paint = () => {
      const cssW = canvas.clientWidth || 300;
      const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
      const w = Math.max(1, Math.round(cssW * dpr));
      const hh = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== w || canvas.height !== hh) { canvas.width = w; canvas.height = hh; }
      const ctx = canvas.getContext('2d');
      if (!ctx) return; // jsdom/test: fallback gradyan zaten altta
      ctx.clearRect(0, 0, w, hh);
      paintPlate(ctx, w, hh, { colors, seed, sunX: sx, horizon: hz });
    };
    paint();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(paint) : null;
    ro?.observe(canvas);
    return () => ro?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- colors içerik anahtarıyla (colorKey) izlenir
  }, [colorKey, seed, sx, hz, height]);
  return (
    <div
      aria-hidden
      style={{
        position: 'relative', width: '100%', height, borderRadius: radius, overflow: 'hidden',
        background: `linear-gradient(180deg, ${mixHex(shadow, mid, 0.45)}, ${mixHex(shadow, '#000000', 0.3)})`,
        boxShadow: 'inset 0 1px 0 rgba(255,244,224,0.16), inset 0 -12px 20px -14px rgba(0,0,0,0.7)',
      }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
      {tag && (
        <span style={{
          position: 'absolute', left: 8, bottom: 6, maxWidth: 'calc(100% - 16px)',
          fontSize: 8.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
          fontFamily: 'var(--m2-font-mono)', color: 'rgba(255,250,240,0.92)',
          textShadow: '0 1px 6px rgba(10,5,2,0.7)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{tag}</span>
      )}
    </div>
  );
};
