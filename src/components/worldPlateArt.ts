/* =============================================================
   worldPlateArt — 46 dünyanın GÖRSEL YASASI, plaka boyutunda.
   Kapak webp'i yokken her dünya aynı deniz-günbatımına düşüyordu
   (plateArt.ts tek motif). Burada her dünyanın plakası o dünyanın
   KENDİ verisinden türer: palette_lock dörtlüsü renk, render_law /
   line_grammar / light_law kompozisyon yasası olur. Whiteboard
   BEYAZDIR, noir jaluzi bandıdır, ukiyo-e düz baskı alanıdır —
   deniz yok, güneş yolu yok, ortak motif yok.

   Kurallar:
   - Deterministik: aynı worldId → aynı plaka (yalnız mulberry32; rastgelelik kaynak-kilitle yasak).
   - Ham hex sadece bu UI katmanında yaşar; prompt yoluna hiçbir şey yazılmaz.
   - Painter'lar SAF: ctx + boyut + renk + seed alır, DOM'a dokunmaz —
     test kayıt-ctx'iyle koşar, 3D katman CanvasTexture ile sarabilir.
   ============================================================= */

import { DATA } from '../core/pure';

type Ctx = CanvasRenderingContext2D;
export type PlateColors = readonly [string, string, string, string]; // [shadow, mid, accent, highlight]
export type WorldPainter = (x: Ctx, w: number, h: number, c: PlateColors, seed: number) => void;

/* ---------- deterministik çekirdek ---------- */
function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** FNV-1a — worldId → kompozisyon tohumu. */
export function worldSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/* ---------- renk ---------- */
function rgbOf(hex: string): [number, number, number] {
  const p = hex.replace('#', '');
  return [parseInt(p.slice(0, 2), 16), parseInt(p.slice(2, 4), 16), parseInt(p.slice(4, 6), 16)];
}
export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = rgbOf(a), [br, bg, bb] = rgbOf(b);
  const f = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${f(ar + (br - ar) * t)}${f(ag + (bg - ag) * t)}${f(ab + (bb - ab) * t)}`;
}
function rgba(hex: string, a: number): string {
  const [r, g, b] = rgbOf(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/* ---------- primitifler (paylaşılan fırçalar) ---------- */
function fillAll(x: Ctx, w: number, h: number, color: string): void {
  x.fillStyle = color; x.fillRect(0, 0, w, h);
}
function vgrad(x: Ctx, w: number, y0: number, y1: number, stops: Array<[number, string]>): void {
  const g = x.createLinearGradient(0, y0, 0, y1);
  for (const [t, cc] of stops) g.addColorStop(t, cc);
  x.fillStyle = g; x.fillRect(0, y0, w, y1 - y0);
}
function glow(x: Ctx, cx: number, cy: number, r: number, color: string, a: number): void {
  const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, rgba(color, a)); g.addColorStop(1, rgba(color, 0));
  x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2);
}
/** Toz / grain / kar — bölgeye deterministik benek serpme. */
function speck(x: Ctx, R: () => number, x0: number, y0: number, x1: number, y1: number,
  n: number, color: string, aMin: number, aMax: number, sMin: number, sMax: number): void {
  for (let i = 0; i < n; i++) {
    const px = x0 + R() * (x1 - x0), py = y0 + R() * (y1 - y0);
    x.fillStyle = rgba(color, aMin + R() * (aMax - aMin));
    const s = sMin + R() * (sMax - sMin);
    x.fillRect(px, py, s, s);
  }
}
function vign(x: Ctx, w: number, h: number, color: string, a: number): void {
  const g = x.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, rgba(color, a));
  x.fillStyle = g; x.fillRect(0, 0, w, h);
}
/** Paralel bant ailesi — jaluzi, ışık şaftı, tarama. */
function bands(x: Ctx, w: number, h: number, angle: number, gap: number, duty: number,
  color: string, a: number, phase = 0): void {
  x.save(); x.translate(w / 2, h / 2); x.rotate(angle);
  const L = Math.hypot(w, h);
  x.fillStyle = color; x.globalAlpha = a;
  for (let p = -L / 2 + phase; p < L / 2; p += gap) x.fillRect(-L / 2, p, L, Math.max(0.5, gap * duty));
  x.globalAlpha = 1; x.restore();
}
function poly(x: Ctx, pts: Array<[number, number]>): void {
  x.beginPath(); x.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
  x.closePath();
}
/** Düzensiz konturlu yumru — kil, sulu boya, el kesimi. */
function blob(x: Ctx, R: () => number, cx: number, cy: number, r: number, wob: number, squash = 0.85, points = 12): void {
  const radii = Array.from({ length: points }, () => r * (1 + (R() - 0.5) * wob));
  x.beginPath();
  for (let i = 0; i <= points; i++) {
    const a = (i % points) / points * Math.PI * 2;
    const rr = radii[i % points];
    const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr * squash;
    if (i === 0) x.moveTo(px, py); else x.lineTo(px, py);
  }
  x.closePath();
}
function halftone(x: Ctx, x0: number, y0: number, x1: number, y1: number, cell: number,
  color: string, sizeFn: (u: number, v: number) => number): void {
  x.fillStyle = color;
  for (let yy = y0; yy < y1; yy += cell) for (let xx = x0; xx < x1; xx += cell) {
    const r = cell * 0.5 * sizeFn((xx - x0) / Math.max(1, x1 - x0), (yy - y0) / Math.max(1, y1 - y0));
    if (r < 0.3) continue;
    x.beginPath(); x.arc(xx + cell / 2, yy + cell / 2, r, 0, Math.PI * 2); x.fill();
  }
}
/** Basınç-değişken el çizgisi (whiteboard/ghibli/ukiyo-e): hafif titrek polyline. */
function handStroke(x: Ctx, R: () => number, pts: Array<[number, number]>, width: number, color: string, a = 1, wob = 1): void {
  x.strokeStyle = rgba(color, a); x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = width;
  x.beginPath();
  x.moveTo(pts[0][0] + (R() - 0.5) * wob, pts[0][1] + (R() - 0.5) * wob);
  for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0] + (R() - 0.5) * wob, pts[i][1] + (R() - 0.5) * wob);
  x.stroke();
}

/* =============================================================
   46 PAINTER — her biri dünyasının render_law'ından tek cümle.
   ============================================================= */

/* — ANIMATION_EDU — */

// Pixar: çizgisiz 3D form — tek motive key, SSS sıcaklığı, yumuşak kontak gölge.
const pixar_3d_edu: WorldPainter = (x, w, h, [S, M, A, H]) => {
  vgrad(x, w, 0, h, [[0, mix(S, M, 0.25)], [0.7, mix(S, M, 0.5)], [1, mix(S, M, 0.35)]]);
  vgrad(x, w, h * 0.72, h, [[0, 'rgba(0,0,0,0)'], [1, rgba(S, 0.5)]]); // zemin düşüşü
  const cx = w * 0.38, cy = h * 0.52, r = h * 0.3;
  // kontak gölge — yumuşak elips
  x.save(); x.translate(cx, h * 0.84); x.scale(1.7, 0.42); glow(x, 0, 0, r * 0.9, S, 0.55); x.restore();
  // küre: H key sol-üst → M gövde → S terminatör, gölge tarafında serin sıçrama
  const g = x.createRadialGradient(cx - r * 0.45, cy - r * 0.5, r * 0.12, cx, cy, r * 1.12);
  g.addColorStop(0, mix(H, M, 0.15)); g.addColorStop(0.45, M);
  g.addColorStop(0.8, mix(M, S, 0.72)); g.addColorStop(1, mix(S, A, 0.18));
  x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
  glow(x, cx - r * 0.5, cy - r * 0.55, r * 0.5, H, 0.5);          // spec bloom
  glow(x, cx + r * 0.75, cy + r * 0.35, r * 0.45, A, 0.22);       // sıcak bounce
  glow(x, w * 0.82, h * 0.2, h * 0.42, H, 0.1);                   // pencere iması
};

// Paper craft: kesik kartondan katmanlar — die-cut kenar, kat gölgesi, lif benekleri.
const paper_craft_popup: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  fillAll(x, w, h, mix(H, M, 0.25));
  const layers = [mix(M, H, 0.45), mix(A, M, 0.35), mix(M, S, 0.3), mix(S, M, 0.25)];
  layers.forEach((tone, i) => {
    const base = h * (0.34 + i * 0.17);
    // kat gölgesi — kartonun altına düşen yumuşak bant
    x.fillStyle = rgba(S, 0.28); x.beginPath();
    x.moveTo(0, base + 3);
    for (let px = 0; px <= w; px += w / 14) x.lineTo(px, base + 3 + Math.sin(px / w * Math.PI * (2 + i)) * h * 0.05 + (R() - 0.5) * 2);
    x.lineTo(w, h); x.lineTo(0, h); x.closePath(); x.fill();
    // kartonun kendisi — keskin kesim kenarı
    x.fillStyle = tone; x.beginPath();
    x.moveTo(0, base);
    for (let px = 0; px <= w; px += w / 14) x.lineTo(px, base + Math.sin(px / w * Math.PI * (2 + i)) * h * 0.05 + (R() - 0.5) * 2);
    x.lineTo(w, h); x.lineTo(0, h); x.closePath(); x.fill();
    speck(x, R, 0, base, w, Math.min(h, base + h * 0.15), 26, S, 0.05, 0.14, 0.7, 1.6); // kağıt lifi
  });
  vgrad(x, w, 0, h, [[0, rgba(H, 0.14)], [0.5, 'rgba(0,0,0,0)'], [1, rgba(S, 0.12)]]); // eğik tungsten key
};

// Kurzgesagt: düz lacivert alan, flat izometrik şekiller, TEK amber kavrayış ışıması.
const kurzgesagt_edu: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  fillAll(x, w, h, S);
  speck(x, R, 0, 0, w, h, 24, H, 0.25, 0.7, 0.8, 1.4); // düz yıldız noktaları — glow YOK
  // gezegen: düz dolgu + 1px koyu kontur (gradyan yasak)
  const cx = w * 0.3, cy = h * 0.48, r = h * 0.26;
  x.fillStyle = M; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
  x.strokeStyle = mix(M, S, 0.55); x.lineWidth = 1.5; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.stroke();
  x.fillStyle = mix(M, S, 0.35); x.beginPath(); x.arc(cx - r * 0.3, cy - r * 0.15, r * 0.62, 0, Math.PI * 2); x.fill(); // flat gece yarısı
  // halka — düz çizgi elips
  x.save(); x.translate(cx, cy); x.rotate(-0.3); x.scale(1, 0.32);
  x.strokeStyle = mix(M, H, 0.4); x.lineWidth = 2; x.beginPath(); x.arc(0, 0, r * 1.55, 0, Math.PI * 2); x.stroke(); x.restore();
  // tek amber insight düğümü — beat'in ışıması
  const ax = w * 0.72, ay = h * 0.4;
  glow(x, ax, ay, h * 0.3, A, 0.35);
  x.fillStyle = A; x.beginPath(); x.arc(ax, ay, h * 0.07, 0, Math.PI * 2); x.fill();
  x.strokeStyle = mix(A, S, 0.5); x.lineWidth = 1.5; x.beginPath(); x.arc(ax, ay, h * 0.07, 0, Math.PI * 2); x.stroke();
};

// Whiteboard: BEYAZ tahta — grafit vuruş, tek tuğla-kırmızısı marker yıkaması, kuru silgi izi.
const whiteboard_explainer: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  fillAll(x, w, h, mix(H, M, 0.18));
  bands(x, w, h, -0.32, h * 0.55, 0.62, mix(M, S, 0.12), 0.16); // kuru silgi süpürme izleri
  bands(x, w, h, -0.32, h * 0.34, 0.4, H, 0.35, h * 0.2);
  const ink = mix(S, '#1a1a1a', 0.72);
  // ana düğüm: marker yıkaması ÖNCE (tek accent), üstüne el çizimi daire
  x.fillStyle = rgba(A, 0.32); x.fillRect(w * 0.12, h * 0.24, w * 0.2, h * 0.4);
  const cx = w * 0.22, cy = h * 0.44, r = h * 0.24;
  for (let i = 0; i <= 24; i++) {
    const a0 = i / 24 * Math.PI * 2.12; // ucu hafif taşan el dairesi
    const px = cx + Math.cos(a0) * r * (1 + (R() - 0.5) * 0.1);
    const py = cy + Math.sin(a0) * r * 0.9 * (1 + (R() - 0.5) * 0.1);
    if (i === 0) { x.beginPath(); x.moveTo(px, py); } else x.lineTo(px, py);
  }
  x.strokeStyle = ink; x.lineWidth = 2.2; x.lineCap = 'round'; x.stroke();
  // ok: gövde + iki kanat, basınçla incelen
  handStroke(x, R, [[w * 0.36, h * 0.44], [w * 0.56, h * 0.4]], 2.4, ink, 0.9, 1.6);
  handStroke(x, R, [[w * 0.53, h * 0.32], [w * 0.565, h * 0.4], [w * 0.51, h * 0.47]], 2, ink, 0.9, 1.2);
  // hedef kutu + altını çizme
  handStroke(x, R, [[w * 0.6, h * 0.28], [w * 0.82, h * 0.27], [w * 0.83, h * 0.52], [w * 0.61, h * 0.53], [w * 0.6, h * 0.28]], 2, ink, 0.85, 1.8);
  handStroke(x, R, [[w * 0.63, h * 0.62], [w * 0.8, h * 0.6]], 2.8, ink, 0.7, 1.4);
};

// Claymation: gerçek kil yumruları — parmak izi çukuru, yumuşak stüdyo key'i.
const claymation_aardman: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  vgrad(x, w, 0, h, [[0, mix(H, M, 0.35)], [0.65, mix(M, H, 0.42)], [1, mix(M, S, 0.3)]]);
  const spots: Array<[number, number, number, string]> = [
    [w * 0.28, h * 0.62, h * 0.24, M],
    [w * 0.52, h * 0.68, h * 0.19, A],
    [w * 0.72, h * 0.6, h * 0.26, mix(S, M, 0.45)],
  ];
  for (const [cx, cy, r, tone] of spots) {
    x.save(); x.translate(cx, cy + r * 0.72); x.scale(1.5, 0.4); glow(x, 0, 0, r, S, 0.4); x.restore();
    blob(x, R, cx, cy, r, 0.22, 0.92, 11);
    x.fillStyle = tone; x.fill();
    // parmak izi çukurları
    for (let i = 0; i < 3; i++) {
      x.save(); x.translate(cx + (R() - 0.5) * r, cy + (R() - 0.5) * r * 0.6); x.scale(1.4, 0.8);
      x.fillStyle = rgba(S, 0.2); x.beginPath(); x.arc(0, 0, r * (0.1 + R() * 0.08), 0, Math.PI * 2); x.fill(); x.restore();
    }
    glow(x, cx - r * 0.4, cy - r * 0.5, r * 0.55, H, 0.4); // yumuşak key parlaması
  }
  // stüdyo kilinin imzası: orta yumrunun tepesine basılmış BİR ÇİFT göz küresi
  // (jenerik kil-göz; karakter değil) — Laika artık gece seti konuşuyor, kil burada
  const [ecx, ecy, er] = [spots[1][0], spots[1][1] - spots[1][2] * 0.72, spots[1][2] * 0.3];
  for (const side of [-1, 1] as const) {
    const ex = ecx + side * er * 0.85;
    x.fillStyle = mix(H, '#ffffff', 0.6); x.beginPath(); x.arc(ex, ecy, er * 0.7, 0, Math.PI * 2); x.fill();
    x.strokeStyle = rgba(S, 0.35); x.lineWidth = 1; x.stroke();
    x.fillStyle = mix(S, '#000000', 0.5); x.beginPath(); x.arc(ex + er * 0.16, ecy + er * 0.1, er * 0.22, 0, Math.PI * 2); x.fill();
  }
};

// Science viz: siyah zemin — alttan geçen ışık yarı saydam zarları içeriden yakar, jilet ince odak.
const science_viz_real: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  fillAll(x, w, h, S);
  vgrad(x, w, h * 0.55, h, [[0, 'rgba(0,0,0,0)'], [1, rgba(mix(A, M, 0.5), 0.16)]]); // transmitted alt ışık
  x.globalCompositeOperation = 'screen';
  for (let i = 0; i < 6; i++) {
    const cx = w * (0.18 + R() * 0.64), cy = h * (0.3 + R() * 0.4), r = h * (0.14 + R() * 0.2);
    const focus = Math.abs(cy - h * 0.5) < h * 0.12; // odak düzlemi: orta bant keskin
    x.save(); x.translate(cx, cy); x.rotate((R() - 0.5) * 0.8); x.scale(1.6, 1);
    x.fillStyle = rgba(mix(A, H, 0.25), focus ? 0.2 : 0.09);
    x.beginPath(); x.arc(0, 0, r, 0, Math.PI * 2); x.fill();
    if (focus) { x.strokeStyle = rgba(A, 0.55); x.lineWidth = 1.2; x.beginPath(); x.arc(0, 0, r, 0, Math.PI * 2); x.stroke(); }
    x.restore();
    // yoğun çekirdek ışığı BLOKLAR — içi dışından koyu
    x.globalCompositeOperation = 'source-over';
    x.fillStyle = rgba(S, focus ? 0.5 : 0.3);
    x.save(); x.translate(cx, cy); x.scale(1.6, 1); x.beginPath(); x.arc(0, 0, r * 0.4, 0, Math.PI * 2); x.fill(); x.restore();
    x.globalCompositeOperation = 'screen';
  }
  x.globalCompositeOperation = 'source-over';
  speck(x, R, 0, h * 0.35, w, h * 0.65, 14, H, 0.3, 0.7, 0.6, 1.1);
};

// Technical cutaway: makine kesiti — kesik düzlem amber, 45° tarama, eş merkezli delik, patlatma ekseni.
const technical_cutaway: WorldPainter = (x, w, h, [S, M, A, H]) => {
  vgrad(x, w, 0, h, [[0, mix(S, M, 0.3)], [1, mix(S, M, 0.14)]]);
  const cy = h * 0.52;
  // patlatma ekseni — kesikli merkez çizgisi
  x.strokeStyle = rgba(H, 0.4); x.lineWidth = 1; x.setLineDash([6, 4]);
  x.beginPath(); x.moveTo(w * 0.06, cy); x.lineTo(w * 0.94, cy); x.stroke(); x.setLineDash([]);
  // gövde: soldan silindir (yandan), metal gradyanı
  const bx = w * 0.14, bw2 = w * 0.34, by = cy - h * 0.2;
  const g = x.createLinearGradient(0, by, 0, by + h * 0.4);
  g.addColorStop(0, mix(M, H, 0.35)); g.addColorStop(0.35, M); g.addColorStop(1, mix(M, S, 0.55));
  x.fillStyle = g; x.fillRect(bx, by, bw2, h * 0.4);
  x.strokeStyle = mix(S, M, 0.2); x.lineWidth = 1; x.strokeRect(bx, by, bw2, h * 0.4);
  // kesik yüzey: sağa AYRILMIŞ parça — amber düzlem + 45° hatch + delik çemberleri
  const fx = w * 0.58, fr = h * 0.22;
  x.fillStyle = mix(A, M, 0.25); x.beginPath(); x.arc(fx, cy, fr, 0, Math.PI * 2); x.fill();
  x.save(); x.beginPath(); x.arc(fx, cy, fr, 0, Math.PI * 2); x.clip();
  bands(x, w, h, Math.PI / 4, 5, 0.28, mix(A, S, 0.55), 0.6);
  x.restore();
  x.strokeStyle = mix(S, M, 0.25); x.lineWidth = 1.4;
  for (const rr of [fr, fr * 0.62, fr * 0.3]) { x.beginPath(); x.arc(fx, cy, rr, 0, Math.PI * 2); x.stroke(); }
  x.fillStyle = mix(S, M, 0.12); x.beginPath(); x.arc(fx, cy, fr * 0.18, 0, Math.PI * 2); x.fill(); // delik gölgesi
  bands(x, w, h, -0.9, h * 0.8, 0.3, H, 0.05); // yön verilmiş sheen
  glow(x, w * 0.84, cy, h * 0.16, H, 0.14); // ayrık civata parça iması
  x.fillStyle = mix(M, H, 0.25); x.fillRect(w * 0.82, cy - h * 0.05, w * 0.07, h * 0.1);
};

/* — ANIMATION_PAINTERLY — */

// Ghibli: pastoral el boyaması — kümülüs kütlesi, adaçayı çayır, sıcak-kahve mürekkep ufku.
const ghibli_hayao: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  vgrad(x, w, 0, h * 0.62, [[0, mix(H, M, 0.3)], [1, mix(H, M, 0.12)]]); // krem-gök
  // kümülüs: üstü krem, alt yüzü sıcak gölgeli yumuşak kümeler
  const cloud = (cx: number, cy: number, r: number) => {
    for (let i = 0; i < 5; i++) {
      const dx = (i - 2) * r * 0.55, dr = r * (0.62 + Math.abs(2 - i) * -0.08 + R() * 0.1);
      x.fillStyle = rgba(mix(S, M, 0.55), 0.5); x.beginPath(); x.arc(cx + dx, cy + r * 0.22, dr, 0, Math.PI * 2); x.fill();
      x.fillStyle = H; x.beginPath(); x.arc(cx + dx, cy, dr, 0, Math.PI * 2); x.fill();
    }
  };
  cloud(w * 0.3, h * 0.26, h * 0.15); cloud(w * 0.74, h * 0.18, h * 0.1);
  // çayır: adaçayı bantları + koyu çalı dabları
  vgrad(x, w, h * 0.55, h, [[0, mix(M, H, 0.25)], [1, mix(M, S, 0.42)]]);
  for (let i = 0; i < 16; i++) {
    const px = R() * w, py = h * (0.66 + R() * 0.3), r = 2 + R() * 4;
    x.fillStyle = rgba(mix(M, S, 0.6), 0.5); x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fill();
  }
  handStroke(x, R, Array.from({ length: 9 }, (_, i) => [i / 8 * w, h * 0.56 + Math.sin(i * 1.2) * 2] as [number, number]), 2, mix(S, A, 0.25), 0.8, 1.4); // el mürekkebi ufuk
  x.fillStyle = A; x.fillRect(w * 0.63, h * 0.47, w * 0.05, h * 0.09); // terracotta çatı
  x.fillStyle = mix(A, S, 0.4); poly(x, [[w * 0.62, h * 0.47], [w * 0.655, h * 0.4], [w * 0.69, h * 0.47]]); x.fill();
};

// Ukiyo-e: düz baskı alanları — Prusya dalgası, oyma keyline, kırmızı mühür. Gradyan YOK.
const ukiyo_e_print: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  fillAll(x, w, h, M); // yaşlı kağıt
  speck(x, R, 0, 0, w, h, 60, mix(M, S, 0.4), 0.05, 0.13, 0.6, 1.4); // kağıt benekleri
  fillAll2(x, 0, h * 0.18, w, h * 0.1, mix(M, H, 0.5)); // düz gök bandı — baskı plakası
  // dalga: iki düz mavi plaka, kabarık scallop kontur
  const wave = (base: number, tone: string, amp: number) => {
    x.fillStyle = tone; x.beginPath(); x.moveTo(0, base);
    for (let px = 0; px <= w + 20; px += w / 9) {
      x.quadraticCurveTo(px + w / 18, base - amp - R() * 3, px + w / 9, base);
    }
    x.lineTo(w, h); x.lineTo(0, h); x.closePath(); x.fill();
  };
  wave(h * 0.58, mix(S, M, 0.22), h * 0.16);
  wave(h * 0.74, S, h * 0.13);
  // oyma hissiyatlı siyah keyline — dalga tepelerinde titrek el çizgisi
  handStroke(x, R, Array.from({ length: 19 }, (_, i) => {
    const px = i / 18 * w;
    return [px, h * 0.58 - Math.abs(Math.sin(px / w * Math.PI * 4.5)) * h * 0.14] as [number, number];
  }), 2.2, '#141414', 0.85, 1.8);
  // köpük parmakları — beyaz düz pençeler
  for (let i = 0; i < 7; i++) {
    const px = w * (0.08 + i * 0.14);
    x.fillStyle = H; x.beginPath(); x.arc(px, h * 0.56 - Math.abs(Math.sin(px / w * Math.PI * 4.5)) * h * 0.13, 2.4, 0, Math.PI * 2); x.fill();
  }
  x.fillStyle = A; x.fillRect(w * 0.88, h * 0.68, w * 0.07, h * 0.2); // madder mühür
  x.strokeStyle = H; x.lineWidth = 1; x.strokeRect(w * 0.895, h * 0.71, w * 0.04, h * 0.14);
};

// Watercolor: ıslak-üstüne-ıslak yıkamalar — tüylü kenar, granülasyon, arayan grafit çizgi.
const watercolor_storybook: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  fillAll(x, w, h, H); // sıcak kağıt
  const wash = (cx: number, cy: number, r: number, tone: string, aa: number) => {
    for (let i = 4; i >= 1; i--) { // katmanlı tüylü kenar
      blob(x, R, cx, cy, r * (0.6 + i * 0.14), 0.3, 0.8, 10);
      x.fillStyle = rgba(tone, aa / i); x.fill();
    }
    speck(x, R, cx - r, cy - r * 0.7, cx + r, cy + r * 0.7, 22, mix(tone, S, 0.4), 0.06, 0.16, 0.7, 1.5); // granülasyon
  };
  wash(w * 0.32, h * 0.42, h * 0.34, M, 0.4);
  wash(w * 0.62, h * 0.55, h * 0.28, A, 0.34);
  wash(w * 0.78, h * 0.3, h * 0.2, mix(M, S, 0.5), 0.3);
  // arayan grafit: aynı konturu 3 hafif vuruşla bulmaya çalış
  for (let i = 0; i < 3; i++) {
    handStroke(x, R, Array.from({ length: 7 }, (_, j) => {
      const a = -0.6 + j / 6 * 2.2;
      return [w * 0.32 + Math.cos(a) * h * 0.3, h * 0.42 + Math.sin(a) * h * 0.26] as [number, number];
    }), 0.9, mix(S, '#404040', 0.5), 0.35, 3);
  }
};

// Shinkai: iki bina silüeti arasında patlayan alçak güneş — streak, bloom, ıslak zemin dönüşü.
const shinkai_photoreal_anime: WorldPainter = (x, w, h, [S, M, A, H]) => {
  vgrad(x, w, 0, h * 0.7, [[0, mix(M, S, 0.35)], [0.55, M], [0.8, mix(A, M, 0.45)], [1, mix(A, H, 0.4)]]); // doymuş kobalt→amber gök
  const gapX = w * 0.56, gy = h * 0.52;
  // ıslak zemin: göğün aynası
  vgrad(x, w, h * 0.7, h, [[0, mix(A, S, 0.45)], [1, mix(S, M, 0.25)]]);
  // bina silüetleri — gökdelen dişleri, aralarında dar boşluk
  x.fillStyle = mix(S, '#000000', 0.25);
  poly(x, [[0, h * 0.7], [0, h * 0.2], [w * 0.18, h * 0.24], [w * 0.18, h * 0.38], [w * 0.34, h * 0.4], [w * 0.34, h * 0.28], [gapX - w * 0.05, h * 0.32], [gapX - w * 0.05, h * 0.7]]); x.fill();
  poly(x, [[gapX + w * 0.05, h * 0.7], [gapX + w * 0.05, h * 0.26], [w * 0.78, h * 0.22], [w * 0.78, h * 0.36], [w, h * 0.32], [w, h * 0.7]]); x.fill();
  // güneş: boşlukta patlayan streak + yıldız çapraz + bloom
  x.globalCompositeOperation = 'screen';
  glow(x, gapX, gy, h * 0.5, A, 0.55);
  glow(x, gapX, gy, h * 0.22, H, 0.85);
  x.fillStyle = rgba(H, 0.5); x.fillRect(gapX - w * 0.2, gy - 1, w * 0.4, 2); // yatay lens streak
  x.fillRect(gapX - 1, gy - h * 0.2, 2, h * 0.4);
  // ıslak yüzey dönüşü
  glow(x, gapX, h * 0.86, h * 0.28, A, 0.4);
  x.fillStyle = rgba(H, 0.3); x.fillRect(gapX - w * 0.03, h * 0.72, w * 0.06, h * 0.26);
  x.globalCompositeOperation = 'source-over';
};

// Arcane: fırça vuruşunun KENDİSİ kontur — vuruşlar KISA ve YAMA halinde form kurar
// (eski uzun ince paraleller yağmur çizgisi okunuyordu), magenta rim, cel çizgisi yok.
const arcane_fortiche: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  fillAll(x, w, h, S);
  /** boyalı düzlem: şekli doldur, İÇİNE kırpıp dokuyu fırçala — vuruş formun yüzeyidir,
   *  boşlukta uçuşan çizgi değil (küt-vuruş serpme dijital glitch okunuyordu, denendi) */
  const plane = (pts: Array<[number, number]>, base: string, ang: number, n: number) => {
    poly(x, pts); x.fillStyle = base; x.fill();
    x.save(); poly(x, pts); x.clip();
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const dx = Math.cos(ang), dy = Math.sin(ang);
    for (let i = 0; i < n; i++) {
      const sx = x0 + R() * (x1 - x0), sy = y0 + R() * (y1 - y0);
      const len = w * (0.08 + R() * 0.09);
      const tone = R() < 0.24 ? mix(base, H, 0.18 + R() * 0.14) : mix(base, R() < 0.5 ? S : M, R() * 0.35);
      x.strokeStyle = rgba(tone, 0.34 + R() * 0.3);
      x.lineWidth = 8 + R() * 11; x.lineCap = 'round';
      x.beginPath(); x.moveTo(sx, sy);
      x.quadraticCurveTo(sx + dx * len * 0.5 + (R() - 0.5) * 6, sy + dy * len * 0.5 + (R() - 0.5) * 6, sx + dx * len, sy + dy * len);
      x.stroke();
    }
    x.restore();
  };
  // ışıklı duvar düzlemi (sol-üst, hafif eğik) — vuruş yönü düzlemi takip eder
  plane([[0, 0], [w * 0.72, 0], [w * 0.56, h * 0.62], [0, h * 0.5]], mix(M, S, 0.25), -0.1, 30);
  // gölge düzlemi (sağ) — daha koyu, dikeye yakın vuruş
  plane([[w * 0.56, 0], [w, 0], [w, h], [w * 0.44, h]], mix(S, M, 0.28), 1.35, 22);
  // zemin bandı — yatay, en koyu
  plane([[0, h * 0.5], [w * 0.6, h * 0.6], [w, h * 0.82], [w, h], [0, h]], mix(S, '#000000', 0.18), 0.12, 16);
  // koyu büst silüeti sağ-altta — boyalı kenar, çizgisiz
  blob(x, R, w * 0.72, h * 0.82, h * 0.36, 0.14, 1.05, 10);
  x.fillStyle = mix(S, '#000000', 0.4); x.fill();
  // magenta rim — silüetin tek aydınlık kenarı; ışığı duvara da fırçayla sıçrar
  x.strokeStyle = rgba(A, 0.9); x.lineWidth = 3.5; x.lineCap = 'round';
  x.beginPath(); x.arc(w * 0.72, h * 0.82, h * 0.36, Math.PI * 1.12, Math.PI * 1.6); x.stroke();
  glow(x, w * 0.6, h * 0.48, h * 0.28, A, 0.28);
  for (let i = 0; i < 3; i++) { // rim sıçraması: üç magenta vuruş
    const sx = w * (0.52 + R() * 0.1), sy = h * (0.36 + R() * 0.12);
    x.strokeStyle = rgba(mix(A, H, 0.2), 0.4 + R() * 0.2); x.lineWidth = 4 + R() * 4;
    x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + w * 0.05, sy - h * 0.05); x.stroke();
  }
  glow(x, w * 0.18, h * 0.22, h * 0.32, mix(M, H, 0.3), 0.2); // soğuk pencere sıçraması
  vign(x, w, h, '#000000', 0.4);
};

/* — ANIMATION_STYLIZED / CEL / DARK — */

// Spider-Verse: halftone + CMY mis-registration + kalın mürekkep diyagonali.
const spiderverse_sony: WorldPainter = (x, w, h, [S, M, A, H]) => {
  fillAll(x, w, h, S);
  halftone(x, 0, 0, w * 0.6, h, 7, rgba(M, 0.75), (u, v) => Math.max(0, 0.9 - u * 1.1 - v * 0.25));
  // mis-registration üçlüsü: aynı blok üç plakada kaymış
  const bx = w * 0.62, by = h * 0.2, bw2 = w * 0.2, bh = h * 0.42;
  x.fillStyle = rgba(A, 0.6); x.fillRect(bx - 3, by + 2, bw2, bh);
  x.fillStyle = rgba(H, 0.6); x.fillRect(bx + 3, by - 2, bw2, bh);
  x.fillStyle = M; x.fillRect(bx, by, bw2, bh);
  // kalın fırça-mürekkep diyagonal — gölge tarafında kalınlaşan
  x.strokeStyle = '#0a0a0a'; x.lineCap = 'round';
  x.lineWidth = 7; x.beginPath(); x.moveTo(w * 0.06, h * 0.88); x.lineTo(w * 0.5, h * 0.3); x.stroke();
  x.lineWidth = 3.5; x.beginPath(); x.moveTo(w * 0.5, h * 0.3); x.lineTo(w * 0.72, h * 0.1); x.stroke();
  // aksiyon kırpması: köşe hız çizgileri
  for (let i = 0; i < 5; i++) {
    x.strokeStyle = rgba(H, 0.5); x.lineWidth = 1.4;
    x.beginPath(); x.moveTo(w * (0.82 + i * 0.03), h * 0.9); x.lineTo(w * (0.9 + i * 0.03), h * 0.62); x.stroke();
  }
};

// JJK: 1.5 stop altta pozlanmış kare — görünmeyen formu tarif eden TEK lanet-teal rim.
const jjk_mappa: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  vgrad(x, w, 0, h, [[0, mix(S, '#000000', 0.4)], [0.6, S], [1, mix(S, M, 0.16)]]);
  glow(x, w * 0.5, h * 0.65, h * 0.5, M, 0.1); // zar zor okunan gri orta ton
  // lanet-teal crescent rim — kadrajdaki tek doygun olay
  x.strokeStyle = rgba(A, 0.9); x.lineWidth = 2.5; x.lineCap = 'round';
  x.beginPath(); x.arc(w * 0.58, h * 0.72, h * 0.42, Math.PI * 1.08, Math.PI * 1.55); x.stroke();
  x.strokeStyle = rgba(A, 0.35); x.lineWidth = 6;
  x.beginPath(); x.arc(w * 0.58, h * 0.72, h * 0.42, Math.PI * 1.12, Math.PI * 1.5); x.stroke();
  glow(x, w * 0.36, h * 0.32, h * 0.12, H, 0.2); // uzak sıcak pencere kırıntısı
  speck(x, R, 0, 0, w, h, 40, '#000000', 0.1, 0.25, 0.8, 1.6); // ağır grain
  vign(x, w, h, '#000000', 0.5);
};

// Ufotable: üç katman — slate fon, keskin cel silüet (2px çizgi), köz partikülü + god-ray.
const demon_slayer_ufotable: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  vgrad(x, w, 0, h, [[0, mix(S, M, 0.4)], [1, S]]); // Katman 2: derinlik fonu
  bands(x, w, h, 0.62, h * 0.5, 0.16, H, 0.1, h * 0.12); // volumetrik şaft
  // Katman 1: cel silüet — düz dolgu + 2px uniform çizgi
  const ridge: Array<[number, number]> = [[0, h * 0.98], [0, h * 0.62], [w * 0.2, h * 0.55], [w * 0.34, h * 0.66], [w * 0.52, h * 0.5], [w * 0.7, h * 0.64], [w * 0.88, h * 0.58], [w, h * 0.66], [w, h * 0.98]];
  poly(x, ridge); x.fillStyle = mix(S, M, 0.22); x.fill();
  x.strokeStyle = '#0d0d0d'; x.lineWidth = 2; x.lineJoin = 'round';
  x.beginPath(); x.moveTo(ridge[1][0], ridge[1][1]);
  for (let i = 2; i < ridge.length - 1; i++) x.lineTo(ridge[i][0], ridge[i][1]); x.stroke();
  // Katman 3: efekt — yükselen köz + ateş-amber ışıma
  glow(x, w * 0.3, h * 0.72, h * 0.3, A, 0.4);
  for (let i = 0; i < 12; i++) {
    const px = w * (0.2 + R() * 0.3), py = h * (0.2 + R() * 0.55);
    glow(x, px, py, 2.5 + R() * 3, A, 0.5 + R() * 0.4);
  }
  speck(x, R, 0, 0, w, h * 0.6, 18, H, 0.1, 0.3, 0.6, 1.2); // partikül atmosfer
};

// One Piece: poster-primary cel — kalın SİYAH konturlu kümülüs ve dalga, kırmızı flama.
const one_piece_toei: WorldPainter = (x, w, h, [S, M, A, H]) => {
  fillAll(x, w, h, mix(H, M, 0.3)); // krem-altın gök, DÜZ
  // dev kümülüs: düz beyaz + 4px siyah kontur (deklarasyon çizgisi)
  const puffs: Array<[number, number, number]> = [[w * 0.3, h * 0.3, h * 0.17], [w * 0.42, h * 0.24, h * 0.2], [w * 0.55, h * 0.3, h * 0.16], [w * 0.42, h * 0.36, h * 0.18]];
  x.fillStyle = H; x.strokeStyle = '#000000'; x.lineWidth = 4;
  for (const [cx, cy, r] of puffs) { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); x.stroke(); }
  x.fillStyle = H; for (const [cx, cy, r] of puffs) { x.beginPath(); x.arc(cx, cy, r * 0.96, 0, Math.PI * 2); x.fill(); } // kontur içini temizle
  // alçak ufuk (%25): derin marine deniz, cel iki değer
  const sea = h * 0.72;
  x.fillStyle = S; x.fillRect(0, sea, w, h - sea);
  x.fillStyle = mix(S, M, 0.3);
  x.beginPath(); x.moveTo(0, sea);
  for (let px = 0; px <= w; px += w / 8) x.quadraticCurveTo(px + w / 16, sea - h * 0.05, px + w / 8, sea);
  x.lineTo(w, sea + h * 0.08); x.lineTo(0, sea + h * 0.08); x.closePath(); x.fill();
  x.strokeStyle = '#000000'; x.lineWidth = 3.5; // dalga scallop konturu
  x.beginPath(); x.moveTo(0, sea);
  for (let px = 0; px <= w; px += w / 8) x.quadraticCurveTo(px + w / 16, sea - h * 0.05, px + w / 8, sea);
  x.stroke();
  // direk + kırmızı flama
  x.strokeStyle = '#000000'; x.lineWidth = 3;
  x.beginPath(); x.moveTo(w * 0.78, sea); x.lineTo(w * 0.78, h * 0.14); x.stroke();
  x.fillStyle = A; poly(x, [[w * 0.78, h * 0.14], [w * 0.94, h * 0.2], [w * 0.78, h * 0.27]]); x.fill();
  x.strokeStyle = '#000000'; x.lineWidth = 2.5; poly(x, [[w * 0.78, h * 0.14], [w * 0.94, h * 0.2], [w * 0.78, h * 0.27]]); x.stroke();
};

// Naruto: orman yeşili ambient + kanopi arasından altın şaftlar + tozlu hava, kalın cel sırt.
const naruto_shinobi_world: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  vgrad(x, w, 0, h, [[0, mix(S, M, 0.25)], [0.6, mix(S, M, 0.5)], [1, S]]);
  bands(x, w, h, 0.5, h * 0.34, 0.22, A, 0.22, h * 0.08); // kanopi altın şaftları
  bands(x, w, h, 0.5, h * 0.55, 0.12, H, 0.16, h * 0.3);
  glow(x, w * 0.32, h * 0.3, h * 0.34, mix(A, H, 0.4), 0.3); // determinasyon sıcaklığı
  speck(x, R, w * 0.1, h * 0.15, w * 0.6, h * 0.75, 26, H, 0.15, 0.45, 0.7, 1.6); // şaftta toz
  // ağaç hattı: düz cel + kalın siyah kontur
  const line: Array<[number, number]> = [[0, h], [0, h * 0.7], [w * 0.16, h * 0.74], [w * 0.3, h * 0.62], [w * 0.48, h * 0.72], [w * 0.66, h * 0.6], [w * 0.84, h * 0.72], [w, h * 0.66], [w, h]];
  poly(x, line); x.fillStyle = mix(S, M, 0.32); x.fill();
  x.strokeStyle = '#000000'; x.lineWidth = 3; x.lineJoin = 'round';
  x.beginPath(); x.moveTo(line[1][0], line[1][1]);
  for (let i = 2; i < line.length - 1; i++) x.lineTo(line[i][0], line[i][1]); x.stroke();
};

// AOT: kadrajın %75'i DUVAR — taş sıraları, hava izleri, ölçek için tek insan beneği.
const aot_wall_world: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  fillAll(x, w, h, mix(H, M, 0.55)); // kapalı gri gök şeridi
  const top = h * 0.24;
  vgrad(x, w, top, h, [[0, mix(M, H, 0.2)], [0.5, M], [1, mix(M, S, 0.45)]]); // duvar gövdesi
  // taş sıraları — yatay derzler + şaşırtmalı dikey derzler
  x.strokeStyle = rgba(S, 0.4); x.lineWidth = 1;
  const rows = 7;
  for (let i = 1; i <= rows; i++) {
    const y = top + (h - top) * (i / rows);
    x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke();
    for (let j = 0; j < 6; j++) {
      const px = ((j + (i % 2) * 0.5) / 6) * w + R() * 4;
      x.beginPath(); x.moveTo(px, y - (h - top) / rows); x.lineTo(px, y); x.stroke();
    }
  }
  // hava/yosun akıntıları — dikey soluk lekeler
  for (let i = 0; i < 8; i++) {
    const px = R() * w;
    x.fillStyle = rgba(S, 0.06 + R() * 0.1);
    x.fillRect(px, top, 2 + R() * 5, (h - top) * (0.3 + R() * 0.6));
  }
  x.fillStyle = rgba(A, 0.8); // tek boğuk sinyal fişeği
  x.beginPath(); x.arc(w * 0.8, h * 0.1, 2.2, 0, Math.PI * 2); x.fill();
  x.strokeStyle = rgba(A, 0.4); x.lineWidth = 1.2;
  x.beginPath(); x.moveTo(w * 0.8, h * 0.1); x.quadraticCurveTo(w * 0.76, h * 0.16, w * 0.75, h * 0.24); x.stroke();
  x.fillStyle = mix(S, '#000000', 0.4); x.fillRect(w * 0.32, h * 0.94, 2.4, h * 0.05); // insan = ölçek beneği
};

// Solo Leveling: mavi-siyah koridor perspektifi + cyan damar çatlakları + indigo aura rim.
const solo_leveling_gate: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  fillAll(x, w, h, S);
  const vx = w * 0.6, vy = h * 0.5; // kaçış noktası
  x.strokeStyle = rgba(M, 0.5); x.lineWidth = 1.2;
  for (const [ex, ey] of [[0, 0], [w, 0], [0, h], [w, h], [0, h * 0.5], [w, h * 0.35]] as Array<[number, number]>) {
    x.beginPath(); x.moveTo(ex, ey); x.lineTo(vx, vy); x.stroke();
  }
  glow(x, vx, vy, h * 0.3, M, 0.3); // koridor sonu loş
  // cyan damar çatlakları — jagged polyline + glow
  for (let i = 0; i < 3; i++) {
    const pts: Array<[number, number]> = [];
    let px = w * (0.12 + i * 0.28), py = h * 0.95;
    for (let s = 0; s < 6; s++) { pts.push([px, py]); px += (R() - 0.4) * w * 0.06; py -= h * (0.1 + R() * 0.08); }
    x.strokeStyle = rgba(H, 0.7); x.lineWidth = 1.6; x.lineJoin = 'round';
    x.beginPath(); x.moveTo(pts[0][0], pts[0][1]);
    for (const [qx, qy] of pts) x.lineTo(qx, qy); x.stroke();
    glow(x, pts[3][0], pts[3][1], h * 0.12, mix(A, H, 0.4), 0.35);
  }
  // elektrik-indigo aura rim — yükseliş yayı
  x.strokeStyle = rgba(A, 0.9); x.lineWidth = 3; x.lineCap = 'round';
  x.beginPath(); x.arc(w * 0.38, h * 1.05, h * 0.5, Math.PI * 1.2, Math.PI * 1.75); x.stroke();
  glow(x, w * 0.3, h * 0.62, h * 0.26, A, 0.4);
  vign(x, w, h, '#000000', 0.45);
};

// Bleach: aşırı 2-değer — beyaz taş alan vs mürekkep-siyah diyagonal kütle, tek amber fener.
const bleach_soul_world: WorldPainter = (x, w, h, [S, M, A, H]) => {
  fillAll(x, w, h, mix(H, M, 0.12)); // yanık-beyaz taş avlu
  poly(x, [[w * 0.4, 0], [w, 0], [w, h], [w * 0.18, h]]); // mürekkep kütle
  x.fillStyle = mix(S, '#000000', 0.3); x.fill();
  // minimal TEK orta ton adımı — sınırda ince sıcak-nötr bant
  poly(x, [[w * 0.4, 0], [w * 0.44, 0], [w * 0.22, h], [w * 0.18, h]]);
  x.fillStyle = M; x.fill();
  // beyaz alanda keskin mimari gölge dişleri
  x.fillStyle = mix(S, '#000000', 0.3);
  poly(x, [[0, h * 0.7], [w * 0.12, h * 0.7], [w * 0.12, h * 0.78], [w * 0.2, h * 0.78], [w * 0.2, h]]);
  x.lineTo(0, h); x.closePath(); x.fill();
  // tek sıcak ruh-amber fener — siyah kütlenin içinde
  glow(x, w * 0.68, h * 0.4, h * 0.2, A, 0.55);
  x.fillStyle = mix(A, H, 0.4); x.beginPath(); x.arc(w * 0.68, h * 0.4, 3, 0, Math.PI * 2); x.fill();
};

// Cyberpunk neon noir: ezilmiş mavi-siyah + ıslak asfaltta akan magenta/cyan tabela yansımaları.
const cyberpunk_neon_noir: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  vgrad(x, w, 0, h, [[0, mix(S, '#000000', 0.3)], [0.5, S], [1, mix(S, M, 0.3)]]);
  const signs: Array<[number, string]> = [[0.2, A], [0.34, H], [0.55, A], [0.72, H], [0.86, A]];
  for (const [u, tone] of signs) {
    const sx = u * w, sw = w * (0.025 + R() * 0.02), sy = h * (0.1 + R() * 0.14);
    x.fillStyle = tone; x.fillRect(sx, sy, sw, h * (0.1 + R() * 0.12)); // diegetik tabela
    glow(x, sx + sw / 2, sy + h * 0.1, h * 0.14, tone, 0.4);
    // ıslak zeminde dikey akan yansıma — kesikli sütun
    let py = h * 0.55;
    while (py < h) {
      const seg = 3 + R() * 8;
      x.fillStyle = rgba(tone, 0.08 + R() * 0.22 * (1 - (py - h * 0.55) / (h * 0.45)));
      x.fillRect(sx + (R() - 0.5) * 3, py, sw * 0.7, seg);
      py += seg + R() * 6;
    }
  }
  bands(x, w, h, -1.05, 9, 0.06, H, 0.05); // seyrek yağmur çizikleri
  vign(x, w, h, '#000000', 0.5);
};

// Vintage comic: gazete kağıdı paneli — kalın panel çerçevesi, kaba halftone, caption kutusu.
const vintage_comic_book: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  fillAll(x, w, h, mix(H, M, 0.35)); // yaşlı newsprint
  speck(x, R, 0, 0, w, h, 50, mix(M, S, 0.3), 0.05, 0.12, 0.8, 1.8);
  x.strokeStyle = '#141414'; x.lineWidth = 4; x.strokeRect(w * 0.04, h * 0.08, w * 0.92, h * 0.84); // panel
  // arka düz vermilyon şekil + mis-register hayaleti
  x.fillStyle = rgba(A, 0.4); x.fillRect(w * 0.5 + 3, h * 0.24 - 2, w * 0.34, h * 0.5);
  x.fillStyle = A; x.fillRect(w * 0.5, h * 0.24, w * 0.34, h * 0.5);
  // kaba halftone gölgeli küre + ağır mürekkep konturu
  const cx = w * 0.32, cy = h * 0.54, r = h * 0.26;
  x.save(); x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.clip();
  fillAll2(x, cx - r, cy - r, r * 2, r * 2, mix(H, M, 0.3));
  halftone(x, cx - r, cy - r, cx + r, cy + r, 6, rgba(S, 0.85), (u, v) => Math.max(0, (u + v) / 2 - 0.18));
  x.restore();
  x.strokeStyle = '#141414'; x.lineWidth = 3.4; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 5; x.beginPath(); x.arc(cx, cy, r, Math.PI * 0.2, Math.PI * 0.9); x.stroke(); // gölge tarafı ağır
  // caption kutusu
  x.fillStyle = mix(H, M, 0.15); x.fillRect(w * 0.07, h * 0.12, w * 0.3, h * 0.14);
  x.strokeStyle = '#141414'; x.lineWidth = 2; x.strokeRect(w * 0.07, h * 0.12, w * 0.3, h * 0.14);
  x.strokeStyle = rgba(S, 0.7); x.lineWidth = 1.4; // caption satır iması
  x.beginPath(); x.moveTo(w * 0.09, h * 0.17); x.lineTo(w * 0.34, h * 0.17); x.stroke();
  x.beginPath(); x.moveTo(w * 0.09, h * 0.21); x.lineTo(w * 0.28, h * 0.21); x.stroke();
};

// Retro OVA: HELD frame — kendinden emin siyah cel konturlu parlak saç kütlesi,
// içinde TEK airbrush spec bandı, pratikte optik-printer halation HALKASI, letterbox.
// (Eski hâli kahverengi kamalardı — kontursuz cel, cel değildir.)
const retro_anime_film: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  // sıcak alacakaranlık gök: 2 değer, sert diyagonal cel gölgesi (asla gri değil)
  vgrad(x, w, 0, h, [[0, mix(M, A, 0.35)], [0.55, mix(M, H, 0.25)], [1, mix(M, S, 0.2)]]);
  poly(x, [[0, 0], [w, 0], [w, h * 0.22], [w * 0.3, h * 0.5], [0, h * 0.34]]);
  x.fillStyle = mix(M, S, 0.28); x.fill(); // üst cel gölge düzlemi
  // pratik ışık + ÇİFT POZLAMA HALATION HALKASI (modern glow değil, optik-printer halkası)
  const px2 = w * 0.78, py2 = h * 0.3, pr = h * 0.14;
  glow(x, px2, py2, pr * 2.2, A, 0.5);
  x.fillStyle = mix(H, '#ffffff', 0.5); x.beginPath(); x.arc(px2, py2, pr * 0.32, 0, Math.PI * 2); x.fill();
  x.strokeStyle = rgba(H, 0.55); x.lineWidth = 2;
  x.beginPath(); x.arc(px2, py2, pr * 1.35, 0, Math.PI * 2); x.stroke(); // halkanın kendisi
  x.strokeStyle = rgba(A, 0.3); x.lineWidth = 1.2;
  x.beginPath(); x.arc(px2, py2, pr * 1.7, 0, Math.PI * 2); x.stroke();
  // PARLAK SAÇ KÜTLESİ — tek kütle, sol-alttan süpüren cel şekli
  const hair: Array<[number, number]> = [
    [0, h], [0, h * 0.46], [w * 0.14, h * 0.34 + (R() - 0.5) * h * 0.04],
    [w * 0.32, h * 0.36], [w * 0.46, h * 0.5], [w * 0.55, h * 0.72], [w * 0.58, h],
  ];
  poly(x, hair);
  // dönem baskısı: dolgu kontura göre 1.5px KAYIK (mis-registration)
  x.save(); x.translate(1.5, 1);
  x.fillStyle = mix(S, M, 0.18); x.fill(); x.restore();
  x.strokeStyle = '#0d0805'; x.lineWidth = 2.6; x.lineJoin = 'round'; x.stroke(); // kendinden emin cel çizgisi
  // kütle İÇİNDE tek airbrush spec bandı — saçın tek parlak şeridi
  x.save(); x.beginPath();
  poly(x, hair); x.clip();
  x.translate(w * 0.24, h * 0.52); x.rotate(-0.38); x.scale(2.6, 0.4);
  glow(x, 0, 0, h * 0.22, H, 0.75); x.restore();
  // kumaş kıvrımı iması: kütle içinde iki koyu mürekkep hattı
  handStroke(x, R, [[w * 0.12, h * 0.62], [w * 0.2, h * 0.78], [w * 0.22, h * 0.94]], 2.2, '#0d0805', 0.8, 0.8);
  handStroke(x, R, [[w * 0.34, h * 0.52], [w * 0.4, h * 0.7], [w * 0.44, h * 0.9]], 2.2, '#0d0805', 0.7, 0.8);
  speck(x, R, 0, 0, w, h, 90, H, 0.03, 0.1, 0.7, 1.3); // print grain
  speck(x, R, 0, 0, w, h, 40, S, 0.08, 0.2, 0.7, 1.3);
  speck(x, R, 0, 0, w, h, 5, '#ffffff', 0.4, 0.7, 0.8, 1.4); // cel tozu
  x.fillStyle = rgba(A, 0.08); x.fillRect(0, 0, w, h); // amber print-fade
  x.fillStyle = '#000000'; x.fillRect(0, 0, w, h * 0.09); x.fillRect(0, h * 0.91, w, h * 0.09); // letterbox
};

// Flat motion design: Saul Bass düzlüğü — iki düz alan, bir daire. Doku SIFIR.
const motion_design_flat: WorldPainter = (x, w, h, [S, M, A, H]) => {
  fillAll(x, w, h, M);
  poly(x, [[0, h], [w * 0.46, h], [w * 0.7, 0], [0, 0]]); x.fillStyle = S; x.fill(); // charcoal kama
  x.fillStyle = A; x.beginPath(); x.arc(w * 0.62, h * 0.44, h * 0.26, 0, Math.PI * 2); x.fill(); // vermilyon daire
  x.fillStyle = H; x.fillRect(w * 0.76, h * 0.66, w * 0.16, h * 0.07); // beyaz bar
};

// Synthwave: cyan tel-kafes grid + bantlı güneş + pembe ufuk bloom — anti-fiziksel.
const synthwave_retro_80s: WorldPainter = (x, w, h, [S, M, A, H]) => {
  vgrad(x, w, 0, h * 0.62, [[0, S], [0.7, mix(S, M, 0.6)], [1, mix(M, A, 0.4)]]);
  const hz = h * 0.62, sx = w * 0.5, sr = h * 0.3;
  // bantlı güneş: gradyan disk + zemin rengi yatay kesikler
  const sg = x.createLinearGradient(0, hz - sr * 2, 0, hz);
  sg.addColorStop(0, H); sg.addColorStop(1, A);
  x.fillStyle = sg; x.beginPath(); x.arc(sx, hz, sr, Math.PI, 0); x.fill();
  x.fillStyle = S;
  for (let i = 0; i < 4; i++) x.fillRect(sx - sr, hz - sr * (0.14 + i * 0.2), sr * 2, sr * (0.04 + i * 0.03));
  glow(x, sx, hz, sr * 1.7, A, 0.4); // pembe ufuk bloom
  // zemin: siyah-mor + cyan tel kafes (perspektif)
  fillAll2(x, 0, hz, w, h - hz, mix(S, '#000000', 0.4));
  x.strokeStyle = rgba(H, 0.75); x.lineWidth = 1.2;
  for (let i = 0; i <= 10; i++) { // ışınsal dikey
    const u = i / 10;
    x.beginPath(); x.moveTo(sx, hz); x.lineTo((u - 0.5) * w * 3 + sx, h + 2); x.stroke();
  }
  for (let i = 1; i <= 5; i++) { // perspektif yatay — sıklaşan
    const y = hz + Math.pow(i / 5, 1.8) * (h - hz);
    x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke();
  }
  x.strokeStyle = rgba(H, 0.9); x.lineWidth = 2; x.beginPath(); x.moveTo(0, hz); x.lineTo(w, hz); x.stroke(); // lazer ufuk
};

// PS1: dev düz üçgen facetler + ordered dithering + testere silüet — 240p bloklu.
const low_poly_ps1: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  const px = Math.max(3, Math.round(h / 26)); // piksel bloğu
  fillAll(x, w, h, mix(S, M, 0.25));
  // gouraud yerine: düz gri facet üçgenleri
  const tones = [mix(S, M, 0.55), M, mix(M, H, 0.3), mix(S, M, 0.4)];
  let xa = 0, ti = 0;
  while (xa < w) {
    const step = w * (0.1 + R() * 0.12);
    const y1 = h * (0.35 + R() * 0.3), y2 = h * (0.35 + R() * 0.3);
    poly(x, [[xa, h], [xa, y1], [xa + step, y2], [xa + step, h]]);
    x.fillStyle = tones[ti % tones.length]; x.fill();
    poly(x, [[xa, y1], [xa + step, y2], [xa + step * 0.5, Math.min(y1, y2) - h * (0.06 + R() * 0.12)]]);
    x.fillStyle = tones[(ti + 2) % tones.length]; x.fill();
    xa += step; ti++;
  }
  // silüeti 240p rasterına oturt: testere basamakları
  x.fillStyle = mix(S, M, 0.25);
  for (let bx = 0; bx < w; bx += px) {
    const yy = Math.round((h * 0.3 + Math.sin(bx / w * 7) * h * 0.1) / px) * px;
    x.fillRect(bx, 0, px, yy);
  }
  // ordered dithering bölgesi: 2×2 şah deseni — gradyan yerine
  for (let by = Math.round(h * 0.62 / px) * px; by < h; by += px) {
    for (let bx = 0; bx < w * 0.5; bx += px) {
      if (((bx / px) + (by / px)) % 2 === 0) { x.fillStyle = rgba(S, 0.4); x.fillRect(bx, by, px, px); }
    }
  }
  x.fillStyle = A; // donanım-primary yeşil accent facet
  poly(x, [[w * 0.66, h * 0.5], [w * 0.78, h * 0.34], [w * 0.84, h * 0.52]]); x.fill();
  speck(x, R, 0, 0, w, h * 0.3, 8, H, 0.4, 0.8, px, px); // bloklu yıldız
};

// Rick & Morty: bej deadpan düzlük + KAYNAYAN çizgili toksik-yeşil portal.
const rick_morty_scifi: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  fillAll(x, w, h, M); // bej-tan cel zemin
  fillAll2(x, 0, h * 0.78, w, h * 0.22, mix(M, S, 0.35)); // düz zemin bandı — 1 değer cel
  const cx = w * 0.42, cy = h * 0.48;
  // portal: iç içe titrek halkalar, düz dolgular
  const ring = (r: number, tone: string) => {
    blob(x, R, cx, cy, r, 0.12, 1, 14); x.fillStyle = tone; x.fill();
  };
  ring(h * 0.34, mix(A, S, 0.35));
  ring(h * 0.26, A);
  ring(h * 0.16, mix(A, H, 0.45));
  ring(h * 0.07, mix(H, A, 0.2));
  // boil çizgisi: aynı kontur kaymış İKİ kez — titreşen kenar
  for (const off of [0, 1.6]) {
    blob(x, R, cx + off, cy - off * 0.5, h * 0.34, 0.14, 1, 14);
    x.strokeStyle = rgba(mix(S, '#202020', 0.5), 0.8); x.lineWidth = 1.4; x.stroke();
  }
  // portal sıçraması: iki küçük damla
  for (const [dx, dy] of [[0.62, 0.24], [0.58, 0.72]] as Array<[number, number]>) {
    blob(x, R, w * dx, h * dy, h * 0.045, 0.3, 1, 8); x.fillStyle = A; x.fill();
  }
  speck(x, R, 0, 0, w, h * 0.4, 6, H, 0.5, 0.9, 1, 2); // deadpan yıldız beneği
};

// Invincible: mavi/sarı diyagonal panel + temiz 3px mürekkep + kırmızı impact yıldızı.
const invincible_hero_comic: WorldPainter = (x, w, h, [S, M, A, H]) => {
  fillAll(x, w, h, S); // hero mavisi
  poly(x, [[w * 0.34, 0], [w, 0], [w, h], [w * 0.58, h]]); x.fillStyle = M; x.fill(); // parlak sarı alan
  x.strokeStyle = '#101010'; x.lineWidth = 3; // temiz comic mürekkep sınırı
  x.beginPath(); x.moveTo(w * 0.34, 0); x.lineTo(w * 0.58, h); x.stroke();
  // beyaz hız çizgileri — köşeden yelpaze
  x.strokeStyle = rgba(H, 0.85); x.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    x.beginPath(); x.moveTo(w, h * 0.04); x.lineTo(w * (0.6 + i * 0.06), h * (0.34 + i * 0.1)); x.stroke();
  }
  // crimson impact yıldızı: sivri poligon + siyah kontur
  const cx = w * 0.46, cy = h * 0.42, spikes = 9;
  const star: Array<[number, number]> = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = i / (spikes * 2) * Math.PI * 2;
    const r = (i % 2 === 0 ? h * 0.3 : h * 0.13) * (1 + ((i * 7919) % 5) * 0.03);
    star.push([cx + Math.cos(a) * r * 1.15, cy + Math.sin(a) * r]);
  }
  poly(x, star); x.fillStyle = A; x.fill();
  x.strokeStyle = '#101010'; x.lineWidth = 2.6; x.lineJoin = 'round'; poly(x, star); x.stroke();
  x.fillStyle = H; x.beginPath(); x.arc(cx, cy, h * 0.05, 0, Math.PI * 2); x.fill(); // çekirdek parlama
};

// Castlevania: mum-amber havuzunda gotik sivri kemer silüeti, kan-kızıl flama şeridi.
const castlevania_gothic: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  fillAll(x, w, h, mix(S, '#000000', 0.35));
  glow(x, w * 0.3, h * 0.66, h * 0.85, H, 0.34); // mum havuzu — dik düşüş ama kemeri OKUTUR
  glow(x, w * 0.3, h * 0.66, h * 0.42, mix(H, A, 0.3), 0.5);
  // gotik sivri kemer: NEGATİF şekil — ışık havuzunun içinde siyah
  x.fillStyle = mix(S, '#000000', 0.5);
  x.beginPath(); x.moveTo(w * 0.14, h);
  x.lineTo(w * 0.14, h * 0.5);
  x.quadraticCurveTo(w * 0.14, h * 0.18, w * 0.3, h * 0.1);
  x.quadraticCurveTo(w * 0.46, h * 0.18, w * 0.46, h * 0.5);
  x.lineTo(w * 0.46, h); x.closePath();
  const arch = x.createLinearGradient(0, h * 0.1, 0, h);
  arch.addColorStop(0, mix(S, '#000000', 0.6)); arch.addColorStop(0.62, mix(S, M, 0.35)); arch.addColorStop(1, mix(M, H, 0.3));
  x.fillStyle = arch; x.fill();
  // ince rafine mürekkep konturu — kemer kenarında
  x.strokeStyle = rgba(mix(M, H, 0.4), 0.5); x.lineWidth = 1;
  x.beginPath(); x.moveTo(w * 0.14, h * 0.9); x.lineTo(w * 0.14, h * 0.5);
  x.quadraticCurveTo(w * 0.14, h * 0.18, w * 0.3, h * 0.1);
  x.quadraticCurveTo(w * 0.46, h * 0.18, w * 0.46, h * 0.5); x.lineTo(w * 0.46, h * 0.9); x.stroke();
  x.fillStyle = rgba(A, 0.85); x.fillRect(w * 0.72, 0, w * 0.05, h * 0.44); // kan-kızıl flama
  poly(x, [[w * 0.72, h * 0.44], [w * 0.745, h * 0.38], [w * 0.77, h * 0.44]]); x.fillStyle = mix(S, '#000000', 0.35); x.fill();
  speck(x, R, 0, h * 0.4, w * 0.6, h, 8, H, 0.2, 0.5, 0.7, 1.2); // köz
  vign(x, w, h, '#000000', 0.55);
};

/* — CINEMATIC_REAL — */

// Deakins: itiraz disiplini — kadrajın %80'i karanlık, TEK motive sıcak havuz, sert silüet kenarı.
const deakins_naturalist: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  fillAll(x, w, h, mix(S, '#000000', 0.2));
  // duvar düzlemine düşen tek sodyum/tungsten havuzu
  glow(x, w * 0.7, h * 0.45, h * 0.66, A, 0.34);
  glow(x, w * 0.7, h * 0.45, h * 0.34, mix(A, H, 0.5), 0.3);
  vgrad(x, w, h * 0.78, h, [[0, 'rgba(0,0,0,0)'], [1, rgba(S, 0.8)]]); // zemine düşüş
  // havuzu kesen sert dikey silüet kenarı (kapı pervazı / figür)
  x.fillStyle = mix(S, '#000000', 0.55); x.fillRect(w * 0.48, 0, w * 0.09, h);
  x.fillStyle = rgba(H, 0.9); x.beginPath(); x.arc(w * 0.86, h * 0.24, 1.8, 0, Math.PI * 2); x.fill(); // görünür pratik kaynak
  glow(x, w * 0.86, h * 0.24, h * 0.08, H, 0.5);
  speck(x, R, 0, 0, w, h, 34, '#000000', 0.06, 0.14, 0.7, 1.2); // ince grain
  speck(x, R, 0, 0, w, h, 20, H, 0.02, 0.06, 0.7, 1.2);
};

// Fincher: kontrol — aksa kilitli simetri, teal oda, TEK sıcak monitör ve kusursuz yansıması.
const fincher_precision: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  vgrad(x, w, 0, h, [[0, mix(S, '#000000', 0.25)], [0.55, S], [1, mix(S, M, 0.2)]]);
  const cx = w / 2, mw = w * 0.14, my = h * 0.3, mh = h * 0.24;
  // simetri kanıtı: eksene hizalı çift dikey hat
  x.fillStyle = rgba(M, 0.25); x.fillRect(w * 0.2, 0, 1.5, h); x.fillRect(w * 0.8 - 1.5, 0, 1.5, h);
  x.fillStyle = rgba(M, 0.15); x.fillRect(w * 0.3, 0, 1, h); x.fillRect(w * 0.7 - 1, 0, 1, h);
  // monitör: sıcak pratik, kadraj öğesi olarak MERKEZDE
  glow(x, cx, my + mh / 2, h * 0.3, A, 0.3);
  x.fillStyle = mix(A, H, 0.45); x.fillRect(cx - mw / 2, my, mw, mh);
  x.strokeStyle = mix(S, '#000000', 0.4); x.lineWidth = 2; x.strokeRect(cx - mw / 2, my, mw, mh);
  // masa yüzeyinde motorize-dolly kusursuzluğunda yansıma
  const rg = x.createLinearGradient(0, my + mh + 4, 0, my + mh + 4 + mh);
  rg.addColorStop(0, rgba(A, 0.3)); rg.addColorStop(1, rgba(A, 0));
  x.fillStyle = rg; x.fillRect(cx - mw / 2, my + mh + 4, mw, mh);
  x.fillStyle = rgba(S, 0.55); x.fillRect(0, my + mh + 2, w, 2); // masa çizgisi
  speck(x, R, 0, 0, w, h, 44, '#000000', 0.04, 0.1, 0.6, 1); // temiz sensör + grain overlay
};

// Wes Anderson: kusursuz bilateral simetri — pastel cephe, merkez kapı, eş pencereler. Düz ışık.
const wes_anderson_symmetric: WorldPainter = (x, w, h, [S, M, A, H]) => {
  fillAll(x, w, h, M); // şeftali cephe
  fillAll2(x, 0, 0, w, h * 0.16, mix(H, M, 0.4)); // kornis bandı
  fillAll2(x, 0, h * 0.82, w, h * 0.18, mix(S, M, 0.5)); // zemin bandı
  const cx = w / 2;
  // merkez kapı — somon, krem çerçeveli
  x.fillStyle = H; x.fillRect(cx - w * 0.085, h * 0.3, w * 0.17, h * 0.52);
  x.fillStyle = A; x.fillRect(cx - w * 0.065, h * 0.34, w * 0.13, h * 0.48);
  x.fillStyle = H; x.beginPath(); x.arc(cx + w * 0.04, h * 0.6, 1.8, 0, Math.PI * 2); x.fill(); // kapı topuzu
  // eş pencereler — tam simetrik çiftler
  for (const s of [-1, 1]) {
    for (const u of [0.24, 0.38]) {
      const px = cx + s * w * u;
      x.fillStyle = mix(S, M, 0.3); x.fillRect(px - w * 0.045, h * 0.28, w * 0.09, h * 0.24);
      x.strokeStyle = H; x.lineWidth = 2; x.strokeRect(px - w * 0.045, h * 0.28, w * 0.09, h * 0.24);
      x.beginPath(); x.moveTo(px, h * 0.28); x.lineTo(px, h * 0.52); x.stroke();
    }
  }
  x.strokeStyle = mix(S, M, 0.4); x.lineWidth = 1.5; // kornis çizgileri
  x.beginPath(); x.moveTo(0, h * 0.16); x.lineTo(w, h * 0.16); x.stroke();
  x.beginPath(); x.moveTo(0, h * 0.82); x.lineTo(w, h * 0.82); x.stroke();
};

// Chivo: yalnız doğal ışık — magic-hour altın alan, upuzun gölgeler, elde kamera eğimi, kenar bloom.
const chivo_naturalist_handheld: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  x.save(); x.translate(w / 2, h / 2); x.rotate(0.03); x.translate(-w / 2, -h / 2); // handheld eğim
  vgrad(x, w, -h * 0.05, h * 0.52, [[0, mix(H, M, 0.45)], [1, mix(A, H, 0.5)]]); // sıcak gök
  vgrad(x, w, h * 0.5, h * 1.05, [[0, mix(A, M, 0.5)], [1, mix(S, M, 0.35)]]); // altın alan
  // upuzun gölgeler — kadraj dışı figürlerden, sağdan sola yatık
  for (let i = 0; i < 5; i++) {
    const gx = w * (0.15 + i * 0.18) + R() * 8;
    poly(x, [[gx, h * 1.02], [gx + w * 0.05, h * 1.02], [gx - w * 0.22, h * 0.53], [gx - w * 0.24, h * 0.53]]);
    x.fillStyle = rgba(S, 0.34); x.fill();
  }
  x.restore();
  // güneş kadraj DIŞINDA sağda: kenardan taşan doğal bloom
  x.globalCompositeOperation = 'screen';
  glow(x, w * 1.04, h * 0.34, h * 0.7, H, 0.55);
  glow(x, w * 1.02, h * 0.34, h * 0.34, mix(H, '#ffffff', 0.3), 0.5);
  x.globalCompositeOperation = 'source-over';
  vgrad(x, w, 0, h, [[0, 'rgba(0,0,0,0)'], [1, rgba(S, 0.18)]]);
};

// Noir: saf monokrom — jaluzi bantları, kapı kaması, silüet kesintisi. 8:1 kontrast.
const noir_high_contrast: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  fillAll(x, w, h, '#000000');
  // jaluzi: sert kenarlı diyagonal ışık bantları
  bands(x, w, h, -0.42, h * 0.19, 0.44, mix(A, H, 0.4), 0.85);
  // bantları kesen silüet — ışığın İÇİNDEKİ siyah figür boşluğu
  x.fillStyle = '#000000';
  x.beginPath(); x.arc(w * 0.62, h * 0.36, h * 0.17, 0, Math.PI * 2); x.fill(); // baş
  poly(x, [[w * 0.44, h], [w * 0.5, h * 0.44], [w * 0.74, h * 0.44], [w * 0.8, h]]); x.fill(); // omuz
  // kapı kaması: soldan kesik ışık üçgeni
  poly(x, [[0, h], [0, h * 0.3], [w * 0.16, h]]);
  x.fillStyle = rgba(H, 0.8); x.fill();
  poly(x, [[w * 0.017, h], [w * 0.017, h * 0.42], [w * 0.13, h]]); x.fillStyle = '#000000'; x.fill(); // kapının kendisi
  speck(x, R, 0, 0, w, h, 60, M, 0.04, 0.12, 0.6, 1.1); // sert grain
  vign(x, w, h, '#000000', 0.4);
};

// Sci-fi hard surface: panel derzi + pah ışığı — fırçalanmış metal, cyan LED, amber diyot.
const sci_fi_hard_surface: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  vgrad(x, w, 0, h, [[0, mix(S, M, 0.35)], [0.5, mix(S, M, 0.2)], [1, S]]);
  bands(x, w, h, 0, 2.2, 0.4, mix(M, H, 0.2), 0.05); // fırçalanmış metal yatay mikro-çizgi
  // panel derzleri: koyu 1px gap + hemen yanında 1px pah highlight'ı
  const seams: Array<[number, number, number, number]> = [
    [0, h * 0.3, w, h * 0.3], [0, h * 0.72, w, h * 0.72],
    [w * 0.3, 0, w * 0.3, h], [w * 0.62, h * 0.3, w * 0.62, h], [w * 0.82, 0, w * 0.82, h * 0.3],
  ];
  for (const [x0, y0, x1, y1] of seams) {
    x.strokeStyle = rgba(mix(S, '#000000', 0.5), 0.9); x.lineWidth = 1.6;
    x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke();
    x.strokeStyle = rgba(H, 0.35); x.lineWidth = 1;
    const off = x0 === x1 ? 1.6 : 0, offY = y0 === y1 ? 1.6 : 0;
    x.beginPath(); x.moveTo(x0 + off, y0 + offY); x.lineTo(x1 + off, y1 + offY); x.stroke();
  }
  bands(x, w, h, -0.7, h * 1.4, 0.24, H, 0.06); // sert rake sheen — mikro-yüzeyi uyandıran
  // diegetik durum ışıkları
  glow(x, w * 0.68, h * 0.5, h * 0.12, A, 0.6);
  x.fillStyle = A; x.beginPath(); x.arc(w * 0.68, h * 0.5, 2.4, 0, Math.PI * 2); x.fill();
  x.fillStyle = mix(A, M, 0.2); x.fillRect(w * 0.66, h * 0.56, w * 0.04, 1.4); // LED şerit
  glow(x, w * 0.88, h * 0.82, h * 0.06, '#e8a33d', 0.5); // amber uyarı diyotu
  x.fillStyle = '#e8a33d'; x.beginPath(); x.arc(w * 0.88, h * 0.82, 1.6, 0, Math.PI * 2); x.fill();
  speck(x, R, 0, 0, w, h, 16, S, 0.1, 0.2, 0.6, 1.2); // bakım kaydı — çizik tozu
};

// Nature doc: uzun lens sıkışması — üst üste binen puslu habitat bantları, fill'siz gölge, keskin özne beneği.
const nature_doc_real: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  fillAll(x, w, h, mix(H, M, 0.4));
  // sıkıştırılmış bantlar: uzağa doğru açılıp pusa eriyen katmanlar (300-600mm dili)
  const layers = 5;
  for (let i = layers - 1; i >= 0; i--) {
    const yTop = h * (0.16 + i * 0.17), haze = i / (layers - 1);
    x.fillStyle = mix(mix(M, S, 0.5 + (1 - haze) * 0.3), mix(H, M, 0.3), haze * 0.72);
    x.beginPath(); x.moveTo(0, yTop + Math.sin(i * 2.7) * h * 0.02);
    for (let px = 0; px <= w; px += w / 10) x.lineTo(px, yTop + Math.sin(px / w * 4 + i * 2.7) * h * 0.03 + (R() - 0.5) * 2);
    x.lineTo(w, h); x.lineTo(0, h); x.closePath(); x.fill();
  }
  // alçak altın rake: bantların TEK kenarını yalayan ışık — gölge tarafı fill'siz kalır
  x.globalCompositeOperation = 'screen';
  for (let i = 0; i < layers - 1; i++) {
    const yTop = h * (0.16 + i * 0.17);
    x.fillStyle = rgba(A, 0.34 * (1 - i / layers));
    x.fillRect(w * 0.34, yTop, w * 0.66, 3.2);
  }
  glow(x, w * 0.97, h * 0.2, h * 0.5, A, 0.4);
  x.globalCompositeOperation = 'source-over';
  speck(x, R, w * 0.5, h * 0.15, w, h * 0.5, 26, mix(A, H, 0.5), 0.2, 0.5, 0.6, 1.4); // ışıkta toz
  // özne: ayakta duran keskin silüet — gövde + bacak iması, güneş sağdan rim yakar
  const sx2 = w * 0.34, sy2 = h * 0.6, br = h * 0.055;
  x.fillStyle = mix(S, '#000000', 0.35);
  x.fillRect(sx2 - br * 0.9, sy2, br * 0.5, h * 0.07); // bacaklar
  x.fillRect(sx2 + br * 0.5, sy2, br * 0.5, h * 0.07);
  x.save(); x.translate(sx2, sy2 - br * 0.4); x.scale(1.7, 1);
  x.beginPath(); x.arc(0, 0, br, 0, Math.PI * 2); x.fill(); x.restore();
  x.fillRect(sx2 + br * 1.1, sy2 - br * 2.2, br * 0.42, br * 1.9); // baş/boyun
  // fill'siz düşen gölge: güneşin tersine upuzun, hiçbir şey doldurmaz
  poly(x, [[sx2 - br, sy2 + h * 0.068], [sx2 + br * 1.4, sy2 + h * 0.068], [sx2 - w * 0.2, sy2 + h * 0.12], [sx2 - w * 0.23, sy2 + h * 0.11]]);
  x.fillStyle = rgba(mix(S, '#000000', 0.4), 0.55); x.fill();
  // sırtta altın rim — uzun lensin karşı-ışık imzası
  x.strokeStyle = rgba(mix(A, H, 0.3), 0.95); x.lineWidth = 1.6;
  x.save(); x.translate(sx2, sy2 - br * 0.4); x.scale(1.7, 1);
  x.beginPath(); x.arc(0, 0, br, Math.PI * 1.3, Math.PI * 1.95); x.stroke(); x.restore();
};

// Archival newsreel: patlayan pencere + ezilen oda + halation + gate kenarı + çizik.
const archival_newsreel: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  vgrad(x, w, 0, h, [[0, mix(S, M, 0.35)], [1, mix(S, '#000000', 0.3)]]); // ezilmiş oda
  // pencere: saf beyaza patlar, düzeltilmemiş
  const wx = w * 0.14, wy = h * 0.14, ww = w * 0.3, wh = h * 0.5;
  glow(x, wx + ww / 2, wy + wh / 2, ww, H, 0.5); // halation taşması
  x.fillStyle = mix(H, '#ffffff', 0.5); x.fillRect(wx, wy, ww, wh);
  x.fillStyle = rgba(S, 0.8); x.fillRect(wx + ww * 0.47, wy, ww * 0.06, wh); // cam orta dikmesi — ışıkta eriyen
  // odada zar zor okunan koyu kütleler
  x.fillStyle = rgba(S, 0.7); x.fillRect(w * 0.56, h * 0.5, w * 0.34, h * 0.5);
  x.fillStyle = rgba(mix(S, M, 0.3), 0.6); x.fillRect(w * 0.6, h * 0.34, w * 0.14, h * 0.2);
  x.fillStyle = rgba(A, 0.1); x.fillRect(0, 0, w, h); // düzeltilmemiş sıcak cast
  speck(x, R, 0, 0, w, h, 130, H, 0.04, 0.14, 0.6, 1.4); // 16mm grain — ağır
  speck(x, R, 0, 0, w, h, 60, '#000000', 0.1, 0.3, 0.6, 1.4);
  for (let i = 0; i < 3; i++) { // film çizikleri
    const sx2 = w * (0.2 + R() * 0.6);
    x.fillStyle = rgba(H, 0.12 + R() * 0.14); x.fillRect(sx2, 0, 1, h);
  }
  x.fillStyle = 'rgba(0,0,0,0.85)'; // gate kenarları
  x.fillRect(0, 0, w * 0.015, h); x.fillRect(w * 0.985, 0, w * 0.015, h);
  vign(x, w, h, '#000000', 0.5);
};

// Period reconstruction: TEK alev — dik düşüş, is karası, tek taraflı aydınlanan kenar; uzak duvar YOK.
const period_reconstruction: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  fillAll(x, w, h, mix(S, '#000000', 0.5));
  const fx = w * 0.34, fy = h * 0.56;
  // alev havuzu: küçük yarıçaplar, dik falloff — oda alevden birkaç adım sonra bitiyor
  glow(x, fx, fy, h * 0.52, A, 0.3);
  glow(x, fx, fy, h * 0.26, mix(A, H, 0.5), 0.5);
  glow(x, fx, fy - h * 0.03, h * 0.09, H, 0.9);
  // alev damlası
  x.fillStyle = mix(H, '#ffffff', 0.2);
  x.beginPath(); x.moveTo(fx, fy - h * 0.1);
  x.quadraticCurveTo(fx + h * 0.035, fy - h * 0.03, fx, fy + h * 0.025);
  x.quadraticCurveTo(fx - h * 0.035, fy - h * 0.03, fx, fy - h * 0.1); x.fill();
  x.fillStyle = rgba(S, 0.9); x.fillRect(fx - 1.5, fy + h * 0.03, 3, h * 0.09); // fitil/kandil
  // tek-taraflı kenar: alev tarafı yanan, öbür yüzü yok olan dikey form
  const eg = x.createLinearGradient(w * 0.58, 0, w * 0.66, 0);
  eg.addColorStop(0, rgba(mix(A, H, 0.4), 0.5)); eg.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = eg; x.fillRect(w * 0.58, h * 0.1, w * 0.08, h * 0.9);
  speck(x, R, fx - w * 0.1, h * 0.2, fx + w * 0.14, fy, 7, mix(A, H, 0.5), 0.3, 0.7, 0.7, 1.3); // yükselen köz
  speck(x, R, 0, 0, w, h, 46, '#000000', 0.1, 0.24, 0.7, 1.4); // is/grain
  vign(x, w, h, '#000000', 0.62);
};

// Laika: KARANLIK minyatür set — çarpık ev + bükülü tel-iskelet ağaç silüeti, tek sıcak
// pencere pratiği, makas-kesiği tepe hattı, ağır ön plan DOF. (Eski hâli "yumuşak kukla
// yumrusu"ydu — Aardman kiliyle aynı dili konuşuyordu; iki dünya aynı kareyi üretemez.)
const laika_stopmotion: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  // gece göğü: low-key, üstte soğuk derinlik
  vgrad(x, w, 0, h, [[0, mix(S, '#000000', 0.35)], [0.6, mix(S, M, 0.2)], [1, mix(S, M, 0.32)]]);
  glow(x, w * 0.3, h * 0.16, h * 0.3, mix(M, H, 0.4), 0.14); // soğuk ay iması — kaynak görünmez
  // makas-kesiği tepe: el kesimi kağıt/keçe hattı, kasıtlı titrek
  const hillPts: Array<[number, number]> = [];
  for (let i = 0; i <= 12; i++) {
    const px = (i / 12) * w;
    hillPts.push([px, h * (0.62 + Math.sin(i * 1.7 + seed % 7) * 0.05) + (R() - 0.5) * h * 0.04]);
  }
  poly(x, [...hillPts, [w, h], [0, h]]);
  x.fillStyle = mix(S, M, 0.24); x.fill();
  // çarpık minyatür ev silüeti — dik açı YOK, her duvar hafif yamuk
  const bx = w * 0.64, by = h * 0.62;
  poly(x, [
    [bx - w * 0.07, by], [bx - w * 0.055, by - h * 0.3], [bx + w * 0.02, by - h * 0.42],
    [bx + w * 0.075, by - h * 0.27], [bx + w * 0.06, by],
  ]);
  x.fillStyle = mix(S, '#000000', 0.3); x.fill();
  x.strokeStyle = rgba(mix(M, H, 0.3), 0.25); x.lineWidth = 1; x.stroke(); // soğuk kenar ışığı
  // TEK sıcak pencere — kukla ölçekli pratik, sahnenin kalbi
  const wx = bx - w * 0.012, wy = by - h * 0.22;
  glow(x, wx, wy, h * 0.16, A, 0.55);
  x.fillStyle = mix(A, H, 0.55); x.fillRect(wx - 2.4, wy - 3.6, 4.8, 7.2);
  // pencere ışığı tepeye sıçrar — minyatür falloff
  x.save(); x.translate(wx, by + 2); x.scale(1.6, 0.35); glow(x, 0, 0, h * 0.18, A, 0.3); x.restore();
  // bükülü tel-iskelet ağaç: zikzak gövde + iki çatal dal, el bükümü
  const tx = w * 0.24, ty = h * 0.66;
  handStroke(x, R, [[tx, ty], [tx + w * 0.015, ty - h * 0.16], [tx - w * 0.02, ty - h * 0.3], [tx + w * 0.01, ty - h * 0.42]], 3, mix(S, '#000000', 0.45), 0.95, 1.6);
  handStroke(x, R, [[tx - w * 0.012, ty - h * 0.28], [tx - w * 0.05, ty - h * 0.38], [tx - w * 0.06, ty - h * 0.5]], 1.8, mix(S, '#000000', 0.45), 0.9, 1.6);
  handStroke(x, R, [[tx + w * 0.005, ty - h * 0.38], [tx + w * 0.04, ty - h * 0.46], [tx + w * 0.045, ty - h * 0.56]], 1.6, mix(S, '#000000', 0.45), 0.9, 1.6);
  // ağır ön plan DOF: alt bant bulanık smear — minyatür sığ alan derinliği
  for (let i = 0; i < 3; i++) {
    x.fillStyle = rgba(mix(S, M, 0.34), 0.32 - i * 0.08);
    x.fillRect(-4, h * (0.84 + i * 0.05), w + 8, h * 0.09);
  }
  vign(x, w, h, '#000000', 0.5);
};

/* — COMMERCIAL_REAL — */

// Edu promo: pencere gün ışığı paralelkenarı sıcak duvarda — güvenilir, yumuşak, altın pratik.
const edu_promo_real: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  vgrad(x, w, 0, h, [[0, mix(M, S, 0.25)], [0.6, mix(M, H, 0.25)], [1, mix(M, S, 0.35)]]);
  // pencereden düşen ışık: eğik parlak dörtgen, iki kanat — yumuşak kenar
  for (const [ox, aa] of [[0, 0.34], [w * 0.17, 0.28]] as Array<[number, number]>) {
    poly(x, [[w * 0.3 + ox, h * 0.1], [w * 0.42 + ox, h * 0.08], [w * 0.34 + ox, h * 0.95], [w * 0.2 + ox, h * 0.98]]);
    x.fillStyle = rgba(H, aa); x.fill();
    poly(x, [[w * 0.31 + ox, h * 0.1], [w * 0.41 + ox, h * 0.085], [w * 0.335 + ox, h * 0.94], [w * 0.22 + ox, h * 0.96]]);
    x.fillStyle = rgba(H, aa * 0.5); x.fill();
  }
  glow(x, w * 0.8, h * 0.62, h * 0.16, A, 0.5); // altın masa lambası pratigi
  x.fillStyle = mix(A, H, 0.4); x.beginPath(); x.arc(w * 0.8, h * 0.62, 2.6, 0, Math.PI * 2); x.fill();
  x.fillStyle = rgba(S, 0.5); x.fillRect(0, h * 0.86, w, h * 0.14); // masa hattı
  speck(x, R, w * 0.24, h * 0.1, w * 0.62, h * 0.9, 16, H, 0.1, 0.3, 0.6, 1.2); // ışıkta toz
  speck(x, R, 0, 0, w, h, 24, '#000000', 0.03, 0.08, 0.6, 1);
};

// Kurumsal: şafak çelik-mavisi cam cephe — mullion ritmi, TEK amber yanan pencere.
const kurumsal_brand_film: WorldPainter = (x, w, h, [S, M, A, H]) => {
  vgrad(x, w, 0, h, [[0, mix(S, M, 0.2)], [1, S]]);
  // cam paneller: her hücrede gök yansıması gradyanı
  const cols = 9, rows = 3;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const px = (i / cols) * w, py = h * 0.08 + (j / rows) * h * 0.84;
    const pw = w / cols - 2, ph = h * 0.84 / rows - 2;
    const g = x.createLinearGradient(0, py, 0, py + ph);
    g.addColorStop(0, rgba(mix(M, H, 0.4), 0.3 - j * 0.08));
    g.addColorStop(1, rgba(mix(S, M, 0.3), 0.5));
    x.fillStyle = g; x.fillRect(px + 1, py + 1, pw, ph);
  }
  // mullion çizgileri — dikey ritim
  x.strokeStyle = rgba(mix(S, '#000000', 0.3), 0.8); x.lineWidth = 1.6;
  for (let i = 0; i <= cols; i++) {
    x.beginPath(); x.moveTo((i / cols) * w, h * 0.06); x.lineTo((i / cols) * w, h * 0.94); x.stroke();
  }
  // TEK amber pencere — kısıtlanmış accent
  x.fillStyle = rgba(A, 0.85); x.fillRect((6 / cols) * w + 1.5, h * 0.08 + (h * 0.84 / rows) + 2, w / cols - 4, h * 0.84 / rows - 5);
  glow(x, (6.5 / cols) * w, h * 0.5, h * 0.16, A, 0.3);
  vgrad(x, w, h * 0.9, h, [[0, 'rgba(0,0,0,0)'], [1, rgba(H, 0.12)]]); // şafak zemin sıçraması
};

// Civic: şafak taş meydanı — alçak güneş rake'i, uzun taş derzleri, altın bayrak-kumaş yayı.
const civic_promo_real: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  vgrad(x, w, 0, h * 0.34, [[0, mix(M, H, 0.5)], [1, mix(A, M, 0.35)]]); // şafak göğü
  vgrad(x, w, h * 0.34, h, [[0, mix(M, A, 0.25)], [1, mix(S, M, 0.3)]]); // taş meydan
  // taş derzleri: perspektifle açılan yatay hatlar + rake highlight
  for (let i = 0; i < 5; i++) {
    const y = h * (0.42 + Math.pow(i / 5, 1.4) * 0.55);
    x.strokeStyle = rgba(S, 0.4); x.lineWidth = 1;
    x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke();
    x.strokeStyle = rgba(H, 0.3); // derz sırtında alçak güneş parlaması
    x.beginPath(); x.moveTo(0, y - 1.2); x.lineTo(w, y - 1.2); x.stroke();
  }
  // soldan upuzun gölge kamaları — meydan boş, tören öncesi
  for (let i = 0; i < 3; i++) {
    const gx = w * (0.3 + i * 0.24);
    poly(x, [[gx, h], [gx + w * 0.04, h], [gx + w * 0.3, h * 0.4], [gx + w * 0.28, h * 0.4]]);
    x.fillStyle = rgba(S, 0.3); x.fill();
  }
  glow(x, w * 0.06, h * 0.22, h * 0.36, mix(A, H, 0.5), 0.5); // alçak güneş solda
  // bayrak-kumaş yayı: rake ışığı yakalayan dalgalı kumaş şeridi (altın accent)
  x.strokeStyle = rgba(A, 0.9); x.lineWidth = 5; x.lineCap = 'round';
  x.beginPath(); x.moveTo(w * 0.6, h * 0.12);
  x.bezierCurveTo(w * 0.7, h * 0.3, w * 0.82, h * 0.06, w * 0.94, h * 0.22); x.stroke();
  x.strokeStyle = rgba(H, 0.5); x.lineWidth = 1.6; // kumaşın ışık alan sırtı
  x.beginPath(); x.moveTo(w * 0.6, h * 0.105);
  x.bezierCurveTo(w * 0.7, h * 0.285, w * 0.82, h * 0.045, w * 0.94, h * 0.205); x.stroke();
  speck(x, R, 0, h * 0.35, w, h, 12, H, 0.06, 0.14, 0.6, 1.1);
};

// Appetite tabletop: karanlık sıcak fon — tabak kenarında rake highlight, buhar, spec boncukları.
const appetite_tabletop_real: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  vgrad(x, w, 0, h, [[0, mix(S, '#000000', 0.25)], [0.55, S], [1, mix(S, M, 0.3)]]);
  glow(x, w * 0.2, h * 0.3, h * 0.5, A, 0.2); // arkadan-soldan alçak sıcak key
  // ahşap masa elipsi
  x.save(); x.translate(w * 0.5, h * 0.86); x.scale(3.4, 0.6);
  const tg = x.createRadialGradient(0, 0, 0, 0, 0, h * 0.4);
  tg.addColorStop(0, mix(M, A, 0.3)); tg.addColorStop(1, mix(S, M, 0.2));
  x.fillStyle = tg; x.beginPath(); x.arc(0, 0, h * 0.4, 0, Math.PI * 2); x.fill(); x.restore();
  // tabak: karanlıkta duran form, kenarı rake ile YANAN
  x.save(); x.translate(w * 0.48, h * 0.66); x.scale(1.9, 0.62);
  x.fillStyle = mix(S, M, 0.4); x.beginPath(); x.arc(0, 0, h * 0.3, 0, Math.PI * 2); x.fill();
  x.strokeStyle = rgba(H, 0.9); x.lineWidth = 2.2;
  x.beginPath(); x.arc(0, 0, h * 0.3, Math.PI * 0.9, Math.PI * 1.7); x.stroke(); // ışık alan yay
  x.restore();
  // spec boncukları: ıslak yüzey noktaları
  for (let i = 0; i < 7; i++) {
    const px = w * (0.36 + R() * 0.24), py = h * (0.58 + R() * 0.1);
    x.fillStyle = rgba(H, 0.5 + R() * 0.4); x.beginPath(); x.arc(px, py, 0.8 + R() * 1, 0, Math.PI * 2); x.fill();
  }
  // buhar: iki sarmal fısıltı — ışıkta görünür
  for (const ox of [w * 0.44, w * 0.52]) {
    x.strokeStyle = rgba(H, 0.22); x.lineWidth = 2.6; x.lineCap = 'round';
    x.beginPath(); x.moveTo(ox, h * 0.56);
    x.bezierCurveTo(ox - w * 0.03, h * 0.42, ox + w * 0.03, h * 0.32, ox - w * 0.015, h * 0.16);
    x.stroke();
  }
};

// Product hero: nötr sonsuz stüdyo sweep — kaide, TEK rim çizgisi, softbox yansıması.
const product_brand_real: WorldPainter = (x, w, h, [S, M, A, H]) => {
  vgrad(x, w, 0, h, [[0, mix(M, H, 0.5)], [0.55, mix(M, H, 0.2)], [0.72, M], [1, mix(M, S, 0.4)]]); // sweep kıvrımı
  const cx = w * 0.5, pw = w * 0.13, py = h * 0.34, ph = h * 0.44;
  // kaide silindiri: koyu form
  const pg = x.createLinearGradient(cx - pw / 2, 0, cx + pw / 2, 0);
  pg.addColorStop(0, mix(S, M, 0.3)); pg.addColorStop(0.45, S); pg.addColorStop(1, mix(S, M, 0.16));
  x.fillStyle = pg; x.fillRect(cx - pw / 2, py, pw, ph);
  x.save(); x.translate(cx, py); x.scale(1, 0.24);
  x.fillStyle = mix(S, M, 0.35); x.beginPath(); x.arc(0, 0, pw / 2, 0, Math.PI * 2); x.fill(); x.restore();
  // TEK rim highlight — ürünü fondan ayıran çizgi
  x.strokeStyle = rgba(H, 0.95); x.lineWidth = 1.8;
  x.beginPath(); x.moveTo(cx + pw / 2 - 1, py + 2); x.lineTo(cx + pw / 2 - 1, py + ph); x.stroke();
  // softbox yansıması: yüzeyde yumuşak dikey dörtgen
  x.fillStyle = rgba(H, 0.2); x.fillRect(cx - pw * 0.32, py + ph * 0.08, pw * 0.2, ph * 0.7);
  // zemin yansıması
  const rg = x.createLinearGradient(0, py + ph, 0, py + ph + ph * 0.5);
  rg.addColorStop(0, rgba(S, 0.3)); rg.addColorStop(1, rgba(S, 0));
  x.fillStyle = rg; x.fillRect(cx - pw / 2, py + ph, pw, ph * 0.5);
  x.fillStyle = A; x.fillRect(cx - pw * 0.18, h * 0.88, pw * 0.36, 2.4); // tek accent imza çizgisi
};

// Sports: gym gerçeği — tavan floresan sırası, sert alçak rake, ter kıvılcımı, ring halatları.
const sports_energy_real: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  vgrad(x, w, 0, h, [[0, mix(S, M, 0.24)], [0.4, S], [1, mix(S, '#000000', 0.3)]]);
  // tavan floresan bataryası: soğuk dikdörtgen sıra + bloom
  for (let i = 0; i < 5; i++) {
    const px = w * (0.08 + i * 0.19);
    glow(x, px + w * 0.045, h * 0.09, h * 0.12, H, 0.3);
    x.fillStyle = mix(H, M, 0.15); x.fillRect(px, h * 0.06, w * 0.09, h * 0.045);
  }
  // ring halatları: gerilmiş yatay hatlar
  x.strokeStyle = rgba(M, 0.6); x.lineWidth = 2;
  for (const y of [h * 0.48, h * 0.58, h * 0.68]) {
    x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke();
  }
  // koyu omuz formu + sağdan SERT rim (alçak key)
  x.fillStyle = mix(S, '#000000', 0.4);
  x.save(); x.translate(w * 0.6, h * 0.86); x.scale(1.7, 1.1);
  x.beginPath(); x.arc(0, 0, h * 0.26, Math.PI, 0); x.fill(); x.restore();
  x.strokeStyle = rgba(H, 0.9); x.lineWidth = 2.4;
  x.save(); x.translate(w * 0.6, h * 0.86); x.scale(1.7, 1.1);
  x.beginPath(); x.arc(0, 0, h * 0.26, Math.PI * 1.55, Math.PI * 1.95); x.stroke(); x.restore();
  glow(x, w * 0.95, h * 0.55, h * 0.3, H, 0.16); // kaynağın kendisi sağda
  speck(x, R, w * 0.45, h * 0.5, w * 0.8, h * 0.85, 12, H, 0.3, 0.7, 0.6, 1.2); // ter/tebeşir kıvılcımı
  x.fillStyle = rgba(A, 0.85); // kırmızı eldiven yayı
  x.save(); x.translate(w * 0.78, h * 0.62); x.rotate(0.4);
  x.beginPath(); x.arc(0, 0, h * 0.07, 0, Math.PI * 2); x.fill(); x.restore();
  vign(x, w, h, '#000000', 0.42);
};

// Automotive: GÖVDE BİR AYNADIR — omuz hattında kayan çevre yansıması, tek kırmızı lamba imzası.
const automotive_hero_real: WorldPainter = (x, w, h, [S, M, A, H]) => {
  vgrad(x, w, 0, h * 0.5, [[0, mix(M, H, 0.3)], [1, mix(M, S, 0.4)]]); // soğuk gök bandı
  // gövde: alt yarıyı kaplayan koyu kavis
  x.fillStyle = mix(S, '#000000', 0.2);
  x.beginPath(); x.moveTo(0, h);
  x.lineTo(0, h * 0.62);
  x.bezierCurveTo(w * 0.3, h * 0.38, w * 0.72, h * 0.4, w, h * 0.58);
  x.lineTo(w, h); x.closePath(); x.fill();
  // yansıma bandı: gövdenin omzunda kayan gökyüzü — ayna kanıtı
  x.save();
  x.beginPath(); x.moveTo(0, h); x.lineTo(0, h * 0.62);
  x.bezierCurveTo(w * 0.3, h * 0.38, w * 0.72, h * 0.4, w, h * 0.58); x.lineTo(w, h); x.closePath(); x.clip();
  x.strokeStyle = rgba(H, 0.85); x.lineWidth = 3;
  x.beginPath(); x.moveTo(0, h * 0.66);
  x.bezierCurveTo(w * 0.3, h * 0.42, w * 0.72, h * 0.44, w, h * 0.62); x.stroke(); // omuz hattı running highlight
  x.strokeStyle = rgba(mix(M, H, 0.4), 0.4); x.lineWidth = 7;
  x.beginPath(); x.moveTo(0, h * 0.72);
  x.bezierCurveTo(w * 0.3, h * 0.5, w * 0.72, h * 0.52, w, h * 0.68); x.stroke(); // yumuşak çevre yansıması
  x.strokeStyle = rgba(S, 0.9); x.lineWidth = 2.2; // yansıma kırılması: keskin koyu hat
  x.beginPath(); x.moveTo(0, h * 0.69);
  x.bezierCurveTo(w * 0.3, h * 0.46, w * 0.72, h * 0.48, w, h * 0.65); x.stroke();
  x.restore();
  glow(x, w * 0.88, h * 0.56, h * 0.1, A, 0.7); // lamba imzası
  x.fillStyle = A; x.fillRect(w * 0.84, h * 0.55, w * 0.07, 2.6);
  vgrad(x, w, h * 0.86, h, [[0, 'rgba(0,0,0,0)'], [1, rgba(S, 0.7)]]); // yol
};

/* =============================================================
   REGISTRY — DATA.worlds sırası, her dünya KENDİ painter'ı.
   ============================================================= */
export const WORLD_PAINTERS: Record<string, WorldPainter> = {
  pixar_3d_edu,
  paper_craft_popup,
  ghibli_hayao,
  arcane_fortiche,
  spiderverse_sony,
  jjk_mappa,
  demon_slayer_ufotable,
  one_piece_toei,
  deakins_naturalist,
  fincher_precision,
  wes_anderson_symmetric,
  chivo_naturalist_handheld,
  kurzgesagt_edu,
  whiteboard_explainer,
  retro_anime_film,
  motion_design_flat,
  ukiyo_e_print,
  laika_stopmotion,
  naruto_shinobi_world,
  aot_wall_world,
  solo_leveling_gate,
  bleach_soul_world,
  cyberpunk_neon_noir,
  vintage_comic_book,
  claymation_aardman,
  noir_high_contrast,
  watercolor_storybook,
  sci_fi_hard_surface,
  synthwave_retro_80s,
  low_poly_ps1,
  rick_morty_scifi,
  invincible_hero_comic,
  castlevania_gothic,
  edu_promo_real,
  kurumsal_brand_film,
  civic_promo_real,
  appetite_tabletop_real,
  product_brand_real,
  sports_energy_real,
  automotive_hero_real,
  nature_doc_real,
  science_viz_real,
  archival_newsreel,
  technical_cutaway,
  shinkai_photoreal_anime,
  period_reconstruction,
};

/** Gelecek dünyalar için yasa kartı — painter yazılana dek palet + tohumla nötr kimlik.
 *  (Sözleşme testi her DATA dünyasının ADANMIŞ painter'ı olmasını şart koşar; bu sadece güvenlik ağı.) */
const lawCard: WorldPainter = (x, w, h, [S, M, A, H], seed) => {
  const R = mulberry32(seed);
  fillAll(x, w, h, mix(S, M, 0.3));
  poly(x, [[0, h], [w * (0.3 + R() * 0.3), 0], [w, 0], [w, h]]);
  x.fillStyle = mix(S, M, 0.55); x.fill();
  x.fillStyle = A; x.beginPath(); x.arc(w * (0.55 + R() * 0.2), h * (0.3 + R() * 0.3), h * 0.12, 0, Math.PI * 2); x.fill();
  x.fillStyle = rgba(H, 0.8); x.fillRect(w * 0.1, h * 0.78, w * (0.2 + R() * 0.2), 2);
};

function fillAll2(x: Ctx, x0: number, y0: number, ww: number, hh: number, color: string): void {
  x.fillStyle = color; x.fillRect(x0, y0, ww, hh);
}

/** Dünyanın palette_lock dörtlüsü — plaka renklerinin tek kaynağı (SADECE okuma). */
export function worldPlateColors(worldId: string): PlateColors {
  const world = DATA.worlds.find((w) => w.id === worldId);
  const p = world?.palette_lock;
  return p
    ? [p.shadow, p.mid, p.accent, p.highlight]
    : ['#241a10', '#45311d', '#d6a84f', '#ffe6a3'];
}

/** Ana giriş: worldId → o dünyanın görsel yasası, verilen ctx'e boyanır. Deterministik. */
export function paintWorldIdentity(x: Ctx, w: number, h: number, worldId: string, colors?: PlateColors): void {
  const painter = WORLD_PAINTERS[worldId] ?? lawCard;
  painter(x, w, h, colors ?? worldPlateColors(worldId), worldSeed(worldId));
}
