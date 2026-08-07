// L/J KESİM — kurgu zekâsının sınavı.
// Ölçülen taban: 53 kesimin 47'si cümle sınırında (%89), tek L/J yok.
// Bu test iki şeyi kilitler: (1) kaydırma klibi YEMİYOR, (2) her kesim kaydırılmıyor —
// hepsini kaydırmak yeni bir tekdüzelik üretir, kusur "sınırda olmak" değil "hep aynı olmak".

import { describe, expect, it } from 'vitest';
import { LjError, MAX_KAYDIRMA, MIN_KLIP, PAY_ORANI, SINIRDA_TAVAN, dagilim, main, planla, rapor, usage } from './lj-kesim.mjs';

const sinir = (n) => Array.from({ length: n }, (_, i) => (i + 1) * 4);
const sure = (n, s = 5) => Array.from({ length: n }, () => s);

describe('L/J kesim — kaydırma sınırları', () => {
  it('kaydırma üst sınırı aşmaz', () => {
    for (const k of planla(sinir(7), sure(8, 100))) {
      expect(Math.abs(k.kaydirma)).toBeLessThanOrEqual(MAX_KAYDIRMA);
    }
  });

  it('kısa klipte kaydırma YAPILMAZ — kaydırma klibi yerdi', () => {
    const kesimler = planla([4, 8], [5, MIN_KLIP - 0.5, 5]);
    expect(kesimler[0].tur).toBe('SERT');
    expect(kesimler[1].tur).toBe('SERT');
    expect(kesimler[0].sebep).toContain('kaydırma klibi yer');
  });

  it('kaydırma komşu kliplerin kısasının payını aşmaz', () => {
    const [k] = planla([4], [3, 3]);
    expect(Math.abs(k.kaydirma)).toBeLessThanOrEqual(3 * PAY_ORANI);
  });

  it('J görüntüyü ÖNE, L GERİYE alır', () => {
    const kesimler = planla(sinir(4), sure(5));
    const j = kesimler.find((k) => k.tur === 'J');
    const l = kesimler.find((k) => k.tur === 'L');
    expect(j.kaydirma).toBeLessThan(0);
    expect(j.yeni).toBeLessThan(j.sinir);
    expect(l.kaydirma).toBeGreaterThan(0);
    expect(l.yeni).toBeGreaterThan(l.sinir);
  });
});

describe('L/J kesim — vuruş dokunulmaz', () => {
  it('vuruş anı SERT kalır — kavram sözle aynı karede', () => {
    const kesimler = planla(sinir(4), sure(5), { vuruslar: [1, 2] });
    expect(kesimler[0].tur).toBe('SERT');
    expect(kesimler[1].tur).toBe('SERT');
    expect(kesimler[0].sebep).toContain('vuruş');
  });
});

describe('L/J kesim — ritim', () => {
  it('HER kesimi kaydırmaz — kaydırmanın kendisi tekdüzeleşmesin', () => {
    const d = dagilim(planla(sinir(11), sure(12)));
    expect(d.sert).toBeGreaterThan(0);
    expect(d.j).toBeGreaterThan(0);
    expect(d.l).toBeGreaterThan(0);
  });

  it('üç aynı tür arka arkaya gelmez', () => {
    const turler = planla(sinir(15), sure(16)).map((k) => k.tur);
    for (let i = 2; i < turler.length; i += 1) {
      expect(turler[i] === turler[i - 1] && turler[i - 1] === turler[i - 2]).toBe(false);
    }
  });

  it('ölçülen tabanı (%89 sınırda) GEÇER', () => {
    const d = dagilim(planla(sinir(11), sure(12)));
    expect(d.sinirdaOran).toBeLessThanOrEqual(SINIRDA_TAVAN);
    expect(d.gecti).toBe(true);
  });

  it('hepsi kısa kliplerse sınırda kalır ve bunu SÖYLER — sahte geçiş yok', () => {
    const d = dagilim(planla(sinir(5), sure(6, 1.0)));
    expect(d.sert).toBe(5);
    expect(d.gecti).toBe(false);
  });
});

describe('L/J kesim — kapı', () => {
  it('sınır sayısı klip sayısıyla uyumsuzsa durur', () => {
    expect(() => planla([4, 8], [5, 5])).toThrow(LjError);
    expect(() => planla([], [5, 5])).toThrow(LjError);
    expect(() => planla([4], [5])).toThrow(LjError);
  });

  it('rapor SERT kesimin kusur olmadığını yazar', () => {
    expect(rapor(planla(sinir(4), sure(5)))).toContain('SERT kesim kusur değildir');
  });

  it('argümansız çağrı kullanımı basar', () => {
    expect(main([])).toBe(usage());
  });

  it('--json makine okunur dağılım verir', () => {
    const veri = JSON.parse(main(['plan', '--sinir', '4,8,12', '--sure', '5,5,5,5', '--json']));
    expect(veri.kesimler).toHaveLength(3);
    expect(veri.dagilim.toplam).toBe(3);
  });
});
