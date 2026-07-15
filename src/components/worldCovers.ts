import { DATA } from '../core/pure';

/** Reçete galeri duvarı kapak sözleşmesi — dosyalar public/assets3d/worlds/<worldId>.webp.
 *  Liste DATA.worlds'ten türetilir: yeni world eklenince sözleşme kendiliğinden büyür,
 *  teslim durumu scripts/check-assets3d.mjs 'worlds' bölümünde sayılır (kademeli dolum). */
export const WORLD_COVER_FILES: readonly string[] = DATA.worlds.map((w) => `${w.id}.webp`);

export function worldCoverUrl(worldId: string): string {
  return `/assets3d/worlds/${worldId}.webp`;
}
