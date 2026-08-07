// ÜRETİM DEFTERİ — öğrenmenin sınavı.
// İki şey ölçülüyor: (1) kuzey yıldızı "sonunda tuttu"yu ÖDÜLLENDİRMİYOR,
// (2) üç vuruş tek videoya özgü kazayı desen SAYMIYOR — bankayı zehirleyen tam olarak buydu.

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DefterError, VURUS_ESIGI, adayMetni, karneMetni, main, projeKarnesi, toplamKarne, usage, vuruslar } from './uretim-defteri.mjs';

const shot = (n, basim = [], klip = []) => ({ n, sekans: 'S1', asama: 'yazildi', elementler: [], basim, klip, not: '' });
const deneme = (sonuc, kusur, kredi = 0) => ({ deneme: 1, motor: 'nb2', cuzdan: 'magnific', kredi, sonuc, kusur: kusur ?? null });
const emir = (proje, shots) => ({ surum: 1, proje, shots });

let dizin;
beforeEach(() => { dizin = mkdtempSync(path.join(tmpdir(), 'defter-')); });
afterEach(() => rmSync(dizin, { recursive: true, force: true }));
const yaz = (e) => writeFileSync(path.join(dizin, `${e.proje}.json`), JSON.stringify(e));

describe('üretim defteri — kuzey yıldızı', () => {
  it('ilk denemede tutan kareyi sayar, sonunda tutanı SAYMAZ', () => {
    const k = projeKarnesi(emir('A', [
      shot(1, [deneme('kabul')]),
      shot(2, [deneme('red', 'yazi'), deneme('kabul')]),
    ]));
    expect(k.basim.ilkTutma).toBe(0.5);
    expect(k.basim.recreate).toBe(1);
  });

  it('recreate = ilk denemenin ötesindeki her deneme — kredi tam orada yanıyor', () => {
    const k = projeKarnesi(emir('A', [
      shot(1, [deneme('red', 'yazi', 60), deneme('red', 'yazi', 60), deneme('kabul', null, 60)]),
    ]));
    expect(k.basim.recreate).toBe(2);
    expect(k.basim.kredi).toBe(180);
  });

  it('hiç basılmamış işte oran null — sıfır BASMAZ', () => {
    expect(projeKarnesi(emir('A', [shot(1)])).basim.ilkTutma).toBeNull();
    expect(toplamKarne([emir('A', [shot(1)])]).ilkBasimTutma).toBeNull();
  });

  it('kusur sınıflarını çoktan aza sıralar', () => {
    const k = projeKarnesi(emir('A', [
      shot(1, [deneme('red', 'yazi'), deneme('kabul')]),
      shot(2, [deneme('red', 'plastik'), deneme('kabul')]),
      shot(3, [deneme('red', 'yazi'), deneme('kabul')]),
    ]));
    expect(Object.keys(k.kusurlar)).toEqual(['yazi', 'plastik']);
    expect(k.kusurlar.yazi).toBe(2);
  });
});

describe('üretim defteri — üç vuruş', () => {
  it('AYNI işte 20 kez çıkan kusur TEK vuruştur — tek videoya özgü kaza desen değildir', () => {
    const cok = Array.from({ length: 20 }, (_, i) => shot(i + 1, [deneme('red', 'plastik'), deneme('kabul')]));
    const [v] = vuruslar([emir('A', cok)]);
    expect(v.toplam).toBe(20);
    expect(v.vurus).toBe(1);
    expect(v.dolu).toBe(false);
  });

  it('ÜÇ AYRI işte tekrar eden kusur eşiği doldurur', () => {
    const tek = (p) => emir(p, [shot(1, [deneme('red', 'yazi'), deneme('kabul')])]);
    const v = vuruslar([tek('A'), tek('B'), tek('C')]);
    expect(v[0].vurus).toBe(VURUS_ESIGI);
    expect(v[0].dolu).toBe(true);
  });

  it('eşik dolmadan ADAY YAZMAZ — çöp ders sistemi zehirler', () => {
    expect(() => adayMetni([emir('A', [shot(1, [deneme('red', 'yazi'), deneme('kabul')])])]))
      .toThrow(DefterError);
  });

  it('eşik dolunca aday metni nerede tekrar ettiğini adıyla yazar', () => {
    const tek = (p) => emir(p, [shot(1, [deneme('red', 'yazi'), deneme('kabul')])]);
    const md = adayMetni([tek('A'), tek('B'), tek('C')], { simdi: '2026-08-07T00:00:00.000Z' });
    expect(md).toContain('## yazi');
    expect(md).toContain('3 ayrı iş');
    expect(md).toContain('A (1) · B (1) · C (1)');
    expect(md).toContain('⬜ onayla');
  });
});

describe('üretim defteri — CLI', () => {
  it('iş emri yokken ölçülmediğini SÖYLER, sıfır uydurmaz', () => {
    expect(main(['karne'], { dizin })).toContain('Ölçülmeyen recreate oranı düşemez');
  });

  it('karne oranı ve kusurları basar', () => {
    yaz(emir('Kuvvet', [shot(1, [deneme('kabul')]), shot(2, [deneme('red', 'yazi'), deneme('kabul')])]));
    const cikti = main(['karne'], { dizin });
    expect(cikti).toContain('KUZEY YILDIZI');
    expect(cikti).toContain('%50');
    expect(cikti).toContain('yazi×1');
  });

  it('vuruş eşiği dolmayınca "kural YAZILMAZ" der', () => {
    yaz(emir('Kuvvet', [shot(1, [deneme('red', 'yazi'), deneme('kabul')])]));
    expect(main(['vurus'], { dizin })).toContain('kural YAZILMAZ');
  });

  it('olmayan projede sessiz boş karne basmaz', () => {
    expect(() => main(['karne', 'YokProje'], { dizin })).toThrow(DefterError);
  });

  it('argümansız çağrı kullanımı basar', () => {
    expect(main([], { dizin })).toBe(usage());
  });

  it('karneMetni boş listede uyarı verir', () => {
    expect(karneMetni([])).toContain('hiç iş emri yok');
  });
});
