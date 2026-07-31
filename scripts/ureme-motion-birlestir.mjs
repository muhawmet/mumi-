#!/usr/bin/env node
// Eşeyli ve Eşeysiz Üreme — MOTION/<nn>.txt dosyalarını tek teslim dosyasında toplar.
// Kardeşi `ureme-birlestir.mjs` start-frame'leri topluyor; bu da motion'ı.
// Yeni klip geldikçe tekrar koşulur; dosya baştan yazılır.
//
// Teslim dosyası `.txt` ve prompt blokları `-----` ayraçlı (PROMPT-YASASI §16) —
// Mami kopyalayıp Kling'e yapıştırıyor, fence/markdown uğraştırıyor.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'agents/COMMAND-INBOX/6. Sınıf - Eşeyli ve Eşeysiz Üreme';
const SRC = join(DIR, 'MOTION');
const OUT = join(DIR, 'Eşeyli ve Eşeysiz Üreme_MOTION.txt');

// Start-frame birleştiricisiyle AYNI sekans sınırları — ikisi ayrışırsa kurgu bozulur.
const SEKANSLAR = [
  [1, 5, 'SEKANS 1 — AÇILIŞ: SORU'],
  [6, 10, 'SEKANS 2 — EŞEYSİZ ÜREME: TANIM'],
  [11, 15, 'SEKANS 3 — BÖLÜNEREK ÜREME'],
  [16, 20, 'SEKANS 4 — TOMURCUKLANMA'],
  [21, 27, 'SEKANS 5 — REJENERASYON İLE ÜREME'],
  [28, 33, 'SEKANS 6 — VEJETATİF ÜREME'],
  [34, 44, 'SEKANS 7 — EŞEYLİ ÜREME'],
  [45, 48, 'SEKANS 8 — ÖZET VE KARŞILAŞTIRMA'],
  [49, 50, 'SEKANS 9 — KAPANIŞ'],
];

const mevcut = new Map();
for (const f of readdirSync(SRC)) {
  const m = /^(\d{1,4})\.txt$/.exec(f);
  if (m) mevcut.set(Number(m[1]), readFileSync(join(SRC, f), 'utf8').trim());
}

/** Başlık satırından süreyi çeker: "### K5 | 10s · ekranda ~9s | VO ..." */
const sureOf = (blok) => Number((/\|\s*(\d+)s/.exec(blok) || [])[1] || 0);

const toplamSure = [...mevcut.values()].reduce((a, b) => a + sureOf(b), 0);
const onluk = [...mevcut.entries()].filter(([, b]) => sureOf(b) === 10).map(([n]) => n);

const parcalar = [`EŞEYLİ VE EŞEYSİZ ÜREME — 6. SINIF · MOTION PROMPT'LARI (Kling 3.0 i2v)
=========================================================================
Klip: ${mevcut.size}/50 · toplam ham süre: ${toplamSure}s (~${Math.round(toplamSure / 60)} dk)
10 saniyelik klipler (${onluk.length}): ${onluk.join(', ')}
Kaynak kareler: Resimler/<n>.png · start-frame prompt'ları: <Ad>_PROMPTLAR.txt
Yasa: PROMPT-YASASI §3 (motion template) · §3a (klipte bir şey değişmeli) · §3b (kamera)

KULLANIM: her klip için start frame'i Kling'e yükle, aşağıdaki bloğu yapıştır.
"-----" ayraçları arasındaki İngilizce metin prompt'tur; üstündeki Türkçe satırlar
yönetmen notudur, YAPIŞTIRMA.
=========================================================================`];

for (const [bas, son, ad] of SEKANSLAR) {
  const blok = [];
  for (let n = bas; n <= son; n++) if (mevcut.has(n)) blok.push(mevcut.get(n));
  if (!blok.length) continue;
  const sure = blok.reduce((a, b) => a + sureOf(b), 0);
  parcalar.push(`\n\n##### ${ad}  ·  K${bas}-K${son}  ·  ${sure}s\n${'='.repeat(73)}\n\n${blok.join('\n\n')}`);
}

const eksik = [];
for (let n = 1; n <= 50; n++) if (!mevcut.has(n)) eksik.push(n);
if (eksik.length) parcalar.push(`\n\n⚠️ EKSİK KLİP: ${eksik.join(', ')}`);

writeFileSync(OUT, `${parcalar.join('')}\n`);
console.log(`${OUT}\nyazılan klip: ${mevcut.size}/50 · toplam ${toplamSure}s${eksik.length ? ` · EKSİK: ${eksik.join(', ')}` : ''}`);
