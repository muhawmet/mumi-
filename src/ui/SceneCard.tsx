import React from 'react';
import { motion } from 'framer-motion';
import { cx } from './utils';
import { Card } from './Card';
import { slideUpVariants } from './motion';
import { Play } from 'lucide-react';

export interface SceneCardProps {
  className?: string;
  title: string;
  duration?: string;
  thumbnailUrl?: string;
  active?: boolean;
  onClick?: () => void;
}

export const SceneCard: React.FC<SceneCardProps> = ({ className, title, duration, thumbnailUrl, active, onClick }) => {
  return (
    <Card
      className={cx('ui-scene-card', className)}
      interactive
      onClick={onClick}
      style={{
        padding: 'var(--space-3)',
        display: 'flex',
        gap: 'var(--space-4)',
        alignItems: 'center',
        borderColor: active ? 'var(--color-gold)' : 'var(--color-border-subtle)',
        boxShadow: active ? 'inset 0 0 0 1px var(--color-gold), 0 0 12px rgba(212, 175, 55, 0.2)' : undefined,
      }}
    >
      <div
        style={{
          width: 80,
          height: 45,
          borderRadius: 'var(--radius-md)',
          background: thumbnailUrl ? `url(${thumbnailUrl}) center/cover` : 'var(--color-bg-base)',
          border: '1px solid var(--color-border-subtle)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {!thumbnailUrl && <Play size={16} color="var(--color-text-muted)" />}
      </div>
      
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: active ? 'var(--color-gold)' : 'var(--color-text-primary)' }}>
          {title}
        </span>
        {duration && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {duration}
          </span>
        )}
      </div>
    </Card>
  );
};
