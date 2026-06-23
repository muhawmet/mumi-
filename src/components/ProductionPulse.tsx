import { ArrowUpRight, Eye } from 'lucide-react';
import { productionPulse } from '../core/productionPulse';
import { useStudioStore } from '../store/useStudioStore';
import noirDirector from '../assets/noir-creative-director.png';

export function ProductionPulse() {
  const state = useStudioStore();
  const pulse = productionPulse(state);

  const isBriefMissing = pulse.gates.find(g => g.id === 'brief')?.score === 0;
  const isDNAMissing = pulse.gates.find(g => g.id === 'dna')?.score === 0;
  
  let harryComment = "Bekliyorum.";
  if (pulse.score === 100) {
    harryComment = "Çelişki görünmüyor. Şimdi kanıt üret.";
  } else if (isBriefMissing) {
    harryComment = "Dosyanın omurgası yok. Önce neyi savunduğunu söyle.";
  } else if (isDNAMissing) {
    harryComment = "Dünya var, bakış yok. Bir referansın tarafını seç.";
  } else {
    harryComment = "Bir şeyler eksik. Parçaları birleştir.";
  }

  return (
    <section className="ml-harry-pulse" aria-label="Harry Pulse">
      <div className="ml-harry-container">
        <div className="ml-harry-avatar-wrap">
          <img src={noirDirector} alt="Noir creative director" className="ml-harry-avatar" />
          <div className="ml-harry-avatar-overlay" />
        </div>
        
        <div className="ml-harry-content">
          <div className="ml-harry-header">
            <Eye size={12} color="var(--gold)" />
            <span>INLAND REVIEW</span>
          </div>
          
          <div className="ml-harry-quote">
            "{harryComment}"
          </div>
          
          <div className="ml-harry-metrics">
            <div className="ml-harry-score-bar">
              <div className="ml-harry-score-fill" style={{ width: `${pulse.score}%` }} />
            </div>
            <div className="ml-harry-score-text">
              <span style={{ color: pulse.score === 100 ? 'var(--green)' : 'var(--gold)' }}>{pulse.score}%</span> READY
            </div>
          </div>
        </div>
      </div>
      
      <button type="button" className="ml-harry-action" onClick={() => state.setCurrentStep(pulse.next.step)}>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>SONRAKİ EN İYİ HAMLE</span>
          <span>{pulse.next.label}</span>
        </span>
        <div className="ml-harry-action-icon">
          <ArrowUpRight size={14} />
        </div>
      </button>
    </section>
  );
}
