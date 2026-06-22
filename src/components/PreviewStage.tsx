import React from 'react';
import { useStudioStore } from '../store/useStudioStore';
import { buildPreviewState } from '../core/preview';
import { DATA, deriveTeachingRecipe } from '../core/pure';

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

  return (
    <div className="preview-stage" data-wcat={state.category} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '16px',
      background: '#1a1d24',
      borderRadius: '8px',
      color: '#fff',
      border: '1px solid #333'
    }}>
      <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Adaptive Preview
      </div>
      <div style={{ fontSize: '16px', fontWeight: 600, color: '#f4c27a' }}>
        {state.activePreset}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '8px 0' }}>
        <div style={{
          width: '48px', height: '48px',
          background: `linear-gradient(135deg, ${state.colors[0]}, ${state.colors[2] || '#2b2f3a'})`,
          borderRadius: state.category === 'real' ? '4px' : '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px',
          boxShadow: `0 4px 12px ${state.colors[1] || '#000'}40`
        }}>
          {state.icon}
        </div>
        <div>
          <div style={{ fontWeight: 'bold' }}>{state.worldName}</div>
          <div style={{ fontSize: '13px', color: '#aaa', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{state.matIcon}</span> {state.matName}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px', height: '12px', borderRadius: '4px', overflow: 'hidden' }}>
        {state.colors.map((c, i) => (
          <div key={i} style={{ flex: 1, background: c }} title={c} />
        ))}
      </div>
    </div>
  );
};
