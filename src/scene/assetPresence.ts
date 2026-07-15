import { useEffect, useState } from 'react';
import { slotUrl } from './assetSlots';
import { resolveSceneMode, type SceneMode } from './webglSupport';

/** Saf karar: grid yalnız (sahne kapalı) VEYA (zemin dokusu yok) iken görünür. */
export function domFloorGridVisible(mode: SceneMode, floorTextureLive: boolean): boolean {
  return mode === 'off' || !floorTextureLive;
}

/**
 * Modül-seviye tek-seferlik cache (I8). resolveSceneMode her çağrıda canlı WebGL
 * context açar (detect + software probe) — oturum boyunca sonuç değişmez. İlk hesap
 * cache'lenir; sonraki tüm çağıranlar (SceneLayer effect + useFloorGridVisible) aynı
 * sonucu alır. Böylece mount/StrictMode tekrarında yeni geçici context açılmaz ve
 * düşük donanımda gerçek R3F canvas'ının context'i kaybettirilmez.
 */
let cachedSceneMode: SceneMode | undefined;
export function resolveSceneModeOnce(search: string): SceneMode {
  if (cachedSceneMode === undefined) cachedSceneMode = resolveSceneMode(search);
  return cachedSceneMode;
}

/**
 * DOM tarafı zemin probe'u. Sahneden OKUMAZ (V3 §2: tek yön store→sahne) —
 * aynı public dosyayı Image() ile bağımsız dener. onerror'da grid kalır;
 * uyarıyı sahne tarafı (loadSlotTexture) zaten basar, burada çift warn yok.
 */
export function useFloorGridVisible(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const mode = resolveSceneModeOnce(window.location.search);
    if (mode === 'off') return; // fallback: grid dokunulmaz
    let alive = true;
    const img = new Image();
    img.onload = () => {
      if (alive) setVisible(domFloorGridVisible(mode, true));
    };
    img.src = slotUrl('floor-disc');
    return () => {
      alive = false;
      img.onload = null;
    };
  }, []);
  return visible;
}
