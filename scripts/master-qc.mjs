#!/usr/bin/env node
/**
 * master-qc.mjs — TESLİM EDİLMİŞ VİDEOYU ölçer.
 *
 * Neden var: bu repoda 22 script hattın GİRİŞİNİ ölçüyor (prompt, kare, timeline XML) ve
 * teslim edilen MP4'ü ölçen tek satır yoktu. Ölçüldü (2026-08-03): masaüstünde 23 bitmiş
 * film duruyordu ve 12'sinin çözünürlüğü 1924x1076 idi — yani 16:9 bile değil.
 *
 * Ne yapar: bitmiş master dosyalarını bulur, ffprobe ile ölçer, standarttan sapanı KIRMIZI basar.
 * Ne YAPMAZ: dosya taşımaz, silmez, yeniden kodlamaz. Yalnız ölçer ve rapor eder.
 *
 * Kullanım:
 *   node scripts/master-qc.mjs                 # varsayılan kök taranır
 *   node scripts/master-qc.mjs --kok "<yol>"   # başka bir kök
 *   node scripts/master-qc.mjs --json          # makine-okur çıktı
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const VARSAYILAN_KOK = path.join(os.homedir(), 'Desktop', '6. Sınıf Animasyonlar');

// --- standart: bir master bunları taşımalı ---
const STD = {
  genislik: 1920,
  yukseklik: 1080,
  // fps MUTLAK değil, SET TUTARLILIĞI ölçülür: baskın fps bulunur, sapanlar işaretlenir.
  // Ölçüldü (2026-08-03): yeni 5-6. sınıf işleri 24 fps, eski işler 25 fps — "doğru" fps
  // diye bir şey yok, showreel'de KARIŞIK olması sorun.
  lufsHedef: -14,       // yayın normu; showreel'de filmler arası fark 1 LU'yu geçmemeli
  lufsTolerans: 1.0,
  minSaniye: 60,        // altındakiler klip ya da deneme, master değil
};

const argv = process.argv.slice(2);
const jsonMod = argv.includes('--json');
const kokIdx = argv.indexOf('--kok');
const KOK = kokIdx >= 0 ? argv[kokIdx + 1] : VARSAYILAN_KOK;

function ffprobe(dosya, args) {
  try {
    return execFileSync('ffprobe', ['-v', 'error', ...args, dosya], { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

/** Master adayı: adı sayı olmayan, süresi eşiği geçen mp4. Klipler "12.mp4" gibi adlanıyor. */
function masterAdaylari(kok) {
  const bulunan = [];
  let girisler;
  try {
    girisler = fs.readdirSync(kok, { withFileTypes: true });
  } catch {
    return bulunan;
  }
  for (const g of girisler) {
    if (!g.isDirectory()) continue;
    const klasor = path.join(kok, g.name);
    let dosyalar;
    try {
      dosyalar = fs.readdirSync(klasor);
    } catch {
      continue;
    }
    for (const d of dosyalar) {
      if (!/\.mp4$/i.test(d)) continue;
      if (/^\d+\.mp4$/i.test(d)) continue; // klip
      bulunan.push({ klasor: g.name, dosya: d, yol: path.join(klasor, d) });
    }
  }
  return bulunan;
}

function olc(aday) {
  const akis = ffprobe(aday.yol, [
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,r_frame_rate',
    '-of', 'csv=p=0',
  ]);
  const sure = ffprobe(aday.yol, ['-show_entries', 'format=duration', '-of', 'csv=p=0']);
  if (!akis || !sure) return null;

  const [g, y, fpsHam] = akis.split(',');
  const [pay, payda] = (fpsHam || '0/1').split('/').map(Number);
  const saniye = Number(sure);
  if (!Number.isFinite(saniye) || saniye < STD.minSaniye) return null;

  return {
    ...aday,
    genislik: Number(g),
    yukseklik: Number(y),
    fps: payda ? Math.round((pay / payda) * 100) / 100 : 0,
    saniye,
    boyutMB: Math.round(fs.statSync(aday.yol).size / 1e6),
  };
}

/** Gürlük ayrı geçiş ister ve pahalıdır — yalnız --lufs verilirse koşar. */
function lufsOlc(yol) {
  try {
    const cikti = execFileSync(
      'ffmpeg',
      ['-nostats', '-i', yol, '-filter_complex', 'ebur128=framelog=quiet', '-f', 'null', '-'],
      { encoding: 'utf8', stdio: ['ignore', 'ignore', 'pipe'] },
    );
    return null;
  } catch (e) {
    const m = String(e.stderr || '').match(/I:\s*(-?\d+\.\d+)\s*LUFS/g);
    if (!m || !m.length) return null;
    return Number(m[m.length - 1].match(/(-?\d+\.\d+)/)[1]);
  }
}

const fmtSure = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

// --- koş ---
const adaylar = masterAdaylari(KOK);
if (!adaylar.length) {
  console.error(`master-qc: "${KOK}" altında master bulunamadı.`);
  process.exit(2);
}

const lufsIstendi = argv.includes('--lufs');
const olculen = [];
for (const a of adaylar) {
  const o = olc(a);
  if (!o) continue;
  if (lufsIstendi) o.lufs = lufsOlc(o.yol);
  olculen.push(o);
}
olculen.sort((a, b) => b.saniye - a.saniye);

// --- hüküm ---
// fps: baskın olanı set standardı say (mutlak doğru fps yok, karışıklık sorun)
const fpsSayim = {};
for (const m of olculen) fpsSayim[m.fps] = (fpsSayim[m.fps] || 0) + 1;
const baskinFps = Number(Object.entries(fpsSayim).sort((a, b) => b[1] - a[1])[0][0]);

const kirmizi = [];
for (const m of olculen) {
  const sapma = [];
  if (m.genislik !== STD.genislik || m.yukseklik !== STD.yukseklik) {
    const oran = (m.genislik / m.yukseklik).toFixed(3);
    sapma.push(`çözünürlük ${m.genislik}x${m.yukseklik} (oran ${oran}, olması gereken 1920x1080 / 1.778)`);
  }
  if (m.fps !== baskinFps) sapma.push(`fps ${m.fps} — sette baskın fps ${baskinFps} (${fpsSayim[baskinFps]}/${olculen.length}); showreel'de karışık fps kesme hatası üretir`);
  if (lufsIstendi && m.lufs != null && Math.abs(m.lufs - STD.lufsHedef) > STD.lufsTolerans) {
    sapma.push(`gürlük ${m.lufs} LUFS (hedef ${STD.lufsHedef} ±${STD.lufsTolerans})`);
  }
  if (sapma.length) kirmizi.push({ ...m, sapma });
}

if (jsonMod) {
  console.log(JSON.stringify({ kok: KOK, standart: STD, masterlar: olculen, kirmizi }, null, 2));
  process.exit(kirmizi.length ? 1 : 0);
}

const toplamSn = olculen.reduce((t, m) => t + m.saniye, 0);
console.log(`\n[master-qc] ${KOK}`);
console.log(`${olculen.length} master · toplam ${fmtSure(toplamSn)} · ${olculen.reduce((t, m) => t + m.boyutMB, 0)} MB\n`);

for (const m of olculen) {
  const bayrak = kirmizi.find((k) => k.yol === m.yol) ? '🔴' : '✓ ';
  const yer = m.klasor === path.basename(m.dosya, '.mp4') ? '' : `   ◄ klasör: ${m.klasor}`;
  console.log(
    `${bayrak} ${fmtSure(m.saniye).padStart(5)}  ${String(m.genislik) + 'x' + m.yukseklik}  ${String(m.fps).padStart(4)}fps  ` +
    `${String(m.boyutMB).padStart(4)}MB  ${path.basename(m.dosya, '.mp4')}${yer}`,
  );
}

if (kirmizi.length) {
  console.log(`\n🔴 ${kirmizi.length}/${olculen.length} master standardın dışında:\n`);
  for (const k of kirmizi) {
    console.log(`  ${path.basename(k.dosya, '.mp4')}`);
    for (const s of k.sapma) console.log(`     · ${s}`);
  }
  console.log(`\nHüküm Mami'nin: yeniden export mu, olduğu gibi mi. Bu script dosyaya DOKUNMAZ.`);
} else {
  console.log(`\n✓ ${olculen.length} masterın hepsi standartta.`);
}

const yanlisKlasor = olculen.filter((m) => {
  const ad = path.basename(m.dosya, '.mp4').toLowerCase().replace(/\s+/g, '');
  const kl = m.klasor.toLowerCase().replace(/\s+/g, '');
  return !ad.includes(kl.slice(0, 12)) && !kl.includes(ad.slice(0, 12));
});
if (yanlisKlasor.length) {
  console.log(`\n⚠ ${yanlisKlasor.length} master adıyla uyuşmayan bir klasörde duruyor — portfolyo`);
  console.log(`  toplanırken yanlış dosya seçilme riski:`);
  for (const m of yanlisKlasor) {
    console.log(`  · "${path.basename(m.dosya, '.mp4')}"  →  ${m.klasor}/`);
  }
}

console.log(`\nGürlük ölçümü için: node scripts/master-qc.mjs --lufs  (yavaş, dosya başına tam geçiş)`);
process.exit(kirmizi.length ? 1 : 0);
