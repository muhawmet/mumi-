import { describe, expect, it } from 'vitest';
import { detectWebGL, isSoftwareRenderer, resolveSceneMode } from './webglSupport';

describe('detectWebGL', () => {
  it('getContext webgl2 dönerse true', () => {
    const fake = { getContext: (kind: string) => (kind === 'webgl2' ? {} : null) };
    expect(detectWebGL(() => fake as unknown as HTMLCanvasElement)).toBe(true);
  });

  it('hiçbir context yoksa false', () => {
    const fake = { getContext: () => null };
    expect(detectWebGL(() => fake as unknown as HTMLCanvasElement)).toBe(false);
  });

  it('getContext fırlatırsa false (crash yok)', () => {
    const fake = { getContext: () => { throw new Error('boom'); } };
    expect(detectWebGL(() => fake as unknown as HTMLCanvasElement)).toBe(false);
  });
});

// Sahte GL context'i: UNMASKED_RENDERER'ı verilen string olarak döndürür.
function fakeGL(rendererName: string | null, opts: { noExt?: boolean; throwOnParam?: boolean } = {}) {
  const UNMASKED = 37446;
  return {
    getExtension: (name: string) =>
      name === 'WEBGL_debug_renderer_info' && !opts.noExt
        ? { UNMASKED_RENDERER_WEBGL: UNMASKED }
        : null,
    getParameter: (p: number) => {
      if (opts.throwOnParam) throw new Error('boom');
      return p === UNMASKED ? rendererName : null;
    },
  } as unknown as WebGLRenderingContext;
}

describe('isSoftwareRenderer', () => {
  it('SwiftShader → true', () => {
    expect(isSoftwareRenderer(fakeGL('ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device), SwiftShader driver)'))).toBe(true);
  });

  it('llvmpipe → true', () => {
    expect(isSoftwareRenderer(fakeGL('llvmpipe (LLVM 12.0.0, 256 bits)'))).toBe(true);
  });

  it('"software" içeren → true', () => {
    expect(isSoftwareRenderer(fakeGL('Mesa Software Rasterizer'))).toBe(true);
  });

  it('gerçek GPU (Apple M1) → false', () => {
    expect(isSoftwareRenderer(fakeGL('ANGLE (Apple, Apple M1, OpenGL 4.1)'))).toBe(false);
  });

  it('debug uzantısı yoksa → false (gizlilik tarayıcısını cezalandırma)', () => {
    expect(isSoftwareRenderer(fakeGL(null, { noExt: true }))).toBe(false);
  });

  it('getParameter fırlatırsa → false', () => {
    expect(isSoftwareRenderer(fakeGL(null, { throwOnParam: true }))).toBe(false);
  });

  it('renderer null dönerse → false', () => {
    expect(isSoftwareRenderer(fakeGL(null))).toBe(false);
  });
});

describe('resolveSceneMode', () => {
  const hwDetect = () => true;
  const hwRenderer = () => false; // hardware
  const swRenderer = () => true; // software

  it('?scene=off → daima off (WebGL olsa bile)', () => {
    expect(resolveSceneMode('?scene=off', hwDetect, hwRenderer)).toBe('off');
  });

  it('?scene=force → WebGL varsa on (software olsa bile)', () => {
    expect(resolveSceneMode('?scene=force', hwDetect, swRenderer)).toBe('on');
  });

  it('?scene=force → WebGL yoksa off', () => {
    expect(resolveSceneMode('?scene=force', () => false, swRenderer)).toBe('off');
  });

  it('varsayılan + WebGL yok → off', () => {
    expect(resolveSceneMode('', () => false, hwRenderer)).toBe('off');
  });

  it('varsayılan + software renderer → off', () => {
    expect(resolveSceneMode('', hwDetect, swRenderer)).toBe('off');
  });

  it('varsayılan + hardware renderer → on', () => {
    expect(resolveSceneMode('', hwDetect, hwRenderer)).toBe('on');
  });

  it('search "?a=b&scene=off" gibi ek paramlarla da off', () => {
    expect(resolveSceneMode('?a=b&scene=off', hwDetect, hwRenderer)).toBe('off');
  });
});
