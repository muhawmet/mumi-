#!/usr/bin/env node
// ROTA — motor değil, MOTOR+CÜZDAN çifti seçilir.
//
// NEDEN VAR — ölçülmüş kusur:
// Aynı motor, iki cüzdan, ZIT gerçek. `kling3_0` Magnific'te 450 kredi ve 3 referans alıyor;
// Higgsfield'da 10 kredi ve `medias` üzerinden referans ALMIYOR (referans orada Element olarak,
// prompt'un içine `<<<id>>>` gömülerek geliyor). "Kling 3.0 referans alır/almaz" cümlesi
// cüzdan söylenmeden YANLIŞTIR. Bu dosya o çifti tek yerde tutar.
//
// MAMİ'NİN KURALI (2026-08-07): **önce Magnific kredisi bitirilir.** Higgsfield gerçek parada
// daha pahalı; ekstra araç olarak durur (Element referansı, 4k, Magnific'in yapamadığı iş).
// Varsayılan hat: **NB2 kare + Kling 3.0 klip.** Kling 2.6 ve Seedance kapsam dışı.
//
//   node scripts/rota.mjs sec --is kare|klip [--kimlik] [--dortk]
//   node scripts/rota.mjs fiyat [--kare 60] [--klip 60]
//   node scripts/rota.mjs durum                       # kalan FİLM sayısı (kredi değil)
//   node scripts/rota.mjs raf-yaz --dosya <element.json>
//
// ⚠ BU SCRIPT MCP ÇAĞIRAMAZ. Bakiye ve element listesi Claude tarafından MCP'den okunup
// `artifacts/cuzdan.json` ve `artifacts/element-rafi.json`'a yazılır; rota onları OKUR.
// Uydurulmuş bakiye basmaktansa "ölçülmedi" demeyi seçer.

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CUZDAN_YOLU = path.join(REPO_ROOT, 'artifacts', 'cuzdan.json');
export const RAF_YOLU = path.join(REPO_ROOT, 'artifacts', 'element-rafi.json');

export class RotaError extends Error {}
const fail = (mesaj) => { throw new RotaError(mesaj); };

/** Bir "film" = 60 kare + 60 klip. Kredi kıyaslanamaz (Higgsfield ~6k, Magnific 600k); film kıyaslanır. */
export const FILM_KARE = 60;
export const FILM_KLIP = 60;

// Mami'nin kuralı (2026-08-07): **element 1:1, sahne 16:9.** Element bir kez üretilir ve
// projelerden birike birike raf büyür — baştan hepsini kurmaya gerek yok, ihtiyaç çıkınca basılır.
//
// 🔴 SÜREKLİLİK BİR İSİM LİSTESİ DEĞİL, BİR EŞİKTİR. Mami: *"her şeyde de 2-3'ten fazla
// görünüyorsa videoda devamlılık olur, üretiriz başta. Mesela kediyse `@kedi` diye üretiriz;
// sonra bir videoda kedi kullanırsak onu kullanırsın."* Yani kural cast'e özel değil: karakter,
// hayvan, nesne, mekân — hangisi olursa olsun **eşiği geçen element olur.**
// Raf CÜZDAN ÜSTÜ: aynı `@ad` hem Magnific hem Higgsfield tarafında yaşayabilir.
export const ELEMENT_ORAN = '1:1';
export const SAHNE_ORAN = '16:9';
export const ELEMENT_ESIGI = 3;

/**
 * Ölçülmüş fiyat tablosu. Hepsi `simulate_cost` / `generate cost` ile EXACT alındı.
 * Tarih damgası bilerek duruyor: fiyat değişirse bu tablo yalan söyler, ölçüm yenilenir.
 */
export const FIYAT = Object.freeze({
  olculdu: '2026-08-06',
  magnific: {
    ad: 'Magnific',
    rol: 'ana hat',
    kare: { nb2: 60, nbPro2k: 75 },
    klip: { kling3_0: 450, kling2_6: 225, kling2_5: 325, kling3_0_turbo: 1300 },
    referans: { kare: true, klip: true, klipAdet: 3, not: 'character/product/image — startFrame ile birlikte zorunlu' },
  },
  higgsfield: {
    ad: 'Higgsfield',
    rol: 'ekstra araç',
    kare: { nb2: 2, nbPro2k: 2, nbPro4k: 4 },
    klip: { kling3_0: 10, kling3_0_pro: 12.5, kling3_0_4k: 30, seedance_2_0: 22.5 },
    referans: { kare: true, klip: true, klipAdet: null, not: 'Element olarak — prompt içine <<<element_id>>> gömülür' },
  },
});

/** Varsayılan hat — Mami'nin kararı. Değiştirmek bir ölçüm gerektirir, tercih değil. */
export const VARSAYILAN = Object.freeze({ kare: 'nb2', klip: 'kling3_0', cuzdan: 'magnific' });

function atomikYaz(yol, veri) {
  mkdirSync(path.dirname(yol), { recursive: true });
  const gecici = `${yol}.tmp`;
  writeFileSync(gecici, `${JSON.stringify(veri, null, 2)}\n`, 'utf8');
  renameSync(gecici, yol);
  return yol;
}

export function oku(yol) {
  if (!existsSync(yol)) return null;
  try { return JSON.parse(readFileSync(yol, 'utf8')); } catch { return null; }
}

/** Bir cüzdanın kalan bakiyesi kaç FİLM eder. Tek eyleme dönüşebilen sayı budur. */
export function filmKapasitesi(cuzdanAdi, bakiye) {
  const f = FIYAT[cuzdanAdi];
  if (!f) fail(`bilinmeyen cüzdan: ${cuzdanAdi}`);
  if (!Number.isFinite(bakiye)) return null;
  const filmMaliyeti = FILM_KARE * f.kare[VARSAYILAN.kare] + FILM_KLIP * f.klip[VARSAYILAN.klip];
  return { filmMaliyeti, film: Number((bakiye / filmMaliyeti).toFixed(1)) };
}

/**
 * Rota kararı. Ölçüm yoksa TAHMİN ETMEZ — hangi bilginin eksik olduğunu söyler.
 * `kimlik` = bu shot tekrar eden bir cast/nesne taşıyor mu (element/referans şart mı).
 */
export function sec({ is, kimlik = false, dortK = false, cuzdan } = {}) {
  if (!['kare', 'klip'].includes(is)) fail('--is kare ya da klip olmalı');

  // 4k yalnız Higgsfield'da var (Magnific 16:9'da 1376×768 veriyor — ölçüldü).
  const zorunluHiggsfield = dortK;
  const secilen = cuzdan ?? (zorunluHiggsfield ? 'higgsfield' : VARSAYILAN.cuzdan);
  const f = FIYAT[secilen];
  if (!f) fail(`bilinmeyen cüzdan: ${secilen}`);

  const motor = is === 'kare'
    ? (dortK ? 'nbPro4k' : VARSAYILAN.kare)
    : (dortK ? 'kling3_0_4k' : VARSAYILAN.klip);
  const fiyat = f[is][motor];
  if (fiyat === undefined) fail(`${f.ad} bu işi bu motorla yapmıyor: ${is}/${motor}`);

  const notlar = [];
  if (secilen === 'higgsfield' && !dortK) {
    notlar.push('Higgsfield seçildi — Mami\'nin kuralı önce Magnific\'i bitirmek. Gerekçe ölçülmüş olmalı.');
  }
  if (kimlik) {
    notlar.push(secilen === 'magnific'
      ? `referans: ${FIYAT.magnific.referans.not}`
      : `referans: ${FIYAT.higgsfield.referans.not}`);
  }
  if (zorunluHiggsfield) notlar.push('4k yalnız Higgsfield\'da — Magnific 16:9\'da 1376×768 veriyor (ölçüldü).');

  return { cuzdan: secilen, motor, fiyat, kimlik, notlar, olculdu: FIYAT.olculdu };
}

export function fiyatTablosu({ kare = FILM_KARE, klip = FILM_KLIP } = {}) {
  const satirlar = [
    `FİYAT — ölçüldü ${FIYAT.olculdu} (exact, kredi yakmadan)`,
    '',
    `bir film varsayımı: ${kare} kare + ${klip} klip · varsayılan hat ${VARSAYILAN.kare} + ${VARSAYILAN.klip}`,
    '',
  ];
  for (const ad of ['magnific', 'higgsfield']) {
    const f = FIYAT[ad];
    const toplam = kare * f.kare[VARSAYILAN.kare] + klip * f.klip[VARSAYILAN.klip];
    satirlar.push(
      `${f.ad} (${f.rol})`,
      `   kare ${VARSAYILAN.kare}: ${f.kare[VARSAYILAN.kare]} · klip ${VARSAYILAN.klip}: ${f.klip[VARSAYILAN.klip]}`,
      `   bir film ≈ ${toplam} kredi`,
      `   referans: ${f.referans.not}`,
      '');
  }
  satirlar.push('⚠ Krediler KIYASLANAMAZ (Higgsfield ~6k ölçek, Magnific 600k). Kıyaslanan birim FİLM.');
  return satirlar.join('\n');
}

export function durumMetni() {
  const cuzdan = oku(CUZDAN_YOLU);
  const raf = oku(RAF_YOLU);
  const satirlar = ['CÜZDAN VE RAF', ''];

  if (!cuzdan) {
    satirlar.push('   bakiye ÖLÇÜLMEDİ — Claude MCP\'den okuyup `artifacts/cuzdan.json`\'a yazar.',
      '   (uydurulmuş bakiye basmıyorum.)');
  } else {
    for (const ad of ['magnific', 'higgsfield']) {
      const bakiye = cuzdan[ad]?.kalan;
      const k = filmKapasitesi(ad, bakiye);
      satirlar.push(k
        ? `   ${FIYAT[ad].ad.padEnd(11)} ${String(bakiye).padStart(7)} kredi → ~${k.film} film`
        : `   ${FIYAT[ad].ad.padEnd(11)} ölçülmedi`);
    }
    if (cuzdan.olculdu) satirlar.push(`   (bakiye damgası: ${cuzdan.olculdu})`);
  }

  satirlar.push('');
  if (raf?.elementler?.length) {
    const cuzdanlar = [...new Set(raf.elementler.map((e) => e.cuzdan))];
    satirlar.push(`   element rafı: ${raf.elementler.length} kayıt → ${raf.elementler.map((e) => e.ad).join(', ')}`);
    satirlar.push(`   cüzdanlar: ${cuzdanlar.join(', ')}`);
  } else {
    satirlar.push('   element rafı BOŞ ya da indekslenmemiş — süreklilik referanssız kurulmuyor.');
  }
  satirlar.push(
    `   (element ${ELEMENT_ORAN} üretilir, sahne ${SAHNE_ORAN}; raf projelerden birike birike büyür)`,
    `   KURAL: bir öğe videoda ${ELEMENT_ESIGI}+ kez görünüyorsa element olur — karakter, hayvan, nesne, mekân fark etmez.`);
  return satirlar.join('\n');
}

/** Element rafını yazar. Kaynak MCP'dir; bu fonksiyon yalnız normalize edip diske alır. */
export function rafYaz(ham, { yol = RAF_YOLU, simdi } = {}) {
  const girdiler = Array.isArray(ham) ? ham : (ham?.items ?? ham?.elementler ?? []);
  if (!Array.isArray(girdiler) || !girdiler.length) fail('element listesi boş — sessiz boş raf yazmıyorum');
  const elementler = girdiler.map((e) => ({
    ad: e.ad ?? e.name,
    id: e.id ?? e.identifier ?? null,
    tur: e.tur ?? e.category ?? null,
    cuzdan: e.cuzdan ?? 'higgsfield',
    gorsel: e.gorsel ?? e.medias?.[0]?.url ?? null,
  }));
  const eksik = elementler.filter((e) => !e.ad || !e.id);
  if (eksik.length) fail(`${eksik.length} elementin adı ya da id'si yok — yarım raf yazmıyorum`);
  return atomikYaz(yol, { guncellendi: simdi ?? new Date().toISOString(), elementler });
}

export function usage() {
  return [
    'ROTA — motor+cüzdan çifti seçer, fiyatı ve kalan FİLM sayısını basar',
    '',
    '  node scripts/rota.mjs sec --is kare|klip [--kimlik] [--dortk] [--cuzdan magnific|higgsfield]',
    '  node scripts/rota.mjs fiyat [--kare 60] [--klip 60]',
    '  node scripts/rota.mjs durum',
    '  node scripts/rota.mjs raf-yaz --dosya <element.json>',
    '',
    'Ana hat MAGNIFIC (önce o kredi biter) · Higgsfield ekstra araç · varsayılan NB2 + Kling 3.0.',
  ].join('\n');
}

function bayrak(args, ad) {
  const i = args.indexOf(ad);
  return i === -1 ? undefined : args[i + 1];
}

export function main(argv) {
  const [komut, ...args] = argv;
  if (!komut || komut === '--yardim') return usage();

  if (komut === 'sec') {
    const karar = sec({
      is: bayrak(args, '--is'),
      kimlik: args.includes('--kimlik'),
      dortK: args.includes('--dortk'),
      cuzdan: bayrak(args, '--cuzdan'),
    });
    return [
      `${karar.cuzdan} · ${karar.motor} · ${karar.fiyat} kredi (ölçüm ${karar.olculdu})`,
      ...karar.notlar.map((n) => `   ${n}`),
    ].join('\n');
  }

  if (komut === 'fiyat') {
    return fiyatTablosu({
      kare: Number(bayrak(args, '--kare') ?? FILM_KARE),
      klip: Number(bayrak(args, '--klip') ?? FILM_KLIP),
    });
  }

  if (komut === 'durum') return durumMetni();

  if (komut === 'raf-yaz') {
    const dosya = bayrak(args, '--dosya') ?? fail('--dosya gerekli');
    if (!existsSync(dosya)) fail(`dosya yok: ${dosya}`);
    const yol = rafYaz(JSON.parse(readFileSync(dosya, 'utf8')));
    const raf = oku(yol);
    return `element rafı yazıldı: ${path.relative(REPO_ROOT, yol)} · ${raf.elementler.length} kayıt`;
  }

  fail(`bilinmeyen komut: ${komut}\n\n${usage()}`);
  return undefined;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(main(process.argv.slice(2)));
  } catch (hata) {
    if (hata instanceof RotaError) { console.error(`❌ ${hata.message}`); process.exit(2); }
    throw hata;
  }
}
