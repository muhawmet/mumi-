import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import type { Texture } from 'three';
import { loadSlotTexture, type AssetSlot } from './assetSlots';

/**
 * Slot dokusunu dener: varsa Texture, yoksa null (uyarı loadSlotTexture'da basıldı).
 * Suspense YOK — eksik asset istisna değil, brief teslimine kadar NORMAL durumdur;
 * placeholder malzeme null döndükçe mount'ta kalır (V3 §7.11).
 */
export function useSlotTexture(slot: AssetSlot): Texture | null {
  const gl = useThree((s) => s.gl);
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    let alive = true;
    loadSlotTexture(slot, gl.capabilities.getMaxAnisotropy()).then((t) => {
      if (alive && t) setTexture(t);
    });
    return () => { alive = false; };
  }, [slot, gl]);

  return texture;
}
