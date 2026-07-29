// MAMILAS HASAT — METADATA (mamilas.harvest.v1)
//
// Neden var: hasat çıktısı bugüne kadar kendi KAYNAĞINI kaydetmiyordu. Kaynak revize dosyası
// değişse rapor eskiyordu ve kimse bilemiyordu; `--check` de bilemiyordu çünkü yalnız dosya
// VARLIĞINA bakıyordu. "Hasat edildi" damgası kalıcı ve sorgulanamazdı.
//
// Blok markdown'ın EN ÜSTÜNE HTML yorumu olarak yazılır: insan okurken görünmez,
// makine kesin çıpayla bulur.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const SCHEMA = 'mamilas.harvest.v1';
const OPEN = `<!-- ${SCHEMA}`;
const CLOSE = '-->';

/**
 * Dosya hash'i BAYT üzerinden — satır sonuna göre DEĞİL.
 * (agentsSync kusuru: satır sonuna göre hash'lemek CRLF'te sessizce başka sonuç veriyordu.)
 */
export function sha256File(p) {
  return createHash('sha256').update(readFileSync(p)).digest('hex');
}

export function sha256Text(s) {
  return createHash('sha256').update(Buffer.from(String(s), 'utf8')).digest('hex');
}

/**
 * Proje kimliği: NFC klasör adının hash'i. SLUG DEĞİL — slug ÇAKIŞIYOR (ölçüldü):
 * slugify('6. Sınıf Kuvvetlerin Güç Birliği') === slugify('6. Sınıf - Kuvvetlerin Güç Birliği').
 * Klasör yeniden adlandırılınca eski hasat yeni klasörünmüş gibi görünüyordu.
 */
export function projectId(dirName) {
  return createHash('sha256')
    .update(Buffer.from(String(dirName).normalize('NFC'), 'utf8'))
    .digest('hex')
    .slice(0, 16);
}

/** Metadata bloğunu markdown metnine dönüştürür (blok + boş satır). */
export function renderMeta(meta) {
  return `${OPEN}\n${JSON.stringify(meta, null, 2)}\n${CLOSE}\n\n`;
}

/**
 * Metadata bloğunu okur. Yoksa/parse edilemiyorsa `null` — çağıran bunu LEGACY sayar.
 * ÖLÇEMEDİ ≠ TEMİZ: null sessizce "iyi" anlamına gelmez.
 */
export function parseMeta(text) {
  const t = String(text).replace(/\r\n/g, '\n');
  if (!t.startsWith(OPEN)) return null;
  const end = t.indexOf(`\n${CLOSE}`);
  if (end < 0) return null;
  const json = t.slice(OPEN.length, end);
  try {
    const o = JSON.parse(json);
    return o && o.schema === SCHEMA ? o : null;
  } catch {
    return null;
  }
}

/** Boş ama ŞEMASI TAM iskelet — "bilinmeyen null", alan hiç yok değil. */
export function emptyMeta() {
  return {
    schema: SCHEMA,
    parserVersion: null,
    promptLintVersion: null,
    harvestedAt: null,
    project: { dir: null, id: null },
    sources: { prompt: [], revize: [], command: null, manifest: null },
    excluded: [],
    metrics: {
      frameTotal: null,
      frameTotalSource: null,
      revisedBlocks: 0,
      revisedUniqueFrames: 0,
      cleanDeclared: null,
      revizeRatio: null,
      multiRound: null,
    },
    status: 'OK',
    errors: [],
  };
}

/** Hata kodu → insan cümlesi. Kod makineye, cümle Mami'ye. */
export const ERROR_TEXT = {
  PROMPT_MISSING: 'Final `_PROMPTLAR` dosyası yok — bu projenin yapısı ölçülemedi',
  PROMPT_AMBIGUOUS: 'Birden çok aday final prompt dosyası var; hangisi final belli değil',
  REVIZE_NONE: 'Revize dosyası bulunamadı (bilgi — hata değil)',
  COMMAND_MISSING: 'Command JSON yok — hangi dünyanın sınandığı bilinmiyor',
  COMMAND_AMBIGUOUS: 'Birden çok command JSON var; hangisi geçerli belli değil',
  FRAME_UNIVERSE_MISMATCH: 'Benzersiz revize karesi sayısı prompt kare sayısını aşıyor',
  RATIO_UNCOMPUTABLE: 'Kare evreni bilinmiyor — revize oranı hesaplanamaz',
  SLUG_COLLISION: 'Aynı slug, farklı proje kimliği — hasat dosyası ezilmedi',
  MANIFEST_BROKEN: 'HASAT.json var olmayan dosya bildiriyor',
};
