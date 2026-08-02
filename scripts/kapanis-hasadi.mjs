#!/usr/bin/env node
// MAMILAS KAPANIŞ HASADI — biten video sistemin zekâsına dönüşür, klasörde ölmez.
//
// Neden var (Mami, 2026-07-27): "her iş bittikten sonra böyle lootlayacak mısın? o denetimi
// sıkı yapıyor musun?" Dürüst cevap hayırdı — 07-26 hasadı Mami istediği için yapıldı,
// alışkanlık değildi. Ölçüm: Biten/ altında 5 proje var, ikisinin revize turu hiç okunmadı,
// Sabit Sürat'ın revize turundan çıkan dersler hiçbir dosyaya yazılmadı.
//
// Dört kanal (hepsi ADAY üretir — `APPROVED.md`'ye YALNIZ Mami taşır, M7 yasası):
//   1. Yapısal karne  — prompt-lint final sete koşar (aynı ölçüm, ikinci kopya yok)
//   2. Ders adayları  — `<Ad>_revize.txt` sınıflanır → onaylanmaya hazır ders satırları
//   3. Dünya kusuru   — dünya-yerel sınıflar kütüphaneye yazılacak aday olarak işaretlenir
//   4. Kit sapması    — PROMPT-YASASI §5 teslim sözleşmesinden sapma
//
//   node scripts/kapanis-hasadi.mjs "<Biten/Proje>"   # tek proje → CANDIDATES dosyası yazar
//   node scripts/kapanis-hasadi.mjs --all             # hasat edilmemiş her projeyi hasat et
//   node scripts/kapanis-hasadi.mjs --check           # hasat bekleyen varsa exit 1 (DUVAR)
//
// DUVAR NASIL ATEŞLER: Mami klasörü Explorer'da sürüklüyor, `mv` yazmıyor. Komut metnine
// bakan bir hook bu makinede sessiz no-op olurdu (bkz. gate.sh'ın python3 kusuru). Bu yüzden
// duvar OLAYA değil DURUMA bakar: Biten/ altında hasat edilmemiş proje varsa `--check`
// kırmızıdır ve oturum açılışında görünür. Nasıl taşındığı önemsiz.

import { readFileSync, existsSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { lintFile } from './prompt-lint.mjs';
import { dersleriAyikla } from './ders-bankasi-durumu.mjs';
import {
  PARSER_VERSION,
  slugify,
  foldTr,
  pickPromptSources,
  pickRevizeSources,
  pickCommandSource,
  candidateSourceNames,
  frameKey,
} from './lib/harvest-sources.mjs';
import {
  SCHEMA,
  ERROR_TEXT,
  emptyMeta,
  parseMeta,
  renderMeta,
  projectId,
  sha256File,
} from './lib/harvest-meta.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
// cwd'ye güvenme: hook ve ajanlar scripti başka dizinden çağırıyor. Script kendi yerini bilir.
const ROOT = dirname(HERE);
const BITEN = join(ROOT, 'agents', 'COMMAND-INBOX', 'Biten');
const LESSONS = join(ROOT, 'agents', 'lessons');
const MANIFEST = 'HASAT.json';

// ---------------------------------------------------------------------------
// REVİZE SINIFLARI — her sınıf teslim edilmiş bir revize dosyasında GERÇEKTEN görülen
// bir hatadan türedi. `lesson` satırı APPROVED.md biçimindedir: Mami kabul ederse olduğu
// gibi taşınır. `scope` kusurun nereye yazılacağını söyler:
//   law     → agents/PROMPT-YASASI.md (slot eksikliği; her dünyada geçerli)
//   lesson  → ders bankası (ajan davranışı)
//   library → src/core/SURGERY_DATA.json (dünyaya özel; kod eğilmez — faz yasası)
// ---------------------------------------------------------------------------
const CLASSES = [
  {
    key: 'arka-plan-yazı',
    re: /\b(sign|poster|board|notice|banner|shop|storefront)\b/i,
    scope: 'law',
    slot: 'TEXT arka plan kuyruğu',
    lesson:
      'Arka plandaki her yazı yüzeyi (tabela, poster, pano) yumuşak-bulanık ve Türkçe ya da BOŞ kalır; ' +
      'kare-özel yazılmazsa motor İngilizce ya da uydurma harf dizisi basıyor',
  },
  {
    key: 'sembol-bayrak',
    re: /\b(flag|flagpole|emblem|crest|badge|bayrak)\b/i,
    scope: 'law',
    slot: 'TEXT arka plan kuyruğu (sembol dahil)',
    lesson:
      'Bayrak, arma ve rozet YAZI slotunun kapsamındadır: mekânda bayrak direği varsa Türk bayrağı ' +
      'açıkça yazılır, yoksa motor Amerikan bayrağı basıyor',
  },
  {
    key: 'kadran-ölçü',
    re: /\b(compass|dial|gauge|scale|needle|pusula|kadran)\b/i,
    scope: 'law',
    slot: 'TEXT (diegetik alet yüzeyi)',
    lesson:
      'Ölçü aletinin kadranı da Türkçedir (pusula K/D/G/B, gösterge birimi Türkçe); TEXT slotu yalnız ' +
      'kahraman yazıyı kapsayınca alet üstündeki harfler İngilizce çıkıyor',
  },
  {
    key: 'kavram-yazısı',
    // "barely-legible" ARKA PLAN talimatıdır ve bunun TERSİDİR — çıplak `legible` ile eşleşince
    // 4 arka-plan karesi kavram yazısı sanıldı (ilk koşumda ölçüldü). Yalnız pozitif netlik emri.
    re: /(completely legible|clearly,? sharply|must be crisp|in front of any letter|concept term)/i,
    scope: 'law',
    slot: 'TEXT konum',
    lesson:
      'Kavram yazısı NET ve tam okunur olur ve konumu yazılır — figür hiçbir harfin önünde durmaz; ' +
      'konum yazılmazsa yazı gövdenin arkasında kalıyor',
  },
  {
    key: 'renk-süreklilik',
    re: /\b(colour|color)\b[\s\S]{0,80}\b(match|same as|other shots|consistent)\b/i,
    scope: 'lesson',
    slot: '@tag disiplini',
    lesson:
      'Karakterin gardırop rengi @referansta kilitlenir; sahne promptunda tarif edilirse aynı çanta ' +
      'kareden kareye renk değiştiriyor',
  },
  {
    key: 'temas-yüzey',
    re: /\b(floating|hovering|contact shadow|resting on|havada)\b/i,
    scope: 'law',
    slot: '[9 TEMAS]',
    lesson: 'Her nesne yüzeyine yaslanır ve yumuşak temas gölgesi bırakır; slot düşünce nesne havada yüzüyor',
  },
  {
    key: 'ten',
    re: /\b(skin)\b[\s\S]{0,60}\b(green|grey|gray|tint)\b/i,
    scope: 'law',
    slot: '[3 KİMLİK]',
    lesson: 'Ten sıcak mat ve düşük specular yazılır; yeşil/gri cilt karenin reddidir',
  },
  {
    key: 'sayısal-etiket',
    re: /\b(\d+\s*N\b|unit|label reads|rakam|birim)\b/i,
    scope: 'law',
    slot: 'TEXT harf harf',
    lesson: 'Sayı ile birim AYRI ve aralıklı yazılır ("R = 0 N", asla "R = ON"); her değer için TEK etiket',
  },
  {
    key: 'kavram-ışığı',
    re: /\b(glow|petal|flower|arrowhead|flame)\b/i,
    scope: 'law',
    slot: '[6 KAVRAM]',
    lesson:
      'Kavram ışığı YUVARLAK sıcak-altın ışıktır ve ışık kalır — taç yaprağı, sap, ok ucu ya da alev olmaz',
  },
  {
    key: 'dünya-malzeme',
    re: /\b(material|texture|surface finish|render|palette|palet)\b/i,
    scope: 'library',
    slot: '—',
    lesson: 'Dünya malzeme/palet yasası bu kareyi taşımadı — kusur dünyada, kodda değil',
  },
];

const KIT = [
  { suffix: '_REFERANSLAR.txt', ne: 'prompt yazımından ÖNCE' },
  { suffix: '_PROMPTLAR.txt', ne: 'sekans sekans' },
  { suffix: '_revize.txt', ne: 'denetim geçişinde' },
  { suffix: '_MOTION.txt', ne: 'kareler görüldükten sonra' },
  { suffix: '_EDIT-PLAN.txt', ne: 'motion ile birlikte' },
  { suffix: '_SESLENDIRME.txt', ne: 'motion ile birlikte' },
  { suffix: '_SUNO.txt', ne: 'motion ile birlikte' },
];

// ---------------------------------------------------------------------------

// `slugify` artık `scripts/lib/harvest-sources.mjs`'ten gelir — yerel kopya SİLİNDİ.
// Yerel kopya `toLowerCase()` kullanıyordu ve 'İ'.toLowerCase() iki kod noktası ürettiği için
// `Kuvvet MİRA` → `kuvvet-mi-ra` yazıyordu (diskte kanıt: HASAT-kuvvet-mi-ra.md).

// Makine çıktısı `HASAT-*`, elle yazılan aday dosyaları `CANDIDATES-*`. Ayrım kozmetik değil:
// tek bir `rm CANDIDATES-*` glob'u 2026-07-27'de Bileşke'nin 10 Mami-bekleyen dersini sildi
// (git'ten geri geldi). Makine ürettiği dosyayı elle yazılandan ADIYLA ayırmak, o kazayı
// yapısal olarak imkânsız kılar.
const harvestPath = (dir) => join(LESSONS, `HASAT-${slugify(basename(dir))}.md`);

/**
 * Hedef yol + çakışma kararı. Slug ÇAKIŞIYOR (ölçüldü) — aynı slug'ı üreten iki klasör
 * birbirinin hasadını ezerdi. Metadata varsa `project.id` ile doğrula; farklıysa EZME.
 */
function harvestTarget(dir) {
  const id = projectId(basename(dir));
  const p = harvestPath(dir);
  if (!existsSync(p)) return { path: p, collision: null, id };
  const meta = parseMeta(readFileSync(p, 'utf8'));
  if (!meta) return { path: p, collision: null, id }; // LEGACY: metadata yok, ezmek serbest
  if (meta.project?.id && meta.project.id !== id) {
    return {
      path: join(LESSONS, `HASAT-${slugify(basename(dir))}-${id.slice(0, 8)}.md`),
      collision: { existing: p, existingDir: meta.project?.dir ?? '(bilinmiyor)', existingId: meta.project?.id },
      id,
    };
  }
  return { path: p, collision: null, id };
}

function projectFiles(dir) {
  // ⚠ ADI NORMALİZE ETME. Burada `.normalize('NFC')` vardı ve macOS'ta zararsızdı — APFS
  // adları zaten NFC veriyor. NTFS ise ne yazdıysan onu saklıyor: NFD adlı bir dosyanın adı
  // NFC'ye çevrilince ortaya DİSKTE OLMAYAN bir yol çıkıyor ve `readFileSync` ENOENT atıyor.
  // Windows'ta Türkçe adlı her projede hasat çöküyordu (2026-07-29, 4 test).
  // Karşılaştırmalar zaten `foldTr`'den geçiyor ve o NFC/NFD farkını kendisi siliyor —
  // yani normalizasyon eşleşme için GEREKSİZ, dosya açmak için YIKICI. Gerçek ad korunur.
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((n) => n !== '.DS_Store' && !n.startsWith('~$') && !n.startsWith('._'));
}

/** `HASAT.json` — bölünmüş teslim koda TAHMİN ettirilmez, projede BEYAN edilir. */
function readManifest(dir, files) {
  const name = files.find((f) => foldTr(f) === foldTr(MANIFEST));
  if (!name) return { manifest: null, file: null, errors: [] };
  const p = join(dir, name);
  let j;
  try {
    j = JSON.parse(readFileSync(p, 'utf8'));
  } catch (e) {
    return { manifest: null, file: name, errors: [`MANIFEST_BROKEN: \`${name}\` JSON olarak okunamadı (${e.message})`] };
  }
  const errors = [];
  for (const key of ['promptParts', 'revizeParts']) {
    for (const f of j?.[key] ?? []) {
      if (!existsSync(join(dir, f))) errors.push(`MANIFEST_BROKEN: \`${name}\` → ${key} "${f}" diskte YOK`);
    }
  }
  if (j?.command && !existsSync(join(dir, j.command))) {
    errors.push(`MANIFEST_BROKEN: \`${name}\` → command "${j.command}" diskte YOK`);
  }
  return { manifest: errors.length ? null : j, file: name, errors };
}

const srcRow = (dir, f, extra = {}) => ({
  file: f,
  sha256: sha256File(join(dir, f)),
  bytes: statSync(join(dir, f)).size,
  ...extra,
});

/** Revize dosyasını `### <dosya>` bloklarına böler. Biçim PROMPT-YASASI §5'te sözleşme. */
function parseRevize(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let cur = null;
  for (const l of lines) {
    const m = l.match(/^###\s+(.+?)\s*$/);
    if (m) {
      if (cur) out.push(cur);
      cur = { frame: m[1], body: '' };
    } else if (cur) {
      if (/^---\s*SORUNSUZ/i.test(l)) { out.push(cur); cur = null; break; }
      cur.body += l + '\n';
    }
  }
  if (cur) out.push(cur);
  return out.map((r) => ({ ...r, body: r.body.trim() }));
}

/** SORUNSUZ satırı revize oranının paydasıdır — sayı uydurulmaz, dosyadan okunur. */
function parseTemiz(text) {
  const m = text.match(/---\s*SORUNSUZ[^\n]*---\s*\n([\s\S]*?)(?:\n\s*\n|$)/i);
  if (!m) return null;
  const nums = m[1].match(/\d+/g);
  return nums ? nums.length : null;
}

function classify(rev) {
  const hits = CLASSES.filter((c) => c.re.test(rev.body));
  return hits.length ? hits : null;
}

// `src/core/brain.ts` → `registerOf` aynası. Ayna olduğu için burada YASA yazılmaz; yeni bir
// register kelimesi icat edilirse kaynak orasıdır, burası değil.
function registerOf(productionPath) {
  const p = String(productionPath ?? '').toUpperCase();
  if (/REAL|COMMERCIAL|PRODUCT|LIVE|DOCUMENTARY|TESTIMONIAL|FOOD|FASHION|TOURISM|AUTOMOTIVE|TECH|ARCHITECTURE|SOCIAL|HEALTH/.test(p)) return 'REAL';
  if (p === 'ANIMATION_EDU' || /EGITIM|EĞİTİM|EDU/.test(p)) return 'EDU';
  return 'STY';
}

function findWorld(dir, cmd) {
  if (!cmd) return null;
  try {
    const j = JSON.parse(readFileSync(join(dir, cmd), 'utf8'));
    const l = j?.locks ?? {};
    return {
      file: cmd,
      worldId: l.worldId ?? null,
      worldName: l.worldName ?? null,
      projectName: l.projectName ?? null,
      projectClass: l.projectClass ?? null,
      productionPath: l.productionPath ?? null,
    };
  } catch {
    return { file: cmd, parseError: true };
  }
}

// ---------------------------------------------------------------------------
// PROJECT LOOT — Faz 9. `PROJECT-LOOT.json` TEK KANONİK KAYNAKTIR; HASAT ondan
// üretilen **deterministik görünümdür**. Bu yüzden burada loot YAZILMAZ, yalnız
// OKUNUR (yazıcı: `scripts/project-loot.mjs`). İkinci gerçeklik kurmak bu repoda
// ölçülmüş bir hastalık: `Kuvvet ve Kuvvetin Ölçülmesi` klasöründe iki rakip teslim
// doğdu ve ancak `HASAT.json` beyanıyla çözüldü.
// ---------------------------------------------------------------------------
const LOOT_FILE = 'PROJECT-LOOT.json';

/** Loot yok = eski proje; KIRILMAZ, `null` döner. Bozuk JSON = AÇIK hata, sessiz yutulmaz. */
function readLoot(dir) {
  const p = join(dir, LOOT_FILE);
  if (!existsSync(p)) return null;
  try {
    const j = JSON.parse(readFileSync(p, 'utf8'));
    return { ...j, _file: LOOT_FILE };
  } catch (e) {
    return { _file: LOOT_FILE, parseError: String(e.message ?? e) };
  }
}

/**
 * Kare evreni invariantı. **%100'ü geçen bir yüzde ASLA yazılmaz.**
 * Ölçüldü (2026-07-28): revised=31 (MOTION dosyasından), total=8 (bölünmüş promptun 1. parçası)
 * → rapora "388%" yazıldı ve altına 6 ders satırı dizildi. Ölçemediğin yerde `—` ve gerekçe.
 */
function computeRatio({ frameTotal, frameTotalSource, revisedUnique }) {
  if (frameTotal == null) {
    return { ratio: null, errors: [`RATIO_UNCOMPUTABLE: ${ERROR_TEXT.RATIO_UNCOMPUTABLE}`], fatal: false };
  }
  if (revisedUnique > frameTotal) {
    return {
      ratio: null,
      fatal: true,
      errors: [
        `FRAME_UNIVERSE_MISMATCH: ${revisedUnique} benzersiz revize karesi > ${frameTotal} prompt karesi ` +
        `(kaynak: ${frameTotalSource}) — prompt kaynağı eksik parça olabilir`,
      ],
    };
  }
  return { ratio: revisedUnique / frameTotal, errors: [], fatal: false };
}

/**
 * @param {string} dir
 * @param {{registerOverride?: 'REAL'|'EDU'|'STY'|null}} [opts]
 *   `registerOverride` — command JSON'u OLMAYAN projeler için. Ölçüldü (6.1.2, 2026-07-29):
 *   promptlar `.docx` konusundan yazıldı, command JSON hiç doğmadı → `findWorld` null döndü →
 *   register `STY`'ye düştü ve 34 EDU karesi YANLIŞ register'da lintlendi. Register yanlışsa
 *   karne yanlış kusuru raporlar; yanlış hasat bankayı zehirler.
 */
function harvest(dir, opts = {}) {
  const name = basename(dir).normalize('NFC');
  const files = projectFiles(dir);
  const errors = [];

  const mf = readManifest(dir, files);
  errors.push(...mf.errors);
  const manifest = mf.manifest;

  // 0 — kaynak seçimi. Tek `find` YOK: seçim saf fonksiyonda, belirsizlik AÇIK HATA.
  const promptSel = pickPromptSources(files, manifest);
  const revizeSel = pickRevizeSources(files, manifest);
  const cmdSel = pickCommandSource(files, manifest);
  const world = findWorld(dir, cmdSel.file);

  if (promptSel.error === 'PROMPT_MISSING') errors.push(`PROMPT_MISSING: ${ERROR_TEXT.PROMPT_MISSING}`);
  if (promptSel.error === 'PROMPT_AMBIGUOUS') {
    errors.push(
      `PROMPT_AMBIGUOUS: ${ERROR_TEXT.PROMPT_AMBIGUOUS}: ${promptSel.candidates.join(' · ')} — ` +
      `${MANIFEST} ile bildir (promptParts)`,
    );
  }
  if (cmdSel.error === 'COMMAND_AMBIGUOUS') {
    errors.push(`COMMAND_AMBIGUOUS: ${ERROR_TEXT.COMMAND_AMBIGUOUS}: ${cmdSel.candidates.join(' · ')}`);
  }

  // 1 — yapısal karne. Register bayrakla sorulmaz, command JSON'dan okunur: yasa §0.5'te
  // register'a bağlı, karneyi yanlış register'da okumak yanlış kusur raporlar.
  // Override yalnız GEÇERLİ bir register olabilir; çöp değer sessizce `STY`'ye düşmez.
  const REGISTERS = new Set(['REAL', 'EDU', 'STY']);
  const ovr = opts.registerOverride ? String(opts.registerOverride).toUpperCase() : null;
  if (ovr && !REGISTERS.has(ovr)) errors.push(`REGISTER_OVERRIDE_INVALID: "${opts.registerOverride}" — REAL|EDU|STY bekleniyor`);
  const registerFromWorld = world?.productionPath ?? world?.projectClass;
  if (ovr && REGISTERS.has(ovr) && registerFromWorld) {
    errors.push(`REGISTER_OVERRIDE_IGNORED: command JSON register taşıyor (${registerOf(registerFromWorld)}) — override "${ovr}" YOK sayıldı`);
  }
  const register = registerFromWorld
    ? registerOf(registerFromWorld)
    : (ovr && REGISTERS.has(ovr) ? ovr : registerOf(null));
  const registerSource = registerFromWorld ? 'command JSON' : (ovr && REGISTERS.has(ovr) ? 'override' : 'varsayılan (STY)');
  // Bölünmüş teslim: her parça AYRI lintlenir, sonuçlar birleşir. Tek parçaya bakıp
  // "eksik yok" demek 35 karelik videonun 8'ine bakmaktı (ölçüldü).
  const lintParts = promptSel.parts.map((f) => ({ file: f, r: lintFile(join(dir, f), register) }));
  const lint = lintParts.length
    ? {
        register,
        total: lintParts.reduce((a, x) => a + x.r.total, 0),
        bad: lintParts.flatMap((x) => x.r.bad),
        rows: lintParts.flatMap((x) => x.r.rows),
        counts: lintParts.reduce((acc, x) => {
          for (const [k, v] of Object.entries(x.r.counts)) acc[k] = (acc[k] ?? 0) + v;
          return acc;
        }, {}),
      }
    : null;

  // 2 — ders adayları. ÇOK TURLU: her tur ayrı parse edilir, tur devri ölçülür.
  const rounds = revizeSel.parts.map((f) => {
    const text = readFileSync(join(dir, f), 'utf8');
    const blocks = parseRevize(text).map((b) => ({ ...b, key: frameKey(b.frame) }));
    return { file: f, blocks, temiz: parseTemiz(text), frames: new Set(blocks.map((b) => b.key)) };
  });
  const revs = rounds.flatMap((r) => r.blocks);
  const uniqueFrames = new Set(revs.map((r) => r.key));
  const temiz = rounds.length ? (rounds.find((r) => r.temiz != null)?.temiz ?? null) : null;

  let multiRound = null;
  if (rounds.length > 1) {
    const first = rounds[0].frames;
    const later = new Set(rounds.slice(1).flatMap((r) => [...r.frames]));
    const repeated = [...first].filter((f) => later.has(f)).sort((a, b) => Number(a) - Number(b));
    multiRound = {
      rounds: rounds.length,
      repeatedFrames: repeated,
      carryOverRate: first.size ? repeated.length / first.size : null,
      perRound: rounds.map((r) => ({ file: r.file, blocks: r.blocks.length, frames: r.frames.size })),
    };
  }

  const byClass = new Map();
  const unclassified = [];
  for (const r of revs) {
    const hits = classify(r);
    if (!hits) { unclassified.push(r); continue; }
    for (const c of hits) {
      if (!byClass.has(c.key)) byClass.set(c.key, { cls: c, frames: [] });
      byClass.get(c.key).frames.push(r.frame);
    }
  }

  // 3 — kare evreni ve oran
  let frameTotal = null;
  let frameTotalSource = null;
  if (manifest?.frameTotal != null) { frameTotal = manifest.frameTotal; frameTotalSource = 'manifest'; }
  else if (lint?.total) { frameTotal = lint.total; frameTotalSource = 'prompt-parts'; }
  else if (temiz != null) { frameTotal = temiz + uniqueFrames.size; frameTotalSource = 'revize+temiz'; }

  const ratioCalc = rounds.length
    ? computeRatio({ frameTotal, frameTotalSource, revisedUnique: uniqueFrames.size })
    : { ratio: null, errors: [], fatal: false };
  errors.push(...ratioCalc.errors);

  // 4 — kit sapması
  // Sapmayı YOK'tan ayır: `revize.txt` (ön ek yok) ve `_MOTION.md` (uzantı yanlış) dosyanın
  // olmadığı anlamına gelmez — kitin biçim sözleşmesinden saptığı anlamına gelir. İlk koşumda
  // ikisi de "YOK" raporlandı; eksik dosya ile sapmış ad aynı hüküm değildir.
  const stem = (s) => s.replace(/^_/, '').replace(/\.(txt|md)$/i, '').toLowerCase();
  const kit = KIT.map((k) => {
    const exact = files.includes(`${name}${k.suffix}`);
    const found = files.find((f) => /\.(md|txt)$/i.test(f) && stem(f).endsWith(stem(k.suffix)));
    return { ...k, exact, found: found ?? null };
  });

  // --- metadata (mamilas.harvest.v1) ---
  const meta = emptyMeta();
  meta.parserVersion = PARSER_VERSION;
  meta.promptLintVersion = `prompt-lint@${sha256File(join(HERE, 'prompt-lint.mjs')).slice(0, 8)}`;
  meta.harvestedAt = new Date().toISOString();
  meta.project = { dir: name, id: projectId(name) };
  meta.sources.prompt = lintParts.map((x) => srcRow(dir, x.file, { frames: x.r.total }));
  meta.sources.revize = rounds.map((r) =>
    srcRow(dir, r.file, { blocks: r.blocks.length, uniqueFrames: r.frames.size }));
  meta.sources.command = cmdSel.file ? { file: cmdSel.file, sha256: sha256File(join(dir, cmdSel.file)) } : null;
  meta.sources.manifest = mf.file ? { file: mf.file, sha256: sha256File(join(dir, mf.file)) } : null;
  meta.excluded = [
    ...revizeSel.excluded,
    // Belirsiz aday da KAYDEDİLİR: "ölçmedim" ile "görmedim" ayrı şeydir. Kayıtsız bırakılırsa
    // `--check` her turda STALE_N (yeni kanıt) der ve gerçek hatayı (PROMPT_AMBIGUOUS) örter.
    ...(promptSel.candidates ?? []).map((f) => ({ file: f, why: 'PROMPT_AMBIGUOUS: hangisi final belli değil — Mami kararı' })),
    ...(cmdSel.candidates ?? []).map((f) => ({ file: f, why: 'COMMAND_AMBIGUOUS: hangisi geçerli belli değil' })),
  ];
  meta.metrics = {
    frameTotal,
    frameTotalSource,
    revisedBlocks: revs.length,
    revisedUniqueFrames: uniqueFrames.size,
    cleanDeclared: temiz,
    revizeRatio: ratioCalc.ratio,
    multiRound,
  };
  if (!rounds.length) errors.push(`REVIZE_NONE: ${ERROR_TEXT.REVIZE_NONE}`);
  if (!cmdSel.file && !cmdSel.candidates) errors.push(`COMMAND_MISSING: ${ERROR_TEXT.COMMAND_MISSING}`);
  meta.errors = errors;
  // FATAL = ölçüm güvenilmez. Yalnız bunlar `status: ERROR` yapar; REVIZE_NONE ve
  // COMMAND_MISSING bilgidir — hasadın yanlış olduğunu değil, eksik olduğunu söyler.
  const FATAL = /^(PROMPT_MISSING|PROMPT_AMBIGUOUS|COMMAND_AMBIGUOUS|FRAME_UNIVERSE_MISMATCH|MANIFEST_BROKEN|SLUG_COLLISION):/;
  meta.status = errors.some((e) => FATAL.test(e)) ? 'ERROR' : 'OK';

  return {
    dir, name, files, world, register, registerSource, loot: readLoot(dir),
    promptSel, revizeSel, cmdSel, manifest, manifestFile: mf.file,
    lint, lintParts, rounds, revs, uniqueFrames, temiz, multiRound,
    frameTotal, frameTotalSource, ratio: ratioCalc.ratio,
    byClass, unclassified, kit, meta, errors,
  };
}

/**
 * PROJECT LOOT görünümü — **deterministik.** Buradaki hiçbir satır yorum üretmez:
 * Mami'nin hükmü olduğu gibi basılır (yasa: metnini sessizce yeniden yazma), ders adayları
 * loot'taki sırayla listelenir, `evidenceStrength` yoksa `—` yazılır. Loot yoksa bölüm
 * hiç açılmaz — eski projeler kırılmaz.
 */
function renderLoot(h) {
  const lo = h.loot;
  if (!lo) return [];
  const L = ['## L · PROJECT LOOT (kanonik kaynak)', ''];
  if (lo.parseError) {
    L.push(`🔴 **\`${lo._file}\` OKUNAMADI** — bozuk JSON sessizce yutulmadı: ${lo.parseError}`);
    L.push('');
    L.push('Bu bölüm boş DEĞİL, **ölçülemedi**. `node scripts/project-loot.mjs gor "<proje>"` ile doğrula.');
    L.push('');
    return L;
  }
  L.push(`Otorite \`${lo._file}\`. **Aşağıdakiler o dosyadan üretildi; bu dosya düzenlenirse kaybolur.**`);
  L.push('');
  L.push(`- statü: \`${lo.status ?? '—'}\``);
  L.push(`- kapanış: ${lo.project?.closedAt ?? '—'}`);
  L.push('');

  const sv = lo.subjectiveVerdict ?? null;
  L.push('### L.1 · Mami\'nin hükmü — DEĞİŞTİRİLMEDİ');
  L.push('');
  if (!sv || (sv.overall == null && sv.layerVerdicts == null)) {
    L.push(lo.status === 'interview-skipped'
      ? '_Röportaj atlandı (`layerVerdicts: null`). Teknik loot yine yazıldı — zorunlu röportaj angaryaya döner._'
      : '_Hüküm henüz alınmadı. Sistem Mami adına hüküm TAHMİN ETMEZ._');
    L.push('');
  } else {
    if (sv.overall) { L.push(`> ${String(sv.overall).split('\n').join('\n> ')}`); L.push(''); }
    const lv = sv.layerVerdicts;
    if (lv && Object.keys(lv).length) {
      L.push('| katman | Mami\'nin cümlesi |');
      L.push('|---|---|');
      for (const [k, v] of Object.entries(lv)) {
        if (v == null) continue;
        L.push(`| ${k} | ${String(v).replace(/\|/g, '\\|').replace(/\n+/g, ' ')} |`);
      }
      L.push('');
    }
  }

  L.push('### L.2 · Ders adayları — carry-forward ayrımı');
  L.push('');
  const cands = Array.isArray(lo.lessonCandidates) ? lo.lessonCandidates : [];
  if (!cands.length) {
    L.push('_Aday yok._');
    L.push('');
    return L;
  }
  L.push('| # | ders | kanıt gücü | carry-forward | APPROVED |');
  L.push('|---|---|---|---|---|');
  for (const c of cands) {
    const es = c.evidenceStrength;
    const esText = es == null ? '—'
      : `kare ${es.framesCovered ?? '—'} · before/after ${es.beforeAfter ? '✓' : '✗'} · tekrar ${es.repeatCount ?? '—'}`;
    L.push(`| ${c.id} | ${String(c.text ?? '').replace(/\|/g, '\\|').replace(/\n+/g, ' ')} | ${esText} | ` +
      `${c.carryForward ? '**EVET** (Mami dedi)' : 'hayır — yalnız aday'} | ${c.approvedAt ?? '—'} |`);
  }
  L.push('');
  L.push('`carry-forward: hayır` olan satır **global derse dönüşmez** — Mami açıkça "sonraki projelere taşı"');
  L.push('demediyse aday olarak kalır (Faz 9 kararı, iki otorite seviyesi).');
  L.push('');
  return L;
}

function render(h) {
  const L = [];
  const today = new Date().toISOString().slice(0, 10);
  const OK = h.meta.status === 'OK';
  L.push(`# KAPANIŞ HASADI — ${h.name}`);
  L.push('');
  L.push(`Kaynak: \`agents/COMMAND-INBOX/Biten/${h.name}/\` · hasat: ${today} · parser: \`${PARSER_VERSION}\``);
  L.push('');
  L.push('**Bu dosya banka DEĞİL.** Her satır ADAY. `agents/lessons/APPROVED.md`\'ye yalnız Mami taşır');
  L.push('(M7 yasası: otomatik promote yok — çöp ders sistemi zehirler). Kabul ettiğin ders satırını');
  L.push('olduğu gibi taşı, istemediğini burada bırak.');
  L.push('');
  L.push(...renderLoot(h));

  // 0 — ölçüm durumu. Önce bu: hatalı ölçümün altına ders dizmek 388%'lik raporu doğurdu.
  L.push(`## 0 · Ölçüm durumu — **${h.meta.status}**`);
  L.push('');
  L.push('| kanal | seçilen kaynak |');
  L.push('|---|---|');
  L.push(`| prompt (${h.promptSel.via}) | ${h.promptSel.parts.length ? h.promptSel.parts.map((f) => `\`${f}\``).join(' + ') : '**YOK**'} |`);
  L.push(`| revize (${h.revizeSel.via}) | ${h.rounds.length ? h.rounds.map((r) => `\`${r.file}\``).join(' + ') : '**YOK**'} |`);
  L.push(`| command | ${h.cmdSel.file ? `\`${h.cmdSel.file}\`` : '**YOK**'} |`);
  L.push(`| manifest | ${h.manifestFile ? `\`${h.manifestFile}\`` : '—'} |`);
  L.push('');
  if (h.revizeSel.excluded.length) {
    L.push('**Elenen aday kaynaklar** (adında `revize` geçiyor ama revize kaynağı değil):');
    L.push('');
    for (const e of h.revizeSel.excluded) L.push(`- \`${e.file}\` — ${e.why}`);
    L.push('');
  }
  if (h.errors.length) {
    L.push(OK ? '**Notlar:**' : '🔴 **Ölçüm hataları — bu rapordan ders adayı ÜRETİLMEDİ:**');
    L.push('');
    for (const e of h.errors) L.push(`- ${e}`);
    L.push('');
  }

  // 1 — yapısal karne
  L.push('## 1 · Yapısal karne (prompt-lint)');
  L.push('');
  if (!h.lint) {
    if (h.promptSel.error === 'PROMPT_AMBIGUOUS') {
      L.push('🔴 **İki aday final prompt dosyası var; hangisi final belli değil** — körleme seçim yapılmadı:');
      L.push('');
      for (const c of h.promptSel.candidates) L.push(`- \`${c}\``);
      L.push('');
      L.push(`Karar Mami'nin. Seçim \`${MANIFEST}\` içinde \`promptParts\` ile bildirilir.`);
    } else {
      L.push('⚠️ `_PROMPTLAR` dosyası yok — bu projenin yapısı ölçülemedi. Ölçülmemiş, temiz değil.');
    }
  } else if (!h.lint.total) {
    L.push('⚠️ Prompt dosyasında kare başlığı bulunamadı — parser çıpası tutmadı, elle bak.');
  } else {
    const t = h.lint.total;
    L.push(`${h.promptSel.parts.map((f) => `\`${f}\``).join(' + ')} — **${t} kare** · register **${h.register}** (yasa §0.5)`);
    if (h.lintParts.length > 1) {
      L.push('');
      L.push(`Bölünmüş teslim, ${h.lintParts.length} parça ayrı ayrı lintlendi: ` +
        h.lintParts.map((x) => `\`${x.file}\` ${x.r.total} kare`).join(' · '));
    }
    L.push('');
    L.push('| slot | kapsam |');
    L.push('|---|---|');
    for (const [k, v] of Object.entries(h.lint.counts)) {
      L.push(`| ${k} | ${v}/${t}${v === t ? ' ✅' : ''} |`);
    }
    L.push('');
    if (h.lint.bad.length) {
      L.push(`**${h.lint.bad.length}/${t} kare eksikli:**`);
      L.push('');
      for (const row of h.lint.bad) {
        L.push(`- \`${row.head}\` — ${row.problems.map((p) => p.msg).join(' · ')}`);
      }
    } else {
      L.push('✅ eksik yok.');
    }
  }
  L.push('');

  // 2 — ders adayları
  L.push('## 2 · Ders adayları (revize turundan)');
  L.push('');
  if (!h.rounds.length) {
    // ESKİ METİN YANLIŞ ÇIKARIMDI: "revize turu hiç yapılmadı". Sürtünme 31/31 temiz geçti,
    // bu yüzden revize dosyası yok — kapının atladığı video değil, sistemin en iyi videosu.
    L.push('⚠️ Revize dosyası bulunamadı. İki olasılık ayrılamıyor: **(a)** revize turu yapılmadı,');
    L.push('**(b)** video sıfır revize aldı. Hüküm verilmiyor — Mami\'ye soruluyor.');
  } else {
    const pct = h.ratio == null ? '—' : `${Math.round(h.ratio * 100)}%`;
    const paydaNot = h.frameTotal == null
      ? ' · kare evreni bilinmiyor, oran hesaplanmadı'
      : ` / ${h.frameTotal} kare (payda kaynağı: ${h.frameTotalSource})`;
    L.push(
      `${h.rounds.map((r) => `\`${r.file}\``).join(' + ')} — **${h.revs.length} revize bloğu**, ` +
      `**${h.uniqueFrames.size} benzersiz kare**${paydaNot} · revize oranı **${pct}**`,
    );
    if (h.ratio == null && h.frameTotal != null) {
      L.push('');
      L.push('🔴 Oran yazılmadı: benzersiz revize karesi prompt kare sayısını aşıyor — payda güvenilmez.');
    }
    L.push('');

    if (h.multiRound) {
      L.push('### Tur devri — düzeltme tuttu mu?');
      L.push('');
      L.push(`**${h.multiRound.rounds} tur.** ` +
        h.multiRound.perRound.map((r) => `\`${r.file}\` ${r.blocks} blok / ${r.frames} kare`).join(' · '));
      L.push('');
      const co = h.multiRound.carryOverRate;
      L.push(`İlk turdan geri dönen kare: **${h.multiRound.repeatedFrames.length}** ` +
        `(${h.multiRound.repeatedFrames.join(', ')}) → tur devri **${co == null ? '—' : `${Math.round(co * 100)}%`}**`);
      L.push('');
      L.push('Bu sayı "revize yazıldı" ile "kusur kapandı" arasındaki farktır: geri dönen kare,');
      L.push('birinci turda verilen düzeltmenin motorda TUTMADIĞI karedir.');
      L.push('');
    }

    if (!OK) {
      L.push('**Ders adayı üretilmedi — ölçüm hatalı** (bkz. §0 ve metadata `errors`).');
      L.push('Hatalı ölçümün altına ders satırı dizmek bankayı zehirler; 388%\'lik rapor tam böyle doğdu.');
    } else if (h.byClass.size) {
      L.push('Sınıflanan kusurlar — her satır onaylanmaya hazır biçimde yazıldı:');
      L.push('');
      L.push('```');
      for (const { cls } of h.byClass.values()) {
        L.push(`- ${cls.lesson} — kaynak: ${h.name} · ${today} · Mami onayı`);
      }
      L.push('```');
      L.push('');
      L.push('| sınıf | kare | nereye yazılır | slot |');
      L.push('|---|---|---|---|');
      for (const { cls, frames } of h.byClass.values()) {
        L.push(`| ${cls.key} | ${frames.join(', ')} | ${cls.scope} | ${cls.slot} |`);
      }
    } else {
      L.push('Sınıflanan kusur yok.');
    }
    if (h.unclassified.length) {
      L.push('');
      L.push(`**Sınıflandırılamadı — ${h.unclassified.length} blok, elle oku:**`);
      L.push('');
      for (const r of h.unclassified) L.push(`- \`${r.frame}\` — ${r.body.slice(0, 160).replace(/\s+/g, ' ')}…`);
    }
  }
  L.push('');

  // 3 — dünya kusuru
  L.push('## 3 · Dünya kusuru → kütüphane');
  L.push('');
  const w = h.world;
  if (!w) {
    L.push('⚠️ Command JSON bulunamadı — hangi dünyanın sınandığı bilinmiyor.');
  } else if (w.parseError) {
    L.push(`⚠️ \`${w.file}\` okunamadı (JSON parse).`);
  } else {
    L.push(`Dünya: **${w.worldId ?? '(boş)'}**${w.worldName ? ` — ${w.worldName}` : ''} · ` +
      `sınıf: ${w.projectClass ?? '(boş)'} · yol: ${w.productionPath ?? '(boş)'}`);
    L.push('');
    if (w.projectName && w.projectClass) {
      const adReklam = /(reklam|commercial|brand|marka)/i.test(w.projectName);
      const sinifEdu = /EDU|ANIMATION/i.test(w.projectClass);
      if (adReklam && sinifEdu) {
        L.push(`🔴 **Ad↔sınıf uyuşmazlığı:** proje adı "${w.projectName}" reklam diyor, sınıf ` +
          `\`${w.projectClass}\` eğitim diyor. Hiçbir kapı söylemiyor. (FAZ 1.5 kapısı.)`);
        L.push('');
      }
    }
    const libraryHits = [...h.byClass.values()].filter((x) => x.cls.scope === 'library');
    if (libraryHits.length) {
      L.push(`\`${w.worldId}\` için kütüphane adayları (\`src/core/SURGERY_DATA.json\` — **kod eğilmez**):`);
      L.push('');
      for (const { cls, frames } of libraryHits) L.push(`- ${cls.lesson} (kare: ${frames.join(', ')})`);
    } else {
      L.push('Bu hasatta **dünya-yerel kusur çıkmadı** — bulunan kusurların hepsi yasa/ders katmanında.');
      L.push('Kütüphaneye yazılacak bir şey yok; sessiz geçilmiyor, açıkça yazılıyor.');
    }
  }
  L.push('');

  // 4 — kit sapması
  L.push('## 4 · Kit biçim sapması (PROMPT-YASASI §5)');
  L.push('');
  L.push('| beklenen | durum |');
  L.push('|---|---|');
  for (const k of h.kit) {
    const st = k.exact
      ? '✅'
      : k.found
        ? `⚠️ ad sapması: \`${k.found}\``
        : `❌ YOK (${k.ne})`;
    L.push(`| \`<Ad>${k.suffix}\` | ${st} |`);
  }
  L.push('');
  // Metadata EN ÜSTE: `--check` dosyayı baştan okuyup çıpayı kesin bulur.
  return renderMeta(h.meta) + L.join('\n') + '\n';
}

function bitenProjects() {
  if (!existsSync(BITEN)) return [];
  return readdirSync(BITEN, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => join(BITEN, e.name.normalize('NFC')));
}

// ---------------------------------------------------------------------------
// --check — DOSYA VARLIĞI DEĞİL, İÇERİK DOĞRULAMASI
//
// Eski kapı `!existsSync(harvestPath(d))` idi: hasadın YAPILDIĞINI değil, DOSYANIN
// YAZILDIĞINI ölçüyordu. Bileşke'nin boş raporu (4 bölümün 4'ü "YOK") kapıyı yeşile
// boyuyordu. İndeks SLUG değil `project.id` — slug çakışması ölçüldü.
// ---------------------------------------------------------------------------

/** Diskteki tüm HASAT-*.md dosyalarını `project.id` ile indeksler. */
function readHarvestMeta() {
  const byId = new Map();
  const legacy = [];
  if (!existsSync(LESSONS)) return { byId, legacy };
  for (const e of readdirSync(LESSONS, { withFileTypes: true })) {
    if (!e.isFile() || !/^HASAT-.*\.md$/i.test(e.name)) continue;
    const p = join(LESSONS, e.name);
    let meta = null;
    try { meta = parseMeta(readFileSync(p, 'utf8')); } catch { meta = null; }
    if (!meta?.project?.id) { legacy.push({ file: e.name, path: p, meta }); continue; }
    byId.set(meta.project.id, { file: e.name, path: p, meta });
  }
  return { byId, legacy };
}

const STATUS_TEXT = {
  PENDING: 'hasat edilmemiş — bu projeye ait HASAT dosyası yok',
  LEGACY: 'HASAT dosyası var ama metadata bloğu yok/okunamıyor — eski sürüm çıktısı, yeniden hasat şart',
  STALE_V: 'parser sürümü eski — ölçüm bugünkü kurallarla yapılmamış',
  STALE_H: 'kaynak dosya hasattan sonra değişti — rapor bayat',
  STALE_N: 'diskte kayıtlı olmayan yeni aday kaynak var — yeni kanıt gelmiş',
  ERROR: 'hasat ERROR durumunda — ölçüm güvenilmez, Mami kararı gerekiyor',
  INVARIANT: 'revize oranı %100\'ü aşıyor — imkânsız sayı, rapor çürük',
  OK: 'güncel',
};

function checkProjects() {
  const { byId, legacy } = readHarvestMeta();
  const legacyBySlug = new Map(legacy.map((x) => [x.file.replace(/^HASAT-|\.md$/gi, ''), x]));
  const rows = [];
  for (const dir of bitenProjects()) {
    const name = basename(dir);
    const id = projectId(name);
    const rec = byId.get(id);
    const row = { project: name, id, status: 'OK', harvest: rec?.file ?? null, detail: '' };

    if (!rec) {
      const lg = legacyBySlug.get(slugify(name));
      if (lg) { row.status = 'LEGACY'; row.harvest = lg.file; }
      else row.status = 'PENDING';
      row.detail = STATUS_TEXT[row.status];
      rows.push(row);
      continue;
    }

    const m = rec.meta;
    if (m.parserVersion !== PARSER_VERSION) {
      row.status = 'STALE_V';
      row.detail = `${STATUS_TEXT.STALE_V} (${m.parserVersion ?? 'yok'} ≠ ${PARSER_VERSION})`;
    } else {
      // hash tazeliği
      const recorded = [
        ...(m.sources?.prompt ?? []),
        ...(m.sources?.revize ?? []),
        ...(m.sources?.command ? [m.sources.command] : []),
        ...(m.sources?.manifest ? [m.sources.manifest] : []),
      ];
      const changed = [];
      for (const s of recorded) {
        const p = join(dir, s.file);
        if (!existsSync(p)) { changed.push(`${s.file} (SİLİNMİŞ)`); continue; }
        if (sha256File(p) !== s.sha256) changed.push(s.file);
      }
      const known = new Set([
        ...recorded.map((s) => s.file.normalize('NFC')),
        ...(m.excluded ?? []).map((e) => e.file.normalize('NFC')),
      ]);
      const onDisk = existsSync(dir) ? candidateSourceNames(projectFiles(dir)) : [];
      const fresh = onDisk.filter((f) => !known.has(f.normalize('NFC')));

      // Sıra kasıtlı: kaynak DEĞİŞTİYSE (STALE_H) her şeyden önce gelir — eski ölçüm hakkında
      // ne dersen de bayattır. Sonra ERROR: hasadın kendi hükmü, yeni dosya bulmaktan önemli.
      if (changed.length) { row.status = 'STALE_H'; row.detail = `${STATUS_TEXT.STALE_H}: ${changed.join(', ')}`; }
      else if (m.status === 'ERROR') {
        row.status = 'ERROR';
        row.detail = `${STATUS_TEXT.ERROR} — ${(m.errors ?? []).join(' | ')}`;
      } else if (fresh.length) { row.status = 'STALE_N'; row.detail = `${STATUS_TEXT.STALE_N}: ${fresh.join(', ')}`; }
      else if (m.metrics?.revizeRatio != null && m.metrics.revizeRatio > 1) {
        row.status = 'INVARIANT'; row.detail = STATUS_TEXT.INVARIANT;
      } else {
        row.detail = STATUS_TEXT.OK;
      }
    }
    rows.push(row);
  }
  // Sahipsiz hasat dosyaları: klasörü artık olmayan raporlar. Sessiz atlanmaz.
  //
  // AMA: çok-projeli SENTEZ sahipsiz değildir. Ölçüldü (2026-08-02) — repodaki en iyi
  // öğrenme belgesi (birden çok projenin adaylarını tekilleştirip kanıtlayan sentez) kapıda
  // "kaynak klasör yok" diye HATA olarak listeleniyordu. Kapı biçimi tanıyordu, değeri
  // tanımıyordu. Ayrım ADA göre değil İÇERİĞE göre yapılır (bu repoda ada bakan her
  // doğrulayıcı kör çıktı): banka-biçimli satırları İKİDEN ÇOK projeye atıf yapıyorsa sentezdir.
  const claimed = new Set(rows.map((r) => r.harvest).filter(Boolean));
  const unclaimed = [...byId.values(), ...legacy].filter((x) => !claimed.has(x.file));

  const orphans = [];
  const syntheses = [];
  for (const x of unclaimed) {
    let projeler = 0;
    let ders = 0;
    try {
      const dersler = dersleriAyikla(readFileSync(x.path, 'utf8'));
      ders = dersler.length;
      projeler = new Set(dersler.map((d) => d.proje)).size;
    } catch { /* okunamayan dosya sentez sayılmaz; aşağıda sahipsiz olarak raporlanır */ }
    if (projeler > 1) syntheses.push({ file: x.file, ders, projeler });
    else orphans.push({ file: x.file, dir: x.meta?.project?.dir ?? '(metadata yok)' });
  }

  return { rows, orphans, syntheses, ok: rows.every((r) => r.status === 'OK') };
}

// ---------------------------------------------------------------------------

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const ARGS = process.argv.slice(2);
  const CHECK = ARGS.includes('--check');
  const ALL = ARGS.includes('--all');
  const FORCE = ARGS.includes('--force');
  const JSONOUT = ARGS.includes('--json');
  const dirs = ARGS.filter((a) => !a.startsWith('--'));

  if (CHECK) {
    const res = checkProjects();
    if (JSONOUT) {
      console.log(JSON.stringify({ parserVersion: PARSER_VERSION, ...res }, null, 2));
      process.exit(res.ok ? 0 : 1);
    }
    if (res.ok && !res.orphans.length) {
      console.log(`✅ kapanış hasadı: ${res.rows.length} projenin hepsi güncel (${PARSER_VERSION}).`);
      process.exit(0);
    }
    console.log('⚠️ kapanış hasadı — OK olmayan projeler:');
    for (const r of res.rows) {
      if (r.status === 'OK') continue;
      console.log(`   · ${r.project}  [${r.status}]  ${r.detail}`);
    }
    for (const o of res.orphans) {
      console.log(`   · (sahipsiz hasat) ${o.file}  — kaynak klasör "${o.dir}" Biten/ altında yok`);
    }
    for (const s of res.syntheses) {
      console.log(`   · (sentez) ${s.file}  — ${s.ders} aday ders, ${s.projeler} proje · hata değil, ONAY bekliyor`);
    }
    console.log(`\n   ${res.rows.filter((r) => r.status === 'OK').length}/${res.rows.length} güncel.`);
    console.log('   node scripts/kapanis-hasadi.mjs --all   (çıktı ADAY; APPROVED.md\'ye yalnız Mami taşır)');
    process.exit(res.ok ? 0 : 1);
  }

  // `--all` hedefi artık "dosyası yok" DEĞİL: `--check`'in OK vermediği her proje.
  // Boş bir rapor dosyası bir projeyi hasat edilmiş saymaz.
  const targets = ALL
    ? (FORCE ? bitenProjects() : checkProjects().rows.filter((r) => r.status !== 'OK')
        .map((r) => join(BITEN, r.project)))
    : dirs;

  if (!targets.length) {
    if (ALL) { console.log('✅ hasat bekleyen proje yok.'); process.exit(0); }
    console.error('kullanım: node scripts/kapanis-hasadi.mjs "<Biten/Proje>" | --all [--force] | --check [--json]');
    process.exit(2);
  }

  // Register override bayrağı ELDE değil LOOT'ta yaşar: HASAT loot'un görünümüdür, ondan
  // farklı bir register'da ölçerse İKİNCİ GERÇEKLİK doğar (Faz 9 düzeltme 3'ün yasakladığı şey).
  const REG_FLAG = ARGS.find((a) => a.startsWith('--register='))?.split('=')[1] ?? null;

  let errored = 0;
  for (const d of targets) {
    if (!existsSync(d)) { console.error(`yok: ${d}`); process.exit(2); }
    const lootPre = readLoot(d);
    const lootReg = lootPre?.objectiveMetrics?.registerSource === 'override'
      ? lootPre.objectiveMetrics.register : null;
    const h = harvest(d, { registerOverride: REG_FLAG ?? lootReg });
    const tgt = harvestTarget(d);
    if (tgt.collision) {
      h.meta.status = 'ERROR';
      h.meta.errors.unshift(
        `SLUG_COLLISION: aynı slug farklı proje — \`${tgt.collision.existing}\` "${tgt.collision.existingDir}" ` +
        `projesine ait; bu hasat \`${basename(tgt.path)}\` adına yazıldı`);
      console.log(`⚠️ SLUG ÇAKIŞMASI: ${h.name} ↔ "${tgt.collision.existingDir}" — mevcut dosya EZİLMEDİ.`);
    }
    const out = tgt.path;
    writeFileSync(out, render(h), 'utf8');
    if (h.meta.status === 'ERROR') errored++;
    const dersler = h.meta.status === 'OK' ? [...h.byClass.values()].length : 0;
    const pct = h.ratio == null ? '—' : `${Math.round(h.ratio * 100)}%`;
    console.log(
      `${h.meta.status === 'OK' ? '✅' : '🔴'} ${h.name} → ${out.replace(ROOT + '\\', '').replace(ROOT + '/', '')}  ` +
      `[${h.meta.status} · karne ${h.lint ? `${h.lint.total - h.lint.bad.length}/${h.lint.total}` : '—'} · ` +
      `revize ${h.revs.length} blok / ${h.uniqueFrames.size} kare · oran ${pct}` +
      `${h.multiRound ? ` · ${h.multiRound.rounds} tur, devir ${Math.round(h.multiRound.carryOverRate * 100)}%` : ''} · ` +
      `ders adayı ${dersler} · sınıflanamayan ${h.unclassified.length} · ` +
      // EKSİK = hiç bulunamayan. Ad sapması ayrı raporlanır — script kendi yorumunda bunu zaten
      // emrediyordu ("Sapmayı YOK'tan ayır") ama özet satırı `exact`e bakıp sapmayı EKSİK sayıyordu.
      // Kanıt (2026-07-28): Kütle'nin kiti 7/7 tamdı, klasör adı "5. Sınıf - Kütle ve Ağırlık",
      // dosya ön eki "Kütle ve Ağırlık" → hasat "kit eksik 7/7" dedi. Yanlış hasat bankayı zehirler.
      `kit eksik ${h.kit.filter((k) => !k.found).length}/7` +
      `${h.kit.filter((k) => k.found && !k.exact).length ? ` · ad sapması ${h.kit.filter((k) => k.found && !k.exact).length}` : ''}]`);
    for (const e of h.meta.errors) console.log(`      ↳ ${e}`);
  }
  if (errored) console.log(`\n🔴 ${errored} proje ERROR — ders adayı üretilmedi, Mami kararı gerekiyor.`);
}

export {
  harvest, render, renderLoot, readLoot, harvestPath, harvestTarget, bitenProjects,
  readHarvestMeta, checkProjects, computeRatio, parseRevize, parseTemiz,
  CLASSES, KIT, PARSER_VERSION, LOOT_FILE,
};
