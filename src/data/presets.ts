// Phase 0 preset library — quick-start configurations.
// Each preset maps to a partial brief state: class, world, ref, palette, prop, scene count, cast.
// World IDs are real entries in src/core/SURGERY_DATA.json (validated by tests).

export interface Phase0Preset {
  id: string;
  icon: string;
  label: string;
  desc: string;
  kind: 'video' | 'design';
  /** Gradient for the preset card preview */
  gradient: string;
  /** Partial state to merge into the studio store */
  sets: {
    projectClass?: string;
    selectedWorldId?: string;
    selectedRefId?: string;
    selectedPaletteId?: string;
    selectedPropId?: string;
    sceneCount?: number;
    cast?: 'Aras' | 'Defne' | 'İkisi';
  };
  /** Reference category scoping (cat values in SURGERY_DATA.refs) */
  refScope: { allow: string[]; warn: string[] };
}

export const PHASE0_VIDEO: Phase0Preset[] = [
  {
    id: 'premium_ad',
    icon: '🍎',
    label: 'Premium Reklam',
    desc: 'Apple seviyesi — ürün-merkezli, ultra-real reklam',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#1a1a2e,#16213e 60%,#0f3460)',
    sets: {
      projectClass: 'ULTRAREAL_COMMERCIAL',
      selectedWorldId: 'commercial_studio',
      selectedPropId: 'native_world',
      sceneCount: 6,
    },
    refScope: { allow: ['Commercial', 'Cinematography', 'Product / Macro'], warn: ['Anime / Cinematic', 'Game Art Direction'] },
  },
  {
    id: 'luxury_editorial',
    icon: '💎',
    label: 'Lüks / Editorial',
    desc: 'İnce sanat dili, dergi tadında ürün/marka',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#2c1810,#5a3921 60%,#8b6f47)',
    sets: {
      projectClass: 'ULTRAREAL_COMMERCIAL',
      selectedWorldId: 'luxury_editorial',
      selectedPropId: 'native_world',
      sceneCount: 5,
    },
    refScope: { allow: ['Fine Art Lighting', 'Fashion / Editorial', 'Cinematography'], warn: ['Anime / Cinematic'] },
  },
  {
    id: 'cinema_feature',
    icon: '🎬',
    label: 'Sinema Filmi',
    desc: 'Tam sinematik, gerçek mekân + sinematografi DNA',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#0d0d0d,#1a1a1a 50%,#330000)',
    sets: {
      projectClass: 'ULTRAREAL_COMMERCIAL',
      selectedWorldId: 'photoreal_location',
      sceneCount: 8,
    },
    refScope: { allow: ['Live Action Cinema', 'Cinematography', 'Documentary'], warn: [] },
  },
  {
    id: 'animation_open',
    icon: '🎨',
    label: 'Animasyon (dil açık)',
    desc: 'Stilize dünya — anime/film/oyun referansları açık',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#ff6b6b,#feca57 50%,#48dbfb)',
    sets: {
      projectClass: 'Tasarım İşi',
      selectedWorldId: 'clay',
      sceneCount: 6,
    },
    refScope: { allow: ['3D Animation', '2D Animation', 'Anime / Cinematic', 'Animation Auteur', 'Game / Film'], warn: [] },
  },
  {
    id: 'series_episodic',
    icon: '📺',
    label: 'Dizi / Episodik',
    desc: 'Painterly + sinematik — bölüm tadı',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#1e3c72,#2a5298)',
    sets: {
      projectClass: 'Tasarım İşi',
      selectedWorldId: 'painterly_shadow',
      sceneCount: 7,
    },
    refScope: { allow: ['Cinematography', 'Stylized Premium', 'Animation Auteur'], warn: [] },
  },
  {
    id: 'edu_aras_defne',
    icon: '🎓',
    label: 'Eğitim · Aras & Defne',
    desc: 'Clay diorama, çocuk dostu eğitim animasyonu',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#fbd786,#f7797d 60%,#c6ffdd)',
    sets: {
      projectClass: 'EĞİTİM_01',
      selectedWorldId: 'clay',
      selectedPropId: 'clay',
      cast: 'İkisi',
      sceneCount: 5,
    },
    refScope: { allow: ['Stylized Premium', '3D Animation', '2D Animation'], warn: ['Anime / Cinematic', 'Game / Film'] },
  },
  {
    id: 'social_viral',
    icon: '📱',
    label: 'Sosyal / Viral',
    desc: 'Sosyal-reels ritmi, kısa-form ürün',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#fc5c7d,#6a82fb)',
    sets: {
      projectClass: 'ULTRAREAL_COMMERCIAL',
      selectedWorldId: 'social_reels_real',
      sceneCount: 4,
    },
    refScope: { allow: ['Commercial', 'Stylized Premium', 'Product / Macro'], warn: [] },
  },
  {
    id: 'game_kinematic',
    icon: '🎮',
    label: 'Oyun / Kinematik',
    desc: 'Graphic comic dünya, trailer tadında',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#000428,#004e92)',
    sets: {
      projectClass: 'Tasarım İşi',
      selectedWorldId: 'graphic_comic',
      sceneCount: 6,
    },
    refScope: { allow: ['Game Art Direction', 'Game / Film', 'Animation / Game', 'Cinematography'], warn: [] },
  },
];

export const PHASE0_DESIGN: Phase0Preset[] = [
  {
    id: 'product_post',
    icon: '🛍️',
    label: 'Ürün Postu',
    desc: 'Tek kart ürün, ticari ışık',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#ee9ca7,#ffdde1)',
    sets: { projectClass: 'ULTRAREAL_COMMERCIAL', selectedWorldId: 'product_macro_tabletop', sceneCount: 1 },
    refScope: { allow: ['Product / Macro', 'Commercial'], warn: [] },
  },
  {
    id: 'corp_announce',
    icon: '🏢',
    label: 'Kurumsal Duyuru',
    desc: 'Net hiyerarşi, kurumsal güven',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#3a7bd5,#3a6073)',
    sets: { projectClass: 'ULTRAREAL_COMMERCIAL', selectedWorldId: 'commercial_studio', sceneCount: 1 },
    refScope: { allow: ['Commercial', 'Tech / Medical'], warn: [] },
  },
  {
    id: 'special_day',
    icon: '🎉',
    label: 'Özel Gün',
    desc: 'Bayram/yıldönümü kutlama',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#f7971e,#ffd200)',
    sets: { projectClass: 'Tasarım İşi', selectedWorldId: 'graphic_comic', sceneCount: 1 },
    refScope: { allow: ['Commercial', 'Stylized Premium'], warn: [] },
  },
  {
    id: 'campaign_discount',
    icon: '🏷️',
    label: 'Kampanya / İndirim',
    desc: 'Yüksek kontrast, fiyat odaklı',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#ee0979,#ff6a00)',
    sets: { projectClass: 'ULTRAREAL_COMMERCIAL', selectedWorldId: 'social_reels_real', sceneCount: 1 },
    refScope: { allow: ['Commercial'], warn: [] },
  },
  {
    id: 'luxury_print',
    icon: '🖼️',
    label: 'Baskı / OOH',
    desc: 'Outdoor, büyük format',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#232526,#414345)',
    sets: { projectClass: 'ULTRAREAL_COMMERCIAL', selectedWorldId: 'architecture_real', sceneCount: 1 },
    refScope: { allow: ['Fine Art Lighting', 'Architecture'], warn: [] },
  },
  {
    id: 'story_reels',
    icon: '📲',
    label: 'Story / Reels',
    desc: '9:16 dikey, hareketli',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#8e2de2,#4a00e0)',
    sets: { projectClass: 'ULTRAREAL_COMMERCIAL', selectedWorldId: 'social_reels_real', sceneCount: 3 },
    refScope: { allow: ['Commercial', 'Stylized Premium'], warn: [] },
  },
  {
    id: 'carousel_info',
    icon: '📊',
    label: 'Bilgi Carousel',
    desc: '5-7 kart, eğitici akış',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#1d976c,#93f9b9)',
    sets: { projectClass: 'EĞİTİM_01', selectedWorldId: 'notebook', sceneCount: 6 },
    refScope: { allow: ['Stylized Premium', 'Commercial'], warn: [] },
  },
];
