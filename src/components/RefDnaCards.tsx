import React, { useState } from 'react';
import type { SurgeryRef } from '../core/pure';

export const RefDnaCards: React.FC<{ refs: SurgeryRef[] }> = ({ refs }) => {
  if (!refs || refs.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
      {refs.map(ref => (
        <RefDnaCard key={ref.id} refData={ref} />
      ))}
    </div>
  );
};

const RefDnaCard: React.FC<{ refData: SurgeryRef }> = ({ refData }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ background: 'var(--inset)', border: '1px solid var(--line)', borderRadius: '4px', padding: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <strong style={{ fontSize: '0.95rem', color: 'var(--text)' }}>{refData.name}</strong>
        <span style={{ fontSize: '0.7rem', background: 'var(--line)', color: 'var(--text-soft)', padding: '0.1rem 0.4rem', borderRadius: '12px' }}>
          {refData.cat}
        </span>
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--text-soft)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {refData.dna && <DnaLine label="DNA" text={refData.dna} expanded={expanded} />}
        {refData.use && <DnaLine label="USE" text={refData.use} expanded={expanded} />}
        {refData.avoid && <DnaLine label="NEVER" text={refData.avoid} expanded={expanded} />}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.75rem',
          cursor: 'pointer', padding: 0, marginTop: '0.5rem', textDecoration: 'underline'
        }}
      >
        {expanded ? 'Daralt' : 'Devamı'}
      </button>
    </div>
  );
};

const DnaLine: React.FC<{ label: string; text: string; expanded: boolean }> = ({ label, text, expanded }) => (
  <div style={{
      display: expanded ? 'block' : '-webkit-box',
      WebkitLineClamp: expanded ? 'unset' : 3,
      WebkitBoxOrient: 'vertical',
      overflow: expanded ? 'visible' : 'hidden'
  }}>
    <span style={{ color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.4rem' }}>{label}:</span>
    <span>{text}</span>
  </div>
);
