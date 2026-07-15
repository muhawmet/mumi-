import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadWorldCoverTexture, resetWorldCoverCache } from './worldCoverTexture';

const fakeTexture = { anisotropy: 0, colorSpace: '' } as never;

describe('loadWorldCoverTexture', () => {
  beforeEach(() => resetWorldCoverCache());

  it('başarılı yüklemede texture döner ve ikinci çağrı cache\'ten gelir', async () => {
    const load = vi.fn().mockResolvedValue(fakeTexture);
    const t1 = await loadWorldCoverTexture('pixar_3d_edu', 8, load, vi.fn());
    const t2 = await loadWorldCoverTexture('pixar_3d_edu', 8, load, vi.fn());
    expect(t1).toBe(fakeTexture);
    expect(t2).toBe(fakeTexture);
    expect(load).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith('/assets3d/worlds/pixar_3d_edu.webp');
  });

  it('yükleme düşerse null döner, uyarı BİR kez basılır, yeniden denenmez', async () => {
    const load = vi.fn().mockRejectedValue(new Error('404'));
    const warn = vi.fn();
    expect(await loadWorldCoverTexture('ghibli', 8, load, warn)).toBeNull();
    expect(await loadWorldCoverTexture('ghibli', 8, load, warn)).toBeNull();
    expect(load).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('/assets3d/worlds/ghibli.webp');
  });
});
