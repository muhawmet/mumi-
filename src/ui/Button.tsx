import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cx } from './utils';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'className' | 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, children, className, ...props }, ref) => {
    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-2)',
      borderRadius: 'var(--radius-md)',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
      border: '1px solid transparent',
      textDecoration: 'none',
      whiteSpace: 'nowrap',
    };

    const variants: Record<string, React.CSSProperties> = {
      primary: {
        background: 'var(--color-gold)',
        color: 'var(--color-bg-base)',
        boxShadow: 'var(--shadow-sm)',
      },
      secondary: {
        background: 'var(--color-bg-elevated)',
        color: 'var(--color-text-primary)',
        borderColor: 'var(--color-border-medium)',
      },
      ghost: {
        background: 'transparent',
        color: 'var(--color-text-primary)',
      },
      danger: {
        background: 'var(--color-danger-dim)',
        color: 'var(--color-danger)',
        borderColor: 'var(--color-danger)',
      },
    };

    const sizes: Record<string, React.CSSProperties> = {
      sm: {
        padding: 'var(--space-1) var(--space-3)',
        fontSize: '0.875rem',
      },
      md: {
        padding: 'var(--space-2) var(--space-4)',
        fontSize: '1rem',
      },
      lg: {
        padding: 'var(--space-3) var(--space-6)',
        fontSize: '1.125rem',
      },
    };

    const hoverVariants = {
      primary: { background: 'var(--color-gold-hover)', scale: 1.02 },
      secondary: { background: 'var(--color-border-subtle)', borderColor: 'var(--color-gold-dim)', scale: 1.02 },
      ghost: { background: 'var(--color-border-subtle)', scale: 1.02 },
      danger: { background: 'var(--color-danger)', color: '#fff', scale: 1.02 },
    };
    
    const tapVariants = { scale: 0.98 };

    return (
      <motion.button
        ref={ref}
        className={cx('ui-focus-ring', className)}
        style={{ ...baseStyle, ...variants[variant], ...sizes[size], ...(props.style as React.CSSProperties) }}
        whileHover={hoverVariants[variant]}
        whileTap={tapVariants}
        {...props}
      >
        {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
