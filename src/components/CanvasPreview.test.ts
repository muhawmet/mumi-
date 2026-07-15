import { describe, expect, it } from 'vitest';
import { drawPixelGrid } from './CanvasPreview';

// Sahte 2D context: sadece çağrı sayar.
function fakeCtx() {
  const calls = { stroke: 0 };
  return {
    calls,
    ctx: {
      strokeStyle: '',
      lineWidth: 0,
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => { calls.stroke += 1; },
    } as unknown as CanvasRenderingContext2D,
  };
}

describe('drawPixelGrid', () => {
  it('w=0 iken sonsuz döngüye girmez, hiç çizmez (e2e freeze kök nedeni)', () => {
    // Layout öncesi getBoundingClientRect 0×0 döner: adım 0 olur ve
    // `for (x=0; x<=0; x+=0)` ana thread'i süresiz kilitlerdi.
    const { ctx, calls } = fakeCtx();
    drawPixelGrid(ctx, 0, 0);
    expect(calls.stroke).toBe(0);
  });

  it('h=0 iken de güvenli', () => {
    const { ctx, calls } = fakeCtx();
    drawPixelGrid(ctx, 320, 0);
    expect(calls.stroke).toBe(0);
  });

  it('normal boyutta grid çizgileri çizer', () => {
    const { ctx, calls } = fakeCtx();
    drawPixelGrid(ctx, 320, 200);
    expect(calls.stroke).toBeGreaterThan(0);
  });
}, 5000);
