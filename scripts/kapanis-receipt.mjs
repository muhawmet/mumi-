#!/usr/bin/env node
// KAPANIŞ RECEIPT — biten işin TAŞINABİLİR medya makbuzu.
//
// NEDEN VAR — ölçülmüş kusur (2026-08-05):
// Destek ve Hareket `Biten/` altına taşındı ve "kapandı" sayıldı. Ama filmin kendisi
// (360 MB, 3:15) repo'nun hiçbir yerinde adı geçmeden Masaüstünde kaldı; hangi durumda
// kapandığı (iyi mi, reddedilmiş mi, yarım mı) yalnız commit mesajlarında yaşıyordu.
// Kötü bir video "bitti" diye kaybolursa, ondan öğrenilecek şey de kaybolur.
//
// TASARIM KARARI — receipt AYRI bir dosyada DEĞİL, projenin kendi `00-DURUM.txt`'inin içinde
// yaşar. Brief "00-DURUM ile çelişki olamaz" diyor; iki dosya tutmak çelişkiyi MÜMKÜN kılar,
// tek dosya tutmak onu YAPISAL OLARAK imkânsız kılar. Yeni rapor mezarlığı da kurulmaz.

import { readFileSync, existsSync, statSync, createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { isAbsolute, basename, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

/**
 * Kapanış durumları. Bir iş üç hâlde biter ve ÜÇÜ DE meşrudur — "kapandı" tek anlamlı
 * değildir. Yarım kalan iş de, reddedilen iş de taşınabilir kanıt bırakır.
 */
export const KAPANIS_DURUMLARI = ['APPROVED', 'REJECTED_HARVESTED', 'ABANDONED'];
/** APPROVED dışındaki her kapanış, ondan ne öğrenildiğinin kanıt yolunu taşımak ZORUNDA. */
export const KANIT_ZORUNLU = ['REJECTED_HARVESTED', 'ABANDONED'];

const BASLIK_RE = /^##+\s*KAPANIŞ RECEIPT\s*$/mu;
const ALAN_RE = /^(DURUM|KAYNAK|SHA256|SÜRE|KANIT)\s*:\s*(.*)$/u;
const SURE_RE = /^(?:\d+:)?[0-5]?\d:[0-5]\d$/u;

/** `00-DURUM.txt` metninden receipt bloğunu çıkarır. */
export function parseReceipt(metin) {
  const satirlar = String(metin ?? '').replace(/\r\n/g, '\n').split('\n');
  const i = satirlar.findIndex((s) => BASLIK_RE.test(s.trim()));
  if (i < 0) return null;
  const blok = { satir: i + 1, durum: null, kaynak: null, sha256: null, sure: null, kanit: null };
  for (let j = i + 1; j < satirlar.length; j += 1) {
    if (/^#{1,6}\s/u.test(satirlar[j])) break;
    const m = ALAN_RE.exec(satirlar[j].trim());
    if (!m) continue;
    const deger = m[2].trim();
    if (m[1] === 'DURUM') blok.durum = deger;
    else if (m[1] === 'KAYNAK') blok.kaynak = deger;
    else if (m[1] === 'SHA256') blok.sha256 = deger.toLowerCase();
    else if (m[1] === 'SÜRE') blok.sure = deger;
    else if (m[1] === 'KANIT') blok.kanit = deger;
  }
  return blok;
}

/** Saniyeyi `d:ss` / `s:dd:ss` biçimine çevirir. */
export function sureBicimle(saniye) {
  const t = Math.round(Number(saniye));
  const s = t % 60;
  const d = Math.floor(t / 60) % 60;
  const h = Math.floor(t / 3600);
  const iki = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${iki(d)}:${iki(s)}` : `${d}:${iki(s)}`;
}

/** Dosyanın gerçek sha256'sı (akış — 360 MB'lık dosya belleğe alınmaz). */
export function dosyaSha256(yol) {
  return new Promise((cozul, hata) => {
    const h = createHash('sha256');
    createReadStream(yol).on('error', hata).on('data', (p) => h.update(p)).on('end', () => cozul(h.digest('hex')));
  });
}

/** ffprobe ile süre — yoksa null döner, uydurmaz. */
export function medyaSuresi(yol) {
  try {
    const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', yol], {
      encoding: 'utf8', timeout: 30_000,
    }).trim();
    return out ? sureBicimle(out) : null;
  } catch {
    return null;
  }
}

/**
 * Receipt'i ölçer.
 * @param {string} metin `00-DURUM.txt` içeriği
 * @param {{dosyaVar?: (yol: string) => boolean, gercekSha?: string|null}} secenekler
 *        `gercekSha` verilirse SAHTE HASH duvarı da koşar.
 */
export function lintReceipt(metin, secenekler = {}) {
  // KAYNAK mutlak olmak zorunda (medya repo dışında). KANIT repo İÇİ kanıttır ve repo-göreli
  // yazılabilir — o yüzden repo köküne göre çözülür.
  const kok = secenekler.repoKok ?? process.cwd();
  const varMi = secenekler.dosyaVar
    ?? ((yol) => { try { return existsSync(isAbsolute(yol) ? yol : resolve(kok, yol)); } catch { return false; } });
  const kirmizi = [];
  const sari = [];
  const r = parseReceipt(metin);

  if (!r) {
    return {
      receipt: null,
      kirmizi: ['KAPANIŞ RECEIPT bloğu yok — biten iş taşınabilir medya makbuzu bırakmıyor'],
      sari,
    };
  }

  if (!r.durum) kirmizi.push('DURUM satırı yok — iş hangi hâlde kapandı belli değil');
  else if (!KAPANIS_DURUMLARI.includes(r.durum)) {
    kirmizi.push(`DURUM "${r.durum}" sözlük dışı — geçerli: ${KAPANIS_DURUMLARI.join(' | ')}`);
  }

  // KAYNAK mutlak olmak ZORUNDA: medya repo dışında (~/Desktop/...) yaşıyor; göreli yol
  // başka makinede/başka cwd'de sessizce başka bir şeyi gösterir.
  if (!r.kaynak) kirmizi.push('KAYNAK satırı yok — final medyanın yolu kayıtlı değil');
  else if (!isAbsolute(r.kaynak)) kirmizi.push(`KAYNAK mutlak yol değil → ${r.kaynak}`);
  else if (!varMi(r.kaynak)) kirmizi.push(`KAYNAK diskte YOK → ${r.kaynak}`);

  if (!r.sha256) kirmizi.push('SHA256 satırı yok — makbuz hangi dosyayı imzaladığını kanıtlayamaz');
  else if (!/^[0-9a-f]{64}$/u.test(r.sha256)) kirmizi.push(`SHA256 biçimi bozuk → ${r.sha256}`);
  else if (secenekler.gercekSha && secenekler.gercekSha !== r.sha256) {
    // SAHTE HASH — tahmin edilen imza, imzasızlıktan kötüdür.
    kirmizi.push(`SHA256 dosyayla UYUŞMUYOR → yazılı ${r.sha256.slice(0, 12)}… · gerçek ${secenekler.gercekSha.slice(0, 12)}…`);
  }

  if (!r.sure) kirmizi.push('SÜRE satırı yok');
  else if (!SURE_RE.test(r.sure)) kirmizi.push(`SÜRE biçimi bozuk (d:ss ya da s:dd:ss bekleniyor) → ${r.sure}`);

  // Kötü video kaybolmasın: reddedilen ya da terk edilen iş, ondan ne öğrenildiğini gösteren
  // gerçek bir kanıt yolu bırakmak zorunda (AGY tarifi, hasat, timeline).
  if (KANIT_ZORUNLU.includes(r.durum)) {
    if (!r.kanit) {
      kirmizi.push(`KANIT satırı yok — ${r.durum} kapanışı ondan ne öğrenildiğini göstermek zorunda`);
    } else if (!varMi(r.kanit)) {
      kirmizi.push(`KANIT yolu diskte YOK → ${r.kanit}`);
    }
  } else if (r.kanit && !varMi(r.kanit)) {
    kirmizi.push(`KANIT yolu diskte YOK → ${r.kanit}`);
  }

  if (!secenekler.gercekSha && r.sha256) {
    sari.push('SHA256 dosyaya karşı doğrulanmadı — `kapanis-receipt.mjs dogrula <00-DURUM.txt>` ile ölç');
  }

  return { receipt: r, kirmizi, sari };
}

/** CLI */
const KOMUTLAR = ['damgala', 'dogrula'];
if (process.argv[1] && import.meta.url.endsWith(basename(process.argv[1]))) {
  const [komut, ...rest] = process.argv.slice(2);
  if (!KOMUTLAR.includes(komut)) {
    process.stdout.write(
      'kullanım:\n'
      + '  node scripts/kapanis-receipt.mjs damgala <medya-mutlak-yol>   # sha256 + süre hesaplar, blok basar\n'
      + '  node scripts/kapanis-receipt.mjs dogrula <00-DURUM.txt>       # bloğu GERÇEK dosyaya karşı ölçer\n',
    );
    process.exit(2);
  }

  if (komut === 'damgala') {
    const yol = rest[0];
    if (!yol || !existsSync(yol)) { process.stdout.write(`⛔ medya yok: ${yol}\n`); process.exit(1); }
    const sha = await dosyaSha256(yol);
    const sure = medyaSuresi(yol);
    process.stdout.write(
      '\n## KAPANIŞ RECEIPT\n'
      + 'DURUM: <APPROVED | REJECTED_HARVESTED | ABANDONED>\n'
      + `KAYNAK: ${yol}\n`
      + `SHA256: ${sha}\n`
      + `SÜRE: ${sure ?? '<ffprobe okuyamadı — elle yaz>'}\n`
      + 'KANIT: <APPROVED dışında ZORUNLU — AGY tarifi / hasat / timeline yolu>\n'
      + `\n(boyut: ${(statSync(yol).size / 1024 / 1024).toFixed(1)} MB)\n`,
    );
    process.exit(0);
  }

  const durumYolu = rest[0];
  if (!durumYolu || !existsSync(durumYolu)) { process.stdout.write(`⛔ dosya yok: ${durumYolu}\n`); process.exit(1); }
  const metin = readFileSync(durumYolu, 'utf8');
  const on = parseReceipt(metin);
  const gercekSha = on?.kaynak && existsSync(on.kaynak) ? await dosyaSha256(on.kaynak) : null;
  const { kirmizi, sari, receipt } = lintReceipt(metin, { gercekSha });
  process.stdout.write(`\n━━ ${basename(durumYolu)} — kapanış receipt'i\n`);
  if (receipt) process.stdout.write(`  DURUM: ${receipt.durum ?? '(yok)'} · SÜRE: ${receipt.sure ?? '(yok)'}\n`);
  for (const k of kirmizi) process.stdout.write(`  🔴 ${k}\n`);
  for (const s of sari) process.stdout.write(`  🟡 ${s}\n`);
  process.stdout.write(kirmizi.length ? '\n⛔ RECEIPT KIRMIZI\n' : '\n✅ receipt geçerli — gerçek dosyaya karşı doğrulandı\n');
  process.exit(kirmizi.length ? 1 : 0);
}
