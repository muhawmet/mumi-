#!/usr/bin/env node
// MAMILAS — DERS BANKASI DEBİSİ
//
// Neden var (2026-08-02 ölçümü): hasat kapısı biten projelerin hasat edilip edilmediğini
// ölçüyordu ve hepsi hasat edilmişse "✅ hepsi güncel" diyordu. Ama döngü orada kopmuyor —
// **onay adımında** kopuyor. Canlı ölçüm: agents/lessons altında 20 dosya / 2524 satır aday,
// APPROVED.md'de 7 ders ve yedisi de TEK projeden TEK günden. Yani kapı, döngünün tam
// koptuğu noktada YEŞİL rapor veriyordu.
//
// Bu modül "hasat yapıldı mı" diye sormaz — **"öğrenilen üretime döndü mü"** diye sorar.
//
// İkinci ölçtüğü şey sessiz kayıp: lessonBank.ts approvedLessonsSlice() konumsal `slice(-20)`
// yapıyor. Banka 20'yi aşarsa DOSYANIN ÜSTÜNDEKİ satırlar — yani en eski onaylı dersler —
// hiçbir uyarı olmadan üretim context'inden düşer. Bugün 7 satır var; hazır aday listesi tek
// başına 31 satır öneriyor. Taşma sessiz olmamalı.
//
// ORTAM YASASI: saf Node, kabuk yok, satır sonu normalize. Windows birincil ortamdır.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** lessonBank.ts:30 ile AYNI sözleşme. İki kopya ayrışmasın diye biçim burada da yazılı:
 *  "- <ders> — kaynak: <proje> · <YYYY-AA-GG> · Mami onayı"
 *  Ayrışırsa `dersBankasiDurumu.test.mjs` kırmızı verir. */
export const DERS_SATIRI =
  /^-\s+(.+?)\s+—\s+kaynak:\s*(.+?)\s*·\s*(\d{4}-\d{2}-\d{2})\s*·\s*Mami onayı\s*$/u;

/** lessonBank.ts:27 APPROVED_LESSONS_CAP ile aynı sayı; testte eşitliği kilitli. */
export const TAVAN = 20;

const lf = (s) => s.replace(/\r\n/g, '\n');

/**
 * Bir markdown gövdesindeki banka-biçimli satırları çıkarır.
 *
 * İki yerleşim tanınır ve bu bilerek böyle:
 *   1. ÇIPLAK satır — APPROVED.md ve makine hasadının biçimi.
 *   2. BACKTICK içinde — sentez belgelerinin biçimi (`**Ders:** `- … · Mami onayı``),
 *      çünkü orada satır kanıtıyla birlikte sunulur ve kopyalanmak üzere tırnaklanır.
 *
 * Neden ikisi de sayılır: ölçüldü (2026-08-02) — yalnız çıplak satır arayan sayım, repodaki
 * en zengin aday belgesinin 31 dersini "yok" saydı. Bu, bu repoda tekrar eden kusur sınıfının
 * ta kendisi: doğrulayıcı, ölçtüğü hattın gerçek yerleşimini değil beklediğini arıyor.
 */
export function dersleriAyikla(markdown) {
  if (!markdown?.trim()) return [];
  const out = [];
  for (const ham of lf(markdown).split('\n')) {
    const satir = ham.trim();
    const m = DERS_SATIRI.exec(satir);
    if (m) { out.push({ ders: m[1], proje: m[2], tarih: m[3] }); continue; }
    // Backtick yerleşimi: satırın herhangi bir yerinde tırnaklanmış banka satırı.
    for (const g of satir.matchAll(/`([^`]+)`/gu)) {
      const im = DERS_SATIRI.exec(g[1].trim());
      if (im) { out.push({ ders: im[1], proje: im[2], tarih: im[3] }); break; }
    }
  }
  return out;
}

/**
 * Bankanın debisi.
 * @returns {{onayli:number, aday:number, sonOnay:string|null, kaynakSayisi:number,
 *            tasma:number, adayDosya:number, olculemedi:string|null}}
 */
export function dersBankasiDurumu(root) {
  const dizin = join(root, 'agents', 'lessons');
  if (!existsSync(dizin)) {
    // ÖLÇEMEDİ ≠ TEMİZ — sessiz sıfır dönmek kapıyı yalancı yapar.
    return { onayli: 0, aday: 0, sonOnay: null, kaynakSayisi: 0, tasma: 0, adayDosya: 0,
             olculemedi: 'agents/lessons dizini yok' };
  }

  const onayliYol = join(dizin, 'APPROVED.md');
  const onayliDersler = existsSync(onayliYol)
    ? dersleriAyikla(readFileSync(onayliYol, 'utf8'))
    : [];

  // Aday = APPROVED.md DIŞINDAKİ her .md'de duran banka-biçimli satır. Biçimi tutan satır
  // "kopyala-yapıştır hazır" demektir; ham düzyazı aday sayılmaz (sayıyı şişirmemek için).
  let aday = 0;
  let adayDosya = 0;
  for (const ad of readdirSync(dizin)) {
    if (!ad.endsWith('.md') || ad === 'APPROVED.md') continue;
    const n = dersleriAyikla(readFileSync(join(dizin, ad), 'utf8')).length;
    if (n > 0) { aday += n; adayDosya += 1; }
  }

  // Tarih alanı parse edilir ama SIRALAMADA kullanılmaz (slice konumsal) — o yüzden
  // "son onay" için maksimum tarihi alıyoruz, dosyanın son satırını değil.
  const tarihler = onayliDersler.map((d) => d.tarih).sort();
  const kaynaklar = new Set(onayliDersler.map((d) => d.proje));

  return {
    onayli: onayliDersler.length,
    aday,
    adayDosya,
    sonOnay: tarihler.length ? tarihler[tarihler.length - 1] : null,
    kaynakSayisi: kaynaklar.size,
    tasma: Math.max(0, onayliDersler.length - TAVAN),
    olculemedi: null,
  };
}

/** Kapının basacağı satırlar. Boş dizi = söylenecek bir şey yok. */
export function durumSatirlari(d, etiket = '[hasat]') {
  const out = [];
  if (d.olculemedi) {
    out.push(`${etiket} ders bankası ÖLÇEMEDİ (temiz demek değil): ${d.olculemedi}`);
    return out;
  }

  out.push(
    `${etiket} ders bankası: onaylı ${d.onayli}/${d.onayli + d.aday}` +
      ` · bekleyen aday ${d.aday} (${d.adayDosya} dosya)` +
      (d.sonOnay ? ` · son onay ${d.sonOnay}` : ' · hiç onay yok'),
  );

  // Tek kaynak = banka bir videodan ibaret. Bu, "sistem öğrenmiyor"un ölçülebilir hali.
  if (d.onayli > 0 && d.kaynakSayisi === 1) {
    out.push(
      `${etiket} ⚠️ bankadaki ${d.onayli} dersin hepsi TEK projeden — sistem 1 videodan öğrenmiş durumda.`,
    );
  }

  if (d.aday > 0) {
    out.push(
      `${etiket}    bankaya girmeyen ders üretime hiç dönmez (director · enzim · yasa hepsi bankayı okur).`,
    );
    out.push(`${etiket}    hazır liste: agents/lessons/ · onaya taşı: node scripts/project-loot.mjs tasi --aday`);
  }

  // Sessiz kayıp uyarısı: tavan konumsal, taşan satırlar üstten düşer.
  const bosluk = TAVAN - d.onayli;
  if (d.tasma > 0) {
    out.push(
      `${etiket} 🔴 TAŞMA: banka ${d.onayli} satır, tavan ${TAVAN} — en ESKİ ${d.tasma} ders` +
        ' üretim context\'inden SESSİZCE düşüyor (lessonBank.ts slice konumsal).',
    );
  } else if (d.aday > bosluk && bosluk >= 0) {
    out.push(
      `${etiket} ⚠️ tavan bütçesi: ${bosluk} satır yer kaldı, ${d.aday} aday bekliyor —` +
        ' sıralama önem taşır, taşan en eskiyi sessizce düşürür.',
    );
  }

  return out;
}

// ── CLI ────────────────────────────────────────────────────────────────────────────────
// isMain deseni repo sözleşmesiyle aynı (kapanis-hasadi.mjs:879) — ad karşılaştırması değil
// tam URL eşitliği; bu modül başka scriptlerden import ediliyor ve yanlışlıkla koşmamalı.
const HERE = dirname(fileURLToPath(import.meta.url));
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const root = join(HERE, '..');
  const d = dersBankasiDurumu(root);
  for (const s of durumSatirlari(d, '[ders]')) process.stdout.write(`${s}\n`);
  process.exit(0);
}
