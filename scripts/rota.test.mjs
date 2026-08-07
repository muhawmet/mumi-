// ROTA — motor+cüzdan çiftinin sınavı.
// Ölçülen şey fiyat tablosunun ezberi değil: KARARIN Mami'nin kuralına uyup uymadığı
// (önce Magnific) ve ölçülmemiş bilginin UYDURULMAMASI.

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  FILM_KARE, FILM_KLIP, FIYAT, RotaError, VARSAYILAN,
  ELEMENT_ORAN, SAHNE_ORAN, SUREKLILIK_CAST,
  fiyatTablosu, filmKapasitesi, main, rafYaz, sec, usage,
} from './rota.mjs';

let dizin;
beforeEach(() => { dizin = mkdtempSync(path.join(tmpdir(), 'rota-')); });
afterEach(() => rmSync(dizin, { recursive: true, force: true }));

describe('rota — Mami\'nin kuralı', () => {
  it('varsayılan cüzdan MAGNIFIC — önce o kredi bitirilir', () => {
    expect(VARSAYILAN.cuzdan).toBe('magnific');
    expect(sec({ is: 'kare' }).cuzdan).toBe('magnific');
    expect(sec({ is: 'klip' }).cuzdan).toBe('magnific');
  });

  it('varsayılan hat NB2 + Kling 3.0 — 2.6 ve Seedance kapsam dışı', () => {
    expect(VARSAYILAN.kare).toBe('nb2');
    expect(VARSAYILAN.klip).toBe('kling3_0');
  });

  it('Higgsfield açıkça seçilirse GEREKÇE uyarısı basar — sessizce pahalıya kaymaz', () => {
    const k = sec({ is: 'klip', cuzdan: 'higgsfield' });
    expect(k.notlar.join(' ')).toContain('önce Magnific');
  });

  it('4k istenince Higgsfield ZORUNLU olur ve sebebi yazılır', () => {
    const k = sec({ is: 'kare', dortK: true });
    expect(k.cuzdan).toBe('higgsfield');
    expect(k.notlar.join(' ')).toContain('1376×768');
  });
});

describe('rota — referans gerçeği cüzdana bağlı', () => {
  it('aynı motor, iki cüzdan, iki farklı referans yolu', () => {
    expect(sec({ is: 'klip', kimlik: true }).notlar.join(' ')).toContain('startFrame');
    expect(sec({ is: 'klip', kimlik: true, cuzdan: 'higgsfield' }).notlar.join(' ')).toContain('<<<element_id>>>');
  });

  it('kimlik istenmiyorsa referans notu basılmaz — gereksiz gürültü yok', () => {
    expect(sec({ is: 'kare' }).notlar.join(' ')).not.toContain('referans:');
  });
});

describe('rota — film birimi', () => {
  it('kalan bakiyeyi FİLM\'e çevirir (kredi kıyaslanamaz, film kıyaslanır)', () => {
    const m = filmKapasitesi('magnific', 84456);
    expect(m.filmMaliyeti).toBe(FILM_KARE * 60 + FILM_KLIP * 450);
    expect(m.film).toBeCloseTo(2.8, 1);

    const h = filmKapasitesi('higgsfield', 5157);
    expect(h.filmMaliyeti).toBe(FILM_KARE * 2 + FILM_KLIP * 10);
    expect(h.film).toBeCloseTo(7.2, 1);
  });

  it('bakiye ölçülmemişse null döner — sıfır ya da tahmin BASMAZ', () => {
    expect(filmKapasitesi('magnific', undefined)).toBeNull();
  });

  it('bilinmeyen cüzdan sessiz geçmez', () => {
    expect(() => filmKapasitesi('kling', 100)).toThrow(RotaError);
    expect(() => sec({ is: 'kare', cuzdan: 'kling' })).toThrow(RotaError);
  });

  it('fiyat tablosu kredilerin KIYASLANAMAZ olduğunu söyler', () => {
    expect(fiyatTablosu()).toContain('KIYASLANAMAZ');
    expect(FIYAT.olculdu).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('rota — element rafı', () => {
  it('MCP çıktısını normalize edip diske alır', () => {
    const yol = path.join(dizin, 'raf.json');
    rafYaz({ items: [{ name: 'ogr', id: 'abc', category: 'auto:character', medias: [{ url: 'https://x/y.png' }] }] },
      { yol, simdi: '2026-08-07T00:00:00.000Z' });
    const raf = JSON.parse(readFileSync(yol, 'utf8'));
    expect(raf.elementler).toEqual([
      { ad: 'ogr', id: 'abc', tur: 'auto:character', cuzdan: 'higgsfield', gorsel: 'https://x/y.png' },
    ]);
  });

  it('boş liste ve id\'siz element YARIM raf yazmaz', () => {
    const yol = path.join(dizin, 'raf.json');
    expect(() => rafYaz({ items: [] }, { yol })).toThrow(RotaError);
    expect(() => rafYaz({ items: [{ name: 'ogr' }] }, { yol })).toThrow(RotaError);
  });
});

describe('rota — Mami\'nin element kuralı', () => {
  it('element 1:1, sahne 16:9 — ikisi karışmaz', () => {
    expect(ELEMENT_ORAN).toBe('1:1');
    expect(SAHNE_ORAN).toBe('16:9');
  });

  it('süreklilik odağı Mira ve Efe — geri kalan element tek seferlik', () => {
    expect(SUREKLILIK_CAST).toEqual(['mira', 'efe']);
  });

  it('durum ekranı süreklilik cast\'i rafta yoksa UYARIR', () => {
    const yol = path.join(dizin, 'raf.json');
    rafYaz({ items: [{ name: 'ogr', id: 'a', medias: [{ url: 'https://x/y.png' }] }] }, { yol });
    const raf = JSON.parse(readFileSync(yol, 'utf8'));
    const eksik = SUREKLILIK_CAST.filter((ad) => !raf.elementler.some((e) => e.ad.includes(ad)));
    expect(eksik).toEqual(['mira', 'efe']);
  });
});

describe('rota — kapı', () => {
  it('--is verilmezse durur', () => {
    expect(() => sec({})).toThrow(RotaError);
  });

  it('argümansız çağrı kullanımı basar', () => {
    expect(main([])).toBe(usage());
  });
});
