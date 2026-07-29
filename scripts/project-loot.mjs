#!/usr/bin/env node
// ---------------------------------------------------------------------------
// PROJECT LOOT — FAZ 9 kapanış öğrenme halkası.
//
// Karar: `artifacts/iq-run/FAZ-9-KARAR-PROJECT-LOOT.md` (Mami onayı, dört düzeltmeyle).
//
// Bu script `PROJECT-LOOT.json`'ın **TEK YAZICISIDIR**. `kapanis-hasadi.mjs` onu yalnız
// OKUR ve `HASAT-*.md`'yi ondan deterministik üretir. İkinci gerçeklik kurulmaz.
//
// Dört düzeltme koda GÖMÜLÜ, yorumda değil:
//   1. Röportaj ATLANABİLİR   → `atla` komutu; teknik loot yine yazılır (`layerVerdicts: null`).
//   2. `confidence` YOK       → yalnız sayılabilir `evidenceStrength`; sayılamıyorsa `null`.
//   3. Tek kanonik kaynak     → HASAT bu dosyadan türer, tersi değil.
//   4. İki ayrı bölüm         → `subjectiveVerdict` (Mami'nin ham cümlesi) + `objectiveMetrics`.
//
// Kullanım:
//   node scripts/project-loot.mjs kapat "<proje dizini>" [--register=EDU]
//   node scripts/project-loot.mjs sor   "<proje dizini>"
//   node scripts/project-loot.mjs cevap "<proje dizini>" --katman <k> --metin "<Mami'nin cümlesi>"
//   node scripts/project-loot.mjs atla  "<proje dizini>"
//   node scripts/project-loot.mjs aday  "<proje dizini>" --metin "<ders>" [--kare N] [--tekrar N] [--before-after]
//   node scripts/project-loot.mjs tasi  "<proje dizini>" --aday <id>     ← YALNIZ Mami açıkça derse
//   node scripts/project-loot.mjs gor   "<proje dizini>" [--json]
//
// ORTAM: saf Node. Kabuk çağrısı yok, `python3` yok, `/tmp` sabiti yok, satır-sonuna göre
// hash yok. `CLAUDE.md` ortam yasası: bir araç ortam varsayımı yaparsa Windows'ta sessiz
// no-op olur — dört kez ölçüldü.
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync, existsSync, renameSync, unlinkSync } from 'node:fs';
import { join, dirname, basename, isAbsolute, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { harvest, LOOT_FILE, PARSER_VERSION } from './kapanis-hasadi.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(HERE);
const APPROVED = join(ROOT, 'agents', 'lessons', 'APPROVED.md');
const LOOT_VERSION = 1;

// Katmanlar — röportajın iskeleti. Sıra sabit; `sor` bu sırayla İLK cevaplanmamışı sorar.
// Soru metinleri Mami'nin diliyle yazıldı: "kalite" gibi soyut kelime sorulmaz, somut sorulur.
const LAYERS = [
  { key: 'startFrame', soru: 'Kareler (start-frame) nasıldı — neyi beğendin, neyi beğenmedin?' },
  { key: 'motion', soru: 'Hareket/klipler nasıldı — nerede bozuldu, nerede tuttu?' },
  { key: 'ses', soru: 'Seslendirme ve müzik nasıldı — ritim, tonlama, yerleşim?' },
  { key: 'kurgu', soru: 'Kurgu nasıldı — kesim yerleri, uzunluk, akış?' },
  { key: 'genel', soru: 'Bir bütün olarak: bunu bir müşteriye gösterir miydin? Neden?' },
];
const LAYER_KEYS = new Set(LAYERS.map((l) => l.key));

// ---------------------------------------------------------------------------
// yardımcılar
// ---------------------------------------------------------------------------

const nfc = (s) => String(s ?? '').normalize('NFC');

/** Satır sonu normalize edilir (CRLF tuzağı), ama METİN ASLA yeniden yazılmaz. */
const mamiText = (s) => nfc(s).replace(/\r\n/g, '\n').replace(/\s+$/, '');

/**
 * Ders eşleşmesi için karşılaştırma anahtarı — yalnız duplicate tespitinde kullanılır.
 *
 * TÜRKÇE TUZAĞI (testle yakalandı): `'ayakkabıya'.toUpperCase()` → `AYAKKABIYA`, onun
 * `.toLowerCase()`'ı → `ayakkabiya`. Noktasız `ı` gidiş-dönüşte `i`'ye dönüşüyor, yani düz
 * `toLowerCase` karşılaştırması Mami'nin BÜYÜK harfle yazdığı aynı dersi FARKLI ders sayıp
 * bankaya ikinci satır yazardı. `İ/I/ı` önce elle katlanır, sonra aksan sökülür.
 */
const dedupeKey = (s) => nfc(s)
  .replace(/[İIı]/g, 'i')
  .toLowerCase()
  .normalize('NFD').replace(/\p{M}+/gu, '')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim();

function repoRel(abs) {
  const r = relative(ROOT, abs);
  return r.split(sep).join('/');
}

function resolveDir(arg) {
  if (!arg) return null;
  const abs = isAbsolute(arg) ? arg : join(ROOT, arg);
  return existsSync(abs) ? abs : null;
}

/** Atomik yazım — yarı yazılmış kanonik kaynak, hiç olmayandan kötüdür. */
function writeJsonAtomic(path, obj) {
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(obj, null, 2)}\n`, 'utf8');
  try {
    renameSync(tmp, path);
  } catch (e) {
    try { unlinkSync(tmp); } catch { /* tmp zaten yok */ }
    throw e;
  }
}

/** Bozuk JSON SESSİZCE YUTULMAZ — çağıran durur, üstüne yazmaz. */
function loadLoot(dir) {
  const p = join(dir, LOOT_FILE);
  if (!existsSync(p)) return { path: p, loot: null };
  let raw;
  try {
    raw = readFileSync(p, 'utf8');
  } catch (e) {
    throw new Error(`LOOT_UNREADABLE: ${repoRel(p)} — ${e.message}`);
  }
  try {
    return { path: p, loot: JSON.parse(raw) };
  } catch (e) {
    throw new Error(
      `LOOT_BROKEN: ${repoRel(p)} geçerli JSON değil — ${e.message}\n` +
      '   Üstüne YAZILMADI. Dosyayı elle onar ya da taşı; kanonik kaynak tahminle kurtarılmaz.');
  }
}

// ---------------------------------------------------------------------------
// objectiveMetrics — `harvest()` çıktısının SAYISAL özeti. Nesir taşımaz.
// ---------------------------------------------------------------------------

function objectiveMetrics(dir, registerOverride) {
  const h = harvest(dir, { registerOverride });
  return {
    measuredAt: new Date().toISOString(),
    parserVersion: PARSER_VERSION,
    status: h.meta.status,
    register: h.register,
    registerSource: h.registerSource,
    world: h.world?.worldId ?? null,
    lint: h.lint
      ? { total: h.lint.total, clean: h.lint.total - h.lint.bad.length, badCount: h.lint.bad.length, counts: h.lint.counts }
      : null,
    frames: { total: h.frameTotal ?? null, source: h.frameTotalSource ?? null },
    revize: {
      blocks: h.revs.length,
      uniqueFrames: h.uniqueFrames.size,
      ratio: h.ratio,
      rounds: h.multiRound?.rounds ?? h.rounds.length,
      carryOverRate: h.multiRound?.carryOverRate ?? null,
    },
    kit: {
      missing: h.kit.filter((k) => !k.found).map((k) => k.name),
      nameDrift: h.kit.filter((k) => k.found && !k.exact).map((k) => k.name),
    },
    errors: h.errors,
  };
}

/**
 * `evidenceStrength` — düzeltme 2. **Model tahmini veri kılığına sokulmaz.**
 * Yalnız sayılabilir üç şeyden türer. Üçü de yoksa `null` — "orta güven" diye bir şey yazılmaz.
 */
function evidenceStrength({ frames, repeat, beforeAfter }) {
  const f = frames == null ? null : Number(frames);
  const r = repeat == null ? null : Number(repeat);
  if (f == null && r == null && !beforeAfter) return null;
  if (f != null && !Number.isFinite(f)) throw new Error('EVIDENCE_INVALID: --kare sayı olmalı');
  if (r != null && !Number.isFinite(r)) throw new Error('EVIDENCE_INVALID: --tekrar sayı olmalı');
  return { framesCovered: f, repeatCount: r, beforeAfter: Boolean(beforeAfter) };
}

// ---------------------------------------------------------------------------
// komutlar
// ---------------------------------------------------------------------------

function cmdKapat(dir, { registerOverride }) {
  const { path, loot } = loadLoot(dir);
  const metrics = objectiveMetrics(dir, registerOverride);
  const now = new Date().toISOString();

  // İkinci kapanış DUPLICATE ÜRETMEZ: hüküm ve adaylar korunur, yalnız ölçüm tazelenir.
  const next = loot
    ? { ...loot, objectiveMetrics: metrics, project: { ...loot.project, reclosedAt: now } }
    : {
        version: LOOT_VERSION,
        project: { id: basename(dir).normalize('NFC'), path: repoRel(dir), closedAt: now },
        status: 'interview-pending',
        subjectiveVerdict: { overall: null, layerVerdicts: null, recordedAt: null },
        objectiveMetrics: metrics,
        lessonCandidates: [],
        interview: { answered: [], skippedAt: null },
      };

  writeJsonAtomic(path, next);
  const yeniden = loot ? ' (mevcut hüküm ve adaylar KORUNDU)' : '';
  return { path, loot: next, log: [
    `${loot ? '↻' : '✅'} ${LOOT_FILE} ${loot ? 'ölçüm tazelendi' : 'kuruldu'}${yeniden}: ${repoRel(path)}`,
    `   ölçüm: ${metrics.status} · register ${metrics.register} (${metrics.registerSource}) · ` +
    `karne ${metrics.lint ? `${metrics.lint.clean}/${metrics.lint.total}` : '—'} · ` +
    `revize ${metrics.revize.blocks} blok/${metrics.revize.uniqueFrames} kare · ` +
    `kit eksik ${metrics.kit.missing.length}`,
  ] };
}

/** Röportaj — SORULAR BİRER BİRER. Yarım kalan kaldığı yerden devam eder. */
function cmdSor(dir) {
  const { loot } = loadLoot(dir);
  if (!loot) throw new Error(`LOOT_YOK: önce \`kapat\` koş — ${repoRel(join(dir, LOOT_FILE))}`);
  if (loot.status === 'interview-skipped') {
    return { log: ['ℹ röportaj ATLANDI. Yine sormak istersen: `cevap` komutu doğrudan çalışır.'] };
  }
  const answered = new Set((loot.interview?.answered ?? []));
  const next = LAYERS.find((l) => !answered.has(l.key));
  if (!next) {
    return { log: [`✅ röportaj tamam (${answered.size}/${LAYERS.length}). \`gor\` ile bak.`] };
  }
  return { log: [
    `[röportaj ${answered.size + 1}/${LAYERS.length}]  katman: ${next.key}`,
    '',
    next.soru,
    '',
    `Kaydetmek için: node scripts/project-loot.mjs cevap "${repoRel(dir)}" --katman ${next.key} --metin "<Mami'nin cümlesi>"`,
    'Atlamak için  : node scripts/project-loot.mjs atla  "' + repoRel(dir) + '"   (teknik loot yine yazılır)',
  ] };
}

function cmdCevap(dir, { katman, metin }) {
  if (!LAYER_KEYS.has(katman)) {
    throw new Error(`KATMAN_GECERSIZ: "${katman}" — ${[...LAYER_KEYS].join(' | ')} bekleniyor`);
  }
  const text = mamiText(metin);
  // Boş/belirsiz cevaptan DERS UYDURULMAZ ve hüküm kaydedilmez.
  if (!text || text.length < 3) {
    throw new Error('CEVAP_BOS: boş ya da tek harflik cevaptan hüküm yazılmaz (uydurma yasağı)');
  }
  const { path, loot } = loadLoot(dir);
  if (!loot) throw new Error(`LOOT_YOK: önce \`kapat\` koş — ${repoRel(join(dir, LOOT_FILE))}`);

  const sv = loot.subjectiveVerdict ?? { overall: null, layerVerdicts: null, recordedAt: null };
  const lv = { ...(sv.layerVerdicts ?? {}) };
  lv[katman] = text; // AYNEN — yeniden yazılmadı, kısaltılmadı, düzeltilmedi.
  if (katman === 'genel') sv.overall = text;

  const answered = [...new Set([...(loot.interview?.answered ?? []), katman])];
  const complete = LAYERS.every((l) => answered.includes(l.key));
  const next = {
    ...loot,
    status: complete ? 'interview-complete' : 'interview-partial',
    subjectiveVerdict: { ...sv, layerVerdicts: lv, recordedAt: new Date().toISOString() },
    interview: { ...(loot.interview ?? {}), answered, skippedAt: null },
  };
  writeJsonAtomic(path, next);
  return { path, loot: next, log: [
    `✅ hüküm kaydedildi — katman \`${katman}\` (${answered.length}/${LAYERS.length}) · statü: ${next.status}`,
    '   metin AYNEN yazıldı; sistem Mami\'nin cümlesini yeniden yazmaz.',
  ] };
}

/** Düzeltme 1 — röportaj tamamen atlanabilir; teknik loot YİNE yazılır. */
function cmdAtla(dir) {
  const { path, loot } = loadLoot(dir);
  if (!loot) throw new Error(`LOOT_YOK: önce \`kapat\` koş — ${repoRel(join(dir, LOOT_FILE))}`);
  const next = {
    ...loot,
    status: 'interview-skipped',
    subjectiveVerdict: { overall: null, layerVerdicts: null, recordedAt: null },
    interview: { ...(loot.interview ?? {}), skippedAt: new Date().toISOString() },
  };
  writeJsonAtomic(path, next);
  return { path, loot: next, log: [
    '✅ röportaj atlandı — `layerVerdicts: null`, teknik loot yerinde duruyor.',
    '   Zorunlu röportaj angaryaya döner, angarya atlanır (Faz 9 düzeltme 1).',
  ] };
}

function cmdAday(dir, { metin, kare, tekrar, beforeAfter }) {
  const text = mamiText(metin);
  if (!text || text.length < 8) throw new Error('ADAY_BOS: ders metni en az bir cümle olmalı');
  const { path, loot } = loadLoot(dir);
  if (!loot) throw new Error(`LOOT_YOK: önce \`kapat\` koş — ${repoRel(join(dir, LOOT_FILE))}`);

  const cands = Array.isArray(loot.lessonCandidates) ? loot.lessonCandidates : [];
  const key = dedupeKey(text);
  const dup = cands.find((c) => dedupeKey(c.text) === key);
  if (dup) return { path, loot, log: [`ℹ aynı ders zaten aday (#${dup.id}) — ikinci kez eklenmedi.`] };

  const id = cands.reduce((m, c) => Math.max(m, Number(c.id) || 0), 0) + 1;
  const next = {
    ...loot,
    lessonCandidates: [...cands, {
      id,
      text,
      evidenceStrength: evidenceStrength({ frames: kare, repeat: tekrar, beforeAfter }),
      carryForward: false, // Mami açıkça demedikçe global derse DÖNÜŞMEZ.
      approvedAt: null,
    }],
  };
  writeJsonAtomic(path, next);
  return { path, loot: next, log: [
    `✅ ders adayı #${id} eklendi · carry-forward: hayır (yalnız aday)`,
    '   APPROVED.md\'ye geçmesi için Mami açıkça "sonraki projelere taşı" demeli: `tasi --aday ' + id + '`',
  ] };
}

/**
 * Carry-forward — **yalnız Mami açıkça dediyse.** Otomatik promote yok.
 * `APPROVED.md`'de satır SONA eklenir: `slice(-20)` konumsaldır, üste yazmak en yeni dersi düşürür.
 */
function cmdTasi(dir, { adayId }) {
  const { path, loot } = loadLoot(dir);
  if (!loot) throw new Error(`LOOT_YOK: önce \`kapat\` koş — ${repoRel(join(dir, LOOT_FILE))}`);
  const cands = Array.isArray(loot.lessonCandidates) ? loot.lessonCandidates : [];
  const c = cands.find((x) => String(x.id) === String(adayId));
  if (!c) throw new Error(`ADAY_YOK: #${adayId} — mevcut adaylar: ${cands.map((x) => x.id).join(', ') || '(yok)'}`);
  if (!existsSync(APPROVED)) throw new Error(`APPROVED_YOK: ${repoRel(APPROVED)}`);

  const bank = readFileSync(APPROVED, 'utf8').replace(/\r\n/g, '\n');
  const lines = bank.split('\n');
  // Aynı ders iki kez eklenmez — banka satırlarının ders metni `—` öncesidir.
  const existing = lines
    .filter((l) => /^-\s+/.test(l))
    .map((l) => dedupeKey(l.replace(/^-\s+/, '').split(' — kaynak:')[0]));
  if (existing.includes(dedupeKey(c.text))) {
    const next = { ...loot, lessonCandidates: cands.map((x) => (x.id === c.id ? { ...x, carryForward: true } : x)) };
    writeJsonAtomic(path, next);
    return { path, loot: next, log: [`ℹ bu ders APPROVED.md'de ZATEN var — ikinci satır yazılmadı, loot işaretlendi.`] };
  }

  const day = new Date().toISOString().slice(0, 10);
  const row = `- ${c.text.replace(/\n+/g, ' ')} — kaynak: ${loot.project?.id ?? basename(dir)} · ${day} · Mami onayı`;
  const body = bank.replace(/\n+$/, '');
  writeFileSync(APPROVED, `${body}\n${row}\n`, 'utf8');

  const next = {
    ...loot,
    lessonCandidates: cands.map((x) => (x.id === c.id ? { ...x, carryForward: true, approvedAt: day } : x)),
  };
  writeJsonAtomic(path, next);
  return { path, loot: next, log: [
    `✅ carry-forward: ders #${c.id} APPROVED.md'ye SONA eklendi (${day}).`,
    `   ${row}`,
    '   Banka son 20 dersi runner + Konuşmalı Yönetmen context\'ine taşır.',
  ] };
}

function cmdGor(dir) {
  const { path, loot } = loadLoot(dir);
  if (!loot) return { log: [`ℹ ${LOOT_FILE} yok — bu proje loot'suz (eski proje). Kırılma değil.`] };
  const m = loot.objectiveMetrics ?? {};
  const sv = loot.subjectiveVerdict ?? {};
  const L = [
    `[loot] ${loot.project?.id ?? basename(dir)}  ·  statü: ${loot.status}`,
    `   dosya   : ${repoRel(path)}  (KANONİK — HASAT buradan üretilir)`,
    `   ölçüm   : ${m.status ?? '—'} · register ${m.register ?? '—'} (${m.registerSource ?? '—'}) · ` +
    `karne ${m.lint ? `${m.lint.clean}/${m.lint.total}` : '—'} · kit eksik ${m.kit?.missing?.length ?? '—'}`,
    '',
    '   MAMİ\'NİN HÜKMÜ (değiştirilmedi):',
  ];
  const lv = sv.layerVerdicts;
  if (loot.status === 'interview-skipped') L.push('     — röportaj atlandı (layerVerdicts: null)');
  else if (!lv || !Object.keys(lv).length) L.push('     — henüz alınmadı; sistem hüküm TAHMİN ETMEZ');
  else for (const l of LAYERS) if (lv[l.key]) L.push(`     ${l.key.padEnd(11)} ${lv[l.key].replace(/\n+/g, ' ')}`);
  L.push('');
  const cands = loot.lessonCandidates ?? [];
  L.push(`   DERS ADAYI: ${cands.length}`);
  for (const c of cands) {
    const es = c.evidenceStrength;
    L.push(`     #${c.id} [${c.carryForward ? 'CARRY-FORWARD' : 'yalnız aday'}] ${c.text.replace(/\n+/g, ' ')}`);
    L.push(`         kanıt: ${es ? `kare ${es.framesCovered ?? '—'} · before/after ${es.beforeAfter ? '✓' : '✗'} · tekrar ${es.repeatCount ?? '—'}` : 'null (sayılabilir kanıt yok — tahmin yazılmadı)'}`);
  }
  return { loot, log: L };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const eq = a.indexOf('=');
    if (eq > 0) { out[a.slice(2, eq)] = a.slice(eq + 1); continue; }
    const k = a.slice(2);
    const nx = argv[i + 1];
    if (nx == null || nx.startsWith('--')) out[k] = true;
    else { out[k] = nx; i++; }
  }
  return out;
}

const USAGE = [
  'kullanım:',
  '  node scripts/project-loot.mjs kapat "<proje>" [--register=EDU]',
  '  node scripts/project-loot.mjs sor   "<proje>"',
  '  node scripts/project-loot.mjs cevap "<proje>" --katman <startFrame|motion|ses|kurgu|genel> --metin "..."',
  '  node scripts/project-loot.mjs atla  "<proje>"',
  '  node scripts/project-loot.mjs aday  "<proje>" --metin "..." [--kare N] [--tekrar N] [--before-after]',
  '  node scripts/project-loot.mjs tasi  "<proje>" --aday <id>',
  '  node scripts/project-loot.mjs gor   "<proje>" [--json]',
].join('\n');

function run(argv) {
  const a = parseArgs(argv);
  const cmd = a._[0];
  const dirArg = a._[1];
  if (!cmd) return { code: 2, log: [USAGE] };

  const dir = resolveDir(dirArg);
  if (!dir) return { code: 2, log: [`yok: ${dirArg ?? '(dizin verilmedi)'}`, '', USAGE] };

  switch (cmd) {
    case 'kapat': return { code: 0, ...cmdKapat(dir, { registerOverride: a.register ?? null }) };
    case 'sor': return { code: 0, ...cmdSor(dir) };
    case 'cevap': return { code: 0, ...cmdCevap(dir, { katman: a.katman, metin: a.metin }) };
    case 'atla': return { code: 0, ...cmdAtla(dir) };
    case 'aday': return { code: 0, ...cmdAday(dir, { metin: a.metin, kare: a.kare, tekrar: a.tekrar, beforeAfter: Boolean(a['before-after']) }) };
    case 'tasi': return { code: 0, ...cmdTasi(dir, { adayId: a.aday }) };
    case 'gor': return { code: 0, ...cmdGor(dir) };
    default: return { code: 2, log: [`bilinmeyen komut: ${cmd}`, '', USAGE] };
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const argv = process.argv.slice(2);
  try {
    const r = run(argv);
    if (argv.includes('--json') && r.loot) process.stdout.write(`${JSON.stringify(r.loot, null, 2)}\n`);
    else for (const l of r.log ?? []) process.stdout.write(`${l}\n`);
    process.exit(r.code ?? 0);
  } catch (e) {
    // Hata SESSİZ YUTULMAZ: kanonik kaynakta belirsizlik açık kırmızıdır.
    process.stdout.write(`🔴 ${e.message}\n`);
    process.exit(1);
  }
}

export {
  run, cmdKapat, cmdSor, cmdCevap, cmdAtla, cmdAday, cmdTasi, cmdGor,
  objectiveMetrics, evidenceStrength, dedupeKey, LAYERS, LOOT_VERSION,
};
