import React from 'react';
import { motion } from 'framer-motion';
import { cx } from './utils';

export interface Swatch {
  id: string;
  color: string;
  name?: string;
}

export interface SwatchStripProps {
  className?: string;
  swatches: Swatch[];
  selectedId?: string;
  onChange?: (id: string) => void;
}

export const SwatchStrip: React.FC<SwatchStripProps> = ({ className, swatches, selectedId, onChange }) => {
  return (
    <div className={cx('ui-swatch-strip', className)} style={{ display: 'flex', gap: 'var(--space-3)' }}>
      {swatches.map((swatch) => {
        const isSelected = swatch.id === selectedId;
        
        return (
          <button
            key={swatch.id}
            onClick={() => onChange?.(swatch.id)}
            className="ui-focus-ring"
            title={swatch.name}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: swatch.color,
              border: `2px solid ${isSelected ? 'var(--color-text-primary)' : 'transparent'}`,
              boxShadow: isSelected ? '0 0 0 2px var(--color-bg-base), 0 0 10px rgba(255,255,255,0.2)' : 'var(--shadow-sm)',
              cursor: 'pointer',
              padding: 0,
              outline: 'none',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
              transform: isSelected ? 'scale(1.1)' : 'scale(1)',
            }}
          />
        );
      })}
    </div>
  );
};
