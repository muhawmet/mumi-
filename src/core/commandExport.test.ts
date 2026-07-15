import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { buildCommandJSON } from './commandExport';
import { DATA, generateBatch, resolveRecipeDefaults } from './pure';
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
    expect(command.scenes[0].handoff.IMAGE.packetVersion).toBe('1.0.0');
    expect(command.commands.roles.map((role) => role.role)).toEqual(['idea', 'image', 'motion', 'suno', 'proof']);
    // This assertion used to demand `--input-format json` — it was locking the blind
    // pipeline IN. The package's only supported entry point is the runner, because the
    // runner is where the gates live (frame gate, reference gate, ledger).
    expect(command.commands.cliExamples.join('\n')).toContain('MOTION-CALISTIR.command');
  });

  // FRAME-AWARE bir VERİ kapısıdır, tavsiye değil. Site motion taslağını kare
  // görülmeden üretir (buildMotionPrompt kör çalışır); `.command` bunu üç yerde
  // "TASLAK" diye etiketler ama alan `prompts.motion` adıyla, yapıştırmaya hazır
  // durduğu sürece etiket yalnızca temennidir. Dikkatsiz bir tüketici (ajan ya da
  // Mami) onu final sanıp motora verebilir → onaylı-upscale kare olmadan I2V.
  // Kapı: `prompts.motion` kare gelene kadar NULL; taslak adıyla anılır.
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
      // Kare yok → final motion yok. Kim `prompts.motion` okursa eli boş dönmeli.
      expect(scene.prompts.motion).toBeNull();
      expect(scene.motionStatus).toBe('PENDING_IMAGE');
      // Taslak KAYBOLMAZ — ajanın iskeleti (motor lehçesi, süre, split notu) burada,
      // ama adı ne olduğunu söylüyor.
      expect(scene.prompts.motionDraft).toBeTruthy();
      expect(scene.prompts.motionDraft).toContain('Engine grammar');
    }
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
    expect(cmd.commands.roles.map((role) => role.role)).toEqual(['idea', 'image', 'motion', 'suno', 'proof']);
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
    } as never) as never as { scenes: { refDna: string }[] };
  };

  // kurzgesagt_clarity native world'ü kurzgesagt_edu → one_piece_toei'de UYUMSUZ.
  const MISMATCHED_REF = 'kurzgesagt_clarity';

  it('uyumsuz ref: DNA grameri command JSON\'a hiç girmez', () => {
    const ref = DATA.refs.find((r) => r.id === MISMATCHED_REF)!;
    expect(ref.worldId, 'fixture varsayımı bozuldu').toBe('kurzgesagt_edu');

    const cmd = buildWith('one_piece_toei', [MISMATCHED_REF]);
    const refDna = cmd.scenes[0]?.refDna ?? '';
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
    const refDna = cmd.scenes[0]?.refDna ?? '';
    expect(refDna, 'uyumlu ref DNA\'sı kayboldu — fix fazla kesti').toContain(native.name);
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
        /\.(md|txt|png)$/.test(role.outputKey),
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
