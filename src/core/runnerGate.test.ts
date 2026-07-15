import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';
import { buildCommandJSON } from './commandExport';
import { generateBatch, resolveRecipeDefaults } from './pure';

const REPO = resolve(process.cwd());
const temps: string[] = [];

afterAll(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

function commandFixture() {
  const defaults = resolveRecipeDefaults('ANIMATION_EDU', 'pixar_3d_edu');
  const generated = generateBatch({
    projectTopic: 'Su Döngüsü', projectClass: 'ANIMATION_EDU', sceneCount: 1, cast: '',
    selectedWorldId: 'pixar_3d_edu', selectedPropId: 'native_world',
    selectedRefIds: defaults.selectedRefIds, selectedPaletteId: 'pastel_soft', selectedMusicId: '',
    imageModel: 'nano_banana_2', videoModel: 'kling_3', directorBrief: '',
  });
  const state: any = {
    selectedProjectId: 'education', projectTopic: 'Su Döngüsü', projectClass: 'ANIMATION_EDU', sceneCount: 1,
    cast: '', subject: 'Su Döngüsü', location: '', recipeScenes: [], selectedWorldId: 'pixar_3d_edu',
    selectedPropId: 'native_world', selectedRefIds: defaults.selectedRefIds, selectedPaletteId: 'pastel_soft', selectedMusicId: '',
    imageModel: 'nano_banana_2', videoModel: 'kling_3', brandKitLock: '', mood: '', cameraEnergy: '', timeLight: '',
    transition: '', musicVibe: '', pov: '', signature: '', leitmotif: '', tempoCurve: '', directorBrief: '',
    rawSource: '', sourceBeats: [], sourceReport: null, beatMode: 'Dengeli', workingMode: 'guided', beatKeeps: {}, beatAnalysis: null,
    scenes: generated.scenes, agentBrief: generated.agentBrief, agentPackets: generated.agentPackets,
    osTextMode: 'AUTO', voSyncMode: 'FREE', shotApprovals: {},
  };
  const first = buildCommandJSON(state) as any;
  state.shotApprovals = { 1: { verdict: 'APPROVED', commandId: first.commandId } };
  return buildCommandJSON(state) as any;
}

function stage(files: Record<string, unknown | string>, approve = false) {
  const dir = mkdtempSync(join(REPO, 'agents', '.runner-test-'));
  temps.push(dir);
  cpSync(join(REPO, 'agents', 'runner.mjs'), join(dir, 'runner.mjs'));
  for (const [name, value] of Object.entries(files)) {
    writeFileSync(join(dir, name), typeof value === 'string' ? value : JSON.stringify(value), 'utf8');
  }
  if (approve) {
    const approval = spawnSync(process.execPath, [join(dir, 'runner.mjs'), '--approve-storyboard', '--scene', '1'], {
      cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    });
    if (approval.status !== 0) return { dir, status: approval.status, out: `${approval.stdout ?? ''}${approval.stderr ?? ''}` };
  }
  const run = spawnSync(process.execPath, [join(dir, 'runner.mjs'), '--dry-run'], {
    cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  });
  return { dir, status: run.status, out: `${run.stdout ?? ''}${run.stderr ?? ''}` };
}

describe('cross-platform runner executes the canonical command gate', () => {
  test('a valid command delegates to the lifecycle and reports one next role', () => {
    const result = stage({ 'su_mamilas_command.json': commandFixture() }, true);
    expect(result.status, result.out).toBe(0);
    expect(result.out).toContain('"validation": "PASS"');
    expect(result.out).toContain('"role": "image_author"');
  });

  test('legacy production JSON is non-runnable even when named project.json', () => {
    const result = stage({
      'project.json': { schema: 'mamilas.production.v2026', production: { frameGate: {}, sceneIndex: [] } },
    });
    expect(result.status).toBe(1);
    expect(result.out).toMatch(/unsupported command schema/);
  });

  test('tampered protocol or decision never reaches a provider', () => {
    const command = commandFixture();
    command.lifecycle.protocol.contentHash = '0'.repeat(64);
    const result = stage({ 'bad_mamilas_command.json': command });
    expect(result.status).toBe(1);
    expect(result.out).toMatch(/protocolHash stale\/tampered/);
  });

  test('corrupt JSON fails closed', () => {
    const result = stage({ 'bad_mamilas_command.json': '{not-json' });
    expect(result.status).toBe(1);
    expect(result.out).toMatch(/Unexpected token|JSON/);
  });

  test('empty folder fails closed', () => {
    const result = stage({});
    expect(result.status).toBe(1);
    expect(result.out).toMatch(/command\.json bulunamadı/);
  });

  test('multiple commands without a terminal are never silently resolved', () => {
    const result = stage({
      'one_mamilas_command.json': commandFixture(),
      'two_mamilas_command.json': commandFixture(),
    });
    expect(result.status).toBe(1);
    expect(result.out).toMatch(/sessizce birini seçmiyorum/);
  });

  test('production mirror is byte-identical to the canonical runner', () => {
    expect(readFileSync(join(REPO, 'agents', 'production', 'runner.mjs'), 'utf8'))
      .toBe(readFileSync(join(REPO, 'agents', 'runner.mjs'), 'utf8'));
  });
});
