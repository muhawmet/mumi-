import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { LOOK } from './lookConfig';
import { DioramaStage } from './DioramaStage';
import { CameraRig } from './CameraRig';
import { PostFX } from './PostFX';

interface SceneCanvasProps {
  onContextLost: () => void;
}

/** webglcontextlost dinleyicisini effect ömrüne bağlar — remount/HMR'da sızıntı yok. */
function ContextLostGuard({ onContextLost }: { onContextLost: () => void }) {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const handle = (event: Event) => {
      event.preventDefault();
      console.warn('[scene] WebGL context kaybedildi — 2D fallback aktif.');
      onContextLost();
    };
    gl.domElement.addEventListener('webglcontextlost', handle);
    return () => gl.domElement.removeEventListener('webglcontextlost', handle);
  }, [gl, onContextLost]);

  return null;
}

export default function SceneCanvas({ onContextLost }: SceneCanvasProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      shadows
      camera={{ position: [6.5, 4.2, 8.5], fov: 34, near: 0.1, far: 120 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.setClearColor(LOOK.clearColor);
        gl.toneMappingExposure = LOOK.grade.exposure; // V4 canlılık — ACESFilmic'i biraz aç
      }}
    >
      <fog attach="fog" args={[LOOK.fog.color, LOOK.fog.near, LOOK.fog.far]} />
      <ContextLostGuard onContextLost={onContextLost} />
      <CameraRig />
      <DioramaStage />
      <PostFX />
    </Canvas>
  );
}
