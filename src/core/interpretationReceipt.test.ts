import { describe, it, expect } from 'vitest';
import { generateBatch, type BriefInput } from './pure';
import { createAgentArtifact, verifyAgentArtifact, type ImageAuthorContent } from './agentProtocol';
import { sha256Hex } from './contract';

/**
 * BRAIN M3 — Şeffaf yorum receipt'i + dürüst adlandırma (KUSUR-A, Mami revizyonu).
 *
 * Ölçülmüş kusur: `architecture.dominantSubject`/`event` ham kaynak cümlenin
 * byte-identical kopyasıydı (pure.ts eski :1471-1481) — alan adı "site sahnenin
 * dominant öznesini seçti" iddiası taşıyor ama site seçmiyor; ajan sahneyi
 * GÖRÜNMEZ yorumluyordu. Zincir "Mami'nin onayladığı beat'ten üretildi"yi
 * kanıtlıyor, "Mami ajanın YORUMUNU gördü"yü kanıtlamıyordu.
 *
 * Mami revizyonu (2026-07-16): onay kapısı/bürokrasi YOK. Çözüm şeffaflık:
 *  - Site dürüst ad taşır: `exactSourceBeat` (verbatim kaynak) +
 *    `semanticInterpretationStatus: 'AGENT_AUTHORED'` (yorum ajanın işi).
 *  - image_author artifact'i zorunlu tek-satır `interpretation` bloğu taşır:
 *    { dominantSubject, singleEvent, frozenInstant } — ajanın kafası GÖRÜNÜR,
 *    akışı DURDURMAZ.
 */

const baseInput: BriefInput = {
  projectTopic: 'Su Döngüsü',
  projectClass: 'ANIMATION_EDU',
  sceneCount: 3,
  cast: '',
  selectedWorldId: 'clay',
  selectedPropId: 'native_world',
  selectedRefIds: [],
  selectedPaletteId: '',
  selectedMusicId: '',
  imageModel: 'nano_banana_2',
  videoModel: 'kling_3',
};

describe('dürüst adlandırma — site semantic author değildir', () => {
  it('site brief exactSourceBeat + AGENT_AUTHORED statüsü taşır, sahte dominant kopyası değil', () => {
    const r = generateBatch(baseInput);
    expect(r.status).toBe('GENERATED');
    for (const s of r.scenes) {
      // Dürüst transport: verbatim kaynak beat, dürüst adla.
      expect(s.architecture.exactSourceBeat).toBeTruthy();
      expect(s.architecture.exactSourceBeat).toBe(s.architecture.source.exactText);
      // Yorum ajanın işi — site taşımaz; statü bunu açıkça söyler.
      expect(s.architecture.semanticInterpretationStatus).toBe('AGENT_AUTHORED');
      // Kopya-yalan alanları architecture'dan kalktı:
      expect('dominantSubject' in s.architecture).toBe(false);
      expect('event' in s.architecture).toBe(false);
    }
  });

  it('SOURCE_BOUND yolda da exactSourceBeat verbatim kaynağı taşır (scrub yok)', () => {
    const r = generateBatch({
      ...baseInput,
      projectTopic: 'SOURCE:\nGenç denizci güvertede durur.\nFırtına ufuktan yaklaşır.\nYelkenler gerilir, ip gıcırdar.',
      sceneCount: 3,
    });
    expect(r.status).toBe('GENERATED');
    expect(r.scenes.map((s) => s.architecture.exactSourceBeat)).toEqual([
      'Genç denizci güvertede durur.',
      'Fırtına ufuktan yaklaşır.',
      'Yelkenler gerilir, ip gıcırdar.',
    ]);
  });
});

describe('v9 persisted state → M3 architecture migration (Sol KRİTİK #2)', () => {
  it('eski dominantSubject/event taşıyan sahne exactSourceBeat + AGENT_AUTHORED ile iyileşir', async () => {
    const { healArchitectureM3 } = await import('../store/useStudioStore');
    const legacyScene: any = {
      id: 1,
      architecture: {
        source: { status: 'SOURCE_BOUND', sourceId: 'source-001', exactText: 'Genç denizci güvertede durur.', notice: null },
        beat: 'orient',
        dominantSubject: 'Genç denizci güvertede durur.',
        event: 'Genç denizci güvertede durur.',
        imageVantage: '35mm eye-level',
        semanticFingerprint: 'scene-x',
      },
    };
    const healed = healArchitectureM3([legacyScene])[0];
    expect(healed.architecture.exactSourceBeat).toBe('Genç denizci güvertede durur.');
    expect(healed.architecture.semanticInterpretationStatus).toBe('AGENT_AUTHORED');
    expect('dominantSubject' in healed.architecture).toBe(false);
    expect('event' in healed.architecture).toBe(false);
    // Zaten yeni şekilse dokunmaz:
    expect(healArchitectureM3([healed])[0]).toEqual(healed);
  });
});

describe('migratePersistedState — vault/legacy import yolu sahne kaybetmez ve M3 iyileşir (Sol re-audit)', () => {
  it('modern selectedRefIds dizisi V5→V6 tetiklemez; eski architecture kayıpsız iyileşir', async () => {
    const { migratePersistedState } = await import('../store/useStudioStore');
    const legacyPersisted: any = {
      projectTopic: 'Su Döngüsü',
      selectedRefIds: [],
      scenes: [{
        id: 1,
        motionPrompt: 'motion',
        duration: { sec: 3, usable: 3, ok: true, level: 'OK', shots: 1, perShot: 3, message: '' },
        handoff: { IMAGE: { draft: { previewPrompt: 'x', canonical: false } }, MOTION: {}, SUNO: {} },
        architecture: {
          source: { status: 'SOURCE_BOUND', sourceId: 'source-001', exactText: 'Genç denizci güvertede durur.', notice: null },
          beat: 'orient',
          dominantSubject: 'Genç denizci güvertede durur.',
          event: 'Genç denizci güvertede durur.',
          imageVantage: '35mm eye-level',
          semanticFingerprint: 'scene-x',
        },
      }],
    };
    const migrated: any = migratePersistedState(legacyPersisted);
    // Sahne SİLİNMEDİ (eski tetik burada scenes=[] yapıyordu — ölçülmüş kırık):
    expect(migrated.scenes).toHaveLength(1);
    // M3 iyileşmesi uygulandı:
    expect(migrated.scenes[0].architecture.exactSourceBeat).toBe('Genç denizci güvertede durur.');
    expect(migrated.scenes[0].architecture.semanticInterpretationStatus).toBe('AGENT_AUTHORED');
    expect('dominantSubject' in migrated.scenes[0].architecture).toBe(false);
  });

  it('gerçek v5 kalıntısı (tekil selectedRefId) hâlâ V5→V6 temizliğine girer', async () => {
    const { migratePersistedState } = await import('../store/useStudioStore');
    const v5: any = { selectedRefId: 'pixar_dimensional', scenes: [{ id: 1 }] };
    const migrated: any = migratePersistedState(v5);
    expect(migrated.scenes).toHaveLength(0); // v5 refDNA'lı sahneler bilerek temizlenir
    expect(migrated.selectedRefIds).toEqual(['pixar_dimensional']);
  });
});

describe('image_author şeffaf yorum receipt zorunluluğu', () => {
  function sampleImageAuthorContent(overrides: Partial<ImageAuthorContent> = {}): ImageAuthorContent {
    const prompt = 'A young sailor grips the rail of a wooden deck, storm light from one side. Clean motion-ready start frame.';
    return {
      prompt,
      promptHash: sha256Hex(prompt),
      interpretation: {
        dominantSubject: 'the young sailor at the rail',
        singleEvent: 'bracing as the first storm gust hits the deck',
        frozenInstant: 'half a second before the bow lifts on the swell',
      },
      directiveReceipts: [],
      appliedLocks: ['worldLock:clay'],
      suppressedContext: [],
      risks: [],
      ...overrides,
    };
  }

  function sampleArtifact(content: ImageAuthorContent) {
    return createAgentArtifact({
      phase: 'IMAGE_PROMPT',
      role: 'image_author',
      provider: 'claude',
      sceneId: 1,
      decisionHash: 'd'.repeat(16),
      storyboardHash: 's'.repeat(16),
      inputArtifactHashes: [],
      revision: 0,
      content,
    });
  }

  const expected = { decisionHash: 'd'.repeat(16), storyboardHash: 's'.repeat(16) };

  it('yorum receiptli image_author artifacti geçerli doğrulanır', () => {
    const v = verifyAgentArtifact(sampleArtifact(sampleImageAuthorContent()), expected);
    expect(v.problems).toEqual([]);
    expect(v.ok).toBe(true);
  });

  it('interpretation bloğu YOKSA artifact reddedilir - yorum görünmez kalamaz', () => {
    const content = sampleImageAuthorContent();
    delete (content as unknown as Record<string, unknown>).interpretation;
    const v = verifyAgentArtifact(sampleArtifact(content), expected);
    expect(v.ok).toBe(false);
    expect(v.problems.join(' ')).toMatch(/interpretation/);
  });

  it('interpretation alanlarından biri boşsa reddedilir (üçü de zorunlu)', () => {
    for (const key of ['dominantSubject', 'singleEvent', 'frozenInstant'] as const) {
      const content = sampleImageAuthorContent({
        interpretation: { ...sampleImageAuthorContent().interpretation, [key]: '   ' },
      });
      const v = verifyAgentArtifact(sampleArtifact(content), expected);
      expect(v.ok, `${key} boşken geçmemeli`).toBe(false);
      expect(v.problems.join(' ')).toMatch(/interpretation/);
    }
  });

  it('interpretation onay kapısı DEĞİLDİR - lifecycle receiptli author sonrası normal jüriye akar', async () => {
    // Akış durmaz: image_author artifact'i (receipt'li) varken sıradaki adım
    // image_jury'dir — araya AWAIT_MAMI / proposal fazı GİRMEZ (Mami revizyonu).
    const { nextLifecycleAction } = await import('./agentProtocol');
    const action = nextLifecycleAction([sampleArtifact(sampleImageAuthorContent())]);
    expect(action).toEqual({ kind: 'RUN_ROLE', role: 'image_jury', revision: 0 });
  });
});
