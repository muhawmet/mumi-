import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DATA } from '../core/pure';
import {
  WORLD_PAINTERS, paintWorldIdentity, worldPlateColors, worldSeed, mix, type PlateColors,
} from './worldPlateArt';

/* =============================================================
   worldPlateArt sözleşmesi — 46 dünya, 46 AYRI görsel yasa.
   DOM'suz vitest: gerçek raster yok; kayıt-ctx her çizim komutunu
   loglar, plaka kimliği = komut dizisinin parmak izi. İki dünyanın
   parmak izi çakışıyorsa ikincisi zararlıdır (görev tanımı).
   ============================================================= */

/** Canvas 2D kayıt sahtesi — painter'ların kullandığı API yüzeyini loglar. */
function recordingCtx(): { ctx: CanvasRenderingContext2D; log: string[] } {
  const log: string[] = [];
  let gradId = 0;
  const num = (v: unknown) => (typeof v === 'number' ? Math.round(v * 100) / 100 : String(v));
  const method = (name: string) => (...args: unknown[]) => { log.push(`${name}(${args.map(num).join(',')})`); };
  const gradient = (kind: string, args: unknown[]) => {
    const id = `g${gradId++}`;
    log.push(`${kind}#${id}(${args.map(num).join(',')})`);
    return {
      __id: id,
      addColorStop: (t: number, c: string) => { log.push(`stop#${id}(${num(t)},${c})`); },
    };
  };
  const target: Record<string, unknown> = {
    createLinearGradient: (...a: unknown[]) => gradient('lin', a),
    createRadialGradient: (...a: unknown[]) => gradient('rad', a),
  };
  for (const m of [
    'fillRect', 'strokeRect', 'clearRect', 'beginPath', 'closePath', 'moveTo', 'lineTo',
    'quadraticCurveTo', 'bezierCurveTo', 'arc', 'ellipse', 'rect', 'fill', 'stroke',
    'save', 'restore', 'translate', 'rotate', 'scale', 'clip', 'setLineDash', 'drawImage',
  ]) target[m] = method(m);
  for (const p of ['fillStyle', 'strokeStyle', 'lineWidth', 'lineCap', 'lineJoin', 'globalAlpha', 'globalCompositeOperation']) {
    let store: unknown = '';
    Object.defineProperty(target, p, {
      get: () => store,
      set: (v: unknown) => {
        store = v;
        const printed = v && typeof v === 'object' && '__id' in (v as object) ? `grad:${(v as { __id: string }).__id}` : num(v);
        log.push(`set:${p}=${printed}`);
      },
    });
  }
  return { ctx: target as unknown as CanvasRenderingContext2D, log };
}

function fingerprint(worldId: string, colors?: PlateColors): string {
  const { ctx, log } = recordingCtx();
  paintWorldIdentity(ctx, 320, 128, worldId, colors);
  // FNV-1a — uzun logu kompakt parmak ize indir
  let h = 2166136261;
  const s = log.join(';');
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return `${(h >>> 0).toString(16)}:${log.length}`;
}

const worldIds = DATA.worlds.map((w) => w.id);

describe('worldPlateArt — kapsama sözleşmesi', () => {
  it(`her dünyanın ADANMIŞ painter'ı var (${worldIds.length}/${worldIds.length}, lawCard güvenlik ağına düşen yok)`, () => {
    const missing = worldIds.filter((id) => !WORLD_PAINTERS[id]);
    expect(missing, `painter'sız dünyalar: ${missing.join(', ')}`).toEqual([]);
  });

  it('öksüz painter yok — registry anahtarları DATA.worlds ile birebir', () => {
    const orphans = Object.keys(WORLD_PAINTERS).filter((id) => !worldIds.includes(id));
    expect(orphans, `DATA'da olmayan painter: ${orphans.join(', ')}`).toEqual([]);
  });

  it('iki dünya aynı painter fonksiyonunu PAYLAŞAMAZ', () => {
    const fns = new Set(Object.values(WORLD_PAINTERS));
    expect(fns.size).toBe(Object.keys(WORLD_PAINTERS).length);
  });
});

describe('worldPlateArt — çıktı ayrışması (46 kimlik gerçekten ayrı mı)', () => {
  it('her dünyanın plaka parmak izi benzersiz (kendi paletiyle)', () => {
    const prints = new Map<string, string>();
    for (const id of worldIds) {
      const fp = fingerprint(id);
      const clash = [...prints.entries()].find(([, v]) => v === fp);
      expect(clash, `${id} ile ${clash?.[0]} aynı plakayı üretiyor`).toBeUndefined();
      prints.set(id, fp);
    }
    expect(prints.size).toBe(worldIds.length);
  });

  it('AYNI nötr paletle bile 46 kompozisyon ayrışır — "aynı gürültü + farklı renk" yasak', () => {
    const neutral: PlateColors = ['#202020', '#808080', '#c04030', '#f0f0e0'];
    const prints = new Map<string, string>();
    for (const id of worldIds) {
      const fp = fingerprint(id, neutral);
      const clash = [...prints.entries()].find(([, v]) => v === fp);
      expect(clash, `${id} ile ${clash?.[0]} yalnız renkle ayrışıyor (kompozisyon aynı)`).toBeUndefined();
      prints.set(id, fp);
    }
    expect(prints.size).toBe(worldIds.length);
  });

  it('deterministik: aynı dünya iki kez boyanınca aynı komut dizisi', () => {
    for (const id of ['whiteboard_explainer', 'noir_high_contrast', 'ukiyo_e_print']) {
      expect(fingerprint(id)).toBe(fingerprint(id));
    }
  });

  it('bilinmeyen dünya lawCard güvenlik ağına düşer, patlamaz', () => {
    const { ctx } = recordingCtx();
    expect(() => paintWorldIdentity(ctx, 320, 128, 'gelecek_dunya_yok')).not.toThrow();
  });
});

describe('worldPlateArt — renk ve tohum sözleşmesi', () => {
  it('plaka renkleri dünyanın palette_lock dörtlüsünden gelir (SADECE okuma)', () => {
    for (const w of DATA.worlds) {
      const p = w.palette_lock;
      expect(p, `${w.id} palette_lock taşımıyor`).toBeTruthy();
      if (!p) continue;
      expect(worldPlateColors(w.id)).toEqual([p.shadow, p.mid, p.accent, p.highlight]);
    }
  });

  it('worldSeed deterministik ve dünyalar arasında çakışmasız', () => {
    const seeds = new Set(worldIds.map(worldSeed));
    expect(seeds.size).toBe(worldIds.length);
    expect(worldSeed('whiteboard_explainer')).toBe(worldSeed('whiteboard_explainer'));
  });

  it('mix uçları korur', () => {
    expect(mix('#000000', '#ffffff', 0)).toBe('#000000');
    expect(mix('#000000', '#ffffff', 1)).toBe('#ffffff');
  });
});

/* Kaynak kilitleri — repo geleneği (plateArt/docsContract): sapan kod = kırmızı test. */
describe('worldPlateArt — kaynak kilitleri', () => {
  const art = readFileSync(new URL('./worldPlateArt.ts', import.meta.url), 'utf8');
  const plate = readFileSync(new URL('./WorldIdentityPlate.tsx', import.meta.url), 'utf8');
  const step = readFileSync(new URL('../pages/Recipe/RecipeStep.tsx', import.meta.url), 'utf8');

  it('painter dosyası deterministik kalır — Math.random / Date yasak', () => {
    expect(art).not.toMatch(/Math\.random/);
    expect(art).not.toMatch(/Date\.now|new Date/);
  });

  it('SURGERY_DATA sadece okunur — painter katmanı core\'a yazamaz', () => {
    expect(art).not.toMatch(/writeFile|localStorage|SURGERY_DATA/); // DATA import'u pure.ts üstünden, yazma yolu yok
    expect(art).toContain("from '../core/pure'");
  });

  it('WorldIdentityPlate offscreen cache taşır ve renk İÇERİĞİNİ izler (repaint fırtınası yasağı)', () => {
    expect(plate).toMatch(/plateCache = new Map/);
    expect(plate).toMatch(/const colorKey = resolved\.join\('\|'\)/);
    expect(plate).toMatch(/\[worldId, colorKey, height\]/);
    expect(plate).not.toMatch(/\[worldId, colors,/); // referans-bazlı dep geri gelemez
  });

  it('RecipeStep dünya listesi VE hero, dünya-kimlik plakasına bağlı — deniz-günbatımı fallback geri gelemez', () => {
    const mapBody = step.slice(step.indexOf('recipe-world-list'), step.indexOf('recipe-world-detail'));
    expect(mapBody).toContain('WorldIdentityPlate');
    expect(mapBody).not.toContain('PaintedPlate'); // ortak motif listede yasak
    const heroBody = step.slice(step.indexOf('recipe-world-detail'), step.indexOf('recipe-register'));
    expect(heroBody).toContain('WorldIdentityPlate');
    expect(heroBody).not.toContain('<WorldPlate'); // grup-arketip fotoğrafı hero'da emekli
  });
});
