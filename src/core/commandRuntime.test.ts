import { describe, expect, test } from 'vitest';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { deflateSync } from 'node:zlib';
import sharp from 'sharp';
import { buildCommandJSON } from './commandExport';
import { generateBatch, resolveRecipeDefaults } from './pure';
import { canonicalHash, sha256Hex } from './contract';

function commandFixture(approved = true, sceneCount = 1, multilineVoiceOver = false) {
  const defaults = resolveRecipeDefaults('ANIMATION_EDU', 'pixar_3d_edu');
  const generated = generateBatch({
    projectTopic: 'Su Döngüsü', projectClass: 'ANIMATION_EDU', sceneCount, cast: '',
    selectedWorldId: 'pixar_3d_edu', selectedPropId: 'native_world',
    selectedRefIds: defaults.selectedRefIds, selectedPaletteId: 'pastel_soft', selectedMusicId: '',
    imageModel: 'nano_banana_2', videoModel: 'kling_3', directorBrief: 'Başlık yalnız final sahnede olsun.',
  });
  if (multilineVoiceOver) generated.scenes[0].voiceOver = 'Su buharlaşır.\n  Bulut olur.';
  const state: any = {
    selectedProjectId: 'education', projectTopic: 'Su Döngüsü', projectClass: 'ANIMATION_EDU', sceneCount,
    cast: '', subject: 'Su Döngüsü', location: '', recipeScenes: [], selectedWorldId: 'pixar_3d_edu',
    selectedPropId: 'native_world', selectedRefIds: defaults.selectedRefIds, selectedPaletteId: 'pastel_soft', selectedMusicId: '',
    imageModel: 'nano_banana_2', videoModel: 'kling_3', brandKitLock: '', mood: '', cameraEnergy: '', timeLight: '',
    transition: '', musicVibe: '', pov: '', signature: '', leitmotif: '', tempoCurve: '', directorBrief: 'Başlık yalnız final sahnede olsun.',
    rawSource: '', sourceBeats: [], sourceReport: null, beatMode: 'Dengeli', workingMode: 'guided', beatKeeps: {}, beatAnalysis: null,
    scenes: generated.scenes, agentBrief: generated.agentBrief, agentPackets: generated.agentPackets,
    osTextMode: 'AUTO', voSyncMode: 'FREE', shotApprovals: {},
  };
  const first = buildCommandJSON(state) as any;
  if (approved) state.shotApprovals = Object.fromEntries(
    generated.scenes.map((scene) => [scene.id, { verdict: 'APPROVED', commandId: first.commandId }]),
  );
  return buildCommandJSON(state) as any;
}

function run(command: any, approve = true) {
  const dir = mkdtempSync(join(tmpdir(), 'mamilas-command-'));
  const file = join(dir, 'sample_mamilas_command.json');
  writeFileSync(file, JSON.stringify(command));
  const script = resolve('scripts/mamilas-command.mjs');
  if (approve) spawnSync(process.execPath, [script, '--file', file, '--approve-storyboard', '--scene', '1'], { cwd: resolve('.'), encoding: 'utf8' });
  return spawnSync(process.execPath, [script, '--file', file, '--dry-run', '--provider', 'codex'], { cwd: resolve('.'), encoding: 'utf8' });
}

function runAt(dir: string, command: any, args: string[]) {
  const file = join(dir, 'sample_mamilas_command.json');
  writeFileSync(file, JSON.stringify(command));
  return spawnSync(process.execPath, [resolve('scripts/mamilas-command.mjs'), '--file', file, ...args], {
    cwd: dir, encoding: 'utf8',
  });
}

function sealedArtifact(command: any, sceneId: number, role: string, phase: string, revision: 0 | 1, inputArtifactHashes: string[], content: any) {
  const body = {
    schema: 'mamilas.agent-artifact.v1', protocolVersion: 'mamilas.agent-protocol.v1',
    protocolHash: command.lifecycle.protocol.contentHash, phase, role, provider: 'codex', sceneId,
    decisionHash: command.commandId.replace(/^mamilas-/, ''), storyboardHash: command.lifecycle.storyboardHash,
    inputArtifactHashes, revision, content,
  };
  return { ...body, contentHash: canonicalHash(body) };
}

function crc32(bytes: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBytes = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([length, typeBytes, data, crc]);
}

function indexedPngWithoutPalette(): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(1, 0); ihdr.writeUInt32BE(1, 4);
  ihdr[8] = 8; ihdr[9] = 3;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr), pngChunk('IDAT', deflateSync(Buffer.from([0, 0]))), pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

describe('interactive command runtime', () => {
  test('launcher proje adını güvenli klasöre bağlar ve aynı command çalışmasını kendi içinde sürdürür', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-project-runner-'));
    const projectsDir = join(dir, 'projects');
    const command = commandFixture(false);
    const sourceFile = join(dir, 'downloaded_mamilas_command.json');
    writeFileSync(sourceFile, JSON.stringify(command));
    const runner = resolve('agents/runner.mjs');
    const common = [
      runner, '--file', sourceFile, '--project', 'Su Döngüsü / 7. Sınıf',
      '--projects-dir', projectsDir,
    ];

    const first = spawnSync(process.execPath, [...common, '--dry-run'], { cwd: resolve('.'), encoding: 'utf8' });
    expect(first.status, first.stderr).toBe(0);
    const [folder] = readdirSync(projectsDir);
    const projectDir = join(projectsDir, folder);
    const runDir = join(projectDir, 'runs', command.commandId);
    const manifest = JSON.parse(readFileSync(join(projectDir, 'PROJECT.json'), 'utf8'));
    expect(manifest).toEqual({
      schema: 'mamilas.local-project.v1',
      name: 'Su Döngüsü / 7. Sınıf',
      folder: 'Su Döngüsü - 7. Sınıf',
      activeCommandId: command.commandId,
    });
    expect(existsSync(join(runDir, 'mamilas_command.json'))).toBe(true);
    expect(existsSync(join(runDir, '.mamilas'))).toBe(true);
    expect(first.stdout).toContain(projectDir);

    const second = spawnSync(process.execPath, [...common, '--approve-storyboard', '--scene', '1'], {
      cwd: resolve('.'), encoding: 'utf8',
    });
    expect(second.status, second.stderr).toBe(0);
    expect(existsSync(join(runDir, '.mamilas', 'approvals', '1.json'))).toBe(true);
    expect(readdirSync(join(projectDir, 'runs'))).toEqual([command.commandId]);

    const collision = spawnSync(process.execPath, [
      runner, '--file', sourceFile, '--project', 'Su Döngüsü : 7. Sınıf',
      '--projects-dir', projectsDir, '--dry-run',
    ], { cwd: resolve('.'), encoding: 'utf8' });
    expect(collision.status).not.toBe(0);
    expect(collision.stderr).toContain('aynı klasör adına dönüşüyor');
  });

  test('launcher non-interactive kullanımda adsız ortak workspace açmaz', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-project-required-'));
    const projectsDir = join(dir, 'projects');
    const sourceFile = join(dir, 'downloaded_mamilas_command.json');
    writeFileSync(sourceFile, JSON.stringify(commandFixture(false)));
    const result = spawnSync(process.execPath, [
      resolve('agents/runner.mjs'), '--file', sourceFile, '--projects-dir', projectsDir, '--dry-run',
    ], {
      cwd: resolve('.'), encoding: 'utf8',
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('--project "Proje Adı"');
    expect(existsSync(projectsDir)).toBe(false);
  });

  test('valid command → next image_author; minimum context site promptunu taşımaz', () => {
    const result = run(commandFixture());
    expect(result.status, result.stderr).toBe(0);
    const out = JSON.parse(result.stdout);
    expect(out.validation).toBe('PASS');
    expect(out.action).toEqual({ kind: 'RUN_ROLE', role: 'image_author', revision: 0 });
    expect(out.contextSummary.containsSiteGeneratedPrompt).toBe(false);
    expect(out.protocolHash).toMatch(/^[0-9a-f]{64}$/);
  });

  test('exporttaki çok satırlı ses metni Node çalıştırıcısının storyboard hash kapısından geçer', () => {
    const result = run(commandFixture(true, 1, true));
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout).action).toEqual({ kind: 'RUN_ROLE', role: 'image_author', revision: 0 });
  });

  test('açık migration yalnız türetilmiş context hashlerini günceller; storyboard VERBATIM doğrulanır', () => {
    // BRAIN M4 (Sol kritik): migration sceneContextHashes'i tazeler ama storyboardHash'i
    // YENİDEN MÜHÜRLEMEZ — mühürlemek, scenes'i kurcalanmış bir command'i "migration"la
    // meşrulaştırırdı. Storyboard tutuyorsa context taşınır; tutmuyorsa migration REDDEDER.
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-context-migration-'));
    const command = commandFixture();
    command.lifecycle.sceneContextHashes[1] = 'stale'; // context şekli değişti senaryosu
    const file = join(dir, 'sample_mamilas_command.json');
    writeFileSync(file, JSON.stringify(command));
    const result = spawnSync(process.execPath, [
      resolve('scripts/mamilas-command.mjs'), '--file', file, '--migrate-command-context', '--out', file,
    ], { cwd: dir, encoding: 'utf8' });
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout).action).toEqual({ kind: 'COMMAND_CONTEXT_MIGRATED' });
    const ready = runAt(dir, JSON.parse(readFileSync(file, 'utf8')), ['--dry-run']);
    expect(ready.status, ready.stderr).toBe(0);
    expect(JSON.parse(ready.stdout).action).toEqual({ kind: 'AWAIT_STORYBOARD_APPROVAL' });
  });

  test('migration stale/tamper storyboardHash taşıyan commandi MEŞRULAŞTIRMAZ — reddeder', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-context-migration-tamper-'));
    const command = commandFixture();
    command.lifecycle.storyboardHash = 'stale'; // scenes ile uyuşmayan storyboard = tamper vakası
    const file = join(dir, 'sample_mamilas_command.json');
    writeFileSync(file, JSON.stringify(command));
    const result = spawnSync(process.execPath, [
      resolve('scripts/mamilas-command.mjs'), '--file', file, '--migrate-command-context', '--out', file,
    ], { cwd: dir, encoding: 'utf8' });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/storyboardHash scenes ile uyuşmuyor/);
  });

  test('storyboard onayı yoksa provider açmaz; approval bekler', () => {
    const result = run(commandFixture(false), false);
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout).action.kind).toBe('AWAIT_STORYBOARD_APPROVAL');
  });

  test('prompt öncesi command ayrı hashli storyboard approval sonrası image author açar', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-approval-'));
    const command = commandFixture(false);
    const approved = runAt(dir, command, ['--approve-storyboard', '--scene', '1']);
    expect(approved.status, approved.stderr).toBe(0);
    expect(JSON.parse(approved.stdout).action.kind).toBe('STORYBOARD_APPROVED');
    const dry = runAt(dir, command, ['--dry-run']);
    const out = JSON.parse(dry.stdout);
    expect(dry.status, dry.stderr).toBe(0);
    expect(out.action).toEqual({ kind: 'RUN_ROLE', role: 'image_author', revision: 0 });
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

  test('MamiDirectives, WorldPacket ve on-screen lock tamper context kapısında reddedilir', () => {
    const directive = commandFixture();
    directive.lifecycle.mamiDirectives[0].text = 'TAMPERED';
    const badDirective = run(directive);
    expect(badDirective.status).not.toBe(0);
    expect(badDirective.stderr).toMatch(/MamiDirectives exact projection|contextHash/);

    const world = commandFixture();
    world.worldPacket.lightPhysics = 'TAMPERED LIGHT';
    const badWorld = run(world);
    expect(badWorld.status).not.toBe(0);
    expect(badWorld.stderr).toMatch(/contextHash stale\/tampered/);

    const text = commandFixture();
    text.scenes[0].prompts.onScreenText = 'TAMPERED TEXT';
    const badText = run(text);
    expect(badText.status).not.toBe(0);
    expect(badText.stderr).toMatch(/contextHash stale\/tampered/);
  });

  test('exact LIVE_CHAT SCENE directive yeni canonical command üretir ve eski approval/artifactleri stale bırakır', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-live-directive-'));
    const command = commandFixture();
    const directivePath = join(dir, 'directive.txt');
    const exact = '  Bu sahnede başlık bir kez, aynen "SU DÖNGÜSÜ" olsun.\n';
    writeFileSync(directivePath, exact, 'utf8');
    const output = join(dir, 'updated_mamilas_command.json');
    const added = runAt(dir, command, [
      '--add-directive-file', directivePath, '--scope', 'SCENE', '--scene', '1', '--out', output,
    ]);
    expect(added.status, added.stderr).toBe(0);
    const updated = JSON.parse(readFileSync(output, 'utf8'));
    expect(updated.commandId).not.toBe(command.commandId);
    expect(updated.baseDecision.mamiDirectives.at(-1)).toMatchObject({ source: 'LIVE_CHAT', scope: 'SCENE', sceneId: 1, text: exact });
    expect(updated.lifecycle.mamiDirectives).toEqual(updated.baseDecision.mamiDirectives);
    expect(updated.lifecycle.shotApprovals).toEqual({});
    const dry = runAt(dir, updated, ['--dry-run']);
    expect(dry.status, dry.stderr).toBe(0);
    expect(JSON.parse(dry.stdout).action.kind).toBe('AWAIT_STORYBOARD_APPROVAL');

    const tampered = structuredClone(updated);
    tampered.baseDecision.mamiDirectives.at(-1).text += ' TAMPER';
    tampered.lifecycle.mamiDirectives = structuredClone(tampered.baseDecision.mamiDirectives);
    tampered.commandId = `mamilas-${canonicalHash(tampered.baseDecision)}`;
    const tamperedRun = runAt(dir, tampered, ['--dry-run']);
    expect(tamperedRun.status).not.toBe(0);
    expect(tamperedRun.stderr).toMatch(/LIVE_CHAT directive id stale\/tampered/);
  });

  test('hashli ama boş image author content ilerleyemez', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-empty-artifact-'));
    const command = commandFixture();
    const artifacts = join(dir, '.mamilas', 'artifacts');
    mkdirSync(artifacts, { recursive: true });
    const empty = sealedArtifact(command, 1, 'image_author', 'IMAGE_PROMPT', 0, [command.lifecycle.sceneContextHashes[1]], {});
    writeFileSync(join(artifacts, '1-image_author-r0.json'), JSON.stringify(empty));
    const result = runAt(dir, command, ['--dry-run']);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/image prompt|directiveReceipts|appliedLocks/);
  });

  test('gerçek frame import full decode + byte hash/dimensions bağlar; byte değişince motion kapanır', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-frame-runtime-'));
    const command = commandFixture();
    const artifactsDir = join(dir, '.mamilas', 'artifacts');
    mkdirSync(artifactsDir, { recursive: true });
    const contextHash = command.lifecycle.sceneContextHashes[1];
    const prompt = 'Continuous dimensional 3D CGI feature-animation shading; a physical water-cycle frame with cloud and basin. No photoreal or live-action capture.';
    const author = sealedArtifact(command, 1, 'image_author', 'IMAGE_PROMPT', 0, [contextHash], {
      prompt, promptHash: sha256Hex(prompt),
      // BRAIN M3: zorunlu şeffaf yorum receipt'i.
      interpretation: { dominantSubject: 'test subject', singleEvent: 'test event', frozenInstant: 'test instant' },
      directiveReceipts: [{ id: 'site-directive-001', text: 'Başlık yalnız final sahnede olsun.', status: 'APPLIED' }],
      appliedLocks: ['world', 'palette'], suppressedContext: [], risks: [],
    });
    const jury = sealedArtifact(command, 1, 'image_jury', 'IMAGE_JURY', 0, [contextHash, author.contentHash], {
      verdict: 'PASS', evidence: ['Prompt approved shot ve dünya fiziğini taşıyor.'],
    });
    writeFileSync(join(artifactsDir, '1-image_author-r0.json'), JSON.stringify(author));
    writeFileSync(join(artifactsDir, '1-image_jury-r0.json'), JSON.stringify(jury));
    expect(runAt(dir, command, ['--approve-storyboard', '--scene', '1']).status).toBe(0);
    const headerOnly = join(dir, 'header-only.png');
    const fakeHeader = Buffer.alloc(24);
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(fakeHeader, 0);
    fakeHeader.writeUInt32BE(1, 16); fakeHeader.writeUInt32BE(1, 20);
    writeFileSync(headerOnly, fakeHeader);
    const fakeImport = runAt(dir, command, ['--import-frame', headerOnly, '--scene', '1', '--verdict', 'APPROVE']);
    expect(fakeImport.status).not.toBe(0);
    expect(fakeImport.stderr).toMatch(/tam decode edilebilir PNG\/JPEG\/WebP değil/);
    const missingPalette = join(dir, 'missing-palette.png');
    writeFileSync(missingPalette, indexedPngWithoutPalette());
    const paletteBypass = runAt(dir, command, ['--import-frame', missingPalette, '--scene', '1', '--verdict', 'APPROVE']);
    expect(paletteBypass.status).not.toBe(0);
    expect(paletteBypass.stderr).toMatch(/tam decode edilebilir PNG\/JPEG\/WebP değil/);

    const bundlePath = join(dir, 'scene-1-image-bundle.json');
    const bundleExport = runAt(dir, command, ['--export-image-bundle', '--scene', '1', '--out', bundlePath]);
    expect(bundleExport.status, bundleExport.stderr).toBe(0);
    const bundle = JSON.parse(readFileSync(bundlePath, 'utf8'));
    expect(bundle).toMatchObject({ schema: 'mamilas.image-artifact-bundle.v1', command: { commandId: command.commandId } });
    expect(bundle.artifacts).toHaveLength(2);

    for (const format of ['jpeg', 'webp'] as const) {
      const imagePath = join(dir, `frame.${format === 'jpeg' ? 'jpg' : format}`);
      const bytes = await sharp({ create: { width: 2, height: 1, channels: 3, background: '#336699' } })[format]().toBuffer();
      writeFileSync(imagePath, bytes);
      const decoded = runAt(dir, command, ['--import-frame', imagePath, '--scene', '1', '--verdict', 'APPROVE']);
      expect(decoded.status, decoded.stderr).toBe(0);
      expect(JSON.parse(decoded.stdout)).toMatchObject({ width: 2, height: 1, verdict: 'APPROVE' });
    }
    const pngPath = join(dir, 'frame.png');
    writeFileSync(pngPath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'));
    const imported = runAt(dir, command, ['--import-frame', pngPath, '--scene', '1', '--verdict', 'APPROVE']);
    expect(imported.status, imported.stderr).toBe(0);
    expect(JSON.parse(imported.stdout)).toMatchObject({ width: 1, height: 1, verdict: 'APPROVE' });

    const frameReceipt = JSON.parse(readFileSync(join(dir, '.mamilas', 'frames', '1.json'), 'utf8'));
    const frameJury = sealedArtifact(command, 1, 'frame_jury', 'FRAME_JURY', 0, [
      contextHash, author.contentHash, jury.contentHash, frameReceipt.contentHash,
    ], { verdict: 'PASS', frameHash: frameReceipt.frameHash, evidence: ['Gerçek 1×1 test frame baytı açıldı.'] });
    writeFileSync(join(artifactsDir, '1-frame_jury-r0.json'), JSON.stringify(frameJury));
    const motion = runAt(dir, command, ['--dry-run']);
    const out = JSON.parse(motion.stdout);
    expect(motion.status, motion.stderr).toBe(0);
    expect(out.action).toEqual({ kind: 'RUN_ROLE', role: 'motion_author', revision: 0 });
    expect(out.contextSummary.keys).toContain('engine');
    expect(out.contextSummary.keys).toContain('continuity');

    writeFileSync(join(dir, '.mamilas', 'frames', '1.png'), Buffer.from('tampered bytes'));
    const stale = runAt(dir, command, ['--dry-run']);
    expect(stale.status).not.toBe(0);
    expect(stale.stderr).toMatch(/tam decode edilebilir PNG\/JPEG\/WebP değil|byte\/hash\/dimension/);
  });

  test('FABLE fix: frame_jury SONRASI bundle-export ve YENİ kare importu çalışır; stale frame-bağımlı artifact zinciri öldürmez', async () => {
    // Ölçülmüş kırık (Fable 2026-07-16): frame_jury artifact'i oluştuktan sonra
    // --export-image-bundle ve --import-frame, frame=null geçen validateArtifactChain
    // yüzünden KALICI kırılıyordu ("current frame receipt yok" — receipt diskteyken) →
    // Mami kareyi asla değiştiremiyordu. Fix: gerçek frame yüklenir; yeni kare gelince
    // eski frame-bağımlı artifact'ler AYIKLANIR (stale = yeniden-koş, ölüm değil).
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-frame-replace-'));
    const command = commandFixture();
    const artifactsDir = join(dir, '.mamilas', 'artifacts');
    mkdirSync(artifactsDir, { recursive: true });
    const contextHash = command.lifecycle.sceneContextHashes[1];
    const prompt = 'Continuous dimensional 3D CGI feature-animation shading; a physical water-cycle frame with cloud and basin. No photoreal or live-action capture.';
    const author = sealedArtifact(command, 1, 'image_author', 'IMAGE_PROMPT', 0, [contextHash], {
      prompt, promptHash: sha256Hex(prompt),
      interpretation: { dominantSubject: 'test subject', singleEvent: 'test event', frozenInstant: 'test instant' },
      directiveReceipts: [{ id: 'site-directive-001', text: 'Başlık yalnız final sahnede olsun.', status: 'APPLIED' }],
      appliedLocks: ['world'], suppressedContext: [], risks: [],
    });
    const jury = sealedArtifact(command, 1, 'image_jury', 'IMAGE_JURY', 0, [contextHash, author.contentHash], {
      verdict: 'PASS', evidence: ['Prompt approved shot ve dünya fiziğini taşıyor.'],
    });
    writeFileSync(join(artifactsDir, '1-image_author-r0.json'), JSON.stringify(author));
    writeFileSync(join(artifactsDir, '1-image_jury-r0.json'), JSON.stringify(jury));
    expect(runAt(dir, command, ['--approve-storyboard', '--scene', '1']).status).toBe(0);
    // İlk kare + frame_jury PASS:
    const png1 = join(dir, 'frame1.png');
    writeFileSync(png1, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'));
    expect(runAt(dir, command, ['--import-frame', png1, '--scene', '1', '--verdict', 'APPROVE']).status).toBe(0);
    const receipt1 = JSON.parse(readFileSync(join(dir, '.mamilas', 'frames', '1.json'), 'utf8'));
    const frameJury = sealedArtifact(command, 1, 'frame_jury', 'FRAME_JURY', 0, [
      contextHash, author.contentHash, jury.contentHash, receipt1.contentHash,
    ], { verdict: 'PASS', frameHash: receipt1.frameHash, evidence: ['İlk kare açıldı.'] });
    writeFileSync(join(artifactsDir, '1-frame_jury-r0.json'), JSON.stringify(frameJury));

    // 1) frame_jury varken bundle export ARTIK çalışır (eskiden kırılırdı):
    const bundlePath = join(dir, 'post-frame-bundle.json');
    const post = runAt(dir, command, ['--export-image-bundle', '--scene', '1', '--out', bundlePath]);
    expect(post.status, post.stderr).toBe(0);
    expect(JSON.parse(readFileSync(bundlePath, 'utf8')).schema).toBe('mamilas.image-artifact-bundle.v1');

    // 2) YENİ (daha iyi) kare importu ARTIK çalışır:
    const png2 = join(dir, 'frame2.jpg');
    const bytes2 = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#996633' } }).jpeg().toBuffer();
    writeFileSync(png2, bytes2);
    const replace = runAt(dir, command, ['--import-frame', png2, '--scene', '1', '--verdict', 'APPROVE']);
    expect(replace.status, replace.stderr).toBe(0);

    // 3) Eski frame_jury (yeni kareye göre stale) sahneyi ÖLDÜRMEZ — ayıklanır,
    //    frame katı yeniden açılır:
    const next = runAt(dir, command, ['--dry-run']);
    expect(next.status, next.stderr).toBe(0);
    expect(JSON.parse(next.stdout).action).toEqual({ kind: 'RUN_ROLE', role: 'frame_jury', revision: 0 });
    // Image katı korunur (yeniden yazılmaz) — action image tarafına dönmedi.
  });

  test('çok sahneli scheduler COMPLETE ilk sahneyi atlayıp sonraki valid rolü seçer', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-multiscene-'));
    const command = commandFixture(true, 2);
    const artifactsDir = join(dir, '.mamilas', 'artifacts');
    mkdirSync(artifactsDir, { recursive: true });
    const contextHash = command.lifecycle.sceneContextHashes[1];
    const prompt = 'Continuous dimensional 3D CGI feature-animation shading; scene one approved image prompt. No photoreal or live-action capture.';
    const author = sealedArtifact(command, 1, 'image_author', 'IMAGE_PROMPT', 0, [contextHash], {
      prompt, promptHash: sha256Hex(prompt),
      // BRAIN M3: zorunlu şeffaf yorum receipt'i.
      interpretation: { dominantSubject: 'test subject', singleEvent: 'test event', frozenInstant: 'test instant' },
      directiveReceipts: [{ id: 'site-directive-001', text: 'Başlık yalnız final sahnede olsun.', status: 'APPLIED' }],
      appliedLocks: ['world'], suppressedContext: [], risks: [],
    });
    const imageJury = sealedArtifact(command, 1, 'image_jury', 'IMAGE_JURY', 0, [contextHash, author.contentHash], {
      verdict: 'PASS', evidence: ['Scene one prompt counter-read.'],
    });
    writeFileSync(join(artifactsDir, '1-image_author-r0.json'), JSON.stringify(author));
    writeFileSync(join(artifactsDir, '1-image_jury-r0.json'), JSON.stringify(imageJury));
    expect(runAt(dir, command, ['--approve-storyboard', '--scene', '1']).status).toBe(0);
    expect(runAt(dir, command, ['--approve-storyboard', '--scene', '2']).status).toBe(0);
    const pngPath = join(dir, 'frame.png');
    writeFileSync(pngPath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'));
    expect(runAt(dir, command, ['--import-frame', pngPath, '--scene', '1', '--verdict', 'APPROVE']).status).toBe(0);
    const frame = JSON.parse(readFileSync(join(dir, '.mamilas', 'frames', '1.json'), 'utf8'));
    const frameJury = sealedArtifact(command, 1, 'frame_jury', 'FRAME_JURY', 0, [
      contextHash, author.contentHash, imageJury.contentHash, frame.contentHash,
    ], { verdict: 'PASS', frameHash: frame.frameHash, evidence: ['Frame pixels inspected.'] });
    const motionPrompt = 'Animate the single visible water droplet settling.';
    const motionAuthor = sealedArtifact(command, 1, 'motion_author', 'MOTION', 0, [
      contextHash, author.contentHash, imageJury.contentHash, frame.contentHash, frameJury.contentHash,
    ], { frameHash: frame.frameHash, inventory: ['one visible water droplet'], prompt: motionPrompt, promptHash: sha256Hex(motionPrompt), risks: [] });
    const motionJury = sealedArtifact(command, 1, 'motion_jury', 'MOTION_JURY', 0, [
      contextHash, author.contentHash, imageJury.contentHash, frame.contentHash, frameJury.contentHash, motionAuthor.contentHash,
    ], { verdict: 'PASS', frameHash: frame.frameHash, evidence: ['Motion preserves the inspected frame.'] });
    writeFileSync(join(artifactsDir, '1-frame_jury-r0.json'), JSON.stringify(frameJury));
    writeFileSync(join(artifactsDir, '1-motion_author-r0.json'), JSON.stringify(motionAuthor));
    writeFileSync(join(artifactsDir, '1-motion_jury-r0.json'), JSON.stringify(motionJury));

    const next = runAt(dir, command, ['--dry-run']);
    const out = JSON.parse(next.stdout);
    expect(next.status, next.stderr).toBe(0);
    expect(out.sceneId).toBe(2);
    expect(out.action).toEqual({ kind: 'RUN_ROLE', role: 'image_author', revision: 0 });
  });

  // BATCH mandası (Mami, 2026-07-16): sahne sahne launcher'a dönmek yok. Aşağıdaki
  // kilitler batch sürücüsünün protokol yasalarını GEVŞETMEDİĞİNİ kanıtlar.
  test('--approve-storyboard --all-scenes tüm approval receiptlerini tek koşuda yazar', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-batch-approve-'));
    const command = commandFixture(true, 3);
    const result = runAt(dir, command, ['--approve-storyboard', '--all-scenes']);
    expect(result.status, result.stderr).toBe(0);
    const out = JSON.parse(result.stdout);
    expect(out.action.kind).toBe('STORYBOARD_APPROVED_ALL');
    expect(out.approvals).toHaveLength(3);
    for (const sceneId of [1, 2, 3]) {
      expect(existsSync(join(dir, '.mamilas', 'approvals', `${sceneId}.json`))).toBe(true);
    }
    // Toplu onay sonrası lifecycle ilk sahnenin image_author'ını türetir — tekli yasayla aynı.
    const next = runAt(dir, command, ['--dry-run']);
    const nextOut = JSON.parse(next.stdout);
    expect(nextOut.sceneId).toBe(1);
    expect(nextOut.action).toEqual({ kind: 'RUN_ROLE', role: 'image_author', revision: 0 });
  });

  test('--batch --scene birlikte reddedilir; batch tüm sahneleri sürer', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-batch-scene-'));
    const command = commandFixture(true, 2);
    const result = runAt(dir, command, ['--batch', '--scene', '1', '--dry-run']);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/--batch tüm sahneleri sürer/);
  });

  test('--batch raporu her sahnenin durumunu verir; AWAIT_FRAME sahnesinin PASS promptu pakete girer ve frame kapısı AÇILMAZ', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-batch-report-'));
    const command = commandFixture(true, 2);
    const artifactsDir = join(dir, '.mamilas', 'artifacts');
    mkdirSync(artifactsDir, { recursive: true });
    expect(runAt(dir, command, ['--approve-storyboard', '--all-scenes']).status).toBe(0);
    // Sahne 1: PASS image zinciri hazır ama GERÇEK FRAME YOK → batch motion açamaz.
    const contextHash = command.lifecycle.sceneContextHashes[1];
    const prompt = 'Continuous dimensional 3D CGI feature-animation shading; scene one approved image prompt. No photoreal or live-action capture.';
    const author = sealedArtifact(command, 1, 'image_author', 'IMAGE_PROMPT', 0, [contextHash], {
      prompt, promptHash: sha256Hex(prompt),
      interpretation: { dominantSubject: 'test subject', singleEvent: 'test event', frozenInstant: 'test instant' },
      directiveReceipts: [{ id: 'site-directive-001', text: 'Başlık yalnız final sahnede olsun.', status: 'APPLIED' }],
      appliedLocks: ['world'], suppressedContext: [], risks: [],
    });
    const jury = sealedArtifact(command, 1, 'image_jury', 'IMAGE_JURY', 0, [contextHash, author.contentHash], {
      verdict: 'PASS', evidence: ['Scene one prompt counter-read.'],
    });
    writeFileSync(join(artifactsDir, '1-image_author-r0.json'), JSON.stringify(author));
    writeFileSync(join(artifactsDir, '1-image_jury-r0.json'), JSON.stringify(jury));

    const result = runAt(dir, command, ['--batch', '--dry-run']);
    expect(result.status, result.stderr).toBe(0);
    const out = JSON.parse(result.stdout);
    expect(out.action.kind).toBe('BATCH_REPORT');
    expect(out.scenes).toHaveLength(2);
    // Sahne 1 frame bekliyor; PASS prompt raporda ve pakette. Motion rolü türetilmedi.
    expect(out.scenes[0]).toMatchObject({ sceneId: 1, state: 'AWAIT_FRAME', prompt });
    // Sahne 2 hâlâ yazım fazında (launch'sız dry-run rol koşturmaz, dürüstçe söyler).
    expect(out.scenes[1]).toMatchObject({ sceneId: 2, state: 'RUN_ROLE:image_author' });
    const pack = readFileSync(join(dir, '.mamilas', 'SAHNE-PROMPTLAR.md'), 'utf8');
    expect(pack).toContain('Sahne 1');
    expect(pack).toContain(prompt);
    expect(pack).toContain('RUN_ROLE:image_author');
    // Frame kapısı kanıtı: batch koşusu motion artifact'i YARATMADI.
    expect(readdirSync(artifactsDir).some((name) => name.includes('motion'))).toBe(false);
  });

  test('--batch FACT_REQUIRED sahnesinde durmaz; sebep raporda, diğer sahneler sürülür', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-batch-fact-'));
    const command = commandFixture(true, 2);
    const artifactsDir = join(dir, '.mamilas', 'artifacts');
    mkdirSync(artifactsDir, { recursive: true });
    expect(runAt(dir, command, ['--approve-storyboard', '--all-scenes']).status).toBe(0);
    const contextHash = command.lifecycle.sceneContextHashes[1];
    const prompt = 'Continuous dimensional 3D CGI feature-animation shading; scene one draft prompt. No photoreal or live-action capture.';
    const author = sealedArtifact(command, 1, 'image_author', 'IMAGE_PROMPT', 0, [contextHash], {
      prompt, promptHash: sha256Hex(prompt),
      interpretation: { dominantSubject: 'test subject', singleEvent: 'test event', frozenInstant: 'test instant' },
      directiveReceipts: [{ id: 'site-directive-001', text: 'Başlık yalnız final sahnede olsun.', status: 'APPLIED' }],
      appliedLocks: ['world'], suppressedContext: [], risks: [],
    });
    const jury = sealedArtifact(command, 1, 'image_jury', 'IMAGE_JURY', 0, [contextHash, author.contentHash], {
      verdict: 'FACT_REQUIRED', factRequired: 'marka logosunun gerçek geometrisi kaynakta yok', evidence: ['Counter-read.'],
    });
    writeFileSync(join(artifactsDir, '1-image_author-r0.json'), JSON.stringify(author));
    writeFileSync(join(artifactsDir, '1-image_jury-r0.json'), JSON.stringify(jury));

    const result = runAt(dir, command, ['--batch', '--dry-run']);
    expect(result.status, result.stderr).toBe(0);
    const out = JSON.parse(result.stdout);
    expect(out.scenes[0]).toMatchObject({ sceneId: 1, state: 'FACT_REQUIRED' });
    expect(out.scenes[0].reason).toMatch(/marka logosunun gerçek geometrisi/);
    expect(out.scenes[1]).toMatchObject({ sceneId: 2, state: 'RUN_ROLE:image_author' });
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

  test('Image Author ve Jury role kartları sahne-öncelikli kalite kontratını taşır', () => {
    const author = readFileSync(resolve('agents/roles/image-author.md'), 'utf8');
    const jury = readFileSync(resolve('agents/roles/image-jury.md'), 'utf8');
    expect(author).toContain('FRAME-BUILD');
    expect(author).toContain('promptQuality');
    expect(author).toContain('forbidding photoreal/live-action capture');
    // Jüri üretim kapısıdır, zevk hakemi değil: reddi altı sert hataya bağlı ve estetik
    // mikro-eleştiri açıkça PASS'a düşer (Mami'nin tolerans yasası, 2026-07-23).
    expect(jury).toContain('production gate, not a taste critic');
    expect(jury).toContain('cannot be read from the prompt');
    expect(jury).toContain('aesthetic micro-critique is NOT a rejection');
    expect(jury).toContain('promptQuality.rejectIf');
    expect(jury).toContain('photographic register drift is hard failure');
  });

  test('3D animasyon artifacti pozitif medium + anti-photoreal karşı-kilidi olmadan mühürlenmez', async () => {
    const runtime = await import(pathToFileURL(resolve('scripts/mamilas-command.mjs')).href);
    const command = commandFixture() as any;
    const receipts = command.lifecycle.mamiDirectives.map((item: any) => ({
      id: item.id, text: item.text, status: 'APPLIED',
    }));
    const artifact = (prompt: string) => ({
      role: 'image_author', sceneId: 1,
      content: {
        prompt, promptHash: runtime.sha256(prompt),
        interpretation: { dominantSubject: 'öğrenci', singleEvent: 'arabayı iter', frozenInstant: 'teker dönmeden önce' },
        directiveReceipts: receipts, appliedLocks: ['3D world'], suppressedContext: [], risks: [],
      },
    });
    const weak = runtime.__testValidateRoleContent(
      artifact('3D CGI student pushes a cart under classroom light.'), command,
    );
    expect(weak).toContain('3D animation render lock photoreal/live-action karşı-kilidi eksik');
    const locked = runtime.__testValidateRoleContent(
      artifact('Continuous dimensional 3D CGI feature-animation shading; a student pushes a cart. No photoreal or live-action capture.'), command,
    );
    expect(locked.filter((item: string) => item.includes('3D animation render lock'))).toEqual([]);
  });

  test.each(['codex', 'claude'] as const)('%s interactive stub sonrası tam bir yeni role/provider artifact yeniden doğrulanır', (provider) => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-session-'));
    const file = join(dir, 'sample_mamilas_command.json');
    writeFileSync(file, JSON.stringify(commandFixture()));
    const bin = join(dir, '.bin');
    mkdirSync(bin);
    const helper = join(bin, `fake-${provider}.mjs`);
    const runtimeUrl = pathToFileURL(resolve('scripts/mamilas-command.mjs')).href;
    writeFileSync(helper, `
      import { readFile, writeFile } from 'node:fs/promises';
      import { dirname, join } from 'node:path';
      import { canonicalHash, sha256 } from ${JSON.stringify(runtimeUrl)};
      // Oturum scratch'i sahne/rol basina izole (.mamilas/work/<scene>/<role>/<rev>/).
      // Sahte provider gercek CLI gibi talimat argumani almadigi icin en yeni SESSION.md'yi bulur.
      const { readdirSync, statSync } = await import('node:fs');
      const findSessions = (d, acc = []) => {
        for (const e of readdirSync(d, { withFileTypes: true })) {
          const full = join(d, e.name);
          if (e.isDirectory()) findSessions(full, acc);
          else if (e.name === 'SESSION.md') acc.push(full);
        }
        return acc;
      };
      const sessionPath = findSessions(join(process.cwd(), '.mamilas'))
        .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
      const session = await readFile(sessionPath, 'utf8');
      const root = dirname(sessionPath);
      const context = JSON.parse(await readFile(join(root, 'CONTEXT.json'), 'utf8'));
      if (!context.promptQuality?.frameBuildOrder?.includes('visible subject + decisive action + physical place')) {
        throw new Error('Image Author received no sealed prompt-quality contract');
      }
      const template = JSON.parse(await readFile(session.match(/--seal-artifact "([^"]+)"/)[1], 'utf8'));
      template.content = {
        prompt: 'Continuous dimensional 3D CGI feature-animation shading; provider-authored prompt. No photoreal or live-action capture.',
        promptHash: sha256('Continuous dimensional 3D CGI feature-animation shading; provider-authored prompt. No photoreal or live-action capture.'),
        interpretation: { dominantSubject: 'test subject', singleEvent: 'test event', frozenInstant: 'test instant' },
        directiveReceipts: [{ id: 'site-directive-001', text: 'Başlık yalnız final sahnede olsun.', status: 'APPLIED' }],
        appliedLocks: ['world', 'palette'], suppressedContext: [], risks: [],
      };
      const sealed = { ...template, contentHash: canonicalHash(template) };
      await writeFile(session.match(/--out "([^"]+)"/)[1], JSON.stringify(sealed));
    `, 'utf8');
    if (process.platform === 'win32') {
      writeFileSync(join(bin, `${provider}.cmd`), `@echo off\r\n"${process.execPath}" "%~dp0fake-${provider}.mjs"\r\n`, 'utf8');
    } else {
      const stub = join(bin, provider);
      writeFileSync(stub, `#!/bin/sh\nexec "${process.execPath}" "${helper}"\n`, 'utf8');
      chmodSync(stub, 0o755);
    }

    expect(runAt(dir, commandFixture(), ['--approve-storyboard', '--scene', '1']).status).toBe(0);

    const result = spawnSync(process.execPath, [
      resolve('scripts/mamilas-command.mjs'), '--file', file, '--launch', '--provider', provider,
    ], {
      cwd: dir,
      encoding: 'utf8',
      env: { ...process.env, PATH: `${bin}${delimiter}${process.env.PATH ?? ''}` },
    });
    expect(result.status, result.stderr).toBe(0);
    const artifact = JSON.parse(readFileSync(join(dir, '.mamilas', 'artifacts', '1-image_author-r0.json'), 'utf8'));
    expect(artifact.role).toBe('image_author');
    expect(artifact.provider).toBe(provider);
    expect(artifact.sceneId).toBe(1);
    expect(artifact.contentHash).toMatch(/^[0-9a-f]{64}$/);
  });
});
