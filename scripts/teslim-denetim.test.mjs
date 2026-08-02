// TESLİM DENETİMİ TESTLERİ.
//
// Önceki sürüm 20 proje dizininin 19'una YANLIŞ sayı basıyordu ve testi yoktu. Bu test
// öncelikle o kusur sınıfını kilitler: **hedef argümandan gelir, koda gömülü sabit yoktur.**
// İkinci kilit: tanınmayan biçimde 0 DENMEZ. Sessizce yanlış cevap veren doğrulayıcı,
// olmayan doğrulayıcıdan kötüdür — birincisine güvenilir.

import { describe, test, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  kareleriSay, kanonikSec, voBicimi, ozetAralik, projeyiOlc, projeleriBul, LEHCELER,
} from './teslim-denetim.mjs';

function proje(kur) {
  const d = mkdtempSync(join(tmpdir(), 'teslim-'));
  kur(d);
  return d;
}
const yaz = (d, ad, metin) => {
  const p = join(d, ad);
  mkdirSync(join(p, '..'), { recursive: true });
  writeFileSync(p, metin);
};

const VO_NUMARALI = (n) =>
  Array.from({ length: n }, (_, i) => `${i + 1}. Bu ${i + 1} numaralı cümledir ve yeterince uzundur.`).join('\n');

describe('kareleriSay — beş lehçe', () => {
  test('B1 · ### K<n> | VO', () => {
    const r = kareleriSay('### K01 | VO1 "a"\nmetin\n### K02 | VO2 "b"\n');
    expect(r.nolar).toEqual([1, 2]);
    expect(r.lehce).toMatch(/^B1/);
  });
  test('B2 · # K<n> — "VO"', () => {
    const r = kareleriSay('# K01 — "ilk"\n# K02 — "ikinci"\n');
    expect(r.nolar).toEqual([1, 2]);
    expect(r.lehce).toMatch(/^B2/);
  });
  test('B3 · K01 [ETİKET] | VO n:', () => {
    const r = kareleriSay('K01 [MİRA]  |  VO 1: "a"\nK02 [WORLD]  |  VO 2: "b"\n');
    expect(r.nolar).toEqual([1, 2]);
  });
  test('B4 · Sahne n — "VO" (start frame)', () => {
    expect(kareleriSay('Sahne 1 — "a" (start frame)\nSahne 2 — "b" (start frame)\n').nolar).toEqual([1, 2]);
  });
  test('B5 · Kare n — "VO" (start frame)', () => {
    expect(kareleriSay('Kare 1 — "a" (start frame)\nKare 2 — "b" (start frame)\n').nolar).toEqual([1, 2]);
  });

  test('"Kare planı: 41 beat" bir başlık DEĞİLDİR (rakam hemen ardından gelmeli)', () => {
    expect(kareleriSay('Kare planı: 41 beat → 35 kare\n').nolar).toEqual([]);
  });

  test('hiçbir lehçe tutmazsa lehce null döner — 0 değil, BİLİNMİYOR', () => {
    const r = kareleriSay('STYLE: bir şey\nNEGATIVE: başka şey\n');
    expect(r.lehce).toBeNull();
    expect(r.nolar).toEqual([]);
  });

  test('tekrar eden numara bir kez sayılır', () => {
    expect(kareleriSay('### K01 | a\n### K01 | a tekrar\n### K02 | b\n').nolar).toEqual([1, 2]);
  });
});

describe('kanonikSec — türev asıl dosyayı gölgelemez', () => {
  test('sonek taşıyan türev yerine kanonik seçilir', () => {
    const l = ['/x/A_SESLENDIRME-S1.txt', '/x/A_SESLENDIRME-TEK-BLOK.txt', '/x/A_SESLENDIRME.txt'];
    expect(kanonikSec(l, 'SESLENDIRME')).toBe('/x/A_SESLENDIRME.txt');
  });
  test('.txt .md\'den önce gelir (teslim yasası §5)', () => {
    expect(kanonikSec(['/x/A_PROMPTLAR.md', '/x/A_PROMPTLAR.txt'], 'PROMPTLAR')).toBe('/x/A_PROMPTLAR.txt');
  });
  test('REVİZE öneki kanonik sayılmaz', () => {
    const l = ['/x/A_REVİZE-PROMPTLAR.txt', '/x/A_PROMPTLAR.txt'];
    expect(kanonikSec(l, 'PROMPTLAR')).toBe('/x/A_PROMPTLAR.txt');
  });
  test('yalnız türev varsa ona düşülür (ölçüm durmaz)', () => {
    expect(kanonikSec(['/x/A_SESLENDIRME-TEK-BLOK.txt'], 'SESLENDIRME')).toBe('/x/A_SESLENDIRME-TEK-BLOK.txt');
  });
});

describe('voBicimi — SESLENDIRME de iki biçimde yazılıyor', () => {
  test('numaralı liste sayılır', () => {
    const d = proje((x) => yaz(x, 'A_SESLENDIRME.txt', VO_NUMARALI(12)));
    const r = voBicimi(join(d, 'A_SESLENDIRME.txt'));
    expect(r.bicim).toBe('numarali');
    expect(Object.keys(r.cumleler)).toHaveLength(12);
    rmSync(d, { recursive: true, force: true });
  });

  test('numarasız ElevenLabs bloğu TAHMİN EDİLMEZ, tek-blok denir', () => {
    const d = proje((x) => yaz(x, 'A_SESLENDIRME.txt',
      'BAŞLIK — SESLENDİRME\nNumara YOK, etiket YOK.\n\n' + 'Efe o sabah balkondaydı. '.repeat(40)));
    const r = voBicimi(join(d, 'A_SESLENDIRME.txt'));
    expect(r.bicim).toBe('tek-blok');
    expect(r.cumleler).toEqual({});
    rmSync(d, { recursive: true, force: true });
  });

  test('düzyazıdaki "6. paragraf" andıcı liste sanılmaz (≤3 numara = liste değil)', () => {
    const d = proje((x) => yaz(x, 'A_SESLENDIRME.txt',
      '1. paragraf ağır okunur.\n2. paragraf normal.\n\n' + 'Uzun düzyazı metni burada devam ediyor. '.repeat(30)));
    expect(voBicimi(join(d, 'A_SESLENDIRME.txt')).bicim).toBe('tek-blok');
    rmSync(d, { recursive: true, force: true });
  });
});

describe('ozetAralik', () => {
  test('ardışık numaralar aralığa katlanır', () => {
    expect(ozetAralik([1, 2, 3, 7, 8, 11])).toBe('K1-K3 K7-K8 K11');
  });
  test('tek numara', () => expect(ozetAralik([5])).toBe('K5'));
  test('boş', () => expect(ozetAralik([])).toBe(''));
});

describe('projeyiOlc — kusurları gerçekten yakalıyor mu', () => {
  test('VO ÖRTÜLMEMİŞ: yazılmamış kareler kırmızı, kanıt VO metni', () => {
    const d = proje((x) => {
      yaz(x, 'A_SESLENDIRME.txt', VO_NUMARALI(10));
      // Yalnız ilk 6 cümlenin karesi yazılmış.
      yaz(x, 'A_PROMPTLAR.txt', Array.from({ length: 6 }, (_, i) =>
        `# K0${i + 1} — "Bu ${i + 1} numaralı cümledir ve yeterince uzundur."\nSTYLE: x\nNEGATIVE: y\n`).join('\n'));
    });
    const r = projeyiOlc(d);
    const k = r.bulgu.find((b) => b.renk === 'KIRMIZI' && /ÖRTÜLMEMİŞ/.test(b.s));
    expect(k, JSON.stringify(r.bulgu)).toBeTruthy();
    expect(k.s).toContain('K7-K10');
    rmSync(d, { recursive: true, force: true });
  });

  test('bir kare birden çok VO taşıyorsa KIRMIZI VERİLMEZ (sayı eşitliği kural değil)', () => {
    const d = proje((x) => {
      yaz(x, 'A_SESLENDIRME.txt', VO_NUMARALI(6));
      // 3 kare, 6 VO — ama her kare iki cümleyi beyan ediyor.
      yaz(x, 'A_PROMPTLAR.txt',
        'K01 | VO 1-2: "x"\nSTYLE: s\nK02 | VO 3-4: "y"\nSTYLE: s\nK03 | VO 5-6: "z"\nSTYLE: s\n');
    });
    const r = projeyiOlc(d);
    expect(r.bulgu.filter((b) => b.renk === 'KIRMIZI')).toHaveLength(0);
    rmSync(d, { recursive: true, force: true });
  });

  test('BİÇİM TANINMADI: prompt metni var ama başlık okunamıyor → KIRMIZI, 0 değil', () => {
    const d = proje((x) => {
      yaz(x, 'A_SESLENDIRME.txt', VO_NUMARALI(4));
      yaz(x, 'A_PROMPTLAR.txt', 'STYLE: bir şey\nNEGATIVE: başka şey\n>>> blok <<<\nSTYLE: yine\n');
    });
    const r = projeyiOlc(d);
    expect(r.nKare).toBe(0);
    expect(r.bulgu.some((b) => b.renk === 'KIRMIZI' && /BİÇİM TANINMADI/.test(b.s))).toBe(true);
    rmSync(d, { recursive: true, force: true });
  });

  test('MOTION KARESİZ: motion sayısı kare sayısını aşarsa kırmızı', () => {
    const d = proje((x) => {
      yaz(x, 'A_PROMPTLAR.txt', '# K01 — "a"\nSTYLE: s\n# K02 — "b"\nSTYLE: s\n');
      mkdirSync(join(x, 'MOTION'), { recursive: true });
      for (let i = 1; i <= 6; i++) writeFileSync(join(x, 'MOTION', `0${i}.txt`), 'motion metni\n');
    });
    const r = projeyiOlc(d);
    expect(r.bulgu.some((b) => b.renk === 'KIRMIZI' && /MOTION KARESİZ/.test(b.s))).toBe(true);
    rmSync(d, { recursive: true, force: true });
  });

  test('sağlam teslimde KIRMIZI sıfırdır (yanlış alarm vermiyor)', () => {
    const d = proje((x) => {
      yaz(x, 'A_SESLENDIRME.txt', VO_NUMARALI(5));
      yaz(x, 'A_PROMPTLAR.txt', Array.from({ length: 5 }, (_, i) =>
        `### K0${i + 1} | VO${i + 1} "Bu ${i + 1} numaralı cümledir ve yeterince uzundur."\nSTYLE: s\n`).join('\n'));
    });
    const r = projeyiOlc(d);
    expect(r.bulgu.filter((b) => b.renk === 'KIRMIZI'), JSON.stringify(r.bulgu)).toHaveLength(0);
    expect(r.nVO).toBe(5);
    expect(r.nKare).toBe(5);
    rmSync(d, { recursive: true, force: true });
  });
});

describe('hedef argümandan gelir — koda gömülü proje YOK', () => {
  test('kaynakta mutlak /Users/ yolu geçmiyor', () => {
    const src = readFileSync(new URL('./teslim-denetim.mjs', import.meta.url), 'utf8');
    const govde = src.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
    expect(govde).not.toMatch(/\/Users\//);
  });

  test('iki farklı dizin iki farklı sonuç verir (sabit hedef tuzağı)', () => {
    const a = proje((x) => yaz(x, 'A_PROMPTLAR.txt', '### K01 | a\nSTYLE: s\n'));
    const b = proje((x) => yaz(x, 'B_PROMPTLAR.txt', '### K01 | a\nSTYLE: s\n### K02 | b\nSTYLE: s\n### K03 | c\nSTYLE: s\n'));
    expect(projeyiOlc(a).nKare).toBe(1);
    expect(projeyiOlc(b).nKare).toBe(3);
    rmSync(a, { recursive: true, force: true });
    rmSync(b, { recursive: true, force: true });
  });
});

describe('projeleriBul — kaplar proje sayılmaz', () => {
  test('canlı repo\'da Biten/ ve DENEME/ kendisi proje değil, içindekiler projedir', () => {
    const p = projeleriBul();
    expect(p.length).toBeGreaterThan(15);
    expect(p.some((x) => x.endsWith('/Biten'))).toBe(false);
    expect(p.some((x) => x.endsWith('/DENEME'))).toBe(false);
    expect(p.some((x) => x.includes('/Biten/'))).toBe(true);
  });
});
