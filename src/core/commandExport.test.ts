import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { buildCommandJSON } from './commandExport';
import { buildImageAuthorContext, storyboardHashOfScenes } from './agentProtocol';
import { DATA, generateBatch, resolveRecipeDefaults, deriveProductionPath } from './pure';
import { canonicalHash } from './contract';
import { registerOf } from './brain';
import { ingestSource, sourceIntegrity } from './source';

describe('buildCommandJSON', () => {
  it('exports a 2026 command envelope with source, locks, roles and effective prompts', () => {
    const rawSource = 'Su buharlaşır. Bulut olur.';
    const sourceBeats = ingestSource(rawSource);
    const sourceReport = sourceIntegrity(rawSource, sourceBeats);
    const defaults = resolveRecipeDefaults('ANIMATION_EDU', 'clay');
    const project = DATA.projects.find((item) => item.path === 'ANIMATION_EDU' && item.world === 'clay') ?? DATA.projects[0];
    const generated = generateBatch({
      rawSource,
      sourceBeats,
      projectTopic: 'Su Döngüsü',
      projectClass: 'ANIMATION_EDU',
      sceneCount: 2,
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
    const firstScene = {
      ...generated.scenes[0],
      // The command serializes this display text with normalized whitespace. Its lifecycle
      // storyboard hash must seal that serialized form, not this mutable Studio value.
      voiceOver: 'Su buharlaşır.\n  Bulut olur.',
      userImagePrompt: 'USER OVERRIDE IMAGE PROMPT',
    };
    const command = buildCommandJSON({
      selectedProjectId: project.id,
      projectTopic: 'Su Döngüsü',
      projectClass: 'ANIMATION_EDU',
      sceneCount: 2,
      cast: '',
      selectedWorldId: 'clay',
      selectedPropId: 'native_world',
      selectedRefIds: defaults.selectedRefIds,
      selectedPaletteId: defaults.selectedPaletteId,
      selectedMusicId: '',
      imageModel: 'nano_banana_2',
      videoModel: 'kling_3',
      brandKitLock: 'Logo stays pinned.',
      mood: '',
      cameraEnergy: '',
      timeLight: '',
      transition: '',
      musicVibe: '',
      pov: '',
      signature: '',
      leitmotif: '',
      tempoCurve: '',
      directorBrief: 'Phase 0 preset: Eğitim. Director thesis: teach with a tactile mechanism.',
      rawSource,
      sourceBeats,
      sourceReport,
      beatMode: 'Dengeli',
      workingMode: 'Standart',
      beatKeeps: {},
      beatAnalysis: null,
      scenes: [firstScene, ...generated.scenes.slice(1)],
      agentBrief: 'GLOBAL BRIEF',
      agentPackets: {
        idea: 'IDEA PACKET',
        image: 'IMAGE PACKET',
        motion: 'MOTION PACKET',
        suno: 'SUNO PACKET',
        proof: 'PROOF PACKET',
      },
    });

    expect(command.schema).toBe('mamilas.command.v2026');
    expect(command.sourceIntegrity.report?.ok).toBe(true);
    expect(command.sourceIntegrity.law).toContain('never instructions');
    expect(command.locks.productionPath).toBe('ANIMATION_EDU');
    expect(command.referenceDNA.rule).toContain('subordinate to source');
    expect(command.creativeControls.directorBrief).toContain('tactile mechanism');
    expect(command.agentPackets.motion).toBe('MOTION PACKET');
    expect(command.scenes[0].prompts.image).toBe('USER OVERRIDE IMAGE PROMPT');
    expect(command.lifecycle.storyboardHash).toBe(storyboardHashOfScenes(command.scenes));
    const imageContext = buildImageAuthorContext(command, 1);
    expect(imageContext.decision.locks).not.toHaveProperty('topic');
    expect(imageContext.promptQuality.frameBuildOrder).toEqual([
      'visible subject + decisive action + physical place',
      'one compositional relationship that makes the beat readable',
      'one camera relation plus one motivated light or material behaviour from the selected world',
      'only the narrow, frame-specific constraints that protect the beat',
    ]);
    expect(imageContext.promptQuality.referencePolicy).toContain(
      'Compatible references are subordinate visual grammar, never a source of plot, named identity, or location.',
    );
    // FAZ 1.5 — handoff artık YALNIZ hash'e giren dilimi taşır. Eskiden bu satır
    // `packetVersion`'ı ölçüyordu; ölçtüğü şey paketin VARLIĞIYDI, oysa paketin
    // %99'unun (MOTION/SUNO ve IMAGE'in draft/world/refDNAs'ı) tek bir okuyucusu yoktu.
    // Ölçülen artık taşınan kanal: `negatives` → buildImageAuthorContext.failureModes.
    expect(command.scenes[0].handoff.IMAGE.negatives.length).toBeGreaterThan(0);
    expect(imageContext.failureModes).toBe(command.scenes[0].handoff.IMAGE.negatives);
    expect(Object.keys(command.scenes[0].handoff)).toEqual(['IMAGE']);
    expect(Object.keys(command.scenes[0].handoff.IMAGE)).toEqual(['negatives']);
    expect(command.commands.roles.map((role) => role.role)).toEqual([
      'image_author', 'image_jury', 'frame_jury', 'motion_author', 'motion_jury',
    ]);
    expect(command.lifecycle.sceneContextHashes[1]).toMatch(/^[0-9a-f]{64}$/);
    // This assertion used to demand `--input-format json` — it was locking the blind
    // pipeline IN. The package's only supported entry point is the runner, because the
    // runner is where the gates live (frame gate, reference gate, ledger).
    expect(command.commands.cliExamples.join('\n')).toContain('MOTION-CALISTIR.command');
  });

  it('keeps a topic lock only when no raw source can supply the approved shot', () => {
    const command = {
      commandId: 'mamilas-test',
      baseDecision: { locks: { topic: 'Su Döngüsü' }, source: { authority: 'TOPIC_ONLY', rawSource: '' } },
      lifecycle: { protocol: {}, storyboardHash: 'hash', mamiDirectives: [] },
      scenes: [{ id: 1, phaseName: 'Intro', durationSec: 5, architecture: {}, sceneBrief: 'Su döngüsü.' }],
    };
    expect(buildImageAuthorContext(command, 1).decision.locks).toMatchObject({ topic: 'Su Döngüsü' });
  });

  // C1: sözleşme (commandExport.ts:478) IMAGE author'a açıkça
  // "worldPacket.renderPhysics/cameraEnvelope/lightPhysics/motionCadence/paletteAsLight okunur"
  // diyor. Alan worldPacket'te üretiliyor (pure.ts:501) ve MOTION context'ine giriyor
  // (agentProtocol.ts:486) ama IMAGE context'ine hiç girmiyordu — sözleşme↔veri çelişkisi,
  // M2 vocabularyExamples vakasının aynısı (sessiz alan-düşürme = dolaylı silme).
  it('carries worldPacket.motionCadence into the IMAGE author context as the contract promises', () => {
    const command = {
      commandId: 'mamilas-test',
      baseDecision: { locks: {}, source: { authority: 'TOPIC_ONLY', rawSource: '' } },
      lifecycle: { protocol: {}, storyboardHash: 'hash', mamiDirectives: [] },
      worldPacket: {
        id: 'clay',
        renderPhysics: 'RP',
        cameraEnvelope: 'CE',
        lightPhysics: 'LP',
        paletteAsLight: 'PAL',
        negativeLock: 'NEG',
        motionCadence: '24fps squash-stretch cadence with 12-18 frame emotional holds.',
      },
      scenes: [{ id: 1, phaseName: 'Intro', durationSec: 5, architecture: {}, sceneBrief: 'Bir beat.' }],
    };
    expect(buildImageAuthorContext(command, 1).world?.motionCadence).toBe(command.worldPacket.motionCadence);
  });

  // FRAME-AWARE bir VERİ kapısıdır, tavsiye değil. Site motion taslağını kare
  // görülmeden üretir (buildMotionPrompt kör çalışır); `.command` bunu üç yerde
  // "TASLAK" diye etiketler ama alan yapıştırmaya hazır durduğu sürece etiket
  // yalnızca temennidir. Dikkatsiz bir tüketici (ajan ya da Mami) onu final sanıp
  // motora verebilir → onaylı-upscale kare olmadan I2V.
  // Kapı iki parçalıdır ve ikisi de burada kilitli:
  //  (1) `prompts.motion` kare gelene kadar NULL — YASAKLI alan, eksik alan değil.
  //  (2) Yanında taslak YOK. `prompts.motionDraft` (2026-07-27'de söküldü) sökülen
  //      `handoff.MOTION`'ın ikiziydi; adını değiştirmek metni yasal yapmıyordu.
  // Sızıntı ölçütü alan adı DEĞİL, metnin imzası: buildMotionPrompt her motion
  // metnine 'Engine grammar (' basar (brain.ts). Paketin hiçbir yerinde geçmemeli —
  // yeni bir alan adı altında geri gelirse bu assert onu yakalar.
  it('ships no ready-to-paste motion prompt — the frame gate is data, not advice', () => {
    const rawSource = 'Su buharlaşır. Bulut olur.';
    const sourceBeats = ingestSource(rawSource);
    const defaults = resolveRecipeDefaults('ANIMATION_EDU', 'clay');
    const project = DATA.projects.find((item) => item.path === 'ANIMATION_EDU' && item.world === 'clay') ?? DATA.projects[0];
    const generated = generateBatch({
      rawSource,
      sourceBeats,
      projectTopic: 'Su Döngüsü',
      projectClass: 'ANIMATION_EDU',
      sceneCount: 2,
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

    const command = buildCommandJSON({
      selectedProjectId: project.id,
      projectTopic: 'Su Döngüsü',
      projectClass: 'ANIMATION_EDU',
      sceneCount: 2,
      cast: '',
      selectedWorldId: 'clay',
      selectedPropId: 'native_world',
      selectedRefIds: defaults.selectedRefIds,
      selectedPaletteId: defaults.selectedPaletteId,
      selectedMusicId: '',
      imageModel: 'nano_banana_2',
      videoModel: 'kling_3',
      mood: '', timeLight: '', cameraEnergy: '', pov: '',
      signature: '', leitmotif: '', tempoCurve: '', directorBrief: '',
      brandKitLock: '', transition: '', musicVibe: '',
      rawSource,
      sourceBeats,
      sourceReport: sourceIntegrity(rawSource, sourceBeats),
      beatMode: 'Dengeli',
      workingMode: 'Standart',
      beatKeeps: {},
      beatAnalysis: null,
      scenes: generated.scenes,
      agentBrief: 'GLOBAL BRIEF',
      agentPackets: { idea: '', image: '', motion: '', suno: '', proof: '' },
    });

    for (const scene of command.scenes) {
      // Kare yok → final motion yok. Kim `prompts.motion` okursa eli boş dönmeli:
      // alan DURUR, değeri null'dır (yasaklı alan ≠ eksik alan).
      expect(Object.keys(scene.prompts)).toContain('motion');
      expect(scene.prompts.motion).toBeNull();
      expect(scene.motionStatus).toBe('PENDING_IMAGE');
      // Taslak da yok: yanına konan "iskelet" kapının arka kapısıydı.
      expect(Object.keys(scene.prompts)).not.toContain('motionDraft');
    }
    // Ad değiştirerek geri gelemez: kör motion metninin imzası paketin HİÇBİR
    // yerinde geçmez (sahne alanları, handoff, qa, sözleşme — tamamı taranır).
    expect(JSON.stringify(command)).not.toContain('Engine grammar (');
    // Sözleşme sessiz kalmaz: taslak verilmediğini ajana SÖYLER.
    expect(command.commands.contract.join(' ')).toContain('MOTION ships no draft');
  });

  it('activeRoles always ships the full video pipeline', () => {
    const defaults = resolveRecipeDefaults('ANIMATION_EDU', 'clay');
    const project = DATA.projects.find((item) => item.path === 'ANIMATION_EDU' && item.world === 'clay') ?? DATA.projects[0];
    const cmd = buildCommandJSON({
      selectedProjectId: project.id,
      projectTopic: 'Test',
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
      rawSource: '',
      sourceBeats: [],
      sourceReport: null,
      beatMode: 'Dengeli',
      workingMode: 'Standart',
      beatKeeps: {},
      beatAnalysis: null,
      scenes: [],
      agentBrief: '',
      agentPackets: { idea: 'I', image: 'I', motion: 'M', suno: 'S', proof: 'P' },
    });
    expect(cmd.commands.roles.map((role) => role.role)).toEqual([
      'image_author', 'image_jury', 'frame_jury', 'motion_author', 'motion_jury',
    ]);
  });
});

// 🔒 WORLD-LOCK, COMMAND TARAFI (Codex denetimi 2026-07-10 gece).
// pure.ts:853 uyumsuz ref'i `SUPPRESSED_WORLD_MISMATCH` işaretler ve `directive`'ini
// boşaltır — sahne yolu bu yüzden temiz. Ama commandExport.ts ham `selectedRefIds`'i
// doğrudan `dnaDirectives`'e veriyordu; `refCompatibleWithWorld` hiç çağrılmıyordu.
// Sonuç: One Piece güvertesi seçiliyken `.command`'daki AJAN (promptu YAZAN kişi)
// refDna alanında "locked isometric orthographic diagram" grameri okuyordu.
// Bugün kapatılan telif firewall'unun / camera_grammar otoritesinin command tarafı.
describe('command export world-lock: uyumsuz ref DNA sızmaz', () => {
  const buildWith = (worldId: string, refIds: string[]) => {
    const batch = generateBatch({
      projectTopic: 'Yanardağ nasıl patlar?', projectClass: 'ders', sceneCount: 1, cast: '',
      selectedWorldId: worldId, selectedPropId: 'none', selectedRefIds: refIds,
      selectedPaletteId: 'native_world', selectedMusicId: '',
      imageModel: 'nano_banana_2', videoModel: 'kling_3',
    } as never) as never as { status: string; scenes: unknown[] };
    expect(batch.status, 'batch üretilemedi').toBe('GENERATED');
    return buildCommandJSON({
      selectedProjectId: '', projectTopic: 'Yanardağ nasıl patlar?', projectClass: 'ders',
      sceneCount: 1, cast: '', selectedWorldId: worldId, selectedPropId: 'none',
      selectedRefIds: refIds, selectedPaletteId: 'native_world', selectedMusicId: '',
      imageModel: 'nano_banana_2', videoModel: 'kling_3', brandKitLock: '',
      mood: '', cameraEnergy: '', timeLight: '', transition: '', musicVibe: '',
      pov: '', signature: '', leitmotif: '', tempoCurve: '', directorBrief: '',
      rawSource: '', sourceBeats: [], sourceReport: null,
      beatMode: 'Dengeli', workingMode: 'Standart', beatKeeps: {}, beatAnalysis: null,
      scenes: batch.scenes, agentBrief: '',
      agentPackets: { idea: '', image: '', motion: '', suno: '', proof: '' },
      // FAZ 1.5: `refDna` bir kez türetilir (dnaDirectives) — sahneden sahneye değişmesi
      // mümkün değildi, o yüzden 41 kopya yerine ÜST DÜZEYDE tek alan olarak yaşar.
      // World-lock sözleşmesi değişmedi: uyumsuz ref bu tek alana da giremez.
    } as never) as never as { refDna: string };
  };

  // kurzgesagt_clarity native world'ü kurzgesagt_edu → one_piece_toei'de UYUMSUZ.
  const MISMATCHED_REF = 'kurzgesagt_clarity';

  it('uyumsuz ref: DNA grameri command JSON\'a hiç girmez', () => {
    const ref = DATA.refs.find((r) => r.id === MISMATCHED_REF)!;
    expect(ref.worldId, 'fixture varsayımı bozuldu').toBe('kurzgesagt_edu');

    const cmd = buildWith('one_piece_toei', [MISMATCHED_REF]);
    const refDna = cmd.refDna ?? '';
    // Bu dünyanın grameri DEĞİL. Ajan bunu okursa One Piece güvertesine
    // izometrik diyagram kamerası kurar.
    expect(refDna, 'uyumsuz ref DNA\'sı command JSON\'a sızıyor — world-lock aşınır')
      .not.toMatch(/isometric|insight-glow|diagram-reveal/i);
    expect(refDna, 'uyumsuz ref adı bile pozitif direktif olarak geçmemeli')
      .not.toMatch(new RegExp(ref.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  });

  it('uyumlu ref: DNA grameri command JSON\'a normal şekilde geçer', () => {
    // Sözleşmenin diğer yarısı: fix, uyumlu ref'i susturmamalı.
    const native = DATA.refs.find((r) => r.worldId === 'kurzgesagt_edu' && r.dna);
    if (!native) return;
    const cmd = buildWith('kurzgesagt_edu', [native.id]);
    const refDna = cmd.refDna ?? '';
    expect(refDna, 'uyumlu ref DNA\'sı kayboldu — fix fazla kesti').toContain(native.name);
  });
});

// P3+P4 — projectClass ÇİFT-KANON. commandExport eskiden `registerOf(projectClass)` (ham) ve
// `DATA.paths.find(id===projectClass)` (tam eşleşme) kullanıyordu; generateBatch ise
// `deriveProductionPath(projectClass)` (fuzzy) + `registerOf(derivedPath)`. Fuzzy bir class
// ('ders', 'REKLAM') için command ile brief FARKLI path/register (dolayısıyla farklı DNA/materyal)
// taşıyordu → project.json ile final_brief.md iki başka işten bahsediyordu. Tek kanon: ikisi de
// deriveProductionPath kullanmalı.
describe('P3/P4 — command register/path deriveProductionPath kanonunu izler', () => {
  const buildFuzzy = (projectClass: string) => buildCommandJSON({
    selectedProjectId: '', projectTopic: 'Yanardağ nasıl patlar?', projectClass,
    sceneCount: 1, cast: '', selectedWorldId: 'kurzgesagt_edu', selectedPropId: 'none',
    selectedRefIds: [], selectedPaletteId: 'native_world', selectedMusicId: '',
    imageModel: 'nano_banana_2', videoModel: 'kling_3', brandKitLock: '',
    mood: '', cameraEnergy: '', timeLight: '', transition: '', musicVibe: '',
    pov: '', signature: '', leitmotif: '', tempoCurve: '', directorBrief: '',
    rawSource: '', sourceBeats: [], sourceReport: null,
    beatMode: 'Dengeli', workingMode: 'Standart', beatKeeps: {}, beatAnalysis: null,
    scenes: [], agentBrief: '',
    agentPackets: { idea: '', image: '', motion: '', suno: '', proof: '' },
  } as never) as never as { locks: { productionPath: string }; baseDecision?: unknown };

  it('fuzzy class "ders" → command productionPath deriveProductionPath ile aynı (ham class değil)', () => {
    const cmd = buildFuzzy('ders');
    // 'ders' bir path id DEĞİL; kanon onu ANIMATION_EDU'ya türetir. Eski kod ham 'ders' basıyordu.
    expect(deriveProductionPath('ders')).toBe('ANIMATION_EDU');
    expect(cmd.locks.productionPath).toBe('ANIMATION_EDU');
  });

  it('fuzzy REAL class "REKLAM" → command register brief register\'ıyla aynı (STY≠REAL sapması yok)', () => {
    // registerOf('REKLAM') ham → REAL token yok → STY; registerOf(deriveProductionPath('REKLAM'))
    // = registerOf('ULTRAREAL_COMMERCIAL') → REAL. Sapma command DNA/materyalini bozardı.
    expect(deriveProductionPath('REKLAM')).toBe('ULTRAREAL_COMMERCIAL');
    expect(registerOf('REKLAM')).not.toBe(registerOf(deriveProductionPath('REKLAM')));
    const cmd = buildFuzzy('REKLAM');
    expect(cmd.locks.productionPath).toBe('ULTRAREAL_COMMERCIAL');
  });
});

// AD ↔ SINIF — kapı üretimden ÖNCE ötmeli.
//
// DUVAR runner'dadır ve orada kalır (`commandRuntime.test.ts`: uyuşmazlıkta ok:false, hiçbir rol
// açılmaz). Ama duvar üretimden SONRAYDI: Mami 52 sahneyi yazıp JSON'u hatta verdikten sonra
// öğreniyordu. Burada kilitlenen iki şey: (1) çelişki JSON'un DOĞDUĞU anda görünür oluyor,
// (2) görünürlük hiçbir mührü kırmıyor — export bloke edilmez, hash'ler oynamaz.
describe('ad ↔ sınıf uyuşmazlığı command JSON\'da görünür (export bloke etmez)', () => {
  const build = (projectId: string, projectClass = 'ANIMATION_EDU') => {
    const batch = generateBatch({
      projectTopic: 'Su Döngüsü', projectClass, sceneCount: 2, cast: '',
      selectedWorldId: 'pixar_3d_edu', selectedPropId: 'native_world', selectedRefIds: [],
      selectedPaletteId: 'pastel_soft', selectedMusicId: '',
      imageModel: 'nano_banana_2', videoModel: 'kling_3',
    } as never) as never as { status: string; scenes: unknown[] };
    expect(batch.status, 'batch üretilemedi').toBe('GENERATED');
    return buildCommandJSON({
      selectedProjectId: projectId, projectTopic: 'Su Döngüsü', projectClass, sceneCount: 2,
      cast: '', selectedWorldId: 'pixar_3d_edu', selectedPropId: 'native_world', selectedRefIds: [],
      selectedPaletteId: 'pastel_soft', selectedMusicId: '',
      imageModel: 'nano_banana_2', videoModel: 'kling_3', brandKitLock: '',
      mood: '', cameraEnergy: '', timeLight: '', transition: '', musicVibe: '',
      pov: '', signature: '', leitmotif: '', tempoCurve: '', directorBrief: '',
      rawSource: '', sourceBeats: [], sourceReport: null,
      beatMode: 'Dengeli', workingMode: 'Standart', beatKeeps: {}, beatAnalysis: null,
      scenes: batch.scenes, agentBrief: '',
      agentPackets: { idea: '', image: '', motion: '', suno: '', proof: '' },
    } as never) as never as Record<string, never>;
  };

  it('uyuşmazlıklı state: bulgu JSON\'da, runner koduyla AYNI adla', () => {
    // Ölçülen gerçek vakanın birebir şekli: reklam adı + eğitim üretim yolu.
    const cmd = build('ultra_real_commercial') as never as {
      locks: { projectName: string; productionPath: string };
      projectNameClassMismatch: { code: string; projectName: string; productionPath: string; message: string; effect: string } | null;
      scenes: unknown[];
    };
    expect(cmd.locks.projectName).toBe('Ultra Real Commercial');
    const finding = cmd.projectNameClassMismatch;
    expect(finding, 'çelişki JSON\'da görünmüyor — kapı yine üretimden SONRA öter').not.toBeNull();
    // Runner'ın bastığı kodla aynı kelime: iki yüzey aynı olayı iki adla anlatmaz.
    expect(finding?.code).toBe('PROJECT_NAME_CLASS_MISMATCH');
    expect(finding?.projectName).toBe('Ultra Real Commercial');
    expect(finding?.productionPath).toBe('ANIMATION_EDU');
    expect(finding?.message).toContain('Ultra Real Commercial');
    // BLOKE ETMEZ: paket eksiksiz üretilir, Mami indirebilir — duvar runner'da kalır.
    expect(cmd.scenes.length).toBe(2);
  });

  it('tutarlı state: alan null — kapı ada göre değil ÇELİŞKİYE göre öter', () => {
    const cmd = build('education') as never as { projectNameClassMismatch: unknown };
    expect(cmd.projectNameClassMismatch).toBeNull();
    // Sevk edilmiş gerçek proje: "Anime Edu / Action Grammar" @ STYLIZED_PREMIUM. Üslup
    // register'ı (STY) REAL↔EDU çelişkisi değildir; katı kural bunu duvara çarpardı.
    const styl = build('anime_action', 'STYLIZED_PREMIUM') as never as { projectNameClassMismatch: unknown };
    expect(styl.projectNameClassMismatch).toBeNull();
  });

  it('HASH KIRMIZI ÇİZGİSİ: bulgu commandId / storyboardHash / sceneContextHash yüzeyinde DEĞİL', () => {
    const cmd = build('ultra_real_commercial') as never as {
      commandId: string;
      baseDecision: unknown;
      lifecycle: { storyboardHash: string; sceneContextHashes: Record<number, string> };
      scenes: Array<{ id: number; phaseName: string; durationSec: number; architecture: unknown; sceneBrief: string; motionEngine: unknown }>;
    };
    // 1) Kimlik yalnız baseDecision'ı kapsar ve bulgu orada değil.
    expect(JSON.stringify(cmd.baseDecision)).not.toContain('PROJECT_NAME_CLASS_MISMATCH');
    expect(cmd.commandId).toBe(`mamilas-${canonicalHash(cmd.baseDecision)}`);
    // 2) storyboardHash yalnız sahne dilimini kapsar.
    expect(cmd.lifecycle.storyboardHash).toBe(storyboardHashOfScenes(cmd.scenes.map((scene) => ({
      id: scene.id, phaseName: scene.phaseName, durationSec: scene.durationSec,
      architecture: scene.architecture as never, sceneBrief: scene.sceneBrief,
    }))));
    // 3) sceneContextHash, alanı SÖKÜLMÜŞ bir komuttan yeniden hesaplanınca aynı çıkar —
    //    yani `buildImageAuthorContext` bu alanı hiç okumuyor.
    const stripped = { ...(cmd as unknown as Record<string, unknown>) };
    delete stripped.projectNameClassMismatch;
    for (const scene of cmd.scenes) {
      expect(cmd.lifecycle.sceneContextHashes[scene.id]).toBe(canonicalHash({
        imageAuthor: buildImageAuthorContext(stripped, scene.id),
        motionEngine: scene.motionEngine,
      }));
    }
  });
});

// 🔒 TEK KANONİK SÖZLEŞME (Codex denetimi 2026-07-10 akşam).
// `prompts.image` bir BRIEF'tir — çerçeve, bitmiş/onaylı prompt DEĞİL. Ajan Pass A'da
// dominant element'i KENDİ yazar. Ama ekosistemde İKİ ZIT talimat yaşıyordu:
//   agents/production/RUN_MOTION_AGENT.md  → "verbatim … already approved — copy it"
//   agents/claude/07_PRODUCTION_CLAUDE.md  → "VERBATIM … never rewrite"
//   agents/gpt/07_PRODUCTION_GPT.md        → "verbatim — approved, do not rewrite"
// Prodüksiyonu Claude Project / Custom GPT üzerinden koşarsan ajan sitenin iskeletini
// KOPYALIYOR: sceneBrief'i, refDna'yı, paletteLight'ı kullanmıyor → palet fiziği,
// kamera grameri, harf grameri o yolda ÖLÜ.
//
// Dahası: prompts.image ajana yazılmış köşeli-parantez talimatları taşır
// ("[DIRECTOR TASK — … do not print into the frame]", "[SOURCE — … narration only]",
// "Scene brief (Claude yazar)"). Verbatim kopyalanınca bunlar Nano Banana 2'ye gider.
describe('prompts.image sözleşmesi tek ve kanonik', () => {
  const root = resolve(__dirname, '../../agents');

  const walk = (dir: string): string[] => {
    const out: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) { out.push(...walk(full)); continue; }
      if (/\.(md|command)$/.test(entry.name)) out.push(full);
    }
    return out;
  };

  const docs = walk(root);

  it('ajan dokümanları bulunuyor', () => {
    expect(docs.length, 'agents/ altında .md/.command yok').toBeGreaterThan(3);
  });

  it("hiçbir doküman prompts.image'i \"verbatim / onaylı / kopyala\" diye tarif etmez", () => {
    // Aynı cümlede hem prompts.image hem "verbatim/approved/copy it" geçiyorsa stale
    // sözleşmedir. Kanonik dil bunları YALNIZCA olumsuzlayarak kullanabilir
    // ("not a verbatim/approved prompt", "Never copy … verbatim").
    // Birim SATIR, cümle değil. `split(/(?<=[.\n])/)` ile denendi ve KAĞIT KAPLAN
    // çıktı: `image_prompts/<id>.txt` ve `scenes[i].prompts.image` içindeki noktalar
    // cümleyi bölüyor, "prompts.image" ile "verbatim" ayrı parçalara düşüyordu
    // (üç mutasyonun üçünde de test yeşil kaldı). Markdown maddesi satırda yaşar;
    // madde bir sonraki satıra taşabildiği için pencere = satır + ardıl satır.
    // Pencereyi NORMALİZE et, yoksa üç ayrı tuzak sahte pozitif üretir (hepsi görüldü):
    //  · markdown vurgusu: "**Never** copy" → `never copy` regex'i eşleşmez
    //  · markdown vurgusu: "*not* a" → `not a` eşleşmez
    //  · Türkçe büyük İ: `/değil/i` ile "DEĞİL" EŞLEŞMEZ (İ ≠ i)
    // Ayrıca "pre-approved" tetikleyici sayılmamalı — o zaten olumsuzlamanın parçası.
    const normalise = (s: string) =>
      s.replace(/[*`_]/g, ' ')          // markdown vurgusu
        .replace(/İ/g, 'i')        // İ → i
        .replace(/ı/g, 'i')        // ı → i
        .toLocaleLowerCase('en-US')
        .replace(/\s+/g, ' ');

    const offenders: string[] = [];
    for (const file of docs) {
      const lines = readFileSync(file, 'utf8').split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (!/prompts\.image/i.test(lines[i])) continue;
        const window = normalise(`${lines[i]} ${lines[i + 1] ?? ''}`);
        // Ayırt edici işaret SIFAT değil EMİR. Kanonik metin de "verbatim" ve
        // "approved" kelimelerini kullanır ("the scene BRIEF, not a pre-approved
        // prompt", "sceneBrief (verbatim kaynak beat)") — sıfata bakan test sahte
        // pozitif üretir ve muafiyet listesi sonsuza dek büyür (üç kez denendi).
        // Stale sözleşmeyi tanımlayan şey ajana KOPYALAMAYI emretmesidir.
        const COPY_ORDER = /\b(copy it|copy the prompt|copy .{0,20}verbatim|aynen kopyala|do not rewrite|never rewrite|do not rewrite or)\b/;
        if (!COPY_ORDER.test(window)) continue;
        // "never copy … verbatim" tam tersini emreder → meşru.
        if (/\bnever copy\b/.test(window)) continue;
        offenders.push(`${relative(root, file)}:${i + 1}: ${window.slice(0, 110)}`);
      }
    }
    expect(
      offenders,
      `prompts.image'i onaylı prompt sanan stale sözleşme:\n  ${offenders.join('\n  ')}`,
    ).toEqual([]);
  });

  it('prompts.image gerçekten ajana-yazılmış talimat taşır (bu yüzden verbatim gidemez)', () => {
    const batch = generateBatch({
      projectTopic: 'Su döngüsü nasıl işler?', projectClass: 'ders', sceneCount: 1, cast: '',
      selectedWorldId: 'kurzgesagt_edu', selectedPropId: 'none', selectedRefIds: [],
      selectedPaletteId: 'vibrant_edu', selectedMusicId: '',
      imageModel: 'nano_banana_2', videoModel: 'kling_3',
    } as never) as never as { status: string; scenes: { imagePrompt: string }[] };
    expect(batch.status).toBe('GENERATED');
    const prompt = batch.scenes[0].imagePrompt;
    // Bu üçü AJANA konuşur. Motor bunları görsel sanır.
    expect(prompt, 'DIRECTOR TASK talimatı yok — brief yapısı değişmiş olabilir').toContain('[DIRECTOR TASK');
    expect(prompt, 'SOURCE talimatı yok').toContain('[SOURCE');
    expect(prompt, 'ajan-yazar işareti yok').toMatch(/Claude yazar/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// THE SITE'S OWN CLI EXAMPLE BUILT A BLIND PIPELINE.
//
// cliExamples shipped three "examples". Two of them taught the agent to blind itself:
// the jq slice dropped scenes[].sceneBrief, scenes[].refDna and scenes[].paletteLight —
// every field that tells the agent what to author — and left it alone with a motionDraft
// that LOOKS finished. Piping agentPackets.image straight in skipped the frame gate and
// the reference gate entirely. An example printed inside the package is not an example;
// it is an instruction, and the agent obeys it.
//
// This test reads the BUILT package, not the source file — a check that greps its own
// builder's source is a mirror, not a gate.
describe('the emitted package documents exactly one way to run it — the one with the gates', () => {
  const buildRealPackage = () => {
    const rawSource = 'Su buharlaşır. Bulut olur.';
    const sourceBeats = ingestSource(rawSource);
    const defaults = resolveRecipeDefaults('ANIMATION_EDU', 'clay');
    const project =
      DATA.projects.find((item) => item.path === 'ANIMATION_EDU' && item.world === 'clay') ??
      DATA.projects[0];
    const generated = generateBatch({
      rawSource,
      sourceBeats,
      projectTopic: 'Su Döngüsü',
      projectClass: 'ANIMATION_EDU',
      sceneCount: 2,
      cast: '',
      selectedWorldId: 'clay',
      selectedPropId: 'native_world',
      selectedRefIds: defaults.selectedRefIds,
      selectedPaletteId: defaults.selectedPaletteId,
      selectedMusicId: '',
      imageModel: 'nano_banana_2',
      videoModel: 'kling_3',
    });
    return buildCommandJSON({
      selectedProjectId: project.id,
      projectTopic: 'Su Döngüsü',
      projectClass: 'ANIMATION_EDU',
      rawSource,
      sourceBeats,
      sourceReport: sourceIntegrity(rawSource, sourceBeats),
      scenes: generated.scenes,
      agentBrief: generated.agentBrief,
      selectedWorldId: 'clay',
      selectedPropId: 'native_world',
      selectedRefIds: defaults.selectedRefIds,
      selectedPaletteId: defaults.selectedPaletteId,
      imageModel: 'nano_banana_2',
      videoModel: 'kling_3',
    } as never) as unknown as { commands: { cliExamples: string[] } };
  };

  it('no cli example pipes a sliced package into an agent', () => {
    const examples = buildRealPackage().commands.cliExamples;
    for (const example of examples) {
      expect(
        /\|\s*(claude|codex)\b/.test(example),
        `cliExamples still pipes a package into an agent: "${example}" — every field that slice drops is a place the agent goes blind, and the gates live in the runner, not in the pipe`,
      ).toBe(false);
    }
  });

  it('the one supported path is the runner, because the runner is where the gates live', () => {
    const examples = buildRealPackage().commands.cliExamples;
    expect(
      examples.some((example) => example.includes('MOTION-CALISTIR.command')),
      'the package no longer tells the agent how it is meant to be run',
    ).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TWO INCOMPATIBLE DELIVERY CONTRACTS IN ONE PACKAGE (D6), AND A LOOSE COPY OF A
// STRICT LAW (D7). Both were found by reading the emitted package, so both are
// tested against the emitted package.
describe('the package speaks one delivery contract and one text law', () => {
  const build = () => {
    const rawSource = 'Su buharlaşır. Bulut olur.';
    const sourceBeats = ingestSource(rawSource);
    const defaults = resolveRecipeDefaults('ANIMATION_EDU', 'clay');
    const project =
      DATA.projects.find((p) => p.path === 'ANIMATION_EDU' && p.world === 'clay') ?? DATA.projects[0];
    const generated = generateBatch({
      rawSource,
      sourceBeats,
      projectTopic: 'Su Döngüsü',
      projectClass: 'ANIMATION_EDU',
      sceneCount: 2,
      cast: '',
      selectedWorldId: 'clay',
      selectedPropId: 'native_world',
      selectedRefIds: defaults.selectedRefIds,
      selectedPaletteId: defaults.selectedPaletteId,
      selectedMusicId: '',
      imageModel: 'nano_banana_2',
      videoModel: 'kling_3',
    });
    return buildCommandJSON({
      selectedProjectId: project.id,
      projectTopic: 'Su Döngüsü',
      projectClass: 'ANIMATION_EDU',
      rawSource,
      sourceBeats,
      sourceReport: sourceIntegrity(rawSource, sourceBeats),
      scenes: generated.scenes,
      agentBrief: generated.agentBrief,
      agentPackets: generated.agentPackets,
      selectedWorldId: 'clay',
      selectedPropId: 'native_world',
      selectedRefIds: defaults.selectedRefIds,
      selectedPaletteId: defaults.selectedPaletteId,
      imageModel: 'nano_banana_2',
      videoModel: 'kling_3',
    } as never) as unknown as {
      commands: { roles: Array<{ role: string; outputKey: string }> };
      agentPackets: Record<string, string>;
    };
  };

  // Every role used to "deliver" to outputs.frames / outputs.motion / outputs.music —
  // keys defined nowhere — while folderContract demanded real files on disk. An agent
  // obeying the role table literally hands back a key the site never reads.
  it('every role delivers a file the folder contract actually names', () => {
    for (const role of build().commands.roles) {
      expect(
        role.outputKey,
        `role "${role.role}" delivers to "${role.outputKey}" — a key nothing on disk is named after`,
      ).not.toMatch(/^outputs\./);
      expect(
        /\.(md|txt|png|json)$/.test(role.outputKey),
        `role "${role.role}" delivers to "${role.outputKey}", which is not a file`,
      ).toBe(true);
    }
  });

  // agentPackets.image carried the LOOSE text policy ("Use NO_TEXT when writing is not
  // required") while commands.contract and all four runner lanes carried the strict law.
  // Every path that drags the IMAGE role out of the package read the loose one.
  it('the image packet carries the strict on-screen text law, not the loose one', () => {
    const packet = build().agentPackets.image ?? '';
    expect(packet, 'the image packet has no text law at all').toContain('ON-SCREEN TEXT LAW');
    expect(
      packet,
      'the image packet still teaches the loose policy — "NO_TEXT" replaced the law that text is an object in the frame',
    ).not.toContain('Use NO_TEXT when writing is not required');
    for (const clause of ['OBJECT in the frame', 'Screen coordinates are FORBIDDEN', 'Letterform']) {
      expect(packet, `the image packet's text law is missing: ${clause}`).toContain(clause);
    }
  });
});

// FABLE canlı bulgusu (Mami yaşadı, 2026-07-16): dokunulmamış 'Su Döngüsü' varsayılan
// subject'i, Dashboard'a yazılan gerçek projeyi ("Uzaya Giden Muhammet") eziyordu —
// export dosya adı, locks.topic, projectId hepsi yanlış konudan türedi.
describe('effectiveTopic — dokunulmamış varsayılan subject projeyi ezmez', () => {
  it('varsayılan subject + gerçek projectTopic → proje kazanır', async () => {
    const { effectiveTopic, DEFAULT_PROJECT_TOPIC } = await import('./contract');
    expect(effectiveTopic(DEFAULT_PROJECT_TOPIC, 'Uzaya Giden Muhammet')).toBe('Uzaya Giden Muhammet');
    expect(effectiveTopic('', 'Uzaya Giden Muhammet')).toBe('Uzaya Giden Muhammet');
    expect(effectiveTopic(undefined, 'Uzaya Giden Muhammet')).toBe('Uzaya Giden Muhammet');
    // Mami GERÇEKTEN subject yazdıysa o kazanır (eski meşru davranış korunur):
    expect(effectiveTopic('Fincher Uzay Filmi', 'Uzaya Giden Muhammet')).toBe('Fincher Uzay Filmi');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FAZ 1.5 — BATCH-GENELİ ALAN TEKİLLEŞTİRMESİ, VE ONUN TEK KIRILGAN NOKTASI.
//
// Ölçüm (gerçek 41 sahnelik `Kutle-ve-Agirlik_mamilas_command.json`, 2782 KB): kütlenin
// %72'si aynı metnin sahne başına byte-kopyasıydı — handoff.MOTION (470 KB, sıfır okuyucu
// ve "kare görülmeden motion yazılmaz" yasasının arka kapısı), handoff.SUNO (385 KB, tek
// müziğin 41 kopyası), handoff.IMAGE'in negatives dışındaki her şeyi (745 KB, prompts.image
// ve worldPacket'in kopyası), refDna (183 KB) ve prompts.suno (20 KB).
//
// `refDna` ve `music.suno` KOŞULSUZ tekil: ikisi de sahne döngüsünün DIŞINDA bir kez
// türetilir. `paletteLight` DEĞİL — gece/gündüz karışık bir projede sahneden sahneye
// değişir ve frame gate pikselleri ona karşı ölçer. Körleme dedupe orada gece sahnesine
// gündüz ışığı vaat ederdi: kare doğru üretilir, kendi kapısında düşer.
//
// Bu yüzden kural ÖLÇÜLÜR: tekilse taşınır, değilse sahnede kalır. Test o ölçümü kilitler.
describe('FAZ 1.5 — batch-geneli alanlar tekilleşir, sahne-özel alan sahnede kalır', () => {
  // ÖLÇÜLDÜ (46 dünya × tüm paletler): `isNight` paletteLight'ı yalnız palet GÜN IŞIĞI
  // cümlesi taşıdığında değiştirir — 155 kombinasyonda değişir, geri kalanında gece ve
  // gündüz AYNI metni üretir. Bu tam olarak dedupe'un neden ÖLÇÜLMESİ gerektiğidir:
  // "gece sahnesi var → alan sahne-özeldir" varsayımı da yanlıştır. Fixture bilerek
  // gerçekten ayrışan bir kombinasyonu seçer (pixar_3d_edu + golden_dust_epic).
  const NIGHT_SENSITIVE_PALETTE = 'golden_dust_epic';
  const buildMixed = (nightFlags: boolean[]) => {
    const rawSource = 'Güneş suyu ısıtır. Buhar yükselir. Bulut oluşur. Yağmur düşer.';
    const sourceBeats = ingestSource(rawSource);
    const defaults = resolveRecipeDefaults('ANIMATION_EDU', 'pixar_3d_edu');
    const generated = generateBatch({
      rawSource,
      sourceBeats,
      projectTopic: 'Su Döngüsü',
      projectClass: 'ANIMATION_EDU',
      sceneCount: nightFlags.length,
      cast: '',
      selectedWorldId: 'pixar_3d_edu',
      selectedPropId: 'native_world',
      selectedRefIds: defaults.selectedRefIds,
      selectedPaletteId: NIGHT_SENSITIVE_PALETTE,
      selectedMusicId: '',
      imageModel: 'nano_banana_2',
      videoModel: 'kling_3',
    });
    expect(generated.status, 'fixture üretilemedi').toBe('GENERATED');
    const scenes = generated.scenes.map((scene, index) => ({ ...scene, isNight: nightFlags[index] }));
    return buildCommandJSON({
      selectedProjectId: '', projectTopic: 'Su Döngüsü', projectClass: 'ANIMATION_EDU',
      sceneCount: scenes.length, cast: '', selectedWorldId: 'pixar_3d_edu', selectedPropId: 'native_world',
      selectedRefIds: defaults.selectedRefIds, selectedPaletteId: NIGHT_SENSITIVE_PALETTE,
      selectedMusicId: '', imageModel: 'nano_banana_2', videoModel: 'kling_3', brandKitLock: '',
      mood: '', cameraEnergy: '', timeLight: '', transition: '', musicVibe: '',
      pov: '', signature: '', leitmotif: '', tempoCurve: '', directorBrief: '',
      rawSource, sourceBeats, sourceReport: sourceIntegrity(rawSource, sourceBeats),
      beatMode: 'Dengeli', workingMode: 'Standart', beatKeeps: {}, beatAnalysis: null,
      scenes, agentBrief: '',
      agentPackets: { idea: '', image: '', motion: '', suno: '', proof: '' },
    } as never) as never as {
      refDna: string;
      paletteLight: string | null;
      music: { suno: string | null };
      scenes: Array<{
        paletteLight: string | null;
        prompts: { suno: string | null };
        handoff: { IMAGE: { negatives?: string[] } };
      }>;
    };
  };

  it('tek ışıklı proje: paletteLight ÜST DÜZEYDE tekilleşir, sahne null taşır', () => {
    const cmd = buildMixed([false, false, false, false]);
    expect(cmd.paletteLight, 'tekil paletteLight üst düzeye çıkmadı').toBeTruthy();
    expect(cmd.scenes.every((scene) => scene.paletteLight === null), '41 kopya geri geldi').toBe(true);
  });

  it('gece/gündüz KARIŞIK proje: paletteLight sahnede KALIR, körleme silinmez', () => {
    const cmd = buildMixed([false, true, false, true]);
    // Karışıkken üst düzey null'dır — "tek değer" iddiası ortada yok.
    expect(cmd.paletteLight, 'karışık projede sahte tekil değer ilan edildi').toBeNull();
    const perScene = cmd.scenes.map((scene) => scene.paletteLight);
    expect(perScene.every((value) => typeof value === 'string' && value.length > 0),
      'karışık projede sahne kendi ışığını kaybetti — gece karesi gündüz kapısında düşer').toBe(true);
    expect(new Set(perScene).size, 'gece ve gündüz aynı ışığı taşıyor — fixture ya da dedupe bozuk')
      .toBeGreaterThan(1);
  });

  it('refDna ve music.suno KOŞULSUZ tekil (ikisi de sahne döngüsünün dışında türetilir)', () => {
    const cmd = buildMixed([false, true, false, true]);
    expect(typeof cmd.refDna, 'refDna üst düzeyde yok').toBe('string');
    expect(cmd.music.suno, 'music.suno üst düzeyde yok').toBeTruthy();
    expect(cmd.scenes.every((scene) => scene.prompts.suno === null), 'suno 41 kopya geri geldi').toBe(true);
    expect(cmd.scenes.every((scene) => !('refDna' in scene)), 'refDna sahneye geri sızdı').toBe(true);
  });

  it('handoff YALNIZ hash\'e giren dilimi taşır — MOTION/SUNO geri büyüyemez', () => {
    const cmd = buildMixed([false, false]);
    for (const scene of cmd.scenes) {
      expect(Object.keys(scene.handoff), 'handoff.MOTION/SUNO geri geldi — 855 KB ölü ağırlık ve motion yasası ihlali')
        .toEqual(['IMAGE']);
      expect(Object.keys(scene.handoff.IMAGE), 'IMAGE paketi negatives dışında alan taşıyor')
        .toEqual(['negatives']);
      // negatives hash-BAĞLIDIR (buildImageAuthorContext.failureModes): çıkarmak
      // her sahnenin sceneContextHash'ini kırar, yani bekleyen her command'i stale eder.
      expect(scene.handoff.IMAGE.negatives?.length, 'negatives boşaldı — sceneContextHash kırılır')
        .toBeGreaterThan(0);
    }
  });
});
