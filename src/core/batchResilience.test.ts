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

// REJECT→revize→PASS zinciri: author-r0 → jury-r0(REJECT) → author-r1 → jury-r1(PASS).
// Mami'nin her REJECT'ten sonra girdiği yol. Migration'ın r1 input-zincirini doğru
// remap ettiğini kanıtlamak için (garanti denetçi BULGU 1).
function passChainR1(command: any, sceneId: number, artifactsDir: string) {
  const ch = command.lifecycle.sceneContextHashes[sceneId];
  const p0 = `Scene ${sceneId} draft.`;
  const a0 = sealed(command, sceneId, 'image_author', 'IMAGE_PROMPT', 0, [ch], {
    prompt: p0, promptHash: sha256Hex(p0),
    interpretation: { dominantSubject: 's', singleEvent: 'e', frozenInstant: 'i' },
    directiveReceipts: [], appliedLocks: ['world'], suppressedContext: [], risks: [],
  });
  const j0 = sealed(command, sceneId, 'image_jury', 'IMAGE_JURY', 0, [ch, a0.contentHash], {
    verdict: 'REJECT', failingCheck: 'ışık', targetedFix: 'anahtar ışığı yeniden yaz', evidence: ['cr'],
  });
  const p1 = `Scene ${sceneId} revised prompt.`;
  const a1 = sealed(command, sceneId, 'image_author', 'IMAGE_PROMPT', 1, [ch, a0.contentHash, j0.contentHash], {
    prompt: p1, promptHash: sha256Hex(p1),
    interpretation: { dominantSubject: 's', singleEvent: 'e', frozenInstant: 'i' },
    directiveReceipts: [], appliedLocks: ['world'], suppressedContext: [], risks: [],
  });
  const j1 = sealed(command, sceneId, 'image_jury', 'IMAGE_JURY', 1, [ch, a1.contentHash], {
    verdict: 'PASS', evidence: ['cr'],
  });
  writeFileSync(join(artifactsDir, `${sceneId}-image_author-r0.json`), JSON.stringify(a0));
  writeFileSync(join(artifactsDir, `${sceneId}-image_jury-r0.json`), JSON.stringify(j0));
  writeFileSync(join(artifactsDir, `${sceneId}-image_author-r1.json`), JSON.stringify(a1));
  writeFileSync(join(artifactsDir, `${sceneId}-image_jury-r1.json`), JSON.stringify(j1));
  return p1; // r1 author'ın promptu (frame ona bağlanır)
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

  test('F-A1: migration Mami\'nin ONAYLADIĞI kareyi ÖLDÜRMEZ — frame receipt author-hash remap edilir', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-frame-migrate-'));
    const command = commandFixture(1);
    const artifactsDir = join(dir, '.mamilas', 'artifacts');
    mkdirSync(artifactsDir, { recursive: true });
    expect(runAt(dir, command, ['--approve-storyboard', '--all-scenes']).status).toBe(0);
    passChain(command, 1, artifactsDir);

    // Gerçek 1×1 PNG import + APPROVE — Mami'nin onayladığı kare.
    const pngPath = join(dir, 'frame.png');
    writeFileSync(pngPath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'));
    const imported = runAt(dir, command, ['--import-frame', pngPath, '--scene', '1', '--verdict', 'APPROVE']);
    expect(imported.status, imported.stderr).toBe(0);

    // Frame kurulunca resume frame_jury bekler (kare gerçekten bağlı):
    const before = JSON.parse(runAt(dir, command, ['--batch', '--dry-run']).stdout);
    expect(before.scenes[0].state).toBe('RUN_ROLE:frame_jury');
    const authorBefore = JSON.parse(readFileSync(join(artifactsDir, '1-image_author-r0.json'), 'utf8')).contentHash;
    const frameBefore = JSON.parse(readFileSync(join(dir, '.mamilas', 'frames', '1.json'), 'utf8')).fromImagePromptArtifactHash;
    expect(frameBefore).toBe(authorBefore); // bağ sağlam

    // Protokol evrimi → migration author contentHash'ini DEĞİŞTİRİR. Gerçek "eski workspace":
    // command VE artifact'ler VE frame receipt hepsi eski protokolde mühürlü. protocolHash
    // artifact contentHash'inin parçası olduğundan, migration protocolHash'i güncelleyince
    // author contentHash gerçekten değişir — frame receipt remap edilmezse orphan kalır.
    const OLD = 'a'.repeat(64);
    const stale = JSON.parse(JSON.stringify(command));
    stale.lifecycle.protocol = { version: 'mamilas.agent-protocol.v1', contentHash: OLD };
    const staleArtifacts = ['1-image_author-r0.json', '1-image_jury-r0.json'];
    const oldToNewChain = new Map<string, string>();
    for (const name of staleArtifacts) {
      const p = join(artifactsDir, name);
      const art = JSON.parse(readFileSync(p, 'utf8'));
      const oldContent = art.contentHash;
      art.protocolHash = OLD;
      art.inputArtifactHashes = art.inputArtifactHashes.map((h: string) => oldToNewChain.get(h) ?? h);
      const { contentHash: _d, ...body } = art;
      art.contentHash = canonicalHash(body);
      oldToNewChain.set(oldContent, art.contentHash);
      writeFileSync(p, JSON.stringify(art));
    }
    // Frame receipt de eski author contentHash'ini tutsun (gerçek eski workspace):
    const framePath = join(dir, '.mamilas', 'frames', '1.json');
    const fr = JSON.parse(readFileSync(framePath, 'utf8'));
    fr.fromImagePromptArtifactHash = oldToNewChain.get(authorBefore)!;
    const { contentHash: _fd, ...frBody } = fr;
    fr.contentHash = canonicalHash(frBody);
    writeFileSync(framePath, JSON.stringify(fr));

    const migrated = runAt(dir, stale, ['--migrate-command-context']);
    expect(migrated.status, migrated.stderr).toBe(0);
    const mout = JSON.parse(migrated.stdout);
    // FIX: frame receipt de taşındı (0 değil).
    expect(mout.migratedWorkspace.frames).toBe(1);

    const authorAfter = JSON.parse(readFileSync(join(artifactsDir, '1-image_author-r0.json'), 'utf8')).contentHash;
    const frameAfter = JSON.parse(readFileSync(join(dir, '.mamilas', 'frames', '1.json'), 'utf8')).fromImagePromptArtifactHash;
    expect(authorAfter).not.toBe(oldToNewChain.get(authorBefore)); // author gerçekten yeniden mühürlendi
    expect(frameAfter).toBe(authorAfter);       // frame bağı YENİ author'a remap edildi (KÖK FIX)

    // Resume: kare ÖLMEDİ — hâlâ frame_jury bekliyor, "frame prompt bağı stale" fırlatmıyor.
    const migratedCommand = JSON.parse(readFileSync(join(dir, 'sample_mamilas_command.json'), 'utf8'));
    const resumed = runAt(dir, migratedCommand, ['--batch', '--dry-run']);
    expect(resumed.status, resumed.stderr).toBe(0);
    const out = JSON.parse(resumed.stdout);
    expect(out.scenes[0].state).toBe('RUN_ROLE:frame_jury');
    expect(out.scenes[0].reason ?? '').not.toMatch(/frame prompt bağı stale/);
  });

  test('F-A1 BULGU1: REJECT sonrası (r1-revizyon) sahnede de migration kareyi ÖLDÜRMEZ — r1 input zinciri doğru remap', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-r1-migrate-'));
    const command = commandFixture(2);
    const artifactsDir = join(dir, '.mamilas', 'artifacts');
    mkdirSync(artifactsDir, { recursive: true });
    expect(runAt(dir, command, ['--approve-storyboard', '--all-scenes']).status).toBe(0);
    passChain(command, 1, artifactsDir);            // sahne 1: r0 PASS
    const r1prompt = passChainR1(command, 2, artifactsDir); // sahne 2: REJECT→r1 PASS

    // Sahne 2'ye r1 author'a bağlı gerçek APPROVE kare:
    const pngB64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    const pngPath = join(dir, 'frame.png');
    writeFileSync(pngPath, Buffer.from(pngB64, 'base64'));
    expect(runAt(dir, command, ['--import-frame', pngPath, '--scene', '2', '--verdict', 'APPROVE']).status).toBe(0);
    const before2 = JSON.parse(runAt(dir, command, ['--batch', '--dry-run']).stdout);
    expect(before2.scenes[1].state).toBe('RUN_ROLE:frame_jury'); // r1 kare bağlı

    // Eski protokolde mühürle (command + tüm artifact + frame) — gerçek eski workspace:
    const OLD = 'a'.repeat(64);
    const stale = JSON.parse(JSON.stringify(command));
    stale.lifecycle.protocol = { version: 'mamilas.agent-protocol.v1', contentHash: OLD };
    const chain = new Map<string, string>();
    for (const name of ['1-image_author-r0.json', '1-image_jury-r0.json',
      '2-image_author-r0.json', '2-image_jury-r0.json', '2-image_author-r1.json', '2-image_jury-r1.json']) {
      const p = join(artifactsDir, name);
      const art = JSON.parse(readFileSync(p, 'utf8'));
      const old = art.contentHash;
      art.protocolHash = OLD;
      art.inputArtifactHashes = art.inputArtifactHashes.map((h: string) => chain.get(h) ?? h);
      const { contentHash: _d, ...b } = art;
      art.contentHash = canonicalHash(b);
      chain.set(old, art.contentHash);
      writeFileSync(p, JSON.stringify(art));
    }
    // Sahne 2 frame receipt r1 author'ın eski hash'ini tutsun:
    const fp = join(dir, '.mamilas', 'frames', '2.json');
    const fr = JSON.parse(readFileSync(fp, 'utf8'));
    const a1old = JSON.parse(readFileSync(join(artifactsDir, '2-image_author-r1.json'), 'utf8'));
    // (fr zaten r1'e bağlıydı; eski hash'e çevrilmiş r1'in hash'i chain'de)
    fr.fromImagePromptArtifactHash = a1old.contentHash;
    const { contentHash: _fd, ...frB } = fr;
    fr.contentHash = canonicalHash(frB);
    writeFileSync(fp, JSON.stringify(fr));

    const migrated = runAt(dir, stale, ['--migrate-command-context']);
    expect(migrated.status, migrated.stderr).toBe(0);

    // KRİTİK: resume'da sahne 2 (r1 + kare) TECHNICAL_ERROR değil, hâlâ frame_jury bekliyor.
    const migratedCommand = JSON.parse(readFileSync(join(dir, 'sample_mamilas_command.json'), 'utf8'));
    const resumed = JSON.parse(runAt(dir, migratedCommand, ['--batch', '--dry-run']).stdout);
    expect(resumed.scenes[1].state, JSON.stringify(resumed.scenes[1])).toBe('RUN_ROLE:frame_jury');
    expect(resumed.scenes[1].reason ?? '').not.toMatch(/zinciri uyuşmuyor|stale/);
  });

  test('G1: migration frame_jury artifact zincirini de taşır — kareli+jürili sahne kilitlenmez (ordu KÖK-A)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-g1-'));
    const command = commandFixture(1);
    const artifactsDir = join(dir, '.mamilas', 'artifacts');
    mkdirSync(artifactsDir, { recursive: true });
    expect(runAt(dir, command, ['--approve-storyboard', '--all-scenes']).status).toBe(0);
    passChain(command, 1, artifactsDir);
    const pngB64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    const pngPath = join(dir, 'frame.png');
    writeFileSync(pngPath, Buffer.from(pngB64, 'base64'));
    expect(runAt(dir, command, ['--import-frame', pngPath, '--scene', '1', '--verdict', 'APPROVE']).status).toBe(0);

    // frame_jury PASS artifact ekle — input'unda frame receipt'in contentHash'i gömülü.
    const ctx = command.lifecycle.sceneContextHashes[1];
    const author = JSON.parse(readFileSync(join(artifactsDir, '1-image_author-r0.json'), 'utf8'));
    const jury = JSON.parse(readFileSync(join(artifactsDir, '1-image_jury-r0.json'), 'utf8'));
    const frame = JSON.parse(readFileSync(join(dir, '.mamilas', 'frames', '1.json'), 'utf8'));
    const fjInputs = [ctx, author.contentHash, jury.contentHash, frame.contentHash];
    const fj = sealed(command, 1, 'frame_jury', 'FRAME_JURY', 0, fjInputs, { verdict: 'PASS', frameHash: frame.frameHash, evidence: ['cr'] });
    writeFileSync(join(artifactsDir, '1-frame_jury-r0.json'), JSON.stringify(fj));
    // Motion açık olmalı (frame_jury PASS):
    const before = JSON.parse(runAt(dir, command, ['--batch', '--dry-run']).stdout);
    expect(before.scenes[0].state).toBe('RUN_ROLE:motion_author');

    // Eski protokolde mühürle (command + tüm artifact + frame receipt) — gerçek eski workspace.
    const OLD = 'a'.repeat(64);
    const stale = JSON.parse(JSON.stringify(command));
    stale.lifecycle.protocol = { version: 'mamilas.agent-protocol.v1', contentHash: OLD };
    const chain = new Map<string, string>();
    // Sıra: image author→jury, sonra frame_jury (frame receipt contentHash chain'e girecek).
    for (const name of ['1-image_author-r0.json', '1-image_jury-r0.json']) {
      const p = join(artifactsDir, name); const a = JSON.parse(readFileSync(p, 'utf8')); const old = a.contentHash;
      a.protocolHash = OLD; a.inputArtifactHashes = a.inputArtifactHashes.map((h: string) => chain.get(h) ?? h);
      const { contentHash: _d, ...b } = a; a.contentHash = canonicalHash(b); chain.set(old, a.contentHash); writeFileSync(p, JSON.stringify(a));
    }
    // frame receipt eski author yeni hash + eski→yeni receipt hash chain'e:
    const fp = join(dir, '.mamilas', 'frames', '1.json'); const fr = JSON.parse(readFileSync(fp, 'utf8')); const oldFr = fr.contentHash;
    fr.fromImagePromptArtifactHash = chain.get(author.contentHash)!;
    const { contentHash: _fd, ...frB } = fr; fr.contentHash = canonicalHash(frB); chain.set(oldFr, fr.contentHash); writeFileSync(fp, JSON.stringify(fr));
    // frame_jury: input'unda ctx+author+jury+frameReceipt hash'leri — hepsi chain'den remap.
    const fjp = join(artifactsDir, '1-frame_jury-r0.json'); const fja = JSON.parse(readFileSync(fjp, 'utf8'));
    fja.protocolHash = OLD; fja.inputArtifactHashes = fja.inputArtifactHashes.map((h: string) => chain.get(h) ?? h);
    const { contentHash: _jd, ...fjb } = fja; fja.contentHash = canonicalHash(fjb); writeFileSync(fjp, JSON.stringify(fja));

    const migrated = runAt(dir, stale, ['--migrate-command-context']);
    expect(migrated.status, migrated.stderr).toBe(0);
    expect(JSON.parse(migrated.stdout).migratedWorkspace.frames).toBe(1);

    // KRİTİK: resume'da sahne 1 (kare+frame_jury PASS) TECHNICAL_ERROR değil, motion_author bekliyor.
    const migratedCommand = JSON.parse(readFileSync(join(dir, 'sample_mamilas_command.json'), 'utf8'));
    const resumed = JSON.parse(runAt(dir, migratedCommand, ['--batch', '--dry-run']).stdout);
    expect(resumed.scenes[0].state, JSON.stringify(resumed.scenes[0])).toBe('RUN_ROLE:motion_author');
    expect(resumed.scenes[0].reason ?? '').not.toMatch(/zinciri uyuşmuyor|stale/);
  });

  test('F-A2: --clear-frame bozuk/eski kareyi güvenli siler, yeni kare import edilebilir; karar zincirine dokunmaz', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-clear-frame-'));
    const command = commandFixture(1);
    const artifactsDir = join(dir, '.mamilas', 'artifacts');
    mkdirSync(artifactsDir, { recursive: true });
    expect(runAt(dir, command, ['--approve-storyboard', '--all-scenes']).status).toBe(0);
    passChain(command, 1, artifactsDir);
    const pngB64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    const pngPath = join(dir, 'frame.png');
    writeFileSync(pngPath, Buffer.from(pngB64, 'base64'));
    expect(runAt(dir, command, ['--import-frame', pngPath, '--scene', '1', '--verdict', 'APPROVE']).status).toBe(0);

    // Frame receipt'i bozuk bağa düşür (F-A1'in olmadığı bir dünyayı simüle et):
    const framePath = join(dir, '.mamilas', 'frames', '1.json');
    const receipt = JSON.parse(readFileSync(framePath, 'utf8'));
    const storedFile = receipt.storedFile;
    receipt.fromImagePromptArtifactHash = 'deadbeef'.repeat(8);
    const { contentHash: _d, ...body } = receipt;
    receipt.contentHash = canonicalHash(body);
    writeFileSync(framePath, JSON.stringify(receipt));
    // Bozuk bağ: resume o sahneyi TECHNICAL_ERROR/stale yapar.
    const broken = JSON.parse(runAt(dir, command, ['--batch', '--dry-run']).stdout);
    expect(broken.scenes[0].state).toBe('TECHNICAL_ERROR');

    // --clear-frame: kareyi + saklanan görseli sil.
    const cleared = runAt(dir, command, ['--clear-frame', '--scene', '1']);
    expect(cleared.status, cleared.stderr).toBe(0);
    expect(JSON.parse(cleared.stdout).action.kind).toBe('FRAME_CLEARED');
    expect(existsSync(framePath)).toBe(false);
    expect(existsSync(join(dir, '.mamilas', 'frames', storedFile))).toBe(false);

    // Karar zinciri korundu: sahne AWAIT_FRAME'e döner (PASS image yeniden koşulmaz).
    const recovered = JSON.parse(runAt(dir, command, ['--batch', '--dry-run']).stdout);
    expect(recovered.scenes[0].state).toBe('AWAIT_FRAME');

    // Yeni kare import edilebilir — kurtarma tamamlandı.
    writeFileSync(pngPath, Buffer.from(pngB64, 'base64'));
    const reimport = runAt(dir, command, ['--import-frame', pngPath, '--scene', '1', '--verdict', 'APPROVE']);
    expect(reimport.status, reimport.stderr).toBe(0);
  });

  test('F-A5 + F-A4: batch solo-flag çakışması net hata; --out kök dışına yazamaz', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-guard-'));
    const command = commandFixture(1);
    mkdirSync(join(dir, '.mamilas', 'artifacts'), { recursive: true });
    // F-A5: batch + import-frame → alakasız değil NET hata.
    const clash = runAt(dir, command, ['--batch', '--import-frame', 'x.png', '--scene', '1']);
    expect(clash.status).toBe(1);
    expect(clash.stderr).toMatch(/--batch --import-frame ile birlikte kullanılamaz/);
    // F-A4: --out kök dışına (tmp'nin dışı) yazamaz.
    const dirFile = join(dir, 'dir.txt');
    writeFileSync(dirFile, 'test direktif');
    const evil = join(tmpdir(), `EVIL-${Date.now()}.json`);
    const jailed = runAt(dir, command, ['--add-directive-file', dirFile, '--scope', 'PROJECT', '--out', evil]);
    expect(jailed.status).toBe(1);
    expect(jailed.stderr).toMatch(/proje klasörünün dışına çıkamaz/);
    expect(existsSync(evil)).toBe(false);
    // proje-içi --out serbest:
    const ok = runAt(dir, command, ['--add-directive-file', dirFile, '--scope', 'PROJECT', '--out', join(dir, 'legit.json')]);
    expect(ok.status, ok.stderr).toBe(0);
    expect(existsSync(join(dir, 'legit.json'))).toBe(true);
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
