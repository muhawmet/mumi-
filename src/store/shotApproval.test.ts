import { describe, expect, test, beforeEach } from 'vitest';
import { useStudioStore, productionReadiness, promptSourceCommand } from './useStudioStore';
import type { Scene } from './useStudioStore';
import { sha256Hex } from '../core/contract';
import { createAgentArtifact, liveDirectiveId } from '../core/agentProtocol';

/**
 * MACRO 4 — Manuel Storyboard Studio: shot approval (brief-hash bağlı) + TEK canonical readiness.
 *
 * Kabul: Mami her shot'ı onaylar; onay karara (commandId) bağlanır; kararlar değişince onay
 * STALE olur; tek readiness fonksiyonu üretimin gerçekten hazır olup olmadığını söyler. Ajan
 * Mami adına onaylamaz.
 */

function fakeScene(id: number): Scene {
  const finalPrompt = `agent final prompt ${id}`;
  return {
    id,
    architecture: {} as never,
    imagePrompt: `scene ${id} brief`,
    motionPrompt: '',
    voiceOver: '',
    sunoBrief: '',
    durationSec: 5,
    duration: {} as never,
    intensity: 50,
    phaseName: 'Intro',
    handoff: { IMAGE: { draft: {} }, MOTION: {}, SUNO: {} } as never,
    onScreenText: null,
    userImagePrompt: finalPrompt,
    promptReceipt: {
      finalPrompt,
      fromCommandId: 'mamilas-source',
      promptHash: sha256Hex(finalPrompt),
      source: 'paste',
      artifactHash: 'a'.repeat(64), juryArtifactHash: 'b'.repeat(64),
      artifactBundleHashes: ['a'.repeat(64), 'b'.repeat(64)], protocolHash: 'c'.repeat(64),
      provider: 'codex', storyboardHash: 'd'.repeat(64), inputArtifactHashes: ['e'.repeat(64)], revision: 0,
    },
  };
}

function imageBundle(sceneId: number, prompt: string): string {
  const command = promptSourceCommand(useStudioStore.getState());
  return imageBundleForCommand(command, sceneId, prompt, false);
}

function imageBundleForCommand(
  command: ReturnType<typeof promptSourceCommand>,
  sceneId: number,
  prompt: string,
  includeCommand = true,
): string {
  const contextHash = command.lifecycle.sceneContextHashes[sceneId];
  const directiveReceipts = command.lifecycle.mamiDirectives
    .filter((directive) => directive.scope === 'PROJECT' || directive.sceneId === sceneId)
    .map((directive) => ({ id: directive.id, text: directive.text, status: 'APPLIED' as const }));
  const author = createAgentArtifact({
    phase: 'IMAGE_PROMPT', role: 'image_author', provider: 'codex', sceneId,
    decisionHash: command.commandId.replace(/^mamilas-/, ''), storyboardHash: command.lifecycle.storyboardHash,
    inputArtifactHashes: [contextHash], revision: 0,
    content: {
      prompt, promptHash: sha256Hex(prompt),
      // BRAIN M3: zorunlu şeffaf yorum receipt'i.
      interpretation: { dominantSubject: 'test subject', singleEvent: 'test event', frozenInstant: 'test instant' },
      directiveReceipts, appliedLocks: ['world'], suppressedContext: [], risks: [],
    },
  });
  const jury = createAgentArtifact({
    phase: 'IMAGE_JURY', role: 'image_jury', provider: 'codex', sceneId,
    decisionHash: command.commandId.replace(/^mamilas-/, ''), storyboardHash: command.lifecycle.storyboardHash,
    inputArtifactHashes: [contextHash, author.contentHash], revision: 0,
    content: { verdict: 'PASS' as const, evidence: ['prompt current shot ile karşı-okundu'] },
  });
  return JSON.stringify(includeCommand ? { schema: 'mamilas.image-artifact-bundle.v1', command, artifacts: [author, jury] } : [author, jury]);
}

function setBoundScenes(scenes: Scene[]): void {
  useStudioStore.getState().setScenes(scenes);
  const sourceId = useStudioStore.getState().currentPromptSourceCommandId();
  useStudioStore.setState({
    scenes: useStudioStore.getState().scenes.map((scene) => scene.promptReceipt ? {
      ...scene,
      promptReceipt: { ...scene.promptReceipt, fromCommandId: sourceId },
    } : scene),
  });
}

beforeEach(() => {
  useStudioStore.getState().reset();
});

describe('shot approval — Mami onayı karara (commandId) bağlanır', () => {
  test('approveShot APPROVED + güncel commandId yazar', () => {
    const store = useStudioStore.getState();
    setBoundScenes([fakeScene(1), fakeScene(2)]);
    const cid = useStudioStore.getState().currentCommandId();
    useStudioStore.getState().approveShot(1, 'iyi kare');

    const a = useStudioStore.getState().shotApprovals[1];
    expect(a.verdict).toBe('APPROVED');
    expect(a.commandId).toBe(cid);
    expect(a.note).toBe('iyi kare');
  });

  test('rejectShot REJECTED yazar; clearShotApproval siler', () => {
    setBoundScenes([fakeScene(1)]);
    useStudioStore.getState().rejectShot(1);
    expect(useStudioStore.getState().shotApprovals[1].verdict).toBe('REJECTED');
    useStudioStore.getState().clearShotApproval(1);
    expect(useStudioStore.getState().shotApprovals[1]).toBeUndefined();
  });

  test('ajan prompt receipt’i olmadan approveShot store katmanında reddedilir', () => {
    const scene = fakeScene(1);
    delete scene.userImagePrompt;
    delete scene.promptReceipt;
    setBoundScenes([scene]);

    useStudioStore.getState().approveShot(1);

    expect(useStudioStore.getState().shotApprovals[1]).toBeUndefined();
    expect(useStudioStore.getState().lastError).toMatch(/ajan final prompt/);
  });

  test('düz prompt veya tampered artifact bundle import edilmez; hash-valid author→jury bundle edilir', () => {
    const scene = fakeScene(1);
    delete scene.userImagePrompt;
    delete scene.promptReceipt;
    setBoundScenes([scene]);

    useStudioStore.getState().importAgentArtifact(1, 'plain engine prompt');
    expect(useStudioStore.getState().scenes[0].promptReceipt).toBeUndefined();
    expect(useStudioStore.getState().lastError).toMatch(/JSON|artifact/i);

    const valid = imageBundle(1, 'sealed engine prompt');
    const tampered = JSON.parse(valid);
    tampered[0].content.prompt = 'tampered engine prompt';
    useStudioStore.getState().importAgentArtifact(1, JSON.stringify(tampered));
    expect(useStudioStore.getState().scenes[0].promptReceipt).toBeUndefined();
    expect(useStudioStore.getState().lastError).toMatch(/contentHash tampered|prompt\/hash/);

    useStudioStore.getState().importAgentArtifact(1, valid);
    const receipt = useStudioStore.getState().scenes[0].promptReceipt;
    expect(receipt?.finalPrompt).toBe('sealed engine prompt');
    expect(receipt?.artifactHash).toMatch(/^[0-9a-f]{64}$/);
    expect(receipt?.juryArtifactHash).toMatch(/^[0-9a-f]{64}$/);
  });

  test('LIVE_CHAT ile türetilen canonical command bundle Studio state’ine exact geri alınır', () => {
    const scene = fakeScene(1);
    delete scene.userImagePrompt;
    delete scene.promptReceipt;
    setBoundScenes([scene]);
    const identity = {
      source: 'LIVE_CHAT' as const,
      scope: 'SCENE' as const,
      sceneId: 1,
      text: '  Başlık yalnız bu sahnede aynen kalsın.\n',
    };
    const directive = { id: liveDirectiveId(identity), ...identity };
    const derived = promptSourceCommand({ ...useStudioStore.getState(), liveMamiDirectives: [directive] });
    const baseId = useStudioStore.getState().currentPromptSourceCommandId();
    expect(derived.commandId).not.toBe(baseId);

    useStudioStore.getState().importAgentArtifact(1, imageBundleForCommand(derived, 1, 'live directive prompt'));
    const current = useStudioStore.getState();
    expect(current.lastError).toBeNull();
    expect(current.liveMamiDirectives).toEqual([directive]);
    expect(current.currentPromptSourceCommandId()).toBe(derived.commandId);
    expect(current.scenes[0].promptReceipt?.fromCommandId).toBe(derived.commandId);
    expect(productionReadiness(current, current.currentCommandId(), current.currentPromptSourceCommandId()).stage).not.toBe('prompt');

    const tampered = JSON.parse(imageBundleForCommand(derived, 1, 'live directive prompt'));
    tampered.command.lifecycle.mamiDirectives.at(-1).text += ' TAMPER';
    useStudioStore.getState().importAgentArtifact(1, JSON.stringify(tampered));
    expect(useStudioStore.getState().lastError).toMatch(/id stale|canonical eşi|MamiDirectives/i);
  });

  test('karar değişince eski prompt receipt yeniden import edilmeden onaylanamaz', () => {
    const store = useStudioStore.getState();
    store.setField('selectedWorldId', 'deakins_naturalist');
    store.setField('selectedPaletteId', 'native_world');
    store.setField('subject', 'Termos');
    store.setField('recipeScenes', [{ id: 1 } as never]);
    setBoundScenes([fakeScene(1)]);
    const originalSourceId = useStudioStore.getState().currentPromptSourceCommandId();

    // Persist/restore sırasında storyboard korunmuş ama karar değişmiş olabilecek durumu simüle et.
    useStudioStore.setState({ directorBrief: 'Yeni yönetmen kararı' });
    const changedSourceId = useStudioStore.getState().currentPromptSourceCommandId();
    expect(changedSourceId).not.toBe(originalSourceId);
    expect(productionReadiness(
      useStudioStore.getState(),
      useStudioStore.getState().currentCommandId(),
      changedSourceId,
    ).stage).toBe('prompt');

    useStudioStore.getState().approveShot(1);
    expect(useStudioStore.getState().shotApprovals[1]).toBeUndefined();
    expect(useStudioStore.getState().lastError).toMatch(/ajan final prompt/);

    useStudioStore.getState().importAgentArtifact(1, imageBundle(1, 'agent final prompt 1'));
    expect(useStudioStore.getState().scenes[0].promptReceipt?.fromCommandId).toBe(changedSourceId);
    useStudioStore.getState().approveShot(1);
    expect(useStudioStore.getState().shotApprovals[1]?.verdict).toBe('APPROVED');
  });

  test('karar-etkileyen field storyboard\'u ve onayları temizler (world değişimi)', () => {
    setBoundScenes([fakeScene(1)]);
    useStudioStore.getState().approveShot(1);
    expect(useStudioStore.getState().shotApprovals[1]).toBeDefined();

    // Kararı değiştir (world) → STALE_GENERATION: storyboard + onaylar temizlenir.
    useStudioStore.getState().setField('selectedWorldId', 'deakins_naturalist');
    expect(useStudioStore.getState().scenes).toHaveLength(0);
    expect(useStudioStore.getState().shotApprovals[1]).toBeUndefined();
  });

  test('import/persist güvenlik ağı: onay eski commandId taşıyorsa readiness STALE sayar', () => {
    const store = useStudioStore.getState();
    store.setField('selectedWorldId', 'deakins_naturalist');
    store.setField('selectedPaletteId', 'native_world');
    store.setField('subject', 'Termos');
    store.setField('recipeScenes', [{ id: 1 } as never]);
    setBoundScenes([fakeScene(1)]);
    // Yeniden yüklenmiş bir projeyi simüle et: onay farklı (eski) bir commandId taşıyor.
    useStudioStore.setState({ shotApprovals: { 1: { verdict: 'APPROVED', commandId: 'mamilas-OLD' } } });

    const cid = useStudioStore.getState().currentCommandId();
    expect(cid).not.toBe('mamilas-OLD');
    const r = productionReadiness(useStudioStore.getState(), cid, useStudioStore.getState().currentPromptSourceCommandId());
    expect(r.staleShotIds).toContain(1);
    expect(r.ready).toBe(false);
  });
});

describe('TEK canonical readiness — üretim tüm shot onaylanmadan hazır DEĞİL', () => {
  test('reçete eksikken stage=recipe; reçete tamam ama storyboard yoksa stage=storyboard', () => {
    const cid0 = useStudioStore.getState().currentCommandId();
    const r0 = productionReadiness(useStudioStore.getState(), cid0, useStudioStore.getState().currentPromptSourceCommandId());
    expect(r0.ready).toBe(false);
    expect(r0.stage).toBe('recipe'); // reset sonrası reçete boş

    const store = useStudioStore.getState();
    store.setField('selectedWorldId', 'deakins_naturalist');
    store.setField('selectedPaletteId', 'native_world');
    store.setField('subject', 'Termos');
    store.setField('recipeScenes', [{ id: 1 } as never]);
    const cid = useStudioStore.getState().currentCommandId();
    const r = productionReadiness(useStudioStore.getState(), cid, useStudioStore.getState().currentPromptSourceCommandId());
    expect(r.ready).toBe(false);
    expect(r.stage).toBe('storyboard'); // reçete tamam, sahne yok
  });

  test('storyboard var ama shot onaysız → stage=approval, pending dolu', () => {
    // recipe/source hazır varsay: readiness kaynak boşken source-ready sayar (rawSource '').
    const store = useStudioStore.getState();
    store.setField('selectedWorldId', 'deakins_naturalist');
    store.setField('selectedPaletteId', 'native_world');
    store.setField('subject', 'Termos');
    store.setField('recipeScenes', [{ id: 1 } as never]);
    setBoundScenes([fakeScene(1), fakeScene(2)]);

    const cid = useStudioStore.getState().currentCommandId();
    const r = productionReadiness(useStudioStore.getState(), cid, useStudioStore.getState().currentPromptSourceCommandId());
    expect(r.stage).toBe('approval');
    expect(r.pendingShotIds).toEqual([1, 2]);
    expect(r.ready).toBe(false);
  });

  test('storyboard site scaffold’ı taşısa da ajan prompt receipt’i yoksa stage=prompt', () => {
    const store = useStudioStore.getState();
    store.setField('selectedWorldId', 'deakins_naturalist');
    store.setField('selectedPaletteId', 'native_world');
    store.setField('subject', 'Termos');
    store.setField('recipeScenes', [{ id: 1 } as never]);
    const scene = fakeScene(1);
    delete scene.userImagePrompt;
    delete scene.promptReceipt;
    setBoundScenes([scene]);

    const r = productionReadiness(
      useStudioStore.getState(),
      useStudioStore.getState().currentCommandId(),
      useStudioStore.getState().currentPromptSourceCommandId(),
    );
    expect(r.stage).toBe('prompt');
    expect(r.promptMissingShotIds).toEqual([1]);
    expect(r.ready).toBe(false);
  });

  test('tüm shot güncel karara APPROVED → ready', () => {
    const store = useStudioStore.getState();
    store.setField('selectedWorldId', 'deakins_naturalist');
    store.setField('selectedPaletteId', 'native_world');
    store.setField('subject', 'Termos');
    store.setField('recipeScenes', [{ id: 1 } as never]);
    setBoundScenes([fakeScene(1), fakeScene(2)]);
    useStudioStore.getState().approveShot(1);
    useStudioStore.getState().approveShot(2);

    const cid = useStudioStore.getState().currentCommandId();
    const r = productionReadiness(useStudioStore.getState(), cid, useStudioStore.getState().currentPromptSourceCommandId());
    expect(r.ready).toBe(true);
    expect(r.stage).toBe('ready');
    expect(r.approvedShotIds).toEqual([1, 2]);
  });

  test('storyboard yeniden üretilince (setScenes STALE_GENERATION değil, ama generateScenes) onaylar korunur; blocker varsa stage=blockers', () => {
    const store = useStudioStore.getState();
    store.setField('selectedWorldId', 'deakins_naturalist');
    store.setField('selectedPaletteId', 'native_world');
    store.setField('subject', 'Termos');
    store.setField('recipeScenes', [{ id: 1 } as never]);
    setBoundScenes([fakeScene(1)]);
    // Sahte blocker enjekte et.
    useStudioStore.setState({ blockers: [{ scope: 'shot', code: 'IDENTITY_UNRESOLVED', field: 'cast', reason: 'x', requiredEvidence: 'y', allowedResolutions: [], blocks: [1] }] as never });

    const cid = useStudioStore.getState().currentCommandId();
    const r = productionReadiness(useStudioStore.getState(), cid, useStudioStore.getState().currentPromptSourceCommandId());
    expect(r.stage).toBe('blockers');
    expect(r.ready).toBe(false);
  });
});
