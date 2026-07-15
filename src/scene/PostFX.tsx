import { Bloom, BrightnessContrast, ChromaticAberration, DepthOfField, EffectComposer, GodRays, HueSaturation, Vignette } from '@react-three/postprocessing';
import type { ReactElement } from 'react';
import { Vector2 } from 'three';
import { LOOK } from './lookConfig';
import { useSunStore } from './sunRef';

const chromaticOffset = new Vector2(LOOK.chromaticAberration.offset, LOOK.chromaticAberration.offset);

/** V4 canlı altın-saat yağlıboya: crepuscular god-ray + ön-plan bokeh (DOF) + altın bloom +
 *  color grading (HueSaturation/BrightnessContrast — ACESFilmic'in desature'ını dengeler,
 *  BotW canlılığı) + vignette + çok hafif CA. Bandlar lookConfig.test'e bağlı.
 *  NOT: full-screen Noise SÖKÜLDÜ (karıncalanma; painterly grain artık sky dokusuna baked).
 *  GodRays yalnız güneş mesh (sunRef) hazırken mount olur — null-occluder crash'i yok. */
export function PostFX() {
  const sun = useSunStore((s) => s.sun);
  const effects: Array<ReactElement | null> = [
    <DepthOfField key="dof" focusDistance={0.045} focalLength={0.02} bokehScale={2.4} height={480} />,
    sun ? <GodRays key="godrays" sun={sun} samples={50} density={0.94} decay={0.92} weight={0.6} exposure={0.55} clampMax={1} blur /> : null,
    <Bloom
      key="bloom"
      intensity={LOOK.bloom.intensity}
      luminanceThreshold={LOOK.bloom.luminanceThreshold}
      luminanceSmoothing={LOOK.bloom.luminanceSmoothing}
      mipmapBlur
    />,
    <HueSaturation key="hue" saturation={LOOK.grade.saturation} />,
    <BrightnessContrast key="bc" contrast={LOOK.grade.contrast} />,
    <ChromaticAberration key="ca" offset={chromaticOffset} />,
    <Vignette key="vignette" offset={LOOK.vignette.offset} darkness={LOOK.vignette.darkness} />,
  ];
  return <EffectComposer>{effects.filter(Boolean) as ReactElement[]}</EffectComposer>;
}
