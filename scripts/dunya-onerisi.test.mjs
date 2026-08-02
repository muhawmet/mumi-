import { describe, expect, test } from 'vitest';

import {
  ALAN_HARITASI,
  VARSAYILAN_ALANLAR,
  dunyaBul,
  dunyaOnerisi,
  kutuphaneyiOku,
  onerimarkdown,
} from './dunya-onerisi.mjs';

// "Kusur kütüphanede düzeltilir" yasası ölçüldü ve çalışmıyordu: 12 hasat → SURGERY_DATA.json'da
// 0 satır. Sebep rapor yanlışlığı değil, raporun UYGULANAMAZ olmasıydı — worldId yok, alan yok,
// mevcut metin yok. Bu duvar üç şeyi kilitler: (1) eşleme gerçek alan adlarına gidiyor,
// (2) mevcut metin gerçekten okunuyor, (3) modül öneri cümlesi UYDURMUYOR.

const { veri, hata } = kutuphaneyiOku(process.cwd());

describe('dünya önerisi — kusur bir ADRESE çevriliyor', () => {
  test('kütüphane canlı repoda gerçekten okunuyor', () => {
    expect(hata).toBeNull();
    expect(dunyaBul(veri, 'pixar_3d_edu')).toBeTruthy();
  });

  test('eşlemedeki her alan adı kütüphanede GERÇEKTEN var — uydurma alan yok', () => {
    const w = dunyaBul(veri, 'pixar_3d_edu');
    const hepsi = new Set([...Object.values(ALAN_HARITASI).flat(), ...VARSAYILAN_ALANLAR]);
    for (const alan of hepsi) {
      expect(Object.prototype.hasOwnProperty.call(w, alan), `alan yok: ${alan}`).toBe(true);
    }
  });

  test('öneri mevcut metni GERÇEKTEN taşıyor (boş iskelet değil)', () => {
    const o = dunyaOnerisi({
      worldId: 'pixar_3d_edu', kusurKey: 'dünya-malzeme',
      kusur: 'malzeme yasası kareyi taşımadı', kareler: ['K03', 'K11'], root: process.cwd(),
    });
    expect(o.bulundu).toBe(true);
    expect(o.alanlar.length).toBeGreaterThan(0);
    const renderLaw = o.alanlar.find((a) => a.alan === 'render_law');
    expect(renderLaw.var).toBe(true);
    expect(renderLaw.uzunluk).toBeGreaterThan(200);
    expect(renderLaw.mevcut).toBeTruthy();
  });

  test('markdown çıktısı adres + kanıt + bugünkü metin taşıyor', () => {
    const md = onerimarkdown(dunyaOnerisi({
      worldId: 'pixar_3d_edu', kusurKey: 'dünya-malzeme',
      kusur: 'malzeme yasası kareyi taşımadı', kareler: ['K03'], root: process.cwd(),
    })).join('\n');
    expect(md).toMatch(/pixar_3d_edu/);
    expect(md).toMatch(/SURGERY_DATA\.json/);
    expect(md).toMatch(/render_law/);
    expect(md).toMatch(/K03/);
  });

  test('öneri cümlesi UYDURULMUYOR — boş bırakıldığı açıkça yazılı', () => {
    const md = onerimarkdown(dunyaOnerisi({
      worldId: 'pixar_3d_edu', kusurKey: 'dünya-malzeme', kusur: 'x', kareler: [], root: process.cwd(),
    })).join('\n');
    expect(md).toMatch(/bilerek BOŞ bırakıldı/);
  });

  test('bilinmeyen dünya sessiz geçmez — ne olduğunu SÖYLER', () => {
    const o = dunyaOnerisi({
      worldId: 'boyle_bir_dunya_yok', kusurKey: 'dünya-malzeme', kusur: 'x', kareler: [], root: process.cwd(),
    });
    expect(o.bulundu).toBe(false);
    expect(o.not).toMatch(/kütüphanede YOK/);
    expect(onerimarkdown(o).join('\n')).toMatch(/⚠️/);
  });

  test('bilinmeyen kusur sınıfı varsayılana düşer, boş dönmez', () => {
    const o = dunyaOnerisi({
      worldId: 'pixar_3d_edu', kusurKey: 'hic-boyle-bir-sinif-yok', kusur: 'x', kareler: [], root: process.cwd(),
    });
    expect(o.alanlar.map((a) => a.alan)).toEqual(VARSAYILAN_ALANLAR);
  });

  test('kütüphane bulunamazsa ÖLÇEMEDİ der — sessiz sıfır dönmez', () => {
    const o = dunyaOnerisi({
      worldId: 'pixar_3d_edu', kusurKey: 'dünya-malzeme', kusur: 'x', kareler: [], root: '/boyle-bir-yol-yok-42',
    });
    expect(o.bulundu).toBe(false);
    expect(o.not).toMatch(/bulunamadı/);
  });
});
