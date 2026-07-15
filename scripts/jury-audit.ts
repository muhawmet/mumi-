/**
 * jury-audit.ts — JÜRİ SESSION gerçek çıktı üretici (mamilas-audit disiplini).
 *
 * 6 gerçek register reçetesi için REAL generateBatch çalıştırır, .command
 * (buildProductionExport) üretir, evaluateDirectorCabinet'i koşar ve her
 * senaryo için jüri paketi dosyalarını scratchpad'e yazar.
 *
 * Run: npx tsx scripts/jury-audit.ts
 * NEVER modifies src/. Deterministic (no Date.now/random in src path;
 * buildCommandJSON uses new Date() for generatedAt — cosmetic only).
 * İşin sonunda SİLİNİR (geçici audit tooling).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

import { generateBatch, DATA, type BriefInput, type PureScene } from '../src/core/pure.js';
import { ingestSource, sourceIntegrity } from '../src/core/source.js';
import { buildProductionExport } from '../src/core/productionExport.js';
import { evaluateDirectorCabinet } from '../src/core/qa.js';

const OUT = process.env.JURY_OUT
  || '/private/tmp/claude-502/-Users-Muhammet/c43fa342-dc65-4398-9b33-94cb6387f2c4/scratchpad/jury-package';
fs.mkdirSync(OUT, { recursive: true });

interface Recipe {
  key: string;
  label: string;
  register: 'ANIME' | 'ANIMATION' | 'REAL';
  topic: string;
  projectClass: string;
  worldId: string;
  propId: string;
  refIds: string[];
  paletteId: string;
  rawSource: string;
}

const RECIPES: Recipe[] = [
  {
    key: '1-one-piece',
    label: 'ANIME — One Piece (Toei bold-cel) · Fırtınalı denizde kayıp adanın haritası',
    register: 'ANIME',
    topic: 'Fırtınalı denizde kayıp adanın haritası',
    projectClass: 'STYLIZED_PREMIUM',
    worldId: 'one_piece_toei',
    propId: 'none',
    refIds: ['one_piece_sunny_adventure', 'onepiece_grandline_scale'],
    paletteId: '',
    rawSource:
      'Fırtınalı bir denizde küçük bir yelkenli devasa dalgalar arasında savrulur. ' +
      'Güvertede genç bir maceracı elindeki yıpranmış hazine haritasını rüzgâra karşı iki eliyle korur. ' +
      'Bir şimşek çakar ve haritadaki gizli rota bir anlığına parlar. ' +
      'Maceracı dümene atılır ve gemiyi haritanın işaret ettiği kayalık geçide doğru kırar.',
  },
  {
    key: '2-jujutsu',
    label: 'ANIME — Jujutsu Kaisen (MAPPA dark) · Lanetli enerjinin gece uyanışı',
    register: 'ANIME',
    topic: 'Lanetli enerjinin gece uyanışı',
    projectClass: 'STYLIZED_PREMIUM',
    worldId: 'jjk_mappa',
    propId: 'none',
    refIds: ['jujutsu_dark_ritual'],
    paletteId: '',
    rawSource:
      'Gece yarısı ıssız bir metro geçidinde havadaki lanetli enerji görünür bir sise dönüşür. ' +
      'Genç bir büyücü avucunda toplanan mavi enerjiyi sıkarak yumruğunu sıkar. ' +
      'Karşısındaki karanlık lanet gölgeden şekil alarak öne doğru hamle yapar. ' +
      'Büyücü tek bir kesin darbeyle laneti dağıtır ve geçit yeniden sessizliğe gömülür.',
  },
  {
    key: '3-pixar-edu',
    label: 'ANIMATION — Pixar 3D EDU · Su Döngüsü',
    register: 'ANIMATION',
    topic: 'Su Döngüsü',
    projectClass: 'ANIMATION_EDU',
    worldId: 'pixar_3d_edu',
    propId: 'native_world',
    refIds: ['pixar_dimensional', 'pixar_emotional_staging'],
    paletteId: '',
    rawSource:
      'Güneş okyanustaki suyu ısıtır ve su buharlaşarak görünmez su buharına dönüşür. ' +
      'Yükselen su buharı soğuk havada yoğunlaşarak minik damlacıklardan bulutları oluşturur. ' +
      'Bulut doyduğunda su yağmur olarak yeryüzüne geri düşer. ' +
      'Yağan su derelerle tekrar okyanusa akar ve döngü baştan başlar.',
  },
  {
    key: '4-spiderverse',
    label: 'ANIMATION — Spider-Verse (Sony stylized) · Şehrin çatıları arasında ilk sıçrayış',
    register: 'ANIMATION',
    topic: 'Şehrin çatıları arasında ilk büyük sıçrayış',
    projectClass: 'STYLIZED_PREMIUM',
    worldId: 'spiderverse_sony',
    propId: 'none',
    refIds: ['spiderverse_graphic'],
    paletteId: '',
    rawSource:
      'Şehrin gökdelenleri arasında genç bir figür bir çatının kenarında dengede durur. ' +
      'Derin bir nefes alır ve boşluğa doğru kendini bırakır. ' +
      'Son anda bir ip fırlatır ve yerçekimine karşı geniş bir yay çizerek savrulur. ' +
      'Karşı binanın camına yumuşakça tutunarak ilk uçuşunu tamamlar.',
  },
  {
    key: '5-luxury-watch',
    label: 'REAL — Amiral saat lansmanı (Fincher precision + luxury macro)',
    register: 'REAL',
    topic: 'Amiral saat lansmanı',
    projectClass: 'ULTRAREAL_COMMERCIAL',
    worldId: 'fincher_precision',
    propId: 'native_world',
    refIds: ['kubrick_one_point', 'severance_corporate_dread', 'luxury_watch_macro'],
    paletteId: 'desaturated_cinematic',
    rawSource:
      'Karanlık bir stüdyoda tek bir ışık huzmesi cilalı çelik saat kasasının üzerinde yavaşça gezinir. ' +
      'Saniye ibresi kadranın üzerinde sessizce ve kusursuz bir hassasiyetle ilerler. ' +
      'Kamera safir camın altındaki mekanik çarkların birbirini sürüklediği ana yaklaşır. ' +
      'Saat siyah kadife bir zemin üzerinde son konumuna yerleşir ve marka logosu netleşir.',
  },
  {
    key: '6-automotive',
    label: 'REAL — Elektrikli otomobil çöl lansmanı (Deakins naturalist)',
    register: 'REAL',
    topic: 'Elektrikli otomobilin çöl lansmanı',
    projectClass: 'AUTOMOTIVE_MOBILITY',
    worldId: 'deakins_naturalist',
    propId: 'native_world',
    refIds: ['automotive_commercial', 'breaking_bad_desert_pov', 'setup_goldenhour_auto'],
    paletteId: 'golden_dust_epic',
    rawSource:
      'Şafak vakti uçsuz bucaksız bir çöl yolunda ısı dalgaları asfaltın üzerinde titreşir. ' +
      'Ufuk çizgisinde elektrikli bir otomobil sessizce belirir ve yaklaşır. ' +
      'Alçak bir açıdan kamera aracın yalın gövde hattı boyunca kayar. ' +
      'Otomobil tozu geride bırakarak kameranın önünden geçip altın ışığa karışır.',
  },
];

function buildBrief(r: Recipe, beats: ReturnType<typeof ingestSource>): BriefInput {
  return {
    rawSource: r.rawSource,
    sourceBeats: beats,
    projectTopic: r.topic,
    projectClass: r.projectClass,
    sceneCount: beats.length,
    cast: '',
    selectedWorldId: r.worldId,
    selectedPropId: r.propId,
    selectedRefIds: r.refIds,
    selectedPaletteId: r.paletteId,
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
  };
}

// Full StudioState shell (mirrors brain-workbench makeState) + generation data,
// so buildProductionExport + evaluateDirectorCabinet see the real .command.
function buildState(r: Recipe, res: ReturnType<typeof generateBatch>, beats: ReturnType<typeof ingestSource>) {
  const scenes = res.scenes.map((sc: PureScene) => ({
    id: sc.id,
    architecture: sc.architecture,
    imagePrompt: sc.imagePrompt,
    motionPrompt: sc.motionPrompt,
    voiceOver: sc.voiceOver,
    sunoBrief: sc.sunoBrief,
    durationSec: sc.durationSec,
    duration: sc.duration,
    intensity: sc.intensity,
    phaseName: sc.phaseName,
    handoff: sc.handoff,
    onScreenText: sc.onScreenText,
  }));
  const report = sourceIntegrity(r.rawSource, beats);
  return {
    selectedProjectId: 'jury',
    projectTopic: r.topic,
    projectClass: r.projectClass,
    sceneCount: scenes.length,
    cast: '',
    location: '',
    subject: '',
    recipeScenes: [],
    selectedWorldId: r.worldId,
    selectedPropId: r.propId,
    selectedRefIds: r.refIds,
    activePreviewRefId: '',
    selectedPaletteId: r.paletteId,
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
    phase0PresetId: '',
    directorChoices: {},
    directorBrief: '',
    voSyncMode: 'FREE' as const,
    osTextMode: 'AUTO' as const,
    rawSource: r.rawSource,
    sourceBeats: beats,
    sourceReport: report,
    scenes,
    agentBrief: res.agentBrief ?? '',
    agentPackets: res.agentPackets ?? null,
    selectedSceneId: null,
    isGenerating: false,
    lastError: null,
    beatMode: 'Dengeli' as const,
    workingMode: 'Standart' as const,
    beatKeeps: {},
    beatAnalysis: null,
    beatHistory: [],
    personalMode: false,
    currentStep: 'qa' as const,
    setField: () => {},
    togglePersonalMode: () => {},
  } as any;
}

const summaryLines: string[] = [];

for (const r of RECIPES) {
  const beats = ingestSource(r.rawSource);
  const brief = buildBrief(r, beats);
  const res = generateBatch(brief);

  if (res.status === 'BLOCKED') {
    const msg = res.contractGate.findings.map((f) => `${f.code}: ${f.message}`).join(' · ');
    summaryLines.push(`❌ ${r.key} BLOCKED — ${msg}`);
    fs.writeFileSync(path.join(OUT, `${r.key}.BLOCKED.txt`), `${r.label}\n\nBLOCKED: ${msg}\n`, 'utf8');
    continue;
  }

  const state = buildState(r, res, beats);
  const command = buildProductionExport(state);
  const cabinet = evaluateDirectorCabinet(state);
  const surgeon = cabinet.find((t) => t.skill === 'prompt_surgeon');
  const world = DATA.worlds.find((w) => w.id === r.worldId);

  // ── Jüri paketi: insan-okunur markdown (per-sahne prompt + brief + refDNA + .command özeti) ──
  const md: string[] = [];
  md.push(`# JÜRİ PAKETİ — ${r.label}\n`);
  md.push(`**Register:** ${r.register} · **World:** ${r.worldId} (${world?.name ?? '?'}, group ${world?.group ?? '?'})`);
  md.push(`**Refs:** ${r.refIds.join(', ')} · **Palette:** ${r.paletteId || '(native_world)'} · **Path:** ${r.projectClass} · **Material:** ${r.propId}`);
  md.push(`**Engine:** image=nano_banana_2 · motion=kling_3 (Kling 3.0)`);
  md.push(`**Kaynak bütünlüğü:** coverage=${state.sourceReport.coverage}% ok=${state.sourceReport.ok} · beats=${beats.length}`);
  md.push(`**Contract gate:** ${res.contractGate.status}`);
  md.push(`**prompt_surgeon:** success=${surgeon?.success} level=${surgeon?.level ?? '-'} → "${surgeon?.text ?? '(yok)'}"`);
  const blockingCabinet = cabinet.filter((t) => !t.success && ['Medium', 'Challenging', 'Legendary', 'Godly'].includes(String(t.level)));
  md.push(`**Cabinet blocking bulgular:** ${blockingCabinet.length === 0 ? 'YOK' : blockingCabinet.map((t) => `${t.skill}/${t.level}`).join(', ')}`);
  md.push('');

  md.push(`## 1) FINAL BRIEF (buildAgentBrief — pipeline'ın Claude'a verdiği çerçeve)\n`);
  md.push('```');
  md.push(res.agentBrief ?? '(agentBrief yok)');
  md.push('```\n');

  // referans DNA/anchor (nöron-sync) — .command scenes[0].refDna/paletteLight
  const s0 = command.scenes?.[0] as any;
  md.push(`## 2) NÖRON-SYNC — Referans DNA/anchor + Palet (fiziksel ışık) [.command'dan]\n`);
  md.push('**refDna (verbatim, .command scenes[].refDna):**');
  md.push('```');
  md.push(s0?.refDna || '(refDna boş)');
  md.push('```');
  md.push('**paletteLight (hex-siz fiziksel ışık dili):**');
  md.push('```');
  md.push(s0?.paletteLight || '(paletteLight boş — native world)');
  md.push('```\n');

  md.push(`## 3) PER-SAHNE IMAGE + MOTION PROMPT (gerçek generateBatch çıktısı)\n`);
  for (const sc of res.scenes) {
    md.push(`### Sahne ${sc.id} — ${sc.phaseName} (${sc.durationSec}s, intensity ${sc.intensity})`);
    md.push(`- **onScreenText:** ${sc.onScreenText === null ? 'null (temiz plaka + VO)' : `"${sc.onScreenText}"`}`);
    md.push(`- **VO:** ${sc.voiceOver}`);
    md.push('**IMAGE PROMPT:**');
    md.push('```');
    md.push(sc.imagePrompt);
    md.push('```');
    md.push('**MOTION PROMPT (frame-aware):**');
    md.push('```');
    md.push(sc.motionPrompt);
    md.push('```\n');
  }

  fs.writeFileSync(path.join(OUT, `${r.key}.jury.md`), md.join('\n'), 'utf8');
  // Ham .command JSON (jüri incelemesi için)
  fs.writeFileSync(path.join(OUT, `${r.key}.command.json`), JSON.stringify(command, null, 2), 'utf8');

  summaryLines.push(
    `✅ ${r.key} — scenes=${res.scenes.length} surgeon=${surgeon?.success} cabinetBlocking=${blockingCabinet.length} coverage=${state.sourceReport.coverage}%`,
  );
}

fs.writeFileSync(path.join(OUT, '_SUMMARY.txt'), summaryLines.join('\n') + '\n', 'utf8');
console.log(summaryLines.join('\n'));
console.log('\nJÜRİ PAKETİ →', OUT);
