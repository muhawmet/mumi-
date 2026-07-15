import { describe, expect, it } from 'vitest';
import { domFloorGridVisible } from './assetPresence';

describe('domFloorGridVisible (V3 §8 tek zemin otoritesi)', () => {
  it('sahne kapalıyken grid DAİMA yaşar (fallback kanunu) — doku olsa bile', () => {
    expect(domFloorGridVisible('off', true)).toBe(true);
    expect(domFloorGridVisible('off', false)).toBe(true);
  });
  it('sahne açık + doku canlı → grid emekli (iki zemin aynı anda yaşamaz)', () => {
    expect(domFloorGridVisible('on', true)).toBe(false);
  });
  it('sahne açık ama doku yok → grid kalır (placeholder dönemi)', () => {
    expect(domFloorGridVisible('on', false)).toBe(true);
  });
});
