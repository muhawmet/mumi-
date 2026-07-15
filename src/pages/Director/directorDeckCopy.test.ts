import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PHASE0_VIDEO } from '../../data/presets';

/* Reçete çürümesi dersinin kardeşi: preset SAYISI metne gömülünce 8→10
   geçişinde başlık "sekiz yol" diye yalan söyledi. Sayı daima veriden. */
describe('director deck copy — arketip sayısı veriden', () => {
  const src = fs.readFileSync(path.join(__dirname, 'DirectorStep.tsx'), 'utf8');

  it('başlıkta gömülü sayı sözcüğü yok, PRESET_COUNT_TR kullanılıyor', () => {
    expect(src).not.toMatch(/masasında (iki|üç|dört|beş|altı|yedi|sekiz|dokuz|on|on bir|on iki) yol/);
    expect(src).toContain('{PRESET_COUNT_TR} yol serili');
  });

  it('COUNT_TR sözlüğü mevcut preset sayısını karşılıyor', () => {
    // 12'ye kadar sözcük var; aşarsa rakam fallback'i devrede — bu test 12'yi
    // aşınca kırılmaz, sadece sözlük kapsamı gerilerse kırılır.
    expect(PHASE0_VIDEO.length).toBeGreaterThanOrEqual(10);
    expect(src).toContain("'on'");
  });
});
