// CANARY KİLİDİ — KIRMIZI FIXTURE'LAR.
//
// Ölçülen kusur: kilit VARLIK olarak ölçülüyordu — adı doğru olan BOŞ bir dosya üretimi
// açıyordu. Buradaki her test, o gevşemenin geri gelmesi hâlinde düşer.
//
// TAŞINABİLİRLİK NOTU (bilerek): gerçek canary medyası (`images/*.png`, klipler) git'te
// İZLENMİYOR — `.gitkeep` dışında hiçbiri. O yüzden "yol diskte var" hâli repo'da izlenen
// gerçek dosyalarla sınanıyor; "yol diskte yok" hâli ise gerçekten var olmayan bir yolla.
// Sabit bir mock kullanılmadı: ölçen gerçek dosya sistemine soruyor.

import { describe, expect, it } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  lintCanaryLock, uretimAcilabilirMi, URETIMI_ACMAYAN_SOL, URETIMI_ACAN_SOL, LEHCE_ALANLARI,
} from './canary-lock.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const opt = { repoKok: REPO };

const VAR_1 = 'docs/ai/DORTLU-MASA.md';
const VAR_2 = 'agents/DIS-GOZ-BRIEF-SABLONU.md';

const kilit = (uzerine = {}) => {
  const a = {
    durum: 'PASS',
    frame: `FRAME: ${VAR_1} · sha256:8fbeaafccf4c413d`,
    klip: `KLIP: ${VAR_2} · sha256:aabbccdd11223344`,
    solHukum: 'NARROW',
    mami: '"bu lehçeyle devam"',
    lehce: [
      'ÇALIŞAN BİÇİM: tek paragraf, Camera: sonda, sessizlik kuyruğu birebir',
      'YASAKLANAN KALIP: 5 saniyede ayağa kalkma · uzuv merceğe gelirken kamera yaklaşması',
      'SINANAN TEK DEĞİŞKEN: klip sonu settle mı, hareket hâlinde kesim mi',
    ].join('\n'),
    ...uzerine,
  };
  return `# Denetleyici — CANARY KİLİDİ
DURUM: ${a.durum}

## MEDYA
${a.frame}
${a.klip}

## DIŞ GÖZ HÜKMÜ — SOL · 2026-08-05
KOŞULDU: codex exec -m gpt-5.6-sol · high · read-only · 4 dosya
OKUNAN: ${VAR_1}
HÜKÜM: ${a.solHukum}
BULGU: Kamera gerekçesi üç kartta yok.
SONUÇ: daraltıldı — kural yalnız canary kartlarına uygulandı.

## DIŞ GÖZ HÜKMÜ — AGY
KOŞULDU: agy gemini-3.6-flash-high · 3 klip · 568 sn
OKUNAN: ${VAR_2}
HÜKÜM: TARİF
BULGU: Ağız 2/3 klipte oynuyor, kuyruk 52/52 yazılıydı.
SONUÇ: uygulandı — fiil çözümü motion biçimine yazıldı.

## MAMİ HÜKMÜ
${a.mami}

## LEHÇE
${a.lehce}
`;
};

describe('temiz kilit yanlış alarm vermez', () => {
  it('tam kilit kırmızı üretmez ve üretimi AÇAR', () => {
    const { acik, olcum } = uretimAcilabilirMi(kilit(), opt);
    expect(olcum.kirmizi).toEqual([]);
    expect(acik).toBe(true);
  });

  it.each(URETIMI_ACAN_SOL)('Sol hükmü "%s" üretimi açar', (hukum) => {
    expect(uretimAcilabilirMi(kilit({ solHukum: hukum }), opt).acik).toBe(true);
  });
});

describe('BOŞ DOSYA ÜRETİMİ AÇAMAZ — asıl kusur buydu', () => {
  it('adı doğru ama içi boş kilit kırmızı', () => {
    const { kirmizi } = lintCanaryLock('# Denetleyici — CANARY KİLİDİ\n', opt);
    expect(kirmizi.length).toBeGreaterThan(5);
    expect(uretimAcilabilirMi('# Denetleyici — CANARY KİLİDİ\n', opt).acik).toBe(false);
  });
});

describe('Sol sonucu üretimi açmayan üç hâl', () => {
  it.each(URETIMI_ACMAYAN_SOL)('Sol hükmü "%s" ise üretim AÇILMAZ', (hukum) => {
    // SOL_UNAVAILABLE bloğu OKUNAN'dan muaftır; kilit yine de üretimi açmamalı.
    const metin = kilit({ solHukum: hukum });
    const { acik, sebep } = uretimAcilabilirMi(metin, opt);
    expect(acik).toBe(false);
    expect(sebep).toMatch(new RegExp(hukum.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')));
  });

  it('DURUM: FAIL üretimi açmaz (kilit temiz olsa bile)', () => {
    const { acik, olcum } = uretimAcilabilirMi(kilit({ durum: 'FAIL' }), opt);
    expect(olcum.kirmizi).toEqual([]);
    expect(acik).toBe(false);
  });

  it('DURUM sözlük dışı bir kelime "geçti" sayılamaz', () => {
    expect(lintCanaryLock(kilit({ durum: 'GAYET İYİ' }), opt).kirmizi.join('\n')).toMatch(/sözlük dışı/);
  });
});

describe('medya gerçek olmak zorunda', () => {
  it('var olmayan FRAME yolu kırmızı', () => {
    const metin = kilit({ frame: 'FRAME: images/BOYLE-BIR-KARE-YOK.png' });
    expect(lintCanaryLock(metin, opt).kirmizi.join('\n')).toMatch(/FRAME yolu diskte YOK/);
  });

  it('var olmayan KLIP yolu kırmızı', () => {
    const metin = kilit({ klip: 'KLIP: /Users/yok/boyle-bir-klip-yok.mp4' });
    expect(lintCanaryLock(metin, opt).kirmizi.join('\n')).toMatch(/KLIP yolu diskte YOK/);
  });

  it('FRAME satırı hiç yoksa kırmızı', () => {
    expect(lintCanaryLock(kilit({ frame: '' }), opt).kirmizi.join('\n')).toMatch(/FRAME satırı yok/);
  });

  it('KLIP satırı hiç yoksa kırmızı — hüküm klibe verilir, kareye değil', () => {
    expect(lintCanaryLock(kilit({ klip: '' }), opt).kirmizi.join('\n')).toMatch(/KLIP satırı yok/);
  });

  it('sahte/bozuk sha KIRMIZI', () => {
    const metin = kilit({ frame: `FRAME: ${VAR_1} · sha256:XYZ` });
    expect(lintCanaryLock(metin, opt).kirmizi.length).toBeGreaterThan(0);
  });

  it('sha hiç yoksa yalnız SARI', () => {
    const metin = kilit({ frame: `FRAME: ${VAR_1}`, klip: `KLIP: ${VAR_2}` });
    const { kirmizi, sari } = lintCanaryLock(metin, opt);
    expect(kirmizi).toEqual([]);
    expect(sari.join('\n')).toMatch(/sha256 yok/);
  });
});

describe('dış göz ve Mami yerine geçilemez', () => {
  it('SOL bloğu yoksa kırmızı', () => {
    const metin = kilit().replace(/## DIŞ GÖZ HÜKMÜ — SOL[\s\S]*?(?=## DIŞ GÖZ HÜKMÜ — AGY)/u, '');
    expect(lintCanaryLock(metin, opt).kirmizi.join('\n')).toMatch(/SOL hüküm bloğu yok/);
  });

  it('AGY bloğu yoksa kırmızı — hüküm metinden verilmiş olur', () => {
    const metin = kilit().replace(/## DIŞ GÖZ HÜKMÜ — AGY[\s\S]*?(?=## MAMİ HÜKMÜ)/u, '');
    expect(lintCanaryLock(metin, opt).kirmizi.join('\n')).toMatch(/AGY hüküm bloğu yok/);
  });

  it('MAMİ HÜKMÜ boşsa kırmızı — ajan onun yerine yazamaz', () => {
    expect(lintCanaryLock(kilit({ mami: '' }), opt).kirmizi.join('\n')).toMatch(/MAMİ HÜKMÜ boş/);
  });

  it('AGY bloğu KOŞULDU taşımazsa kırmızı (uydurma tarif duvarı)', () => {
    const metin = kilit().replace('KOŞULDU: agy gemini-3.6-flash-high · 3 klip · 568 sn\n', '');
    expect(lintCanaryLock(metin, opt).kirmizi.join('\n')).toMatch(/AGY bloğu · .*KOŞULDU satırı yok/);
  });

  it('AGY bloğunda PASS_CANDIDATE geçerse kırmızı', () => {
    const metin = kilit().replace('BULGU: Ağız 2/3 klipte oynuyor, kuyruk 52/52 yazılıydı.', 'BULGU: PASS_CANDIDATE');
    expect(lintCanaryLock(metin, opt).kirmizi.join('\n')).toMatch(/TARİF eder, hüküm vermez/);
  });
});

describe('canary\'den geriye bilgi kalmak zorunda', () => {
  it.each(LEHCE_ALANLARI)('"%s" yoksa kırmızı', (alan) => {
    const metin = kilit().replace(new RegExp(`^${alan}: .*$`, 'mu'), '');
    expect(lintCanaryLock(metin, opt).kirmizi.join('\n')).toMatch(new RegExp(`${alan} satırı yok`));
  });
});
