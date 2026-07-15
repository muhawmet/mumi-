import { SRGBColorSpace, TextureLoader, type Texture } from 'three';
import { worldCoverUrl } from '../components/worldCovers';
import { LOOK } from './lookConfig';

/* Seans-ömürlü cache — loadSlotTexture aynası ama worldId-keyed (kapaklar kademeli dolar,
 * eksik kapak istisna değil NORMAL durumdur; V3 §7.11 sessiz düşüş yasak, uyarı bir kez). */
const cache = new Map<string, Promise<Texture | null>>();

export function loadWorldCoverTexture(
  worldId: string,
  hwMaxAnisotropy: number,
  load: (url: string) => Promise<Texture> = (url) => new TextureLoader().loadAsync(url),
  warn: (msg: string) => void = console.warn,
): Promise<Texture | null> {
  let entry = cache.get(worldId);
  if (!entry) {
    const url = worldCoverUrl(worldId);
    entry = load(url)
      .then((t) => {
        t.colorSpace = SRGBColorSpace;
        t.anisotropy = Math.min(LOOK.assets3d.maxAnisotropy, hwMaxAnisotropy);
        return t;
      })
      .catch(() => {
        warn(`[assets3d] missing/failed: ${url}`);
        return null;
      });
    cache.set(worldId, entry);
  }
  return entry;
}

/** Test izolasyonu için. */
export function resetWorldCoverCache(): void {
  cache.clear();
}
