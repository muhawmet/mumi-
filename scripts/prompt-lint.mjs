#!/usr/bin/env node
// MAMILAS PROMPT LİNTERİ — yasayı belgeden DUVARA çevirir.
//
// Neden var (2026-07-27 ölçümü): kazanan biçim yazılı olmadığı sürece çürüyor.
// Sabit Sürat'ta 44/44 karede duran temas cümlesi, bir sonraki videonun ilk 8 karesinde
// 2/8'e düştü. Yasa `agents/PROMPT-YASASI.md`'ye yazıldı — ama okunmayan yasa da bir ricadır.
// Bu script ricayı ölçüme çevirir: kare kare, hangi slot eksik.
//
//   node scripts/prompt-lint.mjs <dosya._PROMPTLAR.txt>     # tek dosya
//   node scripts/prompt-lint.mjs --all                      # COMMAND-INBOX'taki hepsi
//   node scripts/prompt-lint.mjs <dosya> --strict           # eksik varsa exit 1 (hook/kapı için)
//
// Kanıtla sınanır: Bileşke Kuvvet'te temas 0/52 ve TEXT 0/52 bulmalı, Sabit Sürat'ta 44/44.
// Bulamıyorsa linter yanlıştır, prompt değil.

// `lintFile` / `SLOTS` dışa açıktır: kapanış hasadı (scripts/kapanis-hasadi.mjs) aynı ölçümü
// kullanır. Yasa iki yerde ölçülmez — ikinci kopya bu fazda söktüğümüz hastalığın kendisi.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// ---------------------------------------------------------------------------
// SLOT TANIMLARI — kaynağı agents/PROMPT-YASASI.md §2. Her kontrol bir YETENEĞİ ölçer,
// kelime avlamaz: aranan şey ifadenin kendisi değil, o slotun karede yapılmış olması.
// ---------------------------------------------------------------------------
const SLOTS = [
  {
    key: 'lens',
    label: 'lens/kamera (sayısal, başta)',
    test: (b) => /\b\d{2,3}\s*mm\b/i.test(b),
    why: 'NB2 sayısal lensi okur; "cinematic lens" okumaz.',
  },
  {
    key: 'handle',
    label: '@handle (karakter/hero-prop)',
    test: (b) => /@[a-zçğıöşü][a-z0-9çğıöşü_]*/i.test(b),
    why: 'Kimlik tag ile taşınır; tarif edilmez. Tag\'siz tekrar eden prop her karede başka çıkar.',
    soft: true, // kavram/mekân karesinde karakter olmayabilir
  },
  {
    key: 'ten',
    label: 'ten kilidi (mat, yeşil/gri değil)',
    test: (b) => /(matte\s+\w*\s*skin|never tinted green|low specular)/i.test(b),
    why: 'Yokluğunda yeşil/gri cilt çıkıyor (Bileşke K14, K39).',
    soft: true, // insansız karede gerekmez
    needsIf: (b) => /@[a-zçğıöşü]/i.test(b) || /\b(child|children|boy|girl|teacher|woman|man|hand|face)\b/i.test(b),
  },
  {
    key: 'canli',
    label: 'canlı üçlü (karede yaşayan 3 şey)',
    test: (b) => /(three things are alive|alive in the frame)/i.test(b),
    why: 'Motion fazının canlandıracağı hareketi önceden kilitler.',
  },
  {
    key: 'derinlik',
    label: 'üç katman derinlik',
    test: (b) => /(depth in three layers|three layers —|foreground[\s\S]{0,80}bokeh)/i.test(b),
    why: 'Kare-özel yazılmazsa void/kopuk kadraj doğuyor (Bileşke K8, K11).',
  },
  {
    key: 'temas',
    label: 'temas / yerçekimi cümlesi',
    test: (b) => /(rests in contact|contact shadow)/i.test(b),
    why: 'EN NET KANIT: Bileşke 0/52 → 4 karede havada yüzen nesne. Sabit Sürat 44/44 → sıfır.',
  },
  {
    key: 'style',
    label: 'STYLE kuyruğu',
    test: (b) => /^STYLE:/im.test(b),
    why: 'Dünya kilidi. ≤90 kelime olmalı — uzunluk kare-özel oranı düşürüyor.',
  },
  {
    key: 'text',
    label: 'TEXT: slotu (ayrı satır)',
    test: (b) => /^TEXT:/im.test(b),
    why: 'Yokluğunda 11 karede bozuk/İngilizce tabela + "R = 0 N"→"R = ON" (Bileşke 0/52).',
  },
  {
    key: 'neg',
    label: 'NEGATIVE: slotu (ayrı satır)',
    test: (b) => /^NEGATIVE:/im.test(b) || /FRAME NEGATIVE/i.test(b),
    why: 'İki temiz setin ortak paydası: Sürtünme 31/31 inline, Sabit Sürat 44/44.',
  },
];

// Tuzak kelimeler — kaynakta kapatılanlar dahil; prompta sızarsa kare bozuluyor.
const TRAPS = [
  { re: /\bsaffron\b/i, fix: 'warm golden — NB2 "saffron"u safran ÇİÇEĞİ çiziyor (7 kare)' },
  { re: /\bbloom\b/i, fix: '"soft round warm-golden glow of light" — NB2 "bloom"u çiçek çiziyor' },
  { re: /\bsheen\b/i, fix: 'subsurface-style translucency — "sheen" plastik cilt doğuruyor' },
  { re: /\bnegative space\b/i, fix: 'pozitif dekor tarifi — "negative space" boş void doğuruyor' },
  { re: /\bclean table\b/i, fix: 'giydirilmiş yüzey — "clean table" void doğuruyor' },
];

// STYLE bloğu kelime tavanı (yasa §0: 269 kelime → %65 revize; 88 kelime → %14).
const STYLE_MAX_WORDS = 110;

// ---------------------------------------------------------------------------

// Teslim biçimi projeden projeye değişiyor (ölçüldü 2026-07-27: `### K01 | VO1 …` ·
// `K01 [MİRA] | VO 1: …` · `Sahne 14` · `Kare 8 —`) ve ayraç bazen başlığı sarıyor, bazen
// gövdeyi. Bu yüzden ayraca değil KARE BAŞLIĞINA çıpalanır: iki başlık arası gövdedir.
// Biçim sözleşmesi olmadığı için parser biçime dayanmaz — yasa §5'te şablon var, ama linter
// eski dosyaları da okuyabilmeli, yoksa kanıtla sınanamaz.
// `(?!\()` — dosya sonundaki kesim notu (`K36(S40+41) K38(S43+44)…`) kare başlığı sanılıyordu.
const HEAD_RE = /^(?:#{1,6}\s*)?(?:K|KARE|Kare|SAHNE|Sahne|SHOT|Shot)\s*[-–—]?\s*\d{1,3}(?!\()\b/;
const NOISE_RE = /^(?:[-=_]{4,}|#{4,}.*)\s*$/;

function parseBlocks(text) {
  const lines = text.split(/\r?\n/);
  const heads = [];
  lines.forEach((l, i) => { if (HEAD_RE.test(l.trim())) heads.push(i); });
  const out = [];
  for (let h = 0; h < heads.length; h++) {
    const start = heads[h];
    const end = h + 1 < heads.length ? heads[h + 1] : lines.length;
    const body = lines.slice(start + 1, end).filter((l) => !NOISE_RE.test(l.trim())).join('\n');
    out.push({ head: lines[start].trim().replace(/^#+\s*/, '').slice(0, 90), body });
  }
  return out;
}

function lintBlock(body) {
  const problems = [];
  for (const s of SLOTS) {
    if (s.test(body)) continue;
    if (s.soft && s.needsIf && !s.needsIf(body)) continue; // bu karede gerekmiyor
    if (s.soft && !s.needsIf) continue;
    problems.push({ kind: 'slot', key: s.key, msg: `${s.label} YOK`, why: s.why });
  }
  for (const t of TRAPS) {
    if (t.re.test(body)) problems.push({ kind: 'trap', key: 'tuzak', msg: `tuzak kelime: ${t.re.source.replace(/\\b/g, '')}`, why: `→ ${t.fix}` });
  }
  const style = body.match(/^STYLE:([\s\S]*?)(?=^\w[\w ]*:|\Z)/im);
  if (style) {
    const w = style[1].trim().split(/\s+/).length;
    if (w > STYLE_MAX_WORDS) {
      problems.push({ kind: 'style', key: 'style', msg: `STYLE ${w} kelime (tavan ${STYLE_MAX_WORDS})`, why: 'Kalıp büyüdükçe kare-özel oran düşüyor; %35 oran → %65 revize.' });
    }
  }
  return problems;
}

export function lintFile(path) {
  const text = readFileSync(path, 'utf8');
  const blocks = parseBlocks(text);
  const rows = blocks.map((b) => ({ head: b.head, problems: lintBlock(b.body) }));
  const bad = rows.filter((r) => r.problems.length);
  const counts = {};
  for (const s of SLOTS) counts[s.key] = blocks.filter((b) => s.test(b.body)).length;
  return { path, total: blocks.length, rows, bad, counts };
}

export { SLOTS, TRAPS, parseBlocks, lintBlock };

function report(r) {
  const name = r.path.split(/[\\/]/).pop();
  console.log(`\n━━ ${name} — ${r.total} kare`);
  if (!r.total) { console.log('  (blok bulunamadı: "### K.." başlığı + "-----" ayracı bekleniyor)'); return; }
  const cov = SLOTS.map((s) => `${s.key} ${r.counts[s.key]}/${r.total}`).join(' · ');
  console.log(`  kapsam: ${cov}`);
  if (!r.bad.length) { console.log('  ✅ eksik yok'); return; }
  for (const row of r.bad) {
    console.log(`  ▸ ${row.head}`);
    for (const p of row.problems) console.log(`      ✗ ${p.msg}\n        ${p.why}`);
  }
  console.log(`  ${r.bad.length}/${r.total} kare eksikli`);
}

// CLI — yalnız doğrudan çalıştırıldığında. `import` edildiğinde (kapanış hasadı) sessiz kalır.
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const ARGS = process.argv.slice(2);
  const STRICT = ARGS.includes('--strict');
  const ALL = ARGS.includes('--all');
  const files = ARGS.filter((a) => !a.startsWith('--'));

  const targets = [];
  if (ALL) {
    const root = join(process.cwd(), 'agents', 'COMMAND-INBOX');
    const walk = (dir) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/_PROMPTLAR\.(txt|md)$/i.test(e.name)) targets.push(p);
      }
    };
    if (existsSync(root)) walk(root);
  } else {
    targets.push(...files);
  }

  if (!targets.length) {
    console.error('kullanım: node scripts/prompt-lint.mjs <_PROMPTLAR.txt> [--strict]  ya da  --all');
    process.exit(2);
  }

  let bad = 0;
  for (const t of targets) {
    if (!existsSync(t)) { console.error(`yok: ${t}`); bad++; continue; }
    const r = lintFile(t);
    report(r);
    bad += r.bad.length;
  }

  console.log(`\n${bad ? '⚠️' : '✅'} toplam eksikli kare: ${bad}`);
  if (STRICT && bad) process.exit(1);
}
