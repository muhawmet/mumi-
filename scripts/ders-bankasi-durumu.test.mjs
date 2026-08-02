import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, test } from 'vitest';

import { APPROVED_LESSONS_CAP, parseApprovedLessons } from '../src/core/lessonBank.ts';
import {
  DERS_SATIRI,
  TAVAN,
  dersBankasiDurumu,
  dersleriAyikla,
  durumSatirlari,
} from './ders-bankasi-durumu.mjs';

// Bu turun ana kusur SINIFI: aynı hattı iki farklı sözleşmeyle okuyan iki doğrulayıcı.
// İki kez ısırdı (teslim-denetim adla arıyordu, baglar uzantıyı 5'e kesiyordu). Bu dosya
// ders bankasının iki okuyucusunu (lessonBank.ts ve ders-bankasi-durumu.mjs) birbirine
// çiviler: biçim ya da tavan ayrışırsa kapı KIRMIZI verir, sessizce ayrışamaz.

const ORNEK = (proje, tarih) =>
  `- Test dersi cümlesi — kaynak: ${proje} · ${tarih} · Mami onayı`;

describe('ders bankası — iki okuyucu tek sözleşme', () => {
  test('tavan lessonBank ile AYNI sayı', () => {
    expect(TAVAN).toBe(APPROVED_LESSONS_CAP);
  });

  test('ÇIPLAK satırlarda lessonBank ile birebir aynı kabul/ret', () => {
    const kabul = [
      ORNEK('5. Sınıf - Birlikte Daha Güçlüyüz', '2026-07-31'),
      '-   Boşluklu ders   —   kaynak:  Proje X · 2026-01-02 · Mami onayı  ',
    ];
    const ret = [
      '- Onay damgası olmayan ders — kaynak: Proje X · 2026-01-02',
      '- Tarihi bozuk — kaynak: Proje X · 26-01-02 · Mami onayı',
      '* Yanlış madde imi — kaynak: Proje X · 2026-01-02 · Mami onayı',
      'Düz cümle, madde bile değil',
    ];
    for (const satir of [...kabul, ...ret]) {
      const bizim = dersleriAyikla(satir).length;
      const onlarin = parseApprovedLessons(satir).length;
      expect(bizim, `ayrışma: ${satir}`).toBe(onlarin);
    }
    expect(dersleriAyikla(kabul.join('\n'))).toHaveLength(2);
    expect(dersleriAyikla(ret.join('\n'))).toHaveLength(0);
  });

  test('CRLF sahte kusur üretmiyor', () => {
    const govde = [ORNEK('P', '2026-01-01'), ORNEK('Q', '2026-01-02')].join('\r\n');
    expect(dersleriAyikla(govde)).toHaveLength(2);
  });

  // BİLEREK AYRIŞMA — sessiz değil, çivili. Sentez belgeleri ders satırını kanıtla birlikte
  // sunar ve kopyalanmak üzere tırnaklar: **Ders:** `- … · Mami onayı`. Sayım bunu görmezse
  // repodaki en zengin aday belgesi "yok" sayılır (ölçüldü: 31 ders kayıptı).
  // lessonBank BİLEREK görmez: o BANKAYI okur, banka çıplak satır taşır.
  test('backtick yerleşimi: sayım görür, lessonBank görmez — ayrışma bilinçli', () => {
    const sarmalanmis = '**Ders:** `' + ORNEK('Sentez Projesi', '2026-08-02') + '`';
    expect(dersleriAyikla(sarmalanmis)).toHaveLength(1);
    expect(parseApprovedLessons(sarmalanmis)).toHaveLength(0);
  });

  test('aynı satır iki kez sayılmaz (çıplak + backtick birlikte)', () => {
    const satir = ORNEK('P', '2026-01-01');
    expect(dersleriAyikla('`' + satir + '` ve tekrar `' + satir + '`')).toHaveLength(1);
  });

  test('APPROVED.md backtickli ders satırı TAŞIMIYOR — çift sayım riski yok', () => {
    const govde = readFileSync(join(process.cwd(), 'agents', 'lessons', 'APPROVED.md'), 'utf8');
    const ciplak = parseApprovedLessons(govde).length;
    expect(dersleriAyikla(govde)).toHaveLength(ciplak);
  });
});

describe('ders bankası — debi ölçümü', () => {
  test('ölçüm canlı repoda GERÇEKTEN koşuyor (sıfır dönerse duvar sahte)', () => {
    const d = dersBankasiDurumu(process.cwd());
    expect(d.olculemedi).toBeNull();
    expect(d.onayli).toBeGreaterThan(0);
    // Aday tarafı: bu repoda kopyala-yapıştır hazır satır taşıyan aday dosyaları var.
    // Sıfıra düşerse ya hepsi onaylanmıştır ya ölçüm körelmiştir — ikisi de görülmeli.
    expect(d.aday).toBeGreaterThan(0);
    expect(d.sonOnay).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('dizin yoksa ÖLÇEMEDİ der — sessiz sıfır dönmez', () => {
    const d = dersBankasiDurumu('/boyle-bir-yol-yok-42');
    expect(d.olculemedi).toBeTruthy();
    expect(durumSatirlari(d)[0]).toMatch(/ÖLÇEMEDİ/);
  });

  test('tek kaynaklı banka uyarı üretir — "sistem 1 videodan öğrenmiş"', () => {
    const satirlar = durumSatirlari({
      onayli: 7, aday: 43, adayDosya: 7, sonOnay: '2026-07-31',
      kaynakSayisi: 1, tasma: 0, olculemedi: null,
    });
    expect(satirlar.join('\n')).toMatch(/TEK projeden/);
  });

  test('çok kaynaklı bankada o uyarı SUSAR (yanlış alarm üretmez)', () => {
    const satirlar = durumSatirlari({
      onayli: 7, aday: 0, adayDosya: 0, sonOnay: '2026-07-31',
      kaynakSayisi: 4, tasma: 0, olculemedi: null,
    });
    expect(satirlar.join('\n')).not.toMatch(/TEK projeden/);
  });

  test('tavan aşılınca SESSİZ düşmez — kırmızı taşma satırı basar', () => {
    const satirlar = durumSatirlari({
      onayli: TAVAN + 3, aday: 0, adayDosya: 0, sonOnay: '2026-08-01',
      kaynakSayisi: 3, tasma: 3, olculemedi: null,
    }).join('\n');
    expect(satirlar).toMatch(/TAŞMA/);
    expect(satirlar).toMatch(/3 ders/);
  });

  test('tavan bütçesi uyarısı: kalan yerden çok aday varsa söyler', () => {
    const satirlar = durumSatirlari({
      onayli: 7, aday: 43, adayDosya: 7, sonOnay: '2026-07-31',
      kaynakSayisi: 1, tasma: 0, olculemedi: null,
    }).join('\n');
    expect(satirlar).toMatch(/13 satır yer kaldı/);
  });

  test('aday yoksa taşma/bütçe gürültüsü yapmaz', () => {
    const satirlar = durumSatirlari({
      onayli: 5, aday: 0, adayDosya: 0, sonOnay: '2026-08-01',
      kaynakSayisi: 3, tasma: 0, olculemedi: null,
    }).join('\n');
    expect(satirlar).not.toMatch(/tavan bütçesi/);
    expect(satirlar).not.toMatch(/TAŞMA/);
  });
});
