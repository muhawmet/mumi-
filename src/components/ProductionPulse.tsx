import { ArrowUpRight, Eye } from 'lucide-react';
import { useStudioStore, productionReadiness } from '../store/useStudioStore';

/**
 * MACRO 4 — Üretim nabzı, TEK canonical readiness'e bağlı.
 *
 * Önce `productionPulse` (ayrı skor) + `evaluateInnerVoices` (26-ses Disco persona) kullanıyordu:
 * ayrı bir "hazır" hesabı ve konuşan karakter. İkisi de kaldırıldı. Bu panel artık
 * `productionReadiness`'in aynı gerçeğini gösterir ve "sonraki hamle" düğmesi `advance()`
 * kapısından geçer (sidebar bypass'ıyla aynı yasa).
 */
export function ProductionPulse() {
  const state = useStudioStore();
  const advance = useStudioStore((s) => s.advance);
  const commandId = state.currentCommandId();
  const promptSourceId = state.currentPromptSourceCommandId();
  const readiness = productionReadiness(state, commandId, promptSourceId);
  const pct = readiness.ready ? 100 : readinessPct(readiness.stage);
  const onNext = () => {
    if (readiness.stage === 'prompt' || readiness.stage === 'approval') {
      state.setCurrentStep('timeline');
      return;
    }
    advance();
  };

  return (
    <section className="ml-harry-pulse" aria-label="Production Readiness">
      <div className="ml-harry-container">
        <div className="ml-harry-avatar-wrap">
          <div
            aria-hidden
            style={{
              width: 56, height: 72, borderRadius: 12, flexShrink: 0,
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              background: 'linear-gradient(160deg, rgba(246,200,98,0.16), rgba(28,18,9,0.6) 60%)',
              boxShadow: 'inset 0 1px 0 rgba(255,214,130,0.35), inset 0 -1px 0 rgba(143,163,194,0.14), 0 10px 22px -12px rgba(0,0,0,0.7)',
              border: '1px solid rgba(246,200,98,0.28)',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 52, lineHeight: 0.9,
              color: 'var(--gold)', textShadow: '0 2px 18px rgba(246,200,98,0.35)',
              transform: 'translateY(14px)',
            }}>“</span>
          </div>
        </div>

        <div className="ml-harry-content">
          <div className="ml-harry-header">
            <Eye size={12} color="var(--gold)" />
            <span>ÜRETİM DURUMU</span>
          </div>

          {/* Konuşan persona değil — tek canonical readiness'in düz durum satırı. */}
          <div className="ml-harry-quote">
            {readiness.reason}
          </div>

          <div className="ml-harry-metrics">
            <div className="ml-harry-score-bar">
              <div className="ml-harry-score-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="ml-harry-score-text">
              <span style={{ color: readiness.ready ? 'var(--green)' : 'var(--gold)' }}>{pct}%</span> READY
            </div>
          </div>
        </div>
      </div>

      {!readiness.ready && (
        <button type="button" className="ml-harry-action" onClick={onNext}>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>SONRAKİ ADIM</span>
            <span>{stageLabel(readiness.stage)}</span>
          </span>
          <div className="ml-harry-action-icon">
            <ArrowUpRight size={14} />
          </div>
        </button>
      )}
    </section>
  );
}

/** Kaba ilerleme yüzdesi — readiness'in durduğu aşamadan türetilir (ayrı skor motoru değil). */
function readinessPct(stage: ReturnType<typeof productionReadiness>['stage']): number {
  switch (stage) {
    case 'source': return 15;
    case 'recipe': return 35;
    case 'storyboard': return 55;
    case 'blockers': return 70;
    case 'prompt': return 78;
    case 'approval': return 85;
    default: return 100;
  }
}

function stageLabel(stage: ReturnType<typeof productionReadiness>['stage']): string {
  switch (stage) {
    case 'source': return 'Kaynağı hazırla';
    case 'recipe': return 'Reçeteyi tamamla';
    case 'storyboard': return 'Storyboard üret';
    case 'blockers': return 'FACT REQUIRED çöz';
    case 'prompt': return "Ajan prompt'larını geri al";
    case 'approval': return "Shot'ları onayla";
    default: return 'Üretime hazır';
  }
}
