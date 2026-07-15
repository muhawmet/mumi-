import { describe, expect, test } from 'vitest';
import { generateBatch } from './pure';
import { toBlockers, resolveBlockers, type Blocker } from './contract';

/**
 * TASK 3 — Typed FACT REQUIRED (handoff §6).
 *
 * Ürün niyeti (Mami 2026-07-15): eksik marka/yüz/dönem/exact-text/çelişen karar varsa sistem
 * UYDURMAZ, doğru yerde DURUR. Ajan Mami adına SEÇMEZ. Blocker'lı shot prompt üretmez; bağımsız
 * shot ilerler; project/source sorunu tüm projeyi durdurur.
 */

const codes = (bs: Blocker[]) => bs.map((b) => b.code);

describe('toBlockers — düz bulguyu typed FACT REQUIRED\'a köprüler', () => {
  test('her blocker handoff §6 alanlarını taşır: scope/code/field/reason/requiredEvidence/allowedResolutions/blocks', () => {
    // MACRO 1: `ON_SCREEN_TEXT_INTENT` (düzyazı-niyet) kaldırıldı. `DELIVERY_PROMISE_BROKEN`
    // korunur — Mami'nin AÇIK baked beyanının kendi içindeki tutarsızlığı; aynı §6 alanlarını taşır.
    const [b] = toBlockers([{ code: 'DELIVERY_PROMISE_BROKEN', message: 'Beyan geçerli öğe taşımıyor.' }], [1, 2]);

    expect(b.scope).toBe('shot');
    expect(b.code).toBe('EXACT_TEXT_REQUIRED');
    expect(b.field).toBe('deliveryPromise');
    expect(b.reason).toBe('Beyan geçerli öğe taşımıyor.');
    expect(b.requiredEvidence).toMatch(/TAM metin/);
    expect(b.blocks).toEqual([1, 2]);
    // Ajan hiçbir çözümü kendi uygulayamaz.
    expect(b.allowedResolutions.every((r) => r.preApproved === false)).toBe(true);
  });

  test('telif/kimlik → IDENTITY_UNRESOLVED · source → project-kapsamlı SOURCE_CLAIM_CHANGED', () => {
    expect(codes(toBlockers([{ code: 'CAST_IP_LEAK', message: 'x' }]))).toEqual(['IDENTITY_UNRESOLVED']);
    const [src] = toBlockers([{ code: 'SOURCE_NOT_INGESTED', message: 'x' }]);
    expect(src.code).toBe('SOURCE_CLAIM_CHANGED');
    expect(src.scope).toBe('project');
    expect(src.blocks).toBe('ALL');
  });
});

describe('resolveBlockers — ajan Mami adına SEÇMEZ (otomatik geçiş yok)', () => {
  test('her blocker pending kalır; hiçbiri otomatik çözülmez', () => {
    const blockers = toBlockers([{ code: 'IDENTITY_UNRESOLVED' as string, message: 'x' }].map(() => ({ code: 'CAST_IP_LEAK', message: 'x' })), [1]);
    const r = resolveBlockers(blockers, [1, 2, 3]);

    expect(r.pending).toHaveLength(1);
    expect(r.cleared).toBe(false);
  });

  test('bağımsız shot ilerler: shot-1 bloklu, shot 2-3 clear', () => {
    const blockers = toBlockers([{ code: 'DELIVERY_PROMISE_BROKEN', message: 'x' }], [1]);
    const r = resolveBlockers(blockers, [1, 2, 3]);

    expect(r.projectHalted).toBe(false);
    expect(r.clearedShotIds).toEqual([2, 3]);
  });

  test('project-kapsamlı blocker TÜM projeyi durdurur: hiçbir shot ilerlemez', () => {
    const blockers = toBlockers([{ code: 'SOURCE_NOT_INGESTED', message: 'x' }]);
    const r = resolveBlockers(blockers, [1, 2, 3]);

    expect(r.projectHalted).toBe(true);
    expect(r.clearedShotIds).toEqual([]);
  });
});

describe('generateBatch — BLOCKED çıktısı typed blockers taşır (site+runner+Claude+Codex aynısını görür)', () => {
  const base = {
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
  };

  // MACRO 1: kaynak DÜZYAZISINDAN metin niyeti çıkarılmaz; düzyazı üretimi BLOKLAMAZ.
  test('düzyazıda metin isteği görünse bile üretim durmaz (site niyet çıkarmaz)', () => {
    const result = generateBatch({ ...base, projectTopic: 'Ürün üzerine "MAMILAS THERMO" yazsın.' });
    expect(result.status).toBe('GENERATED');
    expect(result.scenes.length).toBeGreaterThan(0);
  });

  // Typed FACT REQUIRED yolu KORUNUR: Mami AÇIK baked beyanı verir ama prompt onu iptal ederse
  // (bugünkü clean-plate bandı) söz kırılır → BLOCKED + EXACT_TEXT_REQUIRED blocker.
  test('Mami baked beyanı verir ama prompt onu taşımaz → BLOCKED + EXACT_TEXT_REQUIRED blocker', () => {
    const result = generateBatch({
      ...base,
      projectTopic: 'Mat siyah termos masada.',
      deliveryDeclaration: { kind: 'baked', items: [{ exactText: 'MAMILAS THERMO', surface: 'ürün gövdesi', language: 'tr' }] },
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.blockers).toBeDefined();
    expect(codes(result.blockers!)).toContain('EXACT_TEXT_REQUIRED');
    expect(result.blockers!.every((b) => b.allowedResolutions.every((r) => !r.preApproved))).toBe(true);
  });
});

// NOT: "uyumsuz malzeme sessizce ikame ediliyor" (Codex 5. tur) kusuru KASITLI olarak bu turda
// KODLANMADI. Sebep: doğru düzeltme core (block/receipt) + store (auto-rewrite'ı durdur)
// koordineli olmalı ve "hard-block mı, makbuzlu-ikame mi" Mami'nin kararı. Yarım core düzeltmesi
// iki mevcut testi kırıyor ve store önceden ikame ettiği için uygulamada tetiklenmiyordu.
// Kök-neden + plan: PRODUCT-INTENT-AUDIT.md.
