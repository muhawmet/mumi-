// src/components/WorldPlate.tsx
import React from 'react';
import { CanvasPreview } from './CanvasPreview';
import type { PreviewCategory } from '../core/preview';
import { plateSlotFor, plateUrl } from './worldPlates';

interface WorldPlateProps {
  worldGroup?: string;
  // Gerçek fallback sözleşmesi: plate decode edemezse piksel compositor döner (V3.1 piksel yasağının tek istisnası).
  colors: string[];
  category: PreviewCategory;
  previewType: string;
  worldId: string;
  refId?: string;
  evidenceLabel?: string;
}

export const WorldPlate: React.FC<WorldPlateProps> = ({
  worldGroup, colors, category, previewType, worldId, refId, evidenceLabel,
}) => {
  const slot = plateSlotFor(worldGroup);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => { setFailed(false); }, [slot]);

  if (failed) {
    return (
      <CanvasPreview
        colors={colors}
        category={category}
        previewType={previewType}
        worldId={worldId}
        refId={refId}
        variant="rail"
        evidenceLabel={evidenceLabel}
      />
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <img
        src={plateUrl(slot)}
        alt=""
        aria-hidden
        draggable={false}
        onError={() => setFailed(true)}
        style={{
          display: 'block', width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center 30%',
          userSelect: 'none', pointerEvents: 'none',
        }}
      />
      {/* Overlay okunurluğu için sıcak scrim */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,9,7,0.34) 0%, rgba(10,9,7,0.05) 40%, rgba(10,9,7,0.52) 100%)',
        pointerEvents: 'none',
      }} />
      {/* MACRO 4 — DÜRÜSTLÜK ROZETİ: bu görsel dünyanın GRUP arketipidir (46 world → az sayıda
          statik görsel), seçili world'ün gerçek karesi DEĞİL. Sahte "bu senin karen" izlenimini
          kaldırır: gerçek kareyi Mami dış araçta üretip yükler (Frame gate, MACRO 5). */}
      {worldId && (
        <div style={{
          position: 'absolute', bottom: 8, left: 10,
          fontSize: 8, fontWeight: 800, letterSpacing: 1,
          background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 5, padding: '2px 6px', color: 'rgba(255,236,205,0.72)',
          pointerEvents: 'none',
        }}>
          STİL ARKETİPİ · gerçek kare değil
        </div>
      )}
    </div>
  );
};
