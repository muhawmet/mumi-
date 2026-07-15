import { afterEach, describe, expect, test, vi } from 'vitest';
import { buildCommandJSON } from './commandExport';
import { canonicalize } from './contract';
import { DATA, generateBatch, resolveRecipeDefaults } from './pure';
import { ingestSource, sourceIntegrity } from './source';

/**
 * CANONICAL HASH — TASK 2 kabul şartı 1 ve 2 (handoff §5).
 *
 * "Stable key order, UTF-8, açık Unicode normalizasyonu, timestamp hariç SHA-256.
 *  Aynı karar aynı byte ve hash'i üretir."
 *
 * Bugünkü kırık (`commandExport.ts:173`): `commandId = sourceHash(topic|generatedAt)`.
 * Bu bir İÇERİK hash'i değil, SAAT türevidir: aynı kararlar aynı kimliği üretmiyor,
 * ve konu dışındaki hiçbir karar (dünya, palet, ref, model, kadro) kimliğe girmiyor.
 */

function decisionState(overrides: { worldId?: string; topic?: string } = {}) {
  const worldId = overrides.worldId ?? 'clay';
  const topic = overrides.topic ?? 'Su Döngüsü';
  const rawSource = 'Su buharlaşır. Bulut olur.';
  const sourceBeats = ingestSource(rawSource);
  const sourceReport = sourceIntegrity(rawSource, sourceBeats);
  const defaults = resolveRecipeDefaults('ANIMATION_EDU', worldId);
  const project =
    DATA.projects.find((item) => item.path === 'ANIMATION_EDU' && item.world === worldId) ?? DATA.projects[0];

  const generated = generateBatch({
    rawSource,
    sourceBeats,
    projectTopic: topic,
    projectClass: 'ANIMATION_EDU',
    sceneCount: 2,
    cast: '',
    selectedWorldId: worldId,
    selectedPropId: 'native_world',
    selectedRefIds: defaults.selectedRefIds,
    selectedPaletteId: defaults.selectedPaletteId,
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
  });
  expect(generated.status).toBe('GENERATED');

  return {
    selectedProjectId: project.id,
    projectTopic: topic,
    projectClass: 'ANIMATION_EDU',
    sceneCount: 2,
    cast: '',
    selectedWorldId: worldId,
    selectedPropId: 'native_world',
    selectedRefIds: defaults.selectedRefIds,
    selectedPaletteId: defaults.selectedPaletteId,
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
    rawSource,
    sourceBeats,
    sourceReport,
    beatMode: 'Dengeli',
    workingMode: 'Standart',
    beatKeeps: {},
    beatAnalysis: null,
    scenes: generated.scenes,
    agentBrief: 'GLOBAL BRIEF',
    agentPackets: {
      idea: 'IDEA PACKET',
      image: 'IMAGE PACKET',
      motion: 'MOTION PACKET',
      suno: 'SUNO PACKET',
      proof: 'PROOF PACKET',
    },
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('Canonical hash — kimlik karardan doğar, saatten değil', () => {
  test('aynı karar farklı saatlerde aynı commandId üretir', () => {
    const state = decisionState();

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const first = buildCommandJSON(state as never);

    vi.setSystemTime(new Date('2027-06-06T12:34:56.000Z'));
    const second = buildCommandJSON(state as never);

    // Saat kaydedilmeye devam eder — ama KİMLİĞE girmez.
    expect(second.generatedAt).not.toBe(first.generatedAt);
    expect(second.commandId).toBe(first.commandId);
  });

  test('karar değişince commandId değişir — kimlik konuya değil, karar setine bağlıdır', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const clay = buildCommandJSON(decisionState({ worldId: 'clay' }) as never);
    const ghibli = buildCommandJSON(decisionState({ worldId: 'ghibli_hayao' }) as never);

    // Konu AYNI ("Su Döngüsü"), dünya farklı. Bugün commandId yalnız konu+saatten
    // türediği için bu iki farklı üretim aynı kimliği taşıyor.
    expect(ghibli.commandId).not.toBe(clay.commandId);
  });
});

describe('Kimlik çakışması — prompt\'u değiştiren her karar kimliği de değiştirmeli', () => {
  test.each([
    ['mood', { mood: 'gerilim' }],
    ['pov', { pov: 'omuz üstü' }],
    ['timeLight', { timeLight: 'gece' }],
    ['cameraEnergy', { cameraEnergy: 'el kamerası' }],
    ['directorBrief', { directorBrief: 'Sert kontrast, tek kaynak ışık.' }],
    ['osTextMode', { osTextMode: 'CLEAN' }],
    ['subject', { subject: 'Buz döngüsü' }],
    ['location', { location: 'Dağ evi mutfağı' }],
  ])('%s değişince commandId değişir', (_label, patch) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const base = decisionState();
    const before = buildCommandJSON(base as never);
    const after = buildCommandJSON({ ...base, ...patch } as never);

    expect(after.commandId).not.toBe(before.commandId);
  });
});

describe('Base decision sınırı — kimliğe ne girer, ne girmez (handoff §5)', () => {
  test('karar; kaynağı, dünyayı, kilitleri ve verilen sözü taşır', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const command = buildCommandJSON(decisionState() as never);

    expect(command.baseDecision.schema).toBe('mamilas.base-decision.v1');
    expect(command.baseDecision.source.rawHash).toBe('0ec597d6');
    // Boşluk dâhil birebir: kaynak bütünlüğü yasası "wording, punctuation and whitespace"
    // diyor. İkinci beat'in baştaki boşluğu KORUNUR — trim edilmez.
    expect(command.baseDecision.source.beats.map((b) => b.exactText)).toEqual([
      'Su buharlaşır.',
      ' Bulut olur.',
    ]);
    expect(command.baseDecision.locks.world).toBe('clay');
    expect(command.baseDecision.locks.productionPath).toBe('ANIMATION_EDU');
    // Verilen söz kararın İÇİNDE yaşar — çıktıya karşı ölçülecek olan budur.
    expect(command.baseDecision.deliveryPromise).toEqual({ kind: 'pedagogy_auto' });
  });

  test('karar; prompt, timestamp ve ajan görevi TAŞIMAZ — kimlik bunlardan kirlenmez', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const command = buildCommandJSON(decisionState() as never);
    const bytes = canonicalize(command.baseDecision);

    // Boş nesne üzerinde "içermiyor" iddiaları boşuna geçmesin.
    expect(bytes.length).toBeGreaterThan(200);
    expect(bytes).not.toContain('generatedAt');
    expect(bytes).not.toContain('2026-01-01');
    expect(bytes).not.toContain('DIRECTOR TASK');
    expect(bytes).not.toContain('IMAGE PACKET');
    // Sahnenin final prompt'u karara girmez: prompt karardan TÜRER, kararı TANIMLAMAZ.
    expect(bytes).not.toContain('Render lock');
  });
});

describe('Şemalar — handoff §5\'in altı kanonik sözleşmesi kuruldu', () => {
  test('altı şema kimliği tanımlı ve base-decision üretimde kullanılıyor', async () => {
    const { SCHEMA_IDS, isSchema } = await import('./contract');
    expect(Object.values(SCHEMA_IDS).sort()).toEqual([
      'mamilas.base-decision.v1',
      'mamilas.closeout.v1',
      'mamilas.decision.v1',
      'mamilas.receipt.v1',
      'mamilas.state.v1',
      'mamilas.storyboard-proposal.v1',
    ]);

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const command = buildCommandJSON(decisionState() as never);
    expect(isSchema(command.baseDecision, SCHEMA_IDS.baseDecision)).toBe(true);
  });
});
