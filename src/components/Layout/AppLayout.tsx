import React from 'react';
import { LayoutDashboard, Palette, Film, Sparkles } from 'lucide-react';
import { sourceReadiness, useStudioStore, type Step } from '../../store/useStudioStore';
import { PreviewStage } from '../PreviewStage';
import { GoldenViewer } from '../GoldenViewer';

const STEPS: Array<{ id: Step; label: string; icon: React.ReactNode; index: number }> = [
  { id: 'dashboard', label: 'Brief', icon: <LayoutDashboard size={18} />, index: 1 },
  { id: 'recipe', label: 'Reçete', icon: <Palette size={18} />, index: 2 },
  { id: 'scenes', label: 'Sahneler', icon: <Film size={18} />, index: 3 },
  { id: 'timeline', label: 'Timeline', icon: <Sparkles size={18} />, index: 4 },
];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentStep = useStudioStore((s) => s.currentStep);
  const setCurrentStep = useStudioStore((s) => s.setCurrentStep);
  const rawSource = useStudioStore((s) => s.rawSource);
  const sourceReport = useStudioStore((s) => s.sourceReport);
  const sourceBeats = useStudioStore((s) => s.sourceBeats);
  const sourceGate = sourceReadiness({ rawSource, sourceReport });

  return (
    <div className="ml-shell" style={styles.shell}>
      <nav className="ml-sidebar" style={styles.sidebar}>
        <header style={styles.brand}>
          <Sparkles size={20} color="var(--gold)" />
          <div>
            <div style={styles.brandTitle}>MAMILAS</div>
            <div style={styles.brandSub}>Pro OS · 2026</div>
          </div>
        </header>

        <ol style={styles.stepList}>
          {STEPS.map((s) => {
            const active = currentStep === s.id;
            return (
              <li key={s.id} style={{ position: 'relative' }}>
                {active && <span className="ml-active-bar" aria-hidden style={styles.activeBar} />}
                <button
                  className="ml-step-btn"
                  onClick={() => setCurrentStep(s.id)}
                  style={{ ...styles.stepBtn, ...(active ? styles.stepBtnActive : null) }}
                >
                  <span style={{ ...styles.stepBadge, ...(active ? styles.stepBadgeActive : null) }}>{s.index}</span>
                  <span style={styles.stepIcon}>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <footer className="ml-footer" style={styles.footer}>
          <div style={styles.footerLine}>M4 Max · iPhone 16 Pro Max</div>
          <div style={styles.footerLine}>Quantum OS Build</div>
        </footer>
      </nav>

      <main className="ml-main" style={styles.main}>{children}</main>

      <aside className="ml-right-rail" style={styles.rightRail} data-testid="source-right-rail">
        {currentStep === 'dashboard' ? (
          <>
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
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <PreviewStage />
            <GoldenViewer />
          </div>
        )}
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
  sidebar: {
    width: 248,
    flexShrink: 0,
    padding: 22,
    borderRight: '1px solid var(--line)',
    background: 'linear-gradient(180deg, rgba(11,14,22,0.92), rgba(6,7,11,0.92))',
    backdropFilter: 'blur(var(--blur))',
    WebkitBackdropFilter: 'blur(var(--blur))',
    display: 'flex',
    flexDirection: 'column',
    gap: 30,
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 12 },
  brandTitle: { fontSize: 15, fontWeight: 800, letterSpacing: 3, color: 'var(--text)' },
  brandSub: { fontSize: 9.5, color: 'var(--gold)', letterSpacing: 2, fontWeight: 600, marginTop: 1 },
  stepList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 },
  activeBar: {
    position: 'absolute', left: -22, top: 10, bottom: 10, width: 3,
    background: 'var(--gold)', borderRadius: 999, boxShadow: '0 0 12px var(--goldglow)',
  },
  stepBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '11px 13px',
    background: 'transparent',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    color: 'var(--text-muted)',
    borderRadius: 'var(--r-sm)',
    cursor: 'pointer',
    fontSize: 13.5,
    fontWeight: 600,
    textAlign: 'left',
    transition: 'all var(--dur) var(--ease)',
  },
  stepBtnActive: {
    background: 'var(--goldsoft)',
    borderColor: 'var(--goldline)',
    color: 'var(--text)',
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 7,
    background: 'var(--s3)',
    border: '1px solid var(--line2)',
    fontSize: 11,
    fontWeight: 700,
    fontFamily: 'var(--font-mono)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    flexShrink: 0,
  },
  stepBadgeActive: { background: 'var(--gold)', color: '#241a00', border: '1px solid var(--gold)' },
  stepIcon: { display: 'inline-flex' },
  footer: { marginTop: 'auto', fontSize: 9.5, color: 'var(--text-dim)', letterSpacing: 1, display: 'grid', gap: 3 },
  footerLine: {},
  main: { flex: 1, overflowY: 'auto', position: 'relative', minWidth: 0 },
  rightRail: {
    width: 288,
    flexShrink: 0,
    padding: '28px 22px',
    borderLeft: '1px solid var(--line)',
    background: 'linear-gradient(180deg, rgba(11,14,22,0.7), rgba(6,7,11,0.7))',
    backdropFilter: 'blur(var(--blur))',
    WebkitBackdropFilter: 'blur(var(--blur))',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
  },
  railEyebrow: { fontSize: 10, letterSpacing: 2, color: 'var(--gold)', fontWeight: 800 },
  railStatus: { fontSize: 28, fontWeight: 800, marginTop: 12, letterSpacing: -0.5 },
  railCopy: { color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.6, minHeight: 76, marginTop: 6 },
  railMetric: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', padding: '12px 0', color: 'var(--text-muted)', fontSize: 11.5 },
  railHash: { display: 'grid', gap: 5, borderTop: '1px solid var(--line)', padding: '12px 0', color: 'var(--text-dim)', fontSize: 10, fontFamily: 'var(--font-mono)' },
};
