import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { useStudioStore, type Scene } from '../../store/useStudioStore';
import { Panel, Button } from '../../components/Layout/PanelKit';
import { generateBatch } from '../../core/pure';

const PHASE_COLORS: Record<string, string> = {
  Intro: '#4df5a0',
  'Build-up': '#f7c948',
  Climax: '#f54d6b',
  Resolution: '#8b5cf6',
};

export const TimelineStep = () => {
  const state = useStudioStore();
  const { scenes, selectedSceneId, isGenerating, lastError, setField, setScenes, setCurrentStep } = state;
  const selected = scenes.find((s) => s.id === selectedSceneId) || null;

  const onGenerate = () => {
    setField('isGenerating', true);
    setField('lastError', null);
    try {
      const result = generateBatch({
        projectTopic: state.projectTopic,
        projectClass: state.projectClass,
        sceneCount: state.sceneCount,
        cast: state.cast,
        selectedWorldId: state.selectedWorldId,
        selectedPropId: state.selectedPropId,
        selectedRefId: state.selectedRefId,
        selectedPaletteId: state.selectedPaletteId,
        selectedMusicId: state.selectedMusicId,
        imageModel: state.imageModel,
        videoModel: state.videoModel,
      });

      if (result.status === 'BLOCKED') {
        setField('lastError', result.contractGate.findings.map((f) => `${f.code}: ${f.message}`).join(' · '));
        setScenes([]);
      } else {
        const adapted: Scene[] = result.scenes.map((s) => ({
          id: s.id,
          architecture: s.architecture,
          imagePrompt: s.imagePrompt,
          voiceOver: s.voiceOver,
          sunoBrief: s.sunoBrief,
          durationSec: s.durationSec,
          intensity: s.intensity,
          phaseName: s.phaseName,
          handoff: s.handoff,
        }));
        setScenes(adapted);
        setField('selectedSceneId', adapted[0]?.id ?? null);
      }
    } catch (err) {
      setField('lastError', err instanceof Error ? err.message : String(err));
    } finally {
      setField('isGenerating', false);
    }
  };

  const onExportJSON = () => {
    const payload = {
      brief: {
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
    const payload = scenes.map((s) => ({ sceneId: s.id, packets: s.handoff }));
    downloadFile(`${state.projectTopic.replace(/\s+/g, '_')}_handoff_packets.json`, JSON.stringify(payload, null, 2), 'application/json');
  };

  const totalDuration = scenes.reduce((sum, s) => sum + s.durationSec, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1180 }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--gold)', fontWeight: 700 }}>STAGE 3 · TIMELINE</div>
          <h1 style={{ fontSize: 38, margin: '8px 0 4px', fontWeight: 700, letterSpacing: -0.5 }}>
            {scenes.length ? `${scenes.length} sahne · ${totalDuration}s` : 'Üretime hazır'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Pure batch generator: kontrat kapısı + birleşik brief + IMAGE/MOTION/SUNO handoff paketleri.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="ghost" onClick={() => setCurrentStep('recipe')}>← Reçete</Button>
          {scenes.length > 0 && <Button variant="ghost" onClick={onExportJSON}>Export JSON</Button>}
          {scenes.length > 0 && <Button variant="ghost" onClick={onExportHandoff}>Handoff paketleri</Button>}
          <Button onClick={onGenerate} disabled={isGenerating || !state.selectedWorldId}>
            {isGenerating ? 'Üretiliyor…' : scenes.length ? 'Yeniden üret' : 'BATCH ÜRET'}
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
            Brief'i tamamlayıp <strong style={{ color: 'var(--gold)' }}>BATCH ÜRET</strong>'e bas.
            <br />
            Pure generator senin için sahne mimarisi + image prompt + VO + Suno brief + 3 handoff paketi üretecek.
          </div>
        </Panel>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 1.6fr', gap: 24 }}>
          <Panel title={`Sahneler (${scenes.length})`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Sahne {s.id} · {s.phaseName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {s.durationSec}s · intensity {Math.round(s.intensity)}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </Panel>

          <Panel title={selected ? `Sahne ${selected.id} · Detay` : 'Detay'}>
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
                  <DetailRow label="Image prompt" value={selected.imagePrompt} mono block copyable />
                  <DetailRow label="Voice over" value={selected.voiceOver} copyable />
                  <DetailRow label="Suno brief" value={selected.sunoBrief} mono block copyable />
                  <details>
                    <summary style={{ cursor: 'pointer', fontSize: 11, letterSpacing: 2, color: 'var(--gold)', fontWeight: 700 }}>
                      HANDOFF PAKETLERİ (3)
                    </summary>
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(['IMAGE', 'MOTION', 'SUNO'] as const).map((role) => {
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

function downloadFile(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
