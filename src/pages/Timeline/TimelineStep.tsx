import React from 'react';
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

  const onExport = () => {
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
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.projectTopic.replace(/\s+/g, '_')}_timeline.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalDuration = scenes.reduce((sum, s) => sum + s.durationSec, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1180 }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--gold)', fontWeight: 700 }}>STAGE 3 · TIMELINE</div>
          <h1 style={{ fontSize: 38, margin: '8px 0 4px', fontWeight: 700 }}>
            {scenes.length ? `${scenes.length} sahne · ${totalDuration}s` : 'Üretime hazır'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Pure batch generator: kontrat kapısı + dünya/referans/palet birleşik brief üretimi.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="ghost" onClick={() => setCurrentStep('recipe')}>← Reçete</Button>
          {scenes.length > 0 && <Button variant="ghost" onClick={onExport}>Export JSON</Button>}
          <Button onClick={onGenerate} disabled={isGenerating || !state.selectedWorldId}>
            {isGenerating ? 'Üretiliyor…' : scenes.length ? 'Yeniden üret' : 'BATCH ÜRET'}
          </Button>
        </div>
      </header>

      {lastError && (
        <div
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
        </div>
      )}

      {scenes.length === 0 ? (
        <Panel>
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            Brief'i tamamlayıp <strong style={{ color: 'var(--gold)' }}>BATCH ÜRET</strong>'e bas.
            <br />
            Pure generator senin için sahne mimarisi + image prompt + VO + Suno brief üretecek.
          </div>
        </Panel>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24 }}>
          <Panel title={`Sahneler (${scenes.length})`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {scenes.map((s) => {
                const active = selectedSceneId === s.id;
                return (
                  <button
                    key={s.id}
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
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title={selected ? `Sahne ${selected.id} · Detay` : 'Detay'}>
            {selected ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontSize: 13, lineHeight: 1.6 }}>
                <DetailRow label="Beat" value={selected.architecture.beat} />
                <DetailRow label="Dominant subject" value={selected.architecture.dominantSubject} />
                <DetailRow label="Event" value={selected.architecture.event} />
                <DetailRow label="Vantage" value={selected.architecture.imageVantage} mono />
                <DetailRow label="Fingerprint" value={selected.architecture.semanticFingerprint} mono />
                <DetailRow label="Image prompt" value={selected.imagePrompt} mono block />
                <DetailRow label="Voice over" value={selected.voiceOver} />
                <DetailRow label="Suno brief" value={selected.sunoBrief} mono block />
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', padding: 20 }}>Sol listeden bir sahne seç.</div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string; mono?: boolean; block?: boolean }> = ({
  label,
  value,
  mono,
  block,
}) => (
  <div>
    <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--gold)', fontWeight: 700, marginBottom: 4 }}>
      {label.toUpperCase()}
    </div>
    <div
      style={{
        color: '#fff',
        fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit',
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
