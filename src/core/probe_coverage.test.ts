import { describe, it, expect } from 'vitest';
import { buildImagePrompt, type Concept } from './brain';
import { hasBankResidue } from './faz2_baseline.test';

// FAZ2: REAL bankaları söküldü. "coverage/matched" kavramları YAPISAL OLARAK yok.
// Yeni sözleşme: her REAL kaynak için image prompt verbatim kaynağı + "Scene brief
// (Claude yazar)" taşır, enjekte edilen banka öznesi sızmaz, banka izi yok.
const BANK_LIKE: Concept = {
  subject: 'the hero product with its logo plane square to a controlled key light',
  event: 'one narrow highlight travels across the surface',
  matched: true,
};
const img = (src: string) => buildImagePrompt(1, BANK_LIKE, '85mm macro', {
  world: {} as any, register: 'REAL', dna: { staging: 's', light: 'l', texture: 't', avoid: 'a' } as any,
  pathForbidden: '', sourceBeat: src,
});

describe('REAL bank söküm regresyonu — banka öznesi üretilmez, kaynak verbatim', () => {
  const SOURCES = [
    'Fırında yeni pişmiş ekmek hazır',
    'Türk kahvesi fincanına döküldü',
    'Barista latte art yapıyor',
    'Spor araba virajı döndü',
    'Yeni model SUV yolda gidiyor',
    'Bir müşteri ürün hakkında konuşuyor',
    'Kullanıcılar deneyimlerini paylaşıyor',
    'Moda haftasında defilede bir model',
    'Tasarımcı yeni koleksiyonunu sunuyor',
    'Modern ev iç mekan tasarımı',
    'Yeni daire projesi tanıtımı',
    'Türkiye tarihî yerlerini keşfet',
    'Kapadokya yaylasında sabah',
  ];

  it('tüm REAL kaynakları verbatim taşır + banka öznesi ("hero product") sızmaz', () => {
    for (const src of SOURCES) {
      const p = img(src);
      expect(p, `"${src}" verbatim taşınmadı`).toContain(src);
      expect(p, `"${src}" Claude talimatı yok`).toContain('Scene brief (Claude yazar)');
      expect(p, `"${src}" enjekte banka öznesi sızdı`).not.toContain('hero product with its logo plane');
      expect(hasBankResidue(p), `"${src}" banka izi kaldı`).toBe(false);
    }
  });

  it('image prompt her zaman somut kaynak + Claude talimatı taşır (boş/placeholder sızmaz)', () => {
    for (const src of ['Fırında yeni pişmiş ekmek hazır', 'Spor araba virajı döndü', 'Kapadokya yaylasında sabah']) {
      const p = img(src);
      expect(p).toContain(src);
      expect(p).toContain('Scene brief (Claude yazar)');
    }
  });
});
