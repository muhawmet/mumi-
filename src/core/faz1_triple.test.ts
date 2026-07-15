import { describe, expect, it } from 'vitest';
import { PHASE0_VIDEO } from '../data/presets';
import { AUTHORITY_HIERARCHY, countEvents, resolveLightAuthority, dnaDirectives, registerOf } from './brain';
import { buildCommandJSON } from './commandExport';
import { buildProductionExport } from './productionExport';
import { containsWorkTitle, protectedTermsIn } from './proof';
import { DATA, generateBatch, normalizeWorldId, refCompatibleWithWorld, resolveRecipeDefaults } from './pure';
import { ingestSource, sourceIntegrity } from './source';

// ═══════════════════════════════════════════════════════════════════════════════
// FAZ 1 — THE TRIPLE: reçete → final_brief → command.
//
// This is the whole product. Mami builds a recipe; the site turns it into a brief an
// agent obeys and a package it runs. Everything else is decoration. So this suite runs the
// REAL chain across the FULL space — every world, every register, every preset, and five
// source shapes that behave differently (human action, brand, baked text, long, short) —
// and asserts what we have actually been burned by, each rule paid for in a real defect:
//
//   · a preset naming a world that no longer exists, silently rescued into the wrong one
//   · a brief printing a light directive the engine never receives (window lamp at open sea)
//   · a scene dossier repeating one boilerplate sentence five times, burying the decisions
//   · a ref selected in the recipe and never reaching the brief that authors from it
//   · a work title ("Soul", "Great-Before") riding into the prompt on any of four fields
//   · a palette's marketing name ordering the engine to be "cinematic"
//   · raw hex leaking past the Palette Translation Law
//   · a client's own brand scrubbed out of its own advertisement
//   · a final motion prompt existing before any frame did
//   · the frame gate missing from the package that is supposed to enforce it
//
// Fixtures are forbidden here. Every assertion reads what generateBatch really produced.

const SOURCES: Array<[string, string]> = [
  ['kısa', 'Su ısınır. Buhar yükselir. Bulut oluşur.'],
  ['uzun', [
    'Deniz suyu güneşle ısınır ve yavaşça buharlaşır.',
    'Yükselen nem soğuk havada yoğunlaşarak damlacıklara döner.',
    'Damlacıklar birleşir, bulut ağırlaşır ve yağmur düşer.',
    'Yağmur toprağa iner, dereleri besler ve ırmağa karışır.',
    'Irmak sonunda denize döner ve döngü baştan başlar.',
    'Aynı su, milyonlarca yıldır aynı yolculuğu yapıyor.',
  ].join('\n')],
  ['insan-eylemi', [
    'Sabah uyanınca birkaç dakika pencere önünde durmak zihni açar.',
    'Masayı temizlemek ve gerekli dosyayı açmak odaklanmayı kolaylaştırır.',
    'Bildirimleri kapatmak dikkati korur.',
  ].join('\n')],
  ['başlık-metni', 'Su Döngüsü. Buhar yükselir ve bulut olur. Yağmur toprağa döner.'],
];

const HEX = /#[0-9a-fA-F]{6}\b/;
const EMPTY_ADJ = /\b(cinematic|stunning|epic|4K|8K)\b/i;

/** A prohibition is not an order. Only the clauses that COMMAND something are scanned. */
function positiveHalf(prompt: string): string {
  return (prompt || '')
    .split(/\bNegative:/i)[0]
    .split(/[.;]/)
    .filter((clause) => !/\b(no|never|avoid|forbid|forbidden)\b/i.test(clause))
    .join('. ');
}

const HUMAN_PATHS = new Set(['LIVE_ACTION_CORPORATE']);

interface Run {
  status: string;
  scenes: Array<{ id: number; imagePrompt: string; motionPrompt: string; onScreenText?: string | null }>;
  agentBrief?: string;
}

function run(worldId: string, sourceText: string, extra: Record<string, unknown> = {}) {
  const world = DATA.worlds.find((w) => w.id === worldId)!;
  const project = DATA.projects.find((p) => p.world === worldId) ?? DATA.projects[0];
  const projectClass = String(extra.projectClass ?? project.path);
  const defaults = resolveRecipeDefaults(projectClass, worldId);
  const beats = ingestSource(sourceText);

  const base = {
    selectedProjectId: project.id,
    projectTopic: 'Faz 1',
    projectClass,
    sceneCount: Math.max(2, beats.length),
    cast: HUMAN_PATHS.has(projectClass) ? 'Orta yaşlı bir öğretmen, sade gömlek' : '',
    selectedWorldId: worldId,
    selectedPropId: 'native_world',
    selectedRefIds: defaults.selectedRefIds,
    selectedPaletteId: defaults.selectedPaletteId,
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
    brandKitLock: '',
    mood: '', cameraEnergy: '', timeLight: '', transition: '', musicVibe: '',
    pov: '', signature: '', leitmotif: '', tempoCurve: '', directorBrief: '',
    rawSource: sourceText,
    sourceBeats: beats,
    sourceReport: sourceIntegrity(sourceText, beats),
    ...extra,
  };

  const generated = generateBatch({ ...base } as never) as unknown as Run;
  return { world, base, generated };
}

// ── 1. REÇETE — the recipe Mami builds must survive into the package ──────────────
describe('FAZ 1 · REÇETE', () => {
  it('ships exactly ten presets, none orphaned', () => {
    expect(PHASE0_VIDEO.length).toBe(10);
  });

  it.each(PHASE0_VIDEO.map((p) => [p.id, p] as const))(
    '%s names a live world and hands that same world to the agent',
    (id, preset) => {
      const stored = preset.sets.selectedWorldId ?? '';
      const worldId = normalizeWorldId(stored);
      // A stale id is not an error the user ever sees: normalizeWorldId quietly rescues it
      // into a DIFFERENT world, and every ad intent once collapsed into three film worlds.
      expect(stored, `${id} stores a stale world id`).toBe(worldId);
      expect(DATA.worlds.some((w) => w.id === worldId), `${id} → unknown world`).toBe(true);
    },
  );

  it.each(DATA.worlds.map((w) => [w.id] as const))('%s: every selected ref is compatible and reaches the brief', (worldId) => {
    const { base, generated } = run(worldId, SOURCES[0][1]);
    if (generated.status !== 'GENERATED') return; // gate refusals are covered below
    const brief = generated.agentBrief ?? '';
    const world = DATA.worlds.find((w) => w.id === worldId)!;

    for (const refId of base.selectedRefIds as string[]) {
      const ref = DATA.refs.find((r) => r.id === refId);
      if (!ref || !refCompatibleWithWorld(ref, world.id)) continue; // suppressed by the world lock, by design
      // The ref is the reason Mami picked it. If it does not reach the brief, the agent
      // authoring from that brief never learns it exists.
      expect(brief, `${worldId}: ref ${refId} selected in the recipe never reaches final_brief.md`)
        .toContain(ref.name);
    }
  });
});

// ── 2. FINAL BRIEF — what the agent obeys must match what the engine receives ──────
describe('FAZ 1 · FINAL BRIEF', () => {
  it.each(DATA.worlds.map((w) => [w.id] as const))('%s: brief is whole, lawful and not a form letter', (worldId) => {
    const { world, base, generated } = run(worldId, SOURCES[1][1]);
    if (generated.status !== 'GENERATED') return;
    const brief = generated.agentBrief ?? '';

    // final_brief.md is the SOLE home of the authority order — the .command says so and
    // deliberately does not restate it. An empty brief does not weaken the law, it deletes it.
    expect(brief.length, `${worldId}: empty brief`).toBeGreaterThan(600);
    expect(brief.toLowerCase()).toContain(String(AUTHORITY_HIERARCHY[0]).toLowerCase().slice(0, 6));

    // The brief printed the RAW ref-DNA light while the prompt printed the RESOLVED one:
    // a Toei open-sea world was told "warm motivated key with a named source (window, lamp)".
    // The agent must read the light that actually governs the frame.
    const register = registerOf(String(base.projectClass));
    // pure.ts gates refs through the world lock before building the DNA — an incompatible ref
    // is SUPPRESSED, not genericised. Rebuilding the DNA without that gate compares the brief
    // against a directive the site never produced.
    const refs = (base.selectedRefIds as string[])
      .map((id) => DATA.refs.find((r) => r.id === id))
      .filter((r): r is NonNullable<typeof r> => Boolean(r))
      .filter((r) => refCompatibleWithWorld(r, world.id));
    const dna = dnaDirectives(refs, register);
    if (dna.light) {
      expect(brief, `${worldId}: brief prints a light directive the engine never receives`)
        .toContain(resolveLightAuthority(dna.light, world));
    }

    // The dossier must carry the decisions the SITE made, or five scenes read as one.
    expect(brief).toContain('YOU AUTHOR THE DOMINANT ELEMENT');
    expect(brief, `${worldId}: dossier carries no per-shot phase`).toMatch(/\nPHASE: /);
    expect(brief, `${worldId}: dossier carries no per-shot composition`).toMatch(/\nCOMPOSITION: /);
    for (const scene of generated.scenes) {
      expect(brief, `${worldId}: scene ${scene.id} source missing from the dossier`)
        .toContain(scene.id.toString());
    }
  });

  it('a long source produces genuinely different shots, not one shot five times', () => {
    const { generated } = run('pixar_3d_edu', SOURCES[1][1]);
    const brief = generated.agentBrief ?? '';
    const compositions = [...brief.matchAll(/\nCOMPOSITION: (.+)/g)].map((m) => m[1]);
    expect(compositions.length).toBeGreaterThan(3);
    // Composition monotony was a real defect: symmetry-locked worlds fell back to ONE pattern.
    expect(new Set(compositions).size, 'every shot got the same composition pattern').toBeGreaterThan(1);
  });
});

// ── 3. COMMAND — the package the agent runs ───────────────────────────────────────
describe('FAZ 1 · COMMAND', () => {
  it.each(DATA.worlds.map((w) => [w.id] as const))('%s: package is complete and the frame gate reaches it', (worldId) => {
    const { base, generated } = run(worldId, SOURCES[0][1]);
    if (generated.status !== 'GENERATED') return;
    const state = { ...base, scenes: generated.scenes, agentBrief: generated.agentBrief ?? '' };
    const pack = buildProductionExport(state as never) as unknown as {
      production: Record<string, unknown>;
      scenes: Array<{ prompts: { motion: unknown; motionDraft: unknown } }>;
    };
    const gate = pack.production.frameGate as { checklist: string[]; blocks: string };

    expect(gate?.checklist?.length ?? 0, `${worldId}: no frame gate`).toBeGreaterThan(4);
    expect(gate.blocks).toMatch(/motion\/<id>\.txt/);
    expect(JSON.stringify(pack.production)).toContain('FRAME_PASS');

    // Motion is a DATA gate, not a wish: a final motion prompt may not exist before a frame.
    for (const scene of pack.scenes) {
      expect(scene.prompts.motion, `${worldId}: motion shipped without an approved frame`).toBeNull();
      expect(scene.prompts.motionDraft).toBeTruthy();
    }
  });

  it('the exported command never ships a work title as a positive instruction', () => {
    // Four sibling fields leaked this in turn: anchor → refDna → referenceDNA.refs[] →
    // handoff.refDNAs[]. The scrub now happens once, at the data door.
    for (const [worldId, refId] of [
      ['pixar_3d_edu', 'soul'],
      ['deakins_naturalist', 'mad_max_chaos_cam'],
      ['spiderverse_sony', 'spiderverse_graphic'],
      ['arcane_fortiche', 'arcane_texture'],
    ] as const) {
      const { base, generated } = run(worldId, SOURCES[0][1], { selectedRefIds: [refId] });
      if (generated.status !== 'GENERATED') continue;
      const doc = buildCommandJSON({
        ...base, selectedRefIds: [refId], scenes: generated.scenes, agentBrief: generated.agentBrief ?? '',
      } as never) as Record<string, unknown>;

      const labels = [
        (doc.locks as Record<string, string>).worldName,
        (doc.locks as Record<string, string>).projectName,
      ].filter(Boolean);
      const walk = (value: unknown, key: string): string[] => {
        if (['negative_lock', 'avoid', 'name', 'worldName', 'paletteName', 'projectName'].includes(key)) return [];
        if (typeof value === 'string') {
          const stripped = labels.reduce((acc, l) => acc.split(l).join(' '), value)
            .split(/[.;\n]/).filter((c) => !/\b(NO|no|never|avoid|forbid)\b/.test(c)).join('. ');
          return containsWorkTitle(stripped) ? [`${key}`] : [];
        }
        if (Array.isArray(value)) return value.flatMap((v) => walk(v, key));
        if (value && typeof value === 'object') {
          return Object.entries(value).flatMap(([k, v]) => walk(v, k));
        }
        return [];
      };
      expect(walk(doc, 'doc'), `${worldId} + ${refId}: work title shipped in the package`).toEqual([]);
    }
  });
});

// ── 4. THE PROMPT the engine actually reads ───────────────────────────────────────
describe('FAZ 1 · PROMPT PURITY (every world × every source shape)', () => {
  const CASES = DATA.worlds.flatMap((w) => SOURCES.map(([label, text]) => [w.id, label, text] as const));

  it.each(CASES)('%s × %s', (worldId, _label, text) => {
    const { generated } = run(worldId, text);
    if (generated.status !== 'GENERATED') return;

    for (const scene of generated.scenes) {
      const pos = positiveHalf(scene.imagePrompt);
      expect(HEX.test(pos), `scene ${scene.id}: raw hex reached the prompt`).toBe(false);
      // protectedTermsIn is the GATE list, not the scoring list: it drops the words that live
      // double lives in ordinary Turkish and in science. "cell" is Dragon Ball's Cell AND a
      // biological cell — a scoring false positive is cheap, a blocked biology world is not.
      expect(protectedTermsIn(pos), `scene ${scene.id}: protected franchise term`).toEqual([]);
      expect(containsWorkTitle(pos), `scene ${scene.id}: work title`).toBe(false);
      expect(EMPTY_ADJ.test(pos), `scene ${scene.id}: empty adjective as a positive order`).toBe(false);
      expect(scene.imagePrompt.length, `scene ${scene.id}: no prompt`).toBeGreaterThan(200);

      // A clean plate must not also hand the engine a recipe for lettering.
      if (!scene.onScreenText) {
        expect(scene.imagePrompt).toContain('clean plate');
        expect(/Turkish label only\s*[—-]/i.test(scene.imagePrompt),
          `scene ${scene.id}: clean plate declared, lettering recipe shipped`).toBe(false);
      }
    }
  });

  it('a source that teaches a human action may SHOW it, anonymously', () => {
    const { generated } = run('pixar_3d_edu', SOURCES[2][1]);
    const prompt = generated.scenes[0].imagePrompt;
    // Castless bans an invented IDENTITY, not a body — a banned body turned "stand by the
    // window" into an empty window and the lesson vanished.
    expect(prompt).toContain('No named or identifiable person');
    expect(prompt).toMatch(/anonymous body/i);
  });

  it("the client's own brand survives its own advertisement", () => {
    const { generated } = run('product_brand_real', 'Araba sessizce süzülür. Ekran yolu çizer. Kapı kapanır.', {
      projectClass: 'PRODUCT_HERO',
      brandKitLock: 'Tesla — müşterinin kendi markası; logo ve gövde geometrisi dondurulmuş referans',
    });
    expect(generated.status).toBe('GENERATED');
    const prompt = generated.scenes[0].imagePrompt;
    // The firewall exists to stop SOMEONE ELSE's brand. Applied to the advertised thing it
    // made a branded ad impossible — which is most of what Mami is paid to make.
    expect(prompt).toContain('Brand: LOCKED and approved');
    expect(prompt).toContain('Tesla');
    expect(prompt, 'the negative still forbids the very brand being advertised')
      .toMatch(/no logo or brand OTHER than the locked client brand/i);
  });
});

// ── 5. THE AGENT'S OWN COMPLAINTS ─────────────────────────────────────────────────
// Codex authored all twelve shots of the three real packages and reported what the brief
// could not give it. Every rule below is one of those complaints. They are the only defects
// in this file NOT found by reading the code — they were found by USING it.
describe('FAZ 1 · the authoring agent could not obey it', () => {
  it('no path orders a medium its own world forbids', () => {
    // ANIMATION_EDU's contract read "Tactile 3D world material" — and the path OUTRANKS the
    // world. So in one_piece_toei, whose render lock says "STRICT PURE 2D CEL, no 3D, no 2.5D",
    // the acceptance gate demanded 3D. The agent: "İkisi literal olarak aynı anda sağlanamaz."
    const twoDWorlds = DATA.worlds.filter((w) =>
      /strict pure 2d|no 3d\b|not a light falloff|printed color-block/i.test(String(w.render_law ?? '')));
    expect(twoDWorlds.length, 'no 2D worlds in the data — the guard would be vacuous').toBeGreaterThan(2);

    for (const path of DATA.paths ?? []) {
      const required = String((path as unknown as { required?: string }).required ?? '');
      expect(/\b3D\b/.test(required) && !/render lock decides|world's own medium/i.test(required),
        `${path.id}: the contract orders 3D, but this path also serves 2D worlds — the acceptance gate cannot be met there`,
      ).toBe(false);
    }
  });

  it('no acceptance gate demands the metaphor the ledger forbids', () => {
    // The gate asked for a "tactile metaphor" while the ledger's noMetaphorFor forbids replacing
    // a literal thing with a symbol. The agent had to choose which half of the brief to break.
    for (const path of DATA.paths ?? []) {
      const gate = ((path as unknown as { gate?: string[] }).gate ?? []).join(' ');
      expect(/\bmetaphor\b/i.test(gate),
        `${path.id}: acceptance gate asks for a metaphor while the ledger forbids one`).toBe(false);
    }
  });

  it("a locked client brand is not forbidden by the frame that must contain it", () => {
    const { base, generated } = run('product_brand_real', 'Araba süzülür. Ekran çizer. Kapı kapanır.', {
      projectClass: 'PRODUCT_HERO',
      brandKitLock: 'Tesla — müşterinin kendi markası',
    });
    expect(generated.status).toBe('GENERATED');
    const pack = buildProductionExport({
      ...base, scenes: generated.scenes, agentBrief: generated.agentBrief ?? '',
    } as never) as unknown as { production: Record<string, unknown> };
    const gate = pack.production.frameGate as { checklist: string[] };

    // The frame gate's IP row said "no real trademark" — so a CORRECTLY drawn Tesla frame would
    // have been auto-rejected by the very gate meant to protect it.
    const ipRow = gate.checklist.find((row) => /IP FIREWALL/i.test(row)) ?? '';
    expect(ipRow, 'the gate would fail a correct frame of the advertised brand')
      .toMatch(/EXCEPT the client brand locked/i);

    // And the world's own negative must not ban it either.
    const prompt = generated.scenes[0].imagePrompt;
    expect(prompt).toContain('Brand: LOCKED and approved');
    expect(/NO named real brands, products or logos\b/i.test(prompt),
      'the world negative still bans the brand being advertised').toBe(false);
  });

  it('the package demands the reference an "exact geometry" order cannot live without', () => {
    // "Render its logo and geometry EXACTLY, never from memory" — with no reference image in
    // the package. The agent: "Bu, yalnız metinle yapılabilecek bir kilit değil."
    const { base, generated } = run('product_brand_real', 'Araba süzülür. Kapı kapanır.', {
      projectClass: 'PRODUCT_HERO', brandKitLock: 'Tesla',
    });
    const pack = buildProductionExport({
      ...base, scenes: generated.scenes, agentBrief: generated.agentBrief ?? '',
    } as never) as unknown as { production: Record<string, unknown> };
    const contract = pack.production.folderContract as Record<string, string>;
    const scaffold = (pack.production.scaffold as string[]).join(' ');

    expect(Object.keys(contract), 'no place for Mami to put the approved brand reference')
      .toContain('brand_refs/');
    expect(scaffold, 'the agent is never told to check its inputs before authoring')
      .toMatch(/REFERENCE REQUIRED/);
  });
});

// ── 6. THE FAILURE THE NEGATIVES NEVER CHASED ─────────────────────────────────────
describe('FAZ 1 · meaning, not just material', () => {
  it.each(DATA.worlds.map((w) => [w.id] as const))('%s: the prompt forbids answering a concept with its icon', (worldId) => {
    const { generated } = run(worldId, SOURCES[0][1]);
    if (generated.status !== 'GENERATED') return;
    // Both authoring agents hit this independently: the negatives chased MATERIAL failure
    // (morph, plastic skin, warped text) and never MEANING failure. Hardness comes back as a
    // ruler, time as an hourglass, silence as a sound wave, commemoration as a torch — a clean
    // frame that teaches nothing. The ledger names it per shot; this is the site's half.
    // Two shapes of the same law. In most worlds the danger is the concept ANSWERED by its icon
    // (hardness → a ruler). In a world whose medium IS the diagram (whiteboard, motion-design),
    // banning icons would forbid its own instrument — there the danger inverts: the drawing must
    // still show the real mechanism, not decorate around it.
    expect(generated.scenes[0].imagePrompt, `${worldId}: nothing stops the engine drawing the icon instead of the thing`)
      .toMatch(/replaced by a symbol for it|decoration standing in for the mechanism/i);
  });

  it('every shot after the first is told what to carry, and the first is told it establishes', () => {
    const { generated } = run('pixar_3d_edu', SOURCES[1][1]);
    const brief = generated.agentBrief ?? '';
    // Continuity lived only inside the agent's own ledger — the brief never asked one shot to
    // hold anything from the last. A cut dies on what changed BETWEEN frames.
    expect(brief).toMatch(/CARRY OVER: none — this shot ESTABLISHES/);
    expect(brief).toMatch(/CARRY OVER from shot 1:/);
    const carries = [...brief.matchAll(/CARRY OVER/g)].length;
    expect(carries, 'not every shot carries a continuity line').toBe(generated.scenes.length);
  });
});

// ── 7. THE SOURCE OWNS THE CLOCK ──────────────────────────────────────────────────
describe('FAZ 1 · a night beat may not be lit by the sun', () => {
  const NIGHT_SOURCE = [
    'O gece şehir uyumadı; pencereler tek tek aydınlandı.',
    'Karanlıkta insanlar sokağa indi.',
    'Sabah olduğunda hayat kaldığı yerden başladı.',
  ].join('\n');

  // 12 of 39 worlds carry a light law that only knows daylight — sun, overcast, window,
  // softbox. Given "O gece", the palette still ordered "low directional sun rakes the stone".
  // The engine cannot obey a night that is lit by the sun, so it picks one and the beat dies.
  // The world owns the QUALITY of light. The source owns the CLOCK.
  const DAY_ONLY = DATA.worlds.filter((w) => {
    const law = `${w.light_law ?? ''} ${w.render_law ?? ''}`;
    return !/\bnight|nocturnal|moonlight|streetlamp|sodium|after dark|lamplight|candle|torch/i.test(law)
      && /\bsun\b|daylight|overcast|window light|softbox/i.test(law);
  });

  it('the guard is not vacuous', () => {
    // Five worlds under this exact filter; a wider scan of light_law alone finds twelve.
    expect(DAY_ONLY.length).toBeGreaterThanOrEqual(4);
  });

  it.each(DAY_ONLY.map((w) => [w.id] as const))('%s: a night beat gets a night-motivated key', (worldId) => {
    const { generated } = run(worldId, NIGHT_SOURCE);
    if (generated.status !== 'GENERATED') return;
    const prompt = generated.scenes[0].imagePrompt;
    expect(prompt, `${worldId}: the source says night and nothing tells the engine so`)
      .toMatch(/NIGHT BEAT/i);
    // and the daytime sun must not still be ordered in the same breath
    const pos = positiveHalf(prompt);
    expect(/\b(low|warm|high)?\s*(directional\s+)?sun\b(?!set|rise)/i.test(pos)
      && !/night/i.test(pos), `${worldId}: a daylight sun survives into a night frame`).toBe(false);
  });
});

// ── 8. THE WORLD SUGGESTS, THE CAST DECIDES ───────────────────────────────────────
describe('FAZ 1 · a world example is not a casting instruction', () => {
  it('an authored cast outranks the people the world law names as examples', () => {
    // civic_promo_real's render lock names "a veteran's steady salute" as an example of its
    // register. Copied verbatim into a prompt whose cast says "kimse üniformalı değil", it was
    // whispering the forbidden thing to the engine.
    const world = DATA.worlds.find((w) => w.id === 'civic_promo_real')!;
    expect(String(world.render_law), 'the data no longer names an example subject — this guard is moot')
      .toMatch(/a veteran/i);

    const { generated } = run('civic_promo_real', 'İnsanlar meydanda durdu. Sabah kaldırımlar temizlendi.', {
      projectClass: 'LIVE_ACTION_CORPORATE',
      cast: 'Sıradan esnaf ve bir çocuk, gündelik kıyafet — kimse üniformalı değil',
    });
    expect(generated.status).toBe('GENERATED');
    const prompt = generated.scenes[0].imagePrompt;
    expect(prompt).toContain('Cast authority');
    expect(prompt, 'nothing tells the engine the world\'s example is not a casting order')
      .toMatch(/never a casting instruction/i);
  });

  it('with no cast, no cast-authority clause is emitted', () => {
    const { generated } = run('pixar_3d_edu', SOURCES[0][1]);
    expect(generated.scenes[0].imagePrompt).not.toContain('Cast authority');
  });
});

// ── 9. THE POOLS MUST ASK THE WORLD ───────────────────────────────────────────────
// The closing check (Codex, reading eight briefs as the agent who must obey them) found the
// same class in every package: the camera pool, the composition pool and the light-variant
// pool were chosen without ever consulting the world's own render lock. The world IS the lock.
describe('FAZ 1 · a pool may not override the render lock', () => {
  it('a locked-camera world is never handed a dolly, a creep or a parallax edge', () => {
    // whiteboard: "Locked flat-on camera facing the board, no camera move" · "NO SCENERY beyond
    // the board itself" — and it was handed "85mm tactile macro creep" and "frame within frame:
    // an aperture already in the scene (window, shelf gap, arch, doorway)".
    const { generated } = run('whiteboard_explainer', SOURCES[1][1]);
    expect(generated.status).toBe('GENERATED');
    for (const scene of generated.scenes) {
      const p = scene.imagePrompt;
      const cam = p.match(/Camera\/vantage: ([^.]+)\./)?.[1] ?? '';
      expect(/dolly|creep|push|travel|parallax/i.test(cam),
        `scene ${scene.id}: a locked-camera world was handed a moving camera — "${cam}"`).toBe(false);
      expect(/aperture already in the scene|window, shelf gap, arch, doorway/i.test(p),
        `scene ${scene.id}: a world with no scenery was handed an aperture in the scenery`).toBe(false);
    }
  });

  it('no camera outruns the focal band the world names', () => {
    // pixar's lens grammar: "35mm to 50mm equivalent" — it was handed "85mm tactile macro creep".
    for (const worldId of ['pixar_3d_edu', 'chivo_naturalist_handheld']) {
      const world = DATA.worlds.find((w) => w.id === worldId)!;
      const band = String(world.lens_grammar ?? '').match(/(\d{2})\s*mm\s*(?:to|-|–)\s*(\d{2,3})\s*mm/i);
      if (!band) continue;
      const [lo, hi] = [Number(band[1]), Number(band[2])];
      const { generated } = run(worldId, SOURCES[1][1]);
      if (generated.status !== 'GENERATED') continue;
      for (const scene of generated.scenes) {
        const cam = scene.imagePrompt.match(/Camera\/vantage: ([^.]+)\./)?.[1] ?? '';
        const f = cam.match(/(\d{2,3})\s*mm/i);
        if (!f) continue;
        expect(Number(f[1]) >= lo && Number(f[1]) <= hi,
          `${worldId} scene ${scene.id}: ${f[1]}mm is outside the world's own ${lo}-${hi}mm law`).toBe(true);
      }
    }
  });

  it('the continuity line does not fight the light variant in the same prompt', () => {
    // My own hole: CARRY OVER said "its light DIRECTION stays the SAME" while the same shot's
    // LIGHT VARIANT said "motivate the key from the opposite side". Both, in one brief.
    const { generated } = run('pixar_3d_edu', SOURCES[1][1]);
    const brief = generated.agentBrief ?? '';
    expect(brief, 'the brief still freezes the light direction it also asks to move')
      .not.toMatch(/its light direction[^.]*stay the SAME/i);
    expect(brief).toMatch(/its direction may move/i);
  });

  it('a flat-light world is not handed a light variant in the brief either', () => {
    const { generated } = run('ukiyo_e_print', SOURCES[1][1]);
    if (generated.status !== 'GENERATED') return;
    expect(generated.agentBrief ?? '', 'a world with no key was told to vary its key')
      .not.toMatch(/\nLIGHT VARIANT: /);
  });
});

// ── 9b. THE LIGHT LAW MUST SPEAK ONCE ─────────────────────────────────────────────
//
// Paid for in real output. FAZ5-PILOT-R2 shipped 14 packages and the light law contradicted
// itself in two different ways, inside single files:
//
//   · tesla · project.json → scenes[0].prompts.image, ONE string:
//       "There is never a key aimed AT the paint"                       (automotive world law)
//       "Light variant: trade the key one stop softer and let the
//        accent colour carry the subject edge"                          (the pool)
//     The pool softened a key the world does not have and painted a rim onto a body whose every
//     highlight must be a REFLECTED source. The world's own words for that result: "a hot spot
//     and a dead panel". The customer's car comes back ugly and no one can name the clause.
//
//   · dokuma · final_brief.md, SAME FILE: "NO rim light" · "NO fill, NO bounce card, NO rim" ·
//     "rather than being rescued by a rim" — and then "LIGHT VARIANT: ... let the accent colour
//     carry the subject edge", which is a rim under another name.
//
// These gates read the SURGEON'S data (light_law + negative_lock, which brain.ts does not
// author) on the left and the REAL generateBatch prompt on the right. They are doors, not
// mirrors: brain.ts's own predicates are never consulted here, so if the gate is deleted,
// loosened, or a new world arrives whose law the pool cannot obey, this goes red.
describe('FAZ 1 · the light law speaks once, and the pool does not answer back', () => {
  /** The pool's two orders, and what each one demands of the world before it may be given. */
  const ORDERS_A_RIM = /accent colour carry the subject edge/i;
  const ORDERS_A_REAIM = /shadow mass lead the composition/i;

  /** Read from the world's OWN text — never from brain.ts. */
  const worldText = (w: Record<string, unknown>) => [
    w.render_law, w.light_law,
    Array.isArray(w.negative_lock) ? (w.negative_lock as string[]).join(' ') : w.negative_lock,
  ].filter(Boolean).join(' ');

  /** The pool's contribution to this prompt — NOT the world law the prompt also quotes. */
  const variantOf = (prompt: string) =>
    prompt.match(/Light variant:([\s\S]*?)(?= Time-of-day mandate:| Palette physics:)/)?.[1] ?? '';

  it('no world is ordered to make a light its own negative_lock forbids', () => {
    let checked = 0;
    for (const world of DATA.worlds) {
      const { generated } = run(world.id, SOURCES[1][1]);
      if (generated.status !== 'GENERATED') continue;
      const law = worldText(world as unknown as Record<string, unknown>);

      // The surgeon wrote these prohibitions. The pool must not step over them.
      const forbidsRim = /\bno rim\b|no rim[- ]light|no rim added|rim[- ]light as decoration|rescued by a rim/i.test(law);
      const forbidsColouredLight = /no coloured light/i.test(law);
      // Every way the SURGEON says "the key is not yours" — read from the world text, listed
      // independently of brain.ts's own predicate. An earlier draft of this line copied the
      // gate's phrase list, inherited its blind spot, and stayed green while jjk_mappa ("Key
      // light is often absent") and synthwave_retro_80s ("Anti-physical by law") were both
      // being ordered to "trade the key one stop softer". A door built from the implementation's
      // own judgment is a mirror; this list is built from the data instead.
      const hasNoAimedKey = new RegExp([
        'never a key aimed at',            // automotive — the body is a mirror
        'the environment is the light',    // automotive
        'available light only',            // nature_doc, archival
        'the stock cannot cope',           // archival
        'key light is often absent',       // jjk — rim-dominant
        'anti-physical by law',            // synthwave — the sunset gradient IS the light
        'light lives in pigment density',  // watercolor — no key at all
        'sky is the primary light source', // one_piece
        'the sun is almost always low',    // shinkai
        'transmitted illumination from below', // science_viz — the instrument, not the author
      ].join('|'), 'i').test(law);
      const forbidsDramaticShadow = /dramatic shadow is forbidden|no dramatic chiaroscuro|no high contrast/i.test(law);
      const isFlat = /no directional lighting simulation|no directional shadow|flat even board illumination/i
        .test(String(world.light_law ?? ''));

      for (const scene of generated.scenes) {
        const variant = variantOf(scene.imagePrompt);
        checked++;

        if (isFlat) {
          expect(variant, `${world.id} scene ${scene.id}: a world with NO KEY was handed a key to vary`).toBe('');
          continue;
        }
        if (forbidsRim || forbidsColouredLight) {
          expect(ORDERS_A_RIM.test(variant),
            `${world.id} scene ${scene.id}: its own law forbids a rim, and the pool ordered one — "${variant.trim()}"`).toBe(false);
        }
        if (hasNoAimedKey) {
          expect(/trade the key one stop softer/i.test(variant),
            `${world.id} scene ${scene.id}: its own law says no key is aimed at the subject, and the pool ordered that key softened — "${variant.trim()}"`).toBe(false);
        }
        if (forbidsDramaticShadow) {
          expect(ORDERS_A_REAIM.test(variant),
            `${world.id} scene ${scene.id}: its own law forbids a dramatic shadow, and the pool told the shadow mass to LEAD — "${variant.trim()}"`).toBe(false);
        }
      }
    }
    expect(checked, 'the gate ran on nothing — the harness, not the worlds, is broken').toBeGreaterThan(100);
  });

  it('a world whose pool has nothing legal is given a legal move, not silence', () => {
    // Gece-5's lesson, applied to light: a world must be handed a move it CAN obey, because an
    // author left with no light line invents one. automotive_hero_real can obey neither variant.
    const { generated } = run('automotive_hero_real', SOURCES[1][1]);
    expect(generated.status).toBe('GENERATED');
    const variants = generated.scenes.map((s) => variantOf(s.imagePrompt)).filter(Boolean);
    expect(variants.length, 'the car world was left with no light line at all').toBeGreaterThan(0);
    for (const v of variants) {
      expect(v).toMatch(/HOLD/);
      expect(v).toMatch(/add nothing, soften nothing, re-aim nothing/i);
      expect(ORDERS_A_RIM.test(v)).toBe(false);
    }
  });

  it('the brief and the image prompt carry the SAME light decision in every scene', () => {
    // Bulgu B, measured off the pilot before the fix: 9 of 32 scenes (28%) disagreed — the brief
    // ordered a light the prompt had already refused, because pure.ts re-derived the variant from
    // the ungated pool while buildImagePrompt read it through the world gate. One decision printed
    // into two artefacts with two different values, and NO RULE anywhere said which file wins.
    let compared = 0;
    let disagreed = 0;
    for (const world of DATA.worlds) {
      const { generated } = run(world.id, SOURCES[1][1]);
      if (generated.status !== 'GENERATED') continue;
      const brief = generated.agentBrief ?? '';
      // The brief's per-shot LIGHT VARIANT lines, in dossier order.
      const briefVariants = [...brief.matchAll(/^LIGHT VARIANT: (.+)$/gm)].map((m) => m[1].trim());
      const promptVariants = generated.scenes
        .map((s) => variantOf(s.imagePrompt).trim().replace(/\.$/, ''))
        .filter(Boolean);
      expect(briefVariants.length,
        `${world.id}: the brief printed ${briefVariants.length} light variants, the prompts ${promptVariants.length}`)
        .toBe(promptVariants.length);
      briefVariants.forEach((bv, i) => {
        compared++;
        const pv = promptVariants[i] ?? '';
        if (bv.replace(/\.$/, '') !== pv) disagreed++;
      });
    }
    expect(compared, 'nothing was compared — the harness is broken').toBeGreaterThan(50);
    expect(disagreed, 'the brief and the prompt gave different light orders for the same shot').toBe(0);
  });
});

// ── 10. THE CLOCK BELONGS TO THE SEQUENCE ─────────────────────────────────────────
describe('FAZ 1 · a night does not end because the sentence stopped saying so', () => {
  const NIGHT_RUN = [
    'O gece şehir uyumadı; pencereler tek tek aydınlandı.',   // sets the clock
    'İnsanlar sokağa indi; kimse birbirini tanımıyordu.',      // still that night, says nothing
    'Sabah olduğunda kaldırımlar temizlendi.',                 // brings the day back
  ].join('\n');

  it('night is carried across shots until a beat brings the day back', () => {
    const { generated } = run('civic_promo_real', NIGHT_RUN, {
      projectClass: 'LIVE_ACTION_CORPORATE', cast: 'Sıradan insanlar, gündelik kıyafet',
    });
    expect(generated.status).toBe('GENERATED');
    const prompts = generated.scenes.map((s) => s.imagePrompt);
    // Shot 2 says nothing about the dark — a lexical, shot-local test lit it by the midday sun.
    expect(prompts[0]).toMatch(/NIGHT BEAT/);
    if (prompts.length > 1) expect(prompts[1], 'the night ended because the sentence stopped saying "gece"').toMatch(/NIGHT BEAT/);
    const morning = prompts[prompts.length - 1];
    expect(morning, 'the morning beat is still being lit as night').not.toMatch(/NIGHT BEAT/);
  });

  it('the palette does not order a sun into a night frame', () => {
    const { generated } = run('civic_promo_real', NIGHT_RUN, {
      projectClass: 'LIVE_ACTION_CORPORATE', cast: 'Sıradan insanlar',
    });
    // frameGate judges the pixels against this exact palette string. "Low directional sun rakes
    // the stone" in a night frame fails the very gate meant to protect it.
    const nightPrompt = generated.scenes[0].imagePrompt;
    const palette = nightPrompt.match(/Palette physics: ([^\n]+?)(?= Texture rule:|$)/)?.[1] ?? '';
    expect(/\b(sun|sunlit|daylight|midday)\b/i.test(palette),
      `the palette still rakes a night frame with sunlight: "${palette.slice(0, 90)}"`).toBe(false);
  });

  it("a locked brand's own wordmark is not banned as foreign signage", () => {
    const { generated } = run('product_brand_real', 'Araba süzülür. Kapı kapanır.', {
      projectClass: 'PRODUCT_HERO', brandKitLock: 'Tesla — müşterinin kendi markası',
    });
    const p = generated.scenes[0].imagePrompt;
    expect(p).toContain('Brand: LOCKED and approved');
    // "Render the Tesla wordmark exactly" and "NO English signage — Turkish label only" were in
    // the same prompt: the exception reached the IP row and the frame gate, never this line.
    expect(/NO English signage\s*[—-]\s*Turkish label only|Turkish label only\s*[—-][^;]*NO English signage/i.test(p),
      'the prompt bans the wordmark it also orders').toBe(false);
  });
});

// ── 11. ONE FRAME HOLDS ONE EVENT ─────────────────────────────────────────────────
describe('FAZ 1 · a beat with four events is not one shot', () => {
  it('counts the events a beat actually names', () => {
    expect(countEvents('Kap kaynar.')).toBe(1);
    // Both closing agents hit these two beats and both had to invent the priority themselves.
    expect(countEvents('Sertliklerini karşılaştırmak için sürterler: elmas her şeyi çizer, talk tırnakla dağılır.'))
      .toBeGreaterThan(1);
    expect(countEvents('Magma yavaş soğursa kristaller büyür, hızlı soğursa küçücük kalır.'))
      .toBeGreaterThan(1);
  });

  it('a multi-event beat is told the frame turns on ONE, and nothing is dropped', () => {
    // The split only ever looked at DURATION — a 7.5s beat with four events sailed through as a
    // single shot, and the I2V law ("one moving element, one cause-effect-settle") was broken
    // silently. The site does not pick WHICH event survives; it states the count and the rule.
    const { generated } = run('pixar_3d_edu',
      'Elmas her şeyi çizer, talk tırnakla dağılır. Kap kaynar.');
    const multi = generated.scenes[0].imagePrompt;
    expect(multi).toMatch(/EVENT BUDGET: this beat names \d+ separate events/);
    expect(multi).toMatch(/only one is HAPPENING/);
    expect(multi, 'the site must not drop an event to make the frame easy').toMatch(/do not drop any/i);
  });

  it('a single-event beat is not lectured about a budget it does not need', () => {
    const { generated } = run('pixar_3d_edu', 'Kap kaynar. Buhar yükselir. Damla düşer.');
    expect(generated.scenes[0].imagePrompt).not.toMatch(/EVENT BUDGET/);
  });
});

// ── 12. THE SECOND DOOR INTO THE SAME ROOM ────────────────────────────────────────
describe('FAZ 1 · the world law holds at every door', () => {
  it('a board world is never told the light travels', () => {
    // The pool gate removed it — and applyWorldCameraLaw, which runs AFTER, picked from its own
    // static pool and handed the same order straight back ("the camera never moves, the light
    // does") into a world whose law reads "Flat even board illumination, no directional shadow".
    // A fix that looks applied while doing nothing is worse than no fix.
    const { generated } = run('whiteboard_explainer', SOURCES[1][1]);
    expect(generated.status).toBe('GENERATED');
    for (const scene of generated.scenes) {
      expect(/the light (?:does|moves)/i.test(scene.imagePrompt),
        `scene ${scene.id}: a flat-lit board world was told its light travels`).toBe(false);
    }
  });

  it('carryOver does not freeze the clock the source just moved', () => {
    const { generated } = run('civic_promo_real',
      'O gece şehir uyumadı. İnsanlar sokağa indi. Sabah olduğunda kaldırımlar temizlendi.', {
        projectClass: 'LIVE_ACTION_CORPORATE', cast: 'Sıradan insanlar',
      });
    const brief = generated.agentBrief ?? '';
    // "Sabah olduğunda" moves the clock; a carryOver line ordering the time of day to "stay the
    // SAME" forced the agent to break either the source or the continuity.
    expect(brief).toMatch(/its time of day CHANGES here \(night → day\)/);
  });

  it('the brief warns that a night shot does not obey the palette daylight half', () => {
    const { generated } = run('civic_promo_real', 'O gece şehir uyumadı. Sabah oldu.', {
      projectClass: 'LIVE_ACTION_CORPORATE', cast: 'Sıradan insanlar',
    });
    // §5 is written once for the whole piece and still ordered a sun. The agent obeys §5 for
    // every shot, so a night frame was being lit by it.
    expect(generated.agentBrief ?? '').toMatch(/Some shots below are NIGHT BEATS/);
  });

  it('a castless frame is not handed a face to fill', () => {
    const { generated } = run('one_piece_toei', 'Kuvars sütunlar hâlinde büyür. Tuz küp küp dizilir.');
    if (generated.status !== 'GENERATED') return;
    // "intimate focal compression: face fills the emotional center" — onto a mineral, with an
    // empty cast, pushing a geology object into another register's portrait staging.
    expect(generated.agentBrief ?? '', 'the brief hands a castless mineral shot a portrait framing')
      .not.toMatch(/face fills the emotional cent/i);
  });

  it('a car is not asked for stable packaging', () => {
    const path = (DATA.paths ?? []).find((p) => p.id === 'PRODUCT_HERO');
    const gate = ((path as unknown as { gate?: string[] })?.gate ?? []).join(' ');
    expect(/^|\s- packaging stable\s|$/.test(gate) && /\bpackaging stable\b/.test(gate),
      'the acceptance gate demands packaging from a product that has none').toBe(false);
  });
});

// ── 13. THE GATE MUST NOT FAIL A CORRECT FRAME ────────────────────────────────────
describe('FAZ 1 · the frame gate reads the same clock the prompt does', () => {
  it('a night scene ships a night palette to the gate, a morning scene ships a sun', () => {
    // The image prompt strips the daylight sun from a night beat. scenes[].paletteLight — the
    // field the FRAME GATE compares the pixels against — did not. So the agent would produce a
    // correct night frame and then reject it at its own gate. A gate that fails a correct frame
    // is worse than no gate: it costs a production day and teaches the wrong lesson.
    const { base, generated } = run('civic_promo_real',
      'O gece şehir uyumadı. İnsanlar sokağa indi. Sabah olduğunda kaldırımlar temizlendi.', {
        projectClass: 'LIVE_ACTION_CORPORATE', cast: 'Sıradan insanlar',
      });
    expect(generated.status).toBe('GENERATED');
    const pack = buildProductionExport({
      ...base, scenes: generated.scenes, agentBrief: generated.agentBrief ?? '',
    } as never) as unknown as { production: { sceneIndex: Array<{ id: number; paletteLight: string }> } };

    const index = pack.production.sceneIndex;
    const SUN = /\b(sun|sunlit|daylight|midday)\b/i;
    expect(SUN.test(index[0].paletteLight), 'the gate judges a night frame against sunlight').toBe(false);
    // …and the morning shot keeps its sun: the scrub follows the clock, it does not delete it.
    const morning = index[index.length - 1];
    expect(morning.paletteLight.length).toBeGreaterThan(20);
  });
});

// ── 14. TEMPLATE RESIDUE FROM THE REGISTER IT WAS WRITTEN IN ──────────────────────
describe('FAZ 1 · a world is never handed another register\'s matter', () => {
  it.each(DATA.worlds.map((w) => [w.id] as const))('%s: no product-register material list', (worldId) => {
    const { generated } = run(worldId, SOURCES[0][1]);
    if (generated.status !== 'GENERATED') return;
    // The castless note ended with "(metal specular, glass refraction, water and vapour, painted
    // bodywork, product finish)" — a PRODUCT list, pasted into every castless prompt in every
    // world. A strict 2D-cel mineral shot was ordered to render glass refraction; a phospholipid
    // bilayer was ordered to have a product finish. The world already says what its matter is.
    for (const scene of generated.scenes) {
      expect(/painted bodywork|product finish/i.test(scene.imagePrompt),
        `${worldId} scene ${scene.id}: a product-register material list reached a world that has none`).toBe(false);
    }
  });

  it('a microscope has no window, an engine section has no doorway', () => {
    for (const worldId of ['science_viz_real', 'technical_cutaway']) {
      const { generated } = run(worldId, SOURCES[1][1]);
      if (generated.status !== 'GENERATED') continue;
      for (const scene of generated.scenes) {
        expect(/aperture already in the scene|window, shelf gap, arch, doorway/i.test(scene.imagePrompt),
          `${worldId} scene ${scene.id}: an architectural aperture was invented for a world with no architecture`).toBe(false);
      }
    }
  });

  it('a heron is not shot on the lens reserved for insects', () => {
    // nature: "300-600mm for the animal at honest distance" · "100mm true macro at 1:1 for INSECT,
    // water and plant detail" · "A macro frame is entirely locked". The pool handed it "100mm
    // macro SLIDE" — the wrong lens AND a move that world forbids in macro. The focal-band regex
    // only read two-digit numbers, so "300-600mm" gated nothing at all.
    const { generated } = run('nature_doc_real', 'Balıkçıl sazlıkta durur. Sis kalkar. Baş iner.', {
      projectClass: 'DOCUMENTARY_REALISM',
    });
    if (generated.status !== 'GENERATED') return;
    for (const scene of generated.scenes) {
      const cam = scene.imagePrompt.match(/Camera\/vantage: ([^.]+)\./)?.[1] ?? '';
      expect(/100\s*mm macro.*(slide|dolly|push|creep)/i.test(cam),
        `scene ${scene.id}: a locked-macro world was handed a moving macro — "${cam}"`).toBe(false);
    }
  });

  it('a camera locked to head height is not handed a low vantage', () => {
    const { generated } = run('archival_newsreel', SOURCES[1][1], {
      projectClass: 'DOCUMENTARY_REALISM', cast: 'Bir esnaf, iş önlüğü',
    });
    if (generated.status !== 'GENERATED') return;
    for (const scene of generated.scenes) {
      const cam = scene.imagePrompt.match(/Camera\/vantage: ([^.]+)\./)?.[1] ?? '';
      expect(/\blow (?:angle|vantage|tracking|side)|frog-eye|from below/i.test(cam),
        `scene ${scene.id}: "at head height with the crowd" was handed "${cam}"`).toBe(false);
    }
  });

  it('a world that voids a frame for one anachronism must be TOLD the century', () => {
    // "if the century had no electricity, the frame has none" + "ONE anachronism voids the frame"
    // — with a source that names no century, no region and no craft. The agent: "Dönemi ben
    // seçersem zorunlu girdiyi icat etmiş olurum." Same class as a brand with no reference.
    const { generated } = run('period_reconstruction', 'Kandil yanar. El ipliği geçirir. Alev eğilir.', {
      projectClass: 'DOCUMENTARY_REALISM', cast: 'Bir dokumacı',
    });
    if (generated.status !== 'GENERATED') return;
    expect(generated.scenes[0].imagePrompt).toMatch(/PERIOD REQUIRED/);
    expect(generated.scenes[0].imagePrompt).toMatch(/Do NOT choose a period yourself/i);
  });

  it('…and stays quiet when the source DOES name one', () => {
    const { generated } = run('period_reconstruction',
      '17. yüzyıl Osmanlı Bursa\'sında kandil yanar. El ipliği geçirir.', {
        projectClass: 'DOCUMENTARY_REALISM', cast: 'Bir dokumacı',
      });
    if (generated.status !== 'GENERATED') return;
    expect(generated.scenes[0].imagePrompt).not.toMatch(/PERIOD REQUIRED/);
  });
});

  it('no composition pattern brings its own register\'s furniture', () => {
    // The gate caught "frame within frame — an aperture already in the scene (window, shelf gap,
    // arch, doorway)" and let three siblings through: "obstructed intimacy — a doorway sliver, a
    // glass edge", "loaded stillness — horizon geometry (poles, wires, roof edges)", "sculpted
    // time — one natural element (water plane, mist band)". A microscope specimen has no doorway,
    // a sectioned engine has no roof edge, a board has no mist band. Same lesson as the material
    // list: a pattern written in one register carries that register's furniture with it.
    const SET_FURNITURE = /doorway|shelf gap|roof edges|mist band|glass edge|aperture already in the scene/i;
    // ukiyo_e is NOT in this list: a woodblock print HAS a world — a wave, a horizon, a mist
    // band. It is flat-LIT, not set-LESS. The gate is about worlds with no architecture to
    // borrow from (a specimen, a section, a board), not about flatness.
    for (const worldId of ['science_viz_real', 'technical_cutaway', 'whiteboard_explainer']) {
      const { generated } = run(worldId, SOURCES[1][1]);
      if (generated.status !== 'GENERATED') continue;
      for (const scene of generated.scenes) {
        const positive = positiveHalf(scene.imagePrompt);
        expect(SET_FURNITURE.test(positive),
          `${worldId} scene ${scene.id}: a composition pattern invented a set this world does not have`).toBe(false);
      }
    }
  });
