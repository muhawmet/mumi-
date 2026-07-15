import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import { useStudioStore } from '../store/useStudioStore';
import { LOOK, cameraPoseFor } from './lookConfig';

/**
 * Tek kamera otoritesi. Store'daki currentStep'i izler, kamerayı
 * lookConfig'teki poza yumuşakça damp'ler. Başka hiçbir birim kamerayı oynatmaz.
 *
 * İdle nefes: sabit bakışta sahne ölmesin — poz TEMEL'i damp'lenir, üstüne
 * çok yavaş sinüs süzülmesi biner (dakikalık periyotlar, ±0.2 birim).
 * Süzülme GERÇEK parallax üretir (yakın burun / uzak tepe / güneş ayrışır);
 * poz bandları (position[2]>0, FOV) ihlal edilmez — ofset küçük ve xy'de.
 */
export function CameraRig() {
  // Canvas varsayılan kamerası perspektiftir; bu projede ortografik kamera yok.
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const currentStep = useStudioStore((s) => s.currentStep);
  const targetRef = useRef(new Vector3(0, 1.1, 0));
  const baseRef = useRef<Vector3 | null>(null);

  useFrame(({ clock }, delta) => {
    const pose = cameraPoseFor(currentStep);
    const lambda = LOOK.cameraDamp;

    // Temel pozisyon ayrı yaşar: nefes ofseti damp girdisini kirletmesin.
    if (!baseRef.current) baseRef.current = camera.position.clone();
    const base = baseRef.current;
    base.x = MathUtils.damp(base.x, pose.position[0], lambda, delta);
    base.y = MathUtils.damp(base.y, pose.position[1], lambda, delta);
    base.z = MathUtils.damp(base.z, pose.position[2], lambda, delta);

    // Nefes: iki üst üste binen yavaş dalga — mekanik tek-sinüs salıncak değil.
    const tt = clock.elapsedTime;
    const swayX = Math.sin(tt * 0.13) * 0.16 + Math.sin(tt * 0.041 + 1.7) * 0.09;
    const swayY = Math.sin(tt * 0.09 + 0.9) * 0.07;
    camera.position.set(base.x + swayX, base.y + swayY, base.z);

    const t = targetRef.current;
    t.x = MathUtils.damp(t.x, pose.target[0], lambda, delta);
    t.y = MathUtils.damp(t.y, pose.target[1], lambda, delta);
    t.z = MathUtils.damp(t.z, pose.target[2], lambda, delta);
    camera.lookAt(t);

    if (Math.abs(camera.fov - pose.fov) > 0.01) {
      camera.fov = MathUtils.damp(camera.fov, pose.fov, lambda, delta);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
