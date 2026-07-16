import { describe, it, expect } from 'vitest';
import {
  registerOf, realFamilyOf, dnaDirectives, durationGuard,
  primeSuno, estimateSec, renderLock, primeCamera, primeShotPattern, buildAgentBrief, buildMotionPrompt,
  buildVariantBriefs, recommendReason, primePacket, buildRecipeMarkdown, buildRecipeMachine, recipeJsonFileName,
  eventSeed, mandateSeed, buildImagePrompt, paletteLightPrompt, splitTopLevelCommas, applyWorldCameraLaw,
  hexToLightWords, CAMERA_BAN_PHRASES, reconcileAspectRatio, camPool, lensBandsOf, gateCameraLens, SHOT_PATTERNS, type Concept,
} from './brain';
import { DATA, worldRenderText, type SurgeryRef, generateBatch, MOOD_OPTS } from './pure';
import { autoGroupBeats } from './source';
import { hasBankResidue } from './faz2_baseline.test';

// FAZ2: konsept motoru (conceptRanked/primeConcept + tüm bankalar) SÖKÜLDÜ. Site
// sahne öznesi/motion UYDURMAZ; buildImagePrompt her zaman verbatim kaynak beat +
// "Scene brief (Claude yazar)" basar, concept.subject/event ASLA gövdeye girmez.
const FW_CTX: any = {
  world: {}, register: 'EDU', dna: { staging: 'staging', light: 'light', texture: 'texture', avoid: 'avoid' },
  pathForbidden: '',
};
const BANK_LIKE: Concept = {
  subject: 'one oversized translucent leaf model with a visible inner channel',
  event: 'the leaf draws in one water drop and one beam of light',
  matched: true,
};
function frameFor(sourceBeat: string, register: 'EDU' | 'STY' | 'REAL' = 'EDU'): string {
  return buildImagePrompt(1, BANK_LIKE, '50mm dolly', { ...FW_CTX, register, sourceBeat });
}

describe('FAZ2 — konsept motoru söküldü: verbatim kaynak + Claude talimatı + banka izi yok', () => {
  it('realFamilyOf world→family eşlemesi korunur (banka gitse de kayıt anlamlı)', () => {
    expect(realFamilyOf('food_macro_real')).toBe('FOOD');
    expect(realFamilyOf('bilinmeyen_dunya')).toBe('PRODUCT');
  });

  // Eskiden conceptRanked/*_BANK'in "doğru banka öznesini seçtiğini" iddia eden
  // gerçek Türkçe kaynaklar. Yeni sözleşme: hangi kaynak olursa olsun (a) verbatim
  // geçer, (b) "Scene brief (Claude yazar)" taşır, (c) enjekte edilen banka öznesi
  // ASLA basılmaz, (d) hasBankResidue false.
  const SOURCES: Array<[string, 'EDU' | 'STY' | 'REAL']> = [
    ['Güneş suyu ısıtır ve su buharlaşıp yükselir', 'EDU'],
    ['Su Döngüsü', 'EDU'],
    ['iki sayının toplamı eşittir', 'EDU'],
    ['Peki hiç düşündün mü; şehirdeki bir kararı kim alıyor?', 'EDU'],
    ['İnternette gördüğümüz her bilgi doğru olmayabilir.', 'EDU'],
    ['Toplama işleminde sonuç eşittir.', 'EDU'],
    ['Anayasa ve kanun adaleti sağlar.', 'EDU'],
    ['Ailenin okulunun ve mahallenin üyesisin.', 'EDU'],
    ['Ampul ışık verir.', 'EDU'],
    ['Prizmada ışık kırılır.', 'EDU'],
    ['İnsan kalbi sağ ve sol karıncıklar kanı pompalar', 'EDU'],
    ['Sinir sistemi ve beyin nöron ağı nasıl çalışır', 'EDU'],
    ['Ses dalgaları titreşim ve yankı nasıl oluşur', 'EDU'],
    ['Madde atom ve molekül yapısı element özellikleri', 'EDU'],
    ['Hücre bölünmesi mitoz ve DNA kopyalanması', 'EDU'],
    ['Güneş denizi ısıtır, su molekülleri yükselir', 'EDU'],
    ['Viking tarzı devlerin yaşadığı ada macerası', 'STY'],
    ['Uzay istasyonu yeni gezegene doğru ilerler.', 'STY'],
    ['Ufukta yeni topraklar görünür, gemi yelken açar', 'STY'],
    ['Güç yükselişi başladı karakter güçleniyor', 'STY'],
    ['Kahraman düşmandan kaçmak için koşuyor', 'STY'],
    ['espresso fincana dökülüyor', 'REAL'],
    ['Ürün masanın üzerinde tek başına, saf ve güçlü', 'REAL'],
  ];

  it.each(SOURCES)('kaynak "%s" (%s): verbatim geçer + Claude talimatı + enjekte banka öznesi sızmaz', (src, reg) => {
    const p = frameFor(src, reg);
    expect(p, 'kaynak verbatim geçmedi').toContain(src);
    expect(p, 'Claude talimatı yok').toContain('Scene brief (Claude yazar)');
    expect(p, 'enjekte banka öznesi çıktıya sızdı').not.toContain('oversized translucent leaf model');
    expect(p, 'enjekte banka event sızdı').not.toContain('the leaf draws in one water drop');
    expect(hasBankResidue(p), 'banka izi kaldı').toBe(false);
  });
});

const clayWorld = DATA.worlds.find((w) => w.id === 'pixar_3d_edu')!;
const pixarRef: SurgeryRef = {
  id: 'pixar_fixture',
  name: 'Pixar fixture',
  cat: '3D Animation',
  use: 'warm camera, readable staging, soft classroom light',
  avoid: 'plastic copy',
  dna: 'camera: medium view; light: soft ambient; staging: centered learning object; motion: gentle drift; texture: tactile detail',
};

describe('registerOf', () => {
  it('maps paths to the three registers', () => {
    expect(registerOf('ANIMATION_EDU')).toBe('EDU');
    expect(registerOf('STYLIZED_PREMIUM')).toBe('STY');
    expect(registerOf('ULTRAREAL_COMMERCIAL')).toBe('REAL');
  });
});

describe('dnaDirectives', () => {
  it('translates reference DNA into camera/light/staging directives', () => {
    const d = dnaDirectives([pixarRef], 'EDU');
    expect(d.names).toContain('Pixar');
    expect(d.staging).toBeTruthy();
    expect(d.light).toBeTruthy();
  });

  it('falls back to path-native when no refs given', () => {
    const d = dnaDirectives([], 'STY');
    expect(d.names).toBe('path-native');
  });

  // --- BUG 1 + BUG 2 regression tests ---
  const eduPixarRef = DATA.refs.find((r) => r.id === 'pixar_dimensional')!;
  const eduArcaneRef = DATA.refs.find((r) => r.id === 'arcane_clay_hybrid')!;
  const eduKurzRef = DATA.refs.find((r) => r.id === 'kurzgesagt_clarity')!;

  it('BUG1 — edu_explainer combo: kurzgesagt staging trace (logical hierarchy) survives in staging or camera channel', () => {
    // All three refs: [pixar_dimensional, arcane_clay_hybrid, kurzgesagt_clarity]
    const d = dnaDirectives([eduPixarRef, eduArcaneRef, eduKurzRef], 'EDU');
    const combined = (d.staging + ' ' + d.camera).toLowerCase();
    // kurzgesagt must leave a hierarchy/overhead trace in staging or camera
    expect(combined).toMatch(/hierarch|overhead|system|explanatory|readable.*flow/);
  });

  it('BUG1 — pixar_dimensional contribution must NOT disappear in the combo', () => {
    // pixar adds camera: 'dramatic locked angle' (from painted.*volume via arcane) — but more importantly
    // the camera channel should contain at least something meaningful, not be wiped out
    const d = dnaDirectives([eduPixarRef, eduArcaneRef, eduKurzRef], 'EDU');
    expect(d.camera).toBeTruthy();
    // arcane contributes the painterly/fortiche camera angle
    expect(d.camera).toMatch(/locked|reveal|push|arc|angle|mid-distance/i);
  });

  it('BUG2 — arcane_clay_hybrid alone: staging must NOT contain "graphic city" or "running line"', () => {
    const d = dnaDirectives([eduArcaneRef], 'EDU');
    expect(d.staging).not.toMatch(/graphic city|running line|runner.*city|white.*negative space confirms freedom/i);
  });

  it('BUG2 — arcane_clay_hybrid alone: staging must NOT contain "graphic city" (full combo too)', () => {
    const d = dnaDirectives([eduPixarRef, eduArcaneRef, eduKurzRef], 'EDU');
    expect(d.staging).not.toMatch(/graphic city|running line|runner.*city|white.*negative space confirms freedom/i);
  });

  it('BUG2 — red.*motion false-match: pixar_dimensional alone must NOT trigger white-city staging', () => {
    const d = dnaDirectives([eduPixarRef], 'EDU');
    expect(d.staging).not.toMatch(/graphic city|running line|white.*negative space/i);
  });
});

describe('durationGuard (BÖLEMEZSİN)', () => {
  it('passes short narration within the Kling limit', () => {
    const v = durationGuard('Kısa bir cümle.', 'kling_3');
    expect(v.ok).toBe(true);
    expect(v.level).toBe('OK');
  });

  it('flags over-long narration as SPLIT', () => {
    const long = 'kelime '.repeat(40);
    const v = durationGuard(long, 'kling_3');
    expect(v.ok).toBe(false);
    expect(v.level).toBe('SPLIT');
    expect(v.message).toMatch(/aşıyor|ikinci|kare/i);
  });

  it('respects the engine usable limit (runway > kling)', () => {
    expect(estimateSec('kelime '.repeat(25))).toBeGreaterThan(8.5);
    const k = durationGuard('kelime '.repeat(25), 'kling_3');
    const r = durationGuard('kelime '.repeat(25), 'runway');
    expect(k.ok).toBe(false);
    expect(r.ok).toBe(true);
  });
});

describe('primeSuno', () => {
  it('returns path-specific musical brief with BPM, not boilerplate', () => {
    const s = primeSuno('ANIMATION_EDU');
    expect(s).toMatch(/BPM/);
    expect(s).toMatch(/no vocals unless requested/);
  });

  it('world-specific overrides: mappa_cinematic gets dark cinematic score, not path fallback', () => {
    const s = primeSuno('STYLIZED_PREMIUM', 'mappa_cinematic');
    expect(s).toMatch(/dark cinematic/i);
    expect(s).toMatch(/cello|taiko/i);
    expect(s).not.toMatch(/Cinematic stylized bed/);
  });

  it('world-specific overrides: bones_action gets precision action score', () => {
    const s = primeSuno('STYLIZED_PREMIUM', 'bones_action');
    expect(s).toMatch(/precision action/i);
    expect(s).toMatch(/orchestral/i);
  });

  it('world-specific overrides: toei_adventure gets grand adventure score', () => {
    const s = primeSuno('STYLIZED_PREMIUM', 'toei_adventure');
    expect(s).toMatch(/grand adventure/i);
    expect(s).toMatch(/brass/i);
  });

  it('falls back to path SUNO when worldId has no specific entry', () => {
    const s = primeSuno('ANIMATION_EDU', 'ghibli');
    expect(s).toMatch(/BPM/);
  });
});

describe('renderLock + primeCamera', () => {
  it('render lock starts with the world render recipe verbatim and appends the world laws', () => {
    const lock = renderLock(clayWorld, 'EDU');
    expect(lock.startsWith(worldRenderText(clayWorld))).toBe(true);
    if (clayWorld.line_grammar) expect(lock).toContain('Line grammar: ' + clayWorld.line_grammar);
    if (clayWorld.lens_grammar) expect(lock).toContain('Lens grammar: ' + clayWorld.lens_grammar);
    if (clayWorld.light_law) expect(lock).toContain('Light law: ' + clayWorld.light_law);
  });

  it('camera avoids repeating the previous scene index', () => {
    const a = primeCamera(1, 'kaynak bir', 0, 'EDU');
    const b = primeCamera(2, 'kaynak bir', 1, 'EDU', 'kaynak bir', 1);
    expect(a).not.toBe(b);
  });
});

describe('Brand Kit Lock', () => {
  it('injects verbatim brand guidelines into agent brief when locked', () => {
    const brief = buildAgentBrief({
      projectTopic: 'test', productionPath: 'test', register: 'EDU',
      world: clayWorld, dna: { names: 'n', camera: 'c', light: 'l', staging: 's', motion: 'm', texture: 't', avoid: 'a', perRef: [] },
      cast: '', brandKitLock: 'Verbatim Brand Name: Acme. Colors: #ff0000.'
    }, []);
    expect(brief).toContain('== BRAND KIT LOCK ==');
    // The agents key their lock gate on this exact token.
    expect(brief).toContain('BRAND KIT: LOCKED');
    expect(brief).toContain('Verbatim Brand Name: Acme. Colors: #ff0000.');
  });
});

describe('buildVariantBriefs', () => {
  it('yields exactly 3 briefs differing only in chosen variable', () => {
    const ctx = {
      projectTopic: 'test', productionPath: 'test', register: 'EDU' as const,
      world: clayWorld, dna: { names: 'n', camera: 'c', light: 'l', staging: 's', motion: 'm', texture: 't', avoid: 'a', perRef: [] },
      cast: ''
    };
    const scenes: any[] = [];
    const variants = buildVariantBriefs(ctx, scenes, 'world', [
      clayWorld,
      { ...clayWorld, name: 'B One Step' },
      { ...clayWorld, name: 'C Stronger' }
    ]);
    expect(variants.length).toBe(3);
    expect(variants[0]).toContain(clayWorld.name);
    expect(variants[1]).toContain('B One Step');
    expect(variants[2]).toContain('C Stronger');
  });
});

describe('recommendReason', () => {
  it('generates a smart suggestion based on reference DNA', () => {
    const reason = recommendReason(clayWorld, pixarRef);
    expect(reason).toContain(pixarRef.name);
  });
});

describe('buildRecipeMarkdown', () => {
  it('exports a v2 machine block that agents can parse', () => {
    const markdown = buildRecipeMarkdown({
      world: clayWorld,
      material: DATA.materials.find((material) => material.id === 'paper_craft_popup') || null,
      palette: DATA.palettes.find((palette) => palette.id === 'native_world') || null,
      cast: ['@anlatici', '@izleyici'],
      location: 'sınıf',
      subject: 'uzamsal ilişkiler',
      scenes: [{
        id: 1,
        vo: 'Nesne masanın üstündedir.',
        event: 'Bir küp masanın üstünde durur.',
        director_note: '40mm overhead, single window key',
        motion_seed: 'küp sabit kalırken ok yükseliyor',
        turkish_labels: ['ÜSTÜNDE'],
        avoid: ['jenerik metafor'],
      }],
      generatedAt: '2026-07-01T10:52:00.000Z',
    });
    const json = markdown.match(/```json\n([\s\S]*?)\n```/)?.[1];
    expect(json).toBeTruthy();
    const machine = JSON.parse(json!);
    expect(machine.brief_version).toBe('v2');
    expect(machine.world_id).toBe('pixar_3d_edu');
    expect(machine.cast).toEqual([
      { name: '@anlatici', reference: 'magnific' },
      { name: '@izleyici', reference: 'magnific' },
    ]);
  });

  it('buildRecipeMachine outputs correct payload and recipeJsonFileName formats properly', () => {
    const input = {
      world: clayWorld,
      material: DATA.materials.find((material) => material.id === 'paper_craft_popup') || null,
      palette: DATA.palettes.find((palette) => palette.id === 'native_world') || null,
      cast: ['@anlatici', '@izleyici'],
      location: 'sınıf',
      subject: 'Işık Hızı',
      scenes: [],
    };
    const machine = buildRecipeMachine(input as any) as any;
    expect(machine).toHaveProperty('world_id');
    expect(machine).toHaveProperty('material_id');
    expect(machine).toHaveProperty('palette_override');
    expect(machine).toHaveProperty('cast');
    expect(machine).toHaveProperty('location');
    expect(machine).toHaveProperty('subject');
    expect(machine).toHaveProperty('scenes');
    expect(machine).toHaveProperty('brief_version', 'v2');

    const markdown = buildRecipeMarkdown(input as any);
    const json = markdown.match(/```json\n([\s\S]*?)\n```/)?.[1];
    expect(json).toBe(JSON.stringify(machine, null, 2));

    const filename = recipeJsonFileName('Işık Hızı', '2026-07-01T10:52:00.000Z');
    expect(filename).toMatch(/\.json$/);
    expect(filename).toBe('recipe_isik-hizi_2026-07-01T10-52.json');
  });
});

describe('buildRecipeMachine cast reference rule', () => {
  it('any @-prefixed cast name gets reference magnific', () => {
    const input = {
      world: clayWorld,
      material: null,
      palette: null,
      cast: ['@mami', '@anlatici'],
      location: 'stüdyo',
      subject: 'test',
      scenes: [],
    };
    const machine = buildRecipeMachine(input as any) as any;
    expect(machine.cast).toEqual([
      { name: '@mami', reference: 'magnific' },
      { name: '@anlatici', reference: 'magnific' },
    ]);
  });

  it('cast name without @ prefix gets reference null', () => {
    const input = {
      world: clayWorld,
      material: null,
      palette: null,
      cast: ['Ayşe', 'Kemal'],
      location: 'stüdyo',
      subject: 'test',
      scenes: [],
    };
    const machine = buildRecipeMachine(input as any) as any;
    expect(machine.cast).toEqual([
      { name: 'Ayşe', reference: null },
      { name: 'Kemal', reference: null },
    ]);
  });
});

describe('shot grammar director', () => {
  it('is deterministic and gates ref-bound patterns behind ref selection', () => {
    const a = primeShotPattern(3, 'kaynak metin', 'EDU', []);
    const b = primeShotPattern(3, 'kaynak metin', 'EDU', []);
    expect(a).toEqual(b);
    // without the ref, only universal patterns are reachable.
    // Liste ELLE yazılmaz — evrensel sözlük büyüdükçe (kompozisyon monotonluğu fix'i)
    // sabit liste bayatlar ve testi yalancı-kırmızıya düşürür. Veriden türet: testin
    // niyeti "ref-kapılı kalıplar ref seçilmeden ERİŞİLEMEZ", sözlüğün boyu değil.
    const universalIds = SHOT_PATTERNS.filter((p) => p.refId === null).map((p) => p.id);
    expect(universalIds.length).toBeGreaterThan(3);
    for (let i = 1; i <= 12; i++) {
      expect(universalIds).toContain(primeShotPattern(i, `beat ${i}`, 'STY', []).id);
    }
    // with kubrick selected, one-point becomes reachable across scenes
    const withKubrick = new Set<string>();
    for (let i = 1; i <= 40; i++) withKubrick.add(primeShotPattern(i, `beat ${i}`, 'STY', ['kubrick_one_point']).id);
    expect([...withKubrick]).toContain('one_point_pull');
  });

  it('avoids repeating the previous scene pattern and lands in the image prompt', () => {
    const first = primeShotPattern(1, 'aynı metin', 'EDU', []);
    const second = primeShotPattern(1, 'aynı metin', 'EDU', [], first.id);
    expect(second.id).not.toBe(first.id);

    const prompt = buildImagePrompt(1, { subject: 'lesson object', event: 'panel slides open', matched: true }, '50mm dolly', {
      world: clayWorld, register: 'EDU',
      dna: { names: 'Ref', camera: 'medium', light: 'soft', staging: 'centered', motion: 'drift', texture: 'clay', avoid: 'plastic', perRef: [] },
      pathForbidden: '', shotPattern: first.line,
    });
    expect(prompt).toContain('Composition pattern:');
  });
});

describe('engine dialects', () => {
  const concept = { subject: 'sea under sunlight', event: 'water vapor rises from the surface', matched: true };
  const dna = { names: 'Ref', camera: 'medium', light: 'soft', staging: 'centered', motion: 'gentle drift', texture: 'clay', avoid: 'plastic', perRef: [] };

  it('motion prompt speaks the selected engine dialect', () => {
    const kling = buildMotionPrompt(1, concept, 'slow push-in', dna, 6, 'kling_3');
    const seedance = buildMotionPrompt(1, concept, 'slow push-in', dna, 6, 'seedance_2');
    const veo = buildMotionPrompt(1, concept, 'slow push-in', dna, 6, 'veo_3');
    expect(kling).toContain('Engine grammar (Kling 3.0):');
    expect(kling).toContain('re-render of the start frame');
    expect(seedance).toContain('Engine grammar (Seedance):');
    expect(seedance).toContain('subject-tracking');
    expect(seedance).toContain('subject swap mid-track');
    expect(veo).toContain('Engine grammar (Veo):');
    expect(veo).toContain('unmotivated camera move');
    expect(kling).not.toBe(seedance);
    // Dialect shapes the RHYTHM, not just a sticker sentence.
    expect(kling).toContain('resolves by ~70% of the clip');
    expect(seedance).toContain('physics timing rules the arc');
    expect(buildMotionPrompt(1, concept, 'push', dna, 6, 'runway_gen4')).toContain('one long uncut arc');
  });

  it('O3 reasoning tier keeps the Kling 3.0 engine name; unknown model falls back to Kling', () => {
    expect(buildMotionPrompt(1, concept, 'push', dna, 6, 'kling_o3')).toContain('Engine grammar (Kling 3.0 · O3 tier):');
    expect(buildMotionPrompt(1, concept, 'push', dna, 6, 'totally_unknown')).toContain('Engine grammar (Kling 3.0):');
    expect(buildMotionPrompt(1, concept, 'push', dna, 6)).toContain('Engine grammar (Kling 3.0):');
  });
});

describe('primePacket & buildAgentBrief richness', () => {
  const ctx = {
    projectTopic: 'Water cycle exploration',
    productionPath: 'ANIMATION_EDU',
    register: 'EDU' as const,
    world: clayWorld,
    dna: { names: 'Pixar Ref', camera: 'medium view', light: 'soft ambient', staging: 'centered', motion: 'gentle drift', texture: 'clay texture', avoid: 'plastic', perRef: [] },
    cast: '',
    brandKitLock: 'Verbatim Brand: Mamilas Education.'
  };

  const scenes = [
    {
      id: 1,
      source: 'Güneş suyu ısıtır.',
      concept: { subject: 'sea under sunlight', event: 'water vapor rises', matched: true },
      camera: 'medium view',
      sec: 6
    }
  ];

  it('buildAgentBrief includes brand-kit and proof state, and stays pristine (no variant block) by default', () => {
    const brief = buildAgentBrief(ctx, scenes);
    expect(brief).toContain('== BRAND KIT LOCK ==');
    expect(brief).toContain('Verbatim Brand: Mamilas Education.');
    expect(brief).toContain('## 10. Proof State & Quality Status');
    expect(brief).toContain('Status: PASS');
    // Tool park routing is part of every dossier: upscale pass + credit lanes.
    expect(brief).toContain('### Tool Park & Credit Strategy');
    // SURFACE ≠ ENGINE. Magnific Spaces and Higgsfield are node canvases that HOST the engines —
    // the same Kling and the same Nano Banana run inside both. Naming the surface is fine. What
    // must never come back is the UPSCALE PASS invented between them: Mami generates at 1K and
    // Kling delivers 1080p from whatever frame it is given (his correction, 2026-07-11).
    expect(brief).toMatch(/Workspace \(a surface, not an engine\)/);
    expect(brief.toLowerCase(), 'the invented upscale pass came back').not.toMatch(/upscale (?:pass|step|it|the)|fidelity[- ]mode/);
    expect(brief).toContain('Higgsfield AI');
    // No invented variants pollute a normal brief.
    expect(brief).not.toContain('CREATIVE VARIANT');
    expect(brief).not.toContain('amber or custom palette');
  });

  it('injects the GLOBAL_BRAIN variant declaration only when a variant test is active', () => {
    const brief = buildAgentBrief({ ...ctx, variantTest: { variable: 'world', variant: 'B' } }, scenes);
    expect(brief).toContain('== CREATIVE VARIANT TEST — variable: world ==');
    expect(brief).toContain('This brief is Variant B.');
    expect(brief).toContain('Only the world differs across A/B/C');
  });

  it('each primePacket contains its director header and render lock verbatim, no invented variants', () => {
    const packets: Array<'image' | 'motion' | 'suno' | 'idea' | 'proof'> = ['image', 'motion', 'suno', 'idea', 'proof'];
    for (const p of packets) {
      const result = primePacket(p, ctx, scenes);
      // Verify director header
      const expectedHeader = p === 'motion' ? 'MAMILAS MOTION DIRECTOR — i2v' : p === 'suno' ? 'MAMILAS SUNO DIRECTOR — Custom Mode' : `MAMILAS ${p.toUpperCase()} DIRECTOR`;
      expect(result).toContain(expectedHeader);
      // Verify render lock verbatim
      expect(result).toContain(worldRenderText(clayWorld));
      // Verify brand kit lock and proof state present, no fabricated variant copy
      expect(result).toContain('== BRAND KIT LOCK ==');
      expect(result).toContain('== PROOF STATE & QUALITY STATUS ==');
      expect(result).toContain('Status: PASS');
      expect(result).not.toContain('amber or custom palette');
    }
  });
});

describe('primeSuno path normalisation', () => {
  it('FOOD path gets food-specific sensory bed, not generic fallback', () => {
    const s = primeSuno('FOOD', 'food_macro_real');
    expect(s).toContain('76-88 BPM');
    expect(s).toContain('brushed kit');
    expect(s).not.toContain('78-90 BPM, sparse warm instrumentation');
  });

  it('PRODUCT path gets minimal product bed', () => {
    const s = primeSuno('PRODUCT', 'product_macro_tabletop');
    expect(s).toContain('80-90 BPM');
    expect(s).toContain('felt-piano');
    expect(s).not.toContain('78-90 BPM, sparse warm instrumentation');
  });

  it('TOURISM path gets place-led warm score', () => {
    const s = primeSuno('TOURISM', 'tourism_destination_real');
    expect(s).toContain('nylon guitar');
    expect(s).not.toContain('sparse warm instrumentation');
  });

  it('HEALTH path gets care-grade underscore', () => {
    const s = primeSuno('HEALTH', 'healthcare_public_real');
    expect(s).toContain('68-78 BPM');
    expect(s).not.toContain('sparse warm instrumentation');
  });

  it('AUTO path gets kinetic premium bed', () => {
    const s = primeSuno('AUTO', 'automotive_stage_real');
    expect(s).toContain('sub pulse');
    expect(s).not.toContain('sparse warm instrumentation');
  });

  it('ANIMATION_EDU path still works (regression)', () => {
    const s = primeSuno('ANIMATION_EDU', 'anime_cel');
    expect(s).toContain('92-100 BPM');
    expect(s).toContain('felted celesta');
  });

  it('world-level suno override takes priority over path', () => {
    const s = primeSuno('STYLIZED_PREMIUM', 'mappa_cinematic');
    expect(s).toContain('60-82 BPM');
    expect(s).toContain('Dark cinematic');
  });
});

// Eski STY_BANK \brun\b false-positive guard → yeni: banka söküldüğü için chase/run
// veya traveler öznesi YAPISAL OLARAK imkânsız; kaynak verbatim taşınır.
describe('STY_BANK söküm regresyonu — chase/traveler öznesi yapısal imkânsız', () => {
  it('görünür/yelken kaynağı hiçbir banka öznesi (kinetic/traveler) üretmez, verbatim taşır', () => {
    const src = 'Ufukta yeni topraklar görünür, gemi yelken açar';
    const p = frameFor(src, 'STY');
    expect(p).not.toContain('kinetic figure silhouette');
    expect(p).not.toContain('traveler');
    expect(p).toContain(src);
    expect(hasBankResidue(p)).toBe(false);
  });

  it('macera kaynağı traveler bankası ÜRETMEZ (Claude yazar), verbatim taşır', () => {
    const src = 'Ufukta yeni topraklar görünür, gemi yelken açar, ekip yeni dünyayı keşfetmeye hazır';
    const p = frameFor(src, 'STY');
    expect(p).not.toContain('traveler at the threshold');
    expect(p).toContain('Scene brief (Claude yazar)');
    expect(p).toContain(src);
  });

  it('gerçek koşu/kovalama kaynağı kinetic bankası ÜRETMEZ, verbatim taşır', () => {
    const src = 'Kahraman düşmandan kaçmak için koşuyor, chase begins';
    const p = frameFor(src, 'STY');
    expect(p).not.toContain('kinetic figure silhouette');
    expect(p).toContain(src);
    expect(hasBankResidue(p)).toBe(false);
  });
});

// Eski EDU_BANK "matches X concept" testleri → yeni: banka söküldü, o özneler
// YAPISAL OLARAK üretilemez; kaynak verbatim + Claude talimatı taşınır.
describe('EDU_BANK söküm regresyonu — banka öznesi üretilmez, kaynak verbatim', () => {
  const EDU_CASES: Array<[string, string, string]> = [
    ['kalp/heart', 'İnsan kalbi sağ ve sol karıncıklar kanı pompalar', 'heart model'],
    ['sinir sistemi/beyin', 'Sinir sistemi ve beyin nöron ağı nasıl çalışır', 'neuron'],
    ['ışık/kırılma', 'Işığın yansıması ve kırılması, prizmanın renk ayrıştırması', 'optics rig'],
    ['ses/titreşim', 'Ses dalgaları titreşim ve yankı nasıl oluşur', 'tuning fork'],
    ['elektrik/devre', 'Elektrik devre pil ve ampul akım akışı', 'circuit board'],
    ['atom/molekül/madde', 'Madde atom ve molekül yapısı element özellikleri', 'element-tile board'],
    ['üçgenin açıları', 'Üçgenin açıları ve geometri kuralları', 'shape-building table'],
    ['üretim/tarım', 'Tarım ve üretim çiftçi toprak hazırlığı', 'planting stage'],
    ['hücre bölünme/mitoz', 'Hücre bölünmesi mitoz ve DNA kopyalanması', 'cell dome'],
    ['OBOB/OKEK', 'OBOB ve OKEK bulma hüceman bütün sayı hesaplama', 'factor grid'],
  ];

  it.each(EDU_CASES)('%s: eski banka öznesi ("%s" → yok) üretilmez, kaynak verbatim', (_label, src, deadSubject) => {
    const p = frameFor(src, 'EDU');
    expect(p, 'söküldü sanılan banka öznesi hâlâ çıkıyor').not.toContain(deadSubject);
    expect(p).toContain(src);
    expect(p).toContain('Scene brief (Claude yazar)');
    expect(hasBankResidue(p)).toBe(false);
  });
});

describe('STY_BANK power-surge söküm regresyonu — power expansion öznesi üretilmez', () => {
  it('"güç yükselişi" power expansion bankası ÜRETMEZ, verbatim taşır', () => {
    const src = 'Güç yükselişi başladı karakter güçleniyor';
    const p = frameFor(src, 'STY');
    expect(p).not.toContain('power expansion');
    expect(p).toContain(src);
  });

  it('"awakening" power expansion bankası ÜRETMEZ, verbatim taşır', () => {
    const src = 'The awakening begins power level rising';
    const p = frameFor(src, 'STY');
    expect(p).not.toContain('power expansion');
    expect(p).toContain(src);
  });
});

describe('ANTIGRAVITY TASK 2', () => {
  it('dnaDirectives with 2 refs having dna text → perRef has 2 verbatim entries', () => {
    const refs: any[] = [
      { id: '1', name: 'Ref 1', dna: 'dna one', use: 'use one', avoid: 'avoid one', cat: 'test' },
      { id: '2', name: 'Ref 2', dna: 'dna two', use: '', avoid: '', cat: 'test' }
    ];
    const res = dnaDirectives(refs, 'REAL');
    expect(res.perRef.length).toBe(2);
    expect(res.perRef[0]).toEqual({ name: 'Ref 1', anchor: '', dna: 'dna one', use: 'use one', avoid: 'avoid one' });
    expect(res.perRef[1]).toEqual({ name: 'Ref 2', anchor: '', dna: 'dna two', use: '', avoid: '' });
  });

  it('dnaDirectives with refs present but no DNA_MAP hits → self-contained anchor fallback; with refs=[] → old generic fallback string', () => {
    const refs: any[] = [{ id: '1', name: 'Ref 1', dna: 'dna one, second clause', use: '', avoid: '', cat: 'unknown_cat' }];
    const res = dnaDirectives(refs, 'REAL');
    // The directive also lands inside image prompts — it must carry the ref's
    // actual DNA anchor, never a pointer to a block that only exists in the brief.
    expect(res.camera).toContain('apply the camera character of Ref 1');
    expect(res.camera).toContain('dna one');
    expect(res.camera).not.toContain('Reference Contributions block');

    const resEmpty = dnaDirectives([], 'REAL');
    expect(resEmpty.camera).not.toContain('Reference Contributions block');
    expect(resEmpty.camera).toContain('restrained filmic moves');
  });

  it("buildAgentBrief output contains a ref's dna string verbatim", () => {
    const ctx: any = {
      projectTopic: 'Topic', productionPath: 'REAL', register: 'REAL',
      world: { name: 'World' }, dna: { names: 'Refs', camera: '', light: '', staging: '', motion: '', texture: '', avoid: '', perRef: [{ name: 'Ref 1', dna: 'VERBATIM_DNA', use: '', avoid: '' }] },
      cast: ''
    };
    const brief = buildAgentBrief(ctx, []);
    expect(brief).toContain('VERBATIM_DNA');
    expect(brief).toContain('- **Ref 1** — DNA: VERBATIM_DNA');
  });

  it('eventSeed accumulates past minLen; eventSeed on a no-comma string returns it whole', () => {
    const short = eventSeed('a, b, c, d, e, f, g, h, i, j, k, l, m', 15);
    // 'a, b, c, d, e, f, g, h' -> should be > 15
    expect(short.length).toBeGreaterThanOrEqual(15);
    expect(short).toContain('a, b, c');
    expect(eventSeed('no commas here at all')).toBe('no commas here at all');
  });

  it('mandateSeed: 500-char input → ≤ 223 chars, ends with …; short input returned as-is', () => {
    const longInput = 'A'.repeat(500);
    const compressed = mandateSeed(longInput, 220);
    expect(compressed.length).toBeLessThanOrEqual(223);
    expect(compressed.endsWith('…')).toBe(true);

    const shortInput = 'Short text';
    expect(mandateSeed(shortInput, 220)).toBe(shortInput);
  });

  it('buildImagePrompt with a long directorBrief → prompt does NOT contain the full raw text', () => {
    const ctx: any = {
      world: {}, register: 'REAL', dna: { staging: '', light: '', texture: '', avoid: '' } as any,
      directorBrief: 'A'.repeat(500), pathForbidden: ''
    };
    const prompt = buildImagePrompt(1, { subject: 'sub', event: 'evt', matched: true }, 'cam', ctx);
    expect(prompt).not.toContain('A'.repeat(500));
    expect(prompt).toContain('A'.repeat(200));
  });

  it('Signature: 6 scenes, signature set → marker appears EXACTLY once and on the expected scene id; without signature → output has no SIGNATURE CANDIDATE', () => {
    const ctxWithSig: any = {
      projectTopic: 'T', productionPath: 'P', register: 'REAL', world: { name: 'W' }, dna: { avoid: '' } as any, cast: '',
      signature: 'MY_HERO_SHOT'
    };
    const scenes: any[] = [
      { id: 1, sec: 2, source: 's1', concept: { subject: '1', event: 'e', matched: true }, camera: 'c1' },
      { id: 2, sec: 2, source: 's2', concept: { subject: '2', event: 'e', matched: true }, camera: 'c2' },
      { id: 3, sec: 2, source: 's3', concept: { subject: '3', event: 'e', matched: true }, camera: 'c3' },
      { id: 4, sec: 5, source: 's4', concept: { subject: '4', event: 'e', matched: true }, camera: 'c4' }, // tied highest
      { id: 5, sec: 3, source: 's5', concept: { subject: '5', event: 'e', matched: true }, camera: 'c5' },
      { id: 6, sec: 5, source: 's6', concept: { subject: '6', event: 'e', matched: true }, camera: 'c6' }  // tied highest, later
    ];
    const briefWithSig = buildAgentBrief(ctxWithSig, scenes);
    const matches = briefWithSig.match(/SIGNATURE CANDIDATE/g);
    expect(matches).not.toBeNull();
    expect(matches?.length).toBe(1);
    // T4: boş CONCEPT/EVENT satırları per-sahne SCENE BRIEF authoring komisyonuna dönüştü.
    // The dossier now carries the shot's own decisions instead of the repeated commission.
    expect(briefWithSig).toContain('[6] ~5s\nSOURCE (exact, untouchable): s6');
    expect(briefWithSig).toContain('CAMERA: c6');
    expect(briefWithSig).toContain("SIGNATURE CANDIDATE: this scene carries the episode's signature shot (MY_HERO_SHOT)");
    expect(briefWithSig).toContain('MY_HERO_SHOT');

    const ctxNoSig = { ...ctxWithSig, signature: undefined };
    const briefNoSig = buildAgentBrief(ctxNoSig, scenes);
    expect(briefNoSig).not.toContain('SIGNATURE CANDIDATE');
  });
});

describe('ANTIGRAVITY TASK 3', () => {
  it('buildImagePrompt with mood+timeLight+cameraEnergy+pov set → output contains Director Decisions', () => {
    const ctx: any = {
      world: {}, register: 'REAL', dna: { staging: 'staging', light: 'light', texture: '', avoid: '' },
      mood: 'test_mood', timeLight: 'test_time', cameraEnergy: 'test_cam', pov: 'test_pov'
    };
    const prompt = buildImagePrompt(1, { subject: 'sub', event: 'evt', matched: true }, 'camera', ctx);
    expect(prompt).toContain('Mood law: test_mood.');
    expect(prompt).toContain('Time-of-day mandate: test_time.');
    expect(prompt).toContain('Camera energy: test_cam.');
    expect(prompt).toContain('POV rule: test_pov — only where it reveals the idea; a locked frame is valid.');
  });

  it('buildImagePrompt WITHOUT the four fields → output strictly equal to the output produced before the change', () => {
    const ctx: any = {
      world: {}, register: 'REAL', dna: { staging: 'staging', light: 'light', texture: '', avoid: '' }
    };
    const prompt = buildImagePrompt(1, { subject: 'sub', event: 'evt', matched: true }, 'camera', ctx);
    expect(prompt).not.toContain('Mood law:');
    expect(prompt).not.toContain('Time-of-day mandate:');
    expect(prompt).not.toContain('Camera energy:');
    expect(prompt).not.toContain('POV rule:');
    // Pre-change exact format assertion
    expect(prompt).toContain('Staging: staging.');
    expect(prompt).toContain('Camera/vantage: camera.');
    expect(prompt).toContain('Light: light.');
  });

  it("generateBatch with input.mood set → every scene's imagePrompt contains the mood brief text; with mood unset → no Mood law anywhere", () => {
    // Pick any valid MOOD_OPTS key. We assume 'melancholy' exists, or we just grab the first key.
    const moodKey = Object.keys(MOOD_OPTS)[0];
    const moodBrief = MOOD_OPTS[moodKey].brief;
    const baseInput = {
      projectTopic: 'Test',
      projectClass: 'Test',
      sceneCount: 2,
      selectedWorldId: DATA.worlds[0].id,
      selectedPropId: 'none',
      selectedRefIds: [],
      selectedPaletteId: DATA.palettes[0].id,
      selectedMusicId: 'none',
      imageModel: 'flux',
      videoModel: 'kling'
    };
    const batchWithMood = generateBatch({ ...baseInput, mood: moodKey });
    batchWithMood.scenes.forEach(scene => {
      expect(scene.imagePrompt).toContain(`Mood law: ${moodBrief}.`);
    });

    const batchWithoutMood = generateBatch(baseInput);
    batchWithoutMood.scenes.forEach(scene => {
      expect(scene.imagePrompt).not.toContain('Mood law:');
    });
  });
});

describe('buildImagePrompt — Claude özne devri', () => {
  const camera = '50mm dolly';
  const ctx: any = {
    world: {}, register: 'REAL', dna: { staging: 'staging', light: 'light', texture: 'texture', avoid: 'avoid' },
    pathForbidden: ''
  };

  it('image prompt somut banka öznesini basmaz, Claude talimatı taşır', () => {
    const p = buildImagePrompt(0, { subject: 'one oversized translucent leaf model', event: 'the leaf draws a water drop', matched: true }, camera, { ...ctx, sourceBeat: 'Işık yaprağa çarpınca fabrika çalışır.' });
    expect(p).not.toContain('one oversized translucent leaf model'); // site özne UYDURMAZ
    expect(p).not.toContain('the leaf draws a water drop');          // banka event'i de sızmaz
    expect(p).toContain('Işık yaprağa çarpınca fabrika çalışır.');   // kaynak verbatim
    expect(p).toMatch(/Scene brief|Claude/i);                        // Claude talimatı
  });

  it('sourceBeat verilmese bile HER ZAMAN Claude Scene-brief basılır — banka Dominant element/Motion seed ASLA', () => {
    const p = buildImagePrompt(0, { subject: 'one oversized translucent leaf model', event: 'the leaf draws a water drop', matched: true }, camera, ctx);
    expect(p).not.toContain('Dominant element:');       // banka öznesi asla
    expect(p).not.toContain('Motion seed:');            // eski scaffold söküldü
    expect(p).not.toContain('one oversized translucent leaf model');
    expect(p).toContain('Scene brief (Claude yazar)');  // her zaman Claude talimatı
  });
});

describe('final brief hygiene (Faz 1 — 2026-07-02)', () => {
  const world = DATA.worlds.find((w) => w.id === 'kurzgesagt_edu') ?? clayWorld;
  const dna = dnaDirectives([pixarRef], 'EDU');
  const longMandate =
    'Phase 0 preset: Eğitim / Açıklayıcı. Director thesis: Konuyu çocukça basitleştirmeden, tek bakışta anlaşılır bir eğitim dünyasına çevir. ' +
    'Locked decisions: Öğrenme dünyası: Clay diorama — Sıcak, dokunsal, Pixar eğitim netliği. Anti-generic guard: never produce a generic preset look.';
  const messyScenes = [
    { id: 1, source: 'Merhaba çocuklar!', concept: { subject: 'welcome stage', event: 'light ripple settles', matched: true }, camera: 'locked frame', sec: 3 },
    { id: 2, source: '\nHepimiz bir ailenin üyesiyiz; "grup" dediğimiz şey tam da bu.', concept: { subject: 'membership map', event: 'badge slides once', matched: true }, camera: 'low dolly', sec: 6 },
    { id: 3, source: '  Artık grupları, rolleri ve kültürü tanıyorsun.', concept: { subject: 'badge board', event: 'badge stamps once', matched: true }, camera: 'crane-down', sec: 4 },
  ];
  const ctx = {
    projectTopic: 'Toplum ve Roller', productionPath: 'ANIMATION_EDU', register: 'EDU' as const,
    world, dna, cast: 'Defne', directorBrief: longMandate, voSyncMode: 'LOCKED' as const,
  };

  it('dossier SOURCE lines are single-line even when beats carry leading newlines/spaces', () => {
    const brief = buildAgentBrief(ctx, messyScenes);
    for (const line of brief.split('\n')) {
      if (line.startsWith('SOURCE (exact, untouchable):')) {
        expect(line.slice('SOURCE (exact, untouchable):'.length).trim().length).toBeGreaterThan(0);
      }
    }
    expect(brief).not.toMatch(/SOURCE \(exact, untouchable\): *\n/);
    expect(brief).toContain('SOURCE (exact, untouchable): Hepimiz bir ailenin üyesiyiz; "grup" dediğimiz şey tam da bu.');
  });

  it('LOCKED brief anchors VO to the SOURCE line instead of duplicating the full text per scene', () => {
    const brief = buildAgentBrief(ctx, messyScenes);
    expect(brief).toContain('VO_ANCHOR: the SOURCE line above, verbatim.');
    // the full beat text appears exactly once per scene (in SOURCE), not twice
    const hits = brief.split('Hepimiz bir ailenin üyesiyiz').length - 1;
    expect(hits).toBe(1);
  });

  it('image packet VO_ANCHOR uses guillemets so inner double quotes never pile up', () => {
    const packet = primePacket('image', ctx, messyScenes);
    expect(packet).toContain('VO_ANCHOR: «Hepimiz bir ailenin üyesiyiz; "grup" dediğimiz şey tam da bu.»');
    expect(packet).not.toMatch(/VO_ANCHOR: ""/);
  });

  it('KÖK 7b: image packet PALETTE AS LIGHT section carries no raw hex (Translation Law)', () => {
    // no-palette ctx → world.palette_lock path
    const packet = primePacket('image', ctx, messyScenes);
    const section = packet.split('== PALETTE AS LIGHT ==')[1]?.split('== ')[0] ?? '';
    expect(section.length).toBeGreaterThan(10);
    expect(section, `Raw hex leaked into image packet palette section:\n${section}`).not.toMatch(/#[0-9a-fA-F]{6}/);
    // hex-palette ctx → palette.hex path
    const pastel = DATA.palettes.find((p) => p.id === 'pastel_soft')!;
    const packet2 = primePacket('image', { ...ctx, palette: pastel } as any, messyScenes);
    const section2 = packet2.split('== PALETTE AS LIGHT ==')[1]?.split('== ')[0] ?? '';
    expect(section2, `Raw hex leaked (hex palette):\n${section2}`).not.toMatch(/#[0-9a-fA-F]{6}/);
  });

  it('render lock appears exactly once in the brief and once per packet', () => {
    const brief = buildAgentBrief(ctx, messyScenes);
    const lock = renderLock(world, 'EDU');
    const briefHits = brief.split(lock).length - 1;
    expect(briefHits).toBe(1);
    const packet = primePacket('image', ctx, messyScenes);
    expect(packet.split(lock).length - 1).toBe(1);
  });

  it('brief contains no mojibake and no 3+ blank-line runs', () => {
    const brief = buildAgentBrief(ctx, messyScenes);
    expect(brief).not.toMatch(/â¦|Ã©|â€|�/);
    expect(brief).not.toMatch(/\n{3,}/);
  });

  it('mandateSeed never leaves a dangling ellipsis after a sentence stop', () => {
    const seed = mandateSeed(longMandate);
    expect(seed.endsWith('.') || seed.endsWith('…')).toBe(true);
    expect(seed).not.toMatch(/\. ?…$/);
    // mid-sentence cut still signals truncation with a single clean ellipsis
    const midCut = mandateSeed('a'.repeat(50) + ' ' + 'kelime '.repeat(60), 220);
    expect(midCut).toMatch(/[^\s.…]…$/);
  });

  it('image prompt Director mandate line never renders "….", and greeting beats carry verbatim source (banka hijack imkânsız)', () => {
    const prompt = buildImagePrompt(1, messyScenes[0].concept, 'locked frame', {
      world, register: 'EDU', dna, pathForbidden: '', directorBrief: longMandate,
      sourceBeat: 'Merhaba çocuklar!',
    });
    expect(prompt).not.toContain('….');
    // Banka söküldü → greeting hiçbir banka öznesine (welcome stage / safety map) hijack edilemez;
    // kaynak verbatim taşınır ve WHAT'ı Claude yazar.
    expect(prompt).toContain('Merhaba çocuklar!');
    expect(prompt).toContain('Scene brief (Claude yazar)');
    expect(prompt).not.toMatch(/safety map/i);
  });
});

// ===== MOTION BRIEF — banka Moving element/Event söküldü, Claude yazar =====

describe('buildMotionPrompt — Claude Motion brief devri', () => {
  const dna = dnaDirectives([], 'REAL');
  const concept: Concept = { subject: '', event: '', matched: false };
  const sourceBeat = 'El saati kutudan çıkarır ve ışığa doğru tutar.';

  it('banka-türevli "Moving element"/"Event" satırı ASLA basılmaz — Claude Motion brief taşır', () => {
    const p1 = buildMotionPrompt(1, concept, 'wide shot', dna, 3, 'kling_3', null, sourceBeat);
    const p2 = buildMotionPrompt(2, concept, 'wide shot', dna, 3, 'kling_3', null, sourceBeat);
    for (const p of [p1, p2]) {
      expect(p, 'banka Moving element satırı hâlâ var').not.toContain('Moving element:');
      expect(p, 'banka Event satırı hâlâ var').not.toContain('Event:');
      expect(p).toContain('Motion brief (Claude yazar)');
    }
  });

  it('motion brief verbatim kaynak beat\'i taşır (banka klozu türetmez)', () => {
    const p = buildMotionPrompt(1, concept, 'wide shot', dna, 3, 'kling_3', null, sourceBeat);
    expect(p).toContain('Motion brief (Claude yazar)');
    expect(p).toContain(sourceBeat);
    // Sinematografi çerçevesi korunur: kamera + engine grammar + frame-gate başlığı.
    expect(p).toContain('Camera: wide shot.');
    expect(p).toMatch(/Engine grammar/);
    expect(p).toContain('MOTION (i2v · plays the approved start frame)');
  });

  it('same sceneId + same inputs → same motion prompt (deterministic, no Date.now/Math.random)', () => {
    const p1 = buildMotionPrompt(1, concept, 'wide shot', dna, 3, 'kling_3', null, sourceBeat);
    const p2 = buildMotionPrompt(1, concept, 'wide shot', dna, 3, 'kling_3', null, sourceBeat);
    expect(p1).toBe(p2);
  });
});

describe('generateBatch — Moving element not cloned across scenes (deakins_naturalist + kling_3)', () => {
  const deakinsInput = {
    projectTopic: 'El yapımı seramik atölyesinin hikâyesi',
    projectClass: 'ULTRAREAL_COMMERCIAL',
    sceneCount: 3,
    selectedWorldId: 'deakins_naturalist',
    selectedPropId: 'none',
    selectedRefIds: [] as string[],
    selectedPaletteId: 'native_world',
    selectedMusicId: '',
    imageModel: 'flux',
    videoModel: 'kling_3',
  };

  it('generates without error and produces 3 scenes', () => {
    const result = generateBatch(deakinsInput as any);
    expect(result.status).not.toBe('BLOCKED');
    expect(result.scenes.length).toBe(3);
  });

  it('her sahnenin motion brief\'i kendi verbatim kaynağını taşır → sahneler ayrışır (klon yok)', () => {
    const result = generateBatch(deakinsInput as any);
    // Banka Moving element söküldü; motion prompt her sahne için kendi kaynak beat'ini taşır.
    for (const s of result.scenes) {
      expect(s.motionPrompt, `Sahne ${s.id} banka Moving element satırı hâlâ var`).not.toContain('Moving element:');
      expect(s.motionPrompt, `Sahne ${s.id} Claude Motion brief yok`).toContain('Motion brief (Claude yazar)');
      expect(s.motionPrompt, `Sahne ${s.id} kendi kaynağını taşımıyor`).toContain(s.voiceOver);
    }
    // Kaynak beat'ler farklı → motion brief'ler pairwise farklı (cross-scene klon yok).
    const briefs = result.scenes.map(s => s.motionPrompt);
    expect(new Set(briefs).size).toBe(briefs.length);
  });
});

describe('TUR3-A-B4 — world camera law clamps travelling moves in static-hold worlds', () => {
  it('retro_anime_film (Camera holds are static and deliberate) never gets a travelling camera', () => {
    const result = generateBatch({
      projectTopic: 'Kayıp pusulanın peşinde son yolculuk',
      projectClass: 'STYLIZED_PREMIUM',
      sceneCount: 5,
      selectedWorldId: 'retro_anime_film',
      selectedPropId: 'none',
      selectedRefIds: [] as string[],
      selectedPaletteId: 'native_world',
      selectedMusicId: '',
      imageModel: 'flux',
      videoModel: 'kling_3',
    } as any);
    expect(result.status).not.toBe('BLOCKED');
    for (const s of result.scenes) {
      const cam = (s.motionPrompt?.match(/Camera:\s*([^.]+)\./) ?? [])[1] ?? '';
      expect(cam, `Scene ${s.id} camera travels against the world law: "${cam}"`)
        .not.toMatch(/push|slide|arc\b|track|glide|travel|sweep|dolly|orbit|crane/i);
    }
  });

  it('low_poly_ps1 ("static painted backdrop" = sky, not camera) is NOT clamped', () => {
    const world = DATA.worlds.find((w) => w.id === 'low_poly_ps1')!;
    expect(applyWorldCameraLaw('slow push along the dominant silhouette edge', 1, world))
      .toBe('slow push along the dominant silhouette edge');
  });
});

describe('TUR3-A/B2 söküm regresyonu — banka event klozu türetilmez, kaynak verbatim', () => {
  it('motion brief banka event\'ini kıyıp Moving element türetmez; verbatim kaynak taşır', () => {
    // Eski kök: banka event klozu 60 karakterde kesilip sarkık edat bırakıyordu.
    // Yeni akış: banka event YOK; motion brief verbatim kaynak beat taşır.
    const concept: Concept = { subject: '', event: '', matched: false };
    const sourceBeat = 'Kalan tek sıcak detay çerçevedeki tek canlı ışığı yakalar ve figür başını çevirir.';
    const dna = dnaDirectives([], 'STY');
    const p = buildMotionPrompt(1, concept, 'slow push', dna, 6, 'kling_3', null, sourceBeat);
    expect(p).not.toContain('Moving element:');
    expect(p).toContain('Motion brief (Claude yazar)');
    expect(p).toContain(sourceBeat);
  });
});

describe('KÖK 7d — cinedna_handheld contributes even when the camera channel is full', () => {
  it('adding cinedna_handheld to the documentary combo changes at least one directive channel', () => {
    const combo = ['street_doc', 'setup_verite', 'cinedna_handheld']
      .map((id) => DATA.refs.find((r) => r.id === id)!);
    const withHh = dnaDirectives(combo, 'REAL');
    const withoutHh = dnaDirectives(combo.slice(0, 2), 'REAL');
    const channels = (d: typeof withHh) => [d.camera, d.light, d.staging, d.motion, d.texture].join(' || ');
    expect(channels(withHh), 'cinedna_handheld is dead weight — no channel changed').not.toBe(channels(withoutHh));
  });

  // TUR 3 / B4: DNA_MAP regexes scanned the refs' `use` field — advisory prose,
  // not DNA. street_doc's use text ("human-scale…") tripped the colossal-scale
  // staging entry, and generic use prose filled the 2 camera slots before the
  // combo's identity line ("documentary handheld micro-drift") could enter.
  it('TUR3-B4: doc combo carries its handheld camera identity and no giant-scale staging', () => {
    const combo = ['street_doc', 'setup_verite', 'cinedna_handheld']
      .map((id) => DATA.refs.find((r) => r.id === id)!);
    const d = dnaDirectives(combo, 'REAL');
    expect(d.camera, `handheld identity line missing from camera channel:\n${d.camera}`)
      .toMatch(/documentary handheld micro-drift/);
    expect(d.staging, `giant-scale staging leaked into a human-scale doc combo:\n${d.staging}`)
      .not.toMatch(/scale contrast/);
  });
});

// KÖK 6 dönüşümü: applyWorldTaboo (konsept öznesindeki yasak kelimeyi ikame etme)
// SÖKÜLDÜ. Onun yerine world negatif firewall'ı doğrudan image prompt Negative
// satırına akar — Claude yasakları oradan görür. Site artık özne uydurmadığı için
// "warm-token subject" üretmek YAPISAL OLARAK imkânsız.
describe('KÖK 6 dönüşümü — world negatif firewall image prompt Negative satırında', () => {
  const romanticSrc = 'aşk mektup ayrılık hasret duygusal yolculuk';
  const imgFor = (worldId: string) => {
    const world = DATA.worlds.find((w) => w.id === worldId)!;
    return buildImagePrompt(1, { subject: '', event: '', matched: false }, 'measured rise', {
      ...FW_CTX, world, register: 'STY', sourceBeat: romanticSrc,
    });
  };

  it('solo_leveling_gate (NO warm palette) firewall\'ı Negative satırına akar', () => {
    const p = imgFor('solo_leveling_gate');
    expect(p).toMatch(/NO warm palette/i);
    // Site özne uydurmadığı için warm-token banka öznesi yapısal imkânsız; kaynak verbatim.
    expect(p).toContain(romanticSrc);
    expect(hasBankResidue(p)).toBe(false);
  });

  it('solo_leveling firewall + verbatim kaynak birlikte taşınır (beat collapse yok — site özne üretmez)', () => {
    const p = imgFor('solo_leveling_gate');
    expect(p).toContain('Scene brief (Claude yazar)');
    expect(p).toMatch(/NO warm palette, NO pastel/i);
    expect(p).toContain(romanticSrc);
  });

  it('warm-permitting world (ghibli) kendi firewall\'ını akıtır, warm-yasağı DAYATMAZ', () => {
    const p = imgFor('ghibli_hayao');
    expect(p).not.toMatch(/NO warm palette/i);
    expect(p).toMatch(/NO neon color/i);
  });

  it('deakins_naturalist (NO neon) firewall\'ı Negative satırında', () => {
    const p = imgFor('deakins_naturalist');
    expect(p).toMatch(/NO neon/i);
  });
});

describe('generateBatch — REAL fallback path (unmatched concepts) events not cloned (social_reels_real)', () => {
  // social_short preset dump proved this RED: architectureFallbackConcept's REAL
  // facet rotation received no sceneIndex → every scene got facets[0] verbatim.
  const socialInput = {
    projectTopic: 'El yapımı seramik atölyesinin hikâyesi',
    projectClass: 'SOCIAL_REELS_REALISM',
    sceneCount: 5,
    selectedWorldId: 'social_reels_real',
    selectedPropId: 'none',
    selectedRefIds: [] as string[],
    selectedPaletteId: 'muted_documentary',
    selectedMusicId: '',
    imageModel: 'flux',
    videoModel: 'kling_3',
  };

  it('5 sahnenin motion brief\'i kendi verbatim kaynağını taşır → pairwise farklı (klon yok)', () => {
    const result = generateBatch(socialInput as any);
    expect(result.status).not.toBe('BLOCKED');
    // Banka event/fallback rotasyonu söküldü; her sahne kendi kaynak beat'ini taşır.
    for (const s of result.scenes) {
      expect(s.motionPrompt, `Sahne ${s.id} Claude Motion brief yok`).toContain('Motion brief (Claude yazar)');
      expect(s.motionPrompt, `Sahne ${s.id} kendi kaynağını taşımıyor`).toContain(s.voiceOver);
    }
    const briefs = result.scenes.map(s => s.motionPrompt);
    for (let i = 0; i < briefs.length; i++) {
      for (let j = i + 1; j < briefs.length; j++) {
        expect(briefs[i], `Sahne ${i + 1} ve ${j + 1} aynı motion brief`).not.toBe(briefs[j]);
      }
    }
  });
});

// ============================================================
// ROOT-1 + ROOT-2 regression suite (cerrah Check-6 fix)
// ============================================================
describe('generateBatch 5-scene — event uniqueness + Moving element quality (STY: ghibli_hayao)', () => {
  const styInput = {
    projectTopic: 'Kayıp pusulanın peşinde son yolculuk',
    projectClass: 'STYLIZED_PREMIUM',
    sceneCount: 5,
    cast: '',
    selectedWorldId: 'ghibli_hayao',
    selectedPropId: 'none',
    selectedRefIds: [] as string[],
    selectedPaletteId: 'native_world',
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
  };

  it('(a.i) architecture.exactSourceBeat her sahne için verbatim kaynağı taşır (banka özne uydurmaz)', () => {
    const result = generateBatch(styInput as any);
    expect(result.status).toBe('GENERATED');
    // M3 dürüst ad: architecture.exactSourceBeat = verbatim kaynak beat (banka öznesi değil).
    for (const s of result.scenes) {
      expect(s.architecture.exactSourceBeat, `Sahne ${s.id} exactSourceBeat verbatim kaynağı taşımıyor`).toBe(s.voiceOver);
      expect(hasBankResidue(s.imagePrompt), `Sahne ${s.id} banka izi`).toBe(false);
    }
  });

  it('(a.ii) motion prompt banka Moving element türetmez — Claude Motion brief + verbatim taşır', () => {
    const result = generateBatch(styInput as any);
    for (const s of result.scenes) {
      expect(s.motionPrompt, `Sahne ${s.id} banka Moving element satırı hâlâ var`).not.toContain('Moving element:');
      expect(s.motionPrompt, `Sahne ${s.id} Claude Motion brief yok`).toContain('Motion brief (Claude yazar)');
      expect(s.motionPrompt, `Sahne ${s.id} kendi kaynağını taşımıyor`).toContain(s.voiceOver);
    }
  });

  it('(a.iii) evaluateDirectorCabinet prompt_surgeon success:true on the 5-scene batch', async () => {
    const { evaluateDirectorCabinet } = await import('./qa');
    const result = generateBatch(styInput as any);
    const mockState: any = {
      scenes: result.scenes,
      sceneCount: result.scenes.length,
      selectedWorldId: styInput.selectedWorldId,
      selectedPropId: styInput.selectedPropId,
      projectClass: styInput.projectClass,
      sourceReport: { ok: true, coverage: 100, rawHash: 'h', reconHash: 'h', rawChars: 100, sceneChars: 100, segments: 1 },
    };
    const tips = evaluateDirectorCabinet(mockState);
    const ps = tips.find(t => t.skill === 'prompt_surgeon')!;
    expect(ps, 'prompt_surgeon tip missing').toBeDefined();
    expect(ps.success, `prompt_surgeon FAIL: ${ps.evidence.join(' | ')}`).toBe(true);
  });
});

describe('generateBatch 5-scene — event uniqueness + Moving element quality (REAL: deakins_naturalist)', () => {
  const realInput = {
    projectTopic: 'El yapımı seramik atölyesinin hikâyesi',
    projectClass: 'ULTRAREAL_COMMERCIAL',
    sceneCount: 5,
    cast: '',
    selectedWorldId: 'deakins_naturalist',
    selectedPropId: 'none',
    selectedRefIds: [] as string[],
    selectedPaletteId: 'native_world',
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
  };

  it('(b.i) architecture.exactSourceBeat her sahne için verbatim kaynağı taşır (banka özne uydurmaz)', () => {
    const result = generateBatch(realInput as any);
    expect(result.status).toBe('GENERATED');
    for (const s of result.scenes) {
      expect(s.architecture.exactSourceBeat, `Sahne ${s.id} exactSourceBeat verbatim kaynağı taşımıyor`).toBe(s.voiceOver);
      expect(hasBankResidue(s.imagePrompt), `Sahne ${s.id} banka izi`).toBe(false);
    }
  });

  it('(b.ii) motion prompt banka Moving element türetmez — Claude Motion brief + verbatim taşır', () => {
    const result = generateBatch(realInput as any);
    for (const s of result.scenes) {
      expect(s.motionPrompt, `Sahne ${s.id} banka Moving element satırı hâlâ var`).not.toContain('Moving element:');
      expect(s.motionPrompt, `Sahne ${s.id} Claude Motion brief yok`).toContain('Motion brief (Claude yazar)');
      expect(s.motionPrompt, `Sahne ${s.id} kendi kaynağını taşımıyor`).toContain(s.voiceOver);
    }
  });

  it('(b.iii) evaluateDirectorCabinet prompt_surgeon success:true on the 5-scene REAL batch', async () => {
    const { evaluateDirectorCabinet } = await import('./qa');
    const result = generateBatch(realInput as any);
    const mockState: any = {
      scenes: result.scenes,
      sceneCount: result.scenes.length,
      selectedWorldId: realInput.selectedWorldId,
      selectedPropId: realInput.selectedPropId,
      projectClass: realInput.projectClass,
      sourceReport: { ok: true, coverage: 100, rawHash: 'h', reconHash: 'h', rawChars: 100, sceneChars: 100, segments: 1 },
    };
    const tips = evaluateDirectorCabinet(mockState);
    const ps = tips.find(t => t.skill === 'prompt_surgeon')!;
    expect(ps, 'prompt_surgeon tip missing').toBeDefined();
    expect(ps.success, `prompt_surgeon FAIL: ${ps.evidence.join(' | ')}`).toBe(true);
  });
});

// Eski "Moving element FORMAT guard" → banka Moving element söküldü. Yeni sözleşme:
// her sahnenin motion prompt'u tam sinematografi çerçevesi (Camera + Motion brief +
// Rhythm + Engine grammar + frame-gate başlığı + NEGATIVE) taşır, banka Moving
// element/Event satırı YOK.
describe('Motion brief FORMAT guard (banka Moving element söküldü)', () => {
  const wellFormed = (input: any) => {
    const result = generateBatch(input);
    for (const s of result.scenes) {
      const p = s.motionPrompt || '';
      expect(p, `Sahne ${s.id} banka Moving element satırı hâlâ var`).not.toContain('Moving element:');
      expect(p, `Sahne ${s.id} banka Event satırı hâlâ var`).not.toContain('Event:');
      expect(p, `Sahne ${s.id} Claude Motion brief yok`).toContain('Motion brief (Claude yazar)');
      expect(p, `Sahne ${s.id} Camera satırı yok`).toMatch(/Camera:\s*.+\./);
      expect(p, `Sahne ${s.id} Engine grammar yok`).toMatch(/Engine grammar/);
      expect(p, `Sahne ${s.id} frame-gate başlığı yok`).toContain('MOTION (i2v · plays the approved start frame)');
      expect(p, `Sahne ${s.id} NEGATIVE bloğu yok`).toMatch(/NEGATIVE:/);
    }
  };

  it('(c) STY batch — motion prompt tam çerçeve, banka Moving element yok', () => {
    wellFormed({
      projectTopic: 'Kayıp pusulanın peşinde son yolculuk', projectClass: 'STYLIZED_PREMIUM',
      sceneCount: 5, cast: '', selectedWorldId: 'ghibli_hayao', selectedPropId: 'none',
      selectedRefIds: [], selectedPaletteId: 'native_world', selectedMusicId: '',
      imageModel: 'nano_banana_2', videoModel: 'kling_3',
    });
  });

  it('(c) REAL batch — motion prompt tam çerçeve, banka Moving element yok', () => {
    wellFormed({
      projectTopic: 'El yapımı seramik atölyesinin hikâyesi', projectClass: 'ULTRAREAL_COMMERCIAL',
      sceneCount: 5, cast: '', selectedWorldId: 'deakins_naturalist', selectedPropId: 'none',
      selectedRefIds: [], selectedPaletteId: 'native_world', selectedMusicId: '',
      imageModel: 'nano_banana_2', videoModel: 'kling_3',
    });
  });
});

describe('motion brief — banka klozu kelime ortasından kesmez (verbatim kaynak taşır)', () => {
  it('motion brief verbatim kaynağı taşır — kıyılmış banka klozu yok', () => {
    const input = { ...({} as any), projectClass: 'ANIMATION_EDU', selectedWorldId: 'pixar_3d_edu', selectedRefIds: [], selectedPaletteId: 'vibrant_edu', selectedPropId: 'none', projectTopic: 'Su Döngüsü', sceneCount: 5, videoModel: 'kling_3', imageModel: 'nano_banana_2' };
    const result = generateBatch(input as any);
    for (const scene of result.scenes) {
      expect(scene.motionPrompt, `scene ${scene.id} banka Moving element satırı hâlâ var`).not.toContain('Moving element:');
      expect(scene.motionPrompt, `scene ${scene.id} Claude Motion brief yok`).toContain('Motion brief (Claude yazar)');
      // Kaynak beat motion brief içinde verbatim geçer (kıyma yok).
      expect(scene.motionPrompt, `scene ${scene.id} kaynağı verbatim taşımıyor`).toContain(scene.voiceOver);
    }
  });
});

// ============================================================
// paletteLightPrompt bug-regression suite (BUG-A / BUG-B / BUG-C)
// ============================================================
describe('paletteLightPrompt — bug-regression A/B/C', () => {
  // Fixtures pulled from SURGERY_DATA — exact same objects the runtime uses.
  const earthNatural = DATA.palettes.find((p) => p.id === 'earth_natural')!;
  const warmAutumn   = DATA.palettes.find((p) => p.id === 'warm_autumn')!;
  const nativeWorld  = DATA.palettes.find((p) => p.id === 'native_world')!;
  const pixarWorld   = DATA.worlds.find((w) => w.id === 'pixar_3d_edu')!;
  const deakinsWorld = DATA.worlds.find((w) => w.id === 'deakins_naturalist')!;

  // BUG-A: hex palette character words must appear exactly ONCE (no duplication).
  // earth_natural bias starts with "Umber, ochre, sand, cream" — previously the
  // charClause ("— palette character: Umber, ochre, sand, cream. Best for Deakins native")
  // was followed immediately by the full bias which repeated those same words.
  it('BUG-A: earth_natural — character phrase appears only once (no duplication)', () => {
    const out = paletteLightPrompt(earthNatural, pixarWorld);
    // "Umber" appears in the character clause; it must not appear a second time.
    const firstIdx = out.indexOf('Umber');
    const lastIdx  = out.lastIndexOf('Umber');
    expect(firstIdx, `"Umber" must appear in output`).toBeGreaterThanOrEqual(0);
    expect(firstIdx, `"Umber" appeared twice — duplication bug still present:\n${out}`).toBe(lastIdx);
  });

  // BUG-B: advisor meta-language ("Best for", "pairs with", "Default choice")
  // must NOT reach the image prompt. Only physical/visual character language is allowed.
  it('BUG-B: warm_autumn — "Best for" meta-language must NOT appear in prompt', () => {
    const out = paletteLightPrompt(warmAutumn, pixarWorld);
    expect(out, `Meta-language "Best for" leaked into prompt:\n${out}`).not.toMatch(/Best for/i);
  });

  it('BUG-B: golden_dust_epic — "pairs with" meta-language must NOT appear in prompt', () => {
    const goldenDust = DATA.palettes.find((p) => p.id === 'golden_dust_epic')!;
    const out = paletteLightPrompt(goldenDust, pixarWorld);
    expect(out, `Meta-language "pairs with" leaked into prompt:\n${out}`).not.toMatch(/pairs with/i);
  });

  // TUR 3 / C1: biasCharacterClause kept the last chunk's inner period AND appended
  // its own → "highlight.." artifact in 11/12 palettes.
  it('TUR3-C1: no double-period artifact in any palette prompt', () => {
    for (const p of DATA.palettes) {
      const out = paletteLightPrompt(p, pixarWorld);
      expect(out, `${p.id} carries ".." artifact:\n${out}`).not.toMatch(/\.\./);
    }
  });

  // TUR 3 / C2 (evrim): eskiden earth/golden aynı "warm burnt orange" ailesine
  // çöküp özdeş monokrom başlık üretiyordu; umber/ivory hassasiyeti (matris kökü)
  // slotları zaten ayrıştırdığı için sıkıştırma bu paletlerde artık devreye
  // girmiyor. Korunan invariant: iki palet ayırt edilebilir kalır VE hiçbir palet
  // dört slotu tek özdeş renk cümlesiyle dolduran makine çorbasına dönmez.
  it('TUR3-C2: earth_natural and golden_dust_epic stay distinguishable, no machine-soup hue repetition', () => {
    const earth = DATA.palettes.find((p) => p.id === 'earth_natural')!;
    const golden = DATA.palettes.find((p) => p.id === 'golden_dust_epic')!;
    const e = paletteLightPrompt(earth, pixarWorld);
    const g = paletteLightPrompt(golden, pixarWorld);
    expect(e, `identical palette prompts:\n${e}`).not.toBe(g);
    for (const out of [e, g]) {
      const phrases = [...out.matchAll(/read as ([a-z- ]+?)(?=,|\s+—)/g)].map((m) => m[1].trim());
      if (phrases.length) {
        expect(new Set(phrases).size, `machine-soup hue repetition:\n${out}`).toBeGreaterThan(1);
      } else {
        // Compressed monochrome form — keying word must keep palettes distinct.
        expect(out).toMatch(/a single [a-z- ]+-keyed .* family/i);
      }
    }
  });

  // KÖK 7e: pastel palettes have PALE shadow hexes — describing them as "bright
  // shadows" is a physics contradiction for the image engine. High-key language
  // ("lifted") is the correct filmic description.
  it('KÖK 7e: pastel_soft — shadows never described as bright/near-white, lifted instead', () => {
    const pastel = DATA.palettes.find((p) => p.id === 'pastel_soft')!;
    const out = paletteLightPrompt(pastel, pixarWorld);
    expect(out, `"bright shadows" physics oddity present:\n${out}`).not.toMatch(/shadows read as (bright|near-white)/i);
    expect(out).not.toMatch(/\b(bright|near-white)\s+shadows\b/i);
    expect(out, `high-key shadows must read as lifted:\n${out}`).toMatch(/shadows read as lifted/i);
  });

  // BUG-C: native_world path — character clause must come from world.palette_lock.bias
  // (NOT from the native_world palette's own bias which is a UI doc-string).
  it('BUG-C: native_world + pixar_3d_edu — world bias character visible, UI doc-string absent', () => {
    const out = paletteLightPrompt(nativeWorld, pixarWorld);
    // pixar palette_lock.bias starts with "warm-honey dominant"
    expect(out, `World bias character must appear in prompt:\n${out}`).toMatch(/warm-honey/i);
    expect(out, `UI doc-string must NOT appear in prompt:\n${out}`).not.toMatch(/Default choice/i);
    expect(out, `UI doc-string must NOT appear in prompt:\n${out}`).not.toMatch(/Do not override/i);
  });

  it('BUG-C: native_world + deakins_naturalist — world bias character visible, UI doc-string absent', () => {
    const out = paletteLightPrompt(nativeWorld, deakinsWorld);
    // deakins palette_lock.bias = "earth-natural (umber, ochre, olive, sky-neutral)..."
    expect(out, `World bias character must appear in prompt:\n${out}`).toMatch(/earth-natural|umber|ochre/i);
    expect(out, `UI doc-string must NOT appear in prompt:\n${out}`).not.toMatch(/Default choice/i);
    expect(out, `UI doc-string must NOT appear in prompt:\n${out}`).not.toMatch(/verbatim/i);
  });
});

// ============================================================
// BUG 1 — splitTopLevelCommas helper + parantez-körü virgül bölme
// ============================================================
describe('splitTopLevelCommas — parantez içi virgülleri bölmez', () => {
  it('düz string virgülden doğru böler', () => {
    const parts = splitTopLevelCommas('the hand lifts the product, the shadow settles');
    expect(parts).toHaveLength(2);
    expect(parts[0]).toBe('the hand lifts the product');
    expect(parts[1]).toBe('the shadow settles');
  });

  it('parantez içindeki virgülü ayırıcı saymamalı', () => {
    const parts = splitTopLevelCommas('a single element of the journey (vessel, path, wind) confirms direction');
    expect(parts).toHaveLength(1);
    expect(parts[0]).toBe('a single element of the journey (vessel, path, wind) confirms direction');
  });

  it('parantez öncesi ve sonrası virgülleri doğru ayırır', () => {
    const parts = splitTopLevelCommas('the light (warm, sodium) settles, the grip confirms');
    expect(parts).toHaveLength(2);
    expect(parts[0]).toBe('the light (warm, sodium) settles');
    expect(parts[1]).toBe('the grip confirms');
  });
});

describe('BUG 1 söküm regresyonu — motion brief kaynağı kesmeden verbatim taşır', () => {
  it('parantezli-virgüllü kaynak beat motion brief\'te kesiğe uğramadan verbatim geçer', () => {
    // Eski kök: banka event klozu "(vessel" diye kesiliyordu. Artık banka klozu YOK;
    // motion brief verbatim kaynak beat taşır (parantezler dahil).
    const sourceBeat = 'Yolculuğun tek unsuru (yelken, rota, rüzgâr) yönü doğrular.';
    const out = buildMotionPrompt(1, { subject: '', event: '', matched: false }, '50mm eye-level', {} as any, undefined, undefined, null, sourceBeat);
    expect(out).not.toContain('Moving element:');
    expect(out).toContain('Motion brief (Claude yazar)');
    expect(out, 'kaynak beat verbatim taşınmadı (kesildi)').toContain(sourceBeat);
  });
});

describe('BUG 1 — biasCharacterClause: deakins tarzı parantezli bias kesilmemeli', () => {
  it('deakins_naturalist world palette_lock bias parantez içi kesiğe uğramadan çıktıya girmeli', () => {
    const deakinsWorld = DATA.worlds.find((w) => w.id === 'deakins_naturalist')!;
    // deakins bias: "earth-natural (umber, ochre, olive, sky-neutral); accent is single warm practical (tungsten, fire, sodium); ..."
    // Eski kod "tungsten." diye kesiyordu — parantez ortada açık kalıyordu
    const out = paletteLightPrompt(undefined, deakinsWorld);
    // Çıktıda açık (kapanmamış) parantez bulunan bölüm olmamalı
    // Her açık parantezin bir kapanışı olmalı
    const segments = out.split(/palette character:/i);
    if (segments.length > 1) {
      const charPart = segments[1].split(/;/)[0]; // ilk noktalı virgüle kadar
      const openCount = (charPart.match(/\(/g) || []).length;
      const closeCount = (charPart.match(/\)/g) || []).length;
      expect(openCount, `Karakter bölümünde açık kalan parantez var: "${charPart}"`).toBe(closeCount);
    }
  });
});

// 🔒 PALET FİZİĞİ KAPANI (Palette Translation Law'ın ikinci yarısı).
// Yasa iki şey söyler: (a) ham hex prompt'a sızmaz, (b) palet prompt'a FİZİKSEL
// IŞIK DİLİ olarak geçer. (a) test ediliyordu, (b) hiç test edilmemişti — ve
// çalışmıyordu: biasCharacterClause'daki `.slice(0, 4)` ilk 4 chunk'ı alıyor,
// 12 seçilebilir paletin de ilk 4 chunk'ı RENK ADI olduğu için fiziksel cümle
// (5. chunk'tan itibaren) her seferinde düşüyordu.
//
// Sonuç: deep_noir'ın "Total shadow absorption, one contained ember accent,
// industrial bounce barely lifting faces"ı prompt'a HİÇ girmiyordu. Ajan paleti
// 4 renk adı olarak görüyor, ışık davranışını görmüyordu. Dünyanın KENDİ paleti
// (native_world yolu) fiziği taşıyordu — Mami bir palet seçtiği an ışık dili
// sessizce kayboluyordu.
//
// META_LANG filtresi insan-danışman cümlelerini ("Best for…", "Pairs with…") zaten
// eliyor; slice'ın koruduğu bir şey kalmamıştı.
describe("seçilebilir paletin fiziksel ışık cümlesi prompt'a iner", () => {
  const WORLD = DATA.worlds.find((w) => w.id === 'pixar_3d_edu')!;
  const PHYSICS: Record<string, string> = {
    deep_noir: 'total shadow absorption',
    pastel_soft: 'high-key diffused north-window softness',
    cool_scientific: 'clinical blue-cyan precision',
    high_contrast_bold: 'graphic two-primary tension',
    golden_dust_epic: 'low-angle desert-sun grazing',
    vibrant_edu: 'broad saffron key lands flat and even',
    warm_autumn: 'grounded afternoon-sun warmth',
    neon_rain_romance: 'wet-neon night',
    soviet_muted: 'photochemical institutional desaturation',
    desaturated_cinematic: 'overcast lifted-shadow restraint',
    earth_natural: 'single consistent warm light source',
  };

  for (const [paletteId, physics] of Object.entries(PHYSICS)) {
    it(`${paletteId}: "${physics}"`, () => {
      const palette = DATA.palettes.find((p) => p.id === paletteId);
      expect(palette, `${paletteId} paleti yok`).toBeTruthy();
      const out = paletteLightPrompt(palette, WORLD).toLowerCase();
      expect(out, `${paletteId}: fiziksel ışık cümlesi prompt'a hiç inmiyor`).toContain(physics);
    });
  }

  // CÜMLE SINIRI. Renk lead'i ile fizik cümlesi arasında NOKTA olmalı. Virgülle
  // birleşirlerse ajan fiziği 5. RENK sanır:
  //   "…, silver-gray, Total shadow absorption, one contained ember accent"
  // Bu fix'in ilk sürümü tam olarak bunu üretti: 794 test yeşildi, prompt yanlıştı.
  // ("vitest geçti" ≠ doğrulandı — prompt gözle okundu, kusur orada görüldü.)
  it("renk lead'i ile fizik cümlesi nokta ile ayrılır, virgülle değil", () => {
    const cases: [string, string, string][] = [
      ['deep_noir', 'silver-gray', 'Total shadow absorption'],
      ['vibrant_edu', 'board-white', 'Broad saffron key'],
      ['golden_dust_epic', 'bone-cream', 'Low-angle desert-sun'],
      ['cool_scientific', 'cold aqua-white', 'Clinical blue-cyan'],
    ];
    for (const [paletteId, lastColour, physicsOpener] of cases) {
      const palette = DATA.palettes.find((p) => p.id === paletteId)!;
      const out = paletteLightPrompt(palette, WORLD);
      expect(out, `${paletteId}: renk lead'i fiziğe VİRGÜLLE bağlanmış — ajan fiziği renk sanır`)
        .not.toContain(`${lastColour}, ${physicsOpener}`);
      expect(out, `${paletteId}: renk lead'i ile fizik arasında cümle sınırı yok`)
        .toContain(`${lastColour}. ${physicsOpener}`);
    }
  });

  // Sözleşme korunmalı: ham hex ASLA sızmaz, insan-danışman dili ASLA sızmaz.
  it('fizik inerken ham hex ve danışman dili sızmaz', () => {
    for (const p of DATA.palettes) {
      const out = paletteLightPrompt(p, WORLD);
      expect(out, `${p.id} ham hex sızdırdı`).not.toMatch(/#[0-9a-f]{3,8}\b/i);
      expect(out, `${p.id} danışman dili sızdırdı`).not.toMatch(/\b(best for|pairs with|default choice)\b/i);
    }
  });

  // slice(0,4) kalkınca danışman dilini tutan TEK şey META_LANG filtresi. Bugünkü
  // 12 paletin hiçbirinde "Best for…" kalmadığı için o filtreyi silsen bile hiçbir
  // test kırmızı vermiyordu (mutasyonla görüldü) — yani filtre sınanmıyordu.
  // Sentetik bias ile gerçek kapan: birileri yarın danışman cümlesi yazarsa
  // prompt'a sızmasın.
  it('META_LANG danışman cümlesini keser (sentetik bias)', () => {
    const advisorBias = {
      id: 'synthetic_test',
      name: 'Synthetic',
      hex: { shadow: '#101010', mid: '#808080', accent: '#FF0000', highlight: '#FFFFFF' },
      bias: 'Ink black, ash gray, signal red, paper white. Total shadow absorption. Best for hikaye-anlatım. Pairs with deep_noir. NO lifted shadow.',
    };
    const out = paletteLightPrompt(advisorBias as never, WORLD);
    expect(out, 'fizik cümlesi kesilmiş').toContain('Total shadow absorption');
    expect(out, '"Best for" danışman cümlesi prompt\'a sızdı').not.toMatch(/best for/i);
    expect(out, '"Pairs with" danışman cümlesi prompt\'a sızdı').not.toMatch(/pairs with/i);
  });
});

// ============================================================
// BUG 2 — Türkçe sızıntı: hiçbir prompt TR diakritik içermemeli
// ============================================================
describe('BUG 2 — Türkçe sızıntı yok: batch çıktısında TR karakter olmamalı', () => {
  const TR_DIACRITIC_RE = /[çğıöşüÇĞİÖŞÜ]/;
  const KNOWN_MANGLED = /kayp\b|pusulann|atlyesinin|hikyesi/;

  it('deakins_naturalist 5 sahne — motionPrompt\'ta graft kökenli TR token olmamalı', () => {
    // BUG 2 (a): event'e TR graft yapıştırılması → "(kayp)", "(pusulann)", "(atlyesinin)"
    // BUG 2 (b): Moving element'e "· beatWords" TR olarak eklenmesi → "· atölyesinin hikâyesi"
    // onScreenText ('yapımı seramik' gibi) kasıtlı preserve edilen overlay — muaf.
    const out = generateBatch({
      projectTopic: 'El yapımı seramik atölyesinin hikâyesi ve pusulanın ruhu',
      projectClass: 'ULTRAREAL_COMMERCIAL',
      sceneCount: 5,
      selectedWorldId: 'deakins_naturalist',
      selectedPropId: 'none',
      selectedRefIds: [],
      selectedPaletteId: 'native_world',
      selectedMusicId: '',
      imageModel: 'flux',
      videoModel: 'kling_3',
    } as any);
    for (const scene of out.scenes) {
      // Kıyılmış TR token asla olmamalı (onScreenText olsun olmasın)
      expect(
        KNOWN_MANGLED.test(scene.motionPrompt),
        `Sahne ${scene.id} motionPrompt'ta kıyılmış TR token:\n${scene.motionPrompt}`
      ).toBe(false);
      // Moving element satırı TR içermemeli (bu graft kaynaklı sızıntı)
      const meMatch = /Moving element: (.+?) — already in frame/.exec(scene.motionPrompt);
      if (meMatch) {
        expect(
          TR_DIACRITIC_RE.test(meMatch[1]),
          `Sahne ${scene.id} Moving element TR içeriyor: "${meMatch[1]}"`
        ).toBe(false);
      }
      // Event satırı TR içermemeli
      const evMatch = /Event: (.+?)\./.exec(scene.motionPrompt);
      if (evMatch) {
        expect(
          TR_DIACRITIC_RE.test(evMatch[1]),
          `Sahne ${scene.id} Event satırı TR içeriyor: "${evMatch[1]}"`
        ).toBe(false);
      }
    }
  });

  it('deakins_naturalist 5 sahne — imagePrompt\'ta graft kökenli TR token olmamalı (onScreenText muaf)', () => {
    const out = generateBatch({
      projectTopic: 'El yapımı seramik atölyesinin hikâyesi ve pusulanın ruhu',
      projectClass: 'ULTRAREAL_COMMERCIAL',
      sceneCount: 5,
      selectedWorldId: 'deakins_naturalist',
      selectedPropId: 'none',
      selectedRefIds: [],
      selectedPaletteId: 'native_world',
      selectedMusicId: '',
      imageModel: 'flux',
      videoModel: 'kling_3',
    } as any);
    // onScreenText ('yapımı seramik' gibi) kasıtlı korunan kullanıcı metni — muaf.
    // Graft kaynaklı kıyılmış tokenlar (kayp, pusulann, atlyesinin) asla olmamalı.
    for (const scene of out.scenes) {
      expect(
        KNOWN_MANGLED.test(scene.imagePrompt),
        `Sahne ${scene.id} imagePrompt'ta kıyılmış TR token:\n${scene.imagePrompt}`
      ).toBe(false);
      // Event'ten türetilen Dominant element gibi kısımlara TR sızmamalı
      // (onScreenText satırları hariç — onlar preserve edilmesi gereken overlay)
      const promptWithoutOST = scene.imagePrompt.replace(/Visible text overlay:[^.]+\./g, '').replace(/Text\/logo:[^.]+\./g, '');
      expect(
        KNOWN_MANGLED.test(promptWithoutOST),
        `Sahne ${scene.id} imagePrompt (OST hariç) kıyılmış token:\n${promptWithoutOST.slice(0,200)}`
      ).toBe(false);
    }
  });

  it('graft söküldü: architecture.exactSourceBeat verbatim kaynak (TR meşru); kıyılmış TR token asla', () => {
    // Eski kök: bank tükenince event'e TR graft yapıştırılıyordu (kayp/pusulann...).
    // Yeni akış: graft YOK. architecture.exactSourceBeat = verbatim kaynak beat — TR diakritik
    // artık MEŞRU (kaynak Türkçe); ama KIYILMIŞ (mangled) token asla olmamalı.
    const out = generateBatch({
      projectTopic: 'Seramik ve atölye ve çanak çömlek ve kil',
      projectClass: 'ULTRAREAL_COMMERCIAL',
      sceneCount: 8,
      selectedWorldId: 'deakins_naturalist',
      selectedPropId: 'none',
      selectedRefIds: [],
      selectedPaletteId: 'native_world',
      selectedMusicId: '',
      imageModel: 'flux',
      videoModel: 'kling_3',
    } as any);
    for (const scene of out.scenes) {
      // exactSourceBeat = verbatim kaynak (banka öznesi değil)
      expect(scene.architecture.exactSourceBeat, `S${scene.id} exactSourceBeat verbatim kaynağı taşımıyor`).toBe(scene.voiceOver);
      // kıyılmış graft token asla (image + motion)
      expect(KNOWN_MANGLED.test(scene.architecture.exactSourceBeat), `Beat'te kıyılmış token: "${scene.architecture.exactSourceBeat}"`).toBe(false);
      expect(KNOWN_MANGLED.test(scene.motionPrompt), `S${scene.id} motionPrompt kıyılmış token`).toBe(false);
      expect(KNOWN_MANGLED.test(scene.imagePrompt), `S${scene.id} imagePrompt kıyılmış token`).toBe(false);
      // banka Moving element satırı söküldü
      expect(scene.motionPrompt, `S${scene.id} banka Moving element hâlâ var`).not.toContain('Moving element:');
    }
  });
});

// ============================================================
// BUG 4 — Statik Moving Element: "stays anchored" seçilmemeli
// ============================================================
// Eski BUG 4 (statik-kloz filtresi) → movingElementLabel SÖKÜLDÜ; artık banka event
// klozu türetilmiyor. Yeni sözleşme: motion brief WHAT'ı Claude'a devreder + verbatim
// kaynak taşır; hiçbir banka Moving element/Event klozu (statik ya da değil) basılmaz.
describe('BUG 4 söküm regresyonu — banka event klozu (statik/aktif) türetilmez', () => {
  it('statik-kloz içeren banka event enjekte edilse bile çıktıya sızmaz — Claude Motion brief taşır', () => {
    const event = 'the hand completes one calm lift of the product, the shadow stays anchored on the surface, and the grip settles believable';
    const out = buildMotionPrompt(2, { subject: 'ceramic product', event, matched: true }, '85mm rack focus', {} as any, undefined, undefined, null, 'El ürünü ışığa doğru kaldırır.');
    expect(out).not.toContain('Moving element:');
    expect(out).not.toContain('stays anchored');
    expect(out).toContain('Motion brief (Claude yazar)');
    expect(out).toContain('El ürünü ışığa doğru kaldırır.');
  });

  it('tümü statik banka event enjekte edilse bile hiçbiri çıktıya girmez', () => {
    const event = 'the shadow stays anchored, the light remains still, the surface holds';
    const out = buildMotionPrompt(1, { subject: 'table', event, matched: true }, '50mm', {} as any, undefined, undefined, null, 'Masa sakin bir ışık altında durur.');
    expect(out).not.toContain('Moving element:');
    expect(out).not.toMatch(/stays anchored|remains still|the surface holds/);
    expect(out).toContain('Motion brief (Claude yazar)');
  });
});

// ─── AÇILIŞ DENETİMİ 2026-07-04: final-brief matrisinden çıkan kökler ─────────
// movingElementLabel söküldü → eski kloz-seçim testleri yeni Motion brief sözleşmesine döndü.
describe('motion brief kloz-seçim söküm regresyonu (matris kökleri)', () => {
  const dna = { names: '', camera: 'medium', light: 'soft', staging: 'centered', motion: 'gentle drift', texture: '', avoid: '', perRef: [] };

  it('enjekte banka event klozları (soyut değer / or-alternatifi) çıktıya sızmaz; verbatim kaynak taşır', () => {
    const event = 'the shared object passes once between them or one figure reaches and holds without the other responding, a single warm value confirming the human cost, and the frame settles on the space between';
    const sourceBeat = 'Paylaşılan nesne ikisi arasında bir kez geçer.';
    const prompt = buildMotionPrompt(2, { subject: '', event, matched: true }, 'measured rise from low vantage', dna, 5, 'kling_3', null, sourceBeat);
    expect(prompt).not.toContain('Moving element:');
    expect(prompt).not.toContain('warm value confirming');
    expect(prompt).not.toContain('the shared object passes once between them');
    expect(prompt).toContain('Motion brief (Claude yazar)');
    expect(prompt).toContain(sourceBeat);
  });

  it('em-dash devamı içeren banka event çıktıya sızmaz; verbatim kaynak taşır', () => {
    const event = 'one natural light change crosses the scene a single time — a cloud shadow travelling, a sun angle easing — and the vista settles in believable calm';
    const sourceBeat = 'Doğal ışık sahneyi bir kez katederken vista sakinleşir.';
    const prompt = buildMotionPrompt(2, { subject: '', event, matched: false }, 'static hold', dna, 5, 'kling_3', null, sourceBeat);
    expect(prompt).not.toContain('Moving element:');
    expect(prompt).not.toContain('a sun angle easing');
    expect(prompt).toContain('Motion brief (Claude yazar)');
    expect(prompt).toContain(sourceBeat);
  });
});

describe('world camera law — register & allowance (A-B4 false positive)', () => {
  it('a law that ALLOWS slow deliberate dolly is not a static-hold world (deakins)', () => {
    const deakins = DATA.worlds.find((w) => w.id === 'deakins_naturalist')!;
    const travelling = 'slow arc that re-carves the silhouette against the contrasting value field';
    expect(applyWorldCameraLaw(travelling, 3, deakins, 'REAL')).toBe(travelling);
  });

  it('static replacement in a REAL-register world never speaks cel language', () => {
    const fakeWorld = {
      id: 'fake_static_real', name: 'Fake', group: 'CINEMATIC_REAL',
      render_law: 'Camera holds are static and deliberate.',
    } as unknown as Parameters<typeof applyWorldCameraLaw>[2];
    for (let s = 1; s <= 6; s++) {
      const out = applyWorldCameraLaw('slow push along the ridge', s, fakeWorld, 'REAL');
      expect(out.toLowerCase(), `cel dili photoreal'e sızdı (scene ${s}): "${out}"`).not.toContain('cel');
      expect(out.toLowerCase()).not.toContain('painted');
    }
  });

  it('cel worlds keep their cel-flavoured static pool (retro_anime_film)', () => {
    const retro = DATA.worlds.find((w) => w.id === 'retro_anime_film')!;
    const outs = [1, 2, 3].map((s) => applyWorldCameraLaw('slow push along the ridge', s, retro, 'STY'));
    expect(outs.some((o) => /cel|painted|locked static/i.test(o))).toBe(true);
  });
});

// STY bank söküldü → Türkçe keyword false-positive/coverage kavramları YAPISAL
// OLARAK imkânsız. Yeni sözleşme: hangi kaynak olursa olsun banka öznesi üretilmez,
// verbatim kaynak taşınır, banka izi yok.
describe('STY bank söküm regresyonu — keyword false-positive yapısal imkânsız', () => {
  it('"haritanın" hiçbir romance banka öznesi ("emotionally charged") üretmez, verbatim taşır', () => {
    const src = 'Fırtınalı denizde efsanevi haritanın peşindeki son yolculuk';
    const p = frameFor(src, 'STY');
    expect(p).not.toContain('emotionally charged');
    expect(p).toContain(src);
    expect(hasBankResidue(p)).toBe(false);
  });

  it('storm-sea ve map kaynakları banka öznesi üretmez; verbatim + Claude talimatı taşır', () => {
    for (const src of ['Fırtınalı denizde dev dalgalarla boğuşan gemi', 'Efsanevi hazine haritası ve pusulanın sırrı']) {
      const p = frameFor(src, 'STY');
      expect(p).toContain(src);
      expect(p).toContain('Scene brief (Claude yazar)');
      expect(hasBankResidue(p)).toBe(false);
    }
  });

  it('4 sahnelik batch: her sahne kendi verbatim kaynağını taşır (grafted klon yok)', () => {
    const rawSource = [
      'Fırtına bütün gece sürdü.',
      'Şafakta ufukta ada belirdi.',
      'Kaptan haritayı ışığa çevirdi.',
      'Gizli koya usta bir manevrayla girdiler.',
    ].join('\n');
    const beats = autoGroupBeats(rawSource, 'Dengeli', 'kling_3');
    const result = generateBatch({
      projectTopic: 'Fırtınalı yolculuk', projectClass: 'STYLIZED_PREMIUM', sceneCount: beats.length, cast: '',
      selectedWorldId: 'one_piece_toei', selectedPropId: 'none', selectedRefIds: [], selectedPaletteId: '',
      selectedMusicId: '', imageModel: 'nano_banana_2', videoModel: 'kling_3', rawSource, sourceBeats: beats,
    } as any);
    for (const s of result.scenes) {
      // FIX-6: beat prompt'a SRC_LINE-normalize (baş/iç \n → tek boşluk) enjekte edilir;
      // kaynak BYTE-eşit korunur (sourceIntegrity ayrı testli).
      expect(s.imagePrompt).toContain(s.voiceOver.replace(/\s+/g, ' ').trim());
      expect(hasBankResidue(s.imagePrompt)).toBe(false);
    }
  });
});

describe('hexToLightWords — earth-brown and ivory precision', () => {
  it('low-saturation warm brown reads as umber, not burnt orange (#8B7355)', () => {
    expect(hexToLightWords('#8B7355')).toContain('umber');
  });
  it('near-white warm cream reads as ivory (#F4E4C6)', () => {
    expect(hexToLightWords('#F4E4C6')).toContain('ivory');
  });
  it('poster-vibrant One Piece yellow keeps its vivid warm amber reading (#FFC93C)', () => {
    expect(hexToLightWords('#FFC93C')).toBe('vivid warm amber');
  });
  // Palette Translation Law zinciri: QA'nın FIX satırı 8/4/3-haneli hex'i de
  // fiziksel ışık diline çevirebilmeli — alfa kanalı ışık dilini değiştirmez, düşer.
  it('8-digit #RRGGBBAA drops the alpha channel and reads like the 6-digit form', () => {
    expect(hexToLightWords('#FFC93C4D')).toBe(hexToLightWords('#FFC93C'));
  });
  it('3-digit #RGB doubles each nibble and reads like the 6-digit form', () => {
    expect(hexToLightWords('#F00')).toBe(hexToLightWords('#FF0000'));
  });
  it('4-digit #RGBA drops alpha, doubles nibbles, reads like the 6-digit form', () => {
    expect(hexToLightWords('#F00A')).toBe(hexToLightWords('#FF0000'));
  });
});

// koy/köy substring tuzağı banka regex'inin sorunuydu; banka söküldü → tuzak
// YAPISAL OLARAK yok. Yeni sözleşme: her iki kaynak da banka öznesi üretmez, verbatim taşır.
describe('STY bank söküm regresyonu — koy/köy substring tuzağı yapısal imkânsız', () => {
  it('"gizli koya ... manevrayla girdiler" hiçbir pastoral banka öznesi üretmez, verbatim taşır', () => {
    const src = 'Kayalıkların arasındaki gizli koya tek bir usta manevrayla girdiler.';
    const p = frameFor(src, 'STY');
    expect(p).not.toContain('small-scale domestic');
    expect(p).toContain(src);
    expect(hasBankResidue(p)).toBe(false);
  });
  it('gerçek köy konusu da banka öznesi üretmez, verbatim + Claude talimatı taşır', () => {
    const src = 'Dağ köyünde sakin bir sabah';
    const p = frameFor(src, 'STY');
    expect(p).not.toContain('small-scale domestic');
    expect(p).toContain(src);
    expect(p).toContain('Scene brief (Claude yazar)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ON-SCREEN TEXT = KAREDEKİ NESNE, KATMAN DEĞİL
//
// Ders (2026-07-10, Mami): "Mami After Effects bilmiyor" yasası prompt yüzeyinde
// delikti. buildImagePrompt her dünyaya aynı `Visible text overlay ... bottom-center`
// cümlesini basıyordu: (a) `overlay` motora "yapıştırılmış altyazı" dedirtiyor,
// (b) `bottom-center` 33 dünyanın görsel dilini tek bir altyazı konumuna eziyor.
// Oysa her world'ün negative_lock'unda o dünyanın YAZI GRAMERİ zaten yazılı
// ("gothic engraved lettering", "brush-carved woodblock-style lettering", ...) —
// bilgi vardı, prompt'un pozitif emrine hiç bağlanmamıştı. Motor pozitif emri
// dinler; malzeme notu negatif listenin kuyruğunda kayboluyordu.
// Yeni sözleşme: metin dünyanın kendi harf grameriyle, sahnedeki fiziksel bir
// TAŞIYICI YÜZEYDE yaşar. Koordinat verilmez — yüzeyi kareye bakan ajan seçer.
// ─────────────────────────────────────────────────────────────────────────────
describe('on-screen text: katman değil, sahnedeki yüzey', () => {
  const worldWith = (id: string) => DATA.worlds.find((w) => w.id === id)!;
  const frameWithText = (worldId: string, text: string | null) =>
    buildImagePrompt(1, BANK_LIKE, '50mm dolly', {
      ...FW_CTX,
      world: worldWith(worldId),
      register: 'EDU',
      sourceBeat: 'Yanardağ nasıl patlar?',
      onScreenText: text,
    });

  /** Metin cümlesini gövdeden izole eder — testler tüm prompt'a değil O cümleye bakar. */
  const textLineOf = (worldId: string) => {
    const m = frameWithText(worldId, 'Yanardağ').match(/Visible text in-frame:[\s\S]*?only light and camera cross it\./);
    expect(m, `${worldId}: "Visible text in-frame" cümlesi hiç basılmamış`).toBeTruthy();
    return m![0];
  };

  it('metin varken prompt "overlay" demez — overlay = post-production katmanı', () => {
    // Regresyon kapanı: eski cümle `Visible text overlay: '…' — bottom-center` idi.
    expect(textLineOf('castlevania_gothic')).not.toMatch(/overlay/i);
  });

  it('metni sabit bir ekran koordinatına çivilemez — yeri kareye bakan ajan seçer', () => {
    expect(textLineOf('ukiyo_e_print')).not.toMatch(/bottom-center|top-center|lower third|screen (position|coordinate)/i);
  });

  it('metin cümlesi o dünyanın kendi harf gramerini POZİTİF emirde taşır', () => {
    expect(textLineOf('castlevania_gothic')).toContain('Letterform: gothic engraved lettering');
    expect(textLineOf('ukiyo_e_print')).toContain('Letterform: brush-carved woodblock-style lettering');
    expect(textLineOf('kurzgesagt_edu')).toContain('Letterform: flat sans-serif diagram lettering');
    expect(textLineOf('cyberpunk_neon_noir')).toContain('Letterform: neon-sign lettering with a hot core and colored bloom halo');
  });

  it('33 dünyanın hepsi kendi harf gramerini taşır — jenerik metin cümlesi kalmadı', () => {
    for (const w of DATA.worlds) {
      expect(textLineOf(w.id), `${w.id} harf grameri taşımıyor`).toMatch(/Letterform: .+\./);
    }
  });

  it('harf gramerinden "NO English signage" yasağı sızmaz (o Negative bandında yaşar)', () => {
    expect(textLineOf('castlevania_gothic')).not.toMatch(/NO English/i);
    expect(textLineOf('sci_fi_hard_surface')).not.toMatch(/NO English/i);
  });

  it('ajana taşıyıcı yüzey seçtirir: kareye bak, dünyanın yazacağı yüzeyi bul', () => {
    const line = textLineOf('noir_high_contrast');
    expect(line).toMatch(/surface this shot already contains/i);
    expect(line).toMatch(/perspective and material/i);
  });

  it('metin karakter-birebir korunur ve donmuş geometridir', () => {
    const line = textLineOf('castlevania_gothic');
    expect(line).toContain("'Yanardağ'");
    expect(line).toMatch(/character-for-character/i);
    expect(line).toMatch(/never a caption, a subtitle, or a plate floating/i);
  });

  it('metin yokken temiz plaka: yüzen yazı/altyazı/tabela yasaklanır', () => {
    const p = frameWithText('castlevania_gothic', null);
    expect(p).toMatch(/no (floating text|caption|subtitle)/i);
  });

  // Motion tarafı: aynı yasa i2v'de de geçerli. "overlay" demek Kling'e
  // "bu serbest bir katman, kaydırabilirsin" demektir.
  describe('motion prompt: yazı yüzeyin parçası, kayan katman değil', () => {
    const motionWithText = (text: string | null) =>
      buildMotionPrompt(
        1,
        BANK_LIKE,
        '50mm dolly',
        { staging: 's', light: 'l', texture: 't', avoid: 'a' } as never,
        5,
        'kling_3',
        text,
        'Yanardağ nasıl patlar?',
        '',
      );

    it('motion prompt metni "overlay" diye anmaz', () => {
      expect(motionWithText('Yanardağ')).not.toMatch(/overlay/i);
    });

    it('metin yüzeye ait: kaymaz, solmaz, yeniden dizilmez', () => {
      const m = motionWithText('Yanardağ');
      expect(m).toMatch(/written on a surface inside the scene/i);
      expect(m).toMatch(/does not slide, fade, re-typeset or drift/i);
      expect(m).toMatch(/moves only as its surface moves/i);
      expect(m).toMatch(/character-for-character/i);
    });

    it('metin yokken text-protect bandı hiç basılmaz', () => {
      expect(motionWithText(null)).not.toMatch(/Start frame carries/i);
    });

    // qa.ts CHECK 6b `Event: … . (Start frame carries|Rhythm:)` regex'iyle Event
    // satırını kesiyor. Bu başlık değişirse QA sessizce körleşir — burada çivili.
    it('qa.ts CHECK 6b\'nin beklediği segment başlığını basar', () => {
      expect(motionWithText('Yanardağ')).toContain('Start frame carries');
      expect(motionWithText(null)).toMatch(/Rhythm:/);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Negatif cümle bölücüsü kısaltmayı cümle sonu sanmamalı.
//
// brain.ts'in negatif scrub'ı clause'ları `;` ve `'. '` (nokta+boşluk) üzerinden
// böler. "NO direct reproduction of a specific famous historic print (e.g. The Great
// Wave) — original composition in the grammar only" maddesi bu yüzden "…print (e.g"
// + "The Great Wave) — original composition…" diye ikiye ayrılıyordu. İkinci parça
// IP sayılıp haklı olarak scrub ediliyor, ama geriye motora giden "(e.g;" çöp token'ı
// ve yasağın ÖLDÜĞÜ yarım bir cümle kalıyordu — yani IP kesilirken yasak da kesiliyordu.
// (Gerçek üretim kanıtı, 2026-07-10: Negative satırında "(e.g;" göründü.)
// ─────────────────────────────────────────────────────────────────────────────
describe('negatif bölücü: kısaltmadaki nokta cümle sonu değildir', () => {
  const negativeOf = (worldId: string) => {
    const world = DATA.worlds.find((w) => w.id === worldId)!;
    const p = buildImagePrompt(1, BANK_LIKE, '50mm dolly', {
      ...FW_CTX, world, register: 'EDU', sourceBeat: 'Işık nasıl kırılır?',
    });
    return (p.match(/Negative:([\s\S]*?)(?:Clean motion-ready|$)/) || ['', ''])[1];
  };

  it('ukiyo_e_print negatifi yarım "(e.g;" çöpü bırakmaz', () => {
    const neg = negativeOf('ukiyo_e_print');
    expect(neg).not.toMatch(/\(e\.g;/);
    expect(neg).not.toMatch(/\be\.g;/);
  });

  it('kısaltma taşıyan hiçbir dünyanın negatifi yarım kırpılmaz', () => {
    for (const w of DATA.worlds) {
      const neg = negativeOf(w.id);
      expect(neg, `${w.id}: kısaltma yarıda kesilmiş`).not.toMatch(/\b(e\.g|i\.e|etc|vs);/i);
    }
  });

  it('ukiyo_e_print reprodüksiyon yasağı ayakta kalır (IP adı sızmadan)', () => {
    const neg = negativeOf('ukiyo_e_print');
    expect(neg).toMatch(/NO direct reproduction/i);
    expect(neg).not.toMatch(/Great Wave/i); // IP adı yine de sızmaz
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CASTLESS_NOTE dünya-farkında olmalı.
//
// Cast yazılmadığında prompt'un sonuna "No human subject in this frame … never to a
// person." notu basılıyor. Ama whiteboard_explainer'ın render_law'ı elin görünmesini
// ZORUNLU kılıyor: "(4) THE HAND: a human hand and forearm holding a marker is visible
// … never a disembodied line." Aynı prompt motora iki zıt emir veriyordu; "insan yok"
// kazanırsa dünyanın kendi yasakladığı görüntü (bedensiz çizgi) çıkıyor.
// Yasak olan KİMLİK/YÜZ; anonim çizim eli dünyanın imzası. (Gerçek üretim kanıtı,
// 2026-07-10: aynı prompt'ta "a human hand … is visible" + "No human subject".)
// ─────────────────────────────────────────────────────────────────────────────
describe('castless notu: dünyanın zorunlu kıldığı eli iptal etmez', () => {
  const castlessFrame = (worldId: string) =>
    buildImagePrompt(1, BANK_LIKE, '50mm dolly', {
      ...FW_CTX,
      world: DATA.worlds.find((w) => w.id === worldId)!,
      register: 'EDU',
      hasCast: false,
      sourceBeat: 'Yanardağ nasıl patlar?',
    });

  it('whiteboard_explainer: "insan öznesi yok" emri elin görünme zorunluluğuyla çelişmez', () => {
    const p = castlessFrame('whiteboard_explainer');
    expect(p).toContain('a human hand and forearm holding a marker is visible'); // dünya yasası duruyor
    expect(p).not.toMatch(/No human subject in this frame/);                     // çelişen mutlak emir yok
    expect(p).toMatch(/no human face or identity/i);                             // yasak KİMLİK, el değil
  });

  it('whiteboard_explainer: reklam-malzemesi listesi düz-mürekkep dünyaya basılmaz', () => {
    const p = castlessFrame('whiteboard_explainer');
    expect(p).not.toMatch(/metal specular|glass refraction|painted bodywork|product finish/i);
  });

  it('el zorunlu olmayan castless dünyada: kimlik yasak, ama davranış anonim bedenle gösterilebilir', () => {
    const p = castlessFrame('castlevania_gothic');
    // The ban is on IDENTITY, not on bodies — a flat "no human subject" deleted the very
    // behaviour an educational beat exists to teach (Codex: 42/42 prompts).
    expect(p).toContain('No named or identifiable person in this frame');
    expect(p).toMatch(/anonymous body/i);
    // and where the beat needs nobody, the material discipline still carries the frame — but it
    // points at THIS world's matter, not at a product-register list. The old parenthetical
    // ("metal specular, glass refraction, painted bodywork, product finish") was pasted into
    // every castless prompt in every world: a 2D-cel mineral shot was ordered to render glass
    // refraction, and a phospholipid bilayer to have a product finish.
    expect(p).toMatch(/THIS WORLD'S OWN MATTER/);
    expect(p, 'the product-register material list came back').not.toMatch(/painted bodywork|product finish/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Palet dikişi dünyanın ışık yasasıyla çelişmemeli.
//
// paletteLightPrompt her dünyaya aynı kapanışı basıyordu: "Render these as light
// behaviour, never flat fills." Ama ukiyo_e_print'in light_law'ı "No directional
// lighting simulation — value comes from the flat printed color fields themselves"
// diyor ve render_law'ı "FLAT PRINTED WOODBLOCK AESTHETIC ONLY — forbid photographic
// gradient". Aynı prompt'ta iki zıt otorite → Nano Banana birini seçer, tipik sonuç
// düz baskıya sızan yönlü ışık/gradyan, yani dünyanın kendi failure-mode'u.
// (Gerçek üretim kanıtı, 2026-07-10.) Aynı çelişki motion_design_flat,
// kurzgesagt_edu ve whiteboard_explainer'ı da vuruyordu.
// ─────────────────────────────────────────────────────────────────────────────
describe('palet dikişi: flat-fill dünyalarda "asla flat fill" emri verilmez', () => {
  const W = (id: string) => DATA.worlds.find((w) => w.id === id)!;
  const FLAT_WORLDS = ['ukiyo_e_print', 'motion_design_flat', 'kurzgesagt_edu', 'whiteboard_explainer'];
  const LIT_WORLDS = ['castlevania_gothic', 'cyberpunk_neon_noir', 'deakins_naturalist', 'low_poly_ps1'];

  it('flat-fill dünyalarda kapanış "never flat fills" demez', () => {
    for (const id of FLAT_WORLDS) {
      const line = paletteLightPrompt(undefined, W(id));
      expect(line, `${id} kendi ışık yasasıyla çelişiyor`).not.toMatch(/never flat fills/i);
      expect(line, `${id}`).not.toMatch(/as light behaviour/i);
    }
  });

  it('flat-fill dünyalarda palet basılı düzlem değeri olarak okunur', () => {
    for (const id of FLAT_WORLDS) {
      expect(paletteLightPrompt(undefined, W(id)), id).toMatch(/flat|printed|plane value|no simulated light/i);
    }
  });

  it('ışık simüle eden dünyalarda eski kapanış aynen korunur', () => {
    for (const id of LIT_WORLDS) {
      expect(paletteLightPrompt(undefined, W(id)), id).toMatch(/light behaviour/i);
    }
  });

  it('paletli (native olmayan) yolda da flat dünya çelişmez', () => {
    const pastel = DATA.palettes.find((p) => p.id === 'pastel_soft');
    expect(paletteLightPrompt(pastel, W('motion_design_flat'))).not.toMatch(/never flat fills/i);
    expect(paletteLightPrompt(pastel, W('castlevania_gothic'))).toMatch(/never flat fills/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// R4 (ışık otoritesi) pratikte hiç çalışmıyordu.
//
// Authority hiyerarşisi: World/Render Lock > Ref DNA. Ama prompt her dünyaya jenerik
// ref-DNA satırını basıyordu: "Light: … warm motivated key with a named source
// (window, lamp, low sun)" — ref seçilmese bile ("one motivated key with a named
// source"). castlevania_gothic'in light_law'ı "a candle, a torch, a shaft of cold
// moonlight" diyor; gotik katedrale "pencere, lamba, alçak güneş" emri dünyayı eziyor.
// resolveLightAuthority() bunu engellemek için vardı ama tespiti dört dar kalıba
// bağlıydı (sky-primary / key absent / rim-dominant / rim-lit) ve 33 dünyanın
// yalnızca one_piece_toei ve jjk_mappa'nın kullandığı dört ifadeyi tanıyordu; kalan 31
// dünya kendi yasası yerine sessizce jenerik iç-mekan anahtarını alıyordu — mum ışığındaki
// gotik, neon low-key, düz woodblock, anti-fiziksel synthwave. (Gerçek üretim kanıtı,
// 2026-07-10.) Doğru davranış: dünya ÇELİŞİYORSA kaynak dayatması düşer, dünya AYNI
// aileden bir key kuruyorsa (pixar "window sun, desk lamp") jenerik korunur — R4 gereksiz
// yere ateşlemez. Ref'in kaynak-dışı ışık dili (kontrast, oran, gölge şekli) her hâlde kalır.
// ─────────────────────────────────────────────────────────────────────────────
describe('R4 ışık otoritesi: World light_law > jenerik ref-DNA kaynağı', () => {
  const lightLineOf = (worldId: string, dnaLight: string) => {
    const p = buildImagePrompt(1, BANK_LIKE, '50mm dolly', {
      ...FW_CTX, world: DATA.worlds.find((w) => w.id === worldId)!, register: 'EDU',
      sourceBeat: 'Yanardağ nasıl patlar?',
      dna: { staging: 's', light: dnaLight, texture: 't', avoid: 'a' },
    });
    return (p.match(/\bLight: [^.]*\./) || ['(yok)'])[0];
  };
  const GENERIC = 'hard value separation: one strong key, deep readable shadow shapes; warm motivated key with a named source (window, lamp, low sun)';

  // Dünyanın kendi key'i jenerikle ÇELİŞİYOR: mum/neon/ay/overcast/vertex/düz-baskı/pigment.
  const WORLD_GOVERNS = [
    'castlevania_gothic', 'cyberpunk_neon_noir', 'ukiyo_e_print', 'synthwave_retro_80s',
    'kurzgesagt_edu', 'watercolor_storybook', 'solo_leveling_gate', 'vintage_comic_book',
    'motion_design_flat', 'whiteboard_explainer', 'low_poly_ps1', 'aot_wall_world',
  ];
  // Dünya jenerikle AYNI aileden key kuruyor → çelişki yok, jenerik korunur.
  const WORLD_AGREES = ['pixar_3d_edu', 'ghibli_hayao', 'deakins_naturalist', 'fincher_precision'];

  it('çelişen dünyaya "window, lamp, low sun" kaynak dayatması gitmez', () => {
    for (const id of WORLD_GOVERNS) {
      expect(lightLineOf(id, GENERIC), id).not.toMatch(/window, lamp, low sun/i);
      expect(lightLineOf(id, GENERIC), id).not.toMatch(/motivated key with a named source/i);
    }
  });

  it('ref seçilmese bile jenerik key satırı çelişen dünyaya sızmaz', () => {
    // dnaDirectives([], …) ref yokken bile "one motivated key with a named source" üretir.
    for (const id of WORLD_GOVERNS) {
      expect(lightLineOf(id, 'one motivated key with a named source'), id)
        .toMatch(/defer the key to the world light law|no simulated light — value comes from the flat printed colour fields/i);
    }
  });

  it('uyumlu dünyada jenerik korunur — R4 gereksiz yere ateşlemez', () => {
    for (const id of WORLD_AGREES) {
      expect(lightLineOf(id, GENERIC), id).toMatch(/window, lamp, low sun/i);
    }
  });

  it('kaynak dayatması düşse de ref\'in kontrast dili korunur', () => {
    const line = lightLineOf('castlevania_gothic', GENERIC);
    expect(line).toMatch(/hard value separation/i);
    expect(line).toMatch(/deep readable shadow shapes/i);
  });

  it('ref-DNA ışığı kaynak dayatmıyorsa hiç dokunulmaz', () => {
    expect(lightLineOf('castlevania_gothic', 'low-key contrast, deep readable shadow shapes'))
      .toContain('low-key contrast');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Kamera cümlesi sahnenin setini DİKTE ETMEMELİ.
//
// CAM_EDU havuzu (brain-data.ts) bir masaüstü ders diyoraması varsayıyor:
// "across the existing tabletop", "inside the same set, one shelf edge passing as
// parallax", "inside-object vantage gliding along the active channel". Bu Pixar/
// paper-craft/clay gibi tactile dünyalarda doğru; castlevania'nın gotik katedralinde,
// One Piece'in gemi güvertesinde ya da kurzgesagt'ın izometrik diyagramında böyle bir
// raf/masa/iç-kanal YOK. Motor olmayan bir prop'u arıyor, sahneyi ona göre kuruyor.
// (Gerçek üretim kanıtı, 2026-07-10: 33 dünyanın hepsi aynı 4 kamerayı alıyordu,
// aralarında "35mm child-eye push across the existing tabletop" da vardı.)
// brain-data.ts "AUTO-EXTRACTED … do not hand-edit" → sterilizasyon kod katmanında.
// ─────────────────────────────────────────────────────────────────────────────
describe('kamera: dünyada var olmayan set nesnesi varsayılmaz', () => {
  const W = (id: string) => DATA.worlds.find((w) => w.id === id)!;
  const camOf = (worldId: string, camera: string) =>
    applyWorldCameraLaw(camera, 1, W(worldId), 'EDU', 'Yanardağ nasıl patlar?');

  const TABLETOP = '35mm child-eye push across the existing tabletop, foreground depth already in frame';
  const SHELF = '50mm slow lateral dolly inside the same set, one shelf edge passing as parallax';
  const CHANNEL = 'inside-object vantage gliding along the active channel already in frame';

  // Kamera hiçbir dünyada prop UYDURMAZ — pixar'ın dersi de uzayda geçebilir.
  // "already in frame" / "existing" niyeti (yeni nesne girmesin) korunur; sahnede
  // olduğu VARSAYILAN somut eşya (masa, raf, iç kanal) adlandırılmaz.
  it('hiçbir dünyada masa/raf/iç-kanal varsayılmaz', () => {
    for (const id of ['pixar_3d_edu', 'castlevania_gothic', 'one_piece_toei', 'kurzgesagt_edu']) {
      expect(camOf(id, TABLETOP), id).not.toMatch(/tabletop/i);
      expect(camOf(id, SHELF), id).not.toMatch(/shelf edge/i);
      expect(camOf(id, CHANNEL), id).not.toMatch(/inside-object|active channel/i);
    }
  });

  it('"yeni nesne girmesin" niyeti korunur', () => {
    expect(camOf('castlevania_gothic', TABLETOP)).toMatch(/already in frame|existing/i);
  });

  it('sterilize edilse de kameranın optik bilgisi korunur', () => {
    const cam = camOf('castlevania_gothic', TABLETOP);
    expect(cam).toMatch(/35mm/);
    expect(cam).toMatch(/push/i);
    const shelf = camOf('one_piece_toei', SHELF);
    expect(shelf).toMatch(/50mm/);
    expect(shelf).toMatch(/lateral dolly/i);
    expect(shelf).toMatch(/parallax/i);   // parallaks bilgisi kalır, raf gider
  });

  it('set-varsayımı taşımayan kamera cümlesine hiç dokunulmaz', () => {
    const clean = '85mm tactile macro creep onto the dominant object, background already soft';
    expect(camOf('castlevania_gothic', clean)).toBe(clean);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Kamera yasağı lens_grammar'da da yaşar.
//
// applyWorldCameraLaw'ın lawText'i render_law + motion_cadence'tan kuruluyordu;
// lens_grammar'a hiç bakmıyordu. Oysa kamera yasası orada yazılı:
//   ukiyo_e_print   → "no camera lens simulated at all; this is a print"
//   whiteboard_explainer → "Locked flat-on camera facing the board … no camera move"
// Sonuç: bir woodblock BASKIYA "gentle crane-down" ve "close interior vantage gliding"
// emri gidiyordu. (Gerçek üretim kanıtı, 2026-07-10.)
// STATIC_CAMERA_LAW_RE de üç ifadeye bağlıydı ve bu dünyaların hiçbiri onları kullanmıyor.
// ─────────────────────────────────────────────────────────────────────────────
describe('kamera yasası: lens_grammar da otoritedir', () => {
  const W = (id: string) => DATA.worlds.find((w) => w.id === id)!;
  const camOf = (worldId: string, camera: string) =>
    applyWorldCameraLaw(camera, 1, W(worldId), 'EDU', 'Yanardağ nasıl patlar?');

  const CRANE = 'gentle crane-down within the same set, settling at object height';
  const GLIDE = 'inside-object vantage gliding along the active channel already in frame';

  it('woodblock baskıda kamera hareketi yok — "this is a print"', () => {
    expect(camOf('ukiyo_e_print', CRANE)).not.toMatch(/crane|glide|dolly|push|arc\b/i);
    expect(camOf('ukiyo_e_print', GLIDE)).not.toMatch(/crane|glide|dolly|push|arc\b/i);
  });

  it('tahta anlatıcıda kamera kilitli — "no camera move"', () => {
    expect(camOf('whiteboard_explainer', CRANE)).not.toMatch(/crane|glide|dolly|arc\b/i);
  });

  it('yerine gerçek bir statik kadraj emri konur', () => {
    expect(camOf('ukiyo_e_print', CRANE)).toMatch(/static|locked|fixed|holds?/i);
  });

  it('kamera hareketine izin veren dünya etkilenmez', () => {
    expect(camOf('castlevania_gothic', CRANE)).toMatch(/crane-down/i);
  });
});

// TRAVELLING_MOVE_RE fiil çekimlerini kaçırıyordu: "glide" var ama "gliding" yok
// (g-l-i-d-e ≠ g-l-i-d-i-n-g), "creep"/"creeping", "arc"/"arcing" aynı durumda.
// Sonuç: statik-yasa dünyalarında "vantage gliding along …" ve "macro creep onto …"
// kamera hareketleri hiç yakalanmıyordu. (2026-07-10, ukiyo_e_print sahne 3.)
describe('kamera yasası: hareket fiilinin çekimleri de yakalanır', () => {
  const camOf = (worldId: string, camera: string) =>
    applyWorldCameraLaw(camera, 3, DATA.worlds.find((w) => w.id === worldId)!, 'EDU', 'test');

  it('baskıda "gliding" hareketi kilitlenir', () => {
    expect(camOf('ukiyo_e_print', 'close interior vantage gliding along the dominant element already in frame'))
      .not.toMatch(/gliding/i);
  });

  it('baskıda "macro creep" hareketi kilitlenir', () => {
    expect(camOf('ukiyo_e_print', '85mm tactile macro creep onto the dominant object, background already soft'))
      .not.toMatch(/creep/i);
  });

  it('hareket serbest dünyada çekimler korunur', () => {
    expect(camOf('castlevania_gothic', 'close interior vantage gliding along the dominant element already in frame'))
      .toMatch(/gliding/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Kamera dizisi dünyadan dünyaya değişmeli.
//
// primeCamera hash'i sceneId+src'den türüyordu; world hash'e hiç girmiyordu. Sonuç:
// aynı konu + aynı sahne sayısı → 22 dünya BİREBİR aynı 4 kamerayı alıyordu. One
// Piece'in gemi güvertesi ile Castlevania'nın katedrali aynı kadraj dizisiyle
// çekiliyordu. (Gerçek üretim ölçümü, 2026-07-10: 33 dünya → 2 farklı dizi.)
// Not: bu rastgele ama meşru çeşitlilik. Kamerayı dünyanın lens diline BAĞLAMAK
// ayrı ve daha büyük bir iş (her dünyaya camera_grammar alanı) — bkz. memory.
// ─────────────────────────────────────────────────────────────────────────────
describe('kamera çeşitliliği: dünya kadraj dizisini etkiler', () => {
  const seqOf = (worldId: string) => {
    const world = DATA.worlds.find((w) => w.id === worldId)!;
    return [1, 2, 3, 4].map((i) =>
      applyWorldCameraLaw(primeCamera(i, 'Yanardağ nasıl patlar?', i - 1, 'EDU', undefined, undefined, 0, worldId), i, world, 'EDU', 'Yanardağ nasıl patlar?'),
    ).join(' | ');
  };

  it('farklı dünyalar aynı konuda aynı kamera dizisini almaz', () => {
    expect(seqOf('castlevania_gothic')).not.toBe(seqOf('one_piece_toei'));
    expect(seqOf('pixar_3d_edu')).not.toBe(seqOf('cyberpunk_neon_noir'));
  });

  it('aynı dünya + aynı kaynak → deterministik (aynı dizi)', () => {
    expect(seqOf('castlevania_gothic')).toBe(seqOf('castlevania_gothic'));
  });

  it('worldId verilmezse eski davranış korunur (geriye dönük uyum)', () => {
    expect(primeCamera(1, 'kaynak', 0, 'EDU')).toBe(primeCamera(1, 'kaynak', 0, 'EDU'));
  });

  it('statik-yasa dünyaları yine de statik kalır (çeşitlilik yasayı ezmez)', () => {
    expect(seqOf('ukiyo_e_print')).not.toMatch(/crane|glid|dolly|creep|arc\b/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Doku ailesi "texture" olamaz — kendini yiyen cümle.
//
// DNA_MAP'in doku regex'i 12 kelime arar ve havuzda İLK eşleşeni aile adı yapar.
// Ref DNA'ları 7-katman formatında yazılı ve bir katmanın başlığı "Texture/render:".
// Bu başlık eşleşince prompt'a şu satır düşüyordu:
//   Texture rule: exactly ONE texture clause per prompt, from the "texture" family
// Yani "doku ailesinden doku seç" — motor için sıfır bilgi, ve gerçek doku
// (meticulous photoreal) kayboluyor. (Gerçek üretim kanıtı 2026-07-10: fincher,
// wes_anderson, kurzgesagt.)
// ─────────────────────────────────────────────────────────────────────────────
describe('doku ailesi: "texture" bir aile adı değil, kategori adıdır', () => {
  const texRuleOf = (refIds: string[]) => dnaDirectives(
    refIds.map((id) => DATA.refs.find((r) => r.id === id)!).filter(Boolean),
    'REAL',
  ).texture;

  it('DNA başlığı "Texture/render:" aile adı olarak sızmaz', () => {
    expect(texRuleOf(['kubrick_one_point'])).not.toMatch(/"texture" family/i);
  });

  it('gerçek bir doku ailesi bulunursa o kullanılır', () => {
    // ink/painterly/tactile/fabric/grain … gibi somut aileler korunur
    const painterly = DATA.refs.find((r) => /painterly|brush/i.test([r.name, r.dna, r.cat].join(' ')));
    if (painterly) expect(texRuleOf([painterly.id])).toMatch(/"(painterly|brush)" family/i);
  });

  it('somut aile yoksa doku cümlesi jenerik "texture" ile uydurulmaz', () => {
    const rule = texRuleOf(['kubrick_one_point']);
    expect(rule).toMatch(/exactly ONE texture clause|no texture clause/i);
    expect(rule).not.toMatch(/from the "texture"/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// camera_grammar — dünyanın kadraj dili (PİLOT: 3 dünya)
//
// lens_grammar OPTİĞİ söyler (25-35mm, f/2.8, 2.39). camera_grammar ÇEKİMİ söyler:
// hangi vantage, hangi hareket, hangi kadraj sınırı. İkisi prompt'ta ayrı iş görür.
//
// Neden gerekli: prompt'ta dört kadraj sesi vardı ve ikisi çelişiyordu —
//   one_piece_toei  Lens grammar : "25-35mm from below chest height, frog-eye"
//                   Camera/vantage: "85mm tactile macro creep onto the dominant object"
// Dünya geniş+alçak açı diyor, havuz telefoto makro veriyor. Motor iki lens duyuyor.
// (Gerçek üretim kanıtı 2026-07-10: 13 sahnede odak-uzunluğu çelişkisi.)
// ─────────────────────────────────────────────────────────────────────────────
describe('camera_grammar: dünyanın kadraj dili prompt\'a girer', () => {
  const W = (id: string) => DATA.worlds.find((w) => w.id === id)!;
  const frameOf = (worldId: string) =>
    buildImagePrompt(1, BANK_LIKE, '50mm dolly', {
      ...FW_CTX, world: W(worldId), register: 'EDU', sourceBeat: 'Yanardağ nasıl patlar?',
    });

  it('pilot dünyalar camera_grammar taşır', () => {
    for (const id of ['one_piece_toei', 'castlevania_gothic', 'kurzgesagt_edu']) {
      expect(W(id).camera_grammar, `${id}`).toBeTruthy();
    }
  });

  it('camera_grammar prompt\'a dünyanın kadraj yasası olarak girer', () => {
    expect(frameOf('one_piece_toei')).toMatch(/Camera grammar \(this world's framing law[^)]*\): Frog-eye/i);
    expect(frameOf('castlevania_gothic')).toMatch(/Camera grammar \([^)]*\): Two framings/i);
    expect(frameOf('kurzgesagt_edu')).toMatch(/Camera grammar \([^)]*\): The camera is a locked diagram plate/i);
  });

  it('kadraj yasası havuz kamerasından ÖNCE okunur (authority sırası)', () => {
    const p = frameOf('one_piece_toei');
    expect(p.indexOf('Camera grammar')).toBeLessThan(p.indexOf('Camera/vantage:'));
  });

  it('camera_grammar\'ı olmayan dünya etkilenmez (satır hiç basılmaz)', () => {
    // Alan 33 dünyaya yayıldıkça bu test doğal olarak boşa düşer; o güne kadar
    // "yazılmamış dünya hiç dokunulmadan geçer" sözleşmesini korur.
    const bare = DATA.worlds.find((w) => !w.camera_grammar);
    if (!bare) return;
    expect(frameOf(bare.id)).not.toMatch(/Camera grammar/);
  });

  // Palette Translation Law + telif firewall'u: bu alan da prompt'a giriyor.
  it('camera_grammar ham hex ya da franchise adı taşımaz', () => {
    for (const w of DATA.worlds) {
      const cg = w.camera_grammar;
      if (!cg) continue;
      expect(cg, `${w.id} ham hex`).not.toMatch(/#[0-9a-f]{3,8}\b/i);
      expect(cg, `${w.id} franchise adı`).not.toMatch(/\b(one piece|naruto|bleach|solo leveling|attack on titan|demon slayer|jujutsu kaisen|pixar|ghibli)\b/i);
    }
  });
});

// 🔒 SIZINTI KAPANI (self-consistency firewall). Bugüne kadar iki kez elle yamandı
// (bleach: "Seireitei"/"Rukongai" · solo_leveling: "Solo Leveling"), ama KURAL olarak
// hiç yazılmadı — bu yüzden aynı yara kurzgesagt_edu + whiteboard_explainer'da hayatta
// kaldı. Yasa: bir dünyanın POZİTİF prompt alanları (verbatim motora giden STYLE SYSTEM),
// kendi negative_lock'unun "NO <ÖzelAd>" diye yasakladığı adı taşıyamaz — yoksa motor
// aynı prompt'ta "X yap" + "X yapma" alır ve telif firewall'u pozitif bağlamdan delinir.
//
// Elle world-id listesi YOK (camera_grammar dersi: elle liste = sessiz körleşme).
// Kural her dünyanın kendi verisinden türer.
describe('render_law kendi negative_lock yasağını pozitif bağlamda tekrarlamaz', () => {
  // Verbatim prompt'a giren alanlar. example_injection + one_liner ajana gider,
  // negative_lock zaten negatif banda gider — üçü de firewall guard'ı, muaf.
  const POSITIVE_FIELDS = ['render_law', 'light_law', 'line_grammar', 'lens_grammar', 'camera_grammar'] as const;

  // negative_lock'tan "NO <ÖzelAd>" öbeğini çeker. Cümle başı büyük harf ve
  // "NO English/Turkish signage" gibi dil-yasakları özel ad değil.
  const bannedNamesOf = (w: (typeof DATA.worlds)[number]): string[] => {
    const out = new Set<string>();
    for (const line of w.negative_lock ?? []) {
      for (const m of line.matchAll(/\bNO ([A-Z][a-zA-Z'’-]+(?:[ -][A-Z][a-zA-Z'’-]+)*)/g)) {
        const name = m[1];
        if (name.length < 4) continue;
        if (/^(English|Turkish|Dutch)$/.test(name)) continue;
        out.add(name);
      }
    }
    return [...out];
  };

  // Ayırıcı esnek: yasak "RSA Animate" yazarken render_law "RSA-Animate" diyordu —
  // katı öbek eşleşmesi gerçek sızıntıyı kaçırıyordu (bu testin ilk sürümünde oldu).
  const escape = (s: string) =>
    s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[ -]/g, '[ -]');

  for (const w of DATA.worlds) {
    const banned = bannedNamesOf(w);
    if (!banned.length) continue;

    it(`${w.id}`, () => {
      for (const field of POSITIVE_FIELDS) {
        const text = w[field];
        if (!text) continue;

        // Yasağın KENDİSİ pozitif alanda "forbid X" diye geçebilir (low_poly_ps1'in
        // "forbid ... HD-remaster polish"i, naruto'nun "that is Toei grammar"ı).
        // Negatif bağlamı olan cümleleri düş: kalan cümleler emirdir.
        const imperatives = text
          .split(/(?<=[.;])\s+/)
          .filter((s) => !/\b(forbid|forbids|never|no |not |avoid)\b/i.test(s));

        for (const name of banned) {
          // TAM ÖBEK. İlk-kelime eşleşmesi sahte pozitif üretir:
          // "The Last Drop" → "the", "No Country" → "no", "HD-remaster" → "HD".
          const re = new RegExp(`\\b${escape(name)}\\b`, 'i');
          for (const sentence of imperatives) {
            expect(
              re.test(sentence),
              `${w.id}.${field} pozitif emirde kendi yasakladığı adı taşıyor: ${JSON.stringify(name)}\n  → ${sentence.trim()}`,
            ).toBe(false);
          }
        }
      }
    });
  }
});

// 🔒 SESSİZ NEGATİF KAPANI. negative_lock'a yazdığın yasak, ajanın gördüğü
// "Negative:" bandına inmeli. İnmiyorsa yasak YOK demektir — ama veri onu taşıdığı
// için düzelmiş sanırsın (bugün tam olarak bu oldu: motion_design_flat'e yazılan
// "NO bulbous limbless mascot figures", negItemIsIP'in 'mascot' marker'ına takılıp
// TÜMÜYLE düşüyordu ve yerine jenerik IP cümlesi konuyordu; "flat" kuyruğu da
// pathForbidden'daki "flat slide" tarafından prefix-dedupe ediliyordu).
//
// Anahtar kelime seçimi: her yasak öğesinden IP-heuristiğine ve dedupe'a takılmayan
// AYIRT EDİCİ bir kelime al, o kelime negatif bantta görünmeli.
describe('negative_lock yasakları ajanın Negative: bandına iner', () => {
  const negBandOf = (worldId: string): string => {
    const r = generateBatch({
      projectTopic: 'Su döngüsü nasıl işler?', projectClass: 'ders', sceneCount: 1, cast: '',
      selectedWorldId: worldId, selectedPropId: 'none', selectedRefIds: [],
      selectedPaletteId: 'native_world', selectedMusicId: '',
      imageModel: 'nano_banana_2', videoModel: 'kling_3',
    } as never) as never as { status: string; scenes: { imagePrompt: string }[] };
    if (r.status !== 'GENERATED') return '';
    const p = r.scenes[0].imagePrompt;
    const i = p.indexOf('Negative:');
    return i < 0 ? '' : p.slice(i);
  };

  // Bu dünya negative_lock'u en yoğun olan: her maddesi ayrı bir failure-mode kesiyor.
  it('motion_design_flat: her yasak maddesi bantta görünür', () => {
    const band = negBandOf('motion_design_flat').toLowerCase();
    expect(band, 'prompt üretilemedi').not.toBe('');
    // Her madde için ayırt edici bir kelime (jenerik IP cümlesi bunları İÇERMEZ)
    const mustAppear = [
      'cartoon figures',        // blob-figür yasağı (asla 'mascot' yazma → IP sanılır)
      'confetti',               // squiggle/blob dolgu
      'gradient-mesh',          // flat-2.0 düşüşü
      'noise overlay',          // doku diye satılan grain
      'sticker cutout',         // drop-shadow'lu çıkartma
      'isometric extrusion',    // sahte-3D
      'startup palette',        // pastel lavanta-nane kayması
      'clip-art',               // jenerik infografik ikon
    ];
    for (const kw of mustAppear) {
      expect(band, `"${kw}" yasağı ajana hiç ulaşmıyor (IP sanıldı ya da dedupe yedi)`).toContain(kw);
    }
  });

  // NOT — burada ikinci bir test denendi ve BİLEREK atıldı: "negative_lock'ta
  // negItemIsIP marker kelimesi ('mascot','emblem','crest','iconography'…) kullanma".
  // Marker'lı öğe TÜMÜYLE düşer. Bu bir FRANCHISE nesnesi için DOĞRU davranıştır —
  // one_piece'in "NO Straw Hat emblem"i, aot'un "Survey Corps insignia"sı, bleach'in
  // "Gotei-13 crest"i düşer ve yerine jenerik IP cümlesi iner (telif korunur).
  // Yanlış olan sadece marker'ı STİL anlamında kullanmaktı ("mascot figures").
  // İkisini mekanik ayırmanın yolu yok: "Straw Hat" bir franchise adı, "mascot" bir
  // şekil — ayrım anlamsal. Zorlanan test ya 6 meşru yasağı kırmızı verir ya da
  // elle istisna listesi tutar (camera_grammar dersi: elle liste = sessiz körleşme).
  // Kural INSANIN aklında kalsın diye buraya yazıldı; kapan yukarıdaki uçtan-uca
  // testtir — o, 'cartoon figures' bandına inmezse kırmızı verir.
});

// camera_grammar bir vantage'ı YASAKLIYORSA havuz cümlesi onu veremez.
// one_piece_toei: "Never a telephoto macro, never a top-down or eye-level neutral
// vantage — the low angle IS the world." Buna rağmen havuz "85mm tactile macro creep"
// veriyordu: prompt'ta iki zıt lens. (Gerçek üretim kanıtı 2026-07-10.)
describe('camera_grammar yasağı havuz kamerasını reddeder', () => {
  const W = (id: string) => DATA.worlds.find((w) => w.id === id)!;
  const camOf = (worldId: string, camera: string) =>
    applyWorldCameraLaw(camera, 1, W(worldId), 'EDU', 'Yanardağ nasıl patlar?');

  const MACRO = '85mm tactile macro creep onto the dominant object, background already soft';

  it('frog-eye dünyası telefoto makro almaz', () => {
    expect(camOf('one_piece_toei', MACRO)).not.toMatch(/macro|85mm/i);
  });

  it('yerine dünyaya uygun bir vantage konur', () => {
    const cam = camOf('one_piece_toei', MACRO);
    expect(cam).toBeTruthy();
    expect(cam).not.toBe(MACRO);
  });

  it('makro yasağı olmayan dünyada makro korunur', () => {
    expect(camOf('castlevania_gothic', MACRO)).toContain('macro');
  });

  it('camera_grammar\'ı olmayan dünya hiç etkilenmez', () => {
    expect(camOf('pixar_3d_edu', MACRO)).toBe(MACRO);
  });
});

// Yasak yeterli değil: yerine gelen de dünyaya ait olmalı. one_piece_toei "low angle IS
// the world" derken "static front-on lock" (nötr önden vantage) almak, makro kadar yanlış.
// camera_grammar'ın OLUMLU dili ("a low lateral track along the action line", "a rising
// vantage") havuzdan hangi cümlenin seçileceğini söyler.
describe('camera_grammar seçimi: yasak sonrası dünyanın istediği vantage gelir', () => {
  const W = (id: string) => DATA.worlds.find((w) => w.id === id)!;
  const camOf = (worldId: string, camera: string, scene = 1) =>
    applyWorldCameraLaw(camera, scene, W(worldId), 'EDU', 'Yanardağ nasıl patlar?');
  const MACRO = '85mm tactile macro creep onto the dominant object, background already soft';

  it('frog-eye dünyası nötr önden kilit de almaz', () => {
    expect(camOf('one_piece_toei', MACRO)).not.toMatch(/static front-on lock/i);
  });

  it('frog-eye dünyası alçak/yükselen bir vantage alır', () => {
    const cam = camOf('one_piece_toei', MACRO);
    expect(cam).toMatch(/\blow\b|rising|arc|lateral/i);
  });

  it('yasağı ateşlemeyen kamera hiç değişmez', () => {
    const low = 'low side dolly along the existing cause-and-result line';
    expect(camOf('one_piece_toei', low)).toContain('low side dolly');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Sessiz yasak tuzağı: camera_grammar bir şeyi "never …" diye yasaklıyorsa,
// CAMERA_BAN_VOCAB onu TANIMALI. Tanımazsa yasak prompt'ta durur ama havuz gate'i
// hiç ateşlemez — tarifi yazan (ben) düzeldiğini sanır, motor eski kadrajı alır.
// Bu tuzağa 2026-07-10'da iki kez düşüldü ("never an interior vantage", "never a
// human vantage" yazıldı, sözlük tanımadı).
//
// Nitelik yasakları KAPSAM DIŞI: "never a perfectly smooth virtual move" bir hareketi
// değil, hareketin NASIL yapılacağını söyler — ajana talimattır, gate'e değil.
// ─────────────────────────────────────────────────────────────────────────────
describe('camera_grammar yasakları sessizce yok sayılmaz', () => {
  /** Tarifin "never …" cümlelerinden yasaklanan ŞEY TÜRLERİNİ çıkarır. */
  const banClausesOf = (grammar: string) =>
    grammar.split(/(?<=[.;])\s+/).filter((s) => /\bnever\b/i.test(s))
      .flatMap((s) => s.split(/,\s*/))
      .filter((s) => /\bnever\b/i.test(s))
      // yalnız "never a|an|the <şey>" — "never for action", "never during the draw" gibi
      // edat kalıpları bir çekim TÜRÜNÜ değil bir kullanımı kısıtlar, gate'in işi değildir.
      .map((s) => (s.match(/\bnever\s+(?:a|an|the)\s+([^—,;]+)/i) || [])[1])
      .filter(Boolean)
      .map((s) => s.trim());

  // Gate'e değil AJANA konuşan yasaklar — havuzda karşılığı olmayan, ama tarifte
  // bulunması doğru olan kısıtlar. Prompt'ta durur, ajan uyar; gate ateşlemez:
  //  · NİTELİK      — hareketin nasıl yapılacağı ("perfectly smooth virtual move")
  //  · OPTİK        — render'ı kısıtlar, vantage'ı değil (DOF, lens distortion/flare, simulated lens)
  //  · KOMPOZİSYON  — kadraj içi karar ("oblique or three-quarter vantage": havuzun 22
  //                   cümlesinin hiçbiri açı beyan etmez, kesecek bir şey yok)
  const AGENT_FACING_BAN = /\b(perfectly|flawless|smooth|virtual|imperfection|unhurried|eased)\b|depth of field|lens (?:distortion|flare)|simulated lens|oblique|three-quarter|^subject$/i;

  it('her "never …" yasağı ya sözlükte karşılanır ya nitelik yasağıdır', () => {
    const unmatched: string[] = [];
    for (const w of DATA.worlds) {
      if (!w.camera_grammar) continue;
      for (const clause of banClausesOf(w.camera_grammar)) {
        if (AGENT_FACING_BAN.test(clause)) continue;
        // sözlükte bu yasağı tanıyan bir giriş var mı? (gate gerçekten ateşleyebilir mi)
        const known = CAMERA_BAN_PHRASES.some((re) => re.test(clause));
        if (!known) unmatched.push(`${w.id}: "never a ${clause}"`);
      }
    }
    expect(unmatched, 'sözlük bu yasakları tanımıyor — gate hiç ateşlemez').toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Codex 5.6 · Bulgu 3 — path.forbidden zinciri IP-scrub'a kurban gidiyordu.
//
// `ULTRAREAL_COMMERCIAL.forbidden` = "Pixar, 3D animated, clay, diorama,
// toy-world, cartoon, generic CGI sheen." — `Pixar` Title-case olduğu için
// negItemIsIP() onu IP sayıp düşürüyor, ardından `lastItemAllIP` bayrağı
// ARKASINDAKİ 6 lowercase render-negatifini "orphaned enumeration" sanıp
// siliyordu. Sonuç: 7/7 yasak prompt'a hiç girmiyor, motor bir ULTRAREAL
// reklamı Pixar diorama'sı olarak render edebiliyor.
//
// Ayrım: gerçek enumerasyon devamı `or`/`and`/`not`/`nor` ile bağlanır
// ("NO named powers, techniques, or signature moves") — bu zaten
// isContinuation ile yakalanıyor. Çıplak virgülle ayrılmış BAĞIMSIZ bir
// yasak ("clay") bir devam parçası DEĞİLDİR ve düşmemelidir.
describe('Codex#3 — IP adı tek başına scrublanır, zincirdeki render-negatifleri düşmez', () => {
  const PATH_FORBIDDEN = 'Pixar, 3D animated, clay, diorama, toy-world, cartoon, generic CGI sheen.';
  function negativeBandOf(pathForbidden: string): string {
    const p = buildImagePrompt(1, BANK_LIKE, '50mm dolly', { ...FW_CTX, register: 'REAL', sourceBeat: 'x', pathForbidden });
    return (p.match(/Negative:([\s\S]*?)\. Clean motion-ready/) || [])[1] || '';
  }

  it('IP olmayan 6 render-negatifi Negative bandında hayatta kalır', () => {
    const neg = negativeBandOf(PATH_FORBIDDEN);
    for (const survivor of ['3D animated', 'clay', 'diorama', 'toy-world', 'cartoon', 'generic CGI sheen']) {
      expect(neg, `path yasağı "${survivor}" prompt'a hiç ulaşmıyor`).toContain(survivor);
    }
  });

  it('korunan IP adı ("Pixar") yine de prompt\'a sızmaz', () => {
    expect(negativeBandOf(PATH_FORBIDDEN)).not.toMatch(/Pixar/i);
  });

  it('IP düştüğü için jenerik franchise cümlesi hâlâ eklenir', () => {
    expect(negativeBandOf(PATH_FORBIDDEN)).toMatch(/no recognizable franchise or real-person characters/i);
  });

  it('GERÇEK enumerasyon devamı ("or …", "not …") hâlâ öksüz kalmaz', () => {
    // Lead item IP → arkasındaki `or`/`not`-lead fragmanlar HÂLÂ düşmeli.
    const neg = negativeBandOf('NO named Naruto powers, techniques, or signature moves.');
    expect(neg).not.toMatch(/signature moves/i);
    expect(neg).not.toMatch(/\btechniques\b/i);
  });

  it('gerçek üretim: ULTRAREAL_COMMERCIAL promptu 7 yasağın 6\'sını taşır', () => {
    const p = DATA.paths.find((x) => x.id === 'ULTRAREAL_COMMERCIAL')!;
    const out = generateBatch({
      projectTopic: 'Elektrikli araç, şehir dışında bir sabah.',
      projectClass: 'ULTRAREAL_COMMERCIAL',
      sceneCount: 2,
      cast: '',
      selectedWorldId: p.defaultWorld,
      selectedPropId: 'none',
      selectedRefIds: [],
      selectedPaletteId: p.defaultPalette || 'native_world',
      selectedMusicId: '',
      imageModel: 'nano_banana_2',
      videoModel: 'kling_3',
    } as never as Parameters<typeof generateBatch>[0]) as never as { status: string; scenes: { imagePrompt: string }[] };
    expect(out.status).toBe('GENERATED');
    const img = out.scenes[0].imagePrompt;
    for (const survivor of ['3D animated', 'clay', 'diorama', 'toy-world', 'cartoon']) {
      expect(img, `gerçek üretimde "${survivor}" kayıp`).toContain(survivor);
    }
    expect(img).not.toMatch(/Pixar/i);
  });
});

// ---------------------------------------------------------------------------
// reconcileAspectRatio — path dikey isterse dünyanın EN-BOY oranı 9:16 olur.
//
// İlk regex `\d+(\.\d+)?:1` her `:1` kalıbını yiyordu. Ama SURGERY_DATA'da
// `:1` iki AYRI şey demek:
//   EN-BOY  : 1.37:1 · 1.78:1 · 1.85:1 · 2.00:1 · 2.35:1 · 2.39:1 (+ 16:9, 4:3)
//   KONTRAST: 2:1 · 4:1 · 5:1 · 6:1 · 8:1  ("Contrast ratio 4:1 to 6:1")
// ve `1:1` bir makro BÜYÜTME oranı. Uzlaştırma bunları da çevirince motora
// "Contrast ratio 9:16 vertical to 9:16 vertical is typical" gidiyordu.
//
// Veriyle doğrulanmış ayrım: en-boy oranı hep ONDALIKLI (x.yz:1) ya da 16:9 /
// 4:3; kontrast ve makro oranı hep TAM SAYI. Kesişim yok.
describe('reconcileAspectRatio — yalnız EN-BOY oranını çevirir', () => {
  const V = 'Photoreal vertical social-video frame';

  it('ondalıklı en-boy oranını çevirir', () => {
    expect(reconcileAspectRatio('f/5.6-f/8 deep focus. 1.85:1 or 2.39:1.', V))
      .toBe('f/5.6-f/8 deep focus. 9:16 vertical.');
    expect(reconcileAspectRatio('1.37:1 Academy or 2.00:1 flat.', V))
      .toBe('9:16 vertical Academy or 9:16 vertical flat.');
  });

  it('kontrast oranına DOKUNMAZ (4:1, 6:1, 8:1, 2:1)', () => {
    expect(reconcileAspectRatio('Contrast ratio 4:1 to 6:1 is typical.', V))
      .toBe('Contrast ratio 4:1 to 6:1 is typical.');
    expect(reconcileAspectRatio('fill near zero, ratio never below 8:1.', V))
      .toBe('fill near zero, ratio never below 8:1.');
    expect(reconcileAspectRatio('2:1 contrast, everything readable.', V))
      .toBe('2:1 contrast, everything readable.');
  });

  it('makro büyütme oranına DOKUNMAZ (1:1)', () => {
    expect(reconcileAspectRatio('100mm macro at 1:1 magnification.', V))
      .toBe('100mm macro at 1:1 magnification.');
  });

  it('16:9 ve 4:3 de en-boy oranıdır — çevrilir', () => {
    expect(reconcileAspectRatio('16:9 or 2.35:1 for corridor scenes.', V)).toMatch(/^9:16 vertical/);
    expect(reconcileAspectRatio('4:3 or 1.85:1 aspect.', V)).toMatch(/^9:16 vertical/);
  });

  it('path dikey istemiyorsa hiçbir şey değişmez', () => {
    const t = '1.85:1 or 2.39:1. Contrast ratio 4:1.';
    expect(reconcileAspectRatio(t, 'Real location, natural light')).toBe(t);
    expect(reconcileAspectRatio(t, undefined)).toBe(t);
  });
});

// ---------------------------------------------------------------------------
// Codex 5.6 · Bulgu 5 — dünyanın POZİTİF lens otoritesi zorlanmıyordu.
//
// `gateCameraGrammar` yalnız `never a telephoto macro` gibi AÇIK yasakları
// filtreliyor. Ama bir dünyanın `lens_grammar`'ı çoğu zaman yasak yazmaz —
// izin verilen aralığı yazar: fincher "35mm, 40mm, 50mm primes", chivo
// "14mm, 16mm, 21mm, 35mm", deakins "40mm, 50mm, 65mm". Kamera havuzu bunu
// hiç okumuyordu.
//
// ÖLÇÜLDÜ (gerçek generateBatch): 17 vantage cümlesinin 6'sı aralık dışı.
//   fincher  (35-50mm) → "100mm macro slide"      ← aynı promptta
//                          "never a shallow-focus bokeh vantage" yasağı var
//   deakins  (40-65mm) → 85mm, 100mm
//   wes      (35-40mm) → 100mm
//   chivo    (14-35mm) → 50mm
//
// PATH ÖNCELİĞİ korunur: FOOD_MACRO.required "Photoreal macro texture" der ve
// deakins'e (40-65mm) bağlıdır — path açıkça macro isterse aralık aşılabilir.
// Path > World, tıpkı en-boy oranında olduğu gibi.
describe('Codex#5 — dünyanın lens aralığı zorlanır, path açıkça isterse aşılır', () => {
  function vantagesFor(worldId: string, pathId: string, n = 6): string[] {
    const out = generateBatch({
      projectTopic: 'SOURCE:\n' + Array.from({ length: n }, (_, i) => `Beat ${i + 1}.`).join('\n'),
      projectClass: pathId, sceneCount: n, cast: '',
      selectedWorldId: worldId, selectedPropId: 'none', selectedRefIds: [],
      selectedPaletteId: 'native_world', selectedMusicId: '',
      imageModel: 'nano_banana_2', videoModel: 'kling_3',
    } as never as Parameters<typeof generateBatch>[0]) as never as {
      status: string; scenes: { imagePrompt: string }[];
    };
    expect(out.status).toBe('GENERATED');
    return out.scenes.map((s) => (s.imagePrompt.match(/Camera\/vantage: [^.]*\./) || [''])[0]);
  }

  const mmIn = (s: string) => [...s.matchAll(/\b(\d{2,3})mm\b/g)].map((m) => Number(m[1]));

  // Yalnız lens yasasını KATI ifade eden gerçek-görüntü dünyaları. deakins "40mm, 50mm,
  // 65mm MOST COMMON" der — eğilim, sınır değil; oradaki 85mm rack-focus meşrudur ve
  // mevcut R6 testleri onu haklı olarak korur. Animasyon dünyalarının "simulated 35-50mm
  // equivalent"ı bir görünüm, mercek değil.
  const CASES: Array<[string, string, [number, number]]> = [
    ['fincher_precision', 'ULTRAREAL_COMMERCIAL', [35, 50]],
    ['wes_anderson_symmetric', 'DOCUMENTARY_REALISM', [35, 40]],
    ['chivo_naturalist_handheld', 'DOCUMENTARY_REALISM', [14, 35]],
    ['noir_high_contrast', 'DOCUMENTARY_REALISM', [35, 50]],
  ];

  for (const [world, path, [lo, hi]] of CASES) {
    it(`${world}: hiçbir vantage ${lo}-${hi}mm dışına çıkmaz`, () => {
      const bad: string[] = [];
      for (const v of vantagesFor(world, path)) {
        for (const mm of mmIn(v)) if (mm < lo || mm > hi) bad.push(`${mm}mm → "${v.trim()}"`);
      }
      expect(bad, `${world} lens yasasını çiğniyor`).toEqual([]);
    });
  }

  it('FOOD_MACRO macro İSTER — path lens yasasını aşar', () => {
    const vs = vantagesFor('deakins_naturalist', 'FOOD_MACRO');
    expect(vs.some((v) => /macro/i.test(v)), 'path macro isterken sistem onu boğuyor').toBe(true);
  });

  it('deakins "most common" der — EĞİLİM, yasa değil; 85mm rack-focus korunur', () => {
    const w = DATA.worlds.find((x) => x.id === 'deakins_naturalist')!;
    expect(w.lens_grammar).toMatch(/most common/i);
    const RACK = '85mm rack focus from foreground detail to the subject, both already in frame';
    expect(applyWorldCameraLaw(RACK, 1, w, 'REAL')).toMatch(/85mm/);
  });

  it('animasyon dünyasının "simulated 35-50mm equivalent"i mercek değil — dokunulmaz', () => {
    const w = DATA.worlds.find((x) => x.id === 'pixar_3d_edu')!;
    const MACRO = '85mm tactile macro creep onto the dominant object, background already soft';
    expect(applyWorldCameraLaw(MACRO, 1, w, 'EDU', 'Yanardağ nasıl patlar?')).toBe(MACRO);
  });

  it('beat açıkça makro isterse lens yasası ona boyun eğer (Source otoritesi)', () => {
    const w = DATA.worlds.find((x) => x.id === 'fincher_precision')!;
    const MACRO = '100mm macro slide along the surface, geometry locked';
    const BEAT = 'Çelik saat kasasının dişli çarkları yakın makro detayda döner.';
    expect(applyWorldCameraLaw(MACRO, 1, w, 'REAL', BEAT)).toMatch(/macro/i);
    // aynı dünya, makro istemeyen beat → yasa uygulanır
    expect(applyWorldCameraLaw(MACRO, 1, w, 'REAL', 'Araba yolda ilerliyor.')).not.toMatch(/100mm/);
  });

  it('fincher: "never a shallow-focus bokeh" yasağıyla 100mm macro AYNI promptta olamaz', () => {
    const out = generateBatch({
      projectTopic: 'SOURCE:\nBir.\nİki.\nÜç.\nDört.',
      projectClass: 'ULTRAREAL_COMMERCIAL', sceneCount: 4, cast: '',
      selectedWorldId: 'fincher_precision', selectedPropId: 'none', selectedRefIds: [],
      selectedPaletteId: 'native_world', selectedMusicId: '',
      imageModel: 'nano_banana_2', videoModel: 'kling_3',
    } as never as Parameters<typeof generateBatch>[0]) as never as { scenes: { imagePrompt: string }[] };
    for (const s of out.scenes) {
      const vantage = (s.imagePrompt.match(/Camera\/vantage: [^.]*\./) || [''])[0];
      expect(vantage).not.toMatch(/100mm|macro/i);
    }
  });
});

// Lens kapısı bir vantage'ı değiştirirken onun KİLİT klozunu düşürmemeli.
// Havuzda "geometry and logo plane locked" yalnız 100mm macro cümlesinde var;
// fincher (35-50mm) onu elediğinde PRODUCT_HERO ("stable logo/packaging",
// defaultWorld = fincher_precision) logo kilidini tamamen kaybediyordu.
// stripInapplicableLogoPlane zaten sonrasında beat'e göre logo'yu düşürür.
describe('Codex#5 — lens değişimi kilit klozunu taşır', () => {
  const W = (id: string) => DATA.worlds.find((w) => w.id === id)!;
  const MACRO_LOGO = '100mm macro slide along the surface, geometry and logo plane locked';

  it('logo beat\'i: lens değişse de "logo plane locked" hayatta kalır', () => {
    const out = applyWorldCameraLaw(MACRO_LOGO, 1, W('fincher_precision'), 'REAL', 'Kadranda marka logosu netleşir.');
    expect(out, '100mm elendi ama kilit de gitti').toMatch(/logo plane locked/i);
    expect(out, 'aralık dışı lens hâlâ var').not.toMatch(/100mm/);
  });

  it('logosuz beat: "logo plane" düşer, geometry kilidi kalır', () => {
    const out = applyWorldCameraLaw(MACRO_LOGO, 1, W('fincher_precision'), 'REAL', 'Çelik kasanın dişlileri döner.');
    expect(out).not.toMatch(/logo plane locked/i);
    expect(out).toMatch(/geometry/i);
    expect(out).not.toMatch(/100mm/);
  });
});

// Yasak kapısı (gateCameraGrammar) havuzdan YENİ bir vantage seçer — ve o da aralık
// dışı olabilir. fincher "NO rack focus pull" yasağıyla 85mm rack-focus'u atıp havuzdan
// 100mm macro'yu getiriyordu: bir yasağı düzeltirken lens yasasını çiğniyordu.
// Lens kapısı yasak kapısından SONRA da koşmalı.
describe('Codex#5 — yasak kapısının seçtiği vantage de lens yasasına uyar', () => {
  const W = (id: string) => DATA.worlds.find((w) => w.id === id)!;

  it('fincher: rack-focus yasağı 100mm macro getirmez', () => {
    const RACK = '85mm rack focus from foreground detail to the subject, both already in frame';
    const out = applyWorldCameraLaw(RACK, 1, W('fincher_precision'), 'REAL', 'Araba yolda ilerliyor.');
    expect(out, 'yasak düzeltilirken lens yasası çiğnendi').not.toMatch(/100mm|85mm/);
    expect(out).not.toMatch(/rack[- ]?focus/i);
  });

  it('her gerçek-görüntü katı dünyada, her havuz vantage\'ı aralığa çekilir', () => {
    const STRICT: Array<[string, [number, number]]> = [
      ['fincher_precision', [35, 50]],
      ['wes_anderson_symmetric', [35, 40]],
      ['chivo_naturalist_handheld', [14, 35]],
      ['noir_high_contrast', [35, 50]],
    ];
    const bad: string[] = [];
    for (const [id, [lo, hi]] of STRICT) {
      for (const cam of camPool('REAL')) {
        const out = applyWorldCameraLaw(cam, 1, W(id), 'REAL', 'Araba yolda ilerliyor.');
        for (const m of [...out.matchAll(/\b(\d{2,3})mm\b/g)].map((x) => Number(x[1]))) {
          if (m < lo || m > hi) bad.push(`${id} (${lo}-${hi}): "${cam}" → "${out}"`);
        }
      }
    }
    expect(bad, 'havuzdan aralık dışı lens sızıyor').toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Lens kapısının kendi iki kusuru (kendi denetimim, gerçek veriyle ölçüldü).
//
// 1. `sci_fi_hard_surface.lens_grammar` = "35mm for machine-scale wides,
//    85-100mm macro for detail passes" — İKİ AYRI aralık. Onu tek bir
//    [35,100] aralığına ezmek, dünyanın hiç izin vermediği 50mm/65mm'i
//    serbest bırakır. Bir aralık listesi, min-max değil.
//
// 2. `BEAT_MACRO_RE` "yakın plan"ı makro sanıyordu. Türkçe'de "yakın plan" =
//    close-up; sıradan bir diyalog beat'i ("Hemşire yakın plan gülümser")
//    lens yasasını tamamen kapatıyordu. Yalnız MAKRO muaf tutulur.
describe('lens kapısı — çoklu aralık ve makro-tespiti', () => {
  const W = (id: string) => DATA.worlds.find((w) => w.id === id)!;

  // sci_fi "35mm for machine-scale wides, 85-100mm macro" → AYRIK bantlar {35} ve [85,100].
  // gateCameraLens doğrudan sınanır: applyWorldCameraLaw'da bu dünyanın handheld/dolly
  // yasakları havuzdan yeni cümle çekip sonucu gölgeliyor.
  it('sci_fi_hard_surface bantları AYRIK: {35} ve [85,100] — arası boş', () => {
    const bands = lensBandsOf(W('sci_fi_hard_surface'))!;
    expect(bands).toBeTruthy();
    const inAny = (mm: number) => bands.some(([lo, hi]) => mm >= lo && mm <= hi);
    expect(inAny(35), '35mm izinli').toBe(true);
    expect(inAny(100), '100mm izinli').toBe(true);
    expect(inAny(50), '50mm hiçbir bantta olmamalı').toBe(false);
    expect(inAny(65), '65mm hiçbir bantta olmamalı').toBe(false);
  });

  it('sci_fi: 50mm en yakın banda (35) çekilir, 100mm\'e DEĞİL', () => {
    const out = gateCameraLens('50mm slide along the surface, geometry locked', W('sci_fi_hard_surface'));
    expect(out).toMatch(/\b35mm\b/);
    expect(out).not.toMatch(/\b100mm\b/);
  });

  it('sci_fi: 65mm en yakın banda (85) çekilir', () => {
    const out = gateCameraLens('65mm slide along the surface, geometry locked', W('sci_fi_hard_surface'));
    expect(out).toMatch(/\b85mm\b/);
  });

  it('sci_fi: izinli 100mm ve 35mm dokunulmaz', () => {
    const w = W('sci_fi_hard_surface');
    expect(gateCameraLens('100mm macro slide, geometry locked', w)).toMatch(/\b100mm\b/);
    expect(gateCameraLens('35mm slide, geometry locked', w)).toMatch(/\b35mm\b/);
  });

  it('lens UZATILDIĞINDA macro kelimesi korunur (yalnız kısaltmada düşer)', () => {
    // sci_fi: 65mm → 85mm (uzadı). "macro" 85mm'de meşru, silinmemeli.
    const out = gateCameraLens('65mm macro slide along the surface, geometry locked', W('sci_fi_hard_surface'));
    expect(out).toMatch(/\b85mm\b/);
    expect(out, 'lens uzadı ama macro silindi').toMatch(/macro/i);
  });

  it('"yakın plan" MAKRO DEĞİL — lens yasası uygulanmaya devam eder', () => {
    const MACRO = '100mm macro slide along the surface, geometry locked';
    const out = applyWorldCameraLaw(MACRO, 1, W('fincher_precision'), 'REAL', 'Hemşire yakın plan gülümser.');
    expect(out, '"yakın plan" lens yasasını kapattı').not.toMatch(/100mm/);
  });

  it('gerçek makro beat\'i hâlâ muaf', () => {
    const MACRO = '100mm macro slide along the surface, geometry locked';
    const out = applyWorldCameraLaw(MACRO, 1, W('fincher_precision'), 'REAL', 'Dişli çarklar yakın makro detayda döner.');
    expect(out).toMatch(/macro/i);
  });
});

// ---------------------------------------------------------------------------
// Denetçi bulgusu — `lens compression` bir MAKRO TALEBİ değil.
//
// `PATH_LENS_OVERRIDE_RE` "lens compression"ı da muafiyet sayıyordu.
// `AUTOMOTIVE_MOBILITY.required` = "…road/studio environment, lens compression."
// ve varsayılan dünyası fincher_precision (35-50mm). Sonuç: her otomotiv
// sahnesinde lens yasası TAMAMEN kapanıyor, havuzun 100mm macro'su geri
// geliyor — hem fincher'ın 35-50mm yasasını hem kendi "never a shallow-focus
// bokeh vantage" yasağını çiğneyerek.
//
// "Lens compression" jenerik bir optik tarif: geniş olmayan HER odak uzaklığı
// bir miktar sıkıştırma üretir. Bir mercek talebi değil, bir görünüm notu.
// Yalnız açık makro/telefoto talebi yasayı aşar.
describe('lens muafiyeti — yalnız açık makro/telefoto talebi', () => {
  const W = (id: string) => DATA.worlds.find((w) => w.id === id)!;
  const MACRO = '100mm macro slide along the surface, geometry locked';

  it('AUTOMOTIVE_MOBILITY ("lens compression") lens yasasını KAPATMAZ', () => {
    const req = DATA.paths.find((p) => p.id === 'AUTOMOTIVE_MOBILITY')!.required!;
    const out = gateCameraLens(MACRO, W('fincher_precision'), req);
    expect(out, '"lens compression" fincher\'ın 35-50mm yasasını deldi').not.toMatch(/100mm/);
    expect(out).toMatch(/\b50mm\b/);
  });

  it('FOOD_MACRO ("Photoreal macro texture") hâlâ muaf', () => {
    const req = DATA.paths.find((p) => p.id === 'FOOD_MACRO')!.required!;
    expect(gateCameraLens(MACRO, W('fincher_precision'), req)).toMatch(/100mm/);
  });

  it('tam olarak bir path lens yasasından muaf', () => {
    const exempt = DATA.paths
      .filter((p) => gateCameraLens(MACRO, W('fincher_precision'), p.required) === MACRO)
      .map((p) => p.id);
    expect(exempt, 'muafiyet listesi gerekçesiz büyüdü').toEqual(['FOOD_MACRO']);
  });
});

// Ref DNA image prompt'ta ÇÖKÜYORDU: dnaDirectives ref'leri dört jenerik kanala
// (camera/light/staging/motion) indiriyor, buildImagePrompt de yalnız o kanalları
// okuyordu. Ref'i ref yapan `anchor` sadece agentBrief'e gidiyordu. Sonuç: DNA'ları
// tamamen farklı iki ref (dimensional = appeal-geometry/SSS materyal netliği,
// emotional_staging = duyguyu indiren kompozisyon) BİREBİR AYNI image prompt
// üretiyordu — yani reçetede ref seçmek kareyi hiç değiştirmiyordu, dekorasyondu.
describe('ref kimliği image prompt’a ulaşır (ref seçimi dekorasyon değildir)', () => {
  const base = (refIds: string[]) => {
    const raw = 'Su buharlaşır ve yükselir.';
    const beats = autoGroupBeats(raw, 'Dengeli', 'kling_3');
    const r = generateBatch({
      rawSource: raw,
      sourceBeats: beats,
      projectTopic: 'Su',
      projectClass: 'ANIMATION_EDU',
      sceneCount: 1,
      cast: '',
      selectedWorldId: 'pixar_3d_edu',
      selectedPropId: 'native_world',
      selectedRefIds: refIds,
      selectedPaletteId: '',
      selectedMusicId: '',
      imageModel: 'nano_banana_2',
      videoModel: 'kling_3',
    });
    if (r.status !== 'GENERATED') throw new Error('not generated: ' + r.status);
    return r.scenes[0].imagePrompt;
  };

  it('iki farklı ref iki farklı image prompt üretir', () => {
    const dimensional = base(['pixar_dimensional']);
    const emotional = base(['pixar_emotional_staging']);
    expect(dimensional).not.toBe(emotional);
  });

  it('seçilen ref’in ayırt edici anchor’ı prompt’a düşer', () => {
    expect(base(['pixar_dimensional'])).toMatch(/appeal-geometry/i);
    expect(base(['pixar_emotional_staging'])).toMatch(/land a feeling/i);
  });
});

// MONOTONLUK: 8 sahnelik brief'te ışık direktifi HER SAHNEDE birebir aynıydı.
// Sebep bir eksiklik değil, TAKILMAMIŞ BİR KABLO: buildImagePrompt'un beşinci
// parametresi `pv` (varyant tohumu) VAR_LIGHT'tan sahne-bazlı ışık varyantı seçiyor
// ("key'i bir stop yumuşat", "key'i karşı taraftan motive et") — ama pure.ts onu hiç
// geçmiyordu, pv daima 0, VAR_LIGHT[0] = '' idi. Işık motoru yazılmış, kablosu takılmamış.
// İzleyici için sonucu: 8 kare aynı ışıkta, "aynı setin yeniden kadrajlanmış hâli".
describe('sahneler arası ışık monotonluğu (VAR_LIGHT kablosu)', () => {
  const scenes = (n: number) => {
    const raw = Array.from({ length: n }, (_, i) => `Sahne ${i + 1}: mekanizma ${i + 1}. adımda ilerler ve durur.`).join('\n');
    const beats = autoGroupBeats(raw, 'Dengeli', 'kling_3');
    const r = generateBatch({
      rawSource: raw,
      sourceBeats: beats,
      projectTopic: 'Mekanizma',
      projectClass: 'ANIMATION_EDU',
      sceneCount: beats.length,
      cast: '',
      selectedWorldId: 'pixar_3d_edu',
      selectedPropId: 'native_world',
      selectedRefIds: ['pixar_dimensional'],
      selectedPaletteId: '',
      selectedMusicId: '',
      imageModel: 'nano_banana_2',
      videoModel: 'kling_3',
    });
    if (r.status !== 'GENERATED') throw new Error('not generated: ' + r.status);
    return r.scenes.map((s) => s.imagePrompt);
  };

  it('ışık bloğu her sahnede aynı değildir', () => {
    const prompts = scenes(6);
    expect(prompts.length).toBeGreaterThanOrEqual(3);
    // 'Light: …' satırının TAMAMI (varyant cümlesi dahil, palet fiziğinden önce)
    const lightBlocks = prompts.map((p) => (p.match(/Light: [\s\S]*?(?= Palette physics:)/) || [''])[0]);
    expect(new Set(lightBlocks).size).toBeGreaterThan(1);
  });
});

// TELİF: ref anchor'ı artık POZİTİF image prompt'a giriyor (8b7abc9), ve bu risk
// profilini değiştirdi — önce yalnız agentBrief'e (insanın/Claude'un süzdüğü bir
// belgeye) gidiyordu. apple_object_worship'in anchor'ı "Apple object worship: reverent
// hero product…" diyor: motora "Apple" dersen sana gerçek bir iPhone çizer. Üstelik
// aynı prompt'un negatifinde "NO real brand" yazıyor — pozitif ile negatif kavga ediyor.
// Telif firewall'u (proof.ts) yalnız `cast` alanını tarıyordu, image prompt'u değil.
// Kural: anchor prompt'a girmeden marka/IP süzgecinden geçer; zanaat tarifi yaşar, ad ölür.
describe('ref anchor telif firewall’ı (pozitif prompt’a marka adı sızmaz)', () => {
  const promptWith = (refIds: string[]) => {
    const raw = 'Ürün masada durur ve ışık üstünde gezinir.';
    const beats = autoGroupBeats(raw, 'Dengeli', 'kling_3');
    const r = generateBatch({
      rawSource: raw,
      sourceBeats: beats,
      projectTopic: 'Ürün',
      projectClass: 'PRODUCT_HERO',
      sceneCount: 1,
      cast: '',
      selectedWorldId: 'product_brand_real',
      selectedPropId: 'native_world',
      selectedRefIds: refIds,
      selectedPaletteId: '',
      selectedMusicId: '',
      imageModel: 'nano_banana_2',
      videoModel: 'kling_3',
    });
    if (r.status !== 'GENERATED') throw new Error('not generated: ' + r.status);
    return r.scenes[0].imagePrompt;
  };

  it('apple_object_worship: marka adı prompt’a GEÇMEZ', () => {
    expect(promptWith(['apple_object_worship'])).not.toMatch(/\bapple\b/i);
  });

  it('ama ref’in ZANAAT tarifi yaşar (anchor tamamen susturulmaz)', () => {
    expect(promptWith(['apple_object_worship'])).toMatch(/reverent hero product|negative space/i);
  });
});

// KOMPOZİSYON MONOTONLUĞU: 12 shot pattern'in yalnız 3'ü EVRENSEL, 9'u ref-kapılı
// (Kubrick tek-nokta, Villeneuve ölçek, Tarkovsky sürüklenme…). Preset ref üçlülerinde
// bunlardan hiçbiri yok → her proje aynı 3 kompozisyonu döngüye sokuyordu. Daha kötüsü:
// simetri-kilitli dünyalarda (fincher/kubrick/severance) 3 evrenselden 2'si havuzdan
// düşüyor ve geriye TEK kalıp kalıyordu — o dünyalarda HER SAHNE aynı kompozisyonda
// çıkıyordu ("layered depth" ×N). İzleyici için: "aynı setin yeniden kadrajlanmış hâli".
describe('kompozisyon sözlüğü — hiçbir dünya tek kalıba düşmez', () => {
  const comps = (worldId: string, projectClass: string) => {
    const raw = Array.from({ length: 6 }, (_, i) => `Adım ${i + 1}: parça yerine oturur ve ışık değişir.`).join('\n');
    const beats = autoGroupBeats(raw, 'Dengeli', 'kling_3');
    const r = generateBatch({
      rawSource: raw,
      sourceBeats: beats,
      projectTopic: 'Mekanizma',
      projectClass,
      sceneCount: beats.length,
      cast: '',
      selectedWorldId: worldId,
      selectedPropId: 'native_world',
      selectedRefIds: [],
      selectedPaletteId: '',
      selectedMusicId: '',
      imageModel: 'nano_banana_2',
      videoModel: 'kling_3',
    });
    if (r.status !== 'GENERATED') throw new Error('not generated: ' + r.status);
    return new Set(r.scenes.map((s) => (s.imagePrompt.match(/Composition pattern: ([^—]*)—/) || [])[1] || '?'));
  };

  it('simetri-kilitli dünya (fincher) tek kompozisyona hapsolmaz', () => {
    expect(comps('fincher_precision', 'ULTRAREAL_COMMERCIAL').size).toBeGreaterThan(1);
  });

  it('ref seçilmemiş sıradan projede kompozisyon sözlüğü 3’ten geniştir', () => {
    expect(comps('pixar_3d_edu', 'ANIMATION_EDU').size).toBeGreaterThan(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TWO ORDERS FOR THE SAME PIXEL — world light law vs palette bias.
//
// Authority is settled: World/Render Lock > Palette. resolvePaletteGradeConflict already
// enforces it on the shadow-temperature, teal-orange and warm-highlight axes. It never
// covered the KEY and the FILL — so pixar (whose law asks for a "warm motivated key" and a
// "complementary bounce fill") shipped alongside cool_scientific's "NO warm element", and
// deep_noir's "Total shadow absorption / NO lifted shadow" shipped against a world that
// says the bounce "opens the shadow side". Measured across the real 39×12 matrix: 41 of
// 348 pairs carried two contradictory orders. The engine resolves them by guessing.
//
// The third axis is worse: motion_design_flat and ukiyo_e_print declare "No directional
// lighting simulation … a printed color-block, not a light falloff" — and the prompt then
// appended a VAR_LIGHT variant ("trade the key one stop softer", "motivate the key from the
// opposite side") to a world that HAS no key. isFlatLightWorld existed; nothing consulted it
// here. Written, never wired — the same wound as `pv` itself.
describe('world light law outranks the palette (real 39×12 matrix)', () => {
  const AXES: Array<[string, RegExp, RegExp]> = [
    ['KEY warmth', /warm motivated key|warm key with a named source|motivated key/i, /NO warm element|NO warm(?!-)/i],
    // The palette's ORDERS are compared, not its colour identity. "Total shadow absorption"
    // is deep_noir describing itself, and the Translation Law sentence that follows tells the
    // engine how to read it. "NO lifted shadow" is a hard ban that overrode the world's own
    // bounce fill — that is the one that had to yield, and it did (LIFT_SCOPED_ITEM).
    ['FILL/BOUNCE', /bounce fill|opens the shadow side|complementary bounce|one to two stops under key/i, /NO lifted shadow|NO shadow lift/i],
    // Precise on purpose. A woodblock print has a "key-line" (the black outline block) and a
    // flat world's law says it is "not a light falloff" — neither is a lighting order, and an
    // earlier draft of this regex flagged both, i.e. flagged the world for obeying itself.
    // Only phrases that ORDER directional light count.
    ['flat-light world given a key', /No directional lighting simulation|not a light falloff|printed color-block/i, /\bone strong key\b|\bmotivated key\b|\bkey light\b|rim\/backlight|\brim accent\b|\bbounce fill\b|complementary bounce/i],
  ];

  it('no world × palette pair ships two orders for the same pixel', async () => {
    const { DATA, generateBatch, resolveRecipeDefaults } = await import('./pure');
    const { ingestSource, sourceIntegrity } = await import('./source');
    const src = 'Bir sey olur. Sonra baska bir sey olur. Sonunda degisir.';
    const beats = ingestSource(src);
    const report = sourceIntegrity(src, beats);
    const offenders: string[] = [];

    for (const world of DATA.worlds) {
      const project = DATA.projects.find((p) => p.world === world.id) ?? DATA.projects[0];
      const defaults = resolveRecipeDefaults('ANIMATION_EDU', world.id);
      for (const palette of DATA.palettes) {
        let out: { status: string; scenes: Array<{ imagePrompt: string }> };
        try {
          out = generateBatch({
            selectedProjectId: project.id, projectTopic: 'X', projectClass: project.path,
            sceneCount: 2, cast: 'bir kisi', selectedWorldId: world.id, selectedPropId: 'native_world',
            selectedRefIds: defaults.selectedRefIds, selectedPaletteId: palette.id, selectedMusicId: '',
            imageModel: 'nano_banana_2', videoModel: 'kling_3', brandKitLock: '', mood: '',
            cameraEnergy: '', timeLight: '', transition: '', musicVibe: '', pov: '', signature: '',
            leitmotif: '', tempoCurve: '', directorBrief: '',
            rawSource: src, sourceBeats: beats, sourceReport: report,
          } as never) as unknown as { status: string; scenes: Array<{ imagePrompt: string }> };
        } catch { continue; }
        if (out.status !== 'GENERATED' || !out.scenes.length) continue;
        const band = out.scenes[0].imagePrompt.split(/\bNegative:/i)[0];
        // A prohibition is not an order. "no simulated light falloff" is the flat world's law
        // doing its job — an axis regex that flags it would flag the FIX. Only the clauses
        // that ORDER something are compared.
        const positive = band
          .split(/[.;]/)
          .filter((clause) => !/\b(NO|no|never|avoid|forbid)\b/.test(clause))
          .join('. ');
        for (const [axis, worldSays, paletteSays] of AXES) {
          if (worldSays.test(band) && paletteSays.test(positive)) {
            offenders.push(`${world.id} × ${palette.id} → ${axis}`);
          }
        }
      }
    }

    expect(
      offenders.length,
      `${offenders.length} world×palette pairs hand the engine two contradictory light orders:\n  ${offenders.slice(0, 12).join('\n  ')}`,
    ).toBe(0);
  });
});
