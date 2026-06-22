import React from 'react';
import { Card, Panel, Button, Field, Input, Stat, Chip } from '../../ui';
import { Save, UploadCloud } from 'lucide-react';

export const BriefMockup = () => {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-6)', height: '100%' }}>
      
      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>Project Brief: Quantum Reveal</h2>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Chip variant="gold">High Priority</Chip>
              <Chip>Internal Setup</Chip>
            </div>
          </div>
          <Button variant="primary" icon={<Save size={16} />}>Save Brief</Button>
        </header>

        <Card glass style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Field label="Project Title">
            <Input defaultValue="Quantum Reveal - Fall Campaign" />
          </Field>
          
          <Field label="Client Objectives">
            <textarea 
              className="ui-focus-ring"
              style={{
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                color: 'var(--color-text-primary)',
                minHeight: '120px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              defaultValue="We need a striking reveal of the new Quantum processor. Must look highly technical but elegant. Heavy use of gold and black."
            />
          </Field>

          <Field label="Reference Materials">
            <div style={{
              border: '1px dashed var(--color-border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer'
            }}>
              <UploadCloud size={32} />
              <p>Drag and drop reference files, or click to browse</p>
            </div>
          </Field>
        </Card>
      </div>

      {/* Sidebar Info */}
      <Panel position="right" style={{ width: '320px', background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
        <Card>
          <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 'var(--space-2)' }}>
            Project Metadata
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Stat label="Estimated Frames" value="4,200" />
            <Stat label="Target Render Time" value="14h 30m" trend="down" trendValue="Faster than avg" />
            <Stat label="Team Assigned" value="3 Artists" />
          </div>
        </Card>
        
        <Card>
          <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-4)' }}>Asset Requirements</h3>
          <ul style={{ paddingLeft: 'var(--space-4)', margin: 0, color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li>Processor CAD Model (pending)</li>
            <li>Brand Gold Texture (approved)</li>
            <li>Dust Motes VDB (approved)</li>
          </ul>
        </Card>
      </Panel>
    </div>
  );
};
