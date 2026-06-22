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
              <li key={s.id}>
                <button
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
    minHeight: '100vh',
    width: '100%',
    background: 'var(--bg, #030407)',
    color: '#fff',
    fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
  },
  sidebar: {
    width: 260,
    flexShrink: 0,
    padding: 24,
    borderRight: '1px solid var(--line, #ffffff10)',
    background: 'linear-gradient(180deg, var(--s1, #080a0f) 0%, var(--bg, #030407) 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 32,
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 12 },
  brandTitle: { fontSize: 14, fontWeight: 800, letterSpacing: 2, color: 'var(--gold, #f7c948)' },
  brandSub: { fontSize: 10, color: 'var(--text-muted, #94a3b8)', letterSpacing: 1 },
  stepList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 },
  stepBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    background: 'transparent',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    color: 'var(--text-muted, #94a3b8)',
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    textAlign: 'left',
    transition: 'all .18s ease',
  },
  stepBtnActive: {
    background: 'var(--goldsoft, #f7c94814)',
    borderColor: 'var(--line3, #ffffff34)',
    color: '#fff',
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    background: 'var(--s3, #151927)',
    fontSize: 11,
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted, #94a3b8)',
  },
  stepBadgeActive: { background: 'var(--gold, #f7c948)', color: '#1a1300' },
  stepIcon: { display: 'inline-flex' },
  footer: { marginTop: 'auto', fontSize: 10, color: 'var(--text-muted, #94a3b8)', letterSpacing: 1 },
  footerLine: { opacity: 0.7 },
  main: { flex: 1, padding: '48px 56px', overflowY: 'auto', position: 'relative' },
  rightRail: {
    width: 280,
    flexShrink: 0,
    padding: '28px 22px',
    borderLeft: '1px solid var(--line, #ffffff10)',
    background: 'linear-gradient(180deg, #090b11, #050609)',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  railEyebrow: { fontSize: 10, letterSpacing: 2, color: 'var(--gold)', fontWeight: 800 },
  railStatus: { fontSize: 26, fontWeight: 800, marginTop: 12 },
  railCopy: { color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.55, minHeight: 76 },
  railMetric: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', padding: '12px 0', color: 'var(--text-muted)', fontSize: 11 },
  railHash: { display: 'grid', gap: 5, borderTop: '1px solid var(--line)', padding: '12px 0', color: 'var(--text-muted)', fontSize: 10 },
};
