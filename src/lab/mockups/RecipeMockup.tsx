import React from 'react';
import { Card, Panel, Button, Field, Select, SwatchStrip, PreviewStage, Chip } from '../../ui';
import { Layers, Wand2 } from 'lucide-react';

export const RecipeMockup = () => {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-6)', height: '100%' }}>
      
      {/* Left Sidebar: Settings */}
      <Panel position="left" style={{ width: '320px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
          <Layers color="var(--color-gold)" />
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Material Recipe</h2>
        </div>

        <Field label="Base Material Preset">
          <Select>
            <option>Quantum Gold</option>
            <option>Anodized Titanium</option>
            <option>Deep Black Matte</option>
          </Select>
        </Field>

        <Field label="Primary Color">
          <SwatchStrip 
            selectedId="1"
            swatches={[
              { id: '1', color: '#D4AF37', name: 'Quantum Gold' },
              { id: '2', color: '#B3C0D1', name: 'Silver' },
              { id: '3', color: '#1A1A1A', name: 'Obsidian' },
            ]}
          />
        </Field>
        
        <Field label="Surface Roughness">
          <input type="range" min="0" max="100" defaultValue="20" style={{ width: '100%', accentColor: 'var(--color-gold)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <span>Glossy</span>
            <span>Matte</span>
          </div>
        </Field>

        <div style={{ flexGrow: 1 }} />
        
        <Button variant="primary" icon={<Wand2 size={16} />} style={{ width: '100%' }}>
          Apply to All Scenes
        </Button>
      </Panel>

      {/* Main Content Area: Preview */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-1)' }}>Adaptive Preview</h2>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>
              Real-time approximation of material settings.
            </p>
          </div>
          <Chip variant="gold">Preview Active</Chip>
        </header>

        <Card style={{ flexGrow: 1, padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', gap: 'var(--space-4)', background: 'var(--color-bg-surface)' }}>
            <Field label="Lighting Setup" style={{ width: '200px' }}>
              <Select>
                <option>Studio Ring Light</option>
                <option>Dramatic Side</option>
                <option>Overhead Spot</option>
              </Select>
            </Field>
          </div>
          
          <div style={{ flexGrow: 1, padding: 'var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-base)' }}>
            <PreviewStage material="glossy" colorPrimary="#D4AF37" lightDirection={45} />
          </div>
        </Card>
      </div>
    </div>
  );
};
