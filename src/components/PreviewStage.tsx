import React from 'react';
import { useStudioStore } from '../store/useStudioStore';
import { buildPreviewState } from '../core/preview';
import { DATA, deriveTeachingRecipe } from '../core/pure';
import { CanvasPreview } from './CanvasPreview';

export const PreviewStage: React.FC = () => {
  const store = useStudioStore();

  const selectedWorld = DATA.worlds.find((w) => w.id === store.selectedWorldId);
  const teachingMaterial = selectedWorld 
    ? deriveTeachingRecipe(selectedWorld, store.selectedPropId).id 
    : 'world-native';

  const selectedPalette = DATA.palettes.find((p) => p.id === store.selectedPaletteId);
  
  const presetName = selectedWorld && selectedPalette 
    ? `${selectedWorld.name} + ${selectedPalette.name}` 
    : 'Özel Reçete';

  const previewInput = {
    world: store.selectedWorldId,
    palette: store.selectedPaletteId,
    teachingMaterial: teachingMaterial,
    visualWorld: store.projectClass,
    presetName: presetName
  };

  const state = buildPreviewState(previewInput);

  const activeRefId = store.activePreviewRefId || store.selectedRefIds?.[store.selectedRefIds.length - 1] || '';
  const activeRef = DATA.refs.find((r) => r.id === activeRefId);
  const previewType = activeRef?.preview || 'default';

  return (
    <div className="preview-stage" data-wcat={state.category} data-active-ref={activeRef?.id || ''} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      background: 'rgba(10, 13, 20, 0.5)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      borderRadius: '14px',
      color: '#fff',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      overflow: 'hidden',
    }}>
      {/* ── Live Canvas Preview ── */}
      <div style={{
        width: '100%',
        height: '224px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '14px 14px 0 0',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), 0 18px 44px -28px rgba(247,201,72,0.35)',
      }}>
        <CanvasPreview
          colors={state.colors}
          category={state.category}
          previewType={previewType}
          worldId={store.selectedWorldId}
          refId={activeRef?.id}
        />

        {/* Overlay badges */}
        <div style={{
          position: 'absolute', top: 8, left: 10,
          fontSize: 9, fontWeight: 800, letterSpacing: 1.2,
          textTransform: 'uppercase',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 6, padding: '3px 7px',
          color: '#fff',
        }}>
          {state.category}
        </div>

        <div style={{
          position: 'absolute', top: 8, right: 10,
          fontSize: 9, fontWeight: 800, letterSpacing: 0.5,
          background: 'var(--gold)',
          color: '#1a1100',
          borderRadius: 6, padding: '3px 7px',
          maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {previewType}
        </div>

        {/* Bottom label */}
        <div style={{
          position: 'absolute', bottom: 8, left: 10, right: 10,
          fontSize: 11, fontWeight: 800,
          color: '#fff',
          textShadow: '0 2px 12px rgba(0,0,0,0.8)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>{activeRef?.name || state.worldName}</span>
          <span style={{ fontSize: 9, opacity: 0.7 }}>{state.matName}</span>
        </div>
      </div>

      {/* ── Info Section ── */}
      <div style={{ padding: '4px 14px 14px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gold)', marginBottom: 6 }}>
          {state.activePreset}
        </div>
        
        {/* Palette strip */}
        <div style={{ display: 'flex', gap: '3px', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
          {state.colors.map((c, i) => (
            <div key={i} style={{ flex: 1, background: c, transition: 'background 0.4s ease' }} title={c} />
          ))}
        </div>
      </div>
    </div>
  );
};
