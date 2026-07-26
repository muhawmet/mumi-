// MAMILAS DÜNYA SINAVI — 46 dünyaya uygulanabilen ortak 5-kare sınav seti.
//
// NEDEN VAR (kalp nakli G2): 46 dünyanın 45'i hiç kare görmedi. Darboğaz kelime kusuru
// değil, DOĞRULAMA MALİYETİ — bir dünyayı sınamak bugün bir video üretmek kadar pahalı.
// Sınanmayan dünya ürün değil, iddiadır. Bu modül maliyeti bir script koşumuna indirir.
//
// SINAV KARE ÜRETMEZ. Prompt ve ölçüm üretir; kare Mami'nin elinde doğar (API yok).
// Bu yüzden hükümleri YAPISAL'dır: "bu eksen taşınıyor mu", "iki bant çelişiyor mu".
// Karenin güzel olup olmadığı buradan ÇIKMAZ — o ayrı kapıdır ve Mami'nindir.
//
// KONTROLLÜ DENEY: beş sahne, konu, cast, yazı ve notlar 46 dünyada AYNI. Tek değişken
// dünyanın kendisi. Soru değişirse fark dünyaya değil soruya yazılır — sınav ölçü aleti
// olmaktan çıkar.
//
// ÖLÇÜM YÜZEYİ: `agentBrief` + `imagePrompt` + `motionPrompt` BİRLİKTE. Sebebi ürün
// yasası: site final prompt yazmaz, ajan yazar. Reçetenin sahne notları (Türkçe label,
// avoid, ışık kaynağı) brief'in "Doctor's Recipe Notes" bloğunda yaşar; imagePrompt
// dünyanın yasası + [DIRECTOR TASK]'tır. Yalnız imagePrompt'a bakan bir sınav, taşınan
// yarım paketi "kayıp" sanar.
//
// No DOM, no LLM, no network. Deterministic.

import {
  DATA,
  generateBatch,
  refCompatibleWithWorld,
  splitRenderLawPhysics,
  type BriefInput,
  type SurgeryRef,
  type SurgeryWorld,
} from './pure';
import type { RecipeSceneNote } from './brain';
import { isFlatLightWorld, registerOf, resolveLightAuthorityReceipt } from './brain';
import { dnaStrength, refFit } from './universeMeasure';

// ─────────────────────────────────────────────────────────────────────────────
// SINAVIN SABİTLERİ — 46 dünyada değişmez
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sınav konusu. Bilinçle nötr: bir nesne, bir yüzey, bir kişi — eğitim dünyasında da,
 * reklam dünyasında da, sinematik dünyada da kadraja girer. Konu "ilginç" olsaydı
 * bazı dünyalara yakışır bazılarına yakışmazdı ve fark dünyayı değil konuyu ölçerdi.
 */
export const EXAM_SUBJECT = 'Bir masanın üstünde duran tek bir nesne ve onu inceleyen bir kişi';

/** Sınavın mekânı — sahnenin gerçek yeri, ışık kaynağı yasasının dayanağı. */
export const EXAM_LOCATION = 'içeride, penceresiz bir çalışma odası';

/** Enzim taşıyıcısı: cast yaşı (KALP-G1b). "Child" bir yaş değildir. */
export const EXAM_CAST_AGE = '6. sınıf · 11-12 yaş';

/** Enzim taşıyıcısı: karakterli sahne payı. Beş sahnenin ikisi insanlı → %40. */
export const EXAM_CHARACTER_SHARE = 40;

/** Enzim taşıyıcısı: tekrar eden tag'ler — biri kişi, biri hero-prop. */
export const EXAM_HERO_TAGS = ['@mira', '@kutu'];

/**
 * Sınavın ekran metni. Türkçe diyakritik TAŞIR (Ö · Ç · Ü) ve boşluk içerir —
 * NB2 kataloğunun "garbled tabela" ve "aynalı yazı" hataları tam burada doğuyor.
 * Diyakritiksiz bir kelime bu ekseni yoklamaz, yalnız yoklamış gibi yapar.
 */
export const EXAM_ON_SCREEN_TEXT = 'DENGE ÖLÇÜMÜ';

/**
 * Dünya grubunun kendi doğal üretim yolu. Sınav yolu SEÇMEZ — dünyanın kendi
 * sınıfını kullanır. Yanlış yol seçmek uyumluluk kapısını tetikler ve dünyanın
 * kusuru gibi görünen bir sınav kusuru üretir.
 */
const EXAM_PATH_BY_GROUP: Record<string, string> = {
  ANIMATION_EDU: 'ANIMATION_EDU',
  ANIMATION_PAINTERLY: 'STYLIZED_PREMIUM',
  ANIMATION_STYLIZED: 'STYLIZED_PREMIUM',
  ANIMATION_DARK: 'STYLIZED_PREMIUM',
  ANIMATION_CEL_3D_HYBRID: 'STYLIZED_PREMIUM',
  ANIMATION_BOLD_CEL: 'STYLIZED_PREMIUM',
  CINEMATIC_REAL: 'DOCUMENTARY_REALISM',
  COMMERCIAL_REAL: 'ULTRAREAL_COMMERCIAL',
};

export type ExamProbeId = 'PHYSICS' | 'TEXT' | 'REF' | 'CAST' | 'START_FRAME';

export interface ExamProbe {
  id: ExamProbeId;
  /** Bu sahnenin NE yokladığı. Rapora aynen girer — adsız soru, tahmin edilen sonuçtur. */
  asks: string;
  note: RecipeSceneNote;
}

/**
 * Beş kare. Her biri bir ekseni yoklar, hepsi aynı konuyu paylaşır.
 * Sıra kasıtlı: nesne → yazı → referans → insan → hareket. Sonrakinin taşıdığı
 * yük bir öncekinin üstüne biner; START_FRAME en yüklü kare olduğu için sonda.
 */
export const EXAM_PROBES: readonly ExamProbe[] = [
  {
    id: 'PHYSICS',
    asks: "Dünyanın fiziği kareye iniyor mu — malzeme, ışık ve yüzey davranışı yazılı mı, yoksa yerine nesne envanteri mi geçiyor?",
    note: {
      id: 1,
      vo: '',
      event: 'Tek bir nesne düz bir yüzeyin üstünde hareketsiz duruyor. Karede insan yok.',
      director_note: 'Nesnenin malzemesi ve yüzeyin dokusu okunsun; sahne bir malzeme sınavıdır.',
      motion_seed: '',
      turkish_labels: [],
      avoid: [],
      light_source: 'odanın kendi tepe aydınlatması — pencere yok, dışarıdan ışık gelmiyor',
    },
  },
  {
    id: 'TEXT',
    asks: 'Türkçe ekran metni karede doğuyor mu — diyakritikleriyle, gerçek bir yüzeye basılmış olarak; yoksa temiz-plaka bandı onu aynı karede iptal mi ediyor?',
    note: {
      id: 2,
      vo: '',
      event: `Aynı nesnenin yanında duran küçük bir tabelada "${EXAM_ON_SCREEN_TEXT}" yazıyor.`,
      director_note: 'Yazı karede doğar, karede biter. Post-prodüksiyonda yazı katmanı yok.',
      motion_seed: '',
      turkish_labels: [EXAM_ON_SCREEN_TEXT],
      avoid: ['kayan altyazı', 'karenin üstüne bindirilmiş caption'],
    },
  },
  {
    id: 'REF',
    asks: 'Seçilen referansların DNA\'sı gerçekten bir alan dolduruyor mu (kamera/ışık/kompozisyon/hareket/doku), yoksa dünya yasasıyla çakışıp sessizce mi düşüyor?',
    note: {
      id: 3,
      vo: '',
      event: 'Aynı nesne, bu kez geniş kadrajda: mekânın derinliği ve nesnenin ölçeği birlikte okunuyor.',
      director_note: 'Kadraj ve ışık kararı referansın işidir; bu sahne referansın kareye ne kattığını gösterir.',
      motion_seed: '',
      turkish_labels: [],
      avoid: [],
    },
  },
  {
    id: 'CAST',
    asks: 'Cast yasası kareye iniyor mu — kilitli yaş, karakter payı ve tekrar eden tag tek bir kimliğe bağlanıyor mu?',
    note: {
      id: 4,
      vo: '',
      event: `${EXAM_HERO_TAGS[0]} masaya yaklaşıp ${EXAM_HERO_TAGS[1]} adlı nesneyi eline alıyor.`,
      director_note: 'Yaş kilidi bu karede sınanır: gövde oranı ve yüz yapısı kilitli yaşı okumalı.',
      motion_seed: '',
      turkish_labels: [],
      avoid: ['yetişkin gövde oranı', 'okul öncesi yüz yapısı'],
      light_source: 'odanın kendi tepe aydınlatması',
    },
  },
  {
    id: 'START_FRAME',
    asks: 'Başlangıç karesi hareketin ihtiyacı olan her şeyi taşıyor mu — motion yeni öğe doğurmadan tek bir eylemi oynatabiliyor mu?',
    note: {
      id: 5,
      vo: '',
      event: `${EXAM_HERO_TAGS[0]} elindeki nesneyi masaya geri bırakıyor; nesne yüzeye değdiği anda kare donuyor.`,
      director_note: 'Karede olmayan hiçbir şey harekette doğmaz. Kare tek bir donmuş andır.',
      motion_seed: 'nesne yüzeye değer ve ağırlığıyla oturur — tek eylem',
      turkish_labels: [],
      avoid: ['kadraja yeni nesne girmesi', 'ikinci bir eylem'],
    },
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// SINAV BRIEF'İ
// ─────────────────────────────────────────────────────────────────────────────

function worldById(worldId: string): SurgeryWorld | undefined {
  return (DATA.worlds as SurgeryWorld[]).find((w) => w.id === worldId);
}

/**
 * Dünyanın kendi uyumlu ref'lerinden en iyi üçü. Deterministik: uyum yüzdesine göre,
 * eşitlikte id'ye göre. Üç sayısı reçetenin gerçek kullanımından geliyor (biten üç
 * videonun hiçbiri üçten fazla imza ref taşımadı); ref havuzunu tamamen boşaltmak
 * DNA çakışmalarını ölçülemez hale getirirdi.
 */
export function examRefsFor(worldId: string): SurgeryRef[] {
  const world = worldById(worldId);
  return (DATA.refs as SurgeryRef[])
    .filter((ref) => refCompatibleWithWorld(ref, worldId))
    .slice()
    .sort((a, b) => (refFit(world, b) - refFit(world, a)) || String(a.id).localeCompare(String(b.id)))
    .slice(0, 3);
}

/** Dünyanın sınav brief'i. Dünya-türevi alanlar dışında 46 dünyada byte-eşit. */
export function buildExamBrief(worldId: string): BriefInput {
  const world = worldById(worldId);
  const projectClass = EXAM_PATH_BY_GROUP[String(world?.group || '')] || 'ANIMATION_EDU';
  return {
    projectTopic: EXAM_SUBJECT,
    subject: EXAM_SUBJECT,
    location: EXAM_LOCATION,
    projectClass,
    sceneCount: EXAM_PROBES.length,
    cast: '',
    castAge: EXAM_CAST_AGE,
    characterShare: EXAM_CHARACTER_SHARE,
    heroTags: [...EXAM_HERO_TAGS],
    selectedWorldId: worldId,
    selectedPropId: 'native_world',
    selectedRefIds: examRefsFor(worldId).map((r) => String(r.id)),
    selectedPaletteId: '',
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
    osTextMode: 'AUTO',
    // deliveryDeclaration BİLEREK YOK. Batch seviyesinde `baked` beyanı BÜTÜN sahnelerden
    // aynı metni ister ve taşımayanı BLOCKED yapar (gerçek çıktıyla ölçüldü) — beş sahnenin
    // dördü temiz plaka olduğu için sınav kendi kendini bloklardı. Metin isteği sahne
    // notunun `turkish_labels` alanından, doktor notu olarak taşınır.
    recipeScenes: EXAM_PROBES.map((probe) => ({ ...probe.note })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RAPOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Eksen hükmü. Bilerek dört değerli:
 * - `CARRIED`  — eksen pakete iniyor.
 * - `MISSING`  — inmiyor. Dünyanın (veya kodun) taşıma kusuru.
 * - `CONFLICT` — iki bant aynı karede zıt şey söylüyor; motor birini rastgele seçer.
 * - `NOT_MEASURABLE` — sınav bu dünyada bu ekseni yoklayamadı; sebebi ölçümde yazar.
 * `PASS` YOK: yapısal taşıma görsel PASS değildir (PROJECT_CONTRACT).
 */
export type AxisVerdict = 'CARRIED' | 'MISSING' | 'CONFLICT' | 'NOT_MEASURABLE';

export interface ExamAxis {
  probe: ExamProbeId;
  verdict: AxisVerdict;
  /** Tek satır ölçüm — sayı ve gerçek, yorum değil. */
  measure: string;
  /** Verbatim kanıt parçaları. Kırpılır ama uydurulmaz. */
  evidence: string[];
}

export interface WorldExamReport {
  worldId: string;
  worldName: string;
  group: string;
  projectClass: string;
  status: 'GENERATED' | 'BLOCKED';
  blockers: string[];
  axes: ExamAxis[];
  /** Tek satır YETENEK hükmü. Görsel kalite hükmü değil. */
  verdict: string;
  /** Beş gerçek image prompt (sınavın çıktısı — kare değil). */
  prompts: string[];
}

const CLIP = 160;
const clip = (s: string): string => (s.length > CLIP ? `${s.slice(0, CLIP)}…` : s);

/** Cümleye böl; ölçüm cümle düzeyinde yapılır, kelime düzeyinde değil (MAKRO). */
function sentences(text: string): string[] {
  return String(text || '')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25);
}

function blockedReport(world: SurgeryWorld, projectClass: string, blockers: string[]): WorldExamReport {
  return {
    worldId: String(world.id),
    worldName: String(world.name || world.id),
    group: String(world.group || ''),
    projectClass,
    status: 'BLOCKED',
    blockers,
    axes: EXAM_PROBES.map((probe) => ({
      probe: probe.id,
      verdict: 'NOT_MEASURABLE' as AxisVerdict,
      measure: 'Sınav bloklandı — prompt üretilmedi, eksen yoklanamadı.',
      evidence: [],
    })),
    verdict: `${world.id}: sınav BLOKLANDI (${blockers.length} kapı) — eksenler ölçülemedi; kare hükmü zaten açılmadı.`,
    prompts: [],
  };
}

/**
 * Bir dünyayı sınar. Gerçek `generateBatch` koşar; fixture yoktur.
 * Aynı girdi her koşumda aynı raporu verir (ölçü aleti oynamaz).
 */
export function examineWorld(worldId: string): WorldExamReport {
  const world = worldById(worldId);
  if (!world) {
    return {
      worldId,
      worldName: worldId,
      group: '',
      projectClass: '',
      status: 'BLOCKED',
      blockers: [`NO_WORLD: ${worldId} SURGERY_DATA.json içinde yok`],
      axes: EXAM_PROBES.map((probe) => ({
        probe: probe.id,
        verdict: 'NOT_MEASURABLE' as AxisVerdict,
        measure: 'Dünya bulunamadı.',
        evidence: [],
      })),
      verdict: `${worldId}: dünya yok — sınav koşulamadı; kare hükmü açılmadı.`,
      prompts: [],
    };
  }

  const brief = buildExamBrief(worldId);
  const projectClass = brief.projectClass;

  let result: ReturnType<typeof generateBatch>;
  try {
    result = generateBatch(brief);
  } catch (err) {
    return blockedReport(world, projectClass, [
      `EXCEPTION: ${err instanceof Error ? err.message : String(err)}`,
    ]);
  }

  if (result.status !== 'GENERATED' || result.scenes.length !== EXAM_PROBES.length) {
    return blockedReport(
      world,
      projectClass,
      result.contractGate.findings.length
        ? result.contractGate.findings.map((f) => `${f.code}: ${f.message}`)
        : [`SCENE_COUNT: ${result.scenes.length}/${EXAM_PROBES.length} sahne üretildi`],
    );
  }

  const agentBrief = String(result.agentBrief || '');
  const scenes = result.scenes;
  const byProbe = (id: ExamProbeId) => scenes[EXAM_PROBES.findIndex((p) => p.id === id)];

  const axes: ExamAxis[] = [
    measurePhysics(world, byProbe('PHYSICS').imagePrompt),
    measureText(byProbe('TEXT').imagePrompt, agentBrief),
    measureRef(world, worldId, projectClass),
    measureCast(agentBrief),
    measureStartFrame(byProbe('START_FRAME')),
  ];

  const missing = axes.filter((a) => a.verdict === 'MISSING').map((a) => a.probe);
  const conflict = axes.filter((a) => a.verdict === 'CONFLICT').map((a) => a.probe);
  const carried = axes.filter((a) => a.verdict === 'CARRIED').length;

  const head = conflict.length
    ? `ÇELİŞKİ: ${conflict.join(' · ')}`
    : missing.length
      ? `EKSİK: ${missing.join(' · ')}`
      : `beş eksen de pakete iniyor`;

  return {
    worldId: String(world.id),
    worldName: String(world.name || world.id),
    group: String(world.group || ''),
    projectClass,
    status: 'GENERATED',
    blockers: [],
    axes,
    verdict: `${world.id}: ${head} (${carried}/5 taşınıyor) — yapısal ölçüm; kare hükmü ayrı kapıdır ve Mami'nindir.`,
    prompts: scenes.map((s) => s.imagePrompt),
  };
}

/** Bütün kütüphane. Dünya sırası `SURGERY_DATA.json` sırasıdır — deterministik. */
export function examineLibrary(): WorldExamReport[] {
  return (DATA.worlds as SurgeryWorld[]).map((w) => examineWorld(String(w.id)));
}

// ─────────────────────────────────────────────────────────────────────────────
// EKSEN ÖLÇÜMLERİ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * FİZİK — dünyanın render yasasının FİZİK yarısı kareye iniyor mu, envanter yarısı
 * sızıyor mu. `splitRenderLawPhysics` ayrımı M2'de kuruldu; bu ölçüm o ayrımın
 * gerçekten prompt'ta tuttuğunu yoklar.
 *
 * Ayrıca sahnenin ışık kaynağı ÇÖZÜLMÜŞ mü (KALP-G1e sahte güneş): dünya yasası bir
 * kaynak MENÜSÜ sayar; sahne o menüden seçim yapmazsa motor en göze batanı seçer ve
 * odaya pencere uydurur.
 */
function measurePhysics(world: SurgeryWorld, prompt: string): ExamAxis {
  const law = String(world.render_law || '');
  if (!law.trim()) {
    return {
      probe: 'PHYSICS',
      verdict: 'MISSING',
      measure: 'Dünyanın `render_law` alanı boş — taşınacak fizik yok.',
      evidence: [],
    };
  }

  const { physics, props } = splitRenderLawPhysics(law);
  const physicsSentences = sentences(physics);
  const landed = physicsSentences.filter((s) => prompt.includes(s));
  const propSentences = sentences(props);
  const leaked = propSentences.filter((s) => prompt.includes(s));

  // Sahnenin ışık kaynağı çözüldü mü (G1e sahte güneş). Sahne `light_source` verdiğinde
  // prompt "bu kaynak ve başkası değil" bandını basmalıdır — AMA yalnız yönlü ışığı olan
  // dünyalarda. Düz-ışık dünyasında (kendi yasası yönlü simülasyonu reddediyor) bandın
  // basılmaması DOĞRUdur; orada key diye bir şey yok, cümle gürültü olurdu.
  //
  // İki durumu ayırmak şart: karıştırıldığında "29 dünya kırık" gibi okunan tablo,
  // aslında bir kısmı doğru davranan dünyaları da suçlar.
  const flatLight = isFlatLightWorld(world);
  const keyBandPrinted = /Named key source for THIS shot/i.test(prompt);
  const keyState = flatLight
    ? 'düz ışık dünyası — kaynak sorusu geçersiz'
    : keyBandPrinted
      ? 'ışık kaynağı çözülü'
      : 'sahnenin adlandırılmış kaynağı DÜŞTÜ';
  // Talimat düşmesi yalnız yönlü ışığı olan dünyada kusurdur.
  const keyDropped = !flatLight && !keyBandPrinted;

  const ratio = physicsSentences.length ? Math.round((landed.length / physicsSentences.length) * 100) : 0;
  const parts = [
    `fizik cümlesi ${landed.length}/${physicsSentences.length} (%${ratio})`,
    `envanter sızıntısı ${leaked.length}/${propSentences.length}`,
    keyState,
  ];

  let verdict: AxisVerdict = 'CARRIED';
  if (!landed.length) verdict = 'MISSING';
  else if (leaked.length || keyDropped) verdict = 'CONFLICT';

  return {
    probe: 'PHYSICS',
    verdict,
    measure: parts.join(' · '),
    evidence: [
      ...leaked.map((s) => `envanter: ${clip(s)}`),
      ...(keyDropped ? [`ışık yasası: ${clip(String(world.light_law || ''))}`] : []),
      ...(landed[0] ? [`fizik: ${clip(landed[0])}`] : []),
    ],
  };
}

/**
 * YAZI — Türkçe ekran metni pakete iniyor mu, ve aynı karede İPTAL ediliyor mu.
 *
 * Bu eksen tarihsel bir kusurun kapısıdır (TASK-1B, P0): kaynak baked metin isterken
 * prompt aynı karede "clean plate — this scene carries no on-screen text" basıyordu.
 * Söz sessizce düşüyordu. İki bant aynı anda doğruysa motor birini rastgele seçer.
 */
function measureText(prompt: string, agentBrief: string): ExamAxis {
  const inBrief = agentBrief.includes(EXAM_ON_SCREEN_TEXT);
  // Diyakritik hayatta kaldı mı: paket metni ASCII'ye düşürüyorsa (ÖLÇÜMÜ → OLCUMU)
  // motora giden istek zaten yanlış yazılmıştır.
  const asciiFolded = agentBrief.includes('DENGE OLCUMU');
  const cleanPlate = /clean plate\s*[—-]\s*this scene carries no on-screen text/i.test(prompt);
  const diegeticBand = /render it DIEGETICALLY|diegetic/i.test(prompt);

  const parts = [
    inBrief ? 'metin pakette (doktor notu)' : 'metin PAKETTE YOK',
    diegeticBand ? 'diyejetik bant var' : 'diyejetik bant YOK',
    cleanPlate ? 'temiz-plaka bandı AYNI KAREDE' : 'temiz-plaka çelişkisi yok',
    asciiFolded ? 'diyakritik DÜŞMÜŞ' : 'diyakritik korunmuş',
  ];

  let verdict: AxisVerdict = 'CARRIED';
  if (!inBrief) verdict = 'MISSING';
  else if (cleanPlate || asciiFolded) verdict = 'CONFLICT';
  else if (!diegeticBand) verdict = 'CONFLICT';

  return {
    probe: 'TEXT',
    verdict,
    measure: parts.join(' · '),
    evidence: inBrief ? [`istek: "${EXAM_ON_SCREEN_TEXT}"`] : [],
  };
}

/**
 * REFERANS — seçilen ref'ler gerçekten bir DNA alanı dolduruyor mu.
 *
 * `dnaStrength` zaten dünya kapısını uyguluyor (uyumsuz ref sıfır sayılır). Buna ek
 * olarak ışık ekseninin makbuzu okunur (KALP-G1d): dünya yasası ref'in ışık cümlesini
 * eziyorsa bu bir kusur DEĞİL, kayıt altına alınması gereken bir karardır. Makbuzsuz
 * eziliş, sonraki oturumun aynı tartışmayı sıfırdan yapması demekti.
 */
function measureRef(world: SurgeryWorld, worldId: string, projectClass: string): ExamAxis {
  const refs = examRefsFor(worldId);
  if (!refs.length) {
    return {
      probe: 'REF',
      verdict: 'MISSING',
      measure: 'Bu dünyayla uyumlu tek bir ref yok — DNA katmanı boş çalışıyor.',
      evidence: [],
    };
  }

  const register = registerOf(projectClass);
  const strength = dnaStrength(refs, register, worldId);
  const receipt = resolveLightAuthorityReceipt(strength.directives.light || '', world);

  const parts = [
    `${refs.length} ref → ${strength.filled}/${strength.total} alan (%${strength.percent})`,
    strength.fields.length ? `dolan: ${strength.roles.join('/')}` : 'dolan alan yok',
    strength.zeroRefIds.length ? `sıfır katkı: ${strength.zeroRefIds.join(' · ')}` : 'her ref bir alan dolduruyor',
    receipt.dropped.length ? `ışık ezildi (${receipt.rule}), makbuz var` : `ışık ezilmedi (${receipt.rule})`,
  ];

  return {
    probe: 'REF',
    verdict: strength.filled ? 'CARRIED' : 'MISSING',
    measure: parts.join(' · '),
    evidence: receipt.dropped.map((d) => `ezilen: ${clip(d)}`),
  };
}

/**
 * CAST — enzim'in üç taşıyıcısı (KALP-G1b) brief'e iniyor mu.
 *
 * Üçü de kimliğin parçası; biri düşerse aynı karar her prodüksiyonda sohbette
 * yeniden konuşulur. Geri sarmanın kaynağı budur.
 */
function measureCast(agentBrief: string): ExamAxis {
  const hasAge = agentBrief.includes(EXAM_CAST_AGE);
  const hasShare = new RegExp(`\\b${EXAM_CHARACTER_SHARE}\\s*%|%\\s*${EXAM_CHARACTER_SHARE}\\b`).test(agentBrief);
  const missingTags = EXAM_HERO_TAGS.filter((tag) => !agentBrief.includes(tag));

  const parts = [
    hasAge ? 'yaş kilidi var' : 'yaş kilidi YOK',
    hasShare ? 'karakter payı var' : 'karakter payı YOK',
    missingTags.length ? `düşen tag: ${missingTags.join(' · ')}` : `${EXAM_HERO_TAGS.length} tag taşınıyor`,
  ];

  const allCarried = hasAge && hasShare && !missingTags.length;
  return {
    probe: 'CAST',
    verdict: allCarried ? 'CARRIED' : 'MISSING',
    measure: parts.join(' · '),
    evidence: hasAge ? [`yaş: ${EXAM_CAST_AGE}`] : [],
  };
}

/**
 * BAŞLANGIÇ KARESİ — kare hareketin ihtiyacı olan her şeyi taşıyor mu.
 *
 * Ürün yasası: START FRAME her şeyi taşır, motion yeni öğe doğurmaz. Ölçüm motion
 * prompt'unun kare-sadakati bandını ve yeni-nesne yasağını yoklar; ikisinden biri
 * yoksa motor kadraja yeni bir şey sokabilir ve kare yeniden üretilir.
 */
function measureStartFrame(scene: { imagePrompt: string; motionPrompt: string }): ExamAxis {
  const image = scene.imagePrompt;
  const motion = scene.motionPrompt;

  const frameReady = /motion-ready start frame|start frame/i.test(image);
  const frameTruth = /the approved frame is truth|already in the frame|frame-aware/i.test(motion);
  const noNewObject = /no new object or scenery|new objects or scenery/i.test(motion);
  const singleAction = /single-action|ONE single-action|multiple actions/i.test(motion);

  const parts = [
    frameReady ? 'kare motion-hazır ilan edilmiş' : 'kare motion-hazır DEĞİL',
    frameTruth ? 'kare-sadakati bandı var' : 'kare-sadakati bandı YOK',
    noNewObject ? 'yeni-nesne yasağı var' : 'yeni-nesne yasağı YOK',
    singleAction ? 'tek-eylem kilidi var' : 'tek-eylem kilidi YOK',
  ];

  const holes = [frameReady, frameTruth, noNewObject, singleAction].filter((ok) => !ok).length;
  return {
    probe: 'START_FRAME',
    verdict: holes === 0 ? 'CARRIED' : holes >= 3 ? 'MISSING' : 'CONFLICT',
    measure: parts.join(' · '),
    evidence: [],
  };
}
