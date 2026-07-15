import React, { useState } from 'react';
import { LayoutDashboard, Palette, Film, Sparkles, Check, Eye, EyeOff, SlidersHorizontal } from 'lucide-react';
import { sourceReadiness, useStudioStore, type Step } from '../../store/useStudioStore';
import { PreviewStage } from '../PreviewStage';
import { RecipeRail } from '../RecipeRail';
import { ProductionPulse } from '../ProductionPulse';
import { SceneLayer } from '../../scene/SceneLayer';
import { useFloorGridVisible } from '../../scene/assetPresence';

export const BASE_STEPS: Array<{ id: Step; label: string; hint: string; icon: React.ReactNode; presetOnly?: boolean }> = [
  { id: 'dashboard', label: 'Brief', hint: 'Kaynak & konu', icon: <LayoutDashboard size={17} /> },
  { id: 'director', label: 'Yönetmen', hint: 'Path kararları', icon: <SlidersHorizontal size={17} />, presetOnly: true },
  { id: 'recipe', label: 'Reçete', hint: 'Dünya · palet · DNA', icon: <Palette size={17} /> },
  { id: 'scenes', label: 'Sahneler', hint: 'Beat planı', icon: <Film size={17} /> },
  { id: 'timeline', label: 'Timeline', hint: 'Üret & teslim', icon: <Sparkles size={17} /> },
];

export const QA_STEP: { id: Step; label: string; hint: string; icon: React.ReactNode } = {
  id: 'qa',
  label: 'QA',
  hint: 'Cabinet',
  icon: <Check size={17} />,
};

/**
 * Filters BASE_STEPS by preset-gating, appends QA_STEP when on the qa step,
 * and assigns displayIndex from VISIBLE list position (1-based) — so the
 * sidebar never shows a gapped sequence like 1,3,4,5 when a presetOnly step
 * (director) is hidden.
 */
export function visibleSteps<T extends { id: Step; presetOnly?: boolean }>(
  all: readonly T[],
  qaStep: T,
  opts: { phase0PresetId: string | null | undefined; currentStep: Step },
): Array<T & { displayIndex: number }> {
  const { phase0PresetId, currentStep } = opts;
  const baseSteps = all.filter((step) => !step.presetOnly || phase0PresetId || currentStep === step.id);
  const steps = currentStep === 'qa' ? [...baseSteps, qaStep] : baseSteps;
  return steps.map((step, i) => ({ ...step, displayIndex: i + 1 }));
}

/**
 * Canonical stage number for a page header — the SAME number the sidebar shows
 * for that step. One source of truth: derives from visibleSteps so a page's
 * "STAGE n" can never disagree with the rail, and Yönetmen (director) inserting
 * itself never leaves two different "STAGE 2"s on screen.
 */
export function stageNumber(
  stepId: Step,
  opts: { phase0PresetId: string | null | undefined; currentStep: Step },
): number {
  const found = visibleSteps(BASE_STEPS, QA_STEP, opts).find((s) => s.id === stepId);
  if (found) return found.displayIndex;
  const canonical = BASE_STEPS.findIndex((s) => s.id === stepId);
  return canonical >= 0 ? canonical + 1 : 1;
}

const HIDDEN_CHROME: React.CSSProperties = {
  opacity: 0,
  visibility: 'hidden',
  pointerEvents: 'none',
  transform: 'scale(0.985)',
  transition: 'opacity var(--dur-2) var(--ease), transform var(--dur-2) var(--ease), visibility var(--dur-2) var(--ease)',
};

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const floorGridVisible = useFloorGridVisible();
  const [aquariumMode, setAquariumMode] = useState(false);
  const currentStep = useStudioStore((s) => s.currentStep);
  const setCurrentStep = useStudioStore((s) => s.setCurrentStep);
  const advance = useStudioStore((s) => s.advance);
  const rawSource = useStudioStore((s) => s.rawSource);
  const sourceReport = useStudioStore((s) => s.sourceReport);
  const sourceBeats = useStudioStore((s) => s.sourceBeats);
  const phase0PresetId = useStudioStore((s) => s.phase0PresetId);
  const sourceGate = sourceReadiness({ rawSource, sourceReport });
  const hasFailedReport = Boolean(sourceReport && !sourceReport.ok);
  const steps = visibleSteps(BASE_STEPS, QA_STEP, { phase0PresetId, currentStep });
  const activeIdx = Math.max(0, steps.findIndex((s) => s.id === currentStep));

  return (
    <div className={`ml-shell${aquariumMode ? ' ml-aquarium-mode' : ''}`} style={styles.shell}>
      {/* B4: AntigravityBackground (2D biyolüminesan akvaryum) emekli — F sıcak-altın diline
          aykırıydı + ikinci tam-ekran canvas. Tek arka plan otoritesi artık SceneLayer
          (WebGL'de altın-saat tableau, yoksa sıcak gradient fallback). Dosya durur, kolay geri-al. */}
      <SceneLayer />
      {floorGridVisible && <div className="ml-v3-floor" aria-hidden />}
      <div className="ml-spotlight" aria-hidden style={{ ...styles.spotlight, opacity: aquariumMode ? 0.28 : 1 }} />

      <button
        type="button"
        className="ml-aquarium-toggle"
        aria-pressed={aquariumMode}
        onClick={() => setAquariumMode((next) => !next)}
        style={{
          ...styles.aquariumToggle,
          right: aquariumMode ? 22 : 364,
          ...(aquariumMode ? styles.aquariumToggleActive : null),
        }}
      >
        {aquariumMode ? <EyeOff size={15} /> : <Eye size={15} />}
        <span>{aquariumMode ? 'MENÜLERİ AÇ' : 'AKVARYUM MODU'}</span>
      </button>

      <nav className="ml-sidebar" style={{ ...styles.sidebar, ...(aquariumMode ? HIDDEN_CHROME : null) }}>
        <header style={styles.brand}>
          <span className="ml-v3-brand-mark"><Sparkles size={18} /></span>
          <div>
            <div className="ml-v3-brand-title">MAMILAS</div>
            <div className="ml-v3-brand-sub">STUDIO CONSOLE · 2026</div>
          </div>
        </header>

        <ol className="ml-v3-steplist">
          <span aria-hidden className="ml-v3-spine" />
          <span aria-hidden className="ml-v3-spine-fill" style={{ height: `calc(${(activeIdx / Math.max(1, steps.length - 1)) * 100}% )` }} />
          {steps.map((s, i) => {
            const active = currentStep === s.id;
            const done = i < activeIdx;
            return (
              <li key={s.id} style={styles.stepRow}>
                <button
                  className={`ml-step-btn${active ? ' is-active' : ''}`}
                  aria-current={active ? 'step' : undefined}
                  // MACRO 4 — sidebar kapıları ATLAMAZ. Geri/mevcut/ziyaret edilmiş adıma serbest;
                  // ileri atlarken hedefe kadar HER ara adımın `advance()` kapısı sırayla denenir
                  // (kaynak/reçete readiness) — bir kapı tutarsa orada durulur (lastError). Önce
                  // sidebar setCurrentStep ile tüm kapıları atlıyordu; artık readiness zorunlu.
                  onClick={() => {
                    if (i <= activeIdx) { setCurrentStep(s.id); return; }
                    // İleri: her adımda advance() dene; ilerleme durursa (kapı tuttu) bırak.
                    for (let guard = 0; guard < steps.length; guard++) {
                      const idxNow = steps.findIndex((x) => x.id === useStudioStore.getState().currentStep);
                      if (idxNow >= i) break;
                      const before = useStudioStore.getState().currentStep;
                      advance();
                      if (useStudioStore.getState().currentStep === before) break; // kapı tuttu
                    }
                  }}
                >
                  <span className={`ml-v3-node${done ? ' is-done' : ''}${active ? ' is-active' : ''}`}>
                    {done ? <Check size={13} strokeWidth={3} /> : s.displayIndex}
                  </span>
                  <span className="ml-v3-step-icon">{s.icon}</span>
                  <span style={styles.stepText}>
                    {/* Etiket her durumda kendi alt-yazısından BASKIN kalır (ters hiyerarşi yasak):
                        aktif=paper, bitmiş=muted, sıradaki=text-soft — hiçbiri hairline rengine düşmez. */}
                    <span className="ml-v3-step-label" style={{ color: active ? 'var(--m2-paper)' : done ? 'var(--m2-muted)' : 'var(--text-soft)' }}>{s.label}</span>
                    <span className="ml-v3-step-hint">{s.hint}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <ProductionPulse />
      </nav>

      <main className="ml-main" style={{ ...styles.main, ...(aquariumMode ? HIDDEN_CHROME : null) }}>
        <div className="ml-v3-screen">{children}</div>
      </main>

      <aside className="ml-right-rail" style={{ ...styles.rightRail, ...(aquariumMode ? HIDDEN_CHROME : null) }} data-testid="source-right-rail">
        <div style={styles.railStack}>
          <section className="ml-v3-monitor">
            <div className="ml-v3-monitor-head">
              <span className="ml-v3-eyebrow">ÇİZİM EKRANI</span>
              <span className="ml-v3-kicker">LIVE CANVAS</span>
            </div>
            <PreviewStage />
          </section>

          {currentStep === 'dashboard' ? (
            <section className="ml-v3-card ml-v3-parchment">
              <div className="ml-v3-eyebrow">SOURCE GATE</div>
              <div className="ml-v3-status" style={{ color: sourceGate.ready && rawSource ? 'var(--green)' : rawSource ? (hasFailedReport ? 'var(--m2-danger)' : 'var(--m2-amber)') : 'var(--m2-muted)' }}>
                {!rawSource ? 'BEKLİYOR' : sourceGate.ready ? 'PASS' : hasFailedReport ? 'FAIL' : 'INGEST BEKLİYOR'}
              </div>
              <p className="ml-v3-copy">
                {!rawSource
                  ? 'İlk adım: müşteri metnini Brief\'e yapıştır. Konu bazlı üretim de açık — kanonik kilit istersen kaynak gir.'
                  : sourceGate.ready
                    ? 'Ham kaynak beat zinciriyle birebir eşleşiyor. Üretim kapısı açık.'
                    : hasFailedReport
                      ? sourceGate.reason
                      : 'Metin hazır. "Decode + Kayıpsız Ingest" ile beat\'lere kilitle.'}
              </p>
              {/* Boş durum NULL tablosu değil DAVET: metrikler ancak ölçülecek bir şey varken görünür. */}
              {rawSource ? (
                <>
                  <div className="ml-v3-metric"><span>Coverage</span><strong>{sourceReport ? `${sourceReport.coverage}%` : 'ingest bekliyor'}</strong></div>
                  <div className="ml-v3-metric"><span>Segments</span><strong>{sourceBeats.length}</strong></div>
                  <div className="ml-v3-hash"><span>RAW</span><code>{sourceReport?.rawHash ?? 'ingest bekliyor'}</code></div>
                  <div className="ml-v3-hash"><span>RECON</span><code>{sourceReport?.reconHash ?? 'ingest bekliyor'}</code></div>
                </>
              ) : (
                <div className="ml-v3-gate-invite">
                  <span>Metin girince burada canlanır:</span>
                  <em>kayıpsız coverage · beat zinciri · RAW/RECON bütünlük mührü</em>
                </div>
              )}
            </section>
          ) : (
            <RecipeRail />
          )}
        </div>
      </aside>

      {/* MACRO 4 — konuşan-karakter Disco katmanı (ThoughtDock/InnerVoice toast'ları, "CASE LEDGER"
          persona alıntıları) KALDIRILDI. Mami tek Yönetmen deneyimi görür; gerçek üretim durumu
          ProductionPulse'ın tek canonical readiness'inde ve QA'nın nötr teknik validator'ında yaşar. */}
    </div>
  );
};

/* Structural-only inline styles: layout skeleton the CSS stage builds on.
   All visual language (glass, depth, light) lives in design_v3.css. */
const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: 'flex',
    height: '100vh',
    width: '100%',
    overflow: 'hidden',
    color: 'var(--text)',
    fontFamily: 'var(--font-sans)',
    position: 'relative',
    zIndex: 1,
  },
  spotlight: {
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
    transition: 'opacity var(--dur-2) var(--ease)',
  },
  aquariumToggle: {
    position: 'fixed',
    right: 364,
    top: 18,
    zIndex: 6,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    color: 'var(--m2-muted)',
    cursor: 'pointer',
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: 1.2,
    fontFamily: 'var(--m2-font-sans)',
    transition: 'all var(--m2-hover) var(--m2-ease)',
  },
  aquariumToggleActive: {
    color: 'var(--m2-paper)',
  },
  sidebar: {
    width: 256,
    flexShrink: 0,
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 34,
    position: 'sticky',
    top: 0,
    height: '100vh',
    zIndex: 2,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 12 },
  stepRow: { position: 'relative' },
  stepText: { display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 },
  main: { flex: 1, overflowY: 'auto', position: 'relative', minWidth: 0, zIndex: 1 },
  rightRail: {
    width: 340,
    flexShrink: 0,
    padding: '24px 20px',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
    zIndex: 2,
  },
  railStack: { display: 'flex', flexDirection: 'column', gap: 18 },
};
