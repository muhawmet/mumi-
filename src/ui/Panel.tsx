import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cx } from './utils';
import { slideUpVariants } from './motion';

export interface PanelProps extends Omit<HTMLMotionProps<'div'>, 'className'> {
  className?: string;
  position?: 'left' | 'right' | 'bottom' | 'center';
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, position = 'center', ...props }, ref) => {
    const baseStyle: React.CSSProperties = {
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border-subtle)',
      borderRadius: position === 'center' ? 'var(--radius-xl)' : '0',
      padding: 'var(--space-6)',
      boxShadow: 'var(--shadow-lg)',
      color: 'var(--color-text-primary)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
    };

    let positionVariants = slideUpVariants;
    if (position === 'left') {
      positionVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
      };
    } else if (position === 'right') {
      positionVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
      };
    }

    return (
      <motion.div
        ref={ref}
        className={cx('ui-panel', className)}
        style={{ ...baseStyle, ...(props.style as React.CSSProperties) }}
        variants={positionVariants}
        {...props}
      />
    );
  }
);

Panel.displayName = 'Panel';
