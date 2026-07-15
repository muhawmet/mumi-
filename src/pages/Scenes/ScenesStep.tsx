import React, { useState } from 'react';
import { useStudioStore, type WorkingMode } from '../../store/useStudioStore';
import { type BeatMode } from '../../core/beats';
import { Panel, Button, Stat, Chip, selectStyle } from '../../components/Layout/PanelKit';
import { stageNumber } from '../../components/Layout/AppLayout';
import { BeatThumb } from '../../components/BeatThumb';
import { DATA, paletteColors } from '../../core/pure';

const BEAT_MODES: BeatMode[] = ['Ekonomik', 'Dengeli', 'Hassas', 'Manuel'];

export function ScenesStep() {
  const store = useStudioStore();
  const { beatMode, workingMode, beatAnalysis, beatKeeps, selectedWorldId } = store;
  const selectedPaletteId = store.selectedPaletteId;

  const thumbColors = paletteColors(
    DATA.palettes.find((p) => p.id === selectedPaletteId),
    DATA.worlds.find((w) => w.id === selectedWorldId),
  );

  const header = (
    <header style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--m2-amber)', fontWeight: 700, fontFamily: 'var(--m2-font-mono)' }}>STAGE {stageNumber('scenes', { phase0PresetId: store.phase0PresetId, currentStep: 'scenes' })} · SAHNELER</div>
        <h1 style={{ fontSize: 34, margin: '8px 0 4px', fontWeight: 500, letterSpacing: '0.005em', fontFamily: 'var(--font-serif)' }}>Beat Planner & Storyboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Anlamsal beat ekonomisi — VO süresini klip bütçesine göre dengele, BÖLEMEZSİN sınırını koru.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <select
          value={workingMode}
          onChange={(e) => store.setField('workingMode', e.target.value as WorkingMode)}
          style={{ ...selectStyle, minWidth: 150 }}
        >
          <option value="Hızlı" style={{ background: 'var(--s2)' }}>Hızlı Çalışma</option>
          <option value="Standart" style={{ background: 'var(--s2)' }}>Standart</option>
          <option value="Sıkı Teslim" style={{ background: 'var(--s2)' }}>Sıkı Teslim</option>
        </select>
        {store.beatHistory && store.beatHistory.length > 0 && (
          <Button variant="ghost" onClick={() => store.undoBeatAction()} style={{ color: 'var(--m2-amber)' }}>↩ Geri Al (Undo)</Button>
        )}
        <Button variant="ghost" onClick={() => store.resetStoryboard()}>Storyboard Sıfırla</Button>
        <Button onClick={() => store.advance()}>İleri → <span lang="en">Timeline</span> <span className="kbd" style={{ marginLeft: 6 }}>⌘↵</span></Button>
      </div>
    </header>
  );

  const errorBanner = store.lastError ? (
    <div
      role="alert"
      style={{
        padding: '10px 14px',
        borderRadius: 8,
        border: '1px solid var(--m2-danger)',
        background: 'rgba(245,77,107,.08)',
        color: '#fdb',
        fontSize: 13,
      }}
    >
      ⚠ {store.lastError}
    </div>
  ) : null;

  if (!beatAnalysis) {
    return (
      <div className="scenes-step" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1080 }}>
        {header}
        {errorBanner}
        <div className="studio-verdict-band ml-v3-parchment">
          <div>
            <span className="studio-verdict-kicker">CABINET READ</span>
            <strong>Beat ekonomisi önce karar verir.</strong>
            <p>Storyboard listesi ham satır değil; kaynak, VO bütçesi ve world kilidi arasındaki üretim pazarlığıdır.</p>
          </div>
        </div>
        <Panel title="Beat Planner devre dışı" subtitle="Kanonik kaynak (Ingest) bulunamadı — yalnızca sahne sayısıyla devam ediliyor.">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)', fontSize: 13 }}>
            <Chip tone="amber">UNSOURCED</Chip>
            Brief adımında “Decode + Kayıpsız Ingest” yaparsan beat ekonomisi ve storyboard burada açılır.
          </div>
        </Panel>
      </div>
    );
  }

  const { plan, hints, enhancedBeats } = beatAnalysis;

  return (
    <div className="scenes-step" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1080 }}>
      {header}
      {errorBanner}

      <div className="studio-verdict-band ml-v3-parchment">
        <div>
          <span className="studio-verdict-kicker">CABINET READ</span>
          <strong>{enhancedBeats.length} beat masada, {plan.clips} klip üretimde.</strong>
          <p>Karar özeti burada kalır; alttaki planner kanıt ve ince ayardır.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: 20, alignItems: 'start' }} className="dashboard-form-grid">
        {/* ---- BEAT PLANNER ---- */}
        <Panel title="Beat Planner" subtitle={`Limit: ${plan.min}s · hedef ${plan.target}s · max ${plan.max}s`}>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'transparent', border: '1px solid var(--m2-line)', borderRadius: 0 }}>
            {BEAT_MODES.map((m) => {
              const active = beatMode === m;
              return (
                <button
                  key={m}
                  onClick={() => store.setBeatMode(m)}
                  style={{
                    flex: 1, padding: '9px 6px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    borderRadius: 0,
                    border: `1px solid ${active ? 'var(--m2-paper)' : 'transparent'}`,
                    background: active ? 'var(--m2-paper)' : 'transparent',
                    color: active ? 'var(--m2-ink)' : 'var(--m2-muted)',
                    fontFamily: 'var(--m2-font-mono)',
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
            <Stat label="Klip" value={plan.clips} />
            <Stat label="Üretim Maliyeti" value={`${plan.genSec}s`} />
            <Stat label="Toplam VO" value={`${plan.voSec}s`} />
            <Stat label={`Tasarruf (${plan.savedSec}s)`} value={`${plan.savedPct}%`} tone="green" />
          </div>

          {/* — Beat budget ribbon: each beat proportional, over-limit glows red — */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, letterSpacing: 1.4, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
              <span>Beat Bütçesi</span>
              <span style={{ color: 'var(--m2-amber)' }}>max {plan.max}s / klip</span>
            </div>
            <div style={{ display: 'flex', gap: 2, height: 14, borderRadius: 0, overflow: 'hidden', background: 'transparent', border: '1px solid var(--m2-line-strong)' }}>
              {enhancedBeats.map((b) => {
                const over = b.voSec > plan.max && beatMode !== 'Manuel';
                return (
                  <div
                    key={b.id}
                    title={`Beat ${b.id}: VO ${b.voSec}s${over ? ' · LİMİT AŞIMI' : ''}`}
                    style={{
                      flex: Math.max(0.4, b.clipSec),
                      background: over
                        ? 'var(--m2-danger)'
                        : 'var(--m2-amber)',
                      boxShadow: over ? '0 0 8px rgba(255,92,121,0.5)' : 'none',
                      opacity: beatKeeps[b.id] ? 1 : 0.85,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {hints.length > 0 && (
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 10.5, letterSpacing: 1.4, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Akıllı Öneriler
              </div>
              {hints.map((hint, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'flex-start',
                    padding: 12, borderRadius: 0, border: '1px solid var(--m2-line-strong)', background: 'transparent',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{hint.reason}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>{hint.effect}</div>
                  </div>
                  {hint.type === 'merge' && <Button variant="ghost" onClick={() => store.mergeBeats(hint.i)} style={{ padding: '7px 12px', fontSize: 12 }}>Birleştir</Button>}
                  {hint.type === 'split' && <Button variant="danger" onClick={() => store.splitBeat(hint.i)} style={{ padding: '7px 12px', fontSize: 12 }}>Böl</Button>}
                  {hint.type === 'keep' && <Button variant="ghost" onClick={() => store.toggleBeatKeep(enhancedBeats[hint.i].id)} style={{ padding: '7px 12px', fontSize: 12 }}>Ayrı Tut</Button>}
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* ---- STORYBOARD ---- */}
        <Panel title="Storyboard" subtitle={`${enhancedBeats.length} sahne · ${selectedWorldId || 'world seçilmedi'}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {enhancedBeats.map((beat, idx) => (
              <React.Fragment key={beat.id}>
                <BeatCard beat={beat} index={idx} beatMode={beatMode} plan={plan} isKept={beatKeeps[beat.id]} store={store} thumbColors={thumbColors} />
                {beatMode === 'Manuel' && idx < enhancedBeats.length - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '-4px 0' }}>
                    <Button variant="ghost" style={{ padding: '2px 8px', fontSize: 10, background: 'var(--m2-surface)' }} onClick={() => store.mergeBeats(idx)}>
                      ▼ Birleştir ▲
                    </Button>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

const BeatCard = ({ beat, index, beatMode, plan, isKept, store, thumbColors }: any) => {
  const [cursorIdx, setCursorIdx] = useState<number | null>(null);
  const [localText, setLocalText] = useState(beat.text);

  React.useEffect(() => {
    setLocalText(beat.text);
  }, [beat.text]);

  const isOverLimit = beat.voSec > plan.max;
  const accent = isOverLimit && beatMode !== 'Manuel' ? 'var(--m2-danger)' : 'var(--m2-amber)';

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const start = e.currentTarget.selectionStart;
    const end = e.currentTarget.selectionEnd;
    // Only show split button if it's a single cursor point inside the text
    if (start === end && start > 0 && start < localText.length) {
      setCursorIdx(start);
    } else {
      setCursorIdx(null);
    }
  };

  return (
    <div
      className="beat-card-premium"
      style={{
        display: 'flex', gap: 14, padding: 14, borderRadius: 8,
        border: '1px solid var(--m2-line-strong)',
        background: 'linear-gradient(135deg, rgba(242,238,230,0.035), rgba(214,168,79,0.03))',
        borderLeft: `3px solid ${accent}`,
        transition: 'all 0.2s',
      }}
    >
      <BeatThumb seed={beat.id} colors={thumbColors} height={60} width={60} radius={10} label={String(index + 1).padStart(2, '0')} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <textarea
          readOnly={beatMode !== 'Manuel'}
          value={localText}
          onChange={(e) => {
            if (beatMode === 'Manuel') {
              setLocalText(e.target.value);
            }
          }}
          onBlur={() => {
            if (beatMode === 'Manuel' && localText !== beat.text) {
              store.updateBeatText(index, localText);
            }
          }}
          onSelect={handleSelect}
          style={{
            width: '100%',
            background: beatMode === 'Manuel' ? 'rgba(0,0,0,0.2)' : 'transparent',
            border: 'none',
            color: 'var(--m2-paper)',
            fontSize: 13,
            lineHeight: 1.5,
            resize: 'none',
            outline: 'none',
            overflow: 'hidden',
            fontFamily: 'inherit',
          }}
          rows={Math.max(1, Math.ceil(localText.length / 80))}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          <span style={{ color: 'var(--m2-muted)' }}>VO {beat.voSec}s</span>
          <span style={{ color: 'var(--m2-muted)' }}>Vis {beat.visualSec}s</span>
          <span style={{ color: 'var(--m2-amber)', fontWeight: 700 }}>Clip {beat.clipSec}s</span>
          {isKept && <Chip tone="amber">BÖLEMEZSİN</Chip>}
          {isOverLimit && beatMode !== 'Manuel' && <Chip tone="red">OVER LIMIT</Chip>}
          {cursorIdx !== null && beatMode === 'Manuel' && (
            <Button
              variant="danger"
              style={{ padding: '2px 8px', fontSize: 10 }}
              onClick={() => {
                store.manualSplitBeat(index, cursorIdx);
                setCursorIdx(null);
              }}
            >
              ✂️ BÖL ({cursorIdx})
            </Button>
          )}

        </div>
      </div>
      <button
        onClick={() => store.toggleBeatKeep(beat.id)}
        style={{
          alignSelf: 'center', flexShrink: 0, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          borderRadius: 0,
          border: `1px solid ${isKept ? 'var(--m2-paper)' : 'var(--m2-line-strong)'}`,
          background: isKept ? 'var(--m2-paper)' : 'transparent',
          color: isKept ? 'var(--m2-ink)' : 'var(--m2-muted)',
          fontFamily: 'var(--m2-font-mono)',
        }}
      >
        Keep
      </button>
    </div>
  );
};
