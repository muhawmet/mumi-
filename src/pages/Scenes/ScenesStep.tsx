import { useStudioStore, type WorkingMode } from '../../store/useStudioStore';
import { type BeatMode } from '../../core/beats';
import { Panel, Button, Stat, Chip, selectStyle } from '../../components/Layout/PanelKit';
import { RecipeThumb } from '../../components/RecipeThumb';

const BEAT_MODES: BeatMode[] = ['Ekonomik', 'Dengeli', 'Hassas', 'Manuel'];

export function ScenesStep() {
  const store = useStudioStore();
  const { beatMode, workingMode, beatAnalysis, beatKeeps, selectedWorldId } = store;

  const header = (
    <header style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--gold)', fontWeight: 700 }}>STAGE 3 · SAHNELER</div>
        <h1 style={{ fontSize: 34, margin: '8px 0 4px', fontWeight: 700, letterSpacing: -0.5 }}>Beat Planner & Storyboard</h1>
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
        <Button onClick={() => store.advance()}>İleri → Timeline <span className="kbd" style={{ marginLeft: 6 }}>⌘↵</span></Button>
      </div>
    </header>
  );

  if (!beatAnalysis) {
    return (
      <div className="scenes-step" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1080 }}>
        {header}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: 20, alignItems: 'start' }} className="dashboard-form-grid">
        {/* ---- BEAT PLANNER ---- */}
        <Panel title="Beat Planner" subtitle={`Limit: ${plan.min}s · hedef ${plan.target}s · max ${plan.max}s`}>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'rgba(0,0,0,0.28)', border: '1px solid var(--line2)', borderRadius: 'var(--r-md)' }}>
            {BEAT_MODES.map((m) => {
              const active = beatMode === m;
              return (
                <button
                  key={m}
                  onClick={() => store.setBeatMode(m)}
                  style={{
                    flex: 1, padding: '9px 6px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    borderRadius: 'var(--r-xs)',
                    border: `1px solid ${active ? 'var(--goldline)' : 'transparent'}`,
                    background: active ? 'var(--goldsoft)' : 'transparent',
                    color: active ? 'var(--gold)' : 'var(--text-muted)',
                    transition: 'all var(--dur) var(--ease)',
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
              <span style={{ color: 'var(--gold)' }}>max {plan.max}s / klip</span>
            </div>
            <div style={{ display: 'flex', gap: 2, height: 14, borderRadius: 7, overflow: 'hidden', background: 'var(--inset)', border: '1px solid var(--line2)' }}>
              {enhancedBeats.map((b) => {
                const over = b.voSec > plan.max && beatMode !== 'Manuel';
                return (
                  <div
                    key={b.id}
                    title={`Beat ${b.id}: VO ${b.voSec}s${over ? ' · LİMİT AŞIMI' : ''}`}
                    style={{
                      flex: Math.max(0.4, b.clipSec),
                      background: over
                        ? 'linear-gradient(180deg, #ff7a8f, var(--red))'
                        : 'linear-gradient(180deg, var(--gold-hi), var(--gold-2))',
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
                    padding: 12, borderRadius: 'var(--r-sm)', border: '1px solid var(--line2)', background: 'rgba(0,0,0,0.2)',
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
            {enhancedBeats.map((beat) => {
              const isOverLimit = beat.voSec > plan.max;
              const isKept = beatKeeps[beat.id];
              const accent = isOverLimit && beatMode !== 'Manuel' ? 'var(--red)' : 'var(--gold)';
              return (
                <div
                  key={beat.id}
                  style={{
                    display: 'flex', gap: 14, padding: 14, borderRadius: 'var(--r-md)',
                    border: '1px solid var(--line2)', background: 'rgba(0,0,0,0.2)',
                    borderLeft: `3px solid ${accent}`,
                  }}
                >
                  <RecipeThumb size={60} radius={10} />
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.5 }}>{beat.text}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                      <span style={{ color: 'var(--text-muted)' }}>VO {beat.voSec}s</span>
                      <span style={{ color: 'var(--text-muted)' }}>Vis {beat.visualSec}s</span>
                      <span style={{ color: 'var(--gold)', fontWeight: 700 }}>Clip {beat.clipSec}s</span>
                      {isKept && <Chip tone="amber">BÖLEMEZSİN</Chip>}
                      {isOverLimit && beatMode !== 'Manuel' && <Chip tone="red">OVER LIMIT</Chip>}
                    </div>
                  </div>
                  <button
                    onClick={() => store.toggleBeatKeep(beat.id)}
                    style={{
                      alignSelf: 'center', flexShrink: 0, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      borderRadius: 'var(--r-xs)',
                      border: `1px solid ${isKept ? 'var(--goldline)' : 'var(--line3)'}`,
                      background: isKept ? 'var(--goldsoft)' : 'transparent',
                      color: isKept ? 'var(--gold)' : 'var(--text-muted)',
                      transition: 'all var(--dur) var(--ease)',
                    }}
                  >
                    Keep
                  </button>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}
