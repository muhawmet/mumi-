#!/usr/bin/env node
// L/J KESİM — "kurgu çok basic"in ölçülmüş cevabı.
//
// NEDEN VAR — Sol'un ölçümü (2026-08-05):
// **53 kesimin 47'si cümle sınırında, TEK L/J kesim yok.** Yani her sahne değişimi tam da
// cümlenin bittiği yerde oluyor. Kulak bunu iki kesimde öğreniyor ve gerisini önceden biliyor;
// "basic" hissinin sayısı budur. Sistem iyi KARE üreten bir shot fabrikası, iyi FİLM üreten
// bir stüdyo değil — fark tam olarak burada.
//
// MAMILAS'ta ses tek sürekli VO şeridi. Klasik L/J (B klibinin sesi önce gelir) bu yüzden
// doğrudan uygulanmaz; uygulanan şey TERSİ: **görüntü kesimini cümle sınırından kaydırmak.**
//   J (görüntü ÖNDE)  — yeni sahne, önceki cümle daha bitmeden açılır. Merak açar.
//   L (görüntü GERİDE) — önceki sahne, yeni cümlenin ilk kelimelerine sarkar. Duyguyu taşır.
//   SERT              — kesim sınırda kalır. Vuruş anları ve kısa klipler için AYRILIR.
//
// SERT KESİM KUSUR DEĞİLDİR. Kusur, kesimlerin HEPSİNİN sınırda olmasıdır.
//
//   node scripts/lj-kesim.mjs plan --sinir 3.2,7.8,11.4 --sure 5,5,5,5
//   node scripts/lj-kesim.mjs plan --dosya <plan.json>
//
// Bu script kesim UYGULAMAZ; kaydırma önerir ve dağılımı ölçer. Hüküm Mami'nin.

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export class LjError extends Error {}
const fail = (mesaj) => { throw new LjError(mesaj); };

/** Kaydırmanın üst sınırı. Bunun ötesi kesim değil, kayma — izleyici sahneyi kaçırıyor. */
export const MAX_KAYDIRMA = 0.6;
/** Bir klip bundan kısaysa kaydırma onu yer; sert kalır. Ölçüm: baş 0.5s zaten kırpılıyor. */
export const MIN_KLIP = 2.0;
/** Kaydırma, komşu kliplerin kısasının en fazla bu kadarını yiyebilir. */
export const PAY_ORANI = 0.25;
/** Hedef: kesimlerin en fazla bu kadarı sınırda kalsın. Ölçülen taban 47/53 = %89. */
export const SINIRDA_TAVAN = 0.6;

/**
 * Kesim planı. `vurus` işaretli kesim SERT kalır — kavramın anlaşıldığı an sözle
 * aynı karede olmalı; onu kaydırmak fikri bulanıklaştırır.
 */
export function planla(sinirlar, sureler, { vuruslar = [] } = {}) {
  if (!Array.isArray(sinirlar) || !sinirlar.length) fail('cümle sınırı listesi boş');
  if (!Array.isArray(sureler) || sureler.length < 2) fail('en az iki klip süresi gerekli');
  if (sinirlar.length !== sureler.length - 1) {
    fail(`sınır sayısı klip sayısının bir eksiği olmalı: ${sinirlar.length} sınır, ${sureler.length} klip`);
  }

  const kesimler = [];
  for (let i = 0; i < sinirlar.length; i += 1) {
    const oncekiSure = sureler[i];
    const sonrakiSure = sureler[i + 1];
    const kisa = Math.min(oncekiSure, sonrakiSure);
    const vurus = vuruslar.includes(i + 1);

    let tur = 'SERT';
    let kaydirma = 0;
    let sebep;

    if (vurus) {
      sebep = 'vuruş anı — kavram sözle aynı karede kalmalı';
    } else if (kisa < MIN_KLIP) {
      sebep = `komşu klip ${kisa.toFixed(1)}s — kaydırma klibi yer`;
    } else {
      // Desen: iki J, bir L, bir SERT. Üç aynı tür arka arkaya gelmez; SERT'in kendisi de
      // ritmin parçası — hepsi kaydırılırsa yeni bir tekdüzelik doğar.
      const desen = ['J', 'L', 'J', 'SERT'][i % 4];
      if (desen === 'SERT') {
        sebep = 'ritim nefesi — her kesim kaydırılırsa kaydırma da tekdüzeleşir';
      } else {
        tur = desen;
        const pay = Number((Math.min(MAX_KAYDIRMA, kisa * PAY_ORANI)).toFixed(2));
        kaydirma = tur === 'J' ? -pay : pay;
        sebep = tur === 'J'
          ? 'görüntü önde — yeni sahne cümle bitmeden açılıyor, merak'
          : 'görüntü geride — önceki sahne yeni cümleye sarkıyor, duygu';
      }
    }

    kesimler.push({
      kesim: i + 1,
      sinir: Number(sinirlar[i].toFixed(3)),
      yeni: Number((sinirlar[i] + kaydirma).toFixed(3)),
      tur,
      kaydirma,
      sebep,
    });
  }
  return kesimler;
}

export function dagilim(kesimler) {
  const say = (t) => kesimler.filter((k) => k.tur === t).length;
  const sert = say('SERT');
  const oran = kesimler.length ? Number((sert / kesimler.length).toFixed(3)) : null;
  return {
    toplam: kesimler.length,
    sert,
    j: say('J'),
    l: say('L'),
    sinirdaOran: oran,
    gecti: oran !== null && oran <= SINIRDA_TAVAN,
  };
}

export function rapor(kesimler) {
  const d = dagilim(kesimler);
  const satirlar = [
    'L/J KESİM PLANI',
    '',
    ...kesimler.map((k) => {
      const ok = k.tur === 'J' ? '◀' : k.tur === 'L' ? '▶' : '│';
      const kay = k.kaydirma ? `${k.kaydirma > 0 ? '+' : ''}${k.kaydirma.toFixed(2)}s` : '  —  ';
      return `   ${String(k.kesim).padStart(3)} ${ok} ${k.tur.padEnd(4)} ${String(k.sinir).padStart(7)}s → ${String(k.yeni).padStart(7)}s  ${kay.padStart(7)}   ${k.sebep}`;
    }),
    '',
    `   dağılım: ${d.j} J · ${d.l} L · ${d.sert} SERT`,
    `   sınırda kalan: %${Math.round(d.sinirdaOran * 100)} (tavan %${Math.round(SINIRDA_TAVAN * 100)}) → ${d.gecti ? 'GEÇTİ' : 'KALDI'}`,
    '',
    '   Ölçülen taban: 53 kesimin 47\'si sınırda (%89), tek L/J yok — "kurgu çok basic"in sayısı.',
    '   ⚠ SERT kesim kusur değildir; kusur kesimlerin HEPSİNİN sınırda olmasıdır.',
  ];
  return satirlar.join('\n');
}

export function usage() {
  return [
    'L/J KESİM — görüntü kesimini cümle sınırından kaydırır, dağılımı ölçer',
    '',
    '  node scripts/lj-kesim.mjs plan --sinir 3.2,7.8,11.4 --sure 5,5,5,5 [--vurus 2]',
    '  node scripts/lj-kesim.mjs plan --dosya <plan.json>   # {sinirlar,sureler,vuruslar}',
    '  ... [--json]',
  ].join('\n');
}

function bayrak(args, ad) {
  const i = args.indexOf(ad);
  return i === -1 ? undefined : args[i + 1];
}
const sayilar = (ham) => String(ham).split(',').map(Number).filter((n) => Number.isFinite(n));

export function main(argv) {
  const [komut, ...args] = argv;
  if (!komut || komut === '--yardim') return usage();
  if (komut !== 'plan') fail(`bilinmeyen komut: ${komut}\n\n${usage()}`);

  let sinirlar;
  let sureler;
  let vuruslar = [];
  const dosya = bayrak(args, '--dosya');
  if (dosya) {
    if (!existsSync(dosya)) fail(`dosya yok: ${dosya}`);
    const veri = JSON.parse(readFileSync(dosya, 'utf8'));
    ({ sinirlar, sureler } = veri);
    vuruslar = veri.vuruslar ?? [];
  } else {
    sinirlar = sayilar(bayrak(args, '--sinir') ?? fail('--sinir ya da --dosya gerekli'));
    sureler = sayilar(bayrak(args, '--sure') ?? fail('--sure gerekli'));
    const v = bayrak(args, '--vurus');
    if (v) vuruslar = sayilar(v);
  }

  const kesimler = planla(sinirlar, sureler, { vuruslar });
  return args.includes('--json')
    ? JSON.stringify({ kesimler, dagilim: dagilim(kesimler) }, null, 2)
    : rapor(kesimler);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(main(process.argv.slice(2)));
  } catch (hata) {
    if (hata instanceof LjError) { console.error(`❌ ${hata.message}`); process.exit(2); }
    throw hata;
  }
}
