import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cx } from './utils';
import { X, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { slideUpVariants } from './motion';

export interface ToastProps {
  id: string;
  title: string;
  message?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  onClose: (id: string) => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ id, title, message, variant = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const baseStyle: React.CSSProperties = {
    background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-4)',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    gap: 'var(--space-3)',
    width: '320px',
    pointerEvents: 'auto',
    position: 'relative',
    overflow: 'hidden',
  };

  const icons = {
    info: <Info size={20} color="var(--color-info)" />,
    success: <CheckCircle size={20} color="var(--color-success)" />,
    warning: <AlertTriangle size={20} color="var(--color-gold)" />,
    error: <AlertTriangle size={20} color="var(--color-danger)" />,
  };

  return (
    <motion.div
      layout
      variants={slideUpVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={baseStyle}
      className="ui-toast"
    >
      <div style={{ flexShrink: 0 }}>{icons[variant]}</div>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{title}</span>
        {message && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{message}</span>}
      </div>
      <button
        onClick={() => onClose(id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          padding: 'var(--space-1)',
          display: 'flex',
          alignSelf: 'flex-start',
        }}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};
