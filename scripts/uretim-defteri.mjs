#!/usr/bin/env node
// ÜRETİM DEFTERİ — kuzey yıldızı ve ÜÇ VURUŞ KURALI. Öğrenmenin ölçüldüğü yer.
//
// NEDEN VAR — iki ölçülmüş kusur:
//
// 1) Mami: *"karelerin neredeyse yarısını recreate ediyordum."* Ama bu sayı hiçbir yerde
//    tutulmuyordu. Ölçülmeyen bir oran düşemez; "sistem öğreniyor" iddiası o zaman hikâyedir.
//    Kuzey yıldızı: **İLK basımda tutan kare oranı.**
//
// 2) Ders bankası şişiyor ama beslemiyor: 7 onaylı derse karşı 115 bekleyen aday, ve 7'sinin
//    hepsi TEK projeden. Sebep, her tek seferlik kazanın aday olarak yazılması. ÜÇ VURUŞ bunu
//    kapatır — bir hata sınıfı **üç ayrı işte** tekrar etmeden aday olmaz.
//
//   node scripts/uretim-defteri.mjs karne [proje]      # oran + hata sınıfları
//   node scripts/uretim-defteri.mjs vurus              # üç vuruşu dolduran sınıflar
//   node scripts/uretim-defteri.mjs aday --yaz         # dolan sınıfları ders adayına çevir
//
// BU DOSYA DERS YAZMAZ, ADAY ÜRETİR. `APPROVED.md`'ye yalnız Mami taşır — otomatik promote yok,
// çöp ders sistemi zehirler.

import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const EMIR_DIZIN = path.join(REPO_ROOT, 'artifacts', 'is-emri');
export const ADAY_DIZIN = path.join(REPO_ROOT, 'agents', 'lessons');

/** Üç vuruş: bir hata sınıfı ancak ÜÇ AYRI İŞTE tekrar ederse desen sayılır. */
export const VURUS_ESIGI = 3;

export class DefterError extends Error {}
const fail = (mesaj) => { throw new DefterError(mesaj); };

export function emirleriOku({ dizin = EMIR_DIZIN } = {}) {
  if (!existsSync(dizin)) return [];
  return readdirSync(dizin)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      try { return JSON.parse(readFileSync(path.join(dizin, f), 'utf8')); } catch { return null; }
    })
    .filter(Boolean);
}

/** Tek bir işin karnesi. `ilkTutma` kuzey yıldızıdır: "sonunda tuttu" ödüllendirilmez. */
export function projeKarnesi(emir) {
  const asamaKarnesi = (asama) => {
    const denenmis = emir.shots.filter((s) => s[asama]?.length);
    const ilkTutan = denenmis.filter((s) => s[asama][0].sonuc === 'kabul');
    const toplamDeneme = denenmis.reduce((t, s) => t + s[asama].length, 0);
    return {
      denenmis: denenmis.length,
      ilkTutma: denenmis.length ? Number((ilkTutan.length / denenmis.length).toFixed(3)) : null,
      // Recreate = ilk denemenin ötesindeki her deneme. Kredi tam olarak burada yanıyor.
      recreate: toplamDeneme - denenmis.length,
      kredi: denenmis.reduce((t, s) => t + s[asama].reduce((a, d) => a + (d.kredi ?? 0), 0), 0),
    };
  };

  const kusurlar = new Map();
  for (const shot of emir.shots) {
    for (const asama of ['basim', 'klip']) {
      for (const deneme of shot[asama] ?? []) {
        if (deneme.sonuc === 'red' && deneme.kusur) {
          kusurlar.set(deneme.kusur, (kusurlar.get(deneme.kusur) ?? 0) + 1);
        }
      }
    }
  }

  return {
    proje: emir.proje,
    toplam: emir.shots.length,
    basim: asamaKarnesi('basim'),
    klip: asamaKarnesi('klip'),
    kusurlar: Object.fromEntries([...kusurlar].sort((a, b) => b[1] - a[1])),
  };
}

/**
 * ÜÇ VURUŞ — bir hata sınıfının kaç AYRI İŞTE göründüğü.
 * Aynı işte 20 kez çıkması bir vuruştur: tek videoya özgü bir kaza desen değildir.
 */
export function vuruslar(emirler) {
  const sayac = new Map();
  for (const emir of emirler) {
    const karne = projeKarnesi(emir);
    for (const [kusur, adet] of Object.entries(karne.kusurlar)) {
      const kayit = sayac.get(kusur) ?? { kusur, isler: [], toplam: 0 };
      kayit.isler.push({ proje: emir.proje, adet });
      kayit.toplam += adet;
      sayac.set(kusur, kayit);
    }
  }
  return [...sayac.values()]
    .map((k) => ({ ...k, vurus: k.isler.length, dolu: k.isler.length >= VURUS_ESIGI }))
    .sort((a, b) => b.vurus - a.vurus || b.toplam - a.toplam);
}

export function toplamKarne(emirler) {
  const karneler = emirler.map(projeKarnesi);
  const topla = (asama, alan) => karneler.reduce((t, k) => t + (k[asama][alan] ?? 0), 0);
  const denenmisBasim = topla('basim', 'denenmis');
  const ilkTutanBasim = karneler.reduce(
    (t, k) => t + (k.basim.ilkTutma === null ? 0 : Math.round(k.basim.ilkTutma * k.basim.denenmis)), 0);
  return {
    is: karneler.length,
    kare: karneler.reduce((t, k) => t + k.toplam, 0),
    ilkBasimTutma: denenmisBasim ? Number((ilkTutanBasim / denenmisBasim).toFixed(3)) : null,
    recreate: topla('basim', 'recreate') + topla('klip', 'recreate'),
    kredi: topla('basim', 'kredi') + topla('klip', 'kredi'),
    karneler,
  };
}

export function karneMetni(emirler) {
  if (!emirler.length) {
    return 'ÜRETİM DEFTERİ — hiç iş emri yok.\n   `node scripts/is-emri.mjs ac "<proje>" --kare N` ile başlar.\n   ⚠ Ölçülmeyen recreate oranı düşemez: öğrenme iddiası ancak bu sayı düşerse doğrudur.';
  }
  const t = toplamKarne(emirler);
  const satirlar = [
    'ÜRETİM DEFTERİ',
    '',
    `   ${t.is} iş · ${t.kare} kare · ${t.recreate} recreate · ${t.kredi} kredi`,
    t.ilkBasimTutma === null
      ? '   KUZEY YILDIZI: henüz ölçülmedi'
      : `   KUZEY YILDIZI — ilk basımda tutma: %${Math.round(t.ilkBasimTutma * 100)}`,
    '',
  ];
  for (const k of t.karneler) {
    const oran = k.basim.ilkTutma === null ? '  —' : `%${Math.round(k.basim.ilkTutma * 100)}`;
    satirlar.push(`   ${oran.padStart(4)}  ${k.proje} — ${k.toplam} kare, ${k.basim.recreate + k.klip.recreate} recreate`);
    const kusur = Object.entries(k.kusurlar);
    if (kusur.length) satirlar.push(`         kusur: ${kusur.map(([a, n]) => `${a}×${n}`).join(' · ')}`);
  }
  return satirlar.join('\n');
}

export function vurusMetni(emirler) {
  const v = vuruslar(emirler);
  if (!v.length) return 'ÜÇ VURUŞ — henüz kayıtlı kusur yok.';
  const satirlar = ['ÜÇ VURUŞ — bir sınıf ancak ÜÇ AYRI İŞTE tekrar ederse desendir', ''];
  for (const k of v) {
    satirlar.push(`   ${k.dolu ? '🔴' : '  '} ${k.kusur.padEnd(16)} ${k.vurus}/${VURUS_ESIGI} iş · toplam ${k.toplam} kez`);
    satirlar.push(`      ${k.isler.map((i) => `${i.proje} (${i.adet})`).join(' · ')}`);
  }
  const dolu = v.filter((k) => k.dolu);
  satirlar.push('', dolu.length
    ? `   ${dolu.length} sınıf eşiği doldurdu → \`node scripts/uretim-defteri.mjs aday --yaz\``
    : '   Hiçbir sınıf eşiği doldurmadı — kural YAZILMAZ. Tek seferlik kaza desen değildir.');
  return satirlar.join('\n');
}

export function adayMetni(emirler, { simdi } = {}) {
  const dolu = vuruslar(emirler).filter((k) => k.dolu);
  if (!dolu.length) fail('üç vuruşu dolduran sınıf yok — aday yazmıyorum (çöp ders sistemi zehirler)');
  const tarih = (simdi ?? new Date().toISOString()).slice(0, 10);
  const satirlar = [
    `# DERS ADAYLARI — üç vuruş (${tarih})`,
    '',
    '> Makine çıktısı. Her madde **üç ayrı işte** tekrar etmiş bir hata sınıfıdır — tek seferlik',
    '> kazalar bilerek dışarıda. `APPROVED.md`\'ye yalnız Mami taşır.',
    '',
  ];
  for (const k of dolu) {
    satirlar.push(
      `## ${k.kusur}`,
      '',
      `- **Vuruş:** ${k.vurus} ayrı iş · toplam ${k.toplam} red`,
      `- **Nerede:** ${k.isler.map((i) => `${i.proje} (${i.adet})`).join(' · ')}`,
      '- **Karar:** ⬜ onayla → yasaya · ⬜ reddet · ⬜ ölçüm yetersiz, beklet',
      '');
  }
  return satirlar.join('\n');
}

export function usage() {
  return [
    'ÜRETİM DEFTERİ — kuzey yıldızı (ilk basımda tutma) ve üç vuruş kuralı',
    '',
    '  node scripts/uretim-defteri.mjs karne [proje]',
    '  node scripts/uretim-defteri.mjs vurus',
    '  node scripts/uretim-defteri.mjs aday [--yaz]',
  ].join('\n');
}

export function main(argv, { dizin, simdi } = {}) {
  const [komut, ...args] = argv;
  if (!komut || komut === '--yardim') return usage();
  const hepsi = emirleriOku({ dizin });

  if (komut === 'karne') {
    const proje = args.find((a) => !a.startsWith('--'));
    const secili = proje ? hepsi.filter((e) => e.proje === proje) : hepsi;
    if (proje && !secili.length) fail(`iş emri yok: ${proje}`);
    return karneMetni(secili);
  }

  if (komut === 'vurus') return vurusMetni(hepsi);

  if (komut === 'aday') {
    const metin = adayMetni(hepsi, { simdi });
    if (!args.includes('--yaz')) return metin;
    const tarih = (simdi ?? new Date().toISOString()).slice(0, 10);
    const yol = path.join(ADAY_DIZIN, `CANDIDATES-uc-vurus-${tarih}.md`);
    mkdirSync(path.dirname(yol), { recursive: true });
    const gecici = `${yol}.tmp`;
    writeFileSync(gecici, `${metin}\n`, 'utf8');
    renameSync(gecici, yol);
    return `ders adayı yazıldı: ${path.relative(REPO_ROOT, yol)}`;
  }

  fail(`bilinmeyen komut: ${komut}\n\n${usage()}`);
  return undefined;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(main(process.argv.slice(2)));
  } catch (hata) {
    if (hata instanceof DefterError) { console.error(`❌ ${hata.message}`); process.exit(2); }
    throw hata;
  }
}
