import PROTOCOL_TEXT from '../../agents/PROTOCOL.md?raw';
import { canonicalHash, sha256Hex } from './contract';
import { engineDialect, engineUsableSec } from './engine';

export const AGENT_PROTOCOL_VERSION = 'mamilas.agent-protocol.v1' as const;
export const AGENT_ARTIFACT_SCHEMA = 'mamilas.agent-artifact.v1' as const;

export type AgentProvider = 'claude' | 'codex';
export type AgentRole = 'embedded_director' | 'image_author' | 'image_jury' | 'frame_jury' | 'motion_author' | 'motion_jury';
export type AgentPhase = 'DIRECTIVE' | 'IMAGE_PROMPT' | 'IMAGE_JURY' | 'FRAME_JURY' | 'MOTION' | 'MOTION_JURY';
export type JuryVerdict = 'PASS' | 'REJECT' | 'FACT_REQUIRED';

export interface MamiDirective {
  id: string;
  source: 'SITE' | 'LIVE_CHAT';
  scope: 'PROJECT' | 'SCENE';
  sceneId: number | null;
  /** Exact Mami text. Never scrub, summarize or silently rewrite. */
  text: string;
}

export interface JuryContent {
  verdict: JuryVerdict;
  failingCheck?: string;
  targetedFix?: string;
  factRequired?: string;
  evidence?: string[];
}

export interface AgentArtifact<T = unknown> {
  schema: typeof AGENT_ARTIFACT_SCHEMA;
  protocolVersion: typeof AGENT_PROTOCOL_VERSION;
  protocolHash: string;
  phase: AgentPhase;
  role: AgentRole;
  provider: AgentProvider;
  sceneId: number;
  decisionHash: string;
  storyboardHash: string;
  inputArtifactHashes: string[];
  revision: 0 | 1;
  content: T;
  contentHash: string;
}

type ArtifactDraft<T> = Omit<AgentArtifact<T>, 'schema' | 'protocolVersion' | 'protocolHash' | 'contentHash'>;

export function protocolDescriptor() {
  return {
    version: AGENT_PROTOCOL_VERSION,
    contentHash: sha256Hex(PROTOCOL_TEXT),
  } as const;
}

function artifactBody<T>(draft: ArtifactDraft<T>) {
  const protocol = protocolDescriptor();
  return {
    schema: AGENT_ARTIFACT_SCHEMA,
    protocolVersion: protocol.version,
    protocolHash: protocol.contentHash,
    phase: draft.phase,
    role: draft.role,
    provider: draft.provider,
    sceneId: draft.sceneId,
    decisionHash: draft.decisionHash,
    storyboardHash: draft.storyboardHash,
    inputArtifactHashes: [...draft.inputArtifactHashes],
    revision: draft.revision,
    content: draft.content,
  };
}

export function createAgentArtifact<T>(draft: ArtifactDraft<T>): AgentArtifact<T> {
  const body = artifactBody(draft);
  return { ...body, contentHash: canonicalHash(body) };
}

export interface ArtifactVerification {
  ok: boolean;
  problems: string[];
}

export function verifyAgentArtifact(
  value: unknown,
  expected: { decisionHash: string; storyboardHash: string; inputArtifactHashes?: string[] },
): ArtifactVerification {
  const problems: string[] = [];
  if (!value || typeof value !== 'object') return { ok: false, problems: ['artifact bir nesne değil'] };
  const a = value as AgentArtifact;
  const protocol = protocolDescriptor();
  if (a.schema !== AGENT_ARTIFACT_SCHEMA) problems.push('artifact schema uyuşmuyor');
  if (a.protocolVersion !== protocol.version) problems.push('protocolVersion stale');
  if (a.protocolHash !== protocol.contentHash) problems.push('protocolHash stale/tampered');
  if (a.decisionHash !== expected.decisionHash) problems.push('decisionHash stale');
  if (a.storyboardHash !== expected.storyboardHash) problems.push('storyboardHash stale');
  if (!Number.isInteger(a.sceneId) || a.sceneId < 1) problems.push('sceneId geçersiz');
  if (a.revision !== 0 && a.revision !== 1) problems.push('revision yalnız 0 veya 1 olabilir');
  if (!Array.isArray(a.inputArtifactHashes)) problems.push('inputArtifactHashes yok');
  if (expected.inputArtifactHashes && canonicalHash(a.inputArtifactHashes) !== canonicalHash(expected.inputArtifactHashes)) {
    problems.push('inputArtifactHashes uyuşmuyor');
  }
  if (a.contentHash) {
    const { contentHash: _drop, ...body } = a;
    if (canonicalHash(body) !== a.contentHash) problems.push('contentHash tampered');
  } else {
    problems.push('contentHash yok');
  }
  if ((a.role === 'image_jury' || a.role === 'frame_jury' || a.role === 'motion_jury')) {
    const jury = a.content as JuryContent;
    if (!['PASS', 'REJECT', 'FACT_REQUIRED'].includes(jury?.verdict)) problems.push('jury verdict geçersiz');
    if (jury?.verdict === 'REJECT' && (!jury.failingCheck?.trim() || !jury.targetedFix?.trim())) {
      problems.push('REJECT exact failingCheck + targetedFix taşımalı');
    }
    if (jury?.verdict === 'FACT_REQUIRED' && !jury.factRequired?.trim()) problems.push('FACT_REQUIRED eksik gerçeği adlandırmalı');
  }
  return { ok: problems.length === 0, problems };
}

export function storyboardHashOfScenes(scenes: Array<Record<string, unknown>>): string {
  return canonicalHash(scenes.map((scene) => ({
    id: scene.id,
    phaseName: scene.phaseName,
    durationSec: scene.durationSec,
    architecture: scene.architecture,
    sceneBrief: scene.sceneBrief ?? scene.voiceOver,
  })));
}

export function directivesFromDirectorBrief(text: string | undefined): MamiDirective[] {
  if (!text?.trim()) return [];
  return [{ id: 'site-directive-001', source: 'SITE', scope: 'PROJECT', sceneId: null, text }];
}

export function buildImageAuthorContext(command: any, sceneId: number) {
  const scene = command.scenes?.find((item: any) => item.id === sceneId);
  if (!scene) throw new Error(`scene ${sceneId} yok`);
  const approval = command.lifecycle?.shotApprovals?.[sceneId];
  if (approval?.verdict !== 'APPROVED' || approval.commandId !== command.commandId) {
    throw new Error(`scene ${sceneId} current APPROVED storyboard değil`);
  }
  const relevantDirectives = (command.lifecycle?.mamiDirectives ?? []).filter(
    (d: MamiDirective) => d.scope === 'PROJECT' || d.sceneId === sceneId,
  );
  return {
    protocol: command.lifecycle.protocol,
    decision: {
      commandId: command.commandId,
      locks: command.baseDecision?.locks,
      engine: command.baseDecision?.engine,
      mode: command.baseDecision?.mode,
    },
    storyboardHash: command.lifecycle.storyboardHash,
    shot: {
      id: scene.id,
      phaseName: scene.phaseName,
      durationSec: scene.durationSec,
      architecture: scene.architecture,
      sceneBrief: scene.sceneBrief,
    },
    mamiDirectives: relevantDirectives,
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
      refs: command.worldPacket.refs?.filter((ref: any) => ref.compatible),
    } : null,
    explicitLocks: {
      brandKitLock: command.baseDecision?.locks?.brandKitLock,
      cast: command.baseDecision?.locks?.cast,
      onScreenText: scene.prompts?.onScreenText ?? null,
    },
    targetEngine: command.baseDecision?.engine?.imageModel,
    continuity: { previousSceneId: sceneId > 1 ? sceneId - 1 : null, nextSceneId: sceneId < command.scenes.length ? sceneId + 1 : null },
  };
}

export function buildMotionAuthorContext(command: any, sceneId: number, frame: any) {
  if (!frame?.frameHash || frame.verdict !== 'APPROVE' || frame.fromCommandId !== command.commandId) {
    throw new Error('motion yalnız current Mami APPROVE frame ile açılır');
  }
  const scene = command.scenes?.find((item: any) => item.id === sceneId);
  if (!scene) throw new Error(`scene ${sceneId} yok`);
  const dialect = engineDialect(command.baseDecision?.engine?.videoModel);
  return {
    protocol: command.lifecycle.protocol,
    decisionHash: command.commandId.replace(/^mamilas-/, ''),
    storyboardHash: command.lifecycle.storyboardHash,
    shot: { id: scene.id, sceneBrief: scene.sceneBrief, durationSec: scene.durationSec },
    mamiDirectives: (command.lifecycle.mamiDirectives ?? []).filter((d: MamiDirective) => d.scope === 'PROJECT' || d.sceneId === sceneId),
    frame: { frameHash: frame.frameHash, width: frame.width, height: frame.height, aspect: frame.aspect, verdict: frame.verdict },
    engine: { ...dialect, usableSeconds: engineUsableSec(command.baseDecision?.engine?.videoModel) },
  };
}

export type LifecycleAction =
  | { kind: 'RUN_ROLE'; role: AgentRole; revision: 0 | 1 }
  | { kind: 'AWAIT_FRAME' | 'AWAIT_MAMI_APPROVE' | 'COMPLETE' }
  | { kind: 'FACT_REQUIRED'; reason: string };

function latest<T>(artifacts: AgentArtifact[], role: AgentRole): AgentArtifact<T> | undefined {
  return artifacts.filter((a) => a.role === role).sort((a, b) => b.revision - a.revision)[0] as AgentArtifact<T> | undefined;
}

function juryAction(jury: AgentArtifact<JuryContent> | undefined, author: AgentArtifact | undefined, authorRole: AgentRole, juryRole: AgentRole): LifecycleAction | null {
  if (!author) return { kind: 'RUN_ROLE', role: authorRole, revision: 0 };
  if (!jury || jury.revision < author.revision) return { kind: 'RUN_ROLE', role: juryRole, revision: author.revision };
  if (jury.content.verdict === 'FACT_REQUIRED') return { kind: 'FACT_REQUIRED', reason: jury.content.factRequired || 'eksik gerçek' };
  if (jury.content.verdict === 'REJECT') {
    if (author.revision === 0) return { kind: 'RUN_ROLE', role: authorRole, revision: 1 };
    return { kind: 'FACT_REQUIRED', reason: `revision limiti doldu: ${jury.content.failingCheck || 'aynı bulgu sürüyor'}` };
  }
  return null;
}

export function nextLifecycleAction(artifacts: AgentArtifact[], frame?: any): LifecycleAction {
  const imageAuthor = latest(artifacts, 'image_author');
  const imageJury = latest<JuryContent>(artifacts, 'image_jury');
  const imageAction = juryAction(imageJury, imageAuthor, 'image_author', 'image_jury');
  if (imageAction) return imageAction;
  if (!frame) return { kind: 'AWAIT_FRAME' };
  if (frame.verdict !== 'APPROVE') return { kind: 'AWAIT_MAMI_APPROVE' };
  const frameJury = latest<JuryContent>(artifacts, 'frame_jury');
  if (!frameJury) return { kind: 'RUN_ROLE', role: 'frame_jury', revision: 0 };
  if (frameJury.content.verdict !== 'PASS') {
    return { kind: 'FACT_REQUIRED', reason: frameJury.content.factRequired || frameJury.content.failingCheck || 'frame jury geçmedi' };
  }
  const motionAuthor = latest(artifacts, 'motion_author');
  const motionJury = latest<JuryContent>(artifacts, 'motion_jury');
  const motionAction = juryAction(motionJury, motionAuthor, 'motion_author', 'motion_jury');
  return motionAction ?? { kind: 'COMPLETE' };
}
