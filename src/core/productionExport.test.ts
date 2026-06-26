import { describe, expect, it } from 'vitest';
import { buildProductionExport, bundleSlug } from './productionExport';
import { DATA, generateBatch, resolveRecipeDefaults } from './pure';
import { ingestSource, sourceIntegrity } from './source';

function makeVideoState() {
  const rawSource = 'Su buharlaşır. Bulut olur. Yağmur yağar.';
  const sourceBeats = ingestSource(rawSource);
  const sourceReport = sourceIntegrity(rawSource, sourceBeats);
  const defaults = resolveRecipeDefaults('ANIMATION_EDU', 'clay');
  const project = DATA.projects.find((item) => item.path === 'ANIMATION_EDU' && item.world === 'clay') ?? DATA.projects[0];
  const generated = generateBatch({
    projectKind: 'video',
    rawSource,
    sourceBeats,
    projectTopic: 'Su Döngüsü',
    projectClass: 'ANIMATION_EDU',
    sceneCount: 3,
    cast: '',
    selectedWorldId: 'clay',
    selectedPropId: 'native_world',
    selectedRefIds: defaults.selectedRefIds,
    selectedPaletteId: defaults.selectedPaletteId,
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
  });
  expect(generated.status).toBe('GENERATED');

  return {
    projectKind: 'video' as const,
    selectedProjectId: project.id,
    projectTopic: 'Su Döngüsü',
    projectClass: 'ANIMATION_EDU',
    sceneCount: 3,
    cast: '',
    selectedWorldId: 'clay',
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
    beatMode: 'Dengeli' as const,
    workingMode: 'Standart' as const,
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

describe('bundleSlug', () => {
  it('produces a filesystem-safe lowercase slug from a Turkish topic', () => {
    expect(bundleSlug('Su Döngüsü')).toBe('su_dongusu');
    expect(bundleSlug('  Şehir & İklim!  ')).toBe('sehir_iklim');
    expect(bundleSlug('')).toBe('mamilas');
  });
});

describe('buildProductionExport (video)', () => {
  const payload = buildProductionExport(makeVideoState());

  it('wraps the canonical command JSON and adds a production block', () => {
    expect(payload.schema).toBe('mamilas.command.v2026');
    expect(payload.production.schema).toBe('mamilas.production.v2026');
    expect(payload.production.bundle.slug).toBe('su_dongusu');
    expect(payload.production.bundle.sceneCount).toBe(payload.scenes.length);
  });

  it('maps each scene to index-based image and motion files in source order', () => {
    const idx = payload.production.sceneIndex;
    expect(idx.length).toBe(payload.scenes.length);
    idx.forEach((s, i) => {
      const scene = payload.scenes[i];
      expect(s.id).toBe(scene.id);
      expect(s.imageFile).toBe(`images/${scene.id}.png`);
      expect(s.imagePromptFile).toBe(`image_prompts/${scene.id}.txt`);
      expect(s.motionFile).toBe(`motion/${scene.id}.txt`);
      expect(s.motionStatus).toBe('PENDING_IMAGE');
      expect(typeof s.engineWindowSec).toBe('number');
    });
  });

  it('encodes the missing-image and no-image-no-motion laws', () => {
    expect(payload.production.matching.missingPolicy).toContain('report.md');
    expect(payload.production.matching.missingPolicy.toLowerCase()).toContain('never block');
    expect(payload.production.motionGate).toContain('No image, no motion');
  });

  it('carries a single-track music plan with per-scene cues', () => {
    expect(payload.production.music?.mode).toBe('single_track');
    expect(payload.production.music?.file).toBe('suno.txt');
    expect(payload.production.music?.perSceneCues.length).toBe(payload.scenes.length);
  });

  it('lists all three run surfaces (CLI, Claude Project, Custom GPT)', () => {
    const s = payload.production.surfaces;
    expect(s.cli.tools).toContain('Claude Code');
    expect(s.cli.tools).toContain('Codex CLI');
    expect(s.claudeProject.how).toContain('07_PRODUCTION_CLAUDE');
    expect(s.customGpt.how).toContain('07_PRODUCTION_GPT');
  });
});

describe('buildProductionExport (static design)', () => {
  const payload = buildProductionExport({
    projectKind: 'design',
    selectedProjectId: 'design',
    projectTopic: 'Afiş',
    projectClass: 'STYLIZED_PREMIUM',
    sceneCount: 1,
    cast: '',
    selectedWorldId: 'clay',
    selectedPropId: 'native_world',
    selectedRefIds: [],
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
    rawSource: '',
    sourceBeats: [],
    sourceReport: null,
    beatMode: 'Dengeli',
    workingMode: 'Standart',
    beatKeeps: {},
    beatAnalysis: null,
    scenes: [],
    agentBrief: '',
    agentPackets: { idea: 'IDEA', image: 'IMAGE', motion: 'MOTION', suno: 'SUNO', proof: 'PROOF' },
  });

  it('drops motion and music for static design', () => {
    expect(payload.production.music).toBeNull();
    expect(payload.production.motionGate).toContain('no motion');
    expect(payload.production.folderContract['motion/<id>.txt']).toBeNull();
  });
});
