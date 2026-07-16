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
import sharp from 'sharp';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');
const PROTOCOL_PATH = join(REPO_ROOT, 'agents', 'PROTOCOL.md');
const ARTIFACT_SCHEMA = 'mamilas.agent-artifact.v1';
const STORYBOARD_APPROVAL_SCHEMA = 'mamilas.storyboard-approval.v1';
const FRAME_RECEIPT_SCHEMA = 'mamilas.frame-receipt.v1';
const PROTOCOL_VERSION = 'mamilas.agent-protocol.v1';
const JURY = new Set(['PASS', 'REJECT', 'FACT_REQUIRED']);
const FRAME_VERDICTS = new Set(['APPROVE', 'REGENERATE', 'PROJECT_ONLY_ACCEPT', 'PENDING']);
const PROVIDERS = new Set(['claude', 'codex']);
const ROLE_PHASE = {
  image_author: 'IMAGE_PROMPT', image_jury: 'IMAGE_JURY', frame_jury: 'FRAME_JURY',
  motion_author: 'MOTION', motion_jury: 'MOTION_JURY',
};
// This must mirror IMAGE_PROMPT_QUALITY_CONTRACT in src/core/agentProtocol.ts:
// it is part of the sealed Image Author context, so a runner that drifts fails
// the sceneContextHash validation before it can launch a provider.
const IMAGE_PROMPT_QUALITY_CONTRACT = Object.freeze({
  frameBuildOrder: [
    'visible subject + decisive action + physical place',
    'one compositional relationship that makes the beat readable',
    'one camera relation plus one motivated light or material behaviour from the selected world',
    'only the narrow, frame-specific constraints that protect the beat',
  ],
  requiredEvidence: [
    'A viewer can name who or what is dominant, what is happening, and where it is happening without reading style language.',
    'The composition describes a physical relationship, threshold, foreground/background separation, or eyeline rather than an abstract mood.',
    'World and reference DNA become an observable choice in this frame; they never introduce a second subject, story, location, era, or identity.',
  ],
  referencePolicy: [
    'Compatible references are subordinate visual grammar, never a source of plot, named identity, or location.',
    'Choose at most one reference-derived observable cue when it strengthens this shot; do not list or blend reference catalogues.',
  ],
  rejectIf: [
    'Generic quality adjectives or a style catalogue carry more meaning than the approved beat.',
    'The prompt could describe a different scene after the subject, action, and place are removed.',
    'A fallback topic competes with a RAW_SOURCE_VAULT shot.',
    'A reference supplies invented narrative facts, protected identity, brand, period, or location.',
  ],
});

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

/**
 * Explicit, local-only migration for a command exported by an older trusted
 * MAMILAS runtime. It changes no decision or scene data: it only reseals the
 * derived storyboard/context hashes after the runtime context schema evolves.
 * Normal execution still rejects stale commands; migration is never implicit.
 */
export function migrateCommandToCurrentContext(command) {
  const migrated = JSON.parse(JSON.stringify(command));
  if (!Array.isArray(migrated.scenes) || !migrated.lifecycle || !migrated.baseDecision) {
    throw new Error('command migration için canonical command alanları eksik');
  }
  migrated.lifecycle.storyboardHash = storyboardHash(migrated.scenes);
  migrated.lifecycle.sceneContextHashes = Object.fromEntries(migrated.scenes.map((scene) => [
    scene.id,
    canonicalHash({ imageAuthor: imageContext(migrated, scene), motionEngine: scene.motionEngine }),
  ]));
  return migrated;
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
  const expectedDirectives = command?.baseDecision?.creativeControls?.directorBrief?.trim()
    ? [{ id: 'site-directive-001', source: 'SITE', scope: 'PROJECT', sceneId: null, text: command.baseDecision.creativeControls.directorBrief }]
    : [];
  const decisionDirectives = command?.baseDecision?.mamiDirectives;
  if (!Array.isArray(decisionDirectives)) problems.push('baseDecision MamiDirectives yok');
  else {
    const siteDirectives = decisionDirectives.filter((item) => item?.source === 'SITE');
    if (canonicalize(siteDirectives) !== canonicalize(expectedDirectives)) problems.push('SITE MamiDirectives projection stale/tampered');
    const ids = new Set();
    for (const directive of decisionDirectives) {
      if (!directive || typeof directive.id !== 'string' || ids.has(directive.id)) problems.push('MamiDirective id geçersiz/duplicate');
      ids.add(directive?.id);
      if (!['SITE', 'LIVE_CHAT'].includes(directive?.source)) problems.push('MamiDirective source geçersiz');
      if (!['PROJECT', 'SCENE'].includes(directive?.scope)) problems.push('MamiDirective scope geçersiz');
      if (typeof directive?.text !== 'string' || !directive.text.trim()) problems.push('MamiDirective text boş');
      if (directive?.scope === 'PROJECT' && directive.sceneId !== null) problems.push('PROJECT directive sceneId null olmalı');
      if (directive?.scope === 'SCENE' && !command.scenes.some((scene) => scene.id === directive.sceneId)) problems.push('SCENE directive sceneId geçersiz');
      if (directive?.source === 'LIVE_CHAT') {
        const identity = { source: directive.source, scope: directive.scope, sceneId: directive.sceneId, text: directive.text };
        const expectedLiveId = `live-${canonicalHash(identity).slice(0, 16)}`;
        if (directive.id !== expectedLiveId) problems.push('LIVE_CHAT directive id stale/tampered');
      }
    }
    if (canonicalize(command?.lifecycle?.mamiDirectives ?? []) !== canonicalize(decisionDirectives)) {
      problems.push('MamiDirectives exact projection stale/tampered');
    }
  }
  if (!command?.lifecycle?.sceneContextHashes || typeof command.lifecycle.sceneContextHashes !== 'object') {
    problems.push('sceneContextHashes yok');
  } else if (Array.isArray(command?.scenes)) {
    for (const scene of command.scenes) {
      const stored = command.lifecycle.sceneContextHashes[scene.id];
      const actual = canonicalHash({ imageAuthor: imageContext(command, scene), motionEngine: scene.motionEngine });
      if (stored !== actual) problems.push(`scene ${scene.id} contextHash stale/tampered`);
    }
  }
  return { ok: problems.length === 0, problems, protocolText, protocolHash, expectedId, expectedStoryboard };
}

function nonEmptyStrings(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string') && value.length > 0;
}

function validateRoleContent(artifact, command) {
  const problems = [];
  const content = artifact?.content;
  if (!content || typeof content !== 'object' || Array.isArray(content)) return ['content object'];
  const scene = command.scenes.find((item) => item.id === artifact.sceneId);
  const directives = (command.lifecycle.mamiDirectives ?? [])
    .filter((item) => item.scope === 'PROJECT' || item.sceneId === artifact.sceneId);
  if (artifact.role === 'image_author') {
    if (typeof content.prompt !== 'string' || !content.prompt.trim()) problems.push('image prompt');
    if (content.promptHash !== sha256(content.prompt ?? '')) problems.push('image promptHash');
    // BRAIN M3: yorum şeffaf olmak zorunda — dominant özne/tek olay/donmuş an tek-satır receipt.
    // Onay kapısı DEĞİLDİR (akış durmaz); yalnız görünürlük zorlanır. agentProtocol.ts ile aynı yasa.
    const interp = content.interpretation;
    if (!interp || typeof interp !== 'object'
      || typeof interp.dominantSubject !== 'string' || !interp.dominantSubject.trim()
      || typeof interp.singleEvent !== 'string' || !interp.singleEvent.trim()
      || typeof interp.frozenInstant !== 'string' || !interp.frozenInstant.trim()) {
      problems.push('interpretation receipt eksik (dominantSubject/singleEvent/frozenInstant)');
    }
    if (!Array.isArray(content.directiveReceipts)) problems.push('directiveReceipts');
    else {
      const normalized = content.directiveReceipts.map((item) => ({ id: item?.id, text: item?.text, status: item?.status }));
      const expected = directives.map((item) => ({ id: item.id, text: item.text, status: normalized.find((receipt) => receipt.id === item.id)?.status }));
      if (canonicalize(normalized.map((item) => ({ ...item })).sort((a, b) => String(a.id).localeCompare(String(b.id)))) !==
          canonicalize(expected.sort((a, b) => String(a.id).localeCompare(String(b.id))))) problems.push('directiveReceipts exact');
      if (normalized.some((item) => !['APPLIED', 'SUPPRESSED'].includes(item.status))) problems.push('directiveReceipts status');
    }
    if (!nonEmptyStrings(content.appliedLocks)) problems.push('appliedLocks');
    if (!Array.isArray(content.suppressedContext)) problems.push('suppressedContext');
    if (!Array.isArray(content.risks)) problems.push('risks');
    if (/\[DIRECTOR TASK\]|\bTODO\b|#[0-9a-f]{3,8}\b/i.test(content.prompt ?? '')) problems.push('image prompt workflow/hex leak');
  } else if (artifact.role === 'motion_author') {
    if (typeof content.prompt !== 'string' || !content.prompt.trim()) problems.push('motion prompt');
    if (content.promptHash !== sha256(content.prompt ?? '')) problems.push('motion promptHash');
    if (!nonEmptyStrings(content.inventory)) problems.push('motion inventory');
    if (!Array.isArray(content.risks)) problems.push('motion risks');
    if (typeof content.frameHash !== 'string') problems.push('motion frameHash');
  } else if (String(artifact.role || '').endsWith('_jury')) {
    const verdict = content.verdict;
    if (!JURY.has(verdict)) problems.push('jury verdict');
    if (!nonEmptyStrings(content.evidence)) problems.push('jury evidence');
    if (verdict === 'REJECT' && (!content.failingCheck?.trim() || !content.targetedFix?.trim())) problems.push('REJECT evidence');
    if (verdict === 'FACT_REQUIRED' && !content.factRequired?.trim()) problems.push('FACT_REQUIRED evidence');
    if (['frame_jury', 'motion_jury'].includes(artifact.role) && typeof content.frameHash !== 'string') problems.push('jury frameHash');
  }
  if (!scene) problems.push('content scene');
  return problems;
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
  problems.push(...validateRoleContent(artifact, command));
  return { ok: problems.length === 0, problems };
}

const artifactAt = (artifacts, role, revision) => artifacts.find((item) => item.role === role && item.revision === revision);

function requiredArtifact(artifacts, role, revision, consumer) {
  const artifact = artifactAt(artifacts, role, revision);
  if (!artifact) throw new Error(`${consumer}: prerequisite ${role}@${revision} yok`);
  return artifact;
}

function expectedInputs(role, revision, artifacts, command, sceneId, frame) {
  const contextHash = command.lifecycle.sceneContextHashes[sceneId];
  const latestPassingImageJury = artifacts
    .filter((item) => item.role === 'image_jury' && item.content?.verdict === 'PASS')
    .sort((a, b) => b.revision - a.revision)[0];
  const imageJury = latestPassingImageJury;
  const imageAuthor = imageJury ? requiredArtifact(artifacts, 'image_author', imageJury.revision, role) : null;
  const frameJury = artifactAt(artifacts, 'frame_jury', 0);

  if (role === 'image_author' && revision === 0) return [contextHash];
  if (role === 'image_author' && revision === 1) {
    const author0 = requiredArtifact(artifacts, 'image_author', 0, role);
    const jury0 = requiredArtifact(artifacts, 'image_jury', 0, role);
    if (jury0.content?.verdict !== 'REJECT') throw new Error('image_author@1 yalnız REJECT sonrası açılır');
    return [contextHash, author0.contentHash, jury0.contentHash];
  }
  if (role === 'image_jury') {
    return [contextHash, requiredArtifact(artifacts, 'image_author', revision, role).contentHash];
  }
  if (role === 'frame_jury') {
    if (!imageAuthor || !imageJury) throw new Error('frame_jury: PASS image zinciri yok');
    if (!frame?.contentHash) throw new Error('frame_jury: current frame receipt yok');
    return [contextHash, imageAuthor.contentHash, imageJury.contentHash, frame.contentHash];
  }
  if (role === 'motion_author') {
    if (!imageAuthor || !imageJury || !frameJury || frameJury.content?.verdict !== 'PASS') {
      throw new Error('motion_author: PASS image/frame zinciri yok');
    }
    if (!frame?.contentHash) throw new Error('motion_author: current frame receipt yok');
    const base = [contextHash, imageAuthor.contentHash, imageJury.contentHash, frame.contentHash, frameJury.contentHash];
    if (revision === 0) return base;
    const author0 = requiredArtifact(artifacts, 'motion_author', 0, role);
    const jury0 = requiredArtifact(artifacts, 'motion_jury', 0, role);
    if (jury0.content?.verdict !== 'REJECT') throw new Error('motion_author@1 yalnız REJECT sonrası açılır');
    return [...base, author0.contentHash, jury0.contentHash];
  }
  if (role === 'motion_jury') {
    if (!imageAuthor || !imageJury || !frameJury) throw new Error('motion_jury: prerequisite zinciri yok');
    return [
      contextHash, imageAuthor.contentHash, imageJury.contentHash, frame.contentHash, frameJury.contentHash,
      requiredArtifact(artifacts, 'motion_author', revision, role).contentHash,
    ];
  }
  throw new Error(`unsupported artifact role: ${role}`);
}

function validateArtifactChain(artifacts, frame, command, sceneId) {
  const seen = new Set();
  for (const artifact of artifacts) {
    const key = `${artifact.role}@${artifact.revision}`;
    if (seen.has(key)) throw new Error(`duplicate artifact: ${key}`);
    seen.add(key);
    const expected = expectedInputs(artifact.role, artifact.revision, artifacts, command, sceneId, frame);
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

async function parseImageDimensions(bytes) {
  try {
    const decoder = sharp(bytes, { failOn: 'error', limitInputPixels: 100_000_000 });
    const metadata = await decoder.metadata();
    if (!['png', 'jpeg', 'webp'].includes(metadata.format)) throw new Error('desteklenmeyen format');
    // metadata() only parses headers. raw().toBuffer() forces a complete pixel decode.
    const { info } = await decoder.clone().rotate().raw().toBuffer({ resolveWithObject: true });
    if (!Number.isInteger(info.width) || info.width <= 0 || !Number.isInteger(info.height) || info.height <= 0) {
      throw new Error('pixel dimensions geçersiz');
    }
    return { width: info.width, height: info.height, format: metadata.format };
  } catch (error) {
    throw new Error(`frame tam decode edilebilir PNG/JPEG/WebP değil: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function passingImageArtifacts(artifacts) {
  const jury = artifacts
    .filter((item) => item.role === 'image_jury' && item.content?.verdict === 'PASS')
    .sort((a, b) => b.revision - a.revision)[0];
  const author = jury ? artifactAt(artifacts, 'image_author', jury.revision) : null;
  return { author, jury };
}

function storyboardApprovalBody(command, scene) {
  return {
    schema: STORYBOARD_APPROVAL_SCHEMA,
    sceneId: scene.id,
    commandId: command.commandId,
    storyboardHash: command.lifecycle.storyboardHash,
    sceneContextHash: command.lifecycle.sceneContextHashes[scene.id],
    verdict: 'APPROVED',
  };
}

async function loadStoryboardApproval(root, command, scene) {
  const file = join(root, 'approvals', `${scene.id}.json`);
  if (!existsSync(file)) return { ok: false, source: null };
  const value = JSON.parse(await readFile(file, 'utf8'));
  const { contentHash, ...body } = value;
  if (canonicalize(body) !== canonicalize(storyboardApprovalBody(command, scene)) || canonicalHash(body) !== contentHash) {
    throw new Error(`scene ${scene.id} storyboard approval stale/tampered`);
  }
  return { ok: true, source: 'WORKSPACE' };
}

async function approveStoryboard(root, command, scene) {
  const body = storyboardApprovalBody(command, scene);
  const value = { ...body, contentHash: canonicalHash(body) };
  await mkdir(join(root, 'approvals'), { recursive: true });
  const file = join(root, 'approvals', `${scene.id}.json`);
  await writeFile(file, JSON.stringify(value, null, 2), 'utf8');
  return { file, approvalHash: value.contentHash };
}

async function addLiveDirective(command, commandFile, args) {
  const sourceFile = argValue(args, '--add-directive-file');
  if (!sourceFile) throw new Error('--add-directive-file için UTF-8 metin dosyası zorunlu');
  const text = await readFile(resolve(sourceFile), 'utf8');
  if (!text.trim()) throw new Error('LIVE_CHAT MamiDirective boş olamaz');
  const scope = argValue(args, '--scope') ?? 'PROJECT';
  if (!['PROJECT', 'SCENE'].includes(scope)) throw new Error('--scope PROJECT|SCENE olmalı');
  const sceneValue = Number(argValue(args, '--scene'));
  const sceneId = scope === 'SCENE' ? sceneValue : null;
  if (scope === 'SCENE' && (!Number.isInteger(sceneId) || !command.scenes.some((scene) => scene.id === sceneId))) {
    throw new Error('SCENE directive için geçerli --scene zorunlu');
  }
  const identity = { source: 'LIVE_CHAT', scope, sceneId, text };
  const directive = { id: `live-${sha256(canonicalize(identity)).slice(0, 16)}`, ...identity };
  if ((command.lifecycle.mamiDirectives ?? []).some((item) => item.id === directive.id)) {
    throw new Error(`LIVE_CHAT directive zaten mevcut: ${directive.id}`);
  }
  const updated = JSON.parse(JSON.stringify(command));
  const existing = updated.baseDecision.mamiDirectives ?? [];
  updated.baseDecision.mamiDirectives = [...existing.filter((item) => item.id !== directive.id), directive];
  updated.lifecycle.mamiDirectives = [...updated.baseDecision.mamiDirectives];
  updated.lifecycle.shotApprovals = {};
  updated.commandId = `mamilas-${canonicalHash(updated.baseDecision)}`;
  updated.lifecycle.sceneContextHashes = Object.fromEntries(updated.scenes.map((scene) => [
    scene.id,
    canonicalHash({ imageAuthor: imageContext(updated, scene), motionEngine: scene.motionEngine }),
  ]));
  const output = resolve(argValue(args, '--out') ?? join(dirname(commandFile), `${directive.id}_mamilas_command.json`));
  await writeFile(output, JSON.stringify(updated, null, 2), 'utf8');
  return { output, commandId: updated.commandId, directive };
}

async function loadFrame(root, command, scene, artifacts) {
  const receiptPath = join(root, 'frames', `${scene.id}.json`);
  if (!existsSync(receiptPath)) return null;
  const receipt = JSON.parse(await readFile(receiptPath, 'utf8'));
  const { contentHash, ...body } = receipt;
  if (canonicalHash(body) !== contentHash) throw new Error(`scene ${scene.id} frame receipt tampered`);
  if (receipt.schema !== FRAME_RECEIPT_SCHEMA || receipt.sceneId !== scene.id) throw new Error(`scene ${scene.id} frame receipt schema/scene`);
  if (receipt.fromCommandId !== command.commandId || receipt.storyboardHash !== command.lifecycle.storyboardHash) throw new Error(`scene ${scene.id} frame stale`);
  if (!FRAME_VERDICTS.has(receipt.verdict)) throw new Error(`scene ${scene.id} frame verdict geçersiz`);
  const { author, jury } = passingImageArtifacts(artifacts);
  if (!author || !jury || receipt.fromImagePromptArtifactHash !== author.contentHash) throw new Error(`scene ${scene.id} frame prompt bağı stale`);
  const localPath = resolve(join(root, 'frames', receipt.storedFile ?? ''));
  const frameDir = `${resolve(join(root, 'frames'))}${process.platform === 'win32' ? '\\' : '/'}`;
  if (!localPath.startsWith(frameDir) || !existsSync(localPath)) throw new Error(`scene ${scene.id} gerçek frame dosyası yok/geçersiz yol`);
  const bytes = await readFile(localPath);
  const dimensions = await parseImageDimensions(bytes);
  const actualHash = createHash('sha256').update(bytes).digest('hex');
  const aspect = Number((dimensions.width / dimensions.height).toFixed(3));
  if (receipt.frameHash !== actualHash || receipt.byteSize !== bytes.length || receipt.width !== dimensions.width || receipt.height !== dimensions.height || receipt.aspect !== aspect) {
    throw new Error(`scene ${scene.id} gerçek frame byte/hash/dimension uyuşmuyor`);
  }
  return { ...receipt, localPath };
}

async function importFrame(root, command, scene, artifacts, sourcePath, verdict) {
  if (!FRAME_VERDICTS.has(verdict)) throw new Error('--verdict APPROVE|REGENERATE|PROJECT_ONLY_ACCEPT|PENDING olmalı');
  const { author, jury } = passingImageArtifacts(artifacts);
  if (!author || !jury) throw new Error('frame import için PASS image author→jury zinciri zorunlu');
  const bytes = await readFile(resolve(sourcePath));
  const dimensions = await parseImageDimensions(bytes);
  if (dimensions.width <= 0 || dimensions.height <= 0 || bytes.length <= 0) throw new Error('frame dimensions/bytes geçersiz');
  const framesDir = join(root, 'frames');
  await mkdir(framesDir, { recursive: true });
  const storedFile = `${scene.id}.${dimensions.format === 'jpeg' ? 'jpg' : dimensions.format}`;
  await writeFile(join(framesDir, storedFile), bytes);
  const body = {
    schema: FRAME_RECEIPT_SCHEMA,
    sceneId: scene.id,
    fromCommandId: command.commandId,
    storyboardHash: command.lifecycle.storyboardHash,
    fromImagePromptArtifactHash: author.contentHash,
    frameHash: createHash('sha256').update(bytes).digest('hex'),
    width: dimensions.width,
    height: dimensions.height,
    aspect: Number((dimensions.width / dimensions.height).toFixed(3)),
    byteSize: bytes.length,
    originalFileName: sourcePath.split(/[\\/]/).pop(),
    storedFile,
    verdict,
  };
  const receipt = { ...body, contentHash: canonicalHash(body) };
  const receiptPath = join(framesDir, `${scene.id}.json`);
  await writeFile(receiptPath, JSON.stringify(receipt, null, 2), 'utf8');
  return { receiptPath, frameHash: receipt.frameHash, width: receipt.width, height: receipt.height, verdict };
}

async function exportImageBundle(root, command, scene, artifacts, outputArg) {
  const { author, jury } = passingImageArtifacts(artifacts);
  if (!author || !jury) throw new Error('site import bundle için PASS image author→jury zinciri zorunlu');
  const imageArtifacts = artifacts
    .filter((artifact) => (artifact.role === 'image_author' || artifact.role === 'image_jury') && artifact.revision <= jury.revision)
    .sort((a, b) => a.revision - b.revision || a.role.localeCompare(b.role));
  const body = { schema: 'mamilas.image-artifact-bundle.v1', command, artifacts: imageArtifacts };
  const output = resolve(outputArg ?? join(root, 'site-import', `scene-${scene.id}-image-bundle.json`));
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(body, null, 2), 'utf8');
  return { output, artifactCount: imageArtifacts.length, authorHash: author.contentHash, juryHash: jury.contentHash };
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
  const locks = { ...(command.baseDecision?.locks ?? {}) };
  if (command.baseDecision?.source?.authority === 'RAW_SOURCE_VAULT' && command.baseDecision.source.rawSource?.trim()) {
    delete locks.topic;
  }
  return {
    protocol: command.lifecycle.protocol,
    promptQuality: IMAGE_PROMPT_QUALITY_CONTRACT,
    decision: { commandId: command.commandId, locks, engine: command.baseDecision.engine, mode: command.baseDecision.mode },
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
      // BRAIN M2 (Sol #1): render_law'dan ayrılan envanter cümleleri bu kanalda yaşar —
      // yaratıcı REFERANS, kadro/prop EMRİ değil (commandExport.ts:460).
      vocabularyExamples: command.worldPacket.vocabularyExamples,
      refs: (command.worldPacket.refs ?? []).filter((ref) => ref.compatible),
      referencePolicy: IMAGE_PROMPT_QUALITY_CONTRACT.referencePolicy,
    } : null,
    explicitLocks: {
      brandKitLock: command.baseDecision.locks.brandKitLock,
      cast: command.baseDecision.locks.cast,
      onScreenText: scene.prompts?.onScreenText ?? null,
      mamiPromptOverride: command.baseDecision.overrides?.find((item) => item.sceneId === scene.id)?.userImagePrompt ?? null,
    },
    targetEngine: command.baseDecision.engine.imageModel,
    failureModes: scene.handoff?.IMAGE?.avoid ?? null,
    continuity: {
      previousSceneId: scene.id > 1 ? command.scenes[command.scenes.findIndex((item) => item.id === scene.id) - 1]?.id ?? null : null,
      nextSceneId: command.scenes[command.scenes.findIndex((item) => item.id === scene.id) + 1]?.id ?? null,
    },
  };
}

function roleDecision(command) {
  return {
    commandId: command.commandId,
    locks: command.baseDecision.locks,
    engine: command.baseDecision.engine,
    mode: command.baseDecision.mode,
    creativeControls: command.baseDecision.creativeControls,
    deliveryPromise: command.baseDecision.deliveryPromise,
  };
}

function roleContext(command, scene, artifacts, frame, action) {
  const image = imageContext(command, scene);
  if (action.role === 'image_author') return image;
  if (action.role === 'image_jury') return {
    decision: roleDecision(command), storyboardHash: command.lifecycle.storyboardHash,
    promptQuality: image.promptQuality, shot: image.shot, mamiDirectives: image.mamiDirectives, imagePromptArtifact: latest(artifacts, 'image_author'),
  };
  if (action.role === 'frame_jury') return {
    decision: roleDecision(command), storyboardHash: command.lifecycle.storyboardHash,
    shot: image.shot, mamiDirectives: image.mamiDirectives, imagePromptArtifact: latest(artifacts, 'image_author'), frame,
  };
  if (action.role === 'motion_author') return {
    decision: roleDecision(command), storyboardHash: command.lifecycle.storyboardHash,
    shot: image.shot, mamiDirectives: image.mamiDirectives, explicitLocks: image.explicitLocks,
    continuity: image.continuity, frame, engine: scene.motionEngine,
  };
  return {
    decision: roleDecision(command), storyboardHash: command.lifecycle.storyboardHash,
    shot: image.shot, mamiDirectives: image.mamiDirectives, continuity: image.continuity,
    imagePromptArtifact: latest(artifacts, 'image_author'), frame,
    motionArtifact: latest(artifacts, 'motion_author'), engine: scene.motionEngine,
  };
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
  const instruction = `Read ${JSON.stringify(join(workspaceDir, 'SESSION.md'))} and follow it. Work only on the single role named there; do not call generation APIs.`;
  const args = provider === 'codex' ? ['-C', projectDir, instruction] : [instruction];
  const child = process.platform === 'win32' && ['.cmd', '.bat'].includes(extname(cli).toLowerCase())
    ? spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `""${cli}" ${args.map((a) => `"${a.replaceAll('"', '""')}"`).join(' ')}"`], { cwd: projectDir, stdio: 'inherit', windowsVerbatimArguments: true })
    : spawn(cli, args, { cwd: projectDir, stdio: 'inherit' });
  const exitCode = await new Promise((resolvePromise, reject) => { child.on('exit', resolvePromise); child.on('error', reject); });
  if (exitCode !== 0) throw new Error(`${provider} oturumu başarısız çıktı: ${exitCode}`);
  return workspaceDir;
}

function artifactContentTemplate(role, command, scene) {
  if (role === 'image_author') return {
    prompt: '', promptHash: '',
    // BRAIN M3: zorunlu şeffaf yorum receipt'i — template boş alanları gösterir ki
    // ilk gerçek author çıktısı şema yüzünden reddedilmesin.
    interpretation: { dominantSubject: '', singleEvent: '', frozenInstant: '' },
    directiveReceipts: (command.lifecycle.mamiDirectives ?? [])
      .filter((item) => item.scope === 'PROJECT' || item.sceneId === scene.id)
      .map((item) => ({ id: item.id, text: item.text, status: '' })),
    appliedLocks: [], suppressedContext: [], risks: [],
  };
  if (role === 'motion_author') return { frameHash: '', inventory: [], prompt: '', promptHash: '', risks: [] };
  if (role === 'frame_jury' || role === 'motion_jury') return { verdict: '', frameHash: '', evidence: [] };
  return { verdict: '', evidence: [] };
}

export async function runCommand(args = process.argv.slice(2)) {
  const file = resolveCommandFile(args);
  const command = JSON.parse(await readFile(file, 'utf8'));
  if (args.includes('--migrate-command-context')) {
    const migrated = migrateCommandToCurrentContext(command);
    const migratedCheck = await validateCommand(migrated);
    if (!migratedCheck.ok) throw new Error(`command migration reddedildi: ${migratedCheck.problems.join(' · ')}`);
    const output = resolve(argValue(args, '--out') ?? file);
    await writeFile(output, JSON.stringify(migrated, null, 2), 'utf8');
    return {
      file: output,
      validation: 'PASS',
      commandId: migrated.commandId,
      storyboardHash: migrated.lifecycle.storyboardHash,
      action: { kind: 'COMMAND_CONTEXT_MIGRATED' },
    };
  }
  const check = await validateCommand(command);
  if (!check.ok) throw new Error(check.problems.join(' · '));
  if (args.includes('--add-directive-file')) {
    const added = await addLiveDirective(command, file, args);
    return { file, validation: 'PASS', action: { kind: 'DIRECTIVE_ADDED' }, ...added };
  }
  const projectDir = dirname(file);
  const root = resolve(argValue(args, '--workspace') ?? join(projectDir, '.mamilas'));
  const artifactDir = resolve(argValue(args, '--artifacts') ?? join(root, 'artifacts'));
  const sceneArg = Number(argValue(args, '--scene'));
  const explicitScene = Number.isFinite(sceneArg) && sceneArg > 0
    ? command.scenes.find((item) => item.id === sceneArg)
    : null;
  if (Number.isFinite(sceneArg) && sceneArg > 0 && !explicitScene) throw new Error(`scene ${sceneArg} yok`);

  if (args.includes('--approve-storyboard')) {
    if (!explicitScene) throw new Error('--approve-storyboard için --scene zorunlu');
    await mkdir(root, { recursive: true });
    const approval = await approveStoryboard(root, command, explicitScene);
    return { file, validation: 'PASS', sceneId: explicitScene.id, action: { kind: 'STORYBOARD_APPROVED' }, ...approval };
  }

  const artifacts = await loadArtifacts(artifactDir, command);
  if (args.includes('--export-image-bundle')) {
    if (!explicitScene) throw new Error('--export-image-bundle için --scene zorunlu');
    const approval = await loadStoryboardApproval(root, command, explicitScene);
    if (!approval.ok) throw new Error(`scene ${explicitScene.id} storyboard APPROVE değil`);
    const sceneArtifacts = artifacts.filter((artifact) => artifact.sceneId === explicitScene.id);
    validateArtifactChain(sceneArtifacts, null, command, explicitScene.id);
    const exported = await exportImageBundle(root, command, explicitScene, sceneArtifacts, argValue(args, '--out'));
    return { file, validation: 'PASS', sceneId: explicitScene.id, action: { kind: 'IMAGE_BUNDLE_EXPORTED' }, ...exported };
  }
  if (args.includes('--import-frame')) {
    if (!explicitScene) throw new Error('--import-frame için --scene zorunlu');
    const approval = await loadStoryboardApproval(root, command, explicitScene);
    if (!approval.ok) throw new Error(`scene ${explicitScene.id} storyboard APPROVE değil`);
    const sceneArtifacts = artifacts.filter((artifact) => artifact.sceneId === explicitScene.id);
    validateArtifactChain(sceneArtifacts, null, command, explicitScene.id);
    const imported = await importFrame(
      root, command, explicitScene, sceneArtifacts,
      argValue(args, '--import-frame'), argValue(args, '--verdict') ?? 'PENDING',
    );
    return { file, validation: 'PASS', sceneId: explicitScene.id, action: { kind: 'FRAME_IMPORTED' }, ...imported };
  }

  let selected = null;
  const candidates = explicitScene ? [explicitScene] : command.scenes;
  for (const candidate of candidates) {
    const approval = await loadStoryboardApproval(root, command, candidate);
    if (!approval.ok) {
      selected = { scene: candidate, artifacts: [], frame: null, action: { kind: 'AWAIT_STORYBOARD_APPROVAL' } };
      break;
    }
    const sceneArtifacts = artifacts.filter((artifact) => artifact.sceneId === candidate.id);
    const frame = await loadFrame(root, command, candidate, sceneArtifacts);
    validateArtifactChain(sceneArtifacts, frame, command, candidate.id);
    const action = nextAction(sceneArtifacts, frame);
    if (action.kind !== 'COMPLETE' || explicitScene) {
      selected = { scene: candidate, artifacts: sceneArtifacts, frame, action };
      break;
    }
  }
  if (!selected) return {
    file, validation: 'PASS', protocolHash: check.protocolHash, commandId: command.commandId,
    storyboardHash: check.expectedStoryboard, sceneId: null, action: { kind: 'COMPLETE' }, contextSummary: null,
  };
  const { scene, artifacts: sceneArtifacts, frame, action } = selected;
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
      inputArtifactHashes: expectedInputs(action.role, action.revision, sceneArtifacts, command, scene.id, frame),
      revision: action.revision,
      content: artifactContentTemplate(action.role, command, scene),
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
    validateArtifactChain(after, frame, command, scene.id);
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
