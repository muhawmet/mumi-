#!/usr/bin/env node
// SAHNE METNİ — teslim edilen prompt bloğunu MOTORA GİDEN metne çevirir.
//
// NEDEN VAR — 2026-08-07'de ölçülen darboğaz:
// Batch'in hızını motor belirlemiyor, YAZIM belirliyor. 54 karelik bir sette her blok
// motora gitmeden önce iki şey gerekiyor: (1) her karenin miras alması gereken SAHNE YASASI,
// (2) `@handle`'ların motorun anlayacağı işaretçiye çevrilmesi — Magnific'in kütüphanesi boş
// olduğu için `@efe` orada iki ölü token, kimlik yalnız REFERANS GÖRSELİYLE geçiyor.
// Bu elle yapılınca kare başına dakikalar, script'le milisaniyeler.
//
//   node scripts/sahne-metni.mjs "<proje>" [--kare 5,7,9] [--json]
//
// Çıktı: her kare için { n, prompt, refs[] } — `refs` element rafındaki creation id'leri.
// BU SCRIPT KARE BASMAZ. Metni kurar; basmak ajanın, hüküm Mami'nin.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const RAF_YOLU = path.join(REPO_ROOT, 'artifacts', 'element-rafi.json');
export const INBOX = path.join(REPO_ROOT, 'agents', 'COMMAND-INBOX');

export class SahneError extends Error {}
const fail = (mesaj) => { throw new SahneError(mesaj); };

/**
 * `@handle` motora giden İngilizce işaretçiye çevrilir. Referans görseli ayrıca geçtiği için
 * cümle kimliği TARİF ETMEZ, yalnız hangi referansın kastedildiğini söyler — tarif edilirse
 * referans ezilir (ölçüldü: tarif edilen @efe yerine motor başka çocuk üretiyor).
 */
export const HANDLE_SOZLUGU = Object.freeze({
  efe: 'the boy from the reference images',
  mira: 'the girl from the reference images',
  kumes: 'the chicken coop from the reference images',
  ahir: 'the barn corner from the reference images',
  golet: 'the pond from the reference images',
  tavuk: 'the hen from the reference images',
  kedi: 'the mother cat and her four kittens from the reference images',
  balik: 'the fish and their eggs from the reference images',
  tirtil: 'the caterpillar, cocoon and butterfly from the reference images',
  kurbaga: 'the tadpole and adult frog from the reference images',
  sperm: 'the sperm cell world from the reference images',
  'yumurta-hucresi': 'the egg cell world from the reference images',
  mikroskop: 'the microscope from the reference images',
});

/**
 * HER KAREYE eklenen sahne yasası. Üç maddesi de K01'in üç denemesiyle ölçüldü:
 * maket → gerçek yer, eşit ölçek → gerçek ölçek, düz panel → devam eden dünya.
 */
export const SAHNE_YASASI = [
  'Use the reference images ONLY for identity, material and colour. For a character keep the same face, hair, build and clothes. For a place or an object take only its material and colour — do NOT copy its framing or staging, restage everything freely into one continuous location.',
  '',
  'REAL SCALE, non-negotiable: nothing is scaled up for readability. Every creature and object holds its true real-world size next to the others — a hen reaches a child\'s knee, a basket his shin, an animal five paces away is small in frame. Real relative size is what makes a place feel large.',
  '',
  'THE WORLD DOES NOT STOP AT THE FRAME: write distance behind everything — a wall, a tree, morning haze, open sky — so no flat panel or backdrop can appear behind the subject.',
  '',
  'A LIVED-IN PLACE, NOT A SET: the ground is packed earth or worn stone with debris on it, never clean tiling. Foreground occlusion is required — a few stems, a post edge or a near surface cuts the closest edge of frame, heavily out of focus. Nothing is new or clean: dust, wear, chipped edges, fallen straw, smudged timber. Skin stays matte and low-specular with pores and asymmetry, never a smooth waxy surface.',
  '',
  'A few object names inside the description may still appear in Turkish. Treat each one as the ordinary rustic object it names and render that object faithfully in the scene. NEVER render a Turkish word as visible writing unless the TEXT line below explicitly asks for that exact word.',
  '',
  'IF THIS FRAME CARRIES A WORD: the word is made OF the scene\'s own material and of nothing else — never a hanging plaque, tag, banner or floating caption. It takes whatever this particular place is made of and is different every time: pressed into an eggshell, laid out in straw stalks, worn into bone, scratched into wet stone, formed by pebbles under water, burnt into a plank only if the frame is actually made of planks. Turkish only, exact diacritics, square to camera, on ONE still surface, never on anything that moves.',
].join('\n');

/** Mikro/kavram sahnelerinde ek yasa — ihtişam mimari ölçekten gelir, nesneyi büyütmekten değil. */
export const MIKRO_YASASI = [
  '',
  'MICROSCOPIC SCALE LAW: the hero form enters the frame as TERRAIN or a PLANET — its surface curves away to a horizon and its texture reads as landscape. Behind it a receding SERIES of the same kind marches into the distance, each smaller and softer, so the space never ends at the frame edge. One colour regime with exactly one accent. No hanging plaque, tag or sign exists in this world; a concept is carried by the thing itself.',
].join('\n');

const MIKRO_ISARETLERI = /macro lens|microscopic|conceptual (fluid|space)|cell|sperm|hücre|zigot/i;

/** `# K12 — "…"` başlıklı blokları ayırır. Blok gövdesi `-----` çitleri arasındadır. */
export function bloklariAyir(ham) {
  const satirlar = String(ham).split(/\r?\n/);
  const bloklar = [];
  let aktif = null;
  let citIci = false;

  for (const satir of satirlar) {
    const baslik = satir.match(/^#\s*K(\d+)\s*—\s*(.*)$/);
    if (baslik) {
      if (aktif) bloklar.push(aktif);
      aktif = { n: Number(baslik[1]), vo: baslik[2].trim(), govde: [] };
      citIci = false;
      continue;
    }
    if (!aktif) continue;
    if (/^-{5,}$/.test(satir.trim())) { citIci = !citIci; continue; }
    if (citIci) aktif.govde.push(satir);
  }
  if (aktif) bloklar.push(aktif);
  if (!bloklar.length) fail('dosyada `# K<n> — "…"` biçiminde blok bulunamadı');
  return bloklar.map((b) => ({ ...b, govde: b.govde.join('\n').trim() }));
}

export function handleleriBul(metin) {
  return [...new Set([...String(metin).matchAll(/@([a-zçğıöşü0-9-]+)/gi)].map((m) => m[1].toLowerCase()))];
}

/**
 * Türkçe kelimeler İngilizce gövdeye sızmış — 54 bloğun 21'inde ölçüldü (2026-08-07).
 * Motor bunları ya yok sayıyor ya uydurma bir nesneye çeviriyor; iki durumda da kare kayıyor.
 * Buradaki karşılıklar MALZEMEYİ taşır, yalnız adı değil.
 */
export const TURKCE_SOZLUK = Object.freeze({
  'süt güğümü': 'a dented metal milk churn', 'güğüm': 'a metal milk churn',
  'galvaniz tel': 'galvanised wire mesh', 'galvaniz': 'galvanised',
  'hasır sepet': 'a split-cane wicker basket', 'taş eşik': 'a worn stone step',
  'kuluçka kutusu': 'a fire-branded wooden brooding box', 'yem çuvalı': 'a burlap feed sack',
  'battaniye': 'an old wool blanket', 'sazlık': 'reeds', 'çakıl': 'flat pebbles',
  'yön levhası': 'a rusted sheet-metal direction sign', 'iribaş': 'a tadpole',
  'koza': 'a cocoon', 'tırtıl': 'a caterpillar', 'kelebek': 'a butterfly', 'civciv': 'a wet yellow chick',
  
  'saman balyası': 'a bale of dry straw', 'saman': 'dry straw', 'samanı': 'the dry straw',
  'emaye plaka': 'a fired enamel plate', 'emaye': 'fired enamel',
  'ahşap kova': 'an overturned wooden bucket', 'ahşap çit': 'a weathered timber fence',
  'ahşap sundurma': 'a timber porch roof', 'ahşap tabure': 'a small wooden stool',
  'ahşap kasa': 'a dusty wooden crate', 'tahta kasa': 'a dusty wooden crate',
  'çuval bezi': 'folded burlap sacking', 'kendir ipi': 'frayed hemp rope', 'halat': 'a coiled rope',
  'demir kanca': 'a rusted iron hook', 'teneke saksı': 'a rusted tin pot',
  'toprak kase': 'a small clay bowl', 'su oluğu': 'a long stone water trough',
  'kiremit parçası': 'a cracked roof-tile fragment', 'kiremitler': 'stacked clay roof tiles',
  'buğday taneleri': 'scattered wheat grains', 'mısır koçanları': 'scattered corn cobs',
  'yabani otlar': 'a patch of wild grass', 'tekerlek lastiği': 'a discarded rubber tyre',
  'el arabası': 'a wooden wheelbarrow', 'kurutulmuş biber dizisi': 'a hanging string of dried red peppers',
  'su damlacıkları': 'suspended water droplets', 'toz zerresi': 'a magnified dust mote',
  'yaprak damarı': 'a translucent leaf vein', 'polen tozu': 'a glowing pollen grain',
  'kum taneleri': 'fine sand grains', 'yosun parçacıkları': 'drifting algae fragments',
  'hava kabarcıkları': 'tiny air bubbles', 'su piresi kabuğu': 'the shell of a water flea',
  'pamukçuk lifleri': 'soft pale fibres', 'mineral kristalleri': 'glowing mineral crystals',
  'bitki özsuyu': 'threads of translucent plant sap', 'hücre zarı kıvrımları': 'delicate membrane folds',
  'maydanoz': 'flat-leaf parsley', 
});

/**
 * 🔴 TEXT SATIRINA SÖZLÜK DOKUNMAZ. Ölçüldü (2026-08-07): `kümes → the coop` çevirisi
 * `TEXT: displays the word KÜMES` satırını `the word the coop`a çevirdi — yani sözlük,
 * ekranda görünecek TÜRKÇE kelimeyi İngilizceye çeviriyordu. Bu batch'e girseydi filmdeki
 * her yazı bozulurdu. Çeviri yalnız TARİF metnine uygulanır, EKRAN METNİNE asla.
 */
export function turkceCoz(metin) {
  const satirlar = String(metin).split(/\r?\n/);
  return satirlar.map((s) => (/^TEXT:/i.test(s.trim()) ? s : turkceCozSatir(s))).join('\n');
}

export function turkceCozSatir(metin) {
  let cikti = String(metin);
  // Uzun ifadeler önce çözülür; "saman balyası" varken "saman" kazanmasın.
  for (const [tr, en] of Object.entries(TURKCE_SOZLUK).sort((a, b) => b[0].length - a[0].length)) {
    cikti = cikti.replace(new RegExp(`(^|[^a-zçğıöşü])${tr}([^a-zçğıöşü]|$)`, 'gi'), `$1${en}$2`);
  }
  return cikti;
}

export function handleleriCoz(metin) {
  const cozulmus = String(metin).replace(/`?@([a-zçğıöşü0-9-]+)`?/gi, (tam, ad) => {
    const karsilik = HANDLE_SOZLUGU[ad.toLowerCase()];
    return karsilik ?? tam;
  });
  return artikelTemizle(cozulmus);
}

/**
 * `@handle` ve Türkçe sözlük çözümü artikeli ikizliyor: "A the hen…", "of the the coop…",
 * "an old a fired enamel plate", "overturned an overturned wooden bucket".
 * Motor bu ikizleri iki ayrı nesne sanıyor — ölçüldü: iki sepet çıkan kare buydu.
 * Kararlı hâle gelene kadar sadeleştirilir (tek geçiş yetmiyor, sıra zincirleme).
 */
export function artikelTemizle(metin) {
  let onceki = null;
  let cikti = String(metin);
  for (let tur = 0; tur < 6 && cikti !== onceki; tur += 1) {
    onceki = cikti;
    cikti = cikti
      .replace(/\b(a|an|the)\s+(a|an|the)\b/gi, '$2')
      .replace(/\b(mother|tiny|single|small|old|large|young|various)\s+(the)\b/gi, '$2')
      .replace(/\b(\w+)\s+(a|an|the)\s+\1\b/gi, '$2 $1')
      .replace(/\b(\w+)\s+\1\b/gi, '$1');
  }
  // Cümle başındaki küçük harfli artikel büyütülür.
  return cikti.replace(/(^|[.!?]\s+)([a-z])/g, (_, ayrac, harf) => ayrac + harf.toUpperCase());
}

export function rafOku(yol = RAF_YOLU) {
  if (!existsSync(yol)) return new Map();
  try {
    const veri = JSON.parse(readFileSync(yol, 'utf8'));
    return new Map((veri.elementler ?? [])
      .filter((e) => e.id && !String(e.id).startsWith('yerel-'))
      .map((e) => [String(e.ad).toLowerCase(), e.id]));
  } catch { return new Map(); }
}

/** Magnific referans tavanı 12; kare başına o kadarını geçmeyiz. */
export const REFERANS_TAVANI = 12;

export function metniKur(blok, raf) {
  const handleler = handleleriBul(blok.govde);
  const refs = handleler.map((h) => raf.get(h)).filter(Boolean).slice(0, REFERANS_TAVANI);
  const mikro = MIKRO_ISARETLERI.test(blok.govde);
  const govde = artikelTemizle(turkceCoz(handleleriCoz(blok.govde)));
  const prompt = [
    SAHNE_YASASI,
    mikro ? MIKRO_YASASI : '',
    '',
    govde,
  ].filter(Boolean).join('\n');
  return { n: blok.n, vo: blok.vo, prompt, refs, handleler, mikro };
}

export function projeDosyasi(proje) {
  const kok = path.join(INBOX, proje, 'PROMPTLAR');
  if (!existsSync(kok)) fail(`PROMPTLAR klasörü yok: ${path.relative(REPO_ROOT, kok)}`);
  const adaylar = readdirSync(kok).filter((f) => f.endsWith('.txt'));
  if (!adaylar.length) fail('PROMPTLAR klasöründe .txt yok');
  if (adaylar.length > 1) {
    fail(`birden çok aday prompt dosyası var — hangisi final belli DEĞİL, sessizce seçmiyorum:\n  ${adaylar.join('\n  ')}\n  (fazlasını PROMPTLAR/arsiv/ altına taşı)`);
  }
  return path.join(kok, adaylar[0]);
}

export function usage() {
  return [
    'SAHNE METNİ — teslim bloğunu motora giden metne çevirir (sahne yasası + @handle çözümü)',
    '',
    '  node scripts/sahne-metni.mjs "<proje>" [--kare 5,7,9] [--json]',
    '',
    'Kare basmaz: metni kurar, refs\'i element rafından bağlar. Basmak ajanın, hüküm Mami\'nin.',
  ].join('\n');
}

export function main(argv, { rafYolu } = {}) {
  const konum = argv.filter((a) => !a.startsWith('--'));
  if (!konum.length) return usage();
  const dosya = projeDosyasi(konum[0]);
  const raf = rafOku(rafYolu);
  const i = argv.indexOf('--kare');
  const secili = i === -1 ? null : new Set(String(argv[i + 1]).split(',').map(Number));

  const kareler = bloklariAyir(readFileSync(dosya, 'utf8'))
    .filter((b) => !secili || secili.has(b.n))
    .map((b) => metniKur(b, raf));

  if (argv.includes('--json')) return JSON.stringify(kareler, null, 2);
  return [
    `${kareler.length} kare · kaynak ${path.basename(dosya)} · raf ${raf.size} element`,
    '',
    ...kareler.map((k) =>
      `K${String(k.n).padStart(2, '0')}  ${k.mikro ? 'MİKRO' : '     '}  ref: ${k.refs.length}  (${k.handleler.join(', ') || '—'})  ${k.vo.slice(0, 50)}`),
  ].join('\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(main(process.argv.slice(2)));
  } catch (hata) {
    if (hata instanceof SahneError) { console.error(`❌ ${hata.message}`); process.exit(2); }
    throw hata;
  }
}
