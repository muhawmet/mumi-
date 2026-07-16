import PROTOCOL_TEXT from '../../agents/PROTOCOL.md?raw';
import MINED_JSON from '../../agents/promptQuality.mined.json';
import { canonicalHash, sha256Hex } from './contract';
import { engineDialect, engineUsableSec } from './engine';

export const AGENT_PROTOCOL_VERSION = 'mamilas.agent-protocol.v1' as const;
export const AGENT_ARTIFACT_SCHEMA = 'mamilas.agent-artifact.v1' as const;

// This is a writing contract, not a site-authored prompt.  It tells the Author how
// to turn the deterministic decision slice into a single readable image, and gives
// the independent Jury the same bar for rejecting generic prose.
export const IMAGE_PROMPT_QUALITY_CONTRACT = Object.freeze({
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
} as const);

// ============================================================================
// BRAIN M4 — dünya/engine-aware promptQuality kontratı (KUSUR-D).
// Madenlenmiş üretim yasaları ([[mamilas-brain-intelligence-mined]]) burada nesir
// değil ÖLÇÜLEBİLİR kontrat maddesi olur: Image Author yazarken counter-read eder,
// Image Jury requiredEvidence/rejectIf'i ölçer. Ürün yasası #5: hiçbir madde
// evrensel kilit değildir — Mami direktifi çatışırsa madde aktif listeden düşer ama
// `suppressed[]`te direktif kaynağıyla GÖRÜNÜR kalır (sessiz silme yok).
// ============================================================================

interface MinedClause {
  /** Kontrat cümlesi — jürinin ölçeceği somut madde. */
  text: string;
  /** Hangi listeye girer. */
  kind: 'requiredEvidence' | 'rejectIf';
  /**
   * Dokümantasyon: bu madde tipik olarak hangi Mami konularıyla çatışır. KOD OKUMAZ —
   * suppression ajan muhakemesidir (Sol kritik: keyword eşleme polarite bilemez).
   */
  overrideKeys?: string[];
}

// TEK KANON: agents/promptQuality.mined.json — runner (mamilas-command.mjs) da aynı
// dosyayı okur; ayna kopya yok. Kontrat sceneContextHash'in parçası olduğundan iki
// yüzeyin aynı byte'ı üretmesi hash kapısıyla da zorlanır.
const MINED = MINED_JSON as unknown as {
  universal: MinedClause[];
  animation: MinedClause[];
  photoreal: MinedClause[];
  engine: Record<string, MinedClause[]>;
  motionUniversal: MinedClause[];
  motionEngine: Record<string, MinedClause[]>;
};

export interface ImagePromptQualityContract {
  frameBuildOrder: readonly string[];
  requiredEvidence: string[];
  referencePolicy: readonly string[];
  rejectIf: string[];
  /**
   * Override yasası (ürün yasası #5) — KOD DEĞİL, AJAN uygular: kod doğal dilden
   * niyet/polarite çıkaramaz ("yarım saniye önce patlama olsun" maddeyi İSTEYEN bir
   * direktiftir, kapatan değil — Sol kritik bulgusu). Author, Mami direktifiyle açıkça
   * çatışan maddeyi kenara koyup `suppressedContext`e yazar; Jury, APPLIED bir direktifle
   * açıkça çatışan maddeyi enforce etmez. Böylece suppression MUHAKEME olarak yapılır ve
   * artifact receipt'inde görünür kalır.
   */
  overridePolicy: string;
}

function isAnimationWorld(world: { group?: string } | null | undefined): boolean {
  return Boolean(world?.group && /ANIMATION|STYLIZED/i.test(world.group));
}
function isPhotorealWorld(world: { group?: string } | null | undefined): boolean {
  return Boolean(world?.group && /REAL|CINEMATIC|COMMERCIAL/i.test(world.group));
}

export const CONTRACT_OVERRIDE_POLICY =
  'Mined clauses are engine-aware defaults, never universal locks. If an APPLIED Mami directive '
  + 'explicitly conflicts with a clause, the directive wins: the Author sets the clause aside and '
  + 'names it under suppressedContext; the Jury must not enforce a clause that an APPLIED directive '
  + 'explicitly contradicts. Suppression is reasoning, done by the agent, visible in the receipt — '
  + 'never inferred by code from directive keywords.';

export function buildImagePromptQualityContract(args: {
  world?: { group?: string } | null;
  imageModel?: string;
}): ImagePromptQualityContract {
  const { world, imageModel } = args;
  const clauses: MinedClause[] = [
    ...MINED.universal,
    ...(isAnimationWorld(world) ? MINED.animation : []),
    ...(isPhotorealWorld(world) ? MINED.photoreal : []),
    ...(MINED.engine[(imageModel ?? '').toLowerCase()] ?? []),
  ];
  return {
    frameBuildOrder: IMAGE_PROMPT_QUALITY_CONTRACT.frameBuildOrder,
    requiredEvidence: [
      ...IMAGE_PROMPT_QUALITY_CONTRACT.requiredEvidence,
      ...clauses.filter((c) => c.kind === 'requiredEvidence').map((c) => c.text),
    ],
    referencePolicy: IMAGE_PROMPT_QUALITY_CONTRACT.referencePolicy,
    rejectIf: [
      ...IMAGE_PROMPT_QUALITY_CONTRACT.rejectIf,
      ...clauses.filter((c) => c.kind === 'rejectIf').map((c) => c.text),
    ],
    overridePolicy: CONTRACT_OVERRIDE_POLICY,
  };
}

export interface MotionPromptQualityContract {
  requiredEvidence: string[];
  rejectIf: string[];
  /** Aynı override yasası — suppression ajan muhakemesi, kod tahmin etmez. */
  overridePolicy: string;
}

/**
 * BRAIN M5 — engine-aware motion kontratı. Madenler: Physics-First (kütle/kadans,
 * jenerik pan/zoom/dolly yasak), frame-inventory, tek-hareket yasası, still-lips /
 * no-dialogue-ever, Kling native-audio SFX omurgası (sesin adı değil FİZİĞİ).
 */
export function buildMotionPromptQualityContract(args: { videoModel?: string }): MotionPromptQualityContract {
  const key = (args.videoModel ?? '').toLowerCase();
  const clauses: MinedClause[] = [
    ...MINED.motionUniversal,
    ...(MINED.motionEngine[key] ?? MINED.motionEngine[key.split('_')[0]] ?? []),
  ];
  return {
    requiredEvidence: clauses.filter((c) => c.kind === 'requiredEvidence').map((c) => c.text),
    rejectIf: clauses.filter((c) => c.kind === 'rejectIf').map((c) => c.text),
    overridePolicy: CONTRACT_OVERRIDE_POLICY,
  };
}

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

/**
 * BRAIN M3 — şeffaf yorum receipt'i (KUSUR-A, Mami revizyonu 2026-07-16).
 * Ajanın sahne yorumu (dominant özne / tek olay / donmuş an) artık GÖRÜNMEZ değil:
 * her image_author artifact'i bu tek-satırlık bloğu zorunlu taşır. Bu bir onay
 * kapısı DEĞİLDİR — akış durmaz; Mami ilk görselleri üretip doğal dille müdahale
 * eder ve müdahalesi MamiDirectives olarak receipt'te kaynak görünür.
 */
export interface InterpretationReceipt {
  dominantSubject: string;
  singleEvent: string;
  frozenInstant: string;
}

export interface ImageAuthorContent {
  prompt: string;
  promptHash: string;
  interpretation: InterpretationReceipt;
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
    // BRAIN M3: yorum şeffaf olmak zorunda — üç alan da dolu tek-satır receipt.
    // Onay kapısı değildir; lifecycle akışını değiştirmez, yalnız görünürlüğü zorlar.
    const interp = content?.interpretation as unknown as Record<string, unknown> | undefined;
    // Sol P2: non-string değer TypeError değil kontrollü RED üretmeli (runner ile eşdeğer).
    const interpField = (key: 'dominantSubject' | 'singleEvent' | 'frozenInstant') =>
      typeof interp?.[key] === 'string' && (interp[key] as string).trim().length > 0;
    if (!interpField('dominantSubject') || !interpField('singleEvent') || !interpField('frozenInstant')) {
      problems.push('interpretation receipt eksik — dominantSubject/singleEvent/frozenInstant üçü de zorunlu');
    }
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

// BRAIN M7 DİKKAT: approvedLessons bu fonksiyona EKLENMEZ — çıktısı sceneContextHash'e
// girer; ders bankası her büyüdüğünde tüm command'ler stale olurdu. Dersler atölye
// hafızasıdır, karar değil: runner launch anında hash-DIŞI sessionContext katmanına
// koyar (CONTEXT.json.approvedLessons — artifactContract ile aynı katman).
export function buildImageAuthorContext(command: any, sceneId: number) {
  const scene = command.scenes?.find((item: any) => item.id === sceneId);
  if (!scene) throw new Error(`scene ${sceneId} yok`);
  const locks = { ...(command.baseDecision?.locks ?? {}) };
  // `topic` is a fallback label for topic-only work. Once an approved raw source exists,
  // letting that stale UI label compete with the shot beat makes the author invent a
  // second film (for example, a water-cycle topic over a ship-escape scene).
  if (command.baseDecision?.source?.authority === 'RAW_SOURCE_VAULT' && command.baseDecision.source.rawSource?.trim()) {
    delete locks.topic;
  }
  const relevantDirectives = (command.lifecycle?.mamiDirectives ?? []).filter(
    (d: MamiDirective) => d.scope === 'PROJECT' || d.sceneId === sceneId,
  );
  // BRAIN M4: kontrat dünya/engine-aware üretilir. Override AJAN muhakemesidir
  // (overridePolicy) — kod direktiften madde bastırmaz (Sol kritik: polarite).
  const promptQuality = buildImagePromptQualityContract({
    world: command.worldPacket ? { group: command.worldPacket.group } : null,
    imageModel: command.baseDecision?.engine?.imageModel,
  });
  return {
    protocol: command.lifecycle.protocol,
    promptQuality,
    decision: {
      commandId: command.commandId,
      locks,
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
      // BRAIN M2 (Sol #1): render_law'dan ayrılan envanter cümleleri bu kanalda yaşar.
      // Kanal role context'ine girmezse cümleler görünmez olur (= dolaylı silme).
      // commandExport.ts:460 kuralı geçerli: yaratıcı REFERANS — kadro/prop EMRİ değil.
      vocabularyExamples: command.worldPacket.vocabularyExamples,
      refs: command.worldPacket.refs?.filter((ref: any) => ref.compatible),
      referencePolicy: IMAGE_PROMPT_QUALITY_CONTRACT.referencePolicy,
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
    // BRAIN M5: motion kontratı — Physics-First, still-lips/no-dialogue, SFX omurgası.
    motionQuality: buildMotionPromptQualityContract({ videoModel: command.baseDecision?.engine?.videoModel }),
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
