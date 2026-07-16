import { describe, it, expect } from 'vitest';
import { generateBatch, DATA, type BriefInput } from './pure';
import { autoGroupBeats, sourceIntegrity } from './source';
import { dnaDirectives, hexToLightWords, primeShotPattern, applyWorldCameraLaw } from './brain';
import { CAM_REAL } from './brain-data';
import { evaluateDirectorCabinet } from './qa';
import { buildCommandJSON } from './commandExport';

// Task 5 kök-fix dalgası — mihenk-taşı bulgularının kök-düzeltme testleri.
// Her test önce contradiction'ı üretir (FAILING), sonra fix onu yeşile çeker.
// Gerçek generateBatch çıktısı kullanılır (fixture değil — CLAUDE.md denetim dersi).

const EDU_PIXAR = {
  projectClass: 'ANIMATION_EDU',
  selectedWorldId: 'pixar_3d_edu',
  selectedRefIds: ['pixar_dimensional', 'pixar_emotional_staging'],
  rawSource: [
    'Güneş, denizin yüzeyini ısıtır ve su buharlaşarak gökyüzüne yükselir.',
    'Yükselen buhar soğuk havayla karşılaşınca minik damlacıklara dönüşür.',
    'Bulutlar ağırlaşınca damlalar yağmur olarak toprağa düşer.',
  ].join('\n'),
};

const REAL_FINCHER = {
  projectClass: 'PRODUCT_HERO',
  selectedWorldId: 'fincher_precision',
  selectedRefIds: ['kubrick_one_point', 'severance_corporate_dread'],
  rawSource: [
    'Kutunun kapağı yavaşça açılır ve saatin metal yüzeyi ilk ışığı yakalar.',
    'Logo işareti kontrollü bir key light altında keskin ve net durur.',
    'Kayışın dokusu makro planda görünür, her dikişi belirgindir.',
    'Bir el saati bilekte takarken doğal bir hareketle kapatır.',
    'Ürün, disiplinli bir negatif alanda tek başına kahraman olarak durur.',
  ].join('\n'),
};

// WATCH_MACRO reçetesi — Product/Macro ref'leri (FINAL BULGU-2 metal.*reflect artığı).
const WATCH_MACRO = {
  projectClass: 'PRODUCT_HERO',
  selectedWorldId: 'fincher_precision',
  selectedRefIds: ['luxury_watch_macro', 'apple_object_worship'],
  rawSource: [
    'Saatin kadranı siyah zeminde tek bir ışıkla parlar.',
    'Akrep ve yelkovan mikron hassasiyetle durur ve metal yüzey ışığı yansıtır.',
    'Kristal camın altında mekanik detay net görünür.',
  ].join('\n'),
};

// STY (STYLIZED_PREMIUM) reçetesi — merged çok-cümleli beat FIX-6b'yi 3. register'da kanıtlar.
const STY_GHIBLI = {
  projectClass: 'STYLIZED_PREMIUM',
  selectedWorldId: 'ghibli_hayao',
  selectedRefIds: [] as string[],
  rawSource: [
    'Rüzgar çayırın üstünden geçer ve otlar dalga dalga eğilir.',
    'Uzaktaki tepede tek bir ağaç sessizce durur.',
    'Bir kuş sürüsü gökyüzünde geniş bir yay çizerek süzülür.',
    'Akşam ışığı vadinin sırtını sıcak bir tonla yıkar.',
    'Çocuk çimenlere uzanıp gökyüzünü izler.',
  ].join('\n'),
};

function run(recipe: { projectClass: string; selectedWorldId: string; selectedRefIds: string[]; rawSource: string }, paletteId = '') {
  const beats = autoGroupBeats(recipe.rawSource, 'Dengeli', 'kling_3');
  const brief: BriefInput = {
    projectTopic: 'x', projectClass: recipe.projectClass, sceneCount: beats.length, cast: '',
    selectedWorldId: recipe.selectedWorldId, selectedPropId: 'native_world',
    selectedRefIds: recipe.selectedRefIds, selectedPaletteId: paletteId, selectedMusicId: '',
    imageModel: 'nano_banana_2', videoModel: 'kling_3', rawSource: recipe.rawSource, sourceBeats: beats,
  };
  const result = generateBatch(brief);
  expect(result.status).toBe('GENERATED');
  return { result, beats, brief };
}

function negLineOf(imagePrompt: string): string {
  return (imagePrompt.match(/Negative:[^\n]*/) ?? [''])[0];
}
function lightLineOf(imagePrompt: string): string {
  return (imagePrompt.match(/Light:[^\n]*/) ?? [''])[0];
}

// ============ FIX-1: DNA_MAP ışık-direktifi false-positive ============
describe('FIX-1: pixar EDU ışık direktifi world light_law ile ÇELİŞMEZ', () => {
  it('dnaDirectives(pixar).light chiaroscuro/high-contrast direktifi enjekte ETMEZ', () => {
    const refs = DATA.refs.filter(r => EDU_PIXAR.selectedRefIds.includes(r.id));
    const dna = dnaDirectives(refs, 'EDU');
    expect(dna.light.toLowerCase()).not.toContain('extreme high-contrast');
    expect(dna.light.toLowerCase()).not.toContain('no ambient fill');
    expect(dna.light.toLowerCase()).not.toContain('hard value separation');
  });

  it('image prompt Light satırı hem "never cold-black" hem "no ambient fill" AYNI ANDA taşımaz', () => {
    const { result } = run(EDU_PIXAR);
    const world = DATA.worlds.find(w => w.id === 'pixar_3d_edu')!;
    // world light_law softlaw: complementary bounce / never cold-black
    expect((world.light_law || '').toLowerCase()).toContain('complementary bounce');
    for (const s of result.scenes) {
      const light = lightLineOf(s.imagePrompt).toLowerCase();
      // world law (in renderLock) says ambient warm-dark bounce; the DNA line must
      // not simultaneously demand its opposite.
      expect(s.imagePrompt.toLowerCase(), `Sahne ${s.id} çelişkili high-contrast direktifi taşıyor`).not.toContain('no ambient fill');
      expect(light, `Sahne ${s.id} Light chiaroscuro taşıyor`).not.toContain('extreme high-contrast');
    }
  });
});

// ============ FIX-2: palet çevirisi near-neutral warm → off-white ============
describe('FIX-2: düşük-satürasyon sıcak highlight "burnt orange" ÜRETMEZ', () => {
  it('#C4C0B8 (s≈0.09, l≈0.75, h≈40°) burnt orange DEĞİL off-white/greige/ivory', () => {
    const out = hexToLightWords('#C4C0B8');
    expect(out.toLowerCase()).not.toContain('burnt orange');
    expect(out.toLowerCase()).toMatch(/off-white|greige|ivory/);
  });

  it('mevcut earth precision davranışı korunur (umber / ivory / vivid amber)', () => {
    expect(hexToLightWords('#8B7355')).toContain('umber');
    expect(hexToLightWords('#F4E4C6')).toContain('ivory');
    expect(hexToLightWords('#FFC93C')).toBe('vivid warm amber');
  });

  it('desaturated_cinematic paleti image prompt Palette physics\'te burnt orange highlight ÜRETMEZ', () => {
    const { result } = run(REAL_FINCHER, 'desaturated_cinematic');
    for (const s of result.scenes) {
      expect(s.imagePrompt.toLowerCase(), `Sahne ${s.id} burnt orange highlight sızdırdı`).not.toContain('burnt orange');
    }
  });
});

// ============ FIX-3: image Negative IP-isim seli + şişkinlik ============
describe('FIX-3: image Negative stil-firewall TUTAR, enumerated IP-isim seli DÜŞER', () => {
  it('REAL Negative: Tyler Durden / HAL 9000 enumerated isimleri YOK, jenerik IP cümlesi VAR', () => {
    const { result } = run(REAL_FINCHER);
    for (const s of result.scenes) {
      const neg = negLineOf(s.imagePrompt);
      expect(neg, `Sahne ${s.id} enumerated IP (Tyler Durden) taşıyor`).not.toContain('Tyler Durden');
      expect(neg, `Sahne ${s.id} enumerated IP (HAL 9000) taşıyor`).not.toContain('HAL 9000');
      expect(neg, `Sahne ${s.id} enumerated IP (Zuckerberg) taşıyor`).not.toContain('Zuckerberg');
      expect(neg, `Sahne ${s.id} jenerik IP cümlesi yok`).toContain('no recognizable franchise or real-person characters');
    }
  });

  it('REAL Negative: stil/sıcaklık firewall negatifleri KORUNUR (warm-cozy grade)', () => {
    const { result } = run(REAL_FINCHER);
    const neg = negLineOf(result.scenes[0].imagePrompt).toLowerCase();
    expect(neg).toContain('warm-cozy grade');
  });

  it('REAL Negative: "handheld" en fazla 1 kez geçer (dedupe)', () => {
    const { result } = run(REAL_FINCHER);
    for (const s of result.scenes) {
      const neg = negLineOf(s.imagePrompt);
      const count = (neg.match(/handheld/gi) || []).length;
      expect(count, `Sahne ${s.id} handheld ${count}× (dedupe başarısız)`).toBeLessThanOrEqual(1);
    }
  });
});

// ============ FIX-4: drama/volition register-aware eşik ============
function stateWith(projectClass: string, durations: number[]) {
  return {
    projectClass, selectedWorldId: 'fincher_precision', selectedPropId: 'none',
    scenes: durations.map((d, i) => ({
      id: i + 1,
      architecture: { source: { status: 'OK', sourceId: String(i + 1), exactText: 't', notice: null }, beat: 'orient', exactSourceBeat: 's e', semanticInterpretationStatus: 'AGENT_AUTHORED', imageVantage: `${35 + i * 5}mm ${['eye', 'low', 'high', 'macro', 'wide'][i % 5]} shot`, semanticFingerprint: String(i) },
      imagePrompt: `[${i + 1}] IMAGE\nrender. Scene brief. Light: soft. Camera: x. Negative: none.`,
      motionPrompt: `[${i + 1}] MOTION\nCamera: x. Motion brief.`,
      durationSec: d, onScreenText: null,
    })),
    sourceReport: { coverage: 100 },
  } as any;
}
describe('FIX-4: sinematik pacing drama\'yı HAKSIZ RED\'lemez', () => {
  it('REAL 5.8-8.7s sahneler (avg~6.7) drama success=true', () => {
    const tips = evaluateDirectorCabinet(stateWith('PRODUCT_HERO', [6.2, 6.2, 8.7, 5.8]));
    const drama = tips.find(t => t.skill === 'drama');
    expect(drama?.success, `drama RED: ${JSON.stringify(drama?.evidence)}`).toBe(true);
  });

  it('EDU hızlı pacing davranışı korunur (avg 5s > 4s eşiği → drama RED)', () => {
    const tips = evaluateDirectorCabinet(stateWith('ANIMATION_EDU', [5, 5, 5]));
    const drama = tips.find(t => t.skill === 'drama');
    expect(drama?.success).toBe(false);
  });
});

// ============ FIX-5: staging/shot-pattern register/world gate ============
describe('FIX-5: simetri-kilitli dünya jenerik rising_diagonal ÜRETMEZ', () => {
  it('kubrick_one_point seçiliyken rising_diagonal / negative_space_ma havuzdan düşer', () => {
    const seen = new Set<string>();
    for (let i = 1; i <= 40; i++) seen.add(primeShotPattern(i, `beat ${i}`, 'REAL', ['kubrick_one_point'], undefined, [], 'fincher_precision').id);
    expect([...seen]).not.toContain('rising_diagonal');
    expect([...seen]).not.toContain('negative_space_ma');
    expect([...seen]).toContain('one_point_pull');
  });

  it('kubrick_one_point seçili REAL reçetede sahne-1 "rising diagonal" ÜRETMEZ', () => {
    const { result } = run(REAL_FINCHER);
    expect(result.scenes[0].imagePrompt.toLowerCase()).not.toContain('rising diagonal');
    expect(result.scenes[0].imagePrompt.toLowerCase()).not.toContain('road perspective');
  });
});

// ============ FIX-6: kaynak beat \n normalize + Türkçe beat çiti ============
describe('FIX-6: enjekte edilen beat baş/iç \\n normalize + "do not render" çiti', () => {
  it('image/motion prompt enjekte beat\'te baş \\n yok ve Türkçe beat çit taşır', () => {
    const { result } = run(REAL_FINCHER);
    // sahne 2+ beat'leri leading \n taşır (autoGroupBeats lossless)
    for (const s of result.scenes) {
      // ham \n injection: `Scene brief ...: "\n` görünmemeli
      expect(s.imagePrompt, `Sahne ${s.id} image beat baş \\n sızdırdı`).not.toMatch(/:\s*"\s*\n/);
      expect(s.motionPrompt, `Sahne ${s.id} motion beat ham \\n sızdırdı`).not.toMatch(/beat\s*"\s*\n/);
    }
    expect(result.scenes[0].imagePrompt, 'Türkçe beat çiti yok').toContain('do not render as on-screen text');
  });

  it('command sceneBrief\'inde baş \\n yok ve sourceIntegrity %100 korunur', () => {
    const { beats, brief } = run(REAL_FINCHER);
    const generated = generateBatch(brief);
    const command: any = buildCommandJSON({
      selectedProjectId: 'p', projectTopic: 'x', projectClass: REAL_FINCHER.projectClass, sceneCount: beats.length,
      cast: '', selectedWorldId: REAL_FINCHER.selectedWorldId, selectedPropId: 'native_world',
      selectedRefIds: REAL_FINCHER.selectedRefIds, selectedPaletteId: '', selectedMusicId: '',
      imageModel: 'nano_banana_2', videoModel: 'kling_3', rawSource: REAL_FINCHER.rawSource, sourceBeats: beats,
      scenes: generated.scenes, agentBrief: generated.agentBrief, agentPackets: generated.agentPackets,
      sourceReport: sourceIntegrity(REAL_FINCHER.rawSource, beats),
      personalMode: false,
    } as any);
    for (const sc of command.scenes) {
      expect(/^\s/.test(sc.sceneBrief), `command sceneBrief baş \\n: ${JSON.stringify(sc.sceneBrief.slice(0, 8))}`).toBe(false);
    }
    // integrity: saklanan beat'e dokunulmadı → reconstruct byte-eşit
    const integrity = sourceIntegrity(REAL_FINCHER.rawSource, beats);
    expect(integrity.ok).toBe(true);
  });
});

// ==================================================================================
// ROUND 2
// ==================================================================================

// Cabinet state kur — gerçek generateBatch scenes'i prompt_surgeon'a besle.
// renderLockTextFor state.selectedWorldId/projectClass/selectedPropId okur → reçeteyle eşleşmeli.
function cabinetState(recipe: { projectClass: string; selectedWorldId: string }, result: any) {
  return {
    projectClass: recipe.projectClass,
    selectedWorldId: recipe.selectedWorldId,
    selectedPropId: 'native_world',
    scenes: result.scenes,
    sceneCount: result.scenes.length,
    sourceReport: { coverage: 100 },
  } as any;
}

// ============ FIX-6b: merged çok-cümleli beat özne-eşleşmesi (fixture körlüğü regresyonu) ============
// FIX-6 sceneBrief'i img'de SRC_LINE (\s+→space) ile normalize etti; qa.ts prompt_surgeon özne
// kontrolü karşı tarafı (architecture.exactSourceBeat = HAM \n'li beatText) ham karşılaştırıyordu →
// autoGroupBeats iki cümleyi tek beat'te birleştirince (internal \n) img normalize / subject ham →
// includes=FALSE → "Triad eksik — özne" → surgeon success=false → volition RENDER'ı bloklardı.
// Bu regresyon 566 testte görülmedi (hiçbir fixture merged çok-cümleli beat üretmiyordu).
describe('FIX-6b: merged çok-cümleli beat prompt_surgeon özne-kontrolünü GEÇER (3 register)', () => {
  for (const recipe of [EDU_PIXAR, STY_GHIBLI, REAL_FINCHER]) {
    it(`${recipe.selectedWorldId}: merged beat'te özne bulunur → surgeon success=true`, () => {
      const { result } = run(recipe);
      // Bu reçete gerçekten merged (internal \n'li) bir beat üretmeli — yoksa test
      // regresyonu koruyamaz (fixture körlüğü tam olarak buydu).
      const hasMerged = result.scenes.some((s: any) => /\n/.test((s.architecture?.exactSourceBeat || '').trim()));
      expect(hasMerged, `${recipe.selectedWorldId}: merged çok-cümleli beat üretilmedi — test regresyonu test etmiyor`).toBe(true);

      const tips = evaluateDirectorCabinet(cabinetState(recipe, result));
      const ps = tips.find((t: any) => t.skill === 'prompt_surgeon');
      // Failure marker for the subject check is "Triad eksik — özne"; the success summary
      // legitimately says "triad (özne+ışık+kamera) tam" — filter for the failure only.
      const subjectEvidence = (ps?.evidence || []).filter((e: string) => e.includes('Triad eksik'));
      expect(subjectEvidence, `${recipe.selectedWorldId}: özne-eksik bulgusu var: ${subjectEvidence.join(' | ')}`).toEqual([]);
      expect(ps?.success, `${recipe.selectedWorldId}: surgeon RED: ${(ps?.evidence || []).join(' | ')}`).toBe(true);
    });
  }
});

// ============ FIX-CAM: handheld-yasağı olan world handheld kamera ÜRETMEZ ============
// CAM_REAL[0] = '35mm … handheld micro-drift …' world-kör; fincher render_law
// "locked-off … NEVER handheld" + Negative "NO handheld shake" der ama aynı karede
// Camera/vantage handheld basılırdı. Fix: kamerayı world-yasasına kapıla.
describe('FIX-CAM: handheld-yasaklı world handheld kamerayı locked/dolly alternatifine çevirir', () => {
  const fincher = DATA.worlds.find((w) => w.id === 'fincher_precision')!;

  it('applyWorldCameraLaw fincher REAL: handheld girişi → handheld/micro-drift İÇERMEZ', () => {
    const out = applyWorldCameraLaw(CAM_REAL[0], 1, fincher, 'REAL');
    expect(out.toLowerCase(), `handheld swap başarısız: "${out}"`).not.toContain('handheld');
    expect(out.toLowerCase()).not.toContain('micro-drift');
  });

  it('fincher reçetesinde hiçbir sahne Camera/vantage satırı handheld ÜRETMEZ', () => {
    const { result } = run(REAL_FINCHER);
    for (const s of result.scenes) {
      // Isolate ONLY the camera clause (up to the first period) — the prompt keeps the
      // whole body on one line and the Negative section legitimately says "no handheld shake".
      const camClause = ((s.imagePrompt as string).match(/Camera\/vantage:\s*([^.]*)/i) ?? ['', ''])[1].toLowerCase();
      expect(camClause, `Sahne ${s.id} handheld kamera: "${camClause}"`).not.toMatch(/handheld|micro-drift/);
    }
  });

  it('handheld-serbest world davranışı korunur (chivo_naturalist_handheld handheld girişi DEĞİŞMEZ)', () => {
    const chivo = DATA.worlds.find((w) => w.id === 'chivo_naturalist_handheld')!;
    expect(applyWorldCameraLaw(CAM_REAL[0], 1, chivo, 'REAL')).toBe(CAM_REAL[0]);
  });
});

// ==================================================================================
// FINAL (whole-branch review) — iki Important bulgu: önceki fix'lerin YARIM kalması
// ==================================================================================

// BULGU-1: FIX-3 IP scrub yalnız IP-ÇOĞUNLUK clause'unu düşürüyordu → bir ref-avoid'in
// KARIŞIK (IP+stil) clause'undaki azınlık IP token'ı (Lumon/MDR/severed-floor/monolith/
// hotel-twin-girls) image Negative'e SIZIYORDU — FIX-3'ün kendi "elephant problem"
// gerekçesine ters. Fix: negItemIsIP artık ITEM seviyesinde uygulanır (çoğunluk değil);
// karışık clause'da IP-item düşer, stil/render item TUTULUR.
describe('FINAL BULGU-1: image Negative karışık-clause IP artığı SIZMAZ (item-level scrub)', () => {
  const RESIDUALS = ['Lumon', 'MDR', 'severed-floor', 'monolith', 'hotel-twin-girls'];
  it('REAL fincher+kubrick+severance: her sahne Negative IP-artığı İÇERMEZ + jenerik cümle VAR', () => {
    const { result } = run(REAL_FINCHER);
    for (const s of result.scenes) {
      const neg = negLineOf(s.imagePrompt);
      for (const r of RESIDUALS) {
        expect(neg, `Sahne ${s.id} karışık-clause IP-artığı "${r}" taşıyor`).not.toContain(r);
      }
      expect(neg, `Sahne ${s.id} jenerik IP cümlesi yok`).toContain('no recognizable franchise or real-person characters');
    }
  });

  it('REAL: stil/kamera firewall negatifleri KORUNUR (item-level scrub stil-negatifi düşürmez)', () => {
    const { result } = run(REAL_FINCHER);
    for (const s of result.scenes) {
      const neg = negLineOf(s.imagePrompt).toLowerCase();
      expect(neg, `Sahne ${s.id} warm-cozy grade düştü`).toContain('warm-cozy grade');
      expect(neg, `Sahne ${s.id} handheld shake düştü`).toContain('handheld shake');
      expect(neg, `Sahne ${s.id} teal-orange firewall düştü`).toContain('teal-orange');
      // KRİTİK false-positive guard: "dutch angle" MEŞRU stil-negatifi (kubrick avoid).
      // negItemIsIP büyük-harf Dutch'ı IP proper-noun sanıp DÜŞÜRMEMELİ
      // (STYLE_CAP_WORDS'e 'dutch' eklendi). Bu düşerse false-positive regresyonu var.
      expect(neg, `Sahne ${s.id} "dutch angle" (stil) yanlışlıkla IP sanılıp düştü`).toContain('dutch angle');
    }
  });

  it('brief §3 IP koruması doğru evlerinde — WORLD lock enumerated kalır, REF avoid generic (RL-2)', () => {
    const { result } = run(REAL_FINCHER);
    // RL-2 mimarisi: enumerated IP-adı-blok WORLD negative_lock'un işidir ve brief'te
    // AYNEN korunur (Tyler Durden = fincher world lock'u). REF avoid'ları ise generic
    // canonical blok taşır — enumerated ref-IP'si (eski 'Lumon' severance avoid'ı)
    // artık hiçbir user-facing alanda yaşamaz (pure.test.ts RL-1 genişletme firewall'u).
    expect(result.agentBrief, 'brief world-lock enumerated IP-ismini kaybetti').toContain('Tyler Durden');
    expect(result.agentBrief, 'brief ref canonical generic blok taşımıyor').toContain('NO named franchise characters');
    expect(result.agentBrief, 'temizlenen ref-IP brief\'e geri sızdı').not.toContain('Lumon');
  });
});

// BULGU-2: FIX-5'in daralttığı automotive staging entry hâlâ over-broad `metal.*reflect`
// token'ı taşıyordu; `.*` cümle-boyu span'la luxury_watch_macro + apple_object_worship
// (Product/Macro) ref DNA'sındaki "metal ... reflection" ifadesini eşliyıp siyah-zemin
// saat makrosuna "road perspective" staging enjekte ediyordu. Fix: over-broad token
// KALDIRILDI; entry gerçek speed grammar / road pass / body line / low tracking ile kalır.
describe('FINAL BULGU-2: metal.*reflect artığı Product/Macro staging\'e road perspective ENJEKTE ETMEZ', () => {
  it('luxury_watch_macro + apple_object_worship dnaDirectives.staging road perspective İÇERMEZ', () => {
    const watch = DATA.refs.filter((r) => ['luxury_watch_macro', 'apple_object_worship'].includes(r.id));
    const staging = dnaDirectives(watch, 'REAL').staging.toLowerCase();
    expect(staging, `Product/Macro staging automotive road perspective taşıyor: "${staging}"`).not.toContain('road perspective');
  });

  it('luxury_watch_macro REAL reçetesinde hiçbir sahne "road perspective" ÜRETMEZ', () => {
    const { result } = run(WATCH_MACRO);
    for (const s of result.scenes) {
      expect(s.imagePrompt.toLowerCase(), `Sahne ${s.id} off-register road perspective staging taşıyor`).not.toContain('road perspective');
    }
  });

  it('gerçek automotive speed-grammar DNA hâlâ road-perspective staging alır (entry silinmedi, token daraltıldı)', () => {
    const auto = DATA.refs.find((r) => r.id === 'automotive_commercial')!;
    // Studio reflection-choreography DNA'sını gerçek road/speed grammar'ıyla değiştir:
    // token daraltıldıysa (silinmediyse) bu hâlâ automotive staging'i tetiklemeli.
    const genuine = { ...auto, dna: 'Photoreal automotive frame. Signature: aggressive speed grammar, a low tracking shot along the road pass, a body line pass sweeping the flank.' } as typeof auto;
    const staging = dnaDirectives([genuine], 'REAL').staging.toLowerCase();
    expect(staging, `gerçek automotive speed-grammar road-perspective staging'i KAYBETTİ: "${staging}"`).toContain('road perspective');
  });
});
