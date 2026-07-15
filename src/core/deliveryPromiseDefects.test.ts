import { describe, expect, test } from 'vitest';
import { generateBatch } from './pure';
import { canonicalHash, deriveDeliveryPromise, validateDeliveryPromise } from './contract';
import { ingestSource } from './source';

/**
 * MACRO 1 — Manual World Studio (Mami, 2026-07-15).
 *
 * Kaynak DÜZYAZISINDAN metin niyeti çıkaran her şey KALDIRILDI. Site regex/NLP ile source'u
 * analiz etmez ve üretimi bloke etmez. Kaynağın metin isteğini kare için AJAN yazar (brief
 * içinde, Mami'nin doğrudan talimatıyla). Söz YALNIZ Mami'nin açık beyanından / CLEAN kilidinden
 * doğar.
 *
 * Bu dosya eski "niyet dedektörü doğruluğu" matrisinin (WANTED/LEGIT/ANLATI, CODEX #3-#6)
 * tarihsel yerini alır: artık ÖLÇÜLEN gerçek, hiçbir düzyazının üretimi bloklamadığıdır. Beyan
 * yolu ve taşınabilir canonical hash aynen KORUNUR.
 */

function run(projectTopic: string, extra: Record<string, unknown> = {}) {
  return generateBatch({
    projectTopic,
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

describe('MACRO 1 — düzyazıdaki metin isteği ÜRETİMİ BLOKLAMAZ (site niyet çıkarmaz)', () => {
  test('AUTO kısa başlığı bile kare yazısına dönüştürmez — source içeriktir, text izni değil', () => {
    const result = run('Su Döngüsü');
    expect(result.status).toBe('GENERATED');
    expect(result.scenes.every((scene) => scene.onScreenText === null)).toBe(true);
    expect(result.scenes.every((scene) => !scene.imagePrompt.includes("Visible text in-frame: 'Su Döngüsü'"))).toBe(true);
    expect(result.scenes.every((scene) => scene.imagePrompt.includes('clean plate'))).toBe(true);
  });

  test('DENSE yalnız açık Mami modu olduğunda öğretici label üretir', () => {
    const result = run('Su Döngüsü', { osTextMode: 'DENSE' });
    expect(result.status).toBe('GENERATED');
    expect(result.scenes.some((scene) => scene.onScreenText === 'Su Döngüsü')).toBe(true);
  });

  // Bu cümlelerin hepsi eski dedektörü tetikliyordu ("yazsın/basılsın/logosu/ibaresi..."). Artık
  // hiçbiri üretimi durdurmaz: kaynağın metin isteği brief içinde ajana taşınır, karar ajanındır.
  test.each([
    ['tırnaksız', 'Ekranda yalnızca ürün üzerindeki MAMILAS THERMO yazısı baked-in görünsün.'],
    ['yazsın', 'Termos üzerinde “MAMILAS THERMO” yazsın.'],
    ['yazılsın', 'Ürün üzerine “MAMILAS THERMO” yazılsın.'],
    ['metni basılı', 'Termos üzerinde “MAMILAS THERMO” metni basılı görünsün.'],
    ['ibaresi', 'Üründe “MAMILAS THERMO” ibaresi yer alsın.'],
    ['logo', 'Ürün üzerindeki “MAMILAS THERMO” logosu görünsün.'],
    ['slogan/görünsün', 'Slogan olarak "taze her gün" görünsün.'],
    ['İngilizce print', 'print ORGANIC HONEY on the label'],
    ['pozitif + olumsuz karışık', 'Üründe “MAMILAS THERMO” yazısı görünsün, başka hiçbir yazı olmasın.'],
  ])('%s → GENERATED (blok yok)', (_label, topic) => {
    const result = run(topic);
    expect(result.status).toBe('GENERATED');
    expect(result.scenes.length).toBeGreaterThan(0);
    // Ekran-metni niyet kodu tamamen kaldırıldı.
    expect(codes(result)).not.toContain('ON_SCREEN_TEXT_INTENT');
  });

  // Meşru "temiz/olumsuz" briefler de akar — zaten hiçbir tarama yok.
  test.each([
    ['olumsuz — görünmesin', 'Müşteri “minimal ve sessiz” dedi; termosun mevcut ürün yazısı görünmesin.'],
    ['replik — desin', 'Oyuncu “Bugün başlıyoruz” desin; ürün yazısı kadraja girmesin.'],
    ['anlatı — logo durur', 'Logo işareti kontrollü bir key light altında keskin ve net durur.'],
  ])('%s → GENERATED', (_label, topic) => {
    const result = run(topic);
    expect(result.status).toBe('GENERATED');
  });

  test('niyet düzenlenmiş storyboard beat\'inde olsa bile üretim akar (tarama yok)', () => {
    const result = run('Termos filmi', {
      rawSource: 'Mat siyah termos masa üzerinde döner.',
      sourceBeats: ingestSource('Termos üzerinde “MAMILAS THERMO” yazısı baked-in görünsün.'),
    });
    expect(result.status).toBe('GENERATED');
    expect(codes(result)).not.toContain('ON_SCREEN_TEXT_INTENT');
  });
});

describe('MACRO 1 — söz YALNIZ Mami\'nin açık beyanından doğar', () => {
  test('beyan yoksa söz pedagogy_auto olur — düzyazı taranmaz, intent_pending YOK', () => {
    const promise = deriveDeliveryPromise({
      sourceText: 'Ekranda yalnızca ürün üzerindeki ‘MAMILAS THERMO’ yazısı baked-in görünsün.',
      sourceId: 'ba24888a',
    });
    expect(promise).toEqual({ kind: 'pedagogy_auto' });
  });

  test('CLEAN kilidi → temiz plaka (Mami kilidi)', () => {
    const promise = deriveDeliveryPromise({ sourceText: 'x', osTextMode: 'CLEAN' });
    expect(promise).toEqual({ kind: 'clean_plate', reason: 'mami_lock' });
  });

  test('baked beyanı → karakter karakter korunur (scrub yok, kısaltma yok)', () => {
    const promise = deriveDeliveryPromise({
      sourceText: 'Ürün üzerinde metin.',
      declaration: { kind: 'baked', items: [{ exactText: 'MAMILAS THERMO', surface: 'ürün' }] },
    });
    expect(promise.kind).toBe('baked_text');
    if (promise.kind !== 'baked_text') return;
    expect(promise.items[0].exactText).toBe('MAMILAS THERMO');
    expect(promise.items[0].surface).toBe('ürün');
  });

  test('beyan verildi ama prompt onu hiç taşımıyorsa söz KIRILMIŞTIR', () => {
    const promise = deriveDeliveryPromise({
      sourceText: 'Ürün üzerinde metin görünsün.',
      declaration: { kind: 'baked', items: [{ exactText: 'MAMILAS THERMO', surface: 'ürün' }] },
    });
    const findings = validateDeliveryPromise(promise, 'A matte black thermos on a desk.', 1);
    expect(findings.map((f) => f.code)).toContain('DELIVERY_PROMISE_BROKEN');
  });
});

describe('MACRO 1 — boş/kör baked beyan üretimi ATLATAMAZ (beyan iç tutarlılığı korunur)', () => {
  test.each([
    ['boş liste', [] as Array<{ exactText: string; surface: string }>],
    ['boş metin+yüzey', [{ exactText: '', surface: '' }]],
    ['yüzeysiz', [{ exactText: 'MAMILAS', surface: '' }]],
  ])('%s → BLOCKED', (_label, items) => {
    const r = run('Mat siyah termos masada.', {
      deliveryDeclaration: { kind: 'baked', items },
    });
    expect(codes(r)).toContain('DELIVERY_PROMISE_BROKEN');
    expect(r.status).toBe('BLOCKED');
  });
});

describe('Taşınabilir canonical hash KORUNUR — NFC-eşdeğer anahtarlar aynı byte üretir', () => {
  test('NFD ve NFC yazılmış aynı anahtar aynı hash i verir', () => {
    const nfdKey = String.fromCodePoint(0x43, 0x327); // C + birleşen çengel
    const nfcKey = String.fromCodePoint(0xc7);        // tek kod noktası Ç

    expect(nfdKey).not.toBe(nfcKey);              // byte olarak farklılar
    expect(nfdKey.normalize('NFC')).toBe(nfcKey); // ama AYNI karar

    expect(canonicalHash({ [nfdKey]: 1, Z: 2 })).toBe(canonicalHash({ [nfcKey]: 1, Z: 2 }));
  });
});
