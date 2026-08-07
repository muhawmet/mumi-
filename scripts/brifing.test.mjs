// BRİFİNG — plan modu kapısının sınavı.
// Ölçülen şey "soru üretti mi" değil: ÖNERİLEN CEVABIN ölçümden türeyip türemediği.
// Bir öneri gerekçesiz geliyorsa Mami tek tuşla karar veremez ve kapı işini yapmamıştır.

import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import {
  BrifingError, KELIME_HIZI, RISK_SINIFLARI, docxMetni, elementEslestir,
  kaynakOku, main, markdown, riskTara, sorulariKur, sureTahmini, tonOlc, usage, zipGirdisi,
} from './brifing.mjs';

const kaynak = (metin) => ({ ham: metin, veri: null, metin });

describe('brifing — ton kilidi', () => {
  it('çatışmasız kaynağı çatışmasız okur', () => {
    const t = tonOlc('Öğrenciler birbirlerini gülümseyerek karşılar ve birlikte çalışır.');
    expect(t.rejim).toBe('çatışmasız');
    expect(t.catisma).toBe(0);
  });

  it('gerilimli kaynağı ayırt eder', () => {
    expect(tonOlc('Yeni gelen kız yalnız oturuyor, diğerleri onu dışlıyor ve alay ediyor.').rejim)
      .toBe('gerilimli');
  });

  it('çatışmasız kaynakta "daha dramatik" seçeneği UYARILI gelir — icat edilen çatışma revize sebebi', () => {
    const [kilit0] = sorulariKur(kaynak('Herkes gülümseyerek yardım etti.'));
    const dramatik = kilit0.secenekler.find((s) => s.etiket.includes('dramatik'));
    expect(dramatik.aciklama).toContain('⚠');
    expect(kilit0.secenekler.find((s) => s.onerilen).etiket).toContain('Aynı kalsın');
  });
});

describe('brifing — risk taraması', () => {
  it('yazı taşıyan kaynağı yakalar', () => {
    expect(riskTara('Tabelada "AÇIK" yazıyor.').map((r) => r.ad)).toContain('yazı');
  });

  it('mekanik nesneyi yakalar', () => {
    expect(riskTara('Dişli çarklar birbirine geçiyor.').map((r) => r.ad)).toContain('mekanik');
  });

  it('temiz kaynakta boş döner — uydurma risk üretmez', () => {
    expect(riskTara('Bir yaprak rüzgârda kıpırdıyor.')).toEqual([]);
  });

  it('her risk sınıfının ÖLÇÜLMÜŞ gerekçesi var — gerekçesiz yasak yazılmaz', () => {
    for (const r of RISK_SINIFLARI) {
      expect(r.gerekce.length).toBeGreaterThan(20);
    }
  });
});

describe('brifing — süre', () => {
  it('kelime sayısından süre türetir', () => {
    const s = sureTahmini(Array.from({ length: 260 }, () => 'kelime').join(' '));
    expect(s.kelime).toBe(260);
    expect(s.saniye).toBe(Math.round(260 / KELIME_HIZI));
    expect(s.biçim).toMatch(/^\d+:\d{2}$/);
  });
});

describe('brifing — element rafı', () => {
  it('rafta eşleşen elementi bulur', () => {
    const e = elementEslestir('Sınıfta ogr tahtaya yazıyor.', [{ ad: 'ogr' }, { ad: 'defne1' }]);
    expect(e.rafta.map((x) => x.ad)).toEqual(['ogr']);
  });

  it('raf boşsa "eksikleri bas" önerilir — element ÖN KOŞUL', () => {
    const [, , kilit2] = sorulariKur(kaynak('Bir hikâye.'), { raf: { elementler: [] } });
    expect(kilit2.secenekler.find((s) => s.onerilen).etiket).toContain('Eksikleri bas');
  });

  it('rafta eşleşme varsa raftakiler önerilir — süreklilik bedava', () => {
    const [, , kilit2] = sorulariKur(kaynak('ogr tahtada.'), { raf: { elementler: [{ ad: 'ogr' }] } });
    expect(kilit2.secenekler.find((s) => s.onerilen).etiket).toContain('Raftakileri kullan');
  });
});

describe('brifing — kapının bütünlüğü', () => {
  it('altı kilit üretir ve sırası sabittir', () => {
    const s = sorulariKur(kaynak('Bir ders metni.'));
    expect(s.map((x) => x.kilit)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('HER kilidin önerilen bir cevabı ve gerekçesi var — açık uçlu soru yok', () => {
    for (const s of sorulariKur(kaynak('Bir ders metni.'))) {
      expect(s.secenekler.length).toBeGreaterThanOrEqual(2);
      expect(s.secenekler.some((o) => o.onerilen)).toBe(true);
      expect(s.gerekce.length).toBeGreaterThan(20);
      expect(s.kanit.length).toBeGreaterThan(0);
    }
  });

  it('cüzdan kilidinde ANA HAT Magnific — Mami\'nin kuralı', () => {
    const kilit5 = sorulariKur(kaynak('x')).find((s) => s.kilit === 5);
    expect(kilit5.secenekler.find((o) => o.onerilen).etiket).toContain('Magnific');
  });

  it('markdown çıktısı her kilidi ve gerekçesini taşır', () => {
    const md = markdown(sorulariKur(kaynak('x')), 'kaynak.txt');
    expect(md).toContain('KİLİT 0');
    expect(md).toContain('KİLİT 5');
    expect((md.match(/\*neden:\*/g) ?? [])).toHaveLength(6);
  });

  it('argümansız çağrı kullanımı basar', () => {
    expect(main([])).toBe(usage());
  });

  it('olmayan kaynak SESSİZ geçmez', () => {
    expect(() => kaynakOku('/yok/olan/dosya.txt')).toThrow(BrifingError);
  });
});

describe('brifing — .docx okuma (bağımlılıksız)', () => {
  it('WordprocessingML\'i paragraflara çevirir', () => {
    const xml = '<w:p><w:r><w:t>Birinci satır</w:t></w:r></w:p><w:p><w:r><w:t>İkinci &amp; satır</w:t></w:r></w:p>';
    expect(docxMetni(xml)).toBe('Birinci satır\nİkinci & satır');
  });

  it('ZIP olmayan tampon için null döner — boş metin UYDURMAZ', () => {
    expect(zipGirdisi(Buffer.from('bu bir zip değil'), 'word/document.xml')).toBeNull();
  });

  const gercekDocx = 'agents/COMMAND-INBOX/Bekleyen/KUVVETLERİN GÜÇ BİRLİĞİ-6. sınıf -vıdeo senaryosu.docx';
  it.skipIf(!existsSync(gercekDocx))('GERÇEK bir Word senaryosunu açar ve metin çıkarır', () => {
    const xml = zipGirdisi(readFileSync(gercekDocx), 'word/document.xml');
    expect(xml).not.toBeNull();
    const metin = docxMetni(xml);
    expect(metin.length).toBeGreaterThan(500);
    expect(sureTahmini(metin).kelime).toBeGreaterThan(100);
  });
});
