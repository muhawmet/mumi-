#!/usr/bin/env node
// CANARY KİLİDİ — İÇERİK ÖLÇENİ.
//
// Kanon: docs/ai/DORTLU-MASA.md (roller · sonuç sözlüğü · beş tetikleyici)
// Biçim:  agents/DIS-GOZ-BRIEF-SABLONU.md (hüküm bloğu alanları)
//
// NEDEN VAR — ölçülmüş kusur (2026-08-05):
// `current-work.mjs` canary kilidini VARLIK olarak ölçüyordu. Doğru bir ilk adımdı ama
// yetersiz: adı doğru olan BOŞ bir dosya üretimi açıyordu. Bu repoda sekiz kez ölçülen kusur
// sınıfı tam olarak budur — kapı bir şey ölçüyor sanılıyor, ölçtüğü şey başka.
//
// BU ÖLÇEN DIŞ GÖZ ÇAĞIRMAZ. Ne Codex'e ne AGY'ye gider; yalnız GERÇEK sonucu içeri alır ve
// uydurulamaz olduğunu doğrular. Otomatik provider çağrısı / API loop'u bu dosyada YASAKTIR.

import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, isAbsolute, basename } from 'node:path';
import { parseHukumBloklari, lintHukumBlogu } from './hukum-blogu.mjs';

/** Kilit PASS olsa bile üretimi AÇMAYAN Sol sonuçları. */
export const URETIMI_ACMAYAN_SOL = ['RESHAPE', 'UNPROVEN', 'SOL_UNAVAILABLE'];
/** Üretimi açabilen Sol sonuçları. NARROW açar — ama daraltma uygulanmış olmak zorunda. */
export const URETIMI_ACAN_SOL = ['CLEAR TO CONTINUE', 'NARROW'];

export const DURUMLAR = ['PASS', 'FAIL'];

/** Lehçe kaydının üç alanı — canary'nin öğrettiği şey burada yaşar, yoksa canary boşa gitmiştir. */
export const LEHCE_ALANLARI = ['ÇALIŞAN BİÇİM', 'YASAKLANAN KALIP', 'SINANAN TEK DEĞİŞKEN'];

const DURUM_RE = /^DURUM\s*:\s*(.+)$/mu;
const MEDYA_RE = /^(FRAME|KLIP)\s*:\s*(.+)$/gmu;
const MAMI_RE = /^##+\s*MAMİ HÜKMÜ\s*$/mu;
const LEHCE_RE = (alan) => new RegExp(`^${alan}\\s*:\\s*(.+)$`, 'mu');
const SHA_EK_RE = /^(.+?)(?:\s*·\s*sha256:\s*([0-9a-zA-Z]+))?\s*$/u;

/**
 * 🔴 Sol karşı-denetimi (2026-08-05, RESHAPE): yalnız `existsSync` bakılıyordu, bir KLASÖR
 * medya sayılabiliyordu. Artık dosya olmak ve boş olmamak zorunda.
 */
const varMi = (yol, kok) => {
  try {
    const tam = isAbsolute(yol) ? yol : resolve(kok, yol);
    if (!existsSync(tam)) return false;
    const st = statSync(tam);
    return st.isFile() && st.size > 0;
  } catch {
    return false;
  }
};

/**
 * Medya UZANTISI sözleşmesi. Sol bulgusu: fixture'lar `.md` dosyalarını FRAME/KLIP kabul
 * ediyordu ve ölçen buna itiraz etmiyordu — yani "gerçek kare/klip" iddiası ölçülmüyordu.
 */
export const KARE_UZANTILARI = ['.png', '.jpg', '.jpeg', '.webp'];
export const KLIP_UZANTILARI = ['.mp4', '.mov', '.webm', '.m4v'];
const uzantiTutuyor = (yol, liste) => liste.some((u) => yol.toLowerCase().endsWith(u));

/** MAMİ HÜKMÜ başlığından sonraki ilk boş olmayan satırları toplar. */
function mamiHukmu(metin) {
  const satirlar = metin.replace(/\r\n/g, '\n').split('\n');
  const i = satirlar.findIndex((s) => MAMI_RE.test(s.trim()));
  if (i < 0) return null;
  const govde = [];
  for (let j = i + 1; j < satirlar.length; j += 1) {
    const s = satirlar[j];
    if (/^#{1,6}\s/u.test(s)) break;
    if (s.trim()) govde.push(s.trim());
  }
  return govde.join(' ').trim() || null;
}

/**
 * Bir canary kilidini ölçer.
 * @returns {{durum: string|null, kirmizi: string[], sari: string[], solHukmu: string|null,
 *            medya: Array<{tur: string, yol: string, sha: string|null}>}}
 */
export function lintCanaryLock(hamMetin, secenekler = {}) {
  // SATIR SONU İÇERİK DEĞİLDİR. Repo `core.autocrlf=true` ile checkout ediliyor ve Windows
  // birincil ortam — CRLF bir dosyada `DURUM: PASS\r` üretir. Bugün `trim()` bunu KAZARA
  // kurtarıyordu; kazara doğru olan bir şey ilk refactor'da bozulur. Garantiyi açık yapıyoruz.
  const metin = String(hamMetin ?? '').replace(/\r\n/g, '\n');
  const kok = secenekler.repoKok ?? process.cwd();
  const dosyaVar = secenekler.dosyaVar ?? ((yol) => varMi(yol, kok));
  const kirmizi = [];
  const sari = [];

  // 1 · DURUM — sözlük dışı bir kelime "geçti" sayılamaz.
  const durumSonuc = DURUM_RE.exec(metin);
  const durum = durumSonuc ? durumSonuc[1].trim() : null;
  if (!durum) kirmizi.push('DURUM satırı yok — kilit ne söylediğini söylemiyor');
  else if (!DURUMLAR.includes(durum)) {
    kirmizi.push(`DURUM "${durum}" sözlük dışı — geçerli: ${DURUMLAR.join(' | ')}`);
  }

  // 2 · MEDYA — gerçek kare ve gerçek klip yolları, diskte var olmak zorunda.
  //     Bir canary hükmü, ölçtüğü medya olmadan hükümdür ama kanıt değildir.
  const medya = [];
  for (const m of metin.matchAll(MEDYA_RE)) {
    const parca = SHA_EK_RE.exec(m[2].trim());
    medya.push({ tur: m[1], yol: (parca?.[1] ?? m[2]).trim(), sha: parca?.[2] ?? null });
  }
  const kareler = medya.filter((x) => x.tur === 'FRAME');
  const klipler = medya.filter((x) => x.tur === 'KLIP');
  if (kareler.length === 0) kirmizi.push('FRAME satırı yok — hangi gerçek kare sınandı belli değil');
  if (klipler.length === 0) kirmizi.push('KLIP satırı yok — canary klipsiz olamaz, hüküm klibe verilir');
  for (const kayit of medya) {
    if (!dosyaVar(kayit.yol)) {
      kirmizi.push(`${kayit.tur} yolu diskte YOK (ya da dosya değil / boş) → ${kayit.yol}`);
    }
    const beklenen = kayit.tur === 'FRAME' ? KARE_UZANTILARI : KLIP_UZANTILARI;
    if (!uzantiTutuyor(kayit.yol, beklenen)) {
      kirmizi.push(
        `${kayit.tur} medya uzantısı değil (${beklenen.join(' ')}) → ${kayit.yol} — `
        + 'bir metin dosyası kare ya da klip kanıtı olamaz',
      );
    }
    if (kayit.sha && !/^[0-9a-f]{8,64}$/u.test(kayit.sha)) {
      kirmizi.push(`${kayit.tur} sha256 biçimi bozuk (${basename(kayit.yol)}) → ${kayit.sha}`);
    }
  }
  if (medya.length > 0 && medya.every((x) => !x.sha)) {
    sari.push('hiçbir medya yolunda sha256 yok — dosya değişirse kilit sessizce bayatlar');
  }

  // 3 · DIŞ GÖZ HÜKÜMLERİ — Sol ve AGY, hüküm bloğu sözleşmesiyle ölçülür.
  const bloklar = parseHukumBloklari(metin);
  const sol = bloklar.find((b) => b.goz === 'SOL');
  const agy = bloklar.find((b) => b.goz === 'AGY');
  if (!sol) kirmizi.push('SOL hüküm bloğu yok — canary taslağı çürütülmemiş');
  if (!agy) kirmizi.push('AGY hüküm bloğu yok — gerçek klip tarifi yok, hüküm metinden verilmiş');
  for (const blok of [sol, agy].filter(Boolean)) {
    const sonuc = lintHukumBlogu(blok, { repoKok: kok, dosyaVar: secenekler.dosyaVar });
    kirmizi.push(...sonuc.kirmizi.map((k) => `${blok.goz} bloğu · ${k}`));
    sari.push(...sonuc.sari.map((k) => `${blok.goz} bloğu · ${k}`));
  }

  // 4 · MAMİ HÜKMÜ — ham cümle. Boşsa canary hükmü verilmemiştir; Claude onun yerine geçemez.
  const mami = mamiHukmu(metin);
  if (!mami) {
    kirmizi.push('MAMİ HÜKMÜ boş — canary hükmünün tek sahibi Mami\'dir, ajan onun yerine yazamaz');
  }

  // 5 · LEHÇE — canary'nin öğrettiği şey. Yoksa 8 klip yakıldı ve geriye bilgi kalmadı.
  for (const alan of LEHCE_ALANLARI) {
    const m = LEHCE_RE(alan).exec(metin);
    if (!m || !m[1].trim()) kirmizi.push(`${alan} satırı yok/boş — canary'den geriye öğrenilen bir şey kalmıyor`);
  }

  return { durum, kirmizi, sari, solHukmu: sol?.hukum ?? null, medya };
}

/**
 * Üretim fazı açılabilir mi? Kilidin kendisi temiz OLSA BİLE Sol sonucu üç hâlde üretimi açmaz.
 * @returns {{acik: boolean, sebep: string|null, olcum: ReturnType<typeof lintCanaryLock>}}
 */
export function uretimAcilabilirMi(metin, secenekler = {}) {
  const olcum = lintCanaryLock(metin, secenekler);
  if (olcum.kirmizi.length > 0) {
    return { acik: false, sebep: `canary kilidi KIRMIZI (${olcum.kirmizi.length} kusur)`, olcum };
  }
  if (olcum.durum !== 'PASS') {
    return { acik: false, sebep: `canary DURUM: ${olcum.durum} — yalnız PASS üretimi açar`, olcum };
  }
  if (URETIMI_ACMAYAN_SOL.includes(olcum.solHukmu)) {
    return {
      acik: false,
      sebep: `Sol hükmü ${olcum.solHukmu} — üretim açılmaz; kırılan hipotez düzeltilir ve YENİ küçük canary basılır`,
      olcum,
    };
  }
  if (!URETIMI_ACAN_SOL.includes(olcum.solHukmu)) {
    return { acik: false, sebep: `Sol hükmü tanınmadı: ${olcum.solHukmu}`, olcum };
  }
  return { acik: true, sebep: null, olcum };
}

/** CLI: node scripts/canary-lock.mjs <kilit-dosyasi> */
if (process.argv[1] && import.meta.url.endsWith(basename(process.argv[1]))) {
  const yol = process.argv[2];
  if (!yol) {
    process.stdout.write('kullanım: node scripts/canary-lock.mjs <Ad>_CANARY-LOCK.md\n');
    process.exit(2);
  }
  if (!existsSync(yol)) {
    process.stdout.write(`⛔ kilit dosyası yok: ${yol}\n`);
    process.exit(1);
  }
  const metin = readFileSync(yol, 'utf8');
  const { acik, sebep, olcum } = uretimAcilabilirMi(metin, { repoKok: process.cwd() });
  process.stdout.write(`\n━━ ${basename(yol)} — canary kilidi\n`);
  process.stdout.write(`  DURUM: ${olcum.durum ?? '(yok)'} · Sol: ${olcum.solHukmu ?? '(yok)'} · medya: ${olcum.medya.length}\n`);
  for (const k of olcum.kirmizi) process.stdout.write(`  🔴 ${k}\n`);
  for (const s of olcum.sari) process.stdout.write(`  🟡 ${s}\n`);
  process.stdout.write(acik ? '\n✅ ÜRETİM AÇILABİLİR\n' : `\n⛔ ÜRETİM AÇILAMAZ — ${sebep}\n`);
  process.exit(acik ? 0 : 1);
}
