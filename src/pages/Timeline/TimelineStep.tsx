import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Check, Clapperboard } from 'lucide-react';
import { useStudioStore, commandAuthoringReadiness, effectivePrompt, hasCurrentAgentPrompt, motionGate, type Scene, type ShotApproval, type SceneFrameReceipt } from '../../store/useStudioStore';
import { quantumScore, qaScore } from '../../core/proof';
import { Panel, Button, inputStyle, selectStyle } from '../../components/Layout/PanelKit';
import { stageNumber } from '../../components/Layout/AppLayout';
import { downloadFile, scenesToCSV, scenesToMarkdown, type ExportContext } from '../../core/exporters';
import { buildCommandJSON } from '../../core/commandExport';
import { DATA, paletteColors } from '../../core/pure';
import { dnaDirectives, registerOf, primePacket, engineUsableSec } from '../../core/brain';
import { BeatThumb } from '../../components/BeatThumb';

const PHASE_COLORS: Record<string, string> = {
  Intro: '#93c9a8',
  'Build-up': '#f6c862',
  Climax: '#c9573f',
  Resolution: '#8fb4c9',
};

// Renk-körü güvenliği: film şeridi fazı yalnız renge dayanmasın — kısa kod da taşısın
// (kırmızı Climax 'hata' değil, bir mood/faz; kod bunu ayırır).
const PHASE_CODE: Record<string, string> = {
  Intro: 'INT',
  'Build-up': 'BLD',
  Climax: 'CLX',
  Resolution: 'RES',
};

export const TimelineStep = () => {
  const state = useStudioStore();
  const {
    scenes, selectedSceneId, isGenerating, lastError, packEvidenceNotice, setField, setCurrentStep, generateScenes, togglePersonalMode,
    shotApprovals, approveShot, rejectShot, clearShotApproval, importAgentArtifact, currentCommandId,
    importFrame, setFrameVerdict, clearFrame,
  } = state;
  const selected = scenes.find((s) => s.id === selectedSceneId) || null;
  const commandId = currentCommandId();
  const promptSourceId = state.currentPromptSourceCommandId();
  const selectedApproval = selected ? shotApprovals[selected.id] : undefined;
  const commandReadiness = commandAuthoringReadiness(state);

  const thumbColors = paletteColors(
    DATA.palettes.find((p) => p.id === state.selectedPaletteId),
    DATA.worlds.find((w) => w.id === state.selectedWorldId),
  );
  const onGenerate = generateScenes;
  const exportCtx: ExportContext = {
    topic: state.projectTopic,
    projectClass: state.projectClass,
    cast: state.cast,
    worldId: state.selectedWorldId,
    refIds: state.selectedRefIds,
    paletteId: state.selectedPaletteId,
  };
  const safeName = state.projectTopic.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 60) || 'mamilas';

  const onExportJSON = () => {
    if (!scenes.length) return;
    const payload = {
      brief: {
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
    if (!commandReadiness.ready) return;
    const payload = buildCommandJSON(state);
    downloadFile(`${safeName}_mamilas_command.json`, JSON.stringify(payload, null, 2), 'application/json');
  };

  const onExportHandoff = () => {
    if (!scenes.length) return;
    const payload = scenes.map((s) => ({
      sceneId: s.id,
      packets: s.handoff,
    }));
    downloadFile(`${safeName}_handoff_packets.json`, JSON.stringify(payload, null, 2), 'application/json');
  };

  // MACRO 6 — taşınabilir project pack: karar + world packet + onaylar + prompt/frame receipt'leri
  // + hash manifest. Windows'ta export → Mac'te import → aynı proje. LocalStorage yalnız cache.
  const onExportProjectPack = () => {
    downloadFile(`${safeName}.mamilas-project.json`, state.exportProjectPack(), 'application/json');
  };
  const onExportCloseout = () => {
    if (!scenes.length) return;
    downloadFile(`${safeName}.mamilas-studio-closeout.json`, state.exportCloseout(), 'application/json');
  };
  const onImportProjectPack = (file: File) => {
    file.text().then((json) => state.importProjectPack(json));
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
            STAGE {stageNumber('timeline', { phase0PresetId: state.phase0PresetId, currentStep: 'timeline' })} · TIMELINE
          </div>
          <h1 style={{ fontSize: 38, margin: '8px 0 4px', fontWeight: 500, letterSpacing: '0.005em', fontFamily: 'var(--font-serif)' }}>
            {scenes.length
              ? `${scenes.length} sahne · ${totalDuration}s`
              : 'Motor bekliyor'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Pure batch generator: kontrat kapısı + birleşik brief + IMAGE/MOTION/SUNO handoff paketleri.
            <span style={{ marginLeft: 16, display: 'inline-block', background: 'rgba(247, 201, 72, 0.15)', color: '#f6c862', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
              QUANTUM {quantumScore(state)}/100
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {/* Tek primary (solid altın) = ilerleme aksiyonu; ikincil işler ghost.
              İki eş-ağırlık primary çakışması kaldırıldı. lang="en": Director's/Cabinet/Brief İ almasın. */}
          <Button variant="ghost" onClick={() => setCurrentStep('recipe')}>← Reçete</Button>
          {scenes.length > 0 && (
            <Button variant="solid" onClick={() => setCurrentStep('qa')}>
              <span lang="en">Director's Cabinet</span> →
            </Button>
          )}
          <Button onClick={onGenerate} disabled={isGenerating || !state.selectedWorldId}
            title={state.rawSource.length > 0 && !state.sourceReport?.ok ? `⚠ Bütünlük %${state.sourceReport?.coverage ?? 0} — düzenlediğin storyboard kaynaktan sapıyor; VO senin metnini birebir taşır. Yine de derleyebilirsin.` : undefined}>
            {isGenerating ? 'DERLENİYOR…' : scenes.length ? 'PAKETİ YENİDEN DERLE' : 'AJAN PAKETİNİ DERLE'} <span className="kbd" style={{ marginLeft: 8 }}>⌘↵</span>
          </Button>
        </div>
      </header>

      {lastError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '12px 16px',
            borderRadius: 0,
            border: '1px solid var(--m2-danger)',
            background: 'transparent',
            color: 'var(--m2-danger)',
            fontFamily: 'var(--m2-font-mono)',
            fontSize: 13,
          }}
        >
          ⚠ {lastError}
        </motion.div>
      )}

      {/* P6 — import edilen pack'te doğrulanamayan (format-only) kanıt uyarısı. Import kullanıcıyı
          Timeline'a taşıdığı için bildirim BURADA gösterilir (Dashboard'da kalıp görünmez olmasın).
          HATA değil: import başarılı, ama bu hash'lerin kaynağı pakette yok → "onaylı gerçek kanıt"
          sayılamaz. Karar değişip storyboard STALE olunca (clearGeneration) uyarı da düşer. */}
      {packEvidenceNotice && packEvidenceNotice.length > 0 && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '12px 16px',
            border: '1px solid var(--m2-line-strong)',
            background: 'rgba(214,158,46,0.08)',
            color: 'var(--text-soft)',
            fontFamily: 'var(--m2-font-mono)',
            fontSize: 13,
          }}
        >
          <strong style={{ color: 'var(--m2-amber)' }}>⚠ Doğrulanamayan kanıt:</strong>{' '}
          Bu paketteki {packEvidenceNotice.length} hash yalnızca biçim olarak geçerli — kaynağı
          pakette taşınmadığı için içeriği doğrulanamaz (format-only). Onaylı gerçek kare/kanıt
          sayılmaz; gerçek görseli bu cihazda yeniden yükleyip onaylayın.
        </motion.div>
      )}

      <div className="studio-verdict-band timeline-verdict-band ml-v3-parchment">
        <div>
          <span className="studio-verdict-kicker">PRODUCTION READ</span>
          <strong>{scenes.length ? `${scenes.length} teslim parçası kilitleniyor.` : 'Önce packet compile.'}</strong>
          <p>
            Timeline karar yüzeyi: sahne seç, pacing kanıtını oku, sonra export al. Ham paket düğmeleri en sonda kalır.
          </p>
        </div>
      </div>

      {scenes.length === 0 ? (
        <Panel>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '54px 20px', gap: 18 }}>
            <div style={{
              width: 200, height: 116, borderRadius: 0, overflow: 'hidden', position: 'relative',
              border: '1px solid var(--m2-line-strong)'
            }}>
              <BeatThumb seed="timeline-empty" colors={thumbColors} height={116} width={200} radius={20} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)' }}>
                <Clapperboard size={34} color="var(--gold-hi)" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.3 }}>
                Sahne yok — motoru çalıştır
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13.5, lineHeight: 1.6, maxWidth: 420, margin: '8px auto 0' }}>
                Pure generator sahne mimarisi + image prompt + VO + Suno brief + 3 handoff paketi üretir.
              </p>
            </div>
            <Button onClick={onGenerate} disabled={isGenerating || !state.selectedWorldId}
            title={state.rawSource.length > 0 && !state.sourceReport?.ok ? `⚠ Bütünlük %${state.sourceReport?.coverage ?? 0} — düzenlediğin storyboard kaynaktan sapıyor; VO senin metnini birebir taşır. Yine de derleyebilirsin.` : undefined}>
              <Clapperboard size={15} /> {isGenerating ? 'DERLENİYOR…' : scenes.length ? 'PAKETİ YENİDEN DERLE' : 'AJAN PAKETİNİ DERLE'} <span className="kbd" style={{ marginLeft: 6 }}>⌘↵</span>
            </Button>
            {!state.selectedWorldId && <div style={{ fontSize: 12, color: 'var(--amber)' }}>Önce Reçete'de bir dünya seç.</div>}
          </div>
        </Panel>
      ) : (
        <>
        <FilmStrip scenes={scenes} selectedSceneId={selectedSceneId} onPick={(id) => setField('selectedSceneId', id)} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--m2-line)', background: 'rgba(255,255,255,0.02)' }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.4, color: 'var(--m2-muted)', fontFamily: 'var(--m2-font-mono)', marginRight: 4 }}>EXPORT</span>
          <Button variant="ghost" onClick={onExportJSON}>JSON</Button>
          <Button variant="ghost" onClick={onExportCSV}>CSV</Button>
          <Button variant="ghost" onClick={onExportMD}>Markdown</Button>
          <Button
            variant="ghost"
            onClick={onExportCommandJSON}
            disabled={!commandReadiness.ready}
            title={commandReadiness.ready ? 'Canonical MAMILAS command indir' : `Komut kapalı: ${commandReadiness.reason}`}
          >
            Komut JSON
          </Button>
          <Button variant="ghost" onClick={onExportHandoff}>Handoff</Button>
          {/* MACRO 4: Üretim Paketi düğmesi BURADAN KALDIRILDI. Tek gate'li export yolu QA
              (Director's Cabinet) — readiness kapısı orada yaşar. İki export yolu (biri gate'siz)
              Cabinet'in blokladığı paketi bir adım geriden indirtiyordu. Tek yol, tek kapı. */}
          <span style={{ width: 1, height: 20, background: 'var(--m2-line)', margin: '0 2px' }} />
          {/* MACRO 6 — taşınabilir project pack (Windows↔Mac↔Claude/Codex). */}
          <Button onClick={onExportProjectPack} title="Taşınabilir proje paketi — karar + world packet + onaylar + prompt/frame receipt'leri + hash manifest. Windows'ta export, Mac'te import.">⬇ Proje Paketi</Button>
          <Button variant="ghost" onClick={onExportCloseout} disabled={!scenes.length} title="Current karar → ajan prompt → gerçek frame zincirinin stale-safe kapanış receipt’i.">Kapanış Receipt</Button>
          <label className="ml-file-picker" style={{ display: 'inline-block' }}>
            <input className="ml-file-input" aria-label="Proje paketi içe al" type="file" accept=".json,application/json"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onImportProjectPack(f); e.currentTarget.value = ''; }} />
            <span className="ml-file-picker-face" style={{ display: 'inline-flex', alignItems: 'center', padding: '7px 12px', border: '1px solid var(--m2-line-strong)', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--m2-muted)' }}>⬆ Proje İçe Al</span>
          </label>
          {!commandReadiness.ready && (
            <span role="status" style={{ flexBasis: '100%', fontSize: 11, color: 'var(--m2-amber)', lineHeight: 1.45 }}>
              Komut export kapalı — {commandReadiness.reason}
            </span>
          )}
        </div>
        <div className="timeline-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 1.6fr', gap: 24 }}>
          <Panel title={`Sahneler (${scenes.length})`}>
            <PacingArc scenes={scenes} selectedSceneId={selectedSceneId} onPick={(id) => setField('selectedSceneId', id)} />
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
                      borderRadius: 0,
                      border: `1px solid ${active ? 'var(--m2-paper)' : 'var(--m2-line-strong)'}`,
                      background: active ? 'var(--m2-paper)' : 'transparent',
                      textAlign: 'left',
                      color: active ? 'var(--m2-ink)' : 'var(--m2-muted)',
                      fontFamily: 'var(--m2-font-mono)',
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
                        {`Sahne ${s.id} · ${s.phaseName}`}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {`${s.durationSec}s · intensity ${Math.round(s.intensity)}`}
                        {s.duration && !s.duration.ok && (
                          <span style={{ color: 'var(--red)', fontWeight: 700, marginLeft: 6 }}>· BÖLEMEZSİN</span>
                        )}
                        <span style={{ marginLeft: 6, color: qaScore(effectivePrompt(s), { personalMode: state.personalMode }) >= 80 ? 'var(--green, #93c9a8)' : 'var(--gold)' }}>
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
                <div>Hazır Sahneler: <span style={{ color: 'var(--green, #93c9a8)' }}>{scenes.filter(s => qaScore(effectivePrompt(s), { personalMode: state.personalMode }) >= 80).length} / {scenes.length}</span></div>
              </div>
              <button
                onClick={togglePersonalMode}
                style={{ marginTop: 10, fontSize: 11, padding: '4px 10px', background: state.personalMode ? 'var(--gold)' : 'transparent', color: state.personalMode ? '#000' : 'var(--text-muted)', border: '1px solid var(--line2)', borderRadius: 4, cursor: 'pointer', letterSpacing: 1 }}
              >
                {state.personalMode ? 'KİŞİSEL MOD AÇIK — IP guard kapalı' : 'KİŞİSEL MOD'}
              </button>
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
                  {/* — live preview monitor — */}
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 'var(--r-md)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                    <BeatThumb seed={`scene-${selected.id}`} colors={thumbColors} height={200} width="100%" radius={14} />
                    <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ width: 7, height: 7, borderRadius: 999, background: PHASE_COLORS[selected.phaseName] || '#fff', boxShadow: `0 0 8px ${PHASE_COLORS[selected.phaseName] || '#fff'}` }} />
                      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: '#fff', textShadow: '0 1px 6px #000' }}>
                        {`SAHNE ${selected.id} · ${selected.phaseName?.toUpperCase()}`}
                      </span>
                    </div>
                    <div style={{ position: 'absolute', bottom: 10, right: 12, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--gold-hi)', textShadow: '0 1px 6px #000' }}>
                      {`${selected.durationSec}s`}
                    </div>
                  </div>
                  <div style={{ border: '1px solid var(--m2-line)', borderRadius: 8, padding: '10px 12px', background: 'rgba(0,0,0,0.25)' }}>
                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.6, color: 'var(--m2-muted)', fontFamily: 'var(--m2-font-mono)', marginBottom: 8 }}>TEKNİK KANIT · EN</div>
                    <DetailRow label="Exact source beat" value={selected.architecture.exactSourceBeat} />
                    <DetailRow label="Beat" value={selected.architecture.beat} />
                    <DetailRow label="Yorum" value={`${selected.architecture.semanticInterpretationStatus} — dominant özne/olay ajanın interpretation receipt'inde`} />
                    <DetailRow label="Vantage" value={selected.architecture.imageVantage} mono />
                    <DetailRow label="Fingerprint" value={selected.architecture.semanticFingerprint} mono />
                  </div>

                  {selected.duration && (
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
                  <DetailRow label='Voice over (kaynak metin)' value={selected.voiceOver} block copyable />
                  <>
                    <div style={{ marginTop: 2, marginBottom: 2 }}>
                        <div style={{ fontSize: 10, letterSpacing: 1.6, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>
                          EKRAN METNİ (AE)
                          <span style={{ marginLeft: 6, fontSize: 10, color: selected.onScreenText ? 'var(--gold)' : 'var(--text-muted)', fontWeight: 400 }}>
                            {selected.phaseName}
                          </span>
                        </div>
                        {selected.onScreenText ? (
                          <div style={{ fontSize: 13, color: '#fff', fontWeight: 700, padding: '6px 10px', borderRadius: 6, background: 'rgba(255,200,80,.10)', border: '1px solid rgba(255,200,80,.25)', display: 'inline-block' }}>
                            "{selected.onScreenText}"
                            <span style={{ marginLeft: 8, fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 400 }}>
                              {selected.phaseName === 'Resolution' ? '· Merkez · TITLE' : selected.phaseName === 'Climax' ? '· Alt-merkez · BOLD' : '· Alt-merkez · LABEL'}
                            </span>
                          </div>
                        ) : (
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            NO_TEXT — {selected.phaseName === 'Build-up' ? 'mekanizma görsel konuşuyor' : 'metin yok'}
                          </div>
                        )}
                      </div>

                    {/* MACRO 3/4 — Hash-valid author→jury bundle import + Mami shot onayı.
                        Site prompt YAZMAZ ve düz prompt kabul etmez. */}
                    <ShotAuthoringPanel
                      key={`auth-${selected.id}`}
                      sceneId={selected.id}
                      hasAgentPrompt={hasCurrentAgentPrompt(selected, promptSourceId)}
                      agentPromptPreview={selected.userImagePrompt ?? ''}
                      approval={selectedApproval}
                      commandId={commandId}
                      onImport={(text) => importAgentArtifact(selected.id, text)}
                      onApprove={() => approveShot(selected.id)}
                      onReject={() => rejectShot(selected.id)}
                      onClearApproval={() => clearShotApproval(selected.id)}
                    />

                    {/* MACRO 5 — Manuel Frame + Motion kapısı. Mami harici araçta ürettiği frame'i
                        yükler; site SHA-256 + boyut ölçer; Mami APPROVE verince motion açılır. */}
                    <FrameGatePanel
                      key={`frame-${selected.id}`}
                      scene={selected}
                      commandId={commandId}
                      promptSourceId={promptSourceId}
                      shotApproval={selectedApproval}
                      onImportFrame={(file) => { void importFrame(selected.id, file); }}
                      onVerdict={(v) => setFrameVerdict(selected.id, v)}
                      onClearFrame={() => clearFrame(selected.id)}
                    />
                  </>
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

/**
 * MACRO 3/4 — Shot authoring: hash-valid Image Author→Jury bundle geri-alımı + Mami shot onayı.
 *
 * Site prompt YAZMAZ. Runtime author+jury artifact'lerini üretir; Mami bundle JSON'u buraya
 * yapıştırır. Store protocol/decision/storyboard/input/content hash zincirini doğrulamadan prompt
 * receipt veya shot approval açılmaz.
 * Karar değişince (yeni commandId) onay STALE görünür.
 */
const ShotAuthoringPanel: React.FC<{
  sceneId: number;
  hasAgentPrompt: boolean;
  agentPromptPreview: string;
  approval: ShotApproval | undefined;
  commandId: string;
  onImport: (text: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onClearApproval: () => void;
}> = ({ hasAgentPrompt, agentPromptPreview, approval, commandId, onImport, onApprove, onReject, onClearApproval }) => {
  const [draft, setDraft] = useState('');
  const stale = approval != null && approval.commandId !== commandId;
  const verdictColor = !approval ? 'var(--m2-muted)' : approval.verdict === 'APPROVED' ? '#93c9a8' : '#f5546b';

  return (
    <div style={{ border: '1px solid var(--m2-line)', borderRadius: 8, padding: '12px 14px', background: 'rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.6, color: 'var(--m2-muted)', fontFamily: 'var(--m2-font-mono)' }}>
        AJAN FINAL PROMPT · SHOT ONAYI
      </div>

      {/* Ajan prompt geri-alım */}
      {agentPromptPreview ? (
        <div style={{ fontSize: 12.5, color: '#fff', lineHeight: 1.55, background: 'rgba(147,201,168,.06)', border: '1px solid rgba(147,201,168,.25)', borderRadius: 6, padding: '8px 10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.4, color: '#93c9a8', display: 'block', marginBottom: 4 }}>✎ AJAN-YAZIMI PROMPT (site brief'i değil)</span>
          {agentPromptPreview}
          <div style={{ marginTop: 8 }}>
            <Button variant="ghost" onClick={() => { onImport(''); setDraft(''); }}>Geri-alımı temizle</Button>
          </div>
        </div>
      ) : (
        <>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Image Author + Image Jury artifact bundle JSON'unu buraya yapıştır. Düz prompt kabul edilmez."
            style={{ ...inputStyle, minHeight: 90, resize: 'vertical', fontSize: 12.5, lineHeight: 1.5, fontFamily: 'var(--m2-font-mono)' }}
          />
          <div>
            <Button onClick={() => { if (draft.trim()) onImport(draft.trim()); }} disabled={!draft.trim()}>
              Artifact bundle'ını doğrula
            </Button>
          </div>
        </>
      )}

      {/* Mami shot onayı */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', borderTop: '1px solid var(--m2-line)', paddingTop: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: verdictColor, fontFamily: 'var(--m2-font-mono)' }}>
          {!approval ? 'ONAY BEKLİYOR' : approval.verdict === 'APPROVED' ? (stale ? 'ONAY BAYAT — karar değişti' : '✓ MAMİ ONAYLADI') : '✗ REDDEDİLDİ'}
        </span>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <Button onClick={onApprove} disabled={!hasAgentPrompt}>Onayla</Button>
          <Button variant="ghost" onClick={onReject}>Reddet</Button>
          {approval && <Button variant="ghost" onClick={onClearApproval}>Onayı sıfırla</Button>}
        </div>
      </div>
      {!hasAgentPrompt && !approval && (
        <div style={{ fontSize: 11, color: 'var(--m2-muted)', fontStyle: 'italic' }}>
          Motion, yalnız Mami onayladığı kareden sonra açılır. Önce hash-valid author+jury bundle'ını geri al, sonra shot'ı onayla.
        </div>
      )}
    </div>
  );
};

/**
 * MACRO 5 — Manuel Frame + Motion kapısı. Mami harici araçta ürettiği frame'i yükler; site
 * SHA-256 + boyut/aspect ölçer ve hangi karar/prompt'a bağlı olduğunu receipt'e yazar. Motion
 * brief YALNIZ Mami APPROVE ettiği current frame ile açılır — prompt'a değil GERÇEK piksele bağlı.
 */
const FrameGatePanel: React.FC<{
  scene: Scene;
  commandId: string;
  promptSourceId: string;
  shotApproval: ShotApproval | undefined;
  onImportFrame: (file: File) => void;
  onVerdict: (verdict: SceneFrameReceipt['verdict']) => void;
  onClearFrame: () => void;
}> = ({ scene, commandId, promptSourceId, shotApproval, onImportFrame, onVerdict, onClearFrame }) => {
  const f = scene.frameReceipt;
  const gate = motionGate(scene, commandId, promptSourceId, shotApproval);
  const storyboardApproved = shotApproval?.verdict === 'APPROVED' && shotApproval.commandId === commandId;
  const stale = f != null && (
    f.fromCommandId !== commandId
    || !hasCurrentAgentPrompt(scene, promptSourceId)
    || f.fromPromptHash !== scene.promptReceipt?.promptHash
  );

  return (
    <div style={{ border: `1px solid ${gate.open ? 'rgba(147,201,168,.4)' : 'var(--m2-line)'}`, borderRadius: 8, padding: '12px 14px', background: 'rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.6, color: 'var(--m2-muted)', fontFamily: 'var(--m2-font-mono)' }}>
        GERÇEK FRAME · MOTION KAPISI
      </div>

      {f ? (
        <>
          <div style={{ fontSize: 11.5, color: '#fff', fontFamily: 'var(--m2-font-mono)', lineHeight: 1.6, background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '8px 10px' }}>
            <div>📄 {f.fileName} · {(f.byteSize / 1024).toFixed(0)} KB</div>
            <div>SHA-256: <span style={{ color: 'var(--gold)' }}>{f.frameHash.slice(0, 24)}…</span></div>
            <div>{f.width}×{f.height} · aspect {f.aspect}{f.aspect === 1.778 ? ' (16:9)' : ''}</div>
            {stale && <div style={{ color: '#f5546b' }}>⚠ Frame eski karara bağlı — karar değişti, yeniden üret.</div>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: gate.open ? '#93c9a8' : 'var(--m2-amber)', fontFamily: 'var(--m2-font-mono)' }}>
              {f.verdict === 'PENDING' ? 'HÜKÜM BEKLİYOR'
                : f.verdict === 'APPROVE' ? (gate.open ? '✓ ONAYLI — MOTION AÇIK' : 'ONAYLI (stale)')
                : f.verdict === 'PROJECT_ONLY_ACCEPT' ? 'YALNIZ PROJEYE ALINDI — gerçek kareyi yeniden yükle (motion kapalı)'
                : f.verdict}
            </span>
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
              <Button onClick={() => onVerdict('APPROVE')}>Onayla</Button>
              <Button variant="ghost" onClick={() => onVerdict('REGENERATE')}>Yeniden üret</Button>
              <Button variant="ghost" onClick={() => onVerdict('PROJECT_ONLY_ACCEPT')}>Yalnız projeye al</Button>
              <Button variant="ghost" onClick={onClearFrame}>Kaldır</Button>
            </div>
          </div>
        </>
      ) : !storyboardApproved ? (
        <div style={{ fontSize: 12, color: 'var(--m2-amber)', lineHeight: 1.5 }}>
          Önce yukarıdaki storyboard shot için Mami Onayla ver. Frame yükleme ondan sonra açılır.
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12, color: 'var(--m2-muted)', lineHeight: 1.5 }}>
            Frame'i seçtiğin harici araçta elle üret, sonra buraya yükle. Site
            görsel ÜRETMEZ — yalnız senin karenin SHA-256'sını ve boyutunu kaydeder.
          </div>
          <label className="ml-file-picker" style={{ display: 'inline-block' }}>
            <input
              className="ml-file-input"
              aria-label="Gerçek frame yükle"
              type="file"
              accept="image/*"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) onImportFrame(file); e.currentTarget.value = ''; }}
            />
            <span className="ml-file-picker-face" style={{ display: 'inline-block', padding: '8px 14px', border: '1px solid var(--m2-line-strong)', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: 'var(--m2-paper)', fontFamily: 'var(--m2-font-mono)' }}>
              ⬆ FRAME YÜKLE
            </span>
          </label>
        </>
      )}

      {/* Motion brief — YALNIZ kapı açıkken. Kapalıysa nedeni yazılır. */}
      <div style={{ borderTop: '1px solid var(--m2-line)', paddingTop: 10 }}>
        {gate.open ? (
          <div style={{ fontSize: 12, color: '#fff', lineHeight: 1.55 }}>
            <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.4, color: '#93c9a8', display: 'block', marginBottom: 4 }}>▶ MOTION BRIEF AÇIK</span>
            Ajan motion prompt'unu YALNIZ bu onaylı karede görüneni animasyona alarak yazar —
            karede olmayan karakter/nesne/ortam UYDURULAMAZ. Motor lehçesi ve süre iskeleti:
            <div style={{ marginTop: 6, fontFamily: 'var(--m2-font-mono)', fontSize: 11.5, color: 'var(--m2-muted)', whiteSpace: 'pre-wrap' }}>{scene.motionPrompt || '(iskelet yok)'}</div>
          </div>
        ) : (
          <div style={{ fontSize: 11.5, color: 'var(--m2-muted)', fontStyle: 'italic' }}>
            ⏸ Motion kapalı — {gate.reason}
          </div>
        )}
      </div>
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
        <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--m2-amber)', fontWeight: 700, fontFamily: 'var(--m2-font-mono)' }}>
          {label.toUpperCase()}
        </div>
        {copyable && (
          <button
            onClick={copy}
            style={{
              padding: '4px 8px',
              fontSize: 10,
              background: 'transparent',
              border: '1px solid var(--m2-line-strong)',
              borderRadius: 0,
              color: copied ? 'var(--m2-paper)' : 'var(--m2-muted)',
              fontFamily: 'var(--m2-font-mono)',
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
          color: 'var(--m2-paper)',
          fontFamily: mono ? "var(--m2-font-mono)" : 'inherit',
          fontSize: mono ? 12 : 13,
          background: 'transparent',
          padding: 0,
          borderRadius: 0,
          border: 'none',
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
    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line2)', background: 'linear-gradient(180deg, rgba(5,4,2,0.72), rgba(12,10,7,0.6))', boxShadow: 'var(--shadow)' }}>
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
                flex: Math.max(0.6, s.durationSec), minWidth: 56, height: 96, position: 'relative',
                borderRadius: 8, cursor: 'pointer', overflow: 'hidden',
                border: `1px solid ${active ? 'var(--gold)' : 'rgba(0,0,0,0.55)'}`,
                background: 'rgba(5,4,2,0.6)',
                boxShadow: active ? 'var(--ring-gold)' : 'none',
                transition: 'all var(--dur) var(--ease)',
                padding: 2,
              }}
            >
              <span aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: phase }} />
              {/* intensity fill */}
              <span aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${Math.max(8, s.intensity)}%`, background: `linear-gradient(180deg, ${phase}22, ${phase}55)` }} />
              <span style={{ position: 'absolute', top: 8, left: 7, fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-mono)', color: active ? 'var(--gold-hi)' : '#fff' }}>{s.id}</span>
              <span style={{ position: 'absolute', bottom: 5, left: 7, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-soft)' }}>{s.durationSec}s</span>
              {/* Faz kodu: durum salt-renge dayanmaz (renk-körü güvenli) */}
              <span style={{ position: 'absolute', bottom: 5, right: 6, fontSize: 8, fontWeight: 800, letterSpacing: 0.6, fontFamily: 'var(--font-mono)', color: active ? 'var(--gold-hi)' : 'var(--text-muted)' }}>
                {PHASE_CODE[s.phaseName] ?? ''}
              </span>
              {s.duration && !s.duration.ok && (
                <span title="Süre limiti aşıldı" style={{ position: 'absolute', top: 6, right: 6, fontSize: 9, fontWeight: 800, color: 'var(--red)' }}>⚠</span>
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
            <stop offset="0%" stopColor="#f6c862" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f6c862" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#pacingFill)" />
        <path d={linePath} fill="none" stroke="#f6c862" strokeWidth="0.8" />
        {points.map((p) => {
          const active = selectedSceneId === p.scene.id;
          return (
            <g
              key={p.scene.id}
              role="button"
              tabIndex={0}
              aria-label={`Sahne ${p.scene.id} seç`}
              aria-pressed={active}
              style={{ cursor: 'pointer' }}
              onClick={() => onPick(p.scene.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onPick(p.scene.id);
                }
              }}
            >
              <circle cx={p.x} cy={p.y} r={active ? 2.4 : 1.6} fill={PHASE_COLORS[p.scene.phaseName] || '#fff'} stroke="#0a0a14" strokeWidth="0.3" />
              {active && <circle cx={p.x} cy={p.y} r={3.6} fill="none" stroke="#f6c862" strokeWidth="0.4" />}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
