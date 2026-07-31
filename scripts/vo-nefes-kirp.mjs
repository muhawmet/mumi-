#!/usr/bin/env node
// MAMILAS — VO NEFES KIRPMA. Stüdyo sesindeki uzun duraklamaları kısaltır, nefesi ÖLDÜRMEZ.
//
// NEDEN VAR (Mami, 2026-07-31): *"nefes boşlukları çoktur, stüdyo sesi olduğu için çok uzun
// oluyor. Tamamını kesince at gibi koşuyor. 2 saniyelik bir boşluk varsa başına sonuna
// dokunma, ORTADAN 1 saniye sil — hem nefes alsın hem sohbet arası gibi durmasın."*
//
// YÖNTEM: her sessizlik aralığının BAŞI ve SONU korunur, kesim ORTADAN yapılır. Böylece
// cümlenin bitiş rezonansı ve sonraki cümlenin nefes alışı yerinde kalır; yalnız aradaki
// ölü zaman gider. Baştan kesmek cümlenin kuyruğunu, sondan kesmek nefesin kendisini yer.
//
//   node scripts/vo-nefes-kirp.mjs "<vo.mp3>" [--esik -34] [--kisa 0.40] [--hedef 0.38]
//                                              [--uzun 0.90] [--uzun-hedef 0.60] [--kuru]
//
//   --kuru : hiçbir dosya yazmaz, yalnız ne yapacağını ölçer ve basar.
//
// ÇIKTI: aynı klasöre `vo-kirpik.mp3` (kaynak dosyaya DOKUNULMAZ).
//
// ORTAM YASASI: saf Node + ffmpeg/ffprobe. Harici paket yok. Yol Türkçe olabilir.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';

const argv = process.argv.slice(2);
const arg = (ad, def) => {
  const i = argv.indexOf(`--${ad}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def;
};
const KURU = argv.includes('--kuru');
const ESIK = arg('esik', '-34');          // dB — bunun altı sessizlik sayılır
const KISA = parseFloat(arg('kisa', '0.40'));        // bundan kısa boşluk: DOKUNMA (cümle içi nefes)
const HEDEF = parseFloat(arg('hedef', '0.38'));      // orta boşluk bu boya iner
const UZUN = parseFloat(arg('uzun', '0.90'));        // bundan uzun boşluk: bölüm geçişi
const UZUN_HEDEF = parseFloat(arg('uzun-hedef', '0.60'));
const KENAR = 0.12;                        // her iki kenarda korunacak MİNİMUM (nefesin kendisi)

const kaynak = argv.find((a) => !a.startsWith('--') && /\.(mp3|wav|m4a|aac|flac)$/i.test(a));
if (!kaynak || !existsSync(kaynak)) {
  console.error('kullanım: node scripts/vo-nefes-kirp.mjs "<vo.mp3>" [--kuru]');
  process.exit(2);
}

const sn = (f) => parseFloat(execFileSync('ffprobe',
  ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim());

const toplam = sn(kaynak);

// ---------- 1. sessizlikleri ölç ----------
// ⚠ silencedetect STDERR'e yazar ve ffmpeg BAŞARIYLA çıkar — yani try/catch ile yakalanmaz.
// İlk sürüm tam buna takıldı: komut çalıştı, log boş kaldı, araç "ffmpeg kurulu mu?" dedi.
const ff = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', kaynak,
  '-af', `silencedetect=noise=${ESIK}dB:d=${KISA / 2}`, '-f', 'null', '-'],
{ encoding: 'utf8' });
const log = `${ff.stderr ?? ''}${ff.stdout ?? ''}`;
if (!log) { console.error('⛔ silencedetect çıktı vermedi — ffmpeg kurulu mu?'); process.exit(2); }

const bosluk = [];
let bas = null;
for (const ln of String(log).split('\n')) {
  let m = /silence_start:\s*([\d.]+)/.exec(ln);
  if (m) { bas = parseFloat(m[1]); continue; }
  m = /silence_end:\s*([\d.]+)/.exec(ln);
  if (m && bas !== null) { bosluk.push([bas, parseFloat(m[1])]); bas = null; }
}

// ---------- 2. hangi boşluktan ne kesilecek ----------
// Kesim ORTADAN. Kenarlarda en az KENAR kadar sessizlik kalır — nefes orada yaşıyor.
const kesimler = []; // [kesBas, kesSon]
let kazanc = 0;
for (const [a, b] of bosluk) {
  const boy = b - a;
  if (boy < KISA) continue;                              // cümle içi nefes — DOKUNMA
  const hedef = boy >= UZUN ? UZUN_HEDEF : HEDEF;
  if (boy <= hedef) continue;
  const kesilecek = boy - hedef;
  // ortadan kes; iki kenarda da en az KENAR kalsın
  const orta = (a + b) / 2;
  let kesBas = orta - kesilecek / 2;
  let kesSon = orta + kesilecek / 2;
  if (kesBas < a + KENAR) kesBas = a + KENAR;
  if (kesSon > b - KENAR) kesSon = b - KENAR;
  if (kesSon - kesBas <= 0.02) continue;
  kesimler.push([kesBas, kesSon]);
  kazanc += kesSon - kesBas;
}

const kova = (lo, hi) => bosluk.filter(([a, b]) => b - a >= lo && b - a < hi).length;
console.log(`🎙  ${basename(kaynak)} — ${toplam.toFixed(1)}s`);
console.log(`   boşluk: ${bosluk.length} · toplam sessizlik ${bosluk.reduce((t, [a, b]) => t + (b - a), 0).toFixed(1)}s`);
console.log(`   <${KISA}s: ${kova(0, KISA)} (dokunulmadı) · ${KISA}-${UZUN}s: ${kova(KISA, UZUN)} · >${UZUN}s: ${kova(UZUN, 99)}`);
console.log(`   ✂ ${kesimler.length} kesim · kazanç ${kazanc.toFixed(1)}s → yeni süre ${(toplam - kazanc).toFixed(1)}s`);

if (KURU) { console.log('   (--kuru: dosya yazılmadı)'); process.exit(0); }
if (!kesimler.length) { console.log('   kesilecek boşluk yok.'); process.exit(0); }

// ---------- 3. tut/at aralıklarını kur ve birleştir ----------
const tut = [];
let imlec = 0;
for (const [a, b] of kesimler) { if (a > imlec) tut.push([imlec, a]); imlec = b; }
if (imlec < toplam) tut.push([imlec, toplam]);

// aselect + asetpts: tek geçişte, yeniden kodlama bir kez
const ifade = tut.map(([a, b]) => `between(t,${a.toFixed(3)},${b.toFixed(3)})`).join('+');
const cikti = join(dirname(kaynak), 'vo-kirpik.mp3');
execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', kaynak,
  '-af', `aselect='${ifade}',asetpts=N/SR/TB`, '-c:a', 'libmp3lame', '-q:a', '2', cikti],
{ stdio: ['ignore', 'ignore', 'inherit'] });

const yeni = sn(cikti);
console.log(`✅ ${basename(cikti)} — ${yeni.toFixed(1)}s (${(toplam - yeni).toFixed(1)}s kısaldı)`);
console.log('   kaynak dosyaya DOKUNULMADI. Kaba kurguyu --vo ile bu dosyayı vererek yeniden kur.');
if (Math.abs((toplam - kazanc) - yeni) > 1.5) {
  console.log(`   ⚠ beklenen ${(toplam - kazanc).toFixed(1)}s ile gerçek ${yeni.toFixed(1)}s arasında fark var — dinle.`);
}
