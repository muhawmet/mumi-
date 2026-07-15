import { describe, it, expect } from 'vitest';
import { buildImagePrompt, buildMotionPrompt, applyWorldCameraLaw, primePacket, paletteLightPrompt, SHOT_PATTERNS, type Concept } from './brain';
import { DATA, generateBatch, type BriefInput } from './pure';
import { autoGroupBeats } from './source';

/**
 * FAZ2 JÜRİ DALGASI — kod jürisi (wf_c5d2619f) CONFIRMED bulgularının kök-fix testleri.
 * Her test GERÇEK üretim çıktısına (buildImagePrompt / generateBatch / primePacket) bakar,
 * fixture'a değil (CLAUDE.md denetim dersi).
 */

const EMPTY_CONCEPT: Concept = { subject: '', event: '', matched: false };

// buildImagePrompt çıktısından "Negative:" segmentini çıkar.
function negativeLineFor(worldId: string, avoid = ''): string {
  const world = DATA.worlds.find((w) => w.id === worldId);
  if (!world) throw new Error('world not found: ' + worldId);
  const prompt = buildImagePrompt(1, EMPTY_CONCEPT, '50mm', {
    world: world as any,
    register: 'STY' as any,
    dna: { staging: 's', light: 'l', texture: 't', avoid } as any,
    pathForbidden: '',
    sourceBeat: 'x',
  } as any);
  const m = prompt.match(/Negative:.*?(?=Clean motion-ready)/s);
  return m ? m[0].trim() : '';
}

describe('FIX-1 — negItemIsIP: meşru world kompozisyon/grade negatifleri KORUNUR, gerçek IP DÜŞER', () => {
  it('ghibli: Wind/Sky kompozisyon yasaları hayatta kalır, isimli karakter/mekan düşer', () => {
    const neg = negativeLineFor('ghibli_hayao');
    // KORUNMALI — cümle-başı büyük harfli sıradan isim + küçük-harf yönerge = grammar
    expect(neg).toContain('windless static composition');
    expect(neg).toContain('empty flat blue sky');
    // DÜŞMELİ — isimli IP karakter/mekan
    expect(neg).not.toContain('Totoro');
    expect(neg).not.toContain('Chihiro');
    expect(neg).not.toContain('Spirit World');
    // Generic firewall cümlesi eklenmiş olmalı (IP düştüğü için)
    expect(neg).toContain('no recognizable franchise or real-person characters');
  });

  it('noir: "no spot color" tail korunur ama "Sin City" IP düşer', () => {
    const neg = negativeLineFor('noir_high_contrast');
    expect(neg).toContain('spot color');
    expect(neg).toContain('white-on-black inversion');
    expect(neg).not.toContain('Sin City');
  });

  it('sentetik dna.avoid: bilinen IP adları (Tyler Durden, HAL 9000, Radiator Springs, Lumon, MDR) tümü düşer', () => {
    const neg = negativeLineFor(
      'noir_high_contrast',
      'NO Tyler Durden, NO HAL 9000, NO Radiator Springs, NO Lumon logo, NO MDR office'
    );
    expect(neg).not.toContain('Tyler Durden');
    expect(neg).not.toContain('HAL 9000');
    expect(neg).not.toContain('Radiator Springs');
    expect(neg).not.toContain('Lumon');
    expect(neg).not.toContain('MDR');
    expect(neg).toContain('no recognizable franchise or real-person characters');
  });
});

describe('FIX-2 — öksüz IP-enumerasyon fragmanları (techniques / signature moves / original subjects only) düşer', () => {
  const R7 =
    'NO named franchise characters, NO iconic costumes or emblems, NO named powers, techniques, or signature moves, NO recognizable franchise locations; original subjects only.';

  it('ghibli + R7 ref avoid: IP düşünce virgül-devamı fragmanları da düşer, motora çöp gitmez', () => {
    const neg = negativeLineFor('ghibli_hayao', R7);
    expect(neg).not.toContain('techniques');
    expect(neg).not.toContain('signature moves');
    expect(neg).not.toContain('original subjects only');
    // meşru ghibli kompozisyon yasaları hâlâ hayatta (aynı çağrıda)
    expect(neg).toContain('windless static composition');
  });
});

describe('FIX-3 — kırık jargon "ma" token gloss ile açıldı', () => {
  it('negative_space_ma pattern bare "Composition pattern: ma —" ile BAŞLAMAZ', () => {
    const ma = SHOT_PATTERNS.find((p) => p.id === 'negative_space_ma');
    expect(ma).toBeTruthy();
    expect(ma!.line.startsWith('Composition pattern: ma —')).toBe(false);
    expect(ma!.line).toContain('negative-space');
    expect(ma!.line).toContain('(ma)');
  });
});

// Gerçek generateBatch girdisi (FIX-4 + FIX-5 için).
function realBatch() {
  const RAW = [
    'Güneş, denizin yüzeyini ısıtır ve su buharlaşarak gökyüzüne yükselir.',
    'Yükselen buhar soğuk havayla karşılaşınca minik damlacıklara dönüşür.',
    'Bulutlar ağırlaşınca damlalar yağmur olarak toprağa düşer.',
  ].join('\n');
  const beats = autoGroupBeats(RAW, 'Dengeli', 'kling_3');
  const brief: BriefInput = {
    projectTopic: 'Su Döngüsü',
    projectClass: 'ANIMATION_EDU',
    sceneCount: beats.length,
    cast: '',
    selectedWorldId: 'pixar_3d_edu',
    selectedPropId: 'native_world',
    selectedRefIds: ['pixar_dimensional', 'pixar_emotional_staging'],
    selectedPaletteId: '',
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
    rawSource: RAW,
    sourceBeats: beats,
  };
  const result = generateBatch(brief);
  if (result.status !== 'GENERATED') throw new Error('not generated');
  if (!result.agentPackets) throw new Error('no agentPackets');
  return { scenes: result.scenes, agentPackets: result.agentPackets };
}

describe('FIX-4 — sahne intensity tam sayı (ham float sızıntısı yok)', () => {
  it('her sahnenin intensity değeri tam sayıdır', () => {
    const result = realBatch();
    for (const s of result.scenes) {
      expect(Number.isInteger(s.intensity)).toBe(true);
    }
  });
});

describe('FIX-5 — ölü concept.event/subject artığı: boş EVENT/CONCEPT satırı basılmaz', () => {
  it('motion paketinde boş "EVENT:" satırı YOK', () => {
    const result = realBatch();
    const motion = result.agentPackets.motion;
    // Boş etiket satırı (EVENT: <boş>) olmamalı
    expect(motion.split('\n').some((l) => /^EVENT:\s*$/.test(l))).toBe(false);
    // Ölü EVENT satırına atıf yapan direktif de kalmamalı
    expect(motion).not.toContain('dossier EVENT line');
  });

  it('suno paketinde boş "CONCEPT:" etiketi YOK', () => {
    const result = realBatch();
    const suno = result.agentPackets.suno;
    expect(/CONCEPT:\s+~/.test(suno)).toBe(false);
  });
});

describe('FIX-6 (R3) — pixar_3d_edu palet: shadow cool-violet, burnt-orange×3 çöküşü kırık', () => {
  it('shadow cool okur, tek-hue oneFamily sıkışması YOK, bias cool-violet vaadiyle uyumlu', () => {
    const edu = DATA.worlds.find((w) => w.id === 'pixar_3d_edu');
    if (!edu) throw new Error('pixar_3d_edu not found');
    const out = paletteLightPrompt(undefined, edu as any);
    // shadow artık cool okumalı (bias 'complementary cool-violet bounce in shadow' vaat ediyor)
    expect(out).toMatch(/shadows read as [^,]*\b(cool|indigo|violet)\b/i);
    // shadow burnt-orange OLMAMALI — çöküş kırıldı, su/serin konusuna fiziksel yalan bitti
    expect(out).not.toMatch(/shadows read as [^,]*burnt orange/i);
    // oneFamily 'a single …-keyed … family' mono-sıkışması OLMAMALI
    expect(out).not.toContain('a single');
  });
});

// ==================================================================================
// FAZ2 JÜRİ DALGASI — CLUSTER A (R4/R5/R9/R11): otorite-kapılama & register-fit.
// Jenerik ref-DNA/palet direktifi WORLD YASASINI ve REGISTER GERÇEĞİNİ ezmemeli.
// Her test GERÇEK generateBatch image prompt çıktısına bakar (fixture değil).
// ==================================================================================

interface JuryRecipe {
  topic: string; projectClass: string; worldId: string; propId: string;
  refIds: string[]; paletteId: string; cast?: string; raw: string;
}
const JURY: Record<string, JuryRecipe> = {
  one_piece: {
    topic: 'Kayıp ada', projectClass: 'STYLIZED_PREMIUM', worldId: 'one_piece_toei', propId: 'none',
    refIds: ['one_piece_sunny_adventure', 'onepiece_grandline_scale'], paletteId: '',
    raw: 'Fırtınalı bir denizde küçük bir yelkenli devasa dalgalar arasında savrulur. Güvertede genç bir maceracı haritayı korur. Bir şimşek çakar. Maceracı dümene atılır.',
  },
  jjk: {
    topic: 'Lanet', projectClass: 'STYLIZED_PREMIUM', worldId: 'jjk_mappa', propId: 'none',
    refIds: ['jujutsu_dark_ritual'], paletteId: '',
    raw: 'Gece yarısı metro geçidinde lanetli enerji sise dönüşür. Büyücü avucunda enerji toplar. Karanlık lanet öne hamle yapar. Büyücü laneti dağıtır.',
  },
  edu: {
    topic: 'Su Döngüsü', projectClass: 'ANIMATION_EDU', worldId: 'pixar_3d_edu', propId: 'native_world',
    refIds: ['pixar_dimensional', 'pixar_emotional_staging'], paletteId: '',
    raw: 'Güneş okyanustaki suyu ısıtır ve su buharlaşır. Yükselen buhar bulutları oluşturur. Bulut doyunca yağmur düşer. Su okyanusa akar.',
  },
  spiderverse: {
    topic: 'Sıçrayış', projectClass: 'STYLIZED_PREMIUM', worldId: 'spiderverse_sony', propId: 'none',
    refIds: ['spiderverse_graphic'], paletteId: '',
    raw: 'Gökdelenler arasında figür çatı kenarında durur. Nefes alır. İp fırlatır ve yay çizer. Cama tutunur.',
  },
  watch: {
    topic: 'Saat lansmanı', projectClass: 'ULTRAREAL_COMMERCIAL', worldId: 'fincher_precision', propId: 'native_world',
    refIds: ['kubrick_one_point', 'severance_corporate_dread', 'luxury_watch_macro'], paletteId: 'desaturated_cinematic',
    raw: 'Karanlık stüdyoda ışık huzmesi çelik saat kasasında gezinir. Saniye ibresi ilerler. Kamera çarklara yaklaşır. Saat kadife zemine yerleşir.',
  },
  auto: {
    topic: 'Otomobil çöl', projectClass: 'AUTOMOTIVE_MOBILITY', worldId: 'deakins_naturalist', propId: 'native_world',
    refIds: ['automotive_commercial', 'breaking_bad_desert_pov', 'setup_goldenhour_auto'], paletteId: 'golden_dust_epic',
    raw: 'Şafak vakti çöl yolunda ısı dalgaları titreşir. Ufukta otomobil belirir. Kamera gövde hattı boyunca kayar. Otomobil tozu geride bırakır.',
  },
};

function juryScene1(key: keyof typeof JURY, castOverride?: string): string {
  const r = JURY[key];
  const beats = autoGroupBeats(r.raw, 'Dengeli', 'kling_3');
  const brief: BriefInput = {
    rawSource: r.raw, sourceBeats: beats, projectTopic: r.topic, projectClass: r.projectClass,
    sceneCount: beats.length, cast: castOverride ?? (r.cast || ''), selectedWorldId: r.worldId,
    selectedPropId: r.propId, selectedRefIds: r.refIds, selectedPaletteId: r.paletteId,
    selectedMusicId: '', imageModel: 'nano_banana_2', videoModel: 'kling_3',
  };
  const res = generateBatch(brief);
  if (res.status !== 'GENERATED') throw new Error('not generated: ' + key);
  return res.scenes[0].imagePrompt;
}
// Yalnız "Light:" satırını çıkar (renderLock Light law satırını sayma).
function lightLineOf(img: string): string {
  const m = img.match(/(?:^|\s)Light:\s.*?(?=\sTexture rule:)/s);
  return m ? m[0].trim() : '';
}

describe('R4 — World light_law > jenerik DNA "warm motivated key (window/lamp/low-sun)"', () => {
  it('one_piece: jenerik window/lamp key BASTIRILIR, world "sky primary" light law kazanır', () => {
    const img = juryScene1('one_piece');
    const light = lightLineOf(img);
    // Jenerik iç-mekan key direktifi Light satırından çıkmalı (world sky-primary ezmesin)
    expect(light).not.toMatch(/window,\s*lamp,\s*low sun/i);
    expect(light).not.toMatch(/motivated key with a named source/i);
    // World light_law (renderLock içinde) hâlâ mevcut — sky primary kazanır
    expect(img).toMatch(/sky is the primary light source/i);
  });
  it('jjk: key-absent/rim-dominant world jenerik warm-key direktifini ezer', () => {
    const img = juryScene1('jjk');
    const light = lightLineOf(img);
    expect(light).not.toMatch(/window,\s*lamp,\s*low sun/i);
    expect(light).not.toMatch(/motivated key with a named source/i);
    expect(img).toMatch(/key light is (?:often|frequently) absent|rim-dominant/i);
  });
  it('edu: world light_law jenerikle UYUMLU (window/lamp) — R4 gereksiz yere ATEŞLEMEZ', () => {
    // pixar edu light_law kendisi "window sun, desk lamp" der → çelişki yok, jenerik korunur
    const img = juryScene1('edu');
    expect(lightLineOf(img)).toMatch(/window,\s*lamp,\s*low sun/i);
  });
});

describe('R5 — Cast-gate: no-cast (product/EDU-abstract) sahnede insan-yüzü grameri BASILMAZ', () => {
  it('watch (castless macro): skin/pore/face/beard grameri image promptta GEÇMEZ', () => {
    const img = juryScene1('watch');
    expect(img).not.toMatch(/\bskin\b/i);
    expect(img).not.toMatch(/\bpore\b/i);
    expect(img).not.toMatch(/\bthe face\b/i);
    expect(img).not.toMatch(/\bbeard\b/i);
  });
  it('auto (castless araç): skin/pore/beard grameri GEÇMEZ', () => {
    const img = juryScene1('auto');
    expect(img).not.toMatch(/\bskin\b/i);
    expect(img).not.toMatch(/\bpore\b/i);
    expect(img).not.toMatch(/\bbeard\b/i);
  });
  it('edu (castless su döngüsü): "SSS dominant on skin"/pore/beard GEÇMEZ', () => {
    const img = juryScene1('edu');
    expect(img).not.toMatch(/on skin/i);
    expect(img).not.toMatch(/\bbeard\b/i);
    expect(img).not.toMatch(/\bthe face\b/i);
  });
  it('edu CAST VARSA insan-yüzü grameri KORUNUR (eski davranış)', () => {
    const img = juryScene1('edu', 'Aylin — meraklı bir çocuk, sıcak gülümseme');
    expect(img).toMatch(/on skin/i);
    expect(img).toMatch(/\bskin\b/i);
  });
});

describe('R9 — Palet negatifi vs render_law grade: World/Render Lock > Palette', () => {
  it('auto/deakins: "cool shadows" (render_law) ile "NO cool interruption" (palet) AYNI ANDA bulunmaz', () => {
    const img = juryScene1('auto');
    // render_law grade imzası mevcut (world kazanır)
    expect(img).toMatch(/cool shadows/i);
    // çelişen palet mutlağı bastırıldı
    expect(img).not.toMatch(/cool interruption/i);
    // paletin çelişmeyen negatifleri korunur
    expect(img).toMatch(/NO shadow lift/i);
    expect(img).toMatch(/NO teal wash/i);
  });
});

describe('R11 — Zamansal/animasyon dili STILL image promptta olmaz (motion\'a ait)', () => {
  it('spiderverse: 12fps/24fps/dual-cadence/rate-clash image promptta GEÇMEZ', () => {
    const img = juryScene1('spiderverse');
    expect(img).not.toMatch(/12fps/i);
    expect(img).not.toMatch(/24fps/i);
    expect(img).not.toMatch(/dual-cadence/i);
    expect(img).not.toMatch(/rate-clash/i);
  });
  it('jjk: "frames dissolve"/"ink-smear" still image promptta GEÇMEZ', () => {
    const img = juryScene1('jjk');
    expect(img).not.toMatch(/frames dissolve/i);
    expect(img).not.toMatch(/ink-smear/i);
  });
});

// ==================================================================================
// FAZ2 JÜRİ DALGASI — CLUSTER D (R6): kamera/beat uyumu.
// Dünya-kör vantage havuzu bir beat'e (a) dünyanın KENDİ kamera-negatifini ihlal eden,
// (b) beat ölçeğiyle çelişen, veya (c) frame'in taşıyamayacağı bir kloz basan kamera
// verebiliyor. GERÇEK çıktı + doğrudan applyWorldCameraLaw birimi ile test edilir.
// ==================================================================================
function worldById(id: string) {
  const w = DATA.worlds.find((x) => x.id === id);
  if (!w) throw new Error('world not found: ' + id);
  return w as any;
}
// Image promptun "Camera/vantage:" cümlesini çıkar (Negative satırını sayma).
function cameraLineOf(img: string): string {
  const m = img.match(/Camera\/vantage:.*?(?=\sComposition pattern:|\sCamera energy:|\sPOV rule:|\sLight:)/s);
  return m ? m[0].trim() : '';
}

describe('R6 — kamera dünya kendi kamera-negatifini ihlal etmez (rack focus)', () => {
  const RACK = '85mm rack focus from foreground detail to the subject, both already in frame';
  it('fincher_precision "NO rack focus pull" → rack-focus kamerası bastırılır', () => {
    const out = applyWorldCameraLaw(RACK, 1, worldById('fincher_precision'), 'REAL');
    expect(out).not.toMatch(/rack[- ]?focus/i);
  });
  it('rack-focus yasağı OLMAYAN dünya (deakins) rack-focus kamerasını KORUR', () => {
    const out = applyWorldCameraLaw(RACK, 1, worldById('deakins_naturalist'), 'REAL');
    expect(out).toMatch(/rack[- ]?focus/i);
  });
  it('watch batch: HİÇBİR sahnenin Camera/vantage satırı rack-focus taşımaz', () => {
    const r = JURY.watch;
    const beats = autoGroupBeats(r.raw, 'Dengeli', 'kling_3');
    const res = generateBatch({
      rawSource: r.raw, sourceBeats: beats, projectTopic: r.topic, projectClass: r.projectClass,
      sceneCount: beats.length, cast: '', selectedWorldId: r.worldId, selectedPropId: r.propId,
      selectedRefIds: r.refIds, selectedPaletteId: r.paletteId, selectedMusicId: '',
      imageModel: 'nano_banana_2', videoModel: 'kling_3',
    } as BriefInput);
    if (res.status !== 'GENERATED') throw new Error('not generated');
    for (const s of res.scenes) {
      expect(cameraLineOf(s.imagePrompt)).not.toMatch(/rack[- ]?focus/i);
    }
  });
});

describe('R6 — kamera beat ölçeğine saygılı (geniş vista → wide, macro DEĞİL)', () => {
  const MACRO = '100mm macro slide along the surface, geometry and logo plane locked';
  const VISTA_BEAT = 'Şafak vakti uçsuz çöl yolunda ısı dalgaları titreşir, ufukta otomobil belirir.';
  it('geniş-vista beat + macro kamera → macro bastırılır, wide vantage gelir', () => {
    const out = applyWorldCameraLaw(MACRO, 1, worldById('deakins_naturalist'), 'REAL', VISTA_BEAT);
    expect(out).not.toMatch(/\bmacro\b/i);
    expect(out).not.toMatch(/logo plane locked/i);
    expect(out).toMatch(/wide|vista|establish|horizon/i);
  });
  it('makro-detay beat (vista değil) macro kamerayı KORUR', () => {
    const MACRO_BEAT = 'Çelik saat kasasının dişli çarkları yakın makro detayda döner.';
    const out = applyWorldCameraLaw(MACRO, 1, worldById('fincher_precision'), 'REAL', MACRO_BEAT);
    expect(out).toMatch(/\bmacro\b/i);
  });
});

describe('R6 — "logo plane locked" klozu logo/marka yokken basılmaz', () => {
  const MACRO = '100mm macro slide along the surface, geometry and logo plane locked';
  it('logo/marka içermeyen beat: "logo plane locked" düşer, geometry kilidi kalır', () => {
    const out = applyWorldCameraLaw(MACRO, 1, worldById('fincher_precision'), 'REAL', 'Çelik kasanın dişlileri döner.');
    expect(out).not.toMatch(/logo plane locked/i);
    expect(out).toMatch(/geometry/i);
  });
  it('logo/marka içeren beat: "logo plane locked" KORUNUR', () => {
    const out = applyWorldCameraLaw(MACRO, 1, worldById('fincher_precision'), 'REAL', 'Kadranda marka logosu netleşir.');
    expect(out).toMatch(/logo plane locked/i);
  });
});

// ==================================================================================
// FAZ2 JÜRİ DALGASI — CLUSTER E (R1/R10/R17/R2): motora giden nihai prompt hijyeni.
// FAZ2 ÇEKİRDEK KISITI: özne UYDURULMAZ — bunlar SUNUM (presentation) fix'leri.
// Doğrudan buildImagePrompt/buildMotionPrompt birimiyle (deterministik) test edilir.
// ==================================================================================
const DNA_STUB = { staging: 's', light: 'l', texture: 't', avoid: '', motion: 'm', color: 'c', camera: 'c', line: 'l', lens: 'l' } as any;
function imgFor(sourceBeat: string, worldId = 'fincher_precision', register: any = 'REAL'): string {
  return buildImagePrompt(1, EMPTY_CONCEPT, '50mm', {
    world: worldById(worldId), register, dna: DNA_STUB, pathForbidden: '', sourceBeat,
  } as any);
}
function motionFor(sourceBeat: string): string {
  return buildMotionPrompt(1, EMPTY_CONCEPT, '50mm', DNA_STUB, 5, 'kling_3', null, sourceBeat);
}

describe('R1 — motora giden prompt "SEN yaz" ham Türkçe imperatifi taşımaz (Claude-facing komisyon)', () => {
  const BEAT = 'Karanlık stüdyoda ışık huzmesi çelik saat kasasında gezinir.';
  it('image: ham "SEN yaz" / "buradan üret" motor-içeriği gibi GEÇMEZ', () => {
    const img = imgFor(BEAT);
    expect(img).not.toMatch(/SEN yaz/i);
    expect(img).not.toMatch(/buradan üret/i);
  });
  it('image: kaynak beat KORUNUR + komisyon açık-işaretli Claude-facing director task', () => {
    const img = imgFor(BEAT);
    expect(img).toContain(BEAT);                       // kaynak beat aynen korunur
    expect(img).toMatch(/DIRECTOR TASK/);              // açık işaretli komisyon
    expect(img).toMatch(/do not print/i);              // frame'e basılmayacağı açık
  });
  it('motion: ham "SEN yaz" GEÇMEZ, kaynak beat korunur, director task açık-işaretli', () => {
    const mo = motionFor(BEAT);
    expect(mo).not.toMatch(/SEN yaz/i);
    expect(mo).toContain(BEAT);
    expect(mo).toMatch(/DIRECTOR TASK/);
    expect(mo).toMatch(/do not print/i);
    // in-frame yasa korunur (yeni nesne/sahne gelmez)
    expect(mo).toMatch(/no new (?:object|scenery)|new object/i);
  });
});

describe('R10 — fiktif-marka izni: beat logo/marka reveal isterse açık izin klozu', () => {
  it('logo/marka içeren beat → "fictional brand" izin klozu eklenir', () => {
    const img = imgFor('Kadranda marka logosu netleşir.');
    expect(img).toMatch(/fictional brand/i);
    expect(img).toMatch(/no real brand/i);
  });
  it('logo/marka içermeyen beat → fiktif-marka klozu YOK', () => {
    const img = imgFor('Işık huzmesi çelik kasada gezinir.');
    expect(img).not.toMatch(/invent a single copyright-safe fictional brand/i);
  });
});

describe('R17 — exit-frame ↔ I2V "no leaving the frame" uzlaşısı', () => {
  it('kadraj-terk ima eden beat → motion peak-freeze/in-frame talimatı taşır', () => {
    const mo = motionFor('Otomobil geniş yay çizerek savrulur ve kadrajın önünden geçer.');
    // uzlaşı talimatı: aksiyon-tepesinde dondur / kadrajda tut
    expect(mo).toMatch(/peak|freeze|in-frame|within the frame|stays in frame/i);
    // I2V yasağıyla çelişmez — "leaving the frame" negatifi hâlâ var
    expect(mo).toMatch(/leaving the frame/i);
  });
  it('exit ima ETMEYEN beat → ekstra exit-uzlaşı klozu basılmaz', () => {
    const mo = motionFor('Saniye ibresi yavaşça ilerler.');
    expect(mo).not.toMatch(/Exit reconciliation/i);
  });
});

describe('R2 — frame-spesifik motion negatifi (template olarak işaretli, best-effort)', () => {
  it('motion negatifi frame başına özelleştirilecek TEMPLATE olarak işaretlenir', () => {
    const mo = motionFor('Işık huzmesi kasada gezinir.');
    expect(mo).toMatch(/frame-specific|specialize this negative|this frame/i);
  });
});

// R9c — AYNI OTORİTE KAVGASI, SICAK EKSENDE. R9 soğuk-gölge ve teal-orange
// eksenlerini uzlaştırıyordu ama SICAK-HIGHLIGHT eksenini kapsamıyordu:
// deakins_naturalist'in grade yasası "warm highlights, cool shadows" derken
// cool_scientific paleti "NO warm element" diye BATTANİYE yasak koyuyordu.
// Aynı prompt'ta iki zıt emir → motor hangisine uyacağını rastgele seçer
// (ya Deakins'in sıcak practical kimliği ölür, ya palet yasağı çiğnenir).
// World/Render Lock > Palette: dünyanın ışık yasası kazanır, paletin battaniye
// yasağı KAPSAMLANIR (paletin niyeti — serin kalmak — yaşamaya devam eder).
describe('R9c — Palet "NO warm" mutlağı vs render_law "warm highlights"', () => {
  it('deakins + cool_scientific: "warm highlights" ile battaniye "NO warm element" AYNI ANDA bulunmaz', () => {
    const raw = 'Laboratuvarda numune incelenir.';
    const beats = autoGroupBeats(raw, 'Dengeli', 'kling_3');
    const r = generateBatch({
      rawSource: raw,
      sourceBeats: beats,
      projectTopic: 'Lab',
      projectClass: 'ULTRAREAL_COMMERCIAL',
      sceneCount: 1,
      cast: '',
      selectedWorldId: 'deakins_naturalist',
      selectedPropId: 'native_world',
      selectedRefIds: [],
      selectedPaletteId: 'cool_scientific',
      selectedMusicId: '',
      imageModel: 'nano_banana_2',
      videoModel: 'kling_3',
    });
    if (r.status !== 'GENERATED') throw new Error('not generated: ' + r.status);
    const img = r.scenes[0].imagePrompt;

    // Dünyanın grade imzası mevcut (world kazanır)
    expect(img).toMatch(/warm highlights/i);
    // Çelişen BATTANİYE palet yasağı bastırıldı
    expect(img).not.toMatch(/NO warm element/i);
    // Paletin çelişmeyen niyeti korunur — sahne hâlâ serin okunur
    expect(img).toMatch(/cool blue|cool teal/i);
  });
});
