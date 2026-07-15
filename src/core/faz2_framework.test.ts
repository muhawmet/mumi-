import { describe, it, expect } from 'vitest';
import { generateBatch, type BriefInput } from './pure';
import { autoGroupBeats } from './source';
import { hasBankResidue } from './faz2_baseline.test';

/**
 * FAZ 2 — çerçeve-sözleşmesi (yeni akış).
 *
 * Bankalar söküldü. Site artık sahne öznesi/motion UYDURMAZ; yalnız sinema-dili
 * çerçevesi + verbatim kaynak beat üretir, WHAT'ı gerçek düşünen Claude yazar.
 * Bu dosya yeni sözleşmeyi 3 register (EDU/STY/REAL) için kilitler:
 *  (a) hiçbir sahnede banka özne izi yok
 *  (b) kaynak beat image prompt'ta verbatim
 *  (c) image prompt "Scene brief (Claude yazar)" + motion prompt "Motion brief (Claude yazar)"
 *  (d) image prompt Negative satırı o world'ün negatif kilidini taşır (firewall regresyonu)
 *  (e) image prompt'ta ham hex yok (Palet Translation Law)
 */

interface Recipe {
  label: 'EDU' | 'STY' | 'REAL';
  projectTopic: string;
  projectClass: string;
  selectedWorldId: string;
  selectedRefIds: string[];
  rawSource: string;
}

const RECIPES: Recipe[] = [
  {
    label: 'EDU',
    projectTopic: 'Su Döngüsü',
    projectClass: 'ANIMATION_EDU',
    selectedWorldId: 'pixar_3d_edu',
    selectedRefIds: ['pixar_dimensional', 'pixar_emotional_staging'],
    rawSource: [
      'Güneş, denizin yüzeyini ısıtır ve su buharlaşarak gökyüzüne yükselir.',
      'Yükselen buhar soğuk havayla karşılaşınca minik damlacıklara dönüşür.',
      'Bulutlar ağırlaşınca damlalar yağmur olarak toprağa düşer.',
      'Yağmur suyu derelerde toplanır, nehirler onu tekrar denize taşır.',
      'Ve döngü yeniden başlar: aynı su milyonlarca yıldır yolculuğuna devam ediyor.',
    ].join('\n'),
  },
  {
    label: 'STY',
    projectTopic: 'Fırtınalı denizde efsanevi haritanın peşindeki son yolculuk',
    projectClass: 'STYLIZED_PREMIUM',
    selectedWorldId: 'one_piece_toei',
    selectedRefIds: ['one_piece_sunny_adventure', 'onepiece_grandline_scale'],
    rawSource: [
      'Fırtına bütün gece sürdü; küçük tekne dev dalgaların arasında yoluna devam etti.',
      'Şafakta rüzgâr durdu ve ufukta adanın silüeti belirdi.',
      'Kaptan haritayı ışığa doğru çevirdi; işaretli rota parmağının altında parlıyordu.',
      'Kayalıkların arasındaki gizli koya tek bir usta manevrayla girdiler.',
      'Ve haritanın sonunda yazan tek kelime gerçek oldu: ev.',
    ].join('\n'),
  },
  {
    label: 'REAL',
    projectTopic: 'Yeni amiral gemisi saatin lansman filmi',
    projectClass: 'PRODUCT_HERO',
    selectedWorldId: 'fincher_precision',
    selectedRefIds: ['kubrick_one_point', 'severance_corporate_dread'],
    rawSource: [
      'Kutunun kapağı yavaşça açılır ve saatin metal yüzeyi ilk ışığı yakalar.',
      'Logo işareti kontrollü bir key light altında keskin ve net durur.',
      'Kayışın dokusu makro planda görünür, her dikişi belirgindir.',
      'Bir el saati bilekte takarken doğal bir hareketle kapatır.',
      'Ürün, disiplinli bir negatif alanda tek başına kahraman olarak durur.',
    ].join('\n'),
  },
];

function runRecipe(recipe: Recipe) {
  const beats = autoGroupBeats(recipe.rawSource, 'Dengeli', 'kling_3');
  const brief: BriefInput = {
    projectTopic: recipe.projectTopic,
    projectClass: recipe.projectClass,
    sceneCount: beats.length,
    cast: '',
    selectedWorldId: recipe.selectedWorldId,
    selectedPropId: 'native_world',
    selectedRefIds: recipe.selectedRefIds,
    selectedPaletteId: '',
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
    rawSource: recipe.rawSource,
    sourceBeats: beats,
  };
  const result = generateBatch(brief);
  expect(result.status).toBe('GENERATED');
  return result;
}

describe('FAZ2 çerçeve sözleşmesi — banka söküldü, Claude yazar', () => {
  it.each(RECIPES)('(a) $label: hiçbir sahnenin imagePrompt\'unda banka özne izi yok', (recipe) => {
    const result = runRecipe(recipe);
    for (const scene of result.scenes) {
      expect(hasBankResidue(scene.imagePrompt), `Sahne ${scene.id} banka izi taşıyor`).toBe(false);
    }
  });

  it.each(RECIPES)('(b) $label: her sahnenin kaynak beat\'i imagePrompt\'ta verbatim geçer (FIX-6 whitespace-normalize)', (recipe) => {
    const result = runRecipe(recipe);
    for (const scene of result.scenes) {
      // FIX-6: enjeksiyon-anında SRC_LINE normalize (baş/iç \n → tek boşluk). Kaynak
      // BYTE-eşit korunur (sourceIntegrity ayrı testli); prompt gösterimi normalize.
      const normalized = scene.voiceOver.replace(/\s+/g, ' ').trim();
      expect(scene.imagePrompt, `Sahne ${scene.id} normalize kaynağı taşımıyor`).toContain(normalized);
    }
  });

  it.each(RECIPES)('(c) $label: image "Scene brief (Claude yazar)", motion "Motion brief (Claude yazar)" taşır', (recipe) => {
    const result = runRecipe(recipe);
    for (const scene of result.scenes) {
      expect(scene.imagePrompt, `Sahne ${scene.id} image Claude talimatı yok`).toContain('Scene brief (Claude yazar)');
      expect(scene.motionPrompt, `Sahne ${scene.id} motion Claude talimatı yok`).toContain('Motion brief (Claude yazar)');
      // Banka-türevli motion satırları artık YOK.
      expect(scene.motionPrompt, `Sahne ${scene.id} banka Moving element satırı hâlâ var`).not.toContain('Moving element:');
    }
  });

  // T5 FIX-3: image Negative artık world negative_lock'un TAMAMINI (enumerated IP-isim seli)
  // taşımaz — stil/sıcaklık/render firewall'ı TUTAR, IP-isim selini tek jenerik cümleye indirir.
  // Full negative_lock BRIEF §3 + qa export firewall'da (testli) AYNEN kalır.
  const FIREWALL: Record<Recipe['label'], { style: string; ip: string }> = {
    EDU: { style: 'teal-orange', ip: 'Woody' },
    STY: { style: 'desaturated', ip: 'Luffy' },
    REAL: { style: 'warm-cozy', ip: 'Tyler Durden' },
  };
  it.each(RECIPES)('(d) $label: image Negative stil-firewall TUTAR, enumerated IP-isim seli DÜŞER', (recipe) => {
    const result = runRecipe(recipe);
    const fw = FIREWALL[recipe.label];
    for (const scene of result.scenes) {
      const negLine = (scene.imagePrompt.match(/Negative:[^\n]*/) ?? [''])[0];
      expect(negLine.toLowerCase(), `Sahne ${scene.id} stil firewall negatifi düştü`).toContain(fw.style);
      expect(negLine, `Sahne ${scene.id} enumerated IP-isim taşıyor`).not.toContain(fw.ip);
      expect(negLine, `Sahne ${scene.id} jenerik IP cümlesi yok`).toContain('no recognizable franchise or real-person characters');
    }
  });

  it.each(RECIPES)('(e) $label: imagePrompt ham hex (#RRGGBB) sızdırmaz (Palet Translation Law)', (recipe) => {
    const result = runRecipe(recipe);
    for (const scene of result.scenes) {
      expect(scene.imagePrompt, `Sahne ${scene.id} ham hex sızdırdı`).not.toMatch(/#[0-9a-fA-F]{6}/);
    }
  });
});
