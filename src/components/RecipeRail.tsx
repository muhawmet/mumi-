import React, { useState } from 'react';
import { useStudioStore } from '../store/useStudioStore';
import { productionPulse } from '../core/productionPulse';
import { Target, ChevronDown, Lock, CircleDashed, ClipboardCheck, AlertTriangle, Info, CheckCircle2, FileDiff } from 'lucide-react';
import kimAvatar from '../assets/kim-kitsuragi.png'; // We'll use a placeholder or local asset logic

const LOCAL_IP_MODE = false;

export const RecipeRail: React.FC = () => {
  const state = useStudioStore();
  const pulse = productionPulse(state);
  const lastVault = state.vault[0]?.snapshot;

  const [open, setOpen] = useState(true);

  // Compute diff
  const diffs: { label: string; old: string; new: string }[] = [];
  if (lastVault) {
    if (lastVault.selectedWorldId !== state.selectedWorldId) diffs.push({ label: 'World', old: lastVault.selectedWorldId || 'None', new: state.selectedWorldId || 'None' });
    if (lastVault.selectedPaletteId !== state.selectedPaletteId) diffs.push({ label: 'Palette', old: lastVault.selectedPaletteId || 'None', new: state.selectedPaletteId || 'None' });
    if (lastVault.sceneCount !== state.sceneCount) diffs.push({ label: 'Scenes', old: String(lastVault.sceneCount), new: String(state.sceneCount) });
    if (lastVault.leitmotif !== state.leitmotif) diffs.push({ label: 'Leitmotif', old: lastVault.leitmotif || 'None', new: state.leitmotif || 'None' });
    // Ref diff
    const oldRefs = (lastVault.selectedRefIds || []).join(',');
    const newRefs = (state.selectedRefIds || []).join(',');
    if (oldRefs !== newRefs) diffs.push({ label: 'DNA', old: oldRefs || 'None', new: newRefs || 'None' });
  }

  const assetUrl = LOCAL_IP_MODE ? '/assets/kim_kitsuragi.png' : 'https://placehold.co/100x140/2a2a2a/777?text=KIM';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── Kim Kitsuragi Header ── */}
      <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', background: 'var(--s1)', borderBottom: '1px solid var(--line2)' }}>
          <div style={{ width: 64, height: 80, borderRight: '1px solid var(--line2)', background: 'var(--s2)' }}>
            <img src={assetUrl} alt="Kim Kitsuragi" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%) contrast(1.1)', mixBlendMode: 'luminosity' }} />
          </div>
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', font: '800 9px/1 var(--font-mono)', letterSpacing: 1.5 }}>
              <ClipboardCheck size={12} color="var(--gold)" />
              {LOCAL_IP_MODE ? 'KIM KITSURAGI' : 'CASE LEDGER'}
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-dim)', fontStyle: 'italic', lineHeight: 1.4 }}>
              "Let's review the facts. The parameters of this case have changed."
            </div>
          </div>
        </div>
        
        {/* ── Diff ── */}
        <div style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: 'var(--text)', font: '700 10px/1 var(--font-mono)' }}>
            <FileDiff size={12} />
            SEMANTIC DIFF
          </div>
          {diffs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {diffs.map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, borderBottom: '1px solid var(--line)', paddingBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{d.label}</span>
                  <span style={{ color: 'var(--gold)' }}>{d.old} <span style={{ color: 'var(--text-dim)' }}>→</span> {d.new}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>No changes from last snapshot.</div>
          )}
        </div>
      </div>

      {/* ── Pulse Gates ── */}
      <div style={S.card}>
        <div style={S.head}>
          <span style={S.eyebrow}><Lock size={11} /> GATES</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pulse.gates.map((g) => {
            const status = g.score === 100 ? 'PASS' : g.score > 0 ? 'FIX' : 'BLOCKED';
            const color = status === 'PASS' ? 'var(--green)' : status === 'FIX' ? 'var(--amber)' : 'var(--red)';
            return (
              <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, borderBottom: '1px solid var(--line)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{g.label}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>{g.detail}</span>
                  <span style={{ color, fontWeight: 800, fontSize: 9, background: `color-mix(in srgb, ${color} 15%, transparent)`, padding: '2px 6px', borderRadius: 4 }}>{status}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Next Best Move ── */}
      <button onClick={() => state.setCurrentStep(pulse.next.step)} style={{ ...S.card, cursor: 'pointer', textAlign: 'left', border: '1px solid var(--goldline)', background: 'var(--goldsoft)', transition: 'all 0.2s' }}>
        <div style={{ fontSize: 9, color: 'var(--gold)', fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>SONRAKİ EN İYİ HAMLE</div>
        <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{pulse.next.label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{pulse.next.detail}</div>
      </button>

    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  card: { background: 'var(--panel)', border: '1px solid var(--line2)', borderRadius: 'var(--r-lg)', padding: 16, boxShadow: 'var(--shadow-sm)' },
  head: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  eyebrow: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, letterSpacing: 1.6, color: 'var(--gold)', fontWeight: 800 },
};

