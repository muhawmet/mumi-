import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cx } from './utils';

export interface StatProps extends Omit<HTMLMotionProps<'div'>, 'className'> {
  className?: string;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  ({ className, label, value, trend, trendValue, ...props }, ref) => {
    const baseStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-1)',
    };

    const labelStyle: React.CSSProperties = {
      fontSize: '0.875rem',
      color: 'var(--color-text-secondary)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    };

    const valueStyle: React.CSSProperties = {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: 'var(--color-text-primary)',
      fontFamily: 'var(--font-mono)',
    };

    const trendStyle: React.CSSProperties = {
      fontSize: '0.75rem',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
      marginTop: 'var(--space-1)',
      color: trend === 'up' ? 'var(--color-success)' : trend === 'down' ? 'var(--color-danger)' : 'var(--color-text-muted)',
    };

    return (
      <motion.div
        ref={ref}
        className={cx('ui-stat', className)}
        style={{ ...baseStyle, ...(props.style as React.CSSProperties) }}
        {...props}
      >
        <span style={labelStyle}>{label}</span>
        <span style={valueStyle}>{value}</span>
        {trend && trendValue && (
          <span style={trendStyle}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trend === 'neutral' && '→'}
            {trendValue}
          </span>
        )}
      </motion.div>
    );
  }
);

Stat.displayName = 'Stat';
