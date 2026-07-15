import { slotUrl, type CardSlot } from '../scene/assetSlots';

/** Çizim Ekranı painterly plate sözleşmesi — dosyalar public/assets3d/<slot>.webp (M4 slot deseni). */
export type PlateSlot = CardSlot | 'logo-card';

export const PLATE_BY_GROUP: Record<string, PlateSlot> = {
  ANIMATION_EDU: 'card-explorer-archetype',
  ANIMATION_PAINTERLY: 'card-arcane-archetype',
  ANIMATION_STYLIZED: 'card-hero-archetype',
  ANIMATION_DARK: 'card-detective-archetype',
  ANIMATION_BOLD_CEL: 'card-hero-archetype',
  ANIMATION_CEL_3D_HYBRID: 'card-hero-archetype',
  CINEMATIC_REAL: 'card-detective-archetype',
  COMMERCIAL_REAL: 'card-hero-archetype',
};

export function plateSlotFor(group?: string): PlateSlot {
  if (!group) return 'logo-card';
  return PLATE_BY_GROUP[group] ?? 'card-hero-archetype';
}

export function plateUrl(slot: PlateSlot): string {
  return slotUrl(slot);
}
