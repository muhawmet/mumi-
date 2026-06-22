import { useEffect, useRef, useCallback } from 'react';
import type { PreviewCategory } from '../core/preview';
import { REF_SCENES, WORLD_SCENES } from './refScenes';

/* ============================================================
   CanvasPreview — GPU-friendly, palette-driven, category-aware
   live preview engine. Replaces static emoji icons with a rich
   animated canvas that reacts to world, palette & reference.
   ============================================================ */

interface CanvasPreviewProps {
  colors: string[];          // 4 palette colors [c0, c1, c2, c3]
  category: PreviewCategory; // 'arcane' | 'verse' | 'edu' | 'anime' | 'real'
  previewType: string;       // ref.preview key e.g. 'blade', 'spiral', 'pixar'
  worldId: string;           // e.g. 'clay', 'paper', 'painterly_shadow'
  refId?: string;            // selected reference id — if it has a dedicated scene, that wins
}

// ── hex → rgba helper ──────────────────────────────────────
function hexToRgba(hex: string, alpha = 1): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${alpha})`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16) || 0,
    parseInt(h.substring(2, 4), 16) || 0,
    parseInt(h.substring(4, 6), 16) || 0,
  ];
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// ── Particle class ──────────────────────────────────────────
class Particle {
  x: number; y: number; vx: number; vy: number;
  size: number; color: string; life: number; maxLife: number;
  constructor(x: number, y: number, color: string, opts?: Partial<{vx:number;vy:number;size:number;life:number}>) {
    this.x = x; this.y = y;
    this.vx = opts?.vx ?? (Math.random() - 0.5) * 0.8;
    this.vy = opts?.vy ?? (Math.random() - 0.5) * 0.8;
    this.size = opts?.size ?? Math.random() * 2.5 + 0.5;
    this.maxLife = opts?.life ?? 200 + Math.random() * 300;
    this.life = this.maxLife;
    this.color = color;
  }
  update(w: number, h: number) {
    this.x += this.vx; this.y += this.vy; this.life--;
    if (this.x < 0) this.x = w; if (this.x > w) this.x = 0;
    if (this.y < 0) this.y = h; if (this.y > h) this.y = 0;
  }
  draw(ctx: CanvasRenderingContext2D) {
    const alpha = Math.max(0, this.life / this.maxLife) * 0.8;
    ctx.fillStyle = this.color.replace(/[\d.]+\)$/, `${alpha})`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Renderers by category ───────────────────────────────────

function renderEdu(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, colors: string[]) {
  // Soft, warm, clay-like organic bubbles floating gently
  const cx = w / 2, cy = h / 2;

  // Warm background glow
  const bg = ctx.createRadialGradient(cx, cy * 0.6, 0, cx, cy, w * 0.6);
  bg.addColorStop(0, hexToRgba(colors[0], 0.25));
  bg.addColorStop(0.5, hexToRgba(colors[1], 0.08));
  bg.addColorStop(1, 'transparent');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Floating clay orbs
  for (let i = 0; i < 5; i++) {
    const angle = t * 0.0008 + (i * Math.PI * 2) / 5;
    const radius = 30 + i * 12;
    const ox = cx + Math.cos(angle) * (w * 0.22) * (0.6 + i * 0.08);
    const oy = cy + Math.sin(angle * 0.7) * (h * 0.18) * (0.6 + i * 0.08);
    const orbSize = radius + Math.sin(t * 0.002 + i) * 6;

    const grad = ctx.createRadialGradient(ox - orbSize * 0.3, oy - orbSize * 0.3, 0, ox, oy, orbSize);
    grad.addColorStop(0, hexToRgba(colors[i % 4], 0.7));
    grad.addColorStop(0.7, hexToRgba(colors[i % 4], 0.3));
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(ox, oy, orbSize, orbSize * 0.92, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle highlight streak
  ctx.strokeStyle = hexToRgba(colors[3], 0.12);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.5 + Math.sin(t * 0.001) * 20);
  for (let x = 0; x <= w; x += 4) {
    ctx.lineTo(x, h * 0.5 + Math.sin(t * 0.001 + x * 0.02) * 20);
  }
  ctx.stroke();
}

function renderArcane(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, colors: string[], particles: Particle[]) {
  // Dark, painterly, deep shadows with glowing accent particles
  const cx = w / 2, cy = h / 2;

  // Deep vignette
  const vig = ctx.createRadialGradient(cx, cy, w * 0.1, cx, cy, w * 0.55);
  vig.addColorStop(0, hexToRgba(colors[2], 0.3));
  vig.addColorStop(1, hexToRgba(colors[2], 0.8));
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  // Painterly glow nucleus
  const nuc = ctx.createRadialGradient(cx * 0.7, cy * 0.6, 0, cx * 0.7, cy * 0.6, w * 0.35);
  nuc.addColorStop(0, hexToRgba(colors[0], 0.35));
  nuc.addColorStop(0.5, hexToRgba(colors[1], 0.1));
  nuc.addColorStop(1, 'transparent');
  ctx.fillStyle = nuc;
  ctx.fillRect(0, 0, w, h);

  // Arcane energy arcs
  ctx.strokeStyle = hexToRgba(colors[1], 0.25);
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const startAngle = t * 0.0006 + i * 2;
    for (let a = 0; a < Math.PI * 1.5; a += 0.05) {
      const r = 40 + i * 25 + Math.sin(a * 3 + t * 0.002) * 12;
      ctx.lineTo(cx + Math.cos(startAngle + a) * r, cy + Math.sin(startAngle + a) * r);
    }
    ctx.stroke();
  }

  // Floating ember particles
  while (particles.length < 100) {
    particles.push(new Particle(
      Math.random() * w, Math.random() * h,
      hexToRgba(colors[Math.random() > 0.5 ? 0 : 1], 0.8),
      { vx: (Math.random() - 0.5) * 0.4, vy: -Math.random() * 0.6 - 0.2, size: Math.random() * 2 + 0.5 }
    ));
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update(w, h);
    particles[i].draw(ctx);
    if (particles[i].life <= 0) particles.splice(i, 1);
  }
}

function renderAnime(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, colors: string[]) {
  const cx = w / 2, cy = h / 2;

  // Speed lines radiating from center
  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2 + t * 0.0003;
    const len = 30 + Math.sin(t * 0.003 + i * 0.5) * 15;
    const startR = 20;
    ctx.strokeStyle = hexToRgba(colors[i % 2 === 0 ? 0 : 1], 0.15 + Math.sin(t * 0.004 + i) * 0.1);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * startR, Math.sin(angle) * startR);
    ctx.lineTo(Math.cos(angle) * (startR + len), Math.sin(angle) * (startR + len));
    ctx.stroke();
  }
  ctx.restore();

  // Central energy burst
  const burst = ctx.createRadialGradient(cx, cy, 0, cx, cy, 35);
  burst.addColorStop(0, hexToRgba(colors[3], 0.5));
  burst.addColorStop(0.4, hexToRgba(colors[0], 0.2));
  burst.addColorStop(1, 'transparent');
  ctx.fillStyle = burst;
  ctx.fillRect(0, 0, w, h);

  // Horizontal accent lines (anime cel aesthetic)
  for (let i = 0; i < 3; i++) {
    const y = h * (0.25 + i * 0.25);
    ctx.strokeStyle = hexToRgba(colors[1], 0.08);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function renderVerse(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, colors: string[]) {
  // Graphic halftone / comic panels with bold geometric shapes
  const cx = w / 2, cy = h / 2;

  // Panel dividers
  ctx.strokeStyle = hexToRgba(colors[0], 0.4);
  ctx.lineWidth = 3;
  const splitX = cx + Math.sin(t * 0.001) * 10;
  ctx.beginPath(); ctx.moveTo(splitX, 0); ctx.lineTo(splitX, h); ctx.stroke();
  const splitY = cy + Math.cos(t * 0.0008) * 8;
  ctx.beginPath(); ctx.moveTo(0, splitY); ctx.lineTo(w, splitY); ctx.stroke();

  // Halftone dot pattern
  const dotSpacing = 8;
  for (let x = 0; x < w; x += dotSpacing) {
    for (let y = 0; y < h; y += dotSpacing) {
      const dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
      const dotSize = Math.max(0.5, 2.5 - dist / (w * 0.3));
      ctx.fillStyle = hexToRgba(colors[1], 0.06);
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Bold diagonal action line
  ctx.strokeStyle = hexToRgba(colors[0], 0.2);
  ctx.lineWidth = 4;
  ctx.beginPath();
  const offset = Math.sin(t * 0.001) * 20;
  ctx.moveTo(w * 0.15, h * 0.15 + offset);
  ctx.lineTo(w * 0.85, h * 0.85 - offset);
  ctx.stroke();

  // Accent circle
  ctx.strokeStyle = hexToRgba(colors[1], 0.3);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 25 + Math.sin(t * 0.002) * 5, 0, Math.PI * 2);
  ctx.stroke();
}

function renderReal(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, colors: string[]) {
  // Cinematic letterbox, subtle light, lens flare — premium, restrained
  const cx = w / 2, cy = h / 2;

  // Letterbox bars
  const barH = h * 0.12;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, w, barH);
  ctx.fillRect(0, h - barH, w, barH);

  // Subtle cross-hatch rule of thirds
  ctx.strokeStyle = hexToRgba(colors[3], 0.06);
  ctx.lineWidth = 0.5;
  for (let i = 1; i <= 2; i++) {
    ctx.beginPath(); ctx.moveTo(w * i / 3, barH); ctx.lineTo(w * i / 3, h - barH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, barH + (h - 2 * barH) * i / 3); ctx.lineTo(w, barH + (h - 2 * barH) * i / 3); ctx.stroke();
  }

  // Anamorphic flare
  const flareX = cx + Math.sin(t * 0.0005) * w * 0.25;
  const flare = ctx.createRadialGradient(flareX, cy, 0, flareX, cy, w * 0.4);
  flare.addColorStop(0, hexToRgba(colors[0], 0.15));
  flare.addColorStop(0.3, hexToRgba(colors[1], 0.05));
  flare.addColorStop(1, 'transparent');
  ctx.fillStyle = flare;
  ctx.fillRect(0, 0, w, h);

  // Horizontal lens streak
  ctx.strokeStyle = hexToRgba(colors[0], 0.1 + Math.sin(t * 0.001) * 0.05);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(w, cy);
  ctx.stroke();
}

// ── Motif overlays (based on ref.preview type) ──────────────

function renderMotif(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, colors: string[], type: string) {
  const cx = w / 2, cy = h / 2;

  switch (type) {
    case 'blade': {
      // Diagonal energy slash
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.sin(t * 0.001) * 0.15 - 0.3);
      const grad = ctx.createLinearGradient(-w * 0.4, 0, w * 0.4, 0);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.4, hexToRgba(colors[3], 0.5));
      grad.addColorStop(0.5, hexToRgba(colors[3], 0.8));
      grad.addColorStop(0.6, hexToRgba(colors[3], 0.5));
      grad.addColorStop(1, 'transparent');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-w * 0.4, -h * 0.3);
      ctx.lineTo(w * 0.4, h * 0.3);
      ctx.stroke();
      ctx.restore();
      break;
    }
    case 'spiral': {
      ctx.strokeStyle = hexToRgba(colors[0], 0.2);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 6; a += 0.05) {
        const r = a * 4 + Math.sin(t * 0.001) * 3;
        ctx.lineTo(cx + Math.cos(a + t * 0.0008) * r, cy + Math.sin(a + t * 0.0008) * r);
      }
      ctx.stroke();
      break;
    }
    case 'aura': {
      for (let i = 3; i >= 0; i--) {
        const r = 20 + i * 15 + Math.sin(t * 0.002 + i) * 5;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, hexToRgba(colors[i % 4], 0.3 - i * 0.06));
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'orb':
    case 'pixar': {
      const orbR = 35 + Math.sin(t * 0.0015) * 5;
      const grad = ctx.createRadialGradient(cx - 10, cy - 12, 0, cx, cy, orbR);
      grad.addColorStop(0, hexToRgba(colors[3], 0.6));
      grad.addColorStop(0.5, hexToRgba(colors[1], 0.3));
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
      ctx.fill();
      // Rim highlight
      ctx.strokeStyle = hexToRgba(colors[3], 0.15);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, orbR + 2, -0.5, 1.2);
      ctx.stroke();
      break;
    }
    case 'neon':
    case 'neonnoir':
    case 'cyberpunk':
    case 'cyber': {
      // Neon grid lines
      ctx.strokeStyle = hexToRgba(colors[0], 0.12);
      ctx.lineWidth = 0.5;
      for (let y = 0; y < h; y += 12) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      // Neon glow stripe
      const ny = cy + Math.sin(t * 0.001) * 15;
      ctx.shadowBlur = 12;
      ctx.shadowColor = colors[1];
      ctx.strokeStyle = hexToRgba(colors[1], 0.5);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, ny); ctx.lineTo(w, ny); ctx.stroke();
      ctx.shadowBlur = 0;
      break;
    }
    case 'halftone':
    case 'doc': {
      // Documentary grain
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 16) {
        const noise = (Math.random() - 0.5) * 12;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
      }
      ctx.putImageData(imageData, 0, 0);
      break;
    }
    default: {
      // Generic: subtle grid + floating dot
      ctx.strokeStyle = hexToRgba(colors[2], 0.04);
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 24) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 24) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      // Floating accent dot
      const dotX = cx + Math.sin(t * 0.001) * 30;
      const dotY = cy + Math.cos(t * 0.0013) * 20;
      ctx.fillStyle = hexToRgba(colors[0], 0.25);
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ── Main Component ──────────────────────────────────────────

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({ colors, category, previewType, worldId, refId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const reducedMotionRef = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = rect.width;
    const h = rect.height;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }

    const t = performance.now();

    // Clear with dark base
    const isDark = luminance(colors[2]) < 0.3;
    ctx.fillStyle = isDark ? colors[2] : '#0a0c14';
    ctx.fillRect(0, 0, w, h);

    // Dedicated reference wins; otherwise the selected render world supplies
    // the composition before the broad category fallback is considered.
    const refScene = refId ? REF_SCENES[refId] : undefined;
    const worldScene = WORLD_SCENES[worldId];
    const dedicatedScene = refScene ?? worldScene;
    if (dedicatedScene) {
      dedicatedScene(ctx, w, h, t, colors);
      // subtle scanline polish on top
      ctx.fillStyle = 'rgba(255,255,255,0.01)';
      for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
      if (!reducedMotionRef.current) frameRef.current = requestAnimationFrame(draw);
      return;
    }

    // Category-specific base layer
    switch (category) {
      case 'edu':   renderEdu(ctx, w, h, t, colors); break;
      case 'arcane': renderArcane(ctx, w, h, t, colors, particlesRef.current); break;
      case 'anime': renderAnime(ctx, w, h, t, colors); break;
      case 'verse': renderVerse(ctx, w, h, t, colors); break;
      case 'real':  renderReal(ctx, w, h, t, colors); break;
    }

    // Motif overlay from reference preview type
    renderMotif(ctx, w, h, t, colors, previewType);

    // Subtle scanline overlay for cinematic polish
    ctx.fillStyle = 'rgba(255,255,255,0.01)';
    for (let y = 0; y < h; y += 3) {
      ctx.fillRect(0, y, w, 1);
    }

    if (!reducedMotionRef.current) frameRef.current = requestAnimationFrame(draw);
  }, [colors, category, previewType, worldId, refId]);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const syncMotionPreference = () => {
      reducedMotionRef.current = media?.matches ?? false;
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(draw);
    };

    particlesRef.current = [];
    syncMotionPreference();
    media?.addEventListener('change', syncMotionPreference);
    return () => {
      cancelAnimationFrame(frameRef.current);
      media?.removeEventListener('change', syncMotionPreference);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        borderRadius: 'inherit',
      }}
    />
  );
};
