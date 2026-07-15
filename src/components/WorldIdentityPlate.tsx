import React from 'react';
import { mix, paintWorldIdentity, worldPlateColors, type PlateColors } from './worldPlateArt';

/* =============================================================
   WorldIdentityPlate — dünya kapağının prosedürel gövdesi.
   Kapak webp'i gelene dek her dünya KENDİ görsel yasasıyla okunur
   (worldPlateArt painter'ları). PaintedPlate deseninin varisi ama
   motif dünyaya aittir, ortak deniz-günbatımı yoktur.

   Perf sözleşmesi:
   - Plaka offscreen canvas'a BİR KEZ boyanır, worldId|boyut anahtarıyla
     modül cache'inde yaşar; görünür canvas sadece drawImage yapar.
   - Genişlik 32px kovalara yuvarlanır — resize cache'i çalkalamaz.
   - Effect renk İÇERİĞİNİ izler (colorKey), referansı değil
     (PaintedPlate repaint-fırtınası dersi).
   ============================================================= */

const plateCache = new Map<string, HTMLCanvasElement>();
const PLATE_CACHE_LIMIT = 240; // 46 dünya × birkaç boyut kovası; taşarsa boyamak ucuz, sızıntı pahalı

/** Offscreen plaka — cache'li. jsdom'da (2d context yok) null döner, CSS fallback kalır. */
export function worldPlateCanvas(worldId: string, w: number, h: number, colors?: PlateColors): HTMLCanvasElement | null {
  const key = `${worldId}|${w}x${h}`;
  const hit = plateCache.get(key);
  if (hit) return hit;
  if (typeof document === 'undefined') return null;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  if (!ctx) return null;
  paintWorldIdentity(ctx, w, h, worldId, colors);
  if (plateCache.size >= PLATE_CACHE_LIMIT) plateCache.clear();
  plateCache.set(key, cv);
  return cv;
}

/** Test izolasyonu için. */
export function resetWorldPlateCache(): void {
  plateCache.clear();
}

export interface WorldIdentityPlateProps {
  worldId: string;
  height: number;
  /** Verilmezse dünyanın palette_lock dörtlüsünden çözülür (SADECE okuma). */
  colors?: PlateColors;
  tag?: string;
  radius?: number;
}

export const WorldIdentityPlate: React.FC<WorldIdentityPlateProps> = ({
  worldId, height, colors, tag, radius = 7,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const resolved = colors ?? worldPlateColors(worldId);
  const [S, M] = resolved;
  const colorKey = resolved.join('|');
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const cssW = canvas.clientWidth || 300;
      const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
      // 32px kova: resize sırasında cache anahtarı sabit kalır
      const w = Math.max(64, Math.round((cssW * dpr) / 32) * 32);
      const hh = Math.max(32, Math.round(height * dpr));
      if (canvas.width !== w || canvas.height !== hh) { canvas.width = w; canvas.height = hh; }
      const ctx = canvas.getContext('2d');
      if (!ctx) return; // jsdom/test: alttaki CSS fallback kalır
      const plate = worldPlateCanvas(worldId, w, hh, resolved);
      if (!plate) return;
      ctx.clearRect(0, 0, w, hh);
      ctx.drawImage(plate, 0, 0);
    };
    draw();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(draw) : null;
    ro?.observe(canvas);
    return () => ro?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- renkler içerik anahtarıyla (colorKey) izlenir
  }, [worldId, colorKey, height]);
  return (
    <div
      aria-hidden
      style={{
        position: 'relative', width: '100%', height, borderRadius: radius, overflow: 'hidden',
        background: `linear-gradient(180deg, ${mix(S, M, 0.4)}, ${mix(S, '#000000', 0.3)})`,
        boxShadow: 'inset 0 1px 0 rgba(255,244,224,0.14), inset 0 -12px 20px -14px rgba(0,0,0,0.7)',
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
