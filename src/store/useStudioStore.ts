import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  generateBatch,
  effectiveMaterialId,
  normalizeMaterialId,
  normalizePaletteId,
  normalizeRefIds,
  normalizeWorldId,
  resolveRecipeDefaults,
  DATA,
  type SceneArchitecture,
  type HandoffPacketSet,
  type VoSyncMode,
  type OsTextMode,
} from '../core/pure';
import { buildRecipeMarkdown, buildRecipeMachine, registerOf, type RecipeSceneNote } from '../core/brain';
import type { DurationVerdict } from '../core/brain';
import type { Blocker } from '../core/contract';
import { canonicalHash, sha256Hex, sha256HexBytes } from '../core/contract';
import { buildCommandJSON } from '../core/commandExport';
import {
  directivesFromDirectorBrief,
  validatedLiveDirectives,
  verifyAgentArtifact,
  type AgentArtifact,
  type ImageAuthorContent,
  type MamiDirective,
} from '../core/agentProtocol';
import { buildCloseout, buildProjectPack, serializeProjectPack, verifyProjectPack, projectPackToState, type ProjectPack } from '../core/projectPack';
import {
  decodeBrief,
  ingestSource,
  autoGroupBeats,
  sourceIntegrity,
  extractProductionDossierSource,
  type SourceBeat,
  type SourceIntegrityReport,
} from '../core/source';
import { planBeats, eventBoundary, type BeatMode, type BeatAnalysis } from '../core/beats';

export type Step = 'dashboard' | 'director' | 'recipe' | 'scenes' | 'timeline' | 'qa';
/** Free-text optional character/cast description. Empty = object-only, no character anchor. */
export type Cast = string;
export type WorkingMode = 'Hızlı' | 'Standart' | 'Sıkı Teslim';

export interface Scene {
  id: number;
  architecture: SceneArchitecture;
  imagePrompt: string;
  motionPrompt: string;
  voiceOver: string;
  sunoBrief: string;
  durationSec: number;
  duration: DurationVerdict;
  intensity: number;
  phaseName: 'Intro' | 'Build-up' | 'Climax' | 'Resolution';
  handoff: HandoffPacketSet;
  onScreenText: string | null;
  /** Optional user-edited override for the image prompt. Export uses this if set. */
  userImagePrompt?: string;
  /**
   * Ajanın YAZDIĞI final prompt'un siteye geri alınması (MACRO 3). Site prompt üretmez; command'deki
   * ajan yazar, Mami çıktıyı elle yapıştırır ya da import eder. Receipt hangi brief/command
   * kimliğinden yazıldığını taşır — kararlar değişince prompt'un hangi karara ait olduğu bellidir.
   */
  promptReceipt?: PromptReceipt;
  /**
   * Mami'nin harici araçta ürettiği GERÇEK frame'in makbuzu (MACRO 5). Motion yalnız Mami bu
   * frame'i APPROVE ettiğinde açılır. Frame değişince (yeni hash) motion stale olur.
   */
  frameReceipt?: SceneFrameReceipt;
}

/** Ajan-yazımı final prompt'un geri-alım makbuzu. Hangi karardan doğduğunu hash'le bağlar. */
export interface PromptReceipt {
  /** Ajanın yazdığı final image prompt (Mami'nin geri yüklediği). */
  finalPrompt: string;
  /** Bu prompt'un yazıldığı command/base-decision kimliği (`buildCommandJSON().commandId`). */
  fromCommandId: string;
  /** Prompt'un içerik hash'i — aynı prompt → aynı makbuz (sha256Hex). */
  promptHash: string;
  /** Kaynak: elle yapıştırma mı, dosya importu mu. */
  source: 'paste' | 'import';
  /** Validated command lifecycle artifact envelope. Legacy plain-text receipts omit these and are never current. */
  artifactHash?: string;
  juryArtifactHash?: string;
  artifactBundleHashes?: string[];
  protocolHash?: string;
  provider?: 'claude' | 'codex';
  storyboardHash?: string;
  inputArtifactHashes?: string[];
  revision?: 0 | 1;
}

/** Mami'nin bir shot'a verdiği verdict + hangi karara (commandId) bağlı olduğu (MACRO 4). */
export interface ShotApproval {
  verdict: 'APPROVED' | 'REJECTED';
  /** Onayın bağlı olduğu karar kimliği. Karar değişince (yeni commandId) bu onay STALE olur. */
  commandId: string;
  /** Mami'nin bu shot için serbest notu (opsiyonel). */
  note?: string;
}

/**
 * Mami'nin harici araçta ürettiği ve siteye geri yüklediği GERÇEK frame'in makbuzu (MACRO 5).
 *
 * Prompt değil, PİKSEL. Frame'in SHA-256'sı + boyut/aspect + hangi karar/prompt'a bağlı olduğu
 * kaydedilir. Motion YALNIZ Mami APPROVE ettiği current frame ile açılır. Frame değişince
 * (yeni frameHash) eski motion receipt'i ve verdict'i STALE olur.
 */
export interface SceneFrameReceipt {
  /** Yüklenen frame dosyasının SHA-256'sı (piksel kimliği). */
  frameHash: string;
  /** Frame'in yazıldığı kararın kimliği (`currentCommandId`). Karar değişince frame stale olur. */
  fromCommandId: string;
  /** Bu frame hangi ajan-prompt'undan üretildi (varsa `PromptReceipt.promptHash`). */
  fromPromptHash: string | null;
  width: number;
  height: number;
  /** En-boy oranı, 3 ondalık (ör. 1.778 = 16:9). */
  aspect: number;
  /** Dosya adı (Mami'nin referansı — kimlik değil). */
  fileName: string;
  byteSize: number;
  /** Mami'nin frame hükmü. Motion yalnız APPROVE ile açılır. */
  verdict: 'APPROVE' | 'REGENERATE' | 'PROJECT_ONLY_ACCEPT' | 'PENDING';
  /** Mami'nin frame notu (opsiyonel). */
  note?: string;
}

export type { VoSyncMode, OsTextMode };
export type SceneNote = RecipeSceneNote;

/** Returns the prompt that should be used downstream — override wins over generated. */
export const effectivePrompt = (s: Scene): string => s.userImagePrompt ?? s.imagePrompt;

/**
 * QA/export'a giden her state BUNDAN geçer: el-düzeltmesi (userImagePrompt) imagePrompt'a
 * indirgenir ki Director Cabinet ve production export GERÇEK gidecek metni denetlesin.
 * Aksi hâlde firewall temiz üretilmiş prompt'a bakıp yeşil yanar, motora el-metni gider.
 */
export const scenesWithEffectivePrompts = <T extends { scenes: Scene[] }>(state: T): T => ({
  ...state,
  scenes: state.scenes.map((s) => ({ ...s, imagePrompt: effectivePrompt(s) })),
});

export function applyPromptOverride(scene: Scene, override: string | null): Scene {
  const imagePrompt = override ?? scene.imagePrompt;
  const handoff = {
    ...scene.handoff,
    IMAGE: {
      ...scene.handoff.IMAGE,
      draft: { ...scene.handoff.IMAGE.draft, previewPrompt: imagePrompt },
    },
  };

  if (override === null) {
    const { userImagePrompt: _drop, ...rest } = scene;
    return { ...rest, handoff } as Scene;
  }
  return { ...scene, userImagePrompt: override, handoff };
}

/**
 * Ajanın YAZDIĞI final prompt'u siteye geri alır (MACRO 3). Site prompt üretmez; ajan yazar,
 * Mami çıktıyı elle yapıştırır ya da import eder. `userImagePrompt` override'ını set eder
 * (böylece QA/export gerçek gidecek metni görür) VE `promptReceipt`'i hangi karardan doğduğunu
 * hash'le bağlayarak yazar. Boş prompt geri-alımı temizler.
 */
/** Yüklenen görselin piksel boyutunu okur (tarayıcı). Test/Node ortamında reddeder → 0×0. */
function readImageDims(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof Image === 'undefined' || typeof URL === 'undefined') {
      reject(new Error('no-image-env'));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dims);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image-decode-failed'));
    };
    img.src = url;
  });
}

export function applyAgentPrompt(
  scene: Scene,
  finalPrompt: string,
  fromCommandId: string,
  source: 'paste' | 'import' = 'paste',
): Scene {
  const text = finalPrompt.trim();
  if (!text) {
    const cleared = applyPromptOverride(scene, null);
    const { promptReceipt: _drop, ...rest } = cleared;
    return rest as Scene;
  }
  const withOverride = applyPromptOverride(scene, text);
  return {
    ...withOverride,
    promptReceipt: {
      finalPrompt: text,
      fromCommandId,
      promptHash: sha256Hex(text),
      source,
    },
  };
}

/**
 * A shot can enter Mami approval only when the imported author prompt and its receipt agree.
 * The generated `imagePrompt` is a site scaffold; it is never accepted as author evidence.
 */
export function hasCurrentAgentPrompt(
  scene: Pick<Scene, 'userImagePrompt' | 'promptReceipt'>,
  promptSourceCommandId: string,
): boolean {
  const prompt = scene.userImagePrompt;
  const receipt = scene.promptReceipt;
  if (!prompt || !receipt) return false;
  return receipt.finalPrompt === prompt
    && receipt.promptHash === sha256Hex(prompt)
    && receipt.fromCommandId === promptSourceCommandId
    && Boolean(receipt.artifactHash?.match(/^[0-9a-f]{64}$/))
    && Boolean(receipt.juryArtifactHash?.match(/^[0-9a-f]{64}$/))
    && Array.isArray(receipt.artifactBundleHashes)
    && receipt.artifactBundleHashes.includes(receipt.artifactHash ?? '')
    && receipt.artifactBundleHashes.includes(receipt.juryArtifactHash ?? '')
    && Boolean(receipt.protocolHash?.match(/^[0-9a-f]{64}$/))
    && Boolean(receipt.storyboardHash?.match(/^[0-9a-f]{64}$/))
    && Array.isArray(receipt.inputArtifactHashes)
    && receipt.inputArtifactHashes.length > 0
    && (receipt.provider === 'claude' || receipt.provider === 'codex');
}

/**
 * Canonical identity of the decision/storyboard presented to the Image Author.
 * Authored prompt overrides are stripped so importing one prompt cannot change the identity
 * that every prompt receipt must cite; any actual decision/storyboard change still changes it.
 */
export function promptSourceCommand(state: StudioState) {
  const scenes = state.scenes.map((scene) => {
    const { userImagePrompt: _prompt, promptReceipt: _promptReceipt, frameReceipt: _frameReceipt, ...sourceScene } = scene;
    return sourceScene as Scene;
  });
  return buildCommandJSON({ ...state, scenes } as never);
}

export function promptSourceCommandId(state: StudioState): string {
  return promptSourceCommand(state).commandId;
}

function applyImageArtifactBundle(scene: Scene, json: string, state: StudioState): { scene: Scene; liveMamiDirectives: MamiDirective[] } {
  const parsed = JSON.parse(json) as unknown;
  const wrapped = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    ? parsed as { command?: unknown; artifacts?: unknown[] }
    : null;
  const artifacts = Array.isArray(parsed)
    ? parsed
    : (wrapped && Array.isArray(wrapped.artifacts)
      ? wrapped.artifacts
      : [parsed]);
  let liveMamiDirectives = state.liveMamiDirectives;
  let command = promptSourceCommand(state);
  if (wrapped?.command != null) {
    const candidate = wrapped.command as ReturnType<typeof promptSourceCommand>;
    const candidateDirectives = candidate?.lifecycle?.mamiDirectives;
    if (!Array.isArray(candidateDirectives)) throw new Error('Bundle canonical command MamiDirectives taşımıyor.');
    const expectedSite = directivesFromDirectorBrief(state.directorBrief);
    const actualSite = candidateDirectives.filter((directive) => directive?.source === 'SITE');
    if (canonicalHash(actualSite) !== canonicalHash(expectedSite)) throw new Error('Bundle SITE directive current Studio kararıyla uyuşmuyor.');
    liveMamiDirectives = validatedLiveDirectives(
      candidateDirectives.filter((directive) => directive?.source === 'LIVE_CHAT'),
      state.scenes.map((candidateScene) => candidateScene.id),
    );
    const expected = promptSourceCommand({ ...state, liveMamiDirectives } as StudioState);
    const sameCommand = candidate?.schema === expected.schema
      && candidate.commandId === expected.commandId
      && canonicalHash(candidate.baseDecision) === canonicalHash(expected.baseDecision)
      && candidate.lifecycle?.storyboardHash === expected.lifecycle.storyboardHash
      && canonicalHash(candidate.lifecycle?.mamiDirectives) === canonicalHash(expected.lifecycle.mamiDirectives)
      && canonicalHash(candidate.lifecycle?.sceneContextHashes) === canonicalHash(expected.lifecycle.sceneContextHashes)
      && canonicalHash(candidate.scenes) === canonicalHash(expected.scenes);
    if (!sameCommand) throw new Error('Bundle command current Studio kararının yalnız LIVE_CHAT ile türetilmiş canonical eşi değil.');
    command = expected;
  }
  const sceneContextHash = command.lifecycle.sceneContextHashes[scene.id];
  if (!sceneContextHash) throw new Error(`Scene ${scene.id} author context hash yok.`);
  const verified = artifacts.map((value) => {
    const check = verifyAgentArtifact(value, {
      decisionHash: command.commandId.replace(/^mamilas-/, ''),
      storyboardHash: command.lifecycle.storyboardHash,
    });
    if (!check.ok) throw new Error(`Agent artifact geçersiz: ${check.problems.join(' · ')}`);
    const artifact = value as AgentArtifact;
    if (artifact.sceneId !== scene.id) throw new Error(`Artifact scene ${artifact.sceneId}; beklenen ${scene.id}.`);
    return artifact;
  });
  const roleRevisions = new Set<string>();
  for (const artifact of verified) {
    const key = `${artifact.role}@${artifact.revision}`;
    if (roleRevisions.has(key)) throw new Error(`Duplicate agent artifact: ${key}`);
    roleRevisions.add(key);
  }
  const by = (role: AgentArtifact['role'], revision: 0 | 1) =>
    verified.find((artifact) => artifact.role === role && artifact.revision === revision);
  const author0 = by('image_author', 0);
  const jury0 = by('image_jury', 0);
  if (!author0 || !jury0) throw new Error('Image Author@0 + Image Jury@0 artifact bundle zorunlu.');
  if (JSON.stringify(author0.inputArtifactHashes) !== JSON.stringify([sceneContextHash])) {
    throw new Error('Image Author@0 inputArtifactHashes current context ile uyuşmuyor.');
  }
  if (JSON.stringify(jury0.inputArtifactHashes) !== JSON.stringify([sceneContextHash, author0.contentHash])) {
    throw new Error('Image Jury@0 inputArtifactHashes zinciri uyuşmuyor.');
  }
  const author1 = by('image_author', 1);
  const jury1 = by('image_jury', 1);
  let author = author0;
  let jury = jury0;
  if (author1 || jury1) {
    if (!author1 || !jury1 || (jury0.content as { verdict?: string }).verdict !== 'REJECT') {
      throw new Error('Revision 1 yalnız tam Author0→REJECT Jury0→Author1→Jury1 zinciriyle geçer.');
    }
    if (JSON.stringify(author1.inputArtifactHashes) !== JSON.stringify([sceneContextHash, author0.contentHash, jury0.contentHash])) {
      throw new Error('Image Author@1 inputArtifactHashes zinciri uyuşmuyor.');
    }
    if (JSON.stringify(jury1.inputArtifactHashes) !== JSON.stringify([sceneContextHash, author1.contentHash])) {
      throw new Error('Image Jury@1 inputArtifactHashes zinciri uyuşmuyor.');
    }
    author = author1;
    jury = jury1;
  }
  if ((jury.content as { verdict?: string }).verdict !== 'PASS') throw new Error('Final Image Jury verdict PASS değil.');
  const content = author.content as ImageAuthorContent;
  const expectedDirectives = command.lifecycle.mamiDirectives
    .filter((directive) => directive.scope === 'PROJECT' || directive.sceneId === scene.id)
    .map((directive) => ({ id: directive.id, text: directive.text }))
    .sort((a, b) => a.id.localeCompare(b.id));
  const actualDirectives = content.directiveReceipts
    .map((receipt) => ({ id: receipt.id, text: receipt.text }))
    .sort((a, b) => a.id.localeCompare(b.id));
  if (JSON.stringify(actualDirectives) !== JSON.stringify(expectedDirectives)) {
    throw new Error('Image Author exact MamiDirectives receipt zinciri uyuşmuyor.');
  }
  const withPrompt = applyAgentPrompt(scene, content.prompt, command.commandId, 'import');
  return { scene: {
    ...withPrompt,
    promptReceipt: {
      ...withPrompt.promptReceipt!,
      artifactHash: author.contentHash,
      juryArtifactHash: jury.contentHash,
      artifactBundleHashes: verified.map((artifact) => artifact.contentHash),
      protocolHash: author.protocolHash,
      provider: author.provider,
      storyboardHash: author.storyboardHash,
      inputArtifactHashes: [...author.inputArtifactHashes],
      revision: author.revision,
    },
  }, liveMamiDirectives };
}

export function hasValidFrameEvidence(frame: SceneFrameReceipt | undefined): frame is SceneFrameReceipt {
  return Boolean(
    frame
    && /^[0-9a-f]{64}$/.test(frame.frameHash)
    && Number.isInteger(frame.width)
    && frame.width > 0
    && Number.isInteger(frame.height)
    && frame.height > 0
    && frame.byteSize > 0
    && frame.aspect > 0,
  );
}

/**
 * Fallback split point for splitBeat when no semantic boundary is found: the
 * sentence-end punctuation (+ following whitespace) closest to the midpoint that
 * leaves real text on both sides. Returns an index into `segment`, or -1.
 */
function sentenceBoundary(segment: string): number {
  const re = /[.!?…。！？]+[\s]+/gu;
  const mid = segment.length / 2;
  let best = -1;
  let bestDist = Infinity;
  let m: RegExpExecArray | null;
  while ((m = re.exec(segment))) {
    const cut = m.index + m[0].length;
    if (cut <= 0 || cut >= segment.length) continue;
    if (!segment.slice(0, cut).trim() || !segment.slice(cut).trim()) continue;
    const dist = Math.abs(cut - mid);
    if (dist < bestDist) {
      bestDist = dist;
      best = cut;
    }
  }
  return best;
}

/** Strict recipe gate — world, palette, subject and at least one scene note must all be chosen. */
export function recipeReadiness(s: Pick<StudioState, 'selectedWorldId' | 'selectedPaletteId' | 'subject' | 'recipeScenes'>): {
  ready: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  if (!s.selectedWorldId) missing.push('Dünya');
  if (!s.selectedPaletteId) missing.push('Palet');
  if (!s.subject.trim()) missing.push('Konu');
  if (!s.recipeScenes.length) missing.push('Sahne');
  return { ready: missing.length === 0, missing };
}

export function sourceReadiness(s: Pick<StudioState, 'rawSource' | 'sourceReport' | 'beatMode'>): {
  ready: boolean;
  reason: string | null;
} {
  if (!s.rawSource.length) return { ready: true, reason: null };
  if (!s.sourceReport) return { ready: false, reason: 'Kaynak henüz ingest edilmedi.' };
  // Manuel beat mode means the director cut the scenes by hand: the beats ARE the intended cut,
  // so the vault is no longer the authority to measure them against. Auto modes still have to
  // reconstruct the vault, because there a mismatch means the grouping lost text.
  if (s.beatMode === 'Manuel') return { ready: true, reason: null };
  // Not coverage — `ok` means the scene wording still matches the vault. Report that, because a
  // "%100; %100 gerekli" line reads as a contradiction and hides what actually has to be fixed.
  if (!s.sourceReport.ok) return { ready: false, reason: `Sahne metni kaynaktan sapmış (kapsam %${s.sourceReport.coverage}) — metni değiştirmeden yeniden ingest et.` };
  return { ready: true, reason: null };
}

/**
 * Canonical command-authoring gate.
 *
 * The command is the Image Author's input, so exporting it cannot depend on evidence that the
 * author has not produced yet. This gate validates only the decision-side prerequisites shared by
 * every production phase: source integrity, a complete recipe, a storyboard, and no unresolved
 * FACT REQUIRED blockers. Prompt receipts and Mami shot approval remain production evidence and
 * are intentionally enforced by `productionReadiness` instead.
 */
export function commandAuthoringReadiness(
  s: Pick<StudioState, 'rawSource' | 'sourceReport' | 'beatMode' | 'selectedWorldId' | 'selectedPaletteId' | 'subject' | 'recipeScenes' | 'scenes' | 'blockers'>,
): {
  ready: boolean;
  reason: string;
  stage: 'source' | 'recipe' | 'storyboard' | 'blockers' | 'ready';
} {
  const src = sourceReadiness(s);
  if (!src.ready) return { ready: false, reason: `Kaynak hazır değil: ${src.reason}`, stage: 'source' };

  const rcp = recipeReadiness(s);
  if (!rcp.ready) return { ready: false, reason: `Reçete eksik: ${rcp.missing.join(', ')}`, stage: 'recipe' };

  if (!s.scenes.length) return { ready: false, reason: 'Storyboard üretilmedi.', stage: 'storyboard' };

  if (s.blockers.length) {
    return {
      ready: false,
      reason: `${s.blockers.length} çözülmemiş FACT REQUIRED — Mami kararı bekliyor.`,
      stage: 'blockers',
    };
  }

  return { ready: true, reason: 'Image Author command girdisi hazır.', stage: 'ready' };
}

/**
 * MOTION GATE (MACRO 5) — motion YALNIZ Mami'nin APPROVE ettiği CURRENT frame ile açılır.
 *
 * Saf fonksiyon: bir sahnenin motion brief'inin açılıp açılamayacağını söyler. Kapı gerçek
 * piksele bağlıdır (prompt'a değil): frame yoksa, verdict APPROVE değilse ya da frame eski karara
 * (commandId) bağlıysa (STALE) motion kapalıdır. `PROJECT_ONLY_ACCEPT` motion açmaz — proje
 * kaydına kabul edilir ama i2v'ye gitmez.
 */
export function motionGate(
  scene: Pick<Scene, 'userImagePrompt' | 'promptReceipt' | 'frameReceipt'>,
  commandId: string,
  promptSourceId: string,
  shotApproval: ShotApproval | undefined,
): { open: boolean; reason: string } {
  if (!hasCurrentAgentPrompt(scene, promptSourceId)) {
    return { open: false, reason: 'Current ajan prompt receipt yok veya prompt değişti.' };
  }
  if (shotApproval?.verdict !== 'APPROVED' || shotApproval.commandId !== commandId) {
    return { open: false, reason: 'Storyboard shot current karar için Mami APPROVED değil.' };
  }
  const f = scene.frameReceipt;
  if (!f) return { open: false, reason: 'Frame yok — Mami harici araçta üretip yüklemeli.' };
  if (!hasValidFrameEvidence(f)) return { open: false, reason: 'Frame kanıtı geçersiz — okunabilir gerçek görsel ve pozitif boyut gerekli.' };
  if (f.verdict === 'PENDING') return { open: false, reason: 'Frame yüklendi ama Mami hükmü bekliyor (APPROVE/REGENERATE).' };
  if (f.verdict === 'REGENERATE') return { open: false, reason: 'Mami REGENERATE dedi — yeni frame gerekli.' };
  if (f.verdict === 'PROJECT_ONLY_ACCEPT') return { open: false, reason: 'PROJECT_ONLY_ACCEPT — kayda kabul, motion açılmaz.' };
  if (f.fromCommandId !== commandId) return { open: false, reason: 'Frame eski karara bağlı (karar değişti) — yeniden üretip onayla.' };
  if (f.fromPromptHash !== scene.promptReceipt?.promptHash) {
    return { open: false, reason: 'Frame eski ajan prompt’una bağlı — current prompt için yeniden üretip onayla.' };
  }
  return { open: true, reason: 'Onaylı current frame var — motion açık.' };
}

/**
 * TEK CANONICAL PRODUCTION READINESS (MACRO 4).
 *
 * Site-gates.md'nin ölçtüğü kusur: 8+ rakip readiness hesabı çelişiyordu (Timeline "N/N hazır"
 * derken QA aynı batch'i bloklarken Mami iki ekranda iki farklı gerçek görüyordu). Bu fonksiyon
 * TEK production kapısıdır: authoring önkoşullarının üstüne prompt ve shot evidence'ını ekler.
 * UI shot/frame/motion durumunda bunu okur; command export ise daha erken açılması gereken
 * `commandAuthoringReadiness` kapısını kullanır.
 *
 * Kapı sırası (her biri bir öncekini varsayar):
 *  1. Kaynak hazır (sourceReadiness)
 *  2. Reçete tamam (recipeReadiness)
 *  3. Storyboard üretildi (scenes var) ve blocker yok (typed FACT REQUIRED temiz)
 *  4. Her shot current ajan prompt receipt'i taşıyor
 *  5. Her shot Mami tarafından APPROVED ve onay GÜNCEL karara bağlı (stale değil)
 */
export function productionReadiness(
  s: Pick<StudioState, 'rawSource' | 'sourceReport' | 'beatMode' | 'selectedWorldId' | 'selectedPaletteId' | 'subject' | 'recipeScenes' | 'scenes' | 'blockers' | 'shotApprovals'>,
  commandId: string,
  promptSourceId: string,
): {
  ready: boolean;
  /** İnsan-okur tek durum satırı. */
  reason: string;
  /** Hangi aşamada durdu. */
  stage: 'source' | 'recipe' | 'storyboard' | 'blockers' | 'prompt' | 'approval' | 'ready';
  promptMissingShotIds: number[];
  approvedShotIds: number[];
  pendingShotIds: number[];
  staleShotIds: number[];
} {
  const authoring = commandAuthoringReadiness(s);
  if (!authoring.ready) {
    return {
      ready: false,
      reason: authoring.reason,
      stage: authoring.stage,
      promptMissingShotIds: [],
      approvedShotIds: [],
      pendingShotIds: [],
      staleShotIds: [],
    };
  }

  const promptMissingShotIds = s.scenes.filter((scene) => !hasCurrentAgentPrompt(scene, promptSourceId)).map((scene) => scene.id);
  if (promptMissingShotIds.length) {
    return {
      ready: false,
      reason: `${promptMissingShotIds.length} shot current ajan prompt receipt’i bekliyor.`,
      stage: 'prompt',
      promptMissingShotIds,
      approvedShotIds: [],
      pendingShotIds: [],
      staleShotIds: [],
    };
  }

  // Her shot GÜNCEL karara bağlı APPROVED olmalı. Stale (eski commandId) veya reject/pending yeterli değil.
  const approvedShotIds: number[] = [];
  const pendingShotIds: number[] = [];
  const staleShotIds: number[] = [];
  for (const scene of s.scenes) {
    const a = s.shotApprovals[scene.id];
    if (!a || a.verdict !== 'APPROVED') pendingShotIds.push(scene.id);
    else if (a.commandId !== commandId) staleShotIds.push(scene.id);
    else approvedShotIds.push(scene.id);
  }
  if (pendingShotIds.length || staleShotIds.length) {
    const parts: string[] = [];
    if (pendingShotIds.length) parts.push(`${pendingShotIds.length} shot onay bekliyor`);
    if (staleShotIds.length) parts.push(`${staleShotIds.length} shot kararı değişti (yeniden onay gerek)`);
    return { ready: false, reason: parts.join(' · '), stage: 'approval', promptMissingShotIds, approvedShotIds, pendingShotIds, staleShotIds };
  }

  return { ready: true, reason: `Tüm ${s.scenes.length} shot current ajan prompt’uyla Mami tarafından onaylandı.`, stage: 'ready', promptMissingShotIds, approvedShotIds, pendingShotIds, staleShotIds };
}

export interface StudioState {
  selectedProjectId: string;
  projectTopic: string;
  projectClass: string;
  sceneCount: number;
  cast: Cast;
  location: string;
  subject: string;
  recipeScenes: SceneNote[];

  selectedWorldId: string;
  selectedPropId: string;
  selectedRefIds: string[];
  activePreviewRefId: string;
  selectedPaletteId: string;
  selectedMusicId: string;

  imageModel: string;
  videoModel: string;
  brandKitLock: string;

  mood: string;
  cameraEnergy: string;
  timeLight: string;
  transition: string;
  musicVibe: string;
  pov: string;
  signature: string;
  leitmotif: string;
  tempoCurve: string;
  phase0PresetId: string;
  directorChoices: Record<string, string>;
  directorBrief: string;
  /** Runtime'da authored, canonical command bundle ile Studio'ya geri alınan exact direktifler. */
  liveMamiDirectives: MamiDirective[];
  voSyncMode: VoSyncMode;
  osTextMode: OsTextMode;

  rawSource: string;
  sourceBeats: SourceBeat[];
  sourceReport: SourceIntegrityReport | null;

  scenes: Scene[];
  agentBrief: string;
  agentPackets: { image: string; motion: string; suno: string; idea: string; proof: string; } | null;
  selectedSceneId: number | null;
  isGenerating: boolean;
  lastError: string | null;
  /**
   * P6 — import edilen pack'in doğrulanamayan (format-only) kanıt uyarısı. verifyProjectPack
   * MOD-B hash'lerini (artifact/jury/protocol/storyboard/frame — kaynağı pack'te yok) burada
   * görünür kılar; import başarılı olur ama Mami "bu kanıt zayıf" sinyalini görür. null = hepsi
   * doğrulanabilir ya da henüz import yapılmadı.
   */
  packEvidenceNotice: string[] | null;
  /**
   * Typed FACT REQUIRED'lar (handoff §6). generateBatch BLOCKED dönünce typed blocker'lar
   * BURADA yaşar — `lastError` string'ine indirgenip KAYBOLMAZ. Site, runner, Claude ve Codex
   * aynı blocker'ı görür (Codex 5. tur: store bunları düşürüyordu).
   */
  blockers: Blocker[];

  beatMode: BeatMode;
  workingMode: WorkingMode;
  beatKeeps: Record<string, boolean>;
  beatAnalysis: BeatAnalysis | null;
  beatHistory: BeatHistoryEntry[];
  personalMode: boolean;

  /**
   * Mami'nin shot (sahne) onayları (MACRO 4). Storyboard'da her shot approve/reject edilir; onay
   * o anki kararın kimliğine (`commandId` = brief hash) bağlanır. Kararlar değişince (yeni
   * commandId) eski onaylar STALE olur — Mami yeniden onaylar. Ajan Mami adına onaylamaz.
   */
  shotApprovals: Record<number, ShotApproval>;

  currentStep: Step;

  setField: <K extends keyof StudioState>(field: K, value: StudioState[K]) => void;
  togglePersonalMode: () => void;
  setActivePreviewRefId: (id: string) => void;
  setScenes: (scenes: Scene[]) => void;
  setCurrentStep: (step: Step) => void;
  setRawSource: (raw: string) => void;
  decodeRawSource: () => void;
  ingestRawSource: () => void;
  setBeatMode: (mode: BeatMode) => void;
  toggleBeatKeep: (beatId: string) => void;
  mergeBeats: (index: number) => void;
  splitBeat: (index: number) => void;
  manualSplitBeat: (index: number, cutIndex: number) => void;
  updateBeatText: (index: number, text: string) => void;
  undoBeatAction: () => void;
  applyPreset: (preset: Partial<StudioState>) => void;
  generateScenes: () => void;
  exportRecipe: () => string;
  exportRecipeJson: () => string;
  advance: () => void;
  setSceneOverride: (sceneId: number, override: string | null) => void;
  /** Hash-valid Image Author→Jury artifact bundle'ını bir shot'a geri alır. */
  importAgentArtifact: (sceneId: number, artifactBundleJson: string) => void;
  /** Mami bir shot'ı onaylar/reddeder (MACRO 4). Onay güncel karara (commandId) bağlanır. */
  approveShot: (sceneId: number, note?: string) => void;
  rejectShot: (sceneId: number, note?: string) => void;
  clearShotApproval: (sceneId: number) => void;
  /** Mami harici araçta ürettiği frame'i bir shot'a yükler (MACRO 5). SHA-256 + boyut ölçülür. */
  importFrame: (sceneId: number, file: File) => Promise<void>;
  /** Mami frame hükmü verir: APPROVE motion'u açar; REGENERATE/PROJECT_ONLY_ACCEPT açmaz. */
  setFrameVerdict: (sceneId: number, verdict: SceneFrameReceipt['verdict'], note?: string) => void;
  /** Frame'i sahneden kaldırır (motion tekrar kapanır). */
  clearFrame: (sceneId: number) => void;
  /** Bu kararın taşınabilir kimliği (brief hash). Onay/receipt bağı bunu kullanır. */
  currentCommandId: () => string;
  /** Ajan prompt receipt'lerinin bağlandığı override-bağımsız canonical decision/storyboard kimliği. */
  currentPromptSourceCommandId: () => string;
  reset: () => void;
  resetStoryboard: () => void;

  vault: VaultEntry[];
  saveToVault: (name: string) => void;
  loadFromVault: (id: string) => void;
  deleteFromVault: (id: string) => void;

  /** Taşınabilir project pack'i JSON metnine paketler (MACRO 6). LocalStorage değil, gerçek kayıt. */
  exportProjectPack: () => string;
  /** Current karar/prompt/frame zincirinin stale-safe Studio kapanış receipt'i. */
  exportCloseout: () => string;
  /** Bir project pack JSON'unu doğrular ve yükler. Bozuksa/uyumsuzsa lastError'a düşer, yüklemez. */
  importProjectPack: (json: string) => void;
}

/**
 * Undo snapshot: beats + their BÖLEMEZSİN (keep) flags travel together, so
 * undoBeatAction never restores beats while silently dropping a keep flag
 * (keeps are keyed by beat id; ids change on split/merge/regroup).
 * Not persisted (pickProjectState'e dahil değil) — tip değişikliği migration gerektirmez.
 */
export interface BeatHistoryEntry {
  beats: SourceBeat[];
  keeps: Record<string, boolean>;
}

/** A named, restorable snapshot of a full project (legacy "Proje Kasası"). */
export interface VaultEntry {
  id: string;
  name: string;
  savedAt: number;
  snapshot: Partial<StudioState>;
}

// Tek kanon core'da (contract.ts effectiveTopic) — store yalnız yeniden ihraç eder.
import { DEFAULT_PROJECT_TOPIC } from '../core/contract';
export { DEFAULT_PROJECT_TOPIC, effectiveTopic } from '../core/contract';

const initial = {
  selectedProjectId: 'education',
  projectTopic: DEFAULT_PROJECT_TOPIC,
  projectClass: 'ANIMATION_EDU',
  sceneCount: 5,
  cast: '' as Cast,
  location: '',
  subject: 'Su Döngüsü',
  recipeScenes: [
    {
      id: 1,
      vo: 'Konu görsel olarak başlar.',
      event: 'Ana konu tek somut düzenek veya nesne olarak kadraja yerleşir.',
      director_note: 'single motivated key, subject centered with clear prop hierarchy',
      motion_seed: 'ana nesne ilk hareketine hazırlanıyor',
      turkish_labels: ['KONU'],
      avoid: ['jenerik metafor; kaynak dışı sembol'],
    },
  ] as SceneNote[],

  selectedWorldId: '',
  selectedPropId: 'none',
  selectedRefIds: [] as string[],
  activePreviewRefId: '',
  selectedPaletteId: 'native_world',
  selectedMusicId: '',

  imageModel: 'nano_banana_2',
  videoModel: 'kling_3',
  brandKitLock: '',

  mood: '',
  cameraEnergy: '',
  timeLight: '',
  transition: '',
  musicVibe: '',
  pov: '',
  signature: '',
  leitmotif: '',
  tempoCurve: '',
  phase0PresetId: '',
  directorChoices: {} as Record<string, string>,
  directorBrief: '',
  liveMamiDirectives: [] as MamiDirective[],
  voSyncMode: 'FREE' as VoSyncMode,
  osTextMode: 'AUTO' as OsTextMode,

  rawSource: '',
  sourceBeats: [] as SourceBeat[],
  sourceReport: null as SourceIntegrityReport | null,

  scenes: [] as Scene[],
  agentBrief: '',
  agentPackets: null as { image: string; motion: string; suno: string; idea: string; proof: string; } | null,
  selectedSceneId: null as number | null,
  isGenerating: false,
  lastError: null as string | null,
  // P6 — import edilen pack'te KAYNAĞI taşınmayan (format-only) hash'lerin görünür uyarısı.
  // M1 sözleşmesi: verifyProjectPack.unverifiableEvidence sessizce düşürülemez. Bir HATA
  // değil, "bu kanıt zayıf/doğrulanamaz" bildirimi → import başarılı olur ama Mami görür.
  packEvidenceNotice: null as string[] | null,
  blockers: [] as Blocker[],

  beatMode: 'Dengeli' as BeatMode,
  workingMode: 'Standart' as WorkingMode,
  beatKeeps: {} as Record<string, boolean>,
  beatAnalysis: null as BeatAnalysis | null,
  beatHistory: [] as BeatHistoryEntry[],
  personalMode: false,

  shotApprovals: {} as Record<number, ShotApproval>,

  currentStep: 'dashboard' as Step,

  vault: [] as VaultEntry[],
};

/** Cleared whenever the recipe or beat plan changes, so generated output never goes stale. */
const STALE_GENERATION: Pick<StudioState, 'scenes' | 'agentBrief' | 'agentPackets' | 'selectedSceneId' | 'shotApprovals' | 'packEvidenceNotice'> = {
  scenes: [],
  agentBrief: '',
  agentPackets: null,
  selectedSceneId: null,
  // Storyboard yeniden üretilince eski shot onayları artık geçersizdir — Mami yeniden onaylar.
  shotApprovals: {},
  // P6 — import edilen "doğrulanamayan kanıt" uyarısı storyboard'a bağlıdır; karar değişip
  // storyboard STALE olunca bu uyarı da düşer (aksi halde yanıltıcı biçimde ekranda asılı kalır).
  packEvidenceNotice: null,
};

// Above this many sentence atoms, ingest auto-groups into thematic beats
// (keeps short briefs sentence-level so manual beat control is unaffected).
const AUTO_GROUP_THRESHOLD = 12;

/**
 * Mutasyon ÖNCESİ storyboard'u (beats + keeps birlikte) undo geçmişine push'lar.
 * Boş storyboard snapshot'lanmaz — undo'yu boş state'le kirletmek yerine mevcut
 * geçmiş aynen korunur. Her beat-mutasyonu ve her regroup yolu bunu kullanır.
 */
function snapshotBeatHistory(
  s: Pick<StudioState, 'beatHistory' | 'sourceBeats' | 'beatKeeps'>,
): BeatHistoryEntry[] {
  if (s.sourceBeats.length === 0) return s.beatHistory;
  return [...s.beatHistory, { beats: [...s.sourceBeats], keeps: { ...s.beatKeeps } }].slice(-50);
}

/** Single source of truth for the persisted/snapshotted project fields (no vault, no transient flags). */
export function pickProjectState(s: StudioState): Partial<StudioState> {
  return {
    selectedProjectId: s.selectedProjectId,
    projectTopic: s.projectTopic,
    projectClass: s.projectClass,
    sceneCount: s.sceneCount,
    cast: s.cast,
    location: s.location,
    subject: s.subject,
    recipeScenes: s.recipeScenes,
    selectedWorldId: s.selectedWorldId,
    selectedPropId: s.selectedPropId,
    selectedRefIds: s.selectedRefIds,
    activePreviewRefId: s.activePreviewRefId,
    selectedPaletteId: s.selectedPaletteId,
    selectedMusicId: s.selectedMusicId,
    imageModel: s.imageModel,
    videoModel: s.videoModel,
    brandKitLock: s.brandKitLock,
    mood: s.mood,
    cameraEnergy: s.cameraEnergy,
    timeLight: s.timeLight,
    transition: s.transition,
    musicVibe: s.musicVibe,
    pov: s.pov,
    signature: s.signature,
    leitmotif: s.leitmotif,
    tempoCurve: s.tempoCurve,
    phase0PresetId: s.phase0PresetId,
    directorChoices: s.directorChoices,
    directorBrief: s.directorBrief,
    liveMamiDirectives: s.liveMamiDirectives,
    voSyncMode: s.voSyncMode,
    osTextMode: s.osTextMode,
    rawSource: s.rawSource,
    sourceBeats: s.sourceBeats,
    sourceReport: s.sourceReport,
    scenes: s.scenes,
    agentBrief: s.agentBrief,
    agentPackets: s.agentPackets,
    selectedSceneId: s.selectedSceneId,
    shotApprovals: s.shotApprovals,
    beatMode: s.beatMode,
    workingMode: s.workingMode,
    beatKeeps: s.beatKeeps,
    beatAnalysis: s.beatAnalysis,
    currentStep: s.currentStep,
  };
}

const serverStorage: Storage = {
  length: 0,
  clear: () => undefined,
  getItem: () => null,
  key: () => null,
  removeItem: () => undefined,
  setItem: () => undefined,
};

export function presetWithDefaults(
  current: Pick<StudioState, 'projectClass' | 'selectedWorldId'>,
  preset: Partial<StudioState>,
): Partial<StudioState> {
  const projectClass = preset.projectClass ?? current.projectClass;
  const selectedWorldId = normalizeWorldId(preset.selectedWorldId ?? current.selectedWorldId);
  const defaults = resolveRecipeDefaults(projectClass, selectedWorldId);
  const selectedRefIds = normalizeRefIds(preset.selectedRefIds?.length ? preset.selectedRefIds : defaults.selectedRefIds);
  return {
    ...preset,
    selectedWorldId,
    selectedPropId: preset.selectedPropId ? normalizeMaterialId(preset.selectedPropId) : preset.selectedPropId,
    selectedRefIds,
    activePreviewRefId: selectedRefIds[0] || '',
    selectedPaletteId: normalizePaletteId(preset.selectedPaletteId || defaults.selectedPaletteId),
    ...STALE_GENERATION,
    lastError: null,
  };
}

function hasCurrentSceneShape(value: unknown): value is Scene {
  if (!value || typeof value !== 'object') return false;
  const scene = value as Partial<Scene>;
  return Boolean(
    typeof scene.motionPrompt === 'string' &&
      scene.duration &&
      typeof scene.duration.sec === 'number' &&
      scene.handoff?.IMAGE?.draft,
  );
}

function migrateStateV5ToV6(state: any): any {
  if (!state || typeof state !== 'object') return state;

  const legacySingular = typeof state.selectedRefId === 'string' && state.selectedRefId ? [state.selectedRefId] : [];
  delete state.selectedRefId;
  const candidate = Array.isArray(state.selectedRefIds) && state.selectedRefIds.length ? state.selectedRefIds : legacySingular;
  state.selectedRefIds = normalizeRefIds(candidate);
  state.activePreviewRefId = state.selectedRefIds[0] || '';

  // 2. Clear old scenes & generation outputs since they contain v5 refDNA
  state.scenes = [];
  state.agentBrief = '';
  state.agentPackets = null;
  state.selectedSceneId = null;

  return state;
}

/** Current i2v engine. Legacy Kling ids upgrade to this on load. */
export const CURRENT_VIDEO_MODEL = 'kling_3';
const LEGACY_VIDEO_MODELS = new Set(['kling', 'kling_2', 'kling_21', 'kling_2_1']);
export function normalizeVideoModel(value: unknown): string {
  if (typeof value !== 'string' || !value) return CURRENT_VIDEO_MODEL;
  return LEGACY_VIDEO_MODELS.has(value.toLowerCase()) ? CURRENT_VIDEO_MODEL : value;
}

/**
 * BRAIN M3 (Sol KRİTİK #2): eski persisted sahneler `architecture.dominantSubject/event`
 * (verbatim beat'in byte-copy'si) taşır; yeni şekil dürüst `exactSourceBeat` +
 * `semanticInterpretationStatus: 'AGENT_AUTHORED'`. Migration olmadan eski projelerde
 * QA/export/UI sessizce boş alan okur. Kopyalar aynı byte olduğundan iyileşme kayıpsız:
 * source.exactText (yoksa eski dominantSubject) yeni alana taşınır, kopya alanlar düşer.
 */
export function healArchitectureM3(scenes: unknown): any {
  if (!Array.isArray(scenes)) return scenes;
  return scenes.map((scene: any) => {
    const arch = scene?.architecture;
    if (!arch || typeof arch !== 'object') return scene;
    if (typeof arch.exactSourceBeat === 'string' && !('dominantSubject' in arch) && !('event' in arch)) return scene;
    const { dominantSubject, event: _legacyEvent, ...rest } = arch;
    return {
      ...scene,
      architecture: {
        ...rest,
        exactSourceBeat: typeof arch.exactSourceBeat === 'string' && arch.exactSourceBeat
          ? arch.exactSourceBeat
          : (arch.source?.exactText ?? dominantSubject ?? ''),
        semanticInterpretationStatus: 'AGENT_AUTHORED' as const,
      },
    };
  });
}

export function migratePersistedState(value: unknown): Partial<StudioState> {
  if (!value || typeof value !== 'object') return {};
  const persisted = value as any;
  // BRAIN M3 (Sol re-audit): v5'in tek gerçek imzası tekil `selectedRefId`dir.
  // Eski tetik `Array.isArray(selectedRefIds)`i de sayıyordu — bu HER modern state'te
  // doğru olduğundan loadFromVault/legacy-import her seferinde V5→V6'ya girip
  // scenes=[] ile sahneleri SİLİYORDU (ölçüldü: iki yol da sceneCount 0 verdi).
  const needsV6Migration = 'selectedRefId' in persisted;
  if (needsV6Migration) {
    migrateStateV5ToV6(persisted);
  }

  // Keep only scenes that satisfy the current runtime shape — one malformed scene
  // no longer nukes the whole batch (D3).
  const scenes = Array.isArray(persisted.scenes) ? persisted.scenes.filter(hasCurrentSceneShape) : [];
  const intact = scenes.length === (Array.isArray(persisted.scenes) ? persisted.scenes.length : 0) && scenes.length > 0;

  const vault = Array.isArray(persisted.vault)
    ? persisted.vault.flatMap((entry: any) => {
        if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string') return [];
        return [{ ...entry, snapshot: migratePersistedState(entry.snapshot) }];
      })
    : persisted.vault;
  const selectedRefIds = normalizeRefIds(persisted.selectedRefIds);

  return {
    ...persisted,
    selectedWorldId: normalizeWorldId(persisted.selectedWorldId),
    selectedPropId: normalizeMaterialId(persisted.selectedPropId),
    selectedPaletteId: normalizePaletteId(persisted.selectedPaletteId),
    videoModel: normalizeVideoModel(persisted.videoModel),
    subject: typeof persisted.subject === 'string' ? persisted.subject : persisted.projectTopic || initial.subject,
    location: typeof persisted.location === 'string' ? persisted.location : '',
    recipeScenes: Array.isArray(persisted.recipeScenes) ? persisted.recipeScenes : initial.recipeScenes,
    selectedRefIds,
    activePreviewRefId: selectedRefIds.includes(persisted.activePreviewRefId)
      ? persisted.activePreviewRefId
      : selectedRefIds[0] || '',
    voSyncMode: persisted.voSyncMode ?? 'FREE',
    osTextMode: persisted.osTextMode ?? 'AUTO',
    ...(vault ? { vault } : {}),
    // BRAIN M3: legacy import yolları (V2026 read-only, project pack) da buradan geçer —
    // eski architecture şekli her girişte iyileşsin.
    scenes: healArchitectureM3(scenes.map((s: any) => ({ onScreenText: null, ...s }))),
    // Brief + packets are only trustworthy when the full scene batch survived migration.
    agentBrief: intact && typeof persisted.agentBrief === 'string' ? persisted.agentBrief : '',
    agentPackets: intact ? persisted.agentPackets || null : null,
    selectedSceneId: scenes.some((s: any) => s.id === persisted.selectedSceneId) ? persisted.selectedSceneId ?? null : null,
  };
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => {
      const getRecipeInput = () => {
        const s = get();
        const world = DATA.worlds.find((item) => item.id === s.selectedWorldId);
        if (!world) throw new Error('Reçete export için dünya seçilmedi.');
        const material = DATA.materials.find((item) => item.id === s.selectedPropId) || DATA.materials.find((item) => item.id === 'none') || null;
        const palette = DATA.palettes.find((item) => item.id === s.selectedPaletteId) || null;
        const cast = s.cast
          .split(/[,\n]+/u)
          .map((item) => item.trim())
          .filter(Boolean);
        return {
          world,
          material,
          palette,
          cast,
          location: s.location,
          subject: s.subject || s.projectTopic,
          scenes: s.recipeScenes,
        };
      };

      return {
        ...initial,

      setField: (field, value) => {
        const s = get();
        // Karar değişince storyboard STALE olur — onunla birlikte shot onayları da geçersizdir
        // (MACRO 4: onay karara bağlıdır). Mami yeniden onaylar.
        const clearGeneration = { scenes: [], agentBrief: '', agentPackets: null, selectedSceneId: null, lastError: null, shotApprovals: {}, packEvidenceNotice: null };
        if (field === 'selectedWorldId') {
          const worldId = normalizeWorldId(String(value));
          const world = DATA.worlds.find((item) => item.id === worldId);
          // Materyalin dünya-uyumluya çekilmesiyle aynı mantık: register uyuşmayan bir dünya+path
          // ikilisi generateBatch'i WORLD_PATH_MISMATCH ile bloklardı. Guard iki yönlü ve yalnız
          // uyuşmazlıkta ateşler — ZATEN uyumlu bir path'i asla ezmez.
          //  · REAL/sinematik dünya + non-REAL path → catch-all reklam path'i (ULTRAREAL_COMMERCIAL).
          //  · non-real dünya + REAL path → dünyanın grubuna uygun non-REAL path (edu→ANIMATION_EDU, aksi STYLIZED_PREMIUM).
          const realWorld = !!world && /real|cinematic/i.test(world.group || '');
          const pathReal = registerOf(s.projectClass) === 'REAL';
          let projectClass = s.projectClass;
          if (realWorld && !pathReal) projectClass = 'ULTRAREAL_COMMERCIAL';
          else if (world && !realWorld && pathReal) {
            projectClass = /edu/i.test(world.group || '') ? 'ANIMATION_EDU' : 'STYLIZED_PREMIUM';
          }
          const defaults = resolveRecipeDefaults(projectClass, worldId);
          set({
            selectedWorldId: worldId,
            projectClass,
            selectedPropId: effectiveMaterialId(world, s.selectedPropId),
            ...defaults,
            activePreviewRefId: defaults.selectedRefIds[0] || '',
            ...clearGeneration,
          });
          return;
        }
        if (field === 'projectClass') {
          const defaults = resolveRecipeDefaults(String(value), s.selectedWorldId);
          set({ projectClass: String(value), ...defaults, activePreviewRefId: defaults.selectedRefIds[0] || '', ...clearGeneration });
          return;
        }
        if (field === 'selectedRefIds') {
          const selectedRefIds = normalizeRefIds(value);
          set({ selectedRefIds, activePreviewRefId: selectedRefIds[0] || '', ...clearGeneration });
          return;
        }
        if (field === 'videoModel') {
          // Scene budget is model-aware: a wider engine window means fewer, longer
          // beats, so switching the motion engine regroups from the immutable
          // rawSource (Manuel mode keeps the user's hand-built beats untouched).
          const videoModel = normalizeVideoModel(String(value));
          const regroup = !!s.rawSource && s.beatMode !== 'Manuel';
          const sourceBeats = regroup ? autoGroupBeats(s.rawSource, s.beatMode, videoModel) : s.sourceBeats;
          const regroupPatch = regroup
            ? {
              sourceBeats,
              sourceReport: sourceIntegrity(s.rawSource, sourceBeats),
              sceneCount: Math.max(1, sourceBeats.length || 1),
              beatAnalysis: planBeats(sourceBeats.map(b => ({ id: b.sourceId, text: b.exactText })), s.beatMode, [5, 10]),
              // Regrouping mints fresh beat ids, so keep flags bound to the old ids are
              // stale — clear them. History ise SİLİNMEZ: regroup el emeğini ezdiği için
              // önce snapshot alınır ki undo son storyboard'u (keeps'iyle) geri getirebilsin.
              beatKeeps: {},
              beatHistory: snapshotBeatHistory(s),
            }
            : {};
          set({ videoModel, ...regroupPatch, ...clearGeneration });
          return;
        }
        // NB: selectedWorldId, projectClass, selectedRefIds and videoModel each have a
        // dedicated early-return branch above, so they are intentionally NOT listed here.
        const generationFields: Array<keyof StudioState> = [
          'projectTopic', 'sceneCount', 'cast', 'selectedPropId',
          'selectedPaletteId', 'selectedMusicId', 'imageModel',
          'brandKitLock', 'mood', 'cameraEnergy', 'timeLight', 'transition', 'musicVibe',
          'pov', 'signature', 'leitmotif', 'tempoCurve', 'phase0PresetId', 'directorChoices', 'directorBrief',
          'voSyncMode', 'osTextMode', 'location', 'subject', 'recipeScenes',
        ];
        const normalizedValue = field === 'selectedPaletteId'
          ? normalizePaletteId(String(value))
          : field === 'selectedPropId'
            ? normalizeMaterialId(String(value))
            : value;
        set({
          ...({ [field]: normalizedValue } as Partial<StudioState>),
          ...(generationFields.includes(field) ? clearGeneration : {}),
        });
      },
      setActivePreviewRefId: (activePreviewRefId) => set({ activePreviewRefId }),
      setScenes: (scenes) => set({ scenes }),
      setCurrentStep: (currentStep) => set({ currentStep }),
      // HARD-FIX 2026-07-17 (G6, ordu ORTA-5): kaynak GİRİŞTE NFC'ye normalize edilir.
      // Windows'ta yazılıp Mac'te yapıştırılan metin dekompoze (NFD) ü/ç/ş taşıyabilir;
      // aynı senaryo platforma göre sessizce farklı sahneye bölünüyor, hash determinizmi
      // kayıyor, VO bozuk bayt taşıyordu. Girişte tek NFC ile hem raw hem türetilen beats
      // tutarlı kalır (integrity BOZULMAZ — ikisi de NFC) ve platform farkı biter.
      setRawSource: (rawSource) => set({
        rawSource: rawSource.normalize('NFC'),
        sceneCount: 0,
        sourceBeats: [],
        beatKeeps: {},
        beatHistory: [],
        sourceReport: null,
        beatAnalysis: null,
        ...STALE_GENERATION,
        lastError: null,
      }),
      decodeRawSource: () => {
        const rawSource = get().rawSource;
        const dossierSource = extractProductionDossierSource(rawSource);
        const decoded = decodeBrief(rawSource);
        // Plain raw source is CONTENT, never permission to infer a recipe. Only an explicitly
        // labelled MAMILAS dossier may restore its own path/world/ref/palette metadata.
        if (!dossierSource || decoded.confidence !== 'high') {
          set({ lastError: null });
          return;
        }
        const selectedRefIds = normalizeRefIds(decoded.project.ref
          ? [decoded.project.ref]
          : resolveRecipeDefaults(decoded.path, decoded.project.world).selectedRefIds);
        set({
          selectedProjectId: decoded.project.id,
          projectClass: decoded.path,
          selectedWorldId: normalizeWorldId(decoded.project.world),
          selectedRefIds,
          activePreviewRefId: selectedRefIds[0] || '',
          selectedPaletteId: normalizePaletteId(decoded.project.palette),
          // Decode changes world/palette, so any preset-locked Director mandate is now
          // stale — clear it the same way Dashboard's onAutoRecipe does.
          phase0PresetId: '',
          directorChoices: {},
          directorBrief: '',
          scenes: [],
          agentBrief: '',
          agentPackets: null,
          selectedSceneId: null,
          lastError: null,
        });
      },
      ingestRawSource: () => {
        const s = get();
        const dossierSource = extractProductionDossierSource(s.rawSource);
        const rawSource = dossierSource?.rawSource || s.rawSource;
        const atoms = dossierSource?.beats || ingestSource(rawSource);
        // Auto-group granular ingests into thematic beats so a 3-minute script
        // doesn't explode into 50+ scenes. Tiny inputs and Manuel mode stay
        // sentence-level (user keeps full manual control via merge/split).
        const sourceBeats = !dossierSource && s.beatMode !== 'Manuel' && atoms.length > AUTO_GROUP_THRESHOLD
          ? autoGroupBeats(rawSource, s.beatMode, s.videoModel)
          : atoms;
        const sourceReport = sourceIntegrity(rawSource, sourceBeats);
        const beatAnalysis = planBeats(sourceBeats.map(b => ({ id: b.sourceId, text: b.exactText })), s.beatMode, [5, 10]);
        set({ rawSource, sourceBeats, sourceReport, sceneCount: Math.max(1, sourceBeats.length || 1), beatAnalysis });
      },
      setBeatMode: (mode) => {
        const s = get();
        // Every mode except Manuel cleanly regroups from the immutable rawSource,
        // so a previously broken (hand-edited) storyboard is always repaired here.
        // Manuel preserves the user's existing beats untouched. No threshold guard:
        // small sources must regroup too, otherwise broken state survives mode switches.
        const regroup = !!s.rawSource && mode !== 'Manuel';
        const sourceBeats = regroup ? autoGroupBeats(s.rawSource, mode, s.videoModel) : s.sourceBeats;
        const beatAnalysis = planBeats(sourceBeats.map(b => ({ id: b.sourceId, text: b.exactText })), mode, [5, 10]);
        const regroupPatch = regroup
          ? {
            sourceBeats,
            sourceReport: sourceIntegrity(s.rawSource, sourceBeats),
            sceneCount: Math.max(1, sourceBeats.length || 1),
            // Regroup el emeğini ezer — önce snapshot, ki undo geri getirebilsin.
            // Yeni beat id'leri pozisyonel (source-001…) olduğundan eski keep bayrakları
            // alakasız yeni beat'lere yapışırdı — videoModel branch'ıyla tutarlı: temizle.
            beatHistory: snapshotBeatHistory(s),
            beatKeeps: {},
          }
          : {};
        set({ beatMode: mode, beatAnalysis, ...regroupPatch, ...STALE_GENERATION });
      },
      toggleBeatKeep: (beatId) => {
        const s = get();
        const beatKeeps = { ...s.beatKeeps, [beatId]: !s.beatKeeps[beatId] };
        set({ beatKeeps });
      },
      mergeBeats: (index) => {
        const s = get();
        // Son beat için merge = "önceki ile birleştir" — beats.ts kısa-kuyruk hint'i
        // son index'i verir; index+1 yok diye sessiz no-op olmasın.
        const i = index < s.sourceBeats.length - 1 ? index : index - 1;
        const b1 = s.sourceBeats[i];
        const b2 = s.sourceBeats[i + 1];
        if (!b1 || !b2) return;
        const historySnapshot = snapshotBeatHistory(s);
        // exactText tek gerçek: el düzeltmesi (updateBeatText) yalnız exactText'i değiştirir;
        // rawSource.slice(b1.start, b2.end) o düzeltmeyi sessizce geri alırdı. Aradaki
        // orijinal boşluğu koruyarak exactText'leri birleştir — pristine beat'lerde
        // rawSource.slice ile birebir aynı sonuç.
        const gap = s.rawSource ? s.rawSource.slice(b1.end, b2.start) : '';
        const exactText = b1.exactText + gap + b2.exactText;
        const merged: SourceBeat = {
          sourceId: b1.sourceId,
          exactText,
          start: b1.start,
          end: b2.end,
          hash: b1.hash + '-' + b2.hash, // rough proxy
        };
        const newBeats = [...s.sourceBeats];
        newBeats.splice(i, 2, merged);
        // BÖLEMEZSİN (keep) taşınır: taraflardan biri keep'liyse merged de keep'li.
        const beatKeeps = { ...s.beatKeeps };
        const keep = !!(beatKeeps[b1.sourceId] || beatKeeps[b2.sourceId]);
        delete beatKeeps[b2.sourceId];
        if (keep) beatKeeps[merged.sourceId] = true;
        const beatAnalysis = planBeats(newBeats.map(b => ({ id: b.sourceId, text: b.exactText })), s.beatMode, [5, 10]);
        set({
          sourceBeats: newBeats,
          beatKeeps,
          beatHistory: historySnapshot,
          sourceReport: s.rawSource ? sourceIntegrity(s.rawSource, newBeats) : s.sourceReport,
          beatAnalysis,
          sceneCount: newBeats.length,
          ...STALE_GENERATION,
        });
      },
      splitBeat: (index) => {
        const s = get();
        const beat = s.sourceBeats[index];
        if (!beat) return;
        const rawSource = s.rawSource;
        if (!rawSource) {
          set({ lastError: 'Kaynak yok; bölme yapılamaz.' });
          return;
        }
        // Beat'in GÜNCEL metninden kes (exactText tek gerçek): el düzeltmesi varsa
        // rawSource.slice onu sessizce geri alırdı. Pristine beat'te exactText zaten
        // rawSource.slice(start,end) ile birebir. Asla split(' ')/join(' ') yok.
        const segment = beat.exactText;
        let cut = eventBoundary(segment);
        if (cut <= 0) cut = sentenceBoundary(segment);
        if (cut <= 0 || cut >= segment.length
          || !segment.slice(0, cut).trim() || !segment.slice(cut).trim()) {
          set({ lastError: 'Güvenli bölme noktası bulunamadı; bu beat bölünemiyor.' });
          return;
        }
        // Offsetlar yaklaşık kalabilir (düzenlenmiş beat'te bütünlük zaten "altered");
        // metin gerçeği exactText'te taşınır.
        const cutAbs = Math.min(beat.start + cut, beat.end);
        const b1: SourceBeat = {
          sourceId: beat.sourceId + '-A',
          exactText: segment.slice(0, cut),
          start: beat.start,
          end: cutAbs,
          hash: beat.hash + '-A',
        };
        const b2: SourceBeat = {
          sourceId: beat.sourceId + '-B',
          exactText: segment.slice(cut),
          start: cutAbs,
          end: beat.end,
          hash: beat.hash + '-B',
        };
        const newBeats = [...s.sourceBeats];
        newBeats.splice(index, 1, b1, b2);
        // BÖLEMEZSİN (keep) iki çocuğa da taşınır.
        const keepSplit = !!s.beatKeeps[beat.sourceId];
        const beatKeeps = { ...s.beatKeeps };
        delete beatKeeps[beat.sourceId];
        if (keepSplit) { beatKeeps[b1.sourceId] = true; beatKeeps[b2.sourceId] = true; }
        // b1+b2 exactText'leri beat'in exactText'ini kayıpsız yeniden üretir (segment
        // partisyonu) — pristine beat'te byte-range de birebir korunur. Integrity burada
        // bozuk okunuyorsa ZATEN önceki bir el düzeltmesiyle bozulmuştu; bu split'i
        // suçlama. Sadece bu split'in kendisinin yarattığı gerçek regresyonu reddet.
        const priorReport = s.sourceReport;
        const sourceReport = sourceIntegrity(rawSource, newBeats);
        if (priorReport && priorReport.ok && !sourceReport.ok) {
          set({ lastError: `Bölme bütünlüğü bozdu (%${sourceReport.coverage}); işlem geri alındı.` });
          return;
        }
        const historySnapshot = snapshotBeatHistory(s);
        const beatAnalysis = planBeats(newBeats.map(b => ({ id: b.sourceId, text: b.exactText })), s.beatMode, [5, 10]);
        set({ sourceBeats: newBeats, beatKeeps, beatHistory: historySnapshot, sourceReport, beatAnalysis, sceneCount: newBeats.length, ...STALE_GENERATION, lastError: null });
      },
      manualSplitBeat: (index, cutIndex) => {
        const s = get();
        const beat = s.sourceBeats[index];
        if (!beat) return;
        const rawSource = s.rawSource;
        if (!rawSource) return;

        // cutIndex kullanıcının GÖRDÜĞÜ (edited) metne göre gelir — segment de o olmalı.
        // rawSource.slice kullanmak hem düzeltmeyi geri alır hem kesimi yanlış karaktere
        // kaydırırdı (uzunluk değiştiyse). exactText tek gerçek.
        const segment = beat.exactText;
        if (cutIndex <= 0 || cutIndex >= segment.length || !segment.slice(0, cutIndex).trim() || !segment.slice(cutIndex).trim()) {
          set({ lastError: 'Geçersiz manuel bölme noktası.' });
          return;
        }

        const cutAbs = Math.min(beat.start + cutIndex, beat.end);
        const b1: SourceBeat = {
          sourceId: beat.sourceId + '-M1',
          exactText: segment.slice(0, cutIndex),
          start: beat.start,
          end: cutAbs,
          hash: beat.hash + '-M1',
        };
        const b2: SourceBeat = {
          sourceId: beat.sourceId + '-M2',
          exactText: segment.slice(cutIndex),
          start: cutAbs,
          end: beat.end,
          hash: beat.hash + '-M2',
        };
        const newBeats = [...s.sourceBeats];
        newBeats.splice(index, 1, b1, b2);
        // BÖLEMEZSİN (keep) iki çocuğa da taşınır.
        const keepSplit = !!s.beatKeeps[beat.sourceId];
        const beatKeeps = { ...s.beatKeeps };
        delete beatKeeps[beat.sourceId];
        if (keepSplit) { beatKeeps[b1.sourceId] = true; beatKeeps[b2.sourceId] = true; }

        // Manual splits are byte-safe too (b1/b2 come straight from rawSource), so a
        // broken report here means integrity was already broken by an earlier edit on
        // another beat — not by this split. Block only a genuine regression, never a
        // pre-existing one. This is the user's own storyboard; a lossless cut is theirs.
        const priorReport = s.sourceReport;
        const sourceReport = sourceIntegrity(rawSource, newBeats);
        if (priorReport && priorReport.ok && !sourceReport.ok) {
          set({ lastError: `Manuel bölme bütünlüğü bozdu (%${sourceReport.coverage}).` });
          return;
        }
        const historySnapshot = snapshotBeatHistory(s);
        const beatAnalysis = planBeats(newBeats.map(b => ({ id: b.sourceId, text: b.exactText })), s.beatMode, [5, 10]);
        set({ sourceBeats: newBeats, beatKeeps, beatHistory: historySnapshot, sourceReport, beatAnalysis, sceneCount: newBeats.length, ...STALE_GENERATION, lastError: null });
      },
      updateBeatText: (index, text) => {
        const s = get();
        const beat = s.sourceBeats[index];
        if (!beat) return;
        const historySnapshot = snapshotBeatHistory(s);
        const newBeats = [...s.sourceBeats];
        newBeats[index] = { ...beat, exactText: text };

        // When manually editing, source integrity might be intentionally broken or altered
        const sourceReport = s.rawSource ? sourceIntegrity(s.rawSource, newBeats) : s.sourceReport;
        const beatAnalysis = planBeats(newBeats.map(b => ({ id: b.sourceId, text: b.exactText })), s.beatMode, [5, 10]);
        set({ sourceBeats: newBeats, beatHistory: historySnapshot, sourceReport, beatAnalysis, ...STALE_GENERATION, lastError: null });
      },
      undoBeatAction: () => {
        const s = get();
        if (s.beatHistory.length === 0) return;
        const historySnapshot = [...s.beatHistory];
        const prev = historySnapshot.pop();
        if (!prev) return;
        const prevBeats = prev.beats;
        const sourceReport = s.rawSource ? sourceIntegrity(s.rawSource, prevBeats) : s.sourceReport;
        const beatAnalysis = planBeats(prevBeats.map(b => ({ id: b.sourceId, text: b.exactText })), s.beatMode, [5, 10]);
        // keeps beats'le BİRLİKTE geri gelir — undo sonrası BÖLEMEZSİN bayrağı
        // artık var olmayan çocuk id'lerde asılı kalıp sessizce kaybolmaz.
        set({ sourceBeats: prevBeats, beatKeeps: { ...prev.keeps }, beatHistory: historySnapshot, sourceReport, beatAnalysis, sceneCount: prevBeats.length, ...STALE_GENERATION, lastError: null });
      },
      applyPreset: (preset) => set((s) => presetWithDefaults(s, preset)),

      exportRecipe: () => buildRecipeMarkdown(getRecipeInput()),
      exportRecipeJson: () => JSON.stringify(buildRecipeMachine(getRecipeInput()), null, 2),

      generateScenes: () => {
        const s = get();
        if (s.isGenerating) return;
        // Heal any stale/legacy engine id (e.g. persisted kling_2_1) before producing,
        // so every scene's duration/split and motion handoff name the current engine.
        const videoModel = normalizeVideoModel(s.videoModel);
        set({ isGenerating: true, lastError: null, blockers: [], videoModel });
        try {
          const result = generateBatch({
            rawSource: s.rawSource,
            sourceBeats: s.sourceBeats,
            projectTopic: s.projectTopic,
            projectClass: s.projectClass,
            sceneCount: s.sceneCount,
            cast: s.cast,
            selectedWorldId: s.selectedWorldId,
            selectedPropId: s.selectedPropId,
            selectedRefIds: s.selectedRefIds,
            selectedPaletteId: s.selectedPaletteId,
            selectedMusicId: s.selectedMusicId,
            imageModel: s.imageModel,
            videoModel,
            brandKitLock: s.brandKitLock,
            mood: s.mood,
            cameraEnergy: s.cameraEnergy,
            timeLight: s.timeLight,
            transition: s.transition,
            musicVibe: s.musicVibe,
            pov: s.pov,
            signature: s.signature,
            leitmotif: s.leitmotif,
            tempoCurve: s.tempoCurve,
            phase0PresetId: s.phase0PresetId,
            directorChoices: s.directorChoices,
            directorBrief: s.directorBrief,
            voSyncMode: s.voSyncMode,
            osTextMode: s.osTextMode,
            // Reçete adımının üç kararı buraya HİÇ gelmiyordu — Mami konuyu, mekânı ve
            // sahne notlarını yazıyor, generateBatch onları görmüyor, final_brief.md'de
            // hiçbiri yok. `generationFields` bu üçünü zaten "üretimi geçersiz kılar"
            // diye işaretliyordu: store onların üretimi etkilediğine İNANIYORDU.
            subject: s.subject,
            location: s.location,
            recipeScenes: s.recipeScenes,
          });
          if (result.status === 'BLOCKED') {
            set({
              // İnsan-okur özet + TYPED blocker'lar birlikte. Blocker'lar düşürülmez.
              lastError: result.contractGate.findings.map((f) => `${f.code}: ${f.message}`).join(' · '),
              blockers: result.blockers ?? [],
              scenes: [],
              isGenerating: false,
            });
          } else {
            const adapted: Scene[] = result.scenes.map((sc) => ({
              id: sc.id,
              architecture: sc.architecture,
              imagePrompt: sc.imagePrompt,
              motionPrompt: sc.motionPrompt,
              voiceOver: sc.voiceOver,
              sunoBrief: sc.sunoBrief,
              durationSec: sc.durationSec,
              duration: sc.duration,
              intensity: sc.intensity,
              phaseName: sc.phaseName,
              handoff: sc.handoff,
              onScreenText: sc.onScreenText,
            }));
            set({
              scenes: adapted,
              agentBrief: result.agentBrief ?? '',
              agentPackets: result.agentPackets ?? null,
              selectedSceneId: adapted[0]?.id ?? null,
              blockers: [],
              isGenerating: false,
            });
          }
        } catch (err) {
          set({
            lastError: err instanceof Error ? err.message : String(err),
            isGenerating: false,
          });
        }
      },

      setSceneOverride: (sceneId, override) =>
        set((s) => ({
          scenes: s.scenes.map((sc) => (sc.id === sceneId ? applyPromptOverride(sc, override) : sc)),
        })),

      currentCommandId: () => {
        // commandId'nin TEK kaynağı buildCommandJSON'dur — burada yeniden hesaplamak drift
        // (iki farklı hash) yaratırdı. Aksiyon-içi çağrı: ES-module döngüsü çalışma anında çözülür.
        try {
          return buildCommandJSON(get() as never).commandId;
        } catch {
          return 'mamilas-unbound';
        }
      },

      currentPromptSourceCommandId: () => {
        try {
          return promptSourceCommandId(get());
        } catch {
          return 'mamilas-unbound';
        }
      },

      importAgentArtifact: (sceneId, artifactBundleJson) => {
        const current = get();
        const scene = current.scenes.find((candidate) => candidate.id === sceneId);
        if (!scene) { set({ lastError: `Scene ${sceneId} yok.` }); return; }
        if (!artifactBundleJson.trim()) {
          set((s) => ({
            scenes: s.scenes.map((candidate) => candidate.id === sceneId ? applyAgentPrompt(candidate, '', current.currentPromptSourceCommandId()) : candidate),
            lastError: null,
          }));
          return;
        }
        try {
          const imported = applyImageArtifactBundle(scene, artifactBundleJson, current);
          const directivesChanged = canonicalHash(imported.liveMamiDirectives) !== canonicalHash(current.liveMamiDirectives);
          // HARD-FIX 2026-07-17 (G5, ordu KÖK-A): direktif değişince shotApprovals sıfırlanıyordu
          // ama frameReceipt sahnede KALIYORDU → yetim frame. Yeni commandId ile o kare zaten
          // stale (karar değişti); receipt duruyor diye export→import paketi verifyProjectPack.ok
          // =false verip başka cihazda 0 sahne açıyordu (yedek ölü doğuyordu). Karar değişince
          // frame kanıtı da temizlenmeli — Mami yeni karar için yeni kareyi yeniden onaylar.
          set((s) => ({
            scenes: s.scenes.map((candidate) => {
              if (candidate.id !== sceneId) {
                return directivesChanged ? { ...candidate, frameReceipt: undefined } : candidate;
              }
              return directivesChanged ? { ...imported.scene, frameReceipt: undefined } : imported.scene;
            }),
            liveMamiDirectives: imported.liveMamiDirectives,
            shotApprovals: directivesChanged ? {} : s.shotApprovals,
            lastError: null,
          }));
        } catch (error) {
          set({ lastError: error instanceof Error ? error.message : String(error) });
        }
      },

      approveShot: (sceneId, note) => {
        const current = get();
        const scene = current.scenes.find((candidate) => candidate.id === sceneId);
        if (!scene || !hasCurrentAgentPrompt(scene, current.currentPromptSourceCommandId())) {
          set({ lastError: 'Shot onayı için önce current ajan final prompt’unu receipt ile geri al.' });
          return;
        }
        const commandId = current.currentCommandId();
        set((s) => ({
          shotApprovals: { ...s.shotApprovals, [sceneId]: { verdict: 'APPROVED', commandId, note } },
          lastError: null,
        }));
      },
      rejectShot: (sceneId, note) => {
        const commandId = get().currentCommandId();
        set((s) => ({
          shotApprovals: { ...s.shotApprovals, [sceneId]: { verdict: 'REJECTED', commandId, note } },
        }));
      },
      clearShotApproval: (sceneId) =>
        set((s) => {
          const next = { ...s.shotApprovals };
          delete next[sceneId];
          return { shotApprovals: next };
        }),

      importFrame: async (sceneId, file) => {
        // Gerçek PİKSEL kimliği: dosyanın baytları SHA-256'lanır (prompt değil). Boyut, bir
        // Image objesiyle ölçülür (tarayıcı). Frame o anki karara (commandId) ve — varsa —
        // sahnenin ajan-prompt hash'ine bağlanır.
        const current = get();
        const commandId = current.currentCommandId();
        const approval = current.shotApprovals[sceneId];
        const scene = current.scenes.find((candidate) => candidate.id === sceneId);
        if (!scene || !hasCurrentAgentPrompt(scene, current.currentPromptSourceCommandId())) {
          set({ lastError: 'Frame yüklemek için current ajan prompt receipt’i gerekli.' });
          return;
        }
        if (approval?.verdict !== 'APPROVED' || approval.commandId !== commandId) {
          set({ lastError: 'Frame yüklemek için önce current storyboard shot Mami APPROVED olmalı.' });
          return;
        }
        const buf = new Uint8Array(await file.arrayBuffer());
        const frameHash = sha256HexBytes(buf);
        const dims = await readImageDims(file).catch(() => null);
        if (!dims || dims.width <= 0 || dims.height <= 0 || buf.length <= 0) {
          set({ lastError: 'Frame okunamadı: geçerli ve boyutu ölçülebilen bir görsel dosyası yükle.' });
          return;
        }
        set((s) => ({
          scenes: s.scenes.map((sc) => {
            if (sc.id !== sceneId) return sc;
            const receipt: SceneFrameReceipt = {
              frameHash,
              fromCommandId: commandId,
              fromPromptHash: sc.promptReceipt!.promptHash,
              width: dims.width,
              height: dims.height,
              aspect: dims.height ? Math.round((dims.width / dims.height) * 1000) / 1000 : 0,
              fileName: file.name,
              byteSize: buf.length,
              verdict: 'PENDING',
            };
            return { ...sc, frameReceipt: receipt };
          }),
        }));
      },

      setFrameVerdict: (sceneId, verdict, note) => {
        const current = get();
        const commandId = current.currentCommandId();
        const approval = current.shotApprovals[sceneId];
        if (verdict === 'APPROVE') {
          const scene = current.scenes.find((candidate) => candidate.id === sceneId);
          if (!scene || !hasCurrentAgentPrompt(scene, current.currentPromptSourceCommandId())) {
            set({ lastError: 'Frame APPROVE için current ajan prompt receipt’i gerekli.' });
            return;
          }
          if (approval?.verdict !== 'APPROVED' || approval.commandId !== commandId) {
            set({ lastError: 'Frame APPROVE için current storyboard shot onayı gerekli.' });
            return;
          }
          if (!hasValidFrameEvidence(scene.frameReceipt)) {
            set({ lastError: 'Frame APPROVE için okunabilir gerçek görsel kanıtı gerekli.' });
            return;
          }
          if (scene.frameReceipt.fromCommandId !== commandId || scene.frameReceipt.fromPromptHash !== scene.promptReceipt!.promptHash) {
            set({ lastError: 'Frame eski karar veya prompt’a bağlı; current prompt için yeniden yükle.' });
            return;
          }
        }
        set((s) => ({
          scenes: s.scenes.map((sc) =>
            sc.id === sceneId && sc.frameReceipt
              ? { ...sc, frameReceipt: { ...sc.frameReceipt, verdict, note } }
              : sc,
          ),
          lastError: null,
        }));
      },

      clearFrame: (sceneId) =>
        set((s) => ({
          scenes: s.scenes.map((sc) => {
            if (sc.id !== sceneId) return sc;
            const { frameReceipt: _drop, ...rest } = sc;
            return rest as Scene;
          }),
        })),

      advance: () => {
        const s = get();
        if (s.currentStep === 'dashboard') {
          if (!s.projectTopic.trim()) {
            set({ lastError: 'Proje konusu boş. Brief adımında konu girin.' });
            return;
          }
          const srcGate = sourceReadiness(s);
          if (!srcGate.ready) {
            set({ lastError: `Kaynak hazır değil: ${srcGate.reason}` });
            return;
          }
          set({ currentStep: s.phase0PresetId ? 'director' : 'recipe', lastError: null });
        } else if (s.currentStep === 'director') {
          set({ currentStep: 'recipe', lastError: null });
        } else if (s.currentStep === 'recipe') {
          const rcp = recipeReadiness(s);
          if (!rcp.ready) {
            set({ lastError: `Reçete eksik: ${rcp.missing.join(', ')}` });
            return;
          }
          set({ currentStep: 'scenes', lastError: null });
        } else if (s.currentStep === 'scenes') {
          set({ currentStep: 'timeline', lastError: null });
        } else if (s.currentStep === 'timeline') {
          set({ currentStep: 'qa', lastError: null });
        }
      },

      reset: () => set((s) => ({ ...initial, vault: s.vault })),

      // Rebuild ONLY the storyboard from the immutable rawSource — recipe, world,
      // palette, topic and all project settings are preserved. Clears stale output.
      resetStoryboard: () => {
        const s = get();
        if (!s.rawSource) {
          set({ lastError: 'Sıfırlanacak kaynak yok.' });
          return;
        }
        const regroup = s.beatMode !== 'Manuel';
        const sourceBeats = regroup
          ? autoGroupBeats(s.rawSource, s.beatMode, s.videoModel)
          : ingestSource(s.rawSource);
        const sourceReport = sourceIntegrity(s.rawSource, sourceBeats);
        const beatAnalysis = planBeats(sourceBeats.map(b => ({ id: b.sourceId, text: b.exactText })), s.beatMode, [5, 10]);
        set({
          sourceBeats,
          beatHistory: [],
          sourceReport,
          beatAnalysis,
          beatKeeps: {},
          sceneCount: Math.max(1, sourceBeats.length || 1),
          lastError: null,
          ...STALE_GENERATION,
        });
      },

      togglePersonalMode: () => set((s) => ({ personalMode: !s.personalMode })),

      saveToVault: (name) => set((s) => {
        const entry: VaultEntry = {
          id: `vault_${Date.now().toString(36)}_${s.vault.length}`,
          name: name.trim() || s.projectTopic.trim() || 'Adsız proje',
          savedAt: Date.now(),
          snapshot: pickProjectState(s),
        };
        return { vault: [entry, ...s.vault] };
      }),
      loadFromVault: (id) => set((s) => {
        const entry = s.vault.find((e) => e.id === id);
        if (!entry) return {};
        return {
          ...initial,
          ...migratePersistedState(entry.snapshot),
          vault: s.vault,
          isGenerating: false,
          lastError: null,
        };
      }),
      deleteFromVault: (id) => set((s) => ({ vault: s.vault.filter((e) => e.id !== id) })),

      exportProjectPack: () => {
        const pack = buildProjectPack(get());
        return serializeProjectPack(pack);
      },

      exportCloseout: () => {
        const state = get();
        return JSON.stringify(buildCloseout(
          buildProjectPack(state),
          state.currentCommandId(),
          state.currentPromptSourceCommandId(),
          // BRAIN M7: kapanış tarihi çağıranın işi — core deterministik kalır.
          new Date().toISOString().slice(0, 10),
        ), null, 2);
      },

      importProjectPack: (json) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(json);
        } catch {
          set({ lastError: 'Project pack okunamadı: geçersiz JSON.' });
          return;
        }
        try {
          const check = verifyProjectPack(parsed);
          if (!check.ok) {
            set({ lastError: `Project pack doğrulanamadı: ${check.problems.join(' · ') || 'bilinmeyen biçim'}`, packEvidenceNotice: null });
            return;
          }
          if (check.legacy) {
            // V2026 (eski) proje — read-only import: eski snapshot yolunu kullan, silme yok.
            set((s) => ({
              ...initial,
              ...migratePersistedState(parsed as Record<string, unknown>),
              vault: s.vault,
              isGenerating: false,
              lastError: null,
            }));
            return;
          }
          const state = projectPackToState(parsed as ProjectPack);
          // P6 — M1 sözleşmesi: format-only (kaynağı pack'te taşınmayan) hash'ler sessizce
          // güvenilemez. verifyProjectPack bunları unverifiableEvidence ile döndürür; burada
          // görünür bir uyarıya taşıyoruz. Boşsa null (her kanıt doğrulanabilir).
          const evidenceNotice = check.unverifiableEvidence.length ? [...check.unverifiableEvidence] : null;
          set((s) => ({
            ...initial,
            ...state,
            vault: s.vault,
            isGenerating: false,
            lastError: null,
            packEvidenceNotice: evidenceNotice,
          }));
          // Pack evidence is useful only when it is reattached to the regenerated canonical
          // storyboard. Restoring decisions alone silently dropped prompt/frame receipts and made
          // the advertised round-trip a one-way trip. Generate from the restored decisions, then
          // bind each evidence record back by scene id; commandId is deterministic and therefore
          // becomes the same id once authored prompt overrides are restored.
          get().generateScenes();
          const evidenceById = new Map(((parsed as ProjectPack).scenes ?? []).map((scene) => [scene.id, scene]));
          set((current) => ({
            scenes: current.scenes.map((scene) => {
              const evidence = evidenceById.get(scene.id);
              if (!evidence) return scene;
              return {
                ...scene,
                ...(evidence.agentPrompt != null ? { userImagePrompt: evidence.agentPrompt } : {}),
                ...(evidence.promptReceipt ? { promptReceipt: evidence.promptReceipt } : {}),
                // HARD-FIX 2026-07-17 (G3, ordu KÖK-B): pack GÖRSEL BAYTINI taşımaz — yalnız
                // receipt'i (frameHash + boyut). verifyProjectPack hash'in FORMAT'ını doğrular,
                // gerçek pixel'i karşılaştıramaz (pixel yok). Bu yüzden import edilen bir
                // APPROVE frame "onaylı gerçek kare" SAYILMAZ: verdict PROJECT_ONLY_ACCEPT'e
                // düşürülür → motion kapısı otomatik AÇILMAZ (frameGate:489). Mami başka cihazda
                // gerçek görseli yeniden yükleyip APPROVE eder; o zaman gerçek bayt-hash hesaplanır.
                ...(evidence.frameReceipt
                  ? { frameReceipt: evidence.frameReceipt.verdict === 'APPROVE'
                      ? { ...evidence.frameReceipt, verdict: 'PROJECT_ONLY_ACCEPT' as const }
                      : evidence.frameReceipt }
                  : {}),
              };
            }),
          }));
        } catch (error) {
          set({ lastError: `Project pack içe alınamadı: ${error instanceof Error ? error.message : String(error)}` });
        }
      },
    };
  },
    {
      name: 'mamilas-studio-v1',
      storage: createJSONStorage(() => (typeof window === 'undefined' ? serverStorage : window.localStorage)),
      partialize: (s) => ({ ...pickProjectState(s), vault: s.vault }),
      version: 10,
      migrate: (persistedState, version) => {
        let s: any = persistedState;
        if (version < 7) {
          s = migratePersistedState(s);
        }
        // v8: heal legacy/stale engine ids (e.g. kling_2_1 → kling_3) in state and
        // every vault snapshot, so the persisted project itself shows the current engine.
        if (s && typeof s === 'object') {
          s.videoModel = normalizeVideoModel(s.videoModel);
          if (Array.isArray(s.vault)) {
            s.vault = s.vault.map((entry: any) =>
              entry && typeof entry === 'object' && entry.snapshot && typeof entry.snapshot === 'object'
                ? { ...entry, snapshot: { ...entry.snapshot, videoModel: normalizeVideoModel(entry.snapshot.videoModel) } }
                : entry,
            );
          }
        }
        // v9: heal legacy engine name embedded in scene duration.message strings.
        // durationGuard embeds videoModel directly in the message; old scenes carry
        // the stale "kling_2_1" text even after state.videoModel was healed in v8.
        const LEGACY_IN_MSG = /kling_2_1|kling_21|kling_2\b|kling\b(?!_)/g;
        const healMsg = (msg: string) =>
          typeof msg === 'string' ? msg.replace(LEGACY_IN_MSG, CURRENT_VIDEO_MODEL) : msg;
        const healScenes = (scenes: any[]) =>
          Array.isArray(scenes)
            ? scenes.map((sc: any) =>
                sc?.duration?.message
                  ? { ...sc, duration: { ...sc.duration, message: healMsg(sc.duration.message) } }
                  : sc,
              )
            : scenes;
        if (version < 9 && s && typeof s === 'object') {
          s.scenes = healScenes(s.scenes);
          if (Array.isArray(s.vault)) {
            s.vault = s.vault.map((entry: any) =>
              entry?.snapshot?.scenes
                ? { ...entry, snapshot: { ...entry.snapshot, scenes: healScenes(entry.snapshot.scenes) } }
                : entry,
            );
          }
        }
        // v10 (BRAIN M3): architecture.dominantSubject/event → exactSourceBeat +
        // semanticInterpretationStatus. Eski byte-copy alanları düşer; verbatim beat korunur.
        if (version < 10 && s && typeof s === 'object') {
          s.scenes = healArchitectureM3(s.scenes);
          if (Array.isArray(s.vault)) {
            s.vault = s.vault.map((entry: any) =>
              entry?.snapshot?.scenes
                ? { ...entry, snapshot: { ...entry.snapshot, scenes: healArchitectureM3(entry.snapshot.scenes) } }
                : entry,
            );
          }
        }
        return s;
      },
    },
  ),
);

export type StudioStore = ReturnType<typeof useStudioStore.getState>;
