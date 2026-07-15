import React from 'react';
import { smartUpper } from './textCase';

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
  /** 'glass' yazar, 'parchment' okur (DESIGN_LANGUAGE_V3 §3). */
  variant?: 'glass' | 'parchment';
  className?: string;
  style?: React.CSSProperties;
}> = ({ title, subtitle, children, aside, variant = 'glass', className, style }) => (
  <section
    className={[
      't5-elevate',
      variant === 'parchment' ? 'ml-v3-parchment' : 'ml-v3-panel-glass',
      className,
    ].filter(Boolean).join(' ')}
    style={{ padding: '24px', position: 'relative', overflow: 'hidden', ...style }}
  >
    {(title || aside) && (
      <header
        style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 16, marginBottom: subtitle ? 18 : 16,
        }}
      >
        <div>
          {title && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--m2-amber)', flexShrink: 0, boxShadow: '0 0 9px var(--goldglow)' }} />
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16.5, letterSpacing: 0.2, color: 'var(--m2-paper)', fontWeight: 500 }}>
                {title}
              </span>
            </div>
          )}
          {subtitle && (
            <div style={{ marginTop: 7, fontSize: 13, color: 'var(--m2-muted)', lineHeight: 1.5, maxWidth: 620 }}>
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
  <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <span style={{ fontSize: 11, letterSpacing: 1.4, color: 'var(--m2-muted)', fontWeight: 600 }}>
      {smartUpper(label)}
    </span>
    {children}
    {hint && <span style={{ fontSize: 11.5, color: 'var(--m2-muted)', opacity: 0.8 }}>{hint}</span>}
  </label>
);

export const inputStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.02)',
  backdropFilter: 'blur(8px)',
  border: '1px solid var(--m2-line)',
  borderRadius: '6px',
  padding: '12px 14px',
  color: 'var(--m2-paper)',
  fontSize: 13,
  fontFamily: 'var(--m2-font-sans)',
  outline: 'none',
  transition: 'all var(--m2-hover) var(--m2-ease)',
  boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.3)',
};

export const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  cursor: 'pointer',
  backgroundImage:
    "url('data:image/svg+xml;utf8,<svg width=\"12\" height=\"8\" viewBox=\"0 0 12 8\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M1 1.5L6 6.5L11 1.5\" stroke=\"%239C9588\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>')",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: 38,
};

export const Button: React.FC<
  { variant?: 'primary' | 'solid' | 'ghost' | 'danger' } & React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ variant = 'primary', style, children, onMouseEnter, onMouseLeave, ...rest }) => {
  const [hover, setHover] = React.useState(false);
  const base: React.CSSProperties = {
    padding: '10px 16px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: 12.5,
    fontFamily: 'var(--m2-font-sans)',
    letterSpacing: 0.2,
    cursor: rest.disabled ? 'not-allowed' : 'pointer',
    opacity: rest.disabled ? 0.45 : 1,
    transition: 'all var(--m2-hover) var(--m2-ease)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    position: 'relative', overflow: 'hidden',
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: {
      border: `1px solid ${hover && !rest.disabled ? 'var(--m2-amber)' : 'var(--m2-line-strong)'}`,
      background: hover && !rest.disabled ? 'var(--m2-amber-soft)' : 'rgba(255, 255, 255, 0.03)',
      color: hover && !rest.disabled ? 'var(--m2-amber)' : 'var(--m2-paper)',
      backdropFilter: 'blur(4px)',
    },
    solid: {
      border: '1px solid var(--m2-amber)',
      background: 'var(--m2-amber)',
      color: 'var(--m2-ink)',
      fontWeight: 700,
      boxShadow: hover && !rest.disabled ? '0 4px 18px rgba(247, 201, 72, 0.35)' : '0 2px 8px rgba(0, 0, 0, 0.3)',
    },
    ghost: {
      border: '1px solid transparent',
      background: hover && !rest.disabled ? 'var(--m2-paper)' : 'transparent',
      color: hover && !rest.disabled ? 'var(--m2-ink)' : 'var(--m2-muted)',
    },
    danger: {
      border: `1px solid ${hover && !rest.disabled ? 'var(--m2-danger)' : 'var(--m2-line-strong)'}`,
      background: hover && !rest.disabled ? 'var(--m2-danger)' : 'transparent',
      color: hover && !rest.disabled ? 'var(--m2-ink)' : 'var(--m2-danger)',
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
  const color = tone === 'gold' ? 'var(--m2-amber)' : tone === 'green' ? 'var(--green)' : tone === 'red' ? 'var(--m2-danger)' : 'var(--m2-paper)';
  return (
    <div style={{ padding: '14px 16px', border: '1px solid var(--m2-line)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(4px)', minWidth: 0 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'var(--m2-font-mono)', letterSpacing: -0.5, overflowWrap: 'anywhere' }}>{value}</div>
      <div style={{ fontSize: 10, letterSpacing: 1.2, color: 'var(--m2-muted)', textTransform: 'uppercase', marginTop: 5 }}>{label}</div>
    </div>
  );
};

/* — A small status / label pill — */
export const Chip: React.FC<{ children: React.ReactNode; tone?: 'default' | 'gold' | 'green' | 'red' | 'amber' }> = ({
  children, tone = 'default',
}) => {
  const map = {
    default: { c: 'var(--m2-muted)', b: 'var(--m2-line)', bg: 'var(--m2-surface)' },
    gold:    { c: 'var(--m2-amber)', b: 'var(--m2-amber-soft)', bg: 'var(--m2-surface-2)' },
    green:   { c: 'var(--green)', b: 'rgba(147,201,168,0.28)', bg: 'var(--greensoft)' },
    red:     { c: 'var(--m2-danger)', b: 'rgba(242,109,109,0.3)', bg: 'rgba(242,109,109,0.05)' },
    amber:   { c: 'var(--m2-amber)', b: 'rgba(214,168,79,0.3)', bg: 'var(--m2-amber-soft)' },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
      color: map.c, background: map.bg, border: `1px solid ${map.b}`,
      padding: '4px 10px', borderRadius: '12px',
    }}>
      {children}
    </span>
  );
};

export const Divider: React.FC = () => (
  <div style={{ height: 1, background: 'var(--m2-line)', margin: '4px 0' }} />
);
