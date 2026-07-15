import { describe, it, expect } from 'vitest';
import { generateBatch, DATA, type BriefInput } from './pure';
import { autoGroupBeats } from './source';
import { buildCommandJSON } from './commandExport';
import { buildProductionExport } from './productionExport';

/**
 * FAZ 2 — T4: FINAL BRIEF nöron-sync + .command EXECUTION REDESIGN.
 *
 * Bankalar T2/T3'te söküldü; site sahne öznesini UYDURMAZ. T4 final brief'i ve
 * .command sözleşmesini "copy verbatim (onaylı prompt)" varsayımından
 * "dominant element'i SEN (Claude) yaz" komisyonuna çevirir:
 *  (A) buildAgentBrief ref ANCHOR'ı verbatim taşır + palet FİZİKSEL IŞIK (ham hex yok)
 *      + scene dossier per-sahne "SCENE BRIEF (you author)" (boş CONCEPT/EVENT satırı yok)
 *  (B) buildCommandJSON contract AUTHOR komisyonu + scenes[].sceneBrief/refDna/paletteLight
 *  (C) productionExport scaffold/agentContract "author" dili (already approved / copy verbatim yok),
 *      MOTION frame-gate korunur.
 *
 * pixar_dimensional ref'i gerçek bir `anchor` alanına sahip → nöron-sync'i ölçebiliriz.
 */

const RAW_SOURCE = [
  'Güneş, denizin yüzeyini ısıtır ve su buharlaşarak gökyüzüne yükselir.',
  'Yükselen buhar soğuk havayla karşılaşınca minik damlacıklara dönüşür.',
  'Bulutlar ağırlaşınca damlalar yağmur olarak toprağa düşer.',
].join('\n');

const REF_IDS = ['pixar_dimensional', 'pixar_emotional_staging'];
const WORLD_ID = 'pixar_3d_edu';

function baseBrief(): BriefInput {
  const beats = autoGroupBeats(RAW_SOURCE, 'Dengeli', 'kling_3');
  return {
    projectTopic: 'Su Döngüsü',
    projectClass: 'ANIMATION_EDU',
    sceneCount: beats.length,
    cast: '',
    selectedWorldId: WORLD_ID,
    selectedPropId: 'native_world',
    selectedRefIds: REF_IDS,
    selectedPaletteId: '',
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
    rawSource: RAW_SOURCE,
    sourceBeats: beats,
  };
}

function generated() {
  const result = generateBatch(baseBrief());
  expect(result.status).toBe('GENERATED');
  if (result.status !== 'GENERATED') throw new Error('not generated');
  return result;
}

function commandState() {
  const g = generated();
  const beats = autoGroupBeats(RAW_SOURCE, 'Dengeli', 'kling_3');
  return {
    selectedProjectId: DATA.projects[0].id,
    projectTopic: 'Su Döngüsü',
    projectClass: 'ANIMATION_EDU',
    sceneCount: beats.length,
    cast: '',
    selectedWorldId: WORLD_ID,
    selectedPropId: 'native_world',
    selectedRefIds: REF_IDS,
    selectedPaletteId: '',
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
    brandKitLock: '',
    mood: '',
    cameraEnergy: '',
    timeLight: '',
    transition: '',
    musicVibe: '',
    pov: '',
    signature: '',
    leitmotif: '',
    tempoCurve: '',
    directorBrief: '',
    rawSource: RAW_SOURCE,
    sourceBeats: beats,
    sourceReport: null,
    beatMode: 'Dengeli' as const,
    workingMode: 'Standart' as const,
    beatKeeps: {},
    beatAnalysis: null,
    scenes: g.scenes,
    agentBrief: g.agentBrief ?? '',
    agentPackets: g.agentPackets ?? { idea: '', image: '', motion: '', suno: '', proof: '' },
  };
}

describe('T4-A — buildAgentBrief nöron-sync (anchor verbatim + palet ışık + hex yok)', () => {
  it('ref ANCHOR verbatim + "ANCHOR:" etiketiyle Reference Contributions içinde geçer', () => {
    const brief = generated().agentBrief;
    const ref = DATA.refs.find((r) => r.id === 'pixar_dimensional')!;
    const anchor = ref.anchor ?? '';
    expect(anchor.length, 'test ref anchorsuz').toBeGreaterThan(20);
    // Verbatim ref anchor Claude'a ulaşır (nöron-sync).
    expect(brief, 'ref anchor verbatim yok').toContain(anchor);
    expect(brief, 'Reference Contributions ANCHOR etiketi yok').toContain(`ANCHOR: ${anchor}`);
  });

  it('§5 palet fiziksel ışık dili taşır ve HAM HEX (#RRGGBB) sızdırmaz', () => {
    const brief = generated().agentBrief;
    expect(brief, 'brief ham hex sızdırdı').not.toMatch(/#[0-9a-fA-F]{6}/);
    expect(brief).toContain('Palette as Light (physical light — no raw hex)');
    // Fiziksel ışık davranış dili (paletteLightPrompt çıktısı).
    expect(brief).toMatch(/read as|light behaviour|warm|cool|deep|near-white|lifted/i);
  });
});

describe('T4-A — scene dossier per-sahne SCENE BRIEF (Claude authoring)', () => {
  it('per-sahne "SCENE BRIEF (you author" + verbatim SOURCE taşır; boş CONCEPT/EVENT satırı yok', () => {
    const brief = generated().agentBrief;
    // The authoring commission is stated ONCE, above the dossier — repeating it verbatim under
    // all five scenes buried the only lines that actually differ (phase, framing, composition,
    // light variant). Same guarantee, stated where it is read.
    expect(brief).toContain('YOU AUTHOR THE DOMINANT ELEMENT');
    expect(brief).toMatch(/the site never invents the subject/i);
    expect(brief).toContain('SOURCE (exact, untouchable):');
    // And the per-shot decisions the site DID make must reach the agent.
    expect(brief, 'sahne fazı brief\'e geçmiyor').toMatch(/\nPHASE: /);
    expect(brief, 'kompozisyon kalıbı brief\'e geçmiyor').toMatch(/\nCOMPOSITION: /);
    // Boş concept kalıntısı satırları kalmadı.
    expect(brief, 'boş CONCEPT satırı hâlâ var').not.toMatch(/\nCONCEPT: *(\n|$)/);
    expect(brief, 'boş EVENT satırı hâlâ var').not.toMatch(/\nEVENT: *(\n|$)/);
    expect(brief).not.toContain('source-anchored bridge concept');
    // Kaynak beat verbatim dossier'de.
    const firstBeat = RAW_SOURCE.split('\n')[0];
    expect(brief).toContain(firstBeat);
  });
});

describe('T4-B — buildCommandJSON contract AUTHOR komisyonu + per-sahne alanlar', () => {
  it('contract "dominant element yaz/author" der, "copy verbatim image/prompt" DEMEZ', () => {
    const cmd = buildCommandJSON(commandState());
    const contract = cmd.commands.contract.join('\n');
    expect(contract, 'author komisyonu yok').toMatch(/dominant element[^.]*(yaz|write|author)/i);
    expect(contract, 'hâlâ copy-verbatim image varsayımı').not.toMatch(/copy[^.\n]*verbatim[^.\n]*(image|prompt)/i);
  });

  it('scenes[0] sceneBrief (verbatim kaynak) + refDna (anchor·dna) + paletteLight (hex yok) taşır', () => {
    const cmd = buildCommandJSON(commandState());
    const s0 = cmd.scenes[0] as any;
    expect(s0.sceneBrief, 'sceneBrief yok').toBeTruthy();
    expect(s0.sceneBrief).toBe(s0.prompts.voiceOver);
    expect(typeof s0.refDna, 'refDna string değil').toBe('string');
    const ref = DATA.refs.find((r) => r.id === 'pixar_dimensional')!;
    expect(s0.refDna, 'refDna ref anchor taşımıyor').toContain(ref.anchor ?? '');
    expect(s0.paletteLight, 'paletteLight yok').toBeTruthy();
    expect(s0.paletteLight, 'paletteLight ham hex sızdırdı').not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});

describe('T4-C — productionExport scaffold AUTHOR dili + MOTION frame-gate korunur', () => {
  it('scaffold/agentContract "already approved"/"copy verbatim" DEMEZ, "author" der', () => {
    const prod = buildProductionExport(commandState());
    const text = [...prod.production.scaffold, ...prod.production.agentContract].join('\n');
    expect(text, 'hâlâ already-approved copy-verbatim').not.toMatch(/already approved/i);
    expect(text).not.toMatch(/copy[^.\n]*verbatim/i);
    expect(text, 'author komisyonu yok').toMatch(/author/i);
  });

  it('MOTION frame-gate (no image no motion) DOKUNULMADAN korunur', () => {
    const prod = buildProductionExport(commandState());
    expect(prod.production.motionGate).toContain('No image, no motion');
    const idx = prod.production.sceneIndex[0] as any;
    expect(idx.motionStatus).toBe('PENDING_IMAGE');
  });
});
