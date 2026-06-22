import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cx } from './utils';
import { slideUpVariants } from './motion';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'className'> {
  className?: string;
  glass?: boolean;
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass = false, interactive = false, ...props }, ref) => {
    const baseStyle: React.CSSProperties = {
      background: glass ? 'var(--color-bg-glass)' : 'var(--color-bg-elevated)',
      backdropFilter: glass ? 'var(--blur-md)' : 'none',
      WebkitBackdropFilter: glass ? 'var(--blur-md)' : 'none',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)',
      boxShadow: 'inset 0 0 0 1px var(--color-border-subtle), var(--shadow-sm)',
      color: 'var(--color-text-primary)',
      transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
      cursor: interactive ? 'pointer' : 'default',
    };

    const whileHover = interactive
      ? {
          y: -2,
          boxShadow: 'inset 0 0 0 1px var(--color-gold-dim), var(--shadow-md)',
        }
      : undefined;

    return (
      <motion.div
        ref={ref}
        className={cx('ui-card', className)}
        style={{ ...baseStyle, ...(props.style as React.CSSProperties) }}
        variants={slideUpVariants}
        whileHover={whileHover}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
