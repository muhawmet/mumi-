// M4 asset teslim raporu — ASSET_BRIEF_DRAFT.md §2–3 sözleşmesi.
// Varsayılan: raporlar, exit 0 (kod kapısı asset beklemez).
// --strict: eksik/yanlış boyutta exit 1 (yalnız asset KABULÜNDE koşulur).
import { existsSync, readFileSync } from 'fs';

const EXPECTED = [
  ['public/assets3d/card-hero-archetype.webp', 1024, 1448],
  ['public/assets3d/card-detective-archetype.webp', 1024, 1448],
  ['public/assets3d/card-arcane-archetype.webp', 1024, 1448],
  ['public/assets3d/card-explorer-archetype.webp', 1024, 1448],
  ['public/assets3d/table-top.webp', 1024, 1024],
  ['public/assets3d/floor-disc.webp', 2048, 2048],
  ['public/assets3d/backdrop-sky.webp', 2048, 1024],
  ['public/assets3d/logo-card.webp', 1024, 1448],
  ['public/assets3d/wall-plaster.webp', 2048, 2048],
  ['public/assets/characters/skill_volition.png', 512, 512],
  ['public/assets/characters/skill_perception.png', 512, 512],
  ['public/assets/characters/skill_shivers.png', 512, 512],
  ['public/assets/characters/skill_logic.png', 512, 512],
  ['public/assets/characters/skill_visual_calculus.png', 512, 512],
  ['public/assets/characters/skill_drama.png', 512, 512],
  ['public/assets/characters/skill_case_ledger.png', 512, 512],
  ['public/assets/characters/harry_du_bois.png', 512, 512],
  ['public/assets/characters/kim_kitsuragi.png', 512, 512],
  ['public/assets/characters/skill_conceptualization.png', 512, 512],
  ['public/assets/characters/skill_encyclopedia.png', 512, 512],
  ['public/assets/characters/skill_inland_empire.png', 512, 512],
  ['public/assets/characters/skill_prompt_surgeon.png', 512, 512],
  ['public/assets/characters/skill_rhetoric.png', 512, 512],
  ['public/assets/characters/skill_electrochemistry.png', 512, 512],
];

function pngSize(buf) {
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
function webpSize(buf) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null;
  const fourcc = buf.toString('ascii', 12, 16);
  if (fourcc === 'VP8X') return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
  if (fourcc === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
  if (fourcc === 'VP8L') {
    const bits = buf.readUInt32LE(21);
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

let missing = 0, wrong = 0;
for (const [path, w, h] of EXPECTED) {
  if (!existsSync(path)) { missing++; console.log(`  EKSİK   ${path} (beklenen ${w}×${h})`); continue; }
  const buf = readFileSync(path);
  const size = path.endsWith('.png') ? pngSize(buf) : webpSize(buf);
  if (!size) { wrong++; console.log(`  BOZUK   ${path} (header okunamadı)`); continue; }
  if (size.w !== w || size.h !== h) { wrong++; console.log(`  BOYUT   ${path} ${size.w}×${size.h} ≠ ${w}×${h}`); continue; }
  console.log(`  ✓       ${path} ${size.w}×${size.h}`);
}
console.log(`\n[assets3d] ${EXPECTED.length - missing - wrong}/${EXPECTED.length} hazır · ${missing} eksik · ${wrong} format sorunu`);

const PRESET_PLATES = [
  'product_brand.webp',
  'edu_explainer.webp',
  'cinematic_story.webp',
  'social_short.webp',
  'doc_human.webp',
  'corp_public.webp',
  'event_campaign.webp',
  'stylized_game.webp',
  'food_beverage.webp',
  'edu_promo.webp',
];

const PLATES_DIR = 'public/assets3d/presets';
let platesFound = 0;
console.log('\n[preset-plates] Phase 0 arketip görselleri (bilgi — eksik olması normal):');
for (const name of PRESET_PLATES) {
  const path = `${PLATES_DIR}/${name}`;
  if (existsSync(path)) {
    platesFound++;
    console.log(`  ✓       ${path}`);
  } else {
    console.log(`  bekler  ${path}`);
  }
}
console.log(`[preset-plates] ${platesFound}/${PRESET_PLATES.length} plate mevcut — eksikler hata sayılmaz.`);

// — World kapakları (T4, kademeli dolum: eksik = bilgi, hata DEĞİL — hiçbir modda fatal olmaz) —
const surgery = JSON.parse(readFileSync(new URL('../src/core/SURGERY_DATA.json', import.meta.url), 'utf8'));
const worldCoverDir = new URL('../public/assets3d/worlds/', import.meta.url);
let coverPresent = 0;
const coverMissing = [];
for (const w of surgery.worlds) {
  if (existsSync(new URL(`${w.id}.webp`, worldCoverDir))) coverPresent += 1;
  else coverMissing.push(`${w.id}.webp`);
}
console.log(`\n[worlds] kapak: ${coverPresent}/${surgery.worlds.length} teslim edildi`);
if (coverMissing.length) console.log(`[worlds] bekleyen: ${coverMissing.slice(0, 6).join(', ')}${coverMissing.length > 6 ? ` … (+${coverMissing.length - 6})` : ''}`);

// Strict kararı EN SONDA: bilgi bölümleri (preset-plates, worlds) her modda basılır; yalnız sözleşmeli asset'ler fatal.
if (process.argv.includes('--strict') && (missing || wrong)) process.exit(1);
