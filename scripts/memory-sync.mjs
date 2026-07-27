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
//   node scripts/memory-sync.mjs           # aynala + rapor
//   node scripts/memory-sync.mjs --check   # yazma yok; sapma varsa exit 1 (kapı için)
//
// Ayna TEK YÖNLÜDÜR. Repo kopyası bir yedektir, kanon değildir: prompt yazımının kanonu
// `agents/PROMPT-YASASI.md`, durum kaydının kanonu EXECUTION_STATE.md'dir.

import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const CHECK = process.argv.includes('--check');
const REPO_DIR = join(process.cwd(), 'docs', 'ai', 'sync', 'memory');
const ARCHIVE_DIR = join(REPO_DIR, 'archive');

// Claude Code proje slug'ı = cwd'nin alfanümerik olmayan her karakteri '-' olmuş hali.
// c:\Mamilas -> c--Mamilas · /Users/mami/Mamilas -> -Users-mami-Mamilas
const slug = process.cwd().replace(/[^a-zA-Z0-9]/g, '-');
const LIVE_DIR = join(homedir(), '.claude', 'projects', slug, 'memory');

const mdFiles = (dir) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')).sort() : [];

if (!existsSync(LIVE_DIR)) {
  console.log(`hafıza dizini yok: ${LIVE_DIR}`);
  console.log('(bu makinede bu proje için auto-memory hiç yazılmamış — sapma sayılmaz)');
  process.exit(0);
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
