import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStudioStore } from '../../store/useStudioStore';
import { Panel, Field, Button, selectStyle } from '../../components/Layout/PanelKit';
import { DATA, groupedRefs, groupedWorlds, deriveTeachingRecipe } from '../../core/pure';

function worldGradient(colors?: string[]): string {
  if (!colors || colors.length === 0) return 'linear-gradient(135deg,#1a1a2e,#16213e)';
  const stops = colors.slice(0, 4);
  if (stops.length === 1) return `linear-gradient(135deg,${stops[0]},#0a0a14)`;
  return `linear-gradient(135deg,${stops.join(',')})`;
}

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1180 }}>
      <header>
        <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--gold)', fontWeight: 700 }}>STAGE 2 · REÇETE</div>
        <h1 style={{ fontSize: 38, margin: '8px 0 4px', fontWeight: 700, letterSpacing: -0.5 }}>Görsel DNA</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Dünya yetkilidir; Reference DNA ona tabidir. Palet, dünya rengini ezerse "USER_PALETTE" olarak işaretlenir.
        </p>
      </header>

      <Panel
        title={`Vizyonel dünya (${DATA.worlds.length})`}
        subtitle={selectedWorld ? selectedWorld.formula : 'Sahnenin tüm görsel grameri buradan akar.'}
      >
        {Object.entries(worldGroups).map(([group, list]) => (
          <div key={group} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>
              {group.toUpperCase()} · {list.length}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                gap: 10,
              }}
            >
              {list.map((w, i) => {
                const active = selectedWorldId === w.id;
                return (
                  <motion.button
                    key={w.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    whileHover={{ y: -2 }}
                    onClick={() => setField('selectedWorldId', w.id)}
                    style={{
                      padding: 0,
                      borderRadius: 12,
                      border: `1px solid ${active ? 'var(--gold)' : 'var(--line2)'}`,
                      background: 'rgba(0,0,0,.25)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: '#fff',
                      overflow: 'hidden',
                      boxShadow: active ? '0 0 0 1px var(--gold), 0 12px 30px rgba(247,201,72,.16)' : 'none',
                    }}
                  >
                    <div style={{ height: 56, background: worldGradient(w.colors) }} />
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{w.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{w.id}</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
        {selectedWorld && (
          <div
            style={{
              marginTop: 12,
              padding: 14,
              borderRadius: 10,
              background: 'rgba(247,201,72,.04)',
              border: '1px solid var(--line2)',
              fontSize: 12,
              color: 'var(--text-muted)',
              lineHeight: 1.55,
            }}
          >
            <div><strong style={{ color: '#fff' }}>Render:</strong> {selectedWorld.render}</div>
            {selectedWorld.motion && (
              <div style={{ marginTop: 6 }}>
                <strong style={{ color: '#fff' }}>Motion:</strong> {selectedWorld.motion}
              </div>
            )}
          </div>
        )}
      </Panel>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Panel title="Reference DNA" subtitle={`${DATA.refs.length} kayıt · subordinate to world`}>
          <Field label="Referans">
            <select style={selectStyle} value={selectedRefId} onChange={(e) => setField('selectedRefId', e.target.value)}>
              <option value="" style={{ background: '#0d1018' }}>(yok)</option>
              {Object.entries(refGroups).map(([cat, list]) => (
                <optgroup key={cat} label={cat.toUpperCase()} style={{ background: '#0d1018' }}>
                  {list.map((r) => (
                    <option key={r.id} value={r.id} style={{ background: '#0d1018' }}>
                      {r.name}
                    </option>
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
      </div>

      <Panel title={`Palet (${DATA.palettes.length})`} subtitle="Dünya paletini ezerse Brief'te 'USER_PALETTE' işaretlenir.">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 10,
          }}
        >
          <button
            onClick={() => setField('selectedPaletteId', '')}
            style={{
              padding: 12,
              borderRadius: 10,
              border: `1px solid ${selectedPaletteId === '' ? 'var(--gold)' : 'var(--line2)'}`,
              background: selectedPaletteId === '' ? 'var(--goldsoft)' : 'rgba(0,0,0,.2)',
              cursor: 'pointer',
              color: '#fff',
              textAlign: 'left',
              fontSize: 12,
            }}
          >
            <div style={{ fontWeight: 700 }}>Dünya paleti</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>varsayılan</div>
          </button>
          {DATA.palettes.map((p) => {
            const active = selectedPaletteId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setField('selectedPaletteId', p.id)}
                style={{
                  padding: 0,
                  borderRadius: 10,
                  border: `1px solid ${active ? 'var(--gold)' : 'var(--line2)'}`,
                  background: 'rgba(0,0,0,.2)',
                  cursor: 'pointer',
                  color: '#fff',
                  textAlign: 'left',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', height: 40 }}>
                  {p.colors.slice(0, 6).map((c, i) => (
                    <div key={i} style={{ flex: 1, background: c }} />
                  ))}
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</div>
                </div>
              </button>
            );
          })}
        </div>
        {selectedPalette && (
          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
            Seçildi: <strong style={{ color: 'var(--gold)' }}>{selectedPalette.name}</strong>
            {selectedPalette.use && <span> · {selectedPalette.use}</span>}
          </div>
        )}
      </Panel>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="ghost" onClick={() => setCurrentStep('dashboard')}>← Brief'e dön</Button>
        <Button onClick={() => setCurrentStep('timeline')} disabled={!selectedWorldId}>
          Timeline'a geç → <span className="kbd" style={{ marginLeft: 8 }}>⌘↵</span>
        </Button>
      </div>
    </div>
  );
};
