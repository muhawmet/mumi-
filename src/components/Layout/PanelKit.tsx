import React from 'react';

/* =============================================================
   PanelKit — shared premium primitives (Phase G)
   Every page renders through these, so a change here lifts the
   whole app. Pure presentation; no business logic.
   ============================================================= */

export const Panel: React.FC<{
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Optional element rendered on the right of the header (actions, chips). */
  aside?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ title, subtitle, children, aside, className, style }) => (
  <section
    className={className}
    style={{
      background: 'var(--panel)',
      backdropFilter: 'blur(var(--blur))',
      WebkitBackdropFilter: 'blur(var(--blur))',
      border: '1px solid var(--line2)',
      borderRadius: 'var(--r-lg)',
      padding: 'var(--sp-6)',
      boxShadow: 'var(--shadow), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}
  >
    {/* hairline top highlight */}
    <span
      aria-hidden
      style={{
        position: 'absolute', insetInline: 1, top: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, var(--glass-hi), transparent)',
        borderTopLeftRadius: 'var(--r-lg)', borderTopRightRadius: 'var(--r-lg)',
      }}
    />
    {(title || aside) && (
      <header
        style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 16, marginBottom: subtitle ? 18 : 16,
        }}
      >
        <div>
          {title && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--gold)', boxShadow: '0 0 8px var(--goldglow)' }} />
              <span style={{ fontSize: 11, letterSpacing: 2.4, color: 'var(--gold)', fontWeight: 700 }}>
                {title.toUpperCase()}
              </span>
            </div>
          )}
          {subtitle && (
            <div style={{ marginTop: 7, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: 620 }}>
              {subtitle}
            </div>
          )}
        </div>
        {aside && <div style={{ flexShrink: 0 }}>{aside}</div>}
      </header>
    )}
    {children}
  </section>
);

export const Field: React.FC<{ label: string; children: React.ReactNode; hint?: string }> = ({
  label,
  children,
  hint,
}) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
    <span style={{ fontSize: 10.5, letterSpacing: 1.4, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
      {label}
    </span>
    {children}
    {hint && <span style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>{hint}</span>}
  </label>
);

export const inputStyle: React.CSSProperties = {
  background: 'var(--inset)',
  border: '1px solid var(--line2)',
  borderRadius: 'var(--r-sm)',
  padding: '12px 14px',
  color: 'var(--text)',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)',
};

export const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  cursor: 'pointer',
  backgroundImage:
    "url('data:image/svg+xml;utf8,<svg width=\"12\" height=\"8\" viewBox=\"0 0 12 8\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M1 1.5L6 6.5L11 1.5\" stroke=\"%238a93a6\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>')",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: 38,
};

export const Button: React.FC<
  { variant?: 'primary' | 'ghost' | 'danger' } & React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ variant = 'primary', style, children, onMouseEnter, onMouseLeave, ...rest }) => {
  const [hover, setHover] = React.useState(false);
  const base: React.CSSProperties = {
    padding: '11px 18px',
    borderRadius: 'var(--r-sm)',
    fontWeight: 600,
    fontSize: 13.5,
    letterSpacing: 0.3,
    cursor: rest.disabled ? 'not-allowed' : 'pointer',
    opacity: rest.disabled ? 0.45 : 1,
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    transform: hover && !rest.disabled ? 'translateY(-2px) scale(1.02)' : 'none',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    position: 'relative', overflow: 'hidden',
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: {
      border: '1px solid var(--gold)',
      background: 'var(--grad-gold)',
      color: 'var(--gold-deep)',
      fontWeight: 800,
      boxShadow: hover && !rest.disabled
        ? '0 10px 30px -6px var(--goldglow), inset 0 1px 0 rgba(255,255,255,0.5)'
        : 'var(--shadow-gold), inset 0 1px 0 rgba(255,255,255,0.4)',
    },
    ghost: {
      border: '1px solid rgba(255, 255, 255, 0.05)',
      background: hover && !rest.disabled ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.01)',
      color: 'var(--text)',
      backdropFilter: 'blur(10px)',
    },
    danger: {
      border: '1px solid rgba(255, 92, 121, 0.4)',
      background: hover && !rest.disabled ? 'rgba(255, 92, 121, 0.15)' : 'rgba(255, 92, 121, 0.05)',
      color: 'var(--red)',
      boxShadow: hover && !rest.disabled ? '0 0 16px rgba(255, 92, 121, 0.2)' : 'none',
    },
  };
  return (
    <button
      {...rest}
      onMouseEnter={(e) => { setHover(true); onMouseEnter?.(e); }}
      onMouseLeave={(e) => { setHover(false); onMouseLeave?.(e); }}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
};

/* — A compact metric tile — */
export const Stat: React.FC<{ label: string; value: React.ReactNode; tone?: 'default' | 'gold' | 'green' | 'red' }> = ({
  label, value, tone = 'default',
}) => {
  const color = tone === 'gold' ? 'var(--gold)' : tone === 'green' ? 'var(--green)' : tone === 'red' ? 'var(--red)' : 'var(--text)';
  return (
    <div style={{ padding: '14px 16px', border: '1px solid var(--line2)', borderRadius: 'var(--r-md)', background: 'var(--panel-2)', minWidth: 0 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'var(--font-mono)', letterSpacing: -0.5, overflowWrap: 'anywhere' }}>{value}</div>
      <div style={{ fontSize: 10, letterSpacing: 1.2, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 5 }}>{label}</div>
    </div>
  );
};

/* — A small status / label pill — */
export const Chip: React.FC<{ children: React.ReactNode; tone?: 'default' | 'gold' | 'green' | 'red' | 'amber' }> = ({
  children, tone = 'default',
}) => {
  const map = {
    default: { c: 'var(--text-soft)', b: 'var(--line2)', bg: 'var(--glass)' },
    gold:    { c: 'var(--gold)', b: 'var(--goldline)', bg: 'var(--goldsoft)' },
    green:   { c: 'var(--green)', b: 'rgba(77,245,160,0.3)', bg: 'var(--greensoft)' },
    red:     { c: 'var(--red)', b: 'rgba(255,92,121,0.3)', bg: 'var(--redsoft)' },
    amber:   { c: 'var(--amber)', b: 'rgba(245,181,77,0.3)', bg: 'rgba(245,181,77,0.1)' },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
      color: map.c, background: map.bg, border: `1px solid ${map.b}`,
      padding: '4px 10px', borderRadius: 'var(--r-pill)',
    }}>
      {children}
    </span>
  );
};

export const Divider: React.FC = () => (
  <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--line2), transparent)', margin: '4px 0' }} />
);
