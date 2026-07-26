import { describe, it, expect } from 'vitest';
import { dnaDirectives } from './brain';
import { DATA } from './pure';
import type { SurgeryRef } from './pure';

/**
 * DNA → KANAL KABLOLAMASI. `dnaDirectives` ref havuzunu `DNA_MAP` kalıplarıyla eşleyip
 * prompt'a KARAR olarak giren dört kanal üretir (camera/light/staging/motion + texture).
 * Bu kanallar `buildImagePrompt`'ta doğrudan motora gidiyor: "Staging: …", "Light: …",
 * "Texture rule: …".
 *
 * ÖLÇÜLEN KUSUR (2026-07-26, gerçek kütüphane taraması): eşleşmelerin büyük kısmı
 * KAZA. İki kök sebep:
 *
 * 1. **7-katman formatının BAŞLIKLARI havuza giriyor.** Her ref DNA'sı zorunlu olarak
 *    `Signature light:` · `Texture/render:` · `Composition+motion:` başlıklarını taşır.
 *    `Signature` içindeki `nature`, `/wind|nature|organic|leaves|grass/` kuralını
 *    **41/46 dünyada** ateşliyor. `Composition` başlığı staging kuralını, `Texture`
 *    başlığı texture kuralını ateşliyor. Başlık format iskeletidir, İÇERİK değildir.
 *
 * 2. **Çıplak token'larda `\b` yok.** `fall` → `falloff` (25/46 dünya), `wind` →
 *    `window` (18/46), `action` → `refraction` (6/46). Optiğin en yaygın iki kelimesi
 *    kütüphanenin yarısına "kinetik kamera" ve "organik hareket" satırı bastırıyor.
 *
 * 3. **`.*` referans sınırını aşıyor.** Ürün masası brief'inde `hero.*silhouette`
 *    kuralı **1635 karakterlik** bir köprüyle eşleşti — "Hero" birinci ref'in adında,
 *    "silhouette" ikinci ref'in DNA'sında — ve şişe çekimine ATLET sahneleme dili
 *    bastı ("effort legible in body form").
 *
 * Not: bu sınıf daha önce ÜÇ KEZ tek tek yamandı (`brain-data.ts` yorumları:
 * "KÖK (T5 FIX-1)", "(T5 FIX-5)", "FINAL (whole-branch)"). Kalıplar değil YÖNTEM
 * düzeltiliyor.
 */

const ref = (over: Partial<SurgeryRef>): SurgeryRef => ({
  id: 'test_ref', name: 'Test Ref', cat: 'Test', use: '', avoid: '', dna: '', anchor: '',
  ...over,
} as SurgeryRef);

describe('DNA kablolaması — 7-katman BAŞLIKLARI kanal ateşlemez', () => {
  it('"Signature light:" başlığındaki nature, organik-hareket kuralını ateşlemez', () => {
    const d = dnaDirectives([ref({
      dna: 'Photoreal tabletop still. Signature light: a hard backlight driven through the body. '
        + 'Lens/optics: 100mm macro at f/5.6.',
    })], 'REAL');
    expect(d.motion).not.toMatch(/organic environmental confirmation/i);
  });

  it('"Composition+motion:" başlığı staging kuralını ateşlemez', () => {
    const d = dnaDirectives([ref({
      dna: 'Photoreal tabletop still. Composition+motion: the pour lands on the hero.',
    })], 'REAL');
    expect(d.staging).not.toMatch(/strict composition/i);
  });
});

describe('DNA kablolaması — çıplak token kelime sınırı ister', () => {
  it('"falloff" kinetik kamera kuralını ateşlemez', () => {
    const d = dnaDirectives([ref({
      dna: 'Photoreal still with real optical falloff from the stated aperture.',
    })], 'REAL');
    expect(d.camera).not.toMatch(/one bolder committed camera travel/i);
  });

  it('"window" organik-hareket kuralını ateşlemez', () => {
    const d = dnaDirectives([ref({
      dna: 'Interior still lit by a north window at midday; the room air is honest.',
    })], 'REAL');
    expect(d.motion).not.toMatch(/organic environmental confirmation/i);
  });

  it('"refraction" kinetik kamera kuralını ateşlemez', () => {
    const d = dnaDirectives([ref({
      dna: 'Glass hero still: honest refraction, what is behind the glass bends correctly.',
    })], 'REAL');
    expect(d.camera).not.toMatch(/one bolder committed camera travel/i);
  });

  it('gerçek "wind" ve "action" kelimeleri HÂLÂ ateşler (aşırı düzeltme yok)', () => {
    const rüzgar = dnaDirectives([ref({ dna: 'Exterior: wind moves through the grass at dusk.' })], 'REAL');
    expect(rüzgar.motion).toMatch(/organic environmental confirmation/i);
    const kinetik = dnaDirectives([ref({ dna: 'A leap at full speed; the impact lands hard.' })], 'REAL');
    expect(kinetik.camera).toMatch(/one bolder committed camera travel/i);
  });
});

describe('DNA kablolaması — kalıp referans sınırını aşamaz', () => {
  it('bir ref\'teki "hero" başka ref\'teki "silhouette" ile birleşip atlet sahnelemesi doğurmaz', () => {
    const d = dnaDirectives([
      ref({ id: 'a', name: 'Liquid Physics Hero', dna: 'Photoreal tabletop commercial still in the liquid-hero lineage.' }),
      ref({ id: 'b', name: 'Glass Discipline', dna: 'Black flags carve two dark edges that define the silhouette.' }),
    ], 'REAL');
    expect(d.staging).not.toMatch(/effort legible in body form/i);
  });

  it('GERÇEK VERİ: ürün masası ref\'leri brief\'e atlet/spor dili sokmaz', () => {
    const refs = (DATA as unknown as { refs: SurgeryRef[] }).refs
      .filter((r) => ['product_liquid_physics', 'product_glass_refraction'].includes(r.id));
    expect(refs).toHaveLength(2);
    const d = dnaDirectives(refs, 'REAL');
    expect(d.staging, 'ürün çekimine spor sahneleme dili girdi').not.toMatch(/effort legible in body form|athlete|action line/i);
  });
});
