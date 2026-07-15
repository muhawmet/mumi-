import { describe, expect, test } from 'vitest';
import { generateBatch } from './pure';
import { deriveDeliveryPromise, type DeliveryDeclaration } from './contract';

/**
 * DELIVERY PROMISE — MACRO 1 (Manual World Studio, Mami 2026-07-15).
 *
 * Söz düzyazıdan TÜRETİLMEZ ve düzyazı üretimi BLOKLAMAZ. Site kaynağı regex/NLP ile analiz
 * etmez; kaynağın metin isteğini kare için AJAN yazar (brief içinde). Söz YALNIZ Mami'nin açık
 * beyanından (`DeliveryDeclaration`) ya da `osTextMode: CLEAN` kilidinden doğar ve — beyan
 * verildiyse — çıktıya karşı ölçülür.
 */

/** Mami'nin gerçek termos source'u. Tek karakteri değişmez. */
const TERMOS_SOURCE =
  'Yeni bir mat siyah termos için 30 saniyelik ürün filmi. Termos sabah işe giden bir kullanıcının masasında; buhar, kapak mekanizması ve 12 saat sıcak tutma özelliği görünür kanıtlarla anlatılsın. Ekranda yalnızca ürün üzerindeki ‘MAMILAS THERMO’ yazısı baked-in görünsün; anlatıcı tek kişi olsun.';

function termosBatch(extra: Record<string, unknown> = {}) {
  return generateBatch({
    projectTopic: TERMOS_SOURCE,
    projectClass: 'PRODUCT_HERO',
    sceneCount: 3,
    cast: '',
    selectedWorldId: 'product_brand_real',
    selectedPropId: '',
    selectedRefIds: ['product_macro'],
    selectedPaletteId: 'native_world',
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
    ...extra,
  });
}

const codes = (r: ReturnType<typeof generateBatch>) => r.contractGate.findings.map((f) => f.code);

describe('MACRO 1 — kaynak düzyazısındaki metin isteği üretimi durdurmaz', () => {
  test('kaynak metin isteği taşısa bile (beyan yok) üretim AKAR — site niyet çıkarmaz', () => {
    const result = termosBatch();

    expect(codes(result)).not.toContain('ON_SCREEN_TEXT_INTENT');
    expect(result.status).toBe('GENERATED');
    expect(result.scenes.length).toBeGreaterThan(0);
  });

  test('Mami baked beyanı verdi ama bugünkü prompt onu iptal ediyorsa söz KIRILIR (BLOCKED)', () => {
    const declaration: DeliveryDeclaration = {
      kind: 'baked',
      items: [{ exactText: 'MAMILAS THERMO', surface: 'ürün gövdesi', language: 'tr' }],
    };
    const result = termosBatch({ deliveryDeclaration: declaration });

    expect(codes(result)).toContain('DELIVERY_PROMISE_BROKEN');
    expect(result.status).toBe('BLOCKED');
    expect(result.scenes).toHaveLength(0);
  });
});

describe('Söz — Mami\'nin BEYANINDAN doğar, düzyazıdan değil', () => {
  test('beyan yoksa söz pedagogy_auto olur — düzyazı taranmaz (intent_pending YOK)', () => {
    const promise = deriveDeliveryPromise({ sourceText: TERMOS_SOURCE, sourceId: 'ba24888a' });
    expect(promise).toEqual({ kind: 'pedagogy_auto' });
  });

  test('baked beyanı verilince metin karakter karakter korunur: scrub yok, kısaltma yok', () => {
    const promise = deriveDeliveryPromise({
      sourceText: TERMOS_SOURCE,
      declaration: { kind: 'baked', items: [{ exactText: 'MAMILAS THERMO', surface: 'ürün gövdesi' }] },
    });

    expect(promise.kind).toBe('baked_text');
    if (promise.kind !== 'baked_text') return;
    expect(promise.items[0].exactText).toBe('MAMILAS THERMO');
    expect(promise.items[0].surface).toBe('ürün gövdesi');
  });

  test('Türkçe glif kilidi: beyan Ç/Ş taşırsa dil tr olarak kilitlenir', () => {
    const promise = deriveDeliveryPromise({
      sourceText: 'Ahşap etiketlerde metin görünsün.',
      declaration: { kind: 'baked', items: [{ exactText: 'ÇOCUK / KARDEŞ', surface: 'ahşap etiket' }] },
    });

    expect(promise.kind).toBe('baked_text');
    if (promise.kind !== 'baked_text') return;
    expect(promise.items[0].exactText).toBe('ÇOCUK / KARDEŞ');
    expect(promise.items[0].language).toBe('tr');
    expect(promise.items[0].normalization).toBe('NFC');
  });

  // Mami'nin 2026-07-05 kilidi: kaynak sessizse ortada SÖZ YOKTUR, pedagoji karar verir.
  test('MAMİ KİLİDİ KORUNUR — beyan yoksa pedagogy_auto', () => {
    const promise = deriveDeliveryPromise({
      sourceText: 'Fırtına bütün gece sürdü ve sabah deniz durulmuştu.',
      osTextMode: 'AUTO',
    });

    expect(promise).toEqual({ kind: 'pedagogy_auto' });
  });
});

describe('Karşılıklı dışlama — Mami\'nin CLEAN kilidi ile açık baked beyanı çelişir', () => {
  test('Mami CLEAN kilidi verip AYNI ANDA baked beyan verirse çelişki sessizce yutulmaz, üretim durur', () => {
    const result = termosBatch({
      osTextMode: 'CLEAN',
      deliveryDeclaration: { kind: 'baked', items: [{ exactText: 'MAMILAS THERMO', surface: 'ürün gövdesi' }] },
    });

    expect(codes(result)).toContain('DELIVERY_PROMISE_CONFLICT');
    expect(result.status).toBe('BLOCKED');
    expect(result.scenes).toHaveLength(0);
  });

  test('CLEAN kilidi ama beyan YOK → çelişki yok, üretim akar (düzyazı taranmaz)', () => {
    const result = termosBatch({ osTextMode: 'CLEAN' });

    expect(codes(result)).not.toContain('DELIVERY_PROMISE_CONFLICT');
    expect(result.status).toBe('GENERATED');
  });
});

describe('Boş baked beyan içi boş baked_text ÜRETMEZ', () => {
  test('items:[] → baked_text[] DEĞİL (tutarsız söz ihraç edilemez)', () => {
    const p = deriveDeliveryPromise({ sourceText: 'x', declaration: { kind: 'baked', items: [] } });
    expect(p.kind).not.toBe('baked_text');
  });
  test('hepsi boş item → baked_text[] DEĞİL', () => {
    const p = deriveDeliveryPromise({ sourceText: 'x', declaration: { kind: 'baked', items: [{ exactText: '', surface: '' }] } });
    expect(p.kind).not.toBe('baked_text');
  });
});
