import { describe, it, expect } from 'vitest';
import {
  DATA,
  deriveProductionPath,
  deriveTeachingRecipe,
  validateBriefCompatibility,
  generateBatch,
  groupedRefs,
  groupedWorlds,
  parseSourceInput,
  validateMotion,
  type BriefInput,
  type SurgeryWorld,
} from './pure';
import { ingestSource } from './source';

const baseInput: BriefInput = {
  projectTopic: 'Su Döngüsü',
  projectClass: 'ANIMATION_EDU',
  sceneCount: 5,
  cast: '',
  selectedWorldId: 'clay',
  selectedPropId: 'native_world',
  selectedRefIds: [],
  selectedPaletteId: '',
  selectedMusicId: '',
  imageModel: 'midjourney_v7',
  videoModel: 'kling_2_1',
};

describe('DATA shape', () => {
  it('loads SURGERY_DATA with the expected top-level keys', () => {
    expect(DATA.worlds.length).toBeGreaterThan(20);
    expect(DATA.refs.length).toBeGreaterThan(100);
    expect(DATA.palettes.length).toBeGreaterThan(10);
  });

  it('every world has id + name + render', () => {
    for (const w of DATA.worlds) {
      expect(w.id).toBeTruthy();
      expect(w.name).toBeTruthy();
      expect(w.render).toBeTruthy();
    }
  });

  it('every reference has id + name + cat + use + avoid + dna', () => {
    for (const r of DATA.refs) {
      expect(typeof r.id).toBe('string');
      expect(typeof r.name).toBe('string');
      expect(typeof r.cat).toBe('string');
      expect(typeof r.use).toBe('string');
      expect(typeof r.avoid).toBe('string');
      expect(typeof r.dna).toBe('string');
    }
  });
});

describe('deriveProductionPath', () => {
  it('maps real/commercial inputs to ULTRAREAL_COMMERCIAL', () => {
    expect(deriveProductionPath('ULTRAREAL_COMMERCIAL')).toBe('ULTRAREAL_COMMERCIAL');
    expect(deriveProductionPath('product live action')).toBe('ULTRAREAL_COMMERCIAL');
  });
  it('maps design inputs to STYLIZED_PREMIUM', () => {
    expect(deriveProductionPath('Tasarım İşi')).toBe('STYLIZED_PREMIUM');
    expect(deriveProductionPath('design brief')).toBe('STYLIZED_PREMIUM');
  });
  it('defaults to ANIMATION_EDU for education', () => {
    expect(deriveProductionPath('EĞİTİM_01')).toBe('ANIMATION_EDU');
    expect(deriveProductionPath('')).toBe('ANIMATION_EDU');
  });
});

describe('deriveTeachingRecipe', () => {
  const claysWorld = DATA.worlds.find((w) => w.id === 'clay_diorama') ?? DATA.worlds[0];
  it('honours USER_OVERRIDE when prop != native_world', () => {
    const r = deriveTeachingRecipe(claysWorld, 'paper');
    expect(r).toEqual({ id: 'paper', source: 'USER_OVERRIDE' });
  });
  it('falls back to world-native for non-tactile worlds', () => {
    const cinematic = DATA.worlds.find((w) => w.id === 'cinematic_real') ?? DATA.worlds[0];
    const r = deriveTeachingRecipe(cinematic, 'native_world');
    expect(r.source).toBe('NO_TACTILE_OVERRIDE');
    expect(r.id).toBe('world-native');
  });
});

describe('validateBriefCompatibility', () => {
  const real = (DATA.worlds.find((w) => w.group?.toLowerCase() === 'real') ??
    ({ id: 'cinematic_real', group: 'real', name: '', render: '' } as SurgeryWorld));
  const stylized = DATA.worlds.find((w) => w.id === 'clay') ?? DATA.worlds[0];

  it('PASSes a stylized path + stylized world + world-native recipe', () => {
    const v = validateBriefCompatibility({
      path: 'ANIMATION_EDU',
      world: stylized,
      recipe: { id: 'world-native' },
    });
    expect(v.status).toBe('PASS');
  });

  it('BLOCKS real path with tactile recipe', () => {
    const v = validateBriefCompatibility({
      path: 'ULTRAREAL_COMMERCIAL',
      world: real,
      recipe: { id: 'clay' },
    });
    expect(v.status).toBe('BLOCKED');
    expect(v.findings.some((f) => f.code === 'REGISTER_CONTAMINATION')).toBe(true);
  });

  it('BLOCKS real path with non-real world', () => {
    const v = validateBriefCompatibility({
      path: 'ULTRAREAL_COMMERCIAL',
      world: stylized,
      recipe: { id: 'world-native' },
    });
    expect(v.status).toBe('BLOCKED');
    expect(v.findings.some((f) => f.code === 'WORLD_PATH_MISMATCH')).toBe(true);
  });
});

describe('parseSourceInput', () => {
  it('marks UNSOURCED when no SOURCE prefix', () => {
    const r = parseSourceInput('Su Döngüsü');
    expect(r.status).toBe('UNSOURCED_TOPIC_INPUT');
    expect(r.beats.length).toBe(1);
    expect(r.beats[0].exactText).toBe('Su Döngüsü');
  });
  it('parses SOURCE: prefix with multiple beat lines', () => {
    const r = parseSourceInput('SOURCE:\nilk beat\nikinci beat\nüçüncü');
    expect(r.status).toBe('SOURCE_BOUND');
    expect(r.beats.length).toBe(3);
    expect(r.beats[0].sourceId).toBe('source-001');
    expect(r.beats[2].exactText).toBe('üçüncü');
  });
  it('falls back to UNSOURCED if SOURCE: marker has no usable beat', () => {
    const r = parseSourceInput('SOURCE:\n\n   ');
    expect(r.status).toBe('UNSOURCED_TOPIC_INPUT');
  });
});

describe('generateBatch', () => {
  it('produces sceneCount scenes for a happy-path brief', () => {
    const result = generateBatch(baseInput);
    expect(result.status).toBe('GENERATED');
    expect(result.scenes.length).toBe(5);
  });

  it('is deterministic — same input yields identical fingerprints + image prompts', () => {
    const a = generateBatch(baseInput);
    const b = generateBatch(baseInput);
    expect(a.scenes.map((s) => s.architecture.semanticFingerprint)).toEqual(
      b.scenes.map((s) => s.architecture.semanticFingerprint),
    );
    expect(a.scenes.map((s) => s.imagePrompt)).toEqual(b.scenes.map((s) => s.imagePrompt));
  });

  it('clamps sceneCount to [1, 20]', () => {
    const tooMany = generateBatch({ ...baseInput, sceneCount: 999 });
    expect(tooMany.scenes.length).toBe(20);
    const zero = generateBatch({ ...baseInput, sceneCount: 0 });
    expect(zero.scenes.length).toBe(5); // falsy → default 5 via Number(...) || 5
  });

  it('BLOCKS when world is not selected', () => {
    const result = generateBatch({ ...baseInput, selectedWorldId: '' });
    expect(result.status).toBe('BLOCKED');
    expect(result.contractGate.findings[0].code).toBe('NO_WORLD');
  });

  it('produces 4 pacing phases across a 5-scene batch', () => {
    const result = generateBatch(baseInput);
    const phases = new Set(result.scenes.map((s) => s.phaseName));
    expect(phases.has('Intro')).toBe(true);
    expect(phases.has('Resolution')).toBe(true);
  });

  it('every scene has IMAGE / MOTION / SUNO handoff packets', () => {
    const result = generateBatch(baseInput);
    for (const s of result.scenes) {
      expect(s.handoff.IMAGE.role).toBe('IMAGE');
      expect(s.handoff.MOTION.role).toBe('MOTION');
      expect(s.handoff.SUNO.role).toBe('SUNO');
      expect(s.handoff.IMAGE.packetId).toMatch(/^scene-[0-9a-f]{8}$/);
    }
  });

  it('handoff packets carry the selected target model labels', () => {
    const result = generateBatch({ ...baseInput, imageModel: 'midjourney_v7', videoModel: 'kling_2_1' });
    expect(result.scenes[0].handoff.IMAGE.targetModel.label).toBe('midjourney_v7');
    expect(result.scenes[0].handoff.MOTION.targetModel.label).toBe('kling_2_1');
  });

  it('image prompt locks a provided custom character, and stays character-free when cast is empty', () => {
    const withChar = generateBatch({ ...baseInput, cast: '@mert = 9yo boy, blue sweater, mouth closed' });
    const noChar = generateBatch({ ...baseInput, cast: '' });
    expect(withChar.scenes[0].imagePrompt).toMatch(/@mert/);
    expect(withChar.scenes[0].imagePrompt).toMatch(/Character lock/);
    expect(noChar.scenes[0].imagePrompt).not.toMatch(/Character lock/);
  });

  it('renders a premium style world (arcane) and injects the material axis into the lock', () => {
    const r = generateBatch({ ...baseInput, projectClass: 'EGITIM', selectedWorldId: 'arcane', selectedPropId: 'paper' });
    expect(r.status).toBe('GENERATED');
    const img = r.scenes[0].imagePrompt;
    expect(img).toMatch(/Fortiche|painterly 3D/i);   // arcane render lock present
    expect(img).toMatch(/Material:/);                  // material axis injected
    expect(img).toMatch(/cut-paper|paper/i);           // the chosen material clause
  });

  it('does not inject a material clause for a pure style (none)', () => {
    const r = generateBatch({ ...baseInput, projectClass: 'EGITIM', selectedWorldId: 'arcane', selectedPropId: 'none' });
    expect(r.scenes[0].imagePrompt).not.toMatch(/Material:/);
  });

  it('palette override flags paletteAccent.source as USER_PALETTE', () => {
    const palette = DATA.palettes[0];
    const result = generateBatch({ ...baseInput, selectedPaletteId: palette.id });
    expect(result.scenes[0].finalBrief.paletteAccent.source).toBe('USER_PALETTE');
  });

  it('SOURCE: prefix produces SOURCE_BOUND architecture', () => {
    const result = generateBatch({
      ...baseInput,
      projectTopic: 'SOURCE:\nbeat one\nbeat two',
    });
    expect(result.scenes[0].architecture.source.status).toBe('SOURCE_BOUND');
    expect(result.scenes[0].architecture.source.sourceId).toBe('source-001');
  });

  it('preserves exact source beats when scene count cycles past input beats', () => {
    const result = generateBatch({
      ...baseInput,
      sceneCount: 4,
      projectTopic: 'SOURCE:\nbirinci kaynak\nikinci kaynak',
    });
    expect(result.scenes.map((s) => s.voiceOver)).toEqual([
      'birinci kaynak',
      'ikinci kaynak',
      'birinci kaynak',
      'ikinci kaynak',
    ]);
    expect(result.scenes[2].architecture.source.exactText).toBe('birinci kaynak');
  });

  it('uses the duration guard as the exported scene duration', () => {
    const result = generateBatch({ ...baseInput, projectTopic: 'Kısa kaynak metni' });
    expect(result.scenes[0].durationSec).toBe(result.scenes[0].duration.sec);
  });

  it('propagates the tactile recipe override into final brief and handoff', () => {
    const result = generateBatch({ ...baseInput, selectedPropId: 'paper' });
    expect(result.scenes[0].finalBrief.recipe).toEqual({ id: 'paper', source: 'USER_OVERRIDE' });
    expect(result.scenes[0].handoff.IMAGE.world.recipe).toEqual({ id: 'paper', source: 'USER_OVERRIDE' });
  });

  it('marks motion and music as not applicable for static design deliverables', () => {
    const result = generateBatch({ ...baseInput, projectKind: 'design', sceneCount: 1 });
    const scene = result.scenes[0];
    expect(scene.imagePrompt).toContain('static design');
    expect(scene.imagePrompt).not.toContain('motion-ready start frame');
    expect(scene.motionPrompt).toContain('NOT_APPLICABLE');
    expect(scene.sunoBrief).toContain('NOT_APPLICABLE');
    expect(scene.handoff.MOTION.warnings.some((w) => w.code === 'NOT_APPLICABLE_STATIC_DESIGN')).toBe(true);
    expect(result.agentBrief).toContain('Deliverable: STATIC DESIGN');
  });

  it('all scenes belong to the same projectId/sourceHash', () => {
    const result = generateBatch(baseInput);
    const projectIds = new Set(result.scenes.map((s) => s.handoff.IMAGE.projectId));
    const sourceHashes = new Set(result.scenes.map((s) => s.handoff.IMAGE.sourceHash));
    expect(projectIds.size).toBe(1);
    expect(sourceHashes.size).toBe(1);
  });

  it('uses exact ingested source beats as the generation authority', () => {
    const rawSource = 'İlk cümle.\nİkinci cümle!';
    const sourceBeats = ingestSource(rawSource);
    const result = generateBatch({ ...baseInput, rawSource, sourceBeats, sceneCount: 2 });
    expect(result.status).toBe('GENERATED');
    expect(result.scenes.map((scene) => scene.voiceOver).join('')).toBe(rawSource);
    expect(result.scenes[0].architecture.source.status).toBe('SOURCE_BOUND');
  });

  it('blocks generation when a raw vault has not passed lossless ingest', () => {
    const rawSource = 'İlk cümle. İkinci cümle.';
    const sourceBeats = ingestSource(rawSource).slice(0, 1);
    const result = generateBatch({ ...baseInput, rawSource, sourceBeats });
    expect(result.status).toBe('BLOCKED');
    expect(result.contractGate.findings[0].code).toBe('SOURCE_INTEGRITY_FAIL');
  });

  it('does not truncate a source-bound batch at the manual 20-scene limit', () => {
    const rawSource = Array.from({ length: 24 }, (_, index) => `Beat ${index + 1}.`).join(' ');
    const sourceBeats = ingestSource(rawSource);
    const result = generateBatch({ ...baseInput, rawSource, sourceBeats, sceneCount: 5 });
    expect(result.status).toBe('GENERATED');
    expect(result.scenes).toHaveLength(sourceBeats.length);
    expect(result.scenes.map((scene) => scene.voiceOver).join('')).toBe(rawSource);
  });
});

describe('validateMotion', () => {
  it('passes when motion only adds camera + direction words', () => {
    const img = 'Pixar render of a boy holding a glowing water droplet over a forest stream.';
    const motion = 'Camera slowly dollies forward; the droplet gently moves down toward the stream.';
    const r = validateMotion(img, motion);
    expect(r.ok).toBe(true);
    expect(r.foreign).toEqual([]);
  });

  it('flags foreign content tokens introduced by motion only', () => {
    const img = 'Pixar render of a child holding a glowing water droplet over a forest stream.';
    const motion = 'Dragon appears, breathes fire, palace explodes, neon laser dance, sword duel.';
    const r = validateMotion(img, motion, 3);
    expect(r.ok).toBe(false);
    expect(r.foreign.length).toBeGreaterThan(3);
    expect(r.foreign).toEqual(expect.arrayContaining(['dragon']));
  });

  it('threshold parameter controls strictness', () => {
    const img = 'forest scene';
    const motion = 'extra alien spaceship';
    expect(validateMotion(img, motion, 10).ok).toBe(true);
    expect(validateMotion(img, motion, 0).ok).toBe(false);
  });
});

describe('groupedWorlds / groupedRefs', () => {
  it('groups worlds by their group key', () => {
    const groups = groupedWorlds();
    const flat = Object.values(groups).flat();
    expect(flat.length).toBe(DATA.worlds.length);
  });
  it('groups refs by category', () => {
    const groups = groupedRefs();
    const flat = Object.values(groups).flat();
    expect(flat.length).toBe(DATA.refs.length);
  });
});
