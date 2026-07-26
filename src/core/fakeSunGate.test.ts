import { describe, expect, it } from 'vitest';
import { namedKeySourceClause, resolveLightAuthorityReceipt, dnaDirectives, registerOf } from './brain';
import { DATA, generateBatch } from './pure';

/**
 * SAHTE GÜNEŞ KAPISI (KALP-G1e, 2026-07-26)
 *
 * Mami'nin üretim gözlemi: *"Fotolara baksan hep sahte bi ışık geliyor güneşten, odada bile."*
 *
 * Ölçülen kök neden (gerçek `generateBatch` · pixar_3d_edu · vibrant_edu, tek sahne):
 * `motivated` 8× · `window` 3× · `sun` 3× · `lamp` 3×. Üç kanal aynı anahtar ışığı ayrı ayrı
 * söylüyordu — dünya ışık yasası, ref DNA ve palet. Üstelik dünya yasası bir kaynak MENÜSÜ
 * sayıyor ("window sun, desk lamp, overhead classroom fluorescent, screen glow") ve hiçbir
 * sahne o menüden SEÇİM yapmıyordu. Motor en göze batanı seçip odaya pencere uyduruyordu.
 *
 * İki kol: (1) anlaşma tekilleştirir — dünya kendi kaynağını adlandırıyorsa ref DNA'nın
 * kaynak cümlesi düşer (`WORLD_AGREES_DEDUPED`), (2) sahne kaynağı yazıldıysa menü çözülür,
 * yazılmadıysa uydurma yasaklanır.
 */

const URETIM = {
  projectTopic: 'Kuvvet ve Kuvvetin Ölçülmesi',
  projectClass: 'ders',
  sceneCount: 3,
  selectedWorldId: 'pixar_3d_edu',
  selectedPropId: 'none',
  selectedRefIds: ['pixar_dimensional', 'pixar_emotional_staging', 'soul'],
  selectedPaletteId: 'vibrant_edu',
  selectedMusicId: '',
  imageModel: 'nano_banana_2',
  videoModel: 'kling_3',
  cast: 'Mira ve Ali',
} as const;

const firstPrompt = (extra: Record<string, unknown> = {}): string => {
  const r = generateBatch({ ...URETIM, ...extra } as never) as { status: string; scenes: { imagePrompt: string }[] };
  expect(r.status).toBe('GENERATED');
  return r.scenes[0].imagePrompt;
};

const count = (text: string, word: string) => (text.match(new RegExp(word, 'gi')) || []).length;

describe('anlaşma tekilleştirir, çoğaltmaz', () => {
  it('dünya kendi kaynağını adlandırıyorsa ref DNA\'nın kaynak cümlesi düşer ve makbuza geçer', () => {
    const world = DATA.worlds.find((w) => w.id === 'pixar_3d_edu')!;
    const dna = dnaDirectives(
      URETIM.selectedRefIds.map((id) => DATA.refs.find((r) => r.id === id)!),
      registerOf('ANIMATION_EDU'),
    );
    const receipt = resolveLightAuthorityReceipt(dna.light, world);
    expect(receipt.rule).toBe('WORLD_AGREES_DEDUPED');
    expect(receipt.winner).toBe('WORLD_LIGHT_LAW');
    // Düşen cümle tam olarak kaynağı adlandıran cümle — değer/kontrast grameri KALIR.
    expect(receipt.dropped.join(' ')).toMatch(/named source/i);
    expect(receipt.light).toMatch(/value separation/i);
    expect(receipt.light).not.toMatch(/named source/i);
  });
});

describe('sahne ışık kaynağı — menüyü çözer', () => {
  it('kaynak yazıldığında prompt O kaynağı adlandırır ve başkasını yasaklar', () => {
    const p = firstPrompt({
      recipeScenes: [{ id: 1, vo: '', event: '', director_note: '', motion_seed: '', turkish_labels: [], avoid: [], light_source: 'tepedeki floresan panel; odada pencere yok' }],
    });
    expect(p).toContain('Named key source for THIS shot: tepedeki floresan panel; odada pencere yok');
    expect(p).toMatch(/do not add a second source/i);
  });

  it('kaynak yazılmadığında uydurma yasaklanır — mekânın sahip olduğu ışık', () => {
    const p = firstPrompt();
    expect(p).toMatch(/Named key source: the staged location's own/);
    expect(p).toMatch(/what this world MAY use, not what this place HAS/);
  });

  /**
   * REGRESYON KİLİDİ — yasak, yasakladığı şeyi çağırmasın.
   *
   * İlk yazımda cümle nesne adlarıyla yasaklıyordu ("never add a window, skylight or sun
   * shaft") ve ÖLÇÜM gösterdi ki bu `window`'u 3'ten 5'e, `sun`'ı 3'ten 4'e çıkardı. Projenin
   * kendi yasası: negatifte olmayan nesneyi anma. Ayrıca "aperture" kelimesi diyafram (f-stop)
   * olarak okunup lens grameriyle çakışıyordu. İkisi de bir daha girmesin.
   */
  it('kapı cümlesi ışık-nesnesi adı ve lens-belirsiz kelime taşımaz', () => {
    const world = DATA.worlds.find((w) => w.id === 'pixar_3d_edu')!;
    const clause = namedKeySourceClause(world);
    expect(clause).not.toMatch(/skylight/i);
    expect(clause).not.toMatch(/sun shaft/i);
    expect(clause).not.toMatch(/aperture/i);
    // "window" kelimesi de cümlenin kendisinde geçmemeli.
    expect(clause).not.toMatch(/\bwindow\b/i);
  });

  it('kapı düz-ışık dünyasında hiç basılmaz — orada yönlü key yok, cümle gürültü olur', () => {
    const flat = DATA.worlds.find((w) => /ukiyo|motion_design_flat|whiteboard|kurzgesagt/i.test(w.id));
    if (!flat) return;
    expect(namedKeySourceClause(flat)).toBe('');
    expect(namedKeySourceClause(flat, 'floresan')).toBe('');
  });
});

describe('sahte güneş — ölçülen taban', () => {
  /**
   * Taban (fix ÖNCESİ, gerçek çıktı): window 3 · sun 3 · lamp 3 · motivated 8.
   * Fix SONRASI ölçüldü: window 2 · sun 2 · lamp 2 · motivated 7 (her iki kolda).
   * Bu test tabanı kilitler — biri ref DNA'nın kaynak cümlesini geri takarsa sayı yükselir.
   */
  it('anahtar-ışık kelime yoğunluğu tabanın altında kalır', () => {
    for (const [label, p] of [
      ['kaynaksız', firstPrompt()],
      ['kaynaklı', firstPrompt({ recipeScenes: [{ id: 1, vo: '', event: '', director_note: '', motion_seed: '', turkish_labels: [], avoid: [], light_source: 'ekran parıltısı' }] })],
    ] as const) {
      expect(count(p, 'window'), `${label}: window sayısı tabana döndü`).toBeLessThanOrEqual(2);
      expect(count(p, 'motivated'), `${label}: motivated sayısı tabana döndü`).toBeLessThanOrEqual(7);
      expect(count(p, 'skylight'), `${label}: skylight prompt'a girdi`).toBe(0);
    }
  });
});
