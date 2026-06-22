import React, { useState } from 'react';
import { useStudioStore } from '../store/useStudioStore';
import { DATA, deriveProductionPath } from '../core/pure';
import { registerOf } from '../core/brain';
import { directorNotes, type NoteLevel } from '../core/advisor';
import SURGERY_DATA from '../core/SURGERY_DATA.json';
import { Target, ChevronDown, Lock, CircleDashed, Clapperboard, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

/* ============================================================
   RecipeRail — the right rail during Recipe/Scenes/Timeline.
   Replaces the old context-blind Golden Library list with:
     1) a LIVE recipe-lock summary (reads real store state)
     2) the ONE golden 10/10 target that matches the current path
   So the rail tells you what you're building and what to beat.
   ============================================================ */

const REGISTER_LABEL: Record<string, string> = {
  EDU: 'Animasyon / Eğitim', STY: 'Stilize Premium', REAL: 'Foto-gerçek / Reklam',
};

const NOTE_TONE: Record<NoteLevel, { Icon: typeof Info; color: string; bg: string; border: string }> = {
  good: { Icon: CheckCircle2, color: 'var(--green)', bg: 'var(--greensoft)', border: 'rgba(77,245,160,0.3)' },
  info: { Icon: Info, color: 'var(--amber)', bg: 'rgba(245,181,77,0.1)', border: 'rgba(245,181,77,0.3)' },
  warn: { Icon: AlertTriangle, color: 'var(--red)', bg: 'var(--redsoft)', border: 'rgba(255,92,121,0.3)' },
};

export const RecipeRail: React.FC = () => {
  const worldId = useStudioStore((s) => s.selectedWorldId);
  const paletteId = useStudioStore((s) => s.selectedPaletteId);
  const refIds = useStudioStore((s) => s.selectedRefIds);
  const projectClass = useStudioStore((s) => s.projectClass);
  const propId = useStudioStore((s) => s.selectedPropId);
  const rawSource = useStudioStore((s) => s.rawSource);
  const sourceReport = useStudioStore((s) => s.sourceReport);
  const sceneCount = useStudioStore((s) => s.sceneCount);
  const scenes = useStudioStore((s) => s.scenes);
  const [open, setOpen] = useState(true);

  const notes = directorNotes({
    projectClass, selectedWorldId: worldId, selectedPaletteId: paletteId, selectedRefIds: refIds,
    selectedPropId: propId, rawSource, sourceCoverage: sourceReport?.coverage ?? null,
    sceneCount, intensities: scenes.map((s) => s.intensity),
  });

  const world = DATA.worlds.find((w) => w.id === worldId);
  const palette = DATA.palettes.find((p) => p.id === paletteId);
  const refs = (refIds || []).map((id) => DATA.refs.find((r) => r.id === id)).filter(Boolean) as Array<{ id: string; name: string }>;
  const path = deriveProductionPath(projectClass);
  const register = registerOf(path);

  const ready = !!world && !!palette && refs.length > 0;
  const missing = [!world && 'dünya', !palette && 'palet', refs.length === 0 && 'referans'].filter(Boolean).join(' · ');

  const golden = (SURGERY_DATA.golden || []) as Array<{ id: string; name: string; agent: string; path: string; gold: string }>;
  const target =
    golden.find((g) => g.path === path && g.agent === 'image') ||
    golden.find((g) => g.path === path) ||
    golden.find((g) => g.agent === 'image');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── Recipe lock ── */}
      <div style={S.card}>
        <div style={S.head}>
          <span style={S.eyebrow}><Lock size={11} /> REÇETE KİLİDİ</span>
          <span style={{ ...S.pill, ...(ready ? S.pillOk : S.pillWarn) }}>
            {ready ? 'HAZIR' : 'EKSİK'}
          </span>
        </div>

        <Row label="Dünya" value={world?.name} />
        <Row label="Path" value={path.replace(/_/g, ' ')} mono />
        <Row label="Register" value={REGISTER_LABEL[register] || register} />

        <div style={S.row}>
          <span style={S.rowLabel}>Palet</span>
          {palette ? (
            <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
              {(palette.colors || []).slice(0, 4).map((c: string, i: number) => (
                <span key={i} style={{ width: 13, height: 13, borderRadius: 4, background: c, border: '1px solid var(--line2)' }} />
              ))}
            </span>
          ) : <span style={S.rowDim}>—</span>}
        </div>

        <div style={{ ...S.row, borderBottom: 'none', alignItems: 'flex-start' }}>
          <span style={S.rowLabel}>DNA</span>
          <span style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'flex-end', maxWidth: 180 }}>
            {refs.length ? refs.map((r) => (
              <span key={r.id} style={S.dnaChip}>{r.name.split('—')[0].trim().slice(0, 18)}</span>
            )) : <span style={S.rowDim}>referans yok</span>}
          </span>
        </div>

        {!ready && (
          <div style={S.hint}><CircleDashed size={12} /> Eksik: {missing}</div>
        )}
      </div>

      {/* ── Director's notes (live whole-recipe critique) ── */}
      {notes.length > 0 && (
        <div style={S.card}>
          <div style={{ ...S.head, marginBottom: 12 }}>
            <span style={S.eyebrow}><Clapperboard size={11} /> YÖNETMEN</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notes.slice(0, 4).map((n, i) => {
              const tone = NOTE_TONE[n.level];
              const Icon = tone.Icon;
              return (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '8px 10px', borderRadius: 'var(--r-sm)', background: tone.bg, border: `1px solid ${tone.border}` }}>
                  <Icon size={13} color={tone.color} style={{ marginTop: 1, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: tone.color }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-soft)', lineHeight: 1.45, marginTop: 1 }}>{n.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Contextual golden target ── */}
      {target && (
        <div style={S.card}>
          <button onClick={() => setOpen((o) => !o)} style={S.targetHead}>
            <span style={S.eyebrow}><Target size={11} /> 10/10 HEDEF</span>
            <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur)', color: 'var(--text-muted)' }} />
          </button>
          <div style={S.targetName}>{target.name}</div>
          {open && (
            <div style={S.goldBox}>{target.gold}</div>
          )}
          <div style={S.targetFoot}>Bu path'in altın standardı — ajan brief'in bunu yakalamalı.</div>
        </div>
      )}
    </div>
  );
};

const Row: React.FC<{ label: string; value?: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div style={S.row}>
    <span style={S.rowLabel}>{label}</span>
    <span style={{ ...S.rowValue, ...(mono ? { fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 0.2 } : null) }}>
      {value || <span style={S.rowDim}>—</span>}
    </span>
  </div>
);

const S: Record<string, React.CSSProperties> = {
  card: { background: 'var(--panel)', border: '1px solid var(--line2)', borderRadius: 'var(--r-lg)', padding: 16, boxShadow: 'var(--shadow-sm)' },
  head: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  eyebrow: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, letterSpacing: 1.6, color: 'var(--gold)', fontWeight: 800 },
  pill: { fontSize: 9.5, fontWeight: 800, letterSpacing: 0.8, padding: '3px 9px', borderRadius: 999, borderWidth: 1, borderStyle: 'solid' },
  pillOk: { color: 'var(--green)', background: 'var(--greensoft)', borderColor: 'rgba(77,245,160,0.3)' },
  pillWarn: { color: 'var(--amber)', background: 'rgba(245,181,77,0.1)', borderColor: 'rgba(245,181,77,0.3)' },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--line)' },
  rowLabel: { fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.3, flexShrink: 0 },
  rowValue: { fontSize: 12.5, color: 'var(--text)', fontWeight: 600, textAlign: 'right' },
  rowDim: { color: 'var(--text-dim)' },
  dnaChip: { fontSize: 10, fontWeight: 700, color: 'var(--gold)', background: 'var(--goldsoft)', border: '1px solid var(--goldline)', borderRadius: 999, padding: '3px 8px' },
  hint: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11, color: 'var(--amber)' },
  targetHead: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 },
  targetName: { fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '8px 0 8px' },
  goldBox: { fontSize: 11, lineHeight: 1.55, fontFamily: 'var(--font-mono)', color: 'var(--text-soft)', background: 'var(--inset)', border: '1px solid var(--line)', borderLeft: '3px solid var(--gold)', borderRadius: 'var(--r-sm)', padding: 12, maxHeight: 240, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  targetFoot: { fontSize: 10.5, color: 'var(--text-dim)', marginTop: 10, lineHeight: 1.4 },
};
