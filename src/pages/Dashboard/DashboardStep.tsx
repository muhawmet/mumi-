import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStudioStore, type Cast } from '../../store/useStudioStore';
import { Panel, Field, Button, inputStyle, selectStyle } from '../../components/Layout/PanelKit';
import { PHASE0_VIDEO, PHASE0_DESIGN, type Phase0Preset } from '../../data/presets';

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
  const { projectTopic, projectClass, sceneCount, cast, setField, setCurrentStep, applyPreset } =
    useStudioStore();
  const [kind, setKind] = useState<'video' | 'design'>('video');
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const presets = kind === 'video' ? PHASE0_VIDEO : PHASE0_DESIGN;

  const onPreset = (p: Phase0Preset) => {
    setActivePreset(p.id);
    applyPreset(p.sets);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1080 }}>
      <header>
        <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--gold)', fontWeight: 700 }}>STAGE 1 · BRIEF</div>
        <h1 style={{ fontSize: 38, margin: '8px 0 4px', fontWeight: 700, letterSpacing: -0.5 }}>
          Hikayenin omurgası
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Hazır bir başlangıçtan başla ya da elle kur. Phase 0 sadece kuruluşu yapar — sonra istediğini değiştirirsin.
        </p>
      </header>

      <Panel title="Phase 0 — Hazır başlangıç" subtitle="Tek tıkla world + class + scene count ayarlanır.">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['video', 'design'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: `1px solid ${kind === k ? 'var(--gold)' : 'var(--line2)'}`,
                background: kind === k ? 'var(--goldsoft)' : 'transparent',
                color: kind === k ? '#fff' : 'var(--text-muted)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {k === 'video' ? `VIDEO · ${PHASE0_VIDEO.length}` : `DESIGN · ${PHASE0_DESIGN.length}`}
            </button>
          ))}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          {presets.map((p, i) => {
            const active = activePreset === p.id;
            return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                whileHover={{ y: -3 }}
                onClick={() => onPreset(p)}
                style={{
                  padding: 0,
                  borderRadius: 14,
                  border: `1px solid ${active ? 'var(--gold)' : 'var(--line2)'}`,
                  background: 'rgba(0,0,0,0.25)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: '#fff',
                  overflow: 'hidden',
                  boxShadow: active ? '0 0 0 1px var(--gold), 0 12px 30px rgba(247,201,72,.18)' : 'none',
                }}
              >
                <div
                  style={{
                    height: 70,
                    background: p.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                  }}
                >
                  {p.icon}
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>
                    {p.desc}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </Panel>

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

      <Panel title="Oyuncu kadrosu" subtitle="referenceFaceLocked uygulanır — kimlik kayması engellenir.">
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
