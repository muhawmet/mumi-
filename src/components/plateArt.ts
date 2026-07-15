/* =============================================================
   plateArt — Phase-0 plakalarının BOYANMIŞ hali.
   CSS gradyan plaka dossier boyunda "generated" okunuyordu;
   burada DioramaStage'in painterly stamp tekniğinin 2D sürümü
   plakayı gerçek ışıkla boyar: katmanlı gök, LIT bulut sokakları,
   ufuk pusu, batan güneş, deniz glitter yolu, silüet burunlar.
   Palet fiziksel ışık dili olarak çevrilir (Palette Translation Law:
   ham hex sadece burada — plaka/dossier katmanında — yaşar; prompt
   yoluna girmez). Accent asla bant basmaz: TEK vuruş (bulut alt-yüzü
   + güneş halosu) — "afiş" değil film karesi.
   ============================================================= */

export interface PlateArtInput {
  /** [shadow, mid, accent, highlight] — plateRecipe.colors */
  colors: readonly [string, string, string, string];
  /** Deterministik kompozisyon tohumu (preset id hash'i). */
  seed: number;
  /** Güneşin yatay konumu (%). */
  sunX: number;
  /** Ufuk yüksekliği (%). */
  horizon: number;
}

/* — saf yardımcılar — */
function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rgbOf(hex: string): [number, number, number] {
  const p = hex.replace('#', '');
  return [parseInt(p.slice(0, 2), 16), parseInt(p.slice(2, 4), 16), parseInt(p.slice(4, 6), 16)];
}
export function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = rgbOf(a), [br, bg, bb] = rgbOf(b);
  const h = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${h(ar + (br - ar) * t)}${h(ag + (bg - ag) * t)}${h(ab + (bb - ab) * t)}`;
}
function rgba(hex: string, a: number): string {
  const [r, g, b] = rgbOf(hex);
  return `rgba(${r},${g},${b},${a})`;
}
/** 0..1 arası kaba doygunluk — yüksek kromalı paletlerde (vibrant_edu) ham bant
 *  basmamak için karışım oranını ölçekler: renk ne kadar cırtlaksa o kadar pusa erir. */
export function chromaOf(hex: string): number {
  const [r, g, b] = rgbOf(hex);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return mx === 0 ? 0 : (mx - mn) / mx;
}

/** Kompozisyonun deterministik iskeleti — test edilebilir saf katman.
 *  Aynı seed → aynı plaka; farklı preset'ler farklı kompozisyon (öksüz plaka yok). */
export interface PlateComposition {
  cloudBands: Array<{ y: number; count: number; scale: number }>;
  ridgeSide: -1 | 1;          // silüet burun güneşin TERSİNE oturur (güneşi kesmez)
  ridgeHeight: number;        // ufka göre yükseklik oranı
  ridgeWidth: number;
  glitterStrength: number;    // deniz parıltı yolu yoğunluğu
  hazeLift: number;           // ufuk pus bandının gücü
}
export function plateComposition(seed: number, sunX: number): PlateComposition {
  const R = mulberry32(seed);
  const bandCount = 2 + (seed % 2); // 2-3 bulut sokağı
  return {
    cloudBands: Array.from({ length: bandCount }, (_, i) => ({
      y: 0.14 + i * (0.5 / bandCount) + R() * 0.08,
      count: 10 + Math.floor(R() * 9),
      scale: 0.8 + R() * 0.6,
    })),
    ridgeSide: sunX >= 50 ? -1 : 1,
    ridgeHeight: 0.13 + R() * 0.12,
    ridgeWidth: 0.38 + R() * 0.24,
    glitterStrength: 0.7 + R() * 0.5,
    hazeLift: 0.12 + R() * 0.10,
  };
}

function rad(x: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  const m = color.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
  const outer = m ? `rgba(${m[1]},${m[2]},${m[3]},0)` : 'rgba(255,255,255,0)';
  const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, color); g.addColorStop(1, outer);
  x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2);
}
function stamp(x: CanvasRenderingContext2D, cx: number, cy: number, r: number, sx: number, sy: number, rot: number, color: string) {
  x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(sx, sy); rad(x, 0, 0, r, color); x.restore();
}

/** Plakayı verilen 2D context'e boyar (w×h piksel). Deterministik: aynı input → aynı kare. */
export function paintPlate(x: CanvasRenderingContext2D, w: number, h: number, input: PlateArtInput): void {
  const [shadow, mid, accent, highlight] = input.colors;
  const comp = plateComposition(input.seed, input.sunX);
  const R = mulberry32(input.seed ^ 0x9e3779b9);
  const sunX = (input.sunX / 100) * w;
  const hz = (input.horizon / 100) * h;
  const sunY = hz - h * 0.045;

  // Cırtlak orta-ton pusa erisin: krom arttıkça mid gök yüzeyine daha kırık girer
  // (nötr paletler kendi tonunu KORUR — battaniye desaturasyon yok, poster de yok).
  const midCalm = mixHex(mid, mixHex(shadow, highlight, 0.55), 0.10 + 0.32 * chromaOf(mid));
  const accCalm = mixHex(accent, highlight, 0.22 + 0.30 * chromaOf(accent));

  // 1) Gök: alacakaranlık zirvesi → orta ton → ufuk közü (dikey ışık düşüşü;
  //    ufka doğru BEYAZ değil accent-sıcağına ısınır — kimlik ufukta yaşar)
  const sky = x.createLinearGradient(0, 0, 0, hz);
  sky.addColorStop(0, mixHex(shadow, midCalm, 0.30));
  sky.addColorStop(0.45, mixHex(shadow, midCalm, 0.62));
  sky.addColorStop(0.8, mixHex(midCalm, accCalm, 0.22));
  sky.addColorStop(1, mixHex(mixHex(midCalm, accCalm, 0.45), highlight, 0.18));
  x.fillStyle = sky; x.fillRect(0, 0, w, hz + 1);

  // 2) Deniz: ufuktan izleyiciye kararan su
  const sea = x.createLinearGradient(0, hz, 0, h);
  sea.addColorStop(0, mixHex(shadow, midCalm, 0.4));
  sea.addColorStop(0.35, mixHex(shadow, midCalm, 0.16));
  sea.addColorStop(1, mixHex(shadow, '#000000', 0.42));
  x.fillStyle = sea; x.fillRect(0, hz, w, h - hz);

  // 3) Ufuk pus bandı — batan güneşin atmosferik ezilmesi (screen: ışık ekler)
  x.globalCompositeOperation = 'screen';
  const haze = x.createLinearGradient(0, hz - h * 0.16, 0, hz + h * 0.05);
  haze.addColorStop(0, 'rgba(0,0,0,0)');
  haze.addColorStop(0.75, rgba(mixHex(accCalm, highlight, 0.5), comp.hazeLift));
  haze.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = haze; x.fillRect(0, hz - h * 0.16, w, h * 0.21);

  // 4) Güneş: akkor çekirdek + katmanlı halo (accent TEK vuruşunu burada yaşar)
  rad(x, sunX, sunY, h * 0.5, rgba(accCalm, 0.17));
  rad(x, sunX, sunY, h * 0.28, rgba(mixHex(accCalm, highlight, 0.5), 0.32));
  rad(x, sunX, sunY, h * 0.13, rgba(mixHex(highlight, '#ffffff', 0.35), 0.75));
  rad(x, sunX, sunY, h * 0.055, rgba('#fff7e6', 0.95));
  x.globalCompositeOperation = 'source-over';

  // 5) LIT bulut sokakları — gövde gölgede, güneşe dönük alt-yüz yanar (poster değil boya)
  const cloudBody = mixHex(shadow, midCalm, 0.5);
  for (const band of comp.cloudBands) {
    const cy0 = band.y * hz;
    for (let i = 0; i < band.count; i++) {
      const cx = R() * w * 1.08 - 0.04 * w;
      const cy = cy0 + (R() - 0.5) * hz * 0.12;
      const d = Math.min(1, Math.hypot(cx - sunX, cy - sunY) / (w * 0.62));
      const lit = 1 - d;
      const r = (3 + R() * 6) * band.scale * (h / 100);
      const ex = 3 + R() * 4.4, ey = 0.7 + R() * 0.5;
      const rot = (R() - 0.5) * 0.14;
      stamp(x, cx, cy, r, ex, ey, rot, rgba(cloudBody, 0.07 + R() * 0.1));
      if (lit > 0.15 && R() > 0.3) {
        stamp(x, cx + (sunX > cx ? r : -r) * 0.6, cy + r * 0.5, r * 0.75, ex * 0.9, ey * 0.65, rot,
          rgba(mixHex(accCalm, highlight, 0.45), (0.08 + R() * 0.12) * lit));
      }
      if (R() > 0.62) stamp(x, cx, cy - r * 0.5, r * 0.6, ex * 0.85, ey * 0.55, rot, rgba(mixHex(highlight, '#ffffff', 0.2), 0.04 + R() * 0.05));
    }
  }

  // 6) Silüet burun — güneşin tersine, aerial perspective (uzak katman + koyu yakın katman)
  const side = comp.ridgeSide;
  const baseX = side === -1 ? 0 : w;
  const drawRidge = (width: number, height: number, tone: string, seedOff: number) => {
    const Rr = mulberry32(input.seed + seedOff);
    const segs = 14;
    x.fillStyle = tone;
    x.beginPath();
    x.moveTo(baseX, hz + 1);
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const px = baseX + side * width * t;
      const env = Math.sin(Math.min(1, t * 1.25) * Math.PI); // uçta sıfıra iner — kutu silüet yok
      const py = hz + 1 - height * env * (0.55 + Rr() * 0.5);
      x.lineTo(px, py);
    }
    x.lineTo(baseX + side * width, hz + 1);
    x.closePath(); x.fill();
  };
  drawRidge(w * (comp.ridgeWidth + 0.16), h * comp.ridgeHeight * 0.7, rgba(mixHex(shadow, midCalm, 0.42), 0.85), 101);
  drawRidge(w * comp.ridgeWidth, h * comp.ridgeHeight, rgba(mixHex(shadow, '#100a06', 0.5), 0.95), 47);

  // 7) Deniz glitter yolu — güneşin altında ufuktan genişleyen feathered parıltı
  x.globalCompositeOperation = 'screen';
  const glints = Math.floor(46 * comp.glitterStrength);
  for (let i = 0; i < glints; i++) {
    const t = Math.pow(R(), 1.3);
    const gy = hz + 1.5 + t * (h - hz - 2);
    const spread = 2 + t * w * 0.16;
    const gx = sunX + (R() - 0.5) * spread;
    const a = (0.08 + R() * 0.2) * (1 - t * 0.4);
    stamp(x, gx, gy, 1 + R() * 1.6, 1.6 + t * 2.6, 0.35, 0, rgba(mixHex(highlight, '#ffffff', 0.3), a));
  }
  // yansıma sütunu — hemen ufuk altı
  rad(x, sunX, hz + h * 0.06, h * 0.14, rgba(mixHex(accCalm, highlight, 0.6), 0.22));
  x.globalCompositeOperation = 'source-over';

  // 8) Kenar karartması — plaka kendi vinyetini taşır (film karesi çerçevesi)
  const vg = x.createRadialGradient(w * 0.5, h * 0.46, Math.min(w, h) * 0.42, w * 0.5, h * 0.55, Math.max(w, h) * 0.78);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, rgba(mixHex(shadow, '#000000', 0.5), 0.34));
  x.fillStyle = vg; x.fillRect(0, 0, w, h);
}
