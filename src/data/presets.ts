// Phase 0 preset library — quick-start configurations.
// Each preset maps to a partial brief state: class, world, ref, palette, prop, scene count, cast.
// Sourced from MAMILAS Phase 0 spec (2026-06-14 user-approved list).

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
  /** Reference family scoping (info-only on UI for now) */
  refScope: { allow: string[]; warn: string[] };
}

export const PHASE0_VIDEO: Phase0Preset[] = [
  {
    id: 'premium_ad',
    icon: '🍎',
    label: 'Premium Reklam',
    desc: 'Apple seviyesi — sinematik, ürün-merkezli, ultra-real',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#1a1a2e,#16213e 60%,#0f3460)',
    sets: {
      projectClass: 'ULTRAREAL_COMMERCIAL',
      selectedWorldId: 'cinematic_real',
      selectedPropId: 'native_world',
      sceneCount: 6,
    },
    refScope: { allow: ['cinematic', 'cinematography', 'commercial', 'documentary'], warn: ['anime', 'game'] },
  },
  {
    id: 'luxury_editorial',
    icon: '💎',
    label: 'Lüks / Editorial',
    desc: 'İnce sanat dili, dergi tadında',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#2c1810,#5a3921 60%,#8b6f47)',
    sets: {
      projectClass: 'ULTRAREAL_COMMERCIAL',
      selectedWorldId: 'oil_painted_classic',
      selectedPropId: 'native_world',
      sceneCount: 5,
    },
    refScope: { allow: ['fine_art', 'cinematography', 'commercial'], warn: ['anime', 'game'] },
  },
  {
    id: 'cinema_feature',
    icon: '🎬',
    label: 'Sinema Filmi',
    desc: 'Tam sinematik, sinematografi DNA',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#0d0d0d,#1a1a1a 50%,#330000)',
    sets: {
      projectClass: 'Tasarım İşi',
      selectedWorldId: 'cinematic_real',
      sceneCount: 8,
    },
    refScope: { allow: ['cinematic', 'cinematography'], warn: [] },
  },
  {
    id: 'animation_open',
    icon: '🎨',
    label: 'Animasyon (dil açık)',
    desc: 'Tüm aileler açık — anime/oyun/stilize',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#ff6b6b,#feca57 50%,#48dbfb)',
    sets: {
      projectClass: 'Tasarım İşi',
      selectedWorldId: 'pixar_feature',
      sceneCount: 6,
    },
    refScope: { allow: ['anime', 'film', 'game', 'cinematic', 'fine_art'], warn: [] },
  },
  {
    id: 'series_episodic',
    icon: '📺',
    label: 'Dizi / Episodik',
    desc: 'Sinematik + stilize karışım',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#1e3c72,#2a5298)',
    sets: {
      projectClass: 'Tasarım İşi',
      selectedWorldId: 'arcane_edu',
      sceneCount: 7,
    },
    refScope: { allow: ['cinematic', 'stylized', 'anime'], warn: [] },
  },
  {
    id: 'edu_aras_defne',
    icon: '🎓',
    label: 'Eğitim · Aras & Defne',
    desc: 'Stilize animasyon, çocuk dostu',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#fbd786,#f7797d 60%,#c6ffdd)',
    sets: {
      projectClass: 'EĞİTİM_01',
      selectedWorldId: 'clay',
      selectedPropId: 'clay',
      cast: 'İkisi',
      sceneCount: 5,
    },
    refScope: { allow: ['stylized'], warn: ['anime', 'game'] },
  },
  {
    id: 'social_viral',
    icon: '📱',
    label: 'Sosyal / Viral',
    desc: 'Reklam + stilize, kısa-form ritmi',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#fc5c7d,#6a82fb)',
    sets: {
      projectClass: 'Tasarım İşi',
      selectedWorldId: 'verse_miles',
      sceneCount: 4,
    },
    refScope: { allow: ['commercial', 'stylized'], warn: [] },
  },
  {
    id: 'game_kinematic',
    icon: '🎮',
    label: 'Oyun / Kinematik',
    desc: 'Trailer tadı, oyun dünyaları + sinematik',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#000428,#004e92)',
    sets: {
      projectClass: 'Tasarım İşi',
      selectedWorldId: 'demon_slayer_visual',
      sceneCount: 6,
    },
    refScope: { allow: ['game', 'cinematic'], warn: [] },
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
    sets: { projectClass: 'Tasarım İşi', selectedWorldId: 'graphic_poster_world', sceneCount: 1 },
    refScope: { allow: ['commercial'], warn: [] },
  },
  {
    id: 'corp_announce',
    icon: '🏢',
    label: 'Kurumsal Duyuru',
    desc: 'Net hiyerarşi, kurumsal güven',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#3a7bd5,#3a6073)',
    sets: { projectClass: 'Tasarım İşi', selectedWorldId: 'graphic_poster_world', sceneCount: 1 },
    refScope: { allow: ['commercial'], warn: [] },
  },
  {
    id: 'special_day',
    icon: '🎉',
    label: 'Özel Gün',
    desc: 'Bayram/yıldönümü kutlama',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#f7971e,#ffd200)',
    sets: { projectClass: 'Tasarım İşi', selectedWorldId: 'graphic_poster_world', sceneCount: 1 },
    refScope: { allow: ['commercial', 'stylized'], warn: [] },
  },
  {
    id: 'campaign_discount',
    icon: '🏷️',
    label: 'Kampanya / İndirim',
    desc: 'Yüksek kontrast, fiyat odaklı',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#ee0979,#ff6a00)',
    sets: { projectClass: 'Tasarım İşi', selectedWorldId: 'graphic_poster_world', sceneCount: 1 },
    refScope: { allow: ['commercial'], warn: [] },
  },
  {
    id: 'luxury_print',
    icon: '🖼️',
    label: 'Baskı / OOH',
    desc: 'Outdoor, büyük format',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#232526,#414345)',
    sets: { projectClass: 'Tasarım İşi', selectedWorldId: 'oil_painted_classic', sceneCount: 1 },
    refScope: { allow: ['fine_art', 'commercial'], warn: [] },
  },
  {
    id: 'story_reels',
    icon: '📲',
    label: 'Story / Reels',
    desc: '9:16 dikey, hareketli',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#8e2de2,#4a00e0)',
    sets: { projectClass: 'Tasarım İşi', selectedWorldId: 'verse_miles', sceneCount: 3 },
    refScope: { allow: ['commercial', 'stylized'], warn: [] },
  },
  {
    id: 'carousel_info',
    icon: '📊',
    label: 'Bilgi Carousel',
    desc: '5-7 kart, eğitici akış',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#1d976c,#93f9b9)',
    sets: { projectClass: 'EĞİTİM_01', selectedWorldId: 'flat_vector_cartoon', sceneCount: 6 },
    refScope: { allow: ['commercial', 'stylized'], warn: [] },
  },
];
