import { describe, expect, it } from 'vitest';
import { generateBatch } from './pure';

/**
 * REÇETE TAŞIYICILARI — enzim kilitleri (KALP-G1b, 2026-07-26)
 *
 * Ölçülen kusur: `mamilas-enzim` disiplini üretim başlamadan dört kararın kesim masasında
 * kilitlenmesini istiyor — preset, karakter oranı, tag listesi, yazı planı. Reçetede yalnız
 * yazı planı taşınıyordu (`osTextMode` + `deliveryPromise` + `turkish_labels`). Diğer üçü
 * hiçbir alanda yaşamıyordu, yani "kilitle" denen şeyin kilitlenecek yeri yoktu.
 *
 * Kanıt kodun kendi yorumunda (brain.ts:2534-2537): "üç bitmiş videonun ÜÇÜNDE de site
 * tarafında cast boştu (@mira/@efe tag'lerini AJAN yazdı)". Tag'ler her üretimde yeniden
 * uyduruldu; yaş ise `cast` serbest metninin içine elle sıkıştırıldı
 * (wordTraps.test.ts:77 — "11-12 yaş 5. sınıf öğrencisi Mira, kısa siyah saç").
 *
 * Yasa: bir karar prompt'a ULAŞIYORSA reçetede ALANI olmalı. Sohbette tekrar edilen her
 * karar geri sarma maliyetidir — Mami tekrar söyler, ajan tahmin eder, tahmin kayınca kare
 * yeniden üretilir.
 *
 * Yapılandırma üretimden birebir: world=pixar_3d_edu · palette=vibrant_edu ·
 * refs=[pixar_dimensional, pixar_emotional_staging, soul] · nano_banana_2 + kling_3.
 */

const URETIM = {
  projectTopic: 'Kuvvet ve Kuvvetin Ölçülmesi',
  projectClass: 'ders',
  sceneCount: 4,
  selectedWorldId: 'pixar_3d_edu',
  selectedPropId: 'none',
  selectedRefIds: ['pixar_dimensional', 'pixar_emotional_staging', 'soul'],
  selectedPaletteId: 'vibrant_edu',
  selectedMusicId: '',
  imageModel: 'nano_banana_2',
  videoModel: 'kling_3',
  cast: 'sınıf arkadaşları Mira ve Ali',
} as const;

function brief(extra: Record<string, unknown> = {}): string {
  const r = generateBatch({ ...URETIM, ...extra } as never) as { status: string; agentBrief?: string; contractGate?: unknown };
  expect(r.status, `generateBatch BLOCKED: ${JSON.stringify(r.contractGate)}`).toBe('GENERATED');
  return r.agentBrief || '';
}

describe('reçete taşıyıcısı — cast yaşı / sınıf', () => {
  it('castAge brief\'e iner ve yaşın stil tercihi değil casting kararı olduğunu söyler', () => {
    const b = brief({ castAge: '6. sınıf · 11-12 yaş' });
    expect(b).toContain('6. sınıf · 11-12 yaş');
    // Yaşı basmak yetmez: motorun "çocuk" deyince 6 yaşında çizmesi bugünkü hatanın kendisi.
    // Satır, yaşın bir KARAR olduğunu söylemek zorunda.
    expect(b).toMatch(/casting/i);
  });

  it('castAge boşsa satır hiç basılmaz — boş alan ajanı uydurmaya davet eder', () => {
    expect(brief()).not.toMatch(/Cast age/i);
  });
});

describe('reçete taşıyıcısı — karakter payı (50-50)', () => {
  it('characterShare brief\'e iner ve her kareye karakter sıkıştırmayı yasaklar', () => {
    const b = brief({ characterShare: 50 });
    expect(b).toMatch(/50%/);
    expect(b).toMatch(/Character share/i);
  });

  it('characterShare verilmezse satır basılmaz', () => {
    expect(brief()).not.toMatch(/Character share/i);
  });
});

describe('reçete taşıyıcısı — @tag listesi', () => {
  it('heroTags brief\'e iner ve tag\'in aynı varlık olduğu yasası basılır', () => {
    const b = brief({ heroTags: ['@mira', '@ali', '@araba'] });
    expect(b).toContain('@mira');
    expect(b).toContain('@araba');
    // Tag'in tek işi: aynı varlığın her sahnede AYNI kalması. Yasa yazılmazsa tag süs olur.
    expect(b).toMatch(/same/i);
  });

  it('boş tag listesi satır basmaz', () => {
    expect(brief({ heroTags: [] })).not.toMatch(/Recurring tags/i);
  });

  it('tag @ ile normalize edilir — Mami "mira" yazsa da tag @mira olur', () => {
    const b = brief({ heroTags: ['mira', '  @ali  ', ''] });
    expect(b).toContain('@mira');
    expect(b).toContain('@ali');
    expect(b).not.toMatch(/@@/);
  });
});

describe('taşıyıcısız brief kirlenmez', () => {
  it('üç taşıyıcı da yokken brief byte-eşit kalır (regresyon kilidi)', () => {
    expect(brief({ castAge: '', characterShare: undefined, heroTags: [] })).toBe(brief());
  });
});
