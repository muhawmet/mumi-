#!/usr/bin/env node
// MAMILAS MOTION QC — sistemdeki son kapatılmamış döngü.
//
// Bugün kareyi denetliyoruz, çıkan VİDEOYU hiç denetlemiyoruz. Kling'in bozduğu bir yazıyı
// Mami ancak Premiere'de, yani en pahalı yerde fark ediyor. Bu script klipten kare çekip
// denetimi üretim anına taşır — ajan videoyu izleyemez ama karelerini GÖREBİLİR.
//
//   node scripts/motion-qc.mjs <klip.mp4> [...]      # kare çek
//   node scripts/motion-qc.mjs --dir <klasör>        # klasördeki tüm klipler
//
// Çıktı: <klip>_qc/ altına 4 PNG (başlangıç · %35 · %70 · son). Ajan bunları Read ile açıp
// karşılaştırır. Karşılaştırma listesi aşağıda basılır — script hüküm VERMEZ, kanıt üretir.

import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, basename, extname, dirname } from 'node:path';

const has = (bin) => {
  try { execFileSync(bin, ['-version'], { stdio: 'ignore' }); return true; } catch { return false; }
};

if (!has('ffmpeg') || !has('ffprobe')) {
  console.error(`
❌ ffmpeg / ffprobe bulunamadı — motion denetimi KOŞAMAZ.

Bu bir uyarı değil, bir durak: sessizce geçmek "video denetlendi" yanılsaması üretir.

Windows'ta kurulum (birini seç, tek satır):
  winget install Gyan.FFmpeg
  scoop install ffmpeg

Kurduktan sonra terminali yeniden aç ve bu komutu tekrar koş.
`.trim());
  process.exit(2);
}

const args = process.argv.slice(2);
const clips = [];
const dirIdx = args.indexOf('--dir');
if (dirIdx !== -1 && args[dirIdx + 1]) {
  const d = args[dirIdx + 1];
  for (const f of readdirSync(d)) {
    if (/\.(mp4|mov|webm|mkv)$/i.test(f)) clips.push(join(d, f));
  }
} else {
  clips.push(...args.filter((a) => !a.startsWith('--')));
}

if (!clips.length) {
  console.error('kullanım: node scripts/motion-qc.mjs <klip.mp4> [...]  ya da  --dir <klasör>');
  process.exit(2);
}

// Dört an: başlangıç (start frame ile karşılaştırma) · %35 (hareket ortası) ·
// %70 (yasa: olay burada çözülür) · son (drift ve uydurma en çok burada çıkar).
const MARKS = [0.02, 0.35, 0.70, 0.98];

for (const clip of clips) {
  if (!existsSync(clip)) { console.error(`yok: ${clip}`); continue; }
  const dur = Number(execFileSync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', clip,
  ]).toString().trim());
  if (!Number.isFinite(dur) || dur <= 0) { console.error(`süre okunamadı: ${clip}`); continue; }

  const out = join(dirname(clip), `${basename(clip, extname(clip))}_qc`);
  mkdirSync(out, { recursive: true });

  const shots = [];
  MARKS.forEach((m, i) => {
    const t = (dur * m).toFixed(3);
    const png = join(out, `${String(i + 1).padStart(2, '0')}_${Math.round(m * 100)}pct.png`);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', t, '-i', clip, '-frames:v', '1', png]);
    shots.push(png);
  });

  console.log(`\n━━ ${basename(clip)} — ${dur.toFixed(1)}s · ${shots.length} kare çekildi → ${out}`);
  for (const s of shots) console.log(`   ${basename(s)}  ${statSync(s).size} bayt`);
}

console.log(`
─────────────────────────────────────────────────────────────
AJAN İÇİN — çekilen kareleri Read ile AÇ ve şunları karşılaştır
(kaynak: agents/PROMPT-YASASI.md §3):

1. YAZI  — karedeki metin son karede de AYNI mı? Harf morph'u, yeniden hecelenme,
           titreme var mı? (Kling yazıyı dönüştürmek zorunda kalınca baştan yaratıyor.)
2. YENİ ÖĞE — son karede, başlangıçta OLMAYAN bir karakter/nesne/yazı belirmiş mi?
           Motion yeni öğe doğurmaz; doğurduysa start frame eksikti.
3. WARP  — katı/mekanik nesne (dişli, pusula, kronometre, rig) eriyip bükülmüş mü?
           Diş sayısı, oran, geometri değişmiş mi?
4. KİMLİK — karakterin yüzü/kıyafeti/teni klip boyunca sabit mi? Cilt yeşile/griye kaymış mı?
5. KAVRAM IŞIĞI — glow ışık olarak mı kalmış, yoksa çiçek/ok ucu/gerçek ateşe mi dönmüş?
6. AĞIZ  — konuşma/dudak hareketi var mı? Olmamalı (VO ayrı katman).
7. KAMERA — istenmeyen whip-pan/shake/snap-zoom ya da kadraj kayması var mı?

Bulgu varsa: önce KAREYİ düzelt (i2v'de kompozisyon kareden gelir), motion'a negatif yığma.
Hüküm bu script'in değil, ajanın + Mami'nin.
─────────────────────────────────────────────────────────────`);
