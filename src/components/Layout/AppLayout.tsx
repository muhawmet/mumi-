import React from 'react';
import { LayoutDashboard, Palette, Film, Sparkles } from 'lucide-react';
import { useStudioStore, type Step } from '../../store/useStudioStore';

const STEPS: Array<{ id: Step; label: string; icon: React.ReactNode; index: number }> = [
  { id: 'dashboard', label: 'Brief', icon: <LayoutDashboard size={18} />, index: 1 },
  { id: 'recipe', label: 'Reçete', icon: <Palette size={18} />, index: 2 },
  { id: 'timeline', label: 'Timeline', icon: <Film size={18} />, index: 3 },
];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentStep = useStudioStore((s) => s.currentStep);
  const setCurrentStep = useStudioStore((s) => s.setCurrentStep);

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
};
