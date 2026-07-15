import { describe, expect, test, beforeEach, vi } from 'vitest';
import { useStudioStore, motionGate } from './useStudioStore';
import type { Scene, SceneFrameReceipt } from './useStudioStore';
import { sha256Hex, sha256HexBytes } from '../core/contract';

/**
 * MACRO 5 — Manuel Frame + Motion kapısı.
 *
 * Kabul: frame import edilmeden veya Mami APPROVE etmeden motion yolu HİÇBİR yüzden açılamaz.
 * Motion, prompt'a değil GERÇEK piksele bağlıdır: frame SHA-256 + karar/prompt hash'i receipt'e
 * bağlanır; frame/karar değişince stale olur.
 */

function fakeScene(id: number, frameReceipt?: SceneFrameReceipt): Scene {
  const finalPrompt = `agent prompt ${id}`;
  return {
    id,
    architecture: {} as never,
    imagePrompt: `scene ${id}`,
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
    },
    frameReceipt,
  };
}

const CID = 'mamilas-abc';
const PROMPT_SOURCE = 'mamilas-source';
const APPROVAL = { verdict: 'APPROVED' as const, commandId: CID };
function frame(overrides: Partial<SceneFrameReceipt> = {}): SceneFrameReceipt {
  return {
    frameHash: sha256Hex('frame bytes'),
    fromCommandId: CID,
    fromPromptHash: sha256Hex('agent prompt 1'),
    width: 1920, height: 1080, aspect: 1.778,
    fileName: 'frame.png', byteSize: 100,
    verdict: 'APPROVE',
    ...overrides,
  };
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

describe('motionGate — motion YALNIZ onaylı current frame ile açılır', () => {
  test('frame yoksa motion KAPALI', () => {
    const g = motionGate(fakeScene(1), CID, PROMPT_SOURCE, APPROVAL);
    expect(g.open).toBe(false);
    expect(g.reason).toMatch(/Frame yok/);
  });

  test('frame yüklendi ama hüküm bekliyorsa (PENDING) KAPALI', () => {
    const g = motionGate(fakeScene(1, frame({ verdict: 'PENDING' })), CID, PROMPT_SOURCE, APPROVAL);
    expect(g.open).toBe(false);
  });

  test('REGENERATE → KAPALI', () => {
    expect(motionGate(fakeScene(1, frame({ verdict: 'REGENERATE' })), CID, PROMPT_SOURCE, APPROVAL).open).toBe(false);
  });

  test('PROJECT_ONLY_ACCEPT → KAPALI (kayda kabul, motion değil)', () => {
    expect(motionGate(fakeScene(1, frame({ verdict: 'PROJECT_ONLY_ACCEPT' })), CID, PROMPT_SOURCE, APPROVAL).open).toBe(false);
  });

  test('APPROVE + güncel karar → AÇIK', () => {
    const g = motionGate(fakeScene(1, frame({ verdict: 'APPROVE' })), CID, PROMPT_SOURCE, APPROVAL);
    expect(g.open).toBe(true);
  });

  test('APPROVE ama frame eski karara bağlı → STALE, KAPALI', () => {
    const g = motionGate(fakeScene(1, frame({ verdict: 'APPROVE', fromCommandId: 'mamilas-OLD' })), CID, PROMPT_SOURCE, APPROVAL);
    expect(g.open).toBe(false);
    expect(g.reason).toMatch(/eski karara/);
  });

  test('APPROVE frame olsa bile current storyboard onayı yoksa KAPALI', () => {
    expect(motionGate(fakeScene(1, frame()), CID, PROMPT_SOURCE, undefined).open).toBe(false);
  });

  test('frame current kararda olsa bile ajan prompt hash’i değiştiyse STALE, KAPALI', () => {
    const scene = fakeScene(1, frame());
    scene.userImagePrompt = 'başka ajan prompt’u';
    expect(motionGate(scene, CID, PROMPT_SOURCE, APPROVAL).open).toBe(false);
    expect(motionGate(scene, CID, PROMPT_SOURCE, APPROVAL).reason).toMatch(/prompt/);
  });
});

describe('store — frame import + hüküm + motion gate (gerçek aksiyonlar)', () => {
  beforeEach(() => {
    useStudioStore.getState().reset();
    class TestImage {
      naturalWidth = 1920;
      naturalHeight = 1080;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) { queueMicrotask(() => this.onload?.()); }
    }
    vi.stubGlobal('window', {});
    vi.stubGlobal('Image', TestImage);
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:test', revokeObjectURL: () => undefined });
  });

  test('importFrame SHA-256 + boyut + karar bağı yazar; PENDING başlar; motion kapalı', async () => {
    setBoundScenes([fakeScene(1)]);
    useStudioStore.getState().approveShot(1);
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);
    const file = new File([bytes], 'shot1.png', { type: 'image/png' });

    await useStudioStore.getState().importFrame(1, file);
    const sc = useStudioStore.getState().scenes[0];
    expect(sc.frameReceipt).toBeDefined();
    expect(sc.frameReceipt!.frameHash).toBe(sha256HexBytes(bytes)); // gerçek piksel hash
    expect(sc.frameReceipt!.byteSize).toBe(5);
    expect(sc.frameReceipt!.verdict).toBe('PENDING');
    expect(sc.frameReceipt!.fromPromptHash).toBe(sc.promptReceipt!.promptHash);

    const cid = useStudioStore.getState().currentCommandId();
    const sourceId = useStudioStore.getState().currentPromptSourceCommandId();
    expect(motionGate(sc, cid, sourceId, useStudioStore.getState().shotApprovals[1]).open).toBe(false); // PENDING → motion kapalı
  });

  test('setFrameVerdict APPROVE → motion açılır; clearFrame → tekrar kapanır', async () => {
    setBoundScenes([fakeScene(1)]);
    useStudioStore.getState().approveShot(1);
    const file = new File([new Uint8Array([9, 9, 9])], 'shot1.png', { type: 'image/png' });
    await useStudioStore.getState().importFrame(1, file);

    useStudioStore.getState().setFrameVerdict(1, 'APPROVE');
    let sc = useStudioStore.getState().scenes[0];
    const cid = useStudioStore.getState().currentCommandId();
    const sourceId = useStudioStore.getState().currentPromptSourceCommandId();
    expect(motionGate(sc, cid, sourceId, useStudioStore.getState().shotApprovals[1]).open).toBe(true);

    useStudioStore.getState().clearFrame(1);
    sc = useStudioStore.getState().scenes[0];
    expect(sc.frameReceipt).toBeUndefined();
    expect(motionGate(sc, cid, sourceId, useStudioStore.getState().shotApprovals[1]).open).toBe(false);
  });

  test('decode edilemeyen dosya frame receipt üretmez ve motion açılamaz', async () => {
    class BrokenImage {
      naturalWidth = 0;
      naturalHeight = 0;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) { queueMicrotask(() => this.onerror?.()); }
    }
    vi.stubGlobal('Image', BrokenImage);
    setBoundScenes([fakeScene(1)]);
    useStudioStore.getState().approveShot(1);

    await useStudioStore.getState().importFrame(1, new File([new Uint8Array([1, 2])], 'broken.png', { type: 'image/png' }));

    expect(useStudioStore.getState().scenes[0].frameReceipt).toBeUndefined();
    expect(useStudioStore.getState().lastError).toMatch(/Frame okunamadı/);
  });

  test('frame varken karar değişirse storyboard STALE olur → frame de gider (scene sıfırlanır)', async () => {
    const store = useStudioStore.getState();
    store.setField('selectedWorldId', 'deakins_naturalist');
    setBoundScenes([fakeScene(1)]);
    store.approveShot(1);
    const file = new File([new Uint8Array([7])], 'shot1.png', { type: 'image/png' });
    await useStudioStore.getState().importFrame(1, file);
    useStudioStore.getState().setFrameVerdict(1, 'APPROVE');
    expect(useStudioStore.getState().scenes[0].frameReceipt?.verdict).toBe('APPROVE');

    // Kararı değiştir → STALE_GENERATION: sahneler (ve frame'leri) temizlenir.
    useStudioStore.getState().setField('selectedPaletteId', 'deep_noir');
    expect(useStudioStore.getState().scenes).toHaveLength(0);
  });
});
