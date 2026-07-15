import { readFileSync } from 'fs';
import { RepeatWrapping, Texture } from 'three';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ASSET_SLOTS, CARD_SLOTS, loadSlotTexture, missingAssetWarning,
  resetSlotTextureCache, slotUrl, tuneSlotTexture,
} from './assetSlots';
import { LOOK } from './lookConfig';

describe('assetSlots manifesti (ASSET_BRIEF §2–3 birebir)', () => {
  it('dokuz slot, brief adlarıyla birebir — sözleşme değişirse burası kırılır', () => {
    expect([...ASSET_SLOTS]).toEqual([
      'card-hero-archetype', 'card-detective-archetype',
      'card-arcane-archetype', 'card-explorer-archetype',
      'table-top', 'floor-disc', 'backdrop-sky', 'logo-card',
      'wall-plaster',
    ]);
  });

  it('kart slotları FloatingCard sırasıyla dörtlü', () => {
    expect(CARD_SLOTS).toHaveLength(4);
    for (const s of CARD_SLOTS) expect(s.startsWith('card-')).toBe(true);
  });

  it('URL sözleşmesi: /assets3d/<slot>.webp, kebab-case', () => {
    for (const slot of ASSET_SLOTS) {
      expect(slotUrl(slot)).toBe(`/assets3d/${slot}.webp`);
      expect(slot).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('uyarı metni V3 §7.11 / brief §3 formatında', () => {
    expect(missingAssetWarning('table-top')).toBe('[assets3d] missing/failed: /assets3d/table-top.webp');
  });
});

describe('tuneSlotTexture (V3 §8 format kanunu)', () => {
  it('her doku sRGB + anisotropy ≤ 8', () => {
    const t = tuneSlotTexture(new Texture(), 'table-top', 16);
    expect(t.colorSpace).toBe('srgb');
    expect(t.anisotropy).toBe(LOOK.assets3d.maxAnisotropy); // 8
  });
  it('anisotropy donanım tavanını aşamaz', () => {
    expect(tuneSlotTexture(new Texture(), 'table-top', 4).anisotropy).toBe(4);
  });
  it('yalnız floor-disc ve wall-plaster tile eder (seamless → repeat)', () => {
    const floor = tuneSlotTexture(new Texture(), 'floor-disc', 16);
    expect(floor.repeat.x).toBe(LOOK.assets3d.floorRepeat);
    const table = tuneSlotTexture(new Texture(), 'table-top', 16);
    expect(table.repeat.x).toBe(1);
  });

  it('wall-plaster slotu sözleşmede ve duvar tile ayarı alır (T1 atölye duvarı)', () => {
    expect(ASSET_SLOTS).toContain('wall-plaster');
    const t = tuneSlotTexture(new Texture(), 'wall-plaster', 16);
    expect(t.wrapS).toBe(RepeatWrapping);
    expect(t.repeat.x).toBe(LOOK.assets3d.wallRepeat[0]);
    expect(t.repeat.y).toBe(LOOK.assets3d.wallRepeat[1]);
  });
});

describe('loadSlotTexture (V3 §7.11: sessiz düşüş yasak, warn tek sefer)', () => {
  beforeEach(() => resetSlotTextureCache());

  it('başarı: doku tune edilip döner, loader slot başına 1 kez çağrılır (cache)', async () => {
    const load = vi.fn(async () => new Texture());
    const a = await loadSlotTexture('floor-disc', 16, load);
    const b = await loadSlotTexture('floor-disc', 16, load);
    expect(a).toBe(b);
    expect(a?.colorSpace).toBe('srgb');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('aynı-tick yarış: iki eşzamanlı çağrı tek yüklemeyi ve aynı dokuyu paylaşır', async () => {
    const load = vi.fn(async () => new Texture());
    const pa = loadSlotTexture('table-top', 16, load);
    const pb = loadSlotTexture('table-top', 16, load);
    const [a, b] = await Promise.all([pa, pb]);
    expect(load).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
  });

  it('eksik dosya: null döner + tam V3 mesajıyla TEK console.warn', async () => {
    const warn = vi.fn();
    const load = vi.fn(async () => { throw new Error('404'); });
    expect(await loadSlotTexture('backdrop-sky', 16, load, warn)).toBeNull();
    expect(await loadSlotTexture('backdrop-sky', 16, load, warn)).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith('[assets3d] missing/failed: /assets3d/backdrop-sky.webp');
  });
});

describe('check-assets3d.mjs senkronu (manifest↔script)', () => {
  it('check-assets3d.mjs her slotu tanır (manifest↔script senkronu)', () => {
    const script = readFileSync('scripts/check-assets3d.mjs', 'utf8');
    for (const slot of ASSET_SLOTS) expect(script).toContain(`${slot}.webp`);
  });
});
