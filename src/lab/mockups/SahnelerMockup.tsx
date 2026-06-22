import React from 'react';
import { Card, Button, SceneCard, Chip, Tooltip } from '../../ui';
import { Plus, GripVertical, Settings2, PlayCircle } from 'lucide-react';

export const SahnelerMockup = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', height: '100%' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-1)' }}>Scene Manager (Sahneler)</h2>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Chip variant="default">12 Scenes</Chip>
            <Chip variant="gold">Total Duration: 01:24</Chip>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="secondary" icon={<PlayCircle size={16} />}>Preview Sequence</Button>
          <Button variant="primary" icon={<Plus size={16} />}>Add Scene</Button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
        {[
          { id: '1', title: '01: Macro Reveal', duration: '00:08', active: true },
          { id: '2', title: '02: Core Spin', duration: '00:12', active: false },
          { id: '3', title: '03: Data Flow', duration: '00:15', active: false },
          { id: '4', title: '04: Architecture Pullback', duration: '00:09', active: false },
          { id: '5', title: '05: Speed Lines', duration: '00:05', active: false },
          { id: '6', title: '06: Logo Lockup', duration: '00:08', active: false },
        ].map((scene) => (
          <div key={scene.id} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <Tooltip content="Drag to reorder" position="top">
              <div style={{ cursor: 'grab', color: 'var(--color-text-muted)', padding: 'var(--space-2)' }}>
                <GripVertical size={20} />
              </div>
            </Tooltip>
            
            <div style={{ flexGrow: 1, position: 'relative' }}>
              <SceneCard 
                title={scene.title} 
                duration={scene.duration} 
                active={scene.active}
              />
              
              <div style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-2)' }}>
                <Button variant="ghost" size="sm" icon={<Settings2 size={14} />} style={{ padding: 'var(--space-1)', color: 'var(--color-text-secondary)' }} />
              </div>
            </div>
          </div>
        ))}

        <Card interactive style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 'var(--space-2)', 
          borderStyle: 'dashed', 
          borderColor: 'var(--color-border-medium)',
          background: 'transparent'
        }}>
          <div style={{ padding: 'var(--space-3)', background: 'var(--color-bg-elevated)', borderRadius: '50%', color: 'var(--color-text-secondary)' }}>
            <Plus size={24} />
          </div>
          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Create New Scene</span>
        </Card>
      </div>
    </div>
  );
};
