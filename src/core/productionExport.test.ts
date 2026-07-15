import { describe, expect, it } from 'vitest';
import { buildProductionExport, bundleSlug } from './productionExport';
import { DATA, generateBatch, resolveRecipeDefaults } from './pure';
import { ingestSource, sourceIntegrity } from './source';

function makeVideoState() {
  const rawSource = 'Su buharlaşır. Bulut olur. Yağmur yağar.';
  const sourceBeats = ingestSource(rawSource);
  const sourceReport = sourceIntegrity(rawSource, sourceBeats);
  const defaults = resolveRecipeDefaults('ANIMATION_EDU', 'clay');
  const project = DATA.projects.find((item) => item.path === 'ANIMATION_EDU' && item.world === 'clay') ?? DATA.projects[0];
  const generated = generateBatch({
    rawSource,
    sourceBeats,
    projectTopic: 'Su Döngüsü',
    projectClass: 'ANIMATION_EDU',
    sceneCount: 3,
    cast: '',
    selectedWorldId: 'clay',
    selectedPropId: 'native_world',
    selectedRefIds: defaults.selectedRefIds,
    selectedPaletteId: defaults.selectedPaletteId,
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
  });
  expect(generated.status).toBe('GENERATED');

  return {
    selectedProjectId: project.id,
    projectTopic: 'Su Döngüsü',
    projectClass: 'ANIMATION_EDU',
    sceneCount: 3,
    cast: '',
    selectedWorldId: 'clay',
    selectedPropId: 'native_world',
    selectedRefIds: defaults.selectedRefIds,
    selectedPaletteId: defaults.selectedPaletteId,
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
    directorBrief: '',
    rawSource,
    sourceBeats,
    sourceReport,
    beatMode: 'Dengeli' as const,
    workingMode: 'Standart' as const,
    beatKeeps: {},
    beatAnalysis: null,
    scenes: generated.scenes,
    agentBrief: 'GLOBAL BRIEF',
    agentPackets: {
      idea: 'IDEA PACKET',
      image: 'IMAGE PACKET',
      motion: 'MOTION PACKET',
      suno: 'SUNO PACKET',
      proof: 'PROOF PACKET',
    },
  };
}

describe('bundleSlug', () => {
  it('produces a filesystem-safe lowercase slug from a Turkish topic', () => {
    expect(bundleSlug('Su Döngüsü')).toBe('su_dongusu');
    expect(bundleSlug('  Şehir & İklim!  ')).toBe('sehir_iklim');
    expect(bundleSlug('')).toBe('mamilas');
  });
});

// Motion Yasası: motor penceresini aşan beat dengeli bölünür ve HER BÖLÜMÜN KENDİ
// start frame'i olur. durationGuard bunu doğru hesaplıyordu (shotsExpected=2) ama
// dosya sözleşmesi tek `motion/<id>.txt` + tek `images/<id>.png` ilan ediyordu —
// yani "böl" bir talimattı, sözleşme değil. Ajan onu yok sayıp 18s'yi tek klibe
// sıkıştırsa eksik görünmezdi; Mami de tek kare üretirdi. Paket beklenen dosyaları
// SAYSIN ki eksiklik dosya listesinden okunabilsin.
describe('buildProductionExport — süre aşımı dosya sözleşmesi', () => {
  it('declares one frame and one motion file per shot when a scene overflows the engine window', () => {
    const rawSource =
      'Güneşin ısıttığı deniz yüzeyinden yükselen su buharı, soğuk hava katmanlarına ulaştığında minik damlacıklara dönüşür ve bu damlacıklar birleşerek bulutları oluşturur, bulutlar ağırlaşınca da yağmur olarak toprağa geri düşer.';
    const sourceBeats = ingestSource(rawSource);
    const sourceReport = sourceIntegrity(rawSource, sourceBeats);
    const defaults = resolveRecipeDefaults('ANIMATION_EDU', 'clay');
    const project = DATA.projects.find((item) => item.path === 'ANIMATION_EDU' && item.world === 'clay') ?? DATA.projects[0];
    const generated = generateBatch({
      rawSource,
      sourceBeats,
      projectTopic: 'Su Döngüsü',
      projectClass: 'ANIMATION_EDU',
      sceneCount: 1,
      cast: '',
      selectedWorldId: 'clay',
      selectedPropId: 'native_world',
      selectedRefIds: defaults.selectedRefIds,
      selectedPaletteId: defaults.selectedPaletteId,
      selectedMusicId: '',
      imageModel: 'nano_banana_2',
      videoModel: 'kling_3',
    });
    if (generated.status !== 'GENERATED') throw new Error('not generated');

    const payload = buildProductionExport({
      ...makeVideoState(),
      sceneCount: 1,
      rawSource,
      sourceBeats,
      sourceReport,
      scenes: generated.scenes,
      selectedProjectId: project.id,
    });

    const entry = payload.production.sceneIndex[0];
    // Önce ön-koşul: bu sahne gerçekten pencereyi aşıyor olmalı, yoksa test bir şey ölçmez.
    expect(entry.splitExpected).toBe(true);
    expect(entry.shotsExpected).toBeGreaterThan(1);

    // Sözleşme: shot başına BİR kare + BİR motion dosyası, adlarıyla.
    expect(entry.imageFiles).toHaveLength(entry.shotsExpected);
    expect(entry.motionFiles).toHaveLength(entry.shotsExpected);
    expect(entry.imageFiles[0]).toBe('images/1a.png');
    expect(entry.imageFiles[1]).toBe('images/1b.png');
    expect(entry.motionFiles[0]).toBe('motion/1a.txt');
    expect(entry.motionFiles[1]).toBe('motion/1b.txt');

    // Paket KENDİ İÇİNDE çelişemez: split sahnede `images/1.png` diye bir dosya asla
    // var olmayacak (Mami 1a/1b bırakır). Tekil alanları bırakmak, aynı JSON'da iki
    // rakip sözleşme demektir — frame-gate'teki disiplinin aynısı: yanıltıcı alan null'lanır.
    expect(entry.imageFile).toBeNull();
    expect(entry.motionFile).toBeNull();

    // Sözleşme SİMETRİK olmalı: N kare + N motion isteyip TEK image prompt vermek,
    // ajanı 7 kareyi tek tarifle üretmeye zorlar → ya aynı karenin 7 varyasyonu, ya da
    // ajanın kendi shot ayrımını uydurması. Her shot'un kendi tarifi olur.
    expect(entry.imagePromptFiles).toHaveLength(entry.shotsExpected);
    expect(entry.imagePromptFiles[0]).toBe('image_prompts/1a.txt');
    expect(entry.imagePromptFiles[1]).toBe('image_prompts/1b.txt');
    expect(entry.imagePromptFile).toBeNull();
  });

  it('keeps the single-file contract untouched for scenes that fit the window', () => {
    const payload = buildProductionExport(makeVideoState());
    for (const entry of payload.production.sceneIndex) {
      expect(entry.splitExpected).toBe(false);
      expect(entry.imageFiles).toEqual([`images/${entry.id}.png`]);
      expect(entry.imagePromptFiles).toEqual([`image_prompts/${entry.id}.txt`]);
      expect(entry.motionFiles).toEqual([`motion/${entry.id}.txt`]);
    }
  });
});

describe('buildProductionExport (video)', () => {
  const payload = buildProductionExport(makeVideoState());

  it('wraps the canonical command JSON and adds a production block', () => {
    expect(payload.schema).toBe('mamilas.command.v2026');
    expect(payload.production.schema).toBe('mamilas.production.v2026');
    expect(payload.production.bundle.slug).toBe('su_dongusu');
    expect(payload.production.bundle.sceneCount).toBe(payload.scenes.length);
  });

  it('keeps every exported scene count locked to the generated storyboard, not stale UI state', () => {
    const stale = buildProductionExport({ ...makeVideoState(), sceneCount: 99 });
    expect(stale.locks.sceneCount).toBe(stale.scenes.length);
    expect(stale.production.bundle.sceneCount).toBe(stale.scenes.length);
    expect(stale.production.sceneIndex.length).toBe(stale.scenes.length);
  });

  it('maps each scene to index-based image and motion files in source order', () => {
    const idx = payload.production.sceneIndex;
    expect(idx.length).toBe(payload.scenes.length);
    idx.forEach((s, i) => {
      const scene = payload.scenes[i];
      expect(s.id).toBe(scene.id);
      expect(s.imageFile).toBe(`images/${scene.id}.png`);
      expect(s.imagePromptFile).toBe(`image_prompts/${scene.id}.txt`);
      expect(s.motionFile).toBe(`motion/${scene.id}.txt`);
      expect(s.motionStatus).toBe('PENDING_IMAGE');
      expect(typeof s.engineWindowSec).toBe('number');
    });
  });

  it('encodes the missing-image and no-image-no-motion laws', () => {
    expect(payload.production.matching.missingPolicy).toContain('report.md');
    expect(payload.production.matching.missingPolicy.toLowerCase()).toContain('never block');
    expect(payload.production.motionGate).toContain('No image, no motion');
  });

  it('carries a single-track music plan with per-scene cues', () => {
    expect(payload.production.music?.mode).toBe('single_track');
    expect(payload.production.music?.file).toBe('suno.txt');
    expect(payload.production.music?.perSceneCues.length).toBe(payload.scenes.length);
  });

  it('lists all three run surfaces (CLI, Claude Project, Custom GPT)', () => {
    const s = payload.production.surfaces;
    expect(s.cli.tools).toContain('Claude Code');
    expect(s.cli.tools).toContain('Codex CLI');
    expect(s.claudeProject.how).toContain('07_PRODUCTION_CLAUDE');
    expect(s.customGpt.how).toContain('07_PRODUCTION_GPT');
  });
});


// ─────────────────────────────────────────────────────────────────────────────
// FRAME GATE — a frame that EXISTS is not a frame that PASSED.
//
// The package already forced the agent to OPEN images/<id>.png before writing
// motion (motionGate). But the only fulfilment check was "flag it if the frame
// contradicts CONCEPT/EVENT" — so a generic 3D volcano satisfies "magma rises"
// while violating the world's render law, the composition pattern, the palette's
// light behaviour, the clean plate and the dominant lesson-object. That frame
// gets animated, and the run still reports DONE.
//
// The site cannot look at pixels — and must not pretend to. What it CAN do is
// state the promise the frame owes and refuse to advance without a recorded
// verdict against it. The agent judges the pixels; the code demands the receipt.
describe('production frame gate', () => {
  const pack = buildProductionExport(makeVideoState() as never);
  const gate = (pack.production as unknown as Record<string, unknown>).frameGate as {
    law: string;
    procedure: string[];
    checklist: string[];
    verdictFile: string;
    blocks: string;
  };

  it('exists as a structured gate, not a sentence buried in prose', () => {
    expect(gate, 'production.frameGate is missing — nothing judges the frame').toBeTruthy();
    expect(Array.isArray(gate.checklist)).toBe(true);
    expect(gate.checklist.length, 'an empty checklist is a gate that always opens').toBeGreaterThan(4);
  });

  it('names the verdict artifact and what it blocks', () => {
    expect(gate.verdictFile).toMatch(/frame_checks\/<id>\.md/);
    expect(gate.blocks, 'a verdict that blocks nothing is a comment').toMatch(/motion\/<id>\.txt/);
  });

  it('forbids motion until the frame carries a FRAME_PASS verdict', () => {
    const all = JSON.stringify(pack.production);
    expect(all).toContain('FRAME_PASS');
    expect(all).toContain('IMAGE_MISMATCH');
    expect(gate.law, 'the gate must bind motion to the verdict, not to the file existing').toMatch(
      /FRAME_PASS/,
    );
  });

  it('demands evidence from the pixels, not a verdict on the prompt', () => {
    const proc = gate.procedure.join(' ');
    expect(proc, 'the agent must open the authored promise it is judging against').toMatch(
      /image_prompts\/<id>\.txt/,
    );
    expect(proc, 'the agent must open the actual frame').toMatch(/images\/<id>\.png/);
    expect(proc.toLowerCase(), 'a prompt PASS must not be mistaken for a frame PASS').toContain(
      'prompt pass is not a frame pass',
    );
  });

  it('checks the frame against every lock the site actually made', () => {
    const rows = gate.checklist.join(' ').toLowerCase();
    for (const lock of ['sourcebeat', 'world', 'palette', 'camera', 'text', 'identity']) {
      expect(rows, `no checklist row covers ${lock} — that lock is unenforced on the frame`).toContain(
        lock === 'sourcebeat' ? 'scenebrief' : lock,
      );
    }
  });

  // Magnific was retired by Mami on 2026-07-11: he generates at 1K and Kling delivers 1080p
  // from whatever frame it is given, so a mandatory fidelity-upscale pass bought nothing and
  // cost a step. The package no longer separates raw_frames/ from images/, no longer asks "has
  // this been through Magnific?", and no longer parks a scene at PENDING_UPSCALE. What survives
  // is the part that was never about resolution: no frame, no motion.
  it('names the image engine, and does not resurrect the retired upscale step', () => {
    const scaffold = ((pack.production as unknown as Record<string, unknown>).scaffold as string[]).join(' ');
    const contract = (pack.production as unknown as Record<string, unknown>)
      .folderContract as Record<string, string>;
    expect(scaffold).toMatch(/Nano Banana 2/i);
    expect(JSON.stringify(pack.production)).not.toMatch(/magnific|PENDING_UPSCALE|raw_frames/i);
    expect(contract['images/<id>.png']).toMatch(/APPROVED start frame/i);
  });
});
