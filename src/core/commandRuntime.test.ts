import { describe, expect, test } from 'vitest';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildCommandJSON } from './commandExport';
import { generateBatch, resolveRecipeDefaults } from './pure';

function commandFixture(approved = true) {
  const defaults = resolveRecipeDefaults('ANIMATION_EDU', 'pixar_3d_edu');
  const generated = generateBatch({
    projectTopic: 'Su Döngüsü', projectClass: 'ANIMATION_EDU', sceneCount: 1, cast: '',
    selectedWorldId: 'pixar_3d_edu', selectedPropId: 'native_world',
    selectedRefIds: defaults.selectedRefIds, selectedPaletteId: 'pastel_soft', selectedMusicId: '',
    imageModel: 'nano_banana_2', videoModel: 'kling_3', directorBrief: 'Başlık yalnız final sahnede olsun.',
  });
  const state: any = {
    selectedProjectId: 'education', projectTopic: 'Su Döngüsü', projectClass: 'ANIMATION_EDU', sceneCount: 1,
    cast: '', subject: 'Su Döngüsü', location: '', recipeScenes: [], selectedWorldId: 'pixar_3d_edu',
    selectedPropId: 'native_world', selectedRefIds: defaults.selectedRefIds, selectedPaletteId: 'pastel_soft', selectedMusicId: '',
    imageModel: 'nano_banana_2', videoModel: 'kling_3', brandKitLock: '', mood: '', cameraEnergy: '', timeLight: '',
    transition: '', musicVibe: '', pov: '', signature: '', leitmotif: '', tempoCurve: '', directorBrief: 'Başlık yalnız final sahnede olsun.',
    rawSource: '', sourceBeats: [], sourceReport: null, beatMode: 'Dengeli', workingMode: 'guided', beatKeeps: {}, beatAnalysis: null,
    scenes: generated.scenes, agentBrief: generated.agentBrief, agentPackets: generated.agentPackets,
    osTextMode: 'AUTO', voSyncMode: 'FREE', shotApprovals: {},
  };
  const first = buildCommandJSON(state) as any;
  if (approved) state.shotApprovals = { 1: { verdict: 'APPROVED', commandId: first.commandId } };
  return buildCommandJSON(state) as any;
}

function run(command: any) {
  const dir = mkdtempSync(join(tmpdir(), 'mamilas-command-'));
  const file = join(dir, 'sample_mamilas_command.json');
  writeFileSync(file, JSON.stringify(command));
  const script = resolve('scripts/mamilas-command.mjs');
  return spawnSync(process.execPath, [script, '--file', file, '--dry-run', '--provider', 'codex'], { cwd: resolve('.'), encoding: 'utf8' });
}

describe('interactive command runtime', () => {
  test('valid command → next image_author; minimum context site promptunu taşımaz', () => {
    const result = run(commandFixture());
    expect(result.status, result.stderr).toBe(0);
    const out = JSON.parse(result.stdout);
    expect(out.validation).toBe('PASS');
    expect(out.action).toEqual({ kind: 'RUN_ROLE', role: 'image_author', revision: 0 });
    expect(out.contextSummary.containsSiteGeneratedPrompt).toBe(false);
    expect(out.protocolHash).toMatch(/^[0-9a-f]{64}$/);
  });

  test('storyboard onayı yoksa provider açmaz; approval bekler', () => {
    const result = run(commandFixture(false));
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout).action.kind).toBe('AWAIT_STORYBOARD_APPROVAL');
  });

  test('tampered decision ve protocol hash reddedilir', () => {
    const decision = commandFixture();
    decision.baseDecision.locks.topic = 'TAMPER';
    const badDecision = run(decision);
    expect(badDecision.status).not.toBe(0);
    expect(badDecision.stderr).toMatch(/commandId\/baseDecision hash/);

    const protocol = commandFixture();
    protocol.lifecycle.protocol.contentHash = '0'.repeat(64);
    const badProtocol = run(protocol);
    expect(badProtocol.status).not.toBe(0);
    expect(badProtocol.stderr).toMatch(/protocolHash/);
  });

  test('Claude/Codex adapters share evidence surface and copy no protocol body', () => {
    const claude = readFileSync(resolve('agents/adapters/claude.md'), 'utf8');
    const codex = readFileSync(resolve('agents/adapters/codex.md'), 'utf8');
    for (const adapter of [claude, codex]) {
      expect(adapter).toContain('PROTOCOL.md');
      expect(adapter).toContain('artifact');
      expect(adapter).toMatch(/Do not start another|başka rol/i);
      expect(adapter).not.toContain('PASS | REJECT | FACT_REQUIRED');
    }
  });

  test('interactive oturum sonrası tam bir yeni role/provider artifact yeniden doğrulanır', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-session-'));
    const file = join(dir, 'sample_mamilas_command.json');
    writeFileSync(file, JSON.stringify(commandFixture()));
    const bin = join(dir, '.bin');
    mkdirSync(bin);
    const helper = join(bin, 'fake-codex.mjs');
    const runtimeUrl = pathToFileURL(resolve('scripts/mamilas-command.mjs')).href;
    writeFileSync(helper, `
      import { readFile, writeFile } from 'node:fs/promises';
      import { join } from 'node:path';
      import { canonicalHash } from ${JSON.stringify(runtimeUrl)};
      const root = join(process.cwd(), '.mamilas');
      const template = JSON.parse(await readFile(join(root, 'ARTIFACT_TEMPLATE.json'), 'utf8'));
      template.content = { prompt: 'provider-authored prompt' };
      const sealed = { ...template, contentHash: canonicalHash(template) };
      await writeFile(join(root, 'artifacts', '1-image_author-r0.json'), JSON.stringify(sealed));
    `, 'utf8');
    if (process.platform === 'win32') {
      writeFileSync(join(bin, 'codex.cmd'), `@echo off\r\n"${process.execPath}" "%~dp0fake-codex.mjs"\r\n`, 'utf8');
    } else {
      const stub = join(bin, 'codex');
      writeFileSync(stub, `#!/bin/sh\nexec "${process.execPath}" "${helper}"\n`, 'utf8');
      chmodSync(stub, 0o755);
    }

    const result = spawnSync(process.execPath, [
      resolve('scripts/mamilas-command.mjs'), '--file', file, '--launch', '--provider', 'codex',
    ], {
      cwd: dir,
      encoding: 'utf8',
      env: { ...process.env, PATH: `${bin}${delimiter}${process.env.PATH ?? ''}` },
    });
    expect(result.status, result.stderr).toBe(0);
    const artifact = JSON.parse(readFileSync(join(dir, '.mamilas', 'artifacts', '1-image_author-r0.json'), 'utf8'));
    expect(artifact.role).toBe('image_author');
    expect(artifact.provider).toBe('codex');
    expect(artifact.sceneId).toBe(1);
    expect(artifact.contentHash).toMatch(/^[0-9a-f]{64}$/);
  });
});
