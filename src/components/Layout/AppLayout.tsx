import React from 'react';
import { LayoutDashboard, Palette, Film, Sparkles, Check } from 'lucide-react';
import { sourceReadiness, useStudioStore, type Step } from '../../store/useStudioStore';
import { PreviewStage } from '../PreviewStage';
import { RecipeRail } from '../RecipeRail';
import { AntigravityBackground } from '../AntigravityBackground';
import { ProductionPulse } from '../ProductionPulse';

const STEPS: Array<{ id: Step; label: string; hint: string; icon: React.ReactNode; index: number }> = [
  { id: 'dashboard', label: 'Brief', hint: 'Kaynak & konu', icon: <LayoutDashboard size={17} />, index: 1 },
  { id: 'recipe', label: 'Reçete', hint: 'Dünya · palet · DNA', icon: <Palette size={17} />, index: 2 },
  { id: 'scenes', label: 'Sahneler', hint: 'Beat planı', icon: <Film size={17} />, index: 3 },
  { id: 'timeline', label: 'Timeline', hint: 'Üret & teslim', icon: <Sparkles size={17} />, index: 4 },
];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentStep = useStudioStore((s) => s.currentStep);
  const setCurrentStep = useStudioStore((s) => s.setCurrentStep);
  const rawSource = useStudioStore((s) => s.rawSource);
  const sourceReport = useStudioStore((s) => s.sourceReport);
  const sourceBeats = useStudioStore((s) => s.sourceBeats);
  const sourceGate = sourceReadiness({ rawSource, sourceReport });
  const activeIdx = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="ml-shell" style={styles.shell}>
      <AntigravityBackground />
      <div className="ml-spotlight" aria-hidden style={styles.spotlight} />

      <nav className="ml-sidebar" style={styles.sidebar}>
        <header style={styles.brand}>
          <span style={styles.brandMark}><Sparkles size={17} color="var(--gold-deep)" /></span>
          <div>
            <div style={styles.brandTitle}>MAMILAS</div>
            <div style={styles.brandSub}>STUDIO CONSOLE · 2026</div>
          </div>
        </header>

        <ol style={styles.stepList}>
          <span aria-hidden style={styles.spine} />
          <span aria-hidden style={{ ...styles.spineFill, height: `calc(${(activeIdx / (STEPS.length - 1)) * 100}% )` }} />
          {STEPS.map((s, i) => {
            const active = currentStep === s.id;
            const done = i < activeIdx;
            return (
              <li key={s.id} style={styles.stepRow}>
                <button
                  className="ml-step-btn"
                  onClick={() => setCurrentStep(s.id)}
                  style={{ ...styles.stepBtn, ...(active ? styles.stepBtnActive : null) }}
                >
                  <span style={{
                    ...styles.stepNode,
                    ...(done ? styles.stepNodeDone : null),
                    ...(active ? styles.stepNodeActive : null),
                  }}>
                    {done ? <Check size={13} strokeWidth={3} /> : s.index}
                  </span>
                  <span style={styles.stepIcon}>{s.icon}</span>
                  <span style={styles.stepText}>
                    <span style={{ ...styles.stepLabel, color: active ? 'var(--text)' : done ? 'var(--text-soft)' : 'var(--text-muted)' }}>{s.label}</span>
                    <span style={styles.stepHint}>{s.hint}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <ProductionPulse />
      </nav>

      <main className="ml-main" style={styles.main}>{children}</main>

      <aside className="ml-right-rail" style={styles.rightRail} data-testid="source-right-rail">
        <div style={styles.railStack}>
          <section style={styles.drawingMonitor}>
            <div style={styles.monitorHead}>
              <span style={styles.railEyebrow}>ÇİZİM EKRANI</span>
              <span style={styles.monitorKicker}>LIVE CANVAS</span>
            </div>
            <PreviewStage />
          </section>

          {currentStep === 'dashboard' ? (
            <section style={styles.sourceCard}>
              <div style={styles.railEyebrow}>SOURCE GATE</div>
              <div style={{ ...styles.railStatus, color: sourceGate.ready && rawSource ? 'var(--green)' : rawSource ? 'var(--red)' : 'var(--text-muted)' }}>
                {!rawSource ? 'BEKLİYOR' : sourceGate.ready ? 'PASS' : 'FAIL'}
              </div>
              <p style={styles.railCopy}>
                {!rawSource
                  ? 'Raw Source Vault boş. Konu bazlı üretim kullanılabilir; kanonik kaynak kilidi yok.'
                  : sourceGate.ready
                    ? 'Ham kaynak beat zinciriyle birebir eşleşiyor. Üretim kapısı açık.'
                    : sourceGate.reason}
              </p>
              <div style={styles.railMetric}><span>Coverage</span><strong>{sourceReport ? `${sourceReport.coverage}%` : '—'}</strong></div>
              <div style={styles.railMetric}><span>Segments</span><strong>{sourceBeats.length}</strong></div>
              <div style={styles.railHash}><span>RAW</span><code>{sourceReport?.rawHash ?? '--------'}</code></div>
              <div style={styles.railHash}><span>RECON</span><code>{sourceReport?.reconHash ?? '--------'}</code></div>
            </section>
          ) : (
            <RecipeRail />
          )}
        </div>
      </aside>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: 'flex',
    height: '100vh',
    width: '100%',
    overflow: 'hidden',
    background: 'transparent',
    color: 'var(--text)',
    fontFamily: 'var(--font-sans)',
    position: 'relative',
    zIndex: 1,
  },
  spotlight: {
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
    background:
      'radial-gradient(120% 80% at 18% -10%, rgba(246,200,98,0.07), transparent 50%),' +
      'radial-gradient(100% 90% at 100% 110%, rgba(255,157,77,0.05), transparent 55%),' +
      'linear-gradient(180deg, rgba(10,10,13,0.2), rgba(10,10,13,0.6))',
  },
  sidebar: {
    width: 256,
    flexShrink: 0,
    padding: '24px 20px',
    borderRight: '1px solid var(--line)',
    background: 'rgba(12, 12, 16, 0.66)',
    backdropFilter: 'blur(26px)',
    WebkitBackdropFilter: 'blur(26px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 34,
    position: 'sticky',
    top: 0,
    height: '100vh',
    zIndex: 2,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 12 },
  brandMark: {
    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--grad-gold)', boxShadow: 'var(--shadow-gold)',
  },
  brandTitle: { fontSize: 15, fontWeight: 800, letterSpacing: 3.5, color: 'var(--text)' },
  brandSub: { fontSize: 8.5, color: 'var(--gold)', letterSpacing: 2.2, fontWeight: 700, marginTop: 2 },
  stepList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' },
  spine: { position: 'absolute', left: 15, top: 18, bottom: 18, width: 2, background: 'var(--line2)', borderRadius: 999 },
  spineFill: { position: 'absolute', left: 15, top: 18, width: 2, background: 'linear-gradient(180deg, var(--gold), var(--gold-2))', borderRadius: 999, boxShadow: '0 0 10px var(--goldglow)', transition: 'height var(--dur-2) var(--ease)' },
  stepRow: { position: 'relative' },
  stepBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '9px 11px',
    background: 'transparent',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'transparent',
    borderRadius: 'var(--r-md)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all var(--dur) var(--ease)',
    position: 'relative',
    zIndex: 1,
  },
  stepBtnActive: {
    background: 'var(--goldsoft)',
    borderColor: 'var(--goldline)',
    boxShadow: '0 6px 20px -10px var(--goldglow)',
  },
  stepNode: {
    width: 26, height: 26, borderRadius: 999, flexShrink: 0,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg)', borderWidth: 2, borderStyle: 'solid', borderColor: 'var(--line3)',
    fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
    transition: 'all var(--dur) var(--ease)',
  },
  stepNodeDone: { background: 'var(--bg)', borderColor: 'var(--gold-2)', color: 'var(--gold)' },
  stepNodeActive: { background: 'var(--grad-gold)', borderColor: 'var(--gold)', color: 'var(--gold-deep)', boxShadow: '0 0 14px var(--goldglow)' },
  stepIcon: { display: 'inline-flex', color: 'var(--text-muted)' },
  stepText: { display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 },
  stepLabel: { fontSize: 13.5, fontWeight: 700, lineHeight: 1.1 },
  stepHint: { fontSize: 10, color: 'var(--text-dim)', letterSpacing: 0.2 },
  main: { flex: 1, overflowY: 'auto', position: 'relative', minWidth: 0, zIndex: 1 },
  rightRail: {
    width: 340,
    flexShrink: 0,
    padding: '24px 20px',
    borderLeft: '1px solid var(--line)',
    background: 'rgba(12, 12, 16, 0.66)',
    backdropFilter: 'blur(26px)',
    WebkitBackdropFilter: 'blur(26px)',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
    zIndex: 2,
  },
  railStack: { display: 'flex', flexDirection: 'column', gap: 18 },
  drawingMonitor: {
    padding: 10,
    borderRadius: 20,
    border: '1px solid rgba(247, 201, 72, 0.18)',
    background:
      'linear-gradient(180deg, rgba(247, 201, 72, 0.08), rgba(255,255,255,0.025) 42%, rgba(0,0,0,0.12))',
    boxShadow: '0 18px 45px -34px var(--goldglow), inset 0 1px 0 rgba(255,255,255,0.06)',
  },
  monitorHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px 10px' },
  monitorKicker: {
    fontSize: 9,
    letterSpacing: 1.4,
    color: 'var(--text-dim)',
    fontWeight: 800,
    fontFamily: 'var(--font-mono)',
  },
  sourceCard: { padding: 16, border: '1px solid var(--line2)', borderRadius: 'var(--r-lg)', background: 'var(--panel)', boxShadow: 'var(--shadow-sm)' },
  railEyebrow: { fontSize: 10, letterSpacing: 2, color: 'var(--gold)', fontWeight: 800 },
  railStatus: { fontSize: 28, fontWeight: 800, marginTop: 12, letterSpacing: -0.5 },
  railCopy: { color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.6, minHeight: 76, marginTop: 6 },
  railMetric: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', padding: '12px 0', color: 'var(--text-muted)', fontSize: 11.5 },
  railHash: { display: 'grid', gap: 5, borderTop: '1px solid var(--line)', padding: '12px 0', color: 'var(--text-dim)', fontSize: 10, fontFamily: 'var(--font-mono)' },
};
