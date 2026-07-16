import { describe, expect, test } from 'vitest';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildCommandJSON } from './commandExport';
import { generateBatch, resolveRecipeDefaults } from './pure';
import { canonicalHash, sha256Hex } from './contract';

// ============================================================================
// HARD-FIX 2026-07-16 — rapor A maddeleri (2026-07-16 Deneme koşusu çöküşü).
// Gerçek olay: sahne 6 jürisi doğru yaratıcı REJECT verdi ama failingCheck/
// targetedFix alanlarını doldurmayıp aynı bilgiyi evidence[0]'a "FAILING CHECK —"
// prefix'iyle yazdı. loadArtifacts o TEK dosyada throw etti → sahne 7-12 hiç
// başlamadı, SAHNE-PROMPTLAR.md oluşmadı, Mami'nin elinde gizli JSON kaldı.
// Yasa: format hatası creative revision DEĞİLDİR; sahne hatası batch'i ÖLDÜRMEZ;
// teslim paketi incremental yazılır.
// ============================================================================

function commandFixture(sceneCount = 3) {
  const defaults = resolveRecipeDefaults('ANIMATION_EDU', 'pixar_3d_edu');
  const generated = generateBatch({
    projectTopic: 'Su Döngüsü', projectClass: 'ANIMATION_EDU', sceneCount, cast: '',
    selectedWorldId: 'pixar_3d_edu', selectedPropId: 'native_world',
    selectedRefIds: defaults.selectedRefIds, selectedPaletteId: 'pastel_soft', selectedMusicId: '',
    imageModel: 'nano_banana_2', videoModel: 'kling_3',
  });
  const state: any = {
    selectedProjectId: 'education', projectTopic: 'Su Döngüsü', projectClass: 'ANIMATION_EDU', sceneCount,
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

function runAt(dir: string, command: any, args: string[]) {
  const file = join(dir, 'sample_mamilas_command.json');
  writeFileSync(file, JSON.stringify(command));
  return spawnSync(process.execPath, [resolve('scripts/mamilas-command.mjs'), '--file', file, ...args], {
    cwd: dir, encoding: 'utf8',
  });
}

function sealed(command: any, sceneId: number, role: string, phase: string, revision: 0 | 1, inputs: string[], content: any) {
  const body = {
    schema: 'mamilas.agent-artifact.v1', protocolVersion: 'mamilas.agent-protocol.v1',
    protocolHash: command.lifecycle.protocol.contentHash, phase, role, provider: 'codex', sceneId,
    decisionHash: command.commandId.replace(/^mamilas-/, ''), storyboardHash: command.lifecycle.storyboardHash,
    inputArtifactHashes: inputs, revision, content,
  };
  return { ...body, contentHash: canonicalHash(body) };
}

function passChain(command: any, sceneId: number, artifactsDir: string) {
  const contextHash = command.lifecycle.sceneContextHashes[sceneId];
  const prompt = `Scene ${sceneId} approved image prompt.`;
  const author = sealed(command, sceneId, 'image_author', 'IMAGE_PROMPT', 0, [contextHash], {
    prompt, promptHash: sha256Hex(prompt),
    interpretation: { dominantSubject: 's', singleEvent: 'e', frozenInstant: 'i' },
    directiveReceipts: [], appliedLocks: ['world'], suppressedContext: [], risks: [],
  });
  const jury = sealed(command, sceneId, 'image_jury', 'IMAGE_JURY', 0, [contextHash, author.contentHash], {
    verdict: 'PASS', evidence: ['counter-read'],
  });
  writeFileSync(join(artifactsDir, `${sceneId}-image_author-r0.json`), JSON.stringify(author));
  writeFileSync(join(artifactsDir, `${sceneId}-image_jury-r0.json`), JSON.stringify(jury));
  return prompt;
}

// GERÇEK ÇÖKÜŞ ARTIFACT'İ — 2026-07-16 Deneme koşusu 6-image_jury-r0.json'un birebir
// deseni: REJECT + alanlar evidence[] içinde prefix'li, failingCheck/targetedFix YOK.
function malformedRejectJury(command: any, sceneId: number, authorHash: string) {
  const contextHash = command.lifecycle.sceneContextHashes[sceneId];
  return sealed(command, sceneId, 'image_jury', 'IMAGE_JURY', 0, [contextHash, authorHash], {
    verdict: 'REJECT',
    evidence: [
      'FAILING CHECK — Decision lock fidelity: timeLight is overcast_doc, but the prompt specifies low natural launch-day sunlight.',
      'TARGETED FIX — Rewrite the light clause to an overcast documentary key; remove the warm daylight accent.',
    ],
  });
}

describe('batch dayanıklılığı — 2026-07-16 çöküşü bir daha yaşanmaz', () => {
  test('KÖK NEDEN 1: jury şablonu REJECT alanlarını görünür taşır', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-tmpl-'));
    const command = commandFixture(1);
    mkdirSync(join(dir, '.mamilas', 'artifacts'), { recursive: true });
    expect(runAt(dir, command, ['--approve-storyboard', '--all-scenes']).status).toBe(0);
    const contextHash = command.lifecycle.sceneContextHashes[1];
    const prompt = 'Scene 1 draft.';
    const author = sealed(command, 1, 'image_author', 'IMAGE_PROMPT', 0, [contextHash], {
      prompt, promptHash: sha256Hex(prompt),
      interpretation: { dominantSubject: 's', singleEvent: 'e', frozenInstant: 'i' },
      directiveReceipts: [], appliedLocks: ['world'], suppressedContext: [], risks: [],
    });
    writeFileSync(join(dir, '.mamilas', 'artifacts', '1-image_author-r0.json'), JSON.stringify(author));
    // Sıradaki rol image_jury — dry-run yine workspace hazırlamaz ama şablon üreticisi
    // modül seviyesinde test edilir:
    return import(require('node:url').pathToFileURL(resolve('scripts/mamilas-command.mjs')).href).then((runner: any) => {
      const template = runner.__testArtifactContentTemplate('image_jury', command, command.scenes[0]);
      expect(template).toHaveProperty('verdict');
      expect(template).toHaveProperty('evidence');
      expect(template).toHaveProperty('failingCheck');
      expect(template).toHaveProperty('targetedFix');
      expect(template).toHaveProperty('factRequired');
    });
  });

  test('KÖK NEDEN 2: malformed REJECT artifact bütün batchi ÖLDÜRMEZ — format-repair devreye girer, creative revision hakkı yanmaz', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-malformed-'));
    const command = commandFixture(3);
    const artifactsDir = join(dir, '.mamilas', 'artifacts');
    mkdirSync(artifactsDir, { recursive: true });
    expect(runAt(dir, command, ['--approve-storyboard', '--all-scenes']).status).toBe(0);

    // Sahne 1: PASS zinciri. Sahne 2: author + MALFORMED reject jury. Sahne 3: boş.
    const prompt1 = passChain(command, 1, artifactsDir);
    const contextHash2 = command.lifecycle.sceneContextHashes[2];
    const prompt2 = 'Scene 2 draft prompt.';
    const author2 = sealed(command, 2, 'image_author', 'IMAGE_PROMPT', 0, [contextHash2], {
      prompt: prompt2, promptHash: sha256Hex(prompt2),
      interpretation: { dominantSubject: 's', singleEvent: 'e', frozenInstant: 'i' },
      directiveReceipts: [], appliedLocks: ['world'], suppressedContext: [], risks: [],
    });
    writeFileSync(join(artifactsDir, '2-image_author-r0.json'), JSON.stringify(author2));
    writeFileSync(join(artifactsDir, '2-image_jury-r0.json'), JSON.stringify(malformedRejectJury(command, 2, author2.contentHash)));

    const result = runAt(dir, command, ['--batch', '--dry-run']);
    // ÇÖKMEZ:
    expect(result.status, result.stderr).toBe(0);
    const out = JSON.parse(result.stdout);
    expect(out.action.kind).toBe('BATCH_REPORT');
    expect(out.scenes).toHaveLength(3);
    // Sahne 1 etkilenmedi:
    expect(out.scenes[0]).toMatchObject({ sceneId: 1, state: 'AWAIT_FRAME', prompt: prompt1 });
    // Sahne 2: malformed jury creative REJECT olarak OKUNUR (format onarımı) →
    // sıradaki adım targeted author r1. Creative revision hakkı format hatasına yanmadı.
    expect(out.scenes[1]).toMatchObject({ sceneId: 2, state: 'RUN_ROLE:image_author' });
    // Sahne 3 hiç etkilenmedi:
    expect(out.scenes[2]).toMatchObject({ sceneId: 3, state: 'RUN_ROLE:image_author' });
  });

  test('ONARILAMAZ artifact yalnız KENDİ sahnesini TECHNICAL_ERROR yapar; diğerleri sürer, paket yine yazılır', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-techerr-'));
    const command = commandFixture(3);
    const artifactsDir = join(dir, '.mamilas', 'artifacts');
    mkdirSync(artifactsDir, { recursive: true });
    expect(runAt(dir, command, ['--approve-storyboard', '--all-scenes']).status).toBe(0);
    const prompt1 = passChain(command, 1, artifactsDir);
    // Sahne 2: tamamen bozuk JSON gövdesi (onarılamaz)
    writeFileSync(join(artifactsDir, '2-image_jury-r0.json'), '{"broken": true, "not-an-artifact"');

    const result = runAt(dir, command, ['--batch', '--dry-run']);
    expect(result.status, result.stderr).toBe(0);
    const out = JSON.parse(result.stdout);
    expect(out.scenes[0]).toMatchObject({ sceneId: 1, state: 'AWAIT_FRAME', prompt: prompt1 });
    // Dry-run rol koşamaz — dürüstçe teknik-retry beklediğini söyler (launch'ta bir kez
    // aynı rol yeniden açılır; ikinci başarısızlık TECHNICAL_ERROR olur).
    expect(out.scenes[1].state).toBe('FORMAT_RETRY_PENDING');
    expect(out.scenes[1].reason).toBeTruthy();
    expect(out.scenes[2]).toMatchObject({ sceneId: 3, state: 'RUN_ROLE:image_author' });
    // Paket yine de yazıldı ve durumları taşıyor:
    const pack = readFileSync(join(dir, '.mamilas', 'SAHNE-PROMPTLAR.md'), 'utf8');
    expect(pack).toContain(prompt1);
    expect(pack).toContain('FORMAT_RETRY_PENDING');
  });

  test('RESUME/IDEMPOTENCY: PASS sahne yeniden koşulmaz — ikinci batch aynı raporu verir, yeni rol türetmez', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-resume-'));
    const command = commandFixture(2);
    const artifactsDir = join(dir, '.mamilas', 'artifacts');
    mkdirSync(artifactsDir, { recursive: true });
    expect(runAt(dir, command, ['--approve-storyboard', '--all-scenes']).status).toBe(0);
    const prompt1 = passChain(command, 1, artifactsDir);

    const first = runAt(dir, command, ['--batch', '--dry-run']);
    expect(first.status).toBe(0);
    const second = runAt(dir, command, ['--batch', '--dry-run']);
    expect(second.status).toBe(0);
    const out1 = JSON.parse(first.stdout);
    const out2 = JSON.parse(second.stdout);
    // Sahne 1 iki koşuda da AWAIT_FRAME — RUN_ROLE'e geri düşmez (usage yakılmaz).
    expect(out1.scenes[0]).toMatchObject({ sceneId: 1, state: 'AWAIT_FRAME', prompt: prompt1 });
    expect(out2.scenes[0]).toMatchObject({ sceneId: 1, state: 'AWAIT_FRAME', prompt: prompt1 });
  });

  test('LAUNCH FORMAT-RETRY UÇTAN UCA: bozuk jury kenara alınır → aynı rol yeniden koşar → PASS → sonraki sahne sürer (2026-07-16 kabul senaryosu 3)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-retry-e2e-'));
    const command = commandFixture(2);
    const artifactsDir = join(dir, '.mamilas', 'artifacts');
    mkdirSync(artifactsDir, { recursive: true });
    const file = join(dir, 'sample_mamilas_command.json');
    writeFileSync(file, JSON.stringify(command));
    expect(runAt(dir, command, ['--approve-storyboard', '--all-scenes']).status).toBe(0);

    // Sahne 1: author hazır + ONARILAMAZ-bozuk jury (verdict alanı hiç yok → repair patch üretemez).
    const contextHash = command.lifecycle.sceneContextHashes[1];
    const prompt1 = 'Scene 1 retry-path prompt.';
    const author1 = sealed(command, 1, 'image_author', 'IMAGE_PROMPT', 0, [contextHash], {
      prompt: prompt1, promptHash: sha256Hex(prompt1),
      interpretation: { dominantSubject: 's', singleEvent: 'e', frozenInstant: 'i' },
      directiveReceipts: [], appliedLocks: ['world'], suppressedContext: [], risks: [],
    });
    writeFileSync(join(artifactsDir, '1-image_author-r0.json'), JSON.stringify(author1));
    writeFileSync(join(artifactsDir, '1-image_jury-r0.json'), JSON.stringify({
      ...sealed(command, 1, 'image_jury', 'IMAGE_JURY', 0, [contextHash, author1.contentHash], {
        evidence: ['counter-read done, verdict alanı unutuldu'],
      }),
    }));

    // Fake provider: SESSION.md hangi rolü istiyorsa geçerli artifact'i mühürler.
    const bin = join(dir, '.bin');
    mkdirSync(bin);
    const runtimeUrl = pathToFileURL(resolve('scripts/mamilas-command.mjs')).href;
    const helper = join(bin, 'fake-codex.mjs');
    writeFileSync(helper, `
      import { readFile, writeFile } from 'node:fs/promises';
      import { join } from 'node:path';
      import { canonicalHash, sha256 } from ${JSON.stringify(runtimeUrl)};
      const root = join(process.cwd(), '.mamilas');
      const template = JSON.parse(await readFile(join(root, 'ARTIFACT_TEMPLATE.json'), 'utf8'));
      const session = await readFile(join(root, 'SESSION.md'), 'utf8');
      const out = session.match(/--out "([^"]+)"/)[1];
      if (template.role === 'image_author') {
        const prompt = 'Scene ' + template.sceneId + ' authored prompt r' + template.revision + '.';
        template.content = {
          prompt, promptHash: sha256(prompt),
          interpretation: { dominantSubject: 's', singleEvent: 'e', frozenInstant: 'i' },
          directiveReceipts: [], appliedLocks: ['world'], suppressedContext: [], risks: [],
        };
      } else {
        template.content = { verdict: 'PASS', evidence: ['stub counter-read'] };
      }
      const { contentHash: _x, ...body } = template;
      const sealedOut = { ...body, contentHash: canonicalHash(body) };
      await writeFile(out, JSON.stringify(sealedOut));
    `, 'utf8');
    let stubPath: string;
    if (process.platform === 'win32') {
      stubPath = join(bin, 'codex.cmd');
      writeFileSync(stubPath, `@echo off\r\n"${process.execPath}" "${helper}"\r\n`, 'utf8');
    } else {
      stubPath = join(bin, 'codex');
      writeFileSync(stubPath, `#!/bin/sh\nexec "${process.execPath}" "${helper}"\n`, 'utf8');
      chmodSync(stubPath, 0o755);
    }

    const result = spawnSync(process.execPath, [
      resolve('scripts/mamilas-command.mjs'), '--file', file, '--batch', '--launch', '--provider', 'codex',
    ], { cwd: dir, encoding: 'utf8', env: { ...process.env, PATH: `${bin}${delimiter}${process.env.PATH}` } });

    expect(result.status, result.stderr).toBe(0);
    const out = JSON.parse(result.stdout);
    // Bozuk jury kenara alındı, jury yeniden koştu (PASS), her iki sahne frame kapısına ulaştı:
    expect(existsSync(join(artifactsDir, '1-image_jury-r0.json.invalid'))).toBe(true);
    expect(out.scenes[0]).toMatchObject({ sceneId: 1, state: 'AWAIT_FRAME' });
    expect(out.scenes[1]).toMatchObject({ sceneId: 2, state: 'AWAIT_FRAME' });
    expect(result.stderr).toMatch(/teknik-retry/);
    // Görünür paket 2 PASS promptu taşıyor:
    const pack = readFileSync(join(dir, 'SAHNE-PROMPTLAR.md'), 'utf8');
    expect(pack).toContain('2 PASS prompt hazır');
  });

  test('MIGRATION: eski protokollü command + workspace migrate edilir; PASS artifactler ve approvallar KORUNUR (usage yakılmaz)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-migrate-'));
    const command = commandFixture(2);
    const artifactsDir = join(dir, '.mamilas', 'artifacts');
    mkdirSync(artifactsDir, { recursive: true });
    expect(runAt(dir, command, ['--approve-storyboard', '--all-scenes']).status).toBe(0);
    const prompt1 = passChain(command, 1, artifactsDir);

    // Protokol evrimini simüle et: command'in protokol hash'ini ESKİ bir değere çevir —
    // sceneContextHash'ler de o eski protokol descriptor'ıyla mühürlenmiş olur.
    const stale = JSON.parse(JSON.stringify(command));
    stale.lifecycle.protocol = { version: 'mamilas.agent-protocol.v1', contentHash: 'a'.repeat(64) };
    // context hash'leri artık uyuşmaz → normal koşu reddeder:
    const rejected = runAt(dir, stale, ['--batch', '--dry-run']);
    const rejectedOut = JSON.parse(rejected.stdout || '{}');
    const rejectedText = `${rejected.stderr}${rejected.stdout}`;
    expect(rejectedText).toMatch(/protocolHash|contextHash|stale/);

    // Migration: command + workspace (approvals resealed, artifacts protocol-resealed).
    const migrated = runAt(dir, stale, ['--migrate-command-context']);
    expect(migrated.status, migrated.stderr).toBe(0);
    const migratedOut = JSON.parse(migrated.stdout);
    expect(migratedOut.action.kind).toBe('COMMAND_CONTEXT_MIGRATED');
    expect(migratedOut.migratedWorkspace.approvals).toBe(2);
    expect(migratedOut.migratedWorkspace.artifacts).toBe(2);

    // Resume: PASS sahne AWAIT_FRAME'de (yeniden koşulmaz), diğeri yazıma hazır.
    const migratedCommand = JSON.parse(readFileSync(join(dir, 'sample_mamilas_command.json'), 'utf8'));
    const resumed = runAt(dir, migratedCommand, ['--batch', '--dry-run']);
    expect(resumed.status, resumed.stderr).toBe(0);
    const out = JSON.parse(resumed.stdout);
    expect(out.scenes[0]).toMatchObject({ sceneId: 1, state: 'AWAIT_FRAME', prompt: prompt1 });
    expect(out.scenes[1]).toMatchObject({ sceneId: 2, state: 'RUN_ROLE:image_author' });
  });

  test('INCREMENTAL TESLİM: paket görünür run klasöründe de yaşar (.mamilas gizli tek kopya değil)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-visible-'));
    const command = commandFixture(2);
    const artifactsDir = join(dir, '.mamilas', 'artifacts');
    mkdirSync(artifactsDir, { recursive: true });
    expect(runAt(dir, command, ['--approve-storyboard', '--all-scenes']).status).toBe(0);
    passChain(command, 1, artifactsDir);
    const result = runAt(dir, command, ['--batch', '--dry-run']);
    expect(result.status).toBe(0);
    // Görünür kopya: command dosyasının yanında (run kökü) — Mami .mamilas açmaz.
    expect(existsSync(join(dir, 'SAHNE-PROMPTLAR.md'))).toBe(true);
    const visible = readFileSync(join(dir, 'SAHNE-PROMPTLAR.md'), 'utf8');
    expect(visible).toContain('Sahne 1');
  });
});
