// Reçete dünya galerisi sekmeleri. Ayrı modül: hem RecipeStep hem coverage-invariant
// testi import etsin (bir world group sekmesiz kalırsa galeride görünmez — "panel yok" bug'ı).
export const WORLD_TABS = [
  { id: 'ANIMATION', label: 'Animation/Edu', groups: ['ANIMATION_EDU', 'ANIMATION_PAINTERLY'] },
  { id: 'STYLIZED', label: 'Stylized', groups: ['ANIMATION_STYLIZED', 'ANIMATION_DARK', 'ANIMATION_CEL_3D_HYBRID', 'ANIMATION_BOLD_CEL'] },
  { id: 'REAL', label: 'Cinematic Real', groups: ['CINEMATIC_REAL'] },
  { id: 'COMMERCIAL', label: 'Reklam / Marka', groups: ['COMMERCIAL_REAL'] },
] as const;

export type WorldTabId = (typeof WORLD_TABS)[number]['id'];
