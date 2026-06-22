import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cx } from './utils';

export interface ChipProps extends Omit<HTMLMotionProps<'span'>, 'className'> {
  className?: string;
  variant?: 'default' | 'gold' | 'success' | 'danger';
  interactive?: boolean;
}

export const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, variant = 'default', interactive = false, ...props }, ref) => {
    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
      padding: 'var(--space-1) var(--space-2)',
      borderRadius: 'var(--radius-pill)',
      fontSize: '0.75rem',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      cursor: interactive ? 'pointer' : 'default',
    };

    const variants: Record<string, React.CSSProperties> = {
      default: {
        background: 'var(--color-bg-elevated)',
        color: 'var(--color-text-secondary)',
        border: '1px solid var(--color-border-subtle)',
      },
      gold: {
        background: 'var(--color-gold-dim)',
        color: 'var(--color-gold)',
        border: '1px solid var(--color-gold-dim)',
      },
      success: {
        background: 'var(--color-success-dim)',
        color: 'var(--color-success)',
        border: '1px solid var(--color-success-dim)',
      },
      danger: {
        background: 'var(--color-danger-dim)',
        color: 'var(--color-danger)',
        border: '1px solid var(--color-danger-dim)',
      },
    };

    const whileHover = interactive ? { scale: 1.05 } : undefined;
    const whileTap = interactive ? { scale: 0.95 } : undefined;

    return (
      <motion.span
        ref={ref}
        className={cx('ui-chip', className)}
        style={{ ...baseStyle, ...variants[variant], ...(props.style as React.CSSProperties) }}
        whileHover={whileHover}
        whileTap={whileTap}
        {...props}
      />
    );
  }
);

Chip.displayName = 'Chip';
