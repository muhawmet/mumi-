#!/usr/bin/env node
// KARE ÇEK — üç kademeli gözün HAKEM ayağı.
//
// NEDEN VAR — ölçülmüş kusur (2026-08-05):
// AGY, Hücre filminde sekiz kesim için "2.07 · 2.25 · 1.96 · 2.10 …" saniyeleri verdi.
// İnandırıcıydı. `ffmpeg` ile kare hassasiyetinde ölçüldü: o bantta SIFIR kesim vardı.
// Sebep yapısal — AGY videoyu 1 FPS örneklüyor, 2.07 ile 2.25'i ayırt edecek çözünürlüğü
// fiziksel olarak YOK. O sayıları ölçmedi, UYDURDU.
//
// Bu yüzden zincir üç ayaklıdır ve üçüncüsü bugüne kadar eksikti:
//   AGY = İŞARETÇİ (nereye bak)  ·  ffmpeg = CETVEL (ne kadar)  ·  Claude'un Read'i = HAKEM (ne)
//
// Bu script hakemi mümkün kılar: AGY'nin işaret ettiği ARALIĞI kareye çevirir, kareler
// arasındaki gerçek farkı ölçer, ve varsa o aralığın konuşmasını yazıya döker.
//
//   node scripts/kare-cek.mjs <film.mp4> 53-58 [10]
//   node scripts/kare-cek.mjs <film.mp4> 53-58 --ses        # o aralığın transkripti de çıksın
//   node scripts/kare-cek.mjs <film.mp4> 53-58 --kuru       # ne yapacağını yazar, koşmaz
//
// DONMA ÖLÇÜMÜ — md5 ile DEĞİL. md5 yalnız BİREBİR aynı kareyi yakalar; sıkıştırma gürültüsü
// tek bir biti değiştirdiğinde donmuş kare "farklı" görünür. Burada komşu kareler arasındaki
// ORTALAMA MUTLAK FARK ölçülür (ffmpeg signalstats), donma eşiği oradan okunur.
//
// BU SCRIPT HÜKÜM VERMEZ. Kanıt üretir; kareyi açıp bakan ve karar veren ajandır.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export class KareCekError extends Error {}
const fail = (mesaj) => { throw new KareCekError(mesaj); };

/** Donma eşiği: komşu kareler arasındaki ortalama mutlak fark bunun altındaysa kare DURMUŞTUR. */
export const DONMA_ESIGI = 0.6;
export const VARSAYILAN_KARE = 8;

export function aracVar(bin) {
  try { execFileSync(bin, ['-version'], { stdio: 'ignore' }); return true; } catch { return false; }
}

/** `53-58` · `53-58.5` · `0:53-0:58` → { bas, son } saniye. Tek sayı verilirse 1 saniyelik pencere. */
export function araligiCoz(ham) {
  const saniye = (parca) => {
    const p = String(parca).trim().split(':').map(Number);
    if (p.some((x) => !Number.isFinite(x))) fail(`aralık okunamadı: "${ham}" — beklenen "53-58" ya da "1:03-1:08"`);
    return p.reduce((t, x) => t * 60 + x, 0);
  };
  const parcalar = String(ham).split('-').filter((x) => x !== '');
  if (!parcalar.length || parcalar.length > 2) fail(`aralık okunamadı: "${ham}"`);
  const bas = saniye(parcalar[0]);
  const son = parcalar.length === 2 ? saniye(parcalar[1]) : bas + 1;
  if (son <= bas) fail(`aralık ters ya da sıfır: "${ham}"`);
  return { bas, son };
}

/** Aralığa n kareyi EŞİT dağıtır. Uçlar dahildir — kusur çoğu zaman sınırda başlıyor. */
export function zamanNoktalari(bas, son, adet) {
  if (!Number.isInteger(adet) || adet < 2) fail('kare adedi en az 2 olmalı (fark ölçülemez)');
  const adim = (son - bas) / (adet - 1);
  return Array.from({ length: adet }, (_, i) => Number((bas + i * adim).toFixed(3)));
}

/**
 * ffmpeg `signalstats` çıktısından ortalama YAVG değerini okur.
 * Komşu iki karenin farkı için `blend=difference` ile birleştirilmiş akış kullanılır.
 */
export function yavgOku(ciktı) {
  const eslesme = [...String(ciktı).matchAll(/lavfi\.signalstats\.YAVG=([0-9.]+)/g)];
  if (!eslesme.length) return null;
  return Number(eslesme[eslesme.length - 1][1]);
}

export function komsuFark(oncekiPng, sonrakiPng) {
  const ham = execFileSync('ffmpeg', [
    '-v', 'error', '-i', oncekiPng, '-i', sonrakiPng,
    '-filter_complex', '[0:v][1:v]blend=all_mode=difference,signalstats,metadata=print',
    '-f', 'null', '-',
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  return yavgOku(ham);
}

export function komut(film, { bas, son }, adet, { ses } = {}) {
  const satirlar = zamanNoktalari(bas, son, adet).map((t, i) =>
    `ffmpeg -y -ss ${t} -i ${JSON.stringify(film)} -frames:v 1 <çıktı>/${String(i + 1).padStart(2, '0')}_${t}s.png`);
  if (ses) {
    satirlar.push(`ffmpeg -y -ss ${bas} -to ${son} -i ${JSON.stringify(film)} -ac 1 -ar 16000 <çıktı>/ses.wav`);
    satirlar.push('whisper-cli -m ~/.cache/whisper/ggml-medium.bin -f <çıktı>/ses.wav -l tr -otxt');
  }
  return satirlar.join('\n');
}

function transkript(film, bas, son, cikti) {
  const model = path.join(process.env.HOME || '', '.cache/whisper/ggml-medium.bin');
  if (!aracVar('whisper-cli') || !existsSync(model)) {
    return '   ⚠ whisper-cli ya da model yok — transkript atlandı (kareler yine çekildi)';
  }
  const wav = path.join(cikti, 'ses.wav');
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-ss', String(bas), '-to', String(son),
    '-i', film, '-ac', '1', '-ar', '16000', wav]);
  execFileSync('whisper-cli', ['-m', model, '-f', wav, '-l', 'tr', '-otxt', '-of', path.join(cikti, 'ses')],
    { stdio: 'ignore' });
  return `   🎙 transkript → ${path.join(cikti, 'ses.txt')}`;
}

export function cek(film, aralikHam, adet, { ses = false, kuru = false } = {}) {
  const aralik = araligiCoz(aralikHam);
  if (kuru) return komut(film, aralik, adet, { ses });
  if (!existsSync(film)) fail(`film yok: ${film}`);
  if (!aracVar('ffmpeg')) {
    fail('ffmpeg yok — HAKEM ayağı koşamaz.\nSessizce geçmek "doğrulandı" yanılsaması üretir.\n  brew install ffmpeg   ·   winget install Gyan.FFmpeg');
  }

  const cikti = path.join(path.dirname(film),
    `${path.basename(film, path.extname(film))}_hakem_${aralik.bas}-${aralik.son}`);
  mkdirSync(cikti, { recursive: true });

  const kareler = zamanNoktalari(aralik.bas, aralik.son, adet).map((t, i) => {
    const png = path.join(cikti, `${String(i + 1).padStart(2, '0')}_${t}s.png`);
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-ss', String(t), '-i', film, '-frames:v', '1', png]);
    return { t, png, bayt: statSync(png).size };
  });

  for (let i = 1; i < kareler.length; i += 1) {
    kareler[i].fark = komsuFark(kareler[i - 1].png, kareler[i].png);
    kareler[i].donuk = kareler[i].fark !== null && kareler[i].fark < DONMA_ESIGI;
  }

  const satirlar = [
    `━━ ${path.basename(film)} · ${aralik.bas}–${aralik.son}s · ${kareler.length} kare → ${cikti}`,
    ...kareler.map((k) => {
      const fark = k.fark === null ? '  —  ' : k.fark.toFixed(2).padStart(5);
      const isaret = k.donuk ? ' 🧊 ÖNCEKİYLE NEREDEYSE AYNI' : '';
      return `   ${path.basename(k.png).padEnd(18)} fark ${fark}${isaret}`;
    }),
  ];
  if (ses) satirlar.push(transkript(film, aralik.bas, aralik.son, cikti));

  const donuk = kareler.filter((k) => k.donuk).length;
  satirlar.push('',
    donuk
      ? `   CETVEL: ${donuk}/${kareler.length - 1} komşu çift eşiğin altında (donma şüphesi gerçek).`
      : `   CETVEL: donma YOK — bu aralıkta ${kareler.length - 1} komşu çiftin hepsi eşiğin üstünde.`,
    '',
    '   HAKEM (ajan) — kareleri Read ile AÇ. Cetvel donmayı ölçer, kusuru GÖZ görür:',
    '   warp · eriyen yazı · kimlik kayması · yeni öğe · kadraj sıçraması.',
    '   ⚠ AGY\'nin verdiği ondalık saniye burada doğrulanana kadar KANIT DEĞİLDİR.');
  return satirlar.join('\n');
}

export function usage() {
  return [
    'KARE ÇEK — AGY\'nin işaret ettiği aralığı kanıta çevirir (üç kademeli gözün HAKEM ayağı)',
    '',
    '  node scripts/kare-cek.mjs <film.mp4> <aralık> [adet] [--ses] [--kuru]',
    '',
    '  <aralık>  53-58 · 1:03-1:08 · 55 (tek sayı → 1 saniyelik pencere)',
    `  [adet]    varsayılan ${VARSAYILAN_KARE}, en az 2`,
    '  --ses     o aralığın whisper transkriptini de çıkarır',
    '  --kuru    koşmaz, kuracağı komutları basar',
  ].join('\n');
}

export function main(argv) {
  const bayraklar = argv.filter((a) => a.startsWith('--'));
  const konum = argv.filter((a) => !a.startsWith('--'));
  if (!konum.length || bayraklar.includes('--yardim')) return usage();
  const [film, aralik, adetHam] = konum;
  if (!aralik) fail(`aralık gerekli.\n\n${usage()}`);
  const adet = adetHam ? Number(adetHam) : VARSAYILAN_KARE;
  return cek(film, aralik, adet, { ses: bayraklar.includes('--ses'), kuru: bayraklar.includes('--kuru') });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(main(process.argv.slice(2)));
  } catch (hata) {
    if (hata instanceof KareCekError) { console.error(`❌ ${hata.message}`); process.exit(2); }
    throw hata;
  }
}
