import type { Step } from '../store/useStudioStore';

export interface ProductionPulseInput {
  projectTopic: string;
  rawSource: string;
  sourceReport: { ok: boolean; coverage: number } | null;
  selectedWorldId: string;
  selectedPaletteId: string;
  selectedRefIds: string[];
  sceneCount: number;
  scenes: unknown[];
  agentBrief: string;
  agentPackets: unknown | null;
}

export interface ProductionGate {
  id: 'brief' | 'dna' | 'scenes' | 'delivery';
  label: string;
  score: number;
  detail: string;
}

export interface ProductionPulse {
  score: number;
  status: 'BLOCKED' | 'BUILDING' | 'READY';
  gates: ProductionGate[];
  next: { step: Step; label: string; detail: string };
}

const clamp = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

/** A compact, deterministic view of the four gates that lead to an exportable agent packet. */
export function productionPulse(input: ProductionPulseInput): ProductionPulse {
  const hasTopic = input.projectTopic.trim().length > 0;
  const sourceScore = !input.rawSource.trim()
    ? hasTopic ? 100 : 0
    : input.sourceReport?.ok
      ? 100
      : clamp(input.sourceReport?.coverage ?? 0);

  const recipeParts = [
    Boolean(input.selectedWorldId),
    Boolean(input.selectedPaletteId),
    input.selectedRefIds.length > 0,
  ];
  const recipeScore = clamp((recipeParts.filter(Boolean).length / recipeParts.length) * 100);
  const scenePlanScore = input.sceneCount > 0 && sourceScore === 100 && recipeScore === 100 ? 100 : 0;
  const generatedRatio = input.sceneCount > 0 ? input.scenes.length / input.sceneCount : 0;
  const deliveryScore = clamp(
    Math.min(1, generatedRatio) * 70 +
      (input.agentBrief.trim() ? 15 : 0) +
      (input.agentPackets ? 15 : 0),
  );

  const gates: ProductionGate[] = [
    {
      id: 'brief',
      label: 'BRIEF',
      score: sourceScore,
      detail: input.rawSource.trim()
        ? input.sourceReport?.ok ? `Kaynak %${input.sourceReport.coverage}` : 'Kaynak kilidi açık'
        : hasTopic ? 'Konu modu' : 'Konu bekliyor',
    },
    {
      id: 'dna',
      label: 'DNA',
      score: recipeScore,
      detail: recipeScore === 100 ? `${input.selectedRefIds.length} referans kilitli` : `${recipeParts.filter(Boolean).length}/3 kilit`,
    },
    {
      id: 'scenes',
      label: 'PLAN',
      score: scenePlanScore,
      detail: scenePlanScore === 100 ? `${input.sceneCount} sahne hedefi` : 'Önce brief + DNA',
    },
    {
      id: 'delivery',
      label: 'PACK',
      score: deliveryScore,
      detail: input.scenes.length ? `${input.scenes.length}/${input.sceneCount} üretildi` : 'Henüz üretilmedi',
    },
  ];
  const score = clamp(gates.reduce((sum, gate) => sum + gate.score, 0) / gates.length);

  let next: ProductionPulse['next'];
  if (!hasTopic) {
    next = { step: 'dashboard', label: 'Brief’i başlat', detail: 'Önce üretim konusunu netleştir.' };
  } else if (sourceScore < 100) {
    next = { step: 'dashboard', label: 'Kaynak kilidini kapat', detail: 'Kayıpsız ingest ile coverage %100 olmalı.' };
  } else if (recipeScore < 100) {
    const missing = [
      !input.selectedWorldId && 'dünya',
      !input.selectedPaletteId && 'palet',
      input.selectedRefIds.length === 0 && 'DNA',
    ].filter(Boolean).join(' · ');
    next = { step: 'recipe', label: 'Reçeteyi tamamla', detail: `Eksik: ${missing}` };
  } else if (deliveryScore < 100) {
    next = { step: 'timeline', label: input.scenes.length ? 'Paketi yenile' : 'Üretimi ateşle', detail: 'Final brief + ajan paketlerini oluştur.' };
  } else {
    next = { step: 'timeline', label: 'Teslimi aç', detail: 'Tüm üretim kapıları yeşil.' };
  }

  return {
    score,
    status: score === 100 ? 'READY' : score < 50 ? 'BLOCKED' : 'BUILDING',
    gates,
    next,
  };
}
