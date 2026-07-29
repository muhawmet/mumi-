#!/usr/bin/env node
// MAMILAS OTURUM SÜREKLİLİĞİ — aktif işin tek makine-okunur gerçeği.
//
// Neden var (2026-07-29 ölçümü): oturum açılış otoritesi EXECUTION_STATE.md "Aktif video: YOK"
// diyordu; aynı sabah diskte 50 klip üretilmişti (`stat` → Jul 29 09:11–09:16) ve "Üreme"
// kelimesi 1328 satırlık ledger'ın hiçbir yerinde geçmiyordu. Elle güncellenen düzyazı bir gün
// bayatlar ve hiçbir şey onu kırmızıya çevirmez. Mami'nin "her işte yeniden başlıyoruz"
// şikâyetinin mekanizması budur.
//
// Yasa tek cümle:
//   Aktif iş hakkında bir cümle kurulacaksa kaynağı  artifacts/current-work.json
//   Geçmiş  hakkında bir cümle kurulacaksa kaynağı  EXECUTION_STATE.md (arşiv, otorite değil)
//
//   node scripts/current-work.mjs                      # kaydı oku ve bas (hook ile birebir aynı metin)
//   node scripts/current-work.mjs baslat "<projectId>" [--faz prompt]
//   node scripts/current-work.mjs ilerle --bitti "<...>" --sirada "<...>" [--faz motion]
//   node scripts/current-work.mjs bloke "<sebep>" | bloke --ac
//   node scripts/current-work.mjs sor "<Mami kararı>" | sor --cevaplandi
//   node scripts/current-work.mjs kit MOTION=var revize=yok
//   node scripts/current-work.mjs medya "<yol>" --klip 50 [--vo 1] [--muzik 1]
//   node scripts/current-work.mjs kapat
//   node scripts/current-work.mjs --check              # drift varsa exit 1 (kapıya BAĞLANMAZ)
//
// `readState` / `driftOf` / `renderState` dışa açıktır: SessionStart hook'u
// (.claude/hooks/oturum-durumu.mjs) AYNI kodu çağırır. İkinci kopya yazılmaz — prompt-lint'in
// kapanis-hasadi'ye `lintFile` verdiği desenin aynısı. İki yerde ölçülen yasa iki gerçek üretir.
//
// ORTAM YASASI: saf Node, bash yok, harici bağımlılık yok. BOM + CRLF okunur, çıktı LF.
// Türkçe klasör adları NFC normalize edilerek karşılaştırılır (macOS NFD diskte yaşar).

import {
  readFileSync, writeFileSync, existsSync, readdirSync, renameSync, statSync,
} from 'node:fs';
import { join, resolve, dirname, sep } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_DEFAULT = resolve(HERE, '..');

export const SCHEMA_VERSION = 1;
export const STATE_REL = 'artifacts/current-work.json';
export const INBOX_REL = 'agents/COMMAND-INBOX';

export const PHASES = ['enzim', 'prompt', 'denetim', 'motion', 'uretim', 'kurgu', 'kapandi'];
export const STATUSES = ['aktif', 'bloke', 'mami-bekliyor', 'kapandi'];

// PROMPT-YASASI §5 teslim seti + kaba kurgu (kitin beşinci parçası).
// Anahtar = kayıtta görünen ad, matcher = dosya adı son eki (küçük harfe indirgenmiş).
export const KIT = [
  { key: 'REFERANSLAR', ends: ['_referanslar.txt'] },
  { key: 'PROMPTLAR', ends: ['_promptlar.txt', '_promptlar.md'] },
  { key: 'revize', ends: ['_revize.txt'] },
  { key: 'MOTION', ends: ['_motion.txt', '_motion.md'] },
  { key: 'EDIT-PLAN', ends: ['_edit-plan.txt'] },
  { key: 'SESLENDIRME', ends: ['_seslendirme.txt'] },
  { key: 'SUNO', ends: ['_suno.txt'] },
  { key: 'KABA-KURGU.xml', ends: ['kaba-kurgu.xml'] },
];

const VIDEO_EXT = ['.mp4', '.mov', '.m4v'];
const AUDIO_EXT = ['.wav', '.mp3', '.m4a', '.aac', '.flac'];

// ---------------------------------------------------------------------------
// Yardımcılar — hepsi ortam varsayımını TEST EDİLEBİLİR yapacak kadar dar.
// ---------------------------------------------------------------------------

/** BOM'u soyar. CRLF'i JSON.parse zaten yutar; BOM yutmaz — 2026-07 protocolHash dersi. */
function readTextSafe(abs) {
  return readFileSync(abs, 'utf8').replace(/^﻿/, '');
}

/** macOS diskte NFD, JSON'da NFC yaşar. Karşılaştırmada İKİ TARAF da normalize edilir. */
export const nfc = (s) => String(s ?? '').normalize('NFC');

/** `~` genişletmesi — kayıt taşınabilir kalsın diye ev dizini yazılmaz, `~` yazılır. */
export function expandHome(p) {
  const s = String(p ?? '');
  if (s === '~') return homedir();
  if (s.startsWith('~/') || s.startsWith('~\\')) return join(homedir(), s.slice(2));
  return s;
}

/** JSON'daki POSIX yolu platform yoluna çevirir (Windows'ta `\`). */
export function toPlatformPath(root, relPosix) {
  return resolve(root, ...String(relPosix ?? '').split('/').filter(Boolean));
}

/** Repo-göreli POSIX yol üretir — JSON'a ASLA Windows path'i yazılmaz. */
export function toPosixRel(root, abs) {
  return resolve(abs).slice(resolve(root).length).split(sep).filter(Boolean).join('/');
}

function git(root, args) {
  try {
    return execFileSync('git', args, {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// OKUMA — hiçbir koşulda throw etmez. "yok" ile "bozuk" AYRI raporlanır:
// gate.sh'ın python3 no-op dersi tam buydu — sessizlik iki farklı gerçeği aynı gösteriyordu.
// ---------------------------------------------------------------------------
export function readState(root = REPO_DEFAULT) {
  const abs = toPlatformPath(root, STATE_REL);
  if (!existsSync(abs)) {
    return { ok: false, reason: 'yok', detail: `${STATE_REL} yok — aktif iş kaydı hiç açılmamış.` };
  }
  let raw;
  try {
    raw = readTextSafe(abs);
  } catch (e) {
    return { ok: false, reason: 'bozuk', detail: `${STATE_REL} okunamadı: ${e.message}` };
  }
  let state;
  try {
    state = JSON.parse(raw);
  } catch (e) {
    return { ok: false, reason: 'bozuk', detail: `${STATE_REL} geçersiz JSON: ${e.message}` };
  }
  if (state === null || typeof state !== 'object' || Array.isArray(state)) {
    return { ok: false, reason: 'bozuk', detail: `${STATE_REL} tek nesne olmalı (dizi/boş değil).` };
  }
  if (state.version !== SCHEMA_VERSION) {
    return {
      ok: false,
      reason: 'sürüm',
      detail: `şema v${state.version} tanınmıyor (bu araç v${SCHEMA_VERSION} okur) — `
        + 'scripts/current-work.mjs güncel mi? Tahminle çalışılmaz.',
    };
  }
  return { ok: true, state };
}

/** Şema/enum tutarlılığı — `--check` ve testler için. Hook bunu UYARI olarak taşır, çökmez. */
export function validateState(state) {
  const errs = [];
  for (const k of ['projectId', 'projectPath', 'phase', 'status', 'lastCompleted',
    'nextAction', 'updatedAt', 'updatedBy', 'baseCommit']) {
    if (!state[k]) errs.push(`${k} eksik`);
  }
  if (state.phase && !PHASES.includes(state.phase)) errs.push(`phase geçersiz: ${state.phase}`);
  if (state.status && !STATUSES.includes(state.status)) errs.push(`status geçersiz: ${state.status}`);
  if (state.status === 'bloke' && !state.blockedBy) errs.push('status=bloke ama blockedBy boş');
  if (state.status === 'mami-bekliyor' && !state.openMamiDecision) {
    errs.push('status=mami-bekliyor ama openMamiDecision boş');
  }
  if (state.status !== 'kapandi' && /COMMAND-INBOX\/Biten\//.test(String(state.projectPath))) {
    errs.push('aktif iş Biten/ altında olamaz');
  }
  return errs;
}

// ---------------------------------------------------------------------------
// DİSK TARAMASI — kayıt iddia eder, disk kanıtlar.
// ---------------------------------------------------------------------------

/** Teslim setini projectPath'i TARAYARAK hesaplar (elle iddia değil). */
export function scanDeliverables(root, projectPathPosix) {
  const dir = toPlatformPath(root, projectPathPosix);
  const out = {};
  for (const k of KIT) out[k.key] = false;
  if (!existsSync(dir)) return out;
  let names = [];
  try {
    names = readdirSync(dir).map((n) => nfc(n).toLowerCase());
  } catch { return out; }
  for (const k of KIT) out[k.key] = names.some((n) => k.ends.some((e) => n.endsWith(e)));
  return out;
}

/** Repo dışı medyayı sayar. `~` genişletilir; yoksa {exists:false}. */
export function scanMedia(entry) {
  const abs = expandHome(entry?.path);
  const res = { path: entry?.path, abs, exists: false, clips: 0, audio: 0 };
  if (!abs || !existsSync(abs)) return res;
  let st;
  try { st = statSync(abs); } catch { return res; }
  if (!st.isDirectory()) return res;
  res.exists = true;
  let names = [];
  try { names = readdirSync(abs); } catch { return res; }
  for (const n of names) {
    const low = n.toLowerCase();
    if (VIDEO_EXT.some((e) => low.endsWith(e))) res.clips += 1;
    else if (AUDIO_EXT.some((e) => low.endsWith(e))) res.audio += 1;
  }
  return res;
}

/** COMMAND-INBOX'ta bekleyen BAŞKA iş var mı (Biten/ ve aktif iş hariç). */
export function otherInboxJobs(root, state) {
  const dir = toPlatformPath(root, INBOX_REL);
  if (!existsSync(dir)) return [];
  let ents = [];
  try { ents = readdirSync(dir, { withFileTypes: true }); } catch { return []; }
  const active = nfc(state?.projectId ?? '');
  return ents
    .filter((d) => d.isDirectory())
    .map((d) => nfc(d.name))
    .filter((n) => n !== 'Biten' && n !== active);
}

// ---------------------------------------------------------------------------
// DRIFT — kayıt ile disk arasındaki ÇELİŞKİ. Zaman değil, gerçek ölçülür:
// "updatedAt N günden eski" bir zaman bombası olurdu, hiçbir kod değişmeden kırmızıya döner.
// ---------------------------------------------------------------------------
export function driftOf(root = REPO_DEFAULT, state) {
  const d = [];
  if (!state) return d;

  for (const e of validateState(state)) d.push({ level: 'uyari', text: `ŞEMA : ${e}` });

  const projAbs = toPlatformPath(root, state.projectPath);
  if (!existsSync(projAbs)) {
    d.push({ level: 'uyari', text: `DRİFT : ${state.projectPath} diskte yok — iş taşındı ya da adı değişti.` });
  } else if (/COMMAND-INBOX\/Biten\//.test(String(state.projectPath)) && state.status !== 'kapandi') {
    d.push({ level: 'uyari', text: 'DRİFT : iş Biten/ altında ama kayıt kapanmamış — kapanış hasadı koşmalı.' });
  }

  for (const m of (state.requiredLocalMedia ?? [])) {
    const s = scanMedia(m);
    if (!s.exists) {
      d.push({ level: 'uyari', text: `MEDYA : yok → ${m.path}` });
      continue;
    }
    const wantClips = m?.expect?.clips;
    if (Number.isInteger(wantClips)) {
      if (s.clips < wantClips) {
        d.push({ level: 'uyari', text: `MEDYA : klip eksik (${s.clips} < ${wantClips}) → ${m.path}` });
      } else if (s.clips > wantClips) {
        // Revize klibi (12_v2.mp4) eklenmiş olabilir — yanlış alarm değil, BİLGİ.
        d.push({ level: 'bilgi', text: `MEDYA : beklenenden fazla klip (${s.clips} > ${wantClips}) — revize eklendi mi?` });
      }
    }
    const wantAudio = (m?.expect?.vo ?? 0) + (m?.expect?.muzik ?? m?.expect?.music ?? 0);
    if (wantAudio > 0 && s.audio !== wantAudio) {
      d.push({ level: 'bilgi', text: `MEDYA : ses dosyası ${s.audio} ≠ beklenen ${wantAudio} → ${m.path}` });
    }
  }

  // Teslim seti: kayıt "var" diyor ama disk yok (ya da tersi) → kayıt bayat.
  const scanned = scanDeliverables(root, state.projectPath);
  const over = state.deliverablesOverride ?? {};
  if (state.deliverables && existsSync(projAbs)) {
    for (const [k, v] of Object.entries(state.deliverables)) {
      if (!(k in scanned)) continue;
      if (k in over) {
        // Elle ezilmiş parça asla sessiz geçmez — ezmenin kendisi rapor edilir.
        d.push({ level: 'bilgi', text: `KİT : ${k} elle "${over[k] ? 'var' : 'yok'}" yazıldı (disk: ${scanned[k] ? 'VAR' : 'YOK'}).` });
        continue;
      }
      if (Boolean(v) !== scanned[k]) {
        d.push({
          level: 'uyari',
          text: `KİT : ${k} kayıtta ${v ? 'var' : 'yok'} ama diskte ${scanned[k] ? 'VAR' : 'YOK'}.`,
        });
      }
    }
  }

  // baseCommit her commit'te eskir — bu NORMAL, sessiz. Yalnız repo'da HİÇ yoksa konuşulur.
  if (state.baseCommit && state.baseCommit !== '?') {
    const head = git(root, ['rev-parse', '--short', 'HEAD']);
    if (head && git(root, ['cat-file', '-e', `${state.baseCommit}^{commit}`]) === null) {
      d.push({ level: 'uyari', text: `KAYIT : baseCommit ${state.baseCommit} bu repoda yok (uydurma ya da başka klon).` });
    }
  }
  return d;
}

// ---------------------------------------------------------------------------
// RENDER — hook ve CLI BİREBİR aynı metni basar. İki metin iki gerçek demektir.
// ---------------------------------------------------------------------------
export function renderState(state, drift = [], extra = {}) {
  const L = [];
  L.push('[durum] OTURUM SÜREKLİLİĞİ — otorite bu kayıt, sohbet hafızası değil.');
  L.push(`  AKTİF İŞ : ${state.projectId}  ·  faz: ${state.phase}  ·  durum: ${state.status}`);
  L.push(`  BİTEN    : ${state.lastCompleted}`);
  L.push(`  SIRADAKİ : ${state.nextAction}`);
  if (state.blockedBy) L.push(`  BLOKE    : ${state.blockedBy}`);
  if (state.openMamiDecision) L.push(`  MAMİ'YE  : ${state.openMamiDecision}`);

  const eksik = Object.entries(state.deliverables ?? {}).filter(([, v]) => !v).map(([k]) => k);
  L.push(eksik.length ? `  KİT      : eksik → ${eksik.join(' · ')}` : '  KİT      : 5/5 tam');

  for (const m of (state.requiredLocalMedia ?? [])) {
    const s = scanMedia(m);
    const want = m?.expect?.clips;
    const say = s.exists ? `${s.clips}${Number.isInteger(want) ? `/${want}` : ''} klip` : 'YOK';
    L.push(`  MEDYA    : ${say} · ${m.path}`);
  }

  for (const w of drift.filter((x) => x.level === 'uyari')) L.push(`  ⚠ ${w.text}`);
  for (const w of drift.filter((x) => x.level === 'bilgi')) L.push(`  · ${w.text}`);

  if (Array.isArray(extra.otherJobs) && extra.otherJobs.length) {
    L.push(`  BEKLEYEN : COMMAND-INBOX'ta ${extra.otherJobs.length} başka iş — hangisi diye MAMİ'YE SOR, sessiz seçme.`);
  }
  L.push(`  (kayıt: ${state.updatedAt} · ${state.updatedBy} · base ${state.baseCommit})`);
  L.push('  Tarihsel ledger EXECUTION_STATE.md — otorite DEĞİL, arşiv.');
  return L;
}

/** Kayıt okunamadığında basılan metin — hook da CLI da bunu kullanır. */
export function renderMissing(reason, detail) {
  const L = ['[durum] OTURUM SÜREKLİLİĞİ'];
  if (reason === 'yok') {
    L.push('  AKTİF İŞ : kayıt YOK — artifacts/current-work.json açılmamış.');
    L.push('  Yeni işe başlarken: node scripts/current-work.mjs baslat "<proje adı>"');
  } else {
    L.push(`  ⚠ KAYIT BOZUK — tahminle çalışılmaz.`);
    L.push(`    ${detail}`);
    L.push('  Onarılana kadar aktif iş hakkında hüküm verme; Mami\'ye sor.');
  }
  L.push('  Tarihsel ledger EXECUTION_STATE.md — otorite DEĞİL, arşiv.');
  return L;
}

// ---------------------------------------------------------------------------
// YAZMA — atomik (tmp → rename). Yarım JSON diskte kalmaz.
// ---------------------------------------------------------------------------
export function writeState(root, state) {
  const next = { ...state };
  next.version = SCHEMA_VERSION;
  next.deliverables = scanDeliverables(root, next.projectPath); // disk gerçeği, iddia değil
  // Elle ezme KALICI olmalı, yoksa bir sonraki yazma onu sessizce siler (ölçüldü: `kit MOTION=var`
  // ardından `medya` koşunca override buharlaşıyordu). Kalıcı ama GÖRÜNÜR: driftOf her ezmeyi
  // ayrı satırda basar — gizlenebilen bir yalan, olmayan bir ezmeden kötüdür.
  if (next.deliverablesOverride && Object.keys(next.deliverablesOverride).length) {
    Object.assign(next.deliverables, next.deliverablesOverride);
  } else {
    delete next.deliverablesOverride;
  }
  next.updatedAt = new Date().toISOString();
  next.updatedBy = process.env.MAMILAS_ACTOR ?? 'claude';
  next.baseCommit = git(root, ['rev-parse', '--short', 'HEAD']) ?? '?';

  // Alan sırası sabit — diff okunabilir kalsın.
  const ORDER = ['version', 'projectId', 'projectPath', 'phase', 'status', 'lastCompleted',
    'nextAction', 'openMamiDecision', 'blockedBy', 'requiredLocalMedia', 'deliverables',
    'deliverablesOverride', 'updatedAt', 'updatedBy', 'baseCommit'];
  const ordered = {};
  for (const k of ORDER) if (k in next) ordered[k] = next[k];
  for (const k of Object.keys(next)) if (!(k in ordered)) ordered[k] = next[k];

  const abs = toPlatformPath(root, STATE_REL);
  const tmp = `${abs}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(ordered, null, 2)}\n`, 'utf8'); // LF, BOM yok
  renameSync(tmp, abs);
  if (ordered.baseCommit === '?') {
    process.stdout.write('[durum] uyarı: git bulunamadı ya da repo değil — baseCommit "?" yazıldı.\n');
  }
  return ordered;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function argFlag(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 ? (argv[i + 1] ?? '') : null;
}
function hasFlag(argv, name) { return argv.includes(name); }

function loadOrDie(root) {
  const r = readState(root);
  if (!r.ok) {
    process.stdout.write(`${renderMissing(r.reason, r.detail).join('\n')}\n`);
    process.exit(1);
  }
  return r.state;
}

function printState(root, state) {
  const drift = driftOf(root, state);
  const extra = { otherJobs: otherInboxJobs(root, state) };
  process.stdout.write(`${renderState(state, drift, extra).join('\n')}\n`);
  return drift;
}

function cmdBaslat(root, argv) {
  const id = argv[1];
  if (!id) { process.stdout.write('kullanım: baslat "<projectId>" [--faz prompt]\n'); process.exit(1); }
  const cur = readState(root);
  if (cur.ok && cur.state.status !== 'kapandi') {
    process.stdout.write(`[durum] ⛔ aktif iş var: ${cur.state.projectId} (${cur.state.status}). Önce: current-work.mjs kapat\n`);
    process.exit(1);
  }
  const inbox = toPlatformPath(root, INBOX_REL);
  const dirs = existsSync(inbox)
    ? readdirSync(inbox, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
    : [];
  const want = nfc(id).toLowerCase();
  const exact = dirs.filter((d) => nfc(d).toLowerCase() === want);
  const cand = exact.length ? exact : dirs.filter((d) => nfc(d).toLowerCase().includes(want));
  if (cand.length !== 1) {
    process.stdout.write(`[durum] ⛔ "${id}" tek eşleşmedi (${cand.length} aday). Tahmin edilmez.\n`);
    for (const c of cand.length ? cand : dirs) process.stdout.write(`   - ${c}\n`);
    process.exit(1);
  }
  const name = cand[0];
  const state = {
    version: SCHEMA_VERSION,
    projectId: nfc(name),
    projectPath: `${INBOX_REL}/${nfc(name)}`,
    phase: argFlag(argv, '--faz') || 'enzim',
    status: 'aktif',
    lastCompleted: 'iş açıldı — henüz ölçülmüş bir çıktı yok.',
    nextAction: 'Enzim kilitlerini kapat (/mamilas-enzim).',
    openMamiDecision: null,
    blockedBy: null,
    requiredLocalMedia: [],
    deliverables: {},
  };
  if (!PHASES.includes(state.phase)) {
    process.stdout.write(`[durum] ⛔ geçersiz faz: ${state.phase} (${PHASES.join('|')})\n`);
    process.exit(1);
  }
  printState(root, writeState(root, state));
}

function cmdIlerle(root, argv) {
  const s = loadOrDie(root);
  const bitti = argFlag(argv, '--bitti');
  const sirada = argFlag(argv, '--sirada');
  const faz = argFlag(argv, '--faz');
  if (!bitti || !sirada) {
    process.stdout.write('kullanım: ilerle --bitti "<ölçülmüş gerçek>" --sirada "<tek eylem>" [--faz motion]\n');
    process.exit(1);
  }
  s.lastCompleted = bitti;
  s.nextAction = sirada;
  if (faz) {
    if (!PHASES.includes(faz)) { process.stdout.write(`[durum] ⛔ geçersiz faz: ${faz}\n`); process.exit(1); }
    s.phase = faz;
  }
  printState(root, writeState(root, s));
}

function cmdBloke(root, argv) {
  const s = loadOrDie(root);
  if (hasFlag(argv, '--ac')) {
    s.blockedBy = null;
    s.status = s.openMamiDecision ? 'mami-bekliyor' : 'aktif';
  } else {
    const sebep = argv[1];
    if (!sebep) { process.stdout.write('kullanım: bloke "<sebep>" | bloke --ac\n'); process.exit(1); }
    s.blockedBy = sebep;
    s.status = 'bloke';
  }
  printState(root, writeState(root, s));
}

function cmdSor(root, argv) {
  const s = loadOrDie(root);
  if (hasFlag(argv, '--cevaplandi')) {
    s.openMamiDecision = null;
    if (s.status === 'mami-bekliyor') s.status = s.blockedBy ? 'bloke' : 'aktif';
  } else {
    const soru = argv[1];
    if (!soru) { process.stdout.write('kullanım: sor "<Mami kararı>" | sor --cevaplandi\n'); process.exit(1); }
    s.openMamiDecision = soru;
    if (s.status === 'aktif') s.status = 'mami-bekliyor';
  }
  printState(root, writeState(root, s));
}

function cmdKit(root, argv) {
  const s = loadOrDie(root);
  const over = { ...(s.deliverablesOverride ?? {}) };
  for (const a of argv.slice(1)) {
    const m = a.match(/^([^=]+)=(var|yok|disk)$/i);
    if (!m) { process.stdout.write(`[durum] ⛔ anlaşılmadı: ${a} (biçim: MOTION=var | MOTION=yok | MOTION=disk)\n`); process.exit(1); }
    const key = KIT.find((k) => k.key.toLowerCase() === m[1].toLowerCase())?.key;
    if (!key) { process.stdout.write(`[durum] ⛔ bilinmeyen kit parçası: ${m[1]}\n`); process.exit(1); }
    const val = m[2].toLowerCase();
    if (val === 'disk') delete over[key];          // ezmeyi kaldır, taramaya geri dön
    else over[key] = val === 'var';
  }
  s.deliverablesOverride = over;
  printState(root, writeState(root, s));
}

function cmdMedya(root, argv) {
  const s = loadOrDie(root);
  const p = argv[1];
  if (!p) { process.stdout.write('kullanım: medya "<yol>" --klip 50 [--vo 1] [--muzik 1]\n'); process.exit(1); }
  const expect = {};
  for (const [flag, key] of [['--klip', 'clips'], ['--vo', 'vo'], ['--muzik', 'muzik']]) {
    const v = argFlag(argv, flag);
    if (v !== null && v !== '') expect[key] = Number(v);
  }
  s.requiredLocalMedia = [{ path: p, expect, note: 'repo dışı — git-ignore değil, hiç repoda değil' }];
  printState(root, writeState(root, s));
}

function cmdKapat(root) {
  const s = loadOrDie(root);
  s.status = 'kapandi';
  s.phase = 'kapandi';
  const bitenPath = `${INBOX_REL}/Biten/${s.projectId}`;
  if (existsSync(toPlatformPath(root, bitenPath))) s.projectPath = bitenPath;
  s.nextAction = 'node scripts/kapanis-hasadi.mjs --all — karne + ders adayı.';
  printState(root, writeState(root, s));
  process.stdout.write('[durum] iş kapandı. Klasör Biten/ altına taşındı mı? Hasat koşmadan yeni iş açma.\n');
}

function main(argv) {
  const root = process.env.CLAUDE_PROJECT_DIR
    ? resolve(process.env.CLAUDE_PROJECT_DIR)
    : REPO_DEFAULT;
  const cmd = argv[0];

  if (cmd === '--check') {
    const r = readState(root);
    if (!r.ok) { process.stdout.write(`${renderMissing(r.reason, r.detail).join('\n')}\n`); process.exit(1); }
    const drift = printState(root, r.state);
    process.exit(drift.some((d) => d.level === 'uyari') ? 1 : 0);
  }

  switch (cmd) {
    case undefined: case 'oku': case '--help': case '-h': {
      if (cmd === '--help' || cmd === '-h') {
        process.stdout.write(readTextSafe(fileURLToPath(import.meta.url)).split('\n')
          .filter((l) => l.startsWith('//')).slice(0, 30).join('\n') + '\n');
        return;
      }
      const r = readState(root);
      if (!r.ok) { process.stdout.write(`${renderMissing(r.reason, r.detail).join('\n')}\n`); process.exit(0); }
      printState(root, r.state);
      return;
    }
    case 'baslat': return cmdBaslat(root, argv);
    case 'ilerle': return cmdIlerle(root, argv);
    case 'bloke': return cmdBloke(root, argv);
    case 'sor': return cmdSor(root, argv);
    case 'kit': return cmdKit(root, argv);
    case 'medya': return cmdMedya(root, argv);
    case 'kapat': return cmdKapat(root);
    default:
      process.stdout.write(`[durum] bilinmeyen komut: ${cmd}\n`);
      process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main(process.argv.slice(2));
}
