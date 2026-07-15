#!/usr/bin/env node

/**
 * MAMILAS interactive command lifecycle.
 *
 * This is not an agent, prompt author or generator. It validates the canonical decision,
 * protocol and artifacts; derives one next role; and only with --launch opens one interactive
 * Claude/Codex session. No --print, provider API, image/video call or agent loop exists here.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { delimiter, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');
const PROTOCOL_PATH = join(REPO_ROOT, 'agents', 'PROTOCOL.md');
const ARTIFACT_SCHEMA = 'mamilas.agent-artifact.v1';
const PROTOCOL_VERSION = 'mamilas.agent-protocol.v1';
const JURY = new Set(['PASS', 'REJECT', 'FACT_REQUIRED']);
const PROVIDERS = new Set(['claude', 'codex']);
const ROLE_PHASE = {
  image_author: 'IMAGE_PROMPT', image_jury: 'IMAGE_JURY', frame_jury: 'FRAME_JURY',
  motion_author: 'MOTION', motion_jury: 'MOTION_JURY',
};

export function canonicalize(value) {
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value.normalize('NFC'));
  if (typeof value === 'number' || typeof value === 'boolean') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  if (typeof value === 'object') {
    const entries = Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key.normalize('NFC'), item])
      .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
    const seen = new Set();
    for (const [key] of entries) {
      if (seen.has(key)) throw new Error(`canonicalize: NFC sonrası çakışan anahtar: ${key}`);
      seen.add(key);
    }
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`).join(',')}}`;
  }
  return 'null';
}

export const sha256 = (text) => createHash('sha256').update(text, 'utf8').digest('hex');
export const canonicalHash = (value) => sha256(canonicalize(value));

function storyboardHash(scenes) {
  return canonicalHash(scenes.map((scene) => ({
    id: scene.id,
    phaseName: scene.phaseName,
    durationSec: scene.durationSec,
    architecture: scene.architecture,
    sceneBrief: scene.sceneBrief ?? scene.voiceOver,
  })));
}

export async function validateCommand(command) {
  const problems = [];
  if (command?.schema !== 'mamilas.command.v2026') problems.push('unsupported command schema');
  const expectedId = command?.baseDecision ? `mamilas-${canonicalHash(command.baseDecision)}` : null;
  if (!expectedId || command.commandId !== expectedId) problems.push('commandId/baseDecision hash uyuşmuyor');
  const protocolText = await readFile(PROTOCOL_PATH, 'utf8');
  const protocolHash = sha256(protocolText);
  if (command?.lifecycle?.protocol?.version !== PROTOCOL_VERSION) problems.push('protocolVersion stale');
  if (command?.lifecycle?.protocol?.contentHash !== protocolHash) problems.push('protocolHash stale/tampered');
  const expectedStoryboard = Array.isArray(command?.scenes) ? storyboardHash(command.scenes) : null;
  if (!expectedStoryboard || command?.lifecycle?.storyboardHash !== expectedStoryboard) problems.push('storyboardHash stale/tampered');
  if (command?.lifecycle?.revisionLimitPerPhase !== 1) problems.push('revision limit 1 olmalı');
  return { ok: problems.length === 0, problems, protocolText, protocolHash, expectedId, expectedStoryboard };
}

function verifyArtifact(artifact, command) {
  const problems = [];
  if (artifact?.schema !== ARTIFACT_SCHEMA) problems.push('artifact schema');
  if (artifact?.protocolVersion !== PROTOCOL_VERSION) problems.push('protocolVersion');
  if (artifact?.protocolHash !== command.lifecycle.protocol.contentHash) problems.push('protocolHash');
  if (!Number.isInteger(artifact?.sceneId) || !command.scenes.some((scene) => scene.id === artifact.sceneId)) problems.push('sceneId');
  if (!PROVIDERS.has(artifact?.provider)) problems.push('provider');
  if (!ROLE_PHASE[artifact?.role] || artifact?.phase !== ROLE_PHASE[artifact.role]) problems.push('role/phase');
  if (artifact?.decisionHash !== command.commandId.replace(/^mamilas-/, '')) problems.push('decisionHash');
  if (artifact?.storyboardHash !== command.lifecycle.storyboardHash) problems.push('storyboardHash');
  if (artifact?.revision !== 0 && artifact?.revision !== 1) problems.push('revision');
  if (!Array.isArray(artifact?.inputArtifactHashes)) problems.push('inputArtifactHashes');
  if (!artifact?.contentHash) problems.push('contentHash');
  else {
    const { contentHash, ...body } = artifact;
    if (canonicalHash(body) !== contentHash) problems.push('contentHash tampered');
  }
  if (String(artifact?.role || '').endsWith('_jury')) {
    const verdict = artifact?.content?.verdict;
    if (!JURY.has(verdict)) problems.push('jury verdict');
    if (verdict === 'REJECT' && (!artifact.content.failingCheck?.trim() || !artifact.content.targetedFix?.trim())) problems.push('REJECT evidence');
    if (verdict === 'FACT_REQUIRED' && !artifact.content.factRequired?.trim()) problems.push('FACT_REQUIRED evidence');
  }
  return { ok: problems.length === 0, problems };
}

const artifactAt = (artifacts, role, revision) => artifacts.find((item) => item.role === role && item.revision === revision);

function requiredArtifact(artifacts, role, revision, consumer) {
  const artifact = artifactAt(artifacts, role, revision);
  if (!artifact) throw new Error(`${consumer}: prerequisite ${role}@${revision} yok`);
  return artifact;
}

function expectedInputs(role, revision, artifacts) {
  const latestPassingImageJury = artifacts
    .filter((item) => item.role === 'image_jury' && item.content?.verdict === 'PASS')
    .sort((a, b) => b.revision - a.revision)[0];
  const imageJury = latestPassingImageJury;
  const imageAuthor = imageJury ? requiredArtifact(artifacts, 'image_author', imageJury.revision, role) : null;
  const frameJury = artifactAt(artifacts, 'frame_jury', 0);

  if (role === 'image_author' && revision === 0) return [];
  if (role === 'image_author' && revision === 1) {
    const author0 = requiredArtifact(artifacts, 'image_author', 0, role);
    const jury0 = requiredArtifact(artifacts, 'image_jury', 0, role);
    if (jury0.content?.verdict !== 'REJECT') throw new Error('image_author@1 yalnız REJECT sonrası açılır');
    return [author0.contentHash, jury0.contentHash];
  }
  if (role === 'image_jury') {
    return [requiredArtifact(artifacts, 'image_author', revision, role).contentHash];
  }
  if (role === 'frame_jury') {
    if (!imageAuthor || !imageJury) throw new Error('frame_jury: PASS image zinciri yok');
    return [imageAuthor.contentHash, imageJury.contentHash];
  }
  if (role === 'motion_author') {
    if (!imageAuthor || !imageJury || !frameJury || frameJury.content?.verdict !== 'PASS') {
      throw new Error('motion_author: PASS image/frame zinciri yok');
    }
    const base = [imageAuthor.contentHash, imageJury.contentHash, frameJury.contentHash];
    if (revision === 0) return base;
    const author0 = requiredArtifact(artifacts, 'motion_author', 0, role);
    const jury0 = requiredArtifact(artifacts, 'motion_jury', 0, role);
    if (jury0.content?.verdict !== 'REJECT') throw new Error('motion_author@1 yalnız REJECT sonrası açılır');
    return [...base, author0.contentHash, jury0.contentHash];
  }
  if (role === 'motion_jury') {
    if (!imageAuthor || !imageJury || !frameJury) throw new Error('motion_jury: prerequisite zinciri yok');
    return [
      imageAuthor.contentHash, imageJury.contentHash, frameJury.contentHash,
      requiredArtifact(artifacts, 'motion_author', revision, role).contentHash,
    ];
  }
  throw new Error(`unsupported artifact role: ${role}`);
}

function validateArtifactChain(artifacts, frame) {
  const seen = new Set();
  for (const artifact of artifacts) {
    const key = `${artifact.role}@${artifact.revision}`;
    if (seen.has(key)) throw new Error(`duplicate artifact: ${key}`);
    seen.add(key);
    const expected = expectedInputs(artifact.role, artifact.revision, artifacts);
    if (canonicalize(expected) !== canonicalize(artifact.inputArtifactHashes)) {
      throw new Error(`${key}: inputArtifactHashes zinciri uyuşmuyor`);
    }
    if (['frame_jury', 'motion_author', 'motion_jury'].includes(artifact.role)) {
      if (!frame?.frameHash || artifact.content?.frameHash !== frame.frameHash) {
        throw new Error(`${key}: current frameHash kanıtı yok/stale`);
      }
    }
  }
}

async function loadArtifacts(dir, command) {
  if (!existsSync(dir)) return [];
  const artifacts = [];
  for (const name of readdirSync(dir).filter((item) => item.endsWith('.json')).sort()) {
    const value = JSON.parse(await readFile(join(dir, name), 'utf8'));
    const check = verifyArtifact(value, command);
    if (!check.ok) throw new Error(`${name}: ${check.problems.join(', ')}`);
    artifacts.push(value);
  }
  return artifacts;
}

const latest = (artifacts, role) => artifacts.filter((a) => a.role === role).sort((a, b) => b.revision - a.revision)[0];

function authorJuryAction(artifacts, authorRole, juryRole) {
  const author = latest(artifacts, authorRole);
  const jury = latest(artifacts, juryRole);
  if (!author) return { kind: 'RUN_ROLE', role: authorRole, revision: 0 };
  if (!jury || jury.revision < author.revision) return { kind: 'RUN_ROLE', role: juryRole, revision: author.revision };
  if (jury.content.verdict === 'FACT_REQUIRED') return { kind: 'FACT_REQUIRED', reason: jury.content.factRequired };
  if (jury.content.verdict === 'REJECT') {
    return author.revision === 0
      ? { kind: 'RUN_ROLE', role: authorRole, revision: 1 }
      : { kind: 'FACT_REQUIRED', reason: `revision limiti doldu: ${jury.content.failingCheck}` };
  }
  return null;
}

function nextAction(artifacts, frame) {
  const image = authorJuryAction(artifacts, 'image_author', 'image_jury');
  if (image) return image;
  if (!frame) return { kind: 'AWAIT_FRAME' };
  if (frame.verdict !== 'APPROVE') return { kind: 'AWAIT_MAMI_APPROVE' };
  const frameJury = latest(artifacts, 'frame_jury');
  if (!frameJury) return { kind: 'RUN_ROLE', role: 'frame_jury', revision: 0 };
  if (frameJury.content.verdict !== 'PASS') return { kind: 'FACT_REQUIRED', reason: frameJury.content.factRequired || frameJury.content.failingCheck };
  return authorJuryAction(artifacts, 'motion_author', 'motion_jury') ?? { kind: 'COMPLETE' };
}

function imageContext(command, scene) {
  const directives = (command.lifecycle.mamiDirectives ?? []).filter((d) => d.scope === 'PROJECT' || d.sceneId === scene.id);
  return {
    protocol: command.lifecycle.protocol,
    decision: { commandId: command.commandId, locks: command.baseDecision.locks, engine: command.baseDecision.engine, mode: command.baseDecision.mode },
    storyboardHash: command.lifecycle.storyboardHash,
    shot: { id: scene.id, phaseName: scene.phaseName, durationSec: scene.durationSec, architecture: scene.architecture, sceneBrief: scene.sceneBrief },
    mamiDirectives: directives,
    world: command.worldPacket ? {
      id: command.worldPacket.id,
      renderPhysics: command.worldPacket.renderPhysics,
      figurePhysics: command.worldPacket.figurePhysics,
      environmentPhysics: command.worldPacket.environmentPhysics,
      cameraEnvelope: command.worldPacket.cameraEnvelope,
      lightPhysics: command.worldPacket.lightPhysics,
      materialPhysics: command.worldPacket.materialPhysics,
      negativeLock: command.worldPacket.negativeLock,
      paletteAsLight: command.worldPacket.paletteAsLight,
      refs: (command.worldPacket.refs ?? []).filter((ref) => ref.compatible),
    } : null,
    explicitLocks: { brandKitLock: command.baseDecision.locks.brandKitLock, cast: command.baseDecision.locks.cast, onScreenText: scene.prompts?.onScreenText ?? null },
    continuity: { previousSceneId: scene.id > 1 ? scene.id - 1 : null, nextSceneId: scene.id < command.scenes.length ? scene.id + 1 : null },
  };
}

function roleContext(command, scene, artifacts, frame, action) {
  if (action.role === 'image_author') return imageContext(command, scene);
  if (action.role === 'image_jury') return { decision: command.baseDecision, storyboardHash: command.lifecycle.storyboardHash, shot: imageContext(command, scene).shot, imagePromptArtifact: latest(artifacts, 'image_author') };
  if (action.role === 'frame_jury') return { decision: command.baseDecision, storyboardHash: command.lifecycle.storyboardHash, imagePromptArtifact: latest(artifacts, 'image_author'), frame };
  if (action.role === 'motion_author') return { decision: command.baseDecision, storyboardHash: command.lifecycle.storyboardHash, shot: imageContext(command, scene).shot, mamiDirectives: imageContext(command, scene).mamiDirectives, frame };
  return { decision: command.baseDecision, storyboardHash: command.lifecycle.storyboardHash, imagePromptArtifact: latest(artifacts, 'image_author'), frame, motionArtifact: latest(artifacts, 'motion_author') };
}

function argValue(args, name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function commandCandidates(dir) {
  return readdirSync(dir).filter((name) => name.endsWith('_mamilas_command.json') || name === 'mamilas_command.json').sort();
}

function resolveCommandFile(args) {
  const explicit = argValue(args, '--file') ?? args.find((arg) => !arg.startsWith('--') && arg.endsWith('.json'));
  if (explicit) return resolve(explicit);
  const candidates = commandCandidates(process.cwd());
  if (candidates.length !== 1) throw new Error(`command seçimi belirsiz: ${candidates.length} aday; --file kullan`);
  return join(process.cwd(), candidates[0]);
}

function findExecutable(name) {
  const extensions = process.platform === 'win32' ? (process.env.PATHEXT || '.EXE;.CMD;.BAT').split(';') : [''];
  for (const dir of (process.env.PATH || '').split(delimiter)) {
    for (const extension of extensions) {
      const candidate = join(dir, process.platform === 'win32' ? `${name}${extension.toLowerCase()}` : name);
      if (existsSync(candidate)) return candidate;
      const upper = join(dir, process.platform === 'win32' ? `${name}${extension.toUpperCase()}` : name);
      if (existsSync(upper)) return upper;
    }
  }
  return null;
}

async function launchInteractive(provider, projectDir, workspaceDir) {
  const cli = findExecutable(provider);
  if (!cli) throw new Error(`${provider} CLI bulunamadı`);
  const instruction = 'Read .mamilas/SESSION.md and follow it. Work only on the single role named there; do not call generation APIs.';
  const args = provider === 'codex' ? ['-C', projectDir, instruction] : [instruction];
  const child = process.platform === 'win32' && ['.cmd', '.bat'].includes(extname(cli).toLowerCase())
    ? spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `""${cli}" ${args.map((a) => `"${a.replaceAll('"', '""')}"`).join(' ')}"`], { cwd: projectDir, stdio: 'inherit', windowsVerbatimArguments: true })
    : spawn(cli, args, { cwd: projectDir, stdio: 'inherit' });
  await new Promise((resolvePromise, reject) => { child.on('exit', resolvePromise); child.on('error', reject); });
  return workspaceDir;
}

export async function runCommand(args = process.argv.slice(2)) {
  const file = resolveCommandFile(args);
  const command = JSON.parse(await readFile(file, 'utf8'));
  const check = await validateCommand(command);
  if (!check.ok) throw new Error(check.problems.join(' · '));
  const projectDir = dirname(file);
  const sceneArg = Number(argValue(args, '--scene'));
  const approved = command.scenes.filter((scene) => {
    const approval = command.lifecycle.shotApprovals?.[scene.id];
    return approval?.verdict === 'APPROVED' && approval.commandId === command.commandId;
  });
  const scene = Number.isFinite(sceneArg) && sceneArg > 0 ? command.scenes.find((item) => item.id === sceneArg) : approved[0];
  if (!scene) return { file, validation: 'PASS', action: { kind: 'AWAIT_STORYBOARD_APPROVAL' } };
  const approval = command.lifecycle.shotApprovals?.[scene.id];
  if (approval?.verdict !== 'APPROVED' || approval.commandId !== command.commandId) throw new Error(`scene ${scene.id} current APPROVED değil`);
  const root = resolve(argValue(args, '--workspace') ?? join(projectDir, '.mamilas'));
  const artifactDir = resolve(argValue(args, '--artifacts') ?? join(root, 'artifacts'));
  const artifacts = await loadArtifacts(artifactDir, command);
  const framePath = join(root, 'frames', `${scene.id}.json`);
  const frame = existsSync(framePath) ? JSON.parse(await readFile(framePath, 'utf8')) : null;
  if (frame && (frame.fromCommandId !== command.commandId || !frame.frameHash)) throw new Error(`scene ${scene.id} frame stale/geçersiz`);
  const sceneArtifacts = artifacts.filter((artifact) => artifact.sceneId === scene.id);
  validateArtifactChain(sceneArtifacts, frame);
  const action = nextAction(sceneArtifacts, frame);
  const context = action.kind === 'RUN_ROLE' ? roleContext(command, scene, sceneArtifacts, frame, action) : null;
  const contextText = context ? JSON.stringify(context) : '';
  const result = {
    file, validation: 'PASS', protocolHash: check.protocolHash, commandId: command.commandId,
    storyboardHash: check.expectedStoryboard, sceneId: scene.id, action,
    contextSummary: context ? {
      keys: Object.keys(context),
      byteLength: Buffer.byteLength(contextText, 'utf8'),
      containsSiteGeneratedPrompt: Boolean(scene.prompts?.image && contextText.includes(scene.prompts.image)),
    } : null,
  };
  if (args.includes('--launch')) {
    if (action.kind !== 'RUN_ROLE') throw new Error(`launch yok: ${action.kind}`);
    const provider = argValue(args, '--provider');
    if (!['claude', 'codex'].includes(provider)) throw new Error('--provider claude|codex zorunlu');
    await mkdir(root, { recursive: true });
    await mkdir(artifactDir, { recursive: true });
    await mkdir(join(root, 'frames'), { recursive: true });
    const adapter = await readFile(join(REPO_ROOT, 'agents', 'adapters', `${provider}.md`), 'utf8');
    const role = await readFile(join(REPO_ROOT, 'agents', 'roles', `${action.role.replaceAll('_', '-')}.md`), 'utf8');
    await writeFile(join(root, 'PROTOCOL.md'), check.protocolText, 'utf8');
    await writeFile(join(root, 'ADAPTER.md'), adapter, 'utf8');
    await writeFile(join(root, 'ROLE.md'), role, 'utf8');
    const artifactTemplate = {
      schema: ARTIFACT_SCHEMA,
      protocolVersion: PROTOCOL_VERSION,
      protocolHash: check.protocolHash,
      phase: ROLE_PHASE[action.role],
      role: action.role,
      provider,
      sceneId: scene.id,
      decisionHash: command.commandId.replace(/^mamilas-/, ''),
      storyboardHash: command.lifecycle.storyboardHash,
      inputArtifactHashes: expectedInputs(action.role, action.revision, sceneArtifacts),
      revision: action.revision,
      content: {},
    };
    const sessionContext = { ...context, artifactContract: artifactTemplate };
    const templatePath = join(root, 'ARTIFACT_TEMPLATE.json');
    await writeFile(join(root, 'CONTEXT.json'), JSON.stringify(sessionContext, null, 2), 'utf8');
    await writeFile(templatePath, JSON.stringify(artifactTemplate, null, 2), 'utf8');
    const outputName = `${scene.id}-${action.role}-r${action.revision}.json`;
    await writeFile(join(root, 'SESSION.md'), `# MAMILAS single-role session\n\nProvider: ${provider}\nRole: ${action.role}\nScene: ${scene.id}\nRevision: ${action.revision}\n\nRead PROTOCOL.md, ADAPTER.md, ROLE.md and CONTEXT.json. Edit only the content in ARTIFACT_TEMPLATE.json, then seal it with:\n\nnode "${fileURLToPath(import.meta.url)}" --seal-artifact "${templatePath}" --out "${join(artifactDir, outputName)}"\n\nWrite exactly this one artifact. Do not run another role.\n`, 'utf8');
    const beforeHashes = new Set(sceneArtifacts.map((artifact) => artifact.contentHash));
    await launchInteractive(provider, projectDir, root);
    const after = (await loadArtifacts(artifactDir, command)).filter((artifact) => artifact.sceneId === scene.id);
    const created = after.filter((artifact) => !beforeHashes.has(artifact.contentHash));
    if (created.length !== 1) throw new Error(`oturum tam bir yeni artifact üretmeli; bulunan ${created.length}`);
    const produced = created[0];
    if (produced.role !== action.role || produced.revision !== action.revision || produced.provider !== provider) {
      throw new Error('oturum yanlış role/revision/provider artifact üretti');
    }
    validateArtifactChain(after, frame);
  }
  return result;
}

export async function sealArtifactDraft(args = process.argv.slice(2)) {
  const draftPath = resolve(argValue(args, '--seal-artifact'));
  const output = argValue(args, '--out');
  if (!output) throw new Error('--seal-artifact için --out zorunlu');
  const draft = JSON.parse(await readFile(draftPath, 'utf8'));
  const { contentHash: _ignored, ...body } = draft;
  const sealed = { ...body, contentHash: canonicalHash(body) };
  await writeFile(resolve(output), JSON.stringify(sealed, null, 2), 'utf8');
  return { output: resolve(output), contentHash: sealed.contentHash };
}

async function main() {
  try {
    const result = process.argv.includes('--seal-artifact')
      ? await sealArtifactDraft()
      : await runCommand();
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`mamilas-command: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await main();
