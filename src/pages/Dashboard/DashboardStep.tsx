import { useStudioStore, type Cast } from '../../store/useStudioStore';
import { Panel, Field, Button, inputStyle, selectStyle } from '../../components/Layout/PanelKit';

const CLASS_OPTIONS = [
  { id: 'EĞİTİM_01', label: 'Eğitim · İlkokul' },
  { id: 'EĞİTİM_02', label: 'Eğitim · Ortaokul' },
  { id: 'EĞİTİM_03', label: 'Eğitim · Lise' },
  { id: 'Tasarım İşi', label: 'Tasarım İşi · Stylized' },
  { id: 'ULTRAREAL_COMMERCIAL', label: 'Reklam · Ultra-Real' },
];

const CAST_OPTIONS: Array<{ id: Cast; label: string; sub: string }> = [
  { id: 'Aras', label: 'Aras', sub: 'erkek çocuk' },
  { id: 'Defne', label: 'Defne', sub: 'kız çocuk' },
  { id: 'İkisi', label: 'İkisi', sub: 'ensemble' },
];

export const DashboardStep = () => {
  const { projectTopic, projectClass, sceneCount, cast, setField, setCurrentStep } = useStudioStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 880 }}>
      <header>
        <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--gold)', fontWeight: 700 }}>STAGE 1 · BRIEF</div>
        <h1 style={{ fontSize: 38, margin: '8px 0 4px', fontWeight: 700 }}>Hikayenin omurgası</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Konu, sınıf, sahne sayısı ve oyuncu kadrosu. Bu Phase 0; bütün üretim buradan akar.
        </p>
      </header>

      <Panel title="Konu & Sınıf">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <Field label="Proje konusu" hint='Kanonik kaynak için "SOURCE:" ön ekiyle çoklu beat yazabilirsin.'>
            <input
              style={inputStyle}
              value={projectTopic}
              onChange={(e) => setField('projectTopic', e.target.value)}
              placeholder="örn. Su Döngüsü"
            />
          </Field>
          <Field label="Proje sınıfı / yolu">
            <select
              style={selectStyle}
              value={projectClass}
              onChange={(e) => setField('projectClass', e.target.value)}
            >
              {CLASS_OPTIONS.map((o) => (
                <option key={o.id} value={o.id} style={{ background: '#0d1018' }}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sahne sayısı" hint="1–20">
            <input
              type="number"
              min={1}
              max={20}
              style={inputStyle}
              value={sceneCount}
              onChange={(e) => setField('sceneCount', Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            />
          </Field>
        </div>
      </Panel>

      <Panel title="Oyuncu kadrosu" subtitle="Karakter kilidi — referenceFaceLocked üretim sırasında uygulanır.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {CAST_OPTIONS.map((c) => {
            const active = cast === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setField('cast', c.id)}
                style={{
                  padding: '20px 16px',
                  borderRadius: 14,
                  border: `1px solid ${active ? 'var(--gold)' : 'var(--line2)'}`,
                  background: active ? 'var(--goldsoft)' : 'rgba(0,0,0,.18)',
                  color: '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all .18s',
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700 }}>{c.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.sub}</div>
              </button>
            );
          })}
        </div>
      </Panel>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <Button onClick={() => setCurrentStep('recipe')}>Reçeteye geç →</Button>
      </div>
    </div>
  );
};
