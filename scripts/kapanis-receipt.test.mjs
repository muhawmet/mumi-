// KAPANIŞ RECEIPT — KIRMIZI FIXTURE'LAR.
//
// Ölçülen kusur: Destek ve Hareket "kapandı" sayıldı ve 360 MB'lık final filmin adı repo'nun
// hiçbir yerinde geçmedi. Kötü bir video "bitti" diye kaybolursa ondan öğrenilecek şey de
// kaybolur. Buradaki her test, o makbuzun gevşemesi hâlinde düşer.
//
// TAŞINABİLİRLİK: gerçek medya repo dışında (~/Desktop) ve Windows'ta o yol yok. O yüzden
// "yol var" hâli repo İÇİ dosyalarla sınanıyor; canlı Destek receipt'i ise yalnız BİÇİM
// olarak ölçülüyor (sözlük · sha uzunluğu · süre kalıbı) — makine bağımsız olan kısmı budur.

import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseReceipt, lintReceipt, sureBicimle, KAPANIS_DURUMLARI, KANIT_ZORUNLU,
} from './kapanis-receipt.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const opt = { repoKok: REPO };

const SHA = 'a'.repeat(64);
/** Repo İÇİ, her makinede var olan bir kanıt yolu. */
const KANIT_VAR = 'docs/ai/DORTLU-MASA.md';
/** Testte "var" sayılacak mutlak kaynak — dosyaVar enjekte edilerek makineden bağımsızlaşır. */
const KAYNAK = '/Users/x/Desktop/film.mp4';

const receipt = (uzerine = {}) => {
  const a = {
    durum: 'REJECTED_HARVESTED', kaynak: KAYNAK, sha: SHA, sure: '3:16', kanit: KANIT_VAR, ...uzerine,
  };
  return `# 00-DURUM

## KAPANIŞ RECEIPT
${a.durum === null ? '' : `DURUM: ${a.durum}`}
${a.kaynak === null ? '' : `KAYNAK: ${a.kaynak}`}
${a.sha === null ? '' : `SHA256: ${a.sha}`}
${a.sure === null ? '' : `SÜRE: ${a.sure}`}
${a.kanit === null ? '' : `KANIT: ${a.kanit}`}
`;
};

/** KAYNAK mutlak yolunu var sayan ölçüm — makineden bağımsız. */
const sabitVar = {
  ...opt,
  dosyaVar: (yol) => yol === KAYNAK || existsSync(resolve(REPO, yol)),
};

describe('temiz receipt yanlış alarm vermez', () => {
  it('tam receipt kırmızı üretmez', () => {
    expect(lintReceipt(receipt(), sabitVar).kirmizi).toEqual([]);
  });

  it.each(KAPANIS_DURUMLARI)('"%s" geçerli bir kapanış hâlidir', (durum) => {
    const metin = receipt({ durum });
    expect(lintReceipt(metin, sabitVar).kirmizi).toEqual([]);
  });

  it('sha dosyaya karşı doğrulanmadıysa SARI (kırmızı değil)', () => {
    const { kirmizi, sari } = lintReceipt(receipt(), sabitVar);
    expect(kirmizi).toEqual([]);
    expect(sari.join('\n')).toMatch(/doğrulanmadı/);
  });
});

describe('makbuzsuz kapanış meşru değil', () => {
  it('blok hiç yoksa kırmızı', () => {
    expect(lintReceipt('# 00-DURUM\nAŞAMA: bitti\n', opt).kirmizi.join('\n'))
      .toMatch(/KAPANIŞ RECEIPT bloğu yok/);
  });

  it('DURUM sözlük dışı olamaz — "bitti" bir kapanış hâli değildir', () => {
    expect(lintReceipt(receipt({ durum: 'bitti' }), sabitVar).kirmizi.join('\n')).toMatch(/sözlük dışı/);
  });

  it('KAYNAK yoksa kırmızı', () => {
    expect(lintReceipt(receipt({ kaynak: null }), sabitVar).kirmizi.join('\n')).toMatch(/KAYNAK satırı yok/);
  });

  it('KAYNAK göreli yol olamaz — başka makinede sessizce başka şeyi gösterir', () => {
    expect(lintReceipt(receipt({ kaynak: 'videolar/film.mp4' }), sabitVar).kirmizi.join('\n'))
      .toMatch(/mutlak yol değil/);
  });

  // 🔴 Sol karşı-denetimi (RESHAPE, madde 7) burayı DARALTTI. Medya makineye özgüdür
  // (~/Desktop); Mac'te geçerli bir makbuzu Windows'ta kırmızı yapmak, doğru bir kaydı
  // yanlış ilan etmekti. Ayrım: yokluk tek başına SARI, sahibi makinede KIRMIZI.
  it('KAYNAK bu makinede yoksa varsayılan SARI — başka makinede yazılmış olabilir', () => {
    const { kirmizi, sari } = lintReceipt(receipt({ kaynak: '/Users/yok/olmayan-film.mp4' }), opt);
    expect(kirmizi.filter((k) => /KAYNAK/.test(k))).toEqual([]);
    expect(sari.join('\n')).toMatch(/KAYNAK bu makinede YOK/);
  });

  it('medyanın SAHİBİ makinede (kapanış kapısı · dogrula) KAYNAK yokluğu KIRMIZI', () => {
    const { kirmizi } = lintReceipt(
      receipt({ kaynak: '/Users/yok/olmayan-film.mp4' }),
      { ...opt, kaynakZorunlu: true },
    );
    expect(kirmizi.join('\n')).toMatch(/KAYNAK bu makinede YOK/);
  });
});

describe('SAHTE HASH DUVARI', () => {
  it('sha yoksa kırmızı', () => {
    expect(lintReceipt(receipt({ sha: null }), sabitVar).kirmizi.join('\n')).toMatch(/SHA256 satırı yok/);
  });

  it('sha biçimi bozuksa kırmızı', () => {
    expect(lintReceipt(receipt({ sha: 'deadbeef' }), sabitVar).kirmizi.join('\n')).toMatch(/SHA256 biçimi bozuk/);
  });

  it('sha dosyayla UYUŞMUYORSA kırmızı — tahmin edilen imza, imzasızlıktan kötüdür', () => {
    const { kirmizi } = lintReceipt(receipt(), { ...sabitVar, gercekSha: 'b'.repeat(64) });
    expect(kirmizi.join('\n')).toMatch(/dosyayla UYUŞMUYOR/);
  });

  it('sha dosyayla uyuşuyorsa temiz', () => {
    expect(lintReceipt(receipt(), { ...sabitVar, gercekSha: SHA }).kirmizi).toEqual([]);
  });
});

describe('kötü video kaybolmaz', () => {
  it.each(KANIT_ZORUNLU)('"%s" kapanışı KANIT yolu olmadan geçemez', (durum) => {
    expect(lintReceipt(receipt({ durum, kanit: null }), sabitVar).kirmizi.join('\n'))
      .toMatch(/KANIT satırı yok/);
  });

  it('KANIT yolu diskte yoksa kırmızı — uydurma kanıt geçmez', () => {
    expect(lintReceipt(receipt({ kanit: 'agents/OLMAYAN-KANIT.md' }), sabitVar).kirmizi.join('\n'))
      .toMatch(/KANIT yolu diskte YOK/);
  });

  it('APPROVED kapanışta KANIT zorunlu değil', () => {
    expect(lintReceipt(receipt({ durum: 'APPROVED', kanit: null }), sabitVar).kirmizi).toEqual([]);
  });
});

describe('süre', () => {
  it.each(['3:16', '0:07', '1:03:20'])('"%s" geçerli biçim', (sure) => {
    expect(lintReceipt(receipt({ sure }), sabitVar).kirmizi).toEqual([]);
  });

  it.each(['196', '3.16', '3:75'])('"%s" kırmızı', (sure) => {
    expect(lintReceipt(receipt({ sure }), sabitVar).kirmizi.join('\n')).toMatch(/SÜRE biçimi bozuk/);
  });

  it('saniye → biçim çevirisi doğru', () => {
    expect(sureBicimle(195.75)).toBe('3:16');
    expect(sureBicimle(7)).toBe('0:07');
    expect(sureBicimle(3800)).toBe('1:03:20');
  });
});

describe('PLATFORM ve TAŞINMA — sessiz düşme yok', () => {
  it('CRLF ve LF aynı sonucu verir — Windows birincil ortam', () => {
    const lf = receipt();
    const crlf = lf.replace(/\n/gu, '\r\n');
    const a = lintReceipt(lf, sabitVar);
    const b = lintReceipt(crlf, sabitVar);
    expect(b.kirmizi).toEqual(a.kirmizi);
    expect(b.receipt.durum).toBe(a.receipt.durum);
    expect(b.receipt.sha256).toBe(a.receipt.sha256);
  });

  it('proje Biten/ altına TAŞINDIKTAN sonra da receipt çözülür — KANIT repo köküne göre', () => {
    // KANIT repo-göreli yazılır; proje klasörü taşınsa da repo kökü değişmediği için yol tutar.
    // Bu, "taşınan projede receipt sessizce düşer" kusurunun testi.
    const tasinmis = receipt({
      kanit: 'agents/COMMAND-INBOX/Biten/5. Sınıf - Destek ve Hareket Sistemi/Destek ve Hareket_AGY-TAM-VIDEO.md',
    });
    expect(lintReceipt(tasinmis, sabitVar).kirmizi).toEqual([]);
  });

  it('receipt bloğundan SONRAKİ başlık bloğa sızmaz (alan hırsızlığı yok)', () => {
    const metin = `${receipt()}\n## BAŞKA BÖLÜM\nDURUM: APPROVED\nSHA256: ${'f'.repeat(64)}\n`;
    const r = parseReceipt(metin);
    expect(r.durum).toBe('REJECTED_HARVESTED');
    expect(r.sha256).toBe(SHA);
  });
});

describe('canlı Destek receipt\'i — gerçek artefact ölçülüyor', () => {
  const YOL = 'agents/COMMAND-INBOX/Biten/5. Sınıf - Destek ve Hareket Sistemi/00-DURUM.txt';

  it('gerçek 00-DURUM.txt bir receipt taşıyor ve biçimi sözleşmeye uyuyor', () => {
    const r = parseReceipt(readFileSync(resolve(REPO, YOL), 'utf8'));
    expect(r, `${YOL} içinde KAPANIŞ RECEIPT bloğu yok`).not.toBeNull();
    expect(KAPANIS_DURUMLARI).toContain(r.durum);
    expect(r.sha256).toMatch(/^[0-9a-f]{64}$/u);
    expect(r.sure).toMatch(/^(?:\d+:)?[0-5]?\d:[0-5]\d$/u);
    expect(r.kaynak.startsWith('/')).toBe(true);
  });

  it('reddedilmiş iş "iyi" ilan edilmedi ve kanıtı repo\'da duruyor', () => {
    const r = parseReceipt(readFileSync(resolve(REPO, YOL), 'utf8'));
    expect(r.durum).toBe('REJECTED_HARVESTED');
    expect(existsSync(resolve(REPO, r.kanit)), `kanıt yolu yok: ${r.kanit}`).toBe(true);
  });
});
