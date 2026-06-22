import React from 'react';
import { cx } from './utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  className?: string;
  hasError?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, children, ...props }, ref) => {
    const wrapperStyle: React.CSSProperties = {
      position: 'relative',
      width: '100%',
    };

    const baseStyle: React.CSSProperties = {
      background: 'var(--color-bg-base)',
      border: `1px solid ${hasError ? 'var(--color-danger)' : 'var(--color-border-medium)'}`,
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-2) var(--space-8) var(--space-2) var(--space-3)',
      color: 'var(--color-text-primary)',
      fontSize: '1rem',
      outline: 'none',
      width: '100%',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      appearance: 'none',
      WebkitAppearance: 'none',
      fontFamily: 'inherit',
      cursor: 'pointer',
    };

    const iconStyle: React.CSSProperties = {
      position: 'absolute',
      right: 'var(--space-3)',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: 'var(--color-text-secondary)',
    };

    return (
      <div style={wrapperStyle}>
        <select
          ref={ref}
          className={cx('ui-focus-ring', className)}
          style={{ ...baseStyle, ...(props.style as React.CSSProperties) }}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={16} style={iconStyle} />
      </div>
    );
  }
);

Select.displayName = 'Select';
