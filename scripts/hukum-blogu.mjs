#!/usr/bin/env node
// DIŞ GÖZ HÜKÜM BLOĞU — ayrıştırıcı ve ölçen.
//
// Kanon: docs/ai/DORTLU-MASA.md §4. Sol ve AGY'nin hükmü AYRI bir rapor dosyasında değil,
// MEVCUT proje artefact'inin (ENZIM / CANARY-LOCK / Shot Card / kapanış hasadı) içinde
// kısa bir blok olarak yaşar.
//
// Neden ölçen gerekiyor — ölçülmüş kusur (2026-08-05):
//  · Dörtlü Masa aylarca yalnız planda yaşadı; Sol plan denetimi HİÇ koşmadı ve kimse fark
//    etmedi, çünkü koşmadığını gösterecek bir yer yoktu.
//  · Plan "sahte CLEAR yasak" diyordu ama bunu yalnız markdown söylüyordu. Bir cümlenin
//    yasakladığı şeyi ancak bir ölçen engelleyebilir.
//
// Bu ölçenin tek işi: bir hüküm bloğunun UYDURULAMAZ olduğunu doğrulamak.
// Uydurulamaz demek: okunduğu iddia edilen dosya DİSKTE GERÇEKTEN VAR ve blok koşma kaydı taşıyor.

import { existsSync, statSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';

/** Sol'un verebileceği tek sonuç kümesi (docs/ai/DORTLU-MASA.md §2). */
export const SOL_SOZLUGU = ['CLEAR TO CONTINUE', 'RESHAPE', 'NARROW', 'UNPROVEN'];
/** Sol'a gerçekten ulaşılamadığında yazılan dürüst kayıt. */
export const SOL_ULASILAMADI = 'SOL_UNAVAILABLE';
/** AGY hüküm vermez; yalnız tarif eder. */
export const AGY_HUKMU = 'TARİF';

/** Claude'un bir bulguya verebileceği tek karşılık kümesi. */
export const SONUC_SOZLUGU = ['uygulandı', 'daraltıldı', 'kanıt yetersiz'];

/**
 * AGY bloğunda GEÇEMEYECEK kelimeler. Gerekçe ölçülmüş: AGY'ye hüküm sordurulunca her şeye
 * "YOK" basıyor, ve `PASS_CANDIDATE` yazması onu otomatik yargıca çeviriyor.
 * APPROVED / MOTION_VERIFIED yalnız Mami'nin ham cümlesiyle doğar.
 */
export const AGY_YASAK = ['PASS_CANDIDATE', 'APPROVED', 'MOTION_VERIFIED', ...SOL_SOZLUGU];

const BASLIK_RE = /^##+\s*DIŞ GÖZ HÜKMÜ\s*—\s*(SOL|AGY)\b(.*)$/u;
const ALAN_RE = /^(KOŞULDU|OKUNAN|HÜKÜM|BULGU|SONUÇ|MAMİ)\s*:\s*(.*)$/u;
/** `<yol>` ya da `<yol> · sha256:<hex>` */
const OKUNAN_RE = /^(.+?)(?:\s*·\s*sha256:\s*([0-9a-f]{8,64}))?\s*$/iu;

/**
 * Metindeki bütün hüküm bloklarını çıkarır.
 * Blok, `## DIŞ GÖZ HÜKMÜ — SOL` başlığında başlar ve bir sonraki `#` başlığında biter.
 */
export function parseHukumBloklari(metin) {
  const satirlar = String(metin ?? '').replace(/\r\n/g, '\n').split('\n');
  const bloklar = [];
  let aktif = null;

  for (let i = 0; i < satirlar.length; i += 1) {
    const satir = satirlar[i];
    const basSonuc = BASLIK_RE.exec(satir.trim());
    if (basSonuc) {
      if (aktif) bloklar.push(aktif);
      aktif = {
        goz: basSonuc[1],
        baslikEki: basSonuc[2].trim(),
        satir: i + 1,
        kosuldu: null,
        okunan: [],
        hukum: null,
        bulgu: null,
        sonuc: [],
        mami: null,
        govde: [],
      };
      continue;
    }
    if (!aktif) continue;
    // Yeni bir başlık bloğu kapatır (hüküm bloğu kendi başlığının altında yaşar).
    if (/^#{1,6}\s/u.test(satir)) {
      bloklar.push(aktif);
      aktif = null;
      continue;
    }
    aktif.govde.push(satir);

    const alan = ALAN_RE.exec(satir.trim());
    if (!alan) continue;
    const [, ad, ham] = alan;
    const deger = ham.trim();
    if (ad === 'KOŞULDU') aktif.kosuldu = deger;
    else if (ad === 'OKUNAN') {
      const m = OKUNAN_RE.exec(deger);
      aktif.okunan.push({ yol: (m?.[1] ?? deger).trim(), sha: m?.[2]?.toLowerCase() ?? null, satir: i + 1 });
    } else if (ad === 'HÜKÜM') aktif.hukum = deger;
    else if (ad === 'BULGU') aktif.bulgu = deger;
    else if (ad === 'SONUÇ') aktif.sonuc.push({ metin: deger, satir: i + 1 });
    else if (ad === 'MAMİ') aktif.mami = deger;
  }
  if (aktif) bloklar.push(aktif);
  return bloklar;
}

/**
 * Bir yolun diskte gerçekten OKUNABİLİR BİR DOSYA olup olmadığı.
 *
 * 🔴 Sol karşı-denetimi (2026-08-05, RESHAPE) burada bir kaçış yolu buldu: yalnız `existsSync`
 * bakılıyordu, yani bir KLASÖR ya da bir sembolik bağ "okudum" kanıtı sayılabiliyordu.
 * `OKUNAN: docs/` geçiyordu. Artık dosya olmak ve boş olmamak zorunda.
 */
const gercekVarMi = (yol, kok) => {
  const tam = isAbsolute(yol) ? yol : resolve(kok, yol);
  try {
    if (!existsSync(tam)) return false;
    const st = statSync(tam);
    return st.isFile() && st.size > 0;
  } catch {
    return false;
  }
};

/**
 * KOŞULDU satırının anlamlı olup olmadığı. `KOŞULDU: x` bir koşma kaydı değildir.
 * Eşik kasten düşük (ölçüm değil, boşluk doldurma tespiti): en az bir komut/model izi.
 */
const KOSULDU_ASGARI = 12;

/**
 * Tek bir hüküm bloğunu ölçer.
 * @returns {{kirmizi: string[], sari: string[]}}
 */
export function lintHukumBlogu(blok, secenekler = {}) {
  const kok = secenekler.repoKok ?? process.cwd();
  const varMi = secenekler.dosyaVar ?? ((yol) => gercekVarMi(yol, kok));
  const kirmizi = [];
  const sari = [];

  const gecerliHukumler = blok.goz === 'SOL' ? [...SOL_SOZLUGU, SOL_ULASILAMADI] : [AGY_HUKMU];

  // 1 · HÜKÜM sözlük dışı olamaz. Serbest metin, sözleşmeyi dekora çevirir.
  if (!blok.hukum) {
    kirmizi.push(`satır ${blok.satir}: HÜKÜM satırı yok — ${blok.goz} bloğu sonuçsuz`);
  } else if (!gecerliHukumler.includes(blok.hukum)) {
    kirmizi.push(
      `satır ${blok.satir}: HÜKÜM "${blok.hukum}" sözlük dışı — ${blok.goz} için geçerli: ${gecerliHukumler.join(' | ')}`,
    );
  }

  // 2 · AGY hüküm vermez. Yasak kelimelerden biri geçtiyse gerçek göz yargıca dönüşmüş demektir.
  if (blok.goz === 'AGY') {
    const govde = blok.govde.join('\n');
    for (const yasak of AGY_YASAK) {
      if (govde.includes(yasak)) {
        kirmizi.push(
          `satır ${blok.satir}: AGY bloğunda "${yasak}" geçiyor — AGY TARİF eder, hüküm vermez. ` +
          'APPROVED/MOTION_VERIFIED yalnız Mami\'nin ham cümlesiyle doğar.',
        );
      }
    }
  }

  // 3 · SAHTE CLEAR DUVARI — koşma kaydı olmayan sonuç uydurulmuş sayılır.
  if (!blok.kosuldu) {
    kirmizi.push(
      `satır ${blok.satir}: KOŞULDU satırı yok — dış gözün gerçekten koştuğunun kaydı yok. ` +
      'Ulaşılamadıysa HÜKÜM: SOL_UNAVAILABLE yazılır, sonuç uydurulmaz.',
    );
  } else if (blok.kosuldu.trim().length < KOSULDU_ASGARI) {
    // Sol bulgusu: `KOŞULDU: x` alanı doldurup duvarı geçiyordu.
    kirmizi.push(
      `satır ${blok.satir}: KOŞULDU çok kısa ("${blok.kosuldu}") — koşma kaydı değil boşluk doldurma. ` +
      'Komut/model ve kapsam yazılır (ör. "codex exec -m gpt-5.6-sol · high · 4 dosya").',
    );
  }

  // 4 · OKUNAN GERÇEK OLMAK ZORUNDA. Sol "Claude'un özetine değil gerçek yollara bakar";
  //     var olmayan bir yolu okuduğunu söyleyen blok, kanıt değil dekordur.
  if (blok.hukum !== SOL_ULASILAMADI) {
    if (blok.okunan.length === 0) {
      kirmizi.push(`satır ${blok.satir}: OKUNAN satırı yok — hangi gerçek artefact incelendi belli değil`);
    }
    for (const kayit of blok.okunan) {
      if (!varMi(kayit.yol)) {
        kirmizi.push(`satır ${kayit.satir}: OKUNAN yol diskte YOK → ${kayit.yol}`);
      }
    }
  }

  // 5 · Her bulgunun TEK karşılığı olmak zorunda; "sonra bakarız" yok.
  // Sol bulgusu (RESHAPE): BULGU yalnız SARI'ydı — gerekçesiz bir hüküm duvarı geçiyordu.
  if (!blok.bulgu || blok.bulgu.trim().length < 12) {
    kirmizi.push(
      `satır ${blok.satir}: BULGU yok/çok kısa — gerekçesiz hüküm, hükmün kendisi kadar değersizdir`,
    );
  }
  if (blok.sonuc.length === 0) {
    kirmizi.push(`satır ${blok.satir}: SONUÇ satırı yok — bulguya verilen tek karşılık yazılmamış`);
  }
  for (const s of blok.sonuc) {
    const bas = SONUC_SOZLUGU.find((k) => s.metin.toLowerCase().startsWith(k));
    if (!bas) {
      kirmizi.push(
        `satır ${s.satir}: SONUÇ "${s.metin.slice(0, 40)}" sözlük dışı — geçerli: ${SONUC_SOZLUGU.join(' | ')}`,
      );
    }
  }

  // 6 · sha yazılmışsa biçimi tutmalı (yanlış hash, hash'siz olmaktan kötüdür).
  for (const kayit of blok.okunan) {
    if (kayit.sha && !/^[0-9a-f]{8,64}$/u.test(kayit.sha)) {
      kirmizi.push(`satır ${kayit.satir}: sha256 biçimi bozuk → ${kayit.sha}`);
    }
  }

  // SARI — kusur iddiası değil, bakılacak yer.
  if (blok.goz === 'SOL' && blok.hukum === 'RESHAPE' && blok.sonuc.every((s) => s.metin.toLowerCase().startsWith('kanıt yetersiz'))) {
    sari.push(`satır ${blok.satir}: RESHAPE geldi ama tek karşılık "kanıt yetersiz" — RESHAPE akışı geri saran tek sonuçtur`);
  }
  if (blok.okunan.length > 0 && blok.okunan.every((k) => !k.sha)) {
    sari.push(`satır ${blok.satir}: hiçbir OKUNAN yolunda sha256 yok — dosya sonradan değişirse hüküm sessizce bayatlar`);
  }

  return { kirmizi, sari };
}

/** Bir metnin içindeki bütün blokları ölçer. */
export function lintHukumBloklari(metin, secenekler = {}) {
  const bloklar = parseHukumBloklari(metin);
  const kirmizi = [];
  const sari = [];
  for (const blok of bloklar) {
    const sonuc = lintHukumBlogu(blok, secenekler);
    kirmizi.push(...sonuc.kirmizi);
    sari.push(...sonuc.sari);
  }
  return { bloklar, kirmizi, sari };
}
