import { describe, expect, it } from 'vitest';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { buildCommandJSON } from './commandExport';
import { generateBatch, resolveRecipeDefaults } from './pure';

// ============================================================================
// HARD-FIX 2026-07-16 — rapor madde 13/14/15 (jury bağımsızlığı).
// Jüriler Author'ın gördüğü bağlayıcı bağlamı bağımsız görür: world fiziği,
// explicit locks, failure modes. Eskiden Author'ın vaadi jürinin tek gerçeklik
// kaynağıydı — "one world-physics choice" kanıtı world paketini görmeden yalnız
// prompt metninden ölçülüyordu. sceneContextHash yalnız imageAuthor context'ini
// mühürler; bu genişleme mevcut command'leri stale ETMEZ (regresyon testli).
// ============================================================================

async function runnerModule() {
  return import(pathToFileURL(resolve('scripts/mamilas-command.mjs')).href);
}

function fixtureCommand() {
  const defaults = resolveRecipeDefaults('ANIMATION_EDU', 'pixar_3d_edu');
  const generated = generateBatch({
    projectTopic: 'Su Döngüsü', projectClass: 'ANIMATION_EDU', sceneCount: 1, cast: '',
    selectedWorldId: 'pixar_3d_edu', selectedPropId: 'native_world',
    selectedRefIds: defaults.selectedRefIds, selectedPaletteId: 'pastel_soft', selectedMusicId: '',
    imageModel: 'nano_banana_2', videoModel: 'kling_3',
  });
  const state: any = {
    selectedProjectId: 'education', projectTopic: 'Su Döngüsü', projectClass: 'ANIMATION_EDU', sceneCount: 1,
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

describe('jury contextleri bağlayıcı bağlamı bağımsız taşır', () => {
  it('image_jury: world fiziği + explicitLocks + failureModes context içinde', async () => {
    const { roleContext } = await runnerModule();
    const command = fixtureCommand();
    const scene = command.scenes[0];
    const ctx = roleContext(command, scene, [], null, { role: 'image_jury', revision: 0 });
    expect(ctx.world).not.toBeNull();
    expect(ctx.world.renderPhysics).toBeTruthy();
    expect(ctx.world.negativeLock).toBeDefined();
    expect(ctx.explicitLocks).toBeDefined();
    expect(ctx).toHaveProperty('failureModes');
  });

  it('frame_jury: world/medium yasası bağımsız kaynaktan (Author vaadi değil)', async () => {
    const { roleContext } = await runnerModule();
    const command = fixtureCommand();
    const scene = command.scenes[0];
    const ctx = roleContext(command, scene, [], null, { role: 'frame_jury', revision: 0 });
    expect(ctx.world).not.toBeNull();
    expect(ctx.world.renderPhysics).toBeTruthy();
    expect(ctx.explicitLocks).toBeDefined();
  });

  it('motion_jury: explicitLocks + world bağımsız kaynaktan', async () => {
    const { roleContext } = await runnerModule();
    const command = fixtureCommand();
    const scene = command.scenes[0];
    const ctx = roleContext(command, scene, [], null, { role: 'motion_jury', revision: 0 });
    expect(ctx.world).not.toBeNull();
    expect(ctx.explicitLocks).toBeDefined();
  });

  it('REGRESYON: jury context genişlemesi sceneContextHash değiştirmez (command stale olmaz)', async () => {
    const { validateCommand } = await runnerModule();
    const command = fixtureCommand();
    // buildCommandJSON'un mühürlediği hash'ler runner validate'inden geçmeli —
    // jury context'i hash dışıysa bu her zaman PASS kalır.
    const check = await validateCommand(command);
    expect(check.problems).toEqual([]);
    expect(check.ok).toBe(true);
  });
});
