import { describe, it, expect, beforeEach } from 'vitest';
import { useStudioStore } from './useStudioStore';
import { DATA } from '../core/pure';

// WIRING: Reçete galerisi artık COMMERCIAL_REAL (reklam) dünyalarını tıklanır yaptı.
// Bir reklam dünyasını edu/animasyon path'inde seçmek generateBatch'i WORLD_PATH_MISMATCH
// ile BLOKLUYORDU. effectiveMaterialId'nin materyali dünya-uyumluya çektiği gibi, world
// seçimi register-uyumsuz projectClass'ı geçerli bir REAL path'e (ULTRAREAL_COMMERCIAL)
// çeker — asla geçerli bir path'i ezmez.
describe('world-select path guard (reklam dünyası tuzağını kapatır)', () => {
  beforeEach(() => useStudioStore.getState().reset());

  it('reklam dünyası + edu path → projectClass ULTRAREAL_COMMERCIAL olur', () => {
    useStudioStore.getState().setField('projectClass', 'ANIMATION_EDU');
    useStudioStore.getState().setField('selectedWorldId', 'product_brand_real');
    const s = useStudioStore.getState();
    expect(s.selectedWorldId).toBe('product_brand_real');
    expect(s.projectClass).toBe('ULTRAREAL_COMMERCIAL');
  });

  it('non-real dünya + edu path → projectClass DEĞİŞMEZ (uyumlu)', () => {
    useStudioStore.getState().setField('projectClass', 'ANIMATION_EDU');
    useStudioStore.getState().setField('selectedWorldId', 'pixar_3d_edu');
    expect(useStudioStore.getState().projectClass).toBe('ANIMATION_EDU');
  });

  it('reklam dünyası + zaten geçerli REAL path → path EZİLMEZ', () => {
    useStudioStore.getState().setField('projectClass', 'PRODUCT_HERO');
    useStudioStore.getState().setField('selectedWorldId', 'product_brand_real');
    expect(useStudioStore.getState().projectClass).toBe('PRODUCT_HERO');
  });

  // Simetrik (reverse) tuzak: REAL path'te bir non-real (animasyon/stilize) dünya seçmek de
  // WORLD_PATH_MISMATCH ile bloklardı. Dünyanın grubuna göre uyumlu non-REAL path'e çekilir.
  it('non-real edu dünyası + REAL path → ANIMATION_EDU olur', () => {
    useStudioStore.getState().setField('projectClass', 'PRODUCT_HERO');
    useStudioStore.getState().setField('selectedWorldId', 'pixar_3d_edu'); // ANIMATION_EDU grubu
    expect(useStudioStore.getState().projectClass).toBe('ANIMATION_EDU');
  });

  it('non-real stilize dünyası + REAL path → STYLIZED_PREMIUM olur', () => {
    const stylized = useStudioStore.getState();
    const styWorld = DATA.worlds.find((w) => w.group === 'ANIMATION_STYLIZED');
    useStudioStore.getState().setField('projectClass', 'PRODUCT_HERO');
    useStudioStore.getState().setField('selectedWorldId', styWorld!.id);
    expect(useStudioStore.getState().projectClass).toBe('STYLIZED_PREMIUM');
  });

  it('non-real dünya + zaten uyumlu non-REAL path → path EZİLMEZ', () => {
    useStudioStore.getState().setField('projectClass', 'ANIMATION_EDU');
    useStudioStore.getState().setField('selectedWorldId', 'pixar_3d_edu');
    expect(useStudioStore.getState().projectClass).toBe('ANIMATION_EDU');
  });
});
