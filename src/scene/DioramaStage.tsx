import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import {
  AdditiveBlending, BackSide, CanvasTexture, Color, SRGBColorSpace,
  type DirectionalLight, type Mesh, type Sprite, type SpriteMaterial,
} from 'three';
import { LOOK } from './lookConfig';
import { useSunStore } from './sunRef';
import { type ScenePalette } from './scenePalette';
import { useScenePalette } from './useScenePalette';
import { SeaSurface } from './SeaSurface';

/* ============================================================
   ALTIN-SAAT TABLEAU (B2) — atölye emekli, F dili geldi.
   Boyalı alacakaranlık gökyüzü + ufukta batan güneş + sıcak deniz.
   Yüzen tablolar (hero/river/logo) KALDIRILDI — Mami kararı:
   saf Turner deniz-manzarası, tablo dekoru yok.
   ============================================================ */

/** Güneşin dünya-uzayı konumu — sağ-üstte; god-ray (B3) buna bağlanır. */
const SUN_POS: readonly [number, number, number] = [6.2, 3.4, -30];

/* — canvas boyama yardımcıları (demo-f painterly stamp tekniği) — */
function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** Aynı hue'ya alpha0 fade eden radyal (gri saçak yok). */
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
function chMix(a: string, b: string, t: number): string {
  const pa = a.replace('#', ''), pb = b.replace('#', '');
  const ar = parseInt(pa.slice(0, 2), 16), ag = parseInt(pa.slice(2, 4), 16), ab = parseInt(pa.slice(4, 6), 16);
  const br = parseInt(pb.slice(0, 2), 16), bg = parseInt(pb.slice(2, 4), 16), bb = parseInt(pb.slice(4, 6), 16);
  const h = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${h(ar + (br - ar) * t)}${h(ag + (bg - ag) * t)}${h(ab + (bb - ab) * t)}`;
}
function rgbOf(hex: string): [number, number, number] {
  const p = hex.replace('#', '');
  return [parseInt(p.slice(0, 2), 16), parseInt(p.slice(2, 4), 16), parseInt(p.slice(4, 6), 16)];
}

/** V4 canlı altın-saat gökyüzü (BotW: "pus ışıktır"). Serin cerulean zenit → erimiş altın
 *  ufuk → LIT bulutlar (umber değil). palette'ten renklenir; slot 'backdrop-sky' varsa devralır. */
function makeSkyTexture(p: ScenePalette): CanvasTexture {
  const w = 2048, h = 1024;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d')!;
  const R = mulberry32(1907);

  const g = x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0.00, p.skyTop);
  g.addColorStop(0.20, chMix(p.skyTop, p.skyMid, 0.5));
  g.addColorStop(0.38, p.skyMid);
  g.addColorStop(0.52, chMix(p.skyMid, p.horizonGlow, 0.55));
  g.addColorStop(0.62, chMix(p.skyMid, p.horizonGlow, 0.82));
  g.addColorStop(0.675, p.horizonGlow);
  g.addColorStop(0.700, chMix(p.horizonGlow, '#ffffff', 0.14));
  g.addColorStop(0.725, chMix(p.horizonGlow, p.sunHalo, 0.55));
  g.addColorStop(0.78, chMix(p.horizonGlow, p.skyTop, 0.3));
  g.addColorStop(0.86, chMix(p.horizonGlow, p.skyTop, 0.58));
  g.addColorStop(1.00, chMix(p.skyTop, '#2a2a30', 0.45));
  x.fillStyle = g; x.fillRect(0, 0, w, h);

  // Ufuk güneş-glow (screen-blend) — UFKA HAPSEDİLİ (h-bazlı yarıçap), üst gök cerulean kalsın.
  const sunX = 0.62 * w, sunY = 0.70 * h;
  x.globalCompositeOperation = 'screen';
  rad(x, sunX, sunY, 0.34 * h, chToRgba(p.sunHalo, 0.28));
  rad(x, sunX, sunY, 0.16 * h, chToRgba(p.sunHalo, 0.45));
  rad(x, sunX, sunY, 0.07 * h, chToRgba(p.sunCore, 0.7));
  x.globalCompositeOperation = 'source-over';

  // LIT bulut sokakları: mavi-gri gövde + güneşe dönük altın alt-yüz + krem tepe (BotW cumulus)
  const cloudLit = p.horizonGlow, cloudShadow = chMix(p.skyTop, '#8a96a8', 0.5);
  const bands = [
    { yc: 0.135, hh: 0.075, amp: 1.0 }, { yc: 0.265, hh: 0.085, amp: 1.1 },
    { yc: 0.395, hh: 0.070, amp: 1.0 }, { yc: 0.500, hh: 0.055, amp: 0.85 }, { yc: 0.575, hh: 0.040, amp: 0.7 },
  ];
  for (const b of bands) {
    const n = Math.floor(70 * b.amp);
    for (let i = 0; i < n; i++) {
      const cx = R() * w * 1.1 - 0.05 * w;
      const cy = (b.yc + (R() - 0.5) * 2 * b.hh) * h;
      const d = Math.hypot(cx - sunX, cy - sunY) / (0.62 * w);
      const lit = Math.max(0, 1 - d);
      const r = 9 + R() * 24;
      const ex = 3.4 + R() * 5.0, ey = 0.8 + R() * 0.5;
      const rot = (R() - 0.5) * 0.12;
      stamp(x, cx, cy, r, ex, ey, rot, chToRgba(cloudShadow, (0.03 + R() * 0.05)));
      if (lit > 0.12 && R() > 0.35) {
        stamp(x, cx + (sunX > cx ? 6 : -6), cy + 5 + R() * 5, r * 0.8, ex * 0.95, ey * 0.7, rot, chToRgba(cloudLit, (0.05 + R() * 0.08) * lit));
      }
      if (R() > 0.6) stamp(x, cx, cy - 6, r * 0.7, ex * 0.9, ey * 0.6, rot, chToRgba('#fff6e6', 0.04 + R() * 0.04));
    }
  }
  // yüksek cirrus + zenit komplement nefesi
  for (let i = 0; i < 60; i++) stamp(x, R() * w, (0.06 + R() * 0.28) * h, 7 + R() * 12, 5 + R() * 6, 0.5, (R() - 0.5) * 0.25, chToRgba('#ffe4b9', 0.03 + R() * 0.03));
  for (let i = 0; i < 40; i++) stamp(x, R() * w * 0.85, (0.03 + R() * 0.18) * h, 8 + R() * 12, 4 + R() * 5, 0.55, (R() - 0.5) * 0.2, chToRgba('#96b4cd', 0.03 + R() * 0.02));

  // (Baked grain kaldırıldı — pürüzsüz gökte crosshatch deseni "karıncalanma" okuyordu;
  //  Mami hassas. Painterly his bulut stamp'lerinden ve gradyandan geliyor, grain'siz.)

  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}
function chToRgba(hex: string, a: number): string { const [r, g, b] = rgbOf(hex); return `rgba(${r},${g},${b},${a})`; }

/** Radyal ışıma sprite dokusu (güneş glow + çerçeve halosu + polen). */
/** BEYAZ radyal glow — material.color ile tint edilir (world-lerp texture regen'siz). */
function makeWhiteGlow(size = 128): CanvasTexture {
  const c = document.createElement('canvas'); c.width = size; c.height = size;
  const x = c.getContext('2d')!;
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
}
/** Crepuscular ışın yelpazesi (demo-f port): 6 feathered spoke, BEYAZ (sunHalo ile tint). */
function makeRayburst(): CanvasTexture {
  const s = 1024; const c = document.createElement('canvas'); c.width = s; c.height = s;
  const x = c.getContext('2d')!; x.translate(s / 2, s / 2);
  const spokes = [{ a: 2.19, w: 0.05, o: 0.42 }, { a: 2.52, w: 0.078, o: 0.34 }, { a: 2.9, w: 0.06, o: 0.3 }, { a: 1.86, w: 0.042, o: 0.3 }, { a: 1.55, w: 0.055, o: 0.22 }, { a: 3.35, w: 0.048, o: 0.18 }];
  for (const sp of spokes) {
    x.save(); x.rotate(-sp.a);
    for (const [wf, of2] of [[1.9, 0.3], [1.0, 0.38], [0.45, 0.42]] as const) {
      const g = x.createLinearGradient(0, 0, s * 0.5, 0);
      g.addColorStop(0, `rgba(255,255,255,${sp.o * of2})`); g.addColorStop(0.45, `rgba(255,255,255,${sp.o * of2 * 0.5})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, s * 0.5, -sp.w * wf, sp.w * wf); x.closePath(); x.fill();
    }
    x.restore();
  }
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
}
/** Martı silüeti (iki quad stroke) — uzak, sessiz, canlı. */
function makeBirdTexture(): CanvasTexture {
  const s = 64; const c = document.createElement('canvas'); c.width = s; c.height = s;
  const x = c.getContext('2d')!; x.clearRect(0, 0, s, s);
  x.strokeStyle = 'rgba(255,255,255,1)'; x.lineWidth = 3; x.lineCap = 'round';
  x.beginPath(); x.moveTo(10, 36); x.quadraticCurveTo(26, 22, 32, 33); x.quadraticCurveTo(38, 22, 54, 36); x.stroke();
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
}
/** Kuş başına deterministik varyasyon — 5 klonun aynı hizada uçması clip-art okunuyordu.
 *  Her kuşun kendi boyu, irtifası, periyodu, kanat temposu ve dikey salınımı var (gevşek V düzeni). */
interface BirdFlight { size: number; alt: number; period: number; phase: number; flapHz: number; bob: number; depth: number; drift: number }
function birdFlights(n: number): BirdFlight[] {
  const R = mulberry32(4242);
  return Array.from({ length: n }, (_, i) => ({
    size: 1.1 + R() * 1.3,                    // 1.1–2.4: yakın-uzak karışık
    alt: 6.2 + i * 0.55 + (R() - 0.5) * 1.6,  // gevşek merdiven — düz çizgi değil
    period: 46 + R() * 22,                    // herkes kendi hızında
    phase: i * 5.5 + R() * 9,
    flapHz: 3.6 + R() * 2.2,
    bob: 0.35 + R() * 0.5,                    // termalde süzülme salınımı
    depth: -26 - R() * 8,
    drift: (R() - 0.5) * 6,                   // rota merkezi kayması
  }));
}
function Bird({ tex, f }: { tex: CanvasTexture; f: BirdFlight }) {
  const ref = useRef<Sprite>(null);
  const matRef = useRef<SpriteMaterial>(null);
  useFrame(({ clock }) => {
    const p = ((clock.elapsedTime + f.phase) % f.period) / f.period;
    if (ref.current) {
      ref.current.position.set(
        -24 + 48 * p + f.drift,
        f.alt + 2.2 * p + Math.sin(clock.elapsedTime * 0.6 + f.phase) * f.bob,
        f.depth - 3 * p,
      );
      // kanat: çırpış + süzülme (her kuş kendi temposunda, ara ara kanat kilitler)
      const beat = Math.sin(clock.elapsedTime * f.flapHz + f.phase * 1.7);
      const glide = 0.55 + 0.45 * Math.abs(beat);
      ref.current.scale.set(f.size, f.size * glide, 1);
    }
    if (matRef.current) matRef.current.opacity = (0.28 + f.size * 0.1) * Math.max(0, Math.min(1, Math.min(p / 0.15, (1 - p) / 0.15)));
  });
  return <sprite ref={ref}><spriteMaterial ref={matRef} map={tex} color={'#2a2018'} transparent opacity={0} depthWrite={false} fog={false} /></sprite>;
}
/** Uzak martı sürüsü — güneşin üstünden geçer, diski asla kesmez. */
function Birds() {
  const tex = useMemo(() => makeBirdTexture(), []);
  const flights = useMemo(() => birdFlights(6), []);
  return <>{flights.map((f, i) => <Bird key={i} tex={tex} f={f} />)}</>;
}


/** Painterly kümülüs dokusu — SkyDome ile aynı stamp fırçası, ama AYRI derinlik
 *  katmanında yaşayan serbest bulut. Gövde gölgesi + güneşe dönük alt-yüz + krem tepe. */
function makeCloudTexture(seed: number, p: ScenePalette): CanvasTexture {
  const w = 512, hh = 256;
  const c = document.createElement('canvas'); c.width = w; c.height = hh;
  const x = c.getContext('2d')!; const R = mulberry32(seed);
  x.clearRect(0, 0, w, hh);
  const shadow = chMix(p.skyTop, '#8a96a8', 0.55);
  const lit = p.horizonGlow;
  // yatay mercek zarfı: merkezde yoğun, uçlara doğru seyrelen yığın
  const n = 90;
  for (let i = 0; i < n; i++) {
    const t = R();
    const cx = w * (0.5 + (t - 0.5) * (0.72 + R() * 0.2));
    const env = Math.sin(Math.PI * Math.min(1, Math.max(0, (cx / w))));
    const cy = hh * (0.52 + (R() - 0.5) * 0.3 * env);
    const r = (7 + R() * 15) * (0.5 + env * 0.8);
    const ex = 2.6 + R() * 3.2, ey = 0.75 + R() * 0.45;
    const rot = (R() - 0.5) * 0.14;
    stamp(x, cx, cy, r, ex, ey, rot, chToRgba(shadow, 0.09 + R() * 0.11));
    if (R() > 0.4) stamp(x, cx + 4, cy + r * 0.55, r * 0.75, ex * 0.9, ey * 0.65, rot, chToRgba(lit, 0.10 + R() * 0.12));
    if (R() > 0.55) stamp(x, cx - 2, cy - r * 0.5, r * 0.6, ex * 0.85, ey * 0.55, rot, chToRgba('#fff6e6', 0.08 + R() * 0.07));
  }
  const t2 = new CanvasTexture(c); t2.colorSpace = SRGBColorSpace; return t2;
}

interface CloudSpec { seed: number; z: number; y: number; x0: number; sw: number; sh: number; drift: number; op: number }
/** 3 serbest bulut — pişmiş kubbe ile sırtlar ARASINDA gerçek derinlik katmanı.
 *  Kamera step değiştirince kubbeden AYRIŞIRLAR (gerçek parallax); sabit bakışta
 *  kendi hızlarında süzülürler (yakın olan hızlı — derinlik ipucu). Güneş diskinin
 *  üstünde uçarlar, diski asla kapatmazlar (y ≥ 5.6). */
const CLOUD_SPECS: readonly CloudSpec[] = [
  { seed: 301, z: -22, y: 6.0, x0: -13, sw: 15, sh: 4.6, drift: 0.062, op: 0.5 },
  { seed: 502, z: -30, y: 7.4, x0: 5, sw: 21, sh: 6.0, drift: 0.041, op: 0.55 },
  { seed: 707, z: -38, y: 6.6, x0: 17, sw: 14, sh: 4.2, drift: 0.028, op: 0.45 },
];
function Cloud({ spec, palette }: { spec: CloudSpec; palette: ScenePalette }) {
  const tex = useMemo(() => makeCloudTexture(spec.seed, palette), [spec.seed, palette]);
  /* Scene fog quad'ın TAMAMINI yer (z -22..-38 → fogF .66-1: bulut görünmez olur;
     SkyDome'un fog={false} olması aynı sebep). Aerial erime tinte pişer: uzak
     bulut doğuştan sise karışmış renkte — hava yine kazanır, quad kaybolmaz. */
  const aerial = Math.min(1, Math.max(0, (-spec.z - 14) / 34));
  const tint = useMemo(() => chMix('#ffffff', palette.fog, aerial * 0.55), [palette, aerial]);
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ref.current) {
      // yavaş yatay süzülme (sarmal değil, ileri-geri uzun salınım) + minik dikey nefes
      ref.current.position.set(
        spec.x0 + Math.sin(t * spec.drift + spec.seed) * 6,
        spec.y + Math.sin(t * 0.05 + spec.seed * 0.7) * 0.25,
        spec.z,
      );
    }
  });
  return (
    <mesh ref={ref} position={[spec.x0, spec.y, spec.z]}>
      <planeGeometry args={[spec.sw, spec.sh]} />
      <meshBasicMaterial map={tex} color={tint} transparent opacity={spec.op} depthWrite={false} fog={false} toneMapped={false} />
    </mesh>
  );
}
function CloudBank({ palette }: { palette: ScenePalette }) {
  return <>{CLOUD_SPECS.map((spec) => <Cloud key={spec.seed} spec={spec} palette={palette} />)}</>;
}

/** Gökyüzü kubbesi: boyalı gradyan (slot yoksa) ya da 'backdrop-sky' dokusu.
 *  fog=false ŞART (sis kubbeyi yutmasın); toneMapped=false (palete boyalı gelir). */
function SkyDome({ palette }: { palette: ScenePalette }) {
  // V4: tableau'nun gökyüzü PROSEDÜREL + world-adaptif. Eski atölye-dönemi backdrop-sky.webp
  // (koyu "mesai gecesi" yağlıboya) artık ezmez — sabit+adaptif-değil, canlı BotW'ye aykırı.
  // Slot sistemi tanımlı kalır (Muhammet adaptif-uyumlu bir gök asseti verirse buraya bağlanır).
  const painted = useMemo(() => makeSkyTexture(palette), [palette]);
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += 0.0035 * dt; }); // çok yavaş sürüklenme — bulutlar yaşasın
  return (
    <mesh ref={ref} rotation={[0, Math.PI * 0.5, 0]}>
      <sphereGeometry args={[60, 48, 32]} />
      <meshBasicMaterial map={painted} side={BackSide} fog={false} toneMapped={false} />
    </mesh>
  );
}

/** Uzak tepe silüetleri: aerial-perspective katmanı (fog=true → uzak olan pusa erir).
 *  Güneşin SOLUNDA — güneşi/glitter'ı/çerçeve nehrini kesmez, peaks frame river altında. */
function makeRidgeTexture(seed: number, detail?: { w: number; hh: number; segs: number; smooth?: boolean }): CanvasTexture {
  const w = detail?.w ?? 512, hh = detail?.hh ?? 128, segs = detail?.segs ?? 24;
  const c = document.createElement('canvas'); c.width = w; c.height = hh;
  const x = c.getContext('2d')!; const R = mulberry32(seed);
  x.clearRect(0, 0, w, hh);
  x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(0, hh);
  const base = hh * 0.5;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= segs; i++) {
    const px = (i / segs) * w;
    // Uç zarfı: tepe yüksekliği plane kenarına doğru sıfıra iner — kenar dikey
    // "uçurum/kutu" silüeti üretemez (sin tepe noktasında kesilse bile).
    const env = Math.min(1, Math.min(i / (segs / 4.8), (segs - i) / (segs / 4.8)));
    const yLine = Math.sin((i * 24 / segs) * 0.8 + seed) * 22 + (R() - 0.5) * 14;
    pts.push([px, base + (30 + (yLine - 30) * env) * (hh / 128)]);
  }
  if (detail?.smooth) {
    // Yakın plan: üçgen zirve değil aşınmış kaya — orta-nokta quadratic yumuşatma
    x.lineTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const mx = (pts[i - 1][0] + pts[i][0]) / 2, my = (pts[i - 1][1] + pts[i][1]) / 2;
      x.quadraticCurveTo(pts[i - 1][0], pts[i - 1][1], mx, my);
    }
    x.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
  } else {
    for (const [px, py] of pts) x.lineTo(px, py);
  }
  x.lineTo(w, hh); x.closePath(); x.fill();
  // Emniyet: uçlarda YEŞİL kanalı da karart (alphaMap yeşili okur; canvas alfası
  // un-premultiply'da 255'e döner, alfa-fade Three'ye GEÇMEZ — acıyla öğrenildi).
  x.globalCompositeOperation = 'source-atop';
  const fade = x.createLinearGradient(0, 0, w, 0);
  fade.addColorStop(0, 'rgba(0,0,0,1)'); fade.addColorStop(0.1, 'rgba(0,0,0,0)');
  fade.addColorStop(0.9, 'rgba(0,0,0,0)'); fade.addColorStop(1, 'rgba(0,0,0,1)');
  x.fillStyle = fade; x.fillRect(0, 0, w, hh);
  x.globalCompositeOperation = 'source-over';
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
}
function Ridge({ position, size, color, seed, detail }: { position: [number, number, number]; size: [number, number]; color: string; seed: number; detail?: { w: number; hh: number; segs: number; smooth?: boolean } }) {
  const alpha = useMemo(() => makeRidgeTexture(seed, detail), [seed, detail]);
  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial color={color} alphaMap={alpha} transparent depthWrite={false} fog toneMapped={false} />
    </mesh>
  );
}
function Ridges({ palette }: { palette: ScenePalette }) {
  return (
    <group>
      <Ridge position={[-14, 1.4, -26]} size={[60, 6]} color={palette.ridgeNear} seed={11} />
      <Ridge position={[-8, 1.8, -34]} size={[80, 7]} color={chMix(palette.ridgeNear, palette.ridgeFar, 0.5)} seed={23} />
      <Ridge position={[2, 2.0, -44]} size={[100, 8]} color={palette.ridgeFar} seed={37} />
    </group>
  );
}

/** ORTA + YAKIN plan: kıyı adacıkları — matte-painting kırıcı derinlik merdiveni.
 *  Uzak ridge'ler (z -26/-44) tek başına "fon perdesi" okunuyordu; bu adacıklar
 *  z -16 / -9 / -7'de durur. Kamera step-pozları arasında gezerken farklı z'ler
 *  GERÇEK parallax üretir; fog=true uzaklığı havayla boyar (yeni grain yok,
 *  full-screen efekt yok — aynı ridge alpha tekniği, sadece derinlik katmanı).
 *  Konumlar güneş diskini ve glitter yolunu KESMEZ (sol taraf + sağ alt kaya). */
const NEAR_DETAIL = { w: 1024, hh: 256, segs: 56, smooth: true } as const;
function NearIslets({ palette }: { palette: ScenePalette }) {
  const nearTone = chMix(palette.ridgeNear, '#1c1109', 0.55);
  const midTone = chMix(palette.ridgeNear, '#1c1109', 0.3);
  return (
    <group>
      {/* orta plan adacığı — sol, ufuk ridge'leriyle yakın kaya arasında köprü */}
      <Ridge position={[-11, 0.75, -16]} size={[26, 3.4]} color={midTone} seed={53} detail={NEAR_DETAIL} />
      {/* yakın plan burun — sol alt, en koyu katman (sise en az bulanmış) */}
      <Ridge position={[-7.5, 0.5, -9]} size={[14, 2.2]} color={nearTone} seed={71} detail={NEAR_DETAIL} />
      {/* sağ alt küçük kaya — glitter yolunun ÖNÜNDE durur, parıltıyı çerçeveler */}
      <Ridge position={[11.5, 0.35, -7]} size={[7, 1.5]} color={nearTone} seed={89} detail={NEAR_DETAIL} />
    </group>
  );
}

/** Deniz: SeaSurface shader'ı (gerçek dalga geometrisi + fiziksel güneş yolu + fresnel).
 *  Eski düz teal plane + additive glitter ÇIKARTMASI emekli — ışık artık dalga
 *  sırtlarında KIRILIR, üstüne yapıştırılmaz. Yansıma sütunu (havadaki parlama)
 *  kalır ama kısılır: suyun kendi speküleri ana ışık artık. */
function Sea({ palette }: { palette: ScenePalette }) {
  const glow = useMemo(() => makeWhiteGlow(), []);
  const refl = useRef<Sprite>(null);
  useFrame(({ clock }) => {
    // yansıma sütunu nefes alır — su üstündeki ışık hiç sabit durmaz
    if (refl.current) (refl.current.material as SpriteMaterial).opacity = 0.16 + Math.sin(clock.elapsedTime * 0.19) * 0.04;
  });
  return (
    <group>
      <SeaSurface palette={palette} sunPos={SUN_POS} />
      {/* Yumuşak yansıma sütunu — su üstündeki HAVA parlaması (speküler değil) */}
      <sprite ref={refl} position={[SUN_POS[0], 0.05, SUN_POS[2] * 0.5 + 2]} scale={[6, 22, 1]}>
        <spriteMaterial map={glow} color={palette.sunHalo} blending={AdditiveBlending} transparent opacity={0.16} depthWrite={false} fog={false} />
      </sprite>
    </group>
  );
}

/** Batan güneş: neredeyse-beyaz çekirdek + katmanlı halo (palette ile tint) + crepuscular
 *  rayburst. Occluder disk sunMeshRef'e bağlanır (GodRays). Renk world-adaptif. */
function Sun({ palette }: { palette: ScenePalette }) {
  const glow = useMemo(() => makeWhiteGlow(), []);
  const rays = useMemo(() => makeRayburst(), []);
  const meshRef = useRef<Mesh>(null);
  const rayRef = useRef<Mesh>(null);
  const setSun = useSunStore((s) => s.setSun);
  useEffect(() => {
    setSun(meshRef.current);
    return () => setSun(null);
  }, [setSun]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (meshRef.current) meshRef.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.03);
    if (rayRef.current) {
      rayRef.current.rotation.z = Math.sin(t * 0.05) * 0.04;
      (rayRef.current.material as { opacity: number }).opacity = 0.19 + Math.sin(t * 0.13) * 0.04;
    }
  });
  return (
    <group position={[SUN_POS[0], SUN_POS[1], SUN_POS[2]]}>
      {/* crepuscular ışın yelpazesi (en arkada) */}
      <mesh ref={rayRef} position={[0, 0, -0.5]}>
        <planeGeometry args={[90, 90]} />
        <meshBasicMaterial map={rays} color={palette.sunHalo} blending={AdditiveBlending} transparent opacity={0.2} depthWrite={false} fog={false} toneMapped={false} />
      </mesh>
      {/* God-ray occluder diski — küçük tut; sert jant sıkı glow kademeleriyle atmosfere erir */}
      <mesh ref={meshRef}>
        <circleGeometry args={[1.15, 48]} />
        <meshBasicMaterial color={'#fff7e2'} toneMapped={false} fog={false} />
      </mesh>
      {/* diskin jantını yiyen sıkı iç glow — "yapıştırılmış beyaz daire" değil, akkor kaynak */}
      <sprite scale={[4.6, 4.6, 1]}>
        <spriteMaterial map={glow} color={'#fff3d8'} blending={AdditiveBlending} transparent opacity={0.9} depthWrite={false} fog={false} />
      </sprite>
      <sprite scale={[10, 10, 1]}>
        <spriteMaterial map={glow} color={palette.sunCore} blending={AdditiveBlending} transparent opacity={0.8} depthWrite={false} fog={false} />
      </sprite>
      {/* ufka yayılan yatay sıcak pus bandı — batan güneşin atmosferik ezilmesi */}
      <sprite position={[0, -0.9, 0.2]} scale={[26, 5, 1]}>
        <spriteMaterial map={glow} color={palette.horizonGlow} blending={AdditiveBlending} transparent opacity={0.4} depthWrite={false} fog={false} />
      </sprite>
      <sprite scale={[30, 30, 1]}>
        <spriteMaterial map={glow} color={palette.sunHalo} blending={AdditiveBlending} transparent opacity={0.6} depthWrite={false} fog={false} />
      </sprite>
      <sprite scale={[80, 80, 1]}>
        <spriteMaterial map={glow} color={chMix(palette.sunHalo, palette.horizonGlow, 0.5)} blending={AdditiveBlending} transparent opacity={0.3} depthWrite={false} fog={false} />
      </sprite>
    </group>
  );
}


/** GÜNEŞ anahtarı nefes alır — gerçek altın saatte ışık hiç sabit değildir.
 *  ±%5, ~80 sn periyot: fark edilmez ama sahne "canlı" hisseder. Şiddet tabanı
 *  LOOK'tan (ışık kanunu bandı), nefes runtime modülasyonu. */
function BreathingKey({ palette }: { palette: ScenePalette }) {
  const ref = useRef<DirectionalLight>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.intensity = LOOK.light.lamp * 0.16 * (1 + Math.sin(clock.elapsedTime * 0.08) * 0.05);
  });
  return (
    <directionalLight
      ref={ref}
      position={[SUN_POS[0], SUN_POS[1] + 1, SUN_POS[2] + 4]}
      color={palette.key}
      intensity={LOOK.light.lamp * 0.16}
    />
  );
}

/** Süzülen pus şeritleri — sabit bakışta atmosfer yaşasın (techy değil, hava).
 *  İki geniş, çok düşük opaklıkta sıcak bant deniz üstünde dakikalık periyotla
 *  yana süzülür + nefes alır. Additive: karartmaz, ışık ekler. */
function DriftingHaze({ palette }: { palette: ScenePalette }) {
  const glow = useMemo(() => makeWhiteGlow(), []);
  const a = useRef<Sprite>(null);
  const b = useRef<Sprite>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (a.current) {
      a.current.position.set(-4 + Math.sin(t * 0.021) * 7, 1.1 + Math.sin(t * 0.05) * 0.15, -19);
      (a.current.material as SpriteMaterial).opacity = 0.07 + Math.sin(t * 0.034 + 1.2) * 0.025;
    }
    if (b.current) {
      b.current.position.set(5 + Math.sin(t * 0.016 + 2.6) * 9, 0.8 + Math.sin(t * 0.043 + 0.5) * 0.12, -13);
      (b.current.material as SpriteMaterial).opacity = 0.055 + Math.sin(t * 0.027 + 3.1) * 0.02;
    }
  });
  return (
    <>
      <sprite ref={a} scale={[34, 3.2, 1]}>
        <spriteMaterial map={glow} color={palette.horizonGlow} blending={AdditiveBlending} transparent opacity={0.07} depthWrite={false} fog={false} />
      </sprite>
      <sprite ref={b} scale={[42, 2.6, 1]}>
        <spriteMaterial map={glow} color={chMix(palette.horizonGlow, palette.sunHalo, 0.5)} blending={AdditiveBlending} transparent opacity={0.055} depthWrite={false} fog={false} />
      </sprite>
    </>
  );
}

/** Atmosfer köprüsü: fog + clearColor'ı seçili world paletine EASED damp'ler (world-switch
 *  keskin kesmez, ışık DÖNER ~1.2s). Canvas içinde olmalı (useThree/useFrame). */
function AtmosphereRig({ palette }: { palette: ScenePalette }) {
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);
  const target = useMemo(() => new Color(palette.fog), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { target.set(palette.fog); }, [palette, target]);
  useFrame((_, dt) => {
    const fog = scene.fog;
    if (fog) {
      fog.color.lerp(target, 1 - Math.exp(-3 * dt));
      gl.setClearColor(fog.color);
    }
  });
  return null;
}

export function DioramaStage() {
  // V4-4: world-adaptif — seçili world'ün palette_lock'undan; yoksa canlı default altın-saat.
  const palette = useScenePalette();
  return (
    <>
      <AtmosphereRig palette={palette} />
      <SkyDome palette={palette} />
      <CloudBank palette={palette} />
      <Ridges palette={palette} />
      <Sun palette={palette} />
      <Sea palette={palette} />
      <NearIslets palette={palette} />

      {/* Yüzen tablolar (hero/river/logo) KALDIRILDI — Mami kararı: saf Turner deniz-manzarası. */}
      <DriftingHaze palette={palette} />

      {/* Altın polen — 2 katman (yakın/uzak), güneş ışığında yaşayan toz (world rengiyle) */}
      <Sparkles count={70} scale={[20, 10, 18]} position={[2, 3, -9]} size={2.6} speed={0.18} opacity={0.5} color={palette.sparkle} />
      <Sparkles count={140} scale={[40, 16, 40]} position={[2, 4, -18]} size={1.4} speed={0.1} opacity={0.35} color={palette.sparkle} />
      <Birds />

      {/* V4 ışık ailesi: GÜNEŞ anahtarı (directional) + gündüz ambient + ≤2 ufuk/gök dolgu.
          Renkler world-adaptif (scenePalette.ambient/key/frameHalo); şiddet LOOK'ta. */}
      <ambientLight intensity={LOOK.light.ambient} color={palette.ambient} />
      <BreathingKey palette={palette} />
      {LOOK.light.sconcePositions.map((p, i) => (
        <pointLight
          key={i}
          position={[p[0] * 1.4, p[1], -8]}
          color={palette.frameHalo}
          intensity={LOOK.light.sconce * 0.5}
          distance={22}
          decay={1.6}
        />
      ))}
    </>
  );
}
