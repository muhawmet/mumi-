#!/usr/bin/env node
// Genel teslim birleştiricisi — <proje>/<ALT>/NN.txt dosyalarını tek teslim .txt'sinde toplar.
//
//   node scripts/birlestir.mjs "Bileşke Kuvvet"                 → PROMPTLAR birleşir
//   node scripts/birlestir.mjs "Bileşke Kuvvet" MOTION          → MOTION birleşir
//   node scripts/birlestir.mjs "Bileşke Kuvvet" PROMPTLAR --md2txt
//                                                → önce .md dosyalarını .txt'ye çevirir
//
// Neden genel: `ureme-birlestir.mjs` ve `ureme-motion-birlestir.mjs` sekans sınırlarını
// KOD İÇİNE gömüyordu — her yeni ders üçüncü bir kopya demekti. Burada sınırlar
// <proje>_EDIT-PLAN.txt'nin kendi "##### SEKANS n — AD · K01-K16" başlıklarından okunuyor.
// Tek kaynak: edit planı. Plan değişince birleştirici kendiliğinden takip eder.
//
// Teslim .txt ve prompt blokları `-----` ayraçlı (PROMPT-YASASI §16) — Mami kopyalayıp
// motora yapıştırıyor, markdown fence uğraştırıyor.
//
// ⚠ Repo kökünden koş. Alt dizinden çalışmaz.

import { readdirSync, readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const [proje, altArg, ...bayraklar] = process.argv.slice(2);
const alt = altArg && !altArg.startsWith('--') ? altArg : 'PROMPTLAR';
const md2txt = process.argv.includes('--md2txt');

if (!proje) {
  console.error('kullanım: node scripts/birlestir.mjs "<proje adı>" [ALT=PROMPTLAR] [--md2txt]');
  process.exit(2);
}

const DIR = join('agents/COMMAND-INBOX', proje);
const SRC = join(DIR, alt);
const OUT = join(DIR, `${proje}_${alt}.txt`);
const PLAN = join(DIR, `${proje}_EDIT-PLAN.txt`);

if (!existsSync(SRC)) {
  console.error(`⛔ yok: ${SRC}\n   repo kökünden koştuğundan emin ol.`);
  process.exit(2);
}

/** .md → .txt. Git izliyorsa `git mv` (geçmiş korunur), izlemiyorsa düz rename. */
const cevir = () => {
  const mdler = readdirSync(SRC).filter((f) => /^\d{1,4}\.md$/.test(f));
  for (const f of mdler) {
    const eski = join(SRC, f);
    const yeni = join(SRC, f.replace(/\.md$/, '.txt'));
    let izleniyor = false;
    try {
      izleniyor = execFileSync('git', ['ls-files', '--error-unmatch', '--', eski],
        { stdio: ['ignore', 'pipe', 'ignore'] }).length > 0;
    } catch { /* izlenmiyor */ }
    if (izleniyor) execFileSync('git', ['mv', '--', eski, yeni]);
    else renameSync(eski, yeni);
  }
  return mdler.length;
};

/** Sekans sınırlarını EDIT-PLAN başlıklarından çıkar. Plan yoksa tek blok döner. */
const sekanslar = () => {
  if (!existsSync(PLAN)) return null;
  const bulunan = [];
  const re = /^#{2,}\s*(SEKANS[^·\n]*?)\s*·\s*K(\d+)\s*[-–]\s*K(\d+)/gim;
  for (const m of readFileSync(PLAN, 'utf8').matchAll(re)) {
    bulunan.push({ ad: m[1].trim(), bas: Number(m[2]), son: Number(m[3]) });
  }
  return bulunan.length ? bulunan : null;
};

/** Başlık satırından süreyi çeker: "### K5 | 10s · ..." — yoksa 0. */
const sureOf = (blok) => Number((/\|\s*(\d+)s/.exec(blok) || [])[1] || 0);

if (md2txt) {
  const n = cevir();
  console.log(`.md → .txt : ${n} dosya`);
}

const mevcut = new Map();
const kaynak = new Map(); // hangi numarayı hangi dosya doldurdu — çakışma kanıtı için
for (const f of readdirSync(SRC)) {
  const m = /^(\d{1,4})\.txt$/.exec(f);
  if (!m) continue;
  const no = Number(m[1]);
  // SESSİZ VERİ KAYBI: `01.txt` ve `1.txt` aynı anahtara düşer (Number("01")===Number("1"))
  // ve ikincisi birincisini hiçbir uyarı vermeden ezerdi. Bir kare teslimden yok olur ve
  // kimse fark etmez. Regex 2 haneden 1-4 haneye açılınca bu kapı da açılmış oldu.
  if (kaynak.has(no)) {
    console.error(`⛔ ÇAKIŞMA: ${kaynak.get(no)} ile ${f} aynı kare numarasına (${no}) düşüyor.`);
    console.error('   İkisinden biri sessizce kaybolurdu. Fazla dosyayı sil ya da yeniden adlandır.');
    process.exit(2);
  }
  kaynak.set(no, f);
  mevcut.set(no, readFileSync(join(SRC, f), 'utf8').trim());
}

if (!mevcut.size) {
  console.error(`⛔ ${SRC} içinde NN.txt yok. --md2txt unuttun mu?`);
  process.exit(2);
}

const numaralar = [...mevcut.keys()].sort((a, b) => a - b);
const enBuyuk = numaralar[numaralar.length - 1];
const toplamSure = [...mevcut.values()].reduce((a, b) => a + sureOf(b), 0);

/** Türkçe büyütme: düz toUpperCase 'i'yi 'I' yapar, 'İ' olmalı. */
const buyut = (s) => s.replace(/i/g, 'İ').toUpperCase();
/** K5 değil K05 — teslim dosyasında numaralar hizalı okunsun. */
const kn = (n) => `K${String(n).padStart(2, '0')}`;

const parcalar = [`${buyut(proje)} — ${alt}
${'='.repeat(73)}
Blok: ${mevcut.size}/${enBuyuk}${toplamSure ? ` · toplam ham süre: ${toplamSure}s (~${Math.round(toplamSure / 60)} dk)` : ''}
Kaynak: ${SRC}/  ·  edit planı: ${existsSync(PLAN) ? `${proje}_EDIT-PLAN.txt` : 'YOK'}
Yasa: agents/PROMPT-YASASI.md

KULLANIM: "-----" ayraçları arasındaki İngilizce metin prompt'tur.
Üstündeki Türkçe satırlar yönetmen notudur — YAPIŞTIRMA.
${'='.repeat(73)}`];

const gruplar = sekanslar();

if (gruplar) {
  const yerlesen = new Set();
  for (const { ad, bas, son } of gruplar) {
    const blok = [];
    for (let n = bas; n <= son; n++) {
      if (mevcut.has(n)) { blok.push(mevcut.get(n)); yerlesen.add(n); }
    }
    if (!blok.length) continue;
    const s = blok.reduce((a, b) => a + sureOf(b), 0);
    parcalar.push(`\n\n##### ${ad}  ·  ${kn(bas)}-${kn(son)}${s ? `  ·  ${s}s` : ''}\n${'='.repeat(73)}\n\n${blok.join('\n\n')}`);
  }
  // Plandaki hiçbir sekansa girmeyen dosya sessizce düşmesin.
  const artan = numaralar.filter((n) => !yerlesen.has(n));
  if (artan.length) {
    parcalar.push(`\n\n##### SEKANS DIŞI (edit planında aralığı yok)\n${'='.repeat(73)}\n\n${artan.map((n) => mevcut.get(n)).join('\n\n')}`);
  }
} else {
  parcalar.push(`\n\n${numaralar.map((n) => mevcut.get(n)).join('\n\n')}`);
}

const eksik = [];
for (let n = 1; n <= enBuyuk; n++) if (!mevcut.has(n)) eksik.push(n);
if (eksik.length) parcalar.push(`\n\n⚠️ EKSİK: ${eksik.join(', ')}`);

writeFileSync(OUT, `${parcalar.join('')}\n`);
console.log(`${OUT}\nblok: ${mevcut.size}/${enBuyuk}${gruplar ? ` · sekans: ${gruplar.length}` : ' · sekans başlığı bulunamadı, düz liste'}${eksik.length ? ` · EKSİK: ${eksik.join(', ')}` : ''}`);
