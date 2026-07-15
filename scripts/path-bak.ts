/**
 * Bir PATH'in (üretim yolunun) GERÇEK promptunu bas — fixture değil, generateBatch'in kendi metni.
 *
 * prompt-bak.ts `projectClass:'ders'` diye SABİTLENMİŞTİ: bugüne kadarki bütün denetimler
 * EDU yolundan aktı, 13 gerçek/kurumsal path (LIVE_ACTION_CORPORATE, HEALTH_PUBLIC_SERVICE,
 * HUMAN_TESTIMONIAL, DOCUMENTARY_REALISM …) hiç sınanmadı. Bu araç o kör noktayı kapatır.
 *
 * Kullanım:
 *   npx tsx scripts/path-bak.ts <PATH_ID> [worldId] [paletteId] [--motion] [--brief]
 *
 * Örnekler:
 *   npx tsx scripts/path-bak.ts HEALTH_PUBLIC_SERVICE
 *   npx tsx scripts/path-bak.ts LIVE_ACTION_CORPORATE chivo_naturalist_handheld desaturated_cinematic
 *   npx tsx scripts/path-bak.ts DOCUMENTARY_REALISM --motion
 *   npx tsx scripts/path-bak.ts ULTRAREAL_COMMERCIAL --brief
 *
 * Path listesi:
 *   npx tsx -e "console.log(require('./src/core/SURGERY_DATA.json').paths.map(p=>p.id).join('\n'))"
 *
 * mamilas-audit kuralı: "vitest geçti" ≠ doğrulandı. Prompt'u GÖZLE oku.
 */
import { DATA, generateBatch } from '../src/core/pure';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const positional = args.filter((a) => !a.startsWith('--'));

const pathId = positional[0] || 'LIVE_ACTION_CORPORATE';
const path = DATA.paths.find((p) => p.id === pathId);
if (!path) {
  console.error(`Bilinmeyen path: ${pathId}`);
  console.error(`Mevcut: ${DATA.paths.map((p) => p.id).join(', ')}`);
  process.exit(1);
}

// Path kendi varsayılan dünyasını/paletini taşır; kullanıcı ezebilir.
const worldId = positional[1] || path.defaultWorld;
const paletteId = positional[2] || path.defaultPalette || 'native_world';

// Gerçek path'ler kurumsal/insan konulu. Konu path'in kendi diline göre seçilir ki
// "EDU konusu real path'e sokulmuş" yapaylığı bulguları kirletmesin.
const TOPIC: Record<string, string> = {
  LIVE_ACTION_CORPORATE: 'Belediyenin yeni su arıtma tesisi şehre ne kazandırıyor?',
  HEALTH_PUBLIC_SERVICE: 'Grip aşısı olmak neden önemli?',
  HUMAN_TESTIMONIAL: 'Bir esnaf, mahallesindeki dönüşümü anlatıyor.',
  DOCUMENTARY_REALISM: 'Sabah balıkçı halinde bir gün.',
  PRODUCT_HERO: 'Yeni kablosuz kulaklığın malzeme ve yüzey kalitesi.',
  ULTRAREAL_COMMERCIAL: 'Elektrikli araç, şehir dışında bir sabah.',
  FASHION_EDITORIAL: 'Yün paltonun dokusu ve düşüşü.',
  FOOD_MACRO: 'Sıcak çorbanın buharı ve dokusu.',
  ARCHITECTURE_REAL_ESTATE: 'Yeni kültür merkezinin iç mekân ışığı.',
  TECH_MEDICAL_PRECISION: 'Kan şekeri ölçüm cihazı nasıl çalışır?',
  SOCIAL_REELS_REALISM: 'Kahve dükkânının sabah rutini.',
  AUTOMOTIVE_MOBILITY: 'Elektrikli otobüs şehir hattında.',
  TOURISM_DESTINATION: 'Kapadokya’da gün doğumu.',
  ANIMATION_EDU: 'Yanardağ nasıl patlar?',
  STYLIZED_PREMIUM: 'Kayıp adaya açılan gemi.',
};

const projectTopic = TOPIC[pathId] || 'Konu';

const result = generateBatch({
  projectTopic,
  projectClass: pathId,
  sceneCount: 3,
  cast: '',
  selectedWorldId: worldId,
  selectedPropId: 'none',
  selectedRefIds: [],
  selectedPaletteId: paletteId,
  selectedMusicId: '',
  imageModel: 'nano_banana_2',
  videoModel: 'kling_3',
}) as never as {
  status: string;
  contractGate?: unknown;
  agentBrief?: string;
  scenes: { imagePrompt: string; motionPrompt: string }[];
};

console.log(`PATH: ${pathId}  ·  WORLD: ${worldId}  ·  PALETTE: ${paletteId}`);
console.log(`TOPIC: ${projectTopic}`);
console.log(`REQUIRED : ${path.required ?? '—'}`);
console.log(`FORBIDDEN: ${path.forbidden ?? '—'}`);
console.log('─'.repeat(100));

if (result.status !== 'GENERATED') {
  console.log('BLOCKED:', JSON.stringify(result.contractGate, null, 2));
  process.exit(0);
}

if (flags.has('--brief')) {
  console.log(result.agentBrief ?? '(agentBrief yok)');
} else if (flags.has('--motion')) {
  console.log(result.scenes[0].motionPrompt);
} else {
  console.log(result.scenes[0].imagePrompt);
}
