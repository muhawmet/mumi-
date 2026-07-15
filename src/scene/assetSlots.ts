import { RepeatWrapping, SRGBColorSpace, TextureLoader, type Texture } from 'three';
import { LOOK } from './lookConfig';

/**
 * M4 slot sözleşmesi — TEK doğruluk kaynağı.
 * Adlar ASSET_BRIEF_DRAFT.md §2–3 ile BİREBİRDİR; slot adı = dosya adı.
 * Muhammet dosyayı public/assets3d/ altına atar, kod değişmez, slot bağlanır.
 */
export const CARD_SLOTS = [
  'card-hero-archetype',      // anime/aksiyon arketipi
  'card-detective-archetype', // sinematik-real/noir
  'card-arcane-archetype',    // arcane/büyü
  'card-explorer-archetype',  // edu/keşif
] as const;

export const ASSET_SLOTS = [
  ...CARD_SLOTS,
  'table-top',     // masa üstü, 1024² WebP
  'floor-disc',    // zemin, 2048² seamless WebP
  'backdrop-sky',  // gökyüzü, 2048×1024 WebP
  'logo-card',     // amblem kartı, 1024×1448 WebP (harf YOK — logotype DOM'da)
  'wall-plaster',  // T1 atölye arka duvarı, 2048² seamless WebP
] as const;

export type CardSlot = (typeof CARD_SLOTS)[number];
export type AssetSlot = (typeof ASSET_SLOTS)[number];

export function slotUrl(slot: AssetSlot): string {
  return `/assets3d/${slot}.webp`;
}

/** V3 §7.11 uyarı metni — check-assets3d.mjs ve kanıt script'leri bu kalıbı grep'ler. */
export function missingAssetWarning(slot: AssetSlot): string {
  return `[assets3d] missing/failed: ${slotUrl(slot)}`;
}

/** V3 §8 format kanunu: hepsi sRGB, anisotropy ≤ 8; yalnız zemin tile eder. */
export function tuneSlotTexture(texture: Texture, slot: AssetSlot, hwMaxAnisotropy: number): Texture {
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = Math.min(LOOK.assets3d.maxAnisotropy, hwMaxAnisotropy);
  if (slot === 'floor-disc') {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(LOOK.assets3d.floorRepeat, LOOK.assets3d.floorRepeat);
  }
  if (slot === 'wall-plaster') {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(LOOK.assets3d.wallRepeat[0], LOOK.assets3d.wallRepeat[1]);
  }
  texture.needsUpdate = true;
  return texture;
}

/* Seans-ömürlü cache: slot başına TEK yükleme denemesi ve TEK uyarı.
 * Yükleme denemesinin kendisi probe'dur — ayrı fetch-HEAD yok (Vite dev'de
 * eksik dosya SPA fallback'iyle 200 dönebilir; decode hatası tek doğru sinyaldir). */
const cache = new Map<AssetSlot, Promise<Texture | null>>();

/** Seans-ömürlü cache: başarısız slot reload'a kadar ASLA yeniden denenmez; uyarı slot başına en fazla bir kez basılır. */
export function loadSlotTexture(
  slot: AssetSlot,
  hwMaxAnisotropy: number,
  load: (url: string) => Promise<Texture> = (url) => new TextureLoader().loadAsync(url),
  warn: (msg: string) => void = console.warn,
): Promise<Texture | null> {
  let entry = cache.get(slot);
  if (!entry) {
    entry = load(slotUrl(slot))
      .then((t) => tuneSlotTexture(t, slot, hwMaxAnisotropy))
      .catch(() => {
        warn(missingAssetWarning(slot)); // V3 §7.11: sessiz düşüş YASAK
        return null;                      // placeholder malzeme mount'ta kalır
      });
    cache.set(slot, entry);
  }
  return entry;
}

/** Test izolasyonu için. */
export function resetSlotTextureCache(): void {
  cache.clear();
}
