import { useMemo } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { Panel, Field, Button, selectStyle } from '../../components/Layout/PanelKit';
import { DATA, groupedRefs, groupedWorlds, deriveTeachingRecipe } from '../../core/pure';

export const RecipeStep = () => {
  const {
    selectedWorldId,
    selectedPropId,
    selectedRefId,
    selectedPaletteId,
    setField,
    setCurrentStep,
  } = useStudioStore();

  const worldGroups = useMemo(() => groupedWorlds(), []);
  const refGroups = useMemo(() => groupedRefs(), []);
  const selectedWorld = DATA.worlds.find((w) => w.id === selectedWorldId);
  const selectedPalette = DATA.palettes.find((p) => p.id === selectedPaletteId);
  const recipe = selectedWorld ? deriveTeachingRecipe(selectedWorld, selectedPropId) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 980 }}>
      <header>
        <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--gold)', fontWeight: 700 }}>STAGE 2 · REÇETE</div>
        <h1 style={{ fontSize: 38, margin: '8px 0 4px', fontWeight: 700 }}>Görsel DNA</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Dünya yetkilidir; Reference DNA ona tabidir. Palet, dünya rengini ezerse "USER_PALETTE" olarak işaretlenir.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        <Panel title="Vizyonel dünya" subtitle={selectedWorld?.formula}>
          <Field label="Dünya">
            <select style={selectStyle} value={selectedWorldId} onChange={(e) => setField('selectedWorldId', e.target.value)}>
              <option value="" style={{ background: '#0d1018' }}>Seç…</option>
              {Object.entries(worldGroups).map(([group, list]) => (
                <optgroup key={group} label={group.toUpperCase()} style={{ background: '#0d1018' }}>
                  {list.map((w) => (
                    <option key={w.id} value={w.id} style={{ background: '#0d1018' }}>{w.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
          {selectedWorld && (
            <div style={{ marginTop: 18, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>
              <div><strong style={{ color: '#fff' }}>Render:</strong> {selectedWorld.render}</div>
              {selectedWorld.motion && <div style={{ marginTop: 6 }}><strong style={{ color: '#fff' }}>Motion:</strong> {selectedWorld.motion}</div>}
              {selectedWorld.colors && (
                <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
                  {selectedWorld.colors.map((c) => (
                    <span key={c} title={c} style={{ width: 28, height: 28, borderRadius: 8, background: c, border: '1px solid var(--line2)' }} />
                  ))}
                </div>
              )}
            </div>
          )}
        </Panel>

        <Panel title="Reference DNA" subtitle={`${DATA.refs.length} kayıt · subordinate to world`}>
          <Field label="Referans">
            <select style={selectStyle} value={selectedRefId} onChange={(e) => setField('selectedRefId', e.target.value)}>
              <option value="" style={{ background: '#0d1018' }}>(yok)</option>
              {Object.entries(refGroups).map(([cat, list]) => (
                <optgroup key={cat} label={cat.toUpperCase()} style={{ background: '#0d1018' }}>
                  {list.map((r) => (
                    <option key={r.id} value={r.id} style={{ background: '#0d1018' }}>{r.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
        </Panel>

        <Panel title="Tactile recipe" subtitle="Dünya tactile değilse 'world-native' kalır.">
          <Field label="Override">
            <select style={selectStyle} value={selectedPropId} onChange={(e) => setField('selectedPropId', e.target.value)}>
              <option value="native_world" style={{ background: '#0d1018' }}>Dünya kararı (otomatik)</option>
              <option value="paper" style={{ background: '#0d1018' }}>paper</option>
              <option value="clay" style={{ background: '#0d1018' }}>clay</option>
              <option value="wood" style={{ background: '#0d1018' }}>wood</option>
              <option value="fabric" style={{ background: '#0d1018' }}>fabric</option>
              <option value="shadow-puppet" style={{ background: '#0d1018' }}>shadow-puppet</option>
              <option value="paper-theater" style={{ background: '#0d1018' }}>paper-theater</option>
              <option value="stained-glass" style={{ background: '#0d1018' }}>stained-glass</option>
            </select>
          </Field>
          {recipe && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
              Aktif: <strong style={{ color: 'var(--gold)' }}>{recipe.id}</strong> · {recipe.source}
            </div>
          )}
        </Panel>

        <Panel title="Palet" subtitle={`${DATA.palettes.length} ön ayar — dünyayı ezerse uyarı çıkar.`}>
          <Field label="Palette">
            <select style={selectStyle} value={selectedPaletteId} onChange={(e) => setField('selectedPaletteId', e.target.value)}>
              <option value="" style={{ background: '#0d1018' }}>Dünya paleti (varsayılan)</option>
              {DATA.palettes.map((p) => (
                <option key={p.id} value={p.id} style={{ background: '#0d1018' }}>{p.name}</option>
              ))}
            </select>
          </Field>
          {selectedPalette && (
            <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
              {selectedPalette.colors.map((c) => (
                <span key={c} title={c} style={{ width: 28, height: 28, borderRadius: 8, background: c, border: '1px solid var(--line2)' }} />
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="ghost" onClick={() => setCurrentStep('dashboard')}>← Brief'e dön</Button>
        <Button onClick={() => setCurrentStep('timeline')} disabled={!selectedWorldId}>Timeline'a geç →</Button>
      </div>
    </div>
  );
};
