/**
 * faz5-pilot.ts — FAZ 5 pilot paketi üretici (2026-07-04)
 *
 * İki gerçek reçeteyi rawSource yolundan (autoGroupBeats → generateBatch)
 * koşar ve Mami'nin kopyala-yapıştır çalışacağı üretim klasörlerini yazar:
 *
 *   ~/Desktop/FAZ5-PILOT/<slug>.mamilas/
 *     project.json            — mamilas.production.v2026 (tek doğruluk kaynağı)
 *     final_brief.md          — agentBrief (insan-okur)
 *     image_prompts/<id>.txt  — Nano Banana 2'ye yapıştırılacak start-frame promptu
 *     motion_drafts/<id>.txt  — FRAME-AWARE TASLAK (final motion, kare görülmeden yazılMAZ)
 *     images/                 — Mami onaylı+upscale'li kareleri buraya atar
 *     MOTION-CALISTIR.command — üretim ajanı (Pass B: kareye bakıp final motion yazar)
 *     MAMI-README.md          — adım adım akış
 *
 * Deterministik olmayan tek şey generatedAt (gerçek export). src/'a dokunmaz.
 * Run: npx tsx scripts/faz5-pilot.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { fileURLToPath } from 'node:url';

import { generateBatch, type BriefInput } from '../src/core/pure.js';
import { autoGroupBeats, sourceIntegrity } from '../src/core/source.js';
import { buildProductionExport, bundleSlug } from '../src/core/productionExport.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_ROOT = process.env.PILOT_OUT ?? path.join(os.homedir(), 'Desktop', 'FAZ5-PILOT');

interface PilotRecipe {
  title: string;
  projectTopic: string;
  projectClass: string;
  selectedWorldId: string;
  selectedRefIds: string[];
  selectedPaletteId: string;
  videoModel: string;
  rawSource: string;
  /** Human-required paths block without it — a live-action frame with nobody in it is not a frame. */
  cast?: string;
  /** The client's OWN brand. It is not an IP leak; it is the thing being advertised. */
  brandKitLock?: string;
}

const RECIPES: PilotRecipe[] = [
  {
    title: 'MİNERALLER — one_piece_toei (2D cel, EDU)',
    projectTopic: 'Mineraller — One Piece dünyasında yer bilimi',
    projectClass: 'ANIMATION_EDU', selectedWorldId: 'one_piece_toei',
    selectedRefIds: ['one_piece_sunny_adventure', 'onepiece_grandline_scale'],
    selectedPaletteId: '', videoModel: 'kling_3',
    rawSource: [
      'Ada bir yanardağın sırtına kurulmuştu; kayalar hâlâ yerin ısısını taşıyordu.',
      'Mineraller, yerkabuğunu oluşturan doğal katı maddelerdir; her birinin kendi kristal düzeni vardır.',
      'Kuvars altı köşeli sütunlar hâlinde büyür, tuz küp küp dizilir, mika ince yapraklara ayrılır.',
      'Sertliklerini karşılaştırmak için sürterler: elmas her şeyi çizer, talk tırnakla dağılır.',
      'Magma yavaş soğursa kristaller büyür, hızlı soğursa küçücük kalır.',
    ].join('\n'),
  },
  {
    title: '15 TEMMUZ — civic_promo_real (gerçek insan, GECE)',
    projectTopic: '15 Temmuz — Anma Filmi',
    projectClass: 'LIVE_ACTION_CORPORATE', selectedWorldId: 'civic_promo_real',
    selectedRefIds: [], selectedPaletteId: '', videoModel: 'kling_3',
    cast: 'Sıradan insanlar: orta yaşlı bir esnaf, genç bir kadın, bir çocuk — gündelik sade kıyafet; kimse üniformalı değil',
    rawSource: [
      'O gece şehir uyumadı; pencereler tek tek aydınlandı.',
      'İnsanlar sokağa indi — kimi terliğiyle, kimi iş önlüğüyle.',
      'Meydanda yan yana durdular; birbirlerini tanımıyorlardı.',
      'Sabah olduğunda kaldırımlar temizlendi, hayat kaldığı yerden başladı.',
    ].join('\n'),
  },
  {
    title: 'TESLA — automotive_hero_real (DOĞRU DÜNYA, marka KİLİTLİ)',
    projectTopic: 'Tesla — Elektrikli Otomobil Reklamı',
    projectClass: 'PRODUCT_HERO', selectedWorldId: 'automotive_hero_real',
    selectedRefIds: [], selectedPaletteId: '', videoModel: 'kling_3',
    brandKitLock: 'Tesla — müşterinin KENDİ markası. Logo ve gövde geometrisi dondurulmuş referanstır.',
    cast: 'Tek sürücü, yüzü net görünmez',
    rawSource: [
      'Şehir uyanmamıştı; garajın kapağı sessizce açıldı.',
      'Motor sesi yoktu — sadece lastiğin asfalta ilk teması.',
      'Gün batarken kapı kapandı ve geriye tek bir iz kaldı: sessizlik.',
    ].join('\n'),
  },
  {
    title: 'FOTOSENTEZ — pixar_3d_edu (3D CG, EDU)',
    projectTopic: 'Fotosentez',
    projectClass: 'ANIMATION_EDU', selectedWorldId: 'pixar_3d_edu',
    selectedRefIds: [], selectedPaletteId: '', videoModel: 'kling_3',
    rawSource: [
      'Işık yaprağa çarptığında görünmez bir fabrika çalışmaya başlar.',
      'Kloroplastların içindeki klorofil güneş ışığını yakalar ve enerjiye çevirir.',
      'Su kökten yukarı tırmanır, karbondioksit gözeneklerden içeri süzülür.',
      'Bu üç malzeme birleşir ve ortaya şeker ile oksijen çıkar.',
    ].join('\n'),
  },
  {
    title: 'UKİYO-E — ukiyo_e_print (DÜZ IŞIK, baskı)',
    projectTopic: 'Dalga — Deniz ve Sabır',
    projectClass: 'STYLIZED_PREMIUM', selectedWorldId: 'ukiyo_e_print',
    selectedRefIds: [], selectedPaletteId: '', videoModel: 'kling_3',
    rawSource: [
      'Dalga uzaktan tek bir çizgi gibi görünür.',
      'Yaklaştıkça yükselir ve kendi ağırlığını taşıyamaz hale gelir.',
      'Kırıldığı an, denizin bütün gücü tek bir köpük hattına iner.',
    ].join('\n'),
  },
  {
    title: 'BELGESEL — chivo_naturalist_handheld (gerçek insan)',
    projectTopic: 'Zanaatkâr — Son Bakırcı',
    projectClass: 'DOCUMENTARY_REALISM', selectedWorldId: 'chivo_naturalist_handheld',
    selectedRefIds: [], selectedPaletteId: '', videoModel: 'kling_3',
    cast: 'Yetmişlerinde bir bakırcı usta, yıpranmış önlük, kalın parmaklar',
    rawSource: [
      'Atölyenin kapısı her sabah aynı saatte açılır.',
      'Çekiç bakıra iner ve ses bütün sokağa yayılır.',
      'Elin bildiği şeyi kimse kâğıda yazamadı.',
    ].join('\n'),
  },
  {
    title: 'KURUMSAL — kurumsal_brand_film (kurumsal, insan)',
    projectTopic: 'Kurumsal Tanıtım — Fabrika',
    projectClass: 'LIVE_ACTION_CORPORATE', selectedWorldId: 'kurumsal_brand_film',
    selectedRefIds: [], selectedPaletteId: '', videoModel: 'kling_3',
    cast: 'Vardiya çalışanları, iş güvenliği ekipmanlı; yaş aralığı geniş',
    rawSource: [
      'Fabrika gece vardiyasında da durmaz.',
      'Her parça elden geçer, hiçbir hat insansız çalışmaz.',
      'Sabah ilk kamyon yüklendiğinde iş biter.',
    ].join('\n'),
  },
  {
    title: 'WHITEBOARD — whiteboard_explainer (çizim, EDU)',
    projectTopic: 'Bileşik Faiz',
    projectClass: 'ANIMATION_EDU', selectedWorldId: 'whiteboard_explainer',
    selectedRefIds: [], selectedPaletteId: '', videoModel: 'kling_3',
    rawSource: [
      'Bir lira bugün yatırılır ve bir yıl bekler.',
      'Kazanılan faiz anaparaya eklenir; ertesi yıl faiz de faiz kazanır.',
      'Yirmi yıl sonra büyüyen şey para değil, zamandır.',
    ].join('\n'),
  },
  {
    title: 'DOĞA — nature_doc_real (uzun lens, mevcut ışık)',
    projectTopic: 'Sazlık — Bir Sabahın Sessizliği',
    projectClass: 'DOCUMENTARY_REALISM', selectedWorldId: 'nature_doc_real',
    selectedRefIds: [], selectedPaletteId: '', videoModel: 'kling_3',
    rawSource: [
      'Balıkçıl sazlığın kıyısında kıpırdamadan durur.',
      'Sis kalkarken güneş arkadan vurur ve her tüy kenarı ışık alır.',
      'Baş aniden iner; su yüzeyi kırılır.',
    ].join('\n'),
  },
  {
    title: 'BİLİM — science_viz_real (mikro, enstrüman ışığı)',
    projectTopic: 'Hücre Zarı',
    projectClass: 'ANIMATION_EDU', selectedWorldId: 'science_viz_real',
    selectedRefIds: [], selectedPaletteId: '', videoModel: 'kling_3',
    rawSource: [
      'Zar iki katmanlı bir yağ tabakasıdır; içeriyi dışarıdan ayırır.',
      'Bir kesecik yaklaşır ve zara temas eder.',
      'İki zar birleşir, içerik hücreye boşalır.',
    ].join('\n'),
  },
  {
    title: 'ARŞİV — archival_newsreel (16mm gren, kısa latitude)',
    projectTopic: 'Bir Sabah — Arşiv',
    projectClass: 'DOCUMENTARY_REALISM', selectedWorldId: 'archival_newsreel',
    selectedRefIds: [], selectedPaletteId: '', videoModel: 'kling_3',
    cast: 'Orta yaşlı bir esnaf, iş önlüğü; kimse kameraya bakmıyor',
    rawSource: [
      'Kepenk sabahın ilk ışığında kalkar.',
      'Sokak yavaşça uyanır; kimse acele etmez.',
      'Işık dükkânın içine girer ve tozu görünür kılar.',
    ].join('\n'),
  },
  {
    title: 'TEKNİK — technical_cutaway (mekanizma kesiti)',
    projectTopic: 'İçten Yanmalı Motor',
    projectClass: 'ANIMATION_EDU', selectedWorldId: 'technical_cutaway',
    selectedRefIds: [], selectedPaletteId: '', videoModel: 'kling_3',
    rawSource: [
      'Piston silindirin içinde aşağı iner ve karışımı emer.',
      'Supap kapanır; piston yukarı çıkarak karışımı sıkıştırır.',
      'Kıvılcım çakar ve genleşen gaz pistonu aşağı iter.',
    ].join('\n'),
  },
  {
    title: 'ANIME — shinkai_photoreal_anime (cel karakter, foto arka plan)',
    projectTopic: 'Hemzemin Geçit',
    projectClass: 'STYLIZED_PREMIUM', selectedWorldId: 'shinkai_photoreal_anime',
    selectedRefIds: [], selectedPaletteId: '', videoModel: 'kling_3',
    cast: 'Genç bir öğrenci, sade üniforma',
    rawSource: [
      'Bariyer iner ve şehir bir anlığına durur.',
      'Tren geçerken ışık vagonların arasından kırılır.',
      'Bariyer kalkar; yol yeniden açılır.',
    ].join('\n'),
  },
  {
    title: 'TARİH — period_reconstruction (yalnız dönemin ışığı)',
    projectTopic: 'Dokuma — Bir Zanaatın Sabrı',
    projectClass: 'DOCUMENTARY_REALISM', selectedWorldId: 'period_reconstruction',
    selectedRefIds: [], selectedPaletteId: '', videoModel: 'kling_3',
    cast: 'Elleri yıpranmış bir dokumacı; yüzü net görünmez',
    rawSource: [
      'Kandil yanar ve odanın yalnız bir köşesini aydınlatır.',
      'El ipliği geçirir; tezgâh ağır ağır ilerler.',
      'Alev eğilir ve bütün gölgeler onunla eğilir.',
    ].join('\n'),
  },
];

function mamiReadme(title: string, sceneCount: number): string {
  return `# ${title}

## SIRA — bu sırayı bozma

**0. ÖNCE REFERANSLARI KOY.** \`brand_refs/\` klasörüne:
   - Marka kilidi varsa: müşterinin gerçek logosu + ürünün gerçek geometrisi (model, renk, jant, kabin).
     Prompt "birebir çiz, ezberden çizme" diyecek — bunu metin taşıyamaz.
   - Tekrarlayan kişi varsa: kişi başına bir yüz referansı. "Orta yaşlı esnaf" bir ROLÜ tarif eder,
     bir İNSANI değil; uydurulan yüz sonraki karede başka yüze kayar.
   Eksikse ajan \`REFERENCE REQUIRED\` yazıp DURACAK — ve haklı olacak.

**1. \`MOTION-CALISTIR.command\`'a ÇİFT TIKLA → Pass A.**
   Ajan her shot için önce \`ledger/<id>.md\` (bu kare neyi kanıtlar · ne görünmek zorunda ·
   ne metafora çevrilemez · öncekinden ne taşınır), SONRA \`image_prompts/<id>.txt\` yazar.
   \`scene_briefs/\` site'in ÇERÇEVESİDİR — ajan onu kopyalamaz, ondan YAZAR. Sonra DURUR.

**2. Start frame üret:** \`image_prompts/<id>.txt\` içeriğini **Nano Banana 2**'ye yapıştır.
   Beğendiğin kareyi \`images/<id>.png\` olarak kaydet. Beğenmediysen prompt yanlıştır — şimdi düzelt, sonra değil.

**3. \`.command\`'a tekrar gir, "resimler hazır" yaz → Pass B.**
   Ajan her kareyi AÇAR, verdiği söze karşı yargılar ve \`frame_checks/<id>.md\`'ye
   FRAME_PASS ya da IMAGE_MISMATCH yazar. **FRAME_PASS yoksa motion DOĞMAZ.** Geçmeyen kare yeniden üretilir.

**4. Motion (deneme):** FRAME_PASS alan shot'ların \`motion/<id>.txt\`'sini **Higgsfield**'da dene —
   krediler sonsuz, varyasyonları orada yak. \`motion/<id>.DRAFT.txt\` kare görülmeden yazılmış
   taslaktır, FİNAL DEĞİLDİR.

**5. Final:** kazanan take'i **Kling 3.0**'da çek (PAID — sadece valide edilmiş take).

**6. Ses:** müzik **Suno** (\`suno.txt\`), anlatım **ElevenLabs** (tek anlatıcı; ekranda kimse konuşmaz).

${sceneCount} sahne. Premiere'de sadece kesme/sıralama + VO/müzik yerleştirme.
`;
}

for (const recipe of RECIPES) {
  const beats = autoGroupBeats(recipe.rawSource, 'Dengeli', recipe.videoModel);
  const brief: BriefInput = {
    projectTopic: recipe.projectTopic,
    projectClass: recipe.projectClass,
    sceneCount: beats.length,
    cast: recipe.cast ?? '',
    selectedWorldId: recipe.selectedWorldId,
    selectedPropId: 'native_world',
    selectedRefIds: recipe.selectedRefIds,
    selectedPaletteId: recipe.selectedPaletteId,
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: recipe.videoModel,
    // The client's own brand must reach the engine — an ad about a brand that may not name it
    // is not an ad. brandKitLock is the approval; without it the firewall (correctly) scrubs.
    brandKitLock: recipe.brandKitLock ?? '',
    rawSource: recipe.rawSource,
    sourceBeats: beats,
  };
  const result = generateBatch(brief);
  if (result.status !== 'GENERATED') {
    console.error(`✗ ${recipe.title}: BLOCKED`, result.contractGate.findings);
    process.exitCode = 1;
    continue;
  }

  const state = {
    selectedProjectId: 'faz5_pilot',
    projectTopic: recipe.projectTopic,
    projectClass: recipe.projectClass,
    sceneCount: result.scenes.length,
    cast: recipe.cast ?? '',
    selectedWorldId: recipe.selectedWorldId,
    selectedPropId: 'native_world',
    selectedRefIds: recipe.selectedRefIds,
    selectedPaletteId: recipe.selectedPaletteId,
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: recipe.videoModel,
    brandKitLock: recipe.brandKitLock ?? '', mood: '', cameraEnergy: '', timeLight: '', transition: '',
    musicVibe: '', pov: '', signature: '', leitmotif: '', tempoCurve: '',
    directorBrief: '',
    rawSource: recipe.rawSource,
    sourceBeats: beats,
    sourceReport: sourceIntegrity(recipe.rawSource, result.scenes),
    beatKeeps: {}, beatAnalysis: null,
    beatMode: 'Dengeli' as const, workingMode: 'Standart' as const,
    scenes: result.scenes,
    agentBrief: result.agentBrief ?? '',
    agentPackets: result.agentPackets ?? null,
    personalMode: false,
  } as unknown as Parameters<typeof buildProductionExport>[0];

  const production = buildProductionExport(state);
  const slug = bundleSlug(recipe.projectTopic);
  const dir = path.join(OUT_ROOT, `${slug}.mamilas`);

  // The folder is the CONTRACT the .command runs on. It changed: the agent now writes a
  // ledger before any prompt, the raw Nano generation is kept apart from the approved
  // Magnific upscale, and every frame gets a written verdict before motion may exist.
  // A bundle that pre-creates the old three folders quietly teaches the agent the old flow.
  for (const folder of ['brand_refs', 'ledger', 'image_prompts', 'images', 'frame_checks', 'motion', 'scene_briefs']) {
    fs.mkdirSync(path.join(dir, folder), { recursive: true });
  }

  fs.writeFileSync(path.join(dir, 'project.json'), JSON.stringify(production, null, 2), 'utf-8');
  fs.writeFileSync(path.join(dir, 'final_brief.md'), result.agentBrief ?? '', 'utf-8');
  for (const scene of result.scenes) {
    // NOT image_prompts/ — that file is the agent's to AUTHOR, after it has written the
    // scene's ledger. Handing it a finished prompt is precisely the "site writes the prompt"
    // flow the frame gate exists to replace. What the site owes it is the BRIEF.
    fs.writeFileSync(
      path.join(dir, 'scene_briefs', `${scene.id}.txt`),
      `# SAHNE ${scene.id} — BRIEF (çerçeve), bitmiş prompt DEĞİL.\n`
      + `# Ajan önce ledger/${scene.id}.md yazar (proves · mustShow · noMetaphorFor · carryOver),\n`
      + `# SONRA image_prompts/${scene.id}.txt'yi bundan AUTHOR eder. Kopyalamaz.\n\n${scene.imagePrompt}`,
      'utf-8',
    );
    fs.writeFileSync(
      path.join(dir, 'motion', `${scene.id}.DRAFT.txt`),
      `# TASLAK — final motion, images/${scene.id}.png GÖRÜLMEDEN yazılmaz (FRAME-AWARE yasa).\n`
      + `# Ve frame_checks/${scene.id}.md FRAME_PASS demeden motion/${scene.id}.txt DOĞMAZ.\n`
      + `# Bu dosya yalnızca Higgsfield deneme turu için bir reçetedir.\n\n${scene.motionPrompt}`,
      'utf-8',
    );
  }
  // Paket KENDİ KENDİNE YETER olmalı: Mami onu Mac'te de Windows'ta da çift tıklayabilmeli.
  // Kit = tek mantık (runner.mjs) + yasa (kick/) + İKİ launcher. Biri eksikse paket o
  // makinede ölü demektir.
  const KIT = path.join(ROOT, 'agents', 'production');
  fs.mkdirSync(path.join(dir, 'kick'), { recursive: true });
  for (const kick of fs.readdirSync(path.join(KIT, 'kick'))) {
    fs.copyFileSync(path.join(KIT, 'kick', kick), path.join(dir, 'kick', kick));
  }
  fs.copyFileSync(path.join(KIT, 'runner.mjs'), path.join(dir, 'runner.mjs'));
  for (const launcher of ['MOTION-CALISTIR.command', 'MOTION-CALISTIR.bat']) {
    fs.copyFileSync(path.join(KIT, launcher), path.join(dir, launcher));
  }
  fs.chmodSync(path.join(dir, 'MOTION-CALISTIR.command'), 0o755);
  fs.writeFileSync(path.join(dir, 'MAMI-README.md'), mamiReadme(recipe.title, result.scenes.length), 'utf-8');

  console.log(`✓ ${recipe.title} → ${dir} (${result.scenes.length} sahne)`);
}
console.log('FAZ5 pilot paketi hazır:', OUT_ROOT);
