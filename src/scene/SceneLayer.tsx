import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { detectWebGL, isSoftwareRenderer } from './webglSupport';
import { resolveSceneModeOnce } from './assetPresence';

const SceneCanvas = lazy(() => import('./SceneCanvas'));

/**
 * Kalıcı 3D katman. WebGL yoksa VEYA yazılımsal renderer (SwiftShader/llvmpipe)
 * varsa hiç mount olmaz — uygulama bugünkü 2D haliyle tam işlevsel kalır
 * (spec: Final Brief asla 3D'ye rehin olmaz). `?scene=force` ile software'da
 * bile zorla mount edilebilir (görsel kanıt shot'ları); `?scene=off` kill switch.
 */
export const SceneLayer: React.FC = () => {
  const [on, setOn] = useState<boolean | null>(null);

  useEffect(() => {
    const search = window.location.search;
    const mode = resolveSceneModeOnce(search);
    // Fallback'e sessiz dönüş yok: software yüzünden düştüysek bir kez uyar.
    if (mode === 'off' && detectWebGL() && !new URLSearchParams(search).get('scene')) {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as
        | WebGLRenderingContext
        | null;
      if (gl && isSoftwareRenderer(gl)) {
        console.warn(
          '[scene] Yazılımsal WebGL renderer tespit edildi (SwiftShader/llvmpipe) — ' +
            '3D katman ana thread\'i aç bırakmamak için devre dışı, 2D fallback aktif. ' +
            'Zorla açmak için ?scene=force.',
        );
      }
      // Geçici probe context'ini serbest bırak: düşük donanımda GPU context kotasını
      // gerçek R3F canvas'ına bırak (I8 — hiçbir geçici context asılı kalmasın).
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    }
    setOn(mode === 'on');
  }, []);

  const handleContextLost = useCallback(() => setOn(false), []);

  // WebGL yoksa / yazılımsal / kapalı: siyah değil, boyalı altın-saat STATİK gradient.
  // Antigravity akvaryumu emekli olduğu için tek arka plan otoritesi burası — F hissi
  // WebGL olmadan da yaşar. 3D tableau'nun kendi paletiyle boyanır (cerulean zenit →
  // erimiş altın ufuk → derin teal deniz), "kahverengi çamur" radyal değil.
  if (on !== true) {
    return (
      <div
        data-testid="scene-fallback"
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: [
            // batan güneş radyansı — ufuk hattında (%58), sağda
            'radial-gradient(46% 30% at 63% 58%, rgba(255,244,220,0.9) 0%, rgba(255,196,118,0.55) 34%, rgba(255,196,118,0) 72%)',
            // gök: cerulean zenit → sıcak ufuk → altın hat → deniz: teal → derin
            'linear-gradient(180deg, #2e5f7a 0%, #6e9395 30%, #d9c193 50%, #ffe7ad 57%, #b8955e 60%, #3d6068 68%, #26505c 82%, #142e36 100%)',
          ].join(', '),
        }}
      />
    );
  }

  return (
    <div
      data-testid="scene-layer"
      aria-hidden
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    >
      <Suspense fallback={null}>
        <SceneCanvas onContextLost={handleContextLost} />
      </Suspense>
    </div>
  );
};
