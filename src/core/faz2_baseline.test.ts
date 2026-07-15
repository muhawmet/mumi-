import { describe, it, expect } from 'vitest';
import { generateBatch, type BriefInput } from './pure';
import { autoGroupBeats } from './source';

/**
 * FAZ 2 — baseline kilidi.
 *
 * hasBankResidue(prompt) bir image-prompt'ta sitenin bugün UYDURDUĞU sabit
 * "konsept bankası" özne izlerinden en az birinin geçip geçmediğini söyler.
 * Kapsanan bankalar (bkz. brain-data.ts / brain.ts):
 *  - WATER_STAGES (brain-data.ts) — su döngüsü aşama bankası
 *  - STY_BANK (brain-data.ts) — stilize/anime kayıp-obje bankası
 *  - REAL_BANKS.PRODUCT (brain-data.ts) — eski REAL ürün bankası
 *  - EDU_SOURCE_BANK (brain.ts) — grup/rol/kültür/aidiyet sosyal-bilgiler bankası
 *  - REAL_SOURCE_BANKS.PRODUCT (brain.ts) — yeni REAL ürün bankası
 *  - EDU_BANK math/fen dalı (brain-data.ts, brain.ts:563 `else out.push` yolu) —
 *    conceptRanked'in WATER_STAGE-olmayan EDU_BANK girişleri (yer değeri, terazi/
 *    denklem, kesir, geometri vb.) hiçbir önceki reçeteyle tetiklenmiyordu
 *
 * Bu dosya KALICI: Task 2 bankaları sökene kadar test true'yu belgeler
 * ("banka izi hâlâ var" — mevcut, istenmeyen durum). Task 2 sonrası bankalar
 * kaldırılınca generateBatch çıktısı bu imzaları artık üretmeyecek ve aynı
 * test kendiliğinden false'a dönüşüp KALICI regresyon testi olacak — bu
 * yüzden imzalar hardcode string'e karşı değil, generateBatch'in GERÇEK
 * çıktısına karşı test ediliyor.
 *
 * İmza kaynakları (grep ile doğrulandı — brain.ts'te birebir var, SURGERY_DATA.json'da 0):
 *  - EDU:  WATER_STAGES → "miniature water-cycle landscape",
 *          "carved river channel of the miniature landscape"
 *          EDU_SOURCE_BANK → "membership map board"
 *  - STY:  STY_BANK → "braced against a heaving sea",
 *          "quest object held at frame center"
 *  - REAL: REAL_BANKS.PRODUCT → "hero product with its logo plane square to a controlled key light",
 *          "weave or grain depth fully resolved"
 *          REAL_SOURCE_BANKS.PRODUCT → "real hands lifting the product at natural use distance",
 *          "the hero product alone on disciplined negative space"
 *  - EDU:  EDU_BANK math dalı (brain-data.ts:36-38, "say[ıi] do[gğ]rusu|\brakam|\bonluk|
 *          \bbirlik\b|basamak|...|place value" regex'i) → "place-value board with stacks
 *          of unit cubes" — brain-data.ts'te birebir var, SURGERY_DATA.json'da 0 hit.
 *          Gerçek generateBatch çıktısında ("Basamak Değeri" reçetesi) scene 0'ın
 *          imagePrompt'unda "Dominant element: one place-value board with stacks of
 *          unit cubes and ten-rods." olarak geçtiği geçici probe script ile doğrulandı
 *          (iz WATER_STAGES/EDU_SOURCE_BANK/fallback DEĞİL, brain.ts:563 `else out.push`
 *          yoluyla EDU_BANK'tan geliyor).
 */
const BANK_SIGNATURES = [
  // EDU — WATER_STAGES
  'miniature water-cycle landscape',
  'carved river channel of the miniature landscape',
  // EDU — EDU_SOURCE_BANK (brain.ts)
  'membership map board',
  // STY — STY_BANK
  'braced against a heaving sea',
  'quest object held at frame center',
  // REAL — REAL_BANKS.PRODUCT (brain-data.ts)
  'hero product with its logo plane square to a controlled key light',
  'weave or grain depth fully resolved',
  // REAL — REAL_SOURCE_BANKS.PRODUCT (brain.ts)
  'real hands lifting the product at natural use distance',
  'the hero product alone on disciplined negative space',
  // EDU — EDU_BANK math dalı (brain-data.ts, place-value regex)
  'place-value board with stacks of unit cubes',
];

export function hasBankResidue(prompt: string): boolean {
  const p = String(prompt || '').toLowerCase();
  return BANK_SIGNATURES.some((sig) => p.includes(sig.toLowerCase()));
}

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
      'Yükselen buhar soğuk havayla karşılaşınca minik damlacıklara dönüşür; bulutlar böyle doğar.',
      'Bulutlar ağırlaşınca damlalar yağmur olarak toprağa düşer.',
      'Yağmur suyu derelerde toplanır, nehirler onu tekrar denize taşır.',
      'Ve döngü yeniden başlar: aynı su, milyonlarca yıldır yolculuğuna devam ediyor.',
    ].join('\n'),
  },
  {
    label: 'EDU',
    projectTopic: 'Ait Olduğumuz Gruplar',
    projectClass: 'ANIMATION_EDU',
    selectedWorldId: 'pixar_3d_edu',
    selectedRefIds: ['pixar_dimensional', 'pixar_emotional_staging'],
    rawSource: [
      'Merhaba çocuklar! Bugün aile, okul ve mahalle gibi farklı gruplara aynı anda ait olduğumuzu konuşacağız.',
      'Her birey aynı anda ailenin bir üyesi, okulun bir öğrencisi ve mahallenin bir komşusu olabilir.',
      'Zaman içinde rolümüz değişir: bebekken sadece ailenin üyesiyken, öğrenciyken okulun bir parçası, yetişkinken toplumun bir üyesi oluruz.',
      'Her toplumun kendine özgü bir kültürü, dili, tarihi ve sanatı vardır ve bu miras bizi birbirimize bağlar.',
      'Ait olduğumuz bu gruplar sayesinde güçleniriz ve birlikte daha büyük bir topluluk oluştururuz.',
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
    label: 'EDU',
    projectTopic: 'Basamak Değeri',
    projectClass: 'ANIMATION_EDU',
    selectedWorldId: 'pixar_3d_edu',
    selectedRefIds: ['pixar_dimensional', 'pixar_emotional_staging'],
    rawSource: [
      'Bugün basamak değerini öğreneceğiz.',
      '24 sayısında 2 rakamı onlar basamağında, 4 rakamı ise birler basamağındadır.',
      'On tane birlik bir araya gelince tek bir onluk oluşturur.',
      'Onlar basamağındaki her rakam, o kadar onluk demektir.',
      'Şimdi beraber birkaç sayının basamak değerini bulalım.',
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

describe('hasBankResidue — FAZ2 regresyon (Task 2 sonrası: bankalar söküldü)', () => {
  it.each(RECIPES)(
    '$label reçetesi: banka söküm sonrası HİÇBİR sahnede banka özne izi KALMAZ + scene 0 kaynağın ilk cümlesini verbatim taşır',
    (recipe) => {
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
      if (result.status !== 'GENERATED') return;

      // Banka söküldü → hiçbir sahne banka özne izi taşımaz (KALICI regresyon güvencesi).
      const anySceneHasResidue = result.scenes.some((scene) => hasBankResidue(scene.imagePrompt));
      expect(anySceneHasResidue).toBe(false);

      // Site özne UYDURMAZ, kaynağı verbatim taşır: scene 0 imagePrompt kaynağın ilk cümlesini içerir.
      // (İlk beat her zaman kaynağın başından başlar; ilk cümle-sonu noktalamasına kadar al.)
      const firstSentence = recipe.rawSource.split('\n')[0].split(/[.!?]/)[0].trim();
      expect(result.scenes[0].imagePrompt).toContain(firstSentence);
    },
  );
});
