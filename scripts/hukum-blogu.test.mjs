// DIŞ GÖZ HÜKÜM BLOĞU — KIRMIZI FIXTURE'LAR.
//
// Her test, kural KALKARSA ya da GEVŞERSE düşecek biçimde yazıldı. Sahte alarm da bir
// kusurdur, o yüzden her kuralın ateşlemediği hâli de çivileniyor.
//
// Ölçüt (repo yasası): fixture, builder'ın yazdığı bir sabiti değil GERÇEK artefact biçimini
// ölçmeli. O yüzden en az bir test diskteki gerçek dosyaya, bir test de gerçek olmayan yola
// karşı koşuyor.

import { describe, expect, it } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseHukumBloklari, lintHukumBlogu, lintHukumBloklari,
  SOL_SOZLUGU, SONUC_SOZLUGU, AGY_YASAK,
} from './hukum-blogu.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const opt = { repoKok: REPO };

/** Diskte GERÇEKTEN var olan bir dosya — kanonun kendisi. */
const GERCEK_YOL = 'docs/ai/DORTLU-MASA.md';

const solBlogu = (uzerine = '') => `
## DIŞ GÖZ HÜKMÜ — SOL · 2026-08-05
KOŞULDU: codex exec -m gpt-5.6-sol · high · read-only · 1 dosya
OKUNAN: ${GERCEK_YOL}
HÜKÜM: NARROW
BULGU: Genelleme fazla geniş.
SONUÇ: daraltıldı — kural yalnız canary ref'lerine uygulandı.
${uzerine}`;

describe('ayrıştırma', () => {
  it('SOL bloğunun bütün alanlarını okur', () => {
    const [blok] = parseHukumBloklari(solBlogu());
    expect(blok.goz).toBe('SOL');
    expect(blok.hukum).toBe('NARROW');
    expect(blok.okunan).toHaveLength(1);
    expect(blok.okunan[0].yol).toBe(GERCEK_YOL);
    expect(blok.sonuc).toHaveLength(1);
  });

  it('sha256 ekini yoldan ayırır (yol adına karışmaz)', () => {
    const [blok] = parseHukumBloklari(
      `## DIŞ GÖZ HÜKMÜ — SOL\nOKUNAN: ${GERCEK_YOL} · sha256:8fbeaafccf4c413d\n`,
    );
    expect(blok.okunan[0].yol).toBe(GERCEK_YOL);
    expect(blok.okunan[0].sha).toBe('8fbeaafccf4c413d');
  });

  it('bir sonraki başlık bloğu kapatır — komşu bölüm bloğa sızmaz', () => {
    const bloklar = parseHukumBloklari(`${solBlogu()}\n## BAŞKA BÖLÜM\nHÜKÜM: CLEAR TO CONTINUE\n`);
    expect(bloklar).toHaveLength(1);
    expect(bloklar[0].hukum).toBe('NARROW');
  });

  it('aynı dosyadaki iki bloğu ayrı ayrı görür', () => {
    const { bloklar } = lintHukumBloklari(
      `${solBlogu()}\n## DIŞ GÖZ HÜKMÜ — AGY\nKOŞULDU: agy · 3 klip · 568 sn\nOKUNAN: ${GERCEK_YOL}\nHÜKÜM: TARİF\nBULGU: Ağız 2/3 klipte oynuyor.\nSONUÇ: uygulandı — fiil çözümü yazıldı.\n`,
      opt,
    );
    expect(bloklar.map((b) => b.goz)).toEqual(['SOL', 'AGY']);
  });
});

describe('temiz blok yanlış alarm vermez', () => {
  it('tam SOL bloğu kırmızı üretmez', () => {
    const [blok] = parseHukumBloklari(solBlogu());
    expect(lintHukumBlogu(blok, opt).kirmizi).toEqual([]);
  });

  it('tam AGY bloğu kırmızı üretmez', () => {
    const [blok] = parseHukumBloklari(
      `## DIŞ GÖZ HÜKMÜ — AGY\nKOŞULDU: agy gemini-3.6-flash-high · 3 klip\nOKUNAN: ${GERCEK_YOL}\nHÜKÜM: TARİF\nBULGU: Kukla bacağı 2-4 sn arasında büküldü.\nSONUÇ: uygulandı — Shot Card DEĞİŞİM satırı yeniden yazıldı.\n`,
    );
    expect(lintHukumBlogu(blok, opt).kirmizi).toEqual([]);
  });
});

describe('SAHTE CLEAR DUVARI', () => {
  it('KOŞULDU satırı olmayan CLEAR kırmızı — koşma kaydı yoksa sonuç uydurulmuştur', () => {
    const [blok] = parseHukumBloklari(
      `## DIŞ GÖZ HÜKMÜ — SOL\nOKUNAN: ${GERCEK_YOL}\nHÜKÜM: CLEAR TO CONTINUE\nBULGU: Her şey yerinde.\nSONUÇ: uygulandı — devam.\n`,
    );
    const { kirmizi } = lintHukumBlogu(blok, opt);
    expect(kirmizi.join('\n')).toMatch(/KOŞULDU satırı yok/);
  });

  it('OKUNAN yolu DİSKTE YOKSA kırmızı — okunmamış dosya kanıt değildir', () => {
    const [blok] = parseHukumBloklari(
      `## DIŞ GÖZ HÜKMÜ — SOL\nKOŞULDU: codex exec · high\nOKUNAN: docs/ai/BOYLE-BIR-DOSYA-YOK.md\nHÜKÜM: CLEAR TO CONTINUE\nBULGU: Temiz.\nSONUÇ: uygulandı — devam.\n`,
    );
    const { kirmizi } = lintHukumBlogu(blok, opt);
    expect(kirmizi.join('\n')).toMatch(/OKUNAN yol diskte YOK/);
  });

  it('OKUNAN satırı hiç yoksa kırmızı', () => {
    const [blok] = parseHukumBloklari(
      '## DIŞ GÖZ HÜKMÜ — SOL\nKOŞULDU: codex exec · high\nHÜKÜM: CLEAR TO CONTINUE\nBULGU: Temiz.\nSONUÇ: uygulandı — devam.\n',
    );
    expect(lintHukumBlogu(blok, opt).kirmizi.join('\n')).toMatch(/OKUNAN satırı yok/);
  });

  it('SOL_UNAVAILABLE dürüst kayıttır — OKUNAN şartından MUAF, ama KOŞULDU hâlâ zorunlu', () => {
    const [blok] = parseHukumBloklari(
      '## DIŞ GÖZ HÜKMÜ — SOL\nKOŞULDU: codex exec denendi · exit 1 · ağ yok\nHÜKÜM: SOL_UNAVAILABLE\nBULGU: Sol\'a ulaşılamadı.\nSONUÇ: kanıt yetersiz — canary hipotezine bağlandı.\n',
    );
    expect(lintHukumBlogu(blok, opt).kirmizi).toEqual([]);
  });
});

describe('sözlük dışına çıkılamaz', () => {
  it('uydurulmuş HÜKÜM kırmızı', () => {
    const [blok] = parseHukumBloklari(solBlogu().replace('HÜKÜM: NARROW', 'HÜKÜM: GAYET İYİ'));
    expect(lintHukumBlogu(blok, opt).kirmizi.join('\n')).toMatch(/sözlük dışı/);
  });

  it.each(SOL_SOZLUGU)('SOL için "%s" geçerli', (hukum) => {
    const [blok] = parseHukumBloklari(solBlogu().replace('HÜKÜM: NARROW', `HÜKÜM: ${hukum}`));
    expect(lintHukumBlogu(blok, opt).kirmizi.filter((k) => /sözlük dışı/.test(k))).toEqual([]);
  });

  it('AGY Sol sözlüğünü kullanamaz — gerçek göz yargıca dönüşmez', () => {
    const [blok] = parseHukumBloklari(
      `## DIŞ GÖZ HÜKMÜ — AGY\nKOŞULDU: agy · 3 klip\nOKUNAN: ${GERCEK_YOL}\nHÜKÜM: CLEAR TO CONTINUE\nBULGU: İyi.\nSONUÇ: uygulandı — devam.\n`,
    );
    expect(lintHukumBlogu(blok, opt).kirmizi.join('\n')).toMatch(/sözlük dışı|TARİF eder, hüküm vermez/);
  });

  it.each(AGY_YASAK.filter((k) => !SOL_SOZLUGU.includes(k)))(
    'AGY gövdesinde "%s" geçerse kırmızı',
    (yasak) => {
      const [blok] = parseHukumBloklari(
        `## DIŞ GÖZ HÜKMÜ — AGY\nKOŞULDU: agy · 3 klip\nOKUNAN: ${GERCEK_YOL}\nHÜKÜM: TARİF\nBULGU: Klip ${yasak} sayılabilir.\nSONUÇ: uygulandı — kayda geçti.\n`,
      );
      expect(lintHukumBlogu(blok, opt).kirmizi.join('\n')).toMatch(/TARİF eder, hüküm vermez/);
    },
  );

  it('sözlük dışı SONUÇ kırmızı — "sonra bakarız" yazılamaz', () => {
    const [blok] = parseHukumBloklari(
      solBlogu().replace('SONUÇ: daraltıldı — kural yalnız canary ref\'lerine uygulandı.', 'SONUÇ: sonra bakarız'),
    );
    expect(lintHukumBlogu(blok, opt).kirmizi.join('\n')).toMatch(/SONUÇ .* sözlük dışı/);
  });

  it.each(SONUC_SOZLUGU)('"%s" ile başlayan SONUÇ geçerli', (kelime) => {
    const [blok] = parseHukumBloklari(
      solBlogu().replace(/SONUÇ: .*/u, `SONUÇ: ${kelime} — gerekçe.`),
    );
    expect(lintHukumBlogu(blok, opt).kirmizi.filter((k) => /SONUÇ/.test(k))).toEqual([]);
  });

  it('SONUÇ satırı hiç yoksa kırmızı', () => {
    const [blok] = parseHukumBloklari(solBlogu().replace(/SONUÇ: .*/u, ''));
    expect(lintHukumBlogu(blok, opt).kirmizi.join('\n')).toMatch(/SONUÇ satırı yok/);
  });
});

describe('imza', () => {
  it('bozuk sha256 KIRMIZI — tahmin edilen imza, imzasızlıktan kötüdür', () => {
    const [blok] = parseHukumBloklari(
      `## DIŞ GÖZ HÜKMÜ — SOL\nKOŞULDU: codex exec · high\nOKUNAN: ${GERCEK_YOL} · sha256:ZZZZ\nHÜKÜM: NARROW\nBULGU: x\nSONUÇ: uygulandı — y.\n`,
    );
    const { kirmizi } = lintHukumBlogu(blok, opt);
    // "ZZZZ" sha eki olarak tanınmaz → yol bozulur ve diskte bulunmaz; her iki hâlde de kırmızı.
    expect(kirmizi.length).toBeGreaterThan(0);
  });

  it('sha256 hiç yoksa yalnız SARI — 48 canlı bloğu kilitlemeyiz', () => {
    const [blok] = parseHukumBloklari(solBlogu());
    const { kirmizi, sari } = lintHukumBlogu(blok, opt);
    expect(kirmizi).toEqual([]);
    expect(sari.join('\n')).toMatch(/sha256 yok/);
  });
});

describe('PLATFORM — CRLF sapma üretmez', () => {
  it('CRLF\'li blok LF ile aynı ölçülür', () => {
    const lf = solBlogu();
    const crlf = lf.replace(/\n/gu, '\r\n');
    const a = lintHukumBloklari(lf, opt);
    const b = lintHukumBloklari(crlf, opt);
    expect(b.kirmizi).toEqual(a.kirmizi);
    expect(b.bloklar[0].hukum).toBe(a.bloklar[0].hukum);
    expect(b.bloklar[0].okunan[0].yol).toBe(a.bloklar[0].okunan[0].yol);
  });

  it('CRLF\'li SAHTE blok da reddedilir — sahte yeşil doğmaz', () => {
    const sahte = `## DIŞ GÖZ HÜKMÜ — SOL\nOKUNAN: docs/ai/YOK.md\nHÜKÜM: CLEAR TO CONTINUE\nBULGU: x\nSONUÇ: uygulandı — y.\n`
      .replace(/\n/gu, '\r\n');
    expect(lintHukumBloklari(sahte, opt).kirmizi.length).toBeGreaterThan(0);
  });
});

describe('şablon ile ölçen aynı şeyi söylüyor', () => {
  it('DIS-GOZ-BRIEF-SABLONU örneği ölçenden temiz geçer (şablon kendi duvarını ihlal etmez)', () => {
    const ornek = `
## DIŞ GÖZ HÜKMÜ — SOL · 2026-08-05
KOŞULDU: codex exec -m gpt-5.6-sol · high · read-only · 4 dosya
OKUNAN: ${GERCEK_YOL} · sha256:8fbeaafccf4c413d
HÜKÜM: NARROW
BULGU: Ref sözleşmesi sekiz kartın üçünde TAŞIMAZ satırı taşımıyor.
SONUÇ: daraltıldı — kural yalnız canary ref'lerine uygulandı.
MAMİ: "plastik"
`;
    expect(lintHukumBloklari(ornek, opt).kirmizi).toEqual([]);
  });
});
