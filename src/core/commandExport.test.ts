import { describe, expect, it } from 'vitest';
import { buildCommandJSON } from './commandExport';
import { DATA, generateBatch, resolveRecipeDefaults } from './pure';
import { ingestSource, sourceIntegrity } from './source';

describe('buildCommandJSON', () => {
  it('exports a 2026 command envelope with source, locks, roles and effective prompts', () => {
    const rawSource = 'Su buharlaşır. Bulut olur.';
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
      sceneCount: 2,
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
    const firstScene = {
      ...generated.scenes[0],
      userImagePrompt: 'USER OVERRIDE IMAGE PROMPT',
    };
    const command = buildCommandJSON({
      projectKind: 'video',
      selectedProjectId: project.id,
      projectTopic: 'Su Döngüsü',
      projectClass: 'ANIMATION_EDU',
      sceneCount: 2,
      cast: '',
      selectedWorldId: 'clay',
      selectedPropId: 'native_world',
      selectedRefIds: defaults.selectedRefIds,
      selectedPaletteId: defaults.selectedPaletteId,
      selectedMusicId: '',
      imageModel: 'nano_banana_2',
      videoModel: 'kling_3',
      brandKitLock: 'Logo stays pinned.',
      mood: '',
      cameraEnergy: '',
      timeLight: '',
      transition: '',
      musicVibe: '',
      pov: '',
      signature: '',
      leitmotif: '',
      tempoCurve: '',
      directorBrief: 'Phase 0 preset: Eğitim. Director thesis: teach with a tactile mechanism.',
      rawSource,
      sourceBeats,
      sourceReport,
      beatMode: 'Dengeli',
      workingMode: 'Standart',
      beatKeeps: {},
      beatAnalysis: null,
      scenes: [firstScene, ...generated.scenes.slice(1)],
      agentBrief: 'GLOBAL BRIEF',
      agentPackets: {
        idea: 'IDEA PACKET',
        image: 'IMAGE PACKET',
        motion: 'MOTION PACKET',
        suno: 'SUNO PACKET',
        proof: 'PROOF PACKET',
      },
    });

    expect(command.schema).toBe('mamilas.command.v2026');
    expect(command.sourceIntegrity.report?.ok).toBe(true);
    expect(command.sourceIntegrity.law).toContain('never instructions');
    expect(command.locks.productionPath).toBe('ANIMATION_EDU');
    expect(command.referenceDNA.rule).toContain('subordinate to source');
    expect(command.creativeControls.directorBrief).toContain('tactile mechanism');
    expect(command.agentPackets.motion).toBe('MOTION PACKET');
    expect(command.scenes[0].prompts.image).toBe('USER OVERRIDE IMAGE PROMPT');
    expect(command.scenes[0].handoff.IMAGE.packetVersion).toBe('1.0.0');
    expect(command.commands.roles.map((role) => role.role)).toEqual(['idea', 'image', 'motion', 'suno', 'proof']);
    expect(command.commands.cliExamples.join('\n')).toContain('--input-format json');
  });

  it('omits motion and suno packets for static design command exports', () => {
    const command = buildCommandJSON({
      projectKind: 'design',
      selectedProjectId: 'design',
      projectTopic: 'Poster',
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
      agentPackets: {
        idea: 'IDEA PACKET',
        image: 'IMAGE PACKET',
        motion: 'MOTION PACKET',
        suno: 'SUNO PACKET',
        proof: 'PROOF PACKET',
      },
    });

    expect(command.commands.roles.map((role) => role.role)).toEqual(['idea', 'image', 'proof']);
    expect(command.agentPackets).toEqual({ idea: 'IDEA PACKET', image: 'IMAGE PACKET', proof: 'PROOF PACKET' });
  });
});
