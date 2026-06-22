import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cx } from './utils';

export interface FieldProps extends Omit<HTMLMotionProps<'div'>, 'className' | 'children'> {
  className?: string;
  label?: string;
  error?: string;
  helperText?: string;
  children?: React.ReactNode;
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, label, error, helperText, children, ...props }, ref) => {
    const baseStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      width: '100%',
    };

    const labelStyle: React.CSSProperties = {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: error ? 'var(--color-danger)' : 'var(--color-text-secondary)',
    };

    const helpStyle: React.CSSProperties = {
      fontSize: '0.75rem',
      color: error ? 'var(--color-danger)' : 'var(--color-text-muted)',
    };

    return (
      <motion.div ref={ref} className={cx('ui-field', className)} style={{ ...baseStyle, ...(props.style as React.CSSProperties) }} {...props}>
        {label && <label style={labelStyle}>{label}</label>}
        {children}
        {(error || helperText) && (
          <span style={helpStyle}>{error || helperText}</span>
        )}
      </motion.div>
    );
  }
);

Field.displayName = 'Field';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  className?: string;
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => {
    const baseStyle: React.CSSProperties = {
      background: 'var(--color-bg-base)',
      border: `1px solid ${hasError ? 'var(--color-danger)' : 'var(--color-border-medium)'}`,
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-2) var(--space-3)',
      color: 'var(--color-text-primary)',
      fontSize: '1rem',
      outline: 'none',
      width: '100%',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      fontFamily: 'inherit',
    };

    return (
      <input
        ref={ref}
        className={cx('ui-focus-ring', className)}
        style={{ ...baseStyle, ...(props.style as React.CSSProperties) }}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
