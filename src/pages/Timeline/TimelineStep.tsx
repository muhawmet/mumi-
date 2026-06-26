import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Check, Edit3, X } from 'lucide-react';
import { useStudioStore, effectivePrompt, type Scene } from '../../store/useStudioStore';
import { quantumScore, proofDoctor, qaScore } from '../../core/proof';
import { Panel, Button, inputStyle, selectStyle } from '../../components/Layout/PanelKit';
import { scenesToCSV, scenesToMarkdown, type ExportContext } from '../../core/exporters';
import { buildCommandJSON } from '../../core/commandExport';
import { buildProductionExport, bundleSlug } from '../../core/productionExport';
import { DATA } from '../../core/pure';
import { dnaDirectives, registerOf, primePacket, engineUsableSec } from '../../core/brain';
import { RecipeThumb } from '../../components/RecipeThumb';
import { Clapperboard } from 'lucide-react';

const PHASE_COLORS: Record<string, string> = {
  Intro: '#4df5a0',
  'Build-up': '#f7c948',
  Climax: '#f54d6b',
  Resolution: '#8b5cf6',
};

export const TimelineStep = () => {
  const state = useStudioStore();
  const { scenes, selectedSceneId, isGenerating, lastError, setField, setCurrentStep, generateScenes, setSceneOverride, togglePersonalMode } = state;
  const selected = scenes.find((s) => s.id === selectedSceneId) || null;
  const onGenerate = generateScenes;
  const exportCtx: ExportContext = {
    projectKind: state.projectKind,
    topic: state.projectTopic,
    projectClass: state.projectClass,
    cast: state.cast,
    worldId: state.selectedWorldId,
    refIds: state.selectedRefIds,
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
        refIds: state.selectedRefIds,
        paletteId: state.selectedPaletteId,
      },
      // Export the user-edited prompt (override wins), matching CSV/MD/Command exports.
      scenes: scenes.map((s) => ({ ...s, imagePrompt: effectivePrompt(s) })),
    };
    downloadFile(`${state.projectTopic.replace(/\s+/g, '_')}_timeline.json`, JSON.stringify(payload, null, 2), 'application/json');
  };

  const onExportCommandJSON = () => {
    if (!scenes.length) return;
    const payload = buildCommandJSON(state);
    downloadFile(`${safeName}_mamilas_command.json`, JSON.stringify(payload, null, 2), 'application/json');
  };

  const onExportProduction = () => {
    if (!scenes.length) return;
    const payload = buildProductionExport(state);
    // Single self-describing file. Drop it in an empty folder; the agent scaffolds the rest.
    downloadFile(`${bundleSlug(state.projectTopic)}_production.json`, JSON.stringify(payload, null, 2), 'application/json');
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

  const [packetCopied, setPacketCopied] = useState<string | null>(null);
  const onCopyPacket = (role: 'image' | 'motion' | 'suno' | 'idea' | 'proof') => {
    const text = state.agentPackets?.[role];
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const labels = {
        image: 'IMAGE',
        motion: 'MOTION',
        suno: 'SUNO',
        idea: 'IDEA',
        proof: 'PROOF'
      };
      setPacketCopied(labels[role]);
      setTimeout(() => setPacketCopied(null), 1500);
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
            STAGE 4 · {state.projectKind === 'design' ? 'DESIGN TESLİMİ' : 'TIMELINE'}
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
            <span style={{ marginLeft: 16, display: 'inline-block', background: 'rgba(247, 201, 72, 0.15)', color: '#f7c948', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
              QUANTUM {quantumScore(state)}/100
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="ghost" onClick={() => setCurrentStep('recipe')}>← Reçete</Button>
          {scenes.length > 0 && <Button variant="ghost" onClick={onExportJSON}>JSON</Button>}
          {scenes.length > 0 && <Button variant="ghost" onClick={onExportCSV}>CSV</Button>}
          {scenes.length > 0 && <Button variant="ghost" onClick={onExportMD}>Markdown</Button>}
          {scenes.length > 0 && <Button variant="ghost" onClick={onExportCommandJSON}>Komut JSON</Button>}
          {scenes.length > 0 && <Button onClick={onExportProduction} title="Tek dosya üretim paketi — boş klasöre koy, görselleri üret, ajan motionu yazsın">⬇ Üretim Paketi</Button>}
          {scenes.length > 0 && <Button variant="ghost" onClick={onExportHandoff}>Handoff</Button>}
          {scenes.length > 0 && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <select
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  if (val === 'brief') onCopyAgentBrief();
                  else onCopyPacket(val as any);
                  e.target.value = '';
                }}
                style={{
                  ...selectStyle,
                  padding: '12px 32px 12px 20px',
                  background: 'transparent',
                  border: '1px solid var(--line3, #ffffff34)',
                  borderRadius: 10,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  appearance: 'none',
                  outline: 'none',
                }}
              >
                <option value="" disabled style={{ background: '#0b0d13', color: 'var(--text-muted)' }}>
                  {packetCopied ? `✓ ${packetCopied} Kopyalandı` : briefCopied ? '✓ Brief Kopyalandı' : 'Ajan Paketleri'}
                </option>
                <option value="brief" style={{ background: '#0b0d13' }}>Ana Ajan Brief</option>
                <option value="image" style={{ background: '#0b0d13' }}>IMAGE Paketi (Görsel)</option>
                <option value="motion" style={{ background: '#0b0d13' }}>MOTION Paketi (Hareket)</option>
                {state.projectKind === 'video' && (
                  <option value="suno" style={{ background: '#0b0d13' }}>SUNO Paketi (Müzik)</option>
                )}
                <option value="idea" style={{ background: '#0b0d13' }}>IDEA Paketi (Fikir)</option>
                <option value="proof" style={{ background: '#0b0d13' }}>PROOF Paketi (Denetim)</option>
              </select>
              <span
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: 'var(--text-muted)',
                  fontSize: 10,
                }}
              >
                ▼
              </span>
            </div>
          )}
          <Button onClick={onGenerate} disabled={isGenerating || !state.selectedWorldId || (state.rawSource.length > 0 && !state.sourceReport?.ok)}>
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '54px 20px', gap: 18 }}>
            <div style={{
              width: 200, height: 116, borderRadius: 'var(--r-lg)', overflow: 'hidden', position: 'relative',
              boxShadow: 'var(--shadow), 0 0 40px -12px var(--goldglow)',
            }}>
              <RecipeThumb radius={20} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)' }}>
                <Clapperboard size={34} color="var(--gold-hi)" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.3 }}>
                {state.projectKind === 'design' ? 'Tasarıma hazır' : 'Sahne yok — motoru çalıştır'}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13.5, lineHeight: 1.6, maxWidth: 420, margin: '8px auto 0' }}>
                {state.projectKind === 'design'
                  ? 'Generator statik tasarım mimarisi + image prompt + IMAGE handoff paketi üretir.'
                  : 'Pure generator sahne mimarisi + image prompt + VO + Suno brief + 3 handoff paketi üretir.'}
              </p>
            </div>
            <Button onClick={onGenerate} disabled={isGenerating || !state.selectedWorldId || (state.rawSource.length > 0 && !state.sourceReport?.ok)}>
              <Clapperboard size={15} /> {state.projectKind === 'design' ? 'TASARIM ÜRET' : 'BATCH ÜRET'} <span className="kbd" style={{ marginLeft: 6 }}>⌘↵</span>
            </Button>
            {!state.selectedWorldId && <div style={{ fontSize: 12, color: 'var(--amber)' }}>Önce Reçete'de bir dünya seç.</div>}
          </div>
        </Panel>
      ) : (
        <>
        {state.projectKind === 'video' && (
          <FilmStrip scenes={scenes} selectedSceneId={selectedSceneId} onPick={(id) => setField('selectedSceneId', id)} />
        )}
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
                        <span style={{ marginLeft: 6, color: qaScore(effectivePrompt(s), { personalMode: state.personalMode }) >= 80 ? 'var(--green, #4df5a0)' : 'var(--gold)' }}>
                          · QA {qaScore(effectivePrompt(s), { personalMode: state.personalMode })}{state.personalMode ? ' P' : ''}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
            
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line2)' }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>BATCH QA & ÜRETİM DEFTERİ</div>
              <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.6 }}>
                <div>İlk sahne QA: <span style={{ color: 'var(--gold)' }}>{qaScore(effectivePrompt(scenes[0]), { personalMode: state.personalMode })}</span></div>
                <div>Ortalama QA: <span style={{ color: 'var(--gold)' }}>{Math.round(scenes.reduce((acc, s) => acc + qaScore(effectivePrompt(s), { personalMode: state.personalMode }), 0) / scenes.length)}</span></div>
                <div>Hazır Sahneler: <span style={{ color: 'var(--green, #4df5a0)' }}>{scenes.filter(s => qaScore(effectivePrompt(s), { personalMode: state.personalMode }) >= 80).length} / {scenes.length}</span></div>
              </div>
              <button
                onClick={togglePersonalMode}
                style={{ marginTop: 10, fontSize: 11, padding: '4px 10px', background: state.personalMode ? 'var(--gold)' : 'transparent', color: state.personalMode ? '#000' : 'var(--text-muted)', border: '1px solid var(--line2)', borderRadius: 4, cursor: 'pointer', letterSpacing: 1 }}
              >
                {state.personalMode ? 'PERSONAL ON — IP guard kapalı' : 'PERSONAL MOD'}
              </button>
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
                  {/* — live preview monitor — */}
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 'var(--r-md)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                    <RecipeThumb radius={14} />
                    <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ width: 7, height: 7, borderRadius: 999, background: PHASE_COLORS[selected.phaseName] || '#fff', boxShadow: `0 0 8px ${PHASE_COLORS[selected.phaseName] || '#fff'}` }} />
                      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: '#fff', textShadow: '0 1px 6px #000' }}>
                        {state.projectKind === 'design' ? `TASARIM ${selected.id}` : `SAHNE ${selected.id} · ${selected.phaseName?.toUpperCase()}`}
                      </span>
                    </div>
                    <div style={{ position: 'absolute', bottom: 10, right: 12, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--gold-hi)', textShadow: '0 1px 6px #000' }}>
                      {state.projectKind === 'design' ? 'STATIC' : `${selected.durationSec}s`}
                    </div>
                  </div>
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
                      <DetailRow label={`Motion prompt (${state.videoModel ?? 'kling_3'} · ${engineUsableSec(state.videoModel ?? 'kling_3')}s pencere)`} value={selected.motionPrompt} mono block copyable />
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
        </>
      )}
    </div>
  );
};

const ImagePromptRow: React.FC<{
  scene: Scene;
  onSave: (v: string) => void;
  onReset: () => void;
}> = ({ scene, onSave, onReset }) => {
  const state = useStudioStore();
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
      
      {/* Kanıt Doktoru Rail */}
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {proofDoctor({
          type: 'scene',
          text: live,
          motionText: scene.motionPrompt,
          sourceCoverage: state.sourceReport?.coverage ?? undefined,
          productionPath: state.projectClass,
          hybridMode: state.projectClass?.includes('HYBRID'),
          hasLockedTextOrLogo: state.projectClass === 'PRODUCT_HERO',
        }).map((f, idx) => (
          <div key={idx} style={{ 
            padding: '6px 10px', 
            borderRadius: 6, 
            fontSize: 11,
            background: f.status === 'PASS' ? 'rgba(77,245,160,.1)' : f.status === 'FAIL' ? 'rgba(245,77,107,.1)' : 'rgba(247,201,72,.1)',
            border: `1px solid ${f.status === 'PASS' ? 'rgba(77,245,160,.3)' : f.status === 'FAIL' ? 'rgba(245,77,107,.3)' : 'rgba(247,201,72,.3)'}`,
            color: f.status === 'PASS' ? '#4df5a0' : f.status === 'FAIL' ? '#f54d6b' : '#f7c948',
          }}>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>
              {f.status} {f.problem && `· ${f.problem}`}
            </div>
            {f.why && <div style={{ opacity: 0.8, marginBottom: 4 }}>{f.why}</div>}
            {f.status === 'FIX' && f.replaceWith && (
              <button
                onClick={() => {
                  onSave(live + ' ' + f.replaceWith);
                }}
                style={{
                  background: 'rgba(0,0,0,.2)',
                  border: '1px solid currentColor',
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: 10,
                  cursor: 'pointer',
                  color: 'inherit',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                }}
              >
                HIZLI UYGULA (FIX)
              </button>
            )}
          </div>
        ))}
      </div>
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

/* — Cinematic film strip: frames sized by duration, phase-coloured,
     with sprocket holes and an intensity bar. The hero of the timeline. — */
const FilmStrip: React.FC<{
  scenes: Scene[];
  selectedSceneId: number | null;
  onPick: (id: number) => void;
}> = ({ scenes, selectedSceneId, onPick }) => {
  if (!scenes.length) return null;
  const total = scenes.reduce((s, x) => s + Math.max(1, x.durationSec), 0);
  const Sprockets = () => (
    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 12, padding: '0 4px' }}>
      {Array.from({ length: 22 }).map((_, i) => (
        <span key={i} style={{ width: 7, height: 5, borderRadius: 1.5, background: 'rgba(0,0,0,0.55)' }} />
      ))}
    </div>
  );
  return (
    <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--line2)', background: 'linear-gradient(180deg,#15151b,#0e0e12)', boxShadow: 'var(--shadow)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 0' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, letterSpacing: 1.8, color: 'var(--gold)', fontWeight: 800 }}>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--gold)', boxShadow: '0 0 8px var(--goldglow)' }} /> FİLM ŞERİDİ
        </span>
        <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{scenes.length} sahne · {total}s</span>
      </div>
      <Sprockets />
      <div style={{ display: 'flex', gap: 3, padding: '0 6px' }}>
        {scenes.map((s) => {
          const active = selectedSceneId === s.id;
          const phase = PHASE_COLORS[s.phaseName] || '#888';
          return (
            <button
              key={s.id}
              onClick={() => onPick(s.id)}
              title={`Sahne ${s.id} · ${s.phaseName} · ${s.durationSec}s`}
              style={{
                flex: Math.max(0.6, s.durationSec), minWidth: 44, height: 72, position: 'relative',
                borderRadius: 8, cursor: 'pointer', overflow: 'hidden',
                border: `1px solid ${active ? 'var(--gold)' : 'var(--line2)'}`,
                background: '#0a0a0d',
                boxShadow: active ? 'var(--ring-gold)' : 'none',
                transition: 'all var(--dur) var(--ease)',
                padding: 0,
              }}
            >
              <span aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: phase }} />
              {/* intensity fill */}
              <span aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${Math.max(8, s.intensity)}%`, background: `linear-gradient(180deg, ${phase}22, ${phase}55)` }} />
              <span style={{ position: 'absolute', top: 8, left: 7, fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-mono)', color: active ? 'var(--gold-hi)' : '#fff' }}>{s.id}</span>
              <span style={{ position: 'absolute', bottom: 5, left: 7, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-soft)' }}>{s.durationSec}s</span>
              {s.duration && !s.duration.ok && (
                <span style={{ position: 'absolute', top: 6, right: 6, fontSize: 9, fontWeight: 800, color: 'var(--red)' }}>!</span>
              )}
            </button>
          );
        })}
      </div>
      <Sprockets />
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
