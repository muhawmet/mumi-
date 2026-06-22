import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top', delay = 0.3 }) => {
  const [isVisible, setIsVisible] = useState(false);

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
  };

  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    background: 'var(--color-bg-elevated)',
    color: 'var(--color-text-primary)',
    padding: 'var(--space-1) var(--space-2)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 50,
    boxShadow: 'var(--shadow-md)',
    border: '1px solid var(--color-border-subtle)',
  };

  const getPositionStyles = (): React.CSSProperties => {
    switch (position) {
      case 'top': return { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 'var(--space-2)' };
      case 'bottom': return { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 'var(--space-2)' };
      case 'left': return { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 'var(--space-2)' };
      case 'right': return { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 'var(--space-2)' };
    }
  };

  return (
    <div
      style={wrapperStyle}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, delay }}
            style={{ ...tooltipStyle, ...getPositionStyles() }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
