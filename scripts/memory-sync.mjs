#!/usr/bin/env node
// MAMILAS — HAFIZA SENKRONU
//
// Neden var: sistemin aklı (auto-memory) repo'nun DIŞINDA, `~/.claude/projects/<slug>/memory`
// altında yaşıyor. Orada olan bir dosya git'te görünmez → 2026-07-26'da 34 hafızadan 18'i
// düştü ve hiçbir diff, hiçbir uyarı çıkmadı. Skill'lerin 32 atfı boşluğa gitti.
//
// Bu script tek yönlü bir AYNA kurar: canlı hafıza → `docs/ai/sync/memory/`.
// Kaybı görünür kılar: canlıdan silinen bir dosya repo'dan SİLİNMEZ, `archive/` altına taşınır.
// Böylece kayıp bir git hareketi olur — sessiz değil.
//
//   node scripts/memory-sync.mjs           # canlı → repo (aynala + rapor)
//   node scripts/memory-sync.mjs --check   # yazma yok; sapma varsa exit 1 (kapı için)
//   node scripts/memory-sync.mjs --adopt   # repo → CANLI (ikinci makinede, git pull sonrası)
//
// Varsayılan yön TEK YÖNLÜDÜR: canlı → repo. Repo kopyası bir yedektir, kanon değildir:
// prompt yazımının kanonu `agents/PROMPT-YASASI.md`, aktif iş kaydının kanonu
// `artifacts/current-work.json`dır.
//
// --adopt NEDEN VAR (2026-07-29, Mami çok-cihaz çalışıyor): üç ayrı tarama "ayna tek yönlü"
// diye işaretledi ve üçü de "gerçek kayıp üretilemedi" diye erteledi. Gerçek şu: Mami Mac'te
// öğrenilenle Windows'a geçiyor. `git pull` repo kopyasını getiriyor ama onu Windows'un CANLI
// hafızasına yazan hiçbir yol yoktu — yani ikinci makinedeki ajan bugün öğrenileni hafızasında
// BULAMIYORDU. Yön kararını script vermez (üç taramanın ortak hükmü): `--adopt` açıkça yazılır.
// Güvenlik: canlıda olup repoda olmayan dosya SİLİNMEZ, canlının `archive/`ine taşınır —
// diğer yöndeki kayıp görünürlüğünün aynası.

import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const CHECK = process.argv.includes('--check');
const ADOPT = process.argv.includes('--adopt');
const REPO_DIR = join(process.cwd(), 'docs', 'ai', 'sync', 'memory');
const ARCHIVE_DIR = join(REPO_DIR, 'archive');

// Claude Code proje slug'ı = cwd'nin alfanümerik olmayan her karakteri '-' olmuş hali.
// c:\Mamilas -> c--Mamilas · /Users/mami/Mamilas -> -Users-mami-Mamilas
const slug = process.cwd().replace(/[^a-zA-Z0-9]/g, '-');
const LIVE_DIR = join(homedir(), '.claude', 'projects', slug, 'memory');

const mdFiles = (dir) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')).sort() : [];

if (!existsSync(LIVE_DIR)) {
  if (ADOPT) {
    // İkinci makinede canlı dizin HİÇ olmayabilir — adopt'un asıl senaryosu tam da budur.
    mkdirSync(LIVE_DIR, { recursive: true });
    console.log(`canlı hafıza dizini yoktu, oluşturuldu: ${LIVE_DIR}`);
  } else {
    console.log(`hafıza dizini yok: ${LIVE_DIR}`);
    console.log('(bu makinede bu proje için auto-memory hiç yazılmamış — sapma sayılmaz)');
    console.log('İkinci makinede repo kopyasını canlıya almak için: --adopt');
    process.exit(0);
  }
}

const live = mdFiles(LIVE_DIR);
const repo = mdFiles(REPO_DIR);
const same = (name) =>
  repo.includes(name) &&
  readFileSync(join(LIVE_DIR, name), 'utf8') === readFileSync(join(REPO_DIR, name), 'utf8');

const added = live.filter((f) => !repo.includes(f));
const changed = live.filter((f) => repo.includes(f) && !same(f));
const dropped = repo.filter((f) => !live.includes(f));

const report = [
  ['yeni', added],
  ['değişen', changed],
  ['canlıdan düşen', dropped],
];

console.log(`canlı: ${live.length} dosya (${LIVE_DIR})`);
console.log(`repo : ${repo.length} dosya (docs/ai/sync/memory/)`);
for (const [label, list] of report) {
  if (list.length) console.log(`\n${label} (${list.length}):\n  ${list.join('\n  ')}`);
}

const diverged = added.length + changed.length + dropped.length;

if (ADOPT) {
  // repo → CANLI. Yön ters, güvenlik aynı: canlıda olup repoda olmayan dosya silinmez.
  const eklenecek = repo.filter((f) => !live.includes(f));
  const guncellenecek = repo.filter((f) => live.includes(f) && !same(f));
  const canliFazla = live.filter((f) => !repo.includes(f));
  if (!eklenecek.length && !guncellenecek.length && !canliFazla.length) {
    console.log('\n✅ canlı hafıza repo ile zaten aynı — yazılacak bir şey yok.');
    process.exit(0);
  }
  for (const f of [...eklenecek, ...guncellenecek]) {
    writeFileSync(join(LIVE_DIR, f), readFileSync(join(REPO_DIR, f)));
  }
  if (canliFazla.length) {
    const liveArchive = join(LIVE_DIR, 'archive');
    mkdirSync(liveArchive, { recursive: true });
    for (const f of canliFazla) renameSync(join(LIVE_DIR, f), join(liveArchive, f));
    console.log(`\n⚠️  ${canliFazla.length} dosya bu makinede vardı ama repoda YOK → canlı archive/ altına taşındı.`);
    console.log('   Bu makinede yazılmış ve hiç aynalanmamış hafıza olabilir — bak, gerekiyorsa geri koy.');
  }
  console.log(`\n✅ benimsendi (repo → canlı): +${eklenecek.length} yeni · ~${guncellenecek.length} güncel · →${canliFazla.length} arşiv`);
  process.exit(0);
}

if (CHECK) {
  if (diverged) {
    console.error(`\n❌ hafıza aynası sapmış (${diverged} dosya). Çalıştır: node scripts/memory-sync.mjs`);
    process.exit(1);
  }
  console.log('\n✅ hafıza aynası güncel.');
  process.exit(0);
}

if (!diverged) {
  console.log('\n✅ zaten güncel — yazılacak bir şey yok.');
  process.exit(0);
}

mkdirSync(REPO_DIR, { recursive: true });
for (const f of [...added, ...changed]) {
  writeFileSync(join(REPO_DIR, f), readFileSync(join(LIVE_DIR, f)));
}

// Canlıdan düşen dosya SİLİNMEZ — arşive taşınır. Kayıp görünür bir git hareketi olur.
if (dropped.length) {
  mkdirSync(ARCHIVE_DIR, { recursive: true });
  for (const f of dropped) {
    if (f === 'MEMORY.md') continue; // index her zaman canlıdan gelir
    renameSync(join(REPO_DIR, f), join(ARCHIVE_DIR, f));
  }
  console.log(`\n⚠️  ${dropped.length} dosya canlı hafızadan düşmüştü → archive/ altına taşındı.`);
  console.log('   Bu bir kayıp olabilir: git diff ile bak, gerekiyorsa geri koy.');
}

console.log(`\n✅ aynalandı: +${added.length} yeni · ~${changed.length} güncel · →${dropped.length} arşiv`);
