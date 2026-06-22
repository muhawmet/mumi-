import React, { useState } from 'react';
import SURGERY_DATA from '../core/SURGERY_DATA.json';

export const GoldenViewer: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState('ALL');
  
  const goldenData = SURGERY_DATA.golden || [];
  const agents = ['ALL', ...Array.from(new Set(goldenData.map((g: any) => g.agent)))];

  const filtered = goldenData.filter((g: any) => selectedAgent === 'ALL' || g.agent === selectedAgent);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: '#1a1d24', borderRadius: '8px', color: '#fff', border: '1px solid #333' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Golden Library
        </div>
        <select 
          value={selectedAgent} 
          onChange={(e) => setSelectedAgent(e.target.value)}
          style={{ background: '#333', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}
        >
          {agents.map(a => <option key={String(a)} value={String(a)}>{String(a)}</option>)}
        </select>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto' }}>
        {filtered.map((g: any) => (
          <div key={g.id} style={{ background: '#222', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #f4c27a' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{g.name} <span style={{ fontSize: '10px', background: '#444', padding: '2px 4px', borderRadius: '4px', marginLeft: '8px' }}>{g.agent}</span></div>
            {g.why_gold && <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px' }}>{g.why_gold}</div>}
            <div style={{ fontSize: '12px', fontFamily: 'monospace', background: '#111', padding: '8px', borderRadius: '4px', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
              {g.gold}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
