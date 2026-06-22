import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cx } from './utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  className?: string;
  tabs: TabItem[];
  activeId?: string;
  onChange?: (id: string) => void;
  variant?: 'underline' | 'pill';
}

export const Tabs: React.FC<TabsProps> = ({ className, tabs, activeId: externalActive, onChange, variant = 'underline' }) => {
  const [internalActive, setInternalActive] = useState(tabs[0]?.id);
  
  const activeId = externalActive !== undefined ? externalActive : internalActive;

  const handleSelect = (id: string) => {
    if (externalActive === undefined) setInternalActive(id);
    if (onChange) onChange(id);
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    gap: variant === 'pill' ? 'var(--space-2)' : 'var(--space-6)',
    borderBottom: variant === 'underline' ? '1px solid var(--color-border-subtle)' : 'none',
    position: 'relative',
    overflowX: 'auto',
  };

  return (
    <div className={cx('ui-tabs ui-no-scrollbar', className)} style={containerStyle}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        
        const tabStyle: React.CSSProperties = {
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: variant === 'pill' ? 'var(--space-2) var(--space-4)' : 'var(--space-3) 0',
          cursor: 'pointer',
          color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          fontWeight: 500,
          background: variant === 'pill' && isActive ? 'var(--color-bg-elevated)' : 'transparent',
          borderRadius: variant === 'pill' ? 'var(--radius-pill)' : '0',
          transition: 'color 0.2s ease',
          whiteSpace: 'nowrap',
          border: 'none',
          outline: 'none',
        };

        return (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id)}
            style={tabStyle}
            className="ui-focus-ring"
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
            
            {isActive && variant === 'underline' && (
              <motion.div
                layoutId="tabs-indicator"
                style={{
                  position: 'absolute',
                  bottom: -1,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'var(--color-gold)',
                  borderRadius: '2px 2px 0 0',
                }}
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
