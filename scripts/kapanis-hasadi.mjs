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

import { readFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { lintFile } from './prompt-lint.mjs';

const ROOT = process.cwd();
const BITEN = join(ROOT, 'agents', 'COMMAND-INBOX', 'Biten');
const LESSONS = join(ROOT, 'agents', 'lessons');

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

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const harvestPath = (dir) => join(LESSONS, `CANDIDATES-${slugify(basename(dir))}.md`);

function projectFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).filter((e) => e.isFile()).map((e) => e.name);
}

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

function findWorld(dir, files) {
  const cmd = files.find((f) => /_?command\.json$/i.test(f) || /mamilas_command\.json$/i.test(f));
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

function harvest(dir) {
  const name = basename(dir);
  const files = projectFiles(dir);
  const world = findWorld(dir, files);

  // 1 — yapısal karne
  const promptFile = files.find((f) => /_PROMPTLAR\.(txt|md)$/i.test(f));
  const lint = promptFile ? lintFile(join(dir, promptFile)) : null;

  // 2 — ders adayları
  const revFile = files.find((f) => /revize.*\.(txt|md)$/i.test(f) || /REV[İI]ZE.*\.(txt|md)$/i.test(f));
  const revText = revFile ? readFileSync(join(dir, revFile), 'utf8') : null;
  const revs = revText ? parseRevize(revText) : [];
  const temiz = revText ? parseTemiz(revText) : null;
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

  return { dir, name, files, world, promptFile, lint, revFile, revs, temiz, byClass, unclassified, kit };
}

function render(h) {
  const L = [];
  const today = new Date().toISOString().slice(0, 10);
  L.push(`# KAPANIŞ HASADI — ${h.name}`);
  L.push('');
  L.push(`Kaynak: \`agents/COMMAND-INBOX/Biten/${h.name}/\` · hasat: ${today}`);
  L.push('');
  L.push('**Bu dosya banka DEĞİL.** Her satır ADAY. `agents/lessons/APPROVED.md`\'ye yalnız Mami taşır');
  L.push('(M7 yasası: otomatik promote yok — çöp ders sistemi zehirler). Kabul ettiğin ders satırını');
  L.push('olduğu gibi taşı, istemediğini burada bırak.');
  L.push('');

  // 1 — yapısal karne
  L.push('## 1 · Yapısal karne (prompt-lint)');
  L.push('');
  if (!h.lint) {
    L.push('⚠️ `_PROMPTLAR` dosyası yok — bu projenin yapısı ölçülemedi. Ölçülmemiş, temiz değil.');
  } else if (!h.lint.total) {
    L.push(`⚠️ \`${h.promptFile}\` içinde kare başlığı bulunamadı — parser çıpası tutmadı, elle bak.`);
  } else {
    const t = h.lint.total;
    L.push(`\`${h.promptFile}\` — **${t} kare**`);
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
  if (!h.revFile) {
    L.push('⚠️ Revize dosyası yok. **Bu revize turunun hiç yapılmadığı anlamına gelir** — kare');
    L.push('denetimi geçilmemiş bir video "biten" sayılmıştır. Ders çıkmaz çünkü kanıt yok.');
  } else {
    const revised = h.revs.length;
    const clean = h.temiz;
    const total = clean != null ? clean + revised : h.lint?.total ?? null;
    const oran = total ? `${Math.round((revised / total) * 100)}%` : '—';
    L.push(`\`${h.revFile}\` — **${revised} kare revize**${total ? ` / ${total} kare` : ''} · revize oranı **${oran}**`);
    L.push('');
    if (h.byClass.size) {
      L.push('Sınıflanan kusurlar — her satır onaylanmaya hazır biçimde yazıldı:');
      L.push('');
      L.push('```');
      for (const { cls, frames } of h.byClass.values()) {
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
      L.push(`**Sınıflandırılamadı — ${h.unclassified.length} kare, elle oku:**`);
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
  return L.join('\n') + '\n';
}

function bitenProjects() {
  if (!existsSync(BITEN)) return [];
  return readdirSync(BITEN, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => join(BITEN, e.name));
}

// ---------------------------------------------------------------------------

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const ARGS = process.argv.slice(2);
  const CHECK = ARGS.includes('--check');
  const ALL = ARGS.includes('--all');
  const dirs = ARGS.filter((a) => !a.startsWith('--'));

  if (CHECK) {
    const pending = bitenProjects().filter((d) => !existsSync(harvestPath(d)));
    if (!pending.length) {
      console.log('✅ kapanış hasadı: Biten/ altındaki her proje hasat edilmiş.');
      process.exit(0);
    }
    console.log(`⚠️ kapanış hasadı bekleyen ${pending.length} proje:`);
    for (const d of pending) console.log(`   · ${basename(d)}`);
    console.log('\n   node scripts/kapanis-hasadi.mjs --all   (çıktı ADAY; APPROVED.md\'ye yalnız Mami taşır)');
    process.exit(1);
  }

  const targets = ALL
    ? bitenProjects().filter((d) => !existsSync(harvestPath(d)))
    : dirs;

  if (!targets.length) {
    if (ALL) { console.log('✅ hasat bekleyen proje yok.'); process.exit(0); }
    console.error('kullanım: node scripts/kapanis-hasadi.mjs "<Biten/Proje>" | --all | --check');
    process.exit(2);
  }

  for (const d of targets) {
    if (!existsSync(d)) { console.error(`yok: ${d}`); process.exit(2); }
    const h = harvest(d);
    const out = harvestPath(d);
    writeFileSync(out, render(h), 'utf8');
    const dersler = [...h.byClass.values()].length;
    console.log(
      `✅ ${h.name} → ${out.replace(ROOT + '\\', '').replace(ROOT + '/', '')}  ` +
      `[karne ${h.lint ? `${h.lint.total - h.lint.bad.length}/${h.lint.total}` : '—'} · ` +
      `ders adayı ${dersler} · sınıflanamayan ${h.unclassified.length} · ` +
      `kit eksik ${h.kit.filter((k) => !k.exact).length}/7]`);
  }
}

export { harvest, render, harvestPath, bitenProjects, CLASSES, KIT };
