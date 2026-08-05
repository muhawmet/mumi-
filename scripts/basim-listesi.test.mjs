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
import {
  bloklariAyir, coz, kaynaklariTopla, rapor, listeYaz,
  motoraGiden, kuyrugaAyir, refleriCek, csvAlan, csvUret, csvHazirla,
} from './basim-listesi.mjs';

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

  // ÖLÇÜLDÜ 2026-08-05: ayrıştırıcı `##` ŞART koşuyordu ve tek-`#` biçimini hiç görmüyordu.
  // Hücre (altın standart, 53 kare), Destek ve Hareket (52), Bitkilerde Üreme'nin MOTION
  // klasörünün TAMAMI ve Denetleyici'nin 56 karesi bu biçimde — hepsinde SIFIR blok çıkıyordu.
  it('KIRMIZI KANITI: tek `#` başlıklı blok da görülür (`# K27 — "cümle"`)', () => {
    const b = bloklariAyir('# K27 — "Ortaya yeni bir kertenkele çıkmaz."\n-----\ngövde\n-----\n');
    expect(b).toHaveLength(1);
    expect(b[0].etiket).toBe('K27');
  });

  it('başlık gibi görünen düz cümle blok SAYILMAZ (`#` şart, ayraç şart)', () => {
    expect(bloklariAyir('K12 ve K13 aynı sahnedir')).toEqual([]);
    expect(bloklariAyir('1. K05 maket referansı bekliyor')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
describe('basim-listesi · --csv (NB2 batch)', () => {
  it('motoraGiden Türkçe yönetmen notunu ATAR, `-----` arasını verir', () => {
    const g = ['### K01 | VO1 "x"', 'FİKİR: bu bir not', 'PLAN: bu da not', '-----',
      '40mm lens at f/4, a boy stands.', 'STYLE: ortak.', '-----'].join('\n');
    const { metin, ayracli } = motoraGiden(g);
    expect(ayracli).toBe(true);
    expect(metin).toBe('40mm lens at f/4, a boy stands.\nSTYLE: ortak.');
    expect(metin, 'Türkçe not motora gidemez').not.toMatch(/FİKİR|PLAN/);
  });

  it('ayraçsız blokta yalnız başlık düşer ve durum RAPORLANIR', () => {
    const { metin, ayracli } = motoraGiden('### K01 | VO\nbody line');
    expect(ayracli).toBe(false);
    expect(metin).toBe('body line');
  });

  const kareler = (n, ozel) => Array.from({ length: n }, (_, i) => ({
    etiket: `K${i + 1}`,
    kare: i + 1,
    metin: `sahne ${i + 1}, @mira duruyor.\nSTYLE: ortak kuyruk cümlesi. ${ozel(i)}\nNEGATIVE: global yasak.`,
  }));

  it('kuyruk ÖLÇÜLEREK ayrılır: tekrar eden düşer, kareye özel KALIR', () => {
    const r = kuyrugaAyir(kareler(10, (i) => `kareye ozel ${i}.`));
    expect(r.kuyruk.join(' ')).toMatch(/STYLE: ortak kuyruk/);
    expect(r.kuyruk.join(' ')).toMatch(/NEGATIVE: global yasak/);
    expect(r.satirlar[0].prompt, 'kareye özel cümle CSV\'de kalmalı').toMatch(/kareye ozel 0/);
    expect(r.satirlar[0].prompt, 'ortak kuyruk CSV\'ye girmemeli').not.toMatch(/ortak kuyruk/);
    // Etiket geri konur: NB2 kısıtın hangi alana ait olduğunu etiketten okur.
    expect(r.satirlar[0].prompt).toMatch(/STYLE: kareye ozel 0/);
    expect(r.kuyrukEksik, 'kuyruk 10/10 karede vardı').toEqual([]);
  });

  it('eşiğin altında kalan kuyruk DÜŞMEZ — ve sebebi ölçülüp raporlanır', () => {
    // 6 kare A lehçesi, 4 kare B lehçesi → hiçbiri %80'i geçmez
    const bloklar = Array.from({ length: 10 }, (_, i) => ({
      etiket: `K${i + 1}`,
      kare: i + 1,
      metin: `sahne.\nSTYLE: ${i < 6 ? 'lehce A cumlesi.' : 'lehce B cumlesi.'} ozel ${i}.`,
    }));
    const r = kuyrugaAyir(bloklar);
    expect(r.kuyruk, 'ortak kuyruk yok').toEqual([]);
    expect(r.enYaygin.sayi, 'sebep ölçülür: en yaygın parça 6/10').toBe(6);
    expect(r.lehceler.find((g) => g.etiket === 'STYLE').surum).toBe(10);
    expect(r.satirlar[0].prompt, 'hiçbir şey kaybolmaz').toMatch(/lehce A cumlesi/);
  });

  it('eşik düşürülünce kuyruğu TAŞIMAYAN kareler işaretlenir (sessiz kayıp yok)', () => {
    const bloklar = Array.from({ length: 10 }, (_, i) => ({
      etiket: `K${i + 1}`,
      kare: i + 1,
      metin: `sahne.\nSTYLE: ${i < 6 ? 'lehce A cumlesi.' : 'lehce B cumlesi.'} ozel ${i}.`,
    }));
    const r = kuyrugaAyir(bloklar, 0.5);
    expect(r.kuyruk.join(' ')).toMatch(/lehce A/);
    expect(r.kuyrukEksik, 'B lehçesindeki 4 kare kuyruğu taşımıyor').toHaveLength(4);
  });

  it('refs sütunu @handle\'ları ilk görülme sırasıyla, tekrarsız verir', () => {
    expect(refleriCek('@mira sees @efe and @mira waves')).toEqual(['@mira', '@efe']);
    expect(refleriCek('hiç ref yok')).toEqual([]);
  });

  it('CSV kaçışlaması: virgül, tırnak ve satır sonu', () => {
    expect(csvAlan('düz')).toBe('düz');
    expect(csvAlan('a,b')).toBe('"a,b"');
    expect(csvAlan('o "dedi"')).toBe('"o ""dedi"""');
    expect(csvAlan('bir\niki')).toBe('"bir\niki"');
  });

  it('csvUret `n,prompt,refs` başlığı ve kare başına tek satır üretir', () => {
    const r = kuyrugaAyir(kareler(3, (i) => `ozel ${i}.`));
    const satir = csvUret(r).split('\n');
    expect(satir[0]).toBe('n,prompt,refs');
    expect(satir[1].startsWith('1,')).toBe(true);
    expect(satir[1].endsWith('@mira')).toBe(true);
    expect(satir.filter(Boolean)).toHaveLength(4);   // başlık + 3 kare
  });

  it('promptlar rolü PROMPTLAR/ okur ve referans dosyasını DIŞLAR', () => {
    const dir = mkdtempSync(join(tmpdir(), 'basim-csv-'));
    mkdirSync(join(dir, 'PROMPTLAR'));
    writeFileSync(join(dir, 'PROMPTLAR', 'A.txt'),
      '### K01 | VO\n-----\nframe body @mira.\nSTYLE: ortak.\n-----\n', 'utf8');
    writeFileSync(join(dir, 'PROMPTLAR', '_REFERANS-EDIT.txt'),
      '### K01 | edit\n-----\nuse this referenced image, change ONLY the hat.\n-----\n', 'utf8');
    const r = rapor(dir, { rol: 'promptlar' });
    expect(r.canli.map((k) => k.ad), 'referans-edit start-frame değildir').toEqual(['A.txt']);
    const c = csvHazirla(r);
    expect(c.csv).toMatch(/frame body @mira/);
    expect(c.csv).not.toMatch(/change ONLY/);
  });

  it('motion rolü VARSAYILAN kalır — CSV motion bloğu taşıyamaz', () => {
    const dir = mkdtempSync(join(tmpdir(), 'basim-rol-'));
    mkdirSync(join(dir, 'MOTION'));
    mkdirSync(join(dir, 'PROMPTLAR'));
    writeFileSync(join(dir, 'MOTION', 'M.txt'), '### K01 | 5s\n-----\ncamera pushes in.\n-----\n', 'utf8');
    writeFileSync(join(dir, 'PROMPTLAR', 'A.txt'), '### K01 | VO\n-----\nframe body.\n-----\n', 'utf8');
    expect(rapor(dir).canli.map((k) => k.ad)).toEqual(['M.txt']);
    expect(rapor(dir, { rol: 'promptlar' }).canli.map((k) => k.ad)).toEqual(['A.txt']);
  });

  it('SIFIR blok veren dosya SESSİZ GEÇMEZ — kör olarak raporlanır', () => {
    const dir = mkdtempSync(join(tmpdir(), 'basim-kor-'));
    mkdirSync(join(dir, 'PROMPTLAR'));
    writeFileSync(join(dir, 'PROMPTLAR', 'A.txt'), '### K01 | VO\n-----\nbody.\n-----\n', 'utf8');
    writeFileSync(join(dir, 'PROMPTLAR', 'BOS.txt'), 'başlıksız düz metin\n', 'utf8');
    expect(rapor(dir, { rol: 'promptlar' }).kor).toEqual(['BOS.txt']);
  });
});
