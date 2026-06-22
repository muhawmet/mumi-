import React from 'react';
import { cx } from './utils';
import { motion } from 'framer-motion';

export interface PreviewStageProps {
  className?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  lightDirection?: number; // 0 to 360 degrees
  material?: 'matte' | 'glossy' | 'metallic';
}

export const PreviewStage: React.FC<PreviewStageProps> = ({
  className,
  colorPrimary = '#D4AF37',
  colorSecondary = '#111111',
  lightDirection = 45,
  material = 'matte',
}) => {
  const isGlossy = material === 'glossy';
  const isMetallic = material === 'metallic';

  // Calculate light angles for CSS gradients
  const lightX = Math.cos((lightDirection * Math.PI) / 180) * 100;
  const lightY = Math.sin((lightDirection * Math.PI) / 180) * 100;

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio: '16/9',
    background: 'var(--color-bg-base)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 0 0 1px var(--color-border-subtle)',
  };

  const stageBgStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(circle at ${50 + lightX/4}% ${50 + lightY/4}%, var(--color-bg-elevated), var(--color-bg-base))`,
    opacity: 0.8,
  };

  const objectStyle: React.CSSProperties = {
    position: 'relative',
    width: '40%',
    aspectRatio: '1/1',
    borderRadius: 'var(--radius-full)',
    background: isMetallic 
      ? `linear-gradient(${lightDirection}deg, ${colorPrimary}, ${colorSecondary})`
      : colorPrimary,
    boxShadow: isGlossy 
      ? `inset -10px -10px 20px rgba(0,0,0,0.5), inset 10px 10px 20px rgba(255,255,255,0.4), 0 20px 40px rgba(0,0,0,0.5)`
      : isMetallic
      ? `inset -5px -5px 15px rgba(0,0,0,0.8), inset 5px 5px 15px rgba(255,255,255,0.6), 0 15px 30px rgba(0,0,0,0.6)`
      : `inset -15px -15px 30px rgba(0,0,0,0.3), 0 10px 20px rgba(0,0,0,0.4)`,
  };

  const highlightStyle: React.CSSProperties = {
    position: 'absolute',
    inset: '10%',
    borderRadius: '50%',
    background: `radial-gradient(circle at ${30}%, rgba(255,255,255,${isGlossy ? 0.6 : isMetallic ? 0.4 : 0.1}) 0%, transparent 50%)`,
    pointerEvents: 'none',
  };

  return (
    <div className={cx('ui-preview-stage', className)} style={containerStyle}>
      <div style={stageBgStyle} />
      
      {/* Decorative grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(var(--color-border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        opacity: 0.2,
        transform: 'perspective(500px) rotateX(60deg) scale(2)',
        transformOrigin: 'bottom',
        pointerEvents: 'none',
      }} />

      <motion.div
        style={objectStyle}
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <div style={highlightStyle} />
      </motion.div>
    </div>
  );
};
