import React from 'react';
import { Card, Panel, Button, Chip } from '../../ui';
import { Play, Pause, SkipBack, SkipForward, Maximize2 } from 'lucide-react';

export const TimelineMockup = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', height: '100%' }}>
      
      {/* Top Preview Area */}
      <div style={{ flexGrow: 1, display: 'flex', gap: 'var(--space-6)', minHeight: 0 }}>
        
        {/* Viewport */}
        <div style={{ flexGrow: 1, background: '#000', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop" alt="Render Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
          
          {/* Viewport Overlay Controls */}
          <div style={{ position: 'absolute', bottom: 'var(--space-4)', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 'var(--space-2)', background: 'var(--color-bg-glass)', backdropFilter: 'var(--blur-md)', padding: 'var(--space-2)', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border-subtle)' }}>
            <Button variant="ghost" size="sm" icon={<SkipBack size={16} />} style={{ borderRadius: '50%', padding: 'var(--space-2)' }} />
            <Button variant="primary" size="sm" icon={<Play size={16} />} style={{ borderRadius: '50%', padding: 'var(--space-2)' }} />
            <Button variant="ghost" size="sm" icon={<SkipForward size={16} />} style={{ borderRadius: '50%', padding: 'var(--space-2)' }} />
          </div>
          
          <Button variant="ghost" size="sm" icon={<Maximize2 size={16} />} style={{ position: 'absolute', bottom: 'var(--space-4)', right: 'var(--space-4)', background: 'var(--color-bg-glass)', backdropFilter: 'var(--blur-md)' }} />
        </div>
        
        {/* Inspector */}
        <Panel position="right" style={{ width: '280px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>Keyframe Inspector</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Timecode</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>00:00:04:12</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Property</span>
              <span>Camera Z-Depth</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Value</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>14.225</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Easing</span>
              <span>Ease In Out</span>
            </div>
          </div>
        </Panel>
      </div>

      {/* Timeline Editor */}
      <Card style={{ height: '240px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-2) var(--space-4)', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center', background: 'var(--color-bg-surface)' }}>
          <Chip variant="gold">Timeline</Chip>
          <div style={{ flexGrow: 1 }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>100% Zoom</span>
        </div>
        
        <div style={{ flexGrow: 1, position: 'relative', background: 'var(--color-bg-base)', display: 'flex' }}>
          {/* Tracks Headers */}
          <div style={{ width: '200px', borderRight: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-elevated)', display: 'flex', flexDirection: 'column' }}>
            {['Camera Rig', 'Lighting Array', 'Quantum Chip', 'Dust Particles'].map((track, i) => (
              <div key={i} style={{ height: '40px', display: 'flex', alignItems: 'center', padding: '0 var(--space-3)', fontSize: '0.75rem', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border-subtle)' }}>
                {track}
              </div>
            ))}
          </div>
          
          {/* Tracks Area */}
          <div style={{ flexGrow: 1, position: 'relative', overflowX: 'auto', backgroundImage: 'linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)', backgroundSize: '50px 100%' }}>
            
            {/* Playhead */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '150px', width: '2px', background: 'var(--color-gold)', zIndex: 10 }}>
              <div style={{ position: 'absolute', top: 0, left: '-4px', width: '10px', height: '10px', background: 'var(--color-gold)', transform: 'rotate(45deg) translateY(-50%)' }} />
            </div>

            {/* Clips */}
            <div style={{ position: 'absolute', top: '5px', left: '20px', width: '400px', height: '30px', background: 'rgba(212, 175, 55, 0.2)', border: '1px solid var(--color-gold)', borderRadius: 'var(--radius-sm)' }} />
            <div style={{ position: 'absolute', top: '45px', left: '100px', width: '250px', height: '30px', background: 'rgba(52, 152, 219, 0.2)', border: '1px solid #3498DB', borderRadius: 'var(--radius-sm)' }} />
            <div style={{ position: 'absolute', top: '85px', left: '0px', width: '500px', height: '30px', background: 'rgba(46, 204, 113, 0.2)', border: '1px solid #2ECC71', borderRadius: 'var(--radius-sm)' }} />
            
            {/* Keyframes */}
            <div style={{ position: 'absolute', top: '16px', left: '50px', width: '8px', height: '8px', background: 'var(--color-gold)', transform: 'rotate(45deg)' }} />
            <div style={{ position: 'absolute', top: '16px', left: '380px', width: '8px', height: '8px', background: 'var(--color-gold)', transform: 'rotate(45deg)' }} />
          </div>
        </div>
      </Card>
    </div>
  );
};
