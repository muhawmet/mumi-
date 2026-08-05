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
  readFileSync, writeFileSync, existsSync, readdirSync, renameSync, statSync, copyFileSync, unlinkSync,
  mkdirSync,
} from 'node:fs';
import { join, resolve, dirname, sep } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
// Canary kilidi VARLIK değil İÇERİK olarak ölçülür (2026-08-05 ikinci onarımı).
import { uretimAcilabilirMi } from './canary-lock.mjs';
import { parseHukumBloklari } from './hukum-blogu.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_DEFAULT = resolve(HERE, '..');

export const SCHEMA_VERSION = 1;
export const STATE_REL = 'artifacts/current-work.json';
export const INBOX_REL = 'agents/COMMAND-INBOX';

// START FRAME KLASÖRÜ — rutin, tercih değil (Mami, 2026-08-03).
// Ölçüldü: aynı iş için diskte ÜÇ ad yaşıyordu (`resimler`, `Resimler`, hiç). Ad tahmin edilince
// doğrulayıcı yanlış klasöre bakar ve "görsel yok" der; bu, olmayan bir kusuru rapor etmektir.
// Bundan sonra kanonik ad TEK: `images`. Eski iki ad OKUNMAYA devam eder (mevcut kareler orada
// duruyor, taşınmıyor) ama YENİ proje `images` ile doğar.
export const IMAGES_DIR = 'images';
// Okuma sırası: kanonik önce, eski adlar geriye dönük. Sıra ÖNEMLİ — bkz. teslim-denetim.mjs,
// boş `images` dolu `resimler`i gölgelemesin diye orada "dolu olanı seç" kuralı var.
export const IMAGE_DIR_ALIASES = [IMAGES_DIR, 'resimler', 'Resimler'];

/**
 * Projenin start-frame klasörünü VAR EDER (idempotent) ve yolunu döner.
 * `.gitkeep` şart: git boş klasör taşımaz, iskelet diğer makinede doğmaz.
 * .gitignore `images/` klasörünü COMMAND-INBOX altında ayrıca geri alır — yoksa bu satır
 * sessiz no-op olurdu (klasör diskte var, repoda yok).
 */
export function ensureImagesDir(projectAbs) {
  const dir = join(projectAbs, IMAGES_DIR);
  mkdirSync(dir, { recursive: true });
  const keep = join(dir, '.gitkeep');
  if (!existsSync(keep)) writeFileSync(keep, '', 'utf8');
  return dir;
}

// `canary` fazı 2026-08-05'te eklendi ve SIRALAMASI anlamlıdır: `motion` ile `uretim` arasında.
// Gerekçe ölçüldü — Destek ve Hareket'te 6 klip basıldı, ALTISI da bozuk çıktı; kusur klip
// basıldıktan SONRA görüldü. Repo genelinde ortalama yeniden basım oranı %42.6. Canary, tam
// üretimden önce küçük ve geri dönülebilir bir sınamadır: 44 klip değil 8 klip.
export const PHASES = ['enzim', 'prompt', 'denetim', 'motion', 'canary', 'uretim', 'kurgu', 'kapandi'];

// CANARY KİLİDİ — `uretim` fazına geçmenin ŞARTI.
// Bu bir dosya varlığı kontrolüdür, bir iddia değil: kilit diskte YOKSA canary hükmü
// verilmemiştir. `kapat` kapısıyla aynı yasa: "Kapı yalnız diski okur."
export const CANARY_LOCK_ENDS = ['_canary-lock.md', '_canary-lock.txt'];

/** Projede canary kilidi var mı — diski okur, kayda sormaz. */
export function canaryLockPath(root, projectPathPosix) {
  const dir = toPlatformPath(root, projectPathPosix);
  if (!existsSync(dir)) return null;
  const hit = readdirSync(dir)
    .find((f) => CANARY_LOCK_ENDS.some((e) => f.toLowerCase().endsWith(e)));
  return hit ? `${projectPathPosix}/${hit}` : null;
}

/** Proje kökünde son eki tutan ilk dosyanın MUTLAK yolu — yoksa null. Disk okur, kayda sormaz. */
export function projeDosyasi(root, projectPathPosix, sonEk) {
  const dir = toPlatformPath(root, projectPathPosix);
  if (!existsSync(dir)) return null;
  const hit = readdirSync(dir).find((f) => f.toLowerCase().endsWith(sonEk.toLowerCase()));
  return hit ? join(dir, hit) : null;
}
export const STATUSES = ['aktif', 'bloke', 'mami-bekliyor', 'kapandi'];

// PROMPT-YASASI §5 teslim seti + kaba kurgu (kitin beşinci parçası).
// Anahtar = kayıtta görünen ad, matcher = dosya adı son eki (küçük harfe indirgenmiş).
//
// AD YETMEZ — 2026-08-02 ölçümü. Bu liste teslimi yalnız AD SONEKİYLE arıyordu ve üretimin
// gerçek yerleşimini görmüyordu: 146 prompt dosyasının yalnız 18'i `*_PROMPTLAR.*` adını
// taşıyor, kalan 128'i `<proje>/PROMPTLAR/A-K01-K14.txt` biçiminde yaşıyor. Sonuç ölçüldü:
// `5. Sınıf - Destek ve Hareket Sistemi`in 41 karesi diskte DURURKEN kayıtta PROMPTLAR:false
// görünüyordu — ve bu kaydı SessionStart `[durum]` bloğu ile `kapat` kapısı okuyor. Yani kayıt
// var olan işi eksik ilan ediyordu; oturum açılışında "prompt yok" diyen bir gerçek üretiliyordu.
//
// Bu yüzden her parça üç yoldan tanınır ve BİRİ yeterlidir:
//   1. `ends` — dosya adı soneki (eski sözleşme, aynen korunur)
//   2. `dir`  — o adı taşıyan alt klasörde imzayı taşıyan en az bir dosya
//   3. `sig`  — proje kökündeki, BAŞKA bir parçanın adına uymayan bir dosyanın İÇERİĞİ
// `sig` imzaları başka araçlarla aynıdır (ikinci kopya yazılmaz): prompt imzası
// `prompt-lint.mjs:813-826` walk()'un, motion imzası `motion-lint.mjs:81` KAMERA NİYETİ'nin.
export const KIT = [
  { key: 'REFERANSLAR', ends: ['_referanslar.txt'] },
  { key: 'PROMPTLAR', ends: ['_promptlar.txt', '_promptlar.md'], dir: 'PROMPTLAR', sig: /^STYLE:|^NEGATIVE:|FRAME NEGATIVE/im },
  // KOŞULLU: yasa (faz-icraat) *"sorunsuz kareye revize YOK — tek satırlık 'temiz' listesi yeter"*
  // diyor. Sıfır revize alan bir set için dosya hiç doğmaz; onu kapanış şartı yapmak, temiz işi
  // eksik ilan etmek olurdu. Karnede görünür, kapıyı tutmaz.
  // `revize/` klasör biçimi canlıda var (Farklı Kültürler, Birlikte Daha Güçlüyüz); kök `sig`
  // YOK, çünkü revize dosyası prompt imzasının aynısını taşır ve ikisi ayırt edilemez.
  { key: 'revize', ends: ['_revize.txt'], dir: 'revize', kosullu: true },
  { key: 'MOTION', ends: ['_motion.txt', '_motion.md'], dir: 'MOTION', sig: /^KAMERA NİYETİ:/im },
  { key: 'EDIT-PLAN', ends: ['_edit-plan.txt'] },
  { key: 'SESLENDIRME', ends: ['_seslendirme.txt'] },
  { key: 'SUNO', ends: ['_suno.txt'] },
  // kaba-kurgu.mjs varsayılanı `<proje> — kaba kurgu.xml` (tire DEĞİL boşluk); Mami `--cikti`
  // ile `_KURGU.xml` de yazdırıyor (Üreme, 29 Tem). Tek desen aramak dosyayı diskte görmezden
  // gelmek demekti — kit sonsuza dek "eksik" görünüyordu.
  { key: 'KABA-KURGU.xml', ends: ['kaba-kurgu.xml', 'kaba kurgu.xml', '_kurgu.xml'] },
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

/** Bir dosyanın içeriği imzayı taşıyor mu. Okunamayan dosya "hayır"dır, çökme değil. */
function icerikTasiyor(abs, sig) {
  try {
    return sig.test(readTextSafe(abs));
  } catch { return false; }
}

/** Alt klasörde imzayı taşıyan (imza yoksa: herhangi bir .txt/.md) dosya var mı. */
function altKlasordeVar(parent, entries, dirAd, sig) {
  const hedef = entries.find((e) => e.isDirectory() && nfc(e.name).toLowerCase() === dirAd.toLowerCase());
  if (!hedef) return false;
  const sub = join(parent, hedef.name);
  let names = [];
  try { names = readdirSync(sub); } catch { return false; }
  return names.some((n) => {
    if (!/\.(txt|md)$/i.test(n)) return false;
    return sig ? icerikTasiyor(join(sub, n), sig) : true;
  });
}

/** Teslim setini projectPath'i TARAYARAK hesaplar (elle iddia değil). */
export function scanDeliverables(root, projectPathPosix) {
  const dir = toPlatformPath(root, projectPathPosix);
  const out = {};
  for (const k of KIT) out[k.key] = false;
  if (!existsSync(dir)) return out;
  let entries = [];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch { return out; }
  const files = entries.filter((e) => !e.isDirectory()).map((e) => e.name);
  const low = files.map((n) => nfc(n).toLowerCase());
  // Kök dosya BAŞKA bir parçanın adını taşıyorsa içerik yoluyla sahiplenilmez:
  // `<proje>_revize.txt` prompt imzasını taşır ve onu PROMPTLAR sayarsak kayıt yine yalan söyler.
  const baskaninAdi = (n, self) => KIT.some((k) => k.key !== self && k.ends.some((e) => n.endsWith(e)));

  for (const k of KIT) {
    // 1. ad soneki — eski sözleşme, olduğu gibi
    if (low.some((n) => k.ends.some((e) => n.endsWith(e)))) { out[k.key] = true; continue; }
    // 2. klasör biçimi
    if (k.dir && altKlasordeVar(dir, entries, k.dir, k.sig)) { out[k.key] = true; continue; }
    // 3. kökteki adsız/sidecar dosyanın içeriği (`*_CODEX-KALAN-START-FRAMELER.txt` gibi)
    if (k.sig && files.some((n, i) => /\.(txt|md)$/i.test(n)
      && !baskaninAdi(low[i], k.key)
      && icerikTasiyor(join(dir, n), k.sig))) { out[k.key] = true; }
  }
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
  // WINDOWS EBUSY: dosya bir editörde/IDE watcher'da açıksa rename kilide takılıp betiği
  // çökertiyor ve durum kaydı GÜNCELLENMİYOR — sonraki oturum bayat kayıtla açılıyor.
  // Birincil ortam Windows; üç deneme, sonra kopyayla yaz.
  let renamed = false;
  for (let deneme = 0; deneme < 3 && !renamed; deneme++) {
    try { renameSync(tmp, abs); renamed = true; }
    catch (e) {
      if (deneme === 2) {
        try { copyFileSync(tmp, abs); unlinkSync(tmp); renamed = true; }
        catch { throw e; }
      } else {
        const bekle = Date.now() + 50; while (Date.now() < bekle) { /* 50ms */ }
      }
    }
  }
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
  // İSKELET — proje `images/` ile DOĞAR. Sonradan elle açılan klasör açılmıyor: üç farklı ad
  // (resimler/Resimler/hiç) tam da bu yüzden doğdu.
  ensureImagesDir(join(inbox, name));
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
    // CANARY KAPISI — `uretim` fazı canary kilidi olmadan AÇILMAZ.
    //
    // Bugüne kadar `cmdIlerle` yalnız ÜYELİK kontrolü yapıyordu: herhangi bir fazdan
    // herhangi bir faza atlanabiliyordu. Yani lifecycle bir sıra değil, bir etiket
    // listesiydi. Ölçülen bedeli: Destek ve Hareket'te 6 klip canary hükmü olmadan
    // basıldı, altısı da bozuk çıktı.
    //
    // Kapı yalnız DİSKİ okur (`kapat` kapısıyla aynı yasa) — kayıt "canary geçti"
    // diyemez, kilit dosyası ya vardır ya yoktur. `--zorla` bilerek YOK: bu kapı
    // ucuz bir sınamayı pahalı bir turdan önce zorunlu kılar, atlatılırsa anlamı kalmaz.
    //
    // 2026-08-05 İKİNCİ ONARIM — VARLIK YETMİYOR, İÇERİK ÖLÇÜLÜYOR.
    // İlk hâli yalnız dosyanın var olup olmadığına bakıyordu; adı doğru olan BOŞ bir dosya
    // üretimi açıyordu. Bu repoda sekiz kez ölçülen kusur sınıfının aynısı: kapı bir şey
    // ölçüyor sanılıyor, ölçtüğü şey başka. Artık `scripts/canary-lock.mjs` kilidin İÇİNİ
    // okuyor — gerçek kare/klip yolları diskte var mı, Sol ve AGY blokları koşma kaydı
    // taşıyor mu, Mami'nin ham cümlesi yazılı mı, lehçe kaydı dolu mu.
    // Bu kapı DIŞ GÖZ ÇAĞIRMAZ: yalnız gerçek sonucu içeri alır.
    if (faz === 'uretim' && s.phase !== 'uretim') {
      const lock = canaryLockPath(root, s.projectPath);
      if (!lock) {
        process.stdout.write(
          '[durum] ⛔ ÜRETİME GEÇİLEMEZ — canary kilidi yok.\n'
          + `        Aranan: ${s.projectPath}/<Ad>_CANARY-LOCK.md\n`
          + '        Canary, tam üretimden önceki küçük ve geri dönülebilir sınamadır:\n'
          + '        8 klip basılır, AGY tarif eder, Sol çürütür, hükmü MAMİ verir.\n'
          + '        Kilit o hükmün kaydıdır — onaylı kare/klip yolları + sha, Mami\'nin ham\n'
          + '        cümlesi, çalışan motion biçimi, yasaklanan kalıplar, sınanan tek değişken.\n'
          + '        Biçim: agents/DIS-GOZ-BRIEF-SABLONU.md · kanon: docs/ai/DORTLU-MASA.md\n'
          + '        Ölçüldü: canary\'siz basılan 6 klibin 6\'sı bozuk çıktı.\n',
        );
        process.exit(1);
      }
      const { acik, sebep, olcum } = uretimAcilabilirMi(
        readFileSync(toPlatformPath(root, lock), 'utf8'),
        { repoKok: root },
      );
      for (const k of olcum.kirmizi) process.stdout.write(`[durum]   🔴 ${k}\n`);
      for (const w of olcum.sari) process.stdout.write(`[durum]   🟡 ${w}\n`);
      if (!acik) {
        process.stdout.write(
          `[durum] ⛔ ÜRETİME GEÇİLEMEZ — ${sebep}\n`
          + `        Kilit: ${lock}\n`
          + '        Kilit VAR ama hüküm taşımıyor. RESHAPE / UNPROVEN / SOL_UNAVAILABLE\n'
          + '        üretimi açmaz: kırılan hipotez düzeltilir ve YENİ küçük canary basılır.\n',
        );
        process.exit(1);
      }
      process.stdout.write(`[durum] ✅ canary kilidi geçerli: ${lock} (Sol: ${olcum.solHukmu})\n`);
    }

    // SOL PLAN BLOĞU — Dörtlü Masa'nın BİRİNCİ tetikleyicisi (docs/ai/DORTLU-MASA.md §3).
    // Vizyon Kilidi + Shot Card hazır olunca Sol planı çürütür ve hükmü ENZİM KİLİT 5 altında
    // yaşar. Ölçüldü: bu adım hiç koşmadı ve koşmadığını gösterecek bir yer yoktu.
    //
    // 🔴 BU BİR BLOKAJ DEĞİL, DÜRÜST KAYIT. Geçmişi sahteleyip zaten yol almış projeleri
    // kilitlemek, kapıyı `--zorla` aramaya iter. Kural: uyarı canary fazında görünür,
    // uygulanması İLK CANARY MOTION'ından önce zorunludur.
    if (faz === 'canary' && s.phase !== 'canary') {
      const enzim = projeDosyasi(root, s.projectPath, '_enzim.md');
      const solVar = enzim
        && parseHukumBloklari(readFileSync(enzim, 'utf8')).some((b) => b.goz === 'SOL');
      if (!solVar) {
        process.stdout.write(
          '[durum] ⚠️  RETROAKTİF SOL PLAN REVIEW GEREKLİ — bu proje Sol plan hükmü olmadan ilerledi.\n'
          + `        Yeri: ${s.projectPath}/<Ad>_ENZIM.md → KİLİT 5 altında bir "DIŞ GÖZ HÜKMÜ — SOL" bloğu\n`
          + '        Sol neyi çürütür: ritim · tekrar · ref rolleri · animasyon ayrıcalığı ·\n'
          + '        start-frame olay eşiği · risk kör noktaları.\n'
          + '        Bloke DEĞİL (geçmiş sahtelenmiyor) — ama İLK CANARY MOTION\'ından önce yazılır.\n'
          + '        Biçim: agents/DIS-GOZ-BRIEF-SABLONU.md\n',
        );
      } else {
        process.stdout.write('[durum] ✅ Sol plan hükmü ENZİM içinde bulundu\n');
      }
    }
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

function cmdKapat(root, argv = []) {
  const s = loadOrDie(root);

  // KAPANIŞ KAPISI — "kapandı" demek "teslim edildi" demektir; eksik teslimde bu bir YALANDIR.
  // driftOf zaten ölçüyordu ama yalnız RAPOR ediyordu; burada aynı ölçüm KARAR verir.
  // Kayıt iddia eder, DİSK kanıtlar: kit taraması ve medya sayımı ham dosyadan okunur.
  if (!hasFlag(argv, '--zorla')) {
    const engel = [];
    // KAPIDA OVERRIDE YOK. `deliverablesOverride` kayıt/görüntü içindir; onu buraya bindirmek
    // kapıyı `kit MOTION=var` yazarak `--zorla`sız atlatılabilir yapıyordu (Codex denetimi
    // 2026-07-29) — yani kapının kendi yorumu ("kayıt iddia eder, DİSK kanıtlar") yalandı.
    // Kapı yalnız diski okur; kabul edilen eksik yalnız `--zorla` ile geçer ve o görünür kalır.
    const kit = scanDeliverables(root, s.projectPath);
    const kosullu = new Set(KIT.filter((k) => k.kosullu).map((k) => k.key));
    const eksikKit = Object.entries(kit).filter(([k, v]) => !v && !kosullu.has(k)).map(([k]) => k);
    if (eksikKit.length) engel.push(`KİT eksik → ${eksikKit.join(' · ')}`);
    for (const m of (s.requiredLocalMedia ?? [])) {
      const sc = scanMedia(m);
      if (!sc.exists) { engel.push(`MEDYA yok → ${m.path}`); continue; }
      const wantClips = m?.expect?.clips;
      if (Number.isInteger(wantClips) && sc.clips < wantClips) {
        engel.push(`MEDYA klip eksik (${sc.clips} < ${wantClips}) → ${m.path}`);
      }
      const wantAudio = (m?.expect?.vo ?? 0) + (m?.expect?.muzik ?? m?.expect?.music ?? 0);
      if (wantAudio > 0 && sc.audio < wantAudio) {
        engel.push(`MEDYA ses eksik (${sc.audio} < ${wantAudio}) → ${m.path}`);
      }
    }
    if (s.blockedBy) engel.push(`BLOKE hâlâ açık → ${s.blockedBy}`);
    if (s.openMamiDecision) engel.push(`Mami kararı hâlâ açık → ${s.openMamiDecision}`);
    if (engel.length) {
      process.stdout.write('[durum] ⛔ kapanmadı — eksik teslimde kapanış bir YALANDIR:\n');
      for (const e of engel) process.stdout.write(`   - ${e}\n`);
      process.stdout.write('   Eksik gerçekten kabul ediliyorsa: current-work.mjs kapat --zorla\n');
      process.exit(1);
    }
  }

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
    case 'kapat': return cmdKapat(root, argv);
    default:
      process.stdout.write(`[durum] bilinmeyen komut: ${cmd}\n`);
      process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main(process.argv.slice(2));
}
