import React from 'react';
import type { SurgeryWorld } from '../core/pure';

export const WorldLawPanel: React.FC<{ world: SurgeryWorld }> = ({ world }) => {
  if (!world) return null;

  return (
    <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--s1)', border: '1px solid var(--line)', borderRadius: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
        <strong style={{ fontSize: '1.1rem', color: 'var(--text)' }}>{world.name}</strong>
        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-dim)' }}>{world.id}</span>
      </div>

      {world.render_law && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>RENDER LAW</div>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-soft)',
            background: 'var(--inset)', padding: '0.75rem', borderRadius: '4px',
            maxHeight: '180px', overflowY: 'auto', whiteSpace: 'pre-wrap'
          }}>
            {world.render_law}
          </div>
        </div>
      )}

      {(world.line_grammar || world.lens_grammar || world.light_law) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', padding: '0.75rem', background: 'var(--inset)', borderRadius: '4px' }}>
          {world.line_grammar && (
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)', width: '50px', flexShrink: 0 }}>LINE</span>
              <span style={{ color: 'var(--text)' }}>{world.line_grammar}</span>
            </div>
          )}
          {world.lens_grammar && (
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)', width: '50px', flexShrink: 0 }}>LENS</span>
              <span style={{ color: 'var(--text)' }}>{world.lens_grammar}</span>
            </div>
          )}
          {world.light_law && (
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)', width: '50px', flexShrink: 0 }}>LIGHT</span>
              <span style={{ color: 'var(--text)' }}>{world.light_law}</span>
            </div>
          )}
        </div>
      )}

      {world.motion_cadence && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>MOTION CADENCE</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-soft)', padding: '0.5rem', background: 'var(--inset)', borderRadius: '4px' }}>
            {world.motion_cadence}
          </div>
        </div>
      )}

      {world.palette_lock && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>PALETTE LOCK</div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {(['shadow', 'mid', 'accent', 'highlight'] as const).map((k) => {
              const hex = world.palette_lock![k];
              if (!hex) return null;
              return (
                <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: hex, border: '1px solid var(--line)' }} />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>{hex}</div>
                </div>
              );
            })}
          </div>
          {world.palette_lock.bias && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              {world.palette_lock.bias}
            </div>
          )}
        </div>
      )}

      {world.negative_lock && world.negative_lock.length > 0 && (
        <details style={{ marginBottom: '1rem' }}>
          <summary style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
            NEGATIVE LOCK ({world.negative_lock.length})
          </summary>
          <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-soft)' }}>
            {world.negative_lock.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </details>
      )}

      {world.example_injection && (
        <details>
          <summary style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
            CALIBRATION EXAMPLE
          </summary>
          <div style={{
            marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-soft)',
            background: 'var(--inset)', padding: '0.75rem', borderRadius: '4px', whiteSpace: 'pre-wrap'
          }}>
            {world.example_injection}
          </div>
        </details>
      )}
    </div>
  );
};
