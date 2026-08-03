#!/usr/bin/env node
/**
 * edit-plan.mjs — EDIT-PLAN'ı MOTION dosyalarından TÜRETİR.
 *
 * Neden var (2026-08-03'te iki kez ölçüldü):
 *  1. Bitkilerde'de EDIT-PLAN 15 klibi `UZUN ÜRET` diye işaretlemişti; üretimde **yalnız 1'i**
 *     uzun üretildi. 54 kaynak klibin 51'i tam 5.04 saniye çıktı, filmde 13 plan tam 4.54s —
 *     yani kırpılmamış klip boyu. Plan yazmış, üretim uymamış, kurgu mecburen uymuş.
 *  2. Hücre'de motion süreleri elle güncellenince EDIT-PLAN aynı gün bayatladı.
 *
 * Çözüm: tek doğruluk kaynağı **MOTION başlık satırıdır** (`### K07 | 8s · ekranda ~8s | VO "…"`).
 * Plan oradan türetilir; ikisi yapısal olarak ayrışamaz.
 *
 * Kullanım:
 *   node scripts/edit-plan.mjs "5. Sınıf - Hücre ve Organelleri"
 *   node scripts/edit-plan.mjs "<proje>" --yaz     # dosyaya yazar
 */

import fs from 'node:fs';
import path from 'node:path';

const INBOX = 'agents/COMMAND-INBOX';
const argv = process.argv.slice(2);
const proje = argv.find((a) => !a.startsWith('--'));
const yaz = argv.includes('--yaz');

if (!proje) {
  console.error('kullanım: node scripts/edit-plan.mjs "<proje adı>" [--yaz]');
  process.exit(2);
}

const kok = path.join(INBOX, proje);
if (!fs.existsSync(kok)) {
  console.error(`edit-plan: proje bulunamadı — ${kok}`);
  process.exit(2);
}

// --- VO ---
const voDosya = fs.readdirSync(kok).find((f) => /_SESLENDIRME\.txt$/.test(f));
if (!voDosya) {
  console.error('edit-plan: _SESLENDIRME.txt yok — VO cümleleri olmadan plan türetilemez.');
  process.exit(2);
}
const cumleler = new Map();
const sekanslar = new Map();
let seq = null;
for (const raw of fs.readFileSync(path.join(kok, voDosya), 'utf8').split('\n')) {
  const l = raw.trim();
  if (l.startsWith('=====') && l.includes('SEKANS')) { seq = l.replace(/=/g, '').trim(); continue; }
  const m = l.match(/^(\d+)\.\s+(.*)$/);
  if (!m) continue;
  const n = Number(m[1]);
  if (cumleler.has(n)) continue;
  cumleler.set(n, m[2]);
  if (seq) sekanslar.set(n, seq);
}

// --- MOTION başlıkları: tek doğruluk kaynağı ---
const mdir = path.join(kok, 'MOTION');
if (!fs.existsSync(mdir)) {
  console.error(`edit-plan: ${mdir} yok — plan MOTION'dan türetilir, motion olmadan üretilemez.`);
  process.exit(2);
}
const klipler = [];
for (const f of fs.readdirSync(mdir).filter((f) => /^\d+\.txt$/.test(f)).sort()) {
  const bas = fs.readFileSync(path.join(mdir, f), 'utf8').split('\n')[0];
  const m = bas.match(/^###\s*K(\d+)\s*\|\s*(\d+)s\s*·\s*ekranda\s*~?(\d+(?:\.\d+)?)s/);
  if (!m) { console.error(`⚠ başlık okunamadı: ${f} → ${bas.slice(0, 60)}`); continue; }
  klipler.push({ n: Number(m[1]), uret: Number(m[2]), ekran: Number(m[3]), dosya: f });
}
klipler.sort((a, b) => a.n - b.n);

// --- kare dosyası ---
const idir = path.join(kok, 'images');
const kareler = fs.existsSync(idir) ? fs.readdirSync(idir) : [];
const kareOf = (n) => kareler.find((f) => f.replace(/\.(png|jpg|jpeg)$/i, '') === String(n)) || `${n}.png`;

// --- VO süre tahmini: Türkçe hece ≈ ünlü sayısı, sakin anlatım 4.35 hece/sn + nefes ---
const V = /[aeıioöuüâîû]/gi;
const voSure = (t) => Math.max(1.4, (t.match(V) || []).length / 4.35 + 0.35);
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const kova = (uret) => (uret <= 3 ? 'GEÇİŞ' : uret >= 8 ? 'VURUŞ' : 'TAŞIYICI');

let t = 0, toplamVo = 0;
const satirlar = [];
let sonSeq = null;
const uzunUret = [], uyarilar = [];

for (const k of klipler) {
  const cumle = cumleler.get(k.n);
  if (!cumle) { uyarilar.push(`K${k.n} — MOTION var ama VO cümlesi yok`); continue; }
  const s = sekanslar.get(k.n);
  if (s !== sonSeq) { satirlar.push({ h: s }); sonSeq = s; }

  const v = voSure(cumle);
  toplamVo += v;
  const bas = t, bit = t + k.ekran;
  t = bit;

  const bayrak = [];
  if (k.uret >= 8) { bayrak.push(`🔴 ${k.uret}s ÜRET`); uzunUret.push(k.n); }
  if (k.ekran > k.uret) bayrak.push(`son kare ${(k.ekran - k.uret).toFixed(0)}s dondur`);
  if (v > k.ekran + 0.25) bayrak.push(`◄VO ${v.toFixed(1)}s > pencere ${k.ekran}s`);
  if (k.uret <= 3 && v > k.uret) bayrak.push('◄L-kesim: görüntü cümleden önce biter');

  satirlar.push({
    l: `${kareOf(k.n).padEnd(9)} K${String(k.n).padStart(2, '0')}  ${kova(k.uret).padEnd(8)} `
      + `${k.uret}s  ${v.toFixed(1)}s  [${fmt(bas)}–${fmt(bit)}]  ${cumle}`
      + (bayrak.length ? `   ${bayrak.join(' · ')}` : ''),
  });
}

const dagilim = {};
for (const k of klipler) dagilim[k.uret] = (dagilim[k.uret] || 0) + 1;
const farkliSure = Object.keys(dagilim).length;

const out = [];
out.push(`${proje.toUpperCase()} — EDIT PLAN`);
out.push('='.repeat(73));
out.push(`🔴 BU DOSYA ELLE YAZILMAZ — MOTION başlıklarından türetilir:`);
out.push(`   node scripts/edit-plan.mjs "${proje}" --yaz`);
out.push(`   Süreyi değiştirmek istiyorsan MOTION/NN.txt başlık satırını değiştir, sonra bunu koş.`);
out.push(`   Sebep ölçüldü: elle tutulan plan aynı gün bayatlıyor ve "UZUN ÜRET" bayrağı üretime geçmiyor.`);
out.push('');
out.push(`${klipler.length} klip · toplam görüntü ${fmt(t)} · VO tahmini ${fmt(toplamVo)}`);
out.push(`süre dağılımı: ${Object.entries(dagilim).sort((a, b) => a[0] - b[0]).map(([s, n]) => `${s}s×${n}`).join(' · ')}`);
out.push(farkliSure === 1
  ? `🔴 METRONOM UYARISI: ${klipler.length} klibin hepsi aynı sürede. Ölçüldü (Bitkilerde, 54 plan,`
    + ` standart sapma 0.68s): tek bantta kalan kurgu ritim değil metronom üretir — Mami'nin`
    + ` "kurgu çok basic" hükmü buradan doğdu. En az üç farklı süre olmalı.`
  : `✓ ritim: ${farkliSure} farklı süre — metronom kırılmış.`);
out.push('');
out.push('SÜTUNLAR: kare · klip · kova · ÜRETİM süresi · VO tahmini · pencere · cümle · bayrak');
out.push('⚠ VO süreleri TAHMİNDİR. Bu hatta tahmin tarihsel olarak yüksek çıkıyor (Kütle plan 3:33 →');
out.push('  gerçek 3:00 · Bitkilerde plan 4:32 → gerçek 3:29). Gerçek VO inince kaba-kurgu.mjs');
out.push('  kesimleri whisper ile GERÇEK cümle sınırlarına oturtur; buradaki pencereler planlamadır.');
out.push('='.repeat(73));

for (const s of satirlar) out.push(s.h ? `\n##### ${s.h} #####` : s.l);

out.push('');
out.push('='.repeat(73));
if (uzunUret.length) {
  out.push(`🔴 UZUN ÜRETİLECEK ${uzunUret.length} KLİP: ${uzunUret.map((n) => 'K' + String(n).padStart(2, '0')).join(' · ')}`);
  out.push('   Bu klipler motorda O SÜREDE üretilir — 5 saniyelik klipten kırpılmaz.');
  out.push('   Ölçüldü (Bitkilerde): plan 15 klibi uzun işaretlemişti, üretimde yalnız 1\'i uzun üretildi;');
  out.push('   filmde 13 plan tam 4.54s çıktı, yani kırpılmamış klip boyu. Bayrak planda kalırsa hiçbir şey değişmiyor.');
}
if (uyarilar.length) { out.push(''); for (const u of uyarilar) out.push(`⚠ ${u}`); }

const metin = out.join('\n') + '\n';
if (yaz) {
  const ad = (fs.readdirSync(kok).find((f) => /_EDIT-PLAN\.txt$/.test(f)))
    || `${proje.replace(/^\d+\.\s*Sınıf\s*-\s*/, '')}_EDIT-PLAN.txt`;
  fs.writeFileSync(path.join(kok, ad), metin);
  console.log(`✓ yazıldı: ${path.join(kok, ad)}`);
  console.log(`  ${klipler.length} klip · ${fmt(t)} · ${farkliSure} farklı süre`);
} else {
  console.log(metin);
}
