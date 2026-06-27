import { describe, it, expect } from 'vitest';
import { conceptRanked } from './brain';

describe('REAL bank coverage probe', () => {
  it('all common Turkish REAL sources match without generic fallback', () => {
    const cases: [string, string, string][] = [
      ['Fırında yeni pişmiş ekmek hazır', 'REAL', 'food_macro_real'],
      ['Türk kahvesi fincanına döküldü', 'REAL', 'food_macro_real'],
      ['Barista latte art yapıyor', 'REAL', 'food_macro_real'],
      ['Spor araba virajı döndü', 'REAL', 'automotive_stage_real'],
      ['Yeni model SUV yolda gidiyor', 'REAL', 'automotive_stage_real'],
      ['Bir müşteri ürün hakkında konuşuyor', 'REAL', 'real_human_doc'],
      ['Kullanıcılar deneyimlerini paylaşıyor', 'REAL', 'real_human_doc'],
      ['Moda haftasında defilede bir model', 'REAL', 'luxury_editorial'],
      ['Tasarımcı yeni koleksiyonunu sunuyor', 'REAL', 'luxury_editorial'],
      ['Modern ev iç mekan tasarımı', 'REAL', 'architecture_real'],
      ['Yeni daire projesi tanıtımı', 'REAL', 'architecture_real'],
      ['Türkiye tarihî yerlerini keşfet', 'REAL', 'tourism_destination_real'],
      ['Kapadokya yaylasında sabah', 'REAL', 'tourism_destination_real'],
    ];
    const fails: string[] = [];
    for (const [source, register, worldId] of cases) {
      const top = conceptRanked(source, register as 'REAL', worldId, 'Build-up')[0];
      if (!top?.matched) fails.push(`${worldId}: "${source}"`);
    }
    if (fails.length) console.log('Unmatched:', fails);
    expect(fails).toEqual([]);
  });
});
