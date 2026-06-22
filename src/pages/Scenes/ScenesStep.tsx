import React from 'react';
import { useStudioStore, type WorkingMode } from '../../store/useStudioStore';
import { type BeatMode } from '../../core/beats';

export function ScenesStep() {
  const store = useStudioStore();
  const { 
    beatMode, 
    workingMode, 
    beatAnalysis, 
    sourceBeats,
    beatKeeps,
    selectedWorldId
  } = store;

  if (!beatAnalysis) {
    return (
      <div className="scenes-step p-6 space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-500">Sahneler & Beat Planner (Devre Dışı)</h2>
            <p className="text-sm text-gray-400 mt-2">Kanonik kaynak (Ingest) bulunamadı. Sadece sahne sayısı ile devam ediliyor.</p>
          </div>
          <button 
            onClick={() => store.advance()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold"
          >
            İleri → Timeline
          </button>
        </header>
      </div>
    );
  }

  const { plan, hints, enhancedBeats } = beatAnalysis;

  const handleModeChange = (m: BeatMode) => {
    store.setBeatMode(m);
  };

  const handleWorkingModeChange = (m: WorkingMode) => {
    store.setField('workingMode', m);
  };

  return (
    <div className="scenes-step p-6 space-y-8">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sahneler & Beat Planner</h2>
        <div className="flex gap-4">
          <select 
            value={workingMode} 
            onChange={(e) => handleWorkingModeChange(e.target.value as WorkingMode)}
            className="border p-2 rounded"
          >
            <option value="Hızlı">Hızlı Çalışma</option>
            <option value="Standart">Standart</option>
            <option value="Sıkı Teslim">Sıkı Teslim</option>
          </select>
          <button 
            onClick={() => store.advance()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold"
          >
            İleri → Timeline
          </button>
        </div>
      </header>

      <div className="flex gap-6">
        {/* BEAT PLANNER PANEL */}
        <aside className="w-1/3 bg-gray-50 p-4 border rounded-lg flex flex-col gap-6">
          <div>
            <h3 className="font-bold text-lg mb-2">Beat Planner</h3>
            <div className="flex bg-white rounded border overflow-hidden">
              {['Ekonomik', 'Dengeli', 'Hassas', 'Manuel'].map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m as BeatMode)}
                  className={`flex-1 p-2 text-sm text-center ${beatMode === m ? 'bg-blue-100 font-bold text-blue-800' : 'hover:bg-gray-100'}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              Limit: {plan.min}s - {plan.target}s - {plan.max}s
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border text-center">
              <div className="text-2xl font-black">{plan.clips}</div>
              <div className="text-xs text-gray-500 uppercase">Klip</div>
            </div>
            <div className="bg-white p-3 rounded border text-center">
              <div className="text-2xl font-black">{plan.genSec}s</div>
              <div className="text-xs text-gray-500 uppercase">Üretim Maliyeti</div>
            </div>
            <div className="bg-white p-3 rounded border text-center">
              <div className="text-2xl font-black">{plan.voSec}s</div>
              <div className="text-xs text-gray-500 uppercase">Toplam VO</div>
            </div>
            <div className="bg-white p-3 rounded border text-center">
              <div className="text-2xl font-black text-green-600">{plan.savedPct}%</div>
              <div className="text-xs text-gray-500 uppercase">Tasarruf ({plan.savedSec}s)</div>
            </div>
          </div>

          {hints.length > 0 && (
            <div className="bg-white border rounded p-4 flex flex-col gap-3">
              <h4 className="font-bold text-sm text-gray-700">Akıllı Öneriler</h4>
              {hints.map((hint, idx) => (
                <div key={idx} className="bg-blue-50 border border-blue-200 p-3 rounded text-sm flex justify-between items-start">
                  <div>
                    <div className="font-medium text-blue-900 mb-1">{hint.reason}</div>
                    <div className="text-blue-700 text-xs">{hint.effect}</div>
                  </div>
                  {hint.type === 'merge' && (
                    <button 
                      onClick={() => store.mergeBeats(hint.i)}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded ml-2 whitespace-nowrap"
                    >
                      Birleştir
                    </button>
                  )}
                  {hint.type === 'split' && (
                    <button 
                      onClick={() => store.splitBeat(hint.i)}
                      className="text-xs bg-red-600 text-white px-2 py-1 rounded ml-2 whitespace-nowrap"
                    >
                      Böl
                    </button>
                  )}
                  {hint.type === 'keep' && (
                    <button 
                      onClick={() => store.toggleBeatKeep(enhancedBeats[hint.i].id)}
                      className="text-xs bg-gray-600 text-white px-2 py-1 rounded ml-2 whitespace-nowrap"
                    >
                      Ayrı Tut
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* STORYBOARD */}
        <main className="w-2/3 flex flex-col gap-4">
          <h3 className="font-bold text-lg">Storyboard</h3>
          <div className="flex flex-col gap-3">
            {enhancedBeats.map((beat, i) => {
              const isOverLimit = beat.voSec > plan.max;
              const isKept = beatKeeps[beat.id];
              return (
                <div key={beat.id} className={`border rounded-lg p-4 flex gap-4 bg-white ${isOverLimit && beatMode !== 'Manuel' ? 'border-red-400 border-l-4' : 'border-l-4 border-l-blue-500'}`}>
                  <div className="w-16 h-16 bg-gray-200 rounded shrink-0 flex items-center justify-center text-xs text-gray-500 font-medium">
                    {selectedWorldId || 'World'}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="text-sm font-medium text-gray-800">{beat.text}</div>
                    <div className="flex gap-4 mt-2 text-xs font-mono">
                      <span className="text-gray-500">VO: {beat.voSec}s</span>
                      <span className="text-gray-500">Vis: {beat.visualSec}s</span>
                      <span className="text-blue-600 font-bold">Clip: {beat.clipSec}s</span>
                      {isKept && <span className="text-amber-600 font-bold bg-amber-50 px-1 rounded">BÖLEMEZSİN</span>}
                      {isOverLimit && beatMode !== 'Manuel' && <span className="text-red-600 font-bold bg-red-50 px-1 rounded">OVER LIMIT</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 justify-center shrink-0">
                    <button 
                      onClick={() => store.toggleBeatKeep(beat.id)}
                      className={`text-xs px-2 py-1 border rounded ${isKept ? 'bg-amber-100 border-amber-300 text-amber-800' : 'hover:bg-gray-50'}`}
                    >
                      Keep
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
