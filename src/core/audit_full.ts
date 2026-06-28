/**
 * MAMILAS Full Brief Audit — "hepsini logla"
 * Tests every production path × ref combination × palette × world
 * and logs exactly how each selection enters the final brief.
 *
 * Run: npx tsx src/core/audit_full.ts
 */
import { DATA } from './pure';
import {
  buildAgentBrief, dnaDirectives, registerOf, primeConcept,
  primeCamera, estimateSec, primeSuno, renderLock, paletteLight, recommendReason,
} from './brain';
import type { SurgeryRef, SurgeryWorld, SurgeryPalette } from './pure';
import type { Register } from './brain';

// ── helpers ──────────────────────────────────────────────────────────────────

function getWorld(id: string): SurgeryWorld {
  const w = DATA.worlds.find(w => w.id === id);
  if (!w) throw new Error(`World not found: ${id}`);
  return w;
}
function getRefs(ids: string[]): SurgeryRef[] {
  return ids.map(id => {
    const r = DATA.refs.find(r => r.id === id);
    if (!r) throw new Error(`Ref not found: ${id}`);
    return r;
  });
}
function getPalette(id: string): SurgeryPalette | undefined {
  return DATA.palettes.find(p => p.id === id);
}

interface SceneResult {
  id: number;
  source: string;
  matched: boolean;
  subject: string;
  event: string;
  camera: string;
}

interface AuditEntry {
  path: string;
  pathNote: string;
  worldId: string;
  worldName: string;
  register: Register;
  refIds: string[];
  refNames: string;
  paletteId: string;
  paletteName: string;
  // DNA fields
  dnaCamera: string;
  dnaLight: string;
  dnaStaging: string;
  dnaMotion: string;
  dnaTexture: string;
  dnaAvoid: string;
  dnaIsPathNative: boolean;
  // render lock
  renderLockText: string;
  // palette light
  paletteLightText: string;
  // suno
  sunoBrief: string;
  sunoIsGeneric: boolean;
  // concepts
  scenes: SceneResult[];
  matchedCount: number;
  totalScenes: number;
  matchRate: string;
  // recommendReason samples
  recommendReasons: string[];
  // issues
  issues: string[];
  // brief sections existence
  hasModelEra: boolean;
  hasI2vLaw: boolean;
  hasAuthorityChain: boolean;
}

function isPathNativeDNA(camera: string, light: string): boolean {
  return camera === 'restrained filmic moves, geometry-respecting' &&
         light === 'one motivated key with a named source';
}

function isSunoGeneric(brief: string): boolean {
  return brief.startsWith('Narration-safe instrumental bed, 78-90 BPM');
}

// ── per-path test matrix ──────────────────────────────────────────────────────

interface PathFixture {
  pathId: string;
  note: string;
  worldId: string;
  refIds: string[];
  paletteId: string;
  sources: string[];
}

const FIXTURES: PathFixture[] = [
  // ── REAL PATHS ─────────────────────────────────────────────────────────────
  {
    pathId: 'FOOD_MACRO',
    note: 'coffee commercial — full emotional arc',
    worldId: 'food_macro_real',
    refIds: ['food_macro', 'malick_golden_poetry'],
    paletteId: 'food_amber_macro',
    sources: [
      'Türk kahvesi, sabahın ilk ışığıyla buluşuyor.',
      'Bakır cezve masanın üzerinde, köpük oluşuyor.',
      'İlk yudumda gözler kapanıyor.',
      'Bir gelenek, bir an, bir his.',
    ],
  },
  {
    pathId: 'FOOD_MACRO',
    note: 'chocolate dessert — texture + pour variant',
    worldId: 'food_macro_real',
    refIds: ['food_macro', 'cinedna_macro'],
    paletteId: 'rembrandt_amber',
    sources: [
      'Sıcak çikolata kaseden dökülüyor.',
      'Her kaşıkta kadife doku hissedilir.',
      'Servis anı: şeker tozu yağıyor.',
    ],
  },
  {
    pathId: 'PRODUCT_HERO',
    note: 'skincare hero product — precision macro',
    worldId: 'product_macro_tabletop',
    refIds: ['product_macro', 'apple_commercial'],
    paletteId: 'commercial_neutral',
    sources: [
      'Ürün tabağın üzerinde, temiz beyaz zeminde.',
      'Damla yüzeye değiyor, dalgacık yayılıyor.',
      'Şişenin geometrisi ve logo tam görünüyor.',
    ],
  },
  {
    pathId: 'PRODUCT_HERO',
    note: 'tech product hands reveal',
    worldId: 'commercial_studio',
    refIds: ['apple_commercial', 'cinedna_naturalkey'],
    paletteId: 'warm_commercial_gold',
    sources: [
      'El cihazı kaldırıyor, ışık yansımasıyla.',
      'Ekran açılıyor, arayüz beliriyor.',
    ],
  },
  {
    pathId: 'ULTRAREAL_COMMERCIAL',
    note: 'brand campaign — nolan × nike energy',
    worldId: 'cinematic_real',
    refIds: ['nolan_imax_practical', 'nike_energy'],
    paletteId: 'luxury_black_gold',
    sources: [
      'Marka logosu dev ekranda parlıyor.',
      'Atlet son koşuyu tamamlıyor.',
      'Kazanma anı — bir duruş, bir soluk.',
    ],
  },
  {
    pathId: 'HUMAN_TESTIMONIAL',
    note: 'patient testimonial — intimate Rembrandt',
    worldId: 'real_human_doc',
    refIds: ['rembrandt_portrait', 'cinedna_availlight'],
    paletteId: 'skin_realism',
    sources: [
      'Hasta kamerayı bakışlarıyla buluyor.',
      'Tedavi sürecini anlatıyor, sessizce.',
      'Umut, yüzündeki ışıkta görünüyor.',
    ],
  },
  {
    pathId: 'HUMAN_TESTIMONIAL',
    note: 'testimonial — civic documentary',
    worldId: 'human_portrait_real',
    refIds: ['civic_doc', 'rembrandt_portrait'],
    paletteId: 'muted_documentary',
    sources: [
      'Vatandaş deneyimini paylaşıyor.',
      'Mahallesi için söz alıyor.',
    ],
  },
  {
    pathId: 'DOCUMENTARY_REALISM',
    note: 'urban documentary — street vérité',
    worldId: 'documentary_civic',
    refIds: ['street_doc', 'cinedna_availlight'],
    paletteId: 'muted_documentary',
    sources: [
      'Şehrin sabahı, işçiler sokaklarda.',
      'Pazar tezgahı kurulurken gün başlıyor.',
      'Bir çocuk okulun önünde duraksıyor.',
    ],
  },
  {
    pathId: 'FASHION_EDITORIAL',
    note: 'fashion campaign — vogue editorial light',
    worldId: 'luxury_editorial',
    refIds: ['vogue_editorial', 'chanel_bw_luxury'],
    paletteId: 'editorial_monochrome',
    sources: [
      'Model sahneye giriyor, ışık yüzüne düşüyor.',
      'Koleksiyon bir ayna karşısında sergileniyor.',
      'Son kare: sessizlik, giysi, bakış.',
    ],
  },
  {
    pathId: 'FASHION_EDITORIAL',
    note: 'fashion — colour editorial',
    worldId: 'luxury_editorial',
    refIds: ['vogue_editorial', 'cinedna_backlit'],
    paletteId: 'luxury_black_gold',
    sources: [
      'Elbise rüzgarla hareket ediyor.',
      'Aksesuarın detayı yakın çekimde.',
    ],
  },
  {
    pathId: 'ARCHITECTURE_REAL_ESTATE',
    note: 'luxury interior — daylight deep-focus',
    worldId: 'architecture_real',
    refIds: ['architectural_digest', 'cinedna_deepfocus'],
    paletteId: 'architecture_daylight',
    sources: [
      'Salon sabah ışığıyla dolup taşıyor.',
      'Mermer yüzey mükemmel bir görüntü sunuyor.',
      'Kapı açılıyor, perspektif genişliyor.',
    ],
  },
  {
    pathId: 'TECH_MEDICAL_PRECISION',
    note: 'medical device — clinical precision',
    worldId: 'tech_clinical_real',
    refIds: ['tech_glass', 'cinedna_symmetry'],
    paletteId: 'clinical_blue',
    sources: [
      'Cihaz steril ortamda açılıyor.',
      'Ekran veriler gösteriyor, hassas hatlar.',
      'Doktorun eli güvenle tutyor.',
    ],
  },
  {
    pathId: 'SOCIAL_REELS_REALISM',
    note: 'social content — handheld reels',
    worldId: 'social_reels_real',
    refIds: ['street_doc', 'cinedna_handheld'],
    paletteId: 'vibrant_clean_education',
    sources: [
      'Arkadaşlar güneşli bir günde buluşuyor.',
      'Kafe masasında anların tadı çıkarılıyor.',
    ],
  },
  {
    pathId: 'AUTOMOTIVE_MOBILITY',
    note: 'luxury car — night precision stage',
    worldId: 'automotive_stage_real',
    refIds: ['automotive_commercial', 'mercedes_silver_precision'],
    paletteId: 'automotive_night',
    sources: [
      'Araba sahnede, karanlıkta parıldıyor.',
      'Direksiyon ellerin arasında, yol görünüyor.',
      'Işık şeridi karoserin üzerinden geçiyor.',
    ],
  },
  {
    pathId: 'TOURISM_DESTINATION',
    note: 'destination — golden hour wandering',
    worldId: 'tourism_destination_real',
    refIds: ['destination_doc', 'malick_golden_poetry'],
    paletteId: 'ghibli_meadow',
    sources: [
      'Gün batımında sahil boyunca yürünüyor.',
      'Eski şehrin taş sokakları keşfediliyor.',
      'Yeni manzaralar gözlemleniyor.',
    ],
  },
  {
    pathId: 'TOURISM_DESTINATION',
    note: 'tourism — Spielberg backlight wonder variant',
    worldId: 'photoreal_location',
    refIds: ['spielberg_backlight_wonder', 'destination_doc'],
    paletteId: 'warm_commercial_gold',
    sources: [
      'Ufukta yeni topraklar görünür, gemi yelken açar.',
      'Yolcu ilk kez manzarayla yüzleşiyor.',
    ],
  },
  {
    pathId: 'HEALTH_PUBLIC_SERVICE',
    note: 'healthcare public service — consent + care team',
    worldId: 'healthcare_public_real',
    refIds: ['civic_doc', 'rembrandt_portrait'],
    paletteId: 'clinical_blue',
    sources: [
      'Hasta onam formunu imzalıyor.',
      'Doktor raporu inceliyor, ekip hazır.',
      'Bakım ekibi güvenli ortamda çalışıyor.',
    ],
  },
  {
    pathId: 'LIVE_ACTION_CORPORATE',
    note: 'corporate brand — fog monolith gravitas',
    worldId: 'cinematic_real',
    refIds: ['villeneuve_fog_monolith', 'cinedna_deepfocus'],
    paletteId: 'muted_documentary',
    sources: [
      'Şirket binası sisle çevrili, erken sabah.',
      'Yönetim masasında önemli kararlar alınıyor.',
    ],
  },
  // ── EDU PATH ───────────────────────────────────────────────────────────────
  {
    pathId: 'ANIMATION_EDU',
    note: 'water cycle — clay world, Pixar + Kurzgesagt',
    worldId: 'clay',
    refIds: ['pixar_dimensional', 'kurzgesagt_clarity'],
    paletteId: 'vibrant_clean_education',
    sources: [
      'Güneş suyu ısıtır ve su buharlaşıp yükselir.',
      'Bulutlar oluşur, yağmur düşer.',
      'Nehirler denize ulaşır, döngü tamamlanır.',
    ],
  },
  {
    pathId: 'ANIMATION_EDU',
    note: 'civic decision — paper world, Kurzgesagt',
    worldId: 'paper',
    refIds: ['kurzgesagt_clarity', 'pixar_dimensional'],
    paletteId: 'civic_morning',
    sources: [
      'Şehirdeki bir kararı kim alıyor?',
      'Vatandaş önerisini dilekçeye çeviriyor.',
      'Belediye meclisi park kararını tartışıyor.',
    ],
  },
  {
    pathId: 'ANIMATION_EDU',
    note: 'digital literacy — stopmotion world',
    worldId: 'stopmotion',
    refIds: ['kurzgesagt_clarity'],
    paletteId: 'pastel_soft',
    sources: [
      'İnternette gördüğümüz her bilgi doğru olmayabilir.',
      'Reklam ile bilgi birbirinden ayrılmalıdır.',
    ],
  },
  // ── STY PATH ───────────────────────────────────────────────────────────────
  {
    pathId: 'STYLIZED_PREMIUM',
    note: 'arcane texture — dark fantasy',
    worldId: 'arcane',
    refIds: ['arcane_texture', 'cinedna_backlit'],
    paletteId: 'deep_space_blue',
    sources: [
      'Kahraman karanlıkta kendini buluyor.',
      'Güç ve korku aynı anda hissediliyor.',
    ],
  },
  {
    pathId: 'STYLIZED_PREMIUM',
    note: 'ghibli organic — nature adventure',
    worldId: 'ghibli',
    refIds: ['ghibli_organic', 'miyazaki_wind_nature'],
    paletteId: 'ghibli_meadow',
    sources: [
      'Rüzgar ormandan geçiyor, yapraklar dans ediyor.',
      'Yolculuk başlıyor, ufuk açılıyor.',
    ],
  },
  {
    pathId: 'STYLIZED_PREMIUM',
    note: 'spider-verse graphic — urban energy',
    worldId: 'spiderverse',
    refIds: ['spiderverse_graphic', 'akira_neon_impact'],
    paletteId: 'deep_space_blue',
    sources: [
      'Şehrin tepesinden bakış atılıyor.',
      'Hareket başlıyor, çizgiler enerjiyle yüklü.',
    ],
  },
  {
    pathId: 'STYLIZED_PREMIUM',
    note: 'mappa cinematic — war epic (cross-ref: anime in STY)',
    worldId: 'mappa_cinematic',
    refIds: ['attack_titan_scale', 'jujutsu_dark_ritual'],
    paletteId: 'rembrandt_amber',
    sources: [
      'Devasa varlık ufukta beliriyor.',
      'Savaşçı son gücüyle ayağa kalkıyor.',
    ],
  },
  // ── CROSS-REGISTER guard test: anime ref in REAL world ────────────────────
  {
    pathId: 'ULTRAREAL_COMMERCIAL',
    note: 'CROSS-REGISTER: anime ref in real world (guard test)',
    worldId: 'cinematic_real',
    refIds: ['attack_titan_scale', 'nolan_imax_practical'],
    paletteId: 'muted_documentary',
    sources: [
      'Marka bilinirliği zirveye çıkıyor.',
      'Kampanya dünyayı etkiliyor.',
    ],
  },
];

// ── run audit ────────────────────────────────────────────────────────────────

const PASS = '✓';
const WARN = '⚠';
const FAIL = '✗';

const results: AuditEntry[] = [];

for (const fx of FIXTURES) {
  const world = getWorld(fx.worldId);
  const refs = getRefs(fx.refIds);
  const palette = getPalette(fx.paletteId);
  const register = registerOf(fx.pathId) as Register;
  const dna = dnaDirectives(refs, register);
  const rLock = renderLock(world, register);
  const palLight = paletteLight(palette, world);
  const suno = primeSuno(fx.pathId, world.id);
  const issues: string[] = [];

  // DNA quality
  const pathNative = isPathNativeDNA(dna.camera, dna.light);
  if (pathNative) issues.push('DNA is path-native — refs not contributing directives');

  // Suno quality
  const sunoGeneric = isSunoGeneric(suno);
  if (sunoGeneric) issues.push('Suno brief fell back to generic 78-90 BPM template');

  // Render lock quality — must not be the bare fallback
  const rlFallback = rLock.startsWith('Photoreal live-action cinematic frame, real lens depth') ||
                     rLock.startsWith('Premium stylized animated feature frame, original IP-safe');
  if (rlFallback && !world.render) issues.push('Render lock is generic fallback — world.render is missing');

  // Concept scenes
  const emitted: any[] = [];
  const sceneResults: SceneResult[] = [];
  fx.sources.forEach((src, i) => {
    const prev = i > 0 ? { src: fx.sources[i-1], concept: emitted[i-1] } : undefined;
    const concept = primeConcept(src, register, fx.worldId, i === 0 ? 'Intro' : i === fx.sources.length - 1 ? 'Resolution' : 'Build-up', prev, i, emitted, fx.pathId);
    emitted.push(concept);
    const camera = primeCamera(i + 1, src, i, register, i > 0 ? fx.sources[i-1] : undefined, i > 0 ? i : undefined);
    sceneResults.push({ id: i + 1, source: src, matched: concept.matched, subject: concept.subject, event: concept.event, camera });
  });

  const matchedCount = sceneResults.filter(s => s.matched).length;
  const matchRate = `${matchedCount}/${sceneResults.length}`;
  if (matchedCount < sceneResults.length) {
    const fallbackScenes = sceneResults.filter(s => !s.matched).map(s => `[${s.id}]`).join(',');
    issues.push(`${sceneResults.length - matchedCount} scene(s) fell back to generic concept: ${fallbackScenes}`);
  }

  // Cross-register check
  const isCrossReg = register === 'REAL' && refs.some(r => /anime|3d animation|stylized/i.test(r.cat));
  const avoidHasCrossGuard = dna.avoid.includes('cinematography DNA only') ||
                              dna.avoid.includes('anime rendering') ||
                              dna.avoid.includes('animation styling');
  if (isCrossReg && !avoidHasCrossGuard) {
    issues.push('CROSS-REGISTER: stylized ref in REAL world but avoid clause missing cross-render guard');
  }

  // Collect recommendReason samples (first ref vs world)
  const recommendReasons = refs.map(r => recommendReason(world, r));

  // Build brief to check required sections
  const briefScenes = sceneResults.map(s => ({
    id: s.id, source: s.source,
    concept: { subject: s.subject, event: s.event, matched: s.matched },
    camera: s.camera, sec: estimateSec(s.source),
  }));
  const brief = buildAgentBrief({
    projectTopic: 'Audit probe', productionPath: fx.pathId, register,
    world, palette, dna, cast: '', imageModel: 'flux_1_1_pro', videoModel: 'seedance_2',
  }, briefScenes);

  const hasModelEra = brief.includes('== MODEL ERA');
  const hasI2vLaw = brief.includes('I2V ANCHOR LAW') || brief.includes('STATIC DESIGN LAW');
  const hasAuthorityChain = brief.includes('== AUTHORITY ==');
  if (!hasModelEra) issues.push('MISSING: MODEL ERA section');
  if (!hasI2vLaw) issues.push('MISSING: I2V ANCHOR LAW section');
  if (!hasAuthorityChain) issues.push('MISSING: AUTHORITY section');

  results.push({
    path: fx.pathId, pathNote: fx.note, worldId: fx.worldId, worldName: world.name,
    register, refIds: fx.refIds, refNames: refs.map(r => r.name).join(' + '),
    paletteId: fx.paletteId, paletteName: palette?.name || '(none)',
    dnaCamera: dna.camera, dnaLight: dna.light, dnaStaging: dna.staging,
    dnaMotion: dna.motion, dnaTexture: dna.texture, dnaAvoid: dna.avoid,
    dnaIsPathNative: pathNative,
    renderLockText: rLock,
    paletteLightText: palLight,
    sunoBrief: suno,
    sunoIsGeneric: sunoGeneric,
    scenes: sceneResults,
    matchedCount, totalScenes: sceneResults.length,
    matchRate,
    recommendReasons,
    issues,
    hasModelEra, hasI2vLaw, hasAuthorityChain,
  });
}

// ── print audit log ───────────────────────────────────────────────────────────

console.log('══════════════════════════════════════════════════════════════════');
console.log('MAMILAS FULL BRIEF AUDIT — hepsini logla');
console.log('══════════════════════════════════════════════════════════════════\n');

let totalIssues = 0;
let totalFallbacks = 0;

results.forEach((r, i) => {
  const status = r.issues.length === 0 ? PASS : r.issues.some(i => i.startsWith('MISSING') || i.startsWith('CROSS-REGISTER:')) ? FAIL : WARN;
  totalIssues += r.issues.length;
  totalFallbacks += (r.totalScenes - r.matchedCount);

  console.log(`[${String(i + 1).padStart(2, '0')}] ${status} PATH: ${r.path} | WORLD: ${r.worldId} | REG: ${r.register}`);
  console.log(`     NOTE: ${r.pathNote}`);
  console.log(`     REFS: ${r.refNames}`);
  console.log(`     PALETTE: ${r.paletteName}`);
  console.log(`     DNA.camera: ${r.dnaCamera.slice(0, 80)}`);
  console.log(`     DNA.light:  ${r.dnaLight.slice(0, 80)}`);
  console.log(`     DNA.staging:${r.dnaStaging.slice(0, 80)}`);
  console.log(`     DNA.motion: ${r.dnaMotion.slice(0, 80)}`);
  console.log(`     DNA.avoid:  ${r.dnaAvoid.slice(0, 80)}`);
  console.log(`     PATH-NATIVE DNA: ${r.dnaIsPathNative ? FAIL + ' YES' : PASS + ' NO'}`);
  console.log(`     RENDER LOCK: ${r.renderLockText.slice(0, 90)}`);
  console.log(`     PALETTE LIGHT: ${r.paletteLightText.slice(0, 80)}`);
  console.log(`     SUNO: ${r.sunoBrief.slice(0, 90)}`);
  console.log(`     SUNO GENERIC: ${r.sunoIsGeneric ? FAIL + ' YES' : PASS + ' NO'}`);
  console.log(`     CONCEPTS: ${r.matchRate} matched`);
  r.scenes.forEach(s => {
    const sm = s.matched ? PASS : WARN;
    console.log(`       ${sm} [${s.id}] ${s.matched ? 'MATCH' : 'FALLBACK'} | subject: ${s.subject.slice(0, 65)}`);
  });
  r.recommendReasons.forEach((rr, ri) => {
    console.log(`     RECOMMEND[${ri}]: ${rr.slice(0, 90)}`);
  });
  if (r.issues.length) {
    r.issues.forEach(issue => console.log(`     ${WARN} ISSUE: ${issue}`));
  }
  console.log();
});

// ── summary table ─────────────────────────────────────────────────────────────

console.log('══════════════════════════════════════════════════════════════════');
console.log('AUDIT SUMMARY');
console.log('══════════════════════════════════════════════════════════════════');
const passCount = results.filter(r => r.issues.length === 0).length;
const warnCount = results.filter(r => r.issues.length > 0 && !r.issues.some(i => i.startsWith('MISSING') || i.startsWith('CROSS-REGISTER:'))).length;
const failCount = results.filter(r => r.issues.some(i => i.startsWith('MISSING') || i.startsWith('CROSS-REGISTER:'))).length;
const totalScenes = results.reduce((n, r) => n + r.totalScenes, 0);
const totalMatched = results.reduce((n, r) => n + r.matchedCount, 0);
const pathNativeCount = results.filter(r => r.dnaIsPathNative).length;
const sunoGenericCount = results.filter(r => r.sunoIsGeneric).length;

console.log(`Fixtures tested: ${results.length}`);
console.log(`${PASS} CLEAN: ${passCount}  ${WARN} WARN: ${warnCount}  ${FAIL} FAIL: ${failCount}`);
console.log(`Total scenes: ${totalScenes} | Matched: ${totalMatched} | Fallback: ${totalScenes - totalMatched} (${Math.round((1 - totalMatched/totalScenes)*100)}%)`);
console.log(`PATH-NATIVE DNA (refs not contributing): ${pathNativeCount}/${results.length}`);
console.log(`SUNO GENERIC fallbacks: ${sunoGenericCount}/${results.length}`);
console.log(`Total issues: ${totalIssues}`);
console.log();
if (results.some(r => r.issues.length > 0)) {
  console.log('ISSUES BY FIXTURE:');
  results.filter(r => r.issues.length).forEach((r, _i) => {
    const idx = results.indexOf(r) + 1;
    console.log(`  [${String(idx).padStart(2,'0')}] ${r.path}/${r.worldId}: ${r.issues.join(' | ')}`);
  });
}
console.log('\nAUDIT COMPLETE.');
