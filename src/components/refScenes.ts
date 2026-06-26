/* ============================================================
   refScenes.ts — Per-reference HTML5 Canvas scenes.

   Every animation / anime reference gets its OWN original scene,
   keyed by ref.id. All scenes are palette-adaptive: they read the
   live 4-colour palette [c0,c1,c2,c3] each frame, so changing the
   palette instantly re-skins the scene.

   Convention for the palette array `c`:
     c[0] = primary       c[1] = accent
     c[2] = dark / ground  c[3] = light / highlight
   ============================================================ */

export type SceneFn = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  c: string[],
) => void;

/* ── colour helpers ───────────────────────────────────────── */
function rgb(hex: string): [number, number, number] {
  const x = (hex || '#000').replace('#', '');
  return [
    parseInt(x.substring(0, 2), 16) || 0,
    parseInt(x.substring(2, 4), 16) || 0,
    parseInt(x.substring(4, 6), 16) || 0,
  ];
}
function rgba(hex: string, a = 1): string {
  const [r, g, b] = rgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}
function mix(h1: string, h2: string, k: number): string {
  const a = rgb(h1), b = rgb(h2);
  const m = (i: number) => Math.round(a[i] + (b[i] - a[i]) * k);
  return `rgb(${m(0)},${m(1)},${m(2)})`;
}
function lum(hex: string): number {
  const [r, g, b] = rgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
/** deterministic pseudo-random in [0,1) keyed by i — stable across frames */
function seed(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ── shared primitives ────────────────────────────────────── */
function fillBg(ctx: CtX, w: number, h: number, top: string, bot: string) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}
function radialGlow(ctx: CtX, x: number, y: number, r: number, col: string, a: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a));
  g.addColorStop(0.6, rgba(col, a * 0.35));
  g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function vignette(ctx: CtX, w: number, h: number, col: string, a = 0.7) {
  const g = ctx.createRadialGradient(w / 2, h / 2, w * 0.15, w / 2, h / 2, w * 0.6);
  g.addColorStop(0, rgba(col, 0)); g.addColorStop(1, rgba(col, a));
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}
function letterbox(ctx: CtX, w: number, h: number, frac = 0.13) {
  const b = h * frac;
  ctx.fillStyle = 'rgba(0,0,0,0.82)';
  ctx.fillRect(0, 0, w, b); ctx.fillRect(0, h - b, w, b);
}
function speedLines(ctx: CtX, cx: number, cy: number, t: number, col: string, n = 26, spin = 0.0003) {
  ctx.save(); ctx.translate(cx, cy);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + t * spin;
    const len = 26 + Math.sin(t * 0.003 + i * 0.6) * 16;
    ctx.strokeStyle = rgba(col, 0.1 + Math.sin(t * 0.004 + i) * 0.08);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 18);
    ctx.lineTo(Math.cos(a) * (18 + len), Math.sin(a) * (18 + len));
    ctx.stroke();
  }
  ctx.restore();
}
function ribbon(ctx: CtX, w: number, h: number, t: number, col: string, yBase: number, amp: number, phase: number, lw = 3) {
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
  for (let x = -10; x <= w + 10; x += 6) {
    const y = yBase + Math.sin(x * 0.02 + t * 0.0018 + phase) * amp + Math.sin(x * 0.05 + t * 0.001) * amp * 0.4;
    if (x < 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}
function emberField(ctx: CtX, w: number, h: number, t: number, col: string, n = 30, rise = 0.02) {
  for (let i = 0; i < n; i++) {
    const sx = seed(i) * w;
    const sp = seed(i + 99) * 0.6 + 0.4;
    const y = h - ((t * rise * sp + seed(i + 7) * h) % (h + 20));
    const x = sx + Math.sin(t * 0.001 + i) * 10;
    const s = seed(i + 3) * 1.8 + 0.4;
    ctx.fillStyle = rgba(col, 0.5 + seed(i + 5) * 0.4);
    ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
  }
}
function dots(ctx: CtX, w: number, h: number, col: string, gap: number, r: number, a: number) {
  ctx.fillStyle = rgba(col, a);
  for (let x = gap / 2; x < w; x += gap)
    for (let y = gap / 2; y < h; y += gap) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
}
function scanlines(ctx: CtX, w: number, h: number, a = 0.05) {
  ctx.fillStyle = `rgba(0,0,0,${a})`;
  for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
}
function blade(ctx: CtX, cx: number, cy: number, w: number, t: number, col: string, angle: number, span = 0.42) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle + Math.sin(t * 0.001) * 0.06);
  const g = ctx.createLinearGradient(-w * span, 0, w * span, 0);
  g.addColorStop(0, rgba(col, 0)); g.addColorStop(0.45, rgba(col, 0.7));
  g.addColorStop(0.5, rgba(col, 1)); g.addColorStop(0.55, rgba(col, 0.7));
  g.addColorStop(1, rgba(col, 0));
  ctx.strokeStyle = g; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(-w * span, 0); ctx.lineTo(w * span, 0); ctx.stroke();
  ctx.restore();
}
function softOrb(ctx: CtX, x: number, y: number, r: number, col: string, hi: string) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, 0, x, y, r);
  g.addColorStop(0, rgba(hi, 0.95));
  g.addColorStop(0.35, col);
  g.addColorStop(1, mix(col, '#000000', 0.45));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.96, 0, 0, Math.PI * 2); ctx.fill();
}
function figureSilhouette(ctx: CtX, x: number, y: number, scale: number, col: string, lean = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(lean); ctx.fillStyle = col; ctx.strokeStyle = col;
  ctx.lineWidth = Math.max(2, scale * 0.12); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -scale * 0.62, scale * 0.16, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, -scale * 0.45); ctx.lineTo(scale * 0.22, scale * 0.12); ctx.lineTo(-scale * 0.2, scale * 0.12); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-scale * 0.1, scale * 0.02); ctx.lineTo(-scale * 0.22, scale * 0.55);
  ctx.moveTo(scale * 0.1, scale * 0.02); ctx.lineTo(scale * 0.26, scale * 0.55); ctx.stroke();
  ctx.restore();
}

type CtX = CanvasRenderingContext2D;

/* ============================================================
   WORLD SCENES — keyed by SURGERY_DATA.worlds id

   These establish the render world's visual grammar before a
   reference is selected. Reference scenes still have priority.
   ============================================================ */
export const WORLD_SCENES: Record<string, SceneFn> = {
  arcane: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[2], c[0], 0.12), mix(c[2], '#000000', 0.58));
    radialGlow(ctx, w * 0.7, h * 0.3, w * 0.42, c[0], 0.28);
    radialGlow(ctx, w * 0.28, h * 0.72, w * 0.34, c[1], 0.2);

    // Broad, imperfect albedo strokes read as paint over volume.
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 9; i++) {
      const y = h * (0.16 + i * 0.075);
      ctx.strokeStyle = rgba(i % 3 === 0 ? c[1] : c[0], 0.05 + seed(i) * 0.08);
      ctx.lineWidth = 3 + seed(i + 3) * 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(w * (0.05 + seed(i + 4) * 0.18), y);
      ctx.bezierCurveTo(w * 0.34, y - 18, w * 0.58, y + 22, w * (0.76 + seed(i + 8) * 0.2), y - 4);
      ctx.stroke();
    }
    ctx.restore();

    // Negative-space figure and asymmetrical architectural shadow.
    const sway = Math.sin(t * 0.0012) * 3;
    ctx.fillStyle = rgba(mix(c[2], '#000000', 0.72), 0.96);
    ctx.beginPath();
    ctx.moveTo(0, h); ctx.lineTo(0, h * 0.48); ctx.lineTo(w * 0.24, h * 0.22);
    ctx.lineTo(w * 0.42, h); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.64 + sway, h * 0.38, w * 0.052, h * 0.082, -0.16, 0, Math.PI * 2);
    ctx.moveTo(w * 0.58 + sway, h * 0.45);
    ctx.bezierCurveTo(w * 0.5 + sway, h * 0.48, w * 0.51 + sway, h * 0.7, w * 0.44 + sway, h * 0.91);
    ctx.lineTo(w * 0.63 + sway, h * 0.84);
    ctx.lineTo(w * 0.79 + sway, h * 0.93);
    ctx.bezierCurveTo(w * 0.73 + sway, h * 0.7, w * 0.79 + sway, h * 0.53, w * 0.69 + sway, h * 0.45);
    ctx.closePath(); ctx.fill();
    // Painterly shoulder planes break the silhouette into dimensional masses.
    ctx.fillStyle = rgba(mix(c[0], c[2], 0.68), 0.82);
    ctx.beginPath();
    ctx.moveTo(w * 0.58 + sway, h * 0.47); ctx.lineTo(w * 0.46 + sway, h * 0.58);
    ctx.lineTo(w * 0.62 + sway, h * 0.62); ctx.lineTo(w * 0.7 + sway, h * 0.47); ctx.closePath(); ctx.fill();

    ctx.strokeStyle = rgba(c[3], 0.68); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(w * 0.585 + sway, h * 0.46); ctx.bezierCurveTo(w * 0.55 + sway, h * 0.6, w * 0.53 + sway, h * 0.72, w * 0.48 + sway, h * 0.88); ctx.stroke();
    emberField(ctx, w, h, t, c[1], 38, 0.028);
    vignette(ctx, w, h, c[2], 0.66);
  },

  spiderverse: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[0], c[2], 0.34), mix(c[1], c[2], 0.48));
    ctx.save();
    ctx.translate(Math.sin(t * 0.004) * 2, 0);
    ctx.rotate(-0.035);

    // Offset print plates create a deliberate CMYK-like registration error.
    const shift = 4 + Math.sin(t * 0.003) * 1.5;
    for (const [dx, col, alpha] of [[-shift, c[0], 0.5], [shift, c[1], 0.42], [0, c[2], 0.95]] as const) {
      ctx.fillStyle = rgba(col, alpha);
      ctx.beginPath();
      ctx.arc(w * 0.52 + dx, h * 0.35, h * 0.12, 0, Math.PI * 2);
      ctx.moveTo(w * 0.44 + dx, h * 0.43);
      ctx.lineTo(w * 0.7 + dx, h * 0.88);
      ctx.lineTo(w * 0.29 + dx, h * 0.88);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    dots(ctx, w, h, c[3], 9, 1.55, 0.2);
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = rgba(c[2], 0.76);
    ctx.beginPath(); ctx.moveTo(0, h * 0.22); ctx.lineTo(w * 0.42, 0); ctx.lineTo(w * 0.31, h); ctx.lineTo(0, h); ctx.fill();
    ctx.restore();

    // Ink gutters and impact lettering make the panel readable at thumbnail size.
    ctx.strokeStyle = rgba(c[2], 0.9); ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(w * 0.1, 0); ctx.lineTo(w * 0.29, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.78, 0); ctx.lineTo(w * 0.66, h); ctx.stroke();
    ctx.save();
    ctx.translate(w * 0.7, h * 0.25); ctx.rotate(-0.12 + Math.sin(t * 0.002) * 0.025);
    ctx.font = `900 ${Math.max(18, h * 0.18)}px Impact, sans-serif`;
    ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    ctx.strokeStyle = c[2]; ctx.lineWidth = 5; ctx.strokeText('KRAK!', 0, 0);
    ctx.fillStyle = c[3]; ctx.fillText('KRAK!', 0, 0);
    ctx.restore();
    scanlines(ctx, w, h, 0.08);
  },

  anime_cel: (ctx, w, h, t, c) => {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, mix(c[0], c[3], 0.58));
    sky.addColorStop(0.56, mix(c[0], c[1], 0.3));
    sky.addColorStop(0.57, mix(c[2], c[0], 0.34));
    sky.addColorStop(1, mix(c[2], '#000000', 0.35));
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

    const cx = w * 0.5, cy = h * 0.55;
    speedLines(ctx, cx, cy, t, c[3], 44, 0.00016);
    radialGlow(ctx, cx, cy, w * 0.34, c[3], 0.34);

    // Clean cel silhouette with one hard shadow band and a hot rim.
    const lift = Math.sin(t * 0.002) * 2;
    ctx.fillStyle = c[2];
    // Spiked but anonymous hair mass: anime grammar without copying a character.
    ctx.beginPath();
    ctx.moveTo(cx - h * 0.085, h * 0.39 + lift);
    ctx.lineTo(cx - h * 0.11, h * 0.27 + lift);
    ctx.lineTo(cx - h * 0.045, h * 0.3 + lift);
    ctx.lineTo(cx - h * 0.015, h * 0.2 + lift);
    ctx.lineTo(cx + h * 0.025, h * 0.3 + lift);
    ctx.lineTo(cx + h * 0.095, h * 0.24 + lift);
    ctx.lineTo(cx + h * 0.08, h * 0.41 + lift);
    ctx.quadraticCurveTo(cx, h * 0.46 + lift, cx - h * 0.085, h * 0.39 + lift);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.07, h * 0.43 + lift);
    ctx.lineTo(cx + w * 0.16, h * 0.88);
    ctx.lineTo(cx - w * 0.18, h * 0.88);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = rgba(mix(c[2], c[0], 0.34), 0.95);
    ctx.beginPath(); ctx.moveTo(cx, h * 0.27); ctx.arc(cx, h * 0.35 + lift, h * 0.09, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = rgba(c[3], 0.9); ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx, h * 0.35 + lift, h * 0.095, -1.35, 1.25); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + w * 0.07, h * 0.45); ctx.lineTo(cx + w * 0.17, h * 0.86); ctx.stroke();
    // A foreshortened energy blade adds a readable action axis.
    ctx.save(); ctx.translate(cx - w * 0.02, h * 0.58); ctx.rotate(-0.62 + Math.sin(t * 0.002) * 0.025);
    const bladeGlow = ctx.createLinearGradient(0, 0, w * 0.42, 0);
    bladeGlow.addColorStop(0, rgba(c[3], 0.2)); bladeGlow.addColorStop(0.18, c[3]); bladeGlow.addColorStop(1, rgba(c[1], 0));
    ctx.strokeStyle = bladeGlow; ctx.shadowColor = c[3]; ctx.shadowBlur = 11; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w * 0.42, 0); ctx.stroke(); ctx.restore();

    // Three exposure bands evoke hand-painted cel layers.
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = rgba(i === 1 ? c[1] : c[3], 0.045 + i * 0.018);
      ctx.fillRect(0, h * (0.18 + i * 0.2), w, h * 0.08);
    }
    vignette(ctx, w, h, c[2], 0.44);
  },

  pixar3d: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[0], c[3], 0.5), mix(c[2], c[0], 0.24));
    radialGlow(ctx, w * 0.28, h * 0.22, w * 0.62, c[3], 0.38);
    radialGlow(ctx, w * 0.78, h * 0.7, w * 0.35, c[1], 0.16);

    // Curved stage and contact occlusion sell a soft global-illumination setup.
    const floor = ctx.createLinearGradient(0, h * 0.58, 0, h);
    floor.addColorStop(0, rgba(mix(c[2], c[0], 0.25), 0));
    floor.addColorStop(1, mix(c[2], '#000000', 0.3));
    ctx.fillStyle = floor; ctx.fillRect(0, h * 0.52, w, h * 0.48);
    ctx.fillStyle = rgba(c[2], 0.38);
    ctx.beginPath(); ctx.ellipse(w * 0.52, h * 0.81, w * 0.2, h * 0.045, 0, 0, Math.PI * 2); ctx.fill();

    const bounce = Math.sin(t * 0.002) * h * 0.018;
    softOrb(ctx, w * 0.5, h * 0.53 + bounce, h * 0.22, c[0], c[3]);
    softOrb(ctx, w * 0.66, h * 0.64 - bounce * 0.55, h * 0.1, c[1], c[3]);
    // Specular rim and a small secondary bounce card reflection.
    ctx.strokeStyle = rgba(c[3], 0.76); ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.53 + bounce, h * 0.225, -1.3, 0.35); ctx.stroke();
    ctx.fillStyle = rgba(c[3], 0.56);
    ctx.beginPath(); ctx.ellipse(w * 0.43, h * 0.44 + bounce, w * 0.025, h * 0.045, -0.7, 0, Math.PI * 2); ctx.fill();
    vignette(ctx, w, h, c[2], 0.3);
  },

  ghibli: (ctx, w, h, t, c) => {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, mix(c[3], c[0], 0.18));
    sky.addColorStop(0.62, mix(c[0], c[3], 0.56));
    sky.addColorStop(1, mix(c[1], c[0], 0.4));
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

    // Translucent wash bands keep the sky visibly watercolor, not flat vector art.
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 8; i++) {
      const drift = Math.sin(t * 0.00035 + i) * 7;
      ctx.fillStyle = rgba(i % 2 ? c[3] : c[0], 0.035 + seed(i) * 0.035);
      ctx.beginPath();
      ctx.ellipse(w * seed(i + 2) + drift, h * (0.12 + seed(i + 7) * 0.38), w * (0.16 + seed(i) * 0.18), h * 0.055, -0.08, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Repeated translucent contours leave a wet watercolor edge instead of a flat fill.
    for (let layer = 0; layer < 4; layer++) {
      ctx.fillStyle = rgba(mix(c[1], c[2], 0.3), 0.35 - layer * 0.045);
      ctx.beginPath(); ctx.moveTo(0, h * (0.7 + layer * 0.008));
      ctx.quadraticCurveTo(w * 0.25, h * (0.49 + layer * 0.006), w * 0.52, h * (0.71 + layer * 0.008));
      ctx.quadraticCurveTo(w * 0.78, h * (0.47 + layer * 0.009), w, h * (0.67 + layer * 0.008));
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
    }
    for (let layer = 0; layer < 3; layer++) {
      ctx.fillStyle = rgba(mix(c[0], c[2], 0.28), 0.52 - layer * 0.07);
      ctx.beginPath(); ctx.moveTo(0, h * (0.8 + layer * 0.01));
      ctx.quadraticCurveTo(w * 0.34, h * (0.64 + layer * 0.006), w * 0.62, h * (0.82 + layer * 0.008));
      ctx.quadraticCurveTo(w * 0.82, h * (0.69 + layer * 0.006), w, h * (0.78 + layer * 0.008));
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
    }

    // Hundreds of cheap blades would shimmer; a sparse foreground silhouette reads better.
    const wind = Math.sin(t * 0.0011) * 0.22;
    ctx.strokeStyle = rgba(c[3], 0.52); ctx.lineWidth = 1.2; ctx.lineCap = 'round';
    for (let i = 0; i < 42; i++) {
      const x = (i / 41) * w;
      const bladeH = h * (0.08 + seed(i) * 0.12);
      ctx.beginPath(); ctx.moveTo(x, h); ctx.quadraticCurveTo(x + wind * bladeH, h - bladeH * 0.62, x + wind * bladeH * 1.35, h - bladeH); ctx.stroke();
    }
    emberField(ctx, w, h * 0.92, t, c[3], 14, 0.006);
  },

  stopmotion: (ctx, w, h, t, c) => {
    // Quantizing time creates a true 12 fps cadence even on a 60 Hz canvas.
    const qt = Math.floor(t / (1000 / 12)) * (1000 / 12);
    fillBg(ctx, w, h, mix(c[0], c[3], 0.28), mix(c[2], '#000000', 0.38));
    radialGlow(ctx, w * 0.28, h * 0.24, w * 0.46, c[3], 0.3);

    // Macro set: near and far bokeh frame a tactile armature puppet.
    for (let i = 0; i < 9; i++) {
      const x = seed(i) * w, y = seed(i + 9) * h;
      radialGlow(ctx, x, y, 10 + seed(i + 4) * 26, i % 2 ? c[1] : c[3], 0.08 + seed(i) * 0.1);
    }
    ctx.fillStyle = rgba(c[2], 0.48);
    ctx.beginPath(); ctx.ellipse(w * 0.52, h * 0.84, w * 0.22, h * 0.05, 0, 0, Math.PI * 2); ctx.fill();

    const nod = Math.sin(qt * 0.003) * 0.08;
    ctx.save(); ctx.translate(w * 0.52, h * 0.55); ctx.rotate(nod);
    const body = ctx.createLinearGradient(-30, -30, 34, 45);
    body.addColorStop(0, mix(c[0], c[3], 0.42));
    body.addColorStop(0.5, c[0]);
    body.addColorStop(1, mix(c[0], c[2], 0.52));
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(0, 22, w * 0.1, h * 0.22, 0.08, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -h * 0.1, h * 0.105, 0, Math.PI * 2); ctx.fill();
    // Visible ball joints and asymmetrical arms reveal the physical armature.
    ctx.strokeStyle = mix(c[0], c[2], 0.5); ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-w * 0.065, 7); ctx.lineTo(-w * 0.145, 32); ctx.lineTo(-w * 0.12, 62); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.065, 7); ctx.lineTo(w * 0.15, 23); ctx.lineTo(w * 0.18, -2); ctx.stroke();
    ctx.fillStyle = c[1];
    for (const [jx, jy] of [[-w * 0.145, 32], [w * 0.15, 23]] as const) {
      ctx.beginPath(); ctx.arc(jx, jy, 4, 0, Math.PI * 2); ctx.fill();
    }
    // Tiny inset eyes catch the key light without becoming a franchise design.
    ctx.fillStyle = c[2];
    ctx.beginPath(); ctx.arc(-h * 0.036, -h * 0.11, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(h * 0.036, -h * 0.11, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba(c[2], 0.55); ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(0, -h * 0.075, h * 0.026, 0.15, Math.PI - 0.15); ctx.stroke();
    // Handmade seams and fingerprints.
    ctx.strokeStyle = rgba(c[3], 0.3); ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.arc(0, -h * 0.1, h * 0.075, 0.1, Math.PI * 0.9); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < 7; i++) {
      ctx.strokeStyle = rgba(c[2], 0.1 + seed(i) * 0.1);
      ctx.beginPath(); ctx.arc((seed(i) - 0.5) * 22, -h * 0.1 + (seed(i + 4) - 0.5) * 18, 3 + seed(i + 7) * 5, 0, Math.PI * 1.4); ctx.stroke();
    }
    ctx.restore();

    // Stable seeded grain avoids per-frame noise flicker beyond the 12 fps cadence.
    ctx.fillStyle = rgba(c[3], 0.1);
    for (let i = 0; i < 180; i++) {
      const jitter = Math.floor(qt / 83.34) * 181 + i;
      ctx.fillRect(seed(jitter) * w, seed(jitter + 1) * h, 0.7 + seed(i) * 0.9, 0.7 + seed(i + 2) * 0.9);
    }
    vignette(ctx, w, h, c[2], 0.56);
  },

  mappa_cinematic: (ctx, w, h, t, c) => {
    // MAPPA dark cinematic: heavy shadow mass, selective color pop, volumetric haze
    fillBg(ctx, w, h, mix(c[2], '#000000', 0.72), '#050508');
    // Atmospheric haze layer
    const haze = ctx.createLinearGradient(0, 0, 0, h);
    haze.addColorStop(0, rgba(mix(c[0], c[2], 0.4), 0.18));
    haze.addColorStop(0.5, rgba(c[2], 0.08));
    haze.addColorStop(1, rgba('#000000', 0.4));
    ctx.fillStyle = haze; ctx.fillRect(0, 0, w, h);

    // Selective accent glow — one color pop against the dark mass
    radialGlow(ctx, w * 0.55, h * 0.35, w * 0.28, c[1], 0.55);
    radialGlow(ctx, w * 0.22, h * 0.6, w * 0.18, c[0], 0.22);

    // Dark environment silhouette mass (urban architecture)
    ctx.fillStyle = rgba('#000000', 0.75);
    ctx.beginPath();
    ctx.moveTo(0, h); ctx.lineTo(0, h * 0.52);
    ctx.lineTo(w * 0.08, h * 0.35); ctx.lineTo(w * 0.16, h * 0.42);
    ctx.lineTo(w * 0.22, h * 0.28); ctx.lineTo(w * 0.3, h * 0.45);
    ctx.lineTo(w * 0.38, h * 0.6); ctx.lineTo(w * 0.38, h);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.7, h); ctx.lineTo(w * 0.7, h * 0.38);
    ctx.lineTo(w * 0.78, h * 0.22); ctx.lineTo(w * 0.84, h * 0.32);
    ctx.lineTo(w * 0.9, h * 0.18); ctx.lineTo(w, h * 0.3);
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill();

    // Figure silhouette at power stance — anonymous geometry
    const pulse = Math.sin(t * 0.0015) * 1.5;
    ctx.fillStyle = rgba(mix(c[2], '#000000', 0.6), 0.95);
    ctx.beginPath(); ctx.arc(w * 0.55, h * 0.34 + pulse, h * 0.072, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.47, h * 0.42); ctx.lineTo(w * 0.55, h * 0.4);
    ctx.lineTo(w * 0.63, h * 0.44); ctx.lineTo(w * 0.65, h * 0.72);
    ctx.lineTo(w * 0.58, h * 0.72); ctx.lineTo(w * 0.55, h * 0.54);
    ctx.lineTo(w * 0.52, h * 0.72); ctx.lineTo(w * 0.44, h * 0.72);
    ctx.closePath(); ctx.fill();

    // Cursed energy / aura — fractured light geometry
    ctx.strokeStyle = rgba(c[1], 0.7 + Math.sin(t * 0.003) * 0.15);
    ctx.lineWidth = 1.2; ctx.shadowColor = c[1]; ctx.shadowBlur = 8;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + t * 0.0005;
      const r = h * (0.12 + seed(i) * 0.06 + Math.sin(t * 0.002 + i) * 0.02);
      ctx.beginPath();
      ctx.moveTo(w * 0.55, h * 0.54 + pulse);
      ctx.lineTo(w * 0.55 + Math.cos(angle) * r, h * 0.54 + Math.sin(angle) * r * 0.65 + pulse);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    vignette(ctx, w, h, '#000000', 0.62);
  },

  bones_action: (ctx, w, h, t, c) => {
    // Bones precision: clean ink outlines, smooth choreography, warm amber-blue balance
    fillBg(ctx, w, h, mix(c[0], c[3], 0.38), mix(c[0], '#1a1420', 0.45));
    radialGlow(ctx, w * 0.5, h * 0.28, w * 0.52, mix(c[3], '#ffffff', 0.2), 0.3);
    radialGlow(ctx, w * 0.5, h * 0.7, w * 0.32, c[1], 0.18);

    // Action horizon line
    ctx.strokeStyle = rgba(c[3], 0.15); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, h * 0.68); ctx.lineTo(w, h * 0.68); ctx.stroke();

    // Speed lines — clean radiating from impact center
    speedLines(ctx, w * 0.5, h * 0.45, t, c[3], 28, 0.00012);

    // Figure in decisive action mid-frame — clean proportions
    const lean = Math.sin(t * 0.0018) * 0.04;
    ctx.save(); ctx.translate(w * 0.5, h * 0.45); ctx.rotate(lean);
    // Body
    ctx.fillStyle = mix(c[2], c[3], 0.25);
    ctx.beginPath(); ctx.ellipse(0, h * 0.04, w * 0.085, h * 0.19, 0, 0, Math.PI * 2); ctx.fill();
    // Head
    ctx.fillStyle = mix(c[2], c[0], 0.3);
    ctx.beginPath(); ctx.arc(0, -h * 0.175, h * 0.075, 0, Math.PI * 2); ctx.fill();
    // Clean ink outline
    ctx.strokeStyle = mix(c[2], '#000000', 0.55); ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(0, -h * 0.175, h * 0.076, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, h * 0.04, w * 0.086, h * 0.191, 0, 0, Math.PI * 2); ctx.stroke();
    // Extended arm — action pose
    ctx.strokeStyle = mix(c[2], '#000000', 0.55); ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-w * 0.04, -h * 0.06); ctx.lineTo(-w * 0.22, h * 0.08); ctx.stroke();
    // Accent rim
    ctx.strokeStyle = rgba(c[3], 0.7); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(w * 0.06, -h * 0.2, h * 0.078, -Math.PI * 0.6, Math.PI * 0.2); ctx.stroke();
    ctx.restore();

    // Ground shadow
    ctx.fillStyle = rgba(mix(c[2], '#000000', 0.7), 0.35);
    ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.67, w * 0.12, h * 0.025, 0, 0, Math.PI * 2); ctx.fill();
    vignette(ctx, w, h, mix(c[2], '#000000', 0.4), 0.38);
  },

  toei_adventure: (ctx, w, h, t, c) => {
    // Toei grand adventure: bold saturated sky, vast horizon, triumphant scale
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
    sky.addColorStop(0, mix(c[0], c[3], 0.18));
    sky.addColorStop(0.6, mix(c[0], c[1], 0.35));
    sky.addColorStop(1, mix(c[1], '#ffffff', 0.22));
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h * 0.62);

    // Ocean / ground plane
    const sea = ctx.createLinearGradient(0, h * 0.62, 0, h);
    sea.addColorStop(0, mix(c[1], c[0], 0.28));
    sea.addColorStop(1, mix(c[1], c[2], 0.45));
    ctx.fillStyle = sea; ctx.fillRect(0, h * 0.62, w, h * 0.38);

    // Sun / focal energy — large adventure-scale glow
    radialGlow(ctx, w * 0.72, h * 0.28, w * 0.34, mix(c[3], '#ffffff', 0.4), 0.55);
    radialGlow(ctx, w * 0.72, h * 0.28, w * 0.14, '#ffffff', 0.4);

    // Horizon cloud mass
    ctx.fillStyle = rgba('#ffffff', 0.22);
    ctx.beginPath(); ctx.ellipse(w * 0.2, h * 0.56, w * 0.18, h * 0.065, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w * 0.35, h * 0.57, w * 0.12, h * 0.05, 0, 0, Math.PI * 2); ctx.fill();

    // Heroic figure silhouette — bold clean outline, fist-raised celebration pose
    const bob = Math.sin(t * 0.0014) * 1.8;
    ctx.fillStyle = mix(c[2], '#000000', 0.3);
    ctx.beginPath(); ctx.arc(w * 0.3, h * 0.44 + bob, h * 0.068, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.23, h * 0.51 + bob); ctx.lineTo(w * 0.3, h * 0.5 + bob);
    ctx.lineTo(w * 0.37, h * 0.52 + bob); ctx.lineTo(w * 0.38, h * 0.7);
    ctx.lineTo(w * 0.32, h * 0.7); ctx.lineTo(w * 0.3, h * 0.58 + bob);
    ctx.lineTo(w * 0.28, h * 0.7); ctx.lineTo(w * 0.22, h * 0.7);
    ctx.closePath(); ctx.fill();
    // Raised fist
    ctx.beginPath(); ctx.arc(w * 0.22, h * 0.41 + bob, h * 0.03, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba('#ffffff', 0.85); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(w * 0.3, h * 0.44 + bob, h * 0.07, -Math.PI * 0.6, Math.PI * 0.15); ctx.stroke();

    // Bold ink outline style
    ctx.strokeStyle = rgba(mix(c[2], '#000000', 0.65), 0.9); ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(w * 0.3, h * 0.44 + bob, h * 0.069, 0, Math.PI * 2); ctx.stroke();

    // Water sparkles on the horizon
    for (let i = 0; i < 12; i++) {
      const px = seed(i) * w, py = h * 0.64 + seed(i + 7) * h * 0.3;
      const flicker = 0.3 + Math.sin(t * 0.003 + i * 0.8) * 0.2;
      ctx.fillStyle = rgba('#ffffff', flicker * 0.5);
      ctx.fillRect(px, py, 2 + seed(i + 3) * 3, 1);
    }
    vignette(ctx, w, h, c[2], 0.3);
  },
};

/* ============================================================
   SCENES — keyed by ref.id
   ============================================================ */
export const REF_SCENES: Record<string, SceneFn> = {

  /* ───────── 3D Animation ───────── */
  pixar_dimensional: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[2], c[0], 0.25), mix(c[2], '#000', 0.4));
    radialGlow(ctx, w * 0.32, h * 0.32, w * 0.5, c[3], 0.3);
    const cx = w / 2, cy = h / 2 + Math.sin(t * 0.0015) * 6;
    // ground contact shadow
    ctx.fillStyle = rgba('#000', 0.35);
    ctx.beginPath(); ctx.ellipse(cx, h * 0.78, 46, 9, 0, 0, Math.PI * 2); ctx.fill();
    softOrb(ctx, cx, cy, 44 + Math.sin(t * 0.002) * 3, c[0], c[3]);
    softOrb(ctx, cx + 34, cy + 18, 20, c[1], c[3]);
  },
  soul: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[2], c[0], 0.2), c[2]);
    // warm bokeh
    for (let i = 0; i < 10; i++) {
      const x = (seed(i) * w + t * 0.01 * (seed(i + 1) - 0.5) * 40) % w;
      const y = h - ((t * 0.012 * (seed(i + 2) + 0.3) + seed(i) * h) % (h + 30));
      radialGlow(ctx, x, y, 18 + seed(i + 4) * 22, i % 2 ? c[3] : c[1], 0.18);
    }
    // soul spark
    const sx = w / 2 + Math.sin(t * 0.0012) * 24, sy = h * 0.45 + Math.cos(t * 0.0016) * 14;
    radialGlow(ctx, sx, sy, 40, c[3], 0.6);
    ctx.fillStyle = rgba(c[3], 0.9); ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2); ctx.fill();
  },
  kurzgesagt_clarity: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[0], c[2], 0.55), c[2]);
    const cx = w / 2, cy = h / 2;
    for (let i = 4; i >= 1; i--) {
      ctx.strokeStyle = rgba(c[3], 0.12 + i * 0.03);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, i * 22 + Math.sin(t * 0.001 + i) * 3, 0, Math.PI * 2); ctx.stroke();
    }
    // orbiting clean dots
    for (let i = 0; i < 6; i++) {
      const a = t * 0.0009 + (i / 6) * Math.PI * 2;
      const r = 56;
      ctx.fillStyle = [c[0], c[1], c[3]][i % 3];
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();
  },
  pixar_emotional_staging: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[2], '#000', 0.2), '#000');
    // single spotlight cone
    const cx = w / 2;
    const g = ctx.createLinearGradient(cx, 0, cx, h);
    g.addColorStop(0, rgba(c[3], 0.28)); g.addColorStop(1, rgba(c[3], 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(cx - 14, 0); ctx.lineTo(cx + 14, 0);
    ctx.lineTo(cx + 70, h); ctx.lineTo(cx - 70, h); ctx.closePath(); ctx.fill();
    softOrb(ctx, cx, h * 0.6 + Math.sin(t * 0.0015) * 4, 36, c[0], c[3]);
    vignette(ctx, w, h, '#000', 0.8);
  },
  dreamworks_hero_comedy: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[0], c[3], 0.4), mix(c[2], c[1], 0.3));
    // god-ray beams from top
    ctx.save(); ctx.translate(w / 2, -20);
    for (let i = -3; i <= 3; i++) {
      ctx.fillStyle = rgba(c[3], 0.06);
      ctx.beginPath(); ctx.moveTo(i * 8, 0); ctx.lineTo(i * 8 + 6, 0);
      ctx.lineTo(i * 40 + 30, h); ctx.lineTo(i * 40 - 30, h); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    // heroic low-angle silhouette (triangle stance)
    const cx = w / 2, base = h * 0.92;
    ctx.fillStyle = rgba(c[2], 0.92);
    ctx.beginPath();
    ctx.moveTo(cx, h * 0.42);
    ctx.lineTo(cx + 38, base); ctx.lineTo(cx - 38, base); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, h * 0.38, 12, 0, Math.PI * 2); ctx.fill();
  },
  illumination_pop_comedy: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[0], c[3], 0.3), c[0]);
    dots(ctx, w, h, c[3], 26, 3, 0.12);
    for (let i = 0; i < 4; i++) {
      const x = w * (0.22 + i * 0.19);
      const y = h * 0.6 + Math.sin(t * 0.004 + i * 1.5) * 14;
      softOrb(ctx, x, y, 18, [c[1], c[3], c[0], c[1]][i], c[3]);
      // googly eye dot
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y - 4, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x + 1, y - 3, 2, 0, Math.PI * 2); ctx.fill();
    }
  },
  how_to_train_dragon_flight: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[0], c[3], 0.45), mix(c[2], c[0], 0.4));
    // clouds
    for (let i = 0; i < 5; i++) {
      const x = ((t * 0.02 * (0.4 + seed(i)) + seed(i) * w) % (w + 80)) - 40;
      const y = h * (0.2 + seed(i + 2) * 0.5);
      radialGlow(ctx, x, y, 30 + seed(i) * 24, c[3], 0.18);
    }
    // swooping flight arc + dragon dot
    ctx.strokeStyle = rgba(c[2], 0.5); ctx.lineWidth = 2; ctx.beginPath();
    let fx = 0, fy = 0;
    for (let p = 0; p <= 1; p += 0.02) {
      fx = p * w; fy = h * 0.7 - Math.sin(p * Math.PI + t * 0.001) * h * 0.4;
      if (p === 0) ctx.moveTo(fx, fy); else ctx.lineTo(fx, fy);
    }
    ctx.stroke();
    ctx.fillStyle = c[2];
    ctx.save(); ctx.translate(fx, fy);
    ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(0, -4); ctx.lineTo(10, 0); ctx.lineTo(0, 4); ctx.fill();
    ctx.restore();
  },
  kung_fu_panda_brush: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[2], c[0], 0.3), c[2]);
    // bold ink brush sweep
    ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate(-0.3 + Math.sin(t * 0.001) * 0.05);
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = rgba(i < 2 ? c[1] : c[0], 0.7 - i * 0.1);
      ctx.lineWidth = 14 - i * 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-w * 0.4, 8 + i * 2);
      ctx.quadraticCurveTo(0, -20 + i * 3, w * 0.4, 4 + i * 2);
      ctx.stroke();
    }
    ctx.restore();
    // ink splatter
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = rgba(c[1], 0.4);
      ctx.beginPath(); ctx.arc(w / 2 + (seed(i) - 0.5) * w * 0.7, h / 2 + (seed(i + 5) - 0.5) * 40, seed(i + 2) * 2.5, 0, Math.PI * 2); ctx.fill();
    }
  },
  coco_marigold_afterlife: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[2], c[1], 0.35), mix(c[2], '#000', 0.3));
    // layered glow bridge
    radialGlow(ctx, w / 2, h * 0.5, w * 0.5, c[1], 0.25);
    // falling marigold petals
    for (let i = 0; i < 26; i++) {
      const x = (seed(i) * w + Math.sin(t * 0.001 + i) * 12) % w;
      const y = (t * 0.03 * (0.5 + seed(i + 1)) + seed(i) * h) % (h + 10);
      ctx.fillStyle = rgba(i % 3 ? c[1] : c[0], 0.85);
      ctx.beginPath(); ctx.ellipse(x, y, 3, 5, seed(i) * 6, 0, Math.PI * 2); ctx.fill();
    }
    // distant lights
    for (let i = 0; i < 14; i++) { ctx.fillStyle = rgba(c[3], 0.5 + seed(i) * 0.4); ctx.fillRect(seed(i) * w, h * (0.55 + seed(i + 1) * 0.4), 1.5, 1.5); }
  },
  inside_out_emotion_space: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[2], c[0], 0.15), c[2]);
    const pal = [c[1], c[0], c[3], mix(c[0], c[1], 0.5), mix(c[1], c[3], 0.5)];
    for (let i = 0; i < 5; i++) {
      const a = t * 0.0011 + (i / 5) * Math.PI * 2;
      const x = w / 2 + Math.cos(a) * w * 0.28;
      const y = h / 2 + Math.sin(a) * h * 0.26;
      radialGlow(ctx, x, y, 28, pal[i], 0.45);
      ctx.fillStyle = pal[i]; ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(x - 3, y - 3, 3, 0, Math.PI * 2); ctx.fill();
    }
  },
  wall_e_lonely_robot: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[0], c[2], 0.6), mix(c[2], c[1], 0.25));
    // dusty haze
    ctx.fillStyle = rgba(c[1], 0.06); ctx.fillRect(0, h * 0.5, w, h * 0.5);
    // vast empty ground
    ctx.fillStyle = mix(c[2], '#000', 0.3); ctx.fillRect(0, h * 0.78, w, h);
    // tiny lonely robot silhouette
    const rx = w / 2 + Math.sin(t * 0.0006) * 30, ry = h * 0.76;
    ctx.fillStyle = c[2];
    ctx.fillRect(rx - 6, ry - 10, 12, 10);
    ctx.beginPath(); ctx.arc(rx, ry - 12, 4, 0, Math.PI * 2); ctx.fill();
    // single warm sun
    radialGlow(ctx, w * 0.8, h * 0.3, 50, c[3], 0.4);
    ctx.fillStyle = rgba(c[3], 0.6); ctx.beginPath(); ctx.arc(w * 0.8, h * 0.3, 10, 0, Math.PI * 2); ctx.fill();
  },
  lego_movie_brick_energy: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[0], c[2], 0.4), c[2]);
    const bw = 26, bh = 14;
    for (let gx = 0; gx < w; gx += bw)
      for (let gy = 0; gy < h; gy += bh) {
        const wob = Math.sin(t * 0.003 + gx * 0.1 + gy * 0.2);
        ctx.fillStyle = rgba([c[0], c[1], c[3]][(gx / bw + gy / bh) % 3 | 0], 0.5 + wob * 0.18);
        ctx.fillRect(gx + 1, gy + 1, bw - 2, bh - 2);
        // studs
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.beginPath(); ctx.arc(gx + bw / 2, gy + 4, 3, 0, Math.PI * 2); ctx.fill();
      }
  },

  /* ───────── Anime / Graphic ───────── */
  anime_silhouette: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[3], c[0], 0.4), mix(c[0], c[2], 0.6));
    radialGlow(ctx, w / 2, h * 0.4, w * 0.45, c[3], 0.5);
    // backlit figure
    const cx = w / 2 + Math.sin(t * 0.0008) * 6;
    ctx.fillStyle = rgba(c[2], 0.96);
    ctx.beginPath();
    ctx.moveTo(cx, h * 0.34);
    ctx.lineTo(cx + 26, h);
    ctx.lineTo(cx - 26, h);
    ctx.closePath();
    ctx.arc(cx, h * 0.3, 12, 0, Math.PI * 2);
    ctx.fill();
    // rim light
    ctx.strokeStyle = rgba(c[3], 0.8); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx - 13, h * 0.34); ctx.lineTo(cx - 24, h); ctx.stroke();
  },

  /* ───────── Anime / Shonen ───────── */
  bleach_soul_blade: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[2], '#000', 0.3), '#000');
    radialGlow(ctx, w / 2, h / 2, w * 0.4, c[1], 0.18);
    blade(ctx, w / 2, h / 2, w, t, c[1], -0.4);
    blade(ctx, w * 0.42, h * 0.55, w, t * 1.3, c[3], -0.4, 0.3);
    // spiritual pressure rings
    for (let i = 0; i < 3; i++) {
      const r = ((t * 0.05 + i * 60) % 180);
      ctx.strokeStyle = rgba(c[1], Math.max(0, 0.4 - r / 450)); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2); ctx.stroke();
    }
  },
  one_piece_sunny_adventure: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[3], c[0], 0.3), mix(c[0], c[2], 0.4));
    radialGlow(ctx, w * 0.75, h * 0.23, 48, c[1], 0.65);
    ctx.fillStyle = mix(c[0], c[2], 0.5); ctx.fillRect(0, h * 0.66, w, h);
    ribbon(ctx, w, h, t, rgba(c[3], 0.48), h * 0.69, 5, 0, 2.5);
    const sx = w * 0.3 + Math.sin(t * 0.0012) * 7;
    figureSilhouette(ctx, sx, h * 0.59, 38, c[2], -0.08);
    // Wide-brim silhouette + elastic action arc evoke adventure energy without a copied costume.
    ctx.fillStyle = c[2]; ctx.beginPath(); ctx.ellipse(sx, h * 0.34, 18, 4, -0.08, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = c[2]; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx + 5, h * 0.47); ctx.bezierCurveTo(w * 0.52, h * 0.28, w * 0.7, h * 0.56, w * 0.83, h * 0.36); ctx.stroke();
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.arc(w * 0.83, h * 0.36, 6, 0, Math.PI * 2); ctx.fill();
    // Wind-filled original flag establishes ship-deck scale.
    ctx.strokeStyle = c[3]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.58, h * 0.64); ctx.lineTo(w * 0.58, h * 0.28); ctx.stroke();
    ctx.fillStyle = rgba(c[1], 0.82); ctx.beginPath(); ctx.moveTo(w * 0.59, h * 0.3); ctx.quadraticCurveTo(w * 0.72, h * 0.34 + Math.sin(t * 0.002) * 4, w * 0.78, h * 0.27); ctx.lineTo(w * 0.59, h * 0.47); ctx.fill();
  },
  naruto_chakra_motion: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[2], c[0], 0.2), c[2]);
    const cx = w * 0.58, cy = h * 0.48;
    ctx.strokeStyle = rgba(c[0], 0.5); ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 5; a += 0.04) {
      const r = a * 3.6;
      ctx.lineTo(cx + Math.cos(a + t * 0.003) * r, cy + Math.sin(a + t * 0.003) * r);
    }
    ctx.stroke();
    radialGlow(ctx, cx, cy, 36, c[3], 0.5);
    figureSilhouette(ctx, w * 0.33, h * 0.62, 44, c[2], 0.12);
    // Converging forearms form an anonymous hand-sign read.
    ctx.strokeStyle = c[3]; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(w * 0.27, h * 0.51); ctx.lineTo(w * 0.38, h * 0.46); ctx.lineTo(w * 0.43, h * 0.51); ctx.stroke();
    for (let i = 0; i < 16; i++) {
      const a = t * 0.002 + i; const r = 40 + (t * 0.04 + i * 12) % 60;
      ctx.fillStyle = rgba(c[1], Math.max(0, 0.4 - r / 250));
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = rgba(c[1], 0.36); ctx.lineWidth = 1.5;
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(0, h * (0.54 + i * 0.035)); ctx.lineTo(w * (0.18 + seed(i) * 0.18), h * (0.5 + i * 0.035)); ctx.stroke(); }
  },
  dragon_ball_power_aura: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[2], '#000', 0.25), '#000');
    const cx = w / 2, cy = h * 0.56;
    radialGlow(ctx, cx, cy, 70 + Math.sin(t * 0.006) * 8, c[3], 0.72);
    // Jagged aura envelope has vertical lift instead of a generic radial star.
    ctx.fillStyle = rgba(c[1], 0.28); ctx.strokeStyle = rgba(c[3], 0.82); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx, h * 0.08);
    for (let i = 1; i <= 12; i++) { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; const rr = 42 + (i % 2 ? 17 : 0) + Math.sin(t * 0.005 + i) * 5; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 1.22); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    figureSilhouette(ctx, cx, h * 0.65, 50, mix(c[2], '#000', 0.55));
    ctx.strokeStyle = rgba(c[1], 0.3); ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(cx, h * 0.8); ctx.lineTo(cx + (seed(i) - 0.5) * w, h * 0.8 + seed(i + 2) * 20); ctx.stroke(); }
    emberField(ctx, w, h, t, c[3], 24, 0.04);
  },
  jujutsu_dark_ritual: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, '#000', mix(c[2], '#000', 0.4));
    // urban shadow buildings
    ctx.fillStyle = rgba(c[2], 0.8);
    for (let i = 0; i < 6; i++) { const bx = i * (w / 6); ctx.fillRect(bx, h * (0.4 + seed(i) * 0.2), w / 6 - 3, h); }
    // blue curse fractal flame
    const cx = w / 2, cy = h * 0.5;
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = rgba(c[0], 0.5 - i * 0.07); ctx.lineWidth = 2 - i * 0.3;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += 0.2) {
        const r = 20 + i * 8 + Math.sin(a * 5 + t * 0.004 + i) * (8 + i * 3);
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 1.2);
      }
      ctx.closePath(); ctx.stroke();
    }
    radialGlow(ctx, cx, cy, 40, c[0], 0.4);
  },
  demon_slayer_breath: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[2], c[0], 0.3), mix(c[2], '#000', 0.3));
    // elemental breath ribbons
    ribbon(ctx, w, h, t, rgba(c[0], 0.5), h * 0.4, 22, 0, 5);
    ribbon(ctx, w, h, t * 1.2, rgba(c[3], 0.4), h * 0.55, 18, 2, 4);
    ribbon(ctx, w, h, t * 0.8, rgba(c[1], 0.35), h * 0.65, 14, 4, 3);
    // night lantern dots
    for (let i = 0; i < 10; i++) {
      const x = seed(i) * w, y = h * (0.15 + seed(i + 3) * 0.5) + Math.sin(t * 0.001 + i) * 4;
      radialGlow(ctx, x, y, 10, c[1], 0.4);
    }
  },
  solo_leveling_rank_shadow: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, '#000', mix(c[2], c[0], 0.2));
    radialGlow(ctx, w * 0.5, h * 0.45, w * 0.36, c[0], 0.48);
    figureSilhouette(ctx, w * 0.5, h * 0.68, 56, rgba(c[2], 0.96));
    // An ascending shadow court creates rank hierarchy and depth.
    for (let i = 0; i < 6; i++) {
      const x = w * (0.12 + i * 0.15), y = h * (0.79 + Math.abs(i - 2.5) * 0.025);
      figureSilhouette(ctx, x, y, 24 + (i % 2) * 7, rgba(mix(c[0], c[2], 0.58), 0.7));
      ctx.fillStyle = rgba(c[3], 0.9); ctx.beginPath(); ctx.ellipse(x, y - 14, 2.4, 1.2, 0, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < 5; i++) ribbon(ctx, w, h, t * (0.65 + i * 0.05), rgba(c[0], 0.12), h * (0.42 + i * 0.07), 10 + i * 2, i, 1.5);
    vignette(ctx, w, h, '#000', 0.7);
  },
  fullmetal_alchemy_circle: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[2], c[0], 0.3), c[2]);
    const cx = w / 2, cy = h / 2;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.0006);
    ctx.strokeStyle = rgba(c[1], 0.7); ctx.lineWidth = 1.5;
    [44, 34].forEach(r => { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); });
    // inscribed triangle + pentagram-ish lines
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) { const a = (i / 5) * Math.PI * 2 - Math.PI / 2; ctx.lineTo(Math.cos(a) * 34, Math.sin(a) * 34); }
    ctx.closePath(); ctx.stroke();
    // runes
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; ctx.fillStyle = rgba(c[3], 0.5); ctx.fillRect(Math.cos(a) * 39 - 1.5, Math.sin(a) * 39 - 1.5, 3, 3); }
    ctx.restore();
    radialGlow(ctx, cx, cy, 30, c[1], 0.3 + Math.sin(t * 0.003) * 0.15);
  },
  attack_titan_scale: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[2], c[1], 0.25), mix(c[2], '#000', 0.2));
    ctx.fillStyle = rgba(c[1], 0.05); ctx.fillRect(0, 0, w, h); // dusty desat
    // Massive wall and crenellations establish oppressive civic scale.
    ctx.fillStyle = mix(c[2], '#000', 0.25); ctx.fillRect(0, h * 0.25, w, h);
    for (let x = 0; x < w; x += 24) ctx.fillRect(x, h * 0.19, 15, h * 0.08);
    ctx.strokeStyle = rgba('#000', 0.3); ctx.lineWidth = 1;
    for (let y = h * 0.3; y < h; y += 14) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    // looming shadow over wall
    const sh = h * 0.25 + Math.sin(t * 0.0008) * 6;
    radialGlow(ctx, w * 0.7, sh - 30, 62, c[1], 0.16);
    ctx.fillStyle = rgba('#000', 0.72); ctx.beginPath(); ctx.arc(w * 0.7, sh - 20, 28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = rgba(c[3], 0.7);
    ctx.beginPath(); ctx.ellipse(w * 0.66, sh - 22, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w * 0.74, sh - 22, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    // Tiny airborne scouts and cable arcs make the scale ratio unmistakable.
    for (let i = 0; i < 3; i++) {
      const x = w * (0.2 + i * 0.12), y = h * (0.34 + seed(i) * 0.2);
      ctx.fillStyle = c[3]; ctx.fillRect(x, y, 2, 3);
      ctx.strokeStyle = rgba(c[3], 0.45); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 14, y - 20, x + 30, h * 0.24); ctx.stroke();
    }
    emberField(ctx, w, h, t, c[1], 18, 0.018);
  },
  bleach_hollow_mask_pressure: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, '#000', mix(c[1], '#000', 0.4));
    const cx = w / 2, cy = h / 2;
    // pressure rings
    for (let i = 0; i < 3; i++) {
      const r = (t * 0.06 + i * 50) % 150;
      ctx.strokeStyle = rgba(c[1], Math.max(0, 0.5 - r / 360)); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    }
    // white hollow mask with stripes
    ctx.fillStyle = rgba(c[3], 0.95);
    ctx.beginPath(); ctx.ellipse(cx, cy, 26, 32, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = rgba(c[1], 0.85);
    ctx.fillRect(cx - 20, cy - 6, 40, 4);
    ctx.beginPath(); ctx.arc(cx, cy - 28, 6, 0, Math.PI, true); ctx.fill();
    // eye holes
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(cx - 9, cy - 2, 4, 6, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 9, cy - 2, 4, 6, -0.3, 0, Math.PI * 2); ctx.fill();
  },
  onepiece_grandline_scale: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[3], c[0], 0.35), mix(c[0], c[2], 0.5));
    radialGlow(ctx, w * 0.75, h * 0.25, 44, c[1], 0.5);
    // Impossible distant island silhouette establishes voyage scale.
    ctx.fillStyle = rgba(c[2], 0.7);
    ctx.beginPath(); ctx.moveTo(w * 0.2, h * 0.55); ctx.quadraticCurveTo(w * 0.32, h * 0.32, w * 0.45, h * 0.55); ctx.fill();
    // ocean
    ctx.fillStyle = mix(c[0], c[2], 0.55); ctx.fillRect(0, h * 0.55, w, h);
    for (let i = 0; i < 3; i++) ribbon(ctx, w, h, t + i * 200, rgba(c[3], 0.25), h * (0.62 + i * 0.12), 5, i, 1.5);
    // Foreground prow, mast, flag and small crew silhouette sell the Grand-Line-sized horizon.
    ctx.fillStyle = rgba(c[2], 0.94); ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(w * 0.36, h); ctx.lineTo(w * 0.24, h * 0.73); ctx.lineTo(0, h * 0.66); ctx.fill();
    ctx.strokeStyle = c[3]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.18, h * 0.72); ctx.lineTo(w * 0.18, h * 0.28); ctx.stroke();
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.moveTo(w * 0.19, h * 0.3); ctx.quadraticCurveTo(w * 0.32, h * 0.34 + Math.sin(t * 0.002) * 4, w * 0.39, h * 0.27); ctx.lineTo(w * 0.19, h * 0.47); ctx.fill();
    figureSilhouette(ctx, w * 0.12, h * 0.69, 19, c[3]);
  },
  chainsaw_urban_grit: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[1], c[2], 0.5), mix(c[2], '#000', 0.3));
    // grit noise
    for (let i = 0; i < 120; i++) { ctx.fillStyle = rgba(c[2], seed(i) * 0.15); ctx.fillRect(seed(i) * w, seed(i + 1) * h, 1.5, 1.5); }
    // Rainy utility blocks ground the mechanical silhouette in urban grit.
    ctx.fillStyle = rgba(c[2], 0.58); for (let i = 0; i < 7; i++) ctx.fillRect(i * w / 7, h * (0.35 + seed(i) * 0.2), w / 7 - 3, h);
    ctx.strokeStyle = rgba(c[3], 0.14); ctx.lineWidth = 1;
    for (let i = 0; i < 28; i++) { const x = seed(i) * w; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - 18, h); ctx.stroke(); }
    figureSilhouette(ctx, w * 0.48, h * 0.72, 48, rgba(c[2], 0.96), 0.16);
    // Serrated mechanical action axis, not a copied weapon or character head.
    ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate(-0.48);
    ctx.fillStyle = rgba(c[0], 0.7);
    ctx.beginPath(); ctx.moveTo(-w * 0.18, -5); ctx.lineTo(w * 0.42, 0); ctx.lineTo(-w * 0.18, 7); ctx.fill();
    for (let i = 0; i < 11; i++) { const x = -w * 0.12 + i * w * 0.05; ctx.fillRect(x, -10, 3, 6); }
    ctx.restore();
    emberField(ctx, w, h, t, c[1], 22, 0.035);
    vignette(ctx, w, h, '#000', 0.55);
  },
  mha_hero_burst: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[3], c[0], 0.3), mix(c[0], c[2], 0.4));
    speedLines(ctx, w / 2, h * 0.55, t, c[3], 30, 0.0002);
    // spark-smoke burst
    radialGlow(ctx, w / 2, h * 0.55, 50 + Math.sin(t * 0.005) * 8, c[1], 0.5);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2; const r = 20 + (t * 0.05 + i * 9) % 50;
      ctx.fillStyle = rgba(c[3], Math.max(0, 0.6 - r / 110));
      ctx.beginPath(); ctx.arc(w / 2 + Math.cos(a) * r, h * 0.55 + Math.sin(a) * r, 2.4, 0, Math.PI * 2); ctx.fill();
    }
    figureSilhouette(ctx, w / 2, h * 0.68, 50, rgba(c[2], 0.9), -0.12);
    ctx.strokeStyle = c[2]; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(w * 0.48, h * 0.47); ctx.lineTo(w * 0.42, h * 0.25); ctx.stroke();
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.arc(w * 0.42, h * 0.22, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba(c[2], 0.8); ctx.lineWidth = 3; ctx.strokeRect(5, 5, w - 10, h - 10);
  },
  hxh_nen_tactics: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[2], c[0], 0.18), c[2]);
    // chess grid floor
    ctx.strokeStyle = rgba(c[3], 0.12); ctx.lineWidth = 0.6;
    for (let i = 0; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(0, h * 0.55 + i * 6); ctx.lineTo(w, h * 0.55 + i * 6); ctx.stroke(); }
    const cx = w / 2, cy = h * 0.4;
    ctx.strokeStyle = rgba(c[0], 0.5); ctx.lineWidth = 1.5;
    const sides = 6;
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) { const a = (i / sides) * Math.PI * 2 + t * 0.0008; const r = 30 + Math.sin(t * 0.002) * 4; ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    ctx.stroke();
    radialGlow(ctx, cx, cy, 30, c[0], 0.3);
    // Two opposing tacticians and orbiting rule-nodes create strategy, not generic power.
    figureSilhouette(ctx, w * 0.31, h * 0.72, 34, rgba(c[2], 0.92), 0.08);
    figureSilhouette(ctx, w * 0.69, h * 0.72, 34, rgba(c[3], 0.72), -0.08);
    for (let i = 0; i < 5; i++) { const a = t * 0.001 + i * Math.PI * 0.4; ctx.fillStyle = i % 2 ? c[1] : c[3]; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 38, cy + Math.sin(a) * 23, 3, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = rgba(c[1], 0.35); ctx.beginPath(); ctx.moveTo(w * 0.31, h * 0.5); ctx.lineTo(cx, cy); ctx.lineTo(w * 0.69, h * 0.5); ctx.stroke();
  },
  mob_psycho_wave: (ctx, w, h, t, c) => {
    // ordinary flat top, liquid distortion bottom
    ctx.fillStyle = mix(c[3], c[2], 0.3); ctx.fillRect(0, 0, w, h * 0.5);
    const g = ctx.createLinearGradient(0, h * 0.5, 0, h);
    g.addColorStop(0, c[0]); g.addColorStop(1, mix(c[0], '#000', 0.4));
    ctx.fillStyle = g; ctx.fillRect(0, h * 0.5, w, h * 0.5);
    // Psychic distortion waves bend around an intentionally ordinary silhouette.
    for (let k = 0; k < 4; k++) {
      ctx.strokeStyle = rgba(c[3], 0.35 - k * 0.06); ctx.lineWidth = 2; ctx.beginPath();
      for (let x = 0; x <= w; x += 5) {
        const amp = (12 + k * 6) * (0.5 + Math.sin(t * 0.004) * 0.5);
        const y = h * 0.5 + Math.sin(x * 0.04 + t * 0.005 + k) * amp;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    figureSilhouette(ctx, w * 0.5, h * 0.67, 38, rgba(c[2], 0.92));
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + t * 0.001; const r = 30 + (i % 3) * 10; ctx.fillStyle = rgba(c[3], 0.5); ctx.fillRect(w * 0.5 + Math.cos(a) * r, h * 0.48 + Math.sin(a) * r, 3, 3); }
    // escalation meter
    const pct = (Math.sin(t * 0.001) * 0.5 + 0.5);
    ctx.fillStyle = rgba(c[1], 0.8); ctx.fillRect(w - 16, h - 6 - h * 0.4 * pct, 6, h * 0.4 * pct);
  },
  jojo_pose_graphic: (ctx, w, h, t, c) => {
    // palette inversion pulse
    const inv = Math.sin(t * 0.0015) > 0;
    fillBg(ctx, w, h, inv ? c[1] : c[2], inv ? c[2] : mix(c[1], '#000', 0.3));
    // diagonal menace lines
    ctx.strokeStyle = rgba(inv ? c[2] : c[1], 0.35); ctx.lineWidth = 2;
    for (let i = -4; i < 10; i++) { ctx.beginPath(); ctx.moveTo(i * 28, 0); ctx.lineTo(i * 28 - 60, h); ctx.stroke(); }
    // Statue-like asymmetric fashion pose with a separate foreground hand plane.
    const cx = w / 2;
    ctx.fillStyle = rgba(c[3], 0.9);
    ctx.save(); ctx.translate(cx, h * 0.5); ctx.rotate(0.18);
    ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(22, -6); ctx.lineTo(8, 4); ctx.lineTo(18, 38); ctx.lineTo(-10, 38); ctx.lineTo(-4, 4); ctx.lineTo(-22, 10); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = rgba(c[3], 0.85); ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx + 5, h * 0.36); ctx.lineTo(cx + 48, h * 0.2); ctx.lineTo(cx + 58, h * 0.34); ctx.stroke();
    radialGlow(ctx, cx, h * 0.54, 54, c[0], 0.2);
    // sound-shape accent
    ctx.fillStyle = rgba(c[1], 0.8); ctx.font = 'bold 16px sans-serif'; ctx.fillText('ゴ', w * 0.72, h * 0.4);
  },
  one_punch_contrast: (ctx, w, h, t, c) => {
    // left: mundane simplicity, right: apocalyptic detail
    ctx.fillStyle = mix(c[3], c[2], 0.2); ctx.fillRect(0, 0, w / 2, h);
    figureSilhouette(ctx, w * 0.25, h * 0.68, 38, c[2]);
    ctx.strokeStyle = c[2]; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(w * 0.225, h * 0.39); ctx.lineTo(w * 0.275, h * 0.39); ctx.stroke();
    // apocalyptic right half
    fillBg2(ctx, w / 2, 0, w / 2, h, mix(c[0], '#000', 0.2), c[2]);
    emberField(ctx, w, h, t, c[1], 30, 0.05);
    speedLines(ctx, w * 0.75, h * 0.5, t, c[0], 24, 0.0006);
    ctx.fillStyle = rgba(c[0], 0.72); ctx.beginPath();
    for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI * 2; const r = i % 2 ? 44 : 28; ctx.lineTo(w * 0.76 + Math.cos(a) * r, h * 0.52 + Math.sin(a) * r); } ctx.fill();
    // divider
    ctx.fillStyle = rgba(c[3], 0.4); ctx.fillRect(w / 2 - 1, 0, 2, h);
  },
  haikyuu_motion_lines: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[3], c[0], 0.25), mix(c[0], c[2], 0.4));
    // net border
    ctx.strokeStyle = rgba(c[3], 0.3); ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 10) { ctx.beginPath(); ctx.moveTo(x, h * 0.7); ctx.lineTo(x, h * 0.78); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(0, h * 0.7); ctx.lineTo(w, h * 0.7); ctx.stroke();
    // Vertical leap and opposing block converge at a single readable contact point.
    const ly = h * 0.5 - Math.abs(Math.sin(t * 0.0025)) * h * 0.25;
    ctx.strokeStyle = rgba(c[2], 0.5); ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(w / 2 + i * 10, ly + 30); ctx.lineTo(w / 2 + i * 10, ly + 70); ctx.stroke(); }
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.arc(w / 2, ly, 8, 0, Math.PI * 2); ctx.fill();
    figureSilhouette(ctx, w * 0.39, ly + 55, 38, c[2], -0.16);
    figureSilhouette(ctx, w * 0.63, ly + 48, 34, rgba(c[3], 0.9), 0.12);
    ctx.strokeStyle = c[2]; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(w * 0.4, ly + 30); ctx.lineTo(w * 0.49, ly + 5); ctx.stroke();
    ctx.strokeStyle = c[3]; ctx.beginPath(); ctx.moveTo(w * 0.62, ly + 25); ctx.lineTo(w * 0.53, ly + 5); ctx.stroke();
    ctx.strokeStyle = rgba(c[1], 0.5); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w * 0.54, ly - 5, 20, 0.2, 2.5); ctx.stroke();
  },

  /* ───────── Anime / Mecha ───────── */
  evangelion_bio_mech: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[2], '#000', 0.3), '#000');
    // hazard warning bars
    ctx.save();
    for (let i = -2; i < 14; i++) { ctx.fillStyle = rgba(i % 2 ? c[1] : c[3], 0.08); ctx.beginPath(); ctx.moveTo(i * 30, 0); ctx.lineTo(i * 30 + 14, 0); ctx.lineTo(i * 30 - 30, h); ctx.lineTo(i * 30 - 44, h); ctx.fill(); }
    ctx.restore();
    // bio-mech eye / core
    const cx = w / 2, cy = h / 2;
    radialGlow(ctx, cx, cy, 44, c[0], 0.5);
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.ellipse(cx, cy, 22, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx + Math.sin(t * 0.002) * 8, cy, 5, 0, Math.PI * 2); ctx.fill();
    // warning cross
    ctx.strokeStyle = rgba(c[3], 0.4 + Math.sin(t * 0.006) * 0.3); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
  },

  /* ───────── Anime / Cinematic ───────── */
  akira_neon_impact: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, '#000', mix(c[0], '#000', 0.5));
    // city base
    ctx.fillStyle = rgba(c[2], 0.8);
    for (let i = 0; i < 8; i++) ctx.fillRect(i * (w / 8), h * (0.55 + seed(i) * 0.2), w / 8 - 2, h);
    // expanding psychic impact ring
    const r = (t * 0.08) % 160;
    const a = Math.max(0, 1 - r / 160);
    ctx.strokeStyle = rgba(c[0], a * 0.9); ctx.lineWidth = 4 * a + 1;
    ctx.beginPath(); ctx.arc(w / 2, h * 0.5, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = rgba(c[1], a * 0.6); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(w / 2, h * 0.5, r * 0.7, 0, Math.PI * 2); ctx.stroke();
    radialGlow(ctx, w / 2, h * 0.5, 30, c[0], 0.6);
  },
  ghost_shell_cyber_melancholy: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[0], c[2], 0.4), mix(c[2], '#000', 0.3));
    // reflective glass buildings
    for (let i = 0; i < 6; i++) {
      const bx = i * (w / 6), bh = h * (0.4 + seed(i) * 0.4);
      ctx.fillStyle = rgba(c[0], 0.2); ctx.fillRect(bx, h - bh, w / 6 - 2, bh);
      for (let y = h - bh; y < h; y += 8) for (let x = bx; x < bx + w / 6 - 2; x += 6) if (seed(x * y) > 0.7) { ctx.fillStyle = rgba(c[3], 0.5); ctx.fillRect(x, y, 2, 2); }
    }
    // rain streaks
    ctx.strokeStyle = rgba(c[3], 0.18); ctx.lineWidth = 1;
    for (let i = 0; i < 30; i++) { const x = (seed(i) * w + t * 0.05) % w; const y = (seed(i + 1) * h + t * 0.4) % h; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2, y + 10); ctx.stroke(); }
  },
  cowboy_bebop_noir_jazz: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[2], '#000', 0.2), '#000');
    // retro color blocks
    ctx.fillStyle = rgba(c[0], 0.25); ctx.fillRect(0, 0, w * 0.4, h);
    ctx.fillStyle = rgba(c[1], 0.18); ctx.fillRect(w * 0.6, 0, w * 0.4, h);
    // smoky shadow
    for (let i = 0; i < 4; i++) { const x = w * 0.5 + Math.sin(t * 0.0008 + i) * 20; radialGlow(ctx, x, h * (0.3 + i * 0.15), 36, c[3], 0.06); }
    // lone silhouette + cig glow
    const cx = w * 0.42;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.moveTo(cx, h * 0.4); ctx.lineTo(cx + 20, h); ctx.lineTo(cx - 20, h); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, h * 0.36, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = rgba(c[1], 0.9); ctx.beginPath(); ctx.arc(cx + 12, h * 0.4, 1.6, 0, Math.PI * 2); ctx.fill();
  },
  vinland_north_epic: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[3], c[0], 0.5), mix(c[0], c[2], 0.55));
    // cold sea
    ctx.fillStyle = mix(c[0], c[2], 0.6); ctx.fillRect(0, h * 0.6, w, h);
    for (let i = 0; i < 3; i++) ribbon(ctx, w, h, t * 0.6 + i * 150, rgba(c[3], 0.2), h * (0.66 + i * 0.1), 4, i, 1.2);
    // snow drift
    for (let i = 0; i < 24; i++) { const x = (seed(i) * w + t * 0.01) % w; const y = (seed(i + 1) * h + t * 0.02) % h; ctx.fillStyle = rgba(c[3], 0.4); ctx.fillRect(x, y, 1.5, 1.5); }
    // distant longship
    ctx.fillStyle = rgba(c[2], 0.7); ctx.beginPath(); ctx.moveTo(w * 0.4, h * 0.6); ctx.lineTo(w * 0.6, h * 0.6); ctx.lineTo(w * 0.56, h * 0.64); ctx.lineTo(w * 0.44, h * 0.64); ctx.fill();
  },
  berserk_dark_engraving: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, '#000', mix(c[2], '#000', 0.5));
    // dense engraving hatching
    ctx.strokeStyle = rgba(c[2], 0.5); ctx.lineWidth = 0.6;
    for (let i = 0; i < 60; i++) { const x = seed(i) * w; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 20, h); ctx.stroke(); }
    // brutal blade weight
    blade(ctx, w / 2, h / 2, w, t * 0.4, c[3], -0.5, 0.45);
    ctx.fillStyle = rgba(c[3], 0.15); ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate(-0.5); ctx.fillRect(-w * 0.4, -10, w * 0.8, 18); ctx.restore();
    // single ember of will
    const ex = w / 2, ey = h / 2;
    radialGlow(ctx, ex, ey, 14, c[0], 0.8);
    vignette(ctx, w, h, '#000', 0.8);
  },
  monster_quiet_dread: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[3], c[2], 0.4), mix(c[2], '#000', 0.2));
    // clinical interior lines
    ctx.strokeStyle = rgba(c[2], 0.3); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, h * 0.7); ctx.lineTo(w, h * 0.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.3, h * 0.7); ctx.lineTo(w * 0.1, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.7, h * 0.7); ctx.lineTo(w * 0.9, h); ctx.stroke();
    // one face half in shadow
    const cx = w / 2, cy = h * 0.42;
    ctx.fillStyle = rgba(c[3], 0.5); ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.beginPath(); ctx.arc(cx, cy, 22, -Math.PI / 2, Math.PI / 2); ctx.fill();
    // slow breathing glow
    radialGlow(ctx, cx, cy, 30 + Math.sin(t * 0.0015) * 4, c[0], 0.12);
  },
  abyss_vertical_wonder: (ctx, w, h, t, c) => {
    // vertical strata, light fading by layer
    const layers = 5;
    for (let i = 0; i < layers; i++) {
      const k = i / layers;
      ctx.fillStyle = mix(mix(c[3], c[0], 0.4), mix(c[2], '#000', 0.5), k);
      ctx.fillRect(0, (h / layers) * i, w, h / layers + 1);
    }
    // floating motes deepening
    for (let i = 0; i < 20; i++) { const x = seed(i) * w; const y = (seed(i + 1) * h + t * 0.02) % h; ctx.fillStyle = rgba(c[3], (1 - y / h) * 0.5); ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2); ctx.fill(); }
    // tiny explorer descending
    const ey = (h * 0.2 + t * 0.01) % (h * 0.8) + h * 0.1;
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.arc(w * 0.5, ey, 3, 0, Math.PI * 2); ctx.fill();
  },

  /* ───────── Anime / Auteur ───────── */
  makoto_shinkai_sky_light: (ctx, w, h, t, c) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, mix(c[0], c[2], 0.4)); g.addColorStop(0.5, c[1]); g.addColorStop(1, mix(c[3], c[1], 0.4));
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // sun bloom + lens flare line
    const sx = w * 0.66, sy = h * 0.4;
    radialGlow(ctx, sx, sy, 50, c[3], 0.7);
    for (let i = 0; i < 5; i++) { const fx = sx + (sx - w / 2) * (i - 2) * 0.4; radialGlow(ctx, fx, sy + (sy - h / 2) * (i - 2) * 0.4, 8, c[3], 0.25); }
    // clouds
    for (let i = 0; i < 4; i++) { const x = (seed(i) * w + t * 0.015) % (w + 60) - 30; radialGlow(ctx, x, h * (0.3 + seed(i) * 0.4), 26, c[3], 0.14); }
    // rain reflection ground
    ctx.fillStyle = rgba(c[0], 0.3); ctx.fillRect(0, h * 0.85, w, h);
  },
  satoshi_kon_dream_cut: (ctx, w, h, t, c) => {
    // fractured mirror halves with mismatched palettes
    ctx.fillStyle = mix(c[0], c[2], 0.3); ctx.fillRect(0, 0, w, h / 2);
    ctx.fillStyle = mix(c[1], c[2], 0.3); ctx.fillRect(0, h / 2, w, h / 2);
    // glitch cut offset
    const off = Math.sin(t * 0.003) * 16;
    ctx.fillStyle = mix(c[3], c[0], 0.5);
    ctx.fillRect(off, h * 0.42, w, h * 0.08);
    ctx.fillStyle = mix(c[3], c[1], 0.5);
    ctx.fillRect(-off, h * 0.5, w, h * 0.08);
    // two mismatched eyes (identity fracture)
    ctx.fillStyle = c[3]; ctx.beginPath(); ctx.arc(w * 0.38, h * 0.3, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.arc(w * 0.62, h * 0.66, 6, 0, Math.PI * 2); ctx.fill();
    // scan jitter
    if (Math.sin(t * 0.02) > 0.9) { ctx.fillStyle = rgba(c[3], 0.1); ctx.fillRect(0, seed(t | 0) * h, w, 3); }
  },
  frieren_melancholy_fantasy: (ctx, w, h, t, c) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, mix(c[3], c[0], 0.4)); g.addColorStop(1, mix(c[0], c[2], 0.4));
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // soft field
    ctx.fillStyle = rgba(c[2], 0.4); ctx.beginPath(); ctx.moveTo(0, h * 0.78); ctx.quadraticCurveTo(w / 2, h * 0.72, w, h * 0.8); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
    // gentle magic motes
    for (let i = 0; i < 16; i++) { const x = seed(i) * w; const y = h * 0.5 + Math.sin(t * 0.001 + i) * 20; ctx.fillStyle = rgba(c[3], 0.4 + Math.sin(t * 0.002 + i) * 0.3); ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill(); }
    // lone tiny figure
    ctx.fillStyle = c[2]; ctx.fillRect(w * 0.5 - 1.5, h * 0.74, 3, 6);
  },
  violet_light_elegance: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[3], c[0], 0.3), mix(c[0], c[2], 0.3));
    // soft memory diffusion
    radialGlow(ctx, w * 0.4, h * 0.4, w * 0.5, c[3], 0.35);
    // window light shafts
    const g = ctx.createLinearGradient(w * 0.2, 0, w * 0.6, h);
    g.addColorStop(0, rgba(c[3], 0.2)); g.addColorStop(1, rgba(c[3], 0));
    ctx.fillStyle = g; ctx.fillRect(w * 0.2, 0, w * 0.4, h);
    // hands holding small object (two soft arcs + glow)
    ctx.strokeStyle = rgba(c[1], 0.5); ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.72, 24, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    radialGlow(ctx, w / 2, h * 0.62, 14 + Math.sin(t * 0.002) * 2, c[3], 0.7);
  },
  vagabond_ink_brush: (ctx, w, h, t, c) => {
    ctx.fillStyle = mix(c[3], '#fff', 0.3); ctx.fillRect(0, 0, w, h); // white space = fear
    // single decisive brush cut
    ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate(-0.7 + Math.sin(t * 0.0008) * 0.03);
    const g = ctx.createLinearGradient(-w * 0.4, 0, w * 0.4, 0);
    g.addColorStop(0, rgba(c[2], 0)); g.addColorStop(0.3, rgba(c[2], 0.95)); g.addColorStop(0.7, rgba(c[2], 0.85)); g.addColorStop(1, rgba(c[2], 0));
    ctx.strokeStyle = g; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-w * 0.4, 14); ctx.quadraticCurveTo(0, -10, w * 0.4, -14); ctx.stroke();
    // dry-brush flecks
    for (let i = 0; i < 14; i++) { ctx.fillStyle = rgba(c[2], 0.5 * seed(i)); ctx.fillRect((seed(i) - 0.5) * w * 0.7, -14 + seed(i + 3) * 28, seed(i + 1) * 3, 1.5); }
    ctx.restore();
  },

  /* ───────── Animation Auteur ───────── */
  miyazaki_wind_nature: (ctx, w, h, t, c) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, mix(c[3], c[0], 0.3)); g.addColorStop(0.6, c[0]); g.addColorStop(1, mix(c[0], c[1], 0.4));
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // soft watercolor clouds
    for (let i = 0; i < 4; i++) { const x = (seed(i) * w + t * 0.012) % (w + 60) - 30; radialGlow(ctx, x, h * (0.2 + seed(i) * 0.2), 30, c[3], 0.16); }
    // grass field bending in wind
    ctx.fillStyle = mix(c[1], c[2], 0.4); ctx.fillRect(0, h * 0.7, w, h);
    ctx.strokeStyle = rgba(mix(c[1], '#000', 0.2), 0.5); ctx.lineWidth = 1.4;
    for (let x = 0; x < w; x += 7) { const sway = Math.sin(t * 0.003 + x * 0.05) * 8; ctx.beginPath(); ctx.moveTo(x, h); ctx.quadraticCurveTo(x + sway / 2, h * 0.8, x + sway, h * 0.66); ctx.stroke(); }
  },
  laika_tactile_stopmotion: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[2], c[0], 0.3), mix(c[2], '#000', 0.3));
    // moody side key light
    radialGlow(ctx, w * 0.25, h * 0.35, w * 0.4, c[1], 0.3);
    const qt = Math.floor(t / 83) * 83;
    figureSilhouette(ctx, w * 0.52, h * 0.7 + Math.sin(qt * 0.003) * 3, 52, c[0], 0.05);
    // Visible button eyes, stitched coat, armature joints and miniature floor sell tactility.
    ctx.fillStyle = c[3]; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.37, 3, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(w * 0.54, h * 0.37, 3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba(c[1], 0.65); ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(w * 0.46, h * 0.55); ctx.lineTo(w * 0.58, h * 0.55); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < 90; i++) { ctx.fillStyle = rgba(c[3], 0.06 + seed(i) * 0.08); ctx.fillRect(seed(i + Math.floor(qt / 83)) * w, seed(i + 4) * h, 1, 1); }
    ctx.fillStyle = rgba(c[2], 0.45); ctx.beginPath(); ctx.ellipse(w * 0.52, h * 0.86, 42, 6, 0, 0, Math.PI * 2); ctx.fill();
    vignette(ctx, w, h, '#000', 0.48);
  },
  ghibli_spirited_bathhouse: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[2], c[0], 0.3), mix(c[2], '#000', 0.25));
    // Layered original bathhouse silhouette, windows and bridge replace generic bokeh.
    ctx.fillStyle = mix(c[2], '#000', 0.35); ctx.fillRect(w * 0.17, h * 0.22, w * 0.66, h * 0.63);
    for (let level = 0; level < 3; level++) {
      const y = h * (0.25 + level * 0.18); ctx.fillStyle = mix(c[1], c[2], 0.45);
      ctx.beginPath(); ctx.moveTo(w * (0.1 + level * 0.05), y); ctx.lineTo(w * (0.9 - level * 0.05), y); ctx.lineTo(w * (0.82 - level * 0.04), y - 11); ctx.lineTo(w * (0.18 + level * 0.04), y - 11); ctx.fill();
      for (let i = 0; i < 5; i++) { const x = w * (0.25 + i * 0.125); const pulse = 0.5 + Math.sin(t * 0.002 + i + level) * 0.2; radialGlow(ctx, x, y + 13, 13, c[1], pulse * 0.42); ctx.fillStyle = rgba(c[3], pulse); ctx.fillRect(x - 2, y + 8, 4, 7); }
    }
    ctx.strokeStyle = rgba(c[3], 0.45); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, h * 0.78); ctx.quadraticCurveTo(w * 0.5, h * 0.64, w, h * 0.78); ctx.stroke();
    for (let i = 0; i < 8; i++) { const x = seed(i) * w; const y = h - ((t * 0.018 + seed(i) * h) % h); radialGlow(ctx, x, y, 18, c[3], 0.12); }
  },

  /* ───────── 2D Animation ───────── */
  cartoon_network_graphic: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, c[3], mix(c[3], c[0], 0.3));
    // bold flat shapes
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.arc(w * 0.32, h * 0.5 + Math.sin(t * 0.004) * 6, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[1]; ctx.fillRect(w * 0.55, h * 0.35, 44, 44);
    ctx.fillStyle = c[2];
    ctx.beginPath(); ctx.moveTo(w * 0.78, h * 0.3); ctx.lineTo(w * 0.9, h * 0.7); ctx.lineTo(w * 0.66, h * 0.7); ctx.fill();
    // thick outlines
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(w * 0.32, h * 0.5 + Math.sin(t * 0.004) * 6, 26, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeRect(w * 0.55, h * 0.35, 44, 44);
  },
  hanna_barbera_retro: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[3], c[1], 0.3), mix(c[1], c[2], 0.3));
    // repeating limited-animation background strip (scrolls)
    const off = (t * 0.03) % 60;
    ctx.fillStyle = rgba(c[0], 0.4);
    for (let x = -60 + off; x < w; x += 60) { ctx.beginPath(); ctx.moveTo(x, h * 0.6); ctx.lineTo(x + 30, h * 0.4); ctx.lineTo(x + 60, h * 0.6); ctx.fill(); }
    // pastel TV scanline tint
    scanlines(ctx, w, h, 0.06);
    // simple bobbing character dot
    ctx.fillStyle = c[2]; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.7 + Math.abs(Math.sin(t * 0.004)) * -10, 12, 0, Math.PI * 2); ctx.fill();
  },
  spongebob_flat_absurd: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[0], c[3], 0.4), mix(c[0], c[2], 0.4));
    // wavy seabed
    ctx.fillStyle = mix(c[1], c[3], 0.3);
    ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w; x += 12) ctx.lineTo(x, h * 0.78 + Math.sin(x * 0.1 + t * 0.002) * 5); ctx.lineTo(w, h); ctx.fill();
    // rising bubbles
    for (let i = 0; i < 18; i++) { const x = seed(i) * w + Math.sin(t * 0.002 + i) * 8; const y = h - ((t * 0.03 * (0.5 + seed(i)) + seed(i) * h) % h); ctx.strokeStyle = rgba(c[3], 0.5); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 2 + seed(i + 2) * 4, 0, Math.PI * 2); ctx.stroke(); }
    // absurd flat sun
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.arc(w * 0.8, h * 0.22, 14, 0, Math.PI * 2); ctx.fill();
  },
  samurai_jack_minimal: (ctx, w, h, t, c) => {
    // vast flat color fields
    ctx.fillStyle = mix(c[0], c[3], 0.3); ctx.fillRect(0, 0, w, h * 0.62);
    ctx.fillStyle = c[1]; ctx.fillRect(0, h * 0.62, w, h);
    // minimal sun disc
    ctx.fillStyle = mix(c[3], c[1], 0.4); ctx.beginPath(); ctx.arc(w * 0.5, h * 0.36, 22, 0, Math.PI * 2); ctx.fill();
    // lone silhouette, graphic stillness
    const cx = w * 0.5 + Math.sin(t * 0.0005) * 3;
    ctx.fillStyle = c[2];
    ctx.beginPath(); ctx.moveTo(cx, h * 0.5); ctx.lineTo(cx + 8, h * 0.62); ctx.lineTo(cx - 8, h * 0.62); ctx.fill();
    ctx.fillRect(cx - 1, h * 0.46, 2, 16); // sword line
  },
  batman_animated_noir: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[0], '#000', 0.3), '#000');
    // deco red-black skyline
    ctx.fillStyle = mix(c[2], '#000', 0.3);
    for (let i = 0; i < 7; i++) { const bx = i * (w / 7); const bh = h * (0.4 + seed(i) * 0.4); ctx.fillRect(bx, h - bh, w / 7 - 3, bh); }
    // red sky glow
    radialGlow(ctx, w / 2, h * 0.25, w * 0.5, c[0], 0.3);
    // spotlight bat-signal disc
    const sx = w * 0.7;
    radialGlow(ctx, sx, h * 0.3, 26, c[3], 0.5);
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(sx, h * 0.3, 10, 5, 0, 0, Math.PI * 2); ctx.fill();
  },

  /* ───────── Anime / Comedy ───────── */
  spy_family_pastel_comedy: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[3], c[1], 0.3), mix(c[1], c[3], 0.5));
    // pastel hearts floating
    for (let i = 0; i < 8; i++) {
      const x = seed(i) * w, y = h - ((t * 0.02 * (0.5 + seed(i)) + seed(i) * h) % (h + 20));
      ctx.fillStyle = rgba(c[0], 0.5);
      ctx.save(); ctx.translate(x, y); ctx.scale(0.5, 0.5);
      ctx.beginPath(); ctx.moveTo(0, 4); ctx.bezierCurveTo(-8, -6, -16, 4, 0, 14); ctx.bezierCurveTo(16, 4, 8, -6, 0, 4); ctx.fill();
      ctx.restore();
    }
    // spy contrast: one dark accent figure
    ctx.fillStyle = mix(c[2], '#000', 0.3);
    ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.45); ctx.lineTo(w * 0.5 + 16, h * 0.8); ctx.lineTo(w * 0.5 - 16, h * 0.8); ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.42, 9, 0, Math.PI * 2); ctx.fill();
    // hat brim
    ctx.fillRect(w * 0.5 - 12, h * 0.36, 24, 3);
  },

  /* ───────── Animation / Game ───────── */
  pokemon_bright_world: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[0], c[3], 0.4), mix(c[3], c[1], 0.3));
    // bright sun
    radialGlow(ctx, w * 0.82, h * 0.2, 40, c[1], 0.5);
    // rolling hills
    ctx.fillStyle = mix(c[1], c[3], 0.4); ctx.beginPath(); ctx.moveTo(0, h); ctx.quadraticCurveTo(w * 0.3, h * 0.6, w * 0.6, h * 0.75); ctx.quadraticCurveTo(w * 0.85, h * 0.85, w, h * 0.7); ctx.lineTo(w, h); ctx.fill();
    ctx.fillStyle = mix(c[1], c[2], 0.3); ctx.beginPath(); ctx.moveTo(0, h); ctx.quadraticCurveTo(w * 0.5, h * 0.82, w, h * 0.88); ctx.lineTo(w, h); ctx.fill();
    // little creature silhouette
    const px = w * 0.5 + Math.sin(t * 0.0015) * 14;
    ctx.fillStyle = c[2]; ctx.beginPath(); ctx.arc(px, h * 0.78, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(px - 6, h * 0.72); ctx.lineTo(px - 9, h * 0.66); ctx.lineTo(px - 3, h * 0.72); ctx.fill();
  },

  /* ───────── Anime / Game ───────── */
  yugioh_duel_stage: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[2], '#000', 0.3), '#000');
    // two crossing spotlights
    [0.32, 0.68].forEach((fx, k) => {
      const g = ctx.createLinearGradient(w * fx, 0, w * (fx > 0.5 ? 0.4 : 0.6), h);
      g.addColorStop(0, rgba(k ? c[1] : c[0], 0.3)); g.addColorStop(1, rgba(k ? c[1] : c[0], 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(w * fx - 10, 0); ctx.lineTo(w * fx + 10, 0); ctx.lineTo(w * 0.5 + 50, h); ctx.lineTo(w * 0.5 - 50, h); ctx.fill();
    });
    // floating card
    ctx.save(); ctx.translate(w / 2, h * 0.5); ctx.rotate(Math.sin(t * 0.0015) * 0.1);
    ctx.fillStyle = mix(c[3], c[1], 0.3); ctx.fillRect(-18, -26, 36, 52);
    ctx.strokeStyle = c[0]; ctx.lineWidth = 2; ctx.strokeRect(-18, -26, 36, 52);
    ctx.fillStyle = rgba(c[0], 0.5); ctx.fillRect(-12, -20, 24, 18);
    ctx.restore();
    radialGlow(ctx, w / 2, h * 0.5, 30, c[3], 0.3);
  },
  digimon_digital_adventure: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[0], c[2], 0.4), c[2]);
    // digital grid horizon
    ctx.strokeStyle = rgba(c[3], 0.2); ctx.lineWidth = 0.7;
    for (let i = 1; i < 10; i++) { const y = h * 0.55 + i * i * 1.6; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    for (let x = -5; x <= 5; x++) { ctx.beginPath(); ctx.moveTo(w / 2 + x * 8, h * 0.55); ctx.lineTo(w / 2 + x * 60, h); ctx.stroke(); }
    // code particles
    for (let i = 0; i < 20; i++) { const x = seed(i) * w; const y = (seed(i + 1) * h + t * 0.05) % (h * 0.55); ctx.fillStyle = rgba(c[1], 0.6); ctx.fillRect(x, y, 2, 4); }
    // partner silhouette
    ctx.fillStyle = c[3]; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.45, 10, 0, Math.PI * 2); ctx.fill();
  },

  /* ───────── Game / Animation ───────── */
  league_arcane_bridge: (ctx, w, h, t, c) => {
    // dual-tone painterly: top bright (Piltover), bottom grime (Zaun)
    ctx.fillStyle = mix(c[3], c[0], 0.4); ctx.fillRect(0, 0, w, h * 0.5);
    fillBg2(ctx, 0, h * 0.5, w, h * 0.5, mix(c[1], c[2], 0.4), mix(c[2], '#000', 0.3));
    // bridge
    ctx.fillStyle = rgba(c[2], 0.8); ctx.fillRect(0, h * 0.48, w, 8);
    ctx.fillStyle = rgba(c[2], 0.6);
    for (let x = 10; x < w; x += 28) ctx.fillRect(x, h * 0.48, 4, h * 0.18);
    // magic crystal glow
    radialGlow(ctx, w / 2, h * 0.5, 30 + Math.sin(t * 0.003) * 5, c[0], 0.5);
    ctx.fillStyle = c[3]; ctx.save(); ctx.translate(w / 2, h * 0.5); ctx.rotate(t * 0.001);
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(6, 0); ctx.lineTo(0, 8); ctx.lineTo(-6, 0); ctx.fill(); ctx.restore();
    // floating ash/spark
    emberField(ctx, w, h, t, c[1], 16, 0.02);
  },

  /* ───────── Anime Action (DNA refs) ───────── */
  demon_slayer_dna: (ctx, w, h, t, c) => {
    // golden hour wisteria/sunset wash
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, mix(c[0], c[2], 0.3)); g.addColorStop(0.6, c[1]); g.addColorStop(1, mix(c[3], c[1], 0.4));
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // fluid breathing-pattern (water ripple + flame)
    for (let k = 0; k < 3; k++) {
      ctx.strokeStyle = rgba(k ? c[3] : c[0], 0.45 - k * 0.1); ctx.lineWidth = 2.5 - k * 0.5;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2; a += 0.12) {
        const r = 30 + k * 16 + Math.sin(a * 6 + t * 0.004 + k) * (10 + k * 4);
        const x = w / 2 + Math.cos(a) * r, y = h / 2 + Math.sin(a) * r * 0.8;
        if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.stroke();
    }
    // settling particles
    for (let i = 0; i < 18; i++) { const x = seed(i) * w; const y = (seed(i + 1) * h + t * 0.015) % h; ctx.fillStyle = rgba(c[3], 0.5); ctx.beginPath(); ctx.arc(x, y, 1.3, 0, Math.PI * 2); ctx.fill(); }
    radialGlow(ctx, w / 2, h / 2, 36, c[3], 0.25);
  },
  jjk_dna: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, '#000', mix(c[0], '#000', 0.5));
    // heavy dark shadow masses with energy rim
    ctx.fillStyle = rgba(c[2], 0.85);
    ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, h * 0.5); ctx.quadraticCurveTo(w * 0.3, h * 0.3, w * 0.55, h * 0.6); ctx.quadraticCurveTo(w * 0.8, h * 0.9, w, h * 0.55); ctx.lineTo(w, h); ctx.fill();
    // purple-black fractal flame aura
    const cx = w / 2, cy = h * 0.4;
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = rgba(c[0], 0.5 - i * 0.08); ctx.lineWidth = 2 - i * 0.3; ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += 0.18) { const r = 18 + i * 9 + Math.sin(a * 7 + t * 0.005 + i) * (7 + i * 3); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 1.3); }
      ctx.closePath(); ctx.stroke();
    }
    // ink speed lines
    ctx.strokeStyle = rgba(c[3], 0.18); ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 40, cy + Math.sin(a) * 40); ctx.lineTo(cx + Math.cos(a) * 80, cy + Math.sin(a) * 80); ctx.stroke(); }
    radialGlow(ctx, cx, cy, 30, c[0], 0.4);
  },
  mha_dna: (ctx, w, h, t, c) => {
    fillBg(ctx, w, h, mix(c[3], c[0], 0.3), mix(c[0], c[2], 0.4));
    // radiating speed lines from power point (upward)
    const px = w / 2, py = h * 0.62;
    ctx.strokeStyle = rgba(c[3], 0.2); ctx.lineWidth = 1.4;
    for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(px + Math.cos(a) * 24, py + Math.sin(a) * 24); ctx.lineTo(px + Math.cos(a) * 120, py + Math.sin(a) * 120); ctx.stroke(); }
    radialGlow(ctx, px, py, 44 + Math.sin(t * 0.005) * 6, c[1], 0.5);
    // upward heroic silhouette, clean cel
    ctx.fillStyle = rgba(c[2], 0.92);
    ctx.beginPath(); ctx.moveTo(px, h * 0.34); ctx.lineTo(px + 18, py); ctx.lineTo(px - 18, py); ctx.fill();
    ctx.beginPath(); ctx.arc(px, h * 0.3, 11, 0, Math.PI * 2); ctx.fill();
    // panel border
    ctx.strokeStyle = rgba(c[2], 0.9); ctx.lineWidth = 3; ctx.strokeRect(4, 4, w - 8, h - 8);
  },
};

/** secondary fillBg into a sub-rect */
function fillBg2(ctx: CtX, x: number, y: number, w: number, h: number, top: string, bot: string) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
}

export function hasRefScene(id: string | undefined | null): boolean {
  return !!id && id in REF_SCENES;
}

export function hasWorldScene(id: string | undefined | null): boolean {
  return !!id && id in WORLD_SCENES;
}
