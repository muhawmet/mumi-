export function detectWebGL(
  createCanvas: () => HTMLCanvasElement = () => document.createElement('canvas'),
): boolean {
  try {
    const canvas = createCanvas();
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Yazılımsal (software) renderer tespiti. SwiftShader / llvmpipe / software
 * rasterizer'lar 3D sahneyi o kadar yavaş çizer ki ana thread'i aç bırakır
 * (kanıt: 50ms setInterval → 1200ms drift). Bunları "WebGL yok" gibi ele alırız.
 *
 * UNMASKED_RENDERER'ı WEBGL_debug_renderer_info ile okur. Uzantı yoksa veya
 * herhangi bir şey fırlatırsa false döner: donanım varsayarız, gizlilik odaklı
 * tarayıcıları (uzantıyı gizleyenler) cezalandırmayız.
 */
export function isSoftwareRenderer(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
): boolean {
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return false;
    const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
    if (typeof renderer !== 'string') return false;
    return /swiftshader|llvmpipe|software/i.test(renderer);
  } catch {
    return false;
  }
}

export type SceneMode = 'on' | 'off';

/**
 * Sahne modunu URL search param + WebGL yeteneğine göre çözer.
 *
 * - `?scene=off`  → daima 'off' (kill switch).
 * - `?scene=force` → WebGL varsa 'on' (software olsa bile; görsel kanıt shot'ları için).
 * - varsayılan     → WebGL yok ya da software renderer → 'off'; donanım → 'on'.
 *
 * detect/probeRenderer enjekte edilebilir (test edilebilirlik + tek probe).
 */
export function resolveSceneMode(
  search: string,
  detect: () => boolean = () => detectWebGL(),
  probeRenderer: () => boolean = defaultProbeSoftwareRenderer,
): SceneMode {
  const scene = new URLSearchParams(search).get('scene');

  if (scene === 'off') return 'off';

  const hasWebGL = detect();

  if (scene === 'force') return hasWebGL ? 'on' : 'off';

  if (!hasWebGL) return 'off';
  if (probeRenderer()) return 'off';
  return 'on';
}

/** Gerçek bir canvas açıp software renderer olup olmadığını tek seferde ölçer. */
function defaultProbeSoftwareRenderer(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') ||
      canvas.getContext('webgl')) as WebGLRenderingContext | WebGL2RenderingContext | null;
    if (!gl) return false;
    return isSoftwareRenderer(gl);
  } catch {
    return false;
  }
}
