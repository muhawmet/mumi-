#!/usr/bin/env node
// Sekans ajanlarının REVIZE/S*.txt çıktılarını TEK dosyada, kare sırasına göre birleştirir.
// Mami'nin kuralı (2026-08-04): "bütün revizeleri tek dosya yap, baştaki prompt gibi sırayla
// üreteyim, elimle teker teker aratma. Başına NEDEN revize olduğunu da yaz, bakarım —
// bazen yanlışta görebiliyorsun."
// Kullanım: node scripts/revize-birlestir.mjs "<proje klasörü>"

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const dir = process.argv[2];
if (!dir || !existsSync(dir)) {
  console.error('kullanım: node scripts/revize-birlestir.mjs "<proje klasörü>"');
  process.exit(1);
}
const revizeDir = join(dir, 'REVIZE');
if (!existsSync(revizeDir)) { console.error('REVIZE/ yok'); process.exit(1); }

const proje = basename(dir).replace(/^\d+\.\s*Sınıf\s*-\s*/, '').trim();

/** Bir sekans dosyasını `### n.png` bloklarına ayırır. */
function bloklar(metin) {
  const out = [];
  const parts = metin.split(/^### /m).slice(1);
  for (const p of parts) {
    const nl = p.indexOf('\n');
    const head = (nl === -1 ? p : p.slice(0, nl)).trim();
    const body = (nl === -1 ? '' : p.slice(nl + 1)).replace(/\s+$/, '');
    const n = Number((head.match(/^(\d+)\.png/) || [])[1]);
    if (!Number.isFinite(n)) continue;
    out.push({ n, head, body });
  }
  return out;
}

/** GEREKÇE paragrafını bloğun BAŞINA taşır — Mami önce nedeni okuyor. */
function gerekceyiBasaAl(body) {
  const i = body.search(/^GEREKÇE\b/m);
  if (i === -1) return body;
  const gerekce = body.slice(i).replace(/\s+$/, '');
  const kalan = body.slice(0, i).replace(/\s+$/, '');
  return `${gerekce}\n\n${kalan}`;
}

const hepsi = [];
for (const f of readdirSync(revizeDir).filter((f) => /^S\d+\.txt$/.test(f)).sort()) {
  for (const b of bloklar(readFileSync(join(revizeDir, f), 'utf8'))) {
    hepsi.push({ ...b, kaynak: f });
  }
}
if (!hepsi.length) { console.error('hiç blok bulunamadı — ajanlar henüz yazmamış olabilir'); process.exit(1); }

hepsi.sort((a, b) => a.n - b.n);

const tam = hepsi.filter((b) => /SAHNE BOZUK|TAM YENİ/i.test(b.head + b.body)).length;
const kucuk = hepsi.length - tam;

const satirlar = [
  `${proje.toUpperCase()} — REVİZE (tek dosya, kare sırasıyla)`,
  '='.repeat(73),
  `${hepsi.length} kare revize · ${tam} tam yeni prompt · ${kucuk} referans-edit`,
  `üretildi: node scripts/revize-birlestir.mjs`,
  '',
  'NASIL ÜRETİLİR:',
  '  · "Use this referenced image, change ONLY:" ile başlayan blok → mevcut kareyi REFERANS',
  '    olarak bağla, prompt olarak yalnız o cümleyi ver. Sahneyi baştan tarif ETME.',
  '  · "SAHNE BOZUK" yazan blok → sahne baştan üretilir, aşağıdaki tam prompt kullanılır.',
  '  · Her bloğun başındaki GEREKÇE neden revize olduğunu söyler — katılmıyorsan atla, söyle.',
  '='.repeat(73),
  '',
];

for (const b of hepsi) {
  satirlar.push('');
  satirlar.push(`### ${b.head}`);
  satirlar.push('');
  satirlar.push(gerekceyiBasaAl(b.body));
  satirlar.push('');
  satirlar.push('-'.repeat(73));
}

const hedef = join(dir, `${proje}_revize.txt`);
writeFileSync(hedef, satirlar.join('\n') + '\n', 'utf8');
console.log(`✅ ${hedef}`);
console.log(`   ${hepsi.length} kare · ${tam} tam prompt · ${kucuk} referans-edit`);
console.log(`   sıra: ${hepsi.map((b) => b.n).join(', ')}`);
