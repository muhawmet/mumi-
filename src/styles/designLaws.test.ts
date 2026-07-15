import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOOK } from '../scene/lookConfig';

const tokens = readFileSync('src/styles/tokens.css', 'utf8');
const v3 = readFileSync('src/styles/design_v3.css', 'utf8');

/** src altındaki tüm .ts/.tsx/.css içeriğini {dosya, metin} olarak toplar (görsel-dil taraması için). */
function collectSource(dir = 'src'): { file: string; text: string }[] {
  const out: { file: string; text: string }[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectSource(full));
    else if (/\.(tsx?|css)$/.test(entry.name)) out.push({ file: full, text: readFileSync(full, 'utf8') });
  }
  return out;
}
const sourceFiles = collectSource();

describe('DESIGN_LANGUAGE_V3 kanunları gate\'te', () => {
  it('--font-serif token tanımlı (F editorial serif dili)', () => {
    expect(tokens).toMatch(/--font-serif:\s*'Fraunces Variable'/);
  });

  it('--parch, lookConfig.palette.paper ile aynı değeri tutar (V3 §3b)', () => {
    const m = tokens.match(/--parch:\s*(#[0-9a-fA-F]{6})/);
    expect(m, 'tokens.css --parch tanımı eksik').toBeTruthy();
    expect(m![1].toLowerCase()).toBe(LOOK.palette.paper.toLowerCase());
  });

  it('backdrop-blur sözlük dışına çıkamaz: 10/14/16/18/30 (V3 §7.3)', () => {
    const allowed = new Set(['10', '14', '16', '18', '30']);
    for (const css of [tokens, v3]) {
      // declaration-bazlı tarama: blur() value'nun neresinde olursa olsun
      // (ör. "saturate(1.2) blur(Npx)") ve -webkit- öneki dahil yakalanır
      for (const decl of css.matchAll(/(?:-webkit-)?backdrop-filter:\s*([^;}]+)/g)) {
        const value = decl[1];
        const parsed = [...value.matchAll(/blur\((\d+)px\)/g)];
        const mentions = value.split('blur(').length - 1;
        expect(
          parsed.length,
          `blur değeri sözlük-denetlenebilir olmalı (px literal bekleniyor): "${value.trim()}"`,
        ).toBe(mentions);
        for (const m of parsed) {
          expect(allowed.has(m[1]), `blur(${m[1]}px) sözlükte yok`).toBe(true);
        }
      }
    }
  });

  it('doygun teal design_v3.css\'ten tamamen migre edildi (V3 §7.1)', () => {
    expect(v3).not.toMatch(/37e2d5/i);
    expect(v3).not.toMatch(/55,\s*226,\s*213/);
  });

  it('buz-çeliği karşı-ışık token\'ları tanımlı', () => {
    expect(v3).toMatch(/--v3-ice:\s*#8fa3c2/);
    expect(v3).toMatch(/--v3-iceline:\s*rgba\(143,\s*163,\s*194,\s*0\.22\)/);
  });
});

describe('Görsel-dil hijyeni (T0-T7 denetim regresyonu)', () => {
  it('hayali token yok: var(--base) ve var(--gold-mid) token sözlüğünde tanımsız, kullanılamaz', () => {
    const hits = sourceFiles
      .filter((f) => !f.file.endsWith('designLaws.test.ts'))
      .filter((f) => /var\(--base\)|var\(--gold-mid\)/.test(f.text))
      .map((f) => f.file);
    expect(hits, `tanımsız token kullanan dosyalar: ${hits.join(', ')}`).toEqual([]);
  });

  it('neon-yeşil sızıntısı yok: success rengi canonical sage (--green #93c9a8), neon #4df5a0 değil', () => {
    const hits = sourceFiles
      .filter((f) => !f.file.endsWith('designLaws.test.ts'))
      .filter((f) => /4df5a0/i.test(f.text) || /77,\s*245,\s*160/.test(f.text))
      .map((f) => f.file);
    expect(hits, `neon-yeşil kullanan dosyalar: ${hits.join(', ')}`).toEqual([]);
  });

  it('Panel/Field başlıkları Türkçe-güvenli büyütülür: çıplak .toUpperCase() yok, smartUpper üzerinden (İ İngilizce loanword\'e taşmaz)', () => {
    const panelKit = sourceFiles.find((f) => f.file.endsWith('PanelKit.tsx'))!;
    // PanelKit ham .toUpperCase()/toLocaleUpperCase kullanmaz; casing kararı
    // per-word akıllı yardımcıya (smartUpper) devredilir.
    expect(panelKit.text).not.toMatch(/\.toUpperCase\(\)/);
    expect(panelKit.text).toMatch(/smartUpper\(/);
    // Türkçe yol hâlâ mevcut: smartUpper kaynağı tr-locale büyütmeyi taşır.
    const textCase = sourceFiles.find((f) => f.file.endsWith('textCase.ts'))!;
    expect(textCase.text).toMatch(/toLocaleUpperCase\('tr'\)/);
  });
});
