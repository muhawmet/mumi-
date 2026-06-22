import React from 'react';
import { CanvasPreview } from './CanvasPreview';
import { buildPreviewState } from '../core/preview';
import { DATA } from '../core/pure';
import { useStudioStore } from '../store/useStudioStore';

/* ============================================================
   RecipeThumb — a live, palette-aware canvas frame for the
   CURRENT recipe (world + palette + primary reference).
   Reuses the per-reference canvas engine so every storyboard
   frame / timeline monitor is the real look, not a dead box.
   ============================================================ */
export const RecipeThumb: React.FC<{ size?: number; radius?: number; style?: React.CSSProperties }> = ({
  size, radius = 10, style,
}) => {
  const worldId = useStudioStore((s) => s.selectedWorldId);
  const paletteId = useStudioStore((s) => s.selectedPaletteId);
  const refIds = useStudioStore((s) => s.selectedRefIds);

  const st = buildPreviewState({ world: worldId, palette: paletteId, teachingMaterial: '', visualWorld: '', presetName: '' });
  const firstRef = DATA.refs.find((r) => r.id === refIds?.[0]);

  return (
    <div
      style={{
        position: 'relative',
        width: size ?? '100%',
        height: size ?? '100%',
        borderRadius: radius,
        overflow: 'hidden',
        border: '1px solid var(--line2)',
        background: '#0a0a0d',
        flexShrink: 0,
        ...style,
      }}
    >
      <CanvasPreview
        colors={st.colors}
        category={st.category}
        previewType={firstRef?.preview || 'default'}
        worldId={worldId}
        refId={refIds?.[0]}
      />
    </div>
  );
};
