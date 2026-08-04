#!/usr/bin/env node
/**
 * basim-kuyrugu.mjs — BASIM SIRASI. Mami'nin elleri Claude'u beklemesin diye.
 *
 * Neden var (2026-08-04 ölçümü): 233 kare YAZILI, 0'ı BASILI. Yazma bir gecede oldu,
 * basım hiç başlamadı. Darboğaz yazma değil BASIM — ve basımı yavaşlatan şey, hangi karenin
 * sırada olduğunu her seferinde sormak zorunda kalmak.
 *
 * Ne yapar: PROMPTLAR'daki kareleri okur, hangilerinin basıldığını `images/`ten görür,
 * BASILMAYANLARI sıraya dizer ve her biri için dosya + satır verir. Kuyruk her koşuda
 * yeniden türetilir — bayatlayamaz.
 *
 * Kullanım:
 *   node scripts/basim-kuyrugu.mjs                    # bütün açık projeler
 *   node scripts/basim-kuyrugu.mjs "Bileşke Kuvvet"   # tek proje, kare kare
 *   node scripts/basim-kuyrugu.mjs "<proje>" --grup 8 # 8'li batch hâlinde
 */

import fs from 'node:fs';
import path from 'node:path';

const INBOX = 'agents/COMMAND-INBOX';
const argv = process.argv.slice(2);
const hedef = argv.find((a) => !a.startsWith('--'));
const gi = argv.indexOf('--grup');
const GRUP = gi >= 0 ? Number(argv[gi + 1]) || 8 : 0;

const projeler = fs.readdirSync(INBOX, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== 'Biten' && d.name !== 'Bekleyen' && d.name !== 'DENEME')
  .map((d) => d.name)
  .filter((n) => !hedef || n === hedef);

if (!projeler.length) {
  console.error(`basim-kuyrugu: proje bulunamadı${hedef ? ` — "${hedef}"` : ''}`);
  process.exit(2);
}

const KARE_RE = /^(?:#{1,3}\s*)?#?\s*K(\d{1,3})\b/;

function taraProje(proje) {
  const kok = path.join(INBOX, proje);
  const pdir = path.join(kok, 'PROMPTLAR');
  if (!fs.existsSync(pdir)) return null;

  // yazılmış kareler: hangi dosyada, hangi satırda
  const yazili = new Map();
  for (const f of fs.readdirSync(pdir).filter((f) => /\.txt$/.test(f)).sort()) {
    const satirlar = fs.readFileSync(path.join(pdir, f), 'utf8').split('\n');
    satirlar.forEach((l, i) => {
      const m = l.trim().match(KARE_RE);
      // aralık satırı (K35–K38) kare değildir
      if (!m || /^(?:#{1,3}\s*)?#?\s*K\d{1,3}\s*[-–—]\s*K?\d/.test(l.trim())) return;
      const n = Number(m[1]);
      if (!yazili.has(n)) yazili.set(n, { dosya: f, satir: i + 1, baslik: l.trim().slice(0, 78) });
    });
  }

  // basılmış kareler
  // ⚠ KLASÖR ADI PROJEDEN PROJEYE DEĞİŞİYOR — `images/` ve `resimler/` ikisi de kullanılıyor
  //   (Farklı Kültürler `resimler/`). Tek ada güvenmek, bu repoda 11 kez ölçülen
  //   "doğrulayıcı yerleşimi varsayıyor" kusurunun aynısıdır: araç 53 basılı kareyi
  //   "hiç basılmamış" sayıp kuyruğa koyuyordu.
  const basili = new Set();
  for (const ad of ['images', 'resimler', 'Resimler', 'kareler']) {
    const idir = path.join(kok, ad);
    if (!fs.existsSync(idir)) continue;
    for (const f of fs.readdirSync(idir)) {
      const m = f.match(/^(\d{1,3})\.(png|jpg|jpeg)$/i);
      if (m) basili.add(Number(m[1]));
    }
  }

  const bekleyen = [...yazili.keys()].filter((n) => !basili.has(n)).sort((a, b) => a - b);
  return { proje, yazili, basili, bekleyen };
}

const sonuc = projeler.map(taraProje).filter(Boolean).filter((r) => r.yazili.size);
sonuc.sort((a, b) => b.bekleyen.length - a.bekleyen.length);

const toplamBekleyen = sonuc.reduce((t, r) => t + r.bekleyen.length, 0);

console.log('\n[basım kuyruğu] — kuyruk her koşuda yeniden türetilir, bayatlayamaz\n');
console.log(`BASILMAYI BEKLEYEN TOPLAM: ${toplamBekleyen} kare\n`);

for (const r of sonuc) {
  const durum = r.bekleyen.length === 0 ? '✓ tamam' : `${r.bekleyen.length} bekliyor`;
  console.log(`${'─'.repeat(72)}`);
  console.log(`${r.proje}`);
  console.log(`  yazılı ${r.yazili.size} · basılı ${r.basili.size} · ${durum}`);
  if (!r.bekleyen.length) { console.log(); continue; }

  if (!hedef) {
    // özet mod: yalnız aralık
    const ilk = r.bekleyen[0], son = r.bekleyen[r.bekleyen.length - 1];
    const dosyalar = [...new Set(r.bekleyen.map((n) => r.yazili.get(n).dosya))];
    console.log(`  sıradaki: K${String(ilk).padStart(2, '0')} … K${String(son).padStart(2, '0')}`);
    console.log(`  dosyalar: ${dosyalar.join(' · ')}`);
    console.log(`  → kare kare liste: node scripts/basim-kuyrugu.mjs "${r.proje}"\n`);
    continue;
  }

  // tek proje: kare kare, istenirse gruplu
  const gruplar = GRUP ? Array.from({ length: Math.ceil(r.bekleyen.length / GRUP) },
    (_, i) => r.bekleyen.slice(i * GRUP, (i + 1) * GRUP)) : [r.bekleyen];
  gruplar.forEach((g, gi2) => {
    if (GRUP) console.log(`\n  ── BATCH ${gi2 + 1}/${gruplar.length} · ${g.length} kare ──`);
    for (const n of g) {
      const y = r.yazili.get(n);
      console.log(`  [ ] K${String(n).padStart(2, '0')}  ${y.dosya}:${y.satir}`);
      console.log(`        ${y.baslik}`);
    }
  });
  console.log();
}

console.log('─'.repeat(72));
console.log('Basılan kare `images/<n>.png` olarak kaydedilir — kuyruk kendiliğinden kısalır.');
console.log('Basmadan önce: prompt-lint yeşil mi? Basıldıktan sonra: /mamilas-denetim\n');
