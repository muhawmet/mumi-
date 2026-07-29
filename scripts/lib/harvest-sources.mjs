// MAMILAS HASAT — KAYNAK SEÇİCİSİ (saf, I/O'suz)
//
// Neden ayrı dosya: hasadın en pahalı kusuru dosya SEÇİMİNDE doğdu, ölçümde değil.
// `revize.*\.(txt|md)` deseni `REVIZE-VE-MOTION.md`'yi seçti (267 satır MOTION metni),
// gerçek `revize.txt` (70 satır) hiç okunmadı → rapora "revize oranı 388%" yazıldı ve
// altına 6 uydurma ders satırı dizildi. Seçim I/O'dan ayrılınca sentetik testle çivilenir.
//
// Buradaki her fonksiyon SAF: girdi dosya ADI listesi, çıktı seçim + gerekçe. Disk yok.

export const PARSER_VERSION = 'kapanis-hasadi@3';

/**
 * Türkçe-güvenli katlama. `toLowerCase()` TEK BAŞINA KULLANILMAZ:
 * 'İ'.toLowerCase() === 'i̇' — iki kod noktası (i + U+0307 combining dot above).
 * Eski slugify tam bu yüzden `Kuvvet MİRA` → `kuvvet-mi-ra` üretti (birleşik işaret
 * [a-z0-9] değil, tire oldu). Ölçüldü: agents/lessons/HASAT-kuvvet-mi-ra.md.
 *
 * NFC önce: macOS/SMB/zip klasör adını NFD verebilir; iki gösterim aynı ada katlanmalı.
 */
export function foldTr(s) {
  return String(s)
    .normalize('NFC')
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // artık birleşik işaret kalmasın
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

export function slugify(s) {
  return foldTr(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ---------------------------------------------------------------------------
// REVİZE SEÇİMİ
//
// İki aşama, sırası önemli:
//   1. ADAY  — adında `revize` jetonu geçen .txt/.md
//   2. RET   — adayın adında BAŞKA bir kit teslimatının adı da geçiyorsa, o dosya
//              revize kaynağı değildir (karışık/kit belgesi).
//
// DİKKAT — spec'in ilk deny-listesi `promptlar` jetonunu içeriyordu; o liste aynen
// uygulansaydı `Bileşke Kuvvet_REVİZE-PROMPTLAR.txt` (19 blokluk TUR1) elenirdi ve
// Bileşke yine tek turlu görünürdü — düzeltmek için yazılan kod kusuru tekrar ederdi.
// `promptlar` listeden ÇIKARILDI: "revize promptları" meşru bir revize dosyası adıdır.
// `<Ad>_PROMPTLAR.txt` zaten aday bile olmuyor (adında `revize` yok).
const REVIZE_TOKEN = /revize/;
const REVIZE_DENY_KIT =
  /(motion|edit-?plan|seslendirme|suno|referanslar|kaynak-?metin|extend|uzatilacak|esleme|transkript|kaba-?kurgu|command)/;

const TXT_MD = /\.(txt|md)$/;

/** Aday final prompt dosyaları. Birden çoksa SEÇİM YAPILMAZ — açık hata verilir. */
export function pickPromptSources(files, manifest) {
  if (manifest?.promptParts?.length) return { parts: [...manifest.promptParts], via: 'manifest' };
  const c = files.filter((f) => /_promptlar\.(txt|md)$/.test(foldTr(f)));
  if (c.length === 0) return { parts: [], via: 'discovery', error: 'PROMPT_MISSING' };
  if (c.length === 1) return { parts: c, via: 'discovery' };
  // >1: ASLA readdir sırasına bırakma. Ölçüldü: aynı klasörde .txt (48 kare / 10 eksikli)
  // ve .md (58 kare / 58 eksikli) — hangisinin yazıldığı dosya sistemi sırasına bağlıydı.
  return { parts: [], via: 'discovery', error: 'PROMPT_AMBIGUOUS', candidates: [...c].sort() };
}

/**
 * Revize kaynakları. ÇOK TURLU: bulunan her tur kullanılır, `find` ile ilkine indirgenmez.
 * Sıra folded ada göre deterministik; gerçek tur sırası manifest ile ezilebilir.
 */
export function pickRevizeSources(files, manifest) {
  const excluded = [];
  const parts = [];
  for (const f of files) {
    const n = foldTr(f);
    if (!TXT_MD.test(n)) continue;
    if (!REVIZE_TOKEN.test(n)) continue;
    const kit = n.match(REVIZE_DENY_KIT);
    if (kit) {
      excluded.push({ file: f, why: `deny-list: adında "${kit[0]}" geçiyor — kit belgesi, revize kaynağı değil` });
      continue;
    }
    parts.push(f);
  }
  parts.sort((a, b) => (foldTr(a) < foldTr(b) ? -1 : foldTr(a) > foldTr(b) ? 1 : 0));

  // Manifest kazanır — ama elenenler YİNE kaydedilir. Kayıt olmazsa `--check` her turda
  // "yeni aday kaynak var" (STALE_N) diye bağırır; ölçüldü: manifest'li Kütle sonsuz STALE.
  if (manifest?.revizeParts) {
    const declared = new Set(manifest.revizeParts.map((f) => foldTr(f)));
    for (const f of parts) {
      if (!declared.has(foldTr(f))) excluded.push({ file: f, why: 'HASAT.json revizeParts içinde bildirilmedi' });
    }
    return { parts: [...manifest.revizeParts], via: 'manifest', excluded };
  }
  return { parts, via: 'discovery', excluded };
}

/** Command JSON. `eski_command_53k.json` bu desene UYMAZ (mamilas_command ile bitmiyor). */
export function pickCommandSource(files, manifest) {
  if (manifest?.command) return { file: manifest.command };
  const c = files.filter((f) => /_?mamilas_command\.json$/.test(foldTr(f)));
  if (c.length === 0) return { file: null, error: 'COMMAND_MISSING' };
  if (c.length > 1) return { file: null, error: 'COMMAND_AMBIGUOUS', candidates: [...c].sort() };
  return { file: c[0] };
}

/**
 * `--check`'in STALE_N ölçümü için: diskte revize/prompt/command adayı sayılabilecek
 * her dosya. Kayıtlı `sources` ∪ `excluded` bunu kapsamıyorsa yeni kanıt gelmiş demektir.
 */
export function candidateSourceNames(files) {
  const out = new Set();
  for (const f of files) {
    const n = foldTr(f);
    if (/_promptlar\.(txt|md)$/.test(n)) out.add(f);
    else if (TXT_MD.test(n) && REVIZE_TOKEN.test(n)) out.add(f);
    else if (/_?mamilas_command\.json$/.test(n)) out.add(f);
  }
  return [...out];
}

/** Kare kimliği: "### 33.png (ek)" ve "### 33.png" AYNI karedir. */
export function frameKey(head) {
  const m = String(head).match(/(\d+)\s*\.(png|jpg|jpeg|webp)/i);
  if (m) return m[1];
  return String(head).trim().replace(/\s+/g, ' ');
}

export { REVIZE_DENY_KIT, REVIZE_TOKEN };
