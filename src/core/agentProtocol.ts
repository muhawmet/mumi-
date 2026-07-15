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

export interface ImageAuthorContent {
  prompt: string;
  promptHash: string;
  directiveReceipts: Array<{ id: string; text: string; status: 'APPLIED' | 'SUPPRESSED' }>;
  appliedLocks: string[];
  suppressedContext: string[];
  risks: string[];
}

export interface MotionAuthorContent {
  frameHash: string;
  inventory: string[];
  prompt: string;
  promptHash: string;
  risks: string[];
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
  expected: { decisionHash: string; storyboardHash: string; inputArtifactHashes?: string[]; frameHash?: string },
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
  if (!['claude', 'codex'].includes(a.provider)) problems.push('provider geçersiz');
  const rolePhase: Record<AgentRole, AgentPhase | null> = {
    embedded_director: null,
    image_author: 'IMAGE_PROMPT', image_jury: 'IMAGE_JURY', frame_jury: 'FRAME_JURY',
    motion_author: 'MOTION', motion_jury: 'MOTION_JURY',
  };
  if (!(a.role in rolePhase) || rolePhase[a.role] !== a.phase) problems.push('role/phase geçersiz');
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
    if (!Array.isArray(jury?.evidence) || jury.evidence.length === 0 || jury.evidence.some((item) => !item.trim())) {
      problems.push('jury evidence zorunlu');
    }
    if (jury?.verdict === 'REJECT' && (!jury.failingCheck?.trim() || !jury.targetedFix?.trim())) {
      problems.push('REJECT exact failingCheck + targetedFix taşımalı');
    }
    if (jury?.verdict === 'FACT_REQUIRED' && !jury.factRequired?.trim()) problems.push('FACT_REQUIRED eksik gerçeği adlandırmalı');
    if ((a.role === 'frame_jury' || a.role === 'motion_jury') && (a.content as { frameHash?: string })?.frameHash !== expected.frameHash) {
      problems.push('jury frameHash stale');
    }
  } else if (a.role === 'image_author') {
    const content = a.content as ImageAuthorContent;
    if (!content?.prompt?.trim() || content.promptHash !== sha256Hex(content.prompt ?? '')) problems.push('image prompt/hash geçersiz');
    if (!Array.isArray(content?.directiveReceipts)) problems.push('directiveReceipts yok');
    if (!Array.isArray(content?.appliedLocks) || content.appliedLocks.length === 0) problems.push('appliedLocks yok');
    if (!Array.isArray(content?.suppressedContext) || !Array.isArray(content?.risks)) problems.push('image receipt listeleri eksik');
    if (/\[DIRECTOR TASK\]|\bTODO\b|#[0-9a-f]{3,8}\b/i.test(content?.prompt ?? '')) problems.push('image prompt workflow/hex leak');
  } else if (a.role === 'motion_author') {
    const content = a.content as MotionAuthorContent;
    if (content?.frameHash !== expected.frameHash) problems.push('motion frameHash stale');
    if (!content?.prompt?.trim() || content.promptHash !== sha256Hex(content.prompt ?? '')) problems.push('motion prompt/hash geçersiz');
    if (!Array.isArray(content?.inventory) || content.inventory.length === 0) problems.push('motion inventory yok');
    if (!Array.isArray(content?.risks)) problems.push('motion risks yok');
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

export function liveDirectiveId(directive: Omit<MamiDirective, 'id'>): string {
  return `live-${canonicalHash(directive).slice(0, 16)}`;
}

/**
 * LIVE_CHAT directives are authored outside the site and may only re-enter Studio through a
 * canonical command bundle. Validate the complete shape and deterministic id before allowing
 * them to become part of the Studio decision state.
 */
export function validatedLiveDirectives(value: unknown, sceneIds: number[]): MamiDirective[] {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new Error('LIVE_CHAT MamiDirectives dizi olmalı.');
  const ids = new Set<string>();
  return value.map((candidate) => {
    if (!candidate || typeof candidate !== 'object') throw new Error('LIVE_CHAT MamiDirective nesne olmalı.');
    const directive = candidate as MamiDirective;
    if (directive.source !== 'LIVE_CHAT') throw new Error('Studio yalnız LIVE_CHAT directive benimseyebilir.');
    if (directive.scope !== 'PROJECT' && directive.scope !== 'SCENE') throw new Error('LIVE_CHAT scope geçersiz.');
    if (typeof directive.text !== 'string' || !directive.text.trim()) throw new Error('LIVE_CHAT text boş olamaz.');
    if (directive.scope === 'PROJECT' && directive.sceneId !== null) throw new Error('PROJECT directive sceneId null olmalı.');
    if (directive.scope === 'SCENE' && (!Number.isInteger(directive.sceneId) || !sceneIds.includes(directive.sceneId as number))) {
      throw new Error('SCENE directive geçerli sceneId taşımalı.');
    }
    const identity = { source: directive.source, scope: directive.scope, sceneId: directive.sceneId, text: directive.text } as const;
    if (directive.id !== liveDirectiveId(identity)) throw new Error(`LIVE_CHAT directive id stale/tampered: ${directive.id}`);
    if (ids.has(directive.id)) throw new Error(`Duplicate LIVE_CHAT directive: ${directive.id}`);
    ids.add(directive.id);
    return { id: directive.id, ...identity };
  });
}

export function buildImageAuthorContext(command: any, sceneId: number) {
  const scene = command.scenes?.find((item: any) => item.id === sceneId);
  if (!scene) throw new Error(`scene ${sceneId} yok`);
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
      mamiPromptOverride: command.baseDecision?.overrides?.find((item: any) => item.sceneId === sceneId)?.userImagePrompt ?? null,
    },
    targetEngine: command.baseDecision?.engine?.imageModel,
    failureModes: scene.handoff?.IMAGE?.avoid ?? null,
    continuity: {
      previousSceneId: sceneId > 1 ? command.scenes[command.scenes.findIndex((item: any) => item.id === sceneId) - 1]?.id ?? null : null,
      nextSceneId: command.scenes[command.scenes.findIndex((item: any) => item.id === sceneId) + 1]?.id ?? null,
    },
  };
}

export function buildMotionAuthorContext(command: any, sceneId: number, frame: any) {
  if (!/^[0-9a-f]{64}$/.test(frame?.frameHash ?? '') || frame.verdict !== 'APPROVE'
    || frame.fromCommandId !== command.commandId || frame.storyboardHash !== command.lifecycle?.storyboardHash
    || frame.width <= 0 || frame.height <= 0 || frame.byteSize <= 0 || !frame.localPath) {
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
  if (!frame?.frameHash || frame.width <= 0 || frame.height <= 0 || frame.byteSize <= 0 || !frame.localPath) {
    return { kind: 'AWAIT_FRAME' };
  }
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
