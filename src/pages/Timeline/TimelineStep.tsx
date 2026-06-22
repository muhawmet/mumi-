import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Check, Edit3, X } from 'lucide-react';
import { useStudioStore, effectivePrompt, type Scene } from '../../store/useStudioStore';
import { Panel, Button, inputStyle } from '../../components/Layout/PanelKit';
import { scenesToCSV, scenesToMarkdown, type ExportContext } from '../../core/exporters';

const PHASE_COLORS: Record<string, string> = {
  Intro: '#4df5a0',
  'Build-up': '#f7c948',
  Climax: '#f54d6b',
  Resolution: '#8b5cf6',
};

export const TimelineStep = () => {
  const state = useStudioStore();
  const { scenes, selectedSceneId, isGenerating, lastError, setField, setCurrentStep, generateScenes, setSceneOverride } = state;
  const selected = scenes.find((s) => s.id === selectedSceneId) || null;
  const onGenerate = generateScenes;
  const exportCtx: ExportContext = {
    projectKind: state.projectKind,
    topic: state.projectTopic,
    projectClass: state.projectClass,
    cast: state.cast,
    worldId: state.selectedWorldId,
    refId: state.selectedRefId,
    paletteId: state.selectedPaletteId,
  };
  const safeName = state.projectTopic.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 60) || 'mamilas';

  const onExportJSON = () => {
    const payload = {
      brief: {
        kind: state.projectKind,
        topic: state.projectTopic,
        class: state.projectClass,
        cast: state.cast,
        worldId: state.selectedWorldId,
        refId: state.selectedRefId,
        paletteId: state.selectedPaletteId,
      },
      scenes,
    };
    downloadFile(`${state.projectTopic.replace(/\s+/g, '_')}_timeline.json`, JSON.stringify(payload, null, 2), 'application/json');
  };

  const onExportHandoff = () => {
    if (!scenes.length) return;
    const payload = scenes.map((s) => ({
      sceneId: s.id,
      packets: state.projectKind === 'design' ? { IMAGE: s.handoff.IMAGE } : s.handoff,
    }));
    downloadFile(`${safeName}_handoff_packets.json`, JSON.stringify(payload, null, 2), 'application/json');
  };

  const [briefCopied, setBriefCopied] = useState(false);
  const onCopyAgentBrief = () => {
    if (!state.agentBrief) return;
    navigator.clipboard.writeText(state.agentBrief).then(() => {
      setBriefCopied(true);
      setTimeout(() => setBriefCopied(false), 1500);
    });
  };

  const onExportCSV = () => {
    if (!scenes.length) return;
    const scenesForExport: Scene[] = scenes.map((s) => ({ ...s, imagePrompt: effectivePrompt(s) }));
    downloadFile(`${safeName}_scenes.csv`, scenesToCSV(scenesForExport, exportCtx), 'text/csv;charset=utf-8');
  };

  const onExportMD = () => {
    if (!scenes.length) return;
    const scenesForExport: Scene[] = scenes.map((s) => ({ ...s, imagePrompt: effectivePrompt(s) }));
    downloadFile(`${safeName}_scenes.md`, scenesToMarkdown(scenesForExport, exportCtx), 'text/markdown;charset=utf-8');
  };

  const totalDuration = scenes.reduce((sum, s) => sum + s.durationSec, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1180 }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--gold)', fontWeight: 700 }}>
            STAGE 3 · {state.projectKind === 'design' ? 'DESIGN TESLİMİ' : 'TIMELINE'}
          </div>
          <h1 style={{ fontSize: 38, margin: '8px 0 4px', fontWeight: 700, letterSpacing: -0.5 }}>
            {scenes.length
              ? state.projectKind === 'design'
                ? `${scenes.length} tasarım kartı`
                : `${scenes.length} sahne · ${totalDuration}s`
              : 'Üretime hazır'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            {state.projectKind === 'design'
              ? 'Statik tasarım teslimi: birleşik brief + production-ready IMAGE handoff paketleri.'
              : 'Pure batch generator: kontrat kapısı + birleşik brief + IMAGE/MOTION/SUNO handoff paketleri.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="ghost" onClick={() => setCurrentStep('recipe')}>← Reçete</Button>
          {scenes.length > 0 && <Button variant="ghost" onClick={onExportJSON}>JSON</Button>}
          {scenes.length > 0 && <Button variant="ghost" onClick={onExportCSV}>CSV</Button>}
          {scenes.length > 0 && <Button variant="ghost" onClick={onExportMD}>Markdown</Button>}
          {scenes.length > 0 && <Button variant="ghost" onClick={onExportHandoff}>Handoff</Button>}
          {scenes.length > 0 && (
            <Button variant="ghost" onClick={onCopyAgentBrief}>
              {briefCopied ? '✓ Kopyalandı' : 'Ajan Brief (Claude/GPT)'}
            </Button>
          )}
          <Button onClick={onGenerate} disabled={isGenerating || !state.selectedWorldId}>
            {isGenerating ? 'Üretiliyor…' : scenes.length ? 'Yeniden üret' : state.projectKind === 'design' ? 'TASARIM ÜRET' : 'BATCH ÜRET'} <span className="kbd" style={{ marginLeft: 8 }}>⌘↵</span>
          </Button>
        </div>
      </header>

      {lastError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            border: '1px solid var(--red, #f54d6b)',
            background: 'rgba(245,77,107,.08)',
            color: '#fdb',
            fontSize: 13,
          }}
        >
          ⚠ {lastError}
        </motion.div>
      )}

      {scenes.length === 0 ? (
        <Panel>
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            Brief'i tamamlayıp <strong style={{ color: 'var(--gold)' }}>{state.projectKind === 'design' ? 'TASARIM ÜRET' : 'BATCH ÜRET'}</strong>'e bas.
            <br />
            {state.projectKind === 'design'
              ? 'Generator statik tasarım mimarisi + image prompt + IMAGE handoff paketi üretecek.'
              : 'Pure generator senin için sahne mimarisi + image prompt + VO + Suno brief + 3 handoff paketi üretecek.'}
          </div>
        </Panel>
      ) : (
        <div className="timeline-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 1.6fr', gap: 24 }}>
          <Panel title={`${state.projectKind === 'design' ? 'Tasarımlar' : 'Sahneler'} (${scenes.length})`}>
            {state.projectKind === 'video' && (
              <PacingArc scenes={scenes} selectedSceneId={selectedSceneId} onPick={(id) => setField('selectedSceneId', id)} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              {scenes.map((s, i) => {
                const active = selectedSceneId === s.id;
                return (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setField('selectedSceneId', s.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: `1px solid ${active ? 'var(--gold)' : 'var(--line2)'}`,
                      background: active ? 'var(--goldsoft)' : 'rgba(0,0,0,.2)',
                      textAlign: 'left',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 36,
                        borderRadius: 4,
                        background: PHASE_COLORS[s.phaseName] || '#888',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {state.projectKind === 'design' ? `Tasarım ${s.id}` : `Sahne ${s.id} · ${s.phaseName}`}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {state.projectKind === 'design' ? 'statik IMAGE teslimi' : `${s.durationSec}s · intensity ${Math.round(s.intensity)}`}
                        {state.projectKind === 'video' && s.duration && !s.duration.ok && (
                          <span style={{ color: 'var(--red)', fontWeight: 700, marginLeft: 6 }}>· BÖLEMEZSİN</span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </Panel>

          <Panel title={selected ? `${state.projectKind === 'design' ? 'Tasarım' : 'Sahne'} ${selected.id} · Detay` : 'Detay'}>
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 18, fontSize: 13, lineHeight: 1.6 }}
                >
                  <DetailRow label="Beat" value={selected.architecture.beat} />
                  <DetailRow label="Dominant subject" value={selected.architecture.dominantSubject} />
                  <DetailRow label="Event" value={selected.architecture.event} />
                  <DetailRow label="Vantage" value={selected.architecture.imageVantage} mono />
                  <DetailRow label="Fingerprint" value={selected.architecture.semanticFingerprint} mono />
                  <ImagePromptRow
                    scene={selected}
                    onSave={(v) => setSceneOverride(selected.id, v)}
                    onReset={() => setSceneOverride(selected.id, null)}
                  />
                  {state.projectKind === 'video' && selected.duration && (
                    <div
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: `1px solid ${selected.duration.ok ? 'var(--line2)' : 'var(--red)'}`,
                        background: selected.duration.ok ? 'rgba(0,0,0,.2)' : 'rgba(255,80,80,.12)',
                        color: selected.duration.ok ? 'var(--text-muted)' : 'var(--red)',
                        fontSize: 12,
                        fontWeight: selected.duration.ok ? 400 : 700,
                      }}
                    >
                      {selected.duration.ok ? '⏱ ' : '⚠ '}{selected.duration.message}
                    </div>
                  )}
                  <DetailRow label={state.projectKind === 'design' ? 'Kaynak metin' : 'Voice over (kaynak metin)'} value={selected.voiceOver} block copyable />
                  {state.projectKind === 'video' && (
                    <>
                      <DetailRow label="Motion prompt (Kling)" value={selected.motionPrompt} mono block copyable />
                      <DetailRow label="Suno brief" value={selected.sunoBrief} mono block copyable />
                    </>
                  )}
                  <details>
                    <summary style={{ cursor: 'pointer', fontSize: 11, letterSpacing: 2, color: 'var(--gold)', fontWeight: 700 }}>
                      HANDOFF PAKETLERİ ({state.projectKind === 'design' ? 1 : 3})
                    </summary>
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(state.projectKind === 'design' ? ['IMAGE'] as const : ['IMAGE', 'MOTION', 'SUNO'] as const).map((role) => {
                        const packet = selected.handoff[role];
                        return (
                          <div
                            key={role}
                            style={{
                              padding: 12,
                              borderRadius: 8,
                              border: '1px solid var(--line2)',
                              background: 'rgba(0,0,0,.25)',
                              fontFamily: "'JetBrains Mono Variable', monospace",
                              fontSize: 11,
                              color: '#cbd5e1',
                            }}
                          >
                            <div style={{ color: 'var(--gold)', fontWeight: 700, marginBottom: 4 }}>
                              {role} · {packet.targetModel.provider} / {packet.targetModel.label}
                            </div>
                            <div>packetId: {packet.packetId}</div>
                            {packet.warnings.length > 0 && (
                              <div style={{ marginTop: 6, color: 'var(--red)' }}>
                                ⚠ {packet.warnings.map((w) => w.code).join(', ')}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </details>
                </motion.div>
              ) : (
                <div style={{ color: 'var(--text-muted)', padding: 20 }}>Sol listeden bir sahne seç.</div>
              )}
            </AnimatePresence>
          </Panel>
        </div>
      )}
    </div>
  );
};

const ImagePromptRow: React.FC<{
  scene: Scene;
  onSave: (v: string) => void;
  onReset: () => void;
}> = ({ scene, onSave, onReset }) => {
  const isOverridden = typeof scene.userImagePrompt === 'string';
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(effectivePrompt(scene));
  const [copied, setCopied] = useState(false);
  const live = effectivePrompt(scene);

  const copy = () => {
    navigator.clipboard.writeText(live).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--gold)', fontWeight: 700 }}>
          IMAGE PROMPT
          {isOverridden && (
            <span style={{ marginLeft: 8, color: 'var(--green, #4df5a0)' }}>· EDITED</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {!editing && (
            <button
              onClick={() => {
                setDraft(live);
                setEditing(true);
              }}
              style={iconBtnStyle()}
            >
              <Edit3 size={11} /> DÜZENLE
            </button>
          )}
          {isOverridden && !editing && (
            <button onClick={onReset} style={iconBtnStyle('var(--red, #f54d6b)')}>
              <X size={11} /> SIFIRLA
            </button>
          )}
          <button onClick={copy} style={iconBtnStyle(copied ? 'var(--green, #4df5a0)' : undefined)}>
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? 'KOPYALANDI' : 'KOPYALA'}
          </button>
        </div>
      </div>
      {editing ? (
        <div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            style={{
              ...inputStyle,
              width: '100%',
              minHeight: 140,
              fontFamily: "'JetBrains Mono Variable', monospace",
              fontSize: 12,
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={() => {
                onSave(draft);
                setEditing(false);
              }}
              style={iconBtnStyle('var(--gold)')}
            >
              KAYDET
            </button>
            <button onClick={() => setEditing(false)} style={iconBtnStyle()}>
              VAZGEÇ
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            color: '#fff',
            fontFamily: "'JetBrains Mono Variable', monospace",
            fontSize: 12,
            background: 'rgba(0,0,0,.3)',
            padding: '10px 12px',
            borderRadius: 8,
            border: `1px solid ${isOverridden ? 'rgba(77,245,160,.35)' : 'var(--line)'}`,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {live}
        </div>
      )}
    </div>
  );
};

function iconBtnStyle(accent?: string): React.CSSProperties {
  return {
    padding: '4px 8px',
    fontSize: 10,
    background: 'transparent',
    border: '1px solid var(--line2)',
    borderRadius: 6,
    color: accent || 'var(--text-muted)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    letterSpacing: 1,
    fontFamily: 'inherit',
  };
}

const DetailRow: React.FC<{ label: string; value: string; mono?: boolean; block?: boolean; copyable?: boolean }> = ({
  label,
  value,
  mono,
  block,
  copyable,
}) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--gold)', fontWeight: 700 }}>
          {label.toUpperCase()}
        </div>
        {copyable && (
          <button
            onClick={copy}
            style={{
              padding: '4px 8px',
              fontSize: 10,
              background: 'transparent',
              border: '1px solid var(--line2)',
              borderRadius: 6,
              color: copied ? 'var(--green, #4df5a0)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              letterSpacing: 1,
            }}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? 'KOPYALANDI' : 'KOPYALA'}
          </button>
        )}
      </div>
      <div
        style={{
          color: '#fff',
          fontFamily: mono ? "'JetBrains Mono Variable', 'JetBrains Mono', monospace" : 'inherit',
          fontSize: mono ? 12 : 13,
          background: block ? 'rgba(0,0,0,.3)' : 'transparent',
          padding: block ? '10px 12px' : 0,
          borderRadius: block ? 8 : 0,
          border: block ? '1px solid var(--line)' : 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {value}
      </div>
    </div>
  );
};

const PacingArc: React.FC<{
  scenes: Scene[];
  selectedSceneId: number | null;
  onPick: (id: number) => void;
}> = ({ scenes, selectedSceneId, onPick }) => {
  if (scenes.length === 0) return null;
  const W = 100;
  const H = 56;
  const padY = 6;
  const range = H - padY * 2;
  const points = scenes.map((s, i) => {
    const x = scenes.length === 1 ? W / 2 : (i / (scenes.length - 1)) * W;
    const y = H - padY - (s.intensity / 100) * range;
    return { x, y, scene: s };
  });
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  const areaPath = `${linePath} L ${W} ${H - padY} L 0 ${H - padY} Z`;
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10,
          letterSpacing: 2,
          color: 'var(--text-muted)',
          marginBottom: 6,
          fontWeight: 700,
        }}
      >
        <span>PACING ARCI</span>
        <span style={{ color: 'var(--gold)' }}>
          {Math.round(Math.min(...scenes.map((s) => s.intensity)))}–{Math.round(Math.max(...scenes.map((s) => s.intensity)))} %
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 70, display: 'block' }}>
        <defs>
          <linearGradient id="pacingFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f7c948" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f7c948" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#pacingFill)" />
        <path d={linePath} fill="none" stroke="#f7c948" strokeWidth="0.8" />
        {points.map((p) => {
          const active = selectedSceneId === p.scene.id;
          return (
            <g key={p.scene.id} style={{ cursor: 'pointer' }} onClick={() => onPick(p.scene.id)}>
              <circle cx={p.x} cy={p.y} r={active ? 2.4 : 1.6} fill={PHASE_COLORS[p.scene.phaseName] || '#fff'} stroke="#0a0a14" strokeWidth="0.3" />
              {active && <circle cx={p.x} cy={p.y} r={3.6} fill="none" stroke="#f7c948" strokeWidth="0.4" />}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

function downloadFile(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
