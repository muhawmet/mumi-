import { describe, expect, it } from 'vitest';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { buildCommandJSON } from './commandExport';
import { generateBatch, resolveRecipeDefaults } from './pure';

// ============================================================================
// HARD-FIX 2026-07-16 — rapor madde 9/10/12 (recurring identity continuity).
// Gerçek Muhammet hikâyesinde sahne 1 ve 2 aynı karakteri ayrı ayrı yeniden icat
// etti; jury PASS verdi — çünkü continuity yalnız ID çifti taşıyordu ve jury
// bağımsız state görmüyordu. continuityState önceki PASS author artifact'inden
// gözlenebilir özet çıkarır; author VE jury aynı gerçeği okur.
// ============================================================================

async function runnerModule() {
  return import(pathToFileURL(resolve('scripts/mamilas-command.mjs')).href);
}

function twoSceneCommand() {
  const defaults = resolveRecipeDefaults('ANIMATION_EDU', 'pixar_3d_edu');
  const generated = generateBatch({
    projectTopic: 'Su Döngüsü', projectClass: 'ANIMATION_EDU', sceneCount: 2, cast: '',
    selectedWorldId: 'pixar_3d_edu', selectedPropId: 'native_world',
    selectedRefIds: defaults.selectedRefIds, selectedPaletteId: 'pastel_soft', selectedMusicId: '',
    imageModel: 'nano_banana_2', videoModel: 'kling_3',
  });
  const state: any = {
    selectedProjectId: 'education', projectTopic: 'Su Döngüsü', projectClass: 'ANIMATION_EDU', sceneCount: 2,
    cast: '', subject: 'Su Döngüsü', location: '', recipeScenes: [], selectedWorldId: 'pixar_3d_edu',
    selectedPropId: 'native_world', selectedRefIds: defaults.selectedRefIds, selectedPaletteId: 'pastel_soft',
    selectedMusicId: '', imageModel: 'nano_banana_2', videoModel: 'kling_3', brandKitLock: '', mood: '',
    cameraEnergy: '', timeLight: '', transition: '', musicVibe: '', pov: '', signature: '', leitmotif: '',
    tempoCurve: '', directorBrief: '', rawSource: '', sourceBeats: [], sourceReport: null,
    beatMode: 'Dengeli', workingMode: 'guided', beatKeeps: {}, beatAnalysis: null,
    scenes: generated.scenes, agentBrief: generated.agentBrief, agentPackets: generated.agentPackets,
    osTextMode: 'AUTO', voSyncMode: 'FREE', shotApprovals: {},
  };
  return buildCommandJSON(state) as any;
}

describe('continuityState — önceki onaylı sahnenin gözlenebilir özeti', () => {
  it('sahne 2 için önceki PASS author artifactinden interpretation + appliedLocks + hash taşır', async () => {
    const { continuityStateFrom, canonicalHash, sha256 } = await runnerModule();
    const command = twoSceneCommand();
    const authorBody = {
      schema: 'mamilas.agent-artifact.v1', protocolVersion: 'mamilas.agent-protocol.v1',
      protocolHash: command.lifecycle.protocol.contentHash, phase: 'IMAGE_PROMPT', role: 'image_author',
      provider: 'codex', sceneId: 1, decisionHash: command.commandId.replace(/^mamilas-/, ''),
      storyboardHash: command.lifecycle.storyboardHash, inputArtifactHashes: [command.lifecycle.sceneContextHashes[1]],
      revision: 0,
      content: {
        prompt: 'A weathered fisherman in a faded blue oilskin coat stands at the pier edge.',
        promptHash: sha256('A weathered fisherman in a faded blue oilskin coat stands at the pier edge.'),
        interpretation: {
          dominantSubject: 'weathered fisherman in faded blue oilskin',
          singleEvent: 'he grips the mooring rope',
          frozenInstant: 'half a second before the rope snaps taut',
        },
        directiveReceipts: [], appliedLocks: ['world', 'palette'], suppressedContext: [], risks: [],
      },
    };
    const author = { ...authorBody, contentHash: canonicalHash(authorBody) };
    const juryBody = {
      ...authorBody, role: 'image_jury', phase: 'IMAGE_JURY',
      inputArtifactHashes: [command.lifecycle.sceneContextHashes[1], author.contentHash],
      content: { verdict: 'PASS', evidence: ['subject, action, place named'] },
    };
    const jury = { ...juryBody, contentHash: canonicalHash(juryBody) };

    const scene2 = command.scenes.find((s: any) => s.id === 2);
    const state = continuityStateFrom(command, scene2, [author, jury]);
    expect(state).not.toBeNull();
    expect(state.sceneId).toBe(1);
    expect(state.sourceArtifactHash).toBe(author.contentHash);
    expect(state.interpretation.dominantSubject).toContain('weathered fisherman');
    expect(state.appliedLocks).toEqual(['world', 'palette']);
    expect(state.law).toMatch(/SAME identity, wardrobe/);
    expect(state.law).toMatch(/FACT_REQUIRED/);
  });

  it('ilk sahne için null (önceki sahne yok) ve PASS yokken null (uydurma özet yok)', async () => {
    const { continuityStateFrom } = await runnerModule();
    const command = twoSceneCommand();
    const scene1 = command.scenes.find((s: any) => s.id === 1);
    const scene2 = command.scenes.find((s: any) => s.id === 2);
    expect(continuityStateFrom(command, scene1, [])).toBeNull();
    expect(continuityStateFrom(command, scene2, [])).toBeNull(); // sahne 1 PASS'sız → özet uydurulmaz
  });
});

describe('rol kartları ve protokol continuity yasasını taşır', () => {
  it('PROTOCOL.md recurring continuity + jury bağımsız state yasasını içerir', async () => {
    const { readFileSync } = await import('node:fs');
    const protocol = readFileSync(resolve('agents/PROTOCOL.md'), 'utf8');
    expect(protocol).toMatch(/continuityState/);
    // Dış dünya gerçeği uydurulmaz; projeye ait kurgusal karakter ise FACT_REQUIRED
    // üretmez, Author kanonik kimlik kartı yazar (2026-07-23 daraltması).
    expect(protocol).toMatch(/UYDURULMAZ/);
    expect(protocol).toMatch(/kurgusal karakter/);
    expect(protocol).toMatch(/`FACT_REQUIRED`\s*\n?\s*ÇIKARILMAZ|FACT_REQUIRED`?\s*ÇIKARILMAZ/);
    expect(protocol).toMatch(/Author'ın risk notundan değil/);
  });

  it('image-author ve image-jury kartları continuityState yasasını taşır', async () => {
    const { readFileSync } = await import('node:fs');
    const author = readFileSync(resolve('agents/roles/image-author.md'), 'utf8');
    const jury = readFileSync(resolve('agents/roles/image-jury.md'), 'utf8');
    expect(author).toMatch(/continuityState/);
    expect(author).toMatch(/SAME identity, wardrobe/);
    expect(jury).toMatch(/continuityState/);
    expect(jury).toMatch(/never against the Author's own risk notes/);
  });
});
