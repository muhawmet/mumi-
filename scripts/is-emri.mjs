#!/usr/bin/env node
// İŞ EMRİ — otonom stüdyonun omurgası. Shot seviyesinde, diskte, oturumdan bağımsız.
//
// NEDEN VAR — ölçülmüş kusur:
// `artifacts/current-work.json` PROJE seviyesinde durum tutuyor ("faz: denetim"). Ama üretim
// shot seviyesinde ilerliyor: 12. kare basıldı, 13. reddedildi, 14. klip aldı. O ayrıntı bugün
// yalnız SOHBETTE yaşıyor — ve sohbet bir `/clear` ömrü sürüyor. Usage bitince, Termius
// kapanınca, bağlam özetlenince "nerede kalmıştık" cevapsız kalıyor.
//
// Otonomluk uzun bir sohbet değildir; DİSKE YAZILMIŞ BİR İŞ EMRİDİR. Bu dosya onu yazar.
//
//   node scripts/is-emri.mjs ac "<proje>" --kare 44 [--sekans S1:1-8,S2:9-20]
//   node scripts/is-emri.mjs durum ["<proje>"] [--json]
//   node scripts/is-emri.mjs devral ["<proje>"]        # koşu nerede durdu — tek ekran
//   node scripts/is-emri.mjs kaydet "<proje>" --kare 12 --asama basim \
//        --motor nano_banana_flash --cuzdan higgsfield --kredi 2 --sonuc kabul [--kusur yazi]
//
// TASARIM YASASI — bu dosya HÜKÜM VERMEZ. Ne basar, ne siler, ne motor seçer. Yalnız olanı
// kaydeder ve sıradakini gösterir. Hüküm Mami'nin, seçim `rota.mjs`'in.

import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const EMIR_DIZIN = path.join(REPO_ROOT, 'artifacts', 'is-emri');

/** Bir shot'ın geçebileceği aşamalar — sıra anlamlıdır, geri gidilmez. */
export const ASAMALAR = Object.freeze(['yazildi', 'basildi', 'onaylandi', 'klip', 'denetlendi', 'kesildi']);
/** Bir denemenin sonucu. `red` bir sonraki denemeyi doğurur, `kabul` aşamayı ilerletir. */
export const SONUCLAR = Object.freeze(['kabul', 'red', 'bekliyor']);
/** Deneme kaydı tutan aşamalar — recreate oranı bunlardan türer. */
export const DENEMELI_ASAMALAR = Object.freeze(['basim', 'klip']);

export class IsEmriError extends Error {}
const fail = (mesaj) => { throw new IsEmriError(mesaj); };

/** Proje adını dosya adına çevirir. Türkçe harfler korunur; yalnız yol ayıracı ve nokta düşer. */
export function emirDosyaAdi(proje) {
  const temiz = String(proje).trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/\.+$/, '');
  if (!temiz) fail('proje adı boş olamaz');
  return `${temiz}.json`;
}

export function emirYolu(proje) {
  return path.join(EMIR_DIZIN, emirDosyaAdi(proje));
}

/**
 * `S1:1-8,S2:9-20` → kare numarasından sekans adına eşleme.
 * Sekans verilmezse her kare `S0`'a düşer — omurga yine kurulur, sekans sonra yazılır.
 */
export function sekansHaritasi(spec, kareSayisi) {
  const harita = new Map();
  if (spec) {
    for (const parca of String(spec).split(',')) {
      const [ad, aralik] = parca.split(':');
      if (!ad || !aralik) fail(`sekans biçimi bozuk: "${parca}" — beklenen "S1:1-8"`);
      const [bas, son] = aralik.split('-').map(Number);
      if (!Number.isInteger(bas) || !Number.isInteger(son) || bas < 1 || son < bas) {
        fail(`sekans aralığı bozuk: "${parca}"`);
      }
      for (let n = bas; n <= son; n += 1) harita.set(n, ad.trim());
    }
  }
  for (let n = 1; n <= kareSayisi; n += 1) if (!harita.has(n)) harita.set(n, 'S0');
  return harita;
}

export function yeniEmir(proje, kareSayisi, { sekans, simdi } = {}) {
  if (!Number.isInteger(kareSayisi) || kareSayisi < 1) fail('--kare pozitif tam sayı olmalı');
  const harita = sekansHaritasi(sekans, kareSayisi);
  const damga = simdi ?? new Date().toISOString();
  return {
    surum: 1,
    proje: String(proje),
    olusturuldu: damga,
    guncellendi: damga,
    shots: Array.from({ length: kareSayisi }, (_, i) => ({
      n: i + 1,
      sekans: harita.get(i + 1),
      asama: 'yazildi',
      elementler: [],
      basim: [],
      klip: [],
      not: '',
    })),
  };
}

/** Atomik yazım: yarım kalan bir yazım iş emrini bozamaz (kapanan Termius bunu ısırdı). */
export function emirYaz(emir, { yol } = {}) {
  const hedef = yol ?? emirYolu(emir.proje);
  mkdirSync(path.dirname(hedef), { recursive: true });
  const gecici = `${hedef}.tmp`;
  writeFileSync(gecici, `${JSON.stringify(emir, null, 2)}\n`, 'utf8');
  renameSync(gecici, hedef);
  return hedef;
}

export function emirOku(proje, { yol } = {}) {
  const hedef = yol ?? emirYolu(proje);
  if (!existsSync(hedef)) fail(`iş emri yok: ${path.relative(REPO_ROOT, hedef)} — önce \`ac\` koş`);
  return JSON.parse(readFileSync(hedef, 'utf8'));
}

export function emirListesi() {
  if (!existsSync(EMIR_DIZIN)) return [];
  return readdirSync(EMIR_DIZIN).filter((f) => f.endsWith('.json')).sort();
}

/**
 * Bir denemeyi kaydeder. Aşama İLERLEMEZ eğer sonuç `kabul` değilse — red bir sonraki
 * denemeyi doğurur, ve o deneme sayısı recreate oranının ta kendisidir.
 */
export function denemeKaydet(emir, { kare, asama, motor, cuzdan, kredi, sonuc, kusur, simdi }) {
  if (!DENEMELI_ASAMALAR.includes(asama)) {
    fail(`--asama ${DENEMELI_ASAMALAR.join(' ya da ')} olmalı, "${asama}" değil`);
  }
  if (!SONUCLAR.includes(sonuc)) fail(`--sonuc ${SONUCLAR.join('|')} olmalı, "${sonuc}" değil`);
  const shot = emir.shots.find((s) => s.n === kare);
  if (!shot) fail(`bu iş emrinde ${kare} numaralı kare yok (toplam ${emir.shots.length})`);

  const kayit = {
    deneme: shot[asama].length + 1,
    motor: motor ?? null,
    cuzdan: cuzdan ?? null,
    kredi: Number.isFinite(kredi) ? kredi : null,
    sonuc,
    kusur: kusur ?? null,
    zaman: simdi ?? new Date().toISOString(),
  };
  shot[asama].push(kayit);

  if (sonuc === 'kabul') {
    shot.asama = asama === 'basim' ? 'onaylandi' : 'klip';
  } else if (shot.asama === 'yazildi' && asama === 'basim') {
    shot.asama = 'basildi';
  }
  emir.guncellendi = kayit.zaman;
  return kayit;
}

/** Sıradaki tek eylem. Otonom koşu bunu okur, Mami de bunu okur — aynı cümle. */
export function siradakiEylem(emir) {
  const yazilmis = emir.shots.filter((s) => !s.basim.length);
  if (yazilmis.length) return { eylem: 'bas', kareler: yazilmis.map((s) => s.n) };
  const onaysiz = emir.shots.filter((s) => s.basim.length && s.asama === 'basildi');
  if (onaysiz.length) return { eylem: 'onay-bekliyor', kareler: onaysiz.map((s) => s.n) };
  const klipsiz = emir.shots.filter((s) => s.asama === 'onaylandi');
  if (klipsiz.length) return { eylem: 'klip-bas', kareler: klipsiz.map((s) => s.n) };
  const denetimsiz = emir.shots.filter((s) => s.asama === 'klip');
  if (denetimsiz.length) return { eylem: 'denetle', kareler: denetimsiz.map((s) => s.n) };
  return { eylem: 'kurgu', kareler: [] };
}

export function karne(emir) {
  const say = (asama) => emir.shots.filter((s) => s.asama === asama).length;
  const denemeler = (asama) => emir.shots.flatMap((s) => s[asama]);
  const ilkTutan = (asama) => emir.shots.filter((s) => s[asama][0]?.sonuc === 'kabul').length;
  const basilan = emir.shots.filter((s) => s.basim.length).length;
  const klipli = emir.shots.filter((s) => s.klip.length).length;
  const kredi = [...denemeler('basim'), ...denemeler('klip')]
    .reduce((t, d) => t + (d.kredi ?? 0), 0);
  return {
    toplam: emir.shots.length,
    asamalar: Object.fromEntries(ASAMALAR.map((a) => [a, say(a)])),
    basilan,
    klipli,
    // Kuzey yıldızı: İLK basımda tutan kare oranı. Ölçülmediği sürece öğrenme iddiası hikâyedir.
    ilkBasimTutmaOrani: basilan ? Number((ilkTutan('basim') / basilan).toFixed(3)) : null,
    ilkKlipTutmaOrani: klipli ? Number((ilkTutan('klip') / klipli).toFixed(3)) : null,
    harcananKredi: kredi,
  };
}

export function usage() {
  return [
    'İŞ EMRİ — shot seviyesinde, diske yazılı, oturumdan bağımsız üretim kaydı',
    '',
    '  node scripts/is-emri.mjs ac "<proje>" --kare 44 [--sekans S1:1-8,S2:9-20]',
    '  node scripts/is-emri.mjs durum ["<proje>"] [--json]',
    '  node scripts/is-emri.mjs devral ["<proje>"]',
    '  node scripts/is-emri.mjs kaydet "<proje>" --kare 12 --asama basim|klip \\',
    '       --motor <ad> --cuzdan <ad> --kredi <n> --sonuc kabul|red [--kusur <sınıf>]',
  ].join('\n');
}

function bayrak(args, ad) {
  const i = args.indexOf(ad);
  return i === -1 ? undefined : args[i + 1];
}

function tekProje(args) {
  const acik = args.find((a) => !a.startsWith('--'));
  if (acik) return acik;
  const liste = emirListesi();
  if (liste.length === 1) return path.basename(liste[0], '.json');
  if (!liste.length) fail('hiç iş emri yok — önce `ac` koş');
  fail(`birden çok iş emri var, proje adı ver:\n  ${liste.map((f) => path.basename(f, '.json')).join('\n  ')}`);
  return undefined;
}

function devralMetni(emir) {
  const k = karne(emir);
  const s = siradakiEylem(emir);
  const cumle = {
    bas: `${s.kareler.length} kare hiç basılmadı → ${s.kareler.slice(0, 12).join(', ')}${s.kareler.length > 12 ? '…' : ''}`,
    'onay-bekliyor': `${s.kareler.length} kare basıldı ama ONAY BEKLİYOR → ${s.kareler.slice(0, 12).join(', ')}${s.kareler.length > 12 ? '…' : ''}`,
    'klip-bas': `${s.kareler.length} onaylı kare klip bekliyor → ${s.kareler.slice(0, 12).join(', ')}${s.kareler.length > 12 ? '…' : ''}`,
    denetle: `${s.kareler.length} klip denetlenmedi → ${s.kareler.slice(0, 12).join(', ')}${s.kareler.length > 12 ? '…' : ''}`,
    kurgu: 'bütün kareler ve klipler bitti — sıra KURGUDA',
  }[s.eylem];
  return [
    `━━ ${emir.proje}`,
    `   ${k.toplam} kare · basılan ${k.basilan} · klipli ${k.klipli} · harcanan ${k.harcananKredi} kredi`,
    k.ilkBasimTutmaOrani === null
      ? '   ilk basımda tutma: henüz ölçülmedi'
      : `   ilk basımda tutma: %${Math.round(k.ilkBasimTutmaOrani * 100)} (kuzey yıldızı)`,
    '',
    `   SIRADAKİ → ${cumle}`,
    `   (kayıt: ${emir.guncellendi})`,
  ].join('\n');
}

export function main(argv) {
  const [komut, ...args] = argv;
  if (!komut || komut === '--yardim' || komut === '-h') return usage();

  if (komut === 'ac') {
    const proje = args.find((a) => !a.startsWith('--')) ?? fail('proje adı gerekli');
    const kare = Number(bayrak(args, '--kare'));
    const emir = yeniEmir(proje, kare, { sekans: bayrak(args, '--sekans') });
    const yol = emirYaz(emir);
    return `iş emri açıldı: ${path.relative(REPO_ROOT, yol)} · ${emir.shots.length} shot`;
  }

  if (komut === 'durum' || komut === 'devral') {
    const emir = emirOku(tekProje(args));
    if (args.includes('--json')) return JSON.stringify({ karne: karne(emir), siradaki: siradakiEylem(emir) }, null, 2);
    return devralMetni(emir);
  }

  if (komut === 'kaydet') {
    const proje = tekProje(args);
    const emir = emirOku(proje);
    const kayit = denemeKaydet(emir, {
      kare: Number(bayrak(args, '--kare')),
      asama: bayrak(args, '--asama'),
      motor: bayrak(args, '--motor'),
      cuzdan: bayrak(args, '--cuzdan'),
      kredi: Number(bayrak(args, '--kredi')),
      sonuc: bayrak(args, '--sonuc'),
      kusur: bayrak(args, '--kusur'),
    });
    emirYaz(emir);
    return `kare ${bayrak(args, '--kare')} · ${bayrak(args, '--asama')} deneme #${kayit.deneme} → ${kayit.sonuc}`;
  }

  fail(`bilinmeyen komut: ${komut}\n\n${usage()}`);
  return undefined;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(main(process.argv.slice(2)));
  } catch (hata) {
    if (hata instanceof IsEmriError) { console.error(`❌ ${hata.message}`); process.exit(2); }
    throw hata;
  }
}
