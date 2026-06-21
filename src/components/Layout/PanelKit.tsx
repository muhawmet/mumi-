import React from 'react';

export const Panel: React.FC<{ title?: string; subtitle?: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <section
    style={{
      background:
        'linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.018)),linear-gradient(180deg,#0b0d13,#07080c)',
      border: '1px solid var(--line2, #ffffff1c)',
      borderRadius: 16,
      padding: 24,
      boxShadow: '0 18px 70px rgba(0,0,0,.24)',
    }}
  >
    {title && (
      <header style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--gold, #f7c948)', fontWeight: 700 }}>
          {title.toUpperCase()}
        </div>
        {subtitle && (
          <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-muted, #94a3b8)' }}>{subtitle}</div>
        )}
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
  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <span style={{ fontSize: 11, letterSpacing: 1, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>
      {label}
    </span>
    {children}
    {hint && <span style={{ fontSize: 11, color: 'var(--text-muted, #94a3b8)', opacity: 0.7 }}>{hint}</span>}
  </label>
);

export const inputStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,.32)',
  border: '1px solid var(--line2, #ffffff1c)',
  borderRadius: 10,
  padding: '12px 14px',
  color: '#fff',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color .15s',
};

export const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'none', cursor: 'pointer' };

export const Button: React.FC<
  { variant?: 'primary' | 'ghost' } & React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ variant = 'primary', style, children, ...rest }) => (
  <button
    {...rest}
    style={{
      padding: '12px 20px',
      borderRadius: 10,
      border: variant === 'primary' ? '1px solid var(--gold, #f7c948)' : '1px solid var(--line3, #ffffff34)',
      background:
        variant === 'primary'
          ? 'linear-gradient(180deg, var(--gold, #f7c948), var(--gold2, #d99a2b))'
          : 'transparent',
      color: variant === 'primary' ? '#1a1300' : '#fff',
      fontWeight: 600,
      fontSize: 14,
      cursor: rest.disabled ? 'not-allowed' : 'pointer',
      opacity: rest.disabled ? 0.5 : 1,
      letterSpacing: 0.5,
      ...style,
    }}
  >
    {children}
  </button>
);
