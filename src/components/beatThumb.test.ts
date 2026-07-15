// src/components/beatThumb.test.ts
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { paintBeatThumb } from './BeatThumb';

function mockCtx() {
  const calls: string[] = [];
  const grad = { addColorStop: vi.fn() };
  return {
    calls,
    ctx: {
      createLinearGradient: vi.fn(() => grad),
      createRadialGradient: vi.fn(() => grad),
      fillRect: vi.fn(function () { calls.push('fillRect'); }),
      beginPath: vi.fn(),
      moveTo: vi.fn(function () { calls.push('moveTo'); }),
      lineTo: vi.fn(function () { calls.push('lineTo'); }),
      arc: vi.fn(function () { calls.push('arc'); }),
      stroke: vi.fn(function (this: unknown) { calls.push('stroke'); }),
      fill: vi.fn(function () { calls.push('fill'); }),
      set fillStyle(_v: unknown) {}, get fillStyle() { return ''; },
      set strokeStyle(_v: unknown) {}, get strokeStyle() { return ''; },
      set lineWidth(_v: unknown) {}, get lineWidth() { return 0; },
      set lineCap(_v: unknown) {}, get lineCap() { return ''; },
      set globalAlpha(_v: unknown) {}, get globalAlpha() { return 1; },
    } as unknown as CanvasRenderingContext2D,
  };
}

describe('paintBeatThumb', () => {
  it('4 saniyede kare boyar: zemin + en az 3 fırça yayı + vinyet, hata fırlatmaz', () => {
    const { ctx, calls } = mockCtx();
    paintBeatThumb(ctx, 120, 120, ['#2b2117', '#6b5636', '#f7c948', '#93c9a8'], 'source-001');
    expect(calls.filter((c) => c === 'fillRect').length).toBeGreaterThanOrEqual(2);
    expect(calls.filter((c) => c === 'stroke').length).toBeGreaterThanOrEqual(3);
  });

  it('aynı seed aynı çizim yolunu üretir (determinizm)', () => {
    const a = mockCtx(); const b = mockCtx();
    paintBeatThumb(a.ctx, 100, 60, ['#111', '#222', '#333', '#444'], 'beat-7');
    paintBeatThumb(b.ctx, 100, 60, ['#111', '#222', '#333', '#444'], 'beat-7');
    expect(a.calls).toEqual(b.calls);
  });

  it('bileşen rAF kullanmaz — statik tek çizim sözleşmesi', () => {
    const src = readFileSync(new URL('./BeatThumb.tsx', import.meta.url), 'utf8');
    expect(src).not.toContain('requestAnimationFrame');
    expect(src).toContain('paintBeatThumb');
  });
});
