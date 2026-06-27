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
    case 'cinema': {
      ctx.fillStyle = 'rgba(0,0,0,0.72)';
      ctx.fillRect(0, 0, w, h * 0.12); ctx.fillRect(0, h * 0.88, w, h * 0.12);
      const csg = ctx.createLinearGradient(0, 0, cx, h);
      csg.addColorStop(0, hexToRgba(colors[0], 0.18)); csg.addColorStop(1, 'transparent');
      ctx.fillStyle = csg; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = hexToRgba(colors[3], 0.07); ctx.lineWidth = 0.5;
      [1/3, 2/3].forEach(f => {
        ctx.beginPath(); ctx.moveTo(w * f, h * 0.12); ctx.lineTo(w * f, h * 0.88); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, h * 0.12 + h * 0.76 * f); ctx.lineTo(w, h * 0.12 + h * 0.76 * f); ctx.stroke();
      });
      break;
    }
    case 'real': {
      const rkg = ctx.createLinearGradient(0, 0, w, 0);
      rkg.addColorStop(0, hexToRgba(colors[3], 0.2)); rkg.addColorStop(0.45, 'transparent');
      ctx.fillStyle = rkg; ctx.fillRect(0, 0, w, h);
      const rvg = ctx.createRadialGradient(cx, cy, w * 0.15, cx, cy, w * 0.58);
      rvg.addColorStop(0, 'transparent'); rvg.addColorStop(1, 'rgba(0,0,0,0.32)');
      ctx.fillStyle = rvg; ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'openair': {
      const oag = ctx.createLinearGradient(0, 0, 0, h);
      oag.addColorStop(0, hexToRgba(colors[0], 0.22)); oag.addColorStop(0.62, hexToRgba(colors[0], 0.04));
      oag.addColorStop(0.65, 'transparent'); oag.addColorStop(1, hexToRgba(colors[1], 0.14));
      ctx.fillStyle = oag; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = hexToRgba(colors[3], 0.18); ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(0, h * 0.62); ctx.lineTo(w, h * 0.62); ctx.stroke();
      const oasz = 7 + Math.sin(t * 0.0012) * 1.5;
      const oasg = ctx.createRadialGradient(w * 0.72, h * 0.28, 0, w * 0.72, h * 0.28, oasz * 3);
      oasg.addColorStop(0, hexToRgba(colors[3], 0.5)); oasg.addColorStop(1, 'transparent');
      ctx.fillStyle = oasg; ctx.beginPath(); ctx.arc(w * 0.72, h * 0.28, oasz * 3, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'tabletop': {
      const tsg = ctx.createLinearGradient(0, h * 0.55, 0, h);
      tsg.addColorStop(0, hexToRgba(colors[3], 0.16)); tsg.addColorStop(1, hexToRgba(colors[2], 0.05));
      ctx.fillStyle = tsg; ctx.fillRect(0, h * 0.55, w, h * 0.45);
      ctx.strokeStyle = hexToRgba(colors[3], 0.12); ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, h * 0.55); ctx.lineTo(w, h * 0.55); ctx.stroke();
      const ttspot = ctx.createRadialGradient(cx, 0, 0, cx, h * 0.55, w * 0.34);
      ttspot.addColorStop(0, hexToRgba(colors[3], 0.18)); ttspot.addColorStop(1, 'transparent');
      ctx.fillStyle = ttspot; ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'food': {
      const fdg = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.44);
      fdg.addColorStop(0, hexToRgba(colors[3], 0.28)); fdg.addColorStop(1, 'transparent');
      ctx.fillStyle = fdg; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = hexToRgba(colors[1], 0.08 - i * 0.02);
        ctx.lineWidth = 4 - i;
        ctx.beginPath(); ctx.ellipse(cx, cy + h * 0.08, w * (0.2 + i * 0.07), h * (0.055 + i * 0.03), 0, 0, Math.PI * 2); ctx.stroke();
      }
      break;
    }
    case 'gothic': {
      ctx.strokeStyle = hexToRgba(colors[3], 0.16); ctx.lineWidth = 1.2;
      const gaw = w * 0.24, gay = h * 0.52;
      ctx.beginPath(); ctx.moveTo(cx - gaw, h * 0.94); ctx.lineTo(cx - gaw, gay);
      ctx.arc(cx, gay, gaw, -Math.PI, 0); ctx.lineTo(cx + gaw, h * 0.94); ctx.stroke();
      const gmg = ctx.createLinearGradient(0, h * 0.62, 0, h);
      gmg.addColorStop(0, 'transparent'); gmg.addColorStop(1, hexToRgba(colors[2], 0.28));
      ctx.fillStyle = gmg; ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'gothicblue': {
      ctx.strokeStyle = hexToRgba(colors[0], 0.16); ctx.lineWidth = 1.2;
      const gbaw = w * 0.24, gbay = h * 0.52;
      ctx.beginPath(); ctx.moveTo(cx - gbaw, h * 0.94); ctx.lineTo(cx - gbaw, gbay);
      ctx.arc(cx, gbay, gbaw, -Math.PI, 0); ctx.lineTo(cx + gbaw, h * 0.94); ctx.stroke();
      const gbmg = ctx.createRadialGradient(cx, h * 0.2, 0, cx, h * 0.5, w * 0.4);
      gbmg.addColorStop(0, hexToRgba(colors[0], 0.18)); gbmg.addColorStop(1, 'transparent');
      ctx.fillStyle = gbmg; ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'ashen': {
      for (let i = 0; i < 30; i++) {
        const ax = (Math.sin(i * 5.2 + t * 0.0005) * 0.5 + 0.5) * w;
        const ay = ((Math.sin(i * 3.7) * 0.5 + 0.5) * h - (t * 0.008 * (0.3 + Math.sin(i * 1.7) * 0.3)) % h + h) % h;
        const asp = Math.sin(i * 2.1) * 0.5 + 1.3;
        ctx.fillStyle = hexToRgba(colors[3], 0.12 + Math.sin(i) * 0.06);
        ctx.beginPath(); ctx.arc(ax, ay, asp, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'car':
    case 'auto': {
      const carg = ctx.createLinearGradient(0, cy - 10, 0, cy + 10);
      carg.addColorStop(0, 'transparent'); carg.addColorStop(0.5, hexToRgba(colors[3], 0.32)); carg.addColorStop(1, 'transparent');
      ctx.fillStyle = carg; ctx.fillRect(0, cy - 10, w, 20);
      const carhl = ctx.createLinearGradient(w * 0.55, 0, w, h);
      carhl.addColorStop(0, hexToRgba(colors[3], 0.14)); carhl.addColorStop(1, 'transparent');
      ctx.fillStyle = carhl; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = hexToRgba(colors[3], 0.1); ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, h * 0.7); ctx.lineTo(w, h * 0.7); ctx.stroke();
      break;
    }
    case 'tech': {
      ctx.strokeStyle = hexToRgba(colors[0], 0.1); ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 22) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 22) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ([[0.25, 0.3], [0.75, 0.62], [0.5, 0.5], [0.15, 0.72]] as const).forEach(([fx, fy]) => {
        ctx.fillStyle = hexToRgba(colors[1], 0.2);
        ctx.beginPath(); ctx.arc(w * fx, h * fy, 3.5, 0, Math.PI * 2); ctx.fill();
      });
      ctx.strokeStyle = hexToRgba(colors[1], 0.22); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(w * 0.15, h * 0.72); ctx.lineTo(w * 0.25, h * 0.3); ctx.lineTo(w * 0.5, h * 0.5); ctx.lineTo(w * 0.75, h * 0.62); ctx.stroke();
      break;
    }
    case 'shadow': {
      ctx.fillStyle = hexToRgba(colors[2], 0.16);
      ([0.05, 0.3, 0.55, 0.8] as const).forEach(fx => {
        ctx.beginPath(); ctx.moveTo(w * fx, -10); ctx.lineTo(w * fx + h * 0.85, h + 10);
        ctx.lineTo(w * fx + h * 0.85 + 26, h + 10); ctx.lineTo(w * fx + 26, -10); ctx.fill();
      });
      break;
    }
    case 'fantasy':
    case 'elemental': {
      ctx.strokeStyle = hexToRgba(colors[1], 0.2); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, h * 0.16); ctx.lineTo(cx - 18, h * 0.6); ctx.lineTo(cx, h * 0.72); ctx.lineTo(cx + 18, h * 0.6); ctx.closePath(); ctx.stroke();
      const fmg = ctx.createRadialGradient(cx, h * 0.44, 0, cx, h * 0.44, 55);
      fmg.addColorStop(0, hexToRgba(colors[1], 0.18)); fmg.addColorStop(1, 'transparent');
      ctx.fillStyle = fmg; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 7; i++) {
        const fsx = cx + Math.sin(i * 1.3 + t * 0.001) * 44;
        const fsy = h * 0.4 + Math.cos(i * 1.1 + t * 0.0007) * 38;
        ctx.fillStyle = hexToRgba(colors[3], 0.38);
        ctx.beginPath(); ctx.arc(fsx, fsy, 1.8, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'graphic': {
      ctx.strokeStyle = hexToRgba(colors[0], 0.28); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(w * 0.5, 0); ctx.lineTo(w * 0.5, h); ctx.stroke();
      ctx.strokeStyle = hexToRgba(colors[1], 0.22); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, h * 0.45); ctx.lineTo(w, h * 0.45); ctx.stroke();
      ctx.fillStyle = hexToRgba(colors[3], 0.12);
      ctx.beginPath(); ctx.moveTo(w * 0.1, h * 0.1); ctx.lineTo(w * 0.45, h * 0.1);
      ctx.lineTo(w * 0.45, h * 0.42); ctx.lineTo(w * 0.1, h * 0.42); ctx.closePath(); ctx.fill();
      break;
    }
    case 'western': {
      const wsg = ctx.createLinearGradient(0, 0, w, 0);
      wsg.addColorStop(0, hexToRgba(colors[1], 0.2)); wsg.addColorStop(0.6, hexToRgba(colors[3], 0.08)); wsg.addColorStop(1, 'transparent');
      ctx.fillStyle = wsg; ctx.fillRect(0, 0, w, h);
      const wdust = ctx.createLinearGradient(0, h * 0.7, 0, h);
      wdust.addColorStop(0, 'transparent'); wdust.addColorStop(1, hexToRgba(colors[1], 0.22));
      ctx.fillStyle = wdust; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = hexToRgba(colors[3], 0.14); ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, h * 0.68); ctx.lineTo(w, h * 0.68); ctx.stroke();
      break;
    }
    case 'cozy': {
      const czg = ctx.createRadialGradient(w * 0.35, h * 0.4, 0, w * 0.35, h * 0.4, w * 0.52);
      czg.addColorStop(0, hexToRgba(colors[3], 0.22)); czg.addColorStop(1, 'transparent');
      ctx.fillStyle = czg; ctx.fillRect(0, 0, w, h);
      const czg2 = ctx.createLinearGradient(0, h * 0.7, 0, h);
      czg2.addColorStop(0, 'transparent'); czg2.addColorStop(1, hexToRgba(colors[1], 0.12));
      ctx.fillStyle = czg2; ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'hero': {
      const hrg = ctx.createRadialGradient(cx, h, 0, cx, h, h);
      hrg.addColorStop(0, hexToRgba(colors[3], 0.28)); hrg.addColorStop(0.5, hexToRgba(colors[0], 0.1)); hrg.addColorStop(1, 'transparent');
      ctx.fillStyle = hrg; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = hexToRgba(colors[3], 0.07);
      ([-1, 0, 1] as const).forEach(i => {
        ctx.beginPath(); ctx.moveTo(cx + i * 20, h); ctx.lineTo(cx + i * 20 - 14, 0); ctx.lineTo(cx + i * 20 + 14, 0); ctx.fill();
      });
      break;
    }
    case 'pop': {
      const pcols = [colors[0], colors[1], colors[3]];
      ([[0, 0], [w * 0.5, 0], [0, h * 0.5], [w * 0.5, h * 0.5]] as [number, number][]).forEach(([px, py], i) => {
        ctx.fillStyle = hexToRgba(pcols[i % 3], 0.12);
        ctx.fillRect(px, py, w * 0.5, h * 0.5);
      });
      ctx.strokeStyle = hexToRgba(colors[2], 0.25); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(w * 0.5, 0); ctx.lineTo(w * 0.5, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, h * 0.5); ctx.lineTo(w, h * 0.5); ctx.stroke();
      break;
    }
    case 'retro': {
      for (let i = 0; i < 6; i++) {
        const ry = h * 0.2 + i * h * 0.13;
        ctx.strokeStyle = hexToRgba(i % 2 ? colors[1] : colors[0], 0.14);
        ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(w, ry); ctx.stroke();
      }
      ctx.fillStyle = hexToRgba(colors[3], 0.1);
      ctx.beginPath(); ctx.arc(w * 0.72, h * 0.32, 28, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'deco': {
      ctx.save(); ctx.translate(cx, h * 1.1);
      for (let i = -7; i <= 7; i++) {
        ctx.strokeStyle = hexToRgba(i % 2 ? colors[3] : colors[1], 0.1 + Math.abs(i) * 0.006);
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(i * 0.13) * w, -Math.sin(Math.abs(i) * 0.13 + 0.2) * h); ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = hexToRgba(colors[3], 0.12); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.rect(w * 0.14, h * 0.12, w * 0.72, h * 0.76); ctx.stroke();
      break;
    }
    case 'arch': {
      ctx.strokeStyle = hexToRgba(colors[3], 0.1); ctx.lineWidth = 0.8;
      ([0.05, 0.25, 0.45, 0.55, 0.75, 0.95] as const).forEach(fx => {
        ctx.beginPath(); ctx.moveTo(w * fx, 0); ctx.lineTo(cx, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w * fx, h); ctx.lineTo(cx, cy); ctx.stroke();
      });
      ctx.strokeStyle = hexToRgba(colors[3], 0.06);
      ([0.25, 0.45, 0.55, 0.75] as const).forEach(fy => {
        ctx.beginPath(); ctx.moveTo(0, h * fy); ctx.lineTo(w, h * fy); ctx.stroke();
      });
      break;
    }
    case 'noir': {
      const nog = ctx.createLinearGradient(0, 0, w, h);
      nog.addColorStop(0, hexToRgba(colors[3], 0.12)); nog.addColorStop(0.45, 'transparent'); nog.addColorStop(0.55, hexToRgba(colors[2], 0.4));
      ctx.fillStyle = nog; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = hexToRgba(colors[2], 0.3); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w, h); ctx.stroke();
      break;
    }
    case 'mecha': {
      ctx.strokeStyle = hexToRgba(colors[0], 0.18); ctx.lineWidth = 0.8;
      for (let y = h * 0.25; y < h; y += h * 0.18) {
        ctx.beginPath(); ctx.moveTo(w * 0.3, y); ctx.lineTo(w * 0.68, y); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(w * 0.3, 0); ctx.lineTo(w * 0.3, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.68, 0); ctx.lineTo(w * 0.68, h); ctx.stroke();
      ctx.strokeStyle = hexToRgba(colors[1], 0.22); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, 32, 0, Math.PI * 2); ctx.stroke();
      break;
    }
    case 'underworld': {
      const uwg = ctx.createRadialGradient(cx, h, 0, cx, h * 0.4, w * 0.55);
      uwg.addColorStop(0, hexToRgba(colors[0], 0.35)); uwg.addColorStop(1, 'transparent');
      ctx.fillStyle = uwg; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 12; i++) {
        const ux = w * (0.15 + (i / 11) * 0.7), uy = h * 0.94;
        const uht = h * (0.18 + Math.sin(i * 2.1) * 0.12);
        ctx.fillStyle = hexToRgba(colors[2], 0.5 + Math.sin(i) * 0.15);
        ctx.beginPath(); ctx.moveTo(ux - 6, uy); ctx.lineTo(ux, uy - uht); ctx.lineTo(ux + 6, uy); ctx.fill();
      }
      break;
    }
    case 'desert': {
      const deg = ctx.createLinearGradient(0, 0, 0, h);
      deg.addColorStop(0, hexToRgba(colors[1], 0.2)); deg.addColorStop(0.55, hexToRgba(colors[3], 0.08));
      deg.addColorStop(0.58, 'transparent'); deg.addColorStop(1, hexToRgba(colors[1], 0.15));
      ctx.fillStyle = deg; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = hexToRgba(colors[1], 0.12);
      ctx.beginPath(); ctx.moveTo(0, h * 0.7);
      ctx.quadraticCurveTo(w * 0.4, h * 0.48, w * 0.7, h * 0.66);
      ctx.quadraticCurveTo(w * 0.85, h * 0.55, w, h * 0.7); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
      break;
    }
    case 'tactical': {
      ctx.strokeStyle = hexToRgba(colors[1], 0.25); ctx.lineWidth = 1;
      const tlen = 22;
      ([[cx-40,cy-40],[cx+40,cy-40],[cx-40,cy+40],[cx+40,cy+40]] as [number,number][]).forEach(([tx, ty]) => {
        const dx = tx < cx ? 1 : -1, dy = ty < cy ? 1 : -1;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + dx * tlen, ty); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx, ty + dy * tlen); ctx.stroke();
      });
      ctx.strokeStyle = hexToRgba(colors[1], 0.15); ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI * 2); ctx.stroke();
      break;
    }
    case 'lab': {
      ctx.strokeStyle = hexToRgba(colors[0], 0.1); ctx.lineWidth = 0.4;
      for (let x = 0; x < w; x += 16) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.strokeStyle = hexToRgba(colors[1], 0.2); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, 36, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.stroke();
      break;
    }
    case 'overgrown': {
      ctx.strokeStyle = hexToRgba(colors[0], 0.18); ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      for (let i = 0; i < 8; i++) {
        const ogx = w * (0.1 + Math.sin(i * 1.7) * 0.4 + 0.4);
        ctx.beginPath(); ctx.moveTo(ogx, h);
        ctx.bezierCurveTo(ogx + Math.sin(i) * 20, h * 0.6, ogx - Math.cos(i) * 18 + Math.sin(t * 0.001 + i) * 6, h * 0.3, ogx + Math.sin(i) * 12, h * (0.15 + Math.sin(i * 0.9) * 0.12));
        ctx.stroke();
      }
      break;
    }
    case 'apple': {
      const apg = ctx.createRadialGradient(cx, cy - 20, 0, cx, cy - 20, w * 0.42);
      apg.addColorStop(0, hexToRgba(colors[3], 0.18)); apg.addColorStop(0.7, hexToRgba(colors[3], 0.04)); apg.addColorStop(1, 'transparent');
      ctx.fillStyle = apg; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = hexToRgba(colors[3], 0.6);
      ctx.beginPath(); ctx.arc(cx, cy - 12 + Math.sin(t * 0.001) * 4, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = hexToRgba(colors[3], 0.12); ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, h * 0.68); ctx.lineTo(w, h * 0.68); ctx.stroke();
      break;
    }
    case 'nike': {
      ctx.strokeStyle = hexToRgba(colors[0], 0.28); ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(w * 0.12, h * 0.62);
      ctx.bezierCurveTo(w * 0.3, h * 0.35, w * 0.65, h * 0.28, w * 0.9, h * 0.52);
      ctx.stroke();
      const nkg = ctx.createLinearGradient(0, h * 0.35, 0, h);
      nkg.addColorStop(0, 'transparent'); nkg.addColorStop(1, hexToRgba(colors[1], 0.08));
      ctx.fillStyle = nkg; ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'watch': {
      ctx.strokeStyle = hexToRgba(colors[3], 0.22); ctx.lineWidth = 1;
      ([42, 32, 18] as const).forEach(r => { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); });
      for (let i = 0; i < 12; i++) {
        const wa = (i / 12) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(wa) * 38, cy + Math.sin(wa) * 38);
        ctx.lineTo(cx + Math.cos(wa) * 42, cy + Math.sin(wa) * 42); ctx.stroke();
      }
      const wha = t * 0.001;
      ctx.strokeStyle = hexToRgba(colors[1], 0.4); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(wha) * 28, cy + Math.sin(wha) * 28); ctx.stroke();
      break;
    }
    case 'beauty': {
      const btg = ctx.createRadialGradient(cx, cy - 20, 0, cx, cy, w * 0.5);
      btg.addColorStop(0, hexToRgba(colors[3], 0.24)); btg.addColorStop(0.5, hexToRgba(colors[1], 0.08)); btg.addColorStop(1, 'transparent');
      ctx.fillStyle = btg; ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'verite': {
      for (let i = 0; i < 200; i++) {
        const vvx = (Math.sin(i * 17.3 + t * 0.008) * 0.5 + 0.5) * w;
        const vvy = (Math.cos(i * 13.7 + t * 0.007) * 0.5 + 0.5) * h;
        ctx.fillStyle = hexToRgba(colors[3], 0.03 + Math.sin(i) * 0.02);
        ctx.fillRect(vvx, vvy, 1, 1);
      }
      break;
    }
    case 'analog': {
      for (let i = 0; i < 280; i++) {
        const avx = (Math.sin(i * 19.1 + t * 0.004) * 0.5 + 0.5) * w;
        const avy = (Math.cos(i * 11.3 + t * 0.003) * 0.5 + 0.5) * h;
        ctx.fillStyle = `rgba(${180 + (i % 40)},${140 + (i % 30)},${100 + (i % 20)},0.04)`;
        ctx.fillRect(avx, avy, 1.5, 1);
      }
      const avg = ctx.createRadialGradient(cx, cy, w * 0.2, cx, cy, w * 0.6);
      avg.addColorStop(0, 'transparent'); avg.addColorStop(1, 'rgba(0,0,0,0.28)');
      ctx.fillStyle = avg; ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'silhouette': {
      const slg = ctx.createLinearGradient(0, 0, 0, h);
      slg.addColorStop(0, hexToRgba(colors[3], 0.3)); slg.addColorStop(0.7, hexToRgba(colors[1], 0.06)); slg.addColorStop(1, 'transparent');
      ctx.fillStyle = slg; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = hexToRgba(colors[2], 0.7);
      ctx.beginPath(); ctx.arc(cx, h * 0.44 + Math.sin(t * 0.001) * 2, 14, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx - 18, h * 0.57); ctx.lineTo(cx + 18, h * 0.57); ctx.lineTo(cx + 14, h * 0.88); ctx.lineTo(cx - 14, h * 0.88); ctx.closePath(); ctx.fill();
      break;
    }
    case 'persona': {
      ctx.strokeStyle = hexToRgba(colors[0], 0.22); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, h * 0.32); ctx.lineTo(w * 0.72, h * 0.32); ctx.lineTo(w * 0.88, h * 0.14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, h * 0.68); ctx.lineTo(w * 0.72, h * 0.68); ctx.lineTo(w * 0.88, h * 0.86); ctx.stroke();
      ctx.fillStyle = hexToRgba(colors[1], 0.15);
      ctx.beginPath(); ctx.moveTo(0, h * 0.32); ctx.lineTo(w * 0.72, h * 0.32); ctx.lineTo(w * 0.88, h * 0.14); ctx.lineTo(0, h * 0.14); ctx.fill();
      ctx.fillStyle = hexToRgba(colors[0], 0.1);
      ctx.beginPath(); ctx.moveTo(0, h * 0.68); ctx.lineTo(w * 0.72, h * 0.68); ctx.lineTo(w * 0.88, h * 0.86); ctx.lineTo(0, h * 0.86); ctx.fill();
      break;
    }
    case 'ship': {
      const shpg = ctx.createLinearGradient(0, 0, 0, h);
      shpg.addColorStop(0, hexToRgba(colors[0], 0.2)); shpg.addColorStop(0.52, hexToRgba(colors[0], 0.04));
      shpg.addColorStop(0.55, 'transparent'); shpg.addColorStop(1, hexToRgba(colors[1], 0.2));
      ctx.fillStyle = shpg; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = hexToRgba(colors[3], 0.14); ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const wy = h * (0.58 + i * 0.08);
        ctx.beginPath();
        for (let x = 0; x <= w; x += 8) ctx.lineTo(x, wy + Math.sin(x * 0.04 + t * 0.002 + i * 1.2) * 5);
        ctx.stroke();
      }
      ctx.strokeStyle = hexToRgba(colors[2], 0.4); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx - 20, h * 0.55); ctx.lineTo(cx - 20, h * 0.16); ctx.stroke();
      ctx.fillStyle = hexToRgba(colors[0], 0.3);
      ctx.beginPath(); ctx.moveTo(cx - 20, h * 0.18); ctx.quadraticCurveTo(cx + 10, h * 0.28, cx + 18, h * 0.22); ctx.lineTo(cx - 20, h * 0.38); ctx.fill();
      break;
    }
    case 'voxel': {
      const vs = 14;
      for (let gx = 0; gx < 7; gx++) for (let gy = 0; gy < 5; gy++) {
        const vx = cx - 50 + gx * vs - gy * vs * 0.5 + Math.sin(t * 0.001 + gx + gy) * 0.5;
        const vy = h * 0.35 + gy * vs * 0.86 - Math.sin(t * 0.001 + gx * 0.7) * 1.5;
        const vc = (gx + gy) % 3;
        ctx.fillStyle = hexToRgba([colors[0], colors[1], colors[3]][vc], 0.12 + vc * 0.04);
        ctx.beginPath();
        ctx.moveTo(vx, vy - vs * 0.5); ctx.lineTo(vx + vs, vy); ctx.lineTo(vx + vs, vy + vs * 0.5);
        ctx.lineTo(vx, vy + vs); ctx.lineTo(vx - vs, vy + vs * 0.5); ctx.lineTo(vx - vs, vy); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = hexToRgba(colors[2], 0.08); ctx.lineWidth = 0.3; ctx.stroke();
      }
      break;
    }
    case 'wasteland': {
      const wlg = ctx.createLinearGradient(0, 0, w, h);
      wlg.addColorStop(0, hexToRgba(colors[1], 0.18)); wlg.addColorStop(1, hexToRgba(colors[3], 0.06));
      ctx.fillStyle = wlg; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = hexToRgba(colors[2], 0.2); ctx.lineWidth = 0.5;
      for (let i = 0; i < 8; i++) {
        const wx = w * (0.1 + Math.sin(i * 2.3) * 0.4 + 0.4);
        ctx.beginPath(); ctx.moveTo(wx, h * 0.68); ctx.lineTo(wx + Math.sin(i) * 12, h * (0.5 + Math.sin(i * 1.5) * 0.1)); ctx.stroke();
      }
      break;
    }
    case 'nordic': {
      const nrg = ctx.createLinearGradient(0, 0, 0, h);
      nrg.addColorStop(0, hexToRgba(colors[0], 0.3)); nrg.addColorStop(0.5, hexToRgba(colors[1], 0.08)); nrg.addColorStop(1, hexToRgba(colors[0], 0.04));
      ctx.fillStyle = nrg; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = hexToRgba(colors[1], 0.15); ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let x = 0; x <= w; x += 10) ctx.lineTo(x, h * 0.28 + Math.sin(x * 0.02 + t * 0.001) * 22);
      ctx.stroke();
      break;
    }
    case 'technature': {
      ctx.strokeStyle = hexToRgba(colors[0], 0.1); ctx.lineWidth = 0.4;
      for (let x = 0; x < w; x += 18) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 18) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.strokeStyle = hexToRgba(colors[1], 0.2); ctx.lineWidth = 1.2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx, h * 0.8); ctx.lineTo(cx, h * 0.15 + Math.sin(t * 0.001) * 5); ctx.stroke();
      for (let i = 1; i <= 4; i++) {
        const tny = h * (0.7 - i * 0.12), tnl = i * 15;
        ctx.beginPath(); ctx.moveTo(cx, tny); ctx.lineTo(cx - tnl, tny - tnl * 0.5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, tny); ctx.lineTo(cx + tnl, tny - tnl * 0.5); ctx.stroke();
      }
      break;
    }
    case 'dream': {
      for (let i = 0; i < 12; i++) {
        const drx = (Math.sin(i * 1.7 + t * 0.0005) * 0.5 + 0.5) * w;
        const dry = (Math.cos(i * 2.1 + t * 0.0004) * 0.5 + 0.5) * h;
        const drr = 8 + Math.sin(i * 1.3) * 6;
        const drg = ctx.createRadialGradient(drx, dry, 0, drx, dry, drr * 3);
        drg.addColorStop(0, hexToRgba([colors[0], colors[1], colors[3]][i % 3], 0.18));
        drg.addColorStop(1, 'transparent');
        ctx.fillStyle = drg; ctx.beginPath(); ctx.arc(drx, dry, drr * 3, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'wick': {
      const wkg = ctx.createLinearGradient(0, 0, w, h);
      wkg.addColorStop(0, 'rgba(0,0,0,0.3)'); wkg.addColorStop(1, 'transparent');
      ctx.fillStyle = wkg; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = hexToRgba(colors[1], 0.3); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, h * 0.5); ctx.lineTo(w, h * 0.5); ctx.stroke();
      ctx.strokeStyle = hexToRgba(colors[0], 0.2); ctx.lineWidth = 0.5;
      ([0.25, 0.4, 0.6, 0.75] as const).forEach(fx => {
        ctx.beginPath(); ctx.moveTo(w * fx, 0); ctx.lineTo(w * fx, h); ctx.stroke();
      });
      const wkspot = ctx.createRadialGradient(w * 0.35, h * 0.4, 0, w * 0.35, h * 0.4, 50);
      wkspot.addColorStop(0, hexToRgba(colors[0], 0.18)); wkspot.addColorStop(1, 'transparent');
      ctx.fillStyle = wkspot; ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'symmetry': {
      ctx.strokeStyle = hexToRgba(colors[3], 0.1); ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
      ctx.strokeStyle = hexToRgba(colors[1], 0.15); ctx.lineWidth = 1;
      ([[0.28, 0.42, 0.72, 0.42], [0.22, 0.62, 0.78, 0.62]] as const).forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath(); ctx.moveTo(w * x1, h * y1); ctx.lineTo(w * x2, h * y2); ctx.stroke();
      });
      const symg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
      symg.addColorStop(0, hexToRgba(colors[3], 0.15)); symg.addColorStop(1, 'transparent');
      ctx.fillStyle = symg; ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'fincher': {
      ctx.fillStyle = 'rgba(0,20,5,0.25)'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(0,40,10,0.12)'; ctx.lineWidth = 0.4;
      for (let x = 0; x < w; x += w / 6) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += h / 5) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      break;
    }
    case 'onepoint': {
      ctx.strokeStyle = hexToRgba(colors[3], 0.1); ctx.lineWidth = 0.8;
      ([0.05, 0.25, 0.45, 0.55, 0.75, 0.95] as const).forEach(fx => {
        ctx.beginPath(); ctx.moveTo(w * fx, 0); ctx.lineTo(cx, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w * fx, h); ctx.lineTo(cx, cy); ctx.stroke();
      });
      ctx.strokeStyle = hexToRgba(colors[3], 0.06);
      ([0.25, 0.45, 0.55, 0.75] as const).forEach(fy => {
        ctx.beginPath(); ctx.moveTo(0, h * fy); ctx.lineTo(w, h * fy); ctx.stroke();
      });
      break;
    }
    case 'deakins': {
      const dkg = ctx.createLinearGradient(0, 0, w, 0);
      dkg.addColorStop(0, hexToRgba(colors[3], 0.25)); dkg.addColorStop(0.5, hexToRgba(colors[3], 0.04)); dkg.addColorStop(1, 'transparent');
      ctx.fillStyle = dkg; ctx.fillRect(0, 0, w, h);
      const dvg = ctx.createRadialGradient(cx, cy, w * 0.18, cx, cy, w * 0.6);
      dvg.addColorStop(0, 'transparent'); dvg.addColorStop(1, 'rgba(0,0,0,0.3)');
      ctx.fillStyle = dvg; ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'longtake': {
      ctx.strokeStyle = hexToRgba(colors[3], 0.07); ctx.lineWidth = 0.4;
      for (let i = 1; i <= 4; i++) {
        const f = i / 5;
        ctx.beginPath(); ctx.rect(w * f * 0.1, h * f * 0.1, w * (1 - f * 0.2), h * (1 - f * 0.2)); ctx.stroke();
      }
      break;
    }
    case 'studio': {
      const stg1 = ctx.createRadialGradient(w * 0.22, h * 0.2, 0, w * 0.22, h * 0.2, w * 0.42);
      stg1.addColorStop(0, hexToRgba(colors[3], 0.22)); stg1.addColorStop(1, 'transparent');
      ctx.fillStyle = stg1; ctx.fillRect(0, 0, w, h);
      const stg2 = ctx.createRadialGradient(w * 0.8, h * 0.3, 0, w * 0.8, h * 0.3, w * 0.28);
      stg2.addColorStop(0, hexToRgba(colors[1], 0.12)); stg2.addColorStop(1, 'transparent');
      ctx.fillStyle = stg2; ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'window': {
      ctx.fillStyle = hexToRgba(colors[3], 0.14);
      ctx.fillRect(w * 0.3, 0, w * 0.22, h * 0.62);
      ctx.strokeStyle = hexToRgba(colors[3], 0.2); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(w * 0.41, 0); ctx.lineTo(w * 0.41, h * 0.62); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.3, h * 0.31); ctx.lineTo(w * 0.52, h * 0.31); ctx.stroke();
      const winshadow = ctx.createLinearGradient(w * 0.52, 0, w, 0);
      winshadow.addColorStop(0, 'rgba(0,0,0,0.1)'); winshadow.addColorStop(1, 'transparent');
      ctx.fillStyle = winshadow; ctx.fillRect(w * 0.52, 0, w * 0.48, h);
      break;
    }
    case 'goldenhour': {
      const ghg = ctx.createLinearGradient(0, 0, w, h);
      ghg.addColorStop(0, hexToRgba(colors[3], 0.3)); ghg.addColorStop(0.5, hexToRgba(colors[1], 0.12)); ghg.addColorStop(1, 'transparent');
      ctx.fillStyle = ghg; ctx.fillRect(0, 0, w, h);
      const ghsg = ctx.createRadialGradient(w * 0.82, h * 0.18, 0, w * 0.82, h * 0.18, w * 0.5);
      ghsg.addColorStop(0, hexToRgba(colors[3], 0.28)); ghsg.addColorStop(1, 'transparent');
      ctx.fillStyle = ghsg; ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'highkey': {
      const hkg = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.6);
      hkg.addColorStop(0, hexToRgba(colors[3], 0.28)); hkg.addColorStop(1, hexToRgba(colors[3], 0.06));
      ctx.fillStyle = hkg; ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'lowkey': {
      const lkg = ctx.createRadialGradient(w * 0.3, h * 0.38, 0, cx, cy, w * 0.55);
      lkg.addColorStop(0, hexToRgba(colors[3], 0.25)); lkg.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.fillStyle = lkg; ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'neonstreet': {
      ctx.strokeStyle = hexToRgba(colors[3], 0.08); ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, h * 0.55); ctx.lineTo(w, h * 0.55); ctx.stroke();
      ([colors[1], colors[0], colors[3], colors[1]] as string[]).forEach((nc, i) => {
        const nx = w * (0.15 + i * 0.22);
        ctx.strokeStyle = hexToRgba(nc, 0.25); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(nx, 0); ctx.lineTo(nx, h * 0.55); ctx.stroke();
        const nrflg = ctx.createLinearGradient(0, h * 0.55, 0, h);
        nrflg.addColorStop(0, hexToRgba(nc, 0.12)); nrflg.addColorStop(1, 'transparent');
        ctx.fillStyle = nrflg; ctx.fillRect(nx - 8, h * 0.55, 16, h * 0.45);
      });
      break;
    }
    case 'overcast': {
      const ocg = ctx.createLinearGradient(0, 0, 0, h);
      ocg.addColorStop(0, hexToRgba(colors[3], 0.12)); ocg.addColorStop(1, hexToRgba(colors[3], 0.04));
      ctx.fillStyle = ocg; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = hexToRgba(colors[3], 0.05);
        ctx.beginPath(); ctx.ellipse(w * (0.2 + i * 0.2), h * (0.15 + i * 0.08), w * 0.22, h * 0.04, 0, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'hardsun': {
      ([[0.28, 0.62], [0.52, 0.7], [0.74, 0.58]] as [number,number][]).forEach(([fx, fy]) => {
        ctx.fillStyle = hexToRgba(colors[2], 0.22);
        ctx.beginPath(); ctx.ellipse(w * fx, h * fy, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
      });
      const hssg = ctx.createRadialGradient(cx, -10, 0, cx, h * 0.4, w * 0.5);
      hssg.addColorStop(0, hexToRgba(colors[3], 0.18)); hssg.addColorStop(1, 'transparent');
      ctx.fillStyle = hssg; ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'tungsten': {
      const tung = ctx.createRadialGradient(cx, cy * 0.6, 0, cx, cy, w * 0.5);
      tung.addColorStop(0, 'rgba(255,160,60,0.2)'); tung.addColorStop(1, 'rgba(80,40,0,0.06)');
      ctx.fillStyle = tung; ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'anamorphic': {
      const alx = cx + Math.sin(t * 0.0006) * w * 0.25;
      for (let i = -1; i <= 1; i++) {
        const amg = ctx.createLinearGradient(0, cy + i * 5, w, cy + i * 5);
        amg.addColorStop(0, 'transparent');
        amg.addColorStop(0.42, hexToRgba(colors[1], 0.06 - Math.abs(i) * 0.02));
        amg.addColorStop(alx / w, hexToRgba(colors[3], 0.3 - Math.abs(i) * 0.1));
        amg.addColorStop(0.58, hexToRgba(colors[1], 0.06 - Math.abs(i) * 0.02));
        amg.addColorStop(1, 'transparent');
        ctx.fillStyle = amg; ctx.fillRect(0, cy - 3 + i * 5, w, 5);
      }
      break;
    }
    case 'sky': {
      const skg = ctx.createLinearGradient(0, 0, 0, h * 0.6);
      skg.addColorStop(0, hexToRgba(colors[0], 0.3)); skg.addColorStop(1, hexToRgba(colors[3], 0.08));
      ctx.fillStyle = skg; ctx.fillRect(0, 0, w, h * 0.65);
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = hexToRgba(colors[3], 0.12);
        ctx.beginPath(); ctx.ellipse(w * (0.22 + i * 0.28), h * 0.22, w * 0.12, h * 0.04, 0, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'wall': {
      const bhr = 12, bwr = 26;
      ctx.strokeStyle = hexToRgba(colors[2], 0.1); ctx.lineWidth = 0.5;
      for (let row = 0; row * bhr < h; row++) {
        const off = (row % 2) * bwr * 0.5;
        for (let col = -1; col * bwr < w + bwr; col++) {
          ctx.beginPath(); ctx.rect(col * bwr + off, row * bhr, bwr - 1, bhr - 1); ctx.stroke();
        }
      }
      break;
    }
    case 'ribbon': {
      ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      ([0.3, 0.5, 0.7] as const).forEach((yf, i) => {
        ctx.strokeStyle = hexToRgba([colors[0], colors[1], colors[3]][i], 0.22);
        ctx.beginPath();
        for (let x = -10; x <= w + 10; x += 8) {
          const ry = h * yf + Math.sin(x * 0.02 + t * 0.002 + i * 1.2) * 18 + Math.sin(x * 0.05 + t * 0.001) * 8;
          if (x <= -10) ctx.moveTo(x, ry); else ctx.lineTo(x, ry);
        }
        ctx.stroke();
      });
      break;
    }
    case 'glowforest': {
      for (let i = 0; i < 16; i++) {
        const gfx = w * (0.06 + (i / 15) * 0.88);
        const gfht = h * (0.2 + Math.sin(i * 1.9) * 0.12);
        const gfg = ctx.createLinearGradient(gfx, h, gfx, h - gfht);
        gfg.addColorStop(0, hexToRgba(colors[0], 0.18)); gfg.addColorStop(1, 'transparent');
        ctx.strokeStyle = gfg; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(gfx, h); ctx.lineTo(gfx + Math.sin(i) * 6, h - gfht); ctx.stroke();
        const gfspot = ctx.createRadialGradient(gfx, h - gfht, 0, gfx, h - gfht, 8);
        gfspot.addColorStop(0, hexToRgba(colors[1], 0.3)); gfspot.addColorStop(1, 'transparent');
        ctx.fillStyle = gfspot; ctx.beginPath(); ctx.arc(gfx, h - gfht, 8, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'monument': {
      ctx.strokeStyle = hexToRgba(colors[3], 0.18); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.rect(cx - 22, h * 0.2, 44, h * 0.62); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 28, h * 0.2); ctx.lineTo(cx, h * 0.06); ctx.lineTo(cx + 28, h * 0.2); ctx.stroke();
      const mong = ctx.createLinearGradient(0, 0, 0, h);
      mong.addColorStop(0, hexToRgba(colors[3], 0.04)); mong.addColorStop(0.5, 'transparent'); mong.addColorStop(1, hexToRgba(colors[2], 0.1));
      ctx.fillStyle = mong; ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'rhythm': {
      ctx.strokeStyle = hexToRgba(colors[1], 0.3); ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const amp = Math.sin(x * 0.06 + t * 0.003) * h * 0.2 + Math.sin(x * 0.022 + t * 0.002) * h * 0.1;
        if (x === 0) ctx.moveTo(x, cy + amp); else ctx.lineTo(x, cy + amp);
      }
      ctx.stroke();
      ctx.strokeStyle = hexToRgba(colors[0], 0.12); ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const amp = Math.sin(x * 0.04 + t * 0.002 + 1) * h * 0.12;
        if (x === 0) ctx.moveTo(x, cy + amp); else ctx.lineTo(x, cy + amp);
      }
      ctx.stroke();
      break;
    }
    case 'whitecity': {
      ctx.strokeStyle = hexToRgba(colors[3], 0.15); ctx.lineWidth = 0.5;
      ([0.2, 0.4, 0.6, 0.8] as const).forEach(fx => { ctx.beginPath(); ctx.moveTo(w * fx, 0); ctx.lineTo(w * fx, h); ctx.stroke(); });
      ([0.3, 0.5, 0.7] as const).forEach(fy => { ctx.beginPath(); ctx.moveTo(0, h * fy); ctx.lineTo(w, h * fy); ctx.stroke(); });
      const wcg = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.5);
      wcg.addColorStop(0, hexToRgba(colors[3], 0.18)); wcg.addColorStop(1, 'transparent');
      ctx.fillStyle = wcg; ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'windred': {
      for (let i = 0; i < 18; i++) {
        const wrx = (Math.sin(i * 3.7 + t * 0.001) * 0.5 + 0.5) * w;
        const wry = (Math.sin(i * 2.1 + t * 0.0008) * 0.5 + 0.5) * h;
        ctx.fillStyle = hexToRgba(colors[0], 0.25 + Math.sin(i) * 0.1);
        ctx.save(); ctx.translate(wrx, wry); ctx.rotate(i + t * 0.001);
        ctx.beginPath(); ctx.ellipse(0, 0, 5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      break;
    }
    case 'lonely': {
      const log = ctx.createLinearGradient(0, 0, 0, h);
      log.addColorStop(0, hexToRgba(colors[0], 0.14)); log.addColorStop(1, 'transparent');
      ctx.fillStyle = log; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = hexToRgba(colors[3], 0.12); ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, h * 0.72); ctx.lineTo(w, h * 0.72); ctx.stroke();
      ctx.fillStyle = hexToRgba(colors[2], 0.6);
      ctx.beginPath(); ctx.arc(cx * 1.2, h * 0.7, 3, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'icon': {
      ctx.strokeStyle = hexToRgba(colors[3], 0.22); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, 36, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = hexToRgba(colors[1], 0.15);
      ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'pixel': {
      const ps = 12;
      for (let gx = 0; gx < w; gx += ps) for (let gy = 0; gy < h; gy += ps) {
        const pxi = ((gx / ps) + (gy / ps)) % 4;
        ctx.fillStyle = hexToRgba([colors[0], colors[1], colors[2], colors[3]][pxi], 0.1 + pxi * 0.02);
        ctx.fillRect(gx, gy, ps - 1, ps - 1);
      }
      break;
    }
    case 'pixelmountain': {
      const pmps = 10;
      const pmdata = [0.9, 0.85, 0.75, 0.62, 0.5, 0.38, 0.32, 0.4, 0.55, 0.68, 0.78, 0.86, 0.9];
      const pmcols = Math.floor(w / pmps);
      for (let xi = 0; xi < pmcols && xi < pmdata.length; xi++) {
        ctx.fillStyle = hexToRgba(colors[2], 0.35);
        ctx.fillRect(xi * pmps, h * pmdata[xi], pmps, h * (1 - pmdata[xi]));
      }
      break;
    }
    case 'anthology': {
      ctx.strokeStyle = hexToRgba(colors[2], 0.4); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(w * 0.33, 0); ctx.lineTo(w * 0.33, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.67, 0); ctx.lineTo(w * 0.67, h); ctx.stroke();
      ctx.fillStyle = hexToRgba(colors[0], 0.08); ctx.fillRect(0, 0, w * 0.33, h);
      ctx.fillStyle = hexToRgba(colors[1], 0.08); ctx.fillRect(w * 0.33, 0, w * 0.34, h);
      ctx.fillStyle = hexToRgba(colors[3], 0.08); ctx.fillRect(w * 0.67, 0, w * 0.33, h);
      break;
    }
    case 'tactile': {
      for (let i = 0; i < 40; i++) {
        const tctx = (Math.sin(i * 7.3) * 0.5 + 0.5) * w;
        const tcty = (Math.cos(i * 5.1) * 0.5 + 0.5) * h;
        ctx.fillStyle = hexToRgba(colors[3], 0.04);
        ctx.beginPath(); ctx.arc(tctx, tcty, 1.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = hexToRgba(colors[0], 0.08); ctx.lineWidth = 0.4;
      for (let x = 0; x < w; x += 14) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      break;
    }
    case 'circle': {
      for (let i = 4; i >= 1; i--) {
        ctx.strokeStyle = hexToRgba(i % 4 === 0 ? colors[1] : colors[3], 0.1 + i * 0.03);
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx, cy, i * 22 + Math.sin(t * 0.001 + i) * 3, 0, Math.PI * 2); ctx.stroke();
      }
      break;
    }
    default: {
      // Minimal ambient — for any unrecognized preview type, a clean radial tint
      const defg = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.45);
      defg.addColorStop(0, hexToRgba(colors[0], 0.12)); defg.addColorStop(1, 'transparent');
      ctx.fillStyle = defg; ctx.fillRect(0, 0, w, h);
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
