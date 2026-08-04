// BASIM LİSTESİ — davranış kilitleri.
//
// Ölçülmüş vaka (Destek ve Hareket, 2026-08-05): kök `<Proje>_MOTION.txt` içeriği
// `ESKI-cansiz-yedek.txt` ile BYTE-EŞTİ ve mtime'ı DAHA YENİYDİ. Yalnız zamana bakan
// bir çözücü, tam da emekli edilmiş kusurlu seti "en yeni" diye seçiyordu.
// Aşağıdaki ilk test o vakanın birebir kopyasıdır.

import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { bloklariAyir, coz, kaynaklariTopla, rapor, listeYaz } from './basim-listesi.mjs';

function proje(dosyalar) {
  const dir = mkdtempSync(join(tmpdir(), 'basim-'));
  mkdirSync(join(dir, 'MOTION'));
  for (const [yol, [icerik, saniye]] of Object.entries(dosyalar)) {
    const tam = join(dir, yol);
    writeFileSync(tam, icerik, 'utf8');
    if (saniye) utimesSync(tam, saniye, saniye);
  }
  return dir;
}

const blok = (k, govde) => `### K${k} | 5s · VO "x"\n-----\n${govde}\n-----\n`;

describe('basim-listesi · İÇERİK KİMLİĞİ', () => {
  it('KIRMIZI KANITI: yedekle BYTE-EŞ olan dosya, mtime\'ı DAHA YENİ olsa bile düşer', () => {
    const eskiIcerik = blok(1, 'ESKI GOVDE') + blok(2, 'ESKI GOVDE 2');
    const dir = proje({
      // kök dosya: içerik eski, zaman EN YENİ (1000)
      'Proje_MOTION.txt': [eskiIcerik, 1000],
      // yedek: aynı içerik, adı eski
      'MOTION/ESKI-cansiz-yedek.txt': [eskiIcerik, 900],
      // gerçek yeni set: farklı içerik, zaman ORTA (500)
      'MOTION/S1-YENI.txt': [blok(1, 'YENI GOVDE'), 500],
    });
    const { secim, dusen } = coz(kaynaklariTopla(dir));
    expect(dusen.map((d) => d.ad).sort()).toEqual(['ESKI-cansiz-yedek.txt', 'Proje_MOTION.txt']);
    expect(secim.get('K1').kaynak, 'K1 yeni setten gelmeli').toBe('S1-YENI.txt');
    expect(secim.get('K1').blok.govde).toMatch(/YENI GOVDE/);
  });

  it('yalnız ZAMANA bakan bir çözücü bu vakada YANLIŞ seçerdi — kusur ölçülüyor', () => {
    const eskiIcerik = blok(1, 'ESKI GOVDE');
    const dir = proje({
      'Proje_MOTION.txt': [eskiIcerik, 1000],
      'MOTION/ESKI-cansiz-yedek.txt': [eskiIcerik, 900],
      'MOTION/S1-YENI.txt': [blok(1, 'YENI GOVDE'), 500],
    });
    const kaynaklar = kaynaklariTopla(dir);
    const enYeniZaman = kaynaklar[kaynaklar.length - 1];
    expect(enYeniZaman.ad, 'en yeni ZAMAN eski içerikte').toBe('Proje_MOTION.txt');
  });
});

describe('basim-listesi · çözüm ve raporlama', () => {
  it('canlı sürümü olmayan kare ESKİ sürümle doldurulur ve İŞARETLENİR (boşluk bırakmaz)', () => {
    const dir = proje({
      'MOTION/ESKI-yedek.txt': [blok(1, 'A') + blok(2, 'B'), 900],
      'MOTION/S1-YENI.txt': [blok(1, 'YENI A'), 500],
    });
    const r = rapor(dir);
    expect(r.secim.get('K2').eski).toBe(true);
    expect(r.sadeceEski).toContain('K2');
    expect(listeYaz(r, 'P')).toMatch(/K2[\s\S]{0,80}ESKİ SÜRÜM/);
  });

  it('çakışma SESSİZ çözülmez — raporlanır', () => {
    const dir = proje({
      'MOTION/S2-YENI.txt': [blok(16, 'S2 sürümü'), 500],
      'MOTION/M-A.txt': [blok(16, 'M-A sürümü'), 800],
    });
    const r = rapor(dir);
    expect(r.catisma.has('K16')).toBe(true);
    expect(r.secim.get('K16').kaynak, 'en yeni kazanır').toBe('M-A.txt');
  });

  it('K<n>-ALT alternatif olarak ayrılır ve boşluk sayımını bozmaz', () => {
    const dir = proje({ 'MOTION/M-B.txt': [blok(45, 'ana') + '### K45-ALT | 5s · VO "x"\n-----\nalt\n-----\n', 500] });
    const r = rapor(dir);
    expect(r.secim.get('K45-ALT').blok.alternatif).toBe(true);
    expect(r.enBuyuk, 'ALT en büyük kare sayısını şişirmemeli').toBe(45);
  });

  it('bloklariAyir başlıksız metinde boş döner (motion olmayan dosya kaynak sayılmaz)', () => {
    expect(bloklariAyir('düz metin, blok yok')).toEqual([]);
  });
});
