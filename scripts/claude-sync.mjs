#!/usr/bin/env node
// MAMILAS — CLAUDE SENKRONU (iki yönlü, silmeyen)
//
// Neden var: git yalnız proje klasörünü taşır. Claude'u "Claude" yapan her şey —
// hafıza, kullanıcı skill'leri, global CLAUDE.md — `~/.claude` altında, repo'nun DIŞINDA
// yaşar. İki makinede iki ayrı `~/.claude` vardır ve birbirlerinden haberleri yoktur.
//
// 2026-07-28'de bu iki kez canlıda ısırdı: sabah Mac'te 21 dosya arşive gitti, akşam
// Windows'ta 9 dosya gidecekti. Sebebi tek: `memory-sync.mjs` TEK YÖNLÜ ve canlıyı tek
// otorite sayıyor — repo'da olup canlıda olmayan bir dosyayı "silinmiş" sanıp arşive atıyor.
// İkinci makinede o script'in emrettiği tamir, birinci makinenin aklını imha ediyor.
//
// Bu script o hatayı yapısal olarak yapamaz:
//   · ÜÇ YÖNLÜ karşılaştırır (canlı · repo · manifest'teki son ortak taban).
//   · Hiçbir koşulda dosya SİLMEZ. Kayıp bir git hareketi olur, sessiz olmaz.
//   · Yön kararını tahminle vermez; iki taraf da değiştiyse ÇATIŞMA der ve durur.
//   · mtime'a GÜVENMEZ — git checkout mtime'ı bugüne çeker, taze dosya bayat görünür.
//   · Hash CRLF-normalize edilir (Windows/Mac aynı dosyayı farklı sanmasın).
//
//   node scripts/claude-sync.mjs            # senkronla + rapor
//   node scripts/claude-sync.mjs --check    # yazma yok; sapma/çatışma varsa exit 1
//   node scripts/claude-sync.mjs --dry-run  # ne yapacağını yaz, yapma
//
// Taban (`~/.claude/.mamilas-sync-base.json`) MAKİNEYE ÖZELDİR ve repoya girmez — "bu
// makinenin en son gördüğü ortak nokta" demektir. Repoda tutulursa git onu taşır, taban
// karşı makinenin hâline dönüşür ve script gelen güncellemeyi bayat kopyayla ezer.
// Taban yoksa ilk koşu güvenli taraftan başlar: farklar çatışma olarak gelir.

import {
  cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import { dirname, join, relative, sep } from 'node:path';
import { decide, icerikHash } from './lib/sync-karar.mjs';

const argv = new Set(process.argv.slice(2));
const CHECK = argv.has('--check');
const DRY = argv.has('--dry-run') || CHECK;

const REPO = process.cwd();
const SYNC_DIR = join(REPO, 'docs', 'ai', 'sync');
const ARCHIVE = join(SYNC_DIR, 'archive');
const HOME = join(homedir(), '.claude');

// 🔴 TABAN MAKİNEYE ÖZELDİR — repoda DEĞİL. (2026-07-28, çelişkili denetim çürüttü.)
// İlk hal tabanı `docs/ai/sync/manifest.json`de tutuyordu; git onu taşıyınca `base`
// artık "benim en son gördüğüm ortak nokta" olmaktan çıkıp "karşı makinenin son hâli"
// oluyordu. `git pull` sonrası base daima repo'ya eşitti → script her seferinde
// "yalnız canlı değişti" hükmü verip KARŞI MAKİNENİN TAZE GÜNCELLEMESİNİ eziyordu,
// üstelik "0 silindi" diye rapor ederek. Çatışma dalı da bu yüzden hiç ateşlemiyordu.
// Yasa: **paylaşılan taban diye bir şey yoktur.** Git yükü taşır, tabanı taşımaz.
const MANIFEST = join(HOME, '.mamilas-sync-base.json');

// Claude Code proje slug'ı = cwd'nin alfanümerik olmayan her karakteri '-' olmuş hali.
// c:\Mamilas -> c--Mamilas · /Users/mami/Mamilas -> -Users-mami-Mamilas
const slug = REPO.replace(/[^a-zA-Z0-9]/g, '-');

// ── Taşınan yüzeyler ───────────────────────────────────────────────────────────
// Her giriş bir AĞAÇ çifti: canlı taraf ↔ repo taraf. `filter` hangi dosyaların
// taşınacağını söyler. Buraya bir yüzey eklemek, onu iki makine arasında canlandırır.
const SURFACES = [
  {
    id: 'hafıza',
    live: join(HOME, 'projects', slug, 'memory'),
    repo: join(SYNC_DIR, 'memory'),
    filter: (rel) => rel.endsWith('.md') && !rel.startsWith(`archive${sep}`),
  },
  {
    id: 'skill',
    live: join(HOME, 'skills'),
    repo: join(SYNC_DIR, 'skills'),
    // Yalnız MAMILAS skill'leri. Başkasının/eklentinin skill'i taşınmaz.
    filter: (rel) => rel.startsWith('mamilas-'),
  },
  {
    id: 'global',
    live: HOME,
    repo: join(SYNC_DIR, 'global'),
    // Tek dosya seviyesi — alt dizinlere inilmez (aşağıda derinlik sınırı var).
    filter: (rel) => rel === 'CLAUDE.md' || rel === 'RTK.md',
  },
];

// `settings.json` BİLEREK dışarıda: içinde makineye özel yol ve izin var
// (notify komutu, sandbox, plugin cache yolları). Taşınırsa diğer makinede kırılır.

// ── Yardımcılar ────────────────────────────────────────────────────────────────

/** CRLF-normalize hash. Satır sonu farkı iki makinede aynı dosyayı ayrı göstermesin. */
const sha = (data) => createHash('sha256').update(data).digest('hex').slice(0, 16);
const hash = (path) => icerikHash(readFileSync(path), sha);

/** Bir ağacın altındaki dosyaları repo-göreli yollarla listeler. */
const walk = (root, filter, depth = Infinity) => {
  const out = [];
  if (!existsSync(root)) return out;
  const rec = (dir, level) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, entry.name);
      const rel = relative(root, abs);
      let isDir = entry.isDirectory();
      let isFile = entry.isFile();
      // Symlink/junction hem isDirectory hem isFile'da FALSE döner — eskiden bu tür
      // girdiler taramaya hiç girmiyordu ve script "✅ güncel" diyordu. Mac'te bir
      // skill'i dev repo'ya symlink'lemek yaygın; o skill sessizce yedeklenmiyordu.
      if (entry.isSymbolicLink()) {
        try { const st = statSync(abs); isDir = st.isDirectory(); isFile = st.isFile(); }
        catch { continue; } // kırık symlink — atla, patlama
      }
      if (isDir) {
        if (level > 1) rec(abs, level - 1);
      } else if (isFile && filter(rel)) {
        out.push(rel);
      }
    }
  };
  rec(root, depth);
  return out.sort();
};

const copy = (from, to) => {
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to);
};

/** Çatışma arşivi için klasör adı. */
const stamp = () => new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

// ── Manifest ───────────────────────────────────────────────────────────────────
/** { "<surface>/<rel>": "<hash>" } — BU MAKİNENİN en son gördüğü ortak nokta. */
let base = {};
let tabanVar = false;
if (existsSync(MANIFEST)) {
  try {
    base = JSON.parse(readFileSync(MANIFEST, 'utf8')).files ?? {};
    tabanVar = true;
  } catch {
    // Yarım yazılmış/bozuk taban script'i öldürmemeli. Taban YOK sayılır: bu, farklı
    // dosyaları çatışmaya düşürür — yani güvenli tarafa. Sessizce geçme, söyle.
    console.error('⚠️  taban dosyası okunamadı, YOK sayıldı (farklar çatışma olarak gelecek):');
    console.error(`   ${MANIFEST}`);
  }
}
const nextBase = {};

// ── Karar tablosu ──────────────────────────────────────────────────────────────
// canlı · repo · taban  →  hareket
//   yok  ·  var ·  yok   →  ÇEK   (diğer makinede doğmuş; bugün 9 hafızayı kurtaran hal)
//   var  ·  yok ·  yok   →  İT    (burada doğmuş)
//   A    ·  A   ·   —    →  eşit  (taban tazelenir)
//   A    ·  B   ·  B     →  İT    (yalnız canlı değişti)
//   A    ·  B   ·  A     →  ÇEK   (yalnız repo değişti)
//   A    ·  B   ·  C     →  ÇATIŞMA (ikisi de değişti — yön tahmin EDİLMEZ)
//   yok  ·  var ·  var   →  GERİ YÜKLE + uyar (canlıdan düşmüş; SİLME değil)
//   var  ·  yok ·  var   →  GERİ YÜKLE + uyar (repodan düşmüş)

const acts = { push: [], pull: [], conflict: [], restoredLive: [], restoredRepo: [], same: 0 };

for (const surface of SURFACES) {
  const depth = surface.id === 'global' ? 1 : Infinity;
  const liveFiles = walk(surface.live, surface.filter, depth);
  const repoFiles = walk(surface.repo, surface.filter, depth);
  const all = [...new Set([...liveFiles, ...repoFiles])].sort();

  for (const rel of all) {
    const key = `${surface.id}/${rel.split(sep).join('/')}`;
    const livePath = join(surface.live, rel);
    const repoPath = join(surface.repo, rel);
    const l = existsSync(livePath) ? hash(livePath) : null;
    const r = existsSync(repoPath) ? hash(repoPath) : null;
    const b = base[key] ?? null;
    const item = { key, livePath, repoPath };

    switch (decide(l, r, b)) {
      case 'yok': break;
      case 'esit': acts.same++; nextBase[key] = l; break;
      case 'cek': acts.pull.push(item); nextBase[key] = r; break;
      case 'it': acts.push.push(item); nextBase[key] = l; break;
      case 'geriYukleCanli': acts.restoredLive.push(item); nextBase[key] = r; break;
      case 'geriYukleRepo': acts.restoredRepo.push(item); nextBase[key] = l; break;
      // Çatışmada taban TAZELENMEZ — Mami çözene kadar çatışma olarak kalsın.
      case 'catisma': acts.conflict.push(item); nextBase[key] = b ?? null; break;
      // Bir taraf sildi, diğeri değiştirdi. Silinen tarafta arşivlenecek dosya yok;
      // hangisinin geçerli olduğunu script bilemez, o yüzden yine durur.
      case 'catismaSilme': acts.conflict.push({ ...item, silme: true }); nextBase[key] = b ?? null; break;
    }
  }
}

// ── Uygula ─────────────────────────────────────────────────────────────────────
if (!DRY) {
  for (const { livePath, repoPath } of [...acts.push, ...acts.restoredRepo]) copy(livePath, repoPath);
  for (const { livePath, repoPath } of [...acts.pull, ...acts.restoredLive]) copy(repoPath, livePath);

  if (acts.conflict.length) {
    const dir = join(ARCHIVE, `catisma-${stamp()}`);
    for (const { key, livePath, repoPath } of acts.conflict) {
      const safe = key.replace(/[\\/]/g, '__');
      if (existsSync(livePath)) copy(livePath, join(dir, `${safe}.canli`));
      if (existsSync(repoPath)) copy(repoPath, join(dir, `${safe}.repo`));
    }
  }

  // Çatışan dosyaların tabanı tazelenmez — çözülene kadar çatışma olarak kalsınlar.
  const files = Object.fromEntries(Object.entries(nextBase).filter(([, v]) => v));
  const body = `${JSON.stringify({ note: 'claude-sync tabanı — BU MAKİNEYE ÖZEL, repoya taşınmaz', files }, null, 2)}\n`;
  // Atomik yazım: yarım kalan bir yazım sonraki her koşuyu ve kapıyı öldürürdü.
  mkdirSync(dirname(MANIFEST), { recursive: true });
  const tmp = `${MANIFEST}.tmp`;
  writeFileSync(tmp, body);
  renameSync(tmp, MANIFEST);
}

// ── Rapor ──────────────────────────────────────────────────────────────────────
const line = (label, arr) => { if (arr.length) { console.log(`\n${label} (${arr.length}):`); for (const a of arr) console.log(`  ${a.key}`); } };

console.log(`canlı : ${HOME}`);
console.log(`repo  : ${relative(REPO, SYNC_DIR)}`);
console.log(`taban : ${tabanVar ? MANIFEST : 'YOK — bu makinede İLK KOŞU'}`);
console.log(`eşit  : ${acts.same} dosya`);
if (!tabanVar) {
  console.log('\nℹ️  İlk koşu: bu makinenin tabanı yok, o yüzden iki tarafta da VAR olup');
  console.log('   FARKLI olan her dosya çatışma olarak gelir. Bu güvenli taraftır —');
  console.log('   hangi sürümün doğru olduğunu bir kez seçersin, sonrası kendiliğinden akar.');
}

line(DRY ? 'repo→canlı ÇEKİLECEK' : 'repo→canlı çekildi', acts.pull);
line(DRY ? 'canlı→repo İTİLECEK' : 'canlı→repo itildi', acts.push);
line(DRY ? 'canlıdan DÜŞMÜŞ, geri konacak' : 'canlıdan düşmüştü, geri kondu', acts.restoredLive);
line(DRY ? 'repodan DÜŞMÜŞ, geri konacak' : 'repodan düşmüştü, geri kondu', acts.restoredRepo);
line('🔴 ÇATIŞMA — iki taraf da değişti, yön tahmin edilmedi', acts.conflict.filter((c) => !c.silme));
line('🔴 ÇATIŞMA (silme) — bir taraf sildi, diğeri değiştirdi', acts.conflict.filter((c) => c.silme));

const moved = acts.pull.length + acts.push.length + acts.restoredLive.length + acts.restoredRepo.length;

if (acts.conflict.length) {
  console.log(`\n🔴 ${acts.conflict.length} çatışma. Hiçbiri yazılmadı${DRY ? '' : '; iki sürüm de arşive alındı'}.`);
  console.log('   Hangi sürümün doğru olduğunu MAMİ seçer — script yön tahmin etmez.');
  process.exit(1);
}
if (CHECK) {
  if (moved) { console.log(`\n❌ ${moved} dosya sapmış. Çalıştır: node scripts/claude-sync.mjs`); process.exit(1); }
  console.log('\n✅ claude senkronu güncel.');
  process.exit(0);
}
if (!moved) console.log('\n✅ claude senkronu zaten güncel.');
else console.log(DRY ? `\n${moved} dosya taşınacak · 0 silinecek. (kuru koşu — yazılmadı)` : `\n✅ ${moved} dosya taşındı · 0 silindi.`);
