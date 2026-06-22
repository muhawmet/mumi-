import { ArrowUpRight, RadioTower } from 'lucide-react';
import type { CSSProperties } from 'react';
import { productionPulse } from '../core/productionPulse';
import { useStudioStore } from '../store/useStudioStore';
import silverDirector from '../assets/silver-director.png';

export function ProductionPulse() {
  const state = useStudioStore();
  const pulse = productionPulse(state);

  return (
    <section className="ml-production-pulse" aria-label="Production Pulse">
      <div className="ml-pulse-director" title="Aksaçlı yönetmen prodüksiyonu izliyor">
        <img src={silverDirector} alt="Aksaçlı düşük-poly yönetmen avatarı" />
        <span><i /> İZLİYOR</span>
      </div>
      <div className="ml-pulse-topline">
        <span className="ml-pulse-kicker"><RadioTower size={11} /> PRODUCTION PULSE</span>
        <span className={`ml-pulse-status ml-pulse-status--${pulse.status.toLowerCase()}`}>{pulse.status}</span>
      </div>

      <div className="ml-pulse-orbit">
        <div className="ml-pulse-ring" style={{ '--pulse-score': `${pulse.score}%` } as CSSProperties}>
          <div className="ml-pulse-core">
            <strong>{pulse.score}</strong>
            <span>READY</span>
          </div>
        </div>
        <div className="ml-pulse-readout">
          <strong>{pulse.next.label}</strong>
          <span>{pulse.next.detail}</span>
        </div>
      </div>

      <div className="ml-pulse-gates">
        {pulse.gates.map((gate) => (
          <div className="ml-pulse-gate" key={gate.id} title={`${gate.label} · ${gate.detail}`}>
            <div><span>{gate.label}</span><b>{gate.score}</b></div>
            <i><span style={{ width: `${gate.score}%` }} /></i>
          </div>
        ))}
      </div>

      <button type="button" className="ml-pulse-action" onClick={() => state.setCurrentStep(pulse.next.step)}>
        <span>SONRAKİ EN İYİ HAMLE</span>
        <ArrowUpRight size={14} />
      </button>
    </section>
  );
}
