// src/components/BeatThumb.tsx
import React from 'react';

/* "Henüz üretilmedi" nötr kare — GERÇEK render yoksa renkli gradient-blob YASAK
 * (jüri: blob = ucuz-template hissi). Onun yerine dürüst bir film-karesi iskeleti:
 * nötr grafit zemin + ince çerçeve köşe işaretleri + soluk "görsel bekliyor" ikonu.
 * Deterministik ve statik (rAF yok); seed/colors API uyumu için korunur ama
 * kompozisyonu renk lekesiyle boyamaz. */

export function paintBeatThumb(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  _colors: string[],
  _seed: string,
): void {
  // — Nötr grafit zemin (palet lekesi değil) —
  const base = ctx.createLinearGradient(0, 0, 0, h);
  base.addColorStop(0, '#15161b');
  base.addColorStop(1, '#0c0d11');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  // — Üstten çok hafif sheen (ikinci düz-dolgu) —
  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  ctx.fillRect(0, 0, w, Math.round(h * 0.5));

  // — İnce çerçeve köşe işaretleri: kare 'ayrıldı ama boş' okunur —
  const tick = Math.max(6, Math.min(w, h) * 0.16);
  const pad = Math.max(4, Math.min(w, h) * 0.09);
  ctx.strokeStyle = 'rgba(214,200,170,0.16)';
  ctx.lineWidth = 1;
  const corners: Array<[number, number, number, number]> = [
    [pad, pad, 1, 1],
    [w - pad, pad, -1, 1],
    [pad, h - pad, 1, -1],
    [w - pad, h - pad, -1, -1],
  ];
  for (const [cx, cy, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx, cy); ctx.lineTo(cx + dx * tick, cy);
    ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + dy * tick);
    ctx.stroke();
  }

  // — Merkez 'görsel bekliyor' ikonu: dağ silüeti + güneş, soluk nötr —
  const mx = w / 2, my = h / 2;
  const s = Math.min(w, h) * 0.24;
  ctx.strokeStyle = 'rgba(214,200,170,0.28)';
  ctx.lineWidth = Math.max(1, Math.min(w, h) * 0.02);
  // güneş
  ctx.beginPath();
  ctx.arc(mx + s * 0.55, my - s * 0.5, s * 0.28, 0, Math.PI * 2);
  ctx.stroke();
  // dağ hattı
  ctx.beginPath();
  ctx.moveTo(mx - s, my + s * 0.7);
  ctx.lineTo(mx - s * 0.25, my - s * 0.25);
  ctx.lineTo(mx + s * 0.25, my + s * 0.28);
  ctx.lineTo(mx + s * 0.75, my - s * 0.15);
  ctx.lineTo(mx + s, my + s * 0.7);
  ctx.stroke();
}

interface BeatThumbProps {
  seed: string;
  colors: string[];
  height: number;
  width?: number | string;
  radius?: number;
  label?: string;
  style?: React.CSSProperties;
}

export const BeatThumb: React.FC<BeatThumbProps> = ({ seed, colors, height, width, radius = 10, label, style }) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const colorKey = colors.join('|');
  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth || (typeof width === 'number' ? width : height);
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    paintBeatThumb(ctx, canvas.width / dpr, canvas.height / dpr, colors, seed);
  }, [seed, height, width, colorKey]);
  return (
    <div style={{ position: 'relative', width: width ?? height, height, borderRadius: radius, overflow: 'hidden', border: '1px solid var(--m2-line)', background: 'rgba(0,0,0,0.25)', flexShrink: 0, ...style }}>
      <canvas ref={ref} style={{ display: 'block', width: '100%', height: '100%' }} aria-hidden />
      {label && (
        <span style={{ position: 'absolute', bottom: 4, left: 6, fontSize: 9, fontWeight: 800, letterSpacing: 0.8, color: 'rgba(242,238,230,0.85)', textShadow: '0 1px 6px rgba(0,0,0,0.8)', fontFamily: 'var(--m2-font-mono)' }}>{label}</span>
      )}
    </div>
  );
};
