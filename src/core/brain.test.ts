import { describe, it, expect } from 'vitest';
import {
  registerOf, realFamilyOf, conceptRanked, dnaDirectives, durationGuard,
  primeSuno, estimateSec, renderLock, primeCamera, primeConcept, buildAgentBrief,
  buildVariantBriefs, recommendReason, primePacket
} from './brain';
import { DATA } from './pure';

const clayWorld = DATA.worlds.find((w) => w.id === 'clay')!;
const pixarRef = DATA.refs.find((r) => r.id === 'pixar_dimensional')!;

describe('registerOf', () => {
  it('maps paths to the three registers', () => {
    expect(registerOf('ANIMATION_EDU')).toBe('EDU');
    expect(registerOf('STYLIZED_PREMIUM')).toBe('STY');
    expect(registerOf('ULTRAREAL_COMMERCIAL')).toBe('REAL');
  });
});

describe('conceptRanked (semantic brain)', () => {
  it('detects the water cycle and picks the matching stage, not a generic fallback', () => {
    const c = conceptRanked('Güneş suyu ısıtır ve su buharlaşıp yükselir', 'EDU', 'clay', 'Build-up');
    expect(c[0].matched).toBe(true);
    expect(c[0].subject.toLowerCase()).toContain('sea');
  });

  it('expands a generic water-cycle topic into multiple usable stages', () => {
    const c = conceptRanked('Su Döngüsü', 'EDU', 'arcane', 'Build-up');
    expect(c.filter((item) => item.matched)).toHaveLength(5);
    expect(new Set(c.slice(0, 5).map((item) => item.subject)).size).toBe(5);
  });

  it('detects math equation source → balance scale concept', () => {
    const c = conceptRanked('iki sayının toplamı eşittir', 'EDU', 'clay', 'Build-up');
    expect(c.some((x) => /balance|tile|grid|scale/i.test(x.subject))).toBe(true);
  });

  it('detects civic decision source instead of falling back to capsule boilerplate', () => {
    const c = conceptRanked('Peki hiç düşündün mü; şehirdeki bir kararı kim alıyor?', 'EDU', 'arcane', 'Intro');
    expect(c[0].matched).toBe(true);
    expect(`${c[0].subject} ${c[0].event}`).toMatch(/civic|decision|citizen|council|neighborhood/i);
  });

  it('detects Turkish digital literacy source with dotted İ casing', () => {
    const c = conceptRanked('İnternette gördüğümüz her bilgi doğru olmayabilir.', 'EDU', 'arcane', 'Build-up');
    expect(c[0].matched).toBe(true);
    expect(`${c[0].subject} ${c[0].event}`).toMatch(/digital|source-check|trusted-source|advertising/i);
  });

  it('keeps broad curriculum signals out of civic fallback collisions', () => {
    const math = conceptRanked('Toplama işleminde sonuç eşittir.', 'EDU', 'arcane', 'Build-up')[0];
    const cause = conceptRanked('Çünkü sebep sonuç ilişkisini kurar.', 'EDU', 'arcane', 'Build-up')[0];
    expect(math.subject).toMatch(/balance scale|number tiles/i);
    expect(cause.subject).toMatch(/cause card|result card|bridge/i);
    expect(`${math.subject} ${cause.subject}`).not.toMatch(/public result board|civic decision/i);
  });

  it('stress-covers common education sources without generic fallback as first choice', () => {
    const fixtures = [
      'Yaprak klorofil ile fotosentez yapar.',
      'Kuvvet uygulayınca blok sürtünme ile yavaşlar.',
      'Gezegen yörüngede güneş çevresinde döner.',
      'Buz ısı alınca erime gerçekleşir.',
      'Kesir pay ve payda ile bütünün parçasını gösterir.',
      'Üçgenin açıları ve çevresi ölçülür.',
      'Saat dakika ve süre ölçmeyi gösterir.',
      'Atatürk Cumhuriyet ve bağımsızlık konusunu anlatır.',
      'Harita pusula ve bölge yön bulmayı anlatır.',
      'Empati ve saygı arkadaşlıkta önemlidir.',
      'Fiil isim sıfat sözcük türlerini ayırırız.',
      'Ana fikir paragraf içinde bulunur.',
      'Sindirim sistemi organların görevini gösterir.',
      'Geri dönüşüm atıkları dönüştürür.',
      'Yaya geçidi ve emniyet kemeri güvenliğimizi korur.',
      'Deprem çantası ve tatbikat hazırlığı yapılır.',
      'Belediye meclisi park kararını tartışır.',
      'Vatandaş önerisini dilekçeye çevirir.',
      'Reklam ile bilgi birbirinden ayrılmalıdır.',
    ];
    for (const source of fixtures) {
      const top = conceptRanked(source, 'EDU', 'arcane', 'Build-up')[0];
      expect(top.matched, source).toBe(true);
      expect(`${top.subject} ${top.event}`, source).not.toMatch(/sealed capsule|working model of the core idea|abstract core-idea/i);
    }
  });

  it('always returns at least a fallback concept', () => {
    const c = conceptRanked('tamamen alakasız metin', 'EDU', 'clay', 'Intro');
    expect(c.length).toBeGreaterThan(0);
    expect(c[c.length - 1].matched).toBe(false);
  });

  it('matches the expanded civic-education concept bank', () => {
    const cases: Array<[string, RegExp]> = [
      ['Anayasa ve kanun adaleti sağlar.', /law-foundation|justice/],
      ['Kamuoyu ve toplum sesi kararı etkiler.', /public-opinion/],
      ['Seçim ve sandık ile milletvekili seçilir.', /ballot/],
      ['Sivil toplum ve dernek gönüllü çalışır.', /civic-bridge|volunteer/],
      ['Dijital vatandaşlık e-devlet ile olur.', /digital civic portal/],
      ['Bu unsurlar birbirini etkiler ve hep birlikte çalışır.', /interconnection/],
    ];
    for (const [source, re] of cases) {
      const top = conceptRanked(source, 'EDU', 'arcane', 'Build-up')[0];
      expect(top.matched, source).toBe(true);
      expect(`${top.subject} ${top.event}`, source).toMatch(re);
    }
  });

  it('primeConcept stays deterministic and unchanged without allPrevious', () => {
    const src = 'Anayasa ve kanun adaleti sağlar.';
    expect(primeConcept(src, 'EDU', 'arcane', 'Build-up')).toEqual(primeConcept(src, 'EDU', 'arcane', 'Build-up'));
  });

  it('primeConcept rotates away from an over-used subject when alternatives exist', () => {
    const src = 'Anayasa ve kanun adaleti sağlar.';
    const first = primeConcept(src, 'EDU', 'arcane', 'Build-up');
    const overUsed = [first, first, first];
    const next = primeConcept(src, 'EDU', 'arcane', 'Build-up', undefined, 0, overUsed);
    expect(next.subject).not.toBe(first.subject);
  });

  it('real register routes through the world→family bank', () => {
    expect(realFamilyOf('food_macro_real')).toBe('FOOD');
    const c = conceptRanked('espresso fincana dökülüyor', 'REAL', 'food_macro_real', 'Build-up');
    expect(c[0].subject.toLowerCase()).toMatch(/cup|crema|pour/);
  });

  it('REAL register broad-topic triggers match without generic fallback', () => {
    const cases: [string, string, string][] = [
      ['Kafe kahvesi hazırlanıyor', 'REAL', 'food_macro_real'],
      ['Müşteri deneyimini paylaşıyor', 'REAL', 'real_human_doc'],
      ['Şehir merkezinde moda fotoğrafı', 'REAL', 'luxury_editorial'],
      ['Elektrikli araç yolda test ediliyor', 'REAL', 'automotive_stage_real'],
      ['Modern daire iç mekanı gösterimi', 'REAL', 'architecture_real'],
      ['Doğu Anadolu yaylalarında sabah', 'REAL', 'tourism_destination_real'],
      ['Düğün töreni anıları', 'REAL', 'cinematic_real'],
      ['Vatandaşlar mahallede buluşuyor', 'REAL', 'documentary_civic'],
      ['Hastane ekibi çalışıyor', 'REAL', 'healthcare_public_real'],
      ['Tarih mirası belgesel', 'REAL', 'documentary_civic'],
    ];
    for (const [source, register, worldId] of cases) {
      const top = conceptRanked(source, register as 'REAL', worldId, 'Build-up')[0];
      expect(top?.matched, `${source} → ${worldId}`).toBe(true);
    }
  });

  // --- regression guards for concept-bank bug fixes ---

  it('EDU: "Ampul ışık verir" routes to circuit concept, not optics/prizma', () => {
    const c = conceptRanked('Ampul ışık verir.', 'EDU', 'clay', 'Build-up');
    const top = c[0];
    expect(top.matched).toBe(true);
    expect(`${top.subject} ${top.event}`).toMatch(/circuit|bulb|battery|switch|board/i);
    expect(`${top.subject} ${top.event}`).not.toMatch(/prism|optics rig|spectrum/i);
  });

  it('EDU: "Prizmada ışık kırılır" still routes to optics, not circuit', () => {
    const c = conceptRanked('Prizmada ışık kırılır.', 'EDU', 'clay', 'Build-up');
    const top = c[0];
    expect(top.matched).toBe(true);
    expect(`${top.subject} ${top.event}`).toMatch(/prism|optics|spectrum|lamp|screen/i);
  });

  it('STY: "Viking ada" does NOT trigger revenge/kin concept', () => {
    const c = conceptRanked('Viking tarzı devlerin yaşadığı ada macerası', 'STY', 'painterly_shadow', 'Build-up');
    const top = c[0];
    expect(`${top.subject} ${top.event}`).not.toMatch(/interior weight|revenge|kin|controlled menace|fury/i);
  });

  it('STY: "büyür" (to grow) does NOT trigger magic/fantasy concept', () => {
    const c = conceptRanked('Ekip adaya yaklaştıkça okyanus ve gökyüzü büyür', 'STY', 'painterly_shadow', 'Build-up');
    const top = c[0];
    expect(`${top.subject} ${top.event}`).not.toMatch(/mage|magic geometry|magic expansion|sorcerer|fantasy/i);
  });

  it('STY: "uzay istasyonu" routes to space concept, NOT mecha', () => {
    const c = conceptRanked('Uzay istasyonu yeni gezegene doğru ilerler.', 'STY', 'painterly_shadow', 'Build-up');
    const top = c[0];
    expect(top.matched).toBe(true);
    expect(`${top.subject} ${top.event}`).toMatch(/spacecraft|frontier|star field|cosmos|vessel|suited/i);
    expect(`${top.subject} ${top.event}`).not.toMatch(/mech|bio-mechanical|industrial void|pilot/i);
  });

  it('EDU: evaporation beat (güneş+yüksel) triggers water-cycle concept, not generic fallback', () => {
    const c = conceptRanked('Güneş denizi ısıtır, su molekülleri yükselir', 'EDU', 'spiderverse', 'Build-up');
    const top = c[0];
    expect(top.matched).toBe(true);
    expect(`${top.subject} ${top.event}`).toMatch(/sea|evapor|vapour|water bead/i);
  });

  it('EDU: "damlacıkları" must NOT false-match civic açık regex → cloud beat gets condensation concept', () => {
    const c = conceptRanked('Bulutlar oluşur, soğuyan su damlacıkları birleşir', 'EDU', 'spiderverse', 'Build-up');
    const top = c[0];
    expect(top.matched).toBe(true);
    expect(`${top.subject} ${top.event}`).not.toMatch(/public result board|decision card|neighborhood map/i);
    expect(`${top.subject} ${top.event}`).toMatch(/vapour|cloud|cool|sky/i);
  });

  it('REAL: productionPath COMMERCIAL_PRODUCT overrides cinematic_real→EVENT world mapping', () => {
    const c = conceptRanked('Ürün masanın üzerinde tek başına, saf ve güçlü', 'REAL', 'cinematic_real', 'Build-up', 'COMMERCIAL_PRODUCT');
    const top = c[0];
    expect(top.matched).toBe(true);
    expect(`${top.subject} ${top.event}`).toMatch(/hero product|negative space|product alone/i);
  });

  it('STY register covers 20 common genre topics without generic fallback', () => {
    const styFixtures = [
      'Robotlar ve insanlığın son savaşı',
      'Uzayda kaybolmuş astronot',
      'Siber dünyada hacker iz sürüyor',
      'Kabus gibi karanlık bir orman',
      'Sisli ormanda kaybolmuş çocuk',
      'Ejderha terbiyecisi fantezi dünyasında',
      'Antik tapınakta hazine arayan kaşif',
      'Final maçında son saniyede gol',
      'Sahneye çıkan genç müzisyen',
      'Köyde sakin bir yaz günü',
      'Eski arkadaşların sürpriz buluşması',
      'Komedik bir plan tam gitmedi',
      'İki genç arasındaki sessiz aşk',
      'Kayıp sonrası derin yalnızlık',
      'Dedektif ipuçlarını birleştiriyor',
      'Samuray son düelonu bekliyor',
      'Kıyamet sonrası dünyada hayatta kalmak',
      'Fırça darbelerinden oluşan savaş sahnesi',
      'Bilim insanı çığır açan keşfin eşiğinde',
      'Kahramanın son kez ayağa kalkması',
    ];
    for (const source of styFixtures) {
      const top = conceptRanked(source, 'STY', 'arcane', 'Build-up')[0];
      expect(top.matched, source).toBe(true);
    }
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
  it('render lock uses the world render recipe verbatim', () => {
    expect(renderLock(clayWorld, 'EDU')).toBe(clayWorld.render);
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
      world: clayWorld, dna: { names: 'n', camera: 'c', light: 'l', staging: 's', motion: 'm', texture: 't', avoid: 'a' },
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
      world: clayWorld, dna: { names: 'n', camera: 'c', light: 'l', staging: 's', motion: 'm', texture: 't', avoid: 'a' },
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

describe('primePacket & buildAgentBrief richness', () => {
  const ctx = {
    projectTopic: 'Water cycle exploration',
    productionPath: 'ANIMATION_EDU',
    register: 'EDU' as const,
    world: clayWorld,
    dna: { names: 'Pixar Ref', camera: 'medium view', light: 'soft ambient', staging: 'centered', motion: 'gentle drift', texture: 'clay texture', avoid: 'plastic' },
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
    expect(brief).toContain('== PROOF STATE & QUALITY STATUS ==');
    expect(brief).toContain('Status: PASS');
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
      expect(result).toContain(clayWorld.render);
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

describe('STY_BANK \\brun\\b false-positive guard', () => {
  it('görünür does NOT trigger chase/run concept bank', () => {
    const src = 'Ufukta yeni topraklar görünür, gemi yelken açar';
    const concepts = conceptRanked(src, 'STY', 'arcane', 'Intro');
    // Should get adventure traveler concept (yelken/ufukta pattern), not kinetic silhouette
    expect(concepts[0].subject).not.toContain('kinetic figure silhouette mid-stride');
  });

  it('adventure source (yelken/ufuk) triggers traveler concept', () => {
    const src = 'Ufukta yeni topraklar görünür, gemi yelken açar, ekip yeni dünyayı keşfetmeye hazır';
    const concepts = conceptRanked(src, 'STY', 'arcane', 'Intro');
    expect(concepts[0].matched).toBe(true);
    expect(concepts[0].subject).toContain('traveler');
  });

  it('genuine run/chase source still triggers kinetic concept', () => {
    const src = 'Kahraman düşmandan kaçmak için koşuyor, chase begins';
    const concepts = conceptRanked(src, 'STY', 'arcane', 'Climax');
    const kinetic = concepts.find(c => c.subject.includes('kinetic figure silhouette'));
    expect(kinetic).toBeTruthy();
  });
});

describe('EDU_BANK new entries (2026-06-28)', () => {
  const edu = (src: string) => conceptRanked(src, 'EDU', 'ghibli_soft', 'Build-up');

  it('kalp/heart matches cutaway heart model', () => {
    const concepts = edu('İnsan kalbi sağ ve sol karıncıklar kanı pompalar');
    expect(concepts[0].matched).toBe(true);
    expect(concepts[0].subject).toContain('heart model');
  });

  it('sinir sistemi/beyin matches neuron pathway model', () => {
    const concepts = edu('Sinir sistemi ve beyin nöron ağı nasıl çalışır');
    expect(concepts[0].matched).toBe(true);
    expect(concepts[0].subject).toContain('neuron');
  });

  it('ışık/kırılma matches optics rig', () => {
    const concepts = edu('Işığın yansıması ve kırılması, prizmanın renk ayrıştırması');
    expect(concepts[0].matched).toBe(true);
    expect(concepts[0].subject).toContain('optics rig');
  });

  it('ses/titreşim matches tuning fork', () => {
    const concepts = edu('Ses dalgaları titreşim ve yankı nasıl oluşur');
    expect(concepts[0].matched).toBe(true);
    expect(concepts[0].subject).toContain('tuning fork');
  });

  it('elektrik/devre matches circuit board', () => {
    const concepts = edu('Elektrik devre pil ve ampul akım akışı');
    expect(concepts[0].matched).toBe(true);
    expect(concepts[0].subject).toContain('circuit board');
  });

  it('atom/molekül/madde matches element-tile board', () => {
    const concepts = edu('Madde atom ve molekül yapısı element özellikleri');
    expect(concepts[0].matched).toBe(true);
    expect(concepts[0].subject).toContain('element-tile board');
  });

  it('üçgenin açıları matches shape-building geometry concept', () => {
    const concepts = edu('Üçgenin açıları ve geometri kuralları');
    expect(concepts[0].matched).toBe(true);
    // matches the geometry bank entry (edge sticks + protractor)
    expect(concepts[0].subject).toContain('shape-building table');
  });

  it('üretim/tarım matches growth-cycle planting stage', () => {
    const concepts = edu('Tarım ve üretim çiftçi toprak hazırlığı');
    expect(concepts[0].matched).toBe(true);
    expect(concepts[0].subject).toContain('planting stage');
  });

  it('hücre bölünme/mitoz matches cell dome', () => {
    const concepts = edu('Hücre bölünmesi mitoz ve DNA kopyalanması');
    expect(concepts[0].matched).toBe(true);
    expect(concepts[0].subject).toContain('cell dome');
  });

  it('OBOB/OKEK matches factor grid', () => {
    const concepts = edu('OBOB ve OKEK bulma hüceman bütün sayı hesaplama');
    expect(concepts[0].matched).toBe(true);
    expect(concepts[0].subject).toContain('factor grid');
  });
});

describe('STY_BANK power-surge expanded pattern', () => {
  it('"güç yükselişi" triggers power expansion concept', () => {
    const concepts = conceptRanked('Güç yükselişi başladı karakter güçleniyor', 'STY', 'solo_leveling_gate', 'Climax');
    expect(concepts[0].matched).toBe(true);
    expect(concepts[0].subject).toContain('power expansion');
  });

  it('"awakening" triggers power expansion concept', () => {
    const concepts = conceptRanked('The awakening begins power level rising', 'STY', 'solo_leveling_gate', 'Climax');
    expect(concepts[0].matched).toBe(true);
    expect(concepts[0].subject).toContain('power expansion');
  });
});
