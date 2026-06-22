import React from 'react';
import { motion } from 'framer-motion';
import { cx } from './utils';

export interface ProgressRailProps {
  className?: string;
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: string; // e.g. var(--color-gold)
}

export const ProgressRail: React.FC<ProgressRailProps> = ({
  className,
  value,
  max = 100,
  label,
  showValue = false,
  color = 'var(--color-gold)',
}) => {
  const clampedValue = Math.min(Math.max(value, 0), max);
  const percentage = (clampedValue / max) * 100;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
    width: '100%',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary)',
  };

  const trackStyle: React.CSSProperties = {
    width: '100%',
    height: '6px',
    background: 'var(--color-bg-elevated)',
    borderRadius: 'var(--radius-pill)',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)',
  };

  return (
    <div className={cx('ui-progress-rail', className)} style={containerStyle}>
      {(label || showValue) && (
        <div style={headerStyle}>
          {label && <span>{label}</span>}
          {showValue && <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div style={trackStyle}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          style={{
            height: '100%',
            background: color,
            borderRadius: 'var(--radius-pill)',
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      </div>
    </div>
  );
};
