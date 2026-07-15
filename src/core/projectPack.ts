import { canonicalize, canonicalHash, sha256Hex } from './contract';
import { DATA, worldPacketById } from './pure';
import { ingestSource, sourceIntegrity } from './source';
import type { StudioState, Scene, ShotApproval, PromptReceipt, SceneFrameReceipt } from '../store/useStudioStore';
import { validatedLiveDirectives, type MamiDirective } from './agentProtocol';

/**
 * TAŞINABİLİR PROJECT PACK — MACRO 6.
 *
 * Windows ↔ macOS ↔ Claude/Codex arasında proje kaybını bitirir. LocalStorage yalnız
 * kullanılabilirlik cache'idir; PACK taşınabilir GERÇEK kayıttır. Pack; kararı, seçili dünyanın
 * WorldPacket sürümünü, storyboard onaylarını ve prompt/frame receipt'lerini + bir HASH MANIFEST
 * taşır. Aynı proje → aynı byte → aynı manifest hash (deterministik, timestamp'siz).
 *
 * Site görsel/medya ÜRETMEZ; pack frame'lerin SHA-256'sını taşır (piksel kimliği), ham baytları
 * değil — hafif, deterministik ve dış araç-bağımsız. Medya dosyaları Mami'nin diskinde yaşar;
 * pack onların hash'iyle onları doğrular.
 */

export const PROJECT_PACK_SCHEMA = 'mamilas.project-pack.v1';

/** Bir sahnenin taşınabilir özeti — üretim davranışını değil, KARARI ve KANITI taşır. */
export interface PackScene {
  id: number;
  phaseName: Scene['phaseName'];
  durationSec: number;
  onScreenText: string | null;
  /** Ajanın yazdığı final prompt (varsa) — site brief'i değil. */
  agentPrompt: string | null;
  promptReceipt: PromptReceipt | null;
  frameReceipt: SceneFrameReceipt | null;
}

export interface ProjectPack {
  schema: typeof PROJECT_PACK_SCHEMA;
  /** Kararın taşınabilir kimliği (içerik hash). */
  projectId: string;
  /** Kanonik karar özeti — ne üretileceğini belirleyen seçimler. */
  decision: {
    selectedProjectId: string;
    projectTopic: string;
    projectClass: string;
    subject: string;
    location: string;
    cast: string;
    selectedWorldId: string;
    selectedPaletteId: string;
    selectedRefIds: string[];
    selectedPropId: string;
    selectedMusicId: string;
    imageModel: string;
    videoModel: string;
    brandKitLock: string;
    osTextMode: string;
    voSyncMode: string;
    directorBrief: string;
    liveMamiDirectives: MamiDirective[];
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
    directorChoices: StudioState['directorChoices'];
    workingMode: StudioState['workingMode'];
    beatMode: StudioState['beatMode'];
    beatKeeps: StudioState['beatKeeps'];
    beatAnalysis: StudioState['beatAnalysis'];
    recipeScenes: StudioState['recipeScenes'];
    sceneCount: number;
  };
  /** Ham kaynak ve beat'ler — karakter karakter. */
  source: { rawSource: string; beats: Array<{ sourceId: string; exactText: string; start: number; end: number; hash: string }> };
  /** Seçili dünyanın WorldPacket sürümü (MACRO 2) — ajanın fizik malzemesi, taşınabilir. */
  worldPacket: ReturnType<typeof worldPacketById> | null;
  /** Storyboard onayları (MACRO 4) — hangi shot, hangi karara bağlı APPROVED/REJECTED. */
  shotApprovals: Record<number, ShotApproval>;
  scenes: PackScene[];
  /** HASH MANIFEST — her taşınabilir parçanın içerik hash'i. Bozulma/eksik parça buradan görülür. */
  manifest: {
    decisionHash: string;
    sourceHash: string;
    worldPacketHash: string | null;
    approvalsHash: string;
    scenesHash: string;
    /** Tüm pack'in (manifest hariç) tek hash'i — pack kimliği. */
    packHash: string;
  };
}

function decisionOf(s: Pick<StudioState, keyof ProjectPack['decision'] | 'directorBrief'>): ProjectPack['decision'] {
  return {
    selectedProjectId: s.selectedProjectId,
    projectTopic: s.projectTopic,
    projectClass: s.projectClass,
    subject: s.subject,
    location: s.location,
    cast: s.cast,
    selectedWorldId: s.selectedWorldId,
    selectedPaletteId: s.selectedPaletteId,
    selectedRefIds: [...s.selectedRefIds],
    selectedPropId: s.selectedPropId,
    selectedMusicId: s.selectedMusicId,
    imageModel: s.imageModel,
    videoModel: s.videoModel,
    brandKitLock: s.brandKitLock,
    osTextMode: s.osTextMode,
    voSyncMode: s.voSyncMode,
    directorBrief: s.directorBrief,
    liveMamiDirectives: s.liveMamiDirectives.map((directive) => ({ ...directive })),
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
    directorChoices: { ...s.directorChoices },
    workingMode: s.workingMode,
    beatMode: s.beatMode,
    beatKeeps: { ...s.beatKeeps },
    beatAnalysis: s.beatAnalysis ? { ...s.beatAnalysis } : null,
    recipeScenes: s.recipeScenes.map((note) => ({ ...note })),
    sceneCount: s.sceneCount,
  };
}

/** Bir StudioState'i taşınabilir, deterministik ProjectPack'e paketler. */
export function buildProjectPack(s: StudioState): ProjectPack {
  const decision = decisionOf(s);
  const source = {
    rawSource: s.rawSource,
    beats: s.sourceBeats.map((b) => ({ sourceId: b.sourceId, exactText: b.exactText, start: b.start, end: b.end, hash: b.hash })),
  };
  const worldPacket = s.selectedWorldId
    ? worldPacketById(s.selectedWorldId, {
        selectedRefIds: s.selectedRefIds,
        palette: DATA.palettes.find((p) => p.id === s.selectedPaletteId),
      })
    : null;
  const shotApprovals = s.shotApprovals;
  const scenes: PackScene[] = s.scenes.map((sc) => ({
    id: sc.id,
    phaseName: sc.phaseName,
    durationSec: sc.durationSec,
    onScreenText: sc.onScreenText,
    agentPrompt: sc.userImagePrompt ?? null,
    promptReceipt: sc.promptReceipt ?? null,
    frameReceipt: sc.frameReceipt ?? null,
  }));

  const decisionHash = canonicalHash(decision);
  const sourceHash = canonicalHash(source);
  const worldPacketHash = worldPacket ? canonicalHash(worldPacket) : null;
  const approvalsHash = canonicalHash(shotApprovals);
  const scenesHash = canonicalHash(scenes);
  // packHash manifest'i İÇERMEZ (kendine referans olmaz): manifest dışı gövdenin tek hash'i.
  const packHash = canonicalHash({ decision, source, worldPacket, shotApprovals, scenes });

  return {
    schema: PROJECT_PACK_SCHEMA,
    projectId: `mamilas-${packHash}`,
    decision,
    source,
    worldPacket,
    shotApprovals,
    scenes,
    manifest: { decisionHash, sourceHash, worldPacketHash, approvalsHash, scenesHash, packHash },
  };
}

/** Pack'i JSON metnine indirger (deterministik: kanonik anahtar sırası, NFC). */
export function serializeProjectPack(pack: ProjectPack): string {
  // canonicalize deterministik; JSON.parse ile normal JSON nesnesine çeviririz (dosya okunur olsun).
  return JSON.stringify(JSON.parse(canonicalize(pack)), null, 2);
}

export interface PackVerification {
  ok: boolean;
  /** Bozuk/uyumsuz parçalar. */
  problems: string[];
  /** V2026 (legacy) pack mı — read-only import? */
  legacy: boolean;
}

/**
 * Bir pack'i doğrular: schema + manifest hash'leri gövdeyle eşleşmeli. Eski V2026 projeleri
 * `schema` taşımaz — read-only legacy import olarak işaretlenir (silinmez, korunur).
 */
export function verifyProjectPack(value: unknown): PackVerification {
  const problems: string[] = [];
  if (!value || typeof value !== 'object') return { ok: false, problems: ['Pack bir nesne değil.'], legacy: false };
  const pack = value as Partial<ProjectPack> & { schema?: string };

  // Legacy: eski V2026 snapshot/vault — schema yok ama proje alanları var.
  if (pack.schema !== PROJECT_PACK_SCHEMA) {
    const looksLegacy = pack.schema == null
      && ('selectedWorldId' in (value as object) || 'projectTopic' in (value as object));
    return { ok: looksLegacy, problems: looksLegacy ? [] : ['Bilinmeyen pack biçimi.'], legacy: looksLegacy };
  }

  const isRecord = (candidate: unknown): candidate is Record<string, unknown> =>
    Boolean(candidate && typeof candidate === 'object' && !Array.isArray(candidate));
  if (!isRecord(pack.decision)) problems.push('Decision nesnesi yok veya geçersiz.');
  if (!isRecord(pack.source) || typeof pack.source.rawSource !== 'string' || !Array.isArray(pack.source.beats)) {
    problems.push('Source alanı yok veya geçersiz.');
  }
  if (!isRecord(pack.shotApprovals)) problems.push('Shot approvals nesnesi yok veya geçersiz.');
  if (!Array.isArray(pack.scenes)) problems.push('Scenes dizisi yok veya geçersiz.');
  if (!isRecord(pack.manifest)) problems.push('Manifest yok veya geçersiz.');
  if (problems.length) return { ok: false, problems, legacy: false };

  const decision = pack.decision as ProjectPack['decision'];
  const source = pack.source as ProjectPack['source'];
  const scenes = pack.scenes as ProjectPack['scenes'];
  const approvals = pack.shotApprovals as Record<number, ShotApproval>;
  if (typeof decision.selectedWorldId !== 'string' || typeof decision.projectTopic !== 'string'
      || !Array.isArray(decision.selectedRefIds)
      || (decision.liveMamiDirectives != null && !Array.isArray(decision.liveMamiDirectives))
      || (decision.recipeScenes != null && !Array.isArray(decision.recipeScenes))) {
    problems.push('Decision zorunlu alanları geçersiz.');
  }
  if (!source.beats.every((beat) => beat && typeof beat.sourceId === 'string' && typeof beat.exactText === 'string'
      && (beat.start == null || Number.isInteger(beat.start))
      && (beat.end == null || Number.isInteger(beat.end))
      && typeof beat.hash === 'string')) {
    problems.push('Source beat shape geçersiz.');
  }
  if (!scenes.every((scene) => scene && Number.isInteger(scene.id) && scene.id > 0
      && (scene.agentPrompt == null || typeof scene.agentPrompt === 'string')
      && (scene.promptReceipt == null || typeof scene.promptReceipt === 'object')
      && (scene.frameReceipt == null || typeof scene.frameReceipt === 'object'))) {
    problems.push('Scene evidence shape geçersiz.');
  }
  if (!Object.entries(approvals).every(([sceneId, approval]) => Number.isInteger(Number(sceneId))
      && Number(sceneId) > 0
      && approval
      && (approval.verdict === 'APPROVED' || approval.verdict === 'REJECTED')
      && typeof approval.commandId === 'string')) {
    problems.push('Shot approval shape geçersiz.');
  }
  try {
    validatedLiveDirectives(decision.liveMamiDirectives ?? [], scenes.map((scene) => scene.id));
  } catch (error) {
    problems.push(`LIVE_CHAT directives geçersiz: ${error instanceof Error ? error.message : String(error)}`);
  }
  for (const scene of scenes) {
    if (scene.promptReceipt) {
      if (scene.agentPrompt !== scene.promptReceipt.finalPrompt
          || scene.promptReceipt.promptHash !== sha256Hex(scene.promptReceipt.finalPrompt)
          || !/^[0-9a-f]{64}$/.test(scene.promptReceipt.artifactHash ?? '')
          || !/^[0-9a-f]{64}$/.test(scene.promptReceipt.juryArtifactHash ?? '')
          || !/^[0-9a-f]{64}$/.test(scene.promptReceipt.protocolHash ?? '')
          || !/^[0-9a-f]{64}$/.test(scene.promptReceipt.storyboardHash ?? '')
          || !Array.isArray(scene.promptReceipt.artifactBundleHashes)
          || !scene.promptReceipt.artifactBundleHashes.includes(scene.promptReceipt.artifactHash ?? '')
          || !scene.promptReceipt.artifactBundleHashes.includes(scene.promptReceipt.juryArtifactHash ?? '')
          || !Array.isArray(scene.promptReceipt.inputArtifactHashes)
          || !['claude', 'codex'].includes(scene.promptReceipt.provider ?? '')) {
        problems.push(`Scene ${scene.id} prompt receipt uyuşmuyor.`);
      }
    } else if (scene.agentPrompt != null) {
      problems.push(`Scene ${scene.id} ajan prompt receipt’i yok.`);
    }
    if (scene.frameReceipt) {
      if (!/^[0-9a-f]{64}$/.test(scene.frameReceipt.frameHash)
          || scene.frameReceipt.width <= 0
          || scene.frameReceipt.height <= 0
          || scene.frameReceipt.byteSize <= 0) {
        problems.push(`Scene ${scene.id} gerçek frame kanıtı geçersiz.`);
      }
      if (!scene.promptReceipt || scene.frameReceipt.fromPromptHash !== scene.promptReceipt.promptHash) {
        problems.push(`Scene ${scene.id} frame/prompt zinciri uyuşmuyor.`);
      }
      const approval = approvals[scene.id];
      if (!approval || scene.frameReceipt.fromCommandId !== approval.commandId) {
        problems.push(`Scene ${scene.id} frame/approval karar zinciri uyuşmuyor.`);
      }
    }
  }

  const m = pack.manifest;
  if (!m) return { ok: false, problems: ['Manifest yok.'], legacy: false };
  if (typeof m.decisionHash !== 'string' || typeof m.sourceHash !== 'string'
      || typeof m.approvalsHash !== 'string' || typeof m.scenesHash !== 'string'
      || typeof m.packHash !== 'string') {
    problems.push('Manifest hash alanları geçersiz.');
  }
  if (canonicalHash(pack.decision) !== m.decisionHash) problems.push('decisionHash uyuşmuyor.');
  if (canonicalHash(pack.source) !== m.sourceHash) problems.push('sourceHash uyuşmuyor.');
  const worldPacketHash = pack.worldPacket ? canonicalHash(pack.worldPacket) : null;
  if (worldPacketHash !== m.worldPacketHash) problems.push('worldPacketHash uyuşmuyor.');
  if (canonicalHash(pack.shotApprovals) !== m.approvalsHash) problems.push('approvalsHash uyuşmuyor.');
  if (canonicalHash(pack.scenes) !== m.scenesHash) problems.push('scenesHash uyuşmuyor.');
  const recomputed = canonicalHash({
    decision: pack.decision, source: pack.source, worldPacket: pack.worldPacket,
    shotApprovals: pack.shotApprovals, scenes: pack.scenes,
  });
  if (recomputed !== m.packHash) problems.push('packHash uyuşmuyor (pack bozulmuş).');
  if (pack.projectId !== `mamilas-${m.packHash}`) problems.push('projectId packHash ile uyuşmuyor.');
  if (pack.worldPacket && pack.worldPacket.id !== decision.selectedWorldId) problems.push('WorldPacket seçili dünya ile uyuşmuyor.');

  return { ok: problems.length === 0, problems, legacy: false };
}

/**
 * Doğrulanmış bir pack'i, store'a yüklenebilir `Partial<StudioState>`'e çevirir. Üretim
 * davranışını (scenes' imagePrompt/handoff) YENİDEN ÜRETMEZ — kararı geri yükler; sahneler
 * `generateScenes` ile yeniden derlenir, ajan-prompt/frame receipt'leri geri bağlanır.
 */
export function projectPackToState(pack: ProjectPack): Partial<StudioState> {
  // Early v1 packs did not yet carry source spans or the complete decision surface. Keep
  // them importable without inventing values: rebuild spans from the exact raw source and
  // use neutral store defaults only for fields that did not exist in that v1 writer.
  const packedBeats = pack.source?.beats ?? [];
  const hasSpans = packedBeats.every((beat) => Number.isInteger(beat.start) && Number.isInteger(beat.end));
  const beats = hasSpans
    ? packedBeats.map((beat) => ({ ...beat }))
    : ingestSource(pack.source?.rawSource ?? '');
  const decision = pack.decision as ProjectPack['decision'] & Partial<ProjectPack['decision']>;
  return {
    selectedProjectId: decision.selectedProjectId ?? '',
    projectTopic: decision.projectTopic ?? '',
    projectClass: decision.projectClass ?? '',
    subject: decision.subject ?? '',
    location: decision.location ?? '',
    cast: (decision.cast ?? '') as StudioState['cast'],
    selectedWorldId: decision.selectedWorldId ?? '',
    selectedPaletteId: decision.selectedPaletteId ?? '',
    selectedRefIds: [...(decision.selectedRefIds ?? [])],
    selectedPropId: decision.selectedPropId ?? '',
    selectedMusicId: decision.selectedMusicId ?? '',
    imageModel: decision.imageModel ?? '',
    videoModel: decision.videoModel ?? '',
    brandKitLock: decision.brandKitLock ?? '',
    osTextMode: (decision.osTextMode ?? 'AUTO') as StudioState['osTextMode'],
    voSyncMode: (decision.voSyncMode ?? 'FREE') as StudioState['voSyncMode'],
    directorBrief: decision.directorBrief ?? '',
    liveMamiDirectives: (decision.liveMamiDirectives ?? []).map((directive) => ({ ...directive })),
    mood: decision.mood ?? '',
    cameraEnergy: decision.cameraEnergy ?? '',
    timeLight: decision.timeLight ?? '',
    transition: decision.transition ?? '',
    musicVibe: decision.musicVibe ?? '',
    pov: decision.pov ?? '',
    signature: decision.signature ?? '',
    leitmotif: decision.leitmotif ?? '',
    tempoCurve: decision.tempoCurve ?? '',
    phase0PresetId: decision.phase0PresetId ?? '',
    directorChoices: { ...(decision.directorChoices ?? {}) },
    workingMode: decision.workingMode ?? 'guided',
    beatMode: decision.beatMode ?? 'Dengeli',
    beatKeeps: { ...(decision.beatKeeps ?? {}) },
    beatAnalysis: decision.beatAnalysis ?? null,
    recipeScenes: (decision.recipeScenes ?? []).map((note) => ({ ...note })),
    sceneCount: decision.sceneCount ?? Math.max(1, beats.length),
    rawSource: pack.source?.rawSource ?? '',
    sourceBeats: beats,
    sourceReport: pack.source?.rawSource ? sourceIntegrity(pack.source.rawSource, beats) : null,
    shotApprovals: { ...(pack.shotApprovals ?? {}) },
    currentStep: 'timeline',
  };
}

// ============================================================
// CLOSEOUT — MACRO 7
//
// Kapanmış projenin okunabilir kanıt zinciri: "hangi Mami kararı → hangi prompt → hangi frame".
// Ayrıca reddedilen frame'leri, Mami yorumlarını ve AÇIK RİSKLERİ saklar. Dersler `OBSERVATION`
// olarak doğar — hiçbiri OTOMATİK global ders olmaz; yalnız Mami `PROMOTED` derse ortak hafızaya
// geçer (bu builder sadece OBSERVATION üretir; promote Mami'nin ayrı eylemidir).
// ============================================================

// Studio evidence closeout is intentionally distinct from contract.ts's final delivery
// `mamilas.closeout.v1`; two incompatible shapes must never claim the same schema id.
export const CLOSEOUT_SCHEMA = 'mamilas.studio-closeout.v1';

export interface CloseoutChainLink {
  sceneId: number;
  /** Mami bu shot'ı onayladı mı (karar kimliğiyle). */
  shotApproval: ShotApproval | null;
  /** Ajanın yazdığı final prompt'un makbuzu (varsa). */
  promptReceipt: PromptReceipt | null;
  /** Yüklenen frame'in makbuzu + Mami verdict'i (varsa). */
  frameReceipt: SceneFrameReceipt | null;
  /** Bu shot için Mami hükmü özeti: APPROVED_FRAME / REGENERATE / PROJECT_ONLY / NO_FRAME / PENDING. */
  status: 'APPROVED_FRAME' | 'STALE_EVIDENCE' | 'REGENERATE' | 'PROJECT_ONLY' | 'NO_FRAME' | 'PENDING';
}

export interface Closeout {
  schema: typeof CLOSEOUT_SCHEMA;
  projectId: string;
  /** Kapanış anındaki pack manifest hash'i — kanıt zinciri hangi karara ait. */
  packHash: string;
  /** Sahne başına karar→prompt→frame zinciri. */
  chain: CloseoutChainLink[];
  /** Kaç shot onaylı frame'e ulaştı / kaç shot reddedilen frame taşıdı. */
  summary: { totalScenes: number; approvedFrames: number; staleEvidence: number; regenerated: number; noFrame: number };
  /** Açık riskler — otomatik ders DEĞİL, Mami'nin görmesi gereken kanıtlanmamış/eksik şeyler. */
  openRisks: string[];
  /** Dersler OBSERVATION olarak başlar. `promoted: false` → ortak hafızaya GEÇMEZ (Mami kararı). */
  observations: Array<{ note: string; promoted: false }>;
}

/** Kapanmış projenin closeout kanıt zincirini kurar. Otomatik ders üretmez (hepsi OBSERVATION). */
export function buildCloseout(pack: ProjectPack, currentCommandId: string, currentPromptSourceId: string): Closeout {
  const chain: CloseoutChainLink[] = pack.scenes.map((sc) => {
    const fr = sc.frameReceipt;
    const approval = pack.shotApprovals[sc.id] ?? null;
    const promptCurrent = Boolean(
      sc.agentPrompt
      && sc.promptReceipt
      && sc.promptReceipt.finalPrompt === sc.agentPrompt
      && sc.promptReceipt.promptHash === sha256Hex(sc.agentPrompt)
      && sc.promptReceipt.fromCommandId === currentPromptSourceId,
    );
    const frameCurrent = Boolean(
      fr
      && /^[0-9a-f]{64}$/.test(fr.frameHash)
      && fr.width > 0
      && fr.height > 0
      && fr.byteSize > 0
      && fr.fromCommandId === currentCommandId
      && fr.fromPromptHash === sc.promptReceipt?.promptHash
      && approval?.verdict === 'APPROVED'
      && approval.commandId === currentCommandId
      && promptCurrent,
    );
    const status: CloseoutChainLink['status'] = !fr
      ? 'NO_FRAME'
      : fr.verdict === 'APPROVE'
        ? frameCurrent ? 'APPROVED_FRAME' : 'STALE_EVIDENCE'
        : fr.verdict === 'REGENERATE'
          ? 'REGENERATE'
          : fr.verdict === 'PROJECT_ONLY_ACCEPT'
            ? 'PROJECT_ONLY'
            : 'PENDING';
    return {
      sceneId: sc.id,
      shotApproval: approval,
      promptReceipt: sc.promptReceipt,
      frameReceipt: fr,
      status,
    };
  });

  const summary = {
    totalScenes: chain.length,
    approvedFrames: chain.filter((c) => c.status === 'APPROVED_FRAME').length,
    staleEvidence: chain.filter((c) => c.status === 'STALE_EVIDENCE').length,
    regenerated: chain.filter((c) => c.status === 'REGENERATE').length,
    noFrame: chain.filter((c) => c.status === 'NO_FRAME').length,
  };

  const openRisks: string[] = [];
  if (summary.noFrame > 0) openRisks.push(`${summary.noFrame} shot henüz gerçek frame taşımıyor — görsel kalite kanıtlanmadı.`);
  if (summary.regenerated > 0) openRisks.push(`${summary.regenerated} shot REGENERATE aldı — kabul edilen bir frame yok.`);
  if (summary.staleEvidence > 0) openRisks.push(`${summary.staleEvidence} shot stale karar/prompt/frame zinciri taşıyor — onaylı sayılamaz.`);
  const unapproved = chain.filter((c) => c.shotApproval?.verdict !== 'APPROVED').length;
  if (unapproved > 0) openRisks.push(`${unapproved} shot Mami tarafından onaylanmadı.`);

  // Dersler OBSERVATION — hiçbiri otomatik promote edilmez.
  const observations: Closeout['observations'] = [
    { note: `Karar ${pack.projectId} kapandı: ${summary.approvedFrames}/${summary.totalScenes} onaylı frame.`, promoted: false },
  ];

  return {
    schema: CLOSEOUT_SCHEMA,
    projectId: pack.projectId,
    packHash: pack.manifest.packHash,
    chain,
    summary,
    openRisks,
    observations,
  };
}
