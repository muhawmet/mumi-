import { describe, expect, test, beforeEach } from 'vitest';
import { useStudioStore, motionGate } from '../store/useStudioStore';
import type { Scene, SceneFrameReceipt } from '../store/useStudioStore';
import { buildProjectPack, serializeProjectPack, verifyProjectPack, projectPackToState, buildCloseout, PROJECT_PACK_SCHEMA, CLOSEOUT_SCHEMA } from './projectPack';
import { DATA, worldPacketById } from './pure';
import { canonicalHash, sha256Hex } from './contract';

/**
 * MACRO 6 — Taşınabilir project pack.
 *
 * Kabul: bir proje export edilip import edildiğinde aynı seçili world, approval, frame hash ve
 * motion kapısı görülür. Pack deterministik (timestamp'siz) ve hash-manifest'le doğrulanabilir.
 */

function fakeScene(id: number, frameReceipt?: SceneFrameReceipt, agentPrompt?: string): Scene {
  const promptHash = agentPrompt ? sha256Hex(agentPrompt) : undefined;
  return {
    id, architecture: {} as never, imagePrompt: `scene ${id}`, motionPrompt: '',
    voiceOver: '', sunoBrief: '', durationSec: 5, duration: {} as never, intensity: 50,
    phaseName: 'Intro', handoff: { IMAGE: { draft: {} }, MOTION: {}, SUNO: {} } as never,
    onScreenText: null,
    userImagePrompt: agentPrompt,
    promptReceipt: agentPrompt ? { finalPrompt: agentPrompt, fromCommandId: 'x', promptHash: promptHash!, source: 'paste' } : undefined,
    frameReceipt,
  };
}

function setupProject() {
  const store = useStudioStore.getState();
  store.reset();
  store.setField('projectTopic', 'Termos filmi');
  store.setField('subject', 'Mat siyah termos');
  store.setField('selectedWorldId', 'product_brand_real');
  store.setField('selectedPaletteId', 'pastel_soft');
  store.setField('sceneCount', 2);
  store.setField('directorBrief', 'Ürün yazısını sen yerleştir.');
  store.setField('phase0PresetId', 'product_brand');
  store.setField('directorChoices', { camera: 'measured', light: 'warm' });
  store.setField('beatKeeps', { 'src-001': true });
  store.setField('beatAnalysis', { verdict: 'PASS', notes: ['keep'] } as never);
  // Authored prompt is part of the canonical decision. Bind the frame only after that
  // override exists, otherwise the fixture itself manufactures a stale frame receipt.
  store.setScenes([fakeScene(1, undefined, 'agent final prompt'), fakeScene(2)]);
  const promptSourceId = useStudioStore.getState().currentPromptSourceCommandId();
  useStudioStore.setState({
    scenes: useStudioStore.getState().scenes.map((scene) => scene.promptReceipt ? {
      ...scene,
      promptReceipt: { ...scene.promptReceipt, fromCommandId: promptSourceId },
    } : scene),
  });
  const frame: SceneFrameReceipt = {
    frameHash: sha256Hex('project frame bytes'), fromCommandId: useStudioStore.getState().currentCommandId(),
    fromPromptHash: sha256Hex('agent final prompt'), width: 1920, height: 1080, aspect: 1.778,
    fileName: 'shot1.png', byteSize: 500, verdict: 'APPROVE',
  };
  useStudioStore.setState({
    scenes: useStudioStore.getState().scenes.map((scene) => scene.id === 1 ? { ...scene, frameReceipt: frame } : scene),
  });
  useStudioStore.getState().approveShot(1);
}

beforeEach(() => useStudioStore.getState().reset());

describe('buildProjectPack — deterministik, hash-manifest taşır', () => {
  test('pack schema + world packet + approval + frame receipt + manifest taşır', () => {
    setupProject();
    const pack = buildProjectPack(useStudioStore.getState());

    expect(pack.schema).toBe(PROJECT_PACK_SCHEMA);
    expect(pack.decision.selectedWorldId).toBe('product_brand_real');
    expect(pack.worldPacket?.id).toBe('product_brand_real');
    expect(pack.worldPacket?.legacyRenderLaw.length).toBeGreaterThan(20); // render_law korunur
    expect(pack.worldPacket?.paletteAsLight).toBe(
      worldPacketById('product_brand_real', {
        palette: DATA.palettes.find((p) => p.id === 'pastel_soft'),
      })?.paletteAsLight,
    );
    expect(pack.scenes[0].frameReceipt?.frameHash).toBe(sha256Hex('project frame bytes'));
    expect(pack.scenes[0].agentPrompt).toBe('agent final prompt');
    expect(Object.keys(pack.shotApprovals)).toContain('1');
    expect(pack.manifest.packHash).toMatch(/^[0-9a-f]{64}$/);
  });

  test('aynı karar → aynı pack hash (timestamp yok, deterministik)', () => {
    setupProject();
    const a = buildProjectPack(useStudioStore.getState());
    const b = buildProjectPack(useStudioStore.getState());
    expect(a.manifest.packHash).toBe(b.manifest.packHash);
    expect(serializeProjectPack(a)).toBe(serializeProjectPack(b));
  });
});

describe('verifyProjectPack — manifest gövdeyle eşleşmeli', () => {
  test('sağlam pack doğrulanır', () => {
    setupProject();
    const json = serializeProjectPack(buildProjectPack(useStudioStore.getState()));
    const v = verifyProjectPack(JSON.parse(json));
    expect(v.ok).toBe(true);
    expect(v.legacy).toBe(false);
  });

  test('bozulmuş pack (scenes değişti) reddedilir', () => {
    setupProject();
    const pack = buildProjectPack(useStudioStore.getState());
    (pack.scenes[0] as { id: number }).id = 999; // manifest'i güncellemeden gövdeyi boz
    const v = verifyProjectPack(pack);
    expect(v.ok).toBe(false);
    expect(v.problems.join(' ')).toMatch(/scenesHash|packHash/);
  });

  test('eski V2026 snapshot (schema yok) → legacy read-only import', () => {
    const v = verifyProjectPack({ selectedWorldId: 'clay', projectTopic: 'eski proje' });
    expect(v.legacy).toBe(true);
    expect(v.ok).toBe(true);
  });

  test('yanlış explicit schema legacy sayılmaz; eksik shape self-hash taşısa da reddedilir', () => {
    expect(verifyProjectPack({ schema: 'future.pack', projectTopic: 'x' }).legacy).toBe(false);

    setupProject();
    const pack = buildProjectPack(useStudioStore.getState()) as any;
    delete pack.decision;
    expect(verifyProjectPack(pack).ok).toBe(false);
    expect(verifyProjectPack(pack).problems.join(' ')).toMatch(/Decision/);
  });

  test('hashleri yeniden hesaplanmış 0×0 frame bile gerçek evidence sayılmaz', () => {
    setupProject();
    const pack = buildProjectPack(useStudioStore.getState());
    pack.scenes[0].frameReceipt!.width = 0;
    pack.manifest.scenesHash = canonicalHash(pack.scenes);
    pack.manifest.packHash = canonicalHash({
      decision: pack.decision, source: pack.source, worldPacket: pack.worldPacket,
      shotApprovals: pack.shotApprovals, scenes: pack.scenes,
    });
    pack.projectId = `mamilas-${pack.manifest.packHash}`;
    const check = verifyProjectPack(pack);
    expect(check.ok).toBe(false);
    expect(check.problems.join(' ')).toMatch(/gerçek frame kanıtı/);
  });
});

describe('round-trip — export → import aynı world/approval/frame/motion kapısı verir', () => {
  test('Windows→Mac taşıma: import sonrası karar + approval + rawSource korunur', () => {
    setupProject();
    const json = useStudioStore.getState().exportProjectPack();

    // Başka bir makineyi simüle et: sıfırla, sonra import et.
    useStudioStore.getState().reset();
    expect(useStudioStore.getState().selectedWorldId).not.toBe('product_brand_real');

    useStudioStore.getState().importProjectPack(json);
    const s = useStudioStore.getState();
    expect(s.lastError).toBeNull();
    expect(s.selectedWorldId).toBe('product_brand_real');
    expect(s.subject).toBe('Mat siyah termos');
    expect(s.directorBrief).toBe('Ürün yazısını sen yerleştir.');
    expect(s.phase0PresetId).toBe('product_brand');
    expect(s.directorChoices).toEqual({ camera: 'measured', light: 'warm' });
    expect(s.beatKeeps).toEqual({ 'src-001': true });
    expect(s.beatAnalysis).toEqual({ verdict: 'PASS', notes: ['keep'] });
    expect(s.shotApprovals[1]?.verdict).toBe('APPROVED');
    expect(s.scenes).toHaveLength(2);
    expect(s.scenes[0].promptReceipt?.finalPrompt).toBe('agent final prompt');
    expect(s.scenes[0].frameReceipt?.frameHash).toBe(sha256Hex('project frame bytes'));
    expect(motionGate(s.scenes[0], s.currentCommandId(), s.currentPromptSourceCommandId(), s.shotApprovals[1]).open).toBe(true);
  });

  test('bozuk JSON import lastError verir, state\'i EZMEZ', () => {
    setupProject();
    const before = useStudioStore.getState().selectedWorldId;
    useStudioStore.getState().importProjectPack('{ bozuk json');
    expect(useStudioStore.getState().lastError).toMatch(/geçersiz JSON/);
    expect(useStudioStore.getState().selectedWorldId).toBe(before);
  });

  test('pack frame hash\'i round-trip sonrası motion gate kararını korur (pack → PackScene)', () => {
    setupProject();
    const pack = buildProjectPack(useStudioStore.getState());
    // Frame receipt pack'te taşınıyor; motion gate onunla yeniden kurulabilir.
    const packedFrame = pack.scenes[0].frameReceipt!;
    const scene = {
      frameReceipt: packedFrame,
      userImagePrompt: pack.scenes[0].agentPrompt ?? undefined,
      promptReceipt: pack.scenes[0].promptReceipt ?? undefined,
    };
    const cid = packedFrame.fromCommandId;
    expect(motionGate(scene, cid, pack.scenes[0].promptReceipt!.fromCommandId, pack.shotApprovals[1]).open).toBe(true); // APPROVE + güncel karar
  });
});

describe('projectPackToState — kararı geri yükler, üretimi yeniden derletir', () => {
  test('state ham kararı taşır (scenes değil — generateScenes ile yeniden derlenir)', () => {
    setupProject();
    const pack = buildProjectPack(useStudioStore.getState());
    const state = projectPackToState(pack);
    expect(state.selectedWorldId).toBe('product_brand_real');
    expect(state.rawSource).toBe(pack.source.rawSource);
    expect(state.shotApprovals?.[1]?.verdict).toBe('APPROVED');
  });

  test('erken v1 pack eksik yeni alanlar ve spans yüzünden çökmez', () => {
    setupProject();
    const pack: any = buildProjectPack(useStudioStore.getState());
    for (const key of [
      'selectedProjectId', 'selectedMusicId', 'mood', 'cameraEnergy', 'timeLight',
      'transition', 'musicVibe', 'pov', 'signature', 'leitmotif', 'tempoCurve',
      'phase0PresetId', 'directorChoices', 'workingMode', 'beatMode', 'beatKeeps', 'beatAnalysis', 'recipeScenes',
    ]) delete pack.decision[key];
    pack.source = {
      rawSource: 'Birinci cümle.\nİkinci cümle.',
      beats: [{ sourceId: 'src-001', exactText: 'Birinci cümle.', hash: 'legacy-hash' }],
    };
    pack.manifest.decisionHash = canonicalHash(pack.decision);
    pack.manifest.sourceHash = canonicalHash(pack.source);
    pack.manifest.worldPacketHash = pack.worldPacket ? canonicalHash(pack.worldPacket) : null;
    pack.manifest.approvalsHash = canonicalHash(pack.shotApprovals);
    pack.manifest.scenesHash = canonicalHash(pack.scenes);
    pack.manifest.packHash = canonicalHash({
      decision: pack.decision, source: pack.source, worldPacket: pack.worldPacket,
      shotApprovals: pack.shotApprovals, scenes: pack.scenes,
    });
    pack.projectId = `mamilas-${pack.manifest.packHash}`;

    expect(verifyProjectPack(pack).ok).toBe(true);
    const state = projectPackToState(pack);
    expect(state.selectedWorldId).toBe('product_brand_real');
    expect(state.workingMode).toBe('guided');
    expect(state.sourceBeats?.length).toBeGreaterThan(0);
    expect(state.sourceBeats?.every((beat) => Number.isInteger(beat.start) && Number.isInteger(beat.end))).toBe(true);
  });
});

describe('MACRO 7 — closeout: karar→prompt→frame zinciri; dersler OTOMATİK global olmaz', () => {
  test('closeout zinciri her shot için approval + prompt + frame + status okur', () => {
    setupProject();
    const pack = buildProjectPack(useStudioStore.getState());
    const co = buildCloseout(
      pack,
      useStudioStore.getState().currentCommandId(),
      useStudioStore.getState().currentPromptSourceCommandId(),
    );

    expect(co.schema).toBe(CLOSEOUT_SCHEMA);
    expect(co.chain).toHaveLength(2);
    // Shot 1: onaylı + ajan prompt + APPROVE frame → zincir okunur.
    const s1 = co.chain.find((c) => c.sceneId === 1)!;
    expect(s1.shotApproval?.verdict).toBe('APPROVED');
    expect(s1.promptReceipt?.finalPrompt).toBe('agent final prompt');
    expect(s1.frameReceipt?.verdict).toBe('APPROVE');
    expect(s1.status).toBe('APPROVED_FRAME');
    // Shot 2: frame yok.
    const s2 = co.chain.find((c) => c.sceneId === 2)!;
    expect(s2.status).toBe('NO_FRAME');
    expect(co.summary.approvedFrames).toBe(1);
    expect(co.summary.noFrame).toBe(1);
  });

  test('acik riskler gorunur kalir (framesiz shot); dersler OBSERVATION — promoted:false', () => {
    setupProject();
    const co = buildCloseout(
      buildProjectPack(useStudioStore.getState()),
      useStudioStore.getState().currentCommandId(),
      useStudioStore.getState().currentPromptSourceCommandId(),
    );
    expect(co.openRisks.some((r) => /gerçek frame taşımıyor/.test(r))).toBe(true);
    // Hiçbir ders otomatik PROMOTED değil — ortak hafızaya geçmez.
    expect(co.observations.every((o) => o.promoted === false)).toBe(true);
  });

  test('APPROVE verdict stale karar/prompt zinciriyle APPROVED_FRAME sayılamaz', () => {
    setupProject();
    const pack = buildProjectPack(useStudioStore.getState());
    pack.scenes[0].frameReceipt!.fromCommandId = 'mamilas-stale';
    const co = buildCloseout(
      pack,
      useStudioStore.getState().currentCommandId(),
      useStudioStore.getState().currentPromptSourceCommandId(),
    );
    expect(co.chain.find((c) => c.sceneId === 1)?.status).toBe('STALE_EVIDENCE');
    expect(co.summary.approvedFrames).toBe(0);
    expect(co.summary.staleEvidence).toBe(1);
  });
});
