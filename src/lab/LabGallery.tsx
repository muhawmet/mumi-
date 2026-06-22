import React, { useState } from 'react';
import { 
  Button, Card, Panel, Chip, Stat, Field, Select, 
  Tabs, Toast, Tooltip, ProgressRail, SwatchStrip, 
  SceneCard, PreviewStage 
} from '../ui';
import { Play, Settings, Plus, Info } from 'lucide-react';

export const LabGallery = () => {
  const [toastId, setToastId] = useState<string | null>(null);

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-12)',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 'var(--space-6)',
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      
      <section style={sectionStyle}>
        <h2>Buttons</h2>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <Button variant="primary">Primary Gold</Button>
          <Button variant="secondary">Secondary Dark</Button>
          <Button variant="ghost">Ghost Plain</Button>
          <Button variant="danger">Danger Zone</Button>
          <Button variant="primary" icon={<Play size={16} />}>With Icon</Button>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Chips & Stats</h2>
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Chip>Default</Chip>
          <Chip variant="gold">Gold Badge</Chip>
          <Chip variant="success">Active</Chip>
          <Chip variant="danger">Error</Chip>
          
          <div style={{ width: 1, height: 40, background: 'var(--color-border-subtle)', margin: '0 var(--space-4)' }} />
          
          <Stat label="Total Volume" value="1,248" trend="up" trendValue="12% vs last week" />
          <Stat label="Pending" value="4" trend="down" trendValue="2% vs last week" />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Inputs & Selection</h2>
        <div style={gridStyle}>
          <Card glass>
            <Field label="Project Name" helperText="Enter a unique name">
              <input className="ui-focus-ring" placeholder="MAMILAS Project" style={{
                background: 'transparent',
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-2) var(--space-3)',
                color: 'var(--color-text-primary)'
              }} />
            </Field>
          </Card>
          
          <Card glass>
            <Field label="Material Preset">
              <Select>
                <option value="1">Quantum Gold (Glossy)</option>
                <option value="2">Titanium Matte</option>
              </Select>
            </Field>
          </Card>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Cards & Panels</h2>
        <div style={gridStyle}>
          <Card interactive>
            <h3>Standard Interactive Card</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
              Hover me to see the subtle glow and lift effect.
            </p>
          </Card>
          
          <Card glass>
            <h3>Glass Card</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
              Uses backdrop-filter for blur effect. Needs content behind to show.
            </p>
          </Card>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Progress & Swatches</h2>
        <div style={gridStyle}>
          <Card>
            <ProgressRail label="Render Progress" value={65} showValue />
          </Card>
          <Card>
            <Field label="Accent Color">
              <SwatchStrip 
                selectedId="1"
                swatches={[
                  { id: '1', color: '#D4AF37', name: 'Gold' },
                  { id: '2', color: '#E74C3C', name: 'Red' },
                  { id: '3', color: '#3498DB', name: 'Blue' },
                  { id: '4', color: '#2ECC71', name: 'Green' },
                ]} 
              />
            </Field>
          </Card>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Specialized: Preview & Scenes</h2>
        <div style={gridStyle}>
          <div>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>PreviewStage (CSS only)</h3>
            <PreviewStage material="glossy" lightDirection={45} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <h3 style={{ marginBottom: 0 }}>SceneCards</h3>
            <SceneCard title="Shot 01: Hero Reveal" duration="00:04:12" active />
            <SceneCard title="Shot 02: Close up" duration="00:02:00" />
            <SceneCard title="Shot 03: Transition" />
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Overlays (Tooltip & Toast)</h2>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <Tooltip content="Settings and preferences" position="top">
            <Button variant="secondary" icon={<Settings size={16} />}>Hover me</Button>
          </Tooltip>
          
          <Button variant="primary" onClick={() => setToastId(Date.now().toString())}>
            Show Toast
          </Button>
        </div>

        {/* Render Toast absolute for demo */}
        {toastId && (
          <div style={{ position: 'fixed', bottom: 'var(--space-6)', right: 'var(--space-6)', zIndex: 100 }}>
            <Toast 
              id={toastId}
              title="System Initialized"
              message="All modules are loaded and ready."
              variant="success"
              onClose={() => setToastId(null)}
            />
          </div>
        )}
      </section>

    </div>
  );
};
